import dynamic from "next/dynamic";
import React from "react";
import { HeatmapSeries } from "../../../../types";

interface HeatmapProps {
    series: HeatmapSeries[];
    chartTitle: string;
}

// Dynamic import because this library can only run on the browser and causes error when importing server side
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const toDisplayHour = (hour: number, localDate: Date) => {
    localDate.setUTCHours(hour);
    const localHour = localDate.getHours();

    if (localHour > 12) {
        return `${localHour - 12} PM`;
    }
    if (localHour === 0) {
        return "12 AM";
    }
    if (localHour === 12) {
        return "12 PM";
    }
    return `${localHour} AM`;
};

export default function Heatmap({ series, chartTitle }: HeatmapProps) {
    const currentLocalDate = new Date();
    const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
                formatter: (hour: string) =>
                    toDisplayHour(Number(hour), currentLocalDate),
            },
            title: {
                text: `Hour (${timeZoneName})`,
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
        <Chart series={series} options={options} type="heatmap" height={350} />
    ) : (
        <div>No data available</div>
    );
}
