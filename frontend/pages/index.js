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

  useEffect(() => {
    if (token) {
      fetch("http://localhost:3001/books", {
        headers: { Authorization: `Bearer ${token}` }, // Envoi du token JWT
      })
        .then((res) => res.json())
        .then((data) => setBooks(data))
        .catch((err) => console.error("Erreur lors du chargement :", err));
    }
  }, [token]);

  if (!token) return <p>Redirection en cours...</p>; // Affiche un message pendant la redirection

  return (
    <div>
      <h1>Liste des Livres</h1>
      <a href="/add" style={{ display: "block", marginBottom: "20px" }}>Ajouter un Livre</a>
      <button onClick={() => {
        localStorage.removeItem("token"); // Supprime le token
        window.location.reload(); // Recharge la page pour forcer la déconnexion
      }}>Se Déconnecter</button>
      <ul>
        {books.length === 0 ? (
          <p>Aucun livre disponible.</p>
        ) : (
          books.map((book) => (
            <li key={book.id}>
              <a href={`/book/${book.id}`} style={{ marginRight: "10px" }}>
                {book.title} - {book.author} ({book.year})
              </a>
              <button onClick={async () => {
                await fetch(`http://localhost:3001/books/${book.id}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` }, // Envoi du token JWT
                });
                setBooks(books.filter((b) => b.id !== book.id));
              }}>
                Supprimer
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}