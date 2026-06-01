import { ScreenManager } from "./ui/ScreenManager.js";
import { PlacementScreen } from "./ui/PlacementScreen.js";
import { GameScreen } from "./ui/GameScreen.js";
import { Board } from "./models/Board.js";
import { Size } from "./utils/utils.js";
import { GAME_CONFIG } from "./utils/GameConfig.js";
import { AudioManager } from "./audio/AudioManager.js";
import { OfflineDetector } from "./utils/OfflineDetector.js";
import './components/GameToast.js';

OfflineDetector.init();

const save = GameScreen.getSave();
if (save) {
	const gameScreen = new GameScreen(null, save);
	gameScreen.init();
	ScreenManager.getInstance().showScreen('gameScreen');
}

const screenManager = ScreenManager.getInstance();
const audioManager = AudioManager.getInstance();

document.getElementById('play-btn').addEventListener('click', () => {
	const placementScreen = new PlacementScreen(
		new Board(new Size(GAME_CONFIG.BOARD_SIZE, GAME_CONFIG.BOARD_SIZE))
	);

	placementScreen.init();
	screenManager.showScreen('placementScreen');
});

document.getElementById('play-again-btn').addEventListener('click', () => {
	const savedName = localStorage.getItem('warships_player_name');
	const nameInput = document.getElementById('player-name-input');
	if (savedName && nameInput) nameInput.value = savedName;

	const placementScreen = new PlacementScreen(
		new Board(new Size(GAME_CONFIG.BOARD_SIZE, GAME_CONFIG.BOARD_SIZE))
	);
	placementScreen.init();
	screenManager.showScreen('placementScreen');
});

const startMuteBtn = document.getElementById('mute-btn');
startMuteBtn.addEventListener('click', () => {
	const muted = audioManager.toggleMute();
	startMuteBtn.classList.toggle('muted', muted);
});
