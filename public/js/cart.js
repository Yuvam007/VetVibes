document.addEventListener("DOMContentLoaded", function () {
    const cartContainer = document.getElementById("cart-container");
    const cartSummary = document.getElementById("cart-summary");
    const subtotalElement = document.getElementById("subtotal");
    const totalElement = document.getElementById("total");
    const deliveryChargeElement = document.getElementById("delivery-charge");
    const loginButton = document.getElementById("login-button");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Check login status and update login button text
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"; // Get login status from localStorage
    if (isLoggedIn) {
        loginButton.innerHTML = `<a href="index.html"><button type="button" class="login-btn">Logout</button></a>`; // Update button to "Logout"
    } else {
        loginButton.innerHTML = `<a href="LoginPage.html"><button type="button" class="login-btn">Login</button></a>`; // Update button to "Login"
    }

    function updateCartDisplay() {
        cartContainer.innerHTML = "";
        let subtotal = 0;

        if (cart.length === 0) {
            cartContainer.innerHTML = `<p class="empty-cart">Your cart is empty.</p>`;
            cartSummary.style.display = "none"; // Hide summary when cart is empty
            return;
        } else {
            cartSummary.style.display = "block"; // Show summary if cart has items
        }
        cart.forEach((item, index) => {
            subtotal += item.price * item.quantity;
            cartContainer.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" class="cart-item-image" alt="${item.name}">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <span class="cart-item-price">₹${item.price}</span>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="remove-selected" onclick="removeItem(${index})">Remove</button>
                </div>
            `;
        });

        let deliveryCharge = cart.length > 0 ? 50 : 0;
        let total = subtotal + deliveryCharge;

        subtotalElement.textContent = `₹${subtotal}`;
        deliveryChargeElement.textContent = `₹${deliveryCharge}`;
        totalElement.textContent = `₹${total}`;
    }

    window.updateQuantity = function (index, change) {
        if (cart[index].quantity + change > 0) {
            cart[index].quantity += change;
        } else {
            cart.splice(index, 1);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartDisplay();
    };

    window.removeItem = function (index) {
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartDisplay();
    };

    document.getElementById("continueShoppingBtn").addEventListener("click", function () {
        window.location.href = "product.html";
    });

    // Updated: Check login status and redirect accordingly
    document.querySelector(".checkout-btn").addEventListener("click", function () {
        if (!isLoggedIn) {
            // If not logged in, redirect to login page
            window.location.href = "LoginPage.html";
        } else {
            // If logged in, proceed to checkout
            window.location.href = "checkout.html";
        }
    });

    updateCartDisplay();
});

function addToCart(id, name, price) {
    const image = `img/product${id}.png`;
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1, image });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "cart.html";
}
