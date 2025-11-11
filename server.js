// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Token de Hugging Face (configurado en Render)
const HF_API_KEY = process.env.HF_API_KEY;

// Ruta principal opcional (para evitar "Not Found" en navegador)
app.get("/", (req, res) => {
  res.send("✅ Servidor proxy activo. Usa POST /chat para interactuar con el modelo.");
});

// Ruta del proxy
app.post("/chat", async (req, res) => {
  try {
    const { inputs } = req.body;

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Usuario: ${inputs}\nAsistente:`,
        }),
      }
    );

    // Si Hugging Face responde con texto plano o JSON
    const text = await response.text();
    let data;
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

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor proxy escuchando en puerto ${PORT}`));
