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
// const copiedText = document.getElementById("copied");
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

input.addEventListener("input", function translate() {
    if (mode === 1) {
        getInput();
        inputVal = inputVal.toLowerCase();
        splitStr('');
        Translation(latinToMorse, inputVal);
        returnResultStr();
    } else if (mode === 2) {
        var inputStr = "";
        getInput();
        inputStr = inputVal.split(/\s/gm);
        if (checkCharacters(morseToLatin, inputStr)) {
            showError();
            splitStr('\n');
            var lines = [];
            for (i of inputVal) {
                inputVal[i] = i.split(" ");
                lines.push(inputVal[i]);
            }
            resultString = "";
            for (line of lines) {
                let counter = 0;
                for (part of line) {
                    if (morseToLatin.get(part) !== undefined) {
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
            showError();
        }
    } else if (mode === 3) {
        translateSimulationMode();
    } else {
        showError()
    }

    if (input.value != "") {
        cross.style.display = "flex";
        copy.style.display = "flex";
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
        if (e.keyCode !== 32 && e.keyCode !== 8 && e.keyCode !== 83) {
            e.preventDefault();
        }
        if (e.keyCode === 32) {
            e.preventDefault();
            if (spaceBarDown) return;
            spaceBarDown = true;

            // Press block
            pressStart = new Date();

            // Release block
            releaseEnd = new Date();
            releaseDuration = releaseEnd - releaseStart;
            inputWriting(releaseDuration, false);
            translateSimulationMode();
        }
        if (e.keyCode === 83) {
            e.preventDefault();
            position = e.target.selectionStart;
            input.value = [input.value.slice(0, position), " ", input.value.slice(position)].join('');
        }
    }
});

document.addEventListener("keyup", function simulationModeUp(e) {
    if (mode === 3) {
        e.preventDefault();
        if (e.keyCode === 32) {
            spaceBarDown = false;

            // Release block
            releaseStart = new Date();

            // Press block
            pressEnd = new Date();
            pressDuration = pressEnd - pressStart;
            inputWriting(pressDuration, true);
            translateSimulationMode();
        }
    }
});


// Functions
/**
 * Converts a list given in parameter to map
 * @param {number} list List which will become a map
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
            errorContainer.setAttribute("aria-hidden", "false");
            errorContainer.style.background = "#F97D71";
            error.style.opacity = "1";
            error.textContent = "Something wrong happened, thanks to reload this page.";
            return false;
    }
    return newMap;
}

/**
 * Displays the right contents of textarea headers
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
            mode = 1;
            break;
        case 2:
            text1.textContent = "Morse";
            text2.textContent = "Latin";
            morseBtn.style.display = "flex";
            morseBtn.style.background = "#dbdbdb";
            morseBtnHead.style.left = "5px";
            mode3Helper.style.display = "none";
            mode = 2;
            break;
        case 3:
            text1.textContent = "Morse";
            text2.textContent = "Latin";
            morseBtn.style.display = "flex";
            morseBtn.style.background = "#5CD44C";
            morseBtnHead.style.left = "32px";
            clearOutputs();
            mode3Helper.style.display = "flex";
            mode = 3;
            break;
        default:
            errorContainer.setAttribute("aria-hidden", "false");
            errorContainer.style.background = "#F97D71";
            error.style.opacity = "1";
            error.textContent = "Something wrong happened, thanks to reload this page.";
    }
};

/**
 * Gets textArea value 
 * Sets textArea value in the global string named inputVal
 */
function getInput() {
    inputVal = input.value;
};

/**
 * Splits inputVal string into an array of characters
 * @param {string} spliter Character or Regex which split the global string named inputVal
 */
function splitStr(spliter) {
    inputVal = inputVal.split(spliter);
};

/**
 * Checks if each characters of inputVal array is includes into the map of the mode activated
 * Returns true if there is no unknown characters
 * Returns false if there is at least one unknown characters and calls showError function
 * @param {Object - map} usedMap Map which need to used
 * @param {string} str String which is used
 */
function checkCharacters(usedMap, str) {
    let i = 0;
    for (character of str) {
        if (usedMap.get(character) === undefined) {
            if (errorList.includes(character) === false && character !== "") {
                errorList.push(character);
            } else if (character == "") {
                i = i + 1;
            }
        } else {
            i = i + 1;
        }
    }
    for (char of errorList) {
        if (str.includes(char) === false) {
            errorList.splice(char, 1);
        }
    }

    if (i == str.length) {
        return true;
    } else {
        return false;
    }
};

function Translation(usedMap, str) {
    resultString = "";
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
    for (char of errorList) {
        if (str.includes(char) === false) {
            errorList.splice(char, 1);
        }
    }
    showError();
}

/**
 * Shows and hides errors
 */
function showError() {
    errorDisplayed = errorList.length === 0 ? errorDisplayed = false : errorDisplayed = true;

    if (errorDisplayed) {
        errorContainer.setAttribute("aria-hidden", "false");
        errorContainer.style.background = "#F97D71";
        error.style.opacity = "1";
        error.textContent = "Unknown.s character.s, please remove every : " + errorList[length];
    } else {
        errorContainer.style.background = "";
        error.style.opacity = "0"
    }
}

/**
 * Depending on the mode, concats elements of inputVal into a final string named resultString
 * If character is "\n", don't add space after
 * @param {Object - map} usedMap Map which need to use
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
        } else if (mode === 3) {
            if (usedMap.get(character) !== undefined) {
                resultString += usedMap.get(character);
            }
        }
    }

    if (mode === 1) {
        resultString = resultString.trim();
    }
};

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
            break;
        case 3:
            if (usedMap.get(character) !== undefined) {
                resultString += usedMap.get(character);
            }
            break;
        default:
            console.error("Y'a une errreur");
    }
}

function returnResultStr() {
    resultString = resultString.trim();
    res.value = resultString;
}

/**
 * Writes the character that correponds with duration and bool
 * @param {number} duration Difference between two dates
 * @param {boolean} bool If true write dit and dat else write spaces
 */
function inputWriting(duration, bool) {
    if (bool) {
        if (duration > 0 && duration <= 800) {
            input.value += ".";
        } else if (duration >= 1300) {
            input.value += "-";
        }
    } else {
        if (input.value !== "" && input.value !== " ") {
            if (duration > 1000 && duration <= 2500) {
                input.value += " ";
            } else if (duration > 4000) {
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
function translateSimulationMode() {
    getInput();
    splitStr(' ');
    if (checkCharacters(morseToLatin, inputVal)) {
        showError();
        concatStr(morseToLatin);
        res.value = resultString;
    } else {
        showError();
    }

    if (input.value != "") {
        cross.style.display = "flex";
        copy.style.display = "flex";
    } else {
        cross.style.display = "none";
        copy.style.display = "none";
    }
}

/**
 * Clears text areas
 * Emptys errorList & actualise
 */
function clearOutputs() {
    input.value = "";
    res.value = "";
    errorList = [];
    showError();
}
