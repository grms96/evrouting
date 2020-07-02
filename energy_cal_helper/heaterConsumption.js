const joulesPerWattHour = 3600; // (J/Wh)

const heaterConsumption = (
  heaterAcPower,
  speedInMperSecond
) => {
  const secondsForOneKm = 1000 / speedInMperSecond; // (s)
  const joulesForOneKm = heaterAcPower * secondsForOneKm; // (J/km)
  const consumption = joulesForOneKm / joulesPerWattHour; // (Wh/km);
  return consumption;
};

module.exports = heaterConsumption;