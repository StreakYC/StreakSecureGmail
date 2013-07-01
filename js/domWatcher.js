(function(StreakSecureGmail) {
	var self, DomWatcher;

	function getAnimationCSSString(selector, animationName) {
		return [
			selector, '{',
				'animation-duration: 0.001s;',
				'-o-animation-duration: 0.001s;',
				'-ms-animation-duration: 0.001s;',
				'-moz-animation-duration: 0.001s;',
				'-webkit-animation-duration: 0.001s;',
				'animation-name:', animationName, ';',
				'-o-animation-name:', animationName, ';',
				'-ms-animation-name:', animationName, ';',
				'-moz-animation-name:', animationName, ';',
				'-webkit-animation-name:', animationName, ';',
			'}'
		].join('');
	}

	self = DomWatcher = {
		initialized: false,
		watchedSelectors: {},
		animationCallbacks: {},

		initialize: function() {
			StreakSecureGmail.document.addEventListener('animationStart', DomWatcher.animationStarted, false);
			StreakSecureGmail.document.addEventListener('MSAnimationStart', DomWatcher.animationStarted, false);
			StreakSecureGmail.document.addEventListener('webkitAnimationStart', DomWatcher.animationStarted, false);
		},

		watchForNewSelector: function(selector, callback) {
			if (!self.initialized) {
				self.initialize();
				self.initialized = true;
			}

			if (!self.watchedSelectors[selector]) {
				self.generateNewSelectorWatch(selector);
			}

			self.watchedSelectors[selector].callbacks.push(callback);
		},

		generateNewSelectorWatch: function(selector) {
			var animationName = ('bb' + Date.now() + '.' + Math.random()).replace(/\./ig, '');
			var css = StreakSecureGmail.document.styleSheets[0];

			css.insertRule(
				[
					'@-webkit-keyframes ', animationName, ' {',
					'from { clip: rect(1px, auto, auto, auto); }',
					' to { clip: rect(0px, auto, auto, auto); }',
					'}'
				].join('')
			);

			css.insertRule(getAnimationCSSString(selector, animationName));

			var callbacks = [];
			self.watchedSelectors[selector] = {
				animationName: animationName,
				callbacks: callbacks
			};

			self.animationCallbacks[animationName] = callbacks;
		},

		notifyWhenSelectorChanged: function(initialSelector, changeSelector, callback) {
			var animationNameBase = ('bb' + Date.now() + '.' + Math.random()).replace(/\./ig, '');
			var animationNameInitial = animationNameBase + '_initial';
			var animationNameChange = animationNameBase + '_change';

			var css = StreakSecureGmail.document.styleSheets[0];

			css.insertRule(
				[
					'@-webkit-keyframes ', animationNameInitial, ' {',
					'from { clip: rect(auto, 1px, auto, auto); }',
					' to { clip: rect(auto, 0px, auto, auto); }',
					'}'
				].join('')
			);
			css.insertRule(getAnimationCSSString(initialSelector, animationNameInitial));

			css.insertRule(
				[
					'@-webkit-keyframes ', animationNameChange, ' {',
					'from { clip: rect(auto, 0px, auto, auto); }',
					' to { clip: rect(auto, 1px, auto, auto); }',
					'}'
				].join('')
			);
			css.insertRule(getAnimationCSSString(changeSelector, animationNameChange));


			self.animationCallbacks[animationNameInitial] = [callback];
			self.animationCallbacks[animationNameChange] = [callback];
		},

		animationStarted: function(event) {
			var callbacks = self.animationCallbacks[event.animationName];
			if (callbacks) {
				var callbackLength = callbacks.length;
				for (var ii = 0; ii < callbackLength; ii++) {
					callbacks[ii](event.target);
				}
			}
		}
	};

	StreakSecureGmail.DomWatcher = DomWatcher;
})(StreakSecureGmail);
