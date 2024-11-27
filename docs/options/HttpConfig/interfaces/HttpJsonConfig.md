[**HTTP Core Documentation v0.0.0**](../../../README.md) • **Docs**

***

[HTTP Core Documentation v0.0.0](../../../modules.md) / [options/HttpConfig](../README.md) / HttpJsonConfig

# Interface: HttpJsonConfig

## Properties

### escape

> **escape**: `boolean`

Whether to escape HTML characters in JSON output.

#### Defined in

[options/HttpConfig.ts:48](https://github.com/stonemjs/http-core/blob/3497087dac965583296f5092cd519a9aa0728373/src/options/HttpConfig.ts#L48)

***

### replacer()

> **replacer**: (`this`, `key`, `value`) => `unknown`

A custom replacer function for JSON serialization.

#### Parameters

• **this**: `unknown`

• **key**: `string`

• **value**: `unknown`

#### Returns

`unknown`

#### Defined in

[options/HttpConfig.ts:52](https://github.com/stonemjs/http-core/blob/3497087dac965583296f5092cd519a9aa0728373/src/options/HttpConfig.ts#L52)

***

### spaces

> **spaces**: `string`

The number of spaces to use for formatting JSON output.

#### Defined in

[options/HttpConfig.ts:44](https://github.com/stonemjs/http-core/blob/3497087dac965583296f5092cd519a9aa0728373/src/options/HttpConfig.ts#L44)