import debug from 'debug'
import aggregator from './aggregator.js'
import Conn from 'rippled-ws-client'
import Sign from 'rippled-ws-client-sign'
import dotenv from 'dotenv'

const log = debug('oracle:persist')

const timeoutSec = process.env.TIMEOUT_SECONDS || 55
const timeout = setTimeout(() => {
  log(`Error, killed by timeout after ${timeoutSec} seconds`)
  process.exit(1)
}, timeoutSec * 1000)

const run = (async () => {
  dotenv.config()
  log(`START`)
  const Connection = new Conn(process.env.ENDPOINT)

  log(`START (timeout at ${timeoutSec}), GO GET DATA!`)

  const data = await aggregator(process.env.CURRENCY)
  log('GOT DATA')
  log({data})

  await Connection

  const Memos = Object.keys(data.rawResultsNamed).map((k) => {
    return {
      Memo: {
        MemoData: Buffer.from(data.rawResultsNamed[k].map((_v) => String(_v)).join(';'), 'utf-8')
          .toString('hex')
          .toUpperCase(),
        MemoFormat: Buffer.from('text/csv', 'utf-8').toString('hex').toUpperCase(),
        MemoType: Buffer.from('rates:' + k, 'utf-8')
          .toString('hex')
          .toUpperCase()
      }
    }
  })

  const Tx = {
    TransactionType: 'TrustSet',
    Account: process.env.XRPL_SOURCE_ACCOUNT,
    Fee: '10',
    Flags: 131072,
    LimitAmount: {
      currency: process.env.CURRENCY.toUpperCase(),
      issuer: process.env.XRPL_DESTINATION_ACCOUNT,
      value: String(Math.round(parseFloat(data.filteredMedian)*100000) / 100000)
    },
    Memos
  }

  log('SIGN & SUBMIT')
  try {
    const Signed = await new Sign(Object.assign({}, Tx), process.env.XRPL_SOURCE_ACCOUNT_SECRET, await Connection)
    log({Signed})
  } catch (e) {
    log(`Error signing / submitting: ${e.message}`)
  }

  if (typeof process.env.ENDPOINT_TESTNET !== 'undefined') {
    log('SIGN & SUBMIT TESTNET')
    const ConnectionTestnet = await new Conn(process.env.ENDPOINT_TESTNET)
    log('ConnectionTestnet')
    try {
      const SignedTestnet = await new Sign(
        Object.assign({}, Tx),
        process.env.XRPL_SOURCE_ACCOUNT_SECRET,
        await ConnectionTestnet
      )
      log({SignedTestnet})
    } catch (e) {
      log(`Error signing / submitting @ Testnet: ${e.message}`)
    }
    ;(await ConnectionTestnet).close()
  }

  log('WRAP UP')
  ;(await Connection).close()
  clearTimeout(timeout)
})


;(async () => {
  run().then(() => {})
})()

export const handler = async ()=> {
  await run()
}
