import {Router} from 'express';
import {cropAndPost} from '../controllers/cropController.js'

const cropRouter = Router();

// POST /api/crop
// Receives focus coordinates, crops image, POSTs to callback URL
cropRouter.post('/', cropAndPost);

export default cropRouter;