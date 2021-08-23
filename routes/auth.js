const express = require("express");
const { protect } = require("../middlewares/auth");
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails
} = require("../controllers/auth");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/updatedetails", protect, updateDetails);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
module.exports = router;
