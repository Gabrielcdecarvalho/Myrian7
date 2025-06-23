// Main Application Module
class PortalMyrianApp {
    constructor() {
        this.version = '1.0.0';
        this.initialized = false;
        this.features = {
            audio: false,
            email: false,
            forms: false
        };
    }

    // Inicializar aplicação
    async init() {
        try {
            console.log('🚀 Iniciando Portal da Myrian v' + this.version);
            
            // Verificar suporte do navegador
            this.checkBrowserSupport();
            
            // Inicializar módulos
            await this.initializeModules();
            
            // Configurar eventos globais
            this.setupGlobalEvents();
            
            // Configurar PWA (Progressive Web App)
            this.setupPWA();
            
            // Mostrar tela inicial
            this.showWelcomeMessage();
            
            this.initialized = true;
            console.log('✅ Portal da Myrian inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar aplicação:', error);
            this.showErrorMessage('Erro ao carregar aplicação. Recarregue a página.');
        }
    }

    // Verificar suporte do navegador
    checkBrowserSupport() {
        const features = {
            localStorage: typeof Storage !== 'undefined',
            mediaDevices: navigator.mediaDevices && navigator.mediaDevices.getUserMedia,
            clipboard: navigator.clipboard && navigator.clipboard.writeText,
            fetch: typeof fetch !== 'undefined'
        };

        // Log de recursos disponíveis
        console.log('🔍 Recursos do navegador:', features);

        // Avisos para recursos não suportados
        if (!features.localStorage) {
            console.warn('⚠️ LocalStorage não suportado - dados não serão salvos');
        }
        
        if (!features.mediaDevices) {
            console.warn('⚠️ Gravação de áudio não suportada');
            this.hideAudioFeatures();
        }
        
        if (!features.clipboard) {
            console.warn('⚠️ API de clipboard não suportada - usando fallback');
        }
    }

    // Inicializar módulos
    async initializeModules() {
        // Inicializar formulários
        if (typeof formsManager !== 'undefined') {
            this.features.forms = true;
            console.log('✅ Módulo de formulários carregado');
        }

        // Inicializar áudio
        if (typeof audioRecorder !== 'undefined') {
            this.features.audio = true;
            console.log('✅ Módulo de áudio carregado');
        }

        // Inicializar email
        if (typeof emailManager !== 'undefined') {
            await emailManager.init();
            this.features.email = true;
            console.log('✅ Módulo de email carregado');
        }
    }

    // Configurar eventos globais
    setupGlobalEvents() {
        // Prevenir perda de dados ao sair
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedData()) {
                e.preventDefault();
                e.returnValue = 'Você tem dados não salvos. Deseja realmente sair?';
            }
        });

        // Detectar mudanças de conectividade
        window.addEventListener('online', () => {
            this.showNotification('✅ Conexão restaurada', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('⚠️ Sem conexão com a internet', 'warning');
        });

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Cliques em links externos
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.href.startsWith('http')) {
                e.target.target = '_blank';
                e.target.rel = 'noopener noreferrer';
            }
        });
    }

    // Configurar PWA
    setupPWA() {
        // Registrar Service Worker (se disponível)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('✅ Service Worker registrado'))
                .catch(() => console.log('ℹ️ Service Worker não disponível'));
        }

        // Prompt de instalação
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.showInstallPrompt(e);
        });
    }

    // Mostrar mensagem de boas-vindas
    showWelcomeMessage() {
        // Verificar se é a primeira visita
        const isFirstVisit = !localStorage.getItem('portal-myrian-visited');
        
        if (isFirstVisit) {
            setTimeout(() => {
                this.showNotification('👋 Bem-vinda ao Portal da Myrian!', 'info', 5000);
                localStorage.setItem('portal-myrian-visited', 'true');
            }, 1000);
        }
    }

    // Verificar dados não salvos
    hasUnsavedData() {
        const forms = document.querySelectorAll('form');
        for (let form of forms) {
            const formData = new FormData(form);
            for (let [key, value] of formData.entries()) {
                if (value.trim()) {
                    return true;
                }
            }
        }
        return false;
    }

    // Atalhos de teclado
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S: Salvar dados localmente
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveDataLocally();
        }

        // Ctrl/Cmd + H: Voltar ao início
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            showHome();
        }

        // Escape: Voltar/Cancelar
        if (e.key === 'Escape') {
            const activeSection = document.querySelector('.section.active');
            if (activeSection && activeSection.id !== 'home') {
                showHome();
            }
        }
    }

    // Salvar dados localmente
    saveDataLocally() {
        const forms = document.querySelectorAll('form');
        let savedCount = 0;

        forms.forEach(form => {
            const formData = new FormData(form);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                if (value.trim()) {
                    data[key] = value;
                    savedCount++;
                }
            }

            if (Object.keys(data).length > 0) {
                localStorage.setItem(`portal-myrian-backup-${form.id}`, JSON.stringify(data));
            }
        });

        if (savedCount > 0) {
            this.showNotification(`💾 ${savedCount} campos salvos localmente`, 'success');
        }
    }

    // Restaurar dados salvos
    restoreLocalData() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const savedData = localStorage.getItem(`portal-myrian-backup-${form.id}`);
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    Object.entries(data).forEach(([key, value]) => {
                        const field = form.querySelector(`[name="${key}"]`);
                        if (field && !field.value) {
                            field.value = value;
                        }
                    });
                } catch (error) {
                    console.warn('Erro ao restaurar dados:', error);
                }
            }
        });
    }

    // Ocultar recursos de áudio se não suportados
    hideAudioFeatures() {
        const audioSections = document.querySelectorAll('.audio-section');
        audioSections.forEach(section => {
            section.style.display = 'none';
        });
    }

    // Mostrar notificação
    showNotification(message, type = 'info', duration = 3000) {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos da notificação
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        // Cores por tipo
        const colors = {
            success: '#38a169',
            error: '#e53e3e',
            warning: '#ed8936',
            info: '#4c51bf'
        };
        notification.style.background = colors[type] || colors.info;

        // Adicionar ao DOM
        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover após duração
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Mostrar mensagem de erro
    showErrorMessage(message) {
        this.showNotification(message, 'error', 5000);
    }

    // Mostrar prompt de instalação PWA
    showInstallPrompt(e) {
        const installButton = document.createElement('button');
        installButton.textContent = '📱 Instalar App';
        installButton.className = 'btn btn-primary install-btn';
        installButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        installButton.addEventListener('click', () => {
            e.prompt();
            e.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('✅ App instalado');
                }
                installButton.remove();
            });
        });

        document.body.appendChild(installButton);

        // Remover botão após 10 segundos se não clicado
        setTimeout(() => {
            if (installButton.parentNode) {
                installButton.remove();
            }
        }, 10000);
    }

    // Métodos de utilidade
    formatDate(date) {
        return new Date(date).toLocaleDateString('pt-BR');
    }

    formatTime(date) {
        return new Date(date).toLocaleTimeString('pt-BR');
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Debug e estatísticas
    getStats() {
        return {
            version: this.version,
            initialized: this.initialized,
            features: this.features,
            localStorage: this.getLocalStorageStats(),
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    }

    getLocalStorageStats() {
        const keys = Object.keys(localStorage);
        const portalKeys = keys.filter(key => key.startsWith('portal-myrian'));
        
        return {
            totalKeys: keys.length,
            portalKeys: portalKeys.length,
            portalData: portalKeys.map(key => ({
                key,
                size: localStorage.getItem(key).length
            }))
        };
    }

    // Limpar dados da aplicação
    clearAppData() {
        const keys = Object.keys(localStorage);
        const portalKeys = keys.filter(key => key.startsWith('portal-myrian'));
        
        portalKeys.forEach(key => localStorage.removeItem(key));
        
        this.showNotification(`🗑️ ${portalKeys.length} itens removidos`, 'success');
    }
}

// Instância global da aplicação
const app = new PortalMyrianApp();

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Expor funções globais para debug (apenas em desenvolvimento)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.portalDebug = {
        app,
        stats: () => app.getStats(),
        clear: () => app.clearAppData(),
        notification: (msg, type) => app.showNotification(msg, type)
    };
    console.log('🔧 Modo debug ativo. Use window.portalDebug para ferramentas de desenvolvimento.');
}

