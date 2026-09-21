const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    // FIX: Extract both search query (q) and category from the URL
    const { q, category } = req.query; 
    let allListings;

    if (q) {
        const searchRegex = new RegExp(q, 'i');
        allListings = await Listing.find({
            $or: [
                { title: searchRegex },
                { location: searchRegex },
                { country: searchRegex }
            ]
        });

        if (allListings.length === 0) {
            req.flash("error", "No listings found for that destination.");
            return res.redirect("/listings");
        }
    } else if (category) {
        // FIX: Find listings that match the clicked category
        allListings = await Listing.find({ category: category });
        
        if (allListings.length === 0) {
            req.flash("error", `No listings found for the ${category} category.`);
            return res.redirect("/listings");
        }
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews", populate: {
            path: "author",
        },
    }).populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for Does Not Exist!");
        return res.redirect("/listings");
    }
    
    res.render("listings/show.ejs", { listing, mapToken });
};

module.exports.create = async (req, res, next) => {
    if (!req.file) {
        req.flash("error", "Listing image is required!");
        return res.redirect("/listings/new");
    }

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    }).send();

    if (!response.body.features.length) {
        req.flash("error", "Invalid location provided. Please try again.");
        return res.redirect("/listings/new");
    }

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New listing created!");
    res.redirect("/listings");
};

module.exports.edit = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for Does Not Exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
};

module.exports.update = async (req, res) => {
    let { id } = req.params;
    
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    }).send();

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (response.body.features.length > 0) {
        listing.geometry = response.body.features[0].geometry;
    }

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }
    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.delete = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
};