import * as SunCalc from 'suncalc';
import { SolarPosition, SolarPathPoint, SimulationParams, AnalysisResult, CaveGeometry } from '@/types/solar';

/**
 * Calculate solar position for a given time and location
 */
export function calculateSolarPosition(
  date: Date,
  latitude: number,
  longitude: number
): SolarPosition {
  const position = SunCalc.getPosition(date, latitude, longitude);

  return {
    azimuth: (position.azimuth * 180 / Math.PI + 180) % 360, // Convert to 0-360 degrees
    elevation: position.altitude * 180 / Math.PI, // Convert to degrees
    distance: 1 // Approximate distance in AU
  };
}

/**
 * Calculate if sunlight would directly hit the cave based on geometry
 */
export function checkSunlightHitsCase(
  solarPosition: SolarPosition,
  cave: CaveGeometry
): boolean {
  // Simple geometric check - sunlight hits if:
  // 1. Sun is above horizon (elevation > 0)
  // 2. Sun's azimuth is within the cave's field of view

  if (solarPosition.elevation <= 0) {
    return false;
  }

  // Calculate the cave's field of view based on orientation and geometry
  const caveAzimuth = cave.orientation;
  const fieldOfView = Math.atan2(cave.width / 2, cave.depth) * 180 / Math.PI * 2;

  // Check if sun is within the cave's angular range
  const angleDiff = Math.abs(((solarPosition.azimuth - caveAzimuth + 180) % 360) - 180);

  return angleDiff <= fieldOfView / 2;
}

/**
 * Generate solar path points for a given time range
 */
export function generateSolarPath(params: SimulationParams): SolarPathPoint[] {
  const points: SolarPathPoint[] = [];
  const { latitude, longitude, timeRange, cave } = params;

  const startTime = new Date(timeRange.start);
  const endTime = new Date(timeRange.end);
  const intervalMs = timeRange.intervalMinutes * 60 * 1000;

  for (let time = startTime; time <= endTime; time = new Date(time.getTime() + intervalMs)) {
    const position = calculateSolarPosition(time, latitude, longitude);
    const hitsCase = checkSunlightHitsCase(position, cave);

    points.push({
      time: new Date(time),
      position,
      isVisible: position.elevation > 0,
      hitsCase
    });
  }

  return points;
}

/**
 * Analyze solar behavior for the given parameters
 */
export function analyzeSolarBehavior(params: SimulationParams): AnalysisResult {
  const { latitude, longitude, date } = params;

  // Get sunrise, sunset, and solar noon times
  const times = SunCalc.getTimes(date, latitude, longitude);

  // Generate solar path for the full day
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const pathParams = {
    ...params,
    timeRange: {
      start: dayStart,
      end: dayEnd,
      intervalMinutes: 15 // 15-minute intervals
    }
  };

  const pathPoints = generateSolarPath(pathParams);

  // Find periods when sunlight avoids the cave
  const avoidancePeriods = findAvoidancePeriods(pathPoints);

  return {
    sunriseTime: times.sunrise,
    sunsetTime: times.sunset,
    solarNoon: times.solarNoon,
    pathPoints,
    avoidancePeriods
  };
}

/**
 * Find periods when sunlight avoids the cave
 */
function findAvoidancePeriods(pathPoints: SolarPathPoint[]) {
  const periods: Array<{ start: Date; end: Date; description: string }> = [];
  let currentPeriodStart: Date | null = null;

  for (let i = 0; i < pathPoints.length; i++) {
    const point = pathPoints[i];

    if (point.isVisible && !point.hitsCase) {
      // Sun is visible but doesn't hit cave - start of avoidance period
      if (!currentPeriodStart) {
        currentPeriodStart = point.time;
      }
    } else if (currentPeriodStart) {
      // End of avoidance period
      periods.push({
        start: currentPeriodStart,
        end: pathPoints[i - 1]?.time || point.time,
        description: 'Sunlight avoids cave'
      });
      currentPeriodStart = null;
    }
  }

  // Handle case where avoidance period extends to end of day
  if (currentPeriodStart) {
    periods.push({
      start: currentPeriodStart,
      end: pathPoints[pathPoints.length - 1].time,
      description: 'Sunlight avoids cave'
    });
  }

  return periods;
}

/**
 * Get default cave geometry based on Quranic description
 */
export function getDefaultCaveGeometry(): CaveGeometry {
  return {
    orientation: 180, // South-facing (common interpretation)
    tilt: 15, // Slight upward tilt
    width: 10, // 10 meters wide
    height: 5, // 5 meters high
    depth: 20 // 20 meters deep
  };
}