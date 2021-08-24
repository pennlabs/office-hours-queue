import dynamic from "next/dynamic";
import React from "react";
import { positiveMod } from "../../../../hooks/data-fetching/analytics";
import { HeatmapSeries } from "../../../../types";

interface HeatmapProps {
    series: HeatmapSeries[];
    chartTitle: string;
}

// Dynamic import because this library can only run on the browser and causes error when importing server side
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const toDisplayHour = (isPositiveOffset: boolean, hourString: string) => {
    const hourDecimal = Number(hourString);
    let hour = Math.trunc(hourDecimal);
    let minutes = (hourDecimal % 1) * 60;
    if (minutes !== 0 && !isPositiveOffset) {
        minutes = 60 - minutes;
        hour = positiveMod(hour - 1, 24);
    }

    const minuteDisplay = minutes !== 0 ? `:${minutes}` : "";

    if (hour > 12) {
        return `${hour - 12}${minuteDisplay} PM`;
    }
    if (hour === 0) {
        return `12${minuteDisplay} AM`;
    }
    if (hour === 12) {
        return `12${minuteDisplay} PM`;
    }
    return `${hour}${minuteDisplay} AM`;
};

export default function Heatmap({ series, chartTitle }: HeatmapProps) {
    const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isPositiveUtcOffset = -new Date().getTimezoneOffset() > 0;

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
                    toDisplayHour(isPositiveUtcOffset, hour),
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
