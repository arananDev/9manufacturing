import React, {useState} from 'react'
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';


function TestScreen() {
    const [count, setCount] = useState(0)

  return (
    <div  style={{ backgroundColor: "white" }}>
        <Card sx={{ maxWidth: 700 }} align = 'center'>
        
        <CardContent>
            <Typography align = 'center' gutterBottom variant="h1" component="div">
            {count}
            </Typography>
            <Typography variant="body2"  align = 'center' color="text.secondary">
                Please use the buttons below to change the count
            </Typography>
        </CardContent>
        <CardActions>
            <Button color = 'primary' variant = 'contained' style = {{marginLeft : '10em', marginRight: '10em'}}
            onClick={() => {
                setCount(count + 1)
            }}
            >
                Add one
            </Button>
            <br/>
            <Button color = 'error' variant = 'contained' align = 'right' onClick={() => {
                setCount(count - 1)
            }}>Reduce by one</Button>
        </CardActions>
        </Card>
       

    </div>
  )
}

export default TestScreen