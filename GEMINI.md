## The Playlist Exchange: gemini.md

This file will guide our collaboration in building "The Playlist Exchange" application. It outlines the project's goals, architecture, and the step-by-step plan we'll follow. Please use the context provided here to assist in code generation, problem-solving, and architectural decisions for our **Node.js (Express)** and **Svelte** stack.

---
### 🚀 Project Overview

**Idea:** The Playlist Exchange is an application that connects users with similar music tastes, allowing them to exchange playlists. The app will use data from the Spotify and/or Last.fm APIs to analyze user taste profiles and suggest ideal matches for a playlist swap.

**Core Technologies:**
* **Frontend:** **Svelte**
* **Backend:** **Node.js** with the **Express.js** framework.
* **APIs:** Spotify API, Last.fm API

---
### 📋 MVP Features

Our initial focus will be on delivering the following Minimum Viable Product features:

1.  **User Taste Profile Input:**
    * Allow users to connect their Spotify and/or Last.fm accounts via our Node.js backend.
    * Fetch and store relevant user data (top artists, tracks, genres).
2.  **Taste Profile Analysis & Display:**
    * Process the raw API data to create a "taste profile" for each user.
    * Visually represent a user's dominant genres and top artists in the Svelte frontend.
3.  **User Matching Algorithm:**
    * Develop an algorithm in JavaScript to compare the taste profiles of two users.
    * The algorithm should produce a "compatibility score."

---
### 💻 Development Plan & Prompts

Let's break down the development into manageable steps. Here are the prompts you can use to ask for my assistance with our Node.js and Svelte stack.

#### 1. Project Setup

"Let's set up the project structure. I'll need two separate directories: `backend` and `frontend`. In the `backend` directory, please generate the commands to initialize a new Node.js project with `npm init` and install Express.js. In the `frontend` directory, generate the commands to set up a new **Svelte** project using Vite."

#### 2. Backend Development: Node.js/Express API

"First, let's build the Express backend. Please show me how to set up a basic server with a health check route. Also, show me a good project structure for organizing routes, controllers, and services."

"Now, let's handle Spotify authentication. I want to use the **Passport.js** library with the `passport-spotify` strategy. Show me how to create the API routes in Express for `/auth/spotify` and `/auth/spotify/callback` to manage the OAuth2 flow."

"After authentication, we need to fetch user data. Create a JavaScript function that takes a Spotify access token, uses a library like **Axios** to call the Spotify API for the user's top artists, and returns the data."

#### 3. Frontend Development: Svelte UI

"Let's switch to the Svelte frontend. Create a Svelte component with a 'Connect to Spotify' button. This button should link to our Express backend's authentication URL (`/auth/spotify`)."

"After a user logs in, we need to fetch their data from our Express API. Create a Svelte store to manage the user's profile data. Then, create a component that calls our backend, retrieves the user's top artists and genres, and displays them in a simple list."

#### 4. Taste Profile Algorithm in JavaScript

"This is a crucial step for the backend. Let's design the taste profile matching algorithm in JavaScript. The input will be the top artists and genres for two users (likely as arrays of objects). Please propose a simple, efficient algorithm using modern JavaScript features (e.g., `Map`, `Set`, array methods) to calculate a compatibility score."

---
### 📝 General Instructions & Best Practices

* **Code Style:** For JavaScript, please adhere to the **Airbnb JavaScript Style Guide**. We can enforce this with ESLint and Prettier.
* **Error Handling:** In Express, we'll use a centralized error-handling middleware. All asynchronous operations should be wrapped in `try...catch` blocks or use a utility to handle promise rejections.
* **Modularity:** We will keep our code organized. In Express, we'll separate routes, controllers (route handlers), and services (business logic). In Svelte, we will break down the UI into small, reusable components.
* **Environment Variables:** We will use a `.env` file to store sensitive information like API keys and secrets, and the `dotenv` package to load them.
