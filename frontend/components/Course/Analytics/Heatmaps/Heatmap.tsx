import dynamic from "next/dynamic";
import React from "react";
import { HeatmapSeries } from "../../../../types";

interface HeatmapProps {
    series: HeatmapSeries[];
    chartTitle: string;
}

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const toDisplayHour = (hour: string) => {
    const hourNum = Number(hour);
    if (hourNum > 12) {
        return `${hourNum - 12} PM`;
    }
    if (hourNum === 0) {
        return "12 AM";
    }
    if (hourNum === 12) {
        return "12 PM";
    }
    return `${hourNum} AM`;
};

export default function Heatmap({ series, chartTitle }: HeatmapProps) {
    const options = {
        dataLabels: {
            enabled: false,
        },
        colors: ["#4285f5"],
        title: {
            text: chartTitle,
        },
        chart: {
            toolbar: {
                tools: {
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false,
                },
                export: {
                    csv: {
                        // TODO: some export settings to make sure this doesn't break
                    },
                },
            },
        },
        xaxis: {
            type: "category",
            labels: {
                formatter: toDisplayHour,
            },
            title: {
                text: "Hour (EDT)",
                offsetY: 10,
            },
        },
        responsive: [
            {
                breakpoint: 600,
                options: {},
            },
        ],
    };

    return series.length !== 0 ? (
        <Chart series={series} options={options} type="heatmap" height={350} />
    ) : (
        <div>No data available</div>
    );
}
