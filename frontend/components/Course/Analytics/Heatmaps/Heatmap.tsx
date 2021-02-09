import dynamic from "next/dynamic";
import React from "react";
import { Segment } from "semantic-ui-react";
import { HeatmapSeries } from "../../../../types";

interface HeatmapProps {
    series: HeatmapSeries[];
    chartTitle: string;
}

// Dynamic import because this library can only run on the browser and causes error when importing server side
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
        colors: ["#2185d0"],
        shadeIntensity: 1,
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
                    download: false,
                },
                export: {
                    csv: {
                        //  TODO: adjust csv export settings to make sure this doesn't break and set download: true
                    },
                },
            },
            foreColor: "#1B1C1D",
            fontFamily: "Lato, 'Helvetica Neue', Arial, Helvetica, sans-serif",
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
        plotOptions: {
            heatmap: {
                radius: 0,
            },
        },
        stroke: {
            colors: ["#E5E5E5"],
        },
    };

    return series.length !== 0 ? (
        <div>
            <Chart
                series={series}
                options={options}
                type="heatmap"
                height={350}
            />
        </div>
    ) : (
        <Segment placeholder>No data available</Segment>
    );
}
