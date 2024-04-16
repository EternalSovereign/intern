const User = require("../models/User");
const Course = require("../models/Course");
const asyncHandler = require("express-async-handler");
const sendEmail = require("../emails/sendEmail");
const checkAdmin = require("../middleware/checkAdmin");
const { sendOtp, validateOtp } = require("./otpController");

const registerCourse = asyncHandler(async (req, res) => {
    const {
        coursename,
        keywords,
        category,
        popularity,
        level,
        description,
        price,
        creater,
        titleOfChapters,
        linksOfChapters,
    } = req.body;
    if (
        !coursename ||
        !keywords.length ||
        !category ||
        !level ||
        !description ||
        !price ||
        !creater ||
        !titleOfChapters?.length ||
        !linksOfChapters?.length
    ) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }
    const courseExist = await Course.findOne({ coursename, creater }).exec();
    if (courseExist) {
        return res.status(400).json({ message: "Course already exists" });
    }
    const course = await Course.create({
        coursename,
        keywords,
        category,
        popularity,
        level,
        description,
        price,
        creater,
        titleOfChapters,
        linksOfChapters,
    });
    res.status(200).json({ message: "Course created successfully", course });
});

const getCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find({}).lean().exec();
    if (req.query.length) {
        if (req.query.catagory && req.query.level) {
            courses = await Course.find({
                category: req.query.category,
                level: req.query.level,
            })
                .lean()
                .exec();
        } else if (req.query.category) {
            courses = await Course.find({
                category: req.query.category,
            })
                .lean()
                .exec();
        } else if (req.query.level) {
            courses = await Course.find({
                level: req.query.level,
            })
                .lean()
                .exec();
        }
    }
    if (!courses || courses?.length === 0) {
        return res.status(400).json({ message: "No courses found" });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    results.total = courses.length;
    if (endIndex < courses.length) {
        results.next = {
            page: page + 1,
            limit: limit,
        };
    }
    if (startIndex > 0) {
        results.previous = {
            page: page - 1,
            limit: limit,
        };
    }
    results.results = courses.slice(startIndex, endIndex);
    res.status(200).json({ results: results, message: "Courses found" });
});

const updateCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        coursename,
        keywords,
        category,
        popularity,
        level,
        description,
        price,
        creater,
        titleOfChapters,
        linksOfChapters,
    } = req.body;
    const course = await Course.findById(id).exec();
    if (!course) {
        return res.status(400).json({ message: "Course not found" });
    }
    course.coursename = coursename || course.coursename;
    course.keywords = keywords || course.keywords;
    course.category = category || course.category;
    course.popularity = popularity || course.popularity;
    course.level = level || course.level;
    course.description = description || course.description;
    course.price = price || course.price;
    course.creater = creater || course.creater;
    course.titleOfChapters = titleOfChapters || course.titleOfChapters;
    course.linksOfChapters = linksOfChapters || course.linksOfChapters;
    await course.save();
    const updatedCourse = await Course.findById(id).exec();
    if (!updatedCourse) {
        return res.status(400).json({ message: "Course not updated" });
    }
    res.status(200).json({ message: "Course updated successfully" });
});

const deleteCourse = asyncHandler(async (req, res) => {
    const course = await Course.findByIdAndDelete(req.params.id).exec();
    if (!course) {
        return res.status(400).json({ message: "Course not found" });
    }
    res.status(200).json({ message: "Course deleted successfully" });
});

const getCourseById = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id).exec();
    if (!course) {
        return res.status(400).json({ message: "Course not found" });
    }
    res.status(200).json({ course: course, message: "Course found" });
});

module.exports = {
    registerCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
};
