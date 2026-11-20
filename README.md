# ⚡ Quick.ai - Full-Stack AI Creation & Productivity Suite

![Quick.ai Banner](client/src/assets/gradientBackground.png)

**Quick.ai** is an all-in-one AI-powered SaaS platform built with **React**, **Express.js**, **Google Gemini**, **ClipDrop**, **Cloudinary**, and **Neon PostgreSQL**. It empowers users to generate articles, craft compelling blog titles, generate and edit images, and get detailed AI feedback on their resumes through a clean, intuitive dashboard.

---

## 🚀 Features

### ✍️ Content & Writing Tools
- **AI Article Writer:** Generate well-structured, in-depth articles tailored to short, medium, or long word counts.
- **Blog Title Generator:** Instant, high-converting title suggestions organized by category (Technology, Business, Health, Travel, etc.).
- **AI Resume Reviewer:** Upload PDF resumes to receive actionable, constructive critiques highlighting strengths, weaknesses, and improvement areas.

### 🎨 Visual & Image Tools
- **Text-to-Image Generation:** Convert descriptive text prompts into high-resolution images powered by ClipDrop and stored on Cloudinary.
- **Background Removal:** Seamless one-click background extraction for product photos and portraits.
- **Object Removal:** Generative object erasing to clean up photos effortlessly.

### 📊 Management & Security
- **Interactive User Dashboard:** Track creation history, preview previous generation outputs, and monitor quota limits.
- **Modern Authentication:** Secure authentication and session management powered by **Clerk** (supporting Social Logins & JWT tokens).
- **Serverless PostgreSQL Database:** Scalable persistence on **Neon DB** tracking all user creations and metadata.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Authentication:** [@clerk/react](https://clerk.com/)
- **Networking:** [Axios](https://axios-http.com/)
- **Notifications & Markdown:** `react-hot-toast`, `react-markdown`

### Backend (`/server`)
- **Runtime:** [Node.js](https://nodejs.org/) (ES Modules)
- **Framework:** [Express.js](https://expressjs.com/) (v5)
- **AI Engines:** [Google Gemini API](https://aistudio.google.com/) (`gemini-3.5-flash`), [OpenAI SDK](https://github.com/openai/openai-node)
- **Image Generation:** [ClipDrop API](https://clipdrop.co/apis)
- **Media Hosting:** [Cloudinary SDK](https://cloudinary.com/)
- **Database:** [Neon Serverless PostgreSQL](https://neon.tech/) (`@neondatabase/serverless`)
- **File Parsing:** `multer`, `pdf-parse`

---

## 📁 Project Structure

```text
QuickAi/
├── client/                      # React frontend
│   ├── src/
│   │   ├── assets/              # Static assets, icons, and illustrations
│   │   ├── components/          # Reusable UI (Navbar, Sidebar, CreationItem, Testimonial, etc.)
│   │   ├── pages/               # Views (Home, Dashboard, WriteArticle, BlogTitles, etc.)
│   │   ├── App.jsx              # Router & layout configuration
│   │   └── main.jsx             # React DOM entry point + Clerk Provider
│   └── package.json
│
└── server/                      # Express backend
    ├── configs/                 # Database, Cloudinary, and Multer configurations
    ├── controllers/             # AI processing, creation history, and user logic
    ├── middlewares/             # Dual-layer Clerk authentication and quota guards
    ├── routes/                  # Express API routes (`/api/ai`, `/api/user`)
    ├── server.js                # Server entry point & DB auto-initializer
    └── package.json
```

---

## ⚙️ Environment Variables Setup

### 1. Backend (`server/.env`)
Create a `.env` file in the `server/` directory:

```env
PORT=3000

# Neon PostgreSQL Database Connection String
DATABASE_URL=your_postgresql_connection_string

# Clerk Authentication Keys
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Google AI Studio / Gemini API
GEMINI_API_KEY=your_gemini_api_key

# ClipDrop Image Generation API
CLIPDROP_API_KEY=your_clipdrop_api_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### 2. Frontend (`client/.env`)
Create a `.env` file in the `client/` directory:

```env
# Clerk Publishable Key (Must match server Clerk project)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Backend API Base URL
VITE_BASE_URL=http://localhost:3000
```

---

## 🏁 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/QuickAI.git
cd QuickAI/QuickAi
```

### 2. Setup the Backend Server
```bash
cd server
npm install
npm run server
```
> The server will start on `http://localhost:3000` and automatically initialize the PostgreSQL `creations` table.

### 3. Setup the Frontend Client
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
> The frontend application will be live at `http://localhost:5173`.

---

## 🔒 Quota & Rate Limiting System

Quick.ai includes built-in usage tracking:
- **Free Plan:**
  - Up to **100** articles and blog title generations.
  - Up to **10** image generation, background removals, object removals, and resume reviews.
- **Premium Plan:**
  - Unlimited access across all generation endpoints.
  - Real-time plan status checked via Clerk user metadata.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

## 📄 License
This project is licensed under the [ISC License](LICENSE).
