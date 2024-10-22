const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('./../controllers/authController');
const router = express.Router();

router.get('/me', authController.protect, viewController.getAccount );
router.post('/updateMyProfile', authController.protect, viewController.updateUserData );

router.use(authController.isLoggedIn);
router.get('/',viewController.getOverview);
router.get('/tours/:slug',viewController.getTours);
router.get('/login',viewController.login);


module.exports = router;