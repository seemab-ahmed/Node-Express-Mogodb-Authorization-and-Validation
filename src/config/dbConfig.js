const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.PASSWORD);
    // .replace("<PASSWORD>", process.env.PASSWORD);
    mongoose.connect(DB).then(() => {
      console.log("DB connected successfuly...");
    });
  } catch (error) {
    console.error("Error connecting to database:", error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
