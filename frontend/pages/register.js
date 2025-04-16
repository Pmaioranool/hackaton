import { useState, useContext } from "react";
import { useRouter } from "next/router";
import UserContext from "./component/UserContext";

export default function Register() {
  const { login } = useContext(UserContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      console.log(data);
      if (response.ok) {
        login(data.token);
        router.push("/");
      }
    } catch (err) {
      setError("Impossible de se connecter au serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleRegister}>
        <h1>Créer un compte</h1>
        <a className="nav-links" href="/login">
          se connecter
        </a>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p>Inscription en cours...</p>
        ) : (
          <p>Veuillez entrer vos informations pour vous inscrire.</p>
        )}
        <button type="submit" disabled={loading}>
          {loading ? "Chargement..." : "S'inscrire"}
        </button>
      </form>
    </div>
  );
}
