const dotenv = require('dotenv');
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Reviews = require('./../../models/reviewModel');


const envPath = 'F:\\Web Devlopment\\NODEJS\\complete-node-bootcamp-master\\complete-node-bootcamp-master\\Natours\\after-section-06\\config.env';
dotenv.config({ path: envPath });


if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
  console.error('Error: DATABASE or DATABASE_PASSWORD is not defined in the environment variables.');
  process.exit(1);
}

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// Connect to MongoDB
mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'))
  .catch(err => {
    console.error('DB connection error:', err);
    process.exit(1);
  });

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Reviews.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Reviews.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log('Invalid command. Use --import to import data or --delete to delete data.');
  process.exit(1);
}
