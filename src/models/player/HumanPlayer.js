import { Player } from "./Player.js";

/**
 * Represents human player
 */
export class HumanPlayer extends Player {

	/** @type {((coords: import('../../utils/utils.js').Coordinates) => void) | null} */
	#resolvePending = null;

	/**
	 * Waits for the player to click a cell via resolveAttack(), skipping cells already fired
	 *
	 * @returns {Promise<import('../../utils/utils.js').Coordinates>}
	 */
	async getAttackCoordinates() {
		return new Promise(resolve => {
			this.#resolvePending = resolve;
		});
	}

	/**
	 * Delivers coordinates from a radar-cell click to the pending getAttackCoordinates() call
	 *
	 * @param {import('../../utils/utils.js').Coordinates} coordinates
	 */
	resolveAttack(coordinates) {
		if (this.#resolvePending) {
			this.#resolvePending(coordinates);
			this.#resolvePending = null;
		}
	}
}
