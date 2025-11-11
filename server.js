// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Token de Hugging Face
const HF_API_KEY = process.env.HF_API_KEY;

// 🟢 Mensaje cuando entras a la raíz "/"
app.get("/", (req, res) => {
  res.send("✅ Proxy activo. Usa POST /chat para comunicarte con el modelo Falcon-7B-Instruct.");
});

// 🟢 Ruta principal del chat
app.post("/chat", async (req, res) => {
  try {
    const { inputs } = req.body;

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/tiiuae/falcon-7b-instruct",
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

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = [{ generated_text: text }];
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Error desde Hugging Face",
        status: response.status,
        details: data,
      });
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

// 🟡 Mensaje para rutas no definidas (ejemplo: /chat GET o cualquier otra)
app.use((req, res) => {
  res.status(404).send("⚠️ Ruta no encontrada. Usa POST /chat para enviar mensajes al modelo Falcon.");
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor proxy escuchando en puerto ${PORT}`));
