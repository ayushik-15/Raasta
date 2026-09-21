const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: String,
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt:{
        type: Date,
        // FIX: Removed parentheses. Date.now executes at runtime for every new review.
        default: Date.now, 
    },
    author : {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Review", reviewSchema);