# KhetAI - AI-Powered Farming Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

KhetAI is an AI-powered, multilingual web application designed to be a personal farming assistant for Indian farmers. It provides instant access to crucial information and diagnostics through a simple, conversational interface.

![KhetAI Screenshot](https://placehold.co/800x450.png?text=KhetAI+App+Screenshot)

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
git clone https://github.com/your-username/khetai-project.git
cd khetai-project
```

**2. Install Dependencies**

```bash
npm install
```

**3. Set Up Environment Variables**

Create a `.env` file in the root of the project by copying the example:

```bash
cp .env.example .env
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

## Usage Instructions

Once the application is running:
1.  **Set Your Language and Location**: Use the selectors in the top-right corner to choose your preferred language and set your city. You can either allow the browser to detect your location or enter it manually.
2.  **Interact with the AI Agent**: On the home page, type or speak your question into the chatbox. You can ask about:
    *   Mandi prices: "What is the price of tomatoes in Pune?"
    *   Government schemes: "Tell me about the PM Fasal Bima Yojana."
    *   Crop diseases: "My corn leaves have yellow spots, what could it be?"
3.  **Use Specific Features**: Navigate to the dedicated pages using the sidebar for more structured interactions, such as uploading an image for crop diagnosis.
4.  **View History**: Go to the "Settings" page to see a history of your past queries and their results.

## Contributing Guidelines

Contributions are welcome! If you'd like to contribute to the project, please follow these steps:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/my-new-feature` or `git checkout -b fix/issue-number`.
3.  **Make your changes** and commit them with a clear and descriptive commit message.
4.  **Push your changes** to your forked repository.
5.  **Create a Pull Request** to the `main` branch of the original repository.

Please ensure your code follows the existing code style and all tests pass.

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

## Acknowledgements

*   This project was bootstrapped with [Firebase Studio](https://firebase.google.com/studio).
*   UI components from [ShadCN UI](https://ui.shadcn.com/).
*   Icons by [Lucide React](https://lucide.dev/guide/packages/lucide-react).