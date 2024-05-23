// 服务器端API可以获取百度API的访问令牌
const API_KEY = require('../../config').API_KEY // 从安全的服务器端获取
const SECRET_KEY = require('../../config').SECRET_KEY // 从安全的服务器端获取
//自行获取APIKey、SecretKey
const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?client_id=${API_KEY}&client_secret=${SECRET_KEY}&grant_type=client_credentials`;

Page({
  onShow() { },
  onShareAppMessage() {
    return {
      title: '翠林识语',
      path: 'page/component/index'
    }
  },
  onShareTimeline() {
    '翠林识语'
  },

  data: {
    src: '',
    name:'',
    image_url:'',
    description:'',
    name2:'',
    name3:'',
    theme: 'light',
    show: false,
    ask_parm:'',
  },

  popup() {
    const position = 'bottom'
    let duration = 300
    let customStyle = 'height: 100%;'
    this.setData({
      position,
      show: true,
      customStyle,
      duration
    })
  },

  exit() {
    this.setData({show: false,name:'',
      image_url:'',
      description:'',})
    // wx.navigateBack()
  },

  takePhoto(e) {
    const self = this;
    self.data.ask_parm = e.currentTarget.dataset.ask_parm
    wx.chooseMedia({
      count: 9,
      mediaType: ['image', 'video'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success(res) {
        self.setData({
          src: res.tempFiles[0].tempFilePath
        });
        self.processImageIdentify()
      },
      error(e) {
        wx.showToast({
          title: e.detail,
          icon: 'none',
          duration: 2000
        })
        // console.log(e.detail);
      }
    });
  },

  async getBaiduToken() {
    // 使用异步函数来处理获取令牌的逻辑
    return new Promise((resolve, reject) => {
      
      wx.request({
        url: tokenUrl,
        method: 'POST',
        dataType: "json",
        header: {
          'content-type': 'application/json; charset=UTF-8'
        },
        success: function (res) {
          resolve(res);
        },
        fail: function (res) {
          wx.hideLoading();
          wx.showToast({
            title: '网络错误，请重试！',
            icon: 'none',
            duration: 500
          })
          reject(res);
        },
        complete: function (res) {
          resolve(res);
        }
      })
    })
  },

  async getImgIdentify(token, data) {
    const self = this;
    let v = '';
    switch(self.data.ask_parm) {
      case 'plant':
      case 'animal': 
        v = 1
        break
      case 'ingredient':
        v = 1
        self.data.ask_parm = 'classify/ingredient'
        break
      case 'dish':
        v = 2
        break
    }
    return new Promise((resolve, reject) => {
      const detectUrl = `https://aip.baidubce.com/rest/2.0/image-classify/v${v}/${self.data.ask_parm}?access_token=${token}`;
      wx.showLoading()
      wx.request({
        url: detectUrl,
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        data: {
                'image': data,
                'baike_num':1
        },
        success: function (res) {
          resolve(res);
          wx.hideLoading()//隐藏loading
        },
        fail: function (res) {
          wx.hideLoading();
          wx.showToast({
            title: '出小插曲了T。T',
            icon: 'error',
            duration: 2000
          })
          reject(res);
          wx.hideLoading()//隐藏loading
        },
        complete: function (res) {
          resolve(res);
        }
      })
    })
  },

  async processImageIdentify() {
    const self = this;
    // 假设getBaiduToken是一个返回Promise的函数，它返回访问令牌
    let tokenResponse = await this.getBaiduToken();
    let token = tokenResponse.data.access_token;
    // 在使用Token之前检查是否需要刷新
    // 这里简化处理，实际应用中可能需要根据实际逻辑进行刷新操作
    let refreshedToken = token;
    // 假设getFileContentAsBase64是一个函数，它返回图片的Base64编码
    let base64Data = await this.getFileContentAsBase64(self.data.src);
    let identifyResponse = await this.getImgIdentify(refreshedToken, base64Data);
    let plantInfo = identifyResponse.data.result;
    // let score = plantInfo.length > 0 ? plantInfo[0].score || 0 : 0;
    let resImg,resDes;
    resImg = typeof plantInfo[0].baike_info?.image_url == 'undefined' ? self.data.src : plantInfo[0].baike_info.image_url;
    resDes = typeof plantInfo[0].baike_info?.description == 'undefined' ? '' : plantInfo[0].baike_info?.description;
    if(plantInfo.length > 0){
      self.popup()
      self.setData({
        name:plantInfo[0].name,
        image_url:resImg,
        description:resDes,
      })
    }else{
      wx.showToast({
        title: '抱歉，我还没发现这个物种╥﹏╥...',
      })
    }


  },

  async getFileContentAsBase64(img) {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: img,
        encoding: "base64",
        success: res => {
          resolve(res.data);
        },
        fail: error => {
          reject(error);
        }
      });
    });
  },

  onLoad() {
    this.setData({
      theme: wx.getSystemInfoSync().theme || 'light'
    });

    if (wx.onThemeChange) {
      wx.onThemeChange(({
        theme
      }) => {
        this.setData({
          theme
        });
      });
    }
  }
})