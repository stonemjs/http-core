[**HTTP Core Documentation v0.0.0**](../../README.md) • **Docs**

***

[HTTP Core Documentation v0.0.0](../../modules.md) / [utils](../README.md) / getHostname

# Function: getHostname()

> **getHostname**(`ip`, `headers`, `options`): `string`

Get hostname.

## Parameters

• **ip**: `string`

The IP address of the request.

• **headers**: `Record`\<`string`, `string`\>

The headers from the incoming request.

• **options**

Options for trusted IPs, fallback, etc.

• **options.trusted**: (`string` \| `RegExp`)[]

• **options.trustedIp**: `string`[]

• **options.untrustedIp**: `string`[]

## Returns

`string`

The hostname from the request.

## Defined in

[utils.ts:104](https://github.com/stonemjs/http-core/blob/3497087dac965583296f5092cd519a9aa0728373/src/utils.ts#L104)