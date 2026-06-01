/**
 * Custom HTML element <game-toast> that displays a temporary notification banner
 */
export class GameToast extends HTMLElement {

	/** @type {HTMLSpanElement | null} */
	#span = null;

	/** @type {ReturnType<typeof setTimeout> | null} */
	#timer = null;

	/**
	 * Declares the observed attributes for this element
	 *
	 * @returns {string[]}
	 */
	static get observedAttributes() {
		return ['message'];
	}

	/**
	 * Called when the element is inserted into the DOM — builds the shadow DOM
	 */
	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'open' });

		this.#span = document.createElement('span');

		Object.assign(this.#span.style, {
			position:        'fixed',
			bottom:          '40px',
			left:            '50%',
			transform:       'translateX(-50%)',
			background:      'rgba(0,0,0,0.85)',
			border:          '1px solid rgb(51,255,51)',
			color:           'rgb(51,255,51)',
			fontFamily:      'monospace',
			padding:         '10px 24px',
			opacity:         '0',
			transition:      'opacity 0.3s ease',
			zIndex:          '9999',
			letterSpacing:   '2px',
			textTransform:   'uppercase',
			whiteSpace:      'nowrap',
		});

		shadow.appendChild(this.#span);
	}

	/**
	 * Reacts to attribute changes — animates in the new message then fades out after 2500 ms
	 *
	 * @param {string} name Attribute name
	 * @param {string | null} _oldVal Previous value (unused)
	 * @param {string | null} newVal New value
	 */
	attributeChangedCallback(name, _oldVal, newVal) {
		if (name !== 'message' || !this.#span) return;

		if (this.#timer) clearTimeout(this.#timer);

		this.#span.textContent = newVal;
		this.#span.style.opacity = '1';

		this.#timer = setTimeout(() => {
			this.#span.style.opacity = '0';
		}, 2500);
	}

	/**
	 * Displays a message in the toast
	 *
	 * @param {string} message Text to show
	 */
	show(message) {
		this.setAttribute('message', message);
	}
}

customElements.define('game-toast', GameToast);
