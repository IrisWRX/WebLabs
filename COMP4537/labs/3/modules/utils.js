class Utils {
    static getDate() {
        return new Date().toString();
    }
}

module.exports = {
    getDate: Utils.getDate
}