let ipc = require('electron').ipcRenderer

let submitClick = (stationip, cloudip) => {
  console.log(stationip, 　cloudip)
  let isSuccess = ipc.sendSync('setIp', stationip, cloudip)
  if (isSuccess) {
    document.getElementById('content').innerHTML = '<h1>success</h1><button onclick="startTest()">开始测试</button><div id="wechat_bind_container"></div>'
  }
}

let wxiframe = null

let WxLogin = (a) => {
  let c = 'default'
  a.self_redirect === !0 ? c = 'true' : a.self_redirect === !1 && (c = 'false')
  const d = document.createElement('iframe')
  wxiframe = d
  let e = `https://open.weixin.qq.com/connect/qrconnect?appid=${a.appid}&scope=${a.scope}&redirect_uri=${a.redirect_uri}&state=${a.state}&login_type=jssdk&self_redirect=${c}`
  e += a.style ? `&style=${a.style}` : ''
  e += a.href ? `&href=${a.href}` : ''
  d.src = e
  d.frameBorder = '0'
  d.allowTransparency = 'true'
  d.scrolling = 'no'
  d.width = '300px'
  d.height = '400px'
}


let startTest = () => {
  ipc.send('startTest')
  document.getElementById('content').innerHTML = '<h1>正在测试</h1>'
}

ipc.on('logMessage', (event, message) => {
  let body = document.getElementById('content')
  if(body){
    body.innerHTML = body.innerHTML + `<br/><p>${ message }</p>`
  }
})


ipc.on('getWechatCode', () => {
  document.getElementById('content').innerHTML = '<div id="wechat_bind_container"></div>'
  WxLogin({
    id: 'wechat_bind_container',
    appid: 'wxd7e08af781bea6a2',
    scope: 'snsapi_login',
    redirect_uri: 'http%3A%2F%2Fwxlogin.siyouqun.com',
    state: 'uuid',
    language: 'zh_CN',
    style: '',
    href: ''
  })
  const f = document.getElementById('wechat_bind_container')
  const d = wxiframe
  if (f) f.innerHTML = ''
  f.appendChild(d)
})

window.onbeforeunload = () => {
  if (wxiframe && wxiframe.contentWindow.wx_code) {
    console.log(wxiframe.contentWindow.wx_code)
    getCode(wxiframe.contentWindow.wx_code)
    return false // This will stop the redirecting.
  }
  return null
}

function getCode(code) {
  ipc.emit('getWechatCode', code)
}