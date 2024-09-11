const express = require('express');
const userCtrl = require('./../controllers/userController');
const authCtrl = require('./../controllers/authController');
const router = express.Router();

router.post('/signup', authCtrl.signUp);
router.post('/login', authCtrl.login);

router.post('/forgotPassword', authCtrl.forgotPassword);
router.patch('/resetPassword/:token', authCtrl.resetPassword);

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
