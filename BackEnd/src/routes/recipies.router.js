import express from 'express'
import recipiesController from '../controllers/recipies.controller.js'
import { authToken, adminOnly } from '../../utils.js';
import { uploader } from '../middleware/multer.js';

const router = express.Router();

router.post('/', authToken, uploader.single('image'), recipiesController.createRecipie);
router.get('/', recipiesController.getRecipies);
router.get('/:rid', recipiesController.getRecipie);
router.put('/:rid', authToken, recipiesController.updateRecipie);
router.post('/:rid/rate', authToken, recipiesController.rateRecipie);
router.get('/:rid/ratings', recipiesController.getApprovedRatings);


export default router