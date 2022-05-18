import {
    CustomerOrderControllerInterface,
    CustomerOrderFacade,
    OrderItemCategories
} from "../services/CustomerOrderFacade";
import { CustomerOrder } from "../entities/CustomerOrder";
import { CustomerOrderResult } from "../entities/CustomerOrderResult";
import { ValidationResult } from "../core/ValidationResult";
import { OrderItem } from "../entities/OrderItem";

export class CustomerOrderController implements CustomerOrderControllerInterface {
    validateOrder (order: CustomerOrder): ValidationResult {
        return CustomerOrderFacade.validateOrder(order)
    }

    validateOrderItem (orderItem: OrderItem): ValidationResult {
        return CustomerOrderFacade.validateOrderItem(orderItem)
    }

    async placeOrder (order: CustomerOrder): Promise<CustomerOrderResult> {
        return await CustomerOrderFacade.placeOrder(order)
    }

    fetchOrderItemCategories (store_url: string): OrderItemCategories {
        return [[]];
    }

    saveOrderItemCategories (categories: OrderItemCategories): void {
    }
}
