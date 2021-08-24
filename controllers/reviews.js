const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");

/**
 * @desc         Get reviews
 * @route        GET /api/v1/reviews
 * @route        GET /api/v1/bootcamps/:bootcampId/reviews
 * @access       Public
 */
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

/**
 * @desc         Get single review
 * @route        GET /api/v1/reviews/:id
 * @access       Public
 */
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: review,
  });
});

/**
 * @desc         Add review to a bootcamp
 * @route        POST /api/v1/bootcamps/:bootcampId/reviews
 * @access       Private
 */
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp found with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }

  const review = await Review.create(req.body);
  res.status(201).json({
    success: true,
    data: review,
  });
});

/**
 * @desc         Update Review
 * @route        PUT /api/v1/reviews/:id
 * @access       Private
 */
exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  //Make sure the review belongs to the user or the user is admin
  if (String(review.user) !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized to update the review", 401));
  }

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    success: true,
    data: updatedReview,
  });
});
