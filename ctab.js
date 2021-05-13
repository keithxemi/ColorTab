/*eslint-env es6, browser, amd*/
/*eslint no-irregular-whitespace: ["error", { "skipRegExps": true }]*/
/* global Soundfont, offline, JZZ */

(function() {
  'use strict'
  //global variables
  var showEditButton = true;
  var editInstr;
  var soundfont;// = new Soundfont(ctx);
  var instChoice = "offline";
  var sfChoice = "MusyngKite/";
  var sfReady = true;
  var soundFontInstrument;
  var instrumentName; //user edited or default
  var getTiny;//new Request
  var saveName; //input element save dialog, defaults to song title
  var ctNotePos = [];//note positions
  var measureTimes = [];
  var measureFirsts = [];//positions of first note in each measure  
  var pauseTime = 0;//time to play next note on resume
  var startTime; //ctx.currentTime at play button event
  var lastTime; //last note scheduled end time  
  var metronome = false;
  var defaultTempo = true;
  var tempos = [];//[[0, 120 or saved value],[tab position, bpm],...]
  var ptable;//document.getElementById("pitchtbl");
  var showPitch = false;//show pitch table
  var capoShift = 0;
  var pitchShift = ["",0,0,0,0,0,0,0,0,0];//user editable string note shifts
  var oType = false;//overtype keyup bypass
  var AudioContext = window.AudioContext || window.webkitAudioContext;  
  var ctx = new AudioContext();//suspend onload
  var showButtons = false;//show notes numbers and durations
  var paused = true;//not playing
  var playThings = [];//sorted [][pitch, time, duration,id,tab pos]
  var ctIdPos = {};//tab positions from ids
  var nextNoteTime = 0.0;//time to play next note
  var singleThing;//pitch for single note play
  var playStart = 0; //first note to play
  var playEnd = 0;//last note to play
  var selStart = 0;//tab slice selection begin
  var selEnd = 0;//
  var loop = false;
  var secsPerBeat;// = 60 / document.getElementById("tempo").value;   
  var playTimesDebug;//***************** = document.getElementById('playnotes');  
  var nP = 0; //play note counter
  var songLength;//playThings.length
  var songBeats;//song length in beats
  var key2 = false; //prevent scroll on Tab2
  var showNotes = true;
  var showColors = 2; //tab area appearance 
  var showTable = 0; //note symbols
  var keyScroll = false; //prevent scroll from centering after keyup
  var charWidth = 12.0; //pixel width of characters, use for scroll control
  var navKey = false; //don't redraw if true
  var barChars = []; //lengths of lyric bars
  var barNotes = []; //cum ct notes by bar
  var measureSums = [];//durations
  var rolledSums = [];//playcursor hot/cold sums
  var timesigBeats = [];//timesig beats per measure
  var barsHidden = 0;
  var partsHidden = 0;
  var partChars = [];
  var charShift = 0; //scroll effect of key events
  var cursorSplit; //pixels from content left to cursor
  var extendTail = "                          ."; //hold blank at right edge when scrolled
  var undoKey = false; //prevent redo from keyup
  var keepSpaces = true;
  var keepSections = true;
  var keepMeasures = true;
  var oldValue; //key down event tab value
  var oldPlace; //key down cursor place in px from left window
  var keyIdentified = false; //true if event keycodes are available at keydown
  var keyHandled = false; //true if keydown occurs
  var keysDown = 0; //prevent end of line wrap
  var songHtml = true; //saveFile mode
  var playButton; //document.getElementById("play");
  var tabTitle; //document.getElementById("songTitle")
  var tabArea; //document.getElementById("TabIn");
  var tabArea2; //document.getElementById("TabIn2");  
  var lyricArea; //document.getElementById("LyricIn");
  var tuneArea; //document.getElementById("TuneIn");
  var tuneArea2;
  var barNumb; //document.getElementById("BarNum"); 
  var ctabOut; //document.getElementById("ctOut");
  var tabBack; //document.getElementById("TabBacker");
  var tuneBack; //document.getElementById("TuneBacker");
  var clink; //document.getElementById("ctlink");
  var makeButton;//document.getElementById("makeclink");  
  var lastBlur; //where was I? 
  var showHelp = false;
  var mainScroll = 0;
  var helpScroll = 0;
  var tabFound = false; //state result of most recent conversion
  var append = false;
  var ctScale = 1.0; //global font-size for colorTab user settable
  var lines = []; // pasted input split by new lines
  var prevLines = []; //keep for append and undo
  var newLines = []; //append result
  var goodLines = []; // matchStart return
  var prevHead = [],
    prevCut = [],
    prevTail = []; //insert split
  prevCut[0] = "";
  var lyrHead = "",
    lyrCut = "",
    lyrTail = ""; //insert split 

  var startTab = []; //3xN arrary of start chars
  var tabStrings = 6; //number of strings in tab
  var tabSplit = []; //tab split by \n
  var barFrom = "Tab"; //mode to choose source of measure bars, tab or lyrics
  var lyricText = ""; //lyricArea value, no tail

  var lyricTextBars = []; //lyrics split
  var ctBars = []; //measures with parts and bars equivalent
  var lyricLtrSpace = 0;
  var startTabPos = 3; //what to skip
  const startCharLen = 3; // max length of start chars
  var setSelStart = 0; //set cursor position
  var setSelEnd = 0; //set cursor position
  var cursorWhere = 0; //get selectionStart
  var cursorWhere2 = 0; //get selectionStart TabIn2 
  var cursorThere = 0; //get selectionEnd
  var lineLen = 0; //tab line length
  var cursorPos = 0; // pos % line length
  var cursorPos2 = 0; // end % length
  var cursorPlace = 0; //position in pixels
  var cursorLine = 0; // one of N lines 0-5
  var cursorLyric = 0; //position in lyric area
  var cT = []; // colortab list items
  const Typ = 0; //[seq][0] item type b bar g gap c chord d dash h half o orphan
  const Chr = 1; //[seq][1] characters to display
  const Pos = 2; //[][2] tab column position
  const Meas = 3; //cT measure from playPrep
  var strClass = ["s9", "s8", "s7", "s6", "s5", "s4", "s3", "s2", "s1"];//low to high
  var stringPitch = 
      {'s6':40, 's5':45, 's4':50, 's3':55, 's2':59, 's1':64}; //midi note offsets  
  var height2 = "77px"; //black fret numbers in tab2
  var blackStrings = 3;//tabarea2 size
  var undoStack = [];//[undoLines, undoLyrics, tabLyr, undoCursor, undoScroll]
  var redoStack = [];
  var undoCount = 0;
  var redoCount = 0;
  var undoing = false;
  var undoLines = []; //undo copy of lines
  var undoLyrics = "";  
  var tabLyr;// = document.activeElement.id; //which text changed
  var undoCursor;// = (tabLyr === "TabIn") ? cursorWhere : cursorLyric;
  var undoScroll;// = lyricArea.scrollLeft;  
  var songFile = "";
  var instrument = "6 Guitar";
  var keepRests = true;  
  var divisions = []; //duration of quarter note 
  const defaultDivisions = 1;
  divisions[-1] = defaultDivisions;
  const scaleQ = 6720;//quarter note symbol duration
  
  const timeSignatures = {"38":"\uf5f2","24":"\uf5ee","58":"\uf5f5","34":"\uf5f1","68":"\uf5f7","78":"\uf5f8","22":"\uf5ef","44":"\uf5f3","98":"\uf5f9","54":"\uf5f4","118":"\u00dd","32":"\uf5f0","64":"\uf5f6","128":"\uf5fa","74":"\u00db","94":"\u00dc"}
  
  const timeSigBeats = {"\uf5f3":4,"\uf5ee":2,"\uf5ef":4,"\uf5f0":6,"\uf5f1":3,"\uf5f2":1.5,"\uf5f4":5,"\uf5f5":2.5,"\uf5f6":6,"\uf5f7":3,"\uf5f8":3.5,"\uf5f9":4.5,"\uf5fa":6,"\u00db":7,"\u00dc":9,"\u00dd":5.5}
  
  const subSymbols = {0:"\u2080",1:"\u2081",2:"\u2082",3:"\u2083",4:"\u2084",5:"\u2085",6:"\u2086",7:"\u2087",8:"\u2088",9:"\u2089"}

  const ns = {loDot:"\uE1Fc",loTie:"\uE1fd",whole:"\uE1d2",dotHalfUp:"\uECA1",halfUp:"\uE1d3",dotQuarterUp:"\uECA3",quarterUp:"\uE1d5",dot8thUp:"\uECA5",up8th:"\uE1d7",dot16thUp:"\uECA7",up16th:"\uE1d9",up32nd:"\uE1db",up64th:"\uE1dd",up128th:"\uE1df",up256th:"\uE1e1",graceUp:"\uE560",hiTie:"\uE4BA",hiDot:"\uEcb7",dotHalfDn:"\uEca2",halfDn:"\uE1D4",dotQuarterDn:"\uEca4",quarterDn:"\uE1D6",dot8thDn:"\uEca6",dn8th:"\uE1D8",dot16thDn:"\uEca8",dn16th:"\uE1DA",dn32nd:"\uE1DC",dn64th:"\uE1de",dn128th:"\uE1e0",dn256th:"\uE1e2",graceDn:"\uE561",midDot:"\uEcb6",wholeRest:"\uE4F4",dotHalfRest:"\uEcaf",halfRest:"\uE4F5",dotQuarterRest:"\uEcb0",quarterRest:"\uE4E5",dot8thRest:"\uEcb1",rest8th:"\uE4E6",dot16thRest:"\uEcb2",rest16th:"\uE4E7",rest32nd:"\uE4E8",rest64th:"\uE4e9",rest128th:"\uE4ea",rest256th:"\uE4eb"}
  
  
  const upDurations =
  {d26880:ns.whole, d13440:ns.halfUp, d6720:ns.quarterUp, d3360:ns.up8th, d1680:ns.up16th, d840:ns.up32nd, d420:ns.up64th, d210:ns.up128th, d105:ns.up256th, d40320:ns.whole + ns.loDot, d20160:ns.dotHalfUp, d10080:ns.dotQuarterUp, d5040:ns.dot8thUp, d2520:ns.dot16thUp, d1260:ns.up32nd + ns.loDot, d630:ns.up64th + ns.loDot, d315:ns.up128th + ns.loDot, d17920: "³" + ns.whole, d8960: "³" + ns.halfUp, d4480: "³" + ns.quarterUp, d2240: "³" + ns.up8th, d1120: "³" + ns.up16th, d560: "³" + ns.up32nd, d280: "³" + ns.up64th, d140: "³" + ns.up128th, d70: "³" + ns.up256th, d33600: ns.whole + ns.loTie + ns.quarterUp, d16800:  ns.halfUp + ns.loTie + ns.up8th, d8400: ns.quarterUp + ns.loTie + ns.up16th, d4200: ns.up8th + ns.loTie + ns.up32nd, d2100: ns.up16th + ns.loTie + ns.up64th, d1050: ns.up32nd + ns.loTie + ns.up64th, d525: ns.up32nd + ns.loTie + ns.up128th, d21504: "⁵" + ns.whole, d10752: "⁵" + ns.halfUp, d5376: "⁵" + ns.quarterUp, d2688: "⁵" + ns.up8th, d1344: "⁵" + ns.up16th, d672: "⁵" + ns.up32nd, d336: "⁵" + ns.up64th, d168: "⁵" + ns.up128th, d84: "⁵" + ns.up256th, d47040: ns.whole + ns.loDot + ns.loDot, d23520: ns.dotHalfUp + ns.loDot, d11760: ns.dotQuarterUp + ns.loDot, d5880: ns.dot8thUp + ns.loDot, d2940: ns.dot16thUp + ns.loDot, d1470: ns.up32nd + ns.loDot + ns.loDot, d735: ns.up64th + ns.loDot + ns.loDot, d30240: ns.whole + ns.loTie + ns.up8th, d15120:  ns.halfUp + ns.loTie + ns.up16th, d7560: ns.quarterUp + ns.loTie + ns.up32nd, d3780: ns.up8th + ns.loTie + ns.up64th, d1890: ns.up16th + ns.loTie + ns.up128th, d945: ns.up32nd + ns.loTie + ns.up256th, d50400: ns.whole + ns.loDot + ns.loDot + ns.loDot, d25200: ns.dotHalfUp + ns.loDot + ns.loDot, d12600: ns.dotQuarterUp + ns.loDot + ns.loDot, d6300: ns.dot8thUp + ns.loDot + ns.loDot, d3150: ns.dot16thUp + ns.loDot + ns.loDot, d1575: ns.up32nd + ns.loDot + ns.loDot + ns.loDot, d28560: ns.whole + ns.loTie + ns.up16th, d14280:  ns.halfUp + ns.loTie + ns.up32nd, d7140: ns.quarterUp + ns.loTie + ns.up64th, d3570: ns.up8th + ns.loTie + ns.up128th, d1785: ns.up16th + ns.loTie + ns.up256th, d52080: ns.whole + ns.loDot + ns.loDot + ns.loDot + ns.loDot, d26040: ns.dotHalfUp + ns.loDot + ns.loDot + ns.loDot, d13020: ns.dotQuarterUp + ns.loDot + ns.loDot + ns.loDot, d6510: ns.dot8thUp + ns.loDot + ns.loDot + ns.loDot, d3255: ns.dot16thUp + ns.loDot + ns.loDot + ns.loDot, d27720: ns.whole + ns.loTie + ns.up32nd, d13860:  ns.halfUp + ns.loTie + ns.up64th, d6930: ns.quarterUp + ns.loTie + ns.up128th, d3465: ns.up8th + ns.loTie + ns.up256th, d15360: "⁷" + ns.whole, d7680: "⁷" + ns.halfUp, d3840: "⁷" + ns.quarterUp, d1920: "⁷" + ns.up8th, d960: "⁷" + ns.up16th, d480: "⁷" + ns.up32nd, d240: "⁷" + ns.up64th, d120: "⁷" + ns.up128th, d60: "⁷" + ns.up256th}
  
  const dnDurations =
  {d26880:ns.halfDn + ns.halfDn, d13440:ns.halfDn, d6720:ns.quarterDn, d3360:ns.dn8th, d1680:ns.dn16th, d840:ns.dn32nd, d420:ns.dn64th, d210:ns.dn128th, d105:ns.dn256th, d40320:ns.halfDn + ns.halfDn + ns.halfDn, d20160:ns.dotHalfDn, d10080:ns.dotQuarterDn, d5040:ns.dot8thDn, d2520:ns.dot16thDn, d1260:ns.dn32nd + ns.hiDot, d630:ns.dn64th + ns.hiDot, d315:ns.dn128th + ns.hiDot, d17920: "³" + ns.halfDn + "³" + ns.halfDn, d8960: "³" + ns.halfDn, d4480: "³" + ns.quarterDn, d2240: "³" + ns.dn8th, d1120: "³" + ns.dn16th, d560: "³" + ns.dn32nd, d280: "³" + ns.dn64th, d140: "³" + ns.dn128th, d70: "³" + ns.dn256th, d33600: ns.halfDn + ns.halfDn + ns.quarterDn, d16800:  ns.halfDn + ns.dn8th, d8400: ns.quarterDn + ns.dn16th, d4200: ns.dn8th + ns.dn32nd, d2100: ns.dn16th + ns.dn64th, d1050: ns.dn32nd + ns.dn64th, d525: ns.dn32nd + ns.hiTie + ns.dn128th, d21504: "⁵" + ns.halfDn + "⁵" + ns.halfDn, d10752: "⁵" + ns.halfDn, d5376: "⁵" + ns.quarterDn, d2688: "⁵" + ns.dn8th, d1344: "⁵" + ns.dn16th, d672: "⁵" + ns.dn32nd, d336: "⁵" + ns.dn64th, d168: "⁵" + ns.dn128th, d84: "⁵" + ns.dn256th, d47040: ns.dotHalfDn + ns.halfDn + ns.halfDn, d23520: ns.dotHalfDn + ns.hiDot, d11760: ns.dotQuarterDn + ns.hiDot, d5880: ns.dot8thDn + ns.hiDot, d2940: ns.dot16thDn + ns.hiDot, d1470: ns.dn32nd + ns.hiDot + ns.hiDot, d735: ns.dn64th + ns.hiDot + ns.hiDot, d30240: ns.halfDn + ns.halfDn + ns.dn8th, d15120:  ns.halfDn + ns.dn16th, d7560: ns.quarterDn + ns.dn32nd, d3780: ns.dn8th + ns.dn64th, d1890: ns.dn16th + ns.dn128th, d945: ns.dn32nd + ns.dn256th, d50400: ns.dotHalfDn + ns.dotHalfDn + ns.dotQuarterDn , d25200: ns.dotHalfDn + ns.hiDot + ns.hiDot, d12600: ns.dotQuarterDn + ns.hiDot + ns.hiDot, d6300: ns.dot8thDn + ns.hiDot + ns.hiDot, d3150: ns.dot16thDn + ns.hiDot + ns.hiDot, d1575: ns.dn32nd + ns.hiDot + ns.hiDot + ns.hiDot, d28560: ns.halfDn + ns.halfDn + ns.dn16th, d14280:  ns.halfDn + ns.dn32nd, d7140: ns.quarterDn + ns.dn64th, d3570: ns.dn8th + ns.dn128th, d1785: ns.dn16th + ns.dn256th, d52080: ns.dotHalfDn + ns.dotHalfDn + ns.dotQuarterDn + ns.hiDot , d26040: ns.dotHalfDn + ns.hiDot + ns.hiDot + ns.hiDot, d13020: ns.dotQuarterDn + ns.hiDot + ns.hiDot + ns.hiDot, d6510: ns.dot8thDn + ns.hiDot + ns.hiDot + ns.hiDot, d3255: ns.dot16thDn + ns.hiDot + ns.hiDot + ns.hiDot, d27720: ns.halfDn + ns.halfDn + ns.dn32nd, d13860:  ns.halfDn + ns.dn64th, d6930: ns.quarterDn + ns.dn128th, d3465: ns.dn8th + ns.dn256th, d15360: "⁷" + ns.halfDn + "⁷" + ns.halfDn , d7680: "⁷" + ns.halfDn, d3840: "⁷" + ns.quarterDn, d1920: "⁷" + ns.dn8th, d960: "⁷" + ns.dn16th, d480: "⁷" + ns.dn32nd, d240: "⁷" + ns.dn64th, d120: "⁷" + ns.dn128th, d60: "⁷" + ns.dn256th} 
  
  const restSymDurations =
  {d26880:ns.wholeRest, d13440:ns.halfRest, d6720:ns.quarterRest, d3360:ns.rest8th, d1680:ns.rest16th, d840:ns.rest32nd, d420:ns.rest64th, d210:ns.rest128th, d105:ns.rest256th, d40320:ns.wholeRest + ns.midDot, d20160:ns.dotHalfRest, d10080:ns.dotQuarterRest, d5040:ns.dot8thRest, d2520:ns.dot16thRest, d1260:ns.rest32nd + ns.midDot, d630:ns.rest64th + ns.midDot, d315:ns.rest128th + ns.midDot, d17920: "³" + ns.wholeRest, d8960: "³" + ns.halfRest, d4480: "³" + ns.quarterRest, d2240: "³" + ns.rest8th, d1120: "³" + ns.rest16th, d560: "³" + ns.rest32nd, d280: "³" + ns.rest64th, d140: "³" + ns.rest128th, d70: "³" + ns.rest256th, d21504: "⁵" + ns.wholeRest, d10752: "⁵" + ns.halfRest, d5376: "⁵" + ns.quarterRest, d2688: "⁵" + ns.rest8th, d1344: "⁵" + ns.rest16th, d672: "⁵" + ns.rest32nd, d336: "⁵" + ns.rest64th, d168: "⁵" + ns.rest128th, d84: "⁵" + ns.rest256th, d47040: ns.wholeRest + ns.midDot + ns.midDot, d23520: ns.dotHalfRest + ns.midDot, d11760: ns.dotQuarterRest + ns.midDot, d5880: ns.dot8thRest + ns.midDot, d2940: ns.dot16thRest + ns.midDot, d1470: ns.rest32nd + ns.midDot + ns.midDot, d735: ns.rest64th + ns.midDot + ns.midDot, d50400: ns.wholeRest + ns.midDot + ns.midDot + ns.midDot, d25200: ns.dotHalfRest + ns.midDot + ns.midDot, d12600: ns.dotQuarterRest + ns.midDot+ ns.midDot, d6300: ns.dot8thRest + ns.midDot + ns.midDot, d3150: ns.dot16thRest + ns.midDot+ ns.midDot, d1575: ns.rest32nd + ns.midDot + ns.midDot+ ns.midDot, d52080: ns.wholeRest + ns.midDot + ns.midDot + ns.midDot + ns.midDot, d26040: ns.dotHalfRest + ns.midDot + ns.midDot + ns.midDot, d13020: ns.dotQuarterRest + ns.midDot + ns.midDot + ns.midDot, d6510: ns.dot8thRest + ns.midDot + ns.midDot + ns.midDot, d3255: ns.dot16thRest + ns.midDot+ ns.midDot+ ns.midDot, d15360: "⁷" + ns.wholeRest, d7680: "⁷" + ns.halfRest, d3840: "⁷" + ns.quarterRest, d1920: "⁷" + ns.rest8th, d960: "⁷" + ns.rest16th, d480: "⁷" + ns.rest32nd, d240: "⁷" + ns.rest64th, d120: "⁷" + ns.rest128th, d60: "⁷" + ns.rest256th, d33600: ns.wholeRest + ns.quarterRest, d16800: ns.halfRest + ns.rest8th, d8400: ns.quarterRest + ns.rest16th, d4200: ns.rest8th + ns.rest32nd, d2100: ns.rest16th + ns.rest64th, d1050: ns.rest32nd + ns.rest64th, d525: ns.rest32nd + ns.rest128th,d30240: ns.wholeRest+ ns.rest8th, d15120: ns.halfRest + ns.rest16th, d7560: ns.quarterRest + ns.rest32nd, d3780: ns.rest8th + ns.rest64th, d1890: ns.rest16th + ns.rest128th, d945: ns.rest32nd + ns.rest256th, d27720: ns.wholeRest + ns.rest32nd, d13860:  ns.halfRest + ns.rest64th, d6930: ns.quarterRest + ns.rest128th, d3465: ns.rest8th + ns.rest256th,d28560: ns.wholeRest + ns.rest16th, d14280:  ns.halfRest + ns.rest32nd, d7140: ns.quarterRest + ns.rest64th, d3570: ns.rest8th + ns.rest128th, d1785: ns.rest16th + ns.rest256th, d0:"-"}  

  var colors = ["","#ffffff","#ffdc00","#3cc8f4","#1eb24b","#d72028","#0a50a0","#773c1c","#ff00ff","#444444"];  

  const thin = String.fromCharCode(8201); //&#x2009; 4px
  const musicSym =/[\xb2\xb3\xb9\u2070-\uf5fa]/;
  
  const noteUpDurations = {"\uE1d2":4,"\uECA1":3,"\uE1d3":2,"\uECA3":1.5,"\uE1d5":1,"\uECA5":0.75,"\uE1d7":0.5,"\uECA7":0.375,"\uE1d9":0.25,"\uE1db":0.125,"\uE1dd":0.0625,"\uE1df":0.03125,"\uE1e1":0.015625,"\uE560":0,"\uEcad":0.75,"\uE1F3":0.5,"\uEcae":0.375,"\uE1F5":0.25,"\uE1F6":0.125};  
  
  const noteDnDurations = {"\uE1D4":2,"\uE1D6":1,"\uE1D8":0.5,"\uE1DA":0.25,"\uE1DC":0.125,"\uEca2":3,"\uEca4":1.5,"\uEca6":0.75,"\uEca8":0.375,"\uE1de":0.0625,"\uE1e0":0.03125,"\uE1e2":0.015625,"\uE561":0};  

  const restDurations = {"\uE4F4":4,"\uEcaf":3,"\uE4F5":2,"\uEcb0":1.5,"\uE4E5":1,"\uEcb1":0.75,"\uE4E6":0.5,"\uEcb2":0.375,"\uE4E7":0.25,"\uE4E8":0.125,"\uE4e9":0.0625,"\uE4ea":0.03125,"\uE4eb":0.015625}

  const beamSymbols = /[\uE1Fb\uE1Fa\uE1F8\uEcac\uEcab\uE1d5\uEcad\uE1F3\uEcae\uE1F5\uE1F6]/; //must include quarter note for html spacing

  const beamDurations = {"\uEcad":0.75,"\uE1F3":0.5,"\uEcae":0.375,"\uE1F5":0.25,"\uE1F6":0.125,"\uE1Fb":0.125,"\uE1Fa":0.25,"\uEcac":0.375,"\uE1F8":0.5,"\uEcab":0.75};//include beams and notes to use with quarter note as beam start 

  const fermatas = {"\uE4c0":2,"\uE4c2":1.25,"\uE4c4":1.5,"\uE4c6":3,"\uE4c8":4,"\uE4cA":3,"\uE4cc":1.5} 

  const dotDurations = {"\uE1Fc":1.5,"\uEcb6":1.5,"\uEcab":1.5,"\uEcac":1.5,};

  const dottedUpNotes = {
  "\uECA1":3,"\uECA3":1.5,"\uECA5":0.75,"\uECA7":0.375,"\uEcad":0.75,"\uEcae":0.375,"\uEcaf":	3,"\uEcb0":1.5,"\uEcb1":0.75,"\uEcb2":0.375}; 
  
  const dottedDnNotes = {
  "\uEca2":3,"\uEca4":1.5,"\uEca6":	0.75,"\uEca8":0.375}
  
  const dottedRestDurations = {"\uEcaf":3,"\uEcb0":1.5,"\uEcb1":0.75,"\uEcb2":0.375}
  
/*  const timeSigBeats = {"\uf5f3":4,"\uf5ee":2,"\uf5ef":4,"\uf5f0":6,"\uf5f1":3,"\uf5f2":1.5,"\uf5f4":5,"\uf5f5":2.5,"\uf5f6":6,"\uf5f7":3,"\uf5f8":3.5,"\uf5f9":4.5,"\uf5fa":6,"\u00db":7,"\u00dc":9,"\u00dd":5.5}*/
  
  const noteNames = {21:"A0",22:"A#0",23:"B0",24:"C1",25:"C#1",26:"D1",27:"D#1",28:"E1",29:"F1",30:"F#1",31:"G1",32:"G#1",33:"A1",34:"A#1",35:"B1",36:"C2",37:"C#2",38:"D2",39:"D#2",40:"E2",41:"F2",42:"F#2",43:"G2",44:"G#2",45:"A2",46:"A#2",47:"B2",48:"C3",49:"C#3",50:"D3",51:"D#3",52:"E3",53:"F3",54:"F#3",55:"G3",56:"G#3",57:"A3",58:"A#3",59:"B3",60:"C4",61:"C#4",62:"D4",63:"D#4",64:"E4",65:"F4",66:"F#4",67:"G4",68:"G#4",69:"A4",70:"A#4",71:"B4",72:"C5",73:"C#5",74:"D5",75:"D#5",76:"E5",77:"F5",78:"F#5",79:"G5",80:"G#5",81:"A5",82:"A#5",83:"B5",84:"C6",85:"C#6",86:"D6",87:"D#6",88:"E6",89:"F6",90:"F#6",91:"G6",92:"G#6",93:"A6",94:"A#6",95:"B6",96:"C7",97:"C#7",98:"D7",99:"D#7",100:"E7"}
  
  const subscripts = {"\u2080":0,"\u2081":1,"\u2082":2,"\u2083":3,"\u2084":4,"\u2085":5,"\u2086":6,"\u2087":7,"\u2088":8,"\u2089":9}
  
  const superscripts = {"\u2070":0,"\u00B9":1,"\u00B2":2,"\u00B3":3,"\u2074":4,"\u2075":5,"\u2076":6,"\u2077":7,"\u2078":8,"\u2079":9}
  const superRegex = /[\u00B2\u00B3\u00B9\u2070\u2074-\u2079]/;

  function newStrings(us) {
    var strings = []; //HIGH TO LOW top to bottom
    append = false; //forget old parts
    //startChars
    switch (us) {
      case "4 Bass":
        strings = [" G|", " D|", " A|", " E|"];
        strClass = ["s6", "s5", "s4", "s3", "", "", "", "", ""];
        stringPitch = {'s6':28, 's5':33, 's4':38, 's3':43};        
        height2 = "22px";
        blackStrings = 1;
        break;
      case "4 Mandolin":
        strings = [" E|", " A|", " D|", " G|"];
        strClass = ["s6", "s5", "s4", "s3", "", "", "", "", ""];
        stringPitch = {'s6':[55,55.05], 's5':[62,62.07], 's4':[69,69.1], 's3':[76,76.1]};
                          //G3       D4       A4       E5         
        height2 = "22px";
        blackStrings = 1;        
        break;
      case "4 Ukulele":
        strings = [" A|", " E|", " C|", " g|"];
        strClass = ["s6", "s5", "s4", "s3", "", "", "", "", ""];
        stringPitch = {'s6':67, 's5':60, 's4':64, 's3':69};
                          //G4       C4       E4       A4      
        height2 = "22px";
        blackStrings = 1;        
        break;
      case "5 Banjo":
        strings = [" d|", " B|", " G|", " D|", " g|"];
        strClass = ["s6", "s5", "s4", "s3", "s2", "", "", "", ""];
        stringPitch = {'s6':67, 's5':50, 's4':55, 's3':59, 's2':62};
        //                  G4       D3       G3       B3       D4
        height2 = "48px";
        blackStrings = 2;        
        break;
      case "5 Cuatro":
        strings = [" G|", " D|", " A|", " E|", " B|"];
        strClass = ["s6", "s5", "s4", "s3", "s2", "", "", "", ""];
        stringPitch = 
          {'s6':[47,59.01], 's5':[52,64.02], 's4':[57,57.04], 's3':[62,62.05], 's2':[67,67.06]};
        height2 = "48px";
        blackStrings = 2;        
        break;
      case "5 Bass":
        strings = [" G|", " D|", " A|", " E|", " B|"];
        strClass = ["s6", "s5", "s4", "s3", "s2", "", "", "", ""];
        stringPitch = {'s6':23, 's5':28, 's4':33, 's3':38, 's2':43};        
        height2 = "48px";
        blackStrings = 2;        
        break;
      case "6 Bass":
        strings = [" C|", " G|", " D|", " A|", " E|", " B|"];
        strClass = ["s6", "s5", "s4", "s3", "s2", "s1", "", "", ""];
        stringPitch = {'s6':23, 's5':28, 's4':33, 's3':38, 's2':43, 's1':48};        
        height2 = "77px";
        blackStrings = 3;        
        break;
      case "6 Guitar":
        strings = [" e|", " B|", " G|", " D|", " A|", " E|"];//h-l
        strClass = ["s6", "s5", "s4", "s3", "s2", "s1", "", "", ""];//l-h
        stringPitch = {'s6':40, 's5':45, 's4':50, 's3':55, 's2':59, 's1':64};
        height2 = "77px";
        blackStrings = 3;        
        break;
      case "7 Guitar":
        strings = [" e|", " b|", " G|", " D|", " A|", " E|", " B|"];
        strClass = ["s7", "s6", "s5", "s4", "s3", "s2", "s1", "", ""];
        stringPitch = {'s7':35, 's6':40, 's5':45, 's4':50, 's3':55, 's2':59, 's1':64};
        height2 = "77px";
        blackStrings = 3;        
        break;
      case "8 Guitar":
        strings = [" e|", " b|", " G|", " D|", " A|", " E|", " B|", "F#|"];
        strClass = ["s8", "s7", "s6", "s5", "s4", "s3", "s2", "s1", ""];
        stringPitch =
          {'s8':30, 's7':35, 's6':40, 's5':45, 's4':50, 's3':55, 's2':59, 's1':64};        
        height2 = "77px";
        blackStrings = 3;        
        break;
      case "9 Guitar":
        strings = [" e|", " b|", " G|", " D|", " A|", " E|", " B|", "F#|", "C#|"];
        strClass = ["s9", "s8", "s7", "s6", "s5", "s4", "s3", "s2", "s1"];
        stringPitch = 
          {'s9':25, 's8':30, 's7':35, 's6':40, 's5':45, 's4':50, 's3':55, 's2':59, 's1':64};
        height2 = "77px";
        blackStrings = 3;        
        break;
      case "12 Guitar":
        strings = [" e|", " B|", " G|", " D|", " A|", " E|"];//h-l
        strClass = ["s6", "s5", "s4", "s3", "s2", "s1", "", "", ""];//l-h
        stringPitch = {'s6':[40,52.01], 's5':[45,57.01], 's4':[50,62.05], 's3':[55,55.04], 's2':[59,59.07], 's1':[64,64.1]};
        height2 = "77px";
        blackStrings = 3;        
        break;        
      default:
        strings = [" e|", " B|", " G|", " D|", " A|", " E|"];
        document.getElementById("numStrings").value = 6;
    }
    return strings;
  }

  function pasteTab(paste) {
    if (typeof(paste) === 'object') {
      paste = (event.clipboardData || window.clipboardData).getData("text");
      event.preventDefault();
    }
    locateTabCursor();
    tabArea.value = "";
    tabArea.value = paste;
    tabArea2.value = tabArea.value;
    prevLines = lines.slice();
    if (prevLines.length !== tabStrings) { // fallback to empty array
      prevLines = " ".repeat(tabStrings - 1).split(" ");
      lines = prevLines.slice();
    }
    newLines = tabArea.value.replace(/(\r\n|\n|\r)/gm, "\n").split("\n");
    if (lines[0].length <  1) { //empty
      append = false;
      undoing = false;
      findTab();
    } else {
      for (var i = 0; i < tabStrings; i++) { //separate sections
        prevHead[i] = prevLines[i].slice(0, cursorPos);
        prevTail[i] = prevLines[i].slice(cursorPos);
      }
      append = true;
      undoing = false;
      findTab();
    }
  }  

  function findTab() { //for paste or file
    var j;
    doStuff();
    matchStart(newLines); // match goodlines to start pattern
    if (append && tabFound) {
      for (j = 0; j < tabStrings; j++) {
        lines[j] = prevHead[j] + goodLines[j] + prevTail[j];
      }
    } else lines = goodLines.slice();
    showLines();
    convertTab();
  }
  
  function matchStart(lines) {
    var i, j, k, m;
    var matchedLengths;
    var matches;
    var goodLength;
    goodLines = [];
    for (j = 0; j < tabStrings; j++) {
      goodLines[j] = "";
    }
    var lineSt = ""; //first three line chars without spaces
    var startSt = ""; //first chars of string without spaces
    var slice = [];
    var barLines = "";
    var dashCol = "";
    for (i = 0; i < tabStrings; i++) {
      barLines += "|";
      dashCol += "-";
    }
    for (i = 0; i < lines.length; i++) {
      matches = 0;
      matchedLengths = [];
      goodLength = lines[i].length;
      for (j = 0; j < tabStrings; j++) {
        if (lines[i + j]) { // if defined
          lineSt = lines[i + j].split(" ").join("").slice(0, 3);
          startSt = startTab[j].split(" ").join(""); //no spaces
          m = 0; // character matches
          if (lineSt.length > 2) { // skip short lines
            for (k = 0; k < startSt.length; k++) //each start character
              if (lineSt[k].toUpperCase() === startSt[k].toUpperCase()) m++;
          } else break; //short line
          if (m === startSt.length) { //matched a line
            matches += 1;
            matchedLengths[j] = lines[i + j].length;
            if (matchedLengths[j - 1] &&
              (matchedLengths[j] < matchedLengths[j - 1]))
              goodLength = lines[i + j].length; //get shortest length
          } // line matches
        } //defined
      } //set of tabStrings
      if (matches === tabStrings) {
        for (k = 0; k < 4; k++) { //find start position to show
          slice[k] = "";
          for (j = 0; j < tabStrings; j++) {
            slice[k] += lines[i + j][k];
          }
          if (slice[k] === barLines) break; //prefer bar
          if (slice[k] === dashCol) break; //settle for dashes
        }
        if (k > 3) {
          k = 3; //use last possible position regardless
        }
        startTabPos = k + 1; //skip start in convertTab
        for (j = 0; j < tabStrings; j++) { //truncate to goodlength
          // make sections if needed
          if (lines[i + j].slice(2, 3) !== "|") goodLines[j] += "|";
          if (lines[i + j].slice(1, 2) !== "|" && startTab[j][2] === "|" ) 
            goodLines[j] += "|";
          goodLines[j] += lines[i + j].slice(startTabPos, goodLength);
        }
        i += tabStrings - 1;
      }
    }
    tabFound = (goodLines[0].length > 0) ? true : false;
    if (tabFound) return;
    var getDblStart = []; // if fail then try doublespaced matching
    for (j = 0; j < tabStrings; j++) {
      getDblStart[2 * j] = startTab[j];
      getDblStart[2 * j + 1] = "";
    }
    for (i = 0; i < lines.length; i++) {
      matches = 0;
      matchedLengths = [];
      goodLength = lines[i].length;
      for (j = 0; j < tabStrings * 2; j += 2) {
        if (lines[i + j]) { // if defined
          lineSt = lines[i + j].split(" ").join("").slice(0, 3);
          startSt = getDblStart[j].split(" ").join(""); //no spaces
          m = 0; // character matches
          if (lineSt.length > 2) { // skip short lines
            for (k = 0; k < startSt.length; k++) //each start character
              if (lineSt[k].toUpperCase() === startSt[k].toUpperCase()) m++;
          } else break; //short line
          if (m === startSt.length) { //matched a line
            matches += 1;
            matchedLengths[j] = lines[i + j].length;
            if (matchedLengths[j - 1] &&
              (matchedLengths[j] < matchedLengths[j - 1]))
              goodLength = lines[i + j].length; //get shortest length
          } // line matches
        } //defined
      } //set of tabStrings
      if (matches === tabStrings) {
        for (k = 0; k < 4; k++) { //find start position to show
          slice[k] = "";
          for (j = 0; j < tabStrings * 2; j += 2) {
            slice[k] += lines[i + j][k];
          }
          if (slice[k] === barLines) break; //prefer bar
          if (slice[k] === dashCol) break; //settle for dashes
        }
        if (k > 3) {
          k = 3; //use last possible position regardless
        }
        startTabPos = k + 1; //skip start in convertTab
        for (j = 0; j < tabStrings; j++) { //truncate to goodlength
          // make sections if needed
          if (lines[i + j * 2].slice(2, 3) !== "|") goodLines[j] += "|";
          if (lines[i + j * 2].slice(1, 2) !== "|" && startTab[j][2] === "|" )
            goodLines[j] += "|";
          goodLines[j] += lines[i + j * 2].slice(startTabPos, goodLength);
        }
        i += tabStrings * 2 - 2;
      }
    }
    tabFound = (goodLines[0].length > 0) ? true : false;
    if (tabFound) return;
    goodLines = prevLines.slice();
  } // find lines that match start  

  function getTabIn() { //reconvert text box content
    noDownlink();
    doStuff();
    lines = [];
    lines = tabArea.value.split("\n");
    if (lines.length < tabStrings) return;
    if (keyIdentified) checkExtend();
    tabFound = true;
    showLines();
    convertTab();
  }
  
  function trimTail(t) {
    if (t && t.slice(t.length - 1) === ".") t = t.slice(0, t.length - 1).trimRight();
    return t;
  }
  
  function checkExtend() {//match line lengths if extended
    var j, len, ext;
    lines[0] = lines[0].trimRight();
    len = lines[0].length;
    lines[tabStrings - 1] = trimTail(lines[tabStrings - 1]);
    for (j = 1; j < tabStrings; j++) {
      lines[j] = lines[j];
      if (lines[j].length > len) {
        len = lines[j].length;
        ext = true;
      }
    }
    for (j = 0; j < tabStrings; j++) { //pad with dashes
      lines[j] = lines[j].padEnd(len, "-");
    }
    if (ext) {
      setSelStart = cursorWhere + 1 + cursorLine;
      setSelEnd = setSelStart;
    }
  }

  function checkChange() { //convert - no undo
    noDownlink();
    lines = [];
    if (!tabArea.value) {
      tabArea.value = "\n".repeat(tabStrings - 1) + extendTail;
      tabArea2.value = tabArea.value;
    }    
    lines = tabArea.value.split("\n");
    tabFound = true;
    showLines();
    convertTab();
  }
  
  function showLines() { // replace textarea with processed tab
    if (lines.length < 1) tabFound = false; //empty
    var i, showText = "";
    if (!tabFound && !undoing) {
      noTab();
    }
    if (lines.length < 1) {
      tabArea.value = "";
      tabArea2.value = "";
      ctabOut.innerHTML = "";
      return;
    }
    for (i = 0; i < lines.length - 1; i++) {
      showText += lines[i] + "\n";
    }
    lines[lines.length - 1] = trimTail(lines[lines.length - 1]);
    showText += lines[lines.length - 1] + extendTail; // no line break on last line
    tabArea2.value = showText;
    tabArea.value = showText;
    if (barFrom === "Lyr" || barFrom === "Off") moveLyricBars();
    if (barFrom === "Tab" && !undoKey) lyricBarsFromTab();
    keepScrollPlace();  
  } // display tab in input box 
  
  function keepScrollPlace() {
    if (key2) {
      tabArea2.focus();
      tabArea2.scrollTop = 0;
      tabArea2.scrollLeft = tabArea.scrollLeft;      
      key2 = false;
    }
    keyScroll = true;
    if (document.activeElement.id === "TabIn") {
      tabArea.setSelectionRange(setSelStart, setSelEnd);
      lyricArea.scrollLeft = Math.round(cursorSplit - oldPlace + (charWidth * charShift));
    }
    if (document.activeElement.id === "TabIn2") {
      tabArea2.setSelectionRange(setSelStart, setSelEnd);
      lyricArea.scrollLeft = Math.round(cursorSplit - oldPlace + (charWidth * charShift));
    }    
    if (document.activeElement.id === "LyricIn") {
      lyricArea.setSelectionRange(cursorLyric, cursorLyric);
/*      lyricArea.scrollLeft = Math.round((cursorLyric+charShift)/lyricArea.value.length *
        lyricArea.scrollWidth - oldPlace + (charWidth * charShift));//bad idea??? **** */     
    }
    charShift = 0;
  }
  
  function noTab() {
    var msg = `<h2>No Tab Found</h2><p>String notes or starting
characters don't match.

Change the starting characters
to match the stave format lines.

Could not match this as tab:</p>`
    document.getElementById("message").innerHTML = msg + newLines.join("\n");
    document.getElementById("msgdiv").style.display = "block";
    document.getElementById("msgdiv").focus();
  }  

  function convertTab() {
    var i, j, k, n;
    var sum; // number of notes in same slice
    var dashes;
    var blanks; //not spaces, empty slices from lyric edits
    var alerted = false; // prevent repeated alerts
    if (!tabFound) return; // give up
    var tab = []; //2d array of tab chars [slice][string] 
    var colType = []; // chord or space
    var orph = []; //2d array orphans = non-digit chars with no note nearby
    var tabLength = lines[0].length + startCharLen;
    var barLines = "";
    goodLines = [];
    for (j = 0; j < tabStrings; j++) {
      goodLines[j] = startTab[j].padStart(startCharLen) + lines[j]; //always same length
    }
    for (j = 0; j < tabStrings; j++) { //get two character string notes in right order
      if (goodLines[j][0] === " ") {
        goodLines[j] = goodLines[j].slice(1,2) + " " + goodLines[j].slice(2);
      }
      if (goodLines[j][0] === " " && goodLines[j][1] === " ") {
        goodLines[j] = " _" + goodLines[j].slice(2);
      }
    }
    for (i = 0; i < tabStrings; i++) barLines += "|";//create a measure bar
    for (i = 0; i < tabLength; i++) {
      tab[i] = [];
      orph[i] = [];
      for (j = 0; j < tabStrings; j++) {
        tab[i][j] = goodLines[tabStrings - 1 - j][i]; //bottom to top string order
        orph[i][j] = false; // all orphans at first
      }
      if (/[|]/.test(tab[i][1]) && !alerted && keepMeasures) {
        if (tab[i].join("") !== barLines) {
          barsNg(i);
          alerted = true;
        }
      }
    }
    for (i = 0; i < tabLength; i++) { //for each column position
      n = i + 1;//next      
      for (j = 0; j < tabStrings; j++) { // for each guitar string
        if (/[=]/.test(tab[i][j])) tab[i][j] = "-"; //dash for equals   
        k = 0;
        // find special tab chars, combine with PREVIOUS note
        while (tab[n + k] && tab[n + k][j] && // while next is special
          (tab[n + k][j].search(/[^\d\x20\-|xX(]/) === 0)) {
          // and current is special or note
          if (/[^\d\x20\-|]/.test(tab[i][j]) ||
            /[\d]/.test(tab[i][j]) || /[\u2000-\uffff]/.test(tab[i][j])) {
            tab[i][j] = tab[i][j] + tab[i + k + 1][j]; // combine
            tab[n + k][j] = ""; //fake space
          } // if next is special
          k++; // look at next position
        } // while current is special maybe more to combines
        if (/[)]/.test(tab[i][j])) {
          tab[i][j] = "(" + tab[i][j];
          if (tab[i - 1] && (tab[i - 1][j] = "(")) tab[i - 1][j] = ""; // (n)
          if (tab[i - 2] && (tab[i - 2][j] = "(")) tab[i - 2][j] = ""; // (nn)
        } // if ghost
        //find two digit notes
        if (/\d/.test(tab[i][j])) { //find digits
          if (tab[n] && (/\d/.test(tab[n][j]))) {
            tab[n][j] = tab[i][j] + tab[n][j]; //make two digit note
            tab[i][j] = "";
            for (k = 0; k < tabStrings; k++) {
              if (k !== j && /\d/.test(tab[i][k])) {
                tab[n][k] = (tab[n][k] === "-") ?
                  tab[i][k] : tab[i][k] + tab[n][k];
                tab[i][k] = "-";
              }
            }
          }
        }
        // handle (illegal) special before note
        if (/[^\d\x20\-|xX(\ue000-\uf600]/.test(tab[i][j])) { //special before note
          if (tab[i + 1] && tab[n][j] &&
            (/[\d]/.test(tab[n][j]))) {
            tab[n][j] = tab[i][j] + tab[n][j]; //combine
            tab[i][j] = "";
          }
        }
      } // for j
    } // combine digits and specials
    for (i = 0; i < tabLength; i++) { //recheck every location after combines
      sum = 0; // number of notes in same slice
      dashes = 0;
      blanks = 0;
      for (j = 0; j < tabStrings; j++) {
        if (/[0-9xX]/.test(tab[i][j])) {
          sum += 1;
          orph[i][j] = true; //notes, not orphans
          continue;
        }
        if (/[\u0020\u2000-\u200b]/.test(tab[i][j])) { //blanks from lyric edits
          orph[i][j] = true; //??
          blanks += 1;
          continue;
        }
        if (/\-/.test(tab[i][j])) { //dashes
          orph[i][j] = true;
          dashes += 1;
          continue;
        }
        if (/[|]/.test(tab[i][j])) { // bars
          orph[i][j] = true;
          continue;
        }
        if (tab[i][j] === "") { // fake space
          orph[i][j] = true;
          continue;
        } // empty locations created by combining characters
        if (orph[i][j] === false) dashes += 1; //count orphans as dashes
      }
      if (sum > 1) colType[i] = "c"; // chord found
      else if ((dashes) === tabStrings) colType[i] = "s"; //space
      else if ((blanks) === tabStrings) colType[i] = "e"; //empty slice
    } // find orphans and space slices
    append = false; //return to default
    makeCT(tab, orph, colType);
  } // prepare ascii tab for conversion
  
  function makeCT(tab, orph, colType) { // make inline string array 
    var i, j, k;
    cT = [];
    k = 0;//each cT
    for (i = 0; i < tab.length; i++) { // build cT note list
      if (tab[i][0] === "|") { // insert bar
        cT[k] = ["b", "|"]; // + barCount];
        if (tab[i + 1] && tab[i + 1][0] === "|") cT[k][Typ] = "b bd";
        cT[k][Pos] = i;
        if (cT[k - 1] && cT[k - 1][Typ] === "g") cT[k - 1][Typ] = "gz";
        k += 1;
      } // measure bars
      if (cT[k - 1]) { // look for chord begin
        if ((colType[i] === "c") && (cT[k - 1][Typ] !== "g")) {
          cT[k] = cT[k - 1][Typ].slice(0,1) === "b" ? ["gz", ""] : ["g", ""];
          cT[k][Pos] = i;
          k += 1;
        }
      } //chord begins
      if (cT[k - 1]) { // look for chord end
        if ((colType[i] !== "c") &&
          (cT[k - 1][Typ].slice(cT[k - 1][Typ].length - 1) === "c")) {
          cT[k] = ["g", ""];
          cT[k][Pos] = i;
          k += 1;
        }
      } //chord ends
      for (j = 0; j < tabStrings; j++) {
        if (/[0-9xX]/.test(tab[i][j])) { // insert note number        
          cT[k] = [strClass[j], tab[i][j]];
          if (colType[i] === "c") {
            cT[k][Typ] = strClass[j] + " c"; // add space for multi classes
          } else { //not a chord, combine sequence of notes on same string
            if (cT[k - 1] && (/[0-9xX]/.test(cT[k - 1][Chr])) &&
              cT[k - 1][Typ] === strClass[j]) {
              if (/[^\d]/.test(cT[k - 1][Chr].slice(cT[k - 1][Chr]
                  .length - 1))) { // has special last char
                cT[k - 1][Chr] += cT[k][Chr]; // no gap needed
              } else cT[k - 1][Chr] += " " + cT[k][Chr]; //separate numbers
              cT[k].pop();
              k--;
            }
          }
          cT[k][Pos] = i;
          k += 1;
        }
        if (orph[i][j] === false) { //include orphans
          cT[k] = (i < startTabPos) ? [strClass[j], tab[i][j]] : ["o", tab[i][j]];
          cT[k][Pos] = i;
          k += 1;
        } // orphans
      } // notes and note sequences
      if (keepSpaces && (colType[i] === "s")) {
        var spaces = 0; //spaces needed
        var sb = 1; // spaces before +1
        var sa = 1; // spaces after +1
        var scount = 1; // cT spaces checked
        var sd = 0; // spaces already done
        var sh = 0; // half spaces already done
        while (tab[i - sb] && (colType[i - sb] === "s")) sb++;
        while (tab[i + sa] && (colType[i + sa] === "s")) sa++;
        if (cT[k - 1]) {
          while ((cT[k - scount] && cT[k - scount][Typ]) &&
            (cT[k - scount][Chr] === "-") ||
            (cT[k - scount][Typ] === "o")) {
            if (cT[k - scount][Typ] === "d") sd++;
            if (cT[k - scount][Typ] === "h") sh++;
            scount++;
            if (cT[k - scount] === undefined) break;
          }
        }
        sb--;
        sa--;
        spaces = (sb + sa) / 2 - sd - sh * 0.5;
        if (spaces > 0) {
          cT[k] = (spaces === 0.5) ? ["h", "-"] : ["d", "-"];
          cT[k][Pos] = i;
          k += 1;
        }
      } // add spaces
    } // create cT
    playPrep();
    prepCt();
  } // convertTab

  function prepCt() {
    //  create array of lengths for chords, measures and sections for linebreaks
    var featureLength = [];
    var cTabLength = Object.keys(cT).length;
    var note; //cT index
    var nLen = [];
    var totalLength = 0;
    var findMeasure = 0; //length at previous bar, then current
    var startMeasure = 0; //note position found, back save location
    var findChord = 0;
    var startChord = 0;
    var barCount = 0;
    for (note = 0; note < cTabLength; note++) { //find and get lengths
      if (!cT[note][Chr]) cT[note][Chr] = "";
      featureLength[note] = 12; //Infinity; //default default is*was* too long to fit
      switch (cT[note][Typ].slice(0, 1)) {
        case "g":
          nLen[note] = 12;
          if (cT[note - 1] && cT[note - 1][Typ].slice(cT[note - 1][Typ].length - 1) === "c")
          //look behind for chord end
          {
            featureLength[startChord] = totalLength - findChord + 22;
            featureLength[note] = 22;
          }
          if (cT[note + 1] && cT[note + 1][Typ].slice(cT[note + 1][Typ].length - 1) === "c")
          //look ahead for chord begin
          {
            startChord = note;
            findChord = totalLength;
          }
/*          if (cT[note + 1] && (cT[note + 1][Typ] === "b")) {
            {console.log("bl")
              cT[note + 1][Typ] = "b bl";}
          }//NOT WORKING****************/            
          break;
        case "b":
          featureLength[note] = 12; //default
          if (keepMeasures) {
            featureLength[startMeasure] = totalLength - findMeasure + 12;
            startMeasure = note;
            findMeasure = totalLength;
          }
          barNotes[barCount] = note;       
          barCount++;
          if (cT[note - 1] && (cT[note - 1][Typ] === "b") || (cT[note - 1][Typ] === "b bd")) {
            if (note > 1 && keepSections) featureLength[note - 1] = Infinity; //section
          }         
          nLen[note] = 12; //always, split or not
          break;
        case "h":
          if (keepSpaces) {
            nLen[note] = 12;
            featureLength[note] = 12;
          } else {
            nLen[note] = 0;
            featureLength[note] = 0;
          }
          break;
        case "d":
          if (keepSpaces) {
            nLen[note] = 22;
            featureLength[note] = 22;
          } else {
            nLen[note] = 0;
            featureLength[note] = 0;
          }
          break;
        case "o":
          nLen[note] = 12 + 12 * cT[note][Chr].length;
          featureLength[note] = nLen[note];
          break;
        default:
          nLen[note] = 12 + 12 * cT[note][Chr].length;
          featureLength[note] = nLen[note];
      }
      totalLength += nLen[note]; //actual not feature length
    }
    makeHtml(featureLength);
    //playPrep();
  } //find lengths of sections measures chords

  function noteLength(n) {
    var noteLength = 0;
    switch (cT[n][Typ]) {
      case "g":
        noteLength = 7;
        break;
      case "b":
        noteLength = 20; //always, split or not
        break;
      case "h":
        noteLength = keepSpaces ? 17 : 0;
        break;
      case "d":
        noteLength = keepSpaces ? 22 : 0;
        break;
      case "o":
        noteLength = 10 + 12 * cT[n][Chr].length;
        break;
      default:
        noteLength = 10 + 12 * cT[n][Chr].length;
    }
    return noteLength;
  } 

  function makeHtml(featureLength) {
    var note, endBar, newDiv, newLyr, lyrSection, lyrSongPart;
    if (!paused) { //playing
      barsHidden = 0;
      partsHidden = 0;
    }
    var barCount = barsHidden + partsHidden;
    var lyricDivs = 0;
    var notecount = 0;
    var noteStart = barNotes[barsHidden + partsHidden];
    if (barsHidden === 0) noteStart = 0;
    var cTabLength = Object.keys(cT).length;
    var item = []; //list items may include new
    notecount = 0;
    var ctWidth = parseFloat(window.getComputedStyle(ctabOut).getPropertyValue("width"));
    var prevInst = " " + instrument.slice(2);
    if (editInstr) prevInst = editInstr;
    ctabOut.innerHTML = "";
    if (barCount !== 0) ctabOut.appendChild(document.createTextNode(barsHidden));
    for (note = noteStart; note < cTabLength; note++) {
      if (note === tabStrings) { //string notes
        var instrumentNameEdit = document.createElement("div");
        instrumentNameEdit.setAttribute("id", "instr");
        instrumentNameEdit.setAttribute("contenteditable", "true");
        instrumentNameEdit.setAttribute("spellcheck", "false");        
        instrumentNameEdit.innerHTML = prevInst;
        ctabOut.appendChild(instrumentNameEdit);
        instrumentNameEdit.onblur = newInstName;        
        ctabOut.appendChild(document.createElement("br"));
        ctabOut.appendChild(document.createTextNode("1"));
        featureLength[note] = 0; // not infinity for ||
        notecount = 0;
      }
      if (25 + notecount + 3 * ctScale + featureLength[note] > ctWidth) { //add break first
        if (cT[note][Typ][0] === "b") { //add end bar for measure break
          endBar = document.createElement("Li");
          endBar.setAttribute("class", "b");
          endBar.appendChild(document.createTextNode("|"));
          ctabOut.appendChild(endBar);
        }
        ctabOut.appendChild(document.createElement("br"));
        if (lyricDivs > 0) ctabOut.appendChild(document.createElement("br"));
        if (ctBars[barCount] && featureLength[note] === Infinity) ctabOut.
          appendChild(document.createTextNode(ctBars[barCount + 1]));
        else if (ctBars[barCount])
          ctabOut.appendChild(document.createTextNode(ctBars[barCount])); //not a new part
        notecount = 0;
        lyricDivs = 0;
      }
      item[note] = document.createElement("Li");
      item[note].setAttribute("id", "i" + note)
      //cT[note][Chr] = cT[note][Chr].replace(/[\u2001-\u200B\u202f\u205f]/g, "");
/*      if (!(/^\d/.test(cT[note][Chr])) &&
          musicSym.test(cT[note][Chr]) && cT[note][Typ] !== "g" &&
          cT[note][Typ].slice(0,1) !== "o")//leave out ophans already
        cT[note][Typ] = "o";// orphan for notesymbols with no fret digit*/
      var ctChars = [];    
      ctChars = cT[note][Chr].split(""); //separate for note classes
      for (var i = 0; i < ctChars.length; i++) {
        if (!showNotes && musicSym.test(ctChars[i])) {
          // nothing
        }
        else if (beamSymbols.test(ctChars[i])) {          
          var noteTxt = ctChars[i];
          while (ctChars[i + 1] && beamSymbols.test(ctChars[i + 1])){
            i++;
            noteTxt += ctChars[i];
          }
          item[note].appendChild(document.createTextNode(noteTxt + thin));
        }
        else item[note].appendChild(document.createTextNode(ctChars[i]));
      } 
      if (cT[note][Typ] === "b" || cT[note][Typ] === "b bd") {      
        if (lyricTextBars && lyricTextBars[barCount] && lyricTextBars[barCount].trim().length > 0) {
          newLyr = lyricTextBars[barCount];
          lyrSection = newLyr.match(/%(.*?)%/);
          if (lyrSection) {
            newLyr = newLyr.replace(lyrSection[0], "");
            lyrSongPart = document.createElement("div");
            lyrSongPart.setAttribute("class", "songpart");
            lyrSongPart.setAttribute("id", "sec" + barCount);
            lyrSongPart.innerHTML = lyrSection[1];
            ctabOut.appendChild(lyrSongPart);
            if (cT[note - 1] && cT[note - 1][Typ] === "b")
              ctabOut.appendChild(document.createElement("br"));
            if (newLyr.trim().length === 0) lyricDivs--;
          }          
          newDiv = document.createElement("div");
          newDiv.setAttribute("class", "lyric");
          newDiv.innerHTML = makeLyricNote(newLyr);
          item[note].appendChild(newDiv);
          lyricDivs++;
        }
        barCount++;
      } 
      item[note].setAttribute("class", cT[note][Typ]);
      ctabOut.appendChild(item[note]);
      notecount += noteLength(note);
    }
    letterRestore();
    if (document.getElementById("instr")) 
      document.getElementById("instr").style.display = "inline";
  }
  
  function newInstName(){
    editInstr = document.getElementById("instr").innerHTML;
  }  
  
  function clearCtSel() {//clear highlight classes
    var p;
    for (var i = 0; i < songLength; i++) {
      p = playThings[i][3].slice(1);
      if (cT[p]) {
        cT[p][Typ] = /c/.test(cT[p][Typ]) ? cT[p][Typ].slice(0,4) : cT[p][Typ].slice(0,2);
      }
    }
  }
  
  function makeLyricNote(newLyr) {       
    var n = "</i>";
    newLyr = newLyr.replace(/\[/g,"<i class='chordSym'>").replace(/\]/g,"</i>").
      replace(/\{/g,"<i style = '").replace(/\}/g,"'>").
      replace(/\\/g, n).replace(/\(/g,"<em>").replace(/\)/g,"</em>");      
    //{} is any CSS, \ to end span, () italic, [] chord name
    return newLyr;
  }

  function cutTab() {
    var cutCursor, i;
    var clipCut = [];
    noDownlink();
    undoing = false;
    append = false;
    doStuff();
    locateTabCursor();
    oldPlace = cursorPlace;
    cutCursor = cursorPos;
    if (cursorWhere === cursorThere) {//no selection, cut all
      prevHead = [];
      prevTail = [];
      lines = [];
      prevCut = tabSplit.slice();
      tabArea.value = "";
      tabArea2.value = "";
      lyrCut = trimTail(lyricArea.value);
      lyricArea.value = "";
      lyricText = "";
      barNumb.innerHTML = "";
      getTabIn();
      for (i = 0 ; i < tabStrings; i++) {
        if (startTab[i][2] === "|" && prevCut[i][0] === "|")
          clipCut[i] = startTab[i][0] + startTab[i][1] + prevCut[i];
        else clipCut[i] = startTab[i] + prevCut[i];
      }
      if (navigator.clipboard)
        navigator.clipboard.
          writeText("\n" + clipCut.join("\n") + "\n" + "  "  + lyrCut + "\n");
      return;//done
    }//no selection
    lines = [];
    for (i = 0; i < tabStrings; i++) { //separate sections
      prevHead[i] = tabSplit[i].slice(0, cursorPos);
      prevCut[i] = tabSplit[i].slice(cursorPos, cursorPos2);
      prevTail[i] = tabSplit[i].slice(cursorPos2);
      lines[i] = prevHead[i] + prevTail[i];
      if (startTab[i][2] === "|" && prevCut[i][0] === "|")
        clipCut[i] = startTab[i][0] + startTab[i][1] + prevCut[i];      
      else clipCut[i] = startTab[i] + prevCut[i];      
    }
    lyrHead = lyricText.slice(0, cursorPos);
    lyrCut = lyricText.slice(cursorPos, cursorPos2);
    lyrTail = trimTail(lyricText.slice(cursorPos2));
    lyricText = lyrHead + lyrTail;
    lyricArea.value = lyricText + extendTail;
    tabFound = true;
    showLines();
    convertTab();
    setSelStart = cutCursor;
    setSelEnd = setSelStart;
    tabArea.setSelectionRange(setSelStart, setSelEnd);
    playCursor(setSelStart,setSelStart);
    tabArea.focus();
    if (navigator.clipboard)
      navigator.clipboard.writeText("\n" + clipCut.join("\n") + "\n" + "  " + lyrCut + "\n");
  }

  function copyTab() {
    var split = [], cpy = [], clp, curKeep;
    locateTabCursor();
    if (cursorWhere === cursorThere) {
      split = tabArea.value.split("\n");
      for (var i = 0; i < tabStrings; i++) {
        cpy[i] = startTab[i] + trimTail(split[i]);
      }
      clp = cpy.join("\n");
      if (navigator.clipboard) navigator.clipboard.writeText(clp + "\n" + lyricText);
    }
    curKeep = cursorPos;
    cutTab();
    tabArea.focus();
    tabArea.setSelectionRange(curKeep,curKeep);
    addTab();
  }
  
/*  function pasteClip(paste) {
    tabArea.value = "";
    tabArea.value = paste;
    prevLines = lines.slice();
    newLines = tabArea.value.replace(/(\r\n|\n|\r)/gm, "\n").split("\n");
    if (lines[0].length <  1) { //empty
      append = false;
      undoing = false;
      findTab();
    } else {
      for (var i = 0; i < tabStrings; i++) { //separate sections
        prevHead[i] = prevLines[i].slice(0, cursorPos);
        prevTail[i] = prevLines[i].slice(cursorPos);
      }
      append = true;
      undoing = false;
      findTab();
    }
  }*/
  
  function pasteFail(err) {
    var msg = `<h2>Could not paste from clipboard</h2><p>Browser may not allow paste with button click. 

Instead try paste from menu, Ctrl-V, Cmd-V,
long press, right click etc.

Use <button>Paste</button> to add copied or cut
tab text from this page.

Offline clipboard paste may work in Chrome.
</p>` + err
    document.getElementById("message").innerHTML = msg;
    document.getElementById("msgdiv").style.display = "block";
    document.getElementById("msgdiv").focus();
  }

  function addTab() {
    //var didPaste = false;
    var add = true;
    locateTabCursor(add);    
    if (prevCut[0].length < 1 ) {//only uses clipboard when empty after reload
      //didPaste = true;
      if (! navigator.clipboard.readText) pasteFail();
       navigator.clipboard.readText()
        .then(text => {
          pasteTab(text);
        })
        .catch(err => {
          pasteFail(err);
        });
       return;//just paste if empty
    }
    //copy = false;
    //if (didPaste) return;
    noDownlink();
    undoing = false;
    append = false;
    doStuff();
    oldPlace = cursorPlace;
    lines = [];
    if (prevCut.length !== tabStrings) return;    
    for (var i = 0; i < tabStrings; i++) { //separate sections
      prevHead[i] = tabSplit[i].slice(0, cursorPos);
      prevTail[i] = tabSplit[i].slice(cursorPos);
      lines[i] = prevHead[i] + prevCut[i] + prevTail[i];
    }
    lyrHead = lyricText.slice(0, cursorPos);
    lyrTail = trimTail(lyricText.slice(cursorPos));
    lyricText = lyrHead + lyrCut + lyrTail;
    lyricArea.value = lyricText + extendTail;
    tabFound = true;
    showLines();
    convertTab();
    setSelStart = cursorPos;
    setSelEnd = setSelStart;
    tabArea.setSelectionRange(setSelStart, setSelEnd);
    tabArea.focus();
  }
  
  function noteToggle(){
    showNotes ? showNotes = false : showNotes = true;
    var addClass;
    addClass = document.getElementById("showNote");
    if (showNotes) addClass.innerHTML = "&#xE1d7;";
    else addClass.innerHTML = "&#xE560;";    
    checkChange();    
  }
  
  function editClick() {
    showEditButton ? showEditButton = false :  showEditButton = true;
    if (showEditButton) {
      document.getElementById("editButton").setAttribute("class", "toggle off");
      document.getElementById("nonPrint").style.display = "block";
      document.getElementById("menuTog").style.display = "inline-block";
    }
    else {
      document.getElementById("editButton").setAttribute("class", "toggle black");
      document.getElementById("nonPrint").style.display = "none";
      document.getElementById("menuTog").style.display = "none";
    }
  }
  
  function menuToggle(){
    showButtons ? showButtons = false : showButtons = true;
    var d = document.getElementsByClassName("morebuttons");
    for(var i = 0; i < d.length; i++) {    
      d[i].style.display = showButtons ? 'block' : 'none';
    }
    if (showPitch) pitchToggle();
    showTable = 2;
    tableToggle();
  }
  
  function pitchToggle() {
    showPitch = showPitch ? false : true;
    var pitchdiv = document.getElementById("pitches");
    pitchdiv.style.display = showPitch ? 'block' : 'none';
    var t, p, n;
    for (var i = 1;i<10;i++) {//one based
      t = 9 - (i + 9 - tabStrings);//
      ptable.rows[i].cells[0].setAttribute("class", strClass[t])
      p = stringPitch[strClass[t]];
      if (p && p.length === 2) n = noteNames[p[0] + pitchShift[i] + capoShift];
      else n = noteNames[p + pitchShift[i] + capoShift];
      ptable.rows[i].cells[1].textContent = n;
      ptable.rows[i].cells[0].textContent = startTab[i - 1];
      if (showPitch) ptable.rows[i].cells[2].textContent = "";
      if (showPitch && p) {
        ptable.rows[i].cells[2].textContent = pitchShift[i];
        ptable.rows[i].cells[2].style.backgroundColor = "#fff";
      }
      else ptable.rows[i].cells[2].style.backgroundColor = "#d0d0d0";
    }
    readPitches();
    playPrep();
  }
  
  function readPitches(){
    var c, t = [], p, n;
    for (var i = 1;i<10;i++) {//one based
      c = ptable.rows[i].cells[0].textContent;
      if (c) t[i] = c.trimStart().padStart(3);
      var x = parseFloat(ptable.rows[i].cells[2].textContent);      
      if (x != x) x = 0;//!NaN
      if (x > 24) x = 0;//max
      if (x < -24) x = 0;
      pitchShift[i] = x; 
      p = stringPitch[strClass[9 - (i + 9 - tabStrings)]];
      if (p && p.length === 2) n = noteNames[p[0] + pitchShift[i] + capoShift];
      else n = noteNames[p + pitchShift[i] + capoShift];
      if (!n) {
        if (p && p.length === 2) {
          n = p[0] + pitchShift[i] + "," + parseFloat(p[1] + pitchShift[i]);
        }
        else n = p + pitchShift[i] + capoShift;
      }
      if (n != n) n = "";
      ptable.rows[i].cells[1].textContent = n;
    }
    return t;
  }
  
  function writePitches(p){
    for (var i = 1;i<10;i++) {
      ptable.rows[i].cells[2].textContent = p[i];
    }
    readPitches();
  }
  
var tid;
var nextStr = 10;

  function abortTimer() {
    clearTimeout(tid);
    nextStr = 10;
    playPrep();
  }
  
  function strum() {
    var t = readPitches();
    tuneArea.value = t.join("\n").slice(1);
    tuneBlur();
    strumLoop();
  }
  
  function strumLoop(){  
    nextStr--;//low to high
    var sp = stringPitch[ptable.rows[nextStr].cells[0].getAttribute("class")]//get from table
    var pp;
    if (sp && sp.length === 2) {
      pp = [];
      pp[0] = sp[0] + pitchShift[nextStr] + capoShift;
      pp[1] = sp[1] + pitchShift[nextStr] + capoShift;
    }
    else pp = sp + pitchShift[nextStr] + capoShift;
    singleThing = pp;
    if (nextStr < 1) abortTimer();
    pickit();
  }//strum
  
  function pickit() {
    if (nextStr === 10) return; //aborted
    if (singleThing) {
      document.getElementById("notePlay").click();//hidden button event
      tid = setTimeout(strumLoop, 600);
    }
    else strumLoop();
  }
  
  function closepitch (){
    showPitch = false;
    var pitchdiv = document.getElementById("pitches");
    pitchdiv.style.display = 'none';
    var t = readPitches();
    tuneArea.value = t.join("\n").slice(1);
    tuneBlur();
    playPrep();
  }
  
  function metroToggle() {
    metronome = metronome ? false : true;
    var m = document.getElementById("metro");
    if (metronome) m.setAttribute("class", "transport off");
    else m.setAttribute("class", "transport black");
    playPrep();
  }
  
  function shiftTune() {
    var t = document.getElementById("pretune").value;
    if (t === "0") pitchShift = ["",0,0,0,0,0,0,0,0,0];
    if (t === "1") pitchShift = ["",0,0,0,0,0,-2,-2,0,0];
    if (t === "2") pitchShift = ["",-2,0,0,0,0,-2,0,0,0];
    if (t === "3") pitchShift = ["",2,2,2,2,2,0,0,0,0];
    if (t === "4") pitchShift = ["",0,0,1,2,2,0,0,0,0];
    if (t === "5") pitchShift = ["",-2,-2,-1,0,0,-2,0,0,0];
    if (t === "6") pitchShift = ["",0,1,0,-2,-2,-4,0,0,0];
    if (t === "7") pitchShift = ["",-1,1,0,-2,-2,-4,0,0,0];
    if (t === "8") pitchShift = ["",-2,0,0,0,-2,-2,0,0,0];
    if (t === "9") pitchShift = ["",-2,-1,0,0,-2,-2,0,0,0];
    if (t === "10") pitchShift = ["",0,-2,0,-2,-2,-4,0,0,0];
    if (t === "11") pitchShift = ["",-2,-2,0,-2,-2,-2,-2,0,0];    
    if (t === "12") pitchShift = ["",0,0,12,12,12,12,0,0,0];
    if (t === "13") pitchShift = ["",3,5,2,0,-2,-4,0,0,0];    
    showPitch = false;
    pitchToggle();
  }
  
  function capoChange(){
    capoShift = parseFloat(document.getElementById("capo").value);
    if (capoShift != capoShift) capoShift = 0;
/*    for (var i = 1;i<10;i++) {//one based
      ptable.rows[i].cells[2].textContent = pitchShift[i] + parseFloat(capoShift);
    }*/
    readPitches();
  }
  
  function colorToggle(){
    showColors = (showColors + 1) % 3;
    var stripes = document.getElementsByClassName("stripe");
    var tstripes = document.getElementsByClassName("tstripe");
    for(var i = 0; i < stripes.length; i++) {
      if (showColors > 0  || parseInt(stripes[i].id.slice(1)) > tabStrings) 
        stripes[i].style.display = 'none';
      else if (parseInt(stripes[i].id.slice(1)) <= tabStrings) {
        stripes[i].style.display = 'block';
        stripes[i].style.backgroundColor =
          colors[strClass[tabStrings -stripes[i].id.slice(1)].slice(1)];
      }
    }
    for(i = 0; i < tstripes.length; i++) {
      if (showColors === 2 || parseInt(tstripes[i].id.slice(1)) > tabStrings) 
        tstripes[i].style.display = 'none';
      else if (parseInt(tstripes[i].id.slice(1)) <= tabStrings) {
        tstripes[i].style.display = 'block';
        tstripes[i].style.backgroundColor =
          colors[strClass[tabStrings -tstripes[i].id.slice(1)].slice(1)];
      }
    }
    var bstyle = document.getElementById("colorButton");
    if (showColors === 0 ) {
      bstyle.style.backgroundImage = "linear-gradient(to bottom,#fceb80 20%, #9be2f8 20% 40%, #6fdd90 40% 60%, #e27479 60% 80%, #5c8dc4 80%)";
      bstyle.innerHTML = "-";
      tabArea.style.color = "white";
      tabArea2.style.display = "block";
      tuneArea.style.color = "white";
      tuneArea2.style.display = "block";
    }
    if (showColors === 1 ) {
      bstyle.style.backgroundImage = "linear-gradient(to bottom,#fceb80 20%, #9be2f8 20% 40%, #6fdd90 40% 60%, #e27479 60% 80%, #5c8dc4 80%)";
      bstyle.innerHTML = "|";
      tabArea.style.color = "black";
      tabArea2.style.display = "none";
      tuneArea.style.color = "white";
      tuneArea2.style.display = "block";      
    }
    if (showColors === 2 ) {
      bstyle.style.backgroundImage = "linear-gradient(to bottom, #d1d1d1 20%, #b1b1b1 20% 40%, #939393 40% 60%, #717171 60% 80%, #505050 80%)";
      bstyle.innerHTML = "X";
      tabArea.style.color = "black";
      tabArea2.style.display = "none";
      tuneArea.style.color = "black";
      tuneArea2.style.display = "none";      
    }
    linkScroll();
  }
  
  function tableToggle(){
    showTable = (showTable + 1) % 3;
    if (showTable === 1) {
      document.getElementById("noterow").style.display = "block";
    }
    if (showTable === 2) {
     document.getElementById("noterow").style.display = "inline-table";      
    }
    if (showTable === 0) {
     document.getElementById("noterow").style.display = "none";      
    }    
  }

  function spread() {
    var lyr = document.querySelectorAll("div.lyric");
    lyricLtrSpace += 0.5;
    for (var i = 0; i < lyr.length; i++) {
      lyr[i].style.letterSpacing = lyricLtrSpace + "px";
    }
  }

  function squeeze() {
    var lyr = document.querySelectorAll("div.lyric");
    lyricLtrSpace -= 0.5;
    for (var i = 0; i < lyr.length; i++) {
      lyr[i].style.letterSpacing = lyricLtrSpace + "px";
    }
  }

  function letterRestore() {
    var lyr = document.querySelectorAll("div.lyric");
    for (var i = 0; i < lyr.length; i++) {
      lyr[i].style.letterSpacing = lyricLtrSpace + "px";
    }
  }

  function help() {
    const helpTxt = document.getElementById("helpText");
    if (!showHelp) {
      mainScroll = window.scrollY;
      helpTxt.setAttribute("class", "show");
      showHelp = true;
      document.documentElement.scrollTop = helpScroll;
    } else {
      helpScroll = window.scrollY;
      helpTxt.setAttribute("class", "hide");
      showHelp = false;
      document.documentElement.scrollTop = mainScroll;
      if (tabArea.value.length < 25 && tabStrings === 6) greenSleeves();
      else tabArea.focus();
    }
  }

  function undo() {
    var upop = [];
    if (undoCount < 1) {
      lines = (" ").repeat(tabStrings - 1).split(" ");
      tabArea.value = "";
      tabArea2.value = "";
      lyricArea.value = "";
      barNumb.innerHTML = "";
      ctabOut.innerHTML = "";
      tabTitle.innerHTML = "";
      return;
    }
    //var scroll = lyricArea.scrollLeft;
    tabLyr = document.activeElement.id; //which text changed
    undoCursor = (tabLyr === "TabIn") ? cursorWhere : cursorLyric;
    undoScroll = lyricArea.scrollLeft;    
    redoCount = redoStack.push([lines, lyricText, tabLyr, undoCursor, undoScroll]);
    lines = (" ").repeat(tabStrings - 1).split(" ");
    upop = undoStack.pop();
    lines = upop[0];
    if (!lines[0]) lines = (" ").repeat(tabStrings - 1).split(" ");
    lyricText = upop[1];
    lyricArea.value = lyricText + extendTail;
    makeBarNums();
    undoCount = undoStack.length;
    append = false;
    undoing = true;
    tabFound = true;
    showLines();
    convertTab();
    undoing = false;
    tabLyr = upop[2];
        
    if (tabLyr === "TabIn") {
      tabArea.focus();      
      tabArea.setSelectionRange(upop[3], upop[3]);
      locateTabCursor();
      playCursor(cursorPos, cursorPos);
    }
    else {
      lyricArea.setSelectionRange(upop[3], upop[3]);
      lyricArea.focus();
      locateLyricCursor();
    }
    lyricArea.scrollLeft = upop[4];
    playPrep();
  }

  function redo() {
    var repop = [];
    if (redoCount < 1) return;
    undoLines = lines.slice();
    undoLyrics = lyricText;
    tabLyr = document.activeElement.id; //which text changed
    undoCursor = (tabLyr === "TabIn") ? cursorWhere : cursorLyric;
    undoScroll = lyricArea.scrollLeft;    
    undoCount = undoStack.push([undoLines, undoLyrics, tabLyr, undoCursor, undoScroll]);
    lines = [];
    repop = redoStack.pop();
    undoLines = repop[0];
    if (!undoLines[0]) undoLines = (" ").repeat(tabStrings - 1).split(" ");
    lyricText = repop[1];
    lyricArea.value = lyricText + extendTail;
    makeBarNums();    
    lines = undoLines.slice();
    redoCount = redoStack.length;
    tabFound = true;
    showLines();
    convertTab();
    tabLyr = repop[2];
    lyricArea.scrollLeft = repop[4];    
    if (tabLyr === "TabIn") {
      tabArea.focus();      
      tabArea.setSelectionRange(repop[3], repop[3]);
      locateTabCursor();
      playCursor(cursorPos, cursorPos);      
    }
    else {
      lyricArea.setSelectionRange(repop[3], repop[3]);
      lyricArea.focus();
    }
    lyricArea.scrollLeft = repop[4];
    playPrep();    
  }

  function doStuff() {
    if (undoing) return;
    tabLyr = document.activeElement.id; //which text changed
    undoCursor = (tabLyr === "TabIn") ? cursorWhere : cursorLyric;
    if (!tabLyr){
      tabLyr = "TabIn";
      undoCursor = 0;
    }
    undoScroll = lyricArea.scrollLeft;
    redoStack = [];
    redoCount = 0;
    undoLines = lines.slice();
    undoLyrics = lyricText;
    undoCount = undoStack.push([undoLines, undoLyrics, tabLyr, undoCursor, undoScroll]);
  }

  function dropFile(e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    var reader = new FileReader();
    var fileExt = file.name.split('.').pop();
    var fileType = 3;
    if (fileExt === "txt" || fileExt === "text") fileType = 0;
    if (fileExt === "xml" || fileExt === "musicxml") fileType = 1;
    if (fileExt === "mxl") fileType = 2;    
    reader.onload = function(event) {
      if (fileType === 0) parseFile(event.target.result);
      if (fileType === 1) parseFile(convertXML(event.target.result));
      if (fileType === 2) parseFile(convertXML(unZip(event.target.result)));
    };
    if (file != null && file.size > 0 && fileType < 2) reader.readAsText(file);
    if (file != null && file.size > 0 && fileType === 2)reader.readAsArrayBuffer(file);   
    return false;
  }
  
  function openFile(){
    var fileName = this.files[0].name;
    var fileExt = fileName.split('.').pop();
    var fileType = 3;
    if (fileExt === "txt" || fileExt === "text") fileType = 0;
    if (fileExt === "xml" || fileExt === "musicxml") fileType = 1;
    if (fileExt === "mxl") fileType = 2;    
    readFile(this.files[0], fileType, function(event) {
      if (fileType === 0) parseFile(event.target.result);
      if (fileType === 1) parseFile(convertXML(event.target.result));
      if (fileType === 2) parseFile(convertXML(unZip(event.target.result)));      
    });
    
  }

  function readFile(file, fileType, onLoadCallback){
    var reader = new FileReader();
    reader.onload = onLoadCallback;
    if (file != null && file.size > 0 && fileType < 2) reader.readAsText(file);
    if (file != null && file.size > 0 && fileType === 2)reader.readAsArrayBuffer(file);     
  }
  
  function unZip(t) {//https://users.cs.jmu.edu/buchhofp/forensics/formats/pkzip.html
    var bytes = new Uint8Array(t);
    var veiw = new DataView(t);
    var cnl = veiw.getInt16(0x1a,true);//containerNameLen
    var xfl = veiw.getInt16(0x1c,true);//extraFieldLen    
    var cns = 0x1e;//containerNameStart
    var cfs = cns + cnl + xfl;//containerFileStart
    var cfl = veiw.getInt32(0x12,true); //containerFileLen
    var mnl = veiw.getInt16(0x1a + cfs + cfl,true);//musicNameLen
    var mxd = veiw.getInt16(0x1c + cfs + cfl,true);//musicExtraLen
    var mns = 0x1e + cfs + cfl;//musicNameStart
    var mfs = mns + mnl + mxd;//musicFileStart
    var mfl = veiw.getInt32(0x12 + cfs + cfl,true); //musicFileLen
    var start = bytes.slice(mfs,mfs + mfl);
    var data = zip_inflate(String.fromCharCode.apply(null, start));
    return data;
  }  
  
  function parseFile(unknown){
      const preJson = '\n{"';
      const postJson = "}\n\nLyrics:\n";
      const postWhatever = ":\n\n";
      //var unknown = e.target.result;
      var empty = (lines.length < 1 || lines[0].length < 2) ? true : false;
      var known = false;
      if (unknown.includes(preJson) && unknown.includes(postJson)) known = true;
      if  (known) {
        var parseOk = true;
        var text = unknown.split(preJson)[0];
        var whatever = text.split(postWhatever)[0];
        document.title = whatever;
        try {
          var getJson = JSON.parse('{"' + unknown.split(preJson)[1].split(postJson)[0] + "}");
        } catch (err) {
          alert("Something went wrong with this file\n\n"  + err);
          parseOk = false;}
        if (parseOk) useJson(getJson);
        else text = unknown;//corrupt
      }
      else text = unknown;//not a CT_file
      locateTabCursor();
      tabArea.value = text;
      prevLines = lines.slice();      
      newLines = tabArea.value.replace(/(\r\n|\n|\r)/gm, "\n").split("\n");
      if (empty) {
        append = false;
        undoing = false;
        findTab();
      } else {
        for (var i = 0; i < tabStrings; i++) { //separate sections
          prevHead[i] = prevLines[i].slice(0, cursorPos);
          prevTail[i] = prevLines[i].slice(cursorPos);
        }
        append = true;
        undoing = false;
        findTab();
      }
      if (known) {
        if (empty) lyricText = unknown.split(postJson)[1];
        else lyricText += unknown.split(postJson)[1];//append
        lyricArea.value = lyricText;
        if (barFrom === "Tab") lyricBarsFromTab();
        if (barFrom === "Lyr") tabBarsFromLyrics(lyricText);
        tabTitle.innerText = whatever;
      }
      else {
        songFile = "title";
        tabTitle.innerText = songFile;
      }    
  }
  
  function parseXML(xmlString) {
    var parser = new DOMParser();
    // Parse Invalid XML source to get namespace of <parsererror>:
    var docError = parser.parseFromString("INVALID", "text/xml");
    var parsererrorNS = docError.getElementsByTagName("parsererror")[0].namespaceURI;
    var doc = parser.parseFromString(xmlString, "text/xml");
    if (doc.getElementsByTagNameNS(parsererrorNS, "parsererror").length > 0) {
        throw new Error("Error parsing XML");
    }
    return doc;
}
  
  function convertXML(xmlString) {
  var doc,i,j,k;
  try {doc = parseXML(xmlString);} catch (e) {window.alert(e);return("");}
  var partwise = doc.getElementsByTagName("score-partwise")[0];
  if (!partwise) {window.alert("Can't convert XML\nMust be score-partwise structure");return("");} //can't do time-wise xml
  var parts = doc.getElementsByTagName("part");
  var chooseTab = 0;//index for tabParts    
  var tabParts = [];//notes with tab by [part,staff]
  var partNotes;
  var p,s,t,n;//p counts parts, s counts staffs, t counts tab staffs, n counts notes  
  for (p = 0;p < parts.length;p++){
    if (parts[p].getElementsByTagName("fret")[0]) {//frets are in here somewhere
      t = 0;//use 0 if no staffs
      if (parts[p].getElementsByTagName("staff")[0]) {//if there is a staff number we'll need it
        partNotes = parts[p].getElementsByTagName("note");//look at every note
        for (n=0;n<partNotes.length;n++){
          if (partNotes[n].getElementsByTagName("fret")[0]) {
            s = partNotes[n].getElementsByTagName("staff")[0].innerHTML;
            if (t != s) {//don't already have this staff
              chooseTab++;
              tabParts[chooseTab] = [p,s];//add staff to the list of choices
              t = s;
            }
          }
        }//next note
      }//if staff
      if (t === 0) {//no staffs but has frets in this part
        chooseTab++;
        tabParts[chooseTab] = [p,t];
      }
    }//part has tab
  }//next part       
  if (chooseTab === 0){
    window.alert("No tab found in XML");
    return("");
  }
  var wantedPart = 0;
  if (chooseTab > 1) wantedPart = parseInt(prompt("Use tablature part " + chooseTab + " or enter a lower tab part number.", chooseTab));
  if (isNaN(wantedPart)) return "";
  if (wantedPart > 0 && wantedPart <= chooseTab) chooseTab = wantedPart;     
  var pf = parts[tabParts[chooseTab][0]];//use only the wanted part that has frets
  var fretStaff = tabParts[chooseTab][1];
  var hasStaff = fretStaff === 0 ? false : true;
  var tabStr = pf.getElementsByTagName("staff-lines");
  var tabStrings;
  if (tabStr.length > 0) tabStrings =
    parseInt(tabStr[0].textContent);//default
  else tabStrings = 5;//if not present default is 5 line staff per schema
  var stringNames = [];
  var stringAlters = [];
  var alterChar;
  var staffDetails = pf.getElementsByTagName("staff-details");
  if (staffDetails.length > 0) {
    var tunings = staffDetails[0].getElementsByTagName("staff-tuning");
    if (tunings && tunings.length > 0) {
      for (i=0;i<tabStrings;i++){
        stringNames[i] =
          tunings[i].getElementsByTagName("tuning-step")[0].innerHTML;
        stringAlters[i] =
          tunings[i].getElementsByTagName("tuning-alter")[0];

        if (stringAlters[i]) {
          if (stringAlters[i].innerHTML === "1") alterChar = "#";
          else alterChar = "b";
          stringNames[i] += alterChar;
        }
      }
    }
  }
  else stringNames = [];
  var measures = pf.getElementsByTagName("measure");
  var musicLength = measures.length;

  //get xml values as 2D arrays [measure][note]
  var notes = [];
  var chords = [];
  var rests = [];  
  var durations = [];
  var strings = [];
  var frets = [];
  var bars = [];
  var beats = [];
  var beatTypes = [];
  var ties = [];
  var tiesTo = [];
  var tieType;
  var tieTag;
  var voices = [];
  var backup;
  var sound;
  var tempos = [];
  tempos[0] = 120;//default
  var timings = [];
  var measureNotes = [];
  var timeCounter = 0;//track time as found in xml
  var chordDuration = 0;
  divisions = [];
  for(i = 0; i < musicLength; i++) {
    if (measures[i].getElementsByTagName("divisions")[0]) divisions[i] = parseInt(measures[i].getElementsByTagName("divisions")[0].innerHTML);
    if (!divisions[i]) divisions[i] = divisions[i - 1];
    sound = measures[i].getElementsByTagName("sound");
    if (sound) {
      for (j=0;j<sound.length;j++){
        k = sound[j].outerHTML;
        var b = /tempo="(.*?)"/.exec(k);
        if (b && b[1]) var bpm = parseInt(b[1]);
        if (Number.isInteger(bpm) && bpm > 0) {
          tempos[i] = bpm;
          break;
        }
      }
    }
    if(measures[i].getElementsByTagName("beats")[0]) beats[i] = measures[i].getElementsByTagName("beats")[0].innerHTML;
    if(measures[i].getElementsByTagName("beat-type")[0]) beatTypes[i] = measures[i].getElementsByTagName("beat-type")[0].innerHTML;    
    chords[i] = [];
    rests[i] = [];
    durations[i] = [];
    strings[i] = [];
    frets[i] = [];
    bars[i] = [];
    ties[i] = [];
    tiesTo[i] = [];
    voices[i] = [];
    backup = 0;
    timings[i] = [];
    notes = measures[i].getElementsByTagName("note");
    k = 0;//loop all notes in part by j, collect k notes from wanted fret staff
    timeCounter = 0;//for each measure
    for (j =0;j< notes.length;j++) {
      n = notes[j];
      backup = 0;      
      durations[i][k] = 0;
      strings[i][k] = "";
      frets[i][k] = "-";      
      timings[i][k] = timeCounter;
      if (hasStaff && n.getElementsByTagName("staff")[0].innerHTML != fretStaff) continue;
      if (n.getElementsByTagName("chord")[0]) chords[i][k] = true;
      else chords[i][k] = false;
      if (n.getElementsByTagName("rest").length > 0) rests[i][k] = true;
      else rests[i][k] = false;
      if (n.getElementsByTagName("duration")[0]) durations[i][k] =
        parseInt(n.getElementsByTagName("duration")[0].innerHTML) * scaleQ / divisions[i];
      if (n.getElementsByTagName("voice")[0]) voices[i][k] = n.getElementsByTagName("voice")[0].innerHTML;
      else voices[i][k] = "0";
      if (!chords[i][k]) timings[i][k] = timeCounter;
      else timings[i][k] = timings[i][k - 1];
      tieType = 0;//default is not tied
      if (!rests[i][k]) {//no ties or frets for rests
        tieTag = n.getElementsByTagName("tie");
        if (tieTag[0]) {
          tieType = 1;//assume tie start
          if (tieTag.length === 2) tieType = 2;//continue
          else if (tieTag[0].outerHTML.includes("stop") || tieTag.length > 2) tieType = 3;// >2 is bad xml
          /*could have one or two ties start/stop get fretID's here, type 0 not tied, type 1 start, type 2 continue, type 3 stop*/
          }
        //handle corrupt xml missing fret or string
        strings[i][k] = 0;//strings start with 1
        frets[i][k] = 1000;//impossible
        if (n.getElementsByTagName("string")[0]) strings[i][k] = 
          (tabStrings - parseInt(n.getElementsByTagName("string")[0].innerHTML));     
        if (n.getElementsByTagName("fret")[0]) frets[i][k] = parseInt(n.getElementsByTagName("fret")[0].innerHTML);
        tiesTo[i][k] = 100 * strings[i][k] + frets[i][k];
        if (strings[i][k] === 0 || frets[i][k] === 1000) ties[i][k] = 0;//don't tie if missing numbers
      }
      ties[i][k] = tieType;
      if (n.nextElementSibling && n.nextElementSibling.tagName === "backup") {
        backup = parseInt(n.nextElementSibling.getElementsByTagName("duration")[0].innerHTML);
        if (n.nextElementSibling.nextElementSibling.tagName === "forward") backup -=
          parseInt(n.nextElementSibling.nextElementSibling.getElementsByTagName("duration")[0].innerHTML);
        }
      if (n.nextElementSibling &&  n.nextElementSibling.tagName === "forward") {
        backup = -1 * parseInt(n.nextElementSibling.getElementsByTagName("duration")[0].innerHTML);
        if (n.nextElementSibling.nextElementSibling &&
            n.nextElementSibling.nextElementSibling.tagName === "backup") backup +=
          parseInt(n.nextElementSibling.nextElementSibling.getElementsByTagName("duration")[0].innerHTML);
        }
      chordDuration = chords[i][k] ? 0 : durations[i][k];
      timeCounter += chordDuration - backup * scaleQ / divisions[i];
      //console.log("k fret timing timeCounter chorDuration backups chords[i][k]",k,frets[i][k],timings[i][k],timeCounter,chordDuration,backup,chords[i][k])
      bars[i][k] = i;
      k++;
    }//notes
    measureNotes[i] = k;
  }//measures  
       
  //console.log("Bar","String","Fret","Chord","Rest","Dur","Pos","Timing","Interval","Tie type","Tie to ID","voice","ChordUpstem")    
    
  //get time signature symbols, beats per measure, tempos
  var timeSigs = [];
  timeSigs[-1] = "\uf5f3";//4/4 default
  var timeSigChange;// = [];    
  var measureBeats = [];
  measureBeats[-1] = 4;
  var timeKey;
  var newSig;
    
  for (i=0;i<musicLength;i++){//add timesigs and tempos as tabNotes
    if (tempos[i]){
      j = tempos[i].toFixed(0).toString().split("");
      tempos[i] = "\ue866";
      while (j.length > 0) {
        k = j.shift();
        if (k in subSymbols) tempos[i] += subSymbols[k];
      }
      tempos[i] += "-";
      k = measureNotes[i];
      measureNotes[i]++;
      bars[i][k] = i;
      strings[i][k] = 0;
      frets[i][k] = tempos[i];
      timings[i][k] = -1;//will sort to first      
    } 
    timeKey = beats[i] + beatTypes[i];
    newSig = "";
    if (timeKey) newSig = timeSignatures[timeKey];
    timeSigChange = newSig != timeSigs[i-1] ? true : false;
    if (!newSig) timeSigChange = false;//undefined
    if (timeSigChange) timeSigs[i] = newSig;
    if (timeSigChange) measureBeats[i] = timeSigBeats[timeSigs[i]];
    if (timeSigChange) {//add as note
      k = measureNotes[i];
      measureNotes[i]++;
      bars[i][k] = i;
      strings[i][k] = 0;
      frets[i][k] = timeSigs[i];
      timings[i][k] = -1;//will sort to first
    }
    else measureBeats[i] = measureBeats[i-1];
  }
    
/* time length units are relative to a quarter note and can change with each measure
  duration lookup is relative to a 6720 quarter note length const scaleQ = 2*2*2*2*2*2*3*5*7 = 64*3*5*7
  divisions[measure] quarter note length in xml
  duration[measure][note] * scaleQ /divisions[measure] note sound length re scaleQ 
  timings[measure][note] cumulative length since first measure note (re scaleQ)
  intervals[measure][note] length until next note (re scaleQ)
  backups[measure][note] * scaleQ / divisons[measure] timing corrections (re scaleQ)
  Translation consists of finding upstem intervals between timings, and downstem durations from the xml note symbol durations.
  */    
       
 // tabNotes array structure
  const Bar = 0;
  const String = 1;
  const Fret = 2;
  const Chord = 3;
  const Rest = 4;
  const Dur = 5;
  const Pos = 6;
  const Timing = 7;
  const Interval = 8;
  const Tie = 9;
  const TieTo = 10;
  const Voice = 11;
  const ChordUpstem = 12;
  
  //assemble notes
  var collectNotes= [];
  var tabCount = 0;    
  var tPosition = [];
  var intervals = [];
  for (i = 0;i < musicLength;i++){    
    tPosition[i] = [];
    intervals[i] = [];
    for (j = 0;j < measureNotes[i]; j++){
      tPosition[i][j] = "";
      intervals[i][j] = "";
      collectNotes[tabCount] =
        [bars[i][j],    //0
        strings[i][j],  //1
        frets[i][j],    //2
        chords[i][j],   //3
        rests[i][j],    //4
        durations[i][j],//5
        tPosition[i][j],//6
        timings[i][j],  //7
        intervals[i][j],//8
        ties[i][j],     //9
        tiesTo[i][j],   //10
        voices[i][j]]   //11
      tabCount++;
    }
  }

  //sort each Measure!
  var tabMeasures = [];
  var tabNotes = [];
  var x = 0;
  var y = 0;
  for (i = 0;i < musicLength; i++) {
    tabMeasures[i] = [];
    while (collectNotes[x] && i === collectNotes[x][0]) {
      tabMeasures[i][y] = collectNotes[x].slice();
      x++;y++;
    }
    y = 0; 
    tabMeasures[i].sort(byTiming);
    tabMeasures[i].sort(byString);
    tabMeasures[i].push([i + 1, "", "|", false, false, 0, "",""]);
    tabNotes = tabNotes.concat(tabMeasures[i]);
  }    

  function byTiming(a, b) {
      if (a[Timing] === b[Timing]) return 0;
      else return (a[Timing] < b[Timing]) ? -1 : 1;
  }
    
  function byString(a, b) {
      if (a[Timing] !== b[Timing]) return 0;
      else return (a[String] < b[String]) ? -1 : 1;
  }    
    
  tabCount = tabNotes.length; 

    
  //collect tied note durations in array   
  for (i=0;i<tabCount;i++) {
    k = tabNotes[i][Dur];
    tabNotes[i][Dur] = [];
    tabNotes[i][Dur][0] = k;
    if (tabNotes[i][Tie] === 1) {
      for (j = i + 1;j<tabCount;j++) {
        if (!tabNotes[j][Chord] && tabNotes[i][Voice] === tabNotes[j][Voice]) tabNotes[i][Dur].push(tabNotes[j][Dur]);
        if (tabNotes[j][Tie] === 3 &&
            tabNotes[i][TieTo] === tabNotes[j][TieTo]) break;
      }
    }
  }
    
  //collect sequential rest durations in array
  for (i=0;i<tabNotes.length;i++) {
    if (tabNotes[i] && tabNotes[i][Rest] && tabNotes[i + 1] && tabNotes[i + 1][Rest] && tabNotes[i][Voice] === tabNotes[i + 1][Voice]){
      tabNotes[i][Dur].push(tabNotes[i + 1][Dur][0])
      tabNotes.splice(i + 1,1);
      i--;
    }
  }
    
  var restArray = [];//save sequential rest durations   
    
  i = 0;
  j = 0;
  while (i < tabNotes.length) {//delete rests, tie continue,tie stop
    if (tabNotes[i] &&
        (tabNotes[i][Rest] || tabNotes[i][Tie] === 2 || tabNotes[i][Tie] === 3)) {
      if (tabNotes[i][Rest]) {
        restArray.push(tabNotes[i][Dur]);
        tabNotes[i + 1][TieTo] = j;
        j++;
      }
      tabNotes.splice(i,1);
      i--;
    }
    i++;
  }    
  tabCount = tabNotes.length;  
    
  //choose best default note type based on useage 
  const Half = 2 * scaleQ;
  const Quarter = 1 * scaleQ;
  const Eighth = 0.5 * scaleQ;
  const Sixteenth = 0.25 * scaleQ;    
  
  var halves = 0;  
  var quarters = 0
  var eighths = 0;
  var sixteenths = 0;
  var notesUsed = [];
    

  tabNotes[tabCount] = [];
  tabNotes[tabCount][Timing] = Infinity;//note after end exists but never happens
  for (i = 0;i < tabCount;i++) {
    tabNotes[i][Interval] = tabNotes[i + 1][Timing] - tabNotes[i][Timing];
    j = tabNotes[i][Dur][0]; //get notated durations 
    if (tabNotes[i][Interval] === 0 && tabNotes[i][String] !== "") tabNotes[i + 1][Chord] = true;    
    if (j === Half && !tabNotes[i][Rest]) halves++;
    if (j === Quarter && !tabNotes[i][Rest]) quarters++;
    if (j === Eighth && !tabNotes[i][Rest]) eighths++;
    if (j === Sixteenth && !tabNotes[i][Rest]) sixteenths++;
  }   
  tabNotes.pop();//lose fake note
    
  for (i=0;i<tabCount;i++){  
    if (tabNotes[i][Interval] < 0) {//last note in measure, find Interval
      tabNotes[i][Interval] = measureBeats[tabNotes[i][Bar]] * scaleQ - tabNotes[i][Timing];
    }
  }
    
//get chord upstems from last chord note and apply to all chord notes 
  var needRest = 0;
  for (i=tabCount-1;i>=0;i--) {//last to first
    if (tabNotes[i][Chord] && tabNotes[i][Dur][0] !== 0) {
      needRest = tabNotes[i][Interval] - sumDur(i);
      if (needRest > 0) tabNotes[i][ChordUpstem] = tabNotes[i][Interval] - needRest;
      else tabNotes[i][ChordUpstem] = tabNotes[i][Interval];
    }
    if (tabNotes[i + 1] && tabNotes[i + 1][ChordUpstem] && tabNotes[i][Interval] === 0) 
      tabNotes[i][ChordUpstem] = tabNotes[i + 1][ChordUpstem];//chord root
  }     
    
  notesUsed = [halves,quarters,eighths,sixteenths];
  var mostUsed = notesUsed.indexOf(Math.max(...notesUsed));
  const defaultTypes = [Half,Quarter,Eighth,Sixteenth];
  var defaultNote = defaultTypes[mostUsed];
  var timePosition = 1; // |- are 0,1
  var posChange = 0;    
  
//get note positions
  for (let p=0;p<tabCount;p++){
    tabNotes[p][Pos] = timePosition;
    if (!keepRests && tabNotes[p][Fret] === "-") {
      posChange = 0;
      tabNotes[p][Fret] = "";
    }
    else posChange = 1;   
    if (tabNotes[p+1] && !tabNotes[p+1][Chord]) {
      timePosition += posChange;
    }  
    addNoteSymbol(p);
  }
      
  function addNoteSymbol(n) {//and rests
    if (tabNotes[n + 1] && tabNotes[n + 1][Timing] && (tabNotes[n][Fret] === "|" || tabNotes[n][Timing] === -1) && tabNotes[n + 1][Timing] >= 0) {//first note not at start
      tabNotes.splice(n + 1,0,[tabNotes[n][Bar], tabStrings - 1, tiedRest(n + 1,tabNotes[n + 1][Timing]), false, true, [0], "","","R"]);
      tabCount++;//add rest at beginning of measure
      return;
    }
    if (/\D/.test(tabNotes[n][Fret])) return;//no symbol needed for non digits       
    if (tabNotes[n][Interval] === tabNotes[n][Dur][0] && tabNotes[n][Tie] !== 1) {//usual case, no downstem
      if (tabNotes[n][Dur][0] === defaultNote) return;//no symbol
      tabNotes[n][Fret] += upStem(tabNotes[n][Dur][0]);     
      return;
    }
    else {//downstem might be needed
      var durSum = sumDur(n);
      needRest = tabNotes[n][Interval] - durSum;
      if (needRest > 0) {// add rest
        tabNotes.splice(n + 1,0,[tabNotes[n][Bar], tabStrings - 1, tiedRest(n + 1,needRest), false, true, [], "","","y"]);
        tabCount++;
        tabNotes[n][Interval] -= needRest;//remove rest from timing
      }
      if (tabNotes[n][Interval] !== defaultNote && !tabNotes[n][Chord] && tabNotes[n][Interval] !== 0){
        if(tabNotes[n][Tie] !== 1) tabNotes[n][Fret] += upStem(tabNotes[n][Interval]);
        else if (tabNotes[n][Interval] !== defaultNote) tabNotes[n][Fret] += tiedUpstem(n);
      }
      else if (tabNotes[n][ChordUpstem]){//handle mixed chord here, exclude defaults**************
        var preDur = sumDur(n - 1);
        if (!tabNotes[n][Chord]) {//root
          if (tabNotes[n][ChordUpstem] !== defaultNote) tabNotes[n][Fret] += upStem(tabNotes[n][ChordUpstem]);
          if (durSum !== tabNotes[n][ChordUpstem]) tabNotes[n][Fret] += tiedDownstem(n,durSum);
          return;
        }
        if (tabNotes[n][Chord] && preDur !== durSum) {//new downstem
          if (tabNotes[n][ChordUpstem] !== defaultNote) tabNotes[n][Fret] += upStem(tabNotes[n][ChordUpstem]);
          tabNotes[n][Fret] += tiedDownstem(n,durSum);
          return;
        }
        return;//no symbol needed for chord note
      }
      if (durSum !== tabNotes[n][Interval]) {
        tabNotes[n][Fret] += tiedDownstem(n,durSum);//Dur changes from notated to actual duration
      }
    }
  }
    
  function sumDur(n){
    let ds = tabNotes[n][Dur][0];
    let darr = tabNotes[n][Dur].slice();
    const addArr = darr => darr.reduce((a, b) => a + b, 0);
    if (darr.length > 1) ds = addArr(darr);
    return ds;
  }
    
  function upStem(n){
    let u = upDurations["d" + n];
    if (!u) u = "";
    return u;
  }
    
  function dnStem(n){
    let u = dnDurations["d" + n];
    if (!u) u = "";
    return u;
  }
    
  function restSym(n){
    let u = restSymDurations["d" + n];
    if (!u) u = "";
    return u;
  }    
    
  function tiedUpstem(n){
    var noteSymbol = upStem(tabNotes[n][Interval]);
    if (noteSymbol) return noteSymbol;
    let mergedDurs = mergeTies(tabNotes[n][Dur]);  
    noteSymbol = upStem(mergedDurs[0]);
    for (j = 1;j < mergedDurs.length;j++){
      noteSymbol += ns.loTie + upStem(mergedDurs[j]);
    }
    return noteSymbol;
  }

  function tiedDownstem(n,sum){
    var noteSymbol = dnStem(tabNotes[n][sum]);
    if (noteSymbol) return noteSymbol;
    let mergedDurs = mergeTies(tabNotes[n][Dur]);
    noteSymbol = dnStem(mergedDurs[0]);
    for (k = 1;k < mergedDurs.length;k++){
      noteSymbol += dnStem(mergedDurs[k]);
    }
    return noteSymbol;      
  }
    
  function tiedRest(n,need){
    if (need <= 0) return;
    var noteSymbol = restSym(need);
    if (noteSymbol) return noteSymbol;
    noteSymbol = "";
    for (k = 0;k < restArray[tabNotes[n][TieTo]].length;k++){
      noteSymbol += restSym(restArray[tabNotes[n][TieTo]][k]) + "-";
    }      
    return noteSymbol;
  } 

  function mergeTies(tieNotes){    
    for (let m=0;m<tieNotes.length;m++){
      if (tieNotes[m]){
        let n = tieNotes.indexOf(tieNotes[m]);
        n = tieNotes.indexOf(tieNotes[m], n + 1);
        if (n != -1) {
          tieNotes[m] *= 2;
          tieNotes.splice(n,1);
          m -= 2;
        }
      }
    }
    tieNotes.sort(byDuration)
    return tieNotes;
  }
    
  function byDuration(a, b) {
      if (a === b) return 0;
      else return (a < b) ? 1 : -1;
  }
    
  var tabText = [];
  for (i = 0;i < tabStrings; i++){
    tabText[i] = "";
  }
    
  //var s,n; // string, note
  var longestLine = 0;
  var nLine = "";
  var prevPos = 0;
  var chordPos = 0;
  n = 0; //count notes
  for(n = 0;n < tabCount; n++){
    if (tabNotes[n][Fret] !== "|"){ //notes including rests     
      nLine = tabText[tabNotes[n][String]];   
      if (!nLine) nLine = "";
      tabText[tabNotes[n][String]] =
        nLine.padEnd(nLine.length + (tabNotes[n][Pos] - prevPos), "-");
      chordPos = prevPos;
      prevPos = tabNotes[n][Pos];
      tabText[tabNotes[n][String]] += tabNotes[n][Fret];
      while (tabNotes[n+1] && tabNotes[n+1][Chord]) {
        n++;
        nLine = "" + tabText[tabNotes[n][String]];
        tabText[tabNotes[n][String]] =
          nLine.padEnd(nLine.length + (tabNotes[n][Pos] - chordPos), "-");
        tabText[tabNotes[n][String]] += tabNotes[n][Fret];
      }
      longestLine = tabText[0].length;
      for(s=1;s<tabStrings;s++) {
        if (tabText[s].length > longestLine)
          longestLine = tabText[s].length;
      }
      for(s=0;s<tabStrings;s++) {
        tabText[s] = tabText[s].padEnd(longestLine,"-");
      }
    }
    else { // bar |
      for(s=0;s<tabStrings;s++) {
        nLine = tabText[s];
        tabText[s] =
          nLine.padEnd(nLine.length + (tabNotes[n][Pos] - prevPos), "-");
        tabText[s] += tabNotes[n][Fret];
      }
      prevPos = tabNotes[n][Pos];
    }
  }
    
 var headDefault = upDurations["d" + defaultNote].padStart(tabStrings,"-").split("");
  
  var startChars = [];
  if (stringNames.length > 0) {
    for (i=0;i<tabStrings;i++) {
      startChars[tabStrings - 1 - i] = stringNames[i].padStart(2) + "|" + headDefault[i];
    }
  }
  else startChars = [" e|" + upDurations["d" + defaultNote]," B|-"," G|-"," D|-"," A|-"," E|-"]; 
  
  var asciiTabInline = "";//inline
  for (i=0;i<tabStrings;i++) {
    asciiTabInline += startChars[i] + tabText[tabStrings - 1 - i];
    asciiTabInline += "\n";
  }
  
  // get measure lengths
  var mLengths = [];
  var mStart = 0;
  var m = 0;
  for (i = 0;i < tabText[0].length;i++) {
    if (tabText[0][i] === "|") {
      mLengths[m] = i - mStart;
      mStart = i;
      m++;
    }
  }
    
// split into measures and reverse string order
  tabMeasures = [];
  var measurePos = 0;
  for (i = 0;i < musicLength;i++){
    tabMeasures[i] = [];
    for (j = 0;j < tabStrings; j++){
      tabMeasures[i][j] =
        tabText[tabStrings - 1 - j].slice(measurePos, measurePos + mLengths[i]);
    }
    measurePos += mLengths[i];
  }
  return asciiTabInline;    
} //parse xml  

  function pasteLyrics() {
    if (event.repeat) return;
    let paste = (event.clipboardData || window.clipboardData).getData("text");
    var prevLyric = trimTail(lyricArea.value);
    var newHead = prevLyric.slice(0, lyricArea.selectionStart);
    var newTail = prevLyric.slice(lyricArea.selectionEnd);
    paste = paste.replace(/(\r\n|\n|\r|\t)/gm, " ");
    lyricText = newHead + paste + newTail;
    lyricArea.value = lyricText;
    if (barFrom === "Tab") lyricBarsFromTab();
    if (barFrom === "Lyr") tabBarsFromLyrics(lyricText);
    event.preventDefault();
    cursorLyric = lyricArea.selectionStart;
    lyricArea.setSelectionRange(cursorLyric, cursorLyric);
  }

  function tabBarsFromLyrics(lt) { //create bars in tab from lyrics
    //var lt = lyricText;
    if (event.key === "Home" || event.key === "End") return;
    var i, j, k, u = false,
      merged = [],
      barless = [],
      showText = "";
    var tabLines = tabArea.value.split("\n");
    tabLines[tabStrings - 1] = trimTail(tabLines[tabStrings - 1]);
    var tabLen = tabLines[0].length;   
    lt = lt.padEnd(tabLen, " ");
    var bars = lt.split("|").length;
    for (i = 0; i < tabLines.length; i++) {
      barless[i] = tabLines[i].replace(/[\|]/g, "").padEnd(lt.length - bars, "-") + "-";
    }
    for (j = 0; j < tabLines.length; j++) { //each string
      merged[j] = "";
      k = 0; //tabline char
      for (i = 0; i < lt.length; i++) { // each lyric char
        if (lt[i] === "|") {
          merged[j] += "|";
        } else {
          while (/[\u2000-\uffff]/.test(barless[j][k])) {
            u = true;
            merged[j] += barless[j][k];
            k++;
          } // unicode
          if (!u) {
            merged[j] += barless[j][k];
            k++;
          }
          u = false;
        }
      }
    }
    for (i = 0; i < tabLines.length - 1; i++) {
      showText += merged[i] + "\n";
    }
    showText += merged[tabLines.length - 1] + extendTail;
    tabArea.value = showText;
    lyricText = lt;
    lyricArea.value = lt + extendTail;
    makeBarNums();
    getTabIn();    
    lyricArea.setSelectionRange(cursorLyric, cursorLyric);
  }
  
  function thisBarIns() { //increase size of current bar, keep others
    var i, thisBar = 0;
    var tabBars = [];
    var tabV = [];
    var tabBarsWithNotes = [];    
    var notePad = 0;
    var tLen, lLen;
    var tabBarStrings = []; //= tabArea.value.split("\n")[tabStrings - 1].split("|");
    var lyrBars = (trimTail(lyricArea.value)).split("|");
    tabSplit = (trimTail(tabArea.value)).split("\n");
    if (tabSplit.length < tabStrings) return;
    for (i = 0; i < tabStrings; i++) {
      tabBarStrings[i] = tabSplit[i].split("|");
    }
    tabBars = tabSplit[0].split("|");
    tabBarsWithNotes = tabSplit[0].split("|");    
    for (i = 0; i < tabBars.length; i++) {
      if (tabBars[i].length !== lyrBars[i].length) break;
    }
    i !== tabBars.length ? thisBar = i : thisBar = 0;
    lLen = lyrBars[thisBar].length;
    tLen = tabBars[thisBar].length;
    notePad = tabBarsWithNotes[thisBar].length - tLen;//excess length due to notes
    if (lLen > tLen) { //lyric insert or tab del
      for (i = 0; i < tabStrings; i++) {
        tabBarStrings[i][thisBar] =
          tabBarStrings[i][thisBar].padEnd(lLen + notePad, " ");
        if (document.activeElement.id === "TabIn") setSelStart = cursorWhere;
        setSelEnd = setSelStart;
      }
    } 
    else if (tLen > lLen) { //tab insert or lyr del
      if (tabBars[thisBar].slice(tLen - 1).charCodeAt(0) === 32) { // lose blank end
        for (i = 0; i < tabStrings; i++) {
          tabBarStrings[i][thisBar] =
            tabBarStrings[i][thisBar].slice(0,lLen + notePad);         
        }
        if (document.activeElement.id === "TabIn") setSelStart = cursorWhere;
        setSelEnd = setSelStart;
      }
      else lyrBars[thisBar] = lyrBars[thisBar].padEnd(tLen, " ");
    }
    for (i = 0; i < tabStrings; i++) {
      tabV[i] = tabBarStrings[i].join("|");
    }    
    tabArea.value = tabV.join("\n");
    lyricText = lyrBars.join("|");
    lyricArea.value = lyricText + extendTail;
    makeBarNums();
    getTabIn();  
    if (document.activeElement.id === "LyricIn") lyricArea.setSelectionRange(cursorLyric, cursorLyric);
    if (document.activeElement.id === "TabIn") tabArea.setSelectionRange(setSelStart, setSelStart);
  }

  function lyricBarsFromTab() { //create bars in lyrics from tab
    var lt = trimTail(lyricArea.value);
    var tabLine = tabArea.value.split("\n", 1)[0];
    lt = lt.padEnd(tabLine.length);
    var barless = lt.replace(/[\|]/g, ""); //.padEnd(tabLine.length,"@");
    var i, j = 0,
      merged = "";
    for (i = 0; i < tabLine.length; i++) {
      if (tabLine[i] === "|") {
        merged += "|";
      } else {
        merged += barless[j];
        j++;
      }
    }
    merged += barless.slice(j);
    merged = merged.slice(0, tabLine.length); //always match lengths
    lyricArea.value = merged + extendTail;
    lyricText = merged;
    makeBarNums();
    if (event && document.activeElement.id === "LyricIn") {
      var moveLeft = (event.key === "Backspace") ||
          (event.key === "ArrowLeft") ||
          (event.key === "Left");
      var moveRight = (event.key === "ArrowRight") || (event.key === "Right");
      if (!moveLeft &&  !moveRight && merged[cursorLyric - 1] === "|") cursorLyric++;
      if (!moveLeft &&  !moveRight && merged.slice(cursorLyric - 2, cursorLyric) === "||")
        cursorLyric++;
      if (!moveLeft &&  !moveRight && merged.slice(cursorLyric - 3, cursorLyric) === "|||")
        cursorLyric++; 
      keepScrollPlace();
      doStuff();
      prepCt();
    }
  }

  function makeBarNums() {
    var i,j = 1,k = 0,n;
    var measureNums = "";
    lyricTextBars = lyricText.split("|");
    for (i = 0; i < lyricText.length;i++){
      if (lyricText[i] === "|" && lyricText[i + 1] !== "|" &&
         measureNums.length < lyricText.length - 1) {
        n = j.toString();
        measureNums += n;
        k = n.length - 1;
        j++;
      }
      else {
        if (k <= 0) measureNums += " ";
        else k--;
      }
    }
    measureNums = measureNums.padEnd(lyricText.length," ");
    barNumb.innerHTML = measureNums + extendTail;
    noteSelect(selStart, selEnd);
    var count = 0;
    for (i = 0; i < lyricTextBars.length; i++) {
      if (lyricTextBars[i].length > 0) count++;
      if (lyricTextBars[i - 1] && lyricTextBars[i - 1].length === 0 && lyricTextBars[i].length === 0) count++;
      ctBars[i] = count;
    }
    var bars = lyricText.replace(/(\|\|)/g, "| ").split("|"); //parts|| and bars| are measures
    for (i = 0; i < bars.length; i++) {
      barChars[i] = bars[i].length + 1;
      if (barChars[i-1]) barChars[i] += barChars[i-1]; //cum      
    }
    var parts = lyricText.split("||");
    for (i = 0; i < parts.length; i++) {
      partChars[i] = parts[i].length + 2;
      if (partChars[i-1]) partChars[i] += partChars[i-1]; //cum
    }
  }
  
  function partScroll() {
    var i; 
    for (i = 0; i < partChars.length; i++) {
      if (charWidth * partChars[i] > lyricArea.scrollLeft) break;
    }
    return i;    
  }
  
  function barScroll() {
    var i; 
    for (i = 0; i < barChars.length; i++) {
      if (charWidth * barChars[i] > lyricArea.scrollLeft) break;
    }
    return i;
  }

  function moveLyricBars() { //|'s from lyrics change bar length
    var ltBars = lyricArea.value.split("|");
    var tBars = (tabArea.value.split("\n")[0]).split("|");
    if (!(tBars[0])) return;
    for (var i = 0; i < ltBars.length; i++) {
        ltBars[i] = ltBars[i].padEnd(tBars[i].length);
        ltBars[i] = ltBars[i].slice(0, tBars[i].length);
    }
    lyricText = ltBars.join("|");
    lyricArea.value = lyricText + extendTail;
  }

  function insLyric() {
    var isDel = (event.key === "Delete") || (event.key === "Del");
    if (!isDel) cursorLyric++;
    if (barFrom === "Off" && isDel &&
        lyricArea.value[cursorLyric] === "|") event.preventDefault();
    noteSelect(cursorLyric, cursorLyric);
  }

  function insLyricBar() { // | from numpad /
    event.preventDefault();
    if (barFrom === "Tab" || barFrom === "Off") {
      return;
    }
    var lyricBar = "";
    lyricBar = lyricArea.value.slice(0, cursorLyric) + "|" +
      lyricArea.value.slice(cursorLyric);
    lyricArea.value = lyricBar;
    cursorLyric += 1;
    lyricArea.setSelectionRange(cursorLyric, cursorLyric);
    noteSelect(cursorLyric, cursorLyric);    
  }

  function bkspLyric() {
    var lyricDel = "";
    event.preventDefault();
    if (cursorLyric === 0) return;
    if (barFrom === "Off" && lyricArea.value[cursorLyric - 1] === "|") return;
    lyricDel = lyricArea.value.slice(0, cursorLyric - 1) + lyricArea.value.slice(cursorLyric);
    lyricArea.value = lyricDel;
    cursorLyric -= 1;
    lyricArea.setSelectionRange(cursorLyric, cursorLyric);
    noteSelect(cursorLyric, cursorLyric);    
  }

  function homeLyricKey() {
    navKey = true;
    event.preventDefault();
    cursorLyric = 0;
    lyricArea.setSelectionRange(0, 0);    
    lyricArea.scrollLeft = 0;
    noteSelect(0,0);
  }

  function endLyricKey() {
    navKey = true;
    event.preventDefault();
    var end = lyricArea.value.length - extendTail.length;
    cursorLyric = end;
    if (barFrom === "Tab") cursorLyric--;
    lyricArea.scrollLeft = lyricArea.scrollWidth;
    lyricArea.setSelectionRange(end, end);
    noteSelect(end,end);
  }

  function leftLyricArrow() {
    navKey = true;
    if (cursorLyric === 0) return;
    cursorLyric -= 1;
    noteSelect(cursorLyric, cursorLyric);
  }

  function rightLyricArrow() {
    navKey = true;
    cursorLyric += 1;
    noteSelect(cursorLyric, cursorLyric);    
  }

  function barMaster() {
    var sH = tabArea.scrollLeft;
    var barMode = document.getElementById("barMode");
    barFrom = barMode.value;
    if (barFrom === "Lyr") {
      lyricArea.focus();
      lyricArea.style.background = 'white';
      lyricArea.style.color = 'blue';
      tabArea.blur();
      tabBack.style.background = '#b6c7ff';
      tabArea.style.color = 'blue';
      barMode.style.color = '#b6c7ff';
      //getTabIn();
    } else if (barFrom === "Tab") {
      tabArea.focus();
      tabBack.style.background = 'white';
      tabArea.style.color = 'white';
      lyricArea.blur();
      lyricArea.style.background = '#e8e8e8';
      lyricArea.style.color = '#404040';
      barMode.style.color = '#ddd';
      //getTabIn();
    }
    else if (barFrom === "Off") {
      lyricArea.focus();
      lyricArea.style.background = 'white';
      lyricArea.style.color = 'green';
      tabArea.blur();
      tabBack.style.background = '#b6ffc7';
      tabArea.style.color = 'green';
      barMode.style.color = '#b6ffc7';
      //getTabIn();      
    }
    showColors--;
    colorToggle();
    lyricArea.scrollLeft = sH;
    //tabArea.scrollLeft = sH;
  }
  
  function tuneFocus() {
    tuneArea.style.color = "black";
    tuneArea2.style.display = "none";
    tuneBack.style.background = 'white';
    var tstripes = document.getElementsByClassName("tstripe");    
    for(var i = 0; i < tstripes.length; i++) {
      tstripes[i].style.display = 'none';
    }
    tuneArea.focus();
  }

  function tuneBlur() {
    showColors--;
    colorToggle();
    tuneBack.style.background = '#e8e8e8';
    var barLines = "";
    var dashCol = "";
    var i, j, col, startPos, ok = false;
    var tuneLines = tuneArea.value.split("\n");
    for (i = 0; i < tabStrings; i++) {
      barLines += "|";
      dashCol += "-";
    }
    for (i = 0; i < startCharLen; i++) {
      col = "";
      for (j = 0; j < tabStrings; j++) {
        col += tuneLines[j][i];
      }
      if (!ok && col === barLines) {
        startPos = i;
        ok = true;
      }
      if (!ok && col === dashCol) {
        startPos = i;
        ok = true;
      }
    }
    if (ok) {
      for (i = 0; i < tabStrings; i++) {
        startTab[i] = tuneLines[i].slice(0, startPos + 1).padStart(startCharLen);
      }
      tuneArea2.value = tuneArea.value;
      getTabIn();
    } else {      
      tuneFail();
      tuneArea.value = startTab.join("\n");      
    }
  }

  function tuneFail() {
    var msg = `<h2>Can't use strings   </h2><p>Must have a column of | or -

These examples are ok
if they match your tab

eb|  e-|   e|  e |   e-   |  -
Bb|  B-|   B|   B|  c#-   |  -
Gb|  G-|   G|  g |  a -   |  -
Db|  D-|   D|   D|   e-   |  -
Ab|  A-|   A|  a |   A-   |  -
Eb|  E-|  Eb|  Eb|   E-   |  -

Spa ces and CaPiTals are ok
</p>` + tuneArea.value;
    document.getElementById("message").innerHTML = msg;
    document.getElementById("msgdiv").style.display = "block";
    document.getElementById("msgdiv").focus();
  }

  function tuneKey() {
    if (event.key === "Enter") { //exit if enter
      event.preventDefault();
      tuneArea.blur();
      return;
    }
    if (event.key === "Delete" || event.key === "Del") event.preventDefault();   
    var where = tuneArea.selectionStart;
    if (where >= tabStrings * 4 - 1 &&
      event.key !== "ArrowUp" &&
      event.key !== "ArrowLeft" &&
      event.key !== "Up" &&
      event.key !== "Left") { //limit size
      event.preventDefault();
      return;
    }
    var pos = where % 4;
    var move = 0;
    if (event.key === "ArrowLeft" ||
        event.key === "Left" ||
        event.key === "Backspace") where -= 1; //left bksp     
    if (event.key === "Backspace") {
      event.preventDefault();
      move = -1;
    }     
    if (pos === 3 &&
        event.key !== "ArrowRight" &&
        event.key !== "Right" &&
        event.key !== "Left" &&
        event.key !== "Down" &&
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowDown") move = 1; //skip line ends     
    tuneArea.setSelectionRange(where + move, where + 1 + move); //overtype
  }

  function changeStrings() {
    if (foundSavedLyrics()) saveTextFile();
    const numberOfStrings = document.getElementById("numStrings");
    instrument = numberOfStrings.value;
    startTab = newStrings(instrument);
    if (document.getElementById("instr")) 
      document.getElementById("instr").innerHTML = " " + instrument.slice(2);
    tabStrings = startTab.length;
    tabArea.value = "|\n".repeat(tabStrings - 1) + "|";
    tuneArea.value = startTab.join("\n");
    tuneArea2.value = startTab.join("\n");    
    tuneArea.rows = tabStrings;
    showColors = 2;
    colorToggle();
    lines = tabArea.value.split("\n");
    if (showPitch) {
      pitchToggle();
      pitchShift = ["",0,0,0,0,0,0,0,0,0];
      pitchToggle();
    }
    else pitchShift = ["",0,0,0,0,0,0,0,0,0];
    lyricText = "";
    undoStack = [];
    redoStack = [];
    doStuff();
    tabArea.rows = tabStrings;
    tuneArea2.style.height = height2;
    tabArea2.style.height = height2;
    checkChange();
  }
  
  function locateLyricCursor() {
    cursorLyric = lyricArea.selectionStart;
    cursorSplit = (cursorLyric / lyricArea.value.length) * lyricArea.scrollWidth;
    cursorPlace = cursorSplit - lyricArea.scrollLeft;    
  }

  function lyricKeyDown() {
    locateLyricCursor();
    oldPlace = cursorPlace;
    if (event.key === "Enter") {
      event.preventDefault();
      insLyricBar();
    } 
    else if (event.key === " ") insLyric();
    else if (event.key === "ArrowLeft") leftLyricArrow();
    else if (event.key === "Left") leftLyricArrow();    
    else if (event.key === "ArrowRight") rightLyricArrow();
    else if (event.key === "Up") upLyricArrow();
    else if (event.key === "ArrowUp") upLyricArrow();
    else if (event.key === "Right") rightLyricArrow();
    else if (event.key === "Backspace") bkspLyric();
    else if (event.key === "End") endLyricKey();
    else if (event.key === "Home") homeLyricKey();
    else if (event.key === "Divide") insLyricBar();
    else if (event.key === "|") insLyricBar();    
    else if (event.key === "PageUp" || event.key === "Undo") {
      event.preventDefault();
      undoKey = true;
      undo();
    }
    else if (event.key === "PageDown" || event.key === "Redo") {
      event.preventDefault();
      undoKey = true;
      redo();
    }
    else if (event.key === "Escape" || event.key === "Esc") {
      event.preventDefault();
      document.getElementById("barMode").value = "Off"; 
      barMaster();      
    }
    else if (event.key === "Tab") {
      event.preventDefault();
      document.getElementById("barMode").value = "Tab"; 
      barMaster();      
    }
    else if (event.key === "Alt") {
      if (event.shiftKey) {
        event.preventDefault();
        document.getElementById("barMode").value = "Lyr"; 
        barMaster();        
      }      
    }
    else {
      insLyric()
    }
  }
  
  function upLyricArrow() { //switch to tab area
    navKey = true;
    setSelStart = lyricArea.selectionStart;
    setSelEnd = setSelStart;
    lyricArea.blur();
    tabArea.focus();
  }

  function lyricKeyUp(e) {
    if (navKey || undoKey) {
      navKey = false;
      undoKey = false;
      keepScrollPlace();
      return;
    }
    if (document.activeElement.id !== "LyricIn") return;
    if (e.key === "Shift" || e.key == "Control" ||
        e.key == "Escape" || e.key === "Alt") return;
    if (barFrom === "Tab") {
      lyricBarsFromTab();
    } 
    else if (barFrom === "Lyr") {
      tabBarsFromLyrics(trimTail(lyricArea.value));
    }
    else if (barFrom === "Off") {
      thisBarIns();
    }
  }

  function tabMouseUp() {
    event.stopPropagation();
    mouseDown = false;
    if (mouseDown2) {
      mouseDown2 = false;
      tab2MouseUp();
      return;
    }
    var trimLen;
    var where = tabArea.selectionStart;
    var there = tabArea.selectionEnd;
    var tabSplit = tabArea.value.split("\n");
    tabSplit[tabStrings - 1] = trimTail(tabSplit[tabStrings - 1]);
    trimLen = tabSplit.join("\n").length;
    if (where > trimLen) {
      where = trimLen;
      there = where;
    }
    lineLen = tabSplit[0].length + 1;
    var lineInt = Math.floor(where / lineLen);
    var pos1 = where % (lineLen);
    var pos2 = there % (lineLen);
    window.getSelection().collapse(null);
    tabArea.selectionStart = pos1 + lineInt * lineLen;
    tabArea.selectionEnd = pos2 + lineInt * lineLen;
    tabArea2.scrollTop = 0;
    noteSelect(pos1,pos2);
    if (where === there) 
      soundNewNote(tabArea.value.slice(where, where + 1),lineInt,where);
  }
  
  function tab2MouseUp() {
    event.stopPropagation();
    mouseDown = false;
    if (mouseDown1) {
      mouseDown1 = false;
      tabMouseUp();
      return;
    }    
    var trimLen;
    var where = tabArea2.selectionStart;
    var there = tabArea2.selectionEnd;
    var tabSplit = tabArea2.value.split("\n");
    tabSplit[tabStrings - 1] = trimTail(tabSplit[tabStrings - 1]);
    trimLen = tabSplit.join("\n").length;
    if (where > trimLen) {
      where = trimLen;
      there = where;
    }
    lineLen = tabSplit[0].length + 1;
    var lineInt = Math.floor(where / lineLen);
    var pos1 = where % (lineLen);
    var pos2 = there % (lineLen);
    tabArea.focus();
    window.getSelection().collapse(null);    
    tabArea.selectionStart = pos1 + lineInt * lineLen;
    tabArea.selectionEnd = pos2 + lineInt * lineLen;
    tabArea2.focus();
    tabArea2.selectionStart = pos1 + lineInt * lineLen;
    tabArea2.selectionEnd = pos2 + lineInt * lineLen;
    tabArea2.scrollTop = 0;
    noteSelect(pos1,pos2);
    if (where === there) 
      soundNewNote(tabArea.value.slice(where, where + 1),lineInt,where);
  }
  
  function barMouseDown() {
    window.getSelection().collapse(null); //clear previous to prevent drag 
  }  
  
  function barMouseUp() {
    var sel = window.getSelection();
    var r = sel.getRangeAt(0);
    tabArea.setSelectionRange(r.startOffset, r.endOffset);
    noteSelect(r.startOffset, r.endOffset);
    lyricArea.scrollLeft = barNumb.scrollLeft;
    window.getSelection().collapse(null);
  }

  function lyricMouseUp() {
    event.stopPropagation();
    var trimLen = trimTail(lyricArea.value).length;
    var where = lyricArea.selectionStart;
    var there = lyricArea.selectionEnd;
    window.getSelection().collapse(null);    
    if ((where > trimLen) || (there > trimLen)) {
      where = trimLen;
      there = trimLen;
    }
    lyricArea.setSelectionRange(where, there);
    noteSelect(where,there);
  }
  
  function lyricFocus() {
    if (tabArea.value.split("\n").length < 3) {
      locateTabCursor();
      document.getElementById("barMode").value = "Lyr"; 
      barMaster(); //auto lyric mode
      return;
    }     
    if (barFrom === "Lyr") {
      event.target.style.color = "blue";
      event.target.style.background = 'white';
    } else if (barFrom === "Tab") {     
      event.target.style.background = 'white';
      event.target.style.color = 'black';
    }
    else if (barFrom === "Off") {     
      event.target.style.background = 'white';
      event.target.style.color = 'green';
    }
  }

  function lyricBlur() {
    lastBlur = "lyric";
    if (barFrom === "Lyr") {
      event.target.style.color = "blue";
      event.target.style.background = "#b6c7ff";
    } else if (barFrom === "Tab") {
      event.target.style.background = '#e8e8e8';
      event.target.style.color = '#404040';
    }
    else if (barFrom === "Off") {     
      event.target.style.background = '#b6ffc7';
      event.target.style.color = '#004000';
    }    
  }

  function tabFocus() {
    if (barFrom === "Lyr") {
      tabBack.style.color = "blue";
      tabBack.style.background = "white";
    } else if (barFrom === "Tab") {      
      tabBack.style.background = 'white';
      tabBack.style.color = 'black';
    }
    else if (barFrom === "Off") {     
      tabBack.style.background = 'white';
      tabBack.style.color = 'green';
    }    
  }

  function tabBlur() {
    lastBlur = "tab";
    if (barFrom === "Lyr") {
      tabArea.style.color = "blue";
      tabBack.style.background = "#b6c7ff";
    } else if (barFrom === "Tab") {
      tabBack.style.background = '#e8e8e8';
      showColors === 0 ? tabArea.style.color = '#fff' : tabArea.style.color = '#000';
    }
    else if (barFrom === "Off") {     
      tabBack.style.background = '#b6ffc7';
      tabArea.style.color = '#004000';
    }    
  }
  
  function tab2Blur() {
    lastBlur = "tab2";
    cursorWhere2 = tabArea2.selectionStart;
    if (barFrom === "Lyr") {
      tabArea.style.color = "blue";
      tabBack.style.background = "#b6c7ff";
    } else if (barFrom === "Tab") {
      tabBack.style.background = '#e8e8e8';
      tabArea.style.color = '#fff';
    }
    else if (barFrom === "Off") {     
      tabBack.style.background = '#b6ffc7';
      tabArea.style.color = '#004000';
    }    
  }
  
  function partClick() {
    keepSections ? keepSections = false :  keepSections = true;
    var addClass;
    addClass = document.getElementById("kParts");
    if (keepSections) addClass.setAttribute("class", "toggle black");
    else addClass.setAttribute("class", "toggle off");    
    checkChange();
  }
  
  function barClick() {
    keepMeasures ? keepMeasures = false : keepMeasures = true;
    var addClass;
    addClass = document.getElementById("kMeasures");
    if (keepMeasures) addClass.setAttribute("class", "toggle black");
    else addClass.setAttribute("class", "toggle off");    
    checkChange();
  }
  
  function dashClick() {
    keepSpaces ? keepSpaces = false : keepSpaces = true;
    var addClass;
    addClass = document.getElementById("kSpaces");
    if (keepSpaces) addClass.setAttribute("class", "toggle black");
    else addClass.setAttribute("class", "toggle off");    
    checkChange();
  }
  
  function tunePaste() {
    var i = 0, j;
    event.preventDefault();
    var newTune = [];
    var paste = (event.clipboardData || window.clipboardData).getData("text");
    paste = paste.split("\n");
    for (j = 0; j < tabStrings * 2 + 2; j++) {
      if (paste[j] && paste[j].trim().length > 0) {
        newTune[i] = paste[j].slice(0,3);
        i++;
        if (i > tabStrings - 1) break;
      }
      
    }
    tuneArea.value = newTune.join("\n");
    tuneBlur();
  }  
  
  function docKey() {
    locateTabCursor();
    setSelStart = cursorWhere;
    setSelEnd = cursorWhere; 
    if (event.key === "Escape" || event.key === "Esc") {
      event.preventDefault();
      document.getElementById("barMode").value = "Off"; 
      barMaster();      
    }
    else if (event.key === "F1") {
      event.preventDefault();      
      help();
    }
    else if (event.key === "Tab") {
      event.preventDefault();
      document.getElementById("barMode").value = "Tab"; 
      barMaster();      
    }
    else if (event.key === "Alt") {
      if (event.shiftKey) {
        event.preventDefault();
        document.getElementById("barMode").value = "Lyr"; 
        barMaster();        
      }      
    }
    else if (event.key === "y" && event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();      
        undoKey = true;        
        redo();   
    }    
    else if (event.key === "z" && event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();      
        undoKey = true;        
        undo(); 
    }
    else if (event.key === "PageDown" || event.key === "Redo") {
        event.preventDefault();
        event.stopPropagation();
        undoKey = true;        
        redo(); 
    }
    else if (event.key === "PageUp" || event.key === "Undo") {
        event.preventDefault();
        event.stopPropagation();
        undoKey = true;        
        undo(); 
    }
    else if (event.key === " ") {
        paused = true; //stop play if running
    }    
  }
  
  function docKeyUp() {
    if (oType) {//nothing to do for overtype keys
      event.stopPropagation();
      oType = false;
      return;
    }
    if (!(event.key === "Shift" || event.key === "Control" || event.key === "Alt" || event.key === "Escape")) return;
    setSelStart = cursorWhere;
    setSelEnd = setSelStart;
    keepScrollPlace();
  }
  
  function debugToggle() {
    var d = document.getElementById("showdebugs");
    var e = document.getElementById("debugtimes");
    d.className.includes("off") ? d.setAttribute("class","black")
     : d.setAttribute("class","off");
    d.className.includes("off") ? e.style.display = "block" : e.style.display = "none";
   }
  
  function docMouseUp(){
    if (document.activeElement.id === "TabIn" || document.activeElement.id === "TabIn2")
      window.getSelection().collapse(null);
  }
  
  function nextBar() {   
    var m;
    for (var i = 0; i < measureFirsts.length; i++) {
      m = measureFirsts[i] - 3;
      if (m > selStart) {
        noteSelect(m, m);
        break;
      }
    }
  }
  
  function prevBar() {   
    var m;
    for (var i = 0; i < measureFirsts.length; i++) {
      m = measureFirsts[measureFirsts.length - i - 1] - 3;
      if (m < selStart) {
        noteSelect(m, m);
        break;
      }
    }
  }
  
  function gotoShow() {
    document.getElementById("gotoDiv").style.display = "block";
  }
  
  function gotoClose() {
    document.getElementById("gotoDiv").style.display = "none";
  }
    
  function gotoBar() {
    var n = document.getElementById("barnumber").value;
    var m = n;
    if (m > measureFirsts.length) m = measureFirsts.length;
    if (m < 0) m = 0;
    noteSelect(measureFirsts[m - 1] - 3,measureFirsts[m - 1] - 3);
    loop = false;
    document.getElementById("loopbtn").setAttribute("class", "transport black");    
  }
  
  function gotoEnd() {
    paused = true;
    loop = false;
    document.getElementById("loopbtn").setAttribute("class", "transport black");    
    noteSelect(ctNotePos[ctNotePos.length - 1],ctNotePos[ctNotePos.length - 1]);
  }
  
  function collectData(){
    var split = [], cpy = [], tabString, whatString = tabTitle.innerText, appData = {}, lyricString;
    var tempo = document.getElementById("tempo");
    split = tabArea.value.split("\n");
    if (split[0][0] === "|") var sectStart = true; //don't save first bar line, add back on open
    for (var i = 0; i < tabStrings; i++) {
      if (sectStart) split[i] = split[i].slice(1);
      cpy[i] = startTab[i] + trimTail(split[i] || "");
    }
    tabString = cpy.join("\n");
    if (editInstr) instrumentName = editInstr;
    else instrumentName = document.getElementById("numStrings").value.slice(2);
    appData.instrument = instrumentName;
    appData.in = document.getElementById("numStrings").selectedIndex;
    appData.tuning = tuneArea.value.split("\n");
    appData.preset = document.getElementById("pretune").selectedIndex;
    appData.tempo = tempo.value;
    appData.capo = capoShift;
    appData.pitches = pitchShift;
    appData.metronome = metronome;
    appData.edit = showEditButton;
    appData.playfrom = tabArea.selectionStart;
    if (!sectStart) appData.playfrom += 1;//adjust if bar line removed
    appData.sfsource = document.getElementById("sfont").selectedIndex;
    appData.soundfont = document.getElementById("instrsf").selectedIndex;
    appData.barmode = document.getElementById("barMode").selectedIndex;
    appData.lspace = lyricLtrSpace;
    appData.sects = keepSections;
    appData.bars = keepMeasures;
    appData.dash = keepSpaces;
    appData.note = showNotes;
    appData.color = showColors;
    if (barFrom === "Tab") lyricString = lyricText.replace(/\|/g,"");
    else lyricString = lyricText;
    return [whatString,tabString,appData,lyricString];
  }
  
  function useJson(j) {
    instrumentName = j.instrument;
    editInstr = instrumentName;
    document.getElementById("numStrings").selectedIndex = j.in;
    changeStrings();
    tuneArea.value = j.tuning.join("\n");
    tabStrings = j.tuning.length;
    tuneBlur();
    document.getElementById("pretune").selectedIndex = j.preset;
    document.getElementById("tempo").value = j.tempo;
    tempos[0] = [0,document.getElementById("tempo").value];
    secsPerBeat = 60 / document.getElementById("tempo").value;
    document.getElementById("capo").value = j.capo;
    capoChange();
    pitchShift = j.pitches;
    writePitches(pitchShift);
    metronome = !j.metronome;  
    metroToggle();
    showEditButton = !j.edit;
    editClick();
    nP = j.playfrom;
    setSelStart = nP;
    noteSelect(nP,nP);
    document.getElementById("sfont").selectedIndex = j.sfsource;
    document.getElementById("instrsf").selectedIndex = j.soundfont;
    changeSFfamily();
    if (sfChoice != "") changeSFInstrument();
    document.getElementById("barMode").selectedIndex = j.barmode;
    lyricLtrSpace = j.lspace;
    keepSections = !j.sects; partClick();
    keepMeasures = !j.bars; barClick();
    keepSpaces = !j.dash; dashClick();
    showNotes = !j.note; noteToggle();
    showColors = j.color -= 1; colorToggle();
  }
  
  function useLink(){
    var linkOk = true;
    var s = location.search.slice(1).split("=");
    var params = (new URL(window.location)).searchParams;    
    if (s[0] === "clink") {
      var clink = decodeURIComponent(params.get('clink'));
      var soup = params.get('soup').replace(/ /g, "+");
    }
    else {
      clink = decodeURIComponent(s[0]);
      soup = "";
      if (s[1]) soup = s[1].split("&")[0];
    }
    if (s[0].length < 2) return;
    var q = "";
    try {
      q = decodeCLink(soup);
    } catch (e){
      alert(clink + "\n\nsomething went wrong, the link is broken.\n\n" + e);
      linkOk = false;
    }
    if (linkOk) parseFile(q);
  }
  
  function shareDialog() {
    clink.text = "";
    makeButton.innerHTML = "Make CLink";
    makeButton.disabled = false;
    makeButton.style.color = '#ffffff';
    document.getElementById("clinkdone").innerHTML = "";
    document.getElementById("clinktext").innerHTML = "";    
    var data = collectData();
    var text = data[0] + ":\n\n" + data[1] + "\n\n" + JSON.stringify(data[2]) + "\n\nLyrics:\n" +  data[3];
    saveName = document.getElementById("filename");
    saveName.value = tabTitle.innerText;
    var theLink = new URL("https://colortab.org/ColorTabApp.html");
    theLink.search = "clink=" + encodeURIComponent(data[0]) + "&soup=" + encodeCLink(text);
    getTiny = new Request('https://tinyurl.com/api-create.php?url=' + theLink.href);
    document.getElementById("saveoptions").style.display = 'block';
    playPrep();
    makeMidi();
  }
  
  function shareDone() {
    document.getElementById("saveoptions").style.display = 'none';
  }
   
  function encodeCLink(s) {// btoa(toByte(LZWenc(toByte(s))))
    var codeUnits = new Uint16Array(s.length);
    for (let i = 0; i < codeUnits.length; i++) {
      codeUnits[i] = s.charCodeAt(i);
    }
    s = String.fromCharCode(...new Uint8Array(codeUnits.buffer));    
    var dict = {},data = (s + "").split(""), out = [], currChar, phrase = data[0], code = 256;
    for (var i = 1; i < data.length; i++) {
      currChar = data[i];
      if (dict[phrase + currChar] != null) phrase += currChar;
      else {
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        dict[phrase + currChar] = code;
        code++;
        phrase=currChar;
      }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (i = 0; i < out.length; i++) {out[i] = String.fromCharCode(out[i]);}
    var bin = out.join("");
    codeUnits = new Uint16Array(bin.length);
    for (let i = 0; i < codeUnits.length; i++) {
      codeUnits[i] = bin.charCodeAt(i);
    }
    return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)));    
  }

  function decodeCLink(s) {//fromByte(LZWdec(fromByte(atob(s))))
    var bin = atob(s);
    var bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    s = String.fromCharCode(...new Uint16Array(bytes.buffer));    
    var dict = {}, data = (s + "").split(""), currChar = data[0], oldPhrase = currChar, out = [currChar], code = 256, phrase;
    for (var i = 1; i < data.length; i++) {
      var currCode = data[i].charCodeAt(0);
      if (currCode < 256) phrase = data[i];
      else phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
      out.push(phrase);
      currChar = phrase.charAt(0);
      dict[code] = oldPhrase + currChar;
      code++;
      oldPhrase = phrase;
    }
    bin = out.join("");
    bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return String.fromCharCode(...new Uint16Array(bytes.buffer));
  }
   
  function makeCLink(){
    if (makeButton.innerHTML === "Copy CLink") {
      copyLink();
      return;
    }
    else {
      makeButton.disabled = true;
      makeButton.innerHTML = "please wait";
      fetch(getTiny).then(response => response.text())
        .then(tinylink => {
        document.getElementById("clinktext").innerHTML = tinylink;
        clink.text = "Open CLink to bookmark";
        clink.href = tinylink;});
        makeButton.innerHTML = "Copy CLink";
        makeButton.disabled = false;
        makeButton.style.color = '#00ff00';
    }
  }
    
  function copyLink() {
    document.addEventListener('copy', function(e) {
      e.clipboardData.setData('text/plain', clink.href);
      e.preventDefault();
    }, true);
    document.execCommand('copy');
    document.getElementById("clinkdone").innerHTML = "CLink is ready to paste" 
  }  
  
  function addEvents() {
    window.addEventListener('beforeunload', function (e) {
      if (undoCount < 2 || !showEditButton) return;
      e.preventDefault();
      e.returnValue = '';
    });
    document.querySelector("div[contenteditable]").addEventListener("paste", function(e) {
        e.preventDefault();
        var text = e.clipboardData.getData("text/plain");
        var temp = document.createElement("div");
        temp.innerHTML = text;
        document.execCommand("insertHTML", false, temp.textContent);
    });    
    makeButton.onclick = makeCLink;
    document.getElementById("sharebutton").onclick = shareDialog;
    document.getElementById("sharedone").onclick = shareDone;    
    document.addEventListener("mouseup",docMouseUp);
    var debugbutton = document.getElementById("showdebugs");
    if (debugbutton) debugbutton.addEventListener("click", debugToggle);
    document.getElementById("fwdbutton").onclick = nextBar;
    document.getElementById("revbutton").onclick = prevBar;
    document.getElementById("gotoM").onclick = gotoShow;
    document.getElementById("gonow").onclick = gotoBar;    
    document.getElementById("nogo").onclick = gotoClose;
    document.getElementById("gotoend").onclick = gotoEnd;
    document.getElementById("pitchstrum").onclick = strum;
    document.getElementById("pitchclose").onclick = closepitch;
    document.getElementById("pretune").onchange = shiftTune;
    var table = document.getElementById("tnotes");
    for (var i = 0; i < table.rows.length; i++) {
      for (var j = 0; j < table.rows[i].cells.length; j++)
      table.rows[i].cells[j].onclick = function () {tableText(this);};
    } ;//add events
    for (i = 1; i < 10; i++) {
      ptable.rows[i].cells[2].onclick = function () {readPitches();};
    }
    document.getElementById("capo").onchange = capoChange;
    document.getElementById("metro").onclick = metroToggle;

    document.addEventListener("keydown", docKey, true); //use capture 
    document.addEventListener("keyup", docKeyUp); //use capture
    tuneArea.addEventListener("keydown", tuneKey);
    tuneArea.addEventListener("focus", tuneFocus);
    tuneArea2.addEventListener("focus", tuneFocus);
    tuneArea.addEventListener("blur", tuneBlur);    
    tuneArea.addEventListener("paste", tunePaste);
    lyricArea.addEventListener("paste", pasteLyrics);
    lyricArea.addEventListener("keydown", lyricKeyDown);
    lyricArea.addEventListener("keyup", lyricKeyUp);
    lyricArea.addEventListener('focus', lyricFocus);
    lyricArea.addEventListener('blur', lyricBlur);
    lyricArea.addEventListener("mouseup", lyricMouseUp);    
    lyricArea.onscroll = linkScroll;
    lyricArea.addEventListener("wheel", scrollHorizontally);    
    lyricArea.addEventListener("dragover", function(e) {
      e.preventDefault();
    });
    lyricArea.addEventListener("dragstart", function(e) {
      e.preventDefault();
    });
    document.getElementById("menuTog").onclick = menuToggle;
    document.getElementById("pitchbutton").onclick = pitchToggle;
    document.getElementById("editButton").onclick = editClick;    
    document.getElementById("cutButton").onclick = cutTab;
    document.getElementById("copyButton").onclick = copyTab;
    document.getElementById("addButton").onclick = addTab;
    document.getElementById("noteButton").onclick = noteToggle;
    document.getElementById("colorButton").onclick = colorToggle;    
    document.getElementById("codaButton").onclick = tableToggle;    
    document.getElementById("moreSpace").onclick = spread;
    document.getElementById("lessSpace").onclick = squeeze;
    document.getElementById("helpButton").onclick = help;
    //document.getElementById("helpText").onclick = help;
    document.getElementById("bck").onclick = undo;
    document.getElementById("fwd").onclick = redo;
    document.getElementById("savFile").onclick = saveFile;
    document.getElementById("helpdownload").onclick = saveFile;    
    document.getElementById("savtxt").onclick = saveTextFile;
    document.getElementById("numStrings").onchange = changeStrings;
    document.getElementById("barMode").onchange = barMaster;
    tabTitle.onchange = noDownlink;
    document.getElementById("kSpaces").onclick = dashClick;
    document.getElementById("kParts").onclick = partClick;
    document.getElementById("kMeasures").onclick = barClick;
    document.getElementById("chooseFile").onchange = openFile;
    window.addEventListener("resize", prepThrottle);   
    window.addEventListener("dragover", function(e) {
      e.preventDefault();
    }, false);
    window.addEventListener("drop", function(e) {
      e.preventDefault();
    }, false);
    tabArea.addEventListener('keydown', keyDownHandler);
    tabArea2.addEventListener('keydown', keyDown2);    
    tabArea.addEventListener('input', inputHandler);
    tabArea.addEventListener('keyup', keyUpHandler);
    tabArea2.addEventListener('keyup', keyUpHandler);    
    tabArea.addEventListener("paste", pasteTab);
    tabArea2.addEventListener("paste", pasteTab);
    tabArea.ondrop = dropFile;
    tabArea.addEventListener("dragover", function(e) {
      e.preventDefault();
    });
    tabArea2.addEventListener("dragover", function(e) {
      e.preventDefault();
    });    
    tabArea.addEventListener("dragstart", function(e) {
      e.preventDefault();
    });
    tabArea.addEventListener("mouseup", tabMouseUp);
    tabArea.addEventListener("mousedown", tabMouseDown);
    tabArea2.addEventListener("mouseup", tab2MouseUp);
    tabArea2.addEventListener("mousedown", tab2MouseDown,true);
    barNumb.addEventListener("mousedown", barMouseDown);
    barNumb.addEventListener("mouseup", barMouseUp);
    ctabOut.addEventListener("mouseup", ctMouseUp);
    tabArea.addEventListener('focus', tabFocus);
    tabArea2.addEventListener('focus', tabFocus);    
    tabArea.addEventListener('blur', tabBlur);
    tabArea2.addEventListener('blur', tab2Blur);    
    tabArea.onscroll = linkScroll;
    tabArea2.onscroll = linkScroll;
    //************barNumb.onscroll = linkScroll;
    tabArea.addEventListener("wheel", scrollHorizontally);
    tabArea2.addEventListener("wheel", scrollHorizontally);    
    document.getElementById("msgdiv").onclick = noModal;
    document.getElementById("msgdiv").onkeypress = noModal;
    barNumb.onscroll = barNumbScroll;
    var loopBtn = document.getElementById("loopbtn");
    soundfont = new Soundfont(ctx);
    var soundfont2 = new Soundfont(ctx);    
    document.getElementById("instrsf").setAttribute("disabled", true);
    soundFontInstrument = soundfont.instrument(instChoice);
    var metroInst = soundfont2.instrument("offline"); 
    let playTimer;//poll doneYet during play
    var lookahead = 25.0;//ms until next lookahead
    var scheduleAheadTime = 0.1;//window of note to schedule in seconds
    document.getElementById("instrsf").addEventListener("change", changeSFInstrument);
    document.getElementById("sfont").addEventListener("change", changeSFfamily);
    
    loopBtn.addEventListener('click', () => {
      if (loop) {
        loop = false;
        loopBtn.setAttribute("class", "transport black");
        playPrep();
        noteSelect(selStart,selStart);        
      }
      else {       
        loop = true;
        playPrep();//disable repeat unroll
        loopBtn.setAttribute("class", "transport off");
        tabMouseUp();
      }
    });
    
    document.getElementById("notePlay").addEventListener("click",playSingle);
    
    function playSingle() {
      ctx.resume();
      if (singleThing.length === 2) {
        soundFontInstrument.play(singleThing[0],ctx.currentTime,{ duration:0.5});
        soundFontInstrument.play(singleThing[1],ctx.currentTime,{ duration:0.5});
      }
      else soundFontInstrument.play(singleThing,ctx.currentTime,{ duration:0.5});
      setTimeout(waitDone,600);     
    }
    
    function schedulePlay() {
      var pitch, playClassIs, tooLate;   
      while (nextNoteTime <  ctx.currentTime + scheduleAheadTime ) {
        if (!playThings[nP]) {//stop on undefined
          nextNoteTime = Infinity; 
          nP = Infinity;
          if (loop) {
            loop = false;
            loopBtn.innerHTML = "&#xeb23;"
            loopBtn.style.backgroundColor = "#ddd";
          }
          continue;
        }         
        pitch = (playThings[nP][0].toString()).split(",");
        tooLate = ctx.currentTime - scheduleAheadTime - nextNoteTime;
        //console.log(["schedule", nP,playThings[nP][1],  nextNoteTime,tooLate, playEnd])
        if (tooLate < 0) {
          if (pitch[0] === "101" || pitch[0] === "102") {
            metroInst.play(pitch,nextNoteTime,{ duration:playThings[nP][2], gain:3});
          } else { 
            if (sfReady) {
              if (pitch.length === 2) {
                  soundFontInstrument.play(pitch[0],nextNoteTime,{ duration:playThings[nP][2]});
                  soundFontInstrument.play(pitch[1],nextNoteTime,{ duration:playThings[nP][2]});
                }
              else soundFontInstrument.play(pitch,nextNoteTime,{ duration:playThings[nP][2], gain:3});
            }
            else {//offline fallback
              if (pitch.length === 2) {
                  metroInst.play(pitch[0],nextNoteTime,{ duration:playThings[nP][2]});
                  metroInst.play(pitch[1],nextNoteTime,{ duration:playThings[nP][2]});
                }
              else metroInst.play(pitch,nextNoteTime,{ duration:playThings[nP][2], gain:3});
            }
          }
        }
        if (playThings[nP][3]) { 
          playClassIs = document.getElementById(playThings[nP][3]);
          if (playClassIs) {
            var noteClass = playClassIs.className;
            if (noteClass.indexOf(" p") > -1) playClassIs.className = noteClass.replace(" p"," r");
            else if (noteClass.indexOf(" r") > -1) playClassIs.className = noteClass.replace(" r"," p");
            else playClassIs.className += " p";//highligh pos
          }
        }
        if (playThings[nP][4]) {
          checkTempo(playThings[nP][4]);
          playCursor(playThings[nP][4],playThings[nP][4]);
          newScroll(playThings[nP][4]);
          var scrollOptions = {left:0, top:0, behavior:"auto"}
          var pid = document.getElementById(playThings[nP][3])
          if (pid) var pty = pid.getBoundingClientRect().y;
          if (pty) {
            if (pty + 100 > window.innerHeight) {//down too far
              if (pty > window.innerHeight) {//more than a little
                scrollOptions["top"] = window.scrollY + pty - window.innerHeight / 2;
                scrollOptions["behavior"] = "auto";
              }
              else scrollOptions = 
                {left: 0, top: window.scrollY + 100, behavior: 'smooth'}
              window.scrollTo(scrollOptions)
            }//keep scroll above bottom during play
            if (pty < 0) {
              scrollOptions["top"] = window.scrollY + pty - window.innerHeight / 2;
              scrollOptions["behavior"] = "auto";
              window.scrollTo(scrollOptions)
            }//keep new highlights on screen below top
          }
        }
        lastTime = startTime + playThings[nP][1] + playThings[nP][2];
        nP++;
        if (nP < playEnd) {
          nextNoteTime = playThings[nP][1] + startTime - pauseTime;
        }
        else nextNoteTime = Infinity;       
      }
    }; //schedule play   
    
    function doneYet() {// stops at end or loops
      if (nP >= playEnd || paused) {
        if (loop && !paused && songLength !== 0) {
          barsHidden = 0;
          partsHidden = 0;
          prepCt();//clear highlights
          noteSelect(selStart,selEnd);
          nP = playStart;
          if (playThings[nP]) pauseTime = playThings[nP][1];
          nextNoteTime = lastTime - pauseTime;
          startTime = nextNoteTime;
         lyricArea.scrollLeft = 0;//************** //console.log(["loop","next",nextNoteTime,"start",startTime,"pause",pauseTime])
        }
        else { //stop
          clearInterval(playTimer);
          if (playThings[nP - 1]) //wait for last note to complete
            setTimeout(waitDone,1000 * (playThings[nP - 1][2] + scheduleAheadTime)) 
          else waitDone();//catch undefined note error
          if (nP >= playEnd) {
            playPrep();//********why?new notes?
            //noteSelect(selStart,selEnd);
          }
        }
      }
      if (nP < songLength) schedulePlay();//not done!
      //console.log("not done!",nP,songLength,nextNoteTime)
    }
    
    function waitDone() {
      ctx.suspend();
      paused = true;
      playButton.innerHTML = "&#xeb1c;";
      playButton.style.background = "#000";
      noteSelect(selStart,selEnd);
      prepCt();
      window.scrollTo(0,0);
      //console.log(["done!",paused,ctx.currentTime])      
    }

    playButton.addEventListener('click', () => {
      if (!playThings[0]) return;
      showTable = 2;
      tableToggle();//hide it
      if (!(ctx.state === 'running')) {//play
        showButtons = true;
        menuToggle();//hide buttons for play
        paused = false;
        ctx.resume().then(function(){
          if (nP === undefined || nP >= songLength) {
            nP = 0;
            pauseTime = 0;
          }
          prepCt();
          if (playThings[nP]) pauseTime = playThings[nP][1];
          startTime = ctx.currentTime;
          nextNoteTime = startTime;
          schedulePlay();
          playTimer = setInterval(doneYet, lookahead);
          playButton.innerHTML = "&#xeb1e;";
          playButton.style.background = "#444";
        })
      }
      else { //pause
        paused = true;//done!!
        playButton.focus();//restart with spacebar
        if (playThings[nP]) pauseTime = playThings[nP][1];// time of next note
        playButton.innerHTML = "&#xeb1c;";
        playButton.style.background = "#444";
      }
      //console.log("playbutton",paused,nP,playStart,startTime,pauseTime)
    });

    document.getElementById("rewind").addEventListener('click', () => {
        nP = 0;
        window.scrollTo(0,0);
        //startTime = lastTime;//**************?
        startTime = ctx.currentTime;
        loop = false;
        barsHidden = 0;
        partsHidden = 0;
        loopBtn.setAttribute("class", "transport black");      
        if (playThings[0]) nextNoteTime = playThings[0][1] + startTime;
        noteSelect(0,0);
      });

  } //event listeners
  
  function changeSFInstrument() {
      var sfChoose = document.getElementById("sfont");
      instChoice = document.getElementById("instrsf").value;
      instChoice === "offline" ? sfChoice = "" : sfChoice = sfChoose.value;
      playButton.setAttribute("disabled", true);
      sfReady = false;
      soundFontInstrument = soundfont.instrument(sfChoice + instChoice);
      soundFontInstrument.onready(function() {
        playButton.removeAttribute("disabled");
        sfReady = true;
      });
    }
  
  function changeSFfamily() {
      var instName = document.getElementById("instrsf");
      sfChoice = document.getElementById("sfont").value;
      if (sfChoice === "Offline") {
        sfChoice = "";     
        instChoice = "offline";
        instName.selectedIndex = 0;
        instName.setAttribute("disabled", true);
      }
      else {
        sfReady = false;
        instChoice = instName.value;
        instName.removeAttribute("disabled");
      }
      playButton.setAttribute("disabled", true);
      soundFontInstrument = soundfont.instrument(sfChoice + instChoice);
      soundFontInstrument.onready(function() {
        playButton.removeAttribute("disabled");
        sfReady = true;
      });
    }  
  
  function noteSelect(p1,p2){
    if (p2 === p1 + 1) p2 = p1;    
    if (loop && !paused && p1 === p2) return;
    if (paused && p1 === p2){
      loop = false;
      document.getElementById("loopbtn").setAttribute("class", "transport black");
    }
    if (paused && p1 != p2) {
      loop = true;
      document.getElementById("loopbtn").setAttribute("class", "transport off");
      playPrep();
    }
    selStart = p1;
    selEnd = p2;
    var p;
    var more = true;//find chord and last ids
    playStart = null;
    //always find one match for play pos, then look for more in range for loop
    clearCtSel();//clear classes
    for (var i = 0;i < songLength;i++){//find first match
      if (playThings[i][4] && p1 - 1 < playThings[i][4]) {
        p = playThings[i][3].slice(1);//get cT[i] from id
        if (cT[p]) cT[p][Typ] += " s";//highlight with s class
        playStart = i;        
        while (more) {
          if (playThings[i + 1] && playThings[i + 1][4] === playThings[i][4]) {
            p = playThings[i + 1][3].slice(1);//chord
            if (cT[p]) cT[p][Typ] += " s";            
            i++;
          }
          else more = false;
        }
        break;
      }      
    }
    if (p2 > p1) {
      for (i = playStart;i < songLength;i++){
        if (playThings[i] && playThings[i][4] && p2 > playThings[i][4]) {         
          p = playThings[i][3].slice(1);
          if (cT[p]) cT[p][Typ] += " s";
          playEnd = i + 1;
        }
      }
    }
    else playEnd = songLength;
    if (playStart === null) playStart = 0;    
    nP = playStart;
    prepCt();//update html    
    playCursor(selStart,selEnd);
    newScroll(selStart);
    checkTempo(selStart);
    if (!paused && !loop) {
      pauseTime = playThings[nP][1];//jump to new note and continue play
      startTime = nextNoteTime;
    }
 //console.log("nsel","selStart",selStart,"selEnd",selEnd,"nP",nP,"playStart",playStart,"playEnd",playEnd,"songLength",songLength)
  }; //noteselect 
  
  function playCursor(s,e) {//show cursor in barnums and add red/blue for bad sums
    selStart = s;//keep global current
    selEnd = e;
    var barText = barNumb.textContent;//get text to strip spans
    barText = barText.replace(/[\*]/g," ").split("");
    for (var i = 0; i < barText.length; i++) {
      if (i >= s && i < e && /[^\d]/.test(barText[i])) {
        barText[i] = "*";
      }
      if (s === e && /[^\d]/.test(barText[s])) barText[s] = "";
      if (s === e && /[\d]/.test(barText[s])) {//avoid digit overwrite
        var m = 1, n = true;
        while (m < 4 && n) {
          if (/[\d]/.test(barText[s + m])) m++;
          else {
            barText[s + m] = "";
            n = false;
          }
        }
        m = 1, n = true;
        while (m < 4 && n) {
          if (/[\d]/.test(barText[s - m])) m--;
          else {
            barText[s - m] = "";
            n = false;
          }
        }
      }
    }
    var barJ = barText.join("");//.padEnd(lyricText.length," ");
    var bars = "";
    m = -1;
    var mHot = false;//measure too long
    var mCool = false;//measure short
    var mBegin = false;//measure begins
    if (!lyricText) lyricText = "";
    for (i = 0; i < lyricText.length; i++) {//for each char
      mBegin = false;
      if (lyricText[i] === "|" && lyricText[i + 1] !== "|") {
        mBegin = true;
        if (mHot || mCool) {//end highlight
          bars +=  "</span>";
        }
        m++;//next measure
      }
      else if (i === 0 && lyricText[i] !== "|") {
        mBegin = true;
        m++;//first measure begins without |       
      }
      if (mBegin && rolledSums[m] !== undefined) {
        mHot = rolledSums[m].toPrecision(5) > timesigBeats[m] ? true : false;
        mCool = rolledSums[m].toPrecision(5) < timesigBeats[m] ? true : false;
        if (mHot) bars += "<span class ='redbar'>";
        if (mCool) bars += "<span class ='bluebar'>";
      }     
      bars += barJ[i];//always          
    }    
    if (mHot || mCool) bars += "</span>" + barJ.slice(i);
    else bars += barJ.slice(i);
    barNumb.innerHTML = bars;// + extendTail;
  };//playcursor hot cold
  
  function newScroll(c) { //keep cursor on screen
    var cpix = c * charWidth;
    var sl = lyricArea.scrollLeft;
    var cw = tabArea.clientWidth;
    var cwm = 0.5 * cw;
    var okl = 0.1 * cw;
    var okr = 0.9 * cw;
    var okrl = 0.66 *cw;
    if (paused && ((cpix < sl + okl) || (cpix > sl + okr))) 
      lyricArea.scrollLeft = cpix - cwm; //center after noteselct
    if (!paused && ((cpix < sl + okl) || (cpix > sl + okrl))) 
      lyricArea.scrollLeft = cpix - okrl; //scroll at 2/3 cw during play
  }

  function playPrep() {//gather notes and times for playback
    var playNotes = [], playDurations = [], playWaits = [], playTimes = [],  playRings = [],ctNoteIds = [], m = -1;    
    var i, k = -1, n, s, first = false, quarter = false, rest = false, triplet = 0, tied = false, dots = 0, ddots = 0, stringSum, chordSum = 0, newNotes = 0, strNotes, strPos, down = false, mbeats = 4, measureNotes = [], noteMeasureNums = [];
    var defaultWait = 1;
    var addDuration = 0;
    var chordBegin = true;//first chord duration sets default
    var fretsDebug = [], stringsDebug = [];
    /* k increments the notes to play */
    defaultTempo = true;//unless newtempo
    timesigBeats = [];
    measureNotes = [];//count notes for metronome measure avg
    measureFirsts = [];
    tempos = [];
    tempos[0] = [0, document.getElementById("tempo").value];
    for (i = 0; i < Object.keys(cT).length; i++) {//each cT item
      if (cT[i][Typ].slice(0,1) === 'b' &&
          cT[i + 1] && cT[i + 1][Typ].slice(0,1) !== "b" ) {
        if (m > -1) timesigBeats[m] = mbeats;//start with default 4
        m++;
        measureNotes[m] = 0;
        measureFirsts[m] = "";
      }//new measure
      if (!cT[i][Chr]) {
        chordBegin = true;
        cT[i][Meas] = m;//measures for all cT
        continue;
      }//gap or bar      
      first = false;
      cT[i][Meas] = m;//measures for all cT[][3] 
      var j = k;//new same string notes found if k > j
      stringSum = 0; //accumulate durations on same string
      newNotes = 0; //count for sum
      if (cT[i][Chr].slice(0,1) in restDurations) {//rest between fret notes
        k++;
        measureNotes[m]++;
        ctNotePos[k] = cT[i][Pos];
        ctNoteIds[k] = i;//rest gets id
        noteMeasureNums[k] = m;
        if (!measureFirsts[m]) measureFirsts[m] = cT[i][Pos];
        playNotes[k] = 0; //silent pitch
        fretsDebug[k] = "R";
        stringsDebug[k] = "";
        playDurations[k] = restDurations[cT[i][Chr].slice(0,1)];
        playRings[k] = 0;//rests don't ring
        playWaits[k] = playDurations[k];//always for rests
        continue;//nothing more to play on string after orphan rest
      }
      if (cT[i][Typ] === "o") {
        var o = cT[i][Chr].split('');
        while (o.length > 0){
          s = o.shift();
          if (s in timeSigBeats) mbeats = timeSigBeats[s];
          if (s in noteUpDurations) defaultWait = noteUpDurations[s];
          if (s in noteDnDurations) addDuration = noteDnDurations[s];
          if (s === "\ue866") newTempo(o,cT[i][Pos]);
        }
      }//orphan      
      if (!(/\d/.test(cT[i][Chr]))) {
        chordBegin = true;//cancel first default duration
        continue;
      } //no notes to play here
      var dd = cT[i][Chr].split('');
      n = [];
      while (dd.length > 0) { //merge any two digit notes
        if (/^\d\d/.test(dd.join(''))) {
          dd[1] = 10 * parseInt(dd[0]) + parseInt(dd[1]);
          dd.shift();
        }
        n.push(dd.shift());
      }
      strNotes = -1;//string char count
      strPos = [];//positions
      down = false; //accumulate sequential downstem durations if true
      while (n.length > 0) { //get all notes from note sequence on one string
        //TODO BLOCK ANY INVALID NOTE SYMBOLS HERE OR IN CONVERT TAB?**********
        s = n.shift();// next char on this string
        strNotes++;
        if (s in restDurations) {//include rests in chr after digit
          dots = (s in dottedRestDurations) ? 1 : 0;
          rest = playNotes[k]; //keep previous note pitch          
          k++;
          measureNotes[m]++;
          ctNotePos[k] = cT[i][Pos];
          if (!measureFirsts[m]) measureFirsts[m] = cT[i][Pos];
          strPos[strNotes] = strNotes;
          newNotes++;          
          playNotes[k] = 0; //silent
          fretsDebug[k] = "R";
          stringsDebug[k] = "";
          playWaits[k] = triplet ? 2/3 * restDurations[s] : restDurations[s];
          if (triplet) triplet--;
          playDurations[k] = playWaits[k]; //always for rests
          playRings[k] = 0;//rests don't ring
          down = false;
        }        
        if (/\d/.test(s)) {
          first = true;//next note symbol would be duration, not a new note
          rest = false;//new pitch
          k++; //first note is k=0
          measureNotes[m]++;
          ctNotePos[k] = cT[i][Pos];
          if (!measureFirsts[m]) measureFirsts[m] = cT[i][Pos];
          strPos[strNotes] = strNotes;
          newNotes++;          
          var sp = stringPitch[cT[i][Typ].slice(0,2)];
          var pso = strClass[tabStrings - 1].slice(1,2);//top string class number
          var ps = pitchShift[cT[i][Typ].slice(1,2) - pso + 1];
          var fret = parseFloat(s) + ps;
          if (sp && sp.length === 2) {
            var pp = [];
            pp[0] = fret + sp[0] + capoShift;
            pp[1] = fret + sp[1] + capoShift;
          }
          else pp = fret + sp + capoShift;
          playNotes[k] = pp;
          fretsDebug[k] = fret;
          stringsDebug[k] = cT[i][Typ].slice(0,2);
          playWaits[k] = defaultWait;//noteUpDurations[defaultWait];//start with default
          playDurations[k] = playWaits[k]; //default duration is wait
          playRings[k] = addDuration;
          down = false;
        }
        if (quarter) { //modify quarter note duration by any beam symbol
          quarter = false;
          if (s in beamDurations){
            dots = (s in dottedUpNotes || s in dotDurations) ? 1 : 0;
            playWaits[k] = triplet ? 2/3 * beamDurations[s] : beamDurations[s];
            playDurations[k] = playWaits[k];//until/unless downstem?*****OK??
          }
          down = false;
        }
        if (s in noteUpDurations) {
          dots = (s in dottedUpNotes) ? 1 : 0; 
          if (first) {
            first = false;
            playDurations[k] =
              triplet ? 2/3 * noteUpDurations[s] : noteUpDurations[s];
            playWaits[k] = playDurations[k];//if first
            if (triplet) triplet--;
          }
          else if (tied) {
            tied = false;
            playDurations[k] += noteUpDurations[s];
            playWaits[k] = playDurations[k];
          }
          else {
            k++; //new note
            measureNotes[m]++;
            ctNotePos[k] = cT[i][Pos];
            if (!measureFirsts[m]) measureFirsts[m] = cT[i][Pos];
            strPos[strNotes] = strNotes;
            newNotes++;
            if (rest) {
              playNotes[k] = rest; //return to prior pitch
              fretsDebug[k] = "R";
              stringsDebug[k] = "";
              rest = false;
            }
            else {
              playNotes[k] = playNotes[k - 1];
              fretsDebug[k] = fretsDebug[k - 1];
              stringsDebug[k] = stringsDebug[k - 1];
            }
            playDurations[k] =
              triplet ? 2/3 * noteUpDurations[s] : noteUpDurations[s];
            playWaits[k] = playDurations[k];//new note default
            if (triplet) triplet--;
            playRings[k] = addDuration;
          }
          (s === "\uE1d5") ? quarter = true : quarter = false;
          down = false;
        }
        if (s in noteDnDurations) {//use FOR duration, override upstem or default
          ddots = (s in dottedDnNotes) ? 1 : 0;
          if (first){
            first = false;
            playWaits[k] = defaultWait;//noteUpDurations[defaultWait]; //use default if first
            playDurations[k] = noteDnDurations[s];//dD notation
          }
          else {
            if (down) playDurations[k] += noteDnDurations[s];//auto tie downs
            else playDurations[k] = noteDnDurations[s];//replace duration
          }
          down = true;//previous was down, cancel by any other type          
             //not first, accumulate??****************
          if (tied) tied = false;//Dn notes are auto tied          
        }
        if (s in fermatas) {
            playWaits[k] = playWaits[k] * fermatas[s];
            playDurations[k] = playWaits[k];//until/unless downstem replaces dur
            down = false;
        }
        if (s === "\uE561") playRings[k] = 0;//cancel default ring for this note
        if (s === "\xB3") triplet = 1;
        if (s === "\uE1fd" || s === "\uE4BA") tied = true;
        if (s in dotDurations) {//except "\uEcb7":1.5, for ring dots
          if (dots === 0) {
            dots = 1;
            var base = playWaits[k];            
          }
          else if (dots === 1) { //already dotted
            dots = 2;
            base = 2/3 * playWaits[k];
          }
          dots *= 2;
          if (dots === 2) playWaits[k] = base + base/dots;
          if (dots === 4) playWaits[k] = playWaits[k]  + base/dots;
          if (dots === 8) playWaits[k] = playWaits[k]  + base/dots;
          if (dots === 16) playWaits[k] = playWaits[k]  + base/dots;
          playDurations[k] = playWaits[k];//until/unless downstem replaces dur
          down = false;
        }
        if (s === "\uEcb7") {//high dot for downstems
          if (ddots === 0) {
            ddots = 1;
            var dbase = playDurations[k];            
          }
          else if (ddots === 1) { //already dotted
            ddots = 2;
            dbase = 2/3 * playDurations[k];
          }
          ddots *= 2;
          if (ddots === 2) playDurations[k] = dbase + dbase/ddots;
          if (ddots === 4) playDurations[k] = playDurations[k]  + dbase/ddots;
          if (ddots === 8) playDurations[k] = playDurations[k]  + dbase/ddots;
          if (ddots === 16) playDurations[k] = playDurations[k]  + dbase/ddots;
        } 
/* TODO: tuplet triplet * 2/3 any ratio 
   stacatto 0.5 plus rest  */
      } //next char from n
      if (j !== k) {//at least one note found
        ctNoteIds[k] = i;//use cT[i] for CSS ID
        noteMeasureNums[k] = m;
        j = k;
      }      
     // console.log("k",k,"strnotes",strNotes, ctNotePos)
      var posShift, fixed = 0;
      for (var bu = 0; bu <= strNotes; bu++) {//back up to fix positions on same string
        posShift = strPos[bu];
        //console.log("pos",posShift,k - fixed)
        if (posShift !== undefined) {
          ctNotePos[k - fixed] = ctNotePos[k - fixed] - posShift;
          ctNoteIds[k - fixed] = ctNoteIds[k];
          noteMeasureNums[k - fixed] = noteMeasureNums[k];
          fixed++;
        }
      }
      if(cT[i][Typ].slice(3,4) === "c") { //no wait until end of chord
        if (first && !chordBegin) {//all unspecified chord notes get lower string duration
          playDurations[k] = playDurations[k - 1];//default chord dur
          playWaits[k] = playWaits[k - 1];//*********
          playRings[k] = playRings[k - 1];
        }
        chordBegin = false;
        for(var x = 0;x < newNotes;x++) {
          stringSum += playWaits[k - x];
        }        
        if (!cT[i + 1] || /\d/.test(cT[i + 1][Chr].slice(0,1))) {//next is on new string
          // cancel wait on this string         
          playWaits[k] -= stringSum;
          chordSum = (stringSum > chordSum) ? stringSum : chordSum;
        } 
        else { //end, skip ahead if backed up
          chordSum = (stringSum > chordSum) ? stringSum : chordSum;          
          playWaits[k] += chordSum - stringSum;
          chordSum = 0;
        }
      }//chord
    } //next cT item
    timesigBeats[m] = mbeats;//last measure
    var id, tabPos;//, w = 1;
    songLength = playNotes.length; //global
    var prepNotes = [];//clean slate!
    rolledSums = [];
    for (i = 0; i < songLength; i++) {
      id = ctNoteIds[i] ? "i" + ctNoteIds[i] : "";//should not happen
      tabPos = ctNotePos[i] - 3;// subtract tune area
      ctIdPos[id] = tabPos;
      checkTempo(tabPos);//update secsPerBeat
      playDurations[i] += playRings[i];//add unless cancelled
      prepNotes[i] = [];
      prepNotes[i].push(playNotes[i]);//0 pitch
      prepNotes[i].push("");//1 placeholder  for time from accumlated waits
      prepNotes[i].push(playDurations[i] * secsPerBeat);//2 duration
      prepNotes[i].push(id);//3 ID for highlight play pos
      prepNotes[i].push(tabPos);//4 tab position
      prepNotes[i].push(playWaits[i]);//5 waits for unroll
      prepNotes[i].push(noteMeasureNums[i]);//6 measure num for metronome calcs
      playTimes[i] = playWaits[i];//for debug
      if (!rolledSums[noteMeasureNums[i]]) rolledSums[noteMeasureNums[i]] = 0;
      rolledSums[noteMeasureNums[i]] += playWaits[i];
    };//playprep
    playThings = [];
    playThings = unRoll(prepNotes);
      //use actual sums, not number from time sig
      var avg = measureTimes[0] / measureSums[0];//use average quarter note timing
      var wait = 0;
      var metroNotes = [];
      m = 0;//count measures here
      var one = true;//first beat
      var b = 0;//beats clicked
      for (i = 0; i < songBeats; i++) {
        metroNotes[i] = [];
        if (metronome) {
          if (one) metroNotes[i].push(102);
          else metroNotes[i].push(101);
        }
        else metroNotes[i].push(0);//silent
        metroNotes[i].push(wait);//playTimes[i]);
        metroNotes[i].push(avg);//duration
        metroNotes[i].push("");
        metroNotes[i].push("");
        playThings[songLength + i] = metroNotes[i];
        b++;
        one = false;
        wait += avg;
        if (b >= measureSums[m]) {//actual not correct beats
          b = 0;
          one = true;
          m++;
          avg = measureTimes[m] / measureSums[m];
        }
      }
      songLength += metroNotes.length;
    playEnd = songLength;//until changed by noteSelect

    playThings.sort(byTimes);//sorted [][pitch, time, duration]

    function byTimes(a, b) {
        if (a[1] === b[1]) return 0;
        else return (a[1] < b[1]) ? -1 : 1;
    }

    //********************temp

    if (playTimesDebug) {
      var playDebug = [];
      for (i = 0; i < songLength; i++) {
        playDebug[i] = [];
        playDebug[i].push(fretsDebug[i]);
        playDebug[i].push(stringsDebug[i]);
        playDebug[i].push(playTimes[i]);
        playDebug[i].push(playDurations[i]);//duration secs
        //playDebug[i].push(playDurations[i]);
      }
      playDebug.unshift(["fret","string","beats","duration"]);
/*      playNotesDebug.value = playNotes.join(" ");
      playDurationsDebug.value = playDurations.join(" ");
      playWaitsDebug.value = playWaits.join(" ");*/
      playTimesDebug.value = "[" + playDebug.join("][") + "]";
    }
  }//playPrep
  
  function unRoll(rolledNotes) {
    //playThings [0 pitch, 1 time, 2 duration, 3 id, 4 tab pos, 5 waits, 6 measure]
    var repeats = [];
    if (!loop) repeats = measureRepeats().concat(pairRepeats());//***********handle nested begining repeat
    var textualRepeats = jumpRepeats();
    var p = 0;
    var i,j,k;
    var unRolled = [];

    for (i = 0; i < rolledNotes.length;i++) {    
      if (repeats[p] && rolledNotes[i][4] > repeats[p][0]) {
        k = i;
        while (repeats[p] && rolledNotes[i][4] > repeats[p][0]) {
        j = 0;
          while (rolledNotes[j + k] && 
                 (rolledNotes[k][4] > repeats[p][0] && rolledNotes[j + k][4] < repeats[p][1])) {
            unRolled.push(rolledNotes[j + k].slice());
            j++;
          }
        p++;
        }
      }
      unRolled.push(rolledNotes[i].slice());     
    }
    var time = 0;
    songBeats = 0;//length for metronome
    measureSums = [];
    measureTimes = [];
    for (i = 0; i < unRolled.length; i++) {
      checkTempo(unRolled[i][4]);//update secsPerBeat
      unRolled[i][1] = time;
      time += unRolled[i][5] * secsPerBeat;//units is seconds NOT quarter notes
      songBeats += unRolled[i][5];
      if (!(measureSums[unRolled[i][6]])) measureSums[unRolled[i][6]] = 0; 
      measureSums[unRolled[i][6]] += unRolled[i][5];
      if (!measureTimes[unRolled[i][6]]) measureTimes[unRolled[i][6]] = 0;
      measureTimes[unRolled[i][6]] += unRolled[i][5] * secsPerBeat;
    }  
    songLength = unRolled.length;
    return unRolled;
  }; //unroll
  
  function jumpRepeats() {
    var daCapo, daSegno, DCalCoda, DCalFine, DSalCoda, DSalFine, segno = 0, toCoda, fine = songLength, coda = songLength;
    var unused = [];
    var notUsed = true, first = true;//use first found of DC or DS
    var jump = [], jump2 = [];//repeat section[from, to]
    
    cT.forEach((c,i) => {//find positions of jump sections
      var t = cT[i][Chr];
      if (/[\uE045-\uE04B\u00D5-\u00D8]/.test(t)) {//any jump char
        notUsed = true;
        if (/\uE046/.test(t) && first) {//DC
          notUsed = false;
          first = false;
          if (/\u00D7/.test(t) && !DCalCoda) DCalCoda = i;//alCoda
          else if (/\u00D8/.test(t) && !DCalFine) DCalFine = i;//alFine
          else daCapo = i;}
        if (/\uE045/.test(t) && segno != 0 && first) {//DS must follow segno
          notUsed = false;
          first = false;
          if (/\u00D7/.test(t)) DSalCoda = i;
          else if (/\u00D8/.test(t)) DSalFine = i;
          else daSegno = i}
        if (/[\uE047\uE04A\eE04B]/.test(t) && segno === 0) {segno = i; notUsed = false;}
        if (/[\uE048\uE049]/.test(t) && coda === songLength) {coda = i; notUsed = false;}
        if (/\u00D5/.test(t) && fine === songLength) {fine = i; notUsed = false;}
        if (/\u00D6/.test(t) && !toCoda) {toCoda = i; notUsed = false;}
        if (notUsed) unused.push(i);
      }
    });
    
    //only one of these conditions can be met
    if (daCapo) jump = [0, songLength];
    if (DCalFine) jump = [0, fine];//fine will stop playback      
    if (DCalCoda && toCoda) {jump = [0, toCoda]; jump2 = [coda, songLength]}
    if (DCalCoda && !toCoda) jump = [0, songLength];
    if (daSegno) jump = [segno, songLength];
    if (DSalFine) jump = [segno, fine];
    if (DSalCoda && toCoda) {jump = [segno, toCoda]; jump2 = [coda, songLength]}
    if (DSalCoda && !toCoda) jump = [segno, songLength];
    
    if (segno != 0 && !(daSegno || DSalFine || DSalCoda)) unused.push(segno);
    
    unused.forEach(u => {cT[u][Typ] += " u";});//flag unused 
    
    return [jump, jump2,unused];
  }
  
  function measureRepeats() {
    var mReps = [];//measures with repeat sign
    var dReps = [];//two measure repeats
    var pReps = [];//positions to repeat
    var mrPairs = [];//pairs for unroll
    

    cT.forEach((c,i) => {
      if (/\uE500/.test(cT[i][Chr])) {
        mReps.push([cT[i][Meas]]);
      }});//any ./. 

    cT.forEach((c,i) => {
      if (/\uE501/.test(cT[i][Chr])) {
        dReps.push([cT[i][Meas]]);
      }});//any .//.    
    
    cT.forEach((m,i) => {mReps.forEach((r,j) => {
        if (r && cT[i][Meas] === r[0] - 1) {if (!pReps[j]) pReps[j] = []; pReps[j].push(cT[i][Pos])}});});//tab pos

    cT.forEach((m,i) => {dReps.forEach((r,j) => {
        if (r && (cT[i][Meas] === r[0] - 2 || cT[i][Meas] === r[0] - 1)) {if (!pReps[j]) pReps[j] = []; pReps[j].push(cT[i][Pos])}});});//tab pos    
    
    pReps.forEach((p,i) => {mrPairs[i] = []; mrPairs[i][0] = p[0] - 3; mrPairs[i][1] = p[p.length - 1] - 2});
    
    //console.log(pReps,mrPairs)
    return mrPairs;
  }
  
  function pairRepeats() {
    var repeatBars = []; repeatBars[0] = 0;//default |: at beginning
    var pairs = [], goodPairs = [], pairPositions = [], repCount;
    
    cT.forEach((c,i) => {
      if (/[\uE040-\uE042]/.test(cT[i][Chr])) {repeatBars.push(i);}});//any |: :| or :|:
    
    repeatBars.forEach((b,i) => {pairs.push([b, repeatBars[i + 1]]);});//every possible pair
    
    if (pairs[0] && pairs[0][1] && pairs[0][0] === 0 &&
      /[\uE041\uE042]/.test(cT[pairs[0][1]][Chr])) goodPairs.push(pairs[0]);//use default begin for first pair  
    
    pairs.forEach(p => {if (p[0] && p[1]) {//find valid pairs
      if (/[\uE040]/.test(cT[p[0]][Chr]) && /[\uE041\uE042]/.test(cT[p[1]][Chr])) goodPairs.push(p);// |:...:| or |:...:|:                          
      if (/[\uE042]/.test(cT[p[0]][Chr]) && /[\uE041]/.test(cT[p[1]][Chr])) goodPairs.push(p);// :|:...:|
    }});
    
    repeatBars.forEach(b => {//flag unused in cT html class
      if (!(goodPairs.join()).includes(b) && cT[b] && b > tabStrings) {cT[b][Typ] += " u";}});
    
    goodPairs.forEach(p => {
      var gp = [cT[p[0]][Pos] - 3,cT[p[1]][Pos] - 3];
      var bkwds = cT[p[1]][Chr];//backwards repeat bar, may include play count superscript
      pairPositions.push(gp);
      if (superRegex.test(bkwds.slice(1,2))) {
        repCount = superscripts[bkwds.slice(1,2)];
        if (repCount > 2) {do {pairPositions.push(gp);repCount--;} while (repCount > 2);}
      }
      else if (superRegex.test(bkwds.slice(0,1))) {//take either leading or following superscript
        repCount = superscripts[bkwds.slice(0,1)];
        if (repCount > 2) {do {pairPositions.push(gp);repCount--;} while (repCount > 2);}
      }
    });
    //console.log(pairPositions)
    return pairPositions;    
  }  
  
  function newTempo(t,p) {
    var tempo, d = "",s;
    while (t.length > 0) {
      s = t.shift();
      if (s in subscripts) d += subscripts[s];
    }
    tempo = parseInt(d);
    if ((19 < tempo) && (tempo < 501)) {
      tempos.push([p - 3, tempo]);//reduce p for tempo string length
      defaultTempo = false;
    }
  }
  
  function checkTempo(p) {
    var tempo = tempos[0][1];    
    if (defaultTempo) {
      var newTempo = document.getElementById("tempo").value;
      if (newTempo != tempo) {
        tempos[0][1] = newTempo;
        secsPerBeat = 60 / newTempo;
        playPrep();
        return;
      }
      return;
    }
    for (var i = 1; i < tempos.length; i++) {
      if (tempos[i][0] > p) break;      
      if (tempos[i][0] <= p) tempo = tempos[i][1];       
    }
    if (tempo) document.getElementById("tempo").value = tempo;
    secsPerBeat = 60 / tempo;
    return;
  }//update tempo to new position
  
  function keyDown2(event) {
    key2 = true;
    var cw = tabArea2.selectionStart;
    tabArea.focus();
    tabArea.setSelectionRange(cw,cw);
    keyDownHandler(event);    
  }
  
  const prepThrottle = throttle(prepCt, 300);

  function throttle(func, wait = 100) {
    let timer = null;
    return function(...args) {
      if (timer === null) {
        timer = setTimeout(() => {
          func.apply(this, args);
          timer = null;
        }, wait); 
      }
    };
  }
  
  var mouseDown = false;
  var mouseDown1 = false;  
  var mouseDown2 = false;
  
  function tabInit(add) {
    if (add) { //no measure bar at 0 on paste
      tabArea.value = "\n".repeat(tabStrings - 1);
      tabArea.value += extendTail;
      tabArea2.value = tabArea.value;
      lyricArea.value = extendTail;      
    }
    else {
      tabArea.value = "|\n".repeat(tabStrings - 1);
      tabArea.value += "|" + extendTail;
      tabArea2.value = tabArea.value;
      lyricArea.value = "|" + extendTail;
    }
  }
  
  function tabMouseDown() {
    if (!tabArea.value) tabInit();    
    mouseDown = true;
    mouseDown1 = true;
    //tabArea.setSelectionRange(0,0);//clear previous to prevent drag
  }
  
  function tab2MouseDown() {
    if (!tabArea.value) tabInit();    
    mouseDown = true;
    mouseDown2 = true;
    //tabArea2.setSelectionRange(0,0);//clear previous to prevent drag    
  }
  
  function ctMouseUp() {
    if (document.activeElement.id === "instr") return;
    var s = window.getSelection();
    var a, b, c, d;
    if (s.anchorNode && s.anchorNode.parentElement) a = s.anchorNode.parentElement.id;
    if (s.focusNode && s.focusNode.parentElement) b = s.focusNode.parentElement.id;
    if (a) c = ctIdPos[a];
    if (b) d = ctIdPos[b];
    if (c && d) {
      if (c === d )noteSelect(c,d);
      else {
        tabArea.setSelectionRange(c,d + 1);
        noteSelect(c, d + 1);}
    }
    window.getSelection().collapse(null); //clear previous to prevent drag 
  } 
  
  function barNumbScroll() {
    lyricArea.scrollLeft = barNumb.scrollLeft;
  }
  
  function linkScroll() {
    if (keyScroll) { //keystroke scroll event, not scrollbar move
      keyScroll = false;      
    }
    else {//center cursor to prevent unscroll Firefox 
      cursorLyric = (lyricArea.scrollLeft + lyricArea.clientWidth / 2) / charWidth;
      lyricArea.setSelectionRange(cursorLyric, cursorLyric);
    }    
    barsHidden = barScroll();
    partsHidden = partScroll();   
    if (mouseDown && document.activeElement.id === "TabIn") 
      lyricArea.scrollLeft = tabArea.scrollLeft;//tab area mouse drag select
    if (mouseDown && document.activeElement.id === "TabIn2") 
      lyricArea.scrollLeft = tabArea2.scrollLeft;//tab area mouse drag select
/*    if (mouseDown && document.activeElement.id === "BarNum") 
      lyricArea.scrollLeft = barNumb.scrollLeft;//tab area mouse drag select*/
    
    tabArea.scrollLeft = lyricArea.scrollLeft;
    tabArea2.scrollLeft = lyricArea.scrollLeft;    
    barNumb.scrollLeft = lyricArea.scrollLeft;
    if (paused) prepThrottle();//don't update cT during play
  }   
  
  function scrollHorizontally(event) {
      lyricArea.scrollLeft -= (event.wheelDeltaY / 4);
      event.preventDefault();
  }

  function noModal() {
    document.getElementById("msgdiv").style.display = "none";
    event.preventDefault();
  }

  function readJS(evt) {
    var f = evt.target.files[0];
    var r = new FileReader();
    r.onload = function(e) { 
        var contents = e.target.result; 
      document.getElementById('scriptSrc').value = contents;
    }
    r.readAsText(f);
  } 
  
  function readJS2(evt) {
    var f = evt.target.files[0];
    var r = new FileReader();
    r.onload = function(e) { 
        var contents = e.target.result; 
      document.getElementById('scriptSrc2').value = contents;
    }
    r.readAsText(f);
  }  
  
  function keyDownHandler(e) {
    keysDown++;
    keyHandled = true;
    locateTabCursor();
    oldPlace = cursorPlace;
    setSelStart = cursorWhere;
    tabArea.setSelectionRange(setSelStart, setSelStart); //only one char selection
    if (e.key === "Enter") {
      event.preventDefault();
      addBar(tabArea);
      keyIdentified = true;
      return;
    }
    if (e.key === "Backspace") {
      event.preventDefault();
      bkspCol(tabArea);
      keyIdentified = true;
      return;
    }
    if (e.key !== "Unidentified") {
      keyIdentified = true; //********** test if false
      tabKeyDown(e); //comment for test
    }
    if (!keyIdentified){
      if (tabArea.value[cursorWhere] === "\n") extendTab(0);// don't overtype line end
      if (tabArea.value.length === cursorWhere) extendTab(0); // last line end
      oldValue = tabArea.value;
    }
  }
  
  function inputHandler(e) {
    if (!e || e.data === null) return;
    var newChar = e.data.slice(0,1); //newValue[setSelStart]
    if (!keyHandled) {//no key down ffox android
      if (tabArea.value[cursorWhere] === "\n") extendTab(0);// don't overtype line end
      if (tabArea.value.length === cursorWhere) extendTab(0); // last line end
      oldValue = lines.join("\n");       
    }
    if (keyIdentified) return;
    unIdKey(newChar, oldValue);
  }
  
  function keyUpHandler(e) {
    if (oType) {//nothing to do for overtype keys
      e.stopPropagation();
      oType = false;
      return;
    }
    if (e.key === "Shift") {
      locateTabCursor();
      setSelStart = cursorWhere + 1;
      setSelEnd = setSelStart;
      tabArea.setSelectionRange(setSelStart, setSelEnd);
      return;}
    keysDown > 0 ? keysDown-- : keysDown = 0;

    if (!keyIdentified) {
      setSelStart += 1;
      setSelEnd = setSelStart;
      tabArea.setSelectionRange(setSelStart, setSelEnd);        
    }
    if (!(undoKey || navKey || e.key === "Shift" ||
          e.key === "Control" || e.key === "Alt" || e.key === "Escape")) getTabIn();    
    else keepScrollPlace();
    navKey = false;
    keyIdentified = false;
    keyHandled = false;     
    undoKey = false;
    key2 = false;
    noteSelect(selStart,selEnd);
  }
  
  function unIdKey(newChar, oldValue) {
    var curOld = setSelStart;    
  switch (newChar) {
    case ",":
      commaLeft();
      setSelStart -= 2;      
      tabArea.value = oldValue;      
      break;
    case ".":
      dnArrow();
      setSelStart -= 2;
      tabArea.value = oldValue;
      break;
    case " ":
      tabArea.value = oldValue;
      tabArea.setSelectionRange(curOld, curOld);
      insCol();
      setSelStart = curOld - 1 + cursorLine;
      setSelEnd = setSelStart;
      break;
    default:
      unIdOvertype(newChar); 
    }
  }
  
  function unIdOvertype(newChar) {
    var curOld = setSelStart;    
    var newValue = tabArea.value;
    var barMove = false;
    // don't overtype | here
    if (oldValue[curOld] === "|") {
      barMove = true;
      tabArea.value = oldValue;
      tabArea.setSelectionRange(curOld, curOld);
      var tabNew = "";
      var tabLines = [];
      for (var i = 0; i < tabStrings; i++) {
        tabLines[i] =
          tabSplit[i].slice(0, cursorPos) + "-" + tabSplit[i].slice(cursorPos);
        tabNew += (i < tabStrings - 1) ? tabLines[i] + "\n" : tabLines[i] + extendTail;
      }
      tabArea.value = tabNew.slice(0, setSelStart + cursorLine) + newChar +
        tabNew.slice(setSelStart + cursorLine + 1);      
      setSelStart = curOld + cursorLine + 1;
      setSelEnd = setSelStart;
      cursorWhere += cursorLine;
    }
    if ((!barMove) && (/[3-90]/.test(oldValue[curOld - 1]) && /[\d]/.test(newChar)) ||
      (oldValue[curOld - 1] === "2" && /[5-9]/.test(newChar))) {
      tabLines = [];
      tabNew = "";
      for (i = 0; i < tabStrings; i++) {
        tabLines[i] =
          tabSplit[i].slice(0, cursorPos) + "-" + tabSplit[i].slice(cursorPos);
        tabNew += (i < tabStrings - 1) ? tabLines[i] + "\n" : tabLines[i] + extendTail;
      }
      tabArea.value = tabNew.slice(0, setSelStart + cursorLine + 1) + newChar +
        tabNew.slice(setSelStart + cursorLine + 2);      
      setSelStart = curOld + cursorLine + 1;
      setSelEnd = setSelStart;
      cursorWhere += cursorLine;
      barMove = true;
    }
    if (!barMove) tabArea.value = oldValue.slice(0, setSelStart) + newChar +
      newValue.slice(newValue.length - oldValue.length + setSelStart + 1);          
  }
  
/*  function pasteClipTab(paste) {
    //let paste = (event.clipboardData || window.clipboardData).getData("text");
    locateTabCursor();
    tabArea.value = "";
    tabArea.value = paste;
    prevLines = lines.slice();
    if (prevLines.length !== tabStrings) { // fallback to empty array
      prevLines = " ".repeat(tabStrings - 1).split(" ");
      lines = prevLines.slice();
    }
    newLines = tabArea.value.replace(/(\r\n|\n|\r)/gm, "\n").split("\n");
    if (lines[0].length <  1) { //empty
      append = false;
      undoing = false;
      findTab();
    } else {
      for (var i = 0; i < tabStrings; i++) { //separate sections
        prevHead[i] = prevLines[i].slice(0, cursorPos);
        prevTail[i] = prevLines[i].slice(cursorPos);
      }
      append = true;
      undoing = false;
      findTab();
    }
  }*/
  
/*  async function getClipboardContents() {
    console.log("try")
  try {
    const text = await navigator.clipboard.readText();
    console.log('Pasted content: ', text);
  } catch (err) {
    console.error('Failed to read clipboard contents: ', err);
  }
    console.log("return")
}*/
/*  async function getClipboardPermission() {
  const queryOpts = { name: 'clipboard-read', allowWithoutGesture: false };
const permissionStatus = await navigator.permissions.query(queryOpts);
// Will be 'granted', 'denied' or 'prompt':
console.log(permissionStatus.state);

// Listen for changes to the permission state
permissionStatus.onchange = () => {
  console.log(permissionStatus.state);
};
  }*/


  
  function tabKeyDown(event) {
  if (event.defaultPrevented) {
    return; // Do nothing if the event was already processed
  }
  event.preventDefault();
    //console.log(["key",event.key,event.ctrlKey])
  switch (event.key) {
    case "Control":    
      return;
    case "Down": // IE/Edge specific value
    case "ArrowDown":
      dnArrow();
      break;
    case "Up": // IE/Edge specific value
    case "ArrowUp":
      upArrow();
      break;
    case "Left": // IE/Edge specific value
    case "ArrowLeft":
      leftArrow();
      break;
    case "Right": // IE/Edge specific value
    case "ArrowRight":
      rightArrow();
      break;
    case "Enter":
      addBar();
      break;
    case "Alt":      
      navKey = true;
      locateTabCursor();
      cursorLyric = cursorPos;
      tabArea.blur();
      lyricArea.focus();        
      break;
    case "Esc": // IE/Edge specific value
    case "Escape":     
      document.getElementById("barMode").value = "Off"; 
      barMaster();
      break;
    case "Shift":
      break;      
    case "Tab":     
      document.getElementById("barMode").value = "Tab"; 
      barMaster();       
      break;      
    case ".":
    case "Decimal":
      dotDown();
      break;
    case ",":
      commaLeft();
      break;
    case "Delete":
    case "Del":      
      delCol();
      break;
    case " ":      
    case "Insert":      
      insCol();
      break;
    case "|":
      addBar();
      break;      
    case "Backspace":      
      bkspCol();
      break;
/*    case "PageDown":
    case "Redo":
      undoKey = true;      
      redo();
      setSelEnd = setSelStart;
      break;
    case "PageUp":
    case "Undo":
      undoKey = true;
      undo();      
      break;*/
    case "End":      
      endKey();
      break;
    case "Home":      
      homeKey();
      break;
    case "v":
      if (event.ctrlKey) {
//getClipboardContents();
       // document.execCommand('paste');

       // console.log("c-v key")
       // console.log(["ctrl-v",navigator.clipboard.readText()])
/*       navigator.clipboard.readText().then(text => {pasteTab(text);}).catch(err => {pasteFail(err);});*/
        navigator.clipboard.readText().then(clipText => pasteTab(clipText));
        //console.log("c-v key post")
        
        //getClipboardPermission();
        

      }
      else overType(event.key);
      break;      
    case "y":
      if (event.ctrlKey) {
        undoKey = true;
        redo();
      }
      else overType(event.key);
      break;      
    case "z":
      if (event.ctrlKey) {
        undoKey = true;        
        undo();
      }
      else overType(event.key);
      break;
    default:
      overType(event.key);
  }
}   
  
  function extendTab(n) {
    var j, empty = false, split;
    split = tabArea.value.split("\n");
    split[tabStrings - 1] = trimTail(split[tabStrings - 1]);
    if (split.length < 3) empty = true;
    for (j = 0; j < tabStrings; j++) split[j] = empty ? "-" : split[j] + "-";
    tabArea.value = split.join("\n") + extendTail;
    setSelStart = cursorWhere + n + cursorLine;
    setSelEnd = setSelStart; 
    tabArea.setSelectionRange(setSelStart, setSelStart);
    getTabIn();
  }
  
  function tableText(tableCell) {
    keyIdentified = true;
    if (lastBlur === "tab") {      
      locateTabCursor();      
      overType(tableCell.innerHTML);
      //getTabIn();//again??*******
      tabArea.focus();
    }
    if (lastBlur === "tab2") {
      tabArea.setSelectionRange(cursorWhere2,cursorWhere2);
      locateTabCursor();
      overType(tableCell.innerHTML);     
      getTabIn();
      tabArea2.setSelectionRange(cursorWhere2 + 1,cursorWhere2 + 1);
      tabArea2.focus();
    }    
    if (lastBlur === "lyric") {
      locateLyricCursor();
      lyricArea.value = lyricArea.value.slice(0, cursorLyric) + tableCell.innerHTML + lyricArea.value.slice(cursorLyric);
      if (barFrom === "Tab") {
        lyricBarsFromTab();
        getTabIn();
      } 
      else if (barFrom === "Lyr") {
        tabBarsFromLyrics(trimTail(lyricArea.value));
      }
      else if (barFrom === "Off") {
        thisBarIns();
      }           
      lyricArea.setSelectionRange(cursorLyric + 1, cursorLyric + 1);
    }
    keepScrollPlace();
    keyIdentified = false;
    noteSelect(cursorPos,cursorPos);
    oType = false;
  }
    
  window.onload = () => {
    ctx.suspend();// in case the browser doesn't do this
    playTimesDebug = document.getElementById("debugtimes");//*******temp
    playButton = document.getElementById("play");
    ptable = document.getElementById("pitchtbl");
    var finp = document.getElementById('fileinput');
    if (finp) finp.addEventListener('change', readJS, false);
    var finp2 = document.getElementById('fileinput2');
    if (finp2) finp2.addEventListener('change', readJS2, false); 
    var mk = document.getElementById('make');
    if (mk) mk.addEventListener('click', makeOffline, false);
    tabTitle = document.getElementById("songTitle");
    tabArea = document.getElementById("TabIn");
    tabArea.focus();
    tabArea2 = document.getElementById("TabIn2");    
    tuneArea = document.getElementById("TuneIn");
    tuneArea2 = document.getElementById("TuneIn2");    
    lyricArea = document.getElementById("LyricIn");
    barNumb = document.getElementById("BarNum");
    ctabOut = document.getElementById("ctOut");
    tabBack = document.getElementById("TabBacker");
    tuneBack = document.getElementById("TuneBacker");
    clink = document.getElementById("ctlink");
    makeButton = document.getElementById("makeclink");    
    var song = document.getElementById("songSave");
    if (song) tabTitle.innerHTML = song.innerHTML;
    else tabTitle.innerHTML = "title"
    tuneArea.value = stringNames();
    tuneArea2.value = stringNames();    
    tabArea.value = "";
    tabArea2.value = "";
    newStrings("6 Guitar");
    colorToggle();    
    lyricArea.value = lyricText;
    addEvents();
    secsPerBeat = 60 / document.getElementById("tempo").value;
    tempos[0] = [0,document.getElementById("tempo").value];
    instrumentName = document.getElementById("numStrings").value.slice(2);//default
    if (foundSavedLyrics()) {
      if (song) { //saved textareas found
        var lbtn = document.getElementById("loopbtn").className;
        lbtn.includes("off") ? loop = true : loop = false;
        var mbtn = document.getElementById("metro").className;
        mbtn.includes("off") ? metronome = true : metronome = false;
        var tab = document.getElementById("tabSave");
        document.getElementById("TabIn").value = tab.value;
        var lyr = document.getElementById("lyricSave");
        var tun = document.getElementById("tuneSave");
        document.getElementById("TuneIn").value = tun.value;
        var str = document.getElementById("stringSave");
        document.getElementById("numStrings").value = str.value;
        var parts = document.getElementById("kParts").className;
        parts.includes("off") ? keepSections = false : keepSections = true;
        var bars = document.getElementById("kMeasures").className;
        bars.includes("off") ? keepMeasures = false : keepMeasures = true;
        var space = document.getElementById("kSpaces").className;
        space.includes("off") ? keepSpaces = false : keepSpaces = true;
        lyricLtrSpace = parseInt(document.getElementById("ltrSave").innerHTML);
        var bpm = parseInt(document.getElementById("temposave").innerHTML);
        document.getElementById("tempo").value = bpm;
        var psh = document.getElementById("pitchsave").innerHTML;
        pitchShift = psh.split(",");
        tempos[0] = [0,document.getElementById("tempo").value];
        secsPerBeat = 60 / document.getElementById("tempo").value;
        instrument = str.value;
        newStrings(instrument);
        startTab = tun.value.split("\n");
        tabStrings = startTab.length;
        lyricText = lyr.value;
        lyricBarsFromTab();
        document.getElementById("LyricIn").value = lyr.value;
        tabTitle.innerHTML = song.innerHTML;
        editClick();
      }
      showButtons = true; menuToggle();
      barFrom = "Tab";
      barMaster();
      getTabIn();
      document.getElementById("nonPrint").style.display = "none";
      document.getElementById("menuTog").style.display = "none";
      document.getElementById("editButton").style.display = "block";
      document.getElementById("saveoptions").style.display = " none";
    }
    else useLink();
    readPitches();
    playPrep();
  }
  
  function makeMidi() {//https://jazz-soft.net/doc/JZZ/midifile.html
    var midiTitle = tabTitle.innerText;
    checkTempo(0);
    var tempo = 60.0/secsPerBeat;
    var prevSecsPerBeat = secsPerBeat;
    const ticksPerQuarter = 960;
    
    var smf = new JZZ.MIDI.SMF(1, ticksPerQuarter);
    var trk0 = new JZZ.MIDI.SMF.MTrk(); smf.push(trk0); // tempo changes
    var trk1 = new JZZ.MIDI.SMF.MTrk(); smf.push(trk1); // lyrics
    var trk2 = new JZZ.MIDI.SMF.MTrk(); smf.push(trk2); // notes

    trk0.smfSeqName(midiTitle).smfBPM(tempo);

    var beats, beatsum = 0, words;
    var bars = lyricText.replace(/(\|\|)/g, "| ").split("|"); //parts|| and bars| are measures
    if (!bars[0]) bars.shift();
    trk1.smfSeqName('Lyrics').smfText('@T' + midiTitle);
    for (var i = 0; i < bars.length; i++) {
      beats = i * measureSums[i] * ticksPerQuarter;
      if (beats !== beats || beats === 0) beats = beatsum;
      beatsum = beats;
      words = bars[i].trim();
      if (beats === 0) beats = 1;//don't use tick(0) for lyrics
      trk1.add(beats, JZZ.MIDI.smfText(words));
    }
    
    var midiInstr = document.getElementById("instrsf").selectedIndex;
    const midiProgram = {0:26,1:33,2:25,3:26,4:106,5:43,6:31,7:16,8:34,9:35,10:28,11:27,12:29,13:36,14:32,15:30,16:46,17:105,18:37,19:38,20:39,21:40,22:42,23:41}
    
    trk2.smfSeqName('ColorTab').ch(0).program(midiProgram[midiInstr]); // set channel, program instrument
     
    var nOn = 0, nOff = 0, dur, nPitch, step = 0, time = 0;
    for (i = 0; i < songLength; i++) { // playThings[][pitch, time, duration,id,tab pos]
      if(playThings[i][0] === 0) continue;//rest
      if(playThings[i][0] === 101 || playThings[i][0] === 102) continue;//metronome
      step = playThings[i][1] - time;//time increase in seconds
      time += step;
      nOn += step / secsPerBeat * ticksPerQuarter;      
      checkTempo(playThings[i][4]);
      if (secsPerBeat != prevSecsPerBeat) {
        trk0.add(nOn, JZZ.MIDI.smfBPM(60.0/secsPerBeat));
        prevSecsPerBeat = secsPerBeat;
      }
      dur = playThings[i][2] / secsPerBeat * ticksPerQuarter;
      nOff = nOn + dur;
      nPitch = playThings[i][0];
      
      //console.log(i/2 + 1,"nOn",nOn,"dur",dur,"pTime",playThings[i][1],"pDur",playThings[i][2],secsPerBeat,ticksPerQuarter)
      if (nOn === 0) nOn = 1;
      trk2.add(nOn, JZZ.MIDI.noteOn(0,nPitch));
      if (nOn === 1) nOn = 0;
      trk2.add(nOff, JZZ.MIDI.noteOff(0,nPitch));
    }
      trk2.add(nOff,JZZ.MIDI.smfEndOfTrack());

    var str = smf.dump(); // MIDI file dumped as a string
    var b64 = JZZ.lib.toBase64(str); // convert to base-64 string
    var uri = 'data:audio/midi;base64,' + b64; // data URI

    document.getElementById('midiout').innerHTML = 
      '<a id="midilink" download=' + tabTitle.innerText + '.mid href=' + uri + '>Download Midi File</a>';
}  
  
  function foundSavedLyrics(){   
    var empty = document.getElementById("lyricSave");
    var yes = (empty && empty.value.length > 0) ? true : false;
    return yes;
  }
  
  function locateTabCursor(add) {
    var trimLen;
    if (!tabArea.value) tabInit(add);
    cursorWhere = tabArea.selectionStart;
    cursorThere = tabArea.selectionEnd;
    tabSplit = tabArea.value.split("\n");
    tabSplit[tabStrings - 1] = trimTail(tabSplit[tabStrings - 1]);
    trimLen = tabSplit.join("\n").length;
    if (cursorWhere > trimLen) {
      cursorWhere = trimLen;
      cursorThere = cursorWhere;
    }
    lineLen = tabSplit[0].length;
    cursorPos = cursorWhere % (lineLen + 1); // characters
    cursorPos2 = cursorThere % (lineLen + 1);
    cursorLine = Math.floor(cursorWhere / (lineLen + 1));
    cursorSplit = (cursorPos / lineLen) * tabArea.scrollWidth; //pixels
    cursorPlace = cursorSplit - tabArea.scrollLeft; //pixels
  }

  function homeKey() {
    navKey = true;
    setSelStart = 0;
    setSelEnd = setSelStart;
    cursorSplit = 0;
    if (showColors === 0) {
      tabArea2.focus();
      tabArea2.scrollTop = 0;
      key2 = false;
    } 
    else tabArea.setSelectionRange(setSelStart, setSelEnd); 
    noteSelect(0,0);
  }

  function endKey() {
    navKey = true;
    setSelStart = (tabSplit[0].length + 1) * (cursorLine + 1) - 1;
    setSelEnd = setSelStart;
    oldPlace = 0;
    cursorSplit = tabArea.scrollWidth;
    noteSelect(tabSplit[0].length,tabSplit[0].length);
  }

  function leftArrow() {    
    navKey = true;
    if (cursorPos === 0) return;
    charShift = -1;
    setSelStart = cursorWhere - 1;
    setSelEnd = setSelStart;
    noteSelect(cursorPos - 1, cursorPos - 1);    
  }

  function rightArrow() {
    navKey = true;
    if (cursorPos === lineLen) return;
    charShift = 1;
    setSelStart = cursorWhere + 1;
    setSelEnd = setSelStart;
    noteSelect(cursorPos + 1, cursorPos + 1);    
  }

  function upArrow() {
    navKey = true;    
    if (cursorLine === 0) cursorLine = tabStrings;
    var lineUp = cursorPos + (tabSplit[0].length + 1) * (cursorLine - 1);
    setSelStart = lineUp;
    setSelEnd = setSelStart;
    if (showColors === 0 && cursorLine >= blackStrings) {
      key2 = false;
      tabArea.focus();    
      tabArea.setSelectionRange(setSelStart, setSelEnd);
    }
    if (showColors === 0 && cursorLine <= blackStrings) {
      tabArea2.focus();
      tabArea2.setSelectionRange(setSelStart, setSelEnd);      
      tabArea2.scrollTop = 0;
      tabArea2.scrollLeft = tabArea.scrollLeft;
    }
    if (document.activeElement.id === "TabIn") 
      tabArea.setSelectionRange(setSelStart, setSelEnd);
    noteSelect(cursorPos, cursorPos);
  }

  function dnArrow() {    
    navKey = true;
    cursorLine++;
    if (cursorLine === tabStrings) cursorLine = 0;
    setSelStart = cursorPos + (tabSplit[0].length + 1) * cursorLine;
    setSelEnd = setSelStart;
    if (showColors === 0 && cursorLine >= blackStrings) {
      key2 = false;
      tabArea.focus();    
      tabArea.setSelectionRange(setSelStart, setSelEnd);
    }
    if (showColors === 0 && cursorLine === 0) {
      tabArea2.focus();
      tabArea2.setSelectionRange(setSelStart, setSelEnd);      
    }
    if (document.activeElement.id === "TabIn") 
      tabArea.setSelectionRange(setSelStart, setSelEnd);
    noteSelect(cursorPos, cursorPos);
  }
  
  function overType(key) {
    oType = true;
    var tabLines = [];
    var tabNew = "";
    var i;
    setSelStart = cursorWhere + 1;
    setSelEnd = cursorWhere + 1;
    if (key.length > 1) return; //only single chars here!
    charShift += 1;
    if (tabArea.value[cursorWhere] === "\n") {
      if (keysDown > 1) return; //prevent wrap
      tabArea.value = [tabArea.value.slice(0, cursorWhere), tabArea.value.slice(cursorWhere)].join("-");
    }
    if ((/[3-90]/.test(tabArea.value[cursorWhere - 1]) && /[\d]/.test(key)) ||
      (tabArea.value[cursorWhere - 1] === "2" && /[5-9]/.test(key)) || 
       (/^\d\d$/.test(tabArea.value.slice(cursorWhere - 2, cursorWhere)) &&
       /[\d]/.test(key)))  
    { //auto dash notes except 1x 2x < 25
          tabLines = [];
          tabNew = "";
          for (i = 0; i < tabStrings; i++) {
            tabLines[i] =
              tabSplit[i].slice(0, cursorPos) + "-" + tabSplit[i].slice(cursorPos);
            tabNew += (i < tabStrings - 1) ? tabLines[i] + "\n" : tabLines[i] + extendTail;
          }
          tabArea.value = tabNew;
          cursorWhere += cursorLine + 1;
          if (tabArea.value[cursorWhere] === "\n") {
            tabArea.value = [tabArea.value.slice(0, cursorWhere), tabArea.value.slice(cursorWhere)].join("-");
          }
      tabArea.setSelectionRange(cursorWhere, cursorWhere);
      locateTabCursor();
    } //auto dash
    if (tabArea.value[cursorWhere] === "|") { //don't break measures, insert
      tabNew = "";
      for (i = 0; i < tabStrings; i++) {
        tabLines[i] =
          tabSplit[i].slice(0, cursorPos) + "-" + tabSplit[i].slice(cursorPos);
        tabNew += (i < tabStrings - 1) ? tabLines[i] + "\n" : tabLines[i] + extendTail;
      }
      tabArea.value = tabNew;
      cursorWhere += cursorLine;
    }
    tabArea.value = tabArea.value.slice(0, cursorWhere) + key + tabArea.value.slice(cursorWhere + 1);
    tabArea2.value = tabArea.value;
    setSelStart = cursorWhere + 1;
    setSelEnd = cursorWhere + 1;
    tabArea.setSelectionRange(cursorWhere + 1,cursorWhere + 1);
    keysDown > 0 ? keysDown-- : keysDown = 0;    
    getTabIn();
    if (/[\d]/.test(key)) soundNewNote(key,cursorLine, cursorWhere);
    noteSelect(cursorPos + 1, cursorPos + 1);
    }  
  
  function soundNewNote(k,line,w) { //play new or cursor note
    if (ctx.state !== 'running') { //don't interrupt play       
      k = parseFloat(k);      
      var pre = tabArea.value.slice(w - 1, w);
      var post = tabArea.value.slice(w + 1,w + 2);
      if (/[1-2]/.test(pre)) {
        k += 10 * parseFloat(pre);
        post = "";//not both!
      }
      if (/[\d]/.test(post) && /[1-2]/.test(k)) k = 10 * k + parseFloat(post);
      var pp;
      var pso = strClass[tabStrings - 1].slice(1,2);//top string class number     
      var sp = stringPitch[strClass[tabStrings - 1 - line]];
      var ps = pitchShift[strClass[tabStrings - 1 - line].slice(1,2) - pso + 1];
      if (sp.length === 2) {
        pp = [];
        pp[0] = k + sp[0] + ps + capoShift;
        pp[1] = k + sp[1] + ps + capoShift;
      }
      else pp = k + sp + ps + capoShift;
      singleThing = pp;
      if (pp) document.getElementById("notePlay").click();//hidden button event
    }
  }

  function delCol() {
    keysDown = 0;
    //delete on all strings lines with 46 del
    var tabLines = [];
    var tabDel = "";
    var i;
    if (cursorPos >= tabSplit[0].length) {
      event.preventDefault();
      return;
    }
    if ((barFrom === "Lyr" || barFrom === "Off") 
        && tabSplit[0][cursorPos] === "|") {
      event.preventDefault();
      return;
    }
    for (i = 0; i < tabStrings; i++) {
      tabLines[i] =
        tabSplit[i].slice(0, cursorPos) +
        tabSplit[i].slice(cursorPos + 1);
      tabDel += (i < tabStrings - 1) ? tabLines[i] + "\n" : tabLines[i] + extendTail;
    }
    tabArea.value = tabDel;
    tabArea2.value = tabArea.value;
    setSelStart = cursorWhere - cursorLine;
    setSelEnd = setSelStart;
    if (barFrom === "Off") {
      navKey = true;
      thisBarIns();
    }
    noteSelect(cursorPos, cursorPos);
  }

  function bkspCol() {
    keysDown = 0;
    var tabLines = [];
    var tabDel = "";
    var i;
    charShift = -1;   
    if ((barFrom === "Lyr" || barFrom === "Off")  &&
        tabSplit[0][cursorPos - 1] === "|"){
      charShift =0;
      return;
    } 
    for (i = 0; i < tabStrings; i++) {
      tabLines[i] =
        tabSplit[i].slice(0, cursorPos - 1) + tabSplit[i].slice(cursorPos);
      tabDel += (i < tabStrings - 1) ? tabLines[i] + "\n" : tabLines[i] + extendTail;
    }
    tabArea.value = tabDel;
    tabArea2.value = tabArea.value;
    setSelStart = cursorWhere - cursorLine - 1;
    setSelEnd = setSelStart;
    if (barFrom === "Off") {
      navKey = true;
      thisBarIns();
    }
    selStart = cursorPos - 1;
    selEnd =selStart;    
  }

  function insCol() {
    if (!paused) {//use spacebar to stop
      document.getElementById("play").click();
      paused = true;
      return;
    }
    keysDown = 0;
    var tabLines = [];
    var tabDel = "";
    var i;
    charShift = 1;    
    for (i = 0; i < tabStrings; i++) {
      tabLines[i] =
        tabSplit[i].slice(0, cursorPos) + "-" + tabSplit[i].slice(cursorPos);
      tabDel += (i < tabStrings - 1) ? tabLines[i] + "\n" : tabLines[i] + extendTail;
    }
    tabArea.value = tabDel;
    tabArea2.value = tabArea.value;
    setSelStart = cursorWhere + cursorLine + 1;
    setSelEnd = setSelStart;
    if (barFrom === "Off") {
      navKey = true;//undo skip
      thisBarIns();
    }
    selStart = cursorPos + 1;
    selEnd =selStart;
  }
  
  function addBar() {//measure bar insert or add to end of lines
    keysDown = 0;
    var tabLines = [];
    var tabNew = "";
    var i;
    charShift = 1;
    if (barFrom === "Lyr" || barFrom === "Off") {
      undoKey = true;
      return;
    }
    if (tabSplit[0].length - 1 === cursorPos + cursorLine) { //end
      for (i = 0; i < tabStrings; i++) {
        tabLines[i] = tabSplit[i].slice(0, cursorPos + cursorLine) + "|";
        tabNew += (i < tabStrings - 1) ? tabLines[i] + "\n" : tabLines[i] + extendTail;
      }      
    }
    else { //not at end of line
      for (i = 0; i < tabStrings; i++) {
        tabLines[i] =
          tabSplit[i].slice(0, cursorPos) + "|" + tabSplit[i].slice(cursorPos);
        tabNew += (i < tabStrings - 1) ? tabLines[i] + "\n" : tabLines[i] + extendTail;
      }
    }
    tabArea.value = tabNew;
    tabArea2.value = tabArea.value;
    setSelStart = cursorWhere + cursorLine + 1;
    setSelEnd = setSelStart;
    tabArea.setSelectionRange(setSelStart,setSelEnd);
    selStart = cursorPos + 1;
    selEnd =selStart;    
  }
  
  function dotDown() {
    dnArrow();
  }
  
  function commaLeft() {
    leftArrow();    
  }

  function noDownlink() {
    var oldLink = document.getElementById("out").querySelector("a");
    if (oldLink) {
      window.URL.revokeObjectURL(oldLink.href);
      document.getElementById("out").value = "";
    }
  }
  
  function makeOffline(){
    songHtml = false;
    saveFile();
  }  
  
  function saveTextFile() {
    var data = collectData();//[whatString,tabString,appData,lyricString]
    var text = data[0] + ":\n\n" + data[1] + "\n\n" + JSON.stringify(data[2]) + "\n\nLyrics:\n" +  data[3];
    var temp = document.createElement('a');
    temp.setAttribute('href', 'data:text;charset=utf-8,' +
      encodeURIComponent(text));
    var fn = "CT_" + saveName.value.split(" ")[0] + ".txt"; //filename
    temp.setAttribute('download', fn);
    temp.style.display = 'none';
    document.body.appendChild(temp);
    temp.click();
    document.body.removeChild(temp);
  }  

  function saveFile() {
    var trans = document.getElementById("makefiles")
    var sbd = document.getElementById("showdebugs");
    if (sbd) trans.removeChild(sbd);
    var edb = document.getElementById("debugtimes");
    if (edb) document.body.removeChild(edb);    
    var fin = document.getElementById("fileinput");
    if (fin) trans.removeChild(fin);
    var fin2 = document.getElementById("fileinput2");
    if (fin2) trans.removeChild(fin2);   
    var mk = document.getElementById("make");
    if (mk) trans.removeChild(mk);    
    var lc = document.getElementById("lcss");
    if (lc) document.head.removeChild(lc);
    var lj = document.getElementById("ljs");
    if (lj) document.head.removeChild(lj);
    var lj2 = document.getElementById("ljs2");
    if (lj2) document.head.removeChild(lj2);    
    if(songHtml) document.getElementById("nonPrint").style.display = "none";
    if(songHtml) document.getElementById("editButton").style.display = "block";
    var jsf = document.getElementById("scriptSrc").value;
    var jsf2 = document.getElementById("scriptSrc2").value;    
    var js = document.getElementById("jScript");
    js.innerHTML = jsf + jsf2 + js.innerHTML;
    var ts = document.getElementById("tabSave");
    if (ts) document.body.removeChild(ts);
    var ls = document.getElementById("lyricSave");
    if (ls) document.body.removeChild(ls);
    var tu = document.getElementById("tuneSave");
    if (tu) document.body.removeChild(tu);
    var ss = document.getElementById("stringSave");
    if (ss) document.body.removeChild(ss);
    var sn = document.getElementById("songSave");
    if (sn) document.body.removeChild(sn);
    var ins = document.getElementById("instSave");
    if (ins) document.body.removeChild(ins);
    var ltr = document.getElementById("ltrSave");
    if (ltr) document.body.removeChild(ltr);
    var tempo = document.getElementById("tempo");
    var tsv = document.getElementById("temposave");
    if (tsv) document.body.removeChild(tsv);
    var psv = document.getElementById("pitchsave");
    if (psv) document.body.removeChild(psv);
    var psh = "<textarea id='pitchsave' style='display:none'>" +
      pitchShift + "</textarea>";    
    var bpm = "<textarea id='temposave' style='display:none'>" +
      tempo.value + "</textarea>";
    var tab = "<textarea id='tabSave' style='display:none'>" +
      tabArea.value + "</textarea>";
    var lyr = "<textarea id='lyricSave' style='display:none'>" +
      lyricArea.value + "</textarea>";
    var tun = "<textarea id='tuneSave' style='display:none'>" +
      tuneArea.value + "</textarea>";
    var str = "<textarea id='stringSave' style='display:none'>" +
      document.getElementById("numStrings").value + "</textarea>";
    var instTxt = "Guitar";
    if (document.getElementById("instr"))
      instTxt = document.getElementById("instr").innerHTML;
    var fn = tabTitle.innerText + ".html"; //filename    
    var song = "<div id='songSave' style='display:none'>" + tabTitle.innerText + "</div>";
    var lett = "<div id='ltrSave' style='display:none'>" + lyricLtrSpace + "</div>";
    var inst = "<div id='instSave' style='display:none'>" + instTxt + "</div>";
    
    var hh = `<!DOCTYPE html>
<html>
<head>`;
    var hb = `
</head>
<body>`
    var bh = `
</body>
</html>`;
    document.title = tabTitle.innerText;
    var head = hh + document.querySelector("head").innerHTML.trim();
    var body = hb + document.querySelector("body").innerHTML.trim();
    var text = head + body + tab + lyr + song + tun + str + inst + lett + bpm + psh + bh;
    var temp = document.createElement('a');
    temp.setAttribute('href', 'data:text/html;charset=utf-8,' +
      encodeURIComponent(text));
    if (fn === "") fn = "ColorTab.html";
    if (!songHtml) fn = "index.html";
    temp.setAttribute('download', fn);
    temp.style.display = 'none';
    document.body.appendChild(temp);
    temp.click();
    document.body.removeChild(temp);
    document.getElementById("nonPrint").style.display = "block";
    document.getElementById("editButton").style.display = "none";
  }

  function barsNg(i) {
    var msg = `<h2>Measure |'s not aligned</h2>        ----|-----------|------
        ----|-----------|------
        ----|------------|-----
        ----|-----------|------
        ----|-----------|------
        ----|-----------|------

<button class="toggle off"> | </button> to ignore and stop error messages,
see the Help Etc. section
`
    lyricBarsFromTab();
    var nearBar = barNumb.innerHTML.slice(i - 2, i + 6).trim();
    var loc = "First problem found at column " + i + " near measure " + nearBar;
    document.getElementById("message").innerHTML = msg + loc;
    document.getElementById("msgdiv").style.display = "block";
    document.getElementById("msgdiv").focus();
  }

  function stringNames() {
    var i, strSplit = [],
      strText =
      ` e|
 B|
 G|
 D|
 A|
 E|`;
    // initialize startTab
    strSplit = strText.split("\n");
    for (i = 0; i < 6; i++) {
      startTab[i] = strSplit[i];
    }
    return strText;
  } // default line start

  function greenSleeves() {
    var txt =
      ` e|---|------0--10-|----Em---------|-------------|----------|-------0--10-|----Em---------|----------------|--------|-3--3--1-0-|G---Em-------|---F----------|E--------|3--3--2-0-|G---Em------|--------------|-----|
 B|---|-1--3---------|-3-0------0-|1------------|-0--------|-1--3---------|-3--0------0-|1---0----------|--------|-1-----------|-3--0----0-|1-------------|-0-------|------------|-3--0---0-|1--0---------|------|
 G|-2|---------------|-------0-2----|---2-2-1-2|---1--2-|---------------|-------0-2----|------2-1----1|--2--2--|-0-----------|------0-2---|--2-2--1-2-|----1---|------------|-----0--2--|----2-1---1-|2--2--|
 D|----|---------------|---------------|-------------|----2-----|---------------|---------------|------------4--|--------|-2-----------|-------------|--------------|------2--|------------|------------|----------4--|------|
 A|₁₀₀|-0----0-----|G--------------|0--F-0----|E---------|-0----0-----|G--------------|0-----E-------|--0-0-|-3-3------|-------------|0------------|---------|3-3------|------------|0-----------|0-0-|
 E|---|-Am------------|-3----0-----|Am-----------|-0-0----|-Am------------|-3----0-----|Am-------0----|Am------|-C----------|-3---0----|Am---1------|-0---0-|C-----------|-3--0----|Am---E-0----|------|`;
    newLines = txt.split("\n");
    append = false;
    ctabOut.innerHTML = "";
    findTab();
    tabTitle.innerText = "Greensleeves";
  }
  
}());
/*
https://github.com/keithxemi/ColorTab/blob/master/LICENSE

MIT License

Copyright (c) 2021 Keith Edward Thomas

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


Portions of soundfont-player and its dependencies are included in ColorTab under this license:

https://github.com/danigb/soundfont-player/blob/master/LICENSE
The MIT License

Copyright (c) 2015 Daniel Gómez Blasco <danigb@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

!function(){return function e(t,n,r){function o(a,u){if(!n[a]){if(!t[a]){var s="function"==typeof require&&require;if(!u&&s)return s(a,!0);if(i)return i(a,!0);var c=new Error("Cannot find module '"+a+"'");throw c.code="MODULE_NOT_FOUND",c}var f=n[a]={exports:{}};t[a][0].call(f.exports,function(e){return o(t[a][1][e]||e)},f,f.exports,e,t,n,r)}return n[a].exports}for(var i="function"==typeof require&&require,a=0;a<r.length;a++)o(r[a]);return o}}()({1:[function(e){e("soundfont-player")},{"soundfont-player":15}],2:[function(e,t){t.exports=function(e){var t=e.createGain(),i=t._voltage=function(e){var t=e.createBufferSource(),n=e.createBuffer(1,2,e.sampleRate);return n.getChannelData(0).set(r),t.buffer=n,t.loop=!0,t}(e),a=o(i),u=o(i),s=o(i);return t._startAmount=o(u),t._endAmount=o(s),t._multiplier=o(a),t._multiplier.connect(t),t._startAmount.connect(t),t._endAmount.connect(t),t.value=a.gain,t.startValue=u.gain,t.endValue=s.gain,t.startValue.value=0,t.endValue.value=0,Object.defineProperties(t,n),t};var n={attack:{value:0,writable:!0},decay:{value:0,writable:!0},sustain:{value:1,writable:!0},release:{value:0,writable:!0},getReleaseDuration:{value:function(){return this.release}},start:{value:function(e){var t=this._multiplier.gain,n=this._startAmount.gain,r=this._endAmount.gain;this._voltage.start(e),this._decayFrom=this._decayFrom=e+this.attack,this._startedAt=e;var o=this.sustain;t.cancelScheduledValues(e),n.cancelScheduledValues(e),r.cancelScheduledValues(e),r.setValueAtTime(0,e),this.attack?(t.setValueAtTime(0,e),t.linearRampToValueAtTime(1,e+this.attack),n.setValueAtTime(1,e),n.linearRampToValueAtTime(0,e+this.attack)):(t.setValueAtTime(1,e),n.setValueAtTime(0,e)),this.decay&&t.setTargetAtTime(o,this._decayFrom,i(this.decay))}},stop:{value:function(e,t){t&&(e-=this.release);var n=e+this.release;if(this.release){var r=this._multiplier.gain,o=this._startAmount.gain,a=this._endAmount.gain;r.cancelScheduledValues(e),o.cancelScheduledValues(e),a.cancelScheduledValues(e);var u=i(this.release);if(this.attack&&e<this._decayFrom){var s=function(e,t,n,r,o){var i=e+(o-n)/(r-n)*(t-e);i<=e&&(i=e);i>=t&&(i=t);return i}(0,1,this._startedAt,this._decayFrom,e);r.linearRampToValueAtTime(s,e),o.linearRampToValueAtTime(1-s,e),o.setTargetAtTime(0,e,u)}a.setTargetAtTime(1,e,u),r.setTargetAtTime(0,e,u)}return this._voltage.stop(n),n}},onended:{get:function(){return this._voltage.onended},set:function(e){this._voltage.onended=e}}},r=new Float32Array([1,1]);function o(e){var t=e.context.createGain();return e.connect(t),t}function i(e){return Math.log(e+1)/Math.log(100)}},{}],3:[function(e,t){"use strict";t.exports={decode:function(e,t){for(var n,r,o,i=e.replace(/[^A-Za-z0-9\+\/]/g,""),a=i.length,u=t?Math.ceil((3*a+1>>2)/t)*t:3*a+1>>2,s=new Uint8Array(u),c=0,f=0,l=0;l<a;l++)if(r=3&l,c|=((o=i.charCodeAt(l))>64&&o<91?o-65:o>96&&o<123?o-71:o>47&&o<58?o+4:43===o?62:47===o?63:0)<<18-6*r,3===r||a-l==1){for(n=0;n<3&&f<u;n++,f++)s[f]=c>>>(16>>>n&24)&255;c=0}return s}}},{}],4:[function(e,t){"use strict";t.exports=function(e,t){return new Promise(function(n,r){var o=new XMLHttpRequest;t&&(o.responseType=t),o.open("GET",e),o.onload=function(){200===o.status?n(o.response):r(Error(o.statusText))},o.onerror=function(){r(Error("Network Error"))},o.send()})}},{}],5:[function(e,t){"use strict";var n=e("./base64"),r=e("./fetch");function o(e){return function(t){return"string"==typeof t&&e.test(t)}}function i(e,t){return"string"==typeof e?e+t:"function"==typeof e?e(t):t}function a(e,t,n,r){var o=t instanceof ArrayBuffer?u:s(t)?c:function(e){return e&&"function"==typeof e.then}(t)?f:l(t)?d:function(e){return e&&"object"==typeof e}(t)?p:h(t)?m:v(t)?y:g(t)?b:null;return o?o(e,t,n||{}):r?Promise.resolve(r):Promise.reject("Source not valid ("+t+")")}function u(e,t){return new Promise(function(n,r){e.decodeAudioData(t,function(e){n(e)},function(){r("Can't decode audio data ("+t.slice(0,30)+"...)")})})}a.fetch=r;var s=o(/\.(mp3|wav|ogg)(\?.*)?$/i);function c(e,t,n){var r=i(n.from,t);return a(e,a.fetch(r,"arraybuffer"),n)}function f(e,t,n){return t.then(function(t){return a(e,t,n)})}var l=Array.isArray;function d(e,t,n){return Promise.all(t.map(function(t){return a(e,t,n,t)}))}function p(e,t,n){var r={},o=Object.keys(t).map(function(o){if(n.only&&-1===n.only.indexOf(o))return null;var i=t[o];return a(e,i,n,i).then(function(e){r[o]=e})});return Promise.all(o).then(function(){return r})}var h=o(/\.json(\?.*)?$/i);function m(e,t,n){var r=i(n.from,t);return a(e,a.fetch(r,"text").then(JSON.parse),n)}var v=o(/^data:audio/);function y(e,t,r){var o=t.indexOf(",");return a(e,n.decode(t.slice(o+1)).buffer,r)}var g=o(/\.js(\?.*)?$/i);function b(e,t,n){var r=i(n.from,t);return a(e,a.fetch(r,"text").then(T),n)}function T(e){var t=e.indexOf("MIDI.Soundfont.");if(t<0)throw Error("Invalid MIDI.js Soundfont format");t=e.indexOf("=",t)+2;var n=e.lastIndexOf(",");return JSON.parse(e.slice(t,n)+"}")}"object"==typeof t&&t.exports&&(t.exports=a),"undefined"!=typeof window&&(window.loadAudio=a)},{"./base64":3,"./fetch":4}],6:[function(e,t,n){(function(r){(function(){!function(e){if("object"==typeof n&&void 0!==t)t.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).midimessage=e()}}(function(){return function t(n,r,o){function i(u,s){if(!r[u]){if(!n[u]){var c="function"==typeof e&&e;if(!s&&c)return c(u,!0);if(a)return a(u,!0);var f=new Error("Cannot find module '"+u+"'");throw f.code="MODULE_NOT_FOUND",f}var l=r[u]={exports:{}};n[u][0].call(l.exports,function(e){var t=n[u][1][e];return i(t||e)},l,l.exports,t,n,r,o)}return r[u].exports}for(var a="function"==typeof e&&e,u=0;u<o.length;u++)i(o[u]);return i}({1:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e){return new function(e){if(this._event=e,this._data=e.data,this.receivedTime=e.receivedTime,!(this._data&&this._data.length<2))switch(this._messageCode=240&e.data[0],this.channel=15&e.data[0],this._messageCode){case 128:this.messageType="noteoff",this.key=127&e.data[1],this.velocity=127&e.data[2];break;case 144:this.messageType="noteon",this.key=127&e.data[1],this.velocity=127&e.data[2];break;case 160:this.messageType="keypressure",this.key=127&e.data[1],this.pressure=127&e.data[2];break;case 176:this.messageType="controlchange",this.controllerNumber=127&e.data[1],this.controllerValue=127&e.data[2],120===this.controllerNumber&&0===this.controllerValue?this.channelModeMessage="allsoundoff":121===this.controllerNumber?this.channelModeMessage="resetallcontrollers":122===this.controllerNumber?0===this.controllerValue?this.channelModeMessage="localcontroloff":this.channelModeMessage="localcontrolon":123===this.controllerNumber&&0===this.controllerValue?this.channelModeMessage="allnotesoff":124===this.controllerNumber&&0===this.controllerValue?this.channelModeMessage="omnimodeoff":125===this.controllerNumber&&0===this.controllerValue?this.channelModeMessage="omnimodeon":126===this.controllerNumber?this.channelModeMessage="monomodeon":127===this.controllerNumber&&(this.channelModeMessage="polymodeon");break;case 192:this.messageType="programchange",this.program=e.data[1];break;case 208:this.messageType="channelpressure",this.pressure=127&e.data[1];break;case 224:this.messageType="pitchbendchange";var t=127&e.data[2],n=127&e.data[1];this.pitchBend=(t<<8)+n}}(e)},t.exports=n.default},{}]},{},[1])(1)})}).call(this)}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],7:[function(e,t,n){var r,o;r=this,o=function(e){"use strict";function t(e,t){return Array(t+1).join(e)}function n(e){return"number"==typeof e}function r(e,t){return Math.pow(2,(e-69)/12)*(t||440)}function o(e,t,n){if("string"!=typeof e)return null;var o=s.exec(e);if(!o||!t&&o[4])return null;var i={letter:o[1].toUpperCase(),acc:o[2].replace(/x/g,"##")};i.pc=i.letter+i.acc,i.step=(i.letter.charCodeAt(0)+3)%7,i.alt="b"===i.acc[0]?-i.acc.length:i.acc.length;var a=c[i.step]+i.alt;return i.chroma=a<0?12+a:a%12,o[3]&&(i.oct=+o[3],i.midi=a+12*(i.oct+1),i.freq=r(i.midi,n)),t&&(i.tonicOf=o[4]),i}function i(e){return n(e)?e<0?t("b",-e):t("#",e):""}function a(e){return n(e)?""+e:""}function u(e){if((n(e)||function(e){return"string"==typeof e}(e))&&e>=0&&e<128)return+e;var t=o(e);return t&&function(e){return void 0!==e}(t.midi)?t.midi:null}var s=/^([a-gA-G])(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)\s*$/,c=[0,2,4,5,7,9,11],f="CDEFGAB";e.regex=function(){return s},e.parse=o,e.build=function e(t,n,r){return null==t?null:t.step?e(t.step,t.alt,t.oct):t<0||t>6?null:f.charAt(t)+i(n)+a(r)},e.midi=u,e.freq=function(e,t){var n=u(e);return null===n?null:r(n,t)},e.letter=function(e){return(o(e)||{}).letter},e.acc=function(e){return(o(e)||{}).acc},e.pc=function(e){return(o(e)||{}).pc},e.step=function(e){return(o(e)||{}).step},e.alt=function(e){return(o(e)||{}).alt},e.chroma=function(e){return(o(e)||{}).chroma},e.oct=function(e){return(o(e)||{}).oct}},"object"==typeof n&&void 0!==t?o(n):"function"==typeof define&&define.amd?define(["exports"],o):o(r.NoteParser=r.NoteParser||{})},{}],8:[function(e,t){t.exports=function(e){return e.on=function(t,n){if(1===arguments.length&&"function"==typeof t)return e.on("event",t);var r,o,i="on"+t,a=e[i];return e[i]=a?(r=a,o=n,function(e,t,n,i){r(e,t,n,i),o(e,t,n,i)}):n,e},e}},{}],9:[function(e,t){"use strict";var n=e("./player"),r=e("./events"),o=e("./notes"),i=e("./scheduler"),a=e("./midi");function u(e,t,u){return a(i(o(r(n(e,t,u)))))}"object"==typeof t&&t.exports&&(t.exports=u),"undefined"!=typeof window&&(window.SamplePlayer=u)},{"./events":8,"./midi":10,"./notes":11,"./player":12,"./scheduler":13}],10:[function(e,t){var n=e("midimessage");t.exports=function(e){return e.listenToMidi=function(t,r){var o={},i=r||{},a=i.gain||function(e){return e/127};return t.onmidimessage=function(t){var r=t.messageType?t:n(t);if("noteon"===r.messageType&&0===r.velocity&&(r.messageType="noteoff"),!i.channel||r.channel===i.channel)switch(r.messageType){case"noteon":o[r.key]=e.play(r.key,0,{gain:a(r.velocity)});break;case"noteoff":o[r.key]&&(o[r.key].stop(),delete o[r.key])}},e},e}},{midimessage:6}],11:[function(e,t){"use strict";var n=e("note-parser"),r=function(e){return function(e){return null!==e&&e!==[]&&e>=0&&e<129}(e)?+e:n.midi(e)};t.exports=function(e){if(e.buffers){var t=e.opts.map,n="function"==typeof t?t:r,o=function(e){return e?n(e)||e:null};e.buffers=function(e,t){return Object.keys(e).reduce(function(n,r){return n[t(r)]=e[r],n},{})}(e.buffers,o);var i=e.start;e.start=function(e,t,n){var r=o(e),a=r%1;return a&&(r=Math.floor(r),n=Object.assign(n||{},{cents:Math.floor(100*a)})),i(r,t,n)}}return e}},{"note-parser":14}],12:[function(e,t){"use strict";var n=e("adsr"),r={},o={gain:3,attack:.01,decay:.1,sustain:.9,release:.3,loop:!1,cents:0,loopStart:0,loopEnd:0};function i(e){return"number"==typeof e}var a=["attack","decay","sustain","release"];t.exports=function(e,t,u){var s=0,c={},f=e.createGain();f.gain.value=1;var l=Object.assign({},o,u),d={context:e,out:f,opts:l};return t instanceof AudioBuffer?d.buffer=t:d.buffers=t,d.start=function(t,n,o){if(d.buffer&&null!==t)return d.start(null,t,n);var i=t?d.buffers[t]:d.buffer,a=o||r;n=Math.max(e.currentTime,n||0),d.emit("start",n,t,a);var u=p(t,i,a);return u.id=function(t,n){return n.id=s++,c[n.id]=n,n.source.onended=function(){var t=e.currentTime;n.source.disconnect(),n.env.disconnect(),n.disconnect(),d.emit("ended",t,n.id,n)},n.id}(0,u),u.env.start(n),u.source.start(n),d.emit("started",n,u.id,u),a.duration&&u.stop(n+a.duration),u},d.play=function(e,t,n){return d.start(e,t,n)},d.stop=function(e,t){var n;return(t=t||Object.keys(c)).map(function(t){return(n=c[t])?(n.stop(e),n.id):null})},d.connect=function(e){return f.connect(e),d},d.emit=function(e,t,n,r){d.onevent&&d.onevent(e,t,n,r);var o=d["on"+e];o&&o(t,n,r)},d;function p(t,r,o){var u,s=e.createGain();return s.gain.value=0,s.connect(f),s.env=function(e,t,r){var o=n(e),u=t.adsr||r.adsr;return a.forEach(function(e,n){o[e]=u?u[n]:t[e]||r[e]}),o.value.value=i(t.gain)?t.gain:i(r.gain)?r.gain:1,o}(e,o,l),s.env.connect(s.gain),s.source=e.createBufferSource(),s.source.buffer=r,s.source.connect(s),s.source.loop=o.loop||l.loop,s.source.playbackRate.value=(u=o.cents||l.cents)?Math.pow(2,u/1200):1,s.source.loopStart=o.loopStart||l.loopStart,s.source.loopEnd=o.loopEnd||l.loopEnd,s.stop=function(n){var r=n||e.currentTime;d.emit("stop",r,t);var o=s.env.stop(r);s.source.stop(o)},s}}},{adsr:2}],13:[function(e,t){"use strict";var n=Array.isArray,r={};t.exports=function(e){return e.schedule=function(t,o){var i,a,u,s,c=e.context.currentTime,f=t<c?c:t;return e.emit("schedule",f,o),o.map(function(t){return t?(n(t)?(i=t[0],a=t[1]):(i=t.time,a=t),!function(e){return e&&"object"==typeof e}(a)?(u=a,s=r):(u=a.name||a.key||a.note||a.midi||null,s=a),e.start(u,f+(i||0),s)):null})},e}},{}],14:[function(e,t){"use strict";var n=/^([a-gA-G])(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)\s*$/;var r=[0,2,4,5,7,9,11];function o(e,t,o){if("string"!=typeof e)return null;var a=n.exec(e);if(!a||!t&&a[4])return null;var u={letter:a[1].toUpperCase(),acc:a[2].replace(/x/g,"##")};return u.pc=u.letter+u.acc,u.step=(u.letter.charCodeAt(0)+3)%7,u.alt="b"===u.acc[0]?-u.acc.length:u.acc.length,u.chroma=r[u.step]+u.alt,a[3]&&(u.oct=+a[3],u.midi=u.chroma+12*(u.oct+1),u.freq=i(u.midi,o)),t&&(u.tonicOf=a[4]),u}function i(e,t){return Math.pow(2,(e-69)/12)*(t||440)}var a={parse:o,regex:function(){return n},midiToFreq:i};["letter","acc","pc","step","alt","chroma","oct","midi","freq"].forEach(function(e){a[e]=function(t){var n=o(t);return n&&void 0!==n[e]?n[e]:null}}),t.exports=a},{}],15:[function(e,t){"use strict";var n=e("audio-loader"),r=e("sample-player");function o(e){return/\.js(\?.*)?$/i.test(e)}function i(e,t,n){return"offline"===e?offline:"https://gleitz.github.io/midi-js-soundfonts/"+e+"-"+(n="ogg"===n?n:"mp3")+".js"}var a=e("./legacy");a.instrument=function e(t,a,u){if(1===arguments.length)return function(n,r){return e(t,n,r)};var s=u||{},c=s.isSoundfontURL||o,f=s.nameToUrl||i,l=c(a)?a:f(a,s.soundfont,s.format);return n(t,l,{only:s.only||s.notes}).then(function(e){var n=r(t,e,s).connect(s.destination?s.destination:t.destination);return n.url=l,n.name=a,n})},a.nameToUrl=i,"object"==typeof t&&t.exports&&(t.exports=a),"undefined"!=typeof window&&(window.Soundfont=a)},{"./legacy":16,"audio-loader":5,"sample-player":9}],16:[function(e,t){"use strict";var n=e("note-parser");function r(e,t){if(!(this instanceof r))return new r(e);this.nameToUrl=t||r.nameToUrl,this.ctx=e,this.instruments={},this.promises=[]}function o(e,t){return t=t||{},function(r,o,i,a){var u=r>0&&r<129?+r:n.midi(r),s=u?n.midiToFreq(u,440):null;if(s){i=i||.2;var c=(a=a||{}).destination||t.destination||e.destination,f=a.vcoType||t.vcoType||"sine",l=a.gain||t.gain||.4,d=e.createOscillator();d.type=f,d.frequency.value=s;var p=e.createGain();return p.gain.value=l,d.connect(p),p.connect(c),d.start(o),i>0&&d.stop(o+i),d}}}r.prototype.onready=function(e){Promise.all(this.promises).then(e)},r.prototype.instrument=function(e,t){var n=this.ctx;if((e=e||"default")in this.instruments)return this.instruments[e];var i={name:e,play:o(n,t)};if(this.instruments[e]=i,"default"!==e){var a=r.instrument(n,e,t).then(function(e){return i.play=e.play,i});this.promises.push(a),i.onready=function(e){a.then(e)}}else i.onready=function(e){e()};return i},r.loadBuffers=function(e,t,n){return r.instrument(e,t,n).then(function(e){return e.buffers})},r.noteToMidi=n.midi,t.exports=r},{"note-parser":7}]},{},[1]);
/* end of code from soundfont-player*/

/* Portions of https://github.com/jazz-soft/JZZ and https://github.com/jazz-soft/JZZ-midi-SMF are included in ColorTab under this license:

The MIT License

Copyright (c) 2021 Sema Kachalo https://jazz-soft.net/sema/

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
!function(t,r){t.JZZ=function(){var t,r;function n(t,r){for(var n in t)t.hasOwnProperty(n)&&r.call(this,n)}function o(t){if(t!=parseInt(t)||t<0||t>15)throw RangeError("Bad channel value (must not be less than 0 or more than 15): "+t)}var e={};function i(t){var o,e=this instanceof i?this:e=new i;if(t instanceof i)return e._from=t._from.slice(),n(t,function(r){"_from"!=r&&(e[r]=t[r])}),e;if(e._from=[],void 0===t)return e;var a=t instanceof Array?t:arguments;for(o=0;o<a.length;o++)r=a[o],1==o&&(e[0]>=128&&e[0]<=175&&(r=i.noteValue(r)),e[0]>=192&&e[0]<=207&&(r=i.programValue(r))),(r!=parseInt(r)||r<0||r>255)&&s(a[o]),e.push(r);return e}i.prototype=[],i.prototype.constructor=i;var a={};i.noteValue=function(t){return void 0===t?void 0:a[t.toString().toLowerCase()]},i.programValue=function(t){return t};var h={c:0,d:2,e:4,f:5,g:7,a:9,b:11,h:11};for(n(h,function(n){for(r=0;r<12&&!((t=h[n]+12*r)>127);r++)a[n+r]=t,t>0&&(a[n+"b"+r]=t-1,a[n+"bb"+r]=t-2),t<127&&(a[n+"#"+r]=t+1,a[n+"##"+r]=t+2)}),r=0;r<128;r++)a[r]=r;function s(t){throw RangeError("Bad MIDI value: "+t)}function f(t){return o(t),parseInt(t)}function u(t,r){return(t!=parseInt(t)||t<0||t>127)&&s(void 0===r?t:r),parseInt(t)}function c(t){return(t!=parseInt(t)||t<0||t>255)&&s(t),parseInt(t)}function p(t){return u(i.noteValue(t),t)}var d={noteOff:function(t,r,n){return void 0===n&&(n=64),[128+f(t),p(r),u(n)]},noteOn:function(t,r,n){return void 0===n&&(n=127),[144+f(t),p(r),u(n)]},aftertouch:function(t,r,n){return[160+f(t),p(r),u(n)]}},g={control:function(t,r,n){return[176+f(t),u(r),u(n)]},program:function(t,r){return[192+f(t),u(i.programValue(r),r)]}};function l(t,r){var n=new i;return n.ff=c(t),n.dd=void 0===r?"":function(t){t=""+t;for(var r=0;r<t.length;r++)t.charCodeAt(r)>255&&s(t[r]);return t}(r),n}var C={smf:function(t){if(t instanceof i)return new i(t);var r=t instanceof Array?t:arguments,n=c(r[0]),o="";return 2==r.length?o=v(r[1]):r.length>2&&(o=v(Array.prototype.slice.call(r,1))),l(n,o)},smfSeqNumber:function(t){if(t==parseInt(t)){if(t<0||t>65535)throw RangeError("Sequence number out of range: "+t);t=String.fromCharCode(t>>8)+String.fromCharCode(255&t)}else if(0==(t=""+t).length)t="\0\0";else if(1==t.length)t="\0"+t;else if(t.length>2)throw RangeError("Sequence number out of range: "+y(t));return l(0,t)},smfText:function(t){return l(1,e.lib.toUTF8(t))},smfCopyright:function(t){return l(2,e.lib.toUTF8(t))},smfSeqName:function(t){return l(3,e.lib.toUTF8(t))},smfInstrName:function(t){return l(4,e.lib.toUTF8(t))},smfLyric:function(t){return l(5,e.lib.toUTF8(t))},smfMarker:function(t){return l(6,e.lib.toUTF8(t))},smfCuePoint:function(t){return l(7,e.lib.toUTF8(t))},smfProgName:function(t){return l(8,e.lib.toUTF8(t))},smfDevName:function(t){return l(9,e.lib.toUTF8(t))},smfChannelPrefix:function(t){if(t==parseInt(t))o(t),t=String.fromCharCode(t);else if(0==(t=""+t).length)t="\0";else if(t.length>1||t.charCodeAt(0)>15)throw RangeError("Channel number out of range: "+y(t));return l(32,t)},smfxMidiPort:function(t){if(t==parseInt(t)){if(t<0||t>127)throw RangeError("Port number out of range: "+t);t=String.fromCharCode(t)}else if(0==(t=""+t).length)t="\0";else if(t.length>1||t.charCodeAt(0)>127)throw RangeError("Port number out of range: "+y(t));return l(33,t)},smfEndOfTrack:function(t){if(""!=v(t))throw RangeError("Unexpected data: "+y(v(t)));return l(47)},smfTempo:function(t){if(3==(""+t).length)return l(81,t);if(t==parseInt(t)&&t>0&&t<=16777215)return l(81,String.fromCharCode(t>>16)+String.fromCharCode(t>>8&255)+String.fromCharCode(255&t));throw RangeError("Out of range: "+y(v(t)))},smfBPM:function(t){return C.smfTempo(Math.round(6e7/t))},smfTimeSignature:function(t,r,n,o){var e,i,a,h,s=(""+t).match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);if(s){if(e=parseInt(s[1]),i=parseInt(s[2]),e>0&&e<=255&&i&&!(i&i-1)){for(a=i,i=0,a>>=1;a;a>>=1)i++;return a=r==parseInt(r)?r:24,h=n==parseInt(n)?n:8,l(88,String.fromCharCode(e)+String.fromCharCode(i)+String.fromCharCode(a)+String.fromCharCode(h))}if(4==(""+t).length)return l(88,t)}else{if(t==parseInt(t)&&r==parseInt(r)&&r&&!(r&r-1)){for(e=t,i=0,a=r,a>>=1;a;a>>=1)i++;return a=n==parseInt(n)?n:24,h=o==parseInt(o)?o:8,l(88,String.fromCharCode(e)+String.fromCharCode(i)+String.fromCharCode(a)+String.fromCharCode(h))}if(4==(""+t).length)return l(88,t)}throw RangeError("Wrong time signature: "+y(v(t)))}},m={};function v(t){return t instanceof Array?function(t){for(var r="",n=0;n<t.length;n++)r+=String.fromCharCode(t[n]);return r}(t):void 0===t?"":""+t}function y(t){return t.length?": "+function(t){for(var r="",n=0;n<t.length;n++)"\n"==t[n]?r+="\\n":"\r"==t[n]?r+="\\r":"\t"==t[n]?r+="\\t":t.charCodeAt(n)<32?r+="\\x"+(((o=t.charCodeAt(n))<16?"0":"")+o.toString(16)):r+=t[n];var o;return r}(e.lib.fromUTF8(t)):""}n(C,function(t){var r,n;r=t,n=C[t],i[r]=function(){return n.apply(this,arguments)},m[r]=function(){return this.send(n.apply(this,arguments))}}),n(d,function(t){var r,n;n=d[t],i[r=t]=function(){return new i(n.apply(this,void 0===this._ch?arguments:[this._ch].concat(Array.prototype.slice.call(arguments))))},m[r]=function(){if(void 0!==this._master){var t=new i(n.apply(this,[this._master].concat(Array.prototype.slice.call(arguments))));return t._mpe=t[1],this.send(t)}return this.send(n.apply(this,void 0===this._ch?arguments:[this._ch].concat(Array.prototype.slice.call(arguments))))}}),n(g,function(t){var r,n;n=g[t],i[r=t]=function(){return new i(n.apply(this,void 0===this._ch?arguments:[this._ch].concat(Array.prototype.slice.call(arguments))))},m[r]=function(){if(void 0!==this._master){var t,r=Array.prototype.slice.call(arguments);r.length<n.length?r=[this._master].concat(r):(t=p(r[0]),r[0]=this._master);var o=new i(n.apply(this,r));return o._mpe=t,this.send(o)}return this.send(n.apply(this,void 0===this._ch?arguments:[this._ch].concat(Array.prototype.slice.call(arguments))))}}),e.MIDI=i,e.lib={},e.lib.copyMidiHelpers=function(t){n(m,function(r){t.prototype[r]=m[r]})};var S="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";return e.lib.toBase64=function(t){var r,n,o,e,i,a=0,h=0,s="",f=[];if(!t)return t;do{r=(i=t.charCodeAt(a++)<<16|t.charCodeAt(a++)<<8|t.charCodeAt(a++))>>18&63,n=i>>12&63,o=i>>6&63,e=63&i,f[h++]=S.charAt(r)+S.charAt(n)+S.charAt(o)+S.charAt(e)}while(a<t.length);s=f.join("");var u=t.length%3;return u?s.slice(0,u-3)+"===".slice(u):s},e.lib.toUTF8=function(t){t=void 0===t?"":""+t;var r,n,o="";for(r=0;r<t.length;r++)(n=t.charCodeAt(r))<128?o+=t[r]:n<2048?(o+=String.fromCharCode(192+(n>>6)),o+=String.fromCharCode(128+(63&n))):n<65536?(o+=String.fromCharCode(224+(n>>12)),o+=String.fromCharCode(128+(n>>6&63)),o+=String.fromCharCode(128+(63&n))):(o+=String.fromCharCode(240+(n>>18)),o+=String.fromCharCode(128+(n>>12&63)),o+=String.fromCharCode(128+(n>>6&63)),o+=String.fromCharCode(128+(63&n)));return o},e}()}(this),function(t){if(!t.MIDI.SMF){a.prototype=[],a.prototype.constructor=a,a.prototype.copy=function(){var t=new a;t.type=this.type,t.ppqn=this.ppqn,t.fps=this.fps,t.ppf=this.ppf,t.rmi=this.rmi,t.ntrk=this.ntrk;for(var r=0;r<this.length;r++)t.push(this[r].copy());return t},a.prototype._complain=function(t,r,n){this._warn||(this._warn=[]),this._warn.push(function(t,r,n,o){var e={off:t,msg:r,data:n};return void 0!==o&&(e.tick=o),e}(t,r,n))},a.prototype.load=function(t){var r=0;"RIFF"==t.substr(0,4)&&"RMIDdata"==t.substr(8,8)&&(this.rmi=!0,r=20,t=t.substr(20,t.charCodeAt(16)+256*t.charCodeAt(17)+65536*t.charCodeAt(18)+16777216*t.charCodeAt(19))),this.loadSMF(t,r)};var r="MThd"+String.fromCharCode(0)+String.fromCharCode(0)+String.fromCharCode(0)+String.fromCharCode(6);a.prototype.dump=function(t){var n="";if(t)return"RIFF"+i((n=this.dump()).length+12)+"RMIDdata"+i(n.length)+n;this.ntrk=0;for(var o=0;o<this.length;o++)this[o]instanceof h&&this.ntrk++,n+=this[o].dump();return n=(this.ppqn?e(this.ppqn):String.fromCharCode(256-this.fps)+String.fromCharCode(this.ppf))+n,n=r+String.fromCharCode(0)+String.fromCharCode(this.type)+e(this.ntrk)+n},a.prototype.toString=function(){var t;for(this.ntrk=0,t=0;t<this.length;t++)this[t]instanceof h&&this.ntrk++;var r=["SMF:","  type: "+this.type];for(this.ppqn?r.push("  ppqn: "+this.ppqn):r.push("  fps: "+this.fps,"  ppf: "+this.ppf),r.push("  tracks: "+this.ntrk),t=0;t<this.length;t++)r.push(this[t].toString());return r.join("\n")},a.MTrk=h,h.prototype=[],h.prototype.constructor=h,h.prototype.copy=function(){var r=new h;r.length=0;for(var n=0;n<this.length;n++)r.push(new t.MIDI(this[n]));return r},h.prototype.dump=function(){var t,r,n,e="",i=0,a="";for(t=0;t<this.length;t++)if(e+=o(this[t].tt-i),i=this[t].tt,void 0!==this[t].dd)e+="ÿ",e+=String.fromCharCode(this[t].ff),e+=o(this[t].dd.length),e+=this[t].dd;else if(240==this[t][0]||247==this[t][0])for(e+=String.fromCharCode(this[t][0]),e+=o(this[t].length-1),r=1;r<this[t].length;r++)e+=String.fromCharCode(this[t][r]);else for(this[t][0]!=a&&(a=this[t][0],e+=String.fromCharCode(this[t][0])),r=1;r<this[t].length;r++)e+=String.fromCharCode(this[t][r]);return"MTrk"+(n=e.length,String.fromCharCode(n>>24&255)+String.fromCharCode(n>>16&255)+String.fromCharCode(n>>8&255)+String.fromCharCode(255&n))+e},h.prototype.add=function(r,o){if(r=parseInt(r),(isNaN(r)||r<0)&&n("Invalid parameter"),(o=t.MIDI(o)).tt=r,this[this.length-1].tt<r&&(this[this.length-1].tt=r),47==o.ff||255==o[0])return this;var e;for(e=0;e<this.length-1&&!(this[e].tt>r);e++);return this.splice(e,0,o),this},h.prototype._ch=void 0,h.prototype._sxid=127,h.prototype._image=function(){var t=function(){};t.prototype=this._orig;var r=new t;return r._ch=this._ch,r._sxid=this._sxid,r._tick=this._tick,r},h.prototype.send=function(t){return this._orig.add(this._tick,t),this},h.prototype.tick=function(t){if(t!=parseInt(t)||t<0)throw RangeError("Bad tick value: "+t);if(!t)return this;var r=this._image();return r._tick=this._tick+t,r},h.prototype.sxId=function(t){if(void 0===t&&(t=h.prototype._sxid),t==this._sxid)return this;if(t!=parseInt(t)||t<0||t>127)throw RangeError("Bad MIDI value: "+t);var r=this._image();return r._sxid=t,r},h.prototype.ch=function(t){if(t==this._ch||void 0===t&&void 0===this._ch)return this;if(void 0!==t&&(t!=parseInt(t)||t<0||t>15))throw RangeError("Bad channel value: "+t+" (must be from 0 to 15)");var r=this._image();return r._ch=t,r},h.prototype.note=function(t,r,n,o){return this.noteOn(t,r,n),void 0===this._ch?o>0&&this.tick(o).noteOff(t,r):n>0&&this.tick(n).noteOff(t),this},t.lib.copyMidiHelpers(h),t.MIDI.SMF=a}function n(t){throw new Error(t)}function o(t){var r="";return t>2097151&&(r+=String.fromCharCode(128+(t>>21&127))),t>16383&&(r+=String.fromCharCode(128+(t>>14&127))),t>127&&(r+=String.fromCharCode(128+(t>>7&127))),r+=String.fromCharCode(127&t)}function e(t){return String.fromCharCode(t>>8)+String.fromCharCode(255&t)}function i(t){return String.fromCharCode(255&t)+String.fromCharCode(t>>8&255)+String.fromCharCode(t>>16&255)+String.fromCharCode(t>>24&255)}function a(){var t,r,o=this instanceof a?this:o=new a,e=1,i=96;if(1==arguments.length){if(arguments[0]instanceof a)return arguments[0].copy();if("string"==typeof arguments[0]&&"0"!=arguments[0]&&"1"!=arguments[0]&&"2"!=arguments[0])return o.load(arguments[0]),o;e=parseInt(arguments[0])}else 2==arguments.length?(e=parseInt(arguments[0]),i=parseInt(arguments[1])):3==arguments.length?(e=parseInt(arguments[0]),t=parseInt(arguments[1]),r=parseInt(arguments[2])):arguments.length&&n("Invalid parameters");return(isNaN(e)||e<0||e>2)&&n("Invalid parameters"),o.type=e,void 0===t?((isNaN(i)||i<0||i>65535)&&n("Invalid parameters"),o.ppqn=i):(24!=t&&25!=t&&29!=t&&30!=t&&n("Invalid parameters"),(isNaN(r)||r<0||r>255)&&n("Invalid parameters"),o.fps=t,o.ppf=r),o}function h(t){this._orig=this,this._tick=0,void 0!==t||this.push(new s(0,"ÿ/",""))}function s(r,n,o,e){var i;if(255==n.charCodeAt(0))i=t.MIDI.smf(n.charCodeAt(1),o);else{for(var a=[n.charCodeAt(0)],h=0;h<o.length;h++)a.push(o.charCodeAt(h));i=t.MIDI(a)}return void 0!==e&&(i._off=e),i.tt=r,i}}(JZZ);

/*
https://github.com/dankogai/js-deflate

 * $Id: rawinflate.js,v 0.4 2014/03/01 21:59:08 dankogai Exp dankogai $
 *
 * GNU General Public License, version 2 (GPL-2.0)
 *   http://opensource.org/licenses/GPL-2.0
 * original:
 *   http://www.onicos.com/staff/iz/amuse/javascript/expert/inflate.txt
 */

  /* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
   * Version: 1.0.0.1
   * LastModified: Dec 25 1999
   */
 var zip_slide,zip_wp,zip_fixed_td,zip_fixed_bl,zip_fixed_bd,zip_bit_buf,zip_bit_len,zip_method,zip_eof,zip_copy_leng,zip_copy_dist,zip_tl,zip_td,zip_bl,zip_bd,zip_inflate_data,zip_inflate_pos,zip_WSIZE=32768,zip_STORED_BLOCK=0,zip_lbits=9,zip_dbits=6,zip_fixed_tl=null,zip_MASK_BITS=new Array(0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535),zip_cplens=new Array(3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0),zip_cplext=new Array(0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,99,99),zip_cpdist=new Array(1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577),zip_cpdext=new Array(0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13),zip_border=new Array(16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15),zip_HuftList=function(){this.next=null,this.list=null},zip_HuftNode=function(){this.e=0,this.b=0,this.n=0,this.t=null},zip_HuftBuild=function(i,_,p,t,z,e){this.BMAX=16,this.N_MAX=288,this.status=0,this.root=null,this.m=0;var n,r,l,f,o,s,u,d,a,T,B,S,E,I,b,c,h,D=new Array(this.BMAX+1),w=new Array(this.BMAX+1),y=new zip_HuftNode,M=new Array(this.BMAX),A=new Array(this.N_MAX),x=new Array(this.BMAX+1);for(h=this.root=null,s=0;s<D.length;s++)D[s]=0;for(s=0;s<w.length;s++)w[s]=0;for(s=0;s<M.length;s++)M[s]=null;for(s=0;s<A.length;s++)A[s]=0;for(s=0;s<x.length;s++)x[s]=0;r=_>256?i[256]:this.BMAX,a=i,T=0,s=_;do{D[a[T]]++,T++}while(--s>0);if(D[0]==_)return this.root=null,this.m=0,void(this.status=0);for(u=1;u<=this.BMAX&&0==D[u];u++);for(d=u,e<u&&(e=u),s=this.BMAX;0!=s&&0==D[s];s--);for(f=s,e>s&&(e=s),I=1<<u;u<s;u++,I<<=1)if((I-=D[u])<0)return this.status=2,void(this.m=e);if((I-=D[s])<0)return this.status=2,void(this.m=e);for(D[s]+=I,x[1]=u=0,a=D,T=1,E=2;--s>0;)x[E++]=u+=a[T++];a=i,T=0,s=0;do{0!=(u=a[T++])&&(A[x[u]++]=s)}while(++s<_);for(_=x[f],x[0]=s=0,a=A,T=0,o=-1,S=w[0]=0,B=null,b=0;d<=f;d++)for(n=D[d];n-- >0;){for(;d>S+w[1+o];){if(S+=w[1+o],o++,b=(b=f-S)>e?e:b,(l=1<<(u=d-S))>n+1)for(l-=n+1,E=d;++u<b&&!((l<<=1)<=D[++E]);)l-=D[E];for(S+u>r&&S<r&&(u=r-S),b=1<<u,w[1+o]=u,B=new Array(b),c=0;c<b;c++)B[c]=new zip_HuftNode;(h=null==h?this.root=new zip_HuftList:h.next=new zip_HuftList).next=null,h.list=B,M[o]=B,o>0&&(x[o]=s,y.b=w[o],y.e=16+u,y.t=B,u=(s&(1<<S)-1)>>S-w[o],M[o-1][u].e=y.e,M[o-1][u].b=y.b,M[o-1][u].n=y.n,M[o-1][u].t=y.t)}for(y.b=d-S,T>=_?y.e=99:a[T]<p?(y.e=a[T]<256?16:15,y.n=a[T++]):(y.e=z[a[T]-p],y.n=t[a[T++]-p]),l=1<<d-S,u=s>>S;u<b;u+=l)B[u].e=y.e,B[u].b=y.b,B[u].n=y.n,B[u].t=y.t;for(u=1<<d-1;0!=(s&u);u>>=1)s^=u;for(s^=u;(s&(1<<S)-1)!=x[o];)S-=w[o],o--}this.m=w[1],this.status=0!=I&&1!=f?1:0},zip_GET_BYTE=function(){return zip_inflate_data.length==zip_inflate_pos?-1:255&zip_inflate_data.charCodeAt(zip_inflate_pos++)},zip_NEEDBITS=function(i){for(;zip_bit_len<i;)zip_bit_buf|=zip_GET_BYTE()<<zip_bit_len,zip_bit_len+=8},zip_GETBITS=function(i){return zip_bit_buf&zip_MASK_BITS[i]},zip_DUMPBITS=function(i){zip_bit_buf>>=i,zip_bit_len-=i},zip_inflate_codes=function(i,_,p){var t,z,e;if(0==p)return 0;for(e=0;;){for(zip_NEEDBITS(zip_bl),t=(z=zip_tl.list[zip_GETBITS(zip_bl)]).e;t>16;){if(99==t)return-1;zip_DUMPBITS(z.b),zip_NEEDBITS(t-=16),t=(z=z.t[zip_GETBITS(t)]).e}if(zip_DUMPBITS(z.b),16!=t){if(15==t)break;for(zip_NEEDBITS(t),zip_copy_leng=z.n+zip_GETBITS(t),zip_DUMPBITS(t),zip_NEEDBITS(zip_bd),t=(z=zip_td.list[zip_GETBITS(zip_bd)]).e;t>16;){if(99==t)return-1;zip_DUMPBITS(z.b),zip_NEEDBITS(t-=16),t=(z=z.t[zip_GETBITS(t)]).e}for(zip_DUMPBITS(z.b),zip_NEEDBITS(t),zip_copy_dist=zip_wp-z.n-zip_GETBITS(t),zip_DUMPBITS(t);zip_copy_leng>0&&e<p;)zip_copy_leng--,zip_copy_dist&=zip_WSIZE-1,zip_wp&=zip_WSIZE-1,i[_+e++]=zip_slide[zip_wp++]=zip_slide[zip_copy_dist++];if(e==p)return p}else if(zip_wp&=zip_WSIZE-1,i[_+e++]=zip_slide[zip_wp++]=z.n,e==p)return p}return zip_method=-1,e},zip_inflate_stored=function(i,_,p){var t;if(zip_DUMPBITS(t=7&zip_bit_len),zip_NEEDBITS(16),t=zip_GETBITS(16),zip_DUMPBITS(16),zip_NEEDBITS(16),t!=(65535&~zip_bit_buf))return-1;for(zip_DUMPBITS(16),zip_copy_leng=t,t=0;zip_copy_leng>0&&t<p;)zip_copy_leng--,zip_wp&=zip_WSIZE-1,zip_NEEDBITS(8),i[_+t++]=zip_slide[zip_wp++]=zip_GETBITS(8),zip_DUMPBITS(8);return 0==zip_copy_leng&&(zip_method=-1),t},zip_inflate_fixed=function(i,_,p){if(null==zip_fixed_tl){var t,z,e=new Array(288);for(t=0;t<144;t++)e[t]=8;for(;t<256;t++)e[t]=9;for(;t<280;t++)e[t]=7;for(;t<288;t++)e[t]=8;if(0!=(z=new zip_HuftBuild(e,288,257,zip_cplens,zip_cplext,zip_fixed_bl=7)).status)return alert("HufBuild error: "+z.status),-1;for(zip_fixed_tl=z.root,zip_fixed_bl=z.m,t=0;t<30;t++)e[t]=5;if((z=new zip_HuftBuild(e,30,0,zip_cpdist,zip_cpdext,zip_fixed_bd=5)).status>1)return zip_fixed_tl=null,alert("HufBuild error: "+z.status),-1;zip_fixed_td=z.root,zip_fixed_bd=z.m}return zip_tl=zip_fixed_tl,zip_td=zip_fixed_td,zip_bl=zip_fixed_bl,zip_bd=zip_fixed_bd,zip_inflate_codes(i,_,p)},zip_inflate_dynamic=function(i,_,p){var t,z,e,n,r,l,f,o,s,u=new Array(316);for(t=0;t<u.length;t++)u[t]=0;if(zip_NEEDBITS(5),f=257+zip_GETBITS(5),zip_DUMPBITS(5),zip_NEEDBITS(5),o=1+zip_GETBITS(5),zip_DUMPBITS(5),zip_NEEDBITS(4),l=4+zip_GETBITS(4),zip_DUMPBITS(4),f>286||o>30)return-1;for(z=0;z<l;z++)zip_NEEDBITS(3),u[zip_border[z]]=zip_GETBITS(3),zip_DUMPBITS(3);for(;z<19;z++)u[zip_border[z]]=0;if(0!=(s=new zip_HuftBuild(u,19,19,null,null,zip_bl=7)).status)return-1;for(zip_tl=s.root,zip_bl=s.m,n=f+o,t=e=0;t<n;)if(zip_NEEDBITS(zip_bl),z=(r=zip_tl.list[zip_GETBITS(zip_bl)]).b,zip_DUMPBITS(z),(z=r.n)<16)u[t++]=e=z;else if(16==z){if(zip_NEEDBITS(2),z=3+zip_GETBITS(2),zip_DUMPBITS(2),t+z>n)return-1;for(;z-- >0;)u[t++]=e}else if(17==z){if(zip_NEEDBITS(3),z=3+zip_GETBITS(3),zip_DUMPBITS(3),t+z>n)return-1;for(;z-- >0;)u[t++]=0;e=0}else{if(zip_NEEDBITS(7),z=11+zip_GETBITS(7),zip_DUMPBITS(7),t+z>n)return-1;for(;z-- >0;)u[t++]=0;e=0}if(s=new zip_HuftBuild(u,f,257,zip_cplens,zip_cplext,zip_bl=zip_lbits),0==zip_bl&&(s.status=1),0!=s.status)return s.status,-1;for(zip_tl=s.root,zip_bl=s.m,t=0;t<o;t++)u[t]=u[t+f];return s=new zip_HuftBuild(u,o,0,zip_cpdist,zip_cpdext,zip_bd=zip_dbits),zip_td=s.root,0==(zip_bd=s.m)&&f>257?-1:(s.status,0!=s.status?-1:zip_inflate_codes(i,_,p))},zip_inflate_start=function(){null==zip_slide&&(zip_slide=new Array(2*zip_WSIZE)),zip_wp=0,zip_bit_buf=0,zip_bit_len=0,zip_method=-1,zip_eof=!1,zip_copy_leng=zip_copy_dist=0,zip_tl=null},zip_inflate_internal=function(i,_,p){var t,z;for(t=0;t<p;){if(zip_eof&&-1==zip_method)return t;if(zip_copy_leng>0){if(zip_method!=zip_STORED_BLOCK)for(;zip_copy_leng>0&&t<p;)zip_copy_leng--,zip_copy_dist&=zip_WSIZE-1,zip_wp&=zip_WSIZE-1,i[_+t++]=zip_slide[zip_wp++]=zip_slide[zip_copy_dist++];else{for(;zip_copy_leng>0&&t<p;)zip_copy_leng--,zip_wp&=zip_WSIZE-1,zip_NEEDBITS(8),i[_+t++]=zip_slide[zip_wp++]=zip_GETBITS(8),zip_DUMPBITS(8);0==zip_copy_leng&&(zip_method=-1)}if(t==p)return t}if(-1==zip_method){if(zip_eof)break;zip_NEEDBITS(1),0!=zip_GETBITS(1)&&(zip_eof=!0),zip_DUMPBITS(1),zip_NEEDBITS(2),zip_method=zip_GETBITS(2),zip_DUMPBITS(2),zip_tl=null,zip_copy_leng=0}switch(zip_method){case 0:z=zip_inflate_stored(i,_+t,p-t);break;case 1:z=null!=zip_tl?zip_inflate_codes(i,_+t,p-t):zip_inflate_fixed(i,_+t,p-t);break;case 2:z=null!=zip_tl?zip_inflate_codes(i,_+t,p-t):zip_inflate_dynamic(i,_+t,p-t);break;default:z=-1}if(-1==z)return zip_eof?0:-1;t+=z}return t},zip_inflate=function(i){var _,p;zip_inflate_start(),zip_inflate_data=i,zip_inflate_pos=0;for(var t=new Array(1024),z=[];(_=zip_inflate_internal(t,0,t.length))>0;){var e=new Array(_);for(p=0;p<_;p++)e[p]=String.fromCharCode(t[p]);z[z.length]=e.join("")}return zip_inflate_data=null,z.join("")};
