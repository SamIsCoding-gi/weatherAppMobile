const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
app.use(express.json());

const uri =
  "mongodb+srv://Samuel:SamuelJobtest123@cluster0.bgjwczk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

// gets daily and 16 day forecast as well as saving search terms
app.put("/insertSearchTerm", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("searchTerms");
    const collection = database.collection("searchTerm");

    const currentDate = new Date().toISOString().split("T")[0];
    const searchTerm = req.body.searchTerm;
    console.log("searchTerm: ", searchTerm);
    const result = await collection.updateOne(
      { date: currentDate },
      { $push: { searchTerms: searchTerm } },
      { upsert: true }
    );

    // get daily and 16 day forecast
    const dailyForecast = await fetch(
      `http://api.weatherbit.io/v2.0/current?lat=${searchTerm[0]}&lon=${searchTerm[1]}&key=<API_KEY>`
    );
    if (!dailyForecast.ok) {
      throw new Error("City not found");
    }
    const dailyForecastData = await dailyForecast.json();
    console.log("Daily weather: ", dailyForecastData);

    const sixteenDayForecast = await fetch(
      `https://api.weatherbit.io/v2.0/forecast/daily?lat=${searchTerm[0]}&lon=${searchTerm[1]}&days=<API_KEY>`
    );
    if (!sixteenDayForecast.ok) {
      throw new Error("City not found");
    }

    const sixteenDayForecastData = await sixteenDayForecast.json();
    console.log("16 day weather: ", sixteenDayForecastData);

    const hourlyForecast = await fetch(
      `https://api.weatherbit.io/v2.0/forecast/hourly?lat=${searchTerm[0]}&lon=${searchTerm[1]}&key=<API_KEY>`
    );

    if (!hourlyForecast.ok) {
      throw new Error("City not found");
    }
    const hourlyForecastData = await hourlyForecast.json();

    console.log("Hourly weather: ", hourlyForecastData);

    res.status(200).send({
      dailyForecastData,
      sixteenDayForecastData,
      hourlyForecastData,
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error inserting search term");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
