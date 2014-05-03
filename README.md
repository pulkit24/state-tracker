# [State Tracker](http://pulkit24.github.io/state-tracker/index.html)

**A flexible and powerful state control utility for Angular.**

## What's it all about?

State Tracker is a set of a directive, a service and a filter that allows you to set, track and manipulate states of any objects in your HTML. Example, track the state of an AJAX call and change the content of your view appropriately. It is intended to be as generic as possible, so you can use it for any scenario you need.

See [live demos and sample use cases here](http://pulkit24.github.io/state-tracker/index.html#examples).

### Why use it?

Suppose you have a Save button on your page. On clicking, you'd like to change the text in the button to *"Saving..."*, perhaps change the appearance and add a loading indicator. When the save is finished, you'd like to display *"Save Complete"* momentarily, then automatically reset the button back to its original appearance.

All of this requires a bunch of additional, unnecessary code and scope variables. You'll need a variable with values for "original", "saving", and "complete" states; you'll need to aply CSS classes depending on the states for changing the appearance; an `ng-if` for the loading indicator; and repeat all this for each Save button. Further, you'll need to create timeout functions for the automatic reset, and somehow trigger that on save completion. Tedious!

State Tracker has all of that groundwork already laid out for you. Using State Tracker, you use the directive to apply a tracker to your Save button, then use the filter to automatically switch the text and content for you based on the current state. Want automatic transitions? Set one up in 4 words max!

### How does it work?

By default, State Tracker includes the following four states:

* Idle
* Active
* Complete
* Failed

(You can define your own states for every tracker. See **Custom States**.)

Create a tracker on your button:

```html
<button state-tracker="myTracker">Save</button>
```

Change state on clicking:

```html
<button state-tracker="myTracker" ng-click="myTracker.activate(); save()">Save</button>
```

At the end of your save function in your controller, you can set the state to complete:

```js
$scope.save = function() {
	...
	$scope.myTracker.complete();
	...
};
```

Switch the text on the button using the provided filter:

```html
<button state-tracker="myTracker">
	{{ myTracker | stateTracker:"Save":"Saving...":"Save Complete!":"Save Failed!" }}
</button>
```

When the save is completed, automatically revert back to the original state in 2 seconds:

```html
<button state-tracker="myTracker" state-transition="{complete: {idle: 2000}}">
	Save
</button>
```

Simple!


## Usage

State Tracker is available as a `state-tracker` directive as well as a `stateTracker` service for your controller. You can perform all functions using either. A `stateTracker` filter is also available for dynamically selecting a value from a supplied list based on the current state.

### Creating a State Tracker

**Using the directive**

Define a state tracker using `state-tracker` attribute, the value being the name.

```html
<!-- Creates a new tracker. Available in controller as $scope.myTracker variable. Also registered globally and accessible via the stateTracker service (see below). -->
<button state-tracker="myTracker">Save</button>

<!-- Uses the same tracker as above. Useful for sharing tracking info across controls. -->
<button state-tracker="myTracker">Same Tracker</button>

<!-- Prevent global registration using state-isolate. -->
<button state-tracker="myTracker" state-isolate>Different Tracker</button>
```

**Using the service**

Use the `new()` function to create a new tracker.

```js
function MyController($scope, stateTracker) {

	// Create a new tracker.
	var tracker1 = stateTracker.new();

	// Create a new tracker and register it globally as "myTracker".
	var tracker2 = stateTracker.new("myTracker");

	// Retrieve the already-registered "myTracker".
	var tracker3 = stateTracker.new("myTracker"); // tracker3 === tracker2
}
```

Note: this does not create a globally-registered tracker. If you want to register your tracker globally, supply a name as a parameter: `stateTracker.new("myTracker")`. As stated above, globally registered trackers are accessible from any scope. The `new()` function with a name as parameter returns the existing tracker if previously registered. You can also explicitly retrieve this tracker from any other scope using the `get()` function: `stateTracker.get("myTracker")`. The `get()` function does not create a new tracker if not found.

### Changing states manually

**Using the directive**

Change the state when the supplied expression is truthy using these attributes:

* Switch to Idle state: `state-reset="[expression]"`
* Switch to Active state: `state-activate="[expression]"`
* Switch to Complete state: `state-complete="[expression]"`
* Switch to Failed state: `state-fail="[expression]"`

**Using the service**

You can switch between all states using these functions:

* Switch to Idle state: `myTracker.reset()`
* Switch to Active state: `myTracker.activate()`
* Switch to Complete state: `myTracker.complete()`
* Switch to Failed state: `myTracker.fail()`

### Checking the current state

**Using the directive**

You can set an expression to be executed when the tracker reaches a desired state using these attributes:

* Execute on Idle state: `state-on-idle="[expression]"`
* Execute on Active state: `state-on-active="[expression]"`
* Execute on Complete state: `state-on-complete="[expression]"`
* Execute on Failed state: `state-on-failed="[expression]"`

**Using the service**

You can check for the state using these functions. They return a boolean as expected. Use them in if-else conditionals to perform your tasks.

* Check for Idle state: `myTracker.isIdle()`
* Check for Active state: `myTracker.isActive()`
* Check for Complete state: `myTracker.isComplete()`
* Check for Failed state: `myTracker.isFailed()`


## Utility Functions

### Apply CSS classes dynamically by state

**Using the directive**

```js
state-class = "[
	'class(es) for Idle state'
	, 'class(es) for Active state'
	, 'class(es) for Complete state'
	, 'class(es) for Failed state'
]"
```

Dynamically apply a CSS class from the list provided, depending on the current state.

*Example:*

```html
<!-- Change the colour of the Bootstrap button. -->
<button state-tracker="myTracker" state-class="['btn btn-default', 'btn btn-primary', 'btn btn-success']">Save</button>
```

### Select text to display dynamically by state

**Using the filter**

Use the `stateTracker` filter over your tracker object and supply strings as arguments, one for each state.

*Example:*

```html
<!-- The Save button will switch from "Save" to "Saving..." and "Save Complete" using the filter. -->
<button state-tracker="myTracker">
	{{ myTracker | stateTracker:"Save":"Saving...":"Save Complete!":"Save Failed!" }}
</button>
```

### Select from a list of items based on the current state

**Using the service**

Use the `$map()` function to map a list of items to the state. Useful for picking out texts, CSS classes etc. from within the controller. The `state-class` attribute and the `stateTracker` filter use this function underneath.

*Example:*

```js
var myTracker = stateTracker.new("myTracker");
var currentItem = myTracker.$map([ "item for Idle state", "item for Active state", "item for Complete state", "item for Failed state" ]);
// Initially, currentItem is "item for Idle state".
```

## Event listeners

Get notified of a change in the state.

**Using the directive**

You can register listeners and set an expression to be executed when the tracker reaches a desired state using these attributes:

* Execute on Idle state: `state-on-idle="[expression]"`
* Execute on Active state: `state-on-active="[expression]"`
* Execute on Complete state: `state-on-complete="[expression]"`
* Execute on Failed state: `state-on-failed="[expression]"`

*Example:*

```html
<!-- Call loadContent() whenever activated. -->
<button state-tracker="myTracker" ng-click="myTracker.activate()" state-on-active="loadContent()">
	{{ myTracker | stateTracker:"Load content":"Loading...":"Reload" }}
</button>

<!-- Count the number of times loadContent() was called. -->
<p state-tracker="myTracker" state-on-active="count = count + 1">{{ count }}</p>

<!-- Count the times when the state changes, regardless of state. -->
<p state-tracker="myTracker" state-on-change="allCount = allCount + 1">{{ allCount }}</p>
```

**Using the service**

Register listeners using the `$on()` function.

```js
var myTracker = stateTracker.new("myTracker");

// On active, alert a notice.
myTracker.$on("active", function() { alert("we are now active!"); });

// When any state is set, alert the name of the state.
myTracker.$on("set", function(stateName) { alert("we are now in " + stateName); });

// When any state is unset, alert the name of the state.
myTracker.$on("unset", function(stateName) { alert("we just left " + stateName); });
```

### Automatic transitions

Automatic transition is the most interesting feature of State Tracker. You can set automatic changes to the content and appearance with hardly any effort. No need to create annoying timeouts functions or manage complicated conditionals. Just pass the names of the *origin state*, the *destination state* and the delay in milliseconds. Whenever the tracker hits the *origin state*, it will switch to the *destination state* automatically after the specified delay. Often used to reset buttons to their original state after completion, and with custom states (see **Custom States**).

**Using the directive**

The transitions object has the following format:

```js
{
	fromState1: { toState1, delayInMillis }
	, fromState2: { toState2, delayInMillis }
	...
}
```

*Example:*

```html
<!-- When activated, the state will automatically switch to Complete in 1s, and then to Idle in 3s. -->
<button state-tracker="myTracker" state-transition="{active: {complete: 1000}, complete: {idle: 3000}}">Save</button>
```

**Using the service**

Register transitions using `$transition()` function.

*Example:*

```js
var myTracker = stateTracker.new("myTracker");

// Switch from Active to Complete in 1s.
myTracker.$transition("active", "complete", 1000);

// Switch from Complete to Idle in 3s.
myTracker.$transition("complete", "idle", 3000);
```

## All Options

### Directive Attributes

| Attribute | Value | Default | Details |
|:---|:---:|:---:|:---|
| state-tracker | `string` | null | Create a new state tracker. If a value is supplied, the tracker is registered globally under that name. If a tracker already exists with the name, the existing tracker is used. |
| state-isolate | `boolean` | false | Avoid registering the tracker globally, or retrieving an existing tracker from the global registry. Use this if you don't need to refer the tracker outside the current scope, or if you aren't sure if the name clashes with another, different tracker |
| state-activate, state-complete, state-fail, state-reset | `expression` | falsy | Switch state when value evaluates to truthy. Not available with custom states (see **Custom States**). |
| state-on-idle, state-on-active, state-on-complete, state-on-failed | `expression` | null | Expressions to evaluate when the tracker is in the state specified. Not available with custom states (see **Custom States**). |
| state-on-change | `expression` | null | Expressions to evaluate every time the tracker changes state. |
| state-class | `array` | null | CSS class names applied to the element whenever the tracker is in the corresponding state. **Format:** 1['classes for Idle', 'classes for Active', 'classes for Complete', 'classes for Failed']` (number of elements and order follows the tracker's states) |
| state-transition | `object` | null | Automatically transition between states. **Format:** `{fromState: {toState: delay}}`, where delay is in milliseconds |
| state-choices | `array` | *(default states)* | Custom states to use instead of the default. **Format:** array of state names: `['state1', 'state2', 'state3']` or array of state, set function and check function names: `[{state: "state1", set: "toState1", check: "isState1"}, {state: "state2", set: "toState2", check: "isState2"}]` (see **Custom States**). |

### Service Options

**Functions provided by stateTracker Service**

| Function | Parameters | Returns | Details |
|:---|:---:|:---:|:---|
| new( [CustomStates], [RegistrationName] ) | `array` and `string` | Tracker object | Create a new state tracker. If **RegistrationName** is supplied, the tracker is registered globally under that name. If a tracker already exists with the name, the existing tracker is used. Supply **CustomStates** to override defaults. **Format:** array of state names: `['state1', 'state2', 'state3']` or array of state, set function and check function names: `[{state: "state1", set: "toState1", check: "isState1"}, {state: "state2", set: "toState2", check: "isState2"}]` (see **Custom States**). |
| get(RegistrationName) | `string` | Tracker object | Retrieve an existing tracker by the supplied name from the global registry. Returns `null` if none exists. |
| getWhenAvailable(RegistrationName) | `string` | Promise | Returns a promise that is resolved as soon the tracker is registered elsewhere. The tracker is passed to the resolve callback. Useful if another part of the code needs the same tracker and you wish to avoid duplicating all the configuration settings you've already coded once. |

**Functions provided by a State Tracker object**

| Function | Parameters | Returns | Details |
|:---|:---:|:---:|:---|
| $revert | N/A | null | Reset the tracker to the default state (by default, the Idle state). |
| $map(list, [startIndex], [stateName]) | `array`, `integer`, `string` | Array element| Maps the **list** to the states available and returns the item corresponding to the current state. The **list** is read from **startIndex** (default: 0) as offset. Supply a state name to be mapped instead of the current state.|
| $on(event, listener, [useOnce]) | `string`, `function`, `boolean` | Unbind function | Register a listener to state changes. The **event** can be a state name (fired on set), "set" (fired when any state is set) and "unset" (fired before any state changes). For "set" and "unset", the state name is passed to the listener function. If **useOnce** is true, the listener is only fired the first time, automatically unbound right after. |
| $transition(fromState, toState, delay) | `string`, `string`, `integer` | null | Register an automatic transition between state. Whenever the tracker hits **fromState**, it automatically converts to **toState** after the specified delay. Example use case: automatically revert save buttons after completion for reuse. |

## Custom States

By default, the states available are: Idle, Active, Complete and Failed. You can choose your own states as follows.

Each state has three associated details:

1. Name: the name of the state. Example, *active*.
2. Set function name: the name to be used for the setter function. Example, *activate()*.
3. Check function name: the name to be used for the checking function. Example, *isActive()*.

You can define your own states either as a full array of objects:

```js
[
	{ state: "invalid", set: "rejectValidity", check: "isInvalid" }
	, { state: "valid", set: "acceptValidity", check: "isValid" }
]
```

Or, you can supply a simple list of state names. State Tracker will generate set and check functions automatically.

Example, supply `[ "invalid", "valid" ]` and the generated states are:

State: *invalid*
Set function: *invalid()*
Check function: *isInvalid()*

State: *valid*
Set function: *valid()*
Check function: *isValid()*

The first state is considered as the default state.

**Using the directive**

Supply your custom states in either of the formats above using `state-choices` attribute.

*Example:*

```html
<!-- Create new states Study and Play -->
<button state-tracker="myTracker" state-choices="['study', 'play']" ng-click="myTracker.play()">Go play!</button>

<!-- Create new states Study and Play with your own function names -->
<button state-tracker="myTracker" state-choices="[{state: 'studying', set: 'study', check: 'isStudying'}, {state: 'playing', set: 'play', check: 'isPlaying'}]" ng-click="myTracker.play()">Go play!</button>
```

**Using the service**

Supply your custom states to the `new()` function.

```js
var myTracker = stateTracker.new(
	[
		{ state: "stopped", set: "stop", check: "isStopped" }
		, { state: "playing", set: "play", check: "isPlaying" }
		, { state: "paused", set: "pause", check: "isPaused" }
	]
);

// Do stuff with the tracker...
if(myTracker.isStopped())
	myTracker.play();
```

## Examples

See [live demos and sample use cases here](http://pulkit24.github.io/state-tracker/index.html#examples).

## License

Licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).