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
