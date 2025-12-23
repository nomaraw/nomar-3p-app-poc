let b;
function z(i) {
  if (b)
    throw new Error("Global Provider is already set");
  b = i;
}
function f(i) {
  if (!b)
    throw new Error(i ?? "Attempted to get Global AmazonConnectProvider that has not been set.");
  return b;
}
class y extends Error {
  constructor({ reason: e, namespace: t, errorKey: n, details: s }) {
    super(`ConnectError with error key "${n}"`), this.errorType = y.ErrorType, this.namespace = t, this.errorKey = n, this.reason = e, this.details = s ?? {};
  }
}
y.ErrorType = "ConnectError";
function v(i) {
  try {
    return structuredClone(i);
  } catch {
    try {
      return JSON.parse(JSON.stringify(i));
    } catch (t) {
      throw new y({
        errorKey: "deepCloneFailed",
        details: {
          actualError: t
        }
      });
    }
  }
}
class L {
  constructor({ provider: e, loggerKey: t }) {
    this.events = /* @__PURE__ */ new Map(), this.logger = new g({
      provider: e,
      source: "emitter",
      mixin: () => ({
        emitterLoggerKey: t
      })
    });
  }
  on(e, t) {
    const n = this.events.get(e);
    n ? n.add(t) : this.events.set(e, /* @__PURE__ */ new Set([t]));
  }
  off(e, t) {
    const n = this.events.get(e);
    n && (n.delete(t), n.size < 1 && this.events.delete(e));
  }
  getHandlers(e) {
    var t;
    return Array.from((t = this.events.get(e)) !== null && t !== void 0 ? t : []);
  }
}
var _ = function(i, e, t, n) {
  function s(r) {
    return r instanceof t ? r : new t(function(o) {
      o(r);
    });
  }
  return new (t || (t = Promise))(function(r, o) {
    function a(c) {
      try {
        l(n.next(c));
      } catch (u) {
        o(u);
      }
    }
    function h(c) {
      try {
        l(n.throw(c));
      } catch (u) {
        o(u);
      }
    }
    function l(c) {
      c.done ? r(c.value) : s(c.value).then(a, h);
    }
    l((n = n.apply(i, e || [])).next());
  });
};
class U extends L {
  emit(e, t) {
    return _(this, void 0, void 0, function* () {
      const n = this.getHandlers(e);
      yield Promise.allSettled(n.map((s) => _(this, void 0, void 0, function* () {
        try {
          yield s(t);
        } catch (r) {
          this.logger.error("An error occurred when invoking event handler", {
            error: r,
            parameter: e
          });
        }
      })));
    });
  }
}
function N(i) {
  const e = new Uint8Array(Math.ceil(i / 2));
  return crypto.getRandomValues(e), Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("").substring(0, i);
}
function x() {
  return "randomUUID" in crypto ? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (i) => {
    const e = parseInt(i);
    return (e ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> e / 4).toString(16);
  });
}
function B(i, e) {
  return {
    request: (t, n) => i.request(e, t, n),
    subscribe: (t, n) => i.subscribe(Object.assign(Object.assign({}, t), { namespace: e }), n),
    unsubscribe: (t, n) => i.unsubscribe(Object.assign(Object.assign({}, t), { namespace: e }), n),
    getProxyInfo: () => ({
      connectionStatus: i.connectionStatus,
      proxyType: i.proxyType
    }),
    onConnectionStatusChange: (t) => i.onConnectionStatusChange(t),
    offConnectionStatusChange: (t) => i.offConnectionStatusChange(t)
  };
}
class F {
  constructor() {
    this.idsByHandler = /* @__PURE__ */ new Map(), this.handlersById = /* @__PURE__ */ new Map();
  }
  add(e) {
    const t = this.idsByHandler.get(e);
    if (t)
      return { handlerId: t };
    const n = x();
    return this.idsByHandler.set(e, n), this.handlersById.set(n, e), { handlerId: n };
  }
  getIdByHandler(e) {
    var t;
    return (t = this.idsByHandler.get(e)) !== null && t !== void 0 ? t : null;
  }
  getHandlerById(e) {
    var t;
    return (t = this.handlersById.get(e)) !== null && t !== void 0 ? t : null;
  }
  get() {
    return [...this.idsByHandler.entries()].map(([e, t]) => ({
      handler: e,
      handlerId: t
    }));
  }
  delete(e) {
    const t = this.idsByHandler.get(e);
    return t && this.handlersById.delete(t), this.idsByHandler.delete(e), { isEmpty: this.idsByHandler.size < 1 };
  }
  size() {
    return this.idsByHandler.size;
  }
}
class q {
  constructor() {
    this.simpleSubscriptions = /* @__PURE__ */ new Map(), this.paramSubscriptions = /* @__PURE__ */ new Map();
  }
  add({ namespace: e, key: t, parameter: n }, s) {
    var r, o, a, h, l;
    if (n) {
      if (!this.paramSubscriptions.has(e)) {
        this.paramSubscriptions.set(e, /* @__PURE__ */ new Map([[t, /* @__PURE__ */ new Map([[n, s]])]]));
        return;
      }
      if (!(!((r = this.paramSubscriptions.get(e)) === null || r === void 0) && r.has(t))) {
        (o = this.paramSubscriptions.get(e)) === null || o === void 0 || o.set(t, /* @__PURE__ */ new Map([[n, s]]));
        return;
      }
      (h = (a = this.paramSubscriptions.get(e)) === null || a === void 0 ? void 0 : a.get(t)) === null || h === void 0 || h.set(n, s);
    } else if (this.simpleSubscriptions.has(e))
      (l = this.simpleSubscriptions.get(e)) === null || l === void 0 || l.set(t, s);
    else {
      this.simpleSubscriptions.set(e, /* @__PURE__ */ new Map([[t, s]]));
      return;
    }
  }
  delete({ namespace: e, key: t, parameter: n }) {
    var s, r, o, a;
    n ? !((r = (s = this.paramSubscriptions.get(e)) === null || s === void 0 ? void 0 : s.get(t)) === null || r === void 0) && r.delete(n) && this.paramSubscriptions.get(e).get(t).size < 1 && ((o = this.paramSubscriptions.get(e)) === null || o === void 0 || o.delete(t), this.paramSubscriptions.get(e).size < 1 && this.paramSubscriptions.delete(e)) : !((a = this.simpleSubscriptions.get(e)) === null || a === void 0) && a.delete(t) && this.simpleSubscriptions.get(e).size < 1 && this.simpleSubscriptions.delete(e);
  }
  get({ namespace: e, key: t, parameter: n }) {
    var s, r, o;
    return n ? (o = (r = this.paramSubscriptions.get(e)) === null || r === void 0 ? void 0 : r.get(t)) === null || o === void 0 ? void 0 : o.get(n) : (s = this.simpleSubscriptions.get(e)) === null || s === void 0 ? void 0 : s.get(t);
  }
  getOrAdd(e, t) {
    let n = this.get(e);
    return n || (n = t(), this.add(e, n)), n;
  }
  addOrUpdate(e, t, n) {
    let s = this.get(e);
    return s ? s = n(s) : s = t(), this.add(e, s), s;
  }
  getAllSubscriptions() {
    const e = Array.from(this.simpleSubscriptions.keys()).flatMap((n) => Array.from(this.simpleSubscriptions.get(n).keys()).flatMap((s) => ({
      namespace: n,
      key: s
    }))), t = Array.from(this.paramSubscriptions.keys()).flatMap((n) => Array.from(this.paramSubscriptions.get(n).keys()).flatMap((s) => Array.from(this.paramSubscriptions.get(n).get(s).keys()).flatMap((r) => ({
      namespace: n,
      key: s,
      parameter: r
    }))));
    return [...e, ...t];
  }
}
class Q {
  constructor() {
    this.subscriptions = new q();
  }
  add(e, t) {
    return this.subscriptions.getOrAdd(e, () => new F()).add(t);
  }
  get(e) {
    var t, n;
    return (n = (t = this.subscriptions.get(e)) === null || t === void 0 ? void 0 : t.get()) !== null && n !== void 0 ? n : [];
  }
  getById(e, t) {
    var n, s;
    return (s = (n = this.subscriptions.get(e)) === null || n === void 0 ? void 0 : n.getHandlerById(t)) !== null && s !== void 0 ? s : null;
  }
  delete(e, t) {
    var n, s;
    (s = (n = this.subscriptions.get(e)) === null || n === void 0 ? void 0 : n.delete(t).isEmpty) !== null && s !== void 0 && s && this.subscriptions.delete(e);
  }
  size(e) {
    var t, n;
    return (n = (t = this.subscriptions.get(e)) === null || t === void 0 ? void 0 : t.size()) !== null && n !== void 0 ? n : 0;
  }
  isEmpty(e) {
    return this.size(e) === 0;
  }
  getAllSubscriptions() {
    return this.subscriptions.getAllSubscriptions();
  }
  getAllSubscriptionHandlerIds() {
    return this.subscriptions.getAllSubscriptions().reduce((e, t) => e.concat(this.get(t).map(({ handlerId: n }) => ({
      topic: t,
      handlerId: n
    }))), []);
  }
}
class K {
  /**
   * Constructor for DurationMetricRecorder
   * @param {(metric: MetricData) => void} sendMetric- The method that sends metric
   * @param {string} metricName - The name of the duration metric
   * @param {Record<string, string>} dimensions - The dimensions of the duration metric with keys and values (optional)
   * @param {Record<string, string>} optionalDimensions - The optional dimensions of the duration metric with keys and values (optional)
   */
  constructor({ sendMetric: e, metricName: t, metricOptions: n }) {
    this.unit = "Milliseconds", this.sendMetric = e, this.startTime = performance.now(), this.metricName = t, this.dimensions = n != null && n.dimensions ? n.dimensions : {}, this.optionalDimensions = n != null && n.optionalDimensions ? n.optionalDimensions : {};
  }
  /**
   * Stop recording of the duration metric and emit it
   * @returns {durationCount: number} - The duration being recorded
   */
  stopDurationCounter() {
    const e = Math.round(performance.now() - this.startTime);
    return this.sendMetric({
      metricName: this.metricName,
      unit: this.unit,
      value: e,
      dimensions: this.dimensions,
      optionalDimensions: this.optionalDimensions
    }), { duration: e };
  }
}
const $ = 30;
function G(i, e) {
  if (Object.keys(i).length + Object.keys(e ?? {}).length > $)
    throw new Error("Cannot add more than 30 dimensions to a metric");
}
function V({ metricData: i, time: e, namespace: t }, n) {
  var s, r;
  return {
    type: "metric",
    namespace: t,
    metricName: i.metricName,
    unit: i.unit,
    value: i.value,
    time: e,
    dimensions: (s = i.dimensions) !== null && s !== void 0 ? s : {},
    optionalDimensions: (r = i.optionalDimensions) !== null && r !== void 0 ? r : {},
    messageOrigin: n
  };
}
class O {
  /**
   * Constructor for ConnectMetricRecorder
   * @param {ConnectRecorderMetricParams} params - The namespace and provider(optional)
   */
  constructor(e) {
    this._proxy = null, this.namespace = e.namespace, e.provider && typeof e.provider == "function" ? this.providerFactory = e.provider : this.provider = e.provider;
  }
  /**
   * Emit a metric that counts success
   * @param {string} metricName - The name of the metric
   * @param {Record<string, string>} dimensions - The dimensions of a metric with keys and values (optional)
   * @param {Record<string, string>} optionalDimensions - The optional dimensions of a metric with keys and values (optional)
   */
  recordSuccess(e, t) {
    var n;
    const s = Object.assign({}, (n = t == null ? void 0 : t.dimensions) !== null && n !== void 0 ? n : {}), r = Object.assign(Object.assign({}, t), { dimensions: s });
    this.recordCount(e, 0, r);
  }
  /**
   * Emit a metric that counts error. Add default dimension { name: "Metric", value: "Error" } to the metric if not added
   * @param {string} metricName - The name of the metric
   * @param {Record<string, string>} dimensions - The dimensions of a metric with keys and values (optional)
   * @param {Record<string, string>} optionalDimensions - The optional dimensions of a metric with keys and values (optional)
   */
  recordError(e, t) {
    var n;
    const s = Object.assign({}, (n = t == null ? void 0 : t.dimensions) !== null && n !== void 0 ? n : {}), r = Object.assign(Object.assign({}, t), { dimensions: s });
    this.recordCount(e, 1, r);
  }
  /**
   * Emit a counting metric
   * @param {string} metricName - The name of the metric
   * @param {number} count - The count of the metric
   * @param {Record<string, string>} dimensions - The dimensions of a metric with keys and values (optional)
   * @param {Record<string, string>} optionalDimensions - The optional dimensions of a metric with keys and values (optional)
   */
  recordCount(e, t, n) {
    this.sendMetric({
      metricName: e,
      unit: "Count",
      value: t,
      dimensions: n == null ? void 0 : n.dimensions,
      optionalDimensions: n == null ? void 0 : n.optionalDimensions
    });
  }
  /**
   * Start a duration metric
   * @param {string} metricName - The name of the metric
   * @param {Record<string, string>} dimensions - The dimensions of a metric with keys and values (optional)
   * @param {Record<string, string>} optionalDimensions - The optional dimensions of a metric with keys and values (optional)
   * @returns {DurationMetricRecorder} - The DurationMetricRecorder object being created
   */
  startDurationCounter(e, t) {
    return new K({
      sendMetric: this.sendMetric.bind(this),
      metricName: e,
      metricOptions: t
    });
  }
  /**
   * Emit metric
   * @param {string} metricName - The name of the metric
   * @param {unit} unit - The unit of the metric
   * @param {number} value - The value of the metric
   * @param {Record<string, string>} dimensions - The dimensions of a metric with keys and values (optional)
   * @param {Record<string, string>} optionalDimensions - The optional dimensions of a metric with keys and values (optional)
   */
  sendMetric({ metricName: e, unit: t, value: n, dimensions: s, optionalDimensions: r }) {
    s && G(s, r);
    const o = {
      metricName: e,
      unit: t,
      value: n,
      dimensions: s,
      optionalDimensions: r
    }, a = /* @__PURE__ */ new Date();
    this.getProxy().sendMetric({
      metricData: o,
      time: a,
      namespace: this.namespace
    });
  }
  /**
   * Get the provider of the ConnectMetricRecorder instance
   */
  getProvider() {
    return this.provider || (this.provider = this.providerFactory ? this.providerFactory() : f()), this.provider;
  }
  /**
   * Get the proxy of the ConnectMetricRecorder instance
   */
  getProxy() {
    return this._proxy || (this._proxy = this.getProvider().getProxy()), this._proxy;
  }
}
const J = "clientTimeout";
function W(i, e) {
  const { namespace: t, command: n, data: s } = i;
  return {
    namespace: t,
    reason: "Client Timeout",
    details: {
      command: n,
      requestData: s,
      timeoutMs: e
    },
    errorKey: J
  };
}
const X = 30 * 1e3;
function Y(i, e, t, n) {
  const s = Math.max(1, X);
  return new Promise((r, o) => {
    let a = !1;
    const h = setTimeout(() => {
      t({ timeoutMs: s, request: i }), o(W(i, s)), a = !0;
    }, s);
    e((c) => {
      clearTimeout(h), a || (c.isError ? o(new y(c)) : r(c.data));
    });
  });
}
class Z {
  constructor(e) {
    this.requestMap = /* @__PURE__ */ new Map(), this.logger = new g({
      provider: e,
      source: "core.requestManager"
    });
  }
  processRequest(e) {
    const { requestId: t } = e;
    return Y(e, (n) => this.requestMap.set(t, n), ({ request: n, timeoutMs: s }) => this.handleTimeout(n, s));
  }
  processResponse(e) {
    const { requestId: t } = e, n = this.requestMap.get(t);
    if (!n) {
      this.logger.error("Returned a response message with no handler", {
        message: e
      });
      return;
    }
    n(e), this.requestMap.delete(t);
  }
  handleTimeout(e, t) {
    const { requestId: n, namespace: s, command: r } = e;
    this.requestMap.delete(n), this.logger.error("Client request timeout", {
      requestId: n,
      namespace: s,
      command: r,
      timeoutMs: t
    });
  }
}
function ee(i, e, t, n) {
  const s = x();
  return {
    type: "request",
    namespace: i,
    command: e,
    requestId: s,
    data: t,
    messageOrigin: n
  };
}
var A = function(i, e) {
  var t = {};
  for (var n in i) Object.prototype.hasOwnProperty.call(i, n) && e.indexOf(n) < 0 && (t[n] = i[n]);
  if (i != null && typeof Object.getOwnPropertySymbols == "function")
    for (var s = 0, n = Object.getOwnPropertySymbols(i); s < n.length; s++)
      e.indexOf(n[s]) < 0 && Object.prototype.propertyIsEnumerable.call(i, n[s]) && (t[n[s]] = i[n[s]]);
  return t;
};
function M(i) {
  try {
    switch (i.type) {
      case "acknowledge":
      case "error":
      case "childConnectionClose":
        return i;
      case "childDownstreamMessage":
        return Object.assign(Object.assign({}, i), { message: M(i.message) });
      case "publish": {
        const { data: e } = i, t = A(i, ["data"]);
        return Object.assign({}, t);
      }
      case "response": {
        if (i.isError)
          return Object.assign(Object.assign({}, i), { details: { command: i.details.command } });
        {
          const { data: e } = i, t = A(i, ["data"]);
          return Object.assign({}, t);
        }
      }
      default:
        return i;
    }
  } catch (e) {
    return {
      messageDetails: "error when sanitizing downstream message",
      message: i,
      error: e
    };
  }
}
class te {
  constructor(e, t) {
    this.provider = e, this.relayChildUpstreamMessage = t, this.channels = /* @__PURE__ */ new Map(), this.logger = new g({
      provider: e,
      source: "childConnectionManager"
    });
  }
  /**
   * Adds a new communication channel for a child entity.
   *
   * Supports both iframe and component channel types. For iframe channels,
   * sets up message event listeners and starts the port. For component channels,
   * configures the upstream message handler. Both types send a "childConnectionReady"
   * message upstream to notify the proxy that the channel is established.
   *
   * @param params - Channel configuration parameters
   * @param params.connectionId - UUID identifier for this channel connection
   * @param params.providerId - UUID of the provider that owns this channel
   * @param params.type - Channel type: "iframe" or "component"
   *
   * @example Iframe Channel
   * ```typescript
   * const { port1, port2 } = new MessageChannel();
   * channelManager.addChannel({
   *   connectionId: "550e8400-e29b-41d4-a716-446655440000",
   *   providerId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
   *   type: "iframe",
   *   port: port1
   * });
   * ```
   *
   * @example Component Channel
   * ```typescript
   * channelManager.addChannel({
   *   connectionId: "550e8400-e29b-41d4-a716-446655440001",
   *   providerId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
   *   type: "component",
   *   sendDownstreamMessage: (msg) => childEntity.receive(msg),
   *   setUpstreamMessageHandler: (handler) => childEntity.onUpstream = handler
   * });
   * ```
   */
  addChannel(e) {
    const { connectionId: t } = e;
    if (this.channels.has(t)) {
      this.logger.error("Attempted to add child connection that already exists. No action", {
        connectionId: t
      });
      return;
    }
    e.type === "iframe" ? this.setupIframe(e) : this.setupComponent(e), this.logger.debug("Child channel added", {
      connectionId: t,
      type: e.type
    });
  }
  /**
   * Updates an existing MessagePort channel with a new MessagePort.
   *
   * This method is only applicable to MessagePort channels. Direct channels cannot
   * be updated and will result in an error. The old MessagePort is properly cleaned up
   * (event listeners removed, port closed) before the new port is configured.
   *
   * @param params - Update parameters
   * @param params.connectionId - UUID identifier for the channel to update
   * @param params.port - New MessagePort instance to replace the existing one
   * @param params.providerId - UUID of the provider that owns this channel
   *
   * @throws Logs error if connectionId doesn't exist or channel is Direct type
   *
   * @example
   * ```typescript
   * const { port1, port2 } = new MessageChannel();
   * channelManager.updateChannelPort({
   *   connectionId: "550e8400-e29b-41d4-a716-446655440000",
   *   port: port1,
   *   providerId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
   * });
   * ```
   */
  updateChannelPort(e) {
    const { connectionId: t } = e, n = this.channels.get(t);
    if (!n) {
      this.logger.error("Attempted to update child connection that does not exist No action", {
        connectionId: t
      });
      return;
    }
    if (n.type === "component") {
      this.logger.error("Attempted to update a component channel connection as MessagePort. This is not supported.", {
        connectionId: t
      });
      return;
    }
    const s = n;
    s.port.onmessage = null, s.port.close();
    const r = Object.assign(Object.assign({}, e), { type: "iframe" });
    this.setupIframe(r), this.logger.info("Updated child port", { connectionId: t });
  }
  setupIframe(e) {
    const { connectionId: t, port: n, providerId: s } = e, r = this.createMessageHandler(t, s);
    n.addEventListener("message", r), n.start(), this.channels.set(t, {
      type: "iframe",
      port: n,
      handler: r,
      providerId: s
    }), this.relayChildUpstreamMessage({
      type: "childUpstream",
      connectionId: t,
      sourceProviderId: s,
      parentProviderId: this.provider.id,
      message: {
        type: "childConnectionReady"
      }
    });
  }
  setupComponent(e) {
    const { connectionId: t, providerId: n, sendDownstreamMessage: s, setUpstreamMessageHandler: r } = e;
    r((a) => {
      this.relayChildUpstreamMessage({
        type: "childUpstream",
        sourceProviderId: n,
        parentProviderId: this.provider.id,
        connectionId: t,
        message: a
      });
    }), this.channels.set(t, {
      type: "component",
      providerId: n,
      sendDownstreamMessage: s,
      setUpstreamMessageHandler: r
    }), this.relayChildUpstreamMessage({
      type: "childUpstream",
      connectionId: t,
      sourceProviderId: n,
      parentProviderId: this.provider.id,
      message: {
        type: "childConnectionReady"
      }
    });
  }
  /**
   * Routes a downstream message from the proxy to the appropriate child channel.
   *
   * Validates that the target channel exists and that the provider ID matches
   * (for security). For MessagePort channels, uses postMessage(). For Direct
   * channels, calls the sendDownstreamMessage function.
   *
   * @param params - Downstream message parameters
   * @param params.connectionId - UUID of the target channel
   * @param params.message - The message to send to the child entity
   * @param params.targetProviderId - Expected provider ID for validation
   *
   * @example
   * ```typescript
   * channelManager.handleDownstreamMessage({
   *   connectionId: "550e8400-e29b-41d4-a716-446655440000",
   *   message: { type: "request", data: "some data" },
   *   targetProviderId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
   * });
   * ```
   */
  handleDownstreamMessage({ connectionId: e, message: t, targetProviderId: n }) {
    const s = this.channels.get(e);
    if (!s) {
      this.logger.warn("Attempted to route downstream message to child channel that does not exist", { connectionId: e, message: M(t) });
      return;
    }
    const { providerId: r } = s;
    if (r && r !== n) {
      this.logger.error("Downstream target message did not match target provider id. Not sending message.", {
        connectionId: e,
        targetProviderId: n,
        actualProviderId: r,
        message: M(t)
      });
      return;
    }
    s.type === "iframe" ? s.port.postMessage(t) : s.sendDownstreamMessage(t);
  }
  /**
   * Handles closing a child channel and performs appropriate cleanup.
   *
   * For MessagePort channels, removes event listeners and closes the port.
   * For Direct channels, simply removes the channel from the internal map
   * since no port cleanup is needed. The channel is always removed from
   * the channels map regardless of type.
   *
   * @param params - Close message parameters
   * @param params.connectionId - UUID of the channel to close
   *
   * @example
   * ```typescript
   * channelManager.handleCloseMessage({
   *   connectionId: "550e8400-e29b-41d4-a716-446655440000"
   * });
   * ```
   */
  handleCloseMessage({ connectionId: e }) {
    const t = this.channels.get(e);
    if (!t) {
      this.logger.warn("Attempted to close child channel that was not found", {
        connectionId: e
      });
      return;
    }
    if (t.type === "iframe") {
      const { port: n, handler: s } = t;
      n.removeEventListener("message", s), n.close();
    }
    this.channels.delete(e), this.logger.debug("Removed child channel", {
      connectionId: e,
      type: t.type
    });
  }
  createMessageHandler(e, t) {
    return (n) => this.relayChildUpstreamMessage({
      type: "childUpstream",
      sourceProviderId: t,
      parentProviderId: this.provider.id,
      connectionId: e,
      message: n.data
    });
  }
}
class ne {
  constructor(e) {
    this.errorHandlers = /* @__PURE__ */ new Set(), this.logger = new g({
      provider: e,
      source: "core.proxy.error"
    });
  }
  invoke(e) {
    const { message: t, key: n, details: s, isFatal: r, connectionStatus: o } = e;
    this.logger.error(t, {
      key: n,
      details: s,
      isFatal: r,
      connectionStatus: o
    }, { duplicateMessageToConsole: !0, remoteIgnore: !0 }), [...this.errorHandlers].forEach((a) => {
      try {
        a(e);
      } catch (h) {
        this.logger.error("An error occurred within a AmazonConnectErrorHandler", {
          handlerError: h,
          originalError: e
        });
      }
    });
  }
  onError(e) {
    this.errorHandlers.add(e);
  }
  offError(e) {
    this.errorHandlers.delete(e);
  }
}
class p {
  constructor({ provider: e, sendHealthCheck: t, getUpstreamMessageOrigin: n }) {
    this.connectionId = null, this.healthCheckInterval = null, this.healthCheckTimeout = null, this.sendHealthCheck = t, this.getUpstreamMessageOrigin = n, this.sendHealthCheckInterval = null, this.lastHealthCheckResponse = null, this._status = "unknown", this.logger = new g({
      source: "core.proxy.health-check",
      provider: e,
      mixin: () => ({
        connectionId: this.connectionId
      })
    }), this.events = new U({
      provider: e,
      loggerKey: "core.proxy.health-check"
    });
  }
  get status() {
    return this._status;
  }
  get isRunning() {
    return this.sendHealthCheckInterval !== null;
  }
  get lastCheckCounter() {
    var e, t;
    return (t = (e = this.lastHealthCheckResponse) === null || e === void 0 ? void 0 : e.counter) !== null && t !== void 0 ? t : null;
  }
  get lastCheckTime() {
    var e, t;
    return (t = (e = this.lastHealthCheckResponse) === null || e === void 0 ? void 0 : e.time) !== null && t !== void 0 ? t : null;
  }
  start({ healthCheckInterval: e, connectionId: t }) {
    if (this.connectionId = t, this.healthCheckInterval = e, this.clearInterval(), e <= 0) {
      this.logger.debug("Health check disabled");
      return;
    }
    if (e < 1e3) {
      this.logger.error("Health check interval is less than 1 second. Not running", { interval: e });
      return;
    }
    this.sendHealthCheckMessage(), this.sendHealthCheckInterval = setInterval(() => this.sendHealthCheckMessage(), e), this.startTimeout();
  }
  stop() {
    this.clearInterval(), this.clearTimeout();
  }
  handleResponse(e) {
    this.setHealthy({
      time: e.time,
      counter: e.counter
    });
  }
  sendHealthCheckMessage() {
    this.sendHealthCheck({
      type: "healthCheck",
      messageOrigin: this.getUpstreamMessageOrigin()
    });
  }
  startTimeout() {
    if (!this.healthCheckInterval) {
      this.logger.error("Health check interval not set. Cannot start timeout");
      return;
    }
    this.clearTimeout(), this.healthCheckTimeout = setTimeout(() => {
      this.setUnhealthy();
    }, this.healthCheckInterval * 3);
  }
  clearInterval() {
    this.sendHealthCheckInterval && (clearInterval(this.sendHealthCheckInterval), this.sendHealthCheckInterval = null);
  }
  clearTimeout() {
    this.healthCheckTimeout && (clearTimeout(this.healthCheckTimeout), this.healthCheckTimeout = null);
  }
  setUnhealthy() {
    if (this._status !== "unhealthy") {
      const e = this._status;
      this.logger.info("Connection unhealthy", {
        previousStatus: e
      }), this._status = "unhealthy", this.emitStatusChanged("unhealthy", e);
    }
  }
  setHealthy(e) {
    if (this.lastHealthCheckResponse = Object.assign({}, e), this._status !== "healthy") {
      const t = this._status;
      this.logger.debug("Connection healthy", {
        previousStatus: t
      }), this._status = "healthy", this.emitStatusChanged("healthy", t);
    }
    this.startTimeout();
  }
  emitStatusChanged(e, t) {
    var n, s, r, o;
    this.events.emit(p.statusChangedKey, {
      status: e,
      previousStatus: t,
      lastCheckTime: (s = (n = this.lastHealthCheckResponse) === null || n === void 0 ? void 0 : n.time) !== null && s !== void 0 ? s : null,
      lastCheckCounter: (o = (r = this.lastHealthCheckResponse) === null || r === void 0 ? void 0 : r.counter) !== null && o !== void 0 ? o : null
    });
  }
  onStatusChanged(e) {
    this.events.on(p.statusChangedKey, e);
  }
  offStatusChanged(e) {
    this.events.off(p.statusChangedKey, e);
  }
}
p.statusChangedKey = "statusChanged";
class se {
  constructor(e) {
    this.status = "notConnected", this.changeHandlers = /* @__PURE__ */ new Set(), this.logger = new g({
      source: "core.proxy.connection-status-manager",
      provider: e,
      mixin: () => ({ status: this.status })
    });
  }
  getStatus() {
    return this.status;
  }
  update(e) {
    this.status = e.status, this.logger.trace("Proxy Connection Status Changed", {
      status: e.status
    }), [...this.changeHandlers].forEach((t) => {
      try {
        t(e);
      } catch (n) {
        this.logger.error("An error occurred within a ProxyConnectionChangedHandler", { error: n });
      }
    });
  }
  onChange(e) {
    this.changeHandlers.add(e);
  }
  offChange(e) {
    this.changeHandlers.delete(e);
  }
}
var ie = function(i, e, t, n) {
  function s(r) {
    return r instanceof t ? r : new t(function(o) {
      o(r);
    });
  }
  return new (t || (t = Promise))(function(r, o) {
    function a(c) {
      try {
        l(n.next(c));
      } catch (u) {
        o(u);
      }
    }
    function h(c) {
      try {
        l(n.throw(c));
      } catch (u) {
        o(u);
      }
    }
    function l(c) {
      c.done ? r(c.value) : s(c.value).then(a, h);
    }
    l((n = n.apply(i, e || [])).next());
  });
}, re = function(i, e) {
  var t = {};
  for (var n in i) Object.prototype.hasOwnProperty.call(i, n) && e.indexOf(n) < 0 && (t[n] = i[n]);
  if (i != null && typeof Object.getOwnPropertySymbols == "function")
    for (var s = 0, n = Object.getOwnPropertySymbols(i); s < n.length; s++)
      e.indexOf(n[s]) < 0 && Object.prototype.propertyIsEnumerable.call(i, n[s]) && (t[n[s]] = i[n[s]]);
  return t;
};
class oe {
  constructor(e) {
    this.provider = e, this.logger = new g({
      source: "core.proxy",
      provider: e,
      mixin: () => ({
        proxyType: this.proxyType,
        connectionId: this.connectionId
      })
    }), this.requestManager = new Z(e), this.status = new se(e), this.errorService = new ne(e), this.upstreamMessageQueue = [], this.connectionEstablished = !1, this.isInitialized = !1, this.subscriptions = new Q(), this.connectionId = null, this.channelManager = new te(e, this.sendOrQueueMessageToSubject.bind(this)), this.healthCheck = new p({
      provider: e,
      sendHealthCheck: this.sendOrQueueMessageToSubject.bind(this),
      getUpstreamMessageOrigin: this.getUpstreamMessageOrigin.bind(this)
    });
  }
  init() {
    if (this.isInitialized)
      throw new Error("Proxy already initialized");
    this.isInitialized = !0, this.initProxy();
  }
  request(e, t, n, s) {
    const r = ee(e, t, n, s ?? this.getUpstreamMessageOrigin()), o = this.requestManager.processRequest(r);
    return this.sendOrQueueMessageToSubject(r), o;
  }
  subscribe(e, t, n) {
    const { handlerId: s } = this.subscriptions.add(e, t), r = {
      type: "subscribe",
      topic: e,
      messageOrigin: n ?? this.getUpstreamMessageOrigin(),
      handlerId: s
    };
    this.sendOrQueueMessageToSubject(r);
  }
  unsubscribe(e, t, n) {
    if (this.subscriptions.delete(e, t), this.subscriptions.isEmpty(e)) {
      const s = {
        type: "unsubscribe",
        topic: e,
        messageOrigin: n ?? this.getUpstreamMessageOrigin()
      };
      this.sendOrQueueMessageToSubject(s);
    }
  }
  log(e) {
    const t = le(e, this.addContextToLogger(), this.getUpstreamMessageOrigin());
    this.sendOrQueueMessageToSubject(t);
  }
  sendLogMessage(e) {
    if (e.type !== "log") {
      this.logger.error("Attempted to send invalid log message", {
        message: e
      });
      return;
    }
    e.context = Object.assign(Object.assign({}, e.context), this.addContextToLogger()), this.sendOrQueueMessageToSubject(e);
  }
  sendMetric({ metricData: e, time: t, namespace: n }) {
    const s = V({
      metricData: e,
      time: t,
      namespace: n
    }, this.getUpstreamMessageOrigin());
    this.sendOrQueueMessageToSubject(s);
  }
  sendMetricMessage(e) {
    if (e.type !== "metric") {
      this.logger.error("Attempted to send invalid metric message", {
        metricMessage: e
      });
      return;
    }
    this.sendOrQueueMessageToSubject(e);
  }
  sendOrQueueMessageToSubject(e) {
    this.connectionEstablished ? this.sendMessageToSubject(e) : this.upstreamMessageQueue.push(e);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  consumerMessageHandler(e) {
    if (!this.isInitialized) {
      this.logger.error("Attempted to process message from subject prior to proxy being initializing. Message not processed", { originalMessageEventData: e.data });
      return;
    }
    const { data: t } = e;
    if (!("type" in t)) {
      this.logger.warn("Unknown inbound message", {
        originalMessageEventData: t
      });
      return;
    }
    const n = t;
    this.handleMessageFromSubject(n);
  }
  handleMessageFromSubject(e) {
    this.handleDefaultMessageFromSubject(e);
  }
  handleDefaultMessageFromSubject(e) {
    switch (e.type) {
      case "acknowledge":
        this.handleConnectionAcknowledge(e);
        break;
      case "response":
        this.handleResponse(e);
        break;
      case "publish":
        this.handlePublish(e);
        break;
      case "error":
        this.handleError(e);
        break;
      case "childDownstreamMessage":
        this.channelManager.handleDownstreamMessage(e);
        break;
      case "childConnectionClose":
        this.channelManager.handleCloseMessage(e);
        break;
      case "healthCheckResponse":
        this.healthCheck.handleResponse(e);
        break;
      default:
        this.logger.error("Unknown inbound message", {
          originalMessageEventData: e
        });
        return;
    }
  }
  handleConnectionAcknowledge(e) {
    for (this.connectionId = e.connectionId, this.logger.debug("Connection acknowledged by subject", {
      connectionId: e.connectionId,
      queuedMessageCount: this.upstreamMessageQueue.length,
      status: e.status
    }), this.status.update({
      status: "ready",
      connectionId: e.connectionId
    }), this.connectionEstablished = !0; this.upstreamMessageQueue.length; ) {
      const t = this.upstreamMessageQueue.shift();
      this.sendMessageToSubject(t);
    }
    this.healthCheck.start(e), this.logger.debug("Proxy connection ready", {
      connectionId: this.connectionId
    });
  }
  handleResponse(e) {
    this.requestManager.processResponse(e);
  }
  handlePublish(e) {
    const { handlerId: t, topic: n } = e;
    if (t) {
      const s = this.subscriptions.getById(n, t);
      s && this.handleAsyncSubscriptionHandlerInvoke({ handler: s, handlerId: t }, e);
    } else
      this.subscriptions.get(n).map((s) => void this.handleAsyncSubscriptionHandlerInvoke(s, e));
  }
  handleError(e) {
    if (e.isFatal) {
      const { message: t, type: n } = e, s = re(e, ["message", "type"]);
      this.status.update({ status: "error", reason: t, details: s });
    }
    this.publishError({
      message: e.message,
      key: e.key,
      details: e.details,
      isFatal: e.isFatal,
      proxyStatus: e.status
    });
  }
  publishError(e) {
    const t = Object.assign(Object.assign({}, e), { connectionStatus: this.connectionStatus });
    this.errorService.invoke(t);
  }
  handleAsyncSubscriptionHandlerInvoke(e, t) {
    return ie(this, arguments, void 0, function* ({ handler: n, handlerId: s }, { topic: r, data: o }) {
      try {
        yield n(o);
      } catch (a) {
        this.logger.error("An error occurred when handling subscription", {
          topic: r,
          error: a,
          handlerId: s
        });
      }
    });
  }
  get connectionStatus() {
    return this.status.getStatus();
  }
  onError(e) {
    this.errorService.onError(e);
  }
  offError(e) {
    this.errorService.offError(e);
  }
  onConnectionStatusChange(e) {
    this.status.onChange(e);
  }
  offConnectionStatusChange(e) {
    this.status.offChange(e);
  }
  onHealthCheckStatusChanged(e) {
    this.healthCheck.onStatusChanged(e);
  }
  offHealthCheckStatusChanged(e) {
    this.healthCheck.offStatusChanged(e);
  }
  /**
   * @deprecated Use addChildIframeChannel instead. This method will be removed in a future version.
   */
  addChildChannel(e) {
    this.addChildIframeChannel(e);
  }
  /**
   * Adds a component-based child channel to the proxy.
   *
   * This method establishes a communication channel using component function calls instead
   * of MessagePorts. This is useful when both the proxy and child entity exist in the same
   * execution context, such as within the same browser window or iframe.
   *
   * Component channels provide better performance than iframe channels since they avoid
   * the overhead of serialization and can support synchronous communication patterns.
   *
   * @param params - Component channel configuration
   * @param params.connectionId - UUID identifier for this channel connection
   * @param params.providerId - UUID of the provider that owns this channel
   * @param params.sendDownstreamMessage - Function to send messages to the child entity
   * @param params.setUpstreamMessageHandler - Function to register upstream message handler
   *
   * @example
   * ```typescript
   * proxy.addChildComponentChannel({
   *   connectionId: "child-uuid",
   *   providerId: "provider-uuid",
   *   sendDownstreamMessage: (message) => childComponent.receive(message),
   *   setUpstreamMessageHandler: (handler) => childComponent.onUpstream = handler
   * });
   * ```
   */
  addChildIframeChannel(e) {
    this.channelManager.addChannel(Object.assign(Object.assign({}, e), { type: "iframe" }));
  }
  /**
   * Adds a component-based child channel for communication with child entities.
   *
   * This method establishes a communication channel using direct function calls instead
   * of MessagePorts. This is useful when both the proxy and child entity exist in the same
   * execution context and can directly reference each other's functions.
   *
   * @param params - Configuration parameters for the component function channel
   * @param params.connectionId - Unique UUID identifier for this channel connection
   * @param params.providerId - UUID of the provider that owns this channel connection
   * @param params.sendDownstreamMessage - Function to send messages from proxy to child entity
   * @param params.setUpstreamMessageHandler - Function to register handler for messages from child entity
   *
   * @example
   * ```typescript
   * // Child entity exposes these functions
   * const childAPI = {
   *   receive: (message) => { },
   *   onUpstream: null as ((message) => void) | null
   * };
   *
   * proxy.addChildComponentChannel({
   *   connectionId: "550e8400-e29b-41d4-a716-446655440001", // UUID
   *   providerId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8", // UUID
   *   sendDownstreamMessage: (message) => {
   *     childAPI.receive(message);
   *   },
   *   setUpstreamMessageHandler: (handler) => {
   *     childAPI.onUpstream = handler;
   *   }
   * });
   * ```
   */
  addChildComponentChannel(e) {
    this.channelManager.addChannel(Object.assign(Object.assign({}, e), { type: "component" }));
  }
  /**
   * Updates an existing iframe channel with a new MessagePort.
   *
   * This method is only applicable to iframe channels. Component channels cannot
   * be updated and will result in an error. The old MessagePort is properly cleaned up
   * (event listeners removed, port closed) before the new port is configured.
   *
   * @param params - Update parameters
   * @param params.connectionId - UUID identifier for the channel to update
   * @param params.port - New MessagePort instance to replace the existing one
   * @param params.providerId - UUID of the provider that owns this channel
   *
   * @example
   * ```typescript
   * const { port1, port2 } = new MessageChannel();
   * proxy.updateChildIframeChannelPort({
   *   connectionId: "550e8400-e29b-41d4-a716-446655440000",
   *   port: port1,
   *   providerId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
   * });
   * ```
   */
  updateChildIframeChannelPort(e) {
    this.channelManager.updateChannelPort(e);
  }
  /**
   * @deprecated Use updateChildIframeChannelPort instead. This method will be removed in a future version.
   */
  updateChildChannelPort(e) {
    this.updateChildIframeChannelPort(e);
  }
  getConnectionId() {
    return this.connectionId ? Promise.resolve(this.connectionId) : new Promise((e, t) => {
      let n;
      const s = (r) => {
        r.status === "ready" && (this.offConnectionStatusChange(s), clearInterval(n), e(r.connectionId));
      };
      n = setTimeout(() => {
        this.logger.error("Timeout getting connection id"), this.offConnectionStatusChange(s), t(new Error("Timeout getting connectionId"));
      }, 10 * 1e3), this.onConnectionStatusChange(s);
    });
  }
  resetConnection(e) {
    this.logger.debug("Resetting connection", {
      reason: e,
      connectionId: this.connectionId
    }), this.connectionEstablished = !1, this.status.update({
      status: "reset",
      reason: e
    });
    const { subscriptionHandlerCount: t } = this.restoreAllHandler();
    this.logger.info("Resetting proxy", {
      reason: e,
      subscriptionHandlerCount: t
    }), this.logger.debug("Connection reset complete, restoring handlers", {
      subscriptionHandlerCount: t
    });
  }
  restoreAllHandler() {
    var e;
    const t = this.subscriptions.getAllSubscriptionHandlerIds();
    return t == null || t.map(({ topic: n, handlerId: s }) => ({
      type: "subscribe",
      topic: n,
      messageOrigin: this.getUpstreamMessageOrigin(),
      handlerId: s
    })).forEach((n) => this.sendOrQueueMessageToSubject(n)), { subscriptionHandlerCount: (e = t == null ? void 0 : t.length) !== null && e !== void 0 ? e : -1 };
  }
  unsubscribeAllHandlers() {
    var e;
    const t = this.subscriptions.getAllSubscriptionHandlerIds();
    this.logger.info("Unsubscribing all handlers from proxy", {
      subscriptionHandlerCount: (e = t == null ? void 0 : t.length) !== null && e !== void 0 ? e : -1
    }), t == null || t.map(({ topic: n }) => ({
      type: "unsubscribe",
      topic: n,
      messageOrigin: this.getUpstreamMessageOrigin()
    })).forEach((n) => this.sendOrQueueMessageToSubject(n));
  }
}
class k {
  constructor(e, t) {
    this.timeoutMs = t, this.onCancelled = e, this.timeout = setTimeout(() => this.handleCancel(), this.timeoutMs), this.status = "running", this.logger = new g({
      source: "core.utility.timeout-tracker",
      mixin: () => ({
        timeoutMs: this.timeoutMs,
        timeoutTrackerStatus: this.status
      })
    });
  }
  static start(e, t) {
    return new k(e, t);
  }
  complete() {
    switch (this.status) {
      case "running":
        return this.handleComplete();
      case "completed":
        return this.logger.debug("TimeoutTracker already marked complete. No action."), !0;
      case "cancelled":
        return this.logger.info("Attempted to complete a TimeoutTracker that has already been cancelled"), !1;
    }
  }
  isCancelled() {
    return this.status === "cancelled";
  }
  getStatus() {
    return this.status;
  }
  handleCancel() {
    switch (this.status) {
      case "running":
        this.status = "cancelled", this.logger.info("TimeoutTracker has timed out. Invoking onCancelled Handler"), this.invokeOnCancelled();
        break;
      case "completed":
        this.logger.debug("Cancel operation for TimerTracker invoked after already completed. No action.");
        break;
      default:
        throw new Error("Cancel operation in TimerTracker called during an unexpected time.");
    }
  }
  handleComplete() {
    return this.status = "completed", clearTimeout(this.timeout), !0;
  }
  invokeOnCancelled() {
    try {
      this.onCancelled({ timeoutMs: this.timeoutMs });
    } catch (e) {
      this.logger.error("Error when attempting to invoke TimeoutTrackerCancelledHandler", { error: e });
    }
  }
}
var d;
(function(i) {
  i[i.trace = 1] = "trace", i[i.debug = 2] = "debug", i[i.info = 3] = "info", i[i.warn = 4] = "warn", i[i.error = 5] = "error";
})(d || (d = {}));
function ae(i, e, t) {
  if (t)
    switch (i) {
      case d.error:
        console.error(e, t);
        break;
      case d.warn:
        console.warn(e, t);
        break;
      case d.info:
        console.info(e, t);
        break;
      case d.debug:
        console.debug(e, t);
        break;
      case d.trace:
        console.trace(e, t);
        break;
      default:
        console.log(e, t);
        break;
    }
  else
    switch (i) {
      case d.error:
        console.error(e);
        break;
      case d.warn:
        console.warn(e);
        break;
      case d.info:
        console.info(e);
        break;
      case d.debug:
        console.debug(e);
        break;
      case d.trace:
        console.trace(e);
        break;
      default:
        console.log(e);
        break;
    }
}
class P {
  constructor(e) {
    this.mixin = e;
  }
  getTransformedData(e, t) {
    return this.mixin ? Object.assign(Object.assign({}, t ?? {}), this.mixin(t ?? {}, e)) : t;
  }
}
class g {
  constructor(e) {
    this._proxy = null, this._logToConsoleLevel = null, this.loggerId = N(8), typeof e == "string" ? (this.source = e, this.dataTransformer = new P(void 0)) : (this.source = e.source, e.provider && typeof e.provider == "function" ? this.providerFactory = e.provider : this.provider = e.provider, this.dataTransformer = new P(e.mixin), this.logOptions = e.options);
  }
  trace(e, t, n) {
    this.log(d.trace, e, t, n);
  }
  debug(e, t, n) {
    this.log(d.debug, e, t, n);
  }
  info(e, t, n) {
    this.log(d.info, e, t, n);
  }
  warn(e, t, n) {
    this.log(d.warn, e, t, n);
  }
  error(e, t, n) {
    this.log(d.error, e, t, n);
  }
  log(e, t, n, s) {
    const r = this.dataTransformer.getTransformedData(e, n);
    this.ignoreRemote(s) || this.getProxy().log({
      level: e,
      source: this.source,
      loggerId: this.loggerId,
      message: t,
      data: r
    }), this.applyDuplicateMessageToConsole(e, s) && ae(e, t, r);
  }
  getProvider() {
    return this.provider || (this.provider = this.providerFactory ? this.providerFactory() : f()), this.provider;
  }
  getProxy() {
    return this._proxy || (this._proxy = this.getProvider().getProxy()), this._proxy;
  }
  applyDuplicateMessageToConsole(e, t) {
    return (t == null ? void 0 : t.duplicateMessageToConsole) || this.getLogConsoleLevel() <= e;
  }
  getLogConsoleLevel() {
    var e, t, n, s;
    return this._logToConsoleLevel || (this._logToConsoleLevel = !((e = this.logOptions) === null || e === void 0) && e.minLogToConsoleLevelOverride ? this.logOptions.minLogToConsoleLevelOverride : (s = (n = (t = this.getProvider().config) === null || t === void 0 ? void 0 : t.logging) === null || n === void 0 ? void 0 : n.minLogToConsoleLevel) !== null && s !== void 0 ? s : d.error), this._logToConsoleLevel;
  }
  ignoreRemote(e) {
    var t, n, s;
    return ((n = (t = this.logOptions) === null || t === void 0 ? void 0 : t.remoteIgnore) !== null && n !== void 0 ? n : !1) || ((s = e == null ? void 0 : e.remoteIgnore) !== null && s !== void 0 ? s : !1);
  }
}
function ce(i) {
  if (i)
    try {
      return v(i);
    } catch {
      return {
        error: "Data failed to sanitize. The original data is not available"
      };
    }
}
function le({ level: i, source: e, message: t, loggerId: n, data: s }, r, o) {
  const a = ce(s);
  return {
    type: "log",
    level: i,
    time: /* @__PURE__ */ new Date(),
    source: e,
    message: t,
    loggerId: n,
    data: a,
    context: r,
    messageOrigin: o
  };
}
class T {
  constructor({ config: e, proxyFactory: t }) {
    if (this._id = x(), !t)
      throw new Error("Attempted to get Proxy before setting up factory");
    if (!e)
      throw new Error("Failed to include config");
    this.proxyFactory = t, this._config = e;
  }
  get id() {
    return this._id;
  }
  getProxy() {
    return this.proxy || (this.proxy = this.proxyFactory(this), this.proxy.init()), this.proxy;
  }
  get config() {
    return Object.assign({}, this._config);
  }
  onError(e) {
    this.getProxy().onError(e);
  }
  offError(e) {
    this.getProxy().offError(e);
  }
  static initializeProvider(e) {
    if (this.isInitialized) {
      const t = "Attempted to initialize provider more than one time.", n = {};
      try {
        const s = f();
        new g({
          source: "core.amazonConnectProvider.init",
          provider: s
        }).error(t);
      } catch (s) {
        n.loggingError = s == null ? void 0 : s.message;
      }
      throw new y({
        errorKey: "attemptInitializeMultipleProviders",
        reason: t,
        details: n
      });
    }
    return z(e), this.isInitialized = !0, e.getProxy(), e;
  }
}
T.isInitialized = !1;
class de {
  constructor(e, t) {
    this.engineContext = e, this.moduleNamespace = t;
  }
  get proxy() {
    if (!this.moduleProxy) {
      const e = this.engineContext.getProvider().getProxy(), t = this.moduleNamespace;
      this.moduleProxy = B(e, t);
    }
    return this.moduleProxy;
  }
  getProvider() {
    return this.engineContext.getProvider();
  }
  createLogger(e) {
    return typeof e == "object" ? new g(Object.assign(Object.assign({}, e), { provider: () => this.engineContext.getProvider() })) : new g({
      source: e,
      provider: () => this.engineContext.getProvider()
    });
  }
  createMetricRecorder(e) {
    return typeof e == "object" ? new O(Object.assign(Object.assign({}, e), { provider: () => this.engineContext.getProvider() })) : new O({
      namespace: e,
      provider: () => this.engineContext.getProvider()
    });
  }
}
class H {
  constructor(e) {
    this._provider = e;
  }
  getProvider() {
    return this._provider ? this._provider : f();
  }
  getModuleContext(e) {
    return new de(this, e);
  }
}
const he = "1.0.9";
class I extends H {
  constructor({ provider: e, instanceId: t, config: n, parameters: s, contactScope: r, scope: o, launchedBy: a }) {
    super(e), this.appInstanceId = t, this.instanceId = t, this.config = n, this.appConfig = n, this.contactScope = r, this.scope = o, this.parameters = s, this.launchedBy = a ?? {
      // Not a valid type, but launchedBy will always been provided
      // in practice for apps
      type: "unknown"
    };
  }
}
var j = function(i, e, t, n) {
  function s(r) {
    return r instanceof t ? r : new t(function(o) {
      o(r);
    });
  }
  return new (t || (t = Promise))(function(r, o) {
    function a(c) {
      try {
        l(n.next(c));
      } catch (u) {
        o(u);
      }
    }
    function h(c) {
      try {
        l(n.throw(c));
      } catch (u) {
        o(u);
      }
    }
    function l(c) {
      c.done ? r(c.value) : s(c.value).then(a, h);
    }
    l((n = n.apply(i, e || [])).next());
  });
};
class E {
  constructor(e) {
    this.provider = e, this.state = { isRunning: !1 }, this.isCreated = !1, this.isDestroyed = !1, this.logger = new g({
      source: "app.lifecycleManager",
      provider: e,
      mixin: () => ({
        state: this.state,
        isCreated: this.isCreated,
        isDestroyed: this.isDestroyed
      })
    });
  }
  get appState() {
    return Object.assign({}, this.state);
  }
  handleCreate(e) {
    return j(this, void 0, void 0, function* () {
      var t;
      if (this.isDestroyed) {
        this.logger.error("An attempt was Create after a Destroy. No Action", {
          instanceId: e.context.instanceId
        });
        return;
      }
      if (this.isCreated) {
        this.logger.error("An attempt was invoke Create after it was already invoked. No Action", { instanceId: e.context.instanceId });
        return;
      }
      if (this.logger.debug("Begin Lifecycle Create", {
        instanceId: e.context.instanceId
      }), !(!((t = this.provider.config) === null || t === void 0) && t.onCreate)) {
        const s = "App did not specify an onCreated handler. This is required. Closing app", r = {
          appInstanceId: e.context.instanceId,
          instanceId: e.context.instanceId
        };
        this.logger.error(s, { instanceId: e.context.instanceId }), this.provider.sendFatalError(s, r);
        return;
      }
      const { success: n } = yield this.handleLifecycleChange(
        Object.assign(Object.assign({}, e), { stage: "create" }),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        (s) => this.provider.config.onCreate(s),
        !0
      );
      n && (this.isCreated = !0, this.sendLifecycleHandlerCompletedMessage(e.context.instanceId, "create"));
    });
  }
  handleLifecycleChange(e, t, n) {
    return j(this, void 0, void 0, function* () {
      let s = !1;
      try {
        yield t(e), s = !0;
      } catch (r) {
        const { instanceId: o } = e.context;
        if (n) {
          const a = `An fatal error occurred when handling a ${e.stage} lifecycle action. Closing app`;
          this.logger.error(a, { instanceId: o, error: r }), this.provider.sendFatalError(a, r);
        } else
          this.logger.error(`An error occurred when handling a ${e.stage} lifecycle action.`, {
            instanceId: o,
            error: r
          });
      }
      return { success: s };
    });
  }
  sendLifecycleHandlerCompletedMessage(e, t) {
    this.logger.debug(`Sending lifecycle ${t} completed signal`), this.provider.getProxy().sendLifecycleHandlerCompleted(e, t);
  }
}
var w = function(i, e, t, n) {
  function s(r) {
    return r instanceof t ? r : new t(function(o) {
      o(r);
    });
  }
  return new (t || (t = Promise))(function(r, o) {
    function a(c) {
      try {
        l(n.next(c));
      } catch (u) {
        o(u);
      }
    }
    function h(c) {
      try {
        l(n.throw(c));
      } catch (u) {
        o(u);
      }
    }
    function l(c) {
      c.done ? r(c.value) : s(c.value).then(a, h);
    }
    l((n = n.apply(i, e || [])).next());
  });
};
class ue extends E {
  constructor(e) {
    super(e), this.startHandlers = /* @__PURE__ */ new Set(), this.stopHandlers = /* @__PURE__ */ new Set();
  }
  handleLifecycleChangeMessage(e) {
    const t = new I({
      provider: this.provider,
      instanceId: e.instanceId,
      config: e.config,
      parameters: e.parameters,
      contactScope: e.contactScope,
      scope: e.scope,
      launchedBy: e.launchedBy
    });
    this.state.instanceId = e.instanceId, this.state.appInstanceId = e.instanceId, this.state.config = e.config, this.state.appConfig = e.config, this.state.contactScope = e.contactScope;
    const n = { context: t };
    switch (e.stage) {
      case "create":
        return this.handleCreate(n);
      case "start":
        return this.handleStart(n);
      case "stop":
        return this.handleStop(n);
      case "destroy":
        return this.handleDestroy(n);
    }
  }
  onStart(e, t) {
    this.startHandlers.add(e), t != null && t.invokeIfRunning && this.state.isRunning && this.handleLifecycleChange(Object.assign(Object.assign({}, this.getAppLifecycleChangeParams()), { stage: "start" }), (n) => e(n), !1);
  }
  onStop(e) {
    this.stopHandlers.add(e);
  }
  offStart(e) {
    this.startHandlers.delete(e);
  }
  offStop(e) {
    this.stopHandlers.delete(e);
  }
  handleStart(e) {
    return w(this, void 0, void 0, function* () {
      if (this.isDestroyed) {
        this.logger.error("An attempt was Start after a Destroy. No Action", {
          appInstanceId: e.context.instanceId
        });
        return;
      }
      if (!this.isCreated) {
        this.logger.error("An attempt was invoke Start before Create. No Action", { appInstanceId: e.context.instanceId });
        return;
      }
      this.state.isRunning = !0, this.logger.info("Begin Lifecycle Start");
      const t = yield Promise.all([...this.startHandlers].map((n) => this.handleLifecycleChange(Object.assign(Object.assign({}, e), { stage: "start" }), (s) => n(s), !1)));
      this.logger.debug("Completed all start handlers", {
        count: this.startHandlers.size,
        errorCount: t.filter(({ success: n }) => !n).length
      });
    });
  }
  handleStop(e) {
    return w(this, void 0, void 0, function* () {
      if (this.isDestroyed) {
        this.logger.error("An attempt was Stop after a Destroy. No Action", {
          appInstanceId: e.context.instanceId
        });
        return;
      }
      if (!this.isCreated) {
        this.logger.error("An attempt was invoke Stop before Create. No Action", {
          appInstanceId: e.context.instanceId
        });
        return;
      }
      this.state.isRunning = !1, this.logger.info("Begin Lifecycle Stop");
      const t = yield Promise.all([...this.stopHandlers].map((n) => this.handleLifecycleChange(Object.assign(Object.assign({}, e), { stage: "stop" }), (s) => n(s), !1)));
      this.logger.debug("Completed all stop handlers", {
        count: this.stopHandlers.size,
        errorCount: t.filter(({ success: n }) => !n).length
      });
    });
  }
  handleDestroy(e) {
    return w(this, void 0, void 0, function* () {
      if (this.isDestroyed) {
        this.logger.error("An attempt was invoke Destroy multiple times. No Action", {
          appInstanceId: e.context.instanceId
        });
        return;
      }
      if (!this.isCreated) {
        this.logger.error("An attempt was invoke Destroy before Create. No Action", {
          appInstanceId: e.context.instanceId
        });
        return;
      }
      this.isDestroyed = !0, this.state.isRunning = !1, this.logger.info("Begin Lifecycle Destroy");
      const { config: t } = this.provider, { success: n } = yield this.handleLifecycleChange(Object.assign(Object.assign({}, e), { stage: "destroy" }), (s) => t.onDestroy ? t.onDestroy(s) : Promise.resolve(), !0);
      n && this.sendLifecycleHandlerCompletedMessage(e.context.instanceId, "destroy");
    });
  }
  getAppLifecycleChangeParams() {
    return {
      context: new I({
        provider: this.provider,
        instanceId: this.state.instanceId,
        config: this.state.config,
        contactScope: this.state.contactScope,
        scope: this.state.scope,
        parameters: this.state.parameters,
        launchedBy: this.state.launchedBy
      })
    };
  }
}
function ge(i) {
  var e, t;
  return Math.max(1, Math.min(6e4, (t = (e = i.workspace) === null || e === void 0 ? void 0 : e.connectionTimeout) !== null && t !== void 0 ? t : 5e3));
}
class D extends oe {
  constructor(e, t) {
    super(e), this.channel = new MessageChannel(), this.lifecycleManager = t, this.appLogger = new g({
      source: "app.appProxy",
      provider: e
    });
  }
  get proxyType() {
    return "AppProxy";
  }
  sendLifecycleHandlerCompleted(e, t) {
    const n = {
      type: "appLifecycleHandlerCompleted",
      stage: t,
      appInstanceId: e
    };
    this.sendOrQueueMessageToSubject(n);
  }
  tryCloseApp(e, t, n) {
    const s = {
      type: "closeApp",
      isFatalError: t ?? !1,
      message: e,
      data: n
    };
    this.sendOrQueueMessageToSubject(s);
  }
  sendServiceError(e, t) {
    const n = {
      type: "serviceError",
      message: e,
      data: t
    };
    this.sendOrQueueMessageToSubject(n);
  }
  publish(e, t) {
    const n = {
      type: "appPublish",
      topic: e,
      data: t
    };
    this.sendOrQueueMessageToSubject(n);
  }
  initProxy() {
    const e = {
      type: "connect-app-host-init",
      sdkVersion: he,
      providerId: this.provider.id
    };
    this.status.update({ status: "initializing" }), this.channel.port1.onmessage = (t) => this.consumerMessageHandler(t), this.connectionTimer = k.start(this.connectionTimeout.bind(this), ge(this.provider.config)), window.parent.postMessage(e, "*", [this.channel.port2]), this.appLogger.debug("Send connect message to configure proxy");
  }
  sendMessageToSubject(e) {
    this.channel.port1.postMessage(e);
  }
  getUpstreamMessageOrigin() {
    if (document != null && document.location) {
      const { origin: e, pathname: t } = document.location;
      return {
        _type: "app",
        providerId: this.provider.id,
        origin: e,
        path: t
      };
    } else
      return {
        _type: "app",
        providerId: this.provider.id,
        origin: "unknown",
        path: "unknown"
      };
  }
  handleConnectionAcknowledge(e) {
    if (!this.connectionTimer.complete()) {
      this.appLogger.error("Workspace connection acknowledge received after timeout. App is not connected to workspace.", {
        timeout: this.connectionTimer.timeoutMs
      });
      return;
    }
    super.handleConnectionAcknowledge(e);
  }
  handleMessageFromSubject(e) {
    switch (e.type) {
      case "appLifecycle":
        this.lifecycleManager.handleLifecycleChangeMessage(e).catch((t) => {
          this.appLogger.error("An error occurred when invoking handleLifecycleChangeMessage", { error: t });
        });
        break;
      default:
        super.handleMessageFromSubject(e);
    }
  }
  connectionTimeout(e) {
    this.status.update({
      status: "error",
      reason: "Workspace connection timeout",
      details: Object.assign({}, e)
    }), this.publishError({
      message: "App failed to connect to workspace in the allotted time",
      key: "workspaceConnectTimeout",
      details: Object.assign({}, e),
      isFatal: !0,
      proxyStatus: { initialized: !1 }
    });
  }
  addContextToLogger() {
    const { isRunning: e } = this.lifecycleManager.appState;
    if (document != null && document.location) {
      const { origin: t, pathname: n } = document.location;
      return { appIsRunning: e, app: { origin: t, path: n } };
    } else
      return {
        appIsRunning: e,
        app: { origin: "unknown", path: "unknown" }
      };
  }
}
class m extends T {
  constructor(e) {
    super({ config: e, proxyFactory: () => this.createProxy() }), this.lifecycleManager = new ue(this), this.logger = new g({ provider: this, source: "app.provider" });
  }
  static init(e) {
    const t = new m(e);
    return m.initializeProvider(t), { provider: t };
  }
  static get default() {
    return f("AmazonConnectApp has not been initialized");
  }
  createProxy() {
    return new D(this, this.lifecycleManager);
  }
  onStart(e, t) {
    this.lifecycleManager.onStart(e, t);
  }
  onStop(e) {
    this.lifecycleManager.onStop(e);
  }
  offStart(e) {
    this.lifecycleManager.offStart(e);
  }
  offStop(e) {
    this.lifecycleManager.offStop(e);
  }
  sendCloseAppRequest(e) {
    this.getProxy().tryCloseApp(e, !1);
  }
  sendError(e, t) {
    this.logger.error(e, t);
  }
  sendFatalError(e, t) {
    this.getProxy().tryCloseApp(e, !0, t ? v(t) : void 0);
  }
  subscribe(e, t) {
    this.getProxy().subscribe(e, t);
  }
  unsubscribe(e, t) {
    this.getProxy().unsubscribe(e, t);
  }
  publish(e, t) {
    this.getProxy().publish(e, v(t));
  }
}
var S;
(function(i) {
  i.CurrentContactId = "CURRENT_CONTACT";
})(S || (S = {}));
class pe extends E {
  constructor(e) {
    super(e);
  }
  handleLifecycleChangeMessage(e) {
    const t = new R({
      provider: this.provider,
      instanceId: e.instanceId,
      config: e.config
    });
    this.state.appInstanceId = e.appInstanceId, this.state.instanceId = e.instanceId, this.state.appConfig = e.appConfig, this.state.config = e.config;
    const n = { context: t };
    switch (e.stage) {
      case "create":
        return this.handleCreate(n);
      default:
        return this.logger.error("Attempted to send invalid stage to service", {
          stage: e.stage
        }), Promise.reject(new Error("Invalid stage sent to service. Are you using AmazonConnectService for a 3P app? Use AmazonConnectApp"));
    }
  }
}
class C extends T {
  constructor(e) {
    super({ config: e, proxyFactory: () => this.createProxy() }), this.lifecycleManager = new pe(this), this.logger = new g({ provider: this, source: "app.provider" });
  }
  static init(e) {
    const t = new C(e);
    return C.initializeProvider(t), { provider: t };
  }
  static get default() {
    return f("AmazonConnectService has not been initialized");
  }
  createProxy() {
    return new D(this, this.lifecycleManager);
  }
  sendError(e, t) {
    this.logger.error(e, t);
  }
  sendFatalError(e, t) {
    this.getProxy().sendServiceError(e, t ? v(t) : void 0);
  }
  subscribe(e, t) {
    this.getProxy().subscribe(e, t);
  }
  unsubscribe(e, t) {
    this.getProxy().unsubscribe(e, t);
  }
  publish(e, t) {
    this.getProxy().publish(e, v(t));
  }
}
class R extends H {
  constructor({ provider: e, instanceId: t, config: n }) {
    super(e), this.instanceId = t, this.config = n;
  }
}
const fe = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AmazonConnectApp: m,
  AmazonConnectService: C,
  get AppContactScope() {
    return S;
  },
  AppContext: I,
  ServiceContext: R
}, Symbol.toStringTag, { value: "Module" })), ye = AppModule.App;
export {
  ye as App,
  fe as AppModule
};
//# sourceMappingURL=amazon-connect-app.es.js.map
