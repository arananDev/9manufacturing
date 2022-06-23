import React, {useState} from 'react'
import Button from '@mui/material/Button';
import axios from 'axios'
import { CircularProgress } from '@mui/material';



function StockEvaluationScreen() {

    const [loading, setLoading] = useState(false)
    async function stockList(){
        setLoading(true)
        try{
            const response =  await axios.get(`/api/stockEvaluation/`)
            const url = window.URL.createObjectURL(
              new Blob([response["data"]]),
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
              `stock evaluation-${String(today)}.csv`,
            );
            document.body.appendChild(link);
      
            // Start download
            link.click();
      
            // Clean up and remove the link
            link.parentNode.removeChild(link);
            alert(`stock evaluation is being downloaded`)
      
            }catch(err){
                alert(err['response']['data']['message'])
      
            }
            
            
        setLoading(false)
        
    }

  return (
    <div>
        {loading? <CircularProgress size = {80}/>
        :<Button variant="contained" onClick = {stockList}>Download Stock Evaluation</Button>
        }
    </div>

  )
}

export default StockEvaluationScreen