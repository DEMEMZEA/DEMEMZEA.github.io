class Simulation{
constructor(attributes){
const listOfAttributes = ["radius","simulatronAmount","rewardTable","extraStrategies","playerStrategies","activeStrategies","failureChances","spawnWeight","gameEnd"]
const defaultAttributes = {
radius: 10,
simulatronAmount: 1000,
rewardTable: [[1,1],[0,5],[5,0],[3,3]], // BB/CB/BC/CC, where B and C are betray and cooperate, respectively.
extraStrategies:{},
playerStrategies:{},
activeStrategies:{},
failureChances:{cooperation:0,betrayal:0},
spawnWeight:{far:1,close:1,exact:1},
gameEnd:false
}
const fixedStrateiges = {good,evil,unforgiving,titForTat}
if(typeof attributes!="object"||Array.isArray(attributes)) attributes = {}
for(let attribute of listOfAttributes){
this[attribute] = attributes[attribute]||defaultAttributes[attribute]
}
this.grid = []
for(let x = 0; x < 10 ; x++){
    for(let y = 0; y < 10 ; y++){
    this.grid.push({position:[x-5,y-5],simulatrons:[]})
    }
}
//Create a list of total strategies, by merging together the other 2
for(let strategy in fixedStrateiges){
this.strategies[strategy]=new Strategy(fixedStrateiges[strategy])
this.totalStrategies[strategy]=fixedStrateiges[strategy]
}
for(let strategy in this.extraStrategies){
if(this.activeStrategies[strategy]) this.strategies[strategy]=new Strategy(this.extraStrategies[strategy])
this.totalStrategies[strategy]=this.extraStrategies[strategy]
}
for(let strategy in this.playerStrategies){
if(this.activeStrategies[strategy]) this.strategies[strategy]=new Strategy(this.playerStrategies[strategy])
this.totalStrategies[strategy]=this.playerStrategies[strategy]
}
for(let strategy in this.strategies){
this.history.key.push(this.strategies[strategy].name)    
}
for(let i = 0 ; i < this.simulatronAmount ; i ++){
let type = this.strategies[Object.keys(this.strategies)[Math.floor(Math.random()*Object.keys(this.strategies).length)]]
this.placeSimulatron(type)
}
//precalculating the games here, to avoid needing to calculate them multiple times later. gives an average x100 round speedup at basically no cost
for(let defStrat in this.strategies){
this.prebattles[this.strategies[defStrat].name] = {}
    for(let challStrat in this.strategies){
    this.prebattles[this.strategies[defStrat].name][this.strategies[challStrat].name] = {points:{defender:0,challenger:0}}
    for(let i = 0 ; i < 7500/(Object.keys(this.strategies).length**2) ; i++){
    let battlePoints = this.battle(this.strategies[defStrat],this.strategies[challStrat],this.failureChances).points
    this.prebattles[this.strategies[defStrat].name][this.strategies[challStrat].name].points.defender += battlePoints.defender
    this.prebattles[this.strategies[defStrat].name][this.strategies[challStrat].name].points.challenger += battlePoints.challenger
    }
    } 
}
}
strategies = {}
totalStrategies = {}
simulatrons = []
prebattles = {}
history = {key:[],rounds:[]}
placeSimulatron = function (simulatronType,gridSpace=-1) {
let radius = this.radius
if(gridSpace==-1) gridSpace = Math.floor(Math.random()*10)*10+Math.floor(Math.random()*10)
let square = this.grid[gridSpace]
//selects a random square to spawn the simulatron on
let innerposition = [Math.random()*radius/5,Math.random()*radius/5]
let position = [square.position[0]*radius/5+innerposition[0],square.position[1]*radius/5+innerposition[1]]
let simulatron = {id:this.simulatrons.length,gridPos:gridSpace,innerposition,position,strategy:simulatronType,points:0}
/* Creates the simulatrion, those are made of:
strategies, which determine name, behaviour, and color,
positions, both inner to their square, and general position,
points, necessary for reproduction, and
ID, required to make sure that a simulatron doesn't fight itself
*/
this.grid[gridSpace].simulatrons.push(simulatron)
this.simulatrons.push(simulatron)
return simulatron
}
getSquares = function(gridSpace){
/*function used to determine where are the simulatrons each simulatron will play against.
Since points are inveresely proportional to the square of the distance, there's no need in pitting every simulatron against very far opponents, since their battles do actually take time
*/
let squares = []
let x = Math.floor(gridSpace/10)
let y = gridSpace%10
    let relativePos = (()=>{switch(x){
    case 0:
        switch(y){
        case 0:
        return [0,1,2,3,10,11,12,20,21,30]
        case 9:
        return [-3,-2,-1,0,8,9,10,19,20,30]
        case 1:
        case 8:
        return [-1,0,1,9,10,11,19,20,21]
        default:
        return [-2,-1,0,1,2,9,10,11,20]
        }
    case 9:
        switch(y){
        case 0:
        return [-30,-20,-19,-10,-9,-8,0,1,2,3]
        case 9:
        return [-30,-21,-20,-12,-11,-10,-3,-2,-1,0]
        case 1:
        case 8:
        return [-21,-20,-19,-11,-10,-9,-1,0,1]
        default:
        return [-20,-11,-10,-9,-2,-1,0,1,2]
        }
    case 1:
    case 8:
        switch(y){
        case 0:
        return [-10,-9,-8,0,1,2,10,11,12]
        case 9:
        return [-12,-11,-10,-2,-1,0,8,9,10]
        }
    default:
        switch(y){
        case 0:
        return [-20,-10,-9,0,1,2,10,11,20]
        case 9:
        return [-20,-11,-10,-2,-1,0,9,10,20]
        }
    return [-11,-10,-9,-1,0,1,9,10,11]
    }})()
for(let i of relativePos){
squares.push(i+gridSpace)
}
return squares
}
distConstant = function(firstPos,secondPos){
// Square of the distance, 1 is the minimum value since else they could be too close and make it such that basically only 2 simulatrons had children, which could end up skewing the results
return Math.max(1,(firstPos[0]-secondPos[0])**2+(firstPos[1]-secondPos[1])**2)
}
battle = function(defender,challenger,failureChances){
let rewardTable = this.rewardTable
let defenderChoices = []
let challengerChoices = []
let defenderPoints = 0
let challengerPoints = 0
for(let x=0;x<200;x++){
//simulates a 200 round game with both strategies
let defChoice = Boolean(defender.evaluate(defenderChoices,challengerChoices,x))
let challChoice = Boolean(challenger.evaluate(challengerChoices,defenderChoices,x))
if(defChoice){
if(Math.random()<failureChances.cooperation)
defChoice = !defChoice
}
else{
if(Math.random()<failureChances.betrayal)
defChoice = !defChoice
}
if(challChoice){
if(Math.random()<failureChances.cooperation)
challChoice = !challChoice
}
else{
if(Math.random()<failureChances.betrayal)
challChoice = !challChoice
}
/*
if(Math.random()<failureChances) defChoice = !defChoice
if(Math.random()<failureChances) challChoice = !challChoice
*/
defenderChoices.push(defChoice)
challengerChoices.push(challChoice)
let reward = rewardTable[defChoice+challChoice*2]
defenderPoints += reward[0]
challengerPoints += reward[1]
}
return {points:{defender:defenderPoints,challenger:challengerPoints}}
}
trueBattle = function(defender,challenger,failureChances){
return {points:this.battle(defender.strategy,challenger.strategy,failureChances).points,distConstant:this.distConstant(defender.position,challenger.position)}
}
simulateRound = function(){
let count = Array(Object.keys(this.strategies).length).fill(0)
let prebattles = this.prebattles
let totalPoints = 0
let totalChildren = this.simulatronAmount
for(let simulatron of this.simulatrons){
count[this.history.key.indexOf(simulatron.strategy.name)]++
let distSum = 1
let squares = this.getSquares(simulatron.gridPos)
//gets the squares close to each simulatron, picks all the simulatrons there, and "pits"(precalculated) them in a game 
    for(let square of squares){
    let opponents = this.grid[square].simulatrons
    for(let opponent of opponents){
    let values = {points:prebattles[simulatron.strategy.name][opponent.strategy.name].points,distConstant:this.distConstant(simulatron.position,opponent.position)}
    distSum += values.distConstant
    if(simulatron.id<opponent.id){
    this.simulatrons[simulatron.id].points+=values.points.defender/values.distConstant
    this.simulatrons[opponent.id].points+=values.points.challenger/values.distConstant
    }
    }
    }
simulatron.points/=distSum
//divides the points by the sum of all distances, to make sure that the simulatrons who just happen to spawn close to slightly more than average don't get that big of an advantage
totalPoints += simulatron.points
}
this.history.rounds.push(count)
// From here, all the points are given, so we'll just need to change the simulatrons for their next generation
let childPrice = totalPoints/totalChildren
let children = []
// giving all simulatrons who got a score greater than average guaranteed children
for(let simulatron of this.simulatrons){
let guaranteedChildren = Math.floor(simulatron.points/childPrice)
simulatron.points%=childPrice
    while(guaranteedChildren--){
    children.push({strategy:simulatron.strategy,parentPosition:simulatron.gridPos})
    }
}
let sorted = this.simulatrons.sort((a,b)=>{return a.points-b.points})
let i = 0
//randomly giving every simulatron their chance to have a kid, altough having more points grants a simulatron both priority and a higher probability than their counterparts with less points
while(children.length<totalChildren){
    if(Math.random()*childPrice<sorted[i%totalChildren].points){
        sorted[i%totalChildren].points = 0
        children.push({strategy:sorted[i%totalChildren].strategy,parentPosition:sorted[i%totalChildren].gridPos})
    }
i++
}
this.simulatrons = [] 
for(let i = 0;i<100;i++){
this.grid[i].simulatrons = []
}
// may they rest in peace
let chanceWeight = this.spawnWeight.far+this.spawnWeight.close+this.spawnWeight.exact
let farChance = this.spawnWeight.far/chanceWeight
let closeChance = this.spawnWeight.close/chanceWeight
for(let child of children){
/*placing the children of the now dead simulatrons, with chances not necessairly equal for all squares
farChance = farWeight/total Weight
closeChance = closeChance/total Weight
exactChance = exactChance/total Weight
Squares farther from their parent's square have a lower chance (farChance)%
Squares closer from their parent's square have a higher chance (farChance+11*closeChance)%
their parent's square has the highest chance (farChance+10*closeChance+100*(1-farChance-closeChance))%
*/
let positionChecker = Math.random()
let newPos = -Infinity
if(positionChecker<=farChance) newPos = -1
else if (positionChecker>=farChance+closeChance) newPos = child.parentPosition
else newPos = this.getSquares(child.parentPosition)[Math.floor(Math.random()*this.getSquares(child.parentPosition).length)]
this.placeSimulatron(child.strategy,newPos)
}
//great, now, time to return if the next game should be autoplayed
if(this.gameEnd===false) return true
if(count.includes(this.simulatronAmount)) return false // only 1 type of simulatron
return true
}
}

class Strategy{
constructor(attributes){
if(attributes.constructor === StrategyTemplate){
return new Strategy({name:attributes.name,color:attributes.color,evaluate:new Function("selfChoices","opponentChoices","round",attributes.evaluate)})
}
const listOfAttributes = ["evaluate","color","name"]
const defaultAttributes = {
name: "Unnamed",
color:"4040bf",
evaluate:function(selfChoices,opponentChoices,round){
return true
}
}
if(typeof attributes!="object"||Array.isArray(attributes)) attributes = {}
for(let attribute of listOfAttributes){
this[attribute] = attributes[attribute]||defaultAttributes[attribute]
}
}
}

class StrategyTemplate{
constructor(attributes){
const listOfAttributes = ["evaluate","color","name"]
const defaultAttributes = {
name: "Unnamed",
color:"4040bf",
evaluate:`
return true
`
}
if(typeof attributes!="object"||Array.isArray(attributes)) attributes = {}
for(let attribute of listOfAttributes){
this[attribute] = attributes[attribute]||defaultAttributes[attribute]
}
}
}

titForTat = new StrategyTemplate({name:"Tit For Tat", color:"0000ff", evaluate:`
if(round) return opponentChoices[round-1]
return true
`
})

unforgiving = new StrategyTemplate({name:"Unforgiving", color:"ff00ff", evaluate:`
if(round) return opponentChoices[round-1]&&selfChoices[round-1]
return true
`
})

good = new StrategyTemplate({name:"Angel", color:"bbbbbb"})

evil = new StrategyTemplate({name:"Devil", color:"ff0000", evaluate:`
return false
`
})

forgiving = new StrategyTemplate({name:"Forgiving",color:"00ff00",evaluate:`
if(round) return opponentChoices[round-2]||opponentChoices[round-1]
return true
`
})

titForTwoTats = new StrategyTemplate({name:"Tit For Two Tats", color:"3030cf", evaluate:`
if(round==1) return opponentChoices[0]
if(round) return opponentChoices[round-1]&&opponentChoices[round-2]
return true
`})

rando = new StrategyTemplate({name:"Random",color:"D6DA4C", evaluate:`
return Boolean(Math.round(Math.random()))
`})