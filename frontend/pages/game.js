import { useEffect } from "react";

export default function Game() {
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
