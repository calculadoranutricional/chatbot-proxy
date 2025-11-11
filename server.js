// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Token de Hugging Face (lo configurás en Render)
const HF_API_KEY = process.env.HF_API_KEY;

// 🧠 Ruta del modelo Gemma 2B
const MODEL_URL = "https://router.huggingface.co/hf-inference/models/google/gemma-2-2b-it";

// ✅ Endpoint principal del proxy
app.post("/chat", async (req, res) => {
  try {
    const { inputs } = req.body;

    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `Usuario: ${inputs}\nAsistente:`,
      }),
    });

    const text = await response.text();
    let data;

    // Si Hugging Face devuelve texto en lugar de JSON, lo manejamos igual
    try {
      data = JSON.parse(text);
    } catch {
      data = [{ generated_text: text }];
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Error en el servidor proxy:", err);
    res.status(500).json({ error: "Error en el servidor proxy", details: err.message });
  }
});

// ✅ Ruta base opcional (para verificar que el servidor corre)
app.get("/", (req, res) => {
  res.send("✅ Servidor proxy activo — modelo Gemma 2B listo para usar.");
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor proxy escuchando en puerto ${PORT}`));
