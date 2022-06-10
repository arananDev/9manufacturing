import React, {useState, useEffect} from 'react';
import TextField from '@material-ui/core/TextField';
import moment from 'moment'
import { Button } from "@material-ui/core";
import LinearProgress from '@mui/material/LinearProgress';
import axios from 'axios';
import {useNavigate} from 'react-router-dom'
import Box from '@mui/material/Box';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';
import TrialKit from '../components/TrialKit'

function TrialKittingScreen() {
  const customerCodes = {}
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState([])
  const [loading,setLoading] = useState(false)
  const [check, setCheck] = useState([])
  const [dates, setDates] = useState({'startDate': moment(new Date()).format("YYYY/MM/DD"), 'endDate': moment(new Date()).format("YYYY/MM/DD") })

  async function generateDemand(){
    setLoading(true)
    try{
      let companies = ''
      Object.keys(check).forEach(c => {
        if (check[c] === true){
          companies += c
          companies += ','
        }
      })
      if (companies.length <= 0){
        throw Error('please click on a company')
      }
      console.log(companies)
      const {data} = await axios.get('/api/trialKit', {params: {
        'companies': companies,
        'startDate': dates['startDate'],
        'endDate': dates['endDate'],}})
      setResults(data)
      setShowResults(true)
    }catch(err){
      alert(err['message'])
    }
    setLoading(false)
  }

  useEffect(() => {
      axios.get('/api/getCustomerCodes/').then((data) => {
      data['data'].forEach(d => {customerCodes[d['code']] = false})
      setCheck(customerCodes)
    })
  }, [])

  useEffect(() => {
    setLoading(loading)
  }, [setLoading])



  const handleCheck = (event) => {
    setCheck({
      ...check,
      [event.target.name]: event.target.checked,
    });
  };

  const handleDate = (event) => {
    setDates({
      ...dates,
      [event.target.id]: event.target.value,
    });
  }

  return (
    <div>
      {loading ? <LinearProgress /> :
      showResults ? <TrialKit results = {results}/> :
      (<div>
        <Box sx={{ display: 'flex' }}>
          <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
            <FormLabel component="legend"> Please select customers</FormLabel>
            <FormGroup>
              {Object.keys(check).map(c => {
                return(
                <FormControlLabel
                control={
                  <Checkbox checked={check[c]} onChange={handleCheck} name= {String(c)} id = {c} />
                }
                label= {String(c)}
                />
                )
              })}
            </FormGroup>
            <FormHelperText> You can check multiple customers</FormHelperText>
          </FormControl>
        </Box>
        <Box style = {{marginTop: '5em'}}>
          <h6> Select start dates and end dates for trial kitting</h6>
          <TextField
            style = {{marginLeft: '25px'}}
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
              style = {{marginLeft: '25px'}}
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
        <Button variant = {'contained'} color = 'primary' onClick = {generateDemand}> Generate Demand </Button>
      </div>
      )}
      
    </div>
  );
}

export default TrialKittingScreen;
