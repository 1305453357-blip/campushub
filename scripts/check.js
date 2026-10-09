'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),cp=require('child_process');
const root=path.resolve(__dirname,'..'),mini=path.join(root,'miniprogram');
const read=p=>fs.readFileSync(p,'utf8');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=walk(mini).concat([path.join(root,'project.config.json')]);
for(const file of files){if(file.endsWith('.json'))JSON.parse(read(file));if(file.endsWith('.js'))cp.execFileSync(process.execPath,['--check',file]);}
const config=JSON.parse(read(path.join(root,'project.config.json'))),app=JSON.parse(read(path.join(mini,'app.json')));
assert.equal(config.miniprogramRoot,'miniprogram/');assert.equal(config.appid,'touristappid');assert.equal(app.tabBar.list.length,5);
for(const tab of app.tabBar.list){assert(app.pages.includes(tab.pagePath));for(const icon of [tab.iconPath,tab.selectedIconPath])assert(fs.readFileSync(path.join(mini,icon)).subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));}
assert(fs.existsSync(path.join(mini,app.sitemapLocation)));
let storage={},failStorage=false,navigations=[];
const wx={getStorageSync:k=>storage[k],setStorageSync:(k,v)=>{if(failStorage)throw Error('storage unavailable');storage[k]=JSON.parse(JSON.stringify(v));},showToast:()=>{},showModal:()=>{},navigateTo:opts=>navigations.push(opts.url),redirectTo:opts=>navigations.push(opts.url),switchTab:opts=>{assert(app.tabBar.list.some(t=>'/'+t.pagePath===opts.url));navigations.push(opts.url);}};
global.wx=wx;
const s=require(path.join(mini,'services'));
assert.equal(s.schools.length,3);assert.equal(s.list('products').length,4);assert.equal(s.list('needs').length,4);
s.setSchool(s.schools[1]);assert.equal(s.getSchool(),s.schools[1]);assert(s.list('products',{school:s.schools[1]}).every(p=>p.school===s.schools[1]));
assert.equal(s.list('products',{keyword:'耳机',category:'数码'}).length,1);assert.equal(s.list('products',{keyword:'不存在'}).length,0);
const product={title:'测试商品',description:'虚构商品描述文字',category:s.productCategories[0],school:s.schools[0],price:'29.90'};
for(const price of ['0','-1','100000','1.234','abc','1e2'])assert.throws(()=>s.publish('products',{...product,price}));
assert.throws(()=>s.publish('products',{...product,title:''}));assert.throws(()=>s.publish('products',{...product,school:'真实学校'}));assert.throws(()=>s.publish('products',{...product,description:'短'}));
const published=s.publish('products',product);assert.equal(s.detail('products',published.id).price,'29.90');assert.equal(s.list('products',{mine:true}).length,1);
const need={title:'模拟学习搭子',description:'仅测试用途的学习互助',category:s.needCategories[3],school:s.schools[2],contact:'虚构代号 A01'};
assert.throws(()=>s.publish('needs',{...need,contact:''}));const posted=s.publish('needs',need);assert.equal(s.detail('needs',posted.id).contact,need.contact);
delete require.cache[require.resolve(path.join(mini,'services'))];assert.equal(require(path.join(mini,'services')).list('products',{mine:true}).length,1);
failStorage=true;assert.throws(()=>s.publish('products',product));failStorage=false;assert.equal(s.list('products',{mine:true}).length,1);
assert.equal(s.detail('products','missing'),null);
function loadPage(route){let definition;const filename=path.join(mini,route+'.js');vm.runInNewContext(read(filename),{require:p=>require(path.resolve(path.dirname(filename),p)),Page:p=>definition=p,wx},{filename});const page={...definition,data:JSON.parse(JSON.stringify(definition.data)),setData(update){for(const [key,value]of Object.entries(update)){const bits=key.split('.');let target=this.data;while(bits.length>1)target=target[bits.shift()];target[bits[0]]=value;}}};return page;}
for(const route of app.pages){for(const ext of ['js','json','wxml','wxss'])assert(fs.existsSync(path.join(mini,route+'.'+ext)));const p=loadPage(route),markup=read(path.join(mini,route+'.wxml'));for(const match of markup.matchAll(/(?:bind|catch)(?::)?[a-z]+="([A-Za-z_$][\w$]*)"/g))assert.equal(typeof p[match[1]],'function',route+' missing '+match[1]);if(p.onLoad)p.onLoad({id:route.includes('product-detail')?published.id:posted.id});if(p.onShow)p.onShow();if(route.includes('publish-')){const form=route.includes('product')?product:need;p.setData({form,schoolIndex:s.schools.indexOf(form.school),categoryIndex:p.data.categories.indexOf(form.category)});p.submit();assert.equal(p.data.submitting,true);}}
for(const url of navigations)assert(app.pages.includes(url.split('?')[0].slice(1)),url);
assert.equal(navigations.length,2);
console.log('PASS: JSON/JS syntax, 9 page configurations and handlers, 5 local tab resources, services validation/filtering/persistence/storage failure, 2 simulated publication routes.');
console.log('Not run: WeChat DevTools compilation, WXML/WXSS rendering, simulator or device interactions.');
