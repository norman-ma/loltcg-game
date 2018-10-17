var localCards = {};

function cardData(id){
    return localCards[id];
}

class Card{
    constructor(cid, ctype){
        this.cardId = cid;
        this.cardType = ctype;
        this.gid = this.cardId + "-" + (Math.floor(Math.random() * 999999));
    }

    is(gid){
        return this.gid === gid;
    }

    getState(){
        let out = {};
        out.gid = this.gid;
        out.id = this.cardId;
        out.img = '/static/cards/'+this.cardId+'.jpg';
        out.ctype = this.cardType;
        return out;
    }
}


class Item extends Card{
    constructor(cid, stats, special_stats){
        super(cid, "ITEM");
        this.hp = stats[0];
        this.ad = stats[1];
        this.ap = stats[2];
        this.stats = special_stats;
    }

    getState(){
        let out = super.getState();
        out.hp = this.hp;
        out.ad = this.ad;
        out.ap = this.ap;
        out.stats = this.stats;
        return out;
    }
}

class SummonerSpell extends Card{
    constructor(cid, stype){
        super(cid, "SUMMONERSPELL");
        this.spellType = stype;

        if(this.spellType === 'FIELDOFJUSTICE') {
            this.stacks = {
                'Temptation': 0,
                'Arcana': 0,
                'Runic Shard': 0
            };
        }
    }

    stack(name, num){
        this.stacks[name] += num;
    }

    consume(name){
        this.stacks[name] = 0;
    }

    getState(){
        let out = super.getState();
        out.spellType = this.spellType;
        if(this.spellType === 'FIELDOFJUSTICE') {
            out.stacks  = [];
            for(let k in this.stacks){
                if(this.stacks[k] > 0){
                    out.stacks.push(k);
                }
            }
        }
        return out;
    }
}

class Unit extends Card{
    constructor(cid, stats, type = null){
        super(cid, type);
        this.hp = stats[0];
        this.bonusHP = 0;
        this.currentHP = this.hp;
        this.ad = stats[1];
        this.bonusAD = 0;
        this.ap = stats[2];
        this.bonusAP = 0;
        this.shield = 0;
        this.stealth = false;

        this.stats = {
            "cdr": {val: 0, max:4},
            "attackspeed": {val: 0, max:3},
            "resistance": {val: 0, max:3},
            "crit": {val: 0, max:3},
            "hspower": {val: 0, max:4},
            "lifesteal": {val: 0, max:4},
            "penetration": {val: 0, max:3}
        };

        this.states = ['NORMAL', 'DISABLE', 'UNTARGETABLE', 'KNOCKUP', 'SLOW'];

        this.currentState = this.states[0];

        this. marks = {
            "Assassin's Mark": false,
            "Pulverize": false,
            "Concussive Blows": false,
            "Headshot": false,
            "Moonlight": false,
            "Allure": false,
            "Vital": false,
            "Healed": false,
            "Ignite": false,
            "Ionian Fervor": false,
            "Oathsworn": false,
            "Partner": false,
            "Malice": false,
            "Sonic Wave": false,
            "Torment": false,
            "Malefic Visions": false,
            "Mark": false,
            "Dusk": false,
            "Brittle": false,
            "Harrier": false,
            "Prey": false,
            "Flux": false,
            "Flame Breath": false,
            "Crystal Venom": false,
            "Acquired Taste": false,
            "Bastion": false,
            "Dark Passage": false,
            "Explosive Charge": false,
            "Fear": false,
            "Challenged": false,
            "Mourning": false,
            "Splatter": false,
            "Conduit": false
        };

        this.stacks = {
            "Frost": 0,
            "Energy": 0,
            "Mark of the Storm": 0,
            "Rend": 0,
            "Silver Bolts": 0,
            "Grave": 0,
            "Void Swarm": 0,
            "Triumph": 0,
            "Pyromania": 0,
            "Blood": 0,
            "Blaze": 0,
            "Flower Power": 0,
            "Hemorrhage": 0,
            "Temptation": 0,
            "Momentum": 0,
            "Adoration": 0,
            "Spiderling": 0,
            "Hyper": 0,
            "Rage": 0,
            "Plasma": 0,
            "Echo": 0,
            "Awe": 0,
            "Siphoning Strike": 0,
            "Aegis Protection": 0,
            "Fury": 0,
            "Ferocity": 0,
            "Runic Blade": 0,
            "Heat": 0,
            "Charge": 0,
            "Runic Shard": 0,
            "Deadly Venom": 0,
            "Tiger": 0,
            "Phoenix": 0,
            "Blight": 0
        };
    }

    reset(){
        this.stats = {
            "cdr": {val: 0, max:4},
            "attackspeed": {val: 0, max:3},
            "resistance": {val: 0, max:3},
            "crit": {val: 0, max:3},
            "hspower": {val: 0, max:4},
            "lifesteal": {val: 0, max:4},
            "penetration": {val: 0, max:3}
        };
        this. marks = {
            "Assassin's Mark": false,
            "Pulverize": false,
            "Concussive Blows": false,
            "Headshot": false,
            "Moonlight": false,
            "Allure": false,
            "Vital": false,
            "Healed": false,
            "Ignite": false,
            "Ionian Fervor": false,
            "Oathsworn": false,
            "Partner": false,
            "Malice": false,
            "Sonic Wave": false,
            "Torment": false,
            "Malefic Visions": false,
            "Mark": false,
            "Dusk": false,
            "Brittle": false,
            "Harrier": false,
            "Prey": false,
            "Flux": false,
            "Flame Breath": false,
            "Crystal Venom": false,
            "Acquired Taste": false,
            "Bastion": false,
            "Dark Passage": false,
            "Explosive Charge": false,
            "Fear": false,
            "Challenged": false,
            "Mourning": false,
            "Splatter": false,
            "Conduit": false
        };
        this.stacks = {
            "Frost": 0,
            "Energy": 0,
            "Mark of the Storm": 0,
            "Rend": 0,
            "Silver Bolts": 0,
            "Grave": 0,
            "Void Storm": 0,
            "Trumph": 0,
            "Pyromania": 0,
            "Blood": 0,
            "Blaze": 0,
            "Flower Power": 0,
            "Hemorrhage": 0,
            "Temptation": 0,
            "Momentum": 0,
            "Adoration": 0,
            "Spiderling": 0,
            "Hyper": 0,
            "Rage": 0,
            "Plasma": 0,
            "Echo": 0,
            "Awa": 0,
            "Siphoning Strike": 0,
            "Aegis Protection": 0,
            "Fury": 0,
            "Ferocity": 0,
            "Runic Blade": 0,
            "Heat": 0,
            "Charge": 0,
            "Runic Shard": 0,
            "Deadly Venom": 0,
            "Tiger": 0,
            "Phoenix": 0,
            "Blight": 0
        };
    }

    totalHP(){
        return this.hp + this.bonusHP;
    }

    gainHP(num){
        this.bonusHP += num;
        this.currentHP += num;
    }

    loseHP(num){
        this.bonusHP -= num;
        if(this.currentHP > this.totalHP()){
            this.currentHP = this.totalHP();
        }
    }

    heal(num){
        this.currentHP += num;
        if(this.currentHP > this.totalHP()){
            this.currentHP = this.totalHP();
        }
    }

    shieldOn(num){
        this.shield = num;
    }

    shieldOff(){
        this.shield = 0;
    }

    takeDamage(num, pen=0, trueDamage=false){
        if(!trueDamage) {
            num -= this.stats.resistance.val - pen;
        }
        if(num <= 0){
            num = 1;
        }
        this.currentHP -= num - this.shield;
        this.shield -= num;
        if(this.shield < 0){
            this.shield = 0;
        }
    }

    totalAD(){
        return this.ad + this.bonusAD
    }

    attackUnit(target) {
        target.takeDamage(this.totalAD(), this.stats.penetration.val);
        this.heal(0.5*this.stats.lifesteal.val*this.totalAD());
    }

    attackStructure(target){
        target.takeDamage();
    }

    gainAD(num){
        this.bonusAD += num;
    }

    loseAD(num){
        this.bonusAD -= num;
    }

    totalAP(){
        return this.ap + this.bonusAP;
    }

    gainAP(num){
        this.bonusAP += num;
    }

    loseAP(num){
        this.bonusAP -= num;
    }

    normal(){
        this.currentState = this.states[0];
    }

    disabled(){
        this.currentState = this.states[1];
    }

    untargetable(){
        this.currentState = this.states[2];
    }

    mark(name){
        this.marks[name] = true;
    }

    unmark(name){
        this.marks[name] = false;
    }

    stack(name, num){
        this.stacks[name] += num;
    }

    consume(name){
        this.stacks[name] = 0;
    }

    gainStat(name, num){
        this.stats[name].val += num;
        if(this.stats[name].val > this.stats[name].max){
            this.stats[name].val = this.stats[name].max;
        }
    }

    loseStat(name, num){
        this.stats[name].val -= num;
        if(this.stats[name].val < 0){
            this.stats[name].val = 0;
        }
    }

    changeState(state){
        this.currentState = this.states[state];
    }

    toggleStealth(){
        this.stealth = !this.stealth;
    }

    getState(){
        let out = super.getState();
        out.hp = this.currentHP;
        out.ad = this.totalAD();
        out.ap = this.totalAP();
        out.shield = this.shield;
        out.marks = [];
        for(let k in this.marks){
            if(this.marks[k]){
                out.marks.push(k);
            }
        }
        out.stacks = {};
        for(let k in this.stacks){
            if(this.stacks[k] > 0){
                out.stacks[k] = this.stacks[k];
            }
        }
        out.stats = this.stats;
        if(this.stealth){
            out.stealth = 'stealth';
        }else{
            out.stealth = '';
        }
        out.currentState = this.currentState;
        return out;
    }
}

class Champion extends Unit{
    constructor(cid, stats) {
        super(cid, stats, "CHAMPION");
        this.equipped = [];
        this.cooldowns = [];
    }

    healTarget(target, value){
        value += this.stats.hspower.val;
        target.heal(value);
    }

    shieldTarget(target,value){
        value += this.stats.hspower.val;
        target.shieldOn(value);
    }

    damageTarget(target,value, isTrue=false){
        target.takeDamage(value,this.stats.penetration.val,isTrue)
    }

    addCooldown(duration, cost, effect = '', type='ability'){
        let cooldown = duration;
        if(type === 'ability') {
            cooldown = duration - Math.floor(this.stats.cdr.val / 2);
            if (cooldown < 1) {
                cooldown = 1;
            }
        }
        this.cooldowns.push({duration: duration, cooldown: cooldown, cost: cost, type: type, effect: effect});
        return this.cooldowns.length - 1;
    }

    removeCooldown(index){
        this.cooldowns.splice(index,1);
    }

    countdown(index) {
        if(this.cooldowns.length >= index + 1) {
            if (this.cooldowns[index].cooldown > 0) {
                this.cooldowns[index].cooldown--;
            }
        }
    }

    reactivate(index){
        let cd = this.cooldowns[index];
        if(cd.type === 'ability') {
            cd.cooldown = cd.duration - Math.floor(this.stats.cdr.val / 2);
            if (cd.cooldown < 1) {
                cd.cooldown = 1;
            }
        }
    }

    refreshCooldown(index, options){
        if(options.ifCooldown){
            this.cooldowns[index].cooldown = 0;
        }
        if(options.ifMana){
            return this.cooldowns[index].cost;
        }else{
            return 0;
        }
    }

    offCooldown(index){
        return this.cooldowns[index].cooldown === 0
    }

    equip(card){
        this.equipped.unshift(card);
        if(card.cardType === 'ITEM') {
            this.gainHP(card.hp);
            this.gainAD(card.ad);
            this.gainAP(card.ap);
            for (let key in card.stats) {
                this.gainStat(key, card.stats[key])
                //console.log(key, card.stats.key);
            }
        }
    }

    unequip(card){
        this.equipped.splice(this.equipped.indexOf(card),1);
        if(card.cardType === 'ITEM') {
            this.loseHP(card.hp);
            this.loseAD(card.ad);
            this.loseAP(card.ap);
            for (let key in card.stats) {
                this.loseStat(key, card.stats[key])
            }
        }
    }

    getState(){
        let out = super.getState();
        out.equipped = [];
        for(let e in this.equipped){
            out.equipped.push(this.equipped[e].getState());
        }
        out.cooldowns = [];
        for(let c in this.cooldowns){
            out.cooldowns.push(this.cooldowns[c]);
        }
        return out;
    }
}

class Pet extends Unit{
    constructor(cid, stats){
        super(cid, stats, "PET")
    }

    getState(){
        let out = super.getState();
        delete out.ap;
        delete out.stats;
        return out;
    }
}

class NeutralMonster extends Unit{
    constructor(cid, stats){
        super(cid, stats, "NEUTRALMONSTER");
    }

    disabled(){
        this.currentState = this.states[0];
    }

    getState(){
        let out = super.getState();
        delete out.ap;
        return out;
    }
}

class Token extends Unit{
    constructor(name, stats, owner){
        super(name, stats, "TOKEN");
        this.owner = owner;
        this.name = name;
    }

    getState(){
        let out = super.getState();
        out.owner = this.owner;
        out.name = this.name;
        out.img = "/static/resources/tokens/"+ this.name +".png";
        delete out.ap;
        delete out.stats;
        return out;
    }
}

class Zone{
    constructor(cards=[], type){
        this.cards = cards;
        this.type = type;
    }

    shuffle(){
        for (let i = this.cards.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    }

    addCard(card, shuffle=false){
        if(typeof(card) !== 'number') {
            this.cards.push(card);
            if (shuffle) {
                this.shuffle()
            }
        }
    }

    removeCard(card, shuffle=false){
        let i = this.cards.indexOf(card);
        if(i > -1) {
            this.cards.splice(i, 1)
        }
        if(shuffle){
            this.shuffle()
        }
    }

    getCard(gid){
        for(let card of this.cards){
            if(card.is(gid)){
                return card;
            }
        }
        return -1;
    }

    sendTo(card, zone){
        zone.addCard(card);
        this.removeCard(card);
    }

    getState(){
        let out = [];
        for(let card of this.cards) {
            out.push(card.getState());
        }
        return out;
    }
}

class Deck extends Zone{
    constructor(cards=[]){
        let deck = [];
        for(let card of cards){
            deck.push(initCard(card));
        }
        super(deck, 'deck');
    }

    count(){
        return this.cards.length;
    }

    getState(){
        return this.count();
    }

    getCards(){
        return super.getState();
    }
}

function initCard(card){
    let convert = {
                'COOLDOWNREDUCTION':'cdr',
                'ATTACKSPEED': 'attackspeed',
                'RESISTANCE': 'resistance',
                'CRITICALSTRIKECHANCE': 'crit',
                'HEALANDSHIELDPOWER':'hspower',
                'LIFESTEAL':'lifesteal',
                'PENETRATION':'penetration'
            };

    if(Object.keys(localCards).indexOf(card.id) === -1){
        localCards[card.id] = card;
    }

    switch(card.cardtype){
        case('CHAMPION'):
            return new Champion(card.id,[card.hp,card.ad,card.ap]);

        case('ITEM'):
            let stats = {};
            for(let st of card.stats){
                let stat = st.stat;
                let qty = st.qty;
                stats[convert[stat]] = qty;
            }
            return new Item(card.id,[card.hp,card.ad,card.ap], stats);

        case('SUMMONERSPELL'):
            return new SummonerSpell(card.id,card.type);

        case('PET'):
            return new Pet(card.id, [card.hp,card.ad]);

        case('NEUTRALMONSTER'):
            return new NeutralMonster(card.id,[card.hp,card.ad]);
    }
}


class Hand extends Zone{
    constructor(){
        super([], 'hand');
    }
}

class PlayerField{
    constructor(){
        this.zones = [
            new FieldZone([1,1]),
            new FieldZone([2,1]),
            new FieldZone([3,1]),
            new FieldZone([1,2]),
            new FieldZone([2,2]),
            new FieldZone([3,2]),
            new FieldZone([0,0]),
            new FieldZone([4,0]),
            new FieldZone([])
        ];
    }

    getZone(position){
        return this.zones[position - 1];
    }

    getUnit(gid){
        for(let zone of this.zones){
            let unit = zone.getUnit(gid);
            //console.log(zone.position, unit);
            if(unit !== -1){
                return {unit: unit, zone: zone.position};
            }
        }
        return -1;
    }

    getState() {
        let out = [];
        for (let i = 0; i < 9; i++) {
            out.push(this.zones[i].getState());
        }
        return out;
    }
}

class NeutralField{
    constructor(){
        this.zones = {
            dragon: new FieldZone(null,'dragon'),
            baron: new FieldZone(null,'baron')
        };
    }

    getCard(gid){
        for(let k in this.zones){
            let card = this.zones[k].getCard();
            if(card !== null && card.gid === gid){
                return {zone: k, card: card};
            }
        }
        return -1;
    }

    getState(){
        return {
            'dragon': this.zones.dragon.getState(),
            'baron': this.zones.baron.getState()
        };
    }
}

class FieldZone extends Zone{
    constructor(coords = []){
        super([],'zone');
        if(coords !== [] && coords !== null){
            this.column = coords[0];
            this.row = coords[1];

            if(this.row === 1){
                this.position = this.column;
            }else if(this.row === 2){
                this.position = this.column + 3;
            }else if(this.row === 0){
                if(this.column === 0){
                    this.position = 7;
                }else{
                    this.position = 8;
                }
            }
        }else if(coords !== null){
            this.position = 9;
        }

        this.tokens = [];

        this.marks = {
            'Axe': false,
            'Demacian Standard': false,
            'Dagger': false,
            'Respite': false,
            'Worked Ground': false,
            "Assassin's Path": false,
            'Seed': false
        };

        this.stacks = {
            'Feather': 0
        };
    }

    addToken(token){
        this.tokens.push(token);
        //console.log(this.position,'tokens',this.tokens);
    }

    removeToken(token){
        this.tokens.splice(this.tokens.indexOf(token), 1);
    }

    sendToken(token, zone){
        if(zone.type === 'zone'){
            zone.addToken(token);
            this.removeToken(token);
        }else{
            this.removeToken(token);
        }
    }

    getUnit(gid){
        let units = this.getUnits();
        //console.log('length',units.length);
        for(let unit of units){
            //console.log('unit.gid',unit.gid, 'gid',gid);
            if (unit.is(gid)){
                return unit;
            }
        }
        return -1;
    }

    getCard(){
        if(this.isOccupied()){
            return this.cards[0];
        }else{
            return -1;
        }
    }

    getToken(gid){
        for(let token of this.tokens) {
            //console.log(token.gid, gid);
            if(token.is(gid)){
                //console.log(token.gid);
                return token;s
            }else{
                return -1;
            }
        }
    }

    getUnits(){
        let units = [];
        if(this.isOccupied()){
            units.push(this.cards[0]);
        }
        units = units.concat(this.tokens);
        //console.log('pos',this.position,'tokens',this.tokens.length,'units',units.length);
        return units;
    }

    mark(name){
        this.marks[name] = true;
    }

    unmark(name){
        this.marks[name] = false;
    }

    stack(name, num){
        this.stacks[name] += num;
    }

    consume(name){
        this.stacks[name] = 0;
    }

    isOccupied(){
        return this.cards.length > 0;
    }

    sendTo(zone){
        if(zone.type === 'zone'){
            if(zone.isOccupied()){
                let card = zone.addCard(this.getCard());
                this.removeCard();
                if(card !== 1){
                    this.addCard(card);
                }
            }else{
                zone.addCard(this.getCard());
                this.removeCard();
            }
        }else{
            super.sendTo(this.getCard(),zone);
        }
    }

    addCard(card,shuffle=false){
        if(this.isOccupied()){
            let old = this.getCard();
            this.removeCard();
            super.addCard(card,shuffle);
            return old;
        }else{
            super.addCard(card, shuffle);
        }
    }

    removeCard(){
        super.removeCard(this.cards[0],false);
    }

    getState(){
        let out = {};
        if(this.isOccupied()) {
            out.card = this.getCard().getState();
        }else{
            out.card = null;
        }
        out.marks = [];
        for(let k in this.marks){
            if(this.marks[k]){
                out.marks.push(k);
            }
        }
        out.stacks = {};
        for(let k in this.stacks){
            if(this.stacks[k] > 0){
                out.stacks[k] = this.stacks[k];
            }
        }

        out.tokens = [];
        for(let token of this.tokens){
            //console.log('token',token);
            out.tokens.push(token.getState());
        }
        return out;
    }
}

class Structure{
    constructor(hp, type) {
        this.hp = hp;
        this.type = type;
        this.active = true;
    }

    takeDamage(num=1){
        this.hp -= num;
        if(this.hp === 0){
            this.active = false;
        }
    }

    getState(){
        let out = {
            'hp':this.hp,
            'active': this.active,
            'type': this.type
        };
        return out;
    }
}

class Tower extends Structure{
    constructor(){
        super(4, 'tower');
    }

    attack(target){
        target.takeDamage(1);
    }
}

class Inhibitor extends Structure{
    constructor(){
        super(3, 'inhibitor')
    }
}

class Nexus extends Structure{
    constructor(){
        super(4, 'nexus')
    }
}

class Player{
    constructor(id, name, deck){
        this.name = name;
        this.id = id;

        this.hand = new Hand();
        this.deck = new Deck(deck);
        this.fountain = new Zone([],'fountain');
        this.banished = new Zone([],'banished');
        this.field = new PlayerField();

        this.buffs = {
            order:[],
            cloud: 0,
            infernal: 0,
            mountain: 0,
            ocean: 0,
            elder: 0,
            baron: 0
        };

        this.towers = [new Tower(),new Tower(),new Tower()];
        this.inhibs = [new Inhibitor(),new Inhibitor(),new Inhibitor()];
        this.nexus = new Nexus();

        this.level = 1;
        this.totalMana = 1;
        this.currentMana = 1;
    }

    start(){
        this.deck.shuffle();
        for(let i = 0; i < 5; i++){
            this.draw()
        }
    }

    draw(){
        this.deck.sendTo(this.deck.cards[0], this.hand);
    }

    mill(){
        this.deck.sendTo(this.deck.cards[0], this.fountain);
    }

    banish(){
        this.deck.sendTo(this.deck.cards[0], this.banished);
    }

    is(id){
        return id === this.id;
    }

    levelUp(){
        this.level += 1;
        this.totalMana += 2;
        this.currentMana = this.totalMana;
    }

    payCost(cost){
        if(cost <= this.currentMana){
            this.currentMana -= cost;
            return true;
        }else{
            return false;
        }
    }

    restoreMana(num){
        this.currentMana += num;
        if(this.currentMana > this.totalMana){
            this.currentMana = this.totalMana;
        }
        if(this.currentMana < 0){
            this.currentMana = 0;
        }
    }

    activate(card) {
        if (card.cardType === 'SUMMONERSPELL') {
            if (card.spellType === "NORMAL") {
                this.hand.sendTo(card, this.fountain);
            } else if (card.spellType === "FIELDOFJUSTICE") {
                this.hand.sendTo(card, this.field.getZone(9));
            }
        }
    }

    addBuff(name){
        this.buffs[name] ++;
        this.buffs.order.push(name);
    }

    removeBuff(name){
        this.buffs[name] = 0;
        let i = this.buffs.order.indexOf(name);
        this.buffs.order.splice(i,1);
    }

    getStructure(column){
        if(this.towers[column - 1].active){
            return this.towers[column - 1];
        }else if(this.inhibs[column - 1].active){
            return this.inhibs[column - 1];
        }else{
            return this.nexus;
        }
    }

    getState(){
        let out={};
        out.player = {
            'name':this.name,
            'id': this.id
        };
        out.deck = this.deck.getState();
        out.hand = this.hand.getState();
        out.fountain = this.fountain.getState();
        out.banished = this.banished.getState();
        out.field = this.field.getState();
        out.structures = [this.getStructure(1).getState(), this.getStructure(2).getState(), this.getStructure(3).getState()];
        out.level = this.level;
        out.mana = {
            'currentMana':this.currentMana,
            'totalMana': this.totalMana
        };
        out.buffs = this.buffs.order;

        return out;
    }

}

class Neutral{
    constructor(){
        this.dragons = new Deck([
		{
			"ad": 2,
			"cardtype": "NEUTRALMONSTER",
			"hp": 15,
			"id": 3999,
			"img": "/static/cards/3999.jpg",
			"name": "Cloud Drake",
			"text": "This card is immune to all forms of crowd control and If it has not been attacked for 1 Turn it will go back to full HP. At the beginning and end of each turn; this card attacks the last card that damaged it two times. \nDragon Slayer\nGain 1 Dragon Slayer Stack and for the rest of the duel, Allied Champions gain 1 Reposition range. (This effect can stack with other “Cloud Drake” kills).",
			"type": "DRAGON"
		},
		{
			"ad": 2,
			"cardtype": "NEUTRALMONSTER",
			"hp": 15,
			"id": 3999,
			"img": "/static/cards/3999.jpg",
			"name": "Cloud Drake",
			"text": "This card is immune to all forms of crowd control and If it has not been attacked for 1 Turn it will go back to full HP. At the beginning and end of each turn; this card attacks the last card that damaged it two times. \nDragon Slayer\nGain 1 Dragon Slayer Stack and for the rest of the duel, Allied Champions gain 1 Reposition range. (This effect can stack with other “Cloud Drake” kills).",
			"type": "DRAGON"
		},
		{
			"ad": 2,
			"cardtype": "NEUTRALMONSTER",
			"hp": 15,
			"id": 3999,
			"img": "/static/cards/3999.jpg",
			"name": "Cloud Drake",
			"text": "This card is immune to all forms of crowd control and If it has not been attacked for 1 Turn it will go back to full HP. At the beginning and end of each turn; this card attacks the last card that damaged it two times. \nDragon Slayer\nGain 1 Dragon Slayer Stack and for the rest of the duel, Allied Champions gain 1 Reposition range. (This effect can stack with other “Cloud Drake” kills).",
			"type": "DRAGON"
		},
		{
			"ad": 2,
			"cardtype": "NEUTRALMONSTER",
			"hp": 15,
			"id": 5560,
			"img": "/static/cards/5560.jpg",
			"name": "Infernal Drake",
			"text": "This card is immune to all forms of crowd control and If it has not been attacked for 1 Turn it will go back to full HP. At the beginning and end of each turn; this card attacks the last card that damaged it. When this card attacks a card, deal 2 damage to any card behind that card.\nDragon Slayer\nGain 1 Dragon Slayer Stack and for the rest of the duel, Allied Champions gain 1 AD and AP (this effect can stack with other “Infernal Drake” kills).",
			"type": "DRAGON"
		},
		{
			"ad": 2,
			"cardtype": "NEUTRALMONSTER",
			"hp": 15,
			"id": 5560,
			"img": "/static/cards/5560.jpg",
			"name": "Infernal Drake",
			"text": "This card is immune to all forms of crowd control and If it has not been attacked for 1 Turn it will go back to full HP. At the beginning and end of each turn; this card attacks the last card that damaged it. When this card attacks a card, deal 2 damage to any card behind that card.\nDragon Slayer\nGain 1 Dragon Slayer Stack and for the rest of the duel, Allied Champions gain 1 AD and AP (this effect can stack with other “Infernal Drake” kills).",
			"type": "DRAGON"
		},
		{
			"ad": 2,
			"cardtype": "NEUTRALMONSTER",
			"hp": 15,
			"id": 5560,
			"img": "/static/cards/5560.jpg",
			"name": "Infernal Drake",
			"text": "This card is immune to all forms of crowd control and If it has not been attacked for 1 Turn it will go back to full HP. At the beginning and end of each turn; this card attacks the last card that damaged it. When this card attacks a card, deal 2 damage to any card behind that card.\nDragon Slayer\nGain 1 Dragon Slayer Stack and for the rest of the duel, Allied Champions gain 1 AD and AP (this effect can stack with other “Infernal Drake” kills).",
			"type": "DRAGON"
		},
		{
			"ad": 1,
			"cardtype": "NEUTRALMONSTER",
			"hp": 15,
			"id": 6969,
			"img": "/static/cards/6969.jpg",
			"name": "Mountain Drake",
			"text": "This card is immune to all forms of crowd control and If it has not been attacked for 1 Turn it will go back to full HP. At the beginning and end of each turn; this card attacks the last card that damaged it. This card has +1 Resistance.\nDragon Slayer\nGain 1 Dragon Slayer Stack and for the rest of the duel, Allied Champions deal 1 bonus damage to Structures and Nuetral monsters. (this effect can stack with other “Mountan Drake” kills).",
			"type": "DRAGON"
		},
		{
			"ad": 1,
			"cardtype": "NEUTRALMONSTER",
			"hp": 15,
			"id": 6969,
			"img": "/static/cards/6969.jpg",
			"name": "Mountain Drake",
			"text": "This card is immune to all forms of crowd control and If it has not been attacked for 1 Turn it will go back to full HP. At the beginning and end of each turn; this card attacks the last card that damaged it. This card has +1 Resistance.\nDragon Slayer\nGain 1 Dragon Slayer Stack and for the rest of the duel, Allied Champions deal 1 bonus damage to Structures and Nuetral monsters. (this effect can stack with other “Mountan Drake” kills).",
			"type": "DRAGON"
		},
		{
			"ad": 1,
			"cardtype": "NEUTRALMONSTER",
			"hp": 15,
			"id": 6969,
			"img": "/static/cards/6969.jpg",
			"name": "Mountain Drake",
			"text": "This card is immune to all forms of crowd control and If it has not been attacked for 1 Turn it will go back to full HP. At the beginning and end of each turn; this card attacks the last card that damaged it. This card has +1 Resistance.\nDragon Slayer\nGain 1 Dragon Slayer Stack and for the rest of the duel, Allied Champions deal 1 bonus damage to Structures and Nuetral monsters. (this effect can stack with other “Mountan Drake” kills).",
			"type": "DRAGON"
		},
		{
			"ad": 2,
			"cardtype": "NEUTRALMONSTER",
			"hp": 15,
			"id": 8801,
			"img": "/static/cards/8801.jpg",
			"name": "Ocean Drake",
			"text": "This card is immune to all forms of crowd control and If it has not been attacked for 1 Turn it will go back to full HP. At the beginning and end of each turn; this card attacks the last card that damaged it. When this card attacks a card, Slow the target for 1 Phase\nDragon Slayer\nGain 1 Dragon Slayer Stack and for the rest of the duel, At the end of each Phase Heal all allied cards for 1 HP (This effect can stack with other “Ocean Drake” kills).",
			"type": "DRAGON"
		},
		{
			"ad": 2,
			"cardtype": "NEUTRALMONSTER",
			"hp": 15,
			"id": 8801,
			"img": "/static/cards/8801.jpg",
			"name": "Ocean Drake",
			"text": "This card is immune to all forms of crowd control and If it has not been attacked for 1 Turn it will go back to full HP. At the beginning and end of each turn; this card attacks the last card that damaged it. When this card attacks a card, Slow the target for 1 Phase\nDragon Slayer\nGain 1 Dragon Slayer Stack and for the rest of the duel, At the end of each Phase Heal all allied cards for 1 HP (This effect can stack with other “Ocean Drake” kills).",
			"type": "DRAGON"
		},
		{
			"ad": 2,
			"cardtype": "NEUTRALMONSTER",
			"hp": 15,
			"id": 8801,
			"img": "/static/cards/8801.jpg",
			"name": "Ocean Drake",
			"text": "This card is immune to all forms of crowd control and If it has not been attacked for 1 Turn it will go back to full HP. At the beginning and end of each turn; this card attacks the last card that damaged it. When this card attacks a card, Slow the target for 1 Phase\nDragon Slayer\nGain 1 Dragon Slayer Stack and for the rest of the duel, At the end of each Phase Heal all allied cards for 1 HP (This effect can stack with other “Ocean Drake” kills).",
			"type": "DRAGON"
		}
	],this);
        this.elder = new Deck([
		{
			"ad": 2,
			"cardtype": "NEUTRALMONSTER",
			"hp": 20,
			"id": 7992,
			"img": "/static/cards/7992.jpg",
			"name": "Elder Drake",
			"text": "“Elder Drake” is spawned in a Neutral Objective Zone on Turn 10 or after the Slaying of a “Drake” card in the Zone at Turn 10 and every 4 turns after it is slain. This card is immune to all forms of crowd control and If it has not been attacked for 1 Turn it will go back to full HP. At the beginning and end of each turn; this card attacks the last card that damaged it. This card deals 1 Bonus Damage for every 2 Dragon Slayer stacks of the card attacked and takes 1 reduced damage of every 2 Dragon Slayer stacks of the  card which attacks it.\nAspect of the Dragon\nFor 2 Turns: Allied Champions on the field when this card is slain gain double the effect of each Dragon Slayer stack and if they damage an enemy Champion, until the end of the turn; Deal 1 Damage to that Champion at the end of each Phase.",
			"type": "DRAGON"
		},
		{
			"ad": 2,
			"cardtype": "NEUTRALMONSTER",
			"hp": 20,
			"id": 7992,
			"img": "/static/cards/7992.jpg",
			"name": "Elder Drake",
			"text": "“Elder Drake” is spawned in a Neutral Objective Zone on Turn 10 or after the Slaying of a “Drake” card in the Zone at Turn 10 and every 4 turns after it is slain. This card is immune to all forms of crowd control and If it has not been attacked for 1 Turn it will go back to full HP. At the beginning and end of each turn; this card attacks the last card that damaged it. This card deals 1 Bonus Damage for every 2 Dragon Slayer stacks of the card attacked and takes 1 reduced damage of every 2 Dragon Slayer stacks of the  card which attacks it.\nAspect of the Dragon\nFor 2 Turns: Allied Champions on the field when this card is slain gain double the effect of each Dragon Slayer stack and if they damage an enemy Champion, until the end of the turn; Deal 1 Damage to that Champion at the end of each Phase.",
			"type": "DRAGON"
		},
		{
			"ad": 2,
			"cardtype": "NEUTRALMONSTER",
			"hp": 20,
			"id": 7992,
			"img": "/static/cards/7992.jpg",
			"name": "Elder Drake",
			"text": "“Elder Drake” is spawned in a Neutral Objective Zone on Turn 10 or after the Slaying of a “Drake” card in the Zone at Turn 10 and every 4 turns after it is slain. This card is immune to all forms of crowd control and If it has not been attacked for 1 Turn it will go back to full HP. At the beginning and end of each turn; this card attacks the last card that damaged it. This card deals 1 Bonus Damage for every 2 Dragon Slayer stacks of the card attacked and takes 1 reduced damage of every 2 Dragon Slayer stacks of the  card which attacks it.\nAspect of the Dragon\nFor 2 Turns: Allied Champions on the field when this card is slain gain double the effect of each Dragon Slayer stack and if they damage an enemy Champion, until the end of the turn; Deal 1 Damage to that Champion at the end of each Phase.",
			"type": "DRAGON"
		}
	],this);
        this.baron = new Deck([
		{
			"ad": 2,
			"cardtype": "NEUTRALMONSTER",
			"hp": 20,
			"id": 9728,
			"img": "/static/cards/9728.jpg",
			"name": "Rift Herald",
			"text": "“Rift Herald” is immune to all forms of crowd control and if it has not been attacked for 1 Turn it will go back to full HP. At the beginning and end of each turn; “Rift Herald” attacks the last card that damaged it. Once per turn, when a you or a Champion you control damages this card: Flip a Coin and if the result is Heads: this card takes 6 damage, but it’s next attack deals 2 bonus damage.\nEye of the Herald\nWhen a player slays this card: add this card to their hand. THis card may be summoned as a Pet with 10 HP within 3 turns of slaying this card and this card’s first attack on a structure deals damage equal to half this card’s HP - 2 (min 2).",
			"type": "RIFTHERALD"
		},
		{
			"ad": 2,
			"cardtype": "NEUTRALMONSTER",
			"hp": 25,
			"id": 3302,
			"img": "/static/cards/3302.jpg",
			"name": "Baron Nashor",
			"text": "If “Rift Herald” is still in the Neutral Objective Zone when this card is spawned: Destroy it. “Baron Nashor” is immune to all forms of crowd control and if it has not been attacked for 1 Turn it will go back to full HP. At the beginning and end of each turn; “Baron Nashor” attacks the last card that damaged it. When “Baron Nashor” attacks a card, deal 1 damage to all cards beside that Champion.\nHand of Baron\nFor 3 turns; Increase allied Champions AD and AP by 2 and allied cards deal 1 bonus damage to Structures.",
			"type": "BARONNASHOR"
		}
	],this);
        this.banished = new Deck([]);
        this.field = new NeutralField();
    }

    getDragon(){
        return this.field.zones.dragon.getCard()
    }

    getBaron(){
        return this.field.zones.baron.getCard()
    }

    start(){
        this.dragons.shuffle();
        this.dragons.sendTo(this.dragons.cards[0], this.field.zones.dragon);
        this.baron.sendTo(this.baron.cards[0], this.field.zones.baron);
    }

    nextDragon(){
        this.dragons.sendTo(this.dragons.cards[0], this.field.zones.dragon);
    }

    elderDragon(){
        this.elder.sendTo(this.elder.cards[0], this.field.zones.dragon);
    }

    baronNashor(){
        if(this.field.zones.baron.is_occupied()){
            this.field.zones.baron.sendTo(this.field.zones.baron.cards[0], this.banished);
        }
        this.baron.sendTo(this.baron.cards[0],this.field.zones.baron);
    }

    dragonAttack(card){
        let dragon = this.field.zones.dragon.getCard();
        dragon.attackUnit(card);
    }

    baronAttack(card){
        let baron = this.field.zones.baron.getCard();
        baron.attackUnit(card);
    }

    getState(){
        return this.field.getState();
    }
}

class Event{
    constructor(on, data){
        this.on = on;
        this.type = data.type;

        let event = data.event;

        if(this.type === 'stack' || this.type === 'marked'){
            event.end = this.on;
            event.end[event.duration.type] += event.duration.val;
        }

        if(this.type === 'shield'){
            event.end = this.on.phase;
            event.end += event.duration;
        }

        if(this.type === 'buff'){
            event.end = this.on.turn;
            event.end += event.duration;
        }

        Object.assign(this, event);

        this.details = Object.keys(event)
    }

    getState(){
        let out = {};
        out.on = [this.on.turn, this.on.phase];
        out.type = this.type;
        for(let k in this.details){
            switch(this.details[k]){
                case('from'):
                    out.from = this.from.type;
                    break;
                case('to'):
                    out.to = this.to.type + this.to.position;
                    break;
                case('by'):
                    out.by = this.by.gid;
                    break;
                case('unto'):
                    out.unto = this.unto.gid;
                    break;
                default:
                    out[this.details[k]] = this[this.details[k]];
            }
        }
        return out;
    }
}


class Game{
    constructor(p1,p2){
        this.player1 = new Player(p1.id,p1.name,p1.cards);
        this.player2 = new Player(p2.id,p2.name,p2.cards);
        this.neutral = new Neutral();
        this.turn = 1;
        this.turnPlayer = this.player1;
        this.phase = 0;
        this.phases = ["Precombat Phase", "Battle Phase", "Postcombat Phase"];

        this.phaseCount = 0;
        this.turnCount = 0;

        this.events = [];

        this.nextDragon = null;
        this.nextBaron = null;
        this.toAttack = {dragon: null, baron: null};

        this.marks = [];
        this.stacks = [];
        this.cooldowns = [];
        this.shields = [];
        this.buffs = [];
    }

    start(){
        this.player1.start();
        this.player2.start();
        this.neutral.start();
    }

    next(){
        if(this.phase === 1 || this.phase === 3){
            if(this.toAttack.dragon !== null) {
                this.neutral.dragonAttack(this.toAttack.dragon);
            }

            if(this.toAttack.baron !== null){
                this.neutral.baronAttack(this.toAttack.baron);
            }

            if(this.phase === 1){
                this.toAttack = {dragon: null, baron: null};
            }
        }
        this.phase ++;
        this.phaseCount ++;

        for(let e = 0; e < this.marks.length; e++){
            let event = this.marks[e];
            if(this.phaseCount === event.end.phase) {
                if (event.unit != null) {
                    let gid = event.unit.gid;
                    let unit, player;
                    if (this.player1.is(event.player.id)) {
                        player = this.player1;
                    } else {
                        player = this.player2;
                    }

                    unit = player.field.getUnit(gid).unit;
                    if(unit === -1 || unit == null){
                        unit = this.neutral.field.getCard(gid).card;
                    }
                    unit.unmark(event.mark);

                    this.marks.splice(e, 1);
                }else{
                    let zone, player;
                    if (this.player1.is(event.player.id)) {
                        player = this.player1;
                    } else {
                        player = this.player2;
                    }

                    zone = player.field.zones[event.zone];
                    zone.unmark(event.mark);

                    this.marks.splice(e, 1);
                }
            }
        }

        for(let e = 0; e < this.stacks.length; e++){
            let event = this.stacks[e];
            if(this.phaseCount === event.end.phase) {
                if (event.unit != null) {
                    let gid = event.unit.gid;
                    let unit, player;
                    if (this.player1.is(event.player.id)) {
                        player = this.player1;
                    } else {
                        player = this.player2;
                    }

                    unit = player.field.getUnit(gid).unit;
                    if(unit === -1 || unit == null){
                        unit = this.neutral.field.getCard(gid).unit;
                    }
                    if (unit.stacks[event.stack] <= event.num) {
                        unit.consume(event.stack);
                    }

                    this.marks.splice(e, 1);
                }else{
                    let zone, player;
                    if (this.player1.is(event.player.id)) {
                        player = this.player1;
                    } else {
                        player = this.player2;
                    }

                    zone = player.field.zones[event.zone];

                    if (zone.stacks[event.stack] <= event.num) {
                        zone.consume(event.stack);
                    }

                    this.marks.splice(e, 1);
                }
            }
        }

        for(let e = 0; e < this.shields.length; e++){
            let event = this.shields[e];
            if(this.phaseCount === event.end){
                let gid = event.unit.gid;
                let unit, player;
                if(this.player1.is(event.player.id)){
                    player = this.player1;
                }else{
                    player = this.player2;
                }
                unit = player.field.getUnit(gid).unit;
                unit.shieldOff();

                this.marks.splice(e,1);
            }
        }

        if(this.phase > 2){
            this.phase = 0;
            if(this.turnPlayer === this.player1){
                this.turnPlayer = this.player2;
            }else{
                this.turnPlayer = this.player1;
                this.turn ++;
                this.turnCount++;

                 for(let e = 0; e < this.marks.length; e++){
                    let event = this.marks[e];
                    if(this.turnCount === event.end.turn) {
                        if (event.unit != null) {
                            let gid = event.unit.gid;
                            let unit, player;
                            if (this.player1.is(event.player.id)) {
                                player = this.player1;
                            } else {
                                player = this.player2;
                            }

                            unit = player.field.getUnit(gid).unit;
                            if(unit === -1 || unit == null){
                                unit = this.neutral.field.getCard(gid).card;
                            }
                            unit.unmark(event.mark);

                            this.marks.splice(e, 1);
                        }else{
                            let zone, player;
                            if (this.player1.is(event.player.id)) {
                                player = this.player1;
                            } else {
                                player = this.player2;
                            }

                            zone = player.field.zones[event.zone];
                            zone.unmark(event.mark);

                            this.marks.splice(e, 1);
                        }
                    }
                }

                for(let e = 0; e < this.stacks.length; e++){
                    let event = this.stacks[e];
                    if(this.turnCount === event.end.turn) {
                        if (event.unit != null) {
                            let gid = event.unit.gid;
                            let unit, player;
                            if (this.player1.is(event.player.id)) {
                                player = this.player1;
                            } else {
                                player = this.player2;
                            }

                            unit = player.field.getUnit(gid).unit;
                            if(unit === -1 || unit == null){
                                unit = this.neutral.field.getCard(gid).card;
                            }

                            if (unit.stacks[event.stack] <= event.num) {
                                unit.consume(event.stack);
                            }

                            this.marks.splice(e, 1);
                        }else{
                            let zone, player;
                            if (this.player1.is(event.player.id)) {
                                player = this.player1;
                            } else {
                                player = this.player2;
                            }

                            zone = player.field.zones[event.zone];

                            if (zone.stacks[event.stack] <= event.num) {
                                zone.consume(event.stack);
                            }

                            this.marks.splice(e, 1);
                        }
                    }
                }

                 for(let e = 0; e < this.cooldowns.length; e++){
                    let event = this.cooldowns[e];
                    let gid = event.card.gid;
                    let card, player;
                    if(this.player1.is(event.player.id)){
                        player = this.player1;
                    }else{
                        player = this.player2;
                    }

                    card = player.field.getUnit(gid).unit;
                    card.countdown(event.index);
                    if(card.offCooldown(event.index)){
                        this.cooldowns.splice(e,1)
                    }
                }

                for(let e = 0; e < this.buffs.length; e++){
                    let event = this.buffs[e];
                    let player;
                    if(this.player1.is(event.player.id)){
                        player = this.player1;
                    }else{
                        player = this.player2;
                    }

                    player.removeBuff(event.name);

                    this.buffs.splice(e,1);
                }
            }

            if(this.turnCount === this.nextDragon){
                if(this.turn < 10){
                    this.neutral.nextDragon();
                }else{
                    this.neutral.elderDragon();
                }
            }
            if(this.turnCount === this.nextBaron){
                this.neutral.baronNashor();
            }

            this.turnPlayer.levelUp();
            if(this.turn === 8){
                this.neutral.baronNashor()
            }
        }
    }

    log(data){
        let on = {
            turn: this.turnCount,
            phase: this.phaseCount
        };
        let event = new Event(on, data);
        this.events.push(event);

        if(event.type === 'slain'){
            if(event.unit.cardType === 'NEUTRALMONSTER'){
                let card = localCards[event.unit.cardId];
                switch(card.type){
                    case("DRAGON"):
                        this.nextDragon = this.turnCount + 2;
                        break;
                    case("BARONNASHOR"):
                        if(this.turn > 8){
                            this.nextBaron = this.turnCount + 4
                        }
                        break;

                }
            }
        }

        if(event.type === 'attack' || event.type === 'damage'){
            if(event.target.cardType === 'NEUTRALMONSTER'){
                if(this.neutral.getDragon() === event.target){
                    this.toAttack.dragon = event.unit;
                }else if(this.neutral.getBaron() === event.target){
                    this.toAttack.baron = event.unit;
                }
            }
        }

        if(event.type === 'marked'){
            this.marks.push(event);
        }

        if(event.type === 'stack'){
            this.stacks.push(event);
        }

        if(event.type === 'cooldown'){
            this.cooldowns.push(event);
        }

        if(event.type === 'shield'){
            this.shields.push(event);
        }

        if(event.type === 'buff'){
            this.buffs.push(event);
        }
    }

    getGameState() {

        let out = {};
        out.player1 = this.player1.getState();
        out.player2 = this.player2.getState();

        out.player1.dragon = this.neutral.getState().dragon;
        out.player1.baron = this.neutral.getState().baron;
        out.player1.enemyHand = out.player2.hand.length;
        out.player1.enemyDeck = out.player2.deck;
        out.player1.enemyFountain = out.player2.fountain;
        out.player1.enemyBanished = out.player2.banished;
        out.player1.enemyField = out.player2.field;
        out.player1.enemyMana = out.player2.mana;
        out.player1.enemyLevel = out.player2.level;
        out.player1.enemyStructures = out.player2.structures;
        out.player1.enemyBuffs = out.player2.buffs;
        out.player1.enemy = out.player2.player.name;

        out.player2.dragon = this.neutral.getState().dragon;
        out.player2.baron = this.neutral.getState().baron;
        out.player2.enemyHand = out.player1.hand.length;
        out.player2.enemyDeck = out.player1.deck;
        out.player2.enemyFountain = out.player1.fountain;
        out.player2.enemyBanished = out.player1.banished;
        out.player2.enemyField = out.player1.field;
        out.player2.enemyMana = out.player1.mana;
        out.player2.enemyLevel = out.player1.level;
        out.player2.enemyStructures = out.player1.structures;
        out.player2.enemyBuffs = out.player1.buffs;
        out.player2.enemy = out.player1.player.name;

        let game = {
            'turn':this.turn,
            'turnPlayer': this.turnPlayer.name,
            'phase': this.phases[this.phase]
        };

        out.player1.game = game;
        out.player2.game = game;

        return out;
    }
}

module.exports = {
    'Card': Card,
    'Item': Item,
    'SummonerSpell': SummonerSpell,
    'Unit': Unit,
    'Champion': Champion,
    'Pet': Pet,
    'NeutralMonster': NeutralMonster,
    'Token': Token,
    'Zone': Zone,
    'Deck': Deck,
    'Hand': Hand,
    'PlayerField': PlayerField,
    'NeutralField': NeutralField,
    'FieldZone': FieldZone,
    'Structure': Structure,
    'Tower': Tower,
    'Inhibitor': Inhibitor,
    'Nexus': Nexus,
    'Player': Player,
    'Neutral': Neutral,
    'Game': Game,
    'cardData': cardData
};