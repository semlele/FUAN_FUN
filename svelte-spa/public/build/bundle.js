
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root.host) {
            return root;
        }
        return document;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function parse$1(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.42.2 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (251:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(251:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (244:0) {#if componentParams}
    function create_if_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(244:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse$1(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.__svelte_spa_router_scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.__svelte_spa_router_scrollX, previousScrollState.__svelte_spa_router_scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse: parse$1,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var icon = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fullIcon = exports.iconDefaults = exports.minifyProps = exports.matchName = void 0;
    /**
     * Expression to test part of icon name.
     */
    exports.matchName = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    /**
     * Properties that can be minified
     *
     * Values of all these properties are awalys numbers
     */
    exports.minifyProps = [
        // All IconifyDimenisons properties
        'width',
        'height',
        'top',
        'left',
    ];
    /**
     * Default values for all optional IconifyIcon properties
     */
    exports.iconDefaults = Object.freeze({
        left: 0,
        top: 0,
        width: 16,
        height: 16,
        rotate: 0,
        vFlip: false,
        hFlip: false,
    });
    /**
     * Add optional properties to icon
     */
    function fullIcon(data) {
        return { ...exports.iconDefaults, ...data };
    }
    exports.fullIcon = fullIcon;
    });

    var name = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateIcon = exports.stringToIcon = void 0;

    /**
     * Convert string to Icon object.
     */
    const stringToIcon = (value, validate, allowSimpleName, provider = '') => {
        const colonSeparated = value.split(':');
        // Check for provider with correct '@' at start
        if (value.slice(0, 1) === '@') {
            // First part is provider
            if (colonSeparated.length < 2 || colonSeparated.length > 3) {
                // "@provider:prefix:name" or "@provider:prefix-name"
                return null;
            }
            provider = colonSeparated.shift().slice(1);
        }
        // Check split by colon: "prefix:name", "provider:prefix:name"
        if (colonSeparated.length > 3 || !colonSeparated.length) {
            return null;
        }
        if (colonSeparated.length > 1) {
            // "prefix:name"
            const name = colonSeparated.pop();
            const prefix = colonSeparated.pop();
            const result = {
                // Allow provider without '@': "provider:prefix:name"
                provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
                prefix,
                name,
            };
            return validate && !exports.validateIcon(result) ? null : result;
        }
        // Attempt to split by dash: "prefix-name"
        const name = colonSeparated[0];
        const dashSeparated = name.split('-');
        if (dashSeparated.length > 1) {
            const result = {
                provider: provider,
                prefix: dashSeparated.shift(),
                name: dashSeparated.join('-'),
            };
            return validate && !exports.validateIcon(result) ? null : result;
        }
        // If allowEmpty is set, allow empty provider and prefix, allowing names like "home"
        if (allowSimpleName && provider === '') {
            const result = {
                provider: provider,
                prefix: '',
                name,
            };
            return validate && !exports.validateIcon(result, allowSimpleName)
                ? null
                : result;
        }
        return null;
    };
    exports.stringToIcon = stringToIcon;
    /**
     * Check if icon is valid.
     *
     * This function is not part of stringToIcon because validation is not needed for most code.
     */
    const validateIcon = (icon$1, allowSimpleName) => {
        if (!icon$1) {
            return false;
        }
        return !!((icon$1.provider === '' || icon$1.provider.match(icon.matchName)) &&
            ((allowSimpleName && icon$1.prefix === '') ||
                icon$1.prefix.match(icon.matchName)) &&
            icon$1.name.match(icon.matchName));
    };
    exports.validateIcon = validateIcon;
    });

    var merge = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergeIconData = void 0;

    /**
     * Merge icon and alias
     */
    function mergeIconData(icon$1, alias) {
        const result = { ...icon$1 };
        for (const key in icon.iconDefaults) {
            const prop = key;
            if (alias[prop] !== void 0) {
                const value = alias[prop];
                if (result[prop] === void 0) {
                    // Missing value
                    result[prop] = value;
                    continue;
                }
                switch (prop) {
                    case 'rotate':
                        result[prop] =
                            (result[prop] + value) % 4;
                        break;
                    case 'hFlip':
                    case 'vFlip':
                        result[prop] = value !== result[prop];
                        break;
                    default:
                        // Overwrite value
                        result[prop] =
                            value;
                }
            }
        }
        return result;
    }
    exports.mergeIconData = mergeIconData;
    });

    var parse = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseIconSet = void 0;


    /**
     * Get list of defaults keys
     */
    const defaultsKeys = Object.keys(icon.iconDefaults);
    /**
     * Resolve alias
     */
    function resolveAlias(alias, icons, aliases, level = 0) {
        const parent = alias.parent;
        if (icons[parent] !== void 0) {
            return merge.mergeIconData(icons[parent], alias);
        }
        if (aliases[parent] !== void 0) {
            if (level > 2) {
                // icon + alias + alias + alias = too much nesting, possibly infinite
                return null;
            }
            const icon = resolveAlias(aliases[parent], icons, aliases, level + 1);
            if (icon) {
                return merge.mergeIconData(icon, alias);
            }
        }
        return null;
    }
    /**
     * Extract icons from an icon set
     */
    function parseIconSet(data, callback, list = 'none') {
        const added = [];
        // Must be an object
        if (typeof data !== 'object') {
            return list === 'none' ? false : added;
        }
        // Check for missing icons list returned by API
        if (data.not_found instanceof Array) {
            data.not_found.forEach((name) => {
                callback(name, null);
                if (list === 'all') {
                    added.push(name);
                }
            });
        }
        // Must have 'icons' object
        if (typeof data.icons !== 'object') {
            return list === 'none' ? false : added;
        }
        // Get default values
        const defaults = Object.create(null);
        defaultsKeys.forEach((key) => {
            if (data[key] !== void 0 && typeof data[key] !== 'object') {
                defaults[key] = data[key];
            }
        });
        // Get icons
        const icons = data.icons;
        Object.keys(icons).forEach((name) => {
            const icon$1 = icons[name];
            if (typeof icon$1.body !== 'string') {
                return;
            }
            // Freeze icon to make sure it will not be modified
            callback(name, Object.freeze({ ...icon.iconDefaults, ...defaults, ...icon$1 }));
            added.push(name);
        });
        // Get aliases
        if (typeof data.aliases === 'object') {
            const aliases = data.aliases;
            Object.keys(aliases).forEach((name) => {
                const icon$1 = resolveAlias(aliases[name], icons, aliases, 1);
                if (icon$1) {
                    // Freeze icon to make sure it will not be modified
                    callback(name, Object.freeze({ ...icon.iconDefaults, ...defaults, ...icon$1 }));
                    added.push(name);
                }
            });
        }
        return list === 'none' ? added.length > 0 : added;
    }
    exports.parseIconSet = parseIconSet;
    });

    var storage_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.listIcons = exports.getIcon = exports.iconExists = exports.addIcon = exports.addIconSet = exports.getStorage = exports.newStorage = void 0;


    /**
     * Storage by provider and prefix
     */
    const storage = Object.create(null);
    /**
     * Create new storage
     */
    function newStorage(provider, prefix) {
        return {
            provider,
            prefix,
            icons: Object.create(null),
            missing: Object.create(null),
        };
    }
    exports.newStorage = newStorage;
    /**
     * Get storage for provider and prefix
     */
    function getStorage(provider, prefix) {
        if (storage[provider] === void 0) {
            storage[provider] = Object.create(null);
        }
        const providerStorage = storage[provider];
        if (providerStorage[prefix] === void 0) {
            providerStorage[prefix] = newStorage(provider, prefix);
        }
        return providerStorage[prefix];
    }
    exports.getStorage = getStorage;
    /**
     * Add icon set to storage
     *
     * Returns array of added icons if 'list' is true and icons were added successfully
     */
    function addIconSet(storage, data, list = 'none') {
        const t = Date.now();
        return parse.parseIconSet(data, (name, icon) => {
            if (icon === null) {
                storage.missing[name] = t;
            }
            else {
                storage.icons[name] = icon;
            }
        }, list);
    }
    exports.addIconSet = addIconSet;
    /**
     * Add icon to storage
     */
    function addIcon(storage, name, icon$1) {
        try {
            if (typeof icon$1.body === 'string') {
                // Freeze icon to make sure it will not be modified
                storage.icons[name] = Object.freeze(icon.fullIcon(icon$1));
                return true;
            }
        }
        catch (err) {
            // Do nothing
        }
        return false;
    }
    exports.addIcon = addIcon;
    /**
     * Check if icon exists
     */
    function iconExists(storage, name) {
        return storage.icons[name] !== void 0;
    }
    exports.iconExists = iconExists;
    /**
     * Get icon data
     */
    function getIcon(storage, name) {
        const value = storage.icons[name];
        return value === void 0 ? null : value;
    }
    exports.getIcon = getIcon;
    /**
     * List available icons
     */
    function listIcons(provider, prefix) {
        let allIcons = [];
        // Get providers
        let providers;
        if (typeof provider === 'string') {
            providers = [provider];
        }
        else {
            providers = Object.keys(storage);
        }
        // Get all icons
        providers.forEach((provider) => {
            let prefixes;
            if (typeof provider === 'string' && typeof prefix === 'string') {
                prefixes = [prefix];
            }
            else {
                prefixes =
                    storage[provider] === void 0
                        ? []
                        : Object.keys(storage[provider]);
            }
            prefixes.forEach((prefix) => {
                const storage = getStorage(provider, prefix);
                const icons = Object.keys(storage.icons).map((name) => (provider !== '' ? '@' + provider + ':' : '') +
                    prefix +
                    ':' +
                    name);
                allIcons = allIcons.concat(icons);
            });
        });
        return allIcons;
    }
    exports.listIcons = listIcons;
    });

    var functions$3 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.storageFunctions = exports.addCollection = exports.addIcon = exports.getIconData = exports.allowSimpleNames = void 0;



    /**
     * Allow storing icons without provider or prefix, making it possible to store icons like "home"
     */
    let simpleNames = false;
    function allowSimpleNames(allow) {
        if (typeof allow === 'boolean') {
            simpleNames = allow;
        }
        return simpleNames;
    }
    exports.allowSimpleNames = allowSimpleNames;
    /**
     * Get icon data
     */
    function getIconData(name$1) {
        const icon = typeof name$1 === 'string' ? name.stringToIcon(name$1, true, simpleNames) : name$1;
        return icon
            ? storage_1.getIcon(storage_1.getStorage(icon.provider, icon.prefix), icon.name)
            : null;
    }
    exports.getIconData = getIconData;
    /**
     * Add one icon
     */
    function addIcon(name$1, data) {
        const icon = name.stringToIcon(name$1, true, simpleNames);
        if (!icon) {
            return false;
        }
        const storage = storage_1.getStorage(icon.provider, icon.prefix);
        return storage_1.addIcon(storage, icon.name, data);
    }
    exports.addIcon = addIcon;
    /**
     * Add icon set
     */
    function addCollection(data, provider) {
        if (typeof data !== 'object') {
            return false;
        }
        // Get provider
        if (typeof provider !== 'string') {
            provider = typeof data.provider === 'string' ? data.provider : '';
        }
        // Check for simple names: requires empty provider and prefix
        if (simpleNames &&
            provider === '' &&
            (typeof data.prefix !== 'string' || data.prefix === '')) {
            // Simple names: add icons one by one
            let added = false;
            parse.parseIconSet(data, (name, icon) => {
                if (icon !== null && addIcon(name, icon)) {
                    added = true;
                }
            });
            return added;
        }
        // Validate provider and prefix
        if (typeof data.prefix !== 'string' ||
            !name.validateIcon({
                provider,
                prefix: data.prefix,
                name: 'a',
            })) {
            return false;
        }
        const storage = storage_1.getStorage(provider, data.prefix);
        return !!storage_1.addIconSet(storage, data);
    }
    exports.addCollection = addCollection;
    /**
     * Export
     */
    exports.storageFunctions = {
        // Check if icon exists
        iconExists: (name) => getIconData(name) !== null,
        // Get raw icon data
        getIcon: (name) => {
            const result = getIconData(name);
            return result ? { ...result } : null;
        },
        // List icons
        listIcons: storage_1.listIcons,
        // Add icon
        addIcon,
        // Add icon set
        addCollection,
    };
    });

    var id = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.replaceIDs = void 0;
    /**
     * Regular expression for finding ids
     */
    const regex = /\sid="(\S+)"/g;
    /**
     * Match for allowed characters before and after id in replacement, including () for group
     */
    const replaceValue = '([^A-Za-z0-9_-])';
    /**
     * Escape value for 'new RegExp()'
     */
    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
    /**
     * New random-ish prefix for ids
     */
    const randomPrefix = 'IconifyId-' +
        Date.now().toString(16) +
        '-' +
        ((Math.random() * 0x1000000) | 0).toString(16) +
        '-';
    /**
     * Counter for ids, increasing with every replacement
     */
    let counter = 0;
    /**
     * Replace IDs in SVG output with unique IDs
     * Fast replacement without parsing XML, assuming commonly used patterns and clean XML (icon should have been cleaned up with Iconify Tools or SVGO).
     */
    function replaceIDs(body, prefix = randomPrefix) {
        // Find all IDs
        const ids = [];
        let match;
        while ((match = regex.exec(body))) {
            ids.push(match[1]);
        }
        if (!ids.length) {
            return body;
        }
        // Replace with unique ids
        ids.forEach((id) => {
            const newID = typeof prefix === 'function' ? prefix() : prefix + counter++;
            body = body.replace(new RegExp(replaceValue + '(' + escapeRegExp(id) + ')' + replaceValue, 'g'), '$1' + newID + '$3');
        });
        return body;
    }
    exports.replaceIDs = replaceIDs;
    });

    var size = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.calculateSize = void 0;
    /**
     * Regular expressions for calculating dimensions
     */
    const unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
    const unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
    /**
     * Calculate second dimension when only 1 dimension is set
     *
     * @param {string|number} size One dimension (such as width)
     * @param {number} ratio Width/height ratio.
     *      If size is width, ratio = height/width
     *      If size is height, ratio = width/height
     * @param {number} [precision] Floating number precision in result to minimize output. Default = 2
     * @return {string|number} Another dimension
     */
    function calculateSize(size, ratio, precision) {
        if (ratio === 1) {
            return size;
        }
        precision = precision === void 0 ? 100 : precision;
        if (typeof size === 'number') {
            return Math.ceil(size * ratio * precision) / precision;
        }
        if (typeof size !== 'string') {
            return size;
        }
        // Split code into sets of strings and numbers
        const oldParts = size.split(unitsSplit);
        if (oldParts === null || !oldParts.length) {
            return size;
        }
        const newParts = [];
        let code = oldParts.shift();
        let isNumber = unitsTest.test(code);
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (isNumber) {
                const num = parseFloat(code);
                if (isNaN(num)) {
                    newParts.push(code);
                }
                else {
                    newParts.push(Math.ceil(num * ratio * precision) / precision);
                }
            }
            else {
                newParts.push(code);
            }
            // next
            code = oldParts.shift();
            if (code === void 0) {
                return newParts.join('');
            }
            isNumber = !isNumber;
        }
    }
    exports.calculateSize = calculateSize;
    });

    var customisations = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergeCustomisations = exports.defaults = void 0;
    /**
     * Default icon customisations values
     */
    exports.defaults = Object.freeze({
        // Display mode
        inline: false,
        // Dimensions
        width: null,
        height: null,
        // Alignment
        hAlign: 'center',
        vAlign: 'middle',
        slice: false,
        // Transformations
        hFlip: false,
        vFlip: false,
        rotate: 0,
    });
    /**
     * Convert IconifyIconCustomisations to FullIconCustomisations
     */
    function mergeCustomisations(defaults, item) {
        const result = {};
        for (const key in defaults) {
            const attr = key;
            // Copy old value
            result[attr] = defaults[attr];
            if (item[attr] === void 0) {
                continue;
            }
            // Validate new value
            const value = item[attr];
            switch (attr) {
                // Boolean attributes that override old value
                case 'inline':
                case 'slice':
                    if (typeof value === 'boolean') {
                        result[attr] = value;
                    }
                    break;
                // Boolean attributes that are merged
                case 'hFlip':
                case 'vFlip':
                    if (value === true) {
                        result[attr] = !result[attr];
                    }
                    break;
                // Non-empty string
                case 'hAlign':
                case 'vAlign':
                    if (typeof value === 'string' && value !== '') {
                        result[attr] = value;
                    }
                    break;
                // Non-empty string / non-zero number / null
                case 'width':
                case 'height':
                    if ((typeof value === 'string' && value !== '') ||
                        (typeof value === 'number' && value) ||
                        value === null) {
                        result[attr] = value;
                    }
                    break;
                // Rotation
                case 'rotate':
                    if (typeof value === 'number') {
                        result[attr] += value;
                    }
                    break;
            }
        }
        return result;
    }
    exports.mergeCustomisations = mergeCustomisations;
    });

    var build = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.iconToSVG = void 0;

    /**
     * Get preserveAspectRatio value
     */
    function preserveAspectRatio(props) {
        let result = '';
        switch (props.hAlign) {
            case 'left':
                result += 'xMin';
                break;
            case 'right':
                result += 'xMax';
                break;
            default:
                result += 'xMid';
        }
        switch (props.vAlign) {
            case 'top':
                result += 'YMin';
                break;
            case 'bottom':
                result += 'YMax';
                break;
            default:
                result += 'YMid';
        }
        result += props.slice ? ' slice' : ' meet';
        return result;
    }
    /**
     * Get SVG attributes and content from icon + customisations
     *
     * Does not generate style to make it compatible with frameworks that use objects for style, such as React.
     * Instead, it generates 'inline' value. If true, rendering engine should add verticalAlign: -0.125em to icon.
     *
     * Customisations should be normalised by platform specific parser.
     * Result should be converted to <svg> by platform specific parser.
     * Use replaceIDs to generate unique IDs for body.
     */
    function iconToSVG(icon, customisations) {
        // viewBox
        const box = {
            left: icon.left,
            top: icon.top,
            width: icon.width,
            height: icon.height,
        };
        // Body
        let body = icon.body;
        // Apply transformations
        [icon, customisations].forEach((props) => {
            const transformations = [];
            const hFlip = props.hFlip;
            const vFlip = props.vFlip;
            let rotation = props.rotate;
            // Icon is flipped first, then rotated
            if (hFlip) {
                if (vFlip) {
                    rotation += 2;
                }
                else {
                    // Horizontal flip
                    transformations.push('translate(' +
                        (box.width + box.left) +
                        ' ' +
                        (0 - box.top) +
                        ')');
                    transformations.push('scale(-1 1)');
                    box.top = box.left = 0;
                }
            }
            else if (vFlip) {
                // Vertical flip
                transformations.push('translate(' +
                    (0 - box.left) +
                    ' ' +
                    (box.height + box.top) +
                    ')');
                transformations.push('scale(1 -1)');
                box.top = box.left = 0;
            }
            let tempValue;
            if (rotation < 0) {
                rotation -= Math.floor(rotation / 4) * 4;
            }
            rotation = rotation % 4;
            switch (rotation) {
                case 1:
                    // 90deg
                    tempValue = box.height / 2 + box.top;
                    transformations.unshift('rotate(90 ' + tempValue + ' ' + tempValue + ')');
                    break;
                case 2:
                    // 180deg
                    transformations.unshift('rotate(180 ' +
                        (box.width / 2 + box.left) +
                        ' ' +
                        (box.height / 2 + box.top) +
                        ')');
                    break;
                case 3:
                    // 270deg
                    tempValue = box.width / 2 + box.left;
                    transformations.unshift('rotate(-90 ' + tempValue + ' ' + tempValue + ')');
                    break;
            }
            if (rotation % 2 === 1) {
                // Swap width/height and x/y for 90deg or 270deg rotation
                if (box.left !== 0 || box.top !== 0) {
                    tempValue = box.left;
                    box.left = box.top;
                    box.top = tempValue;
                }
                if (box.width !== box.height) {
                    tempValue = box.width;
                    box.width = box.height;
                    box.height = tempValue;
                }
            }
            if (transformations.length) {
                body =
                    '<g transform="' +
                        transformations.join(' ') +
                        '">' +
                        body +
                        '</g>';
            }
        });
        // Calculate dimensions
        let width, height;
        if (customisations.width === null && customisations.height === null) {
            // Set height to '1em', calculate width
            height = '1em';
            width = size.calculateSize(height, box.width / box.height);
        }
        else if (customisations.width !== null &&
            customisations.height !== null) {
            // Values are set
            width = customisations.width;
            height = customisations.height;
        }
        else if (customisations.height !== null) {
            // Height is set
            height = customisations.height;
            width = size.calculateSize(height, box.width / box.height);
        }
        else {
            // Width is set
            width = customisations.width;
            height = size.calculateSize(width, box.height / box.width);
        }
        // Check for 'auto'
        if (width === 'auto') {
            width = box.width;
        }
        if (height === 'auto') {
            height = box.height;
        }
        // Convert to string
        width = typeof width === 'string' ? width : width + '';
        height = typeof height === 'string' ? height : height + '';
        // Result
        const result = {
            attributes: {
                width,
                height,
                preserveAspectRatio: preserveAspectRatio(customisations),
                viewBox: box.left + ' ' + box.top + ' ' + box.width + ' ' + box.height,
            },
            body,
        };
        if (customisations.inline) {
            result.inline = true;
        }
        return result;
    }
    exports.iconToSVG = iconToSVG;
    });

    var functions$2 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.builderFunctions = void 0;





    /**
     * Exported builder functions
     */
    exports.builderFunctions = {
        replaceIDs: id.replaceIDs,
        calculateSize: size.calculateSize,
        buildIcon: (icon$1, customisations$1) => {
            return build.iconToSVG(icon.fullIcon(icon$1), customisations.mergeCustomisations(customisations.defaults, customisations$1));
        },
    };
    });

    var modules$1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.coreModules = void 0;
    exports.coreModules = {};
    });

    var config$1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultConfig = void 0;
    /**
     * Default RedundancyConfig for API calls
     */
    exports.defaultConfig = {
        resources: [],
        index: 0,
        timeout: 2000,
        rotate: 750,
        random: false,
        dataAfterTimeout: false,
    };
    });

    var query = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sendQuery = void 0;
    /**
     * Send query
     */
    function sendQuery(config, payload, query, done, success) {
        // Get number of resources
        const resourcesCount = config.resources.length;
        // Save start index
        const startIndex = config.random
            ? Math.floor(Math.random() * resourcesCount)
            : config.index;
        // Get resources
        let resources;
        if (config.random) {
            // Randomise array
            let list = config.resources.slice(0);
            resources = [];
            while (list.length > 1) {
                const nextIndex = Math.floor(Math.random() * list.length);
                resources.push(list[nextIndex]);
                list = list.slice(0, nextIndex).concat(list.slice(nextIndex + 1));
            }
            resources = resources.concat(list);
        }
        else {
            // Rearrange resources to start with startIndex
            resources = config.resources
                .slice(startIndex)
                .concat(config.resources.slice(0, startIndex));
        }
        // Counters, status
        const startTime = Date.now();
        let status = 'pending';
        let queriesSent = 0;
        let lastError = void 0;
        // Timer
        let timer = null;
        // Execution queue
        let queue = [];
        // Callbacks to call when query is complete
        let doneCallbacks = [];
        if (typeof done === 'function') {
            doneCallbacks.push(done);
        }
        /**
         * Reset timer
         */
        function resetTimer() {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        }
        /**
         * Abort everything
         */
        function abort() {
            // Change status
            if (status === 'pending') {
                status = 'aborted';
            }
            // Reset timer
            resetTimer();
            // Abort all queued items
            queue.forEach((item) => {
                if (item.abort) {
                    item.abort();
                }
                if (item.status === 'pending') {
                    item.status = 'aborted';
                }
            });
            queue = [];
        }
        /**
         * Add / replace callback to call when execution is complete.
         * This can be used to abort pending query implementations when query is complete or aborted.
         */
        function subscribe(callback, overwrite) {
            if (overwrite) {
                doneCallbacks = [];
            }
            if (typeof callback === 'function') {
                doneCallbacks.push(callback);
            }
        }
        /**
         * Get query status
         */
        function getQueryStatus() {
            return {
                startTime,
                payload,
                status,
                queriesSent,
                queriesPending: queue.length,
                subscribe,
                abort,
            };
        }
        /**
         * Fail query
         */
        function failQuery() {
            status = 'failed';
            // Send notice to all callbacks
            doneCallbacks.forEach((callback) => {
                callback(void 0, lastError);
            });
        }
        /**
         * Clear queue
         */
        function clearQueue() {
            queue = queue.filter((item) => {
                if (item.status === 'pending') {
                    item.status = 'aborted';
                }
                if (item.abort) {
                    item.abort();
                }
                return false;
            });
        }
        /**
         * Got response from module
         */
        function moduleResponse(item, data, error) {
            const isError = data === void 0;
            // Remove item from queue
            queue = queue.filter((queued) => queued !== item);
            // Check status
            switch (status) {
                case 'pending':
                    // Pending
                    break;
                case 'failed':
                    if (isError || !config.dataAfterTimeout) {
                        // Query has already timed out or dataAfterTimeout is disabled
                        return;
                    }
                    // Success after failure
                    break;
                default:
                    // Aborted or completed
                    return;
            }
            // Error
            if (isError) {
                if (error !== void 0) {
                    lastError = error;
                }
                if (!queue.length) {
                    if (!resources.length) {
                        // Nothing else queued, nothing can be queued
                        failQuery();
                    }
                    else {
                        // Queue is empty: run next item immediately
                        // eslint-disable-next-line @typescript-eslint/no-use-before-define
                        execNext();
                    }
                }
                return;
            }
            // Reset timers, abort pending queries
            resetTimer();
            clearQueue();
            // Update index in Redundancy
            if (success && !config.random) {
                const index = config.resources.indexOf(item.resource);
                if (index !== -1 && index !== config.index) {
                    success(index);
                }
            }
            // Mark as completed and call callbacks
            status = 'completed';
            doneCallbacks.forEach((callback) => {
                callback(data);
            });
        }
        /**
         * Execute next query
         */
        function execNext() {
            // Check status
            if (status !== 'pending') {
                return;
            }
            // Reset timer
            resetTimer();
            // Get resource
            const resource = resources.shift();
            if (resource === void 0) {
                // Nothing to execute: wait for final timeout before failing
                if (queue.length) {
                    const timeout = typeof config.timeout === 'function'
                        ? config.timeout(startTime)
                        : config.timeout;
                    if (timeout) {
                        // Last timeout before failing to allow late response
                        timer = setTimeout(() => {
                            resetTimer();
                            if (status === 'pending') {
                                // Clear queue
                                clearQueue();
                                failQuery();
                            }
                        }, timeout);
                        return;
                    }
                }
                // Fail
                failQuery();
                return;
            }
            // Create new item
            const item = {
                getQueryStatus,
                status: 'pending',
                resource,
                done: (data, error) => {
                    moduleResponse(item, data, error);
                },
            };
            // Add to queue
            queue.push(item);
            // Bump next index
            queriesSent++;
            // Get timeout for next item
            const timeout = typeof config.rotate === 'function'
                ? config.rotate(queriesSent, startTime)
                : config.rotate;
            // Create timer
            timer = setTimeout(execNext, timeout);
            // Execute it
            query(resource, payload, item);
        }
        // Execute first query on next tick
        setTimeout(execNext);
        // Return getQueryStatus()
        return getQueryStatus;
    }
    exports.sendQuery = sendQuery;
    });

    var redundancy = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initRedundancy = void 0;


    /**
     * Set configuration
     */
    function setConfig(config) {
        if (typeof config !== 'object' ||
            typeof config.resources !== 'object' ||
            !(config.resources instanceof Array) ||
            !config.resources.length) {
            throw new Error('Invalid Reduncancy configuration');
        }
        const newConfig = Object.create(null);
        let key;
        for (key in config$1.defaultConfig) {
            if (config[key] !== void 0) {
                newConfig[key] = config[key];
            }
            else {
                newConfig[key] = config$1.defaultConfig[key];
            }
        }
        return newConfig;
    }
    /**
     * Redundancy instance
     */
    function initRedundancy(cfg) {
        // Configuration
        const config = setConfig(cfg);
        // List of queries
        let queries = [];
        /**
         * Remove aborted and completed queries
         */
        function cleanup() {
            queries = queries.filter((item) => item().status === 'pending');
        }
        /**
         * Send query
         */
        function query$1(payload, queryCallback, doneCallback) {
            const query$1 = query.sendQuery(config, payload, queryCallback, (data, error) => {
                // Remove query from list
                cleanup();
                // Call callback
                if (doneCallback) {
                    doneCallback(data, error);
                }
            }, (newIndex) => {
                // Update start index
                config.index = newIndex;
            });
            queries.push(query$1);
            return query$1;
        }
        /**
         * Find instance
         */
        function find(callback) {
            const result = queries.find((value) => {
                return callback(value);
            });
            return result !== void 0 ? result : null;
        }
        // Create and return functions
        const instance = {
            query: query$1,
            find,
            setIndex: (index) => {
                config.index = index;
            },
            getIndex: () => config.index,
            cleanup,
        };
        return instance;
    }
    exports.initRedundancy = initRedundancy;
    });

    var sort = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sortIcons = void 0;

    /**
     * Check if icons have been loaded
     */
    function sortIcons(icons) {
        const result = {
            loaded: [],
            missing: [],
            pending: [],
        };
        const storage = Object.create(null);
        // Sort icons alphabetically to prevent duplicates and make sure they are sorted in API queries
        icons.sort((a, b) => {
            if (a.provider !== b.provider) {
                return a.provider.localeCompare(b.provider);
            }
            if (a.prefix !== b.prefix) {
                return a.prefix.localeCompare(b.prefix);
            }
            return a.name.localeCompare(b.name);
        });
        let lastIcon = {
            provider: '',
            prefix: '',
            name: '',
        };
        icons.forEach((icon) => {
            if (lastIcon.name === icon.name &&
                lastIcon.prefix === icon.prefix &&
                lastIcon.provider === icon.provider) {
                return;
            }
            lastIcon = icon;
            // Check icon
            const provider = icon.provider;
            const prefix = icon.prefix;
            const name = icon.name;
            if (storage[provider] === void 0) {
                storage[provider] = Object.create(null);
            }
            const providerStorage = storage[provider];
            if (providerStorage[prefix] === void 0) {
                providerStorage[prefix] = storage_1.getStorage(provider, prefix);
            }
            const localStorage = providerStorage[prefix];
            let list;
            if (localStorage.icons[name] !== void 0) {
                list = result.loaded;
            }
            else if (prefix === '' || localStorage.missing[name] !== void 0) {
                // Mark icons without prefix as missing because they cannot be loaded from API
                list = result.missing;
            }
            else {
                list = result.pending;
            }
            const item = {
                provider,
                prefix,
                name,
            };
            list.push(item);
        });
        return result;
    }
    exports.sortIcons = sortIcons;
    });

    var callbacks = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.storeCallback = exports.updateCallbacks = exports.callbacks = void 0;

    // Records sorted by provider and prefix
    // This export is only for unit testing, should not be used
    exports.callbacks = Object.create(null);
    const pendingUpdates = Object.create(null);
    /**
     * Remove callback
     */
    function removeCallback(sources, id) {
        sources.forEach((source) => {
            const provider = source.provider;
            if (exports.callbacks[provider] === void 0) {
                return;
            }
            const providerCallbacks = exports.callbacks[provider];
            const prefix = source.prefix;
            const items = providerCallbacks[prefix];
            if (items) {
                providerCallbacks[prefix] = items.filter((row) => row.id !== id);
            }
        });
    }
    /**
     * Update all callbacks for provider and prefix
     */
    function updateCallbacks(provider, prefix) {
        if (pendingUpdates[provider] === void 0) {
            pendingUpdates[provider] = Object.create(null);
        }
        const providerPendingUpdates = pendingUpdates[provider];
        if (!providerPendingUpdates[prefix]) {
            providerPendingUpdates[prefix] = true;
            setTimeout(() => {
                providerPendingUpdates[prefix] = false;
                if (exports.callbacks[provider] === void 0 ||
                    exports.callbacks[provider][prefix] === void 0) {
                    return;
                }
                // Get all items
                const items = exports.callbacks[provider][prefix].slice(0);
                if (!items.length) {
                    return;
                }
                const storage = storage_1.getStorage(provider, prefix);
                // Check each item for changes
                let hasPending = false;
                items.forEach((item) => {
                    const icons = item.icons;
                    const oldLength = icons.pending.length;
                    icons.pending = icons.pending.filter((icon) => {
                        if (icon.prefix !== prefix) {
                            // Checking only current prefix
                            return true;
                        }
                        const name = icon.name;
                        if (storage.icons[name] !== void 0) {
                            // Loaded
                            icons.loaded.push({
                                provider,
                                prefix,
                                name,
                            });
                        }
                        else if (storage.missing[name] !== void 0) {
                            // Missing
                            icons.missing.push({
                                provider,
                                prefix,
                                name,
                            });
                        }
                        else {
                            // Pending
                            hasPending = true;
                            return true;
                        }
                        return false;
                    });
                    // Changes detected - call callback
                    if (icons.pending.length !== oldLength) {
                        if (!hasPending) {
                            // All icons have been loaded - remove callback from prefix
                            removeCallback([
                                {
                                    provider,
                                    prefix,
                                },
                            ], item.id);
                        }
                        item.callback(icons.loaded.slice(0), icons.missing.slice(0), icons.pending.slice(0), item.abort);
                    }
                });
            });
        }
    }
    exports.updateCallbacks = updateCallbacks;
    /**
     * Unique id counter for callbacks
     */
    let idCounter = 0;
    /**
     * Add callback
     */
    function storeCallback(callback, icons, pendingSources) {
        // Create unique id and abort function
        const id = idCounter++;
        const abort = removeCallback.bind(null, pendingSources, id);
        if (!icons.pending.length) {
            // Do not store item without pending icons and return function that does nothing
            return abort;
        }
        // Create item and store it for all pending prefixes
        const item = {
            id,
            icons,
            callback,
            abort: abort,
        };
        pendingSources.forEach((source) => {
            const provider = source.provider;
            const prefix = source.prefix;
            if (exports.callbacks[provider] === void 0) {
                exports.callbacks[provider] = Object.create(null);
            }
            const providerCallbacks = exports.callbacks[provider];
            if (providerCallbacks[prefix] === void 0) {
                providerCallbacks[prefix] = [];
            }
            providerCallbacks[prefix].push(item);
        });
        return abort;
    }
    exports.storeCallback = storeCallback;
    });

    var modules = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAPIModule = exports.setAPIModule = void 0;
    /**
     * Local storate types and entries
     */
    const storage = Object.create(null);
    /**
     * Set API module
     */
    function setAPIModule(provider, item) {
        storage[provider] = item;
    }
    exports.setAPIModule = setAPIModule;
    /**
     * Get API module
     */
    function getAPIModule(provider) {
        return storage[provider] === void 0 ? storage[''] : storage[provider];
    }
    exports.getAPIModule = getAPIModule;
    });

    var config = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAPIConfig = exports.setAPIConfig = void 0;
    /**
     * Create full API configuration from partial data
     */
    function createConfig(source) {
        let resources;
        if (typeof source.resources === 'string') {
            resources = [source.resources];
        }
        else {
            resources = source.resources;
            if (!(resources instanceof Array) || !resources.length) {
                return null;
            }
        }
        const result = {
            // API hosts
            resources: resources,
            // Root path
            path: source.path === void 0 ? '/' : source.path,
            // URL length limit
            maxURL: source.maxURL ? source.maxURL : 500,
            // Timeout before next host is used.
            rotate: source.rotate ? source.rotate : 750,
            // Timeout before failing query.
            timeout: source.timeout ? source.timeout : 5000,
            // Randomise default API end point.
            random: source.random === true,
            // Start index
            index: source.index ? source.index : 0,
            // Receive data after time out (used if time out kicks in first, then API module sends data anyway).
            dataAfterTimeout: source.dataAfterTimeout !== false,
        };
        return result;
    }
    /**
     * Local storage
     */
    const configStorage = Object.create(null);
    /**
     * Redundancy for API servers.
     *
     * API should have very high uptime because of implemented redundancy at server level, but
     * sometimes bad things happen. On internet 100% uptime is not possible.
     *
     * There could be routing problems. Server might go down for whatever reason, but it takes
     * few minutes to detect that downtime, so during those few minutes API might not be accessible.
     *
     * This script has some redundancy to mitigate possible network issues.
     *
     * If one host cannot be reached in 'rotate' (750 by default) ms, script will try to retrieve
     * data from different host. Hosts have different configurations, pointing to different
     * API servers hosted at different providers.
     */
    const fallBackAPISources = [
        'https://api.simplesvg.com',
        'https://api.unisvg.com',
    ];
    // Shuffle fallback API
    const fallBackAPI = [];
    while (fallBackAPISources.length > 0) {
        if (fallBackAPISources.length === 1) {
            fallBackAPI.push(fallBackAPISources.shift());
        }
        else {
            // Get first or last item
            if (Math.random() > 0.5) {
                fallBackAPI.push(fallBackAPISources.shift());
            }
            else {
                fallBackAPI.push(fallBackAPISources.pop());
            }
        }
    }
    // Add default API
    configStorage[''] = createConfig({
        resources: ['https://api.iconify.design'].concat(fallBackAPI),
    });
    /**
     * Add custom config for provider
     */
    function setAPIConfig(provider, customConfig) {
        const config = createConfig(customConfig);
        if (config === null) {
            return false;
        }
        configStorage[provider] = config;
        return true;
    }
    exports.setAPIConfig = setAPIConfig;
    /**
     * Get API configuration
     */
    const getAPIConfig = (provider) => configStorage[provider];
    exports.getAPIConfig = getAPIConfig;
    });

    var list = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getProviders = exports.listToIcons = void 0;

    /**
     * Convert icons list from string/icon mix to icons and validate them
     */
    function listToIcons(list, validate = true, simpleNames = false) {
        const result = [];
        list.forEach((item) => {
            const icon = typeof item === 'string'
                ? name.stringToIcon(item, false, simpleNames)
                : item;
            if (!validate || name.validateIcon(icon, simpleNames)) {
                result.push({
                    provider: icon.provider,
                    prefix: icon.prefix,
                    name: icon.name,
                });
            }
        });
        return result;
    }
    exports.listToIcons = listToIcons;
    /**
     * Get all providers
     */
    function getProviders(list) {
        const providers = Object.create(null);
        list.forEach((icon) => {
            providers[icon.provider] = true;
        });
        return Object.keys(providers);
    }
    exports.getProviders = getProviders;
    });

    var api = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.API = exports.getRedundancyCache = void 0;









    // Empty abort callback for loadIcons()
    function emptyCallback() {
        // Do nothing
    }
    const pendingIcons = Object.create(null);
    /**
     * List of icons that are waiting to be loaded.
     *
     * List is passed to API module, then cleared.
     *
     * This list should not be used for any checks, use pendingIcons to check
     * if icons is being loaded.
     *
     * [provider][prefix] = array of icon names
     */
    const iconsToLoad = Object.create(null);
    // Flags to merge multiple synchronous icon requests in one asynchronous request
    const loaderFlags = Object.create(null);
    const queueFlags = Object.create(null);
    const redundancyCache = Object.create(null);
    /**
     * Get Redundancy instance for provider
     */
    function getRedundancyCache(provider) {
        if (redundancyCache[provider] === void 0) {
            const config$1 = config.getAPIConfig(provider);
            if (!config$1) {
                // No way to load icons because configuration is not set!
                return;
            }
            const redundancy$1 = redundancy.initRedundancy(config$1);
            const cachedReundancy = {
                config: config$1,
                redundancy: redundancy$1,
            };
            redundancyCache[provider] = cachedReundancy;
        }
        return redundancyCache[provider];
    }
    exports.getRedundancyCache = getRedundancyCache;
    /**
     * Function called when new icons have been loaded
     */
    function loadedNewIcons(provider, prefix) {
        // Run only once per tick, possibly joining multiple API responses in one call
        if (loaderFlags[provider] === void 0) {
            loaderFlags[provider] = Object.create(null);
        }
        const providerLoaderFlags = loaderFlags[provider];
        if (!providerLoaderFlags[prefix]) {
            providerLoaderFlags[prefix] = true;
            setTimeout(() => {
                providerLoaderFlags[prefix] = false;
                callbacks.updateCallbacks(provider, prefix);
            });
        }
    }
    // Storage for errors for loadNewIcons(). Used to avoid spamming log with identical errors.
    const errorsCache = Object.create(null);
    /**
     * Load icons
     */
    function loadNewIcons(provider, prefix, icons) {
        function err() {
            const key = (provider === '' ? '' : '@' + provider + ':') + prefix;
            const time = Math.floor(Date.now() / 60000); // log once in a minute
            if (errorsCache[key] < time) {
                errorsCache[key] = time;
                console.error('Unable to retrieve icons for "' +
                    key +
                    '" because API is not configured properly.');
            }
        }
        // Create nested objects if needed
        if (iconsToLoad[provider] === void 0) {
            iconsToLoad[provider] = Object.create(null);
        }
        const providerIconsToLoad = iconsToLoad[provider];
        if (queueFlags[provider] === void 0) {
            queueFlags[provider] = Object.create(null);
        }
        const providerQueueFlags = queueFlags[provider];
        if (pendingIcons[provider] === void 0) {
            pendingIcons[provider] = Object.create(null);
        }
        const providerPendingIcons = pendingIcons[provider];
        // Add icons to queue
        if (providerIconsToLoad[prefix] === void 0) {
            providerIconsToLoad[prefix] = icons;
        }
        else {
            providerIconsToLoad[prefix] = providerIconsToLoad[prefix]
                .concat(icons)
                .sort();
        }
        // Redundancy item
        let cachedReundancy;
        // Trigger update on next tick, mering multiple synchronous requests into one asynchronous request
        if (!providerQueueFlags[prefix]) {
            providerQueueFlags[prefix] = true;
            setTimeout(() => {
                providerQueueFlags[prefix] = false;
                // Get icons and delete queue
                const icons = providerIconsToLoad[prefix];
                delete providerIconsToLoad[prefix];
                // Get API module
                const api = modules.getAPIModule(provider);
                if (!api) {
                    // No way to load icons!
                    err();
                    return;
                }
                // Get API config and Redundancy instance
                if (cachedReundancy === void 0) {
                    const redundancy = getRedundancyCache(provider);
                    if (redundancy === void 0) {
                        // No way to load icons because configuration is not set!
                        err();
                        return;
                    }
                    cachedReundancy = redundancy;
                }
                // Prepare parameters and run queries
                const params = api.prepare(provider, prefix, icons);
                params.forEach((item) => {
                    cachedReundancy.redundancy.query(item, api.send, (data, error) => {
                        const storage = storage_1.getStorage(provider, prefix);
                        // Check for error
                        if (typeof data !== 'object') {
                            if (error !== 404) {
                                // Do not handle error unless it is 404
                                return;
                            }
                            // Not found: mark as missing
                            const t = Date.now();
                            item.icons.forEach((name) => {
                                storage.missing[name] = t;
                            });
                        }
                        else {
                            // Add icons to storage
                            try {
                                const added = storage_1.addIconSet(storage, data, 'all');
                                if (typeof added === 'boolean') {
                                    return;
                                }
                                // Remove added icons from pending list
                                const pending = providerPendingIcons[prefix];
                                added.forEach((name) => {
                                    delete pending[name];
                                });
                                // Cache API response
                                if (modules$1.coreModules.cache) {
                                    modules$1.coreModules.cache(provider, data);
                                }
                            }
                            catch (err) {
                                console.error(err);
                            }
                        }
                        // Trigger update on next tick
                        loadedNewIcons(provider, prefix);
                    });
                });
            });
        }
    }
    /**
     * Check if icon is being loaded
     */
    const isPending = (icon) => {
        return (pendingIcons[icon.provider] !== void 0 &&
            pendingIcons[icon.provider][icon.prefix] !== void 0 &&
            pendingIcons[icon.provider][icon.prefix][icon.name] !== void 0);
    };
    /**
     * Load icons
     */
    const loadIcons = (icons, callback) => {
        // Clean up and copy icons list
        const cleanedIcons = list.listToIcons(icons, true, functions$3.allowSimpleNames());
        // Sort icons by missing/loaded/pending
        // Pending means icon is either being requsted or is about to be requested
        const sortedIcons = sort.sortIcons(cleanedIcons);
        if (!sortedIcons.pending.length) {
            // Nothing to load
            let callCallback = true;
            if (callback) {
                setTimeout(() => {
                    if (callCallback) {
                        callback(sortedIcons.loaded, sortedIcons.missing, sortedIcons.pending, emptyCallback);
                    }
                });
            }
            return () => {
                callCallback = false;
            };
        }
        // Get all sources for pending icons
        const newIcons = Object.create(null);
        const sources = [];
        let lastProvider, lastPrefix;
        sortedIcons.pending.forEach((icon) => {
            const provider = icon.provider;
            const prefix = icon.prefix;
            if (prefix === lastPrefix && provider === lastProvider) {
                return;
            }
            lastProvider = provider;
            lastPrefix = prefix;
            sources.push({
                provider,
                prefix,
            });
            if (pendingIcons[provider] === void 0) {
                pendingIcons[provider] = Object.create(null);
            }
            const providerPendingIcons = pendingIcons[provider];
            if (providerPendingIcons[prefix] === void 0) {
                providerPendingIcons[prefix] = Object.create(null);
            }
            if (newIcons[provider] === void 0) {
                newIcons[provider] = Object.create(null);
            }
            const providerNewIcons = newIcons[provider];
            if (providerNewIcons[prefix] === void 0) {
                providerNewIcons[prefix] = [];
            }
        });
        // List of new icons
        const time = Date.now();
        // Filter pending icons list: find icons that are not being loaded yet
        // If icon was called before, it must exist in pendingIcons or storage, but because this
        // function is called right after sortIcons() that checks storage, icon is definitely not in storage.
        sortedIcons.pending.forEach((icon) => {
            const provider = icon.provider;
            const prefix = icon.prefix;
            const name = icon.name;
            const pendingQueue = pendingIcons[provider][prefix];
            if (pendingQueue[name] === void 0) {
                // New icon - add to pending queue to mark it as being loaded
                pendingQueue[name] = time;
                // Add it to new icons list to pass it to API module for loading
                newIcons[provider][prefix].push(name);
            }
        });
        // Load icons on next tick to make sure result is not returned before callback is stored and
        // to consolidate multiple synchronous loadIcons() calls into one asynchronous API call
        sources.forEach((source) => {
            const provider = source.provider;
            const prefix = source.prefix;
            if (newIcons[provider][prefix].length) {
                loadNewIcons(provider, prefix, newIcons[provider][prefix]);
            }
        });
        // Store callback and return abort function
        return callback
            ? callbacks.storeCallback(callback, sortedIcons, sources)
            : emptyCallback;
    };
    /**
     * Export module
     */
    exports.API = {
        isPending,
        loadIcons,
    };
    });

    var functions$1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.APIInternalFunctions = exports.APIFunctions = void 0;



    exports.APIFunctions = {
        loadIcons: api.API.loadIcons,
        addAPIProvider: config.setAPIConfig,
    };
    exports.APIInternalFunctions = {
        getAPI: api.getRedundancyCache,
        getAPIConfig: config.getAPIConfig,
        setAPIModule: modules.setAPIModule,
    };
    });

    var jsonp = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAPIModule = void 0;
    let rootVar = null;
    /**
     * Endpoint
     */
    let endPoint = '{prefix}.js?icons={icons}&callback={callback}';
    /**
     * Cache: provider:prefix = value
     */
    const maxLengthCache = Object.create(null);
    const pathCache = Object.create(null);
    /**
     * Get hash for query
     *
     * Hash is used in JSONP callback name, so same queries end up with same JSONP callback,
     * allowing response to be cached in browser.
     */
    function hash(str) {
        let total = 0, i;
        for (i = str.length - 1; i >= 0; i--) {
            total += str.charCodeAt(i);
        }
        return total % 999;
    }
    /**
     * Get root object
     */
    function getGlobal() {
        // Create root
        if (rootVar === null) {
            // window
            const globalRoot = self;
            // Test for window.Iconify. If missing, create 'IconifyJSONP'
            let prefix = 'Iconify';
            let extraPrefix = '.cb';
            if (globalRoot[prefix] === void 0) {
                // Use 'IconifyJSONP' global
                prefix = 'IconifyJSONP';
                extraPrefix = '';
                if (globalRoot[prefix] === void 0) {
                    globalRoot[prefix] = Object.create(null);
                }
                rootVar = globalRoot[prefix];
            }
            else {
                // Use 'Iconify.cb'
                const iconifyRoot = globalRoot[prefix];
                if (iconifyRoot.cb === void 0) {
                    iconifyRoot.cb = Object.create(null);
                }
                rootVar = iconifyRoot.cb;
            }
            // Change end point
            endPoint = endPoint.replace('{callback}', prefix + extraPrefix + '.{cb}');
        }
        return rootVar;
    }
    /**
     * Return API module
     */
    const getAPIModule = (getAPIConfig) => {
        /**
         * Calculate maximum icons list length for prefix
         */
        function calculateMaxLength(provider, prefix) {
            // Get config and store path
            const config = getAPIConfig(provider);
            if (!config) {
                return 0;
            }
            // Calculate
            let result;
            if (!config.maxURL) {
                result = 0;
            }
            else {
                let maxHostLength = 0;
                config.resources.forEach((item) => {
                    const host = item;
                    maxHostLength = Math.max(maxHostLength, host.length);
                });
                // Make sure global is set
                getGlobal();
                // Extra width: prefix (3) + counter (4) - '{cb}' (4)
                const extraLength = 3;
                // Get available length
                result =
                    config.maxURL -
                        maxHostLength -
                        config.path.length -
                        endPoint
                            .replace('{provider}', provider)
                            .replace('{prefix}', prefix)
                            .replace('{icons}', '').length -
                        extraLength;
            }
            // Cache stuff and return result
            const cacheKey = provider + ':' + prefix;
            pathCache[cacheKey] = config.path;
            maxLengthCache[cacheKey] = result;
            return result;
        }
        /**
         * Prepare params
         */
        const prepare = (provider, prefix, icons) => {
            const results = [];
            // Get maximum icons list length
            const cacheKey = provider + ':' + prefix;
            let maxLength = maxLengthCache[cacheKey];
            if (maxLength === void 0) {
                maxLength = calculateMaxLength(provider, prefix);
            }
            // Split icons
            let item = {
                provider,
                prefix,
                icons: [],
            };
            let length = 0;
            icons.forEach((name, index) => {
                length += name.length + 1;
                if (length >= maxLength && index > 0) {
                    // Next set
                    results.push(item);
                    item = {
                        provider,
                        prefix,
                        icons: [],
                    };
                    length = name.length;
                }
                item.icons.push(name);
            });
            results.push(item);
            return results;
        };
        /**
         * Load icons
         */
        const send = (host, params, status) => {
            const provider = params.provider;
            const prefix = params.prefix;
            const icons = params.icons;
            const iconsList = icons.join(',');
            const cacheKey = provider + ':' + prefix;
            // Create callback prefix
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cbPrefix = prefix.split('-').shift().slice(0, 3);
            const global = getGlobal();
            // Callback hash
            let cbCounter = hash(provider + ':' + host + ':' + prefix + ':' + iconsList);
            while (global[cbPrefix + cbCounter] !== void 0) {
                cbCounter++;
            }
            const callbackName = cbPrefix + cbCounter;
            const path = pathCache[cacheKey] +
                endPoint
                    .replace('{provider}', provider)
                    .replace('{prefix}', prefix)
                    .replace('{icons}', iconsList)
                    .replace('{cb}', callbackName);
            global[callbackName] = (data) => {
                // Remove callback and complete query
                delete global[callbackName];
                status.done(data);
            };
            // Create URI
            const uri = host + path;
            // console.log('API query:', uri);
            // Create script and append it to head
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = uri;
            document.head.appendChild(script);
        };
        // Return functions
        return {
            prepare,
            send,
        };
    };
    exports.getAPIModule = getAPIModule;
    });

    var fetch_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAPIModule = exports.setFetch = void 0;
    /**
     * Endpoint
     */
    const endPoint = '{prefix}.json?icons={icons}';
    /**
     * Cache
     */
    const maxLengthCache = Object.create(null);
    const pathCache = Object.create(null);
    /**
     * Fetch function
     *
     * Use this to set 'cross-fetch' in node.js environment if you are retrieving icons on server side.
     * Not needed when using stuff like Next.js or SvelteKit because components use API only on client side.
     */
    let fetchModule = null;
    try {
        fetchModule = fetch;
    }
    catch (err) {
        //
    }
    function setFetch(fetch) {
        fetchModule = fetch;
    }
    exports.setFetch = setFetch;
    /**
     * Return API module
     */
    const getAPIModule = (getAPIConfig) => {
        /**
         * Calculate maximum icons list length for prefix
         */
        function calculateMaxLength(provider, prefix) {
            // Get config and store path
            const config = getAPIConfig(provider);
            if (!config) {
                return 0;
            }
            // Calculate
            let result;
            if (!config.maxURL) {
                result = 0;
            }
            else {
                let maxHostLength = 0;
                config.resources.forEach((item) => {
                    const host = item;
                    maxHostLength = Math.max(maxHostLength, host.length);
                });
                // Get available length
                result =
                    config.maxURL -
                        maxHostLength -
                        config.path.length -
                        endPoint
                            .replace('{provider}', provider)
                            .replace('{prefix}', prefix)
                            .replace('{icons}', '').length;
            }
            // Cache stuff and return result
            const cacheKey = provider + ':' + prefix;
            pathCache[cacheKey] = config.path;
            maxLengthCache[cacheKey] = result;
            return result;
        }
        /**
         * Prepare params
         */
        const prepare = (provider, prefix, icons) => {
            const results = [];
            // Get maximum icons list length
            let maxLength = maxLengthCache[prefix];
            if (maxLength === void 0) {
                maxLength = calculateMaxLength(provider, prefix);
            }
            // Split icons
            let item = {
                provider,
                prefix,
                icons: [],
            };
            let length = 0;
            icons.forEach((name, index) => {
                length += name.length + 1;
                if (length >= maxLength && index > 0) {
                    // Next set
                    results.push(item);
                    item = {
                        provider,
                        prefix,
                        icons: [],
                    };
                    length = name.length;
                }
                item.icons.push(name);
            });
            results.push(item);
            return results;
        };
        /**
         * Load icons
         */
        const send = (host, params, status) => {
            const provider = params.provider;
            const prefix = params.prefix;
            const icons = params.icons;
            const iconsList = icons.join(',');
            const cacheKey = provider + ':' + prefix;
            const path = pathCache[cacheKey] +
                endPoint
                    .replace('{provider}', provider)
                    .replace('{prefix}', prefix)
                    .replace('{icons}', iconsList);
            if (!fetchModule) {
                // Fail: return 424 Failed Dependency (its not meant to be used like that, but it is the best match)
                status.done(void 0, 424);
                return;
            }
            // console.log('API query:', host + path);
            fetchModule(host + path)
                .then((response) => {
                if (response.status !== 200) {
                    status.done(void 0, response.status);
                    return;
                }
                return response.json();
            })
                .then((data) => {
                if (typeof data !== 'object' || data === null) {
                    return;
                }
                // Store cache and complete
                status.done(data);
            })
                .catch((err) => {
                // Error
                status.done(void 0, err.errno);
            });
        };
        // Return functions
        return {
            prepare,
            send,
        };
    };
    exports.getAPIModule = getAPIModule;
    });

    var browserStorage = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.storeCache = exports.loadCache = exports.mock = exports.emptyList = exports.count = exports.config = void 0;

    // After changing configuration change it in tests/*/fake_cache.ts
    // Cache version. Bump when structure changes
    const cacheVersion = 'iconify2';
    // Cache keys
    const cachePrefix = 'iconify';
    const countKey = cachePrefix + '-count';
    const versionKey = cachePrefix + '-version';
    /**
     * Cache expiration
     */
    const hour = 3600000;
    const cacheExpiration = 168; // In hours
    /**
     * Storage configuration
     */
    exports.config = {
        local: true,
        session: true,
    };
    /**
     * Flag to check if storage has been loaded
     */
    let loaded = false;
    /**
     * Items counter
     */
    exports.count = {
        local: 0,
        session: 0,
    };
    /**
     * List of empty items
     */
    exports.emptyList = {
        local: [],
        session: [],
    };
    let _window = typeof window === 'undefined' ? {} : window;
    function mock(fakeWindow) {
        loaded = false;
        _window = fakeWindow;
    }
    exports.mock = mock;
    /**
     * Get global
     *
     * @param key
     */
    function getGlobal(key) {
        const attr = key + 'Storage';
        try {
            if (_window &&
                _window[attr] &&
                typeof _window[attr].length === 'number') {
                return _window[attr];
            }
        }
        catch (err) {
            //
        }
        // Failed - mark as disabled
        exports.config[key] = false;
        return null;
    }
    /**
     * Change current count for storage
     */
    function setCount(storage, key, value) {
        try {
            storage.setItem(countKey, value + '');
            exports.count[key] = value;
            return true;
        }
        catch (err) {
            return false;
        }
    }
    /**
     * Get current count from storage
     *
     * @param storage
     */
    function getCount(storage) {
        const count = storage.getItem(countKey);
        if (count) {
            const total = parseInt(count);
            return total ? total : 0;
        }
        return 0;
    }
    /**
     * Initialize storage
     *
     * @param storage
     * @param key
     */
    function initCache(storage, key) {
        try {
            storage.setItem(versionKey, cacheVersion);
        }
        catch (err) {
            //
        }
        setCount(storage, key, 0);
    }
    /**
     * Destroy old cache
     *
     * @param storage
     */
    function destroyCache(storage) {
        try {
            const total = getCount(storage);
            for (let i = 0; i < total; i++) {
                storage.removeItem(cachePrefix + i);
            }
        }
        catch (err) {
            //
        }
    }
    /**
     * Load icons from cache
     */
    const loadCache = () => {
        if (loaded) {
            return;
        }
        loaded = true;
        // Minimum time
        const minTime = Math.floor(Date.now() / hour) - cacheExpiration;
        // Load data from storage
        function load(key) {
            const func = getGlobal(key);
            if (!func) {
                return;
            }
            // Get one item from storage
            const getItem = (index) => {
                const name = cachePrefix + index;
                const item = func.getItem(name);
                if (typeof item !== 'string') {
                    // Does not exist
                    return false;
                }
                // Get item, validate it
                let valid = true;
                try {
                    // Parse, check time stamp
                    const data = JSON.parse(item);
                    if (typeof data !== 'object' ||
                        typeof data.cached !== 'number' ||
                        data.cached < minTime ||
                        typeof data.provider !== 'string' ||
                        typeof data.data !== 'object' ||
                        typeof data.data.prefix !== 'string') {
                        valid = false;
                    }
                    else {
                        // Add icon set
                        const provider = data.provider;
                        const prefix = data.data.prefix;
                        const storage = storage_1.getStorage(provider, prefix);
                        valid = storage_1.addIconSet(storage, data.data);
                    }
                }
                catch (err) {
                    valid = false;
                }
                if (!valid) {
                    func.removeItem(name);
                }
                return valid;
            };
            try {
                // Get version
                const version = func.getItem(versionKey);
                if (version !== cacheVersion) {
                    if (version) {
                        // Version is set, but invalid - remove old entries
                        destroyCache(func);
                    }
                    // Empty data
                    initCache(func, key);
                    return;
                }
                // Get number of stored items
                let total = getCount(func);
                for (let i = total - 1; i >= 0; i--) {
                    if (!getItem(i)) {
                        // Remove item
                        if (i === total - 1) {
                            // Last item - reduce country
                            total--;
                        }
                        else {
                            // Mark as empty
                            exports.emptyList[key].push(i);
                        }
                    }
                }
                // Update total
                setCount(func, key, total);
            }
            catch (err) {
                //
            }
        }
        for (const key in exports.config) {
            load(key);
        }
    };
    exports.loadCache = loadCache;
    /**
     * Function to cache icons
     */
    const storeCache = (provider, data) => {
        if (!loaded) {
            exports.loadCache();
        }
        function store(key) {
            if (!exports.config[key]) {
                return false;
            }
            const func = getGlobal(key);
            if (!func) {
                return false;
            }
            // Get item index
            let index = exports.emptyList[key].shift();
            if (index === void 0) {
                // Create new index
                index = exports.count[key];
                if (!setCount(func, key, index + 1)) {
                    return false;
                }
            }
            // Create and save item
            try {
                const item = {
                    cached: Math.floor(Date.now() / hour),
                    provider,
                    data,
                };
                func.setItem(cachePrefix + index, JSON.stringify(item));
            }
            catch (err) {
                return false;
            }
            return true;
        }
        // Attempt to store at localStorage first, then at sessionStorage
        if (!store('local')) {
            store('session');
        }
    };
    exports.storeCache = storeCache;
    });

    var functions = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toggleBrowserCache = void 0;

    /**
     * Toggle cache
     */
    function toggleBrowserCache(storage, value) {
        switch (storage) {
            case 'local':
            case 'session':
                browserStorage.config[storage] = value;
                break;
            case 'all':
                for (const key in browserStorage.config) {
                    browserStorage.config[key] = value;
                }
                break;
        }
    }
    exports.toggleBrowserCache = toggleBrowserCache;
    });

    var shorthand = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.alignmentFromString = exports.flipFromString = void 0;
    const separator = /[\s,]+/;
    /**
     * Apply "flip" string to icon customisations
     */
    function flipFromString(custom, flip) {
        flip.split(separator).forEach((str) => {
            const value = str.trim();
            switch (value) {
                case 'horizontal':
                    custom.hFlip = true;
                    break;
                case 'vertical':
                    custom.vFlip = true;
                    break;
            }
        });
    }
    exports.flipFromString = flipFromString;
    /**
     * Apply "align" string to icon customisations
     */
    function alignmentFromString(custom, align) {
        align.split(separator).forEach((str) => {
            const value = str.trim();
            switch (value) {
                case 'left':
                case 'center':
                case 'right':
                    custom.hAlign = value;
                    break;
                case 'top':
                case 'middle':
                case 'bottom':
                    custom.vAlign = value;
                    break;
                case 'slice':
                case 'crop':
                    custom.slice = true;
                    break;
                case 'meet':
                    custom.slice = false;
            }
        });
    }
    exports.alignmentFromString = alignmentFromString;
    });

    var rotate = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.rotateFromString = void 0;
    /**
     * Get rotation value
     */
    function rotateFromString(value) {
        const units = value.replace(/^-?[0-9.]*/, '');
        function cleanup(value) {
            while (value < 0) {
                value += 4;
            }
            return value % 4;
        }
        if (units === '') {
            const num = parseInt(value);
            return isNaN(num) ? 0 : cleanup(num);
        }
        else if (units !== value) {
            let split = 0;
            switch (units) {
                case '%':
                    // 25% -> 1, 50% -> 2, ...
                    split = 25;
                    break;
                case 'deg':
                    // 90deg -> 1, 180deg -> 2, ...
                    split = 90;
            }
            if (split) {
                let num = parseFloat(value.slice(0, value.length - units.length));
                if (isNaN(num)) {
                    return 0;
                }
                num = num / split;
                return num % 1 === 0 ? cleanup(num) : 0;
            }
        }
        return 0;
    }
    exports.rotateFromString = rotateFromString;
    });

    /**
     * Default SVG attributes
     */
    const svgDefaults = {
        'xmlns': 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'aria-hidden': true,
        'role': 'img',
    };
    /**
     * Generate icon from properties
     */
    function render(
    // Icon must be validated before calling this function
    icon, 
    // Properties
    props) {
        const customisations$1 = customisations.mergeCustomisations(customisations.defaults, props);
        const componentProps = Object.assign({}, svgDefaults);
        // Create style if missing
        let style = typeof props.style === 'string' ? props.style : '';
        // Get element properties
        for (let key in props) {
            const value = props[key];
            if (value === void 0) {
                continue;
            }
            switch (key) {
                // Properties to ignore
                case 'icon':
                case 'style':
                case 'onLoad':
                    break;
                // Boolean attributes
                case 'inline':
                case 'hFlip':
                case 'vFlip':
                    customisations$1[key] =
                        value === true || value === 'true' || value === 1;
                    break;
                // Flip as string: 'horizontal,vertical'
                case 'flip':
                    if (typeof value === 'string') {
                        shorthand.flipFromString(customisations$1, value);
                    }
                    break;
                // Alignment as string
                case 'align':
                    if (typeof value === 'string') {
                        shorthand.alignmentFromString(customisations$1, value);
                    }
                    break;
                // Color: copy to style, add extra ';' in case style is missing it
                case 'color':
                    style =
                        style +
                            (style.length > 0 && style.trim().slice(-1) !== ';'
                                ? ';'
                                : '') +
                            'color: ' +
                            value +
                            '; ';
                    break;
                // Rotation as string
                case 'rotate':
                    if (typeof value === 'string') {
                        customisations$1[key] = rotate.rotateFromString(value);
                    }
                    else if (typeof value === 'number') {
                        customisations$1[key] = value;
                    }
                    break;
                // Remove aria-hidden
                case 'ariaHidden':
                case 'aria-hidden':
                    if (value !== true && value !== 'true') {
                        delete componentProps['aria-hidden'];
                    }
                    break;
                // Copy missing property if it does not exist in customisations
                default:
                    if (customisations.defaults[key] === void 0) {
                        componentProps[key] = value;
                    }
            }
        }
        // Generate icon
        const item = build.iconToSVG(icon, customisations$1);
        // Add icon stuff
        for (let key in item.attributes) {
            componentProps[key] =
                item.attributes[key];
        }
        if (item.inline) {
            // Style overrides it
            style = 'vertical-align: -0.125em; ' + style;
        }
        // Style
        if (style !== '') {
            componentProps.style = style;
        }
        // Counter for ids based on "id" property to render icons consistently on server and client
        let localCounter = 0;
        const id$1 = props.id;
        // Generate HTML
        return {
            attributes: componentProps,
            body: id.replaceIDs(item.body, id$1 ? () => id$1 + '-' + localCounter++ : 'iconify-svelte-'),
        };
    }

    // Core
    /**
     * Enable and disable browser cache
     */
    const enableCache = (storage) => functions.toggleBrowserCache(storage, true);
    const disableCache = (storage) => functions.toggleBrowserCache(storage, false);
    /* Storage functions */
    /**
     * Check if icon exists
     */
    const iconExists = functions$3.storageFunctions.iconExists;
    /**
     * Get icon data
     */
    const getIcon = functions$3.storageFunctions.getIcon;
    /**
     * List available icons
     */
    const listIcons = functions$3.storageFunctions.listIcons;
    /**
     * Add one icon
     */
    const addIcon = functions$3.storageFunctions.addIcon;
    /**
     * Add icon set
     */
    const addCollection = functions$3.storageFunctions.addCollection;
    /* Builder functions */
    /**
     * Calculate icon size
     */
    const calculateSize = functions$2.builderFunctions.calculateSize;
    /**
     * Replace unique ids in content
     */
    const replaceIDs = functions$2.builderFunctions.replaceIDs;
    /**
     * Build SVG
     */
    const buildIcon = functions$2.builderFunctions.buildIcon;
    /* API functions */
    /**
     * Load icons
     */
    const loadIcons = functions$1.APIFunctions.loadIcons;
    /**
     * Add API provider
     */
    const addAPIProvider = functions$1.APIFunctions.addAPIProvider;
    /**
     * Export internal functions that can be used by third party implementations
     */
    const _api = functions$1.APIInternalFunctions;
    /**
     * Initialise stuff
     */
    // Enable short names
    functions$3.allowSimpleNames(true);
    // Set API
    modules$1.coreModules.api = api.API;
    // Use Fetch API by default
    let getAPIModule = fetch_1.getAPIModule;
    try {
        if (typeof document !== 'undefined' && typeof window !== 'undefined') {
            // If window and document exist, attempt to load whatever module is available, otherwise use Fetch API
            getAPIModule =
                typeof fetch === 'function' && typeof Promise === 'function'
                    ? fetch_1.getAPIModule
                    : jsonp.getAPIModule;
        }
    }
    catch (err) {
        //
    }
    modules.setAPIModule('', getAPIModule(config.getAPIConfig));
    /**
     * Function to enable node-fetch for getting icons on server side
     */
    _api.setFetch = (nodeFetch) => {
        fetch_1.setFetch(nodeFetch);
        if (getAPIModule !== fetch_1.getAPIModule) {
            getAPIModule = fetch_1.getAPIModule;
            modules.setAPIModule('', getAPIModule(config.getAPIConfig));
        }
    };
    /**
     * Browser stuff
     */
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
        // Set cache and load existing cache
        modules$1.coreModules.cache = browserStorage.storeCache;
        browserStorage.loadCache();
        const _window = window;
        // Load icons from global "IconifyPreload"
        if (_window.IconifyPreload !== void 0) {
            const preload = _window.IconifyPreload;
            const err = 'Invalid IconifyPreload syntax.';
            if (typeof preload === 'object' && preload !== null) {
                (preload instanceof Array ? preload : [preload]).forEach((item) => {
                    try {
                        if (
                        // Check if item is an object and not null/array
                        typeof item !== 'object' ||
                            item === null ||
                            item instanceof Array ||
                            // Check for 'icons' and 'prefix'
                            typeof item.icons !== 'object' ||
                            typeof item.prefix !== 'string' ||
                            // Add icon set
                            !addCollection(item)) {
                            console.error(err);
                        }
                    }
                    catch (e) {
                        console.error(err);
                    }
                });
            }
        }
        // Set API from global "IconifyProviders"
        if (_window.IconifyProviders !== void 0) {
            const providers = _window.IconifyProviders;
            if (typeof providers === 'object' && providers !== null) {
                for (let key in providers) {
                    const err = 'IconifyProviders[' + key + '] is invalid.';
                    try {
                        const value = providers[key];
                        if (typeof value !== 'object' ||
                            !value ||
                            value.resources === void 0) {
                            continue;
                        }
                        if (!config.setAPIConfig(key, value)) {
                            console.error(err);
                        }
                    }
                    catch (e) {
                        console.error(err);
                    }
                }
            }
        }
    }
    /**
     * Check if component needs to be updated
     */
    function checkIconState(icon$1, state, mounted, callback, onload) {
        // Abort loading icon
        function abortLoading() {
            if (state.loading) {
                state.loading.abort();
                state.loading = null;
            }
        }
        // Icon is an object
        if (typeof icon$1 === 'object' &&
            icon$1 !== null &&
            typeof icon$1.body === 'string') {
            // Stop loading
            state.name = '';
            abortLoading();
            return { data: icon.fullIcon(icon$1) };
        }
        // Invalid icon?
        let iconName;
        if (typeof icon$1 !== 'string' ||
            (iconName = name.stringToIcon(icon$1, false, true)) === null) {
            abortLoading();
            return null;
        }
        // Load icon
        const data = functions$3.getIconData(iconName);
        if (data === null) {
            // Icon needs to be loaded
            // Do not load icon until component is mounted
            if (mounted && (!state.loading || state.loading.name !== icon$1)) {
                // New icon to load
                abortLoading();
                state.name = '';
                state.loading = {
                    name: icon$1,
                    abort: api.API.loadIcons([iconName], callback),
                };
            }
            return null;
        }
        // Icon data is available
        abortLoading();
        if (state.name !== icon$1) {
            state.name = icon$1;
            if (onload && !state.destroyed) {
                onload(icon$1);
            }
        }
        // Add classes
        const classes = ['iconify'];
        if (iconName.prefix !== '') {
            classes.push('iconify--' + iconName.prefix);
        }
        if (iconName.provider !== '') {
            classes.push('iconify--' + iconName.provider);
        }
        return { data, classes };
    }
    /**
     * Generate icon
     */
    function generateIcon(icon, props) {
        return icon ? render(icon, props) : null;
    }

    /* node_modules/@iconify/svelte/dist/Icon.svelte generated by Svelte v3.42.2 */
    const file$7 = "node_modules/@iconify/svelte/dist/Icon.svelte";

    // (94:0) {#if data !== null}
    function create_if_block(ctx) {
    	let svg;
    	let raw_value = /*data*/ ctx[0].body + "";
    	let svg_levels = [/*data*/ ctx[0].attributes];
    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$7, 94, 0, 1654);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			svg.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && raw_value !== (raw_value = /*data*/ ctx[0].body + "")) svg.innerHTML = raw_value;			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [dirty & /*data*/ 1 && /*data*/ ctx[0].attributes]));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(94:0) {#if data !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;
    	let if_block = /*data*/ ctx[0] !== null && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*data*/ ctx[0] !== null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, []);

    	const state = {
    		// Last icon name
    		name: '',
    		// Loading status
    		loading: null,
    		// Destroyed status
    		destroyed: false
    	};

    	// Mounted status
    	let mounted = false;

    	// Callback counter
    	let counter = 0;

    	// Generated data
    	let data;

    	// Increase counter when loaded to force re-calculation of data
    	function loaded() {
    		$$invalidate(3, counter++, counter);
    	}

    	// Force re-render
    	onMount(() => {
    		$$invalidate(2, mounted = true);
    	});

    	// Abort loading when component is destroyed
    	onDestroy(() => {
    		$$invalidate(1, state.destroyed = true, state);

    		if (state.loading) {
    			state.loading.abort();
    			$$invalidate(1, state.loading = null, state);
    		}
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({
    		enableCache,
    		disableCache,
    		iconExists,
    		getIcon,
    		listIcons,
    		addIcon,
    		addCollection,
    		calculateSize,
    		replaceIDs,
    		buildIcon,
    		loadIcons,
    		addAPIProvider,
    		_api,
    		onMount,
    		onDestroy,
    		checkIconState,
    		generateIcon,
    		state,
    		mounted,
    		counter,
    		data,
    		loaded
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ('mounted' in $$props) $$invalidate(2, mounted = $$new_props.mounted);
    		if ('counter' in $$props) $$invalidate(3, counter = $$new_props.counter);
    		if ('data' in $$props) $$invalidate(0, data = $$new_props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		{
    			const iconData = checkIconState($$props.icon, state, mounted, loaded, $$props.onLoad);
    			$$invalidate(0, data = iconData ? generateIcon(iconData.data, $$props) : null);

    			if (data && iconData.classes) {
    				// Add classes
    				$$invalidate(
    					0,
    					data.attributes['class'] = (typeof $$props['class'] === 'string'
    					? $$props['class'] + ' '
    					: '') + iconData.classes.join(' '),
    					data
    				);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [data, state, mounted, counter];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/Home.svelte generated by Svelte v3.42.2 */
    const file$6 = "src/Home.svelte";

    function create_fragment$6(ctx) {
    	let body;
    	let h1;
    	let div0;
    	let div0_transition;
    	let t1;
    	let div1;
    	let t2;
    	let icon0;
    	let div1_transition;
    	let t3;
    	let div2;
    	let div2_transition;
    	let t5;
    	let div3;
    	let t6;
    	let icon1;
    	let div3_transition;
    	let t7;
    	let button;
    	let t9;
    	let div12;
    	let br0;
    	let t10;
    	let h3;
    	let t12;
    	let h20;
    	let t14;
    	let br1;
    	let t15;
    	let div4;
    	let t17;
    	let div5;
    	let t19;
    	let div6;
    	let t21;
    	let div7;
    	let t23;
    	let div11;
    	let div8;
    	let img0;
    	let img0_src_value;
    	let t24;
    	let div9;
    	let img1;
    	let img1_src_value;
    	let t25;
    	let div10;
    	let img2;
    	let img2_src_value;
    	let t26;
    	let h21;
    	let t28;
    	let footer;
    	let current;
    	let mounted;
    	let dispose;

    	icon0 = new Icon({
    			props: { icon: "whh:minisad" },
    			$$inline: true
    		});

    	icon1 = new Icon({
    			props: { icon: "fontelico:emo-happy" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			body = element("body");
    			h1 = element("h1");
    			div0 = element("div");
    			div0.textContent = "turn";
    			t1 = space();
    			div1 = element("div");
    			t2 = text("FUAN\n\t\t\t");
    			create_component(icon0.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "into";
    			t5 = space();
    			div3 = element("div");
    			t6 = text("FUN\n\t\t\t");
    			create_component(icon1.$$.fragment);
    			t7 = space();
    			button = element("button");
    			button.textContent = "はじめましょう!";
    			t9 = space();
    			div12 = element("div");
    			br0 = element("br");
    			t10 = space();
    			h3 = element("h3");
    			h3.textContent = "就活が不安なあなたへ...";
    			t12 = space();
    			h20 = element("h2");
    			h20.textContent = "その\"不安\"を共有しませんか?";
    			t14 = space();
    			br1 = element("br");
    			t15 = space();
    			div4 = element("div");
    			div4.textContent = "本サイトは、不安を吐露し、その課題をどのように解決していくかを皆で共有し合うSNSです。";
    			t17 = space();
    			div5 = element("div");
    			div5.textContent = "不安を抱える事は悪い事ではありません。それだけ、慎重に将来の事を考えている証拠です。";
    			t19 = space();
    			div6 = element("div");
    			div6.textContent = "他の人の不安を見る事ができるので、参考になることがあるかもしれません。";
    			t21 = space();
    			div7 = element("div");
    			div7.textContent = "様々な不安の解決法を知ることで、不安が解消され楽しく就活ができるはずです!";
    			t23 = space();
    			div11 = element("div");
    			div8 = element("div");
    			img0 = element("img");
    			t24 = space();
    			div9 = element("div");
    			img1 = element("img");
    			t25 = space();
    			div10 = element("div");
    			img2 = element("img");
    			t26 = space();
    			h21 = element("h2");
    			h21.textContent = "さあ! あなたも不安を共有して楽しい就活を!";
    			t28 = space();
    			footer = element("footer");
    			footer.textContent = "©︎ 2021 semlele";
    			add_location(div0, file$6, 8, 2, 187);
    			add_location(div1, file$6, 9, 2, 238);
    			add_location(div2, file$6, 13, 2, 327);
    			add_location(div3, file$6, 14, 2, 378);
    			attr_dev(h1, "class", "app-title svelte-arsx5z");
    			attr_dev(h1, "id", "top");
    			add_location(h1, file$6, 7, 1, 152);
    			attr_dev(button, "class", "getStart svelte-arsx5z");
    			add_location(button, file$6, 19, 1, 481);
    			attr_dev(br0, "class", "space");
    			add_location(br0, file$6, 21, 2, 596);
    			attr_dev(h3, "class", "svelte-arsx5z");
    			add_location(h3, file$6, 22, 2, 617);
    			attr_dev(h20, "class", "svelte-arsx5z");
    			add_location(h20, file$6, 23, 2, 642);
    			add_location(br1, file$6, 24, 2, 669);
    			attr_dev(div4, "class", "explain svelte-arsx5z");
    			add_location(div4, file$6, 25, 2, 676);
    			attr_dev(div5, "class", "explain svelte-arsx5z");
    			add_location(div5, file$6, 26, 2, 750);
    			attr_dev(div6, "class", "explain svelte-arsx5z");
    			add_location(div6, file$6, 27, 2, 822);
    			attr_dev(div7, "class", "explain svelte-arsx5z");
    			add_location(div7, file$6, 28, 2, 887);
    			if (!src_url_equal(img0.src, img0_src_value = "worried_pic.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "width", "30%");
    			attr_dev(img0, "height", "30%");
    			add_location(img0, file$6, 30, 24, 1001);
    			attr_dev(div8, "class", "worried svelte-arsx5z");
    			add_location(div8, file$6, 30, 3, 980);
    			if (!src_url_equal(img1.src, img1_src_value = "think_pic.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "width", "30%");
    			attr_dev(img1, "height", "30%");
    			add_location(img1, file$6, 31, 22, 1089);
    			attr_dev(div9, "class", "think svelte-arsx5z");
    			add_location(div9, file$6, 31, 3, 1070);
    			if (!src_url_equal(img2.src, img2_src_value = "find_pic.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "width", "30%");
    			attr_dev(img2, "height", "30%");
    			add_location(img2, file$6, 32, 21, 1174);
    			attr_dev(div10, "class", "find svelte-arsx5z");
    			add_location(div10, file$6, 32, 3, 1156);
    			attr_dev(h21, "class", "lets svelte-arsx5z");
    			add_location(h21, file$6, 33, 3, 1240);
    			attr_dev(div11, "class", "pictures svelte-arsx5z");
    			add_location(div11, file$6, 29, 2, 954);
    			attr_dev(div12, "class", "aboutThisSite svelte-arsx5z");
    			attr_dev(div12, "id", "about");
    			add_location(div12, file$6, 20, 1, 555);
    			attr_dev(footer, "class", "svelte-arsx5z");
    			add_location(footer, file$6, 36, 1, 1303);
    			add_location(body, file$6, 6, 0, 144);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, h1);
    			append_dev(h1, div0);
    			append_dev(h1, t1);
    			append_dev(h1, div1);
    			append_dev(div1, t2);
    			mount_component(icon0, div1, null);
    			append_dev(h1, t3);
    			append_dev(h1, div2);
    			append_dev(h1, t5);
    			append_dev(h1, div3);
    			append_dev(div3, t6);
    			mount_component(icon1, div3, null);
    			append_dev(body, t7);
    			append_dev(body, button);
    			append_dev(body, t9);
    			append_dev(body, div12);
    			append_dev(div12, br0);
    			append_dev(div12, t10);
    			append_dev(div12, h3);
    			append_dev(div12, t12);
    			append_dev(div12, h20);
    			append_dev(div12, t14);
    			append_dev(div12, br1);
    			append_dev(div12, t15);
    			append_dev(div12, div4);
    			append_dev(div12, t17);
    			append_dev(div12, div5);
    			append_dev(div12, t19);
    			append_dev(div12, div6);
    			append_dev(div12, t21);
    			append_dev(div12, div7);
    			append_dev(div12, t23);
    			append_dev(div12, div11);
    			append_dev(div11, div8);
    			append_dev(div8, img0);
    			append_dev(div11, t24);
    			append_dev(div11, div9);
    			append_dev(div9, img1);
    			append_dev(div11, t25);
    			append_dev(div11, div10);
    			append_dev(div10, img2);
    			append_dev(div11, t26);
    			append_dev(div11, h21);
    			append_dev(body, t28);
    			append_dev(body, footer);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, { delay: 200 }, true);
    				div0_transition.run(1);
    			});

    			transition_in(icon0.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { delay: 500 }, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { delay: 800 }, true);
    				div2_transition.run(1);
    			});

    			transition_in(icon1.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, { delay: 1100 }, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, { delay: 200 }, false);
    			div0_transition.run(0);
    			transition_out(icon0.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { delay: 500 }, false);
    			div1_transition.run(0);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { delay: 800 }, false);
    			div2_transition.run(0);
    			transition_out(icon1.$$.fragment, local);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, { delay: 1100 }, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			if (detaching && div0_transition) div0_transition.end();
    			destroy_component(icon0);
    			if (detaching && div1_transition) div1_transition.end();
    			if (detaching && div2_transition) div2_transition.end();
    			destroy_component(icon1);
    			if (detaching && div3_transition) div3_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => push('/add');
    	$$self.$capture_state = () => ({ push, Icon, fade });
    	return [click_handler];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/NoteEditor.svelte generated by Svelte v3.42.2 */

    const file$5 = "src/components/NoteEditor.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let textarea0;
    	let t2;
    	let textarea1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			textarea0 = element("textarea");
    			t2 = space();
    			textarea1 = element("textarea");
    			attr_dev(input0, "class", "title svelte-ei5la4");
    			attr_dev(input0, "placeholder", "What's your name?");
    			add_location(input0, file$5, 8, 4, 145);
    			attr_dev(input1, "class", "jobName svelte-ei5la4");
    			attr_dev(input1, "placeholder", "What kind of career do you want to be?");
    			add_location(input1, file$5, 9, 4, 222);
    			attr_dev(textarea0, "class", "contentFuan svelte-ei5la4");
    			attr_dev(textarea0, "placeholder", "What is your 「FUAN」 about looking for job?");
    			add_location(textarea0, file$5, 10, 4, 324);
    			attr_dev(textarea1, "class", "contentWO svelte-ei5la4");
    			attr_dev(textarea1, "placeholder", "What are you working on?");
    			add_location(textarea1, file$5, 11, 4, 452);
    			attr_dev(div, "class", "editor svelte-ei5la4");
    			add_location(div, file$5, 7, 0, 120);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input0);
    			set_input_value(input0, /*title*/ ctx[0]);
    			append_dev(div, t0);
    			append_dev(div, input1);
    			set_input_value(input1, /*jobName*/ ctx[1]);
    			append_dev(div, t1);
    			append_dev(div, textarea0);
    			set_input_value(textarea0, /*contentFuan*/ ctx[2]);
    			append_dev(div, t2);
    			append_dev(div, textarea1);
    			set_input_value(textarea1, /*contentWO*/ ctx[3]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(textarea0, "input", /*textarea0_input_handler*/ ctx[6]),
    					listen_dev(textarea1, "input", /*textarea1_input_handler*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1 && input0.value !== /*title*/ ctx[0]) {
    				set_input_value(input0, /*title*/ ctx[0]);
    			}

    			if (dirty & /*jobName*/ 2 && input1.value !== /*jobName*/ ctx[1]) {
    				set_input_value(input1, /*jobName*/ ctx[1]);
    			}

    			if (dirty & /*contentFuan*/ 4) {
    				set_input_value(textarea0, /*contentFuan*/ ctx[2]);
    			}

    			if (dirty & /*contentWO*/ 8) {
    				set_input_value(textarea1, /*contentWO*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NoteEditor', slots, []);
    	let { title } = $$props;
    	let { jobName } = $$props;
    	let { contentFuan } = $$props;
    	let { contentWO } = $$props;
    	const writable_props = ['title', 'jobName', 'contentFuan', 'contentWO'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NoteEditor> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		title = this.value;
    		$$invalidate(0, title);
    	}

    	function input1_input_handler() {
    		jobName = this.value;
    		$$invalidate(1, jobName);
    	}

    	function textarea0_input_handler() {
    		contentFuan = this.value;
    		$$invalidate(2, contentFuan);
    	}

    	function textarea1_input_handler() {
    		contentWO = this.value;
    		$$invalidate(3, contentWO);
    	}

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('jobName' in $$props) $$invalidate(1, jobName = $$props.jobName);
    		if ('contentFuan' in $$props) $$invalidate(2, contentFuan = $$props.contentFuan);
    		if ('contentWO' in $$props) $$invalidate(3, contentWO = $$props.contentWO);
    	};

    	$$self.$capture_state = () => ({ title, jobName, contentFuan, contentWO });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('jobName' in $$props) $$invalidate(1, jobName = $$props.jobName);
    		if ('contentFuan' in $$props) $$invalidate(2, contentFuan = $$props.contentFuan);
    		if ('contentWO' in $$props) $$invalidate(3, contentWO = $$props.contentWO);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		jobName,
    		contentFuan,
    		contentWO,
    		input0_input_handler,
    		input1_input_handler,
    		textarea0_input_handler,
    		textarea1_input_handler
    	];
    }

    class NoteEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			title: 0,
    			jobName: 1,
    			contentFuan: 2,
    			contentWO: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NoteEditor",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console.warn("<NoteEditor> was created without expected prop 'title'");
    		}

    		if (/*jobName*/ ctx[1] === undefined && !('jobName' in props)) {
    			console.warn("<NoteEditor> was created without expected prop 'jobName'");
    		}

    		if (/*contentFuan*/ ctx[2] === undefined && !('contentFuan' in props)) {
    			console.warn("<NoteEditor> was created without expected prop 'contentFuan'");
    		}

    		if (/*contentWO*/ ctx[3] === undefined && !('contentWO' in props)) {
    			console.warn("<NoteEditor> was created without expected prop 'contentWO'");
    		}
    	}

    	get title() {
    		throw new Error("<NoteEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<NoteEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get jobName() {
    		throw new Error("<NoteEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set jobName(value) {
    		throw new Error("<NoteEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contentFuan() {
    		throw new Error("<NoteEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contentFuan(value) {
    		throw new Error("<NoteEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contentWO() {
    		throw new Error("<NoteEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contentWO(value) {
    		throw new Error("<NoteEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const storageKey = "sveltenote/notes";

    const loadNotes = () => {
        const rawNotes = sessionStorage.getItem(storageKey);
        return rawNotes ? JSON.parse(rawNotes) : [];
    };

    const saveNotes = (notes) => {
        sessionStorage.setItem(storageKey, JSON.stringify(notes));
    };

    const addNote = (note) => {
        const currentNotes = loadNotes();
        const newNotes = [...currentNotes, note];
        saveNotes(newNotes);
    };

    const overwriteNote = (index, note) => {
        const currentNotes = loadNotes();
        const newNotes = [...currentNotes];
        newNotes[index] = note;
        saveNotes(newNotes);
    };

    /* src/Add.svelte generated by Svelte v3.42.2 */
    const file$4 = "src/Add.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let noteeditor;
    	let updating_title;
    	let updating_jobName;
    	let updating_contentFuan;
    	let updating_contentWO;
    	let t0;
    	let div0;
    	let button;
    	let t1;
    	let button_disabled_value;
    	let current;
    	let mounted;
    	let dispose;

    	function noteeditor_title_binding(value) {
    		/*noteeditor_title_binding*/ ctx[5](value);
    	}

    	function noteeditor_jobName_binding(value) {
    		/*noteeditor_jobName_binding*/ ctx[6](value);
    	}

    	function noteeditor_contentFuan_binding(value) {
    		/*noteeditor_contentFuan_binding*/ ctx[7](value);
    	}

    	function noteeditor_contentWO_binding(value) {
    		/*noteeditor_contentWO_binding*/ ctx[8](value);
    	}

    	let noteeditor_props = {};

    	if (/*title*/ ctx[0] !== void 0) {
    		noteeditor_props.title = /*title*/ ctx[0];
    	}

    	if (/*jobName*/ ctx[1] !== void 0) {
    		noteeditor_props.jobName = /*jobName*/ ctx[1];
    	}

    	if (/*contentFuan*/ ctx[2] !== void 0) {
    		noteeditor_props.contentFuan = /*contentFuan*/ ctx[2];
    	}

    	if (/*contentWO*/ ctx[3] !== void 0) {
    		noteeditor_props.contentWO = /*contentWO*/ ctx[3];
    	}

    	noteeditor = new NoteEditor({ props: noteeditor_props, $$inline: true });
    	binding_callbacks.push(() => bind(noteeditor, 'title', noteeditor_title_binding));
    	binding_callbacks.push(() => bind(noteeditor, 'jobName', noteeditor_jobName_binding));
    	binding_callbacks.push(() => bind(noteeditor, 'contentFuan', noteeditor_contentFuan_binding));
    	binding_callbacks.push(() => bind(noteeditor, 'contentWO', noteeditor_contentWO_binding));

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(noteeditor.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			button = element("button");
    			t1 = text("FUAN を SHARE する");
    			attr_dev(button, "class", "save svelte-1mpd3iq");
    			button.disabled = button_disabled_value = !/*title*/ ctx[0] || !/*jobName*/ ctx[1] || !/*contentFuan*/ ctx[2] || !/*contentWO*/ ctx[3];
    			add_location(button, file$4, 19, 8, 570);
    			attr_dev(div0, "class", "button-container svelte-1mpd3iq");
    			add_location(div0, file$4, 18, 4, 531);
    			attr_dev(div1, "class", "add svelte-1mpd3iq");
    			add_location(div1, file$4, 16, 0, 379);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(noteeditor, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(button, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onSave*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const noteeditor_changes = {};

    			if (!updating_title && dirty & /*title*/ 1) {
    				updating_title = true;
    				noteeditor_changes.title = /*title*/ ctx[0];
    				add_flush_callback(() => updating_title = false);
    			}

    			if (!updating_jobName && dirty & /*jobName*/ 2) {
    				updating_jobName = true;
    				noteeditor_changes.jobName = /*jobName*/ ctx[1];
    				add_flush_callback(() => updating_jobName = false);
    			}

    			if (!updating_contentFuan && dirty & /*contentFuan*/ 4) {
    				updating_contentFuan = true;
    				noteeditor_changes.contentFuan = /*contentFuan*/ ctx[2];
    				add_flush_callback(() => updating_contentFuan = false);
    			}

    			if (!updating_contentWO && dirty & /*contentWO*/ 8) {
    				updating_contentWO = true;
    				noteeditor_changes.contentWO = /*contentWO*/ ctx[3];
    				add_flush_callback(() => updating_contentWO = false);
    			}

    			noteeditor.$set(noteeditor_changes);

    			if (!current || dirty & /*title, jobName, contentFuan, contentWO*/ 15 && button_disabled_value !== (button_disabled_value = !/*title*/ ctx[0] || !/*jobName*/ ctx[1] || !/*contentFuan*/ ctx[2] || !/*contentWO*/ ctx[3])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(noteeditor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(noteeditor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(noteeditor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Add', slots, []);
    	let title = '';
    	let jobName = '';
    	let contentFuan = '';
    	let contentWO = '';

    	const onSave = () => {
    		addNote({ title, jobName, contentFuan, contentWO });
    		push('/fuanlist');
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Add> was created with unknown prop '${key}'`);
    	});

    	function noteeditor_title_binding(value) {
    		title = value;
    		$$invalidate(0, title);
    	}

    	function noteeditor_jobName_binding(value) {
    		jobName = value;
    		$$invalidate(1, jobName);
    	}

    	function noteeditor_contentFuan_binding(value) {
    		contentFuan = value;
    		$$invalidate(2, contentFuan);
    	}

    	function noteeditor_contentWO_binding(value) {
    		contentWO = value;
    		$$invalidate(3, contentWO);
    	}

    	$$self.$capture_state = () => ({
    		push,
    		NoteEditor,
    		addNote,
    		title,
    		jobName,
    		contentFuan,
    		contentWO,
    		onSave
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('jobName' in $$props) $$invalidate(1, jobName = $$props.jobName);
    		if ('contentFuan' in $$props) $$invalidate(2, contentFuan = $$props.contentFuan);
    		if ('contentWO' in $$props) $$invalidate(3, contentWO = $$props.contentWO);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		jobName,
    		contentFuan,
    		contentWO,
    		onSave,
    		noteeditor_title_binding,
    		noteeditor_jobName_binding,
    		noteeditor_contentFuan_binding,
    		noteeditor_contentWO_binding
    	];
    }

    class Add extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Add",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Edit.svelte generated by Svelte v3.42.2 */
    const file$3 = "src/Edit.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let noteeditor;
    	let updating_title;
    	let updating_content;
    	let t0;
    	let div0;
    	let button;
    	let t1;
    	let button_disabled_value;
    	let current;
    	let mounted;
    	let dispose;

    	function noteeditor_title_binding(value) {
    		/*noteeditor_title_binding*/ ctx[4](value);
    	}

    	function noteeditor_content_binding(value) {
    		/*noteeditor_content_binding*/ ctx[5](value);
    	}

    	let noteeditor_props = {};

    	if (/*title*/ ctx[0] !== void 0) {
    		noteeditor_props.title = /*title*/ ctx[0];
    	}

    	if (/*content*/ ctx[1] !== void 0) {
    		noteeditor_props.content = /*content*/ ctx[1];
    	}

    	noteeditor = new NoteEditor({ props: noteeditor_props, $$inline: true });
    	binding_callbacks.push(() => bind(noteeditor, 'title', noteeditor_title_binding));
    	binding_callbacks.push(() => bind(noteeditor, 'content', noteeditor_content_binding));

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(noteeditor.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			button = element("button");
    			t1 = text("保存");
    			attr_dev(button, "class", "save svelte-1asccat");
    			button.disabled = button_disabled_value = !/*title*/ ctx[0] || !/*content*/ ctx[1];
    			add_location(button, file$3, 21, 4, 549);
    			attr_dev(div0, "class", "button-container svelte-1asccat");
    			add_location(div0, file$3, 20, 4, 514);
    			attr_dev(div1, "class", "add svelte-1asccat");
    			add_location(div1, file$3, 18, 0, 420);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(noteeditor, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(button, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onSave*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const noteeditor_changes = {};

    			if (!updating_title && dirty & /*title*/ 1) {
    				updating_title = true;
    				noteeditor_changes.title = /*title*/ ctx[0];
    				add_flush_callback(() => updating_title = false);
    			}

    			if (!updating_content && dirty & /*content*/ 2) {
    				updating_content = true;
    				noteeditor_changes.content = /*content*/ ctx[1];
    				add_flush_callback(() => updating_content = false);
    			}

    			noteeditor.$set(noteeditor_changes);

    			if (!current || dirty & /*title, content*/ 3 && button_disabled_value !== (button_disabled_value = !/*title*/ ctx[0] || !/*content*/ ctx[1])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(noteeditor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(noteeditor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(noteeditor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Edit', slots, []);
    	let { params = {} } = $$props;
    	const note = loadNotes()[params.id];
    	let title = note.title;
    	let content = note.content;

    	const onSave = () => {
    		overwriteNote(params.id, { title, content });
    		push('/');
    	};

    	const writable_props = ['params'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Edit> was created with unknown prop '${key}'`);
    	});

    	function noteeditor_title_binding(value) {
    		title = value;
    		$$invalidate(0, title);
    	}

    	function noteeditor_content_binding(value) {
    		content = value;
    		$$invalidate(1, content);
    	}

    	$$self.$$set = $$props => {
    		if ('params' in $$props) $$invalidate(3, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		push,
    		NoteEditor,
    		loadNotes,
    		overwriteNote,
    		params,
    		note,
    		title,
    		content,
    		onSave
    	});

    	$$self.$inject_state = $$props => {
    		if ('params' in $$props) $$invalidate(3, params = $$props.params);
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('content' in $$props) $$invalidate(1, content = $$props.content);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		content,
    		onSave,
    		params,
    		noteeditor_title_binding,
    		noteeditor_content_binding
    	];
    }

    class Edit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { params: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Edit",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get params() {
    		throw new Error("<Edit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Edit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/NoteList.svelte generated by Svelte v3.42.2 */
    const file$2 = "src/components/NoteList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (7:4) {#each notes as note,  index}
    function create_each_block(ctx) {
    	let div4;
    	let div0;
    	let span0;
    	let t1;
    	let t2_value = /*note*/ ctx[2].title + "";
    	let t2;
    	let t3;
    	let div1;
    	let span1;
    	let t5;
    	let t6_value = /*note*/ ctx[2].jobName + "";
    	let t6;
    	let t7;
    	let div2;
    	let span2;
    	let t9;
    	let t10_value = /*note*/ ctx[2].contentFuan + "";
    	let t10;
    	let t11;
    	let div3;
    	let span3;
    	let t13;
    	let t14_value = /*note*/ ctx[2].contentWO + "";
    	let t14;
    	let t15;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[1](/*index*/ ctx[4]);
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "Name:";
    			t1 = text("    ");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			span1 = element("span");
    			span1.textContent = "Carrer:";
    			t5 = text("    ");
    			t6 = text(t6_value);
    			t7 = space();
    			div2 = element("div");
    			span2 = element("span");
    			span2.textContent = "Fuan:";
    			t9 = text("    ");
    			t10 = text(t10_value);
    			t11 = space();
    			div3 = element("div");
    			span3 = element("span");
    			span3.textContent = "Working on:";
    			t13 = text("    ");
    			t14 = text(t14_value);
    			t15 = space();
    			set_style(span0, "color", "green");
    			add_location(span0, file$2, 8, 36, 241);
    			attr_dev(div0, "class", "card-title svelte-11hwoia");
    			add_location(div0, file$2, 8, 12, 217);
    			set_style(span1, "color", "green");
    			add_location(span1, file$2, 9, 34, 350);
    			attr_dev(div1, "class", "card-job svelte-11hwoia");
    			add_location(div1, file$2, 9, 12, 328);
    			set_style(span2, "color", "green");
    			add_location(span2, file$2, 10, 42, 471);
    			attr_dev(div2, "class", "card-contentFuan svelte-11hwoia");
    			add_location(div2, file$2, 10, 12, 441);
    			set_style(span3, "color", "green");
    			add_location(span3, file$2, 11, 40, 592);
    			attr_dev(div3, "class", "card-contentWO svelte-11hwoia");
    			add_location(div3, file$2, 11, 12, 564);
    			attr_dev(div4, "class", "card svelte-11hwoia");
    			add_location(div4, file$2, 7, 8, 146);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			append_dev(div4, t3);
    			append_dev(div4, div1);
    			append_dev(div1, span1);
    			append_dev(div1, t5);
    			append_dev(div1, t6);
    			append_dev(div4, t7);
    			append_dev(div4, div2);
    			append_dev(div2, span2);
    			append_dev(div2, t9);
    			append_dev(div2, t10);
    			append_dev(div4, t11);
    			append_dev(div4, div3);
    			append_dev(div3, span3);
    			append_dev(div3, t13);
    			append_dev(div3, t14);
    			append_dev(div4, t15);

    			if (!mounted) {
    				dispose = listen_dev(div4, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*notes*/ 1 && t2_value !== (t2_value = /*note*/ ctx[2].title + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*notes*/ 1 && t6_value !== (t6_value = /*note*/ ctx[2].jobName + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*notes*/ 1 && t10_value !== (t10_value = /*note*/ ctx[2].contentFuan + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*notes*/ 1 && t14_value !== (t14_value = /*note*/ ctx[2].contentWO + "")) set_data_dev(t14, t14_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(7:4) {#each notes as note,  index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let each_value = /*notes*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "note svelte-11hwoia");
    			add_location(div, file$2, 5, 0, 85);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*push, notes*/ 1) {
    				each_value = /*notes*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NoteList', slots, []);
    	let { notes } = $$props;
    	const writable_props = ['notes'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NoteList> was created with unknown prop '${key}'`);
    	});

    	const click_handler = index => push(`/edit/${index}`);

    	$$self.$$set = $$props => {
    		if ('notes' in $$props) $$invalidate(0, notes = $$props.notes);
    	};

    	$$self.$capture_state = () => ({ push, notes });

    	$$self.$inject_state = $$props => {
    		if ('notes' in $$props) $$invalidate(0, notes = $$props.notes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [notes, click_handler];
    }

    class NoteList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { notes: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NoteList",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*notes*/ ctx[0] === undefined && !('notes' in props)) {
    			console.warn("<NoteList> was created without expected prop 'notes'");
    		}
    	}

    	get notes() {
    		throw new Error("<NoteList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notes(value) {
    		throw new Error("<NoteList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/FuanList.svelte generated by Svelte v3.42.2 */
    const file$1 = "src/FuanList.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let notelist;
    	let current;

    	notelist = new NoteList({
    			props: { notes: /*userNotes*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Everyone's FUAN";
    			t1 = space();
    			create_component(notelist.$$.fragment);
    			attr_dev(h1, "class", "list_title svelte-1d1tchq");
    			add_location(h1, file$1, 8, 4, 195);
    			attr_dev(div, "class", "fuanlist svelte-1d1tchq");
    			attr_dev(div, "id", "fuan");
    			add_location(div, file$1, 7, 0, 158);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			mount_component(notelist, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notelist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notelist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(notelist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FuanList', slots, []);
    	const userNotes = loadNotes();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FuanList> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ NoteList, loadNotes, userNotes });
    	return [userNotes];
    }

    class FuanList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FuanList",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.42.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let header;
    	let div2;
    	let div0;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div1;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let a2;
    	let img2;
    	let img2_src_value;
    	let t2;
    	let main;
    	let router;
    	let current;

    	router = new Router({
    			props: { routes: /*routes*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			header = element("header");
    			div2 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			a2 = element("a");
    			img2 = element("img");
    			t2 = space();
    			main = element("main");
    			create_component(router.$$.fragment);
    			if (!src_url_equal(img0.src, img0_src_value = "title.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "moveHome svelte-17u5vq1");
    			add_location(img0, file, 16, 18, 396);
    			attr_dev(a0, "href", "#top");
    			add_location(a0, file, 16, 3, 381);
    			attr_dev(div0, "class", "appTitle svelte-17u5vq1");
    			add_location(div0, file, 15, 2, 355);
    			if (!src_url_equal(img1.src, img1_src_value = "about.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "moveAbout svelte-17u5vq1");
    			add_location(img1, file, 19, 20, 505);
    			attr_dev(a1, "href", "#about");
    			add_location(a1, file, 19, 3, 488);
    			if (!src_url_equal(img2.src, img2_src_value = "fuanlist.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", "moveFuan svelte-17u5vq1");
    			add_location(img2, file, 20, 24, 581);
    			attr_dev(a2, "href", "#/fuanlist");
    			add_location(a2, file, 20, 3, 560);
    			attr_dev(div1, "class", "header_links svelte-17u5vq1");
    			add_location(div1, file, 18, 2, 458);
    			attr_dev(div2, "class", "header_container svelte-17u5vq1");
    			add_location(div2, file, 14, 1, 322);
    			add_location(header, file, 13, 0, 312);
    			attr_dev(main, "class", "svelte-17u5vq1");
    			add_location(main, file, 25, 0, 663);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div2);
    			append_dev(div2, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, a1);
    			append_dev(a1, img1);
    			append_dev(div1, t1);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(router, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(main);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	const routes = {
    		"/": Home,
    		"/add": Add,
    		"/edit/:id": Edit,
    		"/fuanlist": FuanList
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		Home,
    		Add,
    		Edit,
    		FuanList,
    		routes
    	});

    	return [routes];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world'
        }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
