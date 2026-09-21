require("dotenv").config(); 

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("Connected to live cloud DB for initialization");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl); 
}

const initDB = async () => {
  await Listing.deleteMany({});
  
  const categories = ["Trending", "Rooms", "Iconic Cities", "Surfing", "Beach", "Cabins", "Farms", "Amazing Pools", "Lakefront", "Castles", "Camping", "Boats"];

  for (let i = 0; i < initData.data.length; i++) {
      let obj = initData.data[i];
      
      let response = await geocodingClient.forwardGeocode({
          query: obj.location,
          limit: 1,
      }).send();
      
      obj.geometry = response.body.features[0].geometry;
      obj.owner = "69c556348dac03e8fe7a4666"; 
      obj.category = categories[i % categories.length];
  }

  await Listing.insertMany(initData.data);
  console.log("data was initialized with Mapbox coordinates and Categories");
};

initDB();