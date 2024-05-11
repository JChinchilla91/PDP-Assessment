/**
 * JS Class implementation of Shopify Core
 * Section Class is exported to window.bluedgeusa.theme namespace
 *
 * NOTE: Need Polyfill for older browsers
 */
'use strict';


class PredictiveSearch {
	constructor(container, type, id) {
		this._container 			= container;
		this._type 					= type;
		this._id 					= id;

		// SELECTORS
		this._selectors = {
			inputSearch				: '[name="q"]',
			searchForm				: '[data-search-form]',
			mobileSearchIcon		: '[data-search-icon]',
			searchResults			: '[data-search-results]',
			closeResults			: '[data-close-results]',
			searchLengthTrigger		: 3,
			resultImgSize			: '380x'
		};

		// PARAMS
		this.searchCleared			= false;
		
		// SETTINGS
		this.searchOption			= {
			method				:	'GET',
			contentType			: 'application/json',
			url					: '/search/suggest.json?q='
		};

		this.searchData			= {
			s: null,
			resources: { 
				types: ['product', 'collection', 'page', 'article'], 
				limit: 4, 
				options: {
					unavailable_products: 'last',
					fields: ['title', 'variants.title', 'variants.sku', 'tag', 'product_type']
				}
			}
		};
		
		// DOM ELEMENTS
		this.inputSearches 			= this._container.querySelectorAll(this._selectors.inputSearch);
		this.searchResults 			= this._container.querySelector(this._selectors.searchResults);
		this.mobileSearchIcon		= this._container.querySelector(this._selectors.mobileSearchIcon);
		this.closeResults			= this._container.querySelector(this._selectors.closeResults);
		
		// EVENT LISTENERS
		this.inputSearches.forEach((el) => el.addEventListener('keyup', (e) => this.inputKeyupHandler(e)));
		this.inputSearches.forEach((el) => el.addEventListener('search', (e) => this.inputSearchHandler(e)));
		
		// For Mobile view only
		if (this.mobileSearchIcon) this.mobileSearchIcon.addEventListener('click', (e) => this.toggleMobileSearch(e));
	}
	
	
	/**
	 * Input Keyup Handler
	 * @param {Object} e
	 *
	 */
	inputKeyupHandler(e) {
		const value = e.target.value;
		
		if (value.length >= this._selectors.searchLengthTrigger) {
			// Update search value
			this.searchDataKeyword = value;
			
			// Build the query search
			const options = Object.assign({}, this.searchOption);
			options.url = this.buildSearchQuery();
			
			// Call Shopify Predictive search
			window.bluedgeusa.core.Connect.fetch(options, null, this.searchSuccess.bind(this), this.searchFail.bind(this));
		} else {
			this.cleanSearchResults();
		}
	}
	
	/**
	 * Input search Handler
	 */
	inputSearchHandler() {
		// Clean previous search results
		this.cleanSearchResults();
	}
	
	/**
	 * Toggle the Mobile search bar
	 * @param {Object} e
	 */
	toggleMobileSearch(e) {
		e.preventDefault();
		const form = this._container.querySelector(this._selectors.searchForm);
		console.log(form)
		if (form) form.classList.toggle('off');
	}
	
	/**
	 * Search success method
	 * @param {Object} response
	 */
	searchSuccess(r) {
		let closeView = null;
		let productView = null;
		let collectionView = null; 
		let pageView = null; 
		let articleView = null;
		
		// Clean previous search results
		this.cleanSearchResults();

		// Check if results are present
		if (!this.hasResults(r.resources.results))
			return this.searchResults.appendChild(this.buildNoResultView());
		
		// Add close button
		closeView = this.buildCloseBarView();
		this.searchResults.appendChild(closeView);
		
		// Product results
		if (r.resources.results.products && r.resources.results.products.length) {
			productView = this.buildProductView(r.resources.results.products);
			this.searchResults.appendChild(productView);
		}
		
		// Collection results
		if (r.resources.results.collections && r.resources.results.collections.length) {
			collectionView = this.buildCollectionView(r.resources.results.collections);
			this.searchResults.appendChild(collectionView);
		}
		
		// Page results
		if (r.resources.results.pages && r.resources.results.pages.length) {
			pageView = this.buildPageView(r.resources.results.pages);
			this.searchResults.appendChild(pageView);
		}
		
		// Article results
		if (r.resources.results.articles && r.resources.results.articles.length) {
			articleView = this.buildArticleView(r.resources.results.articles);
			this.searchResults.appendChild(articleView);
		}

		window.lazyLoadInstance.update();
	}
	
	/**
	 * Search fail method
	 */
	searchFail() {
		this.buildNoResultView();
	}
	
	/**
	 * Build Product Results
	 * @param {Array}
	 * @returns {Fragment}
	 */
	buildProductView(arr) {
		const fragment = document.createDocumentFragment();
		
		arr.forEach((line) => {
			// Augment Data
			const product = this.productDataModifier(line);
			
			// Build HTML
			const row 				= document.createElement('div');
			const colImg 			= document.createElement('div');
			const colText 			= document.createElement('div');
			const priceLine			= document.createElement('div');
			const price				= document.createElement('span');
			const priceCompare		= document.createElement('span');
			const img 				= document.createElement('img');
			const title				= document.createElement('a');
			
			// Classes
			row.classList.add('row', 'mt-1');
			colImg.className	 	= 'col-4';
			colText.className	 	= 'col-8';
			title.className			= 'product-title';
			priceLine.className 	= 'price-wrapper';
			price.className			= 'price';
			priceCompare.className	= 'price-compare';
			img.classList.add('img-fluid', 'lazy');
			
			// Content
			img.src 				= (product.img) ? product.img : window.bluedgeusa.theme.noImage.url;
			img.setAttribute('alt', product.featured_image.alt || product.title);
			
			title.innerHTML 		= product.title;
			title.href				= product.url;
			title.setAttribute('title', product.title);
			
			price.innerHTML			= product.price;
			
			// Discount
			if (product.compare_at_price) 
				priceCompare.innerHTML = product.compare_at_price;
			
			// Append
			colImg.appendChild(img);
			colText.appendChild(title);
			priceLine.appendChild(price);
			
			// Discount
			if (product.compare_at_price) 
				priceLine.appendChild(priceCompare);
				
			colText.appendChild(priceLine);
			row.appendChild(colImg);
			row.appendChild(colText);
			fragment.appendChild(row);
		});
		
		return fragment;
	}
	
	/**
	 * Build Collection Results
	 * @param {Array}
	 * @return {Fragment}
	 */
	buildCollectionView(arr) {
		const fragment = document.createDocumentFragment();
		
		arr.forEach((collection) => {
			// Build HTML
			const row 				= document.createElement('div');
			const colText 			= document.createElement('div');
			const title				= document.createElement('a');
			
			// Classes
			row.classList.add('row', 'mt-1');
			colText.classList.add('col-12', 'text-center');
			title.className			= 'collection-title';
			
			// Content
			title.innerHTML 		= 'View collection: '+collection.title;
			title.href				= collection.url;
			title.setAttribute('title', collection.title);
			
			// Append
			colText.appendChild(title);
			row.appendChild(colText);
			fragment.appendChild(row);
		});
		
		return fragment;
	}
	
	/**
	 * Build Page Results
	 * @param {Array}
	 * @return {Fragment}
	 */
	buildPageView(arr) {
		const fragment = document.createDocumentFragment();
		
		arr.forEach((page) => {
			// Build HTML
			const row 				= document.createElement('div');
			const colText 			= document.createElement('div');
			const title				= document.createElement('a');
			
			// Classes
			row.classList.add('row', 'mt-1');
			colText.classList.add('col-12', 'text-center');
			title.className			= 'page-title';
			
			// Content
			title.innerHTML 		= 'View page: '+page.title;
			title.href				= page.url;
			title.setAttribute('title', page.title);
			
			// Append
			colText.appendChild(title);
			row.appendChild(colText);
			fragment.appendChild(row);
		});
		
		return fragment;
	}
	
	/**
	 * Build Article Results
	 * @param {Array}
	 * @return {Fragment}
	 */
	buildArticleView(arr) {
		const fragment = document.createDocumentFragment();
		
		arr.forEach((article) => {
			// Build HTML
			const row 				= document.createElement('div');
			const colText 			= document.createElement('div');
			const title				= document.createElement('a');
			
			// Classes
			row.classList.add('row', 'mt-1');
			colText.classList.add('col-12', 'text-center');
			title.className			= 'page-title';
			
			// Content
			title.innerHTML 		= 'View article: '+article.title;
			title.href				= article.url;
			title.setAttribute('title', article.title);
			
			// Append
			colText.appendChild(title);
			row.appendChild(colText);
			fragment.appendChild(row);
		});
		
		return fragment;
	}
	
	/**
	 * Build close bar view
	 * @return {Fragment}
	 */
	buildCloseBarView() {
		const fragment = document.createDocumentFragment();

		// Build HTML
		const div 				= document.createElement('div');
		const btn 				= document.createElement('btn');
		
		// Classes
		div.classList.add('py-2', 'text-right');
		btn.classList.add('btn-close');
		
		// Attributes
		btn.setAttribute('type', 'button');
		btn.setAttribute('aria-label', 'Close');
		btn.setAttribute('data-close-results', true);
		
		// Append
		div.appendChild(btn);
		fragment.appendChild(div);
		
		// Add the event Listener
		btn.addEventListener('click', () => {
			this.inputSearchHandler();
			this.inputSearches.forEach((input) => input.value = '');
		});
		
		return fragment;
	}
	
	/**
	 * Build No Results view
	 * 
	 * @return {Fragment}
	 *
	 */
	buildNoResultView() {
		const fragment = document.createDocumentFragment();

		// Build HTML
		const row 				= document.createElement('div');
		const colText 			= document.createElement('div');
		const text				= document.createElement('div');
		
		// Classes
		row.classList.add('row', 'mt-1');
		colText.classList.add('col-12', 'text-center');
		text.classList.add('no-result', 'py-2');
		
		// Content
		text.innerHTML 		= 'No Result';
		
		// Append
		colText.appendChild(text);
		row.appendChild(colText);
		fragment.appendChild(row);
		
		return fragment;
	}
	
	/**
	 * Has Results
	 * Check if any results is returned
	 *
	 * @param {Array} results
	 * @return {Boolean}
	 *
	 */
	hasResults(results) {
		let has = false;
		
		for (const r in results)
			if (results[r].length)
				has = true;
		
		return has;
	}
	
	/**
	 * Clean Search Results
	 */
	cleanSearchResults() {
		// Clean previous search results
		while (this.searchResults.firstChild)
			this.searchResults.removeChild(this.searchResults.firstChild);
	}
	
	/**
	 * Product Data Modifier
	 * Modify product data
	 * make it Ready for templating
	 * 
	 * @param {Object} product
	 * @returns {Object}
	 */
	productDataModifier(product) {
		product.price = window.bluedgeusa.core.Currency.formatMoney(product.price);
		product.img = window.bluedgeusa.core.Images.getSizedImageUrl(product.featured_image.url, this._selectors.resultImgSize);
		product.aspect_ratio = (product.featured_image.url) ? product.featured_image.aspect_ratio : window.bluedgeusa.theme.noImage.aspectRatio;

		// Price discount
		if (~~product.compare_at_price_max && product.price !== product.compare_at_price_max)
			product.compare_at_price = window.bluedgeusa.core.Currency.formatMoney(product.compare_at_price_max);
		else
			product.compare_at_price = null;
		
		return product;
	}
	
	/**
	 * Build Search Query
	 * @returns {String}
	 */
	buildSearchQuery() {
		// Search term
		let query = encodeURIComponent(this.searchData.s);
		
		// Resource
		query += '&resources[type]=' + encodeURIComponent(this.searchData.resources.types.join(','));
		
		// Limit
		query += '&resources[limit]=' + this.searchData.resources.limit;
		
		// Options - unavailable products
		query += '&resources[options][unavailable_products]=' + this.searchData.resources.options.unavailable_products;
		
		// Options - Search fields
		query += '&resources[options][fields]=' + encodeURIComponent(this.searchData.resources.options.fields.join(','));
		
		// Update url with complete query
		return this.searchOption.url + query;
	}
	
	/**
	 * Set Search keyword value
	 * @param {String} value
	 */
	set searchDataKeyword(value) {
		this.searchData.s = value;
	}
}


// Export to theme namespace
window.bluedgeusa.theme.PredictiveSearch = PredictiveSearch;