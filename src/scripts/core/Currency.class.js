/**
 * JS Class implementation of Shopify Core Currency
 * Section Class is exported to window.bluedgeusa.core namespace
 *
 * This class use STATIC Methods.
 *
 * NOTE: Need Polyfill for older browsers
 */
'use strict';


class Currency {	
	/**
	 * Format money values based on your shop currency settings
	 * @param  {Number|string} cents - value in cents or dollar amount e.g. 300 cents or 3.00 dollars
	 * @param  {String} format - Optional if different from the Store general settings
	 * @returns {String} value - formatted value
	 */
	static formatMoney(cents, format) {
		let storeMoneyFormat = window.bluedgeusa.theme.moneyFormat || '${{amount}}';
		let value = '';
		const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
		
		// /if not price return empty string
		// Used for empty compared at price
		if (!cents)
			return '';
		
		// Change default Money format if provided
		if (format) 
			storeMoneyFormat = format;
		
		// Format string
		if (typeof cents === 'string')
			cents = cents.replace('.', '');
			
		// Return final formatting
		switch (storeMoneyFormat.match(placeholderRegex)[1]) {
			case 'amount':
				value = this._formatWithDelimiters(cents, 2);
				break;
			case 'amount_no_decimals':
				value = this._formatWithDelimiters(cents, 0);
				break;
			case 'amount_with_comma_separator':
				value = this._formatWithDelimiters(cents, 2, '.', ',');
				break;
			case 'amount_no_decimals_with_comma_separator':
				value = this._formatWithDelimiters(cents, 0, '.', ',');
				break;
		}
		
		return storeMoneyFormat.replace(placeholderRegex, value);
	}
	
	/**
	 * Format with delimiters
	 * @param {Number} number
	 * @param {Number} precision
	 * @param {String} thousands
	 * @param {String} decimal
	 * @returns {Float}
	 */
	static _formatWithDelimiters(number, precision = 2, thousands = ',', decimal = '.') {
		if (isNaN(number) || number == null)
			return 0;
			
		number = (number / 100.0).toFixed(precision);
		const parts = number.split('.');
		const dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${thousands}`);
		const centsAmount = parts[1] ? decimal + parts[1] : '';
		
		return dollarsAmount + centsAmount;
	}
}


window.bluedgeusa.core.Currency = Currency;