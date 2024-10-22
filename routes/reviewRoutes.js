const express = require('express');
const authController = require('./../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router({mergeParams:true});

router.use(authController.protect);
router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(  authController.restrictTo('user'),
            reviewController.setTourId,
            reviewController.createReview   );

router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(reviewController.updateReview,  authController.restrictTo('user', 'admin'),)
    .delete(reviewController.deleteReview, authController.restrictTo('user', 'admin'),);

module.exports = router;