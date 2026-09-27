import { z } from 'zod';

export type WorkflowStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'PAUSED_FOR_APPROVAL'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type ApprovalStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type WorkflowNodeType =
  | 'TRIGGER'
  | 'AI_TASK'
  | 'CONDITION'
  | 'DELAY'
  | 'APPROVAL_GATE'
  | 'EMAIL_ACTION'
  | 'SOCIAL_ACTION'
  | 'WHATSAPP_ACTION'
  | 'WEBHOOK_ACTION';

export interface WorkflowNode {
  id: string;
  name: string;
  type: WorkflowNodeType;
  config: Record<string, any>;
  nextNodes: string[]; // IDs of child nodes
  riskLevel: RiskLevel;
}

export interface WorkflowDefinition {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  triggerNodeId: string;
  nodes: Record<string, WorkflowNode>;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalRequest {
  id: string;
  organizationId: string;
  workflowRunId: string;
  nodeId: string;
  actionTitle: string;
  actionDescription: string;
  riskLevel: RiskLevel;
  status: ApprovalStatus;
  payload: Record<string, any>;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface AuditLogEntry {
  id: string;
  organizationId: string;
  userId?: string;
  entityType: 'WORKFLOW' | 'APPROVAL' | 'AI_ACTION' | 'CAMPAIGN';
  entityId: string;
  action: string;
  previousState?: string;
  newState: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface WorkflowRunState {
  runId: string;
  workflowId: string;
  organizationId: string;
  status: WorkflowStatus;
  currentNodeId: string;
  contextData: Record<string, any>;
  executedNodeIds: string[];
  pendingApprovalId?: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
}
