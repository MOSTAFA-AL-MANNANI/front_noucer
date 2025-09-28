export async function logout() {
  try {
    await fetch("http://127.0.0.1:8000/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    localStorage.removeItem("token");
    window.location.href = "/"; // رجوع لصفحة login
  } catch (error) {
    console.error("Erreur logout:", error);
  }
}
