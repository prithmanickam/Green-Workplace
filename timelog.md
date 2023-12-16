* PROJECT NAME: Hybrid Working Tool for Agility And Sustainability
* YOUR NAME: Prith Manickam
* STUDENT_ID: 2518533M@student.gla.ac.uk
* SUPERVISOR NAME: Peggy Gregory

## Guidance

* This file contains the time log for your project. It will be submitted along with your final dissertation.
* **YOU MUST KEEP THIS UP TO DATE AND UNDER VERSION CONTROL.**
* This timelog should be filled out honestly, regularly (daily) and accurately. It is for *your* benefit.
* Follow the structure provided, grouping time by weeks.  Quantise time to the half hour.

## Week 0

### 14-21 Sep 2023
* *1.5 hours* Research on existing solutions (solutions for main functions: Carbon Footprint Calculator, Team Chat, Team & Data Management System).
* *0.5 hour* listed the main requirements from proposal My idea, and decided on my web app framework (React Nodejs Express and MongoDB).
* *0.5 hour* Created user stories for my 4 user types.
* *0.5 hour* Created MOSCOW requirements.
* *4 hours* Created initial Figma wireframes.
* *2 hours* Attended the lvl4 project session / read the project guidance slides.

## Week 1

### 22 Sep 2023
* *0.5 hour* First meeting with supervisor
* *1 hour* Reseached my software development process (Agile development, feature by feature, iterations & sprints) and architecture design (MVC design pattern).
* *1 hour* Refined MOSCOW requirements and user stories.

### 23 Sep 2023
* *1.5 hours* Refined Wireframes based on new requirements from meeting yesterday
* *1.5 hours* Created Database Schemas
* *0.5 hour* Initalised React and Nodejs Express app

### 24 Sep 2023
* *2 hours* Login Page and Navbar
* *2 hours* Login Authentication
* *2 hours* Testing for login and getUserData apis
* *0.5 hour* Added ci-cd pipeline

## Week 2

### 25 Sep 2023
* *2 hours* Homepage for Admins and Private Routing

### 26 Sep 2023
* *0.5 hour*  Meeting with Supervisor

### 27 Sep 2023
* *5 hours* Created dynamic side navbar and padding so contents aren't hidden underneath
* *1 hours* Created template pages for Company Dashboard (with grid layout), Add Employees, Add Teams, Admin Functions.

### 28 Sep 2023
* *4 hours* Create Light and Darkmode, which can be toggled in both navbars.
* *1 hours* Created Add Employee Page
* *3 hours* Created Send Registration Email API  
* *1 hours* Created Register Page
* *2 hours* Started Retrieve email from Registration URL Token API 

### 29 Sep 2023
* *1.5 hours* Created Register User API
* *1 hours* Edited homepage so different user types are displayed different menu cards
* *2 hours* Fixed Bug / Completed Retrieve email from Registration URL Token API
* *2.5 hours* Created passing tests for Send Registation Emails API and Get Users Email From URL Token API (currently 98% code coverage)

### 30 Sep 2023
* *1 hours* Ensure users are logged out when in login / registration pages
* *1 hours* Allowed private routing for user type
* *1 hours* Fixed api bugs to allow frontend toasts (pop-ups) for for api requests

### 1 Oct 2023
* *1 hours* Fixed overlapping cards bug in Homepage and added side navbar menu options for Team Members and Team Owners
* *1 hours* Created Set Carbon Footprint Page (Navigation for Use Map and Manual)
* *6 hours* Started Creating the Use Map function for Set Carbon Footprint Page (UI Completed and used Google Maps API for operations e.g. displaying route and calculating distance and time)

## Week 3

### 2 Oct 2023
* *6 hours* Finished creating the Use Map function for Set Carbon Footprint Page (Can calculate carbon footprint for all travel modes, created APIs for posting and reseting user's current Week carbon stats, passing tests for all APIs)

### 3 Oct 2023
* *0.5 hours* Fixed Bug in accessing unauthorised pages by modifying URL
* *0.5 hour*  Meeting with Supervisor

### 4 Oct 2023
* *1 hours* Fetched all employees and displayed them in a table
* *4 hours* Started Add Team Page & Add Team API. Worked on fixed User Schema to allow being in multiple teams. Started creating team schema.

### 5 Oct 2023
* *5 hours* Completed Add Team Page & Nearly done Add Team API. Fixed User Schema to allow being in multiple teams. Created team schema.

### 6 Oct 2023
* *5 hours* Completed Delete Team API (which also changes respective user relations), update Add Team Page UI based on API calls.

### 7 Oct 2023
* *1 hours* Organised Backend controllers, routes, and tests (created respective files and moved code). Also commented out console logs in apis to remove error messages when testing.
* *1 hours*  Added tests get all users and get non team owners APIs
* *6 hours*  Edited the Footprint Map Page to allow users to enter percentages to distrubute their carbon footprint value to the teams users are in.

### 8 Oct 2023
* *6 hours*  Edited the Set Carbon Footprint Page to display the distrubuted carbon footprint value to the teams users are in.
* *1.5 hours*  Updated tests for the post and reset carbon footprint APIs. Created tests for the get carbon footprint API.

## Week 4

### 9 Oct 2023
* *1 hours*  Deploy backend to 'render' and deployed frontend to 'vercel'. Performed functionality and worked fine.
* *1 hours*  Created User Acceptance Testing (UAT) Instructions.
* *1 hours*  Created Your Dashboard Page UI
* *2 hours*  Created API to fetch your Dashboard information.

### 10 Oct 2023
* *0.5 hour*  Meeting with Supervisor
* *2 hours*  Planning database schemas with the added requirement of user can be team owners of multiple teams.

### 11 Oct 2023
* *1 hour*  Planning database schemas with the added requirement of user can be team owners of multiple teams.
  
### 12 Oct 2023
* *1 hour*  Planning database schema with the added requirement of user can be team owners of multiple teams.

### 13 Oct 2023
* *1 hour*  Planning database schema with the added requirement of user can be team owners of multiple teams.

### 14 Oct 2023
* *1 hour*  Created Tables on Supabase (Postgres database)

### 15 Oct 2023
* *1 hour*  Started migrating Auth APIs to Supabase instead of MongoDB

## Week 5

### 16 Oct 2023
* *1 hour*   Changed all API calls to work for development and production
* *3 hours*  Migrated Auth APIs to supabase (Login, Register GetUserData, AddEmployees)

### 17 Oct 2023
* *0.5 hour*  Meeting with Supervisor
* *5 hours*  Started migrating Team APIs to supabase (Add Team, Get Team, Delete Team)

### 18 Oct 2023
* *1 hour*   Completed migrating Team APIs to supabase (Add Team, Get Team, Delete Team)

### 19 Oct 2023
* *6 hours*  Completed migrating Carbon Footprint APIs to supabase (post/get/reset carbon footprint). Also added a loading animation in set carbon footprint page when waiting for data.

### 20 Oct 2023
* *3 hours*  Completed Get User Dashboard Info API.

### 21 Oct 2023
* *7 hours*  Updating all Backend API Tests. 
* *1 hour*   Optimised getTeams API by fetching info using one query instead of three.

### 22 Oct 2023
* *3 hours*  Create API to set users Work At Office preference for each team in Your Dashboard Page

## Week 6

### 24 Oct 2023
* *0.5 hour*  Meeting with Supervisor.

### 25 Oct 2023
* *8 hours*  Created Team Dashboard page and created APIs to fetch relevent data. Users can switch between team dashboard if they're in mulitple teams.

### 26 Oct 2023
* *1 hour*  Pipeline Fix and Changes due to database stubbing. Fixed fetching team dashboard data bug by first check if team has been selected. 

### 27 Oct 2023
* *6 hour*  Started working on the Team Chat Page. 

### 28 Oct 2023
* *8 hour*  Team Chat page has an improved layout, now displays name and date of message, and can scroll through past messages. Real-time connection been established. Can switch between chats from the team dropdown.

## Week 7

### 30 Oct 2023
* *1 hour*  Fixed bug for real-time communication in different teams.

### 31 Oct 2023
* *0.5 hour*  Meeting with Supervisor.
* *2 hours*  UAT bug fixes: Keep buttons for Work at Office days highlighted in Your Dashboard Page, Made days ordered (Mon - Fri) in Your Dashboard Page, Fix the Avatar icon in Navbar to show letter of the users firstname.
* *0.5 hour*  Fixed avatar icon rendering bug in navbars.

### 1 Nov 2023
* *2 hours*  Updated Set Carbon Footprint and get User Dashboard apis following improving Database schema by removing users total calculated carbon footprint, so it follows data integrity.

### 2 Nov 2023
* *7 hours*  Created Company Dashboard Page and the API to fetch the information. Can sort and search teams in the company by carbon footprint, team name, and division name.

### 3 Nov 2023
* *1 hour*  Fixed Team Chat Scroll Bug - Team chat now scrolls down by default and once sent a message.

### 4 Nov 2023
* *8 hours*  Started Team Owner Functions Page which fetches all relevent data. Current working functions are edit team page and set Work At Office Days.

### 5 Nov 2023
* *4 hours*  Completed Team Owner Functions Page which fetches all relevent data. Finished functions to add and remove team members.
* *7 hours*  Display popup and colour cards based on company carbon standard in the dashboard pages. Started Admin Functions Page where you can edit the companies good, average, and bad carbon footprint standards.

## Week 8

### 6 Nov 2023
* *3 hours*  Fixed bug to display correct colours for dashboard cards based on carbon footprint. 

### 7 Nov 2023
* *3 hours*  Fixed UAT Bug Fixes: Notify user if incorrect login credentials entered, Shorten account created info in dashboard pages. Floating point error fixes in apis for dashboards. Added Icons in Team Ownership Page.
* *0.5 hour*  Meeting with Supervisor.

### 11 Nov 2023
* *10 hours* Wrote code to train and save Machine Learning Model to predict transport mode.

### 12 Nov 2023
* *10 hours*  Created Backend API to use ML Model to predict transport mode. And started working on frontend to use phone motion sensors to send to the backend.

### 13 Nov 2023
* *4 hours*  Fixed frontend to get the right sensor data to send to the backend, to display predicted transport modes every 7 seconds.
* *0.5 hour*  Meeting with Supervisor.

### 20 Nov 2023
* *3 hours*  Wrote a structure with headings on how my dissertion would be like to show to my Supervisor.

### 21 Nov 2023
* *0.5 hour*  Meeting with Supervisor.

### 28 Nov 2023
* *0.5 hour*  Meeting with Supervisor.

### 9 Dec 2023
* *1 hour*  Attempt to get GPS data in intervals to improve accuracy in predictions

### 11 Dec 2023
* *5 hours*  Attempt to calculate speed from accelerometer data.

### 12 Dec 2023
* *1 hours*  Added a start and stop detecting transport button.

### 15 Dec 2023
* *1 hours*  Decided to remove web app frontend code for transport detection after deciding interface only be on mobile app. Also added code from 11 Nov 2023 to train and save Machine Learning Model to predict transport mode in the backend.

### 16 Dec 2023
* *5 hours*  Created the Manually Add Carbon Footprint Page.

