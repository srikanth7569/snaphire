const express = require("express");
const { body } = require("express-validator");
const captainController = require("../controllers/captain.controller");
const { authCaptain } = require("../middlewares/auth.middleware");
const captainModel = require("../models/captain.model"); // ✅ Add this

const router = express.Router();

// ✅ Register Captain
router.post(
  "/register",
  [
    body("fullname.lastname").isLength({ min: 3 }).withMessage("Last name must be at least 3 characters long."),
    body("email").isEmail().withMessage("Please enter a valid email."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long."),
    body("camera.cameraType").not().isEmpty().withMessage("Camera type is required"),
    body("skills").isArray().withMessage("Skills must be an array"),
    body("socialLinks.instagram").optional().isURL().withMessage("Please enter a valid URL"),
    body("location.city").not().isEmpty().withMessage("City is required"),
    body("location.state").not().isEmpty().withMessage("State is required"),
    body("location.country").not().isEmpty().withMessage("Country is required"),
  ],
  captainController.registerCaptain
);

// ✅ Login Captain
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long."),
  ],
  captainController.loginCaptain
);

// ✅ Profile (protected)
router.get("/profile", authCaptain, captainController.getCaptainProfile);

// ✅ Logout (protected)
router.get("/logout", authCaptain, captainController.logoutCaptain);

// ✅ Search Captains (open to public)
router.get("/search", captainController.searchCaptains);

// ✅ Get Captain by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const captain = await captainModel.findById(req.params.id);
    if (!captain) return res.status(404).json({ message: "Captain not found" });
    res.json(captain);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update full profile (protected)
router.put("/:id", authCaptain, captainController.updateCaptainProfile);

// ✅ Update only status (protected)
router.put("/:id/status", authCaptain, captainController.updateCaptainStatus);

module.exports = router;

