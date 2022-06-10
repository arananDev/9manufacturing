from ssl import SSL_ERROR_INVALID_ERROR_CODE
from unittest.util import _MAX_LENGTH
from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):

    class Meta: 
        model = User 
        fields = ('id', 'username')

class PurchaseEventSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source ='purchaseDate' )
    date = serializers.CharField(source ='purchaseDate' )

    class Meta: 
        model = PurchaseEvent 
        fields = ('id','date', 'title')


class EventSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source ='customerCode' )
    date = serializers.CharField(source ='cookDate' )

    class Meta: 
        model = Event 
        fields = ('id','date', 'title')

class EventLineSerializer(serializers.ModelSerializer):

    class Meta: 
        model = EventLine 
        fields = ('mealCode','quantity',)

class StockItemSerializer(serializers.ModelSerializer): 

    class Meta:
        model = StockItem
        fields = '__all__'

class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

class StockToBuySerializer(serializers.ModelSerializer): 

    class Meta: 
        model = StockToBuy
        fields = '__all__'


class PurchaseOrderSerializer(serializers.ModelSerializer):
    

    class Meta: 
        model = PurchaseOrder 
        fields = ('id','supplier', 'dateRequested', 'totalNet', 'totalVat')

class PurchaseOrderLineSerializer(serializers.ModelSerializer):

    class Meta: 
        model = PurchaseOrderLine 
        fields = '__all__'

class ListCustomers(serializers.ModelSerializer):

    class Meta: 
        model = Customer
        fields = '__all__'

class TrialKittingSerializer(serializers.Serializer):
    startDate = serializers.DateField(format = r"%Y-%m-%d")
    endDate = serializers.DateField(format = r"%Y-%m-%d")
    companies = serializers.ListField(
    child=serializers.CharField()
    )

class PurchaseEventLineSerializer(serializers.ModelSerializer): 

    class Meta:
        model = PurchaseEventLine
        fields = ('code', 'orderQuantity', 'initialQuantityDemanded')










    



