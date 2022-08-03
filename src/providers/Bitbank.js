import OracleProvider from './OracleProvider.js'
import debug from 'debug'

const log = debug('oracle:provider:bitbank')

export default class Bitbank extends OracleProvider {
  constructor() {
    super()
    log('Hi')
  }

  async get() {
    try {
      const data = await this.getJSON('https://public.bitbank.cc/xrp_jpy/ticker')
      const XrpJpy = Number(data?.data.last) || undefined
      log(`Calling, result: ${XrpJpy}`)
      return XrpJpy
    } catch (e) {
      log('Error', e.message)
      return undefined
    }
  }
}
