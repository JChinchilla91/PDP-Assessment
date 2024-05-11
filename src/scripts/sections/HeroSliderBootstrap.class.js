/**
 * Bootstrap 5 Carousel - https://v5.getbootstrap.com/docs/5.0/components/carousel/
 * Loaded from sections/hero-slider-bootstrap.liquid
 */
'use strict';


class HeroSliderBootstrap {
	constructor(container, type, id) {
		this._container 			= container;
		this._type					= type;
		this._id 					= id;

		// SELECTORS
		this._selectors = {
			sliderCaption			: '[data-slider-caption]',
			activeSliderCaption		: '.carousel-item.active [data-slider-caption]'
		};

		// LISTENERS
		this._container.addEventListener('slid.bs.carousel', (e) => this.slideCompleteHandler(e));

		// INIT
		this.initSlider();
		this.initSliderCSS();
	}

	/**
	 * Initialize slider and set options
	 */
	initSlider() {
		new bootstrap.Carousel(this._container);
	}

	/**
	 * Init simple css animation for the copy block
	 */
	initSliderCSS() {
		const active = this._container.querySelector(this._selectors.activeSliderCaption);
		active.classList.add('on');
	}
	
	/**
	 * Slide Complete Event Handler
	 * @param {Object} e 
	 */
	slideCompleteHandler(e) {
		// RESET ON classes (remove)
		const carouselCaptionAll = this._container.querySelectorAll(this._selectors.sliderCaption);
		carouselCaptionAll.forEach((el) => el.classList.remove('on'));

		// ADD ON classes on Active slide
		const carouselCaptionActive = e.relatedTarget.querySelector(this._selectors.sliderCaption);
		carouselCaptionActive.classList.add('on');	
	}

	/**
	 * Theme "Customize" panel shopify:section:load event listener
	 */
	onLoad() {
		// INIT
		this.initSlider();
		this.initSliderCSS();
		window.lazyLoadInstance.update();
	}
	
	/**
	 * Theme "Customize" panel shopify:section:unload event listener
	 */
	onUnload() {
		this._container.removeEventListener('slid.bs.carousel', this.slideCompleteHandler);
	}
}


// Export to theme namespace
window.bluedgeusa.theme.HeroSliderBootstrap = HeroSliderBootstrap;