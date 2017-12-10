const htmlSnapshots = require('html-snapshots')
var pages = {
  'http://www.feixiaohao.com/currencies/bitcoin/': '#baseInfo',
}

htmlSnapshots.run({
    input: 'array',
    source: Object.keys(pages),
    outputDir: './snapshots',
    outputDirClean: true,
    selector: pages
  })
  .then(function(completed) {
    console.log(completed)
    // completed is an array of full file paths to the completed snapshots.
  })
  .catch(function(error) {
    console.log(error)
    // error is an Error instance.
    // error.completed is an array of snapshot file paths that were completed.
    // error.notCompleted is an array of file paths that did NOT complete.
  })
