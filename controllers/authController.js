const {promisify} = require('util')
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError =require('../utils/appError')
const bcrypt = require('bcrypt');
const { response } = require('express');
const Email = require('./../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  };
  
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
    //   httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  
    res.cookie('jwt', token, cookieOptions);
  
    // Remove password from output
    user.password = undefined;
  
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
};

exports.signup = async(req,res,next)=>{
    
    try{
        const newUser = await User.create({
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            confirmPassword:req.body.confirmPassword,
            passwordChangedAt:req.body.passwordChangedAt
        });

        const url = `${req.protocol}://${req.get('host')}/me`;
        console.log(url);
        await new Email(newUser, url).sendWelcome();

        // JWT
        createSendToken(newUser, 201, res);
        
        
    }catch(err){
        res.status(500).json({
            status:'error ' ,
            err:err.message
        })
    }
}

exports.login= async (req,res,next)=>{
    // 1 if email and password exist
    // 2 check if user already exist and password is correct
    // if everything OK send JSON-Web-Token

    try {
        const {email , password } =req.body;
        if(!email || !password)
            return next(new AppError("Email or Password not defined",401));
        
        const user = await User.findOne({email}).select('+password');
       
        if(!user || !(await user.correctPassword(password, user.password))){
            return next(new AppError("Either Email or Password is incorrect",401));
        }
        createSendToken(user, 200, res);

        
    } catch (err) {
        // console.log(err);
        res.status(500).json({
            status:'error',
            err:err.message
        })
    }
}

exports.logout  = (req,res)=>{
    // Logging Out by overwriting the cookies
    // console.log("Logging out....");
    
    res.cookie('jwt','LoggedOut',{
        expires:new Date(
            Date.now() + 10 * 1000
        ),
        httpOnly: true
    })
    res.status(200).json({ status: 'success' });
}

// To Protect all those routes i.e without sign-in user cant access get all Tours
exports.protect = async(req,res,next)=>{
    try {
        // 1 checking token and if it exist
        // 2 validate token
        // 3 check if user still exists
        // 4 check if user change  password after token was issued
        // 5 grant access to protected route
        let token;
        
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
             token = req.headers.authorization.split(' ')[1];
        } else{
            token = req.cookies.jwt;
        }
        // console.log(token);
        if(!token){
            return next(new AppError('You are not logged in !plz log in',401));
        }

        const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET_KEY);

        const freshUser= await User.findById(decoded.id);
        
        if(!freshUser) return next(new AppError('The Token No longer Exist',401));

        if(freshUser.changedPasswordAfter(decoded.iat)){
            return next(new AppError('User Password Changed !',401));
        }

        req.user = freshUser;
        res.locals.user = freshUser; 
        next();
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status:'error in protect',
            err:err.message
        })
    }

    
}

exports.isLoggedIn = async(req,res,next)=>{
    try {
        // 1 checking token and if it exist
        // 2 validate token
        // 3 check if user still exists
        // 4 check if user change  password after token was issued
        // 5 grant access to protected route
        if(req.cookies.jwt && req.cookies.jwt !== 'LoggedOut'){
        const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET_KEY);

        const freshUser= await User.findById(decoded.id);
        
        if(!freshUser) return next();

        if(freshUser.changedPasswordAfter(decoded.iat)) return next();

        // Sending freshUser to view template
        res.locals.user = freshUser;
        return next();
    }else next();
    } catch (err) {
        next();
    }
    // next();
}

exports.restrictTo = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new AppError("You Dont Have Authority "),403);
        }
        next();
        
    }
}

exports.forgotPassword = async(req,res,next)=>{
    // 1 Get user based on posted email i.e. find email address;
    // 2 genrate token 
    // 3 send it as an email

   try {
    const {email }= req.body;
    // console.log(email);
    const user = await User.findOne({email});
    if(!user) return next(new AppError("User does not exist",404));


    const resetToken = user.ForgotPasswordToken();
    await user.save({validateBeforeSave: false });

    const resetUrl = `${req.protocol}://
                      ${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

    const message = `Forgot Your Password ! Plz Click here to Reset ${resetUrl}`;
    const subject = 'Password Patch Request (valid for 10 mins)';
    try {
        var mailOptions = {
            email: user.email,
            subject,
            message
        }
        await new Email(user, resetURL).sendPasswordReset();
        res.status(200).json({
            status:'success',
            resetToken
        })    
    } catch (err) {
        console.log(err);
        user.passwordResetToken = undefined;
        user.passwordResetExpiresIn = undefined;
        await user.save({validateBeforeSave: false });
        res.status(500).json({
            status:'error in line 162' ,
            err:err.message
        })

    }




   } catch (err) {
    // console.log(err);
    res.status(500).json({
        status:'error in line 174' ,
        err:err.message
    })
   }
}

exports.resetPassword = async(req,res,next)=>{
    // 1 Get User based on Token
    // 2 If Token not Expired === User is Present && set New Password
    // 3 update ChangedPasswordAt from user
    // 4 Log in User using JWT

   try {
    const hashedToken = crypto.createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    const user = await User.findOne({passwordResetToken :hashedToken,
                                    passwordResetExpiresIn : { $gt : Date.now() }});

    if(!user)   return next(new AppError('Invalid Token',400));

    user.password = req.body.password;
    user.confirmPassword =  req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiresIn = undefined;
    await user.save();


    // JWT
    createSendToken(user, 200, res);

   } catch (err) {
    console.log(err);
    res.status(500).json({
        status: 'error in 221',
        message: err.message
    })
   }
}

exports.updatePassword = async (req,res)=>{
    // 1. Get User from the Collection 
    // 2. Check if current password === password given
    // 3. update Password 
    // 4. Log in JWT
    
    try {
        const user = await User.findById(req.user.id).select('+password');

        if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
            return res.status(400).json({
                status: 'fail',
                message: 'Your current password is incorrect.'
            });
        }

        user.password = req.body.password;
        user.confirmPassword = req.body.passwordConfirm;

        await user.save();

        createSendToken(user, 200, res);
        

    } catch (err) {
        console.log(err);
        console.log(err.response.data);  
        res.status(500).json({
            status:'error in 256',
            message: err.message
        })
    }

    


}