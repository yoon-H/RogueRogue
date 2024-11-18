import chalk from "chalk";

export class Tools {
    //랜덤 숫자 반환
    static getRandomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 엔터 누르면 종료
    static confirmInput() {
        return new Promise((resolve) => {
            function handleConfirmInput(ch, key) {
                if (key) {
                    if (key.name === "return") {

                        //입력 설정(입력 이벤트 제거)
                        process.stdin.setRawMode(false);
                        process.stdin.pause();
                        process.stdin.removeListener("keypress", handleConfirmInput); // 이벤트 리스너 제거
                        resolve(true); // 선택 완료 후 resolve 호출
                    } else if (key.ctrl && key.name === "c") {
                        process.exit();
                    }
                }
            }

            // 입력 설정
            process.stdin.on("keypress", handleConfirmInput);
            process.stdin.setRawMode(true);
            process.stdin.resume();

        })
    }

    static getItem(status = false) {

        let rand;
        if(status) rand = this.getRandomNum(0, 1);
        else rand = this.getRandomNum(0, 3);

        let item = '';
        switch (rand) {
            case 0: // 공격력 아이템
                item = 'attack';
                console.log(chalk.blue('공격력 아이템을 얻었습니다!'));
                break;
            case 1: // 체력 아이템
                item = 'hp';
                console.log(chalk.blue('체력 아이템을 얻었습니다!'));
                break;
            case 2: // 연막탄
                item = 'smoke';
                console.log(chalk.blue('연막탄을 얻었습니다!'));
                break;
            case 3: // 회복약
                item = 'heal';
                console.log(chalk.blue('회복약을 얻었습니다!'));
                break;
        }

        return item;
    }
}