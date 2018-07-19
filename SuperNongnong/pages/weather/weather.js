// pages/weather/weather.js

var util = require('../../utils/util.js');  
var app = getApp()
Page({
  data: {
    region: ['山东省','青岛市','崂山区'],
  },

  onLoad: function (options) {//设置时间
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    var n = timestamp * 1000;
    var date = new Date(n);
    var h =date.getHours();
    var m = date.getMinutes();
    date.setDate(date.getDate() + 1);
    var tom_year = date.getFullYear();
    var tom_month = date.getMonth()+1;
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
      tomorrow_date:tomorrow_date,
      tomorrow_date1: tomorrow_date1,
      tomorrow_date2: tomorrow_date2,
    });  
    Update(this);
    this.loadInfo();
  },
  loadInfo: function () {
    var _this = this;
    wx.getSystemInfo({
      success:function(res) {
        _this.setData({
          scrollHeight:res.windowHeight-5
        });
      }
    });
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        console.log(latitude + "+++" + longitude);
        _this.loadCity(latitude,longitude)
      }
    })
  },
  bindRegionChange: function (e) {
    var _this = this;
    var temp = e.detail.value[1] +' ' + e.detail.value[2]
    _this.setData({
      city:temp
    })
    _this.reloadWeather(e.detail.value[1], e.detail.value[2]);
  },
  reloadWeather:function(city,dist){ 
    var _this = this;
    var choosecity = city;
    var choosedis = dist;
    choosecity = city.split('市');
    choosedis = dist.split('区');
    wx.request({
      url: 'http://v.juhe.cn/weather/citys?key=0429a97e4c1d01c262c7f0e939a2e256',
      data: {},
      header: {
        'content-type': 'application/json'
      },
      success:function(res){
        var temp = res.data.result;
        var len = res.data.result.length;
        console.log(len);
        console.log(temp)
        for(var i = 0;i<len;i++){
          var detail_city = res.data.result[i].city;
          var detail_dis = res.data.result[i].district;
          if (choosecity[0] == detail_city){
            if (choosedis[0] == detail_dis){
              var detail_id = res.data.result[i].id;
              var id = detail_id;
              console.log(id);
              _this.loadWeatherById(id);
              break;
            } 
          }
        }
        console.log(i);
        if (i == 2574){
          for(var j = 0;j<len;j++){
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
  loadWeatherById:function(id){
    var _this = this ;
    wx.request({
      url: 'http://v.juhe.cn/weather/index?format=2&cityname=' + id + '&key=0429a97e4c1d01c262c7f0e939a2e256',
      data: {},
      header: {
        'content-type': 'application/json'
      },
      success:function(res){
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
  loadCity:function(latitude,longitude){
    var _this = this;
    wx.request({
      url: 'http://v.juhe.cn/weather/geo?format=2&key=0429a97e4c1d01c262c7f0e939a2e256&lon='+longitude+'&lat='+latitude,
      data: {},
      header: {
        'content-type': 'application/json'
      },
      success:function(res){
        console.log(res);
        
        var sk = res.data.result.sk;
        var today = res.data.result.today;
        var wind = sk.wind_direction + " " + sk.wind_strength;
        var future = res.data.result.future;
        _this.setData({ 
          city : today.city,
          temperature : sk.temp,
          wind: wind,
          detail : today.weather,
          tomorrow_detail : future[0].weather,
          tomorrow_temp: future[0].temperature,
          tomorrow_detail1 : future[1].weather,
          tomorrow_temp1: future[1].temperature,
          tomorrow_detail2: future[2].weather,
          tomorrow_temp2: future[2].temperature,
          advicedetail: today.dressing_advice,
          uv : today.uv_index,
          dressindex : today.dressing_index,
          washindex : today.wash_index,
        });
        }
    });
  }
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

