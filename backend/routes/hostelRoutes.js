const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/gethostel/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await axios.get(
      `https://overpass-api.de/api/interpreter?data=[out:json];node(${id});out;`
    );

    if (!result.data.elements.length)
      return res.status(404).send({ message: "Hostel not found" });

    const hostelData = result.data.elements[0];

   
    res.send(hostelData);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error fetching hostel details");
  }
});

module.exports = router;
