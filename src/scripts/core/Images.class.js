/**
 * JS Class implementation of Shopify Core Images
 * Section Class is exported to window.bluedgeusa.core namespace
 *
 * This class use STATIC Methods only.
 *
 * NOTE: Need Polyfill for older browsers
 */
'use strict';


class Images {	
	/**
	 * Adds/replace a Shopify size attribute to a URL
	 * @param {String} src
	 * @param {Number} size
	 * @returns {String}
	 */
	static getSizedImageUrl(src, size) {
		if (!src) return null;
		if (!size) return src;

		// Build the url params
		const url = new URL(src);
		let imgParams = new URLSearchParams(url.search);

		// Set url Param
		imgParams.set('width', size);

		return `${url.origin}${url.pathname}?${imgParams.toString()}`;
	}
}


window.bluedgeusa.core.Images = Images;