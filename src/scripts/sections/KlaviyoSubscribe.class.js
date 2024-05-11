/**
 * Klaviyo Forms Class
 * Can be used with a form and Add Data programmatically
 * Note: Success / Fail use a callback (CPS)
 */

class KlaviyoSubscribe {
	constructor(form, callback=null) {
		if (!form) throw new TypeError('KlaviyoSubscribe: Missing form DOM element');

		// SELECTORS
		this._selectors = {
			listId					: 'data-klaviyo-list-id'
		};

		// ELEMENTS
		this.form 					= form;
		this.callback				= callback;

		// Data
		this.url 					= 'https://manage.kmail-lists.com/ajax/subscriptions/subscribe';
		this.listId					= this.form.getAttribute(this._selectors.listId);
		this.injectedData			= null;

		// Events
		this.form.addEventListener('submit', () => this.submitForm());
	}

	/**
	 * Submit Klaviyo Form
	 */
	submitForm() {
		let formData = this.getFormData();

		// Check if coming from a bot
		if (this.isBot(formData)) {
			return this.callback && this.callback('No Bot!', null);
		}

		// Clean Bots test
		formData.delete('bots');

		// Request
		const options = {
			url: this.url,
			method: 'POST',
			contentType: 'application/x-www-form-urlencoded',
			cacheControl: 'no-cache'
		};

		// Append form Data
		formData.append('g', this.listId);
		formData.append('$fields', this.buildFieldsValues(formData));

		// Merge programmatically added Data
		formData = this.mergeInjectedData(formData);

		// Fetch
		window.bluedgeusa.core.Connect.fetch(
			options,
			new URLSearchParams(formData).toString(), 
			// Success
			(res) => { 
				const r = JSON.parse(res);
				if (r.errors.length)
					this.callback && this.callback(r.errors.join(' | '), null)
				else
					this.callback && this.callback(null, r);
			}, 
			// Fail
			(err) => this.callback && this.callback(err, null));

	}

	/**
	 * Build field attribute values
	 * @param {Object} formData
	 * @returns {String}
	 */
	buildFieldsValues(formData) {
		let list = [];

		// Build the list (excl. email)
		for (const key of formData.keys()) {
			if (key !== 'email' && key !== 'g' && !list.includes(key))
				list.push(key);
		}

		return list.join(',');
	}

	/**
	 * Populate fields
	 * helper Method
	 */
	getFormData() {
		return new FormData(this.form);
	}

	/**
	 * Inject form Fields
	 * Programmatically pass fields
	 * to send to the Klaviyo Form.
	 * Note: Will merge with  existing form fields.
	 * @param {Object} data
	 */
	injectData(data) {
		if (data && typeof data === 'object')
			this.injectedData = data;
	}

	/**
	 * merge Inject data to FormData
	 * Return updated formData
	 * @param {Object} formData 
	 * @returns {Object}
	 */
	mergeInjectedData(formData) {
		if (!this.injectedData) return formData;

		// Append Data
		for (const key in this.injectedData)
			formData.append(key, this.injectedData[key]);

		return formData;
	}

	/**
	 * Check if send by a Bot
	 * @param {Object} formData
	 * @returns {Boolean}
	 */
	isBot(formData) {
		return formData.has('bots') && formData.get('bots');
	}
}


window.bluedgeusa.theme.KlaviyoSubscribe = KlaviyoSubscribe;