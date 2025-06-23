import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { AgentReportController, QueueReportController } from '../controllers/agent.controller';

const reportRouter = Router();

reportRouter.post('/agent-history', authenticate, AgentReportController);
reportRouter.post('/agent-queue', authenticate, QueueReportController);

export default reportRouter;