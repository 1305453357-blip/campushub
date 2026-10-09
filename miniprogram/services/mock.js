const schools = ['星澜大学', '青禾理工学院', '云栖师范学院'];
const productCategories = ['数码', '书籍', '生活', '运动'];
const needCategories = ['摄影约拍', '足球招募', '拼车', '学习互助'];
const products = [
 { id:'p1', title:'轻便蓝牙耳机', price:'59.00', category:'数码', description:'演示商品：适合自习和通勤，附收纳盒。', school:schools[0], badge:'耳机', ownerId:'demo-a', createdAt:3 },
 { id:'p2', title:'高等数学学习书籍', price:'18.00', category:'书籍', description:'演示商品：书页完整，少量学习笔记。', school:schools[1], badge:'书籍', ownerId:'demo-b', createdAt:2 },
 { id:'p3', title:'宿舍桌面收纳架', price:'25.00', category:'生活', description:'演示商品：轻巧收纳，让桌面整洁。', school:schools[2], badge:'收纳', ownerId:'demo-c', createdAt:1 },
 { id:'p4', title:'入门训练足球', price:'35.00', category:'运动', description:'演示商品：操场练习用球。', school:schools[0], badge:'足球', ownerId:'demo-a', createdAt:0 }
];
const needs = needCategories.map((category,i)=>({id:'n'+(i+1),title:['寻找校园摄影搭子','周末足球友谊赛招募','周五拼车意向登记','线性代数学习互助'][i],category,description:'这是虚构的演示需求，用于体验校园信息浏览。请勿据此安排实际活动。',school:schools[i%3],contact:'演示联系方式（不可联系）',ownerId:'demo-'+i,createdAt:4-i}));
const merchants = schools.map((school,i)=>({id:'m'+i,school,name:['青柠咖啡示例店','禾风文具示例店','云朵轻食示例店'][i],category:['咖啡 · 自习','文具 · 打印','轻食 · 简餐'][i],description:'演示数据 · 商家、位置和服务均为虚构',location:'虚拟校园生活街 '+(i+1)+' 号'}));
module.exports = {schools, productCategories, needCategories, products, needs, merchants};
