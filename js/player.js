import { Point } from './map.js'
import { Tools } from './tools.js'


export class Player {
    constructor() {
        this._isDead = false;
        this._MaxHP = 50;
        this._hp = this._MaxHP;
        this._minDamage = 2;
        this._maxDamage = 3;
        this._inventory = {attack : 0, hp : 0, smoke : 0, heal : 0};
        this._loc = new Point(0, 0);
    }

    get isDead() {
        return this._isDead;
    }

    set isDead(value) {
        this._isDead = value;
    }

    get MaxHp() {
        return this._MaxHP + 10 * Math.floor(this._inventory['hp'] /3); //3개 모으면 최대 체력 + 10
    }

    get hp() {
        return this._hp;
    }

    set hp(value) {
        if (typeof value === 'Number') this._hp = value;
    }

    get inventory() {
        return this._inventory;
    }

    get minDamage() {
        return this._minDamage + 5 * Math.floor(this._inventory['attack'] /3); //3개 모으면 데미지 + 5
    }

    get maxDamage() {
        return this._maxDamage + 5 * Math.floor(this._inventory['attack'] /3);
    }


    // 데미지
    get damage() {
        //데미지 값 랜덤 계산
        let amount = Tools.getRandomNum(this.minDamage, this.maxDamage);

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

            this.isDead = true; //dead
        }
    }

    reset() {
        this._hp = this.MaxHp;
    }

    attackAmount() {
        return Math.floor((this.maxDamage + this.minDamage) / 2);
    }

    useHealItem() {
        this._hp += Math.floor(this.MaxHp * 5 / 10);

        if(this._hp > this.MaxHp) this._hp = this.MaxHp;
    }

}