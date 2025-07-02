import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { fetchFlowDataController, getFlowIntervalController } from '../controllers/agent-vdn.controller';

const agentVDNRouter = Router();

agentVDNRouter.post('/all', authenticate, fetchFlowDataController);
agentVDNRouter.post('/interval', authenticate, getFlowIntervalController);

export default agentVDNRouter;