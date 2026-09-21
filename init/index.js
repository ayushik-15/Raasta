require("dotenv").config(); // Standard config works when running from the root folder

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// Pull the cloud database URL from your .env file
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("Connected to live cloud DB for initialization");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl); // Connect Mongoose to Atlas
}

const initDB = async () => {
  await Listing.deleteMany({});
  
  const categories = ["Trending", "Rooms", "Iconic Cities", "Surfing", "Beach", "Cabins", "Farms", "Amazing Pools", "Lakefront", "Castles", "Camping", "Boats"];

  // Loop through each listing and fetch its Mapbox coordinates before saving
  for (let i = 0; i < initData.data.length; i++) {
      let obj = initData.data[i];
      
      let response = await geocodingClient.forwardGeocode({
          query: obj.location,
          limit: 1,
      }).send();
      
      // Assign the geometry coordinates from Mapbox
      obj.geometry = response.body.features[0].geometry;
      // Assign the owner
      obj.owner = "69c556348dac03e8fe7a4666"; 
      
      // Assign a category to the listing so the frontend filters work
      obj.category = categories[i % categories.length];
  }

  await Listing.insertMany(initData.data);
  console.log("data was initialized with Mapbox coordinates and Categories");
};

initDB();