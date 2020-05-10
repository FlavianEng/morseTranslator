/**
 * Author: Flavian Engevin
*/
var morseAlphabet = [
    // Letters
    ["a", ".-"], ["b", "-..."], ["c", "-.-."], ["d", "-.."], ["e", "."], ["f", "..-."], ["g", "--."], ["h", "...."], ["i", ".."],
    ["j", ".---"], ["k", "-.-"], ["l", ".-.."], ["m", "--"], ["n", "-."], ["o", "---"], ["p", ".--."], ["q", "--.-"], ["r", ".-."],
    ["s", "..."], ["t", "-"], ["u", "..-"], ["v", "...-"], ["w", ".--"], ["x", "-..-"], ["y", "-.--"], ["z", "--.."],
    // Numbers
    ["1", ".----"], ["2", "..---"], ["3", "...--"], ["4", "....-"], ["5", "....."],
    ["6", "-...."], ["7", "--..."], ["8", "---.."], ["9", "----."], ["0", "-----"],
    // Space 
    [" ", "/"],
    // Ponctuation
    [".", ".-.-.-"], [",", "--..--"], ["?", "..--.."], ["'", ".----."], ["!", "-.-.--"], ["/", "-..-."],
    ["(", "-.--."], [")", "-.--.-"], ["&", ".-..."], [":", "---..."], [";", "-.-.-."], ["=", "-...-"],
    ["+", ".-.-."], ["-", "-....-"], ["_", "..--.-"], ["\"", ".-..-."], ["$", "...-..-"],
    // Specials characters
    ["à", ".--.-"], ["ç", "-.-.."], ["è", ".-..-"], ["é", "..-.."], ["@", ".--.-."], ["\n", "\n"]
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
const copiedText = document.querySelector('#copy > span:nth-child(1)');
const morseBtn = document.getElementById("morseBtn");
const morseBtnHead = document.getElementById("morseBtnHead");
const mode3Helper = document.getElementsByClassName("helper")[0];

// Globals var
var inputVal = "";
var resultString = "";
var errorList = [];
var errorDisplayed = false;
// mode 1 =  latin to morse code
// mode 2 = morse code to latin
// mode 3 = morse code to latin with simulation on
var mode = 1;
var pressStart, pressEnd, releaseStart, releaseEnd, pressDuration, releaseDuration;
var spaceBarDown = false;

// Main
var latinToMorse = buildMap(1);
var morseToLatin = buildMap(2);
showCrossAndCopy();

input.addEventListener("input", function translate() {
    if (mode === 1) {
        init('');
        Translation(latinToMorse, inputVal);
        resultString = resultString.trim();
        res.value = resultString;
    } else if (mode === 2) {
        init('\n');
        for (line of inputVal) {
            let splittedLine = line.split(' ');
            if (resultString !== "") {
                resultString += "\n";
            }
            Translation(morseToLatin, splittedLine);
        }
        res.value = resultString;
    } else {
        showError()
    }
    showCrossAndCopy();
});

exchangeBtn.addEventListener("click", function exchangeMode() {
    if (mode === 1) {
        setMode(2);
    } else if (mode === 2 || mode === 3) {
        setMode(1);
    }
    [input.value, res.value] = [res.value, input.value];
    errorList = [];
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
    errorList = [];
    showError();
    cross.style.display = "none";
    copy.style.display = "none";
});

copy.addEventListener("click", function copyRes() {
    res.select();
    document.execCommand('copy');
    res.setSelectionRange(0, 0);
    res.blur();
    copiedText.style.display = "flex";
    copiedText.textContent = "Copied";
    setTimeout(function () {
        copiedText.style.removeProperty("display");
        copiedText.textContent = "Copy content";
    }, 2000);
});

document.addEventListener("keydown", function simulationModeDown(e) {
    if (mode === 3) {
        e.preventDefault();
        if (e.keyCode === 32) {
            if (spaceBarDown) return;
            spaceBarDown = true;

            // Press block
            pressStart = new Date();

            // Release block
            releaseEnd = new Date();
            releaseDuration = releaseEnd - releaseStart;
            inputWriting(releaseDuration, false);
            translateMode3();
        }
    }
});

document.addEventListener("keyup", function simulationModeUp(e) {
    e.preventDefault();
    if (mode === 3) {
        if (e.keyCode === 32) {
            spaceBarDown = false;

            // Release block
            releaseStart = new Date();

            // Press block
            pressEnd = new Date();
            pressDuration = pressEnd - pressStart;
            inputWriting(pressDuration, true);
            translateMode3();
        }
    }
});


// Functions
/**
 * Converts a list to a map depending the mode given in parameter
 * @param {number} mode mode given (Have to be equal to 1 or 2)
 * If mode is unknown, displays an error
 */
function buildMap(mode) {
    let newMap = new Map();
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
            showError();
    }
    return newMap;
}

/**
 * Displays the right UI 
 * Sets the new mode in the global variable named mode
 * @param {number} modeValue Value of the mode choose
 */
function setMode(modeValue) {
    switch (modeValue) {
        case 1:
            text1.textContent = "Latin";
            text2.textContent = "Morse";
            morseBtn.style.display = "none";
            mode3Helper.style.display = "none";
            input.removeAttribute("readonly");
            input.style.removeProperty("cursor");
            mode = 1;
            break;
        case 2:
            text1.textContent = "Morse";
            text2.textContent = "Latin";
            morseBtn.style.display = "flex";
            morseBtn.style.background = "#dbdbdb";
            morseBtnHead.style.left = "5px";
            mode3Helper.style.display = "none";
            input.removeAttribute("readonly");
            input.style.removeProperty("cursor");
            mode = 2;
            break;
        case 3:
            text1.textContent = "Morse";
            text2.textContent = "Latin";
            morseBtn.style.display = "flex";
            morseBtn.style.background = "#5CD44C";
            morseBtnHead.style.left = "32px";
            mode3Helper.style.display = "flex";
            input.setAttribute("readonly", "");
            input.style.cursor = "default";
            mode = 3;
            showCrossAndCopy();
            break;
        default:
            showError();
    }
};

/**
 * Gets input textarea value and sets in the global variable named inputVal
 * Resets the result string and the error list
 * Splits the global variable named inputVal with the splitter given in parameter
 * @param {string} splitter Character.s used to split the string
 */
function init(splitter) {
    inputVal = input.value;
    resultString = "";
    errorList = [];
    if (mode === 1) {
        inputVal = inputVal.toLowerCase();
    }
    inputVal = inputVal.split(splitter);
};

/**
 * Checks each characters exist in the map given in parameter 
 * If a characters is unknown, pushes him into error list
 * Actualises error displaying
 * @param {Object map} usedMap Map used to translate
 * @param {string} str String who'll be translate
 */
function Translation(usedMap, str) {
    for (character of str) {
        if (usedMap.get(character) === undefined) {
            if (character !== "") {
                if (errorList.includes(character) === false) {
                    errorList.push(character);
                }
            }
        } else {
            buildResultStr(usedMap, character);
        }
    }
    showError();
}


/**
 * Shows and hides errors
 * Defines the right content to displays
 * If a wrong "character" is too long, reduces him to 60 characters
 */
function showError() {
    const errorCharacters = "Unknown.s character.s, please remove : ";
    const errorMode = "Something wrong happened, thanks to reload this page.";
    let errorMessage = "", problematicChar = errorList[0];
    if (mode !== 1 && mode !== 2 && mode !== 3) {
        errorMessage = errorMode;
    } else if (errorList.length > 0) {
        if (errorList[0].length > 60) {
            problematicChar = errorList[0].length.substring(0, 60);
        }
        errorMessage = errorCharacters + problematicChar;
    }

    errorDisplayed = errorList.length === 0 ? errorDisplayed = false : errorDisplayed = true;

    if (errorDisplayed || mode !== 1 && mode !== 2 && mode !== 3) {
        error.textContent = errorMessage;
        errorContainer.style.display = "flex";
    } else {
        errorContainer.style.display = "none";
    }
}

/**
 * Depending the mode, builds the result string with map and character given in parameters
 * @param {*} usedMap Map used to translate
 * @param {*} character Character who'll be translate
 */
function buildResultStr(usedMap, character) {
    switch (mode) {
        case 1:
            if (character === "\n") {
                resultString += usedMap.get(character);
            } else {
                resultString += usedMap.get(character) + " ";
            }
            break;
        case 2:
        case 3:
            resultString += usedMap.get(character);
            break;
        default:
            showError();
    }
}

/**
 * Writes the character that correponds with duration and boolean given in parameters
 * @param {number} duration Difference between two dates
 * @param {boolean} bool If true write "dit" and "dat" else write spaces
 */
function inputWriting(duration, bool) {
    if (bool) {
        if (duration > 0 && duration <= 800) {
            input.value += ".";
        } else if (duration >= 1000) {
            input.value += "-";
        }
    } else {
        if (input.value !== "" && input.value !== " ") {
            if (duration > 1000 && duration <= 3000) {
                input.value += " ";
            } else if (duration > 3500) {
                if (input.value !== "" || input.value !== " ") {
                    input.value += " / ";
                }
            }
        }
    }
}

/**
 * Translation process for mode 3
 */
function translateMode3() {
    init(' ');
    Translation(morseToLatin, inputVal);
    res.value = resultString;
    showCrossAndCopy();
}

/**
 * Clears text areas
 * Empties error list 
 * Actualises error displaying
 */
function clearOutputs() {
    input.value = "";
    res.value = "";
    errorList = [];
    showError();
}

/**
 * Shows or hides cross and copy buttons
 */
function showCrossAndCopy() {
    if (input.value != "") {
        cross.style.display = "flex";
        copy.style.display = "flex";
    } else {
        cross.style.display = "none";
        copy.style.display = "none";
    }
}