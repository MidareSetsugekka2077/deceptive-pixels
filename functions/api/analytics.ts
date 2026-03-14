interface AnalyticsEvent {
  eventId: string;
  name: string;
  ts: string;
  participantId: string;
  sessionId: string;
  path: string;
  payload: unknown;
}

interface Env {
  ANALYTICS_DB: D1Database;
}

interface RequestBody {
  events?: AnalyticsEvent[];
}

const isValidEvent = (event: AnalyticsEvent) =>
  Boolean(
    event
    && typeof event.eventId === 'string'
    && typeof event.name === 'string'
    && typeof event.ts === 'string'
    && typeof event.participantId === 'string'
    && typeof event.sessionId === 'string'
    && typeof event.path === 'string',
  );

const insertEvent = async (db: D1Database, event: AnalyticsEvent) => {
  const payloadJson = JSON.stringify(event.payload ?? {});

  await db
    .prepare(
      `INSERT OR IGNORE INTO analytics_events (
        event_id,
        event_name,
        event_ts,
        participant_id,
        session_id,
        path,
        payload_json,
        received_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    )
    .bind(
      event.eventId,
      event.name,
      event.ts,
      event.participantId,
      event.sessionId,
      event.path,
      payloadJson,
    )
    .run();
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let body: RequestBody;

  try {
    body = (await context.request.json()) as RequestBody;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const events = Array.isArray(body.events) ? body.events : [];
  if (events.length === 0) {
    return new Response(JSON.stringify({ error: 'No events provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const validEvents = events
    .filter((event): event is AnalyticsEvent => isValidEvent(event as AnalyticsEvent))
    .slice(0, 200);

  if (validEvents.length === 0) {
    return new Response(JSON.stringify({ error: 'No valid events found' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await Promise.all(validEvents.map((event) => insertEvent(context.env.ANALYTICS_DB, event)));

  return new Response(JSON.stringify({ stored: validEvents.length }), {
    status: 202,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
