const service=require('../services/index');
function toast(message) { wx.showToast({title:message,icon:'none'}); }
function schoolOptions() { return ['全部学校'].concat(service.schools); }
function changeSchool(page,event) {
 const school=schoolOptions()[Number(event.detail.value)];
 try { service.setSchool(school);page.refresh(); } catch (_) { toast('学校选择保存失败，请重试'); }
}
function openProduct(event) { wx.navigateTo({url:'/pages/product-detail/index?id='+encodeURIComponent(event.currentTarget.dataset.id)}); }
function openNeed(event) { wx.navigateTo({url:'/pages/need-detail/index?id='+encodeURIComponent(event.currentTarget.dataset.id)}); }
module.exports={toast,schoolOptions,changeSchool,openProduct,openNeed};
