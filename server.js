var game = require('./game');
var express = require('express');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');

var parser = require('body-parser');

var app = express();
var server = http.Server(app);
var io = socketio(server);

io.setMaxListeners(0);

var port = process.env.PORT || 8800;

app.set('port', 5000);
app.use('/static', express.static(path.join(__dirname, '/app/static')));

app.use(parser.json());
app.use(parser.urlencoded({extended: true}));

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname, 'app/templates/index.html'));
});

server.listen(port, function(){
    console.log('starting on port ' + port);
});

var players = [];
var games = {};

io.on('connection',function(socket){
    socket.on('newplayer', function(data){
        var player = {
            id: socket.id,
            name: data.name,
            cards: data.cards
        };
        players.push(player);
        //console.log(players.length);
        socket.join('game');
        if(players.length === 2) {
            let coinflip = Math.floor(Math.random() * 2);
            let state;
            if (coinflip === 0) {
                state = new game.Game(players[0], players[1]);
            } else {
                state = new game.Game(players[1], players[0]);
            }
            state.start();
            games[state.id] = state;
            players = [];

            io.to(state.player1.id).emit("start");
            io.to(state.player2.id).emit("start");

            setTimeout(function(){
                update(state.id);
            },1500);

            console.log(Object.keys(games));
        }
    });
});

io.on('connection', function(socket){
    socket.on('card',function(data){
        socket.emit('card-data',game.cardData(data));
    });
});

io.on('connection', function(socket){
    socket.on('next',function(id){
        let state = games[id];
        state.next();
        update(state.id);
    });
});

io.on('connection', function(socket){
    socket.on('draw',function(id){

        let state = games[id];

        if(state.player1.is(socket.id)){
            state.player1.draw();
        }else if(state.player2.is(socket.id)){
            state.player2.draw();
        }
        update(state.id);
    });
});


io.on('connection', function(socket){
    socket.on('search:deck',function(id){
        let state = games[id];

        if(state.player1.is(socket.id)){
            io.to(state.player1.id).emit('deck',state.player1.deck.getCards());
            io.to(state.player2.id).emit('enemysearch','enemyDeck');
        }else if(state.player2.is(socket.id)){
            io.to(state.player2.id).emit('deck',state.player2.deck.getCards());
            io.to(state.player1.id).emit('enemysearch','enemyDeck');
        }
        console.log('search:deck');
    });
});

io.on('connection', function(socket){
    socket.on('search:done',function(data){

        let state = games[data.id];

        let player, enemy;
        if(state.player1.is(socket.id)){
            player = state.player1;
            enemy = state.player2;
        }else{
            player = state.player2;
            enemy = state.player1;
        }

        if(data.name === 'deck'){
            player.deck.shuffle();
        }

        io.to(enemy.id).emit('done:search');
        console.log('search:done');
    });
});

io.on('connection', function(socket){
    socket.on('searching',function(data){

        let state = games[data.id];

        var zones = {
            hand: 'enemyHand',
            fountain: 'enemyFountain',
            banished: 'enemyBanished',
            deck: 'enemyDeck',
            enemyFountain: 'fountain',
            enemyBanished: 'banished',
        };

        if(state.player1.is(socket.id)){
            io.to(state.player2.id).emit('enemysearch',zones[data.name]);
        }else if(state.player2.is(socket.id)) {
            io.to(state.player1.id).emit('enemysearch', zones[data.name]);
        }
        console.log('searching');
    });
});

io.on('connection', function(socket){
    socket.on('send:unit', function(data){

        let state = games[data.id];

        var player, enemy;

        if(state.player1.is(socket.id)){
            player = state.player1;
            enemy = state.player2;
        }else{
            player = state.player2;
            enemy = state.player1;
        }

        var zones = {
            hand: player.hand,
            fountain: player.fountain,
            banished: player.banished,
            deck: player.deck,
            enemyFountain: enemy.fountain,
            enemyBanished: enemy.banished,
        };

        var from,to;
        if(typeof(data.from.position) === 'number'){
            if(data.from.side === 'ally') {
                from = player.field.getZone(data.from.position);
            }else{
                from = enemy.field.getZone(data.from.position);
            }
        }else{
            from = zones[data.from.position];
        }

        if(typeof(data.to.position) === 'number'){
            if(data.to.side === 'ally') {
                to = player.field.getZone(data.to.position);
            }else{
                to = enemy.field.getZone(data.to.position);
            }
        }else{
            to = zones[data.to.position];
        }

        var unit, event;

        if(data.type === 'token'){
            unit = from.getUnit(data.gid);
            //console.log(unit);
            from.sendToken(unit, to);

            if(to.type === 'zone') {
                event = {
                    type: 'repositioned',
                    event: {
                        from: from,
                        to: to,
                        unit: unit,
                        player: player
                    }
                };

                state.log(event)
            }else{
                event = {
                    type: 'removed',
                    event: {
                        from: from,
                        unit: unit,
                        player: player
                    }
                };

                state.log(event)
            }
        }else if(data.type === 'card') {
            if (data.gid === 't') {
                unit = player.deck.cards[0];
            } else if(from.type === 'zone'){
                unit = from.getUnit(data.gid);
            } else{
                unit = from.getCard(data.gid);
            }

            event = {
                type: 'moved',
                event: {
                    from: from,
                    to: to,
                    unit: unit,
                    player: player
                }
            };

            if (from.type === 'deck') {
                var options = {card: unit.getState(), duration: 0};
                socket.to(enemy.id).emit('reveal', options);
            }

            if (unit.cardType === 'CHAMPION' && from.type === 'zone') {
                if (to.type !== 'zone') {
                    for (var c in unit.equipped) {
                        var equipped = unit.equipped[c];

                        unit.unequip(equipped);
                        player.fountain.addCard(equipped);
                    }

                    unit.reset();
                }
            }

            if (from.type === 'zone') {
                from.sendTo(to);
            } else {
                from.sendTo(unit, to);
            }

            state.log(event);
            if (to.type === 'zone' && from.type === 'zone') {
                event = {
                    type: 'repositioned',
                    event: {
                        from: from,
                        to: to,
                        unit: unit,
                        player: player
                    }
                };
                console.log('reposition', unit.gid, to.position);
            }
            state.log(event);
        }
        update(state.id);
    })
});

io.on('connection',function(socket){
   socket.on('summon', function(data){

       let state = games[data.id];

       var player, enemy;

       if(state.player1.is(socket.id)){
           player = state.player1;
           enemy = state.player2;
       }else{
           player = state.player2;
           enemy = state.player1;
       }

        var zones = {
            hand: player.hand,
            fountain: player.fountain,
            banished: player.banished,
            deck: player.deck,
            enemyFountain: enemy.fountain,
            enemyBanished: enemy.banished,
        };

        var card = zones[data.from].getCard(data.gid);
        var from = zones[data.from];
        var to = player.field.getZone(data.target);

        var event = {
            type: 'summoned',
            event: {
                card: card,
                player: player,
                to: to
            }
        };

        if(card !== -1){
            from.sendTo(card, to);
            state.log(event);
            console.log('summon',card.gid);
            update(state.id);
        }
   });
});

io.on('connection',function(socket){
   socket.on('summon:token', function(data){

       let state = games[data.id];

       var player, enemy;

       if(state.player1.is(socket.id)){
           player = state.player1;
           enemy = state.player2;
       }else{
           player = state.player2;
           enemy = state.player1;
       }

       var token = new game.Token(data.name, data.stats, player.id);
       var to;
        if(data.side === 'ally') {
            to = player.field.getZone(data.to);
        }else{
            to = enemy.field.getZone(data.to);
        }

        var event = {
            type: 'summon',
            event: {
                token: token,
                player: player,
                to: to
            }
        };

        to.addToken(token);
        state.log(event);
        console.log('token',token.gid, data.side, data.to);
        update(state.id);
   });
});

io.on('connection',function(socket){
   socket.on('attack', function(data){

       let state = games[data.id];

       var player, enemy;

       if(state.player1.is(socket.id)){
           player = state.player1;
           enemy = state.player2;
       }else{
           player = state.player2;
           enemy = state.player1;
       }

       var target;

       if(data.type === 'unit') {
           target = enemy.field.getUnit(data.target).unit;
           if(target === -1 || target == null){
               target = state.neutral.field.getCard(data.target).card;
           }

       }else if(data.type === 'structure'){
           target = enemy.getStructure(data.target);
       }

       var unit = player.field.getUnit(data.gid).unit;

       //console.log(unit, target);

       var event = {
            type: 'attack',
            event: {
                unit: unit,
                target: target,
                player: player
            }
        };

       if(target !== null) {
           if (data.type === 'unit') {
               unit.attackUnit(target);
               state.log(event);

               if (target.currentHP <= 0) {
                   event = {
                       type: 'slain',
                       event: {
                           unit: target,
                           by: unit,
                           player: player
                       }
                   };

                   state.log(event);
                   console.log('slain', target.gid);

                   if(target.cardType === 'NEUTRALMONSTER'){
                       switch(target.cardId){
                           case(3999):
                               state.neutral.field.zones.dragon.sendTo(state.neutral.banished);
                               player.addBuff("cloud");
                               break;
                           case(5560):
                               state.neutral.field.zones.dragon.sendTo(state.neutral.banished);
                               player.addBuff("infernal");
                               break;
                           case(6969):
                               state.neutral.field.zones.dragon.sendTo(state.neutral.banished);
                               player.addBuff("mountain");
                               break;
                           case(8801):
                               state.neutral.field.zones.dragon.sendTo(state.neutral.banished);
                               player.addBuff("ocean");
                               break;
                           case(7992):
                               state.neutral.field.zones.dragon.sendTo(state.neutral.elder);
                               player.addBuff("elder");
                               event = {
                                   type: 'buff',
                                   event:{
                                       player: player,
                                       name: 'elder',
                                       duration: 2
                                   }
                               };
                               break;
                           case(3302):
                               state.neutral.field.zones.baron.sendTo(state.neutral.baron);
                               player.addBuff("baron");
                               event = {
                                   type: 'buff',
                                   event:{
                                       player: player,
                                       name: 'baron',
                                       duration: 2
                                   }
                               };
                               break;
                           default:
                               state.neutral.field.zones.baron.sendTo(player.hand);
                               break;
                       }
                   }
               }

               update(state.id);
               console.log('attack', target.gid);

           }else if(data.type === 'structure'){
               unit.attackStructure(target);
               state.log(event);

               if(!target.active){
                   event = {
                       type: 'destroyed',
                       event:{
                           unit: unit,
                           structure: target,
                           player: player
                       }
                   };
                   state.log(event)
               }

               update(state.id);
               console.log('attack', target.type, data.target );

           }
       }
   });
});

io.on('connection',function(socket){
   socket.on('damage',function(data){

       let state = games[data.id];

       if(state.player1.is(socket.id)){
           player = state.player1;
       }else{
           player = state.player2;
       }

       let unit = player.field.getUnit(data.gid).unit;

       unit.takeDamage(data.val);

       update(state.id);
       console.log('damage', unit.gid, data.val );
   })
});

io.on('connection',function(socket){
    socket.on('equip',function(data){

        let state = games[data.id];

        var player;

       if(state.player1.is(socket.id)){
           player = state.player1;
       }else{
           player = state.player2;
       }

       var card = player.hand.getCard(data.gid);
       var target = player.field.getUnit(data.target).unit;

       event = {
            type: 'equipped',
            event: {
                card: card,
                unto: target,
                player: player
            }
        };

       if(card !== -1 && target !== null){
           target.equip(card);
           player.hand.removeCard(card);
           state.log(event);
           update(state.id);
           console.log("equip", card.gid, target.gid);
       }
    });
});

io.on('connection', function(socket){
    socket.on('activate',function(data){

        let state = games[data.id];

        var player,enemy;

       if(state.player1.is(socket.id)){
           player = state.player1;
           enemy = state.player2;
       }else{
           player = state.player2;
           enemy = state.player1;
       }

       var card = player.hand.getCard(data.gid);
       event = {
            type: 'activated',
            event: {
                card: card,
                player: player
            }
        };

       if(card !== -1){
           player.activate(card);
           if(card.spellType === 'NORMAL'){
               var options = {card: card.getState(), duration: data.duration}
               socket.to(enemy.id).emit('reveal',options);
           }
           state.log(event);
           update(state.id);
           console.log('activate', card.id);
       }
    });
});

io.on('connection', function(socket){
    socket.on('change:special', function(data){

        let state = games[data.id];

        var player;
        if(state.player1.is(socket.id)){
           player = state.player1;
        }else{
           player = state.player2;
        }

        var unit = player.field.getUnit(data.gid).unit;
        unit.gainStat(data.stat, data.num);

        var event = {
          type: 'statChange',
          event:{
              unit: unit,
              player: player,
              stat: data.stat,
              amt: data.num
          }
        };
        state.log(event);
        update(state.id);
    });
});

io.on('connection', function(socket){
    socket.on('mark', function(data){

        let state = games[data.id];

        var player;
        if(state.player1.is(socket.id)){
           player = state.player1;
        }else{
           player = state.player2;
        }

        if(data.type === 'unit'){
            var unit = player.field.getUnit(data.gid).unit;
            if(unit === -1 || unit == null){
                unit = state.neutral.field.getCard(data.gid).card;
            }


            if(data.add){
                unit.mark(data.mark);
                var event = {
                    type: 'marked',
                    event: {
                        unit: unit,
                        player: player,
                        mark: data.mark,
                        duration: data.duration
                    }
                };
                state.log(event);
                console.log('mark', data.gid, data.mark);
            }else{
                card.unmark(data.mark);
                var event = {
                    type: 'unmarked',
                    event: {
                        unit: unit,
                        player: player,
                        mark: data.mark
                    }
                };
                state.log(event);
                console.log('unmark', data.gid, data.mark);
            }
        }else if(data.type === 'zone'){
            var zone = player.field.getZone(data.zone);

            if(data.add){
                zone.mark(data.mark);
                var event = {
                    type: 'marked',
                    event: {
                        zone: data.zone,
                        player: player,
                        mark: data.mark,
                        duration: data.duration
                    }
                };
                state.log(event);
                console.log('mark', data.zone, data.mark);
            }else{
                zone.unmark(data.mark);
                var event = {
                    type: 'unmarked',
                    event: {
                        zone: data.zone,
                        player: player,
                        mark: data.mark
                    }
                };
                state.log(event);
                console.log('unmark', data.zone, data.mark);
            }
        }

        //console.log(state.cooldowns);
        update(state.id);
    });
});

io.on('connection', function(socket){
    socket.on('stack', function(data){

        let state = games[data.id];

        var player;
        if(state.player1.is(socket.id)){
           player = state.player1;
        }else{
           player = state.player2;
        }

        if(data.type === 'unit'){
            var unit = player.field.getCard(data.gid).card;
            if(unit === -1 || unit == null){
                unit = state.neutral.field.getCard(data.gid).card;
            }

            if(data.add){
                unit.stack(data.stack, data.num);
                let event = {
                    type: 'stack',
                    event: {
                        unit: unit,
                        player: player,
                        stack: data.stack,
                        num: data.num,
                        duration: data.duration
                    }
                };
                console.log('stack',card.gid, data.num, data.stack);
                state.log(event);
            }else{
                card.consume(data.stack);
                let event = {
                    type: 'consumed',
                    event: {
                        unit: unit,
                        player: player,
                        stack: data.stack,
                    }
                };
                state.log(event);
                console.log('consume', card.stacks);
            }
        }else if(data.type === 'zone'){
            var zone = player.field.getZone(data.zone);

            if(data.add){
                zone.stack(data.stack, data.num);
                let event = {
                    type: 'stack',
                    event: {
                        zone: data.zone,
                        player: player,
                        stack: data.stack,
                        num: data.num,
                        duration: data.duration
                    }
                };
                console.log('stack', data.zone, data.stack, data.num);
                state.log(event);
            }else{
                zone.consume(data.stack);
                let event = {
                    type: 'consumed',
                    event: {
                        zone: data.zone,
                        player: player,
                        stack: data.stack,
                    }
                };
                state.log(event);
                console.log('consume', data.stack);
            }
        }
        //console.log(state.cooldowns);
        update(state.id);
    });
});

io.on('connection',function(socket){
    socket.on('activate:ability',function(data){

        let state = games[data.id];

        var player;
        if(state.player1.is(socket.id)){
           player = state.player1;
        }else{
           player = state.player2;
        }

        var card = player.field.getUnit(data.gid).unit;

        if(card !== -1) {
            var activate = player.payCost(data.cost);

            if (activate) {
                var index = card.addCooldown(data.duration, data.cost, data.effect, data.type);

                var event = {
                    type: 'cooldown',
                    event: {
                        card: card,
                        player: player,
                        duration: data.duration,
                        source: data.type,
                        index: index
                    }
                };

                state.log(event);
                io.to(player.id).emit('ability:effect',{gid:card.gid ,effect:card.cooldowns[index].effect});
                console.log('cooldown', card.gid, data.duration);
            }

            update(state.id);
        }
    });
});

io.on('connection',function(socket){
    socket.on('refresh:ability',function(data){

        let state = games[data.id];

        var player;
        if(state.player1.is(socket.id)){
           player = state.player1;
        }else{
           player = state.player2;
        }

        var card = player.field.getUnit(data.gid).unit;

        var cost = card.refreshCooldown(data.index, data.options);
        player.restoreMana(cost);

        var event = {
            type: 'refresh',
            event: {
                card: card,
                player: player,
                index: data.index,
                mana: cost
            }
        };
        state.log(event);
        console.log('refresh', card.gid, data.index, cost);
        update(state.id);
    });
});

io.on('connection',function(socket){
    socket.on('remove:ability',function(data){

        let state = games[data.id];

        var player;
        if(state.player1.is(socket.id)){
           player = state.player1;
        }else{
           player = state.player2;
        }

        var card = player.field.getUnit(data.gid).unit;

        card.removeCooldown(data.index);

        console.log('remove', card.gid, data.index);
        update(state.id);
    });
});

io.on('connection',function(socket){
    socket.on('reactivate:ability',function(data){

        let state = games[data.id];

        var player;
        if(state.player1.is(socket.id)){
           player = state.player1;
        }else{
           player = state.player2;
        }

        var card = player.field.getUnit(data.gid).unit;

        if(card !== -1) {
            var cd = card.cooldowns[data.index];
            var activate = player.payCost(cd.cost);

            if (activate) {
                card.reactivate(data.index);

                var event = {
                    type: 'cooldown',
                    event: {
                        card: card,
                        player: player,
                        duration: cd.duration,
                        source: cd.type,
                        index: data.index
                    }
                };

                state.log(event);
                console.log('reactivate', card.gid, data.duration);
            }
            io.to(player.id).emit('ability:effect',{gid:card.gid ,effect:card.cooldowns[data.index()].effect});
            update(state.id);
        }
    });
});

io.on('connection',function(socket){
    socket.on('change:state',function(data){

        let state = games[data.id];

        var player;
        if(state.player1.is(socket.id)){
           player = state.player1;
        }else{
           player = state.player2;
        }

        var unit = player.field.getUnit(data.gid).unit;
        //console.log(card);
        if(unit !== -1) {
            unit.changeState(data.state);
            var event = {
                type: 'statechange',
                event: {
                    unit: unit,
                    player: player,
                    state: unit.states[data.state]
                }
            };

            state.log(event);
            console.log('change:state', unit.gid, event.state);
            update(state.id);
        }
    });
});

io.on('connection',function(socket){
    socket.on('change:stat',function(data){

        let state = games[data.id];

        var player;
        if(state.player1.is(socket.id)){
           player = state.player1;
        }else{
           player = state.player2;
        }

        var unit = player.field.getUnit(data.gid).unit;
        //console.log(card);
        if(unit !== -1) {
            switch(data.stat){
                case('hp'):
                    unit.gainHP(data.val);
                    break;
                case('ad'):
                    unit.gainAD(data.val);
                    break;
                case('ap'):
                    unit.gainAP(data.val);
                    break;
            }

            var event = {
                type: 'statchange',
                event: {
                    unit: unit,
                    player: player,
                    stat: data.stat,
                    val: data.val
                }
            };

            state.log(event);
            console.log('change:stat', unit.gid, data.stat, data.val);
            update(state.id);
        }
    });
});

io.on('connection',function(socket){
    socket.on('heal',function(data){

        let state = games[data.id];

        var player;
        if(state.player1.is(socket.id)){
           player = state.player1;
        }else{
           player = state.player2;
        }

        var unit = player.field.getUnit(data.gid).unit;
        //console.log(card);
        if(unit !== -1) {
            unit.heal(data.val);
            var event = {
                type: 'heal',
                event: {
                    unit: unit,
                    player: player,
                    val: data.val
                }
            };

            state.log(event);
            console.log('heal', unit.gid, data.val);
            update(state.id);
        }
    });
});

io.on('connection',function(socket){
    socket.on('shield',function(data){

        let state = games[data.id];

        var player;
        if(state.player1.is(socket.id)){
           player = state.player1;
        }else{
           player = state.player2;
        }

        var unit = player.field.getUnit(data.gid).unit;
        //console.log(card);
        if(unit !== -1) {
            unit.shieldOn(data.val);
            var event = {
                type: 'shield',
                event: {
                    unit: unit,
                    player: player,
                    val: data.val,
                    duration: data.duration
                }
            };

            state.log(event);
            console.log('shield', unit.gid, data.val, data.duration);
            update(state.id);
        }
    });
});

io.on('connection',function(socket){
    socket.on('levelUp',function(id){

        let state = games[id];

        var player;
        if(state.player1.is(socket.id)){
           player = state.player1;
        }else{
           player = state.player2;
        }

        player.levelUp();

        var event = {
            type: 'levelUp',
            event: {
                player: player,
                level: player.level
            }
        };
        state.log(event);
        console.log('levelUp',player.name,player.level);
        update(state.id)
    })
});

io.on('connection',function(socket){
    socket.on('restore:mana',function(data){

        let state = games[data.id];

        var player;
        if(state.player1.is(socket.id)){
           player = state.player1;
        }else{
           player = state.player2;
        }

        player.restoreMana(data);

        var event = {
            type: 'restore',
            event: {
                player: player,
                mana: player.mana
            }
        };
        state.log(event);
        console.log('restoreMana',player.name, player.currentMana);
        update(state.id)
    })
});

io.on('connection',function(socket){
    socket.on('damage:target',function(data){

        let state = games[data.id];

        var player,enemy;
        if(state.player1.is(socket.id)){
           player = state.player1;
           enemy = state.player2;
        }else{
           player = state.player2;
           enemy = state.player1;
        }

        var unit = player.field.getUnit(data.gid).unit;

        if(unit !== -1) {
            var targets = [];
            for(let i = 0; i < data.targets.length; i++){
                if(data.types[i] === 'unit'){
                    let target = enemy.field.getUnit(data.targets[i]).unit;
                    if (target === -1 || target == null) {
                        target = state.neutral.field.getCard(data.targets[i]).card;
                    }
                    targets.push(target)
                }else if(data.types[i] === 'zone'){
                    let units = enemy.field.getZone(data.target).getUnits();
                    for(let u = 0; u < units; u++){
                        targets.push(units[u]);
                    }
                }
            }

            for(let i = 0; i < targets.length; i++) {
                unit.damageTarget(targets[i], data.val, data.isTrue);

                var event = {
                    type: 'damage',
                    event: {
                        unit: unit,
                        player: player,
                        target: targets[i],
                        val: data.val
                    }
                };

                state.log(event);
                console.log('damage', unit.gid, targets[i].gid, data.val);
            }
        }

        update(state.id);
    })
});

io.on('connection',function(socket){
    socket.on('heal:target',function(data){

        let state = games[data.id];

        var player,enemy;
        if(state.player1.is(socket.id)){
           player = state.player1;
           enemy = state.player2;
        }else{
           player = state.player2;
           enemy = state.player1;
        }

        var unit = player.field.getUnit(data.gid).unit;

        if(unit !== -1) {

            var targets = [];
            for(let i = 0; i < data.targets.length; i++){
                if(data.types[i] === 'unit'){
                    let target = enemy.field.getUnit(data.targets[i]).unit;
                    if (target === -1 || target == null) {
                        target = state.neutral.field.getCard(data.targets[i]).card;
                    }
                    targets.push(target)
                }else if(data.types[i] === 'zone'){
                    let units = enemy.field.getZone(data.target).getUnits();
                    for(let u = 0; u < units; u++){
                        targets.push(units[u]);
                    }
                }
            }

            for(let i = 0; i < targets.length; i++) {

                unit.healTarget(targets[i], data.val);

                var event = {
                    type: 'heal',
                    event: {
                        unit: unit,
                        player: player,
                        target: targets[i],
                        val: data.val
                    }
                };

                state.log(event);
                console.log('heal', unit.gid, targets[i].gid, data.val);
            }
        }

        update(state.id);
    })
});

io.on('connection',function(socket){
    socket.on('shield:target',function(data){

        let state = games[data.id];

        var player,enemy;
        if(state.player1.is(socket.id)){
           player = state.player1;
           enemy = state.player2;
        }else{
           player = state.player2;
           enemy = state.player1;
        }

        var unit = player.field.getUnit(data.gid).unit;

        if(unit !== -1) {

            var targets = [];
            for(let i = 0; i < data.targets.length; i++){
                if(data.types[i] === 'unit'){
                    let target = enemy.field.getUnit(data.targets[i]).unit;
                    if (target === -1 || target == null) {
                        target = state.neutral.field.getCard(data.targets[i]).card;
                    }
                    targets.push(target)
                }else if(data.types[i] === 'zone'){
                    let units = enemy.field.getZone(data.target).getUnits();
                    for(let u = 0; u < units; u++){
                        targets.push(units[u]);
                    }
                }
            }

            for(let i = 0; i < targets.length; i++) {

                unit.shieldTarget(targets[i], data.val);

                var event = {
                    type: 'shield',
                    event: {
                        unit: unit,
                        player: player,
                        target: targets[i],
                        val: data.val,
                        duration: data.duration
                    }
                };

                state.log(event);
                console.log('shield', unit.gid, targets[i].gid, data.val);
            }
        }

        update(state.id);
    })
});

io.on('connection', function(socket){
    socket.on('random',function(data){

        let state = games[data.id];

        var enemy;
        if(state.player1.is(socket.id)){
           enemy = state.player2;
        }else{
           enemy = state.player1;
        }

        io.to(enemy.id).emit('enemy-random', data.val);
    });
});

function update(id){

    let state = games[id];

    var gameState = state.getGameState();
    io.to(state.player1.id).emit('update',JSON.stringify(gameState.player1));
    io.to(state.player2.id).emit('update',JSON.stringify(gameState.player2));
    //console.log('update');
}
