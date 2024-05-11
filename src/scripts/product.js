import './sections/Product.class.js';
import './sections/ProductRecommendations.class.js';

// Register Section
(() => {
	window.bluedgeusa.sections.register('product', window.bluedgeusa.theme.Product);
	window.bluedgeusa.sections.register('productRecommendations', window.bluedgeusa.theme.ProductRecommendation);
})();