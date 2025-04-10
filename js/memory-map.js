/**
 * memory-map.js
 * Premium-quality visualization of Memory Constellation with improved modal functionality
 */

// Global variables
let scene, camera, renderer, raycaster, mouse;
let memories = [];
let particles, lines;
let audioContext = null;
let time = 0;
let isThreeAvailable = false;
let buttonHandlersInitialized = false;
let animationRunning = false;

// Initialize after DOM and Three.js are loaded
function initMemoryMap() {
    console.log('Memory Map: Initializing...');
    
    // Check for Three.js
    if (typeof THREE === 'undefined') {
        console.error('Memory Map: Three.js is not loaded!');
        initSimpleMemoryMap();
        return;
    }
    
    isThreeAvailable = true;
    
    // Check for canvas
    const canvas = document.getElementById('memory-map');
    if (!canvas) {
        console.error('Memory Map: Canvas element with id "memory-map" not found!');
        return;
    }
    
    // Setup Three.js scene
    try {
        setupScene();
        
        // Load memories
        memories = loadMemories();
        
        // Create visualization
        createConstellation();
        
        // Setup button handlers - avoid duplication
        if (!buttonHandlersInitialized) {
            setupButtonHandlers();
            buttonHandlersInitialized = true;
        }
        
        // Animation
        animationRunning = true;
        animate();
        
        // Event handlers
        window.addEventListener('resize', onWindowResize);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('click', onMouseClick);
        console.log('Memory Map: Initialized successfully!');
    } catch (error) {
        console.error('Memory Map: Error initializing 3D mode:', error);
        initSimpleMemoryMap();
    }
}

// Initialize simplified version
function initSimpleMemoryMap() {
    console.log('Memory Map: Initializing simple mode...');
    
    // Show fallback div
    const fallbackDiv = document.getElementById('memory-map-fallback');
    if (fallbackDiv) {
        fallbackDiv.style.display = 'block';
    }
    
    // Hide canvas
    const canvas = document.getElementById('memory-map');
    if (canvas) {
        canvas.style.display = 'none';
    }
    
    // Load memories
    memories = loadMemories();
    
    // Create simplified interface
    createSimpleMemoryInterface();
    
    // Setup button handlers
    if (!buttonHandlersInitialized) {
        setupButtonHandlers();
        buttonHandlersInitialized = true;
    }
    
    console.log('Memory Map: Simple mode initialized successfully!');
}

// Create simplified memory interface
function createSimpleMemoryInterface() {
    const container = document.querySelector('.memory-container');
    if (!container) return;
    
    // Check if interface already exists
    if (container.querySelector('#simple-memory-list')) {
        console.log('Simple memory interface already exists');
        return;
    }
    
    // Create simple memory list
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
    
    // Add header
    const listHeader = document.createElement('h4');
    listHeader.textContent = 'Your Memory Timeline';
    listHeader.style.color = 'var(--primary-color)';
    listHeader.style.fontFamily = '"VT323", monospace';
    listHeader.style.textAlign = 'center';
    listHeader.style.marginBottom = '15px';
    memoryList.appendChild(listHeader);
    
    // Insert list before controls
    const controls = container.querySelector('.memory-controls');
    if (controls) {
        container.insertBefore(memoryList, controls);
    } else {
        container.appendChild(memoryList);
    }
    
    // Update memory list
    updateSimpleMemoryList();
}

// Update simplified memory list
function updateSimpleMemoryList() {
    const memoryList = document.getElementById('simple-memory-list');
    if (!memoryList) return;
    
    // Clear current list (оставляем только заголовок)
    while (memoryList.children.length > 1) {
        memoryList.removeChild(memoryList.lastChild);
    }
    
    // Sort memories by time
    const sortedMemories = [...memories].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Show message if empty
    if (sortedMemories.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No memories captured yet. Use the buttons below to add your first memory.';
        emptyMessage.style.color = 'var(--text-color-muted)';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.padding = '20px';
        memoryList.appendChild(emptyMessage);
        return;
    }
    
    // Add memories to list
    sortedMemories.forEach(memory => {
        const memoryItem = document.createElement('div');
        memoryItem.className = 'simple-memory-item';
        memoryItem.style.padding = '10px';
        memoryItem.style.marginBottom = '10px';
        memoryItem.style.borderRadius = '4px';
        memoryItem.style.background = 'rgba(30, 30, 30, 0.5)';
        memoryItem.style.borderLeft = `4px solid ${getEmotionColor(memory.emotion)}`;
        
        // Memory title
        const titleElement = document.createElement('h5');
        titleElement.textContent = memory.title;
        titleElement.style.margin = '0 0 5px 0';
        titleElement.style.color = 'var(--primary-color)';
        titleElement.style.fontFamily = '"VT323", monospace';
        memoryItem.appendChild(titleElement);
        
        // Memory type (past/future)
        const typeElement = document.createElement('span');
        typeElement.textContent = memory.type === 'past' ? '◄ Past' : '► Future';
        typeElement.style.fontSize = '0.8em';
        typeElement.style.color = memory.type === 'past' ? '#87CEEB' : '#9370DB';
        typeElement.style.marginRight = '10px';
        memoryItem.appendChild(typeElement);
        
        // Emotion
        const emotionElement = document.createElement('span');
        emotionElement.textContent = `Emotion: ${memory.emotion}`;
        emotionElement.style.fontSize = '0.8em';
        emotionElement.style.color = 'var(--text-color-muted)';
        memoryItem.appendChild(emotionElement);
        
        // Description (if any)
        if (memory.description) {
            const descElement = document.createElement('p');
            descElement.textContent = memory.description;
            descElement.style.margin = '5px 0 0 0';
            descElement.style.fontSize = '0.9em';
            descElement.style.color = 'var(--text-color)';
            memoryItem.appendChild(descElement);
        }
        
        // Add to list
        memoryList.appendChild(memoryItem);
    });
}

// Get color for emotion
function getEmotionColor(emotion) {
    const colors = {
        'joy': '#FFD700',
        'reflection': '#87CEEB',
        'aspiration': '#9370DB',
        'sublime': '#00FA9A'
    };
    return colors[emotion] || '#FFFFFF';
}

// Setup Three.js scene
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

// Create constellation
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
    
    // Limit particles for performance
    if (memories.length > 50) {
        console.warn('Memory Map: Too many memories, limiting to 50 for performance');
        memories = memories.slice(0, 50);
    }
    
    // Check for scene
    if (!scene) {
        console.error('Memory Map: Scene is not initialized');
        return;
    }
    
    // Clear scene
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    
    // Create particles (memories)
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
    
    // Create lines
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

// Setup button handlers
function setupButtonHandlers() {
    console.log('Setting up button handlers...');
    
    // Get button elements
    const addMemoryBtn = document.getElementById('add-memory-btn');
    const projectBtn = document.getElementById('project-btn');
    
    if (addMemoryBtn) {
        // Clone button to remove all event handlers
        const newAddMemoryBtn = addMemoryBtn.cloneNode(true);
        if (addMemoryBtn.parentNode) {
            addMemoryBtn.parentNode.replaceChild(newAddMemoryBtn, addMemoryBtn);
        }
        
        // Add new handler
        newAddMemoryBtn.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('Add memory button clicked');
            showMemoryModal('past', this);
        });
        
        console.log('Memory button handler set up');
    } else {
        console.error('Memory Map: Add memory button not found!');
    }
    
    if (projectBtn) {
        // Clone button to remove all event handlers
        const newProjectBtn = projectBtn.cloneNode(true);
        if (projectBtn.parentNode) {
            projectBtn.parentNode.replaceChild(newProjectBtn, projectBtn);
        }
        
        // Add new handler
        newProjectBtn.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('Project button clicked');
            showMemoryModal('future', this);
        });
        
        console.log('Project button handler set up');
    } else {
        console.error('Memory Map: Project button not found!');
    }
}

// Исправляем функцию showMemoryModal для корректного позиционирования
function showMemoryModal(type, buttonElement) {
    console.log(`Memory Map: Showing memory modal for type: ${type}`);
    
    // Remove existing modal
    let existingModal = document.querySelector('.memory-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Get button position for modal placement
    const buttonRect = buttonElement.getBoundingClientRect();
    const modalWidth = 450; // Wider modal for better readability
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'memory-modal premium-modal';
    
    // Position modal relative to the button - below it
    Object.assign(modal.style, {
        position: 'fixed',
        width: `${modalWidth}px`,
        maxWidth: '90vw',
        top: `${buttonRect.bottom + 20}px`,
        left: `${Math.max(20, Math.min(buttonRect.left, window.innerWidth - modalWidth - 20))}px`,
        zIndex: '9999',
        padding: '25px',
        opacity: '0',
        transform: 'translateY(-10px)',
        transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'
    });
    
    // Set title based on type
    const title = type === 'past' ? 'Capture Memory Fragment' : 'Project Future Aspiration';
    
    // Emotion options
    const emotions = [
        { value: 'joy', label: 'Joy', color: '#FFD700' },
        { value: 'reflection', label: 'Reflection', color: '#87CEEB' },
        { value: 'aspiration', label: 'Aspiration', color: '#9370DB' },
        { value: 'sublime', label: 'Sublime', color: '#00FA9A' }
    ];
    
    // Generate emotion options HTML
    let emotionOptionsHTML = emotions.map(emotion => 
        `<div class="emotion" data-value="${emotion.value}" style="color: ${emotion.color}; border-color: ${emotion.color};">
            ${emotion.label}
        </div>`
    ).join('');
    
    // Modal content
    modal.innerHTML = `
        <div class="memory-modal-content">
            <h3 style="font-size: 2rem; color: #FFD700; margin-top: 0; text-align: center; margin-bottom: 20px;">${title}</h3>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 1.2rem; margin-bottom: 8px; color: #FFD700;">Title:</label>
                <input type="text" id="memory-title" placeholder="Enter title..." autocomplete="off">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 1.2rem; margin-bottom: 8px; color: #FFD700;">Description:</label>
                <textarea id="memory-desc" placeholder="Enter description..."></textarea>
            </div>
            
            <div class="emotion-selector">
                <label style="display: block; font-size: 1.2rem; margin-bottom: 10px; color: #FFD700;">Emotional signature:</label>
                <div class="emotion-scale">
                    ${emotionOptionsHTML}
                </div>
            </div>
            
            <div class="modal-actions">
                <button id="cancel-memory">Cancel</button>
                <button id="save-memory">Crystallize</button>
            </div>
            
            <input type="hidden" id="memory-type" value="${type}">
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Setup emotion selection
    const emotionElements = modal.querySelectorAll('.emotion');
    emotionElements.forEach(emotion => {
        emotion.addEventListener('click', function() {
            // Remove selected state from all emotions
            emotionElements.forEach(e => {
                e.style.background = 'transparent';
                e.style.transform = 'scale(1)';
                e.style.fontWeight = 'normal';
            });
            
            // Add selected state
            const color = this.style.color;
            this.style.background = `rgba(${hexToRgb(color)}, 0.2)`;
            this.style.transform = 'scale(1.05)';
            this.style.fontWeight = 'bold';
            
            // Play sound
            playSound('select');
        });
    });
    
    // Select first emotion by default
    if (emotionElements.length > 0) {
        const firstEmotion = emotionElements[0];
        const color = firstEmotion.style.color;
        firstEmotion.style.background = `rgba(${hexToRgb(color)}, 0.2)`;
        firstEmotion.style.transform = 'scale(1.05)';
        firstEmotion.style.fontWeight = 'bold';
    }
    
    // Cancel button handler
    modal.querySelector('#cancel-memory').addEventListener('click', function() {
        closeModal(modal);
        playSound('close');
    });
    
    // Save button handler
    modal.querySelector('#save-memory').addEventListener('click', function() {
        saveMemoryData(modal);
    });
    
    // Check if modal would be off-screen for mobile devices and adjust
    if (window.innerWidth <= 768) {
        // Center the modal for mobile
        modal.style.left = '50%';
        modal.style.transform = 'translateX(-50%) translateY(-10px)';
        
        // Adjust animation for mobile
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
    } else {
        // Show modal with standard animation
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.transform = 'translateY(0)';
        }, 10);
    }
    
    // Focus title input
    setTimeout(() => {
        const titleInput = modal.querySelector('#memory-title');
        if (titleInput) titleInput.focus();
    }, 300);
}

// Convert hex color to RGB
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16) || 255;
    const g = parseInt(hex.substring(2, 4), 16) || 215;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    
    return `${r}, ${g}, ${b}`;
}

// Close modal with animation
function closeModal(modal) {
    if (!modal) return;
    
    modal.style.opacity = '0';
    modal.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        modal.remove();
    }, 300);
}

// Обновляем функцию saveMemory, чтобы она вызывала обновление визуализации
function saveMemory(memory) {
    console.log('Saving memory:', memory);
    
    // Load existing memories
    let memories = loadMemories();
    
    // Add new memory
    memories.push(memory);
    
    // Save to localStorage
    try {
        localStorage.setItem('timeMemories', JSON.stringify(memories));
        console.log('Memory saved successfully');
        
        // Update visualization based on current mode
        if (isThreeAvailable) {
            console.log('Updating 3D visualization');
            // Обновляем глобальную переменную memories
            window.memories = memories;
            createConstellation();
        } else {
            console.log('Updating simple visualization');
            updateSimpleMemoryList();
        }
        
        return true;
    } catch (error) {
        console.error('Error saving memory:', error);
        return false;
    }
}

// Обновляем функцию saveMemoryData для корректной работы
function saveMemoryData(modal) {
    const titleInput = modal.querySelector('#memory-title');
    const descInput = modal.querySelector('#memory-desc');
    const typeInput = modal.querySelector('#memory-type');
    
    if (!titleInput || !descInput || !typeInput) {
        console.error('Missing form elements in modal');
        return;
    }
    
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const selectedEmotion = modal.querySelector('.emotion[style*="scale(1.05)"]');
    const type = typeInput.value;
    
    if (!title) {
        showNotification(modal, 'Please enter a title for your memory', 'error');
        titleInput.focus();
        return;
    }
    
    const emotion = selectedEmotion ? selectedEmotion.getAttribute('data-value') : 'reflection';
    
    // Create memory
    const memory = {
        id: Date.now(),
        title,
        description,
        emotion,
        type,
        timestamp: new Date().toISOString(),
        position: generateRandomPosition(type)
    };
    
    // Save memory
    saveMemory(memory);
    
    // Show notification
    showNotification(modal, 'Memory crystallized successfully!', 'success');
    
    // Play sound
    playSound('success');
    
    // Close modal
    setTimeout(() => {
        closeModal(modal);
    }, 1000);
}

// Show notification
function showNotification(modal, message, type = 'success') {
    // Create or find notification element
    let notification = modal.querySelector('.memory-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'memory-notification';
        
        // Style notification
        Object.assign(notification.style, {
            position: 'absolute',
            bottom: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: type === 'success' ? 'rgba(0, 128, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)',
            color: type === 'success' ? '#00FF00' : '#FF5555',
            padding: '10px 20px',
            borderRadius: '4px',
            fontSize: '1.1rem',
            textAlign: 'center',
            opacity: '0',
            transition: 'opacity 0.3s ease',
            border: `1px solid ${type === 'success' ? '#00FF00' : '#FF5555'}`
        });
        
        modal.appendChild(notification);
    } else {
        // Update existing notification
        notification.style.backgroundColor = type === 'success' ? 'rgba(0, 128, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)';
        notification.style.color = type === 'success' ? '#00FF00' : '#FF5555';
        notification.style.border = `1px solid ${type === 'success' ? '#00FF00' : '#FF5555'}`;
    }
    
    // Set message
    notification.textContent = message;
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Hide after delay
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 3000);
}

// Generate random position
function generateRandomPosition(type) {
    let x = type === 'past' ? Math.random() * 0.4 : 0.6 + Math.random() * 0.4;
    let y = Math.random() * 0.8 + 0.1;
    let z = Math.random() * 0.5;
    return { x, y, z };
}

// Load memories
function loadMemories() {
    try {
        const stored = localStorage.getItem('timeMemories');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading memories:', error);
        return [];
    }
}

// Play sound
function playSound(type) {
    try {
        // Create audio context
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
        
        // Configure sound
        switch (type) {
            case 'open':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
                gain.gain.setValueAtTime(0.2, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
                
            case 'close':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.2);
                gain.gain.setValueAtTime(0.2, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
                
            case 'select':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                gain.gain.setValueAtTime(0.1, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
                
            case 'success':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(550, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.2);
                gain.gain.setValueAtTime(0.2, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
                
            case 'error':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(220, audioContext.currentTime + 0.1);
                gain.gain.setValueAtTime(0.2, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
                
            default:
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                gain.gain.setValueAtTime(0.1, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
        }
    } catch (error) {
        console.warn('Error playing sound:', error);
    }
}

// Animation loop
function animate() {
    if (!isThreeAvailable) return;
    
    requestAnimationFrame(animate);
    
    // Update time
    time += 0.01;
    
    // Update uniforms
    if (particles && particles.material.uniforms) {
        particles.material.uniforms.time.value = time;
    }
    
    if (lines && lines.material.uniforms) {
        lines.material.uniforms.time.value = time;
    }
    
    // Render scene
    renderer.render(scene, camera);
}

// Window resize handler
function onWindowResize() {
    if (!isThreeAvailable) return;
    
    const container = document.getElementById('memory-map');
    if (!container) return;
    
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Mouse move handler
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

// Mouse click handler
function onMouseClick(event) {
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
        displayMemoryDetails(memory);
    }
}

// Show memory tooltip
function showTooltip(memory, x, y) {
    if (!memory) return;
    
    // Remove existing tooltip
    hideTooltip();
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'memory-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.top = `${y + 20}px`;
    tooltip.style.left = `${x + 10}px`;
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = getEmotionColor(memory.emotion);
    tooltip.style.padding = '10px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.zIndex = '1000';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.fontSize = '14px';
    tooltip.style.maxWidth = '200px';
    tooltip.style.border = `1px solid ${getEmotionColor(memory.emotion)}`;
    tooltip.style.boxShadow = `0 0 10px rgba(${hexToRgb(getEmotionColor(memory.emotion))}, 0.3)`;
    
    // Tooltip content
    tooltip.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">${memory.title}</div>
        <div style="font-size: 12px; opacity: 0.8;">Type: ${memory.type}</div>
        <div style="font-size: 12px; opacity: 0.8;">Emotion: ${memory.emotion}</div>
    `;
    
    // Add to body
    document.body.appendChild(tooltip);
}

// Hide memory tooltip
function hideTooltip() {
    const tooltip = document.querySelector('.memory-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Display memory details
function displayMemoryDetails(memory) {
    if (!memory) return;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'memory-modal premium-modal';
    
    // Set modal styles
    Object.assign(modal.style, {
        position: 'fixed',
        width: '450px',
        maxWidth: '90vw',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: '9999',
        padding: '25px',
        opacity: '0',
        transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'
    });
    
    // Format date
    const formattedDate = new Date(memory.timestamp).toLocaleString();
    
    // Modal content
    modal.innerHTML = `
        <div class="memory-modal-content">
            <h3 style="font-size: 2rem; color: ${getEmotionColor(memory.emotion)}; margin-top: 0; text-align: center; margin-bottom: 20px;">${memory.title}</h3>
            
            <div style="margin-bottom: 15px;">
                <div style="font-size: 1.1rem; color: #FFD700; margin-bottom: 5px;">Type:</div>
                <div style="background: rgba(20, 20, 20, 0.8); padding: 10px; border-radius: 6px; border: 1px solid ${getEmotionColor(memory.emotion)};">
                    ${memory.type === 'past' ? '◄ Past Memory' : '► Future Projection'}
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <div style="font-size: 1.1rem; color: #FFD700; margin-bottom: 5px;">Emotional Signature:</div>
                <div style="background: rgba(20, 20, 20, 0.8); padding: 10px; border-radius: 6px; border: 1px solid ${getEmotionColor(memory.emotion)}; color: ${getEmotionColor(memory.emotion)};">
                    ${memory.emotion}
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <div style="font-size: 1.1rem; color: #FFD700; margin-bottom: 5px;">Timestamp:</div>
                <div style="background: rgba(20, 20, 20, 0.8); padding: 10px; border-radius: 6px; border: 1px solid rgba(255, 215, 0, 0.3);">
                    ${formattedDate}
                </div>
            </div>
            
            ${memory.description ? `
            <div style="margin-bottom: 15px;">
                <div style="font-size: 1.1rem; color: #FFD700; margin-bottom: 5px;">Description:</div>
                <div style="background: rgba(20, 20, 20, 0.8); padding: 10px; border-radius: 6px; border: 1px solid rgba(255, 215, 0, 0.3); min-height: 100px;">
                    ${memory.description}
                </div>
            </div>
            ` : ''}
            
            <div class="modal-actions">
                <button id="close-detail">Close</button>
                <button id="delete-memory" style="background: rgba(255, 0, 0, 0.2); color: #FF5555; border: 1px solid #FF5555;">Delete</button>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(modal);
    
    // Button handlers
    modal.querySelector('#close-detail').addEventListener('click', function() {
        closeModal(modal);
    });
    
    modal.querySelector('#delete-memory').addEventListener('click', function() {
        if (confirm('Are you sure you want to delete this memory?')) {
            deleteMemory(memory.id);
            closeModal(modal);
        }
    });
    
    // Show modal
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.transform = 'translate(-50%, -50%) scale(1)';
        playSound('open');
    }, 10);
}

// Delete memory
function deleteMemory(id) {
    let memories = loadMemories();
    memories = memories.filter(memory => memory.id !== id);
    
    try {
        localStorage.setItem('timeMemories', JSON.stringify(memories));
        
        // Update visualization
        if (isThreeAvailable) {
            createConstellation();
        } else {
            updateSimpleMemoryList();
        }
        
        playSound('close');
    } catch (error) {
        console.error('Error deleting memory:', error);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize memory map
    initMemoryMap();
});

// Reinitialize when page shown
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page is visible again
        if (isThreeAvailable && !animationRunning) {
            animate();
        }
    }
});
