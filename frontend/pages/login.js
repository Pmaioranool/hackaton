import { useState, useContext } from "react";
import { useRouter } from "next/router";
import UserContext from "./component/UserContext";

export default function Login() {
  const { login } = useContext(UserContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/api/users/login", {
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
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h1>Connexion</h1>
        <a className="nav-links" href="/register">
          Créer un compte
        </a>
        <br />
        <br />
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
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}
