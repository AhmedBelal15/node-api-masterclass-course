const path = require("path");
const fs = require("fs");
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
  //Add user id to req.body
  req.body.user = req.user.id;

  //Check for published bootcamps
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  //If the user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }

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
  res.status(200).json(res.advancedResults);
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
  const bootcamp = await Bootcamp.findBy(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is the bootcamp owner
  if (String(bootcamp.user) !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }
  const updatedBootcamp = await Bootcamp.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({ success: true, data: updatedBootcamp });
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

  //Make sure user is the bootcamp owner
  if (String(bootcamp.user) !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this bootcamp`,
        401
      )
    );
  }

  bootcamp.remove();
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

//@desc         Upload photo for bootcamp
//@route        PUT /api/v1/bootcamps/:id/photo
//@access       Private

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

//Make sure user is the bootcamp owner
if (String(bootcamp.user) !== req.user.id && req.user.role !== "admin") {
  return next(
    new ErrorResponse(
      `User ${req.user.id} is not authorized to update this bootcamp`,
      401
    )
  );
}
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  //Make sure the file is a valid image
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please upload a valid image", 400));
  }

  //Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse("Please upload an image less than 1 Megabyte", 400)
    );
  }

  //Create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  //Check if public folder exists, if not create it
  const checkPublicFolder = fs.existsSync(`./public`);
  if (!checkPublicFolder) {
    fs.mkdirSync(`./public`, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
  const checkUploadsFolder = fs.existsSync("./public/uploads");
  if (!checkUploadsFolder) {
    fs.mkdirSync(`./public/uploads`, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  //Upload the file
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse("Problem with file upload", 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, {
      photo: file.name,
    });

    res.status(200).json({
      success: true,
      data: `${process.env.FILE_UPLOAD_PATH}/${file.name}`.substring(9),
    });
  });
});
