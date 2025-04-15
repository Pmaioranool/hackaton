import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";

export default function Home() {
  const { token } = useContext(AuthContext); // Vérifier si l'utilisateur est connecté
  const router = useRouter();
  const [books, setBooks] = useState([]);

  // Redirige vers /login si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token]);

  if (!token) return <p>Redirection en cours...</p>; // Affiche un message pendant la redirection

  useEffect(() => {
    // Charge le script du jeu après le rendu de la page
    const script = document.createElement("script");
    script.src = "/game.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Nettoie le script lors du démontage du composant
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <link rel="stylesheet" href="/style.css" />
      <span id="message" className="hidden"></span>
      <div>
        {token ? (
          <>
            <a href="/logout">Logout</a>
            <a href="/account">Account</a>
          </>
        ) : (
          <>
            <a href="/register">Register</a>
            <a href="/login">Login</a>
          </>
        )}
      </div>
      <div id="container">
        <canvas id="game" width="800" height="600"></canvas>
        <div id="ui">
          <div>
            Score: <span id="score">0</span>
          </div>
          <p id="health">Vie: 3</p>
          <div>
            Points: <span id="points">0</span>
          </div>
          <button id="lottery-btn">🎰 Loterie (100 pts)</button>
        </div>
      </div>
      <div id="boss-banner" className="hidden">
        ⚠️ Boss Approaching ⚠️
      </div>
    </div>
  );
}
