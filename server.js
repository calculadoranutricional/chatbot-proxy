// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Tu token de Hugging Face (se configurará en Render)
const HF_API_KEY = process.env.HF_API_KEY;

// Ruta del proxy
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/facebook/blenderbot-400M-distill",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: message }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Error en el servidor proxy:", err);
    res.status(500).json({ error: "Error en el servidor proxy", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor proxy escuchando en puerto ${PORT}`));
