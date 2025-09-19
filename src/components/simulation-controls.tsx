'use client';

import { Calendar, MapPin, Mountain } from 'lucide-react';
import { SimulationParams } from '@/types/solar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { formatDegrees } from '@/lib/utils';

interface SimulationControlsProps {
  params: SimulationParams;
  onChange: (params: SimulationParams) => void;
}

export function SimulationControls({ params, onChange }: SimulationControlsProps) {
  const updateParam = <K extends keyof SimulationParams>(
    key: K,
    value: SimulationParams[K]
  ) => {
    onChange({ ...params, [key]: value });
  };

  const updateCave = <K extends keyof SimulationParams['cave']>(
    key: K,
    value: SimulationParams['cave'][K]
  ) => {
    onChange({
      ...params,
      cave: { ...params.cave, [key]: value }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Location Controls */}
      <Card className="card-clean">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-black">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
          <CardDescription className="text-gray-600">Set geographical coordinates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              value={params.latitude}
              onChange={(e) => updateParam('latitude', parseFloat(e.target.value) || 0)}
              step="0.0001"
              min="-90"
              max="90"
              placeholder="e.g., 31.9539"
              className=""
            />
            <p className="text-xs text-gray-500">
              Range: -90° to 90°
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              value={params.longitude}
              onChange={(e) => updateParam('longitude', parseFloat(e.target.value) || 0)}
              step="0.0001"
              min="-180"
              max="180"
              placeholder="e.g., 35.9106"
              className=""
            />
            <p className="text-xs text-gray-500">
              Range: -180° to 180°
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Date Controls */}
      <Card className="card-clean">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-black">
            <Calendar className="h-5 w-5" />
            Date & Time
          </CardTitle>
          <CardDescription className="text-gray-600">Select simulation date</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={params.date.toISOString().split('T')[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                if (!isNaN(newDate.getTime())) {
                  updateParam('date', newDate);
                }
              }}
              className=""
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Calculation Interval (minutes)</Label>
            <div className="px-3">
              <Slider
                value={[params.timeRange.intervalMinutes]}
                onValueChange={([value]) =>
                  updateParam('timeRange', {
                    ...params.timeRange,
                    intervalMinutes: value
                  })
                }
                max={60}
                min={5}
                step={5}
                className="w-full"
              />
            </div>
            <p className="text-xs text-gray-500">
              Current: {params.timeRange.intervalMinutes} minutes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cave Geometry Controls */}
      <Card className="card-clean">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-black">
            <Mountain className="h-5 w-5" />
            Cave Geometry
          </CardTitle>
          <CardDescription className="text-gray-600">Configure cave parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orientation">
              Orientation: {formatDegrees(params.cave.orientation)}
            </Label>
            <div className="px-3">
              <Slider
                value={[params.cave.orientation]}
                onValueChange={([value]) => updateCave('orientation', value)}
                max={360}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            <p className="text-xs text-gray-500">
              Cave mouth direction (0° = North)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tilt">
              Tilt: {formatDegrees(params.cave.tilt)}
            </Label>
            <div className="px-3">
              <Slider
                value={[params.cave.tilt]}
                onValueChange={([value]) => updateCave('tilt', value)}
                max={90}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            <p className="text-xs text-gray-500">
              Upward angle (0° = horizontal)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="width">Width (m)</Label>
              <Input
                id="width"
                type="number"
                value={params.cave.width}
                onChange={(e) => updateCave('width', parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0.1"
                placeholder="10"
                className=""
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depth">Depth (m)</Label>
              <Input
                id="depth"
                type="number"
                value={params.cave.depth}
                onChange={(e) => updateCave('depth', parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0.1"
                placeholder="20"
                className=""
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}