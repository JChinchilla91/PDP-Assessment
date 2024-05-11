"use strict";
__webpack_public_path__ = window.__webpack_public_path__;

/*================ Slate ================*/
import "./core/Utils.class.js";
import "./core/Sections.class.js";
import "./core/Connect.class.js";
import "./core/Variants.class.js";
import "./core/Images.class.js";
import "./core/Currency.class.js";
import "./core/Cart.class.js";
import "./core/DynamicCart.class.js";

/*================ Theme ================*/
import "./sections/PredictiveSearch.class.js";
import "./sections/KlaviyoSubscribe.class.js";
import "./sections/QuickShop.class.js"; // Remove if not used

// INIT Core / Sections
(function initCore() {
	// Instantiate section in sections namespace
	window.bluedgeusa.sections = new window.bluedgeusa.core.Sections();
	let context = null;

	// If Cart page reload the cart page / No AJAX
	switch (window.bluedgeusa.theme.currentPage) {
		case 'cart':
			context = 'Cart';
			break;
		case 'product':
			context = 'pdp';
			break;
	}

	// Instantiate Dynamic Cart or Regular Cart Class
	if (window.bluedgeusa.theme.dynamicCartActive === true && context !== 'Cart') {
		new window.bluedgeusa.core.DynamicCart('DynamicCart');
		if (context === 'pdp')
			new window.bluedgeusa.core.Cart(context);
	} else {
		new window.bluedgeusa.core.Cart(context);
	}

	// Newsletter
	const footerForm = document.getElementById("footerNewsletterForm");
	if (!footerForm) return;

	new window.bluedgeusa.theme.KlaviyoSubscribe(footerForm, (err) => {
		if (err) {
			const toast = document.querySelector("[data-warning-toast]");
			if (toast) toast.querySelector(".toast-body").innerHTML = err;
			window.bluedgeusa.theme.warning.show(); // Open Toast
		} else {
			footerForm.querySelector("button").innerText = "Thank you!";
		}
	});
})();

//====================================== //
//================ THEME =============== //
//====================================== //
/*
 * DOM selectors + variant
 */
window.bluedgeusa.theme.vars = () => {
	window.bluedgeusa.theme.cache = {
		body: document.body,
		viewportWidth: document.documentElement.clientWidth,
		featuredProductSlider: null,
		sm: 576,
		md: 768,
		lg: 992,
		xl: 1200,
	};
};

// INIT
window.bluedgeusa.theme.init = () => {
	// Predictive Search
	window.bluedgeusa.sections.register(
		"predictiveSearch",
		window.bluedgeusa.theme.PredictiveSearch
	);

	// RTE CONTENT - Table wrapper + Video Iframe
	window.bluedgeusa.core.Utils.rteTableWrapper();
	window.bluedgeusa.core.Utils.rteVideoIframeWrapper();

	// FORM VALIDATION
	window.bluedgeusa.core.Utils.formValidation();

	// TOAST
	window.bluedgeusa.theme.initToast();

	// Instantiate Quick Shop Class
	if (window.bluedgeusa.theme.quickShopActive === true)
		window.bluedgeusa.theme.quickAddToCart =
			new window.bluedgeusa.theme.QuickShop();
};

/**
 * TOAST - Warning init
 *
 * @return Toast (attached to window.bluedgeusa.theme.warning)
 **/
window.bluedgeusa.theme.initToast = () => {
	const toastWrapper = document.querySelector(".toast-wrapper");
	const toast = document.querySelector("[data-warning-toast]");
	window.bluedgeusa.theme.warning = new bootstrap.Toast(toast);
	// On Open
	toast.addEventListener("show.bs.toast", () =>
		toastWrapper.classList.add("active")
	);

	// On Closed
	toast.addEventListener("hidden.bs.toast", () =>
		toastWrapper.classList.remove("active")
	);
};

(function initTheme() {
	window.bluedgeusa.theme.vars();
	window.bluedgeusa.theme.init();
})(); // self invoke .initTheme
