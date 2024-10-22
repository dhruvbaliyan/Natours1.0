const { response } = require('express');
const Tour= require('../models/tourModel');
const User = require('../models/userModel');
exports.getOverview = async(req,res)=>{
    try {
    // 1 Get Tour data from collection
    // Template put and Render 
    const tours = await Tour.find();
    res.status(200).render('overview',{
        title:"Overview",
        tours
    })
    } catch (err) {
        res.status(404).json({
            status:err,
            message:err.message
        })
    }
  };

exports.getTours= async(req,res)=>{
    try {
        // 1 get Data= tour,lead guides, reviews
        // Template built and render
        const tour = await Tour.findOne({slug:req.params.slug}).populate({
            path:'reviews',
            select:'review rating user'
        })
        
        
        
        res.status(200).render('tour',{
            title:tour.name,
            tour
          })
    } catch (err) {
        res.status(404).json({
            status:err,
            message:err.message
        })
    }
};

exports.login = async(req,res)=>{
    try {
        res.status(200).render('login',{
            title:'Log In to Your Account',

        })
    } catch (err) {
         res.status(404).json({
            status:err,
            message:err.message
        })
    }
}

exports.getAccount = async(req,res)=>{
    res.status(200).render('account',{
        title:'My Profile '
    })
};
exports.updateUserData = async(req,res)=>{
    const user = User.findByIdAndUpdate(req.user.id ,{
        name:req.body.name,
        email:req.body.email 
    },{
        runValidators:true,
        new:true
    } );

    res.status(200).render('account',{
        title:'My Profile ',
        user
    })
}