# STEP 1 – Project Setup and Basic Models

Create folders : frontend + backend
Create virtual environment in backend and install Django + DRF
PostgresSQL + .env setup 
React App Creation
Enable CORS between React and Django
Test API - React connection

# STEP 2 - Models + Serializers + Admin Setup + Tailwind CSS

create models: Category, Product, Userprofile, Order, OrderItem

Use Django Admin to add sample data for categories and products.

create DRF Serializers for product and category

expose /api/products/ and /api/categories/ endpoints

Tailwind CSS setup in React for styling

# STEP 3 - Frontend Product Listing Page

Fetch /api/products/ using useEffect + fetch()

Display products in a grid(image, name, price)

Add loading + error states

Tailwind styling for product cards


# STEP 4 - Product Detail Page and Routing

Setup React Router DOM

Create ProductDeatils.jsx page

Fetch /api/products/:id/ to get product details

Dispaly product image,description, price

Add "Add to Cart" button (functionality will be added later)


# STEP 5 - Cart Functionality in Backend

Create Carat and CartItem models

expose /api/cart , /api/cart/add , /api/cart/remove

use fetch() to sync React cart state with backend API

# STEP 6 - Cart Page in React

Add product to cart from detail page

use Context API for cart state

Display cart items in CartPage

Update quantity(+,-) and remove item functionality


# STEP 7 - Cart Functionality(Frontend + Backend)

Update Cart Quantity (+,-) for Djnago

Django API Integartion

FE implementation for update quantity and remove item


# STEP 8 - Checkout & Order Placement

Create chekout form(Address,Phone,Payment method dropdown)

API endoint to create

React frontend form -> POST to /api/orders/create/

Show success message after placing order

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

