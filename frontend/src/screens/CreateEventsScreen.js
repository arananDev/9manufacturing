import React, {useState} from 'react';
import axios from 'axios'
import { Alert } from '@mui/material';
import { CircularProgress } from '@mui/material';

function CreateEventsScreen() {
   
    const [selectedFile, setSelectedFile] = useState();
	const [isFilePicked, setIsFilePicked] = useState(false);
	const [variant, setVariant] = useState('info');
	const [children, setChildren] = useState('Please upload events file');
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
        axios.post('/api/upload_event/', formData, {
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
            <input type = 'file' name = 'createEventsFile' onChange = {changeHandler} />
            <div>
                { isFilePicked? (<button onClick = {handleSubmission} > Upload events</button>) : <button disabled > Upload events</button> }

            </div>
            <div>
                {loading ? <CircularProgress/> 
                :(<Alert severity = {variant} children = {children} />)
                }
                
            </div>
        </div>
    )
}

export default CreateEventsScreen;
