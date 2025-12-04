const AnimatedBackground = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    points: [],
    target: { x: 0, y: 0 },
    animateHeader: true,

    init() {
        this.canvas = document.getElementById('demo-canvas');
        if (!this.canvas) return;

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.target = { x: this.width / 2, y: this.height / 2 };

        const largeHeader = document.getElementById('large-header');
        if (largeHeader) {
            largeHeader.style.height = this.height + 'px';
        }

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        this.points = [];
        for (let x = 0; x < this.width; x += this.width / 50) {
            for (let y = 0; y < this.height; y += this.height / 50) {
                const px = x + Math.random() * this.width / 50;
                const py = y + Math.random() * this.height / 50;
                const p = {
                    x: px,
                    originX: px,
                    y: py,
                    originY: py,
                    active: 0,
                    circle: {
                        radius: 2 + Math.random() * 2,
                        active: 0
                    }
                };
                this.points.push(p);
            }
        }

        for (let i = 0; i < this.points.length; i++) {
            const closest = [];
            const p1 = this.points[i];

            for (let j = 0; j < this.points.length; j++) {
                const p2 = this.points[j];
                if (p1 !== p2) {
                    let placed = false;

                    for (let k = 0; k < 5; k++) {
                        if (!placed) {
                            if (closest[k] === undefined) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }

                    for (let k = 0; k < 5; k++) {
                        if (!placed) {
                            if (this.getDistance(p1, p2) < this.getDistance(p1, closest[k])) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }
                }
            }
            p1.closest = closest;
        }

        this.addListeners();
        this.initAnimation();
    },

    addListeners() {
        if (!('ontouchstart' in window)) {
            window.addEventListener('mousemove', (e) => this.mouseMove(e));
        }
    },

    mouseMove(e) {
        let posx = 0, posy = 0;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        this.target.x = posx;
        this.target.y = posy;
    },

    initAnimation() {
        this.animate();
        for (let i in this.points) {
            this.shiftPoint(this.points[i]);
        }
    },

    animate() {
        if (this.animateHeader) {
            this.ctx.clearRect(0, 0, this.width, this.height);

            for (let i in this.points) {
                const p = this.points[i];
                const dist = Math.abs(this.getDistance(this.target, p));

                if (dist < 4000) {
                    p.active = 0.3;
                    p.circle.active = 0.6;
                } else if (dist < 20000) {
                    p.active = 0.1;
                    p.circle.active = 0.3;
                } else if (dist < 40000) {
                    p.active = 0.02;
                    p.circle.active = 0.1;
                } else {
                    p.active = 0;
                    p.circle.active = 0;
                }

                this.drawLines(p);
                this.drawCircle(p);
            }
        }
        requestAnimationFrame(() => this.animate());
    },

    shiftPoint(p) {
        const duration = 1 + 1 * Math.random();
        const targetX = p.originX - 50 + Math.random() * 100;
        const targetY = p.originY - 50 + Math.random() * 100;

        const startTime = Date.now();
        const startX = p.x;
        const startY = p.y;

        const animate = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);

            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            p.x = startX + (targetX - startX) * eased;
            p.y = startY + (targetY - startY) * eased;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.shiftPoint(p);
            }
        };

        animate();
    },

    drawLines(p) {
        if (!p.active || !p.closest) return;

        for (let i in p.closest) {
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p.closest[i].x, p.closest[i].y);
            this.ctx.strokeStyle = 'rgba(156,217,249,' + p.active + ')';
            this.ctx.stroke();
        }
    },

    drawCircle(p) {
        if (!p.circle.active) return;

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.circle.radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = 'rgba(156,217,249,' + p.circle.active + ')';
        this.ctx.fill();
    },

    getDistance(p1, p2) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }
};

const GlobalDB = {
    pairs: [
        { word: "Король", categories: ["Королева", "Власть", "Правитель", "Карта"] },
        { word: "Стол", categories: ["Стул", "Мебель"] },
        { word: "День", categories: ["Ночь", "Время", "Солнце", "Природа"] },
        { word: "Игла", categories: ["Нитка", "Шитьё", "Инструмент"] },
        { word: "Ключ", categories: ["Замок", "Безопасность", "Мебель"] },
        { word: "Лук", categories: ["Стрелы", "Растение", "Оружие", "Спорт"] },
        { word: "Чашка", categories: ["Блюдце", "Посуда", "Еда"] },
        { word: "Перо", categories: ["Чернила", "Письмо", "Инструмент", "Письменность"] },
        { word: "Молоток", categories: ["Гвоздь", "Инструмент", "Мебель"] },
        { word: "Книга", categories: ["Знание", "Чтение", "Письмо", "Искусство", "Литература"] },
        { word: "Солнце", categories: ["Луна", "Шар", "Звезда"] },
        { word: "Хлеб", categories: ["Масло", "Еда", "Здоровье", "Питание"] }
    ],
    // Дополнительные отвлекающие категории
    distractorCategories: [
        "Спорт", "Музыка", "Транспорт", "Цвет",
        "Эмоции", "Наука", "Здоровье",
        "Технология", "Природа", "Праздник", "Одежда", "Животные",
         "Овощи","Ягоды", "Семена", "Корни", "Листья", "Цветы"
    ]
};

const TimerManager = {
    timeLeft: 0,
    totalTime: 0,
    interval: null,
    callback: null,

    start(seconds, onTick, onEnd) {
        this.stop();
        this.timeLeft = seconds;
        this.totalTime = seconds;
        this.callback = onEnd;

        if (onTick) onTick(this.timeLeft, this.totalTime);

        this.interval = setInterval(() => {
            this.timeLeft--;
            if (onTick) onTick(this.timeLeft, this.totalTime);

            if (this.timeLeft <= 0) {
                this.stop();
                if (this.callback) this.callback();
            }
        }, 1000);
    },

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
};

const NotificationManager = {
    container: null,

    init() {
        if (this.container) return;
        const mount = () => {
            if (this.container || !document.body) return;
            this.container = document.createElement('div');
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        };
        if (document.body) {
            mount();
        } else {
            document.addEventListener('DOMContentLoaded', mount, { once: true });
        }
    },

    show(message, type = 'info', duration = 4000) {
        this.init();
        if (!this.container) return;

        const note = document.createElement('div');
        note.className = `notification notification--${type}`;

        const content = document.createElement('div');
        content.className = 'notification__content';
        const lines = String(message || '').split('\n');
        lines.forEach((line, idx) => {
            if (idx > 0) content.appendChild(document.createElement('br'));
            content.appendChild(document.createTextNode(line));
        });
        note.appendChild(content);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification__close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => this.hide(note));
        note.appendChild(closeBtn);

        this.container.appendChild(note);
        requestAnimationFrame(() => {
            note.classList.add('notification--visible');
        });

        if (duration !== Infinity) {
            note._dismissTimer = setTimeout(() => this.hide(note), duration);
        }

        return note;
    },

    hide(note) {
        if (!note || !note.parentNode) return;
        if (note._dismissTimer) clearTimeout(note._dismissTimer);
        note.classList.remove('notification--visible');
        setTimeout(() => {
            if (note.parentNode) note.parentNode.removeChild(note);
        }, 300);
    }
};

const ScreenBlocker = {
    container: null,
    textEl: null,

    init() {
        if (this.container) return;
        const mount = () => {
            if (this.container || !document.body) return;
            this.container = document.createElement('div');
            this.container.className = 'screen-blocker';

            this.textEl = document.createElement('div');
            this.textEl.className = 'screen-blocker__text';

            const spinner = document.createElement('div');
            spinner.className = 'screen-blocker__spinner';

            this.container.appendChild(spinner);
            this.container.appendChild(this.textEl);

            document.body.appendChild(this.container);
        };

        if (document.body) {
            mount();
        } else {
            document.addEventListener('DOMContentLoaded', mount, { once: true });
        }
    },

    show(message = 'Подождите...') {
        this.init();
        if (!this.container) return;
        this.textEl.textContent = message;
        this.container.classList.add('visible');
    },

    hide() {
        if (!this.container) return;
        this.container.classList.remove('visible');
    }
};

const LevelModeManager = {
    STORAGE_PREFIX: 'level-mode-',

    buildKey(levelId) {
        return `${this.STORAGE_PREFIX}${levelId}`;
    },

    save(levelId, mode) {
        if (!Number.isFinite(levelId) || !mode) return;
        try {
            sessionStorage.setItem(this.buildKey(levelId), mode);
        } catch (e) {
            console.warn('LevelModeManager: unable to save mode', e);
        }
    },

    get(levelId, fallback = 'normal') {
        if (!Number.isFinite(levelId)) return fallback;
        try {
            return sessionStorage.getItem(this.buildKey(levelId)) || fallback;
        } catch (e) {
            console.warn('LevelModeManager: unable to read mode', e);
            return fallback;
        }
    },

    clear(levelId) {
        if (!Number.isFinite(levelId)) return;
        try {
            sessionStorage.removeItem(this.buildKey(levelId));
        } catch (e) {
            console.warn('LevelModeManager: unable to clear mode', e);
        }
    }
};

const LeaderboardManager = {
    STORAGE_KEY: 'gameLeaderboard',

    init() {
    },

    getAllPlayers() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) return [];

            const players = JSON.parse(data);
            // Сортировка по очкам (убывание)
            return players.sort((a, b) => b.score - a.score);
        } catch (e) {
            console.error('Error loading leaderboard:', e);
            return [];
        }
    },

    getTopPlayers(count = 10) {
        return this.getAllPlayers().slice(0, count);
    },

    updatePlayer(playerData) {
        try {
            let players = this.getAllPlayers();

            const existingIndex = players.findIndex(p => p.name === playerData.name);

            if (existingIndex >= 0) {
                players[existingIndex] = playerData;
            } else {
                players.push(playerData);
            }

            players.sort((a, b) => b.score - a.score);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(players));

            return true;
        } catch (e) {
            console.error('Error updating leaderboard:', e);
            return false;
        }
    },

    getPlayerRank(playerName) {
        const players = this.getAllPlayers();
        const index = players.findIndex(p => p.name === playerName);
        return index >= 0 ? index + 1 : null;
    },

    clearAll() {
        localStorage.removeItem(this.STORAGE_KEY);
    },

    exportToJSON() {
        const players = this.getAllPlayers();
        return JSON.stringify(players, null, 2);
    },

    importFromJSON(jsonString) {
        try {
            const importedPlayers = JSON.parse(jsonString);

            if (!Array.isArray(importedPlayers)) {
                throw new Error('Неверный формат данных');
            }

            const currentPlayers = this.getAllPlayers();
            const mergedPlayers = {};

            currentPlayers.forEach(player => {
                const sanitized = this.sanitizePlayer(player);
                if (sanitized) {
                    mergedPlayers[sanitized.name] = sanitized;
                }
            });

            importedPlayers.forEach(player => {
                const sanitized = this.sanitizePlayer(player);
                if (!sanitized) return;

                const existing = mergedPlayers[sanitized.name];
                mergedPlayers[sanitized.name] = existing
                    ? this.mergePlayerStats(existing, sanitized)
                    : sanitized;
            });

            const finalPlayers = Object.values(mergedPlayers);
            finalPlayers.sort((a, b) => b.score - a.score);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(finalPlayers));

            this.syncCurrentUserStats(finalPlayers);

            return true;
        } catch (e) {
            console.error('Error importing leaderboard:', e);
            return false;
        }
    },

    sanitizePlayer(player) {
        if (!player || typeof player !== 'object') return null;
        if (typeof player.name !== 'string' || player.name.trim().length === 0) return null;

        const sanitized = {
            ...player,
            name: player.name.trim(),
            score: this.toFiniteNumber(player.score, 0),
            unlocked: this.toFiniteNumber(player.unlocked, 1),
            completedLevels: Array.isArray(player.completedLevels) ? [...player.completedLevels] : [],
            attempts: this.isPlainObject(player.attempts) ? { ...player.attempts } : {},
            bestTimes: this.isPlainObject(player.bestTimes) ? { ...player.bestTimes } : {},
            levelScores: this.isPlainObject(player.levelScores) ? { ...player.levelScores } : {}
        };

        sanitized.completedLevels = this.mergeCompletedLevels(sanitized.completedLevels, []);
        return sanitized;
    },

    mergePlayerStats(existingPlayer, newPlayer) {
        const merged = {
            ...existingPlayer,
            ...newPlayer
        };

        merged.score = this.pickBestNumber(existingPlayer.score, newPlayer.score, false, 0);
        merged.unlocked = this.pickBestNumber(existingPlayer.unlocked, newPlayer.unlocked, false, 1);
        merged.completedLevels = this.mergeCompletedLevels(existingPlayer.completedLevels, newPlayer.completedLevels);
        merged.attempts = this.mergeStatMap(existingPlayer.attempts, newPlayer.attempts, false);
        merged.bestTimes = this.mergeStatMap(existingPlayer.bestTimes, newPlayer.bestTimes, true);
        merged.levelScores = this.mergeStatMap(existingPlayer.levelScores, newPlayer.levelScores, false);

        return merged;
    },

    mergeCompletedLevels(existingLevels, newLevels) {
        const safeExisting = Array.isArray(existingLevels) ? existingLevels : [];
        const safeNew = Array.isArray(newLevels) ? newLevels : [];
        const combined = [...safeExisting, ...safeNew];
        return Array.from(new Set(combined));
    },

    mergeStatMap(existingMap, incomingMap, preferLower = false) {
        const result = this.isPlainObject(existingMap) ? { ...existingMap } : {};
        if (!this.isPlainObject(incomingMap)) return result;

        Object.entries(incomingMap).forEach(([key, value]) => {
            const parsedValue = this.toFiniteNumber(value, null);
            if (parsedValue === null) return;

            const existingValue = this.toFiniteNumber(result[key], null);
            if (existingValue === null) {
                result[key] = parsedValue;
            } else if (preferLower && parsedValue < existingValue) {
                result[key] = parsedValue;
            } else if (!preferLower && parsedValue > existingValue) {
                result[key] = parsedValue;
            }
        });

        return result;
    },

    pickBestNumber(first, second, preferLower = false, fallback = 0) {
        const a = this.toFiniteNumber(first, null);
        const b = this.toFiniteNumber(second, null);

        if (a === null && b === null) return fallback;
        if (a === null) return b;
        if (b === null) return a;

        return preferLower ? Math.min(a, b) : Math.max(a, b);
    },

    toFiniteNumber(value, fallback = null) {
        const num = Number(value);
        return Number.isFinite(num) ? num : fallback;
    },

    isPlainObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    },

    syncCurrentUserStats(players) {
        if (!UserManager || !UserManager.user || !UserManager.user.name) return;
        const updated = players.find(p => p.name === UserManager.user.name);
        if (!updated) return;

        UserManager.user = {
            ...UserManager.user,
            ...updated,
            completedLevels: Array.isArray(updated.completedLevels) ? updated.completedLevels : [],
            attempts: this.isPlainObject(updated.attempts) ? { ...updated.attempts } : {},
            bestTimes: this.isPlainObject(updated.bestTimes) ? { ...updated.bestTimes } : {},
            levelScores: this.isPlainObject(updated.levelScores) ? { ...updated.levelScores } : {}
        };
        UserManager.save();
    }
};

const UserManager = {
    user: null,

    init() {
        const saved = localStorage.getItem('gameUser');
        if (saved) {
            this.user = JSON.parse(saved);
            if (!this.user.completedLevels) this.user.completedLevels = [];
            if (!this.user.attempts) this.user.attempts = {};
            if (!this.user.bestTimes) this.user.bestTimes = {};
            if (!this.user.levelScores) this.user.levelScores = {};
        }
    },

    login(name) {
        if (!name || name.trim().length === 0) {
            NotificationManager.show("Введите имя!", 'error');
            return;
        }
        this.user = {
            name: name.trim(),
            score: 0,
            unlocked: 1,
            completedLevels: [],
            attempts: {},
            bestTimes: {},
            levelScores: {}
        };
        this.save();
        window.location.reload();
    },

    logout() {
        localStorage.removeItem('gameUser');
        window.location.reload();
    },

    addScore(levelId, points, timeBonus = 0) {
        if (!this.user) return false;

        if (!this.user.levelScores) this.user.levelScores = {};
        if (!this.user.attempts[levelId]) this.user.attempts[levelId] = 0;
        this.user.attempts[levelId]++;

        const totalPoints = Math.max(0, (points || 0) + (timeBonus || 0));
        const previousBest = Number(this.user.levelScores[levelId]) || 0;
        const improved = totalPoints > previousBest;
        const delta = improved ? totalPoints - previousBest : 0;

        if (improved) {
            this.user.levelScores[levelId] = totalPoints;
            this.user.score += delta;
        }

        const firstCompletion = !this.user.completedLevels.includes(levelId);
        if (firstCompletion) {
            this.user.completedLevels.push(levelId);

            if (levelId === this.user.unlocked) {
                this.user.unlocked = Math.min(3, this.user.unlocked + 1);
            }
        }

        this.save();
        LeaderboardManager.updatePlayer(this.user);

        return {
            firstTime: firstCompletion,
            improved,
            points: delta,
            delta,
            runScore: totalPoints,
            previousBest,
            newBest: improved ? totalPoints : previousBest
        };
    },

    removePenalty(penalty) {
        if (!this.user) return;
        this.user.score = Math.max(0, this.user.score - penalty);
        this.save();
        LeaderboardManager.updatePlayer(this.user);
    },

    updateBestTime(levelId, timeInSeconds) {
        if (!this.user) return;
        if (!this.user.bestTimes[levelId] || timeInSeconds < this.user.bestTimes[levelId]) {
            this.user.bestTimes[levelId] = timeInSeconds;
            this.save();
            LeaderboardManager.updatePlayer(this.user);
        }
    },

    save() {
        localStorage.setItem('gameUser', JSON.stringify(this.user));
    }
};


const SoundManager = {
    audioContext: null,
    enabled: true,

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.enabled = false;
        }
    },

    playTone(frequency, duration, type = 'sine') {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    },

    success() {
        this.playTone(523.25, 0.1);
        setTimeout(() => this.playTone(659.25, 0.15), 100);
    },

    error() {
        this.playTone(200, 0.2, 'sawtooth');
    },

    click() {
        this.playTone(800, 0.05, 'square');
    },

    warning() {
        this.playTone(440, 0.1);
    }
};

// Инициализация всего что надо, а то не будет работать ;(
NotificationManager.init();
ScreenBlocker.init();
UserManager.init();
SoundManager.init();
LeaderboardManager.init();