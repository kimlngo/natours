const express = require('express');
const userCtrl = require('./../controllers/userCountroller');
const router = express.Router();

router.route('/').get(userCtrl.getAllUsers).post(userCtrl.createNewUser);

router
  .route('/:id')
  .get(userCtrl.getUserById)
  .patch(userCtrl.updateUser)
  .delete(userCtrl.deleteUserById);

module.exports = router;
