import debug from 'debug'
import stats from 'stats-analysis'

import Bitstamp from './providers/Bitstamp.js'
import Kraken from './providers/Kraken.js'
import Cryptowatch from './providers/Cryptowatch.js'
import Bitfinex from './providers/Bitfinex.js'
import Hitbtc from './providers/Hitbtc.js'
import Binance from './providers/Binance.js'

import Bitbank from './providers/Bitbank.js'
import GMOCoin from './providers/GMOCoin.js'
import DeCurret from './providers/DeCurret.js'
import HuobiJapan from './providers/HuobiJapan.js'

const Providers = {
  class: {
    usd: {Cryptowatch, Bitstamp, Kraken, Bitfinex, Hitbtc, Binance},
    jpy: {Bitbank, GMOCoin, DeCurret, HuobiJapan}
  },
  instances: {}
}

const log = debug('oracle:main')

const run = async (currency = 'usd') => {
  Object.assign(
    Providers.instances,
    Object.keys(Providers.class[currency]).reduce((a, providerKey) => {
      Object.assign(a, {
        [providerKey]: new Providers.class[currency][providerKey]()
      })
      return a
    }, {})
  )

  const results = await Promise.all(
    Object.keys(Providers.instances).map(async (instanceName) => {
      log(`  - Getting from ${instanceName}`)
      const data = await Providers.instances[instanceName].getMultiple(
        Number(process.env.ORACLE_PROVIDER_CALL_COUNT || 3),
        Number(process.env.ORACLE_PROVIDER_CALL_DELAY_SEC || 2) * 1000
      )
      log(`     - Got data from ${instanceName}`)
      return data
    })
  )

  const rawResultsNamed = results.reduce((a, b, i) => {
    Object.assign(a, {
      [Object.keys(Providers.instances)[i]]: b
    })
    return a
  }, {})

  const rawResults = results.reduce((a, b) => a.concat(b), [])
  const rawMedian = stats.median(rawResults)
  const rawStdev = stats.stdev(rawResults)

  const raw = {
    rawResultsNamed,
    rawResults,
    rawMedian,
    rawStdev
  }

  log(raw)

  const filteredResults = rawResults.filter((r) => Math.abs(r - rawMedian) < rawStdev)
  const filteredMedian = stats.median(filteredResults)
  const filteredMean = stats.mean(filteredResults)

  const filtered = {
    filteredResults,
    filteredMedian,
    filteredMean
  }

  log(filtered)

  return {
    ...raw,
    ...filtered
  }
}

export default run
