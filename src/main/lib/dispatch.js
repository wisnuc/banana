const { ipcMain } = require('electron')

const TestBind = require('./testBind')
let chalk = require('chalk')

ipcMain.on('setIp', 　(event, stationIP, cloudIP) => {
  global.stationIP = stationIP
  global.cloudIP = cloudIP
  console.log(chalk.magenta('set station ip success : ' + stationIP), chalk.green('Cloud IP: ' + cloudIP))
  event.returnValue = true
})

ipcMain.on('startTest', async () => {
  console.log(chalk.magenta('start test'))
  await new TestBind(global.stationIP, global.cloudIP).run()
})