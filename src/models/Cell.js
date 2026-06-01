import { CellState } from "../utils/utils.js";
import { Ship } from "./Ship.js";

/**
 * Represents one cell on game board
 */
export class Cell {

    /**
     * @type {CellState}
     */
    #state;

    /**
     * @type {Ship}
     */
    #ship

    /**
     * Initializes the Cell with state empty and ship as null
     */
    constructor() {
        this.#state = CellState.EMPTY;
        this.#ship = null;
    }

    /**
     * Sets the state of this cell
     *
     * @param {CellState} newState
     */
    setState(newState) { this.#state = newState;}

    /**
     * Returns the current state of this cell
     *
     * @returns {CellState}
     */
    getState() { return this.#state;}

    /**
     * Assigns a ship to this cell
     *
     * @param {Ship} ship
     */
    setShip(ship) { this.#ship = ship;}

    /**
     * Returns the ship assigned to this cell
     *
     * @returns {Ship}
     */
    getShip() { return this.#ship;}


}