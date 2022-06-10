from django.urls import path
from .views import event_views
from .views import purchasing_views
from .views import user_views
from .views import stocklist_views
from .views import workOrder_views
from .views import purchasing_forecast_views
from .views.warehousing import goods_recieved_views, goods_out_views



urlpatterns = [
    ## User views
    path('users/login/', user_views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/profile/', user_views.getUser, name = 'get user'),

    # Event views
    path('events/', event_views.getEvents, name = 'events'),
    path('event/<str:pk>', event_views.getEvent, name = 'event'),
    path('upload_event/', event_views.createEvent.as_view(), name = 'create event'),
    path('deleteEvent/', event_views.deleteEvent, name = 'delete event'), 
    path('updateEvent/<str:pk>', event_views.createEventLines, name = 'create event lines'),

    # Purchasing Forecast views
    path('generatePurchaseDemand/', purchasing_forecast_views.trialKit, name = 'trial kit'),
    path('purchaseEvents/', purchasing_forecast_views.getPurchaseEvents, name = 'purchase events'),
    path('purchaseEvent/<str:pk>', purchasing_forecast_views.getPurchaseEvent, name = 'purchase event'),
    path('autogen_PO/', purchasing_forecast_views.autogen_PO, name = 'generate PO from purchase calendar'),
    path('updatePurchaseEvent/<str:pk>', purchasing_forecast_views.updatePurchaseEvent, name = 'update purhcase event'),
    path('mergePurchaseEvents/', purchasing_forecast_views.merge_purchase_events, name = 'Merge purchase events'),

    # Purchasing views
    path('getCustomerCodes/', purchasing_views.getCustomerCodes, name = 'get Customer codes'),
    path('validateStock/', purchasing_views.validateStock, name = 'validate stock'),
    path('createStockToBuy/', purchasing_views.createStockToBuy, name = 'create stock to buy'),
    path('createPO/', purchasing_views.createPO, name = 'create purchase order' ),
    path('purchaseOrders/', purchasing_views.getPurchaseOrders, name = 'purchase orders'),
    path('purchaseOrder/<str:pk>', purchasing_views.getPurchaseOrder, name = 'purchase order'),
    path('updateStockToBuy/', purchasing_views.updateStockToBuy, name = 'update stock to buy'),
    path('updatePurchaseOrderLines/<str:pk>', purchasing_views.updatePurchaseOrderLines, name = 'update PO lines'),
    path('makePurchaseOrderLive/<str:pk>', purchasing_views.makePurchaseOrderLive, name = 'make PO live'),
    path('deletePurchaseOrder/', purchasing_views.deletePurchaseOrder, name = 'delete PO'),
    path('downloadPO/<str:pk>', purchasing_views.downloadPO, name = 'download PO'),
    path('outstandingCompleteExpected/<str:pk>', purchasing_views.outstanding_full_complete, name = 'PO oustanding complete expected quantity'),
    path('outstandingPartialExpected/<str:pk>', purchasing_views.outstanding_partial_complete, name = 'PO oustanding complete current quantity'),
    path('remakeLive/<str:pk>', purchasing_views.remake_PO_live, name = 'outstanding PO is made live on a seperate date'),
    path('mergePurchaseOrders/', purchasing_views.merge_purchase_orders, name = 'merge purchase orders for editing'),
    path('clearPurchaseOrders/', purchasing_views.clear_editing, name = 'delete all edited purchase orders'),

    # stock list views 
    path('stocks/', stocklist_views.getStockList, name = 'stocks'),
    path('purchaseStocks/', stocklist_views.getStockPurchaseList, name = 'stock to buy list'),
    path('getStockToBuy/<str:code>', stocklist_views.getStockToBuy, name = 'get stock to buy') ,
    path('editStockToBuy/<str:code>', stocklist_views.editStockToBuy, name = 'edit stock to buy') ,
    path('stockTake/', stocklist_views.stockTake.as_view(), name = 'stock take') ,
    

    # Work order views
    path('getToRemove/', workOrder_views.getToRemove, name = 'getting events that you should remove'),
    path('removeBySalesOrder/', workOrder_views.removeBySalesOrder, name = 'remove stock by sales orders'),

    ## Warehousing views 

    # Goods recieved
    path('warehousing/downloadGoodsRecieved/', goods_recieved_views.downloadGoodsRecieved, name = 'Warehousing goods recieved'),
    path('warehousing/goodsRecieved/', goods_recieved_views.goodsRecieved, name = 'Warehousing goods recieved'),  
    path('warehousing/generate_daily_production_sheet/', goods_out_views.generate_daily_production_sheet, name = 'generate daily production sheet'),  
    path('warehousing/goodsOut/', goods_out_views.upload_reduction_request.as_view(), name = 'upload reduction request'),  

]

