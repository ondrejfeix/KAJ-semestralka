import { Ship } from "../models/Ship.js";
import { GAME_CONFIG } from "../utils/GameConfig.js";
import { Coordinates, Orientation, CellState, ShotOutcome } from "../utils/utils.js";
import { HumanPlayer } from "../models/player/HumanPlayer.js";
import { ComputerPlayer } from "../models/player/ComputerPlayer.js";
import { ScreenManager } from "./ScreenManager.js";
import { AudioManager } from "../audio/AudioManager.js";
import { ShotEffect } from "./ShotEffect.js";

const SAVE_KEY = 'warships_game';

/**
 * Manages the active game session — renders both boards, handles the player/computer
 * turn loop, plays audio and shows toasts
 */
export class GameScreen {

	/** @type {HumanPlayer} */
	#humanPlayer;

	/** @type {ComputerPlayer} */
	#computerPlayer;

	/** @type {AudioManager} */
	#audioManager;

	/** @type {string} */
	#playerName = 'PLAYER';

	/** @type {boolean} */
	#isProcessing = false;

	/** @type {boolean} */
	#gameOver = false;

	/** @type {Object} */
	#elements = {};

	/**
	 * Creates a new game from a placed player board, or restores a saved game when
	 * savedState is provided (playerBoard is ignored in that case)
	 *
	 * @param playerBoard Board from PlacementScreen with ships placed (ignored on restore)
	 * @param {Object|null} savedState Parsed save object from localStorage, or null for a new game
	 */
	constructor(playerBoard, savedState = null) {
		this.#humanPlayer    = new HumanPlayer('Player', GAME_CONFIG.BOARD_SIZE);
		this.#computerPlayer = new ComputerPlayer('Computer', GAME_CONFIG.BOARD_SIZE);
		this.#audioManager   = AudioManager.getInstance();

		if (savedState) {
			this.#restoreFromState(savedState);
		} else {
			this.#humanPlayer.getBoard().importFrom(playerBoard);
			this.#placeComputerShips();
			const rawName = document.getElementById('player-name-input')?.value?.trim();
			this.#playerName = rawName ? rawName.toUpperCase() : 'PLAYER';
		}

		this.#elements = {
			playerBoardEl: document.getElementById('player-board-3d'),
			enemyBoardEl:  document.getElementById('enemy-board-3d'),
			radarOverlay:  document.getElementById('radar-overlay'),
			shootingGrid:  document.getElementById('shooting-grid'),
			statusEl:      document.getElementById('enemy-fleet-status'),
			labelsX:       document.querySelector('.grid-labels-x'),
			labelsY:       document.querySelector('.grid-labels-y'),
			muteBtn:       document.getElementById('game-mute-btn'),
			exitBtn:       document.querySelector('.exit-btn'),
			toast:         document.getElementById('game-toast'),
			gameScene:     document.getElementById('game-scene'),
			turnIndicator: document.getElementById('turn-indicator'),
		};
	}

	/**
	 * Returns true if a saved game exists in localStorage
	 *
	 * @returns {boolean}
	 */
	static hasSave() {
		return !!localStorage.getItem(SAVE_KEY);
	}

	/**
	 * Returns the parsed saved game state, or null if none exists
	 *
	 * @returns {Object|null}
	 */
	static getSave() {
		const raw = localStorage.getItem(SAVE_KEY);
		if (!raw) return null;
		try { return JSON.parse(raw); } catch (_) { return null; }
	}

	/**
	 * Removes any saved game from localStorage
	 */
	static clearSave() {
		localStorage.removeItem(SAVE_KEY);
	}

	/**
	 * Renders both board grids, the shooting radar, wires HUD buttons, and starts BGM.
	 * On a restored game, previously shot radar cells are re-marked.
	 */
	init() {
		this.#renderBoardGrid(this.#elements.playerBoardEl, this.#humanPlayer.getBoard(), false);
		this.#renderBoardGrid(this.#elements.enemyBoardEl, this.#computerPlayer.getBoard(), true);
		this.#renderShootingGrid();
		this.#addHudListeners();
		this.#updateStatus('READY TO FIRE');
		this.#audioManager.play('bgm');

		const labelEl = document.getElementById('player-board-label');
		if (labelEl) labelEl.textContent = `${this.#playerName}'S FLEET`;

		for (const shot of this.#computerPlayer.getShotHistory()) {
			this.#markRadarCell(shot.getCoordinates().x, shot.getCoordinates().y, shot.getOutcome());
		}

		this.#saveGameState();
		this.#startGameLoop();
	}

	/**
	 * Reconstructs board state and shot history from a saved state object
	 *
	 * @param {Object} state
	 */
	#restoreFromState(state) {
		this.#playerName = state.playerName || 'PLAYER';

		for (const s of state.playerShips) {
			const cfg = GAME_CONFIG.FLEET_COMPOSITION.find(c => c.id === s.id);
			if (cfg) this.#humanPlayer.getBoard().placeShip(
				new Ship(s.id, cfg.length, s.orientation, new Coordinates(s.x, s.y))
			);
		}

		for (const s of state.computerShips) {
			const cfg = GAME_CONFIG.FLEET_COMPOSITION.find(c => c.id === s.id);
			if (cfg) this.#computerPlayer.getBoard().placeShip(
				new Ship(s.id, cfg.length, s.orientation, new Coordinates(s.x, s.y))
			);
		}

		for (const shot of (state.playerShots || [])) {
			this.#computerPlayer.handleAttack(new Coordinates(shot.x, shot.y));
		}

		for (const shot of (state.computerShots || [])) {
			this.#humanPlayer.handleAttack(new Coordinates(shot.x, shot.y));
		}
	}

	/**
	 * Serialises the current game state to localStorage
	 */
	#saveGameState() {
		const toShipEntry = s => ({
			id: s.getId(), orientation: s.getOrientation(),
			x: s.getCoordinates().x, y: s.getCoordinates().y,
		});

		const toShotEntry = s => ({
			x: s.getCoordinates().x,
			y: s.getCoordinates().y,
			outcome: s.getOutcome(),
		});

		localStorage.setItem(SAVE_KEY, JSON.stringify({
			playerName:    this.#playerName,
			playerShips:   this.#humanPlayer.getBoard().getShips().map(toShipEntry),
			computerShips: this.#computerPlayer.getBoard().getShips().map(toShipEntry),
			playerShots:   this.#computerPlayer.getShotHistory().map(toShotEntry),
			computerShots: this.#humanPlayer.getShotHistory().map(toShotEntry),
		}));
	}

	/**
	 * Randomly places every ship from GAME_CONFIG.FLEET_COMPOSITION on the computer's board
	 */
	#placeComputerShips() {
		const board = this.#computerPlayer.getBoard();
		const orientations = [Orientation.RIGHT, Orientation.DOWN];

		for (const shipConfig of GAME_CONFIG.FLEET_COMPOSITION) {
			let placed = false;
			let attempts = 0;

			while (!placed && attempts < 500) {
				attempts++;
				const orientation = orientations[Math.floor(Math.random() * 2)];
				const size = board.getSize();
				const x = Math.floor(Math.random() * size.width);
				const y = Math.floor(Math.random() * size.height);

				try {
					board.placeShip(new Ship(shipConfig.id, shipConfig.length, orientation, new Coordinates(x, y)));
					placed = true;
				} catch (_) {
				}
			}
		}
	}

	/**
	 * Renders a 10×10 grid of .grid-cell divs into boardElement
	 *
	 * @param {HTMLDivElement} boardElement Target container
	 * @param {Board} board Board model to reflect
	 * @param {boolean} isEnemy When true, ship cells are hidden
	 */
	#renderBoardGrid(boardElement, board, isEnemy) {
		const size   = board.getSize();
		const states = board.getCellStates();

		boardElement.innerHTML = '';
		boardElement.style.display = 'grid';
		boardElement.style.gridTemplateColumns = `repeat(${size.width}, 1fr)`;

		for (let y = 0; y < size.height; y++) {
			for (let x = 0; x < size.width; x++) {
				const cell = document.createElement('div');
				cell.classList.add('grid-cell');
				cell.dataset.x = x;
				cell.dataset.y = y;

				const state = states[y * size.width + x];

				if (state === CellState.HIT) {
					cell.classList.add('cell-hit');
					ShotEffect.createHitMarker(cell);
				} else if (state === CellState.MISS) {
					cell.classList.add('cell-miss');
				} else if (state === CellState.SHIP && !isEnemy) {
					cell.classList.add('cell-ship');
				}

				boardElement.appendChild(cell);
			}
		}

		if (!isEnemy) {
			const N = size.width;
			for (const ship of board.getShips()) {
				const coords     = ship.getCoordinates();
				const horizontal = ship.getOrientation() === Orientation.RIGHT || ship.getOrientation() === Orientation.LEFT;
				const overlay    = document.createElement('div');
				overlay.className = `board-ship${horizontal ? '' : ' vertical'}`;

				const pct = 100 / N;
				Object.assign(overlay.style, {
					left:   `${coords.x * pct}%`,
					top:    `${coords.y * pct}%`,
					width:  `${horizontal ? ship.getLength() * pct : pct}%`,
					height: `${horizontal ? pct : ship.getLength() * pct}%`,
				});

				const shipConfig = GAME_CONFIG.FLEET_COMPOSITION.find(s => s.id === ship.getId());
				const nameLabel  = document.createElement('span');
				nameLabel.className   = 'board-ship-name';
				nameLabel.textContent = shipConfig?.name || ship.getId();
				overlay.appendChild(nameLabel);

				boardElement.appendChild(overlay);
			}
		}
	}

	/**
	 * Populates axis labels, creates clickable .radar-cell divs, and reveals the radar overlay
	 */
	#renderShootingGrid() {
		const colLabels = ['A','B','C','D','E','F','G','H','I','J'];

		this.#elements.labelsX.innerHTML = '';
		colLabels.forEach(letter => {
			const span = document.createElement('span');
			span.textContent = letter;
			span.classList.add('grid-label');
			this.#elements.labelsX.appendChild(span);
		});

		this.#elements.labelsY.innerHTML = '';
		for (let i = 1; i <= GAME_CONFIG.BOARD_SIZE; i++) {
			const span = document.createElement('span');
			span.textContent = i;
			span.classList.add('grid-label');
			this.#elements.labelsY.appendChild(span);
		}

		this.#elements.shootingGrid.innerHTML = '';
		this.#elements.shootingGrid.style.display = 'grid';
		this.#elements.shootingGrid.style.gridTemplateColumns = `repeat(${GAME_CONFIG.BOARD_SIZE}, 1fr)`;

		for (let y = 0; y < GAME_CONFIG.BOARD_SIZE; y++) {
			for (let x = 0; x < GAME_CONFIG.BOARD_SIZE; x++) {
				const cell = document.createElement('div');
				cell.classList.add('radar-cell');
				cell.dataset.x = x;
				cell.dataset.y = y;
				cell.addEventListener('click', () => {
					if (!this.#isProcessing && !this.#gameOver &&
						!cell.classList.contains('cell-hit') && !cell.classList.contains('cell-miss')) {
						this.#humanPlayer.resolveAttack(new Coordinates(x, y));
					}
				});
				this.#elements.shootingGrid.appendChild(cell);
			}
		}

		this.#elements.radarOverlay.classList.remove('hidden', 'game-over', 'radar-hidden');
	}

	/**
	 * Fades the radar out and shows the enemy-turn indicator
	 */
	#hideRadar() {
		this.#elements.radarOverlay.classList.add('radar-hidden');
		this.#elements.turnIndicator?.classList.remove('hidden');
	}

	/**
	 * Fades the radar back in and hides the enemy-turn indicator
	 */
	#showRadar() {
		this.#elements.radarOverlay.classList.remove('radar-hidden');
		this.#elements.turnIndicator?.classList.add('hidden');
	}

	/**
	 * Returns a promise that resolves after the given number of milliseconds
	 *
	 * @param {number} ms
	 * @returns {Promise<void>}
	 */
	#delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * Wires up exit and mute HUD buttons
	 */
	#addHudListeners() {
		this.#elements.exitBtn?.addEventListener('click', () => {
			ScreenManager.getInstance().showScreen('startScreen');
		});

		if (this.#elements.muteBtn) {
			this.#elements.muteBtn.classList.toggle('muted', this.#audioManager.isMuted());
			this.#elements.muteBtn.addEventListener('click', () => {
				const muted = this.#audioManager.toggleMute();
				this.#elements.muteBtn.classList.toggle('muted', muted);
			});
		}
	}

	/**
	 * Awaits attacker coordinates, fires at the defender's board, refreshes the board cell, and saves state
	 *
	 * @param {HumanPlayer|ComputerPlayer} attacker
	 * @param {HumanPlayer|ComputerPlayer} defender
	 * @param {HTMLDivElement} defenderBoardEl
	 * @returns {Promise<{coords: Coordinates, outcome: string}>}
	 */
	async #runTurn(attacker, defender, defenderBoardEl) {
		const coords  = await attacker.getAttackCoordinates();
		const outcome = defender.handleAttack(coords);
		this.#refreshBoardCell(defenderBoardEl, coords.x, coords.y, outcome, defender === this.#computerPlayer);
		this.#saveGameState();
		return { coords, outcome };
	}

	/**
	 * Main game loop — alternates human and computer turns until one side wins
	 */
	async #startGameLoop() {
		while (!this.#gameOver) {
			this.#isProcessing = false;
			this.#updateStatus('FIRING...');

			const { coords: pCoords, outcome: pOutcome } = await this.#runTurn(
				this.#humanPlayer, this.#computerPlayer, this.#elements.enemyBoardEl
			);

			this.#isProcessing = true;
			this.#markRadarCell(pCoords.x, pCoords.y, pOutcome);

			if (pOutcome === ShotOutcome.SUNK) {
				this.#updateStatus('SHIP SUNK!');
				this.#elements.toast?.show('SHIP SUNK!');
				this.#audioManager.play('hit');
			} else if (pOutcome === ShotOutcome.HIT) {
				this.#updateStatus('HIT!');
				this.#elements.toast?.show('HIT!');
				this.#audioManager.play('hit');
			} else {
				this.#updateStatus('MISS');
				this.#elements.toast?.show('MISS');
				this.#audioManager.play('miss');
			}

			if (this.#computerPlayer.getBoard().areAllShipSunk()) {
				this.#endGame(true);
				return;
			}

			await this.#delay(500);
			this.#hideRadar();

			const { outcome: cOutcome } = await this.#runTurn(
				this.#computerPlayer, this.#humanPlayer, this.#elements.playerBoardEl
			);

			if (cOutcome === ShotOutcome.HIT || cOutcome === ShotOutcome.SUNK) {
				this.#audioManager.play('hit');
				this.#elements.gameScene.classList.add('screen-shake');
				setTimeout(() => this.#elements.gameScene.classList.remove('screen-shake'), 400);
			} else {
				this.#audioManager.play('miss');
			}

			await this.#delay(900);

			if (this.#humanPlayer.getBoard().areAllShipSunk()) {
				this.#endGame(false);
				return;
			}

			this.#updateStatus('READY TO FIRE');
			this.#showRadar();
		}
	}

	/**
	 * Adds the appropriate CSS class and SVG marker to a radar cell after a shot
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {ShotOutcome} result
	 */
	#markRadarCell(x, y, result) {
		const cell = this.#elements.shootingGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
		if (!cell) return;

		if (result === ShotOutcome.HIT || result === ShotOutcome.SUNK) {
			cell.classList.add('cell-hit');
			ShotEffect.createHitMarker(cell);
		} else {
			cell.classList.add('cell-miss');
			ShotEffect.createMissMarker(cell);
		}
	}

	/**
	 * Updates a single board cell's CSS class and SVG marker after a shot resolves
	 *
	 * @param {HTMLDivElement} boardElement
	 * @param {number} x
	 * @param {number} y
	 * @param {ShotOutcome} result
	 * @param {boolean} isEnemy
	 */
	#refreshBoardCell(boardElement, x, y, result, isEnemy) {
		const cell = boardElement.querySelector(`[data-x="${x}"][data-y="${y}"]`);
		if (!cell) return;

		cell.classList.remove('cell-hit', 'cell-miss', 'cell-ship');

		if (result === ShotOutcome.HIT || result === ShotOutcome.SUNK) {
			cell.classList.add('cell-hit');
			ShotEffect.createHitMarker(cell);
		} else if (result === ShotOutcome.MISS) {
			cell.classList.add('cell-miss');
		}
	}

	/**
	 * Locks input, dims the radar, shows the result toast, and clears the saved game
	 *
	 * @param {boolean} playerWon
	 */
	#endGame(playerWon) {
		this.#gameOver = true;
		GameScreen.clearSave();
		localStorage.setItem('warships_player_name', this.#playerName);
		this.#elements.radarOverlay.classList.add('game-over');
		const msg = playerWon ? 'VICTORY! ALL ENEMY SHIPS DESTROYED!' : 'DEFEAT! YOUR FLEET IS GONE!';
		this.#updateStatus(msg);
		this.#elements.toast?.show(msg);

		setTimeout(() => {
			const resultEl = document.getElementById('end-result');
			if (resultEl) resultEl.textContent = msg;
			resultEl.classList.toggle('victory', playerWon);
			resultEl.classList.toggle('defeat', !playerWon);
			ScreenManager.getInstance().showScreen('endScreen');
		}, 2500);
	}

	/**
	 * Sets the status bar text content
	 *
	 * @param {string} message
	 */
	#updateStatus(message) {
		if (this.#elements.statusEl) {
			this.#elements.statusEl.textContent = message;
		}
	}
}
