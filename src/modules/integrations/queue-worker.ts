import { QueueJob, QueueJobStatus } from './types.js';
import { v4 as uuidv4 } from 'uuid';

export type JobProcessor<T = any> = (job: QueueJob<T>) => Promise<any>;

export class BackgroundQueueWorker {
  private jobs: Map<string, QueueJob> = new Map();
  private processors: Map<string, JobProcessor> = new Map();
  private deadLetterQueue: QueueJob[] = [];

  /**
   * Registers a job processor for a specific queue
   */
  registerProcessor<T = any>(queueName: string, processor: JobProcessor<T>): void {
    this.processors.set(queueName, processor);
  }

  /**
   * Pushes a new job into the queue
   */
  async addJob<T = any>(
    queueName: string,
    organizationId: string,
    data: T,
    maxAttempts: number = 3
  ): Promise<QueueJob<T>> {
    const job: QueueJob<T> = {
      id: uuidv4(),
      queueName,
      organizationId,
      data,
      status: 'WAITING',
      attempts: 0,
      maxAttempts,
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(job.id, job);
    // Process immediately in worker loop
    this.processJob(job.id);
    return job;
  }

  /**
   * Processes a job with exponential backoff retry and DLQ routing
   */
  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const processor = this.processors.get(job.queueName);
    if (!processor) {
      job.status = 'FAILED';
      job.error = `No processor registered for queue ${job.queueName}`;
      this.deadLetterQueue.push(job);
      return;
    }

    job.status = 'ACTIVE';
    job.attempts++;
    job.processedAt = new Date().toISOString();

    try {
      await processor(job);
      job.status = 'COMPLETED';
      job.finishedAt = new Date().toISOString();
    } catch (err: any) {
      job.error = err.message || 'Job execution error';

      if (job.attempts < job.maxAttempts) {
        job.status = 'DELAYED';
        const backoffMs = Math.pow(2, job.attempts) * 200; // Fast test-friendly backoff
        setTimeout(() => {
          this.processJob(jobId);
        }, backoffMs);
      } else {
        job.status = 'FAILED';
        job.finishedAt = new Date().toISOString();
        this.deadLetterQueue.push(job); // Move to Dead-Letter Queue
      }
    }
  }

  getJob(jobId: string): QueueJob | undefined {
    return this.jobs.get(jobId);
  }

  getStats(queueName?: string): { waiting: number; active: number; completed: number; failed: number; dlq: number } {
    const all = Array.from(this.jobs.values()).filter((j) => !queueName || j.queueName === queueName);
    return {
      waiting: all.filter((j) => j.status === 'WAITING').length,
      active: all.filter((j) => j.status === 'ACTIVE').length,
      completed: all.filter((j) => j.status === 'COMPLETED').length,
      failed: all.filter((j) => j.status === 'FAILED').length,
      dlq: this.deadLetterQueue.length,
    };
  }

  getDeadLetterQueue(): QueueJob[] {
    return this.deadLetterQueue;
  }
}
