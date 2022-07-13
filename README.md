# vue-format-amount-input

Inspired by [AutoNumeric](https://github.com/autoNumeric/autoNumeric/), after using it for many years, decided to create my own amount format input for Vue3.
Made this focused on my needs for my personal projects, but feel free to open issues for new behaviours or problems you found, I'll try my best to help you.

## To Install
```
npm install --save vue-format-amount-input
```
Once you have installed the package, in your entry file of the repository (main.js) if you are using it in a Vue CLI project. Write the import command

```
import AmountFormatInputInstall from 'vue-format-amount-input'

app.use(AmountFormatInputInstall)
```

## Options this input supports and it's default values:

Options allow you to customize how the input will format the amount as you type.

| Option | Description | Default Value |
| :----------------: | :-----------:  | :-----------:  |
| `digitGroupSeparator` | Thousands group separator | `null` |
| `decimalChar` | Decimal separator character. Allowed values: `.` `,` `٫` | `.` |
| `alwaysAllowDecimalCharacter | Allows/Disables decimals in amounts | `true` |
| `showCurrencyOnFocus` | Defines if currency should be shown on input focus | `false` |
| `showCurrencyOnHover` | Defines if currency should be shown on input hover | `false` |
| `currencySymbol` | Defines currency symbol to display | `null` |
| `currencySymbolPlacement` | Defines where currencySymbol will be displayed. Possible values `p` for prefix and `s` for suffix | `p` |
| `maxValue` | The maximum value that can be entered | `99999999999999.98` |

Our Input will receive these options as an Object in prop `options` as the example below:
```
options = {
	digitGroupSeparator: '',
	decimalChar: '.',
	alwaysAllowDecimalCharacter: true,
	showCurrencyOnFocus: false,
	showCurrencyOnHover: false,
	currencySymbolPlacement: 'p',
	currencySymbol: '',
	maxValue: 99999999999999.98
}
```
## TODO List

#### Options to be added to input:
- emptyInputBehavior
- decimalsLengthAllowed

## Changelog

- 0.1.13 - update vue-format-amount-input component blurEvent
