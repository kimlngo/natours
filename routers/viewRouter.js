const express = require('express');
const viewsCtrl = require('./../controllers/viewsController');
const authCtrl = require('./../controllers/authController');
const router = express.Router();

router.get('/', authCtrl.isLoggedIn, viewsCtrl.getOverview);
router.get('/tour/:slug', authCtrl.isLoggedIn, viewsCtrl.getTourDetail);
router.get('/login', authCtrl.isLoggedIn, viewsCtrl.getLoginForm);
router.get('/me', authCtrl.protect, viewsCtrl.getAccount);

router.post('/submit-user-data', authCtrl.protect, viewsCtrl.updateUserData);
module.exports = router;
