import { parsePayload } from "./ImportCustomerOrderPayload";

describe('importCustomerOrders', () => {
    it.todo('returns an array of CustomerOrders')
    describe('rejects invalid inputs', () => {
        it.todo('rejects invalid order data')
        it.todo('rejects an invalid order data source')
    })
})

describe('parsePayload', () => {
    it('parses a customer order payload from a json file', async () => {
        const payload_filename: string = 'payload_test.json'

        const parsedPayload = await parsePayload(payload_filename)

        expect(parsedPayload).toMatchObject(payload_test_json)
    })
    it.todo('rejects an invalid payload source')
})

// private
const payload_test_json = [
    {
        "orderId": "ord_123",
        "customerFirstName": "Jeffrey",
        "customerLastName": "Martinez",
        "customerAddress": "887 Cedar Lane",
        "customerCity": "Cambridge",
        "customerState": "MA",
        "customerZip": "02141",
        "deliveryNotes": null,
        "paymentMethod": "Cash",
        "paymentNotes": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do e iusmod tempor incididunt ut labore et dolore magna aliqua.",
        "items": [
            {
                "category": "Phones & PDAs",
                "subCategory": null,
                "itemName": "iPhone"
            },
            {
                "category": "Tablets",
                "subCategory": null,
                "itemName": "Samsung Galaxy Tab 10.1"
            },
            {
                "category": "Components",
                "subCategory": "Monitors",
                "itemName": "Samsung SyncMaster 941BW"
            }
        ]
    },
    {
        "orderId": "ord_456",
        "customerFirstName": "Patricia",
        "customerLastName": "Caruthers",
        "customerAddress": "901 Ashton Lane",
        "customerCity": "Austin",
        "customerState": "TX",
        "customerZip": "78749",
        "deliveryNotes": "Lorem ipsum dolor sit amet",
        "paymentMethod": "Bank",
        "paymentNotes": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do e iusmod tempor incididunt ut labore et dolore magna aliqua.",
        "items": [
            {
                "category": "Cameras",
                "subCategory": null,
                "itemName": "Canon EOS 5D"
            },
            {
                "category": "Cameras",
                "subCategory": null,
                "itemName": "Nikon D300"
            }
        ]
    }
]
