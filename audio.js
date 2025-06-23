// Audio Recording Module
class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.stream = null;
        this.currentFormType = null;
    }

    async init() {
        try {
            // Solicitar permissão para usar o microfone
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            return true;
        } catch (error) {
            console.error('Erro ao acessar microfone:', error);
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
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.processRecording();
            };

            this.mediaRecorder.start(1000); // Coleta dados a cada segundo
            this.isRecording = true;
            this.updateUI();

        } catch (error) {
            console.error('Erro ao iniciar gravação:', error);
            this.showError('Erro ao iniciar gravação. Tente novamente.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.updateUI();
        }
    }

    processRecording() {
        if (this.audioChunks.length === 0) {
            this.showError('Nenhum áudio foi gravado.');
            return;
        }

        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Mostrar player de áudio
        const playback = document.getElementById(`${this.currentFormType}-audio-playback`);
        if (playback) {
            playback.src = audioUrl;
            playback.style.display = 'block';
        }

        // Simular transcrição (em uma implementação real, você enviaria para um serviço de transcrição)
        this.simulateTranscription(audioBlob);
    }

    async simulateTranscription(audioBlob) {
        const statusElement = document.getElementById(`${this.currentFormType}-audio-status`);
        if (statusElement) {
            statusElement.textContent = 'Processando áudio...';
            statusElement.className = 'audio-status processing';
        }

        // Simular processamento
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Texto de exemplo baseado no tipo de formulário
        let transcriptionText = '';
        
        switch (this.currentFormType) {
            case 'pad':
                transcriptionText = 'A criança demonstra necessidades específicas de atenção e estratégias diferenciadas para o desenvolvimento adequado das atividades pedagógicas.';
                break;
            case 'relatorio':
                transcriptionText = 'Durante o período observado, a criança apresentou bom desenvolvimento nas atividades propostas, demonstrando interesse e participação ativa.';
                break;
            case 'ata':
                transcriptionText = 'Foram discutidos os pontos principais da pauta, com participação ativa de todos os membros presentes na reunião.';
                break;
            default:
                transcriptionText = 'Áudio processado com sucesso.';
        }

        // Inserir texto no campo de observações
        const observacoesField = document.getElementById(`${this.currentFormType}-observacoes`) || 
                                document.querySelector(`#${this.currentFormType}Form textarea[name="observacoes"]`);
        
        if (observacoesField) {
            observacoesField.value = transcriptionText;
            observacoesField.focus();
        }

        if (statusElement) {
            statusElement.textContent = 'Áudio processado! Texto adicionado ao formulário.';
            statusElement.className = 'audio-status success';
        }

        // Limpar status após alguns segundos
        setTimeout(() => {
            if (statusElement) {
                statusElement.textContent = '';
                statusElement.className = 'audio-status';
            }
        }, 3000);
    }

    updateUI() {
        const button = document.getElementById(`${this.currentFormType}-record-btn`);
        const status = document.getElementById(`${this.currentFormType}-audio-status`);
        
        if (!button || !status) return;

        if (this.isRecording) {
            button.classList.add('recording');
            button.innerHTML = `
                <span class="record-icon">⏹️</span>
                <span class="record-text">Parar Gravação</span>
            `;
            status.textContent = 'Gravando... Clique novamente para parar.';
            status.className = 'audio-status recording';
        } else {
            button.classList.remove('recording');
            button.innerHTML = `
                <span class="record-icon">🎤</span>
                <span class="record-text">Clique para gravar</span>
            `;
            status.textContent = '';
            status.className = 'audio-status';
        }
    }

    showError(message) {
        const status = document.getElementById(`${this.currentFormType}-audio-status`);
        if (status) {
            status.textContent = message;
            status.className = 'audio-status error';
            status.style.color = '#e53e3e';
            
            setTimeout(() => {
                status.textContent = '';
                status.className = 'audio-status';
                status.style.color = '';
            }, 5000);
        } else {
            alert(message);
        }
    }

    cleanup() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
    }
}

// Instância global do gravador
const audioRecorder = new AudioRecorder();

// Função para inicializar gravação
function initializeAudioRecording() {
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

// Verificar suporte do navegador
function checkAudioSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('Gravação de áudio não suportada neste navegador');
        
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
    if (checkAudioSupport()) {
        initializeAudioRecording();
    }
});

// Limpeza quando a página for fechada
window.addEventListener('beforeunload', () => {
    audioRecorder.cleanup();
});

