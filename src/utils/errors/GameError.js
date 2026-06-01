/**
 * Base class for all game-related logic errors
 */
export class GameError extends Error {
    /**
     * @param {string} message - details about the game error
     */
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}