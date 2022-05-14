import { CustomerOrderControllerInterface, OrderItemCategories } from "../services/CustomerOrderFacade";
import { CustomerOrder } from "../entities/CustomerOrder";
import { CustomerOrderResult } from "../entities/CustomerOrderResult";
import { ValidationResult } from "../core/ValidationResult";
import { OrderItem } from "../entities/OrderItem";

export class CustomerOrderController implements CustomerOrderControllerInterface {
    fetchOrderItemCategories (store_url: string): OrderItemCategories {
        return [[]];
    }

    placeOrder (order: CustomerOrder): CustomerOrderResult {
        return {
            orderId: '123',
            externalOrderId: '1234',
        }
    }

    saveOrderItemCategories (categories: OrderItemCategories): void {
    }

    validateOrder (order: CustomerOrder): ValidationResult {
        return {
            isValid: true,
            message: '',
        }
    }

    validateOrderItem (orderItem: OrderItem): ValidationResult {
        return {
            isValid: true,
            message: '',
        }
    }

}
