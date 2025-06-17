import { Router } from 'express';
import { InbondCalls, OutbondCalls, RefreshCallLogs, SaveZoomCredentials } from '../controllers/callreport.controller';
import { authenticate } from '../middlewares/auth';

const zoomRouter = Router();

zoomRouter.post('/outbond-calls', authenticate, OutbondCalls);
zoomRouter.post('/inbond-calls', authenticate, InbondCalls);
zoomRouter.post('/save-zoomuser', authenticate, SaveZoomCredentials);
zoomRouter.post('/refresh-call-logs', authenticate, RefreshCallLogs);

export default zoomRouter;