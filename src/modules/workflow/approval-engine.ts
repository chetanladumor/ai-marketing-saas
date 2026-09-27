import { ApprovalRequest, ApprovalStatus, AuditLogEntry, RiskLevel } from './types.js';
import { v4 as uuidv4 } from 'uuid';

export class ApprovalEngine {
  private approvals: Map<string, ApprovalRequest> = new Map();
  private auditLogs: AuditLogEntry[] = [];

  /**
   * Creates a formal approval ticket when a workflow hits a high-risk or human-in-the-loop gate
   */
  createApprovalRequest(
    organizationId: string,
    workflowRunId: string,
    nodeId: string,
    actionTitle: string,
    actionDescription: string,
    riskLevel: RiskLevel,
    payload: Record<string, any>
  ): ApprovalRequest {
    const id = uuidv4();
    const request: ApprovalRequest = {
      id,
      organizationId,
      workflowRunId,
      nodeId,
      actionTitle,
      actionDescription,
      riskLevel,
      status: 'PENDING_APPROVAL',
      payload,
      requestedAt: new Date().toISOString(),
    };

    this.approvals.set(id, request);

    this.logAudit({
      organizationId,
      entityType: 'APPROVAL',
      entityId: id,
      action: 'APPROVAL_REQUESTED',
      previousState: 'DRAFT',
      newState: 'PENDING_APPROVAL',
      details: { actionTitle, riskLevel, workflowRunId },
    });

    return request;
  }

  /**
   * Approves a pending request by an authorized user
   */
  approve(approvalId: string, reviewedBy: string, reviewNotes?: string): ApprovalRequest {
    const request = this.approvals.get(approvalId);
    if (!request) {
      throw new Error(`Approval request ${approvalId} not found.`);
    }

    if (request.status !== 'PENDING_APPROVAL') {
      throw new Error(`Cannot approve request in status ${request.status}.`);
    }

    request.status = 'APPROVED';
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = reviewedBy;
    request.reviewNotes = reviewNotes;

    this.logAudit({
      organizationId: request.organizationId,
      userId: reviewedBy,
      entityType: 'APPROVAL',
      entityId: approvalId,
      action: 'APPROVAL_GRANTED',
      previousState: 'PENDING_APPROVAL',
      newState: 'APPROVED',
      details: { reviewNotes },
    });

    return request;
  }

  /**
   * Rejects a pending request
   */
  reject(approvalId: string, reviewedBy: string, reason: string): ApprovalRequest {
    const request = this.approvals.get(approvalId);
    if (!request) {
      throw new Error(`Approval request ${approvalId} not found.`);
    }

    request.status = 'REJECTED';
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = reviewedBy;
    request.reviewNotes = reason;

    this.logAudit({
      organizationId: request.organizationId,
      userId: reviewedBy,
      entityType: 'APPROVAL',
      entityId: approvalId,
      action: 'APPROVAL_REJECTED',
      previousState: 'PENDING_APPROVAL',
      newState: 'REJECTED',
      details: { reason },
    });

    return request;
  }

  getApproval(approvalId: string): ApprovalRequest | undefined {
    return this.approvals.get(approvalId);
  }

  getPendingApprovals(organizationId: string): ApprovalRequest[] {
    return Array.from(this.approvals.values()).filter(
      (a) => a.organizationId === organizationId && a.status === 'PENDING_APPROVAL'
    );
  }

  private logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const log: AuditLogEntry = {
      ...entry,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.push(log);
  }

  getAuditLogs(organizationId: string): AuditLogEntry[] {
    return this.auditLogs.filter((log) => log.organizationId === organizationId);
  }
}
