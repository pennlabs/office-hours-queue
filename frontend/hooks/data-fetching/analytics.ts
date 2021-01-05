import { useResource } from "@pennlabs/rest-hooks";
import useSwr from "swr";
import { HeatmapSeries, AnalyticsData, Metric, DayOfWeek } from "../../types";

export const useHeatmapData = (
    courseId: number,
    queueId: number,
    type: Metric
) => {
    // This doesn't work and always returns undefined data and isValidating false (#｀-_ゝ-)
    // const { data, isValidating } = useResource<AnalyticsData>(
    //     `/courses/${courseId}/queues/${queueId}/statistics/?metric=${type}`,
    // );
    // console.log(data, isValidating)

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
                throw new Error(`Invalid day ${day}`);
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
