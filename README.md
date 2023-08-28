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
| `alwaysAllowDecimalCharacter` | Allows/Disables decimals in amounts | `true` |
| `allowNegativeValues` | Allows/Disables negative amounts | `false` |
| `showCurrencyOnFocus` | Defines if currency should be shown on input focus | `false` |
| `showCurrencyOnHover` | Defines if currency should be shown on input hover | `false` |
| `currencySymbol` | Defines currency symbol to display | `null` |
| `currencySymbolPlacement` | Defines where currencySymbol will be displayed. Possible values `p` for prefix and `s` for suffix | `p` |
| `maxValue` | The maximum value that can be entered | `999999999999999999999999.99` |
| `isIOS` | Boolean to set inputMode when used on mobile apps/browsers | `false` |

Our Input will receive these options as an Object in prop `options` as the example below:
```
options = {
	digitGroupSeparator: '',
	decimalChar: '.',
	alwaysAllowDecimalCharacter: true,
	allowNegativeValues: false,
	showCurrencyOnFocus: false,
	showCurrencyOnHover: false,
	currencySymbolPlacement: 'p',
	currencySymbol: '',
	maxValue: 99999999999999999999999.99
}
```
## TODO List

#### Options to be added to input:
- emptyInputBehavior
- decimalsLengthAllowed

## Changelog

- 0.1.13 - update vue-format-amount-input component blurEvent
- 0.1.14 - build fixing
- 0.1.15 - fixed behaviour of hover/focus when no currency is provided
- 0.1.16 - fixed currency length validator when no currency is provided
- 0.1.17 - updated blur function when no currency is provided
- 0.1.18 - added option to have negative amounts
- 0.1.19 - fixed bug when clearing negative value
- 0.2.00 - changed maxValue logic and default value; To prevent Scientific notation on numbers value is now returned and used as a string
- 0.2.01 - fixed bug when changing currency and input had no content
- 0.2.02 - fixed variable used to compare maxValue and validation
- 0.2.03 - fixed logic behind removing currency from value
- 0.2.04 - removed console.logs
- 0.2.05 - fixed logic when on clear of value, currency would be showed; fixed setSelectionRange to only be trigger if user is focus on input
- 0.2.06 - Fixed maxValue validations and handling; Fixing replacing numbers
- 0.2.07 - Fixed maxValue validations for decimals and numbers with currencies
- 0.2.08 - Fixed maxValue validation when number has same length; fixed validation when swapping amounts
- 0.2.09 - Added watch to handleMaxValue change on input lifetime
- 0.2.10 - Added logic on initial value setup, so decimals (when allowed) are showed on mounted
- 0.2.11 - Fixed validation for maxValue on initial render with value
- 0.2.12 - Added missing validation before trying to stringify value
- 0.2.13 - Added missing validations for value on watch
- 0.2.14 - Fixed blur logic when value is empty
- 0.2.15 - Added inputMode to input, and option to help define inputMode specifc for iOS apps/browsers
- 0.2.16 - Added logic for pasted values when they fall out of maxValue
- 0.2.17 - Fixed validation for decimalsChars; Fixed maxValue logic when having decimals
- 0.2.18 - Fixed formating value before emiting it when its value is negative