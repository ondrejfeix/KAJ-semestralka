/**
 * Singleton that manages all in-game audio playback and mute state
 */
export class AudioManager {

	static #instance = null;

	/** @type {boolean} */
	#isMuted = false;

	/** @type {Object<string, HTMLAudioElement>} */
	#sounds = {};

	constructor() {
		if (AudioManager.#instance) {
			return AudioManager.#instance;
		}

		this.#sounds.hit  = new Audio('./assets/sound/hit.mp3');
		this.#sounds.miss = new Audio('./assets/sound/miss.mp3');
		this.#sounds.bgm        = new Audio('./assets/sound/Oscillations%20(Antarctic%20Wastelands).mp3');
		this.#sounds.bgm.loop   = true;
		this.#sounds.bgm.volume = 0.3;

		AudioManager.#instance = this;

		const savedMute = localStorage.getItem('warships_muted');
		if (savedMute === 'true') this.#isMuted = true;
	}

	/**
	 * Returns the singleton AudioManager instance
	 *
	 * @returns {AudioManager}
	 */
	static getInstance() {
		if (!AudioManager.#instance) {
			new AudioManager();
		}
		return AudioManager.#instance;
	}

	/**
	 * Plays the named sound unless the manager is muted
	 * BGM is only started if it is currently paused to avoid restarting mid-track
	 *
	 * @param {string} soundName Key from the sounds map (hit | miss | bgm)
	 */
	play(soundName) {
		if (this.#isMuted) return;
		const sound = this.#sounds[soundName];
		if (!sound) return;

		if (soundName === 'bgm') {
			if (sound.paused) sound.play();
		} else {
			sound.currentTime = 0;
			sound.play();
		}
	}

	/**
	 * Returns whether audio is currently muted
	 *
	 * @returns {boolean}
	 */
	isMuted() {
		return this.#isMuted;
	}

	/**
	 * Toggles mute state, pausing or resuming BGM accordingly, and persists the preference to localStorage
	 *
	 * @returns {boolean} New muted state
	 */
	toggleMute() {
		this.#isMuted = !this.#isMuted;

		localStorage.setItem('warships_muted', this.#isMuted);

		if (this.#isMuted) {
			this.#sounds.bgm.pause();
		} else {
			this.#sounds.bgm.play();
		}

		return this.#isMuted;
	}
}
