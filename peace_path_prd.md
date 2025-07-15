# Product Requirements Document (PRD)

## 1. Overview

**Working Title:** PeacePath\
**Purpose:** Empower users to preserve their mental wellbeing by discreetly avoiding people who negatively impact their energy. The mobile app leverages contact matching, swipe-based relationship classification, real‑time location awareness, and privacy‑first notifications to warn users when a blocked contact is nearby and suggest alternate routes.

---

## 2. Goals & Success Metrics

| Goal                           | Metric                                                               | Target                          |
| ------------------------------ | -------------------------------------------------------------------- | ------------------------------- |
| Rapid, frictionless onboarding | % of new installs completing phone auth                              | ≥ 90 % within 3 minutes         |
| Accurate contact matching      | Precision & recall of phone matches                                  | ≥ 98 % precision, ≥ 95 % recall |
| High engagement with swipe UI  | Avg. # contacts classified per user first week                       | ≥ 20                            |
| Effective detour alerts        | % of alerts opened & acted upon (navigation opened or route changed) | ≥ 40 %                          |
| Retention                      | D30 retained users                                                   | ≥ 25 %                          |
| Privacy trust                  | Support tickets or complaints re: privacy                            | < 0.5 % of MAU                  |

---

## 3. Non‑Goals

- Full‑fledged social network features (chat, profile browsing).
- Showing real‑time maps of other users’ positions.
- Cross‑platform desktop or web client in MVP.

---

## 4. Personas

1. **The Peace Seeker (25‑40, urban):** Has a busy schedule, values mental space, wants subtle cues to avoid stressful encounters.
2. **The Empath (18‑30, student):** Sensitive to interpersonal energy, uses tech for emotional self‑care.
3. **The Safety‑Oriented Parent (35‑55):** Wants to keep distance from an ex‑partner or toxic acquaintance while commuting with kids.

---

## 5. User Stories

- _As a new user, I want to sign up with just my phone number so I can start quickly without remembering passwords._
- _As a user, I want the app to scan my contacts and tell me who else is on PeacePath so I know who I can classify._
- _As a user, I want to swipe left to "block" and right to "neutral" so classification feels fast and familiar._
- _As a user, I want the app to alert me when a blocked contact is within \~150 m so I can take a detour._
- _As a user, I want to pause all location tracking at any time so I stay in control of my privacy._
- _As a user, I want to review and edit my previous decisions so I can unblock someone if situations change._

---

## 6. Detailed Feature Requirements

### 6.1 Authentication & Account Creation

| Requirement                                                         | Priority | Notes                                         |
| ------------------------------------------------------------------- | -------- | --------------------------------------------- |
| Phone OTP login via Firebase Auth                                   | High     | Expo reCAPTCHA verifier; retry & resend flows |
| Store `uid`, `phoneNumber`, `createdAt`, `pushToken` on first login | High     | Firestore path `users/{uid}/profile`          |
| Allow logout & account deletion (GDPR)                              | High     | Deletion triggers cleanup CF                  |

### 6.2 Contact Sync & Matching

| Requirement                                                                     | Priority | Notes                                                        |
| ------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| Request `Contacts` permission (iOS/Android) with primer screen                  | High     | Explain privacy; optional but recommended                    |
| Normalize numbers to E.164 with **libphonenumber‑js**                           | High     | Cache locally                                                |
| Securely query Firestore for registered numbers; return at most 500 per batch   | High     | Use callable Cloud Function to avoid client‑side enumeration |
| Persist only matching `knownUserUid` locally or under `users/{uid}/knownUsers/` | High     | No raw phone numbers stored after match                      |

### 6.3 Swipe UI (Relationship Classification)

| Requirement                                                                            | Priority | Notes                                         |
| -------------------------------------------------------------------------------------- | -------- | --------------------------------------------- |
| Card stack built with _react‑native‑deck‑swiper_                                       | High     | Haptic feedback on swipe                      |
| Card shows contact’s display name & initials/avatar if available                       | Medium   | No photo if not in contacts                   |
| Persist decision to `users/{uid}/relationships/{targetUid}` with `status`, `updatedAt` | High     | `status ∈ { blocked, neutral, reconsidered }` |
| Undo last swipe (snackbar)                                                             | Medium   |                                               |

### 6.4 Location Tracking & Proximity Alerts

| Requirement                                                                                   | Priority | Notes                       |
| --------------------------------------------------------------------------------------------- | -------- | --------------------------- |
| Background tracking via `expo‑location` every 5 min (configurable)                            | High     | Only while "Active" mode on |
| Write `{ lat, lng, geohash, timestamp }` to `users/{uid}/location`                            | High     | TTL 24 h auto‑purge via CF  |
| Query nearby users with **GeoFireX** (`< 300 m`)                                              | Medium   | Run client‑side each update |
| If nearby user’s `status = blocked`, trigger local push: "⚠️ Someone who drains your energy…" | High     | Include "Show detour" CTA   |
| Optionally offload proximity check to Cloud Function on `location` write                      | Low      | Evaluate cost/perf          |

### 6.5 Push Notifications

| Requirement                                                        | Priority | Notes |
| ------------------------------------------------------------------ | -------- | ----- |
| Obtain Expo push token; save to profile                            | High     |       |
| Local notification handling for in‑app foreground alerts           | Medium   |       |
| Remote notification via Firebase Function for server‑side geofence | Low      |       |

### 6.6 Relationship Management UI

| Requirement                                            | Priority | Notes                      |
| ------------------------------------------------------ | -------- | -------------------------- |
| List with tabs: Blocked, Neutral, Reconsider           | Medium   |                            |
| Ability to change status or delete relation            | High     |                            |
| 30‑day soft prompt: "Still feel like avoiding \_\_\_?" | Low      | Triggered via scheduled CF |

### 6.7 Settings & Privacy Controls

- **Location toggle** (Off / On / On‑While‑Active‑App).
- **Export data** (JSON via email link).
- **Delete account** (with 7‑day grace, GDPR style).
- **Privacy policy & open‑source licenses.**

---

## 7. Technical Architecture

```
React Native (Expo) ↔️ Firebase Auth
                    ↕️ Firestore
         Push (Expo) ↕️ Cloud Functions (optional)
```

- **State management:** Zustand or Redux‑toolkit.
- **Offline cache:** Firestore local persistence + MMKV for contacts cache.
- **Security Rules:**
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{requestingUid}/{doc=**} {
        allow read, write: if request.auth.uid == requestingUid;
      }
      // Callable CF used for cross‑user lookups
    }
  }
  ```
- **CI/CD:** EAS Build & Submit to TestFlight / Play Internal.

---

## 8. Data Model

```
users/{uid}/profile {
  phoneNumber: string,
  name: string?,
  pushToken: string?,
  createdAt: timestamp,
  preferences: {
    tracking: boolean,
    trackingInterval: number  // minutes
  }
}
users/{uid}/relationships/{targetUid} {
  status: string,  // blocked | neutral | reconsidered
  updatedAt: timestamp
}
users/{uid}/knownUsers/{knownUserUid} {
  addedAt: timestamp
}
users/{uid}/location {
  lat: number,
  lng: number,
  geohash: string,
  timestamp: timestamp
}
```

---

## 9. Analytics & Observability

- **Events:** `auth_complete`, `contacts_permission`, `swipe_decision`, `location_update`, `alert_shown`, `alert_action`, `settings_toggle`.
- **Crash reporting:** Sentry.
- **Performance traces:** Cold start, contact sync latency, geofence query time.

---

## 10. Milestones & Timeline

| Phase                       | Duration  | Deliverables                                            |
| --------------------------- | --------- | ------------------------------------------------------- |
| 0. Setup                    | Week 1    | Firebase project, repo, CI, base Expo app               |
| 1. Auth & Contacts          | Weeks 2‑3 | Phone login, contacts sync & matching                   |
| 2. Swipe UI                 | Week 4    | Card stack, decision storage                            |
| 3. Location & Alerts        | Weeks 5‑6 | Background location, geofence logic, push notifications |
| 4. Management UI + Settings | Week 7    | Lists, toggles, export/delete                           |
| 5. Beta & Hardening         | Weeks 8‑9 | UX polish, security review, analytics, crash fixes      |
| 6. Public Launch            | Week 10   | App Store & Play release                                |

---

## 11. Risks & Mitigations

| Risk                               | Likelihood | Impact | Mitigation                                                               |
| ---------------------------------- | ---------- | ------ | ------------------------------------------------------------------------ |
| Background location drains battery | Med        | High   | Configurable interval, adaptive throttling                               |
| False positives in contact match   | Low        | High   | Strict E.164 normalization, hashed lookup fallback                       |
| Privacy backlash                   | Med        | High   | Transparent policy, opt‑in tracking, on‑device processing where possible |
| App Store privacy rejection        | Low        | Medium | Pre‑review with Apple guidelines █§5.1.1                                 |

---

## 12. Open Questions

1. Should proximity processing move to server for more accuracy vs. client for privacy?
2. Minimum viable navigation integration (open Google/Apple Maps vs. embedded)?
3. Secondary classification statuses (e.g., _friend_, _family_) for future positive features?

---

## 13. References

- Firebase Phone Auth: [https://firebase.google.com/docs/auth/web/phone-auth](https://firebase.google.com/docs/auth/web/phone-auth)
- Expo Contacts: [https://docs.expo.dev/versions/latest/sdk/contacts/](https://docs.expo.dev/versions/latest/sdk/contacts/)
- GeoFireX: [https://github.com/codediodeio/geofirex](https://github.com/codediodeio/geofirex)
- Expo Location: [https://docs.expo.dev/versions/latest/sdk/location/](https://docs.expo.dev/versions/latest/sdk/location/)
- Expo Push Notifications: [https://docs.expo.dev/push-notifications/overview/](https://docs.expo.dev/push-notifications/overview/)
- libphonenumber‑js: [https://github.com/catamphetamine/libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js)

---

_End of PRD_
