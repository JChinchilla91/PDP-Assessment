/**
 * Flickity slider - https://flickity.metafizzy.co/ 
 */
'use strict';


class GenericSlider {
	constructor(container, type, id, dynamic=false) {
		this._container 		= container;
		this._type 				= type;
		this._id 				= id;
		this._dynamic			= dynamic;
		
		// SELECTORS
		this._selectors = {
			slider				: '[data-generic-slider]'
		};
		
		// ELEMENTS
		this.slider				= this._container.querySelector(this._selectors.slider);
		this.flkty				= null;

		// SLIDER OPTIONS
		this.sliderOptions = {
			// options
			cellAlign: 'left',
			contain: false,
			accessibility: false,
			watchCSS: true,
			percentPosition: false,
			adaptiveHeight: true,
			arrowShape: { 
				x0: 20,
				x1: 60, y1: 40,
				x2: 65, y2: 35,
				x3: 30
			}
		};

		// Test passive listener
		this.supportPassiveListener = false;
		this._testPassiveListener();

		// Init slider  
		if (this.slider) 
			this.initSlider();
	}
	
	/**
	 * Initialize slider
	 */
	initSlider() {
		const options = Object.assign(this.sliderOptions, {
			pageDots			: this.slider.dataset.dots === 'false' ? false : true,
			prevNextButtons		: this.slider.dataset.arrows === 'false' ? false : true,
			freeScroll			: this.slider.dataset.freeScroll === 'true' ? true : false,
			wrapAround			: this.slider.dataset.loop === 'false' ? false : true,
			groupCells			: this.slider.dataset.groupCells === 'true' ? true : false,
			lazyLoad            : this.slider.dataset.lazyLoad === 'true' ? true : false,
			fade				: this.slider.dataset.fade === 'true' ? true : false,
			dragThreshold		: 40
		});

		// Start Flickity 
		import(/* webpackChunkName: "flickity" */ 'flickity').then(({ default: Flickity }) => {
			this.flkty = new Flickity(this.slider, options)
		})

		// Resize event
		window.addEventListener('resize', this.resizeSlider.bind(this), this.supportPassiveListener ? { passive: true } : false);
	}
	
	/**
	 * Resize Slider
	 *
	 */
	resizeSlider() {
		this.flkty.resize();
	}

	/**
	 * Passive listener feature detection
	 * Test via a getter in the options object to see if the passive property is accessed
	 */
	_testPassiveListener() {
		try {
			const opts = Object.defineProperty({}, 'passive', {
				get: () => this.supportPassiveListener = true
			});
			window.addEventListener('testPassive', null, opts);
			window.removeEventListener('testPassive', null, opts);
		} catch (e) {
			console.log(e);
		}
	}

	/**
	 * Theme "Customize" panel shopify:section:load event listener
	 */
	onLoad() {
		// INIT
		this.initSlider();
		window.lazyLoadInstance.update();
	}
	
	/**
	 * Event callback for Theme Editor `shopify:section:unload` event
	*/
	onUnload() {
		window.removeEventListener('resize', this.resizeSlider, this.supportPassiveListener ? { passive: true } : false);
	}
}

// Export to theme namespace
window.bluedgeusa.theme.GenericSlider = GenericSlider;