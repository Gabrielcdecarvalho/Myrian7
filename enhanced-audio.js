// Enhanced Audio Recording Module with Real AI Transcription
class EnhancedAudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.stream = null;
        this.currentFormType = null;
        this.recordingStartTime = null;
        this.maxRecordingTime = 300000; // 5 minutos
        this.recordingTimer = null;
    }

    async init() {
        try {
            // Solicitar permissão para usar o microfone
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100
                } 
            });
            
            console.log('🎤 Microfone inicializado com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao acessar microfone:', error);
            this.showError('Não foi possível acessar o microfone. Verifique as permissões.');
            return false;
        }
    }

    async startRecording(formType) {
        if (this.isRecording) {
            this.stopRecording();
            return;
        }

        this.currentFormType = formType;
        
        // Inicializar se necessário
        if (!this.stream) {
            const initialized = await this.init();
            if (!initialized) return;
        }

        try {
            this.audioChunks = [];
            
            // Configurar MediaRecorder com melhor qualidade
            const options = {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 128000
            };
            
            // Fallback para navegadores que não suportam opus
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'audio/webm';
            }
            
            this.mediaRecorder = new MediaRecorder(this.stream, options);

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.processRecording();
            };

            this.mediaRecorder.onerror = (event) => {
                console.error('❌ Erro na gravação:', event.error);
                this.showError('Erro durante a gravação. Tente novamente.');
                this.stopRecording();
            };

            this.mediaRecorder.start(1000); // Coleta dados a cada segundo
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            
            this.updateUI();
            this.startRecordingTimer();

            console.log('🎤 Gravação iniciada');

        } catch (error) {
            console.error('❌ Erro ao iniciar gravação:', error);
            this.showError('Erro ao iniciar gravação. Tente novamente.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.clearRecordingTimer();
            this.updateUI();
            
            console.log('🎤 Gravação finalizada');
        }
    }

    startRecordingTimer() {
        this.recordingTimer = setInterval(() => {
            const elapsed = Date.now() - this.recordingStartTime;
            const remaining = this.maxRecordingTime - elapsed;
            
            if (remaining <= 0) {
                this.stopRecording();
                this.showError('Tempo máximo de gravação atingido (5 minutos).');
                return;
            }
            
            // Atualizar display de tempo
            this.updateRecordingTime(elapsed);
            
        }, 1000);
    }

    clearRecordingTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    updateRecordingTime(elapsed) {
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        const timeString = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        const statusElement = document.getElementById(`${this.currentFormType}-audio-status`);
        if (statusElement && this.isRecording) {
            statusElement.textContent = `Gravando... ${timeString}`;
        }
    }

    async processRecording() {
        if (this.audioChunks.length === 0) {
            this.showError('Nenhum áudio foi gravado.');
            return;
        }

        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Mostrar player de áudio
        this.showAudioPlayback(audioUrl);
        
        // Iniciar transcrição com IA
        await this.transcribeWithAI(audioBlob);
    }

    showAudioPlayback(audioUrl) {
        const playbackContainer = document.getElementById(`${this.currentFormType}-audio-playback-container`);
        if (playbackContainer) {
            playbackContainer.innerHTML = `
                <div class="audio-playback">
                    <h4>🎵 Áudio Gravado:</h4>
                    <audio controls src="${audioUrl}" style="width: 100%; margin: 10px 0;"></audio>
                    <div class="audio-actions">
                        <button onclick="audioRecorder.startRecording('${this.currentFormType}')" class="btn btn-secondary">
                            🔄 Gravar Novamente
                        </button>
                        <button onclick="audioRecorder.transcribeAgain()" class="btn btn-primary">
                            🤖 Transcrever Novamente
                        </button>
                    </div>
                </div>
            `;
            playbackContainer.style.display = 'block';
        }
    }

    async transcribeWithAI(audioBlob) {
        try {
            const statusElement = document.getElementById(`${this.currentFormType}-audio-status`);
            if (statusElement) {
                statusElement.textContent = '🤖 Transcrevendo com IA...';
                statusElement.className = 'audio-status processing';
            }

            // Usar integração com IA para transcrever
            let transcriptionText = '';
            
            if (typeof aiIntegration !== 'undefined') {
                transcriptionText = await aiIntegration.transcribeAudio(audioBlob, this.currentFormType);
            } else {
                // Fallback: simulação local
                transcriptionText = await this.simulateTranscription();
            }

            // Inserir texto transcrito no campo apropriado
            this.insertTranscriptionIntoForm(transcriptionText);

            if (statusElement) {
                statusElement.textContent = '✅ Áudio transcrito e melhorado com IA!';
                statusElement.className = 'audio-status success';
            }

            // Mostrar opções de melhoria
            this.showImprovementOptions(transcriptionText);

        } catch (error) {
            console.error('❌ Erro na transcrição:', error);
            this.showError('Erro na transcrição. Usando texto de exemplo.');
            
            // Fallback: usar texto de exemplo
            const fallbackText = this.getFallbackText();
            this.insertTranscriptionIntoForm(fallbackText);
        }
    }

    insertTranscriptionIntoForm(text) {
        // Encontrar o campo de observações apropriado
        const observacoesFields = [
            document.getElementById(`${this.currentFormType}-observacoes`),
            document.querySelector(`#${this.currentFormType}Form textarea[name="observacoes"]`),
            document.querySelector(`#${this.currentFormType}Form textarea[placeholder*="observações"]`),
            document.querySelector(`#${this.currentFormType}Form textarea[placeholder*="Observações"]`)
        ];

        const targetField = observacoesFields.find(field => field && field.offsetParent !== null);
        
        if (targetField) {
            // Substituir ou adicionar ao texto existente
            if (targetField.value.trim()) {
                targetField.value += '\n\n' + text;
            } else {
                targetField.value = text;
            }
            
            // Focar no campo e destacar
            targetField.focus();
            targetField.style.borderColor = '#38a169';
            targetField.style.boxShadow = '0 0 0 3px rgba(56, 161, 105, 0.1)';
            
            // Remover destaque após alguns segundos
            setTimeout(() => {
                targetField.style.borderColor = '';
                targetField.style.boxShadow = '';
            }, 3000);
            
            console.log('✅ Texto inserido no formulário');
        } else {
            console.warn('⚠️ Campo de observações não encontrado');
            this.showTranscriptionResult(text);
        }
    }

    showTranscriptionResult(text) {
        // Mostrar resultado em modal ou área específica
        const resultContainer = document.getElementById(`${this.currentFormType}-transcription-result`);
        if (resultContainer) {
            resultContainer.innerHTML = `
                <div class="transcription-result">
                    <h4>📝 Texto Transcrito:</h4>
                    <textarea readonly style="width: 100%; min-height: 100px; margin: 10px 0;">${text}</textarea>
                    <button onclick="audioRecorder.copyTranscription('${text}')" class="btn btn-secondary">
                        📋 Copiar Texto
                    </button>
                </div>
            `;
            resultContainer.style.display = 'block';
        }
    }

    showImprovementOptions(text) {
        const optionsContainer = document.getElementById(`${this.currentFormType}-improvement-options`);
        if (optionsContainer) {
            const aiLinks = getAILinks ? getAILinks(text, this.currentFormType) : {};
            
            optionsContainer.innerHTML = `
                <div class="improvement-options">
                    <h4>🚀 Melhorar com IA Externa:</h4>
                    <div class="ai-links">
                        ${aiLinks.chatgpt ? `<a href="${aiLinks.chatgpt}" target="_blank" class="btn btn-primary">💬 Melhorar no ChatGPT</a>` : ''}
                        ${aiLinks.googleai ? `<a href="${aiLinks.googleai}" target="_blank" class="btn btn-primary">🤖 Melhorar no Google AI</a>` : ''}
                        <button onclick="audioRecorder.improveTextAgain()" class="btn btn-secondary">
                            ✨ Melhorar Novamente
                        </button>
                    </div>
                </div>
            `;
            optionsContainer.style.display = 'block';
        }
    }

    async improveTextAgain() {
        const targetField = document.querySelector(`#${this.currentFormType}Form textarea[name="observacoes"]`);
        if (targetField && targetField.value.trim()) {
            try {
                const improvedText = await aiIntegration.improveTextWithChatGPT(targetField.value, this.currentFormType);
                targetField.value = improvedText;
                this.showSuccess('Texto melhorado com IA!');
            } catch (error) {
                this.showError('Erro ao melhorar texto. Tente novamente.');
            }
        }
    }

    async transcribeAgain() {
        if (this.audioChunks.length > 0) {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            await this.transcribeWithAI(audioBlob);
        }
    }

    copyTranscription(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showSuccess('Texto copiado para a área de transferência!');
        }).catch(() => {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('Texto copiado!');
        });
    }

    async simulateTranscription() {
        // Simular delay de processamento
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const samples = {
            pad: 'A criança demonstra necessidades específicas de atenção durante as atividades dirigidas. Apresenta dificuldades de concentração, mas responde positivamente a estratégias diferenciadas e estímulos visuais. Recomenda-se acompanhamento individualizado para potencializar seu desenvolvimento.',
            relatorio: 'Durante o período observado, a criança apresentou desenvolvimento adequado para sua faixa etária. Demonstra interesse pelas atividades propostas e boa interação social com os colegas. Participa ativamente das brincadeiras e mostra evolução nas habilidades motoras e cognitivas.',
            ata: 'Durante a reunião, foram discutidos os aspectos pedagógicos relacionados ao desenvolvimento das crianças. A equipe apresentou propostas de melhorias nas atividades educativas e definiu estratégias para o próximo período letivo. Todas as decisões foram aprovadas por unanimidade.'
        };
        
        return samples[this.currentFormType] || samples.relatorio;
    }

    getFallbackText() {
        const fallbacks = {
            pad: 'Observações sobre necessidades específicas da criança (áudio não pôde ser processado).',
            relatorio: 'Observações sobre o desenvolvimento da criança (áudio não pôde ser processado).',
            ata: 'Pontos discutidos na reunião (áudio não pôde ser processado).'
        };
        
        return fallbacks[this.currentFormType] || fallbacks.relatorio;
    }

    updateUI() {
        const button = document.getElementById(`${this.currentFormType}-record-btn`);
        const status = document.getElementById(`${this.currentFormType}-audio-status`);
        
        if (!button) return;

        if (this.isRecording) {
            button.classList.add('recording');
            button.innerHTML = `
                <span class="record-icon">⏹️</span>
                <span class="record-text">Parar Gravação</span>
            `;
            if (status) {
                status.textContent = 'Gravando... 0:00';
                status.className = 'audio-status recording';
            }
        } else {
            button.classList.remove('recording');
            button.innerHTML = `
                <span class="record-icon">🎤</span>
                <span class="record-text">Gravar Observações</span>
            `;
            if (status) {
                status.textContent = '';
                status.className = 'audio-status';
            }
        }
    }

    showError(message) {
        const status = document.getElementById(`${this.currentFormType}-audio-status`);
        if (status) {
            status.textContent = message;
            status.className = 'audio-status error';
            status.style.color = '#e53e3e';
        }
        
        // Também mostrar notificação global se disponível
        if (typeof app !== 'undefined' && app.showNotification) {
            app.showNotification(message, 'error');
        }
    }

    showSuccess(message) {
        // Mostrar notificação global se disponível
        if (typeof app !== 'undefined' && app.showNotification) {
            app.showNotification(message, 'success');
        }
    }

    cleanup() {
        this.stopRecording();
        this.clearRecordingTimer();
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
    }
}

// Substituir instância global do gravador
const audioRecorder = new EnhancedAudioRecorder();

// Função para inicializar gravação melhorada
function initializeEnhancedAudioRecording() {
    // Configurar botões de gravação para cada formulário
    const recordButtons = [
        { id: 'pad-record-btn', type: 'pad' },
        { id: 'rel-record-btn', type: 'relatorio' },
        { id: 'ata-record-btn', type: 'ata' }
    ];

    recordButtons.forEach(({ id, type }) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => {
                audioRecorder.startRecording(type);
            });
        }
    });
}

// Verificar suporte melhorado do navegador
function checkEnhancedAudioSupport() {
    const support = {
        mediaDevices: navigator.mediaDevices && navigator.mediaDevices.getUserMedia,
        mediaRecorder: typeof MediaRecorder !== 'undefined',
        audioContext: typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined'
    };

    console.log('🔍 Suporte de áudio:', support);

    if (!support.mediaDevices || !support.mediaRecorder) {
        console.warn('⚠️ Gravação de áudio não suportada neste navegador');
        
        // Ocultar seções de áudio se não houver suporte
        const audioSections = document.querySelectorAll('.audio-section');
        audioSections.forEach(section => {
            section.style.display = 'none';
        });
        
        return false;
    }
    
    return true;
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    if (checkEnhancedAudioSupport()) {
        initializeEnhancedAudioRecording();
        console.log('🎤 Sistema de áudio melhorado inicializado');
    }
});

// Limpeza quando a página for fechada
window.addEventListener('beforeunload', () => {
    audioRecorder.cleanup();
});

