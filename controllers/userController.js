
const CryptoJS = require("crypto-js");
const userModel = require("../models/userModel");
const morgan = require("morgan");
// const bcrypt = require("bcrypt");
const bcrypt = require("bcrypt");
// Import csrf module
const csrf = require('csurf');
// Create CSRF protection middleware
const csrfProtection = csrf({ cookie: true });



// Decrypt encrypted password
const decryptPassword = (encryptedPassword) => {
    // Replace 'secret' with your actual secret key
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedPassword, 'secret');
    const decryptedPassword = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return decryptedPassword;
};

const rcon = [
    [0x00, 0x00, 0x00, 0x00],
    [0x01, 0x00, 0x00, 0x00],
    [0x02, 0x00, 0x00, 0x00],
    [0x04, 0x00, 0x00, 0x00],
    [0x08, 0x00, 0x00, 0x00],
    [0x10, 0x00, 0x00, 0x00],
    [0x20, 0x00, 0x00, 0x00],
    [0x40, 0x00, 0x00, 0x00],
    [0x80, 0x00, 0x00, 0x00],
    [0x1b, 0x00, 0x00, 0x00],
    [0x36, 0x00, 0x00, 0x00]
];

const inverseSbox = [
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
    0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
    0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
    0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
    0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
    0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
    0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
    0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
    0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
    0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
    0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
];


function keyExpansion(key) {
    const roundKeys = [];
    const rounds = 10;
    const words = [];
    
    for (let i = 0; i < 4 * (rounds + 1); i++) {
        if (i < 4) {
            words.push(key.slice(i * 4, (i + 1) * 4));
        } else {
            let temp = words[i - 1].slice();
            if (i % 4 === 0) {
                temp = [...xor(subWord(rotWord(temp)), rcon[i / 4]), ...temp];
            } else if (i % 4 === 4 && rounds === 10) {
                temp = [...subWord(temp), ...temp];
            }
            words.push(xor(words[i - 4], temp));
        }
    }
    
    for (let i = 0; i < rounds + 1; i++) {
        const roundKey = [];
        for (let j = 0; j < 4; j++) {
            roundKey.push(words[i * 4 + j]);
        }
        roundKeys.push(roundKey);
    }
    
    return roundKeys;
}

function xor(a, b) {
    if (!Array.isArray(a)) a = Array.from(a);
    if (!Array.isArray(b)) b = Array.from(b);
    return a.map((byte, i) => byte ^ b[i]);
}

function subWord(word) {
    return word.map(byte => inverseSbox[byte]);
}

function rotWord(word) {
    return [...word.slice(1), word[0]];
}

function invSubBytes(stateArray) {
    const newStateArray = [];
    for (let i = 0; i < stateArray.length; i++) {
        newStateArray.push([]);
        for (let j = 0; j < stateArray[i].length; j++) {
            const byte1 = parseInt(stateArray[i][j][0], 16); // Parse the first character of the hexadecimal string
            const byte2 = parseInt(stateArray[i][j][1], 16); // Parse the second character of the hexadecimal string
            const row = byte1 >> 4; // Extract the row index
            const col = byte2 & 0x0f; // Extract the column index
            newStateArray[i][j] = inverseSbox[row * 16 + col].toString(16).padStart(2, '0');
        }
    }
    return newStateArray;
}





function invShiftRows(stateArray) {
    const newStateArray = [];
    newStateArray.push([...stateArray[0]]);
    newStateArray.push([
        stateArray[1][3],
        stateArray[1][0],
        stateArray[1][1],
        stateArray[1][2]
    ]);
    newStateArray.push([
        stateArray[2][2],
        stateArray[2][3],
        stateArray[2][0],
        stateArray[2][1]
    ]);
    newStateArray.push([
        stateArray[3][1],
        stateArray[3][2],
        stateArray[3][3],
        stateArray[3][0]
    ]);
    return newStateArray;
}

function invMixColumns(stateArray) {
    const mixedStateArray = [];
    for (let col = 0; col < 4; col++) {
        const mixedColumn = invMixSingleColumn(stateArray[col]);
        mixedStateArray.push(mixedColumn);
    }
    return mixedStateArray;
}

function invMixSingleColumn(column) {
    const mixedColumn = [];
    for (let row = 0; row < 4; row++) {
        const mixedByte = invMixSingleByte(column, row);
        mixedColumn.push(mixedByte);
    }
    return mixedColumn;
}

function invMixSingleByte(column, row) {
    const factor = [0x0e, 0x0b, 0x0d, 0x09]; // The matrix used for multiplication in inverse mix columns
    let result = 0;
    for (let i = 0; i < 4; i++) {
        const columnByte = parseInt(column[i], 16); // Convert hexadecimal byte to integer
        const factorByte = factor[(i - row + 4) % 4]; // Get the factor for multiplication
        const product = multiplyInGF(columnByte, factorByte); // Multiply the bytes in GF
        result ^= product; // XOR operation to accumulate the result
    }
    return result.toString(16).padStart(2, '0'); // Convert the result back to hexadecimal
}

function multiplyInGF(a, b) {
    let result = 0;
    while (b > 0) {
        if (b & 1) {
            result ^= a;
        }
        const carry = a & 0x80; // Check if the leftmost bit is set
        a = (a << 1) & 0xFF; // Left shift by 1, modulo 256
        if (carry) {
            a ^= 0x1b; // XOR with the irreducible polynomial x^8 + x^4 + x^3 + x + 1
        }
        b >>= 1; // Right shift by 1
    }
    return result;
}

function invAddRoundKeyForRound(stateArray, roundKeysArrayHex, round) {
    const roundKey = roundKeysArrayHex[round];
    const newStateArray = [];
    for (let i = 0; i < 4; i++) {
        newStateArray.push([]);
        for (let j = 0; j < 4; j++) {
            newStateArray[i][j] = xorBytes(stateArray[i][j], roundKey[i][j]);
        }
    }
    return newStateArray;
}
function xorBytes(a, b) {
    return a ^ b;
}

function decryptAES128(ciphertext) {
    const key = [
        '05', 'ba', '6d', '3c',
        'b6', '1a', 'ee', '6f',
        '4a', 'b5', '10', '4b',
        '81', '38', 'b1', '7a'
    ]; // Decryption key
    const roundKeys = keyExpansion(key);

    // Modify stateArray generation to fill column-wise
    const stateArray = [];
    for (let i = 0; i < 4; i++) {
        stateArray.push([]);
        for (let j = 0; j < 4; j++) {
            const byte1 = parseInt(ciphertext[j][i].substring(0, 2), 16);
            const byte2 = parseInt(ciphertext[j][i].substring(2), 16);
            stateArray[i].push([byte1, byte2]);
        }
    }

    

    let currentStateArray = stateArray;

    // Perform decryption rounds
    for (let round = 9; round >= 0; round--) {
        currentStateArray = invAddRoundKeyForRound(currentStateArray, roundKeys, round);
       
        if (round < 9) {
            currentStateArray = invMixColumns(currentStateArray);
            
        }

        currentStateArray = invShiftRows(currentStateArray);
       

        currentStateArray = invSubBytes(currentStateArray);
       
    }

    // Final round
    
    currentStateArray = invAddRoundKeyForRound(currentStateArray, roundKeys, 0);
    

    return currentStateArray;
}


// Example usage:
const ciphertext = [
    ['d6', '5c', 'e3', 'c6'],
    ['a1', 'df', 'f4', '48'],
    ['ce', '86', '9b', 'cb'],
    ['f2', '14', 'd1', 'f4']
]; // Input ciphertext


const plaintext = decryptAES128(ciphertext);


const loginController = async (req, res) => {
    try {

        // Check if CSRF token is missing or invalid
        if (!req.csrfToken()) {
            return res.status(403).json({ message: 'CSRF token missing or invalid' });
        }
        // Log CSRF token
        console.log("CSRF token for login:", req.csrfToken());

        const { email, password } = req.body;
        // Decrypt password before querying the database
        const decryptedPassword = decryptPassword(password);

        // Log user login request
        console.log("User login request:", { email, password });
        // const isMatch = await bcrypt.compare()
        const user = await userModel.findOne({email});
        if (!user) {
            return res.status(404).send("User not found");
        }
        if(user){
            const isValid = await bcrypt.compare(decryptedPassword,user.password);
            if(!isValid){
                return res.status(404).send("Wrong credentials");
            }
            res.status(200).json(user);
        }
     } catch (error) {
        res.status(400).json({
            success: false,
            error
        });
    }
};


/////%%%%%%5
// Register callback
const registerController = async (req, res) => {
    try {

        // Check if CSRF token is missing or invalid
        if (!req.csrfToken()) {
            return res.status(403).json({ message: 'CSRF token missing or invalid' });
        }
        // Log CSRF token
        console.log("CSRF token for register:", req.csrfToken());

        const { email, password } = req.body;

        // Log user registration request
        console.log("User registration request:", { email, password });

        // Decrypt password before storing in the database
        const decryptedPassword = decryptPassword(password);
        req.body.password = decryptedPassword;

        //after decryption- hash and store pw 
        const hash = await bcrypt.hash(decryptedPassword,10);
        req.body.password=hash;

        const newUser = new userModel(req.body);
        await newUser.save();
        res.status(201).json({
            success: true,
            newUser,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error
        });
    }
};


module.exports = {
    loginController,
    registerController
};
