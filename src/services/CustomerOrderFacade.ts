import { CustomerOrder } from "../entities/CustomerOrder";
import { CustomerOrderResult } from "../entities/CustomerOrderResult";
import { ValidationResult } from "../core/ValidationResult";
import { OrderItem } from "../entities/OrderItem";

export type OrderItemCategories = Array<Array<string>>

export interface CustomerOrderController {
    placeOrder(order: CustomerOrder): CustomerOrderResult
    validateOrder(order: CustomerOrder): ValidationResult
    fetchOrderItemCategories(store_url: string): OrderItemCategories
    saveOrderItemCategories(categories: OrderItemCategories): void
    validateOrderItem(orderItem: OrderItem): ValidationResult
}

// TODO: use this facade to tie the controller to the Puppeteer service
