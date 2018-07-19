//app.js
const corpusList = require('./config').corpus
var UTIL = require('./utils/util.js');

App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },

  updateUserLocation: function () {
    var that = this
    wx.getLocation({
      //type: 'wgs84',  // gps原始坐标
      type: 'gcj02', //国家标准加密坐标
      success: function (res) {
        that.globalData.latitude = res.latitude
        that.globalData.longitude = res.longitude
        that.globalData.speed = res.speed
        //var accuracy = res.accuracy
        UTIL.log('REFRESH LOCATION: ' + that.globalData.latitude + ' | ' + that.globalData.longitude + ' , speed: ' + that.globalData.speed)
      },
      fail: function (res) {
        UTIL.log('REFRESH LOCATION FAILED...')
      }
    })
  },
  

  getUserInfo: function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  getSystemInfo: function (cb) {
    var that = this
    if(that.globalData.systemInfo){
      typeof cb == "function" && cb(that.globalData.systemInfo)
    }else{
      wx.getSystemInfo({
        success: function(res) {
          that.globalData.systemInfo = res
          typeof cb == "function" && cb(that.globalData.systemInfo)
        }
      })
    }
  },
  globalData:{
    userInfo: null,
    systemInfo: null,
    corpus: corpusList,
    custId: '',
    latitude: 0.0,
    longitude: 0.0,
    speed: 0,
   
  }
})
