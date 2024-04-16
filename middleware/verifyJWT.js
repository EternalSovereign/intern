const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) {
            console.log(err);
            console.log(token);
            console.log(process.env.ACCESS_TOKEN);
            return res.status(403).json({ message: "Forbidden" });
        }
        req.userID = user.UserInfo.UserId;
        req.userName = user.UserInfo.UserName;
        next();
    });
};

module.exports = verifyJWT;
