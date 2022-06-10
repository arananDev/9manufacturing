import React, { useState, forwardRef, useEffect } from "react";
import MaterialTable from 'material-table'
import { Button } from "@material-ui/core";
import axios from 'axios'
import { CircularProgress } from '@mui/material';
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


function Pol_GR({id, params}) {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(params['data'])
    const [disabled, setDisabled] = useState(true)
    const [results, setResults] = useState(false)
    const supplier = params['supplier']
    const columns = [
        {title: 'Stock Code', field: 'code', editable: 'never'},
        {title: 'Description', field: 'name', editable: 'never'},
        {title: 'Quantity', field: 'quantity', editable: 'never'},
        {title: 'Goods to recieve', field: 'goodsRecieved', validate: rowData => isNaN(rowData.quantity) ? 'quantity should be a number ' : ''},
    ]
    

    useEffect(() => {
      params['data'].forEach((d)=> {
        if (d['goodsRecieved'] >= d['quantity']){
          d['quantity'] = 0
        } else {
          d['quantity'] = d['quantity'] - d['goodsRecieved']
        }
        d['goodsRecieved'] = 0
      })

        
    }, [])

    

    async function handleComplete() {
        setLoading(true)
        let cancel = false
        data.every(d => {
            if (d.goodsRecieved === null){
                cancel = `${d.code} must have a goods recieved value`
                alert(cancel)
                return false
            }
            return true 
        })
        if (cancel === false){
            try{
                const results = await axios.post(`/api/warehousing/goodsRecieved/`, {data: data})
                setResults(results['data']['message'])

            }catch(err){
                alert('error')
            }
            
        }
        setLoading(false)
    }

    useEffect(() => {
      setLoading(loading)
    }, [setLoading])
  
    return(
      <div>
        {loading ? <CircularProgress /> 
        :results ? (
            <Card sx={{ minWidth: 275 }}>
            <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Results:
                </Typography>
                {results.map((r)=> (
                    <div>
                        <Typography>
                            {r}
                        </Typography>
                    </div>
                   
                  ))}
            </CardContent>
            </Card>
        ):(
        <div>
          <StylesProvider generateClassName={generateClassName}>
            <MaterialTable
                icons = {tableIcons}
                title= {supplier}
                columns={columns}
                data={data}
                options = {{pageSize : data.length}}
                editable = {{
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
                      setDisabled(false)
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
                      setDisabled(false)
                    }),
                }}
              />
          </StylesProvider>
        <div style = {{marginTop: '4em'}} >
          <Button  disabled = {disabled} variant = 'contained' color="primary" onClick = {handleComplete}> Confirm Goods Recieved </Button >
        </div>
      </div>
      )}
      </div>
    
        )
  
  
}

export default Pol_GR;

