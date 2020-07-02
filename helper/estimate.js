const getConsumption = require('./getConsumption');
const cars = require('../data/cars.json');
const config = {
    speed: 50,
    car: cars[0],
};

const estimate = (routes, weather, when, car_model) => {

    var route;
    // Adding total consumtion to each route
    for (var i in routes) {
        route = routes[i];
        if (route.elevationData === null) {
            delete routes[i];
        }
        else {
            let res = getConsumption({ route, weather, when, config });
            routes[i]['total_consumtion'] = res.aggregated.totalConsumption;
        }
    }

    return routes;
}

module.exports = estimate;