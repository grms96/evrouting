
const cardinalDirection = require('../energy_cal_helper/cardinalDirection');
const geoPointDistance = require('./geoPointDistance');
const batteryDischargeConsumption = require('../energy_cal_helper/batteryDischargeConsumption');
const densityOfHumidAir = require('../energy_cal_helper/densityOfHumidAir');
const heaterConsumption = require('../energy_cal_helper/heaterConsumption');
const inclineConsumption = require('../energy_cal_helper/inclineConsumption');
const inverterConsumption = require('../energy_cal_helper/inverterConsumption');
const motorConsumption = require('../energy_cal_helper/motorConsumption');
const motorEfficiency = require('../energy_cal_helper/motorEfficiency');
const rollingResistanceConsumption = require('../energy_cal_helper/rollingResistanceConsumption');
const windDragConsumption = require('../energy_cal_helper/windDragConsumption');
var _ = require('lodash');
const dcToACInverterEfficiency = 0.95;
const batteryDischargeEfficiency = 0.9;
const motorEfficiencyAtMax = 0.96;
const motorEfficiencyAtMin = 0.85;
const speedInKmPerHourAtMaxMotorEfficiency = 90;
const heaterAcPower = 0;

const getConsumption = ({ route, weather, when, config }) => {

  const { steps, elevationData } = route;

  const { massOfCarInKg = 1700, dragCoefficient = 0.29, rollingCoefficient = 0.0125,
    dragReferenceAreaInSquareMeters = 2.511 } = config.car.configuration;

  let i = 0;
  let totalDistance = 0;
  let totalDuration = 0;
  const result = [];
  const speedsterPow = 1 + (config.speed * 0.02 - 1) * 0.1;

  let totalBatteryCapacity = config.car.configuration.batteryCapacity || 0;

  config.minCharge = config.car.configuration.batteryCapacity * 0.1;

  steps.forEach((step) => {
    // find closest weather
    const s1 = [step.start_location.lat, step.start_location.lng];
    const s2 = [step.end_location.lat, step.end_location.lng];
    const center = [(s1[0] + s2[0]) / 2, (s1[1] - s2[1]) / 2];

    // find closest weather by location
    const closestWeather = weather
      .map((w) => ({
        distance: geoPointDistance(center, w.geopoint),
        ...w,
      }))
      .sort((a, b) => a.distance - b.distance)
      .shift().weather.list;

    // Find correct weather by time
    const dt = Math.round(Date.parse(when) / 1000);
    const currentWeather =
      closestWeather.find((w) => w.dt > dt) || closestWeather.pop();

    const speedInKmPerHour =
      (((step.distance.value / step.duration.value) * 3600) / 1000) **
      speedsterPow;

    let sumElv = 1;
    step.points.forEach((point, index, arr) => {
      const a = [point[0].lat, point[0].lng];
      const b = [point[1].lat, point[1].lng];
      const distance = geoPointDistance(a, b);
      const duration = (distance / step.distance.value) * step.duration.value;

      const elv = point.map((p) => {
        return elevationData.find((ep) => _.isEqual(ep.location, p));
      });

      if (!elv[0] && elv[1]) {
        elv[0] = elv[1];
      } else if (!elv[1] && elv[0]) {
        elv[1] = elv[0];
      } else if (!elv[0] && !elv[1]) {
        elv[0] = elv[1] = { elevation: sumElv / (index + 1) };
      }

      const rise = elv[1].elevation - elv[0].elevation;
      const grade = rise / distance;
      const inclineInPercent = grade * 100;
      const heightAboveReference = (elv[1].elevation + elv[0].elevation) / 2;
      const windSpeed = currentWeather.wind.speed;
      const windDirection = currentWeather.wind.deg;
      const temperatureInCelcius = currentWeather.main.temp - 273.15;
      const relativeHumidity = currentWeather.main.humidity;
      const absoluteAirPressureInPascal = currentWeather.main.pressure * 100;
      const cardinalDir = cardinalDirection(a, b);

      sumElv += heightAboveReference;

      const speedInMsec = ((speedInKmPerHour ? speedInKmPerHour : 90) * 1000) / 3600;

      const airDensity = densityOfHumidAir(temperatureInCelcius, relativeHumidity,
        absoluteAirPressureInPascal, heightAboveReference);

      const motorEff = motorEfficiency(motorEfficiencyAtMax, motorEfficiencyAtMin,
        speedInKmPerHourAtMaxMotorEfficiency, speedInKmPerHour);

      const rollingResistanceCon = rollingResistanceConsumption(rollingCoefficient);

      const angle = (cardinalDir - windDirection) % 360;
      const x = Math.cos((Math.PI * 2 * angle) / 360);
      const angleWindSpeed = x * windSpeed;
      const adjustedSpeed = speedInMsec - angleWindSpeed;

      const windDragCon = windDragConsumption(dragCoefficient, dragReferenceAreaInSquareMeters,
        airDensity, adjustedSpeed);

      const motorCon = motorConsumption(rollingResistanceCon, windDragCon,
        motorEff);

      const inverterCon = inverterConsumption(rollingResistanceCon, windDragCon,
        motorCon, dcToACInverterEfficiency);

      const batteryDischarge = batteryDischargeConsumption(rollingResistanceCon,
        windDragCon, motorCon, inverterCon, batteryDischargeEfficiency);

      const inclineCon = inclineConsumption(inclineInPercent, massOfCarInKg);

      const heaterCon = heaterConsumption(heaterAcPower, speedInMsec);

      const averageCon = rollingResistanceCon + windDragCon +
        motorCon + inverterCon + batteryDischarge + inclineCon + heaterCon;

      const totalCon = (averageCon * distance) / 1000;

      const consumption = {
        absoluteAirPressureInPascal,
        speedInMsec,
        airDensity,
        motorEfficiency: motorEff,
        rollingResistanceConsumption: rollingResistanceCon,
        windDragConsumption: windDragCon,
        motorConsumption: motorCon,
        inverterConsumption: inverterCon,
        batteryDischarge,
        inclineConsumption: inclineCon,
        heaterConsumption: heaterCon,
        averageConsumption: averageCon,
        totalConsumption: totalCon
      }
      
      result.push({
        i,
        distance: totalDistance,
        duration: totalDuration,
        battery: totalBatteryCapacity,
        point,
        consumption,
      })
      i++;
      totalBatteryCapacity -= consumption.totalConsumption;
      totalDistance += distance;
      totalDuration += duration;
    });
  });

  const aggregateKeys = [
    'averageConsumption',
    'totalConsumption',
    'rollingResistanceConsumption',
    'windDragConsumption',
    'motorConsumption',
    'inverterConsumption',
    'batteryDischarge',
    'inclineConsumption',
    'heaterConsumption',
  ];

  const aggregated = result.reduce((acc, item) => {
    aggregateKeys.forEach(key => {
      if (key === 'totalConsumption') {
        acc[key] = (acc[key] || 0) + item.consumption[key];
      } else {
        acc[key] =
          (acc[key] || 0) +
          (item.consumption[key] * item.consumption.distance) / 1000;
      }
    });
    return acc;
  }, {})

  return { aggregated, steps: result };
};

module.exports = getConsumption;
