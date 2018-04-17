# MaxAge ApolloLink

[![npm version](https://badge.fury.io/js/apollo-link-maxage.svg)](https://badge.fury.io/js/apollo-link-maxage)
[![CircleCI](https://circleci.com/gh/kamilkisiela/apollo-link-maxage.svg?style=svg)](https://circleci.com/gh/kamilkisiela/apollo-link-maxage)

## Purpose

An Apollo Link to invalidate cached queries.

## Installation

```
yarn add apollo-link-maxage
npm install --save apollo-link-maxage
```

## Usage

Simply specify `maxAge` in a query's context. This could be a number of ms or a string (i.e. `10s` for 10 seconds, `5m` for 5 minutes etc.).

```js
import { MaxAgeLink } from 'apollo-link-maxage';
import { InMemoryCache } from 'apollo-inmemory-cache';

const myCache = new InMemoryCache();
const maxAgeLink = new MaxAgeLink({
  cache: myCache,
});
```

```js
// query options
{
  query: gql`
    query me {
      me {
        name
      }
    }
  `,
  fetchPolicy: 'network-only',
  context: {
    maxAge: '5m', // or 300000 (5m in ms)
  },
}
```

> NOTE: It's important to set `fetchPolicy` to `network-only` or similar. This is because ApolloClient won't execute a Link if there is no need to fetch a result from a GraphQL endpoint.

## How it works

If a query runs for a first time, it's being executed normally but the expiration date is stored. Next time it runs the `MaxAgeLink` checks if a query is expired, if not it reads results from cache, otherwise the process starts again.

To match a query with the one that has been stored we need to generate a unique key. By default it uses ApolloLink's `toKey()` method but you can define your own logic by providing a function as `toKey` option.

## Options

* `cache` - instance of ApolloCache _(required)_
* `toKey` - a function that receives an Operation and returns a unique string _(`(op: Operation) => string`)_
