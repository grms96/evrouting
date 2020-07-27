const motorConsumption = (
  consumptionFromRollingResistance,
  consumptionFromWindDrag,
  motorEfficiency
) => {
  const consumptionFromDragAndTyres =
    consumptionFromRollingResistance + consumptionFromWindDrag;
  const consumptionFromMotor =
    consumptionFromDragAndTyres / motorEfficiency - consumptionFromDragAndTyres;
  return consumptionFromMotor; // (Wh/km)
};

module.exports = motorConsumption;