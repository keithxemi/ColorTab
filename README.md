# ColorTab

A single file html web application using javascript with a custom font to create a new compact music notation system called ColorTab.

Conventional ascii guitar tablature can be input from text file or copy/paste and converted to the new notation. Specialized editing is included with a palette of musical symbols for display and playback control.

The application contains images, audio, and fonts encoded in base64. It does not require connection to Internet servers, but can use Benjamin Gleitzman's package of [pre-rendered sound fonts](https://github.com/gleitz/midi-js-soundfonts). Portions of Daniel Gómez Blasco's [sound-font player](https://github.com/danigb/soundfont-player) are included in the javascript.

The app is built by opening index.html, choosing the ctab.js and offline.js files as inputs, and clicking Make Offline. The ctab.css file must also be local. This will download a new html file with CSS, JS and offline sound font included. The usual source files with javascript, css and html can be separately edited and tested together before creating the final app as a single file.