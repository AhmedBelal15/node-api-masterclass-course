const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../models/Review");

const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const { getReviews, getReview } = require("../controllers/reviews");

router.route("/").get(
  advancedResults(Review, {
    path: "bootcamp",
    select: "name description",
  }),
  getReviews
);
router.route("/:id").get(getReview);

module.exports = router;
