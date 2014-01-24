angular.module("state-tracker")
.filter("stateTracker", function() {
	return function(tracker, args) {
		return tracker ? arguments[tracker._state] : null;
	};
});