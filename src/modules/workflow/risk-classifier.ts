import { RiskLevel, WorkflowNodeType } from './types.js';

export class RiskClassifier {
  /**
   * Evaluates the risk level of an action based on its type and configuration parameters
   */
  static classifyAction(type: WorkflowNodeType, config: Record<string, any>): RiskLevel {
    // 1. High-risk actions
    if (type === 'WHATSAPP_ACTION' && config.isPromotionalBroadcast) {
      return 'HIGH';
    }

    if (type === 'EMAIL_ACTION') {
      const recipientCount = config.recipientCount || (Array.isArray(config.recipients) ? config.recipients.length : 1);
      if (recipientCount > 50) {
        return 'HIGH'; // Mass email blast
      }
      return 'MEDIUM';
    }

    if (config.action === 'SPEND_BUDGET' || config.budgetAmount > 0) {
      return 'HIGH';
    }

    if (config.action === 'PUBLISH_LIVE_DOMAIN' || config.action === 'DELETE_RESOURCE') {
      return 'HIGH';
    }

    // 2. Medium-risk actions
    if (type === 'SOCIAL_ACTION' && config.autoPublishImmediately) {
      return 'MEDIUM';
    }

    if (type === 'WEBHOOK_ACTION' && config.isExternalPaymentOrCRM) {
      return 'MEDIUM';
    }

    // 3. Low-risk operations (Read-only, drafts, analysis)
    return 'LOW';
  }

  /**
   * Verifies if an action is permitted to execute or if it requires human approval
   */
  static canAutoExecute(riskLevel: RiskLevel): boolean {
    return riskLevel === 'LOW';
  }
}
