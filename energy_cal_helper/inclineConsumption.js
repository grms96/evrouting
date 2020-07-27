const standardAccelerationDueToGravity = 9.8; // (m/(s^2)i)
const joulesPerWattHour = 3600;

const inclineConsumption = (
  inclineInPercent = 0,
  massOfCarInKg
) => {
  // Calculating consumption per 1 km
  const heightGainInMPerKm = (inclineInPercent / 100) * 1000; // (m)
  const potentialEnergyPerKm =
    heightGainInMPerKm * massOfCarInKg * standardAccelerationDueToGravity; // (J)
  const consumptionFromIncline = potentialEnergyPerKm / joulesPerWattHour; // (Wh/km)
  return consumptionFromIncline; // (Wh/km)
};

module.exports = inclineConsumption;