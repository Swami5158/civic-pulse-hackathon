import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";

const db = new Database("civic_pulse.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    category TEXT,
    severity TEXT,
    status TEXT DEFAULT 'reported',
    lat REAL,
    lng REAL,
    phone TEXT,
    photo_url TEXT,
    sentiment TEXT,
    language TEXT,
    resolution_time_est INTEGER,
    ward_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    issue_id TEXT,
    status TEXT,
    comment TEXT,
    officer_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(issue_id) REFERENCES issues(id)
  );
`);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  app.use(express.json({ limit: '10mb' }));

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  // AI Service Helpers
  async function classifyIssue(title: string, description: string, photoBase64?: string) {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Classify this civic issue. 
      Title: ${title}
      Description: ${description}
      
      Return JSON with:
      - category: (infrastructure, sanitation, water_supply, electricity, roads, public_safety, others)
      - severity: (low, medium, high, critical)
      - sentiment: (frustrated, neutral, urgent, angry)
      - language: detected language
      - resolution_time_est: estimated hours to fix (integer)
      - ward_id: suggest a ward ID (W1 to W15) based on context or randomly if unknown
      - verification: if photo provided, does it match the description? (boolean)
    `;

    const parts: any[] = [{ text: prompt }];
    if (photoBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: photoBase64.split(',')[1] || photoBase64
        }
      });
    }

    try {
      const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              severity: { type: Type.STRING },
              sentiment: { type: Type.STRING },
              language: { type: Type.STRING },
              resolution_time_est: { type: Type.INTEGER },
              ward_id: { type: Type.STRING },
              verification: { type: Type.BOOLEAN }
            },
            required: ["category", "severity", "sentiment", "language", "resolution_time_est", "ward_id"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("AI Classification Error:", e);
      return {
        category: "others",
        severity: "medium",
        sentiment: "neutral",
        language: "en",
        resolution_time_est: 48,
        ward_id: "W1"
      };
    }
  }

  // API Routes
  app.post("/api/issues", async (req, res) => {
    const { title, description, lat, lng, phone, photo } = req.body;
    const aiResult = await classifyIssue(title, description, photo);
    
    const id = `CIV-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const stmt = db.prepare(`
      INSERT INTO issues (id, title, description, category, severity, lat, lng, phone, photo_url, sentiment, language, resolution_time_est, ward_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, title, description, aiResult.category, aiResult.severity, lat, lng, phone, photo || null, aiResult.sentiment, aiResult.language, aiResult.resolution_time_est, aiResult.ward_id);

    const issue = db.prepare("SELECT * FROM issues WHERE id = ?").get(id);
    io.emit("new_issue", issue);
    
    res.json(issue);
  });

  app.get("/api/issues/track/:phone", (req, res) => {
    const issues = db.prepare("SELECT * FROM issues WHERE phone = ? ORDER BY created_at DESC").all(req.params.phone);
    res.json(issues);
  });

  app.get("/api/issues/:id", (req, res) => {
    const issue = db.prepare("SELECT * FROM issues WHERE id = ?").get(req.params.id);
    const updates = db.prepare("SELECT * FROM updates WHERE issue_id = ? ORDER BY created_at DESC").all(req.params.id);
    res.json({ ...issue, updates });
  });

  app.get("/api/stats", (req, res) => {
    const total = db.prepare("SELECT COUNT(*) as count FROM issues").get().count;
    const resolved = db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'resolved'").get().count;
    const critical = db.prepare("SELECT COUNT(*) as count FROM issues WHERE severity = 'critical'").get().count;
    const open = total - resolved;

    const categories = db.prepare("SELECT category, COUNT(*) as count FROM issues GROUP BY category").all();
    const wards = db.prepare("SELECT ward_id, COUNT(*) as count FROM issues GROUP BY ward_id").all();
    const recent = db.prepare("SELECT * FROM issues ORDER BY created_at DESC LIMIT 10").all();

    res.json({ total, resolved, critical, open, categories, wards, recent });
  });

  app.post("/api/issues/:id/status", (req, res) => {
    const { status, comment, officer_name } = req.body;
    db.prepare("UPDATE issues SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, req.params.id);
    db.prepare("INSERT INTO updates (issue_id, status, comment, officer_name) VALUES (?, ?, ?, ?)").run(req.params.id, status, comment, officer_name);
    
    const updatedIssue = db.prepare("SELECT * FROM issues WHERE id = ?").get(req.params.id);
    io.emit("issue_updated", updatedIssue);
    res.json(updatedIssue);
  });

  // Crisis Detection
  app.get("/api/crisis", (req, res) => {
    // Detect clusters: 3+ issues within 0.005 lat/lng radius in last 6 hours
    const issues = db.prepare(`
      SELECT * FROM issues 
      WHERE created_at > datetime('now', '-6 hours')
      AND status != 'resolved'
    `).all();

    const clusters = [];
    const visited = new Set();

    for (let i = 0; i < issues.length; i++) {
      if (visited.has(issues[i].id)) continue;
      const cluster = [issues[i]];
      for (let j = i + 1; j < issues.length; j++) {
        const dist = Math.sqrt(Math.pow(issues[i].lat - issues[j].lat, 2) + Math.pow(issues[i].lng - issues[j].lng, 2));
        if (dist < 0.005) {
          cluster.push(issues[j]);
          visited.add(issues[j].id);
        }
      }
      if (cluster.length >= 3) {
        clusters.push({
          center: { lat: issues[i].lat, lng: issues[i].lng },
          count: cluster.length,
          category: issues[i].category,
          issues: cluster
        });
      }
    }
    res.json(clusters);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
