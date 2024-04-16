const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyJWT = require("../middleware/verifyJWT");

router
    .route("/")
    .get(userController.getAllUsers)
    .post(userController.registerUser);
router
    .route("/:id")
    .get(verifyJWT, userController.getUserById)
    .patch(verifyJWT, userController.updateUserProfile);

router
    .route("/:id/change-password")
    .get(verifyJWT, userController.sendOtpChangePassword)
    .patch(verifyJWT, userController.verifyChangePassword);

router.route("/:id/enroll").post(verifyJWT, userController.enrollUser);

router.route("/:id/my-courses").get(verifyJWT, userController.getMyCourses);

module.exports = router;
