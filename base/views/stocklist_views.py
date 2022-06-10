import code
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from ..models import *
from ..serializers import *
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics, status




@api_view(['GET'])
def getStockList(request):
    stocks = StockItem.objects.all()
    serializer = StockItemSerializer(stocks, many = True)
    return Response(serializer.data)

@api_view(['GET'])
def getStockPurchaseList(request):
    stocks = StockToBuy.objects.order_by().values('code').distinct()
    data = []
    for s in stocks:
        data.append({
            'code': s['code'] ,
            'name': StockItem.objects.get(code = s['code'] ).description,
            })
    return Response(data)

@api_view(['GET'])
def getStockToBuy(request, code):
    stocks = StockToBuy.objects.filter(code = code)
    serializer = StockToBuySerializer(stocks, many = True)
    s = str(StockItem.objects.get(code = code).defaultSupplier.code)
    supplierChoices = [l.supplier.code for l in stocks]
    return Response({'data':serializer.data, 'defaultSupplier': s, 'supplierChoices': supplierChoices })


@api_view(['POST'])
def editStockToBuy(request, code):
    errors = ' '
    try:
        defaultSupplier = request.data['defaultSupplier']
        serializer = StockToBuySerializer(data = request.data['data'], many = True)
        serializer.is_valid()
        errors += str(serializer.errors)
        main = StockItem.objects.get(code = code)
        newData = []
        for s in request.data['data']:
            supplier = Supplier.objects.get(code = s['supplier'])
            stb = StockToBuy(
                code = main, 
                ratioToStock = float(s['ratioToStock']), 
                supplier = supplier,
                taxCode = s['taxCode'], 
                price = float(s['price']),
                leadTime = s['leadTime'],
                purchaseUnit = s['purchaseUnit'],
                codeForSupplier = s['codeForSupplier'])
            newData.append(stb)
        oldData = StockToBuy.objects.filter(code = main)
        oldData.delete()
        [n.save() for n in newData]
        main.defaultSupplier = Supplier.objects.get(code = defaultSupplier)
        main.save()
        return Response({'message': 'success'}, status.HTTP_201_CREATED)
    except Exception as e: 
        print(e)
        return Response({'message': f'Failure to recieve goods, {str(e) + errors}'}, status.HTTP_500_INTERNAL_SERVER_ERROR)

class stockTake(generics.CreateAPIView):
    parser_classes = (FormParser, MultiPartParser)
    
    def post(self, request, *args, **kwargs):
        stock_fails = []
        to_save = []
        try:
            for file in request.FILES.values():
                data = pd.read_csv(file)
                for i in range(len(data)):
                    if StockItem.objects.filter(code = data['code'].iloc[i]).exists():
                        s = StockItem.objects.get(code = data['code'].iloc[i])
                        s.quantityInStock = float(data['quantity'].iloc[i])
                        to_save.append(s)
                    else:
                        stock_fails.append(data['code'].iloc[i])
                [s.save() for s in to_save]
                if len(stock_fails) == 0:
                    # If it worked send a success response 
                    return Response({"status": f"Stock take has been completed"},
                                    status.HTTP_201_CREATED)
                else:
                    return Response({"status": f"Stock take has been completed. Errors in the following stock codes {str(stock_fails)}"},
                                    status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'message': f'ERROR! {str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR)

