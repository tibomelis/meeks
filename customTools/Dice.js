class Dice {
    num = 1;
    sides = 0;

    constructor(sides = 6) {
        this.sides = sides;
        this.roll();
    }

    roll() {
        this.num = Math.floor(Math.random() * this.sides) + 1;
        return this.num;
    }
}

module.exports = Dice;
