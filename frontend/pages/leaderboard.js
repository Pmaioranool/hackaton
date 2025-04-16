import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function LeaderBoard() {
  const [leaderboard, setLeaderboard] = useState([]); // Utilisation correcte de useState

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/users/leaderboard",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        console.log(data); // Vérifie si le leaderboard est correctement récupéré
        if (response.ok) {
          setLeaderboard(data); // Met à jour l'état avec les données du leaderboard
        } else {
          console.error(
            "Erreur lors de la récupération du leaderboard :",
            data
          );
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard-container">
      <h1>LeaderBoard</h1>
      <nav>
        <a href="/" className="nav-links">
          Retour au jeu
        </a>
        <a href="/account" className="nav-links">
          Account
        </a>
      </nav>
      <br />
      <div>
        {leaderboard.length > 0 ? (
          leaderboard.map((element, index) => (
            <div className="leaderboard-entry" key={index}>
              <p className="username">Nom d'utilisateur : {element.username}</p>
              <p className="score">Score : {element.score}</p>
            </div>
          ))
        ) : (
          <p>Chargement du leaderboard...</p>
        )}
      </div>
    </div>
  );
}
