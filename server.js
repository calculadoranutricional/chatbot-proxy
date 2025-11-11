// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Token de Hugging Face (configurado en Render)
const HF_API_KEY = process.env.HF_API_KEY;

// 🧩 Ruta del proxy
app.post("/chat", async (req, res) => {
  try {
    const { inputs } = req.body;

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/gpt2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs }),
      }
    );

    // ✅ Procesar respuesta (maneja texto plano o JSON)
    const rawText = await response.text();

    if (!response.ok) {
      console.error("❌ Error desde Hugging Face:", rawText);
      return res.status(response.status).json({
        error: "Error desde Hugging Face",
        status: response.status,
        details: rawText,
      });
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      // Si no es JSON válido, devolvemos texto crudo
      data = [{ generated_text: rawText }];
    }

    res.json(data);
  } catch (err) {
    console.error("⚠️ Error en el servidor proxy:", err);
    res.status(500).json({
      error: "Error en el servidor proxy",
      details: err.message,
    });
  }
});

// 🚀 Servidor en Render (usa el puerto asignado)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Servidor proxy escuchando en puerto ${PORT}`)
);
