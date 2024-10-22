const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.get('/logout',authController.logout);

router.post('/forgot-password',authController.forgotPassword);
router.patch('/reset-password/:token',authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);
router.patch('/update-password',authController.updatePassword);
router.patch('/update-MyProfile',userController.uploadUserphotos, userController.resizeUserPhoto, userController.updateMe);
router.delete('/delete-MyProfile',userController.deleteMe);
router.get('/me', userController.getMe, userController.getUser);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  //.post(userController.createUser);


router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);


  // Issue Resolutiion at Last

module.exports = router;
