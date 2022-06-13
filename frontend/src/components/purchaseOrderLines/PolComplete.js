import React, { useState, forwardRef, useEffect } from "react";
import MaterialTable from 'material-table'
import { Button } from "@material-ui/core";
import { CircularProgress } from '@mui/material';
import { StylesProvider, createGenerateClassName } from '@material-ui/styles';
import axios from 'axios'
import {useNavigate} from 'react-router-dom'


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

// For net value and gross values
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';



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

const generateClassName = createGenerateClassName({
  productionPrefix: 'mt',
  seed: 'mt'
});

function PolComplete({id, params}) {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(params['data'])
    const [file, setFile] = useState('')
    const goodsRecieved = {}
    data.forEach(d => {goodsRecieved[d['code']] = d['goodsRecieved']})
    const supplier = params['supplier']
    const [netValue, setnetValue] = useState(0)
    const [vatValue, setvatValue] = useState(0)
    const [grossValue, setgrossValue] = useState(0)
    const columns = [
        {title: 'Stock Code', field: 'code', editable: 'never'},
        {title: 'Description', field: 'name', editable: 'never'},
        {title: 'Price', field: 'price', editable: 'never'},
        {title: 'VAT rate', field: 'taxCode',  lookup: {'zeroRated': 'zeroRated', 'exempt': 'exempt', 'standardRate': 'standardRate'},editable: 'never'},
        {title: 'Quantity', field: 'quantity', editable: 'never'},
        {title: 'Goods Recieved', field: 'goodsRecieved',}
    ]
    
    async function handleDownload() {
      setLoading(true)
      try{
      const response =  await axios.get(`/api/downloadPO/${id}`)
      console.log(response)
      const url = window.URL.createObjectURL(
        new Blob([response.body]),
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `po-invoice-${id}.pdf`,
      );
      document.body.appendChild(link);

      // Start download
      link.click();

      // Clean up and remove the link
      link.parentNode.removeChild(link);
      alert(`Purchase Order ${id} has been downloaded`)

      }catch(err){
        alert(err['response']['data']['message'])

      }
      
      
      setLoading(false)
  }
    

    

    useEffect(() => {
        let net = 0
        let vat = 0
        data.forEach(row => {
            net += (row['price'] * row['quantity'])
            if (row['taxCode'] === 'standardRate') {
                vat += ((row['price'] * row['quantity']) * 0.2)
            }
        })
        setnetValue(net.toFixed(2))
        setvatValue(vat.toFixed(2))
        setgrossValue((net + vat).toFixed(2))
    })

    useEffect(() => {
      setLoading(loading)
    }, [setLoading])
  
    return(
      <div>
        {loading ? <CircularProgress /> 
        :(
        <div>
          <StylesProvider generateClassName={generateClassName}>
            <MaterialTable
                options = {{pageSize: data.length}}
                icons = {tableIcons}
                title= {supplier}
                columns={columns}
                data={data}            
              />
          </StylesProvider>
        <div>
            <Card sx={{ minWidth: 275 }}>
            <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Purchase Order Values
                </Typography>
                <Typography variant="body2">
                {`Total Net ${netValue}`}
                <br />
                {`Total VAT ${vatValue}`}
                <br />
                {`Total Gross ${grossValue}`}
                </Typography>
            </CardContent>
            </Card>
        </div>
        <div style = {{marginTop: '4em'}} >
          <Button  variant = 'contained' color="primary" onClick = {handleDownload}> Download Purchase Order </Button >
        </div>
      </div>
      )}
      </div>
    
        )
  
  
}

export default PolComplete;

