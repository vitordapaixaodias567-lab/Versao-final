const API = 'http://localhost:3001';
const idAgendamento = new URLSearchParams(location.search).get('id');
let entregue = false;

/* ===== ELEMENTOS ===== */
const $ = (id) => document.getElementById(id);

const el = {
    formAssinatura: $("formAssinatura"),
    formAceite: $("formAceite"),
    canvas: $("assinatura"),
    limpar: $("limpar"),
    nomeAssinatura: $("nomeAssinatura"),
    nomeAceite: $("nomeAceite"),
    concordo: $("concordo"),
    aviso: $("aviso")
};

/* ===== AVISO ===== */
let tempoAviso;

function mostrarAviso(texto, erro) {
    el.aviso.textContent = texto;
    el.aviso.className = "aviso mostrar" + (erro ? " erro" : "");

    clearTimeout(tempoAviso);
    tempoAviso = setTimeout(() => el.aviso.classList.remove("mostrar"), 2800);
}

/* ===== ASSINATURA NA TELA ===== */
const ctx = el.canvas.getContext("2d");
let desenhando = false;
let assinou = false;

function ajustarCanvas() {
    const medidas = el.canvas.getBoundingClientRect();
    const escala = window.devicePixelRatio || 1;

    el.canvas.width = medidas.width * escala;
    el.canvas.height = medidas.height * escala;
    ctx.scale(escala, escala);

    ctx.strokeStyle = "#ffd60a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    assinou = false;
}

function posicao(e) {
    const medidas = el.canvas.getBoundingClientRect();
    return [e.clientX - medidas.left, e.clientY - medidas.top];
}

el.canvas.addEventListener("pointerdown", (e) => {
    desenhando = true;
    el.canvas.setPointerCapture(e.pointerId);

    const [x, y] = posicao(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
});

el.canvas.addEventListener("pointermove", (e) => {
    if (!desenhando) return;

    const [x, y] = posicao(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    assinou = true;
});

["pointerup", "pointercancel"].forEach((evento) => {
    el.canvas.addEventListener(evento, () => { desenhando = false; });
});

el.limpar.addEventListener("click", () => {
    ctx.clearRect(0, 0, el.canvas.width, el.canvas.height);
    assinou = false;
});

window.addEventListener("load", ajustarCanvas);
window.addEventListener("resize", ajustarCanvas);

/* ===== DADOS DO AGENDAMENTO ===== */
async function carregar() {
    if (!idAgendamento) return mostrarAviso('Abra o termo pelo rastreio de um agendamento.', true);
    try {
        const { data: a } = await axios.get(`${API}/agendamentos/${idAgendamento}`);
        const codigo = 'BO-' + a.id.slice(0, 5).toUpperCase();

        $('frascoId').textContent = codigo;
        $('frascoId2').textContent = codigo;
        $('local').textContent = `${a.rua}, ${a.numeroresidencia} – ${a.bairro}`;

        entregue = !!a.entrega;
        const quando = new Date(entregue ? a.entrega.em : Date.now());
        $('dataHora').textContent = `${quando.toLocaleDateString('pt-BR')} · ${quando.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        if (entregue) mostrarAviso('A entrega deste frasco já foi registrada.');
    } catch (error) {
        console.error(error);
        mostrarAviso('Não foi possível carregar o agendamento.', true);
    }
}

async function confirmarEntrega(dados) {
    if (!idAgendamento) return mostrarAviso('Agendamento não encontrado.', true);
    if (entregue) return mostrarAviso('A entrega deste frasco já foi registrada.', true);
    try {
        await axios.patch(`${API}/agendamentos/${idAgendamento}`, { entrega: { ...dados, em: new Date().toISOString() } });
        entregue = true;
        mostrarAviso(`Entrega confirmada por ${dados.nome}.`);
    } catch (error) {
        console.error(error);
        mostrarAviso('Erro ao salvar a entrega.', true);
    }
}

/* ===== OPÇÃO 1: CONFIRMAR COM ASSINATURA ===== */
el.formAssinatura.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = el.nomeAssinatura.value.trim();

    if (!assinou) return mostrarAviso('Peça ao responsável para assinar na tela.', true);
    if (!nome) return mostrarAviso('Informe o nome do responsável.', true);

    confirmarEntrega({ tipo: 'assinatura', nome, assinatura: el.canvas.toDataURL() });
});

/* ===== OPÇÃO 2: CONFIRMAR COM ACEITE DIGITAL ===== */
el.formAceite.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = el.nomeAceite.value.trim();

    if (!el.concordo.checked) return mostrarAviso('Marque que leu e concorda com os termos.', true);
    if (!nome) return mostrarAviso('Informe o nome do responsável.', true);

    confirmarEntrega({ tipo: 'aceite', nome });
});

carregar();
