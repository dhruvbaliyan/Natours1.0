const User = require('../models/userModel');
const AppError =require('../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp')
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

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

exports.resizeUserPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
  } catch (err) {
    console.log(err);
    
  }
};

exports.uploadUserphotos = upload.single('photo');

exports.resizeUserPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.file.filename}`);
  
    next();
  } catch (err) {
    console.log(err);
    
  }
};


exports.getAllUsers = async (req, res) => {
 try {
  user =await User.find();
  
  res.status(200).json({
    status: 'success',
    results: user.length,
    data: {
      user
    }
  });
 } catch (err) {
  // console.log(err);
  res.status(400).json({
    status:'error',
    err:err.message
  })
 }
};
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User); 
exports.deleteUser = factory.deleteOne(User);

exports.updateMe = async(req,res,next)=>{
  // 1 create error if user post password or confirm password
  // 2 update user doc
  try {
    if(req.body.password || req.body.confirmPassword){
    return next(new AppError('This is not for password UPDATING',));
    }
     // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
   const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });



    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    //console.log(err);
    res.status(400).json({
    status:'error',
    err:err.message
  })
  }
}

exports.deleteMe = async(req,res,next)=>{
 try {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
 } catch (err) {
  res.status(400).json({
    status:'error',
    err:err.message
  })
 }
}


exports.getMe = (req, res, next) => {  
  
    const ide = req.user.id; 
    console.log(ide);
    
  
  
  next();
};