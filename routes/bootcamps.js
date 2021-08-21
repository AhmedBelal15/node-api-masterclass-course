const express = require("express");
const router = express.Router();
const { createBootcamp, getBootcamps, getBootcamp, updateBootcamp, deleteBootcamp, getBoocampsInRadius, bootcampPhotoUpload } = require("../controllers/bootcamps");

//Include other resources router
const coursesRouter = require('./courses')

//Re-route into other resource router
router.use('/:bootcampId/courses', coursesRouter);

router.route('/radius/:zipcode/:distance').get(getBoocampsInRadius)

router.route('/:id/photo').put(bootcampPhotoUpload)

router.route('/').get(getBootcamps).post(createBootcamp)
router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)
module.exports = router;