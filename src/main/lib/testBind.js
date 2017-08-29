const ipc = require('electron').ipcMain

const requestHelperAsync = require('./request').requestHelperAsync
const request = require('superagent')
const Promise = require('bluebird')
const startAppifiAsync = require('./server').startAppifiAsync

class TestBind {
  constructor(stationIP, cloudIP) {
    this.stationIP = stationIP
    this.stationToken = undefined
    this.cloudToken = undefined
    this.cloudIP = cloudIP
  }

  async run() {
    let user = await this.createFirstUserAsync('Alice', true)
    let token = await this.getTokenAsync(user.uuid, 'Alice').token
    console.log(user, token)
    
    // await startAppifiAsync(require('../testData/testData').test1)
  }

  async resetStation() {
    let res, url = this.stationIP + '/station/reset'
    res = await requestHelperAsync('GET', url, { params: props }, {})
    return true
  }

  async createFirstUserAsync(username, isAdmin) {
    let props = { username, password: username }
    if(isAdmin)　props.isAdmin = true
    let res, url = this.stationIP + '/users'
    console.log('开始创建 First User', url)
    this.sendMessage('开始创建First User')
    try{
      res = await requestHelperAsync('POST', url, { params: props }, {})
      this.sendMessage('创建用户成功')
      this.sendMessage(JSON.stringify(res.body))
      return res.body
    }catch(e){
      console.log('创建用户失败')
      this.sendMessage('创建用户失败')
      this.sendMessage(Object.assign({}, e))
      console.log(e.message)
      throw e
    }
  }

  getToken(useruuid, password,callback) {
    this.sendMessage('开始获取 token')
    let url = this.stationIP + '/token'
    request
      .get(url)
      .auth(useruuid, password)
      .end((err, res) => {
        this.sendMessage('token 获取成功')
        if(err) return callback(err)
        this.sendMessage(res.body)
        callback(null, res.body)
      })
  }
  
  getTokenAsync(useruuid, password) {
    return Promise.promisify(this.getToken).bind(this)(useruuid, password)
  }

  async createTicketAsync(type) {
    let url = this.stationIP + '/station/tickets'
    let props = {
      type
    }
    let res 
    try{
      res = await requestHelperAsync('POST', url, { params: props}, {})
      return res.body
    }catch(e){
      console.log('create Ticket error')
      throw e
    }
  }
  getWechatCode(callback) {
    global.mainWindow.webContents.send('getWechatCode', () => {})
    ipc.on('getWechatCode', code => {
      callback(code)
    })     
  }

  async getCloudTokenAsync(code) {
    let url = this.cloudIP + '/v1/token'
    let props = {
      code,
      platform: 'web'
    }
    let res
    try{
      res = await requestHelperAsync('GET', url, { query: props }, {})
      return res.body
    }catch(e){
      console.log('get CloudToken error')
      throw e
    }
  }

  async fillTicket(ticketId) {
    let url = this.cloudIP + '/v1/tickets/'+ ticketId +'/users'
    try{
      let res = await requestHelperAsync('POST', url, {}, {})
      return res.body
    }catch(e){
      console.log(e)
      throw e
    }
  }

  async getTicketAsync(ticketId) {
    let url = this.stationIP + '/station/tickets/' + ticketId
    try{
      let res = await requestHelperAsync('GET', url, {}, {})
      return res.body
    }catch(e){
      console.log(e)
      throw e
    }
  }

  async confirmTicket(ticketId, guid) {
    let url = this.stationIP + '/station/tickets/wechat/' + ticketId
    let props = {
      guid,
      state: true
    }
    try {
      let res = await requestHelperAsync('POST', url, {}, {})
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  async checkBind() {


  }


  sendMessage( message) {
    global.mainWindow.webContents.send('logMessage', message)
  }
}

module.exports = TestBind