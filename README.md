# ⚡ Hyperframes AI Studio

Hyperframes is a next-generation AI video generation platform. It allows users to describe cinematic visions in natural language and transforms them into professional MP4 videos using a combination of **Groq-powered AI**, **GSAP timelines**, and **FFmpeg rendering**.

![Hyperframes UI](./assets/hyperframe.png)

## 🌟 Key Features

- **AI Motion Engineer**: Chat with a specialized Llama 3.1 model trained in Senior Motion Engineering.
- **Live Reactive Preview**: View your GSAP animations instantly in a sandboxed iframe.
- **Cinematic Multi-Clip Support**: Generate complex sequences with multiple camera motions, text overlays, and transitions.
- **Production-Ready Rendering**: A Dockerized backend that captures frames using Chromium and encodes high-quality MP4s via FFmpeg.
- **Cloud Delivery**: Permanent video storage and CDN delivery via Cloudinary integration.
- **Premium Aesthetics**: Dark-mode studio design with glassmorphism and Framer Motion transitions.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS (v3), Framer Motion, Zustand.
- **Backend**: Node.js, Express, Mongoose, Hyperframes Engine.
- **AI**: Groq API (Llama 3.1).
- **Storage**: MongoDB Atlas, Cloudinary.
- **Deployment**: Docker, Render.com (Linux-based Chromium/FFmpeg).

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/AadityaSinha24/Hyperframe-app.git
cd Hyperframe-app
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
MONGODB_URI=your_mongodb_uri
GROQ_API_KEY=your_groq_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Setup Frontend
```bash
cd ..
npm install
```
Create a `.env` file in the root folder:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Run Locally
Start Backend:
```bash
cd backend
npm run start
```
Start Frontend:
```bash
cd ..
npm run dev
```

## 📦 Deployment

The project is pre-configured for **Render.com** using the `render.yaml` blueprint.

- **Backend**: Deployed as a Docker service (requires Node 22 + Chromium).
- **Frontend**: Deployed as a Static Site.

## 📄 License

MIT License. Created by [Aaditya Sinha](https://github.com/AadityaSinha24).
