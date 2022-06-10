import React, {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import {useDispatch, useSelector} from 'react-redux';
import {listEvents} from '../actions/eventActions'
import { CircularProgress } from '@mui/material';
import { Alert } from '@mui/material';


export default function DemandCalendar() {
    const dispatch = useDispatch()
    const eventList = useSelector(state => state.events)
    const {error, loading, events} = eventList
    let navigate = useNavigate()

    const eventClick = (info) => {
        navigate(`/event/${info.event.id}`)
    }

    useEffect(()=> {
        dispatch(listEvents())
        
    }, [dispatch])

   
    return (
        <div>
            {loading ? <CircularProgress size = {80} sx = {{ml: 50}} />
            : error ?  <Alert variant = {'error'} children = {error}/>
            :(<FullCalendar
                plugins={[ dayGridPlugin ]}
                initialView="dayGridMonth"
                eventClick = {eventClick}
                events= {events}
            />)
        }
            
        </div>
    )
}






    



    