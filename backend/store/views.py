from rest_framework import response
from rest_framework.decorators import api_view
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


@api_view(["GET"])
def get_products(request):
    Products = Product.objects.all()
    serializer = ProductSerializer(Products, many=True)
    return response.Response(serializer.data)


@api_view(["GET"])
def get_categories(request):
    Categories = Category.objects.all()
    serializer = CategorySerializer(Categories, many=True)
    return response.Response(serializer.data)
