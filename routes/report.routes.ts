import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { AgentPerfomanceController, TimeCardController } from '../controllers/agent.controller';

const reportRouter = Router();

reportRouter.post('/agent-perfomance', authenticate, AgentPerfomanceController);
reportRouter.post('/time-card', authenticate, TimeCardController);

export default reportRouter;