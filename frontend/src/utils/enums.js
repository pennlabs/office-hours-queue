export const semesterOptions = [
  {
    key: 0,
    text: "Fall",
    value: "FALL"
  },
  {
    key: 1,
    text: "Spring",
    value: "SPRING"
  },
  {
    key: 2,
    text: "Summer",
    value: "SUMMER"
  }
];

export function prettifySemester(semester) {
  return semesterOptions.find((o) => o.value === semester).text;
}

export const roleOptions = [
  {
    key: 0,
    value: "PROFESSOR",
    text: "Professor"
  },
  {
    key: 1,
    value: "HEAD_TA",
    text: "Head TA"
  },
  {
    key: 2,
    value: "TA",
    text: "TA"
  },
  {
    key: 3,
    value: "STUDENT",
    text: "Student"
  }
];

export const staffRoleOptions = [
  {
    key: 0,
    value: "PROFESSOR",
    text: "Professor"
  },
  {
    key: 1,
    value: "HEAD_TA",
    text: "Head TA"
  },
  {
    key: 2,
    value: "TA",
    text: "TA"
  }
];

export function prettifyRole(role) {
  return roleOptions.find((o) => o.value === role).text;
}

export function isLeadershipRole(role) {
  return ['PROFESSOR', 'HEAD_TA'].indexOf(role) >= 0;
}
