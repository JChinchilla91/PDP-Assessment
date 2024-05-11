/**
 * JS Class implementation of Shopify Core
 * Section Class is exported to window.bluedgeusa.theme namespace
 *
 * NOTE: Need Polyfill for older browsers
 */
'use strict';

class Addresses {
	constructor(container, type, id) {
		this._container 			= container;
		this._type 					= type;
		this._id 					= id;
		
		// SELECTORS
		this._selectors = {
			newAddressBtn			:	'[data-address-add]',
			editAddressBtns 		:	'[data-address-edit]',
			deleteAddressBtns 		:	'[data-address-delete]',
			modalSaveBtn			:	'[data-modal-submit]',
			addressModal			:	'#addressModal',
			modalTitle				:	'#modal-title',
			form					:	'#address_form_new',
			formInputs				:	'[data-form-input]'
		};

		// ELEMENTS
		this.newAddressBtn 			= this._container.querySelector(this._selectors.newAddressBtn);
		this.editAddressBtns 		= this._container.querySelectorAll(this._selectors.editAddressBtns);
		this.deleteAddressBtns 		= this._container.querySelectorAll(this._selectors.deleteAddressBtns);
		this.modalSaveBtn 			= this._container.querySelector(this._selectors.modalSaveBtn);
		this.addressModal 			= this._container.querySelector(this._selectors.addressModal);
		this.modalTitle 			= this.addressModal.querySelector(this._selectors.modalTitle);
		this.form 					= this.addressModal.querySelector(this._selectors.form);
		this.formInputs 			= this.form.querySelectorAll(this._selectors.formInputs);
		
		// EVENT LISTENERS
		// Add new address
		this.newAddressBtn.addEventListener('click', (e) => this.openAddressModal(e));
		this.editAddressBtns.forEach((editBtn) => editBtn.addEventListener('click', (e) => this.openAddressModal(e)));
		this.deleteAddressBtns.forEach((deleteAddressBtns) => deleteAddressBtns.addEventListener('click', (e) => this.deleteAddress(e)));
		
		// Hidden modal
		this.addressModal.addEventListener('hidden.bs.modal', () => this.resetForm());
		
		// INIT
		this.initializeAddressForm();
	}
	
	/**
	* Called when modal is opened - IF Edit address - assign attribute to save btn and call populateForm()
	* @param {Object} e Event Object
	 */
	openAddressModal(e) {
		// Check e attributes
		if (e.target.hasAttribute('data-address-edit')) {
			// Edit address
			const addressID = parseInt(e.target.getAttribute('data-address-edit'));
			this.modalSaveBtn.setAttribute('data-address-id', addressID);
			this.updateFormAction(addressID);
			this.addPut();
			this.populateForm(addressID);
			this.setFormText(true)
		} else {
			// New address
			this.updateFormAction();
			this.setFormText();
		}
	}

	/**
	* Update the form action depending on if we are adding NEW address or EDITING existing address
	* @param {Integer} addressID
	 */
	updateFormAction(addressID) {
		if (addressID) {
			// Edit address
			this.form.setAttribute('action', '/account/addresses/' + addressID);
			this.form.id = 'address_form_' + addressID;
		} else {
			//new address
			this.form.setAttribute('action','/account/addresses');
			this.form.id = 'address_form_new';
		}
	}

	/**
	* Edit forms require a hidden input that signals a PUT request to Shopify
	 */
	addPut() {
		// Create element
		const putInput =  document.createElement('input');
		putInput.type = 'hidden';
		putInput.name= "_method";
		putInput.value = 'put';
		putInput.setAttribute('data-hidden-input', '');
		this.form.appendChild(putInput);
	}

	/**
	* Sets proper modal title and button text for either NEW address or EDIT address
	* @param {Boolean} editForm
	 */
	setFormText(editForm) {
		this.modalTitle.textContent = (editForm) ? window.bluedgeusa.theme.modalTitleEdit : window.bluedgeusa.theme.modalTitleNew;
	}

	/**
	* Populates form fields using window.bluedgeusa.theme.customerAddresses object
	* @param {Integer} addressID
	 */
	populateForm(addressID) {
		// Get address data from window.bluedgeusa.theme.customerAddresses
		const currentAddress = window.bluedgeusa.theme.customerAddresses.filter(address => address.id === addressID)[0];
		
		// Fill out fields values using JS
		for (let i = 0; i < this.formInputs.length; i++) {
			// Clean field name
			let tag = this.formInputs[i].name.replace('address[', '');
			tag = tag.slice(0,-1);
			
			if (currentAddress[tag]) {
				if (tag === 'default') {
					this.formInputs[i].checked = true;
				} else {
					this.formInputs[i].value = currentAddress[tag];
				}
			}
		}
	}

	/**
	* Sends DELETE request to Shopify with which address to delete
	* @param {Object} e
	 */
	deleteAddress(e) {
		const addressID = e.target.getAttribute('data-address-delete'),
		confirmMessage = e.target.getAttribute('data-confirm-message');

		if (confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
			Shopify.postLink('/account/addresses/'+addressID, { parameters: { _method: 'delete' } });
		}
	}

	/**
	 * Initialize the address form
	 */
	initializeAddressForm() {
		// Initialize observers on address selectors, defined in shopify_common.js
		if (Shopify) {
			new Shopify.CountryProvinceSelector('AddressCountry', 'AddressProvince', {
				hideElement: 'AddressProvinceContainer'
			});
		}
	}

	/**
	 * Reset Modal Form
	 */
	resetForm() {
		// Remove attribute on save btn
		this.modalSaveBtn.removeAttribute('data-address-id');
		
		// Reset fields
		this.form.reset();
		
		// Remove hidden input
		const hidden = this.form.querySelector('[data-hidden-input]');
		if (hidden) hidden.remove();
	}		
}


// Export to theme namespace
window.bluedgeusa.theme.Addresses = Addresses;