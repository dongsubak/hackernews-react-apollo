import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { BrowserRouter } from 'react-router-dom'
import { AUTH_TOKEN } from './constants'
import { setContext } from 'apollo-link-context'
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { SubscriptionClient } from "subscriptions-transport-ws";



const httpLink = createHttpLink({
  uri: 'https://hackernews-react-apollo-serve.herokuapp.com:4000'
})

const authLink = setContext((_,{ headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})

//const wsClient = new SubscriptionClient({
//  uri: `wss://hackernews-react-apollo-serve.herokuapp.com:4000`,
 // options: {
//    reconnect: true,
 //   connectionParams: {
 //     authToken: localStorage.getItem(AUTH_TOKEN),
//    }
//  }
//})

//const wsLink = new WebSocketLink(wsClient)

const wsLink = new WebSocketLink({
  uri: `wss://hackernews-react-apollo-serve.herokuapp.com:4000`,
  options: {
   reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN),
    }
  }
})

SubscriptionClient.maxConnectTimeGenerator.duration = () => SubscriptionClient.maxConnectTimeGenerator.max

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  authLink.concat(httpLink)
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})


ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>
  , 
  document.getElementById('root')
);
registerServiceWorker();
