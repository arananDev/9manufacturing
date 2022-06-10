import React, { useState, forwardRef, useEffect } from "react";
import Button from '@mui/material/Button';
import MaterialTable from 'material-table'
import axios from 'axios'
import { CircularProgress } from '@mui/material';
import Alert from '@mui/material/Alert';
import { StylesProvider, createGenerateClassName } from '@material-ui/styles';


import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';

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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const generateClassName = createGenerateClassName({
  productionPrefix: 'mt',
  seed: 'mt'
});



function StockToBuyPrompt({stockItems}) {

  const [openDialog, setOpenDialog] = useState(true);
  const handleDialog = () => {
    setOpenDialog(!openDialog);
  };
  const options = {pageSize : 40}
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const [data, setData] = useState(stockItems)
  const title = `Input stock items to buy details here`
  const columns = [
      {title: 'Stock Code', field: 'code',editable : 'never'},
      {title: 'description', field: 'name', editable :'never'},
      {title: 'Stock Unit', field: 'stockUnit', editable :'never'},
      {title: 'Current price', field: 'price',},
      {title: 'Supplier Code', field: 'supplier', },
      {title: 'Conversion Rate', field: 'ratioToStock',},
      {title: 'tax code', field: 'taxCode', lookup: {'zeroRated': 'zeroRated', 'exempt': 'exempt', 'standardRate': 'standardRate'}},
      {title: 'Lead time (days)', field: 'leadTime',},
      {title: 'Purchase unit name', field: 'purchaseUnit',},
      {title: '(Optional) Code for Supplier', field: 'codeForSupplier',},
    ]
  
  
  
  
  
  
  async function handleSave(){
    setLoading(true)
    const editedData =  JSON.parse(JSON.stringify(data))
    editedData.forEach((point) => {
      delete point.tableData
      delete point.name
    })
    try {
      await axios.post(`/api/createStockToBuy/`, {data: editedData})
      localStorage.setItem('missingStock',JSON.stringify([]))
      setFinished(true)
    } catch(err) {
      alert(err.response.data.message)   
    }
    setLoading(false)

  }


  return(
    <div>
      <Dialog
        open={openDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleDialog}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Oh No: some stock details are missing!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            The following stock item(s) have missing details for the current supplier. Before continuing, please update the following stock details as accurately as possible 
            and click the save button below
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialog}>Add Stock details</Button>
        </DialogActions>
      </Dialog>
      {loading ? <CircularProgress />
      : finished ? <Alert severity = 'success'> Stock details were updated successfully</Alert>
      : (<div>
        <StylesProvider generateClassName={generateClassName}>
          <MaterialTable
          options = {{pageSize: data.length}}
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
                  setDisabled(false)
                  resolve();
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
          }}
        />
        </StylesProvider>
      <div >
        <Button  variant = 'contained' color="primary" disabled = {disabled} onClick = {handleSave}> Save </Button >
      </div>
      </div>)}
    </div>
      )



}




export default StockToBuyPrompt;
