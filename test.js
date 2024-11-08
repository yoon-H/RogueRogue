import keypress from 'keypress';
keypress(process.stdin);

const options = ["Option 1", "Option 2", "Option 3", "Option 4"];
let selectedIndex = 0;

function renderOptions() {
    console.clear();
    options.forEach((option, index) => {
        if (index === selectedIndex) {
            console.log(`> ${option}`); // 현재 선택된 항목에 화살표 표시
        } else {
            console.log(`  ${option}`);
        }
    });
    console.log("\nUse 1 (up), 2 (down), and Enter to select.");
}

// 키 입력 처리
process.stdin.on("keypress", (ch, key) => {
    console.log(key.name);
    if (key && key.name === "up" || ch === '1') {
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        renderOptions();
    } else if (key && key.name === "down" || ch === '2') {
        selectedIndex = (selectedIndex + 1) % options.length;
        renderOptions();
    } else if (key && key.name === "return") {
        console.log(`\nYou selected: ${options[selectedIndex]}`);
        process.exit();
    } else if (key && key.ctrl && key.name === "c") {
        process.exit();
    }
});

process.stdin.setRawMode(true);
process.stdin.resume();
renderOptions();