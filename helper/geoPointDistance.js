const toRad = (n) => {
  return (n * Math.PI) / 180;
};

const geoPointDistance = (a, b) => {
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const f =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a[0])) *
    Math.cos(toRad(b[0])) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(f), Math.sqrt(1 - f));
  return R * c * 1000;
};

module.exports = geoPointDistance;