/**
 * Singleton that controls which screen is visible and synchronises with the browser History API
 */
export class ScreenManager {

	static #instance = null;

	/** @type {Object<string, HTMLElement>} */
	#screens = {};

	/** @type {HTMLElement} */
	#activeScreen = null;

	constructor() {
		if (ScreenManager.#instance) {
			return ScreenManager.#instance;
		}

		this.#screens = {
			startScreen:     document.getElementById('intro-screen'),
			placementScreen: document.getElementById('placement-screen'),
			gameScreen:      document.getElementById('game-screen'),
			endScreen:       document.getElementById('end-screen'),
		};

		this.#activeScreen = this.#screens.startScreen;
		ScreenManager.#instance = this;

		history.replaceState({ screen: 'startScreen' }, '', '#startScreen');

		window.addEventListener('popstate', (event) => {
			if (event.state?.screen) {
				this.#showScreenWithoutPush(event.state.screen);
			}
		});
	}

	/**
	 * Returns the singleton ScreenManager instance
	 *
	 * @returns {ScreenManager}
	 */
	static getInstance() {
		if (!ScreenManager.#instance) {
			new ScreenManager();
		}
		return ScreenManager.#instance;
	}

	/**
	 * Switches to the named screen and pushes a history entry
	 *
	 * @param {string} screenName Key from the screens map
	 */
	showScreen(screenName) {
		const nextScreen = this.#screens[screenName];
		if (!nextScreen || nextScreen === this.#activeScreen) return;

		this.#activeScreen.classList.add('hidden');
		nextScreen.classList.remove('hidden');
		this.#activeScreen = nextScreen;

		history.pushState({ screen: screenName }, '', `#${screenName}`);
	}

	/**
	 * Switches to the named screen without touching history — used by the popstate handler
	 * to avoid infinite push loops when navigating back/forward
	 *
	 * @param {string} screenName Key from the screens map
	 */
	#showScreenWithoutPush(screenName) {
		const nextScreen = this.#screens[screenName];
		if (!nextScreen || nextScreen === this.#activeScreen) return;

		this.#activeScreen.classList.add('hidden');
		nextScreen.classList.remove('hidden');
		this.#activeScreen = nextScreen;
	}
}
