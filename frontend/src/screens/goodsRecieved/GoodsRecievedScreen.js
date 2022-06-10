import moment from 'moment'
import React, { useState, forwardRef, useEffect } from "react";
import MaterialTable from 'material-table'
import { Button } from "@material-ui/core";
import axios from 'axios'
import { CircularProgress } from '@mui/material';
import { StylesProvider, createGenerateClassName } from '@material-ui/styles';
import {useNavigate} from 'react-router-dom'
import Alert from '@mui/material/Alert';




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
  
  


function GoodsRecievedScreen() {
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const columns = [
        {title: 'Order number', field: 'id',},
        {title: 'Supplier', field: 'supplier',},
    ]

    
    useEffect(()=> {
        setLoading(true)
        axios.get(`/api/purchaseOrders/`,  {params: {status: 'live', date: moment(new Date()).format("YYYY-MM-DD")}}).then((rawData)=>{
            setRows(rawData['data'])
        }).then(() => {setLoading(false)})
        
    }, [])

    async function handleDownload(){
        setLoading(true)
        try{
            await axios.get(`/api/warehousing/downloadGoodsRecieved/`, {params: { date: moment(new Date()).format("YYYY-MM-DD")} })
            alert('Goods recieved csv file has been downloaded!')

        }catch(err){
            alert(err)
        }
        
        setLoading(false)


    }

  return (
    <div>
        <div style = {{marginBottom: '4em'}}>
            <Button  variant = 'contained' color="secondary" onClick = {handleDownload}> Download Goods Recieved list for today</Button >
        </div>
    {loading ? <CircularProgress /> 
    : rows.length === 0 ? <Alert severity = {'info'} > Thank you! There is no goods to recieve for right now</Alert>
    :(
    <div>
      <StylesProvider generateClassName={generateClassName}>
        <MaterialTable
            options = {{pageSize: rows.length}}
            icons = {tableIcons}
            title= {`${moment(new Date()).format("DD/MM/YYYY")}`}
            columns={columns}
            onRowClick = {(event, rowData) => {
                navigate(`/warehousing/recieveOrder/${rowData.id}`)
                
            }}
            data={rows}            
          />
      </StylesProvider>
  </div>
  )}
  </div>

    )

}

export default GoodsRecievedScreen