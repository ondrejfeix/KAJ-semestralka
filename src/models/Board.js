import { Size, CellState, Orientation, Coordinates, ShotOutcome } from "../utils/utils.js";
import { BoatCannotBePlacedError } from "../utils/errors/BoatCannotBePlacedError.js"
import { Ship } from "./Ship.js";
import { Shot } from "./Shot.js";
import { Cell } from "./Cell.js";

/**
 * Represents game board with cells and ships for one player
 */
export class Board {
    
    /**
     * @type {Size}
     */
    #size;

    /**
     * @type {Cell[]}
     */
    #cells = [];

    /**
     * @type {Ship[]}
     */
    #ships = [];

    /**
     * Creates a game board with all cells initialized as empty
     *
     * @param {Size} size Board dimensions
     */
    constructor(size) {
        this.#size = size;

        this.#initializeCells();
    }

    /**
     * Fills the #cells array with fresh empty Cell instances
     */
    #initializeCells() {
        this.#cells = [];

        for (let i = 0; i < this.#size.width * this.#size.height; i++) {
            this.#cells.push(new Cell());
        }
    }

    /**
     * Clears all ships and resets every cell to its empty state
     */
    reset() {
        this.#ships = [];
        this.#initializeCells();
    }

    /**
     * Returns the size of the board
     *
     * @returns {Size}
     */
    getSize() {
        return this.#size
    }

    /**
     * Returns a snapshot of the current cell states in board order
     *
     * @returns {CellState[]}
     */
    getCellStates() {
        return this.#cells.map(cell => cell.getState());
    }

    /**
     * Places a ship on the board after validating position and neighbors
     *
     * @param {Ship} shipToAdd Ship instance to place
     * @throws {Error} - There is no ship to be placed
     * @throws {BoatCannotBePlacedError}
     */
    placeShip(shipToAdd) {
        if (!shipToAdd) {
            throw new Error("Trying to place ship onto a board with no ship");
        }

        // Validate placement before mutating board state
        this.#canBePlaced(shipToAdd);

        this.#ships.push(shipToAdd);

        let posX = shipToAdd.getCoordinates().x;
        let posY = shipToAdd.getCoordinates().y;

        for (let i = 0; i < shipToAdd.getLength(); i++) {
            let index = posY * this.#size.width + posX;

            if (index >= 0 && index < this.#cells.length) {
                this.#cells[index].setShip(shipToAdd);
                this.#cells[index].setState(CellState.SHIP);
            }

            switch(shipToAdd.getOrientation()) {
                case Orientation.UP:
                    posY--;
                    break;
                case Orientation.DOWN:
                    posY++;
                    break;
                case Orientation.LEFT:
                    posX--;
                    break;
                case Orientation.RIGHT:
                    posX++;
                    break;
            }
        }
    }

    /**
     * Returns the ships placed on this board
     *
     * @returns {Ship[]}
     */
    getShips() {
        return this.#ships;
    }

    /**
     * Resets this board and re-places every ship from sourceBoard
     *
     * @param {Board} sourceBoard
     */
    importFrom(sourceBoard) {
        this.reset();
        for (const ship of sourceBoard.getShips()) {
            this.placeShip(ship);
        }
    }

    /**
     * Checks whether all ships on this board are sunk
     *
     * @returns {boolean} true -> all ships are sunk
     */
    areAllShipSunk() {
        return this.#ships.every(ship => ship.isSunk());
    }

    /**
     * Resolves one shot fired at this board
     *
     * @param {Shot} shotToResolve
     * @returns {ShotOutcome}
     */
    resolveShot(shotToResolve) {
        let shotCoordinates = shotToResolve.getCoordinates();

        // Reject shots that target a position outside of the board
        if (!this.#posInBoard(shotCoordinates)) {
            return ShotOutcome.INVALID;
        }
        
        let targetCell = this.#cells[shotCoordinates.y * this.#size.width + shotCoordinates.x];
        
        // Evaluate the shot
        switch (targetCell.getState()) {
            case CellState.HIT:
            case CellState.MISS:
                return ShotOutcome.ALREADY_SHOT;
            case CellState.EMPTY:
                targetCell.setState(CellState.MISS);
                return ShotOutcome.MISS;
            case CellState.SHIP:
                return this.#resolveShipHit(targetCell) ? ShotOutcome.SUNK : ShotOutcome.HIT;
            default:
                return ShotOutcome.NOT_EVALUATED;
        }

    }

    /**
     * Validates whether a ship can be placed in its current position
     *
     * @param {Ship} shipToCheck
     * @throws {BoatCannotBePlacedError}
     */
    #canBePlaced(shipToCheck) {
        let posX = shipToCheck.getCoordinates().x;
        let posY = shipToCheck.getCoordinates().y;

        for (let i = 0; i < shipToCheck.getLength(); i++) {
            if (!this.#posInBoard(new Coordinates(posX, posY))) {
                throw new BoatCannotBePlacedError({x: posX, y: posY}, "Trying to place ship outside the board");
            }

            // Check neighboring cells (including diagonals) to prevent touching ships
            for (let neighborX = posX - 1; neighborX <= posX + 1; neighborX++) {
                for (let neighborY = posY - 1; neighborY <= posY + 1; neighborY++) {
                    if (this.#posInBoard(new Coordinates(neighborX, neighborY)) && this.#isShipAt(new Coordinates(neighborX, neighborY))) {
                        throw new BoatCannotBePlacedError({x: posX, y: posY}, "There is a neighboring boat on this cell")
                    }
                }
            }

            // Move onto next cell
            switch(shipToCheck.getOrientation()) {
                case Orientation.UP:
                    posY--;
                    break;
                case Orientation.DOWN:
                    posY++;
                    break;
                case Orientation.LEFT:
                    posX--;
                    break;
                case Orientation.RIGHT:
                    posX++;
                    break;
            }
        }
    }

    /**
     * Checks whether the given cell currently contains a ship
     *
     * @param {Coordinates} coordinates
     * @returns {boolean} true -> there is a ship on this cell
     */
    #isShipAt(coordinates) {
        const index = coordinates.y * this.#size.width + coordinates.x;
        return this.#cells[index].getShip() !== null;
    }

    /**
     * Checks whether coordinates are inside the board bounds
     *
     * @param {Coordinates} coordinates
     * @returns {boolean} true -> coordinates are inside
     */
    #posInBoard(coordinates) {
        return (
            coordinates.x >= 0 && coordinates.x < this.#size.width 
            &&
            coordinates.y >= 0 && coordinates.y < this.#size.height 
        );
    }

    /**
     * Applies hit to a ship cell and returns whether this hit sunk the ship
     *
     * @param {Cell} cell
     * @returns {boolean} true -> ship has been sunk
     */
    #resolveShipHit(cell) {
        cell.setState(CellState.HIT);
        cell.getShip().hit();

        return cell.getShip().isSunk();
    }

}