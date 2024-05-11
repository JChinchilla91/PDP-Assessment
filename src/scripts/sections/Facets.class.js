/**
 * Facets class
 * Manage all the aspect of the Shopify Filters
 * !! NOTE: we use JSON to update the Facets DOM - Much faster than search the incoming DOM
 */


class Facets {
	constructor(container, type, id) {
		this._container 			= container;
		this._type 					= type;
		this._id 					= id;

		// SELECTORS
		this._selectors = {
			facetsDataId				: 'facetsData',
			forms						: '[data-filter-form]',
			productGridId				: 'productGridContainer',
			productCountId				: 'productCount',
			productCount				: '[data-product-count]',
			facetTags					: '[data-facet-tags]',
			defaultSort					: '[data-filter-default-sort]',
			facetsRemove				: '[data-facet-remove]'	
		};

		// ELEMENTS
		this.forms 						= this._container.querySelectorAll(this._selectors.forms);
		this.activeForm					= null;
		this.productGridContainer		= document.getElementById(this._selectors.productGridId);
		this.productCounts				= this._container.querySelectorAll(this._selectors.productCount);
		this.facetTags					= this._container.querySelectorAll(this._selectors.facetTags);
		this.facetsRemove				= this._container.querySelectorAll(this._selectors.facetsRemove);

		// set the Active form (visible: Mobile vs Desktop)
		this.setActiveForm();

		// DATA
		this.dataCache 					= [];
		this.searchParams 				= this.getSearchParam();
		this.debounceSpeed				= 500;
		this.searchParamsInitial		= window.location.search.slice(1);
		this.searchParamsPrev			= window.location.search.slice(1);
		this.defaultSort 				= this.getDefaultSortValue();

		// INIT
		this.init();
	}

	/**
	 * Init
	 */
	init() {
		this.initEventListeners();

		// Reset Active form on Window resize (from Mobile to desktop)
		window.addEventListener('resize', window.bluedgeusa.core.Utils.debounce((e) => this.setActiveForm(e), this.debounceSpeed));
	}

	/**
	 * Fetch Page Manager
	 * Will use the cache when available or fetch
	 * Update prev search param + History state
	 * @param {String} url
	 * @param {Boolean} updateHistoryHash
	 */
	fetchPageManager(url = null, updateHistoryHash = true) {
		// Update search params
		this.searchParams = this.getSearchParam();
		this.searchParamsPrev = this.searchParams;

		const hasCache = this.dataCache.some((data) => data.url === url);
		url = (url) ? url : this.buildURL();

		if (hasCache)
			this.fetchPageCache(url);
		else
			this.fetchPage(url);

		// Update History Hash
		if (updateHistoryHash) this.updateHistoryHash();
	}

	/**
	 * Fetch Page
	 * @param {String} url
	 */
	fetchPage(url) {
		fetch(url)
			.then(r => r.text())
			.then((html) => {
				// Add to Cache
				this.dataCache.push({
					url: url,
					html: html
				});

				// Renders
				this.updateFacets(html);
				this.renderProductCount(html);
				this.renderFacetTags(html);
				this.renderProductGrid(html);
			})
			.catch((err) => this.renderFetchError(err));
	}


	/**
	 * Fetch Page Cache
	 * @param {String} url
	 */
	fetchPageCache(url) {
		const cache = this.dataCache.find((data) => data.url === url);

		// Renders
		this.updateFacets(cache.html);
		this.renderProductCount(cache.html);
		this.renderFacetTags(cache.html);
		this.renderProductGrid(cache.html);
	}

	/**
	 * Update Facets in the DOM
	 * Use JSON data to catch the filters by data attribute and manipulate them
	 * @param {DOM} html
	 */
	updateFacets(html) {
		try {
			const facetsData = new DOMParser().parseFromString(html, 'text/html').getElementById(this._selectors.facetsDataId).innerText;
			const filters = JSON.parse(facetsData);
			const searchParamObj = this.getSearchParamObj();

			// Update Inputs
			filters.forEach((filter) => {
				// Select all inputs (covers Mobile + Desktop)
				const inputs = this.activeForm.querySelectorAll(`input[data-facet-input="${filter.name}"]`);
				inputs.forEach((input) => {
					// Uncheck input if not in the URL parma anymore
					const values = searchParamObj[input.name] || [];

					if (!values.includes(input.value)) {
						// Checkbox
						if (input.type === 'checkbox' ) {
							// Avoid checkbox with 0 count to be checked
							if (input.checked == true || filter.count === 0)
								input.checked = false;	

						// Number
						} else if (input.type === 'number') {
							// Min Price
							if (filter.name === 'filter-v-price-gte' && !values.length) {
								input.value = 0; // No min range given by Shopify
							}

							// Max Price
							if (filter.name === 'filter-v-price-lte' && !values.length) {
								input.value = input.dataset.maxRange;
							}
						}
					}

					// Disabled is not products avail.
					if (input.type === 'checkbox') {
						input.disabled = filter.count === 0;
					}
					
					// Update checkbox label
					const label = input.nextElementSibling;
					if (label) 
						label.querySelector('span').innerText = filter.count;
				});
			});
		} catch(err) {
			console.log(err);
		}
	}

	/**
	 * Render Product Grid
	 * @param {DOM} html
	 */
	renderProductGrid(html) {	
		// Reset product grid HTML
		this.productGridContainer.innerHTML = '';
		// Insert new recently parsed HTML	
		this.productGridContainer.innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById(this._selectors.productGridId).innerHTML;
		// Look for new images to lazyload
		window.lazyLoadInstance.update();
		// Dispatch Event
		document.dispatchEvent( 
			new CustomEvent('productsInjected') 
		);
	}

	/**
	 * Render Product Count
	 * @param {DOM} html
	 */
	renderProductCount(html) {
		const count = new DOMParser().parseFromString(html, 'text/html').getElementById(this._selectors.productCountId).innerHTML;
		this.productCounts.forEach((productCount) => productCount.innerHTML = count);
	}

	/**
	 * Render Filter Tags
	 * @param {DOM} html
	 */
	renderFacetTags(html) {
		const tags = new DOMParser().parseFromString(html, 'text/html').querySelector(this._selectors.facetTags).innerHTML;
		this.facetTags.forEach((tag) => tag.innerHTML = tags)
	}

	/**
	 * Init Event Listeners
	 */
	initEventListeners() {
		// Form Inputs
		this.activeForm.addEventListener('input', window.bluedgeusa.core.Utils.debounce(() => this.formSubmitHandler(), this.debounceSpeed));
		this.facetsRemove.forEach((tag) => tag.addEventListener('click', (e) => this.removeFacetHandler(e)));

		// History State
		window.addEventListener('popstate', this.historyChangeHandler.bind(this));
	}

	/**
	 * on Form Submit handler
	 */
	formSubmitHandler() {
		this.fetchPageManager();
	}

	/**
	 * Remove Tags handler
	 * @param {Object} e
	 */
	removeFacetHandler(e) {
		e.preventDefault();
		const searchParams = e.currentTarget.href.indexOf('?') == -1 ? '' : e.currentTarget.href.slice(e.currentTarget.href.indexOf('?') + 1);
		const url = `${window.location.pathname}?section_id=${this._id}&${searchParams}`;

		this.fetchPageManager(url);
	}

	/**
	 * Change History State
	 * @param {Object} e
	 */
	historyChangeHandler(e) {
		const searchParams = (e.state) ? e.state.searchParams : this.searchParamsInitial;
		if (searchParams === this.searchParamsPrev) return;
		
		// updateHistoryHash === false - Hash just change, we do not update it again
		this.fetchPageManager(null, false);
	}

	/**
	 * Update History State
	 */
	updateHistoryHash() {
		history.pushState({ searchParams: this.searchParams }, '', `${window.location.pathname}${this.searchParams && '?'.concat(this.searchParams)}`);
	}

	/**
	 * Render Fetch Error
	 * @param {String} err
	 */
	renderFetchError(err) {
		// Create new HTML element to append error
		const h4 = document.createElement('h4');
		// Add error class
		h4.classList.add('collection-fetch-error');
		// Error message
		h4.innerText = 'An error occurred when fetching the products :('
		// Reset product grid HTML
		this.productGridContainer.innerHTML = '';
		// Append Error Message
		this.productGridContainer.append(h4);
		// Console log error
		console.error('ERROR FETCHING PRODUCTS', err);
	}

	/**
	 * Build URL
	 * @param {String} searchParams (optional)
	 * @returns {String}
	 */
	buildURL(searchParams=null) {
		if (searchParams)
			this.searchParams = searchParams;

		return (this.searchParams) 
			? `${window.location.pathname}?section_id=${this._id}&${this.searchParams}`
			: `${window.location.pathname}?section_id=${this._id}`;
	}

	/**
	 * Get Search Params
	 * @returns {Object}
	 */
	getSearchParam() {
		const formData = new FormData(this.activeForm);
		return new URLSearchParams(formData).toString();
	}

	/**
	 * Get Search Params Object
	 * from the location.search url
	 * @returns {Object}
	 */
	getSearchParamObj() {
		const params = new URLSearchParams(window.location.search);
		const obj = {};

		for (const [k, v] of params) {
			// Init obj key as Array
			if (!obj[k])
				obj[k] = [];

			obj[k].push(v);
		}

		return obj
	}

	/**
	 * Get sorted by Value
	 * @returns {String}
	 */
	getDefaultSortValue() {
		return document.querySelector(this._selectors.defaultSort).value;
	}

	/**
	 * Set Visible form as the active form
	 */
	setActiveForm() {
		for (let form of this.forms) {
			if (form.offsetParent !== null) {
				this.activeForm = form;
				break;
			}
		}
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
		// Reset Active form on Window resize (from Mobile to desktop)
		window.removeEventListener('resize', window.bluedgeusa.core.Utils.debounce((e) => this.setActiveForm(e), this.debounceSpeed));

		this.activeForm.removeEventListener('input', window.bluedgeusa.core.Utils.debounce(() => this.formSubmitHandler(), this.debounceSpeed));
		this.facetsRemove.forEach((tag) => tag.removeEventListener('click', this.removeFacetHandler));

		// History State
		window.removeEventListener('popstate', this.historyChangeHandler.bind(this));
	}
}


// Export to theme namespace
window.bluedgeusa.theme.Facets = Facets;