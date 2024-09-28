const express = require('express');
const viewsCtrl = require('./../controllers/viewsController');
const authCtrl = require('./../controllers/authController');
const router = express.Router();

router.use(authCtrl.isLoggedIn);

router.get('/', viewsCtrl.getOverview);
router.get('/tour/:slug', viewsCtrl.getTourDetail);
router.get('/login', viewsCtrl.getLoginForm);
module.exports = router;
