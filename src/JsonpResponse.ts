import { JsonResponse } from './JsonResponse'
import { HttpError } from './errors/HttpError'

/**
 * Class representing a JsonpResponse.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 * @credit https://github.com/expressjs/express/blob/master/lib/response.js
 */
export class JsonpResponse extends JsonResponse {
  private callback?: string

  /**
   * Set callback.
   *
   * @param callback - The callback function name or array of names.
   * @returns The current instance for method chaining.
   */
  setCallback (callback: string | string[]): this {
    this.callback = Array.isArray(callback) ? callback[0] : callback
    return this
  }

  /**
   * Get callback.
   *
   * @returns The callback function name.
   */
  getCallback (): string | undefined {
    const callbackName = this.blueprint?.get<string>('app.http.jsonp.callback.name') ?? ''
    return this.callback ?? this.incomingEvent.query.get(callbackName) ?? undefined
  }

  /**
   * Make JSONP response.
   *
   * @returns The current instance for method chaining.
   * @throws {HttpError} If no callback is provided.
   */
  protected makeJson (): this {
    const callback = this.getCallback()

    if (!callback) {
      throw new HttpError('No callback provided.')
    }

    if (!this.hasHeader('Content-Type')) {
      this.setContentType('application/json').setHeader('X-Content-Type-Options', 'nosniff')
    }

    if (typeof this.content !== 'string') {
      this.setContent(this.morphToJson(this.content, this.blueprint?.get('app.http.json', {})))
    }

    if (typeof callback === 'string' && callback.length > 0) {
      this.setContentType('application/javascript').setHeader('X-Content-Type-Options', 'nosniff')

      const sanitizedCallback = callback.replace(/[^\[\]\w$.]/g, '')

      if (typeof this.content === 'string') {
        this.setContent(this.content.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'))
      }

      // the /**/ is a specific security mitigation for "Rosetta Flash JSONP abuse"
      // the typeof check is just to reduce client error noise
      this.setContent(`/**/ typeof ${sanitizedCallback} === 'function' && ${sanitizedCallback}(${this.content});`)
    }

    return this
  }
}