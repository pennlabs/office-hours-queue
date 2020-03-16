import {useQuery} from "@apollo/react-hooks";

export function isValidEmail(email) {
  const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return pattern.test(email)
}

export function useImperativeQuery(query) {
  const { refetch } = useQuery(query, { skip: true });
  return (variables) => {
    return refetch(variables);
  };
}
