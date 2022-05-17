import { CustomerOrder } from "../entities/CustomerOrder";
import { CustomerOrderResult } from "../entities/CustomerOrderResult";
import { ValidationResult } from "../core/ValidationResult";
import { OrderItem } from "../entities/OrderItem";

export type OrderItemCategories = Array<Array<string>>

// "incoming" order interface
export interface CustomerOrderControllerInterface {
    placeOrder(order: CustomerOrder, store_url: string): CustomerOrderResult
    validateOrder(order: CustomerOrder): ValidationResult
    // fetchOrderItemCategories(store_url: string): OrderItemCategories
    // saveOrderItemCategories(categories: OrderItemCategories): void
    validateOrderItem(orderItem: OrderItem): ValidationResult
}

// "outgoing" order interface
export interface CustomerOrderServiceInterface {
    accessStore(store_url: string): Promise<void>
    browseToItem(item_name: string, item_category?: string, item_subcategory?: string): Promise<void>
    addItemToCart(item_name: string, item_category?: string, item_subcategory?: string): Promise<void>
    checkout(order: CustomerOrder): Promise<void>
}

// order facade
export class CustomerOrderFacade {
    static placeOrder(order: CustomerOrder, store_url: string): CustomerOrderResult {
        let customerOrderResult: CustomerOrderResult = {
            orderId: '123',
            externalOrderId: '1234',
        }
        // access store
        // for each item in order
        //   browse to item
        //   add item to cart
        // checkout

        return customerOrderResult
    }

    static validateOrder(order: CustomerOrder): ValidationResult {
        let validationResult: ValidationResult = {
            isValid: true,
            message: null,
        }

        // for each item in order
        //   validateOrderItem
        //   (if invalid, invalidate all then exit loop)

        return validationResult
    }

    static validateOrderItem(orderItem: OrderItem): ValidationResult {
        let validationResult: ValidationResult = {
            isValid: true,
            message: null,
        }

        //   check valid category
        //   check valid subcategory
        //   check valid name
        //   (if invalid, invalidate)

        return validationResult
    }
}

// TODO: use this facade to tie the controller to the Puppeteer service
