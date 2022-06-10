import React, { useState, forwardRef, useEffect } from "react";
import MaterialTable from 'material-table'
import { Button } from "@material-ui/core";
import axios from 'axios'
import { LinearProgress } from '@mui/material';
import { StylesProvider, createGenerateClassName } from '@material-ui/styles';
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


function ToRemove({rows}) {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(rows)
    const navigate = useNavigate()


    const columns = [
        {title: 'Event ID', field: 'id', editable: 'never'},
        {title: 'Company', field: 'title', editable: 'never'},
        {title: 'Date', field: 'date', editable: 'never'},
    ]

    async function deleteEvents(){
        setLoading(true)
        try{
            const checkedData = []
            data.forEach(d => {
                if (d['tableData']['checked'] === true ){
                    checkedData.push(d.id)
                }
            })
            await axios.post(`/api/removeBySalesOrder/`, {data: checkedData})
            alert('Events have been deleted and quantity has been reduced')
            navigate('/')
        }catch(err){
            alert(err['response']['data']['message'])
        }
        setLoading(false)
    }




    return (
        <div>
            {loading ? <LinearProgress />
            : (
                <div>
                    <StylesProvider generateClassName={generateClassName}>
                    <MaterialTable
                        icons = {tableIcons}
                        title= {'Events to remove'}
                        columns={columns}
                        data={data}
                        options = {{
                            pageSize: data.length,
                            selection: true
                        }}
                        />
                    </StylesProvider>
                    <br/>
                    <Button onClick = {deleteEvents}> Delete Selected Events and Reduce Inventory</Button>
                </div>
            )}
            
        </div>

    )
}

export default ToRemove

