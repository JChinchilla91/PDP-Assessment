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


/**
 * Product constructor
 *
 * @param {DOM} container
 * @param {String} type
 * @param {String} id
 */
class Product {
	constructor(container, type, id) {
		this._container 			= container;
		this._type 					= type;
		this._id 					= id;
		this._imageSize				= '1480';
		
		// Selectors
		this._selectors = {
			addToCartBtn			: '[data-add-to-cart]',
			addToCartText			: '[data-add-to-cart-text]',
			productPrice			: '[data-product-price]',
			comparePrice			: '[data-compare-price]',
			variantSKU				: '[data-variant-sku]',
			priceWrapper			: '[data-price-wrapper]',
			productFeaturedImage	: '[data-product-featured-image]',
			productJSON				: '[data-product-json]',
			productThumbnails		: '[data-product-thumbnails] a',
			singleOptionSelector	: '[data-single-option-selector]',
			selectorBlocks			: '[data-custom-selector]',
			quantity				: '[name="quantity"]',
			properties				: '[name*="properties"]'
		};

		// INIT
		this.init();
	}

	/**
	 * Init function
	 * Useful for extending Classes 
	 */
	init() {
		// JSON
		this.productDATA  			= JSON.parse(this._container.querySelector(this._selectors.productJSON).innerHTML);
		
		// ELEMENTS (Pre-selected)
		this.featuredImage			= this._container.querySelector(this._selectors.productFeaturedImage);
		this.thumbnails				= this._container.querySelectorAll(this._selectors.productThumbnails);
		this.selectorBlocks 		= this._container.querySelectorAll(this._selectors.selectorBlocks);
		this.addToCartBtn 			= this._container.querySelector(this._selectors.addToCartBtn);
		this.properties				= this._container.querySelectorAll(this._selectors.properties);
		this.quantity				= this._container.querySelector(this._selectors.quantity);
		
		// Options
		this._options = {
			container				: this._container,
			enableHistoryState		: this._container.dataset.enableHistoryState === 'true',
			singleOptionSelector	: this._selectors.singleOptionSelector,
			productDATA				: this.productDATA
		};
		
		// Variants
		this.variants				= new window.bluedgeusa.core.Variants(this._options);

		// EVENT HANDLERS
		// Custom <Select> option selectors
		// We use 'mousedown' event to be sure to trigger before the `click` listener in the Variants Class
		this.selectorBlocks.forEach(selector =>
			selector.addEventListener('mousedown', (e) => {
				/* Event delegation on LI */
				if (e.target.nodeName === "LI") this.setCustomOptionSelect(e, selector);
			})
		);

		document.addEventListener('core:addToCart:completed', () => {
			this.addToCartLoadingToggle();
			this.resetQuantity();
		});

		// Note variant from Variants class is stored in e.detail
		this._container.addEventListener('variantChange', (e) => {
			this.updateVariantSKU(e);
			this.updateAddToCartState(e);
			this.setActiveThumbnail(e.detail.variant.id || null);
		});
		this._container.addEventListener('variantImageChange', (e) => this.updateMainImage(e));
		this._container.addEventListener('variantPriceChange', (e) => this.updateVariantPrice(e));
		this.thumbnails.forEach((el) => el.addEventListener('click', (e) => this.thumbnailClick(e)));
		this.addToCartBtn.addEventListener('click', (e) => this.addToCart(e));

		// Reset 'loaded' class when changing `src` value
		this.featuredImage.addEventListener('load', () => this.featuredImage.classList.add('loaded'));
	}
	
	/**
	 * Updates the DOM state of the add to cart button
	 *
	 * @param {boolean} enabled - Decides whether cart is enabled or disabled
	 * @param {string} text - Updates the text notification content of the cart
	 */
	updateAddToCartState(e) {
		const addToCartText = this._container.querySelector(this._selectors.addToCartText);
		
		if (!e.detail.variant) {
			this.addToCartBtn.disabled = true;
			addToCartText.innerText = window.bluedgeusa.theme.strings.unavailable;
		} else if (e.detail.variant.available) {
			this.addToCartBtn.disabled = false;
			addToCartText.innerText = window.bluedgeusa.theme.strings.addToCart;
		} else {
			this.addToCartBtn.disabled = true;
			addToCartText.innerText = window.bluedgeusa.theme.strings.soldOut;
		}
	}
	
	/**
	 * Change Variant SKU
	 * @param {Object} e
	 */
	updateVariantSKU(e) {
		const variantSKU = this._container.querySelector(this._selectors.variantSKU);
		if (variantSKU)
			variantSKU.innerHTML = e.detail.variant.sku;
	}
	
	/**
	 * Change Variant Price and Compared at Price
	 * @param {Object} e
	 */
	updateVariantPrice(e) {
		const variantPrice = this._container.querySelector(this._selectors.productPrice);
		const comparePrice = this._container.querySelector(this._selectors.comparePrice);
		
		// Actual Price
		variantPrice.innerHTML = window.bluedgeusa.core.Currency.formatMoney(e.detail.variant.price);
		

		// Compare at Price
		if (!comparePrice) return;
		if (e.detail.variant.compare_at_price)
			comparePrice.innerHTML = window.bluedgeusa.core.Currency.formatMoney(e.detail.variant.compare_at_price);
		else
			comparePrice.innerHTML = '';
	}
	
	/**
	 * Update Variant Image on the main View
	 * @param {Object} e
	 */
	updateMainImage(e) {
		if (!e.detail.variant || e.detail.variant.featured_image === null) return;

		// Add protocol to feature image src
		const variantImage = window.location.protocol + e.detail.variant.featured_image.src;
		
		// Get sized Img from using core method getSizedImageUrl
		const sizedImgUrl = window.bluedgeusa.core.Images.getSizedImageUrl(variantImage, this._imageSize);
		
		// Update Image + Image Data
		this.updateMainImageData(sizedImgUrl);
	}
	
	/**
	 * Update the Main Image Url
	 * and lazy loading data
	 * @param {String} src
	 */
	updateMainImageData(src) {
		if (!src) return;

		// Remove loaded class to reset the state of the image animation
		this.featuredImage.classList.remove('loaded');

		// Update the main image
		this.featuredImage.setAttribute('data-srcset', '');
		this.featuredImage.setAttribute('srcset', '');
			
		// Show image directly - no lazy loading
		this.featuredImage.src = src;
	}
	
	/**
	 * On thumbnail click
	 * @param {Object} e 
	 */
	thumbnailClick(e) {
		e.preventDefault();
		const target = e.currentTarget;
		const variantID = target.dataset.mediaVariantId || null;

		const url = target.getAttribute('href');
		if (url) this.updateMainImageData(url);
		
		// Set active thumbnail
		this.setActiveThumbnail(variantID, target);
		
		// Set new current variant
		if (variantID)
			this.variants.updateCurrentVariant(variantID, e);
	}

	/**
	 * Set active state to Thumbnails
	 * @param {Number} variantID 
	 * @param {DOM} target
	 */
	setActiveThumbnail(variantID, target) {
		// Set (current) Thumbnail
		const thumbnailsArr = Array.from(this.thumbnails);
		thumbnailsArr.forEach((el) => {
			const id = parseInt(el.dataset.mediaVariantId);
			if (id === variantID || el === target)
				el.classList.add('current');
			else
				el.classList.remove('current');
		});
	}
	
	/**
	 * Add to Cart on click
	 * @param {Object} e
	 */
	addToCart(e) {
		// Star Animation
		this.addToCartLoadingToggle();

		const qty 				= Math.abs(parseInt(this.quantity.value || 1));

		// Get current Variant
		const currentVariant = this.variants.getCurrentVariant();
		
		// AddToCart Method from Variants
		// will return if window.bluedgeusa.theme.dynamicCartActive == false
		// and will not preventDefault()
		const dynamicCart = this.variants.addToCart(qty, currentVariant.id, this.getProperties(), null);
		
		// Stop event if Dynamic Cart is Active
		if (dynamicCart)
			e.preventDefault();
	}

	/**
	 * Collect optional properties
	 * @returns {Object}
	 */
	getProperties() {
		const properties = {};
		const pattern = /\[(.*?)]/i;

		// Check of the PDP has Properties[] fields
		if (!this.properties) 
			return properties;

		// Assign properties values
		this.properties.forEach(el => {
			const matches = el.name.match(pattern);
			
			/// Add to properties Object
			if (matches.length === 2 && el.value)
				properties[matches.pop()] = el.value
		});

		return properties;
	}

	/**
	 * Toggle loading add to cart Button
	 */
	addToCartLoadingToggle() {
		this.addToCartBtn.classList.toggle('loading');
	}

	/**
	 * Custom Option Select
	 * handle select attribute on click
	 * Used for custom option selects that are not 
	 * @param {Object} e
	 * @param {DOM} parent
	 */
	setCustomOptionSelect(e, parent) {
		if (!parent) return;
		const target = e.target || null;

		parent.querySelectorAll('li').forEach(block => {
			if (block === target) {
				block.classList.add('selected');
				block.dataset.selected = true;
			} else {
				block.classList.remove('selected');
				block.dataset.selected = false;
			}
		});
	}

	/**
	 * Reset Quantity on after Add to Cart Change
	 */
	resetQuantity() {
		this.quantity.value = 1;
	}
	
	/**
	 * Theme "Customize" panel shopify:section:load event listener
	 */
	onLoad() {
		// INIT
		this.init();
		window.lazyLoadInstance.update();
	}

	/**
	 * Theme "Customize" panel shopify:section:unload event listener
	 */
	onUnload() {
		// REMOVE EVENT HANDLERS
		this._container.removeEventListener('variantChange', (e) => {
			this.updateVariantSKU(e);
			this.updateAddToCartState(e);
			this.setActiveThumbnail(e.detail.variant.id || null);
		});
		this._container.removeEventListener('variantImageChange', (e) => this.updateMainImage(e));
		this._container.removeEventListener('variantPriceChange', (e) => this.updateVariantPrice(e));
		this.thumbnails.forEach((el) => el.removeEventListener('click', (e) => this.thumbnailClick(e)));
		this.addToCartBtn.removeEventListener('click', (e) => this.addToCart(e));
		this.featuredImage.removeEventListener('load', () => this.featuredImage.classList.add('loaded'));
	}
}


// Export to theme namespace
window.bluedgeusa.theme.Product = Product;