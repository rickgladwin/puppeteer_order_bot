export interface CustomerOrder {
    orderId: string,
    customerFirstName: string,
    customerLastName: string,
    customerAddress: string,
    customerCity: string,
    customerState: string,
    customerZip: string,
    deliveryNotes: string|null,
    paymentMethod: PaymentMethodEnum,
    paymentNotes: string,
    items: Array<Item>,
}

export interface Item {
    category: string,
    subCategory: string|null,
    itemName: string,
}

export enum PaymentMethodEnum {
    CASH = "Cash",
    BANK = "Bank",
}
