import React, {useState, useEffect, forwardRef} from 'react';
import MaterialTable from 'material-table'
import { CircularProgress } from '@mui/material';
import { Alert } from '@mui/material';
import {useNavigate} from 'react-router'
import axios from 'axios'
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

const tableIcons = {
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
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

function PurchaseOrders({indicator}) {
    const navigate = useNavigate()
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
    const [purchaseOrder, setPurchaseOrder] = useState([])
    let title = `Purchase Orders (${indicator})`
    const options = {pageSize : 100}
    const columns = [
        {title: 'Order number', field: 'id',},
        {title: 'Supplier', field: 'supplier',},
        {title: 'Date Requested', field: 'dateRequested',},
        {title: 'Net Value', field: 'totalNet',},
        {title: 'VAT value', field: 'totalVat',},
    ]

    async function getPurchaseOrders(){
        setLoading(true)
        try{
            const {data} = await axios.get(`/api/purchaseOrders/`,  {params: {status: indicator}})
            setPurchaseOrder(data)
        } catch {
            setError(true)
        }
        setLoading(false)
    }
    useEffect(() => {
       getPurchaseOrders()
    }, [])

    

    return( 
        <div>
            {loading ? <CircularProgress size = {80} sx = {{ml: 50}} />
            : error ?  <Alert variant = {'error'} children = {error}/>
            :(<StylesProvider generateClassName={generateClassName}>
                <MaterialTable
                    options = {options}
                    icons = {tableIcons}
                    title= {title}
                    columns={columns}
                    data={purchaseOrder}
                    onRowClick = {(event, rowData) => {
                        navigate(`/purchaseOrder/${rowData.id}`)
                    }}
                />
              </StylesProvider>
              )}
      
        </div>
    )

}

export default PurchaseOrders;
