let gameInterval = null; // 演化定时器
let grid = []; // 存储网格状态：true=活，false=死
let ROWS = 30; // 网格行数
let COLS = 20; // 网格列数
const interval = 200; // 固定演化间隔时间（毫秒）

// 更新状态显示
function updateStatus(text) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = text;
    }
}

// 初始化网格
function initGrid() {
    const gridDom = document.getElementById('grid');
    // 动态设置CSS变量以匹配配置
    gridDom.style.setProperty('--cols', COLS);
    // 根据列数调整单元格大小以适应屏幕
    const cellSize = COLS > 30 ? '12px' : '15px';
    gridDom.style.setProperty('--cell-size', cellSize); // 可以根据需要调整单元格大小
    gridDom.innerHTML = '';
    grid = [];
    // 生成二维数组+DOM节点
    for (let i = 0; i < ROWS; i++) {
        grid[i] = [];
        for (let j = 0; j < COLS; j++) {
            grid[i][j] = false;
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            // 鼠标点击切换细胞状态
            cell.addEventListener('click', () => toggleCell(i, j));
            gridDom.appendChild(cell);
        }
    }
    updateStatus('Grid initialized. Click cells to set initial state.');
}

// 切换细胞生死状态
function toggleCell(row, col) {
    grid[row][col] = !grid[row][col];
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    cell.classList.toggle('alive', grid[row][col]);
}

// 计算邻居活细胞数量（核心规则）
function countLiveNeighbors(row, col) {
    let count = 0;
    // 遍历周围8个方向
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue; // 跳过自身
            const r = row + i;
            const c = col + j;
            // 边界判断+是否存活
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c]) {
                count++;
            }
        }
    }
    return count;
}

// 一次演化逻辑
function evolve() {
    // 深拷贝原网格（避免实时修改影响结果）
    const newGrid = JSON.parse(JSON.stringify(grid));
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const liveNeighbors = countLiveNeighbors(i, j);
            // 康威核心规则
            if (grid[i][j]) {
                // 活细胞：邻居≠2/3 → 死亡
                newGrid[i][j] = liveNeighbors === 2 || liveNeighbors === 3;
            } else {
                // 死细胞：邻居=3 → 诞生
                newGrid[i][j] = liveNeighbors === 3;
            }
        }
    }
    // 更新网格状态+DOM
    grid = newGrid;
    updateGridDom();
}

// 更新DOM节点状态
function updateGridDom() {
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
            cell.classList.toggle('alive', grid[i][j]);
        }
    }
}

// 获取网格大小设置
function getGridSize() {
    const rowsInput = document.getElementById('rows');
    const colsInput = document.getElementById('cols');
    
    // 设置默认值以防输入无效
    const newRows = Math.max(5, Math.min(50, parseInt(rowsInput.value) || 30));
    const newCols = Math.max(5, Math.min(50, parseInt(colsInput.value) || 20));
    
    // 更新输入框值，确保显示的是有效的值
    rowsInput.value = newRows;
    colsInput.value = newCols;
    
    return { rows: newRows, cols: newCols };
}

// 应用网格大小
function applyGridSize() {
    // 停止当前模拟
    clearInterval(gameInterval);
    gameInterval = null;
    
    // 获取新的网格大小
    const { rows, cols } = getGridSize();
    ROWS = rows;
    COLS = cols;
    
    // 重置控制按钮状态
    const startBtn = document.getElementById('start');
    const pauseBtn = document.getElementById('pause');
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    // 重新初始化网格
    initGrid();
    updateStatus(`Grid resized to ${ROWS}x${COLS}. Ready to start simulation.`);
}

// 绑定按钮事件
function bindEvents() {
    const startBtn = document.getElementById('start');
    const pauseBtn = document.getElementById('pause');
    const resetBtn = document.getElementById('reset');
    const applySizeBtn = document.getElementById('apply-size');

    // 开始演化
    startBtn.addEventListener('click', () => {
        if (!gameInterval) {
            gameInterval = setInterval(evolve, interval);
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            updateStatus('Simulation running...');
        }
    });

    // 暂停演化
    pauseBtn.addEventListener('click', () => {
        clearInterval(gameInterval);
        gameInterval = null;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        updateStatus('Simulation paused');
    });

    // 重置网格
    resetBtn.addEventListener('click', () => {
        clearInterval(gameInterval);
        gameInterval = null;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        initGrid();
        updateStatus('Grid reset. Ready to start simulation');
    });
    
    // 应用网格大小
    applySizeBtn.addEventListener('click', applyGridSize);
}

// 页面加载初始化
window.onload = () => {
    initGrid();
    bindEvents();
};