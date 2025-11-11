import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const HF_API_KEY = process.env.HF_API_KEY;

// ✅ Modelo estable y público
const MODEL_URL = "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3";

app.get("/", (req, res) => {
  res.send("✅ Servidor activo. Usa POST /chat para comunicarte con Hugging Face.");
});

app.post("/chat", async (req, res) => {
  const { inputs } = req.body || {};
  if (!inputs) return res.status(400).json({ error: "Falta el campo 'inputs'." });

  console.log("🟢 [Proxy] Mensaje recibido:", inputs);

  try {
    console.log("📡 Enviando a:", MODEL_URL);

    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `Usuario: ${inputs}\nAsistente:`,
      }),
    });

    const text = await response.text();
    console.log("📥 Respuesta Hugging Face:", text);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Error desde Hugging Face",
        status: response.status,
        details: text,
      });
    }

    // Intentar parsear JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw_text: text };
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Error general:", err);
    res.status(500).json({
      error: "Fallo al comunicarse con Hugging Face",
      details: err.message,
    });
  }
});

// 🧭 Manejar rutas inexistentes
app.use((req, res) => {
  res.status(404).send("⚠️ Ruta no encontrada. Usa /chat para enviar mensajes.");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor proxy escuchando en puerto ${PORT}`);
});
