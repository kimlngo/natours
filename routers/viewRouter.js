const express = require('express');
const viewsCtrl = require('./../controllers/viewsController');
const router = express.Router();

router.get('/', viewsCtrl.getOverview);
router.get('/tour/:slug', viewsCtrl.getTourDetail);
router.get('/login', viewsCtrl.getLoginForm);
module.exports = router;
