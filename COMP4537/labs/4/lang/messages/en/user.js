export const messages = {
    emptyFields: "Please fill in both the word and definition fields.",
    emptySearch: "Please enter a word to search.",
    nonAlphaWord: "The word must contain only alphabetic characters.",
    storeSuccess: "Definition stored successfully!",
    networkError: "Network error occurred. Please try again.",
    notFound: "No definition found for the word: ",
    newEntry: (word, definition, count) => 
        `New entry recorded: "${word}: ${definition}"\nTotal entries: ${count}`,
    wordExists: (word) => 
        `Warning! Word "${word}" already exists.`,
    requestPrefix: (count) => 
        `Request #${count}\n`,
    wordNotFound: (word) => 
        `Word "${word}" not found!`
}