const express = require("express");
const path = require("path");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const checkAdmin = require("./middleware/checkAdmin");

const app = express();
connectDB();
const PORT = process.env.PORT || 8000;

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.static("public"));
app.use("/", require("./routes/root.js"));
app.use("/users", require("./routes/userRoutes.js"));
app.use("/auth", require("./routes/authRoutes.js"));
app.use("/courses", require("./routes/courseRoutes.js"));
app.use("*", (req, res) => {
    res.status(404);
    if (req.accepts("html")) {
        res.sendFile(path.join(__dirname, "/views/404.html"));
    } else if (req.accepts("json")) {
        res.json({ error: "Not found" });
    } else {
        res.type("txt").send("Not found");
    }
});
app.use(errorHandler);
app.use(checkAdmin);

mongoose.connection.once("open", () => {
    console.log("MongoDB connected successfully");
});
mongoose.connection.on("error", (err) => {
    console.log(err);
    logEvents(
        `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
        "mongoErrLog.log"
    );
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
