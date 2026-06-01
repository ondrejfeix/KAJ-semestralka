import { GameError } from "./GameError.js";

/**
 * Thrown when user wants to create an instacnce of a class that is supposed to be abstract
 */
export class AbstractClassError extends GameError {
    /**
     * @param {string} className - Name of the class user wanted to create instance of
     */
    constructor(className) {
        super(`Unable to create instace of this class with name: ${className} , because its supposed to be abstract`);
    }
}
