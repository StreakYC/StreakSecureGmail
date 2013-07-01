(function(StreakSecureGmail){
	var _ = StreakSecureGmail._;

	_.mixin({
		/* does a similar function to _.groupBy, except allows for grouping by more than one value at once
		 the iterator you pass in must return an array with the same number of capturing objects you pass in

		 example:
		 var arr = [{name: 'o', age: '20'}, {name:'a', age:'30'}]
		 var grouped = _.groupByMultiple(arr, function(item){
		 	return [item.name, item.age];
		 }, names, ages);
		 names['o'] = {name: 'o', age: '20'}
		*/
		groupByMultiple: function(list, iterator){
			var objs = _.toArray(arguments).slice(2);

			_.each(list, function(item){
				_.wrap(iterator, function(func){
					var res = func(item);
					for(var i=0,l=objs.length; i<l; i++){
						if(!objs[i][res[i]])
							objs[i][res[i]] = [];
						objs[i][res[i]].push(item);
					}
				});
			});
		},

		// if x is defined as null, it is still considered defined
		isDefined: function(arg){
			return !_.isUndefined(arg);
		},

		isNotNull: function(arg){
			return !_.isNull(arg);
		},

		isReal: function(arg) {
			return !_.isNotReal(arg);
		},
		// Returns true if null/undefined
		isNotReal: function(arg) {
			return arg == null;
		},

		isNumeric: function(n){
			return !isNaN(parseFloat(n)) && isFinite(n);
		},

		/*
			isTruty hasValue
			isCallable(f, 'f.x.y');  // is recheable
		*/

		/* same as group by except the iterator here is expected to return an array of keys*/
		groupByPlus: function(obj, iterator) {
		    var result = {};
		    _.each(obj, function(value, index) {
		      var keys = iterator(value, index);
		      _.each(keys, function(key){
		    	  (result[key] || (result[key] = [])).push(value);
		      });
		    });
		    return result;
		  },

		includePlus: function(obj, target, tester){
			if(!tester || obj == null)
				return _.include(obj, target);

			var found = false;
			_.any(obj, function(value){
				if(found = tester(value, target)) return true;
			});
			return found;
		},

		intersectionPlus: function(array, other, tester){
			return _.filter(array, function(value){
				return _.any(other, function(otherValue){
					return tester(value, otherValue);
				});
			});
		},

		differencePlus: function(array, other, tester){
			return _.filter(array, function(value){
				return _.all(other, function(otherValue){
					return !tester(value, otherValue);
				});
			});
		},

		unionPlus: function(array, other, tester){
			return _.unique(array.concat(other), tester);
		},

		withoutPlus: function(array, element, tester){
			return _.differencePlus(array, [element], tester);
		},

		indexTheory: function(array, obj, comparator){
			array.push(obj);
			array.sort(comparator);
			var index = array.indexOf(obj);
			array.removeVal(obj);
			return index;
		},

		pluckPlus: function(array, iterator){
			return _.map(array, function(val){
				return iterator.call(array, val);
			});
		},

		isArrayDifferent: function(array, other){
			if (array.length != other.length) {
				return true;
			}
			for (var i = 0; i < array.length; i++) {
				if (array[i] != other[i]) {
					return true;
				}
			}
			return false;
		},

		sortedPluck: function(array, options){
			var grouped = _(array).chain()
				.filter(function(val){
					return _.isReal(val);
				})
				.pluckPlus(function(val){
					return options.pluck(val);
				})
				.flatten()
				.map(function(val){
					if(options.map)
						return options.map(val);
					else
						return val;
				})
				.filter(function(val){
					if(options.filter)
						return options.filter(val);
					else
						return val;
				})
				.groupBy(function(val){
					return val;
				})
				.value();

			return _(grouped).chain()
					.keys()
					.sortBy(function(key){
						return this[key].length;
					}, grouped)
					.value();
		},

		filter: function(array, iterator){
			var arr = [];
			_.each(array, function(val){
				if(iterator(val)) arr.push(val);
			});
			return arr;
		},

		onceAfter: function(number, func){
			var once = _.once(func);
			return _.after(number, once);
		},

		chainedApply: function(array, func, params, doneFunc, errFunc){
			var chain = function(item){
				func.apply(null, [item].concat(params).concat([function(){
					if(array.length > 0){
						chain(array.pop());
					}
					else{
						if(doneFunc){
							doneFunc();
						}
					}
				}]).concat([function(){
					if(errFunc){
						errFunc(array.length);
					}
				}]));
			};

			chain(array.pop());
		},

		chainedCallbacks: function(callbackArray, doneFunction){
			var call = function(){
				if(callbackArray.length === 0){
					if(doneFunction){
						doneFunction();
					}
				}
				else{
					var func = callbackArray.pop();
					func(call);
				}
			};
			call();
		},

		firstIfPresent: function(arrays) {
			return _.chain(arrays).map(_.first).compact().value();
		},

		restIfPresent: function(arrays) {
			return _.flatten(_.map(arrays, _.rest));
		},

		repeatEvery: function(func, delay){
			var interval;
			var active = true;
			var delayedRun = function(){
				interval = setTimeout(function(){
					if(active){
						func();
						delayedRun();
					}
				}, delay);
			};

			setTimeout(func, 1); //delay by 1ms to give time for function to return

			delayedRun();
			return {
				stop: function(){
					active = false;
					clearTimeout(interval);
				},

				start: function(){
					if(!active){
						active = true;
						func();
						delayedRun();
					}
				}
			};
		},

		checkAndThenRun: function(checkFunction, runFunction, delay){
			var timer = _.repeatEvery(function(){
				if(checkFunction()){
					timer.stop();
					runFunction();
				}
			}, delay);
		},

		delayed: function(delayedFunction, delay){
			var timer = null;

			return function(){
				clearTimeout(timer);
				timer = setTimeout(delayedFunction, delay);
			};
		},

		uniqMerge: function(array, uniqFunc, mergeFunc){
			var _map = {};
			var _newArray = [];

			if(_.isNotReal(mergeFunc)){
				mergeFunc = function(a, b){
					return _.extend({}, a, b);
				};
			}

			for(var ii=0; ii<array.length; ii++){
				var uniqVal = uniqFunc(array[ii]);
				if(_.isNotReal(_map[uniqVal])){
					_newArray.push(array[ii]);
					_map[uniqVal] = array[ii].length - 1;
				}
				else{
					_newArray[_map[uniqVal]] = mergeFunc(array[ii], _newArray[_map[uniqVal]]);
				}
			}

			return _newArray;
		},

		indexOfPlus: function(array, iterator){
			if(_.isNotReal(array) || !_.isArray(array) || array.length === 0){
				return -1;
			}

			for(var ii=0; ii<array.length; ii++){
				if(iterator(array[ii])){
					return ii;
				}
			}

			return -1;
		},

		normalizeString: function(s, stripWhitespace){
			var div = document.createElement('div');
			div.innerHTML = s;
			var ret = div.textContent;

			if(stripWhitespace){
				ret = ret.replace(/\s/ig, '').replace(/\xAO/ig, ''); // removes whitespace
			}

			ret.toLowerCase();

			return ret;
		}
	});
})(StreakSecureGmail);
