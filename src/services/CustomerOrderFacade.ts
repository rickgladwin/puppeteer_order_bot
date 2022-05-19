import { CustomerOrder } from "../entities/CustomerOrder";
import { CustomerOrderResult } from "../entities/CustomerOrderResult";
import { ValidationResult } from "../core/ValidationResult";
import { OrderItem } from "../entities/OrderItem";
import { openCartConfig, PuppeteerService } from "./PuppeteerService";
import openCartItemCategories from "../data/OpenCartItemCategories.json"

export type OrderItemCategories = Array<Array<string>>

// "incoming" order interface
export interface CustomerOrderControllerInterface {
    validateOrder(order: CustomerOrder): ValidationResult
    validateOrderItem(orderItem: OrderItem): ValidationResult
    placeOrder(order: CustomerOrder): Promise<CustomerOrderResult>
    // fetchOrderItemCategories(store_url: string): OrderItemCategories
    // saveOrderItemCategories(categories: OrderItemCategories): void
}

// "outgoing" order interface
export interface CustomerOrderServiceInterface {
    accessStore(store_url: string): Promise<void>
    browseToItem(item_name: string, item_category?: string, item_subcategory?: string): Promise<void>
    addItemToCart(item_name: string, item_category?: string, item_subcategory?: string): Promise<void>
    checkout(order: CustomerOrder): Promise<void>
    fetchLatestOrderId(): Promise<string>
}

// order facade
export class CustomerOrderFacade {
    static async placeOrder (order: CustomerOrder): Promise<CustomerOrderResult> {
        let customerOrderResult: CustomerOrderResult
        const customerOrderService = await new PuppeteerService().init()
        await customerOrderService.accessStore(openCartConfig.url)

        for (const item of order.items) {
            const itemName = item.itemName
            const itemCategory = item.category
            const itemSubCategory = item.subCategory ?? undefined
            const itemOptions = item.itemOptions
            await customerOrderService.addItemToCart(itemName, itemCategory, itemSubCategory, itemOptions)
        }

        await customerOrderService.checkout(order)

        const latestOrderId = await customerOrderService.fetchLatestOrderId()
        customerOrderResult = {
            orderId: order.orderId,
            externalOrderId: latestOrderId,
        }

        return customerOrderResult
    }

    static validateOrder(order: CustomerOrder): ValidationResult {
        let orderValidationResult: ValidationResult = {
            isValid: true,
            message: null,
        }

        for (const item of order.items) {
            const itemValidationResult = CustomerOrderFacade.validateOrderItem(item)
            if (!itemValidationResult.isValid) {
                orderValidationResult.isValid = false
                orderValidationResult.message = `item with itemName ${item.itemName} in order is not valid: ${itemValidationResult.message}`
                break
            }
        }

        return orderValidationResult
    }

    static validateOrderItem(orderItem: OrderItem): ValidationResult {
        let validationResult: ValidationResult = {
            isValid: true,
            message: null,
        }

        let categoryIsValid: boolean = false
        let subCategoryIsValid: boolean = true
        let itemNameIsValid: boolean = true

        //   check valid category
        for (const categorySet of openCartItemCategories) {
            if (categorySet.category === orderItem.category) {
                categoryIsValid = true
            }
        }
        if (!categoryIsValid) {
            validationResult.isValid = false
            validationResult.message = `category for order item with name ${orderItem.itemName} is invalid`
        }

        //   check valid subcategory
        if (categoryIsValid && !!orderItem.subCategory) {
            const categorySubCategories = openCartItemCategories
                .filter(element => element.category === orderItem.category)
                .map(element => element.subcategories)[0]

            if (categorySubCategories.length === 0 || !categorySubCategories.includes(orderItem.subCategory)) {
                validationResult.isValid = false
                validationResult.message = `subcategory for order item with name ${orderItem.itemName} is invalid`
            }
        }

        //   check valid name
        //   (item names are not being pulled from the online store, so this passes automatically)

        return validationResult
    }
}
