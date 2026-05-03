# STEP 1 – Project Setup and Backend Configuration

Goal:
In this step, I set up the complete project structure with separate frontend and backend folders, installed Django and DRF, configured PostgreSQL, and verified that React and Django could communicate.

1) Create backend and frontend folders

I created two separate directories at the root of the project:
- backend/ for Django REST API
- frontend/ for React app

Why:
This separation kept the backend and frontend code organized and allowed them to run independently.

2) Set up Python virtual environment in backend

I created a virtual environment inside the backend folder and activated it.

Why:
This isolated the Python dependencies for the backend project so they wouldn't conflict with system Python or other projects.

3) Install Django and Django REST Framework

Command:
pip install django djangorestframework

Why:
Django is the web framework and Django REST Framework provides tools to build REST APIs.

4) Create Django project and app

I created a Django project called backend and an app called store.

Why:
The store app would hold all the ecommerce models, views, and serializers.

5) Set up .env file and environment variables

I created a .env file in the backend folder with PostgreSQL connection details:
- DB_NAME
- DB_USER
- DB_PASSWORD
- DB_HOST
- DB_PORT

Why:
This kept sensitive database credentials out of the code.

6) Configure PostgreSQL connection in settings.py

I updated backend/settings.py to:
- Import dotenv and load environment variables
- Configure DATABASES to use PostgreSQL with environment variables
- Add CORS middleware
- Add rest_framework and store to INSTALLED_APPS

Why:
This connected Django to the PostgreSQL database and allowed the React app to make requests to the Django server.

7) Create React app with Vite

I created a React project using Vite in the frontend folder.

npm create vite@latest frontend -- --template react

Why:
Vite provides a fast development server for React and modern tooling for building the frontend.

8) Install Tailwind CSS in React

I installed Tailwind CSS and set up the @tailwindcss/vite plugin for styling.

Why:
Tailwind provided utility classes for quick UI styling without writing custom CSS.

9) Enable CORS in Django settings

I configured CORS to allow requests from the React app running on localhost:3000.

CORS_ALLOW_ALL_ORIGINS = ["http://localhost:3000"]

Why:
Without this, the browser would block requests from React to Django due to cross-origin restrictions.

10) Create basic folder structure in React

I organized the frontend with:
- src/pages/ for page components
- src/components/ for reusable components
- src/context/ for shared state

Why:
This structure made the React code easy to navigate and maintain.

11) Test React to Django communication

I started both servers:
- Django: python manage.py runserver
- React: npm run dev

Then I confirmed that the React app could send requests to the Django server.

Why:
This verified that both projects were running and could communicate before building features.

Conclusion:
The project infrastructure was ready with a working backend, database connection, and React frontend that could communicate with Django.

# STEP 2 – Models, Serializers, Admin Setup, and Tailwind Styling

Goal:
In this step, I created the core database models for the ecommerce project, registered them in Django Admin, added sample data, created serializers to expose the data as JSON, and styled the frontend with Tailwind CSS.

1) Create ecommerce models in store/models.py

I created five main models:
- Category: stores product categories with name and slug
- Product: stores product details including name, description, price, image, and category link
- UserProfile: stores extra user info like phone and address
- Order: stores order records with user link and total amount
- OrderItem: stores individual items within each order

Why:
These models formed the database structure for the ecommerce platform.

2) Add relationships between models

I created foreign key relationships:
- Product has ForeignKey to Category
- Order has ForeignKey to User
- OrderItem has ForeignKey to Order and Product
- UserProfile has OneToOneField to User

Why:
These relationships ensured data integrity and allowed querying related records.

3) Register models in Django Admin

I added all models to store/admin.py:

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(UserProfile)
admin.site.register(Order)
admin.site.register(OrderItem)

Why:
This made the models accessible in the Django admin panel for easy data management.

4) Create a superuser for admin access

I ran the command:
python manage.py createsuperuser

Why:
This created an admin account to log into the Django admin panel and manage data.

5) Add sample data through Django Admin

I logged into http://localhost:8000/admin/ and created:
- 3-4 sample categories
- 10-15 sample products in those categories

Why:
Sample data provided real data for testing the API and frontend features.

6) Create CategorySerializer

I created a serializer in store/serializers.py:

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

Why:
This serializer converted Category objects into JSON for API responses.

7) Create ProductSerializer

I created a serializer that includes the related Category data:

class ProductSerializer(serializers.ModelSerializer):
    Category = CategorySerializer(read_only=True)
    class Meta:
        model = Product
        fields = "__all__"

Why:
This allowed API responses to include the full category information along with product data.

8) Create API view for getting all products

I added a GET endpoint in store/views.py:

@api_view(["GET"])
def get_products(request):
    Products = Product.objects.all()
    serializer = ProductSerializer(Products, many=True)
    return response.Response(serializer.data)

Why:
This endpoint allowed the frontend to fetch all products as JSON.

9) Create API view for getting a single product

I added a GET endpoint for individual products:

@api_view(["GET"])
def get_product(request, pk):
    product = Product.objects.get(pk=pk)
    serializer = ProductSerializer(product)
    return response.Response(serializer.data)

Why:
This endpoint let the frontend fetch details for one product at a time.

10) Create API view for categories

I added a GET endpoint for categories:

@api_view(["GET"])
def get_categories(request):
    Categories = Category.objects.all()
    serializer = CategorySerializer(Categories, many=True)
    return response.Response(serializer.data)

Why:
This endpoint provided the list of categories for the frontend.

11) Add URL routes in store/urls.py

I configured the routes:

urlpatterns = [
    path("products/", views.get_products),
    path("products/<int:pk>/", views.get_product),
    path("categories/", views.get_categories),
]

Why:
These routes mapped the API views to specific URLs the frontend could call.

12) Import MEDIA_URL and MEDIA_ROOT settings

I configured Django to serve product images:

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

Why:
This allowed Django to store and serve product image files.

13) Use Tailwind utility classes for layout

I styled the React app with Tailwind classes for margins, padding, colors, and typography.

Why:
Tailwind's utility classes made it fast to build styled UI without custom CSS.

Conclusion:
The backend now had a complete database model structure with admin access, three API endpoints for products and categories, and the frontend had Tailwind CSS ready for styling.

# STEP 3 – Frontend Product Listing Page

Goal:
In this step, I built the product listing page that fetches products from the backend API and displays them in a responsive grid with loading and error handling.

1) Create ProductList.jsx page

I created a React functional component in frontend/src/pages/ProductList.jsx.

Why:
This page would be the main homepage showing all products.

2) Import useState and useEffect hooks

I imported these React hooks to manage component state and side effects.

Why:
useState managed the products data, loading state, and error state.
useEffect ran the API fetch when the component mounted.

3) Define state variables

I created three state variables:

const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

Why:
products stored the fetched product data
loading tracked whether data was still being fetched
error stored any error messages

4) Get the backend API URL from environment

I read the backend URL from environment variables:

const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://localhost:8000";

Why:
This made the app work with different backend URLs in different environments.

5) Fetch products using useEffect and fetch()

I created a useEffect hook that runs when the component mounts:

useEffect(() => {
    fetch(`${BASE_URL}/api/products/`)
        .then(response => response.json())
        .then(data => {
            setProducts(data);
            setLoading(false);
        })
        .catch(err => {
            setError(err.message);
            setLoading(false);
        });
}, [BASE_URL]);

Why:
This automatically called the backend API when the page loaded and stored the results.

6) Handle loading state in UI

I displayed a loading message while data was being fetched:

if (loading) return <div>Loading...</div>;

Why:
Users saw feedback that the page was working while waiting for data.

7) Handle error state in UI

I displayed an error message if the fetch failed:

if (error) return <div>Error: {error}</div>;

Why:
Users could see if something went wrong instead of a blank page.

8) Create ProductCard component

I created frontend/src/components/ProductCard.jsx to display individual products:

function ProductCard({ product }) {
    return (
        <div>
            <img src={product.image} />
            <h2>{product.name}</h2>
            <p>${product.price}</p>
        </div>
    );
}

Why:
ProductCard kept the product display logic separate and reusable.

9) Render products in a grid

I used Tailwind grid classes to display products:

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
    {products.map(product => <ProductCard key={product.id} product={product} />)}
</div>

Why:
This created a responsive grid that adapted to different screen sizes.

10) Style product cards with Tailwind

I added Tailwind classes to ProductCard for styling:
- bg-white for background
- rounded-xl for rounded corners
- shadow-md for shadow
- hover:scale effects

Why:
Tailwind made the cards look polished and professional.

11) Add no products message

I showed a message if the API returned no products:

{products.length > 0 ? (...) : <p>No products available.</p>}

Why:
This gave users feedback when there was no data.

Conclusion:
The ProductList page could fetch products from the backend, display them in a styled grid, and handle loading and error states.

# STEP 4 – Product Detail Page and Routing

Goal:
In this step, I set up React Router for page navigation and created a product detail page that shows complete product information and displays an Add to Cart button.

1) Install React Router DOM

I installed React Router in the frontend:

npm install react-router-dom

Why:
React Router enabled page navigation without page reloads.

2) Wrap App with Router

I modified frontend/src/main.jsx to wrap the app with Router:

import { BrowserRouter as Router } from "react-router-dom";

<Router>
    <App />
</Router>

Why:
This enabled routing for the entire app.

3) Set up routes in App.jsx

I imported Routes and Route and defined the app routes:

<Routes>
    <Route path="/" element={<ProductList />} />
    <Route path="/product/:id" element={<ProductDetails />} />
</Routes>

Why:
This mapped URLs to specific page components.

4) Create ProductDetails.jsx page

I created a new component in frontend/src/pages/ProductDetails.jsx to show one product.

Why:
This page displayed full product information instead of just a preview.

5) Use useParams hook to get product id from URL

I extracted the product id from the route:

const { id } = useParams();

Why:
This let the component know which product to fetch based on the URL.

6) Fetch single product by id

I created a useEffect that fetches the product:

useEffect(() => {
    fetch(`${BASE_URL}/api/products/${id}/`)
        .then(response => response.json())
        .then(data => setProduct(data))
        .catch(err => setError(err.message));
}, [id, BASE_URL]);

Why:
This loaded the product data from the backend using the id from the URL.

7) Handle loading and error states

I displayed loading and error messages like in ProductList.

Why:
Users got feedback while the product was loading or if something went wrong.

8) Display product image

I rendered the product image in a large size:

<img src={product.image} className="w-full md:w-1/2 rounded-lg" />

Why:
This gave customers a clear view of the product.

9) Display product name and description

I showed the full product name and description text:

<h1>{product.name}</h1>
<p>{product.description}</p>

Why:
Customers could read complete details about the product.

10) Display product price

I showed the price in a prominent way:

<p className="text-2xl font-semibold text-green-600">${product.price}</p>

Why:
The price was easily visible to customers.

11) Add Add to Cart button

I added a button labeled "Add to Cart":

<button>Add to Cart 🛒</button>

Why:
This prepared the UI for future cart functionality.

12) Add back navigation link

I added a link to return to the product list:

<Link to="/">← Back to Home</Link>

Why:
Users could easily navigate back without using browser back button.

13) Link ProductCard to product detail page

I wrapped ProductCard in a Link component:

<Link to={`/product/${product.id}`}>
    <ProductCard product={product} />
</Link>

Why:
Clicking a product on the list now navigated to its detail page.

Conclusion:
The app now had two pages connected by React Router, and the product detail page displayed complete product information with navigation.

# STEP 5 – Cart Models and Backend Cart Endpoints

Goal:
In this step, I created Cart and CartItem models to store products in user carts, and built backend API endpoints to manage cart operations.

1) Create Cart model

I added a Cart model in store/models.py:

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

Why:
This model stored shopping carts, linked to users.

2) Create CartItem model

I added a CartItem model to store products inside a cart:

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

Why:
This model stored individual products added to a cart with their quantities.

3) Add total property to CartItem

I added a property to calculate item total:

@property
def total(self):
    return self.quantity * self.product.price

Why:
This calculated the subtotal for each cart item automatically.

4) Add total property to Cart

I added a property to sum all items:

@property
def total(self):
    return sum(item.total for item in self.items.all())

Why:
This calculated the cart total automatically.

5) Create CartItemSerializer

I created a serializer in store/serializers.py:

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_price = serializers.DecimalField(source="product.price", max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.ImageField(source="product.image", read_only=True)
    class Meta:
        model = CartItem
        fields = "__all__"

Why:
This serializer returned cart items with product details included.

6) Create CartSerializer

I created a serializer for the Cart model:

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.ReadOnlyField()
    class Meta:
        model = Cart
        fields = "__all__"

Why:
This serializer returned the full cart with all items and total.

7) Create get_cart view

I added a GET endpoint in store/views.py:

@api_view(["GET"])
def get_cart(request):
    cart, created = Cart.objects.get_or_create(user=None)
    serializer = CartSerializer(cart)
    return response.Response(serializer.data)

Why:
This endpoint returned the current cart data for the frontend.

8) Create add_to_cart view

I added a POST endpoint to add products to cart:

@api_view(["POST"])
def add_to_cart(request):
    product_id = request.data.get("product_id")
    product = get_object_or_404(Product, id=product_id)
    cart, created = Cart.objects.get_or_create(user=None)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    if not created:
        item.quantity += 1
        item.save()
    return response.Response({"message": "Product added to cart"}, status=200)

Why:
This endpoint let the frontend add products to the cart or increase quantity if already present.

9) Create remove_from_cart view

I added a POST endpoint to remove items:

@api_view(["POST"])
def remove_from_cart(request):
    item_id = request.data.get("item_id")
    CartItem.objects.filter(id=item_id).delete()
    return response.Response({"message": "Product removed from cart"})

Why:
This endpoint let users remove items from their cart.

10) Add routes for cart endpoints

I added these routes to store/urls.py:

path("cart/", views.get_cart),
path("cart/add/", views.add_to_cart),
path("cart/remove/", views.remove_from_cart),

Why:
These routes made the cart endpoints accessible to the frontend.

11) Register Cart and CartItem in admin

I registered the new models:

admin.site.register(Cart)
admin.site.register(CartItem)

Why:
This made carts visible in Django Admin for testing and debugging.

Conclusion:
The backend now had Cart and CartItem models with three API endpoints for cart operations.

# STEP 6 – Cart Context and React Cart Page

Goal:
In this step, I created a React Context for managing cart state globally, built a CartPage to display cart items, and added an Add to Cart button that actually adds products to the cart.

1) Create CartContext.jsx

I created frontend/src/context/CartContext.jsx to manage cart state:

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    ...
}

Why:
Context provided cart state globally without passing props through all components.

2) Create fetchCart function

Inside CartProvider, I created a function to fetch cart data:

const fetchCart = async () => {
    const res = await fetch(`${BASE_URL}/api/cart/`);
    const data = await res.json();
    setCartItems(data.items || []);
    setTotal(data.total || 0);
}

Why:
This function fetched the current cart from the backend.

3) Call fetchCart in useEffect

I used useEffect to fetch cart when component mounts:

useEffect(() => {
    fetchCart();
}, [BASE_URL]);

Why:
The cart loaded automatically when the app started.

4) Create addToCart function

I created a function to add products to cart:

const addToCart = async (productId) => {
    await fetch(`${BASE_URL}/api/cart/add/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId })
    });
    fetchCart();
}

Why:
This function called the backend to add a product and refreshed the cart.

5) Create removeFromCart function

I created a function to remove items:

const removeFromCart = async (itemId) => {
    await fetch(`${BASE_URL}/api/cart/remove/`, {
        method: "POST",
        body: JSON.stringify({ item_id: itemId })
    });
    fetchCart();
}

Why:
This function removed items from the backend and refreshed.

6) Export CartContext provider

I exported the CartProvider so the app could use it:

export const CartProvider = ({ children }) => { ... }

Why:
This allowed the entire app to access cart state.

7) Create useCart hook

I exported a custom hook to access cart context:

export const useCart = () => {
    return useContext(CartContext);
}

Why:
Components could easily access cart functions with useCart() instead of useContext.

8) Wrap App with CartProvider

I modified frontend/src/main.jsx:

<CartProvider>
    <App />
</CartProvider>

Why:
This made cart state available to all components in the app.

9) Connect Add to Cart button to addToCart

In ProductDetails.jsx, I connected the button:

const { addToCart } = useCart();
<button onClick={() => addToCart(product.id)}>Add to Cart 🛒</button>

Why:
Clicking the button now actually added the product to the cart via the backend.

10) Create CartPage.jsx

I created frontend/src/pages/CartPage.jsx to display cart items:

function CartPage() {
    const { cartItems, total } = useCart();
    return (
        <div>
            {cartItems.map(item => (...))}
            <p>Total: ${total}</p>
        </div>
    );
}

Why:
This page showed all items currently in the cart.

11) Display each cart item

I rendered each item with name, price, quantity:

{cartItems.map(item => (
    <div key={item.id}>
        <p>{item.product_name}</p>
        <p>Price: ${item.product_price}</p>
        <p>Qty: {item.quantity}</p>
    </div>
))}

Why:
Users could see what was in their cart.

12) Add route for CartPage

I added a route in App.jsx:

<Route path="/cart" element={<CartPage />} />

Why:
Users could navigate to the cart page via URL.

13) Add link to CartPage in Navbar

I added a link so users could easily access the cart.

Why:
Users could get to their cart from any page.

Conclusion:
The app now had a working cart system with React Context managing state and backend endpoints handling cart operations.

# STEP 7 – Cart Quantity Update Endpoint and Frontend Implementation

Goal:
In this step, I added an endpoint to update cart item quantities and implemented the +/- buttons on the CartPage to increase or decrease quantities.

1) Create update_cart_quantity view

I added a POST endpoint in store/views.py:

@api_view(["POST"])
def update_cart_quantity(request):
    item_id = request.data.get("item_id")
    quantity = request.data.get("quantity")
    
    if quantity < 1:
        CartItem.objects.get(id=item_id).delete()
        return response.Response({"error": "Quantity must be at least 1"}, status=400)
    
    item = CartItem.objects.get(id=item_id)
    item.quantity = quantity
    item.save()
    serializer = CartItemSerializer(item)
    return response.Response(serializer.data)

Why:
This endpoint updated the quantity for a cart item, or deleted it if quantity went below 1.

2) Add route for update endpoint

I added to store/urls.py:

path("cart/update/", views.update_cart_quantity),

Why:
This made the update endpoint accessible to the frontend.

3) Create updateQuantity function in CartContext

I added a function to CartContext:

const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
        await removeFromCart(itemId);
        return;
    }
    await fetch(`${BASE_URL}/api/cart/update/`, {
        method: "POST",
        body: JSON.stringify({ item_id: itemId, quantity })
    });
    fetchCart();
}

Why:
This function called the backend to update quantity.

4) Add + and - buttons in CartPage

I displayed quantity controls:

<button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
<p>{item.quantity}</p>
<button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>

Why:
Users could easily increase or decrease item quantities.

5) Export updateQuantity from CartContext

I added it to the context provider:

export const CartProvider = ({ children }) => {
    ...
    return (
        <CartContext.Provider value={{ cartItems, total, addToCart, removeFromCart, updateQuantity }}>

Why:
Components could access the updateQuantity function via useCart().

6) Connect + button to increase quantity

In CartPage:

<button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>

Why:
Clicking + increased the item quantity by 1.

7) Connect - button to decrease quantity

In CartPage:

<button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>

Why:
Clicking - decreased the item quantity by 1.

8) Add remove button

I added a remove button next to each item:

<button onClick={() => removeFromCart(item.id)}>Remove</button>

Why:
Users could remove items individually without changing quantity.

9) Style the quantity controls with Tailwind

I added classes for spacing and appearance:

<button className="px-2 py-1 border rounded">+</button>

Why:
The buttons looked consistent with the rest of the app.

10) Show message when cart is empty

I displayed a message if no items:

{cartItems.length === 0 ? <p>Your cart is empty</p> : (...)}

Why:
Users knew when they hadn't added anything yet.

11) Display cart total

I showed the sum of all items:

<p className="text-2xl font-bold">Total: ${total}</p>

Why:
Users could see the total cost before checkout.

Conclusion:
The CartPage now had fully functional +/- buttons to adjust quantities and remove items.

# STEP 8 – Checkout Form and Order Creation

Goal:
In this step, I created a checkout page with a form for delivery details, connected it to an order creation endpoint, and showed success messages after placing orders.

1) Create CheckoutPage.jsx

I created a new page in frontend/src/pages/CheckoutPage.jsx.

Why:
This page would handle the final order submission.

2) Create form state for checkout details

I used useState to manage form fields:

const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    payment_method: "COD"
});

Why:
This stored the customer's delivery information.

3) Add name input field

I added an input for the customer's name:

<input name="name" value={form.name} onChange={handleChange} />

Why:
This captured the customer's name for the order.

4) Add address textarea field

I added a textarea for the delivery address:

<textarea name="address" value={form.address} onChange={handleChange} />

Why:
This captured the full delivery address.

5) Add phone number input field

I added an input for the phone number:

<input name="phone" value={form.phone} onChange={handleChange} />

Why:
This captured a contact number for delivery.

6) Add payment method dropdown

I added a select for payment options:

<select name="payment_method" value={form.payment_method} onChange={handleChange}>
    <option value="COD">Cash on Delivery</option>
    <option value="ONLINE">Online Payment</option>
</select>

Why:
This let customers choose their payment method.

7) Create handleChange function

I created a function to update form state:

const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
}

Why:
This updated the form state when users typed.

8) Create handleSubmit function

I created a function to submit the order:

const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${BASE_URL}/api/orders/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
        setMessage("Order placed successfully!");
        clearCart();
    }
}

Why:
This sent the form data to the backend to create an order.

9) Add submit button to form

I added a button that calls handleSubmit:

<button type="submit">Place Order</button>

Why:
Users clicked this to submit their order.

10) Show success message

I displayed a success message after order creation:

{message && <p className="text-green-700">{message}</p>}

Why:
Users saw confirmation that their order was placed.

11) Clear cart after order

I called clearCart() after successful order creation:

clearCart();

Why:
The cart was emptied for the next shopping session.

12) Redirect to home after delay

I redirected the user after showing the message:

setTimeout(() => {
    navigate("/");
}, 2000);

Why:
Users automatically returned to the home page after a brief success message.

13) Add route for CheckoutPage

I added to App.jsx:

<Route path="/checkout" element={<CheckoutPage />} />

Why:
Users could navigate to the checkout page.

14) Add link to checkout from CartPage

I added a checkout button in CartPage:

<Link to="/checkout">Proceed to Checkout</Link>

Why:
Users could move from cart to checkout.

15) Create clearCart function in CartContext

I added a function to clear the cart:

const clearCart = () => {
    setCartItems([]);
    setTotal(0);
}

Why:
This cleared the cart state in React after order completion.

16) Handle form validation

The backend validated phone number and cart status.

Why:
Invalid orders were rejected with error messages.

Conclusion:
Users could now fill out a checkout form and place orders, which cleared the cart after successful submission.

# STEP 9 – JWT Authentication Setup and Protected Cart/Order Flow

Goal:
In this step, I added JWT authentication to my Django backend so users can register, log in, and access protected routes like cart and order using tokens.

1) Install SimpleJWT

Command:
python -m pip install djangorestframework-simplejwt

Why:
This package adds JWT login support to Django REST Framework. It gives built-in token views like /token/ and /token/refresh/.

2) Configure JWT in backend/settings.py

I added:
- "rest_framework"
- "rest_framework_simplejwt"

to INSTALLED_APPS.

Then I added REST_FRAMEWORK settings so DRF uses JWTAuthentication.
This tells Django REST Framework to read JWT tokens from the Authorization header and identify the logged-in user.

I also added SIMPLE_JWT settings:
- access token valid for 60 minutes
- refresh token valid for 1 day
- header type should be Bearer

This is why requests later worked with:
Authorization: Bearer <token>

3) Create serializers in store/serializers.py

I added UserSerializer:
This is used to return safe user data like id, username, and email.

I added RegisterSerializer:
This is used for signup.
It accepts:
- username
- email
- password
- password2

I added validate() to check password == password2.
This prevents wrong signup input.

I added create() to create the user using User.objects.create_user().
This is important because create_user() hashes the password before saving.

4) Add JWT and register URLs in store/urls.py

I imported:
- TokenObtainPairView
- TokenRefreshView

Then I added routes:
- /register/ → for new user signup
- /token/ → for login and getting access + refresh token
- /token/refresh/ → for getting a new access token

5) Add required imports in store/views.py

I imported:
- api_view
- permission_classes
- IsAuthenticated
- AllowAny
- RegisterSerializer
- UserSerializer

These were needed so I could create API views and protect them properly.

6) Add register_view

I created register_view as a POST API view.

Flow:
- request.data gets signup form data
- RegisterSerializer validates it
- serializer.save() creates the user
- response returns success message + user data

Important:
This view must use AllowAny, not IsAuthenticated, because new users need to register before login.

7) Protect cart-related views

I added @permission_classes([IsAuthenticated]) to:
- get_cart
- add_to_cart
- update_cart_quantity
- remove_from_cart

Why:
Only logged-in users should access cart operations.

8) Update cart logic to use request.user

I changed cart logic to:
cart, created = Cart.objects.get_or_create(user=request.user)

Why:
After JWT authentication, DRF sets request.user from the token.
So now each logged-in user gets their own cart.

9) Add create_order view

I created create_order as a protected POST API view.

Flow:
- get name, address, phone, payment_method from request.data
- validate phone number
- get logged-in user’s cart
- check cart is not empty
- calculate total amount
- create Order
- create OrderItem for each cart item
- clear cart after order
- return success response with order id

This made checkout/order creation work only for logged-in users.

10) React side

I created Login and Signup pages.

Signup page sends data to /api/register/
Login page sends data to /api/token/

After successful login, backend returns:
- access token
- refresh token

11) Store tokens in localStorage

I stored:
- access token
- refresh token

in localStorage so React can use them in future API requests.

12) Send token in headers for protected requests

For cart and order routes, I sent:
Authorization: Bearer <token>

This is required because backend JWT auth is expecting Bearer token in the header.

13) Protect cart and order pages in React

I made cart and order pages available only for logged-in users.
If token is missing, user should be redirected to login.

14) Test everything using Thunder Client

First I tested /api/token/ and got access token successfully.

Then I tested GET /api/cart/ using:
Authorization: Bearer <token>
and cart data came successfully.

Then I tested POST /api/cart/add/ with:
{
  "product_id": 1
}
and product was added successfully.

Then I tested POST /api/orders/create/ with:
{
  "name": "John Doe",
  "address": "123 Main St",
  "phone": "1234567890",
  "payment_method": "COD"
}
and the order was created successfully and cart got cleared.

Conclusion:
This step connected authentication + cart + order flow together.
Now backend can identify the logged-in user through JWT and allow only authenticated users to use cart and order APIs.

# STEP 10 - Frontend Login and Signup Pages with JWT Authentication

Goal:
In this step, I created a complete authentication system for the frontend, including JWT token management utilities, authentication utility functions, route protection, and integrated login/signup pages.

1) Create auth.js utility file

I created frontend/src/utils/auth.js to centralize all authentication logic.

Why:
A dedicated utilities file made token management reusable across the entire application.

2) Implement saveToken function

I created a function to store JWT tokens in localStorage:

export const saveToken = (token) => {
    localStorage.setItem("access_token", token.access);
    localStorage.setItem("refresh_token", token.refresh);
}

Why:
After successful login, this function saves both access and refresh tokens from the backend response to localStorage for use in subsequent API requests.

3) Implement clearToken function

I created a function to remove tokens on logout:

export const clearToken = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}

Why:
When a user logs out, both tokens are removed from localStorage to clear the authentication state.

4) Implement getAccessToken function

I created a function to retrieve the stored access token:

export const getAccessToken = () => {
    return localStorage.getItem("access_token");
}

Why:
This function provides easy access to the token for authentication checks and API requests throughout the app.

5) Implement authFetch utility function

I created a custom fetch wrapper that automatically includes the Bearer token:

export const authFetch = async (url, options = {}) => {
    const token = getAccessToken();
    const headers = options.headers ? { ...options.headers } : {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    headers["Content-Type"] = "application/json";

    return fetch(url, { ...options, headers });
}

Why:
This wrapper eliminates code repetition. Every authenticated API call automatically includes the Bearer token in the Authorization header without needing to manually add it each time.

6) Create PrivateRouter component

I created frontend/src/components/PrivateRouter.jsx for route protection:

import { Navigate, Outlet } from "react-router-dom";

const isAuthenticated = () => !!localStorage.getItem("access_token");

export default function PrivateRouter({ redirectTo = "/login" }) {
    return isAuthenticated() ? <Outlet /> : <Navigate to={redirectTo} replace />;
}

Why:
This component checks if a user is authenticated before rendering protected pages. If not authenticated, it redirects to the login page.

7) Use PrivateRouter in App.jsx routes

I wrapped the checkout route with PrivateRouter:

<Route element={<PrivateRouter />}>
    <Route path="/checkout" element={<CheckoutPage />} />
</Route>

Why:
Only authenticated users can now access the checkout page. Unauthenticated users are redirected to /login.

8) Create Login.jsx page

I created frontend/src/pages/Login.jsx with a login form:

- Username and password input fields
- Form submission to /api/token/ endpoint
- Token storage using saveToken()
- Redirect to homepage on successful login
- Error message display for failed logins

Why:
This page allows users to authenticate and receive JWT tokens for API access.

9) Implement Login form submission

The login form sends credentials to the backend:

const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${BASE}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
    });
    const data = await response.json();
    if (response.ok) {
        saveToken(data);
        navigate("/");
    }
}

Why:
On successful login, tokens are saved and the user is redirected to the homepage.

10) Create Signup.jsx page

I created frontend/src/pages/Signup.jsx with a registration form:

- Username, email, and password input fields
- Password confirmation field
- Form submission to /api/register/ endpoint
- Redirect to login page after successful registration
- Error message display

Why:
New users can create an account and then log in with their credentials.

11) Update Navbar component with authentication

I updated Navbar.jsx to display different UI based on authentication state:

import { useNavigate } from 'react-router-dom';
import { clearToken, getAccessToken } from '../utils/auth.js';

function Navbar() {
    const isLoggedIn = !!getAccessToken();
    
    const handleLogout = () => {
        clearToken();
        navigate("/login");
    }

    return (
        <>
            {!isLoggedIn ? (
                <>
                    <Link to='/login' className='...'>Login</Link>
                    <Link to='/signup' className='...'>Sign Up</Link>
                </>
            ) : (
                <button onClick={handleLogout} className='...'>Logout</button>
            )}
        </>
    );
}

Why:
The navbar now displays Login/Signup links for unauthenticated users and a Logout button for authenticated users.

12) Use authFetch in CartContext

I updated CartContext.jsx to use the authFetch wrapper:

const fetchCart = async () => {
    const res = await authFetch(`${BASE_URL}/api/cart/`);
    const data = await res.json();
    setCartItems(data.items || []);
}

Why:
The cart operations now automatically include the Bearer token, so the backend can identify which user's cart to fetch.

13) Use authFetch in CheckoutPage

I updated CheckoutPage.jsx to use authFetch for order creation:

const res = await authFetch(`${BASE_URL}/api/orders/create/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
});

Why:
The order creation endpoint requires authentication, so authFetch automatically includes the user's token.

Conclusion:
The frontend now has a complete authentication system with secure JWT token management, protected routes for authenticated users, and login/signup pages. All authenticated API calls automatically include the Bearer token without repetitive code. Users can register, log in, access protected pages like checkout, and log out to clear their session.

