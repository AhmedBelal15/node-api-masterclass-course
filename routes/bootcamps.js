const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createBootcamp,
  getBootcamps,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBoocampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");

//Include other resources router
const coursesRouter = require("./courses");
const reviewsRouter = require("./reviews");

//Re-route into other resource router
router.use("/:bootcampId/courses", coursesRouter);
router.use("/:bootcampId/reviews", reviewsRouter);

router.route("/radius/:zipcode/:distance").get(getBoocampsInRadius);

router
  .route("/:id/photo")
  .put(protect, authorize("admin", "publisher"), bootcampPhotoUpload);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("admin", "publisher"), createBootcamp);
router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("admin", "publisher"), updateBootcamp)
  .delete(protect, authorize("admin", "publisher"), deleteBootcamp);
module.exports = router;
