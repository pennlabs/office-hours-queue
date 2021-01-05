import dynamic from "next/dynamic";
import React from "react";
import { HeatmapSeries } from "../../../../types";

interface HeatmapProps {
    series: HeatmapSeries[];
    chartTitle: string;
    metricName: string;
}

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Heatmap({
    series,
    chartTitle,
    metricName,
}: HeatmapProps) {
    const options = {
        chart: {
            height: 350,
            type: "heatmap",
        },
        dataLabels: {
            enabled: false,
        },
        colors: ["#008FFB"],
        title: {
            text: chartTitle,
        },
    };

    return (
        <Chart series={series} options={options} type="heatmap" height={350} />
    );
}
