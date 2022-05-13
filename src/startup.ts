// bootstrap/initialize the app
import { parse } from 'yaml'
import { readFileSync } from 'fs'

// config
const environment = process.env.NODE_ENV
const configFile = readFileSync(environment + '.yaml', 'utf8')
export const config = parse(configFile)

