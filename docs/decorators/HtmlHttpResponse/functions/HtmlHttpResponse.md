# Function: HtmlHttpResponse()

```ts
function HtmlHttpResponse<T>(statusCode, headers): MethodDecorator;
```

Decorator to mark a class method as an html outgoing http response.

## Type Parameters

### T

`T` *extends* `Function` = `Function`

## Parameters

### statusCode

`number` = `HTTP_OK`

The status code of the response.

### headers

[`HeadersType`](../../../declarations/type-aliases/HeadersType.md) = `{}`

The headers for the response.

## Returns

`MethodDecorator`

A method decorator.

## Example

```typescript
import { HtmlHttpResponse } from '@stone-js/http-core';

class UserController {
  @HtmlHttpResponse()
  getUsers() {
    return '<h1>Hello World</h1>';
  }
}
```
