window.drawingApp = window.drawingApp || {};

import { importShared } from './__federation_fn_import-CpyXGjFi.js';
import { r as requireReact, g as getDefaultExportFromCjs } from './index-DvUXrXSS.js';

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production = {};

/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production;

function requireReactJsxRuntime_production () {
	if (hasRequiredReactJsxRuntime_production) return reactJsxRuntime_production;
	hasRequiredReactJsxRuntime_production = 1;
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
	  REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
	  var key = null;
	  void 0 !== maybeKey && (key = "" + maybeKey);
	  void 0 !== config.key && (key = "" + config.key);
	  if ("key" in config) {
	    maybeKey = {};
	    for (var propName in config)
	      "key" !== propName && (maybeKey[propName] = config[propName]);
	  } else maybeKey = config;
	  config = maybeKey.ref;
	  return {
	    $$typeof: REACT_ELEMENT_TYPE,
	    type: type,
	    key: key,
	    ref: void 0 !== config ? config : null,
	    props: maybeKey
	  };
	}
	reactJsxRuntime_production.Fragment = REACT_FRAGMENT_TYPE;
	reactJsxRuntime_production.jsx = jsxProd;
	reactJsxRuntime_production.jsxs = jsxProd;
	return reactJsxRuntime_production;
}

var hasRequiredJsxRuntime;

function requireJsxRuntime () {
	if (hasRequiredJsxRuntime) return jsxRuntime.exports;
	hasRequiredJsxRuntime = 1;
	{
	  jsxRuntime.exports = requireReactJsxRuntime_production();
	}
	return jsxRuntime.exports;
}

var jsxRuntimeExports = requireJsxRuntime();

function cc(names) {
  if (typeof names === "string" || typeof names === "number") return "" + names

  let out = "";

  if (Array.isArray(names)) {
    for (let i = 0, tmp; i < names.length; i++) {
      if ((tmp = cc(names[i])) !== "") {
        out += (out && " ") + tmp;
      }
    }
  } else {
    for (let k in names) {
      if (names[k]) out += (out && " ") + k;
    }
  }

  return out
}

var withSelector = {exports: {}};

var withSelector_production = {};

var shim = {exports: {}};

var useSyncExternalStoreShim_production = {};

/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredUseSyncExternalStoreShim_production;

function requireUseSyncExternalStoreShim_production () {
	if (hasRequiredUseSyncExternalStoreShim_production) return useSyncExternalStoreShim_production;
	hasRequiredUseSyncExternalStoreShim_production = 1;
	var React = requireReact();
	function is(x, y) {
	  return (x === y && (0 !== x || 1 / x === 1 / y)) || (x !== x && y !== y);
	}
	var objectIs = "function" === typeof Object.is ? Object.is : is,
	  useState = React.useState,
	  useEffect = React.useEffect,
	  useLayoutEffect = React.useLayoutEffect,
	  useDebugValue = React.useDebugValue;
	function useSyncExternalStore$2(subscribe, getSnapshot) {
	  var value = getSnapshot(),
	    _useState = useState({ inst: { value: value, getSnapshot: getSnapshot } }),
	    inst = _useState[0].inst,
	    forceUpdate = _useState[1];
	  useLayoutEffect(
	    function () {
	      inst.value = value;
	      inst.getSnapshot = getSnapshot;
	      checkIfSnapshotChanged(inst) && forceUpdate({ inst: inst });
	    },
	    [subscribe, value, getSnapshot]
	  );
	  useEffect(
	    function () {
	      checkIfSnapshotChanged(inst) && forceUpdate({ inst: inst });
	      return subscribe(function () {
	        checkIfSnapshotChanged(inst) && forceUpdate({ inst: inst });
	      });
	    },
	    [subscribe]
	  );
	  useDebugValue(value);
	  return value;
	}
	function checkIfSnapshotChanged(inst) {
	  var latestGetSnapshot = inst.getSnapshot;
	  inst = inst.value;
	  try {
	    var nextValue = latestGetSnapshot();
	    return !objectIs(inst, nextValue);
	  } catch (error) {
	    return true;
	  }
	}
	function useSyncExternalStore$1(subscribe, getSnapshot) {
	  return getSnapshot();
	}
	var shim =
	  "undefined" === typeof window ||
	  "undefined" === typeof window.document ||
	  "undefined" === typeof window.document.createElement
	    ? useSyncExternalStore$1
	    : useSyncExternalStore$2;
	useSyncExternalStoreShim_production.useSyncExternalStore =
	  void 0 !== React.useSyncExternalStore ? React.useSyncExternalStore : shim;
	return useSyncExternalStoreShim_production;
}

var hasRequiredShim;

function requireShim () {
	if (hasRequiredShim) return shim.exports;
	hasRequiredShim = 1;
	{
	  shim.exports = requireUseSyncExternalStoreShim_production();
	}
	return shim.exports;
}

/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredWithSelector_production;

function requireWithSelector_production () {
	if (hasRequiredWithSelector_production) return withSelector_production;
	hasRequiredWithSelector_production = 1;
	var React = requireReact(),
	  shim = requireShim();
	function is(x, y) {
	  return (x === y && (0 !== x || 1 / x === 1 / y)) || (x !== x && y !== y);
	}
	var objectIs = "function" === typeof Object.is ? Object.is : is,
	  useSyncExternalStore = shim.useSyncExternalStore,
	  useRef = React.useRef,
	  useEffect = React.useEffect,
	  useMemo = React.useMemo,
	  useDebugValue = React.useDebugValue;
	withSelector_production.useSyncExternalStoreWithSelector = function (
	  subscribe,
	  getSnapshot,
	  getServerSnapshot,
	  selector,
	  isEqual
	) {
	  var instRef = useRef(null);
	  if (null === instRef.current) {
	    var inst = { hasValue: false, value: null };
	    instRef.current = inst;
	  } else inst = instRef.current;
	  instRef = useMemo(
	    function () {
	      function memoizedSelector(nextSnapshot) {
	        if (!hasMemo) {
	          hasMemo = true;
	          memoizedSnapshot = nextSnapshot;
	          nextSnapshot = selector(nextSnapshot);
	          if (void 0 !== isEqual && inst.hasValue) {
	            var currentSelection = inst.value;
	            if (isEqual(currentSelection, nextSnapshot))
	              return (memoizedSelection = currentSelection);
	          }
	          return (memoizedSelection = nextSnapshot);
	        }
	        currentSelection = memoizedSelection;
	        if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
	        var nextSelection = selector(nextSnapshot);
	        if (void 0 !== isEqual && isEqual(currentSelection, nextSelection))
	          return (memoizedSnapshot = nextSnapshot), currentSelection;
	        memoizedSnapshot = nextSnapshot;
	        return (memoizedSelection = nextSelection);
	      }
	      var hasMemo = false,
	        memoizedSnapshot,
	        memoizedSelection,
	        maybeGetServerSnapshot =
	          void 0 === getServerSnapshot ? null : getServerSnapshot;
	      return [
	        function () {
	          return memoizedSelector(getSnapshot());
	        },
	        null === maybeGetServerSnapshot
	          ? void 0
	          : function () {
	              return memoizedSelector(maybeGetServerSnapshot());
	            }
	      ];
	    },
	    [getSnapshot, getServerSnapshot, selector, isEqual]
	  );
	  var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
	  useEffect(
	    function () {
	      inst.hasValue = true;
	      inst.value = value;
	    },
	    [value]
	  );
	  useDebugValue(value);
	  return value;
	};
	return withSelector_production;
}

var hasRequiredWithSelector;

function requireWithSelector () {
	if (hasRequiredWithSelector) return withSelector.exports;
	hasRequiredWithSelector = 1;
	{
	  withSelector.exports = requireWithSelector_production();
	}
	return withSelector.exports;
}

var withSelectorExports = requireWithSelector();
const useSyncExternalStoreExports = /*@__PURE__*/getDefaultExportFromCjs(withSelectorExports);

const __vite_import_meta_env__$1 = {};
const createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const destroy = () => {
    if ((__vite_import_meta_env__$1 ? "production" : void 0) !== "production") {
      console.warn(
        "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
      );
    }
    listeners.clear();
  };
  const api = { setState, getState, getInitialState, subscribe, destroy };
  const initialState = state = createState(setState, getState, api);
  return api;
};
const createStore = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;

const ReactExports = await importShared('react');

const { useDebugValue } = ReactExports;
const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;
const identity$2 = (arg) => arg;
function useStoreWithEqualityFn(api, selector = identity$2, equalityFn) {
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getInitialState,
    selector,
    equalityFn
  );
  useDebugValue(slice);
  return slice;
}
const createWithEqualityFnImpl = (createState, defaultEqualityFn) => {
  const api = createStore(createState);
  const useBoundStoreWithEqualityFn = (selector, equalityFn = defaultEqualityFn) => useStoreWithEqualityFn(api, selector, equalityFn);
  Object.assign(useBoundStoreWithEqualityFn, api);
  return useBoundStoreWithEqualityFn;
};
const createWithEqualityFn = (createState, defaultEqualityFn) => createState ? createWithEqualityFnImpl(createState, defaultEqualityFn) : createWithEqualityFnImpl;

function shallow$1(objA, objB) {
  if (Object.is(objA, objB)) {
    return true;
  }
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }
  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) return false;
    for (const [key, value] of objA) {
      if (!Object.is(value, objB.get(key))) {
        return false;
      }
    }
    return true;
  }
  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) return false;
    for (const value of objA) {
      if (!objB.has(value)) {
        return false;
      }
    }
    return true;
  }
  const keysA = Object.keys(objA);
  if (keysA.length !== Object.keys(objB).length) {
    return false;
  }
  for (const keyA of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, keyA) || !Object.is(objA[keyA], objB[keyA])) {
      return false;
    }
  }
  return true;
}

var noop$1 = {value: () => {}};

function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}

function Dispatch(_) {
  this._ = _;
}

function parseTypenames$1(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return {type: t, name: name};
  });
}

Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._,
        T = parseTypenames$1(typename + "", _),
        t,
        i = -1,
        n = T.length;

    // If no callback was specified, return the callback of the given type and name.
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name))) return t;
      return;
    }

    // If a type was specified, set the callback for the given type and name.
    // Otherwise, if a null callback was specified, remove callbacks of the given name.
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
    }

    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};

function get$1(type, name) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}

function set$1(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop$1, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) type.push({name: name, value: callback});
  return type;
}

var xhtml = "http://www.w3.org/1999/xhtml";

const namespaces = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

function namespace(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name; // eslint-disable-line no-prototype-builtins
}

function creatorInherit(name) {
  return function() {
    var document = this.ownerDocument,
        uri = this.namespaceURI;
    return uri === xhtml && document.documentElement.namespaceURI === xhtml
        ? document.createElement(name)
        : document.createElementNS(uri, name);
  };
}

function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}

function creator(name) {
  var fullname = namespace(name);
  return (fullname.local
      ? creatorFixed
      : creatorInherit)(fullname);
}

function none() {}

function selector$h(selector) {
  return selector == null ? none : function() {
    return this.querySelector(selector);
  };
}

function selection_select(select) {
  if (typeof select !== "function") select = selector$h(select);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }

  return new Selection$1(subgroups, this._parents);
}

// Given something array like (or null), returns something that is strictly an
// array. This is used to ensure that array-like objects passed to d3.selectAll
// or selection.selectAll are converted into proper arrays when creating a
// selection; we don’t ever want to create a selection backed by a live
// HTMLCollection or NodeList. However, note that selection.selectAll will use a
// static NodeList as a group, since it safely derived from querySelectorAll.
function array(x) {
  return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
}

function empty() {
  return [];
}

function selectorAll(selector) {
  return selector == null ? empty : function() {
    return this.querySelectorAll(selector);
  };
}

function arrayAll(select) {
  return function() {
    return array(select.apply(this, arguments));
  };
}

function selection_selectAll(select) {
  if (typeof select === "function") select = arrayAll(select);
  else select = selectorAll(select);

  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }

  return new Selection$1(subgroups, parents);
}

function matcher(selector) {
  return function() {
    return this.matches(selector);
  };
}

function childMatcher(selector) {
  return function(node) {
    return node.matches(selector);
  };
}

var find = Array.prototype.find;

function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}

function childFirst() {
  return this.firstElementChild;
}

function selection_selectChild(match) {
  return this.select(match == null ? childFirst
      : childFind(typeof match === "function" ? match : childMatcher(match)));
}

var filter = Array.prototype.filter;

function children() {
  return Array.from(this.children);
}

function childrenFilter(match) {
  return function() {
    return filter.call(this.children, match);
  };
}

function selection_selectChildren(match) {
  return this.selectAll(match == null ? children
      : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}

function selection_filter(match) {
  if (typeof match !== "function") match = matcher(match);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }

  return new Selection$1(subgroups, this._parents);
}

function sparse(update) {
  return new Array(update.length);
}

function selection_enter() {
  return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
}

function EnterNode(parent, datum) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum;
}

EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
  insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
  querySelector: function(selector) { return this._parent.querySelector(selector); },
  querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
};

function constant$3(x) {
  return function() {
    return x;
  };
}

function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0,
      node,
      groupLength = group.length,
      dataLength = data.length;

  // Put any non-null nodes that fit into update.
  // Put any null nodes into enter.
  // Put any remaining data into enter.
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }

  // Put any non-null nodes that don’t fit into exit.
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}

function bindKey(parent, group, enter, update, exit, data, key) {
  var i,
      node,
      nodeByKeyValue = new Map,
      groupLength = group.length,
      dataLength = data.length,
      keyValues = new Array(groupLength),
      keyValue;

  // Compute the key for each node.
  // If multiple nodes have the same key, the duplicates are added to exit.
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }

  // Compute the key for each datum.
  // If there a node associated with this key, join and add it to update.
  // If there is not (or the key is a duplicate), add it to enter.
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }

  // Add any remaining nodes that were not bound to data to exit.
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && (nodeByKeyValue.get(keyValues[i]) === node)) {
      exit[i] = node;
    }
  }
}

function datum(node) {
  return node.__data__;
}

function selection_data(value, key) {
  if (!arguments.length) return Array.from(this, datum);

  var bind = key ? bindKey : bindIndex,
      parents = this._parents,
      groups = this._groups;

  if (typeof value !== "function") value = constant$3(value);

  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j],
        group = groups[j],
        groupLength = group.length,
        data = arraylike(value.call(parent, parent && parent.__data__, j, parents)),
        dataLength = data.length,
        enterGroup = enter[j] = new Array(dataLength),
        updateGroup = update[j] = new Array(dataLength),
        exitGroup = exit[j] = new Array(groupLength);

    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

    // Now connect the enter nodes to their following update node, such that
    // appendChild can insert the materialized enter node before this node,
    // rather than at the end of the parent node.
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength);
        previous._next = next || null;
      }
    }
  }

  update = new Selection$1(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}

// Given some data, this returns an array-like view of it: an object that
// exposes a length property and allows numeric indexing. Note that unlike
// selectAll, this isn’t worried about “live” collections because the resulting
// array will only be used briefly while data is being bound. (It is possible to
// cause the data to change while iterating by using a key function, but please
// don’t; we’d rather avoid a gratuitous copy.)
function arraylike(data) {
  return typeof data === "object" && "length" in data
    ? data // Array, TypedArray, NodeList, array-like
    : Array.from(data); // Map, Set, iterable, string, or anything else
}

function selection_exit() {
  return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
}

function selection_join(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  if (typeof onenter === "function") {
    enter = onenter(enter);
    if (enter) enter = enter.selection();
  } else {
    enter = enter.append(onenter + "");
  }
  if (onupdate != null) {
    update = onupdate(update);
    if (update) update = update.selection();
  }
  if (onexit == null) exit.remove(); else onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}

function selection_merge(context) {
  var selection = context.selection ? context.selection() : context;

  for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }

  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }

  return new Selection$1(merges, this._parents);
}

function selection_order() {

  for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }

  return this;
}

function selection_sort(compare) {
  if (!compare) compare = ascending;

  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }

  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }

  return new Selection$1(sortgroups, this._parents).order();
}

function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

function selection_call() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}

function selection_nodes() {
  return Array.from(this);
}

function selection_node() {

  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }

  return null;
}

function selection_size() {
  let size = 0;
  for (const node of this) ++size; // eslint-disable-line no-unused-vars
  return size;
}

function selection_empty() {
  return !this.node();
}

function selection_each(callback) {

  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }

  return this;
}

function attrRemove$1(name) {
  return function() {
    this.removeAttribute(name);
  };
}

function attrRemoveNS$1(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}

function attrConstant$1(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}

function attrConstantNS$1(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}

function attrFunction$1(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttribute(name);
    else this.setAttribute(name, v);
  };
}

function attrFunctionNS$1(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
    else this.setAttributeNS(fullname.space, fullname.local, v);
  };
}

function selection_attr(name, value) {
  var fullname = namespace(name);

  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local
        ? node.getAttributeNS(fullname.space, fullname.local)
        : node.getAttribute(fullname);
  }

  return this.each((value == null
      ? (fullname.local ? attrRemoveNS$1 : attrRemove$1) : (typeof value === "function"
      ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)
      : (fullname.local ? attrConstantNS$1 : attrConstant$1)))(fullname, value));
}

function defaultView(node) {
  return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
      || (node.document && node) // node is a Window
      || node.defaultView; // node is a Document
}

function styleRemove$1(name) {
  return function() {
    this.style.removeProperty(name);
  };
}

function styleConstant$1(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}

function styleFunction$1(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.style.removeProperty(name);
    else this.style.setProperty(name, v, priority);
  };
}

function selection_style(name, value, priority) {
  return arguments.length > 1
      ? this.each((value == null
            ? styleRemove$1 : typeof value === "function"
            ? styleFunction$1
            : styleConstant$1)(name, value, priority == null ? "" : priority))
      : styleValue(this.node(), name);
}

function styleValue(node, name) {
  return node.style.getPropertyValue(name)
      || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
}

function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}

function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}

function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) delete this[name];
    else this[name] = v;
  };
}

function selection_property(name, value) {
  return arguments.length > 1
      ? this.each((value == null
          ? propertyRemove : typeof value === "function"
          ? propertyFunction
          : propertyConstant)(name, value))
      : this.node()[name];
}

function classArray(string) {
  return string.trim().split(/^|\s+/);
}

function classList(node) {
  return node.classList || new ClassList(node);
}

function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}

ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};

function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.add(names[i]);
}

function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.remove(names[i]);
}

function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}

function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}

function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}

function selection_classed(name, value) {
  var names = classArray(name + "");

  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n) if (!list.contains(names[i])) return false;
    return true;
  }

  return this.each((typeof value === "function"
      ? classedFunction : value
      ? classedTrue
      : classedFalse)(names, value));
}

function textRemove() {
  this.textContent = "";
}

function textConstant$1(value) {
  return function() {
    this.textContent = value;
  };
}

function textFunction$1(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}

function selection_text(value) {
  return arguments.length
      ? this.each(value == null
          ? textRemove : (typeof value === "function"
          ? textFunction$1
          : textConstant$1)(value))
      : this.node().textContent;
}

function htmlRemove() {
  this.innerHTML = "";
}

function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}

function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}

function selection_html(value) {
  return arguments.length
      ? this.each(value == null
          ? htmlRemove : (typeof value === "function"
          ? htmlFunction
          : htmlConstant)(value))
      : this.node().innerHTML;
}

function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}

function selection_raise() {
  return this.each(raise);
}

function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}

function selection_lower() {
  return this.each(lower);
}

function selection_append(name) {
  var create = typeof name === "function" ? name : creator(name);
  return this.select(function() {
    return this.appendChild(create.apply(this, arguments));
  });
}

function constantNull() {
  return null;
}

function selection_insert(name, before) {
  var create = typeof name === "function" ? name : creator(name),
      select = before == null ? constantNull : typeof before === "function" ? before : selector$h(before);
  return this.select(function() {
    return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
  });
}

function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}

function selection_remove() {
  return this.each(remove);
}

function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}

function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}

function selection_clone(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}

function selection_datum(value) {
  return arguments.length
      ? this.property("__data__", value)
      : this.node().__data__;
}

function contextListener(listener) {
  return function(event) {
    listener.call(this, event, this.__data__);
  };
}

function parseTypenames(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    return {type: t, name: name};
  });
}

function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on) return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i) on.length = i;
    else delete this.__on;
  };
}

function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o, listener = contextListener(value);
    if (on) for (var j = 0, m = on.length; j < m; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
        this.addEventListener(o.type, o.listener = listener, o.options = options);
        o.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, options);
    o = {type: typename.type, name: typename.name, value: value, listener: listener, options: options};
    if (!on) this.__on = [o];
    else on.push(o);
  };
}

function selection_on(typename, value, options) {
  var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
      for (i = 0, o = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o.type && t.name === o.name) {
          return o.value;
        }
      }
    }
    return;
  }

  on = value ? onAdd : onRemove;
  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
  return this;
}

function dispatchEvent(node, type, params) {
  var window = defaultView(node),
      event = window.CustomEvent;

  if (typeof event === "function") {
    event = new event(type, params);
  } else {
    event = window.document.createEvent("Event");
    if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
    else event.initEvent(type, false, false);
  }

  node.dispatchEvent(event);
}

function dispatchConstant(type, params) {
  return function() {
    return dispatchEvent(this, type, params);
  };
}

function dispatchFunction(type, params) {
  return function() {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}

function selection_dispatch(type, params) {
  return this.each((typeof params === "function"
      ? dispatchFunction
      : dispatchConstant)(type, params));
}

function* selection_iterator() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) yield node;
    }
  }
}

var root = [null];

function Selection$1(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}

function selection() {
  return new Selection$1([[document.documentElement]], root);
}

function selection_selection() {
  return this;
}

Selection$1.prototype = selection.prototype = {
  constructor: Selection$1,
  select: selection_select,
  selectAll: selection_selectAll,
  selectChild: selection_selectChild,
  selectChildren: selection_selectChildren,
  filter: selection_filter,
  data: selection_data,
  enter: selection_enter,
  exit: selection_exit,
  join: selection_join,
  merge: selection_merge,
  selection: selection_selection,
  order: selection_order,
  sort: selection_sort,
  call: selection_call,
  nodes: selection_nodes,
  node: selection_node,
  size: selection_size,
  empty: selection_empty,
  each: selection_each,
  attr: selection_attr,
  style: selection_style,
  property: selection_property,
  classed: selection_classed,
  text: selection_text,
  html: selection_html,
  raise: selection_raise,
  lower: selection_lower,
  append: selection_append,
  insert: selection_insert,
  remove: selection_remove,
  clone: selection_clone,
  datum: selection_datum,
  on: selection_on,
  dispatch: selection_dispatch,
  [Symbol.iterator]: selection_iterator
};

function select(selector) {
  return typeof selector === "string"
      ? new Selection$1([[document.querySelector(selector)]], [document.documentElement])
      : new Selection$1([[selector]], root);
}

function sourceEvent(event) {
  let sourceEvent;
  while (sourceEvent = event.sourceEvent) event = sourceEvent;
  return event;
}

function pointer(event, node) {
  event = sourceEvent(event);
  if (node === undefined) node = event.currentTarget;
  if (node) {
    var svg = node.ownerSVGElement || node;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = event.clientX, point.y = event.clientY;
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }
    if (node.getBoundingClientRect) {
      var rect = node.getBoundingClientRect();
      return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
    }
  }
  return [event.pageX, event.pageY];
}

// These are typically used in conjunction with noevent to ensure that we can
// preventDefault on the event.
const nonpassive = {passive: false};
const nonpassivecapture = {capture: true, passive: false};

function nopropagation$1(event) {
  event.stopImmediatePropagation();
}

function noevent$1(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

function dragDisable(view) {
  var root = view.document.documentElement,
      selection = select(view).on("dragstart.drag", noevent$1, nonpassivecapture);
  if ("onselectstart" in root) {
    selection.on("selectstart.drag", noevent$1, nonpassivecapture);
  } else {
    root.__noselect = root.style.MozUserSelect;
    root.style.MozUserSelect = "none";
  }
}

function yesdrag(view, noclick) {
  var root = view.document.documentElement,
      selection = select(view).on("dragstart.drag", null);
  if (noclick) {
    selection.on("click.drag", noevent$1, nonpassivecapture);
    setTimeout(function() { selection.on("click.drag", null); }, 0);
  }
  if ("onselectstart" in root) {
    selection.on("selectstart.drag", null);
  } else {
    root.style.MozUserSelect = root.__noselect;
    delete root.__noselect;
  }
}

const constant$2 = x => () => x;

function DragEvent(type, {
  sourceEvent,
  subject,
  target,
  identifier,
  active,
  x, y, dx, dy,
  dispatch
}) {
  Object.defineProperties(this, {
    type: {value: type, enumerable: true, configurable: true},
    sourceEvent: {value: sourceEvent, enumerable: true, configurable: true},
    subject: {value: subject, enumerable: true, configurable: true},
    target: {value: target, enumerable: true, configurable: true},
    identifier: {value: identifier, enumerable: true, configurable: true},
    active: {value: active, enumerable: true, configurable: true},
    x: {value: x, enumerable: true, configurable: true},
    y: {value: y, enumerable: true, configurable: true},
    dx: {value: dx, enumerable: true, configurable: true},
    dy: {value: dy, enumerable: true, configurable: true},
    _: {value: dispatch}
  });
}

DragEvent.prototype.on = function() {
  var value = this._.on.apply(this._, arguments);
  return value === this._ ? this : value;
};

// Ignore right-click, since that should open the context menu.
function defaultFilter$1(event) {
  return !event.ctrlKey && !event.button;
}

function defaultContainer() {
  return this.parentNode;
}

function defaultSubject(event, d) {
  return d == null ? {x: event.x, y: event.y} : d;
}

function defaultTouchable$1() {
  return navigator.maxTouchPoints || ("ontouchstart" in this);
}

function drag() {
  var filter = defaultFilter$1,
      container = defaultContainer,
      subject = defaultSubject,
      touchable = defaultTouchable$1,
      gestures = {},
      listeners = dispatch("start", "drag", "end"),
      active = 0,
      mousedownx,
      mousedowny,
      mousemoving,
      touchending,
      clickDistance2 = 0;

  function drag(selection) {
    selection
        .on("mousedown.drag", mousedowned)
      .filter(touchable)
        .on("touchstart.drag", touchstarted)
        .on("touchmove.drag", touchmoved, nonpassive)
        .on("touchend.drag touchcancel.drag", touchended)
        .style("touch-action", "none")
        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }

  function mousedowned(event, d) {
    if (touchending || !filter.call(this, event, d)) return;
    var gesture = beforestart(this, container.call(this, event, d), event, d, "mouse");
    if (!gesture) return;
    select(event.view)
      .on("mousemove.drag", mousemoved, nonpassivecapture)
      .on("mouseup.drag", mouseupped, nonpassivecapture);
    dragDisable(event.view);
    nopropagation$1(event);
    mousemoving = false;
    mousedownx = event.clientX;
    mousedowny = event.clientY;
    gesture("start", event);
  }

  function mousemoved(event) {
    noevent$1(event);
    if (!mousemoving) {
      var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
      mousemoving = dx * dx + dy * dy > clickDistance2;
    }
    gestures.mouse("drag", event);
  }

  function mouseupped(event) {
    select(event.view).on("mousemove.drag mouseup.drag", null);
    yesdrag(event.view, mousemoving);
    noevent$1(event);
    gestures.mouse("end", event);
  }

  function touchstarted(event, d) {
    if (!filter.call(this, event, d)) return;
    var touches = event.changedTouches,
        c = container.call(this, event, d),
        n = touches.length, i, gesture;

    for (i = 0; i < n; ++i) {
      if (gesture = beforestart(this, c, event, d, touches[i].identifier, touches[i])) {
        nopropagation$1(event);
        gesture("start", event, touches[i]);
      }
    }
  }

  function touchmoved(event) {
    var touches = event.changedTouches,
        n = touches.length, i, gesture;

    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        noevent$1(event);
        gesture("drag", event, touches[i]);
      }
    }
  }

  function touchended(event) {
    var touches = event.changedTouches,
        n = touches.length, i, gesture;

    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        nopropagation$1(event);
        gesture("end", event, touches[i]);
      }
    }
  }

  function beforestart(that, container, event, d, identifier, touch) {
    var dispatch = listeners.copy(),
        p = pointer(touch || event, container), dx, dy,
        s;

    if ((s = subject.call(that, new DragEvent("beforestart", {
        sourceEvent: event,
        target: drag,
        identifier,
        active,
        x: p[0],
        y: p[1],
        dx: 0,
        dy: 0,
        dispatch
      }), d)) == null) return;

    dx = s.x - p[0] || 0;
    dy = s.y - p[1] || 0;

    return function gesture(type, event, touch) {
      var p0 = p, n;
      switch (type) {
        case "start": gestures[identifier] = gesture, n = active++; break;
        case "end": delete gestures[identifier], --active; // falls through
        case "drag": p = pointer(touch || event, container), n = active; break;
      }
      dispatch.call(
        type,
        that,
        new DragEvent(type, {
          sourceEvent: event,
          subject: s,
          target: drag,
          identifier,
          active: n,
          x: p[0] + dx,
          y: p[1] + dy,
          dx: p[0] - p0[0],
          dy: p[1] - p0[1],
          dispatch
        }),
        d
      );
    };
  }

  drag.filter = function(_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant$2(!!_), drag) : filter;
  };

  drag.container = function(_) {
    return arguments.length ? (container = typeof _ === "function" ? _ : constant$2(_), drag) : container;
  };

  drag.subject = function(_) {
    return arguments.length ? (subject = typeof _ === "function" ? _ : constant$2(_), drag) : subject;
  };

  drag.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant$2(!!_), drag) : touchable;
  };

  drag.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? drag : value;
  };

  drag.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, drag) : Math.sqrt(clickDistance2);
  };

  return drag;
}

function define(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}

function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}

function Color() {}

var darker = 0.7;
var brighter = 1 / darker;

var reI = "\\s*([+-]?\\d+)\\s*",
    reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*",
    reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
    reHex = /^#([0-9a-f]{3,8})$/,
    reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`),
    reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`),
    reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`),
    reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`),
    reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`),
    reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);

var named = {
  aliceblue: 0xf0f8ff,
  antiquewhite: 0xfaebd7,
  aqua: 0x00ffff,
  aquamarine: 0x7fffd4,
  azure: 0xf0ffff,
  beige: 0xf5f5dc,
  bisque: 0xffe4c4,
  black: 0x000000,
  blanchedalmond: 0xffebcd,
  blue: 0x0000ff,
  blueviolet: 0x8a2be2,
  brown: 0xa52a2a,
  burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0,
  chartreuse: 0x7fff00,
  chocolate: 0xd2691e,
  coral: 0xff7f50,
  cornflowerblue: 0x6495ed,
  cornsilk: 0xfff8dc,
  crimson: 0xdc143c,
  cyan: 0x00ffff,
  darkblue: 0x00008b,
  darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b,
  darkgray: 0xa9a9a9,
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  darkkhaki: 0xbdb76b,
  darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f,
  darkorange: 0xff8c00,
  darkorchid: 0x9932cc,
  darkred: 0x8b0000,
  darksalmon: 0xe9967a,
  darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b,
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  darkturquoise: 0x00ced1,
  darkviolet: 0x9400d3,
  deeppink: 0xff1493,
  deepskyblue: 0x00bfff,
  dimgray: 0x696969,
  dimgrey: 0x696969,
  dodgerblue: 0x1e90ff,
  firebrick: 0xb22222,
  floralwhite: 0xfffaf0,
  forestgreen: 0x228b22,
  fuchsia: 0xff00ff,
  gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff,
  gold: 0xffd700,
  goldenrod: 0xdaa520,
  gray: 0x808080,
  green: 0x008000,
  greenyellow: 0xadff2f,
  grey: 0x808080,
  honeydew: 0xf0fff0,
  hotpink: 0xff69b4,
  indianred: 0xcd5c5c,
  indigo: 0x4b0082,
  ivory: 0xfffff0,
  khaki: 0xf0e68c,
  lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5,
  lawngreen: 0x7cfc00,
  lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6,
  lightcoral: 0xf08080,
  lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2,
  lightgray: 0xd3d3d3,
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  lightpink: 0xffb6c1,
  lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa,
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  lightsteelblue: 0xb0c4de,
  lightyellow: 0xffffe0,
  lime: 0x00ff00,
  limegreen: 0x32cd32,
  linen: 0xfaf0e6,
  magenta: 0xff00ff,
  maroon: 0x800000,
  mediumaquamarine: 0x66cdaa,
  mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3,
  mediumpurple: 0x9370db,
  mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee,
  mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc,
  mediumvioletred: 0xc71585,
  midnightblue: 0x191970,
  mintcream: 0xf5fffa,
  mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5,
  navajowhite: 0xffdead,
  navy: 0x000080,
  oldlace: 0xfdf5e6,
  olive: 0x808000,
  olivedrab: 0x6b8e23,
  orange: 0xffa500,
  orangered: 0xff4500,
  orchid: 0xda70d6,
  palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98,
  paleturquoise: 0xafeeee,
  palevioletred: 0xdb7093,
  papayawhip: 0xffefd5,
  peachpuff: 0xffdab9,
  peru: 0xcd853f,
  pink: 0xffc0cb,
  plum: 0xdda0dd,
  powderblue: 0xb0e0e6,
  purple: 0x800080,
  rebeccapurple: 0x663399,
  red: 0xff0000,
  rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1,
  saddlebrown: 0x8b4513,
  salmon: 0xfa8072,
  sandybrown: 0xf4a460,
  seagreen: 0x2e8b57,
  seashell: 0xfff5ee,
  sienna: 0xa0522d,
  silver: 0xc0c0c0,
  skyblue: 0x87ceeb,
  slateblue: 0x6a5acd,
  slategray: 0x708090,
  slategrey: 0x708090,
  snow: 0xfffafa,
  springgreen: 0x00ff7f,
  steelblue: 0x4682b4,
  tan: 0xd2b48c,
  teal: 0x008080,
  thistle: 0xd8bfd8,
  tomato: 0xff6347,
  turquoise: 0x40e0d0,
  violet: 0xee82ee,
  wheat: 0xf5deb3,
  white: 0xffffff,
  whitesmoke: 0xf5f5f5,
  yellow: 0xffff00,
  yellowgreen: 0x9acd32
};

define(Color, color, {
  copy(channels) {
    return Object.assign(new this.constructor, this, channels);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: color_formatHex, // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHex8: color_formatHex8,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});

function color_formatHex() {
  return this.rgb().formatHex();
}

function color_formatHex8() {
  return this.rgb().formatHex8();
}

function color_formatHsl() {
  return hslConvert(this).formatHsl();
}

function color_formatRgb() {
  return this.rgb().formatRgb();
}

function color(format) {
  var m, l;
  format = (format + "").trim().toLowerCase();
  return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
      : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
      : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
      : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
      : null) // invalid hex
      : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
      : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
      : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
      : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
      : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
      : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
      : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
      : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
      : null;
}

function rgbn(n) {
  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
}

function rgba(r, g, b, a) {
  if (a <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a);
}

function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb;
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}

function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}

function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}

define(Rgb, rgb, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
  },
  displayable() {
    return (-0.5 <= this.r && this.r < 255.5)
        && (-0.5 <= this.g && this.g < 255.5)
        && (-0.5 <= this.b && this.b < 255.5)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex, // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatHex8: rgb_formatHex8,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));

function rgb_formatHex() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}

function rgb_formatHex8() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}

function rgb_formatRgb() {
  const a = clampa(this.opacity);
  return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
}

function clampa(opacity) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}

function clampi(value) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}

function hex(value) {
  value = clampi(value);
  return (value < 16 ? "0" : "") + value.toString(16);
}

function hsla(h, s, l, a) {
  if (a <= 0) h = s = l = NaN;
  else if (l <= 0 || l >= 1) h = s = NaN;
  else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a);
}

function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl;
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      h = NaN,
      s = max - min,
      l = (max + min) / 2;
  if (s) {
    if (r === max) h = (g - b) / s + (g < b) * 6;
    else if (g === max) h = (b - r) / s + 2;
    else h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}

function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}

function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

define(Hsl, hsl, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb() {
    var h = this.h % 360 + (this.h < 0) * 360,
        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
        l = this.l,
        m2 = l + (l < 0.5 ? l : 1 - l) * s,
        m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  clamp() {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
        && (0 <= this.l && this.l <= 1)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
  }
}));

function clamph(value) {
  value = (value || 0) % 360;
  return value < 0 ? value + 360 : value;
}

function clampt(value) {
  return Math.max(0, Math.min(1, value || 0));
}

/* From FvD 13.37, CSS Color Module Level 3 */
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60
      : h < 180 ? m2
      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
      : m1) * 255;
}

const constant$1 = x => () => x;

function linear(a, d) {
  return function(t) {
    return a + t * d;
  };
}

function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}

function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
  };
}

function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant$1(isNaN(a) ? b : a);
}

const interpolateRgb = (function rgbGamma(y) {
  var color = gamma(y);

  function rgb$1(start, end) {
    var r = color((start = rgb(start)).r, (end = rgb(end)).r),
        g = color(start.g, end.g),
        b = color(start.b, end.b),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  rgb$1.gamma = rgbGamma;

  return rgb$1;
})(1);

function interpolateNumber(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}

var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
    reB = new RegExp(reA.source, "g");

function zero(b) {
  return function() {
    return b;
  };
}

function one(b) {
  return function(t) {
    return b(t) + "";
  };
}

function interpolateString(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
      am, // current match in a
      bm, // current match in b
      bs, // string preceding current number in b, if any
      i = -1, // index in s
      s = [], // string constants and placeholders
      q = []; // number interpolators

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Interpolate pairs of numbers in a & b.
  while ((am = reA.exec(a))
      && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) { // a string precedes the next number in b
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
      if (s[i]) s[i] += bm; // coalesce with previous string
      else s[++i] = bm;
    } else { // interpolate non-matching numbers
      s[++i] = null;
      q.push({i: i, x: interpolateNumber(am, bm)});
    }
    bi = reB.lastIndex;
  }

  // Add remains of b.
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs; // coalesce with previous string
    else s[++i] = bs;
  }

  // Special optimization for only a single match.
  // Otherwise, interpolate each of the numbers and rejoin the string.
  return s.length < 2 ? (q[0]
      ? one(q[0].x)
      : zero(b))
      : (b = q.length, function(t) {
          for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        });
}

var degrees = 180 / Math.PI;

var identity$1 = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};

function decompose(a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX: scaleX,
    scaleY: scaleY
  };
}

var svgNode;

/* eslint-disable no-undef */
function parseCss(value) {
  const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m.isIdentity ? identity$1 : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
}

function parseSvg(value) {
  if (value == null) return identity$1;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return identity$1;
  value = value.matrix;
  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
}

function interpolateTransform(parse, pxComma, pxParen, degParen) {

  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }

  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }

  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
      q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }

  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }

  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }

  return function(a, b) {
    var s = [], // string constants and placeholders
        q = []; // number interpolators
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null; // gc
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}

var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

var epsilon2 = 1e-12;

function cosh(x) {
  return ((x = Math.exp(x)) + 1 / x) / 2;
}

function sinh(x) {
  return ((x = Math.exp(x)) - 1 / x) / 2;
}

function tanh(x) {
  return ((x = Math.exp(2 * x)) - 1) / (x + 1);
}

const interpolateZoom = (function zoomRho(rho, rho2, rho4) {

  // p0 = [ux0, uy0, w0]
  // p1 = [ux1, uy1, w1]
  function zoom(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2],
        ux1 = p1[0], uy1 = p1[1], w1 = p1[2],
        dx = ux1 - ux0,
        dy = uy1 - uy0,
        d2 = dx * dx + dy * dy,
        i,
        S;

    // Special case for u0 ≅ u1.
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho;
      i = function(t) {
        return [
          ux0 + t * dx,
          uy0 + t * dy,
          w0 * Math.exp(rho * t * S)
        ];
      };
    }

    // General case.
    else {
      var d1 = Math.sqrt(d2),
          b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
          b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
          r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
          r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function(t) {
        var s = t * S,
            coshr0 = cosh(r0),
            u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
        return [
          ux0 + u * dx,
          uy0 + u * dy,
          w0 * coshr0 / cosh(rho * s + r0)
        ];
      };
    }

    i.duration = S * 1000 * rho / Math.SQRT2;

    return i;
  }

  zoom.rho = function(_) {
    var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
    return zoomRho(_1, _2, _4);
  };

  return zoom;
})(Math.SQRT2, 2, 4);

var frame = 0, // is an animation frame pending?
    timeout$1 = 0, // is a timeout pending?
    interval = 0, // are any timers active?
    pokeDelay = 1000, // how frequently we check for clock skew
    taskHead,
    taskTail,
    clockLast = 0,
    clockNow = 0,
    clockSkew = 0,
    clock = typeof performance === "object" && performance.now ? performance : Date,
    setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}

function clearNow() {
  clockNow = 0;
}

function Timer() {
  this._call =
  this._time =
  this._next = null;
}

Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function") throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this;
      else taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};

function timer(callback, delay, time) {
  var t = new Timer;
  t.restart(callback, delay, time);
  return t;
}

function timerFlush() {
  now(); // Get the current time, if not already set.
  ++frame; // Pretend we’ve set an alarm, if we haven’t already.
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0) t._call.call(undefined, e);
    t = t._next;
  }
  --frame;
}

function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout$1 = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}

function poke() {
  var now = clock.now(), delay = now - clockLast;
  if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
}

function nap() {
  var t0, t1 = taskHead, t2, time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time) time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}

function sleep(time) {
  if (frame) return; // Soonest alarm already set, or will be.
  if (timeout$1) timeout$1 = clearTimeout(timeout$1);
  var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
  if (delay > 24) {
    if (time < Infinity) timeout$1 = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval) interval = clearInterval(interval);
  } else {
    if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}

function timeout(callback, delay, time) {
  var t = new Timer;
  delay = delay == null ? 0 : +delay;
  t.restart(elapsed => {
    t.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t;
}

var emptyOn = dispatch("start", "end", "cancel", "interrupt");
var emptyTween = [];

var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;

function schedule(node, name, id, index, group, timing) {
  var schedules = node.__transition;
  if (!schedules) node.__transition = {};
  else if (id in schedules) return;
  create(node, id, {
    name: name,
    index: index, // For context during callback.
    group: group, // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}

function init(node, id) {
  var schedule = get(node, id);
  if (schedule.state > CREATED) throw new Error("too late; already scheduled");
  return schedule;
}

function set(node, id) {
  var schedule = get(node, id);
  if (schedule.state > STARTED) throw new Error("too late; already running");
  return schedule;
}

function get(node, id) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
  return schedule;
}

function create(node, id, self) {
  var schedules = node.__transition,
      tween;

  // Initialize the self timer when the transition is created.
  // Note the actual delay is not known until the first callback!
  schedules[id] = self;
  self.timer = timer(schedule, 0, self.time);

  function schedule(elapsed) {
    self.state = SCHEDULED;
    self.timer.restart(start, self.delay, self.time);

    // If the elapsed delay is less than our first sleep, start immediately.
    if (self.delay <= elapsed) start(elapsed - self.delay);
  }

  function start(elapsed) {
    var i, j, n, o;

    // If the state is not SCHEDULED, then we previously errored on start.
    if (self.state !== SCHEDULED) return stop();

    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self.name) continue;

      // While this element already has a starting transition during this frame,
      // defer starting an interrupting transition until that transition has a
      // chance to tick (and possibly end); see d3/d3-transition#54!
      if (o.state === STARTED) return timeout(start);

      // Interrupt the active transition, if any.
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }

      // Cancel any pre-empted transitions.
      else if (+i < id) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("cancel", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }
    }

    // Defer the first tick to end of the current frame; see d3/d3#1576.
    // Note the transition may be canceled after start and before the first tick!
    // Note this must be scheduled before the start event; see d3/d3-transition#16!
    // Assuming this is successful, subsequent callbacks go straight to tick.
    timeout(function() {
      if (self.state === STARTED) {
        self.state = RUNNING;
        self.timer.restart(tick, self.delay, self.time);
        tick(elapsed);
      }
    });

    // Dispatch the start event.
    // Note this must be done before the tween are initialized.
    self.state = STARTING;
    self.on.call("start", node, node.__data__, self.index, self.group);
    if (self.state !== STARTING) return; // interrupted
    self.state = STARTED;

    // Initialize the tween, deleting null tween.
    tween = new Array(n = self.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }

  function tick(elapsed) {
    var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
        i = -1,
        n = tween.length;

    while (++i < n) {
      tween[i].call(node, t);
    }

    // Dispatch the end event.
    if (self.state === ENDING) {
      self.on.call("end", node, node.__data__, self.index, self.group);
      stop();
    }
  }

  function stop() {
    self.state = ENDED;
    self.timer.stop();
    delete schedules[id];
    for (var i in schedules) return; // eslint-disable-line no-unused-vars
    delete node.__transition;
  }
}

function interrupt(node, name) {
  var schedules = node.__transition,
      schedule,
      active,
      empty = true,
      i;

  if (!schedules) return;

  name = name == null ? null : name + "";

  for (i in schedules) {
    if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
    active = schedule.state > STARTING && schedule.state < ENDING;
    schedule.state = ENDED;
    schedule.timer.stop();
    schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
    delete schedules[i];
  }

  if (empty) delete node.__transition;
}

function selection_interrupt(name) {
  return this.each(function() {
    interrupt(this, name);
  });
}

function tweenRemove(id, name) {
  var tween0, tween1;
  return function() {
    var schedule = set(this, id),
        tween = schedule.tween;

    // If this node shared tween with the previous node,
    // just assign the updated shared tween and we’re done!
    // Otherwise, copy-on-write.
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }

    schedule.tween = tween1;
  };
}

function tweenFunction(id, name, value) {
  var tween0, tween1;
  if (typeof value !== "function") throw new Error;
  return function() {
    var schedule = set(this, id),
        tween = schedule.tween;

    // If this node shared tween with the previous node,
    // just assign the updated shared tween and we’re done!
    // Otherwise, copy-on-write.
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n) tween1.push(t);
    }

    schedule.tween = tween1;
  };
}

function transition_tween(name, value) {
  var id = this._id;

  name += "";

  if (arguments.length < 2) {
    var tween = get(this.node(), id).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }

  return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
}

function tweenValue(transition, name, value) {
  var id = transition._id;

  transition.each(function() {
    var schedule = set(this, id);
    (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
  });

  return function(node) {
    return get(node, id).value[name];
  };
}

function interpolate(a, b) {
  var c;
  return (typeof b === "number" ? interpolateNumber
      : b instanceof color ? interpolateRgb
      : (c = color(b)) ? (b = c, interpolateRgb)
      : interpolateString)(a, b);
}

function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}

function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}

function attrConstant(name, interpolate, value1) {
  var string00,
      string1 = value1 + "",
      interpolate0;
  return function() {
    var string0 = this.getAttribute(name);
    return string0 === string1 ? null
        : string0 === string00 ? interpolate0
        : interpolate0 = interpolate(string00 = string0, value1);
  };
}

function attrConstantNS(fullname, interpolate, value1) {
  var string00,
      string1 = value1 + "",
      interpolate0;
  return function() {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null
        : string0 === string00 ? interpolate0
        : interpolate0 = interpolate(string00 = string0, value1);
  };
}

function attrFunction(name, interpolate, value) {
  var string00,
      string10,
      interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttribute(name);
    string0 = this.getAttribute(name);
    string1 = value1 + "";
    return string0 === string1 ? null
        : string0 === string00 && string1 === string10 ? interpolate0
        : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}

function attrFunctionNS(fullname, interpolate, value) {
  var string00,
      string10,
      interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null
        : string0 === string00 && string1 === string10 ? interpolate0
        : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}

function transition_attr(name, value) {
  var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
  return this.attrTween(name, typeof value === "function"
      ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value))
      : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname)
      : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
}

function attrInterpolate(name, i) {
  return function(t) {
    this.setAttribute(name, i.call(this, t));
  };
}

function attrInterpolateNS(fullname, i) {
  return function(t) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
  };
}

function attrTweenNS(fullname, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t0;
  }
  tween._value = value;
  return tween;
}

function attrTween(name, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
    return t0;
  }
  tween._value = value;
  return tween;
}

function transition_attrTween(name, value) {
  var key = "attr." + name;
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error;
  var fullname = namespace(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}

function delayFunction(id, value) {
  return function() {
    init(this, id).delay = +value.apply(this, arguments);
  };
}

function delayConstant(id, value) {
  return value = +value, function() {
    init(this, id).delay = value;
  };
}

function transition_delay(value) {
  var id = this._id;

  return arguments.length
      ? this.each((typeof value === "function"
          ? delayFunction
          : delayConstant)(id, value))
      : get(this.node(), id).delay;
}

function durationFunction(id, value) {
  return function() {
    set(this, id).duration = +value.apply(this, arguments);
  };
}

function durationConstant(id, value) {
  return value = +value, function() {
    set(this, id).duration = value;
  };
}

function transition_duration(value) {
  var id = this._id;

  return arguments.length
      ? this.each((typeof value === "function"
          ? durationFunction
          : durationConstant)(id, value))
      : get(this.node(), id).duration;
}

function easeConstant(id, value) {
  if (typeof value !== "function") throw new Error;
  return function() {
    set(this, id).ease = value;
  };
}

function transition_ease(value) {
  var id = this._id;

  return arguments.length
      ? this.each(easeConstant(id, value))
      : get(this.node(), id).ease;
}

function easeVarying(id, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (typeof v !== "function") throw new Error;
    set(this, id).ease = v;
  };
}

function transition_easeVarying(value) {
  if (typeof value !== "function") throw new Error;
  return this.each(easeVarying(this._id, value));
}

function transition_filter(match) {
  if (typeof match !== "function") match = matcher(match);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }

  return new Transition(subgroups, this._parents, this._name, this._id);
}

function transition_merge(transition) {
  if (transition._id !== this._id) throw new Error;

  for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }

  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }

  return new Transition(merges, this._parents, this._name, this._id);
}

function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function(t) {
    var i = t.indexOf(".");
    if (i >= 0) t = t.slice(0, i);
    return !t || t === "start";
  });
}

function onFunction(id, name, listener) {
  var on0, on1, sit = start(name) ? init : set;
  return function() {
    var schedule = sit(this, id),
        on = schedule.on;

    // If this node shared a dispatch with the previous node,
    // just assign the updated shared dispatch and we’re done!
    // Otherwise, copy-on-write.
    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

    schedule.on = on1;
  };
}

function transition_on(name, listener) {
  var id = this._id;

  return arguments.length < 2
      ? get(this.node(), id).on.on(name)
      : this.each(onFunction(id, name, listener));
}

function removeFunction(id) {
  return function() {
    var parent = this.parentNode;
    for (var i in this.__transition) if (+i !== id) return;
    if (parent) parent.removeChild(this);
  };
}

function transition_remove() {
  return this.on("end.remove", removeFunction(this._id));
}

function transition_select(select) {
  var name = this._name,
      id = this._id;

  if (typeof select !== "function") select = selector$h(select);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule(subgroup[i], name, id, i, subgroup, get(node, id));
      }
    }
  }

  return new Transition(subgroups, this._parents, name, id);
}

function transition_selectAll(select) {
  var name = this._name,
      id = this._id;

  if (typeof select !== "function") select = selectorAll(select);

  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children = select.call(node, node.__data__, i, group), child, inherit = get(node, id), k = 0, l = children.length; k < l; ++k) {
          if (child = children[k]) {
            schedule(child, name, id, k, children, inherit);
          }
        }
        subgroups.push(children);
        parents.push(node);
      }
    }
  }

  return new Transition(subgroups, parents, name, id);
}

var Selection = selection.prototype.constructor;

function transition_selection() {
  return new Selection(this._groups, this._parents);
}

function styleNull(name, interpolate) {
  var string00,
      string10,
      interpolate0;
  return function() {
    var string0 = styleValue(this, name),
        string1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null
        : string0 === string00 && string1 === string10 ? interpolate0
        : interpolate0 = interpolate(string00 = string0, string10 = string1);
  };
}

function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}

function styleConstant(name, interpolate, value1) {
  var string00,
      string1 = value1 + "",
      interpolate0;
  return function() {
    var string0 = styleValue(this, name);
    return string0 === string1 ? null
        : string0 === string00 ? interpolate0
        : interpolate0 = interpolate(string00 = string0, value1);
  };
}

function styleFunction(name, interpolate, value) {
  var string00,
      string10,
      interpolate0;
  return function() {
    var string0 = styleValue(this, name),
        value1 = value(this),
        string1 = value1 + "";
    if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null
        : string0 === string00 && string1 === string10 ? interpolate0
        : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}

function styleMaybeRemove(id, name) {
  var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
  return function() {
    var schedule = set(this, id),
        on = schedule.on,
        listener = schedule.value[key] == null ? remove || (remove = styleRemove(name)) : undefined;

    // If this node shared a dispatch with the previous node,
    // just assign the updated shared dispatch and we’re done!
    // Otherwise, copy-on-write.
    if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);

    schedule.on = on1;
  };
}

function transition_style(name, value, priority) {
  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
  return value == null ? this
      .styleTween(name, styleNull(name, i))
      .on("end.style." + name, styleRemove(name))
    : typeof value === "function" ? this
      .styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value)))
      .each(styleMaybeRemove(this._id, name))
    : this
      .styleTween(name, styleConstant(name, i, value), priority)
      .on("end.style." + name, null);
}

function styleInterpolate(name, i, priority) {
  return function(t) {
    this.style.setProperty(name, i.call(this, t), priority);
  };
}

function styleTween(name, value, priority) {
  var t, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
    return t;
  }
  tween._value = value;
  return tween;
}

function transition_styleTween(name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error;
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}

function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}

function textFunction(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}

function transition_text(value) {
  return this.tween("text", typeof value === "function"
      ? textFunction(tweenValue(this, "text", value))
      : textConstant(value == null ? "" : value + ""));
}

function textInterpolate(i) {
  return function(t) {
    this.textContent = i.call(this, t);
  };
}

function textTween(value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
    return t0;
  }
  tween._value = value;
  return tween;
}

function transition_textTween(value) {
  var key = "text";
  if (arguments.length < 1) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error;
  return this.tween(key, textTween(value));
}

function transition_transition() {
  var name = this._name,
      id0 = this._id,
      id1 = newId();

  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit = get(node, id0);
        schedule(node, name, id1, i, group, {
          time: inherit.time + inherit.delay + inherit.duration,
          delay: 0,
          duration: inherit.duration,
          ease: inherit.ease
        });
      }
    }
  }

  return new Transition(groups, this._parents, name, id1);
}

function transition_end() {
  var on0, on1, that = this, id = that._id, size = that.size();
  return new Promise(function(resolve, reject) {
    var cancel = {value: reject},
        end = {value: function() { if (--size === 0) resolve(); }};

    that.each(function() {
      var schedule = set(this, id),
          on = schedule.on;

      // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.
      if (on !== on0) {
        on1 = (on0 = on).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }

      schedule.on = on1;
    });

    // The selection was empty, resolve end immediately
    if (size === 0) resolve();
  });
}

var id = 0;

function Transition(groups, parents, name, id) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id;
}

function newId() {
  return ++id;
}

var selection_prototype = selection.prototype;

Transition.prototype = {
  constructor: Transition,
  select: transition_select,
  selectAll: transition_selectAll,
  selectChild: selection_prototype.selectChild,
  selectChildren: selection_prototype.selectChildren,
  filter: transition_filter,
  merge: transition_merge,
  selection: transition_selection,
  transition: transition_transition,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: transition_on,
  attr: transition_attr,
  attrTween: transition_attrTween,
  style: transition_style,
  styleTween: transition_styleTween,
  text: transition_text,
  textTween: transition_textTween,
  remove: transition_remove,
  tween: transition_tween,
  delay: transition_delay,
  duration: transition_duration,
  ease: transition_ease,
  easeVarying: transition_easeVarying,
  end: transition_end,
  [Symbol.iterator]: selection_prototype[Symbol.iterator]
};

function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}

var defaultTiming = {
  time: null, // Set on use.
  delay: 0,
  duration: 250,
  ease: cubicInOut
};

function inherit(node, id) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id} not found`);
    }
  }
  return timing;
}

function selection_transition(name) {
  var id,
      timing;

  if (name instanceof Transition) {
    id = name._id, name = name._name;
  } else {
    id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }

  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule(node, name, id, i, group, timing || inherit(node, id));
      }
    }
  }

  return new Transition(groups, this._parents, name, id);
}

selection.prototype.interrupt = selection_interrupt;
selection.prototype.transition = selection_transition;

const constant = x => () => x;

function ZoomEvent(type, {
  sourceEvent,
  target,
  transform,
  dispatch
}) {
  Object.defineProperties(this, {
    type: {value: type, enumerable: true, configurable: true},
    sourceEvent: {value: sourceEvent, enumerable: true, configurable: true},
    target: {value: target, enumerable: true, configurable: true},
    transform: {value: transform, enumerable: true, configurable: true},
    _: {value: dispatch}
  });
}

function Transform(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
}

Transform.prototype = {
  constructor: Transform,
  scale: function(k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function(x, y) {
    return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
  },
  apply: function(point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  applyX: function(x) {
    return x * this.k + this.x;
  },
  applyY: function(y) {
    return y * this.k + this.y;
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function(x) {
    return (x - this.x) / this.k;
  },
  invertY: function(y) {
    return (y - this.y) / this.k;
  },
  rescaleX: function(x) {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
  },
  rescaleY: function(y) {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};

var identity = new Transform(1, 0, 0);

Transform.prototype;

function nopropagation(event) {
  event.stopImmediatePropagation();
}

function noevent(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

// Ignore right-click, since that should open the context menu.
// except for pinch-to-zoom, which is sent as a wheel+ctrlKey event
function defaultFilter(event) {
  return (!event.ctrlKey || event.type === 'wheel') && !event.button;
}

function defaultExtent() {
  var e = this;
  if (e instanceof SVGElement) {
    e = e.ownerSVGElement || e;
    if (e.hasAttribute("viewBox")) {
      e = e.viewBox.baseVal;
      return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
    }
    return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
  }
  return [[0, 0], [e.clientWidth, e.clientHeight]];
}

function defaultTransform() {
  return this.__zoom || identity;
}

function defaultWheelDelta(event) {
  return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) * (event.ctrlKey ? 10 : 1);
}

function defaultTouchable() {
  return navigator.maxTouchPoints || ("ontouchstart" in this);
}

function defaultConstrain(transform, extent, translateExtent) {
  var dx0 = transform.invertX(extent[0][0]) - translateExtent[0][0],
      dx1 = transform.invertX(extent[1][0]) - translateExtent[1][0],
      dy0 = transform.invertY(extent[0][1]) - translateExtent[0][1],
      dy1 = transform.invertY(extent[1][1]) - translateExtent[1][1];
  return transform.translate(
    dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
    dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
  );
}

function zoom() {
  var filter = defaultFilter,
      extent = defaultExtent,
      constrain = defaultConstrain,
      wheelDelta = defaultWheelDelta,
      touchable = defaultTouchable,
      scaleExtent = [0, Infinity],
      translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]],
      duration = 250,
      interpolate = interpolateZoom,
      listeners = dispatch("start", "zoom", "end"),
      touchstarting,
      touchfirst,
      touchending,
      touchDelay = 500,
      wheelDelay = 150,
      clickDistance2 = 0,
      tapDistance = 10;

  function zoom(selection) {
    selection
        .property("__zoom", defaultTransform)
        .on("wheel.zoom", wheeled, {passive: false})
        .on("mousedown.zoom", mousedowned)
        .on("dblclick.zoom", dblclicked)
      .filter(touchable)
        .on("touchstart.zoom", touchstarted)
        .on("touchmove.zoom", touchmoved)
        .on("touchend.zoom touchcancel.zoom", touchended)
        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }

  zoom.transform = function(collection, transform, point, event) {
    var selection = collection.selection ? collection.selection() : collection;
    selection.property("__zoom", defaultTransform);
    if (collection !== selection) {
      schedule(collection, transform, point, event);
    } else {
      selection.interrupt().each(function() {
        gesture(this, arguments)
          .event(event)
          .start()
          .zoom(null, typeof transform === "function" ? transform.apply(this, arguments) : transform)
          .end();
      });
    }
  };

  zoom.scaleBy = function(selection, k, p, event) {
    zoom.scaleTo(selection, function() {
      var k0 = this.__zoom.k,
          k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return k0 * k1;
    }, p, event);
  };

  zoom.scaleTo = function(selection, k, p, event) {
    zoom.transform(selection, function() {
      var e = extent.apply(this, arguments),
          t0 = this.__zoom,
          p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p,
          p1 = t0.invert(p0),
          k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
    }, p, event);
  };

  zoom.translateBy = function(selection, x, y, event) {
    zoom.transform(selection, function() {
      return constrain(this.__zoom.translate(
        typeof x === "function" ? x.apply(this, arguments) : x,
        typeof y === "function" ? y.apply(this, arguments) : y
      ), extent.apply(this, arguments), translateExtent);
    }, null, event);
  };

  zoom.translateTo = function(selection, x, y, p, event) {
    zoom.transform(selection, function() {
      var e = extent.apply(this, arguments),
          t = this.__zoom,
          p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p;
      return constrain(identity.translate(p0[0], p0[1]).scale(t.k).translate(
        typeof x === "function" ? -x.apply(this, arguments) : -x,
        typeof y === "function" ? -y.apply(this, arguments) : -y
      ), e, translateExtent);
    }, p, event);
  };

  function scale(transform, k) {
    k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
    return k === transform.k ? transform : new Transform(k, transform.x, transform.y);
  }

  function translate(transform, p0, p1) {
    var x = p0[0] - p1[0] * transform.k, y = p0[1] - p1[1] * transform.k;
    return x === transform.x && y === transform.y ? transform : new Transform(transform.k, x, y);
  }

  function centroid(extent) {
    return [(+extent[0][0] + +extent[1][0]) / 2, (+extent[0][1] + +extent[1][1]) / 2];
  }

  function schedule(transition, transform, point, event) {
    transition
        .on("start.zoom", function() { gesture(this, arguments).event(event).start(); })
        .on("interrupt.zoom end.zoom", function() { gesture(this, arguments).event(event).end(); })
        .tween("zoom", function() {
          var that = this,
              args = arguments,
              g = gesture(that, args).event(event),
              e = extent.apply(that, args),
              p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point,
              w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]),
              a = that.__zoom,
              b = typeof transform === "function" ? transform.apply(that, args) : transform,
              i = interpolate(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
          return function(t) {
            if (t === 1) t = b; // Avoid rounding error on end.
            else { var l = i(t), k = w / l[2]; t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k); }
            g.zoom(null, t);
          };
        });
  }

  function gesture(that, args, clean) {
    return (!clean && that.__zooming) || new Gesture(that, args);
  }

  function Gesture(that, args) {
    this.that = that;
    this.args = args;
    this.active = 0;
    this.sourceEvent = null;
    this.extent = extent.apply(that, args);
    this.taps = 0;
  }

  Gesture.prototype = {
    event: function(event) {
      if (event) this.sourceEvent = event;
      return this;
    },
    start: function() {
      if (++this.active === 1) {
        this.that.__zooming = this;
        this.emit("start");
      }
      return this;
    },
    zoom: function(key, transform) {
      if (this.mouse && key !== "mouse") this.mouse[1] = transform.invert(this.mouse[0]);
      if (this.touch0 && key !== "touch") this.touch0[1] = transform.invert(this.touch0[0]);
      if (this.touch1 && key !== "touch") this.touch1[1] = transform.invert(this.touch1[0]);
      this.that.__zoom = transform;
      this.emit("zoom");
      return this;
    },
    end: function() {
      if (--this.active === 0) {
        delete this.that.__zooming;
        this.emit("end");
      }
      return this;
    },
    emit: function(type) {
      var d = select(this.that).datum();
      listeners.call(
        type,
        this.that,
        new ZoomEvent(type, {
          sourceEvent: this.sourceEvent,
          target: zoom,
          transform: this.that.__zoom,
          dispatch: listeners
        }),
        d
      );
    }
  };

  function wheeled(event, ...args) {
    if (!filter.apply(this, arguments)) return;
    var g = gesture(this, args).event(event),
        t = this.__zoom,
        k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))),
        p = pointer(event);

    // If the mouse is in the same location as before, reuse it.
    // If there were recent wheel events, reset the wheel idle timeout.
    if (g.wheel) {
      if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
        g.mouse[1] = t.invert(g.mouse[0] = p);
      }
      clearTimeout(g.wheel);
    }

    // If this wheel event won’t trigger a transform change, ignore it.
    else if (t.k === k) return;

    // Otherwise, capture the mouse point and location at the start.
    else {
      g.mouse = [p, t.invert(p)];
      interrupt(this);
      g.start();
    }

    noevent(event);
    g.wheel = setTimeout(wheelidled, wheelDelay);
    g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));

    function wheelidled() {
      g.wheel = null;
      g.end();
    }
  }

  function mousedowned(event, ...args) {
    if (touchending || !filter.apply(this, arguments)) return;
    var currentTarget = event.currentTarget,
        g = gesture(this, args, true).event(event),
        v = select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true),
        p = pointer(event, currentTarget),
        x0 = event.clientX,
        y0 = event.clientY;

    dragDisable(event.view);
    nopropagation(event);
    g.mouse = [p, this.__zoom.invert(p)];
    interrupt(this);
    g.start();

    function mousemoved(event) {
      noevent(event);
      if (!g.moved) {
        var dx = event.clientX - x0, dy = event.clientY - y0;
        g.moved = dx * dx + dy * dy > clickDistance2;
      }
      g.event(event)
       .zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = pointer(event, currentTarget), g.mouse[1]), g.extent, translateExtent));
    }

    function mouseupped(event) {
      v.on("mousemove.zoom mouseup.zoom", null);
      yesdrag(event.view, g.moved);
      noevent(event);
      g.event(event).end();
    }
  }

  function dblclicked(event, ...args) {
    if (!filter.apply(this, arguments)) return;
    var t0 = this.__zoom,
        p0 = pointer(event.changedTouches ? event.changedTouches[0] : event, this),
        p1 = t0.invert(p0),
        k1 = t0.k * (event.shiftKey ? 0.5 : 2),
        t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, args), translateExtent);

    noevent(event);
    if (duration > 0) select(this).transition().duration(duration).call(schedule, t1, p0, event);
    else select(this).call(zoom.transform, t1, p0, event);
  }

  function touchstarted(event, ...args) {
    if (!filter.apply(this, arguments)) return;
    var touches = event.touches,
        n = touches.length,
        g = gesture(this, args, event.changedTouches.length === n).event(event),
        started, i, t, p;

    nopropagation(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer(t, this);
      p = [p, this.__zoom.invert(p), t.identifier];
      if (!g.touch0) g.touch0 = p, started = true, g.taps = 1 + !!touchstarting;
      else if (!g.touch1 && g.touch0[2] !== p[2]) g.touch1 = p, g.taps = 0;
    }

    if (touchstarting) touchstarting = clearTimeout(touchstarting);

    if (started) {
      if (g.taps < 2) touchfirst = p[0], touchstarting = setTimeout(function() { touchstarting = null; }, touchDelay);
      interrupt(this);
      g.start();
    }
  }

  function touchmoved(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event),
        touches = event.changedTouches,
        n = touches.length, i, t, p, l;

    noevent(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer(t, this);
      if (g.touch0 && g.touch0[2] === t.identifier) g.touch0[0] = p;
      else if (g.touch1 && g.touch1[2] === t.identifier) g.touch1[0] = p;
    }
    t = g.that.__zoom;
    if (g.touch1) {
      var p0 = g.touch0[0], l0 = g.touch0[1],
          p1 = g.touch1[0], l1 = g.touch1[1],
          dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp,
          dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
      t = scale(t, Math.sqrt(dp / dl));
      p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
    }
    else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
    else return;

    g.zoom("touch", constrain(translate(t, p, l), g.extent, translateExtent));
  }

  function touchended(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event),
        touches = event.changedTouches,
        n = touches.length, i, t;

    nopropagation(event);
    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function() { touchending = null; }, touchDelay);
    for (i = 0; i < n; ++i) {
      t = touches[i];
      if (g.touch0 && g.touch0[2] === t.identifier) delete g.touch0;
      else if (g.touch1 && g.touch1[2] === t.identifier) delete g.touch1;
    }
    if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
    if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
    else {
      g.end();
      // If this was a dbltap, reroute to the (optional) dblclick.zoom handler.
      if (g.taps === 2) {
        t = pointer(t, this);
        if (Math.hypot(touchfirst[0] - t[0], touchfirst[1] - t[1]) < tapDistance) {
          var p = select(this).on("dblclick.zoom");
          if (p) p.apply(this, arguments);
        }
      }
    }
  }

  zoom.wheelDelta = function(_) {
    return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant(+_), zoom) : wheelDelta;
  };

  zoom.filter = function(_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant(!!_), zoom) : filter;
  };

  zoom.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), zoom) : touchable;
  };

  zoom.extent = function(_) {
    return arguments.length ? (extent = typeof _ === "function" ? _ : constant([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom) : extent;
  };

  zoom.scaleExtent = function(_) {
    return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom) : [scaleExtent[0], scaleExtent[1]];
  };

  zoom.translateExtent = function(_) {
    return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
  };

  zoom.constrain = function(_) {
    return arguments.length ? (constrain = _, zoom) : constrain;
  };

  zoom.duration = function(_) {
    return arguments.length ? (duration = +_, zoom) : duration;
  };

  zoom.interpolate = function(_) {
    return arguments.length ? (interpolate = _, zoom) : interpolate;
  };

  zoom.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? zoom : value;
  };

  zoom.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom) : Math.sqrt(clickDistance2);
  };

  zoom.tapDistance = function(_) {
    return arguments.length ? (tapDistance = +_, zoom) : tapDistance;
  };

  return zoom;
}

const React$o = await importShared('react');
const {createContext,useContext,useMemo: useMemo$1,memo: memo$g,useRef: useRef$8,useState: useState$h,useEffect: useEffect$b,forwardRef: forwardRef$1,useCallback: useCallback$9} = React$o;
const {createPortal} = await importShared('react-dom');

const StoreContext = createContext(null);
const Provider$1 = StoreContext.Provider;
const errorMessages = {
  error001: () => "[React Flow]: Seems like you have not used zustand provider as an ancestor. Help: https://reactflow.dev/error#001",
  error002: () => "It looks like you've created a new nodeTypes or edgeTypes object. If this wasn't on purpose please define the nodeTypes/edgeTypes outside of the component or memoize them.",
  error003: (nodeType) => `Node type "${nodeType}" not found. Using fallback type "default".`,
  error004: () => "The React Flow parent container needs a width and a height to render the graph.",
  error005: () => "Only child nodes can use a parent extent.",
  error006: () => "Can't create edge. An edge needs a source and a target.",
  error007: (id) => `The old edge with id=${id} does not exist.`,
  error009: (type) => `Marker type "${type}" doesn't exist.`,
  error008: (sourceHandle, edge) => `Couldn't create edge for ${!sourceHandle ? "source" : "target"} handle id: "${!sourceHandle ? edge.sourceHandle : edge.targetHandle}", edge id: ${edge.id}.`,
  error010: () => "Handle: No node id found. Make sure to only use a Handle inside a custom Node.",
  error011: (edgeType) => `Edge type "${edgeType}" not found. Using fallback type "default".`,
  error012: (id) => `Node with id "${id}" does not exist, it may have been removed. This can happen when a node is deleted before the "onNodeClick" handler is called.`
};
const zustandErrorMessage = errorMessages["error001"]();
function useStore(selector2, equalityFn) {
  const store = useContext(StoreContext);
  if (store === null) {
    throw new Error(zustandErrorMessage);
  }
  return useStoreWithEqualityFn(store, selector2, equalityFn);
}
const useStoreApi = () => {
  const store = useContext(StoreContext);
  if (store === null) {
    throw new Error(zustandErrorMessage);
  }
  return useMemo$1(() => ({
    getState: store.getState,
    setState: store.setState,
    subscribe: store.subscribe,
    destroy: store.destroy
  }), [store]);
};
const selector$g = (s) => s.userSelectionActive ? "none" : "all";
function Panel({ position, children, className, style: style2, ...rest }) {
  const pointerEvents = useStore(selector$g);
  const positionClasses = `${position}`.split("-");
  return React$o.createElement("div", { className: cc(["react-flow__panel", className, ...positionClasses]), style: { ...style2, pointerEvents }, ...rest }, children);
}
function Attribution({ proOptions, position = "bottom-right" }) {
  if (proOptions?.hideAttribution) {
    return null;
  }
  return React$o.createElement(
    Panel,
    { position, className: "react-flow__attribution", "data-message": "Please only hide this attribution when you are subscribed to React Flow Pro: https://reactflow.dev/pro" },
    React$o.createElement("a", { href: "https://reactflow.dev", target: "_blank", rel: "noopener noreferrer", "aria-label": "React Flow attribution" }, "React Flow")
  );
}
const EdgeText = ({ x, y, label, labelStyle = {}, labelShowBg = true, labelBgStyle = {}, labelBgPadding = [2, 4], labelBgBorderRadius = 2, children, className, ...rest }) => {
  const edgeRef = useRef$8(null);
  const [edgeTextBbox, setEdgeTextBbox] = useState$h({ x: 0, y: 0, width: 0, height: 0 });
  const edgeTextClasses = cc(["react-flow__edge-textwrapper", className]);
  useEffect$b(() => {
    if (edgeRef.current) {
      const textBbox = edgeRef.current.getBBox();
      setEdgeTextBbox({
        x: textBbox.x,
        y: textBbox.y,
        width: textBbox.width,
        height: textBbox.height
      });
    }
  }, [label]);
  if (typeof label === "undefined" || !label) {
    return null;
  }
  return React$o.createElement(
    "g",
    { transform: `translate(${x - edgeTextBbox.width / 2} ${y - edgeTextBbox.height / 2})`, className: edgeTextClasses, visibility: edgeTextBbox.width ? "visible" : "hidden", ...rest },
    labelShowBg && React$o.createElement("rect", { width: edgeTextBbox.width + 2 * labelBgPadding[0], x: -labelBgPadding[0], y: -labelBgPadding[1], height: edgeTextBbox.height + 2 * labelBgPadding[1], className: "react-flow__edge-textbg", style: labelBgStyle, rx: labelBgBorderRadius, ry: labelBgBorderRadius }),
    React$o.createElement("text", { className: "react-flow__edge-text", y: edgeTextBbox.height / 2, dy: "0.3em", ref: edgeRef, style: labelStyle }, label),
    children
  );
};
var EdgeText$1 = memo$g(EdgeText);
const getDimensions = (node) => ({
  width: node.offsetWidth,
  height: node.offsetHeight
});
const clamp = (val, min = 0, max = 1) => Math.min(Math.max(val, min), max);
const clampPosition = (position = { x: 0, y: 0 }, extent) => ({
  x: clamp(position.x, extent[0][0], extent[1][0]),
  y: clamp(position.y, extent[0][1], extent[1][1])
});
const calcAutoPanVelocity = (value, min, max) => {
  if (value < min) {
    return clamp(Math.abs(value - min), 1, 50) / 50;
  } else if (value > max) {
    return -clamp(Math.abs(value - max), 1, 50) / 50;
  }
  return 0;
};
const calcAutoPan = (pos, bounds) => {
  const xMovement = calcAutoPanVelocity(pos.x, 35, bounds.width - 35) * 20;
  const yMovement = calcAutoPanVelocity(pos.y, 35, bounds.height - 35) * 20;
  return [xMovement, yMovement];
};
const getHostForElement = (element) => element.getRootNode?.() || window?.document;
const getBoundsOfBoxes = (box1, box2) => ({
  x: Math.min(box1.x, box2.x),
  y: Math.min(box1.y, box2.y),
  x2: Math.max(box1.x2, box2.x2),
  y2: Math.max(box1.y2, box2.y2)
});
const rectToBox = ({ x, y, width, height }) => ({
  x,
  y,
  x2: x + width,
  y2: y + height
});
const boxToRect = ({ x, y, x2, y2 }) => ({
  x,
  y,
  width: x2 - x,
  height: y2 - y
});
const nodeToRect = (node) => ({
  ...node.positionAbsolute || { x: 0, y: 0 },
  width: node.width || 0,
  height: node.height || 0
});
const getBoundsOfRects = (rect1, rect2) => boxToRect(getBoundsOfBoxes(rectToBox(rect1), rectToBox(rect2)));
const getOverlappingArea = (rectA, rectB) => {
  const xOverlap = Math.max(0, Math.min(rectA.x + rectA.width, rectB.x + rectB.width) - Math.max(rectA.x, rectB.x));
  const yOverlap = Math.max(0, Math.min(rectA.y + rectA.height, rectB.y + rectB.height) - Math.max(rectA.y, rectB.y));
  return Math.ceil(xOverlap * yOverlap);
};
const isRectObject = (obj) => isNumeric(obj.width) && isNumeric(obj.height) && isNumeric(obj.x) && isNumeric(obj.y);
const isNumeric = (n) => !isNaN(n) && isFinite(n);
const internalsSymbol = Symbol.for("internals");
const elementSelectionKeys = ["Enter", " ", "Escape"];
const devWarn = (id, message) => {
};
const isReactKeyboardEvent = (event) => "nativeEvent" in event;
function isInputDOMNode(event) {
  const kbEvent = isReactKeyboardEvent(event) ? event.nativeEvent : event;
  const target = kbEvent.composedPath?.()?.[0] || event.target;
  const isInput = ["INPUT", "SELECT", "TEXTAREA"].includes(target?.nodeName) || target?.hasAttribute("contenteditable");
  return isInput || !!target?.closest(".nokey");
}
const isMouseEvent = (event) => "clientX" in event;
const getEventPosition = (event, bounds) => {
  const isMouseTriggered = isMouseEvent(event);
  const evtX = isMouseTriggered ? event.clientX : event.touches?.[0].clientX;
  const evtY = isMouseTriggered ? event.clientY : event.touches?.[0].clientY;
  return {
    x: evtX - (bounds?.left ?? 0),
    y: evtY - (bounds?.top ?? 0)
  };
};
const isMacOs = () => typeof navigator !== "undefined" && navigator?.userAgent?.indexOf("Mac") >= 0;
const BaseEdge = ({ id, path, labelX, labelY, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius, style: style2, markerEnd, markerStart, interactionWidth = 20 }) => {
  return React$o.createElement(
    React$o.Fragment,
    null,
    React$o.createElement("path", { id, style: style2, d: path, fill: "none", className: "react-flow__edge-path", markerEnd, markerStart }),
    interactionWidth && React$o.createElement("path", { d: path, fill: "none", strokeOpacity: 0, strokeWidth: interactionWidth, className: "react-flow__edge-interaction" }),
    label && isNumeric(labelX) && isNumeric(labelY) ? React$o.createElement(EdgeText$1, { x: labelX, y: labelY, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius }) : null
  );
};
BaseEdge.displayName = "BaseEdge";
function getMouseHandler$1(id, getState, handler) {
  return handler === void 0 ? handler : (event) => {
    const edge = getState().edges.find((e) => e.id === id);
    if (edge) {
      handler(event, { ...edge });
    }
  };
}
function getEdgeCenter({ sourceX, sourceY, targetX, targetY }) {
  const xOffset = Math.abs(targetX - sourceX) / 2;
  const centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset;
  const yOffset = Math.abs(targetY - sourceY) / 2;
  const centerY = targetY < sourceY ? targetY + yOffset : targetY - yOffset;
  return [centerX, centerY, xOffset, yOffset];
}
function getBezierEdgeCenter({ sourceX, sourceY, targetX, targetY, sourceControlX, sourceControlY, targetControlX, targetControlY }) {
  const centerX = sourceX * 0.125 + sourceControlX * 0.375 + targetControlX * 0.375 + targetX * 0.125;
  const centerY = sourceY * 0.125 + sourceControlY * 0.375 + targetControlY * 0.375 + targetY * 0.125;
  const offsetX = Math.abs(centerX - sourceX);
  const offsetY = Math.abs(centerY - sourceY);
  return [centerX, centerY, offsetX, offsetY];
}
var ConnectionMode;
(function(ConnectionMode2) {
  ConnectionMode2["Strict"] = "strict";
  ConnectionMode2["Loose"] = "loose";
})(ConnectionMode || (ConnectionMode = {}));
var PanOnScrollMode;
(function(PanOnScrollMode2) {
  PanOnScrollMode2["Free"] = "free";
  PanOnScrollMode2["Vertical"] = "vertical";
  PanOnScrollMode2["Horizontal"] = "horizontal";
})(PanOnScrollMode || (PanOnScrollMode = {}));
var SelectionMode;
(function(SelectionMode2) {
  SelectionMode2["Partial"] = "partial";
  SelectionMode2["Full"] = "full";
})(SelectionMode || (SelectionMode = {}));
var ConnectionLineType;
(function(ConnectionLineType2) {
  ConnectionLineType2["Bezier"] = "default";
  ConnectionLineType2["Straight"] = "straight";
  ConnectionLineType2["Step"] = "step";
  ConnectionLineType2["SmoothStep"] = "smoothstep";
  ConnectionLineType2["SimpleBezier"] = "simplebezier";
})(ConnectionLineType || (ConnectionLineType = {}));
var MarkerType;
(function(MarkerType2) {
  MarkerType2["Arrow"] = "arrow";
  MarkerType2["ArrowClosed"] = "arrowclosed";
})(MarkerType || (MarkerType = {}));
var Position;
(function(Position2) {
  Position2["Left"] = "left";
  Position2["Top"] = "top";
  Position2["Right"] = "right";
  Position2["Bottom"] = "bottom";
})(Position || (Position = {}));
function getControl({ pos, x1, y1, x2, y2 }) {
  if (pos === Position.Left || pos === Position.Right) {
    return [0.5 * (x1 + x2), y1];
  }
  return [x1, 0.5 * (y1 + y2)];
}
function getSimpleBezierPath({ sourceX, sourceY, sourcePosition = Position.Bottom, targetX, targetY, targetPosition = Position.Top }) {
  const [sourceControlX, sourceControlY] = getControl({
    pos: sourcePosition,
    x1: sourceX,
    y1: sourceY,
    x2: targetX,
    y2: targetY
  });
  const [targetControlX, targetControlY] = getControl({
    pos: targetPosition,
    x1: targetX,
    y1: targetY,
    x2: sourceX,
    y2: sourceY
  });
  const [labelX, labelY, offsetX, offsetY] = getBezierEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourceControlX,
    sourceControlY,
    targetControlX,
    targetControlY
  });
  return [
    `M${sourceX},${sourceY} C${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${targetX},${targetY}`,
    labelX,
    labelY,
    offsetX,
    offsetY
  ];
}
const SimpleBezierEdge = memo$g(({ sourceX, sourceY, targetX, targetY, sourcePosition = Position.Bottom, targetPosition = Position.Top, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius, style: style2, markerEnd, markerStart, interactionWidth }) => {
  const [path, labelX, labelY] = getSimpleBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });
  return React$o.createElement(BaseEdge, { path, labelX, labelY, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius, style: style2, markerEnd, markerStart, interactionWidth });
});
SimpleBezierEdge.displayName = "SimpleBezierEdge";
const handleDirections = {
  [Position.Left]: { x: -1, y: 0 },
  [Position.Right]: { x: 1, y: 0 },
  [Position.Top]: { x: 0, y: -1 },
  [Position.Bottom]: { x: 0, y: 1 }
};
const getDirection = ({ source, sourcePosition = Position.Bottom, target }) => {
  if (sourcePosition === Position.Left || sourcePosition === Position.Right) {
    return source.x < target.x ? { x: 1, y: 0 } : { x: -1, y: 0 };
  }
  return source.y < target.y ? { x: 0, y: 1 } : { x: 0, y: -1 };
};
const distance = (a, b) => Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
function getPoints({ source, sourcePosition = Position.Bottom, target, targetPosition = Position.Top, center, offset }) {
  const sourceDir = handleDirections[sourcePosition];
  const targetDir = handleDirections[targetPosition];
  const sourceGapped = { x: source.x + sourceDir.x * offset, y: source.y + sourceDir.y * offset };
  const targetGapped = { x: target.x + targetDir.x * offset, y: target.y + targetDir.y * offset };
  const dir = getDirection({
    source: sourceGapped,
    sourcePosition,
    target: targetGapped
  });
  const dirAccessor = dir.x !== 0 ? "x" : "y";
  const currDir = dir[dirAccessor];
  let points = [];
  let centerX, centerY;
  const sourceGapOffset = { x: 0, y: 0 };
  const targetGapOffset = { x: 0, y: 0 };
  const [defaultCenterX, defaultCenterY, defaultOffsetX, defaultOffsetY] = getEdgeCenter({
    sourceX: source.x,
    sourceY: source.y,
    targetX: target.x,
    targetY: target.y
  });
  if (sourceDir[dirAccessor] * targetDir[dirAccessor] === -1) {
    centerX = center.x ?? defaultCenterX;
    centerY = center.y ?? defaultCenterY;
    const verticalSplit = [
      { x: centerX, y: sourceGapped.y },
      { x: centerX, y: targetGapped.y }
    ];
    const horizontalSplit = [
      { x: sourceGapped.x, y: centerY },
      { x: targetGapped.x, y: centerY }
    ];
    if (sourceDir[dirAccessor] === currDir) {
      points = dirAccessor === "x" ? verticalSplit : horizontalSplit;
    } else {
      points = dirAccessor === "x" ? horizontalSplit : verticalSplit;
    }
  } else {
    const sourceTarget = [{ x: sourceGapped.x, y: targetGapped.y }];
    const targetSource = [{ x: targetGapped.x, y: sourceGapped.y }];
    if (dirAccessor === "x") {
      points = sourceDir.x === currDir ? targetSource : sourceTarget;
    } else {
      points = sourceDir.y === currDir ? sourceTarget : targetSource;
    }
    if (sourcePosition === targetPosition) {
      const diff = Math.abs(source[dirAccessor] - target[dirAccessor]);
      if (diff <= offset) {
        const gapOffset = Math.min(offset - 1, offset - diff);
        if (sourceDir[dirAccessor] === currDir) {
          sourceGapOffset[dirAccessor] = (sourceGapped[dirAccessor] > source[dirAccessor] ? -1 : 1) * gapOffset;
        } else {
          targetGapOffset[dirAccessor] = (targetGapped[dirAccessor] > target[dirAccessor] ? -1 : 1) * gapOffset;
        }
      }
    }
    if (sourcePosition !== targetPosition) {
      const dirAccessorOpposite = dirAccessor === "x" ? "y" : "x";
      const isSameDir = sourceDir[dirAccessor] === targetDir[dirAccessorOpposite];
      const sourceGtTargetOppo = sourceGapped[dirAccessorOpposite] > targetGapped[dirAccessorOpposite];
      const sourceLtTargetOppo = sourceGapped[dirAccessorOpposite] < targetGapped[dirAccessorOpposite];
      const flipSourceTarget = sourceDir[dirAccessor] === 1 && (!isSameDir && sourceGtTargetOppo || isSameDir && sourceLtTargetOppo) || sourceDir[dirAccessor] !== 1 && (!isSameDir && sourceLtTargetOppo || isSameDir && sourceGtTargetOppo);
      if (flipSourceTarget) {
        points = dirAccessor === "x" ? sourceTarget : targetSource;
      }
    }
    const sourceGapPoint = { x: sourceGapped.x + sourceGapOffset.x, y: sourceGapped.y + sourceGapOffset.y };
    const targetGapPoint = { x: targetGapped.x + targetGapOffset.x, y: targetGapped.y + targetGapOffset.y };
    const maxXDistance = Math.max(Math.abs(sourceGapPoint.x - points[0].x), Math.abs(targetGapPoint.x - points[0].x));
    const maxYDistance = Math.max(Math.abs(sourceGapPoint.y - points[0].y), Math.abs(targetGapPoint.y - points[0].y));
    if (maxXDistance >= maxYDistance) {
      centerX = (sourceGapPoint.x + targetGapPoint.x) / 2;
      centerY = points[0].y;
    } else {
      centerX = points[0].x;
      centerY = (sourceGapPoint.y + targetGapPoint.y) / 2;
    }
  }
  const pathPoints = [
    source,
    { x: sourceGapped.x + sourceGapOffset.x, y: sourceGapped.y + sourceGapOffset.y },
    ...points,
    { x: targetGapped.x + targetGapOffset.x, y: targetGapped.y + targetGapOffset.y },
    target
  ];
  return [pathPoints, centerX, centerY, defaultOffsetX, defaultOffsetY];
}
function getBend(a, b, c, size) {
  const bendSize = Math.min(distance(a, b) / 2, distance(b, c) / 2, size);
  const { x, y } = b;
  if (a.x === x && x === c.x || a.y === y && y === c.y) {
    return `L${x} ${y}`;
  }
  if (a.y === y) {
    const xDir2 = a.x < c.x ? -1 : 1;
    const yDir2 = a.y < c.y ? 1 : -1;
    return `L ${x + bendSize * xDir2},${y}Q ${x},${y} ${x},${y + bendSize * yDir2}`;
  }
  const xDir = a.x < c.x ? 1 : -1;
  const yDir = a.y < c.y ? -1 : 1;
  return `L ${x},${y + bendSize * yDir}Q ${x},${y} ${x + bendSize * xDir},${y}`;
}
function getSmoothStepPath({ sourceX, sourceY, sourcePosition = Position.Bottom, targetX, targetY, targetPosition = Position.Top, borderRadius = 5, centerX, centerY, offset = 20 }) {
  const [points, labelX, labelY, offsetX, offsetY] = getPoints({
    source: { x: sourceX, y: sourceY },
    sourcePosition,
    target: { x: targetX, y: targetY },
    targetPosition,
    center: { x: centerX, y: centerY },
    offset
  });
  const path = points.reduce((res, p, i) => {
    let segment = "";
    if (i > 0 && i < points.length - 1) {
      segment = getBend(points[i - 1], p, points[i + 1], borderRadius);
    } else {
      segment = `${i === 0 ? "M" : "L"}${p.x} ${p.y}`;
    }
    res += segment;
    return res;
  }, "");
  return [path, labelX, labelY, offsetX, offsetY];
}
const SmoothStepEdge = memo$g(({ sourceX, sourceY, targetX, targetY, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius, style: style2, sourcePosition = Position.Bottom, targetPosition = Position.Top, markerEnd, markerStart, pathOptions, interactionWidth }) => {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: pathOptions?.borderRadius,
    offset: pathOptions?.offset
  });
  return React$o.createElement(BaseEdge, { path, labelX, labelY, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius, style: style2, markerEnd, markerStart, interactionWidth });
});
SmoothStepEdge.displayName = "SmoothStepEdge";
const StepEdge = memo$g((props) => React$o.createElement(SmoothStepEdge, { ...props, pathOptions: useMemo$1(() => ({ borderRadius: 0, offset: props.pathOptions?.offset }), [props.pathOptions?.offset]) }));
StepEdge.displayName = "StepEdge";
function getStraightPath({ sourceX, sourceY, targetX, targetY }) {
  const [labelX, labelY, offsetX, offsetY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY
  });
  return [`M ${sourceX},${sourceY}L ${targetX},${targetY}`, labelX, labelY, offsetX, offsetY];
}
const StraightEdge = memo$g(({ sourceX, sourceY, targetX, targetY, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius, style: style2, markerEnd, markerStart, interactionWidth }) => {
  const [path, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  return React$o.createElement(BaseEdge, { path, labelX, labelY, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius, style: style2, markerEnd, markerStart, interactionWidth });
});
StraightEdge.displayName = "StraightEdge";
function calculateControlOffset(distance2, curvature) {
  if (distance2 >= 0) {
    return 0.5 * distance2;
  }
  return curvature * 25 * Math.sqrt(-distance2);
}
function getControlWithCurvature({ pos, x1, y1, x2, y2, c }) {
  switch (pos) {
    case Position.Left:
      return [x1 - calculateControlOffset(x1 - x2, c), y1];
    case Position.Right:
      return [x1 + calculateControlOffset(x2 - x1, c), y1];
    case Position.Top:
      return [x1, y1 - calculateControlOffset(y1 - y2, c)];
    case Position.Bottom:
      return [x1, y1 + calculateControlOffset(y2 - y1, c)];
  }
}
function getBezierPath({ sourceX, sourceY, sourcePosition = Position.Bottom, targetX, targetY, targetPosition = Position.Top, curvature = 0.25 }) {
  const [sourceControlX, sourceControlY] = getControlWithCurvature({
    pos: sourcePosition,
    x1: sourceX,
    y1: sourceY,
    x2: targetX,
    y2: targetY,
    c: curvature
  });
  const [targetControlX, targetControlY] = getControlWithCurvature({
    pos: targetPosition,
    x1: targetX,
    y1: targetY,
    x2: sourceX,
    y2: sourceY,
    c: curvature
  });
  const [labelX, labelY, offsetX, offsetY] = getBezierEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourceControlX,
    sourceControlY,
    targetControlX,
    targetControlY
  });
  return [
    `M${sourceX},${sourceY} C${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${targetX},${targetY}`,
    labelX,
    labelY,
    offsetX,
    offsetY
  ];
}
const BezierEdge = memo$g(({ sourceX, sourceY, targetX, targetY, sourcePosition = Position.Bottom, targetPosition = Position.Top, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius, style: style2, markerEnd, markerStart, pathOptions, interactionWidth }) => {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: pathOptions?.curvature
  });
  return React$o.createElement(BaseEdge, { path, labelX, labelY, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius, style: style2, markerEnd, markerStart, interactionWidth });
});
BezierEdge.displayName = "BezierEdge";
const NodeIdContext = createContext(null);
const Provider = NodeIdContext.Provider;
NodeIdContext.Consumer;
const useNodeId = () => {
  const nodeId = useContext(NodeIdContext);
  return nodeId;
};
const isEdge = (element) => "id" in element && "source" in element && "target" in element;
const isNode = (element) => "id" in element && !("source" in element) && !("target" in element);
const getOutgoers = (node, nodes, edges) => {
  if (!isNode(node)) {
    return [];
  }
  const outgoerIds = edges.filter((e) => e.source === node.id).map((e) => e.target);
  return nodes.filter((n) => outgoerIds.includes(n.id));
};
const getIncomers = (node, nodes, edges) => {
  if (!isNode(node)) {
    return [];
  }
  const incomersIds = edges.filter((e) => e.target === node.id).map((e) => e.source);
  return nodes.filter((n) => incomersIds.includes(n.id));
};
const getEdgeId = ({ source, sourceHandle, target, targetHandle }) => `reactflow__edge-${source}${sourceHandle || ""}-${target}${targetHandle || ""}`;
const getMarkerId = (marker, rfId) => {
  if (typeof marker === "undefined") {
    return "";
  }
  if (typeof marker === "string") {
    return marker;
  }
  const idPrefix = rfId ? `${rfId}__` : "";
  return `${idPrefix}${Object.keys(marker).sort().map((key) => `${key}=${marker[key]}`).join("&")}`;
};
const connectionExists = (edge, edges) => {
  return edges.some((el) => el.source === edge.source && el.target === edge.target && (el.sourceHandle === edge.sourceHandle || !el.sourceHandle && !edge.sourceHandle) && (el.targetHandle === edge.targetHandle || !el.targetHandle && !edge.targetHandle));
};
const addEdge = (edgeParams, edges) => {
  if (!edgeParams.source || !edgeParams.target) {
    return edges;
  }
  let edge;
  if (isEdge(edgeParams)) {
    edge = { ...edgeParams };
  } else {
    edge = {
      ...edgeParams,
      id: getEdgeId(edgeParams)
    };
  }
  if (connectionExists(edge, edges)) {
    return edges;
  }
  return edges.concat(edge);
};
const pointToRendererPoint = ({ x, y }, [tx, ty, tScale], snapToGrid, [snapX, snapY]) => {
  const position = {
    x: (x - tx) / tScale,
    y: (y - ty) / tScale
  };
  if (snapToGrid) {
    return {
      x: snapX * Math.round(position.x / snapX),
      y: snapY * Math.round(position.y / snapY)
    };
  }
  return position;
};
const rendererPointToPoint = ({ x, y }, [tx, ty, tScale]) => {
  return {
    x: x * tScale + tx,
    y: y * tScale + ty
  };
};
const getNodePositionWithOrigin = (node, nodeOrigin = [0, 0]) => {
  if (!node) {
    return {
      x: 0,
      y: 0,
      positionAbsolute: {
        x: 0,
        y: 0
      }
    };
  }
  const offsetX = (node.width ?? 0) * nodeOrigin[0];
  const offsetY = (node.height ?? 0) * nodeOrigin[1];
  const position = {
    x: node.position.x - offsetX,
    y: node.position.y - offsetY
  };
  return {
    ...position,
    positionAbsolute: node.positionAbsolute ? {
      x: node.positionAbsolute.x - offsetX,
      y: node.positionAbsolute.y - offsetY
    } : position
  };
};
const getNodesBounds = (nodes, nodeOrigin = [0, 0]) => {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  const box = nodes.reduce((currBox, node) => {
    const { x, y } = getNodePositionWithOrigin(node, nodeOrigin).positionAbsolute;
    return getBoundsOfBoxes(currBox, rectToBox({
      x,
      y,
      width: node.width || 0,
      height: node.height || 0
    }));
  }, { x: Infinity, y: Infinity, x2: -Infinity, y2: -Infinity });
  return boxToRect(box);
};
const getNodesInside = (nodeInternals, rect, [tx, ty, tScale] = [0, 0, 1], partially = false, excludeNonSelectableNodes = false, nodeOrigin = [0, 0]) => {
  const paneRect = {
    x: (rect.x - tx) / tScale,
    y: (rect.y - ty) / tScale,
    width: rect.width / tScale,
    height: rect.height / tScale
  };
  const visibleNodes = [];
  nodeInternals.forEach((node) => {
    const { width, height, selectable = true, hidden = false } = node;
    if (excludeNonSelectableNodes && !selectable || hidden) {
      return false;
    }
    const { positionAbsolute } = getNodePositionWithOrigin(node, nodeOrigin);
    const nodeRect = {
      x: positionAbsolute.x,
      y: positionAbsolute.y,
      width: width || 0,
      height: height || 0
    };
    const overlappingArea = getOverlappingArea(paneRect, nodeRect);
    const notInitialized = typeof width === "undefined" || typeof height === "undefined" || width === null || height === null;
    const partiallyVisible = partially && overlappingArea > 0;
    const area = (width || 0) * (height || 0);
    const isVisible = notInitialized || partiallyVisible || overlappingArea >= area;
    if (isVisible || node.dragging) {
      visibleNodes.push(node);
    }
  });
  return visibleNodes;
};
const getConnectedEdges = (nodes, edges) => {
  const nodeIds = nodes.map((node) => node.id);
  return edges.filter((edge) => nodeIds.includes(edge.source) || nodeIds.includes(edge.target));
};
const getViewportForBounds = (bounds, width, height, minZoom, maxZoom, padding = 0.1) => {
  const xZoom = width / (bounds.width * (1 + padding));
  const yZoom = height / (bounds.height * (1 + padding));
  const zoom2 = Math.min(xZoom, yZoom);
  const clampedZoom = clamp(zoom2, minZoom, maxZoom);
  const boundsCenterX = bounds.x + bounds.width / 2;
  const boundsCenterY = bounds.y + bounds.height / 2;
  const x = width / 2 - boundsCenterX * clampedZoom;
  const y = height / 2 - boundsCenterY * clampedZoom;
  return { x, y, zoom: clampedZoom };
};
const getD3Transition = (selection, duration = 0) => {
  return selection.transition().duration(duration);
};
function getHandles(node, handleBounds, type, currentHandle) {
  return (handleBounds[type] || []).reduce((res, h) => {
    if (`${node.id}-${h.id}-${type}` !== currentHandle) {
      res.push({
        id: h.id || null,
        type,
        nodeId: node.id,
        x: (node.positionAbsolute?.x ?? 0) + h.x + h.width / 2,
        y: (node.positionAbsolute?.y ?? 0) + h.y + h.height / 2
      });
    }
    return res;
  }, []);
}
function getClosestHandle(event, doc, pos, connectionRadius, handles, validator) {
  const { x, y } = getEventPosition(event);
  const domNodes = doc.elementsFromPoint(x, y);
  const handleBelow = domNodes.find((el) => el.classList.contains("react-flow__handle"));
  if (handleBelow) {
    const handleNodeId = handleBelow.getAttribute("data-nodeid");
    if (handleNodeId) {
      const handleType = getHandleType(void 0, handleBelow);
      const handleId = handleBelow.getAttribute("data-handleid");
      const validHandleResult = validator({ nodeId: handleNodeId, id: handleId, type: handleType });
      if (validHandleResult) {
        const handle = handles.find((h) => h.nodeId === handleNodeId && h.type === handleType && h.id === handleId);
        return {
          handle: {
            id: handleId,
            type: handleType,
            nodeId: handleNodeId,
            x: handle?.x || pos.x,
            y: handle?.y || pos.y
          },
          validHandleResult
        };
      }
    }
  }
  let closestHandles = [];
  let minDistance = Infinity;
  handles.forEach((handle) => {
    const distance2 = Math.sqrt((handle.x - pos.x) ** 2 + (handle.y - pos.y) ** 2);
    if (distance2 <= connectionRadius) {
      const validHandleResult = validator(handle);
      if (distance2 <= minDistance) {
        if (distance2 < minDistance) {
          closestHandles = [{ handle, validHandleResult }];
        } else if (distance2 === minDistance) {
          closestHandles.push({
            handle,
            validHandleResult
          });
        }
        minDistance = distance2;
      }
    }
  });
  if (!closestHandles.length) {
    return { handle: null, validHandleResult: defaultResult() };
  }
  if (closestHandles.length === 1) {
    return closestHandles[0];
  }
  const hasValidHandle = closestHandles.some(({ validHandleResult }) => validHandleResult.isValid);
  const hasTargetHandle = closestHandles.some(({ handle }) => handle.type === "target");
  return closestHandles.find(({ handle, validHandleResult }) => hasTargetHandle ? handle.type === "target" : hasValidHandle ? validHandleResult.isValid : true) || closestHandles[0];
}
const nullConnection = { source: null, target: null, sourceHandle: null, targetHandle: null };
const defaultResult = () => ({
  handleDomNode: null,
  isValid: false,
  connection: nullConnection,
  endHandle: null
});
function isValidHandle(handle, connectionMode, fromNodeId, fromHandleId, fromType, isValidConnection, doc) {
  const isTarget = fromType === "target";
  const handleToCheck = doc.querySelector(`.react-flow__handle[data-id="${handle?.nodeId}-${handle?.id}-${handle?.type}"]`);
  const result = {
    ...defaultResult(),
    handleDomNode: handleToCheck
  };
  if (handleToCheck) {
    const handleType = getHandleType(void 0, handleToCheck);
    const handleNodeId = handleToCheck.getAttribute("data-nodeid");
    const handleId = handleToCheck.getAttribute("data-handleid");
    const connectable = handleToCheck.classList.contains("connectable");
    const connectableEnd = handleToCheck.classList.contains("connectableend");
    const connection = {
      source: isTarget ? handleNodeId : fromNodeId,
      sourceHandle: isTarget ? handleId : fromHandleId,
      target: isTarget ? fromNodeId : handleNodeId,
      targetHandle: isTarget ? fromHandleId : handleId
    };
    result.connection = connection;
    const isConnectable = connectable && connectableEnd;
    const isValid = isConnectable && (connectionMode === ConnectionMode.Strict ? isTarget && handleType === "source" || !isTarget && handleType === "target" : handleNodeId !== fromNodeId || handleId !== fromHandleId);
    if (isValid) {
      result.endHandle = {
        nodeId: handleNodeId,
        handleId,
        type: handleType
      };
      result.isValid = isValidConnection(connection);
    }
  }
  return result;
}
function getHandleLookup({ nodes, nodeId, handleId, handleType }) {
  return nodes.reduce((res, node) => {
    if (node[internalsSymbol]) {
      const { handleBounds } = node[internalsSymbol];
      let sourceHandles = [];
      let targetHandles = [];
      if (handleBounds) {
        sourceHandles = getHandles(node, handleBounds, "source", `${nodeId}-${handleId}-${handleType}`);
        targetHandles = getHandles(node, handleBounds, "target", `${nodeId}-${handleId}-${handleType}`);
      }
      res.push(...sourceHandles, ...targetHandles);
    }
    return res;
  }, []);
}
function getHandleType(edgeUpdaterType, handleDomNode) {
  if (edgeUpdaterType) {
    return edgeUpdaterType;
  } else if (handleDomNode?.classList.contains("target")) {
    return "target";
  } else if (handleDomNode?.classList.contains("source")) {
    return "source";
  }
  return null;
}
function resetRecentHandle(handleDomNode) {
  handleDomNode?.classList.remove("valid", "connecting", "react-flow__handle-valid", "react-flow__handle-connecting");
}
function getConnectionStatus(isInsideConnectionRadius, isHandleValid) {
  let connectionStatus = null;
  if (isHandleValid) {
    connectionStatus = "valid";
  } else if (isInsideConnectionRadius && !isHandleValid) {
    connectionStatus = "invalid";
  }
  return connectionStatus;
}
function handlePointerDown({ event, handleId, nodeId, onConnect, isTarget, getState, setState, isValidConnection, edgeUpdaterType, onReconnectEnd }) {
  const doc = getHostForElement(event.target);
  const { connectionMode, domNode, autoPanOnConnect, connectionRadius, onConnectStart, panBy, getNodes, cancelConnection } = getState();
  let autoPanId = 0;
  let closestHandle;
  const { x, y } = getEventPosition(event);
  const clickedHandle = doc?.elementFromPoint(x, y);
  const handleType = getHandleType(edgeUpdaterType, clickedHandle);
  const containerBounds = domNode?.getBoundingClientRect();
  if (!containerBounds || !handleType) {
    return;
  }
  let prevActiveHandle;
  let connectionPosition = getEventPosition(event, containerBounds);
  let autoPanStarted = false;
  let connection = null;
  let isValid = false;
  let handleDomNode = null;
  const handleLookup = getHandleLookup({
    nodes: getNodes(),
    nodeId,
    handleId,
    handleType
  });
  const autoPan = () => {
    if (!autoPanOnConnect) {
      return;
    }
    const [xMovement, yMovement] = calcAutoPan(connectionPosition, containerBounds);
    panBy({ x: xMovement, y: yMovement });
    autoPanId = requestAnimationFrame(autoPan);
  };
  setState({
    connectionPosition,
    connectionStatus: null,
    // connectionNodeId etc will be removed in the next major in favor of connectionStartHandle
    connectionNodeId: nodeId,
    connectionHandleId: handleId,
    connectionHandleType: handleType,
    connectionStartHandle: {
      nodeId,
      handleId,
      type: handleType
    },
    connectionEndHandle: null
  });
  onConnectStart?.(event, { nodeId, handleId, handleType });
  function onPointerMove(event2) {
    const { transform } = getState();
    connectionPosition = getEventPosition(event2, containerBounds);
    const { handle, validHandleResult } = getClosestHandle(event2, doc, pointToRendererPoint(connectionPosition, transform, false, [1, 1]), connectionRadius, handleLookup, (handle2) => isValidHandle(handle2, connectionMode, nodeId, handleId, isTarget ? "target" : "source", isValidConnection, doc));
    closestHandle = handle;
    if (!autoPanStarted) {
      autoPan();
      autoPanStarted = true;
    }
    handleDomNode = validHandleResult.handleDomNode;
    connection = validHandleResult.connection;
    isValid = validHandleResult.isValid;
    setState({
      connectionPosition: closestHandle && isValid ? rendererPointToPoint({
        x: closestHandle.x,
        y: closestHandle.y
      }, transform) : connectionPosition,
      connectionStatus: getConnectionStatus(!!closestHandle, isValid),
      connectionEndHandle: validHandleResult.endHandle
    });
    if (!closestHandle && !isValid && !handleDomNode) {
      return resetRecentHandle(prevActiveHandle);
    }
    if (connection.source !== connection.target && handleDomNode) {
      resetRecentHandle(prevActiveHandle);
      prevActiveHandle = handleDomNode;
      handleDomNode.classList.add("connecting", "react-flow__handle-connecting");
      handleDomNode.classList.toggle("valid", isValid);
      handleDomNode.classList.toggle("react-flow__handle-valid", isValid);
    }
  }
  function onPointerUp(event2) {
    if ((closestHandle || handleDomNode) && connection && isValid) {
      onConnect?.(connection);
    }
    getState().onConnectEnd?.(event2);
    if (edgeUpdaterType) {
      onReconnectEnd?.(event2);
    }
    resetRecentHandle(prevActiveHandle);
    cancelConnection();
    cancelAnimationFrame(autoPanId);
    autoPanStarted = false;
    isValid = false;
    connection = null;
    handleDomNode = null;
    doc.removeEventListener("mousemove", onPointerMove);
    doc.removeEventListener("mouseup", onPointerUp);
    doc.removeEventListener("touchmove", onPointerMove);
    doc.removeEventListener("touchend", onPointerUp);
  }
  doc.addEventListener("mousemove", onPointerMove);
  doc.addEventListener("mouseup", onPointerUp);
  doc.addEventListener("touchmove", onPointerMove);
  doc.addEventListener("touchend", onPointerUp);
}
const alwaysValid = () => true;
const selector$f = (s) => ({
  connectionStartHandle: s.connectionStartHandle,
  connectOnClick: s.connectOnClick,
  noPanClassName: s.noPanClassName
});
const connectingSelector = (nodeId, handleId, type) => (state) => {
  const { connectionStartHandle: startHandle, connectionEndHandle: endHandle, connectionClickStartHandle: clickHandle } = state;
  return {
    connecting: startHandle?.nodeId === nodeId && startHandle?.handleId === handleId && startHandle?.type === type || endHandle?.nodeId === nodeId && endHandle?.handleId === handleId && endHandle?.type === type,
    clickConnecting: clickHandle?.nodeId === nodeId && clickHandle?.handleId === handleId && clickHandle?.type === type
  };
};
const Handle = forwardRef$1(({ type = "source", position = Position.Top, isValidConnection, isConnectable = true, isConnectableStart = true, isConnectableEnd = true, id, onConnect, children, className, onMouseDown, onTouchStart, ...rest }, ref) => {
  const handleId = id || null;
  const isTarget = type === "target";
  const store = useStoreApi();
  const nodeId = useNodeId();
  const { connectOnClick, noPanClassName } = useStore(selector$f, shallow$1);
  const { connecting, clickConnecting } = useStore(connectingSelector(nodeId, handleId, type), shallow$1);
  if (!nodeId) {
    store.getState().onError?.("010", errorMessages["error010"]());
  }
  const onConnectExtended = (params) => {
    const { defaultEdgeOptions, onConnect: onConnectAction, hasDefaultEdges } = store.getState();
    const edgeParams = {
      ...defaultEdgeOptions,
      ...params
    };
    if (hasDefaultEdges) {
      const { edges, setEdges } = store.getState();
      setEdges(addEdge(edgeParams, edges));
    }
    onConnectAction?.(edgeParams);
    onConnect?.(edgeParams);
  };
  const onPointerDown = (event) => {
    if (!nodeId) {
      return;
    }
    const isMouseTriggered = isMouseEvent(event);
    if (isConnectableStart && (isMouseTriggered && event.button === 0 || !isMouseTriggered)) {
      handlePointerDown({
        event,
        handleId,
        nodeId,
        onConnect: onConnectExtended,
        isTarget,
        getState: store.getState,
        setState: store.setState,
        isValidConnection: isValidConnection || store.getState().isValidConnection || alwaysValid
      });
    }
    if (isMouseTriggered) {
      onMouseDown?.(event);
    } else {
      onTouchStart?.(event);
    }
  };
  const onClick = (event) => {
    const { onClickConnectStart, onClickConnectEnd, connectionClickStartHandle, connectionMode, isValidConnection: isValidConnectionStore } = store.getState();
    if (!nodeId || !connectionClickStartHandle && !isConnectableStart) {
      return;
    }
    if (!connectionClickStartHandle) {
      onClickConnectStart?.(event, { nodeId, handleId, handleType: type });
      store.setState({ connectionClickStartHandle: { nodeId, type, handleId } });
      return;
    }
    const doc = getHostForElement(event.target);
    const isValidConnectionHandler = isValidConnection || isValidConnectionStore || alwaysValid;
    const { connection, isValid } = isValidHandle({
      nodeId,
      id: handleId,
      type
    }, connectionMode, connectionClickStartHandle.nodeId, connectionClickStartHandle.handleId || null, connectionClickStartHandle.type, isValidConnectionHandler, doc);
    if (isValid) {
      onConnectExtended(connection);
    }
    onClickConnectEnd?.(event);
    store.setState({ connectionClickStartHandle: null });
  };
  return React$o.createElement("div", { "data-handleid": handleId, "data-nodeid": nodeId, "data-handlepos": position, "data-id": `${nodeId}-${handleId}-${type}`, className: cc([
    "react-flow__handle",
    `react-flow__handle-${position}`,
    "nodrag",
    noPanClassName,
    className,
    {
      source: !isTarget,
      target: isTarget,
      connectable: isConnectable,
      connectablestart: isConnectableStart,
      connectableend: isConnectableEnd,
      connecting: clickConnecting,
      // this class is used to style the handle when the user is connecting
      connectionindicator: isConnectable && (isConnectableStart && !connecting || isConnectableEnd && connecting)
    }
  ]), onMouseDown: onPointerDown, onTouchStart: onPointerDown, onClick: connectOnClick ? onClick : void 0, ref, ...rest }, children);
});
Handle.displayName = "Handle";
var Handle$1 = memo$g(Handle);
const DefaultNode = ({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }) => {
  return React$o.createElement(
    React$o.Fragment,
    null,
    React$o.createElement(Handle$1, { type: "target", position: targetPosition, isConnectable }),
    data?.label,
    React$o.createElement(Handle$1, { type: "source", position: sourcePosition, isConnectable })
  );
};
DefaultNode.displayName = "DefaultNode";
var DefaultNode$1 = memo$g(DefaultNode);
const InputNode = ({ data, isConnectable, sourcePosition = Position.Bottom }) => React$o.createElement(
  React$o.Fragment,
  null,
  data?.label,
  React$o.createElement(Handle$1, { type: "source", position: sourcePosition, isConnectable })
);
InputNode.displayName = "InputNode";
var InputNode$1 = memo$g(InputNode);
const OutputNode = ({ data, isConnectable, targetPosition = Position.Top }) => React$o.createElement(
  React$o.Fragment,
  null,
  React$o.createElement(Handle$1, { type: "target", position: targetPosition, isConnectable }),
  data?.label
);
OutputNode.displayName = "OutputNode";
var OutputNode$1 = memo$g(OutputNode);
const GroupNode = () => null;
GroupNode.displayName = "GroupNode";
const selector$e = (s) => ({
  selectedNodes: s.getNodes().filter((n) => n.selected),
  selectedEdges: s.edges.filter((e) => e.selected).map((e) => ({ ...e }))
});
const selectId = (obj) => obj.id;
function areEqual(a, b) {
  return shallow$1(a.selectedNodes.map(selectId), b.selectedNodes.map(selectId)) && shallow$1(a.selectedEdges.map(selectId), b.selectedEdges.map(selectId));
}
const SelectionListener = memo$g(({ onSelectionChange }) => {
  const store = useStoreApi();
  const { selectedNodes, selectedEdges } = useStore(selector$e, areEqual);
  useEffect$b(() => {
    const params = { nodes: selectedNodes, edges: selectedEdges };
    onSelectionChange?.(params);
    store.getState().onSelectionChange.forEach((fn) => fn(params));
  }, [selectedNodes, selectedEdges, onSelectionChange]);
  return null;
});
SelectionListener.displayName = "SelectionListener";
const changeSelector = (s) => !!s.onSelectionChange;
function Wrapper$1({ onSelectionChange }) {
  const storeHasSelectionChange = useStore(changeSelector);
  if (onSelectionChange || storeHasSelectionChange) {
    return React$o.createElement(SelectionListener, { onSelectionChange });
  }
  return null;
}
const selector$d = (s) => ({
  setNodes: s.setNodes,
  setEdges: s.setEdges,
  setDefaultNodesAndEdges: s.setDefaultNodesAndEdges,
  setMinZoom: s.setMinZoom,
  setMaxZoom: s.setMaxZoom,
  setTranslateExtent: s.setTranslateExtent,
  setNodeExtent: s.setNodeExtent,
  reset: s.reset
});
function useStoreUpdater(value, setStoreState) {
  useEffect$b(() => {
    if (typeof value !== "undefined") {
      setStoreState(value);
    }
  }, [value]);
}
function useDirectStoreUpdater(key, value, setState) {
  useEffect$b(() => {
    if (typeof value !== "undefined") {
      setState({ [key]: value });
    }
  }, [value]);
}
const StoreUpdater = ({ nodes, edges, defaultNodes, defaultEdges, onConnect, onConnectStart, onConnectEnd, onClickConnectStart, onClickConnectEnd, nodesDraggable, nodesConnectable, nodesFocusable, edgesFocusable, edgesUpdatable, elevateNodesOnSelect, minZoom, maxZoom, nodeExtent, onNodesChange, onEdgesChange, elementsSelectable, connectionMode, snapGrid, snapToGrid, translateExtent, connectOnClick, defaultEdgeOptions, fitView: fitView2, fitViewOptions, onNodesDelete, onEdgesDelete, onNodeDrag, onNodeDragStart, onNodeDragStop, onSelectionDrag, onSelectionDragStart, onSelectionDragStop, noPanClassName, nodeOrigin, rfId, autoPanOnConnect, autoPanOnNodeDrag, onError, connectionRadius, isValidConnection, nodeDragThreshold }) => {
  const { setNodes, setEdges, setDefaultNodesAndEdges, setMinZoom, setMaxZoom, setTranslateExtent, setNodeExtent, reset } = useStore(selector$d, shallow$1);
  const store = useStoreApi();
  useEffect$b(() => {
    const edgesWithDefaults = defaultEdges?.map((e) => ({ ...e, ...defaultEdgeOptions }));
    setDefaultNodesAndEdges(defaultNodes, edgesWithDefaults);
    return () => {
      reset();
    };
  }, []);
  useDirectStoreUpdater("defaultEdgeOptions", defaultEdgeOptions, store.setState);
  useDirectStoreUpdater("connectionMode", connectionMode, store.setState);
  useDirectStoreUpdater("onConnect", onConnect, store.setState);
  useDirectStoreUpdater("onConnectStart", onConnectStart, store.setState);
  useDirectStoreUpdater("onConnectEnd", onConnectEnd, store.setState);
  useDirectStoreUpdater("onClickConnectStart", onClickConnectStart, store.setState);
  useDirectStoreUpdater("onClickConnectEnd", onClickConnectEnd, store.setState);
  useDirectStoreUpdater("nodesDraggable", nodesDraggable, store.setState);
  useDirectStoreUpdater("nodesConnectable", nodesConnectable, store.setState);
  useDirectStoreUpdater("nodesFocusable", nodesFocusable, store.setState);
  useDirectStoreUpdater("edgesFocusable", edgesFocusable, store.setState);
  useDirectStoreUpdater("edgesUpdatable", edgesUpdatable, store.setState);
  useDirectStoreUpdater("elementsSelectable", elementsSelectable, store.setState);
  useDirectStoreUpdater("elevateNodesOnSelect", elevateNodesOnSelect, store.setState);
  useDirectStoreUpdater("snapToGrid", snapToGrid, store.setState);
  useDirectStoreUpdater("snapGrid", snapGrid, store.setState);
  useDirectStoreUpdater("onNodesChange", onNodesChange, store.setState);
  useDirectStoreUpdater("onEdgesChange", onEdgesChange, store.setState);
  useDirectStoreUpdater("connectOnClick", connectOnClick, store.setState);
  useDirectStoreUpdater("fitViewOnInit", fitView2, store.setState);
  useDirectStoreUpdater("fitViewOnInitOptions", fitViewOptions, store.setState);
  useDirectStoreUpdater("onNodesDelete", onNodesDelete, store.setState);
  useDirectStoreUpdater("onEdgesDelete", onEdgesDelete, store.setState);
  useDirectStoreUpdater("onNodeDrag", onNodeDrag, store.setState);
  useDirectStoreUpdater("onNodeDragStart", onNodeDragStart, store.setState);
  useDirectStoreUpdater("onNodeDragStop", onNodeDragStop, store.setState);
  useDirectStoreUpdater("onSelectionDrag", onSelectionDrag, store.setState);
  useDirectStoreUpdater("onSelectionDragStart", onSelectionDragStart, store.setState);
  useDirectStoreUpdater("onSelectionDragStop", onSelectionDragStop, store.setState);
  useDirectStoreUpdater("noPanClassName", noPanClassName, store.setState);
  useDirectStoreUpdater("nodeOrigin", nodeOrigin, store.setState);
  useDirectStoreUpdater("rfId", rfId, store.setState);
  useDirectStoreUpdater("autoPanOnConnect", autoPanOnConnect, store.setState);
  useDirectStoreUpdater("autoPanOnNodeDrag", autoPanOnNodeDrag, store.setState);
  useDirectStoreUpdater("onError", onError, store.setState);
  useDirectStoreUpdater("connectionRadius", connectionRadius, store.setState);
  useDirectStoreUpdater("isValidConnection", isValidConnection, store.setState);
  useDirectStoreUpdater("nodeDragThreshold", nodeDragThreshold, store.setState);
  useStoreUpdater(nodes, setNodes);
  useStoreUpdater(edges, setEdges);
  useStoreUpdater(minZoom, setMinZoom);
  useStoreUpdater(maxZoom, setMaxZoom);
  useStoreUpdater(translateExtent, setTranslateExtent);
  useStoreUpdater(nodeExtent, setNodeExtent);
  return null;
};
const style = { display: "none" };
const ariaLiveStyle = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  border: 0,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0px, 0px, 0px, 0px)",
  clipPath: "inset(100%)"
};
const ARIA_NODE_DESC_KEY = "react-flow__node-desc";
const ARIA_EDGE_DESC_KEY = "react-flow__edge-desc";
const ARIA_LIVE_MESSAGE = "react-flow__aria-live";
const selector$c = (s) => s.ariaLiveMessage;
function AriaLiveMessage({ rfId }) {
  const ariaLiveMessage = useStore(selector$c);
  return React$o.createElement("div", { id: `${ARIA_LIVE_MESSAGE}-${rfId}`, "aria-live": "assertive", "aria-atomic": "true", style: ariaLiveStyle }, ariaLiveMessage);
}
function A11yDescriptions({ rfId, disableKeyboardA11y }) {
  return React$o.createElement(
    React$o.Fragment,
    null,
    React$o.createElement(
      "div",
      { id: `${ARIA_NODE_DESC_KEY}-${rfId}`, style },
      "Press enter or space to select a node.",
      !disableKeyboardA11y && "You can then use the arrow keys to move the node around.",
      " Press delete to remove it and escape to cancel.",
      " "
    ),
    React$o.createElement("div", { id: `${ARIA_EDGE_DESC_KEY}-${rfId}`, style }, "Press enter or space to select an edge. You can then press delete to remove it or escape to cancel."),
    !disableKeyboardA11y && React$o.createElement(AriaLiveMessage, { rfId })
  );
}
var useKeyPress = (keyCode = null, options = { actInsideInputWithModifier: true }) => {
  const [keyPressed, setKeyPressed] = useState$h(false);
  const modifierPressed = useRef$8(false);
  const pressedKeys = useRef$8(/* @__PURE__ */ new Set([]));
  const [keyCodes, keysToWatch] = useMemo$1(() => {
    if (keyCode !== null) {
      const keyCodeArr = Array.isArray(keyCode) ? keyCode : [keyCode];
      const keys = keyCodeArr.filter((kc) => typeof kc === "string").map((kc) => kc.split("+"));
      const keysFlat = keys.reduce((res, item) => res.concat(...item), []);
      return [keys, keysFlat];
    }
    return [[], []];
  }, [keyCode]);
  useEffect$b(() => {
    const doc = typeof document !== "undefined" ? document : null;
    const target = options?.target || doc;
    if (keyCode !== null) {
      const downHandler = (event) => {
        modifierPressed.current = event.ctrlKey || event.metaKey || event.shiftKey;
        const preventAction = (!modifierPressed.current || modifierPressed.current && !options.actInsideInputWithModifier) && isInputDOMNode(event);
        if (preventAction) {
          return false;
        }
        const keyOrCode = useKeyOrCode(event.code, keysToWatch);
        pressedKeys.current.add(event[keyOrCode]);
        if (isMatchingKey(keyCodes, pressedKeys.current, false)) {
          event.preventDefault();
          setKeyPressed(true);
        }
      };
      const upHandler = (event) => {
        const preventAction = (!modifierPressed.current || modifierPressed.current && !options.actInsideInputWithModifier) && isInputDOMNode(event);
        if (preventAction) {
          return false;
        }
        const keyOrCode = useKeyOrCode(event.code, keysToWatch);
        if (isMatchingKey(keyCodes, pressedKeys.current, true)) {
          setKeyPressed(false);
          pressedKeys.current.clear();
        } else {
          pressedKeys.current.delete(event[keyOrCode]);
        }
        if (event.key === "Meta") {
          pressedKeys.current.clear();
        }
        modifierPressed.current = false;
      };
      const resetHandler = () => {
        pressedKeys.current.clear();
        setKeyPressed(false);
      };
      target?.addEventListener("keydown", downHandler);
      target?.addEventListener("keyup", upHandler);
      window.addEventListener("blur", resetHandler);
      return () => {
        target?.removeEventListener("keydown", downHandler);
        target?.removeEventListener("keyup", upHandler);
        window.removeEventListener("blur", resetHandler);
      };
    }
  }, [keyCode, setKeyPressed]);
  return keyPressed;
};
function isMatchingKey(keyCodes, pressedKeys, isUp) {
  return keyCodes.filter((keys) => isUp || keys.length === pressedKeys.size).some((keys) => keys.every((k) => pressedKeys.has(k)));
}
function useKeyOrCode(eventCode, keysToWatch) {
  return keysToWatch.includes(eventCode) ? "code" : "key";
}
function calculateXYZPosition(node, nodeInternals, result, nodeOrigin) {
  const parentId = node.parentNode || node.parentId;
  if (!parentId) {
    return result;
  }
  const parentNode = nodeInternals.get(parentId);
  const parentNodePosition = getNodePositionWithOrigin(parentNode, nodeOrigin);
  return calculateXYZPosition(parentNode, nodeInternals, {
    x: (result.x ?? 0) + parentNodePosition.x,
    y: (result.y ?? 0) + parentNodePosition.y,
    z: (parentNode[internalsSymbol]?.z ?? 0) > (result.z ?? 0) ? parentNode[internalsSymbol]?.z ?? 0 : result.z ?? 0
  }, nodeOrigin);
}
function updateAbsoluteNodePositions(nodeInternals, nodeOrigin, parentNodes) {
  nodeInternals.forEach((node) => {
    const parentId = node.parentNode || node.parentId;
    if (parentId && !nodeInternals.has(parentId)) {
      throw new Error(`Parent node ${parentId} not found`);
    }
    if (parentId || parentNodes?.[node.id]) {
      const { x, y, z } = calculateXYZPosition(node, nodeInternals, {
        ...node.position,
        z: node[internalsSymbol]?.z ?? 0
      }, nodeOrigin);
      node.positionAbsolute = {
        x,
        y
      };
      node[internalsSymbol].z = z;
      if (parentNodes?.[node.id]) {
        node[internalsSymbol].isParent = true;
      }
    }
  });
}
function createNodeInternals(nodes, nodeInternals, nodeOrigin, elevateNodesOnSelect) {
  const nextNodeInternals = /* @__PURE__ */ new Map();
  const parentNodes = {};
  const selectedNodeZ = elevateNodesOnSelect ? 1e3 : 0;
  nodes.forEach((node) => {
    const z = (isNumeric(node.zIndex) ? node.zIndex : 0) + (node.selected ? selectedNodeZ : 0);
    const currInternals = nodeInternals.get(node.id);
    const internals = {
      ...node,
      positionAbsolute: {
        x: node.position.x,
        y: node.position.y
      }
    };
    const parentId = node.parentNode || node.parentId;
    if (parentId) {
      parentNodes[parentId] = true;
    }
    const resetHandleBounds = currInternals?.type && currInternals?.type !== node.type;
    Object.defineProperty(internals, internalsSymbol, {
      enumerable: false,
      value: {
        handleBounds: resetHandleBounds ? void 0 : currInternals?.[internalsSymbol]?.handleBounds,
        z
      }
    });
    nextNodeInternals.set(node.id, internals);
  });
  updateAbsoluteNodePositions(nextNodeInternals, nodeOrigin, parentNodes);
  return nextNodeInternals;
}
function fitView(get, options = {}) {
  const { getNodes, width, height, minZoom, maxZoom, d3Zoom, d3Selection, fitViewOnInitDone, fitViewOnInit, nodeOrigin } = get();
  const isInitialFitView = options.initial && !fitViewOnInitDone && fitViewOnInit;
  const d3initialized = d3Zoom && d3Selection;
  if (d3initialized && (isInitialFitView || !options.initial)) {
    const nodes = getNodes().filter((n) => {
      const isVisible = options.includeHiddenNodes ? n.width && n.height : !n.hidden;
      if (options.nodes?.length) {
        return isVisible && options.nodes.some((optionNode) => optionNode.id === n.id);
      }
      return isVisible;
    });
    const nodesInitialized = nodes.every((n) => n.width && n.height);
    if (nodes.length > 0 && nodesInitialized) {
      const bounds = getNodesBounds(nodes, nodeOrigin);
      const { x, y, zoom: zoom2 } = getViewportForBounds(bounds, width, height, options.minZoom ?? minZoom, options.maxZoom ?? maxZoom, options.padding ?? 0.1);
      const nextTransform = identity.translate(x, y).scale(zoom2);
      if (typeof options.duration === "number" && options.duration > 0) {
        d3Zoom.transform(getD3Transition(d3Selection, options.duration), nextTransform);
      } else {
        d3Zoom.transform(d3Selection, nextTransform);
      }
      return true;
    }
  }
  return false;
}
function handleControlledNodeSelectionChange(nodeChanges, nodeInternals) {
  nodeChanges.forEach((change) => {
    const node = nodeInternals.get(change.id);
    if (node) {
      nodeInternals.set(node.id, {
        ...node,
        [internalsSymbol]: node[internalsSymbol],
        selected: change.selected
      });
    }
  });
  return new Map(nodeInternals);
}
function handleControlledEdgeSelectionChange(edgeChanges, edges) {
  return edges.map((e) => {
    const change = edgeChanges.find((change2) => change2.id === e.id);
    if (change) {
      e.selected = change.selected;
    }
    return e;
  });
}
function updateNodesAndEdgesSelections({ changedNodes, changedEdges, get, set }) {
  const { nodeInternals, edges, onNodesChange, onEdgesChange, hasDefaultNodes, hasDefaultEdges } = get();
  if (changedNodes?.length) {
    if (hasDefaultNodes) {
      set({ nodeInternals: handleControlledNodeSelectionChange(changedNodes, nodeInternals) });
    }
    onNodesChange?.(changedNodes);
  }
  if (changedEdges?.length) {
    if (hasDefaultEdges) {
      set({ edges: handleControlledEdgeSelectionChange(changedEdges, edges) });
    }
    onEdgesChange?.(changedEdges);
  }
}
const noop = () => {
};
const initialViewportHelper = {
  zoomIn: noop,
  zoomOut: noop,
  zoomTo: noop,
  getZoom: () => 1,
  setViewport: noop,
  getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
  fitView: () => false,
  setCenter: noop,
  fitBounds: noop,
  project: (position) => position,
  screenToFlowPosition: (position) => position,
  flowToScreenPosition: (position) => position,
  viewportInitialized: false
};
const selector$b = (s) => ({
  d3Zoom: s.d3Zoom,
  d3Selection: s.d3Selection
});
const useViewportHelper = () => {
  const store = useStoreApi();
  const { d3Zoom, d3Selection } = useStore(selector$b, shallow$1);
  const viewportHelperFunctions = useMemo$1(() => {
    if (d3Selection && d3Zoom) {
      return {
        zoomIn: (options) => d3Zoom.scaleBy(getD3Transition(d3Selection, options?.duration), 1.2),
        zoomOut: (options) => d3Zoom.scaleBy(getD3Transition(d3Selection, options?.duration), 1 / 1.2),
        zoomTo: (zoomLevel, options) => d3Zoom.scaleTo(getD3Transition(d3Selection, options?.duration), zoomLevel),
        getZoom: () => store.getState().transform[2],
        setViewport: (transform, options) => {
          const [x, y, zoom2] = store.getState().transform;
          const nextTransform = identity.translate(transform.x ?? x, transform.y ?? y).scale(transform.zoom ?? zoom2);
          d3Zoom.transform(getD3Transition(d3Selection, options?.duration), nextTransform);
        },
        getViewport: () => {
          const [x, y, zoom2] = store.getState().transform;
          return { x, y, zoom: zoom2 };
        },
        fitView: (options) => fitView(store.getState, options),
        setCenter: (x, y, options) => {
          const { width, height, maxZoom } = store.getState();
          const nextZoom = typeof options?.zoom !== "undefined" ? options.zoom : maxZoom;
          const centerX = width / 2 - x * nextZoom;
          const centerY = height / 2 - y * nextZoom;
          const transform = identity.translate(centerX, centerY).scale(nextZoom);
          d3Zoom.transform(getD3Transition(d3Selection, options?.duration), transform);
        },
        fitBounds: (bounds, options) => {
          const { width, height, minZoom, maxZoom } = store.getState();
          const { x, y, zoom: zoom2 } = getViewportForBounds(bounds, width, height, minZoom, maxZoom, options?.padding ?? 0.1);
          const transform = identity.translate(x, y).scale(zoom2);
          d3Zoom.transform(getD3Transition(d3Selection, options?.duration), transform);
        },
        // @deprecated Use `screenToFlowPosition`.
        project: (position) => {
          const { transform, snapToGrid, snapGrid } = store.getState();
          console.warn("[DEPRECATED] `project` is deprecated. Instead use `screenToFlowPosition`. There is no need to subtract the react flow bounds anymore! https://reactflow.dev/api-reference/types/react-flow-instance#screen-to-flow-position");
          return pointToRendererPoint(position, transform, snapToGrid, snapGrid);
        },
        screenToFlowPosition: (position) => {
          const { transform, snapToGrid, snapGrid, domNode } = store.getState();
          if (!domNode) {
            return position;
          }
          const { x: domX, y: domY } = domNode.getBoundingClientRect();
          const relativePosition = {
            x: position.x - domX,
            y: position.y - domY
          };
          return pointToRendererPoint(relativePosition, transform, snapToGrid, snapGrid);
        },
        flowToScreenPosition: (position) => {
          const { transform, domNode } = store.getState();
          if (!domNode) {
            return position;
          }
          const { x: domX, y: domY } = domNode.getBoundingClientRect();
          const rendererPosition = rendererPointToPoint(position, transform);
          return {
            x: rendererPosition.x + domX,
            y: rendererPosition.y + domY
          };
        },
        viewportInitialized: true
      };
    }
    return initialViewportHelper;
  }, [d3Zoom, d3Selection]);
  return viewportHelperFunctions;
};
function useReactFlow() {
  const viewportHelper = useViewportHelper();
  const store = useStoreApi();
  const getNodes = useCallback$9(() => {
    return store.getState().getNodes().map((n) => ({ ...n }));
  }, []);
  const getNode = useCallback$9((id) => {
    return store.getState().nodeInternals.get(id);
  }, []);
  const getEdges = useCallback$9(() => {
    const { edges = [] } = store.getState();
    return edges.map((e) => ({ ...e }));
  }, []);
  const getEdge = useCallback$9((id) => {
    const { edges = [] } = store.getState();
    return edges.find((e) => e.id === id);
  }, []);
  const setNodes = useCallback$9((payload) => {
    const { getNodes: getNodes2, setNodes: setNodes2, hasDefaultNodes, onNodesChange } = store.getState();
    const nodes = getNodes2();
    const nextNodes = typeof payload === "function" ? payload(nodes) : payload;
    if (hasDefaultNodes) {
      setNodes2(nextNodes);
    } else if (onNodesChange) {
      const changes = nextNodes.length === 0 ? nodes.map((node) => ({ type: "remove", id: node.id })) : nextNodes.map((node) => ({ item: node, type: "reset" }));
      onNodesChange(changes);
    }
  }, []);
  const setEdges = useCallback$9((payload) => {
    const { edges = [], setEdges: setEdges2, hasDefaultEdges, onEdgesChange } = store.getState();
    const nextEdges = typeof payload === "function" ? payload(edges) : payload;
    if (hasDefaultEdges) {
      setEdges2(nextEdges);
    } else if (onEdgesChange) {
      const changes = nextEdges.length === 0 ? edges.map((edge) => ({ type: "remove", id: edge.id })) : nextEdges.map((edge) => ({ item: edge, type: "reset" }));
      onEdgesChange(changes);
    }
  }, []);
  const addNodes = useCallback$9((payload) => {
    const nodes = Array.isArray(payload) ? payload : [payload];
    const { getNodes: getNodes2, setNodes: setNodes2, hasDefaultNodes, onNodesChange } = store.getState();
    if (hasDefaultNodes) {
      const currentNodes = getNodes2();
      const nextNodes = [...currentNodes, ...nodes];
      setNodes2(nextNodes);
    } else if (onNodesChange) {
      const changes = nodes.map((node) => ({ item: node, type: "add" }));
      onNodesChange(changes);
    }
  }, []);
  const addEdges = useCallback$9((payload) => {
    const nextEdges = Array.isArray(payload) ? payload : [payload];
    const { edges = [], setEdges: setEdges2, hasDefaultEdges, onEdgesChange } = store.getState();
    if (hasDefaultEdges) {
      setEdges2([...edges, ...nextEdges]);
    } else if (onEdgesChange) {
      const changes = nextEdges.map((edge) => ({ item: edge, type: "add" }));
      onEdgesChange(changes);
    }
  }, []);
  const toObject = useCallback$9(() => {
    const { getNodes: getNodes2, edges = [], transform } = store.getState();
    const [x, y, zoom2] = transform;
    return {
      nodes: getNodes2().map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      viewport: {
        x,
        y,
        zoom: zoom2
      }
    };
  }, []);
  const deleteElements = useCallback$9(({ nodes: nodesDeleted, edges: edgesDeleted }) => {
    const { nodeInternals, getNodes: getNodes2, edges, hasDefaultNodes, hasDefaultEdges, onNodesDelete, onEdgesDelete, onNodesChange, onEdgesChange } = store.getState();
    const nodeIds = (nodesDeleted || []).map((node) => node.id);
    const edgeIds = (edgesDeleted || []).map((edge) => edge.id);
    const nodesToRemove = getNodes2().reduce((res, node) => {
      const parentId = node.parentNode || node.parentId;
      const parentHit = !nodeIds.includes(node.id) && parentId && res.find((n) => n.id === parentId);
      const deletable = typeof node.deletable === "boolean" ? node.deletable : true;
      if (deletable && (nodeIds.includes(node.id) || parentHit)) {
        res.push(node);
      }
      return res;
    }, []);
    const deletableEdges = edges.filter((e) => typeof e.deletable === "boolean" ? e.deletable : true);
    const initialHitEdges = deletableEdges.filter((e) => edgeIds.includes(e.id));
    if (nodesToRemove || initialHitEdges) {
      const connectedEdges = getConnectedEdges(nodesToRemove, deletableEdges);
      const edgesToRemove = [...initialHitEdges, ...connectedEdges];
      const edgeIdsToRemove = edgesToRemove.reduce((res, edge) => {
        if (!res.includes(edge.id)) {
          res.push(edge.id);
        }
        return res;
      }, []);
      if (hasDefaultEdges || hasDefaultNodes) {
        if (hasDefaultEdges) {
          store.setState({
            edges: edges.filter((e) => !edgeIdsToRemove.includes(e.id))
          });
        }
        if (hasDefaultNodes) {
          nodesToRemove.forEach((node) => {
            nodeInternals.delete(node.id);
          });
          store.setState({
            nodeInternals: new Map(nodeInternals)
          });
        }
      }
      if (edgeIdsToRemove.length > 0) {
        onEdgesDelete?.(edgesToRemove);
        if (onEdgesChange) {
          onEdgesChange(edgeIdsToRemove.map((id) => ({
            id,
            type: "remove"
          })));
        }
      }
      if (nodesToRemove.length > 0) {
        onNodesDelete?.(nodesToRemove);
        if (onNodesChange) {
          const nodeChanges = nodesToRemove.map((n) => ({ id: n.id, type: "remove" }));
          onNodesChange(nodeChanges);
        }
      }
    }
  }, []);
  const getNodeRect = useCallback$9((nodeOrRect) => {
    const isRect = isRectObject(nodeOrRect);
    const node = isRect ? null : store.getState().nodeInternals.get(nodeOrRect.id);
    if (!isRect && !node) {
      return [null, null, isRect];
    }
    const nodeRect = isRect ? nodeOrRect : nodeToRect(node);
    return [nodeRect, node, isRect];
  }, []);
  const getIntersectingNodes = useCallback$9((nodeOrRect, partially = true, nodes) => {
    const [nodeRect, node, isRect] = getNodeRect(nodeOrRect);
    if (!nodeRect) {
      return [];
    }
    return (nodes || store.getState().getNodes()).filter((n) => {
      if (!isRect && (n.id === node.id || !n.positionAbsolute)) {
        return false;
      }
      const currNodeRect = nodeToRect(n);
      const overlappingArea = getOverlappingArea(currNodeRect, nodeRect);
      const partiallyVisible = partially && overlappingArea > 0;
      return partiallyVisible || overlappingArea >= nodeRect.width * nodeRect.height;
    });
  }, []);
  const isNodeIntersecting = useCallback$9((nodeOrRect, area, partially = true) => {
    const [nodeRect] = getNodeRect(nodeOrRect);
    if (!nodeRect) {
      return false;
    }
    const overlappingArea = getOverlappingArea(nodeRect, area);
    const partiallyVisible = partially && overlappingArea > 0;
    return partiallyVisible || overlappingArea >= nodeRect.width * nodeRect.height;
  }, []);
  return useMemo$1(() => {
    return {
      ...viewportHelper,
      getNodes,
      getNode,
      getEdges,
      getEdge,
      setNodes,
      setEdges,
      addNodes,
      addEdges,
      toObject,
      deleteElements,
      getIntersectingNodes,
      isNodeIntersecting
    };
  }, [
    viewportHelper,
    getNodes,
    getNode,
    getEdges,
    getEdge,
    setNodes,
    setEdges,
    addNodes,
    addEdges,
    toObject,
    deleteElements,
    getIntersectingNodes,
    isNodeIntersecting
  ]);
}
const deleteKeyOptions = { actInsideInputWithModifier: false };
var useGlobalKeyHandler = ({ deleteKeyCode, multiSelectionKeyCode }) => {
  const store = useStoreApi();
  const { deleteElements } = useReactFlow();
  const deleteKeyPressed = useKeyPress(deleteKeyCode, deleteKeyOptions);
  const multiSelectionKeyPressed = useKeyPress(multiSelectionKeyCode);
  useEffect$b(() => {
    if (deleteKeyPressed) {
      const { edges, getNodes } = store.getState();
      const selectedNodes = getNodes().filter((node) => node.selected);
      const selectedEdges = edges.filter((edge) => edge.selected);
      deleteElements({ nodes: selectedNodes, edges: selectedEdges });
      store.setState({ nodesSelectionActive: false });
    }
  }, [deleteKeyPressed]);
  useEffect$b(() => {
    store.setState({ multiSelectionActive: multiSelectionKeyPressed });
  }, [multiSelectionKeyPressed]);
};
function useResizeHandler(rendererNode) {
  const store = useStoreApi();
  useEffect$b(() => {
    let resizeObserver;
    const updateDimensions = () => {
      if (!rendererNode.current) {
        return;
      }
      const size = getDimensions(rendererNode.current);
      if (size.height === 0 || size.width === 0) {
        store.getState().onError?.("004", errorMessages["error004"]());
      }
      store.setState({ width: size.width || 500, height: size.height || 500 });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    if (rendererNode.current) {
      resizeObserver = new ResizeObserver(() => updateDimensions());
      resizeObserver.observe(rendererNode.current);
    }
    return () => {
      window.removeEventListener("resize", updateDimensions);
      if (resizeObserver && rendererNode.current) {
        resizeObserver.unobserve(rendererNode.current);
      }
    };
  }, []);
}
const containerStyle = {
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0
};
const viewChanged = (prevViewport, eventTransform) => prevViewport.x !== eventTransform.x || prevViewport.y !== eventTransform.y || prevViewport.zoom !== eventTransform.k;
const eventToFlowTransform = (eventTransform) => ({
  x: eventTransform.x,
  y: eventTransform.y,
  zoom: eventTransform.k
});
const isWrappedWithClass = (event, className) => event.target.closest(`.${className}`);
const isRightClickPan = (panOnDrag, usedButton) => usedButton === 2 && Array.isArray(panOnDrag) && panOnDrag.includes(2);
const wheelDelta = (event) => {
  const factor = event.ctrlKey && isMacOs() ? 10 : 1;
  return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 2e-3) * factor;
};
const selector$a = (s) => ({
  d3Zoom: s.d3Zoom,
  d3Selection: s.d3Selection,
  d3ZoomHandler: s.d3ZoomHandler,
  userSelectionActive: s.userSelectionActive
});
const ZoomPane = ({ onMove, onMoveStart, onMoveEnd, onPaneContextMenu, zoomOnScroll = true, zoomOnPinch = true, panOnScroll = false, panOnScrollSpeed = 0.5, panOnScrollMode = PanOnScrollMode.Free, zoomOnDoubleClick = true, elementsSelectable, panOnDrag = true, defaultViewport, translateExtent, minZoom, maxZoom, zoomActivationKeyCode, preventScrolling = true, children, noWheelClassName, noPanClassName }) => {
  const timerId = useRef$8();
  const store = useStoreApi();
  const isZoomingOrPanning = useRef$8(false);
  const zoomedWithRightMouseButton = useRef$8(false);
  const zoomPane = useRef$8(null);
  const prevTransform = useRef$8({ x: 0, y: 0, zoom: 0 });
  const { d3Zoom, d3Selection, d3ZoomHandler, userSelectionActive } = useStore(selector$a, shallow$1);
  const zoomActivationKeyPressed = useKeyPress(zoomActivationKeyCode);
  const mouseButton = useRef$8(0);
  const isPanScrolling = useRef$8(false);
  const panScrollTimeout = useRef$8();
  useResizeHandler(zoomPane);
  useEffect$b(() => {
    if (zoomPane.current) {
      const bbox = zoomPane.current.getBoundingClientRect();
      const d3ZoomInstance = zoom().scaleExtent([minZoom, maxZoom]).translateExtent(translateExtent);
      const selection = select(zoomPane.current).call(d3ZoomInstance);
      const updatedTransform = identity.translate(defaultViewport.x, defaultViewport.y).scale(clamp(defaultViewport.zoom, minZoom, maxZoom));
      const extent = [
        [0, 0],
        [bbox.width, bbox.height]
      ];
      const constrainedTransform = d3ZoomInstance.constrain()(updatedTransform, extent, translateExtent);
      d3ZoomInstance.transform(selection, constrainedTransform);
      d3ZoomInstance.wheelDelta(wheelDelta);
      store.setState({
        d3Zoom: d3ZoomInstance,
        d3Selection: selection,
        d3ZoomHandler: selection.on("wheel.zoom"),
        // we need to pass transform because zoom handler is not registered when we set the initial transform
        transform: [constrainedTransform.x, constrainedTransform.y, constrainedTransform.k],
        domNode: zoomPane.current.closest(".react-flow")
      });
    }
  }, []);
  useEffect$b(() => {
    if (d3Selection && d3Zoom) {
      if (panOnScroll && !zoomActivationKeyPressed && !userSelectionActive) {
        d3Selection.on("wheel.zoom", (event) => {
          if (isWrappedWithClass(event, noWheelClassName)) {
            return false;
          }
          event.preventDefault();
          event.stopImmediatePropagation();
          const currentZoom = d3Selection.property("__zoom").k || 1;
          if (event.ctrlKey && zoomOnPinch) {
            const point = pointer(event);
            const pinchDelta = wheelDelta(event);
            const zoom2 = currentZoom * Math.pow(2, pinchDelta);
            d3Zoom.scaleTo(d3Selection, zoom2, point, event);
            return;
          }
          const deltaNormalize = event.deltaMode === 1 ? 20 : 1;
          let deltaX = panOnScrollMode === PanOnScrollMode.Vertical ? 0 : event.deltaX * deltaNormalize;
          let deltaY = panOnScrollMode === PanOnScrollMode.Horizontal ? 0 : event.deltaY * deltaNormalize;
          if (!isMacOs() && event.shiftKey && panOnScrollMode !== PanOnScrollMode.Vertical) {
            deltaX = event.deltaY * deltaNormalize;
            deltaY = 0;
          }
          d3Zoom.translateBy(
            d3Selection,
            -(deltaX / currentZoom) * panOnScrollSpeed,
            -(deltaY / currentZoom) * panOnScrollSpeed,
            // @ts-ignore
            { internal: true }
          );
          const nextViewport = eventToFlowTransform(d3Selection.property("__zoom"));
          const { onViewportChangeStart, onViewportChange, onViewportChangeEnd } = store.getState();
          clearTimeout(panScrollTimeout.current);
          if (!isPanScrolling.current) {
            isPanScrolling.current = true;
            onMoveStart?.(event, nextViewport);
            onViewportChangeStart?.(nextViewport);
          }
          if (isPanScrolling.current) {
            onMove?.(event, nextViewport);
            onViewportChange?.(nextViewport);
            panScrollTimeout.current = setTimeout(() => {
              onMoveEnd?.(event, nextViewport);
              onViewportChangeEnd?.(nextViewport);
              isPanScrolling.current = false;
            }, 150);
          }
        }, { passive: false });
      } else if (typeof d3ZoomHandler !== "undefined") {
        d3Selection.on("wheel.zoom", function(event, d) {
          const invalidEvent = !preventScrolling && event.type === "wheel" && !event.ctrlKey;
          if (invalidEvent || isWrappedWithClass(event, noWheelClassName)) {
            return null;
          }
          event.preventDefault();
          d3ZoomHandler.call(this, event, d);
        }, { passive: false });
      }
    }
  }, [
    userSelectionActive,
    panOnScroll,
    panOnScrollMode,
    d3Selection,
    d3Zoom,
    d3ZoomHandler,
    zoomActivationKeyPressed,
    zoomOnPinch,
    preventScrolling,
    noWheelClassName,
    onMoveStart,
    onMove,
    onMoveEnd
  ]);
  useEffect$b(() => {
    if (d3Zoom) {
      d3Zoom.on("start", (event) => {
        if (!event.sourceEvent || event.sourceEvent.internal) {
          return null;
        }
        mouseButton.current = event.sourceEvent?.button;
        const { onViewportChangeStart } = store.getState();
        const flowTransform = eventToFlowTransform(event.transform);
        isZoomingOrPanning.current = true;
        prevTransform.current = flowTransform;
        if (event.sourceEvent?.type === "mousedown") {
          store.setState({ paneDragging: true });
        }
        onViewportChangeStart?.(flowTransform);
        onMoveStart?.(event.sourceEvent, flowTransform);
      });
    }
  }, [d3Zoom, onMoveStart]);
  useEffect$b(() => {
    if (d3Zoom) {
      if (userSelectionActive && !isZoomingOrPanning.current) {
        d3Zoom.on("zoom", null);
      } else if (!userSelectionActive) {
        d3Zoom.on("zoom", (event) => {
          const { onViewportChange } = store.getState();
          store.setState({ transform: [event.transform.x, event.transform.y, event.transform.k] });
          zoomedWithRightMouseButton.current = !!(onPaneContextMenu && isRightClickPan(panOnDrag, mouseButton.current ?? 0));
          if ((onMove || onViewportChange) && !event.sourceEvent?.internal) {
            const flowTransform = eventToFlowTransform(event.transform);
            onViewportChange?.(flowTransform);
            onMove?.(event.sourceEvent, flowTransform);
          }
        });
      }
    }
  }, [userSelectionActive, d3Zoom, onMove, panOnDrag, onPaneContextMenu]);
  useEffect$b(() => {
    if (d3Zoom) {
      d3Zoom.on("end", (event) => {
        if (!event.sourceEvent || event.sourceEvent.internal) {
          return null;
        }
        const { onViewportChangeEnd } = store.getState();
        isZoomingOrPanning.current = false;
        store.setState({ paneDragging: false });
        if (onPaneContextMenu && isRightClickPan(panOnDrag, mouseButton.current ?? 0) && !zoomedWithRightMouseButton.current) {
          onPaneContextMenu(event.sourceEvent);
        }
        zoomedWithRightMouseButton.current = false;
        if ((onMoveEnd || onViewportChangeEnd) && viewChanged(prevTransform.current, event.transform)) {
          const flowTransform = eventToFlowTransform(event.transform);
          prevTransform.current = flowTransform;
          clearTimeout(timerId.current);
          timerId.current = setTimeout(() => {
            onViewportChangeEnd?.(flowTransform);
            onMoveEnd?.(event.sourceEvent, flowTransform);
          }, panOnScroll ? 150 : 0);
        }
      });
    }
  }, [d3Zoom, panOnScroll, panOnDrag, onMoveEnd, onPaneContextMenu]);
  useEffect$b(() => {
    if (d3Zoom) {
      d3Zoom.filter((event) => {
        const zoomScroll = zoomActivationKeyPressed || zoomOnScroll;
        const pinchZoom = zoomOnPinch && event.ctrlKey;
        if ((panOnDrag === true || Array.isArray(panOnDrag) && panOnDrag.includes(1)) && event.button === 1 && event.type === "mousedown" && (isWrappedWithClass(event, "react-flow__node") || isWrappedWithClass(event, "react-flow__edge"))) {
          return true;
        }
        if (!panOnDrag && !zoomScroll && !panOnScroll && !zoomOnDoubleClick && !zoomOnPinch) {
          return false;
        }
        if (userSelectionActive) {
          return false;
        }
        if (!zoomOnDoubleClick && event.type === "dblclick") {
          return false;
        }
        if (isWrappedWithClass(event, noWheelClassName) && event.type === "wheel") {
          return false;
        }
        if (isWrappedWithClass(event, noPanClassName) && (event.type !== "wheel" || panOnScroll && event.type === "wheel" && !zoomActivationKeyPressed)) {
          return false;
        }
        if (!zoomOnPinch && event.ctrlKey && event.type === "wheel") {
          return false;
        }
        if (!zoomScroll && !panOnScroll && !pinchZoom && event.type === "wheel") {
          return false;
        }
        if (!panOnDrag && (event.type === "mousedown" || event.type === "touchstart")) {
          return false;
        }
        if (Array.isArray(panOnDrag) && !panOnDrag.includes(event.button) && event.type === "mousedown") {
          return false;
        }
        const buttonAllowed = Array.isArray(panOnDrag) && panOnDrag.includes(event.button) || !event.button || event.button <= 1;
        return (!event.ctrlKey || event.type === "wheel") && buttonAllowed;
      });
    }
  }, [
    userSelectionActive,
    d3Zoom,
    zoomOnScroll,
    zoomOnPinch,
    panOnScroll,
    zoomOnDoubleClick,
    panOnDrag,
    elementsSelectable,
    zoomActivationKeyPressed
  ]);
  return React$o.createElement("div", { className: "react-flow__renderer", ref: zoomPane, style: containerStyle }, children);
};
const selector$9 = (s) => ({
  userSelectionActive: s.userSelectionActive,
  userSelectionRect: s.userSelectionRect
});
function UserSelection() {
  const { userSelectionActive, userSelectionRect } = useStore(selector$9, shallow$1);
  const isActive = userSelectionActive && userSelectionRect;
  if (!isActive) {
    return null;
  }
  return React$o.createElement("div", { className: "react-flow__selection react-flow__container", style: {
    width: userSelectionRect.width,
    height: userSelectionRect.height,
    transform: `translate(${userSelectionRect.x}px, ${userSelectionRect.y}px)`
  } });
}
function handleParentExpand(res, updateItem) {
  const parentId = updateItem.parentNode || updateItem.parentId;
  const parent = res.find((e) => e.id === parentId);
  if (parent) {
    const extendWidth = updateItem.position.x + updateItem.width - parent.width;
    const extendHeight = updateItem.position.y + updateItem.height - parent.height;
    if (extendWidth > 0 || extendHeight > 0 || updateItem.position.x < 0 || updateItem.position.y < 0) {
      parent.style = { ...parent.style };
      parent.style.width = parent.style.width ?? parent.width;
      parent.style.height = parent.style.height ?? parent.height;
      if (extendWidth > 0) {
        parent.style.width += extendWidth;
      }
      if (extendHeight > 0) {
        parent.style.height += extendHeight;
      }
      if (updateItem.position.x < 0) {
        const xDiff = Math.abs(updateItem.position.x);
        parent.position.x = parent.position.x - xDiff;
        parent.style.width += xDiff;
        updateItem.position.x = 0;
      }
      if (updateItem.position.y < 0) {
        const yDiff = Math.abs(updateItem.position.y);
        parent.position.y = parent.position.y - yDiff;
        parent.style.height += yDiff;
        updateItem.position.y = 0;
      }
      parent.width = parent.style.width;
      parent.height = parent.style.height;
    }
  }
}
function applyChanges(changes, elements) {
  if (changes.some((c) => c.type === "reset")) {
    return changes.filter((c) => c.type === "reset").map((c) => c.item);
  }
  const initElements = changes.filter((c) => c.type === "add").map((c) => c.item);
  return elements.reduce((res, item) => {
    const currentChanges = changes.filter((c) => c.id === item.id);
    if (currentChanges.length === 0) {
      res.push(item);
      return res;
    }
    const updateItem = { ...item };
    for (const currentChange of currentChanges) {
      if (currentChange) {
        switch (currentChange.type) {
          case "select": {
            updateItem.selected = currentChange.selected;
            break;
          }
          case "position": {
            if (typeof currentChange.position !== "undefined") {
              updateItem.position = currentChange.position;
            }
            if (typeof currentChange.positionAbsolute !== "undefined") {
              updateItem.positionAbsolute = currentChange.positionAbsolute;
            }
            if (typeof currentChange.dragging !== "undefined") {
              updateItem.dragging = currentChange.dragging;
            }
            if (updateItem.expandParent) {
              handleParentExpand(res, updateItem);
            }
            break;
          }
          case "dimensions": {
            if (typeof currentChange.dimensions !== "undefined") {
              updateItem.width = currentChange.dimensions.width;
              updateItem.height = currentChange.dimensions.height;
            }
            if (typeof currentChange.updateStyle !== "undefined") {
              updateItem.style = { ...updateItem.style || {}, ...currentChange.dimensions };
            }
            if (typeof currentChange.resizing === "boolean") {
              updateItem.resizing = currentChange.resizing;
            }
            if (updateItem.expandParent) {
              handleParentExpand(res, updateItem);
            }
            break;
          }
          case "remove": {
            return res;
          }
        }
      }
    }
    res.push(updateItem);
    return res;
  }, initElements);
}
function applyNodeChanges(changes, nodes) {
  return applyChanges(changes, nodes);
}
function applyEdgeChanges(changes, edges) {
  return applyChanges(changes, edges);
}
const createSelectionChange = (id, selected) => ({
  id,
  type: "select",
  selected
});
function getSelectionChanges(items, selectedIds) {
  return items.reduce((res, item) => {
    const willBeSelected = selectedIds.includes(item.id);
    if (!item.selected && willBeSelected) {
      item.selected = true;
      res.push(createSelectionChange(item.id, true));
    } else if (item.selected && !willBeSelected) {
      item.selected = false;
      res.push(createSelectionChange(item.id, false));
    }
    return res;
  }, []);
}
const wrapHandler = (handler, containerRef) => {
  return (event) => {
    if (event.target !== containerRef.current) {
      return;
    }
    handler?.(event);
  };
};
const selector$8 = (s) => ({
  userSelectionActive: s.userSelectionActive,
  elementsSelectable: s.elementsSelectable,
  dragging: s.paneDragging
});
const Pane = memo$g(({ isSelecting, selectionMode = SelectionMode.Full, panOnDrag, onSelectionStart, onSelectionEnd, onPaneClick, onPaneContextMenu, onPaneScroll, onPaneMouseEnter, onPaneMouseMove, onPaneMouseLeave, children }) => {
  const container = useRef$8(null);
  const store = useStoreApi();
  const prevSelectedNodesCount = useRef$8(0);
  const prevSelectedEdgesCount = useRef$8(0);
  const containerBounds = useRef$8();
  const { userSelectionActive, elementsSelectable, dragging } = useStore(selector$8, shallow$1);
  const resetUserSelection = () => {
    store.setState({ userSelectionActive: false, userSelectionRect: null });
    prevSelectedNodesCount.current = 0;
    prevSelectedEdgesCount.current = 0;
  };
  const onClick = (event) => {
    onPaneClick?.(event);
    store.getState().resetSelectedElements();
    store.setState({ nodesSelectionActive: false });
  };
  const onContextMenu = (event) => {
    if (Array.isArray(panOnDrag) && panOnDrag?.includes(2)) {
      event.preventDefault();
      return;
    }
    onPaneContextMenu?.(event);
  };
  const onWheel = onPaneScroll ? (event) => onPaneScroll(event) : void 0;
  const onMouseDown = (event) => {
    const { resetSelectedElements, domNode } = store.getState();
    containerBounds.current = domNode?.getBoundingClientRect();
    if (!elementsSelectable || !isSelecting || event.button !== 0 || event.target !== container.current || !containerBounds.current) {
      return;
    }
    const { x, y } = getEventPosition(event, containerBounds.current);
    resetSelectedElements();
    store.setState({
      userSelectionRect: {
        width: 0,
        height: 0,
        startX: x,
        startY: y,
        x,
        y
      }
    });
    onSelectionStart?.(event);
  };
  const onMouseMove = (event) => {
    const { userSelectionRect, nodeInternals, edges, transform, onNodesChange, onEdgesChange, nodeOrigin, getNodes } = store.getState();
    if (!isSelecting || !containerBounds.current || !userSelectionRect) {
      return;
    }
    store.setState({ userSelectionActive: true, nodesSelectionActive: false });
    const mousePos = getEventPosition(event, containerBounds.current);
    const startX = userSelectionRect.startX ?? 0;
    const startY = userSelectionRect.startY ?? 0;
    const nextUserSelectRect = {
      ...userSelectionRect,
      x: mousePos.x < startX ? mousePos.x : startX,
      y: mousePos.y < startY ? mousePos.y : startY,
      width: Math.abs(mousePos.x - startX),
      height: Math.abs(mousePos.y - startY)
    };
    const nodes = getNodes();
    const selectedNodes = getNodesInside(nodeInternals, nextUserSelectRect, transform, selectionMode === SelectionMode.Partial, true, nodeOrigin);
    const selectedEdgeIds = getConnectedEdges(selectedNodes, edges).map((e) => e.id);
    const selectedNodeIds = selectedNodes.map((n) => n.id);
    if (prevSelectedNodesCount.current !== selectedNodeIds.length) {
      prevSelectedNodesCount.current = selectedNodeIds.length;
      const changes = getSelectionChanges(nodes, selectedNodeIds);
      if (changes.length) {
        onNodesChange?.(changes);
      }
    }
    if (prevSelectedEdgesCount.current !== selectedEdgeIds.length) {
      prevSelectedEdgesCount.current = selectedEdgeIds.length;
      const changes = getSelectionChanges(edges, selectedEdgeIds);
      if (changes.length) {
        onEdgesChange?.(changes);
      }
    }
    store.setState({
      userSelectionRect: nextUserSelectRect
    });
  };
  const onMouseUp = (event) => {
    if (event.button !== 0) {
      return;
    }
    const { userSelectionRect } = store.getState();
    if (!userSelectionActive && userSelectionRect && event.target === container.current) {
      onClick?.(event);
    }
    store.setState({ nodesSelectionActive: prevSelectedNodesCount.current > 0 });
    resetUserSelection();
    onSelectionEnd?.(event);
  };
  const onMouseLeave = (event) => {
    if (userSelectionActive) {
      store.setState({ nodesSelectionActive: prevSelectedNodesCount.current > 0 });
      onSelectionEnd?.(event);
    }
    resetUserSelection();
  };
  const hasActiveSelection = elementsSelectable && (isSelecting || userSelectionActive);
  return React$o.createElement(
    "div",
    { className: cc(["react-flow__pane", { dragging, selection: isSelecting }]), onClick: hasActiveSelection ? void 0 : wrapHandler(onClick, container), onContextMenu: wrapHandler(onContextMenu, container), onWheel: wrapHandler(onWheel, container), onMouseEnter: hasActiveSelection ? void 0 : onPaneMouseEnter, onMouseDown: hasActiveSelection ? onMouseDown : void 0, onMouseMove: hasActiveSelection ? onMouseMove : onPaneMouseMove, onMouseUp: hasActiveSelection ? onMouseUp : void 0, onMouseLeave: hasActiveSelection ? onMouseLeave : onPaneMouseLeave, ref: container, style: containerStyle },
    children,
    React$o.createElement(UserSelection, null)
  );
});
Pane.displayName = "Pane";
function isParentSelected(node, nodeInternals) {
  const parentId = node.parentNode || node.parentId;
  if (!parentId) {
    return false;
  }
  const parentNode = nodeInternals.get(parentId);
  if (!parentNode) {
    return false;
  }
  if (parentNode.selected) {
    return true;
  }
  return isParentSelected(parentNode, nodeInternals);
}
function hasSelector(target, selector2, nodeRef) {
  let current = target;
  do {
    if (current?.matches(selector2))
      return true;
    if (current === nodeRef.current)
      return false;
    current = current.parentElement;
  } while (current);
  return false;
}
function getDragItems(nodeInternals, nodesDraggable, mousePos, nodeId) {
  return Array.from(nodeInternals.values()).filter((n) => (n.selected || n.id === nodeId) && (!n.parentNode || n.parentId || !isParentSelected(n, nodeInternals)) && (n.draggable || nodesDraggable && typeof n.draggable === "undefined")).map((n) => ({
    id: n.id,
    position: n.position || { x: 0, y: 0 },
    positionAbsolute: n.positionAbsolute || { x: 0, y: 0 },
    distance: {
      x: mousePos.x - (n.positionAbsolute?.x ?? 0),
      y: mousePos.y - (n.positionAbsolute?.y ?? 0)
    },
    delta: {
      x: 0,
      y: 0
    },
    extent: n.extent,
    parentNode: n.parentNode || n.parentId,
    parentId: n.parentNode || n.parentId,
    width: n.width,
    height: n.height,
    expandParent: n.expandParent
  }));
}
function clampNodeExtent(node, extent) {
  if (!extent || extent === "parent") {
    return extent;
  }
  return [extent[0], [extent[1][0] - (node.width || 0), extent[1][1] - (node.height || 0)]];
}
function calcNextPosition(node, nextPosition, nodeInternals, nodeExtent, nodeOrigin = [0, 0], onError) {
  const clampedNodeExtent = clampNodeExtent(node, node.extent || nodeExtent);
  let currentExtent = clampedNodeExtent;
  const parentId = node.parentNode || node.parentId;
  if (node.extent === "parent" && !node.expandParent) {
    if (parentId && node.width && node.height) {
      const parent = nodeInternals.get(parentId);
      const { x: parentX, y: parentY } = getNodePositionWithOrigin(parent, nodeOrigin).positionAbsolute;
      currentExtent = parent && isNumeric(parentX) && isNumeric(parentY) && isNumeric(parent.width) && isNumeric(parent.height) ? [
        [parentX + node.width * nodeOrigin[0], parentY + node.height * nodeOrigin[1]],
        [
          parentX + parent.width - node.width + node.width * nodeOrigin[0],
          parentY + parent.height - node.height + node.height * nodeOrigin[1]
        ]
      ] : currentExtent;
    } else {
      onError?.("005", errorMessages["error005"]());
      currentExtent = clampedNodeExtent;
    }
  } else if (node.extent && parentId && node.extent !== "parent") {
    const parent = nodeInternals.get(parentId);
    const { x: parentX, y: parentY } = getNodePositionWithOrigin(parent, nodeOrigin).positionAbsolute;
    currentExtent = [
      [node.extent[0][0] + parentX, node.extent[0][1] + parentY],
      [node.extent[1][0] + parentX, node.extent[1][1] + parentY]
    ];
  }
  let parentPosition = { x: 0, y: 0 };
  if (parentId) {
    const parentNode = nodeInternals.get(parentId);
    parentPosition = getNodePositionWithOrigin(parentNode, nodeOrigin).positionAbsolute;
  }
  const positionAbsolute = currentExtent && currentExtent !== "parent" ? clampPosition(nextPosition, currentExtent) : nextPosition;
  return {
    position: {
      x: positionAbsolute.x - parentPosition.x,
      y: positionAbsolute.y - parentPosition.y
    },
    positionAbsolute
  };
}
function getEventHandlerParams({ nodeId, dragItems, nodeInternals }) {
  const extentedDragItems = dragItems.map((n) => {
    const node = nodeInternals.get(n.id);
    return {
      ...node,
      position: n.position,
      positionAbsolute: n.positionAbsolute
    };
  });
  return [nodeId ? extentedDragItems.find((n) => n.id === nodeId) : extentedDragItems[0], extentedDragItems];
}
const getHandleBounds = (selector2, nodeElement, zoom2, nodeOrigin) => {
  const handles = nodeElement.querySelectorAll(selector2);
  if (!handles || !handles.length) {
    return null;
  }
  const handlesArray = Array.from(handles);
  const nodeBounds = nodeElement.getBoundingClientRect();
  const nodeOffset = {
    x: nodeBounds.width * nodeOrigin[0],
    y: nodeBounds.height * nodeOrigin[1]
  };
  return handlesArray.map((handle) => {
    const handleBounds = handle.getBoundingClientRect();
    return {
      id: handle.getAttribute("data-handleid"),
      position: handle.getAttribute("data-handlepos"),
      x: (handleBounds.left - nodeBounds.left - nodeOffset.x) / zoom2,
      y: (handleBounds.top - nodeBounds.top - nodeOffset.y) / zoom2,
      ...getDimensions(handle)
    };
  });
};
function getMouseHandler(id, getState, handler) {
  return handler === void 0 ? handler : (event) => {
    const node = getState().nodeInternals.get(id);
    if (node) {
      handler(event, { ...node });
    }
  };
}
function handleNodeClick({ id, store, unselect = false, nodeRef }) {
  const { addSelectedNodes, unselectNodesAndEdges, multiSelectionActive, nodeInternals, onError } = store.getState();
  const node = nodeInternals.get(id);
  if (!node) {
    onError?.("012", errorMessages["error012"](id));
    return;
  }
  store.setState({ nodesSelectionActive: false });
  if (!node.selected) {
    addSelectedNodes([id]);
  } else if (unselect || node.selected && multiSelectionActive) {
    unselectNodesAndEdges({ nodes: [node], edges: [] });
    requestAnimationFrame(() => nodeRef?.current?.blur());
  }
}
function useGetPointerPosition() {
  const store = useStoreApi();
  const getPointerPosition = useCallback$9(({ sourceEvent }) => {
    const { transform, snapGrid, snapToGrid } = store.getState();
    const x = sourceEvent.touches ? sourceEvent.touches[0].clientX : sourceEvent.clientX;
    const y = sourceEvent.touches ? sourceEvent.touches[0].clientY : sourceEvent.clientY;
    const pointerPos = {
      x: (x - transform[0]) / transform[2],
      y: (y - transform[1]) / transform[2]
    };
    return {
      xSnapped: snapToGrid ? snapGrid[0] * Math.round(pointerPos.x / snapGrid[0]) : pointerPos.x,
      ySnapped: snapToGrid ? snapGrid[1] * Math.round(pointerPos.y / snapGrid[1]) : pointerPos.y,
      ...pointerPos
    };
  }, []);
  return getPointerPosition;
}
function wrapSelectionDragFunc(selectionFunc) {
  return (event, _, nodes) => selectionFunc?.(event, nodes);
}
function useDrag({ nodeRef, disabled = false, noDragClassName, handleSelector, nodeId, isSelectable, selectNodesOnDrag }) {
  const store = useStoreApi();
  const [dragging, setDragging] = useState$h(false);
  const dragItems = useRef$8([]);
  const lastPos = useRef$8({ x: null, y: null });
  const autoPanId = useRef$8(0);
  const containerBounds = useRef$8(null);
  const mousePosition = useRef$8({ x: 0, y: 0 });
  const dragEvent = useRef$8(null);
  const autoPanStarted = useRef$8(false);
  const dragStarted = useRef$8(false);
  const abortDrag = useRef$8(false);
  const getPointerPosition = useGetPointerPosition();
  useEffect$b(() => {
    if (nodeRef?.current) {
      const selection = select(nodeRef.current);
      const updateNodes = ({ x, y }) => {
        const { nodeInternals, onNodeDrag, onSelectionDrag, updateNodePositions, nodeExtent, snapGrid, snapToGrid, nodeOrigin, onError } = store.getState();
        lastPos.current = { x, y };
        let hasChange = false;
        let nodesBox = { x: 0, y: 0, x2: 0, y2: 0 };
        if (dragItems.current.length > 1 && nodeExtent) {
          const rect = getNodesBounds(dragItems.current, nodeOrigin);
          nodesBox = rectToBox(rect);
        }
        dragItems.current = dragItems.current.map((n) => {
          const nextPosition = { x: x - n.distance.x, y: y - n.distance.y };
          if (snapToGrid) {
            nextPosition.x = snapGrid[0] * Math.round(nextPosition.x / snapGrid[0]);
            nextPosition.y = snapGrid[1] * Math.round(nextPosition.y / snapGrid[1]);
          }
          const adjustedNodeExtent = [
            [nodeExtent[0][0], nodeExtent[0][1]],
            [nodeExtent[1][0], nodeExtent[1][1]]
          ];
          if (dragItems.current.length > 1 && nodeExtent && !n.extent) {
            adjustedNodeExtent[0][0] = n.positionAbsolute.x - nodesBox.x + nodeExtent[0][0];
            adjustedNodeExtent[1][0] = n.positionAbsolute.x + (n.width ?? 0) - nodesBox.x2 + nodeExtent[1][0];
            adjustedNodeExtent[0][1] = n.positionAbsolute.y - nodesBox.y + nodeExtent[0][1];
            adjustedNodeExtent[1][1] = n.positionAbsolute.y + (n.height ?? 0) - nodesBox.y2 + nodeExtent[1][1];
          }
          const updatedPos = calcNextPosition(n, nextPosition, nodeInternals, adjustedNodeExtent, nodeOrigin, onError);
          hasChange = hasChange || n.position.x !== updatedPos.position.x || n.position.y !== updatedPos.position.y;
          n.position = updatedPos.position;
          n.positionAbsolute = updatedPos.positionAbsolute;
          return n;
        });
        if (!hasChange) {
          return;
        }
        updateNodePositions(dragItems.current, true, true);
        setDragging(true);
        const onDrag = nodeId ? onNodeDrag : wrapSelectionDragFunc(onSelectionDrag);
        if (onDrag && dragEvent.current) {
          const [currentNode, nodes] = getEventHandlerParams({
            nodeId,
            dragItems: dragItems.current,
            nodeInternals
          });
          onDrag(dragEvent.current, currentNode, nodes);
        }
      };
      const autoPan = () => {
        if (!containerBounds.current) {
          return;
        }
        const [xMovement, yMovement] = calcAutoPan(mousePosition.current, containerBounds.current);
        if (xMovement !== 0 || yMovement !== 0) {
          const { transform, panBy } = store.getState();
          lastPos.current.x = (lastPos.current.x ?? 0) - xMovement / transform[2];
          lastPos.current.y = (lastPos.current.y ?? 0) - yMovement / transform[2];
          if (panBy({ x: xMovement, y: yMovement })) {
            updateNodes(lastPos.current);
          }
        }
        autoPanId.current = requestAnimationFrame(autoPan);
      };
      const startDrag = (event) => {
        const { nodeInternals, multiSelectionActive, nodesDraggable, unselectNodesAndEdges, onNodeDragStart, onSelectionDragStart } = store.getState();
        dragStarted.current = true;
        const onStart = nodeId ? onNodeDragStart : wrapSelectionDragFunc(onSelectionDragStart);
        if ((!selectNodesOnDrag || !isSelectable) && !multiSelectionActive && nodeId) {
          if (!nodeInternals.get(nodeId)?.selected) {
            unselectNodesAndEdges();
          }
        }
        if (nodeId && isSelectable && selectNodesOnDrag) {
          handleNodeClick({
            id: nodeId,
            store,
            nodeRef
          });
        }
        const pointerPos = getPointerPosition(event);
        lastPos.current = pointerPos;
        dragItems.current = getDragItems(nodeInternals, nodesDraggable, pointerPos, nodeId);
        if (onStart && dragItems.current) {
          const [currentNode, nodes] = getEventHandlerParams({
            nodeId,
            dragItems: dragItems.current,
            nodeInternals
          });
          onStart(event.sourceEvent, currentNode, nodes);
        }
      };
      if (disabled) {
        selection.on(".drag", null);
      } else {
        const dragHandler = drag().on("start", (event) => {
          const { domNode, nodeDragThreshold } = store.getState();
          if (nodeDragThreshold === 0) {
            startDrag(event);
          }
          abortDrag.current = false;
          const pointerPos = getPointerPosition(event);
          lastPos.current = pointerPos;
          containerBounds.current = domNode?.getBoundingClientRect() || null;
          mousePosition.current = getEventPosition(event.sourceEvent, containerBounds.current);
        }).on("drag", (event) => {
          const pointerPos = getPointerPosition(event);
          const { autoPanOnNodeDrag, nodeDragThreshold } = store.getState();
          if (event.sourceEvent.type === "touchmove" && event.sourceEvent.touches.length > 1) {
            abortDrag.current = true;
          }
          if (abortDrag.current) {
            return;
          }
          if (!autoPanStarted.current && dragStarted.current && autoPanOnNodeDrag) {
            autoPanStarted.current = true;
            autoPan();
          }
          if (!dragStarted.current) {
            const x = pointerPos.xSnapped - (lastPos?.current?.x ?? 0);
            const y = pointerPos.ySnapped - (lastPos?.current?.y ?? 0);
            const distance2 = Math.sqrt(x * x + y * y);
            if (distance2 > nodeDragThreshold) {
              startDrag(event);
            }
          }
          if ((lastPos.current.x !== pointerPos.xSnapped || lastPos.current.y !== pointerPos.ySnapped) && dragItems.current && dragStarted.current) {
            dragEvent.current = event.sourceEvent;
            mousePosition.current = getEventPosition(event.sourceEvent, containerBounds.current);
            updateNodes(pointerPos);
          }
        }).on("end", (event) => {
          if (!dragStarted.current || abortDrag.current) {
            return;
          }
          setDragging(false);
          autoPanStarted.current = false;
          dragStarted.current = false;
          cancelAnimationFrame(autoPanId.current);
          if (dragItems.current) {
            const { updateNodePositions, nodeInternals, onNodeDragStop, onSelectionDragStop } = store.getState();
            const onStop = nodeId ? onNodeDragStop : wrapSelectionDragFunc(onSelectionDragStop);
            updateNodePositions(dragItems.current, false, false);
            if (onStop) {
              const [currentNode, nodes] = getEventHandlerParams({
                nodeId,
                dragItems: dragItems.current,
                nodeInternals
              });
              onStop(event.sourceEvent, currentNode, nodes);
            }
          }
        }).filter((event) => {
          const target = event.target;
          const isDraggable = !event.button && (!noDragClassName || !hasSelector(target, `.${noDragClassName}`, nodeRef)) && (!handleSelector || hasSelector(target, handleSelector, nodeRef));
          return isDraggable;
        });
        selection.call(dragHandler);
        return () => {
          selection.on(".drag", null);
        };
      }
    }
  }, [
    nodeRef,
    disabled,
    noDragClassName,
    handleSelector,
    isSelectable,
    store,
    nodeId,
    selectNodesOnDrag,
    getPointerPosition
  ]);
  return dragging;
}
function useUpdateNodePositions() {
  const store = useStoreApi();
  const updatePositions = useCallback$9((params) => {
    const { nodeInternals, nodeExtent, updateNodePositions, getNodes, snapToGrid, snapGrid, onError, nodesDraggable } = store.getState();
    const selectedNodes = getNodes().filter((n) => n.selected && (n.draggable || nodesDraggable && typeof n.draggable === "undefined"));
    const xVelo = snapToGrid ? snapGrid[0] : 5;
    const yVelo = snapToGrid ? snapGrid[1] : 5;
    const factor = params.isShiftPressed ? 4 : 1;
    const positionDiffX = params.x * xVelo * factor;
    const positionDiffY = params.y * yVelo * factor;
    const nodeUpdates = selectedNodes.map((n) => {
      if (n.positionAbsolute) {
        const nextPosition = { x: n.positionAbsolute.x + positionDiffX, y: n.positionAbsolute.y + positionDiffY };
        if (snapToGrid) {
          nextPosition.x = snapGrid[0] * Math.round(nextPosition.x / snapGrid[0]);
          nextPosition.y = snapGrid[1] * Math.round(nextPosition.y / snapGrid[1]);
        }
        const { positionAbsolute, position } = calcNextPosition(n, nextPosition, nodeInternals, nodeExtent, void 0, onError);
        n.position = position;
        n.positionAbsolute = positionAbsolute;
      }
      return n;
    });
    updateNodePositions(nodeUpdates, true, false);
  }, []);
  return updatePositions;
}
const arrowKeyDiffs = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
};
var wrapNode = (NodeComponent) => {
  const NodeWrapper = ({ id, type, data, xPos, yPos, xPosOrigin, yPosOrigin, selected, onClick, onMouseEnter, onMouseMove, onMouseLeave, onContextMenu, onDoubleClick, style: style2, className, isDraggable, isSelectable, isConnectable, isFocusable, selectNodesOnDrag, sourcePosition, targetPosition, hidden, resizeObserver, dragHandle, zIndex, isParent, noDragClassName, noPanClassName, initialized, disableKeyboardA11y, ariaLabel, rfId, hasHandleBounds }) => {
    const store = useStoreApi();
    const nodeRef = useRef$8(null);
    const prevNodeRef = useRef$8(null);
    const prevSourcePosition = useRef$8(sourcePosition);
    const prevTargetPosition = useRef$8(targetPosition);
    const prevType = useRef$8(type);
    const hasPointerEvents = isSelectable || isDraggable || onClick || onMouseEnter || onMouseMove || onMouseLeave;
    const updatePositions = useUpdateNodePositions();
    const onMouseEnterHandler = getMouseHandler(id, store.getState, onMouseEnter);
    const onMouseMoveHandler = getMouseHandler(id, store.getState, onMouseMove);
    const onMouseLeaveHandler = getMouseHandler(id, store.getState, onMouseLeave);
    const onContextMenuHandler = getMouseHandler(id, store.getState, onContextMenu);
    const onDoubleClickHandler = getMouseHandler(id, store.getState, onDoubleClick);
    const onSelectNodeHandler = (event) => {
      const { nodeDragThreshold } = store.getState();
      if (isSelectable && (!selectNodesOnDrag || !isDraggable || nodeDragThreshold > 0)) {
        handleNodeClick({
          id,
          store,
          nodeRef
        });
      }
      if (onClick) {
        const node = store.getState().nodeInternals.get(id);
        if (node) {
          onClick(event, { ...node });
        }
      }
    };
    const onKeyDown = (event) => {
      if (isInputDOMNode(event)) {
        return;
      }
      if (disableKeyboardA11y) {
        return;
      }
      if (elementSelectionKeys.includes(event.key) && isSelectable) {
        const unselect = event.key === "Escape";
        handleNodeClick({
          id,
          store,
          unselect,
          nodeRef
        });
      } else if (isDraggable && selected && Object.prototype.hasOwnProperty.call(arrowKeyDiffs, event.key)) {
        store.setState({
          ariaLiveMessage: `Moved selected node ${event.key.replace("Arrow", "").toLowerCase()}. New position, x: ${~~xPos}, y: ${~~yPos}`
        });
        updatePositions({
          x: arrowKeyDiffs[event.key].x,
          y: arrowKeyDiffs[event.key].y,
          isShiftPressed: event.shiftKey
        });
      }
    };
    useEffect$b(() => {
      return () => {
        if (prevNodeRef.current) {
          resizeObserver?.unobserve(prevNodeRef.current);
          prevNodeRef.current = null;
        }
      };
    }, []);
    useEffect$b(() => {
      if (nodeRef.current && !hidden) {
        const currNode = nodeRef.current;
        if (!initialized || !hasHandleBounds || prevNodeRef.current !== currNode) {
          if (prevNodeRef.current) {
            resizeObserver?.unobserve(prevNodeRef.current);
          }
          resizeObserver?.observe(currNode);
          prevNodeRef.current = currNode;
        }
      }
    }, [hidden, initialized, hasHandleBounds]);
    useEffect$b(() => {
      const typeChanged = prevType.current !== type;
      const sourcePosChanged = prevSourcePosition.current !== sourcePosition;
      const targetPosChanged = prevTargetPosition.current !== targetPosition;
      if (nodeRef.current && (typeChanged || sourcePosChanged || targetPosChanged)) {
        if (typeChanged) {
          prevType.current = type;
        }
        if (sourcePosChanged) {
          prevSourcePosition.current = sourcePosition;
        }
        if (targetPosChanged) {
          prevTargetPosition.current = targetPosition;
        }
        store.getState().updateNodeDimensions([{ id, nodeElement: nodeRef.current, forceUpdate: true }]);
      }
    }, [id, type, sourcePosition, targetPosition]);
    const dragging = useDrag({
      nodeRef,
      disabled: hidden || !isDraggable,
      noDragClassName,
      handleSelector: dragHandle,
      nodeId: id,
      isSelectable,
      selectNodesOnDrag
    });
    if (hidden) {
      return null;
    }
    return React$o.createElement(
      "div",
      { className: cc([
        "react-flow__node",
        `react-flow__node-${type}`,
        {
          // this is overwritable by passing `nopan` as a class name
          [noPanClassName]: isDraggable
        },
        className,
        {
          selected,
          selectable: isSelectable,
          parent: isParent,
          dragging
        }
      ]), ref: nodeRef, style: {
        zIndex,
        transform: `translate(${xPosOrigin}px,${yPosOrigin}px)`,
        pointerEvents: hasPointerEvents ? "all" : "none",
        visibility: initialized ? "visible" : "hidden",
        ...style2
      }, "data-id": id, "data-testid": `rf__node-${id}`, onMouseEnter: onMouseEnterHandler, onMouseMove: onMouseMoveHandler, onMouseLeave: onMouseLeaveHandler, onContextMenu: onContextMenuHandler, onClick: onSelectNodeHandler, onDoubleClick: onDoubleClickHandler, onKeyDown: isFocusable ? onKeyDown : void 0, tabIndex: isFocusable ? 0 : void 0, role: isFocusable ? "button" : void 0, "aria-describedby": disableKeyboardA11y ? void 0 : `${ARIA_NODE_DESC_KEY}-${rfId}`, "aria-label": ariaLabel },
      React$o.createElement(
        Provider,
        { value: id },
        React$o.createElement(NodeComponent, { id, data, type, xPos, yPos, selected, isConnectable, sourcePosition, targetPosition, dragging, dragHandle, zIndex })
      )
    );
  };
  NodeWrapper.displayName = "NodeWrapper";
  return memo$g(NodeWrapper);
};
const selector$7 = (s) => {
  const selectedNodes = s.getNodes().filter((n) => n.selected);
  return {
    ...getNodesBounds(selectedNodes, s.nodeOrigin),
    transformString: `translate(${s.transform[0]}px,${s.transform[1]}px) scale(${s.transform[2]})`,
    userSelectionActive: s.userSelectionActive
  };
};
function NodesSelection({ onSelectionContextMenu, noPanClassName, disableKeyboardA11y }) {
  const store = useStoreApi();
  const { width, height, x: left, y: top, transformString, userSelectionActive } = useStore(selector$7, shallow$1);
  const updatePositions = useUpdateNodePositions();
  const nodeRef = useRef$8(null);
  useEffect$b(() => {
    if (!disableKeyboardA11y) {
      nodeRef.current?.focus({
        preventScroll: true
      });
    }
  }, [disableKeyboardA11y]);
  useDrag({
    nodeRef
  });
  if (userSelectionActive || !width || !height) {
    return null;
  }
  const onContextMenu = onSelectionContextMenu ? (event) => {
    const selectedNodes = store.getState().getNodes().filter((n) => n.selected);
    onSelectionContextMenu(event, selectedNodes);
  } : void 0;
  const onKeyDown = (event) => {
    if (Object.prototype.hasOwnProperty.call(arrowKeyDiffs, event.key)) {
      updatePositions({
        x: arrowKeyDiffs[event.key].x,
        y: arrowKeyDiffs[event.key].y,
        isShiftPressed: event.shiftKey
      });
    }
  };
  return React$o.createElement(
    "div",
    { className: cc(["react-flow__nodesselection", "react-flow__container", noPanClassName]), style: {
      transform: transformString
    } },
    React$o.createElement("div", { ref: nodeRef, className: "react-flow__nodesselection-rect", onContextMenu, tabIndex: disableKeyboardA11y ? void 0 : -1, onKeyDown: disableKeyboardA11y ? void 0 : onKeyDown, style: {
      width,
      height,
      top,
      left
    } })
  );
}
var NodesSelection$1 = memo$g(NodesSelection);
const selector$6 = (s) => s.nodesSelectionActive;
const FlowRenderer = ({ children, onPaneClick, onPaneMouseEnter, onPaneMouseMove, onPaneMouseLeave, onPaneContextMenu, onPaneScroll, deleteKeyCode, onMove, onMoveStart, onMoveEnd, selectionKeyCode, selectionOnDrag, selectionMode, onSelectionStart, onSelectionEnd, multiSelectionKeyCode, panActivationKeyCode, zoomActivationKeyCode, elementsSelectable, zoomOnScroll, zoomOnPinch, panOnScroll: _panOnScroll, panOnScrollSpeed, panOnScrollMode, zoomOnDoubleClick, panOnDrag: _panOnDrag, defaultViewport, translateExtent, minZoom, maxZoom, preventScrolling, onSelectionContextMenu, noWheelClassName, noPanClassName, disableKeyboardA11y }) => {
  const nodesSelectionActive = useStore(selector$6);
  const selectionKeyPressed = useKeyPress(selectionKeyCode);
  const panActivationKeyPressed = useKeyPress(panActivationKeyCode);
  const panOnDrag = panActivationKeyPressed || _panOnDrag;
  const panOnScroll = panActivationKeyPressed || _panOnScroll;
  const isSelecting = selectionKeyPressed || selectionOnDrag && panOnDrag !== true;
  useGlobalKeyHandler({ deleteKeyCode, multiSelectionKeyCode });
  return React$o.createElement(
    ZoomPane,
    { onMove, onMoveStart, onMoveEnd, onPaneContextMenu, elementsSelectable, zoomOnScroll, zoomOnPinch, panOnScroll, panOnScrollSpeed, panOnScrollMode, zoomOnDoubleClick, panOnDrag: !selectionKeyPressed && panOnDrag, defaultViewport, translateExtent, minZoom, maxZoom, zoomActivationKeyCode, preventScrolling, noWheelClassName, noPanClassName },
    React$o.createElement(
      Pane,
      { onSelectionStart, onSelectionEnd, onPaneClick, onPaneMouseEnter, onPaneMouseMove, onPaneMouseLeave, onPaneContextMenu, onPaneScroll, panOnDrag, isSelecting: !!isSelecting, selectionMode },
      children,
      nodesSelectionActive && React$o.createElement(NodesSelection$1, { onSelectionContextMenu, noPanClassName, disableKeyboardA11y })
    )
  );
};
FlowRenderer.displayName = "FlowRenderer";
var FlowRenderer$1 = memo$g(FlowRenderer);
function useVisibleNodes(onlyRenderVisible) {
  const nodes = useStore(useCallback$9((s) => onlyRenderVisible ? getNodesInside(s.nodeInternals, { x: 0, y: 0, width: s.width, height: s.height }, s.transform, true) : s.getNodes(), [onlyRenderVisible]));
  return nodes;
}
function createNodeTypes(nodeTypes) {
  const standardTypes = {
    input: wrapNode(nodeTypes.input || InputNode$1),
    default: wrapNode(nodeTypes.default || DefaultNode$1),
    output: wrapNode(nodeTypes.output || OutputNode$1),
    group: wrapNode(nodeTypes.group || GroupNode)
  };
  const wrappedTypes = {};
  const specialTypes = Object.keys(nodeTypes).filter((k) => !["input", "default", "output", "group"].includes(k)).reduce((res, key) => {
    res[key] = wrapNode(nodeTypes[key] || DefaultNode$1);
    return res;
  }, wrappedTypes);
  return {
    ...standardTypes,
    ...specialTypes
  };
}
const getPositionWithOrigin = ({ x, y, width, height, origin }) => {
  if (!width || !height) {
    return { x, y };
  }
  if (origin[0] < 0 || origin[1] < 0 || origin[0] > 1 || origin[1] > 1) {
    return { x, y };
  }
  return {
    x: x - width * origin[0],
    y: y - height * origin[1]
  };
};
const selector$5 = (s) => ({
  nodesDraggable: s.nodesDraggable,
  nodesConnectable: s.nodesConnectable,
  nodesFocusable: s.nodesFocusable,
  elementsSelectable: s.elementsSelectable,
  updateNodeDimensions: s.updateNodeDimensions,
  onError: s.onError
});
const NodeRenderer = (props) => {
  const { nodesDraggable, nodesConnectable, nodesFocusable, elementsSelectable, updateNodeDimensions, onError } = useStore(selector$5, shallow$1);
  const nodes = useVisibleNodes(props.onlyRenderVisibleElements);
  const resizeObserverRef = useRef$8();
  const resizeObserver = useMemo$1(() => {
    if (typeof ResizeObserver === "undefined") {
      return null;
    }
    const observer = new ResizeObserver((entries) => {
      const updates = entries.map((entry) => ({
        id: entry.target.getAttribute("data-id"),
        nodeElement: entry.target,
        forceUpdate: true
      }));
      updateNodeDimensions(updates);
    });
    resizeObserverRef.current = observer;
    return observer;
  }, []);
  useEffect$b(() => {
    return () => {
      resizeObserverRef?.current?.disconnect();
    };
  }, []);
  return React$o.createElement("div", { className: "react-flow__nodes", style: containerStyle }, nodes.map((node) => {
    let nodeType = node.type || "default";
    if (!props.nodeTypes[nodeType]) {
      onError?.("003", errorMessages["error003"](nodeType));
      nodeType = "default";
    }
    const NodeComponent = props.nodeTypes[nodeType] || props.nodeTypes.default;
    const isDraggable = !!(node.draggable || nodesDraggable && typeof node.draggable === "undefined");
    const isSelectable = !!(node.selectable || elementsSelectable && typeof node.selectable === "undefined");
    const isConnectable = !!(node.connectable || nodesConnectable && typeof node.connectable === "undefined");
    const isFocusable = !!(node.focusable || nodesFocusable && typeof node.focusable === "undefined");
    const clampedPosition = props.nodeExtent ? clampPosition(node.positionAbsolute, props.nodeExtent) : node.positionAbsolute;
    const posX = clampedPosition?.x ?? 0;
    const posY = clampedPosition?.y ?? 0;
    const posOrigin = getPositionWithOrigin({
      x: posX,
      y: posY,
      width: node.width ?? 0,
      height: node.height ?? 0,
      origin: props.nodeOrigin
    });
    return React$o.createElement(NodeComponent, { key: node.id, id: node.id, className: node.className, style: node.style, type: nodeType, data: node.data, sourcePosition: node.sourcePosition || Position.Bottom, targetPosition: node.targetPosition || Position.Top, hidden: node.hidden, xPos: posX, yPos: posY, xPosOrigin: posOrigin.x, yPosOrigin: posOrigin.y, selectNodesOnDrag: props.selectNodesOnDrag, onClick: props.onNodeClick, onMouseEnter: props.onNodeMouseEnter, onMouseMove: props.onNodeMouseMove, onMouseLeave: props.onNodeMouseLeave, onContextMenu: props.onNodeContextMenu, onDoubleClick: props.onNodeDoubleClick, selected: !!node.selected, isDraggable, isSelectable, isConnectable, isFocusable, resizeObserver, dragHandle: node.dragHandle, zIndex: node[internalsSymbol]?.z ?? 0, isParent: !!node[internalsSymbol]?.isParent, noDragClassName: props.noDragClassName, noPanClassName: props.noPanClassName, initialized: !!node.width && !!node.height, rfId: props.rfId, disableKeyboardA11y: props.disableKeyboardA11y, ariaLabel: node.ariaLabel, hasHandleBounds: !!node[internalsSymbol]?.handleBounds });
  }));
};
NodeRenderer.displayName = "NodeRenderer";
var NodeRenderer$1 = memo$g(NodeRenderer);
const shiftX = (x, shift, position) => {
  if (position === Position.Left)
    return x - shift;
  if (position === Position.Right)
    return x + shift;
  return x;
};
const shiftY = (y, shift, position) => {
  if (position === Position.Top)
    return y - shift;
  if (position === Position.Bottom)
    return y + shift;
  return y;
};
const EdgeUpdaterClassName = "react-flow__edgeupdater";
const EdgeAnchor = ({ position, centerX, centerY, radius = 10, onMouseDown, onMouseEnter, onMouseOut, type }) => React$o.createElement("circle", { onMouseDown, onMouseEnter, onMouseOut, className: cc([EdgeUpdaterClassName, `${EdgeUpdaterClassName}-${type}`]), cx: shiftX(centerX, radius, position), cy: shiftY(centerY, radius, position), r: radius, stroke: "transparent", fill: "transparent" });
const alwaysValidConnection = () => true;
var wrapEdge = (EdgeComponent) => {
  const EdgeWrapper = ({ id, className, type, data, onClick, onEdgeDoubleClick, selected, animated, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius, style: style2, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, elementsSelectable, hidden, sourceHandleId, targetHandleId, onContextMenu, onMouseEnter, onMouseMove, onMouseLeave, reconnectRadius, onReconnect, onReconnectStart, onReconnectEnd, markerEnd, markerStart, rfId, ariaLabel, isFocusable, isReconnectable, pathOptions, interactionWidth, disableKeyboardA11y }) => {
    const edgeRef = useRef$8(null);
    const [updateHover, setUpdateHover] = useState$h(false);
    const [updating, setUpdating] = useState$h(false);
    const store = useStoreApi();
    const markerStartUrl = useMemo$1(() => `url('#${getMarkerId(markerStart, rfId)}')`, [markerStart, rfId]);
    const markerEndUrl = useMemo$1(() => `url('#${getMarkerId(markerEnd, rfId)}')`, [markerEnd, rfId]);
    if (hidden) {
      return null;
    }
    const onEdgeClick = (event) => {
      const { edges, addSelectedEdges, unselectNodesAndEdges, multiSelectionActive } = store.getState();
      const edge = edges.find((e) => e.id === id);
      if (!edge) {
        return;
      }
      if (elementsSelectable) {
        store.setState({ nodesSelectionActive: false });
        if (edge.selected && multiSelectionActive) {
          unselectNodesAndEdges({ nodes: [], edges: [edge] });
          edgeRef.current?.blur();
        } else {
          addSelectedEdges([id]);
        }
      }
      if (onClick) {
        onClick(event, edge);
      }
    };
    const onEdgeDoubleClickHandler = getMouseHandler$1(id, store.getState, onEdgeDoubleClick);
    const onEdgeContextMenu = getMouseHandler$1(id, store.getState, onContextMenu);
    const onEdgeMouseEnter = getMouseHandler$1(id, store.getState, onMouseEnter);
    const onEdgeMouseMove = getMouseHandler$1(id, store.getState, onMouseMove);
    const onEdgeMouseLeave = getMouseHandler$1(id, store.getState, onMouseLeave);
    const handleEdgeUpdater = (event, isSourceHandle) => {
      if (event.button !== 0) {
        return;
      }
      const { edges, isValidConnection: isValidConnectionStore } = store.getState();
      const nodeId = isSourceHandle ? target : source;
      const handleId = (isSourceHandle ? targetHandleId : sourceHandleId) || null;
      const handleType = isSourceHandle ? "target" : "source";
      const isValidConnection = isValidConnectionStore || alwaysValidConnection;
      const isTarget = isSourceHandle;
      const edge = edges.find((e) => e.id === id);
      setUpdating(true);
      onReconnectStart?.(event, edge, handleType);
      const _onReconnectEnd = (evt) => {
        setUpdating(false);
        onReconnectEnd?.(evt, edge, handleType);
      };
      const onConnectEdge = (connection) => onReconnect?.(edge, connection);
      handlePointerDown({
        event,
        handleId,
        nodeId,
        onConnect: onConnectEdge,
        isTarget,
        getState: store.getState,
        setState: store.setState,
        isValidConnection,
        edgeUpdaterType: handleType,
        onReconnectEnd: _onReconnectEnd
      });
    };
    const onEdgeUpdaterSourceMouseDown = (event) => handleEdgeUpdater(event, true);
    const onEdgeUpdaterTargetMouseDown = (event) => handleEdgeUpdater(event, false);
    const onEdgeUpdaterMouseEnter = () => setUpdateHover(true);
    const onEdgeUpdaterMouseOut = () => setUpdateHover(false);
    const inactive = !elementsSelectable && !onClick;
    const onKeyDown = (event) => {
      if (!disableKeyboardA11y && elementSelectionKeys.includes(event.key) && elementsSelectable) {
        const { unselectNodesAndEdges, addSelectedEdges, edges } = store.getState();
        const unselect = event.key === "Escape";
        if (unselect) {
          edgeRef.current?.blur();
          unselectNodesAndEdges({ edges: [edges.find((e) => e.id === id)] });
        } else {
          addSelectedEdges([id]);
        }
      }
    };
    return React$o.createElement(
      "g",
      { className: cc([
        "react-flow__edge",
        `react-flow__edge-${type}`,
        className,
        { selected, animated, inactive, updating: updateHover }
      ]), onClick: onEdgeClick, onDoubleClick: onEdgeDoubleClickHandler, onContextMenu: onEdgeContextMenu, onMouseEnter: onEdgeMouseEnter, onMouseMove: onEdgeMouseMove, onMouseLeave: onEdgeMouseLeave, onKeyDown: isFocusable ? onKeyDown : void 0, tabIndex: isFocusable ? 0 : void 0, role: isFocusable ? "button" : "img", "data-testid": `rf__edge-${id}`, "aria-label": ariaLabel === null ? void 0 : ariaLabel ? ariaLabel : `Edge from ${source} to ${target}`, "aria-describedby": isFocusable ? `${ARIA_EDGE_DESC_KEY}-${rfId}` : void 0, ref: edgeRef },
      !updating && React$o.createElement(EdgeComponent, { id, source, target, selected, animated, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius, data, style: style2, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, sourceHandleId, targetHandleId, markerStart: markerStartUrl, markerEnd: markerEndUrl, pathOptions, interactionWidth }),
      isReconnectable && React$o.createElement(
        React$o.Fragment,
        null,
        (isReconnectable === "source" || isReconnectable === true) && React$o.createElement(EdgeAnchor, { position: sourcePosition, centerX: sourceX, centerY: sourceY, radius: reconnectRadius, onMouseDown: onEdgeUpdaterSourceMouseDown, onMouseEnter: onEdgeUpdaterMouseEnter, onMouseOut: onEdgeUpdaterMouseOut, type: "source" }),
        (isReconnectable === "target" || isReconnectable === true) && React$o.createElement(EdgeAnchor, { position: targetPosition, centerX: targetX, centerY: targetY, radius: reconnectRadius, onMouseDown: onEdgeUpdaterTargetMouseDown, onMouseEnter: onEdgeUpdaterMouseEnter, onMouseOut: onEdgeUpdaterMouseOut, type: "target" })
      )
    );
  };
  EdgeWrapper.displayName = "EdgeWrapper";
  return memo$g(EdgeWrapper);
};
function createEdgeTypes(edgeTypes) {
  const standardTypes = {
    default: wrapEdge(edgeTypes.default || BezierEdge),
    straight: wrapEdge(edgeTypes.bezier || StraightEdge),
    step: wrapEdge(edgeTypes.step || StepEdge),
    smoothstep: wrapEdge(edgeTypes.step || SmoothStepEdge),
    simplebezier: wrapEdge(edgeTypes.simplebezier || SimpleBezierEdge)
  };
  const wrappedTypes = {};
  const specialTypes = Object.keys(edgeTypes).filter((k) => !["default", "bezier"].includes(k)).reduce((res, key) => {
    res[key] = wrapEdge(edgeTypes[key] || BezierEdge);
    return res;
  }, wrappedTypes);
  return {
    ...standardTypes,
    ...specialTypes
  };
}
function getHandlePosition(position, nodeRect, handle = null) {
  const x = (handle?.x || 0) + nodeRect.x;
  const y = (handle?.y || 0) + nodeRect.y;
  const width = handle?.width || nodeRect.width;
  const height = handle?.height || nodeRect.height;
  switch (position) {
    case Position.Top:
      return {
        x: x + width / 2,
        y
      };
    case Position.Right:
      return {
        x: x + width,
        y: y + height / 2
      };
    case Position.Bottom:
      return {
        x: x + width / 2,
        y: y + height
      };
    case Position.Left:
      return {
        x,
        y: y + height / 2
      };
  }
}
function getHandle(bounds, handleId) {
  if (!bounds) {
    return null;
  }
  if (bounds.length === 1 || !handleId) {
    return bounds[0];
  } else if (handleId) {
    return bounds.find((d) => d.id === handleId) || null;
  }
  return null;
}
const getEdgePositions = (sourceNodeRect, sourceHandle, sourcePosition, targetNodeRect, targetHandle, targetPosition) => {
  const sourceHandlePos = getHandlePosition(sourcePosition, sourceNodeRect, sourceHandle);
  const targetHandlePos = getHandlePosition(targetPosition, targetNodeRect, targetHandle);
  return {
    sourceX: sourceHandlePos.x,
    sourceY: sourceHandlePos.y,
    targetX: targetHandlePos.x,
    targetY: targetHandlePos.y
  };
};
function isEdgeVisible({ sourcePos, targetPos, sourceWidth, sourceHeight, targetWidth, targetHeight, width, height, transform }) {
  const edgeBox = {
    x: Math.min(sourcePos.x, targetPos.x),
    y: Math.min(sourcePos.y, targetPos.y),
    x2: Math.max(sourcePos.x + sourceWidth, targetPos.x + targetWidth),
    y2: Math.max(sourcePos.y + sourceHeight, targetPos.y + targetHeight)
  };
  if (edgeBox.x === edgeBox.x2) {
    edgeBox.x2 += 1;
  }
  if (edgeBox.y === edgeBox.y2) {
    edgeBox.y2 += 1;
  }
  const viewBox = rectToBox({
    x: (0 - transform[0]) / transform[2],
    y: (0 - transform[1]) / transform[2],
    width: width / transform[2],
    height: height / transform[2]
  });
  const xOverlap = Math.max(0, Math.min(viewBox.x2, edgeBox.x2) - Math.max(viewBox.x, edgeBox.x));
  const yOverlap = Math.max(0, Math.min(viewBox.y2, edgeBox.y2) - Math.max(viewBox.y, edgeBox.y));
  const overlappingArea = Math.ceil(xOverlap * yOverlap);
  return overlappingArea > 0;
}
function getNodeData(node) {
  const handleBounds = node?.[internalsSymbol]?.handleBounds || null;
  const isValid = handleBounds && node?.width && node?.height && typeof node?.positionAbsolute?.x !== "undefined" && typeof node?.positionAbsolute?.y !== "undefined";
  return [
    {
      x: node?.positionAbsolute?.x || 0,
      y: node?.positionAbsolute?.y || 0,
      width: node?.width || 0,
      height: node?.height || 0
    },
    handleBounds,
    !!isValid
  ];
}
const defaultEdgeTree = [{ level: 0, isMaxLevel: true, edges: [] }];
function groupEdgesByZLevel(edges, nodeInternals, elevateEdgesOnSelect = false) {
  let maxLevel = -1;
  const levelLookup = edges.reduce((tree, edge) => {
    const hasZIndex = isNumeric(edge.zIndex);
    let z = hasZIndex ? edge.zIndex : 0;
    if (elevateEdgesOnSelect) {
      const targetNode = nodeInternals.get(edge.target);
      const sourceNode = nodeInternals.get(edge.source);
      const edgeOrConnectedNodeSelected = edge.selected || targetNode?.selected || sourceNode?.selected;
      const selectedZIndex = Math.max(sourceNode?.[internalsSymbol]?.z || 0, targetNode?.[internalsSymbol]?.z || 0, 1e3);
      z = (hasZIndex ? edge.zIndex : 0) + (edgeOrConnectedNodeSelected ? selectedZIndex : 0);
    }
    if (tree[z]) {
      tree[z].push(edge);
    } else {
      tree[z] = [edge];
    }
    maxLevel = z > maxLevel ? z : maxLevel;
    return tree;
  }, {});
  const edgeTree = Object.entries(levelLookup).map(([key, edges2]) => {
    const level = +key;
    return {
      edges: edges2,
      level,
      isMaxLevel: level === maxLevel
    };
  });
  if (edgeTree.length === 0) {
    return defaultEdgeTree;
  }
  return edgeTree;
}
function useVisibleEdges(onlyRenderVisible, nodeInternals, elevateEdgesOnSelect) {
  const edges = useStore(useCallback$9((s) => {
    if (!onlyRenderVisible) {
      return s.edges;
    }
    return s.edges.filter((e) => {
      const sourceNode = nodeInternals.get(e.source);
      const targetNode = nodeInternals.get(e.target);
      return sourceNode?.width && sourceNode?.height && targetNode?.width && targetNode?.height && isEdgeVisible({
        sourcePos: sourceNode.positionAbsolute || { x: 0, y: 0 },
        targetPos: targetNode.positionAbsolute || { x: 0, y: 0 },
        sourceWidth: sourceNode.width,
        sourceHeight: sourceNode.height,
        targetWidth: targetNode.width,
        targetHeight: targetNode.height,
        width: s.width,
        height: s.height,
        transform: s.transform
      });
    });
  }, [onlyRenderVisible, nodeInternals]));
  return groupEdgesByZLevel(edges, nodeInternals, elevateEdgesOnSelect);
}
const ArrowSymbol = ({ color = "none", strokeWidth = 1 }) => {
  return React$o.createElement("polyline", { style: {
    stroke: color,
    strokeWidth
  }, strokeLinecap: "round", strokeLinejoin: "round", fill: "none", points: "-5,-4 0,0 -5,4" });
};
const ArrowClosedSymbol = ({ color = "none", strokeWidth = 1 }) => {
  return React$o.createElement("polyline", { style: {
    stroke: color,
    fill: color,
    strokeWidth
  }, strokeLinecap: "round", strokeLinejoin: "round", points: "-5,-4 0,0 -5,4 -5,-4" });
};
const MarkerSymbols = {
  [MarkerType.Arrow]: ArrowSymbol,
  [MarkerType.ArrowClosed]: ArrowClosedSymbol
};
function useMarkerSymbol(type) {
  const store = useStoreApi();
  const symbol = useMemo$1(() => {
    const symbolExists = Object.prototype.hasOwnProperty.call(MarkerSymbols, type);
    if (!symbolExists) {
      store.getState().onError?.("009", errorMessages["error009"](type));
      return null;
    }
    return MarkerSymbols[type];
  }, [type]);
  return symbol;
}
const Marker = ({ id, type, color, width = 12.5, height = 12.5, markerUnits = "strokeWidth", strokeWidth, orient = "auto-start-reverse" }) => {
  const Symbol2 = useMarkerSymbol(type);
  if (!Symbol2) {
    return null;
  }
  return React$o.createElement(
    "marker",
    { className: "react-flow__arrowhead", id, markerWidth: `${width}`, markerHeight: `${height}`, viewBox: "-10 -10 20 20", markerUnits, orient, refX: "0", refY: "0" },
    React$o.createElement(Symbol2, { color, strokeWidth })
  );
};
const markerSelector = ({ defaultColor, rfId }) => (s) => {
  const ids = [];
  return s.edges.reduce((markers, edge) => {
    [edge.markerStart, edge.markerEnd].forEach((marker) => {
      if (marker && typeof marker === "object") {
        const markerId = getMarkerId(marker, rfId);
        if (!ids.includes(markerId)) {
          markers.push({ id: markerId, color: marker.color || defaultColor, ...marker });
          ids.push(markerId);
        }
      }
    });
    return markers;
  }, []).sort((a, b) => a.id.localeCompare(b.id));
};
const MarkerDefinitions = ({ defaultColor, rfId }) => {
  const markers = useStore(
    useCallback$9(markerSelector({ defaultColor, rfId }), [defaultColor, rfId]),
    // the id includes all marker options, so we just need to look at that part of the marker
    (a, b) => !(a.length !== b.length || a.some((m, i) => m.id !== b[i].id))
  );
  return React$o.createElement("defs", null, markers.map((marker) => React$o.createElement(Marker, { id: marker.id, key: marker.id, type: marker.type, color: marker.color, width: marker.width, height: marker.height, markerUnits: marker.markerUnits, strokeWidth: marker.strokeWidth, orient: marker.orient })));
};
MarkerDefinitions.displayName = "MarkerDefinitions";
var MarkerDefinitions$1 = memo$g(MarkerDefinitions);
const selector$4 = (s) => ({
  nodesConnectable: s.nodesConnectable,
  edgesFocusable: s.edgesFocusable,
  edgesUpdatable: s.edgesUpdatable,
  elementsSelectable: s.elementsSelectable,
  width: s.width,
  height: s.height,
  connectionMode: s.connectionMode,
  nodeInternals: s.nodeInternals,
  onError: s.onError
});
const EdgeRenderer = ({ defaultMarkerColor, onlyRenderVisibleElements, elevateEdgesOnSelect, rfId, edgeTypes, noPanClassName, onEdgeContextMenu, onEdgeMouseEnter, onEdgeMouseMove, onEdgeMouseLeave, onEdgeClick, onEdgeDoubleClick, onReconnect, onReconnectStart, onReconnectEnd, reconnectRadius, children, disableKeyboardA11y }) => {
  const { edgesFocusable, edgesUpdatable, elementsSelectable, width, height, connectionMode, nodeInternals, onError } = useStore(selector$4, shallow$1);
  const edgeTree = useVisibleEdges(onlyRenderVisibleElements, nodeInternals, elevateEdgesOnSelect);
  if (!width) {
    return null;
  }
  return React$o.createElement(
    React$o.Fragment,
    null,
    edgeTree.map(({ level, edges, isMaxLevel }) => React$o.createElement(
      "svg",
      { key: level, style: { zIndex: level }, width, height, className: "react-flow__edges react-flow__container" },
      isMaxLevel && React$o.createElement(MarkerDefinitions$1, { defaultColor: defaultMarkerColor, rfId }),
      React$o.createElement("g", null, edges.map((edge) => {
        const [sourceNodeRect, sourceHandleBounds, sourceIsValid] = getNodeData(nodeInternals.get(edge.source));
        const [targetNodeRect, targetHandleBounds, targetIsValid] = getNodeData(nodeInternals.get(edge.target));
        if (!sourceIsValid || !targetIsValid) {
          return null;
        }
        let edgeType = edge.type || "default";
        if (!edgeTypes[edgeType]) {
          onError?.("011", errorMessages["error011"](edgeType));
          edgeType = "default";
        }
        const EdgeComponent = edgeTypes[edgeType] || edgeTypes.default;
        const targetNodeHandles = connectionMode === ConnectionMode.Strict ? targetHandleBounds.target : (targetHandleBounds.target ?? []).concat(targetHandleBounds.source ?? []);
        const sourceHandle = getHandle(sourceHandleBounds.source, edge.sourceHandle);
        const targetHandle = getHandle(targetNodeHandles, edge.targetHandle);
        const sourcePosition = sourceHandle?.position || Position.Bottom;
        const targetPosition = targetHandle?.position || Position.Top;
        const isFocusable = !!(edge.focusable || edgesFocusable && typeof edge.focusable === "undefined");
        const edgeReconnectable = edge.reconnectable || edge.updatable;
        const isReconnectable = typeof onReconnect !== "undefined" && (edgeReconnectable || edgesUpdatable && typeof edgeReconnectable === "undefined");
        if (!sourceHandle || !targetHandle) {
          onError?.("008", errorMessages["error008"](sourceHandle, edge));
          return null;
        }
        const { sourceX, sourceY, targetX, targetY } = getEdgePositions(sourceNodeRect, sourceHandle, sourcePosition, targetNodeRect, targetHandle, targetPosition);
        return React$o.createElement(EdgeComponent, { key: edge.id, id: edge.id, className: cc([edge.className, noPanClassName]), type: edgeType, data: edge.data, selected: !!edge.selected, animated: !!edge.animated, hidden: !!edge.hidden, label: edge.label, labelStyle: edge.labelStyle, labelShowBg: edge.labelShowBg, labelBgStyle: edge.labelBgStyle, labelBgPadding: edge.labelBgPadding, labelBgBorderRadius: edge.labelBgBorderRadius, style: edge.style, source: edge.source, target: edge.target, sourceHandleId: edge.sourceHandle, targetHandleId: edge.targetHandle, markerEnd: edge.markerEnd, markerStart: edge.markerStart, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, elementsSelectable, onContextMenu: onEdgeContextMenu, onMouseEnter: onEdgeMouseEnter, onMouseMove: onEdgeMouseMove, onMouseLeave: onEdgeMouseLeave, onClick: onEdgeClick, onEdgeDoubleClick, onReconnect, onReconnectStart, onReconnectEnd, reconnectRadius, rfId, ariaLabel: edge.ariaLabel, isFocusable, isReconnectable, pathOptions: "pathOptions" in edge ? edge.pathOptions : void 0, interactionWidth: edge.interactionWidth, disableKeyboardA11y });
      }))
    )),
    children
  );
};
EdgeRenderer.displayName = "EdgeRenderer";
var EdgeRenderer$1 = memo$g(EdgeRenderer);
const selector$3 = (s) => `translate(${s.transform[0]}px,${s.transform[1]}px) scale(${s.transform[2]})`;
function Viewport({ children }) {
  const transform = useStore(selector$3);
  return React$o.createElement("div", { className: "react-flow__viewport react-flow__container", style: { transform } }, children);
}
function useOnInitHandler(onInit) {
  const rfInstance = useReactFlow();
  const isInitialized = useRef$8(false);
  useEffect$b(() => {
    if (!isInitialized.current && rfInstance.viewportInitialized && onInit) {
      setTimeout(() => onInit(rfInstance), 1);
      isInitialized.current = true;
    }
  }, [onInit, rfInstance.viewportInitialized]);
}
const oppositePosition = {
  [Position.Left]: Position.Right,
  [Position.Right]: Position.Left,
  [Position.Top]: Position.Bottom,
  [Position.Bottom]: Position.Top
};
const ConnectionLine = ({ nodeId, handleType, style: style2, type = ConnectionLineType.Bezier, CustomComponent, connectionStatus }) => {
  const { fromNode, handleId, toX, toY, connectionMode } = useStore(useCallback$9((s) => ({
    fromNode: s.nodeInternals.get(nodeId),
    handleId: s.connectionHandleId,
    toX: (s.connectionPosition.x - s.transform[0]) / s.transform[2],
    toY: (s.connectionPosition.y - s.transform[1]) / s.transform[2],
    connectionMode: s.connectionMode
  }), [nodeId]), shallow$1);
  const fromHandleBounds = fromNode?.[internalsSymbol]?.handleBounds;
  let handleBounds = fromHandleBounds?.[handleType];
  if (connectionMode === ConnectionMode.Loose) {
    handleBounds = handleBounds ? handleBounds : fromHandleBounds?.[handleType === "source" ? "target" : "source"];
  }
  if (!fromNode || !handleBounds) {
    return null;
  }
  const fromHandle = handleId ? handleBounds.find((d) => d.id === handleId) : handleBounds[0];
  const fromHandleX = fromHandle ? fromHandle.x + fromHandle.width / 2 : (fromNode.width ?? 0) / 2;
  const fromHandleY = fromHandle ? fromHandle.y + fromHandle.height / 2 : fromNode.height ?? 0;
  const fromX = (fromNode.positionAbsolute?.x ?? 0) + fromHandleX;
  const fromY = (fromNode.positionAbsolute?.y ?? 0) + fromHandleY;
  const fromPosition = fromHandle?.position;
  const toPosition = fromPosition ? oppositePosition[fromPosition] : null;
  if (!fromPosition || !toPosition) {
    return null;
  }
  if (CustomComponent) {
    return React$o.createElement(CustomComponent, { connectionLineType: type, connectionLineStyle: style2, fromNode, fromHandle, fromX, fromY, toX, toY, fromPosition, toPosition, connectionStatus });
  }
  let dAttr = "";
  const pathParams = {
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition
  };
  if (type === ConnectionLineType.Bezier) {
    [dAttr] = getBezierPath(pathParams);
  } else if (type === ConnectionLineType.Step) {
    [dAttr] = getSmoothStepPath({
      ...pathParams,
      borderRadius: 0
    });
  } else if (type === ConnectionLineType.SmoothStep) {
    [dAttr] = getSmoothStepPath(pathParams);
  } else if (type === ConnectionLineType.SimpleBezier) {
    [dAttr] = getSimpleBezierPath(pathParams);
  } else {
    dAttr = `M${fromX},${fromY} ${toX},${toY}`;
  }
  return React$o.createElement("path", { d: dAttr, fill: "none", className: "react-flow__connection-path", style: style2 });
};
ConnectionLine.displayName = "ConnectionLine";
const selector$2$1 = (s) => ({
  nodeId: s.connectionNodeId,
  handleType: s.connectionHandleType,
  nodesConnectable: s.nodesConnectable,
  connectionStatus: s.connectionStatus,
  width: s.width,
  height: s.height
});
function ConnectionLineWrapper({ containerStyle: containerStyle2, style: style2, type, component }) {
  const { nodeId, handleType, nodesConnectable, width, height, connectionStatus } = useStore(selector$2$1, shallow$1);
  const isValid = !!(nodeId && handleType && width && nodesConnectable);
  if (!isValid) {
    return null;
  }
  return React$o.createElement(
    "svg",
    { style: containerStyle2, width, height, className: "react-flow__edges react-flow__connectionline react-flow__container" },
    React$o.createElement(
      "g",
      { className: cc(["react-flow__connection", connectionStatus]) },
      React$o.createElement(ConnectionLine, { nodeId, handleType, style: style2, type, CustomComponent: component, connectionStatus })
    )
  );
}
function useNodeOrEdgeTypes(nodeOrEdgeTypes, createTypes) {
  useRef$8(null);
  useStoreApi();
  const typesParsed = useMemo$1(() => {
    return createTypes(nodeOrEdgeTypes);
  }, [nodeOrEdgeTypes]);
  return typesParsed;
}
const GraphView = ({ nodeTypes, edgeTypes, onMove, onMoveStart, onMoveEnd, onInit, onNodeClick, onEdgeClick, onNodeDoubleClick, onEdgeDoubleClick, onNodeMouseEnter, onNodeMouseMove, onNodeMouseLeave, onNodeContextMenu, onSelectionContextMenu, onSelectionStart, onSelectionEnd, connectionLineType, connectionLineStyle, connectionLineComponent, connectionLineContainerStyle, selectionKeyCode, selectionOnDrag, selectionMode, multiSelectionKeyCode, panActivationKeyCode, zoomActivationKeyCode, deleteKeyCode, onlyRenderVisibleElements, elementsSelectable, selectNodesOnDrag, defaultViewport, translateExtent, minZoom, maxZoom, preventScrolling, defaultMarkerColor, zoomOnScroll, zoomOnPinch, panOnScroll, panOnScrollSpeed, panOnScrollMode, zoomOnDoubleClick, panOnDrag, onPaneClick, onPaneMouseEnter, onPaneMouseMove, onPaneMouseLeave, onPaneScroll, onPaneContextMenu, onEdgeContextMenu, onEdgeMouseEnter, onEdgeMouseMove, onEdgeMouseLeave, onReconnect, onReconnectStart, onReconnectEnd, reconnectRadius, noDragClassName, noWheelClassName, noPanClassName, elevateEdgesOnSelect, disableKeyboardA11y, nodeOrigin, nodeExtent, rfId }) => {
  const nodeTypesWrapped = useNodeOrEdgeTypes(nodeTypes, createNodeTypes);
  const edgeTypesWrapped = useNodeOrEdgeTypes(edgeTypes, createEdgeTypes);
  useOnInitHandler(onInit);
  return React$o.createElement(
    FlowRenderer$1,
    { onPaneClick, onPaneMouseEnter, onPaneMouseMove, onPaneMouseLeave, onPaneContextMenu, onPaneScroll, deleteKeyCode, selectionKeyCode, selectionOnDrag, selectionMode, onSelectionStart, onSelectionEnd, multiSelectionKeyCode, panActivationKeyCode, zoomActivationKeyCode, elementsSelectable, onMove, onMoveStart, onMoveEnd, zoomOnScroll, zoomOnPinch, zoomOnDoubleClick, panOnScroll, panOnScrollSpeed, panOnScrollMode, panOnDrag, defaultViewport, translateExtent, minZoom, maxZoom, onSelectionContextMenu, preventScrolling, noDragClassName, noWheelClassName, noPanClassName, disableKeyboardA11y },
    React$o.createElement(
      Viewport,
      null,
      React$o.createElement(
        EdgeRenderer$1,
        { edgeTypes: edgeTypesWrapped, onEdgeClick, onEdgeDoubleClick, onlyRenderVisibleElements, onEdgeContextMenu, onEdgeMouseEnter, onEdgeMouseMove, onEdgeMouseLeave, onReconnect, onReconnectStart, onReconnectEnd, reconnectRadius, defaultMarkerColor, noPanClassName, elevateEdgesOnSelect: !!elevateEdgesOnSelect, disableKeyboardA11y, rfId },
        React$o.createElement(ConnectionLineWrapper, { style: connectionLineStyle, type: connectionLineType, component: connectionLineComponent, containerStyle: connectionLineContainerStyle })
      ),
      React$o.createElement("div", { className: "react-flow__edgelabel-renderer" }),
      React$o.createElement(NodeRenderer$1, { nodeTypes: nodeTypesWrapped, onNodeClick, onNodeDoubleClick, onNodeMouseEnter, onNodeMouseMove, onNodeMouseLeave, onNodeContextMenu, selectNodesOnDrag, onlyRenderVisibleElements, noPanClassName, noDragClassName, disableKeyboardA11y, nodeOrigin, nodeExtent, rfId })
    )
  );
};
GraphView.displayName = "GraphView";
var GraphView$1 = memo$g(GraphView);
const infiniteExtent = [
  [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
  [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
];
const initialState = {
  rfId: "1",
  width: 0,
  height: 0,
  transform: [0, 0, 1],
  nodeInternals: /* @__PURE__ */ new Map(),
  edges: [],
  onNodesChange: null,
  onEdgesChange: null,
  hasDefaultNodes: false,
  hasDefaultEdges: false,
  d3Zoom: null,
  d3Selection: null,
  d3ZoomHandler: void 0,
  minZoom: 0.5,
  maxZoom: 2,
  translateExtent: infiniteExtent,
  nodeExtent: infiniteExtent,
  nodesSelectionActive: false,
  userSelectionActive: false,
  userSelectionRect: null,
  connectionNodeId: null,
  connectionHandleId: null,
  connectionHandleType: "source",
  connectionPosition: { x: 0, y: 0 },
  connectionStatus: null,
  connectionMode: ConnectionMode.Strict,
  domNode: null,
  paneDragging: false,
  noPanClassName: "nopan",
  nodeOrigin: [0, 0],
  nodeDragThreshold: 0,
  snapGrid: [15, 15],
  snapToGrid: false,
  nodesDraggable: true,
  nodesConnectable: true,
  nodesFocusable: true,
  edgesFocusable: true,
  edgesUpdatable: true,
  elementsSelectable: true,
  elevateNodesOnSelect: true,
  fitViewOnInit: false,
  fitViewOnInitDone: false,
  fitViewOnInitOptions: void 0,
  onSelectionChange: [],
  multiSelectionActive: false,
  connectionStartHandle: null,
  connectionEndHandle: null,
  connectionClickStartHandle: null,
  connectOnClick: true,
  ariaLiveMessage: "",
  autoPanOnConnect: true,
  autoPanOnNodeDrag: true,
  connectionRadius: 20,
  onError: devWarn,
  isValidConnection: void 0
};
const createRFStore = () => createWithEqualityFn((set, get) => ({
  ...initialState,
  setNodes: (nodes) => {
    const { nodeInternals, nodeOrigin, elevateNodesOnSelect } = get();
    set({ nodeInternals: createNodeInternals(nodes, nodeInternals, nodeOrigin, elevateNodesOnSelect) });
  },
  getNodes: () => {
    return Array.from(get().nodeInternals.values());
  },
  setEdges: (edges) => {
    const { defaultEdgeOptions = {} } = get();
    set({ edges: edges.map((e) => ({ ...defaultEdgeOptions, ...e })) });
  },
  setDefaultNodesAndEdges: (nodes, edges) => {
    const hasDefaultNodes = typeof nodes !== "undefined";
    const hasDefaultEdges = typeof edges !== "undefined";
    const nodeInternals = hasDefaultNodes ? createNodeInternals(nodes, /* @__PURE__ */ new Map(), get().nodeOrigin, get().elevateNodesOnSelect) : /* @__PURE__ */ new Map();
    const nextEdges = hasDefaultEdges ? edges : [];
    set({ nodeInternals, edges: nextEdges, hasDefaultNodes, hasDefaultEdges });
  },
  updateNodeDimensions: (updates) => {
    const { onNodesChange, nodeInternals, fitViewOnInit, fitViewOnInitDone, fitViewOnInitOptions, domNode, nodeOrigin } = get();
    const viewportNode = domNode?.querySelector(".react-flow__viewport");
    if (!viewportNode) {
      return;
    }
    const style2 = window.getComputedStyle(viewportNode);
    const { m22: zoom2 } = new window.DOMMatrixReadOnly(style2.transform);
    const changes = updates.reduce((res, update) => {
      const node = nodeInternals.get(update.id);
      if (node?.hidden) {
        nodeInternals.set(node.id, {
          ...node,
          [internalsSymbol]: {
            ...node[internalsSymbol],
            // we need to reset the handle bounds when the node is hidden
            // in order to force a new observation when the node is shown again
            handleBounds: void 0
          }
        });
      } else if (node) {
        const dimensions = getDimensions(update.nodeElement);
        const doUpdate = !!(dimensions.width && dimensions.height && (node.width !== dimensions.width || node.height !== dimensions.height || update.forceUpdate));
        if (doUpdate) {
          nodeInternals.set(node.id, {
            ...node,
            [internalsSymbol]: {
              ...node[internalsSymbol],
              handleBounds: {
                source: getHandleBounds(".source", update.nodeElement, zoom2, nodeOrigin),
                target: getHandleBounds(".target", update.nodeElement, zoom2, nodeOrigin)
              }
            },
            ...dimensions
          });
          res.push({
            id: node.id,
            type: "dimensions",
            dimensions
          });
        }
      }
      return res;
    }, []);
    updateAbsoluteNodePositions(nodeInternals, nodeOrigin);
    const nextFitViewOnInitDone = fitViewOnInitDone || fitViewOnInit && !fitViewOnInitDone && fitView(get, { initial: true, ...fitViewOnInitOptions });
    set({ nodeInternals: new Map(nodeInternals), fitViewOnInitDone: nextFitViewOnInitDone });
    if (changes?.length > 0) {
      onNodesChange?.(changes);
    }
  },
  updateNodePositions: (nodeDragItems, positionChanged = true, dragging = false) => {
    const { triggerNodeChanges } = get();
    const changes = nodeDragItems.map((node) => {
      const change = {
        id: node.id,
        type: "position",
        dragging
      };
      if (positionChanged) {
        change.positionAbsolute = node.positionAbsolute;
        change.position = node.position;
      }
      return change;
    });
    triggerNodeChanges(changes);
  },
  triggerNodeChanges: (changes) => {
    const { onNodesChange, nodeInternals, hasDefaultNodes, nodeOrigin, getNodes, elevateNodesOnSelect } = get();
    if (changes?.length) {
      if (hasDefaultNodes) {
        const nodes = applyNodeChanges(changes, getNodes());
        const nextNodeInternals = createNodeInternals(nodes, nodeInternals, nodeOrigin, elevateNodesOnSelect);
        set({ nodeInternals: nextNodeInternals });
      }
      onNodesChange?.(changes);
    }
  },
  addSelectedNodes: (selectedNodeIds) => {
    const { multiSelectionActive, edges, getNodes } = get();
    let changedNodes;
    let changedEdges = null;
    if (multiSelectionActive) {
      changedNodes = selectedNodeIds.map((nodeId) => createSelectionChange(nodeId, true));
    } else {
      changedNodes = getSelectionChanges(getNodes(), selectedNodeIds);
      changedEdges = getSelectionChanges(edges, []);
    }
    updateNodesAndEdgesSelections({
      changedNodes,
      changedEdges,
      get,
      set
    });
  },
  addSelectedEdges: (selectedEdgeIds) => {
    const { multiSelectionActive, edges, getNodes } = get();
    let changedEdges;
    let changedNodes = null;
    if (multiSelectionActive) {
      changedEdges = selectedEdgeIds.map((edgeId) => createSelectionChange(edgeId, true));
    } else {
      changedEdges = getSelectionChanges(edges, selectedEdgeIds);
      changedNodes = getSelectionChanges(getNodes(), []);
    }
    updateNodesAndEdgesSelections({
      changedNodes,
      changedEdges,
      get,
      set
    });
  },
  unselectNodesAndEdges: ({ nodes, edges } = {}) => {
    const { edges: storeEdges, getNodes } = get();
    const nodesToUnselect = nodes ? nodes : getNodes();
    const edgesToUnselect = edges ? edges : storeEdges;
    const changedNodes = nodesToUnselect.map((n) => {
      n.selected = false;
      return createSelectionChange(n.id, false);
    });
    const changedEdges = edgesToUnselect.map((edge) => createSelectionChange(edge.id, false));
    updateNodesAndEdgesSelections({
      changedNodes,
      changedEdges,
      get,
      set
    });
  },
  setMinZoom: (minZoom) => {
    const { d3Zoom, maxZoom } = get();
    d3Zoom?.scaleExtent([minZoom, maxZoom]);
    set({ minZoom });
  },
  setMaxZoom: (maxZoom) => {
    const { d3Zoom, minZoom } = get();
    d3Zoom?.scaleExtent([minZoom, maxZoom]);
    set({ maxZoom });
  },
  setTranslateExtent: (translateExtent) => {
    get().d3Zoom?.translateExtent(translateExtent);
    set({ translateExtent });
  },
  resetSelectedElements: () => {
    const { edges, getNodes } = get();
    const nodes = getNodes();
    const nodesToUnselect = nodes.filter((e) => e.selected).map((n) => createSelectionChange(n.id, false));
    const edgesToUnselect = edges.filter((e) => e.selected).map((e) => createSelectionChange(e.id, false));
    updateNodesAndEdgesSelections({
      changedNodes: nodesToUnselect,
      changedEdges: edgesToUnselect,
      get,
      set
    });
  },
  setNodeExtent: (nodeExtent) => {
    const { nodeInternals } = get();
    nodeInternals.forEach((node) => {
      node.positionAbsolute = clampPosition(node.position, nodeExtent);
    });
    set({
      nodeExtent,
      nodeInternals: new Map(nodeInternals)
    });
  },
  panBy: (delta) => {
    const { transform, width, height, d3Zoom, d3Selection, translateExtent } = get();
    if (!d3Zoom || !d3Selection || !delta.x && !delta.y) {
      return false;
    }
    const nextTransform = identity.translate(transform[0] + delta.x, transform[1] + delta.y).scale(transform[2]);
    const extent = [
      [0, 0],
      [width, height]
    ];
    const constrainedTransform = d3Zoom?.constrain()(nextTransform, extent, translateExtent);
    d3Zoom.transform(d3Selection, constrainedTransform);
    const transformChanged = transform[0] !== constrainedTransform.x || transform[1] !== constrainedTransform.y || transform[2] !== constrainedTransform.k;
    return transformChanged;
  },
  cancelConnection: () => set({
    connectionNodeId: initialState.connectionNodeId,
    connectionHandleId: initialState.connectionHandleId,
    connectionHandleType: initialState.connectionHandleType,
    connectionStatus: initialState.connectionStatus,
    connectionStartHandle: initialState.connectionStartHandle,
    connectionEndHandle: initialState.connectionEndHandle
  }),
  reset: () => set({ ...initialState })
}), Object.is);
const ReactFlowProvider = ({ children }) => {
  const storeRef = useRef$8(null);
  if (!storeRef.current) {
    storeRef.current = createRFStore();
  }
  return React$o.createElement(Provider$1, { value: storeRef.current }, children);
};
ReactFlowProvider.displayName = "ReactFlowProvider";
const Wrapper = ({ children }) => {
  const isWrapped = useContext(StoreContext);
  if (isWrapped) {
    return React$o.createElement(React$o.Fragment, null, children);
  }
  return React$o.createElement(ReactFlowProvider, null, children);
};
Wrapper.displayName = "ReactFlowWrapper";
const defaultNodeTypes = {
  input: InputNode$1,
  default: DefaultNode$1,
  output: OutputNode$1,
  group: GroupNode
};
const defaultEdgeTypes = {
  default: BezierEdge,
  straight: StraightEdge,
  step: StepEdge,
  smoothstep: SmoothStepEdge,
  simplebezier: SimpleBezierEdge
};
const initNodeOrigin = [0, 0];
const initSnapGrid = [15, 15];
const initDefaultViewport = { x: 0, y: 0, zoom: 1 };
const wrapperStyle = {
  width: "100%",
  height: "100%",
  overflow: "hidden",
  position: "relative",
  zIndex: 0
};
const ReactFlow = forwardRef$1(({ nodes, edges, defaultNodes, defaultEdges, className, nodeTypes = defaultNodeTypes, edgeTypes = defaultEdgeTypes, onNodeClick, onEdgeClick, onInit, onMove, onMoveStart, onMoveEnd, onConnect, onConnectStart, onConnectEnd, onClickConnectStart, onClickConnectEnd, onNodeMouseEnter, onNodeMouseMove, onNodeMouseLeave, onNodeContextMenu, onNodeDoubleClick, onNodeDragStart, onNodeDrag, onNodeDragStop, onNodesDelete, onEdgesDelete, onSelectionChange, onSelectionDragStart, onSelectionDrag, onSelectionDragStop, onSelectionContextMenu, onSelectionStart, onSelectionEnd, connectionMode = ConnectionMode.Strict, connectionLineType = ConnectionLineType.Bezier, connectionLineStyle, connectionLineComponent, connectionLineContainerStyle, deleteKeyCode = "Backspace", selectionKeyCode = "Shift", selectionOnDrag = false, selectionMode = SelectionMode.Full, panActivationKeyCode = "Space", multiSelectionKeyCode = isMacOs() ? "Meta" : "Control", zoomActivationKeyCode = isMacOs() ? "Meta" : "Control", snapToGrid = false, snapGrid = initSnapGrid, onlyRenderVisibleElements = false, selectNodesOnDrag = true, nodesDraggable, nodesConnectable, nodesFocusable, nodeOrigin = initNodeOrigin, edgesFocusable, edgesUpdatable, elementsSelectable, defaultViewport = initDefaultViewport, minZoom = 0.5, maxZoom = 2, translateExtent = infiniteExtent, preventScrolling = true, nodeExtent, defaultMarkerColor = "#b1b1b7", zoomOnScroll = true, zoomOnPinch = true, panOnScroll = false, panOnScrollSpeed = 0.5, panOnScrollMode = PanOnScrollMode.Free, zoomOnDoubleClick = true, panOnDrag = true, onPaneClick, onPaneMouseEnter, onPaneMouseMove, onPaneMouseLeave, onPaneScroll, onPaneContextMenu, children, onEdgeContextMenu, onEdgeDoubleClick, onEdgeMouseEnter, onEdgeMouseMove, onEdgeMouseLeave, onEdgeUpdate, onEdgeUpdateStart, onEdgeUpdateEnd, onReconnect, onReconnectStart, onReconnectEnd, reconnectRadius = 10, edgeUpdaterRadius = 10, onNodesChange, onEdgesChange, noDragClassName = "nodrag", noWheelClassName = "nowheel", noPanClassName = "nopan", fitView: fitView2 = false, fitViewOptions, connectOnClick = true, attributionPosition, proOptions, defaultEdgeOptions, elevateNodesOnSelect = true, elevateEdgesOnSelect = false, disableKeyboardA11y = false, autoPanOnConnect = true, autoPanOnNodeDrag = true, connectionRadius = 20, isValidConnection, onError, style: style2, id, nodeDragThreshold, ...rest }, ref) => {
  const rfId = id || "1";
  return React$o.createElement(
    "div",
    { ...rest, style: { ...style2, ...wrapperStyle }, ref, className: cc(["react-flow", className]), "data-testid": "rf__wrapper", id },
    React$o.createElement(
      Wrapper,
      null,
      React$o.createElement(GraphView$1, { onInit, onMove, onMoveStart, onMoveEnd, onNodeClick, onEdgeClick, onNodeMouseEnter, onNodeMouseMove, onNodeMouseLeave, onNodeContextMenu, onNodeDoubleClick, nodeTypes, edgeTypes, connectionLineType, connectionLineStyle, connectionLineComponent, connectionLineContainerStyle, selectionKeyCode, selectionOnDrag, selectionMode, deleteKeyCode, multiSelectionKeyCode, panActivationKeyCode, zoomActivationKeyCode, onlyRenderVisibleElements, selectNodesOnDrag, defaultViewport, translateExtent, minZoom, maxZoom, preventScrolling, zoomOnScroll, zoomOnPinch, zoomOnDoubleClick, panOnScroll, panOnScrollSpeed, panOnScrollMode, panOnDrag, onPaneClick, onPaneMouseEnter, onPaneMouseMove, onPaneMouseLeave, onPaneScroll, onPaneContextMenu, onSelectionContextMenu, onSelectionStart, onSelectionEnd, onEdgeContextMenu, onEdgeDoubleClick, onEdgeMouseEnter, onEdgeMouseMove, onEdgeMouseLeave, onReconnect: onReconnect ?? onEdgeUpdate, onReconnectStart: onReconnectStart ?? onEdgeUpdateStart, onReconnectEnd: onReconnectEnd ?? onEdgeUpdateEnd, reconnectRadius: reconnectRadius ?? edgeUpdaterRadius, defaultMarkerColor, noDragClassName, noWheelClassName, noPanClassName, elevateEdgesOnSelect, rfId, disableKeyboardA11y, nodeOrigin, nodeExtent }),
      React$o.createElement(StoreUpdater, { nodes, edges, defaultNodes, defaultEdges, onConnect, onConnectStart, onConnectEnd, onClickConnectStart, onClickConnectEnd, nodesDraggable, nodesConnectable, nodesFocusable, edgesFocusable, edgesUpdatable, elementsSelectable, elevateNodesOnSelect, minZoom, maxZoom, nodeExtent, onNodesChange, onEdgesChange, snapToGrid, snapGrid, connectionMode, translateExtent, connectOnClick, defaultEdgeOptions, fitView: fitView2, fitViewOptions, onNodesDelete, onEdgesDelete, onNodeDragStart, onNodeDrag, onNodeDragStop, onSelectionDrag, onSelectionDragStart, onSelectionDragStop, noPanClassName, nodeOrigin, rfId, autoPanOnConnect, autoPanOnNodeDrag, onError, connectionRadius, isValidConnection, nodeDragThreshold }),
      React$o.createElement(Wrapper$1, { onSelectionChange }),
      children,
      React$o.createElement(Attribution, { proOptions, position: attributionPosition }),
      React$o.createElement(A11yDescriptions, { rfId, disableKeyboardA11y })
    )
  );
});
ReactFlow.displayName = "ReactFlow";
const selector$1$2 = (s) => s.domNode?.querySelector(".react-flow__edgelabel-renderer");
function EdgeLabelRenderer({ children }) {
  const edgeLabelRenderer = useStore(selector$1$2);
  if (!edgeLabelRenderer) {
    return null;
  }
  return createPortal(children, edgeLabelRenderer);
}
function useUpdateNodeInternals() {
  const store = useStoreApi();
  return useCallback$9((id) => {
    const { domNode, updateNodeDimensions } = store.getState();
    const updateIds = Array.isArray(id) ? id : [id];
    const updates = updateIds.reduce((res, updateId) => {
      const nodeElement = domNode?.querySelector(`.react-flow__node[data-id="${updateId}"]`);
      if (nodeElement) {
        res.push({ id: updateId, nodeElement, forceUpdate: true });
      }
      return res;
    }, []);
    requestAnimationFrame(() => updateNodeDimensions(updates));
  }, []);
}
const edgesSelector = (state) => state.edges;
function useEdges() {
  const edges = useStore(edgesSelector, shallow$1);
  return edges;
}
function createUseItemsState(applyChanges2) {
  return (initialItems) => {
    const [items, setItems] = useState$h(initialItems);
    const onItemsChange = useCallback$9((changes) => setItems((items2) => applyChanges2(changes, items2)), []);
    return [items, setItems, onItemsChange];
  };
}
const useNodesState = createUseItemsState(applyNodeChanges);
const useEdgesState = createUseItemsState(applyEdgeChanges);

const React$n = await importShared('react');
const {memo: memo$f,useRef: useRef$7,useEffect: useEffect$a} = React$n;

const MiniMapNode = ({ id, x, y, width, height, style, color, strokeColor, strokeWidth, className, borderRadius, shapeRendering, onClick, selected, }) => {
    const { background, backgroundColor } = style || {};
    const fill = (color || background || backgroundColor);
    return (React$n.createElement("rect", { className: cc(['react-flow__minimap-node', { selected }, className]), x: x, y: y, rx: borderRadius, ry: borderRadius, width: width, height: height, fill: fill, stroke: strokeColor, strokeWidth: strokeWidth, shapeRendering: shapeRendering, onClick: onClick ? (event) => onClick(event, id) : undefined }));
};
MiniMapNode.displayName = 'MiniMapNode';
var MiniMapNode$1 = memo$f(MiniMapNode);

/* eslint-disable @typescript-eslint/ban-ts-comment */
const selector$1$1 = (s) => s.nodeOrigin;
const selectorNodes = (s) => s.getNodes().filter((node) => !node.hidden && node.width && node.height);
const getAttrFunction = (func) => (func instanceof Function ? func : () => func);
function MiniMapNodes({ nodeStrokeColor = 'transparent', nodeColor = '#e2e2e2', nodeClassName = '', nodeBorderRadius = 5, nodeStrokeWidth = 2, 
// We need to rename the prop to be `CapitalCase` so that JSX will render it as
// a component properly.
nodeComponent: NodeComponent = MiniMapNode$1, onClick, }) {
    const nodes = useStore(selectorNodes, shallow$1);
    const nodeOrigin = useStore(selector$1$1);
    const nodeColorFunc = getAttrFunction(nodeColor);
    const nodeStrokeColorFunc = getAttrFunction(nodeStrokeColor);
    const nodeClassNameFunc = getAttrFunction(nodeClassName);
    const shapeRendering = typeof window === 'undefined' || !!window.chrome ? 'crispEdges' : 'geometricPrecision';
    return (React$n.createElement(React$n.Fragment, null, nodes.map((node) => {
        const { x, y } = getNodePositionWithOrigin(node, nodeOrigin).positionAbsolute;
        return (React$n.createElement(NodeComponent, { key: node.id, x: x, y: y, width: node.width, height: node.height, style: node.style, selected: node.selected, className: nodeClassNameFunc(node), color: nodeColorFunc(node), borderRadius: nodeBorderRadius, strokeColor: nodeStrokeColorFunc(node), strokeWidth: nodeStrokeWidth, shapeRendering: shapeRendering, onClick: onClick, id: node.id }));
    })));
}
var MiniMapNodes$1 = memo$f(MiniMapNodes);

/* eslint-disable @typescript-eslint/ban-ts-comment */
const defaultWidth = 200;
const defaultHeight = 150;
const selector$2 = (s) => {
    const nodes = s.getNodes();
    const viewBB = {
        x: -s.transform[0] / s.transform[2],
        y: -s.transform[1] / s.transform[2],
        width: s.width / s.transform[2],
        height: s.height / s.transform[2],
    };
    return {
        viewBB,
        boundingRect: nodes.length > 0 ? getBoundsOfRects(getNodesBounds(nodes, s.nodeOrigin), viewBB) : viewBB,
        rfId: s.rfId,
    };
};
const ARIA_LABEL_KEY = 'react-flow__minimap-desc';
function MiniMap({ style, className, nodeStrokeColor = 'transparent', nodeColor = '#e2e2e2', nodeClassName = '', nodeBorderRadius = 5, nodeStrokeWidth = 2, 
// We need to rename the prop to be `CapitalCase` so that JSX will render it as
// a component properly.
nodeComponent, maskColor = 'rgb(240, 240, 240, 0.6)', maskStrokeColor = 'none', maskStrokeWidth = 1, position = 'bottom-right', onClick, onNodeClick, pannable = false, zoomable = false, ariaLabel = 'React Flow mini map', inversePan = false, zoomStep = 10, offsetScale = 5, }) {
    const store = useStoreApi();
    const svg = useRef$7(null);
    const { boundingRect, viewBB, rfId } = useStore(selector$2, shallow$1);
    const elementWidth = style?.width ?? defaultWidth;
    const elementHeight = style?.height ?? defaultHeight;
    const scaledWidth = boundingRect.width / elementWidth;
    const scaledHeight = boundingRect.height / elementHeight;
    const viewScale = Math.max(scaledWidth, scaledHeight);
    const viewWidth = viewScale * elementWidth;
    const viewHeight = viewScale * elementHeight;
    const offset = offsetScale * viewScale;
    const x = boundingRect.x - (viewWidth - boundingRect.width) / 2 - offset;
    const y = boundingRect.y - (viewHeight - boundingRect.height) / 2 - offset;
    const width = viewWidth + offset * 2;
    const height = viewHeight + offset * 2;
    const labelledBy = `${ARIA_LABEL_KEY}-${rfId}`;
    const viewScaleRef = useRef$7(0);
    viewScaleRef.current = viewScale;
    useEffect$a(() => {
        if (svg.current) {
            const selection = select(svg.current);
            const zoomHandler = (event) => {
                const { transform, d3Selection, d3Zoom } = store.getState();
                if (event.sourceEvent.type !== 'wheel' || !d3Selection || !d3Zoom) {
                    return;
                }
                const pinchDelta = -event.sourceEvent.deltaY *
                    (event.sourceEvent.deltaMode === 1 ? 0.05 : event.sourceEvent.deltaMode ? 1 : 0.002) *
                    zoomStep;
                const zoom = transform[2] * Math.pow(2, pinchDelta);
                d3Zoom.scaleTo(d3Selection, zoom);
            };
            const panHandler = (event) => {
                const { transform, d3Selection, d3Zoom, translateExtent, width, height } = store.getState();
                if (event.sourceEvent.type !== 'mousemove' || !d3Selection || !d3Zoom) {
                    return;
                }
                // @TODO: how to calculate the correct next position? Math.max(1, transform[2]) is a workaround.
                const moveScale = viewScaleRef.current * Math.max(1, transform[2]) * (inversePan ? -1 : 1);
                const position = {
                    x: transform[0] - event.sourceEvent.movementX * moveScale,
                    y: transform[1] - event.sourceEvent.movementY * moveScale,
                };
                const extent = [
                    [0, 0],
                    [width, height],
                ];
                const nextTransform = identity.translate(position.x, position.y).scale(transform[2]);
                const constrainedTransform = d3Zoom.constrain()(nextTransform, extent, translateExtent);
                d3Zoom.transform(d3Selection, constrainedTransform);
            };
            const zoomAndPanHandler = zoom()
                // @ts-ignore
                .on('zoom', pannable ? panHandler : null)
                // @ts-ignore
                .on('zoom.wheel', zoomable ? zoomHandler : null);
            selection.call(zoomAndPanHandler);
            return () => {
                selection.on('zoom', null);
            };
        }
    }, [pannable, zoomable, inversePan, zoomStep]);
    const onSvgClick = onClick
        ? (event) => {
            const rfCoord = pointer(event);
            onClick(event, { x: rfCoord[0], y: rfCoord[1] });
        }
        : undefined;
    const onSvgNodeClick = onNodeClick
        ? (event, nodeId) => {
            const node = store.getState().nodeInternals.get(nodeId);
            onNodeClick(event, node);
        }
        : undefined;
    return (React$n.createElement(Panel, { position: position, style: style, className: cc(['react-flow__minimap', className]), "data-testid": "rf__minimap" },
        React$n.createElement("svg", { width: elementWidth, height: elementHeight, viewBox: `${x} ${y} ${width} ${height}`, role: "img", "aria-labelledby": labelledBy, ref: svg, onClick: onSvgClick },
            ariaLabel && React$n.createElement("title", { id: labelledBy }, ariaLabel),
            React$n.createElement(MiniMapNodes$1, { onClick: onSvgNodeClick, nodeColor: nodeColor, nodeStrokeColor: nodeStrokeColor, nodeBorderRadius: nodeBorderRadius, nodeClassName: nodeClassName, nodeStrokeWidth: nodeStrokeWidth, nodeComponent: nodeComponent }),
            React$n.createElement("path", { className: "react-flow__minimap-mask", d: `M${x - offset},${y - offset}h${width + offset * 2}v${height + offset * 2}h${-width - offset * 2}z
        M${viewBB.x},${viewBB.y}h${viewBB.width}v${viewBB.height}h${-viewBB.width}z`, fill: maskColor, fillRule: "evenodd", stroke: maskStrokeColor, strokeWidth: maskStrokeWidth, pointerEvents: "none" }))));
}
MiniMap.displayName = 'MiniMap';
var MiniMap$1 = memo$f(MiniMap);

const React$m = await importShared('react');
const {memo: memo$e,useState: useState$g,useEffect: useEffect$9} = React$m;

function PlusIcon() {
    return (React$m.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 32" },
        React$m.createElement("path", { d: "M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" })));
}

function MinusIcon() {
    return (React$m.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 5" },
        React$m.createElement("path", { d: "M0 0h32v4.2H0z" })));
}

function FitViewIcon() {
    return (React$m.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 30" },
        React$m.createElement("path", { d: "M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z" })));
}

function LockIcon() {
    return (React$m.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 25 32" },
        React$m.createElement("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z" })));
}

function UnlockIcon() {
    return (React$m.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 25 32" },
        React$m.createElement("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z" })));
}

const ControlButton = ({ children, className, ...rest }) => (React$m.createElement("button", { type: "button", className: cc(['react-flow__controls-button', className]), ...rest }, children));
ControlButton.displayName = 'ControlButton';

const selector$1 = (s) => ({
    isInteractive: s.nodesDraggable || s.nodesConnectable || s.elementsSelectable,
    minZoomReached: s.transform[2] <= s.minZoom,
    maxZoomReached: s.transform[2] >= s.maxZoom,
});
const Controls = ({ style, showZoom = true, showFitView = true, showInteractive = true, fitViewOptions, onZoomIn, onZoomOut, onFitView, onInteractiveChange, className, children, position = 'bottom-left', }) => {
    const store = useStoreApi();
    const [isVisible, setIsVisible] = useState$g(false);
    const { isInteractive, minZoomReached, maxZoomReached } = useStore(selector$1, shallow$1);
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    useEffect$9(() => {
        setIsVisible(true);
    }, []);
    if (!isVisible) {
        return null;
    }
    const onZoomInHandler = () => {
        zoomIn();
        onZoomIn?.();
    };
    const onZoomOutHandler = () => {
        zoomOut();
        onZoomOut?.();
    };
    const onFitViewHandler = () => {
        fitView(fitViewOptions);
        onFitView?.();
    };
    const onToggleInteractivity = () => {
        store.setState({
            nodesDraggable: !isInteractive,
            nodesConnectable: !isInteractive,
            elementsSelectable: !isInteractive,
        });
        onInteractiveChange?.(!isInteractive);
    };
    return (React$m.createElement(Panel, { className: cc(['react-flow__controls', className]), position: position, style: style, "data-testid": "rf__controls" },
        showZoom && (React$m.createElement(React$m.Fragment, null,
            React$m.createElement(ControlButton, { onClick: onZoomInHandler, className: "react-flow__controls-zoomin", title: "zoom in", "aria-label": "zoom in", disabled: maxZoomReached },
                React$m.createElement(PlusIcon, null)),
            React$m.createElement(ControlButton, { onClick: onZoomOutHandler, className: "react-flow__controls-zoomout", title: "zoom out", "aria-label": "zoom out", disabled: minZoomReached },
                React$m.createElement(MinusIcon, null)))),
        showFitView && (React$m.createElement(ControlButton, { className: "react-flow__controls-fitview", onClick: onFitViewHandler, title: "fit view", "aria-label": "fit view" },
            React$m.createElement(FitViewIcon, null))),
        showInteractive && (React$m.createElement(ControlButton, { className: "react-flow__controls-interactive", onClick: onToggleInteractivity, title: "toggle interactivity", "aria-label": "toggle interactivity" }, isInteractive ? React$m.createElement(UnlockIcon, null) : React$m.createElement(LockIcon, null))),
        children));
};
Controls.displayName = 'Controls';
var Controls$1 = memo$e(Controls);

const React$l = await importShared('react');
const {memo: memo$d,useRef: useRef$6} = React$l;

var BackgroundVariant;
(function (BackgroundVariant) {
    BackgroundVariant["Lines"] = "lines";
    BackgroundVariant["Dots"] = "dots";
    BackgroundVariant["Cross"] = "cross";
})(BackgroundVariant || (BackgroundVariant = {}));

function LinePattern({ color, dimensions, lineWidth }) {
    return (React$l.createElement("path", { stroke: color, strokeWidth: lineWidth, d: `M${dimensions[0] / 2} 0 V${dimensions[1]} M0 ${dimensions[1] / 2} H${dimensions[0]}` }));
}
function DotPattern({ color, radius }) {
    return React$l.createElement("circle", { cx: radius, cy: radius, r: radius, fill: color });
}

const defaultColor = {
    [BackgroundVariant.Dots]: '#91919a',
    [BackgroundVariant.Lines]: '#eee',
    [BackgroundVariant.Cross]: '#e2e2e2',
};
const defaultSize = {
    [BackgroundVariant.Dots]: 1,
    [BackgroundVariant.Lines]: 1,
    [BackgroundVariant.Cross]: 6,
};
const selector = (s) => ({ transform: s.transform, patternId: `pattern-${s.rfId}` });
function Background({ id, variant = BackgroundVariant.Dots, 
// only used for dots and cross
gap = 20, 
// only used for lines and cross
size, lineWidth = 1, offset = 2, color, style, className, }) {
    const ref = useRef$6(null);
    const { transform, patternId } = useStore(selector, shallow$1);
    const patternColor = color || defaultColor[variant];
    const patternSize = size || defaultSize[variant];
    const isDots = variant === BackgroundVariant.Dots;
    const isCross = variant === BackgroundVariant.Cross;
    const gapXY = Array.isArray(gap) ? gap : [gap, gap];
    const scaledGap = [gapXY[0] * transform[2] || 1, gapXY[1] * transform[2] || 1];
    const scaledSize = patternSize * transform[2];
    const patternDimensions = isCross ? [scaledSize, scaledSize] : scaledGap;
    const patternOffset = isDots
        ? [scaledSize / offset, scaledSize / offset]
        : [patternDimensions[0] / offset, patternDimensions[1] / offset];
    return (React$l.createElement("svg", { className: cc(['react-flow__background', className]), style: {
            ...style,
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
        }, ref: ref, "data-testid": "rf__background" },
        React$l.createElement("pattern", { id: patternId + id, x: transform[0] % scaledGap[0], y: transform[1] % scaledGap[1], width: scaledGap[0], height: scaledGap[1], patternUnits: "userSpaceOnUse", patternTransform: `translate(-${patternOffset[0]},-${patternOffset[1]})` }, isDots ? (React$l.createElement(DotPattern, { color: patternColor, radius: scaledSize / offset })) : (React$l.createElement(LinePattern, { dimensions: patternDimensions, color: patternColor, lineWidth: lineWidth }))),
        React$l.createElement("rect", { x: "0", y: "0", width: "100%", height: "100%", fill: `url(#${patternId + id})` })));
}
Background.displayName = 'Background';
var Background$1 = memo$d(Background);

const {useRef: useRef$5,useCallback: useCallback$8} = await importShared('react');
function useFlowNodes() {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const undoStack = useRef$5([]);
  const redoStack = useRef$5([]);
  const nodeCallbacks = useRef$5({});
  const isUpdatingNodes = useRef$5(false);
  const handleNodesChange = useCallback$8(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );
  const handleEdgesChange = useCallback$8(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );
  const pushToUndoStack = useCallback$8(() => {
    undoStack.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    });
    redoStack.current = [];
  }, [nodes, edges]);
  const safeSetNodes = useCallback$8(
    (updater) => {
      pushToUndoStack();
      setNodes(updater);
    },
    [pushToUndoStack, setNodes]
  );
  const safeSetEdges = useCallback$8(
    (updater) => {
      pushToUndoStack();
      setEdges(updater);
    },
    [pushToUndoStack, setEdges]
  );
  const handleNodeSelection = useCallback$8(
    (nodeId) => {
      if (isUpdatingNodes.current) return;
      isUpdatingNodes.current = true;
      setNodes((nds) => {
        const updatedNodes = nds.map((node) => ({
          ...node,
          selected: node.id === nodeId
        }));
        requestAnimationFrame(() => {
          isUpdatingNodes.current = false;
        });
        return updatedNodes;
      });
    },
    [setNodes]
  );
  const getNodeCallbacks = useCallback$8(
    (nodeId, nodeType) => {
      if (nodeCallbacks.current[nodeId]) {
        return nodeCallbacks.current[nodeId];
      }
      const callbacks = {};
      callbacks.onSelect = () => {
        handleNodeSelection(nodeId);
      };
      switch (nodeType) {
        case "customInput":
          callbacks.addField = () => {
            safeSetNodes(
              (nds) => nds.map((node) => {
                if (node.id === nodeId) {
                  const fields = Array.isArray(node.data.fields) ? [...node.data.fields] : [];
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      fields: [
                        ...fields,
                        {
                          inputName: "New Input",
                          defaultValue: "Default value"
                        }
                      ]
                    }
                  };
                }
                return node;
              })
            );
          };
          callbacks.updateFieldInputName = (index, value) => {
            safeSetNodes(
              (nds) => nds.map((node) => {
                if (node.id === nodeId) {
                  const fields = node.data.fields || [];
                  if (index >= 0 && index < fields.length) {
                    const updatedFields = [...fields];
                    updatedFields[index] = {
                      ...updatedFields[index],
                      inputName: value
                    };
                    return {
                      ...node,
                      data: {
                        ...node.data,
                        fields: updatedFields
                      }
                    };
                  }
                }
                return node;
              })
            );
          };
          callbacks.updateFieldDefaultValue = (index, value) => {
            safeSetNodes(
              (nds) => nds.map((node) => {
                if (node.id === nodeId) {
                  const fields = node.data.fields || [];
                  if (index >= 0 && index < fields.length) {
                    const updatedFields = [...fields];
                    updatedFields[index] = {
                      ...updatedFields[index],
                      defaultValue: value
                    };
                    return {
                      ...node,
                      data: {
                        ...node.data,
                        fields: updatedFields
                      }
                    };
                  }
                }
                return node;
              })
            );
          };
          break;
        case "browserExtensionInput":
          callbacks.addItem = () => {
            safeSetNodes(
              (nds) => nds.map((node) => {
                if (node.id === nodeId) {
                  const currentItems = node.data.items || [];
                  const newItemId = `a${currentItems.length + 1}`;
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      items: [
                        ...currentItems,
                        { id: newItemId, name: "New Item", icon: "document" }
                      ]
                    }
                  };
                }
                return node;
              })
            );
          };
          callbacks.updateItemName = (index, name) => {
            safeSetNodes(
              (nds) => nds.map((node) => {
                if (node.id === nodeId) {
                  const updatedItems = [...node.data.items];
                  updatedItems[index] = {
                    ...updatedItems[index],
                    name
                  };
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      items: updatedItems
                    }
                  };
                }
                return node;
              })
            );
          };
          break;
        default:
          callbacks.updateNodeData = (key, value) => {
            safeSetNodes(
              (nds) => nds.map((node) => {
                if (node.id === nodeId) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      [key]: value
                    }
                  };
                }
                return node;
              })
            );
          };
          break;
      }
      if (!callbacks.updateNodeData) {
        callbacks.updateNodeData = (key, value) => {
          safeSetNodes(
            (nds) => nds.map((node) => {
              if (node.id === nodeId) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    [key]: value
                  }
                };
              }
              return node;
            })
          );
        };
      }
      nodeCallbacks.current[nodeId] = callbacks;
      return callbacks;
    },
    [handleNodeSelection, safeSetNodes]
  );
  const onNodesDelete = useCallback$8(
    (nodesToDelete) => {
      if (!nodesToDelete || nodesToDelete.length === 0) return;
      const nodeIdsToDelete = nodesToDelete.map((node) => node.id);
      nodesToDelete.forEach((nodeToDelete) => {
        const connectedEdges = getConnectedEdges([nodeToDelete], edges);
        const incomers = getIncomers(nodeToDelete, nodes, edges);
        const outgoers = getOutgoers(nodeToDelete, nodes, edges);
        incomers.forEach((incomer) => {
          outgoers.forEach((outgoer) => {
            const incomerEdge = connectedEdges.find(
              (edge) => edge.source === incomer.id && edge.target === nodeToDelete.id
            );
            const outgoerEdge = connectedEdges.find(
              (edge) => edge.source === nodeToDelete.id && edge.target === outgoer.id
            );
            if (incomerEdge && outgoerEdge) {
              const isAIOutgoer = outgoer.type === "aiCustomInput" || outgoer.type === "ai";
              if (isAIOutgoer) {
                const existingEdges = edges.filter(
                  (edge) => edge.source !== nodeToDelete.id && // 不計算將被刪除的節點
                  edge.target === outgoer.id && edge.targetHandle === outgoerEdge.targetHandle
                );
                if (existingEdges.length > 0) {
                  console.log(
                    `AI節點 ${outgoer.id} 的 ${outgoerEdge.targetHandle} 已有其他連線，不建立新連接`
                  );
                  return;
                }
              }
              if (outgoer.type === "browserExtensionOutput") {
                console.log(
                  `處理刪除後的連接重建: ${incomer.id} -> ${outgoer.id}:${outgoerEdge.targetHandle}`
                );
                const newEdgeId = `${incomer.id}-${outgoer.id}-${outgoerEdge.targetHandle}-${incomerEdge.sourceHandle || "output"}`;
                const newEdge = {
                  id: newEdgeId,
                  source: incomer.id,
                  target: outgoer.id,
                  sourceHandle: incomerEdge.sourceHandle || "output",
                  targetHandle: outgoerEdge.targetHandle,
                  type: outgoerEdge.type || "custom-edge"
                };
                safeSetEdges((eds) => [...eds, newEdge]);
              } else {
                const newEdge = {
                  id: `${incomer.id}-${outgoer.id}`,
                  source: incomer.id,
                  target: outgoer.id,
                  sourceHandle: incomerEdge.sourceHandle || "output",
                  targetHandle: outgoerEdge.targetHandle || "input",
                  type: outgoerEdge.type || "custom-edge"
                };
                safeSetEdges((eds) => [...eds, newEdge]);
              }
            }
          });
        });
      });
      safeSetEdges(
        (eds) => eds.filter(
          (edge) => !nodeIdsToDelete.includes(edge.source) && !nodeIdsToDelete.includes(edge.target)
        )
      );
      nodeIdsToDelete.forEach((nodeId) => {
        delete nodeCallbacks.current[nodeId];
      });
      safeSetNodes(
        (nds) => nds.filter((node) => !nodeIdsToDelete.includes(node.id))
      );
    },
    [
      nodes,
      edges,
      safeSetEdges,
      safeSetNodes,
      getConnectedEdges,
      getIncomers,
      getOutgoers
    ]
  );
  const deleteSelectedNodes = useCallback$8(
    (selectedNodes) => {
      if (!selectedNodes || selectedNodes.length === 0) return;
      onNodesDelete(selectedNodes);
    },
    [onNodesDelete]
  );
  const handleAddInputNode = useCallback$8(
    (position) => {
      const id = `input_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, "customInput");
      const newNode = {
        id,
        type: "customInput",
        position: position || { x: 250, y: 25 },
        data: {
          // 初始化一個默認字段
          fields: [
            {
              inputName: "input_name",
              defaultValue: "Summary the input text"
            }
          ],
          // 添加所有回調
          ...nodeCallbacksObject
        }
      };
      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );
  const handleAddAINode = useCallback$8(
    (position) => {
      const id = `ai_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, "aiCustomInput");
      const newNode = {
        id,
        type: "aiCustomInput",
        data: {
          model: "O3-mini",
          selectedOption: "prompt",
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };
      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );
  const handleAddBrowserExtensionOutput = useCallback$8(
    (position) => {
      const id = `browserExtOut_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(
        id,
        "browserExtensionOutput"
      );
      const newNode = {
        id,
        type: "browserExtensionOutput",
        data: {
          // 確保默認有一個 input handle
          inputHandles: [{ id: "input" }],
          // 儲存節點輸入連接關聯
          node_input: {},
          onAddOutput: (newInputHandles) => {
            console.log(`更新節點 ${id} 的 handle：`, newInputHandles);
            const currentNode = nodes.find((node) => node.id === id);
            if (currentNode && currentNode.data && JSON.stringify(currentNode.data.inputHandles) === JSON.stringify(newInputHandles)) {
              console.log("handles 沒有變化，跳過更新");
              return;
            }
            safeSetNodes(
              (nds) => nds.map((node) => {
                if (node.id === id) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      inputHandles: newInputHandles
                    }
                  };
                }
                return node;
              })
            );
          },
          // 添加一個可以移除 handle 的函數
          onRemoveHandle: (handleId) => {
            console.log(`準備移除節點 ${id} 的 handle：${handleId}`);
            if (handleId === "input") {
              console.log("不能移除默認 input handle");
              return;
            }
            safeSetNodes(
              (nds) => nds.map((node) => {
                if (node.id === id) {
                  const currentHandles = node.data.inputHandles || [];
                  const updatedHandles = currentHandles.filter(
                    (handle) => handle.id !== handleId
                  );
                  const currentNodeInput = node.data.node_input || {};
                  const updatedNodeInput = { ...currentNodeInput };
                  delete updatedNodeInput[handleId];
                  console.log(`已從節點 ${id} 移除 handle ${handleId}`);
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      inputHandles: updatedHandles,
                      node_input: updatedNodeInput
                    }
                  };
                }
                return node;
              })
            );
          },
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };
      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks, nodes]
  );
  const handleAddBrowserExtensionInput = useCallback$8(
    (position) => {
      const id = `browserExtIn_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, "browserExtensionInput");
      const newNode = {
        id,
        type: "browserExtensionInput",
        data: {
          // 初始化時為每個項目添加對應的ID
          items: [{ id: "a1", name: "", icon: "upload" }],
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };
      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );
  const handleAddNode = useCallback$8(
    (position) => {
      const id = `default_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, "default");
      const newNode = {
        id,
        type: "default",
        data: {
          label: "新節點",
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };
      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );
  const handleAddIfElseNode = useCallback$8(
    (position) => {
      const id = `ifelse_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, "ifElse");
      const newNode = {
        id,
        type: "ifElse",
        data: {
          variableName: "formate_value",
          operator: "equals",
          compareValue: "Hello",
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };
      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );
  const handleAddHTTPNode = useCallback$8(
    (position) => {
      const id = `http_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, "http");
      const newNode = {
        id,
        type: "http",
        data: {
          url: "",
          // 默認空 URL
          method: "GET",
          // 默認 HTTP 方法
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };
      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );
  const handleAddLineNode = useCallback$8(
    (position) => {
      const id = `line_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, "line");
      const newNode = {
        id,
        type: "line",
        data: {
          mode: "reply",
          // 默認為回覆模式
          text: "",
          // 默認空文字
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };
      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );
  const handleAddKnowledgeRetrievalNode = useCallback$8(
    (position) => {
      const id = `knowledge_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, "knowledgeRetrieval");
      const newNode = {
        id,
        type: "knowledgeRetrieval",
        data: {
          availableFiles: [
            { id: "icdcode", name: "ICDCode.csv" },
            { id: "cardiology", name: "Cardiology_Diagnoses.csv" }
          ],
          selectedFile: "",
          // 默認不選擇
          topK: 5,
          // 添加默認的 top_k 值
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };
      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );
  const handleAddEndNode = useCallback$8(
    (position) => {
      const id = `end_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, "end");
      const newNode = {
        id,
        type: "end",
        data: {
          outputText: "",
          // 默認空輸出文字
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };
      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );
  const handleAddWebhookNode = useCallback$8(
    (position) => {
      const id = `webhook_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, "webhook");
      const newNode = {
        id,
        type: "webhook",
        data: {
          webhookUrl: "",
          // 默認空 URL
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };
      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );
  const handleAddTimerNode = useCallback$8(
    (position) => {
      const id = `timer_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, "timer");
      const newNode = {
        id,
        type: "timer",
        data: {
          hours: 0,
          minutes: 0,
          seconds: 0,
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };
      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );
  const handleAddEventNode = useCallback$8(
    (position) => {
      const id = `event_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, "event");
      const newNode = {
        id,
        type: "event",
        data: {
          hours: 0,
          minutes: 0,
          seconds: 0,
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };
      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );
  const onConnect = useCallback$8(
    (params) => {
      const sourceHandle = params.sourceHandle || "output";
      const targetNodeId = params.target;
      let targetHandle = params.targetHandle;
      console.log(
        `嘗試連接: 從 ${params.source}:${sourceHandle} 到 ${targetNodeId}:${targetHandle}`
      );
      const targetNode = nodes.find((node) => node.id === targetNodeId);
      const isBrowserExtensionOutput = targetNode && targetNode.type === "browserExtensionOutput";
      const isAINode = targetNode && (targetNode.type === "aiCustomInput" || targetNode.type === "ai");
      const sourceNode = nodes.find((node) => node.id === params.source);
      const isBrowserExtensionInput = sourceNode && sourceNode.type === "browserExtensionInput";
      const isCustomInputNode = sourceNode && sourceNode.type === "customInput";
      if (isCustomInputNode) {
        console.log("源節點是CustomInputNode，檢查連線限制");
        const existingEdges = edges.filter(
          (edge) => edge.source === params.source && edge.sourceHandle === sourceHandle
        );
        if (existingEdges.length > 0) {
          console.log(`Input的輸出已有連線，拒絕新連線`);
          if (typeof window !== "undefined" && window.notify) {
            window.notify({
              message: `Input已有連線，請先刪除現有連線`,
              type: "error",
              duration: 3e3
            });
          }
          return;
        }
      }
      if (targetNode && targetNode.type === "knowledgeRetrieval") {
        console.log("目標是知識檢索節點，檢查連線限制");
        const existingEdges = edges.filter(
          (edge) => edge.target === targetNodeId && edge.targetHandle === "passage"
        );
        if (existingEdges.length > 0) {
          console.log(`知識檢索節點已有輸入連線，拒絕新連線`);
          if (typeof window !== "undefined" && window.notify) {
            window.notify({
              message: `知識檢索節點只能有一個輸入連線，請先刪除現有連線`,
              type: "error",
              duration: 3e3
            });
          }
          return;
        }
      }
      if (sourceNode && sourceNode.type === "knowledgeRetrieval") {
        console.log("源節點是知識檢索節點，檢查連線限制");
        const existingEdges = edges.filter(
          (edge) => edge.source === params.source && edge.sourceHandle === "output"
        );
        if (existingEdges.length > 0) {
          console.log(`知識檢索節點已有輸出連線，拒絕新連線`);
          if (typeof window !== "undefined" && window.notify) {
            window.notify({
              message: `知識檢索節點只能有一個輸出連線，請先刪除現有連線`,
              type: "error",
              duration: 3e3
            });
          }
          return;
        }
      }
      if (isAINode) {
        console.log("目標是AI節點，檢查連線限制");
        if (targetHandle === "prompt-input") {
          const existingEdges = edges.filter(
            (edge) => edge.target === targetNodeId && edge.targetHandle === "prompt-input"
          );
          if (existingEdges.length > 0) {
            console.log(`AI節點的 Prompt 已有連線，拒絕新連線`);
            if (typeof window !== "undefined" && window.notify) {
              window.notify({
                message: `AI節點的 Prompt 已有連線，請先刪除現有連線`,
                type: "error",
                duration: 3e3
              });
            }
            return;
          }
        }
      }
      if (isBrowserExtensionOutput) {
        console.log("目標是瀏覽器擴展輸出節點");
        if (targetHandle === "new-connection" || !targetHandle) {
          targetHandle = `input_${Date.now()}`;
          console.log(`創建新的 handle: ${targetHandle}`);
          const currentHandles = targetNode.data.inputHandles || [];
          safeSetNodes(
            (nds) => nds.map((node) => {
              if (node.id === targetNodeId) {
                const newHandles = [...currentHandles, { id: targetHandle }];
                console.log(`更新節點 ${targetNodeId} 的 handles:`, newHandles);
                return {
                  ...node,
                  data: {
                    ...node.data,
                    inputHandles: newHandles
                  }
                };
              }
              return node;
            })
          );
        }
        safeSetEdges((eds) => {
          if (!Array.isArray(eds)) {
            console.error("edges 不是數組:", eds);
            return [];
          }
          const connectionExists = eds.some(
            (edge) => edge.source === params.source && edge.target === targetNodeId && edge.targetHandle === targetHandle && edge.sourceHandle === sourceHandle
          );
          if (connectionExists) {
            console.log(`連接已存在，不重複創建`);
            return eds;
          }
          const edgeId = `${params.source}-${targetNodeId}-${targetHandle}-${sourceHandle}-${Date.now()}`;
          const newEdge = {
            id: edgeId,
            source: params.source,
            target: targetNodeId,
            sourceHandle,
            targetHandle,
            type: "custom-edge"
          };
          console.log(`創建新連接:`, newEdge);
          return [...eds, newEdge];
        });
        setTimeout(() => {
          try {
            const event = new CustomEvent("nodeInternalsChanged", {
              detail: { id: targetNodeId }
            });
            window.dispatchEvent(event);
          } catch (error) {
            console.error("無法刷新節點:", error);
          }
        }, 10);
      } else {
        try {
          const edgeId = `${params.source}-${targetNodeId}-${targetHandle || "input"}-${sourceHandle}-${Date.now()}`;
          let edgeConfig = {
            ...params,
            id: edgeId,
            type: "custom-edge"
          };
          if (isBrowserExtensionInput && sourceNode?.data?.items) {
            const itemIndex = sourceNode.data.items.findIndex((item, idx) => {
              const outputKey = item.id || `a${idx + 1}`;
              return outputKey === sourceHandle;
            });
            if (itemIndex !== -1 && sourceNode.data.items[itemIndex]) {
              edgeConfig.label = sourceNode.data.items[itemIndex].name || "";
              console.log(`設置連接標籤為項目名稱: ${edgeConfig.label}`);
            }
          }
          safeSetEdges((currentEdges) => {
            if (!Array.isArray(currentEdges)) {
              console.error("當前 edges 不是數組:", currentEdges);
              return [];
            }
            return addEdge(edgeConfig, currentEdges);
          });
        } catch (error) {
          console.error("在使用 addEdge 時出錯:", error);
          safeSetEdges((eds) => {
            if (!Array.isArray(eds)) {
              console.error("edges 不是數組:", eds);
              return [];
            }
            const edgeId = `${params.source}-${targetNodeId}-${targetHandle || "input"}-${sourceHandle}-${Date.now()}`;
            const newEdge = {
              id: edgeId,
              source: params.source,
              target: targetNodeId,
              sourceHandle,
              targetHandle: targetHandle || "input",
              type: "custom-edge"
            };
            return [...eds, newEdge];
          });
        }
      }
    },
    [nodes, safeSetNodes, safeSetEdges, edges]
  );
  const undo = useCallback$8(() => {
    if (undoStack.current.length === 0) return;
    redoStack.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    });
    const prev = undoStack.current.pop();
    setNodes(prev.nodes);
    setEdges(prev.edges);
  }, [nodes, edges, setNodes, setEdges]);
  const redo = useCallback$8(() => {
    if (redoStack.current.length === 0) return;
    undoStack.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    });
    const next = redoStack.current.pop();
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [nodes, edges, setNodes, setEdges]);
  const updateNodeLabel = useCallback$8(
    (id, label) => {
      safeSetNodes(
        (nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label } } : n)
      );
    },
    [safeSetNodes]
  );
  const updateNodeFunctions = useCallback$8(() => {
    const updatedNodes = [...nodes];
    let hasChanges = false;
    console.log("開始檢查並更新所有節點的回調函數...");
    nodes.forEach((node, index) => {
      const nodeId = node.id;
      const nodeType = node.type;
      let missingCallbacks = false;
      switch (nodeType) {
        case "customInput":
          missingCallbacks = !node.data.addField || !node.data.updateFieldInputName || !node.data.updateFieldDefaultValue || !node.data.onSelect;
          break;
        case "browserExtensionInput":
          missingCallbacks = !node.data.addItem || !node.data.updateItemName || !node.data.onSelect;
          break;
        default:
          missingCallbacks = !node.data.onSelect || !node.data.updateNodeData;
          break;
      }
      if (missingCallbacks) {
        console.log(
          `節點 ${nodeId} (類型: ${nodeType}) 缺少必要回調，正在更新...`
        );
        const callbacks = getNodeCallbacks(nodeId, nodeType);
        updatedNodes[index] = {
          ...updatedNodes[index],
          data: {
            ...updatedNodes[index].data,
            ...callbacks
          }
        };
        hasChanges = true;
      }
    });
    if (hasChanges) {
      console.log("有節點回調函數需要更新，正在應用變更...");
      setNodes(updatedNodes);
    } else {
      console.log("所有節點回調函數已經是最新，無需更新。");
    }
  }, [nodes, getNodeCallbacks, setNodes]);
  return {
    nodes,
    setNodes: safeSetNodes,
    edges,
    setEdges: safeSetEdges,
    onNodesChange: handleNodesChange,
    // 使用優化過的變更處理器
    onEdgesChange: handleEdgesChange,
    onConnect,
    onNodesDelete,
    handleAddNode,
    handleAddInputNode,
    handleAddAINode,
    handleAddBrowserExtensionInput,
    handleAddBrowserExtensionOutput,
    updateNodeLabel,
    deleteSelectedNodes,
    handleAddIfElseNode,
    handleAddKnowledgeRetrievalNode,
    handleAddWebhookNode,
    handleAddHTTPNode,
    handleAddLineNode,
    handleAddEventNode,
    updateNodeFunctions,
    handleAddEndNode,
    handleAddTimerNode,
    handleNodeSelection,
    undo,
    redo,
    getNodeCallbacks
  };
}

const __vite_import_meta_env__ = {"BASE_URL": "/agent-editor/", "DEV": false, "MODE": "production", "PROD": true, "SSR": false, "VITE_APP_BUILD_ID": "5c2ea20c499fa756e9ff4b5d414f51db1753406b", "VITE_APP_BUILD_TIME": "2025-05-14T02:21:12.013Z", "VITE_APP_GIT_BRANCH": "main", "VITE_APP_VERSION": "0.1.85"};
function getEnvVar(name, defaultValue) {
  if (typeof window !== "undefined" && window.ENV && window.ENV[name]) {
    return window.ENV[name];
  }
  if (typeof import.meta !== "undefined" && __vite_import_meta_env__ && __vite_import_meta_env__[name]) {
    return __vite_import_meta_env__[name];
  }
  return defaultValue;
}
class VersionService {
  constructor() {
    this.version = getEnvVar("VITE_APP_VERSION", "0.0.0");
    this.buildTime = getEnvVar("VITE_APP_BUILD_TIME", (/* @__PURE__ */ new Date()).toISOString());
    this.buildId = getEnvVar("VITE_APP_BUILD_ID", "development");
    this.environment = getEnvVar("MODE", "development");
  }
  /**
   * 獲取完整的版本信息
   * @returns {Object} 版本信息
   */
  getVersionInfo() {
    return {
      version: this.version,
      buildTime: this.buildTime,
      buildId: this.buildId,
      environment: this.environment
    };
  }
  /**
   * 獲取版本號
   * @param {string} version 版本號
   */
  getVersion() {
    return this.version;
  }
  /**
   * 獲取格式化的版本字串
   * @returns {string} 格式化的版本字串
   */
  getFormattedVersion() {
    const buildIdDisplay = this.buildId && this.buildId !== "development" ? this.buildId.substring(0, 7) : "dev";
    return `v${this.version} (${buildIdDisplay})`;
  }
}
const versionService = new VersionService();

await importShared('react');
const VersionDisplay = ({ className = "" }) => {
  const versionInfo = versionService.getVersionInfo();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `version-display text-xs text-gray-500 ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "version-number", children: versionService.getFormattedVersion() }),
    versionInfo.environment !== "production" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "version-environment ml-1", children: [
      "(",
      versionInfo.environment,
      ")"
    ] })
  ] });
};

const iconInputNode = "data:image/svg+xml,%3csvg%20width='32'%20height='32'%20viewBox='0%200%2032%2032'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M0%206a6%206%200%200%201%206-6h20a6%206%200%200%201%206%206v20a6%206%200%200%201-6%206H6a6%206%200%200%201-6-6V6z'%20fill='%23DBEAFE'/%3e%3cpath%20d='M6%208h20v16H6V8z'%20stroke='%23E5E7EB'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M15.356%209.478c-3.82%200-6.915%203.144-6.915%207.022s3.096%207.022%206.915%207.022c3.82%200%206.915-3.144%206.915-7.022s-3.096-7.022-6.915-7.022zM6%2016.5C6%2011.253%2010.189%207%2015.356%207s9.356%204.253%209.356%209.5-4.189%209.5-9.356%209.5S6%2021.747%206%2016.5z'%20fill='%230075FF'/%3e%3cpath%20d='M18.61%2016.5c0%201.825-1.457%203.304-3.254%203.304s-3.254-1.479-3.254-3.304c0-1.825%201.457-3.304%203.254-3.304s3.254%201.48%203.254%203.304z'%20fill='%230075FF'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M14.136%2016.5c0-.684.546-1.24%201.22-1.24H28.78c.673%200%201.22.556%201.22%201.24a1.23%201.23%200%200%201-1.22%201.24H15.356a1.23%201.23%200%200%201-1.22-1.24z'%20fill='%230075FF'/%3e%3c/svg%3e";

const iconAINode = "data:image/svg+xml,%3csvg%20width='32'%20height='32'%20viewBox='0%200%2032%2032'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M0%206a6%206%200%200%201%206-6h20a6%206%200%200%201%206%206v20a6%206%200%200%201-6%206H6a6%206%200%200%201-6-6V6z'%20fill='%23FEF3C7'/%3e%3cpath%20d='M0%206a6%206%200%200%201%206-6h20a6%206%200%200%201%206%206v20a6%206%200%200%201-6%206H6a6%206%200%200%201-6-6V6z'%20stroke='%23FFEDD5'/%3e%3cpath%20d='M16%204a12%2012%200%200%200%2012%2012%2012%2012%200%200%200-12%2012A12%2012%200%200%200%204%2016%2012%2012%200%200%200%2016%204z'%20fill='%23FFAA1E'/%3e%3cpath%20d='m9.798%209.798-3.46-3.459M9.798%2020.413l-3.46%203.459M22.458%209.798l3.459-3.459M22.458%2020.413l3.459%203.459'%20stroke='%23FFAA1E'%20stroke-linecap='round'/%3e%3c/svg%3e";

const browserNode = "data:image/svg+xml,%3csvg%20width='32'%20height='32'%20viewBox='0%200%2032%2032'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M0%206a6%206%200%200%201%206-6h20a6%206%200%200%201%206%206v20a6%206%200%200%201-6%206H6a6%206%200%200%201-6-6V6z'%20fill='%231FC1B1'/%3e%3cmask%20id='qbkj6lvyla'%20style='mask-type:luminance'%20maskUnits='userSpaceOnUse'%20x='5'%20y='6'%20width='22'%20height='20'%3e%3cpath%20d='M26.479%206H5v20h21.479V6z'%20fill='%23fff'/%3e%3c/mask%3e%3cg%20mask='url(%23qbkj6lvyla)'%20fill='%23fff'%3e%3cpath%20d='M15.45%2016a5.399%205.399%200%200%201-4.951%200%205.399%205.399%200%200%201%204.95%200zM16.03%2016a5.396%205.396%200%200%201%204.95%200%205.394%205.394%200%200%201-4.95%200zM13.118%2011.46a5.398%205.398%200%200%201%202.477%204.287%205.416%205.416%200%200%201-2.477-4.286zM15.595%2016.253a5.4%205.4%200%200%201-2.477%204.287%205.418%205.418%200%200%201%202.477-4.287zM15.886%2016.253a5.416%205.416%200%200%201%202.477%204.287%205.399%205.399%200%200%201-2.477-4.287zM15.886%2015.747a5.394%205.394%200%200%201%202.477-4.286%205.416%205.416%200%200%201-2.477%204.286zM10.372%206.699a5.21%205.21%200%200%201%204.7-.254%205.893%205.893%200%200%200-2.41%204.228%205.844%205.844%200%200%200-4.862-.025%205.22%205.22%200%200%201%202.572-3.95zM23.707%2011.401a5.198%205.198%200%200%201-2.129%204.002%205.869%205.869%200%200%200-2.409-4.162%205.195%205.195%200%200%201%204.538.157M21.274%2021.203c-.725.001-1.443-.15-2.106-.444a5.87%205.87%200%200%200%202.41-4.162%205.196%205.196%200%200%201%202.127%204.002%205.176%205.176%200%200%201-2.431.604M7.777%2020.6a5.185%205.185%200%200%201%202.129-4.003%205.863%205.863%200%200%200%202.407%204.162%205.19%205.19%200%200%201-4.536-.157M10.205%2010.797a5.172%205.172%200%200%201%202.106.444%205.864%205.864%200%200%200-2.407%204.162%205.184%205.184%200%200%201-2.129-4.002%205.17%205.17%200%200%201%202.43-.604M18.144%2021.35a5.2%205.2%200%200%201-2.403%203.853%205.204%205.204%200%200%201-2.405-3.853%205.844%205.844%200%200%200%204.808%200z'/%3e%3cpath%20d='M13.336%2010.65a5.208%205.208%200%200%201%202.405-3.853%205.197%205.197%200%200%201%202.403%203.853%205.842%205.842%200%200%200-4.808%200zM5%2016a5.199%205.199%200%200%201%202.134-4.198A5.86%205.86%200%200%200%209.592%2016a5.86%205.86%200%200%200-2.458%204.197A5.197%205.197%200%200%201%205%2016zM14.319%2025.82a5.163%205.163%200%200%201-3.947-.52%205.22%205.22%200%200%201-2.57-3.95%205.841%205.841%200%200%200%204.862-.025%205.877%205.877%200%200%200%202.41%204.23%205.232%205.232%200%200%201-.755.265zM21.11%2025.3a5.162%205.162%200%200%201-3.95.52%205.322%205.322%200%200%201-.755-.265%205.883%205.883%200%200%200%202.414-4.23%205.84%205.84%200%200%200%204.862.026%205.222%205.222%200%200%201-2.57%203.95M26.479%2016a5.202%205.202%200%200%201-2.133%204.198A5.865%205.865%200%200%200%2021.89%2016a5.865%205.865%200%200%200%202.457-4.198A5.2%205.2%200%200%201%2026.48%2016z'/%3e%3cpath%20d='M21.11%206.699a5.217%205.217%200%200%201%202.568%203.95%205.85%205.85%200%200%200-4.861.025%205.878%205.878%200%200%200-2.412-4.23c.245-.107.498-.196.756-.265a5.166%205.166%200%200%201%203.948.52z'/%3e%3c/g%3e%3c/svg%3e";

const knowledgeNode = "/agent-editor/assets/icn-knowledge-BSj19GCR.svg";

await importShared('react');
const iconMap = {
  input: {
    src: iconInputNode,
    alt: "Input Icon"
  },
  ai: {
    src: iconAINode,
    alt: "AI Icon"
  },
  browser: {
    src: browserNode,
    alt: "Browser Icon"
  },
  knowledge: {
    src: knowledgeNode,
    alt: "Knowledge Icon"
  }
};
const IconBase = ({ type, className = "" }) => {
  if (!iconMap[type]) {
    console.warn(`Icon type "${type}" not found`);
    return null;
  }
  const { src, alt } = iconMap[type];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `flex items-center justify-center ${className}`,
      style: {
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src,
          alt,
          width: 32,
          height: 32,
          className: "max-w-full max-h-full object-contain",
          style: {
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain"
          }
        }
      )
    }
  );
};

const dragIcon = "data:image/svg+xml,%3csvg%20width='12'%20height='20'%20viewBox='0%200%2012%2020'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M2%204a2%202%200%201%200%200-4%202%202%200%200%200%200%204zM2%2020a2%202%200%201%200%200-4%202%202%200%200%200%200%204zM10%204a2%202%200%201%200%200-4%202%202%200%200%200%200%204zM10%2020a2%202%200%201%200%200-4%202%202%200%200%200%200%204zM10%2012a2%202%200%201%200%200-4%202%202%200%200%200%200%204zM2%2012a2%202%200%201%200%200-4%202%202%200%200%200%200%204z'%20fill='%23000'/%3e%3c/svg%3e";

const React$k = await importShared('react');
const {useState: useState$f} = React$k;
const NodeSidebar = ({ handleButtonClick, onDragStart: customDragStart }) => {
  const [searchTerm, setSearchTerm] = useState$f("");
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const filterNodes = (label) => {
    if (!searchTerm) return true;
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-64 bg-white p-4 shadow-md h-full overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          placeholder: "Search nodes...",
          className: "w-full p-2 pl-3 pr-10 border rounded-md",
          onChange: handleSearch,
          value: searchTerm
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          width: "16",
          height: "16",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "circle",
              {
                cx: "11",
                cy: "11",
                r: "8"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "line",
              {
                x1: "21",
                y1: "21",
                x2: "16.65",
                y2: "16.65"
              }
            )
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      filterNodes("Input") && /* @__PURE__ */ jsxRuntimeExports.jsx(
        NodeItem,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconBase, { type: "input" }) }),
          label: "Input",
          onClick: () => handleButtonClick("input"),
          nodeType: "input",
          onDragStart: customDragStart
        }
      ),
      filterNodes("AI") && /* @__PURE__ */ jsxRuntimeExports.jsx(
        NodeItem,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconBase, { type: "ai" }) }),
          label: "AI",
          onClick: () => handleButtonClick("ai"),
          nodeType: "ai",
          onDragStart: customDragStart
        }
      ),
      filterNodes("Browser Extension input") && /* @__PURE__ */ jsxRuntimeExports.jsx(
        NodeItem,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconBase, { type: "browser" }) }),
          label: "Browser Extension input",
          onClick: () => handleButtonClick("browser extension input"),
          nodeType: "browser extension input",
          onDragStart: customDragStart
        }
      ),
      filterNodes("Browser Extension output") && /* @__PURE__ */ jsxRuntimeExports.jsx(
        NodeItem,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconBase, { type: "browser" }) }),
          label: "Browser Extension output",
          onClick: () => handleButtonClick("browser extension output"),
          nodeType: "browser extension output",
          onDragStart: customDragStart
        }
      ),
      filterNodes("Knowledge Retrieval") && /* @__PURE__ */ jsxRuntimeExports.jsx(
        NodeItem,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconBase, { type: "knowledge" }) }),
          label: "Knowledge Retrieval",
          onClick: () => handleButtonClick("knowledge retrieval"),
          nodeType: "knowledge retrieval",
          onDragStart: customDragStart
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(VersionDisplay, {})
  ] });
};
const NodeItem = ({ icon, label, onClick, nodeType, onDragStart }) => {
  const handleDragStart = (event) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
    if (onDragStart) {
      onDragStart(event, nodeType);
    }
  };
  const handleDragEnd = (event) => {
    event.currentTarget.classList.remove("dragging");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "node-item border flex items-center justify-between p-2 rounded-lg cursor-grab hover:bg-gray-50 transition-colors",
      onClick,
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      "data-node-type": nodeType,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 mr-3 flex-shrink-0 flex items-center justify-center", children: icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700 leading-none font-bold", children: label })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-400 hover:text-gray-600 ml-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex items-center justify-center",
            style: {
              width: "16px",
              height: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: dragIcon,
                width: 16,
                height: 16,
                className: "max-w-full max-h-full object-contain",
                style: {
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain"
                }
              }
            )
          }
        ) })
      ]
    }
  );
};

const workflowIcon = "data:image/svg+xml,%3csvg%20width='18'%20height='18'%20viewBox='0%200%2018%2018'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23nujox52vfa)'%20fill='%233F3F46'%3e%3cpath%20d='M5.143%205.143H0V0h5.143v5.143zM1.286%203.857h2.572V1.286H1.286v2.57zM18%2018h-5.143v-5.143H18V18zm-3.857-1.286h2.572v-2.572h-2.572v2.572zM11.571%2016.072H3.857a3.857%203.857%200%200%201%200-7.715v1.286a2.572%202.572%200%201%200%200%205.143h7.714v1.286zM14.143%209.643V8.357a2.572%202.572%200%200%200%200-5.143H6.43V1.928h7.714a3.857%203.857%200%200%201%200%207.715z'/%3e%3cpath%20d='M10.926%205.786H7.07L5.143%208.358l3.856%203.857%203.857-3.857-1.93-2.572z'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='nujox52vfa'%3e%3cpath%20fill='%23fff'%20d='M0%200h18v18H0z'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";

const pencilIcon = "data:image/svg+xml,%3csvg%20width='16'%20height='16'%20viewBox='0%200%2016%2016'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20fill='%23fff'%20fill-opacity='.01'%20d='M0%200h16v16H0z'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M12.644%201.223a.533.533%200%200%200-.754%200L3.962%209.15c-.096.096-.173.21-.226.334l-1.56%203.64a.533.533%200%200%200%20.7.7l3.64-1.56c.124-.053.238-.13.334-.226l7.927-7.928a.533.533%200%200%200%200-.754l-2.133-2.133zM4.716%209.904l7.55-7.55%201.38%201.38-7.55%207.55-1.596.683-.467-.468.683-1.595z'%20fill='%231C2024'/%3e%3c/svg%3e";

const React$j = await importShared('react');
const {useState: useState$e} = React$j;
const APAAssistant = ({ title, onTitleChange }) => {
  const [isEditing, setIsEditing] = useState$e(true);
  const handleEditClick = () => {
    setIsEditing(true);
  };
  const handleSave = () => {
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed top-4 left-1/2 transform -translate-x-1/2 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full shadow-[0_3px_10px_rgb(0,0,0,0.1),0_6px_20px_rgb(0,0,0,0.05)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-full px-4 py-2 flex items-center w-64 md:w-80", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mr-2 text-gray-700 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex items-center justify-center",
        style: {
          width: "16px",
          height: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: workflowIcon,
            width: 16,
            height: 16,
            className: "max-w-full max-h-full object-contain",
            style: {
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain"
            }
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 relative min-w-0", children: isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "text",
        className: "w-full outline-none text-gray-800 bg-transparent",
        value: title || "",
        onChange: (e) => onTitleChange(e.target.value),
        onBlur: handleSave,
        onKeyDown: handleKeyDown,
        autoFocus: true
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "w-full text-gray-800 cursor-pointer hover:text-gray-600 truncate",
        onClick: handleEditClick,
        children: title || ""
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-2 text-gray-500 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex items-center justify-center",
        style: {
          width: "16px",
          height: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: pencilIcon,
            width: 16,
            height: 16,
            className: "max-w-full max-h-full object-contain",
            style: {
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain"
            }
          }
        )
      }
    ) })
  ] }) }) });
};

const React$i = await importShared('react');
const {memo: memo$c,useCallback: useCallback$7} = React$i;

const NodeWrapper = ({ children, selected, onClick }) => {
  const handleClick = useCallback$7(
    (e) => {
      e.stopPropagation();
      if (typeof onClick === "function") {
        onClick(e);
      }
    },
    [onClick]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `node-wrapper ${selected ? "selected-node" : ""}`,
      onClick: handleClick,
      style: {
        border: selected ? "1px solid #00CED1" : "none",
        borderRadius: "8px",
        boxShadow: selected ? "0 0 8px 1px rgba(0, 206, 209, 0.5), 0 0 12px 4px rgba(0, 206, 209, 0.1)" : "none",
        transition: "border 0.2s ease, box-shadow 0.3s ease",
        cursor: "pointer"
      },
      children
    }
  );
};
const NodeWrapper$1 = memo$c(NodeWrapper);

const React$h = await importShared('react');
const {memo: memo$b,useCallback: useCallback$6,useEffect: useEffect$8,useState: useState$d,useRef: useRef$4} = React$h;
const withNodeSelection = (WrappedComponent) => {
  const WithNodeSelection = (props) => {
    const { selected, data } = props;
    const nodeRef = useRef$4(null);
    const [isInputFocused, setIsInputFocused] = useState$d(false);
    const handleNodeClick = useCallback$6(
      (e) => {
        e.stopPropagation();
        if (data && typeof data.onSelect === "function") {
          data.onSelect();
        }
      },
      [data]
    );
    useEffect$8(() => {
      const handleFocus = (e) => {
        const isInput = e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable;
        if (isInput) {
          setIsInputFocused(true);
          const nodeElement = findReactFlowNode(e.target);
          if (nodeElement) {
            nodeElement._originalDraggable = nodeElement.draggable;
            nodeElement.draggable = false;
            nodeElement.classList.add("nodrag");
          }
        }
      };
      const handleBlur = (e) => {
        const isInput = e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable;
        if (isInput) {
          setIsInputFocused(false);
          const nodeElement = findReactFlowNode(e.target);
          if (nodeElement) {
            if (nodeElement._originalDraggable !== void 0) {
              nodeElement.draggable = nodeElement._originalDraggable;
              delete nodeElement._originalDraggable;
            }
            nodeElement.classList.remove("nodrag");
          }
        }
      };
      const handleMouseDown = (e) => {
        if (isInputFocused) {
          e.stopPropagation();
        }
      };
      document.addEventListener("focusin", handleFocus, true);
      document.addEventListener("focusout", handleBlur, true);
      if (nodeRef.current) {
        nodeRef.current.addEventListener("mousedown", handleMouseDown, true);
      }
      return () => {
        document.removeEventListener("focusin", handleFocus, true);
        document.removeEventListener("focusout", handleBlur, true);
        if (nodeRef.current) {
          nodeRef.current.removeEventListener(
            "mousedown",
            handleMouseDown,
            true
          );
        }
      };
    }, [isInputFocused]);
    function findReactFlowNode(element) {
      let current = element;
      while (current && !current.classList?.contains("react-flow__node")) {
        current = current.parentElement;
      }
      return current;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: nodeRef, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      NodeWrapper$1,
      {
        selected,
        onClick: handleNodeClick,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(WrappedComponent, { ...props })
      }
    ) });
  };
  WithNodeSelection.displayName = `withNodeSelection(${getDisplayName(
    WrappedComponent
  )})`;
  return memo$b(WithNodeSelection);
};
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

const React$g = await importShared('react');
const {useRef: useRef$3,useEffect: useEffect$7} = React$g;

const AutoResizeTextarea = ({
  value,
  onChange,
  placeholder,
  className,
  ...props
}) => {
  const textareaRef = useRef$3(null);
  useEffect$7(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(textarea.scrollHeight, 60)}px`;
  }, [value]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "textarea",
    {
      ref: textareaRef,
      value,
      onChange,
      placeholder,
      rows: 1,
      className: `
        w-full 
        border 
        border-gray-300 
        rounded 
        p-2 
        text-sm 
        resize-none 
        overflow-hidden 
        min-h-[60px] 
        ${className}
      `,
      ...props
    }
  );
};

const React$f = await importShared('react');
const {memo: memo$a,useReducer,useCallback: useCallback$5,useState: useState$c,useEffect: useEffect$6} = React$f;
const CustomInputNode = ({ data, isConnectable, id }) => {
  const [localFields, setLocalFields] = useState$c([]);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  useEffect$6(() => {
    if (Array.isArray(data.fields)) {
      const fieldToUse = data.fields.length > 0 ? [data.fields[0]] : [
        {
          inputName: "input_name",
          defaultValue: "Summary the input text"
        }
      ];
      setLocalFields(fieldToUse);
    } else {
      setLocalFields([
        {
          inputName: "input_name",
          defaultValue: "Summary the input text"
        }
      ]);
    }
  }, [data.fields]);
  const handleUpdateFieldInputName = useCallback$5(
    (index, value) => {
      console.log("更新欄位名稱", {
        hasUpdateField: typeof data.updateFieldInputName === "function",
        index,
        value,
        nodeId: id
      });
      if (typeof data.updateFieldInputName === "function") {
        data.updateFieldInputName(index, value);
      } else {
        console.warn(
          `節點 ${id}: updateFieldInputName 函數未定義，使用本地實現`
        );
        const updatedFields = [...localFields];
        if (index >= 0 && index < updatedFields.length) {
          updatedFields[index] = {
            ...updatedFields[index],
            inputName: value
          };
          setLocalFields(updatedFields);
          if (data.fields) {
            data.fields = updatedFields;
          }
          forceUpdate();
        }
      }
    },
    [data, localFields, id]
  );
  const handleUpdateFieldDefaultValue = useCallback$5(
    (index, value) => {
      console.log("更新欄位默認值", {
        hasUpdateDefaultValue: typeof data.updateFieldDefaultValue === "function",
        index,
        value,
        nodeId: id
      });
      if (typeof data.updateFieldDefaultValue === "function") {
        data.updateFieldDefaultValue(index, value);
      } else {
        console.warn(
          `節點 ${id}: updateFieldDefaultValue 函數未定義，使用本地實現`
        );
        const updatedFields = [...localFields];
        if (index >= 0 && index < updatedFields.length) {
          updatedFields[index] = {
            ...updatedFields[index],
            defaultValue: value
          };
          setLocalFields(updatedFields);
          if (data.fields) {
            data.fields = updatedFields;
          }
          forceUpdate();
        }
      }
    },
    [data, localFields, id]
  );
  const fields = Array.isArray(localFields) && localFields.length > 0 ? localFields : Array.isArray(data.fields) ? data.fields : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shadow-md w-64 relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-100 rounded-t-lg p-4 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 flex items-center justify-center text-white mr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconBase, { type: "input" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Input" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-gray-200" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg shadow-md rounded-lg w-64 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-bl-xl rounded-br-xl p-4", children: [
      fields.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500 text-sm mb-4", children: "No input field found" }),
      fields.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 last:mb-2 relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-gray-700 mb-1 font-bold", children: "input_name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              className: "w-full border border-gray-300 rounded p-2 text-sm",
              placeholder: "AI node prompt",
              value: fields[0].inputName || "",
              onChange: (e) => handleUpdateFieldInputName(0, e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-gray-700 mb-1 font-bold", children: "default_value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            AutoResizeTextarea,
            {
              value: fields[0].defaultValue || "",
              onChange: (e) => handleUpdateFieldDefaultValue(0, e.target.value),
              placeholder: "Summary the input text"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            style: {
              position: "absolute",
              right: "-18px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "10px",
              height: "10px",
              background: "transparent"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Handle$1,
              {
                type: "source",
                position: Position.Right,
                id: `output`,
                style: {
                  background: "#e5e7eb",
                  border: "1px solid #D3D3D3",
                  width: "12px",
                  height: "12px",
                  right: "-6px",
                  zIndex: 5
                },
                isConnectable
              }
            )
          }
        )
      ] })
    ] }) })
  ] });
};
const CustomInputNode$1 = memo$a(CustomInputNode);

/**
 * 工作流相關服務共用的基礎映射和轉換功能
 */
class WorkflowMappingService {
  /**
   * 從 ReactFlow 類型獲取 API 操作符
   * @param {string} type - ReactFlow 節點類型
   * @returns {string} - API 操作符類型
   */
  static getOperatorFromType(type) {
    const operatorMap = {
      browserExtensionInput: 'browser_extension_input',
      browserExtensionOutput: 'browser_extension_output',
      webhook: 'webhook',
      customInput: 'basic_input',
      input: 'basic_input',
      aiCustomInput: 'ask_ai',
      ai: 'ask_ai',
      ifElse: 'ifElse',
      knowledgeRetrieval: 'knowledge_retrieval',
      knowledge_retrieval: 'knowledge_retrieval',
      http: 'http',
      timer: 'timer',
      line: 'line',
      event: 'event',
      end: 'end'
    };
    return operatorMap[type] || type;
  }

  /**
   * 從 API 操作符獲取 ReactFlow 類型
   * @param {string} operator - API 操作符類型
   * @returns {string} - ReactFlow 節點類型
   */
  static getTypeFromOperator(operator) {
    const typeMap = {
      browser_extension_input: 'browserExtensionInput',
      browser_extension_output: 'browserExtensionOutput',
      webhook: 'webhook',
      basic_input: 'customInput',
      ask_ai: 'aiCustomInput',
      ifElse: 'ifElse',
      knowledge_retrieval: 'knowledgeRetrieval',
      http: 'http',
      timer: 'timer',
      line: 'line',
      event: 'event',
      end: 'end'
    };
    return typeMap[operator] || operator;
  }

  /**
   * 從 ReactFlow 類型獲取 API 類別
   * @param {string} type - ReactFlow 節點類型
   * @returns {string} - API 節點類別
   */
  static getCategoryFromType(type) {
    const categoryMap = {
      browserExtensionInput: 'starter',
      browserExtInput: 'starter',
      webhook: 'starter',
      customInput: 'input',
      input: 'input',
      aiCustomInput: 'advanced',
      ai: 'advanced',
      knowledgeRetrieval: 'advanced',
      knowledge_retrieval: 'advanced',
      ifElse: 'logic',
      http: 'integration',
      timer: 'event',
      line: 'integration',
      event: 'event',
      end: 'output',
      browserExtensionOutput: 'output'
    };
    return categoryMap[type] || 'advanced';
  }

  /**
   * 根據節點數據生成標籤
   * @param {Object} node - 節點數據
   * @returns {string} - 節點標籤
   */
  static getNodeLabel(node) {
    switch (node.operator) {
      case 'browser_extension_input':
        return '瀏覽器擴充輸入';
      case 'browser_extension_output':
        return '瀏覽器擴充輸出';
      case 'ask_ai':
        return `AI (${node.parameters?.llm_id?.data || 'GPT-4o'})`;
      case 'basic_input': {
        // 嘗試獲取第一個輸入欄位的名稱
        const inputName =
          node.parameters?.input_name_0?.data ||
          node.parameters?.input_name?.data;
        return inputName || '輸入';
      }
      case 'ifElse':
        return '條件判斷';
      case 'knowledge_retrieval':
        return '知識檢索';
      case 'end':
        return '結束';
      case 'webhook':
        return 'Webhook';
      case 'http':
        return 'HTTP 請求';
      case 'timer':
        return '計時器';
      case 'line':
        return 'LINE 訊息';
      case 'event':
        return '事件處理';
      default:
        return node.operator;
    }
  }

  /**
   * 修正 extractNodeInputForAPI 方法，增加 return_name 支持
   * 從 ReactFlow 邊緣數據中提取節點輸入連接
   * @param {string} nodeId - 目標節點ID
   * @param {Array} edges - 所有邊緣數據
   * @param {Array} allNodes - 所有節點數據
   * @returns {Object} - API 格式的節點輸入
   */
  // 3. 修改 WorkflowDataConverter 類中的 extractNodeInputForAPI 方法

  static extractNodeInputForAPI(nodeId, edges, allNodes) {
    const nodeInput = {};
    console.log(`提取節點 ${nodeId} 的輸入連接`);

    // 獲取所有以該節點為目標的邊緣
    const relevantEdges = edges.filter((edge) => edge.target === nodeId);
    console.log(`找到 ${relevantEdges.length} 個輸入連接`);

    // 如果沒有連接，直接返回空對象
    if (relevantEdges.length === 0) {
      return nodeInput;
    }

    // 獲取目標節點
    const targetNode = allNodes.find((n) => n.id === nodeId);
    if (!targetNode) {
      console.warn(`找不到節點 ${nodeId}`);
      return nodeInput;
    }

    // 檢查節點類型
    const isBrowserExtensionOutput =
      targetNode.type === 'browserExtensionOutput';
    const isAINode =
      targetNode.type === 'aiCustomInput' || targetNode.type === 'ai';

    // 按 targetHandle 分組邊緣
    const handleGroups = {};

    // 首先，分組所有邊緣
    relevantEdges.forEach((edge) => {
      const targetHandle = edge.targetHandle || 'input';

      // 初始化組
      if (!handleGroups[targetHandle]) {
        handleGroups[targetHandle] = [];
      }

      // 添加邊緣到組
      handleGroups[targetHandle].push(edge);
    });

    // 處理每個句柄組
    Object.entries(handleGroups).forEach(([targetHandle, targetEdges]) => {
      // 特殊處理 AI 節點的 context-input
      if (isAINode && targetHandle.startsWith('context')) {
        // 對於 context-input，我們需要處理多個連接
        targetEdges.forEach((edge, index) => {
          // 創建唯一的輸入鍵 - 兼容舊版和新版格式
          // 舊版: context-input 或 context-input_N
          // 新版: contextN (例如 context0, context1)
          let inputKey;

          // 檢查格式，支持可能的舊版格式
          if (targetHandle === 'context-input') {
            // 標準舊版格式
            inputKey = targetEdges.length > 1 ? `context${index}` : 'context0';
          } else if (targetHandle.startsWith('context-input_')) {
            // 舊版多連接格式 (context-input_0, context-input_1)
            const oldIndex = targetHandle.split('_')[1];
            inputKey = `context${oldIndex}`;
          } else if (targetHandle.startsWith('context')) {
            // 新版格式已經是 context0, context1 等
            inputKey = targetHandle;
          } else {
            // 未知格式，使用默認
            inputKey = `context${index}`;
          }

          // 查找源節點以獲取 return_name
          const sourceNode = allNodes.find((n) => n.id === edge.source);
          let returnName = edge.label || 'output';

          // 根據源節點類型獲取適當的 return_name
          if (sourceNode) {
            if (
              sourceNode.type === 'customInput' ||
              sourceNode.type === 'input'
            ) {
              // 從自定義輸入節點獲取欄位名稱
              if (
                sourceNode.data &&
                sourceNode.data.fields &&
                Array.isArray(sourceNode.data.fields)
              ) {
                // 修改: 不再從 sourceHandle 提取索引，而是直接使用第一個欄位
                // 如果 sourceHandle 是 'output'，使用第一個欄位的 inputName
                if (
                  edge.sourceHandle === 'output' &&
                  sourceNode.data.fields[0]
                ) {
                  returnName =
                    sourceNode.data.fields[0].inputName || returnName;
                }
                // 保留舊版處理方式，處理 'output-N' 格式的 sourceHandle
                else if (
                  edge.sourceHandle &&
                  edge.sourceHandle.startsWith('output-')
                ) {
                  const outputIndex = parseInt(
                    edge.sourceHandle.split('-')[1] || 0
                  );
                  if (sourceNode.data.fields[outputIndex]) {
                    returnName =
                      sourceNode.data.fields[outputIndex].inputName ||
                      returnName;
                  }
                }
              }
            } else if (sourceNode.type === 'browserExtensionInput') {
              // 從瀏覽器擴展輸入節點獲取項目名稱
              if (
                sourceNode.data &&
                sourceNode.data.items &&
                Array.isArray(sourceNode.data.items)
              ) {
                // 從 sourceHandle 中提取索引（如 output-0）
                const outputIndex = edge.sourceHandle
                  ? parseInt(edge.sourceHandle.split('-')[1] || 0)
                  : 0;

                // 獲取對應的項目名稱
                if (sourceNode.data.items[outputIndex]) {
                  returnName =
                    sourceNode.data.items[outputIndex].name || returnName;
                }
              }
            } else if (
              sourceNode.type === 'aiCustomInput' ||
              sourceNode.type === 'ai'
            ) {
              // AI 節點通常使用默認的 output
              returnName = 'output';
            } else if (sourceNode.type === 'knowledgeRetrieval') {
              // 知識檢索節點
              returnName = 'output';
            } else {
              // 對於其他節點類型，使用 sourceHandle 或默認為 'output'
              returnName = edge.sourceHandle || 'output';
            }
          }

          console.log(`源節點 ${edge.source} 的 return_name: ${returnName}`);

          // 添加到 nodeInput
          nodeInput[inputKey] = {
            node_id: edge.source,
            output_name: edge.sourceHandle || 'output',
            type: 'string',
            return_name: returnName
          };

          console.log(
            `AI節點連接: ${edge.source} -> ${nodeId}:${inputKey} (return_name: ${returnName})`
          );
        });
      } // 修改處理 prompt-input
      else if (isAINode && targetHandle === 'prompt-input') {
        const edge = targetEdges[0]; // 只取第一個連接

        // 創建唯一的輸入鍵 - 改為 "prompt"
        const inputKey = 'prompt';

        // 查找源節點以獲取 return_name
        allNodes.find((n) => n.id === edge.source);
        let returnName = edge.label || 'output';

        // 添加到 nodeInput
        nodeInput[inputKey] = {
          node_id: edge.source,
          output_name: edge.sourceHandle || 'output',
          type: 'string',
          return_name: returnName
        };

        console.log(
          `AI節點Prompt連接: ${edge.source} -> ${nodeId}:${inputKey} (return_name: ${returnName})`
        );
      }
      // 對於瀏覽器擴展輸出節點，特殊處理多個連線
      else if (isBrowserExtensionOutput) {
        // 處理多個連接到同一 handle 的情況
        targetEdges.forEach((edge, index) => {
          // 創建唯一的輸入鍵，使用原始 targetHandle 加索引
          const inputKey =
            targetEdges.length > 1 ? `${targetHandle}_${index}` : targetHandle;

          // 查找源節點以獲取 return_name
          const sourceNode = allNodes.find((n) => n.id === edge.source);
          let returnName = edge.label || 'output';

          // 根據源節點類型獲取適當的 return_name
          if (sourceNode) {
            if (
              sourceNode.type === 'customInput' ||
              sourceNode.type === 'input'
            ) {
              // 從自定義輸入節點獲取欄位名稱
              if (
                sourceNode.data &&
                sourceNode.data.fields &&
                Array.isArray(sourceNode.data.fields)
              ) {
                // 從 sourceHandle 中提取索引（如 output-0）
                const outputIndex = edge.sourceHandle
                  ? parseInt(edge.sourceHandle.split('-')[1] || 0)
                  : 0;

                // 獲取對應的欄位名稱
                if (sourceNode.data.fields[outputIndex]) {
                  returnName =
                    sourceNode.data.fields[outputIndex].inputName || returnName;
                }
              }
            } else if (sourceNode.type === 'browserExtensionInput') {
              // 從瀏覽器擴展輸入節點獲取項目名稱
              if (
                sourceNode.data &&
                sourceNode.data.items &&
                Array.isArray(sourceNode.data.items)
              ) {
                // 從 sourceHandle 中提取索引（如 output-0）
                const outputIndex = edge.sourceHandle
                  ? parseInt(edge.sourceHandle.split('-')[1] || 0)
                  : 0;

                // 獲取對應的項目名稱
                if (sourceNode.data.items[outputIndex]) {
                  returnName =
                    sourceNode.data.items[outputIndex].name || returnName;
                }
              }
            } else if (
              sourceNode.type === 'aiCustomInput' ||
              sourceNode.type === 'ai'
            ) {
              // AI 節點通常使用默認的 output
              returnName = 'output';
            } else if (sourceNode.type === 'knowledgeRetrieval') {
              // 知識檢索節點
              returnName = 'output';
            } else {
              // 對於其他節點類型，使用 sourceHandle 或默認為 'output'
              returnName = edge.sourceHandle || 'output';
            }
          }

          console.log(`源節點 ${edge.source} 的 return_name: ${returnName}`);

          // 添加到 nodeInput
          nodeInput[inputKey] = {
            node_id: edge.source,
            output_name: edge.sourceHandle || 'output',
            type: 'string',
            return_name: returnName
          };

          console.log(
            `瀏覽器擴展輸出節點連接: ${edge.source} -> ${nodeId}:${inputKey} (return_name: ${returnName})`
          );
        });
      } else {
        // 其他節點類型的處理...
        if (targetEdges.length > 1) {
          targetEdges.forEach((edge, index) => {
            // 創建唯一的輸入鍵
            const inputKey = `${targetHandle}_${index + 1}`;

            // 添加到 nodeInput
            nodeInput[inputKey] = {
              node_id: edge.source,
              output_name: edge.sourceHandle || 'output',
              type: 'string'
            };

            console.log(
              `多重輸入連接: ${edge.source} -> ${nodeId}:${inputKey}`
            );
          });
        } else if (targetEdges.length === 1) {
          // 單一連接，直接使用原始句柄
          const edge = targetEdges[0];

          nodeInput[targetHandle] = {
            node_id: edge.source,
            output_name: edge.sourceHandle || 'output',
            type: 'string'
          };

          console.log(`輸入連接: ${edge.source} -> ${nodeId}:${targetHandle}`);
        }
      }
    });

    if (targetNode) {
      const isAINode =
        targetNode.type === 'aiCustomInput' || targetNode.type === 'ai';

      if (isAINode && targetNode.data?.promptText) {
        // 檢查是否已有連線到 prompt-input
        const hasPromptConnection = edges.some(
          (edge) =>
            edge.target === nodeId && edge.targetHandle === 'prompt-input'
        );

        // 如果沒有連線到 prompt-input 但有 promptText，則創建一個特殊的 prompt 輸入
        if (!hasPromptConnection) {
          nodeInput.prompt = {
            type: 'string',
            data: targetNode.data.promptText,
            node_id: '' // 空 node_id 表示使用直接輸入的文本
          };
          console.log(
            `AI節點使用直接輸入的 prompt 文本: "${targetNode.data.promptText}"`
          );
        }
      }
    }

    return nodeInput;
  }

  /**
   * 修正 transformToReactFlowFormat 方法，確保載入時能正確處理多個連線到同一 handle
   */
  static transformToReactFlowFormat(apiData) {
    console.log('開始轉換 API 格式為 ReactFlow 格式');

    // 處理 API 數據結構差異
    const flowPipeline =
      apiData.flow_pipeline ||
      (apiData.content ? apiData.content.flow_pipeline : []);

    if (!flowPipeline || !Array.isArray(flowPipeline)) {
      console.error('找不到有效的 flow_pipeline 數組');
      return { nodes: [], edges: [] };
    }

    const nodes = [];
    const edges = [];

    // 首先處理所有節點，確保在創建邊緣之前節點已存在
    flowPipeline.forEach((node) => {
      console.log(`處理節點 ${node.id}, 操作符: ${node.operator}`);

      // 轉換為 ReactFlow 節點格式
      const reactFlowNode = {
        id: node.id,
        type: WorkflowMappingService.getTypeFromOperator(node.operator),
        position: {
          x: typeof node.position_x === 'number' ? node.position_x : 0,
          y: typeof node.position_y === 'number' ? node.position_y : 0
        },
        data: this.transformNodeDataToReactFlow(node)
      };

      nodes.push(reactFlowNode);
    });

    // 對於瀏覽器擴展輸出節點，特殊處理 node_input
    flowPipeline.forEach((node) => {
      // 檢查節點類型是否為瀏覽器擴展輸出
      const isBrowserExtOutput = node.operator === 'browser_extension_output';

      // 檢查節點類型是否為 AI 節點
      const isAINode = node.operator === 'ask_ai';

      if (isBrowserExtOutput && node.node_input) {
        console.log(
          `處理瀏覽器擴展輸出節點 ${node.id} 的輸入:`,
          node.node_input
        );

        // 查找對應的 ReactFlow 節點
        const reactFlowNode = nodes.find((n) => n.id === node.id);
        if (!reactFlowNode) return;

        // 從 node_input 識別所有的 handle
        const handlePattern = /^(.+?)(?:_\d+)?$/;
        const handleMap = new Map();

        // 分析 node_input，提取真正的 handle ID
        Object.keys(node.node_input).forEach((key) => {
          const match = key.match(handlePattern);
          if (match && match[1]) {
            const baseHandle = match[1];
            if (!handleMap.has(baseHandle)) {
              handleMap.set(baseHandle, []);
            }

            handleMap.get(baseHandle).push({
              fullKey: key,
              sourceNodeId: node.node_input[key].node_id,
              outputName: node.node_input[key].output_name || 'output',
              returnName: node.node_input[key].return_name || 'output' // 新增處理 return_name
            });
          }
        });

        // 確保 inputHandles 包含所有真正的 handle
        const inputHandles = [...(reactFlowNode.data.inputHandles || [])];
        const existingHandleIds = inputHandles.map((h) => h.id);

        // 添加缺失的 handle
        handleMap.forEach((connections, handleId) => {
          if (!existingHandleIds.includes(handleId)) {
            inputHandles.push({ id: handleId });
            console.log(`為節點 ${node.id} 添加缺失的 handle: ${handleId}`);
          }
        });

        // 更新節點的 inputHandles
        reactFlowNode.data.inputHandles = inputHandles;

        // 創建所有連接
        handleMap.forEach((connections, handleId) => {
          connections.forEach((connection) => {
            // 創建邊緣 ID
            const edgeId = `${connection.sourceNodeId}-${node.id}-${handleId}-${connection.outputName}`;

            // 創建連接
            const edge = {
              id: edgeId,
              source: connection.sourceNodeId,
              sourceHandle: connection.outputName,
              target: node.id,
              targetHandle: handleId,
              type: 'custom-edge',
              label: connection.returnName // 使用 return_name 作為標籤
            };

            edges.push(edge);
            console.log(
              `創建連接: ${edgeId} (return_name: ${connection.returnName})`
            );
          });
        });
      } // 新增 AI 節點特殊處理
      else if (isAINode && node.node_input) {
        console.log(`處理AI節點 ${node.id} 的輸入:`, node.node_input);

        // 查找對應的 ReactFlow 節點
        const reactFlowNode = nodes.find((n) => n.id === node.id);
        if (!reactFlowNode) return;

        // 從 node_input 識別所有的 context handle
        const contextHandles = Object.keys(node.node_input).filter(
          (key) => key === 'context-input' || key.startsWith('context')
        );

        // 處理每個 context 連接
        contextHandles.forEach((key) => {
          const inputValue = node.node_input[key];
          if (inputValue && inputValue.node_id) {
            // 創建邊緣 ID
            const edgeId = `${inputValue.node_id}-${node.id}-${key}-${
              inputValue.output_name || 'output'
            }-${Date.now()}`;

            // 創建連接，統一使用 'context-input' 作為 targetHandle
            const edge = {
              id: edgeId,
              source: inputValue.node_id,
              sourceHandle: inputValue.output_name || 'output',
              target: node.id,
              targetHandle: 'context-input',
              type: 'custom-edge',
              label: inputValue.return_name || undefined
            };

            edges.push(edge);
            console.log(`創建AI節點連接: ${edgeId}`);
          }
        });

        // 處理 prompt 連接
        if (node.node_input['prompt-input']) {
          const promptInput = node.node_input['prompt-input'];
          if (promptInput && promptInput.node_id) {
            const edgeId = `${promptInput.node_id}-${node.id}-prompt-input-${
              promptInput.output_name || 'output'
            }`;

            const edge = {
              id: edgeId,
              source: promptInput.node_id,
              sourceHandle: promptInput.output_name || 'output',
              target: node.id,
              targetHandle: 'prompt-input',
              type: 'custom-edge',
              label: promptInput.return_name || undefined
            };

            edges.push(edge);
            console.log(`創建AI節點Prompt連接: ${edgeId}`);
          }
        }
      } else if (node.node_input) {
        // 處理其他節點類型的連接
        Object.entries(node.node_input).forEach(([inputKey, inputValue]) => {
          if (inputValue && inputValue.node_id) {
            // 創建邊緣 ID
            const edgeId = `${inputValue.node_id}-${node.id}-${inputKey}-${
              inputValue.output_name || 'output'
            }`;

            // 創建連接
            const edge = {
              id: edgeId,
              source: inputValue.node_id,
              sourceHandle: inputValue.output_name || 'output',
              target: node.id,
              targetHandle: inputKey,
              type: 'custom-edge'
            };

            edges.push(edge);
            console.log(`創建標準連接: ${edgeId}`);
          }
        });
      }
    });

    // 自動布局（如果位置都是 0,0）
    this.autoLayout(nodes);

    console.log(`轉換完成: ${nodes.length} 個節點, ${edges.length} 個連接`);
    return { nodes, edges };
  }
  /**
   * 提取節點輸出以供 API 格式使用
   * @param {Object} node - ReactFlow 節點
   * @returns {Object} - API 格式的節點輸出
   */
  static extractNodeOutputForAPI(node) {
    const nodeOutput = {};
    console.log(`提取節點 ${node.id} 的輸出`);

    switch (node.type) {
      case 'browserExtensionOutput':
        // Add a single output for the browser extension output node
        nodeOutput.output = {
          node_id: node.id,
          type: 'string'
        };
        break;
      case 'browserExtensionInput':
      case 'browserExtInput':
        if (node.data.items && node.data.items.length > 0) {
          node.data.items.forEach((item, index) => {
            const outputKey = item.id || `a${index + 1}`;
            nodeOutput[outputKey] = {
              node_id: node.id,
              type: 'string'
            };
          });
          console.log(`瀏覽器擴展輸入: 設置 ${node.data.items.length} 個輸出`);
        } else {
          nodeOutput.output = {
            node_id: node.id,
            type: 'string'
          };
        }
        break;

      case 'webhook':
        nodeOutput.headers = {
          node_id: node.id,
          type: 'json',
          data: {}
        };
        nodeOutput.payload = {
          node_id: node.id,
          type: 'json',
          data: {}
        };
        break;

      case 'customInput':
      case 'input':
        // 修改: 使用單一 "output" 作為 handle ID 而不是 "output-0"
        nodeOutput.output = {
          node_id: node.id,
          type: 'string'
        };
        console.log(`輸入節點: 設置單一輸出 (output)`);
        break;

      case 'ifElse':
        nodeOutput.true = {
          node_id: node.id,
          type: 'boolean',
          data: true
        };
        nodeOutput.false = {
          node_id: node.id,
          type: 'boolean',
          data: false
        };
        break;

      default:
        // 預設輸出
        nodeOutput.output = {
          node_id: node.id,
          type: 'string',
          data: {}
        };
    }

    return nodeOutput;
  }
}

/**
 * 更新後的工作流 API 服務，使用共用的映射功能
 */
class WorkflowAPIService {
  constructor() {
    this.baseUrl = 'https://api-dev.qoca-apa.quanta-research.com/v1';
  }

  /**
   * 載入工作流數據
   * @param {string} workflowId - 要載入的工作流 ID
   * @returns {Promise<Object>} 工作流數據
   */
  async loadWorkflow(workflowId) {
    try {
      console.log(`嘗試載入工作流 ID: ${workflowId}`);
      const response = await fetch(
        `${this.baseUrl}/agent_designer/workflows/load`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            flow_id: workflowId
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
      }

      const data = await response.json();
      console.log('成功載入工作流數據');
      return data;
    } catch (error) {
      console.error('載入工作流失敗:', error);
      throw error;
    }
  }

  /**
   * 建立工作流數據
   * @param {Object} data - 要保存的工作流數據
   * @returns {Promise<Object>} API 回應
   */
  async createWorkflow(data) {
    console.log('創建新工作流:', data);
    try {
      const response = await fetch(
        `${this.baseUrl}/agent_designer/workflows/`,
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            flow_name: data.flow_name,
            content: data.content,
            flow_pipeline: data.flow_pipeline
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('工作流創建成功');
      return responseData;
    } catch (error) {
      console.error('保存工作流失敗:', error);
      throw error;
    }
  }

  /**
   * 保存工作流數據
   * @param {Object} data - 要保存的工作流數據
   * @returns {Promise<Object>} API 回應
   */
  async updateWorkflow(data) {
    console.log('更新工作流:', data);
    try {
      const response = await fetch(
        `${this.baseUrl}/agent_designer/workflows/`,
        {
          method: 'PUT',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            flow_name: data.flow_name,
            content: data.content,
            flow_id: data.flow_id,
            flow_pipeline: data.flow_pipeline
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('工作流更新成功');
      return responseData;
    } catch (error) {
      console.error('保存工作流失敗:', error);
      throw error;
    }
  }
}
/**
 * LLM模型和知識檢索服務 - 處理與LLM模型和文件相關的API請求
 */
class LLMService {
  constructor() {
    this.baseUrl = 'https://api-dev.qoca-apa.quanta-research.com/v1';

    // 模型相關緩存
    this.modelsCache = null;
    this.lastFetchTime = null;
    this.cacheExpiryTime = 10 * 60 * 1000; // 10分鐘cache過期
    this.pendingRequest = null; // 用於追蹤進行中的請求

    // 文件相關緩存
    this.filesCache = null;
    this.lastFilesFetchTime = null;
    this.pendingFilesRequest = null; // 用於追蹤進行中的文件請求
  }

  /**
   * 獲取所有可用的LLM模型
   * @returns {Promise<Array>} 模型列表
   */
  async getModels() {
    try {
      // 檢查是否有有效的快取
      const now = Date.now();
      if (
        this.modelsCache &&
        this.lastFetchTime &&
        now - this.lastFetchTime < this.cacheExpiryTime
      ) {
        console.log('使用快取的LLM模型列表');
        return this.modelsCache;
      }

      // 如果已經有一個請求在進行中，則返回該請求
      if (this.pendingRequest) {
        console.log('已有進行中的LLM模型請求，使用相同請求');
        return this.pendingRequest;
      }

      // 創建新請求
      console.log('獲取LLM模型列表...');
      this.pendingRequest = fetch(`${this.baseUrl}/llm/detail`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log('API返回原始模型數據:', data);

          // 檢查數據是否為數組
          if (!Array.isArray(data)) {
            console.warn('API返回的模型數據不是陣列');
            // 嘗試從可能的非數組格式中提取數據
            if (
              data &&
              typeof data === 'object' &&
              data.models &&
              Array.isArray(data.models)
            ) {
              data = data.models;
              console.log('從API回應中提取models陣列:', data);
            } else {
              // 如果無法提取合理的數據，則返回預設模型
              console.warn('無法從API回應中提取合理的模型數據，使用預設模型');
              data = [
                {
                  id: 1,
                  name: 'O3-mini',
                  display_name: 'O3-mini',
                  is_default: true
                },
                { id: 2, name: 'O3-plus', display_name: 'O3-plus' },
                { id: 3, name: 'O3-mega', display_name: 'O3-mega' },
                { id: 4, name: 'O3-ultra', display_name: 'O3-ultra' }
              ];
            }
          }

          // 檢查每個模型對象，確保結構正確
          const processedData = data.map((model, index) => {
            if (!model || typeof model !== 'object') {
              console.warn(`模型 ${index} 無效，使用替代數據`);
              return {
                id: index + 1,
                name: `Model ${index + 1}`,
                display_name: `Model ${index + 1}`,
                is_default: index === 0
              };
            }

            // 確保模型有ID
            if (model.id === undefined || model.id === null) {
              console.warn(`模型 ${index} 缺少ID，使用索引作為ID`);
              model.id = index + 1;
            }

            // 確保模型有名稱
            if (!model.name && !model.display_name) {
              console.warn(`模型 ${index} 缺少名稱，使用索引作為名稱`);
              model.name = `Model ${model.id}`;
            }

            return model;
          });

          console.log('處理後的模型數據:', processedData);

          // 更新快取
          this.modelsCache = processedData;
          this.lastFetchTime = now;
          this.pendingRequest = null; // 清除進行中的請求

          return processedData;
        })
        .catch((error) => {
          console.error('獲取LLM模型失敗:', error);
          this.pendingRequest = null; // 清除進行中的請求，即使出錯

          // 返回預設模型，而不是拋出錯誤
          return [
            {
              id: 1,
              name: 'O3-mini',
              display_name: 'O3-mini',
              is_default: true
            },
            { id: 2, name: 'O3-plus', display_name: 'O3-plus' },
            { id: 3, name: 'O3-mega', display_name: 'O3-mega' },
            { id: 4, name: 'O3-ultra', display_name: 'O3-ultra' }
          ];
        });

      return this.pendingRequest;
    } catch (error) {
      console.error('獲取LLM模型過程中出錯:', error);
      this.pendingRequest = null;

      // 返回預設模型，而不是拋出錯誤
      return [
        { id: 1, name: 'O3-mini', display_name: 'O3-mini', is_default: true },
        { id: 2, name: 'O3-plus', display_name: 'O3-plus' },
        { id: 3, name: 'O3-mega', display_name: 'O3-mega' },
        { id: 4, name: 'O3-ultra', display_name: 'O3-ultra' }
      ];
    }
  }

  /**
   * 獲取所有已完成的文件
   * @returns {Promise<Array>} 文件列表
   */
  async getCompletedFiles() {
    try {
      // 檢查是否有有效的快取
      const now = Date.now();
      if (
        this.filesCache &&
        this.lastFilesFetchTime &&
        now - this.lastFilesFetchTime < this.cacheExpiryTime
      ) {
        console.log('使用快取的已完成文件列表');
        return this.filesCache;
      }

      // 如果已經有一個請求在進行中，則返回該請求
      if (this.pendingFilesRequest) {
        console.log('已有進行中的文件列表請求，使用相同請求');
        return this.pendingFilesRequest;
      }

      // 創建新請求
      console.log('獲取已完成文件列表...');
      this.pendingFilesRequest = fetch(
        `${this.baseUrl}/agent_designer/files/completed`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log('成功獲取已完成文件:', data);

          // 更新快取
          this.filesCache = data;
          this.lastFilesFetchTime = now;
          this.pendingFilesRequest = null; // 清除進行中的請求

          return data;
        })
        .catch((error) => {
          console.error('獲取已完成文件失敗:', error);
          this.pendingFilesRequest = null; // 清除進行中的請求，即使出錯
          this.pendingFilesRequest = null;

          // 檢查是否為 CORS 錯誤
          if (
            error.message &&
            (error.message.includes('NetworkError') ||
              error.message.includes('Failed to fetch'))
          ) {
            console.log('疑似 CORS 問題，返回預設檔案列表');
            // 直接返回預設值而不是再次拋出錯誤
            return [
              { id: 1, filename: 'ICDCode.csv' },
              { id: 2, filename: 'Cardiology_Diagnoses.csv' }
            ];
          }

          throw error;
        });

      return this.pendingFilesRequest;
    } catch (error) {
      console.error('獲取已完成文件過程中出錯:', error);
      this.pendingFilesRequest = null;
      throw error;
    }
  }

  /**
   * 獲取格式化後的模型選項，適用於下拉選單
   * @returns {Promise<Array>} 格式化的模型選項
   */
  async getModelOptions() {
    try {
      const models = await this.getModels();
      console.log('API返回的模型數據:', models);

      // 檢查模型數據是否有效
      if (!models || !Array.isArray(models)) {
        console.warn('模型數據無效或不是陣列，使用默認選項');
        return [
          { value: '1', label: 'O3-mini' },
          { value: '2', label: 'O3-plus' },
          { value: '3', label: 'O3-mega' },
          { value: '4', label: 'O3-ultra' }
        ];
      }

      if (models.length === 0) {
        console.warn('API返回的模型陣列為空，使用默認選項');
        return [
          { value: '1', label: 'O3-mini' },
          { value: '2', label: 'O3-plus' },
          { value: '3', label: 'O3-mega' },
          { value: '4', label: 'O3-ultra' }
        ];
      }

      // 檢查第一個模型的結構，確認關鍵屬性
      const sampleModel = models[0];
      console.log('模型數據結構示例:', sampleModel);

      // 將API返回的模型數據轉換為select選項格式
      const options = models.map((model, index) => {
        // 確保模型對象存在
        if (!model) {
          console.warn(`遇到無效的模型數據，索引: ${index}`);
          return { value: `${index + 1}`, label: `Model ${index + 1}` };
        }

        // 記錄每個模型的關鍵屬性，幫助診斷
        console.log(`處理模型 ${index}:`, {
          id: model.id,
          name: model.name,
          display_name: model.display_name,
          is_default: model.is_default
        });

        // 取得 ID，確保是字串型別
        let modelId = '1'; // 預設 ID
        if (model.id !== undefined && model.id !== null) {
          modelId = model.id.toString();
        } else {
          modelId = `${index + 1}`; // 使用索引+1作為ID
        }

        // 取得顯示名稱
        const modelLabel = model.display_name || model.name;

        // 如果連名稱也沒有，則使用模型ID作為顯示名稱
        const displayLabel = modelLabel || `Model ${modelId}`;

        return {
          value: modelId,
          label: displayLabel,
          description: model.description || '',
          isDefault: !!model.is_default
        };
      });

      console.log('最終格式化的選項:', options);
      return options;
    } catch (error) {
      console.error('獲取模型選項失敗:', error);
      // 返回一些默認選項，以防API失敗
      return [
        { value: '1', label: 'O3-mini' },
        { value: '2', label: 'O3-plus' },
        { value: '3', label: 'O3-mega' },
        { value: '4', label: 'O3-ultra' }
      ];
    }
  }

  /**
   * 獲取格式化後的已完成文件選項，適用於下拉選單
   * @returns {Promise<Array>} 格式化的文件選項
   */
  async getFileOptions() {
    try {
      const files = await this.getCompletedFiles();

      // 根據後端返回的格式 [{"filename": '123.csv', "id": 1}] 進行處理
      return files.map((file) => ({
        id: file.id.toString(), // 確保ID是字符串
        value: file.id.toString(), // 用於選項值
        name: file.filename, // 用於顯示名稱
        label: file.filename // 用於顯示名稱 (替代)
      }));
    } catch (error) {
      console.error('獲取文件選項失敗:', error);
      // 返回一些默認選項，以防API失敗
      return [
        {
          id: 'icdcode',
          value: 'icdcode',
          name: 'ICDCode.csv',
          label: 'ICDCode.csv'
        },
        {
          id: 'cardiology',
          value: 'cardiology',
          name: 'Cardiology_Diagnoses.csv',
          label: 'Cardiology_Diagnoses.csv'
        }
      ];
    }
  }

  /**
   * 預加載模型與文件數據，通常在應用啟動時呼叫
   */
  preloadData() {
    console.log('預加載LLM模型和文件列表');

    // 預加載模型
    this.getModels().catch((err) => {
      console.log('預加載模型失敗:', err);
    });

    // 預加載文件
    this.getCompletedFiles().catch((err) => {
      console.log('預加載文件失敗:', err);
    });
  }
}

/**
 * 更新後的工作流數據轉換器，使用共用的映射功能
 */
class WorkflowDataConverter {
  // 修改 transformToReactFlowFormat 方法，確保連線正確處理
  static transformToReactFlowFormat(apiData) {
    console.log('開始轉換 API 格式為 ReactFlow 格式');

    // 處理 API 數據結構差異
    const flowPipeline =
      apiData.flow_pipeline ||
      (apiData.content ? apiData.content.flow_pipeline : []);

    if (!flowPipeline || !Array.isArray(flowPipeline)) {
      console.error('找不到有效的 flow_pipeline 數組');
      return { nodes: [], edges: [] };
    }

    const nodes = [];
    const edges = [];

    // 首先處理所有節點，確保在創建邊緣之前節點已存在
    flowPipeline.forEach((node) => {
      console.log(`處理節點 ${node.id}, 操作符: ${node.operator}`);

      // 轉換為 ReactFlow 節點格式
      const reactFlowNode = {
        id: node.id,
        type: WorkflowMappingService.getTypeFromOperator(node.operator),
        position: {
          x: typeof node.position_x === 'number' ? node.position_x : 0,
          y: typeof node.position_y === 'number' ? node.position_y : 0
        },
        data: this.transformNodeDataToReactFlow(node)
      };

      nodes.push(reactFlowNode);
    });

    // 處理連接關係
    flowPipeline.forEach((node) => {
      // 檢查節點類型
      const isAINode = node.operator === 'ask_ai';
      const isKnowledgeNode = node.operator === 'knowledge_retrieval';

      // 處理節點之間的連接
      if (node.node_input && Object.keys(node.node_input).length > 0) {
        console.log(`處理節點 ${node.id} 的輸入連接:`, node.node_input);

        // 如果是 AI 節點，檢查是否有直接輸入的提示文本
        if (isAINode) {
          const promptInput = node.node_input.prompt;
          if (promptInput && promptInput.node_id === '') {
            // 找到對應的 ReactFlow 節點
            const reactFlowNode = nodes.find((n) => n.id === node.id);
            if (reactFlowNode) {
              // 設置直接輸入的 promptText
              reactFlowNode.data.promptText = promptInput.data || '';
              console.log(
                `設置AI節點直接輸入的提示文本: "${promptInput.data}"`
              );
            }
          }
        }

        // 創建連接
        Object.entries(node.node_input).forEach(([inputKey, inputValue]) => {
          // 跳過直接輸入的提示文本，已在上面處理
          if (inputKey === 'prompt' && inputValue.node_id === '') {
            return;
          }

          if (inputValue && inputValue.node_id) {
            // 為不同類型的節點處理特殊的 targetHandle
            let targetHandle = inputKey;

            // AI 節點特殊處理
            if (isAINode) {
              // 處理 context 相關的輸入鍵
              if (inputKey.startsWith('context')) {
                targetHandle = 'context-input';
              }
              // 處理 prompt 相關的輸入鍵
              else if (inputKey === 'prompt' || inputKey === 'prompt-input') {
                targetHandle = 'prompt-input';
              }
            }
            // 知識檢索節點特殊處理
            else if (isKnowledgeNode) {
              // 統一使用 passage 作為目標 handle
              if (inputKey === 'passage' || inputKey === 'input') {
                targetHandle = 'passage';
              }
            }

            // 為每個邊緣創建一個唯一的 ID
            const edgeId = `${inputValue.node_id}-${node.id}-${inputKey}-${
              inputValue.output_name || 'output'
            }`;

            console.log(
              `創建連接: ${edgeId}, 從 ${inputValue.node_id} 到 ${node.id}:${targetHandle}`
            );

            // 確認目標節點存在
            const targetNode = nodes.find((n) => n.id === node.id);
            if (!targetNode) {
              console.warn(`找不到目標節點 ${node.id}，跳過邊緣創建`);
              return;
            }

            // 創建邊緣，添加 return_name 支持
            const edge = {
              id: edgeId,
              source: inputValue.node_id,
              sourceHandle: inputValue.output_name || 'output',
              target: node.id,
              targetHandle: targetHandle,
              type: 'custom-edge'
            };

            // 如果有 return_name 屬性，添加為標籤
            if (inputValue.return_name) {
              edge.label = inputValue.return_name;
              console.log(
                `邊緣 ${edgeId} 添加 return_name: ${inputValue.return_name}`
              );
            }

            // 記錄詳細信息，幫助除錯
            console.log('創建的邊緣詳情:', {
              id: edge.id,
              source: edge.source,
              target: edge.target,
              sourceHandle: edge.sourceHandle,
              targetHandle: edge.targetHandle,
              label: edge.label
            });

            edges.push(edge);
          }
        });
      }
    });

    console.log(`轉換完成: ${nodes.length} 個節點, ${edges.length} 個連接`);

    // 自動布局（如果位置都是 0,0）
    this.autoLayout(nodes);

    return { nodes, edges };
  }
  /**
   * 將 API 節點數據轉換為 ReactFlow 節點數據
   * @param {Object} node - API 格式節點
   * @returns {Object} - ReactFlow 格式節點數據
   */
  static transformNodeDataToReactFlow(node) {
    const baseData = {
      label: WorkflowMappingService.getNodeLabel(node),
      category: node.category,
      operator: node.operator,
      version: node.version,
      node_input: node.node_input,
      node_output: node.node_output
    };

    // 根據節點類型轉換參數
    switch (node.operator) {
      case 'browser_extension_input':
        return {
          ...baseData,
          type: 'browserExtensionInput',
          browser_extension_url: node.parameters?.browser_extension_url?.data,
          items:
            node.parameters?.functions?.map((func) => ({
              id: func.func_id,
              name: func.func_name,
              icon: func.func_icon || 'document'
            })) || []
        };

      case 'browser_extension_output': {
        // 從 node_input 提取 handle，但只有在有連線時才提取
        let inputHandles = [];

        // 檢查是否有 node_input 數據
        if (
          node.node_input &&
          typeof node.node_input === 'object' &&
          Object.keys(node.node_input).length > 0
        ) {
          console.log(
            `處理瀏覽器擴展輸出節點 ${node.id} 的輸入:`,
            node.node_input
          );

          // 從 node_input 提取所有 handle ID
          inputHandles = Object.keys(node.node_input).map((handleId) => {
            console.log(`從 node_input 提取 handle ID: ${handleId}`);
            return { id: handleId };
          });

          console.log(
            `節點 ${node.id} 從 node_input 提取的 handle:`,
            inputHandles
          );
        } else {
          console.log(`節點 ${node.id} 沒有 node_input 數據，不創建 handle`);
        }

        return {
          ...baseData,
          type: 'browserExtensionOutput',
          inputHandles: inputHandles
        };
      }

      case 'webhook':
        return {
          ...baseData,
          webhookUrl: node.parameters?.webhook_url?.data || ''
        };

      case 'ask_ai': {
        // 獲取模型ID，確保處理可能的undefined或null值 // 優先使用 llm_id，如果不存在則使用 model
        const rawModelId =
          node.parameters?.llm_id?.data !== undefined
            ? node.parameters.llm_id.data
            : node.parameters?.model?.data !== undefined
            ? node.parameters.model.data
            : '1';

        // 確保模型ID是字符串類型
        const modelId =
          rawModelId !== null && rawModelId !== undefined
            ? rawModelId.toString()
            : '1';

        // 提取 prompt 文本
        const promptText = node.parameters?.prompt?.data || '';

        return {
          ...baseData,
          model: modelId,
          promptText: promptText
        };
      }

      case 'basic_input': {
        // 提取參數中的欄位
        // const fields = [];
        // 修改: 使用固定參數名稱而不是索引
        const field = {
          inputName: node.parameters?.input_name?.data || 'input_name',
          defaultValue: node.parameters?.default_value?.data || ''
        };
        console.log(`處理 basic_input 節點:`, {
          inputName: field.inputName,
          defaultValue: field.defaultValue
        });
        // const paramKeys = Object.keys(node.parameters || {});

        // console.log(`處理 basic_input 節點，參數鍵:`, paramKeys);

        // // 查找所有輸入欄位對
        // const fieldIndicies = new Set();

        // paramKeys.forEach((key) => {
        //   if (
        //     key.startsWith('input_name_') ||
        //     key.startsWith('default_value_')
        //   ) {
        //     const match = key.match(/_(\d+)$/);
        //     if (match && match[1]) {
        //       fieldIndicies.add(parseInt(match[1]));
        //     }
        //   }
        // });

        // const sortedIndicies = Array.from(fieldIndicies).sort((a, b) => a - b);
        // console.log(`找到欄位索引: ${sortedIndicies.join(', ')}`);

        // // 處理每個欄位
        // sortedIndicies.forEach((i) => {
        //   const field = {
        //     inputName:
        //       node.parameters?.[`input_name_${i}`]?.data || `input_${i}`,
        //     defaultValue: node.parameters?.[`default_value_${i}`]?.data || ''
        //   };
        //   fields.push(field);
        //   console.log(`添加欄位 ${i}:`, field);
        // });

        // // 確保至少有一個欄位
        // if (fields.length === 0) {
        //   const defaultField = {
        //     inputName: 'default_input',
        //     defaultValue: 'Enter value here'
        //   };
        //   fields.push(defaultField);
        //   console.log('添加一個默認欄位:', defaultField);
        // }

        // 返回完整的資料結構，不包含回調函數
        // 回調函數將在 updateNodeFunctions 中添加
        return {
          ...baseData,
          fields: [field]
        };
      }

      case 'ifElse':
        return {
          ...baseData,
          variableName: node.parameters?.variable?.data || '',
          operator: node.parameters?.operator?.data || 'equals',
          compareValue: node.parameters?.compare_value?.data || ''
        };

      case 'knowledge_retrieval':
        return {
          ...baseData,
          selectedFile: node.parameters?.file_id?.data || '',
          availableFiles: [
            { id: 'icdcode', name: 'ICDCode.csv' },
            { id: 'cardiology', name: 'Cardiology_Diagnoses.csv' }
          ]
        };

      case 'http':
        return {
          ...baseData,
          url: node.parameters?.url?.data || '',
          method: node.parameters?.method?.data || 'GET'
        };

      case 'timer':
        return {
          ...baseData,
          hours: node.parameters?.hours?.data || 0,
          minutes: node.parameters?.minutes?.data || 0,
          seconds: node.parameters?.seconds?.data || 0
        };

      case 'line':
        return {
          ...baseData,
          mode: node.parameters?.mode?.data || 'reply',
          text: node.parameters?.text?.data || ''
        };

      case 'event':
        return {
          ...baseData,
          eventType: node.parameters?.event_type?.data || 'message',
          eventSource: node.parameters?.event_source?.data || ''
        };

      case 'end':
        return {
          ...baseData,
          outputText: node.parameters?.output_text?.data || ''
        };

      default: {
        // 對於未明確處理的節點類型，保留原始參數
        const transformedParams = {};
        Object.entries(node.parameters || {}).forEach(([key, value]) => {
          transformedParams[key] = value.data;
        });
        return {
          ...baseData,
          ...transformedParams
        };
      }
    }
  }

  /**
   * 自動布局節點（如果所有節點都在同一位置）
   * @param {Array} nodes - ReactFlow 節點數組
   */
  static autoLayout(nodes) {
    // 檢查是否需要自動布局
    const needsLayout =
      nodes.length > 1 &&
      nodes.every((node) => node.position.x === 0 && node.position.y === 0);

    if (needsLayout) {
      console.log('執行自動節點布局');

      let currentX = 50;
      let currentY = 50;
      const xSpacing = 300;
      const ySpacing = 150;

      // 對節點進行分類
      const starterNodes = nodes.filter((node) =>
        ['browserExtensionInput', 'webhook'].includes(node.type)
      );

      const inputNodes = nodes.filter((node) =>
        ['customInput', 'input'].includes(node.type)
      );

      const processingNodes = nodes.filter((node) =>
        [
          'aiCustomInput',
          'ai',
          'ifElse',
          'knowledgeRetrieval',
          'http',
          'timer',
          'event'
        ].includes(node.type)
      );

      const outputNodes = nodes.filter((node) =>
        ['browserExtensionOutput', 'line', 'end'].includes(node.type)
      );

      // 布局開始節點
      starterNodes.forEach((node, index) => {
        node.position.x = currentX;
        node.position.y = currentY + index * ySpacing;
      });

      // 布局輸入節點
      currentX += xSpacing;
      inputNodes.forEach((node, index) => {
        node.position.x = currentX;
        node.position.y = currentY + index * ySpacing;
      });

      // 布局處理節點
      currentX += xSpacing;
      processingNodes.forEach((node, index) => {
        node.position.x = currentX;
        node.position.y = currentY + index * ySpacing;
      });

      // 布局輸出節點
      currentX += xSpacing;
      outputNodes.forEach((node, index) => {
        node.position.x = currentX;
        node.position.y = currentY + index * ySpacing;
      });

      console.log('自動布局完成');
    }
  }

  /**
   * 修改 WorkflowDataConverter 中的 convertReactFlowToAPI 方法，修復 'nodes is not defined' 錯誤
   */
  static convertReactFlowToAPI(reactFlowData) {
    console.log('開始轉換 ReactFlow 格式為 API 格式');

    // 從 reactFlowData 中提取節點和邊緣
    const { nodes, edges } = reactFlowData;

    if (!nodes || !Array.isArray(nodes)) {
      console.error('缺少有效的節點數據');
      return null;
    }

    // 轉換節點
    const flowPipeline = nodes.map((node) => {
      console.log(`處理節點 ${node.id}, 類型: ${node.type}`);

      // 提取節點輸入連接 - 現在傳遞所有節點作為參數
      const nodeInput = WorkflowMappingService.extractNodeInputForAPI(
        node.id,
        edges,
        nodes
      );

      // 提取節點輸出連接
      const nodeOutput = WorkflowMappingService.extractNodeOutputForAPI(node);

      // 轉換節點數據
      const parameters = this.transformNodeDataToAPI(node);

      return {
        id: node.id,
        category: WorkflowMappingService.getCategoryFromType(node.type),
        operator: WorkflowMappingService.getOperatorFromType(node.type),
        parameters,
        position_x: node.position.x,
        position_y: node.position.y,
        version: node.data?.version || '0.0.1',
        node_input: nodeInput,
        node_output: nodeOutput
      };
    });

    // 創建最終 API 數據結構
    const apiData = {
      flow_name: reactFlowData.title || '未命名流程',
      flow_id: reactFlowData.id || `flow_${Date.now()}`,
      content: {
        flow_type: 'NORMAL',
        headers: reactFlowData.headers || {
          Authorization: 'Bearer your-token-here',
          'Content-Type': 'application/json'
        }
      },
      flow_pipeline: flowPipeline
    };

    console.log('轉換為 API 格式完成');
    return apiData;
  }

  /**
   * 統一 AI 節點輸入鍵的格式
   * @param {string} key - 原始輸入鍵
   * @param {number} index - 如果是上下文連接，提供的索引
   * @returns {string} - 統一格式的輸入鍵
   */
  static normalizeAIInputKey(key, index = 0) {
    // 處理 prompt 相關的鍵
    if (key === 'prompt-input' || key === 'prompt') {
      return 'prompt';
    }

    // 處理 context 相關的鍵
    if (key === 'context-input') {
      // 單一 context 連接
      return 'context0';
    } else if (key.startsWith('context-input_')) {
      // 舊版多連接格式：context-input_0, context-input_1
      const oldIndex = key.split('_')[1];
      return `context${oldIndex}`;
    } else if (key.match(/^context\d+$/)) {
      // 新版格式：已經是 context0, context1 等
      return key;
    } else if (key.startsWith('context')) {
      // 其他 context 開頭的格式
      return `context${index}`;
    }

    // 其他鍵保持不變
    return key;
  }

  /**
   * 將 ReactFlow 節點數據轉換為 API 參數格式
   * @param {Object} node - ReactFlow 節點
   * @returns {Object} - API 格式參數
   */
  static transformNodeDataToAPI(node) {
    const parameters = {};
    console.log(`轉換節點 ${node.id} 數據為 API 參數`);

    switch (node.type) {
      case 'customInput':
      case 'input':
        // if (node.data.fields && node.data.fields.length > 0) {
        //   node.data.fields.forEach((field, index) => {
        //     parameters[`input_name_${index}`] = { data: field.inputName || '' };
        //     parameters[`default_value_${index}`] = {
        //       data: field.defaultValue || ''
        //     };
        //   });
        //   console.log(`處理 ${node.data.fields.length} 個輸入欄位`);
        // } else {
        //   console.warn(`節點 ${node.id} 沒有欄位資料`);
        // }

        // 修改: 使用固定參數名稱而不是索引
        // 使用第一個欄位的資料，或是空字串
        if (node.data.fields && node.data.fields.length > 0) {
          const field = node.data.fields[0]; // 只使用第一個欄位
          parameters.input_name = { data: field.inputName || '' };
          parameters.default_value = { data: field.defaultValue || '' };
          console.log(
            `處理輸入節點參數: input_name=${field.inputName}, default_value=${field.defaultValue}`
          );
        } else {
          // 如果沒有欄位資料，提供默認值
          parameters.input_name = { data: 'input_name' };
          parameters.default_value = { data: 'Summary the input text' };
          console.warn(`節點 ${node.id} 沒有欄位資料，使用默認值`);
        }
        break;

      case 'aiCustomInput':
      case 'ai': {
        // 處理可能的無效model值
        const modelValue = node.data.model || '1';

        // 確保值為字符串
        const safeModelValue =
          typeof modelValue !== 'string'
            ? modelValue.toString()
            : modelValue;

        // 使用model作為llm_id - 現在存的是ID值而非名稱
        parameters.llm_id = { data: Number(safeModelValue) };

        // 新增處理 promptText - 當有直接輸入的提示文本時
        // 兼容舊版：不覆蓋已有的 prompt 參數
        if (node.data.promptText && !parameters.prompt) {
          parameters.prompt = { data: node.data.promptText };
        }

        break;
      }

      case 'browserExtensionInput':
      case 'browserExtInput':
        if (node.data.browser_extension_url) {
          parameters.browser_extension_url = {
            data: node.data.browser_extension_url
          };
        }
        if (node.data.items && node.data.items.length > 0) {
          parameters.functions = node.data.items.map((item, index) => ({
            func_id: item.id || `a${index + 1}`,
            func_name: item.name || '',
            func_icon: item.icon || 'document'
          }));
        }
        break;

      case 'webhook':
        if (node.data.webhookUrl) {
          parameters.webhook_url = { data: node.data.webhookUrl };
        }
        break;

      case 'knowledgeRetrieval':
      case 'knowledge_retrieval':
        if (node.data.selectedFile) {
          parameters.file_id = { data: node.data.selectedFile };
        }
        // 添加 top_k 參數
        parameters.top_k = { data: node.data.topK || 5 };
        break;
      case 'ifElse':
        if (node.data.variableName) {
          parameters.variable = { data: node.data.variableName };
        }
        if (node.data.operator) {
          parameters.operator = { data: node.data.operator };
        }
        if (node.data.compareValue !== undefined) {
          parameters.compare_value = { data: node.data.compareValue };
        }
        break;

      case 'http':
        if (node.data.url) {
          parameters.url = { data: node.data.url };
        }
        if (node.data.method) {
          parameters.method = { data: node.data.method };
        }
        break;

      case 'timer':
        parameters.hours = { data: node.data.hours || 0 };
        parameters.minutes = { data: node.data.minutes || 0 };
        parameters.seconds = { data: node.data.seconds || 0 };
        break;

      case 'line':
        parameters.mode = { data: node.data.mode || 'reply' };
        if (node.data.text !== undefined) {
          parameters.text = { data: node.data.text };
        }
        break;

      case 'event':
        parameters.event_type = { data: node.data.eventType || 'message' };
        if (node.data.eventSource) {
          parameters.event_source = { data: node.data.eventSource };
        }
        break;

      case 'end':
        if (node.data.outputText !== undefined) {
          parameters.output_text = { data: node.data.outputText };
        }
        break;

      case 'browserExtensionOutput':
        // 目前沒有特定的參數需要轉換
        break;

      default:
        // 對於其他類型，直接轉換非系統屬性
        if (node.data) {
          Object.entries(node.data).forEach(([key, value]) => {
            // 排除系統屬性和函數
            if (
              ![
                'label',
                'category',
                'operator',
                'version',
                'node_input',
                'node_output',
                'onSelect',
                'updateNodeData',
                'addField',
                'updateFieldInputName',
                'updateFieldDefaultValue'
              ].includes(key) &&
              typeof value !== 'function'
            ) {
              parameters[key] = { data: value };
            }
          });
        }
    }

    return parameters;
  }
}

/**
 * 圖標上傳服務 - 處理與圖標上傳相關的 API 請求
 */
class IconUploadService {
  constructor() {
    this.baseUrl = 'https://api-dev.qoca-apa.quanta-research.com/v1';
    this.cache = {}; // 緩存上傳過的圖標
  }

  /**
   * 上傳圖標文件到服務器
   * @param {File} file - 要上傳的文件對象
   * @returns {Promise<Object>} - 包含上傳結果的 Promise，成功時返回 {success: true, url: "圖標URL"}
   */
  async uploadIcon(file) {
    if (!file) {
      throw new Error('未提供文件');
    }

    // 檢查文件類型
    if (!file.type.startsWith('image/')) {
      throw new Error('僅支持圖片文件');
    }

    try {
      console.log(`開始上傳圖標: ${file.name}`);

      // 創建 FormData 對象
      const formData = new FormData();
      formData.append('file', file); // 使用正確的欄位名稱 'file'

      // 發送 POST 請求
      const response = await fetch(`${this.baseUrl}/agent_designer/icons/`, {
        method: 'POST',
        headers: {
          accept: 'application/json'
          // 注意：不要設置 'Content-Type': 'multipart/form-data'，
          // fetch 會自動設置正確的 boundary
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`上傳失敗: ${response.status} ${response.statusText}`);
      }

      // 解析 API 回傳的資料
      const data = await response.json();
      console.log('圖標上傳成功:', data);

      if (!data.url) {
        throw new Error('API 未回傳圖標 URL');
      }

      // 將 URL 加入緩存
      this.cache[file.name] = data.url;

      return {
        success: true,
        url: data.url
      };
    } catch (error) {
      console.error('上傳圖標時發生錯誤:', error);
      return {
        success: false,
        error: error.message || '上傳圖標失敗',
        details: error
      };
    }
  }

  /**
   * 檢查圖標 URL 是否有效
   * @param {string} iconValue - 圖標值，可能是 URL 或預設圖標名稱
   * @returns {boolean} - 如果是有效的圖標 URL 返回 true
   */
  isIconUrl(iconValue) {
    return (
      typeof iconValue === 'string' &&
      (iconValue.startsWith('http://') || iconValue.startsWith('https://'))
    );
  }

  /**
   * 從緩存中獲取圖標 URL
   * @param {string} fileName - 文件名
   * @returns {string|null} - 如果存在則返回 URL，否則返回 null
   */
  getCachedIconUrl(fileName) {
    return this.cache[fileName] || null;
  }
}

// 創建服務實例
const workflowAPIService = new WorkflowAPIService();
const llmService = new LLMService();
// 將 IconUploadService 添加到導出
const iconUploadService = new IconUploadService();

const React$e = await importShared('react');
const {memo: memo$9,useState: useState$b,useEffect: useEffect$5,useCallback: useCallback$4} = React$e;
const AICustomInputNode = ({ data, isConnectable, id }) => {
  const [modelOptions, setModelOptions] = useState$b([
    { value: "1", label: "O3-mini" },
    { value: "2", label: "O3-plus" },
    { value: "3", label: "O3-mega" },
    { value: "4", label: "O3-ultra" }
  ]);
  const edges = useEdges();
  const contextConnectionCount = edges.filter(
    (edge) => edge.target === id && edge.targetHandle === "context-input"
  ).length;
  const hasPromptConnection = edges.some(
    (edge) => edge.target === id && edge.targetHandle === "prompt-input"
  );
  const [isLoadingModels, setIsLoadingModels] = useState$b(false);
  const [modelLoadError, setModelLoadError] = useState$b(null);
  const [localModel, setLocalModel] = useState$b(data?.model || "1");
  const [promptText, setPromptText] = useState$b(data?.promptText || "");
  useEffect$5(() => {
    console.log("AICustomInputNode 數據同步更新:", {
      "data.model": data?.model,
      "data.promptText": data?.promptText
    });
    if (data?.model && data.model !== localModel) {
      console.log(`同步模型從 ${localModel} 到 ${data.model}`);
      setLocalModel(data.model);
    }
    if (data?.promptText !== void 0 && data.promptText !== promptText) {
      console.log(`同步 prompt 文本從 "${promptText}" 到 "${data.promptText}"`);
      setPromptText(data.promptText);
    }
  }, [data?.model, data?.promptText, localModel, promptText]);
  const loadModels = async () => {
    if (isLoadingModels) return;
    setIsLoadingModels(true);
    setModelLoadError(null);
    try {
      console.log("開始加載模型列表");
      const options = await llmService.getModelOptions();
      console.log("llmService.getModelOptions 返回結果:", options);
      if (options && options.length > 0) {
        console.log("設置模型選項:", options);
        setModelOptions(options);
        const isCurrentModelValid = options.some(
          (opt) => opt.value === localModel
        );
        console.log(`當前模型 ${localModel} 是否有效:`, isCurrentModelValid);
        if (!isCurrentModelValid) {
          let defaultModel = options[0].value;
          const defaultOption = options.find((opt) => opt.isDefault);
          if (defaultOption) {
            defaultModel = defaultOption.value;
            console.log("找到默認模型:", defaultOption);
          }
          console.log(`將模型從 ${localModel} 更新為 ${defaultModel}`);
          setLocalModel(defaultModel);
          updateParentState("model", defaultModel);
        }
      } else {
        console.warn("API未返回有效的模型選項或返回了空陣列");
      }
    } catch (error) {
      console.error("加載模型失敗:", error);
      if (!(error.message && (error.message.includes("已有進行中的LLM模型請求") || error.message.includes("進行中的請求") || error.message.includes("使用相同請求")))) {
        setModelLoadError("無法載入模型列表，請稍後再試");
      }
    } finally {
      setIsLoadingModels(false);
    }
  };
  useEffect$5(() => {
    loadModels();
  }, []);
  const updateParentState = useCallback$4(
    (key, value) => {
      console.log(`嘗試更新父組件狀態 ${key}=${value}`);
      if (data && typeof data.updateNodeData === "function") {
        data.updateNodeData(key, value);
        console.log(`使用 updateNodeData 更新 ${key}`);
        return true;
      }
      if (data) {
        data[key] = value;
        console.log(`直接修改 data.${key} = ${value}`);
        return true;
      }
      console.warn(`無法更新父組件的 ${key}`);
      return false;
    },
    [data]
  );
  const handleModelChange = useCallback$4(
    (e) => {
      const newModelValue = e.target.value;
      console.log(`模型變更為ID: ${newModelValue}`);
      setLocalModel(newModelValue);
      updateParentState("model", newModelValue);
    },
    [updateParentState]
  );
  const handlePromptTextChange = useCallback$4(
    (e) => {
      const newText = e.target.value;
      console.log(`Prompt 文本變更為: ${newText}`);
      setPromptText(newText);
      updateParentState("promptText", newText);
    },
    [updateParentState]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg shadow-md overflow-hidden w-64", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-orange-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center text-white mr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconBase, { type: "ai" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "AI" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-gray-200" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-gray-700 mb-1 font-bold", children: "model" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              className: `w-full border border-gray-300 rounded p-2 text-sm bg-white 
                ${isLoadingModels ? "opacity-70 cursor-wait" : ""} 
                ${modelLoadError ? "border-red-300" : ""}`,
              value: localModel,
              onChange: handleModelChange,
              disabled: isLoadingModels,
              children: modelOptions.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "option",
                {
                  value: option.value,
                  children: option.label
                },
                option.value
              ))
            }
          ),
          isLoadingModels && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-2 top-1/2 transform -translate-y-1/2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" }) })
        ] }),
        modelLoadError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-500 mt-1", children: modelLoadError })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-gray-700 font-bold", children: "Prompt" }),
          hasPromptConnection && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full", children: "已連線" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AutoResizeTextarea,
          {
            value: promptText,
            onChange: handlePromptTextChange,
            placeholder: "輸入您的提示",
            className: "w-full border border-gray-300 rounded p-2 text-sm"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700 mr-2 font-bold", children: "Context" }),
        contextConnectionCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full", children: [
          contextConnectionCount,
          " 個連線"
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle$1,
      {
        type: "target",
        position: Position.Left,
        id: "prompt-input",
        style: {
          background: "#e5e7eb",
          border: "1px solid #D3D3D3",
          width: "12px",
          height: "12px",
          left: "-6px",
          top: "70%",
          // 調整位置到 prompt 文本區域附近
          transform: "translateY(-50%)"
        },
        isConnectable
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle$1,
      {
        type: "target",
        position: Position.Left,
        id: "context-input",
        style: {
          background: "#e5e7eb",
          border: "1px solid #D3D3D3",
          width: "12px",
          height: "12px",
          left: "-6px",
          top: "92%",
          // 調整位置到 context 標籤附近
          transform: "translateY(-50%)"
        },
        isConnectable
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle$1,
      {
        type: "source",
        position: Position.Right,
        id: "output",
        style: {
          background: "#e5e7eb",
          border: "1px solid #D3D3D3",
          width: "12px",
          height: "12px",
          right: "-6px"
        },
        isConnectable
      }
    )
  ] });
};
const AICustomInputNode$1 = memo$9(AICustomInputNode);

const add = "data:image/svg+xml,%3csvg%20width='16'%20height='16'%20viewBox='0%200%2016%2016'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23l9ob8qnlxa)'%3e%3cpath%20d='M8%200a8%208%200%200%200-8%208%208%208%200%200%200%208%208%208%208%200%200%200%208-8%208%208%200%200%200-8-8zm4.666%208.666A.664.664%200%200%201%2012%209.33H9.334V12a.664.664%200%200%201-.665.666H7.334A.666.666%200%200%201%206.67%2012V9.334H4a.666.666%200%200%201-.666-.665V7.334c0-.368.297-.665.666-.665h2.666V4c0-.369.296-.666.665-.666h1.335c.368%200%20.665.3.665.666v2.666H12c.369%200%20.666.3.666.665v1.335z'%20fill='%23fff'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='l9ob8qnlxa'%3e%3cpath%20fill='%23fff'%20d='M0%200h16v16H0z'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";

await importShared('react');
const Add = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `flex items-center justify-center`,
      style: {
        width: "14px",
        height: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: add,
          width: 32,
          height: 32,
          className: "max-w-full max-h-full object-contain",
          style: {
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain"
          }
        }
      )
    }
  );
};

const React$d = await importShared('react');
const {memo: memo$8,useEffect: useEffect$4,useState: useState$a,useRef: useRef$2,useCallback: useCallback$3} = React$d;
const BrowserExtensionOutputNode = ({ id, data, isConnectable }) => {
  const [inputs, setInputs] = useState$a([]);
  const updateNodeInternals = useUpdateNodeInternals();
  const initAttempts = useRef$2(0);
  const nodeId = id || "unknown";
  const getNodeHeight = useCallback$3(() => {
    const headerHeight = 50;
    const buttonAreaHeight = 48;
    const textAreaHeight = 40;
    const bottomPadding = 10;
    const handleSpacing = 20;
    return headerHeight + buttonAreaHeight + textAreaHeight + bottomPadding + inputs.length * handleSpacing;
  }, [inputs.length]);
  useEffect$4(() => {
    initAttempts.current += 1;
    console.log(
      `初始化 BrowserExtensionOutputNode ${nodeId}，嘗試 #${initAttempts.current}`
    );
    let handles = [];
    if (data.node_input && typeof data.node_input === "object") {
      const inputKeys = Object.keys(data.node_input);
      console.log(`從 node_input 載入 handle (${nodeId}):`, inputKeys);
      if (inputKeys.length > 0) {
        handles = inputKeys.map((handleId) => ({
          id: handleId
        }));
        console.log(`從 node_input 找到 ${handles.length} 個 handle`);
      }
    }
    if (data.inputHandles && Array.isArray(data.inputHandles)) {
      console.log(
        `從 inputHandles 屬性載入 ${data.inputHandles.length} 個 handle`
      );
      handles = data.inputHandles;
    }
    handles = handles.map((handle) => ({
      id: String(handle.id || `input_${Date.now()}`)
    }));
    setInputs(handles);
    const updateTimes = [0, 50, 150, 300, 600, 1e3, 1500];
    updateTimes.forEach((delay) => {
      setTimeout(() => {
        try {
          updateNodeInternals(nodeId);
        } catch (error) {
          console.error(`更新節點內部結構時出錯:`, error);
        }
      }, delay);
    });
  }, [nodeId, data, updateNodeInternals]);
  useEffect$4(() => {
    if (inputs.length > 0) {
      console.log(`inputs 更新為 ${inputs.length} 個 handle，更新內部結構`);
      setTimeout(() => {
        try {
          updateNodeInternals(nodeId);
        } catch (error) {
          console.error(`更新節點內部結構時出錯:`, error);
        }
      }, 50);
    }
  }, [inputs, nodeId, updateNodeInternals]);
  const edges = useEdges();
  const connectionCount = edges.filter((edge) => edge.target === id).length;
  const handleAddOutput = useCallback$3(() => {
    const newInputId = `input_${Date.now()}`;
    const newInputs = [...inputs, { id: newInputId }];
    console.log(`新增 handle (${nodeId}):`, newInputId);
    setInputs(newInputs);
    if (data.onAddOutput) {
      data.onAddOutput(newInputs);
    }
  }, [inputs, data.onAddOutput, nodeId]);
  const nodeStyle = {
    height: `${getNodeHeight()}px`,
    transition: "height 0.3s ease"
    // 添加平滑過渡效果
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-lg shadow-md overflow-visible w-64 bg-white",
      style: nodeStyle,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "p-3 rounded-t-lg",
            style: { backgroundColor: "#f3f4f6" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-md bg-teal-500 flex items-center justify-center text-white mr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconBase, { type: "browser" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-base", children: "Browser Extension output" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "p-4",
            style: { backgroundColor: "white" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: "w-full bg-teal-500 hover:bg-teal-600 text-white rounded-md p-2 flex justify-center items-center",
                  onClick: handleAddOutput,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Add, {})
                }
              ),
              inputs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-600 mt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  "已有 ",
                  inputs.length,
                  " 個輸入點"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  "共連線 ",
                  connectionCount,
                  " 個"
                ] })
              ] })
            ]
          }
        ),
        inputs.map((input, index) => {
          const startY = 65;
          const spacing = 25;
          const topPosition = startY + index * spacing;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            Handle$1,
            {
              type: "target",
              position: Position.Left,
              id: String(input.id),
              style: {
                background: "#e5e7eb",
                borderColor: "#D3D3D3",
                width: "12px",
                height: "12px",
                left: "-6px",
                top: `${topPosition}px`
              },
              isConnectable
            },
            `handle-${input.id}`
          );
        })
      ]
    }
  );
};
const BrowserExtensionOutputNode$1 = memo$8(BrowserExtensionOutputNode);

const React$c = await importShared('react');
const {memo: memo$7,useState: useState$9,useEffect: useEffect$3,useCallback: useCallback$2,useRef: useRef$1} = React$c;
const BrowserExtensionInputNode = ({ data, isConnectable, id }) => {
  const [localItems, setLocalItems] = useState$9(data?.items || []);
  const [isUploading, setIsUploading] = useState$9(false);
  const [uploadError, setUploadError] = useState$9(null);
  const fileInputRef = useRef$1(null);
  const activeItemRef = useRef$1(null);
  useEffect$3(() => {
    console.log("BrowserExtensionInputNode 數據同步檢查:", {
      "data.items": data?.items,
      localItems,
      "node.id": id
    });
    if (Array.isArray(data?.items) && JSON.stringify(data.items) !== JSON.stringify(localItems)) {
      console.log("同步 items 數據到本地狀態");
      setLocalItems([...data.items]);
    }
  }, [data?.items]);
  const updateParentState = useCallback$2(
    (key, value) => {
      console.log(`嘗試更新父組件狀態 ${key}=`, value);
      if (key === "items" && data && typeof data.updateItems === "function") {
        data.updateItems(value);
        return true;
      }
      if (data && typeof data.updateNodeData === "function") {
        data.updateNodeData(key, value);
        return true;
      }
      if (data) {
        data[key] = value;
        return true;
      }
      console.warn(`無法更新父組件的 ${key}`);
      return false;
    },
    [data]
  );
  const handleIconClick = useCallback$2((index) => {
    console.log(`點擊項目 ${index} 的圖標，準備上傳新圖標`);
    activeItemRef.current = index;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  const handleFileSelect = useCallback$2(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const itemIndex = activeItemRef.current;
      if (itemIndex === null || itemIndex < 0 || itemIndex >= localItems.length) {
        console.warn("沒有找到活動項目索引或索引超出範圍");
        return;
      }
      setIsUploading(true);
      setUploadError(null);
      try {
        const result = await iconUploadService.uploadIcon(file);
        if (result.success && result.url) {
          console.log("圖標上傳成功:", result.url);
          handleIconChange(itemIndex, result.url);
        } else {
          throw new Error(result.error || "上傳失敗");
        }
      } catch (error) {
        console.error("上傳或處理圖標時發生錯誤:", error);
        setUploadError(error.message || "上傳圖標失敗");
      } finally {
        setIsUploading(false);
        event.target.value = "";
      }
    },
    [localItems]
  );
  const getIconComponent = useCallback$2(
    (iconValue, index) => {
      if (iconUploadService.isIconUrl(iconValue)) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "cursor-pointer",
            onClick: () => handleIconClick(index),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: iconValue,
                alt: "Custom Icon",
                className: "w-7 h-7 object-contain"
              }
            )
          }
        );
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "cursor-pointer",
          onClick: () => handleIconClick(index),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              width: "24",
              height: "24",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "17 8 12 3 7 8" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "line",
                  {
                    x1: "12",
                    y1: "3",
                    x2: "12",
                    y2: "15"
                  }
                )
              ]
            }
          )
        }
      );
    },
    [handleIconClick]
  );
  const handleIconChange = useCallback$2(
    (index, iconValue) => {
      console.log(`更新項目 ${index} 的圖標為`, iconValue);
      if (index < 0 || index >= localItems.length) {
        console.warn(`項目索引 ${index} 超出範圍`);
        return;
      }
      const updatedItems = localItems.map(
        (item, idx) => idx === index ? { ...item, icon: iconValue } : item
      );
      setLocalItems(updatedItems);
      updateParentState("items", updatedItems);
    },
    [localItems, updateParentState]
  );
  const handleNameChange = useCallback$2(
    (index, value) => {
      console.log(`修改項目 ${index} 的名稱為 "${value}"`);
      console.log("當前 items:", localItems);
      if (index < 0 || index >= localItems.length) {
        console.warn(`項目索引 ${index} 超出範圍`);
        return;
      }
      if (typeof data?.updateItemName === "function") {
        console.log("使用 updateItemName 回調函數");
        data.updateItemName(index, value);
      }
      console.log("使用自定義方法更新項目名稱");
      const updatedItems = localItems.map(
        (item, idx) => idx === index ? { ...item, name: value } : item
      );
      console.log("更新後的 items:", updatedItems);
      setLocalItems(updatedItems);
      updateParentState("items", updatedItems);
    },
    [data, localItems, updateParentState]
  );
  const handleAddItem = useCallback$2(() => {
    console.log("添加新項目");
    if (typeof data?.addItem === "function") {
      console.log("使用 addItem 回調函數");
      data.addItem();
      return;
    }
    console.log("使用自定義方法添加項目");
    const newItem = { name: "", icon: "upload" };
    const updatedItems = [...localItems, newItem];
    setLocalItems(updatedItems);
    updateParentState("items", updatedItems);
  }, [data, localItems, updateParentState]);
  const calculateHandlePosition = useCallback$2((index) => {
    const headerHeight = 46;
    const contentPadding = 16;
    const itemHeight = 140;
    return headerHeight + contentPadding + index * itemHeight + itemHeight / 2;
  }, []);
  const getOutputKey = useCallback$2((item, index) => {
    return item.id || `a${index + 1}`;
  }, []);
  const items = Array.isArray(localItems) && localItems.length > 0 ? localItems : Array.isArray(data?.items) ? data.items : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shadow-md w-64 relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "file",
        ref: fileInputRef,
        style: { display: "none" },
        accept: "image/*",
        onChange: handleFileSelect
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-100 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center text-white mr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconBase, { type: "browser" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Browser Extension input" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-gray-200" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4", children: [
        items.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "mb-4 last:mb-2 relative",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-gray-700 mb-1 font-bold", children: "name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    className: "w-full border border-gray-300 rounded p-2 text-sm",
                    value: item.name || "",
                    onChange: (e) => {
                      console.log(`輸入框 ${idx} 值變更為:`, e.target.value);
                      handleNameChange(idx, e.target.value);
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-gray-700 mr-4 font-bold", children: "icon" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex justify-center items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `w-10 h-10 flex justify-center items-center ${isUploading && activeItemRef.current === idx ? "opacity-50" : ""}`,
                    title: "點擊上傳自定義圖標",
                    children: isUploading && activeItemRef.current === idx ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500" }) : getIconComponent(item.icon, idx)
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-5" })
              ] }),
              uploadError && activeItemRef.current === idx && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-red-500 mt-1 mb-2", children: uploadError }),
              idx < items.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-gray-200 my-3" })
            ]
          },
          idx
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "w-full bg-teal-500 hover:bg-teal-600 text-white rounded-md p-2 flex justify-center items-center mt-4",
            onClick: handleAddItem,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Add, {})
          }
        )
      ] })
    ] }),
    items.map((item, idx) => {
      const outputKey = getOutputKey(item, idx);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Handle$1,
        {
          type: "source",
          position: Position.Right,
          id: outputKey,
          style: {
            background: "#e5e7eb",
            border: "1px solid #D3D3D3",
            width: "12px",
            height: "12px",
            right: "-7px",
            top: calculateHandlePosition(idx),
            transform: "translateY(-50%)",
            // Only center vertically
            zIndex: 1e3
          },
          isConnectable
        },
        `handle-${idx}`
      );
    })
  ] });
};
const BrowserExtensionInputNode$1 = memo$7(BrowserExtensionInputNode);

const React$b = await importShared('react');
const {memo: memo$6} = React$b;
const IfElseNode = ({ data, isConnectable }) => {
  const operators = [
    { value: "equals", label: "[Text] Equals" },
    { value: "contains", label: "[Text] Contains" },
    { value: "startsWith", label: "[Text] Starts With" },
    { value: "endsWith", label: "[Text] Ends With" },
    { value: "greaterThan", label: "[Number] Greater Than" },
    { value: "lessThan", label: "[Number] Less Than" }
  ];
  const handleFieldChange = (field, value) => {
    if (data.updateNodeData) {
      data.updateNodeData(field, value);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg shadow-md overflow-hidden w-64", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-purple-100 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-md bg-purple-500 flex items-center justify-center text-white mr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconBase, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "If / Else" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-gray-200" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-gray-700 mb-1", children: "If" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            className: "w-full border border-gray-300 rounded p-2 text-sm",
            placeholder: "formate_value",
            value: data.variableName || "",
            onChange: (e) => handleFieldChange("variableName", e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          className: "w-full border border-gray-300 rounded p-2 text-sm",
          value: data.operator || "equals",
          onChange: (e) => handleFieldChange("operator", e.target.value),
          children: operators.map((op) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "option",
            {
              value: op.value,
              children: op.label
            },
            op.value
          ))
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          className: "w-full border border-gray-300 rounded p-2 text-sm",
          placeholder: "Value to compare",
          value: data.compareValue || "",
          onChange: (e) => handleFieldChange("compareValue", e.target.value)
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle$1,
      {
        type: "target",
        position: Position.Left,
        id: "input",
        style: {
          background: "#555",
          width: "8px",
          height: "8px",
          left: "-4px"
        },
        isConnectable
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle$1,
      {
        type: "source",
        position: Position.Right,
        id: "true",
        style: {
          background: "#10B981",
          // green color for "true"
          width: "8px",
          height: "8px",
          right: "-4px",
          top: "35%"
        },
        isConnectable
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle$1,
      {
        type: "source",
        position: Position.Right,
        id: "false",
        style: {
          background: "#EF4444",
          // red color for "false"
          width: "8px",
          height: "8px",
          right: "-4px",
          top: "65%"
        },
        isConnectable
      }
    )
  ] });
};
const IfElseNode$1 = memo$6(IfElseNode);

const React$a = await importShared('react');
const {memo: memo$5,useState: useState$8,useEffect: useEffect$2,useCallback: useCallback$1} = React$a;
const KnowledgeRetrievalNode = ({ data, isConnectable, id }) => {
  const [isLoadingFiles, setIsLoadingFiles] = useState$8(false);
  const [fileLoadError, setFileLoadError] = useState$8(null);
  const [dataFiles, setDataFiles] = useState$8(
    data?.availableFiles || [
      {
        id: "icdcode",
        value: "icdcode",
        name: "ICDCode.csv",
        label: "ICDCode.csv"
      },
      {
        id: "cardiology",
        value: "cardiology",
        name: "Cardiology_Diagnoses.csv",
        label: "Cardiology_Diagnoses.csv"
      }
    ]
  );
  const [localSelectedFile, setLocalSelectedFile] = useState$8(
    data?.selectedFile || ""
  );
  const [topK, setTopK] = useState$8(data?.topK || 5);
  const updateParentState = useCallback$1(
    (key, value) => {
      console.log(`嘗試更新父組件狀態 ${key}=${value}`);
      if (data && typeof data.updateNodeData === "function") {
        data.updateNodeData(key, value);
        console.log(`使用 updateNodeData 更新 ${key}`);
        return true;
      }
      if (data) {
        data[key] = value;
        console.log(`直接修改 data.${key} = ${value}`);
        return true;
      }
      console.warn(`無法更新父組件的 ${key}`);
      return false;
    },
    [data]
  );
  const handleFileSelect = useCallback$1(
    (event) => {
      const fileId = event.target.value;
      console.log(`選擇文件: ${fileId}`);
      setLocalSelectedFile(fileId);
      updateParentState("selectedFile", fileId);
    },
    [updateParentState]
  );
  const getCurrentSelectedFile = useCallback$1(() => {
    return data?.selectedFile || localSelectedFile;
  }, [data?.selectedFile, localSelectedFile]);
  const loadFiles = useCallback$1(async () => {
    if (isLoadingFiles) return;
    console.log("開始加載文件列表...");
    setIsLoadingFiles(true);
    setFileLoadError(null);
    try {
      const options = await llmService.getFileOptions();
      if (options && options.length > 0) {
        console.log("已獲取文件選項:", options);
        setDataFiles(options);
        const currentFile = getCurrentSelectedFile();
        if (!options.some(
          (opt) => opt.id === currentFile || opt.value === currentFile
        ) && options.length > 0) {
          setLocalSelectedFile(options[0].id || options[0].value);
          updateParentState("selectedFile", options[0].id || options[0].value);
        }
      }
    } catch (error) {
      console.error("加載文件失敗:", error);
      if (error.message && (error.message.includes("已有進行中的") || error.message.includes("進行中的請求") || error.message.includes("使用相同請求"))) {
        console.log("正在等待其他相同請求完成...");
      } else {
        setFileLoadError("無法載入文件列表，請稍後再試");
      }
    } finally {
      setIsLoadingFiles(false);
    }
  }, [isLoadingFiles, getCurrentSelectedFile, updateParentState]);
  useEffect$2(() => {
    console.log("監測 data.selectedFile 變更：", {
      "data.selectedFile": data?.selectedFile,
      localSelectedFile,
      "node.id": id
    });
    if (data?.selectedFile && data.selectedFile !== localSelectedFile) {
      console.log(
        `同步文件選擇從 ${localSelectedFile} 到 ${data.selectedFile}`
      );
      setLocalSelectedFile(data.selectedFile);
    }
    if (data?.topK && data.topK !== topK) {
      setTopK(data.topK);
    }
  }, [data?.selectedFile, data?.topK, localSelectedFile, topK, id]);
  useEffect$2(() => {
    loadFiles();
    console.log("KnowledgeRetrievalNode 初始化狀態:", {
      "node.id": id,
      "data.selectedFile": data?.selectedFile,
      "data.topK": data?.topK,
      localSelectedFile,
      topK,
      "dataFiles.length": dataFiles.length
    });
  }, [
    id,
    data?.selectedFile,
    data?.topK,
    localSelectedFile,
    topK,
    dataFiles.length,
    loadFiles
  ]);
  const handleReloadFiles = useCallback$1(() => {
    if (dataFiles.length <= 2 || fileLoadError) {
      loadFiles();
    }
  }, [dataFiles.length, fileLoadError, loadFiles]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg shadow-md overflow-visible w-64", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-cyan-400 p-4 rounded-t-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 bg-white rounded-md flex items-center justify-center mr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconBase, { type: "knowledge" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-white", children: "知識檢索" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white p-4 rounded-b-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-gray-700 mb-1 font-bold", children: "Knowledge" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              className: `w-full border ${fileLoadError ? "border-red-300" : "border-gray-300"} rounded-md p-2 text-sm bg-white appearance-none ${isLoadingFiles ? "opacity-70 cursor-wait" : ""}`,
              value: getCurrentSelectedFile(),
              onChange: handleFileSelect,
              disabled: isLoadingFiles,
              onClick: handleReloadFiles,
              style: {
                paddingRight: "2rem",
                textOverflow: "ellipsis"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "option",
                  {
                    value: "",
                    disabled: true,
                    children: "選擇檔案..."
                  }
                ),
                dataFiles.map((file) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "option",
                  {
                    value: file.id || file.value,
                    children: file.name || file.label || file.filename
                  },
                  file.id || file.value
                ))
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none", children: isLoadingFiles ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              width: "16",
              height: "16",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "6 9 12 15 18 9" })
            }
          ) })
        ] }),
        fileLoadError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-500 mt-1", children: fileLoadError })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle$1,
      {
        type: "target",
        position: Position.Left,
        id: "passage",
        style: {
          background: "#e5e7eb",
          border: "1px solid #D3D3D3",
          width: "12px",
          height: "12px",
          left: "-6px"
        },
        isConnectable
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle$1,
      {
        type: "source",
        position: Position.Right,
        id: "output",
        style: {
          background: "#e5e7eb",
          border: "1px solid #D3D3D3",
          width: "12px",
          height: "12px",
          right: "-6px"
        },
        isConnectable
      }
    )
  ] });
};
const KnowledgeRetrievalNode$1 = memo$5(KnowledgeRetrievalNode);

const React$9 = await importShared('react');
const {memo: memo$4} = React$9;
const EndNode = ({ data, isConnectable }) => {
  const handleFieldChange = (field, value) => {
    if (data.updateNodeData) {
      data.updateNodeData(field, value);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg shadow-md overflow-hidden w-64", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-green-100 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 flex items-center justify-center mr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          width: "24",
          height: "24",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          className: "text-green-600",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "circle",
              {
                cx: "12",
                cy: "12",
                r: "10"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "16 12 12 8 8 12" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "line",
              {
                x1: "12",
                y1: "16",
                x2: "12",
                y2: "8"
              }
            )
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "End" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-gray-200" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-gray-700 mb-1", children: "Output Text" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          className: "w-full border border-gray-300 rounded p-2 text-sm",
          placeholder: "Output message",
          value: data.outputText || "",
          onChange: (e) => handleFieldChange("outputText", e.target.value)
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle$1,
      {
        type: "target",
        position: Position.Left,
        id: "input",
        style: {
          background: "#555",
          width: "8px",
          height: "8px",
          left: "-4px"
        },
        isConnectable
      }
    )
  ] });
};
const EndNode$1 = memo$4(EndNode);

const React$8 = await importShared('react');
const {memo: memo$3,useState: useState$7} = React$8;
const WebhookNode = ({ data, isConnectable }) => {
  const [showInput, setShowInput] = useState$7(false);
  const [tempUrl, setTempUrl] = useState$7("");
  const [showCopyAlert, setShowCopyAlert] = useState$7(false);
  const [isEditing, setIsEditing] = useState$7(false);
  const handleCreateWebhook = () => {
    setShowInput(true);
  };
  const handleConfirmWebhook = () => {
    if (tempUrl.trim()) {
      if (data.updateNodeData) {
        data.updateNodeData("webhookUrl", tempUrl);
        setShowInput(false);
        setIsEditing(false);
      }
    }
  };
  const handleCopyToClipboard = () => {
    if (data.webhookUrl) {
      navigator.clipboard.writeText(data.webhookUrl).then(() => {
        setShowCopyAlert(true);
        setTimeout(() => {
          setShowCopyAlert(false);
        }, 2e3);
      }).catch((err) => {
        console.error("Failed to copy URL: ", err);
      });
    }
  };
  const handleEditWebhook = () => {
    setTempUrl(data.webhookUrl);
    setIsEditing(true);
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg shadow-md overflow-visible w-64", children: [
    showCopyAlert && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-10 left-0 right-0 bg-green-500 text-white py-2 px-4 rounded-md text-center text-sm", children: "URL copied to clipboard!" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg shadow-md overflow-visible w-64", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 p-4 rounded-t-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 bg-red-50 flex items-center justify-center mr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconBase, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Webhook" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-2 rounded-b-lg", children: [
        !data.webhookUrl && !showInput && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "w-full bg-red-500 hover:bg-red-600 text-white rounded-md p-2 flex justify-center items-center",
            onClick: handleCreateWebhook,
            children: "Create a webhook"
          }
        ),
        showInput && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-gray-700 mb-1", children: "URL:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                className: "flex-1 border border-gray-300 rounded-l p-2 text-sm",
                placeholder: "Enter webhook URL",
                value: tempUrl,
                onChange: (e) => setTempUrl(e.target.value)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "bg-red-500 hover:bg-red-600 text-white px-3 rounded-r",
                onClick: handleConfirmWebhook,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "svg",
                  {
                    xmlns: "http://www.w3.org/2000/svg",
                    width: "16",
                    height: "16",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "20 6 9 17 4 12" })
                  }
                )
              }
            )
          ] })
        ] }) })
      ] }),
      data.webhookUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white pl-4 pr-4 pb-4 rounded-b", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-gray-700 mb-1", children: "URL:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center", children: isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              className: "flex-1 border border-gray-300 rounded-t p-2 text-sm",
              value: tempUrl,
              onChange: (e) => setTempUrl(e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded",
                onClick: handleConfirmWebhook,
                children: "Save"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded",
                onClick: handleCancelEdit,
                children: "Cancel"
              }
            )
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: data.webhookUrl,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-blue-600 hover:underline truncate text-sm flex-1 pr-2",
              onClick: (e) => {
                e.preventDefault();
                handleEditWebhook();
              },
              children: data.webhookUrl
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "bg-red-500 hover:bg-red-600 text-white p-1 rounded flex-shrink-0",
              onClick: handleCopyToClipboard,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "16",
                  height: "16",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "rect",
                      {
                        x: "9",
                        y: "9",
                        width: "13",
                        height: "13",
                        rx: "2",
                        ry: "2"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
                  ]
                }
              )
            }
          )
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle$1,
      {
        type: "target",
        position: Position.Left,
        id: "input",
        style: {
          background: "#555",
          width: "8px",
          height: "8px",
          left: "-4px"
        },
        isConnectable
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle$1,
      {
        type: "source",
        position: Position.Right,
        id: "output",
        style: {
          background: "#555",
          width: "8px",
          height: "8px",
          right: "-4px"
        },
        isConnectable
      }
    )
  ] });
};
const WebhookNode$1 = memo$3(WebhookNode);

const React$7 = await importShared('react');
const {memo: memo$2} = React$7;
const HTTPNode = ({ data, isConnectable }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg shadow-md overflow-hidden w-64", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-red-400 flex items-center justify-center text-white mr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          width: "16",
          height: "16",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 4h16v16H4z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 9h16" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "HTTP" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-gray-200" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-gray-700 mb-1", children: "URL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            className: "w-full border border-gray-300 rounded p-2 text-sm",
            value: data.url || "",
            onChange: (e) => data.updateNodeData("url", e.target.value),
            placeholder: "Enter URL"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-gray-700 mb-1", children: "Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            className: "w-full border border-gray-300 rounded p-2 text-sm bg-white",
            value: data.method || "GET",
            onChange: (e) => data.updateNodeData("method", e.target.value),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "GET", children: "GET" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "POST", children: "POST" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PUT", children: "PUT" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "DELETE", children: "DELETE" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle$1,
      {
        type: "target",
        position: Position.Left,
        id: "input",
        style: {
          background: "#555",
          width: "8px",
          height: "8px",
          left: "-4px"
        },
        isConnectable
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle$1,
      {
        type: "source",
        position: Position.Right,
        id: "output",
        style: {
          background: "#555",
          width: "8px",
          height: "8px",
          right: "-4px"
        },
        isConnectable
      }
    )
  ] });
};
const HTTPNode$1 = memo$2(HTTPNode);

const React$6 = await importShared('react');
const {memo: memo$1,useState: useState$6} = React$6;
const LineNode = ({ data, isConnectable }) => {
  const [mode, setMode] = useState$6(data.mode || "reply");
  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (data.updateNodeData) {
      data.updateNodeData("mode", newMode);
    }
  };
  const handleTextChange = (value) => {
    if (data.updateNodeData) {
      data.updateNodeData("text", value);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg shadow-md overflow-hidden w-64", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-100 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 bg-[#06C755] rounded-full flex items-center justify-center mr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconBase, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Line" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `flex-1 py-2 text-center ${mode === "reply" ? "bg-green-50 text-green-600 font-medium border-b-2 border-green-600" : "text-gray-500 border-b border-gray-300"}`,
            onClick: () => handleModeChange("reply"),
            children: "Reply"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `flex-1 py-2 text-center ${mode === "push" ? "bg-green-50 text-green-600 font-medium border-b-2 border-green-600" : "text-gray-500 border-b border-gray-300"}`,
            onClick: () => handleModeChange("push"),
            children: "Push"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-gray-700 mb-1", children: mode === "reply" ? "Reply Text" : "Push Text" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            className: "w-full border border-gray-300 rounded p-2 text-sm",
            placeholder: mode === "reply" ? "Reply message text" : "Push message text",
            value: data.text || "",
            onChange: (e) => handleTextChange(e.target.value)
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle$1,
      {
        type: "target",
        position: Position.Left,
        id: "input",
        style: {
          background: "#555",
          width: "8px",
          height: "8px",
          left: "-4px"
        },
        isConnectable
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle$1,
      {
        type: "source",
        position: Position.Right,
        id: "output",
        style: {
          background: "#555",
          width: "8px",
          height: "8px",
          right: "-4px"
        },
        isConnectable
      }
    )
  ] });
};
const LineNode$1 = memo$1(LineNode);

const React$5 = await importShared('react');
const {memo,useState: useState$5} = React$5;
const TimerNode = ({ data, isConnectable }) => {
  const [hours, setHours] = useState$5(data.hours || 0);
  const [minutes, setMinutes] = useState$5(data.minutes || 0);
  const [seconds, setSeconds] = useState$5(data.seconds || 0);
  const handleTimeChange = (type, value) => {
    if (value !== "" && !/^\d+$/.test(value)) return;
    let numValue = value === "" ? 0 : parseInt(value, 10);
    switch (type) {
      case "hours":
        numValue = Math.max(0, Math.min(99, numValue));
        setHours(numValue);
        break;
      case "minutes":
        numValue = Math.max(0, Math.min(59, numValue));
        setMinutes(numValue);
        break;
      case "seconds":
        numValue = Math.max(0, Math.min(59, numValue));
        setSeconds(numValue);
        break;
      default:
        return;
    }
    if (data.updateNodeData) {
      data.updateNodeData(type, numValue);
    }
  };
  const handleBlur = (type, value) => {
    const formattedValue = value.toString().padStart(2, "0");
    switch (type) {
      case "hours":
        setHours(parseInt(formattedValue, 10));
        break;
      case "minutes":
        setMinutes(parseInt(formattedValue, 10));
        break;
      case "seconds":
        setSeconds(parseInt(formattedValue, 10));
        break;
      default:
        return;
    }
  };
  const incrementTime = (type) => {
    switch (type) {
      case "hours":
        handleTimeChange("hours", hours + 1);
        break;
      case "minutes":
        handleTimeChange("minutes", minutes + 1);
        break;
      case "seconds":
        handleTimeChange("seconds", seconds + 1);
        break;
      default:
        return;
    }
  };
  const decrementTime = (type) => {
    switch (type) {
      case "hours":
        handleTimeChange("hours", hours - 1);
        break;
      case "minutes":
        handleTimeChange("minutes", minutes - 1);
        break;
      case "seconds":
        handleTimeChange("seconds", seconds - 1);
        break;
      default:
        return;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg shadow-md overflow-hidden w-64", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-purple-100 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white mr-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(IconBase, {}),
        " "
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Timer" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-gray-700 mb-2", children: "Set time interval" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs text-gray-500 mb-1 text-center", children: "Hours" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "bg-gray-200 rounded-t text-gray-700 text-sm h-6",
                onClick: () => incrementTime("hours"),
                onMouseUp: () => document.activeElement.blur(),
                children: "+"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                inputMode: "numeric",
                pattern: "[0-9]*",
                className: "w-full border border-gray-300 rounded-none p-2 text-sm text-center",
                value: hours,
                onChange: (e) => handleTimeChange("hours", e.target.value),
                onBlur: () => handleBlur("hours", hours),
                maxLength: 2
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "bg-gray-200 rounded-b text-gray-700 text-sm h-6",
                onClick: () => decrementTime("hours"),
                onMouseUp: () => document.activeElement.blur(),
                children: "-"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: ":" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs text-gray-500 mb-1 text-center", children: "Minutes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "bg-gray-200 rounded-t text-gray-700 text-sm h-6",
                onClick: () => incrementTime("minutes"),
                onMouseUp: () => document.activeElement.blur(),
                children: "+"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                inputMode: "numeric",
                pattern: "[0-9]*",
                className: "w-full border border-gray-300 rounded-none p-2 text-sm text-center",
                value: minutes,
                onChange: (e) => handleTimeChange("minutes", e.target.value),
                onBlur: () => handleBlur("minutes", minutes),
                maxLength: 2
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "bg-gray-200 rounded-b text-gray-700 text-sm h-6",
                onClick: () => decrementTime("minutes"),
                onMouseUp: () => document.activeElement.blur(),
                children: "-"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: ":" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs text-gray-500 mb-1 text-center", children: "Seconds" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "bg-gray-200 rounded-t text-gray-700 text-sm h-6",
                onClick: () => incrementTime("seconds"),
                onMouseUp: () => document.activeElement.blur(),
                children: "+"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                inputMode: "numeric",
                pattern: "[0-9]*",
                className: "w-full border border-gray-300 rounded-none p-2 text-sm text-center",
                value: seconds,
                onChange: (e) => handleTimeChange("seconds", e.target.value),
                onBlur: () => handleBlur("seconds", seconds),
                maxLength: 2
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "bg-gray-200 rounded-b text-gray-700 text-sm h-6",
                onClick: () => decrementTime("seconds"),
                onMouseUp: () => document.activeElement.blur(),
                children: "-"
              }
            )
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle$1,
      {
        type: "target",
        position: Position.Left,
        id: "input",
        style: {
          background: "#555",
          width: "8px",
          height: "8px",
          left: "-4px"
        },
        isConnectable
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Handle$1,
      {
        type: "source",
        position: Position.Right,
        id: "output",
        style: {
          background: "#555",
          width: "8px",
          height: "8px",
          right: "-4px"
        },
        isConnectable
      }
    )
  ] });
};
const TimerNode$1 = memo(TimerNode);

const enhancedNodeTypes = {
  customInput: withNodeSelection(CustomInputNode$1),
  aiCustomInput: withNodeSelection(AICustomInputNode$1),
  browserExtensionOutput: withNodeSelection(BrowserExtensionOutputNode$1),
  browserExtensionInput: withNodeSelection(BrowserExtensionInputNode$1),
  ifElse: withNodeSelection(IfElseNode$1),
  knowledgeRetrieval: withNodeSelection(KnowledgeRetrievalNode$1),
  end: withNodeSelection(EndNode$1),
  webhook: withNodeSelection(WebhookNode$1),
  http: withNodeSelection(HTTPNode$1),
  line: withNodeSelection(LineNode$1),
  timer: withNodeSelection(TimerNode$1)
};

const React$4 = await importShared('react');
const {useState: useState$4} = React$4;

const SaveButton = ({
  onSave,
  className = "",
  title = "",
  flowId = "",
  disabled = false
}) => {
  const [saveState, setSaveState] = useState$4("");
  const [errorMessage, setErrorMessage] = useState$4("");
  const isTitleValid = title && title.trim().length > 0;
  const isCreateMode = !flowId || flowId === "new";
  const triggerSave = async () => {
    if (!isTitleValid) {
      setSaveState("error");
      setErrorMessage("請先輸入標題");
      setTimeout(() => {
        setSaveState("");
        setErrorMessage("");
      }, 2e3);
      return;
    }
    if (saveState === "saving") return;
    setSaveState("saving");
    setErrorMessage("");
    try {
      await onSave();
      setSaveState("saved");
      setTimeout(() => {
        setSaveState("");
      }, 2e3);
    } catch (error) {
      console.error("儲存按鈕：儲存作業期間發生錯誤：", error);
      setSaveState("error");
      setErrorMessage("儲存失敗");
      setTimeout(() => {
        setSaveState("");
        setErrorMessage("");
      }, 2e3);
    }
  };
  const getButtonStyles = () => {
    if (disabled || !isTitleValid && !saveState) {
      return "bg-gray-400 text-white cursor-not-allowed";
    }
    switch (saveState) {
      case "saving":
        return "bg-[#00ced1] opacity-70 text-white";
      case "saved":
        return "bg-[#00ced1] text-white";
      case "error":
        return "bg-red-500 text-white";
      default:
        return "bg-[#00ced1] text-white";
    }
  };
  const getButtonTitle = () => {
    if (!isTitleValid && !saveState) {
      return "請先輸入標題";
    }
    if (disabled) {
      return "目前無法儲存";
    }
    return isCreateMode ? "建立新流程" : "儲存現有流程";
  };
  const getButtonText = () => {
    if (saveState === "saving") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "svg",
          {
            className: "animate-spin",
            xmlns: "http://www.w3.org/2000/svg",
            width: "16",
            height: "16",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isCreateMode ? "建立中..." : "儲存中..." })
      ] });
    } else if (saveState === "saved") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            width: "16",
            height: "16",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 6L9 17l-5-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isCreateMode ? "已建立" : "已儲存" })
      ] });
    } else if (saveState === "error") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            width: "16",
            height: "16",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "circle",
                {
                  cx: "12",
                  cy: "12",
                  r: "10"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "line",
                {
                  x1: "12",
                  y1: "8",
                  x2: "12",
                  y2: "12"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "line",
                {
                  x1: "12",
                  y1: "16",
                  x2: "12.01",
                  y2: "16"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "錯誤" })
      ] });
    } else {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isCreateMode ? "Create" : "Save" });
    }
  };
  const buttonWidth = isCreateMode ? "92px" : "85px";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "inline-block bg-white rounded-full shadow-md",
        style: {
          padding: "10px 13px",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `rounded-full text-sm font-medium ${getButtonStyles()} ${className}`,
            onClick: triggerSave,
            disabled: saveState === "saving" || disabled || !isTitleValid && !saveState,
            title: getButtonTitle(),
            style: {
              width: buttonWidth,
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            },
            children: getButtonText()
          }
        )
      }
    ),
    errorMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-red-100 text-red-700 px-2 py-1 rounded text-xs whitespace-nowrap", children: errorMessage })
  ] });
};

const React$3 = await importShared('react');
const {useState: useState$3} = React$3;

// src/services/FileIOService.js

/**
 * 用於處理本地檔案作業（儲存和載入）的服務
 */
class FileIOService {
  /**
   * 通過建立下載來將資料儲存到本地檔案
   *
   * @param {Object} data - 要儲存的資料
   * @param {string} filename - 建議的檔案名稱（預設：flow.json）
   * @returns {Promise} - 當檔案準備下載時解析
   */
  static saveToFile(data, filename = 'flow.json') {
    return new Promise((resolve, reject) => {
      try {
        // 將資料轉換為 JSON 字串
        const jsonString = JSON.stringify(data, null, 2);

        // 建立含有資料的 Blob
        const blob = new Blob([jsonString], { type: 'application/json' });

        // 為 Blob 建立 URL
        const url = URL.createObjectURL(blob);

        // 建立臨時錨點元素
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        // 附加到文件，點擊開始下載，然後移除
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 清理 URL 物件
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);

        resolve({ success: true, filename });
      } catch (error) {
        console.error('儲存檔案時發生錯誤：', error);
        reject({
          success: false,
          message: '無法儲存檔案',
          error
        });
      }
    });
  }

  /**
   * 開啟檔案對話框並讀取本地檔案
   *
   * @param {Object} options - 檔案讀取選項
   * @param {string} options.accept - 要接受的 MIME 類型（預設：application/json）
   * @returns {Promise} - 解析檔案內容
   */
  static readFromFile(options = {}) {
    return new Promise((resolve, reject) => {
      try {
        // 建立檔案輸入元素
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = options.accept || 'application/json';
        fileInput.style.display = 'none';

        // 將輸入元素加入文件
        document.body.appendChild(fileInput);

        // 當選取檔案時
        fileInput.onchange = (event) => {
          const file = event.target.files[0];

          if (!file) {
            document.body.removeChild(fileInput);
            reject({ success: false, message: '未選取檔案' });
            return;
          }

          // 建立 FileReader 讀取檔案
          const reader = new FileReader();

          // 定義檔案載入時發生的事
          reader.onload = (e) => {
            try {
              // 嘗試將檔案內容解析為 JSON
              const fileContent = e.target.result;
              const parsedData = JSON.parse(fileContent);

              // 清理檔案輸入
              document.body.removeChild(fileInput);

              // 解析已解析的資料
              resolve({
                success: true,
                filename: file.name,
                data: parsedData
              });
            } catch (parseError) {
              document.body.removeChild(fileInput);
              reject({
                success: false,
                message: '無效的 JSON 檔案',
                error: parseError
              });
            }
          };

          // 定義發生錯誤時的處理
          reader.onerror = (error) => {
            document.body.removeChild(fileInput);
            reject({
              success: false,
              message: '讀取檔案時發生錯誤',
              error
            });
          };

          // 以文字方式讀取檔案
          reader.readAsText(file);
        };

        // 觸發檔案選取對話框
        fileInput.click();
      } catch (error) {
        console.error('開啟檔案對話框時發生錯誤：', error);
        reject({
          success: false,
          message: '無法開啟檔案對話框',
          error
        });
      }
    });
  }
}

await importShared('react');

/**
 * 增強版 IFrameBridgeService - 處理從母網站接收標題修改及下載JSON功能
 */
class IFrameBridgeService {
  constructor() {
    // 標記是否已初始化，防止重複初始化
    this.initialized = false;

    // 追蹤已註冊的事件處理函數
    this.eventHandlers = {
      titleChange: [],
      downloadRequest: [],
      loadWorkflow: [], // 新增載入工作流事件
      ready: []
    };

    // 是否在 iframe 內部
    this.isInIframe = false;

    // 初始化
    this.init();
  }

  /**
   * 初始化通訊橋接器
   */
  init() {
    // 防止重複初始化
    if (this.initialized) return;
    this.initialized = true;

    try {
      this.isInIframe = window.self !== window.top;
    } catch {
      // 如果訪問window.top出現安全錯誤，則我們肯定在iframe中
      this.isInIframe = true;
    }

    if (this.isInIframe) {
      // 監聽來自父頁面的消息
      window.addEventListener(
        'message',
        this.handleIncomingMessage.bind(this),
        false
      );

      // 通知父頁面我們已準備好
      this.sendToParent({
        type: 'READY',
        timestamp: new Date().toISOString()
      });

      // 觸發內部準備好事件
      this.triggerEvent('ready', {
        timestamp: new Date().toISOString()
      });

      console.log('IFrameBridgeService 已初始化 - 在 iframe 模式中運行');
    } else {
      console.log('IFrameBridgeService 已初始化 - 在獨立模式中運行');
    }
  }

  /**
   * 處理來自父頁面的消息
   * @param {MessageEvent} event - 消息事件對象
   */
  handleIncomingMessage(event) {
    const message = event.data;

    // 檢查消息結構
    if (!message || !message.type) {
      return;
    }

    console.log('收到消息:', message);

    // 根據消息類型處理
    switch (message.type) {
      case 'PING':
        // 立即回應PONG
        this.sendToParent({
          type: 'PONG',
          timestamp: new Date().toISOString()
        });

        // 同時重新發送READY消息以確保連接建立
        this.sendToParent({
          type: 'READY',
          timestamp: new Date().toISOString()
        });
        break;
      case 'SET_FLOW_ID':
        if (message.flowId) {
          const flowId = message.flowId;
          // 更詳細的日誌，顯示將要觸發的事件類型和數據
          console.log(`準備觸發 loadWorkflow 事件，流ID: "${flowId}"`);
          console.log(
            `註冊的 loadWorkflow 處理程序數量: ${this.eventHandlers.loadWorkflow.length}`
          );

          // 觸發流ID變更事件
          this.triggerEvent('loadWorkflow', flowId);
        }
        break;
      case 'SET_TITLE':
        if (message.title) {
          // 更詳細的日誌，顯示將要觸發的事件類型和數據
          console.log(`準備觸發 titleChange 事件，標題值: "${message.title}"`);
          console.log(
            `註冊的 titleChange 處理程序數量: ${this.eventHandlers.titleChange.length}`
          );

          // 觸發標題變更事件
          // this.triggerEvent('titleChange', message.title);

          // 如果標題可作為工作流ID，觸發載入工作流事件
          // const workflowId = message.title;
          // console.log(`準備觸發 loadWorkflow 事件，工作流ID: "${workflowId}"`);
          // console.log(
          //   `註冊的 loadWorkflow 處理程序數量: ${this.eventHandlers.loadWorkflow.length}`
          // );

          // if (workflowId) {
          //   this.triggerEvent('loadWorkflow', workflowId);
          // }
        } else {
          console.warn('收到 SET_TITLE 消息，但標題為空');
        }
        break;

      case 'REQUEST_DATA_FOR_DOWNLOAD':
        // 日誌顯示下載請求事件
        console.log(
          `準備觸發 downloadRequest 事件，選項:`,
          message.options || {}
        );
        console.log(
          `註冊的 downloadRequest 處理程序數量: ${this.eventHandlers.downloadRequest.length}`
        );

        // 觸發下載請求事件
        this.triggerEvent('downloadRequest', message.options || {});
        break;

      default:
        console.log(`收到未處理的消息類型: ${message.type}`);
        break;
    }
  }

  /**
   * 向父頁面發送消息
   * @param {Object} message - 要發送的消息對象
   */
  sendToParent(message) {
    if (!this.isInIframe) {
      console.warn('無法發送消息：未在 iframe 中運行');
      return false;
    }

    try {
      window.parent.postMessage(message, '*');
      console.log(`已向父頁面發送消息: ${message.type}`, message);
      return true;
    } catch (error) {
      console.error('向父頁面發送消息時出錯:', error);
      return false;
    }
  }

  /**
   * 註冊事件處理程序
   * @param {string} eventType - 事件類型
   * @param {Function} callback - 回調函數
   * @returns {boolean} - 是否成功註冊
   */
  on(eventType, callback) {
    if (!this.eventHandlers[eventType]) {
      console.warn(`未知的事件類型: ${eventType}`);
      return false;
    }

    this.eventHandlers[eventType].push(callback);
    console.log(
      `已註冊 ${eventType} 事件處理程序，當前處理程序數量: ${this.eventHandlers[eventType].length}`
    );
    return true;
  }

  /**
   * 觸發特定事件的所有處理程序
   * @param {string} eventType - 事件類型
   * @param {*} data - 要傳遞給處理程序的數據
   */
  triggerEvent(eventType, data) {
    if (!this.eventHandlers[eventType]) {
      console.warn(`未知的事件類型: ${eventType}`);
      return;
    }

    if (this.eventHandlers[eventType].length === 0) {
      console.warn(`觸發 ${eventType} 事件，但沒有註冊的處理程序`);
      return;
    }

    console.log(
      `正在觸發 ${eventType} 事件，處理程序數量: ${this.eventHandlers[eventType].length}`
    );

    this.eventHandlers[eventType].forEach((handler, index) => {
      try {
        console.log(`執行 ${eventType} 事件處理程序 #${index + 1}`);
        handler(data);
        console.log(`${eventType} 事件處理程序 #${index + 1} 執行成功`);
      } catch (error) {
        console.error(
          `執行 ${eventType} 事件處理程序 #${index + 1} 時出錯:`,
          error
        );
      }
    });
  }

  /**
   * 取消註冊事件處理程序
   * @param {string} eventType - 事件類型
   * @param {Function} callback - 要移除的回調函數
   * @returns {boolean} - 是否成功取消註冊
   */
  off(eventType, callback) {
    if (!this.eventHandlers[eventType]) {
      console.warn(`未知的事件類型: ${eventType}`);
      return false;
    }

    const initialLength = this.eventHandlers[eventType].length;
    this.eventHandlers[eventType] = this.eventHandlers[eventType].filter(
      (handler) => handler !== callback
    );

    const removed = initialLength !== this.eventHandlers[eventType].length;
    if (removed) {
      console.log(
        `已移除 ${eventType} 事件處理程序，當前處理程序數量: ${this.eventHandlers[eventType].length}`
      );
    } else {
      console.warn(`嘗試移除未找到的 ${eventType} 事件處理程序`);
    }

    return removed;
  }

  /**
   * 向父頁面發送JSON數據以進行下載
   * @param {Object} data - 要下載的JSON數據
   * @param {string} filename - 檔案名稱
   * @returns {boolean} - 是否成功發送下載請求
   */
  requestDownload(data, filename) {
    if (!this.isInIframe) {
      console.warn('無法請求下載：未在 iframe 中運行');
      return false;
    }
    // Create a clean, serializable copy of the data
    const serializableData = JSON.parse(JSON.stringify(data));
    try {
      this.sendToParent({
        type: 'DOWNLOAD_JSON',
        data: serializableData,
        filename: filename,
        timestamp: new Date().toISOString()
      });

      console.log('已向父頁面發送下載請求', { filename });
      return true;
    } catch (error) {
      console.error('發送下載請求時出錯:', error);
      return false;
    }
  }
}

// 創建單例實例
const iframeBridge = new IFrameBridgeService();

await importShared('react');
function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  label
}) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });
  const getEdgeStyle = () => {
    const baseStyle = {
      stroke: selected ? "#4299e1" : "#9ca3af",
      // Grey color when not selected
      strokeWidth: selected ? 3 : 2,
      strokeDasharray: "5,5",
      // Dashed line
      transition: "all 0.3s ease"
    };
    return Object.entries(style).reduce((acc, [key, value]) => {
      if (value !== void 0) {
        acc[key] = value;
      }
      return acc;
    }, baseStyle);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      BaseEdge,
      {
        id,
        path: edgePath,
        style: getEdgeStyle(),
        markerEnd
      }
    ),
    label && /* @__PURE__ */ jsxRuntimeExports.jsx(EdgeLabelRenderer, {})
  ] });
}

const React$2 = await importShared('react');
const {useState: useState$2} = React$2;

const LoadWorkflowButton = ({ onLoad }) => {
  const [workflowId, setWorkflowId] = useState$2(
    "8a97a194-0358-4375-ae07-283144197894"
  );
  const [showInput, setShowInput] = useState$2(false);
  const [loadState, setLoadState] = useState$2("");
  const handleClick = () => {
    setShowInput(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workflowId || typeof onLoad !== "function") return;
    try {
      setLoadState("loading");
      await onLoad(workflowId);
      setLoadState("loaded");
      setTimeout(() => {
        setLoadState("");
      }, 2e3);
      setWorkflowId("");
      setShowInput(false);
    } catch (error) {
      console.error("載入工作流失敗:", error);
      setLoadState("error");
      setTimeout(() => {
        setLoadState("");
      }, 2e3);
    }
  };
  const handleCancel = () => {
    setWorkflowId("");
    setShowInput(false);
  };
  const getButtonStyles = () => {
    switch (loadState) {
      case "loading":
        return "bg-[#00ced1] opacity-70 text-white";
      case "loaded":
        return "bg-[#00ced1] text-white";
      case "error":
        return "bg-red-500 text-white";
      default:
        return "bg-[#00ced1] text-white";
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "inline-block bg-white rounded-full shadow-md",
        style: {
          padding: "10px 13px",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `rounded-full text-sm font-medium ${getButtonStyles()}`,
            onClick: handleClick,
            disabled: loadState === "loading",
            title: "載入工作流",
            style: {
              width: "85px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            },
            children: loadState === "loading" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "svg",
                {
                  className: "animate-spin",
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "16",
                  height: "16",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "載入中..." })
            ] }) : loadState === "loaded" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "16",
                  height: "16",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 6L9 17l-5-5" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "已載入" })
            ] }) : loadState === "error" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "16",
                  height: "16",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "circle",
                      {
                        cx: "12",
                        cy: "12",
                        r: "10"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "line",
                      {
                        x1: "12",
                        y1: "8",
                        x2: "12",
                        y2: "12"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "line",
                      {
                        x1: "12",
                        y1: "16",
                        x2: "12.01",
                        y2: "16"
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "錯誤" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "測試用" })
          }
        )
      }
    ),
    showInput && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-full left-0 mt-2 p-3 bg-white rounded-md shadow-lg border border-gray-200 z-20 w-64", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        onSubmit: handleSubmit,
        className: "flex flex-col",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 text-sm text-gray-600", children: "請輸入工作流 ID:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: workflowId,
              onChange: (e) => setWorkflowId(e.target.value),
              className: "border border-gray-300 rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-[#00ced1] focus:border-transparent",
              autoFocus: true,
              placeholder: "例如: 5e9867a0-58b4-4c16-acbb-e194df6efa46"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: handleCancel,
                className: "px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 rounded-md border border-gray-300 hover:bg-gray-50",
                children: "取消"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "submit",
                className: "px-3 py-1.5 text-sm bg-[#00ced1] text-white rounded-md hover:bg-[#00b5b8]",
                children: "載入"
              }
            )
          ] })
        ]
      }
    ) })
  ] });
};

const React$1 = await importShared('react');
const {useEffect: useEffect$1,useState: useState$1} = React$1;

class NotificationService {
  static listeners = [];
  static notify(message, type = "info", duration = 3e3) {
    this.listeners.forEach((listener) => listener(message, type, duration));
  }
  static subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}
if (typeof window !== "undefined") {
  window.notify = (options) => {
    if (typeof options === "string") {
      NotificationService.notify(options);
    } else {
      const { message, type, duration } = options;
      NotificationService.notify(message, type, duration);
    }
  };
}
const Notification = () => {
  const [notifications, setNotifications] = useState$1([]);
  useEffect$1(() => {
    const unsubscribe = NotificationService.subscribe(
      (message, type, duration) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message, type, duration }]);
        setTimeout(() => {
          setNotifications(
            (prev) => prev.filter((notification) => notification.id !== id)
          );
        }, duration);
      }
    );
    return () => unsubscribe();
  }, []);
  if (notifications.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed top-4 right-4 z-50 flex flex-col gap-2", children: notifications.map((notification) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `px-4 py-2 rounded-md shadow-md text-white transition-all duration-300 max-w-sm ${notification.type === "error" ? "bg-red-500" : notification.type === "success" ? "bg-green-500" : notification.type === "warning" ? "bg-yellow-500" : "bg-blue-500"}`,
      children: notification.message
    },
    notification.id
  )) });
};

const React = await importShared('react');
const {useState,useEffect,useCallback,useRef,useMemo,forwardRef,useImperativeHandle} = React;
const ReactFlowWithControls = forwardRef(
  ({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodesDelete,
    nodeTypes,
    edgeTypes,
    defaultViewport,
    onSelectionChange,
    onInit,
    onDrop,
    onDragOver,
    sidebarVisible
    // 添加sidebar狀態參數
  }, ref) => {
    const reactFlowInstance = useReactFlow();
    const fitViewToNodes = useCallback(
      (padding = 0.1, maxZoom = 1.85, duration = 800) => {
        if (!reactFlowInstance) {
          console.warn("ReactFlow 實例尚未初始化，無法自動縮放畫布");
          return;
        }
        console.log("自動縮放畫布以顯示所有節點...");
        try {
          reactFlowInstance.fitView({
            padding,
            // 邊緣留白，值越大顯示的節點佔比越小
            maxZoom,
            // 限制最大縮放，防止縮放過大
            duration,
            // 動畫持續時間（毫秒）
            includeHiddenNodes: false
            // 不包含隱藏節點
          });
          console.log("畫布縮放完成");
        } catch (error) {
          console.error("自動縮放畫布時發生錯誤：", error);
        }
      },
      [reactFlowInstance]
    );
    useImperativeHandle(ref, () => ({
      fitViewToNodes
    }));
    const controlsStyle = useMemo(() => {
      return {
        left: sidebarVisible ? "17rem" : "10px",
        // 如果sidebar顯示，將controls向右移動
        transition: "left 0.3s ease"
        // 添加過渡效果使移動更平滑
      };
    }, [sidebarVisible]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      ReactFlow,
      {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onNodesDelete,
        nodeTypes,
        edgeTypes,
        defaultViewport,
        onSelectionChange,
        deleteKeyCode: ["Backspace", "Delete"],
        onInit,
        onDrop,
        onDragOver,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MiniMap$1, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Controls$1, { style: controlsStyle }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Background$1, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { position: "bottom-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "bg-white p-2 rounded-md shadow-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300",
              onClick: () => fitViewToNodes(0.1),
              title: "縮放視圖以顯示所有節點",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "20",
                  height: "20",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15 3h6v6" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M9 21H3v-6" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 3l-7 7" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 21l7-7" })
                  ]
                }
              )
            }
          ) })
        ]
      }
    ) });
  }
);
const FlowEditor = forwardRef(({ initialTitle, onTitleChange }, ref) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const reactFlowControlsRef = useRef(null);
  const isInitialized = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const nodeTypes = useMemo(() => enhancedNodeTypes, []);
  const edgeTypes = useMemo(() => ({ "custom-edge": CustomEdge }), []);
  const defaultViewport = useMemo(() => ({ x: 0, y: 0, zoom: 1.3 }), []);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodesDelete,
    handleAddNode,
    handleAddInputNode,
    handleAddAINode,
    handleAddBrowserExtensionOutput,
    handleAddBrowserExtensionInput,
    updateNodeFunctions,
    handleAddIfElseNode,
    handleAddKnowledgeRetrievalNode,
    handleAddEndNode,
    handleAddWebhookNode,
    handleAddHTTPNode,
    handleAddEventNode,
    handleAddTimerNode,
    handleAddLineNode,
    handleNodeSelection,
    setNodes: setFlowNodes,
    setEdges: setFlowEdges
  } = useFlowNodes();
  const [flowMetadata, setFlowMetadata] = useState({
    id: null,
    title: initialTitle || "",
    lastSaved: null,
    version: 1
  });
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "info"
  });
  const isInIframe = useMemo(() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }, []);
  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev);
  }, []);
  const handleLoadWorkflow = useCallback(async (flowId) => {
    try {
      const success = await loadWorkflowImpl(flowId);
      return success;
    } catch (error) {
      console.error("無法載入工作流:", error);
      showNotification("載入工作流失敗", "error");
      return false;
    }
  }, []);
  const loadWorkflowImpl = async (flowId) => {
    if (flowId !== "new") {
      try {
        const apiData = await workflowAPIService.loadWorkflow(flowId);
        const { nodes: transformedNodes, edges: transformedEdges } = WorkflowDataConverter.transformToReactFlowFormat(apiData);
        setFlowNodes(transformedNodes);
        setFlowEdges(transformedEdges);
        debugBrowserExtensionOutput(transformedNodes, transformedEdges);
        setFlowMetadata((prev) => ({
          ...prev,
          id: apiData.flow_id,
          title: apiData.flow_name || prev.flow_name,
          version: apiData.version || prev.version
        }));
        console.log("載入工作流後立即更新節點函數...");
        updateNodeFunctions();
        setTimeout(() => {
          console.log("載入工作流後再次確認節點函數...");
          updateNodeFunctions();
          if (reactFlowControlsRef.current && reactFlowControlsRef.current.fitViewToNodes) {
            console.log("載入工作流後，執行一次畫布縮放以顯示所有節點...");
            reactFlowControlsRef.current.fitViewToNodes(0.1, 1.85, 800);
          }
        }, 300);
        showNotification("工作流載入成功", "success");
        return true;
      } catch (error) {
        console.error("載入工作流失敗:", error);
        showNotification("載入工作流失敗", "error");
        return false;
      }
    }
  };
  useImperativeHandle(ref, () => ({
    // 導出流程數據的方法
    exportFlowData: () => {
      return {
        id: flowMetadata.id || `flow_${Date.now()}`,
        title: flowMetadata.title || "未命名流程",
        version: flowMetadata.version || 1,
        nodes,
        edges,
        metadata: {
          lastModified: (/* @__PURE__ */ new Date()).toISOString(),
          savedAt: (/* @__PURE__ */ new Date()).toISOString(),
          nodeCount: nodes.length,
          edgeCount: edges.length
        }
      };
    },
    // 設置流程標題的方法
    setFlowTitle: (title) => {
      if (title && typeof title === "string") {
        setFlowMetadata((prev) => ({ ...prev, title }));
        return true;
      }
      return false;
    },
    setFlowId: (flowId) => {
      if (flowId && typeof flowId === "string") {
        setFlowMetadata((prev) => ({ ...prev, flowId }));
        return true;
      }
      return false;
    },
    loadWorkflow: loadWorkflowImpl,
    // 暴露 fitViewToNodes 方法給父組件
    fitViewToNodes: () => {
      if (reactFlowControlsRef.current && reactFlowControlsRef.current.fitViewToNodes) {
        reactFlowControlsRef.current.fitViewToNodes();
      }
    }
  }));
  useEffect(() => {
    if (!isInitialized.current) {
      if (updateNodeFunctions) {
        updateNodeFunctions();
      }
      isInitialized.current = true;
    }
  }, [updateNodeFunctions]);
  const handleTitleChange = useCallback(
    (title) => {
      setFlowMetadata((prev) => ({ ...prev, title }));
      if (onTitleChange && typeof onTitleChange === "function") {
        onTitleChange(title);
      }
    },
    [onTitleChange]
  );
  const showNotification = useCallback((message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "info" });
    }, 3e3);
  }, []);
  const handleNodeTypeSelection = useCallback(
    (nodeType, position = null) => {
      const defaultPosition = {
        x: Math.random() * 400,
        y: Math.random() * 400
      };
      const nodePosition = position || defaultPosition;
      switch (nodeType) {
        case "input":
          handleAddInputNode(nodePosition);
          break;
        case "ai":
          handleAddAINode(nodePosition);
          break;
        case "if/else":
          handleAddIfElseNode(nodePosition);
          break;
        case "browser extension input":
          handleAddBrowserExtensionInput(nodePosition);
          break;
        case "browser extension output":
          handleAddBrowserExtensionOutput(nodePosition);
          break;
        case "knowledge retrieval":
          handleAddKnowledgeRetrievalNode(nodePosition);
          break;
        case "end":
          handleAddEndNode(nodePosition);
          break;
        case "webhook":
          handleAddWebhookNode(nodePosition);
          break;
        case "http":
          handleAddHTTPNode(nodePosition);
          break;
        case "event":
          handleAddEventNode(nodePosition);
          break;
        case "timer":
          handleAddTimerNode(nodePosition);
          break;
        case "line":
          handleAddLineNode(nodePosition);
          break;
        default:
          handleAddNode(nodePosition);
      }
    },
    [
      handleAddInputNode,
      handleAddAINode,
      handleAddIfElseNode,
      handleAddBrowserExtensionInput,
      handleAddBrowserExtensionOutput,
      handleAddKnowledgeRetrievalNode,
      handleAddEndNode,
      handleAddWebhookNode,
      handleAddHTTPNode,
      handleAddEventNode,
      handleAddTimerNode,
      handleAddLineNode,
      handleAddNode
    ]
  );
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (reactFlowWrapper.current) {
      reactFlowWrapper.current.classList.add("drag-over");
    }
  }, []);
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (!reactFlowInstance) return;
      const type = event.dataTransfer.getData("application/reactflow");
      if (typeof type === "undefined" || !type) {
        return;
      }
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      });
      handleNodeTypeSelection(type, position);
      if (reactFlowWrapper.current) {
        reactFlowWrapper.current.classList.remove("drag-over");
      }
    },
    [reactFlowInstance, handleNodeTypeSelection]
  );
  const onDragStart = useCallback((event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  }, []);
  const saveToLocalFile = useCallback(async () => {
    try {
      const flowData = {
        id: flowMetadata.id || `flow_${Date.now()}`,
        title: flowMetadata.title || "未命名流程",
        version: flowMetadata.version || 1,
        nodes,
        edges,
        metadata: {
          lastModified: (/* @__PURE__ */ new Date()).toISOString(),
          savedAt: (/* @__PURE__ */ new Date()).toISOString(),
          nodeCount: nodes.length,
          edgeCount: edges.length
        }
      };
      const date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const safeTitle = (flowMetadata.title || "未命名_流程").replace(
        /\s+/g,
        "_"
      );
      const filename = `${safeTitle}_${date}.json`;
      const result = await FileIOService.saveToFile(flowData, filename);
      if (result.success) {
        console.log(`檔案已儲存為：${result.filename}`);
        showNotification(`已儲存到 ${result.filename}`, "success");
        setFlowMetadata({
          ...flowMetadata,
          title: flowMetadata.title || "未命名流程",
          lastSaved: (/* @__PURE__ */ new Date()).toISOString(),
          version: (flowMetadata.version || 0) + 1
        });
      }
      return result;
    } catch (error) {
      console.error("儲存檔案時發生錯誤：", error);
      showNotification("無法儲存檔案", "error");
      throw error;
    }
  }, [nodes, edges, flowMetadata, showNotification]);
  useCallback(async () => {
    if (!isInIframe) {
      return saveToLocalFile();
    }
    try {
      const flowData = {
        id: flowMetadata.id || `flow_${Date.now()}`,
        title: flowMetadata.title || "未命名流程",
        version: flowMetadata.version || 1,
        nodes,
        edges,
        metadata: {
          lastModified: (/* @__PURE__ */ new Date()).toISOString(),
          savedAt: (/* @__PURE__ */ new Date()).toISOString(),
          nodeCount: nodes.length,
          edgeCount: edges.length
        }
      };
      const date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const safeTitle = (flowMetadata.title || "未命名_流程").replace(
        /\s+/g,
        "_"
      );
      const filename = `${safeTitle}_${date}.json`;
      const result = iframeBridge.requestDownload(flowData, filename);
      if (result) {
        showNotification("已發送下載請求", "success");
      } else {
        showNotification("發送下載請求失敗", "error");
      }
      return { success: result };
    } catch (error) {
      console.error("準備下載數據時發生錯誤：", error);
      showNotification("發送下載請求失敗", "error");
      throw error;
    }
  }, [
    nodes,
    edges,
    flowMetadata,
    isInIframe,
    saveToLocalFile,
    showNotification
  ]);
  const saveToServer = useCallback(async () => {
    setIsSaving(true);
    try {
      debugConnections(edges, "保存前");
      const flowData = {
        id: flowMetadata.id || `flow_${Date.now()}`,
        title: flowMetadata.title || "未命名流程",
        version: flowMetadata.version || 1,
        nodes,
        edges,
        metadata: {
          lastModified: (/* @__PURE__ */ new Date()).toISOString(),
          savedAt: (/* @__PURE__ */ new Date()).toISOString(),
          nodeCount: nodes.length,
          edgeCount: edges.length
        }
      };
      const apiData = WorkflowDataConverter.convertReactFlowToAPI(flowData);
      debugAINodeConnections(nodes, edges);
      debugAINodeAPIData(apiData);
      if (apiData && apiData.flow_pipeline) {
        debugNodeInputsBeforeSave(apiData.flow_pipeline);
      }
      console.log("FlowEditor: 將流程數據轉換為 API 格式:", apiData);
      let response;
      let flowIdToUse = flowMetadata.id || null;
      if (flowMetadata.id) {
        response = await workflowAPIService.updateWorkflow(apiData);
        console.log("FlowEditor: 更新流程成功", response);
        showNotification("流程更新成功", "success");
        setFlowMetadata((prev) => ({
          ...prev,
          lastSaved: (/* @__PURE__ */ new Date()).toISOString()
        }));
      } else {
        response = await workflowAPIService.createWorkflow(apiData);
        console.log("FlowEditor: 創建流程成功", response);
        flowIdToUse = response?.flow_id;
        if (flowIdToUse) {
          setFlowMetadata((prev) => ({
            ...prev,
            id: flowIdToUse,
            lastSaved: (/* @__PURE__ */ new Date()).toISOString()
          }));
        }
        const isInIframe2 = window.self !== window.top;
        if (isInIframe2) {
          console.log("在 iframe 中檢測到新創建的流程，發送事件到父窗口");
          try {
            iframeBridge.sendToParent({
              type: "FLOW_SAVED",
              flowId: flowIdToUse,
              success: true,
              title: flowMetadata.title || "未命名流程",
              isNewFlow: true,
              currentPath: window.location.pathname,
              isNewPath: window.location.pathname.includes("/new"),
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            });
          } catch (error) {
            console.error("向父頁面發送事件失敗：", error);
          }
        }
        showNotification("流程創建成功", "success");
      }
      if (flowIdToUse) {
        setTimeout(async () => {
          console.log("使用 flow_id 重新加載工作流:", flowIdToUse);
          await handleLoadWorkflow(flowIdToUse);
          debugConnections(edges, "保存後重新加載");
          debugAINodeConnections(nodes, edges);
        }, 1e3);
      } else {
        console.warn("沒有可用的 flow_id，無法重新加載工作流");
      }
      return response;
    } catch (error) {
      console.error("FlowEditor: 儲存流程時發生錯誤：", error);
      showNotification("儲存流程時發生錯誤", "error");
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, flowMetadata, showNotification, handleLoadWorkflow]);
  useCallback(async () => {
    try {
      const result = await FileIOService.readFromFile();
      if (result.success && result.data) {
        console.log("檔案已載入：", result.filename);
        showNotification(`已載入 ${result.filename}`, "success");
        if (!result.data.nodes || !result.data.edges) {
          throw new Error("無效的流程檔案格式");
        }
        setFlowNodes(result.data.nodes);
        setFlowEdges(result.data.edges);
        setFlowMetadata({
          id: result.data.id || `flow_${Date.now()}`,
          title: result.data.title || "匯入的流程",
          lastSaved: result.data.metadata?.savedAt || (/* @__PURE__ */ new Date()).toISOString(),
          version: result.data.version || 1
        });
        updateNodeFunctions();
        if (isInIframe && onTitleChange) {
          onTitleChange(result.data.title || "匯入的流程");
        }
        setTimeout(() => {
          if (reactFlowControlsRef.current && reactFlowControlsRef.current.fitViewToNodes) {
            reactFlowControlsRef.current.fitViewToNodes();
          }
        }, 300);
      }
      return result;
    } catch (error) {
      console.error("載入檔案時發生錯誤：", error);
      showNotification("無法載入檔案", "error");
      throw error;
    }
  }, [
    setFlowNodes,
    setFlowEdges,
    showNotification,
    updateNodeFunctions,
    isInIframe,
    onTitleChange
  ]);
  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }) => {
      if (selectedNodes && selectedNodes.length > 0) {
        handleNodeSelection(selectedNodes[0].id);
      }
    },
    [handleNodeSelection]
  );
  useEffect(() => {
    if (initialTitle) {
      setFlowMetadata((prev) => {
        if (prev.title !== initialTitle) {
          return { ...prev, title: initialTitle };
        }
        return prev;
      });
    }
  }, [initialTitle]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-screen", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      APAAssistant,
      {
        title: flowMetadata.title,
        onTitleChange: handleTitleChange
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Notification, {}),
    notification.show && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `absolute top-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-md z-20 text-sm ${notification.type === "error" ? "bg-red-100 text-red-700 border border-red-200" : notification.type === "success" ? "bg-green-100 text-green-700 border border-green-200" : "bg-blue-100 text-blue-700 border border-blue-200"}`,
        children: notification.message
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ReactFlowProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "w-full h-full",
        ref: reactFlowWrapper,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          ReactFlowWithControls,
          {
            ref: reactFlowControlsRef,
            nodes,
            edges,
            onNodesChange,
            onEdgesChange,
            onConnect,
            onNodesDelete,
            nodeTypes,
            edgeTypes,
            defaultViewport,
            onSelectionChange: handleSelectionChange,
            onInit: setReactFlowInstance,
            onDrop,
            onDragOver,
            sidebarVisible
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `absolute top-0 left-0 h-full transition-transform duration-300 transform ${sidebarVisible ? "translate-x-0" : "-translate-x-full"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            NodeSidebar,
            {
              handleButtonClick: handleNodeTypeSelection,
              onDragStart
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "absolute top-1/2 -right-6 bg-white border border-gray-300 rounded-r-md p-1 shadow-md",
              onClick: toggleSidebar,
              children: sidebarVisible ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "16",
                  height: "16",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "15 18 9 12 15 6" })
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "16",
                  height: "16",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "9 18 15 12 9 6" })
                }
              )
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-4 right-4 z-10 flex flex-col items-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex space-x-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadWorkflowButton, { onLoad: handleLoadWorkflow }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-px bg-gray-300 self-center" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          SaveButton,
          {
            onSave: saveToServer,
            title: flowMetadata.title,
            flowId: flowMetadata.id,
            disabled: isSaving
          }
        ) })
      ] }),
      flowMetadata.lastSaved && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 bg-white px-3 py-1 rounded-md shadow text-xs text-gray-500 z-10", children: [
        "Last saved: ",
        new Date(flowMetadata.lastSaved).toLocaleTimeString(),
        " ",
        "| Version: ",
        flowMetadata.version
      ] })
    ] })
  ] });
});
FlowEditor.displayName = "FlowEditor";
const debugConnections = (edges, message) => {
  console.group(`调试连接 - ${message}`);
  const edgesByTarget = {};
  edges.forEach((edge) => {
    if (!edgesByTarget[edge.target]) {
      edgesByTarget[edge.target] = [];
    }
    edgesByTarget[edge.target].push(edge);
  });
  Object.entries(edgesByTarget).forEach(([targetId, targetEdges]) => {
    console.log(`节点 ${targetId} 的输入连接 (${targetEdges.length}):`);
    const byHandle = {};
    targetEdges.forEach((edge) => {
      const handle = edge.targetHandle || "input";
      if (!byHandle[handle]) {
        byHandle[handle] = [];
      }
      byHandle[handle].push(edge);
    });
    Object.entries(byHandle).forEach(([handle, handleEdges]) => {
      console.log(`  句柄 ${handle}: ${handleEdges.length} 个连接`);
      handleEdges.forEach((edge) => {
        console.log(
          `    来源: ${edge.source}, 句柄: ${edge.sourceHandle || "output"}`
        );
      });
    });
  });
  console.groupEnd();
};
const debugBrowserExtensionOutput = (nodes, edges) => {
  console.group("瀏覽器擴展輸出節點調試");
  const outputNodes = nodes.filter(
    (node) => node.type === "browserExtensionOutput"
  );
  console.log(`找到 ${outputNodes.length} 個瀏覽器擴展輸出節點`);
  outputNodes.forEach((node) => {
    console.group(`節點: ${node.id}`);
    const nodeEdges = edges.filter((edge) => edge.target === node.id);
    console.log(`找到 ${nodeEdges.length} 個連接到該節點的邊緣`);
    nodeEdges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      console.log(`連接 ${edge.id}:`, {
        source: edge.source,
        sourceType: sourceNode?.type,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        returnName: edge.label || "(未設置)",
        sourceNodeData: sourceNode?.data ? Object.keys(sourceNode.data) : "(無數據)"
      });
      if (sourceNode) {
        if (sourceNode.type === "customInput" && sourceNode.data?.fields) {
          const outputIndex = edge.sourceHandle ? parseInt(edge.sourceHandle.split("-")[1] || 0) : 0;
          const field = sourceNode.data.fields[outputIndex];
          console.log(`源節點 ${sourceNode.id} 的欄位 ${outputIndex}:`, {
            inputName: field?.inputName,
            defaultValue: field?.defaultValue
          });
        } else if (sourceNode.type === "browserExtensionInput" && sourceNode.data?.items) {
          const outputIndex = edge.sourceHandle ? parseInt(edge.sourceHandle.split("-")[1] || 0) : 0;
          const item = sourceNode.data.items[outputIndex];
          console.log(`源節點 ${sourceNode.id} 的項目 ${outputIndex}:`, {
            name: item?.name,
            icon: item?.icon
          });
        }
      }
    });
    console.groupEnd();
  });
  console.groupEnd();
};
const debugAINodeConnections = (nodes, edges) => {
  console.group("AI節點連線調試");
  const aiNodes = nodes.filter(
    (node) => node.type === "aiCustomInput" || node.type === "ai"
  );
  console.log(`找到 ${aiNodes.length} 個 AI 節點`);
  aiNodes.forEach((node) => {
    console.group(`節點: ${node.id}`);
    const nodeEdges = edges.filter((edge) => edge.target === node.id);
    console.log(`找到 ${nodeEdges.length} 個連接到該節點的邊緣`);
    const promptEdges = nodeEdges.filter(
      (edge) => edge.targetHandle === "prompt-input"
    );
    const contextEdges = nodeEdges.filter(
      (edge) => edge.targetHandle.includes("context-input") || edge.targetHandle.startsWith("context_")
    );
    console.log(`Prompt 連線: ${promptEdges.length}`);
    console.log(`Context 連線: ${contextEdges.length}`);
    contextEdges.forEach((edge, index) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      console.log(`Context 連線 ${index + 1}:`, {
        source: edge.source,
        sourceType: sourceNode?.type,
        sourceHandle: edge.sourceHandle,
        label: edge.label,
        sourceData: sourceNode?.data?.length || Object.keys(sourceNode?.data || {}).length
      });
    });
    console.groupEnd();
  });
  console.groupEnd();
};
const debugAINodeAPIData = (apiData) => {
  console.group("AI節點 API 數據調試");
  if (apiData.flow_pipeline) {
    const aiNodes = apiData.flow_pipeline.filter(
      (node) => node.operator === "ask_ai"
    );
    console.log(`找到 ${aiNodes.length} 個 AI 節點`);
    aiNodes.forEach((node) => {
      console.group(`節點 ${node.id}`);
      if (node.node_input) {
        const contextInputs = Object.keys(node.node_input).filter(
          (key) => key.includes("context-input") || key.startsWith("context_")
        );
        console.log(`Context 輸入數量: ${contextInputs.length}`);
        contextInputs.forEach((key) => {
          const input = node.node_input[key];
          console.log(`輸入 ${key}:`, {
            node_id: input.node_id,
            output_name: input.output_name,
            return_name: input.return_name
          });
        });
        if (node.node_input["prompt-input"]) {
          const promptInput = node.node_input["prompt-input"];
          console.log("Prompt 輸入:", {
            node_id: promptInput.node_id,
            output_name: promptInput.output_name,
            return_name: promptInput.return_name
          });
        }
      }
      console.groupEnd();
    });
  }
  console.groupEnd();
};
if (typeof window !== "undefined") {
  window.debugAINodeConnections = debugAINodeConnections;
  window.debugAINodeAPIData = debugAINodeAPIData;
}
const debugNodeInputsBeforeSave = (flowPipeline) => {
  console.group("保存前節點輸入調試");
  flowPipeline.forEach((node) => {
    if (node.operator === "browser_extension_output" && node.node_input) {
      console.group(`節點 ${node.id} (${node.operator}) 的輸入:`);
      Object.entries(node.node_input).forEach(([key, input]) => {
        console.log(`輸入 ${key}:`, {
          node_id: input.node_id,
          output_name: input.output_name,
          type: input.type,
          return_name: input.return_name || "(未設置)"
        });
      });
      console.groupEnd();
    }
  });
  console.groupEnd();
};

export { FlowEditor as default, iframeBridge as i, jsxRuntimeExports as j };
