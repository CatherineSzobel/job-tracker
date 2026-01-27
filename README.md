# Job Tracker

Job Tracker is a modern full-stack web application designed to help job seekers efficiently manage their job applications, interviews, notes, and resources throughout their job search journey.

## 🚀 Project Status

**⚠️ Work In Progress** - Core features are functional, but additional features and refinements are planned. See [Planned Features](#planned-features) for upcoming additions.

---

## 📋 Overview

Job Tracker helps you:

* Track all job applications in one central location
* Schedule and manage interview appointments
* Keep detailed notes on companies and interviews
* Maintain a to-do list for job search tasks
* Organize important links and resources for each application

---

## 🛠️ Technology Stack

### Backend

* **Framework:** Laravel 12 (PHP 8.2+)
* **Authentication:** Laravel Sanctum (API token-based)
* **Database:** MySQL/PostgreSQL with Eloquent ORM
* **Testing:** PHPUnit
* **Code Quality:** Laravel Pint

### Frontend

* **Framework:** React 19 with JSX
* **Routing:** React Router v7
* **Styling:** Tailwind CSS v4
* **Build Tool:** Vite v7
* **HTTP Client:** Axios
* **Charting:** Recharts
* **Date Handling:** date-fns v4

---

## ✨ Current Features

### Core Functionality

* **Job Applications:** Track positions with status, priority, dates, and location info
* **Interviews:** Schedule and manage interview appointments
* **Notes:** Attach comprehensive notes to applications
* **To-Do List:** Personal task management
* **Links:** Store and organize useful resources

### User Experience

* **Dashboard:** Overview of job search progress
* **Authentication:** User registration, login, and profile management
* **Archive:** Keep old applications organized
* **Calendar View:** Visual representation of scheduled interviews
* **Responsive Design:** Works across desktop and mobile devices

---

## 📦 Project Structure

```
job-tracker/
├── app/                 # Laravel backend
│   ├── Http/Controllers/  # API controllers
│   └── Models/           # Database models
├── database/
│   ├── migrations/       # Database schema
│   └── factories/        # Test data factories
├── routes/               # API routes
├── job-tracker-frontend/ # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── views/       # Page components
│   │   └── api/         # API integration
│   └── vite.config.js   # Vite configuration
└── config/              # Application configuration
```

---

## ⚙️ Setup & Running

1. **Backend**

```bash
cd job-tracker
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed # optional
php artisan serve
```

2. **Frontend**

```bash
cd job-tracker-frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to use the app.

---

## 📋 Database Models

* **User:** Application users with authentication
* **JobApplication:** Job positions tracked with company, status, and dates
* **Interview:** Interview scheduling and management
* **Note:** Detailed notes attached to applications
* **Todo:** Task list items
* **Link:** Resource URLs and important links

---

## 🎯 Planned Features

1. **Reminder System ⏰**

   * Automatic reminders for pending applications
   * Configurable thresholds
   * notification alerts

2. **Settings Page ⚙️**

   * User preferences and profile customization
   * Notification and privacy settings
   * Theme options (light/dark)
   * Data export/import

3. **Enhanced Links Management 🔗**

   * Store and organize documents like resumes, cover letters, LinkedIn, GitHub, portfolio, certifications
   * Quick access from job application detail view

**Future Enhancements:**

* Interview preparation resources
* Batch operations, custom tags, real-time notifications
* Proper To-Do implementation, currently it is in but nothing is being done with it yet
* Add proper testing
* More to be added...

---

## 📝 API Documentation

RESTful API endpoints using Laravel Sanctum for authentication.

**Key Endpoints:**

* `POST /api/auth/register` - Register new user
* `POST /api/auth/login` - User login
* `GET /api/job-applications` - List all job applications
* `POST /api/job-applications` - Create new application
* `GET /api/interviews` - List interviews
* `GET /api/notes` - List notes
* `GET /api/todos` - List to-do items
* `GET /api/links` - List resource links

---

## 🤝 Contributing

Contributions and suggestions are welcome! You can:

* Report bugs
* Suggest features
* Submit pull requests

---

## 📄 License

MIT License. See LICENSE file for details.

---

## 👤 Author

Created as a personal project to streamline job search management.

**Last Updated:** January 2026
**Current Version:** 0.1.0 (
