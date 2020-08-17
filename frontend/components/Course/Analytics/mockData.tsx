import React from "react";
import { Bar } from "react-chartjs-2";

// ---Labels---//
export const dateLabels = [
    new Date("December 10, 2019 10:12"),
    new Date("December 18, 2019 20:12"),
    new Date("December 20, 2019 1:03"),
    new Date("December 22, 2019 3:45"),
    new Date("December 25, 2019 14:21"),
];

// ---Data---//
export const DashboardBarChart = () => {
    const data = {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [
            {
                label: "# of Questions",
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(255, 206, 86, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(153, 102, 255, 0.2)",
                    "rgba(255, 159, 64, 0.2)",
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)",
                ],
                borderWidth: 1,
            },
        ],
        options: {
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                        },
                    },
                ],
            },
        },
    };
    return <Bar data={data} />;
};

export const data4 = {
    labels: ["algorithms", "dijkstra", "dfs", "graphs", "runtime", "sorting"],
    datasets: [
        {
            label: "# of Questions",
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
        },
    ],
};

export const options4 = {
    type: "bar",
    data: data4,
    options: {
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                    },
                },
            ],
        },
    },
};

export const data = {
    // Labels should be Date objects
    labels: dateLabels,
    datasets: [
        {
            fill: false,
            label: "Main Queue",
            data: [20, 11, 15, 3, 10, 8],
            borderColor: "#3e95cd",
            backgroundColor: "#3e95cd",
            lineTension: 0,
        },
        {
            fill: false,
            label: "Debugging Queue",
            data: [12, 7, 9, 11, 4, 19],
            borderColor: "#3cba9f",
            backgroundColor: "#3cba9f",
            lineTension: 0,
        },
    ],
};

export const options = {
    type: "line",
    data,
    options: {
        fill: false,
        responsive: true,
        scales: {
            xAxes: [
                {
                    type: "time",
                    time: {
                        displayFormats: {
                            hour: "MMM D hA",
                        },
                    },
                    // display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Date",
                    },
                },
            ],
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                    },
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Number of Students",
                    },
                },
            ],
        },
    },
};

export const data2 = {
    // Labels should be Date objects
    labels: dateLabels,
    datasets: [
        {
            fill: false,
            label: "Page Views",
            data: [280, 250, 340],
            borderColor: "#3e95cd",
            backgroundColor: "#3e95cd",
            lineTension: 0,
        },
    ],
};

export const options2 = {
    type: "line",
    data: data2,
    options: {
        fill: false,
        responsive: true,
        scales: {
            xAxes: [
                {
                    type: "time",
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Date",
                    },
                },
            ],
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                    },
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Page Views",
                    },
                },
            ],
        },
    },
};

export const data3 = {
    labels: ["Homework", "Lecture", "Exam", "Project", "Other"],
    datasets: [
        {
            label: "Questions by Tag",
            backgroundColor: [
                "#3e95cd",
                "#8e5ea2",
                "#3cba9f",
                "#e8c3b9",
                "#c45850",
            ],
            data: [2478, 5267, 734, 784, 433],
        },
    ],
};

export const options3 = {
    type: "pie",
    data: data3,
    options: {
        title: {
            display: true,
            text: "Tag Categories",
        },
    },
};
