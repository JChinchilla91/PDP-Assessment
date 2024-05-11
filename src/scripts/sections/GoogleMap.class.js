/**
 * Use Google Map + Google Geocoder JS API
 */


class GoogleMap {
	constructor(container, type, id) {
		this._container 			= container;
		this._type 					= type;
		this._id 					= id;
		
		// SELECTORS
		this._selectors = {
			mapId					: 'map'
		};

		// DOM
		this.mapDOM 				= document.getElementById(this._selectors.mapId);
		this.infoWindow;
		this.marker;

		// VARIABLE
		this.defaultPosition		= { lat: -34.397, lng: 150.644 };
		this.address 				= this.mapDOM.dataset.address;
		this.storeName				= this.mapDOM.dataset.storeName;
		this.mapId					= this.mapDOM.dataset.mapId;
		
		// Expose InitMap
		window.initMap = this.initMap();
	}


	/**
	 * Init Google Map API
	 */
	async initMap() {
		const { Map, InfoWindow } = await google.maps.importLibrary('maps');

		this.map = new Map(this.mapDOM, {
			center: this.defaultPosition,
			zoom: 8,
			mapId: this.mapId ?? this._id,
			mapTypeControl	: false
		});

		this.infoWindow = new InfoWindow({
			content: `<div class="window-info p2">${this.address}</div>`,
			maxWidth: 230,
			ariaLabel: this.storeName
		});

		// Init Marker
		await this.setMarker();

		// Init Geocoding
		await this.geocodeAddress(this.address);
	}

	/**
	 * Set Marker
	 */
	async setMarker() {
		const { Marker } = await google.maps.importLibrary('marker');

		// The marker
		this.marker = new Marker({
			map: this.map,
			position: this.defaultPosition,
			icon: window.custom_marker,
			label: this.storeName,
			scale: 2
		});

		// Open window on Click
		this.marker.addListener('click', () => {
			this.infoWindow.open({
				anchor: this.marker,
				map: this.map
			});
		});
	}

	/**
	 * Geocoder API
	 * @param {String} address
	 */
	async geocodeAddress(address) {
		if (!address) {
			console.log('Missing Address for Google Map');
			return false;
		}

		const { Geocoder } = await google.maps.importLibrary('geocoding');
		const geocoder = new Geocoder();

		geocoder.geocode({ address: address })
			.then(r => {
				const { results } = r;
				
				// Set Map positions
				this.map.setCenter(results[0].geometry.location);
				
				// Set Marker on Map
				this.marker.setPosition(results[0].geometry.location);
				this.marker.setMap(this.map);
				
				return results;
			})
			.catch((e) => {
				console.log(`Geocode was not successful for the following reason: ${e}`);
			});
	}
}


// Export to theme namespace
window.bluedgeusa.theme.GoogleMap = GoogleMap;