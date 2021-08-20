const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");
/** 
 * @desc         Create new bootcamp
 * @route        POST /api/v1/bootcamps
 * @access       Private
*/
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

//@desc         Get all bootcamps
//@route        GET /api/v1/bootcamps
//@access       Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create Operators (gt, gte , etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  queryStr = JSON.parse(queryStr);
  query = Bootcamp.find(queryStr).populate('courses');

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Finding resource
  const bootcamps = await query;

  // pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  });
});

//@desc         Get single bootcamp
//@route        GET /api/v1/bootcamps/:id
//@access       Public

exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const errorMessage = new ErrorResponse(
    `Bootcamp not found with id of ${req.params.id}`,
    404
  );
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(errorMessage);
  }
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

//@desc         Update bootcamp
//@route        PUT /api/v1/bootcamps/:id
//@access       Private

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const errorMessage = new ErrorResponse(
    `Bootcamp not found with id of ${req.params.id}`,
    404
  );
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return next(errorMessage);
  }
  res.status(200).json({ success: true, data: bootcamp });
});

//@desc         Delete bootcamp
//@route        DELETE /api/v1/bootcamps/:id
//@access       Private

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const errorMessage = new ErrorResponse(
    `Bootcamp not found with id of ${req.params.id}`,
    404
  );
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(errorMessage);
  }
  bootcamp.remove()
  res.status(200).json({ success: true, data: {} });
});

//@desc         Get bootcamps within a radius
//@route        GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access       Private

exports.getBoocampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calculate radius using radians;
  // Divide distance by radius of Earth
  // Earth radius = 3963 mi / 6378.1 Km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
