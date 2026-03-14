import {
  getDatasetFoundAttackedImageCount,
  getDatasetTotalTrackableAttackedImages,
} from '../legacy/challengeScore';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface AnalyticsEvent {
  eventId: string;
  name: string;
  ts: string;
  participantId: string;
  sessionId: string;
  path: string;
  payload: { [key: string]: JsonValue };
}

const PARTICIPANT_STORAGE_KEY = 'analytics:participantId';
const EVENT_STORAGE_KEY = 'analytics:eventLog';
const SESSION_START_KEY = 'analytics:sessionStartMs';
const MAX_STORED_EVENTS = 5000;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

let sessionId = '';
let sessionEnded = false;

const getAnalyticsEndpoint = () => {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  return typeof endpoint === 'string' && endpoint.length > 0 ? endpoint : null;
};

const createRandomId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const getParticipantId = () => {
  if (typeof window === 'undefined') {
    return 'server';
  }

  const existing = localStorage.getItem(PARTICIPANT_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const created = createRandomId();
  localStorage.setItem(PARTICIPANT_STORAGE_KEY, created);
  return created;
};

const getCurrentPath = () => {
  if (typeof window === 'undefined') {
    return '/';
  }

  return `${window.location.pathname}${window.location.search}`;
};

const getStoredEvents = () => {
  if (typeof window === 'undefined') {
    return [] as AnalyticsEvent[];
  }

  const stored = localStorage.getItem(EVENT_STORAGE_KEY);
  if (!stored) {
    return [] as AnalyticsEvent[];
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [] as AnalyticsEvent[];
    }

    return parsed as AnalyticsEvent[];
  } catch {
    return [] as AnalyticsEvent[];
  }
};

const saveStoredEvents = (events: AnalyticsEvent[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  const trimmed = events.slice(-MAX_STORED_EVENTS);
  localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(trimmed));
};

const sendEvent = (event: AnalyticsEvent) => {
  const endpoint = getAnalyticsEndpoint();
  if (!endpoint || typeof navigator === 'undefined') {
    return;
  }

  const body = JSON.stringify({ events: [event] });

  if (typeof navigator.sendBeacon === 'function') {
    const sent = navigator.sendBeacon(
      endpoint,
      new Blob([body], { type: 'application/json' }),
    );

    if (sent) {
      return;
    }
  }

  void fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Keep local event log as fallback when network submission fails.
  });
};

export const trackAnalyticsEvent = (
  name: string,
  payload: { [key: string]: JsonValue } = {},
) => {
  if (typeof window === 'undefined') {
    return;
  }

  const event: AnalyticsEvent = {
    eventId: createRandomId(),
    name,
    ts: new Date().toISOString(),
    participantId: getParticipantId(),
    sessionId,
    path: getCurrentPath(),
    payload,
  };

  const existing = getStoredEvents();
  existing.push(event);
  saveStoredEvents(existing);
  sendEvent(event);
};

const startSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  sessionId = createRandomId();
  sessionEnded = false;
  localStorage.setItem(SESSION_START_KEY, String(Date.now()));

  trackAnalyticsEvent('session_started', {
    userAgent: navigator.userAgent,
    language: navigator.language,
  });
};

const endSession = (reason: 'pagehide' | 'visibility_timeout') => {
  if (typeof window === 'undefined') {
    return;
  }

  if (sessionEnded) {
    return;
  }

  sessionEnded = true;

  const startMsRaw = localStorage.getItem(SESSION_START_KEY);
  const startMs = startMsRaw ? Number.parseInt(startMsRaw, 10) : Date.now();
  const durationMs = Number.isNaN(startMs) ? 0 : Math.max(Date.now() - startMs, 0);

  const mnistUnlocked = getDatasetFoundAttackedImageCount('mnist');
  const imagenetUnlocked = getDatasetFoundAttackedImageCount('imagenet');
  const mnistTotal = getDatasetTotalTrackableAttackedImages('mnist');
  const imagenetTotal = getDatasetTotalTrackableAttackedImages('imagenet');

  trackAnalyticsEvent('session_ended', {
    reason,
    durationMs,
    totalGalleryUnlocked: mnistUnlocked + imagenetUnlocked,
    totalGalleryTrackable: mnistTotal + imagenetTotal,
  });
};

let initialized = false;

export const initAnalytics = () => {
  if (typeof window === 'undefined' || initialized) {
    return;
  }

  initialized = true;

  startSession();

  const onPageHide = () => {
    endSession('pagehide');
  };

  const onVisibilityChange = () => {
    if (document.visibilityState !== 'hidden') {
      return;
    }

    window.setTimeout(() => {
      if (document.visibilityState === 'hidden') {
        endSession('visibility_timeout');
      }
    }, SESSION_TIMEOUT_MS);
  };

  window.addEventListener('pagehide', onPageHide);
  document.addEventListener('visibilitychange', onVisibilityChange);
};

export const getStoredAnalyticsEvents = () => getStoredEvents();
