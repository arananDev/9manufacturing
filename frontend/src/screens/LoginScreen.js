import React, {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import { CircularProgress } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const authorisation = {
    'purchasing': 'poPassword',
    'warehousing': 'wPassword',
    'purchasing2': 'Password',
}


function LoginScreen() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    let navigate = useNavigate()
    const user = localStorage.getItem('user')

    useEffect(() => {
        if (user !== null ){
            navigate('/')
        }
    })

    function submitHandler(){
        setLoading(true)
        if (authorisation[username] === password){
            localStorage.setItem('user', username)
            alert('login success!')
            navigate('/')
        }else{
            alert('ERROR: Please recheck login credintials')

        }
        setLoading(false)
    }

    function Copyright(props) {
        return (
          <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://mui.com/">
              9Manufacturing
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        );
      }
      
    const theme = createTheme();
      
      
      
    return (
        <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
            sx={{
                marginTop: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
            >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
                Sign in
            </Typography>
            <Box component="form" onSubmit={submitHandler} noValidate sx={{ mt: 1 }}>
                <TextField
                margin="normal"
                required
                fullWidth
                label="username"
                value={username}
                onChange={ (event) => {setUsername(event.target.value)}}
                sx={{ width: 400 }}
                InputLabelProps={{
                shrink: true,
                }}
                autoFocus
                />
                <TextField
                margin="normal"
                required
                fullWidth
                type = 'password'
                label = 'password'
                name="password"
                value={password}
                onChange={ (event) => {setPassword(event.target.value)}}
                sx={{ width: 400 }}
                InputLabelProps={{
                shrink: true,
                }}
                />
                <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                >
                Sign In
                </Button>
            </Box>
            </Box>
            <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>
        </ThemeProvider>
    );
    }
  
  


export default LoginScreen