import React, { useState, forwardRef, useEffect } from "react";
import MaterialTable from 'material-table'
import { Button } from "@material-ui/core";
import axios from 'axios'
import { CircularProgress } from '@mui/material';
import {useNavigate} from 'react-router-dom'
import TextField from '@material-ui/core/TextField';
import moment from 'moment'




// Adding the icons to material table 

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import { StylesProvider, createGenerateClassName } from '@material-ui/styles';

// For net value and gross values
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const generateClassName = createGenerateClassName({
  productionPrefix: 'mt',
  seed: 'mt'
});

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};


function PolOutstanding({id, params}) {
    const navigate = useNavigate() 
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState(moment(new Date()).format("YYYY/MM/DD"))
    const [data, setData] = useState(params['data'])
    const supplier = params['supplier']
    const columns = [
        {title: 'Stock Code', field: 'code', editable: 'never'},
        {title: 'Description', field: 'name', editable: 'never'},
        {title: 'Quantity', field: 'quantity', editable: 'never'},
        {title: 'Goods Recieved', field: 'goodsRecieved', editable: 'never'},
    ]

    

    async function handleComplete() {
        setLoading(true)
        try{
            await axios.post(`/api/outstandingCompleteExpected/${id}`)
            alert(`Purchase Order ${id} completed based on expected quantity`)
            navigate('/PurchaseOrdersOutstanding')
            
        } catch(err) {
            alert(err['response']['data']['message'])
        }
        setLoading(false)
    }

    async function handlePartialComplete() {
      setLoading(true)
      try{
          await axios.post(`/api/outstandingPartialExpected/${id}`, {indicator: false})
          alert(`Purchase Order ${id} completed based on current goods recieved`)
          navigate('/PurchaseOrdersOutstanding')
          
      } catch(err) {
          alert(err['response']['data']['message'])
      }
      setLoading(false)
  }

  async function handleLive() {
    setLoading(true)
    try{
        await axios.post(`/api/remakeLive/${id}`, {date: date})
        alert(`Purchase Order ${id} has been remade live`)
        navigate('/PurchaseOrdersOutstanding')
        
    } catch(err) {
        alert('Please provide the correct date')
    }
    setLoading(false)
}

    
    return(
      <div>
        {loading ? <CircularProgress /> 
        :(
        <div>
          <StylesProvider generateClassName={generateClassName}>
            <MaterialTable
                icons = {tableIcons}
                title= {supplier}
                columns={columns}
                data={data}
                options = {{pageSize : data.length}}
              />
          </StylesProvider>
        <div style = {{marginTop: '4em'}} >
          <Button  variant = 'contained' color="primary" onClick = {handleComplete}> Complete Purchase Order with expected quantity </Button >
          <br/>
          <Button style = {{marginTop: '4em'}} variant = 'contained' color="secondary" onClick = {handlePartialComplete}> Complete Purchase Order with current goods recieved </Button >
          <br/>
          <TextField
            style = {{marginLeft: '140px', marginTop: '4em'}}
            required
            id="startDate"
            label="new PO date"
            type="date"
            value={date}
            onChange={(event) => {setDate(event.target.value)}}
            sx={{ width: 220 }}
            InputLabelProps={{
            shrink: true,
            }}
        />
        <br/>
          <Button style = {{marginTop: '4em'}} variant = 'contained' color="info" onClick = {handleLive}> Make purchase order live again for another date</Button >
        </div>
      </div>
      )}
      </div>
        )
  
  
}

export default PolOutstanding;

