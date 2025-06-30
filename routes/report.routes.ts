import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { AgentPerfomanceController, TimeCardController, GroupSummaryController, AgentEngagementController, RefreshAgentPerformanceController, RefreshAgentEngagementController, RefreshGroupSummaryController, RefreshTimeCardController } from '../controllers/agent.controller';

const reportRouter = Router();

reportRouter.post('/agent-perfomance', authenticate, AgentPerfomanceController);
reportRouter.post('/time-card', authenticate, TimeCardController);
reportRouter.post('/group-summary', authenticate, GroupSummaryController);
reportRouter.post('/agent-engagement', authenticate, AgentEngagementController);
reportRouter.post('/refresh/agent-perfomance', authenticate, RefreshAgentPerformanceController);
reportRouter.post('/refresh/time-card', authenticate, RefreshTimeCardController);
reportRouter.post('/refresh/group-summary', authenticate, RefreshGroupSummaryController);
reportRouter.post('/refresh/agent-engagement', authenticate, RefreshAgentEngagementController);

export default reportRouter;