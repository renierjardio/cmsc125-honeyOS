# Next.js + Tauri Desktop App

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app), and packaged as a cross-platform desktop application using [Tauri](https://tauri.app/).

## 🚀 Getting Started

### 1. Install Dependencies

Before running the app, make sure you have all necessary dependencies installed:

```bash
npm install
```

> Make sure you have [Rust](https://www.rust-lang.org/tools/install), [Node.js](https://nodejs.org/), and [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites) installed for your operating system.

### 2. Start the App in Development Mode

Run the Tauri development server:

```bash
npm run tauri dev
```

This will:
- Start the Next.js development server
- Launch the Tauri application window using the local server

You can also access the app in your browser at [http://localhost:3000](http://localhost:3000), but the full experience is designed for the Tauri shell.

## 🛠 Project Structure

- `app/page.tsx`: Main page entry for your Next.js frontend.
- `src-tauri/`: Tauri backend configuration and Rust source files.
- `public/`: Static assets.
- `styles/`: Global and module-level CSS.

## ✨ Features

- ✅ Cross-platform desktop app with web technologies
- ⚡ Fast development with Next.js hot reloading
- 🔐 Secure and lightweight using Tauri
- 🎨 Optimized font loading with [`next/font`](https://nextjs.org/docs/basic-features/font-optimization)

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs) – Learn about Next.js features and API.
- [Tauri Documentation](https://tauri.app/v1/guides/) – Learn how to build desktop apps with Tauri.
- [Rust Language Book](https://doc.rust-lang.org/book/) – Learn the Rust programming language (used in Tauri backend).
- [Next.js GitHub](https://github.com/vercel/next.js)
- [Tauri GitHub](https://github.com/tauri-apps/tauri)
