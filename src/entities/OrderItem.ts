export interface OrderItem {
    category: string,
    subCategory: string|null,
    itemOptions?: Array<ItemOption>,
    itemName: string,
}

export type ItemOption = {
    id: string,
    value: string,
}
