import { GAME_CONFIG } from "../utils/GameConfig.js";
import { Board } from "../models/Board.js";
import { Ship } from "../models/Ship.js";
import { Coordinates, Orientation } from "../utils/utils.js";
import { ScreenManager } from "./ScreenManager.js";
import { GameScreen } from "./GameScreen.js";

/**
 * Manages the ship placement phase — renders the placement board, ship list,
 * and handles drag-and-drop interactions to build the player's fleet
 */
export class PlacementScreen {
    #elements = {}
    #controls = {}

    /**
     * @type {Board}
     */
    #board;

    /**
     * @type {HTMLDivElement}
     */
    #grabbedShip = null;
    
    /** @type {number} Index of the ship segment the player grabbed (0 = bow, length-1 = stern) */
    #grabbedShipSegment = 0;

    /** @type {boolean} true -> ships placed horizontally, false -> vertically */
    #isHorizontal = true;

    /** @type {ScreenManager} Controls screen transitions */
    #screenManager;

    /** @type {GameScreen | null} */
    #gameScreen = null;

    /**
     * 
     * @param {Board} board Game board instance for this player
     */
    constructor(board) {
        this.#board = board;
        this.#screenManager = ScreenManager.getInstance();

        this.#elements = {
            placementBoard : document.getElementById('placement-board'),
            shipsContainer : document.getElementById('ships-left-container')
        }

        this.#controls = {
            rotateBtn : document.getElementById('rotate-btn'),
            clearBtn : document.getElementById('clear-board-btn'),
            confirmBtn : document.getElementById('confirm-placement-btn'),
        }
    }

    /**
     * Initializes the placement screen by rendering the board, ships, and control listeners
     */
    init() {
        this.#renderPlacementBoard();
        this.#renderShipsContainer();
        this.#addControlListeners();
    }

    /**
     * Renders all available ships in the ships container
     * Creates draggable ship elements with drag event listeners
     */
    #renderShipsContainer() {
        this.#elements.shipsContainer.innerHTML = "";

        GAME_CONFIG.FLEET_COMPOSITION.forEach(shipToAddData => {
            const newShipElement = document.createElement('div');

            newShipElement.classList.add('ship-item');
            newShipElement.classList.add(`size-${shipToAddData.length}`);
            newShipElement.setAttribute('draggable', 'true');

            newShipElement.dataset.length = shipToAddData.length;
            newShipElement.dataset.id = shipToAddData.id;
            newShipElement.dataset.name = shipToAddData.name;
            newShipElement.id = `ship-${shipToAddData.id}`;

            newShipElement.textContent = shipToAddData.name;

            newShipElement.addEventListener('dragstart', (event) => {
                this.#grabbedShip = newShipElement;
                this.#grabbedShipSegment = this.#getGrabbedSegmentIndex(event);
            })

            this.#elements.shipsContainer.appendChild(newShipElement);
        })
    }

    /**
     * Renders a placed ship on the board as a visual overlay with a centered name label
     *
     * @param {HTMLDivElement} draggedShip The ship element being placed
     * @param {number} posX X coordinate (column) where the ship starts
     * @param {number} posY Y coordinate (row) where the ship starts
     * @param {number} length Number of cells occupied by the ship
     */
    #renderPlacedShipOnBoard(draggedShip, posX, posY, length) {
        const boardShip = document.createElement('div');
        boardShip.className = `board-ship${this.#isHorizontal ? '' : ' vertical'}`;

        const cell = this.#elements.placementBoard.querySelector('.grid-cell');
        const cellWidth = cell?.offsetWidth || 40;
        const cellHeight = cell?.offsetHeight || 40;

        Object.assign(boardShip.style, {
            left: `${posX * cellWidth}px`,
            top: `${posY * cellHeight}px`,
            width: `${this.#isHorizontal ? length * cellWidth : cellWidth}px`,
            height: `${this.#isHorizontal ? cellHeight : length * cellHeight}px`,
        });

        const nameLabel = document.createElement('span');
        nameLabel.className = 'board-ship-name';
        nameLabel.textContent = draggedShip.dataset.name || draggedShip.dataset.id || '';
        boardShip.appendChild(nameLabel);

        this.#elements.placementBoard.appendChild(boardShip);

        this.#elements.shipsContainer.removeChild(this.#grabbedShip);
    }

    /**
     * Renders the placement board grid with drop zones
     * Creates grid cells with drag-over and drop event listeners
     */
    #renderPlacementBoard() {
        const size = this.#board.getSize();

        this.#elements.placementBoard.innerHTML = "";
        this.#elements.placementBoard.style.display = "grid";
        this.#elements.placementBoard.style.gridTemplateColumns = `repeat(${size.width}, 1fr)`;

        for (let y = 0; y < size.height; y ++) {
            for (let x = 0; x < size.width; x ++) {
                const currentCell = document.createElement('div');
                
                currentCell.classList.add('grid-cell');
                currentCell.dataset.x = x;
                currentCell.dataset.y = y;

                currentCell.addEventListener('dragover', e => e.preventDefault());
                currentCell.addEventListener('drop', e => this.#handleDrop(e));

                this.#elements.placementBoard.appendChild(currentCell);
            }
        }
    }

    /**
     * Handles a ship drop event on the placement board
     * Validates the placement, updates the board model, and renders the placed ship visually
     * 
     * @param {DragEvent} event The drop event containing target cell information
     */
    #handleDrop(event) {
        event.preventDefault();

        if (!this.#grabbedShip) {
            return;
        }

        const targetCell = event.currentTarget;
        const posX = parseInt(targetCell.dataset.x);
        const posY = parseInt(targetCell.dataset.y);

        const length = parseInt(this.#grabbedShip.dataset.length);
        const orientation = this.#isHorizontal ? Orientation.RIGHT : Orientation.DOWN;

        const shipStartX = this.#isHorizontal ? posX - this.#grabbedShipSegment : posX;
        const shipStartY = this.#isHorizontal ? posY : posY - this.#grabbedShipSegment;

        try {
            const newShip = new Ship(this.#grabbedShip.dataset.id, length, orientation, new Coordinates(shipStartX, shipStartY));
            this.#board.placeShip(newShip);

            this.#renderPlacedShipOnBoard(this.#grabbedShip, shipStartX, shipStartY, length);

            this.#grabbedShip.classList.add('placed');
            this.#grabbedShip.setAttribute('draggable', 'false');
            this.#grabbedShip = null;
            this.#grabbedShipSegment = 0;
        } catch (placementError) {
            // Silently ignore invalid placements — the board model enforces constraints
        }
    }

    /**
     * Attaches click listeners to control buttons
     */
    #addControlListeners() {
        this.#controls.rotateBtn.onclick = () => {
            this.#isHorizontal = !this.#isHorizontal;
            this.#elements.shipsContainer.classList.toggle('vertical', !this.#isHorizontal);
        };

        this.#controls.clearBtn.onclick = () => {
            this.#board.reset();
            this.#grabbedShip = null;
            this.#grabbedShipSegment = 0;
            this.#isHorizontal = true;
            this.#elements.shipsContainer.classList.remove('vertical');
            this.init();
        };

        this.#controls.confirmBtn.onclick = () => {
            const allPlaced = this.#checkConfirmPossible();

            if (!allPlaced) {
                return;
            }

            this.#gameScreen = new GameScreen(this.#board);
            this.#gameScreen.init();

            this.#screenManager.showScreen('gameScreen');
        }
    }

    /**
     * Checks whether all ships have been placed on the board
     * 
     * @returns {boolean} true -> all ships placed, false -> some ships still in container
     */
    #checkConfirmPossible() {
        const shipsRemaining = this.#elements.shipsContainer.querySelectorAll('.ship-item:not(.placed)');
        return shipsRemaining.length === 0;
    }

    /**
     * Calculates which ship segment (cell) the player grabbed during dragstart
     * Used to maintain the grab point when dropping the ship (e.g., grabbing the middle keeps it in the middle)
     * 
     * @param {DragEvent} event The dragstart event containing mouse/touch position
     * @returns {number} Index of the grabbed segment (0 = bow, length-1 = stern)
     */
    #getGrabbedSegmentIndex(event) {
        const length = parseInt(this.#grabbedShip.dataset.length);

        const shipRect = this.#grabbedShip.getBoundingClientRect();
        let relative;
        
        if (this.#isHorizontal) {
            relative = event.clientX - shipRect.left;
        } else {
            relative = event.clientY - shipRect.top;
        }
        
        const shipLength = this.#isHorizontal ? shipRect.width : shipRect.height;
        const segmentSize = shipLength / length;

        if (segmentSize <= 0) {
            return 0;
        }

        const index = Math.floor(relative / segmentSize);
        return Math.max(0, Math.min(length - 1, index));
    }
}