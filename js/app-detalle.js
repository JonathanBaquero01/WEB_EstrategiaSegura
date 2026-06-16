/**
 * Lógica para Detalle de Caso
 */
document.addEventListener('DOMContentLoaded', () => {
    const user = db.getCurrentUser();
    if (!user) {
        window.location.href = '../index.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    let id = params.get('id');

    if (!id) {
        const first = db.getCases()[0];
        if(first) {
            id = first.id;
            window.history.replaceState(null, '', '?id=' + id);
        } else {
            window.location.href = 'bandeja-casos.html';
            return;
        }
    }

    const caso = db.getCaseById(id);
    if (!caso) {
        alert('Caso no encontrado');
        window.location.href = 'bandeja-casos.html';
        return;
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

    const now = new Date();
    const isVencido = new Date(caso.slaDate) < now && !['Cerrado', 'Anulado'].includes(caso.status);

    // Header
    document.getElementById('bc-id').textContent = caso.id;
    document.getElementById('hd-id').textContent = caso.id;
    
    let badgesHtml = `<span class="badge ${badgeStatus(caso.status)}">${caso.status}</span>
                      <span class="badge ${badgeType(caso.type)}">${caso.type}</span>`;
    
    if (['Cerrado', 'Anulado'].includes(caso.status)) {
        badgesHtml += `<span class="badge-sla tiempo"><span class="status-dot online" style="width:6px;height:6px;"></span> Cerrado</span>`;
    } else if (isVencido) {
        badgesHtml += `<span class="badge-sla vencido"><span class="status-dot offline" style="width:6px;height:6px;"></span> Vencido</span>`;
    } else {
        badgesHtml += `<span class="badge-sla tiempo"><span class="status-dot online" style="width:6px;height:6px;"></span> En tiempo</span>`;
    }
    document.getElementById('hd-badges').innerHTML = badgesHtml;
    
    document.getElementById('hd-subtitle').textContent = `Radicado el ${App.formatDateTime(caso.date)} - Canal: ${caso.channel}`;

    // Alert
    const alertDiv = document.getElementById('alert-container');
    if (isVencido) {
        alertDiv.style.display = 'flex';
        alertDiv.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <div>
                <strong>SLA vencido - Atención urgente requerida</strong><br>
                <span style="font-size: 12px;">La fecha límite de respuesta fue ${App.formatDateTime(caso.slaDate)}. Este caso requiere acción inmediata.</span>
            </div>
        `;
    } else {
        alertDiv.style.display = 'none';
    }

    // Datos Asociado
    document.getElementById('datos-asociado').innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
            <div><div class="meta-label">NOMBRE</div><div class="meta-val">${caso.client}</div></div>
            <div><div class="meta-label">IDENTIFICACIÓN</div><div class="meta-val">${caso.clientDoc}</div></div>
            <div><div class="meta-label">CORREO</div><div class="meta-val">${caso.clientEmail}</div></div>
            <div><div class="meta-label">CELULAR</div><div class="meta-val">${caso.clientPhone || 'N/A'}</div></div>
            <div style="grid-column: span 2;"><div class="meta-label">DIRECCIÓN</div><div class="meta-val">${caso.clientAddress || 'N/A'}</div></div>
        </div>
    `;

    // Datos Caso
    document.getElementById('datos-caso').innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
            <div><div class="meta-label">SERVICIO</div><div class="meta-val">${caso.service}</div></div>
            <div><div class="meta-label">CATEGORÍA</div><div class="meta-val">${caso.category}</div></div>
            <div><div class="meta-label">SUBCATEGORÍA</div><div class="meta-val">${caso.subcategory || 'N/A'}</div></div>
            <div>
                <div class="meta-label">RESPONSABLE</div>
                <div class="meta-val">${caso.responsible}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${caso.group}</div>
            </div>
            <div><div class="meta-label">PRIORIDAD</div><span class="badge-priority ${badgePriority(caso.priority)}">${caso.priority}</span></div>
            <div><div class="meta-label">SLA APLICADO</div><div class="meta-val">${caso.slaApplied || 'N/A'}</div></div>
            <div>
                <div class="meta-label">FECHA LÍMITE SLA</div>
                <div class="meta-val" ${isVencido ? 'style="color: var(--danger);"' : ''}>${App.formatDateTime(caso.slaDate)}</div>
            </div>
            <div style="grid-column: span 2;"><div class="meta-label">TIPO DE CAUSA</div><div class="meta-val">${caso.typeCause || 'N/A'}</div></div>
        </div>
    `;

    // Tabs
    document.getElementById('tab-descripcion').innerHTML = `
        <div class="meta-label" style="margin-bottom: 8px;">DESCRIPCIÓN DEL CASO</div>
        <p style="font-size: 13px; line-height: 1.7; color: var(--text-primary);">${caso.description}</p>
    `;

    // Helper para iniciales de avatar
    const getInitials = (name) => {
        if(!name) return 'U';
        const parts = name.split(' ');
        return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
    };

    function renderComentarios() {
        const comentarios = caso.history.filter(h => h.action.includes('Observación'));
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                <div style="font-size:14px; font-weight:600; color:var(--text-primary);">Comentarios <span style="color:var(--text-muted); font-weight:normal; margin-left:4px;">${comentarios.length}</span></div>
                <div style="display:flex; gap:16px; align-items:center; font-size:12px;">
                    <span style="color:var(--text-secondary); cursor:pointer; font-weight:500;">Todos</span>
                    <span style="color:var(--text-muted); cursor:pointer;">Internos</span>
                    <span style="color:var(--text-muted); cursor:pointer;">Visibles</span>
                    <button id="btn-add-comment-tab" class="btn btn-primary btn-sm" style="border-radius: 16px; font-size: 11px; padding: 4px 12px;">+ Agregar comentario</button>
                </div>
            </div>
        `;
        
        if(comentarios.length === 0) {
            html += `<p style="font-size: 13px; color: var(--text-muted); text-align:center; padding: 30px;">Sin comentarios registrados</p>`;
        } else {
            html += `<div style="display:flex; flex-direction:column; gap:12px;">`;
            comentarios.forEach((c, idx) => {
                const isInternal = !c.action.includes('Notificado');
                const badgeColor = isInternal ? '#f1f5f9' : '#dcfce7';
                const badgeTextColor = isInternal ? '#64748b' : '#166534';
                const borderColor = isInternal ? '#e2e8f0' : '#bbf7d0';
                const labelText = isInternal ? 'Interno' : 'Visible al asociado';
                html += `
                    <div style="border: 1px solid ${borderColor}; border-radius: 8px; padding: 16px; background: white;">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 12px; align-items:center;">
                            <div style="display:flex; gap:10px; align-items:center;">
                                <div style="width:30px; height:30px; border-radius:50%; background:#f1f5f9; color:#64748b; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:bold;">
                                    ${getInitials(c.user)}
                                </div>
                                <div>
                                    <div style="font-size:13px; font-weight:500; display:flex; align-items:center; gap:8px;">
                                        ${c.user} 
                                        <span style="background:${badgeColor}; color:${badgeTextColor}; padding:2px 8px; border-radius:12px; font-size:10px;">${labelText}</span>
                                    </div>
                                    <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                        ${App.formatDateTime(c.date)} &nbsp;&bull;&nbsp; IP: 190.24.135.78
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="font-size:13px; color:var(--text-primary); line-height:1.5;">
                            ${c.action.replace('Observación interna: ', '').replace(' (Notificado al asociado)', '')}
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }
        document.getElementById('tab-comentarios').innerHTML = html;
        document.querySelector('[data-tab="comentarios"] span').textContent = comentarios.length;

        // Focus text area when add comment is clicked
        setTimeout(() => {
            const btn = document.getElementById('btn-add-comment-tab');
            if(btn) btn.addEventListener('click', () => {
                const txtarea = document.querySelector('textarea[placeholder*="observacion interna"]');
                if(txtarea) {
                    txtarea.focus();
                    txtarea.scrollIntoView({behavior: "smooth", block: "center"});
                }
            });
        }, 0);
    }

    function renderHistorial() {
        let html = `
            <div style="margin-bottom: 20px;">
                <h4 style="font-size:14px; margin-bottom: 4px; display:flex; align-items:center; gap:6px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Línea de tiempo del caso
                </h4>
                <p style="font-size:11px; color:var(--text-muted); margin-bottom:16px;">${caso.history.length} eventos registrados &bull; Solo lectura</p>
                
                <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; margin-bottom: 16px;">
                    <span style="font-size:11px; background:var(--primary); color:white; padding:4px 12px; border-radius:16px; white-space:nowrap;">Todos ${caso.history.length}</span>
                    <span style="font-size:11px; border:1px solid var(--border-color); color:var(--text-secondary); padding:4px 12px; border-radius:16px; white-space:nowrap;">Creación 1</span>
                    <span style="font-size:11px; border:1px solid var(--border-color); color:var(--text-secondary); padding:4px 12px; border-radius:16px; white-space:nowrap;">Estado</span>
                </div>
            </div>
            
            <div style="position:relative; margin-left: 12px; border-left: 2px solid #e2e8f0; padding-left: 24px; display:flex; flex-direction:column; gap:20px;">
        `;
        
        caso.history.forEach(h => {
            let iconHtml = `<circle cx="12" cy="12" r="10"></circle>`;
            let color = '#3b82f6';
            let bg = '#eff6ff';
            let badgeText = h.action.includes('Reasignación') ? 'Reasignación' : 
                            h.action.includes('Prioridad') ? 'Prioridad' :
                            h.action.includes('estado') ? 'Estado' : 'Evento';

            if(badgeText === 'Reasignación') { color = '#a855f7'; bg = '#faf5ff'; iconHtml = `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>`; }
            else if(badgeText === 'Prioridad') { color = '#f59e0b'; bg = '#fffbeb'; iconHtml = `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>`; }
            
            html += `
                <div style="position:relative;">
                    <div style="position:absolute; left:-36px; top:0; width:22px; height:22px; border-radius:11px; background:white; border:2px solid ${color}; display:flex; align-items:center; justify-content:center; color:${color};">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconHtml}</svg>
                    </div>
                    <div style="border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px; background:white;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <span style="font-size:10px; font-weight:600; text-transform:uppercase; background:${color}; color:white; padding:2px 8px; border-radius:12px;">${badgeText}</span>
                            <span style="font-size:11px; color:var(--text-muted);">${App.formatDateTime(h.date)}</span>
                        </div>
                        <p style="font-size:13px; color:var(--text-primary); margin:0 0 8px 0;">${h.action}</p>
                        <div style="display:flex; align-items:center; gap:6px; font-size:11px; color:var(--text-muted);">
                            <div style="width:18px; height:18px; background:#f1f5f9; border-radius:9px; display:flex; align-items:center; justify-content:center; font-weight:bold;">${getInitials(h.user)}</div>
                            ${h.user}
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        document.getElementById('tab-historial').innerHTML = html;
        document.querySelector('[data-tab="historial"] span').textContent = caso.history.length;
    }

    function renderAdjuntos() {
        const renderDoc = (name, dname, ext, kb, date) => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border:1px solid var(--border-light); border-radius:8px; margin-bottom:10px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div style="width:36px; height:36px; background:var(--bg-light); border-radius:6px; display:flex; align-items:center; justify-content:center; color:var(--text-secondary);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    </div>
                    <div>
                        <div style="font-size:13px; font-weight:500;">${name}</div>
                        <div style="font-size:11px; color:var(--text-muted); display:flex; align-items:center; gap:6px;">
                            ${kb}KB &bull; ${ext} &bull; ${date} 
                            <span style="background:#eff6ff; color:#3b82f6; padding:0 4px; border-radius:4px; font-size:9px;">${dname}</span>
                        </div>
                    </div>
                </div>
                <button class="btn btn-secondary btn-sm" style="padding:4px 8px;">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </button>
            </div>
        `;
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                <div style="font-size:14px; font-weight:600;">Adjuntos <span style="color:var(--text-muted); font-weight:normal; margin-left:4px;">3</span></div>
                <div style="display:flex; gap:10px;">
                    <select class="form-control" style="font-size:11px; height:auto; padding:4px 8px;"><option>Todos los tipos</option></select>
                    <button id="btn-cargar-adjunto-tab" class="btn btn-primary btn-sm" style="border-radius: 16px; font-size: 11px; padding: 4px 12px;">+ Cargar adjunto</button>
                </div>
                <input type="file" id="file-adjunto-tab" style="display:none;" />
            </div>
        `;
        html += renderDoc('comprobante_pse_20260503.pdf', 'Registro inicial', 'PDF', '245.0', '04/05/2026 19:05');
        html += renderDoc('captura_transaccion.png', 'Registro inicial', 'PNG', '128.0', '04/05/2026 19:07');
        html += renderDoc('respuesta_pse_interbancaria.pdf', 'Gestión interna', 'PDF', '180.0', '05/05/2026 09:45');
        
        document.getElementById('tab-adjuntos').innerHTML = html;
        document.querySelector('[data-tab="adjuntos"] span').textContent = '3';

        setTimeout(() => {
            const btn = document.getElementById('btn-cargar-adjunto-tab');
            const fileInput = document.getElementById('file-adjunto-tab');
            if(btn && fileInput) {
                btn.addEventListener('click', () => fileInput.click());
                fileInput.addEventListener('change', (e) => {
                    if(e.target.files.length > 0) {
                        alert(`¡Adjunto simulado exitosamente!\n\nArchivo: ${e.target.files[0].name}`);
                        fileInput.value = ''; // Reset
                    }
                });
            }
        }, 0);
    }

    function renderRespuestas() {
        let html = `
            <div style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                <div style="background: var(--bg-light); padding: 12px 16px; font-size: 11px; font-weight: 600; color: var(--text-secondary); display:flex; align-items:center; gap:8px; border-bottom: 1px solid var(--border-light);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    REDACTAR RESPUESTA AL ASOCIADO
                </div>
                <div style="padding: 16px;">
                    <div style="display:grid; grid-template-columns: 80px 1fr; align-items:center; margin-bottom: 12px;">
                        <div style="font-size:11px; color:var(--text-muted); font-weight:600;">PARA</div>
                        <div style="font-size:13px; font-weight:500;">${caso.clientEmail}</div>
                    </div>
                    <div style="display:grid; grid-template-columns: 80px 1fr; align-items:center; margin-bottom: 16px;">
                        <div style="font-size:11px; color:var(--text-muted); font-weight:600;">ASUNTO</div>
                        <input type="text" class="form-control" value="Re: Caso FPQRS-${caso.id}" />
                    </div>
                    <textarea id="txt-respuesta-asoc" class="form-control" rows="5" placeholder="Escriba aquí la respuesta para el asociado..." style="margin-bottom: 16px;"></textarea>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <button class="btn btn-secondary btn-sm" style="background:none; border:none; box-shadow:none; display:flex; align-items:center; gap:6px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                            Adjuntar archivo
                        </button>
                        <button id="btn-enviar-respuesta" class="btn btn-primary" style="display:flex; align-items:center; gap:6px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            Enviar respuesta
                        </button>
                    </div>
                </div>
            </div>
            
            <h4 style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 12px;">RESPUESTAS ENVIADAS AL ASOCIADO</h4>
            <div id="respuestas-list"></div>
        `;
        
        document.querySelector('[data-tab-content="respuestas"]').innerHTML = html;

        // Render sent responses
        const respuestasEnviadas = caso.history.filter(h => h.action.includes('Respuesta enviada'));
        let resListHtml = '';
        if(respuestasEnviadas.length === 0) {
            resListHtml = `<p style="font-size: 13px; color: var(--text-muted);">Sin respuestas registradas</p>`;
        } else {
            respuestasEnviadas.forEach(r => {
                resListHtml += `
                <div style="background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 4px; padding: 12px 16px; border: 1px solid #bfdbfe; margin-bottom: 10px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
                        <strong style="font-size: 12px; color: #1e3a8a;">Respuesta enviada por ${r.user}</strong>
                        <span style="font-size: 11px; color: #60a5fa;">${App.formatDateTime(r.date)}</span>
                    </div>
                    <p style="font-size: 13px; color: #1e3a8a; margin:0;">${r.action.replace('Respuesta enviada: ', '')}</p>
                </div>`;
            });
        }
        document.getElementById('respuestas-list').innerHTML = resListHtml;

        setTimeout(() => {
            const btnSend = document.getElementById('btn-enviar-respuesta');
            if(btnSend) btnSend.addEventListener('click', () => {
                const txtArea = document.getElementById('txt-respuesta-asoc');
                const txt = txtArea.value.trim();
                
                if(!txt) return alert("Por favor redacte una respuesta antes de enviar.");
                
                caso.history.unshift({
                    date: new Date().toISOString(),
                    action: 'Respuesta enviada: ' + txt,
                    user: user.name
                });
                
                db.saveCase(caso);
                db.logAudit('Respuesta al asociado', `Caso ${caso.id}`);
                window.location.reload();
            });
        }, 0);
    }

    renderComentarios();
    renderHistorial();
    renderAdjuntos();
    renderRespuestas();

    // Estado Actual
    document.getElementById('estado-actual').innerHTML = `
        <h4 style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 12px;">ESTADO ACTUAL</h4>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="meta-label">Estado</span>
                <span class="badge ${badgeStatus(caso.status)}">${caso.status}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="meta-label">Prioridad</span>
                <span class="badge-priority ${badgePriority(caso.priority)}">${caso.priority}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="meta-label">Responsable</span>
                <span class="meta-val">${caso.responsible}</span>
            </div>
        </div>
    `;

    // Acciones
    const selectEstado = document.getElementById('select-estado');
    selectEstado.value = caso.status;
    selectEstado.addEventListener('change', (e) => {
        caso.status = e.target.value;
        caso.history.unshift({
            date: new Date().toISOString(),
            action: 'Cambio de estado a ' + caso.status,
            user: user.name
        });
        db.saveCase(caso);
        db.logAudit('Cambio de estado', `Caso ${caso.id} cambiado a ${caso.status}`);
        window.location.reload();
    });

    const selectPrioridad = document.getElementById('select-prioridad');
    const prioridadesList = (db.getParams() && db.getParams().priorities) ? db.getParams().priorities : ['Baja', 'Normal', 'Alta', 'Crítica'];
    selectPrioridad.innerHTML = prioridadesList.map(p => `<option value="${p}" ${caso.priority===p?'selected':''}>${p}</option>`).join('');
    selectPrioridad.addEventListener('change', (e) => {
        caso.priority = e.target.value;
        caso.history.unshift({
            date: new Date().toISOString(),
            action: 'Prioridad cambiada a ' + caso.priority,
            user: user.name
        });
        db.saveCase(caso);
        db.logAudit('Cambio de prioridad', `Caso ${caso.id} prioridad ${caso.priority}`);
        window.location.reload();
    });

    // Registrar observacion
    const txtObservacion = document.querySelector('textarea[placeholder*="observacion interna"]');
    const btnObservacion = Array.from(document.querySelectorAll('.btn-primary')).find(btn => btn.textContent.includes('Registrar'));
    const chkNotificar = document.querySelector('input[type="checkbox"]');
    
    if(btnObservacion && txtObservacion) {
        btnObservacion.addEventListener('click', () => {
            const text = txtObservacion.value.trim();
            if(!text) {
                alert('Por favor escriba una observación antes de registrar.');
                return;
            }
            const notifiedMsg = (chkNotificar && chkNotificar.checked) ? ' (Notificado al asociado)' : '';
            
            caso.history.unshift({
                date: new Date().toISOString(),
                action: 'Observación interna: ' + text + notifiedMsg,
                user: user.name
            });
            db.saveCase(caso);
            db.logAudit('Observación registrada', `Caso ${caso.id}`);
            window.location.reload();
        });
    }

    // Cerrar
    document.getElementById('btn-cerrar-caso').addEventListener('click', () => {
        if(confirm('¿Está seguro de cerrar este caso?')) {
            caso.status = 'Cerrado';
            caso.history.unshift({ date: new Date().toISOString(), action: 'Cierre del caso', user: user.name });
            db.saveCase(caso);
            db.logAudit('Cierre de caso', caso.id);
            window.location.reload();
        }
    });

    // Modal Reasignar Logic
    const btnOpenReasigTop = document.getElementById('btn-open-reasignar-top');
    const btnOpenReasigSide = document.getElementById('btn-open-reasignar-side');
    
    if(btnOpenReasigTop || btnOpenReasigSide) {
        const titleRef = document.getElementById('modal-reasig-subtitle');
        const currRespRef = document.getElementById('modal-reasig-current');
        const selectNewOp = document.getElementById('select-nuevo-operador');
        const btnConfirmReasig = document.getElementById('btn-confirmar-reasignar');

        if(titleRef) titleRef.textContent = `Transfiera la responsabilidad del caso ${caso.id} a otro operador activo`;
        if(currRespRef) currRespRef.textContent = caso.responsible;
        
        if(selectNewOp) {
            const opers = db.getOperadores ? db.getOperadores() : [];
            const opsHtml = opers.filter(o => o !== caso.responsible).map(o => `<option value="${o}">${o}</option>`).join('');
            selectNewOp.innerHTML += opsHtml;
        }

        const openModalFn = () => {
            if(window.App && App.showModal) App.showModal('modal-reasignar');
            else document.getElementById('modal-reasignar').classList.add('show'); 
        };

        if(btnOpenReasigTop) btnOpenReasigTop.addEventListener('click', openModalFn);
        if(btnOpenReasigSide) btnOpenReasigSide.addEventListener('click', openModalFn);

        if(btnConfirmReasig) {
            btnConfirmReasig.addEventListener('click', () => {
                const nvaOp = selectNewOp.value;
                if(!nvaOp) {
                    alert('Debe seleccionar un operador para reasignar el caso.');
                    return;
                }
                const comment = document.getElementById('txt-reasignar-comentario').value.trim();
                
                caso.responsible = nvaOp;
                caso.status = 'Asignado'; 
                
                let historyMsg = `Reasignación a ${nvaOp}`;
                if(comment) historyMsg += ` - Motivo: ${comment}`;
                
                caso.history.unshift({
                    date: new Date().toISOString(),
                    action: historyMsg,
                    user: user.name
                });
                
                db.saveCase(caso);
                db.logAudit('Reasignación manual', `Caso ${caso.id} transferido a ${nvaOp}`);
                
                if(window.App && App.hideModal) App.hideModal('modal-reasignar');
                window.location.reload();
            });
        }
        
        // Handle cancel buttons natively built in main.js closing loops
        const cancelBtn = document.querySelector('#modal-reasignar .modal-close-btn');
        if(cancelBtn) cancelBtn.addEventListener('click', () => {
            if(window.App && App.hideModal) App.hideModal('modal-reasignar');
            else document.getElementById('modal-reasignar').classList.remove('show');
        });
    }

    // Añadir CSS extra para meta-label y meta-val
    const style = document.createElement('style');
    style.innerHTML = `
        .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 4px; }
        .meta-val { font-size: 13px; font-weight: 500; }
    `;
    document.head.appendChild(style);
});
