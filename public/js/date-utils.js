/**
 * Formata campo DATE do MySQL (string ISO, "YYYY-MM-DD" ou Date) para exibição pt-BR.
 */
function formatarDataPrazo(data) {
    if (data == null || data === '') return 'Sem prazo definido'

    const texto = String(data)
    const match = texto.match(/^(\d{4}-\d{2}-\d{2})/)
    if (match) {
        const [ano, mes, dia] = match[1].split('-').map(Number)
        const date = new Date(ano, mes - 1, dia)
        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleDateString('pt-BR')
        }
    }

    const date = data instanceof Date ? data : new Date(data)
    if (Number.isNaN(date.getTime())) return 'Sem prazo definido'
    return date.toLocaleDateString('pt-BR')
}
