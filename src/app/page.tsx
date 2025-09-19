'use client';

import { useState } from 'react';
import { SolarSimulator } from '@/components/solar-simulator';
import { Header } from '@/components/header';
import { getDefaultCaveGeometry } from '@/lib/solar-calculations';
import { SimulationParams } from '@/types/solar';

export default function Home() {
  const [params, setParams] = useState<SimulationParams>({
    latitude: 31.9539, // Approximate latitude for Middle East region
    longitude: 35.9106, // Approximate longitude for Middle East region
    date: new Date(),
    cave: getDefaultCaveGeometry(),
    timeRange: {
      start: new Date(new Date().setHours(0, 0, 0, 0)),
      end: new Date(new Date().setHours(23, 59, 59, 999)),
      intervalMinutes: 15
    }
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <SolarSimulator
            params={params}
            onParamsChange={setParams}
          />
        </div>
      </main>
    </div>
  );
}
