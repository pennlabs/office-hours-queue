//fake course data for dashboard page
var fakeCourseUsers = [
  {
    course: {
      name: "CIS 320",
      department: "CIS",
      description: "Algorithms",
      isArchived: false,
      year: 2019,
      semester: "FALL",
      totalQueues: "1",
      openQueues: "0",
    },
    kind: "STUDENT"
  },
  {
    course: {
      name: "CIS 380",
      department: "CIS",
      description: "Operating Systems",
      isArchived: false,
      year: 2019,
      semester: "FALL",
      totalQueues: "1",
      openQueues: "1",
    },
    kind: "STUDENT"
  },
  {
    course: {
      name: "CIS 121",
      department: "CIS",
      description: "Intro to Data Structures and Algorithms",
      isArchived: false,
      year: 2019,
      semester: "FALL",
      totalQueues: "2",
      openQueues: "1",
    },
    kind: "TA"
  },
  {
    course: {
      name: "CIS 121",
      department: "CIS",
      description: "Intro to Data Structures and Algorithms",
      isArchived: true,
      year: 2018,
      semester: "SPRING",
      totalQueues: "0",
      openQueues: "0",
    },
    kind: "TA"
  }
];

var fakeSearchCourses = [
  {
    name: "CIS 545",
    department: "CIS",
    description: "Big Data Analytics",
    isArchived: false,
    year: 2019,
    semester: "FALL",
    totalQueues: "1",
    openQueues: "1"
  },
  {
    name: "CIS 550",
    department: "CIS",
    description: "Databases",
    isArchived: false,
    year: 2019,
    semester: "FALL",
    totalQueues: "1",
    openQueues: "2"
  }
]

export { fakeCourseUsers, fakeSearchCourses };
