
const express = require('express');
// Create a new express app instance
const app = express();
const dotenv = require('dotenv');
const cars = require('./data/cars.json');
dotenv.config();
const googleMaps = require('@google/maps').createClient({
    key: process.env.GOOGLE_MAPS_API_KEY
});
const getRoutesWithElevation = require('./helper/getRoutesWithElevationData');
const getRoutes = require('./helper/getRoutes');
const getWeather = require('./helper/getWeather')
const getEstimate = require('./helper/estimate')
const config = {
    speed: 50,
    car: cars[0]
};
app.get('/', async (req, res) => {

    const checkVehicleRange = (res) => {
        let flag = true;
        res.routes.forEach(element => {
            if (element.legs[0].distance.value > config.car.configuration.range){
                flag = false;
            } 
        });
        return flag;
    }

    let params = {
        origin: "gold hill square bommanhalli",//req.query.origin;
        destination: "btm layout",//req.query.destination;
        time: "Wed May 14 11:17:22 IST2020",//req.query.when;
        car_model: "eKUV",//req.query.car_model
    }

    try {

        const result = await getRoutes(params, googleMaps);
        const routes = result.json;

        if (checkVehicleRange(routes)) {
            const routesWithElevation = await getRoutesWithElevation(routes, googleMaps);
            const weather = await getWeather(routes);
            const routes_estimation = await getEstimate(routesWithElevation, weather, params.time, config);
            return res.json(routes_estimation);
        }
        else {
            throw new Error("Distance out of range!!!");
        }    
    } catch (error) {
        console.log(error);
        console.log("Something went wrong!!!");
    }

});

app.listen(process.env.PORT);


