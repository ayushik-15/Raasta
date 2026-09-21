const express = require("express");
const router = express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const {isLoggedIn} = require("../middleware.js");
const {isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });
const User = require("../models/user.js");

router.route("/")
// INDEX
.get(wrapAsync(listingController.index))
// CREATE
.post(isLoggedIn,upload.single('listing[image][url]'),validateListing,wrapAsync(listingController.create));


// New route
router.get("/new", isLoggedIn,listingController.renderNewForm);


// --- SAVE / LIKE ROUTE (Must be ABOVE /:id) ---
router.post("/:id/save", isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    
    if (user.savedListings.includes(id)) {
        user.savedListings.pull(id); 
        req.flash("success", "Removed from your saved places.");
    } else {
        user.savedListings.push(id); 
        req.flash("success", "Saved for later!");
    }
    
    await user.save();
    res.redirect(req.get("Referrer") || "/listings");
}));


router.get("/wishlist", isLoggedIn, wrapAsync(async (req, res) => {
    const currentUser = await User.findById(req.user._id).populate("savedListings");
    res.render("listings/wishlist.ejs", { savedListings: currentUser.savedListings });
}));


router.route("/:id")
// SHOW
.get(wrapAsync(listingController.showListing))
// UPDATE
.put( isLoggedIn,isOwner,upload.single('listing[image][url]'),validateListing,wrapAsync(listingController.update))
// DELETE
.delete(isLoggedIn,isOwner, wrapAsync(listingController.delete));

// Edit route 
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.edit));



module.exports = router;