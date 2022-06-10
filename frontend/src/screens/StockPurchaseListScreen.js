import React, { useState, forwardRef, useEffect } from "react";
import MaterialTable from 'material-table'
import { LinearProgress } from '@mui/material';
import { StylesProvider, createGenerateClassName } from '@material-ui/styles';
import axios from 'axios'



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

function StockListScreen() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([])
   
    const columns = [
        {title: 'Stock Code', field: 'code', editable: 'never'},
        {title: 'description', field: 'name', editable: 'never'},

    ]

    async function getStockToBuy(){
        setLoading(true)
        try{
            const stock = await axios.get('/api/purchaseStocks/')
            setData(stock['data'])
        } catch(err) {
            alert('Issue with getting the data, Local server may be down')
        }
        setLoading(false)

    }
    
    useEffect(() => {
      getStockToBuy()
    }, [])
  
    return(
      <div>
        {loading ? <LinearProgress /> 
        :(
          <StylesProvider generateClassName={generateClassName}>
            <MaterialTable
                options = {{pageSize: 100}}
                icons = {tableIcons}
                title= {'Stock Purchase List'}
                columns={columns}
                data={data} 
                onRowClick = {(event, rowData) => {
                    window.open(`/editStockToBuy/${rowData.code}`)
                }}           
              />
          </StylesProvider>)}
    </div>)
  
  
}

export default StockListScreen;

