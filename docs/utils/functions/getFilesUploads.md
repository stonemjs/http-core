[**HTTP Core Documentation v0.0.2**](../../README.md)

***

[HTTP Core Documentation](../../modules.md) / [utils](../README.md) / getFilesUploads

# Function: getFilesUploads()

> **getFilesUploads**(`event`, `options`): `Promise`\<`object`\>

Get file uploads.

Get streamed or pre-read(not streamed) file upload.

## Parameters

### event

`IncomingMessage`

\{`body`: `unknown`;`headers`: `IncomingHttpHeaders`; \}

The incoming event containing the file data.

#### event.body

`unknown`

#### event.headers

`IncomingHttpHeaders`

### options

`Record`\<`string`, `any`\>

The options for file upload limits.

## Returns

`Promise`\<`object`\>

A promise that resolves with the uploaded files and fields.

### fields

> **fields**: `Record`\<`string`, `string`\>

### files

> **files**: `Record`\<`string`, [`UploadedFile`](../../file/UploadedFile/classes/UploadedFile.md)[]\>

## Defined in

[utils.ts:145](https://github.com/stonemjs/http-core/blob/ed7c2187bd85b6877da7cd9f8c94448716446e07/src/utils.ts#L145)
