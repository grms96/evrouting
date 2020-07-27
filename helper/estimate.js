const getConsumption = require('./getConsumption');
const estimate = (routes, weather, time, config) => {

    var response = [];
    // Adding total consumtion to each route

    routes.forEach(route => {
        if (route.elevationData === null) {
            delete route;
        }
        else {
            let res = getConsumption({ route, weather, time, config });
            let r = route.direction.legs[0];
            r['bounds'] = route.direction.bounds;
            let soc = (res.aggregated.totalConsumption*100)/config.car.configuration.batteryCapacity;
            r['soc'] = soc;
            response.push(r);
        }
    });

    response.sort((a,b)=>a.soc > b.soc ? 1 : -1);

    return response;
}

module.exports = estimate;