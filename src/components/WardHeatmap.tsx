import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HeatmapProps {
  data: { ward_id: string; count: number }[];
}

export default function WardHeatmap({ data }: HeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.ward_id))
      .padding(0.1);

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, d => d.count) || 10]);

    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
      .domain([0, d3.max(data, d => d.count) || 10]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    g.append("g")
      .call(d3.axisLeft(y));

    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.ward_id) || 0)
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.count))
      .attr("height", d => height - y(d.count))
      .attr("fill", d => colorScale(d.count))
      .attr("rx", 4)
      .style("opacity", 0)
      .transition()
      .duration(800)
      .style("opacity", 1);

  }, [data]);

  return (
    <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
      <h3 className="text-xs font-mono uppercase tracking-wider text-black/50 mb-4">Ward Density Heatmap</h3>
      <svg ref={svgRef} width="100%" height="300" viewBox="0 0 400 300"></svg>
    </div>
  );
}
