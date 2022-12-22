function generateMessage(username, text) {
    return {
        username,
        text,
        createdAt: new Date().getTime(),
    };
}

function generateLocationMessage(username, url) {
    return {
        username,
        url,
        createdAt: new Date().getTime(),
    };
}

export {
    generateLocationMessage,
    generateMessage,
};
