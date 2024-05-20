(()=>{"use strict";var __webpack_modules__={"./src/scripts/product.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _sections_Product_class_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./sections/Product.class.js */ \"./src/scripts/sections/Product.class.js\");\n/* harmony import */ var _sections_Product_class_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_sections_Product_class_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _sections_ProductRecommendations_class_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./sections/ProductRecommendations.class.js */ \"./src/scripts/sections/ProductRecommendations.class.js\");\n/* harmony import */ var _sections_ProductRecommendations_class_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_sections_ProductRecommendations_class_js__WEBPACK_IMPORTED_MODULE_1__);\n\n\n\n// Register Section\n(function () {\n  window.bluedgeusa.sections.register('product', window.bluedgeusa.theme.Product);\n  window.bluedgeusa.sections.register('productRecommendations', window.bluedgeusa.theme.ProductRecommendation);\n})();\n\n//# sourceURL=webpack://starter-kit-2022/./src/scripts/product.js?")},"./src/scripts/sections/Product.class.js":()=>{eval("/**\r\n * Section Class is exported to window.bluedgeusa.theme namespace\r\n * Shopify Configurator events available:\r\n * onLoad, onUnload, onSelect, onDeselect, onReorder, onBlockSelect, onBlockDeselect\r\n * \r\n * NOTE: Event host the variant object in e.detail\r\n *\r\n * NOTE: Need Polyfill for older browsers\r\n */\n\n\n/**\r\n * Product constructor\r\n *\r\n * @param {DOM} container\r\n * @param {String} type\r\n * @param {String} id\r\n */\nfunction _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \"prototype\", { writable: false }); return Constructor; }\nfunction _toPropertyKey(t) { var i = _toPrimitive(t, \"string\"); return \"symbol\" == _typeof(i) ? i : String(i); }\nfunction _toPrimitive(t, r) { if (\"object\" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || \"default\"); if (\"object\" != _typeof(i)) return i; throw new TypeError(\"@@toPrimitive must return a primitive value.\"); } return (\"string\" === r ? String : Number)(t); }\nvar Product = /*#__PURE__*/function () {\n  function Product(container, type, id) {\n    _classCallCheck(this, Product);\n    this._container = container;\n    this._type = type;\n    this._id = id;\n    this._imageSize = '1480';\n\n    // Selectors\n    this._selectors = {\n      addToCartBtn: '[data-add-to-cart]',\n      addToCartText: '[data-add-to-cart-text]',\n      productPrice: '[data-product-price]',\n      comparePrice: '[data-compare-price]',\n      variantSKU: '[data-variant-sku]',\n      variantID: '[data-variant-id]',\n      priceWrapper: '[data-price-wrapper]',\n      productFeaturedImage: '[data-product-featured-image]',\n      productJSON: '[data-product-json]',\n      productThumbnails: '[data-product-thumbnails] a',\n      singleOptionSelector: '[data-single-option-selector]',\n      selectorBlocks: '[data-custom-selector]',\n      quantity: '[name=\"quantity\"]',\n      properties: '[name*=\"properties\"]'\n    };\n\n    // INIT\n    this.init();\n  }\n\n  /**\r\n   * Init function\r\n   * Useful for extending Classes \r\n   */\n  _createClass(Product, [{\n    key: \"init\",\n    value: function init() {\n      var _this = this;\n      // JSON\n      this.productDATA = JSON.parse(this._container.querySelector(this._selectors.productJSON).innerHTML);\n\n      // ELEMENTS (Pre-selected)\n      // this.featuredImage\t\t\t= this._container.querySelector(this._selectors.productFeaturedImage);\n      this.thumbnails = this._container.querySelectorAll(this._selectors.productThumbnails);\n      this.selectorBlocks = this._container.querySelectorAll(this._selectors.selectorBlocks);\n      this.addToCartBtn = this._container.querySelector(this._selectors.addToCartBtn);\n      this.properties = this._container.querySelectorAll(this._selectors.properties);\n      this.quantity = this._container.querySelector(this._selectors.quantity);\n      this.variantID = this._container.querySelector(this._selectors.variantID);\n\n      // Options\n      this._options = {\n        container: this._container,\n        enableHistoryState: this._container.dataset.enableHistoryState === 'true',\n        singleOptionSelector: this._selectors.singleOptionSelector,\n        productDATA: this.productDATA\n      };\n\n      // Variants\n      this.variants = new window.bluedgeusa.core.Variants(this._options);\n\n      // EVENT HANDLERS\n      // Custom <Select> option selectors\n      // We use 'mousedown' event to be sure to trigger before the `click` listener in the Variants Class\n      this.selectorBlocks.forEach(function (selector) {\n        return selector.addEventListener('mousedown', function (e) {\n          /* Event delegation on LI */\n          if (e.target.nodeName === \"LI\") _this.setCustomOptionSelect(e, selector);\n        });\n      });\n      document.addEventListener('core:addToCart:completed', function () {\n        _this.addToCartLoadingToggle();\n        _this.resetQuantity();\n      });\n\n      // Note variant from Variants class is stored in e.detail\n      this._container.addEventListener('variantChange', function (e) {\n        _this.updateVariantSKU(e);\n        // this.updateAddToCartState(e);\n        // this.setActiveThumbnail(e.detail.variant.id || null);\n      });\n      this._container.addEventListener('variantImageChange', function (e) {\n        return _this.updateMainImage(e);\n      });\n      this._container.addEventListener('variantPriceChange', function (e) {\n        return _this.updateVariantPrice(e);\n      });\n      // this.thumbnails.forEach((el) => el.addEventListener('click', (e) => this.thumbnailClick(e)));\n      this.addToCartBtn.addEventListener('click', function (e) {\n        return _this.addToCart(e);\n      });\n\n      // Reset 'loaded' class when changing `src` value\n      // this.featuredImage.addEventListener('load', () => this.featuredImage.classList.add('loaded'));\n    }\n\n    /**\r\n     * Updates the DOM state of the add to cart button\r\n     *\r\n     * @param {boolean} enabled - Decides whether cart is enabled or disabled\r\n     * @param {string} text - Updates the text notification content of the cart\r\n     */\n  }, {\n    key: \"updateAddToCartState\",\n    value: function updateAddToCartState(e) {\n      var addToCartText = this._container.querySelector(this._selectors.addToCartText);\n      if (!e.detail.variant) {\n        this.addToCartBtn.disabled = true;\n        addToCartText.innerText = window.bluedgeusa.theme.strings.unavailable;\n      } else if (e.detail.variant.available) {\n        this.addToCartBtn.disabled = false;\n        addToCartText.innerText = window.bluedgeusa.theme.strings.addToCart;\n      } else {\n        this.addToCartBtn.disabled = true;\n        addToCartText.innerText = window.bluedgeusa.theme.strings.soldOut;\n      }\n    }\n\n    /**\r\n     * Change Variant SKU\r\n     * @param {Object} e\r\n     */\n  }, {\n    key: \"updateVariantSKU\",\n    value: function updateVariantSKU(e) {\n      var variantSKU = this._container.querySelector(this._selectors.variantSKU);\n      if (variantSKU) variantSKU.innerHTML = e.detail.variant.sku;\n    }\n\n    /**\r\n     * Change Variant Price and Compared at Price\r\n     * @param {Object} e\r\n     */\n  }, {\n    key: \"updateVariantPrice\",\n    value: function updateVariantPrice(e) {\n      var variantPrice = this._container.querySelector(this._selectors.productPrice);\n      var comparePrice = this._container.querySelector(this._selectors.comparePrice);\n      if (!variantPrice) return;\n\n      // Actual Price\n      variantPrice.innerHTML = window.bluedgeusa.core.Currency.formatMoney(e.detail.variant.price);\n\n      // Compare at Price\n      if (!comparePrice) return;\n      if (e.detail.variant.compare_at_price) comparePrice.innerHTML = window.bluedgeusa.core.Currency.formatMoney(e.detail.variant.compare_at_price);else comparePrice.innerHTML = '';\n    }\n\n    /**\r\n     * Update Variant Image on the main View\r\n     * @param {Object} e\r\n     */\n  }, {\n    key: \"updateMainImage\",\n    value: function updateMainImage(e) {\n      if (!e.detail.variant || e.detail.variant.featured_image === null) return;\n\n      // Add protocol to feature image src\n      var variantImage = window.location.protocol + e.detail.variant.featured_image.src;\n\n      // Get sized Img from using core method getSizedImageUrl\n      var sizedImgUrl = window.bluedgeusa.core.Images.getSizedImageUrl(variantImage, this._imageSize);\n\n      // Update Image + Image Data\n      this.updateMainImageData(sizedImgUrl);\n    }\n\n    /**\r\n     * Update the Main Image Url\r\n     * and lazy loading data\r\n     * @param {String} src\r\n     */\n    // updateMainImageData(src) {\n    // \tif (!src) return;\n\n    // \t// Remove loaded class to reset the state of the image animation\n    // \tthis.featuredImage.classList.remove('loaded');\n\n    // \t// Update the main image\n    // \tthis.featuredImage.setAttribute('data-srcset', '');\n    // \tthis.featuredImage.setAttribute('srcset', '');\n\n    // \t// Show image directly - no lazy loading\n    // \tthis.featuredImage.src = src;\n    // }\n\n    /**\r\n     * On thumbnail click\r\n     * @param {Object} e \r\n     */\n    // thumbnailClick(e) {\n    // \te.preventDefault();\n    // \tconst target = e.currentTarget;\n    // \tconst variantID = target.dataset.mediaVariantId || null;\n\n    // \tconst url = target.getAttribute('href');\n    // \tif (url) this.updateMainImageData(url);\n\n    // \t// Set active thumbnail\n    // \tthis.setActiveThumbnail(variantID, target);\n\n    // \t// Set new current variant\n    // \tif (variantID)\n    // \t\tthis.variants.updateCurrentVariant(variantID, e);\n    // }\n\n    /**\r\n     * Set active state to Thumbnails\r\n     * @param {Number} variantID \r\n     * @param {DOM} target\r\n     */\n  }, {\n    key: \"setActiveThumbnail\",\n    value: function setActiveThumbnail(variantID, target) {\n      // Set (current) Thumbnail\n      var thumbnailsArr = Array.from(this.thumbnails);\n      thumbnailsArr.forEach(function (el) {\n        var id = parseInt(el.dataset.mediaVariantId);\n        if (id === variantID || el === target) el.classList.add('current');else el.classList.remove('current');\n      });\n    }\n\n    /**\r\n     * Add to Cart on click\r\n     * @param {Object} e\r\n     */\n  }, {\n    key: \"addToCart\",\n    value: function addToCart(e) {\n      // Star Animation\n      this.addToCartLoadingToggle();\n      var qty = Math.abs(parseInt(this.quantity.value || 1));\n\n      // Get current Variant\n      var currentVariant = this.variantID;\n\n      // AddToCart Method from Variants\n      // will return if window.bluedgeusa.theme.dynamicCartActive == false\n      // and will not preventDefault()\n      var dynamicCart = this.variants.addToCart(qty, currentVariant.value, this.getProperties(), null);\n\n      // Stop event if Dynamic Cart is Active\n      if (dynamicCart) e.preventDefault();\n    }\n\n    /**\r\n     * Collect optional properties\r\n     * @returns {Object}\r\n     */\n  }, {\n    key: \"getProperties\",\n    value: function getProperties() {\n      var properties = {};\n      var pattern = /\\[(.*?)]/i;\n\n      // Check of the PDP has Properties[] fields\n      if (!this.properties) return properties;\n\n      // Assign properties values\n      this.properties.forEach(function (el) {\n        var matches = el.name.match(pattern);\n\n        /// Add to properties Object\n        if (matches.length === 2 && el.value) properties[matches.pop()] = el.value;\n      });\n      return properties;\n    }\n\n    /**\r\n     * Toggle loading add to cart Button\r\n     */\n  }, {\n    key: \"addToCartLoadingToggle\",\n    value: function addToCartLoadingToggle() {\n      this.addToCartBtn.classList.toggle('loading');\n    }\n\n    /**\r\n     * Custom Option Select\r\n     * handle select attribute on click\r\n     * Used for custom option selects that are not \r\n     * @param {Object} e\r\n     * @param {DOM} parent\r\n     */\n  }, {\n    key: \"setCustomOptionSelect\",\n    value: function setCustomOptionSelect(e, parent) {\n      if (!parent) return;\n      var target = e.target || null;\n      parent.querySelectorAll('li').forEach(function (block) {\n        if (block === target) {\n          block.classList.add('selected');\n          block.dataset.selected = true;\n        } else {\n          block.classList.remove('selected');\n          block.dataset.selected = false;\n        }\n      });\n    }\n\n    /**\r\n     * Reset Quantity on after Add to Cart Change\r\n     */\n  }, {\n    key: \"resetQuantity\",\n    value: function resetQuantity() {\n      this.quantity.value = 1;\n    }\n\n    /**\r\n     * Theme \"Customize\" panel shopify:section:load event listener\r\n     */\n  }, {\n    key: \"onLoad\",\n    value: function onLoad() {\n      // INIT\n      this.init();\n      window.lazyLoadInstance.update();\n    }\n\n    /**\r\n     * Theme \"Customize\" panel shopify:section:unload event listener\r\n     */\n  }, {\n    key: \"onUnload\",\n    value: function onUnload() {\n      var _this2 = this;\n      // REMOVE EVENT HANDLERS\n      this._container.removeEventListener('variantChange', function (e) {\n        _this2.updateVariantSKU(e);\n        _this2.updateAddToCartState(e);\n        // this.setActiveThumbnail(e.detail.variant.id || null);\n      });\n      // this._container.removeEventListener('variantImageChange', (e) => this.updateMainImage(e));\n      this._container.removeEventListener('variantPriceChange', function (e) {\n        return _this2.updateVariantPrice(e);\n      });\n      // this.thumbnails.forEach((el) => el.removeEventListener('click', (e) => this.thumbnailClick(e)));\n      this.addToCartBtn.removeEventListener('click', function (e) {\n        return _this2.addToCart(e);\n      });\n      // this.featuredImage.removeEventListener('load', () => this.featuredImage.classList.add('loaded'));\n    }\n  }]);\n  return Product;\n}(); // Export to theme namespace\nwindow.bluedgeusa.theme.Product = Product;\n\n//# sourceURL=webpack://starter-kit-2022/./src/scripts/sections/Product.class.js?")},"./src/scripts/sections/ProductRecommendations.class.js":()=>{eval('/**\r\n * Product recommendation Section Script\r\n * ------------------------------------------------------------------------------\r\n * A file that contains scripts highly couple code to this Section.\r\n * @namespace productRecommendation\r\n */\n\n\nfunction _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }\nfunction _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }\nfunction _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }\nvar ProductRecommendation = /*#__PURE__*/function () {\n  function ProductRecommendation(container, type, id) {\n    _classCallCheck(this, ProductRecommendation);\n    this._container = container;\n    this._id = id;\n    this._type = type;\n\n    // SELECTOR\n    this._selectors = {\n      productGrid: \'[data-product-grid]\'\n    };\n\n    // DOM\n    this.grid = this._container.querySelector(this._selectors.productGrid);\n\n    // PARAMS\n    this.recommendationsUlr = "/recommendations/products?&section_id=".concat(this._container.id, "&limit=").concat(this._container.dataset.limit, "&product_id=").concat(this._container.dataset.productId);\n\n    // Init\n    this.getRecommendations();\n  }\n\n  /**\r\n   * Gets product recommendations via AJAX\r\n   */\n  _createClass(ProductRecommendation, [{\n    key: "getRecommendations",\n    value: function getRecommendations() {\n      var _this = this;\n      window.bluedgeusa.core.Connect.fetch({\n        url: this.recommendationsUlr,\n        contentType: \'text/html\'\n      }, null, function (html) {\n        var grid = new DOMParser().parseFromString(html, \'text/html\').querySelector(_this._selectors.productGrid).innerHTML;\n\n        // Check if Results\n        if (grid) {\n          _this.grid.innerHTML = grid;\n          window.lazyLoadInstance.update(); // Reset lazyload\n          // Dispatch Event\n          document.dispatchEvent(new CustomEvent(\'productsInjected\'));\n        } else {\n          _this._container.classList.add(\'d-none\');\n        }\n      }, function (err) {\n        console.log(err);\n        _this._container.classList.add(\'d-none\');\n      });\n    }\n\n    /**\r\n    * Event callback for Theme Editor `section:load` event\r\n    */\n  }, {\n    key: "onLoad",\n    value: function onLoad() {\n      // Init\n      this.getRecommendations();\n    }\n  }]);\n  return ProductRecommendation;\n}(); // Export to theme namespace\nwindow.bluedgeusa.theme.ProductRecommendation = ProductRecommendation;\n\n//# sourceURL=webpack://starter-kit-2022/./src/scripts/sections/ProductRecommendations.class.js?')}},__webpack_module_cache__={};function __webpack_require__(e){var t=__webpack_module_cache__[e];if(void 0!==t)return t.exports;var n=__webpack_module_cache__[e]={exports:{}};return __webpack_modules__[e](n,n.exports,__webpack_require__),n.exports}__webpack_require__.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return __webpack_require__.d(t,{a:t}),t},__webpack_require__.d=(e,t)=>{for(var n in t)__webpack_require__.o(t,n)&&!__webpack_require__.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},__webpack_require__.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),__webpack_require__.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var __webpack_exports__=__webpack_require__("./src/scripts/product.js")})();