"use strict"
//gain

let machineGain = function(){
return EN(250).pow(voidUpgrades.effects[2]()).times(game.upgrades.money).add(2500)
.times(goldenEssenceMultiplier(0))
.times(upgradeEffect(0))
.times(upgradeEffect(1))
.times((game.goldenUpgrades[12]?game.goldenPoints.cbrt().add(1).log10().add(1):EN(1)).pow(1-(game.superChallenge||game.challenge===4)*1.5))
.times((game.superChallenge||game.challenge===1?Math.sqrt(game.completedChallenges[0]+1.5):1)**(1+game.completedChallenges[4]*2/7+(game.goldenUpgrades[33]?4/21:0)))
.times((game.goldenUpgrades[3]?EN(1+0.05*(1+game.buildingUpgrades.factory[0])).pow(game.upgrades.time).cap(1e10,0.25,1).cap(1e20,0.1,1):EN(1)).pow(1+game.completedChallenges[4]*2/7+(game.goldenUpgrades[33]?4/21:0)))
.times(game.goldenUpgrades[23]?game.goldenMachines**0.5:1)
.times(hasSCMilestone(2)?game.completedsuperChallenges**2-40*game.completedsuperChallenges+40:(hasSCMilestone(1)?game.completedsuperChallenges:1))
.times(voidUpgrades.effects[0]())
.times(game.superChallenge?(1+game.buildingUpgrades.machine[2]**(hasSCMilestone(6)?Math.log10(game.buildingUpgrades.machine[2]):1)):EN(3).pow(game.buildingUpgrades.machine[2]))
.times(voidUpgrades.effects[21]())
.times(hasSCMilestone(7)?EN(game.completedsuperChallenges).pow(Math.log(Math.log(game.completedsuperChallenges))*Math.log(game.completedsuperChallenges)):1)
.pow(voidUpgrades.effects[22]())
}


let calculateGoldenGain = function(x=game.money.add(game.machines.times(5e5))){
let gain = x.pow(1/Math.log10(2**128)+(game.goldenUpgrades[30]?game.goldenEssence.logBase(100/(Math.PI*Math.E*Math.PHI)).min(74).div(1000).toNumber():0)).div(10).floor()
if(gain.gte(1e300)) gain = gain.div(1e300).pow(0.8).times(1e300)
if(gain.gte('1e1000')) gain = EN(10).pow(gain.log10().sub(1e3).pow(0.9).add(1e3))
if(gain.gte('1e50000')) gain = EN(10).pow(gain.log10().sub(50000).pow(0.9).add(50000))
if(gain.gte('1e250000')) gain = gain.div('1e250000').pow(0.1).mult("1e250000")
return gain
}

let calculateAbstractGain = function(x=game.money.add(game.machines.times(5e5))){
let gain = x.div('1e100000').root(30000).floor()
if(gain.gte(2.5e6)) gain=gain.div(2.5e6).cbrt().mult(2.5e6)
if(gain.gte(1e20)) gain = EN(10).pow(gain.log10().sub(20).pow(0.5).add(20))
if(gain.gte(1e50)) gain = gain.div('1e50').cbrt().mult('1e50')
return gain
}

let calculateEssenceGain = function(){
let a = EN(game.goldenMachines)
.pow(2)
.times(goldenEssenceMultiplier(1))
if(game.goldenUpgrades[11]&&game.challenge!==4) a = a.pow(a.pow(0.2).add(1).log10().add(1).log10().add(1))
if(game.goldenUpgrades[21]&&game.challenge!==4) a = a.times(game.goldenPoints.sqrt().add(1).log().add(1))
if(game.superChallenge||game.challenge===4) a = a.root(a.pow(0.2).add(1).log10().add(1).log10().add(1))
if(game.superChallenge||game.challenge===4) a = a.div(game.goldenPoints.sqrt().add(1).log().add(1))
if(game.goldenUpgrades[23]) a = a.times(game.machines.log10().max(1))
if(game.goldenUpgrades[31]) a = a.times(EN(1+0.05*(1+game.buildingUpgrades.factory[0])).pow(game.goldenUpgrades[3]?game.upgrades.time:0).mult(Math.sqrt(1+game.upgrades.hyper)).mult(1+Math.log2(1+game.upgrades.mega)/2).mult(1+0.1*game.upgrades.money).pow(1+game.completedChallenges[4]*2/7))
a = a.pow(game.buildingUpgrades.machine[1]+1)
return a
}

let calculateConcreteGain = function(x=game.void.abstracts){
let gain = x.add(1).pow(x.add(1).slog()).sub(1)
gain = gain.mult((game.buildingUpgrades.machine[0]+1)**Math.PI)
return gain
}

//price

let machinePrice = function(x=game.machines){
let price = EN(5e5)
let np = price.div(concreteParticlesEffect(0))
x = x.pow(100/(100+game.buildingUpgrades.warehouse[2]))
if(x.gte(2**(game.superChallenge||game.challenge===4?64:128*(1+game.goldenUpgrades[20])))) price = price.times(x.div(2**(game.superChallenge||game.challenge===4?64:128*(1+game.goldenUpgrades[20]))).logBase(game.superChallenge||game.challenge===4?1000:game.goldenUpgrades[0]&&!(game.superChallenge||game.challenge===2)?10:2).add(1).pow(game.superChallenge||game.challenge===4?1.25:4/(4+game.goldenUpgrades[22]))).floor()
if(x.gte(2**1023-2**971+2**1023)) price = price.times(EN(10).pow(x.root(1024).max(1).times(game.challenges===2?1:2/3).min(4)))
if(x.gte('1e1000')) price = price.times(x.log10().pow(2/3))
if(x.gte('1e4000')) price = price.pow(x.slog(Math.PHI).add(1).logBase(x.log10()).add(1)).pow(1+(game.superChallenge||game.challenge===4)*0.5/(1+4*hasSCMilestone(5)))
if(x.gte('1e10000')) price = price.times(x.log10().pow(x.log10().div(1000).cbrt()))
if(x.gte('1e20000')) price = price.pow(10/9+x.slog().add(1).log10().add(1).log10().add(1).log10().toNumber())
if(x.gte('1e90000')) price = price.times(x.log10().pow(game.superChallenge?x.ln().div(10000*(1+game.buildingUpgrades.factory[2])**(1/3)):x.log10().div(100000).min(2)))
if(x.gte('1e200000')) price = price.pow(1.125).times(1000)
if(x.gte('1e1000000')) price = price.times(EN(10).pow(x.div('1e1000000').root(10000).log10().sqrt()))
if(x.gte('1e5000000')) price = price.pow(x.logBase('1e10000000').add(1).min(Math.E).add(x.div(EN('1e10000000').pow(Math.E)).max(1).logBase('1e10000000').sqrt()))
if(x.gte('1e10000000')) price = price.times(x.ln().pow(x.log10().log10()))
if(x.gte('1e40000000')) price = price.times(EN(10).pow(x.log10().pow(0.4)))
if(x.gte('1e90000000')) price = price.times('1.913499966886653e2718')
if(x.gte('1e250000000')) price = price.pow(price.log10().log10().pow(Math.PHI/(Math.PHI+Math.log(1+game.buildingUpgrades.warehouse[1]))))
if(game.superChallenge||game.challenge===6) price=price.div(5e5).pow(1.95+game.completedChallenges[5]/10).times(5e5)
price = price.pow(1-game.completedChallenges[5]/(game.goldenUpgrades[33]?15:25))
price = price.div(concreteParticlesEffect(0))
price = price.div(np).pow(voidUpgrades.effects[1]()).times(np)
return price
}

//effect

let goldenEssenceMultiplier = function(x){
if(x===0) return game.goldenEssence.add(1).logBase(game.superChallenge||game.challenge===4?1e5:game.goldenUpgrades[2]?Math.PHI:10).add(1).log10().add(1).tetr(2)
if(x===1) return game.goldenEssence.add(1).logBase(game.superChallenge||game.challenge===4?100:game.goldenUpgrades[2]?Math.PI:10).add(1).logBase(game.superChallenge||game.challenge===4?100:game.goldenUpgrades[2]?Math.PI:10).add(1).logBase(game.superChallenge||game.challenge===4?100:game.goldenUpgrades[2]?Math.PI:10).add(1).tetr(2).pow(game.goldenUpgrades[32]?game.goldenEssence.add(1).log10().add(1).log10().add(1):1)
}

let concreteParticlesEffect = function(x){
if(x===0) return game.void.particles.add(10).log10()
if(x===1) return game.void.particles.add(Math.exp(Math.E)).log().log()
}

let upgradeEffect = function(x){
let mult
if(x===0) mult = EN(Math.sqrt(1+game.upgrades.hyper)).pow(1+game.completedChallenges[4]*2/7+(game.goldenUpgrades[33]?4/21:0))
if(x===1) mult = EN(1+Math.log2(1+game.upgrades.mega)/2).pow(1+game.completedChallenges[4]*2/7+(game.goldenUpgrades[33]?4/21:0))
return EN(10).pow(mult.add(10).log10().pow(voidUpgrades.effects[12]())).sub(10)
}

//size

let calculateSCHeight = function(){
let unlockedRewards = 0
for(let i in superChallengeRewards){
if(superChallengeRewards[i].req()) unlockedRewards++
}
return {height:`calc(21vh+${1.25*unlockedRewards}vmin)`}
}

let calculateHoleSize = function(){
let height = 5+game.void.abstracts.max(1).log10().times(0.05).min(5).toNumber()
height+="%"
return {height,width:height}
}

//misc

let buyableGoldenMachinesInfo = function(x=0){
const priceMult = ExpantaNum(2).root(concreteParticlesEffect(1))
let factor = priceMult.pow(game.goldenMachines).sub(1).div(priceMult.sub(1))
let gain = game.goldenPoints.add(factor).mult(priceMult.sub(1)).add(1).logBase(priceMult).floor().toNumber()
if(x===0) return Math.max(0,gain-game.goldenMachines)
return priceMult.pow(gain).sub(1).div(priceMult.sub(1)).sub(factor).max(0)
}