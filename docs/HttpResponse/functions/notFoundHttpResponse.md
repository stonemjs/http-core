[**HTTP Core Documentation v0.0.3**](../../README.md)

***

[HTTP Core Documentation](../../modules.md) / [HttpResponse](../README.md) / notFoundHttpResponse

# Function: notFoundHttpResponse()

> **notFoundHttpResponse**(`content`, `headers`): [`OutgoingHttpResponse`](../../OutgoingHttpResponse/classes/OutgoingHttpResponse.md)

Create a 404(Not Found) OutgoingHttpResponse.

## Parameters

### content

`unknown`

The content of the response.

### headers

`Record`\<`string`, `string`\> = `{}`

The headers for the response.

## Returns

[`OutgoingHttpResponse`](../../OutgoingHttpResponse/classes/OutgoingHttpResponse.md)

A new instance of OutgoingHttpResponse.

## Defined in

[HttpResponse.ts:92](https://github.com/stonemjs/http-core/blob/33a82b77e98ade423889148c13f25ccd40b75c8a/src/HttpResponse.ts#L92)
