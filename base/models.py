from django.db import models
from django.contrib.auth.models import User
from datetime import date
import os 
import pandas as pd


# Create your models here.

class Supplier(models.Model):
    code = models.CharField(max_length= 25, unique = True, primary_key= True, ) 
    name = models.CharField(max_length= 50)
    addressLine1 = models.CharField(max_length = 100, null = True, blank = True)
    addressLine2 = models.CharField(max_length = 100, null = True, blank = True)
    city = models.CharField(max_length= 50, null = True, blank = True)
    postCode = models.CharField(max_length = 10, null = True, blank = True)
    email = models.CharField(max_length= 50, null = True, blank = True)

    def __str__(self):
        return f'{self.code} : {self.name}'

class StockItem(models.Model):
    uom = [
        ('Kg', 'Kg'),
        ('Ltr', 'Ltr'),
        ('Each', 'Each'),
    ] 
    types = [
        ('COM', 'COM'),
        ('ING/PACK', 'ING/PACK'),
        ('DSI', 'DSI'),
    ]
    code = models.CharField(max_length= 25, unique = True, primary_key= True, )
    description = models.CharField(max_length= 75, null = True, blank = True )
    defaultSupplier = models.ForeignKey(Supplier, on_delete= models.SET_NULL, null = True, default = None)
    quantityInStock = models.DecimalField(max_digits= 10, decimal_places= 4, default = 0)
    quantityOutstanding = models.DecimalField(max_digits= 10, decimal_places= 4, default = 0)
    unit = models.CharField(max_length= 5, choices = uom, default = 'each')
    stockType = models.CharField(max_length= 10, choices = types,)


    def __str__(self): 
        return self.code


class Customer(models.Model): 
    code = models.CharField(max_length= 25, unique = True, primary_key= True, )
    name = models.CharField(max_length= 75, unique = True)

    def __str__(self): 
        return self.name

class Pack(models.Model):
    person = models.CharField(max_length = 100) 
    dateUploaded = models.DateField(auto_now_add = True)
    description = models.CharField(max_length = 50,  null = True)

class Event(models.Model):
    statuses = [
        ('live', 'Live'),
        ('complete', 'Complete')
    ] 
    packID = models.ForeignKey(Pack, on_delete = models.CASCADE)
    customerCode = models.ForeignKey(Customer, on_delete= models.CASCADE)
    cookDate = models.DateField()
    status = models.CharField(max_length= 20, choices = statuses, default = 'live')

    class Meta: 
        unique_together = ('cookDate', 'customerCode')

    def __str__(self): 
        return f'Event for {self.customerCode.name} at {self.cookDate}'
    




class EventLine(models.Model): 
    eventID = models.ForeignKey(Event, on_delete = models.CASCADE, related_name = 'lines' )
    mealCode = models.ForeignKey(StockItem, on_delete= models.CASCADE)
    quantity = models.PositiveIntegerField()

    class Meta: 
        unique_together = ('mealCode', 'eventID')
    
    def __str__(self): 
        return f'Event {self.eventID.id} : {self.mealCode.code}'

class StockToBuy(models.Model):
    tax_codes = [
        ('exempt', 'Exempt'),
        ('standardRate', 'Standard Rate'),
        ('zeroRated', 'Zero Rated'),
    ] 
    code = models.ForeignKey(StockItem, on_delete= models.CASCADE, related_name = 'toBuy')
    ratioToStock = models.DecimalField(max_digits= 13, decimal_places= 5, default = 1)
    supplier = models.ForeignKey(Supplier, on_delete= models.CASCADE)
    taxCode = models.CharField(max_length= 20, choices = tax_codes, default = 'zeroRated')
    price = models.DecimalField(max_digits= 9, decimal_places= 3)
    leadTime = models.IntegerField(default = 1)
    purchaseUnit = models.CharField(max_length = 20)
    dateModified = models.DateField(auto_now=True)
    codeForSupplier = models.CharField(max_length = 20, null = True, default = '', blank = True)

    class Meta: 
        ordering = ('code',)
        unique_together = ('code', 'supplier')

    def __str__(self): 
        return f'{self.supplier.code} : {self.code.code} '

class PurchaseOrder(models.Model):
    statuses = [
        ('live', 'Live'),
        ('completed', 'Completed'),
        ('edit', 'For Editing'),
        ('outstanding', 'Outstanding'),
    ]
    supplier = models.ForeignKey(Supplier, on_delete= models.CASCADE)
    dateCreated = models.DateField(auto_now_add=True, blank=True)
    dateRequested = models.DateField()
    totalNet = models.DecimalField(max_digits= 13, decimal_places= 2, default = 0)
    totalVat = models.DecimalField(max_digits= 13, decimal_places= 2, default = 0)
    status = models.CharField(max_length= 20, choices = statuses, default = 'edit')


    def __str__(self):
        return f'{self.id} : {self.supplier.name}'
    
    def generateOutstanding(self):
        lines = PurchaseOrderLine.objects.filter(purchaseID = self.id)
        for line in lines:
            s = line.stockCode.code 
            s.quantityOutstanding = float(s.quantityOutstanding) + (float(line.quantity)*float(line.conversionRate))
            s.save()
    
    def completeOrderExpected(self):
        lines = PurchaseOrderLine.objects.filter(purchaseID = self.id)
        for line in lines:
            stock = line.stockCode
            if line.quantity >= line.goodsRecieved:
                stock.code.quantityOutstanding = float(stock.code.quantityOutstanding )- (float(line.quantity - line.goodsRecieved)*float(line.conversionRate)) 
                stock.code.quantityInStock = float(stock.code.quantityInStock )+ (float(line.quantity - line.goodsRecieved)*float(line.conversionRate))
            else:
                stock.code.quantityOutstanding = float(stock.code.quantityOutstanding )+ (float(line.goodsRecieved - line.quantity )*float(line.conversionRate)) 
                stock.code.quantityInStock = float(stock.code.quantityInStock )- (float(line.goodsRecieved - line.quantity)*float(line.conversionRate))
            stock.code.save()
        self.status = 'completed'
        self.save()
    
    
    def completePartialExpected(self, indicator = False):
        lines = PurchaseOrderLine.objects.filter(purchaseID = self.id)
        wastage = []
        for line in lines:
            stock = line.stockCode
            if line.quantity > line.goodsRecieved:
                stock.code.quantityOutstanding = float(stock.code.quantityOutstanding )- (float(line.quantity - line.goodsRecieved)*float(line.conversionRate))
                wastage.append({'code': stock, 'q': float(line.quantity - line.goodsRecieved)})
            else:
                stock.code.quantityOutstanding = float(stock.code.quantityOutstanding )+ (float(line.goodsRecieved - line.quantity )*float(line.conversionRate))
            line.quantity = line.goodsRecieved
            stock.code.save()
            line.save()
        self.status = 'completed'
        self.save()
        if indicator:
            new_order = PurchaseOrder(supplier = self.supplier, dateRequested = self.dateRequested)
            new_order.save()
            for w in wastage:
                line = PurchaseOrderLine(stockCode = w['code'], purchaseID = new_order, quantity = w['q'], price = w['code'].price, conversionRate = w['code'].ratioToStock)
                line.save()
    def updateGrossValues(self):
        lines = PurchaseOrderLine.objects.filter(purchaseID = self.id)
        self.totalNet = 0
        self.totalVat = 0
        for line in lines:
            if line.stockCode.taxCode == 'standardRate':
                self.totalVat = float(self.totalVat) + ( float(line.price * line.quantity) * 0.2)
            self.totalNet = float( self.totalNet) + float(line.price * line.quantity) 
        self.save()


class PurchaseOrderLine(models.Model):
    purchaseID =  models.ForeignKey(PurchaseOrder, on_delete = models.CASCADE, related_name= 'lines')
    stockCode =  models.ForeignKey(StockToBuy, on_delete = models.CASCADE,)
    unconvertedQuantity  = models.DecimalField(max_digits= 13, decimal_places= 4, null = True)
    quantity = models.DecimalField(max_digits= 13, decimal_places= 4)
    price = models.DecimalField(max_digits= 13, decimal_places= 3)
    goodsRecieved = models.DecimalField(max_digits= 13, decimal_places= 3, default = 0)
    conversionRate = models.DecimalField(max_digits= 13, decimal_places= 2, default = 1)

    class Meta:
        unique_together = ('stockCode', 'purchaseID')

class BillOfMaterial(models.Model):
    kitchens = [
        ('Hot', 'Hot'),
        ('Cold', 'Cold'),
        ('Packing', 'Packing'),
    ]
    bomCode =  models.ForeignKey(StockItem, on_delete = models.CASCADE, related_name= 'bom')
    comCode =  models.ForeignKey(StockItem, on_delete = models.SET_NULL, related_name= 'com', null = True)
    comQuantity = models.DecimalField(max_digits= 10, decimal_places= 6)
    kitchen = models.CharField(max_length= 20, choices = kitchens, null= True, blank = True)
    notes = models.CharField(max_length= 1000, null= True, blank = True)


    class Meta: 
        unique_together = ('bomCode', 'comCode')

    def __str__(self):
        return f'relationship between {self.bomCode.code} and {self.comCode.code}'

class PurchaseEvent(models.Model): 
    purchaseDate = models.DateField(unique= True)


    def __str__(self): 
        return f'items that need to be purchased on {self.purchaseDate}'
    
    

class PurchaseEventLine(models.Model): 
    eventID = models.ForeignKey(PurchaseEvent, on_delete = models.CASCADE, related_name = 'lines' )
    code = models.ForeignKey(StockItem, on_delete= models.CASCADE)
    orderQuantity = models.DecimalField(max_digits= 10, decimal_places= 4, default = 0)
    initialQuantityDemanded = models.DecimalField(max_digits= 10, decimal_places= 4, default = 0)

    class Meta:
        unique_together = ('code', 'eventID')
    
    def __str__(self): 
        return f' {self.eventID.id} : {self.code.code}'

class GoodsOut(models.Model):
    reasons = [
        ('wastage', 'Wastage'),
        ('production', 'Production'),
    ]
    stock = models.ForeignKey(StockItem, on_delete = models.CASCADE )
    quantity = models.DecimalField(max_digits= 10, decimal_places= 4, default = 0)
    reason = models.CharField(max_length= 20, choices = reasons)
    dateRequested = models.DateField(auto_now_add = True)

    def reduceStock(self):
        prior_quantity = float(self.stock.quantityInStock )
        posterior_quantity = float(self.stock.quantityInStock ) - float(self.quantity)
        self.stock.quantityInStock = posterior_quantity
        self.stock.save()
        return f'{self.stock.code}: {prior_quantity} {self.stock.unit} ---> {posterior_quantity} {self.stock.unit}'
        
    




