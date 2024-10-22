const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model =>async (req, res, next) => {
      try {
        const doc = await Model.findByIdAndDelete(req.params.id);
  
        if (!doc)     return next(new AppError('No document found with that ID', 404));
      
  
      res.status(204).json({
        status: 'success',
        data: null
      });
      } catch (err) {
        res.status(400).json({
            status:"error"
          })
      }
    };

exports.updateOne = Model =>async (req, res,next) => {
  
    try {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
          new:true,
          runValidators: true
        })
        if(!doc)    return next(new AppError('No document Found with that ID',404));
        res.status(200).json({
          status: 'successs',
          data: doc
        })  
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err
      })
    }
  };

exports.createOne = Model =>async (req,res,next) =>{
    try{
        const doc = await Model.create(req.body);
        if(!doc) return next(new AppError('No document Found with that ID',404));

        res.status(201).json({
          status: 'success',
          data: doc
        });
      }catch(err){
        res.status(400).json({
          status: 'error',
          message:err
        })
      }  
};

exports.getOne = (Model,popOptions) =>async (req, res,next) => {
  
    try {
  
      // Populate --> for Data
      let query = Model.findById(req.params.id);
      if(popOptions)
        query = query.populate(popOptions);

      const doc= await query;
      
  
      if(!doc){
        return next(new AppError("No Tour found with that id" , 404));
      }
      
      res.status(200).json({
        status: 'success',
        data:doc
      })
    
    } catch (err) {
        // console.log(err);
        
      res.status(400).json({
        statusbar:"Error ",
        error:err
      })
    }
  };


  