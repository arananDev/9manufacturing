import React, {useEffect, useState} from 'react'
import StockToBuyPrompt from '../components/StockToBuyPrompt'
import { CircularProgress } from '@mui/material';


function StockToBuyScreen() {
    const [promptItems, setPromptItems] = useState([])
    const [loading,setLoading] = useState(true)

    async function parsePrompt(){
      setLoading(true)
      const stockItems = await JSON.parse(localStorage.getItem('missingStock'))
      const editedStockItems = []
      stockItems.forEach(stock => {
          editedStockItems.push({
              'code': stock['code'],
              'name': stock['name'],
              'stockUnit': stock['stockUnit'],
              'supplier (Code)': '',
              'ratioToStock': 1,
              'taxCode': 'zeroRated',
              'codeForSupplier': ''
              })
      })
      setPromptItems(editedStockItems)
      setLoading(false)
    }

    useEffect(() => {
        parsePrompt()
    }, [])


    return (
      <div> 
        {loading ? <CircularProgress size = {100} />
        : (<StockToBuyPrompt stockItems= {promptItems} />)}
      </div>
    )
}

export default StockToBuyScreen