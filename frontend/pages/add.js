import { useState } from "react";
import { useRouter } from "next/router";

export default function AddBook() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:3001/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author, year: parseInt(year) }),
    });

    if (response.ok) router.push("/");
  };

  return (
    <div>
      <h1>Ajouter un Livre</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Auteur" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <input type="number" placeholder="Année" value={year} onChange={(e) => setYear(e.target.value)} />
        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
}