# E-COMMERCE PROJECT - COMPLETE GUIDE
# Project: MohitCart (Full Stack E-Commerce Platform)

## PROJECT OVERVIEW
We're building an **E-Commerce Website** called **MohitCart** with two separate parts:
- **Backend (Django REST Framework + PostgreSQL)** - The server that stores and manages products, users, carts, orders
- **Frontend (React + Vite + Tailwind)** - Beautiful website users see and interact with

---

## STEP 1: PROJECT SETUP
**What we did:**
- Created "frontend" folder (React)
- Created "backend" folder (Django)

**Why?** Keeping server code and website code separate makes it cleaner and easier to manage.

---

## STEP 2: INSTALL BACKEND TOOLS
**What we installed:**
1. **Django REST Framework (DRF)** - Lets Django send data to React in JSON format
2. **PostgreSQL** - Professional database to store products, categories, users, and orders
3. **.env Setup** - Secret file to store database passwords safely

**Why?** DRF makes API creation easy, PostgreSQL is reliable, .env keeps secrets safe.

---

## STEP 3: CREATE DATABASE MODELS (backend/store/models.py)

**What we created:** Database blueprints for storing all data:

```python
# Category - Groups products
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)

# Product - The items for sale
class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

# UserProfile - Extra user information
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)

# Order - A user's purchase
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

# OrderItem - Items inside an order
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

# Cart - Shopping cart per user
class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def total(self):
        return sum(item.subtotal for item in self.items.all())

# CartItem - Items in the shopping cart
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    
    @property
    def subtotal(self):
        return self.product.price * self.quantity
```

**Why?** Models define what data gets stored and how they relate to each other.

---

## STEP 4: CREATE SERIALIZERS (backend/store/serializers.py)

**What we created:** Translators that convert database objects to JSON

```python
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'  # All fields

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)  # Nested category
    class Meta:
        model = Product
        fields = '__all__'

# Special CartItem serializer with product details
class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    class Meta:
        model = CartItem
        fields = '__all__'

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.ReadOnlyField()  # The total property
    class Meta:
        model = Cart
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match")
        return data
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user
```

**Why?** React doesn't understand Django objects. Serializers translate database data to JSON.

---

## STEP 5: SETUP DJANGO ADMIN (backend/store/admin.py)

**What we did:** Registered models so we can add products through web interface

```python
from django.contrib import admin
from .models import Category, Product, UserProfile, Order, OrderItem

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(UserProfile)
admin.site.register(Order)
admin.site.register(OrderItem)
```

**How to use:** Go to `http://localhost:8000/admin/` (after creating superuser) and click to add products

**Why?** Easier than writing code. Click-based data entry like Google Forms.

---

## STEP 6: CREATE API ENDPOINTS (backend/store/urls.py & views.py)

**What we created:** URLs and functions that React knocks on to get data

### Backend URLs (backend/store/urls.py):
```python
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Authentication
    path('register/', views.register_view),                    # Sign up
    path('token/', TokenObtainPairView.as_view()),            # Login (get JWT token)
    path('token/refresh/', TokenRefreshView.as_view()),       # Refresh token
    
    # Products
    path('products/', views.get_products),                    # Get all products
    path('products/<int:pk>/', views.get_product),            # Get one product
    path('categories/', views.get_categories),                # Get all categories
    
    # Shopping Cart
    path('cart/', views.get_cart),                            # Get user's cart
    path('cart/add/', views.add_to_cart),                     # Add product to cart
    path('cart/remove/', views.remove_from_cart),             # Remove from cart
    path('cart/update/', views.update_cart_quantity),         # Update quantity
    
    # Orders
    path('orders/create/', views.create_order),               # Checkout
]
```

### Backend Views (backend/store/views.py):

```python
# PUBLIC ENDPOINTS (no login needed)

@api_view(['GET'])
def get_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_product(request, pk):
    try:
        product = Product.objects.get(id=pk)
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "message": "User created successfully",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# PROTECTED ENDPOINTS (login required)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    product = Product.objects.get(id=product_id)
    
    # Get or create user's cart
    cart, created = Cart.objects.get_or_create(user=request.user)
    
    # Add product to cart (or increase quantity)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    if not created:
        item.quantity += 1  # Already exists, increase quantity
        item.save()
    
    return Response({
        'message': 'Product added to cart',
        'cart': CartSerializer(cart).data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_cart_quantity(request):
    item_id = request.data.get('item_id')
    quantity = request.data.get('quantity')
    
    if int(quantity) < 1:
        return Response({'error': 'Quantity must be at least 1'}, status=400)
    
    item = CartItem.objects.get(id=item_id)
    item.quantity = quantity
    item.save()
    return Response(CartItemSerializer(item).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request):
    item_id = request.data.get('item_id')
    CartItem.objects.filter(id=item_id).delete()
    return Response({'message': 'Item removed from cart'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    # Validate phone
    phone = request.data.get('phone')
    if not phone.isdigit() or len(phone) < 10:
        return Response({'error': 'Invalid phone number'}, status=400)
    
    # Get cart
    cart, created = Cart.objects.get_or_create(user=request.user)
    if not cart.items.exists():
        return Response({'error': 'Cart is empty'}, status=400)
    
    # Calculate total
    total = sum([item.product.price * item.quantity for item in cart.items.all()])
    
    # Create order
    order = Order.objects.create(user=request.user, total_amount=total)
    
    # Copy cart items to order items
    for item in cart.items.all():
        OrderItem.objects.create(
            order=order,
            product=item.product,
            quantity=item.quantity,
            price=item.product.price
        )
    
    # Clear cart
    cart.items.all().delete()
    
    return Response({
        'message': 'Order created successfully',
        'order_id': order.id
    })
```

**Why?** These are the "doors" React knocks on to get data. Each endpoint does one job.

---

## STEP 7: AUTHENTICATION SYSTEM (JWT Tokens)

**What we did:** Set up JWT (JSON Web Tokens) for secure login

### How it works:

```
1. User signs up → POST /api/register/
   Body: { username: "john", email: "john@example.com", password: "pass123", password2: "pass123" }
   Response: User created

2. User logs in → POST /api/token/
   Body: { username: "john", password: "pass123" }
   Response: { access: "eyJ0eXAi...", refresh: "eyJ0eXAi..." }

3. Frontend stores tokens in localStorage
   localStorage.setItem("access_token", data.access)
   localStorage.setItem("refresh_token", data.refresh)

4. For protected requests:
   Add header: Authorization: Bearer <access_token>
   
5. If token expires, use refresh token to get new access token
   POST /api/token/refresh/
   Body: { refresh: "<refresh_token>" }
```

### Frontend Authentication Utility (frontend/src/utils/auth.js):

```javascript
export const saveTokens = (tokens) => {
  localStorage.setItem("access_token", tokens.access);
  localStorage.setItem("refresh_token", tokens.refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const getAccessToken = () => localStorage.getItem("access_token");

// This function auto-adds Authorization header to fetch requests
export const authFetch = (url, options = {}) => {
  const token = getAccessToken();
  const headers = options.headers ? {...options.headers} : {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;  // Add token
  }
  
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  
  return fetch(url, {...options, headers});
};
```

**Why?** JWT tokens are secure, stateless, and don't require database lookups on every request.

---

## STEP 8: SETUP TAILWIND CSS (frontend)

**What we did:**
- Installed Tailwind CSS
- Used utility classes for styling instead of writing CSS

Example:
```javascript
<div className="bg-blue-500 text-white p-4 rounded-lg">
  // This creates a blue box with white text, padding, and rounded corners
</div>
```

**Why?** Tailwind makes styling fast and consistent.

---

## STEP 9: CREATE CART SYSTEM (frontend/src/context/CartContext.jsx)

**What we created:** A global cart system using React Context

```javascript
import { createContext, useContext, useState, useEffect } from "react";
import { authFetch, getAccessToken } from "../utils/auth";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

    // Fetch cart from backend when component loads
    const fetchCart = async () => {
        try {
            const res = await authFetch(`${BASEURL}/api/cart/`)
            const data = await res.json();
            setCartItems(data.items || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    }

    useEffect(() => {
        fetchCart();
    }, []);

    // Add product to cart
    const addToCart = async (productId) => {
        try {
            await authFetch(`${BASEURL}/api/cart/add/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: productId }),
            });
            fetchCart();  // Refresh cart
        } catch (error) {
            console.error("Error adding to cart:", error);
        }
    }

    // Remove product from cart
    const removeFromCart = async (itemId) => {
        try {
            await authFetch(`${BASEURL}/api/cart/remove/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_id: itemId }),
            });
            fetchCart();  // Refresh cart
        } catch (error) {
            console.error("Error removing from cart:", error);
        }
    }

    // Update quantity
    const updateQuantity = async (itemId, quantity) => {
        if (quantity < 1) {
            await removeFromCart(itemId);
            return;
        }
        try {
            await authFetch(`${BASEURL}/api/cart/update/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_id: itemId, quantity }),
            });
            fetchCart();  // Refresh cart
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    }

    const clearCart = () => {
        setCartItems([]);
        setTotal(0);
    }

    // Provide these to entire app
    return (
        <CartContext.Provider
            value={{ cartItems, total, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

// Hook to use cart anywhere
export const useCart = () => useContext(CartContext);
```

**Why?** Context allows any component to access cart without passing props.

---

## STEP 10: CREATE PRODUCT LIST PAGE (frontend/src/pages/ProductList.jsx)

```javascript
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard.jsx";

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;

    useEffect(() => {
        // When page loads, fetch all products
        fetch(`${BASEURL}/api/products/`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch products");
                }
                return response.json();
            })
            .then((data) => {
                setProducts(data);
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold text-center py-5">Product List</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
                {products.length > 0 ? (
                    products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <p>No products available.</p>
                )}
            </div>
        </div>
    );
}

export default ProductList;
```

---

## STEP 11: CREATE PRODUCT CARD (frontend/src/components/ProductCard.jsx)

```javascript
import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;
  return (
    <Link to={`/product/${product.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform p-4 cursor-pointer">
        <img
          src={`${BASEURL}${product.image}`}
          alt={product.name}
          className="w-full h-56 object-cover rounded-lg mb-4"
        />
        <h2 className="text-lg font-semibold text-gray-800 truncate">
          {product.name}
        </h2>
        <p className="text-gray-600 font-medium">${product.price}</p>
      </div>
    </Link>
  );
}

export default ProductCard;
```

---

## STEP 12: SETUP REACT ROUTER (frontend/src/App.jsx)

```javascript
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import Navbar from './components/Navbar';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRouter from './components/PrivateRouter';

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<CartPage />} />
                
                {/* Protected route - only logged-in users can access */}
                <Route element={<PrivateRouter />}>
                    <Route path="/checkout" element={<CheckoutPage />} />
                </Route>
                
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Routes>
        </Router>
    );
}

export default App;
```

**Routes:**
- `/` → Show all products
- `/product/:id` → Show one product
- `/cart` → Shopping cart
- `/checkout` → Checkout (protected)
- `/login` → Login page
- `/signup` → Sign up page

---

## STEP 13: CREATE PRODUCT DETAILS PAGE (frontend/src/pages/ProductDetails.jsx)

```javascript
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();  // Get product ID from URL
  const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    // Fetch THIS specific product
    fetch(`${BASEURL}/api/products/${id}/`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch");
        return response.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, [id, BASEURL]);

  const handleAddToCart = () => {
    // Check if logged in
    if (!localStorage.getItem('access_token')) {
      window.location.href = '/login';
      return;
    }
    addToCart(product.id);
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center py-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-3xl w-full">
        <div className="flex flex-col md:flex-row gap-8">
          <img
            src={`${product.image}`}
            alt={product.name}
            className="w-full md:w-1/2 h-auto object-cover rounded-lg"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {product.name}
            </h1>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <p className="text-2xl font-semibold text-green-600 mb-6">
              ${product.price}
            </p>
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Add to Cart 🛒
            </button>
            <div className="mt-4">
              <a href="/" className="text-blue-600 hover:underline">
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
```

---

## STEP 14: CREATE CART PAGE (frontend/src/pages/CartPage.jsx)

```javascript
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

function CartPage() {
    const { cartItems, total, removeFromCart, updateQuantity } = useCart();
    const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;

    return (
        <div className="pt-20 min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">🛒 Your Cart</h1>
            
            {cartItems.length === 0 ? (
                <p className="text-center text-gray-600">Your cart is empty.</p>
            ) : (
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between mb-4 border-b pb-4">
                            <div className="flex items-center gap-4">
                                {item.product_image && (
                                    <img
                                        src={`${BASEURL}${item.product_image}`}
                                        alt={item.product_name}
                                        className="w-20 h-20 object-cover rounded"
                                    />
                                )}
                                <div>
                                    <h2 className="text-lg font-semibold">{item.product_name}</h2>
                                    <p className="text-gray-600">${item.product_price}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    className="bg-gray-300 px-3 py-1 rounded"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                    -
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                    className="bg-gray-300 px-3 py-1 rounded"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    +
                                </button>
                                <button
                                    className="text-red-500 ml-4"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="border-t pt-4 mt-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold">Total:</h2>
                        <p className="text-xl font-semibold">${total.toFixed(2)}</p>
                        <Link
                            to="/checkout"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CartPage;
```

---

## STEP 15: CREATE CHECKOUT PAGE (frontend/src/pages/CheckoutPage.jsx)

```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/auth";
import { useCart } from "../context/CartContext";

function CheckoutPage() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    payment_method: "COD",
  });

  const nav = useNavigate();
  const { clearCart } = useCart();
  const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await authFetch(`${BASEURL}/api/orders/create/`, {
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        clearCart();
        alert("Order placed successfully!");
        nav("/");
      } else {
        alert(data.error || "Order failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  return (
    <div className="pt-20 p-6">
      <div className="max-w-lg mx-auto bg-white p-6 shadow rounded">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
            className="w-full p-2 border rounded"
          />

          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            required
            className="w-full p-2 border rounded"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            required
            className="w-full p-2 border rounded"
          />

          <select
            name="payment_method"
            value={form.payment_method}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="COD">Cash on Delivery</option>
            <option value="ONLINE">Online Payment</option>
          </select>

          <button className="w-full bg-green-600 text-white py-2 rounded">
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
}

export default CheckoutPage;
```

---

## STEP 16: CREATE LOGIN/SIGNUP PAGES

**Login (frontend/src/pages/Login.jsx):**
```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveTokens } from "../utils/auth";

function Login() {
  const BASE = import.meta.env.VITE_DJANGO_BASE_URL;
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  const handleChange = e => setForm({...form, [e.target.name]: e.target.value});

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch(`${BASE}/api/token/`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        saveTokens(data);  // Save tokens to localStorage
        setMsg("Login successful!");
        setTimeout(()=>nav("/"), 800);
      } else {
        setMsg(data.detail || "Invalid credentials");
      }
    } catch(err) {
      console.error(err);
      setMsg("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="username" onChange={handleChange} value={form.username} placeholder="Username" required className="w-full p-2 border rounded"/>
          <input name="password" type="password" onChange={handleChange} value={form.password} placeholder="Password" required className="w-full p-2 border rounded"/>
          <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
        </form>
        {msg && <p className="mt-3 text-sm">{msg}</p>}
        <div className="mt-4 text-sm">
          Don't have an account? <a href="/signup" className="text-blue-600 hover:underline">Sign up</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
```

**Signup (frontend/src/pages/Signup.jsx):**
```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const BASE = import.meta.env.VITE_DJANGO_BASE_URL;
  const [form, setForm] = useState({ username: "", email: "", password: "", password2: "" });
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  const handleChange = e => setForm({...form, [e.target.name]: e.target.value});

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch(`${BASE}/api/register/`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if(res.ok) {
        setMsg("Account created. Redirecting to login...");
        setTimeout(()=>nav("/login"), 1200);
      } else {
        setMsg(data.username || data.password || JSON.stringify(data));
      }
    } catch(err) {
      console.error(err);
      setMsg("Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Signup</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="username" onChange={handleChange} value={form.username} placeholder="Username" required className="w-full p-2 border rounded"/>
          <input name="email" type="email" onChange={handleChange} value={form.email} placeholder="Email" className="w-full p-2 border rounded"/>
          <input name="password" type="password" onChange={handleChange} value={form.password} placeholder="Password" required className="w-full p-2 border rounded"/>
          <input name="password2" type="password" onChange={handleChange} value={form.password2} placeholder="Confirm Password" required className="w-full p-2 border rounded"/>
          <button className="w-full bg-blue-600 text-white py-2 rounded">Create Account</button>
        </form>
        {msg && <p className="mt-3 text-sm">{msg}</p>}
      </div>
    </div>
  );
}

export default Signup;
```

---

## STEP 17: CREATE NAVBAR (frontend/src/components/Navbar.jsx)

```javascript
import {Link, useNavigate} from 'react-router-dom';
import {useCart} from '../context/CartContext.jsx';
import { clearTokens, getAccessToken } from '../utils/auth.js';

function Navbar() {
    const {cartItems} = useCart();
    const navigate = useNavigate();
    
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const isLoggedIn = !!getAccessToken();

    const handleLogout = () => {
        clearTokens();
        navigate('/login');
    };
    
    return (
        <nav className='bg-white shadow-md px-6 py-6 flex justify-between items-center fixed w-full top-0 z-50'>
            <Link to='/' className='text-2xl font-bold text-gray-800'>
                🛍️ MohitCart
            </Link>

            <div className='flex items-center gap-6'>
                {/* Login/Signup or Logout */}
                {!isLoggedIn ? (
                    <>
                        <Link to='/login' className='text-gray-800 hover:text-gray-600 font-medium'>
                            Login
                        </Link>
                        <Link to='/signup' className='text-gray-800 hover:text-gray-600 font-medium'>
                            Sign Up
                        </Link>
                    </>
                ) : (
                    <button onClick={handleLogout} className='text-gray-800 hover:text-gray-600 font-medium'>
                        Logout
                    </button>
                )}
            </div>

            {/* Cart Icon */}
            <Link to='/cart' className='relative text-gray-800 hover:text-gray-600 font-medium'>
                🛒 Cart
                {cartCount > 0 && (
                    <span className='absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full px-2'>
                        {cartCount}
                    </span>
                )}
            </Link>
        </nav>
    );
}

export default Navbar;
```

---

## STEP 18: PROTECTED ROUTES (frontend/src/components/PrivateRouter.jsx)

```javascript
import {Navigate, Outlet} from "react-router-dom";

const isAuthenticated = () => !!localStorage.getItem("access_token");

export default function PrivateRouter({redirectTo = "/login"}) {
    return isAuthenticated() ? <Outlet /> : <Navigate to={redirectTo} replace/>;
}
```

**Why?** If user not logged in, redirect to login before accessing checkout.

---

## COMPLETE USER FLOW

### New User Signup & Shopping Flow:

```
1. User visits http://localhost:5173/
   ↓
2. ProductList page loads, fetches /api/products/
   ↓
3. Backend returns all products
   ↓
4. React displays products in a grid using ProductCard component
   ↓
5. User clicks on a product → URL changes to /product/1
   ↓
6. ProductDetails page loads, fetches /api/products/1/
   ↓
7. Backend returns ONE product with details
   ↓
8. React displays full product page
   ↓
9. User clicks "Add to Cart" but not logged in
   ↓
10. App redirects to /login
    ↓
11. User can sign up OR login
    ↓
12. Tokens saved to localStorage
    ↓
13. Redirected back to / (home page)
    ↓
14. User adds product to cart → authFetch sends /api/cart/add/ with token
    ↓
15. Backend receives token, identifies user, adds to their cart
    ↓
16. User clicks cart → CartPage shows all items
    ↓
17. User clicks "Proceed to Checkout"
    ↓
18. PrivateRouter checks token, allows access to /checkout
    ↓
19. User fills checkout form (name, address, phone)
    ↓
20. User clicks "Place Order" → POST /api/orders/create/
    ↓
21. Backend:
    - Validates phone number
    - Creates Order in database
    - Copies CartItems to OrderItems
    - Deletes cart items (clears cart)
    ↓
22. Frontend clears cart state
    ↓
23. Alert "Order placed successfully!"
    ↓
24. Redirected to home page
    ↓
25. User can now make another purchase
```

---

## DATABASE STRUCTURE

### How data relates:

```
User (Django's built-in)
├── Cart (one-to-one) → CartItem (one-to-many) → Product
├── Order (one-to-many) → OrderItem (one-to-many) → Product
└── UserProfile (one-to-one)

Category (one-to-many) → Product
```

### Example:
```
User "John" → 
  - Cart with 2 CartItems:
    * CartItem 1: Product "Bulb" (qty 2)
    * CartItem 2: Product "Table" (qty 1)
  - Orders:
    * Order 1 (from yesterday): OrderItem "Bulb" (qty 1)
    * Order 2 (from today): OrderItem "Perfume" (qty 3)
```

---

## KEY CONCEPTS FOR BEGINNERS

| Concept | What It Does |
|---------|--------------|
| **Models** | Define database structure (what data looks like) |
| **Serializers** | Convert database objects to JSON |
| **API Endpoints** | URLs where frontend fetches data from backend |
| **JWT Tokens** | Secure login without storing sessions |
| **useEffect** | "Run this code when component loads" |
| **useState** | "Store changing data" |
| **useContext** | "Share data across many components" |
| **useParams** | "Read variables from the URL" |
| **Components** | Reusable pieces of the website |
| **Routes** | Different pages in your website |
| **Context** | Global state management (share cart across app) |
| **authFetch** | Fetch with automatic Authorization header |
| **@property** | Computed fields in Python (like calculated total) |

---

## FILE STRUCTURE

```
backend/
  manage.py
  backend/
    settings.py          ← Database config, CORS, JWT settings
    urls.py              ← Main URL router
  store/
    models.py            ← Database models
    serializers.py       ← JSON converters
    views.py             ← API endpoints logic
    urls.py              ← API routes
    admin.py             ← Django admin setup

frontend/
  src/
    App.jsx              ← Routes setup
    main.jsx             ← App entry point with CartProvider
    index.css            ← Tailwind imports
    pages/
      ProductList.jsx    ← All products grid
      ProductDetails.jsx ← One product details
      CartPage.jsx       ← Shopping cart
      CheckoutPage.jsx   ← Checkout form
      Login.jsx          ← Login form
      Signup.jsx         ← Registration form
    components/
      Navbar.jsx         ← Navigation bar
      ProductCard.jsx    ← Reusable product card
      PrivateRouter.jsx  ← Protected route
    context/
      CartContext.jsx    ← Global cart state
    utils/
      auth.js            ← JWT token utilities
```

---

## WHAT YOU'VE BUILT

✅ **Backend:** Secure REST API with JWT authentication, product management, shopping cart, and order system
✅ **Frontend:** Beautiful React app with product browsing, shopping cart, user authentication, and checkout
✅ **Database:** Well-designed relational database with proper relationships
✅ **Security:** JWT tokens, protected endpoints, password validation
✅ **Styling:** Modern Tailwind CSS design

This is a **production-ready** e-commerce system!
