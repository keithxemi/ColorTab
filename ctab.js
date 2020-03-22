/* jshint browser: true,  esnext: true */

/*eslint-env es6*/ // Enables es6 error checking for that file
/*eslint-env jquery*/ // Enables error checking for jquery functions
/*eslint-env browser*/ // Lets you use document and other standard browser functions
/*eslint no-console: 0*/ // Lets you use console (for example to log something)

(function () {
  //global variables
  var keepStrays;
  var keepSections;
  var keepMeasures;
  const keepChords = true; //was var, not in ui
  var keepStart = false; // include start notes in ct
  var startChanging = false; //stop showLines from looping
  var keepSpaces = false;
  var breakFour;
  var showHelp = false;
  var featureLength = []; //lengths of notes, chords, measures, sections
  var tabFound = false; //state result of most recent conversion
  var append = false;
  var ctScale = 1.0; //global font-size for colorTab user settable
  var ctWidth; //scaled virtual width
  var lines = []; // pasted input split by new lines
  var prevLines = []; //keep for append and undo
  var newLines = []; //append result
  var goodLines = []; // matchStart return
  var undoLines = []; //undo copy of lines
  var badLines = []; // might be example for start change
  var startTab = []; //3x6 arrary of start chars
    var startTabPos = 0; //what to skip
    const startCharLen = 3; // max length of start chars
  var cT = []; // colortab list items
  const Itype = 0; //[seq][0] item type iT
  const Ichar = 1; //[seq][1] character string to display
  const iT = ["E", "A", "D", "G", "B", "e", "b", "g", "d", "h", "o"];
  // ColorTab item types
  const Bar = 6; // "b" measure bar
  const Gap = 7; // "g" chord separator
  const Dash = 8; // "d" space -N---N-
  const Half = 9; // "h" half space -N--N-
  const Orphan = 10; // "o" stray character
  var pasteAction = "r"; //replace by default
  var undoStack = [];
  var redoStack = [];
  var undoCount = 0;
  var redoCount = 0;
  var undoing = false;
  var songFile = "";

  function pasteMode() {
    if (document.getElementById("newPaste").checked) {pasteAction = "r"; }
    if (document.getElementById("addPaste").checked) {pasteAction = "a"; }
    if (document.getElementById("editPaste").checked) {pasteAction = "m"; }
  }
  
  function findTab() { //for paste or file
    var  j;
    doStuff();
    matchStart(newLines); // match goodlines to start pattern
    if (append && tabFound) {
      for (j = 0; j < 6 ; j++) {
        lines[j] = prevLines[j].concat(goodLines[j].slice(startCharLen));
      }
    }
    else lines = goodLines.slice();
    showLines();
    convertTab();
  }
 
  function getTabIn() { //use text box content
    var j;
    noDownlink();
    doStuff();
    lines = [];
    lines = document.getElementById("TabIn").value.split("\n");
    tabFound = true;
     if (append) for (j = 0; j < 6; j++) {
      lines[j] = lines[j].slice(startCharLen);
      lines[j] += lines[j];
      lines[j] = startTab[j] + lines[j];
    }
    showLines();
    convertTab();
  }
  
  function checkChange() {
    noDownlink();
    lines = [];
    lines = document.getElementById("TabIn").value.split("\n");
    tabFound = true;
    showLines();
    convertTab();
  }
  
  function appendCT() {
    append = true;
    undoing = false;
    getTabIn();
  }
  
  function scaleUp() {
    ctScale = ctScale/0.95;
    document.getElementById("ctOut").style.width =
      1/ctScale*100 + "%";
    document.getElementById("ctOut").style.transform =
      "scale(" + ctScale + ")";
    findLengths();
  }
  
  function scaleDn(){
    ctScale = 0.95 * ctScale;
    document.getElementById("ctOut").style.width =
      1/ctScale*100 + "%";
    document.getElementById("ctOut").style.transform =
      "scale(" + ctScale + ")";
    findLengths();
  }
  
  function help(){
    var empty;
    if (!showHelp) {
    document.getElementById("helpText").setAttribute("class", "show");
    document.getElementById("nonPrint").setAttribute("class", "hide");
    document.getElementById("printThis").setAttribute("class", "hide");
    showHelp = true;
    }
    else {
    document.getElementById("helpText").setAttribute("class", "hide");
    document.getElementById("nonPrint").setAttribute("class", "show");
    document.getElementById("printThis").setAttribute("class", "show");
    showHelp = false;
    empty = document.getElementById("TabIn").value.length;
    if (empty < 25) greenSleeves();
    document.documentElement.scrollTop = 0;
    }
  }
  
  function undo(){
    if (undoCount < 1) {
      lines = [];
      document.getElementById("TabIn").value = "";
      document.getElementById("ctOut").innerHTML = "";
      return;
    }
    redoCount = redoStack.push(lines);
    redoColor();
    lines = [];
    lines = undoStack.pop();
    undoCount = undoStack.length;
    undoColor();
    append = false;
    undoing = true;
    tabFound = true;
    showLines();
    convertTab();
  }
  
  function undoColor() {
    var bckClass;
    bckClass = document.getElementById("bck");
   if (undoCount < 1) bckClass.setAttribute("class", "gray");
    else bckClass.setAttribute("class", "black");
  }
  
  function redoColor() {
    var fwdClass;
    fwdClass = document.getElementById("fwd");
   if (redoCount < 1) fwdClass.setAttribute("class", "gray");
    else fwdClass.setAttribute("class", "black");
  }
  
  function redo() {
    if (redoCount < 1) return;
    undoLines = lines.slice();
    undoCount = undoStack.push(undoLines);
    undoColor();
    lines = [];
    undoLines = redoStack.pop();
    lines = undoLines.slice();
    redoCount = redoStack.length;
    redoColor();
    tabFound = true;
    showLines();
    convertTab();
  }
  
  function doStuff() {
    if (undoing) return;
    redoStack = [];
    redoCount = 0;
    redoColor();
    undoLines = lines.slice();
    undoCount = undoStack.push(undoLines);
    undoColor();
  }
   
  function doOnLoad() {
    var ctW = document.getElementById("ctOut");
    ctWidth = parseFloat(window.
       getComputedStyle(ctW).getPropertyValue("width"));
    // initial string names for startTab
    document.getElementById("TabIn").value = stringNames();
    // assign ui click functions
    document.getElementById("append").onclick = appendCT;
    document.getElementById("bigger").onclick = scaleUp;
    document.getElementById("smaller").onclick = scaleDn;
    document.getElementById("newPaste").onclick = pasteMode;
    document.getElementById("addPaste").onclick = pasteMode;
    document.getElementById("editPaste").onclick = pasteMode;
    document.getElementById("helpButton").onclick = help;
    document.getElementById("helpText").onclick = help;
    document.getElementById("bck").onclick = undo;
    document.getElementById("fwd").onclick = redo;
    document.getElementById("dFile").onclick = downloadFile;
    document.getElementById("dTxt").onclick = downloadText;
    // change events
    document.getElementById("songTitle").onchange = noDownlink;
    document.getElementById("TabIn").onchange = noDownlink;
    document.getElementById("kSpaces").onchange = checkChange;
    document.getElementById("kStrays").onchange = checkChange;
    document.getElementById("brkFour").onchange = checkChange;
    document.getElementById("kStart").onchange = checkChange;
    document.getElementById("kParts").onchange = checkChange;
    document.getElementById("kMeasures").onchange = checkChange;
    // paste event handler
    const target = document.getElementById("TabIn");
    target.addEventListener("paste", (event) => {
      let paste = (event.clipboardData || window.clipboardData).getData("text");
      if (pasteAction === "r") {
        document.getElementById("TabIn").value = "";
        document.getElementById("TabIn").value = paste;
        append = false;
        prevLines = lines.slice();
        newLines = document.getElementById("TabIn").
        value.replace(/\r\n/g, "\n").split("\n"); //keep empty lines
        undoing = false;
        findTab();
      }
      if (pasteAction === "a") {
        document.getElementById("TabIn").value = "";
        document.getElementById("TabIn").value = paste;
        append = true;
        prevLines = lines.slice();
        newLines = document.getElementById("TabIn").
        value.replace(/\r\n/g, "\n").split("\n"); //keep empty lines
        undoing = false;
        findTab();
      }
      if (pasteAction !== "m") {event.preventDefault();}
    });
    
    window.addEventListener("resize", findLengths);
    
    const fin = document.getElementById("chooseFile");
     fin.addEventListener("change", function(){
        readFile(this.files[0], function(e) {
          var text = e.target.result;
          document.getElementById("TabIn").value = "";
          document.getElementById("TabIn").value = text;
          document.getElementById("ctOut").innerHTML = "";
          append = false;
          newLines = document.getElementById("TabIn").
          value.replace(/\r\n/g, "\n").split("\n"); //keep empty lines
          undoing = false;
          findTab();
          document.getElementById("songTitle").value = songFile;
        });
       songFile = this.files[0].name;
    });
//deprecated!!
    target.addEventListener("keydown", function(event) {
      //console.log(event.keyCode)
      if (event.keyCode === 13) event.preventDefault(); //enter
      else if (event.keyCode === 46) delSix(target); //delete
      else if (event.keyCode === 45) insSix(target); //insert
      else if (event.keyCode === 220) insBar(target); // measure |
      else if (event.keyCode === 8) bkspSix(target); //backspace
      else if (event.keyCode === 89) redo(); // ctrl-y
      else if (event.keyCode === 90) undo(); //ctrl-z
      else if (event.keyCode !== 37) { //left arrow
        var where = target.selectionStart;
        target.setSelectionRange(where,where + 1);
      }
    });
    
   target.addEventListener("keyup", function() {
      getTabIn(); //push undo
    });
    
  } //event handlers
  
  function delSix(t){
    //delete on six lines with 46 del
        var where;
        var tabSplit = [];
        var tabD = [];
        var tabDel = "";
        var lineLen;
        var pos;
        var lineShrink;
        var i;
        event.preventDefault();
        where = t.selectionStart;
        tabSplit = t.value.split("\n");
        lineLen = tabSplit[5].length;
        pos = where % (lineLen + 1);
        lineShrink = Math.floor(where/lineLen);
        for (i=0;i<6;i++) {
          tabD[i] =
            tabSplit[i].slice(0,pos) + tabSplit[i].slice(pos + 1);
          if (i<5)tabDel += tabD[i] + "\n";
          else tabDel += tabD[i];
        }
        t.value = tabDel;
        t.setSelectionRange(where - lineShrink, where - lineShrink);
  }
  
  function bkspSix(t){
    //delete on six lines with 8 backspace
        var where;
        var tabSplit = [];
        var tabD = [];
        var tabDel = "";
        var lineLen;
        var pos;
        var lineShrink;
        var i;
        event.preventDefault();
        where = t.selectionStart;
        tabSplit = t.value.split("\n");
        lineLen = tabSplit[5].length;
        pos = where % (lineLen + 1);
        lineShrink = Math.floor(where/lineLen);
        for (i=0;i<6;i++) {
          tabD[i] =
            tabSplit[i].slice(0,pos - 1) + tabSplit[i].slice(pos);
          if (i<5)tabDel += tabD[i] + "\n";
          else tabDel += tabD[i];
        }
        t.value = tabDel;
        t.setSelectionRange(where - lineShrink - 1, where - lineShrink - 1);
  }
  
  function insSix(t){
    //insert six - lines with 45 ins
        var where;
        var tabSplit = [];
        var tabD = [];
        var tabDel = "";
        var lineLen;
        var pos;
        var lineShrink;
        var i;
        event.preventDefault();
        where = t.selectionStart;
        tabSplit = t.value.split("\n");
        lineLen = tabSplit[5].length;
        pos = where % (lineLen + 1);
        lineShrink = Math.floor(where/lineLen);
        for (i=0;i<6;i++) {
          tabD[i] =
            tabSplit[i].slice(0,pos) + "-" + tabSplit[i].slice(pos);
          if (i<5)tabDel += tabD[i] + "\n";
          else tabDel += tabD[i];
        }
        t.value = tabDel;
        t.setSelectionRange(where + lineShrink, where + lineShrink);
  }
  
  function insBar(t){
    //insert six | lines with shift 220, or just overtype backslah
    var where;
    var tabSplit = [];
    var tabD = [];
    var tabDel = "";
    var lineLen;
    var pos;
    var lineShrink;
    var i;
    if (!event.shiftKey) { //backslash
      where = t.selectionStart;
      t.setSelectionRange(where,where + 1);
    }
    else { //measure bar
      event.preventDefault();
      where = t.selectionStart;
      tabSplit = t.value.split("\n");
      lineLen = tabSplit[5].length;
      pos = where % (lineLen + 1);
      lineShrink = Math.floor(where/lineLen);
      for (i=0;i<6;i++) {
        tabD[i] =
          tabSplit[i].slice(0,pos) + "|" + tabSplit[i].slice(pos);
        if (i<5)tabDel += tabD[i] + "\n";
        else tabDel += tabD[i];
      }
      t.value = tabDel;
      t.setSelectionRange(where + lineShrink, where + lineShrink);
    }
  }
  
  function readFile(file, onLoadCallback){
      var reader = new FileReader();
      reader.onload = onLoadCallback;
      reader.readAsText(file);
  }

  function noDownlink()  {
    var oldLink = document.getElementById("out").querySelector("a");
    if (oldLink) {
      window.URL.revokeObjectURL(oldLink.href);
      document.getElementById("out").value = "";
    }
  }

  function downloadFile() {
    var ctInner, head, tail, page, song, bTab;
    noDownlink();
    var fn = document.getElementById("songTitle").value; //filename
    if (fn === "") fn = "song";
    fn = fn + ".html";
    head = pageHead();
    tail = pageTail();
    song = document.getElementById("songTitle").value;
    ctInner = document.getElementById("ctOut").outerHTML;
    page = head.concat(song, "</textarea></div>", ctInner, tail);
    bTab = new Blob([page], {type: "text/html"});
    var a = document.createElement("a");
    a.download = fn;
    a.href = window.URL.createObjectURL(bTab);
    a.textContent = "Download";
    a.setAttribute("class", "downlink");
    document.getElementById("out").appendChild(a);
    a.onclick = function() {setTimeout(function() {noDownlink();}, 1000);
    };
  }
  
  function downloadText() {
    var bTab;
    noDownlink();
    var fn = document.getElementById("songTitle").value; //filename
    if (fn === "") fn = "song";
    fn = fn + ".txt";
    bTab = new Blob([document.getElementById("TabIn").value], {type: "text/html"});
    var a = document.createElement("a");
    a.download = fn;
    a.href = window.URL.createObjectURL(bTab);
    a.textContent = "Download";
    a.setAttribute("class", "downlink");
    document.getElementById("out").appendChild(a);
    a.onclick = function() {setTimeout(function() {noDownlink();}, 1000);
    };
  }
  
  window.onload = doOnLoad;

  function convertTab() {
    var i, j, k;
    var slices = [];
    var sum; // number of notes in same slice
    var dashes;
    var alerted = false; // prevent repeated alerts
    if (document.getElementById("kSpaces").checked) {keepSpaces = true;}
    else keepSpaces = false;
    if (!append && !undoing)
      document.getElementById("songTitle").value = "";
    if (!tabFound) return; // give up
    var tab = [];
    const n = 0; //note part of tab array
    const orph = 1; //orphan part of tab
    const sliceType = 6; // chord or space
    tab[n] = [];
    tab[orph] = [];
    var tabLength = lines[0].length;
    for (i = 0; i < tabLength; i++) {
      tab[n][i] = [];
      tab[orph][i] = [];
      for (j = 0; j < 6; j++) {
        tab[n][i][j] = "";
        tab[orph][i][j] = false; // all orphans at first
      }
    } // intialize tab
    var skip; // skip start slices
    if (document.getElementById("kStart").checked) {keepStart = true;}
    else keepStart = false;
    if (keepStart) skip = 0;
    else skip = startTabPos + 1;
    for (i = 0; i < tabLength - skip; i++) {
      slices[i] = "";
      for (j = lines.length - 1; j >= 0; j--) { //bottom to top string order
        slices[i] += lines[j][i + skip];
      }
      tab[n][i] = slices[i].split("");
      if (slices[i].search(/[|]/) >= 0 && !alerted)
        if (slices[i] !== "||||||") {
          window.alert("Measure |\"s not aligned");
          alerted = true;
        }
    } // create slices

    for (i = 0; i < tabLength; i++) { //for each starting position
      for (j = 0; j < 6; j++) { // for each guitar string
        if (tab[n][i][j].search(/[\s=]/) >= 0) tab[n][i][j] = "-"; //dash for space or equals
        k = 0;
        // find special tab chars, combine with PREVIOUS note
        while (tab[n][i + k + 1] && // while next is special
          (tab[n][i + k + 1][j].search(/[^\d\s-|xX(]/) === 0)) {
          // and current is special or note
          if ((tab[n][i][j].search(/[^\d\s-|]/) >= 0) ||
            (tab[n][i][j].search(/[\d]/) >= 0)) {
            tab[n][i][j] = tab[n][i][j] + tab[n][i + k + 1][j]; // combine
            tab[n][i + k + 1][j] = "";
          } // if next is special
          k++; // look at next position
        } // while current is special maybe more to combine
        if (tab[n][i][j].search(/[)]/) >= 0) { // handle (ghost) notes
          tab[n][i][j] = "(" + tab[n][i][j];
          if (tab[n][i - 1] && (tab[n][i - 1][j] = "(")) tab[n][i - 1][j] = ""; // (n)
          if (tab[n][i - 2] && (tab[n][i - 2][j] = "(")) tab[n][i - 2][j] = ""; // (nn)
        } // if ghost

        //find two digit notes
        if (tab[n][i][j].search(/\d/) >= 0) { //find digits
          if (tab[n][i + 1] && (tab[n][i + 1][j].search(/\d/) >= 0)) {
            tab[n][i + 1][j] = tab[n][i][j] + tab[n][i + 1][j]; //make two digit note
            tab[n][i][j] = "";
            for (k=0;k<6;k++) {
              if (k !== j && tab[n][i][k].search(/\d/) >= 0) {
                if (tab[n][i + 1][k] === "-") tab[n][i + 1][k] = tab[n][i][k];
                else tab[n][i + 1][k] = tab[n][i][k] + tab[n][i + 1][k];
                tab[n][i][k] = "-";
              }
            }
          }
        }
        // handle (illegal) special before note
        if (tab[n][i][j].search(/[^\d\s-|xX(]/) >= 0) { //special before note
          if ((tab[n][i + 1][j]) && (tab[n][i + 1][j].search(/[\d]/) >= 0)) {
            tab[n][i + 1][j] = tab[n][i][j] + tab[n][i + 1][j]; //combine
            tab[n][i][j] = "";
          }
        }
      } // for j
    } // combine digits and specials
    for (i = 0; i < tabLength; i++) { //recheck every location after combines
      sum = 0; // number of notes in same slice
      dashes = 0;
      for (j = 0; j < 6; j++) {
        if (tab[n][i][j].search(/[0-9xX]/) >= 0) {
          sum += 1;
          tab[orph][i][j] = true; //notes, not oprphans
          continue;
        }
        if (tab[n][i][j].search(/\-/) >= 0) { //dashes
          tab[orph][i][j] = true;
          dashes += 1;
          continue;
        }
        if (tab[n][i][j].search(/[|]/) >= 0) { // bars
          tab[orph][i][j] = true;
          continue;
        }
        if (tab[n][i][j] === "") { // fake space
          tab[orph][i][j] = true;
          continue;
        }// empty locations created by combining characters
        if (tab[orph][i][j] === false) dashes += 1;//count orphans as dashes
      }
      if (sum > 1) tab[n][i][sliceType] = "c"; // chord found
      else if ((dashes) === 6) tab[n][i][sliceType] = "s"; //space
    } // find orphans and space slices
    append = false; //return to default
    makeCT(tab);
  } // prepare ascii tab for conversion

  function showLines() { // replace textarea with processed tab
    if (lines.length < 1) tabFound = false; //empty
    var i, showText = "";
    var noStart = `No tab found.
Tab lines must match string notes or other starting characters.
Paste a six line tab example to change the beginning characters`;
    if (!tabFound && !startChanging && badLines && (badLines.length === 6 || badLines.length === 12)) {
      if (window.confirm(`Tab does not match start.
Use this example to change beginnings to match?`)) {
        changeStart();
      }
    }
    else startChanging = false;
    if (!tabFound && !undoing && !startChanging) {
      window.alert(noStart);
    }
    if (lines.length < 1) {
      document.getElementById("TabIn").value = "";
      document.getElementById("ctOut").innerHTML = "";
      return;
    }
    for (i = 0; i < lines.length - 1; i++) {
      showText += lines[i].slice() + "\n";
    }
    showText += lines[lines.length - 1].slice();
    // no line break on last line
    document.getElementById("TabIn").value = showText;
  } // display processed tab in input box

  function makeCT(tab) { // make inline string array
    const n = 0; //note part of tab array
    const orph = 1; //orphan part of tab
    var tabLength = tab[n].length;
    const sliceType = 6;
    var i, j, k;
    cT = [];
    k = 0;
    for (i = 0; i < tabLength; i++) { // build cT note list
      if (tab[n][i][0] === "|") { // insert bar
        cT[k] = [iT[Bar], "|"];// + barCount];
        k += 1;
      } // measure bars
      if (cT[k - 1]) { // look for chord begin
        if ((tab[n][i][sliceType] === "c") &&
          (//(cT[k - 1][Iclass] !== "c") &&
            (cT[k - 1][Itype] !== iT[Gap]))) {
          cT[k] = [iT[Gap], "."];
          k += 1;
        }
      } //chord begins
      if (cT[k - 1]) { // look for chord end
        if ((tab[n][i][sliceType] !== "c") &&
          (cT[k - 1][Itype].slice(cT[k - 1][Itype].length - 1) === "c")) {
          cT[k] = [iT[Gap], "."];
          k += 1;
        }
      } //chord ends
      for (j = 0; j < 6; j++) {
        if (tab[n][i][j].search(/[0-9xX]/) >= 0) { // insert note number
          cT[k] = [iT[j], tab[n][i][j]];
          if (tab[n][i][sliceType] === "c") {
            cT[k][Itype] = iT[j] + " c"; // add space for multi classes
          }
          else { //not a chord, combine sequence of notes on same string
            if (cT[k - 1] && (cT[k - 1][Ichar].search(/[0-9xX]/) >= 0) &&
                cT[k - 1][Itype] === iT[j]) {
              if (cT[k - 1][Ichar].slice(cT[k - 1][Ichar]
                  .length - 1).search(/[^\d]/) >= 0){ // has special last char
                cT[k - 1][Ichar] += cT[k][Ichar]; // no gap needed
              }
              else cT[k - 1][Ichar] += " " + cT[k][Ichar]; //separate numbers
              cT[k].pop();
              k--;
            }
          }
          k += 1;
        }
    if (document.getElementById("kStrays").checked) {keepStrays = true;}
    else keepStrays = false;
        if (keepStrays && tab[orph][i][j] === false) { //include orphans cT
          if (keepStart && i < startTabPos) cT[k] = [iT[j], tab[n][i][j]];
          else cT[k] = [iT[Orphan], tab[n][i][j]];
          k += 1;
        } // orphans
      } // notes and note sequences
    if (document.getElementById("kSpaces").checked) {keepSpaces = true;}
    else keepSpaces = false;
      if (keepSpaces && (tab[n][i][sliceType] === "s")) {
        var spaces = 0; //spaces needed
        var sb = 1; // spaces before +1
        var sa = 1; // spaces after +1
        var scount = 1; // cT spaces checked
        var sd = 0; // spaces already done
        var sh = 0; // half spaces already done
        while (tab[n][i - sb] && (tab[n][i - sb][sliceType] === "s")) sb++;
        while (tab[n][i + sa] && (tab[n][i + sa][sliceType] === "s")) sa++;
        if (cT[k - 1]){
        while ((cT[k - scount] && cT[k - scount][Itype]) &&
          (cT[k - scount][Ichar] === "-") ||
          (cT[k - scount][Itype] === "o")) {
          if (cT[k - scount][Itype] === "d") sd++;
          if (cT[k - scount][Itype] === "h") sh++;
          scount++;
          if (cT[k - scount] === undefined) break;
        }}
        sb--;
        sa--;
        spaces = (sb + sa) / 2 - sd - sh * 0.5;
        if (spaces > 0) {
          if (spaces === 0.5) {
            cT[k] = [iT[Half], "-"];
          } else {
            cT[k] = [iT[Dash], "-"];
          }
          k += 1;
        }
      } // add spaces
    } // create cT
    findLengths();
  } // convertTab
  
  function findLengths(){
 //  create array of lengths for chords, measures and sections for linebreaks
    var cTabLength = Object.keys(cT).length;
    var note; //cT index
    var nLen = [];
    var totalLength = 0;
    var findMeasure = 0; //length at previous bar, then current
    var startMeasure = 0; //note position found, back save location
    var findChord = 0;
    var startChord = 0;
    if (document.getElementById("kSpaces").checked) {keepSpaces = true;}
    else keepSpaces = false;
    if (document.getElementById("kStrays").checked) {keepStrays = true;}
    else keepStrays = false;
    if (document.getElementById("brkFour").checked) {breakFour = true;}
    else breakFour = false;
    if (document.getElementById("kParts").checked) keepSections = true;
    else keepSections = false;
    if (document.getElementById("kMeasures").checked) keepMeasures = true;
    else keepMeasures = false;
    for (note = 0; note < cTabLength; note++) { //find and get lengths
      featureLength[note] = Infinity; //default default is too long to fit
      switch (cT[note][Itype]) {
        case "g":
          nLen[note] = 10;
          if (keepChords) {
            if (cT[note - 1] && cT[note - 1][Itype].
                slice(cT[note - 1][Itype].length -1) === "c")
                  //look behind for chord end
                  {featureLength[startChord] = totalLength - findChord + 20;
                  featureLength[note]= 20;}
            if (cT[note + 1] && cT[note + 1][Itype].
                slice(cT[note + 1][Itype].length -1) === "c")
                 //look ahead for chord begin
                  {startChord = note;
                  findChord = totalLength;}
          } //keep chords
          else featureLength[note] = nLen[note] +10;
          break;
        case "b":
          featureLength[note] = 10; //default
          if (keepMeasures || keepSections) {
              featureLength[startMeasure] = totalLength - findMeasure + 10;
              startMeasure = note;
              findMeasure = totalLength;}
          if (cT[note - 1] && cT[note - 1][Itype] === "b" && keepSections)
              if (note > 1) featureLength[note - 1] = Infinity; //section
          nLen[note] = 10; //always, split or not
          break;
        case "h":
          if (keepSpaces) {
              nLen[note] = 10;
              featureLength[note] = 10;}
          else {
              nLen[note] = 0;
              featureLength[note] = 0;}
          break;
        case "d":
          if (keepSpaces) {
              nLen[note] = 20;
              featureLength[note] = 20;}
          else {
              nLen[note] = 0;
              featureLength[note] = 0;}
          break;
        case "o":
          if (keepStrays) {
              nLen[note] = 10 + 10 * cT[note][Ichar].length;
              featureLength[note] = nLen[note];}
          else {
              nLen[note] = 0;
              featureLength[note] = 0;}
          break;
        default:
          nLen[note] =  10 + 10 * cT[note][Ichar].length;
          featureLength[note] = nLen[note];
     }
      totalLength += nLen[note]; //actual not feature length
    }
    makeHtml();
  } //findLengths of sections measures chords
  
  function noteLength(n) {
    var noteLength = 0;
      switch (cT[n][Itype]) {
        case "g":
          noteLength = 10;
          break;
        case "b":
          noteLength = 10; //always, split or not
          break;
        case "h":
          if (keepSpaces) noteLength = 10;
          else noteLength = 0;
          break;
        case "d":
          if (keepSpaces) noteLength = 20;
          else noteLength = 0;
          break;
        case "o":
          if (keepStrays) noteLength = 10 + 10 * cT[n][Ichar].length;
          else noteLength = 0;
          break;
        default:
          noteLength =  10 + 10 * cT[n][Ichar].length;
     }
    return noteLength;
  }
  
  function makeHtml(){
    var note;
    var endBar;
    var notecount = 0;
    var brCount = 0;
    var cTabLength = Object.keys(cT).length;
    var list = document.getElementById("ctOut");
    var item = []; //list items may include new
    var ctW = document.getElementById("ctOut");
    notecount = 0;
    ctWidth = parseFloat(window.
       getComputedStyle(ctW).getPropertyValue("width"));
    document.getElementById("ctOut").innerHTML = "";
    for (note = 0; note < cTabLength; note++) {
      if (10 + notecount + 3*ctScale + featureLength[note] > ctWidth) { //add break first
        if (cT[note][Itype] === "b") { //add end bar for measure break
          endBar = document.createElement("Li");
          endBar.setAttribute("class", "b");
          endBar.appendChild(document.createTextNode("|"));
          list.appendChild(endBar);
        }
        list.appendChild(document.createElement("br"));
        brCount++;
        if (brCount > 3 && breakFour) {
          list.appendChild(document.createElement("br"));
          brCount = 0;
        }
        notecount = 0;
      }
      item[note] = document.createElement("Li");
      item[note].setAttribute("class", cT[note][Itype]);
      item[note].appendChild(document.createTextNode(cT[note][Ichar]));
      list.appendChild(item[note]);
      notecount += noteLength(note);
      //lastNote = note + 1; // keep for append
    }
  }
  
  function changeStart() {
    var i, j, exSlice, exLines = [], startPos = 0, ok = false;
    if (badLines && (badLines.length === 6 || badLines.length === 12)) {
      for (i = 0; i < 6 ; i++){
        if (badLines.length === 6) exLines[i] = badLines[i].slice(0, startCharLen);
        if (badLines.length === 12) exLines[i] = badLines[i*2].slice(0, startCharLen);
      }
      for (i=0;i<3;i++){
        exSlice = "";
        for(j=0;j<6;j++){
          exSlice += exLines[j][i];
        }
        if (!ok && exSlice === "||||||") {startPos = i; ok = true;}
        if (!ok && exSlice === "------") {startPos = i; ok = true;}
      }
    }
    if (ok){
      for (i=0;i<6;i++){
        startTab[i] = exLines[i].slice(0, startPos + 1)
          .padStart(startCharLen);
      }
      lines = badLines.slice();
      startChanging = true;
      findTab();
    }
    else {
      window.alert(`Beginning characters must all be | or - by the third position.
This example could not be used.`);
      startChanging = false;
    }
  }

  function matchStart (lines){
    var i,j,k,m;
    var matchedLengths;
    var matches;
    var goodLength;
    for (j = 0; j < 6; j++) {
      goodLines[j] = startTab[j].padStart(startCharLen);//always same length
    }
    var lineSt = ""; //first three line chars without spaces
    var startSt = ""; //first chars of string without spaces
    var slice = [];
    for (i = 0; i < lines.length; i++) {
      matches = 0;
      matchedLengths = [];
      goodLength = lines[i].length;
      for (j = 0; j < 6; j++) {
        if (lines[i + j]) { // if defined
          lineSt = lines[i + j].split(" ").join("").slice(0,3);
          startSt = startTab[j].split(" ").join("");//no spaces
          m = 0; // character matches
          if (lineSt.length > 2) { // skip short lines
            for (k=0;k < startSt.length;k++) //each start character
              if (lineSt[k].toUpperCase() === startSt[k].toUpperCase()) m++;
            }
          else break; //short line
          if (m === startSt.length) { //matched a line
            matches += 1;
            matchedLengths[j] = lines[i + j].length;
            if (matchedLengths[j - 1] &&
                (matchedLengths[j] < matchedLengths[j - 1]))
              goodLength = lines[i + j].length; //get shortest length
          } // line matches
        } //defined
      } //set of 6
      if (matches === 6) {
        for (k = 0; k < 4; k++) { //find start position to show
          slice[k] = "";
          for (j = 0; j < 6; j++) {
            slice[k] += lines[i + j][k];
          }
          if (slice[k] === "||||||") break; //prefer bar
          if (slice[k] === "------") break; //settle for dashes
        }
        if (k > 3) {
          k = 3; //use last possible position regardless
        }
        startTabPos = k + 1; //skip start in convertTab
        for (j = 0; j < 6; j++) { //truncate to goodlength
          // make sections if needed
          if (lines[i + j].slice(2,3) !== "|") goodLines[j] += "|";
          goodLines[j] += lines[i + j].slice(startTabPos, goodLength);
        }
        i += 5;
      }
    }

    if (goodLines[0].length > startCharLen) {
      tabFound = true;
      return;
    }
    else tabFound = false;
    
    var getDblStart = []; // if fail then try doublespaced matching
    for (j=0 ;j < 6;j++){
      getDblStart[2*j] = startTab[j];
      getDblStart[2*j + 1] = "";
    }
    for (i = 0; i < lines.length; i++) {
      matches = 0;
      matchedLengths = [];
      goodLength = lines[i].length;
      for (j = 0; j < 12; j += 2) {
        if (lines[i + j]) { // if defined
          lineSt = lines[i + j].split(" ").join("").slice(0,3);
          startSt = getDblStart[j].split(" ").join("");//no spaces
          m = 0; // character matches
          if (lineSt.length > 2) { // skip short lines
            for (k=0;k < startSt.length;k++) //each start character
              if (lineSt[k].toUpperCase() === startSt[k].toUpperCase()) m++;
            }
          else break; //short line
          if (m === startSt.length) { //matched a line
            matches += 1;
            matchedLengths[j] = lines[i + j].length;
            if (matchedLengths[j - 1] &&
                (matchedLengths[j] < matchedLengths[j - 1]))
              goodLength = lines[i + j].length; //get shortest length
          } // line matches
        } //defined
      } //set of 6
      if (matches === 6) {
        for (k = 0; k < 4; k++) { //find start position to show
          slice[k] = "";
          for (j = 0; j < 12; j += 2) {
            slice[k] += lines[i + j][k];
          }
          if (slice[k] === "||||||") break; //prefer bar
          if (slice[k] === "------") break; //settle for dashes
        }
        if (k > 3) {
          k = 3; //use last possible position regardless
        }
        startTabPos = k + 1; //skip start in convertTab
        for (j = 0; j < 6; j++) { //truncate to goodlength
          // make sections if needed
          if (lines[i + j*2].slice(2,3) !== "|") goodLines[j] += "|";
          goodLines[j] += lines[i + j*2].slice(startTabPos, goodLength);
        }
        i += 10;
      }
    }

    if (goodLines[0].length > startCharLen) {
      tabFound = true;
      return;
    }
    else tabFound = false;
    badLines = lines.slice();
    goodLines = prevLines.slice();
    //
  } // find lines that match start
  
  function stringNames (){
    var i, strSplit = [], strText =
` e|
 B|
 G|
 D|
 A|
 E|`;
    
    // initialize startTab
    strSplit = strText.split("\n");
    for (i=0;i<6;i++) {
      startTab[i] = strSplit[i];
    }
    return strText;
  } // default line start
  
  function greenSleeves()  {
    var txt =
`e|-------||-------0--1-0-|--------------|--------------|-------------|
B|-------||-1---3--------|-3---0------0-|-1------------|-0-----------|
G|-----2-||--------------|-------0--2---|-----2-2--1-2-|-----1-----2-|
D|-------||--------------|--------------|--------------|-------2-----|
A|-------||-0-----3------|--------------|-0-----0------|-------------|
E|-------||--------------|-3-----3------|--------------|-0-----0-----|`;
  newLines = txt.split("\n");
  append = false;
  document.getElementById("ctOut").innerHTML = "";
  findTab();
  document.getElementById("songTitle").value = "Greensleeves example";
}

  
// parts for save as html including local fonts for offline
  function pageHead() {
    var head =
`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ColorTab</title>
  <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1, user-scalable=no" />
  <meta name="description" content="ColorTab">
  <meta name="author" content="Keith Thomas">
<style>
html{font-size: calc(1em + 1vw)}body{margin:0;font-family:'Crimson Text',serif;line-height:1.2;color:#ddd;background-color:#000}@media print{body{background-color:#fff!important}.b{color:#000!important;background:#fff!important}#songTitle{color:#000!important;border:0!important;box-shadow:none!important;background-color:#fff!important}}#ctOut{transform-origin:0 0;font-family:'Roboto Mono';margin:10px 0 0 0;font-size:16.65px;font-weight:500;line-height:1}#sTitle{width:100%}#songTitle{display:block;width:auto;margin:8px auto;font-size:.7rem;font-family:'Crimson Text',serif;color:#fff;text-align:center;line-height:1.2;border-radius:5px;background-color:#000}ol{list-style-type:none;padding:0;margin:0}li{word-break:break-all;display:inline-block;padding:0 5px 0 5px;margin-bottom:6px}.o{color:red;background:grey}.b{font-family:'Crimson Text',serif;font-size:23.27px;color:#fff;background:#000;padding:0 2px 0 2px}.c{border-top:6px solid grey}.g{border-top:6px solid grey;padding:0;margin:0;color:grey;background:grey}.d{font-weight:700;color:#000;background:#cccbcb}.h{font-weight:700;color:#000;padding:0;background:#cccbcb}.t{position:relative;top:-30px;left:500px;padding-bottom:10px}.e{color:#000;background:#fff}.B{color:#000;background:#ffdc00}.G{color:#000;background:#3cc8f4}.D{color:#fff;background:#1eb24b}.A{color:#fff;background:#d72028}.E{color:#fff;background:#0a50a0}#bottom{position:absolute;bottom:0;width:100%;height:1.5rem}#foot{font-size:16px;width:250px;margin:0 auto;display:block;bottom:0}a, a:visited {
  color:white;
}
@font-face {
  font-family: 'Crimson Text';
  font-style: normal;
  font-weight: 400;
src: url(data:application/font-woff;charset=utf-8;base64,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) format('woff');
    font-weight: normal;
    font-style: normal;

}
@font-face {
  font-family: 'Roboto Mono';
  font-style: normal;
  font-weight: 400;
src: url(data:application/font-woff;charset=utf-8;base64,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) format('woff');
    font-weight: normal;
    font-style: normal;

}
</style>
</head>
<body>
  <div id="main">
  <div id="content">
    <div id="sTitle"><textarea contenteditable="true" spellcheck="false" id="songTitle" rows="1" cols="40" placeholder="Song title">`;
  return head;
}

  function pageTail() {
    var tail =`</ol></div>
<div id="bottom">
<footer id="foot">&copy; Copyright 2020, Keith Thomas<br>
  <a href="http://keith-thomas.com/colortab/">http://keith-thomas.com/colortab/</a></footer>
</div>
</div>
</div>
</body>
</html>`;
    return tail;
  }

}());