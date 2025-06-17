import { Router } from 'express';
import { InbondCalls, OutbondCalls } from '../controllers/callreport.controller';

const zoomRouter = Router();

zoomRouter.get('/outbond-calls', OutbondCalls)
zoomRouter.get('/inbond-calls', InbondCalls)

export default zoomRouter;