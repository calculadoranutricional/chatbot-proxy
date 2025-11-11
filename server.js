// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Token de Hugging Face (se configura en Render como variable de entorno)
const HF_API_KEY = process.env.HF_API_KEY;

// Ruta del proxy
app.post("/chat", async (req, res) => {
  try {
    const { inputs } = req.body;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
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

    // Algunos modelos responden con texto plano o JSON
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
    res.status(500).json({
      error: "Error en el servidor proxy",
      details: err.message,
    });
  }
});

// Puerto dinámico (Render asigna PORT automáticamente)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Servidor proxy escuchando en puerto ${PORT}`)
);
