/**
 * Section Class is exported to window.bluedgeusa.theme namespace
 * Shopify Configurator events available:
 * onLoad, onUnload, onSelect, onDeselect, onReorder, onBlockSelect, onBlockDeselect
 * 
 * NOTE: Event host the variant object in e.detail
 *
 * NOTE: Need Polyfill for older browsers
 */
'use strict';

import './Product.class.js';


/**
 * ProductQuickShop constructor
 *
 * @param {DOM} container
 * @param {String} type
 * @param {String} id
 */
class ProductQuickShop extends window.bluedgeusa.theme.Product {
	constructor(container, type, id) {
		super(container, type, id);

		// SELECTORS (Merge with parent Class)
		this._selectors = Object.assign(this._selectors, {
			quantityControls:		'[data-qty-controls] input, [data-qty-controls] button'
		});


		// INIT
		this.init();
	}

	/**
	 * Init function
	 * Useful for extending Classes 
	 */
	init() {
		// JSON
		this.productDATA			= JSON.parse(this._container.querySelector(this._selectors.productJSON).innerHTML);
		
		// ELEMENTS (Pre-selected)
		this.addToCartBtn 			= this._container.querySelector(this._selectors.addToCartBtn);
		this.properties				= this._container.querySelectorAll(this._selectors.properties);
		this.quantity				= this._container.querySelector(this._selectors.quantity);
		this.selectorBlocks 		= this._container.querySelectorAll(this._selectors.selectorBlocks);
		
		// Options
		this._options = {
			container				: this._container,
			enableHistoryState		: false,
			singleOptionSelector	: this._selectors.singleOptionSelector,
			productDATA				: this.productDATA
		};
		
		// Variants
		this.variants				= new window.bluedgeusa.core.Variants(this._options);

		// Update the current Variant in JS
		window.bluedgeusa.product.currentVariant = this.variants._currentVariant;

		// EVENT HANDLERS
		// Custom <Select> option selectors
		// We use 'mousedown' event to be sure to trigger before the `click` listener in the Variants Class
		this.selectorBlocks.forEach(selector =>
			selector.addEventListener('mousedown', (e) => {
				/* Event delegation on LI */
				if (e.target.nodeName === "LI") this.setCustomOptionSelect(e, selector);
			})
		);
		
		// Note variant from Variants class is stored in e.detail
		this._container.addEventListener('variantChange', (e) => {
			this.updateVariantSKU(e);
			this.updateAddToCartState(e);
		});
		this._container.addEventListener('variantPriceChange', (e) => this.updateVariantPrice(e));
		this.addToCartBtn.addEventListener('click', (e) => this.addToCart(e));

		// Init Qty Controls
		this.quickActivateQuantityControls();
	}

	/**
	 * Activate Quantity controls
	 * Add event handler for each type of control
	 * Note: In Cart page context we keep only controls
	 * on the page itself excluding the Drawer Cart
	 */
	quickActivateQuantityControls() {
		const controls = this._container.querySelectorAll(this._selectors.quantityControls);

		controls.forEach((control) => {
			if (!control.getAttribute('has-event')) {
				// BUTTONS
				if (control.tagName === 'BUTTON') {
					control.addEventListener('click', window.bluedgeusa.core.Utils.debounce((e) => { this._quickQuantityChange(e) }, 700));
				} else if (control.tagName === 'INPUT') {
					control.addEventListener('keyup', window.bluedgeusa.core.Utils.debounce((e) => { this._quickQuantityChange(e) }, 600));
				}

				// Add an attribute to avoid multiple EventListener to attach to the same element
				// Anonymous function fails to be detached when the quickActivateQuantityControls function
				// is called again by the child class
				control.setAttribute('has-event', true);
			}
		});
	}

	/**
	 * On Quantity change
	 * @param {Object} e
	 */
	_quickQuantityChange(e) {
		const targetID = e.target.getAttribute('data-qty-target');
		const sign = e.target.getAttribute('data-qty-change');
		const tag = e.target.tagName;

		// Select the input target if not the generate by the input itself
		let input = (tag === 'INPUT') ? e.target : document.getElementById(targetID);

		// Id must be `Quantity` on PDP Modal
		input = document.getElementById('Quantity');

		let val = ~~input.value;

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
		
		// Update Value
		this.quantity.value = input.value;
	}
}


// Export to theme namespace
window.bluedgeusa.theme.ProductQuickShop = ProductQuickShop;