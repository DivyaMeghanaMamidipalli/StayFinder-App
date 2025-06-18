# 🏡 StayFinder

**StayFinder** is a full-stack web application that allows users to explore, list, and book properties for short-term or long-term stays. The platform supports both guests and hosts with tailored features, a robust booking system, and a clean user interface.


# Deployment Link 
- https://stay-finder-app-xi.vercel.app/


## 🚀 Features

### 👤 Authentication
- User registration & login (JWT-based auth)
- Role-based access (`guest` or `host`)
- Secure password hashing with bcrypt
- Protected routes using middleware

### 🏠 Listings
- Browse all properties on the homepage
- View detailed information for each property
- Filter listings by location, guests, and amenities
- Search support with query parameters
- Host-only: Create, update, and delete listings

### 📆 Booking System
- Guests can book listings with check-in/out dates and number of guests
- Mock payment system integrated before confirming bookings
- Hosts can view all bookings made for their listings
- Guests can see their past & upcoming bookings

### 🗺️ Extra Features
- Google Maps integration to show property locations
- Responsive design for desktop and mobile
- Image carousel in listing details
- Amenities, availability calendar, and pricing breakdown
- Fake payment modal with card validation (Luhn algorithm)

---

## 🧑‍💻 Tech Stack

### Frontend
- React (Vite)
- React Router DOM
- Context API for global state management
- Tailwind CSS for UI
- @react-google-maps/api for map integration

### Backend
- Node.js + Express
- MongoDB (via Mongoose)
- JWT for authentication
- Multer for image uploads

### Database Models
- **User**: name, email, password, role, createdAt
- **Listing**: title, description, location, price, host, guests, amenities, etc.
- **Booking**: listing, guest, checkIn, checkOut, totalPrice, status

---

## 📦 Project Structure

stayfinder/
├── client/ # Frontend (React + Vite)
│ ├── components/
│ ├── pages/
│ ├── context/
│ ├── hooks/
│ └── ...
├── server/ # Backend (Express + MongoDB)
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ ├── uploads/
│ └── server.js


## 🧪 Seed Data

To test quickly, use the `/api/seed` endpoint which:
- Clears existing collections
- Adds sample users (hosts & guests)
- Adds listings and demo data

---

## 📷 Demo Screenshots

| Homepage | Listing Detail | Payment Modal |
|----------|----------------|----------------|
| ![Homepage](screenshots/home.png) | ![Details](screenshots/details.png) | ![Payment](screenshots/payment.png) |

> 📌 _Add your screenshots to the `screenshots/` folder if you'd like to show them._

---

## 🔧 Setup Instructions

### Prerequisites
- Node.js
- MongoDB local instance or cloud URI
- (Optional) Google Maps API key

### Environment Variables

Create a `.env` file in the `server/` folder with: Mongo Connection URI
Create a `.env` file in the `client/` folder with: Backend API KEY, Google Maps Cloud API Key

### Install & Run
bash
Copy
Edit
# Backend
cd server
npm install
npm run dev

# Frontend
cd client
npm install
npm run dev


### What Has Been Implemented
- User authentication with role support
- Property listing and filtering
- Listing detail pages
- Booking system with validation
- Mock payment modal with inline form validation
- Host dashboard to manage listings
- Bookings view for both host and guest
- Search and filters (location, amenities, guests)
- Google Maps integration
- Mobile responsive UI

### Future Enhancements
- Stripe integration for real payment flow
- Admin dashboard for platform control
- Email confirmation on booking
- Review and rating system
- Calendar view for host availability