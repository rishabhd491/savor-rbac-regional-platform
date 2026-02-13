import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // In a real app, you'd get this from a cookie or localStorage
  // For this challenge, we'll store it in a simple way
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  
  return {
    headers: {
      ...headers,
      'x-user-id': userId || '',
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
