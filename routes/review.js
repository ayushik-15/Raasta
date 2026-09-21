const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync= require("../utils/wrapAsync.js");
const reviewController = require("../controllers/review.js");

const {isLoggedIn,validateReview,isReviewAuthor}=require("../middleware.js");


// POST Review route
router.post("/", isLoggedIn,validateReview, wrapAsync(reviewController.postReview));

// Delete Review Route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.delete));

module.exports = router;
