# Green-Workplace
Web and Mobile app to support companies in managing agile teams’ hybrid working patterns and commuting carbon footprint

# Installation
## Frontend
- `cd client`
- `npm start`

## Backend
- make sure to add the Supabase URI string to .env in server folder
- `cd server`
- `npm run dev`

### Backend testing
- `npm test`
- for code coverage: `npm test -- --coverage`

## Mobile Frontend
- `cd mobile_client`
- `npx expo start`

### Mobile Publish Update (for developers)
- `expo login`
- `eas update --channel production`
