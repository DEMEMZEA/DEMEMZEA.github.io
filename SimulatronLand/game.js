"use strict"
let tabs = 3
let currentTab = 0
let round = 0
let auto = false
let autoTimeout = 1
let options = {
radius: 10,
simulatronAmount: 1000,
extraStrategies:{forgiving,titForTwoTats,rando},
playerStrategies:{},
activeStrategies:{forgiving:true,titForTwoTats:true,rando:true},
failureChances:{cooperation:0,betrayal:0},
spawnWeight:{far:1,close:1,exact:1},
}
let game = document.getElementById("game")
function newStrat(){
let el = document.getElementById("newstrat")
let name = el.children[0].value
let color = el.children[2].value
let func = el.children[4].value
options.playerStrategies["Player_"+Object.keys(options.playerStrategies).length]=new StrategyTemplate({name,color,evaluate:func})
options.activeStrategies["Player_"+(Object.keys(options.playerStrategies).length-1)]=true
el.children[0].value = ''
el.children[2].value = ''
el.children[2].style.color="#000000"
el.children[4].value = ''

}
let placeSimulatron = function(simulatron){
let element = document.createElement("SPAN")
element.classList.add("simulatron")
element.style.backgroundColor = "#"+simulatron.strategy.color
element.style.top = element.top = `calc(50% ${(simulatron.position[0]>=0?"+ ":"- ")+Math.abs(simulatron.position[0])*500/simulation.radius}px)`
element.style.left = element.left = `calc(50% ${(simulatron.position[1]>=0?"+ ":"- ")+Math.abs(simulatron.position[1])*500/simulation.radius}px)`
element.name = simulatron.strategy.name
game.appendChild(element)
}
let removeSimulatrons = function(){
game.innerHTML = ''
}
let startGame = function(){
removeSimulatrons()
/*
let object = {extraStrategies:{forgiving,titForTwoTats}}
if(confirm("You've chosen to start a new game, wanna choose the configs to start it?")){
let failureChoice = prompt("What do you want the chance of the failures to be? (0-100)% (more than or equal to 50% does not make sense)")
if(!isNaN(failureChoice)&&failureChoice>0&&failureChoice<100) object.failureChance = failureChoice/100
if(confirm("Great! You've chosen the failure chance, now, if you want, you can choose the spawn chance. There are 3 types of spawns. \"Far\" means random spawns, \"Close\" means spawns in squares close to the parent, and \"Exact\" ( which is 100-Far-Close)%, and you cannot choose this one, as it is just mathematically defined. It means spawns in their parent's square. Just know that any type of less inclusive spawning also includes the most inclusive spawning squares. The usual distribution is 1/3 to each, jsyk")){
object.spawnChance={}
let farChoice = prompt("What do you want the chance of the far (randomly placed) spawns to be? (0-100)% (you'll have another option, and they cannot sum to more than 100%)")
let closeChoice = prompt("What do you want the chance of the close (placed close to their parent) spawns to be? (0-100)% (you'll have another option, and they cannot sum to more than 100%)")
if(!isNaN(farChoice)&&farChoice>0&&farChoice+closeChoice<100) object.spawnChance.far = farChoice/100
if(!isNaN(closeChoice)&&closeChoice>0&&closeChoice+farChoice<100) object.spawnChance.close = closeChoice/100
}
}
*/
simulation = new Simulation(options)
if(round){
round = 0
}
round++
document.getElementById("start").textContent="Res"
for(let element of document.getElementsByClassName("gameStarted"))element.style.display=""
for(let sim of simulation.simulatrons){
placeSimulatron(sim)
}
}
let nextRound = function(){
round++
let val = simulation.simulateRound()
removeSimulatrons()
for(let sim of simulation.simulatrons){
placeSimulatron(sim)
}
return val
}
let toggleAuto = function(event){
if(event?.srcElement.nodeName!=="INPUT"){
auto = !auto
document.getElementById("auto").textContent=["Off","On"][0+auto]
if(auto) autoRound()
}
}
let autoRound = function(){
if(auto) {
if(nextRound())setTimeout(autoRound,autoTimeout)
else toggleAuto()
}
}
let setAutoTimeout = function(){
let number = Number(document.getElementById("autoTimeout").value)
if(number<=0) document.getElementById("autoTimeout").value = number = 1
if(number>20000) document.getElementById("autoTimeout").value = number = 20000
document.getElementById("autoTimeout").style.width=1+1.5*(number.toString().length)+"vmax"
autoTimeout = number
}
let tab = function(x){
if(typeof(x)==="number")currentTab = x
else return currentTab
save()
if(x!==0){
auto=false
document.getElementById("auto").textContent="Off"
}
    for(let i=0;i<tabs;i++){
    let el = document.getElementById("tabButton_"+i)
    if(i!==currentTab){
    el.style.display=""
    } 
    else el.style.display="none"
    let sel = document.getElementById("tab_"+i)
    if(i===currentTab) sel.style.display=""
    else sel.style.display="none"
    }
if(x===2){
let stratsEl = document.getElementById("strats")
stratsEl.innerHTML=''
for(let strategy in simulation.totalStrategies ){
let evaluate = simulation.totalStrategies[strategy].evaluate
let el = document.createElement("div")
stratsEl.appendChild(el)
el.outerHTML=`<div class="strat"><span class="name" style=" color: #${simulation.totalStrategies[strategy].color}" >${simulation.totalStrategies[strategy].name}<input type="checkbox" onclick=\"${Object.keys(options.extraStrategies).includes(strategy)?`options.activeStrategies.${strategy}=!options.activeStrategies.${strategy}`:'this.checked=true'}\"  ${Object.keys(options.extraStrategies).includes(strategy)?(options.activeStrategies[strategy]?" checked":""):" checked"}></span><br>
function(selfChoices,opponentChoices,round)<br>
<textarea ${Object.keys(options.playerStrategies).includes(strategy)?`onchange='options.playerStrategies["${strategy}"].evaluate=this.value'`:"disabled"}>${evaluate}</textarea></div>`
}
}
else{
document.getElementById("strats").innerHTML=''
}
}

function save(){
localStorage.setItem("options",JSON.stringify(options))
if(localStorage.getItem("id")===null)
localStorage.setItem("id",String(Date.now())+"-"+String(Math.random()).split(".")[1])
}

function load(){
let val = localStorage.getItem("options")
if(val){
val = JSON.parse(val)
options = val
for(let strat in options.extraStrategies){
options.extraStrategies[strat] = new StrategyTemplate(options.extraStrategies[strat])
}
for(let strat in options.playerStrategies){
options.playerStrategies[strat] = new StrategyTemplate(options.playerStrategies[strat])
}
options.failureChances.cooperation*=100
options.failureChances.betrayal*=100
for(let child of document.getElementById("options").children){
if(!child.childElementCount) continue
for(let subChild of child.children){
if(!subChild.value) continue
if(subChild.type === "number") subChild.value = eval(subChild.onchange.toString().split(" ")[2].split("\n")[1])
if(subChild.type === "checkbox") subChild.checked = eval(subChild.onchange.toString().split(" ")[2].split("\n")[1])
}
}
options.failureChances.cooperation/=100
options.failureChances.betrayal/=100
}
document.body.style.display=""
}
load()
tab(0)
let simulation = new Simulation(options)