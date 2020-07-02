const dragForce = require('./dragForce');

const s = 1000; // displacement distance (m)
const joulesPerWattHour = 3600; // (J/Wh)

const windDragConsumption = (
  dragCoefficient,
  dragReferenceAreaInSquareMeters,
  densityOfHumidAir,
  speedInMperSecond
) => {
  const Fd = dragForce(
    dragCoefficient,
    dragReferenceAreaInSquareMeters,
    densityOfHumidAir,
    speedInMperSecond
  ); // (N)
  const W = Fd * s; // Work done (J)
  const workInWattHours = W / joulesPerWattHour; // (Wh)
  return workInWattHours;
};

module.exports = windDragConsumption;