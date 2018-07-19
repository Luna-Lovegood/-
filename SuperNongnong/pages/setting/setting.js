var touchDot = 0;//触摸时的原点 
var time = 0;// 时间记录，用于滑动时且时间小于1s则执行左右滑动 
var interval = "";// 记录/清理时间记录 
Page({
  onItemClick: function (e) {
    var targetUrl = '/pages/qrcode/qrcode?pay=' + e.currentTarget.dataset.pay
    wx.navigateTo({
      url: targetUrl
    })
  },

  login () {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  onPullDownRefresh () {
    wx.stopPullDownRefresh()
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
        url: '../discover/discover'
      });
    }
  },
  // 触摸结束事件 
  touchEnd: function (e) {
    clearInterval(interval); // 清除setInterval 
    time = 0;
  }, 
})
