/**
 * Proxy Access between Frontend / Custom App
 * Class meant to be used in Shopify Theme.
 * 
 * Usage: 
 * const proxy = theme.CustomAppProxy.customAppEndpoint('test', 'POST', data);
 * proxy
 * 		.then(r => console.log(r))
 * 		.catch(err => console.error(err)); 
 */

const proxyPath = '/apps/front/';


class CustomAppProxy {
	/**
	 * Custom App Endpoint
	 * @param {String} endpoint
	 * @param {String} method (optional. default: GET)
	 * @param {Object} data (optional)
	 * @param {Object} header (optional)
	 * @return {Object}
	 */
	static customAppEndpoint(endpoint, method='GET', data=null, headers=null) {
		try {
			if (!endpoint)
				throw Error('customAppEndpoint:Missing endpoint');

			const uri = `${proxyPath}${endpoint}`;
			const settings = {
				method: method.toUpperCase()
			};

			// Add Headers if specified
			if (headers) settings.headers = headers;

			// Specific Settings
			if (data) settings.body = data;

			// FETCH
			return new Promise((resolve, reject) => {
				fetch(uri, settings)
				.then((r) => {
					// Handle json / html
					const type = r.headers.get('Content-Type');
					if (type === 'text/html')
						return r.text();
					else
						return r.json();
				})
				.then((r) => resolve(r))
				.catch((err) => reject(err));
			});
		} catch(err) {
			console.log(`CustomAppProxy::customAppEndpoint:${err.message}`);
		}
	}
}

// Export
window.bluedgeusa.theme.CustomAppProxy = CustomAppProxy;