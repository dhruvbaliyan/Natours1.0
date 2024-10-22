class APIfeatures{
    constructor(query,queryString){
      this.query = query;
      this.queryString = queryString;
    }
  
    filter(){
       // 1) Filtering 
  
      // Destructuring of JavaScript
      const queryObj = {...this.queryString};
      const excludeFields = ['page','sort','limit','fields'];
      excludeFields.forEach(el => delete queryObj[el])
  
      // 2) Advanced Filtering
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g , match=>`$${match}`);
      
      // let query = Tour.find(JSON.parse(queryStr));
      this.query.find(JSON.parse(queryStr));
        
      return this;
    }
    sort() {
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.split(',').join(' '); // Properly access sort field
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('-createdAt'); // Default sort order
      }
    
      return this; // Return this for chaining
    }
    fieldLimiting(){
      if(this.queryString.fields){
        const fields = this.queryString.fields.split(',').join(' ');
        this.query = this.query.select(fields);
      }else{
        this.query = this.query.select('-__v');
      }
      return this;
    }
    pagination(){
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 100;
      const skip = ( page - 1 ) * limit;
      // page-2 & limit-10 [1-10 page-1] [11-20 page2] [21-30 page3]
      this.query = this.query.skip(skip).limit(limit);
  
      return this;
    }
  }

  module.exports = APIfeatures;