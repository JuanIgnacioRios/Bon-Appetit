import ingredientsController from '../controllers/ingredients.controller.js'
import { adminOnly } from '../../utils.js';
import express from 'express'

const router = express.Router();

router.get('/', ingredientsController.getIngredients);
router.post('/', adminOnly, ingredientsController.createIngredient);
router.put('/:cid', adminOnly, ingredientsController.updateIngredient);
router.delete('/:cid', adminOnly, ingredientsController.deleteIngredient)

export default router