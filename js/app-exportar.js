document.addEventListener('DOMContentLoaded', function () {
    SidebarModule.render('exportar');
    SidebarModule.setupMobile();

    // Radio card selection
    document.querySelectorAll('.radio-card').forEach(card => {
        card.addEventListener('click', function () {
            const name = this.querySelector('input')?.name;
            if (name) {
                document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
                    r.closest('.radio-card').classList.remove('selected');
                });
            }
            this.classList.add('selected');
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                updateFormatLabel(radio.value);
            }
        });
    });

    const user = db.getCurrentUser();
    if (!user) {
        window.location.href = '../index.html';
        return;
    }

    const allCases = db.getCases();
    let filteredCases = [...allCases];

    // Form Inputs
    const expDateFrom = document.getElementById('expDateFrom');
    const expDateTo = document.getElementById('expDateTo');
    const expServicio = document.getElementById('expServicio');
    const expGrupo = document.getElementById('expGrupo');
    const expEstado = document.getElementById('expEstado');
    const expPrioridad = document.getElementById('expPrioridad');
    const expResponsable = document.getElementById('expResponsable');
    const expTipo = document.getElementById('expTipo');

    // Display fields
    const expFilterCount = document.getElementById('expFilterCount');
    const previewTitleCount = document.getElementById('previewTitleCount');
    const previewCountText = document.getElementById('previewCountText');
    const expPreviewTbody = document.getElementById('expPreviewTbody');
    const expResumenTotal = document.getElementById('expResumenTotal');
    const btnExportarCount = document.getElementById('btnExportarCount');
    const btnResetExportFilters = document.getElementById('btnResetExportFilters');
    const btnExportarFinal = document.getElementById('btnExportarFinal');

    // Populate Responsables dynamically
    const reps = [...new Set(allCases.map(c => c.responsible))];
    if (expResponsable) {
        reps.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r; opt.textContent = r;
            expResponsable.appendChild(opt);
        });
    }

    function applyFilters() {
        const dFrom = expDateFrom ? expDateFrom.value : '';
        const dTo = expDateTo ? expDateTo.value : '';
        const srv = expServicio ? expServicio.value : '';
        const grp = expGrupo ? expGrupo.value : '';
        const est = expEstado ? expEstado.value : '';
        const pri = expPrioridad ? expPrioridad.value : '';
        const rsp = expResponsable ? expResponsable.value : '';
        const tip = expTipo ? expTipo.value : '';

        filteredCases = allCases.filter(c => {
            // Dates are 'YYYY-MM-DD'
            if (dFrom && c.date < dFrom) return false;
            if (dTo && c.date > dTo) return false;

            if (srv && c.service !== srv) return false;
            // c.group isn't in db explicitly, filter by condition or skip
            if (est && c.status !== est) return false;
            if (pri && c.priority !== pri) return false;
            if (rsp && c.responsible !== rsp) return false;
            if (tip && c.type !== tip) return false;

            return true;
        });

        updateUI();
    }

    function badgeType(type) {
        const m = { 'Felicitación': 'badge-en-gestion', 'Petición': 'badge-celeste', 'Queja': 'badge-naranja', 'Reclamo': 'badge-rechazado', 'Sugerencia': 'badge-pendiente' };
        return m[type] || 'badge-gris';
    }

    function badgeStatus(st) {
        const m = { 'Radicado': 'badge-radicado', 'Asignado': 'badge-celeste', 'En Gestión': 'badge-en-gestion', 'Pendiente de Información': 'badge-pendiente', 'Respondido': 'badge-celeste', 'Cerrado': 'badge-cerrado', 'Reabierto': 'badge-pendiente', 'Anulado': 'badge-rechazado' };
        return m[st] || 'badge-gris';
    }

    function renderSla(status, slaDate) {
        if (status === 'Cerrado' || status === 'Anulado') return `<span class="badge-sla tiempo">Cum</span>`;
        const diff = new Date(slaDate) - new Date();
        if (diff < 0) return `<span class="badge-sla vencido">Venc</span>`;
        if (diff < 86400000) return `<span class="badge-sla proximo">Próx</span>`;
        return `<span class="badge-sla tiempo">Cum</span>`;
    }

    function updateUI() {
        const count = filteredCases.length;
        if (expFilterCount) expFilterCount.textContent = `${count} casos`;
        if (previewTitleCount) previewTitleCount.textContent = count;
        if (expResumenTotal) expResumenTotal.textContent = `${count} registros`;
        if (btnExportarCount) btnExportarCount.textContent = count;

        if (count === 0) {
            if (previewCountText) previewCountText.textContent = `0 casos`;
            if (expPreviewTbody) expPreviewTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">No se encontraron casos con los filtros aplicados.</td></tr>`;
            return;
        }

        const previewCases = filteredCases.slice(0, 10);
        if (previewCountText) previewCountText.textContent = `Primeros ${previewCases.length}`;

        if (expPreviewTbody) expPreviewTbody.innerHTML = previewCases.map(c => {
            return `<tr>
                <td>${c.id}</td>
                <td>${c.service}</td>
                <td><span class="badge ${badgeType(c.type)}">${c.type}</span></td>
                <td><span class="badge ${badgeStatus(c.status)}">${c.status}</span></td>
                <td>${c.category}</td>
                <td>${renderSla(c.status, c.slaDate)}</td>
            </tr>`;
        }).join('');
    }

    function updateFormatLabel(format) {
        const span = document.getElementById('expResumenFormat');
        if (!span) return;
        switch (format) {
            case 'csv': span.textContent = 'CSV (.CSV)'; break;
            case 'xlsx': span.textContent = 'EXCEL (.XLSX)'; break;
            case 'pdf': span.textContent = 'PDF (.PDF)'; break;
        }
    }

    // Attach listeners
    [expDateFrom, expDateTo, expServicio, expGrupo, expEstado, expPrioridad, expResponsable, expTipo].forEach(el => {
        if (el) el.addEventListener('change', applyFilters);
    });

    if (btnResetExportFilters) {
        btnResetExportFilters.addEventListener('click', () => {
            [expDateFrom, expDateTo, expServicio, expGrupo, expEstado, expPrioridad, expResponsable, expTipo].forEach(el => {
                if (el) el.value = '';
            });
            applyFilters();
        });
    }

    // Export Logic
    if (btnExportarFinal) {
        btnExportarFinal.addEventListener('click', () => {
            const formatInput = document.querySelector('input[name="format"]:checked');
            const format = formatInput ? formatInput.value : 'xlsx';

            if (filteredCases.length === 0) {
                alert('No hay casos para exportar.');
                return;
            }

            if (format === 'csv') {
                exportarCSV();
            } else if (format === 'xlsx') {
                exportarExcel();
            } else if (format === 'pdf') {
                exportarPDF();
            }
        });
    }

    function exportarCSV() {
        const headers = ["ID", "Fecha", "Tipo", "Servicio", "Categoría", "Subcategoría", "Cliente", "Responsable", "Prioridad", "Estado", "Fecha SLA"];
        const rows = filteredCases.map(c => [
            c.id, c.date, c.type, c.service, c.category, c.subcategory, c.client, c.responsible, c.priority, c.status, c.slaDate
        ].map(val => `"${val}"`).join(','));

        const csvContent = headers.join(',') + '\n' + rows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_fpqrs_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function exportarExcel() {
        if (typeof XLSX === 'undefined') {
            alert('Librería SheetJS no cargada.');
            return;
        }
        const data = filteredCases.map(c => ({
            "Radicado": c.id,
            "Fecha Rad.": c.date,
            "Tipo": c.type,
            "Servicio": c.service,
            "Categoría": c.category,
            "Subcategoría": c.subcategory,
            "Asociado": c.client,
            "Responsable": c.responsible,
            "Prioridad": c.priority,
            "Estado": c.status,
            "Límite SLA": c.slaDate
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Casos");
        XLSX.writeFile(wb, `reporte_fpqrs_${Date.now()}.xlsx`);
    }

    function exportarPDF() {
        if (typeof html2pdf === 'undefined') {
            alert('Librería html2pdf no cargada.');
            return;
        }

        const container = document.createElement('div');
        container.style.padding = '20px';
        container.style.fontFamily = 'Arial, sans-serif';

        const title = document.createElement('h2');
        title.textContent = 'Reporte de Casos FPQRS';
        title.style.color = '#1f2937';
        container.appendChild(title);

        const subtitle = document.createElement('p');
        subtitle.textContent = `Generado el: ${new Date().toLocaleString()} - Total casos: ${filteredCases.length}`;
        subtitle.style.color = '#6b7280';
        subtitle.style.fontSize = '12px';
        container.appendChild(subtitle);

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginTop = '20px';
        table.style.fontSize = '11px';

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb; text-align: left;">
                <th style="padding: 8px;">Radicado</th>
                <th style="padding: 8px;">Fecha</th>
                <th style="padding: 8px;">Tipo</th>
                <th style="padding: 8px;">Servicio</th>
                <th style="padding: 8px;">Estado</th>
                <th style="padding: 8px;">SLA</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        filteredCases.forEach((c, index) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #e5e7eb';
            if (index % 2 === 1) tr.style.backgroundColor = '#f9fafb';
            tr.innerHTML = `
                <td style="padding: 6px 8px;">${c.id}</td>
                <td style="padding: 6px 8px;">${c.date}</td>
                <td style="padding: 6px 8px;">${c.type}</td>
                <td style="padding: 6px 8px;">${c.service}</td>
                <td style="padding: 6px 8px;">${c.status}</td>
                <td style="padding: 6px 8px;">${c.slaDate}</td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        container.appendChild(table);

        const opt = {
            margin: 10,
            filename: `reporte_fpqrs_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(container).save();
    }

    applyFilters();
});
