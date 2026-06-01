import { GameError } from './GameError.js';

/**
 * Thrown when a ship placement violates board boundaries or spacing rules
 */
export class BoatCannotBePlacedError extends GameError {
    /**
     * @param {import('./utils.js').Coordinates} coordinates - The problematic coordinates
     * @param {string} message - Specific reason for failure
     */
    constructor(coordinates, message) {
        super(message);
        this.coordinates = coordinates;
    }
}