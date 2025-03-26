/**
 * cyber-oracle.js - Генератор философских ответов в кибер-стиле
 * Версия 2.2 - С интерактивными элементами и улучшенными взаимодействиями
 */

document.addEventListener('DOMContentLoaded', function() {
    // Глобальное состояние звука: если window.oracleSoundEnabled уже определено, используем его, иначе читаем из localStorage
    let soundEnabled = window.oracleSoundEnabled !== undefined ? window.oracleSoundEnabled : localStorage.getItem('oracleSoundEnabled') !== 'false';

    // Создаем стилизованный навбар для Оракула вместо стандартной панели управления
    createStylizedNavbar();

    // Инициализация звука при первом взаимодействии с любым элементом страницы
    const initAudioOnInteraction = function() {
        initAudio();
        document.removeEventListener('click', initAudioOnInteraction);
        document.removeEventListener('keydown', initAudioOnInteraction);
        document.removeEventListener('touchstart', initAudioOnInteraction);
    };
    document.addEventListener('click', initAudioOnInteraction);
    document.addEventListener('keydown', initAudioOnInteraction);
    document.addEventListener('touchstart', initAudioOnInteraction);

    // Проверяем, находимся ли мы на странице с открытыми вопросами
    const questionsList = document.querySelector('.article-content ol');
    if (!questionsList) return;
    
    // Категории ответов с разными стилями анимации
    const responseCategories = {
        quantum: {
            responses: [
                "Граница между прошлым и настоящим я размывается в потоке квантовых флуктуаций сознания. Идентичность — это лишь вероятностное распределение в нейронной сети.",
                "В квантовом мире все состояния существуют одновременно, пока не произведено наблюдение. Так и твое сознание существует во множестве возможных конфигураций."
            ],
            animationSpeed: 25,
            animationStyle: 'quantum',
            thinkingPrefix: "Анализ квантовых состояний",
            glowColor: "0, 191, 255",
            soundProfile: "quantum",
        },
        network: {
            responses: [
                "В цифровом веке мы стали нодами в глобальной сети. Индивидуальность — всего лишь уникальная комбинация связей.",
                "За каждым решением скрыт невидимый алгоритм, сформированный миллионами итераций опыта. Осознанность — это лишь дебаггер сознания."
            ],
            animationSpeed: 30,
            animationStyle: 'network',
            thinkingPrefix: "Построение нейронной модели",
            glowColor: "80, 200, 120",
            soundProfile: "digital",
        },
        metaphysical: {
            responses: [
                "Реальность — всего лишь согласованная иллюзия, симуляция, основанная на ограниченном восприятии сенсорных данных.",
                "Человечество движется к сингулярности, где границы между разумом и технологией исчезнут. Эволюция сознания неизбежна."
            ],
            animationSpeed: 35,
            animationStyle: 'metaphysical',
            thinkingPrefix: "Вычисление метафизических параметров",
            glowColor: "147, 112, 219",
            soundProfile: "ethereal",
        },
        systems: {
            responses: [
                "Парадоксы не ошибки, а точки бифуркации системы. В них заключен потенциал для качественного скачка развития.",
                "Расширение пространства мыслей требует перепрограммирования ментальной архитектуры. Новые концепции рождаются на пересечении существующих систем."
            ],
            animationSpeed: 28,
            animationStyle: 'systems',
            thinkingPrefix: "Реконфигурация системной архитектуры",
            glowColor: "255, 69, 0",
            soundProfile: "mechanical",
        }
    };
    
    // Аудиоконтекст для звуковых эффектов
    let audioContext = null;
    
    // Инициализация аудиоконтекста при взаимодействии пользователя с проверкой состояния и возобновлением
    function initAudio() {
        if (!audioContext && window.AudioContext) {
            try {
                audioContext = new AudioContext();
                console.log('Audio context initialized');
                
                // Если контекст в состоянии suspended, добавляем обработчики для возобновления
                if (audioContext.state === 'suspended') {
                    const resumeAudio = function() {
                        audioContext.resume().then(() => {
                            console.log('AudioContext resumed successfully');
                            document.removeEventListener('click', resumeAudio);
                            document.removeEventListener('keydown', resumeAudio);
                            document.removeEventListener('touchstart', resumeAudio);
                        });
                    };
                    document.addEventListener('click', resumeAudio);
                    document.addEventListener('keydown', resumeAudio);
                    document.addEventListener('touchstart', resumeAudio);
                }
            } catch (e) {
                console.warn('Failed to initialize audio context:', e);
            }
        } else if (audioContext && audioContext.state === 'suspended') {
            // Если контекст уже существует, но приостановлен, пытаемся возобновить
            audioContext.resume().then(() => {
                console.log('Existing AudioContext resumed');
            });
        }
    }
    
    // Функция создания звука печати в зависимости от профиля
    function playTypeSound(profile) {
        if (!audioContext || !soundEnabled) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        switch (profile) {
            case 'quantum':
                oscillator.type = 'sine';
                oscillator.frequency.value = 440 + Math.random() * 200;
                gainNode.gain.value = 0.4;
                break;
            case 'digital':
                oscillator.type = 'square';
                oscillator.frequency.value = 220 + Math.random() * 100;
                gainNode.gain.value = 0.5;
                break;
            case 'ethereal':
                oscillator.type = 'sine';
                oscillator.frequency.value = 330 + Math.random() * 50;
                gainNode.gain.value = 0.4;
                break;
            case 'mechanical':
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = 110 + Math.random() * 40;
                gainNode.gain.value = 0.4;
                break;
            default:
                oscillator.type = 'sine';
                oscillator.frequency.value = 440;
                gainNode.gain.value = 0.4;
        }
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
    }
    
    // Функция создания звука "мышления" оракула
    function playThinkingSound(profile) {
        if (!audioContext || !soundEnabled) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        switch (profile) {
            case 'quantum':
                oscillator.type = 'sine';
                oscillator.frequency.value = 200 + Math.random() * 100;
                gainNode.gain.value = 0.3;
                break;
            case 'digital':
                oscillator.type = 'square';
                oscillator.frequency.value = 150 + Math.random() * 50;
                gainNode.gain.value = 0.3;
                break;
            case 'ethereal':
                oscillator.type = 'triangle';
                oscillator.frequency.value = 250 + Math.sin(Date.now() * 0.001) * 30;
                gainNode.gain.value = 0.3;
                break;
            case 'mechanical':
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = 100 + Math.random() * 30;
                gainNode.gain.value = 0.3;
                break;
            default:
                oscillator.type = 'sine';
                oscillator.frequency.value = 200;
                gainNode.gain.value = 0.3;
        }
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
    }
    
    // Сохранение ответа оракула в localStorage
    function saveOracleResponse(questionIndex, category, response) {
        try {
            let savedResponses = JSON.parse(localStorage.getItem('oracleResponses') || '{}');
            savedResponses[questionIndex] = {
                category: category.animationStyle,
                response: response,
                timestamp: Date.now()
            };
            localStorage.setItem('oracleResponses', JSON.stringify(savedResponses));
        } catch (e) {
            console.warn('Failed to save response:', e);
        }
    }
    
    // Загрузка сохранённых ответов оракула
    function loadOracleResponses() {
        try {
            return JSON.parse(localStorage.getItem('oracleResponses') || '{}');
        } catch (e) {
            console.warn('Failed to load responses:', e);
            return {};
        }
    }
    
    // Создание кнопок "Спросить Оракула" для каждого вопроса
    const questions = questionsList.querySelectorAll('li');
    questions.forEach((question, index) => {
        const oracleContainer = document.createElement('div');
        oracleContainer.className = 'oracle-container';
        oracleContainer.setAttribute('data-question-index', index);
        
        const askButton = document.createElement('button');
        askButton.className = 'ask-oracle-btn ripple-effect';
        askButton.innerHTML = `
            <span class="terminal-prefix">$></span> 
            <span class="button-text">Спросить Кибер-Оракула</span>
        `;
        askButton.setAttribute('data-question-index', index);
        
        const answerContainer = document.createElement('div');
        answerContainer.className = 'oracle-answer terminal-window';
        answerContainer.style.display = 'none';
        
        const terminalHeader = document.createElement('div');
        terminalHeader.className = 'terminal-header';
        terminalHeader.innerHTML = `
            <span class="terminal-dots">
                <span class="terminal-dot terminal-dot-red"></span>
                <span class="terminal-dot terminal-dot-yellow"></span>
                <span class="terminal-dot terminal-dot-green"></span>
            </span>
            <span class="terminal-title">Кибер-Оракул v2.2</span>
            <span class="terminal-actions">
                <button class="copy-button" title="Копировать ответ"><span>📋</span></button>
                <button class="share-button" title="Поделиться ответом"><span>📤</span></button>
            </span>
        `;
        answerContainer.appendChild(terminalHeader);
        
        const terminalBody = document.createElement('div');
        terminalBody.className = 'terminal-body';
        answerContainer.appendChild(terminalBody);
        
        oracleContainer.appendChild(askButton);
        oracleContainer.appendChild(answerContainer);
        question.appendChild(oracleContainer);
        
        const savedResponses = loadOracleResponses();
        if (savedResponses[index]) {
            askButton.style.display = 'none';
            answerContainer.style.display = 'block';
            answerContainer.classList.add('terminal-appear', 'terminal-glow');
            
            const savedCategory = savedResponses[index].category;
            const category = Object.values(responseCategories).find(c => c.animationStyle === savedCategory) || responseCategories.quantum;
            answerContainer.style.setProperty('--glow-color', category.glowColor);
            answerContainer.style.setProperty('--glow-intensity', '0.3');
            terminalBody.className = `terminal-body terminal-body-${savedCategory}`;
            
            const outputLine = document.createElement('div');
            outputLine.className = 'terminal-output';
            const outputPrefix = document.createElement('span');
            outputPrefix.className = 'terminal-prefix';
            outputPrefix.textContent = 'oracle> ';
            outputLine.appendChild(outputPrefix);
            
            const outputContent = document.createElement('span');
            outputContent.className = 'terminal-content';
            outputContent.textContent = savedResponses[index].response;
            outputLine.appendChild(outputContent);
            
            terminalBody.appendChild(outputLine);
            addAskAgainButton(answerContainer, askButton, terminalBody);
        }
        
        askButton.addEventListener('click', function(event) {
            initAudio();
            createRippleEffect(this, event);
            generateTypedAnswer(answerContainer, terminalBody, this, index);
        });
        
        addMicrointeractions(askButton, answerContainer);
    });
    
    function createRippleEffect(button, event) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        button.appendChild(ripple);
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    function addMicrointeractions(button, container) {
        button.addEventListener('mouseenter', function() {
            button.classList.add('terminal-hover');
            if (soundEnabled) {
                playTypeSound('digital');
            }
        });
        button.addEventListener('mouseleave', function() {
            button.classList.remove('terminal-hover');
        });
        
        container.querySelector('.copy-button').addEventListener('click', function(e) {
            e.stopPropagation();
            const textToCopy = container.querySelector('.terminal-content').textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                showNotification(container, "Ответ скопирован в буфер обмена");
                if (soundEnabled) {
                    playTypeSound('mechanical');
                }
            }).catch(err => {
                console.error('Не удалось скопировать текст: ', err);
            });
        });
        
        container.querySelector('.share-button').addEventListener('click', function(e) {
            e.stopPropagation();
            const text = container.querySelector('.terminal-content').textContent;
            const questionIndex = parseInt(container.parentNode.getAttribute('data-question-index'));
            const questionText = questions[questionIndex].childNodes[0].textContent.trim();
            const shareText = `"${questionText}"\n\nОтвет Кибер-Оракула:\n${text}\n\nPosted from Cyber Oracle`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Ответ Кибер-Оракула',
                    text: shareText
                }).then(() => {
                    if (soundEnabled) {
                        playTypeSound('mechanical');
                    }
                }).catch(err => {
                    console.error('Не удалось поделиться: ', err);
                    copyToClipboardWithNotification(container, shareText);
                });
            } else {
                copyToClipboardWithNotification(container, shareText);
            }
        });
        
        container.querySelectorAll('.terminal-header button').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.classList.add('button-hover');
                if (soundEnabled) {
                    playTypeSound('digital');
                }
            });
            btn.addEventListener('mouseleave', function() {
                this.classList.remove('button-hover');
            });
        });
    }
    
    function copyToClipboardWithNotification(container, text) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification(container, "Ответ скопирован для отправки");
            if (soundEnabled) {
                playTypeSound('mechanical');
            }
        }).catch(err => {
            console.error('Не удалось скопировать текст: ', err);
        });
    }
    
    function showNotification(container, message) {
        const notification = document.createElement('div');
        notification.className = 'oracle-notification';
        notification.textContent = message;
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('notification-show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('notification-show');
            notification.classList.add('notification-hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }
    
    function generateTypedAnswer(container, terminalBody, button, questionIndex) {
        button.style.display = 'none';
        container.style.display = 'block';
        container.classList.add('terminal-appear');
        
        const categoryKeys = Object.keys(responseCategories);
        let category;
        if (questionIndex % categoryKeys.length === 0) {
            category = responseCategories.quantum;
        } else if (questionIndex % categoryKeys.length === 1) {
            category = responseCategories.systems;
        } else if (questionIndex % categoryKeys.length === 2) {
            category = responseCategories.metaphysical;
        } else {
            category = responseCategories.network;
        }
        
        container.style.setProperty('--glow-color', category.glowColor);
        const randomResponse = category.responses[Math.floor(Math.random() * category.responses.length)];
        saveOracleResponse(questionIndex, category, randomResponse);
        
        const thinkingSymbols = [
            '░', '▒', '▓', '█', '▓', '▒', '░',
            '×', '÷', '∞', '∑', '√', '∫', 'Δ',
            '⌘', '⌥', '⎇', '⤻', '⤺', '⟿', '⟾',
            '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'
        ];
        
        terminalBody.innerHTML = `<div class="thinking-animation" style="--glow-color: rgb(${category.glowColor})">
            <span class="thinking-text">${category.thinkingPrefix}</span>
            <span class="thinking-symbols"></span>
        </div>`;
        
        const thinkingSymbolsElement = terminalBody.querySelector('.thinking-symbols');
        let symbolsInterval;
        
        function startThinkingAnimation() {
            let counter = 0;
            symbolsInterval = setInterval(() => {
                const randomSymbols = [];
                const symbolCount = 5 + Math.floor(Math.random() * 5);
                for (let i = 0; i < symbolCount; i++) {
                    const randomIndex = Math.floor(Math.random() * thinkingSymbols.length);
                    randomSymbols.push(thinkingSymbols[randomIndex]);
                }
                thinkingSymbolsElement.textContent = randomSymbols.join('');
                thinkingSymbolsElement.style.opacity = 0.5 + Math.sin(counter * 0.2) * 0.5;
                counter++;
                if (counter % 3 === 0 && soundEnabled) {
                    playThinkingSound(category.soundProfile);
                }
            }, 100);
        }
        
        startThinkingAnimation();
        
        setTimeout(() => {
            terminalBody.querySelector('.thinking-text').textContent = "Синхронизация нейронных сетей";
            setTimeout(() => {
                terminalBody.querySelector('.thinking-text').textContent = "Синтез концептуальной модели";
                setTimeout(() => {
                    clearInterval(symbolsInterval);
                    terminalBody.innerHTML = '';
                    terminalBody.className = `terminal-body terminal-body-${category.animationStyle}`;
                    
                    const outputLine = document.createElement('div');
                    outputLine.className = 'terminal-output';
                    
                    const outputPrefix = document.createElement('span');
                    outputPrefix.className = 'terminal-prefix';
                    outputPrefix.textContent = 'oracle> ';
                    outputLine.appendChild(outputPrefix);
                    
                    const outputContent = document.createElement('span');
                    outputContent.className = 'terminal-content';
                    outputLine.appendChild(outputContent);
                    
                    terminalBody.appendChild(outputLine);
                    
                    switch(category.animationStyle) {
                        case 'quantum':
                            quantumTypingEffect(outputContent, randomResponse, category.animationSpeed, container, button, terminalBody);
                            break;
                        case 'network':
                            networkTypingEffect(outputContent, randomResponse, category.animationSpeed, container, button, terminalBody);
                            break;
                        case 'metaphysical':
                            metaphysicalTypingEffect(outputContent, randomResponse, category.animationSpeed, container, button, terminalBody);
                            break;
                        case 'systems':
                            systemsTypingEffect(outputContent, randomResponse, category.animationSpeed, container, button, terminalBody);
                            break;
                        default:
                            standardTypingEffect(outputContent, randomResponse, category.animationSpeed, container, button, terminalBody);
                    }
                    
                    container.classList.add('terminal-glow');
                    container.style.setProperty('--glow-intensity', '1');
                    
                    let glowInterval = setInterval(() => {
                        const intensity = 0.5 + Math.sin(Date.now() * 0.002) * 0.5;
                        container.style.setProperty('--glow-intensity', intensity.toString());
                    }, 50);
                    
                    setTimeout(() => {
                        clearInterval(glowInterval);
                        container.style.setProperty('--glow-intensity', '0.3');
                    }, 5000);
                    
                }, 800);
            }, 800);
        }, 800);
    }
    
    function standardTypingEffect(element, text, speed, container, button, terminalBody) {
        let i = 0;
        const typeWriter = setInterval(() => {
            if (i < text.length) {
                if (soundEnabled) {
                    playTypeSound('normal');
                }
                element.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(typeWriter);
                addAskAgainButton(container, button, terminalBody);
            }
        }, speed);
    }
    
    function quantumTypingEffect(element, text, speed, container, button, terminalBody) {
        let i = 0;
        let displayText = '';
        const typeWriter = setInterval(() => {
            if (i < text.length) {
                if (soundEnabled) {
                    playTypeSound('quantum');
                }
                if (Math.random() < 0.1 && i > 1) {
                    const randomChar = String.fromCharCode(0x0400 + Math.floor(Math.random() * 0x04FF));
                    displayText = text.substring(0, i) + randomChar;
                    element.innerHTML = displayText;
                    element.classList.add('quantum-flicker');
                    setTimeout(() => {
                        element.innerHTML = text.substring(0, i);
                        element.classList.remove('quantum-flicker');
                    }, 50);
                }
                displayText = text.substring(0, i + 1);
                element.innerHTML = displayText;
                i++;
                speed = Math.max(10, speed + (Math.random() * 10 - 5));
            } else {
                clearInterval(typeWriter);
                addAskAgainButton(container, button, terminalBody);
            }
        }, speed);
    }
    
    function networkTypingEffect(element, text, speed, container, button, terminalBody) {
        let i = 0;
        const typeWriter = setInterval(() => {
            if (i < text.length) {
                if (soundEnabled) {
                    playTypeSound('digital');
                }
                if (Math.random() < 0.2 && i + 3 < text.length) {
                    const cluster = text.substring(i, i + 3);
                    element.innerHTML += `<span class="network-cluster">${cluster}</span>`;
                    i += 3;
                } else {
                    element.innerHTML += text.charAt(i);
                    i++;
                }
                if (Math.random() < 0.05 && element.querySelectorAll('.network-line').length < 3) {
                    const networkLine = document.createElement('span');
                    networkLine.className = 'network-line';
                    networkLine.style.left = `${Math.random() * 100}%`;
                    networkLine.style.top = `${Math.random() * 100}%`;
                    networkLine.style.width = `${20 + Math.random() * 30}%`;
                    networkLine.style.transform = `rotate(${Math.random() * 360}deg)`;
                    element.appendChild(networkLine);
                    setTimeout(() => {
                        networkLine.remove();
                    }, 800);
                }
            } else {
                clearInterval(typeWriter);
                addAskAgainButton(container, button, terminalBody);
            }
        }, speed);
    }
    
    function metaphysicalTypingEffect(element, text, speed, container, button, terminalBody) {
        let i = 0;
        element.style.opacity = '0.7';
        const typeWriter = setInterval(() => {
            if (i < text.length) {
                if (soundEnabled) {
                    playTypeSound('ethereal');
                }
                if (text.charAt(i) === ' ' && Math.random() < 0.3) {
                    element.innerHTML += ' ';
                    i++;
                    clearInterval(typeWriter);
                    element.classList.add('metaphysical-blur');
                    setTimeout(() => {
                        element.classList.remove('metaphysical-blur');
                        const newInterval = setInterval(() => {
                            if (i < text.length) {
                                if (soundEnabled) {
                                    playTypeSound('ethereal');
                                }
                                element.innerHTML += text.charAt(i);
                                i++;
                            } else {
                                clearInterval(newInterval);
                                element.style.opacity = '1';
                                addAskAgainButton(container, button, terminalBody);
                            }
                        }, speed);
                    }, 300);
                } else {
                    element.innerHTML += text.charAt(i);
                    i++;
                }
            } else {
                clearInterval(typeWriter);
                element.style.opacity = '1';
                addAskAgainButton(container, button, terminalBody);
            }
        }, speed);
    }
    
    function systemsTypingEffect(element, text, speed, container, button, terminalBody) {
        let i = 0;
        let bufferedText = '';
        const typeWriter = setInterval(() => {
            if (i < text.length) {
                if (soundEnabled && i % 3 === 0) {
                    playTypeSound('mechanical');
                }
                bufferedText += text.charAt(i);
                if (text.charAt(i) === '.' || text.charAt(i) === ',' || text.charAt(i) === ' ' || i === text.length - 1) {
                    if (text.charAt(i) === '.') {
                        element.innerHTML = bufferedText;
                        element.classList.add('systems-processing');
                        setTimeout(() => {
                            element.classList.remove('systems-processing');
                        }, 100);
                    } else {
                        element.innerHTML = bufferedText;
                    }
                }
                i++;
            } else {
                clearInterval(typeWriter);
                addAskAgainButton(container, button, terminalBody);
            }
        }, speed);
    }
    
    function addAskAgainButton(container, button, terminalBody) {
        const askAgainLine = document.createElement('div');
        askAgainLine.className = 'terminal-input-line';
        
        const inputPrefix = document.createElement('span');
        inputPrefix.className = 'terminal-prefix';
        inputPrefix.textContent = 'user> ';
        askAgainLine.appendChild(inputPrefix);
        
        const askAgainBtn = document.createElement('button');
        askAgainBtn.className = 'ask-again-btn ripple-effect';
        askAgainBtn.textContent = 'Спросить снова';
        askAgainLine.appendChild(askAgainBtn);
        
        terminalBody.appendChild(askAgainLine);
        
        askAgainBtn.addEventListener('mouseenter', function() {
            this.classList.add('terminal-hover');
            if (soundEnabled) {
                playTypeSound('digital');
            }
        });
        askAgainBtn.addEventListener('mouseleave', function() {
            this.classList.remove('terminal-hover');
        });
        
        askAgainBtn.addEventListener('click', function(event) {
            createRippleEffect(this, event);
            const questionIndex = parseInt(button.getAttribute('data-question-index'));
            container.classList.remove('terminal-glow');
            terminalBody.innerHTML = '';
            generateTypedAnswer(container, terminalBody, button, questionIndex);
        });
    }
    
    // Добавление основных стилей для элементов оракула
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Основные стили оракула */
        .oracle-container {
            margin-top: 15px;
            perspective: 1000px;
            transform-style: preserve-3d;
        }
        
        .ask-oracle-btn, .ask-again-btn {
            position: relative;
            overflow: hidden;
            background-color: #0D1117;
            color: #FFD700;
            border: 1px solid #30363D;
            padding: 10px 20px;
            font-family: 'VT323', monospace;
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
            box-shadow: 0 0 0 rgba(255, 215, 0, 0.3);
        }
        
        .terminal-prefix {
            color: #50C878;
            margin-right: 8px;
        }
        
        .terminal-hover {
            transform: translateY(-2px) translateZ(10px);
            box-shadow: 0 5px 20px rgba(255, 215, 0, 0.2);
            border-color: #FFD700;
        }
        
        .ask-oracle-btn:hover, .ask-again-btn:hover {
            background-color: #1D232A;
            box-shadow: 0 5px 20px rgba(255, 215, 0, 0.2);
            transform: translateY(-2px) translateZ(10px);
            border-color: #FFD700;
        }
        
        .ripple-effect {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .terminal-window {
            background-color: #0D1117;
            color: #F0F0F0;
            font-family: 'VT323', monospace;
            font-size: 1.5rem;
            border: 1px solid #30363D;
            border-radius: 8px;
            box-shadow: 0 5px 30px rgba(0, 0, 0, 0.5);
            margin-top: 20px;
            overflow: hidden;
            position: relative;
            opacity: 0;
            transform: translateY(20px) perspective(500px) rotateX(5deg);
            transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
            --glow-color: 255, 215, 0;
            --glow-intensity: 0;
        }
        
        .terminal-appear {
            opacity: 1;
            transform: translateY(0) perspective(500px) rotateX(0);
        }
        
        .terminal-glow {
            box-shadow: 0 0 15px rgba(var(--glow-color), var(--glow-intensity)), 0 0 30px rgba(var(--glow-color), calc(var(--glow-intensity) * 0.6));
        }
        
        .terminal-header {
            background-color: #161B22;
            padding: 8px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #30363D;
        }
        
        .terminal-dots {
            display: flex;
            gap: 6px;
        }
        
        .terminal-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }
        
        .terminal-dot-red {
            background-color: #FF5F56;
        }
        
        .terminal-dot-yellow {
            background-color: #FFBD2E;
        }
        
        .terminal-dot-green {
            background-color: #27C93F;
        }
        
        .terminal-title {
            color: #768390;
            font-size: 1.2rem;
        }
        
        .terminal-actions {
            display: flex;
            gap: 8px;
        }
        
        .terminal-actions button {
            background: transparent;
            border: none;
            color: #768390;
            cursor: pointer;
            font-size: 1.2rem;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: all 0.2s ease;
        }
        
        .terminal-actions button:hover,
        .button-hover {
            background-color: #30363D;
            color: #FFD700;
        }
        
        .terminal-body {
            padding: 15px;
            min-height: 100px;
            line-height: 1.6;
        }
        
        .terminal-output {
            margin-bottom: 15px;
        }
        
        .terminal-input-line {
            display: flex;
            align-items: center;
            margin-top: 15px;
        }
        
        .oracle-notification {
            position: absolute;
            top: 15px;
            right: 15px;
            padding: 10px 15px;
            background-color: #161B22;
            border: 1px solid #30363D;
            border-radius: 4px;
            color: #FFD700;
            font-family: 'VT323', monospace;
            font-size: 1.2rem;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            z-index: 10;
        }
        
        .notification-show {
            opacity: 1;
            transform: translateY(0);
        }
        
        .notification-hide {
            opacity: 0;
            transform: translateY(-10px);
        }
        
        .thinking-animation {
            display: flex;
            align-items: center;
            color: rgb(var(--glow-color));
        }
        
        .thinking-text {
            margin-right: 10px;
        }
        
        .thinking-symbols {
            font-family: monospace;
            display: inline-block;
            min-width: 50px;
        }
        
        .terminal-body-quantum {
            border-left: 3px solid #00BFFF;
        }
        
        .terminal-body-network {
            border-left: 3px solid #50C878;
        }
        
        .terminal-body-metaphysical {
            border-left: 3px solid #9370DB;
        }
        
        .terminal-body-systems {
            border-left: 3px solid #FF4500;
        }
        
        .quantum-flicker {
            animation: quantum-flicker 0.3s ease;
            position: relative;
        }
        
        .network-cluster {
            color: #50C878;
            position: relative;
            text-shadow: 0 0 5px rgba(80, 200, 120, 0.5);
        }
        
        .network-line {
            position: absolute;
            height: 1px;
            background: linear-gradient(90deg, transparent, #50C878, transparent);
            opacity: 0.5;
            animation: network-line 0.8s ease-out;
        }
        
        .metaphysical-blur {
            filter: blur(3px);
            opacity: 0.5;
            transition: all 0.3s ease;
        }
        
        .systems-processing {
            position: relative;
            animation: systems-process 0.2s linear;
        }
        
        .ask-again-btn {
            background: transparent;
            color: #FFD700;
            border: 1px solid #30363D;
            padding: 5px 15px;
            font-size: 1.3rem;
            margin-left: 5px;
        }
        
        @keyframes quantum-flicker {
            0%, 100% { opacity: 1; }
            33% { opacity: 0.7; text-shadow: 2px 0 #00BFFF; }
            66% { opacity: 0.9; text-shadow: -2px 0 #00BFFF; }
        }
        
        @keyframes network-line {
            from { opacity: 0.8; transform: scaleX(0); }
            to { opacity: 0; transform: scaleX(1); }
        }
        
        @keyframes systems-process {
            0% { background-color: rgba(255, 69, 0, 0.1); }
            50% { background-color: rgba(255, 69, 0, 0.2); }
            100% { background-color: transparent; }
        }
        
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(styleElement);
});
 
// Функция создания стилизованного навбара для Оракула
function createStylizedNavbar() {
    const oldNavbar = document.querySelector('.global-control-bar');
    if (oldNavbar) {
        oldNavbar.remove();
    }
    
    const navbar = document.createElement('nav');
    navbar.className = 'oracle-navbar';
    navbar.innerHTML = `
        <a href="#" class="oracle-nav-link sound-toggle">
            <span class="animate_letters">[звук]</span>
        </a>
        <a href="#" class="oracle-nav-link reset-btn">
            <span class="animate_letters">[сбросить ответы]</span>
        </a>
        <div class="oracle-status">
            <span class="animate_letters">сохранено: <span id="responses-count">0</span></span>
        </div>
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Стили для навбара в стиле основного сайта */
        .oracle-navbar {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            margin: 0.5rem auto;
            padding: 0.5rem;
            background: transparent;
            border-radius: 8px;
            overflow: hidden;
            max-width: 800px;
        }

        .oracle-nav-link {
            position: relative;
            margin: 0 0.5rem;
            text-decoration: none;
            font-size: 1.5rem;
            color: #FFD700;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-weight: 400;
            letter-spacing: 1px;
            overflow: hidden;
            font-family: 'VT323', monospace;
        }

        .oracle-nav-link:hover {
            background-color: rgba(255, 215, 0, 0.1);
            transform: translateY(-2px);
            text-shadow: 0 0 8px #FFD700;
        }

        .oracle-status {
            font-size: 1.5rem;
            color: rgba(255, 255, 255, 0.7);
            font-family: 'VT323', monospace;
            display: flex;
            align-items: center;
            margin: 0 0.5rem;
        }

        .oracle-navbar .animate_letters {
            position: relative;
            display: inline-block;
        }

        @media (max-width: 768px) {
            .oracle-navbar {
                flex-direction: column;
                align-items: center;
            }
            
            .oracle-nav-link, .oracle-status {
                margin: 0.25rem 0;
            }
        }
    `;
    document.head.appendChild(styleElement);
    
    const container = document.querySelector('.article-container');
    if (container) {
        container.parentNode.insertBefore(navbar, container);
    } else {
        document.body.prepend(navbar);
    }
    
    try {
        const savedResponses = JSON.parse(localStorage.getItem('oracleResponses') || '{}');
        const responseCount = Object.keys(savedResponses).length;
        document.getElementById('responses-count').textContent = responseCount;
    } catch (e) {
        console.warn('Failed to load responses count:', e);
    }
    
    const soundToggle = document.querySelector('.sound-toggle');
    if (soundToggle) {
        // Получаем текущее состояние звука
        const currentState = localStorage.getItem('oracleSoundEnabled') !== 'false';
        soundToggle.querySelector('.animate_letters').innerHTML = currentState ? '[звук: вкл]' : '[звук: выкл]';
        soundToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const currentState = localStorage.getItem('oracleSoundEnabled') !== 'false';
            const newState = !currentState;
            localStorage.setItem('oracleSoundEnabled', newState);
            this.querySelector('.animate_letters').innerHTML = newState ? '[звук: вкл]' : '[звук: выкл]';
            // Обновляем глобальное состояние звука и переменную soundEnabled
            window.oracleSoundEnabled = newState;
            soundEnabled = newState;
            if (newState && typeof initAudio === 'function') {
                initAudio();
                if (typeof playTypeSound === 'function') {
                    playTypeSound('mechanical');
                }
            }
        });
    }
    
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Вы действительно хотите удалить все сохранённые ответы Оракула?')) {
                localStorage.removeItem('oracleResponses');
                document.getElementById('responses-count').textContent = '0';
                document.querySelectorAll('.oracle-answer').forEach(el => {
                    el.style.display = 'none';
                });
                document.querySelectorAll('.ask-oracle-btn').forEach(el => {
                    el.style.display = 'inline-block';
                });
            }
        });
    }
}
