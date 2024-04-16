const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        role: {
            type: String,
            default: "customer",
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        profile: {
            type: String,
            default: "https://www.gravatar.com/avatar/ ",
        },
        contact: {
            type: Number,
        },
        courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
