import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY
});

app.post("/analyze", upload.any(), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files[0];

    const base64Image = file.buffer.toString("base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image and summarize it clearly." },
            {
              type: "image_url",
              image_url: {
                url: `data:${file.mimetype};base64,${base64Image}`
              }
            }
          ]
        }
      ]
    });

    res.json({
      result: response.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
