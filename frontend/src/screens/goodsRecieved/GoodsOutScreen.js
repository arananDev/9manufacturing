import React, {useState} from 'react';
import axios from 'axios'
import { Alert } from '@mui/material';
import { CircularProgress } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

function GoodsOutScreen() {
   
    const [selectedFile, setSelectedFile] = useState();
	const [isFilePicked, setIsFilePicked] = useState(false);
    const [results, setResults] = useState(false)
	const [variant, setVariant] = useState('info');
	const [children, setChildren] = useState('Please upload goods out file');
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
        axios.post('/api/warehousing/goodsOut/', formData, {
        }).then( (message) => {
            setChildren(message.data.status)
            setVariant('success')
            setResults(message.data.payload)
        }).catch((error) => {
            alert(error.response.data.message)
            window.location.reload()
        })
        setLoading(false)
        }


    return(
        <div>
            <input type = 'file' name = 'createEventsFile' onChange = {changeHandler} />
            <div>
                { loading ? <CircularProgress/> :
                results ?(
                    <Card sx={{ minWidth: 275 }}>
                    <CardContent>
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                        Results:
                        </Typography>
                        {results.map((r)=> (
                            <div>
                                <Typography>
                                    {r}
                                </Typography>
                            </div>
                        
                        ))}
                    </CardContent>
                    </Card>
                ) :
                isFilePicked? (<button onClick = {handleSubmission} > Upload Goods Out file</button>) :
                <button disabled > Upload Goods out file</button> }

            </div>
            <div>
                <Alert severity = {variant} children = {children} />
                
            </div>
        </div>
    )
}

export default GoodsOutScreen;
