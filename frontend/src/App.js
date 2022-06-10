import Header from './components/Header'
import { Container } from '@mui/material';
import {BrowserRouter , Routes,  Route} from 'react-router-dom'
import ForecastScreen from './screens/ForecastScreen'
import TestScreen from './screens/TestScreen'
import PurchaseForecastScreen from './screens/purchaseForecast/PurchaseForecastScreen'
import MergePurchaseEventsScreen from './screens/purchaseForecast/MergePurchaseEventsScreen'
import GeneratePurchaseDemandScreen from './screens/purchaseForecast/GeneratePurchaseDemandScreen'
import PurchaseEventScreen from './screens/purchaseForecast/PurchaseEventScreen'
import EventScreen from './screens/EventScreen'
import CreateEventsScreen from './screens/CreateEventsScreen'
import RemoveEventsScreen from './screens/RemoveEventsScreen'
import PurchaseOrderProcessingScreen from './screens/PurchaseOrderProcessingScreen';
import PurchaseOrderScreen from './screens/PurchaseOrderScreen';
import CreatePurchaseOrderScreen from './screens/CreatePurchaseOrderScreen'
import TrialKittingScreen from './screens/TrialKittingScreen'
import StockToBuyScreen from './screens/StockToBuyScreen'
import EditStockToBuyScreen from './screens/EditStockToBuyScreen'
import StockListScreen from './screens/StockListScreen'
import StockTakeScreen from './screens/StockTakeScreen'
import LoginScreen from './screens/LoginScreen'
import StockDatabaseScreen from './screens/StockDatabaseScreen'
import StockPurchaseListScreen from './screens/StockPurchaseListScreen'
import GoodsRecievedScreen from './screens/goodsRecieved/GoodsRecievedScreen'
import RecieveOrderScreen from './screens/goodsRecieved/RecieveOrderScreen'
import GoodsOutScreen from './screens/goodsRecieved/GoodsOutScreen'
import DailyProductionScreen from './screens/goodsRecieved/DailyProductionScreen'
import PurchaseOrdersOutstandingScreen from './screens/OutstandingPurchaseOrders/PurchaseOrdersOutstandingScreen'



function App() {
  return (
    <BrowserRouter>
      <Header />
      <main >
        <Container >
          <Routes>
            // Users
            <Route path = '/userLogin' element = {<LoginScreen/>} />
            <Route path = '/test'  element = {<TestScreen/>} />
            // Demand calendar
            <Route exact path = "/" element = { <ForecastScreen />}  />

            // Purchase calendar
            <Route exact path = "/purchaseDemand" element = { <PurchaseForecastScreen />}  />
            <Route exact path = "/generatePurchaseDemand" element = { <GeneratePurchaseDemandScreen />}  />
            <Route exact path = "/mergePurchaseEvents" element = { <MergePurchaseEventsScreen />}  />
            <Route path = "/purchaseEvent/:id" element = { <PurchaseEventScreen />}  />

            // Events 
            <Route path = "/event/:id" element = { <EventScreen />}  />
            <Route path = '/createEvents' element = {<CreateEventsScreen/>} />
            <Route path = '/RemoveEvents' element = {<RemoveEventsScreen/>} />

            // Purchases 
            <Route path = '/purchaseOrderList' element = {<PurchaseOrderProcessingScreen/>} />
            <Route path = '/purchaseOrder/:id' element = {<PurchaseOrderScreen/>} />
            <Route path = '/createPO' element = {<CreatePurchaseOrderScreen/>} />
            <Route path = '/trialKit' element = {<TrialKittingScreen/>} />
            <Route path = '/PurchaseOrdersOutstanding' element = {<PurchaseOrdersOutstandingScreen/>} />


            // Stock database
            <Route path = '/stockList' element = {<StockListScreen/>} />
            <Route path = '/stockDatabase' element = {<StockDatabaseScreen/>} />
            <Route path = '/stockPurchaseList' element = {<StockPurchaseListScreen/>} />
            <Route path = '/editstockToBuy/:code' element = {<EditStockToBuyScreen/>} />
            <Route path = '/stockToBuyPrompt' element = {<StockToBuyScreen/>} />
            <Route path = '/stockTake' element = {<StockTakeScreen/>} />

            // Warehousing
            <Route path = '/warehousing/goodsRecieved' element = {<GoodsRecievedScreen/>} />
            <Route path = '/warehousing/dailyProduction' element = {<DailyProductionScreen/>} />
            <Route path = '/warehousing/goodsOut' element = {<GoodsOutScreen/>} />
            <Route path = '/warehousing/recieveOrder/:id' element = {<RecieveOrderScreen/>} />
          </Routes>
        </Container>
      </main>
    </BrowserRouter>
    
    

  );
}

export default App;
