const getRoutes = (req, googleMaps) => {
  return new Promise((resolve, reject) => {
    googleMaps.directions({
      origin: req.origin,
      destination: req.destination,
      mode: 'driving',
      alternatives: true,
      departure_time: new Date()
    },
      (err, response) => {
        if (err) {
          console.error("Can't get the routes!!!");
          reject(err); // tslint:disable-line
        }
        resolve(response);
      });
  });
};

module.exports = getRoutes;
