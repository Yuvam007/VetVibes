require("dotenv").config({ path: "./db.env" }); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enable CORS for all origins
app.use(cors());
app.use(bodyParser.json());

// ✅ **MongoDB Connection**
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not defined in db.env");
    process.exit(1);
}

mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => {
        console.error("❌ MongoDB connection failed:", err);
        process.exit(1);
    });

// ✅ **User Schema & Model**
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, minlength: 8 },
    email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
    password: { type: String, required: true, minlength: 8 }
});
const User = mongoose.model("User", UserSchema);

// ✅ **Order Schema & Model for Saving Shipping and Order Information**
const orderSchema = new mongoose.Schema({
    fullName: String,
    address: String,
    city: String,
    postalCode: String,
    phone: String,
    paymentMethod: String,
    products: [{
        name: String,
        price: Number,
        quantity: Number
    }],
    subtotal: Number,
    deliveryCharge: Number,
    total: Number,
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", orderSchema);

// ✅ **Sign-up Endpoint**
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    if (username.length < 8 || !email.includes("@") || !email.endsWith(".com") || password.length < 8) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    try {
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res.status(409).json({ message: "Username or Email is already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        await newUser.save();
        res.status(201).json({ message: "Sign-up successful!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// ✅ **Login Endpoint**
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Ensure both email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // On successful login, you can return a message or a session identifier if needed
        res.json({ message: "Login successful!" });
    } catch (error) {
        console.error("❌ Error during login:", error); // Log error for debugging
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ **Checkout Endpoint to Save Order & Shipping Info**
app.post("/checkout", async (req, res) => {
    const { fullName, address, city, postalCode, phone, paymentMethod, products } = req.body;

    // Validate the incoming request data
    if (!fullName || !address || !city || !postalCode || !phone || !paymentMethod || !products) {
        return res.status(400).json({ message: "Missing required fields for order" });
    }

    // Calculate subtotal, delivery charge, and total
    const subtotal = products.reduce((acc, product) => acc + (product.price * product.quantity), 0);
    const deliveryCharge = 50; // Static delivery charge
    const total = subtotal + deliveryCharge;

    const order = new Order({
        fullName,
        address,
        city,
        postalCode,
        phone,
        paymentMethod,
        products,
        subtotal,
        deliveryCharge,
        total,
    });

    try {
        // Save order to the database
        const savedOrder = await order.save();
        console.log("✅ Order saved:", savedOrder); // Log saved order data
        res.status(201).json({ message: "Order placed successfully!", order: savedOrder });
    } catch (error) {
        console.error("❌ Error saving order:", error); // Log detailed error
        res.status(500).json({ message: "Server error, could not save the order", error: error.message });
    }
});

// ✅ **Start the server**
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
