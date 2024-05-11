/**
 * JS Class implementation of Shopify Core Variants
 * Section Class is exported to window.bluedgeusa.core namespace
 *
 * NOTE: Variants Host Add to Cart JS API AJAX call and trigger event (site wide, bubble up)
 *
 * NOTE: Need Polyfill for older browsers
 */
'use strict';


/**
 * Variant constructor
 *
 * @param {object} options
 */
class Variants {
	constructor(options) {
		this._container					= options.container;
		this._productDATA 				= options.productDATA;
		this._singleOptionSelector 		= options.singleOptionSelector;
		this._enableHistoryState 		= options.enableHistoryState;
		this._dynamicCartActive			= window.bluedgeusa.theme.dynamicCartActive || false;
		this._currentVariant 			= this._getVariantFromOptions();
		
		// Attach Event Handlers
		this._addEventHandlers();
	}

	/**
	 * Get Current Variant
	 */
	getCurrentVariant() {
		return this._currentVariant;
	}

	/**
	 * Set Current Variant
	 * @param {Object} variant
	 */
	setCurrentVariant(variant) {
		if (!variant) return;

		// SET CURRENT VARIANT
		this._currentVariant = variant;

		// UPDATE the Current Variant Id on the page (JS)
		window.bluedgeusa.product.currentVariant = variant;
	}
	
	/**
	 * Change selectors based on new Variant
	 * Used for programmatic change od selectors/variant Object
	 * @param {Integer} variantId
	 * @param {Object} e
	 */
	updateCurrentVariant(variantId, e) {
		if (!variantId || !this._productDATA.variants.length) return;
		
		// GET NEW VARIANT
		const [newVariant] = this._productDATA.variants.filter((variant) => variant.id === parseInt(variantId));
		if (!newVariant.length) return;
		
		// SET EACH SELECTORS' NEW VALUE
		newVariant['options'].forEach((option, index) => {
			const selector = document.getElementById(`SingleOptionSelector-${index}`);
			selector.value = option;
		});

		// SET CURRENT VARIANT OBJECT
		this.setCurrentVariant(newVariant);

		// TRIGGER NEW SELECT EVENT
		this._onSelectChange(e);
	}
	
	/**
	 * Prepare the Call to JS API Add to Cart
	 * @param {Integer} qty
	 * @param {Integer} variantId - Optional; will use currentVariant if not provided
	 * @param {Object} properties - Optional
	 * @param {Integer} sellingPlan - Optional
	 * @returns {Boolean}
	 */
	addToCart(qty, variantId = null, properties = null, sellingPlan = null) {
		if (!this._dynamicCartActive) return false;
		
		// Define variantId to add
		if (!variantId)
			variantId = this._currentVariant.id;

		// Build an array
		const item = [{
			quantity		: parseInt(qty),
			id				: variantId,
			selling_plan	: sellingPlan,
			properties		: properties
		}];

		// Fetch
		// Options, data, onSuccess, onFail
		return window.bluedgeusa.core.Connect.addToCart(item);
	}
	
	/**
	 * Attach event handlers
	 *
	 */
	_addEventHandlers() {
		const selectors = this._container.querySelectorAll(this._singleOptionSelector);
		
		// Split event between Select::change and Regular Element::click
		selectors.forEach((selector) => {
			if (selector.nodeName === 'SELECT' || selector.nodeName === 'INPUT')
				selector.addEventListener('change', (e) => this._onSelectChange(e));
			else
				selector.addEventListener('click', (e) => this._onSelectChange(e));
		});
	}
	
	/**
	 * Get the currently selected options from add-to-cart form. Works with all
	 * form input elements.
	 * @returns {array} options - Values of currently selected variants
	 */
	_getCurrentOptions() {
		const selectors = Array.from(this._container.querySelectorAll(this._singleOptionSelector));
		
		// Collect selectors data in an Array
		let currentOptions = selectors.map((selector) => {
			const type = selector.getAttribute('type');
			if (type === 'radio' || type === 'checkbox') {
				if (selector.checked)
					return { value: selector.value, index: selector.dataset.index };	
				else
					return false;
			}
			else if (selector.nodeName === 'SELECT') {
				return { value: selector.value, index: selector.dataset.index };
			} else {
				// Handle and regular DOM Element with data-value and data-selected attributes
				if (selector.dataset.selected === 'true') {
					return { value: selector.dataset.value, index: selector.dataset.index };
				} else {
					return false;
				}
			} 
		});

		// Remove any unchecked input values if using radio buttons or checkboxes
		return currentOptions.filter((option) => option.value);
	}
	
	/**
	 * Get the currently selected options from add-to-cart form. Works with all
	 * form input elements.
	 * @returns {array} options - Values of currently selected variants
	 */
	_getVariantFromOptions() {
		const selectedValues = this._getCurrentOptions();
		const variants = this._productDATA.variants;
		let found = null;
		
		variants.map((variant) => {
			let satisfied = true;
			selectedValues.map((option) => {
				if (satisfied) {
					// Handle selects and regular DOM Element with data-value and data-index attributes
					const value = option.value || option.dataset.value;
					const index = option.index || option.dataset.index;
					satisfied = (value === variant[index]);
				}
			});

			if (satisfied) found = variant;
		});
		
		return found;
	}
	
	/**
	 * Event handler for when a variant selector changes.
	 */
	_onSelectChange(e) {
		const variant = this._getVariantFromOptions();
		const detail = { 
			variant: variant, 
			selectedID: e.currentTarget.dataset.id,
			selectedValue: e.currentTarget.value || e.currentTarget.dataset.value, 
			selectedIndex: parseInt(e.currentTarget.dataset.optionIndex)
		};

		this._container.dispatchEvent(
			new CustomEvent('variantChange', { detail: detail })
		);
		
		if (!variant) return;

		// this._updateMasterSelect(variant);
		this._updateImages(detail);
		this._updatePrice(detail);
		
		// SET CURRENT VARIANT OBJECT
		this.setCurrentVariant(variant);
		this._updateHistoryState();
	}
	
	/**
	 * Trigger event when variant image changes
	 * @param {object} detail
	 * @returns {event}  variantImageChange
	 */
	_updateImages(detail) {
		const variantImage = detail.variant.featured_image || {};
		
		if (!detail.variant.featured_image || variantImage.src === this._currentVariant.featured_image) return;

		this._container.dispatchEvent( 
			new CustomEvent('variantImageChange', { detail: detail }) 
		);
	}
	
	/**
	 * Trigger event when variant price changes.
	 * @param {object} detail
	 * @returns {event} variantPriceChange
	 */
	_updatePrice(detail) {
		if (detail.variant.price === this._currentVariant.price && detail.variant.compare_at_price === this._currentVariant.compare_at_price) return;
		this._container.dispatchEvent( 
			new CustomEvent('variantPriceChange', { detail: detail }) 
		);
	}
	
	/**
	 * Update history state for product deep linking
	 */
	_updateHistoryState() {
		if (!history.replaceState || !this._enableHistoryState) return;

		window.history.replaceState({ }, '', `${window.location.origin}${window.location.pathname}?variant=${this._currentVariant.id}`);
	}
}


window.bluedgeusa.core.Variants = Variants;