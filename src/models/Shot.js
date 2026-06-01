import { ShotOutcome, Coordinates } from "../utils/utils.js";

/**
 * Represents one shot with coordinates and evaluation outcome
 */
export class Shot {
    /** @type {Coordinates} */
    #coordinates;

    /** @type {ShotOutcome} */
    #outcome;

    /**
     * Creates a new shot with initial state set to not evaluated
     *
     * @param {Coordinates} coords Target coordinates of the shot
     */
    constructor(coords) {
        this.#coordinates = coords;
        this.#outcome = ShotOutcome.NOT_EVALUATED;
    }

    /**
     * Returns shot target coordinates
     *
     * @returns {Coordinates}
     */
    getCoordinates() { return this.#coordinates; }

    /**
     * Returns current evaluation outcome of this shot
     *
     * @returns {ShotOutcome}
     */
    getOutcome() { return this.#outcome; }

    /**
     * Sets the result of this shot after board evaluation
     *
     * @param {ShotOutcome} outcome
     */
    setOutcome(outcome) { this.#outcome = outcome; }
}