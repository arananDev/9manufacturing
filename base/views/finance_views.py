from numpy import quantile
from ..models import *
from ..algorithms import *
from datetime import date
from rest_framework.response import Response
from rest_framework import generics,status
from rest_framework.decorators import api_view
from rest_framework.parsers import MultiPartParser, FormParser
import pandas as pd
from django.http import HttpResponse


@api_view(['GET'])
def stock_evaluation(request):
    stocks = StockItem.objects.filter(quantityInStock__gt = 0)
    evaluation = []
    try:
        for s in stocks: 
            row = {}
            row['Code'] = s.code 
            row['Description'] = s.description
            row['Quantity'] = float(s.quantityInStock)
            row['Stock Unit'] = s.unit 
            row['Conversion Rate'] = None
            row['Purchase Unit'] = None
            row['Supplier'] = None
            row['Supplier Price'] = None
            row['Valuation'] = None 
            if StockToBuy.objects.filter(code = row['Code']).exists():
                stb = StockToBuy.objects.filter(code = row['Code']).order_by('dateModified')[0]
                row['Supplier'] = stb.supplier.name 
                row['Supplier Price'] = float(stb.price )
                row['Purchase Unit'] = stb.purchaseUnit
                row['Conversion Rate'] = float(stb.ratioToStock)
                row['Valuation'] = float(float(stb.price) /float( stb.ratioToStock) ) * row['Quantity']
            evaluation.append(row)
        data = pd.DataFrame(evaluation)
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=stockEvaluation.csv'
        data.to_csv(r'C:\Users\user\Downloads\ligma.csv')
        data.to_csv(path_or_buf= response,sep=',',float_format='%.7f',index=False)

        return response

    except Exception as e:
        return Response({'message': f'ERROR! {str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR)




    
    