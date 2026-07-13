const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const captainSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, 'First name must be at least 3 characters long.']
        },
        lastname: {
            type: String,
            minlength: [3, 'Last name must be at least 3 characters long.']
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    socketId: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    camera: {
        cameraType: [{
            type: String,
            required: true,
            enum: [
                "Smartphone", "DSLR", "Mirrorless Camera",
                "iPhone 13", "iPhone 13 Mini", "iPhone 13 Pro", "iPhone 13 Pro Max",
                "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
                "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
                "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max",
                "Samsung Galaxy S23 Ultra", "Samsung Galaxy S24 Ultra", "Samsung Galaxy S25 Ultra"
            ]
        }]
    },
    skills: [{
        type: String,
        enum: [
            "Wedding Photography", "Birthday Photography", "Event Photography",
            "Fashion Shoot", "Reel Making", "Product Shoot", "Travel Shoot",
            "Concert Shoot", "Corporate Shoot"
        ]
    }],
    socialLinks: {
        instagram: { type: String },
        vsco: { type: String },
        portfolio: { type: String }
    },
    mediaUploads: {
        images: [{ type: String }],
        videos: [{ type: String }]
    },
    reviews: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            rating: { type: Number, min: 1, max: 5 },
            review: { type: String, trim: true },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    // Added location field
    location: {
        city: { type: String, required: true },
        state: { type: String },
        country: { type: String, required: true },
        lat: { type: Number },
        lng: { type: Number }
    }
}, { timestamps: true }); // adds createdAt and updatedAt automatically

// Hash password before saving
captainSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Generate JWT auth token
captainSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Compare password method
captainSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Static method to hash password
captainSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
};

const captainModel = mongoose.model('Captain', captainSchema);

module.exports = captainModel;
