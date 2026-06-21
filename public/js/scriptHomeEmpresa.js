// ========================
// dashboard
// ========================

let chartStatus = null
let chartVagas = null

const CHART_COLORS = {
    pendente:  'rgba(251, 191, 36,  0.85)',
    aprovado:  'rgba(74,  222, 128, 0.85)',
    rejeitado: 'rgba(248, 113, 113, 0.85)'
}

const CHART_BORDERS = {
    pendente:  'rgba(251, 191, 36,  1)',
    aprovado:  'rgba(74,  222, 128, 1)',
    rejeitado: 'rgba(248, 113, 113, 1)'
}

function preencherMetricaCard(id, valor) {
    const el = document.getElementById(id)
    if (el) el.textContent = valor ?? '0'
}

function renderizarChartStatus(candidaturas) {
    const canvas = document.getElementById('chartStatus')
    if (!canvas) return

    const { pendentes, aprovados, rejeitados } = candidaturas

    if (chartStatus) { chartStatus.destroy(); chartStatus = null }

    chartStatus = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Pendentes', 'Aprovados', 'Rejeitados'],
            datasets: [{
                data: [
                    Number(pendentes) || 0,
                    Number(aprovados) || 0,
                    Number(rejeitados) || 0
                ],
                backgroundColor: [
                    CHART_COLORS.pendente,
                    CHART_COLORS.aprovado,
                    CHART_COLORS.rejeitado
                ],
                borderColor: [
                    CHART_BORDERS.pendente,
                    CHART_BORDERS.aprovado,
                    CHART_BORDERS.rejeitado
                ],
                borderWidth: 1,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: { size: 11, family: 'Inter' },
                        padding: 12,
                        usePointStyle: true,
                        pointStyleWidth: 8
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`
                    }
                }
            }
        }
    })
}

function renderizarChartVagas(candidatosPorVaga) {
    const canvas = document.getElementById('chartVagas')
    if (!canvas) return

    if (chartVagas) { chartVagas.destroy(); chartVagas = null }

    const labels = candidatosPorVaga.map(v =>
        v.titulo.length > 22 ? v.titulo.slice(0, 22) + '…' : v.titulo
    )
    const valores = candidatosPorVaga.map(v => Number(v.total) || 0)

    chartVagas = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Candidatos',
                data: valores,
                backgroundColor: 'rgba(14, 165, 233, 0.45)',
                borderColor: 'rgba(34, 211, 238, 0.9)',
                borderWidth: 1,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.parsed.y} candidato${ctx.parsed.y === 1 ? '' : 's'}`
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 10, family: 'Inter' },
                        maxRotation: 30
                    },
                    grid: { color: 'rgba(148, 163, 184, 0.08)' }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 11, family: 'Inter' },
                        stepSize: 1,
                        precision: 0
                    },
                    grid: { color: 'rgba(148, 163, 184, 0.08)' }
                }
            }
        }
    })
}

async function carregarDashboard() {
    try {
        const resposta = await fetch('/api/candidaturas/metricas', { credentials: 'include' })

        if (resposta.status === 401 || resposta.status === 403) {
            window.location.href = '/login'
            return
        }

        if (!resposta.ok) return

        const { vagas, candidaturas, candidatosPorVaga } = await resposta.json()

        preencherMetricaCard('metricTotalVagas',        vagas.total_vagas)
        preencherMetricaCard('metricTotalCandidaturas', candidaturas.total_candidaturas)
        preencherMetricaCard('metricPendentes',         candidaturas.pendentes)
        preencherMetricaCard('metricAprovados',         candidaturas.aprovados)
        preencherMetricaCard('metricRejeitados',        candidaturas.rejeitados)

        const vagasAtivas = document.getElementById('metricVagasAtivas')
        if (vagasAtivas) vagasAtivas.textContent = `${vagas.vagas_ativas ?? 0} ativas`

        renderizarChartStatus(candidaturas)
        renderizarChartVagas(candidatosPorVaga)

    } catch (err) {
        console.error('Erro ao carregar dashboard:', err)
    }
}

carregarDashboard()

const vagasEmpresaContainer = document.getElementById('vagasEmpresa')
const btnNovaVaga = document.getElementById('btnNovaVaga')

const TIPO_LABEL = {
    remoto: 'Remoto',
    presencial: 'Presencial',
    hibrido: 'Hibrido'
}

function formatarTipoBolsa(vaga) {
    const tipo = vaga.tipo ? (TIPO_LABEL[vaga.tipo] || vaga.tipo) : 'Tipo nao informado'
    const bolsa = vaga.bolsa?.trim() || 'Bolsa a combinar'
    return `${tipo} • ${bolsa}`
}

function criarCardEmpresa(vaga) {
    const card = document.createElement('article')
    card.className = 'vaga-card'

    const titulo = document.createElement('h3')
    titulo.className = 'vaga-card-titulo'
    titulo.textContent = vaga.titulo

    const meta = document.createElement('p')
    meta.className = 'vaga-card-meta'
    meta.textContent = formatarTipoBolsa(vaga)

    const prazo = document.createElement('p')
    prazo.className = 'vaga-card-prazo'
    prazo.textContent = `Prazo: ${formatarDataPrazo(vaga.prazo_inscricao)}`

    const candidatos = document.createElement('p')
    candidatos.className = 'vaga-card-candidatos'
    const total = Number(vaga.total_candidatos) || 0
    candidatos.textContent = `${total} candidato${total === 1 ? '' : 's'}`

    const actions = document.createElement('div')
    actions.className = 'vaga-card-actions'

    const btnEditar = document.createElement('a')
    btnEditar.className = 'btn-secondary'
    btnEditar.href = `/editar-vaga/${vaga.id}`
    btnEditar.textContent = 'Editar vaga'

    const btnCandidatos = document.createElement('a')
    btnCandidatos.className = 'btn-secondary'
    btnCandidatos.href = `/vagas/${vaga.id}/candidatos`
    btnCandidatos.textContent = 'Ver candidatos'

    actions.appendChild(btnEditar)
    actions.appendChild(btnCandidatos)

    card.appendChild(titulo)
    card.appendChild(meta)
    card.appendChild(prazo)
    card.appendChild(candidatos)
    card.appendChild(actions)

    return card
}

async function carregarVagasEmpresa() {
    if (!vagasEmpresaContainer) return

    const resposta = await fetch('/api/vagas/empresa/minhas', { credentials: 'include' })

    if (resposta.status === 401 || resposta.status === 403) {
        window.location.href = '/login'
        return
    }

    if (!resposta.ok) {
        vagasEmpresaContainer.innerHTML = '<p class="vagas-empty">Nao foi possivel carregar suas vagas.</p>'
        return
    }

    const vagas = await resposta.json()
    vagasEmpresaContainer.innerHTML = ''

    if (!Array.isArray(vagas) || vagas.length === 0) {
        vagasEmpresaContainer.innerHTML = '<p class="vagas-empty">Nenhuma vaga publicada ainda. Clique em Nova Vaga para comecar.</p>'
        return
    }

    const grid = document.createElement('div')
    grid.className = 'vagas-grid'

    for (const vaga of vagas) {
        grid.appendChild(criarCardEmpresa(vaga))
    }

    vagasEmpresaContainer.appendChild(grid)
}

if (btnNovaVaga) {
    btnNovaVaga.addEventListener('click', () => {
        window.location.href = '/criar-vaga'
    })
}

carregarVagasEmpresa()
