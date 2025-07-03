import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { getFlowIntervalController } from '../controllers/agent-vdn.controller';

const agentVDNRouter = Router();

agentVDNRouter.post('/interval', authenticate, getFlowIntervalController);

export default agentVDNRouter;