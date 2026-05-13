import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MATIERES = [
  { id: "management", label: "Management", emoji: "🏢", color: "#ff6b6b" },
  { id: "eco-droit", label: "Éco-Droit", emoji: "⚖️", color: "#4ecdc4" },
  { id: "mercatique", label: "Mercatique", emoji: "📊", color: "#45b7d1" },
  { id: "gestion", label: "Gestion", emoji: "💰", color: "#f9ca24" },
  { id: "sio", label: "SIG", emoji: "💻", color: "#a29bfe" },
  { id: "rh", label: "RH", emoji: "👥", color: "#fd79a8" },
];

const SYSTEM_PROMPT = `Tu es un professeur expert en STMG en France. Tu maîtrises le Management, l'Éco-Droit, la Mercatique, la Gestion, le SIG et les RH. 
Règles : 
- Explique avec des exemples concrets du programme STMG.
- Utilise le vocabulaire exact (ex: parties prenantes, avantage concurrentiel, etc.).
- Sois encourageant et dynamique.
- Commence chaque réponse par un emoji.`;

function App() {
  const [apiKey, setApiKey] = useState("");
  const [apiKeySet, setApiKeySet] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Salut ! Je suis ton **Prof IA STMG**. Quelle matière veux-tu réviser aujourd'hui ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading || !apiKey) return;
    
    setInput("");
    const userMsg = { role: "user", content: userText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: selectedMatiere ? `${SYSTEM_PROMPT} L'élève travaille sur : ${selectedMatiere.label}` : SYSTEM_PROMPT
      });

      const chat = model.startChat({
        history: messages.map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      });

      const result = await chat.sendMessage(userText);
      const response = await result.response;
      const reply = response.text();

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `❌ Erreur : ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  if (!apiKeySet) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "sans-serif", padding: "20px" }}>
        <div style={{ background: "#161616", padding: "40px", borderRadius: "24px", textAlign: "center", border: "1px solid #2a2a2a", maxWidth: "400px", width: "100%" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>🎓 Prof IA STMG</h1>
          <p style={{ color: "#888", marginBottom: "25px" }}>Entre ta clé API Gemini pour commencer</p>
          <input 
            type="password" 
            placeholder="AIza..."
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)}
            style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #333", background: "#000", color: "#fff", marginBottom: "15px", boxSizing: "border-box" }}
          />
          <button 
            onClick={() => apiKey.trim() && setApiKeySet(true)}
            style={{ width: "100%", padding: "14px", background: "#4ecdc4", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", color: "#000" }}
          >
            Démarrer la session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "white", fontFamily: "sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
      <div style={{ marginBottom: "20px", textAlign: "center", width: "100%", maxWidth: "600px" }}>
        <h2 style={{ color: "#4ecdc4" }}>🎓 Assistant STMG</h2>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
          {MATIERES.map(m => (
            <button key={m.id} onClick={() => setSelectedMatiere(m)} style={{ padding: "8px 12px", borderRadius: "20px", cursor: "pointer", border: selectedMatiere?.id === m.id ? `2px solid ${m.color}` : "1px solid #222", background: "#161616", color: "white" }}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, width: "100%", maxWidth: "600px", background: "#111", borderRadius: "15px", padding: "20px", overflowY: "auto", border: "1px solid #222" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "15px", textAlign: m.role === "user" ? "right" : "left" }}>
            <div style={{ padding: "10px 15px", borderRadius: "15px", background: m.role === "user" ? "#4ecdc4" : "#222", color: m.role === "user" ? "#000" : "#fff", display: "inline-block" }}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ width: "100%", maxWidth: "600px", marginTop: "20px", display: "flex", gap: "10px" }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Pose ta question..." style={{ flex: 1, padding: "15px", borderRadius: "10px", border: "1px solid #222", background: "#111", color: "white" }} />
        <button onClick={() => sendMessage()} style={{ padding: "0 20px", background: "#4ecdc4", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>Envoyer</button>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
