// function newElement creates a html element with a class
function newElement(tagName, className) {
    const element = document.createElement(tagName)
    element.className = className
    return element
}

// this function creates a barrier element and two other elements, the border and the body, which are appended
// to the barrier element to create it, verifying if it is the upperBarrier or the lowerBarrier
function Barrier(upsideDown = false) {
    this.element = newElement('div', 'barrier')

    const border = newElement('div', 'border')
    const body = newElement('div', 'body')
    this.element.appendChild(upsideDown ? body : border)
    this.element.appendChild(upsideDown ? border : body)

    this.setHeight = (height) => body.style.height = `${height}px`
}

// this creates the element "pair-of-barriers", and creates two barrier instances, the upper and the lower, which
// are appended to the 'pair-of-barriers' element.
function PairOfBarriers(height, gap, x) {
    this.element = newElement('div', 'pair-of-barriers')

    this.upperBarrier = new Barrier(true)
    this.lowerBarrier = new Barrier(false)

    this.element.appendChild(this.upperBarrier.element)
    this.element.appendChild(this.lowerBarrier.element)

    // this function sets a random size for the upperBarrier, and then for the lowerBarrier, respecting the size of the gap
    this.randomGap = () => {
        const upperBarrierHeight = Math.random() * (height - gap)
        const lowerBarrierHeight = height - gap - upperBarrierHeight
        this.upperBarrier.setHeight(upperBarrierHeight)
        this.lowerBarrier.setHeight(lowerBarrierHeight)
    }

    // functions about the position of the pair-of-barriers
    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.randomGap()
    this.setX(x)
}

// creates a set of 4 barriers (remember that "height" and "width" are properties with the size of the game area)
function AllBarriers(height, width, gap, spaceBetween, notifyPoint) {
    this.pairs = [
        new PairOfBarriers(height, gap, width),
        new PairOfBarriers(height, gap, width + spaceBetween),
        new PairOfBarriers(height, gap, width + spaceBetween * 2),
        new PairOfBarriers(height, gap, width + spaceBetween * 3)
    ]

    // this function moves the pairs-of-barriers to the left, based on the "movingSpeed"
    const movingSpeed = 3
    this.animate = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - movingSpeed)
            
            // to pass the barrier from left side to the right side of the screen
            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + spaceBetween * this.pairs.length)
                pair.randomGap()
            }
            
            const middle = width / 2
            const passedMiddle = pair.getX() + movingSpeed >= middle && pair.getX() < middle
            if (passedMiddle) notifyPoint()
        })
    }
}

// this function makes the bird go up and down, its position is based on the bottom of the element(img)
function Bird(height) {
    let flying = false

    this.element = newElement('img', 'bird')
    this.element.src = 'style/flappyIMG.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = (y) => this.element.style.bottom = `${y}px`

    window.onkeydown = (e) => flying = true
    window.onkeyup = (e) => flying = false

    // moves the bird up or down in a specific move speed, depending on flying true or false
    this.animate = () => {
        const newY = this.getY() + (flying ? 8 : -5)
        const maxHeight = height - this.element.clientHeight

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= maxHeight) {
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }
    }

    this.setY(height/2)
}

// Shows the points on screen
function Progress() {
    this.element = newElement('span', 'progress')
    this.updatePoints = (points) => {
        this.element.innerHTML = points
    }

    this.updatePoints(0)
}

// this function gets the rectangle associated with each element and see if they are touching
function checkCollision(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    // left + width = right side
    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    // top + height = bottom
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top

    return horizontal && vertical
}

function touched(bird, barriers) {
    let touched = false
    barriers.pairs.forEach(pair => {
        if(!touched) {
            const upper = pair.upperBarrier.element
            const lower = pair.lowerBarrier.element

            touched = checkCollision(bird.element, upper) || checkCollision(bird.element, lower)
        }
    })
    return touched
}

// this function runs the game (creates all the elements and make them move, also counting the points)
function FlappyBirdGame() {
    let points = 0

    const gameArea = document.querySelector("#game")
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const progress = new Progress()
    const allBarriers = new AllBarriers(height, width, 200, 400, () => progress.updatePoints(++points))
    const bird = new Bird(height)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    allBarriers.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
        const timer = setInterval(() => {
            allBarriers.animate()
            bird.animate()

            if (touched(bird, allBarriers)) {
                clearInterval(timer)
            }
        }, 20)
    }
}

new FlappyBirdGame().start()