const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { OpenAI } = require("openai");
const Tesseract = require("tesseract.js");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const imageBuffer = req.file.buffer;

    const { data: { text } } =
      await Tesseract.recognize(imageBuffer, "eng");

    if (!text.trim()) {
      return res.json({ summary: "No readable text found." });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Summarize academically in 5 bullet points." },
        { role: "user", content: text }
      ]
    });

    res.json({
      extracted: text,
      summary: response.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({ error: "Error processing file." });
  }
});

app.listen(process.env.PORT || 3000);
