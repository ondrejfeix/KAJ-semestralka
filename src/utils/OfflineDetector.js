/**
 * Detects network connectivity changes and shows a banner when the browser goes offline
 */
export class OfflineDetector {

	/**
	 * Initialises the offline banner and starts listening for connectivity events
	 */
	static init() {
		const banner = document.createElement('div');
		banner.id = 'offline-banner';

		Object.assign(banner.style, {
			position:   'fixed',
			top:        '0',
			left:       '0',
			width:      '100%',
			background: '#ff3333',
			color:      '#000',
			textAlign:  'center',
			fontFamily: 'monospace',
			padding:    '8px',
			zIndex:     '9999',
			display:    'none',
			fontSize:   '13px',
		});

		banner.innerHTML = '⚠ NO INTERNET CONNECTION — game may not save progress';
		document.body.appendChild(banner);

		window.addEventListener('offline', () => { banner.style.display = 'block'; });
		window.addEventListener('online',  () => { banner.style.display = 'none';  });

		if (!navigator.onLine) {
			banner.style.display = 'block';
		}
	}
}
