const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getAllReviews = async (req,res,next) => {
    try {
        let filter = { };
        if(req.params.tourId) filter = {tour :req.params.tourId};
        
        const review = await Review.find(filter);

        if(!review) {
            return next(new AppError('Review Fetching problem',201));
        }
        res.status(200).json({
            status: 'success',
            length:review.length,
            data:{
                review
            }
          })
        
    } catch (err) {
        //console.log(err);
        res.status(400).json({
        statusbar:"Error ",
        error:err
    })
    }
}


exports.setTourId = (req,res,next)=>{
    if(!req.body.tour) {
        req.body.tour = req.params.tourId;
    }
    if(! req.body.user){
        req.body.user = req.user.id;
    }
    next();
}

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);