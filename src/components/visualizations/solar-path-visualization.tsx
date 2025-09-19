'use client';

import { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { AnalysisResult, SimulationParams } from '@/types/solar';
import { formatTime, formatDegrees } from '@/lib/utils';

interface SolarPathVisualizationProps {
  analysis: AnalysisResult;
  params: SimulationParams;
}

export function SolarPathVisualization({ analysis, params }: SolarPathVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const chartData = useMemo(() => {
    return analysis.pathPoints
      .filter(point => point.isVisible)
      .map(point => ({
        time: point.time,
        azimuth: point.position.azimuth,
        elevation: point.position.elevation,
        hitsCase: point.hitsCase
      }));
  }, [analysis.pathPoints]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 80, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, 360])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 90])
      .range([height, 0]);

    // Create grid lines
    const xAxis = d3.axisBottom(xScale).tickSize(-height).tickFormat(() => "");
    const yAxis = d3.axisLeft(yScale).tickSize(-width).tickFormat(() => "");

    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("line")
      .style("stroke", "#e5e7eb")
      .style("stroke-width", 0.5);

    g.append("g")
      .attr("class", "grid")
      .call(yAxis)
      .selectAll("line")
      .style("stroke", "#e5e7eb")
      .style("stroke-width", 0.5);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}°`))
      .selectAll("text")
      .style("fill", "#374151");

    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}°`))
      .selectAll("text")
      .style("fill", "#374151");

    // Axis labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 45)
      .attr("fill", "#1f2937")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .text("Solar Azimuth (degrees)");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -height / 2)
      .attr("fill", "#1f2937")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .text("Solar Elevation (degrees)");

    // Create line generator
    const line = d3
      .line<typeof chartData[0]>()
      .x(d => xScale(d.azimuth))
      .y(d => yScale(d.elevation))
      .curve(d3.curveCardinal);

    // Draw solar path line
    g.append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", "#fb923c")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Add points for each solar position
    g.selectAll(".solar-point")
      .data(chartData)
      .enter()
      .append("circle")
      .attr("class", "solar-point")
      .attr("cx", d => xScale(d.azimuth))
      .attr("cy", d => yScale(d.elevation))
      .attr("r", 4)
      .attr("fill", d => d.hitsCase ? "#ef4444" : "#10b981")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .append("title")
      .text(d =>
        `Time: ${formatTime(d.time)}\n` +
        `Azimuth: ${formatDegrees(d.azimuth)}\n` +
        `Elevation: ${formatDegrees(d.elevation)}\n` +
        `Hits Cave: ${d.hitsCase ? 'Yes' : 'No'}`
      );

    // Add cave orientation indicator
    const caveAzimuth = params.cave.orientation;
    const caveFieldOfView = Math.atan2(params.cave.width / 2, params.cave.depth) * 180 / Math.PI * 2;

    // Cave orientation line
    g.append("line")
      .attr("x1", xScale(caveAzimuth))
      .attr("y1", 0)
      .attr("x2", xScale(caveAzimuth))
      .attr("y2", height)
      .attr("stroke", "#8b5cf6")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Cave field of view area
    const fieldStart = caveAzimuth - caveFieldOfView / 2;
    const fieldEnd = caveAzimuth + caveFieldOfView / 2;

    g.append("rect")
      .attr("x", xScale(Math.max(0, fieldStart)))
      .attr("y", 0)
      .attr("width", xScale(Math.min(360, fieldEnd)) - xScale(Math.max(0, fieldStart)))
      .attr("height", height)
      .attr("fill", "#8b5cf6")
      .attr("opacity", 0.1);

    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${width - 150}, 20)`);

    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 4)
      .attr("fill", "#10b981")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1);

    legend.append("text")
      .attr("x", 10)
      .attr("y", 5)
      .text("Avoids Cave")
      .style("font-size", "12px")
      .attr("fill", "#374151");

    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 20)
      .attr("r", 4)
      .attr("fill", "#ef4444")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1);

    legend.append("text")
      .attr("x", 10)
      .attr("y", 25)
      .text("Hits Cave")
      .style("font-size", "12px")
      .attr("fill", "#374151");

    legend.append("line")
      .attr("x1", -5)
      .attr("y1", 40)
      .attr("x2", 5)
      .attr("y2", 40)
      .attr("stroke", "#8b5cf6")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    legend.append("text")
      .attr("x", 10)
      .attr("y", 45)
      .text("Cave Direction")
      .style("font-size", "12px")
      .attr("fill", "#374151");

  }, [chartData, params.cave]);

  return (
    <div className="w-full">
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded border">
          <div className="font-semibold text-black">Sunrise</div>
          <div className="text-gray-700">{formatTime(analysis.sunriseTime)}</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded border">
          <div className="font-semibold text-black">Solar Noon</div>
          <div className="text-gray-700">{formatTime(analysis.solarNoon)}</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded border">
          <div className="font-semibold text-black">Sunset</div>
          <div className="text-gray-700">{formatTime(analysis.sunsetTime)}</div>
        </div>
      </div>

      <div className="flex justify-center">
        <svg ref={svgRef} className="border border-gray-300 rounded bg-white"></svg>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded border">
        <p className="text-gray-700 leading-relaxed mb-2">
          <strong className="text-black">Visualization:</strong> This chart shows the sun's path throughout the day.
          Green points indicate times when sunlight avoids the cave entrance,
          while red points show when sunlight would directly hit the cave.
        </p>
        <p className="text-gray-600 leading-relaxed">
          The purple dashed line shows the cave's orientation, and the purple shaded area
          represents the cave's field of view based on its geometry.
        </p>
      </div>
    </div>
  );
}