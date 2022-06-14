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

def updating_testing():
    data = [{"code":"ING000221","name":"Rosemary  FZN"},{"code":"ING000287","name":"Herb Bay Leaves Ground 6xkg"},{"code":"ING000757","name":"Oregano FRZ KG"},{"code":"ING000773","name":"Pomegranate molasses (Ea 12x500ML)"},{"code":"ING000986","name":"Spice Cinnamon Ground Powder"},{"code":"ING001141","name":"Sauce Soya Tamari Kikkoman Gluten Free 1ltr"},{"code":"ING001630","name":"Cheese Feta Crumbled 2kg"},{"code":"ING001815","name":"Onion White Diced 20mm"},{"code":"ING002019","name":"Spice Bayleaf Powder Ground"},{"code":"ING002036","name":"Pepper Green Sliced FRZ"},{"code":"ING002453","name":"Olive Green Pitted"},{"code":"ING002739","name":"Aubergine Diced 20mm FRZ"},{"code":"ING002795","name":"IQF Roasted Chicken Breast Diced 19mm"},{"code":"ING002871","name":"Dried black limes"},{"code":"ING002873","name":"Short Brown Vermicelli 12x500g"},{"code":"ING002884","name":"Mango Chutney 3kg c/s"},{"code":"ING002907","name":"Aubergine Grilled Silced 30-70mm"},{"code":"PACK000312","name":"VAA casserole dish"},{"code":"PACK000547","name":"J02238 230X270MM Silver Foil Sheets 3000ea c/s"},{"code":"PACK000556","name":"Tamper Evident 240ml x 97mm LID, Cs920 Ea"},{"code":"PACK000557","name":"Tamper  Evident 240ml x 97mm Pots Cs2760 Ea (PALLET)"},{"code":"PACK000563","name":"Clear Round Deli Container 250ml c/s 500"},{"code":"PACK000564","name":"Clear Overcap Flat Lid 117mm c/s 500"},{"code":"ING000177","name":"Oil Extended Life Rapeseed KTC (1x20L)"},{"code":"ING000222","name":"Water"},{"code":"ING000597","name":"Golden Syrup,7.26"},{"code":"ING000761","name":"Spice Pepper White Ground 1kg"},{"code":"ING002115","name":"Curry Leaves 4-6mm IQF"},{"code":"ING002765","name":"Paste Tomato W/W 4 X 4.55 Kg 60 c/s"},{"code":"ING002847","name":"Aleppo Dried Chilli Flakes 500g (pul biber)"},{"code":"ING002848","name":"Aubergine Puree 6*2.8kg 63c/s"},{"code":"ING002849","name":"Tahini- Al Kanater/ Small Bucket 5kg"},{"code":"ING002877","name":"Josh Extra long Basmati Rice 20kg c/s 50"},{"code":"ING002908","name":"Vegetable Oil 20ltrs 42/plt"},{"code":"ING002913","name":"Seabrook Crinkle Crisps Sea Salted 18g Gluten Free 50C/S"},{"code":"PACK000437","name":"Film Sealable/Peelable 250mm xx 1400 metres 250L12, MC"},{"code":"PACK000543","name":"GL500Q Bagasse Take Away Container 500/cs"},{"code":"PACK000546","name":"GL5/65-Q Bagasse Lid 500c/s"}]
    to_save = []
    supplier = Supplier.objects.get(code = 'GGC001')
    for d in data:
        print(d)
        s = StockItem.objects.get(code = d['code'])
        s.defaultSupplier = supplier 
        s.save()
        new_s = StockToBuy(code = s, ratioToStock = 1, supplier = supplier, price = 1, purchaseUnit = 'Each')
        to_save.append(new_s)
    [s.save() for s in to_save]

def imports():
    stockRoot = 'D:/SystemReady/stocks.csv'
    bomRoot = 'D:/SystemReady/bom.csv'
    df = pd.read_csv(stockRoot)
    for i in range(len(df)):
        s = StockItem(code = df['code'].iloc[i], description = df['description'].iloc[i],  unit = df['unit'].iloc[i], stockType = df['stockType'].iloc[i],)
        s.save()
        if i % 100 == 0:
            print(i)
    df = pd.read_csv(bomRoot)
    for i in range(len(df)):
        b = StockItem.objects.get(code = df['bomCode'].iloc[i])
        c = StockItem.objects.get(code = df['comCode'].iloc[i])
        s = BillOfMaterial(bomCode = b, comCode = c, comQuantity = df['comQuantity'].iloc[i], kitchen = df['kitchen'].iloc[i], notes = df['notes'].iloc[i])
        s.save()
        if i % 100 == 0:
            print(i)
    
        
        

