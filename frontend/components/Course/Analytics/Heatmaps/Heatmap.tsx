import dynamic from "next/dynamic";
import React from "react";
import { HeatmapSeries } from "../../../../types";

interface HeatmapProps {
    series: HeatmapSeries[];
    chartTitle: string;
}

// Dynamic import because this library can only run on the browser and causes error when importing server side
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const toDisplayHour = (hourString: string) => {
    const hourDecimal = Number(hourString);
    const hour = Math.trunc(hourDecimal);
    const minutes = (hourDecimal % 1) * 60;

    const hourDisplay = hour % 12 !== 0 ? hour % 12 : 12;
    const minuteDisplay = minutes !== 0 ? `:${minutes}` : "";
    const amOrPmDisplay = hour < 12 ? "AM" : "PM";

    return `${hourDisplay}${minuteDisplay} ${amOrPmDisplay}`;
};

export default function Heatmap({ series, chartTitle }: HeatmapProps) {
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
                formatter: toDisplayHour,
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
