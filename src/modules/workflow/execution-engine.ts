import { ApprovalEngine } from './approval-engine.js';
import { RiskClassifier } from './risk-classifier.js';
import { WorkflowDefinition, WorkflowNode, WorkflowRunState } from './types.js';
import { v4 as uuidv4 } from 'uuid';

export class WorkflowExecutionEngine {
  private activeRuns: Map<string, WorkflowRunState> = new Map();

  constructor(private approvalEngine: ApprovalEngine) {}

  /**
   * Starts a new workflow execution run from its trigger node
   */
  async startWorkflow(
    workflow: WorkflowDefinition,
    initialPayload: Record<string, any>
  ): Promise<WorkflowRunState> {
    const runId = uuidv4();
    const triggerNode = workflow.nodes[workflow.triggerNodeId];

    if (!triggerNode) {
      throw new Error(`Trigger node ${workflow.triggerNodeId} does not exist in workflow ${workflow.id}.`);
    }

    const state: WorkflowRunState = {
      runId,
      workflowId: workflow.id,
      organizationId: workflow.organizationId,
      status: 'RUNNING',
      currentNodeId: triggerNode.id,
      contextData: { ...initialPayload },
      executedNodeIds: [],
      startedAt: new Date().toISOString(),
    };

    this.activeRuns.set(runId, state);
    return this.executeFromNode(workflow, state, triggerNode.id);
  }

  /**
   * Traverses and executes the workflow node graph deterministically
   */
  private async executeFromNode(
    workflow: WorkflowDefinition,
    state: WorkflowRunState,
    nodeId: string
  ): Promise<WorkflowRunState> {
    const node = workflow.nodes[nodeId];
    if (!node) {
      state.status = 'COMPLETED';
      state.completedAt = new Date().toISOString();
      return state;
    }

    state.currentNodeId = nodeId;

    // Check risk level & approval requirements
    const assessedRisk = RiskClassifier.classifyAction(node.type, node.config);

    if (node.type === 'APPROVAL_GATE' || assessedRisk === 'HIGH') {
      // Check if we already have an approved ticket for this node
      let approval = state.pendingApprovalId
        ? this.approvalEngine.getApproval(state.pendingApprovalId)
        : undefined;

      if (!approval || approval.status !== 'APPROVED') {
        // Pause execution and create approval ticket
        const req = this.approvalEngine.createApprovalRequest(
          state.organizationId,
          state.runId,
          node.id,
          node.name,
          node.config.description || `Approval required before executing high-risk action: ${node.name}`,
          assessedRisk,
          { nodeConfig: node.config, currentContext: state.contextData }
        );

        state.status = 'PAUSED_FOR_APPROVAL';
        state.pendingApprovalId = req.id;
        return state;
      }
    }

    // Execute node logic
    await this.processNodeLogic(node, state);
    state.executedNodeIds.push(node.id);

    // Determine next nodes
    if (node.nextNodes && node.nextNodes.length > 0) {
      for (const nextNodeId of node.nextNodes) {
        // Handle conditional branching
        if (node.type === 'CONDITION') {
          const conditionPassed = Boolean(state.contextData[node.config.conditionField]);
          const targetChildId = conditionPassed ? node.config.trueChildId : node.config.falseChildId;
          if (targetChildId) {
            return this.executeFromNode(workflow, state, targetChildId);
          }
        } else {
          return this.executeFromNode(workflow, state, nextNodeId);
        }
      }
    }

    state.status = 'COMPLETED';
    state.completedAt = new Date().toISOString();
    return state;
  }

  /**
   * Resumes a paused workflow once the approval ticket has been approved
   */
  async resumeWithApproval(
    workflow: WorkflowDefinition,
    runId: string,
    approvalId: string
  ): Promise<WorkflowRunState> {
    const state = this.activeRuns.get(runId);
    if (!state) {
      throw new Error(`Workflow run ${runId} not found.`);
    }

    if (state.status !== 'PAUSED_FOR_APPROVAL') {
      throw new Error(`Cannot resume workflow in status ${state.status}.`);
    }

    const approval = this.approvalEngine.getApproval(approvalId);
    if (!approval || approval.status !== 'APPROVED') {
      throw new Error(`Approval ${approvalId} is not in APPROVED state.`);
    }

    state.status = 'RUNNING';
    const currentNode = workflow.nodes[state.currentNodeId];

    // Mark current approval gate node as executed
    state.executedNodeIds.push(currentNode.id);
    state.pendingApprovalId = undefined;

    // Continue to next nodes
    if (currentNode.nextNodes && currentNode.nextNodes.length > 0) {
      return this.executeFromNode(workflow, state, currentNode.nextNodes[0]);
    }

    state.status = 'COMPLETED';
    state.completedAt = new Date().toISOString();
    return state;
  }

  private async processNodeLogic(node: WorkflowNode, state: WorkflowRunState): Promise<void> {
    switch (node.type) {
      case 'TRIGGER':
        // Trigger initialized context
        state.contextData.triggeredAt = new Date().toISOString();
        break;

      case 'AI_TASK':
        // Simulated AI lead scoring or classification
        if (node.config.task === 'SCORE_LEAD') {
          const rawScore = 88; // e.g. Lead submitted high-intent dental implant form
          state.contextData.leadScore = rawScore;
          state.contextData.isHighIntent = rawScore >= (node.config.threshold || 75);
        }
        break;

      case 'CONDITION':
        // Condition evaluates in execution branch router
        break;

      case 'EMAIL_ACTION':
        state.contextData.dispatchedEmail = {
          to: state.contextData.email || 'lead@example.com',
          subject: node.config.subject || 'Your Smile Consultation',
          sentAt: new Date().toISOString(),
        };
        break;

      case 'WHATSAPP_ACTION':
        state.contextData.dispatchedWhatsApp = {
          to: state.contextData.phone || '+1-555-0199',
          message: node.config.templateName || 'appointment_confirmation',
          sentAt: new Date().toISOString(),
        };
        break;

      default:
        break;
    }
  }

  getRunState(runId: string): WorkflowRunState | undefined {
    return this.activeRuns.get(runId);
  }
}
