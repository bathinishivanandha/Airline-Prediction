# Airline Prediction System

A full-stack airline fare prediction and booking platform that combines a React frontend, an Express/Node.js backend, and a Python Flask machine learning service. The application helps users estimate flight prices before booking, manage bookings, and review travel-related insights through a modern web interface.

## Overview

This project is designed to provide:

- Smart airfare predictions using a trained machine learning model
- A user-friendly search and booking experience
- Authentication for regular users and an admin portal
- Booking history and cancellation support
- Review and feedback support for travelers

The system is organized into three main parts:

1. Frontend - React + Vite interface for users and admins
2. Backend - Express + MongoDB APIs for authentication, bookings, flights, and reviews
3. ML Service - Flask + Python model inference for airfare prediction

## Key Features

- Predict flight prices based on route, travel date, cabin class, stops, passenger type, and booking window
- View predicted fare details and estimated final price after discounts
- Register/login for travelers and access booking history
- Admin portal for system management and monitoring
- Review section for user feedback and experience sharing
- Booking flow with cancellation support

## Project Structure

- Airline_prediction/frontend - React application
- Airline_prediction/backend - Node.js/Express API server
- Airline_prediction/ml-service - Flask ML prediction service
- start_project.bat - Helper script to start all services

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT-style user session flows

### ML Service
- Python
- Flask
- Pandas
- Joblib
- Scikit-learn model artifacts

## Prerequisites

Before running the project, make sure you have:

- Node.js and npm installed
- Python 3.x installed
- MongoDB running locally or a reachable MongoDB URI
- A working virtual environment for the ML service

## Quick Start

### Option 1: Run everything with the helper script

From the repository root:

1. Double-click start_project.bat
2. Or run it from PowerShell:

   start_project.bat

This will start:
- ML service on port 5000
- Backend on port 4000
- Frontend on port 5173 (or the next available Vite port)

### Option 2: Run each component manually

#### 1. ML Service

cd Airline_prediction/ml-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python app.py

#### 2. Backend

cd Airline_prediction/backend
npm install
node server.js

#### 3. Frontend

cd Airline_prediction/frontend
npm install
npm run dev

## Environment Notes

The backend uses MongoDB through the following default configuration:

- MONGO_URI=mongodb://127.0.0.1:27017/airline-prediction
- PORT=4000

If your environment uses a different MongoDB setup, update the backend environment variables accordingly.

## API Highlights

The backend exposes routes for:

- Authentication
- Flight price prediction
- Booking management
- Review handling

The ML service exposes:

- /health
- /predict
- /admin/stats

## Usage Flow

1. Open the frontend in the browser.
2. Register or sign in as a user.
3. Navigate to the search/prediction page.
4. Enter travel details to generate a predicted airfare.
5. Review your predicted price and proceed with booking if desired.
6. Access your dashboard for bookings and history.

## Notes

- The ML model artifacts are expected in the ml-service folder.
- If the model files are missing, train the model first using the project’s training workflow before running predictions.
- The backend seeds a default admin account on startup:
  - Email: admin@aeropredict.com
  - Password: admin123

## Purpose

This project demonstrates how machine learning, modern web development, and backend APIs can be combined to create a practical travel fare prediction application with real user workflows.
