export class GameManager {
    static isGameOver = false;
    static currentStage = 1;


    static reset() {
        this.isGameOver = false;
        this.currentStage = 1;
    }
}