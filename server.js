// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Usamos la variable de entorno (tu token de Hugging Face configurado en Render)
const HF_API_KEY = process.env.HF_API_KEY;

// ✅ Ruta principal (para evitar el "Cannot GET /")
app.get("/", (req, res) => {
  res.send("✅ Servidor proxy funcionando correctamente. Usa POST /chat para enviar mensajes.");
});

// ✅ Ruta del proxy
app.post("/chat", async (req, res) => {
  try {
    const { inputs } = req.body;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: "Error en el servidor proxy",
      details: err.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor proxy escuchando en puerto ${PORT}`));
