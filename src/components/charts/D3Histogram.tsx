import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface HistogramData {
    range: string;
    count: number;
    color: string;
}

interface D3HistogramProps {
    data: HistogramData[];
}

export function D3Histogram({ data }: D3HistogramProps) {
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
        const x = d3.scaleBand()
            .domain(data.map(d => d.range))
            .range([0, width])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.count) || 0])
            .nice()
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

        // Bars
        g.selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", d => x(d.range)!)
            .attr("y", d => y(d.count))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.count))
            .attr("fill", d => d.color)
            .attr("rx", 4) // Rounded top corners simulated? No, standard rect.
            // SVG rect rx/ry rounds all corners.
            // If we want only top corners rounded, we need a path or clip path.
            // For now, simple rect is fine matching Recharts default or slight radius.
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible")
                    .html(`
                        <div class="font-bold mb-1">Time to Hire</div>
                        <div>Range: ${d.range}</div>
                        <div>Count: ${d.count}</div>
                    `);
                d3.select(event.currentTarget).attr("opacity", 0.8);
            })
            .on("mousemove", (event) => {
                const [mouseX, mouseY] = d3.pointer(event, containerRef.current);
                tooltip
                    .style("left", (mouseX + 10) + "px")
                    .style("top", (mouseY - 10) + "px");
            })
            .on("mouseout", (event) => {
                tooltip.style("visibility", "hidden");
                d3.select(event.currentTarget).attr("opacity", 1);
            });

        // Axes
        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .style("font-size", "11px")
            .style("color", "#64748b");

        g.append("g")
            .call(d3.axisLeft(y).ticks(5))
            .style("font-size", "11px")
            .style("color", "#64748b");

        // Grid
        g.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat(() => "")
            )
            .style("stroke-dasharray", "3,3")
            .style("stroke-opacity", 0.1)
            .select(".domain").remove();

    }, [data, dimensions]);

    return (
        <div ref={containerRef} className="w-full h-full relative">
            <svg ref={svgRef} width="100%" height="100%" style={{ overflow: 'visible' }} />
        </div>
    );
}
