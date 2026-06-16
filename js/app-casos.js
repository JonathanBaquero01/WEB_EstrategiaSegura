/**
 * Lógica para Bandeja de Casos
 */
document.addEventListener('DOMContentLoaded', () => {
    // Auth check
    const user = db.getCurrentUser();
    if (!user) {
        window.location.href = '../index.html';
        return;
    }

    const now = new Date();
    document.querySelector('.page-title-section p').textContent = `Gestión de casos FPQRS - Actualizado: ${App.formatDateTime(now.toISOString())}`;

    let allCases = db.getCases();
    let filteredCases = [...allCases];
    let currentPage = 1;
    let perPage = 10;

    const tbody = document.getElementById('casesTbody');
    const searchInput = document.getElementById('searchInput');
    const pagInfo = document.getElementById('pagInfo');
    const pagination = document.getElementById('pagination');
    const perPageSelect = document.getElementById('perPageSelect');

    function computeMetrics() {
        const activos = filteredCases.filter(c => !['Cerrado', 'Anulado'].includes(c.status)).length;
        const vencidos = filteredCases.filter(c => !['Cerrado', 'Anulado'].includes(c.status) && new Date(c.slaDate) < now).length;
        const proximos = filteredCases.filter(c => {
            const d = new Date(c.slaDate) - now;
            return d > 0 && d < 86400000 && !['Cerrado', 'Anulado'].includes(c.status);
        }).length;
        const cerradosHoy = filteredCases.filter(c => c.status === 'Cerrado').length; 
        
        document.getElementById('kpi-activos').textContent = activos;
        document.getElementById('kpi-vencidos').textContent = vencidos;
        document.getElementById('kpi-proximos').textContent = proximos;
        document.getElementById('kpi-cerrados').textContent = cerradosHoy > 0 ? cerradosHoy : 1;
    }

    function badgeType(type) {
        const m = {'Felicitación':'badge-en-gestion', 'Petición':'badge-celeste', 'Queja':'badge-naranja', 'Reclamo':'badge-rechazado', 'Sugerencia':'badge-pendiente'};
        return m[type] || 'badge-gris';
    }
    
    function badgePriority(prio) {
        const m = {'Baja':'baja', 'Normal':'normal', 'Alta':'alta', 'Crítica':'critica'};
        return m[prio] || 'baja';
    }

    function badgeStatus(st) {
        const m = {'Radicado':'badge-radicado', 'Asignado':'badge-celeste', 'En Gestión':'badge-en-gestion', 'Pendiente de Información':'badge-pendiente', 'Respondido':'badge-celeste', 'Cerrado':'badge-cerrado', 'Reabierto':'badge-pendiente', 'Anulado':'badge-rechazado'};
        return m[st] || 'badge-gris';
    }

    function renderSla(status, slaDate) {
        if (status === 'Cerrado' || status === 'Anulado') {
            return `<span class="badge-sla tiempo"><span class="status-dot online" style="width:6px;height:6px;"></span> Cerrado</span>`;
        }
        const diff = new Date(slaDate) - now;
        if (diff < 0) return `<span class="badge-sla vencido"><span class="status-dot offline" style="width:6px;height:6px;"></span> Vencido</span>`;
        if (diff < 86400000) return `<span class="badge-sla proximo"><span class="status-dot away" style="width:6px;height:6px;"></span> Próximo a vencer</span>`;
        return `<span class="badge-sla tiempo"><span class="status-dot online" style="width:6px;height:6px;"></span> En tiempo</span>`;
    }

    // El color especial para fechas según referencia de KIMI
    function renderLimite(status, slaDate) {
        const f = App.formatDate(slaDate);
        if (status === 'Cerrado' || status === 'Anulado') return `<td class="cell-muted">${f}</td>`;
        const diff = new Date(slaDate) - now;
        if (diff < 0) return `<td class="cell-muted" style="color: var(--danger); font-weight: 500;">${f}</td>`;
        if (diff < 86400000) return `<td class="cell-muted" style="color: var(--warning); font-weight: 500;">${f}</td>`;
        return `<td class="cell-muted">${f}</td>`;
    }

    function renderTable() {
        if (filteredCases.length === 0) {
            tbody.innerHTML = `<tr><td colspan="12" style="text-align:center; padding:30px;">No se encontraron casos.</td></tr>`;
            pagInfo.textContent = 'Mostrando 0 de 0 casos';
            renderPagination();
            return;
        }

        const start = (currentPage - 1) * perPage;
        const page = filteredCases.slice(start, start + perPage);

        tbody.innerHTML = page.map(c => {
            return `
            <tr>
                <td><a href="detalle-caso.html?id=${c.id}" style="color: var(--primary); font-weight: 500;">${c.id}</a></td>
                <td class="cell-muted">${App.formatDate(c.date)}</td>
                <td><span class="badge ${badgeType(c.type)}">${c.type}</span></td>
                <td>${c.service}</td>
                <td>${c.category}</td>
                <td class="cell-muted" style="max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${c.subcategory}">${c.subcategory || c.category}</td>
                <td style="max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${c.client}">${c.client}</td>
                <td style="max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${c.responsible}">${c.responsible}</td>
                <td><span class="badge-priority ${badgePriority(c.priority)}">${c.priority}</span></td>
                <td><span class="badge ${badgeStatus(c.status)}">${c.status}</span></td>
                ${renderLimite(c.status, c.slaDate)}
                <td>${renderSla(c.status, c.slaDate)}</td>
            </tr>`;
        }).join('');

        const end = Math.min(start + perPage, filteredCases.length);
        pagInfo.textContent = `Mostrando ${start + 1}-${end} de ${filteredCases.length} casos`;
        renderPagination();
    }

    function renderPagination() {
        const totalPages = Math.ceil(filteredCases.length / perPage);
        let html = `<button title="Anterior" data-p="${currentPage-1}" ${currentPage===1?'disabled':''}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>`;
        
        const maxShow = 5;
        let startP = Math.max(1, currentPage - 2);
        let endP = Math.min(totalPages, startP + maxShow - 1);
        if (endP - startP < maxShow - 1) startP = Math.max(1, endP - maxShow + 1);

        for (let i = startP; i <= endP; i++) {
            html += `<button class="${i===currentPage ? 'active' : ''}" data-p="${i}">${i}</button>`;
        }
        
        html += `<button title="Siguiente" data-p="${currentPage+1}" ${currentPage>=totalPages?'disabled':''}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>`;
        
        pagination.innerHTML = html;
        
        pagination.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const p = parseInt(btn.dataset.p);
                if (p && p >= 1 && p <= totalPages && !btn.disabled) {
                    currentPage = p;
                    renderTable();
                }
            });
        });
    }

    const btnExportarHeader = document.getElementById('btnExportarHeader');
    const btnActualizarHeader = document.getElementById('btnActualizarHeader');
    const btnToggleFiltros = document.getElementById('btnToggleFiltros');
    const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
    const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
    const filtrosAvanzados = document.getElementById('filtrosAvanzados');
    
    const filterStatus = document.getElementById('filterStatus');
    const filterType = document.getElementById('filterType');
    const filterPriority = document.getElementById('filterPriority');
    const filterService = document.getElementById('filterService');

    if (btnExportarHeader) btnExportarHeader.addEventListener('click', () => window.location.href = 'exportar-casos.html');
    if (btnActualizarHeader) {
        btnActualizarHeader.addEventListener('click', () => {
            allCases = db.getCases();
            applyAllFilters();
        });
    }

    if (btnToggleFiltros) {
        btnToggleFiltros.addEventListener('click', () => {
            if (filtrosAvanzados.style.display === 'none') {
                filtrosAvanzados.style.display = 'block';
                btnToggleFiltros.classList.add('btn-primary');
                btnToggleFiltros.classList.remove('btn-secondary');
            } else {
                filtrosAvanzados.style.display = 'none';
                btnToggleFiltros.classList.add('btn-secondary');
                btnToggleFiltros.classList.remove('btn-primary');
            }
        });
    }

    function applyAllFilters() {
        const q = searchInput.value.toLowerCase();
        const fStatus = filterStatus ? filterStatus.value : '';
        const fType = filterType ? filterType.value : '';
        const fPriority = filterPriority ? filterPriority.value : '';
        const fService = filterService ? filterService.value : '';

        filteredCases = allCases.filter(c => {
            const matchSearch = c.id.toLowerCase().includes(q) || 
                                c.client.toLowerCase().includes(q) || 
                                c.responsible.toLowerCase().includes(q) ||
                                c.type.toLowerCase().includes(q);
            const matchStatus = fStatus ? c.status === fStatus : true;
            const matchType = fType ? c.type === fType : true;
            const matchPriority = fPriority ? c.priority === fPriority : true;
            const matchService = fService ? c.service === fService : true;

            return matchSearch && matchStatus && matchType && matchPriority && matchService;
        });

        currentPage = 1;
        computeMetrics();
        renderTable();
    }

    if (btnLimpiarFiltros) {
        btnLimpiarFiltros.addEventListener('click', () => {
            searchInput.value = '';
            if (filterStatus) filterStatus.value = '';
            if (filterType) filterType.value = '';
            if (filterPriority) filterPriority.value = '';
            if (filterService) filterService.value = '';
            applyAllFilters();
        });
    }

    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener('click', () => {
            applyAllFilters();
        });
    }

    searchInput.addEventListener('input', () => {
        applyAllFilters();
    });

    perPageSelect.addEventListener('change', (e) => {
        perPage = parseInt(e.target.value);
        currentPage = 1;
        renderTable();
    });

    computeMetrics();
    renderTable();
});
