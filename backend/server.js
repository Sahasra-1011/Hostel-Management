const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const hostelRoutes = require("./routes/hostelRoutes");

const app = express();
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Server Runnnig");
});

app.get("/getlocation/:city", async(req,res)=>{
  try{
    const city = req.params.city
    const result = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&format=json`);
    const get_location = result.data["results"][0];
    let latitude = get_location["latitude"];
    let longitude = get_location["longitude"];
    res.send({latitude: latitude,longitude: longitude});
    
  }catch(err){
    console.log(err);
  }
});


app.get("/gethostels/:city/:radius",async (req,res)=>{
  try{
     const {city,radius} = req.params;
     const location = await axios.get(`http://localhost:4000/getlocation/${city}`);
     let latitude = location.data['latitude'];
     let longitude = location.data['longitude'];
     const hostels = await axios.get(`https://overpass-api.de/api/interpreter?data=[out:json];node["tourism"="hostel"](around:${radius},${latitude},${longitude});out;`)
     const list_hostels = hostels.data['elements']
     res.send(list_hostels);
  }catch(err){
      console.log(err);
  }
})

app.use("/", hostelRoutes);

app.listen(4000,() =>{console.log(`Server running on port 4000`)}) ;