//fake question data for queue page
var fakeMainQueue = {
  title: "Main Queue",
  questions: [
    {
      asker: "Monal Garg",
      time_asked: "5:46 pm",
      text: "I am wondering about how to implement the logic for the Widest path algorithm using BFS and Kruskal",
      tags: ["graphs", "algorithms"],
      isAnswered: false,
      isDeleted: false
    },
    {
        asker: "Karen Shen",
        time_asked: "5:53 pm",
        text: "How do I calculate the runtime of QuickSort?",
        tags: ["sorting", "runtime"],
        isAnswered: false,
        isDeleted: false
    }
  ]
};

  var fakeDebuggingQueue = {
    title: "Debugging Queue",
    questions: [
    {
        asker: "Steven Bursztyn",
        time_asked: "5:43 pm",
        text: "debugging dijkstras",
        tags: ["hw3", "dijkstra"],
        isAnswered: false,
        isDeleted: false
    },
    {
        asker: "Chris Fischer",
        time_asked: "5:45 pm",
        text: "testing diljkstra (nulllPointer)",
        tags: ["hw3", "dijkstra"],
        isAnswered: false,
        isDeleted: false
    },
    {
        asker: "Marshall Vail",
        time_asked: "5:45 pm",
        text: "dfs infinite loop",
        tags: ["hw3", "dfs"],
        isAnswered: false,
        isDeleted: false
    }
  ]
}

  export { fakeMainQueue, fakeDebuggingQueue };
