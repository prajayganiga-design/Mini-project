# Event Management System (Original)

This is the original Event Management System that uses CSV file uploads to manage events and tasks.

## Features

- **CSV Upload**: Upload events and tasks via CSV files
- **Event Management**: Manage events with dates and validation
- **Task Management**: Assign and track tasks for events
- **Overlap Detection**: Prevents overlapping events
- **Progress Tracking**: Track task completion status

## How to Use

### 1. Open index.html
Open `index.html` in your web browser.

### 2. Upload Events CSV
1. Select "Events" from the dropdown
2. Upload a CSV file with the format:
   ```
   eventid,eventname,start_date,end_date
   E001,Conference,2024-08-01,2024-08-05
   ```

### 3. Upload Tasks CSV
1. Select "Tasks" from the dropdown
2. Upload a CSV file with the format:
   ```
   eventid,task_name
   E001,Prepare agenda
   E001,Send invitations
   ```

### 4. View Events
Click the "Events" button to view all uploaded events and their progress.

### 5. Manage Tasks
Click the "TASK" button on any event to manage its tasks.

## CSV File Format

### Events CSV
- Header: `eventid,eventname,start_date,end_date`
- Date format: `YYYY-MM-DD`
- Example:
  ```csv
  eventid,eventname,start_date,end_date
  E001,Conference,2024-08-01,2024-08-05
  E002,Workshop,2024-09-10,2024-09-12
  ```

### Tasks CSV
- Header: `eventid,task_name`
- Example:
  ```csv
  eventid,task_name
  E001,Prepare agenda
  E001,Send invitations
  E002,Book venue
  ```

## Validation

The system validates:
- CSV file format and headers
- Date formats
- No null values
- No overlapping events
- No duplicate event IDs
- Event IDs exist before adding tasks

## Storage

Data is stored in browser localStorage, so it persists between page loads but is specific to each browser.

## Files Structure

```
Event-Management/
├── index.html          # Main page with CSV upload
├── events.html         # Events display page
├── tasks.html          # Tasks management page
├── css/
│   ├── styles.css      # Main styles
│   ├── header.css      # Header styles
│   ├── events.css      # Events page styles
│   ├── tasks.css       # Tasks page styles
│   └── table.css       # Table styles
└── scripts/
    ├── script.js       # Main script (CSV parsing)
    ├── events.js       # Events page logic
    └── tasks.js        # Tasks page logic
```

## Running the Project

Simply open `index.html` in a web browser. No server required as it uses localStorage for data storage.

---

**Note**: This is the original CSV-based version. For the new full-stack version with database and API, see the root directory files (server.js, public/, etc.).

