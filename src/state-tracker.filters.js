angular.module("state-tracker")
.filter("stateTracker", function() {
	return function(tracker, args) {
		if(angular.isArray(args))
			return tracker ? args[tracker._state - 1] : null;
		else
			return tracker ? arguments[tracker._state] : null;
	};
})
.filter("stateTrackerMap", function() {
	return function(state, args) {
		if(angular.isArray(args))
			return state ? args[state - 1] : null;
		else
			return state ? arguments[state] : null;
	};
});