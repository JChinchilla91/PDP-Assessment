/**
 * JS Class implementation of Shopify Core
 * Section Class is exported to window.bluedgeusa.theme namespace
 *
 * NOTE: Need Polyfill for older browsers
 */
'use strict';

class Login {
	constructor(container, type, id) {
		this._container 			= container;
		this._type 					= type;
		this._id 					= id;
		
		// SELECTORS
		this._selectors = {
			recoverPasswordFormTriggers			: '[data-recover-toggle]',
			recoverPasswordForm					: '[data-recover-form]',
			loginForm							: '[data-login-form]',
			formState							: '[data-form-state]',
			resetSuccess						: '[data-reset-success]',
			submitButton						: '[data-submit-password]',
			password						    : '[data-password]',
			confirmPassword						: '[data-confirm-password]',
			passwordErrorMessage				: '[data-password-error]'
		};
		
		// ELEMENTS
		this.recoverPasswordForm				= this._container.querySelector(this._selectors.recoverPasswordForm);
		this.recoverPasswordFormTriggers		= this._container.querySelectorAll(this._selectors.recoverPasswordFormTriggers);
		this.submitButton						= this._container.querySelector(this._selectors.submitButton);

		this.checkUrlHash();
		this.resetPasswordSuccess();

		// EVENT HANDLERS
		this.recoverPasswordFormTriggers.forEach((el) => el.addEventListener('click', (e) => this.showHidePasswordForm(e)));
		if (this.submitButton) {
			this.submitButton.addEventListener('click', (e) => this.checkPasswords(e));
		}
	}
	
	/**
	 * Show/Hide Password recovery form
	 * @param {Object} e
	 */
	showHidePasswordForm(e) {
		e.preventDefault();
		this.toggleRecoverPasswordForm();
	}
	
	/**
	 * Show/Hide recover password form
	 */
	toggleRecoverPasswordForm() {
		this.recoverPasswordForm.classList.toggle('d-none');
		this._container.querySelector(this._selectors.loginForm).classList.toggle('d-none');
	}
	
	/**
	 * Show reset password success message
	 */
	resetPasswordSuccess() {
		// Check if reset password form was
		// successfully submitted and show success message.
		if (this._container.querySelector(this._selectors.formState))
			this._container.querySelector(this._selectors.resetSuccess).classList.remove('d-none');
	}
	
	/**
	 * Check Url Hash 
	 * Trigger password for if #recover
	 */
	checkUrlHash() {
		const hash = window.location.hash;
		
		// Allow deep linking to recover password form
		if (hash === '#recover')
			this.toggleRecoverPasswordForm();
	} 

	/**
	 * Check that both passwords are the same
	 * Trigger error if passwords are inconsistent 
	 * @param {Object} e
	 */
	checkPasswords(e) {
		// variables
		const password				= this._container.querySelector(this._selectors.password);
		const confirmPassword 		= this._container.querySelector(this._selectors.confirmPassword);
		const passwordErrorMessage 	= this._container.querySelector(this._selectors.passwordErrorMessage);

		if (password.value !== confirmPassword.value) {
			e.preventDefault();
			passwordErrorMessage.classList.remove('d-none');
		} else {
			passwordErrorMessage.classList.add('d-none');
		}
	} 
}

// Export to theme namespace
window.bluedgeusa.theme.Login = Login;