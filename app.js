
const express = require('express');
// Create a new express app instance
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const googleMaps = require('@google/maps').createClient({
    key: process.env.GOOGLE_MAPS_API_KEY
});
const getRoutesWithElevation = require('./helper/getRoutesWithElevationData');
const getRoutes = require('./helper/getRoutes');
const getWeather = require('./helper/getWeather')
const getEstimate = require('./helper/estimate')
app.get('/', async (req, res) => {

    let params = {
        origin: "bommanhalli",//req.query.origin;
        destination: "btm layout",//req.query.destination;
        time: "Wed May 14 11:17:22 IST2020",//req.query.when;
        car_model: "eKUV",//req.query.car_model
    }

    try {
        const result = await getRoutes(params, googleMaps);
        const routes = result.json;
        const routesWithElevation = await getRoutesWithElevation(routes, googleMaps);
        const weather = await getWeather(routes);
        const routes_estimation = await getEstimate(routesWithElevation, weather, params.time, params.car_model);
        return res.json(routes_estimation);
    } catch (error) {
        console.log("Something went wrong!!!");
    }
   
});

app.listen(process.env.PORT);


