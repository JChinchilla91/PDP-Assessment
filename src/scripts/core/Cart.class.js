/**
 * JS Class implementation of Shopify Core Cart
 * Section Class is exported to window.bluedgeusa.core namespace
 *
 * This class can be extended for Advanced features - Like dynamic edition of the cart.
 * Also use by PDP with Quantity Control for Add To Cart
 *
 * NOTE: Need Polyfill for older browsers
 */
'use strict';


/**
 * Cart constructor
 * We cannot rely on object.constructor.name to differentiate the instantiation from 
 * this class or a class extending it. Mostly because of IE and transpiler changing function/class name. 
 * So we use a String: context.
 * @param {String} context - Must be the Class Name
 */
class Cart {
	constructor(context) {
		this._context = context;

		// SELECTORS
		this._selectors 	= {
			drawerCartContainer 	: '[data-dynamic-qty]',
			pageContainer			: 'main',
			checkboxes				: '[data-checkboxes]',
			checkoutBtn				: '[name="checkout"]',
			quantityControls		: '[data-qty-controls] input, [data-qty-controls] button'
		};
		
		// ELEMENTS
		this._container				= (this._context === 'DynamicCart') 
			? document.querySelector(this._selectors.drawerCartContainer)
			: document.querySelector(this._selectors.pageContainer);
		
		this.checkboxes				= document.querySelectorAll(this._selectors.checkboxes);
		
		// VARIABLES
		this._cookiesEnabled 		= this.cookiesEnabled;
		
		// EVENTS
		document.addEventListener('core:cart:quantity:reload', (e) => this.reloadCartPageEvent(e));
		
		// INIT 
		this.activateQuantityControls();
		this._formValidation();
	}

	/**
	 * Activate Quantity controls
	 * Add event handler for each type of control
	 * Note: In Cart page context we keep only controls
	 * on the page itself excluding the Drawer Cart
	 */
	activateQuantityControls() {
		const controls = this._container.querySelectorAll(this._selectors.quantityControls);
		
		controls.forEach((control) => {
			if (!control.getAttribute('has-event')) {
				// BUTTONS
				if (control.tagName === 'BUTTON') {
					control.addEventListener('click', window.bluedgeusa.core.Utils.debounce((e) => { this._quantityChange(e) }, 700));
				} else if (control.tagName === 'INPUT') {
					control.addEventListener('keyup', window.bluedgeusa.core.Utils.debounce((e) => { this._quantityChange(e) }, 600));
				}
				
				// Add an attribute to avoid multiple EventListener to attach to the same element
				// Anonymous function fails to be detached when the activateQuantityControls function
				// is called again by the child class
				control.setAttribute('has-event', true);
			}
		});
	}

	/**
	 * Reload Page Event
	 * for CART page only
	 * @param {Object} e
	 */
	reloadCartPageEvent() {
		if (window.bluedgeusa.theme.currentPage === 'cart')
			document.querySelector('[name="update"]').click();
	}
	
	/**
	 * Validate Checkboxes
	 * often used for legal agreements
	 * @param {Object} e
	 */
	_formValidation() {
		if (!this.checkboxes.length) return;
		const forms = Array.from( document.querySelectorAll('form.needs-validation') );
		
		forms.forEach((form) => {
			form.querySelector('[name="checkout"]').addEventListener('click', (e) => {
				if (!form.checkValidity()) {
					e.preventDefault();
					e.stopPropagation();
				}
				form.classList.add('was-validated');
			}, false);
		});
	}
	
	/**
	 * On Quantity change
	 * @param {Object} e
	 */
	_quantityChange(e) {
		const targetID = e.target.getAttribute('data-qty-target');
		const sign = e.target.getAttribute('data-qty-change');
		const tag = e.target.tagName;

		// Select the input target if not the generate by the input itself
		let input = (tag === 'INPUT') ? e.target : document.getElementById(targetID);

		// If input is undefined it means we are on a PDP - Id must be `Quantity`
		if (!input && this._context === 'pdp') input = document.getElementById('Quantity');

		const key = input.getAttribute('data-key');
		
		let val = ~~input.value;
		let eventName = null;
		
		// Event from Input
		// Note: the double setAttribute / Value is need or it fails sometimes
		if (tag === 'INPUT') {
			// Prevent 0 or null entry
			if (val < 1) {
				val = 1;
				input.setAttribute('value', val);
				input.value = val;
			}
		} else {
			// Event from + / - buttons
			if (sign === 'minus') {
				// Prevent zero or lower value
				const v = val - ~~e.detail;
				const newValue = (v > 1) ? v : 1;
				input.setAttribute('value', newValue);
				input.value = newValue;
			} else {
				input.setAttribute('value', val + ~~e.detail);
				input.value = val + ~~e.detail;
			}	
		}
		
		// Create Events
		if (this._context === 'Cart') {
			eventName = 'core:cart:quantity:reload'; // Unique to Cart Class
		} else {
			eventName = 'core:cart:quantity'; // For Class extending the Cart class.
		}

		// Dispatch Event (except for PDP)
		if (this._context !== 'pdp') {
			document.dispatchEvent( 
				new CustomEvent(eventName, { detail: { qty: input.value, key: key, targetID: targetID, action: sign } }) 
			);
		}
	}
		
	/**
	 * Browser cookies are required to use the cart. This function checks if
	 * cookies are enabled in the browser.
	 */
	get cookiesEnabled() {
		let cookieEnabled = navigator.cookieEnabled;
		
		if (!cookieEnabled) {
			document.cookie = 'testcookie';
			cookieEnabled = (document.cookie.indexOf('testcookie') !== -1);
		}
		
		// SET classes
		if (cookieEnabled)
			document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
		
		return cookieEnabled;
	}
}


window.bluedgeusa.core.Cart = Cart;