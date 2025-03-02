document.addEventListener("DOMContentLoaded", function () {
    const authButton = document.getElementById("login-button");

    // Update the login/logout button based on login state
    function updateAuthButton() {
        if (localStorage.getItem("isLoggedIn") === "true") {
            authButton.innerHTML = '<button type="button" style = "padding : 16px; margin-left:16px">Logout</button>';
            authButton.addEventListener("click", function () {
                localStorage.removeItem("isLoggedIn");
                window.location.href = "index.html"; // Redirect to homepage after logout
            });
        } else {
            authButton.innerHTML = '<a href="LoginPage.html"><button type="button">Login</button></a>';
        }
    }
    updateAuthButton();

    // Handle Sign-up form submission
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            // ✅ Corrected IDs to match SignUp.html
            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            console.log('Signing up with', { username, email, password }); // Debug log

            try {
                const response = await fetch("http://localhost:3000/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password }),
                });

                const result = await response.json();
                console.log('Response:', result); // Debug log

                alert(result.message);

                // ✅ Redirect only if signup is successful
                if (response.status === 201) {
                    window.location.href = "LoginPage.html";
                }
            } catch (error) {
                console.error("Error during sign-up:", error);
                alert("An error occurred during sign-up. Please try again.");
            }
        });
    }

    // Handle Login form submission
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = document.getElementById("loginUser").value;
            const password = document.getElementById("loginPassword").value;

            console.log('Logging in with', { email, password }); // Debug log

            try {
                const response = await fetch("http://localhost:3000/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const result = await response.json();
                console.log('Response:', result); // Debug log

                alert(result.message);

                // ✅ Redirect only if login is successful
                if (response.ok) {
                    localStorage.setItem("isLoggedIn", "true");
                    window.location.href = "index.html";
                }
            } catch (error) {
                console.error("Error during login:", error);
                alert("An error occurred during login. Please try again.");
            }
        });
    }
});
