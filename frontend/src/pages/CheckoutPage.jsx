import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { authFetch } from "../utils/auth";

function CheckoutPage() {
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL;
    const navigate = useNavigate();
    const { clearCart } = useCart();

    const [form, setForm] = useState({
        name: "",
        address: "",
        phone: "",
        payment_method: "COD",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm(
            {
                ...form,
                [e.target.name]: e.target.value
            });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            const res = await authFetch(`${BASE_URL}/api/orders/create/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("Order placed successfully!");
                fetch(`${BASE_URL}/api/cart/`);
                clearCart();
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            } else {
                setMessage(data.error || "Failed to place order");
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6">Checkout</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        required
                        className="w-full p-2 border rounded-lg"
                    />

                    <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Full Address"
                        required
                        className="w-full p-2 border rounded-lg"
                    />

                    <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        required
                        className="w-full p-2 border rounded-lg"
                    />

                    <select
                        name="payment_method"
                        value={form.payment_method}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg"
                    >
                        <option value="COD">Cash on Delivery</option>
                        <option value="ONLINE">Online Payment</option>
                    </select>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                        {loading ? "Processing..." : "Place Order"}
                    </button>
                    {message &&
                        <p className="text-center text-green-700 font-semibold mt-4">{message}</p>}
                </form>
            </div>
        </div>
    )
}

export default CheckoutPage;