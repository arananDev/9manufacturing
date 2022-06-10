import {EVENT_FAIL, EVENT_SUCCESS, EVENT_REQUEST} from '../constants/eventConstants'
import {PURCHASE_EVENT_FAIL, PURCHASE_EVENT_SUCCESS, PURCHASE_EVENT_REQUEST} from '../constants/eventConstants'
import axios from 'axios'


export const listEvents = () => async (dispatch) => {
    try {
        dispatch({type: EVENT_REQUEST })
        const {data} = await axios.get('/api/events/')
        dispatch({type: EVENT_SUCCESS , payload : data})
    } catch(error) {
        dispatch({
            type: EVENT_FAIL, payload : error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
        })
    }
}

export const listPurchaseEvents = () => async (dispatch) => {
    try {
        dispatch({type: PURCHASE_EVENT_REQUEST })
        const {data} = await axios.get('/api/purchaseEvents/')
        dispatch({type: PURCHASE_EVENT_SUCCESS , payload : data})
    } catch(error) {
        dispatch({
            type: PURCHASE_EVENT_FAIL, payload : error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
        })
    }
}



export const listPurchaseOrder = (indicator) => async (dispatch) => {
    try {
        dispatch({type: 'REQUEST' })
        const {data} = await axios.get(`/api/purchaseOrders/`,  {params: {status: indicator}})
        dispatch({type: 'SUCCESS' , payload : data})
    } catch(error) {
        dispatch({
            type: 'FAIL', payload : error.response && error.response.data.message
            ? error.response.data.message
            : error.meesage,
        })
    }
}