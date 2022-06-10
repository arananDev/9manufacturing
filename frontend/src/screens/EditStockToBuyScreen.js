import React, { useState, forwardRef, useEffect } from "react";
import MaterialTable from 'material-table'
import { CircularProgress } from '@mui/material';
import { StylesProvider, createGenerateClassName } from '@material-ui/styles';
import axios from 'axios'
import {useParams} from 'react-router-dom'
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Button } from "@material-ui/core";


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

function EditStockToBuyScreen() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([])
    const [disabled, setDisabled] = useState(true)
    const [supplierChoices, setSupplierChoices] = useState([])
    const [defaultSupplier, setDefaultSupplier] = useState('ligma')
    const {code} = useParams()
   
    const columns = [
        {title: 'Supplier', field: 'supplier',},
        {title: 'Date Modified', field: 'dateModified', editable: 'never'},
        {title: 'Price', field: 'price',},
        {title: 'Conversion Rate', field: 'ratioToStock',},
        {title: 'Lead Time', field: 'leadTime',},
        {title: 'Purchase Unit', field: 'purchaseUnit',},
        {title: 'Code For Supplier', field: 'codeForSupplier',},
        {title: 'Tax Code', field: 'taxCode', lookup: {'zeroRated': 'zeroRated', 'exempt': 'exempt', 'standardRate': 'standardRate'}},
    ]

    async function getStockToBuy(){
        setLoading(true)
        try{
            const stock = await axios.get(`/api/getStockToBuy/${code}`)
            setData(stock['data']['data'])
            setDefaultSupplier(stock['data']['defaultSupplier'])
            setSupplierChoices(stock['data']['supplierChoices'])
        } catch(err) {
            alert('Issue with getting the data, Local server may be down')
        }
        setLoading(false)

    }
    useEffect(() => {
      getStockToBuy()
    }, [])
    
    useEffect(() => {
      setSupplierChoices(supplierChoices)
    }, [supplierChoices])


    function handleDefaultSupplier(event){
      setDisabled(false)
      setDefaultSupplier(event.target.value)
    }

    async function handleSave(){
      setLoading(true)
      try{
        await axios.post(`/api/editStockToBuy/${code}`, {data: data, defaultSupplier: defaultSupplier})
        alert(`changes to ${code} have been saved`)
      } catch(err){
        alert(err['response']['data']['message'])
      }
      setLoading(false)
      
    }


  
    return(
      <div>
        {loading ? <CircularProgress /> 
        :(
          <div>
          <Box sx={{ minWidth: 120,mb: 10}}>
              <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">default Supplier</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={defaultSupplier}
                label="default Supplier"
                onChange={handleDefaultSupplier}
              >
                 {supplierChoices.map(s => {
                  return(
                    <MenuItem key = {s} id = {s} value={s}>{s}</MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </Box>
          <StylesProvider generateClassName={generateClassName}>
            <MaterialTable
                options = {{pageSize: data.length + 5}}
                icons = {tableIcons}
                title= {'Current Stock to Buy'}
                columns={columns}
                data={data}
                editable={{
                  onRowAdd: newData =>
                  new Promise((resolve, reject) => {
                      setTimeout(() => {
                          setData([...data, newData]);
                          setSupplierChoices([...supplierChoices, newData['supplier']])
                          console.log(supplierChoices)
                          resolve();
                          setDisabled(false)
                      }, 1000);
                  }),
                  onRowUpdate: (newData, oldData) =>
                    new Promise((resolve, reject) => {
                      setTimeout(() => {
                        const dataUpdate = [...data];
                        const index = oldData.tableData.id;
                        dataUpdate[index] = newData;
                        setData([...dataUpdate]);
                        setDisabled(false)
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
                        setDisabled(false)
                        resolve()
                      }, 1000)
                    }),
                }}     
              />
          </StylesProvider>
          <div >
            <Button  disabled = {disabled} variant = 'contained' color="primary" onClick = {handleSave}> Save </Button >
          </div>
          </div>
          )}
      </div>)
  
  
              }

export default EditStockToBuyScreen;

