var app = angular.module("LOLTCG",["ngRoute"]);

app.factory('socket', function() {
  var socket = io();
  return {
    on: function (eventName, callback) {
      socket.on(eventName,callback);
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data,callback);
    }
  };
});

app.config(function($routeProvider){
    $routeProvider
       .when("/",{
           templateUrl: '/static/templates/connect.htm'
       })
        .when("/game",{
            templateUrl: '/static/templates/game.htm'
        });
});

app.controller("PreviewController",['$scope','socket',function($scope, socket){
    $scope.card = null;

    socket.on('card-data',function(res){
        $scope.card = res;
        $scope.$apply();
    });
}]);

app.controller("ConnectController",['$scope','$http','socket','$location',function($scope,$http,socket,$location){
    $scope.data = {
        'name': "",
        'cards': []
    };

    socket.on('start',function(){
        console.log('start');
        $location.path('/game');
        $scope.$apply();
    });

    $('#deck').change(function(){
        $('#deck-name').val($('#deck').val().replace(/.*[\/\\]/, ''));
    });


    $scope.connect = function(){
        var fd = new FormData();
        fd.append('file', $("#deck")[0].files[0]);
        fd.append('verbose','true');
        $http
            .post('https://loltcg-deckbuilder-heroku.herokuapp.com/deck/load',fd,{
                headers: {'Content-Type': undefined}
            })
            .then(function(res){
                $scope.data.cards = res.data.data;
                socket.emit('newplayer', $scope.data);
            })
            .catch(function(error){
                console.log(error);
            });
    };
}]);

app.controller("StateController",['$scope','socket',function($scope,socket){

    $scope.state = {
        field: [{},{},{},{},{},{},{},{},{},{}],
        enemyField: [{},{},{},{},{},{},{},{},{},{}]
    };

    $scope.searchData = {};
    $scope.doSearch = false;

    $scope.targetingZone = false;
    $scope.targetingUnit = false;
    $scope.targetingCard = false;
    $scope.targetingStructure = false;

    $scope.searching = 'none';

    $scope.toSummon = {
        gid: null,
        from: null,
        target: null
    };
    $scope.toAttack = {
        gid: null,
        target: null,
        type: null
    };
    $scope.toEquip = {
        gid: null,
        target: null
    };
    $scope.toTarget = {
        gid: null,
        target: null,
        type: null,
        side: null
    };
    $scope.toReposition = {
        gid: null,
        from: {
            position: null,
            side: null
        },
        type: 'card',
        to: {
            position: null,
            side: null
        }
    };

    $scope.menu = 0;

    $scope.reveal = [];
    $scope.revealing = false;

    $scope.details = null;
    $scope.showDetails = false;
    $scope.controls = false;

    $scope.marks = [];
    $scope.stacks = [];

    $scope.toHeal = {
        gid: null,
        val: 0
    };

    $scope.toShield = {
        gid: null,
        duration: 0,
        val: 0
    };

    $scope.healTarget = {
        gid: null,
        targets: [],
        val: 0
    };

    $scope.shieldTarget = {
        gid: null,
        targets: [],
        duration: 0,
        val: 0
    };

    $scope.damageTarget = {
        gid: null,
        targets: [],
        val: 0,
        isTrue: false,
        types: []
    };

    $scope.mark = {
        gid: null,
        zone: null,
        type: null,
        mark: '',
        add: true,
        duration: {
            val: 0,
            type: 'phase'
        }
    };

    $scope.stack = {
        gid: null,
        zone: null,
        type: null,
        stack: '',
        add: true,
        num: 0,
        duration: {
            val: 0,
            type: 'phase'
        }
    };

    $scope.cooldown = {
        gid: null,
        duration: 1,
        cost: 1,
        type: 'ability',
        effect: ''
    };

    $scope.token = {
        name: "",
        stats: [0,0],
        side: 'ally',
        to: null
    };

    $scope.unitMarks = ["Acquired Taste", "Allure", "Assassin's Mark", "Bastion", "Brittle", "Challenged", "Concussive Blows", "Conduit", "Crystal Venom", "Dark Passage", "Dusk", "Explosive Charge", "Fear", "Flame Breath", "Flux", "Harrier", "Headshot", "Healed", "Ignite", "Ionian Fervor", "Malefic Visions", "Malice", "Mark", "Moonlight", "Mourning", "Oathsworn", "Partner", "Prey", "Pulverize", "Sonic Wave", "Splatter", "Torment", "Vital"];

    $scope.unitStacks = ["Adoration", "Aegis Protection", "Awe", "Blaze", "Blight", "Blood", "Charge", "Deadly Venom", "Echo", "Energy", "Ferocity", "Flower Power", "Frost", "Fury", "Grave", "Heat", "Hemorrhage", "Hyper", "Mark of the Storm", "Momentum", "Phoenix", "Plasma", "Pyromania", "Rage", "Rend", "Runic Blade", "Silver Bolts", "Siphoning Strike", "Spiderling", "Tiger", "Triumph", "Void Swarm"];

    $scope.zoneMarks = ["Assassin's Path",'Axe','Dagger','Demacian Standard','Respite','Seed','Worked Ground'];

    $scope.zoneStacks = ['Feather'];

    $scope.fieldStacks = ['Arcana', 'Runic Shard', 'Temptation'];

    $scope.tokens = ['Ball','Blob','Clone','Decoy','Egg','Forest','Goo','Hallucination','Holo','Minion','Plant','Poro','Powder Keg', 'Sand Soldier', 'Satchel','Shadow','Shrine','Shroom','Spirit', 'Sun Disk','Tentacle', 'Time Bomb', 'Undead', 'Voidling'];

    $scope.getNumber = function(num) {
        return new Array(num);
    };

    $scope.class = function(num, other=''){
        if(num < 8){
            return 'field-zones' + " " + other;
        }else{
            return 'card-zones' + " " + other;
        }
    };

    socket.on('update',function(data){
        console.log('update');
        $scope.state = JSON.parse(data);

        if($scope.doSearch){
            $scope.search($scope.searchData.name);
        }

        if($scope.showDetails){
            $scope.setDetails($scope.menu, 'ally');
        }

        console.log($scope.state);
        $scope.$apply();
    });

    $scope.onHover = function(id){
        console.log(id);
        socket.emit('card', id)
    };

    $scope.next = function(){
        socket.emit('next');
    };

    $scope.draw = function(){
        socket.emit('draw');
    };

    $scope.search = function(zone){
        switch(zone){
            case('deck'):
                socket.emit('search:deck');
                break;
            default:
                $scope.searchData = {
                    name: zone,
                    cards: $scope.state[zone]
                };
                $scope.doSearch = true;
                socket.emit('searching',$scope.searchData.name);
                break;
        }
    };

    $scope.doneSearch = function() {
        socket.emit('search:done', $scope.searchData.name);
        $scope.searchData = {};
        $scope.doSearch = false;
    };

    socket.on('done:search',function(){
       $scope.searching = 'none';
       console.log('done', $scope.searching);
       $scope.$apply();
    });

    socket.on('enemysearch',function(data){
        $scope.searching = data;
        console.log($scope.searching);
        $scope.$apply();
    });

    socket.on('deck',function(data){
        $scope.searchData = {
            name: 'deck',
            cards: data
        };
        $scope.doSearch = true;
        console.log($scope.searchData);
    });

    $scope.to = function(gid, from, to, type='card'){
        var data = {gid:gid,
            from:from,
            to:to,
            type: type
        };
        console.log('to',data);
        socket.emit('send:unit', data);
        if($scope.doSearch && from === 'deck'){
            $scope.search(from);
        }
    };

    $scope.target = function(target,side,type = 'card'){

        if($scope.toSummon.gid !== null){
            $scope.toSummon.target = target;
            console.log('summon',$scope.toSummon);
            socket.emit('summon',$scope.toSummon);

            if($scope.toSummon.from === 'deck' || $scope.toSummon.from === 'fountain' || $scope.toSummon.from === 'banished' || $scope.toSummon.from === 'enemyFountain' || $scope.toSummon.from === 'enemyBanished'){
                $scope.search($scope.toSummon.from);
            }
            $scope.toSummon.gid = null;
            $scope.menu = 0;
            console.log($scope.toSummon)
        }

        if($scope.toAttack.gid !== null){
            $scope.toAttack.target = target;
            $scope.toAttack.type = type;
            console.log('attack',$scope.toAttack);
            socket.emit('attack',$scope.toAttack);

            $scope.toAttack.gid = null;
        }

        if($scope.toEquip.gid !== null){
            $scope.toEquip.target = target;
            console.log('equip',$scope.toEquip);
            socket.emit('equip',$scope.toEquip);

            $scope.toEquip.gid = null;
        }

        if($scope.toReposition.gid !== null){
            $scope.toReposition.to = {position:target,side: side};
            console.log('reposition',$scope.toReposition);
            $scope.to($scope.toReposition.gid,$scope.toReposition.from, $scope.toReposition.to, $scope.toReposition.type, side);

            $scope.toReposition.gid = null;
        }

        if($scope.token.name !== ""){
            $scope.token.to = target;
            $scope.token.side = side;
            console.log('token', $scope.token);

            socket.emit('summon:token',$scope.token);

            $scope.token.name = "";
        }

        if($scope.damageTarget.gid !== null){
            $scope.damageTarget.targets.push(target);
            $scope.damageTarget.types.push(type);
            console.log('damage', target);
        }

        if($scope.healTarget.gid !== null){
            $scope.healTarget.targets.push(target);
            console.log('heal', target);
        }

        if($scope.shieldTarget.gid !== null){
            $scope.shieldTarget.targets.push(target);
            console.log('shield', target);
        }

        if($scope.toTarget.gid !== null){
            $scope.toTarget.target = target;
            $scope.toTarget.side = side;
            $scope.toTarget.type = type;
            console.log('target',$scope.toTarget);
            socket.emit('target',$scope.toTarget);

            $scope.toTarget.gid = null;
        }
    };

     $scope.summon = function(gid,from){
        $scope.toSummon.gid = gid;
        $scope.toSummon.from = from;
    };

    $scope.activate = function(gid){
        var data = {gid: gid, duration: 0};
        socket.emit('activate',data);
    };

    $scope.reposition = function(gid, from, type = 'card'){
        $scope.toReposition.gid = gid;
        $scope.toReposition.from = from;
        $scope.toReposition.type = type;
        console.log($scope.toReposition);
    };

    socket.on('reveal', function(data){
        $scope.reveal.push(data.card);
        $scope.onHover(data.card.id);
        $scope.duration = 0;
        $scope.revealing = true;
        if($scope.duration === 0){
            setTimeout(function(){
                $scope.doneView();
            }, 200);
        }
        console.log('reveal');
    });

    $scope.doneView = function(){
        $scope.reveal = [];
        $scope.revealing = false;
    };

    $scope.setMenu = function(menu, who = null){
        if(menu === $scope.menu){
            $scope.menu = 0;
        }else{
            $scope.menu = menu;
        }

        if(who !== null){
            $scope.setDetails(menu, who);
        }else{
            $scope.showDetails = false;
            $scope.controls = false;
        }

        console.log($scope.menu);
    };

    $scope.setDetails = function(position, who=null, type='unit'){
        console.log(position, type);

        if (typeof(position) === 'number') {
            if (who === 'ally') {
                if (type === 'unit') {
                    $scope.details = $scope.state.field[position - 1].card;
                    if(position !== 9){
                        $scope.stacks = $scope.unitStacks;
                        $scope.marks = $scope.unitMarks;
                    }else{
                        $scope.stacks = $scope.fieldStacks;
                        $scope.marks = null;
                    }
                } else if (type === 'zone') {
                    $scope.details = $scope.state.field[position - 1];
                    if(position !== 9){
                        $scope.stacks = $scope.zoneStacks;
                        $scope.marks = $scope.zoneMarks;
                    }else{
                        $scope.stacks = null;
                        $scope.marks = null;
                    }
                    $scope.mark.zone = position;
                    $scope.stack.zone = position;
                }

                $scope.controls = true;
            } else if (who === 'enemy') {
                if (type === 'unit') {
                    $scope.details = $scope.state.enemyField[position - 1].card;
                    if(position !== 9){
                        $scope.stacks = $scope.unitStacks;
                        $scope.marks = $scope.unitMarks;
                    }else{
                        $scope.stacks = $scope.fieldStacks;
                        $scope.marks = null;
                    }
                } else if (type === 'zone') {
                    $scope.details = $scope.state.enemyField[position - 1];
                    if(position !== 9){
                        $scope.stacks = $scope.zoneStacks;
                        $scope.marks = $scope.zoneMarks;
                    }else{
                        $scope.stacks = null;
                        $scope.marks = null;
                    }
                }
                $scope.details = $scope.state.enemyField[position - 1].card;
                $scope.controls = false;
            }
        } else if (position === 'b') {
            $scope.details = $scope.state.baron.card;
            $scope.stacks = $scope.unitStacks;
            $scope.marks = $scope.unitMarks;

            $scope.controls = true;
        } else if (position === 'd') {
            $scope.details = $scope.state.dragon.card;
            $scope.stacks = $scope.unitStacks;
            $scope.marks = $scope.unitMarks;

            $scope.controls = true;
        }

        $scope.mark.type = type;
        $scope.stack.type = type;

        $scope.showDetails = !$scope.showDetails;
    };

    $scope.changeSpecial = function(gid,key,num){
        socket.emit('change:special',{gid:gid, stat:key, num:num});
    };

    $scope.markTarget = function(gid){
        $scope.mark.gid = gid;
        $scope.mark.add = true;
        console.log($scope.mark);
        socket.emit('mark', $scope.mark);
        $scope.mark.mark = '';
    };

    $scope.unmarkTarget = function(gid, mark){
        $scope.mark.gid = gid;
        $scope.mark.mark = mark;
        $scope.mark.add = false;
        console.log($scope.mark);
        socket.emit('mark', $scope.mark);
    };

    $scope.addStack = function(gid, stack=null, num=0){
        $scope.stack.gid = gid;
        $scope.stack.add = true;
        if(stack !== null){
            $scope.stack.stack = stack;
        }
        if(num !== 0){
            $scope.stack.num = num;
        }
        console.log($scope.stack);
        socket.emit('stack', $scope.stack);
        $scope.stack.stack = '';
        $scope.stack.num = 0;
    };

    $scope.removeStack = function(gid, stack){
        $scope.stack.gid = gid;
        $scope.stack.add = false;
        $scope.stack.stack = stack;
        console.log($scope.stack);
        socket.emit('stack', $scope.stack);
    };

    $scope.addCooldown = function(){
        console.log($scope.cooldown.gid, $scope.cooldown);
        socket.emit('activate:ability',$scope.cooldown);

        $scope.togglecd($scope.toAdd,false);
        $scope.cooldown.gid = null;
    };

    $scope.refreshCooldown = function(gid, index, options){
        console.log(gid, index);
        socket.emit('refresh:ability',{
            gid: gid,
            index: index,
            options: options
        });
    };

    $scope.removeCooldown = function(gid, index){
        console.log(gid, index);
        socket.emit('remove:ability',{
            gid: gid,
            index: index
        });
    };

    $scope.reactivate = function(gid, index){
        console.log(gid, index);
        socket.emit('reactivate:ability',{
            gid: gid,
            index: index
        });
    };

    socket.on('ability:effect', function(data){
        switch(data.effect){
            case('heal'):
                $scope.healTarget.gid = data.gid;
                break;
            case('shield'):
                $scope.shieldTarget.gid = data.gid;
                break;
            case('damage'):
                $scope.damageTarget.gid = data.gid;
                break;
        }
    });

    $scope.applyEffect = function(){
        if($scope.damageTarget.gid !== null){
            console.log('damage',$scope.damageTarget);
            socket.emit('damage:target',$scope.damageTarget);

            $scope.damageTarget.gid = null;
        }
        if($scope.healTarget.gid !== null){
            console.log('heal',$scope.healTarget);
            socket.emit('heal:target',$scope.healTarget);

            $scope.healTarget.gid = null;
        }
        if($scope.shieldTarget.gid !== null){
            console.log('shield',$scope.shieldTarget);
            socket.emit('shield:target',$scope.shieldTarget);

            $scope.shieldTarget.gid = null;
        }
    };

    $scope.togglecd = function(gid, change = true) {
        $scope.cd = !$scope.cd;
        if(change){
            if ($scope.cd) {
                $scope.toAdd = gid;
            } else {
                $scope.toAdd = null;
            }
        }
        console.log($scope.toAdd)
    };

    $scope.changeState = function(gid, state){
        console.log(gid, state);
        socket.emit('change:state',{gid: gid, state: state});
    };

    $scope.changeStat = function(gid, stat, val){
        console.log(gid, stat, val);
        socket.emit('change:stat', {gid: gid, stat: stat, val: val});
    };

    $scope.shield = function(){
        console.log($scope.toShield);
        socket.emit('shield',$scope.toShield)
    };

    $scope.heal = function(){
        console.log($scope.toHeal);
        socket.emit('heal',$scope.toHeal)
    };

    $scope.levelUp = function(){
        socket.emit('levelUp');
    };

    $scope.restoreMana = function(val){
        socket.emit('restore:mana',val);
    };

    $scope.damage = function(gid,val){
        socket.emit('damage',{gid:gid, val:val});
    };

    $scope.result = "-";

    $scope.flipCoin = function(){
        var x = Math.floor(Math.random() * 2) === 0;
        if(x){
            $scope.result = 'HEADS';
        }else{
            $scope.result = 'TAILS';
        }
        socket.emit('random', $scope.result);
    };

    socket.on('random',function(data){
        $scope.result = data;
    });

    $scope.rollDie = function(){
        $scope.result = Math.floor(Math.random() * 6) + 1;
        socket.emit('random', $scope.result);
    };

    $scope.fieldbg = '';

    $scope.$watch('state.field[8].card',function(){
        var card = $scope.state.field[8].card;
        if(card !== null){
            $scope.fieldbg = '/static/resources/fields/'+card.id+'.jpg';
        }else{
            $scope.fieldbg = '';
        }
    });

    $scope.enemyfieldbg = '';

    $scope.$watch('state.enemyField[8].card',function(){
        var card = $scope.state.enemyField[8].card;
        if(card !== null){
            $scope.enemyfieldbg = '/static/resources/fields/'+card.id+'.jpg';
        }else{
            $scope.enemyfieldbg = '';
        }
    });

    $scope.isEmpty = function (obj) {
        for (var i in obj){
            if(obj.hasOwnProperty(i))
            {return false;}
        }
        return true;
    };

}]);

