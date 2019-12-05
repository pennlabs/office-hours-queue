//fake question data for queue page
var fakeMainQueue = {
  name: "Main Queue",
  description: "For questions about homework, lectures, recitation, etc.",
  estimatedWaitTime: "30-40 mins",
  tags: ["graphs", "algorithms", "sorting", "runtime"],
  questions: [
    {
      asker: "Monal Garg",
      timeAsked: "5:46 pm",
      text: "I am wondering about how to implement the logic for the Widest path algorithm using BFS and Kruskal",
      tags: ["graphs", "algorithms"]
    },
    {
      asker: "Karen Shen",
      timeAsked: "5:53 pm",
      text: "How do I calculate the runtime of QuickSort?",
      tags: ["sorting", "runtime"]
    }
  ]
};

  var fakeDebuggingQueue = {
    name: "Debugging Queue",
    description: "For questions about debugging (we will not debug for you!)",
    estimatedWaitTime: "50-60 mins",
    tags: ["hw3", "dijkstra", "dfs"],
    questions: [
      {
        asker: "Steven Bursztyn",
        timeAsked: "5:43 pm",
        text: "debugging dijkstras",
        tags: ["hw3", "dijkstra"]
      },
      {
        asker: "Chris Fischer",
        timeAsked: "5:45 pm",
        text: "testing diljkstra (nulllPointer)",
        tags: ["hw3", "dijkstra"]
      },
      {
        asker: "Marshall Vail",
        timeAsked: "5:45 pm",
        text: "dfs infinite loop",
        tags: ["hw3", "dfs"]
      }
  ]
}

var fakeCourse = {
  name: "121",
  department: "CIS",
  description: "Introduction to Data Structures and Algorithms",
  year: 2019,
  semester: "Fall",
  isArchived: false,
  queues: [fakeMainQueue, fakeDebuggingQueue]
}

  export { fakeCourse };
