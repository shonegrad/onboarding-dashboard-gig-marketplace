import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface PipelineData {
    date: string;
    applications: number;
    screenings: number;
    interviews: number;
    trainingCompletions: number;
    newHires: number;
    [key: string]: string | number;
}

interface D3PipelineChartProps {
    data: PipelineData[];
    colors: {
        applications: string;
        screenings: string;
        interviews: string;
        trainingCompletions: string;
        newHires: string;
    };
}

export function D3PipelineChart({ data, colors }: D3PipelineChartProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver(entries => {
            if (!entries || entries.length === 0) return;
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (!svgRef.current || !data || dimensions.width === 0 || dimensions.height === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const margin = { top: 20, right: 30, left: 40, bottom: 30 };
        const width = dimensions.width - margin.left - margin.right;
        const height = dimensions.height - margin.top - margin.bottom;

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales
        const x = d3.scalePoint()
            .domain(data.map(d => d.date))
            .range([0, width])
            .padding(0);

        const keys = ['applications', 'screenings', 'interviews', 'trainingCompletions', 'newHires'];

        const stack = d3.stack<PipelineData>()
            .keys(keys);

        const layers = stack(data);

        const y = d3.scaleLinear()
            .domain([0, d3.max(layers, layer => d3.max(layer, d => d[1])) || 0])
            .nice()
            .range([height, 0]);

        // Areas
        const area = d3.area<d3.SeriesPoint<PipelineData>>()
            .x(d => x(d.data.date)!)
            .y0(d => y(d[0]))
            .y1(d => y(d[1]))
            .curve(d3.curveMonotoneX);

        // Tooltip
        const tooltip = d3.select(containerRef.current)
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "white")
            .style("border", "1px solid #e2e8f0")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("z-index", "10");

        // Color mapping
        const colorMap: Record<string, string> = colors;

        // Draw Layers
        g.selectAll("path")
            .data(layers)
            .join("path")
            .attr("d", area)
            .attr("fill", d => colorMap[d.key])
            .attr("fill-opacity", 0.8);

        // Axes
        const xAxis = d3.axisBottom(x)
            .tickValues(x.domain().filter((d, i) => i % 5 === 0));

        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .style("font-size", "11px")
            .style("color", "#64748b");

        g.append("g")
            .call(d3.axisLeft(y).ticks(5))
            .style("font-size", "11px")
            .style("color", "#64748b");

        // Interaction
        const step = x.step();
        g.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "transparent")
            .on("mousemove", (event) => {
                const [mouseX, mouseY] = d3.pointer(event);
                const index = Math.round(mouseX / step);
                const d = data[index];
                if (!d) return;

                const [containerX, containerY] = d3.pointer(event, containerRef.current);

                let tooltipHtml = `<div class="font-bold mb-1">${d.date}</div>`;
                keys.reverse().forEach(key => {
                    tooltipHtml += `<div class="flex items-center gap-2"><div style="width:8px;height:8px;background:${colors[key as keyof typeof colors]}"></div>${key}: ${d[key]}</div>`;
                });
                keys.reverse(); // Restore order

                tooltip.style("visibility", "visible")
                    .style("left", (containerX + 10) + "px")
                    .style("top", (containerY - 10) + "px")
                    .html(tooltipHtml);

                g.selectAll(".cursor-line").remove();
                g.append("line")
                    .attr("class", "cursor-line")
                    .attr("x1", x(d.date)!)
                    .attr("x2", x(d.date)!)
                    .attr("y1", 0)
                    .attr("y2", height)
                    .attr("stroke", "#94a3b8")
                    .attr("stroke-dasharray", "2,2");
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
                g.selectAll(".cursor-line").remove();
            });

    }, [data, dimensions, colors]);

    return (
        <div ref={containerRef} className="w-full h-full relative">
            <svg ref={svgRef} width="100%" height="100%" style={{ overflow: 'visible' }} />
        </div>
    );
}
