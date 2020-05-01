/**
 * Author: Flavian Engevin
 * Version : 1.00
*/ 
var morseAlphabet = [
    // Letters
    ["a", ".-"], ["b", "-..."], ["c", "-.-."], ["d", "-.."], ["e", "."], ["f", "..-."], ["g", "--."], ["h", "...."], ["i", ".."],
    ["j", ".---"], ["k", "-.-"], ["l", ".-.."], ["m","--"], ["n", "-."], ["o", "---"], ["p", ".--."], ["q", "--.-"], ["r", ".-."],
    ["s", "..."], ["t", "-"], ["u", "..-"], ["v", "...-"], ["w", ".--"], ["x", "-..-"], ["y", "-.--"], ["z", "--.."],
    // Numbers
    ["1", ".----"], ["2", "..---"], ["3", "...--"], ["4", "....-"], ["5", "....."],
    ["6", "-...."], ["7", "--..."], ["8", "---.."], ["9", "----."], ["0", "-----"],
    // Space 
    [" ", "/"], 
    // Ponctuation
    [".", ".-.-.-"], [",","--..--"], ["?","..--.."], ["'",".----."], ["!","-.-.--"], ["/","-..-."],
    ["(","-.--."], [")","-.--.-"], ["&",".-..."], [":","---..."], [";","-.-.-."], ["=","-...-"],
    ["+",".-.-."], ["-","-....-"], ["_","..--.-"], ["\"",".-..-."], ["$","...-..-"],
    // Specials characters
    ["à",".--.-"],  ["ç","-.-.."], ["è",".-..-"], ["é","..-.."], ["@",".--.-."], ["\n", "\n"]
];

// DOM
const input = document.getElementById("input");
const res = document.getElementById("res");
const errorContainer = document.getElementById("errorContainer");
const error = document.getElementById("error");
const text1 = document.getElementById("text1");
const text2 = document.getElementById("text2");
const exchangeBtn = document.getElementById("exchangeBtn");
const cross = document.getElementById("cross");
const copy = document.getElementById("copy");
const copiedText = document.getElementById("copied");
const morseBtn = document.getElementById("morseBtn");
const morseBtnHead = document.getElementById("morseBtnHead");

// Globals var
var inputVal = "";
var resultString = "";
var problematicChar = [];
// mode 1 =  latin to morse code
// mode 2 = morse code to latin
// mode 3 = morse code to latin with simulation on
var mode = 2;

// Main
var latinToMorse = buildMap(1);
var morseToLatin = buildMap(2);

input.addEventListener("input", function translate() {
    if (mode === 1) {
        getInput();
        inputVal = inputVal.toLowerCase();
        splitStr('');
        if (checkCharacters(latinToMorse, inputVal)) {
            hideError();
            concatStr(latinToMorse);
            res.value = resultString;
        } else {
            displayError();
        }
    } else if (mode === 2) {
        var inputStr = "";
        getInput();
        inputStr = inputVal.split(/\s/gm);
        // console.log(inputStr);
        if (checkCharacters(morseToLatin, inputStr)) {
            hideError();
            splitStr('\n');
            // console.log(inputVal);
            var lines = [];
            for (i of inputVal) {
                inputVal[i] = i.split(" ");
                lines.push(inputVal[i]);
            }
            resultString = "";
            for (line of lines) {
                let counter = 0;
                for (part of line) {
                    if (morseToLatin.get(part) !== undefined){
                        resultString += morseToLatin.get(part);
                        counter += 1;   
                    }
                    if (part === "") {
                        resultString += "\n";
                    }
                    if (counter === line.length) {
                        resultString += "\n";
                    }
                }
            }
            res.value = resultString;
        } else {
            displayError(); 
        }



        // if (checkCharacters(morseToLatin)) {
        //     hideError();
        //     concatStr(morseToLatin);
        //     res.value = resultString;
        // } else {
        //     displayError(); 
        // }

    }

    if (input.value != "") {
        cross.style.display = "inline-block";
        copy.style.display = "inline-block";
    } else {
        cross.style.display = "none";
        copy.style.display = "none";
    }
});

exchangeBtn.addEventListener("click", function exchangeMode() {
    if (mode === 1) {
        setMode(2);
    } else if (mode === 2 || mode === 3) {
        setMode(1);
    }
    let exInput = input.value;
    input.value = res.value;
    res.value = exInput;
});

morseBtn.addEventListener("click", function toggleMode() {
    if (mode === 2) {
        setMode(3);
    } else if (mode === 3) {
        setMode(2);
    }
});

cross.addEventListener("click", function clearInput() {
    input.value = "";
    res.value = "";
});

copy.addEventListener("click", function copyRes() {
    res.select();
    document.execCommand('copy');
    res.setSelectionRange(0, 0);
    res.blur(); 
    copiedText.style.display = "block";
    setTimeout(function(){ copiedText.style.display = "none" }, 5000);
});


// Functions
/**
 * Converts a list to map
 * @param {*} list List which will become a map
 */
function buildMap(mode) {
    let newMap = new Map();
    let i = 0;
    switch (mode) {
        case 1:
            for (element of morseAlphabet) {
                newMap.set(element[0], element[1]);
            }
            break;
        case 2:
            for (element of morseAlphabet) {
                newMap.set(element[1], element[0]);
            }
            break;
        default:
            console.log("mode inconnu");
            return false;
    }
    return newMap;
}

/**
 * Gets textArea value 
 * Sets textArea value in a global variable named inputVal
 */
function getInput() {
    inputVal = input.value;
};

/**
 * Splits inputVal string into an array of characters
 * @param {*} spliter Character which split the string named inputVal
 */
function splitStr(spliter) {
    inputVal = inputVal.split(spliter);
};

/**
 * Checks if each characters of inputVal array is includes into the map of the mode activated
 * Returns true if there is no unknown characters
 * Returns false if there is at least one unknown characters and calls displayError function
 * @param {*} usedMap Map which need to used
 */
function checkCharacters(usedMap, str) {
    let i = 0;
    for (character of str) {
        if (usedMap.get(character) === undefined) {
            if (problematicChar.includes(character) === false && character !== "") {
                problematicChar.push(character);
            } else {
                i = i + 1;
            }
        } else {
            i = i + 1;
        }
    }
    for (char of problematicChar) {
        if (str.includes(char) === false) {
            problematicChar.splice(char, 1);
        }
    }


    if (i == str.length) {
        return true;
    } else {
        displayError();
        return false;
    }
};

function hideError()  {
    errorContainer.style.background = "";
    error.style.opacity = "0";
}

/**
 * Diplays characters not supported in the input textarea
 */
function displayError() {
    console.error(problematicChar); 
    if (inputVal.includes(problematicChar[length])) {
        errorContainer.setAttribute("aria-hidden", "false");
        errorContainer.style.background = "#F97D71";
        error.style.opacity = "1";
        error.textContent = "Unknown character, please remove : " + problematicChar[length];
    }
};

/**
 * Depending on the mode, concats elements of inputVal into a final string named resultString
 * If character is "\n", don't add space after
 * @param {*} usedMap Map which need to use
 */
function concatStr(usedMap) {
    resultString = "";
    for (character of inputVal) {
        if (mode === 1) {
            if (character === "\n") {
                resultString += usedMap.get(character);
            } else {
                resultString += usedMap.get(character) + " ";
            }
        } else if (mode === 2) {
            resultString += usedMap.get(character);
        }
    }

    if (mode === 1) {
        resultString = resultString.trim();
    }
};

/**
 * Displays the right contents of textarea headers
 * Sets the new mode in the global variable named mode
 * @param {*} modeValue Value of the mode choose
 */
function setMode(modeValue) {
    switch (modeValue) {
        case 1:
            text1.textContent = "Latin";
            text2.textContent = "Morse";
            morseBtn.style.display = "none";
            mode = 1;
            break;
        case 2:
            text1.textContent = "Morse";
            text2.textContent = "Latin";
            morseBtn.style.display = "flex";
            morseBtn.style.background = "#dbdbdb";
            morseBtnHead.style.left = "5px";
            mode = 2;
            break;
        case 3: 
            text1.textContent = "Morse";
            text2.textContent = "Latin";
            morseBtn.style.display = "flex";
            morseBtn.style.background = "#5CD44C";
            morseBtnHead.style.left = "32px";
            mode = 3;
            break;  
        default:
            console.error("Mode inconnu");
    }
};