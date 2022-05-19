// main app file
import { CustomerOrderController } from "./controllers/CustomerOrderController";
import { CustomerOrder } from "./entities/CustomerOrder";
import { importCustomerOrders } from "./usecases/ImportCustomerOrderPayload";
import { CustomerOrderResult } from "./entities/CustomerOrderResult";

export const main = async (): Promise<void> => {

    const customerOrderController = new CustomerOrderController();
    const orders: Array<CustomerOrder> = await importCustomerOrders('payload_1.json')
    let orderResults: Array<CustomerOrderResult> = []

    for (const order of orders) {
        let orderResult: CustomerOrderResult
        try {
            orderResult = await customerOrderController.placeOrder(order)
        } catch (e: any) {
            console.error(`error placing order: ${e.message}`)
            process.exit(1)
        }
        console.log(`orderResult:`, orderResult);
        orderResults.push(orderResult)
    }

    console.log(`All orders placed. Order results:`)
    console.dir(orderResults, {depth: 2})
    return
}

// call main() if index module is called directly
if (require.main === module) {
    main()
        .then(r => {console.log(`done. ${r}`)})
        .then(r => {process.exit()})
}
