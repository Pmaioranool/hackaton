import { useEffect, useState } from "react";

export default function LeaderBoard() {
  const [leaderboard, setLeaderboard] = useState([]); // Liste complète des joueurs
  const [searchTerm, setSearchTerm] = useState(""); // Terme de recherche
  const [filteredLeaderboard, setFilteredLeaderboard] = useState([]); // Liste filtrée des joueurs

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
        if (response.ok) {
          setLeaderboard(data); // Met à jour la liste complète
          setFilteredLeaderboard(data); // Initialise la liste filtrée
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

  // Filtre les joueurs en fonction du terme de recherche
  useEffect(() => {
    const filtered = leaderboard.filter((player) =>
      player.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLeaderboard(filtered);
  }, [searchTerm, leaderboard]);

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
      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="Rechercher un joueur..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "10px",
          fontSize: "16px",
          marginBottom: "20px",
          width: "100%",
        }}
      />
      <div>
        {filteredLeaderboard.length > 0 ? (
          filteredLeaderboard.slice(0, 5).map((element, index) => (
            <div className="leaderboard-entry" key={index}>
              <p className="username">Nom d'utilisateur : {element.username}</p>
              <p className="score">Score : {element.score}</p>
            </div>
          ))
        ) : (
          <p>Aucun joueur trouvé...</p>
        )}
      </div>
    </div>
  );
}
