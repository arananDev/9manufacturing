import React from 'react'
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import BalanceIcon from '@mui/icons-material/Balance';
import {useNavigate} from 'react-router-dom'
import PurchaseDemandCalendar from '../../components/PurchaseDemandCalendar';
import MergeIcon from '@mui/icons-material/Merge';


function PurchaseForecastScreen() {

    const navigate = useNavigate()
    

  return (
    <div>
            <Box sx={{ height: 100, transform: 'translateZ(0px)', flexGrow: 1 }}>
            <SpeedDial
                ariaLabel="SpeedDial basic example"
                sx={{ position: 'absolute'}}
                icon={<SpeedDialIcon />}
                direction = 'right'
                FabProps={{
                    sx: {
                      bgcolor: 'secondary.main',
                      '&:hover': {
                        bgcolor: 'secondary.main',
                      }
                    }
                  }}
            >
                <SpeedDialAction
                    icon={<BalanceIcon onClick = {() => navigate("/generatePurchaseDemand")} />}
                    tooltipTitle={'Generate Purchase Demand'}
                />
                <SpeedDialAction
                    icon={<MergeIcon onClick = {()=> {navigate("/mergePurchaseEvents")}} />}
                    tooltipTitle={'Merge Purchase Events'}
                />
            </SpeedDial>
            </Box>
            <Box >
                <PurchaseDemandCalendar />
            </Box>
            
        </div>
  )
}

export default PurchaseForecastScreen