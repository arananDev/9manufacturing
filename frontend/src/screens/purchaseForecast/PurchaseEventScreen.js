import {useParams} from 'react-router-dom'
import Button from '@mui/material/Button';
import React, {useState, useEffect, forwardRef} from 'react'
import { CircularProgress } from '@mui/material';
import { Alert } from '@mui/material';
import {useNavigate} from 'react-router-dom'
import MaterialTable from 'material-table'
import axios from 'axios'

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
  

function PurchaseEvent() {
    let {id} = useParams()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([])
    const [saved, setSaved] = useState(false)
    const title = ` Purchase Event ${id}`
    const columns = [
        {title: 'Code', field: 'code', editable: 'never'},
        {title: 'Description', field: 'description', editable: 'never'},
        {title: 'Stock Unit', field: 'stock unit', editable: 'never'},
        {title: 'Quantity Demanded', field: 'quantity demanded', editable: 'never'},
        {title: 'Quantity In Stock', field: 'quantity in stock', editable: 'never'},
        {title: 'Quantity from Unfufilled Purchases', field: 'quantity from unfufilled purchases', editable: 'never'},
        {title: 'Order Quantity', field: 'order quantity',
        headerStyle: {
            backgroundColor: 'red',
          },
           validate: rowData => isNaN(rowData['order quantity']) ? 'order quantity must be a number' 
        : rowData['order quantity'] < 0 ? 'order quantity cannot be less than zero' 
        : ''},

    ]


    let navigate = useNavigate()

    async function fetchRows(){
        setLoading(true)
        try{
            const {data} = await axios.get(`/api/purchaseEvent/${id}`)
            setData(data)
        } catch(error) {
            alert(error.response.data.message)

        }
        setLoading(false)


    }
    useEffect(()=> {
        fetchRows()
        
    }, [])

    async function handleSave(){
      setLoading(true)
      const newLines = []

      data.forEach(row => {
          newLines.push({ 'code': row['code'] , 'orderQuantity': row['order quantity'], 'initialQuantityDemanded': row['quantity demanded']})
      })

      try{
        await axios.post(`/api/updatePurchaseEvent/${id}`, {data: newLines})
        alert(`Purchase Event ${id} saved successfully!`)
        setSaved(true)
      }
                      
          
      catch(error) {
        alert(error['response']['data']['message'])
      }
      setLoading(false)
    }


    async function handleGeneratePO(){

      setLoading(true)
      let codes = ''
      data.forEach(d => {
          codes += d['code'] + ','
      })
      try {
          await axios.post('/api/autogen_PO/', {'data': data})
          alert('Purchase Orders have been generated!')
          navigate('/purchaseOrderList')
      } catch(e) {
          if (e.response.data.status ===  'nonExistant') {
              alert(e.response.data.message)                  
          }
          else {
              console.log(JSON.stringify(e.response.data.message))
              localStorage.setItem('missingStock',JSON.stringify(e.response.data.message))
              window.open('#/stockToBuyPrompt')
          }
      }
      setLoading(false)
    }

    
    
    

    return (
        <div>
        {loading ? <CircularProgress  size = {180} color = 'secondary' /> 
        : saved ? (
          <div>
            <Alert severity="info">Purchase event has been saved! Do you want to autogenerate Purchase orders?</Alert>
            <Button style = {{marginTop : '6em'}} variant = 'contained' color = 'info' onClick = {handleGeneratePO} > Generate Purchase Orders </Button>
          </div>
          )
        :(
        <div>
        <StylesProvider generateClassName={generateClassName}>
          <MaterialTable
              icons = {tableIcons}
              title= {title}
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
        <div style = {{marginTop: '4em'}} >
          <Button  variant = 'contained' color="secondary" onClick = {handleSave}> Save </Button >
        </div>
      </div>
      )}
      </div>
            
    )

    }



export default PurchaseEvent
