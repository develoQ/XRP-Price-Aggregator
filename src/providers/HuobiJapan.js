import OracleProvider from './OracleProvider.js'
import debug from 'debug'

const log = debug('oracle:provider:huobijapan')

export default class HuobiJapan extends OracleProvider {
  constructor() {
    super()
    log('Hi')
  }

  async get() {
    try {
      const data = await this.getJSON('https://api-cloud.huobi.co.jp/market/detail/merged?symbol=xrpjpy')
      const XrpJpy = Number(data?.tick.close) || undefined
      log(`Calling, result: ${XrpJpy}`)
      return XrpJpy
    } catch (e) {
      log('Error', e.message)
      return undefined
    }
  }
}
