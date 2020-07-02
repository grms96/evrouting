const inverterConsumption = (
  consumptionFromRollingResistance,
  consumptionFromWindDrag,
  consumptionFromMotor,
  dcToACInverterEfficiency = 0.95
) => {
  const consumptionFromDragTyresAndMotor =
    consumptionFromRollingResistance +
    consumptionFromWindDrag +
    consumptionFromMotor;
  const consumptionFromDCToAcInverter =
    consumptionFromDragTyresAndMotor / dcToACInverterEfficiency -
    consumptionFromDragTyresAndMotor;
  return consumptionFromDCToAcInverter; // (Wh/km)
};

module.exports = inverterConsumption;