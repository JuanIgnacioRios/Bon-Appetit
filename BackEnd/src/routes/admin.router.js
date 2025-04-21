import express from 'express'
import recipiesController from '../controllers/recipies.controller.js'
import categoriesController from '../controllers/categories.controller.js';
import ingredientsController from '../controllers/ingredients.controller.js';

const router = express.Router()

//Recipies
router.put('/recipies/:rid', recipiesController.verificateRecipie);
router.put('/recipies/:rid/ratings/:ratingId/verify', recipiesController.validateRating);

//Categories
router.post('/categories/', categoriesController.createCategory);
router.put('/categories/:cid', categoriesController.updateCategory);
router.delete('/categories/:cid', categoriesController.deleteCategory)

//Ingredients
router.post('/ingredients/', ingredientsController.createIngredient);
router.put('/ingredients/:cid', ingredientsController.updateIngredient);
router.delete('/ingredients/:cid', ingredientsController.deleteIngredient)



export default router