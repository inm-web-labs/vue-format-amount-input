<template>
	<input
	type="text"
	ref="inputDomRef"
	:inputmode="options.isIOS ? 'decimal' : 'numeric'"
	:value="_value"
	:placeholder="placeholder"
	:disabled="disableInput"
	@keydown="keydownHandler"
	@input="inputValueHandler"
	@focus="focusHandler"
	@blur="blurHandler"
    @keyup.enter="emit('onEnter')"
	@mouseover="mouseOverHandler"
	@mouseleave="mouseLeaveHandler"/>
</template>

<script setup>
/* Vue */
import { ref, computed, watch, onMounted } from 'vue'

/* Emmitters */
const emit = defineEmits(['input', 'keydown', 'blur', 'onEnter', 'pastedValueFallsOutOfMaxValue'])

/** props received
@value { String, Number }
@placeholder { String }
@options { Object } each item is an Object
	- digitGroupSeparator { String } default value => '.'
	- decimalChar: { String } default value => '.'
	- alwaysAllowDecimalCharacter { Boolean } default value => true
	- allowNegativeValues { Boolean } default value => false
	- showCurrencyOnFocus: { Boolean } default value => false
	- showCurrencyOnHover: { Boolean } default value => false
	- currencySymbolPlacement: { String } default value => 'p'
	- currencySymbol: { String } default value => ''
	- maxValue: { String } default value => '99999999999999999999999.99'
	- isIOS: {Boolean} default value => false, we need this to specify inputmode when using this plugin on mobile apps/browsers
*/
const props = defineProps({
	value: [String, Number],
	placeholder: String,
	options: Object
})

/*************************************************
*                                                *
*                   Options                      *
*                                                *
*************************************************/
const defaultOptions = {
	emptyInputBehavior: null, /* not handle yet */
	digitGroupSeparator: '',
	decimalChar: '.',
	decimalsAllowed: 2, /* not handle yet */
	alwaysAllowDecimalCharacter: true,
	allowNegativeValues: false,
	showCurrencyOnFocus: false,
	showCurrencyOnHover: false,
	currencySymbolPlacement: 'p',
	currencySymbol: '',
	maxValue: '999999999999999999999999.99'
}

/* Joining default options with received */
const options = computed(() => {
	return {
		...defaultOptions,
		...props.options,
		maxValue: props.options.maxValue || defaultOptions.maxValue
	}
})

const currencyLengthAtLeft = computed(() => {
	if (options.value.currencySymbolPlacement === 's' || !options.value.currencySymbol.length) return 0
	return options.value.currencySymbol.length + 1 // 1 is the space between our currency and number
})

const currencyLengthAtRight = computed(() => {
	if (options.value.currencySymbolPlacement === 'p' || !options.value.currencySymbol.length) return 0
	return options.value.currencySymbol.length + 1 // 1 is the space between our currency and number
})

/*************************************************
*                                                *
*                VALIDATORS HELPERS              *
*                                                *
*************************************************/
const isValidSeparator = key => {
	return !!ALLOWED_DECIMAL_SEPARATORS.find(separator => separator === key)
}
const isDigit = key => { return !!key.match(INTEGER_PATTERN) }
const allowNegativeSign = (value, index, key) => {
	if (!options.value.allowNegativeValues && key === '-') return false
	if (key === '-' && index - (value.includes(options.value.currencySymbol) ? currencyLengthAtLeft.value : 0) === 0) return true
}
const addDecimalsToValue = value => {
	if (!value) return ''

	let _value = value.includes(options.value.decimalChar) ? value : `${value}${options.value.decimalChar}`

	const currentDecimals = _value.split(options.value.decimalChar)[1].length
	const decimalsToAdd = options.value.decimalsAllowed - currentDecimals

	/* we need to round current decimals */
	if (decimalsToAdd < 0) {
		_value = _value.substring(0, _value.length + decimalsToAdd)
	} else {
		_value = _value.padEnd(_value.length + decimalsToAdd, '0')
	}
	return _value
}

/*
* Remove currency from value
@value { String }
@return { String }
*/
const removeCurrencySymbol = value => {
	if (options.value.currencySymbol.length) {
		return value.replace(` ${options.value.currencySymbol}`, '').replace(`${options.value.currencySymbol} `, '')
	} else return value
}

const parseMaxValue = maxValue => {
	let toWorkMaxValue = options.value.maxValue

	if (!ALLOWED_DECIMAL_SEPARATORS.find(separator => toWorkMaxValue.includes(separator))) toWorkMaxValue = addDecimalsToValue(toWorkMaxValue)
	return toWorkMaxValue
}

const validateIfAmountInsideMaxValueRange = (value) => {
	let _value = removeCurrencySymbol(value)

	/* Adding decimals allowed to our number for lengths compares */
	_value = addDecimalsToValue(_value)
	_value = _value.replaceAll(options.value.digitGroupSeparator, '')

	const toWorkMaxValue = parseMaxValue(options.value.maxValue)
	/* First we check length, if length is lower we know the value is in range */
	if (_value.length < toWorkMaxValue.length) return true
	/* If the length is the same we will need to check each position */
	else if (_value.length === toWorkMaxValue.length) {
		let numberIsInRange = true
		let i = 0

		while (numberIsInRange && i < _value.length) {
			/* If value has same length, and number is smaller than same position, we know the value is smaller in a whole */
			if (_value[i] !== options.value.decimalChar && parseInt(_value[i]) < parseInt(toWorkMaxValue[i])) {
				break
			} else if (_value[i] !== options.value.decimalChar && parseInt(_value[i]) > parseInt(toWorkMaxValue[i])) {
				numberIsInRange = false
			}
			i++
		}

		return numberIsInRange
	} else return false
}

/*************************************************
*                                                *
*                     DATA                       *
*                                                *
*************************************************/
const ALLOWED_DECIMAL_SEPARATORS = [',', '.', '٫']
const INTEGER_PATTERN = '(0|[1-9]\\d*)'

const getInitValue = () => {
	let parsedValue
	if (props.value || props.value === 0) {
		parsedValue = props.value.toLocaleString('fullwide', { useGrouping: false })
		ALLOWED_DECIMAL_SEPARATORS.forEach(separator => { parsedValue = parsedValue.replaceAll(separator, options.value.decimalChar) })
	}

	if ((props.value || props.value === 0) && validateIfAmountInsideMaxValueRange(parsedValue)) {
		let initialValue = props.value
		/* If we have value and its has no decimals, if the number have have decimals we will need to display them on mounted */
		if (!initialValue.toString().includes('.') && options.value.alwaysAllowDecimalCharacter) {
			initialValue = initialValue.toFixed(options.value.decimalsAllowed)
		}

		return initialValue.toString()
	} else {
		return ''
	}
}

const _value = ref(getInitValue())
const inputDomRef = ref('')
const showCurrency = ref(false)
const disableInput = ref(true)
const inputOnFocus = ref(false)
const triggerFocusCaret = ref(false)
/* we could also use selectionStart, since both props are the same when writing */
const currentCaretPositon = ref(0)
const valueHasNegativeChar = ref(false)
const replaceZerosLeft = ref(false)

/*************************************************
*                                                *
*                   WATCHERS                     *
*                                                *
*************************************************/
/* We want to watch external changes on value and re-format our input value when it changes */
watch(() => props.value, (newVal, oldVal) => {
	if (newVal === formatToOnlyAmount(_value.value)) return
	_value.value = getInitValue(newVal)
	setTimeout(() => handleValueChange(inputDomRef.value, true), 0)
})

/* Watching if currency change, and reformat our value */
watch(() => options.value.currencySymbol, (newVal, oldVal) => {
	if (_value.value.length && _value.value.includes(oldVal)) _value.value = changeCurrencySymbol(_value.value, newVal, oldVal)
})

/* Watching if currency change, and reformat our value */
watch(() => options.value.maxValue, (newVal, oldVal) => {
	if (props.value) {
		let parsedValue = props.value.toLocaleString('fullwide', { useGrouping: false })
		ALLOWED_DECIMAL_SEPARATORS.forEach(separator => { parsedValue = parsedValue.replaceAll(separator, options.value.decimalChar) })

		if (!validateIfAmountInsideMaxValueRange(parsedValue)) {
			_value.value = options.value.maxValue
			setTimeout(() => handleValueChange(inputDomRef.value, true), 0)
		}
	}
})
/*************************************************
*                                                *
*              VALUE CHANGE HANDLERS             *
*                                                *
*************************************************/
/*
* Function to handle onKeydown
@$event { DOM Event }
@return { void }
*/
const keydownHandler = $event => {
	emit('keydown', $event)

	const elem = $event.target
	currentCaretPositon.value = elem.selectionEnd

	if (!options.value.alwaysAllowDecimalCharacter && isValidSeparator($event.key)) {
		$event.preventDefault()
		return
	}

	/* Handling keydown on arrows to skip separators  */
	if (($event.key === 'ArrowLeft' || $event.key === 'ArrowRight') && !$event.shiftKey) {
		const charToValidate = $event.key === 'ArrowLeft'
			? elem.value.charAt(elem.selectionEnd - 2)
			: elem.value.charAt(elem.selectionEnd + 1)

		if (charToValidate === options.value.digitGroupSeparator || charToValidate === options.value.decimalChar) {
			currentCaretPositon.value = $event.key === 'ArrowLeft' ? elem.selectionEnd - 1 : elem.selectionEnd + 1
			setCaretPosition(elem, currentCaretPositon.value)
		}
	}

	/* Preventing zeros from being inserted at left of number if we already have a decimalChar */
	if ($event.key === '0' &&
		elem.selectionEnd === currencyLengthAtLeft.value &&
		elem.value.includes(options.value.decimalChar)) {
		$event.preventDefault()
		return
	}

	/* Replacing zero at left, if another number is inserted at left of decimalChar */
	if (isDigit($event.key) &&
		elem.value.charAt(currencyLengthAtLeft.value) === '0' &&
		elem.selectionEnd - 1 === currencyLengthAtLeft.value) {
		/* saving caret position for setting it later */
		currentCaretPositon.value = $event.key === '0' ? elem.selectionEnd - 1 : elem.selectionEnd
		elem.value = stringReplaceAt(elem.value, currencyLengthAtLeft.value, $event.key === '0' ? '' : $event.key)
		setCaretPosition(elem, currentCaretPositon.value)

		updateValue(elem.value)
		$event.preventDefault()
		return
	}

    /* Replacing zero at left, if another number is inserted at left of decimalChar */
	if (isDigit($event.key) &&
		elem.value.charAt(currencyLengthAtLeft.value) === '0' &&
        elem.selectionEnd !== currencyLengthAtLeft.value &&
        elem.value.charAt(elem.selectionEnd) !== options.value.decimalChar) {
        replaceZerosLeft.value = true
	}

	/* Preventing user from adding more than one decimalChar */
	if (isValidSeparator($event.key) && elem.value.includes(options.value.decimalChar)) {
		/* When user selects numbers to replace, and has the decimal char inside this selection, we want to allow the place of new decimal char */
		if (elem.selectionStart !== elem.selectionEnd) {
			let allowDecimal = false
			for (var i = elem.selectionStart; i < elem.selectionEnd; i++) {
				if (isValidSeparator(elem.value.charAt(i))) {
					allowDecimal = true
					break
				}
			}

			if (allowDecimal) {
				currentCaretPositon.value = elem.selectionStart + 1

				elem.value = elem.value.slice(0, elem.selectionStart) + options.value.decimalChar + elem.value.slice(elem.selectionEnd)
				setCaretPosition(elem, currentCaretPositon.value)
				handleValueChange(inputDomRef.value, true)
				$event.preventDefault()
				return
			}
		}

		if (isValidSeparator(elem.value.charAt(elem.selectionEnd))) {
			currentCaretPositon.value = elem.selectionEnd + 1
			setCaretPosition(elem, currentCaretPositon.value)
		}

		$event.preventDefault()
		return
	}

	/* If we have no decimalChar, we are changing the decimalChar entered to the one in our options */
	if (isValidSeparator($event.key) && !elem.value.includes(options.value.decimalChar)) {
		/* If user is inserting decimal char at the end of our number */
		if (elem.selectionEnd === elem.value.length - currencyLengthAtRight.value) {
			/*
			* Validating if we have numbers before decimalChar,
			* If not, we will add a zero before our decimalChar
			*/
			const additionalValueBeforeDecimal = !removeCurrencySymbol(elem.value).length ? '0' : ''

			if (options.value.currencySymbolPlacement === 's') {
				elem.value = elem.value.slice(0, elem.selectionEnd) + additionalValueBeforeDecimal + options.value.decimalChar + elem.value.slice(elem.selectionEnd)

				currentCaretPositon.value = currentCaretPositon.value + 1 + additionalValueBeforeDecimal.length
				setCaretPosition(elem, currentCaretPositon.value)
			} else {
				elem.value = elem.value + additionalValueBeforeDecimal + options.value.decimalChar
			}
			$event.preventDefault()
			return
		}

		if (isValidSeparator(elem.value.charAt(elem.selectionEnd))) {
			elem.value = stringReplaceAt(elem.value, elem.selectionEnd, options.value.decimalChar)
			currentCaretPositon.value = elem.selectionEnd + 1
			setCaretPosition(elem, currentCaretPositon.value)
		} else {
			currentCaretPositon.value = elem.selectionEnd
			elem.value = elem.value.slice(0, elem.selectionEnd) + options.value.decimalChar + elem.value.slice(elem.selectionEnd)
		}
		handleValueChange(inputDomRef.value, true)
		$event.preventDefault()
		return
	}

	/* To handle decimal logic */
	const valNoCurrency = options.value.currencySymbolPlacement === 's' ? removeCurrencySymbol(elem.value) : elem.value
	/* Preventing user from writinig more than two decimals chars */
	if (isDigit($event.key) &&
		checkDecimalCharsLength(valNoCurrency) >= options.value.decimalsAllowed &&
		elem.selectionStart === elem.selectionEnd &&
		elem.selectionEnd === valNoCurrency.length) {
		$event.preventDefault()
	}

	/* Validating if next value will be bigger than maxValue */
	if (isDigit($event.key) && elem.selectionStart === elem.selectionEnd) {
		const newValue = elem.value.slice(0, elem.selectionStart) + $event.key + elem.value.slice(elem.selectionStart)
		if (!validateIfAmountInsideMaxValueRange(newValue)) {
			$event.preventDefault()
			return
		}
	}

	/*
	* If we already have 2 decimals chars,
	* and user is trying to insert another one, we will want to change the next decimal to new inserted value
	*/
	if (isDigit($event.key) &&
		checkDecimalCharsLength(valNoCurrency) >= options.value.decimalsAllowed &&
		elem.selectionEnd >= (valNoCurrency.length - options.value.decimalsAllowed) &&
		elem.selectionEnd !== valNoCurrency.length &&
		elem.selectionStart === elem.selectionEnd) {
		/*
		* If our caret position is bigger than our valNoCurrency.length, and currencySymbolPlacement is s,
		* it means user is trying to insert numbers "inside/after" our currencySymbol
		*/
		if (elem.selectionEnd > valNoCurrency.length && options.value.currencySymbolPlacement === 's') {
			currentCaretPositon.value = valNoCurrency.length
		} else {
			/* saving caret position for setting it later */
			currentCaretPositon.value = elem.selectionEnd + 1
			elem.value = stringReplaceAt(elem.value, elem.selectionEnd, $event.key)
		}
		setCaretPosition(elem, currentCaretPositon.value)

		updateValue(elem.value)
		$event.preventDefault()
	}
}

/*
* Function to handle onBlur
@$event { DOM Event }
@return { void }
*/
const blurHandler = $event => {
	if (!_value.value.length) {
		emit('blur')
		return
	}
	inputOnFocus.value = false

	const valueWithoutCurrency = removeCurrencySymbol(_value.value)
	const rawValue = valueWithoutCurrency.replace('-', '')

	if (rawValue.length > 0 && options.value.alwaysAllowDecimalCharacter) {
		const currencyPrefix = options.value.currencySymbolPlacement === 'p'
		/* Creating a string with options.value.decimalsAllowed zeros */
		const decimalsNeeded = options.value.decimalsAllowed - checkDecimalCharsLength(rawValue)
		const decimals = Array.from({ length: decimalsNeeded }, (v, k) => '0').join('')
		/* we should use raw value if we want to hide negative sign, no sense in showing -0.00 */
		const applyNegativeSymbol = parseFloat(unformat(rawValue)) > 0

		let temp
		if (_value.value.includes(options.value.decimalChar)) {
			temp = `${applyNegativeSymbol ? valueWithoutCurrency : rawValue}${decimals}`
		} else {
			temp = `${applyNegativeSymbol ? valueWithoutCurrency : rawValue}${options.value.decimalChar}${decimals}`
		}

		if (options.value.currencySymbol.length) {
			$event.target.value = currencyPrefix ? `${options.value.currencySymbol} ${temp}` : `${temp} ${options.value.currencySymbol}`
		} else $event.target.value = temp
		updateValue($event.target.value)
	/* If our input only has the negative sign, we want to remove it on blur */
} else if (rawValue.length <= 0) {
		valueHasNegativeChar.value = false
		$event.target.value = $event.target.value.replace('-', '')
		updateValue($event.target.value)
		setCurrencyShowValue(false)
	} else {
		setCurrencyShowValue(false)
	}
	setTimeout(() => emit('blur', $event))
}

/* Logic to display currencySymbol on Focus / mouseOverHandler / mouseLeaveHandler, when input is empty */
const preventEmitInput = ref(false)
const focusHandler = $event => {
	preventEmitInput.value = false
	if (!inputOnFocus.value) triggerFocusCaret.value = true
	inputOnFocus.value = true
	if (options.value.currencySymbol) setCurrencyShowValue(true)
}

const mouseOverHandler = $event => {
	if (options.value.showCurrencyOnHover && options.value.currencySymbol && !inputOnFocus.value) {
		setCurrencyShowValue(true, 'preventEmitInput')
	}
}
const mouseLeaveHandler = $event => {
	if (options.value.showCurrencyOnHover && !inputOnFocus.value) setCurrencyShowValue(false, 'preventEmitInput')
}

const setCurrencyShowValue = (state, preventEmitInput) => {
	showCurrency.value = state
	const valueWithoutCurrency = removeCurrencySymbol(_value.value)

	if (valueWithoutCurrency.length <= 0) {
		if (!state) currentCaretPositon.value = 0
		setTimeout(() => handleValueChange(inputDomRef.value, true, preventEmitInput), 0)
	}
}

/*
* Function to handle onInput
@$event { DOM Event }
@return { void }
*/
const inputValueHandler = $event => {
	const elem = $event.target

	/* Removing DecimalChar if user deletes all decimalChars */
	if ($event.inputType === 'deleteContentBackward' && elem.value.includes(options.value.decimalChar)) {
		var checkIfDecimals = elem.value.split(options.value.decimalChar)[1]
		if (checkIfDecimals.length === 0) elem.value = elem.value.split(options.value.decimalChar)[0]
	}

	currentCaretPositon.value = elem.selectionEnd
	valueHasNegativeChar.value = false
	handleValueChange(elem, $event.inputType === 'insertFromPaste', null, 'emitIfFallsOutOfMaxValue')
}

/*
* Removing all characters not allowed in numbers and separators
@elem { HTML ELEM }
@insertedFromPaste { Boolean }
@return { string }
*/
const handleValueChange = (elem, insertedFromPaste, preventEmitInput, emitIfFallsOutOfMaxValue) => {
	elem.value = removingUnwantedChars(elem.value)

	if (insertedFromPaste) {
		elem.value = handlePasteValue(elem.value)

		if (!validateIfAmountInsideMaxValueRange(elem.value) && emitIfFallsOutOfMaxValue) {
			emit('pastedValueFallsOutOfMaxValue')
			console.warn(`Value <${elem.value}> falls out of our maxValue <${parseMaxValue(options.value.maxValue)}>`)
			elem.value = ''
		}
	}

	const decimals = checkDecimalCharsLength(elem.value)
	elem.value = unformat(elem.value)
    if (replaceZerosLeft.value) elem.value = removeLeftZeros(elem.value, decimals)
	elem.value = format(elem.value, decimals)

	/**
	* If we just focus our input, and it's empty, and currency is placed as suffix,
	* we will position caret at the start
	*/
	if (removeCurrencySymbol(elem.value).length === 0 &&
		triggerFocusCaret.value &&
		options.value.currencySymbolPlacement === 's') {
		currentCaretPositon.value = 0
		triggerFocusCaret.value = false
	}
	setCaretPosition(elem, currentCaretPositon.value)

	updateValue(elem.value, preventEmitInput)
}

/*
* Removing all characters not allowed in numbers and separators
@value { String }
@return { string }
*/
const removingUnwantedChars = value => {
	if (!value) return ''
    var valueArray = value.split('')
	var valueArrayLength = valueArray.length

	var newValueArray = []

    for (var y = 0; y < valueArrayLength; y++) {
		if (allowNegativeSign(value, y, valueArray[y])) valueHasNegativeChar.value = true

		if ((isValidSeparator(valueArray[y]) && options.value.alwaysAllowDecimalCharacter) || isDigit(valueArray[y])) {
			newValueArray.push(valueArray[y])
		} else if (y < currentCaretPositon.value && !(allowNegativeSign(value, y, valueArray[y]))) {
			/* if we remove a char before our caret position, we need to subtract 1 to it's position for every nonvalid char */
			currentCaretPositon.value--
		}
    }
    return newValueArray.join('')
}

/** Validating pastedValue decimals and formats
@payload { string }
@return { number }
*/
const handlePasteValue = pastedValue => {
	let value = removingUnwantedChars(pastedValue)

	if (!pastedValue.length) valueHasNegativeChar.value = false

	/*
	* Second we will check if this value is a valid number
	*/
	if (!isNaN(value)) return parseFloatAndFormat(value)

	/*
	* Validating how many separators exist in our string, and which ones
	*/
	const separatorsInString = [] // { separator: count }
	ALLOWED_DECIMAL_SEPARATORS.forEach(separator => {
		if (!value.includes(separator)) return

		const count = value.length - value.replaceAll(separator, '').length
		separatorsInString.push({ separator: separator, count: count })
	})

	/* If we have only one separator we will treat it as our decimalChar separator */
	if (separatorsInString.length === 1 && separatorsInString[0].count === 1) {
		value = value.replace(separatorsInString[0].separator, '.')
		return parseFloatAndFormat(value)
	}

	/*
	* If we have more than one separator,
	* we will check if one of them appears only one time, and treat it as our decimalChar separator
	* We will use the first one we find
	*/
	const separatorUsedOnce = separatorsInString.find(obj => obj.count === 1)
	if (separatorsInString.length && !!separatorUsedOnce) {
		separatorsInString.filter(obj => obj.separator !== separatorUsedOnce.separator).forEach(separator => {
			value = value.replaceAll(separator.separator, '')
		})

		value = value.replace(separatorUsedOnce.separator, '.')
		return parseFloatAndFormat(value)
	}

	ALLOWED_DECIMAL_SEPARATORS.forEach(separator => { value = value.replaceAll(separator, '') })
	return parseFloatAndFormat(value)
}

const parseFloatAndFormat = value => {
	if (!options.value.alwaysAllowDecimalCharacter) return value

	const splitedValue = value.split('.')
	const decimalNumber = splitedValue[1] ? Number(`0.${splitedValue[1]}`).toFixed(options.value.decimalsAllowed) : ''
    const wholeNumber = splitedValue[0].length && splitedValue[0] !== 0 ? Number(splitedValue[0]) : splitedValue[0]

	return `${wholeNumber},${decimalNumber.replace('0.', '')}`.replace('.', options.value.decimalChar)
}

/*
* Validating how many decimals we have, we will need this to format our value again
@payload { string }
@return { number }
*/
const checkDecimalCharsLength = value => {
	let val = value.toString()
	/* var to save how many decimals chars value has */
	let decimalChars = null
	if (val.length === 0) return decimalChars

	/* Removing currencies to check decimals */
	val = removeCurrencySymbol(val)

	const valArray = val.split('')
	const initPosition = valArray.length - 1
	const endPosition = valArray.length - 3

    for (var y = initPosition; y >= endPosition && y > 0; y--) {
		const value = valArray[y]
        const isSeparator = !!ALLOWED_DECIMAL_SEPARATORS.find(separator => value.includes(separator))

		if (isSeparator) {
			decimalChars = initPosition - y
			break
		}
    }
	return decimalChars
}

/*
* Unformating our value to only have numbers in our string
@value { String }
@return { string }
*/
const unformat = value => {
	const val = value.toString()
	const numbers = val.replace(/\D+/g, '')

	currentCaretPositon.value = currentCaretPositon.value - (val.length - numbers.length)

	return numbers
}

const removeLeftZeros = (value, decimals) => {
    let charsToReplaceAtLeft = 0

    for (let index = 0; index < (value.length - (decimals + 1)); index++) {
        if (value.charAt(index) !== '0') break
        charsToReplaceAtLeft++
    }

    currentCaretPositon.value = currentCaretPositon.value - charsToReplaceAtLeft
    replaceZerosLeft.value = false
    return value.slice(charsToReplaceAtLeft)
}

/*
* Formating our value to display on input
@value { String }
@decimals { Number }
@return { string }
*/
const format = (value, decimals) => {
	let _value = value

	_value = applyingDecimals(_value, decimals)
	_value = applyingGroupSeparator(_value, decimals)
	_value = applyingNegativeSymbol(_value)
	_value = applyingCurrencySymbol(_value)
	return _value
}

/*
* Adding our decimal character to amount string
@value { String }
@decimals { Number }
@emitValue { Boolean }
@return { string }
*/
const applyingDecimals = (value, decimals, emitValue) => {
	let _value = value
	const decimalChar = emitValue ? '.' : options.value.decimalChar

	/* applying decimals if exist */
	if (decimals !== null) {
		/* applying separator from our options */
		_value = _value.slice(0, _value.length - decimals) + decimalChar + _value.slice(_value.length - decimals)
		currentCaretPositon.value++
	}

	return _value
}

/*
* Adding our digitGroupSeparator to amount string
@value { String }
@decimals { Number }
@return { string }
*/
const applyingGroupSeparator = (value, decimals) => {
	let separators = 0
	let _val = value.split(options.value.decimalChar)[0]
	const _decimals = decimals !== null ? `${options.value.decimalChar}${value.split(options.value.decimalChar)[1]}` : ''
	const valArray = _val.split('')
	const valArrayLength = valArray.length

	for (var i = 0; i < valArrayLength; i++) {
		if (i !== 0 && (valArrayLength - i) % 3 === 1 && (i - 2) > 0) {
			const sliceIndex = i - 2 + separators
			_val = _val.slice(0, sliceIndex) + options.value.digitGroupSeparator + _val.slice(sliceIndex)
			separators++
			currentCaretPositon.value++
		}
	}
	return `${_val}${_decimals}`
}

/*
* Adding negative sign to amount string
@value { String }
@return { String }
*/
const applyingNegativeSymbol = value => {
	if (!options.value.allowNegativeValues || !valueHasNegativeChar.value) return value
	return `-${value}`
}

/*
* Adding currency to amount string
@value { String }
@return { String }
*/
const applyingCurrencySymbol = value => {
	if ((!options.value.currencySymbol.length || !value.length) && !showCurrency.value) return value

	if (!value.length && !inputOnFocus.value) return value

	if (options.value.currencySymbolPlacement === 'p') {
		/* this 1 is the space between currency and value */
		currentCaretPositon.value = currentCaretPositon.value + currencyLengthAtLeft.value
		return `${options.value.currencySymbol} ${value}`
	} else {
		return `${value} ${options.value.currencySymbol}`
	}
}

/*
* Replace current currency for new one
@value { String }
@newCurrency { String }
@oldCurrency { String }
@return { String }
*/
const changeCurrencySymbol = (value, newCurrency, oldCurrency) => {
	return value.replace(oldCurrency, newCurrency)
}

/*
* Converts string to amount without formats and currencies
@value { String }
@return { string }
*/
const formatToOnlyAmount = value => {
	const decimals = checkDecimalCharsLength(value)
	let valueNumbered = unformat(value)
	if (!valueNumbered.length) return null

	valueNumbered = applyingDecimals(valueNumbered, decimals, true)

	/* Adding negative sign */
	if (options.value.allowNegativeValues && valueHasNegativeChar.value) valueNumbered = `-${valueNumbered}`

	return valueNumbered
}

/* Position input caret in specific position */
const setCaretPosition = (elem, position) => {
	/* We only needo/want to trigger the change of caret position if you is inputing the value */
	if (inputOnFocus.value) {
		elem.setSelectionRange(position, position)
	}
}

/*
* Replaces a number in our value string
@string { String }
@index { Number }
@replacementValue { String }
@return { string }
*/
const stringReplaceAt = (string, index, replacementValue) => {
	return string.substring(0, index) + replacementValue + string.substring(index + 1)
}

/* Update _value and emit it without format and currency */
const updateValue = (value, preventEmitInput) => {
	_value.value = value
	if (preventEmitInput) return
	emit('input', formatToOnlyAmount(value))
}

onMounted(() => {
	/* Warning user if the value exceeds max value allowed */
	if (props.value || props.value === 0) {
		let parsedValue = props.value.toLocaleString('fullwide', { useGrouping: false })
		ALLOWED_DECIMAL_SEPARATORS.forEach(separator => { parsedValue = parsedValue.replaceAll(separator, options.value.decimalChar) })

		if (!validateIfAmountInsideMaxValueRange(parsedValue)) {
			console.warn(`Value <${parsedValue}> falls out of our maxValue <${parseMaxValue(options.value.maxValue)}>`)
		}
	}
	handleValueChange(inputDomRef.value, true)
})
</script>
