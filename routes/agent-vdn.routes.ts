import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { getFlowIntervalController, refreshFlowController } from '../controllers/agent-vdn.controller';

const agentVDNRouter = Router();

agentVDNRouter.post('/interval', authenticate, getFlowIntervalController);
agentVDNRouter.post('/refresh', authenticate, refreshFlowController);

export default agentVDNRouter;