// Chess Evolution - Full Chess Game with AI & Learning System
(function() {
    // ══════════════════════════════════════
    // ── SCREENS & NAVIGATION ──
    // ══════════════════════════════════════
    const screens = {
        menu: document.getElementById('menu-screen'),
        settings: document.getElementById('settings-screen'),
        game: document.getElementById('game-screen')
    };

    function showScreen(name) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[name].classList.add('active');
    }

    document.getElementById('play-human-btn').onclick = () => {
        gameMode = 'human';
        initGame();
        showScreen('game');
    };
    document.getElementById('play-ai-btn').onclick = () => {
        gameMode = 'ai';
        initGame();
        showScreen('game');
    };
    document.getElementById('settings-btn').onclick = () => showScreen('settings');
    document.getElementById('settings-back-btn').onclick = () => showScreen('menu');
    document.getElementById('game-menu-btn').onclick = () => showScreen('menu');
    document.getElementById('game-settings-btn').onclick = () => showScreen('settings');

    // ══════════════════════════════════════
    // ── SETTINGS ──
    // ══════════════════════════════════════
    const settings = {
        dragDrop: false,
        showLegalMoves: true,
        highlightLastMove: true,
        showCoords: true,
        theme: 'classic'
    };

    const optDragDrop = document.getElementById('opt-dragdrop');
    const optLegalMoves = document.getElementById('opt-legalmoves');
    const optLastMove = document.getElementById('opt-lastmove');
    const optCoords = document.getElementById('opt-coords');
    const optTheme = document.getElementById('opt-theme');

    function loadSettings() {
        optDragDrop.checked = settings.dragDrop;
        optLegalMoves.checked = settings.showLegalMoves;
        optLastMove.checked = settings.highlightLastMove;
        optCoords.checked = settings.showCoords;
        optTheme.value = settings.theme;
    }

    optDragDrop.onchange = () => { settings.dragDrop = optDragDrop.checked; renderBoard(); };
    optLegalMoves.onchange = () => { settings.showLegalMoves = optLegalMoves.checked; renderBoard(); };
    optLastMove.onchange = () => { settings.highlightLastMove = optLastMove.checked; renderBoard(); };
    optCoords.onchange = () => { settings.showCoords = optCoords.checked; applyCoords(); };
    optTheme.onchange = () => { settings.theme = optTheme.value; applyTheme(); };

    document.getElementById('opt-reset-ai').onclick = () => {
        if (confirm('Reset all AI progress? This cannot be undone.')) {
            aiData = { elo: 800, gamesPlayed: 0, wins: 0, losses: 0, draws: 0, experience: 0 };
            learnData = { positionScores: {} };
            saveAIData();
            saveLearningData();
            updateAIDisplay();
        }
    };

    function applyTheme() {
        const board = document.getElementById('chessboard');
        board.className = '';
        board.classList.add('theme-' + settings.theme);
        // Re-render to apply theme classes to grid
        renderBoard();
    }

    function applyCoords() {
        const area = document.getElementById('board-area');
        if (settings.showCoords) area.classList.remove('coords-hidden');
        else area.classList.add('coords-hidden');
    }

    function renderCoords() {
        const files = 'abcdefgh';
        const ranks = '87654321';
        ['coord-top', 'coord-bottom'].forEach(id => {
            const el = document.getElementById(id);
            el.innerHTML = '';
            for (let i = 0; i < 8; i++) {
                const s = document.createElement('span');
                s.textContent = files[i];
                el.appendChild(s);
            }
        });
        ['coord-left', 'coord-right'].forEach(id => {
            const el = document.getElementById(id);
            el.innerHTML = '';
            for (let i = 0; i < 8; i++) {
                const s = document.createElement('span');
                s.textContent = ranks[i];
                el.appendChild(s);
            }
        });
    }

    // ══════════════════════════════════════
    // ── AI MODULE ──
    // ══════════════════════════════════════
    let gameMode = 'human';
    let aiThinking = false;
    let gameOver = false;

    const AI_STORAGE_KEY = 'chessEvolution_ai';

    function loadAIData() {
        try {
            const saved = localStorage.getItem(AI_STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch(e) {}
        return { elo: 800, gamesPlayed: 0, wins: 0, losses: 0, draws: 0, experience: 0 };
    }

    function saveAIData() {
        try { localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(aiData)); } catch(e) {}
    }

    let aiData = loadAIData();

    // ── LEARNING SYSTEM ──
    const LEARN_STORAGE_KEY = 'chessEvolution_learning';

    function loadLearningData() {
        try {
            const saved = localStorage.getItem(LEARN_STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch(e) {}
        return { positionScores: {} };
    }

    function saveLearningData() {
        try { localStorage.setItem(LEARN_STORAGE_KEY, JSON.stringify(learnData)); } catch(e) {}
    }

    let learnData = loadLearningData();
    let gamePositionHashes = [];

    function getBoardHash() {
        let h = turn;
        for (let r = 0; r < 8; r++)
            for (let c = 0; c < 8; c++)
                h += board[r][c] || '.';
        return h;
    }

    function recordPositionDuringGame() {
        if (gameMode === 'ai') {
            gamePositionHashes.push(getBoardHash());
        }
    }

    function processGameLearning(result) {
        for (const hash of gamePositionHashes) {
            if (!learnData.positionScores[hash]) {
                learnData.positionScores[hash] = { w: 0, l: 0, d: 0 };
            }
            const ps = learnData.positionScores[hash];
            if (result === 'ai-win') ps.w++;
            else if (result === 'ai-loss') ps.l++;
            else ps.d++;
        }
        // Trim if storage grows too large
        const keys = Object.keys(learnData.positionScores);
        if (keys.length > 5000) {
            const sorted = keys.map(k => {
                const s = learnData.positionScores[k];
                return { k, n: s.w + s.l + s.d };
            }).sort((a, b) => b.n - a.n);
            const keep = new Set(sorted.slice(0, 3000).map(x => x.k));
            for (const k of keys) if (!keep.has(k)) delete learnData.positionScores[k];
        }
        saveLearningData();
    }

    function getLearningBonus(posHash) {
        const ps = learnData.positionScores[posHash];
        if (!ps) return 0;
        const total = ps.w + ps.l + ps.d;
        if (total === 0) return 0;
        const winRate = (ps.w - ps.l) / total;
        const confidence = Math.min(total, 10) / 10;
        return winRate * 30 * confidence;
    }

    function getAILevel() {
        return Math.min(10, 1 + Math.floor(aiData.experience / 40));
    }

    function getSearchDepth() {
        const level = getAILevel();
        if (level <= 2) return 2;
        if (level <= 5) return 3;
        if (level <= 8) return 3;
        return 4;
    }

    function getRandomness() {
        const level = getAILevel();
        if (level <= 1) return 50;
        if (level <= 2) return 35;
        if (level <= 3) return 25;
        if (level <= 4) return 18;
        if (level <= 5) return 12;
        if (level <= 6) return 8;
        if (level <= 7) return 4;
        if (level <= 8) return 2;
        return 0;
    }

    function updateAIAfterGame(result) {
        aiData.gamesPlayed++;
        if (result === 'ai-win') {
            aiData.wins++;
            aiData.elo = Math.min(2800, aiData.elo + 10);
            aiData.experience += 15;
        } else if (result === 'ai-loss') {
            aiData.losses++;
            aiData.elo = Math.max(400, aiData.elo - 5);
            aiData.experience += 30;
        } else {
            aiData.draws++;
            aiData.elo += 3;
            aiData.experience += 20;
        }
        processGameLearning(result);
        saveAIData();
        updateAIDisplay();
    }

    function updateAIDisplay() {
        const infoEl = document.getElementById('ai-info');
        if (!infoEl) return;
        if (gameMode === 'ai') {
            infoEl.classList.remove('hidden');
            const level = getAILevel();
            document.getElementById('ai-level-num').textContent = level;
            document.getElementById('ai-elo').textContent = aiData.elo;
            document.getElementById('ai-record').textContent =
                aiData.losses + 'W - ' + aiData.wins + 'L - ' + aiData.draws + 'D';
            const xpInLevel = aiData.experience % 40;
            document.getElementById('ai-xp-fill').style.width = (xpInLevel / 40 * 100) + '%';
        } else {
            infoEl.classList.add('hidden');
        }
    }

    function showThinking(show) {
        const el = document.getElementById('ai-thinking');
        if (el) el.classList.toggle('hidden', !show);
    }

    // Piece values for evaluation
    const PIECE_VALUE = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };

    // Piece-square tables (from white's perspective; flip for black)
    const PST = {
        P: [
            [ 0,  0,  0,  0,  0,  0,  0,  0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [ 5,  5, 10, 25, 25, 10,  5,  5],
            [ 0,  0,  0, 20, 20,  0,  0,  0],
            [ 5, -5,-10,  0,  0,-10, -5,  5],
            [ 5, 10, 10,-20,-20, 10, 10,  5],
            [ 0,  0,  0,  0,  0,  0,  0,  0]
        ],
        N: [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50]
        ],
        B: [
            [-20,-10,-10,-10,-10,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0, 10, 10, 10, 10,  0,-10],
            [-10,  5,  5, 10, 10,  5,  5,-10],
            [-10,  0,  5, 10, 10,  5,  0,-10],
            [-10, 10,  5, 10, 10,  5, 10,-10],
            [-10,  5,  0,  0,  0,  0,  5,-10],
            [-20,-10,-10,-10,-10,-10,-10,-20]
        ],
        R: [
            [ 0,  0,  0,  0,  0,  0,  0,  0],
            [ 5, 10, 10, 10, 10, 10, 10,  5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [ 0,  0,  0,  5,  5,  0,  0,  0]
        ],
        Q: [
            [-20,-10,-10, -5, -5,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5,  5,  5,  5,  0,-10],
            [ -5,  0,  5,  5,  5,  5,  0, -5],
            [  0,  0,  5,  5,  5,  5,  0, -5],
            [-10,  5,  5,  5,  5,  5,  0,-10],
            [-10,  0,  5,  0,  0,  0,  0,-10],
            [-20,-10,-10, -5, -5,-10,-10,-20]
        ],
        K: [
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-20,-30,-30,-40,-40,-30,-30,-20],
            [-10,-20,-20,-20,-20,-20,-20,-10],
            [ 20, 20,  0,  0,  0,  0, 20, 20],
            [ 20, 30, 10,  0,  0, 10, 30, 20]
        ]
    };

    function evaluateBoard() {
        let score = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (!piece) continue;
                const type = piece[1];
                const val = PIECE_VALUE[type];
                const pstRow = piece[0] === 'w' ? r : 7 - r;
                const pst = PST[type][pstRow][c];
                if (piece[0] === 'b') score += val + pst;
                else score -= val + pst;
            }
        }
        return score; // positive = good for black (AI)
    }

    function getAllMovesForAI(color) {
        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (board[r][c] && board[r][c][0] === color) {
                    const legal = getLegalMoves(r, c);
                    for (const [tr, tc] of legal) {
                        const piece = board[r][c];
                        if (piece[1] === 'P' && (tr === 0 || tr === 7)) {
                            moves.push({ from: [r, c], to: [tr, tc], promotion: 'Q' });
                        } else {
                            moves.push({ from: [r, c], to: [tr, tc], promotion: null });
                        }
                    }
                }
            }
        }
        // Move ordering: captures first (MVV-LVA)
        moves.sort((a, b) => {
            const captA = board[a.to[0]][a.to[1]] ? PIECE_VALUE[board[a.to[0]][a.to[1]][1]] : 0;
            const captB = board[b.to[0]][b.to[1]] ? PIECE_VALUE[board[b.to[0]][b.to[1]][1]] : 0;
            return captB - captA;
        });
        return moves;
    }

    function minimax(depth, alpha, beta, isMaximizing) {
        const color = isMaximizing ? 'b' : 'w';
        const moves = getAllMovesForAI(color);

        if (moves.length === 0) {
            if (isInCheck(color)) {
                return isMaximizing ? -100000 : 100000;
            }
            return 0; // stalemate
        }

        if (depth === 0) return evaluateBoard();

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const snapshot = saveState();
                makeMove(move.from, move.to, move.promotion);
                const eval_ = minimax(depth - 1, alpha, beta, false);
                restoreState(snapshot);
                if (eval_ > maxEval) maxEval = eval_;
                if (eval_ > alpha) alpha = eval_;
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const snapshot = saveState();
                makeMove(move.from, move.to, move.promotion);
                const eval_ = minimax(depth - 1, alpha, beta, true);
                restoreState(snapshot);
                if (eval_ < minEval) minEval = eval_;
                if (eval_ < beta) beta = eval_;
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    function findBestMove() {
        const moves = getAllMovesForAI('b');
        if (moves.length === 0) return null;

        const depth = getSearchDepth();
        const noise = getRandomness();
        let bestScore = -Infinity;
        let bestMoves = [];

        for (const move of moves) {
            const snapshot = saveState();
            makeMove(move.from, move.to, move.promotion);
            let score = minimax(depth - 1, -Infinity, Infinity, false);
            score += getLearningBonus(getBoardHash());
            restoreState(snapshot);

            if (noise > 0) {
                score += (Math.random() - 0.5) * noise * 2;
            }

            if (score > bestScore) {
                bestScore = score;
                bestMoves = [move];
            } else if (score > bestScore - 5) {
                bestMoves.push(move);
            }
        }

        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    function triggerAIMove() {
        if (gameMode !== 'ai' || turn !== 'b' || aiThinking || gameOver) return;

        aiThinking = true;
        showThinking(true);

        setTimeout(() => {
            const move = findBestMove();
            aiThinking = false;
            showThinking(false);

            if (move) {
                executeMove(move.from, move.to, move.promotion);
            }
        }, 250 + Math.random() * 350);
    }

    // ══════════════════════════════════════
    // ── GAME ELEMENTS ──
    // ══════════════════════════════════════
    const boardElement = document.getElementById('chessboard');
    const moveHistoryElement = document.getElementById('move-history');
    const statusElement = document.getElementById('status');
    const undoBtn = document.getElementById('undo-btn');
    const resetBtn = document.getElementById('reset-btn');
    const promotionModal = document.getElementById('promotion-modal');
    const promotionChoices = document.getElementById('promotion-choices');
    const dragGhost = document.getElementById('drag-ghost');

    // Unicode chess pieces
    const PIECE_UNICODE = {
        wK: '\u2654', wQ: '\u2655', wR: '\u2656', wB: '\u2657', wN: '\u2658', wP: '\u2659',
        bK: '\u265A', bQ: '\u265B', bR: '\u265C', bB: '\u265D', bN: '\u265E', bP: '\u265F',
    };

    const initialBoard = [
        ['bR','bN','bB','bQ','bK','bB','bN','bR'],
        ['bP','bP','bP','bP','bP','bP','bP','bP'],
        [null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null],
        ['wP','wP','wP','wP','wP','wP','wP','wP'],
        ['wR','wN','wB','wQ','wK','wB','wN','wR'],
    ];

    let board, turn, selected, legalMovesCache, moveHistory, undoStack;
    let castling, enPassant, halfmoveClock, fullmoveNumber;
    let pendingPromotion = null;
    let lastMove = null;

    // Drag state
    let dragging = null; // { r, c, piece }

    function initGame() {
        board = JSON.parse(JSON.stringify(initialBoard));
        turn = 'w';
        selected = null;
        legalMovesCache = [];
        moveHistory = [];
        undoStack = [];
        castling = { wK: true, wQ: true, bK: true, bQ: true };
        enPassant = null;
        halfmoveClock = 0;
        fullmoveNumber = 1;
        pendingPromotion = null;
        lastMove = null;
        dragging = null;
        gameOver = false;
        aiThinking = false;
        gamePositionHashes = [];
        showThinking(false);
        applyTheme();
        renderCoords();
        applyCoords();
        renderBoard();
        renderMoveHistory();
        updateStatus();
        updateAIDisplay();
    }

    // ── Board Rendering ──
    function renderBoard() {
        boardElement.innerHTML = '';
        // Keep theme class
        const themeClass = 'theme-' + settings.theme;
        boardElement.className = themeClass;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const sq = document.createElement('div');
                sq.className = 'square ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
                sq.dataset.r = r;
                sq.dataset.c = c;
                if (selected && selected[0] === r && selected[1] === c) sq.classList.add('selected');
                if (settings.highlightLastMove && lastMove) {
                    if ((lastMove.from[0] === r && lastMove.from[1] === c) ||
                        (lastMove.to[0] === r && lastMove.to[1] === c)) {
                        sq.classList.add('last-move');
                    }
                }

                const isLegal = legalMovesCache.some(m => m[0] === r && m[1] === c);
                if (settings.showLegalMoves && isLegal) {
                    const dot = document.createElement('div');
                    dot.className = board[r][c] ? 'capture-ring' : 'move-dot';
                    sq.appendChild(dot);
                }

                const piece = board[r][c];
                if (piece) {
                    const span = document.createElement('span');
                    span.className = 'piece ' + (piece[0] === 'w' ? 'white-piece' : 'black-piece');
                    span.textContent = PIECE_UNICODE[piece];

                    if (settings.dragDrop && piece[0] === turn && !aiThinking && !gameOver) {
                        if (gameMode !== 'ai' || piece[0] === 'w') {
                            span.classList.add('draggable');
                            span.addEventListener('mousedown', (e) => startDrag(e, r, c, piece));
                            span.addEventListener('touchstart', (e) => startDrag(e, r, c, piece), { passive: false });
                        }
                    }
                    if (dragging && dragging.r === r && dragging.c === c) {
                        span.classList.add('dragging');
                    }

                    sq.appendChild(span);
                }

                // Click handler (always active as fallback)
                sq.addEventListener('click', () => handleSquareClick(r, c));

                // Drop target events for drag & drop
                if (settings.dragDrop) {
                    sq.addEventListener('mouseup', () => endDrag(r, c));
                    sq.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        const touch = e.changedTouches[0];
                        const target = getSquareFromPoint(touch.clientX, touch.clientY);
                        if (target) endDrag(target.r, target.c);
                        else cancelDrag();
                    });
                }

                boardElement.appendChild(sq);
            }
        }
        // Check highlight
        if (isInCheck(turn)) {
            const kp = findKing(turn);
            if (kp) {
                const idx = kp[0] * 8 + kp[1];
                if (boardElement.children[idx]) boardElement.children[idx].classList.add('in-check');
            }
        }
    }

    // ── Drag & Drop ──
    function startDrag(e, r, c, piece) {
        if (pendingPromotion || gameOver || aiThinking) return;
        if (piece[0] !== turn) return;
        if (gameMode === 'ai' && piece[0] === 'b') return;
        e.preventDefault();

        dragging = { r, c, piece };
        selected = [r, c];
        legalMovesCache = getLegalMoves(r, c);

        dragGhost.textContent = PIECE_UNICODE[piece];
        dragGhost.className = piece[0] === 'w' ? 'white-piece' : 'black-piece';
        dragGhost.classList.remove('hidden');

        const pos = getEventPos(e);
        dragGhost.style.left = pos.x + 'px';
        dragGhost.style.top = pos.y + 'px';

        renderBoard();
    }

    function moveDrag(e) {
        if (!dragging) return;
        e.preventDefault();
        const pos = getEventPos(e);
        dragGhost.style.left = pos.x + 'px';
        dragGhost.style.top = pos.y + 'px';
    }

    function endDrag(r, c) {
        if (!dragging) return;
        dragGhost.classList.add('hidden');

        const from = [dragging.r, dragging.c];
        const isLegal = legalMovesCache.some(m => m[0] === r && m[1] === c);

        if (isLegal) {
            const movingPiece = board[from[0]][from[1]];
            if (movingPiece && movingPiece[1] === 'P' && (r === 0 || r === 7)) {
                dragging = null;
                showPromotionDialog(from, [r, c]);
                return;
            }
            dragging = null;
            executeMove(from, [r, c], null);
        } else {
            dragging = null;
            selected = null;
            legalMovesCache = [];
            renderBoard();
        }
    }

    function cancelDrag() {
        if (!dragging) return;
        dragging = null;
        dragGhost.classList.add('hidden');
        selected = null;
        legalMovesCache = [];
        renderBoard();
    }

    function getEventPos(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    function getSquareFromPoint(x, y) {
        const el = document.elementFromPoint(x, y);
        if (!el) return null;
        const sq = el.closest('.square');
        if (!sq) return null;
        return { r: parseInt(sq.dataset.r), c: parseInt(sq.dataset.c) };
    }

    // Global mouse/touch listeners for dragging
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', (e) => {
        if (!dragging) return;
        const sq = getSquareFromPoint(e.clientX, e.clientY);
        if (sq) endDrag(sq.r, sq.c);
        else cancelDrag();
    });
    document.addEventListener('touchmove', moveDrag, { passive: false });

    function renderMoveHistory() {
        let html = '';
        for (let i = 0; i < moveHistory.length; i += 2) {
            let num = Math.floor(i / 2) + 1;
            html += `<span class="move-num">${num}.</span> ${moveHistory[i]}`;
            if (moveHistory[i + 1]) html += ` ${moveHistory[i + 1]}`;
            html += '  ';
        }
        moveHistoryElement.innerHTML = html;
        moveHistoryElement.scrollTop = moveHistoryElement.scrollHeight;
    }

    // ── Click Handler ──
    function handleSquareClick(r, c) {
        if (pendingPromotion || gameOver || aiThinking) return;
        if (dragging) return;
        if (gameMode === 'ai' && turn === 'b') return;
        const piece = board[r][c];
        if (selected) {
            if (legalMovesCache.some(m => m[0] === r && m[1] === c)) {
                const movingPiece = board[selected[0]][selected[1]];
                if (movingPiece && movingPiece[1] === 'P' && (r === 0 || r === 7)) {
                    showPromotionDialog(selected, [r, c]);
                    return;
                }
                executeMove(selected, [r, c], null);
                return;
            }
            if (piece && piece[0] === turn) {
                selected = [r, c];
                legalMovesCache = getLegalMoves(r, c);
                renderBoard();
                return;
            }
            selected = null;
            legalMovesCache = [];
            renderBoard();
            return;
        }
        if (piece && piece[0] === turn) {
            selected = [r, c];
            legalMovesCache = getLegalMoves(r, c);
            renderBoard();
        }
    }

    function executeMove(from, to, promotion) {
        const notation = getMoveNotation(from, to, promotion);
        const snapshot = saveState();
        undoStack.push(snapshot);

        makeMove(from, to, promotion);
        recordPositionDuringGame();
        moveHistory.push(notation);
        selected = null;
        legalMovesCache = [];
        lastMove = { from, to };
        renderBoard();
        renderMoveHistory();
        updateStatus();

        // Trigger AI move after player's move
        if (!gameOver && gameMode === 'ai' && turn === 'b') {
            triggerAIMove();
        }
    }

    // ── Promotion ──
    function showPromotionDialog(from, to) {
        pendingPromotion = { from, to };
        promotionModal.classList.remove('hidden');
        promotionChoices.innerHTML = '';
        const color = turn;
        ['Q', 'R', 'B', 'N'].forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'promo-btn';
            btn.textContent = PIECE_UNICODE[color + p];
            btn.onclick = () => {
                promotionModal.classList.add('hidden');
                executeMove(pendingPromotion.from, pendingPromotion.to, p);
                pendingPromotion = null;
            };
            promotionChoices.appendChild(btn);
        });
    }

    // ── Move Notation ──
    function getMoveNotation(from, to, promotion) {
        const piece = board[from[0]][from[1]];
        const target = board[to[0]][to[1]];
        const pType = piece[1];
        let notation = '';

        // Castling
        if (pType === 'K' && Math.abs(to[1] - from[1]) === 2) {
            return to[1] > from[1] ? 'O-O' : 'O-O-O';
        }

        if (pType !== 'P') {
            notation += pType;
            // Disambiguation
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (r === from[0] && c === from[1]) continue;
                    if (board[r][c] === piece) {
                        const moves = getPseudoLegalMoves(r, c);
                        if (moves.some(m => m[0] === to[0] && m[1] === to[1])) {
                            if (c !== from[1]) notation += String.fromCharCode(97 + from[1]);
                            else if (r !== from[0]) notation += (8 - from[0]);
                            else notation += String.fromCharCode(97 + from[1]) + (8 - from[0]);
                            break;
                        }
                    }
                }
            }
        }

        const isCapture = target || (pType === 'P' && to[1] !== from[1]);
        if (pType === 'P' && isCapture) notation += String.fromCharCode(97 + from[1]);
        if (isCapture) notation += 'x';
        notation += String.fromCharCode(97 + to[1]) + (8 - to[0]);
        if (promotion) notation += '=' + promotion;

        // Preview check/checkmate
        const snapshot = saveState();
        makeMove(from, to, promotion);
        const opp = turn;
        if (isInCheck(opp)) {
            if (isCheckmate(opp)) notation += '#';
            else notation += '+';
        }
        restoreState(snapshot);

        return notation;
    }

    // ── State Save/Restore (for undo) ──
    function saveState() {
        return {
            board: JSON.parse(JSON.stringify(board)),
            turn,
            castling: { ...castling },
            enPassant: enPassant ? [...enPassant] : null,
            halfmoveClock,
            fullmoveNumber,
            lastMove: lastMove ? { from: [...lastMove.from], to: [...lastMove.to] } : null
        };
    }

    function restoreState(s) {
        board = s.board;
        turn = s.turn;
        castling = s.castling;
        enPassant = s.enPassant;
        halfmoveClock = s.halfmoveClock;
        fullmoveNumber = s.fullmoveNumber;
        lastMove = s.lastMove;
    }

    // ── Make Move (mutates board) ──
    function makeMove(from, to, promotion) {
        const piece = board[from[0]][from[1]];
        const color = piece[0];
        const pType = piece[1];
        const captured = board[to[0]][to[1]];

        // En passant capture
        if (pType === 'P' && enPassant && to[0] === enPassant[0] && to[1] === enPassant[1]) {
            const capturedRow = color === 'w' ? to[0] + 1 : to[0] - 1;
            board[capturedRow][to[1]] = null;
        }

        // Update en passant
        if (pType === 'P' && Math.abs(to[0] - from[0]) === 2) {
            enPassant = [(from[0] + to[0]) / 2, from[1]];
        } else {
            enPassant = null;
        }

        // Castling move
        if (pType === 'K' && Math.abs(to[1] - from[1]) === 2) {
            if (to[1] > from[1]) { // Kingside
                board[from[0]][5] = board[from[0]][7];
                board[from[0]][7] = null;
            } else { // Queenside
                board[from[0]][3] = board[from[0]][0];
                board[from[0]][0] = null;
            }
        }

        // Update castling rights
        if (pType === 'K') {
            castling[color + 'K'] = false;
            castling[color + 'Q'] = false;
        }
        if (pType === 'R') {
            if (from[1] === 0) castling[color + 'Q'] = false;
            if (from[1] === 7) castling[color + 'K'] = false;
        }
        // Rook captured
        if (to[0] === 0 && to[1] === 7) castling['bK'] = false;
        if (to[0] === 0 && to[1] === 0) castling['bQ'] = false;
        if (to[0] === 7 && to[1] === 7) castling['wK'] = false;
        if (to[0] === 7 && to[1] === 0) castling['wQ'] = false;

        // Move piece
        board[to[0]][to[1]] = promotion ? color + promotion : piece;
        board[from[0]][from[1]] = null;

        // Half-move clock
        if (pType === 'P' || captured) halfmoveClock = 0;
        else halfmoveClock++;

        // Full move number
        if (color === 'b') fullmoveNumber++;

        turn = color === 'w' ? 'b' : 'w';
    }

    // ── Piece Movement ──
    function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

    function getPseudoLegalMoves(r, c) {
        const piece = board[r][c];
        if (!piece) return [];
        const color = piece[0];
        const type = piece[1];
        const moves = [];
        const opp = color === 'w' ? 'b' : 'w';

        function addIfValid(nr, nc) {
            if (!inBounds(nr, nc)) return false;
            if (board[nr][nc] && board[nr][nc][0] === color) return false;
            moves.push([nr, nc]);
            return !board[nr][nc];
        }

        function slide(dirs) {
            for (let [dr, dc] of dirs) {
                for (let i = 1; i < 8; i++) {
                    if (!addIfValid(r + dr * i, c + dc * i)) break;
                }
            }
        }

        switch (type) {
            case 'P': {
                const dir = color === 'w' ? -1 : 1;
                const startRow = color === 'w' ? 6 : 1;
                if (inBounds(r + dir, c) && !board[r + dir][c]) {
                    moves.push([r + dir, c]);
                    if (r === startRow && !board[r + dir * 2][c]) {
                        moves.push([r + dir * 2, c]);
                    }
                }
                for (let dc of [-1, 1]) {
                    const nr = r + dir, nc = c + dc;
                    if (!inBounds(nr, nc)) continue;
                    if (board[nr][nc] && board[nr][nc][0] === opp) moves.push([nr, nc]);
                    if (enPassant && enPassant[0] === nr && enPassant[1] === nc) moves.push([nr, nc]);
                }
                break;
            }
            case 'N':
                for (let [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])
                    addIfValid(r + dr, c + dc);
                break;
            case 'B':
                slide([[-1,-1],[-1,1],[1,-1],[1,1]]);
                break;
            case 'R':
                slide([[-1,0],[1,0],[0,-1],[0,1]]);
                break;
            case 'Q':
                slide([[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]);
                break;
            case 'K':
                for (let dr = -1; dr <= 1; dr++)
                    for (let dc = -1; dc <= 1; dc++)
                        if (dr || dc) addIfValid(r + dr, c + dc);
                if (!isSquareAttacked(r, c, opp)) {
                    if (castling[color + 'K'] && !board[r][5] && !board[r][6]
                        && board[r][7] === color + 'R'
                        && !isSquareAttacked(r, 5, opp) && !isSquareAttacked(r, 6, opp)) {
                        moves.push([r, 6]);
                    }
                    if (castling[color + 'Q'] && !board[r][3] && !board[r][2] && !board[r][1]
                        && board[r][0] === color + 'R'
                        && !isSquareAttacked(r, 3, opp) && !isSquareAttacked(r, 2, opp)) {
                        moves.push([r, 2]);
                    }
                }
                break;
        }
        return moves;
    }

    function getLegalMoves(r, c) {
        const piece = board[r][c];
        if (!piece) return [];
        const color = piece[0];
        const pseudo = getPseudoLegalMoves(r, c);
        return pseudo.filter(([tr, tc]) => {
            const snapshot = saveState();
            makeMove([r, c], [tr, tc], null);
            const inCheck = isInCheck(color);
            restoreState(snapshot);
            return !inCheck;
        });
    }

    // ── Check Detection ──
    function findKing(color) {
        for (let r = 0; r < 8; r++)
            for (let c = 0; c < 8; c++)
                if (board[r][c] === color + 'K') return [r, c];
        return null;
    }

    function isSquareAttacked(r, c, byColor) {
        for (let pr = 0; pr < 8; pr++) {
            for (let pc = 0; pc < 8; pc++) {
                const p = board[pr][pc];
                if (!p || p[0] !== byColor) continue;
                const type = p[1];
                const dr = r - pr, dc = c - pc;
                const adr = Math.abs(dr), adc = Math.abs(dc);

                switch (type) {
                    case 'P': {
                        const dir = byColor === 'w' ? -1 : 1;
                        if (dr === dir && adc === 1) return true;
                        break;
                    }
                    case 'N':
                        if ((adr === 2 && adc === 1) || (adr === 1 && adc === 2)) return true;
                        break;
                    case 'K':
                        if (adr <= 1 && adc <= 1 && (adr + adc > 0)) return true;
                        break;
                    case 'B':
                        if (adr === adc && adr > 0 && isPathClear(pr, pc, r, c)) return true;
                        break;
                    case 'R':
                        if ((dr === 0 || dc === 0) && (adr + adc > 0) && isPathClear(pr, pc, r, c)) return true;
                        break;
                    case 'Q':
                        if ((adr === adc || dr === 0 || dc === 0) && (adr + adc > 0) && isPathClear(pr, pc, r, c)) return true;
                        break;
                }
            }
        }
        return false;
    }

    function isPathClear(r1, c1, r2, c2) {
        const dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1);
        let r = r1 + dr, c = c1 + dc;
        while (r !== r2 || c !== c2) {
            if (board[r][c]) return false;
            r += dr;
            c += dc;
        }
        return true;
    }

    function isInCheck(color) {
        const kp = findKing(color);
        if (!kp) return false;
        const opp = color === 'w' ? 'b' : 'w';
        return isSquareAttacked(kp[0], kp[1], opp);
    }

    function hasAnyLegalMoves(color) {
        for (let r = 0; r < 8; r++)
            for (let c = 0; c < 8; c++)
                if (board[r][c] && board[r][c][0] === color)
                    if (getLegalMoves(r, c).length > 0) return true;
        return false;
    }

    function isCheckmate(color) {
        return isInCheck(color) && !hasAnyLegalMoves(color);
    }

    function isStalemate(color) {
        return !isInCheck(color) && !hasAnyLegalMoves(color);
    }

    // ── Status ──
    function updateStatus() {
        if (isCheckmate(turn)) {
            gameOver = true;
            const winner = turn === 'w' ? 'Black' : 'White';
            if (gameMode === 'ai') {
                const playerWon = turn === 'b';
                statusElement.textContent = playerWon ? 'Checkmate! You win!' : 'Checkmate! AI wins!';
            } else {
                statusElement.textContent = `Checkmate! ${winner} wins!`;
            }
            statusElement.className = 'status-checkmate';
            if (gameMode === 'ai') {
                updateAIAfterGame(turn === 'w' ? 'ai-win' : 'ai-loss');
            }
        } else if (isStalemate(turn)) {
            gameOver = true;
            statusElement.textContent = 'Stalemate! Draw.';
            statusElement.className = 'status-draw';
            if (gameMode === 'ai') {
                updateAIAfterGame('draw');
            }
        } else if (isInCheck(turn)) {
            statusElement.textContent = (turn === 'w' ? 'White' : 'Black') + ' is in check!';
            statusElement.className = 'status-check';
        } else if (halfmoveClock >= 100) {
            gameOver = true;
            statusElement.textContent = '50-move rule! Draw.';
            statusElement.className = 'status-draw';
            if (gameMode === 'ai') {
                updateAIAfterGame('draw');
            }
        } else {
            statusElement.textContent = (turn === 'w' ? 'White' : 'Black') + ' to move';
            statusElement.className = '';
        }
    }

    // ── Controls ──
    undoBtn.onclick = function() {
        if (undoStack.length === 0 || aiThinking) return;
        if (gameMode === 'ai') {
            // In AI mode: undo both AI's move and player's move
            let snapshot;
            const count = (turn === 'w' && undoStack.length >= 2) ? 2 : 1;
            for (let i = 0; i < count && undoStack.length > 0; i++) {
                snapshot = undoStack.pop();
                moveHistory.pop();
            }
            if (snapshot) restoreState(snapshot);
        } else {
            const snapshot = undoStack.pop();
            restoreState(snapshot);
            moveHistory.pop();
        }
        selected = null;
        legalMovesCache = [];
        gameOver = false;
        renderBoard();
        renderMoveHistory();
        updateStatus();
    };

    resetBtn.onclick = function() {
        initGame();
    };

    // Initialize settings UI
    loadSettings();
})();
