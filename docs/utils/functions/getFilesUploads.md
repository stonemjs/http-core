[**HTTP Core Documentation v0.0.0**](../../README.md) • **Docs**

***

[HTTP Core Documentation v0.0.0](../../modules.md) / [utils](../README.md) / getFilesUploads

# Function: getFilesUploads()

> **getFilesUploads**(`event`, `options`): `Promise`\<`object`\>

Get file uploads.

Get streamed or pre-read(not streamed) file upload.

## Parameters

• **event**: `IncomingMessage` \| `object`

The incoming event containing the file data.

• **options**: `Record`\<`string`, `any`\>

The options for file upload limits.

## Returns

`Promise`\<`object`\>

A promise that resolves with the uploaded files and fields.

### fields

> **fields**: `Record`\<`string`, `string`\>

### files

> **files**: `Record`\<`string`, [`UploadedFile`](../../file/UploadedFile/classes/UploadedFile.md)[]\>

## Defined in

[utils.ts:145](https://github.com/stonemjs/http-core/blob/3497087dac965583296f5092cd519a9aa0728373/src/utils.ts#L145)