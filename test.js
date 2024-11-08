import keypress from 'keypress';
keypress(process.stdin);

function selectOption() {
    const options = ["Option 1", "Option 2", "Option 3", "Option 4"];
    let index = 0;

    return new Promise((resolve) => {
        renderOptions(options, index);

        select(options, index, resolve);  // resolve를 파라미터로 전달
    });

}



function renderOptions(options, selectedIndex) {
    console.clear();
    console.log(options);
    options.forEach((option, index) => {
        if (index === selectedIndex) {
            console.log(`> ${option}`); // 현재 선택된 항목에 화살표 표시
        } else {
            console.log(`  ${option}`);
        }
    });
    console.log("\nUse 1 (up), 2 (down), and Enter to select.");
}

function select(options, selectedIndex, resolve) {
    process.stdin.setRawMode(true);
    process.stdin.resume();

    // 키 입력 처리
    process.stdin.on("keypress", (ch, key) => {
        console.log(key.name);
        if (key && key.name === "up" || ch === '1') {
            selectedIndex = (selectedIndex - 1 + options.length) % options.length;
            renderOptions(options, selectedIndex);
        } else if (key && key.name === "down" || ch === '2') {
            selectedIndex = (selectedIndex + 1) % options.length;
            renderOptions(options, selectedIndex);
        } else if (key && key.name === "return") {
            console.log(`\nYou selected: ${options[selectedIndex]}`);
            process.stdin.setRawMode(false);
            process.stdin.pause();
            resolve(selectedIndex);
        } else if (key && key.ctrl && key.name === "c") {
            process.exit();
        }
    });

}

async function play() {
    let result = await selectOption();

    console.log("result : " + result);
}

play();