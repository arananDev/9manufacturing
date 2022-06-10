import code
from msilib.schema import Error
import os
from shutil import ExecError
from this import d
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from ..models import *
from ..serializers import *
from ..algorithms import *
from datetime import date
import pandas as pd
import numpy as np

@api_view(['POST'])
def trialKit(request):
    try:
        purchaseEventsSaved = []
        today = date.today()
        events = Event.objects.filter(cookDate__gte = today)
        if len(events) == 0:
            raise Exception('No future production plans detected')
        inputData = []
        for e in events:
            eLines = e.lines.all()
            [inputData.append({'code': line.mealCode.code, 'quantity': line.quantity, 'cookDate': e.cookDate}) for line in eLines]
        tk = TrialKit(inputData)
        results, missingData = tk.solve()
        data = pd.DataFrame(results)
        uniqueDates = np.unique(data['purchaseDate'])
        PurchaseEvent.objects.all().delete()
        purchaseEventsSaved = [PurchaseEvent(purchaseDate = date).save() for date in uniqueDates]
        for i in range(data.shape[0]): 
            pe = PurchaseEvent.objects.get(purchaseDate = data['purchaseDate'].iloc[i])
            code = StockItem.objects.get(code = data['code'].iloc[i])
            p = PurchaseEventLine(eventID = pe, code = code, orderQuantity = data['quantitySuggested'].iloc[i], initialQuantityDemanded = data['quantity'].iloc[i])
            p.save()
        if len(missingData) == 0:
            successMessage = 'Success!'
        else:
            successMessage = f'Success. the following stock items have missing details {str(missingData)}. Their lead times have been assumed to be 1. Please update these before continuing on'
        if request.data['download'] == True: 
            tk.export_results()

        return Response({'message': successMessage}, status.HTTP_201_CREATED)

        
    except Exception as e:
        print(e)
        [p.delete() for p in purchaseEventsSaved]
        return Response({'message': str(e)}, status.HTTP_406_NOT_ACCEPTABLE )

@api_view(['GET'])
def getPurchaseEvents(request):
    events = PurchaseEvent.objects.all()
    serializer = PurchaseEventSerializer(events, many = True)
    return Response(serializer.data)

@api_view(['GET'])
def getPurchaseEvent(request,pk):
    event = PurchaseEvent.objects.get(id = pk)
    eventLines = PurchaseEventLine.objects.filter(eventID = event)
    data = []
    for e in eventLines:
        data.append(
            {
                'code': e.code.code,
                'description': e.code.description,
                'stock unit': e.code.unit,
                'quantity demanded': e.initialQuantityDemanded,
                'quantity in stock': e.code.quantityInStock,
                'quantity from unfufilled purchases': e.code.quantityOutstanding, 
                'order quantity': e.orderQuantity,
            }
        )
    return Response(data)

@api_view(['POST'])
def updatePurchaseEvent(request, pk):
    serializer = PurchaseEventLineSerializer(data = request.data['data'], many = True)
    if serializer.is_valid():
        p = PurchaseEvent.objects.get(id = pk)
        PurchaseEventLine.objects.filter(eventID = p).delete()
        for line in request.data['data']:
            s = StockItem.objects.get(code = line['code'])
            newLine = PurchaseEventLine(eventID = p, code = s, orderQuantity = line['orderQuantity'], initialQuantityDemanded = line['initialQuantityDemanded'])            
            newLine.save()
        return Response({'message': 'it worked'}, status.HTTP_201_CREATED)
    else:
        print(serializer.errors)
        return Response({'message':str( serializer.errors), 'status': 'nonExistant'}, status.HTTP_406_NOT_ACCEPTABLE )
       


@api_view(['POST'])
def autogen_PO(request):
#try:
    stock_not_validated = []
    data = request.data['data']
    for d in data:
        if StockToBuy.objects.filter(code = d['code']).exists() == False:
            s = StockItem.objects.get(code = d['code'])
            stock_not_validated.append({'code': s.code, 'name': s.description })
    if len(stock_not_validated) > 0:
        return  Response({'message': stock_not_validated,  'status': 'error'}, status.HTTP_406_NOT_ACCEPTABLE)
    autoGeneratePO(data)
    return Response({'message': 'success'}, status.HTTP_201_CREATED)
        
    '''
    except Exception as e:
        print(e)
        return Response({'message': f'Error: ${str(e)}',  'status': 'nonExistant'}, status.HTTP_406_NOT_ACCEPTABLE)
    '''


@api_view(['POST'])
def merge_purchase_events(request):
    try:
        start_date = request.data['params']['startDate']
        end_date = request.data['params']['endDate']
        to_delete = []
        events = PurchaseEvent.objects.filter(purchaseDate__lte = end_date, purchaseDate__gte = start_date).order_by('purchaseDate')
        main_event = events[0]
        for event in events[1:]:
            to_delete.append(event)
            lines = PurchaseEventLine.objects.filter(eventID = event)
            for line in lines:
                query =  PurchaseEventLine.objects.filter(eventID = main_event, code = line.code )
                if query.exists():
                    main_line = query[0]
                    main_line.orderQuantity = float(main_line.orderQuantity) + float(line.orderQuantity)
                    main_line.initialQuantityDemanded = float(main_line.initialQuantityDemanded) + float(line.initialQuantityDemanded)
                    main_line.save()
                else:
                    line.eventID = main_event
                    line.save()
        [order.delete() for order in to_delete]
        return Response({'message': 'success'}, status.HTTP_202_ACCEPTED)
    
    except Exception as e:
        return Response({'message': f'Error: ${str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR)


            
    