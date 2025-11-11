// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Token de Hugging Face (lo configurás como variable de entorno en Render)
const HF_API_KEY = process.env.HF_API_KEY;

// ✅ Ruta del proxy
app.post("/chat", async (req, res) => {
  try {
    const { inputs } = req.body;

    // Petición a la API moderna de Hugging Face
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Usuario: ${inputs}\nAsistente:`,
        }),
      }
    );

    // 📦 A veces la respuesta es texto plano o streaming
    const text = await response.text();
    let data;

    // Intentamos parsear JSON
    try {
      data = JSON.parse(text);
    } catch {
      // Si no se puede, lo devolvemos como texto
      data = [{ generated_text: text }];
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Error en el servidor proxy:", err);
    res
      .status(500)
      .json({ error: "Error en el servidor proxy", details: err.message });
  }
});

// ✅ Respuesta visible para GET /
app.get("/", (req, res) => {
  res.send("Servidor proxy activo 🚀 — usa POST /chat para comunicarte con el modelo.");
});

// 🟢 Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Servidor proxy escuchando en puerto ${PORT}`)
);
