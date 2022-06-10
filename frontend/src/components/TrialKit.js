import React, { useState, forwardRef, useEffect } from "react";
import MaterialTable from 'material-table'
import { Button } from "@material-ui/core";
import axios from 'axios'
import { LinearProgress } from '@mui/material';
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
import { StylesProvider, createGenerateClassName } from '@material-ui/styles';



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


function TrialKit({results}) {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(results)
    const columns = [
        {title: 'Stock Code', field: 'code', editable: 'never'},
        {title: 'Description', field: 'description', editable: 'never'},
        {title: 'Unit of Measure', field: 'unit', editable: 'never'},
        {title: 'Quantity Demanded', field: 'quantity', editable: 'never'},
        {title: 'Quantity Outstanding', field: 'quantityOutstanding', editable: 'never'},
        {title: 'Quantity In Stock', field: 'quantityInStock', editable: 'never'},
        {title: 'Order Quantity', field: 'quantitySuggested',
          headerStyle: {
            backgroundColor: 'red',
          },
         validate: rowData => isNaN(rowData.quantitySuggested) ? 'Order Quantity must be a number' 
         : rowData.quantitySuggested < 0 ? 'Order Quantity can not be negative' 
         : ''}
    ]
    

    useEffect(() => {
        setLoading(loading)
    }, [loading])

    async function handleGeneratePO(){
        setLoading(true)
        let codes = ''
        data.forEach(d => {
            codes += d['code'] + ','
        })
        try {
            await axios.get('/api/validateStock/', {params: {data: codes}})
            await axios.post('/api/TK_PO/', {'data': data})
            alert('Purchase Orders have been generated!')
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

    useEffect(() => {
      setLoading(loading)
    }, [setLoading])
  
    return(
      <div>
        {loading ? <LinearProgress /> 
        :(
        <div>
          <StylesProvider generateClassName={generateClassName}>
            <MaterialTable
                icons = {tableIcons}
                title= {'Quantity required to Purchase'}
                columns={columns}
                data={data}
                options = {{pageSize : data.length}}
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
        <div style = {{marginTop: '4em'}} >
          <Button  variant = 'contained' color="primary" onClick = {handleGeneratePO}> Generate Purchase Orders </Button >
        </div>
      </div>
      )}
      </div>
    
        )
}

export default TrialKit;

