import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";

export default function Home() {
  const { token, loading, logout } = useContext(AuthContext);
  const router = useRouter();
  const [highScore, setHighScore] = useState(null);

  // Redirection si pas de token après chargement du contexte
  useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
    }
  }, [token, loading]);

  // Charge le script du jeu uniquement quand token est présent
  useEffect(() => {
    if (!token || loading) return;

    const script = document.createElement("script");
    script.src = "/game/js/main.js";
    script.async = true;
    script.type = "module";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [token, loading]);

  // Met à jour le high score à chaque reset
  useEffect(() => {
    let isMounted = true;

    const handleResetGame = () => {
      const fetchHighScore = async () => {
        const storedToken = localStorage.getItem("token");
        try {
          const response = await fetch("http://localhost:5000/api/token/decrypt", {
            method: "GET",
            headers: {
              authorization: `Bearer ${storedToken}`,
              "Content-Type": "application/json",
            },
          });
          const data = await response.json();
          if (response.ok) {
            const userId = data.id;
            const userResponse = await fetch(`http://localhost:5000/api/users/${userId}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });
            const userData = await userResponse.json();
            if (userResponse.ok && isMounted) {
              setHighScore(userData.score);
            } else {
              console.error("Erreur utilisateur :", userData);
            }
          }
        } catch (error) {
          console.error("Erreur de récupération :", error);
        }
      };

      fetchHighScore();
    };

    window.addEventListener("resetGame", handleResetGame);

    return () => {
      isMounted = false;
      window.removeEventListener("resetGame", handleResetGame);
    };
  }, []);

  if (loading) return <p>Chargement du contexte...</p>;
  if (!token) return <p>Redirection en cours...</p>;

  return (
    <div>
      <link rel='stylesheet' href='/style.css' />
      <span id='message' className='hidden'></span>
      <nav>
        <ul>
          <li>
            <button
              onClick={() => logout()}
              style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}>
              Logout
            </button>
          </li>

          <li>
            <a href='/account'>Account</a>
          </li>
        </ul>
      </nav>
      <main id='container'>
        <canvas id='game' width='800' height='600'></canvas>
        <div id='ui'>
          <div>
            High Score:{" "}
            <span id='high-score'>{highScore !== null ? highScore : "Chargement..."}</span>
          </div>
          <div>
            Score: <span id='score'>0</span>
          </div>
          <p id='health'>Vie: 3</p>
          <div>
            Points: <span id='points'>0</span>
          </div>
          <button id='lottery-btn'>🎰 Loterie (100 pts) (L)</button>
        </div>
      </main>
      <div id='boss-banner' className='hidden'>
        ⚠️ Boss Approaching ⚠️
      </div>
    </div>
  );
}
