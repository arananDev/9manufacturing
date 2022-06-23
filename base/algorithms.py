from .models import *
import pandas as pd 
from datetime import date, timedelta
from django.db.models import Subquery
from django.http import HttpResponse
import os


class TrialKit: 

    def __init__(self, inputData):
        assert isinstance(inputData, list), 'input data should be an array of dictionaries: with headers code and quantity and cookDate'
        self.inputData = inputData 
        self.results = []
    
    def trialKitOne(self, code, quantity, cookDate):
        s = StockItem.objects.get(code = code)
        if s.stockType == 'ING/PACK':
            self.results.append({'code': s.code, 'description': s.description , 'quantity': quantity, 'unit': s.unit, 'purchaseDate': cookDate}) 
        else:
            boms = BillOfMaterial.objects.filter(bomCode = s)
            for bom in boms:
                if bom.comCode.stockType == 'ING/PACK': 
                    self.results.append({'code': bom.comCode.code, 'description': bom.comCode.description, 'quantity': quantity * float(bom.comQuantity), 'unit': bom.comCode.unit, 'purchaseDate': cookDate}, )
                else: 
                    self.trialKitOne(bom.comCode.code, quantity * float(bom.comQuantity), cookDate)
    
    def solve(self):
        self.results = []
        for row in self.inputData:
            self.trialKitOne(row['code'], row['quantity'], row['cookDate'])
        df = pd.DataFrame(self.results)
        df = df.groupby(['code', 'description', 'unit', 'purchaseDate'], as_index = False).sum()
        results = df.to_dict('records')
        missingData = set()
        for result in results: 
            s = StockItem.objects.get(code = result['code'])
            if StockToBuy.objects.filter(code = s, supplier = s.defaultSupplier).exists(): 
                leadTime = StockToBuy.objects.get(code = s, supplier = s.defaultSupplier).leadTime 
            else: 
                leadTime = 1
                missingData.add(s.code)
            result['purchaseDate'] = result['purchaseDate'] - timedelta(days = leadTime)
            result['quantity'] = float("{:.5f}".format(result['quantity']))
            result['quantityInStock'] = s.quantityInStock
            result['quantityOutstanding'] = s.quantityOutstanding 
            quantitySuggested = float("{:.5f}".format(result['quantity'] - (float(result['quantityInStock']) + float(result['quantityOutstanding'] ))))
            if quantitySuggested < 0: 
                quantitySuggested = 0
            result['quantitySuggested'] = quantitySuggested
        self.results = results
        return results, missingData
    
    def export_results(self):
        home = os.path.expanduser("~")
        print('Home path------------',home)
        download_location = os.path.join(home,'Downloads')
        print('download path------------',download_location)
        pd.DataFrame(self.results).to_csv( download_location + f'/trialKitResults.csv')

def autoGeneratePO(data):
    genPO = dict()
    for d in data:
        s = StockItem.objects.get(code = d['code'])
        currentSupplier = s.defaultSupplier
        stb = StockToBuy.objects.get(code = s, supplier = currentSupplier)
        if currentSupplier.code not in genPO.keys():
            genPO[currentSupplier.code] = []
        genPO[currentSupplier.code].append({
            'code': s.code, 
            'unconvertedQuantity': float("{:.4f}".format(d['order quantity'])),
            'convertedQuantity':float("{:.4f}".format(d['order quantity']/float(stb.ratioToStock)))
            })
    createdPOs = []
    try:
        for supplier in genPO.keys():
            sup = Supplier.objects.get(code = supplier)
            po = PurchaseOrder(supplier = sup, dateRequested = date.today())
            po.save()
            createdPOs.append(po)
            for row in genPO[supplier]:
                if row['unconvertedQuantity'] == 0: 
                    continue
                stock = StockItem.objects.get(code = row['code'])
                stb = StockToBuy.objects.get(code = stock, supplier = sup) 
                pol = PurchaseOrderLine(
                    purchaseID = po,
                    stockCode = stb,
                    quantity = row['convertedQuantity'] ,
                    unconvertedQuantity = row['unconvertedQuantity'],
                    price = stb.price, 
                    conversionRate = stb.ratioToStock )
                pol.save()
            po.updateGrossValues()
        return True
            
    except Exception as e:
        [po.delete() for po in createdPOs]
        raise e

def updateStockDefaultSuppliers(): 
    stocks = StockToBuy.objects.all()
    counter = 0
    for s in stocks:
        if s.code.defaultSupplier != s.supplier: 
            supplier = StockToBuy.objects.filter(code = s.code).order_by('-dateModified')[0].supplier
            s.code.defaultSupplier = supplier 
            s.code.save()
            counter += 1
    return f' {counter} stock items have been updated!'
            
def reduction_request_from_production():
    today = date.today()
    finished_events = Event.objects.filter(status = 'live', cookDate__lt = today )
    if finished_events.exists():
        for event in finished_events:
            event.status = 'complete'
            event.save()
    events_today = Event.objects.filter(status = 'live', cookDate = today )
    assert events_today.exists(), 'Event today has already had their production generated/ No events today'
    data = []
    for event in events_today:
        lines = EventLine.objects.filter(eventID = event)
        for line in lines:
            data.append({'code': line.mealCode.code, 'quantity': line.quantity, 'cookDate': event.cookDate})
    tk = TrialKit(data)
    results, missing_data = tk.solve()
    for r in results:
        r['reason'] = 'production'
    results[0]['request id'] = ''
    results[0]['date'] = today
    results[0]['events (optional)'] = '/'.join([str(event.id) for event in events_today])
    results = pd.DataFrame(results)
    results = results[['code', 'description' ,'unit' , 'quantity', 'reason' ,'request id', 'date', 'events (optional)']]
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=filename.csv'

    results.to_csv(path_or_buf=response,sep=';',float_format='%.7f',index=False,decimal=",")
    return response



        


        
    
        
        

