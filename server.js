const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
const mongoose = require('mongoose');
const Tour= require('./models/tourModel')

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
)

mongoose
    .connect(DB)
    .then(()=>{
      console.log("Connection Successful 👋");
    })

// const testTour= new Tour({
//   name:"The Forest ",
//   rating:4.5,
//   price:10000
// })
// testTour.save()
//     .then(doc => {
//   console.log(doc);
//   }).catch(err=>{
//     console.log("Error"+err);
//   }
//   )

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
