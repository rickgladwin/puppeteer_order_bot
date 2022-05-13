import { CustomerOrder } from '../entities/CustomerOrder'
import { config } from '../../startup'
import { readFileSync } from 'fs'

export const importCustomerOrders = (payload_file: string): Array<CustomerOrder> => {
    let customerOrders: Array<CustomerOrder> = []
    return customerOrders
}

export const parsePayload = async (payload_file: string): Promise<any> => {
    const payloads_filepath = config.app_root_dir + config.payloads.payload_filepath
    let parsedPayload: any
    try {
        parsedPayload = await JSON.parse(readFileSync(payloads_filepath + '/' + payload_file).toString())
    } catch (e: any) {
        throw new Error(`could not parse payload: ${e.message}`)
    }
    return parsedPayload
}
