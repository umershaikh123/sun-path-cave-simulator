'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SimulationParams } from '@/types/solar';
import { analyzeSolarBehavior } from '@/lib/solar-calculations';
import { SimulationControls } from './simulation-controls';
import { SolarPathVisualization } from './visualizations/solar-path-visualization';
import { DataTable } from './data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface SolarSimulatorProps {
  params: SimulationParams;
  onParamsChange: (params: SimulationParams) => void;
}

export function SolarSimulator({ params, onParamsChange }: SolarSimulatorProps) {
  const analysis = useMemo(() => {
    return analyzeSolarBehavior(params);
  }, [params]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="card-clean">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-black">
              Simulation Parameters
            </CardTitle>
            <CardDescription className="text-gray-600">
              Adjust the location, date, and cave geometry to explore different scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <SimulationControls
              params={params}
              onChange={onParamsChange}
            />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs defaultValue="visualization" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visualization">
              Solar Path Visualization
            </TabsTrigger>
            <TabsTrigger value="data">
              Data Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-4">
            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-black">
                  Solar Path & Cave Interaction
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Visualizing how sunlight interacts with the cave throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <SolarPathVisualization
                  analysis={analysis}
                  params={params}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card className="card-clean">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-black">
                  Solar Position Data
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Detailed breakdown of solar positions and cave interactions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <DataTable analysis={analysis} params={params} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}