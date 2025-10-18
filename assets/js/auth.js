
if (document.getElementById("loginForm")) {
  document
    .getElementById("loginForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const errorMsg = document.getElementById("errorMsg");
      errorMsg.textContent = "";

      try {
        const res = await apiRequest("/auth/login", "POST", { email, password });

        // Lưu thông tin người dùng và token
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));

        // Điều hướng theo vai trò
        alert("Đăng nhập thành công!");
        if (res.user.role === "Admin" || res.user.role === "Sales") {
          window.location.href = "admin/dashboard.html";
        } else {
          window.location.href = "index.html";
        }
      } catch (err) {
        errorMsg.textContent = err.message || "Sai thông tin đăng nhập";
      }
    });
}

// ====== REGISTER ======
if (document.getElementById("registerForm")) {
  document
    .getElementById("registerForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const errorMsg = document.getElementById("errorMsg");
      errorMsg.textContent = "";

      try {
        // Gửi yêu cầu đăng ký
        await apiRequest("/auth/register", "POST", {
          firstName,
          lastName,
          email,
          password,
        });

        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        window.location.href = "login.html";
      } catch (err) {
        errorMsg.textContent =
          err.message || "Lỗi khi đăng ký. Vui lòng thử lại.";
      }
    });
}

// ====== ĐĂNG XUẤT ======
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  alert("Đã đăng xuất!");
  window.location.href = "login.html";
}
