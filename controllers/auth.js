const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");

/**
 * @desc         Register User
 * @route        POST /api/v1/auth/register
 * @access       Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create user
  const user = await User.create({ name, email, password, role });

  // Create token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
  });
});

/**
 * @desc         Login User
 * @route        POST /api/v1/auth/login
 * @access       Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(
      new ErrorResponse("Please provide an email and a password", 400)
    );
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }

  // Check if passwords match
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

/**
 * @desc         Get current logged in user
 * @route        POST /api/v1/auth/me
 * @access       Private
 */

exports.getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

/**
 * @desc         Forgot password
 * @route        POST /api/v1/auth/forgotpassword
 * @access       Public
 */

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ErrorResponse(
        `There is no user with the email ${req.body.email}`,
        404
      )
    );
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/resetPassword/${resetToken}`;

  const message = `Please make a request to ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      message,
    });
    res.status(200).json({
      success: true,
      data: "Email Sent",
    });
  } catch (error) {
    console.log(error);
    user.getResetPasswordToken = undefined;
    user.getResetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    next(new ErrorResponse("Email could not be sent", 500));
  }
});

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
