import categoriesController from '../controllers/categories.controller.js'
import { adminOnly } from '../../utils.js';
import express from 'express'

const router = express.Router();

router.get('/', categoriesController.getCategories);


export default router