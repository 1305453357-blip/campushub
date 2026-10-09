const s=require('../../services/index'),ui=require('../../utils/ui');
Page({data:{item:null},onLoad(options){this.id=options.id;},onShow(){this.setData({item:s.detail('needs',this.id)});},notice(){ui.toast('仅演示，不支持交易或联系');},back(){wx.switchTab({url:'/pages/needs/index'});}});
