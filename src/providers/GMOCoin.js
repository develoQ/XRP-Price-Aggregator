import OracleProvider from './OracleProvider.js'
import debug from 'debug'

const log = debug('oracle:provider:gmocoin')

export default class GMOCoin extends OracleProvider {
  constructor() {
    super()
    log('Hi')
  }

  async get() {
    try {
      const data = await this.getJSON('https://api.coin.z.com/public/v1/ticker?symbol=XRP')
      const XrpJpy = Number(data?.data[0]?.last) || undefined
      log(`Calling, result: ${XrpJpy}`)
      return XrpJpy
    } catch (e) {
      log('Error', e.message)
      return undefined
    }
  }
}
