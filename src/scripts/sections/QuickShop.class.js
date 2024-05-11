/**
 * Quick Shop Feature
 * Can be Activate in General Settings
 */
import './ProductQuickShop.class.js';

class QuickShop {
	constructor () {
		// SELECTORS
		this._selectors = {
			sectionID				: 'product-form',
			triggers				: '[data-quickshop-handle]',
			quickShopModalID		: 'quickShopModal',
			dataQuickShopHandle		: 'data-quickshop-handle',
			modalBody				: '.modal-body'
		};

		// DOM
		this.triggers 				= null;
		this.quickShopModal 		= new bootstrap.Modal(document.getElementById(this._selectors.quickShopModalID));
		this.modalBody				= document.querySelector(`#${this._selectors.quickShopModalID} ${this._selectors.modalBody}`);

		// Close Modal on Drawer Cart being Open
		document.addEventListener('core:addToCart:start', () => this.quickShopModal.hide());

		// Product Recommendations
		document.addEventListener('productsInjected', () => this.activate());

		// Init
		this.activate();
	}

	/**
	 * Activate DOM element event
	 * Remove the event handler before adding them,
	 * this is useful when calling the function for
	 * new asynchronously created DMO elements
	 */
	activate() {
		/**
		 * Event Handler function
		 * @param {Object} e
		 */ 
		const addEventHandlers = (e) => {
			const handle = e.target.getAttribute(this._selectors.dataQuickShopHandle);
			if (!handle) return console.log('Quick Shop: Missing PDP handle');
			e.preventDefault();
			this.openModal(handle);
		}

		this.triggers = document.querySelectorAll(this._selectors.triggers);

		// Remove / Clean event handler
		this.triggers.forEach((el) => el.removeEventListener('click', addEventHandlers));

		// Add event handlers
		this.triggers.forEach((el) => el.addEventListener('click', addEventHandlers));
	}

	/**
	 * Open Modal Window
	 * @param {String} handle
	 */
	openModal(handle) {
		// Reset / Clean the HTML content
		this.modalBody.textContent = '... Loading ...';
		
		// Open Modal Window
		this.quickShopModal.show();
		
		// Start AJAX load
		this.loadPDP(handle);
	}

	/**
	 * Load PDP
	 * @param {String} handle
	 */
	loadPDP(handle) {
		const url = `/products/${handle}?section_id=${this._selectors.sectionID}`;
		const options = { method: 'GET', url: url, contentType: 'text/html' };
		
		// FETCH
		window.bluedgeusa.core.Connect.fetch(options, null, 
			(r) => {
				this.modalBody.innerHTML = r;
				this.runProduct();
			},
			(err) => {
				console.error('err:', err);
				this.showWarning('Sorry a problem Occurred!');
			}
		);
	}

	/**
	 * Instantiate Product Class
	 * Rely on Section: Product
	 */
	runProduct() {
		// Deregister Section ID first
		window.bluedgeusa.sections.deregister(this._selectors.sectionID, 'productQuickShop');

		// Product section
		window.bluedgeusa.sections.register('productQuickShop', window.bluedgeusa.theme.ProductQuickShop);
	}

	/**
	 * Show warning
	 * @param {String} msg
	 */
	showWarning(msg) {
		const toast = document.querySelector('[data-warning-toast]');
		if (!toast) return;

		// Update the Warning message
		toast.querySelector('.toast-body').innerHTML = msg || 'Sorry, an error occurred.';
	
		// Open Toast
		window.bluedgeusa.theme.warning.show();

		// Close Modal Window
		toast.addEventListener('hide.bs.toast', () => {
			this.quickShopModal.hide();
		});
	}
}


// Export to theme namespace
window.bluedgeusa.theme.QuickShop = QuickShop;