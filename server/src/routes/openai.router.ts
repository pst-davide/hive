import { Router } from 'express';
import {analyzeTextController, chatController} from '../controllers/openai.controller';

const openAiRouter: Router = Router();

openAiRouter.post('/analyze', analyzeTextController);
openAiRouter.post('/chat', chatController);

export default openAiRouter;
