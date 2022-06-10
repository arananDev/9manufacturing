import code
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import  status
from rest_framework.permissions import IsAuthenticated
from ..models import *
from ..serializers import *
from ..algorithms import *
import datetime 
# Create your views here.



    
@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def getToRemove(request):
    currentDate = datetime.date.today()
    events = Event.objects.filter(cookDate__lte = currentDate)
    serializer = EventSerializer(events, many = True)
    return Response(serializer.data)

@api_view(['POST'])
#@permission_classes([IsAuthenticated])
def removeBySalesOrder(request):
    try:
        data = request.data['data']
        inputData = []
        deleteSet = []
        for d in data: 
            event = Event.objects.get(id = d)
            deleteSet.append(event)
            eventLines = EventLine.objects.filter(eventID = event)
            for e in eventLines:
                inputData.append({'code': e.mealCode.code, 'quantity': e.quantity})
        model = TrialKit(inputData)
        results = model.solve()
        querySet = []
        for r in results: 
            stock = StockItem.objects.get(code = r['code'])
            stock.quantityInStock -= r['quantityInStock']
            querySet.append(stock)
        [s.save() for s in querySet]
        [d.delete() for d in deleteSet]
        return Response({'message': 'success'}, status.HTTP_205_RESET_CONTENT)

    except Exception as e:
        return Response({'message': f'ERROR! {str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR)