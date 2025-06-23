// Enhanced Audio Module with Download Functionality
class EnhancedAudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.audioBlob = null;
        this.audioUrl = null;
        this.currentFormType = '';
        this.recordingStartTime = null;
        this.recordingTimer = null;
        
        this.init();
    }

    async init() {
        try {
            console.log('🎤 Inicializando sistema de áudio melhorado...');
            
            // Verificar suporte do navegador
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Gravação de áudio não suportada neste navegador');
            }
            
            console.log('✅ Sistema de áudio inicializado');
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar áudio:', error);
            return false;
        }
    }

    // Iniciar gravação
    async startRecording(formType) {
        try {
            this.currentFormType = formType;
            
            // Solicitar permissão para microfone
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            // Configurar MediaRecorder
            const options = {
                mimeType: this.getSupportedMimeType()
            };
            
            this.mediaRecorder = new MediaRecorder(stream, options);
            this.audioChunks = [];
            
            // Event listeners
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.processRecording();
            };
            
            // Iniciar gravação
            this.mediaRecorder.start(1000); // Capturar dados a cada 1 segundo
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            
            // Atualizar UI
            this.updateRecordingUI(formType, 'recording');
            this.startTimer(formType);
            
            console.log('🎤 Gravação iniciada');
            
        } catch (error) {
            console.error('❌ Erro ao iniciar gravação:', error);
            this.showError('Erro ao acessar microfone. Verifique as permissões.');
        }
    }

    // Parar gravação
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Parar todas as tracks do stream
            if (this.mediaRecorder.stream) {
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
            
            this.stopTimer();
            console.log('⏹️ Gravação parada');
        }
    }

    // Processar gravação finalizada
    processRecording() {
        try {
            // Criar blob do áudio
            this.audioBlob = new Blob(this.audioChunks, { 
                type: this.getSupportedMimeType() 
            });
            
            // Criar URL para reprodução
            this.audioUrl = URL.createObjectURL(this.audioBlob);
            
            // Atualizar UI com controles de reprodução e download
            this.updateRecordingUI(this.currentFormType, 'completed');
            
            // Mostrar player de áudio
            this.showAudioPlayer();
            
            // Mostrar botão de download
            this.showDownloadButton();
            
            console.log('✅ Gravação processada com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao processar gravação:', error);
            this.showError('Erro ao processar gravação');
        }
    }

    // Obter tipo MIME suportado
    getSupportedMimeType() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/mpeg',
            'audio/wav'
        ];
        
        for (let type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        
        return 'audio/webm'; // fallback
    }

    // Atualizar interface durante gravação
    updateRecordingUI(formType, status) {
        const recordBtn = document.getElementById(`${formType}-record-btn`);
        const statusDiv = document.getElementById(`${formType}-audio-status`);
        
        if (!recordBtn || !statusDiv) return;
        
        switch (status) {
            case 'recording':
                recordBtn.innerHTML = `
                    <span class="record-icon recording">⏹️</span>
                    <span class="record-text">Parar Gravação</span>
                `;
                recordBtn.classList.add('recording');
                recordBtn.onclick = () => this.stopRecording();
                
                statusDiv.innerHTML = `
                    <div class="recording-indicator">
                        <span class="recording-dot"></span>
                        <span class="recording-time" id="${formType}-recording-time">00:00</span>
                        <span class="recording-text">Gravando...</span>
                    </div>
                `;
                statusDiv.style.display = 'block';
                break;
                
            case 'completed':
                recordBtn.innerHTML = `
                    <span class="record-icon">🎤</span>
                    <span class="record-text">Gravar Novamente</span>
                `;
                recordBtn.classList.remove('recording');
                recordBtn.onclick = () => this.startRecording(formType);
                
                const duration = this.getRecordingDuration();
                statusDiv.innerHTML = `
                    <div class="recording-completed">
                        <span class="completed-icon">✅</span>
                        <span class="completed-text">Gravação concluída (${duration})</span>
                    </div>
                `;
                break;
                
            default:
                recordBtn.innerHTML = `
                    <span class="record-icon">🎤</span>
                    <span class="record-text">Gravar Observações</span>
                `;
                recordBtn.classList.remove('recording');
                recordBtn.onclick = () => this.startRecording(formType);
                statusDiv.style.display = 'none';
        }
    }

    // Iniciar timer de gravação
    startTimer(formType) {
        const timerElement = document.getElementById(`${formType}-recording-time`);
        if (!timerElement) return;
        
        this.recordingTimer = setInterval(() => {
            const elapsed = Date.now() - this.recordingStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // Parar timer
    stopTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    // Obter duração da gravação
    getRecordingDuration() {
        if (!this.recordingStartTime) return '00:00';
        
        const duration = Date.now() - this.recordingStartTime;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Mostrar player de áudio
    showAudioPlayer() {
        const playbackContainer = document.getElementById(`${this.currentFormType}-audio-playback-container`);
        if (!playbackContainer) return;
        
        playbackContainer.innerHTML = `
            <div class="audio-playback">
                <h4>🎧 Reproduzir Gravação:</h4>
                <audio controls class="audio-player">
                    <source src="${this.audioUrl}" type="${this.getSupportedMimeType()}">
                    Seu navegador não suporta reprodução de áudio.
                </audio>
            </div>
        `;
        
        playbackContainer.style.display = 'block';
    }

    // Mostrar botão de download
    showDownloadButton() {
        const playbackContainer = document.getElementById(`${this.currentFormType}-audio-playback-container`);
        if (!playbackContainer) return;
        
        // Adicionar botão de download ao container
        const downloadSection = document.createElement('div');
        downloadSection.className = 'audio-download-section';
        downloadSection.innerHTML = `
            <h4>💾 Baixar Áudio:</h4>
            <div class="download-buttons">
                <button class="btn btn-download" onclick="audioRecorder.downloadAudio()">
                    <span class="download-icon">⬇️</span>
                    <span class="download-text">Baixar Áudio (.wav)</span>
                </button>
                <button class="btn btn-secondary" onclick="audioRecorder.shareAudio()">
                    <span class="share-icon">📱</span>
                    <span class="share-text">Compartilhar</span>
                </button>
            </div>
        `;
        
        playbackContainer.appendChild(downloadSection);
    }

    // Download do áudio
    downloadAudio() {
        if (!this.audioBlob) {
            this.showError('Nenhuma gravação disponível para download');
            return;
        }
        
        try {
            // Gerar nome do arquivo
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
            const fileName = `audio-observacoes-${this.currentFormType}-${timestamp}.wav`;
            
            // Criar link de download
            const downloadLink = document.createElement('a');
            downloadLink.href = this.audioUrl;
            downloadLink.download = fileName;
            
            // Simular clique para iniciar download
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            this.showSuccess(`Áudio baixado: ${fileName}`);
            
            console.log('📥 Áudio baixado:', fileName);
            
        } catch (error) {
            console.error('❌ Erro ao baixar áudio:', error);
            this.showError('Erro ao baixar áudio');
        }
    }

    // Compartilhar áudio
    shareAudio() {
        if (!this.audioBlob) {
            this.showError('Nenhuma gravação disponível para compartilhar');
            return;
        }
        
        try {
            // Verificar se o navegador suporta Web Share API
            if (navigator.share && navigator.canShare) {
                const file = new File([this.audioBlob], `audio-${this.currentFormType}.wav`, {
                    type: this.audioBlob.type
                });
                
                if (navigator.canShare({ files: [file] })) {
                    navigator.share({
                        title: 'Áudio de Observações',
                        text: `Gravação de observações para ${this.currentFormType}`,
                        files: [file]
                    });
                    return;
                }
            }
            
            // Fallback: copiar instruções para compartilhamento manual
            const instructions = `
Para compartilhar este áudio:
1. Baixe o arquivo usando o botão "Baixar Áudio"
2. Abra o WhatsApp no seu celular
3. Selecione o contato ou grupo
4. Toque no ícone de anexo (📎)
5. Escolha "Documento" ou "Áudio"
6. Selecione o arquivo baixado
7. Envie!
            `.trim();
            
            this.copyToClipboard(instructions);
            this.showSuccess('Instruções de compartilhamento copiadas!');
            
        } catch (error) {
            console.error('❌ Erro ao compartilhar áudio:', error);
            this.showError('Erro ao compartilhar áudio');
        }
    }

    // Transcrever áudio (simulado - para integração futura com APIs)
    async transcribeAudio() {
        if (!this.audioBlob) {
            this.showError('Nenhuma gravação disponível para transcrição');
            return;
        }
        
        try {
            // Mostrar loading
            this.showTranscriptionLoading();
            
            // Simular transcrição (em implementação real, usar API de transcrição)
            await this.simulateTranscription();
            
        } catch (error) {
            console.error('❌ Erro na transcrição:', error);
            this.showError('Erro ao transcrever áudio');
        }
    }

    // Simular transcrição (placeholder)
    async simulateTranscription() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const transcriptionResult = document.getElementById(`${this.currentFormType}-transcription-result`);
                if (transcriptionResult) {
                    transcriptionResult.innerHTML = `
                        <div class="transcription-content">
                            <h4>📝 Transcrição (Simulada):</h4>
                            <p class="transcription-text">
                                Esta é uma transcrição simulada do áudio gravado. 
                                Em uma implementação real, aqui apareceria o texto 
                                transcrito automaticamente usando APIs de IA.
                            </p>
                            <button class="btn btn-primary" onclick="audioRecorder.useTranscription()">
                                ✨ Usar esta Transcrição
                            </button>
                        </div>
                    `;
                    transcriptionResult.style.display = 'block';
                }
                resolve();
            }, 2000);
        });
    }

    // Mostrar loading de transcrição
    showTranscriptionLoading() {
        const transcriptionResult = document.getElementById(`${this.currentFormType}-transcription-result`);
        if (transcriptionResult) {
            transcriptionResult.innerHTML = `
                <div class="transcription-loading">
                    <div class="loading-spinner"></div>
                    <p>Transcrevendo áudio... Aguarde...</p>
                </div>
            `;
            transcriptionResult.style.display = 'block';
        }
    }

    // Usar transcrição no formulário
    useTranscription() {
        const transcriptionText = document.querySelector(`#${this.currentFormType}-transcription-result .transcription-text`);
        const observacoesField = document.getElementById(`${this.currentFormType}-observacoes`);
        
        if (transcriptionText && observacoesField) {
            observacoesField.value = transcriptionText.textContent.trim();
            this.showSuccess('Transcrição adicionada ao campo de observações!');
        }
    }

    // Copiar para área de transferência
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    // Mostrar mensagens
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Criar notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-text">${message}</span>
        `;
        
        // Adicionar ao container de notificações
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        // Log no console
        console.log(`${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${message}`);
    }

    // Limpar gravação atual
    clearRecording() {
        if (this.audioUrl) {
            URL.revokeObjectURL(this.audioUrl);
        }
        
        this.audioBlob = null;
        this.audioUrl = null;
        this.audioChunks = [];
        this.currentFormType = '';
        this.recordingStartTime = null;
        
        this.stopTimer();
    }

    // Verificar se há gravação ativa
    hasActiveRecording() {
        return this.audioBlob !== null;
    }

    // Obter dados da gravação para backup
    getRecordingData() {
        if (!this.audioBlob) return null;
        
        return {
            blob: this.audioBlob,
            url: this.audioUrl,
            type: this.getSupportedMimeType(),
            duration: this.getRecordingDuration(),
            formType: this.currentFormType,
            timestamp: new Date().toISOString()
        };
    }
}

// Instância global do gravador de áudio
const audioRecorder = new EnhancedAudioRecorder();

// Funções globais para uso no HTML
function startRecording(formType) {
    audioRecorder.startRecording(formType);
}

function stopRecording() {
    audioRecorder.stopRecording();
}

function downloadAudio() {
    audioRecorder.downloadAudio();
}

function shareAudio() {
    audioRecorder.shareAudio();
}

function transcribeAudio() {
    audioRecorder.transcribeAudio();
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎤 Sistema de áudio melhorado carregado');
    
    // Configurar botões de gravação em todos os formulários
    const recordButtons = document.querySelectorAll('[id$="-record-btn"]');
    recordButtons.forEach(button => {
        const formType = button.id.replace('-record-btn', '');
        button.addEventListener('click', () => {
            if (audioRecorder.isRecording) {
                audioRecorder.stopRecording();
            } else {
                audioRecorder.startRecording(formType);
            }
        });
    });
});

