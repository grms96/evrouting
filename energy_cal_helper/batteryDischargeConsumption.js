// Discharge efficiency. Rough guess inspired of https://batteryuniversity.com/learn/article/bu_808c_coulombic_and_energy_efficiency_with_the_battery
const batteryDischargeConsumption = (
  consumptionFromRollingResistance,
  consumptionFromWindDrag,
  consumptionFromMotor,
  consumptionFromDCToAcInverter,
  batteryDischargeEfficiency = 0.9
) => {
  const consumptionFromDragTyresMotorAndInverter =
    consumptionFromRollingResistance +
    consumptionFromWindDrag +
    consumptionFromMotor +
    consumptionFromDCToAcInverter;
  const consumptionFromBatteryDischarge =
    consumptionFromDragTyresMotorAndInverter / batteryDischargeEfficiency -
    consumptionFromDragTyresMotorAndInverter;
  return consumptionFromBatteryDischarge; // (Wh/km)
};

module.exports = batteryDischargeConsumption;
