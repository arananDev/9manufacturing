import ToRemove from '../components/ToRemove'
import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { LinearProgress } from '@mui/material';

function RemoveEventsScreen() {
    const [loading, setLoading] = useState(true)
    const [rows, setRows] = useState([])

    async function getEvents(){
        setLoading(true)
        const {data} = await axios.get('/api/getToRemove/')
        setRows(data)
        setLoading(false)
    }

    useEffect(() => {
        getEvents()
    }, [])
    return (
        <div>
            {loading ? <LinearProgress />
            : ( <ToRemove rows = {rows} />)}
        </div>
    )
}

export default RemoveEventsScreen