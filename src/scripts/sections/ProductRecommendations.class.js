/**
 * Product recommendation Section Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to this Section.
 * @namespace productRecommendation
 */
'use strict'; 

class ProductRecommendation {
	constructor(container, type, id) {
		this._container 			= container;
		this._id					= id;
		this._type					= type;

		// SELECTOR
		this._selectors = {
			productGrid				: '[data-product-grid]'
		}

		// DOM
		this.grid 					=  this._container.querySelector(this._selectors.productGrid);

		// PARAMS
		this.recommendationsUlr 	= `/recommendations/products?&section_id=${this._container.id}&limit=${this._container.dataset.limit}&product_id=${this._container.dataset.productId}`;
		
		// Init
		this.getRecommendations();
	}

	/**
	 * Gets product recommendations via AJAX
	 */
	getRecommendations() {
		window.bluedgeusa.core.Connect.fetch({ url: this.recommendationsUlr, contentType: 'text/html' }, null, (html) => {
			const grid = new DOMParser().parseFromString(html, 'text/html').querySelector(this._selectors.productGrid).innerHTML;

			// Check if Results
			if (grid) {
				this.grid.innerHTML = grid;
				window.lazyLoadInstance.update(); // Reset lazyload
				// Dispatch Event
				document.dispatchEvent( 
					new CustomEvent('productsInjected') 
				);
			} else {
				this._container.classList.add('d-none');
			}
		}, (err) => {
			console.log(err);
			this._container.classList.add('d-none');
		});
	}

	/**
	* Event callback for Theme Editor `section:load` event
	*/
	onLoad() {
		// Init
		this.getRecommendations();
	}
}

// Export to theme namespace
window.bluedgeusa.theme.ProductRecommendation = ProductRecommendation;