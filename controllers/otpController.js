const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const sendEmail = require("../emails/sendEmail");
const otpGen = require("gen-otp");

const otp = otpGen({
    length: 6,
    digits: true,
    letters: false,
    symbols: false,
    expiration: "5m",
});
const verifyOtp = (otp1) => {
    if (Date.now() > otp.expiresAt) {
        return false;
    }
    if (otp1 === otp.otp) {
        console.log(otp.otp);
        console.log(otp1);
        return true;
    }
    return false;
};

const sendOtp = () => {
    return otp;
};

const validateOtp = (otp) => {
    return verifyOtp(otp);
};

module.exports = { sendOtp, validateOtp };
