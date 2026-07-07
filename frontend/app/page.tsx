"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    console.log("✅ Send button clicked");

    if (!message.trim()) {
      alert("Please enter a message.");
      return;
    }

    setLoading(true);
    setReply("");

    try {
      console.log("Sending:", message);

      const res = await fetch("http://127.0.0.1:8000/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      console.log("HTTP Status:", res.status);

      const data = await res.json();

      console.log("Backend Response:", data);

      if (res.ok) {
        setReply(data.reply || "No reply received.");
      } else {
        setReply(data.detail || "Backend returned an error.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setReply("❌ Cannot connect to FastAPI backend.");
    }

    setLoading(false);
  }

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>🧠 EchoLens AI</h1>

      <textarea
        rows={6}
        value={message}
        placeholder="How are you feeling today?"
        onChange={(e) => setMessage(e.target.value)}
        style={{
          width: "100%",
          padding: "15px",
          borderRadius: "10px",
          fontSize: "16px",
          marginBottom: "20px",
        }}
      />

      <button
        type="button"
        onClick={sendMessage}
        disabled={loading}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "8px",
        }}
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      <br />
      <br />

      {reply && (
        <div
          style={{
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "12px",
            whiteSpace: "pre-wrap",
            lineHeight: "1.6",
          }}
        >
          <h3>🤖 EchoLens AI</h3>
          <p>{reply}</p>
        </div>
      )}
    </main>
  );
}