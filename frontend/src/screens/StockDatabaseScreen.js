import React from 'react'
import Button from '@mui/material/Button';

function StockDatabaseScreen() {
    function stockList(){
        window.open('/stockList')
    }

    function purchaseList(){
        window.open('/stockPurchaseList')
    }
  return (
    <div>
        <Button variant="outlined" onClick = {stockList}>Stock List</Button>
        <br/>
        <Button variant="outlined" onClick = {purchaseList}> Stock Purchased List</Button>
        <br/>
        <Button variant="outlined" onClick = {() => {window.open('/stockTake')}}> Stock Take</Button>
    </div>

  )
}

export default StockDatabaseScreen