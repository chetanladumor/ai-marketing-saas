import { MarketingEvent, MarketingEventType } from './types.js';
import { v4 as uuidv4 } from 'uuid';

export type EventHandler<T = any> = (event: MarketingEvent<T>) => Promise<void> | void;

export class MarketingEventBus {
  private handlers: Map<MarketingEventType, Set<EventHandler>> = new Map();
  private eventHistory: MarketingEvent[] = [];

  /**
   * Subscribes a handler to a specific marketing event topic
   */
  subscribe<T = any>(eventType: MarketingEventType, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as EventHandler);
  }

  /**
   * Publishes an event to all subscribers and records to event log
   */
  async publish<T = any>(
    organizationId: string,
    type: MarketingEventType,
    payload: T
  ): Promise<MarketingEvent<T>> {
    const event: MarketingEvent<T> = {
      id: uuidv4(),
      type,
      organizationId,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.eventHistory.push(event);

    const subscribers = this.handlers.get(type);
    if (subscribers && subscribers.size > 0) {
      for (const handler of subscribers) {
        try {
          await handler(event);
        } catch (err) {
          console.error(`Error in event handler for ${type}:`, err);
        }
      }
    }

    return event;
  }

  getRecentEvents(organizationId: string, limit: number = 20): MarketingEvent[] {
    return this.eventHistory
      .filter((e) => e.organizationId === organizationId)
      .slice(-limit);
  }
}
