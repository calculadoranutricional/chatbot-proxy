import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Token de Hugging Face (lo configurás como variable HF_API_KEY en Render)
const HF_API_KEY = process.env.HF_API_KEY;

// 🚀 Ruta del proxy
app.post("/chat", async (req, res) => {
  try {
    const { inputs } = req.body;

    if (!inputs) {
      return res.status(400).json({ error: "Falta el campo 'inputs' en la solicitud." });
    }

    // 🔗 Modelo accesible públicamente (funciona con router.huggingface.co)
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/HuggingFaceH4/zephyr-7b-beta",
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

    // Si Hugging Face devuelve error (por ejemplo 404 o 401)
    if (!response.ok) {
      return res.status(response.status).json({
        error: "Error desde Hugging Face",
        status: response.status,
        details: { raw_text: text },
      });
    }

    // Intentamos parsear el JSON del modelo
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

// Ruta raíz para verificar que el servidor corre
app.get("/", (req, res) => {
  res.send("✅ Servidor proxy activo. Usa POST /chat para enviar mensajes.");
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor proxy escuchando en puerto ${PORT}`));
