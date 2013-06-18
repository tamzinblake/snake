/* global Crafty */
var devConsole
  , logConsole = function (config) {
      devConsole.innerHTML = 'x: ' + config.x + '<br>'
                           + 'y: ' + config.y + '<br>'
    }
window.onload = function () {
  devConsole = document.getElementById('dev_console')
  var defs = { panel: { xMin: 0
                      , xMax: 400
                      , yMin: 0
                      , yMax: 400
                      }
             , bodyPart: { v: 2.5
                       , components: [ '2D'
                                     , 'DOM'
                                     , 'BodyPart'
                                     , 'bodyPart'
                                     , 'Collision'
                                     ].join(',')
                         }
             , food: { w: 16
                     , h: 16
                     , components: [ '2D'
                                   , 'DOM'
                                   , 'Collision'
                                   , 'food'
                                   , 'Food'
                                   ].join(',')
                     , attr: { x: 192
                             , y: 192
                             , z: 1
                             , v: 0
                             , blockx: 12
                             , blocky: 12
                             , rotation: 0
                             }
                     }
             , player: { w: 16
                       , h: 16
                       , components: [ '2D'
                                     , 'DOM'
                                     , 'bodyPart'
                                     , 'Character'
                                     , 'Collision'
                                     ].join(',')
                       , attr: { x: 192
                               , y: 192
                               , z: 1
                               , v: 2
                               , blockx: 12
                               , blocky: 12
                               , dir: 'right'
                               , movedSince: 0
                               , rotation: 0
                               , maxBodyLength: 8
                               }
                       , controls: { up   : Crafty.keys.UP_ARROW
                                   , down : Crafty.keys.DOWN_ARROW
                                   , left : Crafty.keys.LEFT_ARROW
                                   , right: Crafty.keys.RIGHT_ARROW
                                   }
                       }
             }
  defs.player.attr.xMin = defs.panel.xMin
  defs.player.attr.xMax = defs.panel.xMax - defs.player.w + 1
  defs.player.attr.yMin = defs.panel.yMin
  defs.player.attr.yMax = defs.panel.yMax - defs.player.h + 1
  defs.player.xOrigin = defs.player.w/2+.5
  defs.player.yOrigin = defs.player.h/2+.5

  Crafty.init(defs.panel.xMax ,defs.panel.yMax)
  Crafty.sprite( 16
               , 'snake.png'
               , { bodyPart: [0,0]
                 , food    : [0,1]
                 }
               )

  Crafty.scene('loading' ,function() {
    Crafty.background('#fff')
    Crafty.e('2D ,DOM ,Text')
    .attr({w: 100 ,h: 20 ,x: 150 ,y: 120})
    .text('Loading')
    .css({'text-align': 'center'})
    Crafty.load(['snake.png'] ,function() {
      Crafty.scene('main')
    })
  })

  Crafty.scene('main' ,function () {
    Crafty.c( 'CustomControls'
            , { _controls: copy(defs.player.controls)
              , CustomControls: function () {
                  var me = this
                  me._move = {}
                  var controls = me._controls
                  function keyHandler (me ,value) {
                    return function (e) {
                      var move = me._move
                      for (var p in controls) {
                        if (e.keyCode == controls[p]) move[p] = value
                      }
                    }
                  }
                  me.bind('KeyDown' ,keyHandler(me ,true))
                    .bind('KeyUp'   ,keyHandler(me ,false))
                  return me
                }
              }
            )

    Crafty.c( 'Food'
            , { die: function () {
                  var me = this
                  me.blockx = Math.floor(Math.random()*25)
                  me.blocky = Math.floor(Math.random()*25)
                  me.x = 16 * me.blockx
                  me.y = 16 * me.blocky
                  return me
                }
              }
            )

    Crafty.c( 'BodyPart'
            , { BodyPart: function () {
                  var me = this
                  return me
                }
              }
            )

    Crafty.c( 'Character'
            , { Character: function () {
                  var me = this
                  me._move = {}
                  me._body = []
                  me.die = function () {
                    me.reset()
                  }
                  me.reset = function() {
                    for (var prop in defs.player.attr) {
                      me[prop] = defs.player.attr[prop]
                    }
                  }
                  me.grow = function () {
                    if (me._body.length >= me.maxBodyLength) return
                    var bodyPart = Crafty.e( defs.bodyPart.components
                                           )
                                 .attr({ x: me.x
                                       , y: me.y
                                       , rotation: me.rotation
                                       , blockx: me.blockx - 1
                                       , blocky: me.blocky - 1
                                       , parent: me
                                       })
                                 .BodyPart()
                                 .origin(1.5,1.5)
                    me._body.push(bodyPart)
                  }
                  me.bind('EnterFrame' ,function (e) {
                    var move = me._move
                    me.dir = me.dir == 'up'    ? move.right ? 'right'
                                               : move.left  ? 'left' : 'up'
                           : me.dir == 'right' ? move.up    ? 'up'
                                               : move.down  ? 'down' : 'right'
                           : me.dir == 'down'  ? move.right ? 'right'
                                               : move.left  ? 'left' : 'down'
                           : me.dir == 'left'  ? move.up    ? 'up'
                                               : move.down  ? 'down' : 'left'
                           : me.dir

                    me.movedSince++

                    if (me.movedSince > 50/me.v) {

                      for (var i = me._body.length - 1 ;i > 0 ;i++) {
                        me._body[i].blockx = me._body[i-1].blockx
                        me._body[i].blocky = me._body[i-1].blocky
                        me._body[i].x = 16 * me._body[i].blockx
                        me._body[i].y = 16 * me._body[i].blocky
                      }

                      if (me._body.length) {
                        me._body[0].blockx = me.blockx
                        me._body[0].blocky = me.blocky
                        me._body[i].x = 16 * me._body[i].blockx
                        me._body[i].y = 16 * me._body[i].blocky
                      }

                      me.blocky += me.dir == 'up'    ? -1
                                 : me.dir == 'down'  ?  1 : 0
                      me.blockx += me.dir == 'left'  ? -1
                                 : me.dir == 'right' ?  1 : 0

                      if (me.blockx < 0)  me.blockx = 0
                      if (me.blockx > 24) me.blockx = 24
                      if (me.blocky < 0)  me.blocky = 0
                      if (me.blocky > 24) me.blocky = 24

                      me.x = 16 * me.blockx
                      me.y = 16 * me.blocky

                      me.movedSince = 0
                    }

                    if (me.log) logConsole({x: me.x ,y: me.y})
                  })
                  me.onHit('bodyPart' ,function (e) {
                    me.die()
                  })
                  me.onHit('food' ,function (e) {
                    for (var i = 0 ;i < e.length ;i++) {
                      e[i].obj.die()
                      player.v += 1
                      player.score += 1
                      player.grow()
                    }
                  })
                  return me
                }
              }
            )

    var player = Crafty.e(defs.player.components + ',CustomControls')
                 .attr(copy(defs.player.attr))
                 .CustomControls()
                 .Character()
                 .origin(defs.player.xOrigin ,defs.player.yOrigin)

    var food = Crafty.e(defs.food.components)
               .attr(copy(defs.food.attr))
               .die()
               .origin(defs.player.xOrigin ,defs.player.yOrigin)

//    player.log = true

  })

  Crafty.scene('loading')
}

function copy (o) {
  var rv = {}
  for (var p in o) {
    rv[p] = o[p]
  }
  return rv
}
