
import code
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..serializers import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
# Create your views here.


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        data['username'] = self.user.username
        
        return data 
    

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    print(serializer_class)



@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def getUser(request):
    user = request.user 
    serializer = UserSerializer(user, many = False)
    return Response(serializer.data)
        