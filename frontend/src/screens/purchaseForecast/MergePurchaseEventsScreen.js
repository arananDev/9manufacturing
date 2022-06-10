import React, {useState, useEffect} from 'react';
import TextField from '@material-ui/core/TextField';
import moment from 'moment'
import { Button } from "@material-ui/core";
import LinearProgress from '@mui/material/LinearProgress';
import axios from 'axios';
import Box from '@mui/material/Box';
import {useNavigate} from 'react-router-dom'



function TrialKittingScreen() {
  const [loading,setLoading] = useState(false)
  const [dates, setDates] = useState({'startDate': moment(new Date()).format("YYYY/MM/DD"), 'endDate': moment(new Date()).format("YYYY/MM/DD") })
  const navigate = useNavigate()

  async function mergeEvents(){
    setLoading(true)
    try{
        await axios.post('/api/mergePurchaseEvents/', {params: {
        'startDate': dates['startDate'],
        'endDate': dates['endDate'],}})
        alert('Purchase events from dates selected have been merged')
        navigate("/purchaseDemand")

    }catch(err){
      alert(err['response']['data']['message'])
    }
    setLoading(false)
  }

  const handleDate = (event) => {
    setDates({
      ...dates,
      [event.target.id]: event.target.value,
    });
  }

  return (
    <div>
      {loading ? <LinearProgress color = 'secondary'/> :
     (<div>
        <Box style = {{marginTop: '8em', marginLeft: '12em'}}>
          <h6> From which start dates and end dates do you want to merge Purchase Events?</h6>
          <TextField
            style = {{marginLeft: '140px', marginTop: '4em'}}
            required
            id="startDate"
            label="start date"
            type="date"
            value={dates['startDate']}
            onChange={handleDate}
            sx={{ width: 220 }}
            InputLabelProps={{
            shrink: true,
            }}
        />
          <TextField
              style = {{marginLeft: '25px', marginTop: '4em'}}
              required
              id="endDate"
              label="end date"
              type="date"
              value={dates['endDate']}
              onChange={handleDate}
              sx={{ width: 220 }}
              InputLabelProps={{
              shrink: true,
              }}
          />
        </Box>
        <Button style = {{marginTop: '5em', marginLeft: '30%'}} variant = {'contained'} color = 'secondary' onClick = {mergeEvents}> Merge Purchase Events </Button>
      </div>
      )}
      
    </div>
  );
}

export default TrialKittingScreen;
