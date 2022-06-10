import {createStore, combineReducers, applyMiddleware} from 'redux'
import thunk from 'redux-thunk';
import {eventsReducer, PurchaseOrderReducer, purchaseEventsReducer} from './reducers/eventReducers'
import { composeWithDevTools} from 'redux-devtools-extension';

const reducer = combineReducers({
    events: eventsReducer,
    purchaseOrders: PurchaseOrderReducer,
    purchaseEvents: purchaseEventsReducer,

})




const middleware = [thunk]

const store = createStore(reducer,  composeWithDevTools(applyMiddleware(...middleware)))





export default store
