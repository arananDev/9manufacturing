import React, {useEffect, useState} from 'react';
import Pol_GR from '../../components/purchaseOrderLines/Pol_GR'
import {useParams} from 'react-router-dom'
import axios from 'axios'
import { CircularProgress } from '@mui/material';


function RecieveOrderScreen() {
    let {id} = useParams()
    const [loading, setLoading] = useState(true)
    const [params, setParams] = useState([])
    
    useEffect(() => {
        axios.get(`/api/purchaseOrder/${id}`).then((response) => {
            setParams(response['data'])
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
            :  (<Pol_GR params = {params} id = {id}/>)
            }
        </div>
        
        
    )

    

}

export default RecieveOrderScreen;
