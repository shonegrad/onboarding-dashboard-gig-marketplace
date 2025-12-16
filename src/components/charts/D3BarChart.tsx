import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface ChartData {
    stage: string;
    current: number;
    progressed: number;
    total: number;
    color: string;
    progressColor: string;
}

interface D3BarChartProps {
    data: ChartData[];
    onBarClick?: (data: ChartData) => void;
}

export function D3BarChart({ data, onBarClick }: D3BarChartProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Resize observer
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

    // Draw chart
    useEffect(() => {
        if (!svgRef.current || !data || dimensions.width === 0 || dimensions.height === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous

        const margin = { top: 20, right: 30, left: 40, bottom: 30 };
        const width = dimensions.width - margin.left - margin.right;
        const height = dimensions.height - margin.top - margin.bottom;

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales
        const x = d3.scaleBand()
            .domain(data.map(d => d.stage))
            .range([0, width])
            .padding(0.3);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.total) || 0])
            .nice()
            .range([height, 0]);

        // Stack the data
        // keys: ['current', 'progressed']
        const stack = d3.stack<ChartData>()
            .keys(['current', 'progressed']);

        const stackedData = stack(data);

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

        // Prepare colors
        // We need to access color from data, but stackedData groups by key, not by bar.
        // However, we can use the index of the bar to lookup the color in original data.

        // Render Bars
        g.selectAll("g.layer")
            .data(stackedData)
            .join("g")
            .attr("class", "layer")
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("x", (d) => x(d.data.stage)!)
            .attr("y", d => y(d[1])) // Start at the top of the segment
            .attr("height", d => y(d[0]) - y(d[1])) // Height is difference between bottom and top
            .attr("width", x.bandwidth())
            .attr("fill", (d, i, nodes) => {
                // Determine which layer this is
                // The parent group data has the key ('current' or 'progressed')
                const key = d3.select(nodes[i].parentNode as Element).datum() as any;
                const layerKey = key.key;

                // data.color is for 'current', data.progressColor is for 'progressed'
                // Wait, 'progressed' is usually the lighter one in the mock data?
                // Let's check stageData in ManagerView.
                // current: color (e.g. blue)
                // progressed: progressColor (e.g. light blue)
                // Actually, typically 'current' is the main part, 'progressed' is the 'moved on' part.
                // Let's see usage in Recharts... it wasn't shown explicitly but usually Stacked.

                if (layerKey === 'current') return d.data.color;
                return d.data.progressColor;
            })
            .style("cursor", onBarClick ? "pointer" : "default")
            .on("mouseover", (event, d) => {
                const total = d.data.total;
                const current = d.data.current;
                const progressed = d.data.progressed;

                tooltip.style("visibility", "visible")
                    .html(`
                        <div class="font-bold mb-1">${d.data.stage}</div>
                        <div>Remaining: ${current}</div>
                        <div>Progressed: ${progressed}</div>
                        <div class="mt-1 pt-1 border-t text-xs text-gray-500">Total: ${total}</div>
                    `);
            })
            .on("mousemove", (event) => {
                // Calculate position relative to container
                const [mouseX, mouseY] = d3.pointer(event, containerRef.current);
                tooltip
                    .style("left", (mouseX + 10) + "px")
                    .style("top", (mouseY - 10) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
            })
            .on("click", (event, d) => {
                if (onBarClick) onBarClick(d.data);
            });

        // Axes
        const xAxis = d3.axisBottom(x);
        const yAxis = d3.axisLeft(y).ticks(5);

        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .style("font-size", "11px")
            .style("color", "#64748b"); // slate-500

        g.append("g")
            .call(yAxis)
            .style("font-size", "11px")
            .style("color", "#64748b");

        // Grid lines?
        g.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat(() => "")
            )
            .style("stroke-dasharray", "3,3")
            .style("stroke-opacity", 0.1)
            .select(".domain").remove();

    }, [data, dimensions, onBarClick]);

    return (
        <div ref={containerRef} className="w-full h-full relative">
            <svg ref={svgRef} width="100%" height="100%" style={{ overflow: 'visible' }} />
        </div>
    );
}
