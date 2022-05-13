import { CustomerOrder } from '../entities/CustomerOrder'
import { config } from '../../startup'
import { readFileSync } from 'fs'

export const importCustomerOrders = (payload_file: string): Array<CustomerOrder> => {
    let customerOrders: Array<CustomerOrder> = []
    return customerOrders
}

export const parsePayload = (payload_file: string): Object => {
    console.debug(`parsePayload called with`, {payload_file});
    process.stdout.write('asdf')
    return {fuck: 'fuck'};
    process.exit()
    const payloads_filepath = config.payloads.payload_filepath
    console.log(`payloads_filepath: ${payloads_filepath}`);
    const payload_json = JSON.parse(readFileSync(payloads_filepath + '/' + payload_file).toString())
    console.log(`payload_json:`, payload_json);
    return payload_json
}
