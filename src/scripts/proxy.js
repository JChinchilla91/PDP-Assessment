import './sections/CustomAppProxy.class.js';

// INIT
// Test CustomAppProxy Class
(() => {
	// Simulate Form Data
	const data 			= { username: 'DevCoder', email: 'hello@bluedgeusa.com' };

	// HTML elements
	const jsonTest 		= document.getElementById('jsonTest');
	const liquidTest 	= document.getElementById('liquidTest');

	// Call API thru the shopify Proxy
	const proxyJSON = window.bluedgeusa.theme.CustomAppProxy.customAppEndpoint('test', 'POST', data);
	proxyJSON
		.then(r => jsonTest.innerHTML = `JSON Test - Shop ID: ${r.id}`)
		.catch(err => console.error(err));

	// Call API thru the shopify Proxy
	const proxyLIQUID = window.bluedgeusa.theme.CustomAppProxy.customAppEndpoint('liquid', 'GET', null, { 'Content-Type': 'text/html', 'Accept': 'text/html' });
	proxyLIQUID
		.then(r => liquidTest.innerHTML = `LIQUID Test - Shop ID: ${r}`)
		.catch(err => console.error(err)); 
})();