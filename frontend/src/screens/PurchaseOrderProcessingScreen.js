import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import {useNavigate} from 'react-router-dom'
import AddBoxIcon from '@mui/icons-material/AddBox';
import BalanceIcon from '@mui/icons-material/Balance';
import React, {useState, useEffect} from 'react'
import Box from '@mui/material/Box';
import PurchaseOrders from '../components/PurchaseOrders'
import Tab from '@mui/material/Tab';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel';
import { CircularProgress } from '@mui/material';
import axios from 'axios'
import { Button } from "@material-ui/core";
import { StylesProvider, createGenerateClassName } from '@material-ui/styles';

const generateClassName = createGenerateClassName({
    productionPrefix: 'mt',
    seed: 'mt'
  });

function PurchaseOrderProcessingScreen() {
    const [loading, setLoading] = useState(false)

    let navigate = useNavigate()

    async function mergeOrders(){
        setLoading(true)
        try{
            await axios.post('/api/mergePurchaseOrders/')
            alert('Purchase Orders (editing) have been merged!')
        }catch(err){
            alert(err['response']['data']['message'])
        }
        setLoading(false)   
        
    }

    async function deleteOrders(){
        setLoading(true)
        try{
            await axios.post('/api/clearPurchaseOrders/')
            alert('Purchase Orders (editing) have been deleted')
        }catch(err){
            alert(err['response']['data']['message'])
        }
        setLoading(false)   
        
    }
    const [page, setPage] = useState('edit');
    const pageChange = (event, newValue) => {
        setLoading(true)
        setPage(newValue);
        setLoading(false)
    }
    useEffect(() => {
        setLoading(loading)
    }, [setLoading])


    return (
        <div>
            <Box sx={{ height: 100, transform: 'translateZ(0px)', flexGrow: 1 }}>
            <SpeedDial
                ariaLabel="SpeedDial basic example"
                sx={{ position: 'absolute' }}
                icon={<SpeedDialIcon />}
                direction = 'right'
            >
                <SpeedDialAction
                    icon={<AddBoxIcon onClick = {()=> {navigate(`/createPO`)}} />}
                    tooltipTitle={'Create Purchase Order'}
                />
                <SpeedDialAction
                    icon={<BalanceIcon onClick = {()=> { navigate(`/trialKit`)}} />}
                    tooltipTitle={'Generate expected supply from trial kit'}
                />
            </SpeedDial>
            </Box>
            {loading ? <CircularProgress /> 
            :
            (
                <StylesProvider generateClassName={generateClassName}>
                    <Box sx={{ width: '100%', typography: 'body1' }}>
                        <Button variant = 'contained' color="primary" onClick = {mergeOrders}> Merge Purchase Orders (editing) with same suppliers</Button>
                        <br/>
                        <br/>
                        <Button variant = 'contained' color="error" onClick = {deleteOrders}> Clear out Purchase Orders (editing)</Button>
                        <TabContext value={page}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <TabList onChange={pageChange} aria-label="lab API tabs example">
                                    <Tab label="For Editng" value="edit" />
                                    <Tab label="Live" value="live" />
                                    <Tab label="Completed" value="completed" />
                                </TabList>
                            </Box>
                            <TabPanel value="edit"><PurchaseOrders indicator={'edit'} /> </TabPanel>
                            <TabPanel value="live"><PurchaseOrders indicator={'live'} /></TabPanel>
                            <TabPanel value="completed"><PurchaseOrders indicator={'completed'} /></TabPanel>
                        </TabContext>
                    </Box>
                </StylesProvider>
            )
            }
            
            
        </div>
    )
}

export default PurchaseOrderProcessingScreen;

