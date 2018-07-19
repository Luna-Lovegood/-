var api = require('../../utils/api.js')
var app = getApp()
var touchDot = 0;//触摸时的原点 
var time = 0;// 时间记录，用于滑动时且时间小于1s则执行左右滑动 
var interval = "";// 记录/清理时间记录 
Page({
  data: {
    systemInfo: {},
    _api: {},
    img1: {
      src: '/images/discover/image_artist@2x.png',
      id: 1
    },
    img2: {
      src: '/images/discover/dailySelection@2x.png',
      id: 2
    },
    img3: {
      src: '/images/discover/image_fans@2x.png',
      id: 3
    },
    img4: {
      src: '/images/discover/image_preson@2x.png',
      id: 4
    },
    img5: {
      src: '/images/discover/image_read@2x.png',
      id: 5
    },
    img6: {
      src: '/images/discover/image_collect@2x.png',
      id: 6
    },
    img7: {
      src: '/images/discover/image_appreciate@2x.png',
      id: 7
    }
  },
  touchStart: function (e) {
    touchDot = e.touches[0].pageX; // 获取触摸时的原点 
    // 使用js计时器记录时间  
    interval = setInterval(function () {
      time++;
    }, 100);
  },
  // 触摸移动事件 
  touchMove: function (e) {
    var touchMove = e.touches[0].pageX;
    console.log("touchMove:" + touchMove + " touchDot:" + touchDot + " diff:" + (touchMove - touchDot));
    // 向左滑动  
    if ((touchMove - touchDot) / time > 4 && (touchMove - touchDot) > 40) {
      wx.switchTab({
        url: '../index/index'
      });
    }
    // 向右滑动 
    if ((touchMove - touchDot) / time < -4 && (touchMove - touchDot) < -40) {
      console.log('向右滑动');
      wx.switchTab({
        url: '../setting/setting'
      });
    }
  },
  // 触摸结束事件 
  touchEnd: function (e) {
    clearInterval(interval); // 清除setInterval 
    time = 0;
  }, 
  onLoad: function (options) {
    var that = this
    app.getSystemInfo(function (res) {
      that.setData({
        systemInfo: res
      })
    })

    that.setData({
      _api: api
    })
  },

  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  },
})
