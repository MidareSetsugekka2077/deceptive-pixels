# Deceptive Pixels

A challenge-based game where players try to find images that exploit each model's weaknesses. Players select "adversarial" examples and learn about weaknesses in CNNs.

### Version 1
- Game title: Deceptive Pixels
- Implemented the UI from the Figma Prototype
- Added first attack: Pixel attack using MNIST dataset
- Added scoring system to keep track of how many images users selected correctly
- Added feedback after each round to reinforce the idea that CNNs are not perfect.
- Players should choose 3 correct images that can fool the CNN model from the 6 given.

### Version 2
- Updated attacks to showcase 3 different attacks: Pixel Attack, Rotate Attack, Shift Attack
- Adjusted Pixel attack diffculty to be harder.
- Added explanations for why each attack can fool the CNNs.
- Added tutorial option so users can understand the background and context better.
- Trained new sets of images for the 2 new attacks added.

### Version 3
- UI Overhaul: Added title screen, challenge selection below title screen
- Added 3 more attacks: Random Noise Attack, Blur Attack, Adversarial Patches
- Added ImageNet images for all 6 attacks alongside MNIST
- Scoring system overhaul: Players can get a maximum of 30 points for each attack from each dataset.
- Added badge to show which attack players are currently on.
- Fixed tutorial disappearing after first visit bug.
- Made game title clickable for easier navigation.

### Version 4
- Added 3 more attacks: Mirror Attack, Emoji Attack, Line Attack
- Gallery Feature added
- More info on each adversarial attack added in title screen with a "?" button
- Added different hints for each challenge
- Badge system added to allow players to keep track of how many unique images they have found in each challenge
- Help Feature added
- The game now logs key user-study events for analysis.

## Analytics Logging for User Evaluation

### Metrics covered

- Learning support behavior:
	- `tutorial_opened`, `tutorial_completed`, `tutorial_skipped`
	- `challenge_details_opened` (the `?` learn-more button on challenge cards)
	- `help_button_clicked`, `help_topic_selected`, `help_learn_more_clicked`
- Challenge performance:
	- `challenge_started`
	- `challenge_attempt_submitted` (includes attempt number, correctness, points, elapsed time)
	- `challenge_completed` (first time a challenge reaches 30/30, includes time to completion)
- Interaction behavior:
	- `hint_opened`
	- help page navigation events
- Engagement:
	- `session_started`, `session_ended` (includes session duration)
	- `screen_view`, `gallery_viewed` (includes total gallery progress, e.g. `?/60` per dataset pair)

All events include:

- anonymous `participantId`
- `sessionId`
- ISO timestamp
- route path

### Local storage fallback

Events are always cached in browser localStorage (`analytics:eventLog`) so no data is lost if network submission fails.

### Cloudflare collection setup

1. Create a D1 database and bind it to your Pages project as `ANALYTICS_DB`.
2. Apply schema from `cloudflare/d1/schema.sql`.
3. Deploy Pages Functions (endpoint is `POST /api/analytics`, implemented in `functions/api/analytics.ts`).
4. In your frontend environment, set:

```bash
VITE_ANALYTICS_ENDPOINT=https://<your-pages-domain>/api/analytics
```

### Example analysis queries (D1 / SQLite)

```sql
-- Average session length (minutes)
SELECT AVG(CAST(json_extract(payload_json, '$.durationMs') AS REAL)) / 60000.0 AS avg_minutes
FROM analytics_events
WHERE event_name = 'session_ended';

-- Attempts per challenge (mean)
SELECT
	CAST(json_extract(payload_json, '$.challengeId') AS INTEGER) AS challenge_id,
	AVG(CAST(json_extract(payload_json, '$.attemptNumber') AS REAL)) AS avg_attempt
FROM analytics_events
WHERE event_name = 'challenge_attempt_submitted'
GROUP BY challenge_id
ORDER BY challenge_id;

-- Time to complete each challenge at 30/30
SELECT
	CAST(json_extract(payload_json, '$.challengeId') AS INTEGER) AS challenge_id,
	AVG(CAST(json_extract(payload_json, '$.timeToCompleteMs') AS REAL)) / 1000.0 AS avg_seconds
FROM analytics_events
WHERE event_name = 'challenge_completed'
GROUP BY challenge_id
ORDER BY challenge_id;
```

### Pre/Post learning test recommendation

Pre/post understanding tests are usually best done via a separate survey form (e.g. Qualtrics/Google Forms) using the same anonymous `participantId`. You can read the id from localStorage key `analytics:participantId` and include it in survey links to merge survey and in-app behavioral data later.
