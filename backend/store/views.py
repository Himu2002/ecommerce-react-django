from rest_framework import response
from rest_framework.decorators import api_view
from .models import Category, Product, Cart, CartItem
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
def remove_from_cart(request):
    item_id = request.data.get("item_id")
    CartItem.objects.filter(id=item_id).delete()
    return response.Response({"message": "Product removed from cart"})
