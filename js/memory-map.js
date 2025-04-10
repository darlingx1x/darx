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

// Инициализация после полной загрузки DOM и Three.js
function initMemoryMap() {
    console.log('Memory Map: Initializing...');
    
    // Проверка наличия Three.js
    if (typeof THREE === 'undefined') {
        console.error('Memory Map: Three.js is not loaded!');
        return;
    }
    
    // Проверка наличия canvas
    const canvas = document.getElementById('memory-map');
    if (!canvas) {
        console.error('Memory Map: Canvas element with id "memory-map" not found!');
        return;
    }
    
    // Настройка сцены Three.js
    setupScene();
    
    // Загрузка воспоминаний
    loadMemories();
    
    // Создание визуализации
    createConstellation();
    
    // Настройка обработчиков кнопок
    setupButtonHandlers();
    
    // Анимация
    animate();
    
    // Обработчики событий
    window.addEventListener('resize', onWindowResize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onMouseClick);
    console.log('Memory Map: Initialized successfully!');
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

// Обработка изменения размера окна
function onWindowResize() {
    const container = document.getElementById('memory-map');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    console.log('Memory Map: Window resized');
}

// Обработка движения мыши
function onMouseMove(event) {
    const container = document.getElementById('memory-map');
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

// Обработка клика
function onMouseClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(particles);
    if (intersects.length > 0) {
        const index = intersects[0].index;
        const memory = memories[index];
        alert(`${memory.title}\n${memory.description}\nEmotion: ${memory.emotion}`);
    }
}

// Показ всплывающей подсказки
function showTooltip(memory, x, y) {
    let tooltip = document.querySelector('.memory-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'memory-tooltip';
        document.body.appendChild(tooltip);
    }
    tooltip.innerHTML = `
        <strong>${memory.title}</strong><br>
        ${memory.type === 'past' ? '◄' : '►'} ${memory.emotion}
    `;
    tooltip.style.position = 'absolute';
    tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = 'var(--primary-color)';
    tooltip.style.padding = '0.5rem';
    tooltip.style.borderRadius = '4px';
    tooltip.style.border = '1px solid var(--primary-color)';
    tooltip.style.left = `${x + 10}px`;
    tooltip.style.top = `${y + 10}px`;
    tooltip.style.zIndex = '101';
}

// Скрытие всплывающей подсказки
function hideTooltip() {
    const tooltip = document.querySelector('.memory-tooltip');
    if (tooltip) tooltip.remove();
}

// Анимация с плавным вращением камеры
function animate() {
    requestAnimationFrame(animate);
    
    time += 0.01;
    if (particles) particles.material.uniforms.time.value = time;
    if (lines) lines.material.uniforms.time.value = time;
    
    camera.position.x = Math.sin(time * 0.1) * 50;
    camera.position.z = Math.cos(time * 0.1) * 50;
    camera.position.y = 10 + Math.sin(time * 0.05) * 5;
    camera.lookAt(0, 0, 0);
    
    renderer.render(scene, camera);
}

// Настройка обработчиков кнопок
function setupButtonHandlers() {
    console.log('Setting up button handlers...');
    const addMemoryBtn = document.getElementById('add-memory-btn');
    const projectBtn = document.getElementById('project-btn');
    
    if (addMemoryBtn) {
        console.log('Add memory button found, adding event listener');
        addMemoryBtn.addEventListener('click', function() {
            console.log('Add memory button clicked');
            showMemoryModal('past');
        });
    } else {
        console.error('Memory Map: Add memory button not found!');
    }
    
    if (projectBtn) {
        console.log('Project button found, adding event listener');
        projectBtn.addEventListener('click', function() {
            console.log('Project button clicked');
            showMemoryModal('future');
        });
    } else {
        console.error('Memory Map: Project button not found!');
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
    createConstellation();
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
}

// Очистка воспоминаний
function clearAllMemories() {
    if (confirm('Are you sure you want to delete all memories?')) {
        localStorage.removeItem('timeMemories');
        memories = [];
        createConstellation();
        console.log('Memory Map: All memories cleared');
    }
}

// Экспорт функций
window.MemoryMap = {
    initialize: () => { loadMemories(); createConstellation(); },
    addMemory: type => showMemoryModal(type),
    clearMemories: clearAllMemories
};

// Экспорт функции инициализации для глобального доступа
window.initMemoryMap = initMemoryMap;