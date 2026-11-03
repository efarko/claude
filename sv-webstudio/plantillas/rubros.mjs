// Textos y colores por rubro. Cada cliente puede reemplazar cualquier parte desde su JSON.
// {nombre} y {distrito} se reemplazan con los datos del cliente. Nada de cifras, años o testimonios inventados.

export const RUBROS = {
  'casa-reposo': {
    colores: { tinta: '#1d2b29', fondo: '#f6f3ee', marca: '#2f7a6d', marca2: '#225c52', acento: '#d98a4e', suave: '#e5efe9' },
    hero: {
      eyebrow: 'Casa de reposo en {distrito}',
      titulo: 'Cuidamos a su familiar <em>como en casa</em>',
      lead: 'Atención las 24 horas, enfermería, alimentación balanceada y actividades para que su ser querido esté acompañado, seguro y tranquilo. Venga a conocernos o escríbanos para coordinar una visita.',
      badges: ['Atención 24 horas', 'Personal de enfermería', 'Visitas coordinadas con la familia'],
      tarjeta: {
        titulo: '¿Qué necesita su familiar?',
        items: [
          { icono: 'heart', t: 'Cuidado permanente', d: 'residencia con atención de día y de noche' },
          { icono: 'clock', t: 'Estadía temporal', d: 'mientras la familia viaja o se recupera' },
          { icono: 'pulse', t: 'Recuperación', d: 'después de una operación o una caída' },
          { icono: 'users', t: 'Compañía y actividades', d: 'para que no pase los días solo' },
        ],
      },
    },
    servicios: {
      titulo: 'Lo que hacemos por su familiar',
      lead: 'Cada residente tiene un plan de cuidado según su salud y su forma de ser. La familia siempre sabe cómo está.',
      items: [
        { icono: 'pulse', t: 'Enfermería', d: 'Control de presión, glucosa y medicamentos a sus horas.', b: ['Medicación según receta', 'Control diario de signos', 'Coordinación con su médico'] },
        { icono: 'food', t: 'Alimentación', d: 'Comidas balanceadas y dietas especiales cuando el médico lo indica.', b: ['Desayuno, almuerzo y cena', 'Dietas para diabetes o presión', 'Refrigerios'] },
        { icono: 'walk', t: 'Terapia y actividades', d: 'Ejercicios, juegos de memoria y momentos para compartir.', b: ['Terapia física', 'Estimulación de la memoria', 'Paseos y celebraciones'] },
        { icono: 'home', t: 'Higiene y descanso', d: 'Habitaciones limpias, aseo personal y lavandería.', b: ['Habitaciones cómodas', 'Aseo diario', 'Lavandería incluida'] },
      ],
    },
    destacado: {
      eyebrow: 'Antes de decidir',
      titulo: 'Venga a conocer la casa sin compromiso',
      texto: 'Sabemos que es una decisión importante. Le mostramos las habitaciones, le presentamos al equipo y resolvemos todas sus dudas en persona.',
      lista: ['Coordine su visita por WhatsApp', 'Conozca las habitaciones y áreas comunes', 'Converse con el equipo que cuidará a su familiar', 'Reciba la propuesta según lo que necesita'],
    },
    pasos: [
      { t: 'Escríbanos por WhatsApp', d: 'Cuéntenos sobre su familiar y lo que necesita.' },
      { t: 'Visítenos', d: 'Conozca la casa y al equipo, sin compromiso.' },
      { t: 'Ingreso tranquilo', d: 'Preparamos todo para que su familiar se adapte bien.' },
    ],
    faq: [
      { q: '¿Pueden visitarlo los familiares?', a: 'Sí. Coordinamos los horarios de visita con la familia para que puedan acompañarlo seguido.' },
      { q: '¿Atienden a personas con enfermedades crónicas?', a: 'Sí. Cuéntenos su diagnóstico y sus medicamentos, y le explicamos cómo lo cuidaríamos.' },
      { q: '¿Tienen estadías temporales?', a: 'Sí, por días, semanas o meses, según lo que necesite la familia.' },
    ],
    cta: { titulo: '¿Quiere conocer la casa?', texto: 'Escríbanos y coordinamos su visita. Respondemos el mismo día.' },
    waTexto: 'Hola, quisiera información sobre la casa de reposo',
  },

  dental: {
    colores: { tinta: '#0d2236', fondo: '#f4f8fb', marca: '#1f7ae0', marca2: '#155bb0', acento: '#18b6a8', suave: '#e3f0fc' },
    hero: {
      eyebrow: 'Clínica dental en {distrito}',
      titulo: 'Una sonrisa sana, <em>sin miedo al dentista</em>',
      lead: 'Atención dental para toda la familia, con explicaciones claras y presupuesto antes de empezar. Pida su cita por WhatsApp en un minuto.',
      badges: ['Presupuesto antes de empezar', 'Atención para niños y adultos', 'Citas por WhatsApp'],
      tarjeta: {
        titulo: '¿Qué le está pasando?',
        items: [
          { icono: 'bolt', t: 'Me duele una muela', d: 'lo atendemos lo antes posible' },
          { icono: 'sparkle', t: 'Quiero dientes más blancos', d: 'limpieza y blanqueamiento' },
          { icono: 'tooth', t: 'Me falta una pieza', d: 'prótesis e implantes' },
          { icono: 'smile', t: 'Quiero alinear mis dientes', d: 'ortodoncia' },
        ],
      },
    },
    servicios: {
      titulo: 'Tratamientos',
      lead: 'Le explicamos cada tratamiento, cuánto dura y cuánto cuesta antes de empezar.',
      items: [
        { icono: 'tooth', t: 'Odontología general', d: 'Evaluación, curaciones y limpieza.', b: ['Limpieza dental', 'Curaciones', 'Extracciones'] },
        { icono: 'smile', t: 'Ortodoncia', d: 'Brackets y alineadores para niños y adultos.', b: ['Brackets', 'Alineadores', 'Controles mensuales'] },
        { icono: 'sparkle', t: 'Estética dental', d: 'Blanqueamiento y carillas.', b: ['Blanqueamiento', 'Carillas', 'Diseño de sonrisa'] },
        { icono: 'shield', t: 'Prótesis e implantes', d: 'Recupere las piezas que le faltan.', b: ['Implantes', 'Coronas', 'Prótesis'] },
      ],
    },
    destacado: {
      eyebrow: 'Su primera cita',
      titulo: 'Sabrá qué tiene y cuánto cuesta antes de empezar',
      texto: 'En la primera consulta revisamos su boca, le explicamos lo que encontramos y le damos un presupuesto por escrito. Usted decide con calma.',
      lista: ['Evaluación completa', 'Explicación clara de lo que necesita', 'Presupuesto por escrito', 'Plan de citas a su medida'],
    },
    pasos: [
      { t: 'Pida su cita por WhatsApp', d: 'Díganos qué le pasa y qué día le acomoda.' },
      { t: 'Evaluación', d: 'Revisamos y le explicamos el tratamiento.' },
      { t: 'Tratamiento', d: 'Empezamos solo cuando usted está de acuerdo.' },
    ],
    faq: [
      { q: '¿Atienden a niños?', a: 'Sí. Atendemos a toda la familia, con paciencia para los más pequeños.' },
      { q: '¿Puedo pagar en partes?', a: 'Para tratamientos largos, como ortodoncia, coordinamos pagos por cita. Consúltenos por WhatsApp.' },
      { q: '¿Atienden urgencias?', a: 'Si tiene dolor, escríbanos y le damos la primera cita disponible.' },
    ],
    cta: { titulo: '¿Le damos una cita?', texto: 'Escríbanos por WhatsApp y le confirmamos el horario.' },
    waTexto: 'Hola, quisiera pedir una cita',
  },

  fisioterapia: {
    colores: { tinta: '#132a24', fondo: '#f4f8f6', marca: '#1f9d77', marca2: '#16765a', acento: '#3b82f6', suave: '#def2ea' },
    hero: {
      eyebrow: 'Fisioterapia y rehabilitación en {distrito}',
      titulo: 'Vuelva a moverse <em>sin dolor</em>',
      lead: 'Terapia física para dolores de espalda, lesiones, recuperación después de una operación y más. Evaluamos su caso y le armamos un plan de sesiones.',
      badges: ['Evaluación personalizada', 'Plan de sesiones claro', 'Citas por WhatsApp'],
      tarjeta: {
        titulo: '¿Dónde le duele?',
        items: [
          { icono: 'spine', t: 'Espalda y cuello', d: 'lumbalgia, contracturas, hernias' },
          { icono: 'walk', t: 'Rodilla, tobillo o cadera', d: 'esguinces y desgaste' },
          { icono: 'bolt', t: 'Lesión deportiva', d: 'para volver a entrenar' },
          { icono: 'pulse', t: 'Después de una operación', d: 'rehabilitación paso a paso' },
        ],
      },
    },
    servicios: {
      titulo: 'Cómo le ayudamos',
      lead: 'Cada sesión tiene un objetivo. Le decimos cuántas sesiones necesita y qué ejercicios hacer en casa.',
      items: [
        { icono: 'spine', t: 'Terapia del dolor', d: 'Alivio del dolor de espalda, cuello y articulaciones.', b: ['Terapia manual', 'Electroterapia', 'Ejercicios guiados'] },
        { icono: 'pulse', t: 'Rehabilitación', d: 'Recuperación después de fracturas u operaciones.', b: ['Plan por etapas', 'Fortalecimiento', 'Control de avances'] },
        { icono: 'bolt', t: 'Lesiones deportivas', d: 'Para volver a su deporte sin recaer.', b: ['Esguinces y desgarros', 'Readaptación', 'Prevención'] },
        { icono: 'home', t: 'Terapia a domicilio', d: 'Para quienes no pueden movilizarse.', b: ['Adultos mayores', 'Post operatorio', 'Horarios flexibles'] },
      ],
    },
    destacado: {
      eyebrow: 'Primera sesión',
      titulo: 'Empezamos entendiendo su caso',
      texto: 'Revisamos su historia, evaluamos el movimiento y le explicamos qué está pasando. Con eso armamos un plan con un número claro de sesiones.',
      lista: ['Evaluación del dolor y del movimiento', 'Plan de sesiones por escrito', 'Ejercicios para hacer en casa', 'Control de avances en cada cita'],
    },
    pasos: [
      { t: 'Escríbanos por WhatsApp', d: 'Cuéntenos qué le duele y desde cuándo.' },
      { t: 'Evaluación', d: 'Vemos su caso y le proponemos un plan.' },
      { t: 'Sesiones', d: 'Avanzamos juntos hasta que se sienta bien.' },
    ],
    faq: [
      { q: '¿Necesito orden médica?', a: 'No es obligatoria. Si la tiene, tráigala; nos ayuda a planificar mejor.' },
      { q: '¿Cuántas sesiones voy a necesitar?', a: 'Depende de su caso. Se lo decimos en la evaluación, antes de empezar.' },
      { q: '¿Atienden a domicilio?', a: 'Sí, coordinamos visitas según la zona y el horario.' },
    ],
    cta: { titulo: '¿Empezamos su recuperación?', texto: 'Escríbanos y le damos el primer horario disponible.' },
    waTexto: 'Hola, quisiera una cita de terapia',
  },

  veterinaria: {
    colores: { tinta: '#2a1d14', fondo: '#fbf6f1', marca: '#e0692d', marca2: '#b84f1c', acento: '#2a9d8f', suave: '#fbe7da' },
    hero: {
      eyebrow: 'Veterinaria en {distrito}',
      titulo: 'Cuidamos a su mascota <em>como parte de la familia</em>',
      lead: 'Consultas, vacunas, baño y más para perros y gatos. Escríbanos por WhatsApp y le damos cita.',
      badges: ['Perros y gatos', 'Vacunas y desparasitación', 'Citas por WhatsApp'],
      tarjeta: {
        titulo: '¿Qué necesita su mascota?',
        items: [
          { icono: 'pulse', t: 'Está enferma', d: 'consulta y diagnóstico' },
          { icono: 'shield', t: 'Le tocan sus vacunas', d: 'calendario completo' },
          { icono: 'sparkle', t: 'Baño y corte', d: 'grooming con cariño' },
          { icono: 'paw', t: 'Control y chequeo', d: 'para que siga sana' },
        ],
      },
    },
    servicios: {
      titulo: 'Servicios',
      lead: 'Atención con paciencia y explicaciones claras para usted.',
      items: [
        { icono: 'pulse', t: 'Consulta veterinaria', d: 'Revisión completa y diagnóstico.', b: ['Perros y gatos', 'Diagnóstico claro', 'Receta y seguimiento'] },
        { icono: 'shield', t: 'Vacunas', d: 'Su calendario de vacunas al día.', b: ['Cachorros y adultos', 'Desparasitación', 'Carné de vacunas'] },
        { icono: 'sparkle', t: 'Baño y grooming', d: 'Baño, corte y limpieza.', b: ['Baño medicado', 'Corte de raza', 'Corte de uñas'] },
        { icono: 'paw', t: 'Cirugías y esterilización', d: 'Procedimientos con cuidado y control.', b: ['Esterilización', 'Evaluación previa', 'Control post operatorio'] },
      ],
    },
    destacado: {
      eyebrow: 'Su primera visita',
      titulo: 'Conocemos a su mascota antes de tratarla',
      texto: 'En la consulta revisamos su historia, sus vacunas y su peso. Le explicamos todo y le damos indicaciones claras para la casa.',
      lista: ['Revisión completa', 'Calendario de vacunas', 'Indicaciones para la casa', 'Recordatorio de su próximo control'],
    },
    pasos: [
      { t: 'Escríbanos por WhatsApp', d: 'Cuéntenos qué le pasa a su mascota.' },
      { t: 'Consulta', d: 'La revisamos y le explicamos el tratamiento.' },
      { t: 'Seguimiento', d: 'Le recordamos sus controles y vacunas.' },
    ],
    faq: [
      { q: '¿Atienden gatos?', a: 'Sí, atendemos perros y gatos.' },
      { q: '¿Necesito cita para el baño?', a: 'Sí, escríbanos por WhatsApp y le damos el horario.' },
      { q: '¿Qué hago si es una urgencia?', a: 'Escríbanos o llámenos de inmediato para decirle cómo proceder.' },
    ],
    cta: { titulo: '¿Le damos una cita?', texto: 'Escríbanos por WhatsApp y le confirmamos el horario.' },
    waTexto: 'Hola, quisiera una cita para mi mascota',
  },

  taller: {
    colores: { tinta: '#16181c', fondo: '#f4f4f2', marca: '#1f2937', marca2: '#111827', acento: '#f2b705', suave: '#ececea' },
    hero: {
      eyebrow: 'Taller automotriz en {distrito}',
      titulo: 'Su carro en buenas manos, <em>con precio claro</em>',
      lead: 'Mantenimiento, frenos, suspensión, electricidad y más. Le decimos qué tiene su carro y cuánto cuesta antes de empezar.',
      badges: ['Diagnóstico antes de reparar', 'Presupuesto claro', 'Citas por WhatsApp'],
      tarjeta: {
        titulo: '¿Qué le pasa a su carro?',
        items: [
          { icono: 'gear', t: 'Le toca mantenimiento', d: 'cambio de aceite y filtros' },
          { icono: 'bolt', t: 'No arranca o falla', d: 'diagnóstico eléctrico y de motor' },
          { icono: 'shield', t: 'Frenos o ruidos', d: 'frenos y suspensión' },
          { icono: 'check', t: 'Revisión antes de viajar', d: 'chequeo general' },
        ],
      },
    },
    servicios: {
      titulo: 'Servicios',
      lead: 'Trabajamos con todas las marcas. Le mostramos las piezas que cambiamos.',
      items: [
        { icono: 'gear', t: 'Mantenimiento', d: 'Mantenimiento preventivo según su kilometraje.', b: ['Aceite y filtros', 'Afinamiento', 'Revisión general'] },
        { icono: 'shield', t: 'Frenos y suspensión', d: 'Para que su carro frene y se maneje bien.', b: ['Pastillas y discos', 'Amortiguadores', 'Alineamiento'] },
        { icono: 'bolt', t: 'Electricidad y scanner', d: 'Diagnóstico con scanner y reparación eléctrica.', b: ['Scanner', 'Batería y alternador', 'Luces y sensores'] },
        { icono: 'wrench', t: 'Mecánica general', d: 'Reparación de motor, caja y más.', b: ['Motor', 'Embrague', 'Refrigeración'] },
      ],
    },
    destacado: {
      eyebrow: 'Cómo trabajamos',
      titulo: 'Primero el diagnóstico, después la reparación',
      texto: 'Revisamos su carro, le explicamos qué tiene y le damos el presupuesto. Solo reparamos lo que usted aprueba.',
      lista: ['Diagnóstico del problema', 'Presupuesto antes de empezar', 'Reparación con su aprobación', 'Le mostramos las piezas cambiadas'],
    },
    pasos: [
      { t: 'Escríbanos por WhatsApp', d: 'Cuéntenos qué le pasa a su carro.' },
      { t: 'Diagnóstico', d: 'Lo revisamos y le damos el presupuesto.' },
      { t: 'Reparación', d: 'Le avisamos cuando está listo.' },
    ],
    faq: [
      { q: '¿Trabajan con todas las marcas?', a: 'Sí. Consúltenos por WhatsApp su marca y modelo.' },
      { q: '¿Cuánto demora una reparación?', a: 'Depende del trabajo. Se lo decimos junto con el presupuesto.' },
      { q: '¿Dan garantía?', a: 'Sí, por el trabajo realizado. Le explicamos las condiciones al entregarle su carro.' },
    ],
    cta: { titulo: '¿Su carro necesita revisión?', texto: 'Escríbanos y le damos un horario.' },
    waTexto: 'Hola, quisiera una cita para mi carro',
  },

  'servicio-tecnico': {
    colores: { tinta: '#0c1a2b', fondo: '#f5f8fb', marca: '#1f6feb', marca2: '#0b4fbf', acento: '#ff7a1a', suave: '#eaf2ff' },
    hero: {
      eyebrow: 'Servicio técnico a domicilio · {distrito}',
      titulo: 'Su equipo <em>funcionando otra vez</em>, sin salir de casa',
      lead: 'Vamos a su casa, revisamos el equipo y le decimos el costo antes de empezar. Lo dejamos funcionando y probado.',
      badges: ['Visita a domicilio', 'Presupuesto antes de reparar', 'Repuestos garantizados'],
      tarjeta: {
        titulo: '¿Qué le pasa a su equipo?',
        items: [
          { icono: 'flame', t: 'La cocina no prende', d: 'o la llama sale débil' },
          { icono: 'drop', t: 'La lavadora no centrifuga', d: 'no bota el agua o hace ruido' },
          { icono: 'snow', t: 'La refri no enfría', d: 'o forma hielo donde no debe' },
          { icono: 'bolt', t: 'No enciende', d: 'falla eléctrica o de tarjeta' },
        ],
      },
    },
    servicios: {
      titulo: 'Lo que reparamos',
      lead: 'Trabajamos con las marcas que tiene en casa. Le explicamos qué tiene su equipo antes de tocar nada.',
      items: [
        { icono: 'flame', t: 'Cocinas', d: 'A gas y eléctricas.', b: ['Quemadores', 'Encendido', 'Horno'] },
        { icono: 'drop', t: 'Lavadoras', d: 'Automáticas y semiautomáticas.', b: ['No centrifuga', 'No drena', 'Tarjeta y motor'] },
        { icono: 'snow', t: 'Refrigeradoras', d: 'No frost y convencionales.', b: ['No enfría', 'Carga de gas', 'Termostato'] },
        { icono: 'bolt', t: 'Otros equipos', d: 'Consúltenos por su equipo.', b: ['Termas', 'Microondas', 'Secadoras'] },
      ],
    },
    destacado: {
      eyebrow: 'Cómo trabajamos',
      titulo: 'Sabe el costo antes de que reparemos',
      texto: 'Revisamos su equipo en su casa, le explicamos qué tiene y le damos el presupuesto. Si está de acuerdo, lo reparamos ahí mismo.',
      lista: ['Visita en el día que usted elija', 'Diagnóstico en su casa', 'Presupuesto antes de reparar', 'Prueba del equipo con usted'],
    },
    pasos: [
      { t: 'Escríbanos por WhatsApp', d: 'Cuéntenos qué equipo es y qué le pasa.' },
      { t: 'Vamos a su casa', d: 'Revisamos y le damos el presupuesto.' },
      { t: 'Lo dejamos funcionando', d: 'Lo probamos con usted antes de irnos.' },
    ],
    faq: [
      { q: '¿Cobran la visita?', a: 'Consúltenos por WhatsApp; le explicamos el costo de la visita y del diagnóstico antes de ir.' },
      { q: '¿Qué marcas reparan?', a: 'Trabajamos con las marcas más comunes. Díganos la suya y le confirmamos.' },
      { q: '¿Dan garantía?', a: 'Sí, por el trabajo y los repuestos. Se la explicamos al terminar.' },
    ],
    cta: { titulo: '¿Su equipo falló?', texto: 'Escríbanos y coordinamos la visita.' },
    waTexto: 'Hola, quisiera una visita técnica',
  },
};
