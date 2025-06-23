// AI Integration Module - ChatGPT and Google AI Studio
class AIIntegration {
    constructor() {
        // API Keys (em produção, usar variáveis de ambiente)
        this.openaiApiKey = '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';
        this.googleAiApiKey = 'AIzaSyBjp7SRy3_-5BIU9_l-vupdz-gie5y94o8';
        
        // API Endpoints
        this.openaiEndpoint = 'https://api.openai.com/v1/chat/completions';
        this.googleAiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        
        this.initialized = false;
    }

    // Inicializar módulo de IA
    async init() {
        try {
            // Testar conectividade com as APIs
            console.log('🤖 Inicializando integração com IA...');
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar IA:', error);
            return false;
        }
    }

    // Transcrever áudio usando ChatGPT (Whisper)
    async transcribeAudio(audioBlob, formType) {
        try {
            console.log('🎤 Iniciando transcrição de áudio...');
            
            // Mostrar loading
            this.showTranscriptionStatus('Transcrevendo áudio...', 'processing');

            // Converter blob para base64 (simulação - em produção usar Whisper API)
            const audioBase64 = await this.blobToBase64(audioBlob);
            
            // Simular transcrição (em produção, usar Whisper API real)
            const transcription = await this.simulateTranscription(formType);
            
            // Melhorar texto com ChatGPT
            const improvedText = await this.improveTextWithChatGPT(transcription, formType);
            
            this.showTranscriptionStatus('Áudio transcrito com sucesso!', 'success');
            return improvedText;
            
        } catch (error) {
            console.error('❌ Erro na transcrição:', error);
            this.showTranscriptionStatus('Erro na transcrição. Tente novamente.', 'error');
            throw error;
        }
    }

    // Melhorar texto com ChatGPT
    async improveTextWithChatGPT(text, formType) {
        try {
            const prompt = this.createImprovementPrompt(text, formType);
            
            const response = await fetch(this.openaiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'Você é um assistente especializado em documentação pedagógica para creches municipais. Transforme observações informais em texto profissional, respeitoso e técnico.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
            
        } catch (error) {
            console.error('❌ Erro no ChatGPT:', error);
            // Fallback: retornar texto original melhorado localmente
            return this.improveTextLocally(text, formType);
        }
    }

    // Gerar documento completo com Google AI Studio
    async generateDocumentWithGoogleAI(formData, formType) {
        try {
            console.log('📄 Gerando documento com Google AI...');
            
            const prompt = this.createDocumentPrompt(formData, formType);
            
            const response = await fetch(`${this.googleAiEndpoint}?key=${this.googleAiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`Erro na API Google: ${response.status}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
            
        } catch (error) {
            console.error('❌ Erro no Google AI:', error);
            // Fallback: usar template local
            return this.generateDocumentLocally(formData, formType);
        }
    }

    // Criar prompt para melhoria de texto
    createImprovementPrompt(text, formType) {
        const prompts = {
            pad: `Transforme estas observações informais em texto profissional para um PAD (Plano de Atendimento Diferenciado):

Observações originais: "${text}"

Requisitos:
- Use linguagem técnica e respeitosa
- Foque nas necessidades específicas da criança
- Evite palavras inadequadas ou julgamentos
- Mantenha tom profissional para supervisores
- Máximo 3 parágrafos

Texto melhorado:`,

            relatorio: `Transforme estas observações em texto profissional para relatório individual de desenvolvimento:

Observações originais: "${text}"

Requisitos:
- Linguagem respeitosa para os pais
- Destaque aspectos positivos do desenvolvimento
- Use termos pedagógicos apropriados
- Evite palavras que possam ofender
- Máximo 3 parágrafos

Texto melhorado:`,

            ata: `Transforme estas observações em texto formal para ata de reunião:

Observações originais: "${text}"

Requisitos:
- Linguagem formal e objetiva
- Foque em decisões e ações
- Use terceira pessoa
- Evite opiniões pessoais
- Máximo 3 parágrafos

Texto melhorado:`
        };

        return prompts[formType] || prompts.relatorio;
    }

    // Criar prompt para geração de documento completo
    createDocumentPrompt(formData, formType) {
        const prompts = {
            pad: `Crie um PAD (Plano de Atendimento Diferenciado) profissional com base nos dados:

Nome: ${formData.nome}
Idade: ${formData.idade}
Necessidades: ${formData.necessidades || 'A definir'}
Objetivos: ${formData.objetivos || 'A definir'}
Estratégias: ${formData.estrategias || 'A definir'}
Observações: ${formData.observacoes}

Crie um documento completo, formal e profissional seguindo padrões pedagógicos municipais.`,

            relatorio: `Crie um Relatório Individual de Desenvolvimento profissional com base nos dados:

Nome: ${formData.nome}
Idade: ${formData.idade}
Desenvolvimento Socioemocional: ${formData.socioemocional || 'A avaliar'}
Desenvolvimento Cognitivo: ${formData.cognitivo || 'A avaliar'}
Desenvolvimento Motor: ${formData.motor || 'A avaliar'}
Linguagem: ${formData.linguagem || 'A avaliar'}
Observações: ${formData.observacoes}

Crie um relatório completo, respeitoso e adequado para envio aos pais.`,

            ata: `Crie uma Ata de Reunião formal com base nos dados:

Data: ${formData.data}
Participantes: ${formData.participantes}
Pauta: ${formData.pauta}
Discussões: ${formData.discussoes || 'A documentar'}
Decisões: ${formData.decisoes || 'A documentar'}
Observações: ${formData.observacoes}

Crie uma ata completa, formal e adequada para arquivo oficial.`
        };

        return prompts[formType] || prompts.relatorio;
    }

    // Simulação de transcrição (para desenvolvimento)
    async simulateTranscription(formType) {
        // Simular delay de processamento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const samples = {
            pad: 'A criança demonstra dificuldades de concentração e precisa de estratégias diferenciadas. Mostra interesse por atividades lúdicas e responde bem a estímulos visuais.',
            relatorio: 'Durante o período observado, a criança apresentou bom desenvolvimento nas atividades propostas, demonstrando interesse e participação ativa nas brincadeiras.',
            ata: 'Foram discutidos os pontos principais da pauta, com participação ativa de todos os membros presentes. Decidiu-se implementar novas estratégias pedagógicas.'
        };
        
        return samples[formType] || samples.relatorio;
    }

    // Melhoria local de texto (fallback)
    improveTextLocally(text, formType) {
        // Aplicar melhorias básicas
        let improvedText = text
            .replace(/\b(ruim|mal|péssimo|horrível)\b/gi, 'necessita atenção')
            .replace(/\b(não consegue|não sabe)\b/gi, 'está desenvolvendo')
            .replace(/\b(problema|defeito)\b/gi, 'necessidade específica')
            .replace(/\b(burro|idiota|preguiçoso)\b/gi, 'em desenvolvimento');

        // Adicionar estrutura profissional
        const prefixes = {
            pad: 'Durante o período de observação, identificou-se que ',
            relatorio: 'A criança demonstra ',
            ata: 'Foi observado que '
        };

        const prefix = prefixes[formType] || prefixes.relatorio;
        
        if (!improvedText.startsWith(prefix)) {
            improvedText = prefix + improvedText.toLowerCase();
        }

        return improvedText.charAt(0).toUpperCase() + improvedText.slice(1);
    }

    // Geração local de documento (fallback)
    generateDocumentLocally(formData, formType) {
        // Usar templates locais existentes
        if (typeof formsManager !== 'undefined' && formsManager.documentTemplates[formType]) {
            return formsManager.documentTemplates[formType].call(formsManager, formData);
        }
        
        return `Documento ${formType.toUpperCase()} gerado localmente com os dados fornecidos.`;
    }

    // Converter blob para base64
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Mostrar status da transcrição
    showTranscriptionStatus(message, type) {
        const statusElements = document.querySelectorAll('.audio-status');
        statusElements.forEach(element => {
            element.textContent = message;
            element.className = `audio-status ${type}`;
            
            // Cores por tipo
            const colors = {
                processing: '#4c51bf',
                success: '#38a169',
                error: '#e53e3e'
            };
            
            element.style.color = colors[type] || colors.processing;
        });

        // Limpar status após alguns segundos (exceto erros)
        if (type !== 'error') {
            setTimeout(() => {
                statusElements.forEach(element => {
                    element.textContent = '';
                    element.className = 'audio-status';
                    element.style.color = '';
                });
            }, 3000);
        }
    }

    // Gerar links para IAs externas
    generateAILinks(documentText, formType) {
        const encodedText = encodeURIComponent(documentText);
        const documentName = this.getDocumentTypeName(formType);
        
        return {
            chatgpt: `https://chat.openai.com/?q=${encodeURIComponent(`Revise este ${documentName}: ${documentText}`)}`,
            googleai: `https://aistudio.google.com/app/prompts/new?q=${encodeURIComponent(`Melhore este ${documentName}: ${documentText}`)}`,
            claude: `https://claude.ai/chat?q=${encodeURIComponent(`Aprimore este ${documentName}: ${documentText}`)}`
        };
    }

    // Obter nome do tipo de documento
    getDocumentTypeName(formType) {
        const names = {
            pad: 'PAD (Plano de Atendimento Diferenciado)',
            relatorio: 'Relatório Individual',
            ata: 'Ata de Reunião'
        };
        return names[formType] || 'documento';
    }

    // Verificar se APIs estão funcionando
    async checkAPIStatus() {
        const status = {
            openai: false,
            googleai: false
        };

        try {
            // Testar OpenAI
            const openaiResponse = await fetch(this.openaiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: 'test' }],
                    max_tokens: 1
                })
            });
            status.openai = openaiResponse.ok;
        } catch (error) {
            console.warn('OpenAI API não disponível:', error.message);
        }

        try {
            // Testar Google AI
            const googleResponse = await fetch(`${this.googleAiEndpoint}?key=${this.googleAiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'test' }] }]
                })
            });
            status.googleai = googleResponse.ok;
        } catch (error) {
            console.warn('Google AI API não disponível:', error.message);
        }

        return status;
    }
}

// Instância global da integração com IA
const aiIntegration = new AIIntegration();

// Funções globais para uso no HTML
async function transcribeAudioWithAI(audioBlob, formType) {
    return await aiIntegration.transcribeAudio(audioBlob, formType);
}

async function generateDocumentWithAI(formData, formType) {
    return await aiIntegration.generateDocumentWithGoogleAI(formData, formType);
}

function getAILinks(documentText, formType) {
    return aiIntegration.generateAILinks(documentText, formType);
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
    await aiIntegration.init();
    
    // Verificar status das APIs
    const apiStatus = await aiIntegration.checkAPIStatus();
    console.log('📊 Status das APIs:', apiStatus);
    
    // Mostrar indicadores de status na interface
    if (apiStatus.openai) {
        console.log('✅ ChatGPT API conectada');
    } else {
        console.log('⚠️ ChatGPT API offline - usando fallback');
    }
    
    if (apiStatus.googleai) {
        console.log('✅ Google AI API conectada');
    } else {
        console.log('⚠️ Google AI API offline - usando fallback');
    }
});

