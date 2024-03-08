const crypto = require("crypto");
const { promisify } = require("util");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const schemaValidation = require("../utils/schemaValidation");

const {
  authRegisterSchema,
  LoginSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} = require("../validation/authValidation");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const loginAccessToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires:
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 24 * 60 * 1000,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "development") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    token,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  schemaValidation(authRegisterSchema, req, next);
  const newUser = await User.create({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    active: req.body.active,
  });
  loginAccessToken(newUser, 200, res);
  next();
});

exports.login = catchAsync(async (req, res, next) => {
  schemaValidation(LoginSchema, req, next);
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError("Incorrect Email or Password. Please try again ...!", 401)
    );
  }
  loginAccessToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers?.authorization &&
    req.headers?.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("you are not logged In. Please log in to get access", 401)
    );
  }
  //Verfication token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed Password. Plz login again! ", 401)
    );
  }
  req.user = currentUser;
  next();
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  schemaValidation(forgetPasswordSchema, req, next);
  const user = await User.findOne({ email: req.body.email });
  // get user based on email
  if (!user) {
    return next(
      new AppError("User Not found plz enter valid email address", 404)
    );
  }
  // Generate Random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send token on user email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/user/resetPassword/${resetToken}`;
  const message = `Forget your password. submit a patch request with your new password and confirm password to : ${resetURL} \nIf you did't forget your password please ignore this email.`;
  console.log(resetURL);
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password rest token is valid for 10 minutes",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Plz check your email otp has been sent.",
    });
    next();
  } catch (err) {}
  // user.passwordResetToken = undefined;
  // user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });
  return next(
    new AppError("There was an error sending the email! plz try again.", 500)
  );
});

// these function need to rewrite by my self

exports.resetPassword = catchAsync(async (req, res, next) => {
  schemaValidation(resetPasswordSchema, req, next);
  //Get User based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.query.token) // Access token from route parameters
    .digest("hex");
  console.log(hashedToken, "hashed TOken");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  console.log(user, "user find");

  // 2) If token has not expired, and there is user, set the new password.
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 401));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user

  // 4 -  log the user in send JWT
  loginAccessToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  await schemaValidation(updatePasswordSchema, req, next);
  // 1)  Get user from collection
  const user = await User.findById(req.user.id).select("+password");
  // 2)  Check if Posted current Password is incorrect
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your Current Password is wrong", 404));
  }

  // 3)  If so update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  // 4)  Log User In send JWT
  loginAccessToken(user, 200, res);
});
