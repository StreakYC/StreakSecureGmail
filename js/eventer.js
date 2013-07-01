(function(StreakSecureGmail, window){
	var _ = StreakSecureGmail._;

	var Eventer = function(){
		this._eventCBs = {},
		this._isReady = false,
		this._unReady = false,
		this._readyFuncs = [],
		this._readyFuncMap = {},
		this._isLoaded = false,
		this._loadedFuncs = [],
		this._loadedFuncMap = {},
		this._triggerActive = true;
	};

	_.extend(Eventer.prototype, {
		isReady: function(){
			return this._isReady;
		},

		unReady: function(){
			this._isReady = false;
			this._unReady = true;
		},

		resetReady: function(){
			this._isReady = false;
			this._unReady = false;
		},

		ready: function(cb, id){
			if(this._unReady){
				return;
			}

			if(this._isReady){
				cb();
			}
			else{
				if(id){
					var oldCB = this._readyFuncMap[id];
					if(oldCB)
						this._readyFuncs[this._readyFuncs.indexOf(oldCB)] = cb;
					else
						this._readyFuncs.push(cb);
					this._readyFuncMap[id] = cb;
				}
				else{
					this._readyFuncs.push(cb);
				}
			}
		},

		_runReady: function(){
			this._isReady = true;
			this._unReady = false;
			for(var i=0; this._readyFuncs[i]; i++){
				this._readyFuncs[i]();
			}
			this._readyFuncs = [];
		},

		isLoaded: function(){
			return this._isLoaded;
		},

		onLoad: function(cb, id){
			if(this._isLoaded){
				cb();
			}
			else{
				if(id){
					var oldCB = this._loadedFuncMap[id];
					if(oldCB)
						this._loadedFuncs[this._loadedFuncs.indexOf(oldCB)] = cb;
					else
						this._loadedFuncs.push(cb);
					this._loadedFuncMap[id] = cb;
				}
				else{
					this._loadedFuncs.push(cb);
				}
			}
		},

		_runLoad: function(){
			this._isLoaded = true;
			for(var i=0; this._loadedFuncs[i]; i++){
				this._loadedFuncs[i]();
			}
			this._loadedFuncs = [];
		},

		bind: function(event, cb){
			if(!this._eventCBs[event]){
				this._eventCBs[event] = [];
			}

			this._eventCBs[event].push(cb);
		},

		unbind: function(event, cb){
			if(this._eventCBs[event] && this._eventCBs[event].length > 0){
				this._eventCBs[event].removeVal(cb);
			}
		},

		trigger: function(event){
			if(event === 'ready'){
				this._runReady();
			}

			if(event === 'load'){
				this._runLoad();
			}

			if(this._triggerActive){
				if(this._eventCBs[event]){
					var args = _.toArray(arguments).slice(1);
					var cbs = _.clone(this._eventCBs[event]);

					this._eventCBs[event].length = 0;
					for(var i=0; i<cbs.length; i++){
						var cb = cbs[i];
						var shouldAdd = true;

						if(cb){
							try{
								shouldAdd = !cb.apply(this, args); //if callback returns true then don't add (a way for callbacks to unbind)
							}
							catch(err){
							}
						}
						else{
							shouldAdd = false;
						}

						if(shouldAdd){
							this._eventCBs[event].push(cb);
						}
					}
				}
			}
		},

		toggleTriggerState: function(state){
			if(state){
				this._triggerActive = state;
			}
			else{
				this._triggerActive = !this._triggerActive;
			}
		}
	});

	Eventer.create = function(obj){
		if(!obj){
			obj = {};
		}
		var eve = new Eventer();
		_.extend(eve, obj);
		return eve;
	};

	StreakSecureGmail.Eventer = Eventer;
})(StreakSecureGmail, window);