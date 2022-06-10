import React, {useState} from 'react';
import axios from 'axios'
import { Alert } from '@mui/material';
import { CircularProgress } from '@mui/material';

function StockTakeScreen() {
   
    const [selectedFile, setSelectedFile] = useState();
	const [isFilePicked, setIsFilePicked] = useState(false);
	const [variant, setVariant] = useState('info');
	const [children, setChildren] = useState('Please upload stock take file');
    const [loading, setLoading] = useState(false)

    function changeHandler(event){
        event.preventDefault()
        setSelectedFile(event.target.files[0])
        setIsFilePicked(true)
    }

    function handleSubmission(){
        setLoading(true)
        let formData = new FormData();
		formData.append("file", selectedFile);
        axios.post('/api/stockTake/', formData, {
        }).then( (message) => {
            setChildren(message.data.status)
            setVariant('success')
            setLoading(false)

        }).catch((error) => {
            setChildren(error.response.data.message)
            setVariant('error')
            setLoading(false)

        })
        setIsFilePicked(false)
        }


    return(
        <div>
            <input type = 'file' name = 'createStockTake' onChange = {changeHandler} />
            <div>
                { isFilePicked? (<button onClick = {handleSubmission} > Upload stock take file</button>) : <button disabled > Upload stock Take file</button> }

            </div>
            <div>
                {loading ? <CircularProgress/> 
                :(<Alert severity = {variant} children = {children} />)
                }
                
            </div>
        </div>
    )
}

export default StockTakeScreen;
