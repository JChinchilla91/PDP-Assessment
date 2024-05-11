/**
 * Class abstracting Methods for API communications
 * Connect Class is exported to window.bluedgeusa.core namespace
 *
 * This class use STATIC Methods only.
 *
 * NOTE: Need Polyfill for older browsers
 */
'use strict';


class Connect {
	
	/**
	 * Abstract JS native fetch method
	 * Use Async / await
	 * Use: `options.noOption: true` to use default fetch options
	 * @param {Object} options - Fetch call options
	 * @param {Object} data - required - pass null if no data
	 * @param {Function} onSuccess
	 * @param {Function} onFail
	 * @param {Function} onCompleted
	 */
	static fetch(options, data = null, onSuccess, onFail, onCompleted) {
		// Define Async call
		function HTTPcall(url, options, data) {
			const settings = (options.noOption === true) ? null : {
				method			: options.method || 'GET',
				credentials		: options.credentials || 'same-origin',
				mode			: options.mode || 'cors',
				headers			: {
					'Content-Type'		: options.contentType || 'application/json',
					'Cache-Control'		: options.cache || 'max-age=0',
					'X-Requested-With'	: 'XMLHttpRequest' // This is needed as currently there is a bug in Shopify that assumes this header
				}
			};
			
			// ADD body only if data
			if (data)
				settings.body = JSON.stringify(data);
			
			fetch(options.url, settings).then(response => {
				// Get content from headers
				let _type = 'application/json'; // Default
	
				if (settings && typeof settings.headers['Content-Type'] !== 'undefined')
					_type = settings.headers['Content-Type'];
				else if (typeof response.headers.get('Content-Type') !== 'undefined')
					_type = response.headers.get('Content-Type');
				
				// Normal request type 
				if (!response.ok) {
					// JSON get details
					if (_type === 'application/json' && response.body)
						return response.json();
					else
						return Promise.reject(response);
				} else {
					if (_type === 'application/json')
						return response.json();
					else
						return response.text();
				}
			})
			.then((r) => {
				// Fail				
				if ((r.ok !== true && r.status > 299) || r.status === 422) {
					onFail && onFail(r);
				} else { // Success
					onSuccess && onSuccess(r);
				}
			})
			.catch((error) => {
				onFail && onFail(error);
				// console.error('error', error);
			})
			.finally(() => {
				onCompleted && onCompleted();
			})
		}
		
		// Call the function
		HTTPcall(options.url, options, data, onSuccess, onFail);
	}
	
	/**
	 * JSONP Call to overcome Cross-origin limitations in Shopify
	 * @param {String} url,
	 * @param {Function} callback
	 * @param {String} callbackString
	 */
	static jsonp(url, callback, callbackString = 'callback') {
		const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
		window[callbackName] = function(data) {
			callback(data);
			delete window[callbackName];
			document.body.removeChild(script);
		};
		
		const script = document.createElement('script');
		script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + callbackString + '=' + callbackName;
		document.body.appendChild(script);
	}
	
	/**
	 * Call to JS API Add to Cart
	 * 
	 * Receive an array of items
	 * [{ 
	 *   quantity: qty,
	 *   id: variantId,
	 *   properties: properties (optional)
	 *   selling_plan: sellingPlan (optional)
	 * }]
	 * 
	 * EVENT: Dispatch events
	 * 		- Start: core:addToCart:start
	 * 		- Success: core:addToCart:success
	 * 		- Fail: core:addToCart:fail
	 * 		- Completed: core:addToCart:completed
	 * @param {Array} items
	 * @returns {Boolean}
	 */
	static addToCart(items) {
		try {
			if (!items || !Array.isArray(items)) 
				throw Error('Connect::addToCart:invalid items input');

			// Convert to data array to object
			const data = { items: items };

			// Custom Event
			// Start: core:addToCart:start
			document.dispatchEvent(new CustomEvent('core:addToCart:start'));

			// Fetch
			// Options, data, onSuccess, onFail
			Connect.fetch(
				{
					method: 'POST',
					url: window.bluedgeusa.theme.routes.cartAddUrl + '.js'
				},
				data,
				// onSuccess
				(response) => {
					document.dispatchEvent( 
						new CustomEvent('core:addToCart:success', { detail: response })
					);
				},
				// onFail
				(response) => {
					document.dispatchEvent( 
						new CustomEvent('core:addToCart:fail', { detail: { err: response } })
					);
				},
				// onCompleted
				() => {
					document.dispatchEvent( 
						new CustomEvent('core:addToCart:completed')
					);
				}
			);
			return true;

		} catch(err) {
			console.log(err);
		}
	}
	
	/**
	 * Call to JS API change Cart
	 * qty: 0: to delete a variant
	 *
	 * Note: We rely on Key not variant ID to avoid possible confusion and later reference
	 *
	 * EVENT: Dispatch events
	 * 		- Start: core:changeToCart:start
	 * 		- Success: core:changeToCart:success
	 * 		- Fail: core:changeToCart:fail
	 *
	 * @param {Integer} qty
	 * @param {Integer} key - variant Key 
	 * @param {Object} properties - optional
	 * @param {Integer} sellingPlan - optional
	 * @param {String} action - (plus | minus | remove)
	 * @returns {Boolean}
	 */
	static changeToCart(qty, key = null, properties = null, sellingPlan = null, action) {	
		if (typeof qty === 'undefined' || !key) return false;
		let data = {}, deleteAction = false;
		
		// Custom Event
		// Start: core:addToCart:start
		document.dispatchEvent(new CustomEvent('core:changeToCart:start'));
		
		// Define variant to update
		if (key)
			data = { id: key, quantity: ~~qty, action: action };
		else 
			data = { id: this._currentVariant.key, quantity: ~~qty, action: action };
			
		// Add Properties to data
		if (properties)
			data = Object.assign(data, properties);

		// Add Selling Plan
		if (sellingPlan)
			data.selling_plan = sellingPlan;
			
		// Set Delete action if qty === 0
		if (~~qty === 0)
			deleteAction = true;

		// Fetch
		// Options, data, onSuccess, onFail
		Connect.fetch(
			{
				method: 'POST',
				url: window.bluedgeusa.theme.routes.cartChangeUrl + '.js'
			},
			data,
			function onSuccess(response) {
				// Add data to response - for later use
				response.data = data;
				
				// Event for delete
				if (deleteAction) {
					document.dispatchEvent( 
						new CustomEvent('core:changeToCart:delete:success', { detail: response })
					);
				} else {
					document.dispatchEvent( 
					new CustomEvent('core:changeToCart:success', { detail: response })
				);
				}
			},
			function onFail(err) {
				// Add data to response - for later use
				err.data = data;
				
				document.dispatchEvent( 
					new CustomEvent('core:changeToCart:fail', { detail: { err: err, key: key } })
				);
			}
		);
		return true;
	}

	/**
	 * Call to JS API Clear Cart
	 * EVENT: Dispatch events
	 * 		- Start: core:clearCart:start
	 * 		- Success: core:clearCart:success
	 * 		- Fail: core:clearCart:fail
	 * @returns {Boolean}
	 */
	static clearCart() {
		document.dispatchEvent(new CustomEvent('core:clearCart:start'));
		Connect.fetch(
			{
				method: 'POST',
				url: window.bluedgeusa.theme.routes.clearCart + '.js'
			},
			null,
			function onSuccess(response) {
				document.dispatchEvent(
					new CustomEvent('core:clearCart:success', { detail: response })
				);
			},
			function onFail() {
				document.querySelector('[data-warning-toast] .toast-body').innerHTML = "Sorry, an error occurred.";
				window.bluedgeusa.theme.warning.show();
			}
		);
		return true;
	}
}


window.bluedgeusa.core.Connect = Connect;