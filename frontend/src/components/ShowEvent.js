import React, { useState, forwardRef } from "react";
import MaterialTable from 'material-table'
import { StylesProvider, createGenerateClassName } from '@material-ui/styles';
import Button from '@mui/material/Button';
import { CircularProgress } from '@mui/material';
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


function ShowEvent({rows, id}) {
  console.log(rows)
  const [data, setData] = useState(rows)
  const [disabled, setDisabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const title = `Batch ${id}`
  const columns = [{title: 'Code', field: 'mealCode',},{title: 'Meal', field: 'description',},{title: 'Quantity', field: 'quantity',}]

  async function handleSave(){
    setLoading(true)
    const newLines = []

    data.forEach(row => {
        newLines.push({ 'mealCode': row['mealCode'] , 'quantity': row['quantity']})
    })

    try{
      await axios.post(`/api/updateEvent/${id}`, {data: newLines})
      alert(`Event ${id} saved successfully!`)
    }
                    
        
    catch(error) {
      alert(error['response']['data']['message'])
    }
    setDisabled(true)
    setLoading(false)

  }
  


  return(
    <div>
      {loading ? <CircularProgress size = {80} />
      : (<div>
        <StylesProvider generateClassName={generateClassName}>
        <MaterialTable
            options = {{pageSize: data.length+5}}
            icons = {tableIcons}
            title= {title}
            columns={columns}
            data={data}
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
              onRowDelete: oldData =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    const dataDelete = [...data];
                    const index = oldData.tableData.id;
                    dataDelete.splice(index, 1);
                    setData([...dataDelete]);
                    
                    resolve()
                  }, 1000)
                setDisabled(false)

                }),

            }}
          />
          </StylesProvider>
          <div style = {{marginTop: '4em'}} >
            <Button disabled = {disabled} variant = 'contained' color="secondary" onClick = {handleSave}> Save </Button >
          </div>
          </div>
          )
}
        
    </div>
  
      )



}

export default ShowEvent;





