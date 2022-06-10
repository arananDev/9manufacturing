import ShowEvent from '../components/ShowEvent'
import {useParams} from 'react-router-dom'
import Button from '@mui/material/Button';
import React, {useState, useEffect} from 'react'
import axios from 'axios'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { CircularProgress } from '@mui/material';
import { Alert } from '@mui/material';
import {useNavigate} from 'react-router-dom'



function EventScreen() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([])
    const [error, setError] = useState(false)
    let {id} = useParams()
    let navigate = useNavigate()

    async function fetchRows(){
        setLoading(true)
        try{
            const {data} = await axios.get(`/api/event/${id}`)
            setData(data)
        } catch {
            setError(true)
        }
        setLoading(false)


    }
    useEffect(()=> {
        fetchRows()
        
    }, [])

    function handleDialog(){
        setOpen(!open)
    }


    async function deleteEvent(){
        await axios.post('/api/deleteEvent/', {pk: id})
        alert('Event deleted ')
        navigate(`/`)
    }

    
    
    

    return (
        <div>
            {loading ? <CircularProgress size = {80} />
            : error ?  <Alert variant = {'error'} children = {error}/>
            : (<div>
                    <ShowEvent rows = {data} id = {id} />
                    <div >
                        <Button  variant = 'contained' color="error" onClick = {handleDialog}>Delete Event </Button>
                        <Dialog
                            open={open}
                            onClose={handleDialog}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <DialogTitle id="alert-dialog-title">
                            {"Are yoy sure you want to delete this?"}
                            </DialogTitle>
                            <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                This will delete the entire event and all the associated event lines from the database. Are you sure you want to do this?
                            </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                            <Button onClick={handleDialog}>Disconfirm</Button>
                            <Button onClick={deleteEvent} autoFocus>
                                Confirm
                            </Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                </div>)
        
        }
            
        </div>
        
    )
    }



export default EventScreen
