export class Monster {
    constructor() {
        this._level = 1;
        this._hp = 60;
        this._minDamage = 2;
        this._maxDamage = 12;
        this._speed = 5;
        this._equipment = {};       // 장비 칸
        this._statusEffect = {};    // 상태 이상 칸
        this._buffEffect = {};      // 속성 버프 칸
    }

    get level() {
        return this._level;
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
        let amount = Math.floor(Math.random() * (this._maxDamage - this._minDamage + 1)) + this._minDamage;

        return amount;
    }

    takeDamage(damage) {
        hp = hp - damage;

        if (hp <= 0) {
            //TODO give exp
            //TODO give random item

            return true; //dead
        }
    }

}