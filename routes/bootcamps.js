const express = require("express");
const router = express.Router();
const { createBootcamp, getBootcamps, getBootcamp, updateBootcamp, deleteBootcamp, getBoocampsInRadius } = require("../controllers/bootcamps");

router.route('/radius/:zipcode/:distance').get(getBoocampsInRadius)
router.route('/').get(getBootcamps).post(createBootcamp)
router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)
module.exports = router;