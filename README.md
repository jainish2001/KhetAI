# KhetAI - AI-Powered Farming Assistant

KhetAI is an AI-powered, multilingual web application designed to be a personal farming assistant for Indian farmers.
It provides instant access to crucial information and diagnostics through a simple, conversational interface.


## Overview

The primary goal of KhetAI is to empower farmers by leveraging generative AI to provide timely and accessible information. The application supports multiple Indian languages and offers the following key features:

*   **Conversational AI Agent**: A central, chat-based interface on the homepage where farmers can ask questions in their native language about crop diseases, market prices, and government schemes.
*   **Crop Health Diagnosis**: Farmers can upload a photo of a diseased crop and receive an instant AI-powered diagnosis and treatment recommendations.
*   **Mandi Price Insights**: Get up-to-date market prices for various crops from local markets (mandis), with the location automatically detected or set manually.
*   **Government Scheme Information**: Ask questions about various government agricultural schemes and receive simplified summaries of benefits, eligibility, and application processes.
*   **Multi-language Support**: The entire interface and all AI responses can be translated into several Indian languages.
*   **Persistent User Settings**: User preferences for language and location are saved on the device for a seamless experience.

## Project Structure

The project follows a standard Next.js App Router structure, organizing files by feature and responsibility.

```
khetai-project/
├── src/
│   ├── app/                  # Next.js App Router pages for each feature
│   │   ├── crop-diagnosis/   # Crop Health page
│   │   ├── gov-schemes/      # Government Schemes page
│   │   ├── history/          # User query history page
│   │   ├── mandi-prices/     # Mandi Prices page
│   │   ├── settings/         # Settings and History page
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page (Conversational Agent)
│   │
│   ├── ai/                   # Genkit AI configuration and flows
│   │   ├── flows/            # Server-side AI logic (tools and agents)
│   │   ├── definitions.ts    # Centralized Zod schemas for AI I/O
│   │   └── genkit.ts         # Genkit plugin initialization
│   │
│   ├── components/           # Reusable React components
│   │   └── ui/               # ShadCN UI components
│   │
│   ├── contexts/             # React Context for global state management
│   │   ├── LanguageContext.tsx # Manages app-wide language and translations
│   │   ├── LocationContext.tsx # Manages user's location
│   │   └── HistoryContext.tsx  # Manages user's query history
│   │
│   ├── hooks/                # Custom React hooks
│   │
│   └── lib/                  # Utility functions and libraries
│       ├── translations.ts   # Language translation strings
│       └── utils.ts          # General utility functions
│
├── .env                      # Environment variables (e.g., API keys)
├── next.config.ts            # Next.js configuration
├── package.json              # Project dependencies and scripts
└── tailwind.config.ts        # Tailwind CSS configuration
```

## Tech Stack / Tools Used

*   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **AI/Backend**: [Firebase Genkit](https://firebase.google.com/docs/genkit)
*   **AI Model**: [Google Gemini](https://ai.google/gemini/)
*   **Vertex AI**: [Vertex AI](https://console.cloud.google.com/vertex-ai/)
*   **UI Library**: [React](https://reactjs.org/)
*   **Component Library**: [ShadCN UI](https://ui.shadcn.com/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **State Management**: React Context API
*   **Form Handling**: [React Hook Form](https://react-hook-form.com/)
*   **Schema Validation**: [Zod](https://zod.dev/)

## Setup Guide

Follow these steps to set up and run the project locally.

**1. Clone the Repository**

```bash
git clone https://github.com/jainish2001/KhetAI.git
cd KhetAI
```

**2. Install Dependencies**

```bash
npm install
```

**3. Set Up Environment Variables**

Create a `.env` file in the root of the project:

```bash
cp .env
```

Open the `.env` file and add your Google Gemini API key:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

**4. Run the Development Server**

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.


## Acknowledgements

