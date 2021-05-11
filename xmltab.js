/* jshint browser: true,  esnext: true */

/*eslint-env es6*/ // Enables es6 error checking for that file
/*eslint-env jquery*/ // Enables error checking for jquery functions
/*eslint-env browser*/ // Lets you use document and other standard browser functions
/**/ // Lets you use console (for example to log something) eslint no-console: 0

(function () {
  var songFile = "song-asc-tab.txt";
  //var cssStr;
  var inText = "";
  var asciiLen = 0;
  var keepRests = true;
  var keepMeasures = true;
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

  function dropXMLFile(e) {
    var zip = false;
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    songFile = file.name;
    var nameSplit = songFile.split(".");
    var nameExt = nameSplit[nameSplit.length - 1];
    var reader = new FileReader();
    reader.onload = function(event) {
      const target = document.getElementById("TabIn");
      var text = event.target.result;
      if (zip) inText = unZip(text);
      else inText = text;
      if (inText.slice(0,5) === "<?xml" || inText.slice(0,8) === "<score-p") inText = convertXML(inText);
      else window.alert("Not a valid XML file.\nMust be uncompressed\nand begin text with <?xml");
      target.value = inText;
    };
    if (nameExt === "mxl") {
      reader.readAsArrayBuffer(file);
      zip = true;
    }
    else reader.readAsText(file);
    return false;
  }

  function openFile(){
    var zip = false;
    songFile = this.files[0].name;
    var nameSplit = songFile.split(".");
    var nameExt = nameSplit[nameSplit.length - 1];
    if (nameExt === "mxl") zip = true;
    readFile(this.files[0], zip, function(e) {
      var text = e.target.result;
      if (zip) inText = unZip(text);
      else inText = text;
      const target = document.getElementById("TabIn");
      if (inText.slice(0,5) === "<?xml" || inText.slice(0,8) === "<score-p") inText = convertXML(inText);      
      else window.alert("Not a valid XML file.\nMust be uncompressed\nand begin text with <?xml");
      target.value = inText;
    });
    
  }

  function readFile(file, zip, onLoadCallback){
    var reader = new FileReader();
    reader.onload = onLoadCallback;
    if (zip) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
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
    
/*    document.getElementById("kBars").onclick = checkChange;
    document.getElementById("kRests").onclick = checkChange;*/
/*    document.getElementById("dFile").onclick = downloadFile;
    window.addEventListener("dragover", function(e){
      e.preventDefault();},false);
    window.addEventListener("drop", function(e){
      e.preventDefault();},false);
    target.ondrop = dropFile;
    target.addEventListener("dragover", function(e) {
      e.preventDefault();});
    target.addEventListener("dragstart", function(e) {
      e.preventDefault();});
    document.getElementById("chooseFile").onchange = openFile;

  } //event listeners*/

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
       
  console.log("Bar","String","Fret","Chord","Rest","Dur","Pos","Timing","Interval","Tie type","Tie to ID","voice","ChordUpstem")    
    
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
    
    console.log(collectNotes)

  //sort each Measure!
  var tabMeasures = [];
  var tabNotes = [];
  var x = 0;
  var y = 0;
  for (i = 0;i < musicLength + 1; i++) {
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
    
  //collect sequential rest durations in array   *********************
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
        //(tabNotes[i][Tie] === 2 || tabNotes[i][Tie] === 3)) { 
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
  //console.log("i String Fret Chord Dur Timing")
    
  for (i=0;i<tabCount;i++){  
    if (tabNotes[i][Interval] < 0) {//last note in measure, find Interval
      tabNotes[i][Interval] = measureBeats[tabNotes[i][Bar]] * scaleQ - tabNotes[i][Timing];
    }
  }
    
//get chord upstems from last chord note and apply to all chord notes 
  var needRest = 0;
  for (i=tabCount-1;i>=0;i--) {//last to first
    //console.log(i,tabNotes[i][String],tabNotes[i][Fret], tabNotes[i][Chord],tabNotes[i][Dur],tabNotes[i][Timing],tabNotes[i][TieTo])
    if (tabNotes[i][Chord] && tabNotes[i][Dur][0] !== 0) {
      needRest = tabNotes[i][Interval] - sumDur(i);
      if (needRest > 0) tabNotes[i][ChordUpstem] = tabNotes[i][Interval] - needRest;
      //else tabNotes[i][ChordUpstem] = tabNotes[i][Dur][0];//*************************
      else tabNotes[i][ChordUpstem] = tabNotes[i][Interval];//[Dur][0]+"a";//interval? yes tied voices, no need rest
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
    if (tabNotes[n + 1] && tabNotes[n + 1][Timing] && (tabNotes[n][Fret] === "|" || tabNotes[n][Timing] === -1) && tabNotes[n + 1][Timing] !== 0) {//first note not at start
      tabNotes.splice(n + 1,0,[tabNotes[n][Bar], tabStrings - 1, tiedRest(n + 1,tabNotes[n + 1][Timing]), false, true, [0], "","","x"]);
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
    let mergedDurs = mergeTies(tabNotes[n][Dur]);//wtf? use Interval not Dur, make array???**********is this ok??************    
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
    if (need === 0) return;
    var noteSymbol = restSym(need);
    if (noteSymbol) return noteSymbol;
    noteSymbol = "";
    for (k = 0;k < restArray[tabNotes[n][TieTo]].length;k++){
      noteSymbol += restSym(restArray[tabNotes[n][TieTo]][k]) + "-";
    }      
    return noteSymbol;
  }
    
console.log("tabNotes", tabNotes) 

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
    
 var headDefault = upDurations["d" + defaultNote].padStart(tabStrings,"-").split("")    
  
  var startChars = [];
  if (stringNames.length > 0) {
    for (i=0;i<tabStrings;i++) {
      startChars[tabStrings - 1 - i] = stringNames[i].padStart(2) + "|" + headDefault[i];
    }
  }
  else startChars = [" e|" + upDurations["d" + defaultNote]," B|-"," G|-"," D|-"," A|-"," E|-"]; 
  
  var asciiTabInline = "";//inline
  for (i=0;i<tabStrings;i++) {
    asciiTabInline += startChars[i] + headDefault[i] + tabText[tabStrings - 1 - i];
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

  var mCount = 0;
  var planStaves = [];
  var staveCount = 0;
  var staveLength = 0;
if (asciiLen > 0) { //skip if no len  
  while 
    (keepMeasures && mCount < musicLength && staveCount < musicLength) {
      if ((staveLength + tabMeasures[mCount][0].length) < asciiLen){
        staveLength += tabMeasures[mCount][0].length;
        planStaves[staveCount] = mCount;
        mCount++;
      }
      else { //stave is full
        if (staveLength === 0) staveCount = musicLength;
        staveLength = 0;
        staveCount++;
      }
  }
}

  var asciiTabScore = "";
  var aTab = []; //strings for concat
    
  staveCount = 0;
  for (i=0; i < planStaves.length; i++) {
    for (j=0;j<tabStrings;j++) {
      if (i === 0) aTab[j] = startChars[j];
      else aTab[j] = startChars[j].slice(0,2);
    }
    while (staveCount < planStaves[i] + 1){
      for (j=0;j<tabStrings;j++) {
        aTab[j] += tabMeasures[staveCount][j];
      }
      staveCount++;
    }
    for (j=0;j<tabStrings;j++) {
      asciiTabScore += aTab[j] + "|\n";
    }
    asciiTabScore += "\n";
  }

  var asciiTabMeasures = ""; //split by measures
  aTab = []; //strings for concat
  for (i=0; i < musicLength; i++) {
    for (j=0;j<tabStrings;j++) {
      if (i === 0) aTab[j] = startChars[j];
      else aTab[j] = startChars[j].slice(0,2);
    }
    for (j=0;j<tabStrings;j++) {
      aTab[j] += tabMeasures[i][j];
    }
    for (j=0;j<tabStrings;j++) {
      asciiTabMeasures += aTab[j] + "|\n";
    }
    asciiTabMeasures += "\n";
  }
  
  var asciiTabSplit = ""; 
    
if (asciiLen > 0){ //skip if no len
  var splitStaves = Math.ceil(tabText[0].length/asciiLen);
  staveCount = 0;
  aTab = [];
  for(i=0;i < splitStaves;i++){
    for (j=0;j<tabStrings;j++) {
      if (i === 0) aTab[j] = startChars[j];
      else aTab[j] = startChars[j].slice(0,2);
    }
    for (j=0;j<tabStrings;j++) {
        aTab[j] +=
          tabText[tabStrings - 1 - j].slice(staveCount * asciiLen, staveCount * asciiLen + asciiLen);
      }
    staveCount++;
    for (j=0;j<tabStrings;j++) {
      asciiTabSplit += aTab[j] + "\n";
    }
    asciiTabSplit += "\n";
  }
}
    
  if (keepMeasures && mCount < musicLength && asciiLen > 0) { //mCount < musicLength
    window.alert("Measures do not fit on lines and are split.\nIncrease LEN or reduce RES to keep measures whole.");
    return asciiTabSplit;
  }
    
  if(keepMeasures && asciiLen === 0) return asciiTabMeasures;
  if(keepMeasures && asciiLen > 0) return asciiTabScore;
  if(!keepMeasures && asciiLen > 0) return asciiTabSplit;
  if(!keepMeasures && asciiLen === 0) return asciiTabInline;

  return "";//never happens
} //parse xml

  function noDownlink()  {
    var oldLink = document.getElementById("out").querySelector("a");
    if (oldLink) {
      window.URL.revokeObjectURL(oldLink.href);
      document.getElementById("out").value = "";
    }
  }

  function downloadFile() {
    var song, bTab;
    noDownlink();
    var fn = document.getElementById("fname").value; //filename
    if (fn === "") fn = "song-asc-tab";
    song = fn + " converted from " + songFile + "\n\n" + document.getElementById("TabIn").value;
    bTab = new Blob([song], {type: "text/plain"});
    var a = document.createElement("a");
    fn = fn + ".txt";
    a.download = fn;
    a.href = window.URL.createObjectURL(bTab);
    a.textContent = "Download";
    a.setAttribute("class", "downlink");
    a.setAttribute("id", "clicklink");
    document.getElementById("out").appendChild(a);
    a.onclick = function() {setTimeout(function() {noDownlink();}, 1000);
    };
    document.getElementById("clicklink").click();
  }
  
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
  


}());

