// Synchronous local adapter. Replace this boundary with asynchronous cloud APIs later.
const mock = require('./mock');
const KEY = 'campushub_v01';
const USER = {id:'local-user',name:'校园体验官',subtitle:'虚拟用户 · 本地体验'};
function read() {
 const raw = wx.getStorageSync(KEY);
 if (!raw || typeof raw !== 'object') return {products:[],needs:[],school:'全部学校'};
 return {products:Array.isArray(raw.products)?raw.products.slice():[],needs:Array.isArray(raw.needs)?raw.needs.slice():[],school:['全部学校'].concat(mock.schools).includes(raw.school)?raw.school:'全部学校'};
}
function save(state) { wx.setStorageSync(KEY,state); }
function getSchool() { return read().school; }
function setSchool(school) { if (!['全部学校'].concat(mock.schools).includes(school)) throw new Error('请选择有效学校'); const state=read();state.school=school;save(state); }
function list(kind, filters={}) {
 if (!['products','needs'].includes(kind)) throw new Error('不支持的数据类型');
 const state=read();
 return state[kind].concat(mock[kind]).filter(item=>(!filters.school || filters.school==='全部学校' || item.school===filters.school) && (!filters.category || filters.category==='全部' || item.category===filters.category) && (!filters.keyword || (item.title+' '+item.description).toLowerCase().includes(filters.keyword.toLowerCase())) && (!filters.mine || item.ownerId===USER.id)).sort((a,b)=>b.createdAt-a.createdAt);
}
function detail(kind,id) { return list(kind).find(item=>item.id===id) || null; }
function text(value) { return typeof value==='string'?value.trim():''; }
function validate(kind,input) {
 const data={title:text(input.title),category:text(input.category),description:text(input.description),school:text(input.school)};
 if (data.title.length<2 || data.title.length>40) throw new Error('标题需为 2–40 个字符');
 if (data.description.length<5 || data.description.length>500) throw new Error('描述需为 5–500 个字符');
 if (!mock.schools.includes(data.school)) throw new Error('请选择学校');
 const categories=kind==='products'?mock.productCategories:mock.needCategories;
 if (!categories.includes(data.category)) throw new Error('请选择有效分类');
 if (kind==='products') {
  const price=text(input.price);
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(price) || Number(price)<=0 || Number(price)>99999.99) throw new Error('价格需大于 0、不超过 99999.99，最多两位小数');
  data.price=Number(price).toFixed(2);data.badge='本地发布';
 } else {
  data.contact=text(input.contact);
  if (data.contact.length<2 || data.contact.length>60) throw new Error('模拟联系方式需为 2–60 个字符');
 }
 return data;
}
function publish(kind,input) {
 if (!['products','needs'].includes(kind)) throw new Error('不支持的数据类型');
 const data=validate(kind,input),state=read(), now=Date.now();
 const item=Object.assign(data,{id:kind+'-'+now+'-'+Math.random().toString(36).slice(2,9),ownerId:USER.id,createdAt:now});
 state[kind].unshift(item);save(state);return item;
}
module.exports={...mock,user:USER,getSchool,setSchool,list,detail,validate,publish};
