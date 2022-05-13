// bootstrap/initialize the app
import { parse } from 'yaml'
import { readFileSync } from 'fs'
import 'dotenv/config'

// config
// console.log(`process.env:`, process.env);
const environment = process.env.NODE_ENV
console.log(`environment: ${environment}`);
const configFile = readFileSync('config/' + environment + '.yaml', 'utf8')
console.log(`configFile:`, configFile);
export let config = parse(configFile)
// const app_root_dir = process.cwd()
config.app_root_dir = process.cwd()
console.log(`&& config:`, config);

// export config
