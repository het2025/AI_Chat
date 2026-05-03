# EKKA AI - Advanced AI Chat Interface

> **A high-performance, aesthetically pleasing AI chat platform built for the modern web.**

EKKA AI is a sophisticated, full-stack AI chat application inspired by modern LLM interfaces like Claude. It bridges the gap between powerful AI models and an intuitive user experience, featuring a high-performance React frontend and a robust Node.js backend. Designed to provide a seamless and powerful interface for interacting with state-of-the-art language models. 

Key integrations include **NVIDIA NIM** for lightning-fast model inference and **Supabase** for secure, real-time data persistence and authentication.

## 🌐 Live Demo

Check out the live version of EKKA AI here: [https://ekka-ai.vercel.app](https://ekka-ai.vercel.app) *(Placeholder)*

![EKKA AI Hero](claude-clone/src/assets/hero.png)
*Desktop Interface Preview*

## 🛠️ Built With

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🌟 Why EKKA AI?

EKKA AI was built with a single goal: **to create the fastest and most beautiful interface for interacting with Large Language Models.** While many interfaces focus solely on functionality, we believe that the *experience* of AI should be as fluid and inspiring as the technology itself.

- **Speed First**: Leveraging NVIDIA NIM for sub-second response times.
- **Aesthetic Excellence**: A UI that feels premium, utilizing subtle animations and modern design principles.
- **Privacy & Security**: Built on Supabase to ensure your data and sessions are always protected.

## 🚀 Key Features

- **Multi-Model Support**: Seamlessly switch between various LLMs, including Mistral Nemotron and NVIDIA Nemotron models.
- **Claude-style Artifacts**: Dedicated side panel for rendering code, documents, and interactive previews.
- **Real-time Streaming**: Fluid, low-latency message streaming with a custom visual typing effect for a natural feel.
- **Conversation Management**: Full history tracking, renaming, deleting, and exporting of chats.
- **Secure Authentication**: Robust user login and session management powered by Supabase.
- **Rich Markdown Support**: Full support for GFM, LaTeX (via KaTeX), and syntax-highlighted code blocks.
- **Responsive UI**: Beautifully designed with Tailwind CSS, featuring a collapsible sidebar, dark/light modes, and framer-motion animations.
- **Keyboard Shortcuts**: Power-user friendly with integrated shortcuts for quick navigation and actions.

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + /` | Show/Hide Shortcuts |
| `Ctrl + K` | New Chat |
| `Ctrl + B` | Toggle Sidebar |
| `Ctrl + Enter` | Send Message |
| `Esc` | Close Artifact/Panel |

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **State/Auth**: Supabase JS SDK
- **Icons**: Lucide React
- **Content**: React Markdown + rehype-katex + highlight.js

### Backend
- **Runtime**: Node.js (Express)
- **AI Integration**: NVIDIA NIM (OpenAI-compatible API)
- **Middleware**: Morgan, CORS, Express Rate Limit

## 🏁 Getting Started

### Prerequisites
- **Node.js**: v18.x or v20.x (LTS recommended)
- **Package Manager**: npm or yarn
- **Supabase Account**: For authentication and database
- **NVIDIA Developer Account**: To access NVIDIA NIM APIs

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd gemini-calude-ai
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   NVIDIA_API_KEY=your_nvidia_api_key
   FRONTEND_URL=http://localhost:5173
   # Optional: API_KEY=your_openrouter_key
   ```
   Start the server:
   ```bash
   npm start
   ```

3. **Frontend Setup**:
   ```bash
   cd ../claude-clone
   npm install
   ```
   Create a `.env` file in the `claude-clone` folder:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:5000
   ```
   Start the development server:
   ```bash
   npm run dev
   ```

## 🛠️ Troubleshooting

If you encounter issues during setup, check the following:

- **NVIDIA API Key**: Ensure your API key is valid and has access to the models specified in `backend/server.js`.
- **Supabase Configuration**: Verify that your Supabase URL and Anon Key are correctly set in the frontend `.env`.
- **CORS Issues**: If the frontend cannot communicate with the backend, check that `FRONTEND_URL` in the backend `.env` matches your Vite dev server address (usually `http://localhost:5173`).
- **Node Version**: Make sure you are using Node.js v18 or later (`node -v`).

## 📁 Project Structure

- `backend/`: Express server handling LLM API requests and rate limiting.
  - [`server.js`](backend/server.js): Entry point for the Node.js backend.
- `claude-clone/`: React frontend with modular components, hooks, and UI utilities.
  - `src/components/chat/`: Core chat logic (Message, InputArea, Auth).
  - `src/components/layout/`: Structural components (Sidebar, Navbar, ArtifactPanel).
  - `src/components/ui/`: Reusable, animated UI components.
  - `src/hooks/`: Custom React hooks for theme, shortcuts, and data fetching.

## 🗺️ Roadmap

- [x] **Core Chat Functionality**: Real-time streaming and history management.
- [x] **Claude-style Artifacts**: Side panel for code and document previews.
- [ ] **Voice Integration**: Add text-to-speech and speech-to-text capabilities (WIP).
- [ ] **Multi-Modal Support**: Integration with vision-capable models (e.g., Llama 3.2 Vision).
- [ ] **Advanced File Analysis**: Enhanced support for PDF, CSV, and complex document parsing.
- [ ] **Shared Chats**: Generate public, shareable links for conversations.
- [ ] **Plugin System**: Support for custom tools and external API integrations.
- [ ] **Mobile App**: Dedicated mobile version for iOS and Android using React Native.

## 🤝 Contributing

Contributions are welcome! If you'd like to help improve EKKA AI, please follow these steps:

1.  **Fork the Project**
2.  **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3.  **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4.  **Push to the Branch** (`git push origin feature/AmazingFeature`)
5.  **Open a Pull Request**

Please ensure your code follows the existing style and includes appropriate tests.

## 💬 Support

If you have any questions or find a bug, please open an issue in the GitHub repository or contact the project maintainers.

**Give it a star! ⭐**
If you like this project, please consider giving it a star on GitHub. It helps more people discover the project and keeps the maintainers motivated!

## 🌟 Acknowledgments

- [NVIDIA NIM](https://www.nvidia.com/en-us/ai/) for the powerful model inference.
- [Supabase](https://supabase.com/) for the excellent backend-as-a-service, enabling real-time chat persistence and secure auth.
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework.
- [Vite](https://vitejs.dev/) for the ultra-fast development experience.
- The open-source AI community for continuous inspiration.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

Copyright (c) 2026 Het. All rights reserved.


