import Popper from '@popperjs/core/dist/umd/popper';
import { Dropdown, Carousel, Toast, Button, Collapse, Offcanvas, Modal } from 'bootstrap';

// Popper.js
window.popper = Popper;

// Namespace bootstrap
window.bootstrap = window.bootstrap || {};
window.bootstrap = {
	Dropdown: Dropdown,
	Carousel: Carousel,
	Toast: Toast,
	Button: Button,
	Collapse: Collapse,
	Offcanvas: Offcanvas,
	Modal: Modal
};