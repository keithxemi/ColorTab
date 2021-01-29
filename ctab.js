/*eslint-env es6, browser, amd*/
/*eslint no-irregular-whitespace: ["error", { "skipRegExps": true }]*/
/* global Soundfont, offline */

(function() {
  //global variables 
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
  var tabArea; //document.getElementById("TabIn");
  var tabArea2; //document.getElementById("TabIn2");  
  var lyricArea; //document.getElementById("LyricIn");
  var tuneArea; //document.getElementById("TuneIn");
  var tuneArea2;
  var barNumb; //document.getElementById("BarNum"); 
  var ctabOut; //document.getElementById("ctOut");
  var tabBack; //document.getElementById("TabBacker");
  var tuneBack; //document.getElementById("TuneBacker");
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

  var colors = ["","#ffffff","#ffdc00","#3cc8f4","#1eb24b","#d72028","#0a50a0","#773c1c","#ff00ff","#444444"];  

  const thin = String.fromCharCode(8201); //&#x2009; 4px
  const musicSym =/[\xb2\xb3\xb9\u2070-\uf5fa]/;
  
  const noteUpDurations = {"\uE1d2":4,"\uECA1":3,"\uE1d3":2,"\uECA3":1.5,"\uE1d5":1,"\uECA5":0.75,"\uE1d7":0.5,"\uECA7":0.375,"\uE1d9":0.25,"\uE1db":0.125,"\uE1dd":0.015625,"\uE1df":0.0078125,"\uE1e1":0.00390625,"\uE560":0,"\uEcad":0.75,"\uE1F3":0.5,"\uEcae":0.375,"\uE1F5":0.25,"\uE1F6":0.125};  
  
  const noteDnDurations = {"\uE1D4":2,"\uE1D6":1,"\uE1D8":0.5,"\uE1DA":0.25,"\uE1DC":0.125,"\uEca2":3,"\uEca4":1.5,"\uEca6":0.75,"\uEca8":0.375,"\uE1de":0.015625,"\uE1e0":0.0078125,"\uE1e2":0.00390625,"\uE561":0};  

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
  
  const timeSigBeats = {"\uf5f3":4,"\uf5ee":2,"\uf5ef":4,"\uf5f0":6,"\uf5f1":3,"\uf5f2":1.5,"\uf5f4":5,"\uf5f5":2.5,"\uf5f6":6,"\uf5f7":3,"\uf5f8":3.5,"\uf5f9":4.5,"\uf5fa":6}
  
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
    if (document.getElementById("instr")) prevInst = document.getElementById("instr").innerHTML;
    ctabOut.innerHTML = "";
    if (barCount !== 0) ctabOut.appendChild(document.createTextNode(barsHidden));
    for (note = noteStart; note < cTabLength; note++) {
      if (note === tabStrings) { //string notes
        var inst = document.createElement("div");
        inst.setAttribute("id", "instr");
        inst.setAttribute("contenteditable", "true");
        inst.setAttribute("spellcheck", "false");        
        inst.innerHTML = prevInst;
        ctabOut.appendChild(inst);
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
        })      
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
      if (c) t[i] = c.padStart(3);
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
      document.getElementById("songTitle").innerHTML = "";
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
    reader.onload = function(event) {
      var text = event.target.result;
      tabArea.value = text;
      ctabOut.innerHTML = "";
      append = false;
      newLines = tabArea.value.replace(/(\r\n|\n|\r)/gm, "\n").split("\n");
      undoing = false;
      findTab();
      document.getElementById("songTitle").innerHTML = file.name;
    };
    reader.readAsText(file);
    return false;
  }
  
  function openFile() {   
    readFile(this.files[0], function(e) {
      var text = e.target.result;
      locateTabCursor();      
      tabArea.value = text;
      prevLines = lines.slice();      
      newLines = tabArea.value.replace(/(\r\n|\n|\r)/gm, "\n").split("\n");
      if (lines.length < 1 || lines[0].length < 2) { //empty
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
      document.getElementById("songTitle").innerHTML = songFile.split(".txt")[0];
    });
    songFile = this.files[0].name;
    document.getElementById("chooseFile").value = "";
  }

  function readFile(file, onLoadCallback) {
    var reader = new FileReader();
    reader.onload = onLoadCallback;
    reader.readAsText(file);
  }

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
    if (notEmpty()) saveFile();
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
  
  function makeLink(){
    var split = [], cpy = [], text;
    split = tabArea.value.split("\n");
    for (var i = 0; i < tabStrings; i++) {
      cpy[i] = startTab[i] + trimTail(split[i]);
    }
    text = cpy.join("\n");
    location.search = text;
  }
  
  function useLink(){
    var q = location.search.slice(1);
    if (q.length < 10) return;
    tabArea.value = q.replace(/%25/g,"%");
    pasteTab(decodeURI(q.replace(/%25/g,"%")));
  }
  
  function shareDialog() {
    var split = [], cpy = [], text;
    split = tabArea.value.split("\n");
    for (var i = 0; i < tabStrings; i++) {
      cpy[i] = startTab[i] + trimTail(split[i]);
    }
    text = cpy.join("\n");
    var theLink = new URL("https://colortab.org/ColorTabApp.html");
    theLink.search = text;
    theLink.search = theLink.search.replace(/%/g,"%25");

    document.getElementById("tinylink").href = "https://tinyurl.com/api-create.php?url=" 
    + theLink.href;
    console.log(theLink.href)
    document.getElementById("saveoptions").style.display = 'block';
  }
  
  function shareDone() {
    document.getElementById("saveoptions").style.display = 'none';
  }  
  
  function addEvents() {
    document.getElementById("sharebutton").onclick = shareDialog;
    document.getElementById("sharedone").onclick = shareDone;
    document.getElementById("makelink").onclick = makeLink;    
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
    document.getElementById("songTitle").onchange = noDownlink;
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

    var playButton = document.getElementById("play");
    var loopBtn = document.getElementById("loopbtn");
    var soundfont = new Soundfont(ctx);
    var soundfont2 = new Soundfont(ctx);    
    var instName = document.getElementById("instrsf");
    instName.setAttribute("disabled", true);
    var instChoice = "offline";
    var sfChoose = document.getElementById("sfont");
    var sfChoice = "MusyngKite/";
    var inst = soundfont.instrument(instChoice);
    var metroInst = soundfont2.instrument("offline"); 
    var sfReady = true;
    let playTimer;//poll doneYet during play
    var lookahead = 25.0;//ms until next lookahead
    var scheduleAheadTime = 0.1;//window of note to schedule in seconds
    
    instName.addEventListener("change", function(e) {
      instChoice = e.target.value;
      instChoice === "offline" ? sfChoice = "" : sfChoice = sfChoose.value;
      playButton.setAttribute("disabled", true);
      sfReady = false;
      inst = soundfont.instrument(sfChoice + instChoice);
      inst.onready(function() {
        playButton.removeAttribute("disabled");
        sfReady = true;
      });
    });
    
    sfChoose.addEventListener("change", function(e) {
      sfChoice = e.target.value;
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
      inst = soundfont.instrument(sfChoice + instChoice);
      inst.onready(function() {
        playButton.removeAttribute("disabled");
        sfReady = true;
      });
    });
    
    loopBtn.addEventListener('click', () => {
      if (loop) {
        loop = false;
        loopBtn.setAttribute("class", "transport black");
        noteSelect(selStart,selStart);
      }
      else {
        loop = true;
        loopBtn.setAttribute("class", "transport off");       
      }
    });
    
    document.getElementById("notePlay").addEventListener("click",playSingle);
    
    function playSingle() {
      ctx.resume();
      if (singleThing.length === 2) {
        inst.play(singleThing[0],ctx.currentTime,{ duration:0.5});
        inst.play(singleThing[1],ctx.currentTime,{ duration:0.5});
      }
      else inst.play(singleThing,ctx.currentTime,{ duration:0.5});
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
                  inst.play(pitch[0],nextNoteTime,{ duration:playThings[nP][2]});
                  inst.play(pitch[1],nextNoteTime,{ duration:playThings[nP][2]});
                }
              else inst.play(pitch,nextNoteTime,{ duration:playThings[nP][2], gain:3});
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
  
  function noteSelect(p1,p2){
    if (loop && p1 === p2) return;
    if (loop && p2 === p1 + 1) return;
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

  function playPrep() {//collect notes and times for playback
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
        if (s === "\xB3") triplet = 3;
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
    var repeats = measureRepeats().concat(pairRepeats());//***********handle nested begining repeat
    var textualRepeats = jumpRepeats();
    var p = 0;
    var i,j,k;
    var unRolled = [];
    console.log(textualRepeats)

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
    
    repeatBars.forEach((b,i) => {pairs.push([b, repeatBars[i + 1]]);});//collect every possible pair
    
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
    tabArea.setSelectionRange(0,0);//clear previous to prevent drag
  }
  
  function tab2MouseDown() {
    if (!tabArea.value) tabInit();    
    mouseDown = true;
    mouseDown2 = true;
    tabArea2.setSelectionRange(0,0);//clear previous to prevent drag    
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
      else noteSelect(c, d + 1);
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
    ptable = document.getElementById("pitchtbl");
    var finp = document.getElementById('fileinput');
    if (finp) finp.addEventListener('change', readJS, false);
    var finp2 = document.getElementById('fileinput2');
    if (finp2) finp2.addEventListener('change', readJS2, false); 
    var mk = document.getElementById('make');
    if (mk) mk.addEventListener('click', makeOffline, false);
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
    var song = document.getElementById("songSave");
    if (song) document.getElementById("songTitle").innerHTML = song.innerHTML;
    else document.getElementById("songTitle").innerHTML = "title"
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
    if (notEmpty()) {
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
        document.getElementById("songTitle").innerHTML = song.innerHTML;
      }
      showButtons = true; menuToggle();
      barFrom = "Tab";
      barMaster();
      getTabIn();
      document.getElementById("nonPrint").style.display = "none";
      document.getElementById("menuTog").style.display = "none";
      document.getElementById("editButton").style.display = "block";
    }
    else useLink();
    //secsPerBeat = 60 / document.getElementById("tempo").value;
    //tempos[0] = [0,document.getElementById("tempo").value];
    readPitches();
    playPrep();
  }
  
  function notEmpty(){   
    var empty = document.getElementById("lyricSave");
    var yes = (empty && empty.value.length > 0) ? true : false;
    return yes;
  }

  function editClick() {
    document.getElementById("nonPrint").style.display = "block";
    document.getElementById("menuTog").style.display = "inline-block";
    document.getElementById("editButton").style.display = "none";
    var inst = document.getElementById("instSave").innerHTML;    
    if (inst) document.getElementById("instr").innerHTML = inst;
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
    var split = [], cpy = [], text;
    split = tabArea.value.split("\n");
    for (var i = 0; i < tabStrings; i++) {
      cpy[i] = startTab[i] + trimTail(split[i]);
    }
    text = cpy.join("\n");
    var temp = document.createElement('a');
    temp.setAttribute('href', 'data:text;charset=utf-8,' +
      encodeURIComponent(text));
    var fn = "CT_" + document.getElementById("songTitle").innerHTML; //filename
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
    var fn = document.getElementById("songTitle").innerHTML; //filename    
    var song = "<div id='songSave' style='display:none'>" + fn + "</div>";
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
    document.title = fn;
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
      `e|----|------0--10-|----Em---------|-------------|----------|-------0--10-|----Em---------|----------------|--------|-3--3--1-0-|G---Em-------|---F----------|E--------|3--3--2-0-|G---Em------|--------------|-----|
B|----|-1--3---------|-3-0------0-|1------------|-0--------|-1--3---------|-3--0------0-|1---0----------|--------|-1-----------|-3--0----0-|1-------------|-0-------|------------|-3--0---0-|1--0---------|------|
G|--2|---------------|-------0-2----|---2-2-1-2|---1--2-|---------------|-------0-2----|------2-1----1|--2--2--|-0-----------|------0-2---|--2-2--1-2-|----1---|------------|-----0--2--|----2-1---1-|2--2--|
D|----|---------------|---------------|-------------|----2-----|---------------|---------------|------------4--|--------|-2-----------|-------------|--------------|------2--|------------|------------|----------4--|------|
A|₁₀₀|-0----0-----|G--------------|0--F-0----|E---------|-0----0-----|G--------------|0-----E-------|--0-0-|-3-3------|-------------|0------------|---------|3-3------|------------|0-----------|0-0-|
E|---|-Am------------|-3----0-----|Am-----------|-0-0----|-Am------------|-3----0-----|Am-------0----|Am------|-C----------|-3---0----|Am---1------|-0---0-|C-----------|-3--0----|Am---E-0----|------|`;
    newLines = txt.split("\n");
    append = false;
    ctabOut.innerHTML = "";
    findTab();
    document.getElementById("songTitle").innerHTML = "Greensleeves";
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
