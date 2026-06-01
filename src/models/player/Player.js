import { Coordinates, ShotOutcome, Size } from "../../utils/utils.js";
import { Shot } from "../Shot.js";
import { AbstractClassError } from"../../utils/errors/AbstractClassError.js";
import { Board } from "../Board.js";

/**
 * This is supposed to be an abstract class for all the the methods both Human player and computer share
 */
export class Player {
    /**
     * @type {Shot[]}
     * 
     * Holds all the shots player has already shot
     */
    #shotHistory = [];

    /**
     * @type {Board}
     */
    #board

    /**
     * @type {string}
     */
    #name

    /**
     * 
     * @param {string} name 
     * @param {number} boardSize 
     */
    constructor(name, boardSize) {
        // Forbid creating instance of default player
        if (this.constructor === Player) {
            throw new AbstractClassError("Player");
        }

        this.#name = name;
        this.#board = new Board(new Size(boardSize, boardSize));
    }

    /**
     * Player decides on where he want to shoot
     * 
     * @returns {Coordinates} Coordinates of the attack
     */
    async getAttackCoordinates() {
        throw new Error("Must implement method getAttackCoordinates. This is only Player interface")
    }

    /**
     * Handles attack from opponent onto his board
     * 
     * @param {Coordinates} - coordinates of the shot
     * 
     * @returns {ShotOutcome} - outcome of the shot fired onto player board
     */
    handleAttack(coordinates) {
        const shot = new Shot(coordinates);
        const outcome = this.#board.resolveShot(shot);
        shot.setOutcome(outcome);
        this.#shotHistory.push(shot);
        return outcome;
    }

    /**
     * Returns a shallow copy of all shots fired at this player's board
     *
     * @returns {Shot[]}
     */
    getShotHistory() {
        return [...this.#shotHistory];
    }

    /**
     * Returns name of this player
     *
     * @returns {string}
     */
    getName() {
        return this.#name
    }

    /**
     * Returns board instance of this player
     *
     * @returns {Board}
     */
    getBoard() {
        return this.#board
    }
}