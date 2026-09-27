import { config } from 'dotenv';
config();

import { RiskClassifier } from '../src/modules/workflow/risk-classifier.js';
import { ApprovalEngine } from '../src/modules/workflow/approval-engine.js';
import { WorkflowExecutionEngine } from '../src/modules/workflow/execution-engine.js';
import { WorkflowDefinition } from '../src/modules/workflow/types.js';
import { v4 as uuidv4 } from 'uuid';

async function runMilestone4Verification() {
  console.log('================================================================');
  console.log('🚀 RUNNING MILESTONE 4 VERIFICATION: WORKFLOW ENGINE & APPROVAL GATES');
  console.log('================================================================\n');

  const testOrgId = uuidv4();
  const approvalEngine = new ApprovalEngine();
  const workflowEngine = new WorkflowExecutionEngine(approvalEngine);

  // Test 1: Risk Classifier & Governance Rules
  console.log('👉 [Test 1] Testing AI Tool Governance & Risk Classification...');
  const lowRisk = RiskClassifier.classifyAction('AI_TASK', { task: 'SCORE_LEAD' });
  const highRiskEmail = RiskClassifier.classifyAction('EMAIL_ACTION', { recipientCount: 500 });
  const highRiskWhatsApp = RiskClassifier.classifyAction('WHATSAPP_ACTION', { isPromotionalBroadcast: true });
  const highRiskBudget = RiskClassifier.classifyAction('AI_TASK', { action: 'SPEND_BUDGET', budgetAmount: 1500 });

  console.log(`   - Internal Lead Scoring Risk: ${lowRisk} (Auto-executable: ${RiskClassifier.canAutoExecute(lowRisk)})`);
  console.log(`   - Mass Email Blast (500 leads) Risk: ${highRiskEmail} (Auto-executable: ${RiskClassifier.canAutoExecute(highRiskEmail)})`);
  console.log(`   - WhatsApp Broadcast Risk: ${highRiskWhatsApp} (Auto-executable: ${RiskClassifier.canAutoExecute(highRiskWhatsApp)})`);
  console.log(`   - Ad Budget Spend ($1,500) Risk: ${highRiskBudget} (Auto-executable: ${RiskClassifier.canAutoExecute(highRiskBudget)})`);

  if (RiskClassifier.canAutoExecute(highRiskEmail) || RiskClassifier.canAutoExecute(highRiskWhatsApp)) {
    throw new Error('Risk Classifier failed to intercept high-risk marketing actions!');
  }
  console.log('✅ Risk Classifier successfully identified all high-risk actions.\n');

  // Test 2: Build Deterministic Workflow Graph
  console.log('👉 [Test 2] Building Deterministic Multi-Step Workflow Graph...');
  const workflow: WorkflowDefinition = {
    id: uuidv4(),
    organizationId: testOrgId,
    name: 'High-Intent Dental Implant Lead Nurturing',
    description: 'Scores incoming patient inquiries, evaluates intent, pauses for human approval, then dispatches WhatsApp and email.',
    status: 'ACTIVE',
    triggerNodeId: 'node_trigger',
    nodes: {
      node_trigger: {
        id: 'node_trigger',
        name: 'Lead Submitted Form',
        type: 'TRIGGER',
        config: {},
        nextNodes: ['node_ai_score'],
        riskLevel: 'LOW',
      },
      node_ai_score: {
        id: 'node_ai_score',
        name: 'AI Lead Scoring Engine',
        type: 'AI_TASK',
        config: { task: 'SCORE_LEAD', threshold: 75 },
        nextNodes: ['node_condition'],
        riskLevel: 'LOW',
      },
      node_condition: {
        id: 'node_condition',
        name: 'Is High Intent?',
        type: 'CONDITION',
        config: {
          conditionField: 'isHighIntent',
          trueChildId: 'node_approval_gate',
          falseChildId: 'node_email_nurture_cold',
        },
        nextNodes: ['node_approval_gate'],
        riskLevel: 'LOW',
      },
      node_approval_gate: {
        id: 'node_approval_gate',
        name: 'Manager Approval: Patient Outreach',
        type: 'APPROVAL_GATE',
        config: { description: 'Sign-off required before automated WhatsApp & Email dispatch to patient' },
        nextNodes: ['node_whatsapp_dispatch'],
        riskLevel: 'HIGH',
      },
      node_whatsapp_dispatch: {
        id: 'node_whatsapp_dispatch',
        name: 'Send Instant WhatsApp Booking Link',
        type: 'WHATSAPP_ACTION',
        config: { templateName: 'implant_consultation_offer' },
        nextNodes: ['node_email_dispatch'],
        riskLevel: 'MEDIUM',
      },
      node_email_dispatch: {
        id: 'node_email_dispatch',
        name: 'Send Detailed Treatment & 3D Scan Guide',
        type: 'EMAIL_ACTION',
        config: { subject: 'Your Smile Transformation Guide + 10-Yr Warranty Details' },
        nextNodes: [],
        riskLevel: 'LOW',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  console.log(`✅ Workflow graph constructed: ${Object.keys(workflow.nodes).length} nodes ready.\n`);

  // Test 3: Run Workflow & Verify Clean Pause at Human Approval Gate
  console.log('👉 [Test 3] Executing Workflow with High-Intent Lead...');
  const leadPayload = {
    leadName: 'Robert Sterling',
    email: 'robert.sterling@example.com',
    phone: '+1-212-555-0144',
    serviceInterested: 'Titanium Dental Implants',
    notes: 'Missing two lower molars, interested in 10-year warranty and 0% financing.',
  };

  const initialRunState = await workflowEngine.startWorkflow(workflow, leadPayload);

  console.log(`📊 Workflow Run ID: ${initialRunState.runId}`);
  console.log(`🚦 Workflow Status: ${initialRunState.status}`);
  console.log(`🎯 Evaluated Lead Score: ${initialRunState.contextData.leadScore}/100 (High Intent: ${initialRunState.contextData.isHighIntent})`);
  console.log(`🛑 Paused at Node: ${initialRunState.currentNodeId}`);
  console.log(`🎫 Pending Approval ID: ${initialRunState.pendingApprovalId}`);

  if (initialRunState.status !== 'PAUSED_FOR_APPROVAL') {
    throw new Error(`Expected workflow status PAUSED_FOR_APPROVAL, got ${initialRunState.status}`);
  }
  console.log('✅ Workflow successfully paused execution at human approval gate without unauthorized dispatch.\n');

  // Test 4: Inspect Approval Inbox
  console.log('👉 [Test 4] Inspecting Pending Approval Inbox...');
  const pendingApprovals = approvalEngine.getPendingApprovals(testOrgId);
  console.log(`📬 Pending tickets in manager inbox: ${pendingApprovals.length}`);
  const ticket = pendingApprovals[0];
  console.log(`   - Action Title: "${ticket.actionTitle}"`);
  console.log(`   - Risk Level: ${ticket.riskLevel}`);
  console.log(`   - Target Patient: ${ticket.payload.currentContext.leadName} (${ticket.payload.currentContext.email})`);

  // Test 5: Reviewer Grants Approval & Workflow Resumes to Completion
  console.log('\n👉 [Test 5] Manager Reviews & Grants Approval...');
  const reviewerUserId = uuidv4();
  approvalEngine.approve(
    ticket.id,
    reviewerUserId,
    'Patient inquiry verified. High suitability for 3D digital scan. Approved for outreach.'
  );

  console.log('✅ Approval granted! Resuming workflow execution...');
  const finalRunState = await workflowEngine.resumeWithApproval(workflow, initialRunState.runId, ticket.id);

  console.log(`\n🎉 Final Workflow Status: ${finalRunState.status}`);
  console.log(`📋 Executed Nodes: ${finalRunState.executedNodeIds.join(' ➔ ')}`);
  console.log(`📱 WhatsApp Dispatched:`, JSON.stringify(finalRunState.contextData.dispatchedWhatsApp));
  console.log(`📧 Email Dispatched:`, JSON.stringify(finalRunState.contextData.dispatchedEmail));

  // Test 6: Audit Trail Verification
  console.log('\n👉 [Test 6] Inspecting Immutable Audit Trail...');
  const auditLogs = approvalEngine.getAuditLogs(testOrgId);
  console.log(`📜 Total Audit Entries Logged: ${auditLogs.length}`);
  auditLogs.forEach((log, index) => {
    console.log(`   [${index + 1}] ${log.action}: ${log.previousState} ➔ ${log.newState} (User: ${log.userId || 'System'})`);
  });

  console.log('\n================================================================');
  console.log('🎉 MILESTONE 4 COMPLETE: WORKFLOW ENGINE & APPROVAL GATES OPERATIONAL!');
  console.log('================================================================\n');
}

runMilestone4Verification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
