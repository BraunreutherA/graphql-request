import { ClientError, GraphQLError, Headers as HttpHeaders, Options, Variables } from './types'
export { ClientError } from './types'

// TODO create correct typings for cloudflare caches.
// @ts-ignore
// tslint:disable-next-line
const cache = caches.default

export class GraphQLClient {
  private url: string
  private options: Options

  constructor(url: string, options?: Options) {
    this.url = url
    this.options = options || {}
  }

  async rawRequest<T extends any>(
    query: string,
    variables?: Variables,
    event?: FetchEvent,
    options: {
      cache: boolean;
      cacheKey?: string;
      cacheTtl?: number;
    } = {
      cache: false,
    },
  ): Promise<{ data?: T, extensions?: any, headers: Headers, status: number, errors?: GraphQLError[] }> {
    if (options.cache && !event) {
      throw new Error(
        'GraphQLClient request: cache is set true but the event is undefined.',
      )
    }

    if (options.cache && !options.cacheKey) {
      throw new Error(
        'GraphQLClient request: cache is set true but no cacheKey is specified.',
      )
    }

    if (options.cache && !options.cacheTtl) {
      throw new Error(
        'GraphQLClient request: cache is set true but no cacheTtl is specified.',
      )
    }

    const { headers, ...others } = this.options

    const body = JSON.stringify({
      query,
      variables: variables ? variables : undefined,
    })

    let response = cache.match(options.cacheKey)

    if (!response) {
      response = await fetch(this.url, {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
        body,
        ...others,
      })
      response = new Response(response.body, response)
      response.headers.append('Cache-Control', `max-age=${options.cacheTtl}`)
      event!.waitUntil(cache.put(options.cacheKey, response.clone()))
    }

    const result = await getResult(response)

    if (response.ok && !result.errors && result.data) {
      const { headers, status } = response
      return { ...result, headers, status }
    } else {
      const errorResult =
        typeof result === 'string' ? { error: result } : result
      throw new ClientError(
        { ...errorResult, status: response.status, headers: response.headers },
        { query, variables },
      )
    }
  }

  async request<T extends any>(
    query: string,
    variables?: Variables,
  ): Promise<T> {
    const { data } = await this.rawRequest<T>(query, variables)

    // we cast data to T here as it will be defined. otherwise there would be an error thrown already in the raw request
    return data as T
  }

  setHeaders(headers: HttpHeaders): GraphQLClient {
    this.options.headers = headers

    return this
  }

  setHeader(key: string, value: string): GraphQLClient {
    const { headers } = this.options

    if (headers) {
      headers[key] = value
    } else {
      this.options.headers = { [key]: value }
    }
    return this
  }
}

export async function rawRequest<T extends any>(
  url: string,
  query: string,
  variables?: Variables,
): Promise<{ data?: T, extensions?: any, headers: Headers, status: number, errors?: GraphQLError[] }> {
  const client = new GraphQLClient(url)

  return client.rawRequest<T>(query, variables)
}

export async function request<T extends any>(
  url: string,
  query: string,
  variables?: Variables,
): Promise<T> {
  const client = new GraphQLClient(url)

  return client.request<T>(query, variables)
}

export default request

async function getResult(response: Response): Promise<any> {
  const contentType = response.headers.get('Content-Type')
  if (contentType && contentType.startsWith('application/json')) {
    return response.json()
  } else {
    return response.text()
  }
}
