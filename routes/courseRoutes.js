const express = require("express");
const router = express.Router();
const checkAdmin = require("../middleware/checkAdmin");
const courseController = require("../controllers/courseController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router
    .route("/")
    .get(courseController.getCourses)
    .post(checkAdmin, courseController.registerCourse);

router
    .route("/:id")
    .get(courseController.getCourseById)
    .patch(checkAdmin, courseController.updateCourse)
    .delete(checkAdmin, courseController.deleteCourse);

module.exports = router;
