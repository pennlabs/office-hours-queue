import useSwr from "swr";
import { HeatmapSeries, AnalyticsData, Metric, DayOfWeek } from "../../types";

const initialData: AnalyticsData = [];

export const useHeatmapData = (
    courseId: number,
    queueId: number,
    type: Metric
) => {
    const { data } = useSwr(
        `/courses/${courseId}/queues/${queueId}/statistics/?metric=${type}`,
        {
            initialData,
        }
    );

    if (data && data.length) {
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
                    x: hour,
                    y: Number(value),
                });
            } else {
                throw new Error(`Invalid day ${day}`);
            }
            return acc;
        }, initialValue);

        seriesDataMap.forEach((unsortedSeries) =>
            unsortedSeries.data.sort((e1, e2) => e1.x - e2.x)
        );

        return Array.from(seriesDataMap.values());
    } else {
        return data as undefined;
    }
};
