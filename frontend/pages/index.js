import { useEffect, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";

export default function Home() {
  const { token } = useContext(AuthContext); // Vérifie si l'utilisateur est connecté
  const router = useRouter();

  // Redirige vers /login si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token]);

  // Charge le script du jeu après le rendu de la page
  useEffect(() => {
    if (!token) return; // Ne charge pas le script si l'utilisateur n'est pas connecté

    const script = document.createElement("script");
    script.src = "/game/main.js";
    script.async = true;
    script.type = "module";
    document.body.appendChild(script);

    return () => {
      // Nettoie le script lors du démontage du composant
      document.body.removeChild(script);
    };
  }, [token]);

  // Affiche un message pendant la redirection
  if (!token) {
    return <p>Redirection en cours...</p>;
  }

  return (
    <div>
      <link rel="stylesheet" href="/style.css" />
      <span id="message" className="hidden"></span>
      <nav>
        <ul>
          <li>
            <a href="/logout">Logout</a>
          </li>
          <li>
            <a href="/account">Account</a>
          </li>
        </ul>
      </nav>
      <main id="container">
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
      </main>
      <div id="boss-banner" className="hidden">
        ⚠️ Boss Approaching ⚠️
      </div>
    </div>
  );
}
