# CineWave Movie Ticket Booking

A complete, dependency-free demo of the Movie Ticket Booking Management lifecycle described in the provided brief.

## Included workflow

- Movie/show request with input validation
- Availability check and calculated ticket cost
- Customer review, confirm, or cancel step
- Automatic seat and ticket ID generation on confirmation
- Email-notification simulation, case tracking, queues, and SLA details
- Staff dashboard with PremiumShowQueue and StandardShowQueue routing
- Browser-local storage so demo bookings persist across refreshes

## Run locally

```bash
/Users/prashantkrchaudhary/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node server.js
```

Then open `http://localhost:4173`.

This static app can be published directly with GitHub Pages, Netlify, Vercel, or any static host.
