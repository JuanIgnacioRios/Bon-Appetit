import express from 'express';
import usersController from '../controllers/users.controller.js'

const router = express.Router();

router.post('/register', usersController.register)
router.post('/login', usersController.login)
router.post('/send-password-change-verification-code', usersController.sendChangePasswordVerificationCode)
router.post('/verify-password-change-verification-code', usersController.verifyChangePasswordVerificationCode)
router.post('/change-password', usersController.changePassword)
router.get('/:uid', usersController.getUser)
router.post('/guest', usersController.guest)

export default router