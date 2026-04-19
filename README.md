# 🍽️ FoodVilla — Enhanced Fork by Ram
⚠️ This is a forked project with significant independent enhancements and architectural improvements.
This repository is an enhanced and extended version of the original FoodVilla project, with major improvements across UI/UX, subscription systems, admin controls, analytics, and AI-driven features.

---

## 🚀 Key Enhancements & Contributions

### 🖼️ Restaurant Experience

* Interactive image gallery with navigation controls
* Dot indicators and image counter badge
* Smooth transitions using AnimatePresence
* Thumbnail preview strip on detail page
* Advanced image manager with preview, delete, and upload limits

---

### 🍽️ Menu Management System

* Full CRUD operations for menu items
* Bulk item creation support
* Image upload per item
* Availability toggle and delete functionality
* Owner dashboard integration (Menu tab)

---

### 🤖 AI Chat System (Revamped UI)

* Modern gradient chat interface
* Expand/collapse chat window
* Floating animated chat button
* Welcome screen with suggestion grid
* Typing indicators with animations
* Markdown support (including images)
* Featured ⭐ and Verified ✅ badges in responses

---

### 👤 Owner & Subscription System

* Complete subscription flow (Free Trial, Premium, Featured)
* Razorpay payment integration
* Owner approval system with admin control
* Role-based access control (User / Owner / Admin)
* Owner pending state with polling and auto-redirect

---

### 📊 Analytics & Insights

* Real-time analytics dashboard for owners
* Metrics: views, searches, bookings, AI mentions
* Conversion rate tracking
* Time filters (7 / 30 / 90 days)
* Recharts integration

---

### 🪑 Booking System Improvements

* Visual table selection grid
* Color-coded tables by type
* Disabled tables based on group size
* Reservation lifecycle handling (complete / cancel / no-show)

---

### ⚙️ Backend Enhancements

* Subscription & analytics models added
* Commission system removed and replaced with subscription logic
* Owner status approval system
* Automated cron jobs:

  * Subscription expiry (midnight)
  * Trial ending reminders (9 AM)
* Email notifications for subscription events

---

### 🔍 Filtering & Discovery

* Ambiance & amenities filters (multi-select)
* Backend query optimization using `$all`
* Holiday-based closure handling

---

### ⚠️ Error Handling & Stability

* Reusable ErrorState component
* Integrated across key pages
* Environment validation using Zod (fail-fast approach)

---

### 🛠️ Admin Dashboard Enhancements

* Owner approval/rejection system
* Subscription & revenue tracking
* Auto-refreshing admin data
* Role-based UI restructuring

---

### 🎨 UI/UX Improvements

* Modern responsive layouts
* Framer Motion animations:

  * Hover effects
  * Page transitions
  * Scroll animations
* Improved authentication pages and onboarding flow

---

## 🔐 Roles & Access Control

* **User** → Can browse & become owner
* **Owner (Pending)** → Waiting for admin approval
* **Owner (Active)** → Full dashboard access
* **Admin** → Complete system control

---

## 🔄 Business Logic Highlights

* Featured restaurants appear first in AI search
* Subscription expiry auto-downgrades users
* Admin banning cascades to restaurants
* Full analytics tracking on user actions

---

## 🧠 Tech Stack

* Frontend: React, Redux, Tailwind CSS, Framer Motion
* Backend: Node.js, Express
* Database: MongoDB
* Payments: Razorpay
* Validation: Zod
* Charts: Recharts

---

## ✨ Summary

This fork significantly upgrades the original FoodVilla project into a production-ready platform with advanced features, scalable architecture, and enhanced user experience across all roles.

---

## 🙌 Contribution Note

This is a forked project. Major enhancements, system redesigns, and feature implementations have been contributed independently to extend the original functionality.
