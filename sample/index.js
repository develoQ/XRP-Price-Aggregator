import oracle from '../src/aggregator.js'
;(async () => {
  setInterval(async () => {
    const data = await oracle('jpy')
    console.log(data.rawResultsNamed)
  }, 60 * 1000)
})()
