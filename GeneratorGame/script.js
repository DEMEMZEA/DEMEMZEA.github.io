"use strict"

let runtime = function(time=Date.now()-game.lastTick){
game.lastTick = Date.now()

if(game.superChallenge||game.challenge===1) time/=game.completedChallenges[0]+2
else time/=((5-game.completedChallenges[0])*0.2)**(game.goldenUpgrades[33]?3:1)

game.lastBought = Math.max(game.lastBought-time,0)
game.machineTime+=time
let machineGainTime = 1000-(Math.min(game.upgrades.time,19)*50)
if(game.superChallenge||game.challenge===5) machineGainTime = 50

if(game.machineTime>=machineGainTime){
    game.money = game.money.add(game.machines.times(machineGain()).times(Math.floor(game.machineTime/machineGainTime)))
    game.machineTime%=machineGainTime

}

for(let i=0;i<game.completedChallenges[2];i++){
game.autobuyers[i].time+=time
if(game.autobuyers[i].on&&game.autobuyers[i].time>=Math.max(50,autobuyers[i].startTime/2**game.autobuyers[i].upgrades)){
    handleTextbuy(autobuyers[i].name.split(" ")[0],true)
game.autobuyers[i].time%=Math.max(50,autobuyers[i].startTime/2**game.autobuyers[i].upgrades)
} 
}

if(!game.unlocks.superChallenge){
    let scu = 0
    for(let chall in game.completedChallenges){
    if(game.completedChallenges[chall]<challenges.maxCompletions[chall]) continue
    scu++
    }
    if(scu===6)game.unlocks.superChallenge = true
}
if(!game.unlocks.mega&&game.money.gte(2**64)) game.unlocks.mega = true
if(!game.unlocks.buildings&&game.void.particles.gte(1e5)) game.unlocks.buildings = true

game.goldenEssence = game.goldenEssence.add(calculateEssenceGain().times(time/1000))
game.void.particles = game.void.particles.add(calculateConcreteGain().times(time/1000))

}

let loop = setInterval(runtime, game.intervalTime);

let setTime = function(){
clearInterval(loop)
let diff = Date.now()-game.lastTick
if(diff<game.intervalTime){
    setTimeout(function(){
        runtime()
        loop = setInterval(runtime, game.intervalTime);
    }, game.intervalTime-diff)
}
else{
    loop = setInterval(runtime, game.intervalTime);
}
}

let toggleAutosave = function(){
if(game.autosave)clearInterval(saveInterval) 
if(!game.autosave)saveInterval = setInterval(save,game.saveInterval*1000) 
game.autosave = !game.autosave
}

let setSaveTime = function(){
if(!game.autosave) return false
save()
clearInterval(saveInterval)
saveInterval = setInterval(save,game.saveInterval*1000)
}

let toggleOffline = function(){
game.offlineProgress=!game.offlineProgress
}

let toggleHotkeys = function(){
game.hotkeys=!game.hotkeys
}

let buyMachines = function(x,auto=false){
if(game.lastBought!==0) return false
if(game.superChallenge||game.challenge===3) game.lastBought=(1+game.completedChallenges[2])*10000*(1-auto)
let price = machinePrice()
if(x===0&&game.money.gte(price)){
    if(game.completedChallenges[1]<1) game.money = game.money.sub(price)
    game.machines = game.machines.add(1)
}

if(x===1&&game.money.gte(price)){
    if(game.completedChallenges[1]>=1){
    game.machines = game.machines.max(game.money.div(price).floor())
    return
    }
    game.machines = game.machines.add(game.money.div(price).floor())
    if(game.money.div(price).gte(1e10)) game.money = EN(0)
    else game.money = game.money.mod(price)
}
}

let buyGolden = function(x){
const priceMult = ExpantaNum(2).root(concreteParticlesEffect(1))
if(x===0&&game.goldenPoints.gte(priceMult.pow(game.goldenMachines))){
    if(game.completedChallenges[1]<3) game.goldenPoints = game.goldenPoints.sub(priceMult.pow(game.goldenMachines))
    game.goldenMachines++
}
if(x===1&&game.goldenPoints.gte(priceMult.pow(game.goldenMachines))){
    let factor = priceMult.pow(game.goldenMachines).sub(1).div(priceMult.sub(1))
    let gain = game.goldenPoints.add(factor).mult(priceMult.sub(1)).add(1).logBase(priceMult).floor().toNumber()
    let loss = game.goldenPoints.sub(priceMult.pow(gain).sub(1).div(priceMult.sub(1))).add(factor)
    game.goldenMachines = gain
    if(game.completedChallenges[1]<3) game.goldenPoints = loss
}
}

let buyUpgrades = function(x,auto=false){
if(game.lastBought!==0) return false
if(game.superChallenge||game.challenge===5) return false
if(game.superChallenge||game.challenge===3) game.lastBought=(1+game.completedChallenges[2])*10000*(1-auto)
if(x===0&&game.upgrades.time<(game.goldenUpgrades[13]?Infinity:19)&&game.money.gte(timePrices())){
    if(game.autobuyers[3].bulk){
        if(game.superChallenge||game.challenge===2){
            game.upgrades.time = Math.min(Math.floor((-Math.sqrt(7)+Math.sqrt(7-4*1*(7-game.money.log10())))/(2*1))+1,game.goldenUpgrades[13]?Infinity:19)
            if(game.completedChallenges[1]<2) game.money = game.money.sub(timePrices(Math.min(Math.floor((-Math.sqrt(7)+Math.sqrt(7-4*1*(7-game.money.log10())))/(2*1)+1),game.goldenUpgrades[13]?Infinity:19)-1))
            }
        else{
            game.upgrades.time = Math.min(Math.floor((-Math.sqrt(7/2)+Math.sqrt(7/2-4*0.5*(7-game.money.log10())))/(2*0.5))+1,game.goldenUpgrades[13]?Infinity:19) 
            if(game.completedChallenges[1]<2) game.money = game.money.sub(timePrices(Math.min(Math.floor((-Math.sqrt(7/2)+Math.sqrt(7/2-4*0.5*(7-game.money.log10())))/(2*0.5)+1),game.goldenUpgrades[13]?Infinity:19)-1))
        }
    }
    else{
        if(game.completedChallenges[1]<2) game.money = game.money.sub(timePrices())
        game.upgrades.time++
    }
}
if(x===1&&game.money.gte(moneyPrices())){
    if(game.autobuyers[2].bulk){
        if(game.superChallenge||game.challenge===2){
            game.upgrades.money = game.money.log10().div(20).add(0.65).logBase(1.06).floor().add(1).toNumber()
            if(game.completedChallenges[1]<2) game.money = game.money.sub(moneyPrices(game.money.log10().div(20).add(0.65).logBase(1.06).floor().toNumber()))
        }
        else{
            game.upgrades.money = game.money.log10().div(10).add(0.3).logBase(1.06).floor().add(1).toNumber()
            if(game.completedChallenges[1]<2) game.money = game.money.sub(moneyPrices(game.money.log10().div(10).add(0.3).logBase(1.06).floor().toNumber()))
        }
    }
    if(game.completedChallenges[1]<2) game.money = game.money.sub(moneyPrices())
    game.upgrades.money++
}
if(x===2&&game.money.gte(megaPrices())){
    if(game.autobuyers[1].bulk){
        if(game.superChallenge||game.challenge===2){
            game.upgrades.mega = game.money.log10().div(10).slog(10).add(1).pow(1/0.3).floor().add(1).toNumber()
            if(game.completedChallenges[1]<2) game.money = game.money.sub(megaPrices(game.money.log10().div(10).slog(10).add(1).pow(1/0.3).floor().toNumber()))
        }
        else{
            game.upgrades.mega = game.money.log10().div(10).slog(10).add(1).pow(1/0.275).floor().add(1).toNumber()
            if(game.completedChallenges[1]<2) game.money = game.money.sub(megaPrices(game.money.log10().div(10).slog(10).add(1).pow(1/0.275).floor().toNumber()))
        }
    }
    else{
    if(game.completedChallenges[1]<2) game.money = game.money.sub(megaPrices())
    game.upgrades.mega++
    }
}
if(x===3&&game.money.gte(hyperPrices())){
    if(game.autobuyers[0].bulk){
            if(game.superChallenge||game.challenge===2){
                game.upgrades.hyper = game.money.log10().div(10).slog(2).add(0).pow(2).floor().add(1).toNumber()
                if(game.completedChallenges[1]<2) game.money = game.money.sub(hyperPrices(game.money.log10().div(10).slog(2).add(0).pow(2).floor().toNumber()))
            }
            else{
                game.upgrades.hyper = game.money.log10().div(10).slog(2).add(1).pow(1/0.475).floor().add(1).toNumber()
                if(game.completedChallenges[1]<2) game.money = game.money.sub(hyperPrices(game.money.log10().div(10).slog(2).add(1).pow(1/0.475).floor().toNumber()))
            } 
    }
    else{
        if(game.completedChallenges[1]<2) game.money = game.money.sub(hyperPrices())
        game.upgrades.hyper++
    }
}
}

let golden = function(forced=false,challenge=false){
let gain = calculateGoldenGain()
if(!forced&&gain.lt(1)&&game.challenge===0) return false
if(!game.unlocks.golden)game.unlocks.golden=true
if(game.superChallenge&&!forced){
game.completedsuperChallenges = Math.max(game.completedsuperChallenges,game.money.add(game.machines.times(5e5)).logBase(getSCCompletionPrice()).floor().toNumber())
game.superChallenge = false
}
if(game.challenge!==0){
    if(game.money.add(game.machines.times(5e5)).gte(getCompletionPrice(game.challenge-1))&&challenges.maxCompletions[game.challenge-1]+(game.challenge===6?game.buildingUpgrades.factory[1]:0)>game.completedChallenges[game.challenge-1]){
        game.completedChallenges[game.challenge-1]++
    }
    game.challenge = 0
}
game.money = game.money.pow(forced?0:Math.sqrt(game.completedsuperChallenges)/(1+Math.sqrt(game.completedsuperChallenges))).sub(1)
game.money = game.money.max(challenge||game.buildingUpgrades.box[0]<1?0:EN('1e25000').pow(2**(game.buildingUpgrades.box[0]-1)))
if(game.superChallenge&&forced) game.money = game.money.max(getSCCompletionPrice().pow(Math.sqrt(game.completedsuperChallenges)/(1+Math.sqrt(game.completedsuperChallenges))*game.completedsuperChallenges))
game.machineTime=0
game.machines = game.machines.pow(forced?0:Math.sqrt(game.completedsuperChallenges)/(1+Math.sqrt(game.completedsuperChallenges)))
game.upgrades.money = game.upgrades.time = game.upgrades.mega = game.upgrades.hyper = hasSCMilestone(0)?20:0
game.goldenPoints = game.goldenPoints.plus(gain)
}

let enterChallenge = function(x){
if(game.challenge===3&&x!==3) game.lastBought=0
if(x===game.challenge) return false
if(x===0){
if(game.money.add(game.machines.times(5e5)).gte(getCompletionPrice())||confirm("are you sure you want to exit this challenge?")){
    golden(true,false)
    game.challenge=0
    return true
    }
}
if(game.challenge===0){
    golden(true,true)
    game.challenge=x
    return true
}
if((game.challenge!==0&&x!==0)&&confirm("You are already on a challenge, do you want to leave to start another?\nIF YOU CAN COMPLETE A CHALLENGE PLEASE DO IT BECAUSE THIS MIGHT NOT COMPLETE THE CHALLENGE FOR YOU")){
    golden(true,true)
    game.challenge=x
    return true
}
return false
}

let buyGoldenUpgrades = function(x){
if(game.goldenUpgrades[x]) return false
if(x>=9&&game.goldenUpgrades[x-10]!==true) return false
if(game.goldenPoints.gte(goldenUpgrades.prices[x].div(game.buildingUpgrades.box[2]+1))){
game.goldenPoints = game.goldenPoints.sub(goldenUpgrades.prices[x].div(game.buildingUpgrades.box[2]+1))
if(!game.unlocks.challenges&&x===22) game.unlocks.challenges=true
game.goldenUpgrades[x] = true
}
}

let handleTextbuy = function(x,auto){
if(x==="machines") buyMachines(1,auto)
if(x==="golden") buyGolden(1)
if(x==="mega") buyUpgrades(2,auto)
if(x==="hyper") buyUpgrades(3,auto)
if(x==="money") buyUpgrades(1,auto)
if(x==="time") buyUpgrades(0,auto)
}

let upgradeAuto = function(x){
if(x>=6){
    x-=6
    if(game.autobuyers[x].bulk) return false
    if(autobuyers[x].startTime/50>2**game.autobuyers[x].upgrades) return false
    if(game.goldenPoints.lt(autobuyers[x].bulkPrice)) return false
    game.goldenPoints = game.goldenPoints.sub(autobuyers[x].bulkPrice)
    game.autobuyers[x].bulk=true
}
if(autobuyers[x].startTime/50<2**game.autobuyers[x].upgrades) return false
if(game.goldenPoints.lt(3**game.autobuyers[x].upgrades*autobuyers[x].startPrice)) return false
game.goldenPoints = game.goldenPoints.sub(3**game.autobuyers[x].upgrades*autobuyers[x].startPrice)
game.autobuyers[x].upgrades++
}

let enterSuperChallenge = function(){
if(game.superChallenge){
game.completedsuperChallenges = Math.max(game.completedsuperChallenges,game.money.add(game.machines.times(5e5)).logBase(getSCCompletionPrice()).floor().toNumber())
game.superChallenge = false
}
else game.superChallenge = true

golden(true,game.superChallenge)
}

onkeydown = function(x){
let key = x.key.toLowerCase()
if(key==="m"&&game.tab===4){
if(subtab.void===0) maxBuyVoidUpgrades()
if(subtab.void===1) maxBuyBuildingUpgrades()
}
else if(key==="m") buyMachines(1-x.shiftKey)
else{
let matchingvalues = {t:"time",u:"money",s:"mega",h:"hyper",g:"golden"}
handleTextbuy(matchingvalues[key])
}
}

let slide = function(forced=false){
if(!forced&&calculateAbstractGain().lte(0)) return false
if(!game.unlocks.void) game.unlocks.void=true
game.abstracts = game.abstracts.add(calculateAbstractGain())
if(game.buildingUpgrades.house[0]<100){
for(let autobuyer of game.autobuyers){
autobuyer.time=0
autobuyer.upgrades=0
if(autobuyer.bulk) autobuyer.bulk=false
}
}
for(let upgrade in game.goldenUpgrades){game.goldenUpgrades[upgrade]=(game.goldenUpgrades[upgrade]*game.buildingUpgrades.warehouse[0])===1}
for(let challenge in game.completedChallenges){game.completedChallenges[challenge]=Math.floor(game.completedChallenges[challenge]*game.buildingUpgrades.house[0]/100)}
for(let upgrade in game.upgrades){game.upgrades[upgrade]=0}
game.unlocks.golden = false
game.unlocks.challenges = false
game.unlocks.mega = false
game.unlocks.superChallenge = game.unlocks.buildings
game.machines = EN(1)
game.money = EN(0).max(game.buildingUpgrades.box[0]>=1?EN('1e25000').pow(2**game.buildingUpgrades.box[0]/2):0)
game.machineTime = 0
game.goldenMachines = 0
game.goldenEssence = EN(0)
game.goldenPoints = EN(0).max(game.buildingUpgrades.box[1]>=1?EN('1e500').pow(2**game.buildingUpgrades.box[1]/2):0)
game.completedsuperChallenges = Math.floor(game.completedsuperChallenges*(game.buildingUpgrades.house[0]/100))
}

let throwVoid=function(percentage=0){
game.void.abstracts = game.void.abstracts.add(game.abstracts.div(100).times(percentage).floor())
game.abstracts = game.abstracts.sub(game.abstracts.div(100).times(percentage).floor())
}

let buyVoidUpgrade = function(x){
if(voidUpgrades.particles[x]&&game.void.particles.gte(voidUpgrades.prices[x]())){
game.void.particles = game.void.particles.sub(voidUpgrades.prices[x]())
game.voidUpgrades[x]++
return true
}
if(!voidUpgrades.particles[x]&&game.abstracts.gte(voidUpgrades.prices[x]())){
game.abstracts = game.abstracts.sub(voidUpgrades.prices[x]())
game.voidUpgrades[x]++
return true
}
return false
}

let canBuyBuildingUpgrade = function(building,upgrade){
let cost = buildings.upgrades[building].costs[upgrade](game.buildingUpgrades[building][upgrade])
let costType = buildings.upgrades[building].costTypes[upgrade]
let currencyAmt = [game.money,game.goldenPoints,game.abstracts]
return currencyAmt[costType].gte(cost)
}

let buyBuildingUpgrade = function(building,upgrade){
let cost = buildings.upgrades[building].costs[upgrade](game.buildingUpgrades[building][upgrade])
let costType = buildings.upgrades[building].costTypes[upgrade]
let currencyAmt = [game.money,game.goldenPoints,game.abstracts]
if(currencyAmt[costType].gte(cost)){
game.buildingUpgrades[building][upgrade]++
return true
}
return false
}

let getSCCompletionPrice = function(){
return EN(1e10).pow(format(hasSCMilestone(4)?EN(5).sub(EN(game.voidUpgrades[10]).pow(2).log10().sqrt()).div(5):1))
}

let hasSCMilestone = function(milestone){
return game.completedsuperChallenges>=superChallengeRewards[milestone].amt&&superChallengeRewards[milestone].req()
}

let maxBuyVoidUpgrades = function(){
for(let i in voidUpgrades.titles){
while (buyVoidUpgrade(i)){}
}
}

let maxBuyBuildingUpgrades = function(){
for(let i in buildings.upgrades){
for(let x of [0,1,2]){
while (buyBuildingUpgrade(i,x)){}
}
}
}

