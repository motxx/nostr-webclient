import { EventEmitter } from 'tseep';
import debug$1 from 'debug';
import { LRUCache } from 'typescript-lru-cache';
import { Relay } from 'nostr-tools';

declare enum NDKKind {
    Metadata = 0,
    Text = 1,
    RecommendRelay = 2,
    Contacts = 3,
    EncryptedDirectMessage = 4,
    EventDeletion = 5,
    Repost = 6,
    Reaction = 7,
    BadgeAward = 8,
    GroupChat = 9,
    GroupNote = 11,
    GroupReply = 12,
    GenericRepost = 16,
    ChannelCreation = 40,
    ChannelMetadata = 41,
    ChannelMessage = 42,
    ChannelHideMessage = 43,
    ChannelMuteUser = 44,
    Media = 1063,
    Report = 1984,
    Label = 1985,
    DVMReqTextExtraction = 5000,
    DVMReqTextSummarization = 5001,
    DVMReqTextTranslation = 5002,
    DVMReqTextGeneration = 5050,
    DVMReqImageGeneration = 5100,
    DVMReqDiscoveryNostrContent = 5300,
    DVMReqDiscoveryNostrPeople = 5301,
    DVMReqTimestamping = 5900,
    DVMEventSchedule = 5905,
    DVMJobFeedback = 7000,
    Subscribe = 7001,
    Unsubscribe = 7002,
    SubscriptionReceipt = 7003,
    GroupAdminAddUser = 9000,
    GroupAdminRemoveUser = 9001,
    GroupAdminEditMetadata = 9002,
    GroupAdminEditStatus = 9006,
    MuteList = 10000,
    PinList = 10001,
    RelayList = 10002,
    BookmarkList = 10003,
    CommunityList = 10004,
    PublicChatList = 10005,
    BlockRelayList = 10006,
    SearchRelayList = 10007,
    InterestList = 10015,
    EmojiList = 10030,
    TierList = 17000,
    FollowSet = 30000,
    CategorizedPeopleList = 30000,
    CategorizedBookmarkList = 30001,
    RelaySet = 30002,
    CategorizedRelayList = 30002,
    BookmarkSet = 30003,
    /**
     * @deprecated Use ArticleCurationSet instead
     */
    CurationSet = 30004,
    ArticleCurationSet = 30004,
    VideoCurationSet = 30005,
    InterestSet = 30015,
    InterestsList = 30015,
    EmojiSet = 30030,
    HighlightSet = 39802,
    SubscriptionTier = 37001,
    CategorizedHighlightList = 39802,
    ZapRequest = 9734,
    Zap = 9735,
    Highlight = 9802,
    ClientAuth = 22242,
    NostrConnect = 24133,
    NWCInfoEvent = 13194,
    NWCRequest = 23194,
    NWCResponse = 23195,
    NWARequest = 33194,
    HttpAuth = 27235,
    ProfileBadge = 30008,
    BadgeDefinition = 30009,
    MarketStall = 30017,
    MarketProduct = 30018,
    Article = 30023,
    AppSpecificData = 30078,
    Classified = 30402,
    HorizontalVideo = 34235,
    GroupMetadata = 39000,
    GroupMembers = 39002,
    AppRecommendation = 31989,
    AppHandler = 31990
}
declare const NDKListKinds: NDKKind[];

declare class NDKRelayConnectivity {
    private ndkRelay;
    private _status;
    relay: Relay;
    private connectedAt?;
    private _connectionStats;
    private debug;
    constructor(ndkRelay: NDKRelay);
    initiateAuth(filter?: {
        limit: number;
    }): Promise<void>;
    connect(): Promise<void>;
    disconnect(): void;
    get status(): NDKRelayStatus;
    isAvailable(): boolean;
    /**
     * Evaluates the connection stats to determine if the relay is flapping.
     */
    private isFlapping;
    private handleNotice;
    /**
     * Called when the relay is unexpectedly disconnected.
     */
    private handleReconnection;
    /**
     * Utility functions to update the connection stats.
     */
    private updateConnectionStats;
    /**
     * Returns the connection stats.
     */
    get connectionStats(): NDKRelayConnectionStats;
}

type NDKRelayScore = number;

/**
 * Interface for NDK signers.
 */
interface NDKSigner {
    /**
     * Blocks until the signer is ready and returns the associated NDKUser.
     * @returns A promise that resolves to the NDKUser instance.
     */
    blockUntilReady(): Promise<NDKUser>;
    /**
     * Getter for the user property.
     * @returns A promise that resolves to the NDKUser instance.
     */
    user(): Promise<NDKUser>;
    /**
     * Signs the given Nostr event.
     * @param event - The Nostr event to be signed.
     * @returns A promise that resolves to the signature of the signed event.
     */
    sign(event: NostrEvent): Promise<string>;
    /**
     * Getter for the preferred relays.
     * @returns A promise containing a simple map of preferred relays and their read/write policies.
     */
    relays?(): Promise<NDKRelay[]>;
    /**
     * Encrypts the given Nostr event for the given recipient.
     * @param value - The value to be encrypted.
     * @param recipient - The recipient of the encrypted value.
     */
    encrypt(recipient: NDKUser, value: string): Promise<string>;
    /**
     * Decrypts the given value.
     * @param value
     */
    decrypt(sender: NDKUser, value: string): Promise<string>;
}

type NDKPoolStats = {
    total: number;
    connected: number;
    disconnected: number;
    connecting: number;
};
/**
 * Handles connections to all relays. A single pool should be used per NDK instance.
 *
 * @emit connect - Emitted when all relays in the pool are connected, or when the specified timeout has elapsed, and some relays are connected.
 * @emit notice - Emitted when a relay in the pool sends a notice.
 * @emit flapping - Emitted when a relay in the pool is flapping.
 * @emit relay:connect - Emitted when a relay in the pool connects.
 * @emit relay:ready - Emitted when a relay in the pool is ready to serve requests.
 * @emit relay:disconnect - Emitted when a relay in the pool disconnects.
 */
declare class NDKPool extends EventEmitter {
    relays: Map<string, NDKRelay>;
    blacklistRelayUrls: Set<WebSocket["url"]>;
    private debug;
    private temporaryRelayTimers;
    private flappingRelays;
    private backoffTimes;
    constructor(relayUrls: string[] | undefined, blacklistedRelayUrls: string[] | undefined, ndk: NDK, debug?: debug$1.Debugger);
    /**
     * Adds a relay to the pool, and sets a timer to remove it if it is not used within the specified time.
     * @param relay - The relay to add to the pool.
     * @param removeIfUnusedAfter - The time in milliseconds to wait before removing the relay from the pool after it is no longer used.
     */
    useTemporaryRelay(relay: NDKRelay, removeIfUnusedAfter?: number): void;
    /**
     * Adds a relay to the pool.
     *
     * @param relay - The relay to add to the pool.
     * @param connect - Whether or not to connect to the relay.
     */
    addRelay(relay: NDKRelay, connect?: boolean): void;
    /**
     * Removes a relay from the pool.
     * @param relayUrl - The URL of the relay to remove.
     * @returns {boolean} True if the relay was removed, false if it was not found.
     */
    removeRelay(relayUrl: string): boolean;
    /**
     * Fetches a relay from the pool, or creates a new one if it does not exist.
     *
     * New relays will be attempted to be connected.
     */
    getRelay(url: WebSocket["url"], connect?: boolean): NDKRelay;
    private handleRelayConnect;
    private handleRelayReady;
    /**
     * Attempts to establish a connection to each relay in the pool.
     *
     * @async
     * @param {number} [timeoutMs] - Optional timeout in milliseconds for each connection attempt.
     * @returns {Promise<void>} A promise that resolves when all connection attempts have completed.
     * @throws {Error} If any of the connection attempts result in an error or timeout.
     */
    connect(timeoutMs?: number): Promise<void>;
    private checkOnFlappingRelays;
    private handleFlapping;
    size(): number;
    /**
     * Returns the status of each relay in the pool.
     * @returns {NDKPoolStats} An object containing the number of relays in each status.
     */
    stats(): NDKPoolStats;
    connectedRelays(): NDKRelay[];
    /**
     * Get a list of all relay urls in the pool.
     */
    urls(): string[];
}

/**
 * NDKAuthPolicies are functions that are called when a relay requests authentication
 * so that you can define a behavior for your application.
 *
 * @param relay The relay that requested authentication.
 * @param challenge The challenge that the relay sent.
 */
type NDKAuthPolicy = (relay: NDKRelay, challenge: string) => Promise<boolean | void | NDKEvent>;
/**
 * This policy will disconnect from relays that request authentication.
 */
declare function disconnect(pool: NDKPool, debug?: debug.Debugger): (relay: NDKRelay) => Promise<void>;
type ISignIn = {
    ndk?: NDK;
    signer?: NDKSigner;
    debug?: debug.Debugger;
};
/**
 * Uses the signer to sign an event and then authenticate with the relay. If no signer is provided the NDK signer will be used. If none is not available it will wait for one to be ready.
 */
declare function signIn({ ndk, signer, debug }?: ISignIn): (relay: NDKRelay, challenge: string) => Promise<NDKEvent>;
declare const NDKRelayAuthPolicies: {
    disconnect: typeof disconnect;
    signIn: typeof signIn;
};

/** @deprecated Use `WebSocket['url']` instead. */
type NDKRelayUrl = WebSocket["url"];
declare enum NDKRelayStatus {
    CONNECTING = 0,
    CONNECTED = 1,
    DISCONNECTING = 2,
    DISCONNECTED = 3,
    RECONNECTING = 4,
    FLAPPING = 5,
    AUTH_REQUIRED = 6,
    AUTHENTICATING = 7
}
interface NDKRelayConnectionStats {
    /**
     * The number of times a connection has been attempted.
     */
    attempts: number;
    /**
     * The number of times a connection has been successfully established.
     */
    success: number;
    /**
     * The durations of the last 100 connections in milliseconds.
     */
    durations: number[];
    /**
     * The time the current connection was established in milliseconds.
     */
    connectedAt?: number;
}
/**
 * The NDKRelay class represents a connection to a relay.
 *
 * @emits NDKRelay#connect
 * @emits NDKRelay#ready
 * @emits NDKRelay#disconnect
 * @emits NDKRelay#notice
 * @emits NDKRelay#event
 * @emits NDKRelay#published when an event is published to the relay
 * @emits NDKRelay#publish:failed when an event fails to publish to the relay
 * @emits NDKRelay#eose
 * @emits NDKRelay#auth when the relay requires authentication
 */
declare class NDKRelay extends EventEmitter {
    readonly url: WebSocket["url"];
    readonly scores: Map<NDKUser, NDKRelayScore>;
    connectivity: NDKRelayConnectivity;
    private subs;
    private publisher;
    authPolicy?: NDKAuthPolicy;
    authRequired: boolean;
    /**
     * Whether this relay is trusted.
     *
     * Trusted relay's events do not get their signature verified.
     */
    trusted: boolean;
    complaining: boolean;
    readonly debug: debug$1.Debugger;
    constructor(url: WebSocket["url"], authPolicy?: NDKAuthPolicy);
    get status(): NDKRelayStatus;
    get connectionStats(): NDKRelayConnectionStats;
    /**
     * Connects to the relay.
     */
    connect(): Promise<void>;
    /**
     * Disconnects from the relay.
     */
    disconnect(): void;
    /**
     * Queues or executes the subscription of a specific set of filters
     * within this relay.
     *
     * @param subscription NDKSubscription this filters belong to.
     * @param filters Filters to execute
     */
    subscribe(subscription: NDKSubscription, filters: NDKFilter[]): void;
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
    publish(event: NDKEvent, timeoutMs?: number): Promise<boolean>;
    auth(event: NDKEvent): Promise<void>;
    /**
     * Called when this relay has responded with an event but
     * wasn't the fastest one.
     * @param timeDiffInMs The time difference in ms between the fastest and this relay in milliseconds
     */
    scoreSlowerEvent(timeDiffInMs: number): void;
    /** @deprecated Use referenceTags instead. */
    tagReference(marker?: string): NDKTag;
    referenceTags(): NDKTag[];
    activeSubscriptions(): Map<NDKFilter[], NDKSubscription[]>;
}

declare class PublishError extends Error {
    errors: Map<NDKRelay, Error>;
    constructor(message: string, errors: Map<NDKRelay, Error>);
    get relayErrors(): string;
}
/**
 * A relay set is a group of relays. This grouping can be short-living, for a single
 * REQ or can be long-lasting, for example for the explicit relay list the user
 * has specified.
 *
 * Requests to relays should be sent through this interface.
 */
declare class NDKRelaySet {
    readonly relays: Set<NDKRelay>;
    private debug;
    private ndk;
    constructor(relays: Set<NDKRelay>, ndk: NDK);
    /**
     * Adds a relay to this set.
     */
    addRelay(relay: NDKRelay): void;
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
    static fromRelayUrls(relayUrls: string[], ndk: NDK): NDKRelaySet;
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
    publish(event: NDKEvent, timeoutMs?: number): Promise<Set<NDKRelay>>;
    get size(): number;
}

type NDKFilter<K extends number = NDKKind> = {
    ids?: string[];
    kinds?: K[];
    authors?: string[];
    since?: number;
    until?: number;
    limit?: number;
    search?: string;
    [key: `#${string}`]: string[] | undefined;
};
declare enum NDKSubscriptionCacheUsage {
    ONLY_CACHE = "ONLY_CACHE",
    CACHE_FIRST = "CACHE_FIRST",
    PARALLEL = "PARALLEL",
    ONLY_RELAY = "ONLY_RELAY"
}
interface NDKSubscriptionOptions {
    /**
     * Whether to close the subscription when all relays have reached the end of the event stream.
     * @default false
     */
    closeOnEose?: boolean;
    cacheUsage?: NDKSubscriptionCacheUsage;
    /**
     * Groupable subscriptions are created with a slight time
     * delayed to allow similar filters to be grouped together.
     */
    groupable?: boolean;
    /**
     * The delay to use when grouping subscriptions, specified in milliseconds.
     * @default 100
     * @example
     * const sub1 = ndk.subscribe({ kinds: [1], authors: ["alice"] }, { groupableDelay: 100 });
     * const sub2 = ndk.subscribe({ kinds: [0], authors: ["alice"] }, { groupableDelay: 1000 });
     * // sub1 and sub2 will be grouped together and executed 100ms after sub1 was created
     */
    groupableDelay?: number;
    /**
     * Specifies how this delay should be interpreted.
     * "at-least" means "wait at least this long before sending the subscription"
     * "at-most" means "wait at most this long before sending the subscription"
     * @default "at-most"
     * @example
     * const sub1 = ndk.subscribe({ kinds: [1], authors: ["alice"] }, { groupableDelay: 100, groupableDelayType: "at-least" });
     * const sub2 = ndk.subscribe({ kinds: [0], authors: ["alice"] }, { groupableDelay: 1000, groupableDelayType: "at-most" });
     * // sub1 and sub2 will be grouped together and executed 1000ms after sub1 was created
     */
    groupableDelayType?: "at-least" | "at-most";
    /**
     * The subscription ID to use for the subscription.
     */
    subId?: string;
    /**
     * Pool to use
     */
    pool?: NDKPool;
    /**
     * Skip signature verification
     * @default false
     */
    skipVerification?: boolean;
    /**
     * Skip event validation
     * @default false
     */
    skipValidation?: boolean;
}
/**
 * Default subscription options.
 */
declare const defaultOpts: NDKSubscriptionOptions;
/**
 * Represents a subscription to an NDK event stream.
 *
 * @emits event
 * Emitted when an event is received by the subscription.
 * * ({NDKEvent} event - The event received by the subscription,
 * * {NDKRelay} relay - The relay that received the event,
 * * {NDKSubscription} subscription - The subscription that received the event.)
 *
 * @emits event:dup
 * Emitted when a duplicate event is received by the subscription.
 * * {NDKEvent} event - The duplicate event received by the subscription.
 * * {NDKRelay} relay - The relay that received the event.
 * * {number} timeSinceFirstSeen - The time elapsed since the first time the event was seen.
 * * {NDKSubscription} subscription - The subscription that received the event.
 *
 * @emits eose - Emitted when all relays have reached the end of the event stream.
 * * {NDKSubscription} subscription - The subscription that received EOSE.
 *
 * @emits close - Emitted when the subscription is closed.
 * * {NDKSubscription} subscription - The subscription that was closed.
 *
 * @example
 * const sub = ndk.subscribe({ kinds: [1] }); // Get all kind:1s
 * sub.on("event", (event) => console.log(event.content); // Show the content
 * sub.on("eose", () => console.log("All relays have reached the end of the event stream"));
 * sub.on("close", () => console.log("Subscription closed"));
 * setTimeout(() => sub.stop(), 10000); // Stop the subscription after 10 seconds
 *
 * @description
 * Subscriptions are created using {@link NDK.subscribe}.
 *
 * # Event validation
 * By defaults, subscriptions will validate events to comply with the minimal requirement
 * of each known NIP.
 * This can be disabled by setting the `skipValidation` option to `true`.
 *
 * @example
 * const sub = ndk.subscribe({ kinds: [1] }, { skipValidation: false });
 * sub.on("event", (event) => console.log(event.content); // Only valid events will be received
 */
declare class NDKSubscription extends EventEmitter {
    readonly subId?: string;
    readonly filters: NDKFilter[];
    readonly opts: NDKSubscriptionOptions;
    readonly pool: NDKPool;
    readonly skipVerification: boolean;
    readonly skipValidation: boolean;
    /**
     * Tracks the filters as they are executed on each relay
     */
    relayFilters?: Map<WebSocket["url"], NDKFilter[]>;
    relaySet?: NDKRelaySet;
    ndk: NDK;
    debug: debug.Debugger;
    eoseDebug: debug.Debugger;
    /**
     * Events that have been seen by the subscription, with the time they were first seen.
     */
    eventFirstSeen: Map<string, number>;
    /**
     * Relays that have sent an EOSE.
     */
    eosesSeen: Set<NDKRelay>;
    /**
     * Events that have been seen by the subscription per relay.
     */
    eventsPerRelay: Map<NDKRelay, Set<NDKEventId>>;
    /**
     * The time the last event was received by the subscription.
     * This is used to calculate when EOSE should be emitted.
     */
    private lastEventReceivedAt;
    internalId: string;
    constructor(ndk: NDK, filters: NDKFilter | NDKFilter[], opts?: NDKSubscriptionOptions, relaySet?: NDKRelaySet, subId?: string);
    /**
     * Provides access to the first filter of the subscription for
     * backwards compatibility.
     */
    get filter(): NDKFilter;
    isGroupable(): boolean;
    private shouldQueryCache;
    private shouldQueryRelays;
    private shouldWaitForCache;
    /**
     * Start the subscription. This is the main method that should be called
     * after creating a subscription.
     */
    start(): Promise<void>;
    stop(): void;
    /**
     * @returns Whether the subscription has an authors filter.
     */
    hasAuthorsFilter(): boolean;
    private startWithCache;
    /**
     * Send REQ to relays
     */
    private startWithRelays;
    /**
     * Called when an event is received from a relay or the cache
     * @param event
     * @param relay
     * @param fromCache Whether the event was received from the cache
     */
    eventReceived(event: NDKEvent, relay: NDKRelay | undefined, fromCache?: boolean): void;
    private eoseTimeout;
    eoseReceived(relay: NDKRelay): void;
}

/**
 * NDKUserProfile represents a user's kind 0 profile metadata
 */
interface NDKUserProfile {
    [key: string]: string | undefined;
    name?: string;
    displayName?: string;
    image?: string;
    banner?: string;
    bio?: string;
    nip05?: string;
    lud06?: string;
    lud16?: string;
    about?: string;
    zapService?: string;
    website?: string;
}
declare function profileFromEvent(event: NDKEvent): NDKUserProfile;
declare function serializeProfile(profile: NDKUserProfile): string;

type Hexpubkey = string;
type Npub = string;
type ProfilePointer = {
    pubkey: string;
    relays?: string[];
    nip46?: string[];
};
type EventPointer = {
    id: string;
    relays?: string[];
    author?: string;
    kind?: number;
};
interface NDKUserParams {
    npub?: Npub;
    hexpubkey?: Hexpubkey;
    pubkey?: Hexpubkey;
    nip05?: string;
    relayUrls?: string[];
    nip46Urls?: string[];
}
/**
 * Represents a pubkey.
 */
declare class NDKUser {
    ndk: NDK | undefined;
    profile?: NDKUserProfile;
    private _npub?;
    private _pubkey?;
    readonly relayUrls: string[];
    readonly nip46Urls: string[];
    constructor(opts: NDKUserParams);
    get npub(): string;
    set npub(npub: Npub);
    /**
     * Get the user's hexpubkey
     * @returns {Hexpubkey} The user's hexpubkey
     *
     * @deprecated Use `pubkey` instead
     */
    get hexpubkey(): Hexpubkey;
    /**
     * Set the user's hexpubkey
     * @param pubkey {Hexpubkey} The user's hexpubkey
     * @deprecated Use `pubkey` instead
     */
    set hexpubkey(pubkey: Hexpubkey);
    /**
     * Get the user's pubkey
     * @returns {string} The user's pubkey
     */
    get pubkey(): string;
    /**
     * Set the user's pubkey
     * @param pubkey {string} The user's pubkey
     */
    set pubkey(pubkey: string);
    /**
     * Instantiate an NDKUser from a NIP-05 string
     * @param nip05Id {string} The user's NIP-05
     * @param ndk {NDK} An NDK instance
     * @param skipCache {boolean} Whether to skip the cache or not
     * @returns {NDKUser | undefined} An NDKUser if one is found for the given NIP-05, undefined otherwise.
     */
    static fromNip05(nip05Id: string, ndk?: NDK, skipCache?: boolean): Promise<NDKUser | undefined>;
    /**
     * Fetch a user's profile
     * @param opts {NDKSubscriptionOptions} A set of NDKSubscriptionOptions
     * @returns User Profile
     */
    fetchProfile(opts?: NDKSubscriptionOptions): Promise<NDKUserProfile | null>;
    /**
     * Returns a set of users that this user follows.
     */
    follows: (opts?: NDKSubscriptionOptions | undefined, outbox?: boolean | undefined, kind?: number | undefined) => Promise<Set<NDKUser>>;
    /** @deprecated Use referenceTags instead. */
    /**
     * Get the tag that can be used to reference this user in an event
     * @returns {NDKTag} an NDKTag
     */
    tagReference(): NDKTag;
    /**
     * Get the tags that can be used to reference this user in an event
     * @returns {NDKTag[]} an array of NDKTag
     */
    referenceTags(marker?: string): NDKTag[];
    /**
     * Publishes the current profile.
     */
    publish(): Promise<void>;
    /**
     * Add a follow to this user's contact list
     *
     * @param newFollow {NDKUser} The user to follow
     * @param currentFollowList {Set<NDKUser>} The current follow list
     * @param kind {NDKKind} The kind to use for this contact list (defaults to `3`)
     * @returns {Promise<boolean>} True if the follow was added, false if the follow already exists
     */
    follow(newFollow: NDKUser, currentFollowList?: Set<NDKUser>, kind?: NDKKind): Promise<boolean>;
    /**
     * Validate a user's NIP-05 identifier (usually fetched from their kind:0 profile data)
     *
     * @param nip05Id The NIP-05 string to validate
     * @returns {Promise<boolean | null>} True if the NIP-05 is found and matches this user's pubkey,
     * False if the NIP-05 is found but doesn't match this user's pubkey,
     * null if the NIP-05 isn't found on the domain or we're unable to verify (because of network issues, etc.)
     */
    validateNip05(nip05Id: string): Promise<boolean | null>;
    /**
     * Zap a user
     *
     * @param amount The amount to zap in millisatoshis
     * @param comment A comment to add to the zap request
     * @param extraTags Extra tags to add to the zap request
     * @param signer The signer to use (will default to the NDK instance's signer)
     */
    zap(amount: number, comment?: string, extraTags?: NDKTag[], signer?: NDKSigner): Promise<string | null>;
}

type OutboxItemType = "user" | "kind";
/**
 * Tracks outbox scoring of an item. An item can be any of:
 *
 *  -  A user
 *  -  A tag
 */
declare class OutboxItem {
    /**
     * Type of item
     */
    type: OutboxItemType;
    /**
     * The relay URLs that are of interest to this item
     */
    relayUrlScores: Map<WebSocket["url"], number>;
    readRelays: Set<WebSocket["url"]>;
    writeRelays: Set<WebSocket["url"]>;
    constructor(type: OutboxItemType);
}
/**
 * The responsibility of this class is to track relay:outbox-item associations
 * so that we can intelligently choose which relays to query for which items.
 *
 * A single instance of this class should be shared across all subscriptions within
 * an NDK instance.
 *
 * TODO: The state of this tracker needs to be added to cache adapters so that we
 * can rehydrae-it when a cache is present.
 */
declare class OutboxTracker extends EventEmitter {
    data: LRUCache<Hexpubkey, OutboxItem>;
    private ndk;
    private debug;
    constructor(ndk: NDK);
    trackUsers(items: NDKUser[] | Hexpubkey[]): void;
    /**
     *
     * @param key
     * @param score
     */
    track(item: NDKUser | Hexpubkey, type?: OutboxItemType): OutboxItem;
}

type PrepareUploadResult = {
    url: string;
    headers: {
        [key: string]: string;
    };
};
/**
 * Provides utility methods for interacting with NIP-96 upload services
 */
declare class Nip96 {
    private ndk;
    spec: Nip96Spec | undefined;
    private url;
    nip98Required: boolean;
    /**
     * @param domain domain of the NIP96 service
     */
    constructor(domain: string, ndk: NDK);
    prepareUpload(blob: Blob, httpVerb?: string): Promise<PrepareUploadResult>;
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
    xhrUpload(xhr: XMLHttpRequest, blob: Blob): Promise<Nip96UploadResponse>;
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
    upload(blob: Blob): Promise<Nip96UploadResponse>;
    private validateHttpFetch;
    fetchSpec(): Promise<void>;
    generateNip98Header(requestUrl: string, httpMethod: string, blob: Blob): Promise<string>;
    private calculateSha256;
}
type Nip96Spec = {
    api_url: string;
    download_url?: string;
    delegated_to_url?: string;
    supported_nips?: number[];
    tos_url?: string;
    content_types?: string[];
    plans: {
        [key: string]: {
            name: string;
            is_nip98_required: boolean;
            url?: string;
            max_byte_size?: number;
            file_expiration?: [number, number];
            media_transformations?: {
                image?: string[];
            };
        };
    };
};
type Nip96UploadResponse = {
    status: "success" | "error";
    message: string;
    processing_url?: string;
    nip94_event?: {
        tags: NDKTag[];
        content: string;
    };
};

interface NDKConstructorParams {
    /**
     * Relays we should explicitly connect to
     */
    explicitRelayUrls?: string[];
    /**
     * Relays we should never connect to
     */
    blacklistRelayUrls?: string[];
    /**
     * When this is set, we always write only to this relays.
     */
    devWriteRelayUrls?: string[];
    /**
     * Outbox relay URLs.
     */
    outboxRelayUrls?: string[];
    /**
     * Enable outbox model (defaults to false)
     */
    enableOutboxModel?: boolean;
    /**
     * Auto-connect to main user's relays. The "main" user is determined
     * by the presence of a signer. Upon connection to the explicit relays,
     * the user's relays will be fetched and connected to if this is set to true.
     * @default true
     */
    autoConnectUserRelays?: boolean;
    /**
     * Automatically fetch user's mutelist
     * @default true
     */
    autoFetchUserMutelist?: boolean;
    /**
     * Signer to use for signing events by default
     */
    signer?: NDKSigner;
    /**
     * Cache adapter to use for caching events
     */
    cacheAdapter?: NDKCacheAdapter;
    /**
     * Debug instance to use
     */
    debug?: debug$1.Debugger;
    /**
     * Muted pubkeys and eventIds
     */
    mutedIds?: Map<Hexpubkey | NDKEventId, string>;
    /**
     * Client name to add to events' tag
     */
    clientName?: string;
    /**
     * Client nip89 to add to events' tag
     */
    clientNip89?: string;
    /**
     * Default relay-auth policy
     */
    relayAuthDefaultPolicy?: NDKAuthPolicy;
}
interface GetUserParams extends NDKUserParams {
    npub?: string;
    pubkey?: string;
    /**
     * @deprecated Use `pubkey` instead
     */
    hexpubkey?: string;
}
/**
 * The NDK class is the main entry point to the library.
 *
 * @emits signer:ready when a signer is ready
 */
declare class NDK extends EventEmitter {
    explicitRelayUrls?: WebSocket["url"][];
    pool: NDKPool;
    outboxPool?: NDKPool;
    private _signer?;
    private _activeUser?;
    cacheAdapter?: NDKCacheAdapter;
    debug: debug$1.Debugger;
    devWriteRelaySet?: NDKRelaySet;
    outboxTracker?: OutboxTracker;
    mutedIds: Map<Hexpubkey | NDKEventId, string>;
    clientName?: string;
    clientNip89?: string;
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
    relayAuthDefaultPolicy?: NDKAuthPolicy;
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
    httpFetch: typeof fetch | undefined;
    private autoConnectUserRelays;
    private autoFetchUserMutelist;
    constructor(opts?: NDKConstructorParams);
    /**
     * Adds an explicit relay to the pool.
     * @param url
     * @param relayAuthPolicy Authentication policy to use if different from the default
     * @param connect Whether to connect to the relay automatically
     * @returns
     */
    addExplicitRelay(urlOrRelay: string | NDKRelay, relayAuthPolicy?: NDKAuthPolicy, connect?: boolean): NDKRelay;
    toJSON(): string;
    get activeUser(): NDKUser | undefined;
    /**
     * Sets the active user for this NDK instance, typically this will be
     * called when assigning a signer to the NDK instance.
     *
     * This function will automatically connect to the user's relays if
     * `autoConnectUserRelays` is set to true.
     *
     * It will also fetch the user's mutelist if `autoFetchUserMutelist` is set to true.
     */
    set activeUser(user: NDKUser | undefined);
    get signer(): NDKSigner | undefined;
    set signer(newSigner: NDKSigner | undefined);
    /**
     * Connect to relays with optional timeout.
     * If the timeout is reached, the connection will be continued to be established in the background.
     */
    connect(timeoutMs?: number): Promise<void>;
    /**
     * Get a NDKUser object
     *
     * @param opts
     * @returns
     */
    getUser(opts: GetUserParams): NDKUser;
    /**
     * Get a NDKUser from a NIP05
     * @param nip05 NIP-05 ID
     * @param skipCache Skip cache
     * @returns
     */
    getUserFromNip05(nip05: string, skipCache?: boolean): Promise<NDKUser | undefined>;
    /**
     * Create a new subscription. Subscriptions automatically start, you can make them automatically close when all relays send back an EOSE by setting `opts.closeOnEose` to `true`)
     *
     * @param filters
     * @param opts
     * @param relaySet explicit relay set to use
     * @param autoStart automatically start the subscription
     * @returns NDKSubscription
     */
    subscribe(filters: NDKFilter | NDKFilter[], opts?: NDKSubscriptionOptions, relaySet?: NDKRelaySet, autoStart?: boolean): NDKSubscription;
    /**
     * Publish an event to a relay
     * @param event event to publish
     * @param relaySet explicit relay set to use
     * @param timeoutMs timeout in milliseconds to wait for the event to be published
     * @returns The relays the event was published to
     *
     * @deprecated Use `event.publish()` instead
     */
    publish(event: NDKEvent, relaySet?: NDKRelaySet, timeoutMs?: number): Promise<Set<NDKRelay>>;
    /**
     * Fetch a single event.
     *
     * @param idOrFilter event id in bech32 format or filter
     * @param opts subscription options
     * @param relaySetOrRelay explicit relay set to use
     */
    fetchEvent(idOrFilter: string | NDKFilter, opts?: NDKSubscriptionOptions, relaySetOrRelay?: NDKRelaySet | NDKRelay): Promise<NDKEvent | null>;
    /**
     * Fetch events
     */
    fetchEvents(filters: NDKFilter | NDKFilter[], opts?: NDKSubscriptionOptions, relaySet?: NDKRelaySet): Promise<Set<NDKEvent>>;
    /**
     * Ensures that a signer is available to sign an event.
     */
    assertSigner(): void;
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
    getNip96(domain: string): Nip96;
}

type ContentTag = {
    tags: NDKTag[];
    content: string;
};

type NDKEventId = string;
type NDKTag = string[];
type NostrEvent = {
    created_at: number;
    content: string;
    tags: NDKTag[];
    kind?: NDKKind | number;
    pubkey: string;
    id?: string;
    sig?: string;
};
/**
 * NDKEvent is the basic building block of NDK; most things
 * you do with NDK will revolve around writing or consuming NDKEvents.
 */
declare class NDKEvent extends EventEmitter {
    ndk?: NDK;
    created_at?: number;
    content: string;
    tags: NDKTag[];
    kind?: NDKKind | number;
    id: string;
    sig?: string;
    pubkey: string;
    private _author;
    /**
     * The relay that this event was first received from.
     */
    relay: NDKRelay | undefined;
    /**
     * The relays that this event was received from and/or successfully published to.
     */
    onRelays: NDKRelay[];
    constructor(ndk?: NDK, event?: NostrEvent);
    /**
     * Returns the event as is.
     */
    rawEvent(): NostrEvent;
    set author(user: NDKUser);
    /**
     * Returns an NDKUser for the author of the event.
     */
    get author(): NDKUser;
    /**
     * Tag a user with an optional marker.
     * @param user The user to tag.
     * @param marker The marker to use in the tag.
     */
    tag(user: NDKUser, marker?: string): void;
    /**
     * Tag a user with an optional marker.
     * @param user The user to tag.
     * @param marker The marker to use in the tag.
     */
    tag(user: NDKUser, marker?: string): void;
    /**
     * Tag a user with an optional marker.
     * @param event The event to tag.
     * @param marker The marker to use in the tag.
     * @param skipAuthorTag Whether to explicitly skip adding the author tag of the event.
     * @example
     * ```typescript
     * reply.tag(opEvent, "reply");
     * // reply.tags => [["e", <id>, <relay>, "reply"]]
     * ```
     */
    tag(event: NDKEvent, marker?: string, skipAuthorTag?: boolean): void;
    /**
     * Return a NostrEvent object, trying to fill in missing fields
     * when possible, adding tags when necessary.
     * @param pubkey {string} The pubkey of the user who the event belongs to.
     * @returns {Promise<NostrEvent>} A promise that resolves to a NostrEvent.
     */
    toNostrEvent(pubkey?: string): Promise<NostrEvent>;
    isReplaceable: () => boolean;
    isEphemeral: () => boolean;
    isParamReplaceable: () => boolean;
    /**
     * Encodes a bech32 id.
     *
     * @param relays {string[]} The relays to encode in the id
     * @returns {string} - Encoded naddr, note or nevent.
     */
    encode: () => `nevent1${string}` | `naddr1${string}` | `note1${string}`;
    encrypt: (recipient?: NDKUser | undefined, signer?: NDKSigner | undefined) => Promise<void>;
    decrypt: (sender?: NDKUser | undefined, signer?: NDKSigner | undefined) => Promise<void>;
    /**
     * Get all tags with the given name
     * @param tagName {string} The name of the tag to search for
     * @returns {NDKTag[]} An array of the matching tags
     */
    getMatchingTags(tagName: string): NDKTag[];
    /**
     * Get the first tag with the given name
     * @param tagName Tag name to search for
     * @returns The value of the first tag with the given name, or undefined if no such tag exists
     */
    tagValue(tagName: string): string | undefined;
    /**
     * Gets the NIP-31 "alt" tag of the event.
     */
    get alt(): string | undefined;
    /**
     * Sets the NIP-31 "alt" tag of the event. Use this to set an alt tag so
     * clients that don't handle a particular event kind can display something
     * useful for users.
     */
    set alt(alt: string | undefined);
    /**
     * Gets the NIP-33 "d" tag of the event.
     */
    get dTag(): string | undefined;
    /**
     * Sets the NIP-33 "d" tag of the event.
     */
    set dTag(value: string | undefined);
    /**
     * Remove all tags with the given name (e.g. "d", "a", "p")
     * @param tagName Tag name to search for and remove
     * @returns {void}
     */
    removeTag(tagName: string): void;
    /**
     * Sign the event if a signer is present.
     *
     * It will generate tags.
     * Repleacable events will have their created_at field set to the current time.
     * @param signer {NDKSigner} The NDKSigner to use to sign the event
     * @returns {Promise<string>} A Promise that resolves to the signature of the signed event.
     */
    sign(signer?: NDKSigner): Promise<string>;
    /**
     * Attempt to sign and then publish an NDKEvent to a given relaySet.
     * If no relaySet is provided, the relaySet will be calculated by NDK.
     * @param relaySet {NDKRelaySet} The relaySet to publish the even to.
     * @returns A promise that resolves to the relays the event was published to.
     */
    publish(relaySet?: NDKRelaySet, timeoutMs?: number): Promise<Set<NDKRelay>>;
    /**
     * Generates tags for users, notes, and other events tagged in content.
     * Will also generate random "d" tag for parameterized replaceable events where needed.
     * @returns {ContentTag} The tags and content of the event.
     */
    generateTags(): Promise<ContentTag>;
    muted(): string | null;
    /**
     * Returns the "d" tag of a parameterized replaceable event or throws an error if the event isn't
     * a parameterized replaceable event.
     * @returns {string} the "d" tag of the event.
     */
    replaceableDTag(): string;
    /**
     * Provides a deduplication key for the event.
     *
     * For kinds 0, 3, 10k-20k this will be the event <kind>:<pubkey>
     * For kinds 30k-40k this will be the event <kind>:<pubkey>:<d-tag>
     * For all other kinds this will be the event id
     */
    deduplicationKey(): string;
    /**
     * Returns the id of the event or, if it's a parameterized event, the generated id of the event using "d" tag, pubkey, and kind.
     * @returns {string} The id
     */
    tagId(): string;
    /**
     * Returns the "reference" value ("<kind>:<author-pubkey>:<d-tag>") for this replaceable event.
     * @returns {string} The id
     */
    tagAddress(): string;
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
    tagReference(marker?: string): NDKTag;
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
    referenceTags(marker?: string, skipAuthorTag?: boolean): NDKTag[];
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
    filter(): NDKFilter;
    /**
     * Create a zap request for an existing event
     *
     * @param amount The amount to zap in millisatoshis
     * @param comment A comment to add to the zap request
     * @param extraTags Extra tags to add to the zap request
     * @param recipient The zap recipient (optional for events)
     * @param signer The signer to use (will default to the NDK instance's signer)
     */
    zap(amount: number, comment?: string, extraTags?: NDKTag[], recipient?: NDKUser, signer?: NDKSigner): Promise<string | null>;
    /**
     * Generates a deletion event of the current event
     *
     * @param reason The reason for the deletion
     * @param publish Whether to publish the deletion event automatically
     * @returns The deletion event
     */
    delete(reason?: string, publish?: boolean): Promise<NDKEvent>;
    /**
     * NIP-18 reposting event.
     *
     * @param publish Whether to publish the reposted event automatically
     * @param signer The signer to use for signing the reposted event
     * @returns The reposted event
     *
     * @function
     */
    repost: (publish?: boolean | undefined, signer?: NDKSigner | undefined) => Promise<NDKEvent>;
    /**
     * React to an existing event
     *
     * @param content The content of the reaction
     */
    react(content: string, publish?: boolean): Promise<NDKEvent>;
    /**
     * Checks whether the event is valid per underlying NIPs.
     *
     * This method is meant to be overridden by subclasses that implement specific NIPs
     * to allow the enforcement of NIP-specific validation rules.
     *
     *
     */
    get isValid(): boolean;
}

interface NDKCacheAdapter {
    /**
     * Whether this cache adapter is expected to be fast.
     * If this is true, the cache will be queried before the relays.
     * When this is false, the cache will be queried in addition to the relays.
     */
    locking: boolean;
    query(subscription: NDKSubscription): Promise<void>;
    setEvent(event: NDKEvent, filters: NDKFilter[], relay?: NDKRelay): Promise<void>;
    /**
     * Special purpose
     */
    fetchProfile?(pubkey: Hexpubkey): Promise<NDKUserProfile | null>;
    saveProfile?(pubkey: Hexpubkey, profile: NDKUserProfile): void;
    loadNip05?(nip05: string): Promise<ProfilePointer | null>;
    saveNip05?(nip05: string, profile: ProfilePointer): void;
}

/**
 * Pins an event
 */
declare function pinEvent(user: NDKUser, event: NDKEvent, pinEvent?: NDKEvent, publish?: boolean): Promise<NDKEvent>;

/**
 * Represents a NIP-23 article.
 */
declare class NDKArticle extends NDKEvent {
    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent);
    /**
     * Creates a NDKArticle from an existing NDKEvent.
     *
     * @param event NDKEvent to create the NDKArticle from.
     * @returns NDKArticle
     */
    static from(event: NDKEvent): NDKArticle;
    /**
     * Getter for the article title.
     *
     * @returns {string | undefined} - The article title if available, otherwise undefined.
     */
    get title(): string | undefined;
    /**
     * Setter for the article title.
     *
     * @param {string | undefined} title - The title to set for the article.
     */
    set title(title: string | undefined);
    /**
     * Getter for the article image.
     *
     * @returns {string | undefined} - The article image if available, otherwise undefined.
     */
    get image(): string | undefined;
    /**
     * Setter for the article image.
     *
     * @param {string | undefined} image - The image to set for the article.
     */
    set image(image: string | undefined);
    get summary(): string | undefined;
    set summary(summary: string | undefined);
    /**
     * Getter for the article's publication timestamp.
     *
     * @returns {number | undefined} - The Unix timestamp of when the article was published or undefined.
     */
    get published_at(): number | undefined;
    /**
     * Setter for the article's publication timestamp.
     *
     * @param {number | undefined} timestamp - The Unix timestamp to set for the article's publication date.
     */
    set published_at(timestamp: number | undefined);
    /**
     * Generates content tags for the article.
     *
     * This method first checks and sets the publication date if not available,
     * and then generates content tags based on the base NDKEvent class.
     *
     * @returns {ContentTag} - The generated content tags.
     */
    generateTags(): Promise<ContentTag>;
    /**
     * Getter for the article's URL.
     *
     * @returns {string | undefined} - The article's URL if available, otherwise undefined.
     */
    get url(): string | undefined;
    /**
     * Setter for the article's URL.
     *
     * @param {string | undefined} url - The URL to set for the article.
     */
    set url(url: string | undefined);
}

declare class NDKVideo extends NDKEvent {
    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent);
    /**
     * Creates a NDKArticle from an existing NDKEvent.
     *
     * @param event NDKEvent to create the NDKArticle from.
     * @returns NDKArticle
     */
    static from(event: NDKEvent): NDKVideo;
    /**
     * Getter for the article title.
     *
     * @returns {string | undefined} - The article title if available, otherwise undefined.
     */
    get title(): string | undefined;
    /**
     * Setter for the article title.
     *
     * @param {string | undefined} title - The title to set for the article.
     */
    set title(title: string | undefined);
    /**
     * Getter for the article thumbnail.
     *
     * @returns {string | undefined} - The article thumbnail if available, otherwise undefined.
     */
    get thumbnail(): string | undefined;
    /**
     * Setter for the article thumbnail.
     *
     * @param {string | undefined} thumbnail - The thumbnail to set for the article.
     */
    set thumbnail(thumbnail: string | undefined);
    get url(): string | undefined;
    set url(url: string | undefined);
    /**
     * Getter for the article's publication timestamp.
     *
     * @returns {number | undefined} - The Unix timestamp of when the article was published or undefined.
     */
    get published_at(): number | undefined;
    /**
     * Setter for the article's publication timestamp.
     *
     * @param {number | undefined} timestamp - The Unix timestamp to set for the article's publication date.
     */
    set published_at(timestamp: number | undefined);
    /**
     * Generates content tags for the article.
     *
     * This method first checks and sets the publication date if not available,
     * and then generates content tags based on the base NDKEvent class.
     *
     * @returns {ContentTag} - The generated content tags.
     */
    generateTags(): Promise<ContentTag>;
    get duration(): number | undefined;
    /**
     * Setter for the video's duration
     *
     * @param {number | undefined} duration - The duration to set for the video (in seconds)
     */
    set duration(dur: number | undefined);
}

/**
 * Highlight as defined by NIP-84 (kind:9802).
 */
declare class NDKHighlight extends NDKEvent {
    private _article;
    constructor(ndk?: NDK, rawEvent?: NostrEvent);
    static from(event: NDKEvent): NDKHighlight;
    get url(): string | undefined;
    /**
     * Context tag.
     */
    set context(context: string | undefined);
    get context(): string | undefined;
    /**
     * Will return the article URL or NDKEvent if they have already been
     * set (it won't attempt to load remote events)
     */
    get article(): NDKEvent | string | undefined;
    /**
     * Article the highlight is coming from.
     *
     * @param article Article URL or NDKEvent.
     */
    set article(article: NDKEvent | string);
    getArticleTag(): NDKTag | undefined;
    getArticle(): Promise<NDKArticle | NDKEvent | string | undefined>;
}

declare class NDKRelayList extends NDKEvent {
    constructor(ndk?: NDK, rawEvent?: NostrEvent);
    static from(ndkEvent: NDKEvent): NDKRelayList;
    /**
     * Returns a set of relay list events for a user.
     * @returns {Promise<Set<NDKEvent>>} A set of NDKEvents returned for the given user.
     */
    static forUser(user: NDKUser, ndk: NDK): Promise<NDKRelayList | undefined>;
    get readRelayUrls(): WebSocket["url"][];
    set readRelayUrls(relays: WebSocket["url"][]);
    get writeRelayUrls(): WebSocket["url"][];
    set writeRelayUrls(relays: WebSocket["url"][]);
    get bothRelayUrls(): WebSocket["url"][];
    set bothRelayUrls(relays: WebSocket["url"][]);
    get relays(): WebSocket["url"][];
}

type NDKListItem = NDKRelay | NDKUser | NDKEvent;
/**
 * Represents any NIP-33 list kind.
 *
 * This class provides some helper methods to manage the list, particularly
 * a CRUD interface to list items.
 *
 * List items can be encrypted or not. Encrypted items are JSON-encoded and
 * self-signed by the user's key.
 *
 * @example Adding an event to the list.
 * const event1 = new NDKEvent(...);
 * const list = new NDKList();
 * list.addItem(event1);
 *
 * @example Adding an encrypted `p` tag to the list with a "person" mark.
 * const secretFollow = new NDKUser(...);
 * list.addItem(secretFollow, 'person', true);
 *
 * @emits change
 */
declare class NDKList extends NDKEvent {
    _encryptedTags: NDKTag[] | undefined;
    /**
     * Stores the number of bytes the content was before decryption
     * to expire the cache when the content changes.
     */
    private encryptedTagsLength;
    constructor(ndk?: NDK, rawEvent?: NostrEvent);
    /**
     * Wrap a NDKEvent into a NDKList
     */
    static from(ndkEvent: NDKEvent): NDKList;
    /**
     * Returns the title of the list. Falls back on fetching the name tag value.
     */
    get title(): string | undefined;
    /**
     * Sets the title of the list.
     */
    set title(title: string | undefined);
    /**
     * Returns the name of the list.
     * @deprecated Please use "title" instead.
     */
    get name(): string | undefined;
    /**
     * Sets the name of the list.
     * @deprecated Please use "title" instead. This method will use the `title` tag instead.
     */
    set name(name: string | undefined);
    /**
     * Returns the description of the list.
     */
    get description(): string | undefined;
    /**
     * Sets the description of the list.
     */
    set description(name: string | undefined);
    private isEncryptedTagsCacheValid;
    /**
     * Returns the decrypted content of the list.
     */
    encryptedTags(useCache?: boolean): Promise<NDKTag[]>;
    /**
     * This method can be overriden to validate that a tag is valid for this list.
     *
     * (i.e. the NDKPersonList can validate that items are NDKUser instances)
     */
    validateTag(tagValue: string): boolean | string;
    /**
     * Returns the unecrypted items in this list.
     */
    get items(): NDKTag[];
    /**
     * Adds a new item to the list.
     * @param relay Relay to add
     * @param mark Optional mark to add to the item
     * @param encrypted Whether to encrypt the item
     */
    addItem(item: NDKListItem | NDKTag, mark?: string | undefined, encrypted?: boolean): Promise<void>;
    /**
     * Removes an item from the list.
     *
     * @param index The index of the item to remove.
     * @param encrypted Whether to remove from the encrypted list or not.
     */
    removeItem(index: number, encrypted: boolean): Promise<NDKList>;
    /**
     * Creates a filter that will result in fetching
     * the items of this list
     * @example
     * const list = new NDKList(...);
     * const filters = list.filterForItems();
     * const events = await ndk.fetchEvents(filters);
     */
    filterForItems(): NDKFilter[];
}

type classWithConvertFunction<T> = {
    from: (event: NDKEvent) => T;
};
/**
 * Handles NIP-18 reposts.
 */
declare class NDKRepost<T> extends NDKEvent {
    private _repostedEvents;
    constructor(ndk?: NDK, rawEvent?: NostrEvent);
    static from(event: NDKEvent): NDKRepost<unknown>;
    /**
     * Returns all reposted events by the current event.
     *
     * @param klass Optional class to convert the events to.
     * @returns
     */
    repostedEvents(klass?: classWithConvertFunction<T>, opts?: NDKSubscriptionOptions): Promise<T[]>;
    /**
     * Returns the reposted event IDs.
     */
    repostedEventIds(): string[];
}

/**
 * This is a NIP-89 app handler wrapper.
 *
 * @summary NIP-89 App Handler
 * @implements kind:31990
 */
declare class NDKAppHandlerEvent extends NDKEvent {
    private profile;
    constructor(ndk?: NDK, rawEvent?: NostrEvent);
    static from(ndkEvent: NDKEvent): NDKAppHandlerEvent;
    /**
     * Fetches app handler information
     * If no app information is available on the kind:31990,
     * we fetch the event's author's profile and return that instead.
     */
    fetchProfile(): Promise<NDKUserProfile | undefined>;
}

type NDKIntervalFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
declare const possibleIntervalFrequencies: NDKIntervalFrequency[];
type NDKSubscriptionAmount = {
    amount: number;
    currency: string;
    term: NDKIntervalFrequency;
};
declare function calculateTermDurationInSeconds(term: NDKIntervalFrequency): number;
/**
 * Creates a new amount tag
 * @param amount Amount in base unit of the currency (e.g. cents, msats)
 * @param currency Currency code. Use msat for millisatoshis
 * @param term One of daily, weekly, monthly, quarterly, yearly
 * @returns
 */
declare function newAmount(amount: number, currency: string, term: NDKIntervalFrequency): NDKTag;
declare function parseTagToSubscriptionAmount(tag: NDKTag): NDKSubscriptionAmount | undefined;

/**
 * @description
 * Implements NIP-88 (TBD)'s subscription tiers
 *
 * This class will validate that incoming events are valid subscription tiers. Incomplete or invalid
 * amounts will be ignored.
 *
 * @example
 * const tier = new NDKSubscriptionTier;
 * tier.title = "Tier 1";
 * tier.addAmount(100000, "msat", "monthly"); // 100 sats per month
 * tier.addAmount(499, "usd", "monthly"); // $4.99 per month
 * tier.relayUrl = "wss://relay.highlighter.com/";
 * tier.relayUrl = "wss://relay.creator.com/";
 * tier.verifierPubkey = "<pubkey>";
 * tier.addPerk("Access to my private content");
 */
declare class NDKSubscriptionTier extends NDKArticle {
    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent);
    /**
     * Creates a new NDKSubscriptionTier from an event
     * @param event
     * @returns NDKSubscriptionTier
     */
    static from(event: NDKEvent): NDKSubscriptionTier;
    /**
     * Returns perks for this tier
     */
    get perks(): string[];
    /**
     * Adds a perk to this tier
     */
    addPerk(perk: string): void;
    /**
     * Returns the amount for this tier
     */
    get amounts(): NDKSubscriptionAmount[];
    /**
     * Adds an amount to this tier
     * @param amount Amount in the smallest unit of the currency (e.g. cents, msats)
     * @param currency Currency code. Use msat for millisatoshis
     * @param term One of daily, weekly, monthly, quarterly, yearly
     */
    addAmount(amount: number, currency: string, term: NDKIntervalFrequency): void;
    /**
     * Sets a relay where content related to this tier can be found
     * @param relayUrl URL of the relay
     */
    set relayUrl(relayUrl: string);
    /**
     * Returns the relay URLs for this tier
     */
    get relayUrls(): string[];
    /**
     * Gets the verifier pubkey for this tier. This is the pubkey that will generate
     * subscription payment receipts
     */
    get verifierPubkey(): string | undefined;
    /**
     * Sets the verifier pubkey for this tier.
     */
    set verifierPubkey(pubkey: string | undefined);
    /**
     * Checks if this tier is valid
     */
    get isValid(): boolean;
}

/**
 * Represents a subscription start event.
 */
declare class NDKSubscriptionStart extends NDKEvent {
    private debug;
    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent);
    static from(event: NDKEvent): NDKSubscriptionStart;
    /**
     * Recipient of the subscription. I.e. THe author of this event subscribes to this user.
     */
    get targetUser(): NDKUser | undefined;
    /**
     * The amount of the subscription.
     */
    get amount(): NDKSubscriptionAmount | undefined;
    set amount(amount: NDKSubscriptionAmount | undefined);
    /**
     * The event id or NIP-33 tag id of the tier that the user is subscribing to.
     */
    get tierId(): string | undefined;
    set tier(tier: NDKSubscriptionTier | undefined);
    /**
     * Fetches the tier that the user is subscribing to.
     */
    fetchTier(): Promise<NDKSubscriptionTier | undefined>;
    get isValid(): boolean;
}

type ValidPeriod = {
    start: Date;
    end: Date;
};
/**
 * A subscription receipt event.
 */
declare class NDKSubscriptionReceipt extends NDKEvent {
    private debug;
    constructor(ndk: NDK | undefined, rawEvent?: NostrEvent);
    static from(event: NDKEvent): NDKSubscriptionReceipt;
    set subscriptionStart(event: NDKSubscriptionStart);
    get isValid(): boolean;
    get validPeriod(): ValidPeriod | undefined;
    set validPeriod(period: ValidPeriod | undefined);
    get startPeriod(): Date | undefined;
    get endPeriod(): Date | undefined;
    /**
     * Whether the subscription is currently active
     */
    isActive(time?: Date): boolean;
}

/**
 * NIP-90: Data vending machine request
 *
 * A generic Job request class for Data Vending Machines
 *
 * @example
 * const request = new NDKDVMRequest(ndk);
 * request.kind = NDKKind.DVMReqTextExtraction;
 * request.addInput(["https://allenfarrington.medium.com/modeling-bitcoin-value-with-vibes-99eca0997c5f", "url"])
 * await request.publish()
 */
declare class NDKDVMRequest extends NDKEvent {
    constructor(ndk: NDK | undefined, event?: NostrEvent);
    static from(event: NDKEvent): NDKDVMRequest;
    set bid(msatAmount: number | undefined);
    get bid(): number | undefined;
    /**
     * Adds a new input to the job
     * @param args The arguments to the input
     */
    addInput(...args: string[]): void;
    /**
     * Adds a new parameter to the job
     */
    addParam(...args: string[]): void;
    set output(output: string | string[] | undefined);
    get output(): string[] | undefined;
    get params(): string[][];
    getParam(name: string): string | undefined;
    /**
     * Enables job encryption for this event
     * @param dvm DVM that will receive the event
     * @param signer Signer to use for encryption
     */
    encryption(dvm: NDKUser, signer?: NDKSigner): Promise<void>;
    /**
     * Sets the DVM that will receive the event
     */
    set dvm(dvm: NDKUser | undefined);
}

/**
 * NIP-90
 *
 * This class creates DVM transcription job types
 */
declare class NDKTranscriptionDVM extends NDKDVMRequest {
    constructor(ndk: NDK | undefined, event?: NostrEvent);
    static from(event: NDKEvent): NDKTranscriptionDVM;
    /**
     * Returns the original source of the transcription
     */
    get url(): string | undefined;
    /**
     * Getter for the title tag
     */
    get title(): string | undefined;
    /**
     * Setter for the title tag
     */
    set title(value: string | undefined);
    /**
     * Getter for the image tag
     */
    get image(): string | undefined;
    /**
     * Setter for the image tag
     */
    set image(value: string | undefined);
}

/**
 * This event is published by Data Vending Machines when
 * they have finished processing a job.
 */
declare class NDKDVMJobResult extends NDKEvent {
    constructor(ndk?: NDK, event?: NostrEvent);
    static from(event: NDKEvent): NDKDVMJobResult;
    setAmount(msat: number, invoice?: string): void;
    set result(result: string | undefined);
    get result(): string | undefined;
    set status(status: string | undefined);
    get status(): string | undefined;
    get jobRequestId(): string | undefined;
    set jobRequest(event: NDKEvent | undefined);
    get jobRequest(): NDKEvent | undefined;
}

declare enum NDKDvmJobFeedbackStatus {
    Processing = "processing",
    Success = "success",
    Scheduled = "scheduled",
    PayReq = "payment_required"
}
declare class NDKDVMJobFeedback extends NDKEvent {
    constructor(ndk?: NDK, event?: NostrEvent);
    static from(event: NDKEvent): Promise<NDKDVMJobFeedback>;
    get status(): NDKDvmJobFeedbackStatus | string | undefined;
    set status(status: NDKDvmJobFeedbackStatus | string | undefined);
    get encrypted(): boolean;
    dvmDecrypt(): Promise<void>;
}

type NDKDvmParam = [string, string, ...string[]];

declare class NDKSimpleGroup {
    private ndk;
    readonly groupId: string;
    readonly relaySet: NDKRelaySet;
    constructor(ndk: NDK, groupId: string, relaySet: NDKRelaySet);
    /**
     * Adds a user to the group using a kind:9000 event
     * @param user user to add
     * @param opts options
     */
    addUser(user: NDKUser): Promise<NDKEvent>;
    getMemberListEvent(): Promise<NDKEvent | null>;
    /**
     * Gets a list of users that belong to this group
     */
    getMembers(): Promise<NDKUser[]>;
    /**
     * Generates an event that lists the members of a group.
     * @param groupId
     * @returns
     */
    static generateUserListEvent(groupId: string): NDKEvent;
    /**
     * Generates an event that adds a user to a group.
     * @param userPubkey pubkey of the user to add
     * @param groupId group to add the user to
     * @returns
     */
    static generateAddUserEvent(userPubkey: string, groupId: string): NDKEvent;
}

type Nip04QueueItem = {
    type: "encrypt" | "decrypt";
    counterpartyHexpubkey: string;
    value: string;
    resolve: (value: string) => void;
    reject: (reason?: Error) => void;
};
type Nip07RelayMap = {
    [key: string]: {
        read: boolean;
        write: boolean;
    };
};
/**
 * NDKNip07Signer implements the NDKSigner interface for signing Nostr events
 * with a NIP-07 browser extension (e.g., getalby, nos2x).
 */
declare class NDKNip07Signer implements NDKSigner {
    private _userPromise;
    nip04Queue: Nip04QueueItem[];
    private nip04Processing;
    private debug;
    private waitTimeout;
    /**
     * @param waitTimeout - The timeout in milliseconds to wait for the NIP-07 to become available
     */
    constructor(waitTimeout?: number);
    blockUntilReady(): Promise<NDKUser>;
    /**
     * Getter for the user property.
     * @returns The NDKUser instance.
     */
    user(): Promise<NDKUser>;
    /**
     * Signs the given Nostr event.
     * @param event - The Nostr event to be signed.
     * @returns The signature of the signed event.
     * @throws Error if the NIP-07 is not available on the window object.
     */
    sign(event: NostrEvent): Promise<string>;
    relays(): Promise<NDKRelay[]>;
    encrypt(recipient: NDKUser, value: string): Promise<string>;
    decrypt(sender: NDKUser, value: string): Promise<string>;
    private queueNip04;
    private processNip04Queue;
    private waitForExtension;
}
declare global {
    interface Window {
        nostr?: {
            getPublicKey(): Promise<string>;
            signEvent(event: NostrEvent): Promise<{
                sig: string;
            }>;
            getRelays?: () => Promise<Nip07RelayMap>;
            nip04?: {
                encrypt(recipientHexPubKey: string, value: string): Promise<string>;
                decrypt(senderHexPubKey: string, value: string): Promise<string>;
            };
        };
    }
}

interface NDKRpcRequest {
    id: string;
    pubkey: string;
    method: string;
    params: string[];
    event: NDKEvent;
}
interface NDKRpcResponse {
    id: string;
    result: string;
    error?: string;
    event: NDKEvent;
}
declare class NDKNostrRpc extends EventEmitter {
    private ndk;
    private signer;
    private debug;
    constructor(ndk: NDK, signer: NDKSigner, debug: debug.Debugger);
    /**
     * Subscribe to a filter. This function will resolve once the subscription is ready.
     */
    subscribe(filter: NDKFilter): Promise<NDKSubscription>;
    parseEvent(event: NDKEvent): Promise<NDKRpcRequest | NDKRpcResponse>;
    sendResponse(id: string, remotePubkey: string, result: string, kind?: NDKKind, error?: string): Promise<void>;
    /**
     * Sends a request.
     * @param remotePubkey
     * @param method
     * @param params
     * @param kind
     * @param id
     */
    sendRequest(remotePubkey: string, method: string, params?: string[], kind?: number, cb?: (res: NDKRpcResponse) => void): Promise<NDKRpcResponse>;
}

type NIP46Method = "connect" | "sign_event" | "encrypt" | "decrypt" | "get_public_key" | "ping";
type Nip46PermitCallbackParams = {
    /**
     * ID of the request
     */
    id: string;
    pubkey: string;
    method: NIP46Method;
    params?: any;
};
type Nip46PermitCallback = (params: Nip46PermitCallbackParams) => Promise<boolean>;
type Nip46ApplyTokenCallback = (pubkey: string, token: string) => Promise<void>;
interface IEventHandlingStrategy {
    handle(backend: NDKNip46Backend, id: string, remotePubkey: string, params: string[]): Promise<string | undefined>;
}
/**
 * This class implements a NIP-46 backend, meaning that it will hold a private key
 * of the npub that wants to be published as.
 *
 * This backend is meant to be used by an NDKNip46Signer, which is the class that
 * should run client-side, where the user wants to sign events from.
 */
declare class NDKNip46Backend {
    readonly ndk: NDK;
    readonly signer: NDKSigner;
    localUser?: NDKUser;
    readonly debug: debug.Debugger;
    rpc: NDKNostrRpc;
    private permitCallback;
    /**
     * @param ndk The NDK instance to use
     * @param signer The signer for the private key that wants to be published as
     * @param permitCallback Callback executed when permission is requested
     */
    constructor(ndk: NDK, signer: NDKSigner, permitCallback: Nip46PermitCallback);
    /**
     * @param ndk The NDK instance to use
     * @param privateKey The private key of the npub that wants to be published as
     * @param permitCallback Callback executed when permission is requested
     */
    constructor(ndk: NDK, privateKey: string, permitCallback: Nip46PermitCallback);
    /**
     * This method starts the backend, which will start listening for incoming
     * requests.
     */
    start(): Promise<void>;
    handlers: {
        [method: string]: IEventHandlingStrategy;
    };
    /**
     * Enables the user to set a custom strategy for handling incoming events.
     * @param method - The method to set the strategy for
     * @param strategy - The strategy to set
     */
    setStrategy(method: string, strategy: IEventHandlingStrategy): void;
    /**
     * Overload this method to apply tokens, which can
     * wrap permission sets to be applied to a pubkey.
     * @param pubkey public key to apply token to
     * @param token token to apply
     */
    applyToken(pubkey: string, token: string): Promise<void>;
    protected handleIncomingEvent(event: NDKEvent): Promise<void>;
    /**
     * This method should be overriden by the user to allow or reject incoming
     * connections.
     */
    pubkeyAllowed(params: Nip46PermitCallbackParams): Promise<boolean>;
}

/**
 * This NDKSigner implements NIP-46, which allows remote signing of events.
 * This class is meant to be used client-side, paired with the NDKNip46Backend or a NIP-46 backend (like Nostr-Connect)
 *
 * @emits authUrl -- Emitted when the user should take an action in certain URL.
 *                   When a client receives this event, it should direct the user
 *                   to go to that URL to authorize the application.
 *
 * @example
 * const ndk = new NDK()
 * const nip05 = await prompt("enter your nip-05") // Get a NIP-05 the user wants to login with
 * const privateKey = localStorage.getItem("nip46-local-key") // If we have a private key previously saved, use it
 * const signer = new NDKNip46Signer(ndk, nip05, privateKey) // Create a signer with (or without) a private key
 *
 * // Save generated private key for future use
 * localStorage.setItem("nip46-local-key", signer.localSigner.privateKey)
 *
 * // If the backend sends an auth_url event, open that URL as a popup so the user can authorize the app
 * signer.on("authUrl", (url) => { window.open(url, "auth", "width=600,height=600") })
 *
 * // wait until the signer is ready
 * const loggedinUser = await signer.blockUntilReady()
 *
 * alert("You are now logged in as " + loggedinUser.npub)
 */
declare class NDKNip46Signer extends EventEmitter implements NDKSigner {
    private ndk;
    remoteUser: NDKUser;
    remotePubkey: string | undefined;
    token: string | undefined;
    localSigner: NDKSigner;
    private nip05?;
    rpc: NDKNostrRpc;
    private debug;
    relayUrls: string[];
    /**
     * @param ndk - The NDK instance to use
     * @param token - connection token, in the form "npub#otp"
     * @param localSigner - The signer that will be used to request events to be signed
     */
    constructor(ndk: NDK, token: string, localSigner?: NDKSigner);
    /**
     * @param ndk - The NDK instance to use
     * @param remoteNpub - The npub that wants to be published as
     * @param localSigner - The signer that will be used to request events to be signed
     */
    constructor(ndk: NDK, remoteNpub: string, localSigner?: NDKSigner);
    /**
     * @param ndk - The NDK instance to use
     * @param remoteNip05 - The nip05 that wants to be published as
     * @param localSigner - The signer that will be used to request events to be signed
     */
    constructor(ndk: NDK, remoteNip05: string, localSigner?: NDKSigner);
    /**
     * @param ndk - The NDK instance to use
     * @param remotePubkey - The public key of the npub that wants to be published as
     * @param localSigner - The signer that will be used to request events to be signed
     */
    constructor(ndk: NDK, remotePubkey: string, localSigner?: NDKSigner);
    /**
     * Get the user that is being published as
     */
    user(): Promise<NDKUser>;
    blockUntilReady(): Promise<NDKUser>;
    encrypt(recipient: NDKUser, value: string): Promise<string>;
    decrypt(sender: NDKUser, value: string): Promise<string>;
    sign(event: NostrEvent): Promise<string>;
    /**
     * Allows creating a new account on the remote server.
     * @param username Desired username for the NIP-05
     * @param domain Desired domain for the NIP-05
     * @param email Email address to associate with this account -- Remote servers may use this for recovery
     * @returns The public key of the newly created account
     */
    createAccount(username?: string, domain?: string, email?: string): Promise<Hexpubkey>;
}

declare class NDKPrivateKeySigner implements NDKSigner {
    private _user;
    privateKey?: string;
    constructor(privateKey?: string);
    static generate(): NDKPrivateKeySigner;
    blockUntilReady(): Promise<NDKUser>;
    user(): Promise<NDKUser>;
    sign(event: NostrEvent): Promise<string>;
    encrypt(recipient: NDKUser, value: string): Promise<string>;
    decrypt(sender: NDKUser, value: string): Promise<string>;
}

type NDKFilterGroupingId = string;
/**
 * Calculates the groupable ID for this filters.
 * The groupable ID is a deterministic association of the filters
 * used in a filters. When the combination of filters makes it
 * possible to group them, the groupable ID is used to group them.
 *
 * The different filters in the array are differentiated so that
 * filters can only be grouped with other filters that have the same signature
 *
 * @returns The groupable ID, or null if the filters are not groupable.
 */
declare function calculateGroupableId(filters: NDKFilter[]): NDKFilterGroupingId | null;
/**
 * Go through all the passed filters, which should be
 * relatively similar, and merge them.
 */
declare function mergeFilters(filters: NDKFilter[]): NDKFilter;

/**
 * Schedule a post for publishing at a later time using * a NIP-90 DVM.
 *
 * @param dvm {NDKUser} The DVM to use for scheduling.
 * @param relays {string[]} The relays the schedule event should be published to by the DVM. Defaults to all relays in the pool.
 * @param encrypted {boolean} Whether to encrypt the event. Defaults to true.
 * @param waitForConfirmationForMs {number} How long to wait for the DVM to confirm the schedule event. If none is provided, the event will be scheduled but not confirmed.
 *
 * @example
 * const event = new NDKEvent(ndk, { kind: 1, content: "hello world" });
 * event.created_at = Date.now()/1000 + 60 // schedule for 60 seconds from now
 * await event.sign();
 *
 * const dvm = ndk.getUser({ pubkey: "<a-kind-5905-dvm-pubkey>" });
 *
 * const result = await dvmSchedule(event, dvm);
 * console.log(result.status); // "success"
 */
declare function dvmSchedule(event: NDKEvent, dvm: NDKUser, relays?: string[], encrypted?: boolean, waitForConfirmationForMs?: number): Promise<string | void | NDKEvent>;

interface NDKZapInvoice {
    id?: NDKEventId;
    /**
     * The pubkey of the zapper app
     */
    zapper: string;
    /**
     * The pubkey of the user sending the zap
     */
    zappee: string;
    /**
     * The pubkey of the user receiving the zap
     */
    zapped: string;
    /**
     * The event that was zapped
     */
    zappedEvent?: string;
    /**
     * The amount zapped in millisatoshis
     */
    amount: number;
    /**
     * A comment attached to the zap
     */
    comment?: string;
}
/**
 * Parses a zap invoice from a kind 9735 event
 *
 * @param event The event to parse
 *
 * @returns NDKZapInvoice | null
 */
declare function zapInvoiceFromEvent(event: NDKEvent): NDKZapInvoice | null;

interface ZapConstructorParams {
    ndk: NDK;
    zappedEvent?: NDKEvent;
    zappedUser?: NDKUser;
}
declare class Zap extends EventEmitter {
    ndk: NDK;
    zappedEvent?: NDKEvent;
    zappedUser: NDKUser;
    constructor(args: ZapConstructorParams);
    getZapEndpoint(): Promise<string | undefined>;
    /**
     * Generates a kind:9734 zap request and returns the payment request
     * @param amount amount to zap in millisatoshis
     * @param comment optional comment to include in the zap request
     * @param extraTags optional extra tags to include in the zap request
     * @param relays optional relays to ask zapper to publish the zap to
     * @returns the payment request
     */
    createZapRequest(amount: number, // amount to zap in millisatoshis
    comment?: string, extraTags?: NDKTag[], relays?: string[], signer?: NDKSigner): Promise<string | null>;
    getInvoice(event: NDKEvent, amount: number, zapEndpoint: string): Promise<string | null>;
    generateZapRequest(amount: number, // amount to zap in millisatoshis
    comment?: string, extraTags?: NDKTag[], relays?: string[], signer?: NDKSigner): Promise<{
        event: NDKEvent;
        zapEndpoint: string;
    } | null>;
    /**
     * @returns the relays to use for the zap request
     */
    private relays;
}

export { type EventPointer, type Hexpubkey, type IEventHandlingStrategy, NDKAppHandlerEvent, NDKArticle, type NDKAuthPolicy, type NDKCacheAdapter, type NDKConstructorParams, NDKDVMJobFeedback, NDKDVMJobResult, NDKDVMRequest, NDKDvmJobFeedbackStatus, type NDKDvmParam, NDKEvent, type NDKEventId, type NDKFilter, type NDKFilterGroupingId, NDKHighlight, type NDKIntervalFrequency, NDKKind, NDKList, type NDKListItem, NDKListKinds, NDKNip07Signer, NDKNip46Backend, NDKNip46Signer, NDKNostrRpc, NDKPrivateKeySigner, NDKRelay, NDKRelayAuthPolicies, type NDKRelayConnectionStats, NDKRelayList, NDKRelaySet, NDKRelayStatus, type NDKRelayUrl, NDKRepost, type NDKRpcRequest, type NDKRpcResponse, type NDKSigner, NDKSimpleGroup, NDKSubscription, type NDKSubscriptionAmount, NDKSubscriptionCacheUsage, type NDKSubscriptionOptions, NDKSubscriptionReceipt, NDKSubscriptionStart, NDKSubscriptionTier, type NDKTag, NDKTranscriptionDVM, NDKUser, type NDKUserParams, type NDKUserProfile, NDKVideo, Zap as NDKZap, type NDKZapInvoice, type NIP46Method, type Nip46ApplyTokenCallback, type Nip46PermitCallback, type Nip46PermitCallbackParams, type NostrEvent, type Npub, type ProfilePointer, PublishError, calculateGroupableId, calculateTermDurationInSeconds, NDK as default, defaultOpts, dvmSchedule, mergeFilters, newAmount, parseTagToSubscriptionAmount, pinEvent, possibleIntervalFrequencies, profileFromEvent, serializeProfile, zapInvoiceFromEvent };
