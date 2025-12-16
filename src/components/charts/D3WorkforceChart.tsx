import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface WorkforceData {
    date: string;
    totalWorkers: number;
    workersNeeded: number;
    capacityUtilization: number;
}

interface D3WorkforceChartProps {
    data: WorkforceData[];
}

export function D3WorkforceChart({ data }: D3WorkforceChartProps) {
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

        const margin = { top: 20, right: 40, left: 40, bottom: 30 };
        const width = dimensions.width - margin.left - margin.right;
        const height = dimensions.height - margin.top - margin.bottom;

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales
        const x = d3.scalePoint()
            .domain(data.map(d => d.date))
            .range([0, width])
            .padding(0); // scalePoint for lines usually has 0 padding at ends if we want edge-to-edge? 
        // Recharts 'monotone' usually goes through points.

        // Left Y Axis (Workers)
        const yLeft = d3.scaleLinear()
            .domain([0, d3.max(data, d => Math.max(d.totalWorkers, d.workersNeeded)) || 0])
            .nice()
            .range([height, 0]);

        // Right Y Axis (Capacity %)
        const yRight = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

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

        // Overlay for tooltip tracking
        // We can use a rect over existing areas or search nearest X.
        // Easiest is to use an overlay rect and find nearest data point.

        // Generators
        const areaTotal = d3.area<WorkforceData>()
            .x(d => x(d.date)!)
            .y0(height)
            .y1(d => yLeft(d.totalWorkers))
            .curve(d3.curveMonotoneX);

        const areaNeeded = d3.area<WorkforceData>()
            .x(d => x(d.date)!)
            .y0(height) // Or Line? Recharts used Area with fill="transparent" and dashed stroke.
            .y1(d => yLeft(d.workersNeeded))
            .curve(d3.curveMonotoneX);

        const areaCapacity = d3.area<WorkforceData>()
            .x(d => x(d.date)!)
            .y0(height)
            .y1(d => yRight(d.capacityUtilization))
            .curve(d3.curveMonotoneX);

        // Draw Capacity (Background layer)
        g.append("path")
            .datum(data)
            .attr("fill", "#818cf8") // Indigo/Interview color roughly
            .attr("fill-opacity", 0.3)
            .attr("d", areaCapacity);

        // Draw Total Workers (Main layer)
        g.append("path")
            .datum(data)
            .attr("fill", "#22c55e") // Green/Go Live
            .attr("fill-opacity", 0.7)
            .attr("stroke", "#22c55e")
            .attr("stroke-width", 2)
            .attr("d", areaTotal);

        // Draw Workers Needed (Dashed Line/Area)
        // Area with transparent fill
        g.append("path")
            .datum(data)
            .attr("fill", "transparent")
            .attr("stroke", "#eab308") // Yellow/Under Review
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "8,4")
            .attr("d", areaNeeded); // Note: area generator usage for stroke works if we only stroke the top line? 
        // d3.area generates a closed path. Stroking it strokes the bottom too.
        // We should use d3.line for the stroke of 'workersNeeded' and d3.area if we wanted fill.
        // The Recharts code had `fill="transparent"`, so it was effectively a line.
        // I will use d3.line instead for cleaner stroke.

        const lineNeeded = d3.line<WorkforceData>()
            .x(d => x(d.date)!)
            .y(d => yLeft(d.workersNeeded))
            .curve(d3.curveMonotoneX);

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#eab308")
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "8,4")
            .attr("d", lineNeeded);

        // Axes
        // X Axis (Show every nth label if crowded)
        const xAxis = d3.axisBottom(x)
            .tickValues(x.domain().filter((d, i) => i % 5 === 0)); // Filter ticks

        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .style("font-size", "11px")
            .style("color", "#64748b");

        // Left Y Axis
        g.append("g")
            .call(d3.axisLeft(yLeft).ticks(5))
            .style("font-size", "11px")
            .style("color", "#64748b");

        // Right Y Axis
        g.append("g")
            .attr("transform", `translate(${width},0)`)
            .call(d3.axisRight(yRight).ticks(5).tickFormat(d => d + "%"))
            .style("font-size", "11px")
            .style("color", "#64748b");

        // Tooltip Interaction overlay
        // Use a transparent rect to capture mouse events
        // And find the closest x point (bisector).

        // Create anbisector
        // We have scalePoint, so we can't invert easily.
        // We can use scaleQuantize or just find nearest index based on mouseX / step.
        const step = x.step();

        const overlay = g.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "transparent")
            .on("mousemove", (event) => {
                const [mouseX, mouseY] = d3.pointer(event);
                const index = Math.round(mouseX / step);
                const d = data[index];
                if (!d) return;

                const [containerX, containerY] = d3.pointer(event, containerRef.current);

                tooltip.style("visibility", "visible")
                    .style("left", (containerX + 10) + "px")
                    .style("top", (containerY - 10) + "px")
                    .html(`
                        <div class="font-bold mb-1">${d.date}</div>
                        <div style="color:#22c55e">Total Workers: ${d.totalWorkers}</div>
                        <div style="color:#eab308">Needed: ${d.workersNeeded}</div>
                        <div style="color:#818cf8">Capacity: ${d.capacityUtilization}%</div>
                    `);

                // Optional: Draw a vertical line at the cursor
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

    }, [data, dimensions]);

    return (
        <div ref={containerRef} className="w-full h-full relative">
            <svg ref={svgRef} width="100%" height="100%" style={{ overflow: 'visible' }} />
        </div>
    );
}
