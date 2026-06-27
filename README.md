# Incident Response Agent

An AI agent that remembers every past incident and fix using Hindsight memory.

## What it does
- Responds to technical incidents with AI
- Saves every incident to Hindsight memory
- Recalls similar past incidents automatically
- Gets smarter with every incident reported

## Setup
1. Clone the repo
2. Run `npm install`
3. Create `.env` file with your keys (see instructions)
4. Run `node index.js`
5. Open http://localhost:3000

## Tech Stack
- Node.js + Express
- Groq LLM (llama-3.3-70b)
- Hindsight for persistent agent memory
