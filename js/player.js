import { Point } from './map.js'
import { Tools } from './tools.js'


export class Player {
    constructor() {
        this._isDead = false;
        this._MaxHP = 50;
        this._hp = this._MaxHP;
        this._minDamage = 2;
        this._maxDamage = 3;
        this._inventory = {attack : 0, damage : 0, smoke : 0, heal : 0};
        this._loc = new Point(0, 0);
    }

    get isDead() {
        return this._isDead;
    }

    set isDead(value) {
        this._isDead = value;
    }

    get MaxHp() {
        return 40;
    }

    get hp() {
        return this._hp;
    }

    set hp(value) {
        if (typeof value === 'Number') this._hp = value;
    }

    // 데미지
    get damage() {
        //데미지 값 랜덤 계산
        let amount = Tools.getRandomNum(this._minDamage, this._maxDamage);

        return amount;
    }

    get loc() {
        return this._loc;
    }

    set loc(value) {
        this._loc = value;
    }

    takeDamage(damage) {
        this._hp = this._hp - damage;

        if (this._hp <= 0) {
            this._hp = 0;

            this._isDead = true; //dead
        }
    }

    reset() {
        this._hp = this._MaxHP;
    }

    attackAmount() {
        return Math.floor((this._maxDamage + this._minDamage) / 2);
    }

}