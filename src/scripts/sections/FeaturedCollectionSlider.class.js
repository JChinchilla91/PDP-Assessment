/**
 * FeaturedCollectionSlider
 * Flickity slider - https://flickity.metafizzy.co/
 * Loaded from sections/theme-featured-collection-slider.liquid
 */
'use strict';
// eslint-disable-next-line no-unused-vars
import GenericSlider from './GenericSlider.class.js';


class FeaturedCollectionSlider extends window.bluedgeusa.theme.GenericSlider {
	constructor(container, type, id) {
		super(container, type, id, true);

		this._container = container;
		this._type = type;
		this._id = id;

		// SELECTORS (merge)
		this._selectors 	= Object.assign({}, this._selectors);

		// Extend the class with new methods below (or override)
	}

	/**
	 * Theme "Customize" panel shopify:section:load event listener
	 */
	onLoad() {
		if (this.slider) 
			this.initSlider();
	
		window.lazyLoadInstance.update();
	}

	/**
	 * Theme "Customize" panel shopify:section:unload event listener
	 */
	onUnload() {
		// Resize event
		window.removeEventListener('resize', this.resizeSlider, this.supportPassiveListener ? { passive: true } : false);
	}
}


// Export to theme namespace
window.bluedgeusa.theme.FeaturedCollectionSlider = FeaturedCollectionSlider;