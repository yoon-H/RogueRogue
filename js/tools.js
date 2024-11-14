export class Tools {
    //랜덤 숫자 반환
    static getRandomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 엔터 누르면 종료
    static confirmInput() {
        return new Promise((resolve) => {
            function handleConfirmInput(ch, key) {

                console.log("confirm : ", key);
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
}