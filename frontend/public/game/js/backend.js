// backend.js

export async function getId() {
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
      return data.id;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'id :", error);
  }
}

export async function putUserScore(id, score) {
  try {
    await fetch(`http://localhost:5000/api/users/newScore/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score }),
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du score :", error);
  }
}
