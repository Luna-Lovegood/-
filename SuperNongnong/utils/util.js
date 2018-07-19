//获取应用实例
var app = getApp()

var Guid = require('./GUID.js');

var uuidSaved = '';

//将date格式的数据转成  hh:mm:ss 字符串格式
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  //return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  return [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//log接口封装
function log(obj) {
  console.log('<' + formatTime(new Date(Date.now())) + '>' + ' ' + obj)

  //往用户缓存去写
  // var logs = wx.getStorageSync('logs') || []
  // logs.unshift('[' + formatTime(new Date(Date.now())) + ']' + ' ' + obj)
  // wx.setStorageSync('logs', logs)
}

//获取用户唯一标识，NLI接口中要上传用户唯一标识，这里获取：第一次登录时生成的uuid+微信号所在地+昵称
function getUserUnique(userInfo) {
  //从缓存中读取uuid
  if (typeof uuidSaved === 'undefined' || uuidSaved === '') {
    var tmpUuid = wx.getStorageSync('uuid');
    if (typeof tmpUuid === 'undefined' || tmpUuid === '') {
      uuidSaved = Guid.NewGuid();
      wx.setStorageSync('uuid', uuidSaved);
    } else {
      uuidSaved = tmpUuid;
    }
  }

  var unique = uuidSaved;
  if (userInfo != null) {
    unique += '_' + userInfo.province + '_' + userInfo.nickName;
  }
  log('getUserUnique() return:' + unique)
  return unique;
}

//由 毫秒数字符串 获取  HH:mm:ss 格式时间
function getHHMMSS(dateStr) {
  var dateVal = new Date(parseInt(dateStr));
  var hh = dateVal.getHours()
  var mm = dateVal.getMinutes()
  var ss = dateVal.getSeconds()

  return ((hh >= 10) ? hh : '0' + hh) + ':' + ((mm >= 10) ? mm : '0' + mm) + ':' + ((ss >= 10) ? ss : '0' + ss)
}


//从语料数组中随机挑选一条语料
function getRandomItem(corpusList) {
  var ret = corpusList[0];
  ret = corpusList[Math.floor(Math.random() * corpusList.length)];
  return ret;
}

module.exports = {
  formatTime: formatTime,
  log: log,
  getUserUnique: getUserUnique,
  getHHMMSS: getHHMMSS,
  getRandomItem: getRandomItem,
}

