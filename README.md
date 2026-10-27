# SatyaGuard — AI Misinformation & Scam Defense Shield

> *Hacktoberfest Hack Day Chandigarh 2026 Submission*  
> *Theme:* Social Implications of Technology  
> *Track:* DigitalOcean Open-Source AI 

---

## Problem Statement
In today's digital ecosystem, fake news, doctored circulars, and fraudulent messaging forwards cause severe real-world harm—ranging from financial fraud and phishing scams to civil panic. Vulnerable communities often lack accessible tools to verify suspicious claims or counter misinformation in community chat groups.

## Solution
*SatyaGuard* is a full-stack, AI-driven verification dashboard that analyzes text claims and screenshot forwards to detect misinformation, financial scams, and psychological manipulation triggers. Instead of just flagging content, it generates a polite, shareable *Debunk Card* with citations ready to copy-paste into family and community chat groups.

---

## Key Features

*  *Multi-Format Input:* Paste news headlines, forwarded text, or upload screenshots of fake notices.
*  *Trust Index & Risk Score:* Get an objective 0–100% Trust Score paired with a clear Risk Severity Level (CRITICAL, HIGH, MODERATE, LOW).
*  *Cognitive Manipulation Detection:* Identifies urgency flags, emotional panic triggers, and financial fraud patterns.
*  *WhatsApp Counter-Fact Card:* Generates a polite 2-sentence debunk summary to easily counter misinformation without causing friction.
*  *Public Scam Feed:* Automatically archives verified scams in MongoDB Atlas to create a searchable community awareness bulletin.

---

## Tech Stack

* *Frontend:* HTML5, CSS3, Vanilla JavaScript, EJS (Embedded JavaScript Templates)
* *Backend:* Node.js, Express.js
* *File Uploads:* Multer (Middleware for processing image screenshots)
* *Database:* MongoDB Atlas (Mongoose schema modeling)
* *AI Model Engine:* Open-Source LLM (Gemma / Llama via Groq / Ollama API)

---


