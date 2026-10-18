# Resume Parser (Gemini)

Turn any resume into clean, structured JSON. Upload a PDF or paste raw text, and Google Gemini extracts the name, contact details, skills, education, experience and projects.

**Live demo:** _add your Vercel link here after deploying_

## Features

- Upload a PDF or paste resume text
- Structured output enforced with a JSON schema
- Summary view and raw JSON view
- Copy or download the JSON
- Clean, minimal interface

## Tech stack

- Next.js (App Router) and TypeScript
- Tailwind CSS
- Google Gemini API (`@google/genai`) with structured output
- Deployed on Vercel

## How it works

1. The browser sends the PDF or text to the `/api/parse` route.
2. The server calls Gemini with a prompt and a response schema.
3. Gemini returns JSON that matches the schema.
4. The UI shows it as a summary, or as raw JSON you can copy or download.

The API key stays on the server and is never sent to the browser.

## Run locally

```bash
git clone https://github.com/Pragathi-Gupta/resume-parser-gemini.git
cd resume-parser-gemini
npm install
```

Create a `.env.local` file in the project root:

```
GEMINI_API_KEY=your_key_here
```

Get a free key from [Google AI Studio](https://aistudio.google.com). Then start the app:

```bash
npm run dev
```

Open http://localhost:3000.

## Example output

```json
{
  "name": "Hayden Smith",
  "email": "haydensmith@email.com",
  "skills": ["Customer service", "Teamwork", "Communication"],
  "education": [],
  "experience": []
}
```

## Notes

- PDFs are limited to 4 MB.
- Built for the Google AI Hands-on Workshop (Google AI Studio session).