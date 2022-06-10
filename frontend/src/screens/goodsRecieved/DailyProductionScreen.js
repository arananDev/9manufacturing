import React, { useState } from "react";
import { Button } from "@material-ui/core";
import axios from 'axios'
import { CircularProgress } from '@mui/material';



function DailyProductionScreen() {
    const [loading, setLoading] = useState(false)

    async function handleDownload(){
        setLoading(true)
        try{
            await axios.get('/api/warehousing/generate_daily_production_sheet/')
            alert('file downloading!')
        }catch{
            alert('Internal Sever Error')
        }
        setLoading(false)
    }


    return (
        <div style = {{marginBottom: '4em'}}>
            {loading ? <CircularProgress /> :
            (
                <Button  variant = 'contained' color="secondary" onClick = {handleDownload}> Download Production for the day</Button >
            )}
        </div>
    )
}

export default DailyProductionScreen