/**
 * memory-map.js
 * Премиум-визуализация Memory Constellation с использованием Three.js
 * Исправлено для корректной инициализации и рендеринга
 */

// Глобальные переменные
let scene, camera, renderer, raycaster, mouse;
let memories = [];
let particles, lines;
let audioContext = null;
let time = 0;
let isThreeAvailable = false;
let buttonHandlersInitialized = false;

// Инициализация после полной загрузки DOM и Three.js
function initMemoryMap() {
    console.log('Memory Map: Initializing...');
    
    // Проверка наличия Three.js
    if (typeof THREE === 'undefined') {
        console.error('Memory Map: Three.js is not loaded!');
        initSimpleMemoryMap();
        return;
    }
    
    isThreeAvailable = true;
    
    // Проверка наличия canvas
    const canvas = document.getElementById('memory-map');
    if (!canvas) {
        console.error('Memory Map: Canvas element with id "memory-map" not found!');
        return;
    }
    
    // Настройка сцены Three.js
    try {
        setupScene();
        
        // Загрузка воспоминаний
        loadMemories();
        
        // Создание визуализации
        createConstellation();
        
        // Настройка обработчиков кнопок - избегаем дублирования
        if (!buttonHandlersInitialized) {
            setupButtonHandlers();
            buttonHandlersInitialized = true;
        }
        
        // Анимация
        animate();
        
        // Обработчики событий
        window.addEventListener('resize', onWindowResize);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('click', onMouseClick);
        console.log('Memory Map: Initialized successfully!');
    } catch (error) {
        console.error('Memory Map: Error initializing 3D mode:', error);
        initSimpleMemoryMap();
    }
}

// Инициализация упрощенной версии карты памяти (без Three.js)
function initSimpleMemoryMap() {
    console.log('Memory Map: Initializing simple mode...');
    
    // Показываем запасной div
    const fallbackDiv = document.getElementById('memory-map-fallback');
    if (fallbackDiv) {
        fallbackDiv.style.display = 'block';
    }
    
    // Скрываем canvas
    const canvas = document.getElementById('memory-map');
    if (canvas) {
        canvas.style.display = 'none';
    }
    
    // Загружаем воспоминания
    memories = loadMemories();
    
    // Создаем упрощенный интерфейс
    createSimpleMemoryInterface();
    
    // Настраиваем обработчики кнопок - избегаем дублирования
    if (!buttonHandlersInitialized) {
        setupSimpleButtonHandlers();
        buttonHandlersInitialized = true;
    }
    
    console.log('Memory Map: Simple mode initialized successfully!');
}

// Создание упрощенного интерфейса для мемори-консоли
function createSimpleMemoryInterface() {
    const container = document.querySelector('.memory-container');
    if (!container) return;
    
    // Проверяем, не создан ли уже интерфейс
    if (container.querySelector('#simple-memory-list')) {
        console.log('Simple memory interface already exists');
        return;
    }
    
    // Создаем простой список воспоминаний
    const memoryList = document.createElement('div');
    memoryList.id = 'simple-memory-list';
    memoryList.style.width = '100%';
    memoryList.style.height = '300px';
    memoryList.style.overflowY = 'auto';
    memoryList.style.background = 'rgba(0, 0, 0, 0.5)';
    memoryList.style.borderRadius = '8px';
    memoryList.style.padding = '10px';
    memoryList.style.border = '1px solid var(--primary-color)';
    memoryList.style.marginBottom = '15px';
    
    // Добавляем заголовок
    const listHeader = document.createElement('h4');
    listHeader.textContent = 'Your Memory Timeline';
    listHeader.style.color = 'var(--primary-color)';
    listHeader.style.fontFamily = '"VT323", monospace';
    listHeader.style.textAlign = 'center';
    listHeader.style.marginBottom = '15px';
    memoryList.appendChild(listHeader);
    
    // Вставляем список перед элементом controls
    const controls = container.querySelector('.memory-controls');
    if (controls) {
        container.insertBefore(memoryList, controls);
    } else {
        container.appendChild(memoryList);
    }
    
    // Обновляем список воспоминаний
    updateSimpleMemoryList();
}

// Обновление упрощенного списка воспоминаний
function updateSimpleMemoryList() {
    const memoryList = document.getElementById('simple-memory-list');
    if (!memoryList) return;
    
    // Очищаем текущий список
    while (memoryList.children.length > 1) { // Оставляем заголовок
        memoryList.removeChild(memoryList.lastChild);
    }
    
    // Сортируем воспоминания по времени
    const sortedMemories = [...memories].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Если список пуст, показываем сообщение
    if (sortedMemories.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No memories captured yet. Use the buttons below to add your first memory.';
        emptyMessage.style.color = 'var(--text-color-muted)';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.padding = '20px';
        memoryList.appendChild(emptyMessage);
        return;
    }
    
    // Добавляем каждое воспоминание в список
    sortedMemories.forEach(memory => {
        const memoryItem = document.createElement('div');
        memoryItem.className = 'simple-memory-item';
        memoryItem.style.padding = '10px';
        memoryItem.style.marginBottom = '10px';
        memoryItem.style.borderRadius = '4px';
        memoryItem.style.background = 'rgba(30, 30, 30, 0.5)';
        memoryItem.style.borderLeft = `4px solid ${getEmotionColor(memory.emotion)}`;
        
        // Заголовок воспоминания
        const titleElement = document.createElement('h5');
        titleElement.textContent = memory.title;
        titleElement.style.margin = '0 0 5px 0';
        titleElement.style.color = 'var(--primary-color)';
        titleElement.style.fontFamily = '"VT323", monospace';
        memoryItem.appendChild(titleElement);
        
        // Тип воспоминания (прошлое/будущее)
        const typeElement = document.createElement('span');
        typeElement.textContent = memory.type === 'past' ? '◄ Past' : '► Future';
        typeElement.style.fontSize = '0.8em';
        typeElement.style.color = memory.type === 'past' ? '#87CEEB' : '#9370DB';
        typeElement.style.marginRight = '10px';
        memoryItem.appendChild(typeElement);
        
        // Эмоция
        const emotionElement = document.createElement('span');
        emotionElement.textContent = `Emotion: ${memory.emotion}`;
        emotionElement.style.fontSize = '0.8em';
        emotionElement.style.color = 'var(--text-color-muted)';
        memoryItem.appendChild(emotionElement);
        
        // Описание (если есть)
        if (memory.description) {
            const descElement = document.createElement('p');
            descElement.textContent = memory.description;
            descElement.style.margin = '5px 0 0 0';
            descElement.style.fontSize = '0.9em';
            descElement.style.color = 'var(--text-color)';
            memoryItem.appendChild(descElement);
        }
        
        // Добавляем в список
        memoryList.appendChild(memoryItem);
    });
}

// Получение цвета для эмоции
function getEmotionColor(emotion) {
    const colors = {
        'joy': '#FFD700',
        'reflection': '#87CEEB',
        'aspiration': '#9370DB',
        'sublime': '#00FA9A'
    };
    return colors[emotion] || '#FFFFFF';
}

// Настройка сцены Three.js
function setupScene() {
    const container = document.getElementById('memory-map');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: container, alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    
    camera.position.set(0, 10, 50);
    camera.lookAt(0, 0, 0);
    
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    console.log('Memory Map: Scene setup completed');
}

// Создание созвездия
function createConstellation() {
    if (!isThreeAvailable) {
        return;
    }
    
    if (!memories.length) {
        memories = loadMemories();
        if (!memories.length) {
            console.log('Memory Map: No memories to display');
            return;
        }
    }
    
    // Ограничение количества частиц для производительности
    if (memories.length > 50) {
        console.warn('Memory Map: Too many memories, limiting to 50 for performance');
        memories = memories.slice(0, 50);
    }
    
    // Проверка существования сцены
    if (!scene) {
        console.error('Memory Map: Scene is not initialized');
        return;
    }
    
    // Очистка сцены
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    
    // Создание частиц (воспоминаний)
    const positions = [];
    const colors = [];
    const sizes = [];
    const emotionColors = {
        'joy': new THREE.Color(0xFFD700),
        'reflection': new THREE.Color(0x87CEEB),
        'aspiration': new THREE.Color(0x9370DB),
        'sublime': new THREE.Color(0x00FA9A)
    };
    
    memories.forEach((memory, i) => {
        const x = (memory.position.x - 0.5) * 80;
        const y = (memory.position.y - 0.5) * 40;
        const z = memory.position.z * 20 - 10;
        positions.push(x, y, z);
        const color = emotionColors[memory.emotion] || new THREE.Color(0xFFFFFF);
        colors.push(color.r, color.g, color.b);
        sizes.push(2 + Math.random());
        memory.index = i;
    });
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            varying vec3 vColor;
            uniform float time;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + sin(time + position.x) * 0.5);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            void main() {
                float r = length(gl_PointCoord - vec2(0.5));
                if (r > 0.5) discard;
                gl_FragColor = vec4(vColor, 1.0 - r * 2.0);
            }
        `,
        transparent: true,
        vertexColors: true
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Создание линий
    const linePositions = [];
    const sortedMemories = [...memories].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    sortedMemories.forEach(memory => {
        const x = (memory.position.x - 0.5) * 80;
        const y = (memory.position.y - 0.5) * 40;
        const z = memory.position.z * 20 - 10;
        linePositions.push(x, y, z);
    });
    
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    
    const lineMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying float vDistance;
            void main() {
                vDistance = position.x;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying float vDistance;
            void main() {
                float alpha = sin(vDistance * 0.1 + time) * 0.5 + 0.5;
                gl_FragColor = vec4(1.0, 0.84, 0.0, alpha * 0.3);
            }
        `,
        transparent: true
    });
    
    lines = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(lines);
    console.log('Memory Map: Constellation created with', memories.length, 'memories');
}

// Настройка обработчиков кнопок
function setupButtonHandlers() {
    console.log('Setting up button handlers...');
    
    // Очищаем старые обработчики, заменяя элементы
    const addMemoryBtn = document.getElementById('add-memory-btn');
    const projectBtn = document.getElementById('project-btn');
    
    if (addMemoryBtn) {
        // Клонируем кнопку, чтобы удалить все обработчики событий
        const newAddMemoryBtn = addMemoryBtn.cloneNode(true);
        if (addMemoryBtn.parentNode) {
            addMemoryBtn.parentNode.replaceChild(newAddMemoryBtn, addMemoryBtn);
        }
        
        // Добавляем новый обработчик
        newAddMemoryBtn.addEventListener('click', function() {
            console.log('Add memory button clicked');
            showMemoryModal('past');
        });
        
        console.log('Memory button handler set up');
    } else {
        console.error('Memory Map: Add memory button not found!');
    }
    
    if (projectBtn) {
        // Клонируем кнопку, чтобы удалить все обработчики событий
        const newProjectBtn = projectBtn.cloneNode(true);
        if (projectBtn.parentNode) {
            projectBtn.parentNode.replaceChild(newProjectBtn, projectBtn);
        }
        
        // Добавляем новый обработчик
        newProjectBtn.addEventListener('click', function() {
            console.log('Project button clicked');
            showMemoryModal('future');
        });
        
        console.log('Project button handler set up');
    } else {
        console.error('Memory Map: Project button not found!');
    }
}

// Настройка обработчиков для упрощенного режима
function setupSimpleButtonHandlers() {
    console.log('Setting up simple button handlers...');
    
    // Аналогично основным обработчикам
    const addMemoryBtn = document.getElementById('add-memory-btn');
    const projectBtn = document.getElementById('project-btn');
    
    if (addMemoryBtn) {
        // Клонируем кнопку, чтобы удалить все обработчики событий
        const newAddMemoryBtn = addMemoryBtn.cloneNode(true);
        if (addMemoryBtn.parentNode) {
            addMemoryBtn.parentNode.replaceChild(newAddMemoryBtn, addMemoryBtn);
        }
        
        // Добавляем новый обработчик
        newAddMemoryBtn.addEventListener('click', function() {
            console.log('Add memory button clicked in simple mode');
            showMemoryModal('past');
        });
        
        console.log('Simple memory button handler set up');
    }
    
    if (projectBtn) {
        // Клонируем кнопку, чтобы удалить все обработчики событий
        const newProjectBtn = projectBtn.cloneNode(true);
        if (projectBtn.parentNode) {
            projectBtn.parentNode.replaceChild(newProjectBtn, projectBtn);
        }
        
        // Добавляем новый обработчик
        newProjectBtn.addEventListener('click', function() {
            console.log('Project button clicked in simple mode');
            showMemoryModal('future');
        });
        
        console.log('Simple project button handler set up');
    }
}

// Отображение модального окна
function showMemoryModal(type) {
    console.log(`Memory Map: Showing memory modal for type: ${type}`);
    
    // Удаляем существующее модальное окно, если оно есть
    let existingModal = document.querySelector('.memory-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Добавляем стили для модального окна, если их нет
    if (!document.getElementById('memory-modal-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'memory-modal-styles';
        styleElement.textContent = `
            .memory-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 100;
                background: rgba(0, 0, 0, 0.9);
                border: 1px solid var(--primary-color);
                border-radius: 8px;
                padding: 1rem;
                transition: opacity 0.2s ease;
                opacity: 0;
                width: 80%;
                max-width: 400px;
            }
            .memory-modal.active {
                opacity: 1;
            }
            .memory-modal-content {
                color: var(--text-color);
            }
            .memory-modal-content h4 {
                color: var(--primary-color);
                margin-top: 0;
                font-family: 'VT323', monospace;
                text-align: center;
            }
            .memory-modal-content input[type="text"],
            .memory-modal-content textarea {
                width: 100%;
                padding: 0.5rem;
                background: rgba(30, 30, 30, 0.9);
                border: 1px solid var(--primary-color);
                border-radius: 4px;
                color: var(--primary-color);
                font-family: 'VT323', monospace;
                margin-bottom: 10px;
            }
            .memory-modal-content textarea {
                height: 100px;
                resize: vertical;
            }
            .emotion-selector {
                margin: 0.5rem 0;
            }
            .emotion-selector span {
                display: block;
                margin-bottom: 0.5rem;
                color: var(--text-color-muted);
            }
            .emotion-scale {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
                margin-top: 5px;
            }
            .emotion {
                cursor: pointer;
                padding: 0.2rem 0.5rem;
                border: 1px solid var(--primary-color);
                border-radius: 4px;
                color: var(--text-color);
                font-family: 'VT323', monospace;
            }
            .emotion.selected {
                background: var(--primary-color);
                color: #000;
            }
            .modal-actions {
                display: flex;
                gap: 0.5rem;
                justify-content: flex-end;
                margin-top: 1rem;
            }
            .modal-actions button {
                background: transparent;
                border: 1px solid var(--primary-color);
                color: var(--primary-color);
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
                font-family: 'VT323', monospace;
                font-size: 1rem;
                transition: all 0.3s ease;
            }
            .modal-actions button:hover {
                background: rgba(255, 215, 0, 0.1);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(255, 215, 0, 0.2);
            }
            @media (max-width: 480px) {
                .memory-modal {
                    width: 90%;
                    padding: 0.75rem;
                }
                .modal-actions button {
                    padding: 0.4rem 0.75rem;
                }
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    // Создаем новое модальное окно
    const modal = document.createElement('div');
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
    
    // Добавляем модальное окно в DOM
    document.body.appendChild(modal);
    
    // Настраиваем обработчики для модального окна
    setupModalHandlers(modal);
    
    // Делаем модальное окно видимым после добавления в DOM
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
    
    // Автоматически выбираем первую эмоцию по умолчанию
    if (emotions.length > 0 && !modal.querySelector('.emotion.selected')) {
        emotions[0].classList.add('selected');
    }
    
    const cancelBtn = modal.querySelector('#cancel-memory');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            playSound('close');
            setTimeout(() => modal.remove(), 300);
        });
    }
    
    const saveBtn = modal.querySelector('#save-memory');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const titleInput = modal.querySelector('#memory-title');
            const descInput = modal.querySelector('#memory-desc');
            const typeInput = modal.querySelector('#memory-type');
            
            if (!titleInput || !descInput || !typeInput) {
                console.error('Memory Map: Missing form elements in modal');
                return;
            }
            
            const title = titleInput.value.trim();
            const description = descInput.value.trim();
            const selectedEmotion = modal.querySelector('.emotion.selected');
            const type = typeInput.value;
            
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
    
    if (isThreeAvailable) {
        createConstellation();
    } else {
        updateSimpleMemoryList();
    }
    
    console.log('Memory Map: Memory saved', memory);
}

// Загрузка воспоминаний
function loadMemories() {
    try {
        const stored = localStorage.getItem('timeMemories');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Memory Map: Error loading memories:', error);
        return [];
    }
}

// Звуковые эффекты
function playSound(type) {
    try {
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.error('Web Audio API is not supported in this browser');
                return;
            }
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
    } catch (error) {
        console.warn('Error playing sound:', error);
    }
}

// Очистка воспоминаний
function clearAllMemories() {
    if (confirm('Are you sure you want to delete all memories?')) {
        localStorage.removeItem('timeMemories');
        memories = [];
        if (isThreeAvailable) {
            createConstellation();
        } else {
            updateSimpleMemoryList();
        }
        console.log('Memory Map: All memories cleared');
    }
}

// Обработка изменения размера окна
function onWindowResize() {
    if (!isThreeAvailable) return;
    
    const container = document.getElementById('memory-map');
    if (!container) return;
    
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    console.log('Memory Map: Window resized');
}

// Обработка движения мыши
function onMouseMove(event) {
    if (!isThreeAvailable || !particles) return;
    
    const container = document.getElementById('memory-map');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(particles);
    
    if (intersects.length > 0) {
        const index = intersects[0].index;
        const memory = memories[index];
        showTooltip(memory, event.clientX, event.clientY);
    } else {
        hideTooltip();
    }
}