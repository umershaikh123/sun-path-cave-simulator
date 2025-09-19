export interface SolarPosition {
  azimuth: number; // in degrees, 0 = north, 90 = east, 180 = south, 270 = west
  elevation: number; // in degrees, 0 = horizon, 90 = zenith
  distance: number; // distance from earth in AU
}

export interface CaveGeometry {
  orientation: number; // cave mouth orientation in degrees (0 = north)
  tilt: number; // cave mouth tilt in degrees (0 = horizontal, 90 = vertical)
  width: number; // cave mouth width in meters
  height: number; // cave mouth height in meters
  depth: number; // cave depth in meters
}

export interface SimulationParams {
  latitude: number; // in degrees
  longitude: number; // in degrees
  date: Date;
  cave: CaveGeometry;
  timeRange: {
    start: Date;
    end: Date;
    intervalMinutes: number;
  };
}

export interface SolarPathPoint {
  time: Date;
  position: SolarPosition;
  isVisible: boolean; // whether sun is above horizon
  hitsCase: boolean; // whether sunlight would hit the cave
}

export interface AnalysisResult {
  sunriseTime: Date;
  sunsetTime: Date;
  solarNoon: Date;
  pathPoints: SolarPathPoint[];
  avoidancePeriods: Array<{
    start: Date;
    end: Date;
    description: string;
  }>;
}