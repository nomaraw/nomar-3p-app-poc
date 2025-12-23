(() => {
  // node_modules/@amazon-connect/core/lib-esm/provider/global-provider.js
  var _provider;
  function setGlobalProvider(provider2) {
    if (_provider)
      throw new Error("Global Provider is already set");
    _provider = provider2;
  }
  function getGlobalProvider(notSetMessage) {
    if (!_provider) {
      throw new Error(notSetMessage !== null && notSetMessage !== void 0 ? notSetMessage : "Attempted to get Global AmazonConnectProvider that has not been set.");
    }
    return _provider;
  }

  // node_modules/@amazon-connect/core/lib-esm/provider/is-provider.js
  function isAmazonConnectProvider(value) {
    if (typeof value !== "object" || value === null) {
      return false;
    }
    const candidate = value;
    if (typeof candidate.id !== "string") {
      return false;
    }
    if (!("config" in candidate)) {
      return false;
    }
    if (typeof candidate.getProxy !== "function") {
      return false;
    }
    return true;
  }

  // node_modules/@amazon-connect/core/lib-esm/error/connect-error.js
  var ConnectError = class _ConnectError extends Error {
    constructor({ reason, namespace, errorKey, details }) {
      super(`ConnectError with error key "${errorKey}"`);
      this.errorType = _ConnectError.ErrorType;
      this.namespace = namespace;
      this.errorKey = errorKey;
      this.reason = reason;
      this.details = details !== null && details !== void 0 ? details : {};
    }
  };
  ConnectError.ErrorType = "ConnectError";

  // node_modules/@amazon-connect/core/lib-esm/utility/deep-clone.js
  function deepClone(object) {
    try {
      return structuredClone(object);
    } catch (_a) {
      try {
        return JSON.parse(JSON.stringify(object));
      } catch (cloneError) {
        throw new ConnectError({
          errorKey: "deepCloneFailed",
          details: {
            actualError: cloneError
          }
        });
      }
    }
  }

  // node_modules/@amazon-connect/core/lib-esm/utility/emitter/emitter-base.js
  var EmitterBase = class {
    constructor({ provider: provider2, loggerKey }) {
      this.events = /* @__PURE__ */ new Map();
      this.logger = new ConnectLogger({
        provider: provider2,
        source: "emitter",
        mixin: () => ({
          emitterLoggerKey: loggerKey
        })
      });
    }
    on(parameter, handler) {
      const set = this.events.get(parameter);
      if (set)
        set.add(handler);
      else
        this.events.set(parameter, /* @__PURE__ */ new Set([handler]));
    }
    off(parameter, handler) {
      const set = this.events.get(parameter);
      if (set) {
        set.delete(handler);
        if (set.size < 1)
          this.events.delete(parameter);
      }
    }
    getHandlers(parameter) {
      var _a;
      return Array.from((_a = this.events.get(parameter)) !== null && _a !== void 0 ? _a : []);
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/utility/emitter/async-event-emitter.js
  var __awaiter = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var AsyncEventEmitter = class extends EmitterBase {
    emit(parameter, event) {
      return __awaiter(this, void 0, void 0, function* () {
        const handlers = this.getHandlers(parameter);
        yield Promise.allSettled(handlers.map((handler) => __awaiter(this, void 0, void 0, function* () {
          try {
            yield handler(event);
          } catch (error) {
            this.logger.error("An error occurred when invoking event handler", {
              error,
              parameter
            });
          }
        })));
      });
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/utility/id-generator.js
  function generateStringId(length) {
    const a = new Uint8Array(Math.ceil(length / 2));
    crypto.getRandomValues(a);
    return Array.from(a, (d) => d.toString(16).padStart(2, "0")).join("").substring(0, length);
  }
  function generateUUID() {
    if ("randomUUID" in crypto) {
      return crypto.randomUUID();
    } else {
      return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => {
        const d = parseInt(c);
        return (d ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> d / 4).toString(16);
      });
    }
  }

  // node_modules/@amazon-connect/core/lib-esm/proxy/module-proxy-factory.js
  function createModuleProxy(proxy, namespace) {
    return {
      request: (command, data) => proxy.request(namespace, command, data),
      subscribe: (topic, handler) => proxy.subscribe(Object.assign(Object.assign({}, topic), { namespace }), handler),
      unsubscribe: (topic, handler) => proxy.unsubscribe(Object.assign(Object.assign({}, topic), { namespace }), handler),
      getProxyInfo: () => ({
        connectionStatus: proxy.connectionStatus,
        proxyType: proxy.proxyType
      }),
      onConnectionStatusChange: (h) => proxy.onConnectionStatusChange(h),
      offConnectionStatusChange: (h) => proxy.offConnectionStatusChange(h)
    };
  }

  // node_modules/@amazon-connect/core/lib-esm/messaging/subscription/subscription-handler-id-map.js
  var SubscriptionHandlerIdMap = class {
    constructor() {
      this.idsByHandler = /* @__PURE__ */ new Map();
      this.handlersById = /* @__PURE__ */ new Map();
    }
    add(handler) {
      const existingId = this.idsByHandler.get(handler);
      if (existingId) {
        return { handlerId: existingId };
      }
      const handlerId = generateUUID();
      this.idsByHandler.set(handler, handlerId);
      this.handlersById.set(handlerId, handler);
      return { handlerId };
    }
    getIdByHandler(handler) {
      var _a;
      return (_a = this.idsByHandler.get(handler)) !== null && _a !== void 0 ? _a : null;
    }
    getHandlerById(id) {
      var _a;
      return (_a = this.handlersById.get(id)) !== null && _a !== void 0 ? _a : null;
    }
    get() {
      return [...this.idsByHandler.entries()].map(([handler, handlerId]) => ({
        handler,
        handlerId
      }));
    }
    delete(handler) {
      const handlerId = this.idsByHandler.get(handler);
      if (handlerId)
        this.handlersById.delete(handlerId);
      this.idsByHandler.delete(handler);
      return { isEmpty: this.idsByHandler.size < 1 };
    }
    size() {
      return this.idsByHandler.size;
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/messaging/subscription/subscription-map.js
  var SubscriptionMap = class {
    constructor() {
      this.simpleSubscriptions = /* @__PURE__ */ new Map();
      this.paramSubscriptions = /* @__PURE__ */ new Map();
    }
    add({ namespace, key, parameter: param }, value) {
      var _a, _b, _c, _d, _e;
      if (param) {
        if (!this.paramSubscriptions.has(namespace)) {
          this.paramSubscriptions.set(namespace, /* @__PURE__ */ new Map([[key, /* @__PURE__ */ new Map([[param, value]])]]));
          return;
        }
        if (!((_a = this.paramSubscriptions.get(namespace)) === null || _a === void 0 ? void 0 : _a.has(key))) {
          (_b = this.paramSubscriptions.get(namespace)) === null || _b === void 0 ? void 0 : _b.set(key, /* @__PURE__ */ new Map([[param, value]]));
          return;
        }
        (_d = (_c = this.paramSubscriptions.get(namespace)) === null || _c === void 0 ? void 0 : _c.get(key)) === null || _d === void 0 ? void 0 : _d.set(param, value);
      } else {
        if (!this.simpleSubscriptions.has(namespace)) {
          this.simpleSubscriptions.set(namespace, /* @__PURE__ */ new Map([[key, value]]));
          return;
        } else
          (_e = this.simpleSubscriptions.get(namespace)) === null || _e === void 0 ? void 0 : _e.set(key, value);
      }
    }
    delete({ namespace, key, parameter: param }) {
      var _a, _b, _c, _d;
      if (param) {
        if ((_b = (_a = this.paramSubscriptions.get(namespace)) === null || _a === void 0 ? void 0 : _a.get(key)) === null || _b === void 0 ? void 0 : _b.delete(param)) {
          if (this.paramSubscriptions.get(namespace).get(key).size < 1) {
            (_c = this.paramSubscriptions.get(namespace)) === null || _c === void 0 ? void 0 : _c.delete(key);
            if (this.paramSubscriptions.get(namespace).size < 1) {
              this.paramSubscriptions.delete(namespace);
            }
          }
        }
      } else {
        if ((_d = this.simpleSubscriptions.get(namespace)) === null || _d === void 0 ? void 0 : _d.delete(key)) {
          if (this.simpleSubscriptions.get(namespace).size < 1) {
            this.simpleSubscriptions.delete(namespace);
          }
        }
      }
    }
    get({ namespace, key, parameter: param }) {
      var _a, _b, _c;
      if (!param) {
        return (_a = this.simpleSubscriptions.get(namespace)) === null || _a === void 0 ? void 0 : _a.get(key);
      } else {
        return (_c = (_b = this.paramSubscriptions.get(namespace)) === null || _b === void 0 ? void 0 : _b.get(key)) === null || _c === void 0 ? void 0 : _c.get(param);
      }
    }
    getOrAdd(topic, addFactory) {
      let value = this.get(topic);
      if (!value) {
        value = addFactory();
        this.add(topic, value);
      }
      return value;
    }
    addOrUpdate(topic, addFactory, updateAction) {
      let value = this.get(topic);
      if (value) {
        value = updateAction(value);
      } else {
        value = addFactory();
      }
      this.add(topic, value);
      return value;
    }
    getAllSubscriptions() {
      const noParam = Array.from(this.simpleSubscriptions.keys()).flatMap((namespace) => Array.from(this.simpleSubscriptions.get(namespace).keys()).flatMap((key) => ({
        namespace,
        key
      })));
      const withParam = Array.from(this.paramSubscriptions.keys()).flatMap((namespace) => Array.from(this.paramSubscriptions.get(namespace).keys()).flatMap((key) => Array.from(this.paramSubscriptions.get(namespace).get(key).keys()).flatMap((parameter) => ({
        namespace,
        key,
        parameter
      }))));
      return [...noParam, ...withParam];
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/messaging/subscription/subscription-manager.js
  var SubscriptionManager = class {
    constructor() {
      this.subscriptions = new SubscriptionMap();
    }
    add(topic, handler) {
      return this.subscriptions.getOrAdd(topic, () => new SubscriptionHandlerIdMap()).add(handler);
    }
    get(topic) {
      var _a, _b;
      return (_b = (_a = this.subscriptions.get(topic)) === null || _a === void 0 ? void 0 : _a.get()) !== null && _b !== void 0 ? _b : [];
    }
    getById(topic, handlerId) {
      var _a, _b;
      return (_b = (_a = this.subscriptions.get(topic)) === null || _a === void 0 ? void 0 : _a.getHandlerById(handlerId)) !== null && _b !== void 0 ? _b : null;
    }
    delete(topic, handler) {
      var _a, _b;
      if ((_b = (_a = this.subscriptions.get(topic)) === null || _a === void 0 ? void 0 : _a.delete(handler).isEmpty) !== null && _b !== void 0 ? _b : false) {
        this.subscriptions.delete(topic);
      }
    }
    size(topic) {
      var _a, _b;
      return (_b = (_a = this.subscriptions.get(topic)) === null || _a === void 0 ? void 0 : _a.size()) !== null && _b !== void 0 ? _b : 0;
    }
    isEmpty(topic) {
      return this.size(topic) === 0;
    }
    getAllSubscriptions() {
      return this.subscriptions.getAllSubscriptions();
    }
    getAllSubscriptionHandlerIds() {
      return this.subscriptions.getAllSubscriptions().reduce((acc, topic) => acc.concat(this.get(topic).map(({ handlerId }) => ({
        topic,
        handlerId
      }))), []);
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/metric/duration-metric-recorder.js
  var DurationMetricRecorder = class {
    /**
     * Constructor for DurationMetricRecorder
     * @param {(metric: MetricData) => void} sendMetric- The method that sends metric
     * @param {string} metricName - The name of the duration metric
     * @param {Record<string, string>} dimensions - The dimensions of the duration metric with keys and values (optional)
     * @param {Record<string, string>} optionalDimensions - The optional dimensions of the duration metric with keys and values (optional)
     */
    constructor({ sendMetric, metricName, metricOptions }) {
      this.unit = "Milliseconds";
      this.sendMetric = sendMetric;
      this.startTime = performance.now();
      this.metricName = metricName;
      this.dimensions = (metricOptions === null || metricOptions === void 0 ? void 0 : metricOptions.dimensions) ? metricOptions.dimensions : {};
      this.optionalDimensions = (metricOptions === null || metricOptions === void 0 ? void 0 : metricOptions.optionalDimensions) ? metricOptions.optionalDimensions : {};
    }
    /**
     * Stop recording of the duration metric and emit it
     * @returns {durationCount: number} - The duration being recorded
     */
    stopDurationCounter() {
      const durationResult = Math.round(performance.now() - this.startTime);
      this.sendMetric({
        metricName: this.metricName,
        unit: this.unit,
        value: durationResult,
        dimensions: this.dimensions,
        optionalDimensions: this.optionalDimensions
      });
      return { duration: durationResult };
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/metric/metric-helpers.js
  var MAX_METRIC_DIMENSIONS = 30;
  function checkDimensionLength(dimensions, optionalDimensions) {
    if (Object.keys(dimensions).length + Object.keys(optionalDimensions !== null && optionalDimensions !== void 0 ? optionalDimensions : {}).length > MAX_METRIC_DIMENSIONS) {
      throw new Error("Cannot add more than 30 dimensions to a metric");
    }
  }
  function createMetricMessage({ metricData, time, namespace }, messageOrigin) {
    var _a, _b;
    return {
      type: "metric",
      namespace,
      metricName: metricData.metricName,
      unit: metricData.unit,
      value: metricData.value,
      time,
      dimensions: (_a = metricData.dimensions) !== null && _a !== void 0 ? _a : {},
      optionalDimensions: (_b = metricData.optionalDimensions) !== null && _b !== void 0 ? _b : {},
      messageOrigin
    };
  }

  // node_modules/@amazon-connect/core/lib-esm/metric/connect-metric-recorder.js
  var ConnectMetricRecorder = class {
    /**
     * Constructor for ConnectMetricRecorder
     * @param {ConnectRecorderMetricParams} params - The namespace and provider(optional)
     */
    constructor(params) {
      this._proxy = null;
      this.namespace = params.namespace;
      if (params.provider && typeof params.provider === "function")
        this.providerFactory = params.provider;
      else
        this.provider = params.provider;
    }
    /**
     * Emit a metric that counts success
     * @param {string} metricName - The name of the metric
     * @param {Record<string, string>} dimensions - The dimensions of a metric with keys and values (optional)
     * @param {Record<string, string>} optionalDimensions - The optional dimensions of a metric with keys and values (optional)
     */
    recordSuccess(metricName, metricOptions) {
      var _a;
      const processedDimensions = Object.assign({}, (_a = metricOptions === null || metricOptions === void 0 ? void 0 : metricOptions.dimensions) !== null && _a !== void 0 ? _a : {});
      const processedMetricOptions = Object.assign(Object.assign({}, metricOptions), { dimensions: processedDimensions });
      this.recordCount(metricName, 0, processedMetricOptions);
    }
    /**
     * Emit a metric that counts error. Add default dimension { name: "Metric", value: "Error" } to the metric if not added
     * @param {string} metricName - The name of the metric
     * @param {Record<string, string>} dimensions - The dimensions of a metric with keys and values (optional)
     * @param {Record<string, string>} optionalDimensions - The optional dimensions of a metric with keys and values (optional)
     */
    recordError(metricName, metricOptions) {
      var _a;
      const processedDimensions = Object.assign({}, (_a = metricOptions === null || metricOptions === void 0 ? void 0 : metricOptions.dimensions) !== null && _a !== void 0 ? _a : {});
      const processedMetricOptions = Object.assign(Object.assign({}, metricOptions), { dimensions: processedDimensions });
      this.recordCount(metricName, 1, processedMetricOptions);
    }
    /**
     * Emit a counting metric
     * @param {string} metricName - The name of the metric
     * @param {number} count - The count of the metric
     * @param {Record<string, string>} dimensions - The dimensions of a metric with keys and values (optional)
     * @param {Record<string, string>} optionalDimensions - The optional dimensions of a metric with keys and values (optional)
     */
    recordCount(metricName, count, metricOptions) {
      this.sendMetric({
        metricName,
        unit: "Count",
        value: count,
        dimensions: metricOptions === null || metricOptions === void 0 ? void 0 : metricOptions.dimensions,
        optionalDimensions: metricOptions === null || metricOptions === void 0 ? void 0 : metricOptions.optionalDimensions
      });
    }
    /**
     * Start a duration metric
     * @param {string} metricName - The name of the metric
     * @param {Record<string, string>} dimensions - The dimensions of a metric with keys and values (optional)
     * @param {Record<string, string>} optionalDimensions - The optional dimensions of a metric with keys and values (optional)
     * @returns {DurationMetricRecorder} - The DurationMetricRecorder object being created
     */
    startDurationCounter(metricName, metricOptions) {
      return new DurationMetricRecorder({
        sendMetric: this.sendMetric.bind(this),
        metricName,
        metricOptions
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
    sendMetric({ metricName, unit, value, dimensions, optionalDimensions }) {
      if (dimensions) {
        checkDimensionLength(dimensions, optionalDimensions);
      }
      const metricData = {
        metricName,
        unit,
        value,
        dimensions,
        optionalDimensions
      };
      const time = /* @__PURE__ */ new Date();
      this.getProxy().sendMetric({
        metricData,
        time,
        namespace: this.namespace
      });
    }
    /**
     * Get the provider of the ConnectMetricRecorder instance
     */
    getProvider() {
      if (!this.provider) {
        this.provider = this.providerFactory ? this.providerFactory() : getGlobalProvider();
      }
      return this.provider;
    }
    /**
     * Get the proxy of the ConnectMetricRecorder instance
     */
    getProxy() {
      if (!this._proxy) {
        this._proxy = this.getProvider().getProxy();
      }
      return this._proxy;
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/request/client-timeout-error.js
  var clientTimeoutResponseErrorKey = "clientTimeout";
  function formatClientTimeoutError(request, timeoutMs) {
    const { namespace, command, data: requestData } = request;
    return {
      namespace,
      reason: "Client Timeout",
      details: {
        command,
        requestData,
        timeoutMs
      },
      errorKey: clientTimeoutResponseErrorKey
    };
  }

  // node_modules/@amazon-connect/core/lib-esm/request/request-handler-factory.js
  var DEFAULT_TIMEOUT_MS = 30 * 1e3;
  function createRequestHandler(request, onStart, onTimeout, timeoutMs) {
    const adjustedTimeoutMs = Math.max(1, timeoutMs !== null && timeoutMs !== void 0 ? timeoutMs : DEFAULT_TIMEOUT_MS);
    return new Promise((resolve, reject) => {
      let isTimedOut = false;
      const timeout = setTimeout(() => {
        onTimeout({ timeoutMs: adjustedTimeoutMs, request });
        reject(formatClientTimeoutError(request, adjustedTimeoutMs));
        isTimedOut = true;
      }, adjustedTimeoutMs);
      const handler = (msg) => {
        clearTimeout(timeout);
        if (!isTimedOut) {
          if (msg.isError) {
            reject(new ConnectError(msg));
          } else {
            resolve(msg.data);
          }
        }
      };
      onStart(handler);
    });
  }

  // node_modules/@amazon-connect/core/lib-esm/request/request-manager.js
  var RequestManager = class {
    constructor(provider2) {
      this.requestMap = /* @__PURE__ */ new Map();
      this.logger = new ConnectLogger({
        provider: provider2,
        source: "core.requestManager"
      });
    }
    processRequest(request) {
      const { requestId } = request;
      return createRequestHandler(request, (handler) => this.requestMap.set(requestId, handler), ({ request: request2, timeoutMs }) => this.handleTimeout(request2, timeoutMs));
    }
    processResponse(response) {
      const { requestId } = response;
      const handler = this.requestMap.get(requestId);
      if (!handler) {
        this.logger.error("Returned a response message with no handler", {
          message: response
        });
        return;
      }
      handler(response);
      this.requestMap.delete(requestId);
    }
    handleTimeout(request, timeoutMs) {
      const { requestId, namespace, command } = request;
      this.requestMap.delete(requestId);
      this.logger.error("Client request timeout", {
        requestId,
        namespace,
        command,
        timeoutMs
      });
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/request/request-message-factory.js
  function createRequestMessage(namespace, command, data, messageOrigin) {
    const requestId = generateUUID();
    return {
      type: "request",
      namespace,
      command,
      requestId,
      data,
      messageOrigin
    };
  }

  // node_modules/@amazon-connect/core/lib-esm/messaging/downstream-message-sanitizer.js
  var __rest = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  function sanitizeDownstreamMessage(message) {
    try {
      switch (message.type) {
        case "acknowledge":
        case "error":
        case "childConnectionClose":
          return message;
        case "childDownstreamMessage":
          return Object.assign(Object.assign({}, message), { message: sanitizeDownstreamMessage(message.message) });
        case "publish": {
          const { data } = message, other = __rest(message, ["data"]);
          return Object.assign({}, other);
        }
        case "response": {
          if (message.isError)
            return Object.assign(Object.assign({}, message), { details: { command: message.details.command } });
          else {
            const { data } = message, other = __rest(message, ["data"]);
            return Object.assign({}, other);
          }
        }
        default:
          return message;
      }
    } catch (error) {
      return {
        messageDetails: "error when sanitizing downstream message",
        message,
        error
      };
    }
  }

  // node_modules/@amazon-connect/core/lib-esm/proxy/channel-manager.js
  var ChannelManager = class {
    constructor(provider2, relayChildUpstreamMessage) {
      this.provider = provider2;
      this.relayChildUpstreamMessage = relayChildUpstreamMessage;
      this.channels = /* @__PURE__ */ new Map();
      this.logger = new ConnectLogger({
        provider: provider2,
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
    addChannel(params) {
      const { connectionId } = params;
      if (this.channels.has(connectionId)) {
        this.logger.error("Attempted to add child connection that already exists. No action", {
          connectionId
        });
        return;
      }
      if (params.type === "iframe") {
        this.setupIframe(params);
      } else {
        this.setupComponent(params);
      }
      this.logger.debug("Child channel added", {
        connectionId,
        type: params.type
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
    updateChannelPort(params) {
      const { connectionId } = params;
      const existingChannel = this.channels.get(connectionId);
      if (!existingChannel) {
        this.logger.error("Attempted to update child connection that does not exist No action", {
          connectionId
        });
        return;
      }
      if (existingChannel.type === "component") {
        this.logger.error("Attempted to update a component channel connection as MessagePort. This is not supported.", {
          connectionId
        });
        return;
      }
      const originalChannel = existingChannel;
      originalChannel.port.onmessage = null;
      originalChannel.port.close();
      const setupParams = Object.assign(Object.assign({}, params), { type: "iframe" });
      this.setupIframe(setupParams);
      this.logger.info("Updated child port", { connectionId });
    }
    setupIframe(params) {
      const { connectionId, port, providerId } = params;
      const handler = this.createMessageHandler(connectionId, providerId);
      port.addEventListener("message", handler);
      port.start();
      this.channels.set(connectionId, {
        type: "iframe",
        port,
        handler,
        providerId
      });
      this.relayChildUpstreamMessage({
        type: "childUpstream",
        connectionId,
        sourceProviderId: providerId,
        parentProviderId: this.provider.id,
        message: {
          type: "childConnectionReady"
        }
      });
    }
    setupComponent(params) {
      const { connectionId, providerId, sendDownstreamMessage, setUpstreamMessageHandler } = params;
      const upstreamHandler = (message) => {
        this.relayChildUpstreamMessage({
          type: "childUpstream",
          sourceProviderId: providerId,
          parentProviderId: this.provider.id,
          connectionId,
          message
        });
      };
      setUpstreamMessageHandler(upstreamHandler);
      this.channels.set(connectionId, {
        type: "component",
        providerId,
        sendDownstreamMessage,
        setUpstreamMessageHandler
      });
      this.relayChildUpstreamMessage({
        type: "childUpstream",
        connectionId,
        sourceProviderId: providerId,
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
    handleDownstreamMessage({ connectionId, message, targetProviderId }) {
      const channelData = this.channels.get(connectionId);
      if (!channelData) {
        this.logger.warn("Attempted to route downstream message to child channel that does not exist", { connectionId, message: sanitizeDownstreamMessage(message) });
        return;
      }
      const { providerId } = channelData;
      if (providerId && providerId !== targetProviderId) {
        this.logger.error("Downstream target message did not match target provider id. Not sending message.", {
          connectionId,
          targetProviderId,
          actualProviderId: providerId,
          message: sanitizeDownstreamMessage(message)
        });
        return;
      }
      if (channelData.type === "iframe") {
        channelData.port.postMessage(message);
      } else {
        channelData.sendDownstreamMessage(message);
      }
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
    handleCloseMessage({ connectionId }) {
      const channelData = this.channels.get(connectionId);
      if (!channelData) {
        this.logger.warn("Attempted to close child channel that was not found", {
          connectionId
        });
        return;
      }
      if (channelData.type === "iframe") {
        const { port, handler } = channelData;
        port.removeEventListener("message", handler);
        port.close();
      }
      this.channels.delete(connectionId);
      this.logger.debug("Removed child channel", {
        connectionId,
        type: channelData.type
      });
    }
    createMessageHandler(connectionId, providerId) {
      return (message) => this.relayChildUpstreamMessage({
        type: "childUpstream",
        sourceProviderId: providerId,
        parentProviderId: this.provider.id,
        connectionId,
        message: message.data
      });
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/proxy/error/error-service.js
  var ErrorService = class {
    constructor(provider2) {
      this.errorHandlers = /* @__PURE__ */ new Set();
      this.logger = new ConnectLogger({
        provider: provider2,
        source: "core.proxy.error"
      });
    }
    invoke(error) {
      const { message, key, details, isFatal, connectionStatus } = error;
      this.logger.error(message, {
        key,
        details,
        isFatal,
        connectionStatus
      }, { duplicateMessageToConsole: true, remoteIgnore: true });
      [...this.errorHandlers].forEach((handler) => {
        try {
          handler(error);
        } catch (handlerError) {
          this.logger.error("An error occurred within a AmazonConnectErrorHandler", {
            handlerError,
            originalError: error
          });
        }
      });
    }
    onError(handler) {
      this.errorHandlers.add(handler);
    }
    offError(handler) {
      this.errorHandlers.delete(handler);
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/proxy/health-check/health-check-manager.js
  var HealthCheckManager = class _HealthCheckManager {
    constructor({ provider: provider2, sendHealthCheck, getUpstreamMessageOrigin }) {
      this.connectionId = null;
      this.healthCheckInterval = null;
      this.healthCheckTimeout = null;
      this.sendHealthCheck = sendHealthCheck;
      this.getUpstreamMessageOrigin = getUpstreamMessageOrigin;
      this.sendHealthCheckInterval = null;
      this.lastHealthCheckResponse = null;
      this._status = "unknown";
      this.logger = new ConnectLogger({
        source: "core.proxy.health-check",
        provider: provider2,
        mixin: () => ({
          connectionId: this.connectionId
        })
      });
      this.events = new AsyncEventEmitter({
        provider: provider2,
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
      var _a, _b;
      return (_b = (_a = this.lastHealthCheckResponse) === null || _a === void 0 ? void 0 : _a.counter) !== null && _b !== void 0 ? _b : null;
    }
    get lastCheckTime() {
      var _a, _b;
      return (_b = (_a = this.lastHealthCheckResponse) === null || _a === void 0 ? void 0 : _a.time) !== null && _b !== void 0 ? _b : null;
    }
    start({ healthCheckInterval: interval, connectionId }) {
      this.connectionId = connectionId;
      this.healthCheckInterval = interval;
      this.clearInterval();
      if (interval <= 0) {
        this.logger.debug("Health check disabled");
        return;
      }
      if (interval < 1e3) {
        this.logger.error("Health check interval is less than 1 second. Not running", { interval });
        return;
      }
      this.sendHealthCheckMessage();
      this.sendHealthCheckInterval = setInterval(() => this.sendHealthCheckMessage(), interval);
      this.startTimeout();
    }
    stop() {
      this.clearInterval();
      this.clearTimeout();
    }
    handleResponse(message) {
      this.setHealthy({
        time: message.time,
        counter: message.counter
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
      this.clearTimeout();
      this.healthCheckTimeout = setTimeout(() => {
        this.setUnhealthy();
      }, this.healthCheckInterval * 3);
    }
    clearInterval() {
      if (this.sendHealthCheckInterval) {
        clearInterval(this.sendHealthCheckInterval);
        this.sendHealthCheckInterval = null;
      }
    }
    clearTimeout() {
      if (this.healthCheckTimeout) {
        clearTimeout(this.healthCheckTimeout);
        this.healthCheckTimeout = null;
      }
    }
    setUnhealthy() {
      if (this._status !== "unhealthy") {
        const previousStatus = this._status;
        this.logger.info("Connection unhealthy", {
          previousStatus
        });
        this._status = "unhealthy";
        this.emitStatusChanged("unhealthy", previousStatus);
      }
    }
    setHealthy(result) {
      this.lastHealthCheckResponse = Object.assign({}, result);
      if (this._status !== "healthy") {
        const previousStatus = this._status;
        this.logger.debug("Connection healthy", {
          previousStatus
        });
        this._status = "healthy";
        this.emitStatusChanged("healthy", previousStatus);
      }
      this.startTimeout();
    }
    emitStatusChanged(status, previousStatus) {
      var _a, _b, _c, _d;
      void this.events.emit(_HealthCheckManager.statusChangedKey, {
        status,
        previousStatus,
        lastCheckTime: (_b = (_a = this.lastHealthCheckResponse) === null || _a === void 0 ? void 0 : _a.time) !== null && _b !== void 0 ? _b : null,
        lastCheckCounter: (_d = (_c = this.lastHealthCheckResponse) === null || _c === void 0 ? void 0 : _c.counter) !== null && _d !== void 0 ? _d : null
      });
    }
    onStatusChanged(handler) {
      this.events.on(_HealthCheckManager.statusChangedKey, handler);
    }
    offStatusChanged(handler) {
      this.events.off(_HealthCheckManager.statusChangedKey, handler);
    }
  };
  HealthCheckManager.statusChangedKey = "statusChanged";

  // node_modules/@amazon-connect/core/lib-esm/proxy/proxy-connection/proxy-connection-status-manager.js
  var ProxyConnectionStatusManager = class {
    constructor(provider2) {
      this.status = "notConnected";
      this.changeHandlers = /* @__PURE__ */ new Set();
      this.logger = new ConnectLogger({
        source: "core.proxy.connection-status-manager",
        provider: provider2,
        mixin: () => ({ status: this.status })
      });
    }
    getStatus() {
      return this.status;
    }
    update(evt) {
      this.status = evt.status;
      this.logger.trace("Proxy Connection Status Changed", {
        status: evt.status
      });
      [...this.changeHandlers].forEach((handler) => {
        try {
          handler(evt);
        } catch (error) {
          this.logger.error("An error occurred within a ProxyConnectionChangedHandler", { error });
        }
      });
    }
    onChange(handler) {
      this.changeHandlers.add(handler);
    }
    offChange(handler) {
      this.changeHandlers.delete(handler);
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/proxy/proxy.js
  var __awaiter2 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __rest2 = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  var Proxy = class {
    constructor(provider2) {
      this.provider = provider2;
      this.logger = new ConnectLogger({
        source: "core.proxy",
        provider: provider2,
        mixin: () => ({
          proxyType: this.proxyType,
          connectionId: this.connectionId
        })
      });
      this.requestManager = new RequestManager(provider2);
      this.status = new ProxyConnectionStatusManager(provider2);
      this.errorService = new ErrorService(provider2);
      this.upstreamMessageQueue = [];
      this.connectionEstablished = false;
      this.isInitialized = false;
      this.subscriptions = new SubscriptionManager();
      this.connectionId = null;
      this.channelManager = new ChannelManager(provider2, this.sendOrQueueMessageToSubject.bind(this));
      this.healthCheck = new HealthCheckManager({
        provider: provider2,
        sendHealthCheck: this.sendOrQueueMessageToSubject.bind(this),
        getUpstreamMessageOrigin: this.getUpstreamMessageOrigin.bind(this)
      });
    }
    init() {
      if (this.isInitialized)
        throw new Error("Proxy already initialized");
      this.isInitialized = true;
      this.initProxy();
    }
    request(namespace, command, data, origin) {
      const msg = createRequestMessage(namespace, command, data, origin !== null && origin !== void 0 ? origin : this.getUpstreamMessageOrigin());
      const resp = this.requestManager.processRequest(msg);
      this.sendOrQueueMessageToSubject(msg);
      return resp;
    }
    subscribe(topic, handler, origin) {
      const { handlerId } = this.subscriptions.add(topic, handler);
      const msg = {
        type: "subscribe",
        topic,
        messageOrigin: origin !== null && origin !== void 0 ? origin : this.getUpstreamMessageOrigin(),
        handlerId
      };
      this.sendOrQueueMessageToSubject(msg);
    }
    unsubscribe(topic, handler, origin) {
      this.subscriptions.delete(topic, handler);
      if (this.subscriptions.isEmpty(topic)) {
        const msg = {
          type: "unsubscribe",
          topic,
          messageOrigin: origin !== null && origin !== void 0 ? origin : this.getUpstreamMessageOrigin()
        };
        this.sendOrQueueMessageToSubject(msg);
      }
    }
    log(logData) {
      const logMsg = createLogMessage(logData, this.addContextToLogger(), this.getUpstreamMessageOrigin());
      this.sendOrQueueMessageToSubject(logMsg);
    }
    sendLogMessage(message) {
      if (message.type !== "log") {
        this.logger.error("Attempted to send invalid log message", {
          message
        });
        return;
      }
      message.context = Object.assign(Object.assign({}, message.context), this.addContextToLogger());
      this.sendOrQueueMessageToSubject(message);
    }
    sendMetric({ metricData, time, namespace }) {
      const metricMessage = createMetricMessage({
        metricData,
        time,
        namespace
      }, this.getUpstreamMessageOrigin());
      this.sendOrQueueMessageToSubject(metricMessage);
    }
    sendMetricMessage(metricMessage) {
      if (metricMessage.type !== "metric") {
        this.logger.error("Attempted to send invalid metric message", {
          metricMessage
        });
        return;
      }
      this.sendOrQueueMessageToSubject(metricMessage);
    }
    sendOrQueueMessageToSubject(message) {
      if (this.connectionEstablished) {
        this.sendMessageToSubject(message);
      } else {
        this.upstreamMessageQueue.push(message);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    consumerMessageHandler(evt) {
      if (!this.isInitialized) {
        this.logger.error("Attempted to process message from subject prior to proxy being initializing. Message not processed", { originalMessageEventData: evt.data });
        return;
      }
      const { data } = evt;
      if (!("type" in data)) {
        this.logger.warn("Unknown inbound message", {
          originalMessageEventData: data
        });
        return;
      }
      const msg = data;
      this.handleMessageFromSubject(msg);
    }
    handleMessageFromSubject(msg) {
      this.handleDefaultMessageFromSubject(msg);
    }
    handleDefaultMessageFromSubject(msg) {
      switch (msg.type) {
        case "acknowledge":
          this.handleConnectionAcknowledge(msg);
          break;
        case "response":
          this.handleResponse(msg);
          break;
        case "publish":
          this.handlePublish(msg);
          break;
        case "error":
          this.handleError(msg);
          break;
        case "childDownstreamMessage":
          this.channelManager.handleDownstreamMessage(msg);
          break;
        case "childConnectionClose":
          this.channelManager.handleCloseMessage(msg);
          break;
        case "healthCheckResponse":
          this.healthCheck.handleResponse(msg);
          break;
        default:
          this.logger.error("Unknown inbound message", {
            originalMessageEventData: msg
          });
          return;
      }
    }
    handleConnectionAcknowledge(msg) {
      this.connectionId = msg.connectionId;
      this.logger.debug("Connection acknowledged by subject", {
        connectionId: msg.connectionId,
        queuedMessageCount: this.upstreamMessageQueue.length,
        status: msg.status
      });
      this.status.update({
        status: "ready",
        connectionId: msg.connectionId
      });
      this.connectionEstablished = true;
      while (this.upstreamMessageQueue.length) {
        const msg2 = this.upstreamMessageQueue.shift();
        this.sendMessageToSubject(msg2);
      }
      this.healthCheck.start(msg);
      this.logger.debug("Proxy connection ready", {
        connectionId: this.connectionId
      });
    }
    handleResponse(msg) {
      this.requestManager.processResponse(msg);
    }
    handlePublish(msg) {
      const { handlerId, topic } = msg;
      if (handlerId) {
        const handler = this.subscriptions.getById(topic, handlerId);
        if (handler) {
          void this.handleAsyncSubscriptionHandlerInvoke({ handler, handlerId }, msg);
        }
      } else {
        this.subscriptions.get(topic).map((handlerIdMapping) => void this.handleAsyncSubscriptionHandlerInvoke(handlerIdMapping, msg));
      }
    }
    handleError(msg) {
      if (msg.isFatal) {
        const { message: reason, type: _ } = msg, details = __rest2(msg, ["message", "type"]);
        this.status.update({ status: "error", reason, details });
      }
      this.publishError({
        message: msg.message,
        key: msg.key,
        details: msg.details,
        isFatal: msg.isFatal,
        proxyStatus: msg.status
      });
    }
    publishError(error) {
      const fullError = Object.assign(Object.assign({}, error), { connectionStatus: this.connectionStatus });
      this.errorService.invoke(fullError);
    }
    handleAsyncSubscriptionHandlerInvoke(_a, _b) {
      return __awaiter2(this, arguments, void 0, function* ({ handler, handlerId }, { topic, data }) {
        try {
          yield handler(data);
        } catch (error) {
          this.logger.error("An error occurred when handling subscription", {
            topic,
            error,
            handlerId
          });
        }
      });
    }
    get connectionStatus() {
      return this.status.getStatus();
    }
    onError(handler) {
      this.errorService.onError(handler);
    }
    offError(handler) {
      this.errorService.offError(handler);
    }
    onConnectionStatusChange(handler) {
      this.status.onChange(handler);
    }
    offConnectionStatusChange(handler) {
      this.status.offChange(handler);
    }
    onHealthCheckStatusChanged(handler) {
      this.healthCheck.onStatusChanged(handler);
    }
    offHealthCheckStatusChanged(handler) {
      this.healthCheck.offStatusChanged(handler);
    }
    /**
     * @deprecated Use addChildIframeChannel instead. This method will be removed in a future version.
     */
    addChildChannel(params) {
      this.addChildIframeChannel(params);
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
    addChildIframeChannel(params) {
      this.channelManager.addChannel(Object.assign(Object.assign({}, params), { type: "iframe" }));
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
    addChildComponentChannel(params) {
      this.channelManager.addChannel(Object.assign(Object.assign({}, params), { type: "component" }));
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
    updateChildIframeChannelPort(params) {
      this.channelManager.updateChannelPort(params);
    }
    /**
     * @deprecated Use updateChildIframeChannelPort instead. This method will be removed in a future version.
     */
    updateChildChannelPort(params) {
      this.updateChildIframeChannelPort(params);
    }
    getConnectionId() {
      if (this.connectionId)
        return Promise.resolve(this.connectionId);
      return new Promise((resolve, reject) => {
        let timeout = void 0;
        const handler = (evt) => {
          if (evt.status === "ready") {
            this.offConnectionStatusChange(handler);
            clearInterval(timeout);
            resolve(evt.connectionId);
          }
        };
        timeout = setTimeout(() => {
          this.logger.error("Timeout getting connection id");
          this.offConnectionStatusChange(handler);
          reject(new Error("Timeout getting connectionId"));
        }, 10 * 1e3);
        this.onConnectionStatusChange(handler);
      });
    }
    resetConnection(reason) {
      this.logger.debug("Resetting connection", {
        reason,
        connectionId: this.connectionId
      });
      this.connectionEstablished = false;
      this.status.update({
        status: "reset",
        reason
      });
      const { subscriptionHandlerCount } = this.restoreAllHandler();
      this.logger.info("Resetting proxy", {
        reason,
        subscriptionHandlerCount
      });
      this.logger.debug("Connection reset complete, restoring handlers", {
        subscriptionHandlerCount
      });
    }
    restoreAllHandler() {
      var _a;
      const subscriptionHandlerIds = this.subscriptions.getAllSubscriptionHandlerIds();
      subscriptionHandlerIds === null || subscriptionHandlerIds === void 0 ? void 0 : subscriptionHandlerIds.map(({ topic, handlerId }) => ({
        type: "subscribe",
        topic,
        messageOrigin: this.getUpstreamMessageOrigin(),
        handlerId
      })).forEach((msg) => this.sendOrQueueMessageToSubject(msg));
      return { subscriptionHandlerCount: (_a = subscriptionHandlerIds === null || subscriptionHandlerIds === void 0 ? void 0 : subscriptionHandlerIds.length) !== null && _a !== void 0 ? _a : -1 };
    }
    unsubscribeAllHandlers() {
      var _a;
      const subscriptionHandlerIds = this.subscriptions.getAllSubscriptionHandlerIds();
      this.logger.info("Unsubscribing all handlers from proxy", {
        subscriptionHandlerCount: (_a = subscriptionHandlerIds === null || subscriptionHandlerIds === void 0 ? void 0 : subscriptionHandlerIds.length) !== null && _a !== void 0 ? _a : -1
      });
      subscriptionHandlerIds === null || subscriptionHandlerIds === void 0 ? void 0 : subscriptionHandlerIds.map(({ topic }) => ({
        type: "unsubscribe",
        topic,
        messageOrigin: this.getUpstreamMessageOrigin()
      })).forEach((msg) => this.sendOrQueueMessageToSubject(msg));
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/utility/timeout-tracker.js
  var TimeoutTracker = class _TimeoutTracker {
    constructor(onCancelled, timeoutMs) {
      this.timeoutMs = timeoutMs;
      this.onCancelled = onCancelled;
      this.timeout = setTimeout(() => this.handleCancel(), this.timeoutMs);
      this.status = "running";
      this.logger = new ConnectLogger({
        source: "core.utility.timeout-tracker",
        mixin: () => ({
          timeoutMs: this.timeoutMs,
          timeoutTrackerStatus: this.status
        })
      });
    }
    static start(onCancelled, ms) {
      return new _TimeoutTracker(onCancelled, ms);
    }
    complete() {
      switch (this.status) {
        case "running":
          return this.handleComplete();
        case "completed":
          this.logger.debug("TimeoutTracker already marked complete. No action.");
          return true;
        case "cancelled":
          this.logger.info("Attempted to complete a TimeoutTracker that has already been cancelled");
          return false;
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
          this.status = "cancelled";
          this.logger.info("TimeoutTracker has timed out. Invoking onCancelled Handler");
          this.invokeOnCancelled();
          break;
        case "completed":
          this.logger.debug("Cancel operation for TimerTracker invoked after already completed. No action.");
          break;
        default:
          throw new Error("Cancel operation in TimerTracker called during an unexpected time.");
      }
    }
    handleComplete() {
      this.status = "completed";
      clearTimeout(this.timeout);
      return true;
    }
    invokeOnCancelled() {
      try {
        this.onCancelled({ timeoutMs: this.timeoutMs });
      } catch (error) {
        this.logger.error("Error when attempting to invoke TimeoutTrackerCancelledHandler", { error });
      }
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/logging/log-level.js
  var LogLevel;
  (function(LogLevel2) {
    LogLevel2[LogLevel2["trace"] = 1] = "trace";
    LogLevel2[LogLevel2["debug"] = 2] = "debug";
    LogLevel2[LogLevel2["info"] = 3] = "info";
    LogLevel2[LogLevel2["warn"] = 4] = "warn";
    LogLevel2[LogLevel2["error"] = 5] = "error";
  })(LogLevel || (LogLevel = {}));

  // node_modules/@amazon-connect/core/lib-esm/logging/log-data-console-writer.js
  function logToConsole(level, message, data) {
    if (data) {
      switch (level) {
        case LogLevel.error:
          console.error(message, data);
          break;
        case LogLevel.warn:
          console.warn(message, data);
          break;
        case LogLevel.info:
          console.info(message, data);
          break;
        case LogLevel.debug:
          console.debug(message, data);
          break;
        case LogLevel.trace:
          console.trace(message, data);
          break;
        default:
          console.log(message, data);
          break;
      }
    } else {
      switch (level) {
        case LogLevel.error:
          console.error(message);
          break;
        case LogLevel.warn:
          console.warn(message);
          break;
        case LogLevel.info:
          console.info(message);
          break;
        case LogLevel.debug:
          console.debug(message);
          break;
        case LogLevel.trace:
          console.trace(message);
          break;
        default:
          console.log(message);
          break;
      }
    }
  }

  // node_modules/@amazon-connect/core/lib-esm/logging/log-data-transformer.js
  var LogDataTransformer = class {
    constructor(mixin) {
      this.mixin = mixin;
    }
    getTransformedData(level, data) {
      if (!this.mixin)
        return data;
      return Object.assign(Object.assign({}, data !== null && data !== void 0 ? data : {}), this.mixin(data !== null && data !== void 0 ? data : {}, level));
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/logging/connect-logger.js
  var ConnectLogger = class {
    constructor(param) {
      this._proxy = null;
      this._logToConsoleLevel = null;
      this.loggerId = generateStringId(8);
      if (typeof param === "string") {
        this.source = param;
        this.dataTransformer = new LogDataTransformer(void 0);
      } else {
        this.source = param.source;
        if (param.provider && typeof param.provider === "function")
          this.providerFactory = param.provider;
        else
          this.provider = param.provider;
        this.dataTransformer = new LogDataTransformer(param.mixin);
        this.logOptions = param.options;
      }
    }
    trace(message, data, options) {
      this.log(LogLevel.trace, message, data, options);
    }
    debug(message, data, options) {
      this.log(LogLevel.debug, message, data, options);
    }
    info(message, data, options) {
      this.log(LogLevel.info, message, data, options);
    }
    warn(message, data, options) {
      this.log(LogLevel.warn, message, data, options);
    }
    error(message, data, options) {
      this.log(LogLevel.error, message, data, options);
    }
    log(level, message, data, options) {
      const transformedData = this.dataTransformer.getTransformedData(level, data);
      if (!this.ignoreRemote(options)) {
        this.getProxy().log({
          level,
          source: this.source,
          loggerId: this.loggerId,
          message,
          data: transformedData
        });
      }
      if (this.applyDuplicateMessageToConsole(level, options)) {
        logToConsole(level, message, transformedData);
      }
    }
    getProvider() {
      if (!this.provider) {
        this.provider = this.providerFactory ? this.providerFactory() : getGlobalProvider();
      }
      return this.provider;
    }
    getProxy() {
      if (!this._proxy) {
        this._proxy = this.getProvider().getProxy();
      }
      return this._proxy;
    }
    applyDuplicateMessageToConsole(level, options) {
      return (options === null || options === void 0 ? void 0 : options.duplicateMessageToConsole) || this.getLogConsoleLevel() <= level;
    }
    getLogConsoleLevel() {
      var _a, _b, _c, _d;
      if (!this._logToConsoleLevel) {
        this._logToConsoleLevel = ((_a = this.logOptions) === null || _a === void 0 ? void 0 : _a.minLogToConsoleLevelOverride) ? this.logOptions.minLogToConsoleLevelOverride : (_d = (_c = (_b = this.getProvider().config) === null || _b === void 0 ? void 0 : _b.logging) === null || _c === void 0 ? void 0 : _c.minLogToConsoleLevel) !== null && _d !== void 0 ? _d : LogLevel.error;
      }
      return this._logToConsoleLevel;
    }
    ignoreRemote(options) {
      var _a, _b, _c;
      return ((_b = (_a = this.logOptions) === null || _a === void 0 ? void 0 : _a.remoteIgnore) !== null && _b !== void 0 ? _b : false) || ((_c = options === null || options === void 0 ? void 0 : options.remoteIgnore) !== null && _c !== void 0 ? _c : false);
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/logging/sanitize-data.js
  function sanitizeData(data) {
    if (!data)
      return void 0;
    try {
      return deepClone(data);
    } catch (_a) {
      return {
        error: "Data failed to sanitize. The original data is not available"
      };
    }
  }

  // node_modules/@amazon-connect/core/lib-esm/logging/log-message-factory.js
  function createLogMessage({ level, source, message, loggerId, data }, context, messageOrigin) {
    const sanitizedData = sanitizeData(data);
    return {
      type: "log",
      level,
      time: /* @__PURE__ */ new Date(),
      source,
      message,
      loggerId,
      data: sanitizedData,
      context,
      messageOrigin
    };
  }

  // node_modules/@amazon-connect/core/lib-esm/provider/provider-base.js
  var AmazonConnectProviderBase = class {
    constructor({ config, proxyFactory }) {
      this._id = generateUUID();
      if (!proxyFactory) {
        throw new Error("Attempted to get Proxy before setting up factory");
      }
      if (!config) {
        throw new Error("Failed to include config");
      }
      this.proxyFactory = proxyFactory;
      this._config = config;
    }
    get id() {
      return this._id;
    }
    getProxy() {
      if (!this.proxy) {
        this.proxy = this.proxyFactory(this);
        this.proxy.init();
      }
      return this.proxy;
    }
    get config() {
      return Object.assign({}, this._config);
    }
    onError(handler) {
      this.getProxy().onError(handler);
    }
    offError(handler) {
      this.getProxy().offError(handler);
    }
    static initializeProvider(provider2) {
      if (this.isInitialized) {
        const msg = "Attempted to initialize provider more than one time.";
        const details = {};
        try {
          const existingProvider = getGlobalProvider();
          const logger = new ConnectLogger({
            source: "core.amazonConnectProvider.init",
            provider: existingProvider
          });
          logger.error(msg);
        } catch (e) {
          details.loggingError = e === null || e === void 0 ? void 0 : e.message;
        }
        throw new ConnectError({
          errorKey: "attemptInitializeMultipleProviders",
          reason: msg,
          details
        });
      }
      setGlobalProvider(provider2);
      this.isInitialized = true;
      provider2.getProxy();
      return provider2;
    }
  };
  AmazonConnectProviderBase.isInitialized = false;

  // node_modules/@amazon-connect/core/lib-esm/context/module-context.js
  var ModuleContext = class {
    constructor(engineContext, moduleNamespace) {
      this.engineContext = engineContext;
      this.moduleNamespace = moduleNamespace;
    }
    get proxy() {
      if (!this.moduleProxy) {
        const proxy = this.engineContext.getProvider().getProxy();
        const moduleNamespace = this.moduleNamespace;
        this.moduleProxy = createModuleProxy(proxy, moduleNamespace);
      }
      return this.moduleProxy;
    }
    getProvider() {
      return this.engineContext.getProvider();
    }
    createLogger(params) {
      if (typeof params === "object") {
        return new ConnectLogger(Object.assign(Object.assign({}, params), { provider: () => this.engineContext.getProvider() }));
      } else {
        return new ConnectLogger({
          source: params,
          provider: () => this.engineContext.getProvider()
        });
      }
    }
    createMetricRecorder(params) {
      if (typeof params === "object") {
        return new ConnectMetricRecorder(Object.assign(Object.assign({}, params), { provider: () => this.engineContext.getProvider() }));
      } else {
        return new ConnectMetricRecorder({
          namespace: params,
          provider: () => this.engineContext.getProvider()
        });
      }
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/context/context.js
  var Context = class {
    constructor(provider2) {
      this._provider = provider2;
    }
    getProvider() {
      if (this._provider)
        return this._provider;
      else
        return getGlobalProvider();
    }
    getModuleContext(namespace) {
      return new ModuleContext(this, namespace);
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/client/get-module-context.js
  function getModuleContext({ namespace, config }) {
    if (config && "context" in config && config.context) {
      return config.context;
    } else if (isAmazonConnectProvider(config)) {
      return new Context(config).getModuleContext(namespace);
    } else {
      return new Context(config === null || config === void 0 ? void 0 : config.provider).getModuleContext(namespace);
    }
  }

  // node_modules/@amazon-connect/core/lib-esm/client/connect-client.js
  var ConnectClientWithOptionalConfig = class {
    constructor(namespace, config) {
      this.namespace = namespace;
      this.context = getModuleContext({ namespace, config });
    }
  };

  // node_modules/@amazon-connect/core/lib-esm/sdk-version.js
  var sdkVersion = "1.0.9";

  // node_modules/@amazon-connect/app/lib-esm/app-context.js
  var AppContext = class extends Context {
    constructor({ provider: provider2, instanceId, config, parameters, contactScope, scope, launchedBy }) {
      super(provider2);
      this.appInstanceId = instanceId;
      this.instanceId = instanceId;
      this.config = config;
      this.appConfig = config;
      this.contactScope = contactScope;
      this.scope = scope;
      this.parameters = parameters;
      this.launchedBy = launchedBy !== null && launchedBy !== void 0 ? launchedBy : {
        // Not a valid type, but launchedBy will always been provided
        // in practice for apps
        type: "unknown"
      };
    }
  };

  // node_modules/@amazon-connect/app/lib-esm/lifecycle/lifecycle-manager.js
  var __awaiter3 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var LifecycleManager = class {
    constructor(provider2) {
      this.provider = provider2;
      this.state = { isRunning: false };
      this.isCreated = false;
      this.isDestroyed = false;
      this.logger = new ConnectLogger({
        source: "app.lifecycleManager",
        provider: provider2,
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
    handleCreate(params) {
      return __awaiter3(this, void 0, void 0, function* () {
        var _a;
        if (this.isDestroyed) {
          this.logger.error("An attempt was Create after a Destroy. No Action", {
            instanceId: params.context.instanceId
          });
          return;
        }
        if (this.isCreated) {
          this.logger.error("An attempt was invoke Create after it was already invoked. No Action", { instanceId: params.context.instanceId });
          return;
        }
        this.logger.debug("Begin Lifecycle Create", {
          instanceId: params.context.instanceId
        });
        if (!((_a = this.provider.config) === null || _a === void 0 ? void 0 : _a.onCreate)) {
          const msg = "App did not specify an onCreated handler. This is required. Closing app";
          const data = {
            appInstanceId: params.context.instanceId,
            instanceId: params.context.instanceId
          };
          this.logger.error(msg, { instanceId: params.context.instanceId });
          this.provider.sendFatalError(msg, data);
          return;
        }
        const { success } = yield this.handleLifecycleChange(
          Object.assign(Object.assign({}, params), { stage: "create" }),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
          (e) => this.provider.config.onCreate(e),
          true
        );
        if (success) {
          this.isCreated = true;
          this.sendLifecycleHandlerCompletedMessage(params.context.instanceId, "create");
        }
      });
    }
    handleLifecycleChange(evt, action, isFatal) {
      return __awaiter3(this, void 0, void 0, function* () {
        let success = false;
        try {
          yield action(evt);
          success = true;
        } catch (error) {
          const { instanceId } = evt.context;
          if (isFatal) {
            const msg = `An fatal error occurred when handling a ${evt.stage} lifecycle action. Closing app`;
            this.logger.error(msg, { instanceId, error });
            this.provider.sendFatalError(msg, error);
          } else {
            this.logger.error(`An error occurred when handling a ${evt.stage} lifecycle action.`, {
              instanceId,
              error
            });
          }
        }
        return { success };
      });
    }
    sendLifecycleHandlerCompletedMessage(appInstanceId, stage) {
      this.logger.debug(`Sending lifecycle ${stage} completed signal`);
      const proxy = this.provider.getProxy();
      proxy.sendLifecycleHandlerCompleted(appInstanceId, stage);
    }
  };

  // node_modules/@amazon-connect/app/lib-esm/lifecycle/app-lifecycle-manager.js
  var __awaiter4 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var AppLifecycleManager = class extends LifecycleManager {
    constructor(provider2) {
      super(provider2);
      this.startHandlers = /* @__PURE__ */ new Set();
      this.stopHandlers = /* @__PURE__ */ new Set();
    }
    handleLifecycleChangeMessage(msg) {
      const context = new AppContext({
        provider: this.provider,
        instanceId: msg.instanceId,
        config: msg.config,
        parameters: msg.parameters,
        contactScope: msg.contactScope,
        scope: msg.scope,
        launchedBy: msg.launchedBy
      });
      this.state.instanceId = msg.instanceId;
      this.state.appInstanceId = msg.instanceId;
      this.state.config = msg.config;
      this.state.appConfig = msg.config;
      this.state.contactScope = msg.contactScope;
      const params = { context };
      switch (msg.stage) {
        case "create":
          return this.handleCreate(params);
        case "start":
          return this.handleStart(params);
        case "stop":
          return this.handleStop(params);
        case "destroy":
          return this.handleDestroy(params);
      }
    }
    onStart(handler, options) {
      this.startHandlers.add(handler);
      if (options === null || options === void 0 ? void 0 : options.invokeIfRunning) {
        if (this.state.isRunning) {
          this.handleLifecycleChange(Object.assign(Object.assign({}, this.getAppLifecycleChangeParams()), { stage: "start" }), (e) => handler(e), false);
        }
      }
    }
    onStop(handler) {
      this.stopHandlers.add(handler);
    }
    offStart(handler) {
      this.startHandlers.delete(handler);
    }
    offStop(handler) {
      this.stopHandlers.delete(handler);
    }
    handleStart(params) {
      return __awaiter4(this, void 0, void 0, function* () {
        if (this.isDestroyed) {
          this.logger.error("An attempt was Start after a Destroy. No Action", {
            appInstanceId: params.context.instanceId
          });
          return;
        }
        if (!this.isCreated) {
          this.logger.error("An attempt was invoke Start before Create. No Action", { appInstanceId: params.context.instanceId });
          return;
        }
        this.state.isRunning = true;
        this.logger.info("Begin Lifecycle Start");
        const handlerRunResult = yield Promise.all([...this.startHandlers].map((h) => this.handleLifecycleChange(Object.assign(Object.assign({}, params), { stage: "start" }), (e) => h(e), false)));
        this.logger.debug("Completed all start handlers", {
          count: this.startHandlers.size,
          errorCount: handlerRunResult.filter(({ success }) => !success).length
        });
      });
    }
    handleStop(params) {
      return __awaiter4(this, void 0, void 0, function* () {
        if (this.isDestroyed) {
          this.logger.error("An attempt was Stop after a Destroy. No Action", {
            appInstanceId: params.context.instanceId
          });
          return;
        }
        if (!this.isCreated) {
          this.logger.error("An attempt was invoke Stop before Create. No Action", {
            appInstanceId: params.context.instanceId
          });
          return;
        }
        this.state.isRunning = false;
        this.logger.info("Begin Lifecycle Stop");
        const handlerRunResult = yield Promise.all([...this.stopHandlers].map((h) => this.handleLifecycleChange(Object.assign(Object.assign({}, params), { stage: "stop" }), (e) => h(e), false)));
        this.logger.debug("Completed all stop handlers", {
          count: this.stopHandlers.size,
          errorCount: handlerRunResult.filter(({ success }) => !success).length
        });
      });
    }
    handleDestroy(params) {
      return __awaiter4(this, void 0, void 0, function* () {
        if (this.isDestroyed) {
          this.logger.error("An attempt was invoke Destroy multiple times. No Action", {
            appInstanceId: params.context.instanceId
          });
          return;
        }
        if (!this.isCreated) {
          this.logger.error("An attempt was invoke Destroy before Create. No Action", {
            appInstanceId: params.context.instanceId
          });
          return;
        }
        this.isDestroyed = true;
        this.state.isRunning = false;
        this.logger.info("Begin Lifecycle Destroy");
        const { config } = this.provider;
        const { success } = yield this.handleLifecycleChange(Object.assign(Object.assign({}, params), { stage: "destroy" }), (e) => config.onDestroy ? config.onDestroy(e) : Promise.resolve(), true);
        if (success) {
          this.sendLifecycleHandlerCompletedMessage(params.context.instanceId, "destroy");
        }
      });
    }
    getAppLifecycleChangeParams() {
      return {
        context: new AppContext({
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
  };

  // node_modules/@amazon-connect/app/lib-esm/proxy/connection-timeout.js
  var defaultValue = 5 * 1e3;
  var maxValue = 60 * 1e3;
  function getConnectionTimeout(config) {
    var _a, _b;
    return Math.max(1, Math.min(6e4, (_b = (_a = config.workspace) === null || _a === void 0 ? void 0 : _a.connectionTimeout) !== null && _b !== void 0 ? _b : 5e3));
  }

  // node_modules/@amazon-connect/app/lib-esm/proxy/app-proxy.js
  var AppProxy = class extends Proxy {
    constructor(provider2, lifecycleManager) {
      super(provider2);
      this.channel = new MessageChannel();
      this.lifecycleManager = lifecycleManager;
      this.appLogger = new ConnectLogger({
        source: "app.appProxy",
        provider: provider2
      });
    }
    get proxyType() {
      return "AppProxy";
    }
    sendLifecycleHandlerCompleted(appInstanceId, stage) {
      const msg = {
        type: "appLifecycleHandlerCompleted",
        stage,
        appInstanceId
      };
      this.sendOrQueueMessageToSubject(msg);
    }
    tryCloseApp(message, isFatalError, data) {
      const msg = {
        type: "closeApp",
        isFatalError: isFatalError !== null && isFatalError !== void 0 ? isFatalError : false,
        message,
        data
      };
      this.sendOrQueueMessageToSubject(msg);
    }
    sendServiceError(message, data) {
      const msg = {
        type: "serviceError",
        message,
        data
      };
      this.sendOrQueueMessageToSubject(msg);
    }
    publish(topic, data) {
      const msg = {
        type: "appPublish",
        topic,
        data
      };
      this.sendOrQueueMessageToSubject(msg);
    }
    initProxy() {
      const hostInitMessage = {
        type: "connect-app-host-init",
        sdkVersion,
        providerId: this.provider.id
      };
      this.status.update({ status: "initializing" });
      this.channel.port1.onmessage = (evt) => this.consumerMessageHandler(evt);
      this.connectionTimer = TimeoutTracker.start(this.connectionTimeout.bind(this), getConnectionTimeout(this.provider.config));
      window.parent.postMessage(hostInitMessage, "*", [this.channel.port2]);
      this.appLogger.debug("Send connect message to configure proxy");
    }
    sendMessageToSubject(message) {
      this.channel.port1.postMessage(message);
    }
    getUpstreamMessageOrigin() {
      if (document === null || document === void 0 ? void 0 : document.location) {
        const { origin, pathname: path } = document.location;
        return {
          _type: "app",
          providerId: this.provider.id,
          origin,
          path
        };
      } else {
        return {
          _type: "app",
          providerId: this.provider.id,
          origin: "unknown",
          path: "unknown"
        };
      }
    }
    handleConnectionAcknowledge(msg) {
      if (!this.connectionTimer.complete()) {
        this.appLogger.error("Workspace connection acknowledge received after timeout. App is not connected to workspace.", {
          timeout: this.connectionTimer.timeoutMs
        });
        return;
      }
      super.handleConnectionAcknowledge(msg);
    }
    handleMessageFromSubject(msg) {
      switch (msg.type) {
        case "appLifecycle":
          this.lifecycleManager.handleLifecycleChangeMessage(msg).catch((error) => {
            this.appLogger.error("An error occurred when invoking handleLifecycleChangeMessage", { error });
          });
          break;
        default:
          super.handleMessageFromSubject(msg);
      }
    }
    connectionTimeout(evt) {
      this.status.update({
        status: "error",
        reason: "Workspace connection timeout",
        details: Object.assign({}, evt)
      });
      this.publishError({
        message: "App failed to connect to workspace in the allotted time",
        key: "workspaceConnectTimeout",
        details: Object.assign({}, evt),
        isFatal: true,
        proxyStatus: { initialized: false }
      });
    }
    addContextToLogger() {
      const { isRunning: appIsRunning } = this.lifecycleManager.appState;
      if (document === null || document === void 0 ? void 0 : document.location) {
        const { origin, pathname: path } = document.location;
        return { appIsRunning, app: { origin, path } };
      } else {
        return {
          appIsRunning,
          app: { origin: "unknown", path: "unknown" }
        };
      }
    }
  };

  // node_modules/@amazon-connect/app/lib-esm/amazon-connect-app.js
  var AmazonConnectApp = class _AmazonConnectApp extends AmazonConnectProviderBase {
    constructor(config) {
      super({ config, proxyFactory: () => this.createProxy() });
      this.lifecycleManager = new AppLifecycleManager(this);
      this.logger = new ConnectLogger({ provider: this, source: "app.provider" });
    }
    static init(config) {
      const provider2 = new _AmazonConnectApp(config);
      _AmazonConnectApp.initializeProvider(provider2);
      return { provider: provider2 };
    }
    static get default() {
      return getGlobalProvider("AmazonConnectApp has not been initialized");
    }
    createProxy() {
      return new AppProxy(this, this.lifecycleManager);
    }
    onStart(handler, options) {
      this.lifecycleManager.onStart(handler, options);
    }
    onStop(handler) {
      this.lifecycleManager.onStop(handler);
    }
    offStart(handler) {
      this.lifecycleManager.offStart(handler);
    }
    offStop(handler) {
      this.lifecycleManager.offStop(handler);
    }
    sendCloseAppRequest(message) {
      this.getProxy().tryCloseApp(message, false);
    }
    sendError(message, data) {
      this.logger.error(message, data);
    }
    sendFatalError(message, data) {
      this.getProxy().tryCloseApp(message, true, data ? deepClone(data) : void 0);
    }
    subscribe(topic, handler) {
      this.getProxy().subscribe(topic, handler);
    }
    unsubscribe(topic, handler) {
      this.getProxy().unsubscribe(topic, handler);
    }
    publish(topic, data) {
      this.getProxy().publish(topic, deepClone(data));
    }
  };

  // node_modules/@amazon-connect/app/lib-esm/contact-scope.js
  var AppContactScope;
  (function(AppContactScope2) {
    AppContactScope2["CurrentContactId"] = "CURRENT_CONTACT";
  })(AppContactScope || (AppContactScope = {}));

  // node_modules/@amazon-connect/contact/lib-esm/namespace.js
  var contactNamespace = "aws.connect.contact";

  // node_modules/@amazon-connect/contact/lib-esm/routes.js
  var AgentRoutes;
  (function(AgentRoutes2) {
    AgentRoutes2["getARN"] = "agent/getARN";
    AgentRoutes2["getName"] = "agent/getName";
    AgentRoutes2["getState"] = "agent/getState";
    AgentRoutes2["getRoutingProfile"] = "agent/getRoutingProfile";
    AgentRoutes2["getChannelConcurrency"] = "agent/getChannelConcurrency";
    AgentRoutes2["getExtension"] = "agent/getExtension";
    AgentRoutes2["getDialableCountries"] = "agent/getDialableCountries";
    AgentRoutes2["setAvailabilityState"] = "agent/setAvailabilityState";
    AgentRoutes2["setAvailabilityStateByName"] = "agent/setAvailabilityStateByName";
    AgentRoutes2["setOffline"] = "agent/setOffline";
    AgentRoutes2["listAvailabilityStates"] = "agent/listAvailabilityStates";
    AgentRoutes2["listQuickConnects"] = "agent/listQuickConnects";
  })(AgentRoutes || (AgentRoutes = {}));
  var ContactRoutes;
  (function(ContactRoutes2) {
    ContactRoutes2["getAttributes"] = "contact/getAttributes";
    ContactRoutes2["getInitialContactId"] = "contact/getInitialContactId";
    ContactRoutes2["getType"] = "contact/getType";
    ContactRoutes2["getStateDuration"] = "contact/getStateDuration";
    ContactRoutes2["getQueue"] = "contact/getQueue";
    ContactRoutes2["getQueueTimestamp"] = "contact/getQueueTimestamp";
    ContactRoutes2["getDescription"] = "contact/getDescription";
    ContactRoutes2["getReferences"] = "contact/getReferences";
    ContactRoutes2["getChannelType"] = "contact/getChannelType";
    ContactRoutes2["addParticipant"] = "contact/addParticipant";
    ContactRoutes2["transfer"] = "contact/transfer";
    ContactRoutes2["accept"] = "contact/accept";
    ContactRoutes2["clear"] = "contact/clear";
    ContactRoutes2["isPreviewMode"] = "contact/isPreviewMode";
    ContactRoutes2["getPreviewConfiguration"] = "contact/getPreviewConfiguration";
    ContactRoutes2["engagePreviewContact"] = "contact/engagePreviewContact";
  })(ContactRoutes || (ContactRoutes = {}));

  // node_modules/@amazon-connect/contact/lib-esm/topic-keys.js
  var ContactLifecycleTopicKey;
  (function(ContactLifecycleTopicKey2) {
    ContactLifecycleTopicKey2["StartingACW"] = "contact/acw";
    ContactLifecycleTopicKey2["Connected"] = "contact/connected";
    ContactLifecycleTopicKey2["Destroyed"] = "contact/destroy";
    ContactLifecycleTopicKey2["Missed"] = "contact/missed";
    ContactLifecycleTopicKey2["Cleared"] = "contact/cleared";
    ContactLifecycleTopicKey2["Incoming"] = "contact/incoming";
  })(ContactLifecycleTopicKey || (ContactLifecycleTopicKey = {}));
  var AgentTopicKey;
  (function(AgentTopicKey2) {
    AgentTopicKey2["StateChanged"] = "agent/stateChange";
    AgentTopicKey2["RoutingProfileChanged"] = "agent/routingProfileChanged";
    AgentTopicKey2["EnabledChannelListChanged"] = "agent/enabledChannelListChanged";
  })(AgentTopicKey || (AgentTopicKey = {}));
  var ContactTopicKey;
  /* @__PURE__ */ (function(ContactTopicKey2) {
  })(ContactTopicKey || (ContactTopicKey = {}));

  // node_modules/@amazon-connect/contact/lib-esm/agent-client.js
  var __awaiter5 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var AgentClient = class extends ConnectClientWithOptionalConfig {
    constructor(config) {
      super(contactNamespace, config);
    }
    getARN() {
      return __awaiter5(this, void 0, void 0, function* () {
        const { ARN } = yield this.context.proxy.request(AgentRoutes.getARN);
        return ARN;
      });
    }
    getName() {
      return __awaiter5(this, void 0, void 0, function* () {
        const { name } = yield this.context.proxy.request(AgentRoutes.getName);
        return name;
      });
    }
    getState() {
      return this.context.proxy.request(AgentRoutes.getState);
    }
    getRoutingProfile() {
      return this.context.proxy.request(AgentRoutes.getRoutingProfile);
    }
    getChannelConcurrency() {
      return this.context.proxy.request(AgentRoutes.getChannelConcurrency);
    }
    getExtension() {
      return __awaiter5(this, void 0, void 0, function* () {
        const { extension } = yield this.context.proxy.request(AgentRoutes.getExtension);
        return extension;
      });
    }
    /**
     * @deprecated Use `VoiceClient.listDialableCountries` instead.
     */
    getDialableCountries() {
      return __awaiter5(this, void 0, void 0, function* () {
        const { dialableCountries } = yield this.context.proxy.request(AgentRoutes.getDialableCountries);
        return dialableCountries;
      });
    }
    onStateChanged(handler) {
      this.context.proxy.subscribe({ key: AgentTopicKey.StateChanged }, handler);
    }
    offStateChanged(handler) {
      this.context.proxy.unsubscribe({ key: AgentTopicKey.StateChanged }, handler);
    }
    setAvailabilityState(agentStateARN) {
      return this.context.proxy.request(AgentRoutes.setAvailabilityState, {
        agentStateARN
      });
    }
    setAvailabilityStateByName(agentStateName) {
      return this.context.proxy.request(AgentRoutes.setAvailabilityStateByName, {
        agentStateName
      });
    }
    setOffline() {
      return this.context.proxy.request(AgentRoutes.setOffline, {});
    }
    listAvailabilityStates() {
      return this.context.proxy.request(AgentRoutes.listAvailabilityStates);
    }
    listQuickConnects(queueARNs, options) {
      return this.context.proxy.request(AgentRoutes.listQuickConnects, {
        queueARNs,
        options
      });
    }
    onEnabledChannelListChanged(handler) {
      this.context.proxy.subscribe({ key: AgentTopicKey.EnabledChannelListChanged }, handler);
    }
    offEnabledChannelListChanged(handler) {
      this.context.proxy.unsubscribe({ key: AgentTopicKey.EnabledChannelListChanged }, handler);
    }
    onRoutingProfileChanged(handler) {
      this.context.proxy.subscribe({ key: AgentTopicKey.RoutingProfileChanged }, handler);
    }
    offRoutingProfileChanged(handler) {
      this.context.proxy.unsubscribe({ key: AgentTopicKey.RoutingProfileChanged }, handler);
    }
  };

  // node_modules/@amazon-connect/contact/lib-esm/states.js
  var ContactStateType;
  /* @__PURE__ */ (function(ContactStateType2) {
  })(ContactStateType || (ContactStateType = {}));
  var ParticipantStateType;
  /* @__PURE__ */ (function(ParticipantStateType2) {
  })(ParticipantStateType || (ParticipantStateType = {}));

  // src/connect-app-init.js
  console.log("\u2705 Entry file loaded");
  var { provider } = AmazonConnectApp.init({
    onCreate: (event) => {
      var _a;
      const appInstanceId = (_a = event == null ? void 0 : event.context) == null ? void 0 : _a.appInstanceId;
      console.log("\u2705 App initialized. appInstanceId=", appInstanceId);
    },
    onDestroy: () => {
      console.log("\u{1F9F9} App being destroyed");
    }
  });
  (async () => {
    try {
      const agentClient = new AgentClient();
      const [name, state] = await Promise.all([
        agentClient.getName(),
        agentClient.getState()
      ]);
      console.table({ name, state });
    } catch (err) {
      console.error("AgentClient failed:", err);
    }
  })();
})();
