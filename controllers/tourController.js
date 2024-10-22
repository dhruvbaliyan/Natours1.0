const Tour = require('../models/tourModel')
const APIfeatures= require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
// const sharp = require('sharp');
//  JSON.parse is used to convert a JSON string into a corresponding JavaScript object. 
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = async (req, res, next) => {
  try {
    if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
  } catch (err) {
    console.log(err);
    
  }
};



exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};


exports.getAllTours = async (req, res) => {

  try {
    // 1) Filtering 

    // Destructuring of JavaScript
    // const queryObj = {...req.query};
    // const excludeFields = ['page','sort','limit','fields'];
    // excludeFields.forEach(el => delete queryObj[el])

    // 2) Advanced Filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g , match=>`$${match}`);
    
    // let query = Tour.find(JSON.parse(queryStr));

    // Chaining the Find Data
    // 3) Result Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('-createdAt');
    // }

    // 4) Field Limiting
    // if(req.query.fields){
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // }else{
    //   query = query.select('-__v');
    // }

    // 5) Pagination
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = ( page - 1 ) * limit;
    // // page-2 & limit-10 [1-10 page-1] [11-20 page2] [21-30 page3]
    // query = query.skip(skip).limit(limit);

    // if(req.query.page){
    //   const numTours = await Tour.countDocuments();
    //   if(skip >= numTours) throw new Error('Page Does not Exist');
    // }


    
    console.log(req.query);

    const features = new APIfeatures(Tour.find() , req.query)
    .filter()
    .sort()
    .fieldLimiting()
    .pagination()
    const newTour = await features.query;

    res.status(200).json({
      status: 'success',
      length: newTour.length,
      data: {
        newTour
      }
    });
  } catch (err) {
    // console.log(err);
    res.status(400).json({
      status:'error comming',
      message:err
    })
  }
};

// 
exports.getTour = factory.getOne(Tour,{path:'reviews'});
// exports.getTour = async (req, res,next) => {
  
//   try {

//     // Populate --> for Data
//     const newTour = await Tour.findById(req.params.id).populate('reviews');

//     if(!newTour){
//       return next(new AppError("No Tour found with that id" , 404));
//     }
    
//     res.status(200).json({
//       status: 'success',
//       data:newTour
//     })
  
//   } catch (err) {
//     // console.log(err);
//     res.status(400).json({
//       statusbar:"Error ",
//       error:err
//     })
//   }
// };

// Write in MongoDB


exports.createTour = factory.createOne(Tour);
// exports.createTour = async (req, res) => {

//       try{
//         const newTour = await Tour.create(req.body);
  
//         res.status(201).json({
//           status: 'success',
//           data: {
//             tour: newTour
//           }
//         });
//       }catch(err){
//         // console.log(err);
//         res.status(400).json({
//           status: 'error',
//           message:err
//         })
//       }  
// };

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = async(req, res) => {
//   try {
//     // const newTour = await Tour.deleteOne({_id:req.body});
//     const newTour = await Tour.findByIdAndDelete(req.params.id);
//     res.status(200).json({
//       status: 'success',
//       message: newTour
//     })
//   } catch (err) {
//     res.status(400).json({
//       status:"error"
//     })
//   }
// };


exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = async (req, res) => {
  
//   try {
//       const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new:true
//       })
//       res.status(200).json({
//         status: 'successs',
//         message: newTour
//       })  
//   } catch (err) {
//     res.status(400).json({
//       status: 'error',
//       message: err
//     });
//   }
// };
// Aggregation Pipeline

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    // console.log(err);
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getMonthlyPlan = async(req,res)=>{
  try{
    const year = req.params.year*1;
    
    const plan = await Tour.aggregate([
      {
        $unwind:'$startDates'
      },
      {
        $match:{
          startDates:{
            $gte:new Date(`${year}-01-01`),
            $lte:new Date(`${year}-01-01`)
          }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        length: plan.length,
        plan
      }
    })
  }catch(err){
    res.status(400).json({
      status: 'error',
      message:err.message
    })
  }
}


//Sending Model to a handler Factory

exports.getToursWithin = async(req,res,next) =>{
  try {
    const {dist , latlng , unit} = req.params; 
  const [lat , lng] = latlng.split(',');
  const radius = unit === 'm' ? distance / 1000 : distance;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitute and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tour = await Tour.find(
    {startLocation: {
       $geoWithin: { $centerSphere: [[lng, lat], radius] } 
      }
    })
  
  
    res.status(200).json({
    status: 'success'
  })
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message:err.message
    })
  }
}