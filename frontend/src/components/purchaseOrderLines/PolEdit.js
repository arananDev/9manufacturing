import React, { useState, forwardRef, useEffect } from "react";
import MaterialTable from 'material-table'
import { Button } from "@material-ui/core";
import axios from 'axios'
import { CircularProgress } from '@mui/material';
import { Alert } from '@mui/material';
import {useNavigate} from 'react-router-dom'
import { useFormik } from 'formik';
import TextField from '@material-ui/core/TextField';
import { StylesProvider, createGenerateClassName } from '@material-ui/styles';



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


function PolEdit({id, params}) {
    const navigate = useNavigate()
    const [date, setDate] = useState(params['dateRequested'])
    const [loading, setLoading] = useState(false)
    const [goLive, setGoLive] = useState(false)
    const [data, setData] = useState(params['data'])
    const supplier = params['supplier']
    const [netValue, setnetValue] = useState(0)
    const [vatValue, setvatValue] = useState(0)
    const [grossValue, setgrossValue] = useState(0)
    const columns = [
        {title: 'Stock Code', field: 'code', editable: 'never'},
        {title: 'Description', field: 'name', editable: 'never'},
        {title: 'Stock Unit', field: 'stock unit', editable: 'never'},
        {title: 'Purchase Unit', field: 'purchase unit', editable: 'never'},
        {title: 'Price', field: 'price', validate: rowData => isNaN(rowData.price) ? 'price should be a number ' : ''},
        {title: 'Quantity before conversion', field: 'unconvertedQuantity', editable: 'never'},
        {title: 'Stock unit to Purchase unit conversion rate', field: 'conversionRate', validate: rowData => isNaN(rowData.conversionRate) ? 'conversionRate should be a number ' : ''},
        {title: 'Order Quantity', field: 'quantity', validate: rowData => isNaN(rowData.quantity) ? 'quantity should be a number ' : ''},
        {title: 'VAT rate', field: 'taxCode',  lookup: {'zeroRated': 'zeroRated', 'exempt': 'exempt', 'standardRate': 'standardRate'}},
    ]
    
    


    async function handleSave(){
        setLoading(true)
        const newPurchaseOrderLines = []
        const newStockItems = []

        data.forEach(row => {
            newStockItems.push({'code': row['code'], 'price': (row['price']), 'taxCode': row['taxCode'], 'ratioToStock': row['conversionRate'] ,
            'defaultSupplier': params['supplierCode'],})
            newPurchaseOrderLines.push({'purchaseID': id, 'stockCode': row['code'] ,'price': row['price'], 'quantity': row['quantity']
            , 'goodsRecieved': 0, 'goodsPending': row['quantity'] , 'conversionRate': row['conversionRate'] })
        })

        try{
          await axios.post(`/api/updateStockToBuy/`, {data: newStockItems})
          await axios.post(`/api/updatePurchaseOrderLines/${id}`, {data: newPurchaseOrderLines, params:
             {'Net': netValue, 'Vat': vatValue, 'dateRequested': date, 'supplier': params['supplierCode']},
            })
          alert(`Purchase Order ${id} saved successfully!`)
          setGoLive(true)
        }
                        
            
        catch(error) {
          alert(error['response']['data']['message'])
        }
        setLoading(false)
    }

    async function handleLive() {
      setLoading(true)
      try{
        const newData = []
        data.forEach(row => {
          newData.push({ 'quantityOutstanding': (row['quantity']), 'code': row['code'], })
        })
        await axios.post(`/api/makePurchaseOrderLive/${id}`, {data: newData})
        alert(`Purchase Order ${id} has gone live`)
        navigate('/purchaseOrderList')
      } catch(err) {
        alert(err['response']['data']['message'])
      }
      setLoading(false)
      

    }

    async function handleDelete(){
      setLoading(true)
      try{
        await axios.post('/api/deletePurchaseOrder/', {id: id})
        alert(`Purchase Order ${id} deleted`)
        navigate('/purchaseOrderList')
      } catch(err) {
        alert(`Purchase Order ${id} failed to delete.${err.message}`)
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
        : goLive ? (
          <div>
            <Alert severity="info">Purchase order has been saved! Do you want to make it live?</Alert>
            <Button style = {{marginTop : '6em'}} variant = 'contained' color = 'info' onClick = {handleLive} > Go Live </Button>
          </div>
          )
        :(
        <div>
        <TextField
                    style = {{marginLeft: '25px'}}
                    required
                    id="date"
                    label="Requested date"
                    type="date"
                    value={date}
                    onChange={ (event) => {setDate(event.target.value)}}
                    sx={{ width: 220 }}
                    InputLabelProps={{
                    shrink: true,
                    }}
                />
        <StylesProvider generateClassName={generateClassName}>
          <MaterialTable
              icons = {tableIcons}
              title= {supplier}
              columns={columns}
              data={data}
              options = {{pageSize: data.length}}
              editable={{
                onBulkUpdate: changes =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    const dataUpdate = [...data]
                    Object.keys(changes).forEach(index => {
                        dataUpdate[index] = changes[index]['newData']
                    })
                    setData(dataUpdate)
                    resolve();
                  }, 1000);
                }),  
                onRowUpdate: (newData, oldData) =>
                  new Promise((resolve, reject) => {
                    setTimeout(() => {
                      const dataUpdate = [...data];
                      const index = oldData.tableData.id;
                      dataUpdate[index] = newData;
                      setData(dataUpdate);
                      resolve();
                    }, 1000)
                  }),
                onRowDelete: oldData =>
                  new Promise((resolve, reject) => {
                    setTimeout(() => {
                      const dataDelete = [...data];
                      const index = oldData.tableData.id;
                      dataDelete.splice(index, 1);
                      setData([...dataDelete]);
                      
                      resolve()
                    }, 1000)
                  }),
              }}
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
          <Button  variant = 'contained' color="primary" onClick = {handleSave}> Save </Button >
          <Button variant = 'contained' color = 'warning' onClick = {handleDelete} > Delete Purchase Order </Button>
        </div>
      </div>
      )}
      </div>
    
        )
  
  
}

export default PolEdit;

