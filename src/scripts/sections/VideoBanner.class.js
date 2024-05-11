/**
 * Youtube Facade - 
 * Inspiration: https://github.com/justinribeiro/lite-youtube
 * Inspiration: https://github.com/paulirish/lite-youtube-embed/blob/master/src/lite-yt-embed.js
 * Loaded from sections/video-banner.liquid
 *
 */
'use strict';


class VideoBanner {
	constructor(container, type, id) {
		this._container 		= container;
		this._type 				= type;
		this._id 				= id;
		
		// PARAMS
		this.provider 			= this._container.getAttribute('data-provider');
		this.videoID 			= this._container.getAttribute('data-video-id');
		this.autoplay			= (this._container.getAttribute('data-video-autoplay') === 'true') ? 1 : 0;
		this.videoWrapper 		= document.getElementById('V'+this._id);
		this.iframeLoaded		= false;
		this.observerOffset		= '600px';
		this.preconnected		= false;
		this.player				= null;
		this.videoPlaying		= false;
		this.videoMuted			= false;
		this.mediaWidth = 0;
		this.mediaHeight = 0;

		// TEST PARAMS
		if (!this.provider || !this.videoID) return;

		// YOUTUBE
		if (this.provider === 'youtube')
			this.initYoutubePoster();
		else if (this.provider == 'vimeo')
			this.initVimeoPoster();
			
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
					if (entry.isIntersecting && !this.iframeLoaded) {
						if (this.provider != 'shopify') {
							this.warmConnections();
							this.injectVideoPlayer();
						}
						observer.unobserve(this._container);
					}
				});
			}, options);
			
			// Observe
			observer.observe(this._container);
		}
	}
	
	
	initYoutubePoster() {
		const posterUrl = `https://i.ytimg.com/vi/${this.videoID}/maxresdefault.jpg`;
		this.addPrefetch('preload', posterUrl, 'image');
		
		this._container.style.backgroundPosition = 'center center';
		this._container.style.backgroundSize = 'cover';
		this._container.style.backgroundImage = `url("${posterUrl}")`;
	}
	
	/**
	 * Get Vimeo poster
	 * Note: Must use no-cors on fetch file from api in order to get thumbnail URL
	 */
	initVimeoPoster() {
		this.addPrefetch('preconnect', 'https://i.vimeocdn.com/');

		// SUCCESS
		const success = (r) => {
			// We expect an array
			if (!r.length) return;
			
			const l = r[0]['thumbnail_large'];
			this.mediaWidth = r[0]["width"];
			this.mediaHeight = r[0]["height"];
			const imgId = (l.substring(l.lastIndexOf("/") + 1)).split("_")[0];
			const posterUrl = `https://i.vimeocdn.com/video/${imgId}.jpg?mw=${this.mediaWidth}&mh=${this.mediaHeight}&q=70`;
			
			this._container.style.backgroundPosition = 'center center';
			this._container.style.backgroundSize = 'cover';
			this._container.style.backgroundImage = `url("${posterUrl}")`;
			this._container.querySelector(".video-player").style.setProperty('--bs-aspect-ratio', `calc(${this.mediaHeight} / ${this.mediaWidth} * 100%)`);
		};
		
		// FAIL (We need a strategy Here !!!!)
		const fail = () => {
			console.log(`Vimeo video poster error - Video ID: ${this.videoID}`);
		};
		
		const options = {
			noOption: true, // Ignore all additional options and hedears
			url: `https://vimeo.com/api/v2/video/${this.videoID}.json`,
		};
		
		// GET JSON data
		window.bluedgeusa.core.Connect.fetch(options, null, success, fail);
	}
	

	/**
	 * Initialize YOUTUBE video
	 * Player Vars: https://developers.google.com/youtube/player_parameters
	 */
	injectVideoPlayer() {
		const playerVars = (this.provider === 'youtube') 
			? { height: "100%", width: "100%", mute: 1, autoplay: 1, controls: 0, modestbranding: 1, playsinline: 1, loop: 1 } // Youtube
			: { muted: 1, autoplay: 1, byline: 0, background: 1, portrait: 0, loop: 1, title: 0 }; // Vimeo
			
		const params = new URLSearchParams(playerVars);
		const iframeEl = document.createElement('iframe');
		
		iframeEl.width = '100%';
		iframeEl.height = '100%';
		iframeEl.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
		iframeEl.allowFullscreen = true;
		iframeEl.title = 'Video Player for: ' + this.videoID;
		
		// YOUTUBE
		if (this.provider === 'youtube')
			iframeEl.src = `https://www.youtube-nocookie.com/embed/${this.videoID}?${params.toString()}`;
		else // VIMEO
			iframeEl.src = `https://player.vimeo.com/video/${this.videoID}?${params.toString()}`;
		
		this.videoWrapper.append(iframeEl);
		
		// Set as active
		this.videoWrapper.classList.add('activated');
		
		// Set focus for a11y
		this.videoWrapper.querySelector('iframe').focus();
	}

	
	/**
	 * Add a <link rel={preload | preconnect} ...> to the head
	 * @param {String} kind
	 * @param {String} url
	 * @param {String} as
	 */
	addPrefetch(kind, url, as) {
		const linkEl = document.createElement('link');
		linkEl.rel = kind;
		linkEl.href = url;
		if (as) linkEl.as = as;
	
		document.head.append(linkEl);
	}
	
	/**
	 * YOUTUBE PRECONNECT
	 * Begin pre-connecting to warm up the iframe load
	 * Since the embed's network requests load within its iframe,
	 * preload/prefetch'ing them outside the iframe will only cause double-downloads.
	 * So, the best we can do is warm up a few connections to origins that are in the critical path.
	 */
	warmConnectionsYoutube() {
		if (this.preconnected) return;
	
		// The iframe document and most of its sub-resources come right off youtube.com
		this.addPrefetch('preconnect', 'https://www.youtube-nocookie.com');
		
		// The botguard script is fetched off from google.com
		this.addPrefetch('preconnect', 'https://www.google.com');
		
		// Not certain if these ad related domains are in the critical path. Could verify with domain-specific throttling.
		this.addPrefetch('preconnect', 'https://googleads.g.doubleclick.net');
		this.addPrefetch('preconnect', 'https://static.doubleclick.net');
		
		this.preconnected = true;
	}
	
	/**
	 * VIMEO PRECONNECT
	 * Begin pre-connecting to warm up the iframe load
	 * Since the embed's network requests load within its iframe,
	 * preload/prefetch'ing them outside the iframe will only cause double-downloads.
	 * So, the best we can do is warm up a few connections to origins that are in the critical path.
	 */
	warmConnectionsVimeo() {
		if (this.preconnected) return;
	
		// The iframe document and most of its sub-resources come right off player.vimeo.com
		this.addPrefetch('preconnect', 'https://player.vimeo.com');
		// Images
		this.addPrefetch('preconnect', 'https://i.vimeocdn.com');
		// Files .js, .css
		this.addPrefetch('preconnect', 'https://f.vimeocdn.com');
		// Metrics
		this.addPrefetch('preconnect', 'https://fresnel.vimeocdn.com');
		
		this.preconnected = true;
	}

	/**
	 * Warm connections
	 * Provider value trigger the right method
	 */
	warmConnections() {
		if (this.provider === 'youtube')
			this.warmConnectionsYoutube();
		else
			this.warmConnectionsVimeo();
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

		// EVENT HANDLERS
		// Once the user clicks and the provider is not Shopify, add the real iframe and drop our play button if
		if (this.provider != 'shopify') {
			// On hover (or tap), warm up the TCP connections we're (likely) about to use.
			this.videoWrapper.addEventListener('pointerover', () => this.warmConnections(), { once: true });
			this.videoWrapper.addEventListener('click', () => this.injectVideoPlayer());
		}
		else
			// Else toggle play/pause video
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
		// TEST PARAMS
		if (!this.provider || !this.videoID) return;

		// YOUTUBE
		if (this.provider === 'youtube')
			this.initYoutubePoster();
		else
			this.initVimeoPoster();
			
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
		// On hover (or tap), warm up the TCP connections we're (likely) about to use.
		this.videoWrapper.removeEventListener('pointerover', () => this.warmConnections(), { once: true });
		
		// Once the user clicks, add the real iframe and drop our play button
		this.videoWrapper.removeEventListener('click', () => this.injectVideoPlayer());
	}
}


// Export to theme namespace
window.bluedgeusa.theme.VideoBanner = VideoBanner;