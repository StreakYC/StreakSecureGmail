/**
 * based on Gmailr v0.0.1
 * Licensed under The MIT License
 *
 * Copyright 2011, James Yu
 */

(function(StreakSecureGmail) {
	var Eventer = StreakSecureGmail.Eventer,
		_ = StreakSecureGmail._,
		$ = StreakSecureGmail.$;

	var Gmail = function() {
		Eventer.call(this);

		this.isReadyToLoad = false;
		this.dontLoad = false;

		this.elements = {};

		this.initialize();
	};

	Gmail.prototype = Object.create(Eventer.prototype);
	Gmail.prototype.constructor = Gmail;

	_.extend(Gmail.prototype, {
		initialize: function() {
			var self = this;

			//start waiting for Gmail to load
			var checkTimer = _.repeatEvery(
				function() {
					self.bootstrap();
					if (self.isReadyToLoad) {
						checkTimer.stop();

						self.bindWatchers();
						self.trigger('ready');
					}
					else if(self.dontLoad){
						checkTimer.stop();
					}
				},
				100
			);
		},

		bootstrap: function(){
			var loading = document.getElementById('loading');
            var canvas = document.getElementById('canvas_frame');

            if (loading && loading.style.display === 'none') {
                if (!canvas) {
                    canvas = document;
                } else {
                    canvas = canvas.contentDocument;
                }
            }

            if (canvas && document.getElementsByTagName('body').length > 0) {
                this.elements.canvas = $(canvas);
                this.elements.body = $(this.elements.canvas.find('body')[0]);
                var main = $('div[role=main]');
                this.elements.main = main.closest('.ar4');
                if (main && main.length > 0 && this.elements.main && this.elements.main.length > 0) {
                    this.isReadyToLoad = true;
                    StreakSecureGmail.document = canvas;
                } else if (location.search.indexOf('view=cm') > -1) {
                    this.dontLoad = true;
                }
            }
		},

		bindWatchers: function() {
			var self = this;
			this._setupComposewatcher();
			this._setupXHRWatcher();

			StreakSecureGmail.DomWatcher.watchForNewSelector('.Bu .nH.if .h7', function(emailMessage) {
				self.trigger('emailMessageLoaded', emailMessage);
            });
		},

		createButton: function(text, callback){
			var button = $(document.createElement('div'));
			button.addClass('T-I J-J5-Ji aoO T-I-atl L3 T-I-JO');
			button[0].setAttribute('tabindex', 1);
			button[0].innerHTML = text;

			button.onClick(callback);

			button[0].addEventListener('mouseover', function(){
				button.addClass('T-I-JW');
			});
			button[0].addEventListener('mouseout', function(){
				button.removeClass('T-I-JW');
			});

			return button;
		},

		_setupComposewatcher: function(){
			var self = this;

			StreakSecureGmail.DomWatcher.watchForNewSelector('.Wk [role=dialog] .Hy, .dw [role=dialog] .Hy', function(element){
				self.trigger('newComposeWindow', element.parentNode);
			});
		},

		_setupXHRWatcher: function() {
			var self = this;

			var win = top.document.getElementById('js_frame').contentDocument.defaultView;
			var xmlProto = win.XMLHttpRequest.prototype;


			xmlProto._gmail_open = xmlProto.open;
			xmlProto.open = function(method, url, async, user, password) {
				var out = xmlProto._gmail_open.apply(this, _.toArray(arguments));

				if(url){
					try{
						var queryParameters = self._extractQueryParameters(url);
						if(queryParameters.act && queryParameters.act.length > 0 && queryParameters.act[0] === 'sd'){
							//draft is trying to save
							self.trigger('draftSaving');
						}
					}
					catch(err){
						console.log(err);
					}
				}

				return out;
			};

			xmlProto._gmail_send = xmlProto.send;
			xmlProto.send = function(body) {
				var queryParameters = self._extractQueryParameters("?" + body);
				var out;

				if(
					queryParameters.draft
						&& queryParameters.body
						&& queryParameters.body[0].indexOf('hspace="streakSecureMarker"') > -1){

					queryParameters.body = [''];
					queryParameters.subject = [''];
					queryParameters.subjectbox = [''];
					out = xmlProto._gmail_send.apply(this, [self._encodeQueryParameters(queryParameters)]);
				}
				else{
					out = xmlProto._gmail_send.apply(this, _.toArray(arguments));
				}

				return out;
			};
		},

		_extractQueryParameters: function(url) {
			var ret = {};
			var parts = url.split('?');
			if (parts.length > 1) {
				parts = parts[1].split('&');
				for (var i = 0; i < parts.length; ++i)
		        {
		            var p = parts[i].split('=');
		            if (p.length !== 2) continue;
		            if(!ret[p[0]]){
						ret[p[0]] = [];
		            }
		            ret[p[0]].push(decodeURIComponent(p[1].replace(/\+/g, ' ')));
		        }
			}
	        return ret;
		},

		_encodeQueryParameters: function(data){
			var dstring = '';
			if (data) {
				for (var m in data) {
					for (var ii=0; ii<data[m].length; ii++){
						dstring += '&' + m + '=' + encodeURIComponent(data[m][ii]);
					}
				}
			}
			return dstring.substring(1);
		}
	});

	StreakSecureGmail.Gmail = new Gmail();
})(StreakSecureGmail);
