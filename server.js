import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const HF_API_KEY = process.env.HF_API_KEY;

// Ruta principal (solo para probar que el servidor corre)
app.get("/", (req, res) => {
  res.send("🚀 Proxy Hugging Face activo y listo!");
});

// Ruta de chat
app.post("/chat", async (req, res) => {
  const { inputs } = req.body;
  if (!inputs) {
    return res.status(400).json({ error: "Falta el parámetro 'inputs'" });
  }

  try {
    // Usamos el modelo GPT-2 de Hugging Face (confirmado que funciona)
    const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Error desde Hugging Face",
        status: response.status,
        details: data,
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Error al comunicarse con Hugging Face:", error);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor proxy escuchando en puerto ${PORT}`);
});
