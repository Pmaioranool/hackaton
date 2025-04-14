import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function BookDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [book, setBook] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:3001/books/${id}`)
        .then((res) => res.json())
        .then((data) => setBook(data))
        .catch((err) => console.error("Erreur :", err));
    }
  }, [id]);

  if (!book) return <p>Chargement...</p>;

  return (
    <div>
      <h1>{book.title}</h1>
      <p>Auteur : {book.author}</p>
      <p>Année : {book.year}</p>
    </div>
  );
}