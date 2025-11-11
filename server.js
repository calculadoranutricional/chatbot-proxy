// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const HF_API_KEY = process.env.HF_API_KEY;

// ✅ Ruta principal opcional para pruebas
app.get("/", (req, res) => {
  res.send("Servidor proxy activo. Usa /chat para comunicarte con el modelo 🤖");
});

// ✅ Ruta del proxy
app.post("/chat", async (req, res) => {
  try {
    const { inputs } = req.body;
    if (!inputs) {
      return res.status(400).json({ error: "Falta el campo 'inputs' en el cuerpo del request." });
    }

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/facebook/blenderbot-400M-distill",
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

    // ⚠️ Manejo de errores de Hugging Face
    if (data.error) {
      console.error("Error de Hugging Face:", data.error);
      return res.status(500).json({ error: "Error en Hugging Face", details: data });
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Error en el servidor proxy:", err);
    res.status(500).json({ error: "Error en el servidor proxy", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor proxy escuchando en puerto ${PORT}`));
