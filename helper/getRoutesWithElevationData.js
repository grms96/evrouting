const { uniqBy } = require('lodash');
const polyline = require('@mapbox/polyline');

const MIN_SPREAD_DISTANCE = 250;

const getRouteWithElevation = async (res, googleMaps) => {
  var promises = [];
  res.routes.forEach((r) => {
    var promise = new Promise(resolve => {
      const steps = r.legs[0].steps;
      const minBasedOnDistance =
        r.legs[0].distance.value / (500 - steps.length);
      const minDistanceBetweenElevationPoints = Math.max(
        MIN_SPREAD_DISTANCE,
        minBasedOnDistance
      );

      let nextPoint = 0;
      let dist = 0;

      const result = steps.map((step) => {
        const polypoints = polyline.decode(step.polyline.points);
        const part = step.distance.value / polypoints.length;
        // const polydistance = polypoints.slice(1).reduce((acc: any, p: any, index: number) => acc + geoPointDistance(polypoints[index], p), 0);

        const points = polypoints.reduce(
          (acc, point) => {
            dist += part;
            if (dist > nextPoint) {
              nextPoint = dist + minDistanceBetweenElevationPoints;
              acc.push({ lat: point[0], lng: point[1] });
            }
            return acc;
          },
          [step.start_location]
        );
        return {
          ...step,
          points: points.map((from, index, arr) => {
            const next = arr[index + 1];
            const to = next ? next : step.end_location;
            return [from, to];
          }),
        };
      });

      const locations = uniqBy(
        result.reduce((acc, item) => {
          item.points.forEach((a) => a.forEach((n) => acc.push(n)));
          return acc;
        }, [])
      );


      googleMaps.elevation(
        { locations },
        (err, response) => {
          if (err && response.status != 200) {
            console.error('Elevation Status', status); // tslint:disable-line
          }

          return resolve({
            direction: res,
            steps: result,
            elevationData: response.json.results,
            minDistanceBetweenElevationPoints,
          });
        }
      );
    });
    promises.push(promise);
  });
  return Promise.all(promises);
};

module.exports = getRouteWithElevation;

