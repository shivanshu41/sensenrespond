import { Random } from "random-js";
const random = new Random();

const WORD_LIST_LEN = 47;
const SPECIAL_CHAR_LIST_LEN = 25;

const RandomWords = [
    "Apple",
    "Berry",
    "Chili",
    "Lemon",
    "Olive",
    "Plum",
    "Melon",
    "Beige",
    "Peach",
    "Kiwi",
    "Lime",
    "Maize",
    "Navy",
    "Onion",
    "Pink",
    "Ruby",
    "Teal",
    "Grape",
    "Blue",
    "Corn",
    "Date",
    "Fig",
    "Gold",
    "Green",
    "Ivory",
    "Mango",
    "Beet",
    "Carrot",
    "Mint",
    "Azure",
    "Guava",
    "Papaya",
    "Violet",
    "Amber",
    "Pea",
    "Pear",
    "Radish",
    "Brown",
    "Berry",
    "Plum",
    "Gray",
    "Tomato",
    "Grape",
    "Apricot",
    "Pepper",
    "Orange"
];

const SpecialChars = [
    "~",
    "!",
    "@",
    "#", 
    "$",
    "%", 
    "^", 
    "&", 
    "*", 
    "(", 
    ")", 
    "-", 
    "_", 
    "+", 
    "=", 
    "{", 
    "}", 
    "[", 
    "]", 
    ":", 
    ";", 
    "<", 
    ">", 
    ".", 
    "?"
];

export const randomPassword = async () => {
    const word1 = RandomWords[random.integer(0, WORD_LIST_LEN - 1)];
    const word2 = RandomWords[random.integer(0, WORD_LIST_LEN - 1)];
    const specialChar = SpecialChars[random.integer(0, SPECIAL_CHAR_LIST_LEN - 1)];
    const digits = `${random.integer(0, 9)}${random.integer(0, 9)}${random.integer(0, 9)}`;
    return word1 + word2 + specialChar + digits;
}