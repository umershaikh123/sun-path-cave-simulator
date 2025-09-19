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

    // Add direction arrows along the path
    if (chartData.length > 1) {
      const numArrows = 5; // Number of direction arrows
      const arrowSpacing = Math.floor(chartData.length / numArrows);

      for (let i = arrowSpacing; i < chartData.length - arrowSpacing; i += arrowSpacing) {
        const current = chartData[i];
        const next = chartData[Math.min(i + 1, chartData.length - 1)];

        const x1 = xScale(current.azimuth);
        const y1 = yScale(current.elevation);
        const x2 = xScale(next.azimuth);
        const y2 = yScale(next.elevation);

        // Calculate arrow direction
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowLength = 8;
        const arrowAngle = Math.PI / 6; // 30 degrees

        // Arrow shaft
        const arrowX = x1 + (x2 - x1) * 0.5;
        const arrowY = y1 + (y2 - y1) * 0.5;

        // Arrow head points
        const arrowHead1X = arrowX - arrowLength * Math.cos(angle - arrowAngle);
        const arrowHead1Y = arrowY - arrowLength * Math.sin(angle - arrowAngle);
        const arrowHead2X = arrowX - arrowLength * Math.cos(angle + arrowAngle);
        const arrowHead2Y = arrowY - arrowLength * Math.sin(angle + arrowAngle);

        // Draw arrow
        g.append("line")
          .attr("x1", arrowHead1X)
          .attr("y1", arrowHead1Y)
          .attr("x2", arrowX)
          .attr("y2", arrowY)
          .attr("stroke", "#fb923c")
          .attr("stroke-width", 2);

        g.append("line")
          .attr("x1", arrowHead2X)
          .attr("y1", arrowHead2Y)
          .attr("x2", arrowX)
          .attr("y2", arrowY)
          .attr("stroke", "#fb923c")
          .attr("stroke-width", 2);
      }
    }

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

    // Add start point marker (sunrise)
    if (chartData.length > 0) {
      const startPoint = chartData[0];
      g.append("circle")
        .attr("cx", xScale(startPoint.azimuth))
        .attr("cy", yScale(startPoint.elevation))
        .attr("r", 8)
        .attr("fill", "#22c55e")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2);

      g.append("text")
        .attr("x", xScale(startPoint.azimuth))
        .attr("y", yScale(startPoint.elevation) - 15)
        .attr("text-anchor", "middle")
        .attr("fill", "#1f2937")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("START");
    }

    // Add end point marker (sunset)
    if (chartData.length > 0) {
      const endPoint = chartData[chartData.length - 1];
      g.append("circle")
        .attr("cx", xScale(endPoint.azimuth))
        .attr("cy", yScale(endPoint.elevation))
        .attr("r", 8)
        .attr("fill", "#dc2626")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2);

      g.append("text")
        .attr("x", xScale(endPoint.azimuth))
        .attr("y", yScale(endPoint.elevation) - 15)
        .attr("text-anchor", "middle")
        .attr("fill", "#1f2937")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("END");
    }

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

    // Start point
    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 6)
      .attr("fill", "#22c55e")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1);

    legend.append("text")
      .attr("x", 12)
      .attr("y", 5)
      .text("Start (Sunrise)")
      .style("font-size", "12px")
      .attr("fill", "#374151");

    // End point
    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 22)
      .attr("r", 6)
      .attr("fill", "#dc2626")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1);

    legend.append("text")
      .attr("x", 12)
      .attr("y", 27)
      .text("End (Sunset)")
      .style("font-size", "12px")
      .attr("fill", "#374151");

    // Avoids cave
    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 44)
      .attr("r", 4)
      .attr("fill", "#10b981")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1);

    legend.append("text")
      .attr("x", 12)
      .attr("y", 49)
      .text("Avoids Cave")
      .style("font-size", "12px")
      .attr("fill", "#374151");

    // Hits cave
    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 66)
      .attr("r", 4)
      .attr("fill", "#ef4444")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1);

    legend.append("text")
      .attr("x", 12)
      .attr("y", 71)
      .text("Hits Cave")
      .style("font-size", "12px")
      .attr("fill", "#374151");

    // Cave direction
    legend.append("line")
      .attr("x1", -5)
      .attr("y1", 88)
      .attr("x2", 5)
      .attr("y2", 88)
      .attr("stroke", "#8b5cf6")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    legend.append("text")
      .attr("x", 12)
      .attr("y", 93)
      .text("Cave Direction")
      .style("font-size", "12px")
      .attr("fill", "#374151");

    // Direction arrows
    legend.append("line")
      .attr("x1", -3)
      .attr("y1", 110)
      .attr("x2", 3)
      .attr("y2", 110)
      .attr("stroke", "#fb923c")
      .attr("stroke-width", 2);

    legend.append("line")
      .attr("x1", 1)
      .attr("y1", 108)
      .attr("x2", 3)
      .attr("y2", 110)
      .attr("stroke", "#fb923c")
      .attr("stroke-width", 2);

    legend.append("line")
      .attr("x1", 1)
      .attr("y1", 112)
      .attr("x2", 3)
      .attr("y2", 110)
      .attr("stroke", "#fb923c")
      .attr("stroke-width", 2);

    legend.append("text")
      .attr("x", 12)
      .attr("y", 115)
      .text("Sun Direction")
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
          <strong className="text-black">Visualization:</strong> This chart shows the sun's path throughout the day with directional indicators.
          The <strong className="text-green-600">green START</strong> marker shows sunrise position,
          the <strong className="text-red-600">red END</strong> marker shows sunset position,
          and orange arrows indicate the sun's movement direction.
        </p>
        <p className="text-gray-600 leading-relaxed mb-2">
          Green points indicate times when sunlight avoids the cave entrance,
          while red points show when sunlight would directly hit the cave.
        </p>
        <p className="text-gray-600 leading-relaxed mb-2">
          The purple dashed line shows the cave's orientation, and the purple shaded area
          represents the cave's field of view based on its geometry.
        </p>
        <div className="p-2 bg-blue-50 rounded border border-blue-200 mt-3">
          <p className="text-blue-800 text-sm leading-relaxed">
            <strong>Quranic Context:</strong> The verse describes the sun inclining "to the right" at sunrise and "to the left" at sunset.
            Try setting the cave orientation to <strong>0° (North)</strong> or <strong>180° (South)</strong>
            to better match this directional description.
          </p>
        </div>
      </div>
    </div>
  );
}