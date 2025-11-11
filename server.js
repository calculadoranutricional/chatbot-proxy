// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Tu token de Hugging Face (configurado en Render)
const HF_API_KEY = process.env.HF_API_KEY;

// ✅ Ruta raíz opcional para verificar que el servidor está corriendo
app.get("/", (req, res) => {
  res.send("✅ Servidor proxy para Hugging Face activo. Usa POST /chat");
});

// ✅ Ruta del proxy (POST)
app.post("/chat", async (req, res) => {
  try {
    const { inputs } = req.body;
    if (!inputs) return res.status(400).json({ error: "Falta el campo 'inputs'." });

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/google/gemma-2b-it",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: inputs,
          parameters: { max_new_tokens: 200 },
        }),
      }
    );

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
