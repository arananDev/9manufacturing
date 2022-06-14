import code
import os
from this import d
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ..models import *
from ..serializers import *
from ..algorithms import *
from ..invoice_generator import InvoiceGenerator 
from datetime import date
from django.http import HttpResponse


@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def getCustomerCodes(request):
    customers = Customer.objects.all()
    serializer = ListCustomers(customers, many = True)
    return Response(serializer.data)




@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def validateStock(request): 
    try:
        rawStock = request.query_params['data'].replace(' ','')
        supplier = request.query_params['supplier']
        stocks = rawStock.split(',')
        stocks = [x for x in stocks if x]
        failedVal = []
        for stock in stocks: 
            if StockItem.objects.filter(code = stock).exists() == False:
                return Response({'status' : 'nonExistant','message': f'ERROR! Stock item {stock} does not exist'}, status.HTTP_500_INTERNAL_SERVER_ERROR)
            if StockToBuy.objects.filter(code = stock, supplier = supplier).exists() == False:
                editedStock = StockItem.objects.get(code = stock)
                failedVal.append({'code': editedStock.code,'name': editedStock.description, 'stockUnit': editedStock.unit, 'supplier': supplier})
        if len(failedVal) == 0: 
            return Response({'status': 'success'}, status.HTTP_202_ACCEPTED)
        return Response({'status' : 'needStockToBuy', 'data': failedVal }, status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'status' : 'nonExistant','message': f'ERROR! {str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
#@permission_classes([IsAuthenticated])
def createStockToBuy(request): 
    serializer = StockToBuySerializer(data = request.data['data'], many = True)
    if serializer.is_valid():
        for s in request.data['data']:
            stock = StockItem.objects.get(code = s['code'])
            supplier = Supplier.objects.get(code = s['supplier'])
            stockToBuy = StockToBuy(
                code = stock, 
                taxCode = s['taxCode'], 
                price = s['price'],
                ratioToStock = s['ratioToStock'],
                leadTime = s['leadTime'],
                purchaseUnit = s['purchaseUnit'],
                supplier = supplier,
                codeForSupplier = s['codeForSupplier'])
            stockToBuy.save()
            
        return Response({'message': 'it worked'}, status.HTTP_201_CREATED)
    else:
        print(serializer.errors)
        return Response({'message': str(serializer.errors), 'status': 'nonExistant'}, status.HTTP_406_NOT_ACCEPTABLE )

@api_view(['POST'])
#@permission_classes([IsAuthenticated])
def createPO(request): 
    p = request.data['data']
    rawStock = p['stockCodes'].replace(' ','')
    stocks = rawStock.split(',')
    stocks = [x for x in stocks if x]
    if Supplier.objects.filter(code = p['supplierCode']).exists() == False:
        return Response({'message': f'supplier { p["supplierCode"] } not in database'}, status.HTTP_406_NOT_ACCEPTABLE )
    supplier = Supplier.objects.get(code = p['supplierCode'] )
    po = PurchaseOrder(supplier = supplier, dateRequested = p['date'])
    po.save()
    try:
        for stock in stocks:
            s = StockToBuy.objects.get(code = stock, supplier = supplier)
            po_line = PurchaseOrderLine(purchaseID = po, stockCode = s, quantity = 0, price = s.price, conversionRate = s.ratioToStock  )
            po_line.save()
        po.updateGrossValues()
        return Response({'message': 'success'}, status.HTTP_201_CREATED)
    except Exception as e:
        po.delete()
        return Response({'message': f'Error {str(e)}',  'status': 'nonExistant'}, status.HTTP_406_NOT_ACCEPTABLE)

@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def getPurchaseOrders(request):
    today = date.today()
    badOrders = PurchaseOrder.objects.filter(status = 'live', dateRequested__lt = today )
    if badOrders.exists():
        for order in badOrders:
            order.status = 'outstanding'
            order.save()
    if 'date' in request.query_params:
        pos = PurchaseOrder.objects.filter(status = request.query_params['status'], dateRequested = request.query_params['date'])
    else:
        pos = PurchaseOrder.objects.filter(status = request.query_params['status'] ).order_by('-id')[:100][::-1]
    data = []
    for p in pos:
        data.append({
            'id': p.id, 
            'supplier': p.supplier.name,
            'dateRequested': p.dateRequested,
            'totalNet': p.totalNet,
            'totalVat': p.totalVat,
        })
    return Response(data)

@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def getPurchaseOrder(request, pk):
    po = PurchaseOrder.objects.get(id = int(pk))
    po_lines  = PurchaseOrderLine.objects.filter(purchaseID = po)
    params = {'supplier': po.supplier.name, 'status': po.status, 'dateRequested': po.dateRequested, 'supplierCode': po.supplier.code}
    data = []
    for p in po_lines:
        print(p)
        s = StockItem.objects.get(code = p.stockCode.code)
        data.append({
            'id': p.id,
            'code': s.code, 
            'name': s.description,
            'stock unit': s.unit, 
            'purchase unit': p.stockCode.purchaseUnit,
            'quantity': p.quantity, 
            'price': p.price, 
            'taxCode': p.stockCode.taxCode,
            'conversionRate': p.conversionRate,
            'unconvertedQuantity': p.unconvertedQuantity,
            'goodsRecieved': p.goodsRecieved,
            })
    params['data'] = data
        
    return Response(params)

@api_view(['POST'])
#@permission_classes([IsAuthenticated])
def updateStockToBuy(request):
    print(request.data['data'])
    try:
        for d in request.data['data']:
            s = Supplier(code = d['defaultSupplier'])
            stock = StockToBuy.objects.get(code = d['code'], supplier = s)
            stock.ratioToStock = d['ratioToStock']
            stock.taxCode = d['taxCode']
            stock.price = d['price']
            stock.save()
        return Response({'message': 'success'}, status.HTTP_201_CREATED)
    except:
        return Response({'message': 'Failure to update Stock item to buy, please recheck the conversion rate and price'}, status.HTTP_406_NOT_ACCEPTABLE)


@api_view(['POST'])
#@permission_classes([IsAuthenticated])
## Need to look into
def updatePurchaseOrderLines(request, pk):
    try:
        po = PurchaseOrder.objects.get(id = pk)
        po.dateRequested = request.data['params']['dateRequested']
        PurchaseOrderLine.objects.filter(purchaseID = po).delete()
        for data in request.data['data']:
            supplier = Supplier.objects.get(code = request.data['params']['supplier']) 
            stock = StockToBuy.objects.get(code = data['stockCode'], supplier = supplier )
            pol = PurchaseOrderLine(purchaseID = po, stockCode = stock, price = data['price'] 
            , quantity = data['quantity'], conversionRate = data['conversionRate'] )
            pol.save()
        po.updateGrossValues()
        po.save()
        return Response({'message': 'Success'}, status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'message': f'Failure to add Purchase Order Lines: {str(e)}'},status.HTTP_406_NOT_ACCEPTABLE)

@api_view(['POST'])
#@permission_classes([IsAuthenticated])
def makePurchaseOrderLive(request, pk):
    po = PurchaseOrder.objects.get(id = pk)
    po.status = 'live'
    try: 
        po.generateOutstanding()
        po.save()
        return Response({'message': 'success'}, status.HTTP_202_ACCEPTED)
    except Exception as e:
        return Response({'message': f'Failure to make PO live, {str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
#@permission_classes([IsAuthenticated])
def deletePurchaseOrder(request):
    try:
        PurchaseOrder.objects.get(id = request.data['id']).delete()
        return Response({'message': 'success'}, status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({'message': f'Failure to delete PO, {str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def downloadPO(request, pk):
    try:
        po = PurchaseOrder.objects.get(id = pk)
        pol = PurchaseOrderLine.objects.filter(purchaseID = po)
        supplier = po.supplier 
        shipTo = '''
        DELIVER AND INVOICE TO:
        9 Cuisines ltd
        Unit 5/6 Victoria Industrial Estate 
        Victoria Road 
        London  W3 6UU 
        020 8992 5500 
        purchasing@9cuisines.co.uk
        '''
        To = f'''
        {supplier.name }
        {supplier.addressLine1}
        {supplier.addressLine2}
        {supplier.city}
        {supplier.postCode}
        '''
        invoice = InvoiceGenerator(
            logo = 'https://yt3.ggpht.com/ytc/AKedOLQYPIGGQzCCBUWC-oOElID_Oshy3znKBuj0uaUC=s900-c-k-c0x00ffffff-no-rj',
            sender = shipTo ,
            to =  To, 
            number = pk,
            date = po.dateCreated,
            due_date = po.dateRequested,
            tax = float(po.totalVat), 
            terms = 'Calendar Monthly',
            notes =  '''
            **PLEASE NOTIFY US IMMEDIATELY IF YOU ARE UNABLE TO FUFILL THE ORDER ABOVE**

            Failure to quote the 9C Order number on any documentation may cause delays in the payment of your invoice.
            '''
        )
        invoice.set_template_text('header', 'PURCHASE ORDER')
        invoice.set_template_text('to_title', 'Supplier')
        invoice.set_template_text('due_date_title', 'Delivery Date')
        invoice.set_template_text('balance_title', 'Total')
        invoice.set_template_text('ship_to_title', 'Deliver and invoice to')
        for p in pol:
            if p.stockCode.codeForSupplier == None or len( p.stockCode.codeForSupplier) < 3:
                i_name = f'{p.stockCode.code.code} : ({p.stockCode.purchaseUnit})'
            else:
                i_name = f'{p.stockCode.codeForSupplier} : ({p.stockCode.purchaseUnit})'
            invoice.add_item(
                name = i_name,
                description = p.stockCode.code.description,
                quantity = float( p.quantity),
                unit_cost = float(p.price)),
        pdf = invoice.download()
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename=PO-invoice-{pk}.pdf'
        return response

    except Exception as e:
        return Response({'message': f' Error! {str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def outstanding_full_complete(request,pk):
    try:
        order = PurchaseOrder.objects.get(id = pk)
        order.completeOrderExpected()
        return Response({'message': 'success'}, status.HTTP_201_CREATED)
    except Exception as e: 
        return Response({'message': f' Error! {str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def outstanding_partial_complete(request, pk):
    try:
        order = PurchaseOrder.objects.get(id = pk)
        order.completePartialExpected(indicator = request.data['indicator'])
        return Response({'message': 'success'}, status.HTTP_201_CREATED)
    except Exception as e: 
        return Response({'message': f' Error! {str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def merge_purchase_orders(request):
    to_delete = []
    try:
        suppliers =  PurchaseOrder.objects.filter(status = 'edit').values('supplier').distinct()
        for query in suppliers:
            supplier = Supplier.objects.get(code = query['supplier'])
            orders = PurchaseOrder.objects.filter(status = 'edit', supplier = supplier).order_by('dateRequested')
            main_order = orders[0]
            if len(orders) <= 1:
                continue
            for order in orders[1:]:
                to_delete.append(order)
                lines = PurchaseOrderLine.objects.filter(purchaseID = order)
                for line in lines: 
                    query =  PurchaseOrderLine.objects.filter(purchaseID = main_order, stockCode = line.stockCode )
                    if query.exists():
                        main_line = query[0]
                        main_line.quantity = float(main_line.quantity) + float(line.quantity)
                        main_line.save()
                    else:
                        line.purchaseID = main_order 
                        line.save()
        [order.delete() for order in to_delete]

        return Response({'message': 'success'}, status.HTTP_201_CREATED)
    except Exception as e: 
        return Response({'message': f' Error! {str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def clear_editing(request):
    pos = PurchaseOrder.objects.filter(status = 'edit')
    [order.delete() for order in pos]
    return Response({'message': 'success'}, status.HTTP_202_ACCEPTED )

@api_view(['POST'])
def remake_PO_live(request, pk):
    po = PurchaseOrder.objects.get(id = pk)
    po.dateRequested = request.data['date']
    po.status = 'live'
    po.save()
    return Response({'message': 'success'}, status.HTTP_202_ACCEPTED )


