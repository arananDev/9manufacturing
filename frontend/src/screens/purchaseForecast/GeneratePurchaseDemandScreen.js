import React, {useState, useEffect} from 'react'
import Box from '@mui/material/Box';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Button } from '@mui/material';
import { LinearProgress } from '@mui/material';
import axios from 'axios'
import { Alert } from '@mui/material';

function GeneratePurchaseDemandScreen() {
    
    const [check, setCheck] = useState(false)
    const [loading, setLoading] = useState(false)
	const [variant, setVariant] = useState('info');
    const [showResults, setShowResults] = useState(false)
    


    function handleCheck(){
        setCheck(!check)
    }

    async function trialKit(){
        setLoading(true)
        try{
            const {data} = await axios.post('/api/generatePurchaseDemand/',  {download: check})
            setShowResults(data['message'])
            setVariant('success')
        }catch(error){
            setShowResults(error.response.data.message)
            setVariant('error')
        }
        setLoading(false)
    }

    

    return(
        <div>
        {loading ? <LinearProgress color = {'secondary'} />
        : showResults ? <Alert severity = {variant} children = {showResults} />
        :(<div>
            <Box sx={{ display: 'flex' }}>
                <FormGroup>
                <FormControlLabel control={<Checkbox checked = {check} onClick = {handleCheck} />} label="Do you want to download an excel report of the trial kit?" />
                </FormGroup>
            </Box>
            <Button color = {'secondary'} variant = {'contained'} onClick = {trialKit}> Generate purchase demand based on production batches </Button>
        </div>
        )
    }
            
        </div>
        
    )
}

export default GeneratePurchaseDemandScreen