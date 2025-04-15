import { useState, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";

export default function Register() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      login(data.token);
      router.push("/");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h1>Créer un compte</h1>
      <input
        type="text"
        placeholder="Nom"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {data.message ? (
        <p>{data.message}</p>
      ) : (
        <p>Veuillez entrer vos informations pour vous inscrire.</p>
      )}
      {data.error && <p style={{ color: "red" }}>{data.error}</p>}
      <button type="submit">S'inscrire</button>
    </form>
  );
}
