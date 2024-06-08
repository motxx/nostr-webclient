// src/user/index.ts
import { nip19 as nip194 } from "nostr-tools";

// src/events/index.ts
import { EventEmitter as EventEmitter4 } from "tseep";
import { getEventHash } from "nostr-tools";

// src/relay/index.ts
import debug from "debug";
import { EventEmitter as EventEmitter2 } from "tseep";

// src/relay/connectivity.ts
import { relayInit } from "nostr-tools";
var NDKRelayConnectivity = class {
  ndkRelay;
  _status;
  relay;
  connectedAt;
  _connectionStats = {
    attempts: 0,
    success: 0,
    durations: []
  };
  debug;
  constructor(ndkRelay) {
    this.ndkRelay = ndkRelay;
    this._status = 3 /* DISCONNECTED */;
    this.relay = relayInit(this.ndkRelay.url);
    this.debug = this.ndkRelay.debug.extend("connectivity");
    this.relay.on("notice", (notice) => this.handleNotice(notice));
  }
  async initiateAuth(filter = { limit: 1 }) {
    this.debug("Initiating authentication");
    const authSub = this.relay.sub([filter], { id: "auth-test" });
    authSub.on("eose", () => {
      authSub.unsub();
      this._status = 1 /* CONNECTED */;
      this.ndkRelay.emit("ready");
      this.debug("Authentication not required");
      authSub.unsub();
    });
    this.debug("Authentication request started");
  }
  async connect() {
    const connectHandler = () => {
      this.updateConnectionStats.connected();
      if (!this.ndkRelay.authRequired) {
        this._status = 1 /* CONNECTED */;
        this.ndkRelay.emit("connect");
        this.ndkRelay.emit("ready");
      } else {
        this._status = 6 /* AUTH_REQUIRED */;
        this.ndkRelay.emit("connect");
        this.initiateAuth();
      }
    };
    const disconnectHandler = () => {
      this.updateConnectionStats.disconnected();
      if (this._status === 1 /* CONNECTED */) {
        this._status = 3 /* DISCONNECTED */;
        this.handleReconnection();
      }
      this.ndkRelay.emit("disconnect");
    };
    const authHandler = async (challenge) => {
      this.debug("Relay requested authentication", {
        havePolicy: !!this.ndkRelay.authPolicy
      });
      if (this.ndkRelay.authPolicy) {
        if (this._status !== 7 /* AUTHENTICATING */) {
          this._status = 7 /* AUTHENTICATING */;
          await this.ndkRelay.authPolicy(this.ndkRelay, challenge);
          if (this._status === 7 /* AUTHENTICATING */) {
            this.debug("Authentication policy finished");
            this._status = 1 /* CONNECTED */;
            this.ndkRelay.emit("ready");
          }
        }
      } else {
        await this.ndkRelay.emit("auth", challenge);
      }
    };
    try {
      this.updateConnectionStats.attempt();
      this._status = 0 /* CONNECTING */;
      this.relay.off("connect", connectHandler);
      this.relay.off("disconnect", disconnectHandler);
      this.relay.on("connect", connectHandler);
      this.relay.on("disconnect", disconnectHandler);
      this.relay.on("auth", authHandler);
      await this.relay.connect();
    } catch (e) {
      this.debug("Failed to connect", e);
      this._status = 3 /* DISCONNECTED */;
      throw e;
    }
  }
  disconnect() {
    this._status = 2 /* DISCONNECTING */;
    this.relay.close();
  }
  get status() {
    return this._status;
  }
  isAvailable() {
    return this._status === 1 /* CONNECTED */;
  }
  /**
   * Evaluates the connection stats to determine if the relay is flapping.
   */
  isFlapping() {
    const durations = this._connectionStats.durations;
    if (durations.length % 3 !== 0)
      return false;
    const sum = durations.reduce((a, b) => a + b, 0);
    const avg = sum / durations.length;
    const variance = durations.map((x) => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) / durations.length;
    const stdDev = Math.sqrt(variance);
    const isFlapping = stdDev < 1e3;
    return isFlapping;
  }
  async handleNotice(notice) {
    if (notice.includes("oo many") || notice.includes("aximum")) {
      this.disconnect();
      setTimeout(() => this.connect(), 2e3);
      this.debug(this.relay.url, "Relay complaining?", notice);
    }
    this.ndkRelay.emit("notice", this.relay, notice);
  }
  /**
   * Called when the relay is unexpectedly disconnected.
   */
  handleReconnection(attempt = 0) {
    if (this.isFlapping()) {
      this.ndkRelay.emit("flapping", this, this._connectionStats);
      this._status = 5 /* FLAPPING */;
      return;
    }
    const reconnectDelay = this.connectedAt ? Math.max(0, 6e4 - (Date.now() - this.connectedAt)) : 0;
    setTimeout(() => {
      this._status = 4 /* RECONNECTING */;
      this.connect().then(() => {
        this.debug("Reconnected");
      }).catch((err) => {
        this.debug("Reconnect failed", err);
        if (attempt < 5) {
          setTimeout(() => {
            this.handleReconnection(attempt + 1);
          }, 6e4);
        } else {
          this.debug("Reconnect failed after 5 attempts");
        }
      });
    }, reconnectDelay);
  }
  /**
   * Utility functions to update the connection stats.
   */
  updateConnectionStats = {
    connected: () => {
      this._connectionStats.success++;
      this._connectionStats.connectedAt = Date.now();
    },
    disconnected: () => {
      if (this._connectionStats.connectedAt) {
        this._connectionStats.durations.push(
          Date.now() - this._connectionStats.connectedAt
        );
        if (this._connectionStats.durations.length > 100) {
          this._connectionStats.durations.shift();
        }
      }
      this._connectionStats.connectedAt = void 0;
    },
    attempt: () => {
      this._connectionStats.attempts++;
    }
  };
  /**
   * Returns the connection stats.
   */
  get connectionStats() {
    return this._connectionStats;
  }
};

// src/relay/publisher.ts
var NDKRelayPublisher = class {
  ndkRelay;
  constructor(ndkRelay) {
    this.ndkRelay = ndkRelay;
  }
  /**
   * Published an event to the relay; if the relay is not connected, it will
   * wait for the relay to connect before publishing the event.
   *
   * If the relay does not connect within the timeout, the publish operation
   * will fail.
   * @param event  The event to publish
   * @param timeoutMs  The timeout for the publish operation in milliseconds
   * @returns A promise that resolves when the event has been published or rejects if the operation times out
   */
  async publish(event, timeoutMs = 2500) {
    const publishWhenConnected = () => {
      return new Promise((resolve, reject) => {
        try {
          this.publishEvent(event, timeoutMs).then((result) => resolve(result)).catch((err) => reject(err));
        } catch (err) {
          reject(err);
        }
      });
    };
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout")), timeoutMs);
    });
    const onConnectHandler = () => {
      publishWhenConnected().then((result) => connectResolve(result)).catch((err) => connectReject(err));
    };
    let connectResolve;
    let connectReject;
    if (this.ndkRelay.status === 1 /* CONNECTED */) {
      return Promise.race([publishWhenConnected(), timeoutPromise]);
    } else {
      return Promise.race([
        new Promise((resolve, reject) => {
          connectResolve = resolve;
          connectReject = reject;
          this.ndkRelay.once("connect", onConnectHandler);
        }),
        timeoutPromise
      ]).finally(() => {
        this.ndkRelay.removeListener("connect", onConnectHandler);
      });
    }
  }
  async publishEvent(event, timeoutMs) {
    const nostrEvent = await event.toNostrEvent();
    const publish = this.ndkRelay.connectivity.relay.publish(nostrEvent);
    let publishTimeout;
    const publishPromise = new Promise((resolve, reject) => {
      publish.then(() => {
        clearTimeout(publishTimeout);
        this.ndkRelay.emit("published", event);
        resolve(true);
      }).catch((err) => {
        clearTimeout(publishTimeout);
        this.ndkRelay.debug("Publish failed", err, event.id);
        this.ndkRelay.emit("publish:failed", event, err);
        reject(err);
      });
    });
    if (!timeoutMs || event.isEphemeral()) {
      return publishPromise;
    }
    const timeoutPromise = new Promise((_, reject) => {
      publishTimeout = setTimeout(() => {
        this.ndkRelay.debug("Publish timed out", event.rawEvent());
        this.ndkRelay.emit("publish:failed", event, "Timeout");
        reject(new Error("Publish operation timed out"));
      }, timeoutMs);
    });
    return Promise.race([publishPromise, timeoutPromise]);
  }
  async auth(event) {
    return this.ndkRelay.connectivity.relay.auth(event.rawEvent());
  }
};

// src/relay/subscriptions.ts
import { EventEmitter } from "tseep";
import { matchFilter } from "nostr-tools";

// src/subscription/grouping.ts
function calculateGroupableId(filters) {
  const elements = [];
  for (const filter of filters) {
    const hasTimeConstraints = filter.since || filter.until;
    if (hasTimeConstraints)
      return null;
    const keys = Object.keys(filter || {}).sort().join("-");
    elements.push(keys);
  }
  return elements.join("|");
}
function mergeFilters(filters) {
  const result = {};
  filters.forEach((filter) => {
    Object.entries(filter).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (result[key] === void 0) {
          result[key] = [...value];
        } else {
          result[key] = Array.from(/* @__PURE__ */ new Set([...result[key], ...value]));
        }
      } else {
        result[key] = value;
      }
    });
  });
  return result;
}

// src/subscription/utils.ts
import { nip19 } from "nostr-tools";
var MAX_SUBID_LENGTH = 20;
function queryFullyFilled(subscription) {
  if (filterIncludesIds(subscription.filter)) {
    if (resultHasAllRequestedIds(subscription)) {
      return true;
    }
  }
  return false;
}
function compareFilter(filter1, filter2) {
  if (Object.keys(filter1).length !== Object.keys(filter2).length)
    return false;
  for (const [key, value] of Object.entries(filter1)) {
    const valuesInFilter2 = filter2[key];
    if (!valuesInFilter2)
      return false;
    if (Array.isArray(value) && Array.isArray(valuesInFilter2)) {
      const v = value;
      for (const valueInFilter2 of valuesInFilter2) {
        const val = valueInFilter2;
        if (!v.includes(val)) {
          return false;
        }
      }
    } else {
      if (valuesInFilter2 !== value)
        return false;
    }
  }
  return true;
}
function filterIncludesIds(filter) {
  return !!filter["ids"];
}
function resultHasAllRequestedIds(subscription) {
  const ids = subscription.filter["ids"];
  return !!ids && ids.length === subscription.eventFirstSeen.size;
}
function generateSubId(subscriptions, filters) {
  const subIds = subscriptions.map((sub) => sub.subId).filter(Boolean);
  const subIdParts = [];
  const filterNonKindKeys = /* @__PURE__ */ new Set();
  const filterKinds = /* @__PURE__ */ new Set();
  if (subIds.length > 0) {
    subIdParts.push(Array.from(new Set(subIds)).join(","));
  } else {
    for (const filter of filters) {
      for (const key of Object.keys(filter)) {
        if (key === "kinds") {
          filter.kinds?.forEach((k) => filterKinds.add(k));
        } else {
          filterNonKindKeys.add(key);
        }
      }
    }
    if (filterKinds.size > 0) {
      subIdParts.push("kinds:" + Array.from(filterKinds).join(","));
    }
    if (filterNonKindKeys.size > 0) {
      subIdParts.push(Array.from(filterNonKindKeys).join(","));
    }
  }
  let subId = subIdParts.join("-");
  if (subId.length > MAX_SUBID_LENGTH)
    subId = subId.substring(0, MAX_SUBID_LENGTH);
  if (subIds.length !== 1) {
    subId += "-" + Math.floor(Math.random() * 999).toString();
  }
  return subId;
}
function filterFromId(id) {
  let decoded;
  if (id.match(NIP33_A_REGEX)) {
    const [kind, pubkey, identifier] = id.split(":");
    const filter = {
      authors: [pubkey],
      kinds: [parseInt(kind)]
    };
    if (identifier) {
      filter["#d"] = [identifier];
    }
    return filter;
  }
  try {
    decoded = nip19.decode(id);
    switch (decoded.type) {
      case "nevent":
        return { ids: [decoded.data.id] };
      case "note":
        return { ids: [decoded.data] };
      case "naddr":
        return {
          authors: [decoded.data.pubkey],
          "#d": [decoded.data.identifier],
          kinds: [decoded.data.kind]
        };
    }
  } catch (e) {
  }
  return { ids: [id] };
}
function isNip33AValue(value) {
  return value.match(NIP33_A_REGEX) !== null;
}
var NIP33_A_REGEX = /^(\d+):([0-9A-Fa-f]+)(?::(.*))?$/;
function relaysFromBech32(bech322) {
  try {
    const decoded = nip19.decode(bech322);
    if (["naddr", "nevent"].includes(decoded?.type)) {
      const data = decoded.data;
      if (data?.relays) {
        return data.relays.map((r) => new NDKRelay(r));
      }
    }
  } catch (e) {
  }
  return [];
}

// src/relay/subscriptions.ts
var NDKGroupedSubscriptions = class extends EventEmitter {
  subscriptions;
  req;
  debug;
  constructor(subscriptions, debug7) {
    super();
    this.subscriptions = subscriptions;
    this.debug = debug7 || this.subscriptions[0].subscription.debug.extend("grouped");
    for (const subscription of subscriptions) {
      this.handleSubscriptionClosure(subscription);
    }
  }
  /**
   * Adds a subscription to this group.
   * @param subscription
   */
  addSubscription(subscription) {
    this.subscriptions.push(subscription);
    this.handleSubscriptionClosure(subscription);
  }
  eventReceived(event) {
    for (const subscription of this.subscriptions) {
      subscription.eventReceived(event);
    }
  }
  eoseReceived(relay) {
    const subscriptionsToInform = Array.from(this.subscriptions);
    subscriptionsToInform.forEach(async (subscription) => {
      subscription.subscription.eoseReceived(relay);
    });
  }
  handleSubscriptionClosure(subscription) {
    subscription.subscription.on("close", () => {
      const index = this.subscriptions.findIndex(
        (i) => i.subscription === subscription.subscription
      );
      this.subscriptions.splice(index, 1);
      if (this.subscriptions.length <= 0) {
        this.emit("close");
      }
    });
  }
  /**
   * Maps each subscription through a transformation function.
   * @param fn - The transformation function.
   * @returns A new array with each subscription transformed by fn.
   */
  map(fn) {
    return this.subscriptions.map(fn);
  }
  [Symbol.iterator]() {
    let index = 0;
    const subscriptions = this.subscriptions;
    return {
      next() {
        if (index < subscriptions.length) {
          return { value: subscriptions[index++], done: false };
        } else {
          return { value: null, done: true };
        }
      }
    };
  }
};
var NDKSubscriptionFilters = class {
  subscription;
  filters = [];
  ndkRelay;
  constructor(subscription, filters, ndkRelay) {
    this.subscription = subscription;
    this.filters = filters;
    this.ndkRelay = ndkRelay;
  }
  eventReceived(event) {
    if (!this.eventMatchesLocalFilter(event))
      return;
    this.subscription.eventReceived(event, this.ndkRelay, false);
  }
  eventMatchesLocalFilter(event) {
    const rawEvent = event.rawEvent();
    return this.filters.some((filter) => matchFilter(filter, rawEvent));
  }
};
function findMatchingActiveSubscriptions(activeSubscriptions, filters) {
  if (activeSubscriptions.length !== filters.length)
    return false;
  for (let i = 0; i < activeSubscriptions.length; i++) {
    if (!compareFilter(activeSubscriptions[i], filters[i])) {
      break;
    }
    return activeSubscriptions[i];
  }
  return void 0;
}
var NDKRelaySubscriptions = class {
  ndkRelay;
  delayedItems = /* @__PURE__ */ new Map();
  delayedTimers = /* @__PURE__ */ new Map();
  /**
   * Active subscriptions this relay is connected to
   */
  activeSubscriptions = /* @__PURE__ */ new Map();
  activeSubscriptionsByGroupId = /* @__PURE__ */ new Map();
  executionTimeoutsByGroupId = /* @__PURE__ */ new Map();
  debug;
  groupingDebug;
  conn;
  constructor(ndkRelay) {
    this.ndkRelay = ndkRelay;
    this.conn = ndkRelay.connectivity;
    this.debug = ndkRelay.debug.extend("subscriptions");
    this.groupingDebug = ndkRelay.debug.extend("grouping");
  }
  /**
   * Creates or queues a subscription to the relay.
   */
  subscribe(subscription, filters) {
    const groupableId = calculateGroupableId(filters);
    const subscriptionFilters = new NDKSubscriptionFilters(
      subscription,
      filters,
      this.ndkRelay
    );
    const isNotGroupable = !groupableId || !subscription.isGroupable();
    if (isNotGroupable) {
      this.executeSubscriptions(
        groupableId,
        // hacky
        new NDKGroupedSubscriptions([subscriptionFilters]),
        filters
      );
      return;
    }
    const activeSubscriptions = this.activeSubscriptionsByGroupId.get(groupableId);
    if (activeSubscriptions) {
      const matchingSubscription = findMatchingActiveSubscriptions(
        activeSubscriptions.filters,
        filters
      );
      if (matchingSubscription) {
        const activeSubscription = this.activeSubscriptions.get(activeSubscriptions.sub);
        activeSubscription?.addSubscription(
          new NDKSubscriptionFilters(subscription, filters, this.ndkRelay)
        );
        return;
      }
    }
    let delayedItem = this.delayedItems.get(groupableId);
    if (!delayedItem) {
      delayedItem = new NDKGroupedSubscriptions([subscriptionFilters]);
      this.delayedItems.set(groupableId, delayedItem);
      delayedItem.once("close", () => {
        const delayedItem2 = this.delayedItems.get(groupableId);
        if (!delayedItem2)
          return;
        this.delayedItems.delete(groupableId);
      });
    } else {
      delayedItem.addSubscription(subscriptionFilters);
    }
    let timeout = this.executionTimeoutsByGroupId.get(groupableId);
    if (!timeout || subscription.opts.groupableDelayType === "at-most") {
      timeout = setTimeout(() => {
        this.executeGroup(groupableId, subscription);
      }, subscription.opts.groupableDelay);
      this.executionTimeoutsByGroupId.set(groupableId, timeout);
    }
    if (this.delayedTimers.has(groupableId)) {
      this.delayedTimers.get(groupableId).push(timeout);
    } else {
      this.delayedTimers.set(groupableId, [timeout]);
    }
  }
  /**
   * Executes a delayed subscription via its groupable ID.
   * @param groupableId
   */
  executeGroup(groupableId, triggeredBy) {
    const delayedItem = this.delayedItems.get(groupableId);
    this.delayedItems.delete(groupableId);
    const timeouts = this.delayedTimers.get(groupableId);
    this.delayedTimers.delete(groupableId);
    if (timeouts) {
      for (const timeout of timeouts) {
        clearTimeout(timeout);
      }
    }
    if (delayedItem) {
      const filterCount = delayedItem.subscriptions[0].filters.length;
      const mergedFilters = [];
      for (let i = 0; i < filterCount; i++) {
        const allFiltersAtIndex = delayedItem.map((di) => di.filters[i]);
        mergedFilters.push(mergeFilters(allFiltersAtIndex));
      }
      this.executeSubscriptions(groupableId, delayedItem, mergedFilters);
    }
  }
  executeSubscriptionsWhenConnected(groupableId, groupedSubscriptions, mergedFilters) {
    const readyListener = () => {
      this.debug("new relay coming online for active subscription", {
        relay: this.ndkRelay.url,
        mergeFilters
      });
      this.executeSubscriptionsConnected(groupableId, groupedSubscriptions, mergedFilters);
    };
    this.ndkRelay.once("ready", readyListener);
    groupedSubscriptions.once("close", () => {
      this.ndkRelay.removeListener("ready", readyListener);
    });
  }
  /**
   * Executes one or more subscriptions.
   *
   * If the relay is not connected, subscriptions will be queued
   * until the relay connects.
   *
   * @param groupableId
   * @param subscriptionFilters
   * @param mergedFilters
   */
  executeSubscriptions(groupableId, groupedSubscriptions, mergedFilters) {
    if (this.conn.isAvailable()) {
      this.executeSubscriptionsConnected(groupableId, groupedSubscriptions, mergedFilters);
    } else {
      this.executeSubscriptionsWhenConnected(
        groupableId,
        groupedSubscriptions,
        mergedFilters
      );
    }
  }
  /**
   * Executes one or more subscriptions.
   *
   * When there are more than one subscription, results
   * will be sent to the right subscription
   *
   * @param subscriptions
   * @param filters The filters as they should be sent to the relay
   */
  executeSubscriptionsConnected(groupableId, groupedSubscriptions, mergedFilters) {
    const subscriptions = [];
    for (const { subscription } of groupedSubscriptions) {
      subscriptions.push(subscription);
    }
    const subId = generateSubId(subscriptions, mergedFilters);
    groupedSubscriptions.req = mergedFilters;
    const subOptions = { id: subId };
    if (this.ndkRelay.trusted || subscriptions.every((sub2) => sub2.opts.skipVerification)) {
      subOptions.skipVerification = true;
    }
    const sub = this.conn.relay.sub(mergedFilters, subOptions);
    this.activeSubscriptions.set(sub, groupedSubscriptions);
    if (groupableId) {
      this.activeSubscriptionsByGroupId.set(groupableId, { filters: mergedFilters, sub });
    }
    sub.on("event", (event) => {
      const e = new NDKEvent(void 0, event);
      e.relay = this.ndkRelay;
      const subFilters = this.activeSubscriptions.get(sub);
      subFilters?.eventReceived(e);
    });
    sub.on("eose", () => {
      const subFilters = this.activeSubscriptions.get(sub);
      subFilters?.eoseReceived(this.ndkRelay);
    });
    groupedSubscriptions.once("close", () => {
      sub.unsub();
      this.activeSubscriptions.delete(sub);
      if (groupableId) {
        this.activeSubscriptionsByGroupId.delete(groupableId);
      }
    });
    this.executeSubscriptionsWhenConnected(groupableId, groupedSubscriptions, mergedFilters);
    return sub;
  }
  executedFilters() {
    const ret = /* @__PURE__ */ new Map();
    for (const [, groupedSubscriptions] of this.activeSubscriptions) {
      ret.set(
        groupedSubscriptions.req,
        groupedSubscriptions.map((sub) => sub.subscription)
      );
    }
    return ret;
  }
};

// src/relay/index.ts
var NDKRelayStatus = /* @__PURE__ */ ((NDKRelayStatus2) => {
  NDKRelayStatus2[NDKRelayStatus2["CONNECTING"] = 0] = "CONNECTING";
  NDKRelayStatus2[NDKRelayStatus2["CONNECTED"] = 1] = "CONNECTED";
  NDKRelayStatus2[NDKRelayStatus2["DISCONNECTING"] = 2] = "DISCONNECTING";
  NDKRelayStatus2[NDKRelayStatus2["DISCONNECTED"] = 3] = "DISCONNECTED";
  NDKRelayStatus2[NDKRelayStatus2["RECONNECTING"] = 4] = "RECONNECTING";
  NDKRelayStatus2[NDKRelayStatus2["FLAPPING"] = 5] = "FLAPPING";
  NDKRelayStatus2[NDKRelayStatus2["AUTH_REQUIRED"] = 6] = "AUTH_REQUIRED";
  NDKRelayStatus2[NDKRelayStatus2["AUTHENTICATING"] = 7] = "AUTHENTICATING";
  return NDKRelayStatus2;
})(NDKRelayStatus || {});
var NDKRelay = class extends EventEmitter2 {
  url;
  scores;
  connectivity;
  subs;
  publisher;
  authPolicy;
  authRequired = false;
  /**
   * Whether this relay is trusted.
   *
   * Trusted relay's events do not get their signature verified.
   */
  trusted = false;
  complaining = false;
  debug;
  constructor(url, authPolicy) {
    super();
    this.url = url;
    this.scores = /* @__PURE__ */ new Map();
    this.debug = debug(`ndk:relay:${url}`);
    this.connectivity = new NDKRelayConnectivity(this);
    this.subs = new NDKRelaySubscriptions(this);
    this.publisher = new NDKRelayPublisher(this);
    this.authPolicy = authPolicy;
  }
  get status() {
    return this.connectivity.status;
  }
  get connectionStats() {
    return this.connectivity.connectionStats;
  }
  /**
   * Connects to the relay.
   */
  async connect() {
    return this.connectivity.connect();
  }
  /**
   * Disconnects from the relay.
   */
  disconnect() {
    if (this.status === 3 /* DISCONNECTED */) {
      return;
    }
    this.connectivity.disconnect();
  }
  /**
   * Queues or executes the subscription of a specific set of filters
   * within this relay.
   *
   * @param subscription NDKSubscription this filters belong to.
   * @param filters Filters to execute
   */
  subscribe(subscription, filters) {
    this.subs.subscribe(subscription, filters);
  }
  /**
   * Publishes an event to the relay with an optional timeout.
   *
   * If the relay is not connected, the event will be published when the relay connects,
   * unless the timeout is reached before the relay connects.
   *
   * @param event The event to publish
   * @param timeoutMs The timeout for the publish operation in milliseconds
   * @returns A promise that resolves when the event has been published or rejects if the operation times out
   */
  async publish(event, timeoutMs = 2500) {
    return this.publisher.publish(event, timeoutMs);
  }
  async auth(event) {
    return this.publisher.auth(event);
  }
  /**
   * Called when this relay has responded with an event but
   * wasn't the fastest one.
   * @param timeDiffInMs The time difference in ms between the fastest and this relay in milliseconds
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scoreSlowerEvent(timeDiffInMs) {
  }
  /** @deprecated Use referenceTags instead. */
  tagReference(marker) {
    const tag = ["r", this.url];
    if (marker) {
      tag.push(marker);
    }
    return tag;
  }
  referenceTags() {
    return [["r", this.url]];
  }
  activeSubscriptions() {
    return this.subs.executedFilters();
  }
};

// src/relay/sets/index.ts
var PublishError = class extends Error {
  errors;
  constructor(message, errors) {
    super(message);
    this.errors = errors;
  }
  get relayErrors() {
    const errors = [];
    for (const [relay, err] of this.errors) {
      errors.push(`${relay.url}: ${err}`);
    }
    return errors.join("\n");
  }
};
var NDKRelaySet = class _NDKRelaySet {
  relays;
  debug;
  ndk;
  constructor(relays, ndk) {
    this.relays = relays;
    this.ndk = ndk;
    this.debug = ndk.debug.extend("relayset");
  }
  /**
   * Adds a relay to this set.
   */
  addRelay(relay) {
    this.relays.add(relay);
  }
  /**
   * Creates a relay set from a list of relay URLs.
   *
   * If no connection to the relay is found in the pool it will temporarily
   * connect to it.
   *
   * @param relayUrls - list of relay URLs to include in this set
   * @param ndk
   * @returns NDKRelaySet
   */
  static fromRelayUrls(relayUrls, ndk) {
    const relays = /* @__PURE__ */ new Set();
    for (const url of relayUrls) {
      const relay = ndk.pool.relays.get(url);
      if (relay) {
        relays.add(relay);
      } else {
        const temporaryRelay = new NDKRelay(url);
        ndk.pool.useTemporaryRelay(temporaryRelay);
        relays.add(temporaryRelay);
      }
    }
    return new _NDKRelaySet(new Set(relays), ndk);
  }
  /**
   * Publish an event to all relays in this set. Returns the number of relays that have received the event.
   * @param event
   * @param timeoutMs - timeout in milliseconds for each publish operation and connection operation
   * @returns A set where the event was successfully published to
   * @throws PublishError if no relay was able to receive the event
   * @example
   * ```typescript
   * const event = new NDKEvent(ndk, {kinds: [NDKKind.Message], "#d": ["123"]});
   * try {
   *    const publishedToRelays = await relaySet.publish(event);
   *    console.log(`published to ${publishedToRelays.size} relays`)
   * } catch (error) {
   *   console.error("error publishing to relays", error);
   *
   *   if (error instanceof PublishError) {
   *      for (const [relay, err] of error.errors) {
   *         console.error(`error publishing to relay ${relay.url}`, err);
   *       }
   *   }
   * }
   * ```
   */
  async publish(event, timeoutMs) {
    const publishedToRelays = /* @__PURE__ */ new Set();
    const errors = /* @__PURE__ */ new Map();
    const isEphemeral2 = event.isEphemeral();
    const promises = Array.from(this.relays).map((relay) => {
      return new Promise((resolve) => {
        relay.publish(event, timeoutMs).then((e) => {
          publishedToRelays.add(relay);
          resolve();
        }).catch((err) => {
          if (!isEphemeral2) {
            errors.set(relay, err);
            this.debug("error publishing to relay", {
              relay: relay.url,
              err
            });
          }
          resolve();
        });
      });
    });
    await Promise.all(promises);
    if (publishedToRelays.size === 0) {
      if (!isEphemeral2) {
        throw new PublishError("No relay was able to receive the event", errors);
      }
    }
    return publishedToRelays;
  }
  get size() {
    return this.relays.size;
  }
};

// src/relay/sets/calculate.ts
function calculateRelaySetFromEvent(ndk, event) {
  const relays = /* @__PURE__ */ new Set();
  ndk.pool?.relays.forEach((relay) => relays.add(relay));
  return new NDKRelaySet(relays, ndk);
}
function getWriteRelaysFor(ndk, author) {
  if (!ndk.outboxTracker)
    return void 0;
  return ndk.outboxTracker.data.get(author)?.writeRelays;
}
function calculateRelaySetsFromFilter(ndk, filters) {
  const result = /* @__PURE__ */ new Map();
  const authors = /* @__PURE__ */ new Set();
  filters.forEach((filter) => {
    if (filter.authors) {
      filter.authors.forEach((author) => authors.add(author));
    }
  });
  if (authors.size > 0) {
    const authorToRelaysMap = /* @__PURE__ */ new Map();
    for (const author of authors) {
      const userWriteRelays = getWriteRelaysFor(ndk, author);
      if (userWriteRelays && userWriteRelays.size > 0) {
        ndk.debug(`Adding ${userWriteRelays.size} relays for ${author}`);
        userWriteRelays.forEach((relay) => {
          const authorsInRelay = authorToRelaysMap.get(relay) || [];
          authorsInRelay.push(author);
          authorToRelaysMap.set(relay, authorsInRelay);
        });
      } else {
        ndk.explicitRelayUrls?.forEach((relay) => {
          const authorsInRelay = authorToRelaysMap.get(relay) || [];
          authorsInRelay.push(author);
          authorToRelaysMap.set(relay, authorsInRelay);
        });
      }
    }
    for (const relayUrl of authorToRelaysMap.keys()) {
      result.set(relayUrl, []);
    }
    for (const filter of filters) {
      if (filter.authors) {
        for (const [relayUrl, authors2] of authorToRelaysMap.entries()) {
          const authorFilterAndRelayPubkeyIntersection = filter.authors.filter(
            (author) => authors2.includes(author)
          );
          result.set(relayUrl, [
            ...result.get(relayUrl),
            {
              ...filter,
              // Overwrite authors sent to this relay with the authors that were
              // present in the filter and are also present in the relay
              authors: authorFilterAndRelayPubkeyIntersection
            }
          ]);
        }
      } else {
        for (const relayUrl of authorToRelaysMap.keys()) {
          result.set(relayUrl, [...result.get(relayUrl), filter]);
        }
      }
    }
  } else {
    ndk.explicitRelayUrls?.forEach((relay) => {
      result.set(relay, filters);
    });
  }
  return result;
}
function calculateRelaySetsFromFilters(ndk, filters) {
  return calculateRelaySetsFromFilter(ndk, filters);
}

// src/zap/index.ts
import { bech32 } from "@scure/base";
import { EventEmitter as EventEmitter3 } from "tseep";
import { nip57 } from "nostr-tools";
import createDebug from "debug";
var debug2 = createDebug("ndk:zap");
var DEFAULT_RELAYS = [
  "wss://nos.lol",
  "wss://relay.nostr.band",
  "wss://relay.f7z.io",
  "wss://relay.damus.io",
  "wss://nostr.mom",
  "wss://no.str.cr"
];
var Zap = class extends EventEmitter3 {
  ndk;
  zappedEvent;
  zappedUser;
  constructor(args) {
    super();
    this.ndk = args.ndk;
    this.zappedEvent = args.zappedEvent;
    this.zappedUser = args.zappedUser || this.ndk.getUser({ hexpubkey: this.zappedEvent?.pubkey });
  }
  async getZapEndpoint() {
    let lud06;
    let lud16;
    let zapEndpoint;
    let zapEndpointCallback;
    let profile;
    if (this.zappedUser) {
      if (!this.zappedUser.profile) {
        await this.zappedUser.fetchProfile({ groupable: false });
      }
      profile = this.zappedUser.profile;
      lud06 = (this.zappedUser.profile || {}).lud06;
      lud16 = (this.zappedUser.profile || {}).lud16;
    }
    if (lud16 && !lud16.startsWith("LNURL")) {
      const [name, domain] = lud16.split("@");
      zapEndpoint = `https://${domain}/.well-known/lnurlp/${name}`;
    } else if (lud06) {
      const { words } = bech32.decode(lud06, 1e3);
      const data = bech32.fromWords(words);
      const utf8Decoder = new TextDecoder("utf-8");
      zapEndpoint = utf8Decoder.decode(data);
    }
    if (!zapEndpoint) {
      debug2("No zap endpoint found", profile, { lud06, lud16 });
      throw new Error("No zap endpoint found");
    }
    try {
      const _fetch = this.ndk.httpFetch || fetch;
      const response = await _fetch(zapEndpoint);
      if (response.status !== 200) {
        const text = await response.text();
        throw new Error(`Unable to fetch zap endpoint ${zapEndpoint}: ${text}`);
      }
      const body = await response.json();
      if (body?.allowsNostr && (body?.nostrPubkey || body?.nostrPubKey)) {
        zapEndpointCallback = body.callback;
      }
      return zapEndpointCallback;
    } catch (e) {
      throw new Error(`Unable to fetch zap endpoint ${zapEndpoint}: ${e}`);
      return;
    }
  }
  /**
   * Generates a kind:9734 zap request and returns the payment request
   * @param amount amount to zap in millisatoshis
   * @param comment optional comment to include in the zap request
   * @param extraTags optional extra tags to include in the zap request
   * @param relays optional relays to ask zapper to publish the zap to
   * @returns the payment request
   */
  async createZapRequest(amount, comment, extraTags, relays, signer) {
    const res = await this.generateZapRequest(amount, comment, extraTags, relays);
    if (!res)
      return null;
    const { event, zapEndpoint } = res;
    if (!event) {
      throw new Error("No zap request event found");
    }
    await event.sign(signer);
    let invoice;
    try {
      debug2(`Getting invoice for zap request: ${zapEndpoint}`);
      invoice = await this.getInvoice(event, amount, zapEndpoint);
    } catch (e) {
      throw new Error("Failed to get invoice: " + e);
    }
    return invoice;
  }
  async getInvoice(event, amount, zapEndpoint) {
    debug2(
      `Fetching invoice from ${zapEndpoint}?` + new URLSearchParams({
        amount: amount.toString(),
        nostr: encodeURIComponent(JSON.stringify(event.rawEvent()))
      })
    );
    const url = new URL(zapEndpoint);
    url.searchParams.append("amount", amount.toString());
    url.searchParams.append("nostr", JSON.stringify(event.rawEvent()));
    debug2(`Fetching invoice from ${url.toString()}`);
    const response = await fetch(url.toString());
    debug2(`Got response from zap endpoint: ${zapEndpoint}`, { status: response.status });
    if (response.status !== 200) {
      debug2(`Received non-200 status from zap endpoint: ${zapEndpoint}`, {
        status: response.status,
        amount,
        nostr: JSON.stringify(event.rawEvent())
      });
      const text = await response.text();
      throw new Error(`Unable to fetch zap endpoint ${zapEndpoint}: ${text}`);
    }
    const body = await response.json();
    return body.pr;
  }
  async generateZapRequest(amount, comment, extraTags, relays, signer) {
    const zapEndpoint = await this.getZapEndpoint();
    if (!zapEndpoint) {
      throw new Error("No zap endpoint found");
    }
    if (!this.zappedEvent && !this.zappedUser)
      throw new Error("No zapped event or user found");
    const zapRequest = nip57.makeZapRequest({
      profile: this.zappedUser.pubkey,
      // set the event to null since nostr-tools doesn't support nip-33 zaps
      event: null,
      amount,
      comment: comment || "",
      relays: relays ?? this.relays()
    });
    if (this.zappedEvent) {
      const tags = this.zappedEvent.referenceTags();
      const nonPTags = tags.filter((tag) => tag[0] !== "p");
      zapRequest.tags.push(...nonPTags);
    }
    zapRequest.tags.push(["lnurl", zapEndpoint]);
    const event = new NDKEvent(this.ndk, zapRequest);
    if (extraTags) {
      event.tags = event.tags.concat(extraTags);
    }
    return { event, zapEndpoint };
  }
  /**
   * @returns the relays to use for the zap request
   */
  relays() {
    let r = [];
    if (this.ndk?.pool?.relays) {
      r = this.ndk.pool.urls();
    }
    if (!r.length) {
      r = DEFAULT_RELAYS;
    }
    return r;
  }
};

// src/events/content-tagger.ts
import { nip19 as nip192 } from "nostr-tools";
function mergeTags(tags1, tags2) {
  const tagMap = /* @__PURE__ */ new Map();
  const generateKey = (tag) => tag.join(",");
  const isContained = (smaller, larger) => {
    return smaller.every((value, index) => value === larger[index]);
  };
  const processTag = (tag) => {
    for (let [key, existingTag] of tagMap) {
      if (isContained(existingTag, tag) || isContained(tag, existingTag)) {
        if (tag.length >= existingTag.length) {
          tagMap.set(key, tag);
        }
        return;
      }
    }
    tagMap.set(generateKey(tag), tag);
  };
  tags1.concat(tags2).forEach(processTag);
  return Array.from(tagMap.values());
}
async function generateContentTags(content, tags = []) {
  const tagRegex = /(@|nostr:)(npub|nprofile|note|nevent|naddr)[a-zA-Z0-9]+/g;
  const hashtagRegex = /#(\w+)/g;
  let promises = [];
  const addTagIfNew = (t) => {
    if (!tags.find((t2) => t2[0] === t[0] && t2[1] === t[1])) {
      tags.push(t);
    }
  };
  content = content.replace(tagRegex, (tag) => {
    try {
      const entity = tag.split(/(@|nostr:)/)[2];
      const { type, data } = nip192.decode(entity);
      let t;
      switch (type) {
        case "npub":
          t = ["p", data];
          break;
        case "nprofile":
          t = ["p", data.pubkey];
          break;
        case "note":
          promises.push(
            new Promise(async (resolve) => {
              addTagIfNew([
                "e",
                data,
                await maybeGetEventRelayUrl(entity),
                "mention"
              ]);
              resolve();
            })
          );
          break;
        case "nevent":
          promises.push(
            new Promise(async (resolve) => {
              let { id, relays, author } = data;
              if (!relays || relays.length === 0) {
                relays = [await maybeGetEventRelayUrl(entity)];
              }
              addTagIfNew(["e", id, relays[0], "mention"]);
              if (author)
                addTagIfNew(["p", author]);
              resolve();
            })
          );
          break;
        case "naddr":
          promises.push(
            new Promise(async (resolve) => {
              const id = [data.kind, data.pubkey, data.identifier].join(":");
              let relays = data.relays ?? [];
              if (relays.length === 0) {
                relays = [await maybeGetEventRelayUrl(entity)];
              }
              addTagIfNew(["a", id, relays[0], "mention"]);
              addTagIfNew(["p", data.pubkey]);
              resolve();
            })
          );
          break;
        default:
          return tag;
      }
      if (t)
        addTagIfNew(t);
      return `nostr:${entity}`;
    } catch (error) {
      return tag;
    }
  });
  await Promise.all(promises);
  content = content.replace(hashtagRegex, (tag, word) => {
    const t = ["t", word];
    if (!tags.find((t2) => t2[0] === t[0] && t2[1] === t[1])) {
      tags.push(t);
    }
    return tag;
  });
  return { content, tags };
}
async function maybeGetEventRelayUrl(nip19Id) {
  return "";
}

// src/events/kind.ts
function isReplaceable() {
  if (this.kind === void 0)
    throw new Error("Kind not set");
  return this.kind >= 1e4 && this.kind < 2e4;
}
function isEphemeral() {
  if (this.kind === void 0)
    throw new Error("Kind not set");
  return this.kind >= 2e4 && this.kind < 3e4;
}
function isParamReplaceable() {
  if (this.kind === void 0)
    throw new Error("Kind not set");
  return this.kind >= 3e4 && this.kind < 4e4;
}

// src/events/kinds/index.ts
var NDKKind = /* @__PURE__ */ ((NDKKind2) => {
  NDKKind2[NDKKind2["Metadata"] = 0] = "Metadata";
  NDKKind2[NDKKind2["Text"] = 1] = "Text";
  NDKKind2[NDKKind2["RecommendRelay"] = 2] = "RecommendRelay";
  NDKKind2[NDKKind2["Contacts"] = 3] = "Contacts";
  NDKKind2[NDKKind2["EncryptedDirectMessage"] = 4] = "EncryptedDirectMessage";
  NDKKind2[NDKKind2["EventDeletion"] = 5] = "EventDeletion";
  NDKKind2[NDKKind2["Repost"] = 6] = "Repost";
  NDKKind2[NDKKind2["Reaction"] = 7] = "Reaction";
  NDKKind2[NDKKind2["BadgeAward"] = 8] = "BadgeAward";
  NDKKind2[NDKKind2["GroupChat"] = 9] = "GroupChat";
  NDKKind2[NDKKind2["GroupNote"] = 11] = "GroupNote";
  NDKKind2[NDKKind2["GroupReply"] = 12] = "GroupReply";
  NDKKind2[NDKKind2["GenericRepost"] = 16] = "GenericRepost";
  NDKKind2[NDKKind2["ChannelCreation"] = 40] = "ChannelCreation";
  NDKKind2[NDKKind2["ChannelMetadata"] = 41] = "ChannelMetadata";
  NDKKind2[NDKKind2["ChannelMessage"] = 42] = "ChannelMessage";
  NDKKind2[NDKKind2["ChannelHideMessage"] = 43] = "ChannelHideMessage";
  NDKKind2[NDKKind2["ChannelMuteUser"] = 44] = "ChannelMuteUser";
  NDKKind2[NDKKind2["Media"] = 1063] = "Media";
  NDKKind2[NDKKind2["Report"] = 1984] = "Report";
  NDKKind2[NDKKind2["Label"] = 1985] = "Label";
  NDKKind2[NDKKind2["DVMReqTextExtraction"] = 5e3] = "DVMReqTextExtraction";
  NDKKind2[NDKKind2["DVMReqTextSummarization"] = 5001] = "DVMReqTextSummarization";
  NDKKind2[NDKKind2["DVMReqTextTranslation"] = 5002] = "DVMReqTextTranslation";
  NDKKind2[NDKKind2["DVMReqTextGeneration"] = 5050] = "DVMReqTextGeneration";
  NDKKind2[NDKKind2["DVMReqImageGeneration"] = 5100] = "DVMReqImageGeneration";
  NDKKind2[NDKKind2["DVMReqDiscoveryNostrContent"] = 5300] = "DVMReqDiscoveryNostrContent";
  NDKKind2[NDKKind2["DVMReqDiscoveryNostrPeople"] = 5301] = "DVMReqDiscoveryNostrPeople";
  NDKKind2[NDKKind2["DVMReqTimestamping"] = 5900] = "DVMReqTimestamping";
  NDKKind2[NDKKind2["DVMEventSchedule"] = 5905] = "DVMEventSchedule";
  NDKKind2[NDKKind2["DVMJobFeedback"] = 7e3] = "DVMJobFeedback";
  NDKKind2[NDKKind2["Subscribe"] = 7001] = "Subscribe";
  NDKKind2[NDKKind2["Unsubscribe"] = 7002] = "Unsubscribe";
  NDKKind2[NDKKind2["SubscriptionReceipt"] = 7003] = "SubscriptionReceipt";
  NDKKind2[NDKKind2["GroupAdminAddUser"] = 9e3] = "GroupAdminAddUser";
  NDKKind2[NDKKind2["GroupAdminRemoveUser"] = 9001] = "GroupAdminRemoveUser";
  NDKKind2[NDKKind2["GroupAdminEditMetadata"] = 9002] = "GroupAdminEditMetadata";
  NDKKind2[NDKKind2["GroupAdminEditStatus"] = 9006] = "GroupAdminEditStatus";
  NDKKind2[NDKKind2["MuteList"] = 1e4] = "MuteList";
  NDKKind2[NDKKind2["PinList"] = 10001] = "PinList";
  NDKKind2[NDKKind2["RelayList"] = 10002] = "RelayList";
  NDKKind2[NDKKind2["BookmarkList"] = 10003] = "BookmarkList";
  NDKKind2[NDKKind2["CommunityList"] = 10004] = "CommunityList";
  NDKKind2[NDKKind2["PublicChatList"] = 10005] = "PublicChatList";
  NDKKind2[NDKKind2["BlockRelayList"] = 10006] = "BlockRelayList";
  NDKKind2[NDKKind2["SearchRelayList"] = 10007] = "SearchRelayList";
  NDKKind2[NDKKind2["InterestList"] = 10015] = "InterestList";
  NDKKind2[NDKKind2["EmojiList"] = 10030] = "EmojiList";
  NDKKind2[NDKKind2["TierList"] = 17e3] = "TierList";
  NDKKind2[NDKKind2["FollowSet"] = 3e4] = "FollowSet";
  NDKKind2[NDKKind2["CategorizedPeopleList"] = 3e4 /* FollowSet */] = "CategorizedPeopleList";
  NDKKind2[NDKKind2["CategorizedBookmarkList"] = 30001] = "CategorizedBookmarkList";
  NDKKind2[NDKKind2["RelaySet"] = 30002] = "RelaySet";
  NDKKind2[NDKKind2["CategorizedRelayList"] = 30002 /* RelaySet */] = "CategorizedRelayList";
  NDKKind2[NDKKind2["BookmarkSet"] = 30003] = "BookmarkSet";
  NDKKind2[NDKKind2["CurationSet"] = 30004] = "CurationSet";
  NDKKind2[NDKKind2["ArticleCurationSet"] = 30004] = "ArticleCurationSet";
  NDKKind2[NDKKind2["VideoCurationSet"] = 30005] = "VideoCurationSet";
  NDKKind2[NDKKind2["InterestSet"] = 30015] = "InterestSet";
  NDKKind2[NDKKind2["InterestsList"] = 30015 /* InterestSet */] = "InterestsList";
  NDKKind2[NDKKind2["EmojiSet"] = 30030] = "EmojiSet";
  NDKKind2[NDKKind2["HighlightSet"] = 39802] = "HighlightSet";
  NDKKind2[NDKKind2["SubscriptionTier"] = 37001] = "SubscriptionTier";
  NDKKind2[NDKKind2["CategorizedHighlightList"] = 39802 /* HighlightSet */] = "CategorizedHighlightList";
  NDKKind2[NDKKind2["ZapRequest"] = 9734] = "ZapRequest";
  NDKKind2[NDKKind2["Zap"] = 9735] = "Zap";
  NDKKind2[NDKKind2["Highlight"] = 9802] = "Highlight";
  NDKKind2[NDKKind2["ClientAuth"] = 22242] = "ClientAuth";
  NDKKind2[NDKKind2["NostrConnect"] = 24133] = "NostrConnect";
  NDKKind2[NDKKind2["NWCInfoEvent"] = 13194] = "NWCInfoEvent";
  NDKKind2[NDKKind2["NWCRequest"] = 23194] = "NWCRequest";
  NDKKind2[NDKKind2["NWCResponse"] = 23195] = "NWCResponse";
  NDKKind2[NDKKind2["NWARequest"] = 33194] = "NWARequest";
  NDKKind2[NDKKind2["HttpAuth"] = 27235] = "HttpAuth";
  NDKKind2[NDKKind2["ProfileBadge"] = 30008] = "ProfileBadge";
  NDKKind2[NDKKind2["BadgeDefinition"] = 30009] = "BadgeDefinition";
  NDKKind2[NDKKind2["MarketStall"] = 30017] = "MarketStall";
  NDKKind2[NDKKind2["MarketProduct"] = 30018] = "MarketProduct";
  NDKKind2[NDKKind2["Article"] = 30023] = "Article";
  NDKKind2[NDKKind2["AppSpecificData"] = 30078] = "AppSpecificData";
  NDKKind2[NDKKind2["Classified"] = 30402] = "Classified";
  NDKKind2[NDKKind2["HorizontalVideo"] = 34235] = "HorizontalVideo";
  NDKKind2[NDKKind2["GroupMetadata"] = 39e3] = "GroupMetadata";
  NDKKind2[NDKKind2["GroupMembers"] = 39002] = "GroupMembers";
  NDKKind2[NDKKind2["AppRecommendation"] = 31989] = "AppRecommendation";
  NDKKind2[NDKKind2["AppHandler"] = 31990] = "AppHandler";
  return NDKKind2;
})(NDKKind || {});
var NDKListKinds = [
  1e4 /* MuteList */,
  10001 /* PinList */,
  10002 /* RelayList */,
  10003 /* BookmarkList */,
  10004 /* CommunityList */,
  10005 /* PublicChatList */,
  10006 /* BlockRelayList */,
  10007 /* SearchRelayList */,
  10015 /* InterestList */,
  10030 /* EmojiList */,
  3e4 /* FollowSet */,
  30003 /* BookmarkSet */,
  30001 /* CategorizedBookmarkList */,
  // Backwards compatibility
  30002 /* RelaySet */,
  30004 /* ArticleCurationSet */,
  30005 /* VideoCurationSet */,
  30015 /* InterestSet */,
  30030 /* EmojiSet */,
  39802 /* HighlightSet */
];

// src/events/nip04.ts
async function encrypt(recipient, signer) {
  if (!this.ndk)
    throw new Error("No NDK instance found!");
  if (!signer) {
    await this.ndk.assertSigner();
    signer = this.ndk.signer;
  }
  if (!recipient) {
    const pTags = this.getMatchingTags("p");
    if (pTags.length !== 1) {
      throw new Error(
        "No recipient could be determined and no explicit recipient was provided"
      );
    }
    recipient = this.ndk.getUser({ hexpubkey: pTags[0][1] });
  }
  this.content = await signer?.encrypt(recipient, this.content);
}
async function decrypt(sender, signer) {
  if (!this.ndk)
    throw new Error("No NDK instance found!");
  if (!signer) {
    await this.ndk.assertSigner();
    signer = this.ndk.signer;
  }
  if (!sender) {
    sender = this.author;
  }
  this.content = await signer?.decrypt(sender, this.content);
}

// src/events/nip19.ts
import { nip19 as nip193 } from "nostr-tools";
function encode() {
  let relays = [];
  if (this.onRelays.length > 0) {
    relays = this.onRelays.map((relay) => relay.url);
  } else if (this.relay) {
    relays = [this.relay.url];
  }
  if (this.isParamReplaceable()) {
    return nip193.naddrEncode({
      kind: this.kind,
      pubkey: this.pubkey,
      identifier: this.replaceableDTag(),
      relays
    });
  } else if (relays.length > 0) {
    return nip193.neventEncode({
      id: this.tagId(),
      relays,
      author: this.pubkey
    });
  } else {
    return nip193.noteEncode(this.tagId());
  }
}

// src/events/repost.ts
async function repost(publish = true, signer) {
  if (!signer && publish) {
    if (!this.ndk)
      throw new Error("No NDK instance found");
    this.ndk.assertSigner();
    signer = this.ndk.signer;
  }
  const e = new NDKEvent(this.ndk, {
    kind: getKind(this),
    content: ""
  });
  e.tag(this);
  if (e.kind === 16 /* GenericRepost */) {
    e.tags.push(["k", `${this.kind}`]);
  }
  if (signer)
    await e.sign(signer);
  if (publish)
    await e.publish();
  return e;
}
function getKind(event) {
  if (event.kind === 1) {
    return 6 /* Repost */;
  }
  return 16 /* GenericRepost */;
}

// src/events/index.ts
var NDKEvent = class _NDKEvent extends EventEmitter4 {
  ndk;
  created_at;
  content = "";
  tags = [];
  kind;
  id = "";
  sig;
  pubkey = "";
  _author = void 0;
  /**
   * The relay that this event was first received from.
   */
  relay;
  /**
   * The relays that this event was received from and/or successfully published to.
   */
  onRelays = [];
  constructor(ndk, event) {
    super();
    this.ndk = ndk;
    this.created_at = event?.created_at;
    this.content = event?.content || "";
    this.tags = event?.tags || [];
    this.id = event?.id || "";
    this.sig = event?.sig;
    this.pubkey = event?.pubkey || "";
    this.kind = event?.kind;
  }
  /**
   * Returns the event as is.
   */
  rawEvent() {
    return {
      created_at: this.created_at,
      content: this.content,
      tags: this.tags,
      kind: this.kind,
      pubkey: this.pubkey,
      id: this.id,
      sig: this.sig
    };
  }
  set author(user) {
    this.pubkey = user.hexpubkey;
    this._author = void 0;
  }
  /**
   * Returns an NDKUser for the author of the event.
   */
  get author() {
    if (this._author)
      return this._author;
    if (!this.ndk)
      throw new Error("No NDK instance found");
    const user = this.ndk.getUser({ hexpubkey: this.pubkey });
    this._author = user;
    return user;
  }
  tag(userOrTagOrEvent, marker, skipAuthorTag) {
    let tags = [];
    const isNDKUser = userOrTagOrEvent.fetchProfile !== void 0;
    if (isNDKUser) {
      const tag = ["p", userOrTagOrEvent.pubkey];
      if (marker)
        tag.push(...["", marker]);
      tags.push(tag);
    } else if (userOrTagOrEvent instanceof _NDKEvent) {
      const event = userOrTagOrEvent;
      skipAuthorTag ??= event?.pubkey === this.pubkey;
      tags = event.referenceTags(marker, skipAuthorTag);
      for (const pTag of event.getMatchingTags("p")) {
        if (pTag[1] === this.pubkey)
          continue;
        if (this.tags.find((t) => t[0] === "p" && t[1] === pTag[1]))
          continue;
        this.tags.push(["p", pTag[1]]);
      }
    } else if (Array.isArray(userOrTagOrEvent)) {
      tags = [userOrTagOrEvent];
    } else {
      throw new Error("Invalid argument", userOrTagOrEvent);
    }
    this.tags = mergeTags(this.tags, tags);
  }
  /**
   * Return a NostrEvent object, trying to fill in missing fields
   * when possible, adding tags when necessary.
   * @param pubkey {string} The pubkey of the user who the event belongs to.
   * @returns {Promise<NostrEvent>} A promise that resolves to a NostrEvent.
   */
  async toNostrEvent(pubkey) {
    if (!pubkey && this.pubkey === "") {
      const user = await this.ndk?.signer?.user();
      this.pubkey = user?.hexpubkey || "";
    }
    if (!this.created_at)
      this.created_at = Math.floor(Date.now() / 1e3);
    const nostrEvent = this.rawEvent();
    const { content, tags } = await this.generateTags();
    nostrEvent.content = content || "";
    nostrEvent.tags = tags;
    try {
      this.id = getEventHash(nostrEvent);
    } catch (e) {
    }
    if (this.id)
      nostrEvent.id = this.id;
    if (this.sig)
      nostrEvent.sig = this.sig;
    return nostrEvent;
  }
  isReplaceable = isReplaceable.bind(this);
  isEphemeral = isEphemeral.bind(this);
  isParamReplaceable = isParamReplaceable.bind(this);
  /**
   * Encodes a bech32 id.
   *
   * @param relays {string[]} The relays to encode in the id
   * @returns {string} - Encoded naddr, note or nevent.
   */
  encode = encode.bind(this);
  encrypt = encrypt.bind(this);
  decrypt = decrypt.bind(this);
  /**
   * Get all tags with the given name
   * @param tagName {string} The name of the tag to search for
   * @returns {NDKTag[]} An array of the matching tags
   */
  getMatchingTags(tagName) {
    return this.tags.filter((tag) => tag[0] === tagName);
  }
  /**
   * Get the first tag with the given name
   * @param tagName Tag name to search for
   * @returns The value of the first tag with the given name, or undefined if no such tag exists
   */
  tagValue(tagName) {
    const tags = this.getMatchingTags(tagName);
    if (tags.length === 0)
      return void 0;
    return tags[0][1];
  }
  /**
   * Gets the NIP-31 "alt" tag of the event.
   */
  get alt() {
    return this.tagValue("alt");
  }
  /**
   * Sets the NIP-31 "alt" tag of the event. Use this to set an alt tag so
   * clients that don't handle a particular event kind can display something
   * useful for users.
   */
  set alt(alt) {
    this.removeTag("alt");
    if (alt)
      this.tags.push(["alt", alt]);
  }
  /**
   * Gets the NIP-33 "d" tag of the event.
   */
  get dTag() {
    return this.tagValue("d");
  }
  /**
   * Sets the NIP-33 "d" tag of the event.
   */
  set dTag(value) {
    this.removeTag("d");
    if (value)
      this.tags.push(["d", value]);
  }
  /**
   * Remove all tags with the given name (e.g. "d", "a", "p")
   * @param tagName Tag name to search for and remove
   * @returns {void}
   */
  removeTag(tagName) {
    this.tags = this.tags.filter((tag) => tag[0] !== tagName);
  }
  /**
   * Sign the event if a signer is present.
   *
   * It will generate tags.
   * Repleacable events will have their created_at field set to the current time.
   * @param signer {NDKSigner} The NDKSigner to use to sign the event
   * @returns {Promise<string>} A Promise that resolves to the signature of the signed event.
   */
  async sign(signer) {
    if (!signer) {
      this.ndk?.assertSigner();
      signer = this.ndk.signer;
    } else {
      this.author = await signer.user();
    }
    await this.generateTags();
    if (this.isReplaceable()) {
      this.created_at = Math.floor(Date.now() / 1e3);
    }
    const nostrEvent = await this.toNostrEvent();
    this.sig = await signer.sign(nostrEvent);
    return this.sig;
  }
  /**
   * Attempt to sign and then publish an NDKEvent to a given relaySet.
   * If no relaySet is provided, the relaySet will be calculated by NDK.
   * @param relaySet {NDKRelaySet} The relaySet to publish the even to.
   * @returns A promise that resolves to the relays the event was published to.
   */
  async publish(relaySet, timeoutMs) {
    if (!this.sig)
      await this.sign();
    if (!this.ndk)
      throw new Error("NDKEvent must be associated with an NDK instance to publish");
    if (!relaySet) {
      relaySet = this.ndk.devWriteRelaySet || calculateRelaySetFromEvent(this.ndk, this);
    }
    this.ndk.debug(`publish to ${relaySet.size} relays`, this.rawEvent());
    const relays = await relaySet.publish(this, timeoutMs);
    this.onRelays = Array.from(relays);
    return relays;
  }
  /**
   * Generates tags for users, notes, and other events tagged in content.
   * Will also generate random "d" tag for parameterized replaceable events where needed.
   * @returns {ContentTag} The tags and content of the event.
   */
  async generateTags() {
    let tags = [];
    const g = await generateContentTags(this.content, this.tags);
    const content = g.content;
    tags = g.tags;
    if (this.kind && this.isParamReplaceable()) {
      const dTag = this.getMatchingTags("d")[0];
      if (!dTag) {
        const title = this.tagValue("title");
        const randLength = title ? 6 : 16;
        let str = [...Array(randLength)].map(() => Math.random().toString(36)[2]).join("");
        if (title && title.length > 0) {
          str = title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") + "-" + str;
        }
        tags.push(["d", str]);
      }
    }
    if ((this.ndk?.clientName || this.ndk?.clientNip89) && !this.tagValue("client")) {
      const clientTag = ["client", this.ndk.clientName ?? ""];
      if (this.ndk.clientNip89)
        clientTag.push(this.ndk.clientNip89);
      tags.push(clientTag);
    }
    return { content: content || "", tags };
  }
  muted() {
    const authorMutedEntry = this.ndk?.mutedIds.get(this.pubkey);
    if (authorMutedEntry && authorMutedEntry === "p")
      return "author";
    const eventTagReference = this.tagReference();
    const eventMutedEntry = this.ndk?.mutedIds.get(eventTagReference[1]);
    if (eventMutedEntry && eventMutedEntry === eventTagReference[0])
      return "event";
    return null;
  }
  /**
   * Returns the "d" tag of a parameterized replaceable event or throws an error if the event isn't
   * a parameterized replaceable event.
   * @returns {string} the "d" tag of the event.
   */
  replaceableDTag() {
    if (this.kind && this.kind >= 3e4 && this.kind <= 4e4) {
      const dTag = this.getMatchingTags("d")[0];
      const dTagId = dTag ? dTag[1] : "";
      return dTagId;
    }
    throw new Error("Event is not a parameterized replaceable event");
  }
  /**
   * Provides a deduplication key for the event.
   *
   * For kinds 0, 3, 10k-20k this will be the event <kind>:<pubkey>
   * For kinds 30k-40k this will be the event <kind>:<pubkey>:<d-tag>
   * For all other kinds this will be the event id
   */
  deduplicationKey() {
    if (this.kind === 0 || this.kind === 3 || this.kind && this.kind >= 1e4 && this.kind < 2e4) {
      return `${this.kind}:${this.pubkey}`;
    } else {
      return this.tagId();
    }
  }
  /**
   * Returns the id of the event or, if it's a parameterized event, the generated id of the event using "d" tag, pubkey, and kind.
   * @returns {string} The id
   */
  tagId() {
    if (this.isParamReplaceable()) {
      return this.tagAddress();
    }
    return this.id;
  }
  /**
   * Returns the "reference" value ("<kind>:<author-pubkey>:<d-tag>") for this replaceable event.
   * @returns {string} The id
   */
  tagAddress() {
    if (!this.isParamReplaceable()) {
      throw new Error("This must only be called on replaceable events");
    }
    const dTagId = this.replaceableDTag();
    return `${this.kind}:${this.pubkey}:${dTagId}`;
  }
  /**
   * Get the tag that can be used to reference this event from another event.
   *
   * Consider using referenceTags() instead (unless you have a good reason to use this)
   *
   * @example
   *     event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
   *     event.tagReference(); // ["a", "30000:pubkey:d-code"]
   *
   *     event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
   *     event.tagReference(); // ["e", "eventid"]
   * @returns {NDKTag} The NDKTag object referencing this event
   */
  tagReference(marker) {
    let tag;
    if (this.isParamReplaceable()) {
      tag = ["a", this.tagAddress()];
    } else {
      tag = ["e", this.tagId()];
    }
    if (this.relay) {
      tag.push(this.relay.url);
    } else {
      tag.push("");
    }
    if (marker) {
      tag.push(marker);
    }
    return tag;
  }
  /**
   * Get the tags that can be used to reference this event from another event
   * @param marker The marker to use in the tag
   * @example
   *     event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
   *     event.referenceTags(); // [["a", "30000:pubkey:d-code"], ["e", "parent-id"]]
   *
   *     event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
   *     event.referenceTags(); // [["e", "parent-id"]]
   * @returns {NDKTag} The NDKTag object referencing this event
   */
  referenceTags(marker, skipAuthorTag) {
    let tags = [];
    if (this.isParamReplaceable()) {
      tags = [
        ["a", this.tagAddress()],
        ["e", this.id]
      ];
    } else {
      tags = [["e", this.id]];
    }
    if (this.relay?.url) {
      tags = tags.map((tag) => {
        tag.push(this.relay?.url);
        return tag;
      });
    } else if (marker) {
      tags = tags.map((tag) => {
        tag.push("");
        return tag;
      });
    }
    if (marker) {
      tags.forEach((tag) => tag.push(marker));
    }
    if (!skipAuthorTag)
      tags.push(...this.author.referenceTags());
    return tags;
  }
  /**
   * Provides the filter that will return matching events for this event.
   *
   * @example
   *    event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
   *    event.filter(); // { "#a": ["30000:pubkey:d-code"] }
   * @example
   *    event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
   *    event.filter(); // { "#e": ["eventid"] }
   *
   * @returns The filter that will return matching events for this event
   */
  filter() {
    if (this.isParamReplaceable()) {
      return { "#a": [this.tagId()] };
    } else {
      return { "#e": [this.tagId()] };
    }
  }
  /**
   * Create a zap request for an existing event
   *
   * @param amount The amount to zap in millisatoshis
   * @param comment A comment to add to the zap request
   * @param extraTags Extra tags to add to the zap request
   * @param recipient The zap recipient (optional for events)
   * @param signer The signer to use (will default to the NDK instance's signer)
   */
  async zap(amount, comment, extraTags, recipient, signer) {
    if (!this.ndk)
      throw new Error("No NDK instance found");
    if (!signer) {
      this.ndk.assertSigner();
    }
    const zap = new Zap({
      ndk: this.ndk,
      zappedEvent: this,
      zappedUser: recipient
    });
    const relays = Array.from(this.ndk.pool.relays.keys());
    const paymentRequest = await zap.createZapRequest(
      amount,
      comment,
      extraTags,
      relays,
      signer
    );
    return paymentRequest;
  }
  /**
   * Generates a deletion event of the current event
   *
   * @param reason The reason for the deletion
   * @param publish Whether to publish the deletion event automatically
   * @returns The deletion event
   */
  async delete(reason, publish = true) {
    if (!this.ndk)
      throw new Error("No NDK instance found");
    this.ndk.assertSigner();
    const e = new _NDKEvent(this.ndk, {
      kind: 5 /* EventDeletion */,
      content: reason || ""
    });
    e.tag(this);
    if (publish)
      await e.publish();
    return e;
  }
  /**
   * NIP-18 reposting event.
   *
   * @param publish Whether to publish the reposted event automatically
   * @param signer The signer to use for signing the reposted event
   * @returns The reposted event
   *
   * @function
   */
  repost = repost.bind(this);
  /**
   * React to an existing event
   *
   * @param content The content of the reaction
   */
  async react(content, publish = true) {
    if (!this.ndk)
      throw new Error("No NDK instance found");
    this.ndk.assertSigner();
    const e = new _NDKEvent(this.ndk, {
      kind: 7 /* Reaction */,
      content
    });
    e.tag(this);
    if (publish) {
      await e.publish();
    } else {
      await e.sign();
    }
    return e;
  }
  /**
   * Checks whether the event is valid per underlying NIPs.
   *
   * This method is meant to be overridden by subclasses that implement specific NIPs
   * to allow the enforcement of NIP-specific validation rules.
   *
   *
   */
  get isValid() {
    return true;
  }
};

// src/subscription/index.ts
import { EventEmitter as EventEmitter5 } from "tseep";
var NDKSubscriptionCacheUsage = /* @__PURE__ */ ((NDKSubscriptionCacheUsage2) => {
  NDKSubscriptionCacheUsage2["ONLY_CACHE"] = "ONLY_CACHE";
  NDKSubscriptionCacheUsage2["CACHE_FIRST"] = "CACHE_FIRST";
  NDKSubscriptionCacheUsage2["PARALLEL"] = "PARALLEL";
  NDKSubscriptionCacheUsage2["ONLY_RELAY"] = "ONLY_RELAY";
  return NDKSubscriptionCacheUsage2;
})(NDKSubscriptionCacheUsage || {});
var defaultOpts = {
  closeOnEose: false,
  cacheUsage: "CACHE_FIRST" /* CACHE_FIRST */,
  groupable: true,
  groupableDelay: 100,
  groupableDelayType: "at-most"
};
var NDKSubscription = class extends EventEmitter5 {
  subId;
  filters;
  opts;
  pool;
  skipVerification = false;
  skipValidation = false;
  /**
   * Tracks the filters as they are executed on each relay
   */
  relayFilters;
  relaySet;
  ndk;
  debug;
  eoseDebug;
  /**
   * Events that have been seen by the subscription, with the time they were first seen.
   */
  eventFirstSeen = /* @__PURE__ */ new Map();
  /**
   * Relays that have sent an EOSE.
   */
  eosesSeen = /* @__PURE__ */ new Set();
  /**
   * Events that have been seen by the subscription per relay.
   */
  eventsPerRelay = /* @__PURE__ */ new Map();
  /**
   * The time the last event was received by the subscription.
   * This is used to calculate when EOSE should be emitted.
   */
  lastEventReceivedAt;
  internalId;
  constructor(ndk, filters, opts, relaySet, subId) {
    super();
    this.ndk = ndk;
    this.pool = opts?.pool || ndk.pool;
    this.opts = { ...defaultOpts, ...opts || {} };
    this.filters = filters instanceof Array ? filters : [filters];
    this.subId = subId || opts?.subId;
    this.internalId = Math.random().toString(36).substring(7);
    this.relaySet = relaySet;
    this.debug = ndk.debug.extend(`subscription[${opts?.subId ?? this.internalId}]`);
    this.eoseDebug = this.debug.extend("eose");
    this.skipVerification = opts?.skipVerification || false;
    this.skipValidation = opts?.skipValidation || false;
    if (!this.opts.closeOnEose) {
      this.debug(
        `Creating a permanent subscription`,
        this.opts,
        JSON.stringify(this.filters)
      );
    }
    if (this.opts.cacheUsage === "ONLY_CACHE" /* ONLY_CACHE */ && !this.opts.closeOnEose) {
      throw new Error("Cannot use cache-only options with a persistent subscription");
    }
  }
  /**
   * Provides access to the first filter of the subscription for
   * backwards compatibility.
   */
  get filter() {
    return this.filters[0];
  }
  isGroupable() {
    return this.opts?.groupable || false;
  }
  shouldQueryCache() {
    return this.opts?.cacheUsage !== "ONLY_RELAY" /* ONLY_RELAY */;
  }
  shouldQueryRelays() {
    return this.opts?.cacheUsage !== "ONLY_CACHE" /* ONLY_CACHE */;
  }
  shouldWaitForCache() {
    return (
      // Must want to close on EOSE; subscriptions
      // that want to receive further updates must
      // always hit the relay
      this.opts.closeOnEose && // Cache adapter must claim to be fast
      !!this.ndk.cacheAdapter?.locking && // If explicitly told to run in parallel, then
      // we should not wait for the cache
      this.opts.cacheUsage !== "PARALLEL" /* PARALLEL */
    );
  }
  /**
   * Start the subscription. This is the main method that should be called
   * after creating a subscription.
   */
  async start() {
    let cachePromise;
    if (this.shouldQueryCache()) {
      cachePromise = this.startWithCache();
      if (this.shouldWaitForCache()) {
        await cachePromise;
        if (queryFullyFilled(this)) {
          this.emit("eose", this);
          return;
        }
      }
    }
    if (this.shouldQueryRelays()) {
      this.startWithRelays();
    } else {
      this.emit("eose", this);
    }
    return;
  }
  stop() {
    this.emit("close", this);
    this.removeAllListeners();
  }
  /**
   * @returns Whether the subscription has an authors filter.
   */
  hasAuthorsFilter() {
    return this.filters.some((f) => f.authors?.length);
  }
  async startWithCache() {
    if (this.ndk.cacheAdapter?.query) {
      const promise = this.ndk.cacheAdapter.query(this);
      if (this.ndk.cacheAdapter.locking) {
        await promise;
      }
    }
  }
  /**
   * Send REQ to relays
   */
  startWithRelays() {
    if (!this.relaySet) {
      this.relayFilters = calculateRelaySetsFromFilters(this.ndk, this.filters);
    } else {
      this.relayFilters = /* @__PURE__ */ new Map();
      for (const relay of this.relaySet.relays) {
        this.relayFilters.set(relay.url, this.filters);
      }
    }
    if (!this.relayFilters || this.relayFilters.size === 0) {
      this.debug(`No relays to subscribe to`, this.ndk.explicitRelayUrls);
      return;
    }
    for (const [relayUrl, filters] of this.relayFilters) {
      const relay = this.pool.getRelay(relayUrl);
      relay.subscribe(this, filters);
    }
  }
  // EVENT handling
  /**
   * Called when an event is received from a relay or the cache
   * @param event
   * @param relay
   * @param fromCache Whether the event was received from the cache
   */
  eventReceived(event, relay, fromCache = false) {
    if (relay) {
      event.relay ??= relay;
      event.onRelays.push(relay);
    }
    if (!relay)
      relay = event.relay;
    if (!this.skipValidation) {
      if (!event.isValid) {
        this.debug(`Event failed validation`, event);
        return;
      }
    }
    if (!fromCache && relay) {
      let events = this.eventsPerRelay.get(relay);
      if (!events) {
        events = /* @__PURE__ */ new Set();
        this.eventsPerRelay.set(relay, events);
      }
      events.add(event.id);
      const eventAlreadySeen = this.eventFirstSeen.has(event.id);
      if (eventAlreadySeen) {
        const timeSinceFirstSeen = Date.now() - (this.eventFirstSeen.get(event.id) || 0);
        relay.scoreSlowerEvent(timeSinceFirstSeen);
        this.emit("event:dup", event, relay, timeSinceFirstSeen, this);
        return;
      }
      if (this.ndk.cacheAdapter) {
        this.ndk.cacheAdapter.setEvent(event, this.filters, relay);
      }
      this.eventFirstSeen.set(event.id, Date.now());
    } else {
      this.eventFirstSeen.set(event.id, 0);
    }
    if (!event.ndk)
      event.ndk = this.ndk;
    this.emit("event", event, relay, this);
    this.lastEventReceivedAt = Date.now();
  }
  // EOSE handling
  eoseTimeout;
  eoseReceived(relay) {
    this.eosesSeen.add(relay);
    this.eoseDebug(`received from ${relay.url}`);
    let lastEventSeen = this.lastEventReceivedAt ? Date.now() - this.lastEventReceivedAt : void 0;
    const hasSeenAllEoses = this.eosesSeen.size === this.relayFilters?.size;
    const queryFilled = queryFullyFilled(this);
    if (queryFilled) {
      this.emit("eose");
      this.eoseDebug(`Query fully filled`);
      if (this.opts?.closeOnEose) {
        this.stop();
      } else {
      }
    } else if (hasSeenAllEoses) {
      this.emit("eose");
      this.eoseDebug(`All EOSEs seen`);
      if (this.opts?.closeOnEose) {
        this.stop();
      } else {
      }
    } else {
      let timeToWaitForNextEose = 1e3;
      const percentageOfRelaysThatHaveSentEose = this.eosesSeen.size / this.relayFilters.size;
      if (this.eosesSeen.size >= 2 && percentageOfRelaysThatHaveSentEose >= 0.5) {
        timeToWaitForNextEose = timeToWaitForNextEose * (1 - percentageOfRelaysThatHaveSentEose);
        if (this.eoseTimeout) {
          clearTimeout(this.eoseTimeout);
        }
        const sendEoseTimeout = () => {
          lastEventSeen = this.lastEventReceivedAt ? Date.now() - this.lastEventReceivedAt : void 0;
          if (lastEventSeen !== void 0 && lastEventSeen < 20) {
            this.eoseTimeout = setTimeout(sendEoseTimeout, timeToWaitForNextEose);
          } else {
            this.emit("eose");
            if (this.opts?.closeOnEose)
              this.stop();
          }
        };
        this.eoseTimeout = setTimeout(sendEoseTimeout, timeToWaitForNextEose);
      }
    }
  }
};

// src/user/follows.ts
async function follows(opts, outbox, kind = 3 /* Contacts */) {
  if (!this.ndk)
    throw new Error("NDK not set");
  const contactListEvent = Array.from(
    await this.ndk.fetchEvents(
      {
        kinds: [kind],
        authors: [this.pubkey]
      },
      opts || { groupable: false }
    )
  )[0];
  if (contactListEvent) {
    const pubkeys = /* @__PURE__ */ new Set();
    contactListEvent.tags.forEach((tag) => {
      if (tag[0] === "p") {
        try {
          pubkeys.add(tag[1]);
          if (outbox) {
            this.ndk?.outboxTracker?.trackUsers([tag[1]]);
          }
        } catch (e) {
        }
      }
    });
    return [...pubkeys].reduce((acc, pubkey) => {
      const user = new NDKUser({ pubkey });
      user.ndk = this.ndk;
      acc.add(user);
      return acc;
    }, /* @__PURE__ */ new Set());
  }
  return /* @__PURE__ */ new Set();
}

// src/user/profile.ts
function profileFromEvent(event) {
  const profile = {};
  let payload;
  try {
    payload = JSON.parse(event.content);
  } catch (error) {
    throw new Error(`Failed to parse profile event: ${error}`);
  }
  Object.keys(payload).forEach((key) => {
    switch (key) {
      case "name":
        profile.name = payload.name;
        break;
      case "display_name":
        profile.displayName = payload.display_name;
        break;
      case "image":
      case "picture":
        profile.image = payload.image || payload.picture;
        break;
      case "banner":
        profile.banner = payload.banner;
        break;
      case "bio":
        profile.bio = payload.bio;
        break;
      case "nip05":
        profile.nip05 = payload.nip05;
        break;
      case "lud06":
        profile.lud06 = payload.lud06;
        break;
      case "lud16":
        profile.lud16 = payload.lud16;
        break;
      case "about":
        profile.about = payload.about;
        break;
      case "zapService":
        profile.zapService = payload.zapService;
        break;
      case "website":
        profile.website = payload.website;
        break;
      default:
        profile[key] = payload[key];
        break;
    }
  });
  return profile;
}
function serializeProfile(profile) {
  const payload = {};
  for (const [key, val] of Object.entries(profile)) {
    switch (key) {
      case "username":
      case "name":
        payload.name = val;
        break;
      case "displayName":
        payload.display_name = val;
        break;
      case "image":
      case "picture":
        payload.picture = val;
        break;
      case "bio":
      case "about":
        payload.about = val;
        break;
      default:
        payload[key] = val;
        break;
    }
  }
  return JSON.stringify(payload);
}

// src/user/nip05.ts
var NIP05_REGEX = /^(?:([\w.+-]+)@)?([\w.-]+)$/;
async function getNip05For(fullname, _fetch = fetch, fetchOpts = {}) {
  const match = fullname.match(NIP05_REGEX);
  if (!match)
    return null;
  const [_, name = "_", domain] = match;
  try {
    const res = await _fetch(
      `https://${domain}/.well-known/nostr.json?name=${name}`,
      fetchOpts
    );
    const { names, relays, nip46 } = parseNIP05Result(await res.json());
    const pubkey = names[name];
    return pubkey ? {
      pubkey,
      relays: relays?.[pubkey],
      nip46: nip46?.[pubkey]
    } : null;
  } catch (_e) {
    return null;
  }
}
function parseNIP05Result(json) {
  const result = {
    names: {}
  };
  for (const [name, pubkey] of Object.entries(json.names)) {
    if (typeof name === "string" && typeof pubkey === "string") {
      result.names[name] = pubkey;
    }
  }
  if (json.relays) {
    result.relays = {};
    for (const [pubkey, relays] of Object.entries(json.relays)) {
      if (typeof pubkey === "string" && Array.isArray(relays)) {
        result.relays[pubkey] = relays.filter(
          (relay) => typeof relay === "string"
        );
      }
    }
  }
  if (json.nip46) {
    result.nip46 = {};
    for (const [pubkey, nip46] of Object.entries(json.relays)) {
      if (typeof pubkey === "string" && Array.isArray(nip46)) {
        result.nip46[pubkey] = nip46.filter((relay) => typeof relay === "string");
      }
    }
  }
  return result;
}

// src/user/index.ts
var NDKUser = class _NDKUser {
  ndk;
  profile;
  _npub;
  _pubkey;
  relayUrls = [];
  nip46Urls = [];
  constructor(opts) {
    if (opts.npub)
      this._npub = opts.npub;
    if (opts.hexpubkey)
      this._pubkey = opts.hexpubkey;
    if (opts.pubkey)
      this._pubkey = opts.pubkey;
    if (opts.relayUrls)
      this.relayUrls = opts.relayUrls;
    if (opts.nip46Urls)
      this.nip46Urls = opts.nip46Urls;
  }
  get npub() {
    if (!this._npub) {
      if (!this._pubkey)
        throw new Error("hexpubkey not set");
      this._npub = nip194.npubEncode(this.pubkey);
    }
    return this._npub;
  }
  set npub(npub) {
    this._npub = npub;
  }
  /**
   * Get the user's hexpubkey
   * @returns {Hexpubkey} The user's hexpubkey
   *
   * @deprecated Use `pubkey` instead
   */
  get hexpubkey() {
    return this.pubkey;
  }
  /**
   * Set the user's hexpubkey
   * @param pubkey {Hexpubkey} The user's hexpubkey
   * @deprecated Use `pubkey` instead
   */
  set hexpubkey(pubkey) {
    this._pubkey = pubkey;
  }
  /**
   * Get the user's pubkey
   * @returns {string} The user's pubkey
   */
  get pubkey() {
    if (!this._pubkey) {
      if (!this._npub)
        throw new Error("npub not set");
      this._pubkey = nip194.decode(this.npub).data;
    }
    return this._pubkey;
  }
  /**
   * Set the user's pubkey
   * @param pubkey {string} The user's pubkey
   */
  set pubkey(pubkey) {
    this._pubkey = pubkey;
  }
  /**
   * Instantiate an NDKUser from a NIP-05 string
   * @param nip05Id {string} The user's NIP-05
   * @param ndk {NDK} An NDK instance
   * @param skipCache {boolean} Whether to skip the cache or not
   * @returns {NDKUser | undefined} An NDKUser if one is found for the given NIP-05, undefined otherwise.
   */
  static async fromNip05(nip05Id, ndk, skipCache = false) {
    if (ndk?.cacheAdapter && ndk.cacheAdapter.loadNip05) {
      const profile2 = await ndk.cacheAdapter.loadNip05(nip05Id);
      if (profile2) {
        const user = new _NDKUser({
          pubkey: profile2.pubkey,
          relayUrls: profile2.relays,
          nip46Urls: profile2.nip46
        });
        user.ndk = ndk;
        return user;
      }
    }
    let opts = {};
    if (skipCache)
      opts.cache = "no-cache";
    const profile = await getNip05For(nip05Id, ndk?.httpFetch, opts);
    if (profile && ndk?.cacheAdapter && ndk.cacheAdapter.saveNip05) {
      ndk?.cacheAdapter.saveNip05(nip05Id, profile);
    }
    if (profile) {
      const user = new _NDKUser({
        pubkey: profile.pubkey,
        relayUrls: profile.relays,
        nip46Urls: profile.nip46
      });
      user.ndk = ndk;
      return user;
    }
  }
  /**
   * Fetch a user's profile
   * @param opts {NDKSubscriptionOptions} A set of NDKSubscriptionOptions
   * @returns User Profile
   */
  async fetchProfile(opts) {
    if (!this.ndk)
      throw new Error("NDK not set");
    if (!this.profile)
      this.profile = {};
    let setMetadataEvents = null;
    if (this.ndk.cacheAdapter && this.ndk.cacheAdapter.fetchProfile && opts?.cacheUsage !== "ONLY_RELAY" /* ONLY_RELAY */) {
      const profile = await this.ndk.cacheAdapter.fetchProfile(this.pubkey);
      if (profile) {
        this.profile = profile;
        return profile;
      }
    }
    if (!opts && // if no options have been set
    this.ndk.cacheAdapter && // and we have a cache
    this.ndk.cacheAdapter.locking) {
      setMetadataEvents = await this.ndk.fetchEvents(
        {
          kinds: [0],
          authors: [this.pubkey]
        },
        {
          cacheUsage: "ONLY_CACHE" /* ONLY_CACHE */,
          closeOnEose: true,
          groupable: false
        }
      );
      opts = {
        cacheUsage: "ONLY_RELAY" /* ONLY_RELAY */,
        closeOnEose: true,
        groupable: true,
        groupableDelay: 250
      };
    }
    if (!setMetadataEvents || setMetadataEvents.size === 0) {
      setMetadataEvents = await this.ndk.fetchEvents(
        {
          kinds: [0],
          authors: [this.pubkey]
        },
        opts
      );
    }
    const sortedSetMetadataEvents = Array.from(setMetadataEvents).sort(
      (a, b) => a.created_at - b.created_at
    );
    if (sortedSetMetadataEvents.length === 0)
      return null;
    this.profile = profileFromEvent(sortedSetMetadataEvents[0]);
    if (this.profile && this.ndk.cacheAdapter && this.ndk.cacheAdapter.saveProfile) {
      this.ndk.cacheAdapter.saveProfile(this.pubkey, this.profile);
    }
    return this.profile;
  }
  /**
   * Returns a set of users that this user follows.
   */
  follows = follows.bind(this);
  /** @deprecated Use referenceTags instead. */
  /**
   * Get the tag that can be used to reference this user in an event
   * @returns {NDKTag} an NDKTag
   */
  tagReference() {
    return ["p", this.pubkey];
  }
  /**
   * Get the tags that can be used to reference this user in an event
   * @returns {NDKTag[]} an array of NDKTag
   */
  referenceTags(marker) {
    const tag = [["p", this.pubkey]];
    if (!marker)
      return tag;
    tag[0].push("", marker);
    return tag;
  }
  /**
   * Publishes the current profile.
   */
  async publish() {
    if (!this.ndk)
      throw new Error("No NDK instance found");
    if (!this.profile)
      throw new Error("No profile available");
    this.ndk.assertSigner();
    const event = new NDKEvent(this.ndk, {
      kind: 0,
      content: serializeProfile(this.profile)
    });
    await event.publish();
  }
  /**
   * Add a follow to this user's contact list
   *
   * @param newFollow {NDKUser} The user to follow
   * @param currentFollowList {Set<NDKUser>} The current follow list
   * @param kind {NDKKind} The kind to use for this contact list (defaults to `3`)
   * @returns {Promise<boolean>} True if the follow was added, false if the follow already exists
   */
  async follow(newFollow, currentFollowList, kind = 3 /* Contacts */) {
    if (!this.ndk)
      throw new Error("No NDK instance found");
    this.ndk.assertSigner();
    if (!currentFollowList) {
      currentFollowList = await this.follows(void 0, void 0, kind);
    }
    if (currentFollowList.has(newFollow)) {
      return false;
    }
    currentFollowList.add(newFollow);
    const event = new NDKEvent(this.ndk, { kind });
    for (const follow of currentFollowList) {
      event.tag(follow);
    }
    await event.publish();
    return true;
  }
  /**
   * Validate a user's NIP-05 identifier (usually fetched from their kind:0 profile data)
   *
   * @param nip05Id The NIP-05 string to validate
   * @returns {Promise<boolean | null>} True if the NIP-05 is found and matches this user's pubkey,
   * False if the NIP-05 is found but doesn't match this user's pubkey,
   * null if the NIP-05 isn't found on the domain or we're unable to verify (because of network issues, etc.)
   */
  async validateNip05(nip05Id) {
    if (!this.ndk)
      throw new Error("No NDK instance found");
    const profilePointer = await getNip05For(nip05Id);
    if (profilePointer === null)
      return null;
    return profilePointer.pubkey === this.pubkey;
  }
  /**
   * Zap a user
   *
   * @param amount The amount to zap in millisatoshis
   * @param comment A comment to add to the zap request
   * @param extraTags Extra tags to add to the zap request
   * @param signer The signer to use (will default to the NDK instance's signer)
   */
  async zap(amount, comment, extraTags, signer) {
    if (!this.ndk)
      throw new Error("No NDK instance found");
    if (!signer) {
      this.ndk.assertSigner();
    }
    const zap = new Zap({
      ndk: this.ndk,
      zappedUser: this
    });
    const relays = Array.from(this.ndk.pool.relays.keys());
    const paymentRequest = await zap.createZapRequest(
      amount,
      comment,
      extraTags,
      relays,
      signer
    );
    return paymentRequest;
  }
};

// src/events/kinds/lists/index.ts
var NDKList = class _NDKList extends NDKEvent {
  _encryptedTags;
  /**
   * Stores the number of bytes the content was before decryption
   * to expire the cache when the content changes.
   */
  encryptedTagsLength;
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 30001 /* CategorizedBookmarkList */;
  }
  /**
   * Wrap a NDKEvent into a NDKList
   */
  static from(ndkEvent) {
    return new _NDKList(ndkEvent.ndk, ndkEvent.rawEvent());
  }
  /**
   * Returns the title of the list. Falls back on fetching the name tag value.
   */
  get title() {
    const titleTag = this.tagValue("title") || this.tagValue("name");
    if (this.kind === 3 /* Contacts */ && !titleTag) {
      return "Contacts";
    } else if (this.kind === 1e4 /* MuteList */ && !titleTag) {
      return "Mute";
    } else if (this.kind === 10001 /* PinList */ && !titleTag) {
      return "Pinned Notes";
    } else if (this.kind === 10002 /* RelayList */ && !titleTag) {
      return "Relay Metadata";
    } else if (this.kind === 10003 /* BookmarkList */ && !titleTag) {
      return "Bookmarks";
    } else if (this.kind === 10004 /* CommunityList */ && !titleTag) {
      return "Communities";
    } else if (this.kind === 10005 /* PublicChatList */ && !titleTag) {
      return "Public Chats";
    } else if (this.kind === 10006 /* BlockRelayList */ && !titleTag) {
      return "Blocked Relays";
    } else if (this.kind === 10007 /* SearchRelayList */ && !titleTag) {
      return "Search Relays";
    } else if (this.kind === 10015 /* InterestList */ && !titleTag) {
      return "Interests";
    } else if (this.kind === 10030 /* EmojiList */ && !titleTag) {
      return "Emojis";
    } else {
      return titleTag ?? this.tagValue("d");
    }
  }
  /**
   * Sets the title of the list.
   */
  set title(title) {
    this.removeTag("title");
    this.removeTag("name");
    if (title) {
      this.tags.push(["title", title]);
    } else {
      throw new Error("Title cannot be empty");
    }
  }
  /**
   * Returns the name of the list.
   * @deprecated Please use "title" instead.
   */
  get name() {
    const nameTag = this.tagValue("name");
    if (this.kind === 3 /* Contacts */ && !nameTag) {
      return "Contacts";
    } else if (this.kind === 1e4 /* MuteList */ && !nameTag) {
      return "Mute";
    } else if (this.kind === 10001 /* PinList */ && !nameTag) {
      return "Pinned Notes";
    } else if (this.kind === 10002 /* RelayList */ && !nameTag) {
      return "Relay Metadata";
    } else if (this.kind === 10003 /* BookmarkList */ && !nameTag) {
      return "Bookmarks";
    } else if (this.kind === 10004 /* CommunityList */ && !nameTag) {
      return "Communities";
    } else if (this.kind === 10005 /* PublicChatList */ && !nameTag) {
      return "Public Chats";
    } else if (this.kind === 10006 /* BlockRelayList */ && !nameTag) {
      return "Blocked Relays";
    } else if (this.kind === 10007 /* SearchRelayList */ && !nameTag) {
      return "Search Relays";
    } else if (this.kind === 10015 /* InterestList */ && !nameTag) {
      return "Interests";
    } else if (this.kind === 10030 /* EmojiList */ && !nameTag) {
      return "Emojis";
    } else {
      return nameTag ?? this.tagValue("d");
    }
  }
  /**
   * Sets the name of the list.
   * @deprecated Please use "title" instead. This method will use the `title` tag instead.
   */
  set name(name) {
    this.removeTag("name");
    if (name) {
      this.tags.push(["title", name]);
    } else {
      throw new Error("Name cannot be empty");
    }
  }
  /**
   * Returns the description of the list.
   */
  get description() {
    return this.tagValue("description");
  }
  /**
   * Sets the description of the list.
   */
  set description(name) {
    if (name) {
      this.tags.push(["description", name]);
    } else {
      this.removeTag("description");
    }
  }
  isEncryptedTagsCacheValid() {
    return !!(this._encryptedTags && this.encryptedTagsLength === this.content.length);
  }
  /**
   * Returns the decrypted content of the list.
   */
  async encryptedTags(useCache = true) {
    if (useCache && this.isEncryptedTagsCacheValid())
      return this._encryptedTags;
    if (!this.ndk)
      throw new Error("NDK instance not set");
    if (!this.ndk.signer)
      throw new Error("NDK signer not set");
    const user = await this.ndk.signer.user();
    try {
      if (this.content.length > 0) {
        try {
          const decryptedContent = await this.ndk.signer.decrypt(user, this.content);
          const a = JSON.parse(decryptedContent);
          if (a && a[0]) {
            this.encryptedTagsLength = this.content.length;
            return this._encryptedTags = a;
          }
          this.encryptedTagsLength = this.content.length;
          return this._encryptedTags = [];
        } catch (e) {
          console.log(`error decrypting ${this.content}`);
        }
      }
    } catch (e) {
    }
    return [];
  }
  /**
   * This method can be overriden to validate that a tag is valid for this list.
   *
   * (i.e. the NDKPersonList can validate that items are NDKUser instances)
   */
  validateTag(tagValue) {
    return true;
  }
  /**
   * Returns the unecrypted items in this list.
   */
  get items() {
    return this.tags.filter((t) => {
      return ![
        "d",
        "L",
        "l",
        "title",
        "name",
        "description",
        "summary",
        "image",
        "thumb",
        "alt",
        "expiration",
        "subject",
        "client"
      ].includes(t[0]);
    });
  }
  /**
   * Adds a new item to the list.
   * @param relay Relay to add
   * @param mark Optional mark to add to the item
   * @param encrypted Whether to encrypt the item
   */
  async addItem(item, mark = void 0, encrypted = false) {
    if (!this.ndk)
      throw new Error("NDK instance not set");
    if (!this.ndk.signer)
      throw new Error("NDK signer not set");
    let tags;
    if (item instanceof NDKEvent) {
      tags = item.referenceTags();
    } else if (item instanceof NDKUser) {
      tags = item.referenceTags();
    } else if (item instanceof NDKRelay) {
      tags = item.referenceTags();
    } else if (Array.isArray(item)) {
      tags = [item];
    } else {
      throw new Error("Invalid object type");
    }
    if (mark)
      tags[0].push(mark);
    if (encrypted) {
      const user = await this.ndk.signer.user();
      const currentList = await this.encryptedTags();
      currentList.push(...tags);
      this._encryptedTags = currentList;
      this.encryptedTagsLength = this.content.length;
      this.content = JSON.stringify(currentList);
      await this.encrypt(user);
    } else {
      this.tags.push(...tags);
    }
    this.created_at = Math.floor(Date.now() / 1e3);
    this.emit("change");
  }
  /**
   * Removes an item from the list.
   *
   * @param index The index of the item to remove.
   * @param encrypted Whether to remove from the encrypted list or not.
   */
  async removeItem(index, encrypted) {
    if (!this.ndk)
      throw new Error("NDK instance not set");
    if (!this.ndk.signer)
      throw new Error("NDK signer not set");
    if (encrypted) {
      const user = await this.ndk.signer.user();
      const currentList = await this.encryptedTags();
      currentList.splice(index, 1);
      this._encryptedTags = currentList;
      this.encryptedTagsLength = this.content.length;
      this.content = JSON.stringify(currentList);
      await this.encrypt(user);
    } else {
      this.tags.splice(index, 1);
    }
    this.created_at = Math.floor(Date.now() / 1e3);
    this.emit("change");
    return this;
  }
  /**
   * Creates a filter that will result in fetching
   * the items of this list
   * @example
   * const list = new NDKList(...);
   * const filters = list.filterForItems();
   * const events = await ndk.fetchEvents(filters);
   */
  filterForItems() {
    const ids = /* @__PURE__ */ new Set();
    const nip33Queries = /* @__PURE__ */ new Map();
    const filters = [];
    for (const tag of this.items) {
      if (tag[0] === "e" && tag[1]) {
        ids.add(tag[1]);
      } else if (tag[0] === "a" && tag[1]) {
        const [kind, pubkey, dTag] = tag[1].split(":");
        if (!kind || !pubkey)
          continue;
        const key = `${kind}:${pubkey}`;
        const item = nip33Queries.get(key) || [];
        item.push(dTag || "");
        nip33Queries.set(key, item);
      }
    }
    if (ids.size > 0) {
      filters.push({ ids: Array.from(ids) });
    }
    if (nip33Queries.size > 0) {
      for (const [key, values] of nip33Queries.entries()) {
        const [kind, pubkey] = key.split(":");
        filters.push({
          kinds: [parseInt(kind)],
          authors: [pubkey],
          "#d": values
        });
      }
    }
    return filters;
  }
};
var lists_default = NDKList;

// src/user/pin.ts
async function pinEvent(user, event, pinEvent2, publish) {
  const kind = 10001 /* PinList */;
  if (!user.ndk)
    throw new Error("No NDK instance found");
  user.ndk.assertSigner();
  if (!pinEvent2) {
    const events = await user.ndk.fetchEvents(
      { kinds: [kind], authors: [user.pubkey] },
      { cacheUsage: "ONLY_RELAY" /* ONLY_RELAY */ }
    );
    if (events.size > 0) {
      pinEvent2 = lists_default.from(Array.from(events)[0]);
    } else {
      pinEvent2 = new NDKEvent(user.ndk, {
        kind
      });
    }
  }
  pinEvent2.tag(event);
  if (publish) {
    await pinEvent2.publish();
  }
  return pinEvent2;
}

// src/events/kinds/article.ts
var NDKArticle = class _NDKArticle extends NDKEvent {
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 30023 /* Article */;
  }
  /**
   * Creates a NDKArticle from an existing NDKEvent.
   *
   * @param event NDKEvent to create the NDKArticle from.
   * @returns NDKArticle
   */
  static from(event) {
    return new _NDKArticle(event.ndk, event.rawEvent());
  }
  /**
   * Getter for the article title.
   *
   * @returns {string | undefined} - The article title if available, otherwise undefined.
   */
  get title() {
    return this.tagValue("title");
  }
  /**
   * Setter for the article title.
   *
   * @param {string | undefined} title - The title to set for the article.
   */
  set title(title) {
    this.removeTag("title");
    if (title)
      this.tags.push(["title", title]);
  }
  /**
   * Getter for the article image.
   *
   * @returns {string | undefined} - The article image if available, otherwise undefined.
   */
  get image() {
    return this.tagValue("image");
  }
  /**
   * Setter for the article image.
   *
   * @param {string | undefined} image - The image to set for the article.
   */
  set image(image) {
    this.removeTag("image");
    if (image)
      this.tags.push(["image", image]);
  }
  get summary() {
    return this.tagValue("summary");
  }
  set summary(summary) {
    this.removeTag("summary");
    if (summary)
      this.tags.push(["summary", summary]);
  }
  /**
   * Getter for the article's publication timestamp.
   *
   * @returns {number | undefined} - The Unix timestamp of when the article was published or undefined.
   */
  get published_at() {
    const tag = this.tagValue("published_at");
    if (tag) {
      return parseInt(tag);
    }
    return void 0;
  }
  /**
   * Setter for the article's publication timestamp.
   *
   * @param {number | undefined} timestamp - The Unix timestamp to set for the article's publication date.
   */
  set published_at(timestamp) {
    this.removeTag("published_at");
    if (timestamp !== void 0) {
      this.tags.push(["published_at", timestamp.toString()]);
    }
  }
  /**
   * Generates content tags for the article.
   *
   * This method first checks and sets the publication date if not available,
   * and then generates content tags based on the base NDKEvent class.
   *
   * @returns {ContentTag} - The generated content tags.
   */
  async generateTags() {
    super.generateTags();
    if (!this.published_at) {
      this.published_at = this.created_at;
    }
    return super.generateTags();
  }
  /**
   * Getter for the article's URL.
   *
   * @returns {string | undefined} - The article's URL if available, otherwise undefined.
   */
  get url() {
    return this.tagValue("url");
  }
  /**
   * Setter for the article's URL.
   *
   * @param {string | undefined} url - The URL to set for the article.
   */
  set url(url) {
    if (url) {
      this.tags.push(["url", url]);
    } else {
      this.removeTag("url");
    }
  }
};

// src/events/kinds/video.ts
var NDKVideo = class _NDKVideo extends NDKEvent {
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 34235 /* HorizontalVideo */;
  }
  /**
   * Creates a NDKArticle from an existing NDKEvent.
   *
   * @param event NDKEvent to create the NDKArticle from.
   * @returns NDKArticle
   */
  static from(event) {
    return new _NDKVideo(event.ndk, event.rawEvent());
  }
  /**
   * Getter for the article title.
   *
   * @returns {string | undefined} - The article title if available, otherwise undefined.
   */
  get title() {
    return this.tagValue("title");
  }
  /**
   * Setter for the article title.
   *
   * @param {string | undefined} title - The title to set for the article.
   */
  set title(title) {
    this.removeTag("title");
    if (title)
      this.tags.push(["title", title]);
  }
  /**
   * Getter for the article thumbnail.
   *
   * @returns {string | undefined} - The article thumbnail if available, otherwise undefined.
   */
  get thumbnail() {
    return this.tagValue("thumb");
  }
  /**
   * Setter for the article thumbnail.
   *
   * @param {string | undefined} thumbnail - The thumbnail to set for the article.
   */
  set thumbnail(thumbnail) {
    this.removeTag("thumb");
    if (thumbnail)
      this.tags.push(["thumb", thumbnail]);
  }
  get url() {
    return this.tagValue("url");
  }
  set url(url) {
    this.removeTag("url");
    if (url)
      this.tags.push(["url", url]);
  }
  /**
   * Getter for the article's publication timestamp.
   *
   * @returns {number | undefined} - The Unix timestamp of when the article was published or undefined.
   */
  get published_at() {
    const tag = this.tagValue("published_at");
    if (tag) {
      return parseInt(tag);
    }
    return void 0;
  }
  /**
   * Setter for the article's publication timestamp.
   *
   * @param {number | undefined} timestamp - The Unix timestamp to set for the article's publication date.
   */
  set published_at(timestamp) {
    this.removeTag("published_at");
    if (timestamp !== void 0) {
      this.tags.push(["published_at", timestamp.toString()]);
    }
  }
  /**
   * Generates content tags for the article.
   *
   * This method first checks and sets the publication date if not available,
   * and then generates content tags based on the base NDKEvent class.
   *
   * @returns {ContentTag} - The generated content tags.
   */
  async generateTags() {
    super.generateTags();
    if (!this.published_at) {
      this.published_at = this.created_at;
    }
    return super.generateTags();
  }
  get duration() {
    const tag = this.tagValue("duration");
    if (tag) {
      return parseInt(tag);
    }
    return void 0;
  }
  /**
   * Setter for the video's duration
   *
   * @param {number | undefined} duration - The duration to set for the video (in seconds)
   */
  set duration(dur) {
    this.removeTag("duration");
    if (dur !== void 0) {
      this.tags.push(["duration", Math.floor(dur).toString()]);
    }
  }
};

// src/events/kinds/highlight.ts
import { nip19 as nip195 } from "nostr-tools";
var NDKHighlight = class _NDKHighlight extends NDKEvent {
  _article;
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 9802 /* Highlight */;
  }
  static from(event) {
    return new _NDKHighlight(event.ndk, event.rawEvent());
  }
  get url() {
    return this.tagValue("r");
  }
  /**
   * Context tag.
   */
  set context(context) {
    if (context === void 0) {
      this.tags = this.tags.filter(([tag, value]) => tag !== "context");
    } else {
      this.tags = this.tags.filter(([tag, value]) => tag !== "context");
      this.tags.push(["context", context]);
    }
  }
  get context() {
    return this.tags.find(([tag, value]) => tag === "context")?.[1] ?? void 0;
  }
  /**
   * Will return the article URL or NDKEvent if they have already been
   * set (it won't attempt to load remote events)
   */
  get article() {
    return this._article;
  }
  /**
   * Article the highlight is coming from.
   *
   * @param article Article URL or NDKEvent.
   */
  set article(article) {
    this._article = article;
    if (typeof article === "string") {
      this.tags.push(["r", article]);
    } else {
      this.tag(article);
    }
  }
  getArticleTag() {
    return this.getMatchingTags("a")[0] || this.getMatchingTags("e")[0] || this.getMatchingTags("r")[0];
  }
  async getArticle() {
    if (this._article !== void 0)
      return this._article;
    let taggedBech32;
    const articleTag = this.getArticleTag();
    if (!articleTag)
      return void 0;
    switch (articleTag[0]) {
      case "a":
        const [kind, pubkey, identifier] = articleTag[1].split(":");
        taggedBech32 = nip195.naddrEncode({ kind: parseInt(kind), pubkey, identifier });
        break;
      case "e":
        taggedBech32 = nip195.noteEncode(articleTag[1]);
        break;
      case "r":
        this._article = articleTag[1];
        break;
    }
    if (taggedBech32) {
      let a = await this.ndk?.fetchEvent(taggedBech32);
      if (a) {
        if (a.kind === 30023 /* Article */) {
          a = NDKArticle.from(a);
        }
        this._article = a;
      }
    }
    return this._article;
  }
};

// src/events/kinds/NDKRelayList.ts
var READ_MARKER = "read";
var WRITE_MARKER = "write";
var NDKRelayList = class _NDKRelayList extends NDKEvent {
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 10002 /* RelayList */;
  }
  static from(ndkEvent) {
    return new _NDKRelayList(ndkEvent.ndk, ndkEvent.rawEvent());
  }
  /**
   * Returns a set of relay list events for a user.
   * @returns {Promise<Set<NDKEvent>>} A set of NDKEvents returned for the given user.
   */
  static async forUser(user, ndk) {
    const pool = ndk.outboxPool || ndk.pool;
    const set = /* @__PURE__ */ new Set();
    for (const relay of pool.relays.values())
      set.add(relay);
    const relaySet = new NDKRelaySet(set, ndk);
    const event = await ndk.fetchEvent(
      {
        kinds: [10002],
        authors: [user.pubkey]
      },
      {
        closeOnEose: true,
        pool,
        groupable: true,
        subId: `relay-list-${user.pubkey.slice(0, 6)}`
      },
      relaySet
    );
    if (event)
      return _NDKRelayList.from(event);
    return await relayListFromKind3(user, ndk);
  }
  get readRelayUrls() {
    return this.getMatchingTags("r").filter((tag) => !tag[2] || tag[2] && tag[2] === READ_MARKER).map((tag) => tag[1]);
  }
  set readRelayUrls(relays) {
    for (const relay of relays) {
      this.tags.push(["r", relay, READ_MARKER]);
    }
  }
  get writeRelayUrls() {
    return this.getMatchingTags("r").filter((tag) => !tag[2] || tag[2] && tag[2] === WRITE_MARKER).map((tag) => tag[1]);
  }
  set writeRelayUrls(relays) {
    for (const relay of relays) {
      this.tags.push(["r", relay, WRITE_MARKER]);
    }
  }
  get bothRelayUrls() {
    return this.getMatchingTags("r").filter((tag) => !tag[2]).map((tag) => tag[1]);
  }
  set bothRelayUrls(relays) {
    for (const relay of relays) {
      this.tags.push(["r", relay]);
    }
  }
  get relays() {
    return this.getMatchingTags("r").map((tag) => tag[1]);
  }
};
async function relayListFromKind3(user, ndk) {
  const followList = await ndk.fetchEvent({
    kinds: [3],
    authors: [user.pubkey]
  });
  if (followList) {
    try {
      const content = JSON.parse(followList.content);
      const relayList = new NDKRelayList(ndk);
      const readRelays = /* @__PURE__ */ new Set();
      const writeRelays = /* @__PURE__ */ new Set();
      for (const [key, config] of Object.entries(content)) {
        if (!config) {
          readRelays.add(key);
          writeRelays.add(key);
        } else {
          const relayConfig = config;
          if (relayConfig.write)
            writeRelays.add(key);
          if (relayConfig.read)
            readRelays.add(key);
        }
      }
      relayList.readRelayUrls = Array.from(readRelays);
      relayList.writeRelayUrls = Array.from(writeRelays);
      return relayList;
    } catch (e) {
    }
  }
  return void 0;
}

// src/events/kinds/repost.ts
var NDKRepost = class _NDKRepost extends NDKEvent {
  _repostedEvents;
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
  }
  static from(event) {
    return new _NDKRepost(event.ndk, event.rawEvent());
  }
  /**
   * Returns all reposted events by the current event.
   *
   * @param klass Optional class to convert the events to.
   * @returns
   */
  async repostedEvents(klass, opts) {
    const items = [];
    if (!this.ndk)
      throw new Error("NDK instance not set");
    if (this._repostedEvents !== void 0)
      return this._repostedEvents;
    for (const eventId of this.repostedEventIds()) {
      const filter = filterForId(eventId);
      const event = await this.ndk.fetchEvent(filter, opts);
      if (event) {
        items.push(klass ? klass.from(event) : event);
      }
    }
    return items;
  }
  /**
   * Returns the reposted event IDs.
   */
  repostedEventIds() {
    return this.tags.filter((t) => t[0] === "e" || t[0] === "a").map((t) => t[1]);
  }
};
function filterForId(id) {
  if (id.match(/:/)) {
    const [kind, pubkey, identifier] = id.split(":");
    return {
      kinds: [parseInt(kind)],
      authors: [pubkey],
      "#d": [identifier]
    };
  } else {
    return { ids: [id] };
  }
}

// src/events/kinds/nip89/NDKAppHandler.ts
var NDKAppHandlerEvent = class _NDKAppHandlerEvent extends NDKEvent {
  profile;
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 31990 /* AppHandler */;
  }
  static from(ndkEvent) {
    return new _NDKAppHandlerEvent(ndkEvent.ndk, ndkEvent.rawEvent());
  }
  /**
   * Fetches app handler information
   * If no app information is available on the kind:31990,
   * we fetch the event's author's profile and return that instead.
   */
  async fetchProfile() {
    if (this.profile === void 0 && this.content.length > 0) {
      try {
        const profile = JSON.parse(this.content);
        if (profile && profile.name) {
          return profile;
        } else {
          this.profile = null;
        }
      } catch (e) {
        this.profile = null;
      }
    }
    return new Promise((resolve, reject) => {
      const author = this.author;
      author.fetchProfile().then(() => {
        resolve(author.profile);
      }).catch(reject);
    });
  }
};

// src/events/kinds/subscriptions/amount.ts
var possibleIntervalFrequencies = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly"
];
function calculateTermDurationInSeconds(term) {
  switch (term) {
    case "daily":
      return 24 * 60 * 60;
    case "weekly":
      return 7 * 24 * 60 * 60;
    case "monthly":
      return 30 * 24 * 60 * 60;
    case "quarterly":
      return 3 * 30 * 24 * 60 * 60;
    case "yearly":
      return 365 * 24 * 60 * 60;
  }
}
function newAmount(amount, currency, term) {
  return ["amount", amount.toString(), currency, term];
}
function parseTagToSubscriptionAmount(tag) {
  const amount = parseInt(tag[1]);
  if (isNaN(amount) || amount === void 0 || amount === null || amount <= 0)
    return void 0;
  const currency = tag[2];
  if (currency === void 0 || currency === "")
    return void 0;
  const term = tag[3];
  if (term === void 0)
    return void 0;
  if (!possibleIntervalFrequencies.includes(term))
    return void 0;
  return {
    amount,
    currency,
    term
  };
}

// src/events/kinds/subscriptions/tier.ts
var NDKSubscriptionTier = class _NDKSubscriptionTier extends NDKArticle {
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 37001 /* SubscriptionTier */;
  }
  /**
   * Creates a new NDKSubscriptionTier from an event
   * @param event
   * @returns NDKSubscriptionTier
   */
  static from(event) {
    return new _NDKSubscriptionTier(event.ndk, event.rawEvent());
  }
  /**
   * Returns perks for this tier
   */
  get perks() {
    return this.getMatchingTags("perk").map((tag) => tag[1]).filter((perk) => perk !== void 0);
  }
  /**
   * Adds a perk to this tier
   */
  addPerk(perk) {
    this.tags.push(["perk", perk]);
  }
  /**
   * Returns the amount for this tier
   */
  get amounts() {
    return this.getMatchingTags("amount").map((tag) => parseTagToSubscriptionAmount(tag)).filter((a) => a !== void 0);
  }
  /**
   * Adds an amount to this tier
   * @param amount Amount in the smallest unit of the currency (e.g. cents, msats)
   * @param currency Currency code. Use msat for millisatoshis
   * @param term One of daily, weekly, monthly, quarterly, yearly
   */
  addAmount(amount, currency, term) {
    this.tags.push(newAmount(amount, currency, term));
  }
  /**
   * Sets a relay where content related to this tier can be found
   * @param relayUrl URL of the relay
   */
  set relayUrl(relayUrl) {
    this.tags.push(["r", relayUrl]);
  }
  /**
   * Returns the relay URLs for this tier
   */
  get relayUrls() {
    return this.getMatchingTags("r").map((tag) => tag[1]).filter((relay) => relay !== void 0);
  }
  /**
   * Gets the verifier pubkey for this tier. This is the pubkey that will generate
   * subscription payment receipts
   */
  get verifierPubkey() {
    return this.tagValue("p");
  }
  /**
   * Sets the verifier pubkey for this tier.
   */
  set verifierPubkey(pubkey) {
    this.removeTag("p");
    if (pubkey)
      this.tags.push(["p", pubkey]);
  }
  /**
   * Checks if this tier is valid
   */
  get isValid() {
    return this.title !== void 0 && // Must have a title
    this.amounts.length > 0;
  }
};

// src/events/kinds/subscriptions/subscription-start.ts
import debug3 from "debug";
var NDKSubscriptionStart = class _NDKSubscriptionStart extends NDKEvent {
  debug;
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 7001 /* Subscribe */;
    this.debug = ndk?.debug.extend("subscription-start") ?? debug3("ndk:subscription-start");
  }
  static from(event) {
    return new _NDKSubscriptionStart(event.ndk, event.rawEvent());
  }
  /**
   * Recipient of the subscription. I.e. THe author of this event subscribes to this user.
   */
  get targetUser() {
    const pTag = this.getMatchingTags("p")?.[0];
    if (!pTag)
      return void 0;
    const user = new NDKUser({ pubkey: pTag[1] });
    return user;
  }
  /**
   * The amount of the subscription.
   */
  get amount() {
    const amountTag = this.getMatchingTags("amount")?.[0];
    if (!amountTag)
      return void 0;
    return parseTagToSubscriptionAmount(amountTag);
  }
  set amount(amount) {
    this.removeTag("amount");
    if (!amount)
      return;
    this.tags.push(newAmount(amount.amount, amount.currency, amount.term));
  }
  /**
   * The event id or NIP-33 tag id of the tier that the user is subscribing to.
   */
  get tierId() {
    const eTag = this.getMatchingTags("e")?.[0];
    const aTag = this.getMatchingTags("a")?.[0];
    if (!eTag || !aTag)
      return void 0;
    return eTag[1] ?? aTag[1];
  }
  set tier(tier) {
    this.removeTag("e");
    this.removeTag("a");
    this.removeTag("event");
    if (!tier)
      return;
    this.tag(tier);
    this.removeTag("p");
    this.tags.push(["p", tier.pubkey]);
    this.tags.push(["event", JSON.stringify(tier.rawEvent())]);
  }
  /**
   * Fetches the tier that the user is subscribing to.
   */
  async fetchTier() {
    const eventTag = this.tagValue("event");
    if (eventTag) {
      try {
        const parsedEvent = JSON.parse(eventTag);
        return NDKSubscriptionTier.from(parsedEvent);
      } catch {
        this.debug("Failed to parse event tag");
      }
    }
    const tierId = this.tierId;
    if (!tierId)
      return void 0;
    const e = await this.ndk?.fetchEvent(tierId);
    if (!e)
      return void 0;
    return NDKSubscriptionTier.from(e);
  }
  get isValid() {
    if (this.getMatchingTags("amount").length !== 1) {
      this.debug("Invalid # of amount tag");
      return false;
    }
    if (!this.amount) {
      this.debug("Invalid amount tag");
      return false;
    }
    if (this.getMatchingTags("p").length !== 1) {
      this.debug("Invalid # of p tag");
      return false;
    }
    if (!this.targetUser) {
      this.debug("Invalid p tag");
      return false;
    }
    return true;
  }
};

// src/events/kinds/subscriptions/receipt.ts
import debug4 from "debug";
var NDKSubscriptionReceipt = class _NDKSubscriptionReceipt extends NDKEvent {
  debug;
  constructor(ndk, rawEvent) {
    super(ndk, rawEvent);
    this.kind ??= 7003 /* SubscriptionReceipt */;
    this.debug = ndk?.debug.extend("subscription-start") ?? debug4("ndk:subscription-start");
  }
  static from(event) {
    return new _NDKSubscriptionReceipt(event.ndk, event.rawEvent());
  }
  set subscriptionStart(event) {
    this.debug(`before setting subscription start: ${this.rawEvent}`);
    this.removeTag("e");
    this.tag(event, "subscription", true);
    this.debug(`after setting subscription start: ${this.rawEvent}`);
  }
  get isValid() {
    const period = this.validPeriod;
    if (!period)
      return false;
    if (period.start > period.end)
      return false;
    return true;
  }
  get validPeriod() {
    const tag = this.getMatchingTags("valid")?.[0];
    if (!tag)
      return void 0;
    try {
      return {
        start: new Date(parseInt(tag[1]) * 1e3),
        end: new Date(parseInt(tag[2]) * 1e3)
      };
    } catch {
      return void 0;
    }
  }
  set validPeriod(period) {
    this.removeTag("valid");
    if (!period)
      return;
    this.tags.push([
      "valid",
      Math.floor(period.start.getTime() / 1e3).toString(),
      Math.floor(period.end.getTime() / 1e3).toString()
    ]);
  }
  get startPeriod() {
    return this.validPeriod?.start;
  }
  get endPeriod() {
    return this.validPeriod?.end;
  }
  /**
   * Whether the subscription is currently active
   */
  isActive(time) {
    time ??= /* @__PURE__ */ new Date();
    const period = this.validPeriod;
    if (!period)
      return false;
    if (time < period.start)
      return false;
    if (time > period.end)
      return false;
    return true;
  }
};

// src/events/kinds/dvm/request.ts
var NDKDVMRequest = class _NDKDVMRequest extends NDKEvent {
  constructor(ndk, event) {
    super(ndk, event);
  }
  static from(event) {
    return new _NDKDVMRequest(event.ndk, event.rawEvent());
  }
  set bid(msatAmount) {
    if (msatAmount === void 0) {
      this.removeTag("bid");
    } else {
      this.tags.push(["bid", msatAmount.toString()]);
    }
  }
  get bid() {
    const v = this.tagValue("bid");
    if (v === void 0)
      return void 0;
    return parseInt(v);
  }
  /**
   * Adds a new input to the job
   * @param args The arguments to the input
   */
  addInput(...args) {
    this.tags.push(["i", ...args]);
  }
  /**
   * Adds a new parameter to the job
   */
  addParam(...args) {
    this.tags.push(["param", ...args]);
  }
  set output(output) {
    if (output === void 0) {
      this.removeTag("output");
    } else {
      if (typeof output === "string")
        output = [output];
      this.tags.push(["output", ...output]);
    }
  }
  get output() {
    const outputTag = this.getMatchingTags("output")[0];
    return outputTag ? outputTag.slice(1) : void 0;
  }
  get params() {
    const paramTags = this.getMatchingTags("param");
    return paramTags.map((t) => t.slice(1));
  }
  getParam(name) {
    const paramTag = this.getMatchingTags("param").find((t) => t[1] === name);
    return paramTag ? paramTag[2] : void 0;
  }
  /**
   * Enables job encryption for this event
   * @param dvm DVM that will receive the event
   * @param signer Signer to use for encryption
   */
  async encryption(dvm, signer) {
    const dvmTags = ["i", "param", "output", "relays", "bid"];
    const tags = this.tags.filter((t) => dvmTags.includes(t[0]));
    this.tags = this.tags.filter((t) => !dvmTags.includes(t[0]));
    this.content = JSON.stringify(tags);
    this.tag(dvm);
    this.tags.push(["encrypted"]);
    await this.encrypt(dvm, signer);
  }
  /**
   * Sets the DVM that will receive the event
   */
  set dvm(dvm) {
    this.removeTag("p");
    if (dvm)
      this.tag(dvm);
  }
};

// src/events/kinds/dvm/NDKTranscriptionDVM.ts
var NDKTranscriptionDVM = class _NDKTranscriptionDVM extends NDKDVMRequest {
  constructor(ndk, event) {
    super(ndk, event);
    this.kind = 5e3 /* DVMReqTextExtraction */;
  }
  static from(event) {
    return new _NDKTranscriptionDVM(event.ndk, event.rawEvent());
  }
  /**
   * Returns the original source of the transcription
   */
  get url() {
    const inputTags = this.getMatchingTags("i");
    if (inputTags.length !== 1) {
      return void 0;
    }
    return inputTags[0][1];
  }
  /**
   * Getter for the title tag
   */
  get title() {
    return this.tagValue("title");
  }
  /**
   * Setter for the title tag
   */
  set title(value) {
    this.removeTag("title");
    if (value) {
      this.tags.push(["title", value]);
    }
  }
  /**
   * Getter for the image tag
   */
  get image() {
    return this.tagValue("image");
  }
  /**
   * Setter for the image tag
   */
  set image(value) {
    this.removeTag("image");
    if (value) {
      this.tags.push(["image", value]);
    }
  }
};

// src/events/kinds/dvm/result.ts
var NDKDVMJobResult = class _NDKDVMJobResult extends NDKEvent {
  constructor(ndk, event) {
    super(ndk, event);
  }
  static from(event) {
    return new _NDKDVMJobResult(event.ndk, event.rawEvent());
  }
  setAmount(msat, invoice) {
    this.removeTag("amount");
    const tag = ["amount", msat.toString()];
    if (invoice)
      tag.push(invoice);
    this.tags.push(tag);
  }
  set result(result) {
    if (result === void 0) {
      this.content = "";
    } else {
      this.content = result;
    }
  }
  get result() {
    if (this.content === "") {
      return void 0;
    }
    return this.content;
  }
  set status(status) {
    this.removeTag("status");
    if (status !== void 0) {
      this.tags.push(["status", status]);
    }
  }
  get status() {
    return this.tagValue("status");
  }
  get jobRequestId() {
    for (const eTag of this.getMatchingTags("e")) {
      if (eTag[2] === "job")
        return eTag[1];
    }
    if (this.jobRequest)
      return this.jobRequest.id;
    return this.tagValue("e");
  }
  set jobRequest(event) {
    this.removeTag("request");
    if (event) {
      this.kind = event.kind + 1e3;
      this.tags.push(["request", JSON.stringify(event.rawEvent())]);
      this.tag(event);
    }
  }
  get jobRequest() {
    const tag = this.tagValue("request");
    if (tag === void 0) {
      return void 0;
    }
    return new NDKEvent(this.ndk, JSON.parse(tag));
  }
};

// src/events/kinds/dvm/feedback.ts
var NDKDvmJobFeedbackStatus = /* @__PURE__ */ ((NDKDvmJobFeedbackStatus2) => {
  NDKDvmJobFeedbackStatus2["Processing"] = "processing";
  NDKDvmJobFeedbackStatus2["Success"] = "success";
  NDKDvmJobFeedbackStatus2["Scheduled"] = "scheduled";
  NDKDvmJobFeedbackStatus2["PayReq"] = "payment_required";
  return NDKDvmJobFeedbackStatus2;
})(NDKDvmJobFeedbackStatus || {});
var NDKDVMJobFeedback = class _NDKDVMJobFeedback extends NDKEvent {
  constructor(ndk, event) {
    super(ndk, event);
    this.kind ??= 7e3 /* DVMJobFeedback */;
  }
  static async from(event) {
    const e = new _NDKDVMJobFeedback(event.ndk, event.rawEvent());
    if (e.encrypted)
      await e.dvmDecrypt();
    return e;
  }
  get status() {
    return this.tagValue("status");
  }
  set status(status) {
    this.removeTag("status");
    if (status !== void 0) {
      this.tags.push(["status", status]);
    }
  }
  get encrypted() {
    return !!this.getMatchingTags("encrypted")[0];
  }
  async dvmDecrypt() {
    await this.decrypt();
    const decryptedContent = JSON.parse(this.content);
    this.tags.push(...decryptedContent);
  }
};

// src/events/kinds/simple-group/index.ts
var NDKSimpleGroup = class _NDKSimpleGroup {
  ndk;
  groupId;
  relaySet;
  constructor(ndk, groupId, relaySet) {
    this.ndk = ndk;
    this.groupId = groupId;
    this.relaySet = relaySet;
  }
  /**
   * Adds a user to the group using a kind:9000 event
   * @param user user to add
   * @param opts options
   */
  async addUser(user) {
    const addUserEvent = _NDKSimpleGroup.generateAddUserEvent(user.pubkey, this.groupId);
    addUserEvent.ndk = this.ndk;
    const relays = await addUserEvent.publish(this.relaySet);
    return addUserEvent;
  }
  async getMemberListEvent() {
    const memberList = await this.ndk.fetchEvent(
      {
        kinds: [39002 /* GroupMembers */],
        "#d": [this.groupId]
      },
      void 0,
      this.relaySet
    );
    return memberList;
  }
  /**
   * Gets a list of users that belong to this group
   */
  async getMembers() {
    const members = [];
    const memberPubkeys = /* @__PURE__ */ new Set();
    const memberListEvent = await this.getMemberListEvent();
    if (!memberListEvent)
      return [];
    for (const pTag of memberListEvent.getMatchingTags("p")) {
      const pubkey = pTag[1];
      if (memberPubkeys.has(pubkey))
        continue;
      memberPubkeys.add(pubkey);
      try {
        members.push(this.ndk.getUser({ pubkey }));
      } catch {
      }
    }
    return members;
  }
  /**
   * Generates an event that lists the members of a group.
   * @param groupId
   * @returns
   */
  static generateUserListEvent(groupId) {
    const event = new NDKEvent(void 0, {
      kind: 39002 /* GroupMembers */,
      tags: [
        ["h", groupId],
        ["alt", "Group Member List"]
      ]
    });
    return event;
  }
  /**
   * Generates an event that adds a user to a group.
   * @param userPubkey pubkey of the user to add
   * @param groupId group to add the user to
   * @returns
   */
  static generateAddUserEvent(userPubkey, groupId) {
    const event = new NDKEvent(void 0, {
      kind: 9e3 /* GroupAdminAddUser */,
      tags: [["h", groupId]]
    });
    event.tags.push(["p", userPubkey]);
    return event;
  }
};

// src/relay/auth-policies.ts
import createDebug2 from "debug";
function disconnect(pool, debug7) {
  debug7 ??= createDebug2("ndk:relay:auth-policies:disconnect");
  return async (relay) => {
    debug7(`Relay ${relay.url} requested authentication, disconnecting`);
    pool.removeRelay(relay.url);
  };
}
async function signAndAuth(event, relay, signer, debug7, resolve, reject) {
  try {
    await event.sign(signer);
    await relay.auth(event);
    resolve(event);
  } catch (e) {
    debug7(`Failed to publish auth event to relay ${relay.url}`, e);
    reject(event);
  }
}
function signIn({ ndk, signer, debug: debug7 } = {}) {
  debug7 ??= createDebug2("ndk:auth-policies:signIn");
  return async (relay, challenge) => {
    debug7(`Relay ${relay.url} requested authentication, signing in`);
    const event = new NDKEvent(ndk);
    event.kind = 22242 /* ClientAuth */;
    event.tags = [
      ["relay", relay.url],
      ["challenge", challenge]
    ];
    signer ??= ndk?.signer;
    return new Promise(async (resolve, reject) => {
      if (signer) {
        await signAndAuth(event, relay, signer, debug7, resolve, reject);
      } else {
        ndk?.once("signer:ready", async (signer2) => {
          await signAndAuth(event, relay, signer2, debug7, resolve, reject);
        });
      }
    });
  };
}
var NDKRelayAuthPolicies = {
  disconnect,
  signIn
};

// src/signers/nip07/index.ts
import debug5 from "debug";
var NDKNip07Signer = class {
  _userPromise;
  nip04Queue = [];
  nip04Processing = false;
  debug;
  waitTimeout;
  /**
   * @param waitTimeout - The timeout in milliseconds to wait for the NIP-07 to become available
   */
  constructor(waitTimeout = 1e3) {
    this.debug = debug5("ndk:nip07");
    this.waitTimeout = waitTimeout;
  }
  async blockUntilReady() {
    await this.waitForExtension();
    const pubkey = await window.nostr.getPublicKey();
    if (!pubkey) {
      throw new Error("User rejected access");
    }
    return new NDKUser({ hexpubkey: pubkey });
  }
  /**
   * Getter for the user property.
   * @returns The NDKUser instance.
   */
  async user() {
    if (!this._userPromise) {
      this._userPromise = this.blockUntilReady();
    }
    return this._userPromise;
  }
  /**
   * Signs the given Nostr event.
   * @param event - The Nostr event to be signed.
   * @returns The signature of the signed event.
   * @throws Error if the NIP-07 is not available on the window object.
   */
  async sign(event) {
    await this.waitForExtension();
    const signedEvent = await window.nostr.signEvent(event);
    return signedEvent.sig;
  }
  async relays() {
    await this.waitForExtension();
    const relays = await window.nostr.getRelays?.() || {};
    const activeRelays = [];
    for (const url of Object.keys(relays)) {
      if (relays[url].read && relays[url].write) {
        activeRelays.push(url);
      }
    }
    return activeRelays.map((url) => new NDKRelay(url));
  }
  async encrypt(recipient, value) {
    await this.waitForExtension();
    const recipientHexPubKey = recipient.hexpubkey;
    return this.queueNip04("encrypt", recipientHexPubKey, value);
  }
  async decrypt(sender, value) {
    await this.waitForExtension();
    const senderHexPubKey = sender.hexpubkey;
    return this.queueNip04("decrypt", senderHexPubKey, value);
  }
  async queueNip04(type, counterpartyHexpubkey, value) {
    return new Promise((resolve, reject) => {
      this.nip04Queue.push({
        type,
        counterpartyHexpubkey,
        value,
        resolve,
        reject
      });
      if (!this.nip04Processing) {
        this.processNip04Queue();
      }
    });
  }
  async processNip04Queue(item, retries = 0) {
    if (!item && this.nip04Queue.length === 0) {
      this.nip04Processing = false;
      return;
    }
    this.nip04Processing = true;
    const { type, counterpartyHexpubkey, value, resolve, reject } = item || this.nip04Queue.shift();
    this.debug("Processing encryption queue item", {
      type,
      counterpartyHexpubkey,
      value
    });
    try {
      let result;
      if (type === "encrypt") {
        result = await window.nostr.nip04.encrypt(counterpartyHexpubkey, value);
      } else {
        result = await window.nostr.nip04.decrypt(counterpartyHexpubkey, value);
      }
      resolve(result);
    } catch (error) {
      if (error.message && error.message.includes("call already executing")) {
        if (retries < 5) {
          this.debug("Retrying encryption queue item", {
            type,
            counterpartyHexpubkey,
            value,
            retries
          });
          setTimeout(() => {
            this.processNip04Queue(item, retries + 1);
          }, 50 * retries);
          return;
        }
      }
      reject(error);
    }
    this.processNip04Queue();
  }
  waitForExtension() {
    return new Promise((resolve, reject) => {
      if (window.nostr) {
        resolve();
        return;
      }
      let timerId;
      const intervalId = setInterval(() => {
        if (window.nostr) {
          clearTimeout(timerId);
          clearInterval(intervalId);
          resolve();
        }
      }, 100);
      timerId = setTimeout(() => {
        clearInterval(intervalId);
        reject(new Error("NIP-07 extension not available"));
      }, this.waitTimeout);
    });
  }
};

// src/signers/nip46/backend/index.ts
import { verifySignature } from "nostr-tools";

// src/signers/private-key/index.ts
import { generatePrivateKey, getPublicKey, getSignature, nip04 } from "nostr-tools";
var NDKPrivateKeySigner = class _NDKPrivateKeySigner {
  _user;
  privateKey;
  constructor(privateKey) {
    if (privateKey) {
      this.privateKey = privateKey;
      this._user = new NDKUser({
        hexpubkey: getPublicKey(this.privateKey)
      });
    }
  }
  static generate() {
    const privateKey = generatePrivateKey();
    return new _NDKPrivateKeySigner(privateKey);
  }
  async blockUntilReady() {
    if (!this._user) {
      throw new Error("NDKUser not initialized");
    }
    return this._user;
  }
  async user() {
    await this.blockUntilReady();
    return this._user;
  }
  async sign(event) {
    if (!this.privateKey) {
      throw Error("Attempted to sign without a private key");
    }
    return getSignature(event, this.privateKey);
  }
  async encrypt(recipient, value) {
    if (!this.privateKey) {
      throw Error("Attempted to encrypt without a private key");
    }
    const recipientHexPubKey = recipient.hexpubkey;
    return await nip04.encrypt(this.privateKey, recipientHexPubKey, value);
  }
  async decrypt(sender, value) {
    if (!this.privateKey) {
      throw Error("Attempted to decrypt without a private key");
    }
    const senderHexPubKey = sender.hexpubkey;
    return await nip04.decrypt(this.privateKey, senderHexPubKey, value);
  }
};

// src/signers/nip46/rpc.ts
import { EventEmitter as EventEmitter6 } from "tseep";
var NDKNostrRpc = class extends EventEmitter6 {
  ndk;
  signer;
  debug;
  constructor(ndk, signer, debug7) {
    super();
    this.ndk = ndk;
    this.signer = signer;
    this.debug = debug7.extend("rpc");
  }
  /**
   * Subscribe to a filter. This function will resolve once the subscription is ready.
   */
  subscribe(filter) {
    const sub = this.ndk.subscribe(filter, {
      closeOnEose: false,
      groupable: false
    });
    sub.on("event", async (event) => {
      try {
        const parsedEvent = await this.parseEvent(event);
        if (parsedEvent.method) {
          this.emit("request", parsedEvent);
        } else {
          this.emit(`response-${parsedEvent.id}`, parsedEvent);
        }
      } catch (e) {
        this.debug("error parsing event", e, event.rawEvent());
      }
    });
    return new Promise((resolve, reject) => {
      sub.on("eose", () => resolve(sub));
    });
  }
  async parseEvent(event) {
    const remoteUser = this.ndk.getUser({ hexpubkey: event.pubkey });
    remoteUser.ndk = this.ndk;
    const decryptedContent = await this.signer.decrypt(remoteUser, event.content);
    const parsedContent = JSON.parse(decryptedContent);
    const { id, method, params, result, error } = parsedContent;
    if (method) {
      return { id, pubkey: event.pubkey, method, params, event };
    } else {
      return { id, result, error, event };
    }
  }
  async sendResponse(id, remotePubkey, result, kind = 24133 /* NostrConnect */, error) {
    const res = { id, result };
    if (error) {
      res.error = error;
    }
    const localUser = await this.signer.user();
    const remoteUser = this.ndk.getUser({ hexpubkey: remotePubkey });
    const event = new NDKEvent(this.ndk, {
      kind,
      content: JSON.stringify(res),
      tags: [["p", remotePubkey]],
      pubkey: localUser.hexpubkey
    });
    event.content = await this.signer.encrypt(remoteUser, event.content);
    await event.sign(this.signer);
    await event.publish();
  }
  /**
   * Sends a request.
   * @param remotePubkey
   * @param method
   * @param params
   * @param kind
   * @param id
   */
  async sendRequest(remotePubkey, method, params = [], kind = 24133, cb) {
    const id = Math.random().toString(36).substring(7);
    const localUser = await this.signer.user();
    const remoteUser = this.ndk.getUser({ hexpubkey: remotePubkey });
    const request = { id, method, params };
    const promise = new Promise((resolve) => {
      const responseHandler = (response) => {
        if (response.result === "auth_url") {
          this.once(`response-${id}`, responseHandler);
          this.emit("authUrl", response.error);
        } else if (cb) {
          cb(response);
        }
      };
      this.once(`response-${id}`, responseHandler);
    });
    const event = new NDKEvent(this.ndk, {
      kind,
      content: JSON.stringify(request),
      tags: [["p", remotePubkey]],
      pubkey: localUser.pubkey
    });
    event.content = await this.signer.encrypt(remoteUser, event.content);
    await event.sign(this.signer);
    this.debug(`sending ${method} request to`, remotePubkey);
    await event.publish();
    return promise;
  }
};

// src/signers/nip46/backend/ping.ts
var PingEventHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    const debug7 = backend.debug.extend("ping");
    debug7(`ping request from ${remotePubkey}`);
    if (await backend.pubkeyAllowed({ id, pubkey: remotePubkey, method: "ping" })) {
      debug7(`connection request from ${remotePubkey} allowed`);
      return "pong";
    } else {
      debug7(`connection request from ${remotePubkey} rejected`);
    }
    return void 0;
  }
};

// src/signers/nip46/backend/connect.ts
var ConnectEventHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    const [pubkey, token] = params;
    const debug7 = backend.debug.extend("connect");
    debug7(`connection request from ${pubkey}`);
    if (token && backend.applyToken) {
      debug7(`applying token`);
      await backend.applyToken(pubkey, token);
    }
    if (await backend.pubkeyAllowed({ id, pubkey, method: "connect", params: token })) {
      debug7(`connection request from ${pubkey} allowed`);
      return "ack";
    } else {
      debug7(`connection request from ${pubkey} rejected`);
    }
    return void 0;
  }
};

// src/signers/nip46/backend/get-public-key.ts
var GetPublicKeyHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    return backend.localUser?.pubkey;
  }
};

// src/signers/nip46/backend/nip04-decrypt.ts
var Nip04DecryptHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    const [senderPubkey, payload] = params;
    const senderUser = new NDKUser({ hexpubkey: senderPubkey });
    const decryptedPayload = await decrypt2(backend, id, remotePubkey, senderUser, payload);
    return decryptedPayload;
  }
};
async function decrypt2(backend, id, remotePubkey, senderUser, payload) {
  if (!await backend.pubkeyAllowed({
    id,
    pubkey: remotePubkey,
    method: "decrypt",
    params: payload
  })) {
    backend.debug(`decrypt request from ${remotePubkey} rejected`);
    return void 0;
  }
  return await backend.signer.decrypt(senderUser, payload);
}

// src/signers/nip46/backend/nip04-encrypt.ts
var Nip04EncryptHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    const [recipientPubkey, payload] = params;
    const recipientUser = new NDKUser({ hexpubkey: recipientPubkey });
    const encryptedPayload = await encrypt2(backend, id, remotePubkey, recipientUser, payload);
    return encryptedPayload;
  }
};
async function encrypt2(backend, id, remotePubkey, recipientUser, payload) {
  if (!await backend.pubkeyAllowed({
    id,
    pubkey: remotePubkey,
    method: "encrypt",
    params: payload
  })) {
    backend.debug(`encrypt request from ${remotePubkey} rejected`);
    return void 0;
  }
  return await backend.signer.encrypt(recipientUser, payload);
}

// src/signers/nip46/backend/sign-event.ts
var SignEventHandlingStrategy = class {
  async handle(backend, id, remotePubkey, params) {
    const event = await signEvent(backend, id, remotePubkey, params);
    if (!event)
      return void 0;
    return JSON.stringify(await event.toNostrEvent());
  }
};
async function signEvent(backend, id, remotePubkey, params) {
  const [eventString] = params;
  backend.debug(`sign event request from ${remotePubkey}`);
  const event = new NDKEvent(backend.ndk, JSON.parse(eventString));
  backend.debug("event to sign", event.rawEvent());
  if (!await backend.pubkeyAllowed({
    id,
    pubkey: remotePubkey,
    method: "sign_event",
    params: event
  })) {
    backend.debug(`sign event request from ${remotePubkey} rejected`);
    return void 0;
  }
  backend.debug(`sign event request from ${remotePubkey} allowed`);
  await event.sign(backend.signer);
  return event;
}

// src/signers/nip46/backend/index.ts
var NDKNip46Backend = class {
  ndk;
  signer;
  localUser;
  debug;
  rpc;
  permitCallback;
  /**
   * @param ndk The NDK instance to use
   * @param privateKeyOrSigner The private key or signer of the npub that wants to be published as
   * @param permitCallback Callback executed when permission is requested
   */
  constructor(ndk, privateKeyOrSigner, permitCallback) {
    this.ndk = ndk;
    this.signer = typeof privateKeyOrSigner === "string" ? new NDKPrivateKeySigner(privateKeyOrSigner) : privateKeyOrSigner;
    this.debug = ndk.debug.extend("nip46:backend");
    this.rpc = new NDKNostrRpc(ndk, this.signer, this.debug);
    this.permitCallback = permitCallback;
  }
  /**
   * This method starts the backend, which will start listening for incoming
   * requests.
   */
  async start() {
    this.localUser = await this.signer.user();
    const sub = this.ndk.subscribe(
      {
        kinds: [24133],
        "#p": [this.localUser.hexpubkey]
      },
      { closeOnEose: false }
    );
    sub.on("event", (e) => this.handleIncomingEvent(e));
  }
  handlers = {
    connect: new ConnectEventHandlingStrategy(),
    sign_event: new SignEventHandlingStrategy(),
    nip04_encrypt: new Nip04EncryptHandlingStrategy(),
    nip04_decrypt: new Nip04DecryptHandlingStrategy(),
    get_public_key: new GetPublicKeyHandlingStrategy(),
    ping: new PingEventHandlingStrategy()
  };
  /**
   * Enables the user to set a custom strategy for handling incoming events.
   * @param method - The method to set the strategy for
   * @param strategy - The strategy to set
   */
  setStrategy(method, strategy) {
    this.handlers[method] = strategy;
  }
  /**
   * Overload this method to apply tokens, which can
   * wrap permission sets to be applied to a pubkey.
   * @param pubkey public key to apply token to
   * @param token token to apply
   */
  async applyToken(pubkey, token) {
    throw new Error("connection token not supported");
  }
  async handleIncomingEvent(event) {
    const { id, method, params } = await this.rpc.parseEvent(event);
    const remotePubkey = event.pubkey;
    let response;
    this.debug("incoming event", { id, method, params });
    if (!verifySignature(event.rawEvent())) {
      this.debug("invalid signature", event.rawEvent());
      return;
    }
    const strategy = this.handlers[method];
    if (strategy) {
      try {
        response = await strategy.handle(this, id, remotePubkey, params);
      } catch (e) {
        this.debug("error handling event", e, { id, method, params });
        this.rpc.sendResponse(id, remotePubkey, "error", void 0, e.message);
      }
    } else {
      this.debug("unsupported method", { method, params });
    }
    if (response) {
      this.debug(`sending response to ${remotePubkey}`, response);
      this.rpc.sendResponse(id, remotePubkey, response);
    } else {
      this.rpc.sendResponse(id, remotePubkey, "error", void 0, "Not authorized");
    }
  }
  /**
   * This method should be overriden by the user to allow or reject incoming
   * connections.
   */
  async pubkeyAllowed(params) {
    return this.permitCallback(params);
  }
};

// src/signers/nip46/index.ts
import { EventEmitter as EventEmitter7 } from "tseep";
var NDKNip46Signer = class extends EventEmitter7 {
  ndk;
  remoteUser;
  remotePubkey;
  token;
  localSigner;
  nip05;
  rpc;
  debug;
  relayUrls = [];
  /**
   * @param ndk - The NDK instance to use
   * @param tokenOrRemoteUser - The public key, or a connection token, of the npub that wants to be published as
   * @param localSigner - The signer that will be used to request events to be signed
   */
  constructor(ndk, tokenOrRemoteUser, localSigner) {
    super();
    let remotePubkey;
    let token;
    if (tokenOrRemoteUser.includes("#")) {
      const parts = tokenOrRemoteUser.split("#");
      remotePubkey = new NDKUser({ npub: parts[0] }).pubkey;
      token = parts[1];
    } else if (tokenOrRemoteUser.startsWith("npub")) {
      remotePubkey = new NDKUser({
        npub: tokenOrRemoteUser
      }).pubkey;
    } else if (tokenOrRemoteUser.match(/\./)) {
      this.nip05 = tokenOrRemoteUser;
    } else {
      remotePubkey = tokenOrRemoteUser;
    }
    this.ndk = ndk;
    if (remotePubkey)
      this.remotePubkey = remotePubkey;
    this.token = token;
    this.debug = ndk.debug.extend("nip46:signer");
    this.remoteUser = new NDKUser({ pubkey: remotePubkey });
    if (!localSigner) {
      this.localSigner = NDKPrivateKeySigner.generate();
    } else {
      this.localSigner = localSigner;
    }
    this.rpc = new NDKNostrRpc(ndk, this.localSigner, this.debug);
    this.rpc.on("authUrl", (...props) => {
      this.emit("authUrl", ...props);
    });
    this.localSigner.user().then((localUser) => {
      this.rpc.subscribe({
        kinds: [24133 /* NostrConnect */, 24133 /* NostrConnect */ + 1],
        "#p": [localUser.pubkey]
      });
    });
  }
  /**
   * Get the user that is being published as
   */
  async user() {
    return this.remoteUser;
  }
  async blockUntilReady() {
    const localUser = await this.localSigner.user();
    const remoteUser = this.ndk.getUser({ pubkey: this.remotePubkey });
    if (this.nip05 && !this.remotePubkey) {
      NDKUser.fromNip05(this.nip05).then((user) => {
        if (user) {
          this.remoteUser = user;
          this.remotePubkey = user.pubkey;
          this.relayUrls = user.nip46Urls;
        }
      });
    }
    if (!this.remotePubkey) {
      throw new Error("Remote pubkey not set");
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const connectParams = [localUser.pubkey];
        if (this.token) {
          connectParams.push(this.token);
        }
        this.rpc.sendRequest(
          this.remotePubkey,
          "connect",
          connectParams,
          24133,
          (response) => {
            if (response.result === "ack") {
              resolve(remoteUser);
            } else {
              reject(response.error);
            }
          }
        );
      }, 100);
    });
  }
  async encrypt(recipient, value) {
    this.debug("asking for encryption");
    const promise = new Promise((resolve, reject) => {
      this.rpc.sendRequest(
        this.remotePubkey,
        "nip04_encrypt",
        [recipient.pubkey, value],
        24133,
        (response) => {
          if (!response.error) {
            resolve(response.result);
          } else {
            reject(response.error);
          }
        }
      );
    });
    return promise;
  }
  async decrypt(sender, value) {
    this.debug("asking for decryption");
    const promise = new Promise((resolve, reject) => {
      this.rpc.sendRequest(
        this.remotePubkey,
        "nip04_decrypt",
        [sender.pubkey, value],
        24133,
        (response) => {
          if (!response.error) {
            const value2 = JSON.parse(response.result);
            resolve(value2[0]);
          } else {
            reject(response.error);
          }
        }
      );
    });
    return promise;
  }
  async sign(event) {
    this.debug("asking for a signature");
    const promise = new Promise((resolve, reject) => {
      this.rpc.sendRequest(
        this.remotePubkey,
        "sign_event",
        [JSON.stringify(event)],
        24133,
        (response) => {
          this.debug("got a response", response);
          if (!response.error) {
            const json = JSON.parse(response.result);
            resolve(json.sig);
          } else {
            reject(response.error);
          }
        }
      );
    });
    return promise;
  }
  /**
   * Allows creating a new account on the remote server.
   * @param username Desired username for the NIP-05
   * @param domain Desired domain for the NIP-05
   * @param email Email address to associate with this account -- Remote servers may use this for recovery
   * @returns The public key of the newly created account
   */
  async createAccount(username, domain, email) {
    this.debug("asking to create an account");
    const req = [];
    if (username)
      req.push(username);
    if (domain)
      req.push(domain);
    if (email)
      req.push(email);
    return new Promise((resolve, reject) => {
      this.rpc.sendRequest(
        this.remotePubkey,
        "create_account",
        req,
        24133 /* NostrConnect */,
        (response) => {
          this.debug("got a response", response);
          if (!response.error) {
            const pubkey = response.result;
            resolve(pubkey);
          } else {
            reject(response.error);
          }
        }
      );
    });
  }
};

// src/dvm/schedule.ts
function addRelays(event, relays) {
  const tags = [];
  if (!relays || relays.length === 0) {
    const poolRelays = event.ndk?.pool.relays;
    relays = poolRelays ? Object.keys(poolRelays) : void 0;
  }
  if (relays && relays.length > 0)
    tags.push(["relays", ...relays]);
  return tags;
}
async function dvmSchedule(event, dvm, relays, encrypted = true, waitForConfirmationForMs) {
  if (!event.ndk)
    throw new Error("NDK not set");
  if (!event.sig)
    throw new Error("Event not signed");
  if (!event.created_at)
    throw new Error("Event has no date");
  if (!dvm)
    throw new Error("No DVM specified");
  if (event.created_at <= Date.now() / 1e3)
    throw new Error("Event needs to be in the future");
  const scheduleEvent = new NDKDVMRequest(event.ndk, {
    kind: 5905 /* DVMEventSchedule */
  });
  scheduleEvent.addInput(JSON.stringify(event.rawEvent()), "text");
  scheduleEvent.tags.push(...addRelays(event, relays));
  if (encrypted) {
    await scheduleEvent.encryption(dvm);
  } else {
    scheduleEvent.dvm = dvm;
  }
  await scheduleEvent.sign();
  let res;
  if (waitForConfirmationForMs) {
    res = event.ndk.subscribe(
      {
        kinds: [5905 /* DVMEventSchedule */ + 1e3, 7e3 /* DVMJobFeedback */],
        ...scheduleEvent.filter()
      },
      { groupable: false, closeOnEose: false }
    );
  }
  const timeoutPromise = new Promise((reject) => {
    setTimeout(() => {
      res?.stop();
      reject("Timeout waiting for an answer from the DVM");
    }, waitForConfirmationForMs);
  });
  const schedulePromise = new Promise(
    (resolve, reject) => {
      if (waitForConfirmationForMs) {
        res?.on("event", async (e) => {
          res?.stop();
          if (e.kind === 7e3 /* DVMJobFeedback */) {
            const feedback = await NDKDVMJobFeedback.from(e);
            if (feedback.status === "error") {
              const statusTag = feedback.getMatchingTags("status");
              reject(statusTag?.[2] ?? feedback);
            } else {
              resolve(feedback);
            }
          }
          resolve(e);
        });
      }
      scheduleEvent.publish().then(() => {
        if (!waitForConfirmationForMs)
          resolve();
      });
    }
  );
  return new Promise((resolve, reject) => {
    if (waitForConfirmationForMs) {
      Promise.race([timeoutPromise, schedulePromise]).then((e) => {
        resolve(e);
      }).catch(reject);
    } else {
      schedulePromise.then(resolve);
    }
  });
}

// src/ndk/index.ts
import debug6 from "debug";
import { EventEmitter as EventEmitter10 } from "tseep";

// src/events/dedup.ts
function dedup(event1, event2) {
  if (event1.created_at > event2.created_at) {
    return event1;
  }
  return event2;
}

// src/outbox/tracker.ts
import { EventEmitter as EventEmitter8 } from "tseep";
import { LRUCache } from "typescript-lru-cache";
var OutboxItem = class {
  /**
   * Type of item
   */
  type;
  /**
   * The relay URLs that are of interest to this item
   */
  relayUrlScores;
  readRelays;
  writeRelays;
  constructor(type) {
    this.type = type;
    this.relayUrlScores = /* @__PURE__ */ new Map();
    this.readRelays = /* @__PURE__ */ new Set();
    this.writeRelays = /* @__PURE__ */ new Set();
  }
};
var OutboxTracker = class extends EventEmitter8 {
  data;
  ndk;
  debug;
  constructor(ndk) {
    super();
    this.ndk = ndk;
    this.debug = ndk.debug.extend("outbox-tracker");
    this.data = new LRUCache({
      maxSize: 1e5,
      entryExpirationTimeInMS: 5e3
    });
  }
  trackUsers(items) {
    for (const item of items) {
      const itemKey = getKeyFromItem(item);
      if (this.data.has(itemKey))
        continue;
      const outboxItem = this.track(item, "user");
      const user = item instanceof NDKUser ? item : new NDKUser({ hexpubkey: item });
      user.ndk = this.ndk;
      NDKRelayList.forUser(user, this.ndk).then((relayList) => {
        if (relayList) {
          outboxItem.readRelays = new Set(relayList.readRelayUrls);
          outboxItem.writeRelays = new Set(relayList.writeRelayUrls);
          for (const relayUrl of outboxItem.readRelays) {
            if (this.ndk.pool.blacklistRelayUrls.has(relayUrl)) {
              this.debug(`removing blacklisted relay ${relayUrl} from read relays`);
              outboxItem.readRelays.delete(relayUrl);
            }
          }
          for (const relayUrl of outboxItem.writeRelays) {
            if (this.ndk.pool.blacklistRelayUrls.has(relayUrl)) {
              this.debug(`removing blacklisted relay ${relayUrl} from write relays`);
              outboxItem.writeRelays.delete(relayUrl);
            }
          }
          this.data.set(itemKey, outboxItem);
          this.debug(
            `Adding ${outboxItem.readRelays.size} read relays and ${outboxItem.writeRelays.size} write relays for ${user.hexpubkey}`
          );
        }
      });
    }
  }
  /**
   *
   * @param key
   * @param score
   */
  track(item, type) {
    const key = getKeyFromItem(item);
    type ??= getTypeFromItem(item);
    let outboxItem = this.data.get(key);
    if (!outboxItem)
      outboxItem = new OutboxItem(type);
    this.data.set(key, outboxItem);
    return outboxItem;
  }
};
function getKeyFromItem(item) {
  if (item instanceof NDKUser) {
    return item.hexpubkey;
  } else {
    return item;
  }
}
function getTypeFromItem(item) {
  if (item instanceof NDKUser) {
    return "user";
  } else {
    return "kind";
  }
}

// src/relay/pool/index.ts
import { EventEmitter as EventEmitter9 } from "tseep";
var NDKPool = class extends EventEmitter9 {
  // TODO: This should probably be an LRU cache
  relays = /* @__PURE__ */ new Map();
  blacklistRelayUrls;
  debug;
  temporaryRelayTimers = /* @__PURE__ */ new Map();
  flappingRelays = /* @__PURE__ */ new Set();
  // A map to store timeouts for each flapping relay.
  backoffTimes = /* @__PURE__ */ new Map();
  constructor(relayUrls = [], blacklistedRelayUrls = [], ndk, debug7) {
    super();
    this.debug = debug7 ?? ndk.debug.extend("pool");
    for (const relayUrl of relayUrls) {
      const relay = new NDKRelay(relayUrl);
      this.addRelay(relay, false);
    }
    this.blacklistRelayUrls = new Set(blacklistedRelayUrls);
  }
  /**
   * Adds a relay to the pool, and sets a timer to remove it if it is not used within the specified time.
   * @param relay - The relay to add to the pool.
   * @param removeIfUnusedAfter - The time in milliseconds to wait before removing the relay from the pool after it is no longer used.
   */
  useTemporaryRelay(relay, removeIfUnusedAfter = 6e5) {
    const relayAlreadyInPool = this.relays.has(relay.url);
    if (!relayAlreadyInPool) {
      this.addRelay(relay);
    }
    const existingTimer = this.temporaryRelayTimers.get(relay.url);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    if (!relayAlreadyInPool || existingTimer) {
      const timer = setTimeout(() => {
        this.removeRelay(relay.url);
      }, removeIfUnusedAfter);
      this.temporaryRelayTimers.set(relay.url, timer);
    }
  }
  /**
   * Adds a relay to the pool.
   *
   * @param relay - The relay to add to the pool.
   * @param connect - Whether or not to connect to the relay.
   */
  addRelay(relay, connect = true) {
    const relayUrl = relay.url;
    if (this.blacklistRelayUrls?.has(relayUrl)) {
      this.debug(`Relay ${relayUrl} is blacklisted`);
      return;
    }
    relay.on("notice", async (relay2, notice) => this.emit("notice", relay2, notice));
    relay.on("connect", () => this.handleRelayConnect(relayUrl));
    relay.on("ready", () => this.handleRelayReady(relay));
    relay.on("disconnect", async () => this.emit("relay:disconnect", relay));
    relay.on("flapping", () => this.handleFlapping(relay));
    relay.on("auth", async (challenge) => this.emit("relay:auth", relay, challenge));
    this.relays.set(relayUrl, relay);
    if (connect) {
      relay.connect().catch((e) => {
        this.debug(`Failed to connect to relay ${relayUrl}`, e);
      });
    }
  }
  /**
   * Removes a relay from the pool.
   * @param relayUrl - The URL of the relay to remove.
   * @returns {boolean} True if the relay was removed, false if it was not found.
   */
  removeRelay(relayUrl) {
    const relay = this.relays.get(relayUrl);
    if (relay) {
      relay.disconnect();
      this.relays.delete(relayUrl);
      this.emit("relay:disconnect", relay);
      return true;
    }
    const existingTimer = this.temporaryRelayTimers.get(relayUrl);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.temporaryRelayTimers.delete(relayUrl);
    }
    return false;
  }
  /**
   * Fetches a relay from the pool, or creates a new one if it does not exist.
   *
   * New relays will be attempted to be connected.
   */
  getRelay(url, connect = true) {
    let relay = this.relays.get(url);
    if (!relay) {
      relay = new NDKRelay(url);
      this.addRelay(relay, connect);
    }
    return relay;
  }
  handleRelayConnect(relayUrl) {
    this.debug(`Relay ${relayUrl} connected`);
    this.emit("relay:connect", this.relays.get(relayUrl));
    if (this.stats().connected === this.relays.size) {
      this.emit("connect");
    }
  }
  handleRelayReady(relay) {
    this.debug(`Relay ${relay.url} ready`);
    this.emit("relay:ready", relay);
  }
  /**
   * Attempts to establish a connection to each relay in the pool.
   *
   * @async
   * @param {number} [timeoutMs] - Optional timeout in milliseconds for each connection attempt.
   * @returns {Promise<void>} A promise that resolves when all connection attempts have completed.
   * @throws {Error} If any of the connection attempts result in an error or timeout.
   */
  async connect(timeoutMs) {
    const promises = [];
    this.debug(
      `Connecting to ${this.relays.size} relays${timeoutMs ? `, timeout ${timeoutMs}...` : ""}`
    );
    for (const relay of this.relays.values()) {
      if (timeoutMs) {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(`Timed out after ${timeoutMs}ms`), timeoutMs);
        });
        promises.push(
          Promise.race([relay.connect(), timeoutPromise]).catch((e) => {
            this.debug(
              `Failed to connect to relay ${relay.url}: ${e ?? "No reason specified"}`
            );
          })
        );
      } else {
        promises.push(relay.connect());
      }
    }
    if (timeoutMs) {
      setTimeout(() => {
        const allConnected = this.stats().connected === this.relays.size;
        const someConnected = this.stats().connected > 0;
        if (!allConnected && someConnected) {
          this.emit("connect");
        }
      }, timeoutMs);
    }
    await Promise.all(promises);
  }
  checkOnFlappingRelays() {
    const flappingRelaysCount = this.flappingRelays.size;
    const totalRelays = this.relays.size;
    if (flappingRelaysCount / totalRelays >= 0.8) {
      for (const relayUrl of this.flappingRelays) {
        this.backoffTimes.set(relayUrl, 0);
      }
    }
  }
  handleFlapping(relay) {
    this.debug(`Relay ${relay.url} is flapping`);
    let currentBackoff = this.backoffTimes.get(relay.url) || 5e3;
    currentBackoff = currentBackoff * 2;
    this.backoffTimes.set(relay.url, currentBackoff);
    this.debug(`Backoff time for ${relay.url} is ${currentBackoff}ms`);
    setTimeout(() => {
      this.debug(`Attempting to reconnect to ${relay.url}`);
      relay.connect();
      this.checkOnFlappingRelays();
    }, currentBackoff);
    relay.disconnect();
    this.emit("flapping", relay);
  }
  size() {
    return this.relays.size;
  }
  /**
   * Returns the status of each relay in the pool.
   * @returns {NDKPoolStats} An object containing the number of relays in each status.
   */
  stats() {
    const stats = {
      total: 0,
      connected: 0,
      disconnected: 0,
      connecting: 0
    };
    for (const relay of this.relays.values()) {
      stats.total++;
      if (relay.status === 1 /* CONNECTED */) {
        stats.connected++;
      } else if (relay.status === 3 /* DISCONNECTED */) {
        stats.disconnected++;
      } else if (relay.status === 0 /* CONNECTING */) {
        stats.connecting++;
      }
    }
    return stats;
  }
  connectedRelays() {
    return Array.from(this.relays.values()).filter(
      (relay) => relay.status === 1 /* CONNECTED */
    );
  }
  /**
   * Get a list of all relay urls in the pool.
   */
  urls() {
    return Array.from(this.relays.keys());
  }
};

// src/relay/sets/utils.ts
function correctRelaySet(relaySet, pool) {
  const connectedRelays = pool.connectedRelays();
  const includesConnectedRelay = Array.from(relaySet.relays).some((relay) => {
    return connectedRelays.map((r) => r.url).includes(relay.url);
  });
  if (!includesConnectedRelay) {
    for (const relay of connectedRelays) {
      relaySet.addRelay(relay);
    }
  }
  if (connectedRelays.length === 0) {
    for (const relay of pool.relays.values()) {
      relaySet.addRelay(relay);
    }
  }
  return relaySet;
}

// src/media/index.ts
var SPEC_PATH = "/.well-known/nostr/nip96.json";
var Nip96 = class {
  ndk;
  spec;
  url;
  nip98Required = false;
  /**
   * @param domain domain of the NIP96 service
   */
  constructor(domain, ndk) {
    this.url = `https://${domain}${SPEC_PATH}`;
    this.ndk = ndk;
  }
  async prepareUpload(blob, httpVerb = "POST") {
    this.validateHttpFetch();
    if (!this.spec)
      await this.fetchSpec();
    if (!this.spec)
      throw new Error("Failed to fetch NIP96 spec");
    let headers = {};
    if (this.nip98Required) {
      const authorizationHeader = await this.generateNip98Header(
        this.spec.api_url,
        httpVerb,
        blob
      );
      headers = { Authorization: authorizationHeader };
    }
    return {
      url: this.spec.api_url,
      headers
    };
  }
  /**
   * Provides an XMLHttpRequest-based upload method for browsers.
   * @example
   * const xhr = new XMLHttpRequest();
   * xhr.upload.addEventListener("progress", function(e) {
   *    const percentComplete = e.loaded / e.total;
   *    console.log(percentComplete);
   * });
   * const nip96 = ndk.getNip96("nostrcheck.me");
   * const blob = new Blob(["Hello, world!"], { type: "text/plain" });
   * const response = await nip96.xhrUpload(xhr, blob);
   * console.log(response);
   * @returns Promise that resolves to the upload response
   */
  async xhrUpload(xhr, blob) {
    const httpVerb = "POST";
    const { url, headers } = await this.prepareUpload(blob, httpVerb);
    xhr.open(httpVerb, url, true);
    if (headers["Authorization"]) {
      xhr.setRequestHeader("Authorization", headers["Authorization"]);
    }
    const formData = new FormData();
    formData.append("file", blob);
    return new Promise((resolve, reject) => {
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(xhr.statusText));
        }
      };
      xhr.onerror = function() {
        reject(new Error("Network Error"));
      };
      xhr.send(formData);
    });
  }
  /**
   * Fetch-based upload method. Note that this will use NDK's httpFetch
   * @param blob
   * @returns Promise that resolves to the upload response
   *
   * @example
   * const nip96 = ndk.getNip96("nostrcheck.me");
   * const blob = new Blob(["Hello, world!"], { type: "text/plain" });
   * const response = await nip96.upload(blob);
   * console.log(response);
   */
  async upload(blob) {
    const httpVerb = "POST";
    const { url, headers } = await this.prepareUpload(blob, httpVerb);
    const formData = new FormData();
    formData.append("file", blob);
    const res = await this.ndk.httpFetch(this.spec.api_url, {
      method: httpVerb,
      headers,
      body: formData
    });
    if (res.status !== 200)
      throw new Error(`Failed to upload file to ${url}`);
    const json = await res.json();
    if (json.status !== "success")
      throw new Error(json.message);
    return json;
  }
  validateHttpFetch() {
    if (!this.ndk)
      throw new Error("NDK is required to fetch NIP96 spec");
    if (!this.ndk.httpFetch)
      throw new Error("NDK must have an httpFetch method to fetch NIP96 spec");
  }
  async fetchSpec() {
    this.validateHttpFetch();
    const res = await this.ndk.httpFetch(this.url);
    if (res.status !== 200)
      throw new Error(`Failed to fetch NIP96 spec from ${this.url}`);
    const spec = await res.json();
    if (!spec)
      throw new Error(`Failed to parse NIP96 spec from ${this.url}`);
    this.spec = spec;
    this.nip98Required = this.spec.plans.free.is_nip98_required;
  }
  async generateNip98Header(requestUrl, httpMethod, blob) {
    const event = new NDKEvent(this.ndk, {
      kind: 27235 /* HttpAuth */,
      tags: [
        ["u", requestUrl],
        ["method", httpMethod]
      ]
    });
    if (["POST", "PUT", "PATCH"].includes(httpMethod)) {
      const sha256Hash = await this.calculateSha256(blob);
      event.tags.push(["payload", sha256Hash]);
    }
    await event.sign();
    const encodedEvent = btoa(JSON.stringify(event.rawEvent()));
    return `Nostr ${encodedEvent}`;
  }
  async calculateSha256(blob) {
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }
};

// src/ndk/index.ts
var DEFAULT_OUTBOX_RELAYS = ["wss://purplepag.es", "wss://relay.snort.social"];
var DEFAULT_BLACKLISTED_RELAYS = [
  "wss://brb.io"
  // BRB
];
var NDK = class extends EventEmitter10 {
  explicitRelayUrls;
  pool;
  outboxPool;
  _signer;
  _activeUser;
  cacheAdapter;
  debug;
  devWriteRelaySet;
  outboxTracker;
  mutedIds;
  clientName;
  clientNip89;
  /**
   * Default relay-auth policy that will be used when a relay requests authentication,
   * if no other policy is specified for that relay.
   *
   * @example Disconnect from relays that request authentication:
   * ```typescript
   * ndk.relayAuthDefaultPolicy = NDKAuthPolicies.disconnect(ndk.pool);
   * ```
   *
   * @example Sign in to relays that request authentication:
   * ```typescript
   * ndk.relayAuthDefaultPolicy = NDKAuthPolicies.signIn({ndk})
   * ```
   *
   * @example Sign in to relays that request authentication, asking the user for confirmation:
   * ```typescript
   * ndk.relayAuthDefaultPolicy = (relay: NDKRelay) => {
   *     const signIn = NDKAuthPolicies.signIn({ndk});
   *     if (confirm(`Relay ${relay.url} is requesting authentication, do you want to sign in?`)) {
   *        signIn(relay);
   *     }
   * }
   * ```
   */
  relayAuthDefaultPolicy;
  /**
   * Fetch function to use for HTTP requests.
   *
   * @example
   * ```typescript
   * import fetch from "node-fetch";
   *
   * ndk.httpFetch = fetch;
   * ```
   */
  httpFetch;
  autoConnectUserRelays = true;
  autoFetchUserMutelist = true;
  constructor(opts = {}) {
    super();
    this.debug = opts.debug || debug6("ndk");
    this.explicitRelayUrls = opts.explicitRelayUrls || [];
    this.pool = new NDKPool(opts.explicitRelayUrls || [], opts.blacklistRelayUrls, this);
    this.debug(`Starting with explicit relays: ${JSON.stringify(this.explicitRelayUrls)}`);
    this.pool.on("relay:auth", async (relay, challenge) => {
      if (this.relayAuthDefaultPolicy) {
        await this.relayAuthDefaultPolicy(relay, challenge);
      }
    });
    this.autoConnectUserRelays = opts.autoConnectUserRelays ?? true;
    this.autoFetchUserMutelist = opts.autoFetchUserMutelist ?? true;
    this.clientName = opts.clientName;
    this.clientNip89 = opts.clientNip89;
    this.relayAuthDefaultPolicy = opts.relayAuthDefaultPolicy;
    if (opts.enableOutboxModel) {
      this.outboxPool = new NDKPool(
        opts.outboxRelayUrls || DEFAULT_OUTBOX_RELAYS,
        opts.blacklistRelayUrls || DEFAULT_BLACKLISTED_RELAYS,
        this,
        this.debug.extend("outbox-pool")
      );
      this.outboxTracker = new OutboxTracker(this);
    }
    this.signer = opts.signer;
    this.cacheAdapter = opts.cacheAdapter;
    this.mutedIds = opts.mutedIds || /* @__PURE__ */ new Map();
    if (opts.devWriteRelayUrls) {
      this.devWriteRelaySet = NDKRelaySet.fromRelayUrls(opts.devWriteRelayUrls, this);
    }
    try {
      this.httpFetch = fetch;
    } catch {
    }
  }
  /**
   * Adds an explicit relay to the pool.
   * @param url
   * @param relayAuthPolicy Authentication policy to use if different from the default
   * @param connect Whether to connect to the relay automatically
   * @returns
   */
  addExplicitRelay(urlOrRelay, relayAuthPolicy, connect = true) {
    let relay;
    if (typeof urlOrRelay === "string") {
      relay = new NDKRelay(urlOrRelay, relayAuthPolicy);
    } else {
      relay = urlOrRelay;
    }
    this.pool.addRelay(relay, connect);
    this.explicitRelayUrls.push(relay.url);
    return relay;
  }
  toJSON() {
    return { relayCount: this.pool.relays.size }.toString();
  }
  get activeUser() {
    return this._activeUser;
  }
  /**
   * Sets the active user for this NDK instance, typically this will be
   * called when assigning a signer to the NDK instance.
   *
   * This function will automatically connect to the user's relays if
   * `autoConnectUserRelays` is set to true.
   *
   * It will also fetch the user's mutelist if `autoFetchUserMutelist` is set to true.
   */
  set activeUser(user) {
    const differentUser = this._activeUser?.pubkey !== user?.pubkey;
    this._activeUser = user;
    if (user && differentUser) {
      const connectToUserRelays = async (user2) => {
        const relayList = await NDKRelayList.forUser(user2, this);
        if (!relayList) {
          this.debug("No relay list found for user", { npub: user2.npub });
          return;
        }
        this.debug("Connecting to user relays", {
          npub: user2.npub,
          relays: relayList.relays
        });
        for (const url of relayList.relays) {
          let relay = this.pool.relays.get(url);
          if (!relay) {
            relay = new NDKRelay(url);
            this.pool.addRelay(relay);
          }
        }
      };
      const fetchUserMuteList = async (user2) => {
        const muteLists = await this.fetchEvents([
          { kinds: [1e4 /* MuteList */], authors: [user2.pubkey] },
          {
            kinds: [3e4 /* FollowSet */],
            authors: [user2.pubkey],
            "#d": ["mute"],
            limit: 1
          }
        ]);
        if (!muteLists) {
          this.debug("No mute list found for user", { npub: user2.npub });
          return;
        }
        for (const muteList of muteLists) {
          const list = lists_default.from(muteList);
          for (const item of list.items) {
            this.mutedIds.set(item[1], item[0]);
          }
        }
      };
      const userFunctions = [];
      if (this.autoConnectUserRelays)
        userFunctions.push(connectToUserRelays);
      if (this.autoFetchUserMutelist)
        userFunctions.push(fetchUserMuteList);
      const runUserFunctions = async (user2) => {
        for (const fn of userFunctions) {
          await fn(user2);
        }
      };
      const pool = this.outboxPool || this.pool;
      if (pool.connectedRelays.length > 0) {
        runUserFunctions(user);
      } else {
        this.debug("Waiting for connection to main relays");
        pool.once("relay:ready", (relay) => {
          this.debug("New relay ready", relay?.url);
          runUserFunctions(user);
        });
      }
    } else if (!user) {
      this.mutedIds = /* @__PURE__ */ new Map();
    }
  }
  get signer() {
    return this._signer;
  }
  set signer(newSigner) {
    this._signer = newSigner;
    this.emit("signer:ready", newSigner);
    newSigner?.user().then((user) => {
      user.ndk = this;
      this.activeUser = user;
    });
  }
  /**
   * Connect to relays with optional timeout.
   * If the timeout is reached, the connection will be continued to be established in the background.
   */
  async connect(timeoutMs) {
    if (this._signer && this.autoConnectUserRelays) {
      this.debug("Attempting to connect to user relays specified by signer");
      if (this._signer.relays) {
        const relays = await this._signer.relays();
        relays.forEach((relay) => this.pool.addRelay(relay));
      }
    }
    const connections = [this.pool.connect(timeoutMs)];
    if (this.outboxPool) {
      connections.push(this.outboxPool.connect(timeoutMs));
    }
    this.debug("Connecting to relays", { timeoutMs });
    return Promise.allSettled(connections).then(() => {
    });
  }
  /**
   * Get a NDKUser object
   *
   * @param opts
   * @returns
   */
  getUser(opts) {
    const user = new NDKUser(opts);
    user.ndk = this;
    return user;
  }
  /**
   * Get a NDKUser from a NIP05
   * @param nip05 NIP-05 ID
   * @param skipCache Skip cache
   * @returns
   */
  async getUserFromNip05(nip05, skipCache = false) {
    return NDKUser.fromNip05(nip05, this, skipCache);
  }
  /**
   * Create a new subscription. Subscriptions automatically start, you can make them automatically close when all relays send back an EOSE by setting `opts.closeOnEose` to `true`)
   *
   * @param filters
   * @param opts
   * @param relaySet explicit relay set to use
   * @param autoStart automatically start the subscription
   * @returns NDKSubscription
   */
  subscribe(filters, opts, relaySet, autoStart = true) {
    const subscription = new NDKSubscription(this, filters, opts, relaySet);
    if (relaySet) {
      for (const relay of relaySet.relays) {
        this.pool.useTemporaryRelay(relay);
      }
    }
    if (this.outboxPool && subscription.hasAuthorsFilter()) {
      const authors = subscription.filters.filter((filter) => filter.authors && filter.authors?.length > 0).map((filter) => filter.authors).flat();
      this.outboxTracker?.trackUsers(authors);
    }
    if (autoStart)
      subscription.start();
    return subscription;
  }
  /**
   * Publish an event to a relay
   * @param event event to publish
   * @param relaySet explicit relay set to use
   * @param timeoutMs timeout in milliseconds to wait for the event to be published
   * @returns The relays the event was published to
   *
   * @deprecated Use `event.publish()` instead
   */
  async publish(event, relaySet, timeoutMs) {
    this.debug("Deprecated: Use `event.publish()` instead");
    return event.publish(relaySet, timeoutMs);
  }
  /**
   * Fetch a single event.
   *
   * @param idOrFilter event id in bech32 format or filter
   * @param opts subscription options
   * @param relaySetOrRelay explicit relay set to use
   */
  async fetchEvent(idOrFilter, opts, relaySetOrRelay) {
    let filter;
    let relaySet;
    if (relaySetOrRelay instanceof NDKRelay) {
      relaySet = new NDKRelaySet(/* @__PURE__ */ new Set([relaySetOrRelay]), this);
    } else if (relaySetOrRelay instanceof NDKRelaySet) {
      relaySet = relaySetOrRelay;
    }
    if (!relaySetOrRelay && typeof idOrFilter === "string") {
      if (!isNip33AValue(idOrFilter)) {
        const relays = relaysFromBech32(idOrFilter);
        if (relays.length > 0) {
          relaySet = new NDKRelaySet(new Set(relays), this);
          relaySet = correctRelaySet(relaySet, this.pool);
        }
      }
    }
    if (typeof idOrFilter === "string") {
      filter = filterFromId(idOrFilter);
    } else {
      filter = idOrFilter;
    }
    if (!filter) {
      throw new Error(`Invalid filter: ${JSON.stringify(idOrFilter)}`);
    }
    return new Promise((resolve) => {
      const s = this.subscribe(
        filter,
        { ...opts || {}, closeOnEose: true },
        relaySet,
        false
      );
      s.on("event", (event) => {
        event.ndk = this;
        resolve(event);
      });
      s.on("eose", () => {
        resolve(null);
      });
      s.start();
    });
  }
  /**
   * Fetch events
   */
  async fetchEvents(filters, opts, relaySet) {
    return new Promise((resolve) => {
      const events = /* @__PURE__ */ new Map();
      const relaySetSubscription = this.subscribe(
        filters,
        { ...opts || {}, closeOnEose: true },
        relaySet,
        false
      );
      const onEvent = (event) => {
        const dedupKey = event.deduplicationKey();
        const existingEvent = events.get(dedupKey);
        if (existingEvent) {
          event = dedup(existingEvent, event);
        }
        event.ndk = this;
        events.set(dedupKey, event);
      };
      relaySetSubscription.on("event", onEvent);
      relaySetSubscription.on("event:dup", onEvent);
      relaySetSubscription.on("eose", () => {
        resolve(new Set(events.values()));
      });
      relaySetSubscription.start();
    });
  }
  /**
   * Ensures that a signer is available to sign an event.
   */
  assertSigner() {
    if (!this.signer) {
      this.emit("signerRequired");
      throw new Error("Signer required");
    }
  }
  /**
   * Creates a new Nip96 instance for the given domain.
   * @param domain Domain to use for nip96 uploads
   * @example Upload a file to a NIP-96 enabled domain:
   *
   * ```typescript
   * const blob = new Blob(["Hello, world!"], { type: "text/plain" });
   * const nip96 = ndk.getNip96("nostrcheck.me");
   * await nip96.upload(blob);
   * ```
   */
  getNip96(domain) {
    return new Nip96(domain, this);
  }
};

// src/zap/invoice.ts
import { decode } from "light-bolt11-decoder";
function zapInvoiceFromEvent(event) {
  const description = event.getMatchingTags("description")[0];
  const bolt11 = event.getMatchingTags("bolt11")[0];
  let decodedInvoice;
  let zapRequest;
  if (!description || !bolt11 || !bolt11[1]) {
    return null;
  }
  try {
    let zapRequestPayload = description[1];
    if (zapRequestPayload.startsWith("%")) {
      zapRequestPayload = decodeURIComponent(zapRequestPayload);
    }
    if (zapRequestPayload === "") {
      return null;
    }
    zapRequest = JSON.parse(zapRequestPayload);
    decodedInvoice = decode(bolt11[1]);
  } catch (e) {
    return null;
  }
  const amountSection = decodedInvoice.sections.find((s) => s.name === "amount");
  if (!amountSection) {
    return null;
  }
  const amount = parseInt(amountSection.value);
  if (!amount) {
    return null;
  }
  const content = zapRequest.content;
  const sender = zapRequest.pubkey;
  const recipientTag = event.getMatchingTags("p")[0];
  const recipient = recipientTag[1];
  let zappedEvent = event.getMatchingTags("e")[0];
  if (!zappedEvent) {
    zappedEvent = event.getMatchingTags("a")[0];
  }
  const zappedEventId = zappedEvent ? zappedEvent[1] : void 0;
  const zapInvoice = {
    id: event.id,
    zapper: event.pubkey,
    zappee: sender,
    zapped: recipient,
    zappedEvent: zappedEventId,
    amount,
    comment: content
  };
  return zapInvoice;
}
export {
  NDKAppHandlerEvent,
  NDKArticle,
  NDKDVMJobFeedback,
  NDKDVMJobResult,
  NDKDVMRequest,
  NDKDvmJobFeedbackStatus,
  NDKEvent,
  NDKHighlight,
  NDKKind,
  NDKList,
  NDKListKinds,
  NDKNip07Signer,
  NDKNip46Backend,
  NDKNip46Signer,
  NDKNostrRpc,
  NDKPrivateKeySigner,
  NDKRelay,
  NDKRelayAuthPolicies,
  NDKRelayList,
  NDKRelaySet,
  NDKRelayStatus,
  NDKRepost,
  NDKSimpleGroup,
  NDKSubscription,
  NDKSubscriptionCacheUsage,
  NDKSubscriptionReceipt,
  NDKSubscriptionStart,
  NDKSubscriptionTier,
  NDKTranscriptionDVM,
  NDKUser,
  NDKVideo,
  Zap as NDKZap,
  PublishError,
  calculateGroupableId,
  calculateTermDurationInSeconds,
  NDK as default,
  defaultOpts,
  dvmSchedule,
  mergeFilters,
  newAmount,
  parseTagToSubscriptionAmount,
  pinEvent,
  possibleIntervalFrequencies,
  profileFromEvent,
  serializeProfile,
  zapInvoiceFromEvent
};
