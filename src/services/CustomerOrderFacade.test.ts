
describe('CustomerOrderFacade', () => {
    describe('placeOrder', () => {
        it.todo('submits a valid order')
        it.todo('confirms order submission')
    })
    describe('validateOrder', () => {
        it.todo('validates a valid order')
        it.todo('rejects an order containing an item with invalid category')
        it.todo('rejects an order containing an item with invalid subcategory')
        it.todo('rejects an order containing an item with invalid name')
    })
    describe('fetchOrderItemCategories', () => {
        it.todo('fetches order item categories and subcategories')
    })
    describe('saveOrderItemCategories', () => {
        it.todo('saves categories and subcategories in a persistence layer')
    })
    describe('validateOrderItem', () => {
        it.todo('validates a valid order item')
        it.todo('invalidates an order item with invalid category')
        it.todo('invalidates an order item with invalid subcategory')
        it.todo('invalidates an order item with invalid name')

    })
})
