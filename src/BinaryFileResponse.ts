import { mime } from 'send'
import { File } from './file/File'
import { Buffer } from 'safe-buffer'
import { IBlueprint } from '@stone-js/core'
import { FileError } from './errors/FileError'
import { HTTP_NOT_MODIFIED } from './constants'
import contentDisposition from 'content-disposition'
import { IncomingHttpEvent } from './IncomingHttpEvent'
import { OutgoingHttpResponse, OutgoingHttpResponseOptions } from './OutgoingHttpResponse'

/**
 * Options for creating a BinaryFile HTTP Response.
 */
interface BinaryFileResponseOptions extends OutgoingHttpResponseOptions {
  autoEtag?: boolean
  file: string | File
  autoLastModified?: boolean
  contentDispositionType?: string
}

/**
 * Class representing a BinaryFileResponse.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class BinaryFileResponse extends OutgoingHttpResponse {
  public readonly file: File
  private deleteFileAfterSent = false

  /**
   * Create a BinaryFileResponse with inline content disposition.
   *
   * @param options - Options for creating the BinaryFileResponse.
   * @returns A new instance of BinaryFileResponse.
   */
  static file (options: BinaryFileResponseOptions): BinaryFileResponse {
    return new this({ ...options, contentDispositionType: 'inline' })
  }

  /**
   * Create a BinaryFileResponse with attachment content disposition.
   *
   * @param options - Options for creating the BinaryFileResponse.
   * @returns A new instance of BinaryFileResponse.
   */
  static download (options: BinaryFileResponseOptions): BinaryFileResponse {
    return new this({ ...options, contentDispositionType: 'attachment' })
  }

  /**
   * Create a BinaryFileResponse.
   *
   * @param options - Options for creating the BinaryFileResponse.
   */
  constructor (options: BinaryFileResponseOptions) {
    super(options)
    this.file = this.getValidatedFile(options.file)

    options.autoEtag === true && this.autoEtag()
    options.autoLastModified === true && this.autoLastModified()

    this.setContentDisposition(options.contentDispositionType)
  }

  /**
   * Get deleteFileAfterSent.
   *
   * @returns Whether the file should be deleted after being sent.
   */
  get deleteFileAfterSentStatus (): boolean {
    return this.deleteFileAfterSent
  }

  /**
   * Get the encoded file path.
   *
   * @returns The encoded file path.
   */
  getEncodedFilePath (): string {
    return this.file.getEncodedPath()
  }

  /**
   * Automatically set the ETag header based on the file's content.
   *
   * @returns The current instance for method chaining.
   */
  autoEtag (): this {
    return this.setEtag(Buffer.from(this.file.getHashedContent()).toString('base64'))
  }

  /**
   * Automatically set the Last-Modified header based on the file's modification time.
   *
   * @returns The current instance for method chaining.
   */
  autoLastModified (): this {
    return this.setLastModified(new Date(Number(this.file.getMTime() ?? Date.now())))
  }

  /**
   * Set the content disposition header.
   *
   * @param type - The content disposition type (e.g., 'inline', 'attachment').
   * @returns The current instance for method chaining.
   */
  setContentDisposition (type?: string): this {
    return this
      .setHeader('Content-Disposition', contentDisposition(this.file.getPath(), { type }))
      .setHeader('Content-Type', this.file.getMimeType('application/octet-stream') ?? mime.lookup('bin'))
  }

  /**
   * Set the content of the response.
   *
   * @param content - The content to set (should be empty for BinaryFileResponse).
   * @returns The current instance for method chaining.
   * @throws TypeError if content is provided.
   */
  setContent (content: unknown): this {
    if (content) {
      throw new FileError('The content cannot be set on a BinaryFileResponse instance.')
    }

    return this
  }

  /**
   * Get the content of the response.
   *
   * @returns False, as content cannot be set for BinaryFileResponse.
   */
  getContent (): false {
    return false
  }

  /**
   * Set whether the file should be deleted after being sent.
   *
   * @param shouldDelete - Whether to delete the file after being sent.
   * @returns The current instance for method chaining.
   */
  setDeleteFileAfterSent (shouldDelete: boolean = true): this {
    this.deleteFileAfterSent = shouldDelete
    return this
  }

  /**
   * Prepare the response before sending.
   *
   * @param event - The incoming HTTP event.
   * @param blueprint - Optional blueprint settings for the response.
   * @returns The current instance of the response for chaining.
   */
  prepare (event: IncomingHttpEvent, blueprint?: IBlueprint): this {
    this
      .setBlueprintResolver(() => blueprint)
      .setIncomingEventResolver(() => event)
      .prepareCookies()

    if (this.incomingEvent.isFresh(this)) {
      this.setStatus(HTTP_NOT_MODIFIED)
    }

    if (this.isInformational() || this.isEmpty()) {
      this.removeHeader(['Content-Type', 'Content-Length', 'Transfer-Encoding'])
    } else {
      this.prepareContentHeaders()
    }

    return this
  }

  /**
   * Prepare content-related headers.
   *
   * @returns The current instance for method chaining.
   */
  protected prepareContentHeaders (): this {
    const fileSize = this.file.getSize()
    if (fileSize === undefined) return this

    const etagFn = this.blueprint?.get('app.http.etag.function', this.defaultEtagFn.bind(this))

    this.removeHeader('Transfer-Encoding').setHeader('Content-Length', String(fileSize))

    if (!this.hasHeader('ETag') && typeof etagFn === 'function') {
      this.setEtag(etagFn(this.file.getContent(), 'utf-8'))
    }

    if (!this.hasHeader('Content-Type')) {
      this.setHeader('Content-Type', this.file.getMimeType('application/octet-stream') ?? mime.lookup('bin'))
    }

    return this
  }

  /**
   * Validate the file to be served.
   *
   * @param file - The file to be served.
   * @returns The validated file instance.
   */
  private getValidatedFile (file: string | File): File {
    if (!file) {
      throw new FileError('file argument is required.')
    }

    if (!(file instanceof File)) {
      file = File.create(String(file))
    }

    if (!file.isReadable()) {
      throw new FileError('File must be readable.')
    }

    return file
  }
}