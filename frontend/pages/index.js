import { useEffect, useState, useContext } from "react";
import UserContext from "./component/UserContext";
import { useRouter } from "next/router";

export default function Home() {
  const { token } = useContext(UserContext); // Vérifie si l'utilisateur est connecté
  const [highScore, setHighScore] = useState(null); // État pour stocker le score
  const router = useRouter();

  // Charge le script du jeu après le rendu de la page
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return; // Ne charge pas le script si l'utilisateur n'est pas connecté
    }

    const script = document.createElement("script");
    script.src = "/game.js";
    script.async = true;
    script.type = "module";
    document.body.appendChild(script);

    return () => {
      // Nettoie le script lors du démontage du composant
      document.body.removeChild(script);
    };
  }, []);

  // Récupère le score de l'utilisateur
  useEffect(() => {
    const handleResetGame = () => {
      const fetchHighScore = async () => {
        const storedToken = localStorage.getItem("token");
        try {
          const response = await fetch(
            "http://localhost:5000/api/token/decrypt",
            {
              method: "GET",
              headers: {
                authorization: `Bearer ${storedToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          if (response.ok) {
            const userId = data.id;
            const userResponse = await fetch(
              `http://localhost:5000/api/users/one`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  id: userId,
                },
              }
            );
            const userData = await userResponse.json();
            if (userResponse.ok) {
              setHighScore(userData.score); // Met à jour le score
            } else {
              console.error(
                "Erreur lors de la récupération de l'utilisateur :",
                userData
              );
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de l'id :", error);
        }
      };

      fetchHighScore();
    };

    // Ajoute un écouteur pour l'événement "resetGame"
    window.addEventListener("resetGame", handleResetGame);

    // Nettoie l'écouteur lors du démontage du composant
    return () => {
      window.removeEventListener("resetGame", handleResetGame);
    };
  }, []);

  // Affiche un message pendant la redirection
  if (!token) {
    return <p>Redirection en cours...</p>;
  }

  return (
    <>
      <span id="message" className="hidden"></span>
      <nav>
        <ul>
          <li>
            <a className="nav-links" href="/logout">
              Logout
            </a>
          </li>
          <li>
            <a className="nav-links" href="/account">
              Account
            </a>
          </li>
          <li>
            <a className="nav-links" href="/leaderboard">
              Leaderboard
            </a>
          </li>
        </ul>
      </nav>
      <main id="container">
        <canvas id="game" width="800" height="600"></canvas>
        <div id="ui">
          <div>
            High Score:{" "}
            <span id="high-score">
              {highScore !== null ? highScore : "Chargement..."}
            </span>
          </div>
          <div>
            Score: <span id="score">0 X 1</span>
          </div>
          <p id="health">Vie: 3</p>
          <div>
            Points: <span id="points">0</span>
          </div>
          <button id="lottery-btn">🎰 Loterie (50 pts) (E)</button>
          <button id="start-button">start</button>
          <button class="hidden" id="pause-button">
            pause
          </button>
        </div>
        <div id="power-ups-container">
          <h3>Power-Ups Actifs</h3>
        </div>
      </main>
      <div id="boss-banner" className="hidden">
        ⚠️ Boss Approaching ⚠️
      </div>
    </>
  );
}
