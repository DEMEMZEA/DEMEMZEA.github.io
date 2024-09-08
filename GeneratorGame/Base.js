"use strict"
let EN = ExpantaNum
let subtab = {golden:0,void:0}
Math.PHI = (1+5**0.5)/2
let format = function(x,precision=game.precision,notation=game.notation,base=game.base){
if(x instanceof ExpantaNum===false) x = new EN(x)
if(x.eq(Infinity)) return "Infinity"
let s = ''
if(x.lt(EN(notation===3?base:10).tetr(6))){
  while(x.gt(EN(notation===3?base:10).tetr(3))){
  s+='e'
  x = x.logBase(notation===3?base:10)
  }
  if(notation===1) precision-=x.log10().floor().sub(x.log10().floor().div(3).floor().mult(3)).toNumber()
  if(x.lt(1e3)&&s==='') return x.mult(10**precision).floor().div(10**precision).toNumber()
  if(notation===0) return s+`${x.div(EN(10).pow(x.log10().floor())).times(10**precision).floor().div(10**precision).toNumber()}e${x.log10().floor().toNumber()}`
  if(notation===1) return s+`${x.div(EN(10).pow(x.log10().floor().div(3).floor().mult(3))).times(10**precision).floor().div(10**precision).toNumber()}e${x.log10().floor().div(3).floor().mult(3).toNumber()}`
  if(notation===2) return s+`e${x.log10().mult(10**precision).floor().div(10**precision).toNumber()}`
  if(notation===3) return s+`${x.div(EN(base).pow(x.logBase(base).floor())).times(base**precision).floor().div(base**precision).toNumber().toString(base).toUpperCase()}e${x.logBase(base).floor().toNumber().toString(base).toUpperCase()}`
}
return `${x.toHyperE()}`
}

let formatTime = function(milisseconds){
  let seconds = Math.floor(milisseconds/1000)
  let minutes = Math.floor(seconds/60)
  seconds = seconds%60
  if(seconds<10&&minutes) seconds="0"+seconds
  let ms = Math.floor(milisseconds%1000/10)
  if(ms<10) ms="0"+ms
  if(minutes!==0) return `${minutes}:${seconds}.${ms}`
  if(seconds!==0) return `${seconds}.${ms}`
  return `0.${ms}`
}

let secret = false

let changelog = false

let ENify = function(x){
for(let i in x){
try{
if(typeof x[i]==="object"){
if(x[i].hasOwnProperty("array")&&x[i].hasOwnProperty("sign")&&x[i].hasOwnProperty("layer")) x[i] = ExpantaNum(x[i])
else x[i] = ENify(x[i])
}
}catch{console.log(i)}
}
return x
}

let save = function(savename="save"){
localStorage.setItem(savename,btoa(JSON.stringify(game)))
}

let load = function(savename="save"){
let item = localStorage.getItem(savename)
if(item===null) return false
game = ENify(JSON.parse(atob(item)))
fillObject(game,OG)
if(game.offlineProgress)game.lastTick=Date.now()
}

let exporty = function() {
copyStringToClipboard(btoa(JSON.stringify(game)));
alert("Save Exported Successfully!")
}

function copyStringToClipboard(str) {
  var el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style = {
    position: "absolute",
    left: "-9999%"
  };
  document.body.appendChild(el);
  copyToClipboard(el);
  document.body.removeChild(el);
}

function copyToClipboard(el) {
  el = typeof el === "string" ? document.querySelector(el) : el;
  if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
    var editable = el.contentEditable;
    var readOnly = el.readOnly;
    el.contentEditable = true;
    el.readOnly = true;
    var range = document.createRange();
    range.selectNodeContents(el);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    el.setSelectionRange(0, 999999);
    el.contentEditable = editable;
    el.readOnly = readOnly;
  } else {
    el.select();
  }
  document.execCommand("copy");
}

let importy = function(){
let string = prompt("Paste in your save (will overwrite your current save)")
if(string=="") return false
let obj = JSON.parse(atob(string))
let ified = ENify(obj)
fillObject(ified,OG)
game = copyObject(ified)
vue.game = game
}

let copyObject = function(x){
if(typeof x!=="object") return x
let object = new x.constructor()
for(let i in x){
    object[i] = copyObject(x[i])
}
return object
}

let fillObject = function(x,main){
for(let i in main){
if(typeof x[i]!==typeof main[i]) x[i] = main[i]
else if(typeof main[i]==="object"&&x.hasOwnProperty(i)) fillObject(x[i],main[i])
else if(x.hasOwnProperty(i)===false) x[i] = main[i]
}
}

let game={
//main variables
machines:EN(1),
money:EN(0),
//presitge
goldenPoints:EN(0),
goldenMachines:0,
goldenEssence:EN(0),
goldenUpgrades:{0:false,1:false,2:false,10:false,11:false,12:false,20:false,21:false,22:false,23:false,30:false,31:false,32:false},
//void
abstracts:EN(0),
voidUpgrades: {0:0,1:0,2:0,10:0,11:0,12:0,20:0,21:0,22:0},
//challenge
challenge:0,
completedChallenges:{0:0,1:0,2:0,3:0,4:0,5:0},
superChallenge: false,
completedsuperChallenges: 0,
//time
startTime: Date.now(),
lastTick: Date.now(),
machineTime: 0,
intervalTime: 20,
lastBought:0,
//objects
upgrades:{
money:0,
time:0,
hyper:0,
mega:0,
},
unlocks:{
golden:false,
challenges:false,
mega:false,
superChallenge: false,
void:false,
buildings:false,
},
autobuyers: [
{
time: 0,
upgrades:0,
bulk: false,
on: true,
},
{
time: 0,
upgrades:0,
bulk: false,
on: true,
},
{
time: 0,
upgrades:0,
bulk:false,
on: true,
},
{
time: 0,
upgrades:0,
bulk:false,
on: true,
},
{
time: 0,
upgrades:0,
on: true,
},
{
time: 0,
upgrades:0,
on: true,
},
],
void:{
abstracts: EN(0),
particles: EN(0),
},
buildingUpgrades:{
box:[0,0,0],
house:[0,0,0],
warehouse:[0,0,0],
machine:[0,0,0],
factory:[0,0,0],
government:[0,0,0]

},
//misc
notation:0,
precision:3,
base:16,
autosave:true,
saveInterval:1,
offlineProgress:true,
hotkeys:true,
tab:0,
}

let OG = copyObject(game)

load()

let reset = function(){
if(!confirm("Are you SURE you want to reset your game?")) return false
game = copyObject(OG)
game.startTime = game.lastTick = Date.now()
vue.game=game
}

let pluralize = function(x,y="s",z=""){
if((x instanceof ExpantaNum&&x.eq(1))||x===1) return z
return y
}

let saveInterval = game.autosave?setInterval(save,game.saveInterval*1000):0

let timePrices =function(x=game.upgrades.time){
if(game.challenge===2) return EN(10).pow(x**2+x*Math.sqrt(7)+7)
return EN(10).pow(x**2/2+x*3.5**0.5+7)
}
let moneyPrices = function(x=game.upgrades.money){
if(game.challenge===2) return EN(10).pow(20*(1.06**x-0.65))
return EN(10).pow(EN(10).times(EN(1.06).pow(x).sub(0.3)))
}
let megaPrices = function(x=game.upgrades.mega){
if(game.challenge===2) return EN(10).pow(EN(10).times(EN(10).tetr(x**0.3-1)))
return /*EN(10).tetr(x**0.3).times(EN(1e5).pow(x))*/EN(10).pow(EN(10).times(EN(10).tetr(x**0.275-1)))
}
let hyperPrices = function(x=game.upgrades.hyper){
if(game.challenge===2) return EN(10).pow(EN(10).times(EN(2).tetr(x**0.5)))
return /*EN(2).tetr(x**0.5).times(EN(1e10).pow(x))*/EN(10).pow(EN(10).times(EN(2).tetr(x**0.475-1)))
}


let goldenUpgrades = {
prices:{0:EN(1),1:EN(2),2:EN(3),3:EN(4),10:EN(4),11:EN(100),12:EN(9000),13:EN(2e20),20:EN(16),21:EN(5000),22:EN(2.7e7),23:EN(1e40),30:EN(1.844e19),31:EN(39.766e36),32:EN(3.79e154),33:EN("7.898e488")},
discriptions:{
0:"Decrease the machines' cost scailing",1:"Unlock hyper money upgrades",2:"Make the golden essence machine boost stronger",3:"Time upgrades give a 5% multiplicative boost to money gain",
10:"Power the 1st scailing multiplier to 0.8",11:"Make golden machines stronger",12:"Machines are stronger based on GP",13:"You can buy more than 19 time upgrades but they will not speed up your machiness",
20:"Square the machines needed for scailing to start (2¹²⁸=>2²⁵⁶)",21:"Golden machines are stronger based on GP",22:"Unlock challenges",23:"Machines and golden machines boost each other",
30:"Golden points gain is stronger based on Golden essence",31:"Normal upgrades boost golden machines",32:"Make the golden essense boost to golden machines stronger",33:"Make challenge 1, 5, and 6's effects stronger."
},
rewards:{
12:function(){return format(game.goldenPoints.cbrt().add(1).log10().add(1))},
21:function(){return format(game.goldenPoints.sqrt().add(1).log().add(1))},
30:function(){return `^${format(1/Math.log10(2**128))}-> ^${format(game.goldenEssence.logBase(100/(Math.PI*Math.E*Math.PHI)).min(74).div(1000).add(1/Math.log10(2**128)))}`}, 
},
}

let challenges = {
goals:[
[2.589997838440105e102,5.633421970326783e154,4.505462499388084e205],
['1e200','1e260','1e320'],
[1e20, 1e25, 1e30, 1e35, 1e40, 4.2009e69],
[1e25,1e50],
['1e350','1e400','1e450','1e500'],
['1e600','1e650','1e600','1e600','1e600','1e300000','1e500000','1e1000000','1e2e6','1e2.5e6','1e4e6','1e5e6','1e1e7','1e1e8'],
],
rewards:[
function(){return `make the game ${[20,25,33,0][game.completedChallenges[0]]}% faster`},
function(){return `remove ${["machines","upgrades","golden machines","nothing"][game.completedChallenges[1]]}'s cost`},
function(){return `unlock ${["hyper upgrades","mega upgrades","money upgrades","time upgrades","machines","golden machines","no"][game.completedChallenges[2]]} autobuyer`},
function(){return `unlock ${[3,4,0][game.completedChallenges[3]]} new upgrades`},
function(){return `make upgrades stronger`},
function(){return `Machine's price gets raised to ^${format(1-game.completedChallenges[5]/(game.goldenUpgrades[33]?15:25))} `},
],
maxCompletions:[3,3,6,2,4,5],
discriptions:[
function(){return `The game is ${game.completedChallenges[0]+2}x slower, but machine gain is multiplied by ${format(Math.sqrt(game.completedChallenges[0]+1.5))}`},
function(){return `Cost scaling is stronger`},
function(){return `You can only click to buy once every ${(1+game.completedChallenges[2])*10} seconds (golden doesn't count)`},
function(){return `Golden upgrades become downgrades (except hyper upgrades and post-c4 ones)`},
function(){return `You cannot buy upgrades, but the machines' money generating time is always at 50ms.`},
function(){return `Machines' price scaling is raised to the ${format(1.95+game.completedChallenges[5]/10)}th power `},
],
names:["Slow and steady","Buffed scaling","The anticlicker","Fool's gold","No upgrades?","The devil's price"]
}

let getCompletionPrice = function(x){
if(x===undefined) return EN(game.completedChallenges[game.challenge-1]>=challenges.maxCompletions[game.challenge-1]+(game.challenge===6?game.buildingUpgrades.factory[1]:0)?Infinity:challenges.goals[game.challenge-1][game.completedChallenges[game.challenge-1]]).pow(EN(5).sub(EN(game.voidUpgrades[10]).pow(2).log10().sqrt()).div(5))
return EN(game.completedChallenges[x]>=challenges.maxCompletions[x]+(x===5?game.buildingUpgrades.factory[1]:0)?Infinity:challenges.goals[x][game.completedChallenges[x]]).pow(EN(5).sub(EN(game.voidUpgrades[10]).pow(2).add(1).log10().sqrt()).div(5))
}

let autobuyers = {
0: {
startTime: 5000,
startPrice: 6.5e7,
name: 'hyper upgrades',
bulkPrice: 1e15
},
1: {
startTime: 3333,
startPrice: 40e6,
name: 'mega upgrades',
bulkPrice: 1e17
},
2: {
startTime: 2000,
startPrice: 8e6,
name: 'money upgrades',
bulkPrice: 1e11
},
3: {
startTime: 25000,
startPrice: 1.6e7,
name: 'time upgrades',
bulkPrice: 1e13
},
4: {
startTime: 1000,
startPrice: 4e6,
name: 'machines'
},
5: {
startTime: 100000,
startPrice: 2.56e11,
name: 'golden machines'
},
}

let superChallengeRewards={

0:{amt:15,req:()=>{return true},text:"keep 20 of each upgrade when going golden."},
1:{amt:25,req:()=>{return true},text:"money gain is multiplied by superchallenge completions."},
2:{amt:40,req:()=>{return true},text:"boost to money gain grows from n to n²-40n+40.",reward:function(){return game.completedsuperChallenges**2-game.completedsuperChallenges*40+40}},
3:{amt:70,req:()=>{return game.completedsuperChallenges>=50},text:"unlock sliding into the void"},
4:{amt:200,req:()=>{return game.buildingUpgrades.house[1]>=1},text:"make the \"Challenge yourself\" upgrade affect completion requirement"},
5:{amt:500,req:()=>{return game.buildingUpgrades.house[1]>=2},text:"Reduce the 1e4000 cost scailing in SCs, and start SCs with money"},
6:{amt:1000,req:()=>{return game.buildingUpgrades.house[1]>=3},text:"Make the 1st upgrade from the void building \"machine\" stronger"},
7:{amt:5000,req:()=>{return game.buildingUpgrades.house[1]>=4},text:"boost to money gain gets multiplied by n^(ln(n)*ln(ln(n)))",reward:function(){return EN(game.completedsuperChallenges).pow(Math.log(Math.log(game.completedsuperChallenges))*Math.log(game.completedsuperChallenges))}},
7:{amt:64000,req:()=>{return game.buildingUpgrades.house[1]>=4},text:"boost to money gain gets multiplied by n^(ln(n)*ln(ln(n)))"},
}

let voidUpgrades = {
particles:{
0:false,
1:false,
2:true,
10:true,
11:true,
12:false,
20:true,
21:false,
22:false,
},
prices:{
0:function(x=game.voidUpgrades[0]){return EN(1.35).pow(x).div(game.buildingUpgrades.box[2]+1)},
1:function(x=game.voidUpgrades[1]){return EN(1.05).pow(x).sub(EN(1.05).pow(x-1)).div(game.buildingUpgrades.box[2]+1)},
2:function(x=game.voidUpgrades[2]){return EN(2.5).pow(x).mult(1e50).div(game.buildingUpgrades.box[2]+1)},
10:function(x=game.voidUpgrades[10]){return EN(5.2).pow(x).div(game.buildingUpgrades.box[2]+1)},
11:function(x=game.voidUpgrades[11]){return EN(10).pow(x).div(game.buildingUpgrades.box[2]+1)},
12:function(x=game.voidUpgrades[12]){return EN(8.75).pow(x**2).mult(1e20).div(game.buildingUpgrades.box[2]+1)},
20:function(x=game.voidUpgrades[20]){return EN(10).pow(EN.E.pow(x)).div(game.buildingUpgrades.box[2]+1)},
21:function(x=game.voidUpgrades[21]){return EN(Math.exp(Math.exp(Math.E))).pow(x**2).div(game.buildingUpgrades.box[2]+1)},
22:function(x=game.voidUpgrades[22]){return EN(10).pow(x**2).div(game.buildingUpgrades.box[2]+1)},
},
effects:{
0:function(x=game.voidUpgrades[0]){return EN(x).add(Math.E).ln().pow(EN(x).add(10).slog())},
1:function(x=game.voidUpgrades[1]){return EN(1).sub(EN(x).add(1).slog().div(10))},
2:function(x=game.voidUpgrades[2]){return EN(x+1).ln().add(1).sqrt()},
10:function(x=game.voidUpgrades[10]){return EN(5).sub(EN(x).pow(2).add(1).log10().sqrt()).div(5)},
11:function(x=game.voidUpgrades[11]){return EN(x).pow(2).add(1)},
12:function(x=game.voidUpgrades[12]){return EN(x+1).log10().add(1)},
20:function(x=game.voidUpgrades[20]){return game.machines.root(x).max(1).log10().pow(x*0.1).max(1)},
21:function(x=game.voidUpgrades[21]){return game.void.particles.pow((x)**2).root(69)},
22:function(x=game.voidUpgrades[22]){return EN(1).add(x*Math.PI*Math.E/1000)},
},
discriptions:{
0:"Increase the gain of golden machines by investing in totally useful infrastructure that totally will not be thrown into the void",1:"Bribe the code of the game to make it a little bit more lenient and decrease the machine cost scailing by just a little bit",2:"Convince the money upgrades by pure argumentation to make themselves stronger so that you can keep getting more money when you buy them",
10:"Make challenges' requirements lower, allowing you to give yourself more time to focus on life's true challenges.",11:"Create works of art as long as they're not based on hate and you should be able to get a bigger multiplier on abstracts",12:"Use your void upgrades to strengthen the mega and hyper upgrades by a noticeable amount so that you can make even more money from them",
20:"Befriend the testers, and then ask them to ask the dev to make your machines give a boost to CP production",21:"Invade the developer's house with a knive or gun so that a boost to machines's production based on CP amount is coded",22:"Base the name of one of your children on an instrument and play this instrument to make the machines happier, giving them an exponent in production"
},
titles:{
0:"Invest in Infrastructure",1:"Bribe the code",2:"↑ money ↑ upgrades ↑ strength",
10:"Challenge yourself",11:"Spread Fiction",12:"Hyper Megavoid",
20:"Befriend the Testers",21:"Threaten the Developer",22:"Machine exponential",
}
}

let buildings = {
names:{0:"box",1:"house",2:"warehouse",3:"machine",4:"factory",5:"government"},
requirements:{"box":1e5,"house":1e18,"warehouse":1e100,"machine":1e8,"factory":1e80,"government":1e150},
upgrades:{
box:{
costs:{
0:function(x){
return EN('1e2500').pow(x+10).pow(2**x)
},
1:function(x){
return EN('1e500').pow(2**x*2)
},
2:function(x){
return EN(2).pow(x)
}
},costTypes:[0,1,2],
discriptions:{
0:"On resets, keep some money.",
1:"On resets, keep some GP",
2:"Make Golden/Void upgrades cost less"
}
},
house:{
costs:{
0:function(x){
return x>=100?ExpantaNum.POSITIVE_INFINITY:EN('1e6000').pow(x+1)
},
1:function(x){
return EN(['1e10000','1e15000','1e25000','1e50000','1e350000',Infinity][x])
},
2:function(x){
return x>=2?ExpantaNum.POSITIVE_INFINITY:EN(1e10).pow(x+2)
}
},costTypes:[0,1,2],
discriptions:{
0:"Keep challenges on reset (x%)",
1:"Unlock new effects for the superchallenge",
2:"Unlock new void upgrades"
}
},
warehouse:{
costs:{
0:function(x){
return EN(['1e45000000',Infinity][x])
},
1:function(x){
return EN('1e10000').pow((x+1)**2)
},
2:function(x){
return EN(2).pow(x**Math.E).floor()
}

},costTypes:[0,1,2],
discriptions:{
0:"Keep golden upgrades on resets",
1:"",
2:"Cost scaling requires more machines"
}
},
machine:{
costs:{
0:function(x){
return EN(10).pow(x**(x>=500?0.75:0.5))
},
1:function(x){
return EN('1e1000').pow((1+x)**1.33)
},
2:function(x){
return EN('1e50000').pow(x>=5000?(x-1)**1.25:x>=1000?x:((1+x)**(0.75)))
}

},costTypes:[2,1,0],
discriptions:{
0:"Multiply CP production ( x^π )",
1:"Power GE production",
2:"Triple money production"
}
},
factory:{
costs:{
0:function(x){
return EN(Math.PI).pow(Math.PHI).pow(x**2)
},
1:function(x){
return x>=9?ExpantaNum.POSITIVE_INFINITY:EN(10).pow(50).pow(EN(Math.sqrt(3)).pow(x**Math.SQRT2)).mult('1e50000')
},
2:function(x){
return EN(2e10).pow(EN(x).pow(5).div(2))
}

},costTypes:[2,1,0],
discriptions:{
0:"Make the time upgrades stronger",
1:"+1 challenge 6 max completions",
2:"weaken the 1e90k SC cost scaling"
}
},
government:{
costs:{
0:function(x){
},
1:function(x){
},
2:function(x){
}

},costTypes:[0,2,2],
discriptions:{

}
}
}
}