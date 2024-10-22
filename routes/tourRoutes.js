const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');
const router = express.Router();


router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
  
router
  .route('/tour-stats')
  .get(tourController.getTourStats)

router
  .route('/monthly-plans/:year')
  .get(tourController.getMonthlyPlan) 

router
  .route('/tours-within/:distance/center/latlng/unit/:unit')
  .get(tourController.getToursWithin)
  // /tours-within/233/center/-40,45/unit/mi





router
  .route('/')
  //first authController.protect middleware will run the other
  .get(authController.protect,tourController.getAllTours) 
  .post(authController.protect,
        authController.restrictTo('admin','lead-guide'),
        tourController.createTour);

router
  .route('/:id')
  .get(authController.protect,tourController.getTour)
  .patch(authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour)
  .delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour);

// router
//   .route('/:tourId/review')
//   .post(authController.protect,
//         authController.restrictTo('user'),
//         reviewController.createReview );
router.use('/:tourId/reviews',reviewRouter);

module.exports = router;
