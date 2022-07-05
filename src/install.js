import VueFormatAmountInput from './components/VueFormatAmountInput.vue'

export default {
	install(Vue, options) {
		// Let's register our component globally
		/* Plugin code goes here */
		Vue.component('vue-format-amount-input', VueFormatAmountInput)
	}
}
