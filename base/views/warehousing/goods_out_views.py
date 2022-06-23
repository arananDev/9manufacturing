
from ...models import *
from ...algorithms import *
from datetime import date
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics,status
from rest_framework.parsers import MultiPartParser, FormParser
import pandas as pd


@api_view(['GET'])
def generate_daily_production_sheet(request):
    return reduction_request_from_production()

class upload_reduction_request(generics.CreateAPIView):
    parser_classes = (FormParser, MultiPartParser)
    
    def post(self, request, *args, **kwargs):
        try:
            for file in request.FILES.values():
                data = pd.read_csv(file)
                events = data['events (optional)'].iloc[0]
                events_to_save = []
                requests_to_save = []
                if pd.isna(events) == False:
                    events = str(events).strip().split('/')
                    for event in events:
                        eventID = int(float(event))
                        assert Event.objects.filter(id = eventID, status = 'live' ).exists(), f'No live event {event} exists '
                        e = Event.objects.get(id = eventID, status = 'live')
                        e.status = 'complete'
                        events_to_save.append(e)

                data = data[['code', 'unit', 'quantity', 'reason']]
                for i in range(len(data)):
                    stock = StockItem.objects.get(code = data['code'].iloc[i])
                    assert data['unit'].iloc[i] == str(stock.unit), f'ingredient {stock.code} can only be reduced in {stock.unit}'
                    request = GoodsOut(stock = stock, quantity = data['quantity'].iloc[i], reason = data['reason'].iloc[i])
                    requests_to_save.append(request)
                results = []
                [results.append(request.reduceStock()) for request in requests_to_save]
                [request.save() for request in requests_to_save]
                [event.save() for event in events_to_save]
            

            # If it worked send a success response 
            return Response({"status": 'Success!', 'payload': results},
                            status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'message': f'ERROR! {str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR)



    
    
