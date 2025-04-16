import { useState, useContext } from "react";
import { useRouter } from "next/router";
import UserContext from "./component/UserContext";

export default function Account() {
  const { username, token } = useContext(UserContext); // Ajout du token
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/users/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Ajout du token dans les headers
        },
        body: JSON.stringify({
          newUsername,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Informations mises à jour avec succès.");
        setNewUsername("");
        setNewPassword("");
        // Rafraîchir la page pour mettre à jour le contexte
        window.location.reload();
      } else {
        setMessage(data.message || "Erreur lors de la mise à jour.");
      }
    } catch (err) {
      setMessage("Erreur de connexion au serveur.");
    }
  };

  return (
    <div className="account-container">
      <form onSubmit={handleUpdate}>
        <h1>Modifier mes infos</h1>
        <a href="/" className="account-back-link">
          Retour
        </a>
        <br />
        <br />
        <input
          type="text"
          placeholder="Nouveau pseudo"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button type="submit">Mettre à jour</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}
