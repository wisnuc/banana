const spawn = require('child_process').spawn
const fs = require('fs')
const path = require('path')

const Promise = require('bluebird')
const mkdirpAsync = Promise.promisify(require('mkdirp'))
const rimrafAsync = Promise.promisify(require('rimraf'))

let startAppifiAsync = async (testData) => {
  let fpath = path.join(process.cwd(), 'temptest/')
  await rimrafAsync(fpath)
  await mkdirpAsync(fpath)
  let spath = path.join(fpath, 'station')
  await mkdirpAsync(spath)
  fs.writeFileSync(path.join(spath, 'pb.pub'), testData.pbkey)
  fs.writeFileSync(path.join(spath, 'pv.pem'), testData.pvkey)
  fs.writeFileSync(path.join(spath, 'station.json'), JSON.stringify(testData.station, null, ' '))
  let appifiPath = path.join(process.cwd(), 'appifi/src/app.js')
  let child = spawn('node',[ appifiPath], {
    cwd: process.cwd(),
    env: {
      NODE_ENV: 'StationTest',
      NODE_PATH: fpath
    }
  })
  child.stdout.on('data', data => {
    console.log(data.toString())
  })
  child.stderr.on('data', data => {
    console.log(data.toString())
  })
  return child
}

module.exports.startAppifiAsync = startAppifiAsync