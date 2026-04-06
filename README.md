# AI Agents Marketplace

A full-stack web application that lets users create, browse, and manage AI agents in a marketplace-style interface.

## Features

- Create AI agents with name, description, and category
- Store and fetch data from MongoDB Atlas
- Search agents by name in real time
- Clean and responsive UI with card-based layout
- Real-time list refresh after adding new agents

## Tech Stack

### Frontend
- React.js
- CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas

## Screenshots

Add screenshots here for hackathon submission:

- Main UI (agents list)
- Create Agent form
- Search feature

Tip: take screenshots and drag-and-drop them into this README in GitHub editor.

Example format:

~~~md
## Screenshots

### Main UI
![Main UI](./docs/screenshots/main-ui.png)

### Create Agent Form
![Create Agent Form](./docs/screenshots/create-form.png)

### Search Feature
![Search Feature](./docs/screenshots/search-feature.png)
~~~

## Installation and Setup

### 1. Clone the repository

~~~bash
git clone https://github.com/codebyshambhavi/ai-agents-marketplace.git
cd ai-agents-marketplace
~~~

### 2. Backend setup

~~~bash
cd backend
npm install
node server.js
~~~

Backend runs on:

~~~
http://localhost:5000
~~~

### 3. Frontend setup

Open a new terminal:

~~~bash
cd frontend
npm install
npm start
~~~

Frontend runs on:

~~~
http://localhost:3000
~~~

## Environment Variables

Create a .env file inside backend and add:

~~~env
MONGO_URI=your_mongodb_atlas_connection_string
~~~

## API Endpoints

### Create Agent

- Method: POST
- Endpoint: /api/agents/create

### Get All Agents

- Method: GET
- Endpoint: /api/agents

## What I Learned

- Building REST APIs with Express
- Connecting MongoDB Atlas to a Node.js backend
- Full-stack integration (React + Node)
- Debugging real-world issues such as CORS, DNS, and Git workflows

## Future Improvements

- Rating system
- Category filters
- Favorites feature
- Deployment (Vercel + Render)

## Author

Shambhavi

GitHub: https://github.com/codebyshambhavi
