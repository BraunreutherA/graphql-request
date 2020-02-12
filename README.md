# cf-worker-graphql-request

[![CircleCI](https://circleci.com/gh/prisma/graphql-request.svg?style=shield)](https://circleci.com/gh/prisma/graphql-request) [![npm version](https://badge.fury.io/js/graphql-request.svg)](https://badge.fury.io/js/graphql-request)

📡 Minimal GraphQL client for use in cloudflare workers

## Features

- Most **simple and lightweight** GraphQL client
- Promise-based API (works with `async` / `await`)
- Typescript support 

## Install

```sh
npm install @ninetailed/cf-worker-graphql-request
```

```sh
yarn add @ninetailed/cf-worker-graphql-request
```

## Quickstart

Send a GraphQL query with a single line of code. ▶️ [Try it out](https://runkit.com/593130bdfad7120012472003/593130bdfad7120012472004).

```js
import { request } from 'graphql-request'

const query = `{
  Movie(title: "Inception") {
    releaseDate
    actors {
      name
    }
  }
}`

request('https://api.graph.cool/simple/v1/movies', query).then(data =>
  console.log(data)
)
```

## Usage

```js
import { request, GraphQLClient } from 'graphql-request'

// Run GraphQL queries/mutations using a static function
request(endpoint, query, variables).then(data => console.log(data))

// ... or create a GraphQL client instance to send requests
const client = new GraphQLClient(endpoint, { headers: {} })
client.request(query, variables).then(data => console.log(data))
```

## Examples

### Authentication via HTTP header

```js
import { GraphQLClient } from 'graphql-request'

async function main() {
  const endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr'

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      authorization: 'Bearer MY_TOKEN',
    },
  })

  const query = /* GraphQL */ `
    {
      Movie(title: "Inception") {
        releaseDate
        actors {
          name
        }
      }
    }
  `

  const data = await graphQLClient.request(query)
  console.log(JSON.stringify(data, undefined, 2))
}

main().catch(error => console.error(error))
```

[TypeScript Source](examples/authentication-via-http-header.ts)

### Passing more options to fetch

```js
import { GraphQLClient } from 'graphql-request'

async function main() {
  const endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr'

  const graphQLClient = new GraphQLClient(endpoint, {
    credentials: 'include',
    mode: 'cors',
  })

  const query = /* GraphQL */ `
    {
      Movie(title: "Inception") {
        releaseDate
        actors {
          name
        }
      }
    }
  `

  const data = await graphQLClient.request(query)
  console.log(JSON.stringify(data, undefined, 2))
}

main().catch(error => console.error(error))
```

[TypeScript Source](examples/passing-more-options-to-fetch.ts)

### Using variables

```js
import { request } from 'graphql-request'

async function main() {
  const endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr'

  const query = /* GraphQL */ `
    query getMovie($title: String!) {
      Movie(title: $title) {
        releaseDate
        actors {
          name
        }
      }
    }
  `

  const variables = {
    title: 'Inception',
  }

  const data = await request(endpoint, query, variables)
  console.log(JSON.stringify(data, undefined, 2))
}

main().catch(error => console.error(error))
```

[TypeScript Source](examples/using-variables.ts)

### Use cloudflare worker cache api
```js
import { request } from 'graphql-request'

async function main() {
  const endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr'

  const query = /* GraphQL */ `
    {
      Movie(title: "Inception") {
        releaseDate
        actors {
          fullname # "Cannot query field 'fullname' on type 'Actor'. Did you mean 'name'?"
        }
      }
    }
  `

  try {
    // the event here is the FetchEvent you get in the eventlistener
    const data = await request(endpoint, query, event, {
      cache: true, 
      cachekey: 'https://cache.yourdomain.com/something', 
      cacheTtl: 300
    });
    console.log(JSON.stringify(data, undefined, 2))
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2))
    process.exit(1)
  }
}

main().catch(error => console.error(error))
```

### Error handling

```js
import { request } from 'graphql-request'

async function main() {
  const endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr'

  const query = /* GraphQL */ `
    {
      Movie(title: "Inception") {
        releaseDate
        actors {
          fullname # "Cannot query field 'fullname' on type 'Actor'. Did you mean 'name'?"
        }
      }
    }
  `

  try {
    const data = await request(endpoint, query)
    console.log(JSON.stringify(data, undefined, 2))
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2))
    process.exit(1)
  }
}

main().catch(error => console.error(error))
```

[TypeScript Source](examples/error-handling)

### Using `require` instead of `import`

```js
const { request } = require('graphql-request')

async function main() {
  const endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr'

  const query = /* GraphQL */ `
    {
      Movie(title: "Inception") {
        releaseDate
        actors {
          name
        }
      }
    }
  `

  const data = await request(endpoint, query)
  console.log(JSON.stringify(data, undefined, 2))
}

main().catch(error => console.error(error))
```

### Receiving a raw response

The `request` method will return the `data` or `errors` key from the response.
If you need to access the `extensions` key you can use the `rawRequest` method:

```js
import { rawRequest } from 'graphql-request'

async function main() {
  const endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr'

  const query = /* GraphQL */ `
    {
      Movie(title: "Inception") {
        releaseDate
        actors {
          name
        }
      }
    }
  `

  const { data, errors, extensions, headers, status } = await rawRequest(
    endpoint,
    query
  )
  console.log(
    JSON.stringify({ data, errors, extensions, headers, status }, undefined, 2)
  )
}

main().catch(error => console.error(error))
```

[TypeScript Source](examples/receiving-a-raw-response)

### More examples coming soon...

- Fragments
- Using [`graphql-tag`](https://github.com/apollographql/graphql-tag)

## FAQ

### What's the difference between the original `graphql-request` and `cf-worker-graphql-request`

`graphql-request` is the most minimal and simplest to use GraphQL client. It's perfect for small scripts or simple apps.

`cf-worker-graphql-request` uses the original fetch from the cloudflare worker spec and has support for the cf worker cache API.