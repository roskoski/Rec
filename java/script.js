// =================================================================
// Seção de Funcionalidades (script.js - Requisitos de JavaScript)
// =================================================================
        
// Constantes e Elementos do DOM
const FORM = document.getElementById('aluno-form');
const TABELA_BODY = document.getElementById('registros-tabela');
const FEEDBACK_MSG = document.getElementById('feedback-message');
const CHAVE_STORAGE = 'alunosData';
const NOTA_MINIMA_APROVACAO = 6.0;

// Armazenamento em memória (cache) para os alunos
let alunos = [];

/**
 * Exibe uma mensagem de feedback customizada (em vez de alert()).
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - Tipo da mensagem ('success', 'error', 'info').
 */
function showFeedback(message, type = 'info') {
    FEEDBACK_MSG.textContent = message;
    FEEDBACK_MSG.style.display = 'block';
    FEEDBACK_MSG.style.opacity = '1';
    
    // Define a cor de fundo com base no tipo
    switch(type) {
        case 'success':
            FEEDBACK_MSG.className = 'bg-green-500 text-white';
            break;
        case 'error':
            FEEDBACK_MSG.className = 'bg-red-600 text-white';
            break;
        case 'info':
        default:
            FEEDBACK_MSG.className = 'bg-blue-500 text-white';
            break;
    }

    // Esconde a mensagem após 3 segundos
    setTimeout(() => {
        FEEDBACK_MSG.style.opacity = '0';
        setTimeout(() => {
            FEEDBACK_MSG.style.display = 'none';
        }, 500); // Tempo para a transição de opacidade
    }, 3000);
}

/**
 * Calcula a média e determina o status (Aprovado/Reprovado).
 * Usa 3 notas.
 * @param {number} nota1 - Primeira nota.
 * @param {number} nota2 - Segunda nota.
 * @param {number} nota3 - Terceira nota.
 * @returns {object} Um objeto contendo a média e o status.
 */
function calcularMediaEStatus(nota1, nota2, nota3) {
    // Média de três notas
    const media = (nota1 + nota2 + nota3) / 3;
    const status = media >= NOTA_MINIMA_APROVACAO ? 'Aprovado' : 'Reprovado';
    
    return {
        media: media.toFixed(1), // Formata a média com 1 casa decimal
        status: status
    };
}

/**
 * Carrega os dados dos alunos do localStorage, ajustando para a nova estrutura de 3 notas
 * e recalculando a média por segurança.
 */
function carregarAlunos() {
    try {
        const data = localStorage.getItem(CHAVE_STORAGE);
        if (data) {
            const loadedData = JSON.parse(data);
            // Mapeia os dados, garantindo que nota3 exista (valor 0 para dados antigos)
            // e que a média seja recalculada com a nova regra de 3 notas.
            alunos = loadedData.map(aluno => {
                const n1 = parseFloat(aluno.nota1) || 0;
                const n2 = parseFloat(aluno.nota2) || 0;
                const n3 = parseFloat(aluno.nota3) || 0; 
                
                const { media, status } = calcularMediaEStatus(n1, n2, n3);
                
                return {
                    ...aluno,
                    nota1: n1,
                    nota2: n2,
                    nota3: n3, 
                    media: media,
                    status: status
                };
            });
            // Salva a estrutura atualizada de volta no storage (para consistência)
            salvarAlunos();
        }
    } catch (error) {
        console.error("Erro ao carregar dados do localStorage:", error);
        showFeedback("Erro ao carregar dados salvos.", 'error');
    }
}

/**
 * Salva os dados dos alunos no localStorage.
 */
function salvarAlunos() {
    try {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(alunos));
    } catch (error) {
        console.error("Erro ao salvar dados no localStorage:", error);
        showFeedback("Erro ao salvar os dados.", 'error');
    }
}

/**
 * Remove um aluno do array, salva e re-renderiza.
 * @param {number} index - O índice do aluno a ser removido.
 * @param {string} nome - O nome do aluno para feedback.
 */
function excluirAluno(index, nome) {
    if (index >= 0 && index < alunos.length) {
        // Remove o aluno do array
        alunos.splice(index, 1);
        
        // Salva e re-renderiza
        salvarAlunos();
        renderizarTabela();
        showFeedback(`Aluno(a) ${nome} removido(a) com sucesso.`, 'info');
    }
}


/**
 * Insere um novo aluno na tabela.
 * @param {object} aluno - O objeto aluno a ser adicionado.
 * @param {number} index - O índice do aluno na array 'alunos'.
 */
function adicionarLinhaTabela(aluno, index) {
    const newRow = TABELA_BODY.insertRow();
    
    // Célula Nome
    let cellNome = newRow.insertCell();
    cellNome.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900';
    cellNome.textContent = aluno.nome;

    // Célula Nota 1
    let cellNota1 = newRow.insertCell();
    cellNota1.className = 'px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500';
    cellNota1.textContent = aluno.nota1.toFixed(1);

    // Célula Nota 2
    let cellNota2 = newRow.insertCell();
    cellNota2.className = 'px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500';
    cellNota2.textContent = aluno.nota2.toFixed(1);

    // Célula Nota 3
    let cellNota3 = newRow.insertCell();
    cellNota3.className = 'px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500';
    cellNota3.textContent = aluno.nota3.toFixed(1);

    // Célula Média
    let cellMedia = newRow.insertCell();
    cellMedia.className = 'px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700 font-semibold';
    cellMedia.textContent = aluno.media;

    // Célula Status (com destaque visual)
    let cellStatus = newRow.insertCell();
    cellStatus.className = 'px-6 py-4 whitespace-nowrap text-sm text-center rounded-full';
    
    // Aplica a classe de destaque (verde claro / vermelho claro)
    if (aluno.status === 'Aprovado') {
        cellStatus.classList.add('aprovado');
    } else {
        cellStatus.classList.add('reprovado');
    }
    cellStatus.textContent = aluno.status;

    // Célula Ações (Excluir)
    let cellAcoes = newRow.insertCell();
    cellAcoes.className = 'px-6 py-4 whitespace-nowrap text-center text-sm font-medium';
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Excluir';
    deleteBtn.className = 'text-red-600 hover:text-red-900 font-semibold transition duration-150 ease-in-out px-3 py-1 rounded-md border border-red-300 hover:bg-red-50';
    // Chama a função de exclusão com o índice e nome do aluno
    deleteBtn.onclick = () => excluirAluno(index, aluno.nome); 
    cellAcoes.appendChild(deleteBtn);
}

/**
 * Renderiza todos os alunos na tabela.
 */
function renderizarTabela() {
    // Limpa o corpo da tabela
    TABELA_BODY.innerHTML = '';
    
    // Insere cada aluno, passando o índice
    alunos.forEach((aluno, index) => adicionarLinhaTabela(aluno, index));
}

/**
 * Manipulador de evento para submissão do formulário.
 */
FORM.addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const nome = document.getElementById('nome').value.trim();
    const nota1Str = document.getElementById('nota1').value;
    const nota2Str = document.getElementById('nota2').value;
    const nota3Str = document.getElementById('nota3').value; // Novo campo

    // 1. Validação dos campos
    if (!nome || !nota1Str || !nota2Str || !nota3Str) {
        showFeedback("Por favor, preencha todos os campos, incluindo a Nota 3.", 'error');
        return;
    }

    const nota1 = parseFloat(nota1Str);
    const nota2 = parseFloat(nota2Str);
    const nota3 = parseFloat(nota3Str);

    // Validação de intervalo das notas (0-10)
    if (isNaN(nota1) || isNaN(nota2) || isNaN(nota3) || 
        nota1 < 0 || nota1 > 10 || 
        nota2 < 0 || nota2 > 10 ||
        nota3 < 0 || nota3 > 10) {
        showFeedback("As notas devem ser valores entre 0 e 10.", 'error');
        return;
    }

    // 2. Cálculo da Média e Status com 3 notas
    const resultado = calcularMediaEStatus(nota1, nota2, nota3);

    // 3. Criação do Objeto Aluno
    const novoAluno = {
        nome: nome,
        nota1: nota1,
        nota2: nota2,
        nota3: nota3, // Inclui a Nota 3
        media: resultado.media,
        status: resultado.status
    };

    // 4. Adiciona à lista e salva
    alunos.push(novoAluno);
    salvarAlunos();

    // 5. Atualiza a Tabela
    renderizarTabela();

    // 6. Limpa os campos
    FORM.reset();
    
    showFeedback(`Aluno(a) ${nome} cadastrado com sucesso!`, 'success');
});

// =================================================================
// Inicialização
// =================================================================

// Carrega dados e renderiza a tabela ao carregar a página
window.onload = function() {
    carregarAlunos();
    renderizarTabela();
};