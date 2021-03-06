var touches = require('touches')

var colors = ['gold', 'darkblue']
var width = document.body.offsetWidth
var height = window.innerHeight

alert(width);


//get a 2D canvas context
var ctx = require('2d-context')({
    width: width,
    height: height
})

//setup our scroll physics
var scroller = require('./')({
    totalCells: 8,
    viewSize: width,
    cellSize: width,
    gutterSize: width/2,
    dipToClosestCell: true
})

//start rendering every frame
require('raf-loop')(draw).start()

//setup DOM when ready
require('domready')(function() {
    document.body.appendChild(ctx.canvas)
    document.body.style.overflow = 'hidden'
    listen(ctx.canvas)
})

//draw our scene
function draw(dt) {
    //tick with milliseconds
    scroller.update(dt)

    //background
    ctx.fillStyle = '#3b3b3b'
    ctx.fillRect(0, 0, width, height)

    ctx.save()
    ctx.translate(-scroller.value, 0)
    //draw each cell
    for (var i=0; i<scroller.totalCells; i++) {
        var cellWidth = scroller.cellSize,
            cellHeight = height

        ctx.fillStyle = colors[i%colors.length]
        ctx.fillRect(i*cellWidth, 0, cellWidth, cellHeight)
    }
    ctx.restore()

    //border
    ctx.lineWidth = 6
    ctx.strokeStyle = '#7bb3d6'
    ctx.strokeRect(0, 0, width, height)
}

function listen(element) {
    //listen for drag events on the window,
    //but use our canvas as the target
    var events = touches(document, { 
        target: element,
        filtered: true 
     })
    
    //call the start(), move() and end() functions of scroller physics
    ;['start', 'move', 'end'].forEach(function(name) {
        events.on(name, function(ev, pos) {
            ev.preventDefault()
            
            //skip touch down if outside of element
            if (name === 'start' && !within(pos, element))
                return

            //mouse X position
            var x = pos[0]
            scroller[name](x)
        })
    })
}

//mousedown should be ignored outside the element
function within(position, element) {
    var rect = element.getBoundingClientRect()
    return position[0] >= 0
        && position[1] >= 0
        && position[0] <  rect.width
        && position[1] <  rect.height
}

//quick check to see if we are in an iframe
function inIFrame() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}