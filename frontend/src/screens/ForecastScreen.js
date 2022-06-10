import DemandCalendar from '../components/DemandCalendar';
import React, {useEffect} from 'react'
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SaveIcon from '@mui/icons-material/Save';
import {useNavigate} from 'react-router-dom'


 

function ForecastScreen() {
    let navigate = useNavigate()
    useEffect(() => {
        const user = localStorage.getItem('user')
        if (user === null){
            navigate('/userLogin')
        }
        if (user === 'warehousing'){
            navigate('/warehousing/goodsRecieved')
        }

    }, [])
    
    const eventClick = () => {
        navigate(`/createEvents`)
    }

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
                    icon={<SaveIcon onClick = {eventClick} />}
                    tooltipTitle={'Upload Events'}
                />
            </SpeedDial>
            </Box>
            <Box >
                <DemandCalendar />
            </Box>
            
        </div>
    )
}


export default ForecastScreen
