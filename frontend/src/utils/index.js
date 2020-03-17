import {useQuery} from "@apollo/react-hooks";

export function isValidEmail(email) {
  const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return pattern.test(email)
}

export function useImperativeQuery(query) {
  const { refetch } = useQuery(query, { skip: true });
  return (variables) => {
    return refetch(variables);
  };
}

export function leadershipSortFunc(a, b) {
  if (a.user.fullName !== b.user.fullName) {
    return a.fullName < b.fullName;
  }
  if (a.kind !== b.kind) {
    return a.kind > b.kind;
  }
  return a.user.email < b.user.email;
}
