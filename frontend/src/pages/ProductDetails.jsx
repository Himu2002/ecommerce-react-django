import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


function ProductDetails() {

    const { id } = useParams();
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        fetch(`${BASE_URL}/api/products/${id}/`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch product details");
                }
                return response.json();
            })
            .then((data) => {
                setProduct(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [id, BASE_URL]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center py-10">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl w-full">
                <div className="flex flex-col md:flex-row gap-8">
                    <img src={`${product.image}`}
                        alt={product.name}
                        className="w-full md:w-1/2 h-auto object-cover rounded-lg" />
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {product.name}
                        </h1>
                        <p className="text-gray-600 mb-4">
                            {product.description}
                        </p>
                        <p className="text-2xl font-semibold text-green-600 mb-6">
                            ${product.price}
                        </p>
                        <button
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Add to Cart 🛒
                        </button>
                        <div className="mt-4">
                            <a href="/" className="text-blue-600 hover:underline">
                                &larr; Back to Home
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;
