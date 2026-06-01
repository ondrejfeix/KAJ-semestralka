import { Orientation, Coordinates } from "../utils/utils.js";

/**
 * Represents one ship with its state and coordinates
 */
export class Ship {
    /** @type {number} */
    #id;
    
    /** @type {number} */
    #livesLeft;
    
    /** @type {number} */
    #length;
    
    /** @type {Orientation} */
    #orientation;

    /** @type {Coordinates} */
    #coordinates;

    /**
     * Creates a new ship instance
     * @param {number} id Id of the ship
     * @param {number} length Number of cells occupied by the ship
     * @param {Orientation} orientation Ship direction (UP, DOWN, LEFT, RIGHT)
     * @param {Coordinates} coordinates Starting coordinates of the ship bow
     */
    constructor(id, length, orientation, coordinates) {
        this.#id = id;
        this.#length = length;
        this.#orientation = orientation;
        this.#coordinates = coordinates;
        this.#livesLeft = length;
    }

    /**
     * Returns ship unique id
     *
     * @returns {number}
     */
    getId() { return this.#id;}

    /**
     * Checks whether the ship has no health left
     *
     * @returns {boolean} true -> the ship is sunk
     */
    isSunk() {
        return this.#livesLeft === 0;
    }

    /**
     * Returns coordinates of the ship bow
     *
     * @returns {Coordinates}
     */
    getCoordinates() { return this.#coordinates;}

    /**
     * Registers one hit on this ship
     */
    hit() {
        if (this.#livesLeft > 0) {
            this.#livesLeft--;
        }
    }

    /**
     * Returns ship orientation
     *
     * @returns {Orientation}
     */
    getOrientation() { return this.#orientation;}

    /**
     * Returns ship length
     *
     * @returns {number}
     */
    getLength() { return this.#length;}
}