import express, {Router} from 'express';
import {PressCategoryController} from "../controllers/press-category.controller";
import {PressKeywordController} from '../controllers/press-keyword.controller';

const pressRouter: Router = express.Router();

pressRouter.get('/press/categories', PressCategoryController.findAll);
pressRouter.get('/press/categories/:id', PressCategoryController.findById);
pressRouter.post('/press/categories', PressCategoryController.create);
pressRouter.put('/press/categories/:id', PressCategoryController.update);
pressRouter.delete('/press/categories/delete/:id', PressCategoryController.delete);

pressRouter.get('/press/keywords', PressKeywordController.findAll);
pressRouter.get('/press/keywords/:id', PressKeywordController.findById);
pressRouter.post('/press/keywords', PressKeywordController.create);
pressRouter.post('/press/keywords/batch', PressKeywordController.createBatch);
pressRouter.put('/press/keywords/:id', PressKeywordController.update);
pressRouter.delete('/press/keywords/:id', PressKeywordController.delete);

export default pressRouter;
