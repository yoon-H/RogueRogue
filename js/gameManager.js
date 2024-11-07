class GameManager {
    constructor() {
        this._isGameOver = false;
    }

    get isGameOver() {
        return this._isGameOver;
    }

    set isGameOver(value) {
        this._isGameOver = value;
    }
}