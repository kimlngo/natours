const express = require('express');
const viewsCtrl = require('./../controllers/viewsController');
const router = express.Router();

router.get('/', viewsCtrl.getOverview);
router.get('/tour', viewsCtrl.getTourDetail);

module.exports = router;
