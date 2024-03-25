# Green-Workplace
Integrated Web and Mobile application to monitor and record commuting carbon footprint via transport mode detection.

# Installation
## Frontend
- `cd client`
- `npm start`

## Backend
- make sure to add the Supabase URI string to .env in server folder
- `cd server`
- `npm run dev`

## Mobile Frontend
- `cd mobile_client`
- `npx expo start`

### Mobile Publish Update (for developers)
- `expo login`
- `eas update --channel production`


# Testing

## Backend testing
- `npm test`
- for code coverage: `npm test -- --coverage`

## Code Quality Testing via SonarQube (Locally)
- Go to the directory where sonarqube is installed C:\...\sonarqube-10.3.0.82913\sonarqube-10.3.0.82913\bin\windows-x86-64 
- run `StartSonar.bat`
- in sonarqube via localhost:9000, create a new project and store the token provided
- in the main directory of code type:
- `sonar-scanner.bat -D"sonar.projectKey=Green-Workplace-Full" -D"sonar.sources=." -D"sonar.host.url=http://localhost:9000" -D"sonar.token={Enter your token}"`

