const captainModel = require("../models/captain.model");
const { validationResult } = require("express-validator");
const blacklistTokenModel = require("../models/blacklistToken.model");

// Allowed skills for validation
const allowedSkills = [
  "Wedding Photography",
  "Birthday Photography",
  "Event Photography",
  "Fashion Shoot",
  "Reel Making",
  "Product Shoot",
  "Travel Shoot",
  "Concert Shoot",
  "Corporate Shoot"
];

// ✅ Register Captain
module.exports.registerCaptain = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { fullname, email, password, camera, skills, socialLinks, location } = req.body;

    // Validate skills
    const invalidSkills = skills.filter(s => !allowedSkills.includes(s));
    if (invalidSkills.length > 0)
      return res.status(400).json({ message: `Invalid skills: ${invalidSkills.join(", ")}` });

    const isCaptainAlreadyRegistered = await captainModel.findOne({ email });
    if (isCaptainAlreadyRegistered) return res.status(400).json({ message: "Captain already registered" });

    const captain = new captainModel({
      fullname,
      email,
      password,
      camera,
      skills,
      socialLinks,
      location,
      status: "active"
    });

    const savedCaptain = await captain.save();
    const token = savedCaptain.generateAuthToken();

    const captainData = savedCaptain.toObject();
    delete captainData.password;

    res.status(201).json({
      token,
      captain: {
        _id: captainData._id,
        email: captainData.email,
        fullname: captainData.fullname,
        firstname: captainData.fullname.firstname,
        lastname: captainData.fullname.lastname,
        location: captainData.location,
        skills: captainData.skills,
        camera: captainData.camera,
        socialLinks: captainData.socialLinks,
        status: captainData.status
      }
    });
  } catch (error) {
    console.error("🔴 Register Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Login Captain
module.exports.loginCaptain = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const captain = await captainModel.findOne({ email }).select("+password");
    if (!captain) return res.status(401).json({ message: "Invalid Email or password" });

    const isMatch = await captain.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid Email or password" });

    // Update status to active
    captain.status = "active";
    await captain.save();

    const token = captain.generateAuthToken();
    res.cookie("token", token, { httpOnly: true });

    const captainData = captain.toObject();
    delete captainData.password;

    res.status(200).json({
      token,
      captain: {
        _id: captainData._id,
        email: captainData.email,
        fullname: captainData.fullname,
        firstname: captainData.fullname.firstname,
        lastname: captainData.fullname.lastname,
        location: captainData.location,
        skills: captainData.skills,
        camera: captainData.camera,
        socialLinks: captainData.socialLinks,
        status: captainData.status
      }
    });
  } catch (error) {
    console.error("🔴 Captain Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get Captain Profile
module.exports.getCaptainProfile = async (req, res) => {
  try {
    const captain = req.captain.toObject();
    delete captain.password;

    res.status(200).json({
      captain: {
        ...captain,
        firstname: captain.fullname.firstname,
        lastname: captain.fullname.lastname
      }
    });
  } catch (err) {
    console.error("🔴 Get Profile Error:", err);
    res.status(500).json({ message: "Failed to get profile" });
  }
};

// ✅ Logout Captain
module.exports.logoutCaptain = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (token) await blacklistTokenModel.create({ token });

    if (req.captain && req.captain._id) {
      req.captain.status = "inactive";
      await req.captain.save();
      console.log(`⚡ Captain ${req.captain.fullname.firstname} logged out. Status set to inactive.`);
    }

    res.clearCookie("token");
    res.status(200).json({ message: "Captain logged out successfully" });
  } catch (error) {
    console.error("🔴 Logout Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Search Captains
module.exports.searchCaptains = async (req, res) => {
  try {
    const { location, skill } = req.query;

    const results = await captainModel.find({
      "location.city": { $regex: location, $options: "i" },
      skills: { $in: [new RegExp(skill, "i")] },
      status: "active"
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("🔴 Error searching captains:", error);
    res.status(500).json({ message: "Server error while searching captains" });
  }
};

// ✅ Update entire profile
module.exports.updateCaptainProfile = async (req, res) => {
  try {
    const captain = await captainModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(captain);
  } catch (err) {
    console.error("🔴 Update Profile Error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// ✅ Update only status
module.exports.updateCaptainStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) return res.status(400).json({ message: "Invalid status" });

    const captain = await captainModel.findById(req.params.id);
    if (!captain) return res.status(404).json({ message: "Captain not found" });

    captain.status = status;
    await captain.save();

    console.log(`⚡ Captain ${captain.fullname.firstname} status changed to: ${captain.status}`);

    res.status(200).json({
      _id: captain._id,
      status: captain.status,
      firstname: captain.fullname.firstname,
      lastname: captain.fullname.lastname
    });
  } catch (err) {
    console.error("🔴 Failed to update captain status:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

