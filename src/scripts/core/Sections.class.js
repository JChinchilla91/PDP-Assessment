/**
 * JS Class implementation of Shopify Core Sections
 * Section Class is exported to window.bluedgeusa.core namespace
 * 
 * IMPORTANT: Sections registered MUST have 3 parameters in their constructor, and assign them as follow
 * this._container = container;
 * this._type = type;
 * this._id = id;
 *
 * NOTE: Need Polyfill for older browsers
 */

'use strict';


class Sections {
	constructor() {
		this._registered 	= {};
		this._instances 	= [];
		
		// Async on loads for section (Shopify backend)
		this._initDesignMode();
	}
	
	/** Register new Section
	 * @param {String} type
	 * @param {Class} constructor	
	 */
	register(type, constructor) {
		if (typeof type !== 'string')
			throw new TypeError('Theme Sections: The first argument for .register must be a string that specifies the type of the section being registered');

		// Theme Sections: A section of type ${type} has already been registered. You cannot register the same section type twice
		if (typeof this._registered[type] !== 'undefined') return;

		if (typeof constructor !== 'function')
			throw new TypeError('Theme Sections: The second argument for .register must be a Class with 2 arguments: container, type');

		// Create instance
		this._createInstance(type, constructor);
	}

	/**
	 * Deregister Instances and Registered instances
	 * @param {String} sectionID 
	 * @param {String} sectionType 
	 */
	deregister(sectionID, sectionType) {
		if (!sectionID || !sectionType) return;

		this._instances = this._removeInstance(this._instances, '_id', sectionID);
		this._registered = this._removeRegister(this._registered, sectionType);
	}
	
	/** Create instance for each container
	 * @param {String} type
	 * @param {Class} constructor	
	 */	
	_createInstance(type, constructor) {
		// Get container
		const containers = document.querySelectorAll('[data-section-type="'+type+'"]');
		
		// Register new sections
		containers.forEach((container) => {
			const id = container.getAttribute('data-section-id');
			
			// Invoke, Add instance, Register instance with type
			const instance = new constructor(container, type, id);
			this._instances.push(instance);
			this._registered[type] = instance;
		});
	}
	
	/**
	 * Bind event Listeners for Shopify Configurator
	 */
	_initDesignMode() {
		if (!window.Shopify.designMode === true) return false;
		
		// SHOPIFY:SECTION:LOAD \\
		document.addEventListener('shopify:section:load', (e) => {
			const instance = this._findInstance(this._instances, '_id', e.detail.sectionId);
			if (instance && typeof instance.onLoad === 'function')
				instance.onLoad(e);
				window.lazyLoadInstance.update();
		});
		
		// SHOPIFY:SECTION:UNLOAD \\
		document.addEventListener('shopify:section:unload', (e) => {
			const instance = this._findInstance(this._instances, '_id', e.detail.sectionId);
			if (instance && typeof instance.onUnload === 'function')
				instance.onUnload(e);
				window.lazyLoadInstance.update();
		});
		
		// SHOPIFY:SECTION:SELECT \\
		document.addEventListener('shopify:section:select', (e) => {
			const instance = this._findInstance(this._instances, '_id', e.detail.sectionId);
			if (instance && typeof instance.onSelect === 'function')
				instance.onSelect(e);
				window.lazyLoadInstance.update();
		});
		
		// SHOPIFY:SECTION:DESELECT \\
		document.addEventListener('shopify:section:deselect', (e) => {
			const instance = this._findInstance(this._instances, '_id', e.detail.sectionId);
			if (instance && typeof instance.onDeselect === 'function')
				instance.onDeselect(e);
				window.lazyLoadInstance.update();
		});
		
		// SHOPIFY:SECTION:REORDER
		document.addEventListener('shopify:section:reorder', (e) => {
			const instance = this._findInstance(this._instances, '_id', e.detail.sectionId);
			if (instance && typeof instance.onReorder === 'function')
				instance.onReorder(e);
				window.lazyLoadInstance.update();
		});
		
		// SHOPIFY:BLOCK:SELECT \\
		document.addEventListener('shopify:block:select', (e) => {
			const instance = this._findInstance(this._instances, '_id', e.detail.sectionId);
			if (instance && typeof instance.onBlockSelect === 'function')
				instance.onBlockSelect(e);
				window.lazyLoadInstance.update();
		});
		
		// SHOPIFY:BLOCK:DESELECT
		document.addEventListener('shopify:block:deselect', (e) => {
			const instance = this._findInstance(this._instances, '_id', e.detail.sectionId);
			if (instance && typeof instance.onBlockDeselct === 'function')
				instance.onBlockDeselect(e);
				window.lazyLoadInstance.update();
		});
	}
	
	
	// --- UTILS --- //
	/**
	 * Return an object from an array of objects that matches the provided key and value
	 * @param {array} array - Array of objects
	 * @param {String} key - Key to match the value against
	 * @param {String} value - Value to get match of
	*/
	_findInstance(array, key, value) {
		for (var i = 0; i < array.length; i++) {
			if (array[i][key] === value) return array[i];
		}
	}
	
	/**
	 * Remove an object from an array of objects by matching the provided key and value
	 * @param {array} array - Array of objects
	 * @param {String} key - Key to match the value against
	 * @param {String} value - Value to get match of
	*/
	_removeInstance(array, key, value) {
		let i = array.length;
		while(i--) {
			if (array[i][key] === value) {
				array.splice(i, 1);
				break;
			}
		}
		return array;
	}

	/**
	 * Remove an object from the Registered object by matching the provided key and value
	 * @param {Object} obj - Array of objects
	 * @param {String} value - Value to get match of
	*/
	_removeRegister(obj, value) {
		for (let o in obj) {
			if (o === value) {
				delete obj[o];
				break;
			}
		}
		return obj;
	}
}

// Export to core namespace
window.bluedgeusa.core.Sections = Sections;