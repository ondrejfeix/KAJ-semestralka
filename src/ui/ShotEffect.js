/**
 * Provides static helpers for creating SVG shot markers on board cells
 */
export class ShotEffect {

	/**
	 * Appends a red X SVG marker into the given cell element
	 *
	 * @param {HTMLElement} cellElement Target cell DOM element
	 */
	static createHitMarker(cellElement) {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('viewBox', '0 0 40 40');
		svg.classList.add('shot-marker', 'hit-marker');

		const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		line1.setAttribute('x1', '4');
		line1.setAttribute('y1', '4');
		line1.setAttribute('x2', '36');
		line1.setAttribute('y2', '36');
		line1.setAttribute('stroke', '#ff2222');
		line1.setAttribute('stroke-width', '5');
		line1.setAttribute('stroke-linecap', 'round');

		const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		line2.setAttribute('x1', '36');
		line2.setAttribute('y1', '4');
		line2.setAttribute('x2', '4');
		line2.setAttribute('y2', '36');
		line2.setAttribute('stroke', '#ff2222');
		line2.setAttribute('stroke-width', '5');
		line2.setAttribute('stroke-linecap', 'round');

		svg.append(line1, line2);
		cellElement.appendChild(svg);
	}

	/**
	 * Appends a small green circle SVG marker into the given cell element
	 *
	 * @param {HTMLElement} cellElement Target cell DOM element
	 */
	static createMissMarker(cellElement) {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('viewBox', '0 0 40 40');
		svg.classList.add('shot-marker', 'miss-marker');

		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		circle.setAttribute('cx', '20');
		circle.setAttribute('cy', '20');
		circle.setAttribute('r', '4');
		circle.setAttribute('fill', 'rgba(51,255,51,0.4)');

		svg.appendChild(circle);
		cellElement.appendChild(svg);
	}

}
