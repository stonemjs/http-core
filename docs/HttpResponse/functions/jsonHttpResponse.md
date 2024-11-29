[**HTTP Core Documentation v0.0.0**](../../README.md)

***

[HTTP Core Documentation](../../modules.md) / [HttpResponse](../README.md) / jsonHttpResponse

# Function: jsonHttpResponse()

> **jsonHttpResponse**(`content`, `statusCode`, `headers`): [`JsonResponse`](../../JsonResponse/classes/JsonResponse.md)

Create a 200(OK) JSON OutgoingHttpResponse.

## Parameters

### content

`unknown`

The content of the response.

### statusCode

`number` = `HTTP_OK`

The status code of the response.

### headers

`Record`\<`string`, `string`\> = `{}`

The headers for the response.

## Returns

[`JsonResponse`](../../JsonResponse/classes/JsonResponse.md)

A new instance of JsonResponse.

## Defined in

[HttpResponse.ts:149](https://github.com/stonemjs/http-core/blob/a162480c16327760396238c341daab61793d5440/src/HttpResponse.ts#L149)