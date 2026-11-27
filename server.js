// server.ts
import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
var isProd = process.env.NODE_ENV === "production" || __filename.endsWith("server.js");
app.use(express.json({ limit: "10mb" }));
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
app.post("/api/flutter/assist", async (req, res) => {
  try {
    const { prompt, mode, currentCode, stateManagement } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const systemInstruction = `You are FlutterCraft, an expert Senior Flutter & Dart Software Architect and Google Developer Expert (GDE) in Flutter.
Your goal is to assist developers in writing clean, sound, idiomatic Dart code and high-performance Flutter applications.
Follow these rules:
1. Always write modern Dart code with Sound Null Safety (Dart 3+ features like records, pattern matching, sealed classes, and class modifiers when applicable).
2. Follow clean architecture, single responsibility principle, and standard Flutter conventions.
3. Support requested state management libraries (Riverpod 2.0 with annotations/Notifier, Flutter BLoC/Cubit, Provider, Signals, or setState).
4. Return responses structured cleanly. Use standard markdown formatting for code blocks (\`\`\`dart ... \`\`\`).
5. Include helpful explanatory comments explaining state handling, widget lifecycles, and performance optimizations (like const constructors, RepaintBoundary, and ListView.builder).`;
    let userMessage = prompt;
    if (mode === "refactor") {
      userMessage = `Refactor the following Dart/Flutter code to use best practices, sound null safety, and ${stateManagement || "Riverpod"}:

\`\`\`dart
${currentCode}
\`\`\`

Request: ${prompt}`;
    } else if (mode === "convert_state") {
      userMessage = `Convert this Flutter widget code to use ${stateManagement || "Riverpod 2.0"}:

\`\`\`dart
${currentCode}
\`\`\`

Specific instructions: ${prompt}`;
    } else if (mode === "explain_debug") {
      userMessage = `Debug and explain any issues or errors in this Dart/Flutter code:

\`\`\`dart
${currentCode}
\`\`\`

Problem/Error: ${prompt}`;
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.2
      }
    });
    res.json({
      result: response.text
    });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate Flutter response from AI"
    });
  }
});
if (!isProd) {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
} else {
  const distPath = path.resolve(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
app.listen(PORT, "0.0.0.0", () => {
  console.log(`RYGN Flutter Studio Server running on http://0.0.0.0:${PORT}`);
});
