const User = require("../models/User");

const checkAdmin = async (req, res, next) => {
    const requestUserID = req.UserID;
    if (!requestUserID) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { role } = await User.findOne(
        { _id: requestUserID },
        { role: 1 }
    ).lean();
    if (!role || role !== "admin") {
        return res.status(403).json({ message: "You are not authorized" });
    }
    next();
};

module.exports = checkAdmin;
