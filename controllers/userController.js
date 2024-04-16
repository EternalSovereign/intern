const User = require("../models/User");
const Course = require("../models/Course");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const {
    passwordValidator,
    usernameValidator,
    contactValidator,
    emailValidator,
} = require("../validators/validator");
const sendEmail = require("../emails/sendEmail");
const { sendOtp, validateOtp } = require("./otpController");

const registerUser = asyncHandler(async (req, res) => {
    const { username, password, email, profile, contact, role } = req.body;
    if (!username || !password || !email || !role) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }

    const isUsernameValid = await usernameValidator(username);
    if (!isUsernameValid) {
        return res.status(400).json({ message: "Invalid username" });
    }
    const isPasswordValid = await passwordValidator(password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid password" });
    }
    const isEmailValid = await emailValidator(email);
    if (!isEmailValid) {
        return res.status(400).json({ message: "Invalid email" });
    }
    if (contact) {
        const isContactValid = await contactValidator(contact);
        if (!isContactValid) {
            return res.status(400).json({ message: "Invalid contact" });
        }
    }

    const duplicate = await User.findOne({
        username: { $regex: new RegExp(username, "i") },
    })
        .lean()
        .exec();
    if (duplicate) {
        return res.status(409).json({ message: "Username already exists" });
    }

    const duplicateEmail = await User.findOne({
        email: { $regex: new RegExp(email, "i") },
    })
        .lean()
        .exec();
    if (duplicateEmail) {
        return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        username,
        password: hashedPassword,
        email,
        profile,
        contact,
        role,
    });
    if (user) {
        await sendEmail(
            email,
            "Registration Successful",
            "You have successfully registered",
            "<h1>Welcome to our platform</h1>"
        );
        return res
            .status(201)
            .json({ message: "User registered successfully" });
    } else {
        return res.status(400).json({ message: "User registration failed" });
    }
});

const updateUserProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { username, email, profile, contact, password, role } = req.body;
    const user = await User.findById(id).exec();
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }
    if (!password) {
        return res.status(400).json({ message: "Please enter password" });
    }
    const result = await bcrypt.compare(password, user.password);
    if (!result) {
        return res.status(400).json({ message: "Incorrect password" });
    }
    if (username) {
        const isUsernameValid = await usernameValidator(username);
        if (!isUsernameValid) {
            return res.status(400).json({ message: "Invalid username" });
        }
        const duplicate = await User.findOne({
            username: { $regex: new RegExp(username, "i") },
        })
            .lean()
            .exec();
        if (duplicate?._id.toString() !== id) {
            return res.status(409).json({ message: "Username already exists" });
        }
    }

    if (email) {
        const isEmailValid = await emailValidator(email);
        if (!isEmailValid) {
            return res.status(400).json({ message: "Invalid email" });
        }
        const duplicateEmail = await User.findOne({
            email: { $regex: new RegExp(email, "i") },
        })
            .lean()
            .exec();
        console.log(duplicateEmail);
        if (duplicateEmail && duplicateEmail._id.toString() !== id) {
            return res.status(409).json({ message: "Email already exists" });
        }
    }
    if (contact) {
        const isContactValid = await contactValidator(contact);
        if (!isContactValid) {
            return res.status(400).json({ message: "Invalid contact" });
        }
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.profile = profile || user.profile;
    user.contact = contact || user.contact;
    user.role = role || user.role;

    const updatedUser = await user.save();

    if (updatedUser) {
        return res.status(200).json({ message: "User updated successfully" });
    } else {
        return res.status(400).json({ message: "User updation failed" });
    }
});

const sendOtpChangePassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).exec();
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }
    const otp = sendOtp();
    const email = user.email;
    const html = `<h2>OTP for Password Change</h2><br><p>Your OTP is <strong>${otp.otp}<strong></p><br> <p>OTP expires in 5 minutes</p>`;
    const message = `Your OTP is ${otp.otp}. OTP expires in 5 minutes`;
    const subject = "Password Change OTP";
    const sent = await sendEmail(email, subject, message, html);
    if (sent) {
        return res.status(200).json({ message: "OTP sent successfully" });
    } else {
        return res.status(400).json({ message: "OTP sending failed" });
    }
});
const verifyChangePassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { password, newPassword, otp } = req.body;
    const user = await User.findById(id).exec();
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }
    if (!otp) {
        return res.status(400).json({ message: "Please enter OTP" });
    }
    const isOtpValid = validateOtp(otp);
    if (!isOtpValid) {
        return res.status(400).json({ message: "Invalid OTP" });
    }
    if (!password || !newPassword) {
        return res.status(400).json({ message: "Please enter password" });
    }
    const result = await bcrypt.compare(password, user.password);
    if (!result) {
        return res.status(400).json({ message: "Incorrect password" });
    }
    const isPasswordValid = await passwordValidator(newPassword);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid password" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    const updatedUser = await user.save();
    if (updatedUser) {
        return res
            .status(200)
            .json({ message: "Password changed successfully" });
    } else {
        return res.status(400).json({ message: "Password change failed" });
    }
});

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password").lean();
    if (!users?.length) {
        return res.status(400).json({ message: "No users found" });
    }
    return res.status(200).json({ users: users, message: "Users found" });
});

const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).select("-password").lean();
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }
    return res.status(200).json({ user: user, message: "User found" });
});

const enrollUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).exec();
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }
    const course = await Course.findById(req.body.courseId).exec();
    if (!course) {
        return res.status(400).json({ message: "Course not found" });
    }
    if (user.courses.includes(course._id)) {
        return res.status(400).json({ message: "Already enrolled" });
    }
    user.courses.push(course._id);
    await user.save();
    const email = user.email;
    const html = `<h2>Enrollment Confirmation</h2><br><p>You have successfully enrolled in ${course.coursename}</p>`;
    const message = `You have successfully enrolled in ${course.coursename}`;
    const subject = "Enrollment Confirmation";
    const sent = await sendEmail(email, subject, message, html);
    if (!sent) {
        return res
            .status(200)
            .json({ message: "Enrollment success but email failed" });
    }
    return res
        .status(200)
        .json({ message: "Enrolled successfully and email sent" });
});

const getMyCourses = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).lean().exec();
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }
    const courses = user.courses;
    if (!courses?.length) {
        return res.status(400).json({ message: "No courses found" });
    }
    const courseDetails = [];
    for (let i = 0; i < courses.length; i++) {
        const course = await Course.findById(courses[i]._id).lean().exec();
        courseDetails.push(course);
    }
    res.status(200).json({ courses: courseDetails, message: "Courses found" });
});

module.exports = {
    registerUser,
    updateUserProfile,
    getAllUsers,
    sendOtpChangePassword,
    verifyChangePassword,
    getUserById,
    enrollUser,
    getMyCourses,
};
