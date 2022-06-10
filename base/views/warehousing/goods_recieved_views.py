import code
import os
from this import d
from datetime import date
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ...models import *
from ...serializers import *
from ...algorithms import *
import csv

@api_view(['GET'])
def downloadGoodsRecieved(request):
    d = request.query_params['date']
    orders = PurchaseOrder.objects.filter(status = 'live', dateRequested = d)
    home = os.path.expanduser("~")
    print('Home path------------',home)
    download_location = os.path.join(home,'Downloads')
    print('download path------------',download_location)

    with open(download_location + f'/recieving{str(d)}.csv', 'w', newline= '') as csvfile:
        writer = csv.writer(csvfile, delimiter=',')
        writer.writerow([f'{str(d)}'])
        writer.writerow([f'Completed by :'])
        for order in orders: 
            writer.writerow([f'    '])
            writer.writerow([f'******'])
            writer.writerow([f'Order No: {order.id}'])
            writer.writerow([f'Supplier: {order.supplier.name}'])
            writer.writerow([f'******'])
            lines = PurchaseOrderLine.objects.filter(purchaseID = order)
            writer.writerow([f'Ingredient' ,'Quantity Ordered', 'Units', 'Goods Recieved'])
            for line in lines: 
                writer.writerow([line.stockCode.code.code,f'{line.quantity}', f'{line.stockCode.purchaseUnit}', ' '])


    return Response({'message': 'success'}, status.HTTP_201_CREATED)
    
    


@api_view(['POST'])
def goodsRecieved(request):
    outstandingIndicator = False
    lines = []
    stocks = []
    results = []
    for d in request.data['data']:
        line = PurchaseOrderLine.objects.get(id = d['id'])
        gr_posterior = float(line.goodsRecieved) + float(d['goodsRecieved'])
        if float(line.quantity) != gr_posterior:
            outstandingIndicator = True
        line.goodsRecieved = gr_posterior
        stock = line.stockCode
        before = str(stock.code.quantityInStock)
        stock.code.quantityOutstanding = float(stock.code.quantityOutstanding )- (float(d['goodsRecieved'])*float(line.conversionRate)) 
        stock.code.quantityInStock = float(stock.code.quantityInStock )+ (float(d['goodsRecieved'])*float(line.conversionRate)) 
        after = str(stock.code.quantityInStock)
        lines.append(line)
        stocks.append(stock.code)
        results.append(f'{stock.code.code}: {before} {stock.code.unit} ---> {after} {stock.code.unit}  ' )
    if outstandingIndicator == True:
        line.purchaseID.status = 'outstanding'
    else: 
        line.purchaseID.status = 'completed'
    line.purchaseID.save()
    [l.save() for l in lines]
    [s.save() for s in stocks]
    return Response({'message': results}, status.HTTP_202_ACCEPTED)




    
    




        

    

    

    

