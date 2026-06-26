import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateTestCasesFromStory } from "./aiService.js";

dotenv.config();

const app = express();
const port = process.env.PORT ?? 3001;

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "*")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? true : allowedOrigins,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/generate-testcases", async (req, res) => {
  try {
    const { userStory, options } = req.body ?? {};

    if (!userStory?.title) {
      res.status(400).json({ error: "userStory.title is required." });
      return;
    }

    const testCases = await generateTestCasesFromStory(userStory, options ?? {});
    res.json({ testCases });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed.",
    });
  }
});

app.listen(port, () => {
  console.log(`AI Test Case Generator API listening on port ${port}`);
});
