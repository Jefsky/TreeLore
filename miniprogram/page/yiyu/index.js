const requestUrl = require('../../config').yiyanRequestUrl

const duration = 500

Page({
  onShow() {

  },
  onShareAppMessage() {
    return {
      title: '你一念，我一语',
      path: 'page/yiyan/index'
    }
  },
  onShareTimeline() {
    '你一念，我一语'
  },

  data: {
    desc:'',
    from:'',
    from_who:'',
    theme: 'light'
  },
  makeRequest() {
    const self = this

    self.setData({
      loading: true
    })
    wx.request({
      url: requestUrl,
      data: {
    theme: 'light',
        noncestr: Date.now()
      },
      success(result) {
        // wx.showToast({
        //   title: '请求成功',
        //   icon: 'success',
        //   mask: true,
        //   duration,
        // })
        self.setData({
          loading: false,
          desc:result.data.hitokoto,
          from:result.data.from,
          from_who:'——'+result.data.from_who
        })
        console.log('request success', result)
      },

      fail({errMsg}) {
        wx.showToast({
          title: '出小插曲了T。T',
          icon: 'error',
          mask: true,
          duration:1000,
        })
        console.log('request fail', errMsg)
        self.setData({
          loading: false
        })
      }
    })
  },
  onLoad() {
    this.setData({
      theme: wx.getSystemInfoSync().theme || 'light'
    })

    if (wx.onThemeChange) {
      wx.onThemeChange(({theme}) => {
        this.setData({theme})
      })
    }
  }
})
