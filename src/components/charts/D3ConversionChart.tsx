import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface ConversionData {
    week: string;
    applied: number;
    hired: number;
    rate: number;
}

interface D3ConversionChartProps {
    data: ConversionData[];
    colors: {
        applied: string;
        rate: string;
    };
}

export function D3ConversionChart({ data, colors }: D3ConversionChartProps) {
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
            .domain(data.map(d => d.week))
            .range([0, width])
            .padding(0.1);

        const yLeft = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.applied) || 0])
            .nice()
            .range([height, 0]);

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

        // Area (Applied)
        const areaApplied = d3.area<ConversionData>()
            .x(d => x(d.week)!)
            .y0(height)
            .y1(d => yLeft(d.applied))
            .curve(d3.curveMonotoneX);

        g.append("path")
            .datum(data)
            .attr("fill", colors.applied)
            .attr("fill-opacity", 0.3)
            .attr("stroke", colors.applied)
            .attr("stroke-width", 1)
            .attr("d", areaApplied);

        // Line (Rate)
        const lineRate = d3.line<ConversionData>()
            .x(d => x(d.week)!)
            .y(d => yRight(d.rate))
            .curve(d3.curveMonotoneX);

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", colors.rate)
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "4,4") // Make it dashed/dotted to match "dot" prop in existing? 
            // Existing had dot={{ r: 4 }}, solid line.
            // I'll make it solid with dots.
            .attr("d", lineRate);

        // Dots
        g.selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", d => x(d.week)!)
            .attr("cy", d => yRight(d.rate))
            .attr("r", 4)
            .attr("fill", colors.rate);

        // Axes
        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .style("font-size", "11px")
            .style("color", "#64748b");

        g.append("g")
            .call(d3.axisLeft(yLeft).ticks(5))
            .style("font-size", "11px")
            .style("color", "#64748b");

        g.append("g")
            .attr("transform", `translate(${width},0)`)
            .call(d3.axisRight(yRight).ticks(5).tickFormat(d => d + "%"))
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

                tooltip.style("visibility", "visible")
                    .style("left", (containerX + 10) + "px")
                    .style("top", (containerY - 10) + "px")
                    .html(`
                        <div class="font-bold mb-1">${d.week}</div>
                        <div style="color:${colors.applied}">Applied: ${d.applied}</div>
                        <div style="color:${colors.rate}">Rate: ${d.rate}%</div>
                    `);

                g.selectAll(".cursor-line").remove();
                g.append("line")
                    .attr("class", "cursor-line")
                    .attr("x1", x(d.week)!)
                    .attr("x2", x(d.week)!)
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
