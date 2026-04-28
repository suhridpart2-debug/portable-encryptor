# Portable Encryptor 🛡️

**Portable Encryptor** is a premium, high-security encryption system designed for ultimate privacy. It uses a **Zero-Knowledge Architecture**, ensuring that your files are encrypted client-side and your keys never leave your device.

This project consists of a modern **Next.js Web Interface** and a powerful **Python CLI**.

---

## 🚀 Quick Start Guide

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.9 or higher)
- A [Supabase](https://supabase.com/) account (Free tier works perfectly)

---

### 2. Database Setup (Supabase)
1. **Create Project**: Log in to Supabase and create a new project.
2. **Database Schema**: 
   - Go to the **SQL Editor** in your Supabase dashboard.
   - Copy the contents of the `supabase_schema.sql` file from this repository.
   - Paste and **Run** the query to create the necessary tables and security policies.
3. **Get API Keys**:
   - Go to **Project Settings > API**.
   - Copy your `Project URL` and `anon public` key.

---

### 3. Environment Configuration
Create a file named `.env.local` in the root directory of the project and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
GROQ_API_KEY=your_groq_key_here
```

---

### 4. Running the Web Application (Frontend)
Open your terminal in the project root and run:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```
The app will be available at [http://localhost:3000](http://localhost:3000).

---

### 5. Running the Python CLI (Terminal)
Open a new terminal window and navigate to the `cli` folder:

```bash
# Go to the cli directory
cd cli

# Create a virtual environment (Recommended)
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install CLI dependencies
pip install -r requirements.txt

# Run the CLI
python main.py --help
```

---

## ✨ Features

- 🔐 **AES-256-GCM Encryption**: The gold standard for secure data encryption.
- 🌐 **Client-Side Crypto**: All encryption happens in your browser. No plaintext data is ever sent to the cloud.
- ⚡ **AI Analysis**: Powered by Groq (Llama 4 Vision) for ultra-fast, intelligent file summaries.
- 📱 **Responsive Design**: Premium dark-mode UI built with Tailwind CSS and Framer Motion.
- 🛠️ **Cross-Platform CLI**: Manage your encrypted files directly from your terminal.

## 📁 Project Structure

- `/src`: Next.js frontend application (App Router).
- `/cli`: Python-based command-line encryption tools.
- `supabase_schema.sql`: Database initialization script.
- `.env.local`: Configuration for API keys (Ignored by Git).

## 🔒 Security for Viva
- **PBKDF2 Key Derivation**: Passwords are stretched using 100,000 iterations to prevent brute-force attacks.
- **Zero-Knowledge**: The server only stores metadata. Your encryption keys stay with you.
- **Authenticated Encryption**: AES-GCM ensures both confidentiality and integrity of your files.

---

## 📄 License
This project is part of the Final Year PBL curriculum. Built for educational and security research purposes.
