import OracleProvider from './OracleProvider.js'
import debug from 'debug'

const log = debug('oracle:provider:decurret')

export default class Decurret extends OracleProvider {
  constructor() {
    super()
    log('Hi')
  }

  async get() {
    try {
      const data = await this.getJSON('https://api-trade.decurret.com/api/v1/ticker?symbolId=8')
      const XrpJpy = Number(data?.last) || undefined
      log(`Calling, result: ${XrpJpy}`)
      return XrpJpy
    } catch (e) {
      log('Error', e.message)
      return undefined
    }
  }
}
