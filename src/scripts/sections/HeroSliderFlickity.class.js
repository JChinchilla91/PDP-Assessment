/**
 * Flickity slider - https://flickity.metafizzy.co/
 * Loaded from sections/theme-hero-slider-flickity.liquid
 */
'use strict';


class HeroSliderFlickity {
	constructor(container, type, id) {
		this._container 		= container;
		this._type 				= type;
		this._id 				= id;
		
		// SELECTORS
		this._selectors = {
			slider				: '[data-hero-slider]'
		};
		
		// SLIDER OPTIONS
		this.sliderOptions = {
			// options
			adaptiveHeight		: true,
			cellAlign			: 'left',
			contain				: true,
			accessibility		: false
		};
		
		// ELEMENTS
		this.slider				= this._container.querySelector(this._selectors.slider);
		this.flkty				= null;

		// CHECK IF HERO SLIDER EXISTS
		if (!this.slider) return;

		// Test passive listener
		this.supportPassiveListener = false;
		this._testPassiveListener();
		
		// INIT
		this.initSlider();
	}
	
	/**
	 * Initialize slider
	 */
	initSlider() {
		const options = Object.assign(this.sliderOptions, {
			pageDots: (this.slider.getAttribute('data-dots') === 'false') ? false : true,
			prevNextButtons: (this.slider.getAttribute('data-arrows') === 'false') ? false : true,
			wrapAround: (this.slider.getAttribute('data-loop') === 'false') ? false : true
		});
		import(/* webpackChunkName: "flickity" */ 'flickity').then(({ default: Flickity }) => {
			this.flkty = new Flickity(this.slider, options)
		});
		window.addEventListener('resize', this.resizeSlider.bind(this), this.supportPassiveListener ? { passive: true } : false);
	}
	
	/**
	 * Resize Slider
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
	 * Event callback for Theme Editor `shopify:section:load` event
	*/
	onLoad() {
		this.initSlider();
	}

	/**
	 * Event callback for Theme Editor `shopify:section:unload` event
	*/
	onUnload() {
		window.removeEventListener('resize', this.resizeSlider, this.supportPassiveListener ? { passive: true } : false);
	}
}


// Export to theme namespace
window.bluedgeusa.theme.HeroSliderFlickity = HeroSliderFlickity;