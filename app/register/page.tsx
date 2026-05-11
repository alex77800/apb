"use client";

import { useState } from "react";

export default function RegisterPage() {
  // 📧 состояние email
  const [email, setEmail] = useState("");

  // 🔐 состояние password
  const [password, setPassword] = useState("");

  // 🚀 регистрация
  const register = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    console.log(data);

    if (res.ok) {
      alert("User created!");
    } else {
      alert(data.error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Register</h1>

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <button onClick={register}>
        Create account
      </button>
    </div>
  );
}