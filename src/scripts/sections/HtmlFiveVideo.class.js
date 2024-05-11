/**
 * Youtube Facade - 
 * Inspiration: https://github.com/justinribeiro/lite-youtube
 * Inspiration: https://github.com/paulirish/lite-youtube-embed/blob/master/src/lite-yt-embed.js
 * Loaded from sections/video-banner.liquid
 *
 */
'use strict';


class HTMLFiveVideo {
	constructor(container, type, id) {
		this._container 		= container;
		this._type 				= type;
		this._id 				= id;
		
		// PARAMS
		this.autoplay			= (this._container.getAttribute('data-video-autoplay') === 'true') ? 1 : 0;
		this.videoWrapper 		= document.getElementById('V'+this._id);
		this.observerOffset		= '600px';
		this.videoPlaying		= false;
		this.videoMuted			= false;

		// TEST PARAMS
		if (!this.videoWrapper) return;
			
		// IF AUTOPLAY init Intersection Observer
		if (this.autoplay === 1)
			this.initIntersectionObserver();
		else // ADD play button for Vimeo or Youtube
			this.addPlayButton();	
	}
	
	/**
	 * Init Intersect Observer
	 * Lazy load on boundRect enter
	 */
	initIntersectionObserver() {
		// Check Support
		if ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window) {
			const options = { root: null, rootMargin: this.observerOffset, threshold: 0 };

			const observer = new IntersectionObserver((entries, observer) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						this.togglePlayVideo();
						observer.unobserve(this._container);
					}
				});
			}, options);
			
			// Observe
			observer.observe(this._container);
		}
	}
	
	/**
	 * Add Play Button
	 * ADD PLAY BUTTON if Autoplay === false
	 */
	addPlayButton() {
		let playBtnEl = document.createElement('button');
		playBtnEl.type = 'button';
		playBtnEl.classList.add('playbtn');
		playBtnEl.setAttribute('aria-label', 'Video Play Button');
		playBtnEl.innerHTML = "<span class='d-none'>play</span>";
		this.videoWrapper.append(playBtnEl);

		// Toggle play/pause video
		this.videoWrapper.addEventListener('click', (e) => this.handleVideoClick(e));
	}

	/**
	 * Handle video click - event delegation
	 * @param {Object} e
	 */
	handleVideoClick(e) {
		const target = e.target,
			soundIcon = target.hasAttribute('data-sound-icon');
		// If sound icon is clicked, toggle mute
		if (soundIcon) 
			this.toggleMuteVideo();
		else
			// Otherwise, toggle pause/play
			this.togglePlayVideo();

	}

	/**
	 * Toggle between playing and pausing video native video element
	 */
	togglePlayVideo() {
		// Get video element
		const videoEl = this.videoWrapper.querySelector('video');

		// Fail fast
		if (!videoEl) return;

		// Show/hide play button
		this.videoWrapper.classList.toggle('activated');

		// Play if not already playing, pause if it is
		if (!this.videoPlaying)
			videoEl.play();
		else
			videoEl.pause();

		// Update state of video
		this.videoPlaying = !this.videoPlaying;
	}

	/**
	 * Toggle Mute on video
	 */
	toggleMuteVideo() {
		// Get video element
		const videoEl = this.videoWrapper.querySelector('video');
		const soundIcon = this.videoWrapper.querySelector('.sound-icon');

		// Fail fast
		if (!videoEl || !soundIcon) return;

		// Toggle video volume state
		if (!this.videoMuted)
			videoEl.volume = 0.0;
		else
			videoEl.volume = 1.0;

		// Update state of mute variable
		this.videoMuted = !this.videoMuted
		soundIcon.classList.toggle('sound');
	}

	/**
	 * Event callback for Theme Editor `shopify:section:load` event
	*/
	onLoad() {
			
		// IF AUTOPLAY init Intersection Observer
		if (this.autoplay === 1)
			this.initIntersectionObserver();
		else // ADD play button for Vimeo or Youtube
			this.addPlayButton();	

		window.lazyLoadInstance.update();
	}

	/**
	 * Event callback for Theme Editor `shopify:section:unload` event
	*/
	onUnload() {
		// REMOVE EVENT HANDLERS
		this.videoWrapper.removeEventListener('click', (e) => this.handleVideoClick(e));
	}
}


// Export to theme namespace
window.bluedgeusa.theme.HTMLFiveVideo = HTMLFiveVideo;