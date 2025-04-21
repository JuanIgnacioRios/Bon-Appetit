import { authToken } from '../../utils.js';
import favouritesController from '../controllers/favourites.controller.js'
import express from 'express'

const router = express.Router();

router.post('/:rid/', authToken, favouritesController.addFavouriteRecipie)
router.get('/', authToken, favouritesController.getFavouriteRecipies)
router.delete('/:rid', authToken, favouritesController.deleteFavouriteRecipie)

export default router