
var api = require('../../utils/api.js')
var util = require('../../utils/util.js');
var app = getApp()

var UTIL = require('../../utils/util.js');
var GUID = require('../../utils/GUID.js');
var NLI = require('../../utils/NLI.js');

const appkey = require('../../config').appkey
const appsecret = require('../../config').appsecret

//微信小程序新录音接口，录出来的是aac或者mp3，这里要录成mp3
const mp3Recorder = wx.getRecorderManager()
const mp3RecoderOptions = {
  duration: 60000,
  sampleRate: 16000,
  numberOfChannels: 1,
  encodeBitRate: 48000,
  format: 'mp3',
  //frameSize: 50
}

var touchDot = 0;//触摸时的原点 
var time = 0;// 时间记录，用于滑动时且时间小于1s则执行左右滑动 
var interval = "";// 记录/清理时间记录 

//弹幕定时器
var timer;

var pageSelf = undefined;

var doommList = [];
class Doomm {
  constructor() {
    this.text = UTIL.getRandomItem(app.globalData.corpus);
    this.top = Math.ceil(Math.random() * 40);
    this.time = Math.ceil(Math.random() * 8 + 6);
    this.color = getRandomColor();
    this.display = true;
    let that = this;
    setTimeout(function () {
      doommList.splice(doommList.indexOf(that), 1);
      doommList.push(new Doomm());

      pageSelf.setData({
        doommData: doommList
      })
    }, this.time * 1000)
  }
}
function getRandomColor() {
  let rgb = []
  for (let i = 0; i < 3; ++i) {
    let color = Math.floor(Math.random() * 256).toString(16)
    color = color.length == 1 ? '0' + color : color
    rgb.push(color)
  }
  return '#' + rgb.join('')
}


Page({
  data: {
    region: ['山东省', '青岛市', '崂山区'],
    systemInfo: {},
    _api: {},
    navbar: ['天气', '聊天', '快递'],
    currentNavbar: '0',
    swipers: [],
    list: [],
    hot_last_id: 0,
    latest_list: [],
    latest_last_id: 0,
    j: 1,//帧动画初始图片 
    isSpeaking: false,//是否正在说话
    outputTxt: "", //输出识别结果
    doommData: [],

    //快递的
    array: [
      {
        'id': 'yunda',
        'name': '韵达'
      },
      {
        'id': 'shentong',
        'name': '申通'
      },
      {
        'id': 'ems',
        'name': 'EMS'
      },
      {
        'id': 'shunfeng',
        'name': '顺丰'
      },
      {
        'id': 'zhongtong',
        'name': '中通'
      },
      {
        'id': 'yuantong',
        'name': '圆通'
      },
      {
        'id': 'tiantian',
        'name': '天天'
      },
      {
        'id': 'huitongkuaidi',
        'name': '汇通'
      },
      {
        'id': 'quanfengkuaidi',
        'name': '全峰'
      },
      {
        'id': 'debangwuliu',
        'name': '德邦'
      },
      {
        'id': 'zhaijisong',
        'name': '宅急送'
      },
    ],
    compangy_id: '',
    inputValue: '',
    list: [],
    haslist: false,
    errmsg: ' '
  },

  onLoad() {
    var that = this;
    that.init();
  },
  loadPM: function (city) {
    var _this = this;

    wx.request({
      url: 'http://web.juhe.cn:8080/environment/air/pm?city=' + city + '&key=c68459a8d3b4ff7255712077d00ae998',
      data: {},
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var PM = res.data.result[0].quality;
        var AQI = res.data.result[0].AQI;
        _this.setData({
          PM: PM,
          AQI: AQI
        })
      }
    })
  },
  loadInfo: function () {
    var _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          scrollHeight: res.windowHeight - 5
        });
      }
    });
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        console.log(latitude + "+++" + longitude);
        _this.loadCity(latitude, longitude)
      }
    })
  },

  initDoomm: function () {
    doommList.push(new Doomm());
    doommList.push(new Doomm());
    doommList.push(new Doomm());
    this.setData({
      doommData: doommList
    })
  },



  // 以下是调用新接口实现的录音，录出来的是 mp3
  touchdown: function () {
    //touchdown_mp3: function () {
    UTIL.log("mp3Recorder.start with" + mp3RecoderOptions)
    var _this = this;
    speaking.call(this);
    this.setData({
      isSpeaking: true
    })
    mp3Recorder.start(mp3RecoderOptions);
  },
  touchup: function () {
    //touchup_mp3: function () {
    UTIL.log("mp3Recorder.stop")
    this.setData({
      isSpeaking: false,
    })
    mp3Recorder.stop();
  },
  // 触摸开始事件 
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

    // 向右滑动 
    if ((touchMove - touchDot) / time < -4 && (touchMove - touchDot) < -40) {
      console.log('向右滑动');
      wx.switchTab({
        url: "../discover/discover"
      });
    }
  },
  // 触摸结束事件 
  touchEnd: function (e) {
    clearInterval(interval); // 清除setInterval 
    time = 0;
  },
  init: function () {

    var that = this;
    pageSelf = this;
    this.initDoomm();

    //onLoad中为录音接口注册两个回调函数，主要是onStop，拿到录音mp3文件的文件名（不用在意文件后辍是.dat还是.mp3，后辍不决定音频格式）
    mp3Recorder.onStart(() => {
      UTIL.log('mp3Recorder.onStart()...')
    })
    mp3Recorder.onStop((res) => {
      UTIL.log('mp3Recorder.onStop() ' + res)
      const { tempFilePath } = res
      var urls = "https://api.happycxz.com/wxapp/mp32asr";
      UTIL.log('mp3Recorder.onStop() tempFilePath:' + tempFilePath)
      processFileUploadForAsr(urls, tempFilePath, this);
    })

    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    var n = timestamp * 1000;
    var date = new Date(n);
    var h = date.getHours();
    var m = date.getMinutes();
    date.setDate(date.getDate() + 1);
    var tom_year = date.getFullYear();
    var tom_month = date.getMonth() + 1;
    var tom_day = date.getDate();
    var tomorrow_date = tom_year + '.' + tom_month + '.' + tom_day;
    date.setDate(date.getDate() + 1);
    var tom_year1 = date.getFullYear();
    var tom_month1 = date.getMonth() + 1;
    var tom_day1 = date.getDate();
    var tomorrow_date1 = tom_year1 + '.' + tom_month1 + '.' + tom_day1;
    date.setDate(date.getDate() + 1);
    var tom_year2 = date.getFullYear();
    var tom_month2 = date.getMonth() + 1;
    var tom_day2 = date.getDate();
    var tomorrow_date2 = tom_year2 + '.' + tom_month2 + '.' + tom_day2;
    var time = h + ':' + m;
    this.setData({
      time: time,
      tomorrow_date: tomorrow_date,
      tomorrow_date1: tomorrow_date1,
      tomorrow_date2: tomorrow_date2,
    });
    Update(this);
    this.loadInfo();
    app.getSystemInfo(function (res) {
      that.setData({
        systemInfo: res
      })
    })
    that.setData({
      _api: api
    })
  },


  /**
   * 点击跳转详情页
   */
  onItemClick(e) {
    var targetUrl = api.PAGE_WORK
    if (e.currentTarget.dataset.rowId != null)
      targetUrl = targetUrl + '?rowId=' + e.currentTarget.dataset.rowId
    wx.navigateTo({
      url: targetUrl
    })
  },

  /**
   * 切换 navbar
   */
  swichNav(e) {
    this.setData({
      currentNavbar: e.currentTarget.dataset.idx
    })
    if (e.currentTarget.dataset.idx == 2 && e.currentTarget.dataset.idx == 1 && this.data.latest_list.length == 0) {
      this.pullUpLoadLatest()
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    var _this = this;
    switch (this.data.currentNavbar) {
      case '0':
        _this.init();
        wx.stopPullDownRefresh()
        break
      case '1':
        _this.init();
        wx.stopPullDownRefresh()
        break
      case '2':
        _this.init();
        _this.setData({
        })
        wx.stopPullDownRefresh()
        break
    }
  },
  bindRegionChange: function (e) {
    var _this = this;
    var temp = e.detail.value[1] + ' ' + e.detail.value[2]
    _this.setData({
      city: temp
    })
    _this.reloadWeather(e.detail.value[1], e.detail.value[2]);
  },
  reloadWeather: function (city, dist) {
    var _this = this;
    var choosecity = city;
    var choosedis = dist;
    choosecity = city.split('市');
    choosedis = dist.split('区');
    _this.loadPM(choosecity[0]);
    wx.request({
      url: 'http://v.juhe.cn/weather/citys?key=0429a97e4c1d01c262c7f0e939a2e256',
      data: {},
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var temp = res.data.result;
        var len = res.data.result.length;
        console.log(len);
        console.log(temp)
        for (var i = 0; i < len; i++) {
          var detail_city = res.data.result[i].city;
          var detail_dis = res.data.result[i].district;
          if (choosecity[0] == detail_city) {
            if (choosedis[0] == detail_dis) {
              var detail_id = res.data.result[i].id;
              var id = detail_id;
              console.log(id);
              _this.loadWeatherById(id);
              break;
            }
          }
        }
        console.log(i);
        if (i == 2574) {
          for (var j = 0; j < len; j++) {
            var detail_city = res.data.result[j].city;
            if (choosecity[0] == detail_city) {
              var detail_id = res.data.result[j].id;
              var id = detail_id;
              console.log(id);
              _this.loadWeatherById(id);
              break;
            }
          }
        }
      }
    })
  },
  loadWeatherById: function (id) {
    var _this = this;
    wx.request({
      url: 'http://v.juhe.cn/weather/index?format=2&cityname=' + id + '&key=0429a97e4c1d01c262c7f0e939a2e256',
      data: {},
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var sk = res.data.result.sk;
        var today = res.data.result.today;
        var wind = sk.wind_direction + " " + sk.wind_strength;
        var future = res.data.result.future;
        _this.setData({
          temperature: sk.temp,
          wind: wind,
          detail: today.weather,
          tomorrow_detail: future[0].weather,
          tomorrow_temp: future[0].temperature,
          tomorrow_detail1: future[1].weather,
          tomorrow_temp1: future[1].temperature,
          tomorrow_detail2: future[2].weather,
          tomorrow_temp2: future[2].temperature,
          advicedetail: today.dressing_advice,
          uv: today.uv_index,
          dressindex: today.dressing_index,
          washindex: today.wash_index,
        })
      }
    })
  },
  loadCity: function (latitude, longitude) {
    var _this = this;
    wx.request({
      url: 'http://v.juhe.cn/weather/geo?format=2&key=0429a97e4c1d01c262c7f0e939a2e256&lon=' + longitude + '&lat=' + latitude,
      data: {},
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res);

        var sk = res.data.result.sk;
        var today = res.data.result.today;
        var wind = sk.wind_direction + " " + sk.wind_strength;
        var future = res.data.result.future;
        _this.loadPM(today.city)
        _this.setData({
          city: today.city,
          temperature: sk.temp,
          wind: wind,
          detail: today.weather,
          tomorrow_detail: future[0].weather,
          tomorrow_temp: future[0].temperature,
          tomorrow_detail1: future[1].weather,
          tomorrow_temp1: future[1].temperature,
          tomorrow_detail2: future[2].weather,
          tomorrow_temp2: future[2].temperature,
          advicedetail: today.dressing_advice,
          uv: today.uv_index,
          dressindex: today.dressing_index,
          washindex: today.wash_index,
        });
      }
    });
  },

  //事件处理函数
  // 公司选择
  bindPickerChange: function (e) {
    const val = e.detail.value;
    this.setData({
      index: val,
      compangy_id: this.data.array[val]['id']
    });
  },
  queryAndShow: function (options) {
    var that = this;
    wx.request({
      url: 'https://www.kuaidi100.com/query',
      data: options,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        var msg = res.data.message;
        var data = res.data.data;
        if (msg === "ok") {
          that.setData({
            list: data,
            haslist: true
          });
          // console.log(that.data.list);
        } else {
          that.setData({
            haslist: false,
            errmsg: '请正确输入快递公司和单号'
          });
        }
      },
      fail: function (res) {
        that.setData({
          haslist: false,
          errmsg: '请正确输入快递公司和单号'
        });
      }
    })
  },
  // 输入单号
  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  // 点击查询
  bindquery: function (e) {
    var data = {
      'type': this.data.compangy_id,
      'postid': this.data.inputValue
    };
    this.queryAndShow(data);
  },
})

function Update(that) {
  setTimeout(function () {
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    var n = timestamp * 1000;
    var date = new Date(n);
    var h = date.getHours();
    var m = date.getMinutes();
    var time = h + ':' + m;
    that.setData({
      time: time
    });
    Update(that);
  }, 1000)
}

//上传录音文件到 api.happycxz.com 接口，处理语音识别和语义，结果输出到界面
function processFileUploadForAsr(urls, filePath, _this) {
  wx.uploadFile({
    url: urls,
    filePath: filePath,
    name: 'file',
    formData: { "appKey": appkey, "appSecret": appsecret, "userId": UTIL.getUserUnique() },
    header: { 'content-type': 'multipart/form-data' },
    success: function (res) {
      UTIL.log('res.data:' + res.data);

      var nliResult = getNliFromResult(res.data);
      UTIL.log('nliResult:' + nliResult);
      var stt = getSttFromResult(res.data);
      UTIL.log('stt:' + stt);

      var sentenceResult;
      try {
        sentenceResult = NLI.getSentenceFromNliResult(nliResult);
      } catch (e) {
        UTIL.log('touchup() 错误' + e.message + '发生在' + e.lineNumber + '行');
        sentenceResult = '没明白你说的，换个话题？'
      }

      var lastOutput = "==>语音识别结果：\n" + stt + "\n\n==>语义处理结果：\n" + sentenceResult;
      _this.setData({
        outputTxt: lastOutput,
      });
      wx.hideToast();
    },
    fail: function (res) {
      UTIL.log(res);
      wx.showModal({
        title: '提示',
        content: "网络请求失败，请确保网络是否正常",
        showCancel: false,
        success: function (res) {
        }
      });
      wx.hideToast();
    }
  });
}

function getNliFromResult(res_data) {
  var res_data_json = JSON.parse(res_data);
  var res_data_result_json = JSON.parse(res_data_json.result);
  return res_data_result_json.nli;
}

function getSttFromResult(res_data) {
  var res_data_json = JSON.parse(res_data);
  var res_data_result_json = JSON.parse(res_data_json.result);
  return res_data_result_json.asr.result;
}

//麦克风帧动画 
function speaking() {
  var _this = this;
  //话筒帧动画 
  var i = 1;
  this.timer = setInterval(function () {
    i++;
    i = i % 5;
    _this.setData({
      j: i
    })
  }, 200);
}

