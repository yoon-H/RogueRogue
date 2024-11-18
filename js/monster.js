import { Tools } from './tools.js'

export class Monster {
    constructor(stage) {
        this._isDead = false;
        this._hp = 20 + (10 * (stage - 1));
        this._minDamage = 1 + (5 * (stage - 1));
        this._maxDamage = 4 + (5 * (stage - 1));
    }

    get isDead() {
        return this._isDead;
    }

    get speed() {
        return this._speed;
    }

    // 피격

    get hp() {
        return this._hp;
    }

    set hp(value) {
        if (typeof value === 'Number') this._hp = value;
    }

    //공격력
    get damage() {
        //데미지 값 랜덤 계산
        let amount = Tools.getRandomNum(this._minDamage, this._maxDamage);

        return amount;
    }

    takeDamage(damage) {
        this._hp = this._hp - damage;

        if (this._hp <= 0) {
            this._hp = 0;

            this._isDead = true; //dead
        }
    }

    attackAmount() {
        return (this._maxDamage + this._minDamage) / 2;
    }

}