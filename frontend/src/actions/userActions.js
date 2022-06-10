import {USER_LOGIN_REQUEST,USER_LOGIN_SUCCESS,USER_LOGIN_FAIL,USER_LOGOUT} from '../constants/userConstants'
import axios from 'axios'

export const login = (user, password) => async(dispatch) => {
    try{
        dispatch({
            type: USER_LOGIN_REQUEST
        })

        const config = {
            headers: {
                'Content-type': 'application/json'
            }
        }

        const {data} = await axios.post(
            'api/users/login/',
            {'username': user, 'password': password},
            config
            )
        
        dispatch({
            type: USER_LOGIN_SUCCESS,
            payload: data
            })
        
        localStorage.setItem('user', JSON.stringify(data))

    }catch(error){
        dispatch({
            type: 'FAIL', payload : error.response && error.response.data.message
            ? error.response.data.message
            : error.meesage,
        })
    }
}