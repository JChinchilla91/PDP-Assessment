/**
 * JS Class implementation of Shopify Core Utils
 * Section Class is exported to window.bluedgeusa.core namespace
 *
 * This class use STATIC Methods.
 *
 * NOTE: Need Polyfill for older browsers
 */
'use strict';


class Utils {
	
	/**
	 * Debounce method - static
	 * @param {Function} func
	 * @param {Integer} wait
	 * @param {Boolean} immediate
	 */
	static debounce(func, wait=400, immediate) {
		let timeout;
		return function() {
			const args = arguments;
			
			const later = () => {
				timeout = null;
				if (!immediate) 
					func.apply(this, args);
			};
		
			const callNow = immediate && !timeout;
			
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) 
				func.apply(this, args);
		}
	}
	
	/**
	 * Form Validation across the website
	 * based on Bootstrap and JS form.validation
	 */
	static formValidation() {
		const forms = document.querySelectorAll('form[data-needs-validation]');

		// Check Validity and adjust behavior:
		//	- Regular Action form
		// 	- stop default Event (form submit), send custom event
		// @param {Object} e
		// @param {DOM} form
		function validateForm(e, form) {
			let validity = false;
			const relyOnEvent = e.currentTarget.getAttribute('data-needs-validation');
				
			if (!form.checkValidity()) {
				e.stopPropagation();
				e.preventDefault();
				form.classList.add('was-validated', 'is-invalid');
			} else {
				form.classList.remove('is-invalid');
				validity = true;
			}
				
			// Add Class to Form
			form.classList.add('was-validated');
			
			// If relyOnEvent == `event` Prevent the form to be submitted
			// Dispatch Custom Event Validity Status on Form
			if (relyOnEvent == 'event') {
				e.stopPropagation();
				e.preventDefault();
				
				// Custom Event
				form.dispatchEvent(
					new CustomEvent('utils:formValidation', { detail: { validity: validity } })
				);
			}
		}

		// Add HTML5 form 
		// Remove Event Listeners as the method is called each time the drawer Cart is re-injected.
		forms.forEach((form) => form.removeEventListener('submit', (e) => validateForm(e, form), false));
		forms.forEach((form) => form.addEventListener('submit', (e) => validateForm(e, form), false));
	}
	
	/**
	 * Trigger the scroller method on Click
	 * The method will trigger the Click event on all 
	 * elements with the following Attribute:
	 * Usage: data-scroll-to="some_id_name"
	 * 
	 * Note: The targeted HTML element need to have an ID with the same name 
	 */
	static scrollerTrigger() {
		const triggers = document.querySelectorAll('[data-scroll-to]');
		
		// ATTACH EVENT LISTENERS
		triggers.forEach((trigger) => {
			trigger.addEventListener('click', (e) => window.bluedgeusa.core.Utils.scroller(e));
		});
	}
	
	/**
	 * Scroll client to a given element (event target)
	 * @param {Object} e
	 */
	static scroller(e) {	
		// VARIABLES
		const supportsNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;
		const id = e.currentTarget.getAttribute('data-scroll-to');
		
		// CHECK IF THE `id` IS AVAILABLE
		// Prevent Default behavior is `id` is present
		if (!id) return;
		e.preventDefault();
		
		// GET DISTANCE FROM TOP OF THE PAGE
		const el = document.getElementById(id);
		const posToTop = window.pageYOffset + el.getBoundingClientRect().top;
		
		if (supportsNativeSmoothScroll)
			window.scrollTo({ top: posToTop, left: 0, behavior: 'smooth' });
		else
			window.scrollTo(0, posTop); // IE
	}
	
	
	/** 
	 * Responsive Table Wrapper for .rte content
	 * Will wrap <table> with Bootstrap 5 class .table-responsive
	 */
	static rteTableWrapper() {
		const tables = document.querySelectorAll('.rte table');
		
		// WRAP each found table
		tables.forEach((table) => {
			// Add bootstrap 5 table class to HTML table
			table.classList.add('table');

			// Create new HTML div element
			const wrapper = document.createElement('div');
			
			// Set bootstrap 5 table responsive class on newly created div
			wrapper.classList.add('table-responsive');

			// Insert wrapper before el in the DOM tree
			table.parentNode.insertBefore(wrapper, table);

			// Move el into wrapper
			wrapper.appendChild(table);
		});
	}
	
	
	/** 
	 * Responsive Iframe Video Wrapper for .rte content
	 * Will wrap <iframe> with Bootstrap 5 class .ratio
	 * Default ratio is set to 16:9 (See Bootstrap Docs)
	 */
	static rteVideoIframeWrapper() {
		const iframes = document.querySelectorAll('.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"]');
		const wrapper = document.createElement('div');
		
		// ADD .ratio + ratio-16X9 classes
		wrapper.classList.add('ratio', 'ratio-16x9');
		
		// WRAP each found table
		iframes.forEach((iframe) => {
			iframe.parentNode.insertBefore(wrapper, iframe);
			wrapper.appendChild(iframe);
		});
	}

	/** 
	 * Build URL Parameters
	 * @param {Object} Elements
	 * @returns {String} URL Parameter
	 */
	static buildUrlParams(elements) {
		let arr = [];
		for (const el in elements) { arr.push(el+'='+elements[el]) }
		return arr.join('&');
	}

	/**
	 * Generate an unique UUID
	 * @returns {String}
	 */
	static uuidGenerator() {
		return Math.floor((1 + Math.random()) * 0x10000100001).toString(16).substring(1);
	}
}


window.bluedgeusa.core.Utils = Utils;