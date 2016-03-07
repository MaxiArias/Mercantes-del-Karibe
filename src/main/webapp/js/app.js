var ShipsType = {
  Submarine: 'submarine',
  Blue: 'blue',
  Green: 'green'
};

var WebSocketIDs = {
  UpdateCoordinates: 'updateCoordinates',
  BulletShot: 'bulletShot',
  BulletShotDouble: 'bulletShotDouble',
  MissileShot: 'missileShot',
  LightOnOff: 'lightOnOff',
  ShipArrived: 'shipArrived',
  ShipsCollided: 'shipsCollided',
  ShipShot: 'shipShot',
  GameOver: 'gameOver',
  GamePaused: 'gamePaused',
  ShipLeft: 'shipLeft'
};

var GameResults = {
  Draw: 'draw',
  Nazis: 'nazis',
  Uruguay: 'uruguay'
}

var ShipStates = {
  Alive: 'alive',
  Destroyed: 'destroyed',
  Arrived: 'arrived'
}

var Strings = {
  PlayerArrived: 'Has llegado a Nueva York.',
  ShipArrivedBlue: 'El carguero azul ha llegado a Nueva York.',
  ShipArrivedGreen: 'El carguero verde ha llegado a Nueva York.',
  PlayerCollided: 'Has impactado con otra embarcación.',
  CollisionSubmarineBlue: 'El submarino y el carguero azul han impactado.',
  CollisionSubmarineGreen: 'El submarino y el carguero verde han impactado.',
  CollisionBlueGreen: 'El carguero azul y el carguero verde han impactado.',
  PlayerKilled: 'Te han destruido.',
  ShipKilledSubmarine: 'El submarino ha sido destruido.',
  ShipKilledBlue: 'El carguero azul ha sido destruido.',
  ShipKilledGreen: 'El carguero verde ha sido destruido.',
  SubmarineLeft: 'El submarino abandono la partida.',
  ShipBlueLeft: 'El carguero azul abandono la patida.',
  ShipGreenLeft: 'El carguero verde abandono la partida.'
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
  results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var height = window.innerHeight;
var width = window.innerWidth;

var app = (function  () {
  var cursors, game, pauseButton,
  gameContainer = 'game-container',
  submarine, blue, green, ship,
  caribbean, ny, mvd, mask, players,
  currentSpeed, shipType, fromLoad;

  var addPlayer = function(name, role) {
    $("#players-list").html(name);
  }

  $(document).ready(function() {
    $('body').keydown(function(e){
      if(e.which === 13) {
        var $btnNext = $(".button-next");
        if ($btnNext) {
          $btnNext.click();
        }
      }
    });

    $("#btn-save").click(function() {
      ships.saveShips(players, true);
      map.saveMap();
    });

    $("#btn-route-ok").click(function() {
      $("#safe-route-dialog").hide();
    });

    $(".insert-nickname").hide();
    $(".select-sides").hide();

    $(".button-play").click(function(event) {
      $(".main-menu").hide();
      $(".insert-nickname")
        .show();

      // Guardo que la partida se inicia normalemente y no desde reanudar
      fromLoad = false;
    });

    $("#btn-load-game").click(function(event) {
      $(".main-menu").hide();
      $(".insert-nickname")
        .show();

      // Guardo que la partida se inicia desde reanudar
      fromLoad = true;
    });

    $(".button-prev").click(function() {
      $(".main-menu").show();
      $(".insert-nickname").hide();
      $(".select-sides").hide();
    });

    $(".button-next").click(function() {
      $(".main-menu").hide();
      $(".insert-nickname").hide();
      $(".select-sides").show();

      var nickname = $("#insert-nickname").val();
      webSocket.init(fromLoad, nickname);

      //Solicito los usuarios conectados
      setTimeout(function() {
        var message = {
          id: "getUsersConnected",
          message: ""
        }

        webSocket.sendMessage(message);
      }, 2000); 

      webSocket.setOnMessage(function(msg) {
        var jsonMsg = JSON.parse(msg.data);
        
        //Obtengo los usuarios conectados
        if (jsonMsg.id == "getUsersConnected") {
          addPlayer(jsonMsg.message);
        }

        if (jsonMsg.id == "initGame") {
          players = JSON.parse(jsonMsg.message);

          if (fromLoad) {
            map.fromLoad();
            ships.fromLoad();
          }

          setTimeout(function() {
            $.each(players, function(i, player) {
              if (player.name == $("#insert-nickname").val()) {
                webSocket.setUser(player.role);
                if (player.role == ShipsType.Submarine) {
                  init(player.role);
                } else {
                  setTimeout(function() {
                    init(player.role); //Comienzo Juego
                  }, 2000);     
                }         
              }
            });
          }, 500);
        }
      });
    });
  });

  var init = function(_shipType) {
    shipType = _shipType;

    game = new Phaser.Game(width, height, Phaser.AUTO, gameContainer, { 
      preload: preload, 
      create: create, 
      update: update, 
      render: render 
    });
    //Foco al juego
    $('#game-title').remove();
    $('.select-sides').remove();
  };

  function render() {}

  function preload() 
  {
    game.load.image('empty', 'assets/empty.png');
    game.load.image('water', 'assets/pattern-water.png');
    game.load.image('land', 'assets/pattern-land.png');
    game.load.image('port', 'assets/port.png');
    game.load.image('submarine', 'assets/submarine-red.png');
    game.load.image('blue', 'assets/ship-blue.png');
    game.load.image('green', 'assets/ship-green.png');
    game.load.image('island', 'assets/pattern-island.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('missile', 'assets/missile.png');
  }

  function create() {
    // Inicio el motor fisico
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Inicio todo lo relacionado al mapa del juego
    var admin = (shipType == ShipsType.Submarine);
    map.fromLoad(false);
    map.init(game, admin, fromLoad);
    
    // Inicio las naves
    ships.init(players, game, admin, fromLoad);

    submarine = ships.getSubmarine();
    blue = ships.getBlue();
    green = ships.getGreen();

    switch (shipType) {
      // Player submarino
      case ShipsType.Submarine: setPlayerShip(submarine); break;
      case ShipsType.Blue: setPlayerShip(blue); break;
      case ShipsType.Green: setPlayerShip(green); break;
    }

    /* ------------- */
    /* ---- HUD ---- */
    /* ------------- */

    // Creo el <div> para el HUD
    $('div#game-container').prepend('<div id="hud"></div>');
    //  Agrego las vidas
    $('div#hud').append('<img id="lives" />');
    var livesImageUrl = 'assets/lives-' + ship.el.health + '.png';
    $('div#hud img#lives').attr('src', livesImageUrl);
    // Agrego el <p> para los mensajes
    $('div#hud').append('<p id="messages"></p>');
    $('#hud #messages').text('');

    // Seteo que la camara siga al submarino
    game.camera.follow(ship.el);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();

    game.input.activePointer.x = ship.x;
    game.input.activePointer.y = ship.y;
    
    // Seteo el boton de pausa
    pauseButton = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
    pauseButton.onDown.add(listenerPause, this);

    // Muestro la ruta segura
    showSafeRoute();  

    /* ------------------------------------- */
    /* ---- COMPORTARMIENTO MENSAJES WS ---- */
    /* ------------------------------------- */

    webSocket.setOnMessage(function (message) {
      try {
        var jsonMsg = JSON.parse(message.data);

        switch (jsonMsg.id) {

          // Update de la posicion de los barcos
          case WebSocketIDs.UpdateCoordinates:
          if (jsonMsg.user != ship.el.type) {
            if (jsonMsg.user == ShipsType.Submarine) {
              submarine.el.x = jsonMsg.x;
              submarine.el.y = jsonMsg.y;
              submarine.el.rotation = jsonMsg.rotation;
            }

            if (jsonMsg.user == ShipsType.Blue) {
              blue.el.x = jsonMsg.x;
              blue.el.y = jsonMsg.y;
              blue.el.rotation = jsonMsg.rotation;
            }

            if (jsonMsg.user == ShipsType.Green) {
              green.el.x = jsonMsg.x;
              green.el.y = jsonMsg.y;
              green.el.rotation = jsonMsg.rotation;
            }
          }
          break;

          // Update de la luz
          case WebSocketIDs.LightOnOff:
          if (jsonMsg.user == ShipsType.Blue) {
            blue.light = jsonMsg.value;
          }

          if (jsonMsg.user == ShipsType.Green) {
            green.light = jsonMsg.value;
          }
          break;

          // Update del disparo azul
          case WebSocketIDs.BulletShotDouble:
          blue.fireBullet();
          break;

          // Update del disparo bala submarino
          case WebSocketIDs.BulletShot:
          submarine.fireBullet();
          break;

          // Update del misil submarino
          case WebSocketIDs.MissileShot:
          submarine.fireMissile();
          break;

          // Update carguero llega al puerto
          case WebSocketIDs.ShipArrived:
          if (jsonMsg.ship == ShipsType.Blue) {
              // Azul llego a NY
              blue.el.kill();
              blue.state = ShipStates.Arrived;
              if (ship.el.type == ShipsType.Blue) {
                $('#hud #messages').text(Strings.PlayerArrived);
              } else {
                $('#hud #messages').text(Strings.ShipArrivedBlue);
              }
            } else {
              // Verde llego a NY
              green.el.kill();
              green.state = ShipStates.Arrived;
              if (ship.el.type == ShipsType.Green) {
                $('#hud #messages').text(Strings.PlayerArrived);
              } else {
                $('#hud #messages').text(Strings.ShipArrivedGreen);
              }
            }
            break;

          // Update colision entre barcos
          case WebSocketIDs.ShipsCollided:
          var shipOne = jsonMsg.shipOne;
          var shipTwo = jsonMsg.shipTwo;
          if ((shipOne == ShipsType.Submarine || shipTwo == ShipsType.Submarine)
            && (shipOne == ShipsType.Blue || shipTwo == ShipsType.Blue)) {

              // Submarino vs azul
            submarine.el.kill();
              submarine.state = ShipStates.Destroyed;
            blue.el.kill();
              blue.state = ShipStates.Destroyed;
            if (ship.el.type == shipOne || ship.el.type == shipTwo) {
                $('#hud #messages').text(Strings.PlayerCollided);
            } else {
                $('#hud #messages').text(Strings.CollisionSubmarineBlue);
            }

          } else if ((shipOne == ShipsType.Submarine || shipTwo == ShipsType.Submarine)
            && (shipOne == ShipsType.Green || shipTwo == ShipsType.Green)) {

              // Submarino vs verde
              submarine.el.kill();
              submarine.state = ShipStates.Destroyed;
              green.el.kill();
              green.state = ShipStates.Destroyed;
              if (ship.el.type == shipOne || ship.el.type == shipTwo) {
                $('#hud #messages').text(Strings.PlayerCollided);
              } else {
                $('#hud #messages').text(Strings.CollisionSubmarineGreen);
              }
            } else {

              // Azul vs verde
              blue.el.kill();
              blue.state = ShipStates.Destroyed;
              green.el.kill();
              green.state = ShipStates.Destroyed;
              if (ship.el.type == shipOne || ship.el.type == shipTwo) {
                $('#hud #messages').text(Strings.PlayerCollided);
              } else {
                $('#hud #messages').text(Strings.CollisionBlueGreen);
              }
            }
            break;

          // Update barco disparado
          case WebSocketIDs.ShipShot:
          switch (jsonMsg.ship) {
            case ShipsType.Submarine: 
                var destroyed = submarine.damage(jsonMsg.ammo);
                if (destroyed) {
                  $('#hud #messages').text(Strings.ShipKilledSubmarine);
                }
            submarine.el.kill();
                $('#hud #messages').text(Strings.ShipKilledSubmarine);
            break;
            case ShipsType.Blue: 
                var destroyed = blue.damage(jsonMsg.ammo);
                if (destroyed) {
                  if (ship.el.type == ShipsType.Blue) {
                    $('#hud #messages').text(Strings.PlayerKilled);
                  } else {
                    $('#hud #messages').text(Strings.ShipKilledBlue);
                  }
            }
                
            break;
            case ShipsType.Green: 
                var destroyed = green.damage(jsonMsg.ammo);
                if (destroyed) {
                  if (ship.el.type == ShipsType.Green) {
                    $('#hud #messages').text(Strings.PlayerKilled);
                  } else {
                    $('#hud #messages').text(Strings.ShipKilledGreen);
                  }
            }
            break;
          }
          break;

          // Update fin del juego
          case WebSocketIDs.GameOver:
            toggleGameOver();
            break;

          //Si un jugador cierra la sesion, debe de morir su nave.  
          case WebSocketIDs.ShipLeft:
            switch (jsonMsg.name) {
              case ShipsType.Submarine: 
                submarine.el.kill();
                submarine.state = ShipStates.Destroyed;
                $('#hud #messages').text(Strings.SubmarineLeft);
                //ENVIO
              break;
              case ShipsType.Blue:
                blue.el.kill();
                blue.state = ShipStates.Destroyed;
                $('#hud #messages').text(Strings.ShipBlueLeft);
              break;
              case ShipsType.Green:
                green.el.kill();
                green.state = ShipStates.Destroyed;
                $('#hud #messages').text(Strings.ShipGreenLeft);
              break;       
            } 
           break; 
          // Update pausa
          case WebSocketIDs.GamePaused:
          console.log("Pausa " + jsonMsg.user);
            togglePause(jsonMsg.user);
            break;

        }
      
        // Actualizo las vidas en el HUD
        updateLivesImage();
      } catch(err) {
        console.log(err);
      }   
    });
}


function update() {
  caribbean = map.getCaribbean();
  ny = map.getNY();
  mvd = map.getMvd();
    
    mask = ship.vision;
    game.world.mask = mask;

    mask.x = ship.el.body.x + 36;
    mask.y = ship.el.body.y + 36;

    /* -------------------- */
    /* ---- COLISIONES ---- */
    /* -------------------- */

    // Los barcos chocan contra la tierra pero no se hunden
    game.physics.arcade.collide([ny.land, mvd.land, caribbean.islands], ship.el);

    game.physics.arcade.collide([ny.land, mvd.land, caribbean.islands], 
      submarine.missile, function() {
        submarine.missile.kill();
      });
    game.physics.arcade.collide([ny.land, mvd.land, caribbean.islands], 
      submarine.bullet, function() {
        submarine.bullet.kill();
      });
    game.physics.arcade.collide([ny.land, mvd.land, caribbean.islands], 
      blue.bulletLeft, function() {
        blue.bulletLeft.kill();
      });
    game.physics.arcade.collide([ny.land, mvd.land, caribbean.islands], 
      blue.bulletRight, function() {
        blue.bulletRight.kill();
      });

    /* El jugador del submarino detecta las colisiones 
    y las envia al WS unicamente él para evitar mensajes repetidos */
    if (ship.el.type == ShipsType.Submarine) {

      game.physics.arcade.collide([ny.shore, mvd.shore], submarine.el);

      /* Si el barco tiene la luz apagada, el submarino
      lo ve solo dentro de un radio de 200.
      Si el barco tiene la luz prendida, el submarino lo ve siempre */ 

      // Actualizo la luz del barco azul
      if (blue.light == false 
        && game.physics.arcade.distanceBetween(submarine.el, blue.el) > 400) {
        blue.el.alpha = 0;
    } else {
      blue.el.alpha = 1;
    }

      // Actualizo la luz del barco verde
      if (green.light == false 
        && game.physics.arcade.distanceBetween(submarine.el, green.el) > 400) {
        green.el.alpha = 0;
    } else {
      green.el.alpha = 1;
    } 

      // Submarino vs azul
      game.physics.arcade.overlap(blue.el, submarine.el, function() {
        blue.el.kill();
        blue.state = ShipStates.Destroyed;

        submarine.el.kill();
        submarine.state = ShipStates.Destroyed;
        var message = {
          id: WebSocketIDs.ShipsCollided,
          shipOne: ShipsType.Submarine,
          shipTwo: ShipsType.Blue,
        }
        webSocket.sendMessage(message);
        $('#hud #messages').text(Strings.PlayerCollided);

        // Actualizo las vidas en el HUD
        updateLivesImage();

      });

      // Submarino vs verde
      game.physics.arcade.overlap(green.el, submarine.el, function() {
        green.el.kill();
        green.state = ShipStates.Destroyed;

        submarine.el.kill();
        submarine.state = ShipStates.Destroyed;
        var message = {
          id: WebSocketIDs.ShipsCollided,
          shipOne: ShipsType.Submarine,
          shipTwo: ShipsType.Green,
        }
        webSocket.sendMessage(message);
        $('#hud #messages').text(Strings.PlayerCollided);

        // Actualizo las vidas en el HUD
        updateLivesImage();
      });

      // Azul vs verde
      game.physics.arcade.overlap(green.el, blue.el, function() {
        green.el.kill();
        green.state = ShipStates.Destroyed;

        blue.el.kill();
        blue.state = ShipStates.Destroyed;
        var message = {
          id: WebSocketIDs.ShipsCollided,
          shipOne: ShipsType.Blue,
          shipTwo: ShipsType.Green,
        }
        webSocket.sendMessage(message);
        $('#hud #messages').text(Strings.CollisionBlueGreen);
      });

      /* ----------------------------- */
      /* ---- COLISIONES DISPAROS ---- */
      /* ----------------------------- */

      // Submarino vs bulletLeft
      game.physics.arcade.overlap(blue.bulletLeft, submarine.el, function() {
        blue.bulletLeft.kill();
        var message = {
          id: WebSocketIDs.ShipShot,
          ship: ShipsType.Submarine,
          ammo: 'bullet'
        }
        webSocket.sendMessage(message);
        var destroyed = submarine.damage('bullet');
        if (destroyed) {
          $('#hud #messages').text(Strings.PlayerKilled);
        }

      });

      // Submarino vs bulletRight
      game.physics.arcade.overlap(blue.bulletRight, submarine.el, function() {
        blue.bulletRight.kill();   
        var message = {
          id: WebSocketIDs.ShipShot,
          ship: ShipsType.Submarine,
          ammo: 'bullet'
        }
        webSocket.sendMessage(message);
        var destroyed = submarine.damage('bullet');
        if (destroyed) {
          $('#hud #messages').text(Strings.PlayerKilled);
        }

      });

      // Azul vs bullet
      game.physics.arcade.overlap(submarine.bullet, blue.el, function() {
        submarine.bullet.kill();
        var message = {
          id: WebSocketIDs.ShipShot,
          ship: ShipsType.Blue,
          ammo: 'bullet'
        }
        webSocket.sendMessage(message);
        var destroyed = blue.damage('bullet');
        if (destroyed) {
          $('#hud #messages').text(Strings.ShipKilledBlue);
        }
      });

      // Azul vs misil
      game.physics.arcade.overlap(submarine.missile, blue.el, function() {
        submarine.missile.kill();
        var message = {
          id: WebSocketIDs.ShipShot,
          ship: ShipsType.Blue,
          ammo: 'missile'
        }
        webSocket.sendMessage(message);
        var destroyed = blue.damage('missile');
        if (destroyed) {
          $('#hud #messages').text(Strings.ShipKilledBlue);
        }
      });

      // Verde vs bulletLeft
      game.physics.arcade.overlap(blue.bulletLeft, green.el, function() {
        blue.bulletLeft.kill();
        var message = {
          id: WebSocketIDs.ShipShot,
          ship: ShipsType.Green,
          ammo: 'bullet'
        }
        webSocket.sendMessage(message);
        var destroyed = green.damage('bullet');
        if (destroyed) {
          $('#hud #messages').text(Strings.ShipKilledGreen);
        }
      });

      // Verde vs bulletRight
      game.physics.arcade.overlap(blue.bulletRight, green.el, function() {
        blue.bulletRight.kill();
        var message = {
          id: WebSocketIDs.ShipShot,
          ship: ShipsType.Green,
          ammo: 'bullet'
        }
        webSocket.sendMessage(message);
        var destroyed = green.damage('bullet');
        if (destroyed) {
          $('#hud #messages').text(Strings.ShipKilledGreen);
        }
      });

      // Verde vs bullet
      game.physics.arcade.overlap(submarine.bullet, green.el, function() {
        submarine.bullet.kill();
        var message = {
          id: WebSocketIDs.ShipShot,
          ship: ShipsType.Green,
          ammo: 'bullet'
        }
        webSocket.sendMessage(message);
        var destroyed = green.damage('bullet');
        if (destroyed) {
          $('#hud #messages').text(Strings.ShipKilledGreen);
        }
      });

      // Verde vs misil
      game.physics.arcade.overlap(submarine.missile, green.el, function() {
        submarine.missile.kill();
        var message = {
          id: WebSocketIDs.ShipShot,
          ship: ShipsType.Green,
          ammo: 'missile'
        }
        webSocket.sendMessage(message);
        var destroyed = green.damage('missile');
        if (destroyed) {
          $('#hud #messages').text(Strings.ShipKilledGreen);
        }
      });

      /* --------------------------- */
      /* ---- LLEGAN CARGUEROS ---- */
      /* --------------------------- */
      game.physics.arcade.overlap(ny.port, blue.el, function() {
        // Destruye al carguero
        blue.el.kill();
        blue.state = ShipStates.Arrived;
        // Notifica al WS
        var message = {
          id: WebSocketIDs.ShipArrived,
          ship: ShipsType.Blue
        };
        webSocket.sendMessage(message);
        $('#hud #messages').text(Strings.ShipArrivedBlue);
      });

      game.physics.arcade.overlap(ny.port, green.el, function() {
        // Destruye al carguero
        green.el.kill();
        green.state = ShipStates.Arrived;
        // Notifica al WS
        var message = {
          id: WebSocketIDs.ShipArrived,
          ship: ShipsType.Green
        };
        webSocket.sendMessage(message);
        $('#hud #messages').text(Strings.ShipArrivedGreen);
      });


    } else {
      game.physics.arcade.overlap(submarine.missile, green.el, function() { submarine.missile.kill(); });
      game.physics.arcade.overlap(submarine.bullet, green.el, function() { submarine.bullet.kill(); });
      game.physics.arcade.overlap(blue.bulletRight, green.el, function() { blue.bulletRight.kill(); });
      game.physics.arcade.overlap(blue.bulletLeft, green.el, function() { blue.bulletLeft.kill(); });
      game.physics.arcade.overlap(submarine.missile, blue.el, function() { submarine.missile.kill(); });
      game.physics.arcade.overlap(submarine.bullet, blue.el, function() { submarine.bullet.kill(); });
      game.physics.arcade.overlap(blue.bulletRight, submarine.el, function() { blue.bulletRight.kill(); });
      game.physics.arcade.overlap(blue.bulletLeft, submarine.el, function() { blue.bulletLeft.kill(); });
    }

    ship.update(cursors);
    //Cada jugador valida si se termino el juego
    var gameOver = checkGameOver();
    if (gameOver != null) {
      toggleGameOver();
    }
  }
  
  var setPlayerShip = function(_ship) {
    ship = _ship;
  };

  var showSafeRoute = function() {
    // Detecto donde se genero el submarino
    var strSubmarineSpotted ;
    var worldThird = map.worldBounds.xBottomRight;
    if (submarine.el.x < worldThird) {
      strSubmarineSpotted = 'oeste ';
    } else if (submarine.el.x < worldThird * 2){
      strSubmarineSpotted = 'central ';
    } else {
      strSubmarineSpotted = 'este ';
    }

    // Asigno una ruta segura
    var strSafeRouteSide;
    var rndRoute = game.rnd.integerInRange(0, 1);
    if (strSubmarineSpotted == 'oeste ') {
      // submarino en el oeste
      if (rndRoute == 0) {
        strSafeRouteSide = 'centro';
      } else {
        strSafeRouteSide = 'este';
      }
    } else if (strSubmarineSpotted == 'central ') {
      // submarino en el centro
      if (rndRoute == 0) {
        strSafeRouteSide = 'oeste';
      } else {
        strSafeRouteSide = 'este';
      }
    } else {
      // submarino en el este
      if (rndRoute == 0) {
        strSafeRouteSide = 'oeste';
      } else {
        strSafeRouteSide = 'centro';
      }
    }

    // creo el texto de la ruta segura
    var strSafeRoute = 'Capitan, hemos detectado un submarino enemigo en la zona ';
    strSafeRoute += strSubmarineSpotted;
    strSafeRoute += ' del Caribe. Tome precauciones y evitelo navegando por el ';
    // muestro el dialog de la ruta segura
    if (ship.el.type == ShipsType.Blue || ship.el.type == ShipsType.Green) {
      $('div#safe-route-dialog').css('display', 'inherit');
      $('div#safe-route-dialog #submarine-spotted').text(strSafeRoute);
      $('div#safe-route-dialog #safe-route').text(strSafeRouteSide);
    }
  }

  var updateLivesImage = function() {
    // Obtengo el estado del barco
    var shipState;
    switch (ship.el.type) {
      case ShipsType.Submarine:
          shipState = submarine.state;
        break;
      case ShipsType.Blue:
          shipState = blue.state;
        break;
      case ShipsType.Green:
          shipState = green.state;
        break;
    }

    // Muestro la cantidad de vidas que le quedan
    var livesImageUrl;
    switch (shipState) {
      case ShipStates.Destroyed:
        livesImageUrl = 'assets/lives-0.png';
        break;
      case ShipStates.Alive:
        livesImageUrl = 'assets/lives-' + ship.el.health + '.png';
        break;
    }
    $('div#hud img#lives').attr('src', livesImageUrl);
  }

  function listenerPause() {
    togglePause(ship.el.type);
  }

  function togglePause(shipType) {
    console.log('togglePause antes ' + shipType + ' ' + game.paused);
    var strPlayer;
    
    game.paused = (game.paused) ? false : true;
    if (shipType == ship.el.type) {

      var message = {
        id: WebSocketIDs.GamePaused
      }
      webSocket.sendMessage(message);
    }
    console.log('togglePause despues ' + shipType + ' ' + game.paused);

    if (game.paused) {
      console.log('adentro if');
      switch (shipType) {
        case ShipsType.Submarine:
          strPlayer = 'submarino';
          break;
        case ShipsType.Blue:
          strPlayer = 'carguero azul';
          break;
        case ShipsType.Green:
          strPlayer = 'carguero verde';
          break;
      }
      $('#menu-pause').css('display', 'inherit');
      $('#menu-pause #paused-by').text('Juego pausado por el ' + strPlayer);
    } else {
      $('#menu-pause').css('display', 'none');
    } 
  }

  function toggleGameOver() {
    $('#hud #messages').text('Fin del juego');
    game.paused = true;
  }

  var checkGameOver = function() {
    var gameOver = false;
    var result = null;
    var message = null;

    // Llegaron los cargueros
    if (blue.state == ShipStates.Arrived 
      && green.state == ShipStates.Arrived) {
      console.log('Llegaron los cargueros');
    gameOver = true;
    result = GameResults.Uruguay;
    } else if (submarine.state == ShipStates.Destroyed 
      && (blue.state == ShipStates.Alive || blue.state == ShipStates.Arrived) 
      && (green.state == ShipStates.Alive || green.state == ShipStates.Arrived)) {
      // Murio el submarino y los cargueros siguen vivos o llegaron
      console.log('Murio el submarino y los cargueros siguen vivos o llegaron');
      gameOver = true;
      result = GameResults.Uruguay;
    } else if (submarine.state == ShipStates.Alive 
      && blue.state == ShipStates.Destroyed  
      && green.state == ShipStates.Destroyed) {
      // Murieron los cargueros y el submarino sigue vivo
      console.log('Murieron los cargueros y el submarino sigue vivo');
      gameOver = true;
      result = GameResults.Nazis;
    } else if (submarine.state == ShipStates.Destroyed 
      && (blue.state == ShipStates.Destroyed || green.state == ShipStates.Destroyed)) {
        // Murio el submarino y murio algun carguero
        console.log('Murio el submarino y murio algun carguero');
        gameOver = true;
        result = GameResults.Draw;
      }
      if (gameOver) {
        console.log("RESULTADO: " + result);
        message = {
          id: WebSocketIDs.GameOver,
          result: result,
        submarine: submarine.state,
        blue: blue.state,
        green: green.state
        }; 
      }
      return message;
    }

  })();