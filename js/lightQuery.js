(function(StreakSecureGmail) {
	var _ = StreakSecureGmail._;

	var lightQuery = function(selector, context) {
		var elements = selector;
		context = context || document;

		if (_.isString(selector)) {
			if (selector.match(/^\s*\</)) {
				var div = document.createElement('div');
				div.innerHTML = selector;
				elements = div.children;
			}
			else {
				elements = context.querySelectorAll(selector);
			}
		} else if (_.isArray(selector)) {
			elements = selector;
		} else if (selector instanceof Node) {
			elements = [selector];
		}

		return new lightQuery.impl(elements);
	};

	lightQuery.impl = function(elements) {
		this.length = 0;
		Array.prototype.push.apply(this, elements);
	};

	var _displaySetting = {};

	StreakSecureGmail._.extend(lightQuery.impl.prototype, {
		find: function(selector) {
			var ret = [];

			for (var ii = 0; ii < this.length; ii++) {
				var nodes = this[ii].querySelectorAll(selector);

				for (var jj = 0; jj < nodes.length; jj++) {
					ret.push(nodes[jj]);
				}
			}

			ret = _.uniq(ret);

			return lightQuery(ret);
		},

		hide: function() {
			return _apply(this, function(element) {
				_displaySetting[element] = (element.style.display !== 'none' ? element.style.display : '');
				element.style.display = 'none';
			});
		},

		show: function(display) {
			return _apply(this, function(element) {
				if(display){
					element.style.display = display;
				}
				else if (_displaySetting[element]) {
					element.style.display = _displaySetting[element];
				}
				else{
					_displaySetting[element] = 'block';
				}
			});
		},

		hasClass: function(className) {
			return _question(this, function(element) {
				var classes = element.getAttribute('class');
				return classes.indexOf(className) > -1;
			});
		},

		addClass: function(className) {
			return _apply(this, function(element) {
				var classes = element.getAttribute('class') || "";
				var classesToApply = className.split(' ');

				var newClasses = [];
				for (var ii = 0; ii < classesToApply.length; ii++) {
					if (classes.indexOf(classesToApply[ii]) === -1) {
						newClasses.push(classesToApply[ii]);
					}
				}

				if (newClasses.length > 0) {
					element.setAttribute('class', classes + ' ' + newClasses.join(' '));
				}
			});
		},

		append: function(element) {
			if (this.length > 0) {
				var rawElement = _getRawElement(element);
				if (_.isReal(rawElement)) {
					this[0].appendChild(rawElement);
				}
			}
		},

		prepend: function(element) {
			if (this.length > 0) {
				var rawElement = _getRawElement(element);
				if (_.isReal(rawElement)) {
					this[0].insertBefore(rawElement, this[0].firstChild);
				}
			}
		},

		filter: function(selector) {
			var retArray = [];
			for (var ii = 0; ii < this.length; ii++) {
				if (this[ii].webkitMatchesSelector(selector)) {
					retArray.push(this[ii]);
				}
			}

			return lightQuery(retArray);
		},

		notFilter: function(selector) {
			var retArray = [];
			for (var ii = 0; ii < this.length; ii++) {
				if (!this[ii].webkitMatchesSelector(selector)) {
					retArray.push(this[ii]);
				}
			}

			return lightQuery(retArray);
		},

		is: function(selector) {
			return _question(this, function(element) {
				return element.webkitMatchesSelector(selector);
			});
		},

		isVisible: function() {
			return _question(this, function(element) {
				if (element.style.display === 'none') {
					return false;
				}

				var parentNode = element.parentNode;
				var parentElement = element.parentElement;

				for (var ii = 0; ii < 1000; ii++) {
					if (parentNode && !parentElement) {
						return true; //we are part of the document
					}

					if (!parentNode && !parentElement) {
						return false;
					}

					if (parentElement.style.display === 'none') {
						return false;
					}

					parentNode = parentNode.parentNode;
					parentElement = parentElement.parentElement;
				}

				return true;
			});
		},

		isInBody: function(){
			return _question(this, function(element) {
				var parentNode = element.parentNode;
				var parentElement = element.parentElement;

				for (var ii = 0; ii < 1000; ii++) {
					if (parentNode && !parentElement) {
						return true; //we are part of the document
					}

					if (!parentNode && !parentElement) {
						return false;
					}

					if (parentElement.style.display === 'none') {
						return false;
					}

					parentNode = parentNode.parentNode;
					parentElement = parentElement.parentElement;
				}

				return true;
			});
		},

		closest: function(selector){
			var ret = [];
			if(this.length > 0){
				var parent = this[0].parentNode;

				for(var ii=0; ii<10000; ii++){ //prevent infinite loop
					if(!parent){
						break;
					}

					if(parent.webkitMatchesSelector(selector)){
						ret.push(parent);
						break;
					}

					parent = parent.parentNode;
				}
			}

			return lightQuery(ret);
		},

		first: function(){
			return lightQuery(this[0]);
		},

		click: function() {
			_apply(this, function(element) {
				var pos = {
					left: element.offsetLeft,
					top: element.offsetTop
				};

				var document = StreakSecureGmail.document;

				var evt = document.createEvent('MouseEvents');
				evt.initMouseEvent('mousedown', true, true, window,
				1, pos.left, pos.top, 0, 0, false, false, false, false, 0, null);
				element.dispatchEvent(evt);


				evt = document.createEvent('MouseEvents');
				evt.initMouseEvent('mouseup', true, true, window,
				1, pos.left, pos.top, 0, 0, false, false, false, false, 0, null);
				element.dispatchEvent(evt);

				evt = document.createEvent('MouseEvents');
				evt.initMouseEvent('click', true, true, window,
				1, pos.left, pos.top, 0, 0, false, false, false, false, 0, null);
				element.dispatchEvent(evt);
			});
		},

		onClick: function(callback){
			_apply(this, function(element){
				element.addEventListener('click', callback, true);
			});
		}
	});

	function _apply(array, callback) {
		for (var ii = 0; ii < array.length; ii++) {
			callback(array[ii]);
		}

		return array;
	}

	function _question(array, callback) {
		var results = [];
		for (var ii = 0; ii < array.length; ii++) {
			results.push(callback(array[ii]));
		}


		return _.all(results, function(el) {
			return el;
		});
	}

	function _getRawElement(element) { //figures out if this is a regular node, or lightQuery array and always return either null or a node element
		var rawElement = element;
		if (element instanceof lightQuery.impl) {
			if (element.length > 0) {
				rawElement = element[0];
			}
			else {
				rawElement = null;
			}
		}

		return rawElement;
	}

	lightQuery.fn = lightQuery.impl.prototype;

	StreakSecureGmail.$ = lightQuery;
})(StreakSecureGmail);
