/**
 * Contains all possible orientations of ship
 */
export const Orientation = Object.freeze({
    UP: "UP",
    DOWN: "DOWN",
    LEFT: "LEFT",
    RIGHT: "RIGHT"
});

/**
 * Contains all possible states of one cell
 */
export const CellState = Object.freeze({
    EMPTY: "EMPTY",
    SHIP: "SHIP",
    HIT: "HIT",
    MISS: "MISS"
})

/**
 * Contains all possible outcomes of one shot
 */
export const ShotOutcome = Object.freeze({
    HIT: "HIT",
    MISS: "MISS",
    SUNK: "SUNK",
    ALREADY_SHOT: "ALREADY_SHOT",
    INVALID: "INVALID",
    NOT_EVALUATED: "NOT_EVALUATED"
})

/**
 * Represents one set of x and y coordinates
 */
export class Coordinates {
    x; y;

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {this.x = x; this.y = y;}
}

/**
 * Represents one width and height pair
 */
export class Size {
    width; height;

    /**
     * @param {number} width
     * @param {number} height
     */
    constructor(width, height) {this.height = height; this.width = width};
}