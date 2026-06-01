# Warships – Dokumentace

## Cíl projektu

Cílem bylo vytvořit hru Lodě (Battleships) pro jednoho hráče proti počítači. Hráč rozmístí svoji flotilu a střídavě s počítačem útočí na soupeřovy lodě, dokud jedna strana nepotopí celou nepřátelskou flotilu.

## Popis funkčnosti

Po otevření stránky hráč zadá své jméno a přejde na obrazovku rozmísťování, kde drag & dropem rozmístí 5 lodí na mřížce 10×10 (lodě lze také rotovat a mazat). Po potvrzení rozmístění začne samotná hra — hráč kliká na radarovou mřížku a střílí na pozice nepřítele, počítač odpovídá náhodnou volbou. Po každém tahu se zobrazí výsledek výstřelu formou notifikace i zvuku. Hra se průběžně ukládá, takže refresh stránky hru nepřeruší. Na konci se zobrazí výsledková obrazovka s možností hrát znovu.



#### Sémantické značky
Každá obrazovka je `<section>`, navigační tlačítka jsou v `<nav>`, ovládání rozmísťování a radar jsou v `<aside>`, hlavičky obrazovek jsou `<header>` a spodní lišta herní obrazovky `<footer>`.

#### Grafika – SVG
Ikony všech tlačítek jsou SVG přímo v HTML. Po každém výstřelu se do herní mřížky dynamicky kreslí SVG značky — křížek pro zásah, kruh pro minutí.

#### Média – Audio
Tři zvukové soubory (hudba na pozadí, zvuk zásahu, zvuk minutí) jsou deklarovány jako `<audio>` elementy v HTML a ovládány JavaScriptem.

#### Formulářové prvky
Pole pro jméno hráče má typ `text`, placeholder s nápovědou a omezení délky vstupu.

---

### CSS

#### Pokročilé selektory
Styly využívají kombinátory a pseudotřídy jako `:not()`, `:nth-child()` nebo `:first-child`.

#### CSS3 transformace 2D/3D
Tlačítka se při najetí myší posouvají, lodě se při rotaci otáčí a překryvné prvky jsou centrované pomocí `transform`.

#### CSS3 transitions/animations
Indikátor tahu počítače bliká, obrazovka se zatřese při zásahu a potopení lodě doprovází záblesk.

#### Media queries
Stránka je responzivní — na mobilech se mřížky zmenšují a překládají do sloupce, rozložení se přizpůsobuje šířce okna.

#### Nested CSS
Nativní CSS nesting je použit v bloku .radar-window, kde jsou styly jeho vnitřních prvků (mřížka souřadnic, radarová plocha, patička) zanořeny přímo dovnitř nadřazeného pravidla.

---

### JavaScript

#### OOP přístup
Hra je postavena na třídách s dědičností — `HumanPlayer` a `ComputerPlayer` rozšiřují abstraktní `Player`. Správci zvuku a obrazovek jsou singletony.

#### Pokročilá JS API
Lodě se rozmísťují přes Drag & Drop API. Nastavení zvuku a stav rozehrané hry (včetně pozic lodí a historie výstřelů) se ukládají a obnovují přes LocalStorage.

#### Funkční historie
Přechody mezi obrazovkami jsou synchronizovány s historií prohlížeče — tlačítka zpět a vpřed fungují tak, jak by uživatel očekával.

#### Ovládání médií
Zvuky (hudba na pozadí i herní efekty) jsou spouštěny a zastavovány JavaScriptem. Tlačítko mute přepíná stav v reálném čase na obou obrazovkách.

#### Offline aplikace
Při ztrátě připojení se zobrazí červený banner s upozorněním. Při obnovení připojení automaticky zmizí.

#### JS práce s SVG
Po každém výstřelu JavaScript programově vytvoří a vloží do mřížky SVG element — křížek nebo kruh podle výsledku výstřelu.

#### Webová komponenta
Notifikace o výsledku výstřelu zobrazuje vlastní HTML element `<game-toast>` se Shadow DOM, který se registruje přes `customElements.define`.
