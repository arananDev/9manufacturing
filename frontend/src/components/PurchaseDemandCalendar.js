import React, {useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import {useDispatch, useSelector} from 'react-redux';
import {listPurchaseEvents} from '../actions/eventActions'
import { CircularProgress } from '@mui/material';
import { Alert } from '@mui/material';



export default function PurchaseDemandCalendar() {
    const dispatch = useDispatch()
    const eventList = useSelector(state => state.purchaseEvents)
    const {error, loading, events} = eventList
    let navigate = useNavigate()

    const eventClick = (info) => {
        navigate(`/purchaseEvent/${info.event.id}`)
    }

    useEffect(()=> {
        dispatch(listPurchaseEvents())
    }, [dispatch])

   
    return (
        <div>
            {loading ? <CircularProgress size = {80} color = {'secondary'} sx = {{ml: 50}} />
            : error ?  <Alert variant = {'error'} children = {error}/>
            :(<FullCalendar
                eventColor='#9c27b0'
                plugins={[ dayGridPlugin ]}
                initialView="dayGridMonth"
                eventClick = {eventClick}
                events= {events}
            />)
        }
            
        </div>
    )
}






    



    