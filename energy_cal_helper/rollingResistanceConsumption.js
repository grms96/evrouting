const rollingResistanceForce = require('./rollingResistanceForce');

const s = 1000; // displacement distance (m)
const joulesPerWattHour = 3600; // (J/Wh)

const rollingResistanceConsumption = (
  rollingResistanceCoefficient => {
    const Fr = rollingResistanceForce(rollingResistanceCoefficient);
    const W = Fr * s; // Work done (J)
    const workInWattHours = W / joulesPerWattHour; // (Wh)
    return workInWattHours;
  });

module.exports = rollingResistanceConsumption;
