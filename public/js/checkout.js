document.addEventListener("DOMContentLoaded", function () {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    function calculateTotals() {
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        const deliveryCharge = 50; // Static delivery charge
        const total = subtotal + deliveryCharge;

        document.getElementById("subtotal").textContent = `₹${subtotal}`;
        document.getElementById("delivery-charge").textContent = `₹${deliveryCharge}`;
        document.getElementById("total").textContent = `₹${total}`;
    }

    calculateTotals();

    const checkoutForm = document.getElementById("checkoutForm");
    checkoutForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const fullName = document.getElementById("full-name").value;
        const address = document.getElementById("address").value;
        const city = document.getElementById("city").value;
        const postalCode = document.getElementById("postal-code").value;
        const phone = document.getElementById("phone").value;
        const paymentMethod = document.getElementById("payment-method").value;

        // Log the form data to see if it's being accessed correctly
        console.log("Form Data:", {
            fullName,
            address,
            city,
            postalCode,
            phone,
            paymentMethod
        });

        // Ensure all required fields are filled
        if (!fullName || !address || !city || !postalCode || !phone || !paymentMethod) {
            alert("Please fill all the fields.");
            return;
        }

        const orderData = {
            fullName,
            address,
            city,
            postalCode,
            phone,
            paymentMethod,
            products: cart,
            subtotal: parseInt(document.getElementById("subtotal").textContent.slice(1)),
            deliveryCharge: 50,
            total: parseInt(document.getElementById("total").textContent.slice(1)),
        };

        console.log("Order Data:", orderData); // Log the order data before sending

        // Get the token from localStorage (if it exists)
        const token = localStorage.getItem("token");

        // Send the order data to the backend server
        fetch("http://localhost:3000/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Attach the token for authorization
            },
            body: JSON.stringify(orderData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === "Order placed successfully!") {
                    alert("Order placed successfully!");
                    localStorage.removeItem("cart"); // Clear cart
                    window.location.href = "index.html"; // Redirect to home page
                } else {
                    console.log("Error in response:", data); // Log the response data if error occurs
                    alert("Error placing order.");
                }
            })
            .catch(error => {
                console.error("Error placing order:", error); // Log the fetch error
                alert("Error placing order.");
            });
    });
});
