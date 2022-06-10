import React, {useEffect, useState} from 'react';
import PolEdit from '../components/purchaseOrderLines/PolEdit'
import PolLive from '../components/purchaseOrderLines/PolLive'
import PolComplete from '../components/purchaseOrderLines/PolComplete'
import PolOutstanding from '../components/purchaseOrderLines/PolOutstanding'
import {useParams} from 'react-router-dom'
import axios from 'axios'
import { CircularProgress } from '@mui/material';
import {Alert} from '@mui/material'


function PurchaseOrderScreen() {
    let {id} = useParams()
    const [loading, setLoading] = useState(true)
    const [params, setParams] = useState([])
    const [status, setStatus] = useState('')
    
    useEffect(() => {
        axios.get(`/api/purchaseOrder/${id}`).then((response) => {
            setParams(response['data'])
            setStatus(response['data']['status'])
            setLoading(false)
        }).catch((e) => {
            alert(e)
        })

    }, [])

    useEffect(() => {
        setParams(params)
    }, [setParams])
    
    
    

    return (
        <div>
            {loading ? <CircularProgress />
            : status === 'edit' ? (<PolEdit params = {params} id = {id}/>)
            : status === 'live' ? (<PolLive params = {params} id = {id}/>)
            : status == 'completed' ? (<PolComplete params = {params} id = {id}/>)
            : status == 'outstanding' ? (<PolOutstanding params = {params} id = {id}/>)
            : <Alert severity="error">Error</Alert> }
        </div>
        
        
    )

    

}

export default PurchaseOrderScreen;
