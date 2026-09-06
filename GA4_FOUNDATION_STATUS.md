# GA4 Foundation Status

## Architecture

The FundedWealth SPA loads the GTM container `GTM-NC2QNN5P` and one explicit GA4 Google tag for measurement ID `G-2JC3K2H68Y`.

GA4 automatic page views are disabled. The React router emits one controlled `page_view` event for the initial location and each Wouter location change, including browser history navigation.

## Verification

- Local frontend typecheck: passed
- Local production build: passed
- Local initial page view: one GA4 collect request
- Local SPA `/` to `/blog`: one additional page view
- Local dataLayer: one GA4 config call with `send_page_view: false`, followed by controlled page-view events

## External blockers

- The current production deployment still serves an older frontend bundle until an authorized deployment is performed.
- GTM/GA4 account verification requires an authenticated Google session; no credentials are stored in the repository.
- GA4 Realtime/DebugView cannot be confirmed from the local browser alone.
