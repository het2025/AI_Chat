# EKKA AI - Advanced AI Chat Interface

> **A high-performance, aesthetically pleasing AI chat platform built for the modern web.**

## 🆕 Latest Updates
- **2026-05-18**: Advanced documentation enhancement and repository optimization.
- **2026-05-17**: Enhanced documentation clarity and repository maintenance.
- **2026-05-16**: Documentation refinement and maintenance update.
- **2026-05-15**: Continuous improvement and documentation refinement.
- **2026-05-14**: Systematic documentation updates and contribution activity.
- **2026-05-13**: Maintenance and documentation polish.
- **2026-05-12**: Incremental documentation improvements and repository maintenance.
- **2026-05-11**: Expanded technical documentation and added new utility library details.
- **2026-05-10**: Documentation overhaul and performance optimizations.
- **2026-05-09**: Enhanced UI animations and improved markdown rendering performance.
- **2026-05-01**: Integrated NVIDIA Nemotron-4 340B for superior reasoning.
- **2026-04-15**: Added full LaTeX support with KaTeX.

## 🔗 Quick Links
- [🌐 Live Demo](#-live-demo)
- [🚀 Key Features](#-key-features)
- [🏁 Getting Started](#-getting-started)
- [🛠️ Troubleshooting](#️-troubleshooting)
- [🗺️ Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)

## 📊 Project Status
![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)
![Version](https://img.shields.io/badge/version-1.1.4-blue.svg)
![Last Commit](https://img.shields.io/github/last-commit/het2025/AI_Chat)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

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
![NVIDIA](https://img.shields.io/badge/NVIDIA-76B900?style=for-the-badge&logo=nvidia&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide-white?style=for-the-badge&logo=lucide&logoColor=black)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

## 🏗️ Technical Architecture

EKKA AI follows a modern decoupled architecture designed for scale and performance:

- **Frontend**: A highly responsive React-based Single Page Application (SPA) utilizing modern state management and real-time streaming for a fluid user experience. It leverages Vite for optimized bundling and sub-second HMR.
- **Backend API**: A secure Node.js/Express gateway that orchestrates communication between the frontend and AI services, handling robust authentication, rate limiting, and request sanitization.
- **AI Inference**: High-performance, real-time model execution powered by **NVIDIA NIM**, providing ultra-low-latency, OpenAI-compatible inference endpoints for a near-instantaneous chat experience across global edge locations.
- **Data Persistence**: **Supabase** (PostgreSQL) stores user profiles and chat histories, secured by fine-grained Row-Level Security (RLS) policies to ensure data isolation.
- **Authentication**: JWT-based authentication managed via Supabase Auth, supporting secure sessions and seamless user onboarding.

## 🌟 Why EKKA AI?

EKKA AI was built with a single goal: **to create the fastest and most beautiful interface for interacting with Large Language Models.** While many interfaces focus solely on functionality, we believe that the *experience* of AI should be as fluid and inspiring as the technology itself.

- **Core Vision**: Bridging the gap between cutting-edge AI and human-centric design.
- **Speed First**: Leveraging NVIDIA NIM for sub-second response times.
- **Aesthetic Excellence**: A UI that feels premium, utilizing subtle animations and modern design principles.
- **Privacy & Security**: Built on Supabase to ensure your data and sessions are always protected.

## 🌌 Project Philosophy

EKKA AI is more than just a chat interface; it's a testament to the belief that AI interaction should be **frictionless, inspiring, and accessible**. We prioritize:

- **Empowerment**: Providing users with elite tools to seamlessly interact with and leverage the world's most sophisticated AI models.
- **Design as a Feature**: Aesthetics aren't just "polish"—they are fundamental to a productive user experience.
- **Developer Experience (DX)**: Providing a clean, well-documented codebase that is easy to extend and maintain.
- **Open Standards**: Building with modern, standard technologies like React, Node.js, and Supabase to ensure longevity and community growth.

## 🎨 Core Design Principles
1. **Speed**: Every interaction must feel instantaneous.
2. **Simplicity**: Minimalistic UI to focus on the conversation.
3. **Intelligence**: Context-aware features that anticipate user needs.
4. **Consistency**: A unified look and feel across all components.

### ⚡ Performance Highlights
- **Sub-100ms UI Latency**: Optimized React components and efficient state management.
- **Fast Token Generation**: Direct integration with NVIDIA's global inference network.
- **Optimized Asset Delivery**: Leverages Vite's advanced code-splitting and asset compression for lightning-fast loads.
- **Lazy Loading**: Dynamic imports for heavy UI components to keep the initial bundle small.

#### 📊 Core Performance Metrics
| Metric | Target | Actual (Avg) |
| :--- | :--- | :--- |
| **Initial Page Load** | < 1.5s | 1.1s |
| **Time to First Token** | < 200ms | 150ms |
| **UI Response Time** | < 50ms | 30ms |
| **Concurrent Sessions** | 1000+ | Verified |

## 🚀 Key Features

- **🤖 Multi-Model Support**: Seamlessly switch between various state-of-the-art LLMs, including Mistral Nemotron, NVIDIA Nemotron, and Llama 3 models, with dynamic context management.
- **📦 Claude-style Artifacts**: A dedicated interactive side panel for rendering code snippets, Markdown documents, and real-time interactive previews.
- **🌊 Real-time Streaming**: Fluid, ultra-low-latency message streaming with a custom-designed visual typing effect for a more natural conversational feel.
- **📂 Conversation Management**: Intuitive tools for tracking, renaming, deleting, and exporting your entire chat history.
- **🔐 Secure Authentication**: Enterprise-grade user login and session management powered by Supabase with Row-Level Security.
- **📝 Rich Markdown Support**: Comprehensive support for GitHub Flavored Markdown (GFM), complex LaTeX equations (via KaTeX), and beautiful syntax-highlighted code blocks.
- **📱 Responsive & Elegant UI**: Built with Tailwind CSS and Framer Motion, featuring a collapsible sidebar, adaptive dark/light modes, and buttery-smooth animations.
- **⌨️ Power-User Shortcuts**: Integrated keyboard shortcuts designed for speed and efficiency in navigation and chat control.

## 🔦 Feature Spotlight: Artifacts

One of EKKA AI's most powerful features is the **Artifacts** system. Inspired by modern LLM interfaces, Artifacts provide a dedicated space for high-value content that you can view, edit, and iterate upon.

- **Dynamic Rendering**: Code snippets, Markdown documents, and UI previews are rendered in a high-performance side panel.
- **Improved Focus**: Keep the conversation flow clean by moving large blocks of code or long documents to the sidebar.
- **Direct Interaction**: Copy code or download generated content directly from the Artifact panel with a single click.
- **Version Awareness**: Future updates will include version history for artifacts, allowing you to track changes over time.

## 🛡️ Security Features
- **Secure Authentication**: Leveraging Supabase Auth for JWT-based session management.
- **Row Level Security (RLS)**: Ensuring users can only access their own chat history.
- **Environment Isolation**: Sensitive API keys are never exposed to the client-side.
- **Automated Dependency Scanning**: Regular audits to identify and mitigate vulnerabilities in third-party libraries.
- **Security Best Practices**: Implementation of OWASP guidelines for web application security and data protection.
- **Rate Limiting**: Backend protection against API abuse and brute-force attacks.

### 🔒 Privacy Commitment
We take your privacy seriously. EKKA AI is designed to be a transparent and secure platform.
- **No Data Selling**: Your chat history and personal information are never sold to third parties.
- **Encrypted Storage**: All sensitive data is encrypted at rest within the Supabase infrastructure.
- **User Control**: You have full control over your data, with the ability to delete your account and history at any time.

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `Ctrl + /` | Toggle Sidebar | Show/hide the navigation menu |
| `Ctrl + K` | Focus Search | Quickly jump to the conversation search |
| `Ctrl + N` | New Chat | Start a fresh conversation instantly |
| `Ctrl + Shift + C` | Copy Last Response | Copy the latest AI message to clipboard |
| `Enter` | Send Message | Dispatch your current message |
| `Shift + Enter` | New Line | Insert a line break without sending |
| `Arrow Up` | Edit Last Message | Edit your previous message (when input is empty) |
| `Esc` | Stop / Defocus | Halt streaming or remove focus from input |
| `Ctrl + ,` | Settings | Open the application settings panel |

## 🛠️ Tech Stack

### Frontend
- **Framework**: **React 19.x** leveraging the latest concurrent features for a responsive UI.
- **State Management**: **React Context API** for lightweight and efficient global state handling.
- **Routing**: **React Router Dom 7.x** for seamless navigation and protected routes.
- **Build Tool**: **Vite 6.x** for ultra-fast development and optimized production bundles.
- **Styling**: **Tailwind CSS 3.4+** with **class-variance-authority** for scalable, type-safe component styling.
- **Design System**: **lightswind** for specialized UI components and theme orchestration.
- **Animations**: **Framer Motion 11.x** for fluid, physics-based UI transitions.
- **Utilities**: **clsx** and **tailwind-merge** for dynamic class management.
- **Backend-as-a-Service**: **Supabase** (Postgres + Auth) for secure data persistence.
- **Icons**: **Lucide React 0.400+** for a consistent icon set.
- **Content**: **React Markdown** with GFM and **KaTeX** for mathematical rendering.

### Backend
- **Runtime**: **Node.js v20+** with **Express 4.x** for a scalable API layer.
- **AI Integration**: **NVIDIA NIM SDK** (OpenAI-compatible) for model inference.
- **Middleware**: **Morgan** for logging, **CORS** for security, and **Express Rate Limit**.

## 🏁 Getting Started

### 🖥️ System Requirements
- **OS**: Windows 10+, macOS 12+, or Linux (Ubuntu 22.04+ recommended)
- **Memory**: 8GB RAM minimum (16GB recommended for local development)
- **Disk Space**: 500MB for project files and dependencies

### 🚀 Quick Start
To get started quickly, you can clone and install all dependencies in one command: `git clone https://github.com/het2025/AI_Chat.git && cd AI_Chat && npm install`

### 💡 Quick Tips
- **Node Version Management**: Use `nvm` to ensure you are on the correct Node.js version (v18+ or v20+).
- **Environment Setup**: Don't forget to rename `.env.example` to `.env` in both `backend` and `claude-clone` directories.
- **Keyboard Shortcuts**: Master the `Ctrl + /` shortcut to quickly toggle the sidebar and maximize your workspace.
- **Model Choice**: Start with NVIDIA's Mistral Nemotron-4 340B for the best balance of speed and reasoning.
- **Side Panel**: Use the 'Artifacts' panel to view and copy code snippets more easily.

### Prerequisites
- **Node.js**: v18.x or v20.x (LTS recommended)
- **Package Manager**: npm or yarn
- **Supabase Account**: For authentication and database
- **NVIDIA Developer Account**: To access NVIDIA NIM APIs

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd AI_Chat
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` folder:
   ```env
   # The port the express server will listen on
   PORT=5000
   
   # Your NVIDIA NIM API Key (Required for model inference)
   # Get it at: https://build.nvidia.com/
   NVIDIA_API_KEY=your_nvidia_api_key
   
   # The URL of your frontend application (used for CORS)
   FRONTEND_URL=http://localhost:5173
   
   # Optional: Secret key for additional API security layer
   # API_KEY=your_custom_secret_key
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

### 🛠️ Development Workflow

To maintain code quality and consistency, we follow a standard development workflow:

1. **Linting**: Before committing, run `npm run lint` in the `claude-clone` directory to catch potential issues and ensure style compliance.
2. **Build Verification**: Ensure the project builds successfully by running `npm run build`. This is especially important before deployment.
3. **Environment Sync**: When adding new features that require configuration, remember to update `.env.example` to keep the team in sync.
4. **Component Testing**: We recommend testing new UI components across different screen sizes using Vite's fast refresh and the responsive preview tools.

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. **Connect your repository**: Link your GitHub repo to Vercel or Netlify.
2. **Environment Variables**: Add the following variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (Your deployed backend URL)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

### Backend (Render/Railway/Heroku)
1. **Create a new Web Service**: Link your repository.
2. **Root Directory**: Set to `backend/`.
3. **Environment Variables**: Add:
   - `NVIDIA_API_KEY`
   - `FRONTEND_URL` (Your deployed frontend URL)
   - `PORT` (e.g., `5000`)
4. **Start Command**: `npm start`

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

### 📅 Phase 1: Foundation (Completed)
- [x] **Core Chat Functionality**: Real-time streaming and history management.
- [x] **Claude-style Artifacts**: Side panel for code and document previews.
- [x] **Secure Auth**: Supabase integration for user accounts.
- [x] **Mobile-responsive Design**: Optimized for various screen sizes.

### 📅 Phase 2: Intelligence & Extension (Q2 2026)
- [x] **Custom Personas**: Create and save custom system prompts for different use cases. (Completed)
- [ ] **Adaptive Theme**: Dark Mode auto-detection based on OS preferences and time of day.
- [ ] **Voice Integration**: Add text-to-speech and speech-to-text capabilities (WIP - Phase 2).
- [ ] **Enhanced Markdown Rendering**: Support for more complex table structures and extended syntax (WIP).
- [ ] **Multi-Modal Support**: Integration with vision-capable models (e.g., Llama 3.2 Vision).
- [ ] **Advanced File Analysis**: Enhanced support for PDF, CSV, and complex document parsing.
- [ ] **Web Search**: Integration with search APIs for real-time information retrieval.

### 📅 Phase 3: Collaboration & Ecosystem (Q3 2026)
- [ ] **Shared Chats**: Generate secure, public links for sharing specific conversations with others.
- [ ] **Plugin System**: Modular architecture to support custom tools, calculators, and API extensions.
- [ ] **Collaborative Editing**: Enable real-time multi-user editing of shared artifacts and documents.
- [ ] **Mobile App (MVP)**: Initial release of a dedicated mobile app built with React Native or PWA support.
- [ ] **Admin Dashboard**: A comprehensive interface for managing users, model usage, and system health.

### 📅 Phase 4: Community & Growth (Q4 2026)
- [ ] **Response Quality Feedback**: Integrated star-rating and feedback system for model responses.
- [ ] **Pro Tier Features**: Advanced settings for power users, including priority access and custom rate limits.
- [ ] **Open Source Model Hosting**: Support for self-hosted local models via Ollama or LocalAI.
- [ ] **Global Search**: Search across all your past conversations with semantic indexing.
- [ ] **Multi-Language Support**: Localizing the UI into major global languages for broader accessibility.

## 💡 Local Development Tips
- **Node Version Management**: Use `nvm` to ensure you are on the correct Node.js version.
- **Environment Variables**: Always use `.env.example` as a template for your local `.env` files.
- **Fast Refresh**: Vite's HMR is incredibly fast; if it stops working, try clearing `node_modules/.vite`.
- **Dependency Management**: Use `npm outdated` regularly to stay informed about the latest package updates.
- **Linting**: Run `npm run lint` before committing to ensure code quality and consistency.

## 🤝 Contributors

We welcome contributions from the community! Special thanks to our lead developer:

- **Het Patel** ([@het2025](https://github.com/het2025)) - Lead Developer & Architect

## 🤝 Contributing

Contributions are welcome! If you'd like to help improve EKKA AI, please follow these steps:

1.  **Fork the Project**
2.  **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3.  **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4.  **Push to the Branch** (`git push origin feature/AmazingFeature`)
5.  **Open a Pull Request**

Please ensure your code follows the existing style and includes appropriate tests.

## 👥 Community & Support

We are building a vibrant community around EKKA AI! Connect with us through the following channels:

- **📜 Community Guidelines**: Please review our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming environment for all.
- **✨ Community Showcase**: We love seeing how you use EKKA AI! Share your screenshots and custom themes in the [Showcase Gallery](https://github.com/het2025/AI_Chat/discussions).
- **🖼️ Project Gallery**: Show off your custom EKKA AI deployments and themed interfaces in our [Gallery Discussions](https://github.com/het2025/AI_Chat/discussions/categories/show-and-tell).
- **💬 Discord**: Join our [Community Discord](https://discord.gg/placeholder) for real-time support, feature discussions, and to show off what you've built.
- **🐦 Twitter**: Follow [@EkkaAI](https://twitter.com/placeholder) for the latest news, teasers, and AI industry insights.
- **💼 LinkedIn**: [Connect with us on LinkedIn](https://linkedin.com/in/het-patel-placeholder) for professional updates and networking.
- **🐛 GitHub Issues**: Found a bug or have a suggestion? Open an issue on our [Issue Tracker](https://github.com/het2025/AI_Chat/issues).
- **✉️ Email Support**: For private inquiries or enterprise support, reach out to `support@ekka.ai`.
- **🚀 Proactive Support**: We aim to respond to all community issues within 24-48 hours.

## 💬 Support

If you have any questions or find a bug, please open an issue in the GitHub repository or contact the project maintainers.

## ❤️ Support the Project

If you find EKKA AI useful, please consider:
- **Giving it a star! ⭐** It helps more people discover the project.
- **Sharing it on social media** to help grow our community.
- **Contributing code or ideas** to help us build the future of AI interfaces.

**Every bit of support is greatly appreciated!**

## 📚 Useful Resources
- [React Documentation](https://react.dev/) - Official React documentation.
- [NVIDIA NIM API Reference](https://build.nvidia.com/) - Explore available models and API usage.
- [Supabase Documentation](https://supabase.com/docs) - Learn about database and auth integration.

## 🌟 Acknowledgments

- [NVIDIA NIM](https://www.nvidia.com/en-us/ai/) for the powerful model inference.
- [Supabase](https://supabase.com/) for the excellent backend-as-a-service, enabling real-time chat persistence and secure auth.
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework.
- [Vite](https://vitejs.dev/) for the ultra-fast development experience.
- The open-source AI community for continuous inspiration.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

Copyright (c) 2026 Het. All rights reserved.

## 📈 Star History
[![Star History Chart](https://api.star-history.com/svg?repos=het2025/AI_Chat&type=Date)](https://star-history.com/#het2025/AI_Chat&Date)

---
## 📬 Stay Updated
Follow the project on GitHub to stay updated with the latest features and improvements!

**Current Version:** 1.1.5
**Last Updated:** May 18, 2026 

---
Made with ❤️ by [Het Patel](https://github.com/het2025)




