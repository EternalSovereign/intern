const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({
            message: "Please provide an email and password",
        });
    }
    const user = await User.findOne({ email }).exec();
    if (!user) {
        res.status(401).json({
            message: "Invalid credentials",
        });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(401).json({
            message: "Invalid credentials",
        });
    }

    const accessToken = jwt.sign(
        {
            UserInfo: {
                UserId: user._id,
                UserName: user.username,
            },
        },
        process.env.ACCESS_TOKEN,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        {
            UserInfo: {
                UserId: user._id,
                UserName: user.username,
            },
        },
        process.env.REFRESH_TOKEN,
        { expiresIn: "7d" }
    );

    res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken });
});

const refresh = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.jwt) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const refreshToken = cookie.jwt;
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN,
        asyncHandler(async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Forbidden" });
            }
            const user = await User.findById(decoded.UserInfo.UserId).exec();
            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const accessToken = jwt.sign(
                {
                    UserInfo: {
                        UserId: user._id,
                        UserName: user.username,
                    },
                },
                process.env.ACCESS_TOKEN,
                { expiresIn: "15m" }
            );
            return res.status(200).json({ accessToken });
        })
    );
});

const logout = asyncHandler(async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.status(200).json({ message: "Cookie cleared" });
});

module.exports = { login, refresh, logout };
