import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { AbandonedCallsController, fetchAgentQueueController, getDailyQueueController, getIntervalQueueController } from '../controllers/agent-queue.controller';

const agentQueueRouter = Router();

agentQueueRouter.post('/all', authenticate, fetchAgentQueueController);
agentQueueRouter.post('/daily', authenticate, getDailyQueueController);
agentQueueRouter.post('/interval', authenticate, getIntervalQueueController);
agentQueueRouter.post('/abandoned-calls', authenticate, AbandonedCallsController);

export default agentQueueRouter;