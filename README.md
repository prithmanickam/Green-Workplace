# Green-Workplace
Integrated Web and Mobile application to monitor and record commuting carbon footprint via transport mode detection. For my University Year 4 Computer Science Project/Dissertation. Recieved grade A3 (84%) and Award for Best Evaluation.


# Video Demo & Screenshots

## Video of Dissertation Outline and Product Demo 
https://www.youtube.com/watch?v=IgmVUZzCSis&ab_channel=PrithManickam

## Web App Employee pages

<img src="https://github.com/user-attachments/assets/59907ed9-7f2a-4e2a-bb9d-2627613630f9" width="800" /> 

## Web App Admin pages

<img src="https://github.com/user-attachments/assets/c0497d6f-d1ba-446f-9006-9f5f01c42846" width="800" />

## Mobile App pages

<img src="https://github.com/user-attachments/assets/08e06b5a-088f-471a-be96-95d57e741b70" width="500" />


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

