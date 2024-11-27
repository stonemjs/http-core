import mime from 'mime'
import fresh from 'fresh'
import typeIs from 'type-is'
import accepts from 'accepts'
import { URL } from 'node:url'
import { get, has } from 'lodash-es'
import rangeParser from 'range-parser'
import contentTypeLib from 'content-type'
import { UploadedFile } from './file/UploadedFile'
import { CookieCollection } from './cookies/CookieCollection'
import { IncomingEvent, IncomingEventOptions } from '@stone-js/core'
import { HttpMethods, IOutgoingHttpResponse, IRoute } from './declarations'

/**
 * IncomingHttpEventOptions interface.
 */
interface IncomingHttpEventOptions extends IncomingEventOptions {
  url: URL
  ip: string
  ips?: string[]
  protocol?: string
  method?: HttpMethods
  queryString?: string
  cookies?: CookieCollection
  body?: Record<string, unknown>
  files?: Record<string, UploadedFile[]>
  headers?: Record<string, string> | Headers
}

/**
 * Class representing an IncomingHttpEvent.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class IncomingHttpEvent extends IncomingEvent {
  static INCOMING_HTTP_EVENT = 'stonejs@incoming_http_event'

  /** The IP address of the client making the request. */
  public readonly ip: string
  /** The list of IP addresses, typically for proxies. */
  public readonly ips: string[]
  /** The URL of the request. */
  public readonly url: URL
  /** The body of the request. */
  public readonly body: Record<string, unknown>
  /** The files included in the request. */
  public readonly files: Record<string, UploadedFile[]>
  /** The query parameters of the request. */
  public readonly query: URLSearchParams
  /** The HTTP method of the request. */
  public readonly method: HttpMethods
  /** The content negotiation handler for the request. */
  public readonly accepts: accepts.Accepts
  /** The headers of the request. */
  public readonly headers: Headers
  /** The cookies included in the request. */
  public readonly cookies: CookieCollection
  /** The protocol used for the request (e.g., http or https). */
  public readonly protocol: string
  /** The query string of the request. */
  public readonly queryString?: string

  protected userResolver?: () => unknown
  protected routeResolver?: () => IRoute

  /**
   * Create an IncomingHttpEvent.
   *
   * @param options - The IncomingHttpEvent options.
   * @returns A new instance of IncomingHttpEvent.
   */
  static create (options: IncomingHttpEventOptions): IncomingHttpEvent {
    return new this(options)
  }

  /**
   * Constructor for IncomingHttpEvent.
   *
   * @param options - The options to create an IncomingHttpEvent instance.
   * @throws {TypeError} If the URL option is not a valid instance of URL.
   */
  protected constructor ({
    ip,
    url,
    ips = [],
    body = {},
    files = {},
    locale = 'en',
    headers = {},
    metadata = {},
    protocol = 'http',
    source = undefined,
    cookies = undefined,
    queryString = undefined,
    method = HttpMethods.GET
  }: IncomingHttpEventOptions) {
    super({ type: IncomingHttpEvent.INCOMING_HTTP_EVENT, source, metadata, locale })

    if (!(url instanceof URL)) {
      throw new TypeError('The `url` option must be an instance of `URL`.')
    }

    this.ip = ip
    this.ips = ips
    this.url = url
    this.body = body
    this.files = files
    this.method = method
    this.protocol = protocol
    this.queryString = queryString
    this.accepts = accepts(this as any)
    this.query = new URLSearchParams(this.queryString ?? '')
    this.cookies = cookies ?? CookieCollection.create()
    this.headers = headers instanceof Headers ? headers : new Headers(headers)
  }

  /** @returns The decoded pathname of the URL. */
  get decodedPathname (): string | undefined {
    try {
      return decodeURIComponent(this.url.pathname)
    } catch (_) {
      return undefined
    }
  }

  /** @returns The hash part of the URL. */
  get hash (): string {
    return this.url.hash
  }

  /** @returns The host of the URL (hostname:port). */
  get host (): string {
    return this.url.host
  }

  /** @returns The hostname of the URL. */
  get hostname (): string {
    return this.url.hostname
  }

  /** @returns The route parameters. */
  get params (): Record<string, unknown> | undefined {
    return this.routeResolver?.()?.parameters?.()
  }

  /** @returns The full path including pathname and search query. */
  get path (): string | undefined {
    return this.url ? `${this.url.pathname}${this.url.search}` : undefined
  }

  /** @returns The pathname of the URL. */
  get pathname (): string {
    return this.url.pathname
  }

  /** @returns The full URL as a string. */
  get uri (): string {
    return this.url.href
  }

  /** @returns The protocol of the URL (e.g., "http" or "https"). */
  get scheme (): string {
    return this.protocol
  }

  /** @returns The URL segments split by '/'. */
  get segments (): string[] {
    return this.url.pathname.split('/')
  }

  /** @returns Whether the request was made over a secure connection. */
  get isSecure (): boolean {
    return this.protocol === 'https'
  }

  /** @returns Whether the request is an XMLHttpRequest. */
  get isXhr (): boolean {
    return this.getHeader('X-Requested-With', '')?.toLowerCase() === 'xmlhttprequest'
  }

  /** @returns Whether the request is an AJAX request. */
  get isAjax (): boolean {
    return this.isXhr
  }

  /** @returns The user agent of the request. */
  get userAgent (): string | undefined {
    return this.getHeader('user-agent')
  }

  /** @returns Whether the request was prefetch. */
  get isPrefetch (): boolean {
    return ['prefetch'].includes(this.getHeader('Purpose') ?? this.getHeader('Sec-Purpose') ?? '')
  }

  /** @returns The ETag of the request, if present. */
  get etag (): string | undefined {
    return this.getHeader('ETag')
  }

  /** @returns An array of acceptable content types for the request. */
  get types (): string[] {
    return this.accepts.types() as string[]
  }

  /** @returns An array of acceptable character sets for the request. */
  get charsets (): string[] {
    return this.accepts.charsets()
  }

  /** @returns An array of acceptable languages for the request. */
  get languages (): string[] {
    return this.accepts.languages()
  }

  /** @returns An array of acceptable encodings for the request. */
  get encodings (): string[] {
    return this.accepts.encodings()
  }

  /** @returns The charset specified in the content-type header. */
  get charset (): string | undefined {
    return contentTypeLib.parse(this).parameters.charset
  }

  /** @returns The content type specified in the headers. */
  get contentType (): string | undefined {
    return contentTypeLib.parse(this).type
  }

  /** @returns The user object, resolved through a user resolver function if available. */
  get user (): unknown {
    return this.userResolver?.()
  }

  /**
   * Get data from the request.
   *
   * Priority:
   * 1. Route params
   * 2. Body
   * 3. Query params
   * 4. Headers
   * 5. Cookies
   * 6. Metadata
   * 7. Fallback value
   *
   * @param key - The key to look for.
   * @param fallback - A fallback value if the key is not found.
   * @returns The value of the key or the fallback.
  */
  get<R = unknown>(key: string, fallback?: R): R {
    return (
      this.getFromRouteParams(key) ??
      this.getFromBody(key) ??
      this.getFromQueryParams(key) ??
      this.getFromHeaders(key) ??
      this.getFromCookies(key) ??
      this.getMetadataValue(key, fallback)
    ) as R
  }

  /**
   * Get a header value.
   *
   * @param name - The header name.
   * @param fallback - A fallback value if the header is not found.
   * @returns The header value or the fallback value.
   * @throws {TypeError} If the header name is not a valid string.
   */
  getHeader<R = string>(name: string, fallback?: R): R {
    if (!this.isValidName(name)) { throw new TypeError('Header name must be a non-empty string.') }
    const lcName = name.toLowerCase()
    if (['referer', 'referrer'].includes(lcName)) { return (this.headers.get('referer') ?? this.headers.get('referrer') ?? fallback) as R }
    return (this.headers.get(lcName) ?? fallback) as R
  }

  /**
   * Check if a header exists.
   *
   * @param name - The header name to check.
   * @returns True if the header exists, otherwise false.
   */
  hasHeader (name: string): boolean {
    if (!this.isValidName(name)) { throw new TypeError('Header name must be a non-empty string.') }
    return this.headers.has(name.toLowerCase())
  }

  /**
   * Get a cookie value.
   *
   * @param name - The cookie name.
   * @param fallback - A fallback value if the cookie is not found.
   * @returns The cookie value or the fallback.
   */
  getCookie<R = string>(name: string, fallback?: R): R {
    if (!this.isValidName(name)) { throw new TypeError('Cookie name must be a non-empty string.') }
    return (this.cookies.get(name) ?? this.cookies.get(name.toLowerCase()) ?? fallback) as R
  }

  /**
   * Check if a cookie exists.
   *
   * @param name - The cookie name to check.
   * @returns True if the cookie exists, otherwise false.
   */
  hasCookie (name: string): boolean {
    if (!this.isValidName(name)) { throw new TypeError('Cookie name must be a non-empty string.') }
    return this.cookies.has(name) || this.cookies.has(name.toLowerCase())
  }

  /**
   * Return the first accepted content type.
   *
   * @param values - The content types to check.
   * @returns The first accepted type, or false if none are accepted.
   */
  acceptsTypes (...values: string[]): string | string[] | false {
    return this.accepts.type(values.flat())
  }

  /**
   * Return the first accepted encoding.
   *
   * @param values - The encodings to check.
   * @returns The first accepted encoding, or false if none are accepted.
   */
  acceptsEncodings (...values: string[]): string | string[] | false {
    return this.accepts.encoding(values.flat())
  }

  /**
   * Return the first accepted charset.
   *
   * @param values - The charsets to check.
   * @returns The first accepted charset, or false if none are accepted.
   */
  acceptsCharsets (...values: string[]): string | string[] | false {
    return this.accepts.charset(values.flat())
  }

  /**
   * Return the first accepted language.
   *
   * @param values - The languages to check.
   * @returns The first accepted language, or false if none are accepted.
   */
  acceptsLanguages (...values: string[]): string | string[] | false {
    return this.accepts.language(values.flat())
  }

  /**
   * Get MIME type for a given file path or extension.
   *
   * @param format - The file path or extension.
   * @returns The corresponding MIME type, or null if not found.
   */
  getMimeType (format: string): string | null {
    return mime.getType(format)
  }

  /**
   * Get file extension for a given MIME type.
   *
   * @param mimeType - The MIME type.
   * @returns The corresponding file extension, or null if not found.
   */
  getFormat (mimeType: string): string | null {
    return mime.getExtension(mimeType)
  }

  /**
   * Check if the request matches one of the given content types.
   *
   * @param types - The content types to check.
   * @returns The best match, or false if no match is found.
   */
  is (types: string[]): string | false | undefined {
    return typeIs(this as any, types.flat()) ?? undefined
  }

  /**
   * Get request range.
   *
   * @param size - The maximum size of the resource.
   * @param combine - Specifies if overlapping & adjacent ranges should be combined.
   * @returns The parsed range, or undefined if not applicable.
   */
  range (size: number, combine = false): rangeParser.Result | rangeParser.Ranges | undefined {
    if (!this.hasHeader('Range')) return undefined
    return rangeParser(size, this.getHeader('Range'), { combine })
  }

  /**
   * Get a value from the JSON body.
   *
   * @param key - The key to look for in the JSON body.
   * @param fallback - A fallback value if the key is not found.
   * @returns The value of the key or the fallback.
   */
  json (key: string, fallback?: unknown): unknown {
    if (this.is(['json'])) {
      return get(this.body, key, fallback)
    }
    return fallback
  }

  /**
   * Check if a key exists in the JSON body.
   *
   * @param key - The key to check for.
   * @returns True if the key exists, otherwise false.
   */
  hasJson (key: string): boolean {
    return typeof this.is(['json']) === 'string' && has(this.body, key)
  }

  /**
   * Determine if the response cache is fresh.
   *
   * @param response - The outgoing HTTP response to check freshness against.
   * @returns True if the cache is fresh, otherwise false.
   */
  isFresh (response: IOutgoingHttpResponse): boolean {
    const status = response.status ?? 500
    return ['GET', 'HEAD'].includes(this.method) &&
      ((status >= 200 && status < 300) || status === 304) &&
      fresh(Object.fromEntries(this.headers.entries()), {
        etag: response.etag,
        'last-modified': response.lastModified
      })
  }

  /**
   * Determine if the response cache is stale.
   *
   * @param response - The outgoing HTTP response to check staleness against.
   * @returns True if the cache is stale, otherwise false.
   */
  isStale (response: IOutgoingHttpResponse): boolean {
    return !this.isFresh(response)
  }

  /**
   * Generate a full URL for the given path.
   *
   * @param path - The path to append to the base URL.
   * @returns The full URL for the given path.
   */
  uriForPath (path: string): string {
    return new URL(path, `${this.scheme}://${this.host}`).href
  }

  /**
   * Filter and return files based on their names.
   *
   * @param files - The array of file names to filter.
   * @returns An object containing the filtered files.
   */
  filterFiles (files: string[]): Record<string, UploadedFile[]> {
    return Object.fromEntries(Object.entries(this.files).filter(([key]) => files.includes(key)))
  }

  /**
   * Get a file by its name.
   *
   * @param name - The name of the file.
   * @returns The file if it exists, otherwise undefined.
   */
  getFile (name: string): UploadedFile[] | undefined {
    return this.files[name]
  }

  /**
   * Check if a file exists by its name.
   *
   * @param name - The name of the file.
   * @returns True if the file exists, otherwise false.
   */
  hasFile (name: string): boolean {
    return name in this.files
  }

  /**
   * Check if the current event method matches the given method.
   *
   * @param method - The method to check.
   * @returns True if the event method matches, otherwise false.
   */
  isMethod (method: string): boolean {
    return this.method.toUpperCase() === method.toUpperCase()
  }

  /**
   * Check if the current event method is considered safe.
   *
   * @returns True if the method is safe, otherwise false.
   */
  isMethodSafe (): boolean {
    return ['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(this.method)
  }

  /**
   * Check if the current event method is cacheable.
   *
   * @returns True if the method is cacheable, otherwise false.
   */
  isMethodCacheable (): boolean {
    return ['GET', 'HEAD'].includes(this.method)
  }

  /**
   * Get the URI with or without the domain.
   *
   * @param withDomain - Whether to include the domain in the URI.
   * @returns The URI with or without the domain.
   */
  getUri (withDomain = false): string | undefined {
    return withDomain ? new URL(this.decodedPathname ?? '/', this.hostname).href : this.decodedPathname
  }

  /**
   * Return the current route or a route parameter.
   *
   * @param param - The parameter to retrieve from the route.
   * @param fallback - The fallback value if the parameter does not exist.
   * @returns The route parameter or the route object.
   */
  route (param?: string, fallback?: string): string | Record<string, unknown> | IRoute | undefined {
    const route = this.routeResolver?.()
    return param ? route?.parameters(param, fallback) : route
  }

  /**
   * Generate a unique fingerprint for the event.
   *
   * @returns The generated fingerprint as a base64 string.
   */
  fingerprint (): string {
    const route = this.route() as IRoute

    if (typeof route !== 'object') {
      throw new TypeError('Unable to generate fingerprint. Route unavailable.')
    }

    return Buffer.from([route.methods, route.getDomain(), route.uri, this.ip].join('|')).toString('base64')
  }

  /**
   * Get the user resolver function.
   *
   * @returns The user resolver function.
   */
  getUserResolver (): () => unknown {
    return this.userResolver ?? (() => undefined)
  }

  /**
   * Set the user resolver function.
   *
   * @param resolver - The user resolver function.
   * @returns The current instance for method chaining.
   */
  setUserResolver (resolver: () => unknown): this {
    this.userResolver = resolver
    return this
  }

  /**
   * Get the route resolver function.
   *
   * @returns The route resolver function.
   */
  getRouteResolver (): () => IRoute | undefined {
    return this.routeResolver ?? (() => undefined)
  }

  /**
   * Set the route resolver function.
   *
   * @param resolver - The route resolver function.
   * @returns The current instance for method chaining.
   */
  setRouteResolver (resolver: () => IRoute): this {
    this.routeResolver = resolver
    return this
  }

  /**
   * Retrieve a parameter from the route if it exists.
   *
   * @param key - The name of the parameter to retrieve.
   * @returns The value of the parameter if it exists, otherwise undefined.
   */
  private getFromRouteParams (key: string): string | undefined {
    return this.routeResolver?.()?.parameter?.(key)
  }

  /**
   * Retrieve a value from the request body.
   *
   * @param key - The key of the value to retrieve.
   * @returns The value from the body if it exists, otherwise undefined.
   */
  private getFromBody (key: string): unknown {
    return has(this.body, key) ? get(this.body, key) : undefined
  }

  /**
   * Retrieve a value from the query parameters.
   *
   * @param key - The key of the value to retrieve.
   * @returns The value from the query parameters if it exists, otherwise undefined.
   */
  private getFromQueryParams (key: string): unknown {
    return this.query.get(key) ?? undefined
  }

  /**
   * Retrieve a value from the request headers.
   *
   * @param key - The name of the header to retrieve.
   * @returns The value of the header if it exists, otherwise undefined.
   */
  private getFromHeaders (key: string): string | undefined {
    return this.hasHeader(key) ? this.getHeader(key) : undefined
  }

  /**
   * Retrieve a value from the cookies.
   *
   * @param key - The name of the cookie to retrieve.
   * @returns The value of the cookie if it exists, otherwise undefined.
   */
  private getFromCookies (key: string): undefined {
    return this.hasCookie(key) ? this.getCookie(key) : undefined
  }

  /**
   * Validate the provided name.
   *
   * @param name - The name to validate.
   * @returns True if the name is valid, otherwise false.
   */
  private isValidName (name: string): boolean {
    return typeof name === 'string' && name.trim() !== ''
  }
}