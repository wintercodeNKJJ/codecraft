Codecrafthub
A lightweight Express REST API to manage personal learning goals (courses). Data is stored in a JSON file named courses.json at the project root. Built for learning and experimentation.

Project overview
Exposes a RESTful API under /api/courses to manage courses.
Each course has:
id: auto-generated, starts from 1
name: required
description: required
target_date: required, format YYYY-MM-DD
status: required, one of "Not Started", "In Progress", or "Completed"
created_at: auto-generated timestamp
Data persistence is file-based (JSON). The app auto-creates courses.json if it doesn’t exist.
Features
Create, Read, Update, and Delete (CRUD) operations for courses
Simple JSON file storage (courses.json)
Auto-generated course IDs
Validation for required fields, date format, and allowed statuses
Helpful error messages for missing data, not found, invalid input, and file I/O issues
Clean, beginner-friendly code with comments
Installation
Prerequisites:

Node.js (v14+ recommended)
Clone or download the project.

Open a terminal in the project directory.

Install dependencies:

npm install
How to run the application
Start the server:

npm start
The server runs on port 5000 by default.
If you run directly with Node:

node app.js
Note: The app will create a courses.json file in the project root if it doesn't exist yet.

API endpoint documentation
Base URL: http://localhost:5000

Endpoints

POST /api/courses
Description: Add a new course
Request body (JSON): { "name": "Learn Express", "description": "Build REST APIs with Express", "target_date": "2026-05-15", "status": "Not Started" }
Successful response:
Status: 201 Created
Body: the created course object, including id and created_at
Errors:
400 Bad Request with details if required fields are missing or invalid
500 Internal Server Error for unexpected issues
GET /api/courses
Description: Get all courses
Optional convenience:
?id=1 to fetch a specific course by id (alternative to /api/courses/:id)
Successful response:
Status: 200 OK
Body: Array of course objects (or a single course if id query is used)
GET /api/courses/:id
Description: Get a specific course by id
Request: id in the URL path
Successful response:
Status: 200 OK
Body: the course object
Errors:
400 Bad Request if id is invalid
404 Not Found if the course doesn't exist
500 Internal Server Error for unexpected issues
PUT /api/courses
Description: Update a course (full update)
Request body (JSON) — all fields required, including id: { "id": 1, "name": "Learn Express (Updated)", "description": "Updated description", "target_date": "2026-06-01", "status": "In Progress" }
Successful response:
Status: 200 OK
Body: the updated course object
Errors:
400 Bad Request with details if data is missing/invalid
404 Not Found if the course doesn't exist
500 Internal Server Error for unexpected issues
DELETE /api/courses
Description: Delete a course
Request body (JSON): { "id": 1 }
Successful response:
Status: 200 OK
Body: the deleted course object
Errors:
400 Bad Request if id is missing
404 Not Found if the course doesn't exist
500 Internal Server Error for unexpected issues
Data model
Each course stored in courses.json has the following structure:

id: number
name: string
description: string
target_date: string (YYYY-MM-DD)
status: string ("Not Started", "In Progress", or "Completed")
created_at: string (ISO timestamp)
Troubleshooting
Server not starting on port 5000

Ensure no other process is using port 5000.
Check terminal output for stack traces.
400 Bad Request

Ensure you provide all required fields for POST/PUT.
Verify target_date is in YYYY-MM-DD format and is a valid calendar date.
Ensure status is one of: Not Started, In Progress, Completed.
404 Not Found

The course id you requested does not exist. Check the id value in the request.
500 Internal Server Error

File I/O issues (e.g., cannot read/write courses.json due to permissions).
Ensure the app has permission to create and modify courses.json in the project root.
Check server logs for detailed error messages.
Data persistence

On startup, the app creates courses.json if it doesn’t exist.
All data is stored in a single JSON array in courses.json. This approach is suitable for learning and tiny datasets.
Example curl commands
Create a new course

curl -X POST http://localhost:5000/api/courses
-H "Content-Type: application/json"
-d '{"name":"Learn Express","description":"Build REST APIs with Express","target_date":"2026-05-15","status":"Not Started"}'
Get all courses

curl http://localhost:5000/api/courses
Get a specific course (by id)

curl http://localhost:5000/api/courses/1
Update a course

curl -X PUT http://localhost:5000/api/courses
-H "Content-Type: application/json"
-d '{"id":1,"name":"Learn Express (Updated)","description":"Updated","target_date":"2026-06-01","status":"In Progress"}'
Delete a course

curl -X DELETE http://localhost:5000/api/courses
-H "Content-Type: application/json"
-d '{"id":1}'
Notes
This project is intended for learning and experimentation.
The API design in this README matches the implementation discussed earlier (including the /api/courses/:id route alongside the /api/courses route for listing).
If you want to adjust the API to strictly use only /api/courses/:id for single-item access, the server code can be adapted accordingly.
Enjoy building and experimenting with the API!
