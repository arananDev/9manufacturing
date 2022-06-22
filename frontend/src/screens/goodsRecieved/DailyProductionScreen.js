import React, { useEffect, useState } from "react";
import { Button } from "@material-ui/core";
import axios from 'axios'
import { CircularProgress } from '@mui/material';



function DailyProductionScreen() {
    const [loading, setLoading] = useState(false)
    

    async function handleDownload(){
        setLoading(true)
        try{
            const response =  await axios.get('/api/warehousing/generate_daily_production_sheet/')
            const url = window.URL.createObjectURL(
              new Blob([response.body]),
            );
            const link = document.createElement('a');
            link.href = url;
            let today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            const yyyy = today.getFullYear();
            today = dd + '/' + mm + '/' + yyyy;
            link.setAttribute(
              'download',
              `Daily Production-${String(today)}.csv`,
            );
            document.body.appendChild(link);
      
            // Start download
            link.click();
      
            // Clean up and remove the link
            link.parentNode.removeChild(link);
            alert(`File is being downloaded`)
      
            }catch(err){
              alert('Internal Server Error')
      
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