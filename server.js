import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Token configurado en Render
const HF_API_KEY = process.env.HF_API_KEY;

// 🧠 Modelo público y funcional
const HF_URL = "https://router.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

// Ruta base para probar el proxy
app.get("/", (req, res) => {
  res.send("🚀 Proxy activo con manejo detallado de errores.");
});

// Ruta principal
app.post("/chat", async (req, res) => {
  try {
    const { inputs } = req.body;
    if (!inputs) {
      return res.status(400).json({ error: "Falta el campo 'inputs' en la solicitud." });
    }

    const response = await fetch(HF_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: `Usuario: ${inputs}\nAsistente:` }),
    });

    const text = await response.text(); // obtenemos texto para debug
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { raw_text: text }; // si no es JSON, lo devolvemos tal cual
    }

    // 🧾 Enviar detalles incluso si Hugging Face devuelve error
    if (!response.ok) {
      console.error("⚠️ Error en Hugging Face:", data);
      return res.status(response.status).json({
        error: "Error desde Hugging Face",
        status: response.status,
        details: data,
      });
    }

    // ✅ Respuesta correcta
    res.json(data);
  } catch (err) {
    console.error("❌ Error interno en el servidor proxy:", err);
    res.status(500).json({
      error: "Error en el servidor proxy",
      details: err.message,
    });
  }
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor proxy escuchando en puerto ${PORT}`));
