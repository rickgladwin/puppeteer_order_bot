import { CustomerOrder } from '../entities/CustomerOrder'
import { config } from '../../startup'
import { readFileSync } from 'fs'

export const importCustomerOrders = async (payload_filename: string): Promise<Array<CustomerOrder>> => {
    let customerOrders: Array<CustomerOrder> = []
    try {
        customerOrders = await parsePayload(payload_filename)
    } catch (e: any) {
        throw new Error(`could not import customer orders: ${e.message}`)
    }
    return customerOrders
}

export const parsePayload = async (payload_filename: string): Promise<any> => {
    const payloads_filepath = config.app_root_dir + config.payloads.payload_filepath
    let parsedPayload: any
    try {
        parsedPayload = await JSON.parse(readFileSync(payloads_filepath + '/' + payload_filename).toString())
    } catch (e: any) {
        throw new Error(`could not parse payload: ${e.message}`)
    }

    return parsedPayload
}
