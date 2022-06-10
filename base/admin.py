from import_export.admin import ImportExportModelAdmin
from django.contrib import admin
from .models import *
from .resources import *

class StockItemAdmin(ImportExportModelAdmin): 
    resource_class = StockItemResource
    search_fields =  ('code', 'description')


class SupplierAdmin(ImportExportModelAdmin):
    resource_class = SupplierResource
    search_fields = ('code', 'name')

class BillOfMaterialAdmin(ImportExportModelAdmin):
    resource_class = BillOfMaterialResource
    search_fields = ('bomCode', 'comCode')

class StockToBuyAdmin(ImportExportModelAdmin): 
    resource_class = StockToBuyResource
    search_fields = ('code', 'supplier')

class PackAdmin(admin.ModelAdmin):
    search_fields = ('id', 'dateUploaded')

# Register your models here.
admin.site.register(StockItem, StockItemAdmin)
admin.site.register(Customer)
admin.site.register(Event)
admin.site.register(EventLine)
admin.site.register(Supplier, SupplierAdmin)
admin.site.register(StockToBuy, StockToBuyAdmin)
admin.site.register(PurchaseOrder)
admin.site.register(PurchaseOrderLine)
admin.site.register(BillOfMaterial, BillOfMaterialAdmin)
admin.site.register(Pack, PackAdmin)





