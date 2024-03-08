const express = require("express");
const { getAllUser } = require("../controllers/userController");
const approuter = express.Router();
const {
  login,
  signup,
  protect,
  forgetPassword,
  resetPassword,
  updatePassword,
} = require("../controllers/authController");
// approuter.route("/").get(getAllUser).post(createUser);
approuter.route("/user").get(protect, getAllUser);
approuter.route("/signup").post(signup);
approuter.route("/login").post(login);
approuter.route("/forget").post(forgetPassword);
approuter.route("/resetPassword").patch(resetPassword);
approuter.route("/updatePassword").patch(protect, updatePassword);
module.exports = approuter;
