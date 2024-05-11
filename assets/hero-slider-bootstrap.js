(()=>{"use strict";var __webpack_modules__={"./src/scripts/hero-slider-bootstrap.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _sections_HeroSliderBootstrap_class_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./sections/HeroSliderBootstrap.class.js */ \"./src/scripts/sections/HeroSliderBootstrap.class.js\");\n/* harmony import */ var _sections_HeroSliderBootstrap_class_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_sections_HeroSliderBootstrap_class_js__WEBPACK_IMPORTED_MODULE_0__);\n\n\n// Register Section\n(function () {\n  return window.bluedgeusa.sections.register('heroSliderBootstrap', window.bluedgeusa.theme.HeroSliderBootstrap);\n})();\n\n//# sourceURL=webpack://starter-kit-2022/./src/scripts/hero-slider-bootstrap.js?")},"./src/scripts/sections/HeroSliderBootstrap.class.js":()=>{eval('/**\r\n * Bootstrap 5 Carousel - https://v5.getbootstrap.com/docs/5.0/components/carousel/\r\n * Loaded from sections/hero-slider-bootstrap.liquid\r\n */\n\n\nfunction _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }\nfunction _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }\nfunction _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }\nvar HeroSliderBootstrap = /*#__PURE__*/function () {\n  function HeroSliderBootstrap(container, type, id) {\n    var _this = this;\n    _classCallCheck(this, HeroSliderBootstrap);\n    this._container = container;\n    this._type = type;\n    this._id = id;\n\n    // SELECTORS\n    this._selectors = {\n      sliderCaption: \'[data-slider-caption]\',\n      activeSliderCaption: \'.carousel-item.active [data-slider-caption]\'\n    };\n\n    // LISTENERS\n    this._container.addEventListener(\'slid.bs.carousel\', function (e) {\n      return _this.slideCompleteHandler(e);\n    });\n\n    // INIT\n    this.initSlider();\n    this.initSliderCSS();\n  }\n\n  /**\r\n   * Initialize slider and set options\r\n   */\n  _createClass(HeroSliderBootstrap, [{\n    key: "initSlider",\n    value: function initSlider() {\n      new bootstrap.Carousel(this._container);\n    }\n\n    /**\r\n     * Init simple css animation for the copy block\r\n     */\n  }, {\n    key: "initSliderCSS",\n    value: function initSliderCSS() {\n      var active = this._container.querySelector(this._selectors.activeSliderCaption);\n      active.classList.add(\'on\');\n    }\n\n    /**\r\n     * Slide Complete Event Handler\r\n     * @param {Object} e \r\n     */\n  }, {\n    key: "slideCompleteHandler",\n    value: function slideCompleteHandler(e) {\n      // RESET ON classes (remove)\n      var carouselCaptionAll = this._container.querySelectorAll(this._selectors.sliderCaption);\n      carouselCaptionAll.forEach(function (el) {\n        return el.classList.remove(\'on\');\n      });\n\n      // ADD ON classes on Active slide\n      var carouselCaptionActive = e.relatedTarget.querySelector(this._selectors.sliderCaption);\n      carouselCaptionActive.classList.add(\'on\');\n    }\n\n    /**\r\n     * Theme "Customize" panel shopify:section:load event listener\r\n     */\n  }, {\n    key: "onLoad",\n    value: function onLoad() {\n      // INIT\n      this.initSlider();\n      this.initSliderCSS();\n      window.lazyLoadInstance.update();\n    }\n\n    /**\r\n     * Theme "Customize" panel shopify:section:unload event listener\r\n     */\n  }, {\n    key: "onUnload",\n    value: function onUnload() {\n      this._container.removeEventListener(\'slid.bs.carousel\', this.slideCompleteHandler);\n    }\n  }]);\n  return HeroSliderBootstrap;\n}(); // Export to theme namespace\nwindow.bluedgeusa.theme.HeroSliderBootstrap = HeroSliderBootstrap;\n\n//# sourceURL=webpack://starter-kit-2022/./src/scripts/sections/HeroSliderBootstrap.class.js?')}},__webpack_module_cache__={};function __webpack_require__(e){var r=__webpack_module_cache__[e];if(void 0!==r)return r.exports;var t=__webpack_module_cache__[e]={exports:{}};return __webpack_modules__[e](t,t.exports,__webpack_require__),t.exports}__webpack_require__.n=e=>{var r=e&&e.__esModule?()=>e.default:()=>e;return __webpack_require__.d(r,{a:r}),r},__webpack_require__.d=(e,r)=>{for(var t in r)__webpack_require__.o(r,t)&&!__webpack_require__.o(e,t)&&Object.defineProperty(e,t,{enumerable:!0,get:r[t]})},__webpack_require__.o=(e,r)=>Object.prototype.hasOwnProperty.call(e,r),__webpack_require__.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var __webpack_exports__=__webpack_require__("./src/scripts/hero-slider-bootstrap.js")})();