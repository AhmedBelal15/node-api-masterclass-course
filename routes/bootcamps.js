const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
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
const advancedResults = require("../middlewares/advancedResults");

//Include other resources router
const coursesRouter = require("./courses");

//Re-route into other resource router
router.use("/:bootcampId/courses", coursesRouter);

router.route("/radius/:zipcode/:distance").get(getBoocampsInRadius);

router.route("/:id/photo").put(protect, bootcampPhotoUpload);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, createBootcamp);
router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, updateBootcamp)
  .delete(protect, deleteBootcamp);
module.exports = router;
