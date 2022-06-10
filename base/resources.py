from import_export import resources
from .models import *

# Import/Export models here
class StockItemResource(resources.ModelResource): 

    class Meta: 
        import_id_fields = ('code',)
        model = StockItem

class SupplierResource(resources.ModelResource): 

    class Meta: 
        import_id_fields = ('code',)
        model = Supplier

class BillOfMaterialResource(resources.ModelResource): 

    class Meta: 
        model = BillOfMaterial

class StockToBuyResource(resources.ModelResource): 

    class Meta: 
        model = StockToBuy
