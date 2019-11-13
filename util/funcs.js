let funcs = {};

funcs.randElement = function(ar) {
    return ar[Math.floor(Math.random() * ar.length)]
}

funcs.clamp = function(num, min, max) {
    return (num <= min) ? min : (num >= max ? max : num)
}

funcs.distance = function(p1, p2) {
    return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y))
}

funcs.areaTriangle = function(p1, p2, p3) {
    let side1 = funcs.distance(p1, p2)
    let side2 = funcs.distance(p2, p3)
    let side3 = funcs.distance(p1, p3)
    let semiPerimeter = (side1 + side2 + side3) / 2
    let area =  Math.sqrt(semiPerimeter * ((semiPerimeter - side1) * (semiPerimeter - side2) * (semiPerimeter - side3)))
    return area
}

module.exports = funcs