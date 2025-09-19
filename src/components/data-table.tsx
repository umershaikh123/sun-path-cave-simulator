'use client';

import { AnalysisResult } from '@/types/solar';
import { formatTime, formatDegrees, getCompassDirection } from '@/lib/utils';
import { Card, CardContent } from './ui/card';

interface DataTableProps {
  analysis: AnalysisResult;
}

export function DataTable({ analysis }: DataTableProps) {
  const visiblePoints = analysis.pathPoints.filter(point => point.isVisible);
  const avoidancePoints = visiblePoints.filter(point => !point.hitsCase);
  const directSunlightPoints = visiblePoints.filter(point => point.hitsCase);

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-clean">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-black mb-1">
              {Math.round((analysis.sunsetTime.getTime() - analysis.sunriseTime.getTime()) / (1000 * 60 * 60 * 100)) / 100}h
            </div>
            <div className="text-gray-600 text-sm">Daylight Hours</div>
          </CardContent>
        </Card>

        <Card className="card-clean">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-black mb-1">
              {avoidancePoints.length}
            </div>
            <div className="text-gray-600 text-sm">Avoidance Periods</div>
          </CardContent>
        </Card>

        <Card className="card-clean">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-black mb-1">
              {directSunlightPoints.length}
            </div>
            <div className="text-gray-600 text-sm">Direct Sun Periods</div>
          </CardContent>
        </Card>

        <Card className="card-clean">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-black mb-1">
              {Math.round((avoidancePoints.length / visiblePoints.length) * 100)}%
            </div>
            <div className="text-gray-600 text-sm">Avoidance Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Avoidance Periods */}
      {analysis.avoidancePeriods.length > 0 && (
        <Card className="card-clean">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-black">Sunlight Avoidance Periods</h3>
            <div className="space-y-2">
              {analysis.avoidancePeriods.map((period, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                  <span className="font-medium text-black">
                    {formatTime(period.start)} - {formatTime(period.end)}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {Math.round((period.end.getTime() - period.start.getTime()) / (1000 * 60))} minutes
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Solar Position Table */}
      <Card className="card-clean">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-black">Detailed Solar Positions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-black font-medium">Time</th>
                  <th className="text-left p-2 text-black font-medium">Azimuth</th>
                  <th className="text-left p-2 text-black font-medium">Elevation</th>
                  <th className="text-left p-2 text-black font-medium">Direction</th>
                  <th className="text-left p-2 text-black font-medium">Cave Status</th>
                </tr>
              </thead>
              <tbody>
                {visiblePoints.map((point, index) => (
                  <tr
                    key={index}
                    className={`border-b hover:bg-gray-50 ${
                      point.hitsCase ? 'bg-red-50' : 'bg-green-50'
                    }`}
                  >
                    <td className="p-2 font-medium text-black">
                      {formatTime(point.time)}
                    </td>
                    <td className="p-2 text-gray-700">
                      {formatDegrees(point.position.azimuth)}
                    </td>
                    <td className="p-2 text-gray-700">
                      {formatDegrees(point.position.elevation)}
                    </td>
                    <td className="p-2 text-gray-700">
                      {getCompassDirection(point.position.azimuth)}
                    </td>
                    <td className="p-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          point.hitsCase
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}
                      >
                        {point.hitsCase ? 'Direct Sunlight' : 'Sunlight Avoids'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Interpretation */}
      <Card className="card-clean">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-black">Quranic Interpretation Analysis</h3>
          <div className="space-y-3">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-black">Verse Reference:</strong> "When it rose, inclining away from their cave to the right,
              and when it set, declining away from them to the left..."
            </p>

            {analysis.avoidancePeriods.length > 0 ? (
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <p className="text-green-800 leading-relaxed">
                  <strong>✓ Positive Match:</strong> This configuration shows {analysis.avoidancePeriods.length} period(s)
                  where sunlight avoids the cave, which could align with the Quranic description.
                  The cave experiences {Math.round((avoidancePoints.length / visiblePoints.length) * 100)}%
                  sunlight avoidance throughout the day.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-yellow-800 leading-relaxed">
                  <strong>⚠ Partial Match:</strong> This configuration shows continuous direct sunlight exposure.
                  Consider adjusting the cave orientation or location to better match the Quranic description.
                </p>
              </div>
            )}

            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-black">Note:</strong> This simulation provides a physical analysis based on solar geometry.
                The actual historical context may involve additional factors not captured in this model.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}