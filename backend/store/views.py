from rest_framework import response
from rest_framework.decorators import api_view
from .models import Category, Product, Cart, CartItem, Order, OrderItem
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    CartSerializer,
    CartItemSerializer,
)
from django.shortcuts import get_object_or_404


@api_view(["GET"])
def get_products(request):
    Products = Product.objects.all()
    serializer = ProductSerializer(Products, many=True)
    return response.Response(serializer.data)


@api_view(["GET"])
def get_product(request, pk):
    try:
        product = Product.objects.get(pk=pk)
        serializer = ProductSerializer(product, context={"request": request})
        return response.Response(serializer.data)
    except Product.DoesNotExist:
        return response.Response({"error": "Product not found"}, status=404)


@api_view(["GET"])
def get_categories(request):
    Categories = Category.objects.all()
    serializer = CategorySerializer(Categories, many=True)
    return response.Response(serializer.data)


@api_view(["GET"])
def get_cart(request):
    cart, created = Cart.objects.get_or_create(user=None)
    serializer = CartSerializer(cart)
    return response.Response(serializer.data)


@api_view(["POST"])
def add_to_cart(request):
    product_id = request.data.get("product_id")
    if not product_id:
        return response.Response({"error": "product_id is required"}, status=400)

    product = get_object_or_404(Product, id=product_id)

    cart, created = Cart.objects.get_or_create(user=None)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    if not created:
        item.quantity += 1
        item.save()

    return response.Response(
        {
            "message": "Product added to cart",
            "cart": CartSerializer(cart).data,
        },
        status=200,
    )


@api_view(["POST"])
def update_cart_quantity(request):
    item_id = request.data.get("item_id")
    quantity = request.data.get("quantity")

    if not item_id or quantity is None:
        return response.Response(
            {"error": "item_id and quantity are required"}, status=400
        )

    try:
        item = CartItem.objects.get(id=item_id)
        if quantity < 1:
            item.delete()
            return response.Response(
                {"error": "Quantity must be at least 1"}, status=400
            )
        item.quantity = quantity
        item.save()
        serializer = CartItemSerializer(item)
        return response.Response(serializer.data)
    except CartItem.DoesNotExist:
        return response.Response({"error": "Cart item not found"}, status=404)


@api_view(["POST"])
def remove_from_cart(request):
    item_id = request.data.get("item_id")
    CartItem.objects.filter(id=item_id).delete()
    return response.Response({"message": "Product removed from cart"})


@api_view(["POST"])
def create_order(request):
    try:
        data = request.data
        name = data.get("name")
        address = data.get("address")
        phone = data.get("phone")
        payment_method = data.get("payment_method", "COD")

        cart = Cart.objects.first()
        if not cart or not cart.items.exists():
            return response.Response({"error": "Cart is empty"}, status=400)
        total = sum(
            float(item.product.price) * item.quantity for item in cart.items.all()
        )

        # create order
        order = Order.objects.create(
            user=None,
            total_amount=total,
        )

        # create order items
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price,
            )

        # clear cart
        cart.items.all().delete()

        return response.Response(
            {"message": "Order created successfully", "order_id": order.id}, status=201
        )
    except Exception as e:
        return response.Response({"error": str(e)}, status=500)
