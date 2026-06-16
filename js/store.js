// store.js — Base de datos simulada (localStorage) con datos realistas

const STORE_KEY_USERS = 'fpqrs_users';
const STORE_KEY_CASES = 'fpqrs_cases';
const STORE_KEY_AUDIT = 'fpqrs_audit';
const STORE_KEY_PARAMS = 'fpqrs_params';

const seedUsers = [
  { id: 1, email: 'admin@coopfinanzas.com.co', password: 'Admin@2026!', role: 'Administrador', name: 'Sofía Martínez' },
  { id: 2, email: 'operador@coopfinanzas.com.co', password: 'Oper@2026!', role: 'Operador', name: 'Carlos Rendón' },
  { id: 3, email: 'supervisor@coopfinanzas.com.co', password: 'Super@2026!', role: 'Supervisor', name: 'Ana Silva' }
];

const seedServices = [
  { id: 'SRV01', name: 'Crédito', desc: 'Productos de financiamiento para asociados: consumo, vivienda, empresarial', active: true },
  { id: 'SRV02', name: 'Ahorro y Captación', desc: 'Cuentas de ahorro, CDT y depósitos a término', active: true },
  { id: 'SRV03', name: 'Canales Digitales', desc: 'App móvil, portal web, banca virtual y cajeros', active: true },
  { id: 'SRV04', name: 'Atención al Asociado', desc: 'Servicio presencial, telefónico y virtual en oficinas', active: true },
  { id: 'SRV05', name: 'Pagos y Transferencias', desc: 'PSE, pagos de servicios públicos y transferencias interbancarias', active: true },
  { id: 'SRV06', name: 'Seguros y Protección', desc: 'Seguros de vida, hogar, desempleo y protección financiera', active: true },
  { id: 'SRV07', name: 'Inversiones', desc: 'Portafolios de inversión, fondos y rentabilidades', active: true },
  { id: 'SRV08', name: 'Centrales de Riesgo', desc: 'Reporte, corrección y consulta en centrales de riesgo', active: true },
  { id: 'SRV09', name: 'Educación Cooperativa', desc: 'Programas de educación financiera y cooperativa para asociados', active: true },
  { id: 'SRV10', name: 'Vinculación y Retiro', desc: 'Procesos de ingreso, actualización de datos y retiro de asociados', active: true },
  { id: 'SRV11', name: 'Cartera y Cobranza', desc: 'Gestión de mora, acuerdos de pago y reestructuración', active: true },
  { id: 'SRV12', name: 'Certificaciones y Documentos', desc: 'Emisión de certificados tributarios, extractos y constancias', active: true }
];

const seedCategories = [
  { id: 'CAT01', name: 'Atención Presencial', serviceId: 'SRV04', desc: 'Servicio en oficinas y puntos de atención' },
  { id: 'CAT02', name: 'Transferencias Nacionales', serviceId: 'SRV05' },
  { id: 'CAT03', name: 'App Móvil', serviceId: 'SRV03', desc: 'Aplicación móvil cooperativa iOS y Android' },
  { id: 'CAT04', name: 'Atención Virtual', serviceId: 'SRV04' },
  { id: 'CAT05', name: 'Portal Web', serviceId: 'SRV03' },
  { id: 'CAT06', name: 'CDT', serviceId: 'SRV02' },
  { id: 'CAT07', name: 'Refinanciación de Crédito', serviceId: 'SRV01' },
  { id: 'CAT08', name: 'Reestructuración de Crédito', serviceId: 'SRV11' },
  { id: 'CAT09', name: 'Crédito de Consumo', serviceId: 'SRV01', desc: 'Créditos personales y libre inversión' },
  { id: 'CAT10', name: 'Cuenta de Ahorro', serviceId: 'SRV02' },
  { id: 'CAT11', name: 'Pago PSE', serviceId: 'SRV05', desc: 'Pagos y débitos a través de PSE' },
  { id: 'CAT12', name: 'Crédito de Vivienda', serviceId: 'SRV01', desc: 'Financiamiento de vivienda y ...' },
  { id: 'CAT13', name: 'Crédito Empresarial', serviceId: 'SRV01', desc: 'Líneas de crédito para microe...' },
  { id: 'CAT14', name: 'Crédito Educativo', serviceId: 'SRV01', desc: 'Financiamiento de estudios y ...' }
];

const operadores = [
  'Valentina Ospina Ríos', 'Jorge Iván Castillo', 'Iván Darío Zapata',
  'Patricia Inés Agudelo', 'Diana Carolina Ríos', 'Camilo Ernesto Herrera',
  'Adriana Milena Cortés', 'Carlos Andrés Moreno', 'Marcela Suárez Peña',
  'Rodrigo Esteban Muñoz', 'Beatriz Elena Montoya', 'Luisa Fernanda Vargas',
  'Hernando José Quiroz', 'Esperanza del Carmen', 'Andrés Felipe Gómez',
  'Sandra Milena Aguirre T.', 'Yolanda Cecilia Prada', 'Patricia Inés Londoño V.'
];

const gruposArea = [
  'Servicio al Asociado', 'Captación y Ahorro', 'Cartera y Crédito',
  'Red de Oficinas', 'Tecnología e Innovación', 'Operaciones Financieras', 'Contabilidad'
];

const subcategorias = [
  'Felicitación por exc...', 'Comprobante de tr...', 'Sugerencia de nuev...',
  'Chat sin respuesta ...', 'Sugerencia de mej...', 'Error en tasa de CDT',
  'Inconformidad con ...', 'Demora en proces...', 'Solicitud de refina...',
  'Saldo incorrecto en...', 'Pago PSE no acreditado en destino',
  'Descuento no reconocido en cuota'
];

const tipos = ['Felicitación', 'Petición', 'Queja', 'Reclamo', 'Sugerencia'];
const estados = ['Radicado', 'Asignado', 'En Gestión', 'Pendiente de Información', 'Respondido', 'Cerrado', 'Reabierto', 'Anulado'];
const prioridades = ['Baja', 'Normal', 'Alta', 'Crítica'];
const canales = ['Portal Web', 'App Móvil', 'Oficina', 'Teléfono', 'Correo'];

function generateCases() {
  const cases = [];
  const totalCases = 205;
  for (let i = 0; i < totalCases; i++) {
    const num = String(4782 - i * Math.floor(Math.random() * 30 + 5)).padStart(5, '0');
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    const srv = seedServices[Math.floor(Math.random() * seedServices.length)];
    const cat = seedCategories.filter(c => c.serviceId === srv.id);
    const catObj = cat.length > 0 ? cat[Math.floor(Math.random() * cat.length)] : seedCategories[0];
    const subcat = subcategorias[Math.floor(Math.random() * subcategorias.length)];
    const resp = operadores[Math.floor(Math.random() * operadores.length)];
    const grupo = gruposArea[Math.floor(Math.random() * gruposArea.length)];
    const prio = prioridades[Math.floor(Math.random() * prioridades.length)];
    const estado = estados[Math.floor(Math.random() * estados.length)];

    const dayOffset = Math.floor(i / 5) * 1;
    const baseDate = new Date(2026, 4, 7);
    baseDate.setDate(baseDate.getDate() - dayOffset);
    const dateStr = baseDate.toISOString().split('T')[0];

    const slaHours = prio === 'Crítica' ? 4 : prio === 'Alta' ? 24 : prio === 'Normal' ? 48 : 72;
    const slaDate = new Date(baseDate);
    slaDate.setHours(slaDate.getHours() + slaHours);

    const asociados = [
      'Sandra Milena Aguirre T.', 'Yolanda Cecilia Prada ...', 'Andrés Camilo Rojas V...',
      'Patricia Inés Agudelo', 'Patricia Inés Londoño V...', 'Diana Marcela Ríos Cas...',
      'Beatriz Elena Montoya ...', 'Hernán Darío Quintero ...', 'Jorge Luis Patiño Restrepo',
      'Carlos Enrique Gómez', 'Marcela Suárez Peña', 'Luis Alberto Castaño'
    ];
    const asoc = asociados[Math.floor(Math.random() * asociados.length)];

    cases.push({
      id: `FPQRS-2026-${num}`,
      type: tipo,
      service: srv.name,
      serviceId: srv.id,
      category: catObj.name,
      categoryId: catObj.id,
      subcategory: subcat,
      client: asoc,
      clientEmail: 'jl.patino@empresa.com.co',
      clientDoc: 'CC ' + Math.floor(10000000 + Math.random() * 90000000),
      clientPhone: '320' + Math.floor(1000000 + Math.random() * 9000000),
      clientAddress: 'Av El Poblado #12-45, Medellín',
      date: dateStr + 'T' + String(Math.floor(Math.random()*24)).padStart(2,'0') + ':00:00Z',
      status: estado,
      slaDate: slaDate.toISOString(),
      priority: prio,
      description: 'Pago PSE por $2.350.000 al banco Davivienda no fue acreditado. Código: PSE-20260503-8847.',
      responsible: resp,
      group: grupo,
      channel: canales[Math.floor(Math.random() * canales.length)],
      typeCause: 'Falla en pasarela de pago PSE',
      slaApplied: slaHours + 'h',
      history: [
        { date: dateStr + 'T10:30:00Z', action: 'Caso radicado en el sistema', user: 'Sistema' },
        { date: dateStr + 'T11:00:00Z', action: 'Asignado a ' + resp, user: 'Sofía Martínez' }
      ]
    });
  }
  return cases;
}

const seedAudit = [
  { date: '2026-05-07T03:41:00Z', icon: 'fa-download', color: '#3b82f6', action: 'Exportación de reporte de cumplimiento', category: 'Cumplimiento', severity: 'Info', user: 'Álvaro Hernán Castaño', target: 'Reporte SLA Q1-2026' },
  { date: '2026-05-07T03:35:00Z', icon: 'fa-exchange-alt', color: '#f59e0b', action: 'Cambio de prioridad de caso', category: 'Modificación de Caso', severity: 'Alerta', user: 'Valentina Ospina Ríos', target: 'FPQRS-2026-0042' },
  { date: '2026-05-07T03:28:00Z', icon: 'fa-sign-in-alt', color: '#10b981', action: 'Inicio de sesión', category: 'Historial de Acceso', severity: 'Info', user: 'Natalia Johanna Pardo', target: 'Sistema GestorFPQRS' },
  { date: '2026-05-07T03:15:00Z', icon: 'fa-random', color: '#8b5cf6', action: 'Reasignación de caso', category: 'Modificación de Caso', severity: 'Info', user: 'Jorge Iván Castillo', target: 'FPQRS-2026-0038' },
  { date: '2026-05-07T02:58:00Z', icon: 'fa-eye', color: '#6366f1', action: 'Consulta de expediente de caso', category: 'Acción de Usuario', severity: 'Info', user: 'Yolanda Beatriz Soto', target: 'FPQRS-2026-0031' },
  { date: '2026-05-07T02:44:00Z', icon: 'fa-exclamation-triangle', color: '#ef4444', action: 'Vencimiento de SLA detectado', category: 'Cumplimiento', severity: 'Crítico', user: 'Sistema Automático', target: 'FPQRS-2026-0029' },
  { date: '2026-05-07T02:30:00Z', icon: 'fa-arrow-right', color: '#3b82f6', action: 'Cambio de estado de caso', category: 'Modificación de Caso', severity: 'Info', user: 'Luisa Fernanda Vargas', target: 'FPQRS-2026-0025' },
  { date: '2026-05-07T02:15:00Z', icon: 'fa-key', color: '#6366f1', action: 'Acceso a módulo de parametrización', category: 'Historial de Acceso', severity: 'Info', user: 'Gustavo Adolfo Ramírez', target: 'Módulo Parametrización' },
  { date: '2026-05-07T02:00:00Z', icon: 'fa-pen', color: '#6366f1', action: 'Modificación de subcategoría', category: 'Acción de Usuario', severity: 'Alerta', user: 'Gustavo Adolfo Ramírez', target: 'Subcategoría: Débito no autorizado' },
  { date: '2026-05-07T01:45:00Z', icon: 'fa-sign-out-alt', color: '#3b82f6', action: 'Cierre de sesión', category: 'Historial de Acceso', severity: 'Info', user: 'Marcela Suárez Peña', target: 'Sistema GestorFPQRS' },
  { date: '2026-05-07T01:30:00Z', icon: 'fa-chart-pie', color: '#6366f1', action: 'Generación de reporte de auditoría', category: 'Cumplimiento', severity: 'Info', user: 'Álvaro Hernán Castaño', target: 'Reporte Auditoría Mayo 2026' },
  { date: '2026-05-07T01:10:00Z', icon: 'fa-check-circle', color: '#10b981', action: 'Cierre de caso', category: 'Modificación de Caso', severity: 'Info', user: 'Andrés Felipe Gómez', target: 'FPQRS-2026-0020' },
  { date: '2026-05-07T00:55:00Z', icon: 'fa-exclamation-triangle', color: '#ef4444', action: 'Intento de acceso fallido', category: 'Historial de Acceso', severity: 'Crítico', user: 'Usuario desconocido', target: 'Sistema GestorFPQRS' },
  { date: '2026-05-07T00:40:00Z', icon: 'fa-file-download', color: '#6366f1', action: 'Descarga de expediente', category: 'Acción de Usuario', severity: 'Alerta', user: 'Oswaldo Enrique Pineda', target: 'FPQRS-2026-0015' },
  { date: '2026-05-07T00:20:00Z', icon: 'fa-exclamation-triangle', color: '#f59e0b', action: 'Alerta de caso sin asignar', category: 'Cumplimiento', severity: 'Alerta', user: 'Sistema Automático', target: 'FPQRS-2026-0048' },
  { date: '2026-05-06T23:50:00Z', icon: 'fa-sign-in-alt', color: '#3b82f6', action: 'Inicio de sesión', category: 'Acción de Usuario', severity: 'Info', user: 'Sofía Martínez', target: 'Sistema GestorFPQRS' },
  { date: '2026-05-06T23:30:00Z', icon: 'fa-comment', color: '#6366f1', action: 'Adición de comentario interno', category: 'Modificación de Caso', severity: 'Info', user: 'Diana Carolina Ríos', target: 'FPQRS-2026-0011' },
  { date: '2026-05-06T23:10:00Z', icon: 'fa-file-csv', color: '#3b82f6', action: 'Exportación de datos CSV', category: 'Historial de Acceso', severity: 'Info', user: 'Natalia Johanna Pardo', target: 'Módulo Exportar Casos' }
];

function initStore() {
  if (!localStorage.getItem(STORE_KEY_USERS)) localStorage.setItem(STORE_KEY_USERS, JSON.stringify(seedUsers));
  if (!localStorage.getItem(STORE_KEY_CASES)) localStorage.setItem(STORE_KEY_CASES, JSON.stringify(generateCases()));
  if (!localStorage.getItem(STORE_KEY_AUDIT)) localStorage.setItem(STORE_KEY_AUDIT, JSON.stringify(seedAudit));
  if (!localStorage.getItem(STORE_KEY_PARAMS)) localStorage.setItem(STORE_KEY_PARAMS, JSON.stringify({ services: seedServices, categories: seedCategories, types: tipos, priorities: prioridades, statuses: estados }));
}

const db = {
  getUsers: () => JSON.parse(localStorage.getItem(STORE_KEY_USERS)),
  getOperadores: () => operadores,
  getCases: () => JSON.parse(localStorage.getItem(STORE_KEY_CASES)).sort((a,b) => new Date(b.date) - new Date(a.date)),
  getCaseById: (id) => { const cs = JSON.parse(localStorage.getItem(STORE_KEY_CASES)); return cs.find(c => c.id === id); },
  saveCase: (caseObj) => { const cs = JSON.parse(localStorage.getItem(STORE_KEY_CASES)); const i = cs.findIndex(c => c.id === caseObj.id); if(i>=0) cs[i]=caseObj; else cs.push(caseObj); localStorage.setItem(STORE_KEY_CASES, JSON.stringify(cs)); },
  getParams: () => JSON.parse(localStorage.getItem(STORE_KEY_PARAMS)),
  getServices: () => seedServices,
  getCategoriesForService: (srvName) => seedCategories.filter(c => { const s = seedServices.find(sv => sv.name === srvName); return s && c.serviceId === s.id; }),
  
  login: (email, pwd) => { const u = seedUsers.find(x => x.email === email); if(u){ sessionStorage.setItem('currentUser', JSON.stringify(u)); return true; } return false; },
  logout: () => { sessionStorage.removeItem('currentUser'); window.location.href = 'index.html'; },
  getCurrentUser: () => { const s = sessionStorage.getItem('currentUser'); return s ? JSON.parse(s) : null; },

  createCase: (type, service, category, clientName, clientDoc, clientEmail, desc, channel) => {
    const num = String(Math.floor(Math.random()*90000)+10000).padStart(5,'0');
    const newCase = {
      id: 'FPQRS-2026-' + num, type, service, category, subcategory: '',
      client: clientName, clientDoc, clientEmail, clientPhone: '', clientAddress: '',
      date: new Date().toISOString(), status: 'Radicado',
      slaDate: new Date(Date.now() + 72*3600000).toISOString(),
      priority: 'Normal', description: desc, responsible: operadores[Math.floor(Math.random()*operadores.length)],
      group: gruposArea[0], channel: channel || 'Portal Web',
      history: [{ date: new Date().toISOString(), action: 'Caso radicado', user: 'Sistema' }]
    };
    db.saveCase(newCase);
    db.logAudit('Radicación de caso', newCase.id);
    return newCase;
  },

  logAudit: (action, desc) => {
    let logs = JSON.parse(localStorage.getItem(STORE_KEY_AUDIT) || '[]');
    const u = db.getCurrentUser();
    logs.unshift({ date: new Date().toISOString(), icon: 'fa-plus', color: '#3b82f6', action, category: 'Acción de Usuario', severity: 'Info', user: u ? u.name : 'Sistema', target: desc });
    localStorage.setItem(STORE_KEY_AUDIT, JSON.stringify(logs));
  },
  getAuditLogs: () => JSON.parse(localStorage.getItem(STORE_KEY_AUDIT) || '[]'),

  resetData: () => { localStorage.clear(); initStore(); }
};

initStore();
