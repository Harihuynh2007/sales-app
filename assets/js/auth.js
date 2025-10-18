document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");
  errorMsg.textContent = "";

  try {
    const res = await apiRequest("/auth/login", "POST", { email, password });
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));

    // Điều hướng sau khi đăng nhập
    alert("Đăng nhập thành công!");
    window.location.href = "index.html";
  } catch (err) {
    errorMsg.textContent = err.message || "Sai thông tin đăng nhập";
  }
});
