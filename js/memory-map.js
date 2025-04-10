/**
 * memory-map.js
 * Интерактивная карта воспоминаний и проекций будущего
 * Оптимизировано для мобильных устройств и точного позиционирования модального окна
 */

// Глобальные переменные
let memoryCanvas;
let memoryContext;
let memories = [];
let isCanvasInitialized = false;
let audioContext = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Memory Map initializing...');
    
    memoryCanvas = document.getElementById('memory-map');
    if (!memoryCanvas) {
        console.error('Memory map canvas not found!');
        return;
    }
    
    memoryContext = memoryCanvas.getContext('2d');
    if (!memoryContext) {
        console.error('Failed to get 2D context!');
        return;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    loadMemories();
    setupButtonHandlers();
    drawMemoryMap();
    isCanvasInitialized = true;
    console.log('Memory Map initialized successfully!');
});

// Установка размеров canvas
function resizeCanvas() {
    if (!memoryCanvas) return;
    const container = memoryCanvas.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    memoryCanvas.width = rect.width;
    memoryCanvas.height = rect.height;
    if (isCanvasInitialized) drawMemoryMap();
}

// Настройка обработчиков кнопок
function setupButtonHandlers() {
    const addMemoryBtn = document.getElementById('add-memory-btn');
    const projectBtn = document.getElementById('project-btn');
    
    if (addMemoryBtn) {
        console.log('Setting up memory button handler');
        addMemoryBtn.addEventListener('click', () => showMemoryModal('past'));
    } else {
        console.error('Add memory button not found!');
    }
    
    if (projectBtn) {
        console.log('Setting up project button handler');
        projectBtn.addEventListener('click', () => showMemoryModal('future'));
    } else {
        console.error('Project button not found!');
    }
}

// Отображение модального окна
function showMemoryModal(type) {
    console.log(`Showing memory modal for type: ${type}`);
    
    let modal = document.querySelector('.memory-modal');
    const triggerBtn = document.getElementById('add-memory-btn'); // Кнопка-триггер
    
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'memory-modal';
        const title = type === 'past' ? 'Capture Memory Fragment' : 'Project Future Aspiration';
        modal.innerHTML = `
            <div class="memory-modal-content">
                <h4>${title}</h4>
                <input type="text" id="memory-title" placeholder="Title" autocomplete="off">
                <textarea id="memory-desc" placeholder="Description"></textarea>
                <div class="emotion-selector">
                    <span>Emotional signature:</span>
                    <div class="emotion-scale">
                        <span data-value="joy" class="emotion">Joy</span>
                        <span data-value="reflection" class="emotion">Reflection</span>
                        <span data-value="aspiration" class="emotion">Aspiration</span>
                        <span data-value="sublime" class="emotion">Sublime</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button id="cancel-memory">Cancel</button>
                    <button id="save-memory">Crystallize</button>
                </div>
                <input type="hidden" id="memory-type" value="${type}">
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        const title = type === 'past' ? 'Capture Memory Fragment' : 'Project Future Aspiration';
        modal.querySelector('h4').textContent = title;
        modal.querySelector('#memory-type').value = type;
        modal.querySelector('#memory-title').value = '';
        modal.querySelector('#memory-desc').value = '';
        modal.querySelectorAll('.emotion').forEach(emotion => emotion.classList.remove('selected'));
    }

    // Позиционирование модального окна
    const rect = triggerBtn.getBoundingClientRect();
    const modalWidth = modal.offsetWidth || 300; // Предполагаем ширину, если еще не отрендерено
    const modalHeight = modal.offsetHeight || 200; // Предполагаем высоту
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = rect.bottom + window.scrollY; // Под кнопкой
    let left = rect.left + window.scrollX; // Слева от кнопки

    // Корректировка для границ экрана
    if (left + modalWidth > viewportWidth) left = viewportWidth - modalWidth - 10;
    if (top + modalHeight > viewportHeight + window.scrollY) top = rect.top + window.scrollY - modalHeight - 10;
    if (left < 0) left = 10;
    if (top < window.scrollY) top = window.scrollY + 10;

    modal.style.top = `${top}px`;
    modal.style.left = `${left}px`;

    setupModalHandlers(modal);
    setTimeout(() => {
        modal.classList.add('active');
        playSound('open');
    }, 10);
}

// Настройка обработчиков модального окна
function setupModalHandlers(modal) {
    const emotions = modal.querySelectorAll('.emotion');
    emotions.forEach(emotion => {
        emotion.addEventListener('click', function() {
            emotions.forEach(e => e.classList.remove('selected'));
            this.classList.add('selected');
            playSound('select');
        });
    });
    
    modal.querySelector('#cancel-memory').addEventListener('click', () => {
        modal.classList.remove('active');
        playSound('close');
        setTimeout(() => modal.remove(), 300);
    });
    
    modal.querySelector('#save-memory').addEventListener('click', () => {
        const title = modal.querySelector('#memory-title').value.trim();
        const description = modal.querySelector('#memory-desc').value.trim();
        const selectedEmotion = modal.querySelector('.emotion.selected');
        const type = modal.querySelector('#memory-type').value;
        
        if (!title) {
            alert('Please enter a title for your memory');
            return;
        }
        
        const emotion = selectedEmotion ? selectedEmotion.dataset.value : 'reflection';
        const memory = {
            id: Date.now(),
            title,
            description,
            emotion,
            type,
            timestamp: new Date().toISOString(),
            position: generateRandomPosition(type)
        };
        
        saveMemory(memory);
        modal.classList.remove('active');
        playSound('success');
        setTimeout(() => modal.remove(), 300);
    });
}

// Генерация случайной позиции
function generateRandomPosition(type) {
    let x = type === 'past' ? Math.random() * 0.4 : 0.6 + Math.random() * 0.4;
    let y = Math.random() * 0.8 + 0.1;
    let z = Math.random() * 0.5;
    return { x, y, z };
}

// Сохранение воспоминания
function saveMemory(memory) {
    memories = loadMemories();
    memories.push(memory);
    localStorage.setItem('timeMemories', JSON.stringify(memories));
    drawMemoryMap();
}

// Загрузка воспоминаний
function loadMemories() {
    try {
        const stored = localStorage.getItem('timeMemories');
        memories = stored ? JSON.parse(stored) : [];
        return memories;
    } catch (error) {
        console.error('Error loading memories:', error);
        return [];
    }
}

// Рисование карты
function drawMemoryMap() {
    if (!memoryContext || !memoryCanvas) return;
    if (!memories.length) memories = loadMemories();
    memoryContext.clearRect(0, 0, memoryCanvas.width, memoryCanvas.height);
    if (!memories.length) return drawPlaceholder();
    drawConnectionLines();
    drawMemoryPoints();
}

// Placeholder для пустой карты
function drawPlaceholder() {
    memoryContext.font = '20px VT323, monospace';
    memoryContext.fillStyle = '#FFD700';
    memoryContext.textAlign = 'center';
    memoryContext.textBaseline = 'middle';
    memoryContext.fillText('No memories captured yet', memoryCanvas.width / 2, memoryCanvas.height / 2 - 15);
    memoryContext.fillText('Use the buttons below to start', memoryCanvas.width / 2, memoryCanvas.height / 2 + 15);
}

// Соединительные линии
function drawConnectionLines() {
    const sortedMemories = [...memories].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    memoryContext.beginPath();
    let firstPoint = true;
    sortedMemories.forEach(memory => {
        const x = memory.position.x * memoryCanvas.width;
        const y = memory.position.y * memoryCanvas.height;
        firstPoint ? memoryContext.moveTo(x, y) : memoryContext.lineTo(x, y);
        firstPoint = false;
    });
    memoryContext.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    memoryContext.lineWidth = 1;
    memoryContext.stroke();
}

// Точки воспоминаний
function drawMemoryPoints() {
    memories.forEach(memory => {
        const x = memory.position.x * memoryCanvas.width;
        const y = memory.position.y * memoryCanvas.height;
        const color = {
            'joy': '#FFD700',
            'reflection': '#87CEEB',
            'aspiration': '#9370DB',
            'sublime': '#00FA9A'
        }[memory.emotion] || '#FFFFFF';
        
        const gradient = memoryContext.createRadialGradient(x, y, 0, x, y, 15);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        memoryContext.fillStyle = gradient;
        memoryContext.beginPath();
        memoryContext.arc(x, y, 15, 0, Math.PI * 2);
        memoryContext.fill();
        
        memoryContext.fillStyle = color;
        memoryContext.beginPath();
        memoryContext.arc(x, y, 4, 0, Math.PI * 2);
        memoryContext.fill();
        
        memoryContext.font = '12px VT323, monospace';
        memoryContext.fillStyle = '#FFFFFF';
        memoryContext.textAlign = 'center';
        memoryContext.fillText(memory.title, x, y - 15);
        memoryContext.fillText(memory.type === 'past' ? '◄' : '►', x, y + 15);
    });
}

// Звуковые эффекты
function playSound(type) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    
    const config = {
        'open': [300, 600, 0.2, 0.3],
        'close': [600, 300, 0.2, 0.3],
        'select': [440, 440, 0.1, 0.1],
        'success': [440, 660, 0.2, 0.3]
    }[type] || [440, 440, 0.1, 0.1];
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(config[0], audioContext.currentTime);
    if (type === 'success') {
        oscillator.frequency.setValueAtTime(550, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(config[1], audioContext.currentTime + 0.2);
    } else {
        oscillator.frequency.exponentialRampToValueAtTime(config[1], audioContext.currentTime + config[3]);
    }
    gain.gain.setValueAtTime(config[2], audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config[3]);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + config[3]);
}

// Очистка воспоминаний
function clearAllMemories() {
    if (confirm('Are you sure you want to delete all memories?')) {
        localStorage.removeItem('timeMemories');
        memories = [];
        drawMemoryMap();
    }
}

// Экспорт функций
window.MemoryMap = {
    initialize: () => { loadMemories(); drawMemoryMap(); },
    addMemory: type => showMemoryModal(type),
    clearMemories: clearAllMemories
};