import pandas as pd 
import numpy as np 
from .models import *




def imports():
    stockRoot = 'D:/SystemReady/stocks.csv'
    bomRoot = 'D:/SystemReady/bom.csv'
    df = pd.read_csv(stockRoot)
    for i in range(len(df)):
        s = StockItem(code = df['code'].iloc[i], description = df['description'].iloc[i],  unit = df['unit'].iloc[i], stockType = df['stockType'].iloc[i],)
        s.save()
        if i % 100 == 0:
            print(i)
    df = pd.read_csv(bomRoot)
    for i in range(len(df)):
        b = StockItem.objects.get(code = df['bomCode'].iloc[i])
        c = StockItem.objects.get(code = df['comCode'].iloc[i])
        s = BillOfMaterial(bomCode = b, comCode = c, comQuantity = df['comQuantity'].iloc[i], kitchen = df['kitchen'].iloc[i], notes = df['notes'].iloc[i])
        s.save()
        if i % 100 == 0:
            print(i)


def importStockTake():
    root = r'C:\Users\user\Documents\old 9man project/prepared.csv'
    data = pd.read_csv(root)
    to_save = []
    for i, row in data.iterrows():
        quantity =  float(row['quantity'])
        code = row['code'].upper().strip()
        stock = StockItem.objects.filter(code = code )
        if stock.exists():
            stock = stock[0]
            stock.quantityInStock = quantity
            stock.unit = str(row['Stock Unit'])
            stock.productGroup = str(row['Product Group'])
        else:
            stock = StockItem(code = code, quantityInStock = quantity, unit =  str(row['Stock Unit']), productGroup = str(row['Product Group']))
        print((stock.code, stock.quantityInStock))
        stock.save()

def temp():
    root = r'C:\Users\user\Downloads\ligma.csv'
    data = pd.read_csv(root)
    data = data[['Code', 'Purchase Unit', 'Supplier Price', 'Supplier code', 'Conversion Rate']]
    #StockToBuy.objects.all().delete()

    for i, row in data.iterrows():
        if i <= 261:
            continue
        code = row['Code'].upper().strip()
        purchase_unit = row['Purchase Unit'].strip().lower().capitalize()
        supplier_code = str(row['Supplier code']).upper().strip()
        stock = StockItem.objects.get(code = code)
        if Supplier.objects.filter(code = supplier_code).exists():
            supplier = Supplier.objects.get(code = supplier_code)
        else: 
            supplier = Supplier(code = supplier_code)
            supplier.save()
        if 'PAC' in code:
            tax_code = 'standardRate'
        else:
            tax_code = 'zeroRated'
        stb = StockToBuy(code = stock, ratioToStock = float(row['Conversion Rate']), supplier = supplier, price = float(row['Supplier Price']), purchaseUnit = purchase_unit )
        stb.save()
        print(i, stb) 
        
        
        


            

    #from base.temp import *
    

        
    

        