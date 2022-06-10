
import {EVENT_FAIL, EVENT_SUCCESS, EVENT_REQUEST} from '../constants/eventConstants'
import {EVENT_LINES_FAIL, EVENT_LINES_SUCCESS, EVENT_LINES_REQUEST} from '../constants/eventConstants'
import {PURCHASE_EVENT_FAIL, PURCHASE_EVENT_SUCCESS, PURCHASE_EVENT_REQUEST} from '../constants/eventConstants'




export const eventsReducer =  (state = {events: []}, action ) => {
    switch(action.type){
        case EVENT_REQUEST:
            return {loading: true, events : []}
        case EVENT_SUCCESS:
            return {loading: false, events : action.payload}
        case EVENT_FAIL:
            return {loading: false, error : action.payload}
        
        default:
            return state
        
    }
}

export const purchaseEventsReducer =  (state = {events: []}, action ) => {
    switch(action.type){
        case PURCHASE_EVENT_REQUEST:
            return {loading: true, events : []}
        case PURCHASE_EVENT_SUCCESS:
            return {loading: false, events : action.payload}
        case PURCHASE_EVENT_FAIL:
            return {loading: false, error : action.payload}
        
        default:
            return state
        
    }
}



export const PurchaseOrderReducer =  (state = {purchaseOrder : []}, action ) => {
    switch(action.type){
        case 'REQUEST':
            return {loading: true, ...state }
        case 'SUCCESS':
            return {loading: false, purchaseOrder  : action.payload}
        case 'FAIL':
            return {loading: false, error : action.payload}
        
        default:
            return state
    }

    
}



