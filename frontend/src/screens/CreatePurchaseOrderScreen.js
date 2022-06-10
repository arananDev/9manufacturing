import React, {useState, useEffect} from 'react';
import TextField from '@material-ui/core/TextField';
import moment from 'moment'
import { useFormik } from 'formik';
import { Button } from "@material-ui/core";
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import {useNavigate} from 'react-router-dom'



function CreatePurchaseOrderScreen() {
    let navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    
    async function handleSubmit(values) {
        setLoading(true)
        try {
            console.log(values)
            await axios.get('/api/validateStock/', {params: {data: values['stockCodes'], supplier: values['supplierCode']}})
            await axios.post('/api/createPO/', {data: values})
            alert('Purchase Order created!')
            navigate('/purchaseOrderList')
        } catch(e) {
            if (e.response.data.status ===  'nonExistant') {
                alert(e.response.data.message)                  
            }
            else {
                localStorage.setItem('missingStock',JSON.stringify(e.response.data.data))
                window.open('/stockToBuyPrompt')
            }
        }
        setLoading(false)
        

    }
    
    const formik = useFormik({
        initialValues: {
          supplierCode: '',
          date: moment(new Date()).format("YYYY/MM/DD"),
          stockCodes: ''
        },
        onSubmit: (values) => {
            handleSubmit(values)
        },
      });

      useEffect(() => {
          setLoading(loading)
      }, [loading])


    return (
        <form onSubmit = {formik.handleSubmit}>
            <TextField required id = 'supplierCode'label="Supplier Code" value={formik.values.supplierCode} onChange={formik.handleChange} variant="standard" />
            <TextField
                    style = {{marginLeft: '25px'}}
                    required
                    id="date"
                    label="Requested date"
                    type="date"
                    value={formik.values.date}
                    onChange={formik.handleChange}
                    sx={{ width: 220 }}
                    InputLabelProps={{
                    shrink: true,
                    }}
                />
            <TextField style = {{marginLeft: '25px'}} id = 'stockCodes'value={formik.values.stockCodes} onChange={formik.handleChange} placeholder= 'comma seperated Stock codes e.g. ING001, ING0002' required  label = 'stock codes' multiline variant = 'standard' />
        {loading ? <CircularProgress /> 
        : (<Button style = {{marginLeft: '25px'}} color="primary" variant="contained"  type="submit">
                Submit
            </Button>)
            }
        
        </form>
        
    )
}

export default CreatePurchaseOrderScreen;
