import express from "express";
import { createServer as createViteServer } from "vite";
import { Groq } from "groq-sdk";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";

dotenv.config();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  app.use(express.json());

  const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

  // In-memory state for sessions
  const sessions: Record<string, { content: string }> = {};

  io.on("connection", (socket) => {
    socket.on("join-session", (sessionId) => {
      socket.join(sessionId);
      if (sessions[sessionId]) {
        socket.emit("canvas-update", sessions[sessionId].content);
      }
    });

    socket.on("update-canvas", ({ sessionId, content }) => {
      sessions[sessionId] = { content };
      socket.to(sessionId).emit("canvas-update", content);
    });
  });

  // Groq Failover/Speed Layer API
  app.post("/api/groq", async (req, res) => {
    if (!groq) {
      return res.status(500).json({ error: "Groq API key not configured" });
    }

    try {
      const { prompt, model = "llama3-70b-8192" } = req.body;
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: model,
      });

      res.json({ text: completion.choices[0]?.message?.content || "" });
    } catch (error: any) {
      console.error("Groq Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
