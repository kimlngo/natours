const express = require('express');
const userCtrl = require('./../controllers/userController');
const authCtrl = require('./../controllers/authController');
const { ADMIN } = require('../utils/constant');
const router = express.Router();

router.post('/signup', authCtrl.signUp);
router.post('/login', authCtrl.verifyEmailConfirmation, authCtrl.login);

router.post('/forgotPassword', authCtrl.forgotPassword);
router.patch('/resetPassword/:token', authCtrl.resetPassword);
router.patch('/confirmEmail/:token', authCtrl.confirmEmail);

//protect all routes after this middleware - NICE TRICK
router.use(authCtrl.protect);

router.patch('/updateMyPassword', authCtrl.updatePassword);

router.get('/me', userCtrl.getMe, userCtrl.getUserById);
router.patch('/updateMe', userCtrl.updateMe);
router.delete('/deleteMe', userCtrl.deleteMe);

//restric all routes after this middleware
router.use(authCtrl.restrictTo(ADMIN));
//prettier-ignore
router
  .route('/')
  .get(userCtrl.getAllUsers)
  .post(userCtrl.createNewUser);

router
  .route('/:id')
  .get(userCtrl.getUserById)
  .patch(userCtrl.updateUser)
  .delete(userCtrl.deleteUserById);

module.exports = router;
