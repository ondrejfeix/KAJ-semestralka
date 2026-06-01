import { Player } from "./Player.js"
import { Board } from "../Board.js";
import { Coordinates, Size} from "../../utils/utils.js";

/**
 * AI-controlled player that picks attack coordinates randomly
 */
export class ComputerPlayer extends Player {
    /**
     * Player decides on where he want to shoot
     *
     * @returns {Coordinates} Coordinates of the attack
     */
    async getAttackCoordinates() {
        await new Promise(r => setTimeout(r, 600));

        const boardSize = this.getBoard().getSize();
        const fired = new Set(
            this.getShotHistory().map(s => `${s.getCoordinates().x},${s.getCoordinates().y}`)
        );

        let x, y;
        do {
            x = Math.floor(Math.random() * boardSize.width);
            y = Math.floor(Math.random() * boardSize.height);
        } while (fired.has(`${x},${y}`));

        return new Coordinates(x, y);
    }
}