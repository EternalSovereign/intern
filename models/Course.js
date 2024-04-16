const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        coursename: {
            type: String,
            required: true,
        },
        keywords: [
            {
                type: String,
                required: true,
            },
        ],
        category: {
            type: String,
            required: true,
        },
        popularity: {
            type: Number,
            default: 5,
        },
        level: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        creater: {
            type: String,
            required: true,
            ref: "User",
        },
        titleOfChapters: [
            {
                type: String,
                required: true,
            },
        ],
        linksOfChapters: [
            {
                type: String,
                required: true,
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
