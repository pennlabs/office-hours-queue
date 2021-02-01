import useSwr from "swr";
import { HeatmapSeries, AnalyticsData, Metric, DayOfWeek } from "../../types";
import { logException } from "../../utils/sentry";

export const useHeatmapData = (
    courseId: number,
    queueId: number,
    type: Metric
) => {
    const { data, error, isValidating } = useSwr<AnalyticsData>(
        `/courses/${courseId}/queues/${queueId}/statistics/?metric=${type}`
    );

    if (data) {
        if (data.length === 0) {
            return { data: [], error, isValidating }; // No data available
        }

        // Parse data to format it according to requirements of apexcharts heatmap
        const initialValue: Map<DayOfWeek, HeatmapSeries> = new Map();
        for (let day = 0; day < 7; day += 1) {
            initialValue.set(day, {
                name: DayOfWeek[day],
                data: [],
            });
        }

        const seriesDataMap = data.reduce((acc, { day, hour, value }) => {
            if (acc.has(day)) {
                acc.get(day)!.data.push({
                    x: hour.toString(),
                    y: Number(value),
                });
            } else {
                logException(new Error(`Invalid day ${day}`));
            }
            return acc;
        }, initialValue);

        seriesDataMap.forEach((unsortedSeries) => {
            unsortedSeries.data.sort((e1, e2) => Number(e1.x) - Number(e2.x));
        });

        return {
            data: Array.from(seriesDataMap.values()),
            error,
            isValidating,
        };
    }

    return { data, error, isValidating };
};
