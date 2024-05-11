/**
 * JS Class extending Shopify Core Cart Class
 * Used for the Drawer Cart functions
 *
 * NOTE: Need Polyfill for older browsers
 */
'use strict';


/**
 * Cart constructor
 * We cannot rely on object.constructor.name to differentiate the instantiation from 
 * this class or a class extending it. Mostly because of IE and transpiler changing function/class name. 
 * So we use a String: context.
 * @param {String} context - Must be the Class Name
 */
class DynamicCart extends window.bluedgeusa.core.Cart {
	constructor(context='DynamicCart') {
		super(context);
		
		// SELECTORS (Merge with parent Class)
		this._selectors = Object.assign(this._selectors, {
			cartJSON			: '[data-cart-json]',
			cartCount			: '[data-cart-count]',
			clearCartBtn		: '[data-clear-cart]',
			drawerCartTotal		: '[data-drawer-cart-total]',
			drawerCartItems		: '[data-drawer-cart-items]',
			drawerRemoveItem	: '[data-remove-item]',
			loadingWrapper		: '[data-drawer-loading]'
		});
		
		// VARIABLES
		this.drawerCart 		= document.getElementById('drawerCart');
		this.offCanvas			= new bootstrap.Offcanvas(this.drawerCart);
		
		// INIT
		this.init();
		
		// Core CUSTOM EVENTS
		// On add to cart start, show drawer and start loading (later on success remove loader)
		document.addEventListener('core:addToCart:start', () => { this.openDrawer(); this.loadingWrapper.classList.remove('off'); });
		document.addEventListener('core:addToCart:success', () => this.loadCartItems());
		document.addEventListener('core:addToCart:fail', (e) => this._showWarning(e, true));
		document.addEventListener('core:changeToCart:fail', (e) => {
			this._showWarning(e);
			this._resetQuantitySelector(e);
		});
		document.addEventListener('core:changeToCart:success', (e) => this._manageQuantityChange(e));
		document.addEventListener('core:changeToCart:delete:success', (e) => this._removeItem(e));
		document.addEventListener('core:clearCart:success', () => this.loadCartItems());
		
		// Update CART API
		document.addEventListener('core:cart:quantity', (e) => this._updateCartItem(e));

		// Update item images state with lazyloading
		document.addEventListener('core:items:loaded', () => window.lazyLoadInstance.update());
	}
	
	/**
	 * INIT
	 * Also helpful for calling Init after the DOM was modified
	 */
	init() {
		// ELEMENTS
		this._container 		= document.getElementById('drawerCart');
		if (!this._container) return;
		
		this.cartJSON 			= JSON.parse(this._container.querySelector(this._selectors.cartJSON).innerHTML);
		if (!this.cartJSON) return;
		
		this.clearCartBtn		= this._container.querySelector(this._selectors.clearCartBtn);
		this.loadingWrapper		= this._container.querySelector(this._selectors.loadingWrapper);
		this.drawerCartItems	= this._container.querySelector(this._selectors.drawerCartItems);
		
		// Hide loading
		this.loadingWrapper.classList.add('off');
		
		// EVENTS
		if (this.clearCartBtn)
			this.clearCartBtn.addEventListener('click', (e) => this._toastConfirm(e, 'Are you sure you want to clear your cart?'));

		// Off Canvas events
		this.drawerCart.addEventListener('shown.bs.offcanvas', () => this.drawerCartItems.classList.remove('off'));
		
		// Activate remove Items Handler
		this._removeItemHandler();
	}
	
	/**
	 * On Cart Icon Click or Add to Cart
	 * Open the Drawer Cart
	 */
	openDrawer() {
		// Hide new items
		this.drawerCartItems.classList.add('off');
		this.offCanvas.show();
	}
	
	/**
	 * Close drawer
	 */
	closeDrawer() {
		this.offCanvas.hide();
	}
	
	/**
	 * Load Cart Items
	 */
	loadCartItems() {
		// SUCCESS call
		const success = (html) => {
			// Build HTML and inject
			this.drawerCart.innerHTML = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-inner-drawer]').innerHTML;
			
			// Re-Call Init (DOM elements + events Handler)
			this.init();
			
			// Show new items
			this.drawerCartItems.classList.remove('off');
			
			// Call Parent Class Method
			// To Attach event handlers
			// Re-attach other handlers
			this.activateQuantityControls();
			
			// Update all cart count on the page
			this._updateCartCount();

			// Dispatch event listener for when items have fully loaded
			document.dispatchEvent(new CustomEvent('core:items:loaded'));

			// Hide loading
			this.loadingWrapper.classList.add('off');
		};
		
		// FAIL call
		const fail = () => {
			// Hide loading
			this.loadingWrapper.classList.add('off');
			
			this.drawerCartItems.innerHTML = '<div class="no-item d-flex align-self-center w-100 justify-content-center p-3">Sorry something went wrong, please try again.</div>';
			this.drawerCartItems.classList.remove('off');
		};
		
		const options = { method: 'GET', url: '/cart?view=drawer&timestamp='+Date.now(), contentType: 'text/plain' };
		
		// FETCH Alternate Template cart.drawer.liquid
		window.bluedgeusa.core.Connect.fetch(options, null, success, fail);
	}
	
	/**
	 * Restore prev quantity of input if fail
	 * @param {Event} e Event Object from fail state
	 */
	_resetQuantitySelector(e) {
		const key = e.detail?.key;
		if (!key) return;
		
		// Get the previous Qty (before change)
		const qtyInput = document.getElementById(key);
		qtyInput.setAttribute('value', qtyInput.dataset.originalQty || 1);
	}

	/**
	 * Remove Item Handler
	 */
	_removeItemHandler() {
		const removeItem = Array.from(this._container.querySelectorAll(this._selectors.drawerRemoveItem));
		if (!removeItem) return;
		
		removeItem.forEach((item) => {
			item.addEventListener('click', (e) => {
				e.preventDefault();	

				const key = e.currentTarget.getAttribute('data-key');
				
				// Create data for cart update
				// Qty: 0 == delete item form Cart
				// key can use variant Key
				const data = { qty: 0, key: key, action: 'remove' };
				
				this._updateCartItem(null, data);
			});
		});
	}
	
	/**
	 * Remove Item form Cart display
	 * @param {Object} e
	 */
	_removeItem(e) {
		// Update cartJSON
		this.cartJSON = e.detail;
		
		// On Cart event delete successful
		// Removed item from HTML
		const key = e.detail.data.id || null;
		if (!key) return;
		
		const toDelete = this._container.querySelector('[data-drawer-key="'+key+'"]');
		if (toDelete) {
			const parent = toDelete.parentNode;	
			parent.removeChild(toDelete);
		}
		
		// Update Cart count + subtotal
		this._updateCartCount(e);
		this._updateSubtotal(e);
		
		// Reload the cart items to Display empty cart message
		// if the cart is empty
		if (!this.cartJSON.item_count)
			this.loadCartItems();
	}
	
	/**
	 * POST to CART JS API - cart.update
	 * 0: to delete a variant
	 * params accommodate to event triggered method call
	 * or manual call with data param.
	 * @param {Object} e - data in e.detail
	 * @param {object} data
	 */
	_updateCartItem(e, data) {
		if (e) e.preventDefault();
		
		// Merge data
		const detail = (e) ? e.detail : {};
		const d = Object.assign(detail, data);

		window.bluedgeusa.core.Connect.changeToCart(d.qty, d.key, d.properties || null, d.sellingPlan || null, d.action);
	}
	
	/**
	 * Manage quantity changes
	 * and track previous quantity
	 * in case user try to add more than Avail
	 * Stock later
	 * @param {Object} e
	 */
	_manageQuantityChange(e) {
		// Update cartJSON
		this.cartJSON = e.detail;
		
		// GET item to change from cart
		// We need to compare quantity to see if Shopify rejected
		// the quantity update due to lack of available stock
		var [itemToChange] = this.cartJSON.items.filter((item) => e.detail.data.id == item.key);

		// Update input data
		const input = document.getElementById(itemToChange.key);
		this._updateCartCount(e);
		this._updateSubtotal(e);
			
		// Update original quantity on input
		input.setAttribute('data-original-qty', itemToChange.quantity);
	}
	
	/**
	 * Update the count counts
	 * @param {Object} e - data in e.detail
	 */
	_updateCartCount(e) {
		let qty;
		if (e)
			qty = e.detail.item_count || e.detail.quantity;
		else
			qty = this.cartJSON.item_count;
		
		// Avoid undefined qty
		if (!qty) qty = 0;

		//const dataCount = this._container.querySelector(this._selectors.cartCount); 
		const cartCounts = document.querySelectorAll(this._selectors.cartCount);
		
		// Update display of all cart icons
		cartCounts.forEach((count) => {
			count.innerHTML = qty;

			if (count.hasAttribute('data-header-count') && qty === 0)
				count.classList.add('d-none');
			else
				count.classList.remove('d-none');
		});
	}
		
	/**
	 * Update Subtotal
	 * @param {Object} e - data in e.detail
	 */
	_updateSubtotal(e) {
		const totalCart = this._container.querySelector(this._selectors.drawerCartTotal);
		
		// Assign new Total to HTML dataSet
		totalCart.setAttribute('data-drawer-cart-total', e.detail.total_price);
		
		// Update the display
		totalCart.innerHTML = window.bluedgeusa.core.Currency.formatMoney(e.detail.total_price);
	}
	
	/**
	 * Show warning on Add / or quantity change
	 * being over the available stock.
	 * Trigger Toast for warning display
	 * @param {object} e
	 */
	_showWarning(e) {
		const toast = document.querySelector('[data-warning-toast]');
		
		// Update the Warning message
		if (toast) toast.querySelector('.toast-body').innerHTML = e.detail.err.description || e.detail.err.message || 'Sorry, an error occurred.';
		
		// On Close Toast events
		toast.addEventListener('hide.bs.toast', () => this.loadCartItems());
		
		// Open Toast
		window.bluedgeusa.theme.warning.show();
	}

	/**
	 * Show toast with yes/no options
	 * Clears cart
	 * @param {object} e
	 * @param {string} prompt - Prompt to show in dialogue
	 */
	_toastConfirm(e, prompt) {
		const toast = document.querySelector('[data-warning-toast]');
		const toastBtns = toast.querySelector('.toast-btns');
		const confirmBtn = toast.querySelector('[data-confirm-action]');

		// if confirm btn exists, set event listener
		if (confirmBtn) {
			confirmBtn.addEventListener('click', (e) => {
				window.bluedgeusa.core.Connect.clearCart(e);
				window.bluedgeusa.theme.warning.hide();
				toastBtns.classList.add('d-none');
			});
		}
		
		// Update the Warning message
		if (toast) toast.querySelector('.toast-body').innerHTML = prompt || 'Sorry, an error occurred.';

		if (toastBtns)
			toastBtns.classList.remove('d-none');
		
		// Open Toast
		window.bluedgeusa.theme.warning.show();
	}
}


window.bluedgeusa.core.DynamicCart = DynamicCart;