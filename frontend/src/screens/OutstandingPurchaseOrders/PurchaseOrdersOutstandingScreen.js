import React from 'react'
import PurchaseOrders from '../../components/PurchaseOrders'


function PurchaseOrdersOutstandingScreen() {
  return (
    <div>
        <PurchaseOrders indicator = {'outstanding'}/>
    </div>
  )
}

export default PurchaseOrdersOutstandingScreen