import { ApolloClient, InMemoryCache, split, HttpLink, from } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { setContext } from '@apollo/client/link/context'
import { nhost } from './nhost'

const httpLink = new HttpLink({
  uri: 'https://rkmfhdjejhbbuekdfkly.hasura.eu-central-1.nhost.run/v1/graphql'
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'wss://rkmfhdjejhbbuekdfkly.hasura.eu-central-1.nhost.run/v1/graphql',
    connectionParams: () => {
      const token = nhost.auth.getAccessToken()
      const userId = nhost.auth.getUser()?.id
      return {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'X-User-Id': userId || ''
        }
      }
    }
  })
)

const authLink = setContext((_, { headers }) => {
  const token = nhost.auth.getAccessToken()
  const userId = nhost.auth.getUser()?.id
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'X-User-Id': userId || ''
    },
    // Add user context that can be accessed in resolvers
    context: {
      userId,
      isAuthenticated: !!token
    }
  }
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  from([authLink, httpLink])
)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
})