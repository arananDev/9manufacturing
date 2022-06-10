import code
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from ..models import *
from ..serializers import *
from ..algorithms import *
import pandas as pd
import numpy as np
import datetime 


@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def getEvents(request):
    events = Event.objects.filter(status = 'live')
    serializer = EventSerializer(events, many = True)
    return Response(serializer.data)

@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def getEvent(request,pk):
    event = Event.objects.get(id = pk)
    eventLines = EventLine.objects.filter(eventID = event)
    data = []
    for line in eventLines:
        data.append({'mealCode': line.mealCode.code, 'quantity': line.quantity, 'description': line.mealCode.description})
    return Response(data)


class createEvent(generics.CreateAPIView):
    parser_classes = (FormParser, MultiPartParser)
    
    def post(self, request, *args, **kwargs):
        eventsToSave = []
        packsToSave = []
        try:
            for file in request.FILES.values():
                data = pd.read_csv(file)
                company = data['company code'].iloc[0]
                description = data['description'].iloc[0]
                staff = data['staff'].iloc[0]
                data = data[['Cook date', 'mealCode', 'quantity']]
                data = data.groupby( ['Cook date', 'mealCode'], as_index = False ).agg('sum')
                eventsToUpload = np.unique(list(data[['Cook date']].to_records(index = False)))
                eventErrors = []
                pack = Pack(person = staff, description = description)
                pack.save()
                packsToSave.append(pack)
                for event in np.unique(eventsToUpload):
                    customer = Customer.objects.get(code = company)
                    day,month,year = event[0].split('/')
                    d = datetime.date(int(year), int(month), int(day))
                    if Event.objects.filter(customerCode = customer, cookDate = d).count() == 0:
                        new_event = Event(customerCode = customer, cookDate = d, packID = pack)
                        eventsToSave.append(new_event)
                    else:
                        eventError = Event.objects.get(customerCode = customer, cookDate = d).id
                        eventErrors.append(eventError)
                if len(eventErrors) == 0:
                    [event.save() for event in eventsToSave]
                else: 
                    pack.delete()
                    return Response({"message": f"ERROR: Attempting to double upload over batches: {str(eventErrors)}. Please delete before continuing"},
                                status.HTTP_406_NOT_ACCEPTABLE)
                for i in range(data.shape[0]): 
                    day,month,year = data['Cook date'].iloc[i].split('/')
                    d = datetime.date(int(year), int(month), int(day))
                    stock = StockItem.objects.get(code = data['mealCode'].iloc[i].strip())
                    event = Event.objects.get(customerCode = company, cookDate = d)
                    new_eventLine = EventLine(
                        eventID = event,
                        mealCode = stock,
                        quantity = data['quantity'].iloc[i],
                    )
                    new_eventLine.save()

                # If it worked send a success response 
                return Response({"status": f"Pack {str(pack.id)} has been uploaded!"},
                                status.HTTP_201_CREATED)
        except Exception as e:
            [pack.delete() for pack in packsToSave]
            [event.delete() for event in eventsToSave]
            return Response({'message': f'ERROR! {str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR)

            
@api_view(['POST'])
#@permission_classes([IsAuthenticated])
def deleteEvent(request):
    pk = request.data['pk']
    Event.objects.get(id = pk).delete()
    return Response({"status": "success"},
                    status.HTTP_202_ACCEPTED)

@api_view(['POST'])
#@permission_classes([IsAuthenticated])
def createEventLines(request, pk):
    serializer = EventLineSerializer(data = request.data['data'], many = True)
    serializer.is_valid(raise_exception= True)
    event = Event.objects.get(id = pk)
    EventLine.objects.filter(eventID = event).delete()
    for data in request.data['data']:
        event = Event.objects.get(id = pk)
        stock = StockItem.objects.get(code = data['mealCode'] )
        eventLine = EventLine(eventID = event, quantity = data['quantity'], mealCode = stock)
        eventLine.save()
    return Response({"status": "success"},status.HTTP_202_ACCEPTED)
