import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

styles = getSampleStyleSheet()

primary_color = colors.HexColor('#0F2A4A')    # Corporate Navy
secondary_color = colors.HexColor('#1E40AF')  # Royal Blue
dark_neutral = colors.HexColor('#1F2937')     # Charcoal
light_neutral = colors.HexColor('#4B5563')    # Slate Gray
accent_color = colors.HexColor('#D97706')     # Gold/Amber Accent
divider_color = colors.HexColor('#CBD5E1')    # Soft Border

title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=16,
    leading=20,
    textColor=primary_color,
)

subtitle_style = ParagraphStyle(
    'DocSubtitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=10,
    leading=13,
    textColor=secondary_color,
)

contact_style = ParagraphStyle(
    'DocContact',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8,
    leading=11,
    textColor=light_neutral,
)

section_heading_style = ParagraphStyle(
    'SectionHeading',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=10,
    leading=13,
    textColor=primary_color,
    spaceBefore=5,
    spaceAfter=2,
)

body_style = ParagraphStyle(
    'BodyTextCustom',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=11.5,
    textColor=dark_neutral,
    spaceAfter=3,
)

bullet_style = ParagraphStyle(
    'BulletCustom',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8,
    leading=10.5,
    textColor=dark_neutral,
    leftIndent=10,
    firstLineIndent=-6,
    spaceAfter=2,
)

job_title_style = ParagraphStyle(
    'JobTitleCustom',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=8.5,
    leading=11,
    textColor=dark_neutral,
)

job_meta_style = ParagraphStyle(
    'JobMetaCustom',
    parent=styles['Normal'],
    fontName='Helvetica-Oblique',
    fontSize=7.5,
    leading=9.5,
    textColor=light_neutral,
)

output_dir = 'task-ledger/evidence/careerai/cvs_y_cartas_talenthive'
os.makedirs(output_dir, exist_ok=True)

# -------------------------------------------------------------
# 1. CV EN ESPAÑOL (ES)
# -------------------------------------------------------------
def build_cv_es(filepath):
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=32,
        bottomMargin=32
    )
    story = []

    story.append(Paragraph('JOEL STALIN MARTÍNEZ ESPINAL', title_style))
    story.append(Paragraph('INGENIERO DE SOFTWARE SENIOR IBM i (AS/400, ILE RPG, CL, DB2)', subtitle_style))
    story.append(Paragraph(
        'Email: joelstalin2105@gmail.com | Tel: +1 (849) 260-0983 | LinkedIn: linkedin.com/in/joel-stalin-martinez<br/>'
        'Disponibilidad: 100% Remoto (L-V 8:00 AM - 5:00 PM) | Ubicación: Santo Domingo (Zona Horaria AST/EST)',
        contact_style
    ))
    story.append(HRFlowable(width='100%', thickness=1.5, color=primary_color, spaceBefore=4, spaceAfter=5))

    story.append(Paragraph('RESUMEN PROFESIONAL', section_heading_style))
    story.append(Paragraph(
        'Ingeniero de Software Senior con más de 8 años de experiencia comprobada en arquitectura, desarrollo y '
        'optimización sobre plataformas <b>IBM i (AS/400, iSeries)</b> y entornos empresariales de misión crítica. '
        'Especialista en desarrollo <b>RPG IV / ILE RPG (Free-Form y Fixed)</b>, <b>SQL RPGLE</b> y <b>CL / CLLE</b>, '
        'con amplio dominio del sistema operativo IBM i, gestión de objetos, colas de trabajos y procesamiento por lotes (Batch). '
        'Experto en modelado de datos sobre <b>DB2 para i</b>, diseño de archivos físicos y lógicos (DDS), estrategias de indexación, '
        'control de concurrencia y bloqueo de registros. Cuenta con trayectoria consolidada en modernización de sistemas heredados '
        'hacia arquitecturas de microservicios y APIs REST/SOAP, integrando IBM i con Java, C#, Python y herramientas de desarrollo '
        'modernas (RDi, IBM ACS, Git). Historial exitoso en plataformas bancarias, financieras, contables y de nómina.',
        body_style
    ))
    story.append(HRFlowable(width='100%', thickness=0.5, color=divider_color, spaceBefore=3, spaceAfter=4))

    story.append(Paragraph('COMPETENCIAS CLAVE ALINEADAS A LA VACANTE', section_heading_style))
    skills_data = [
        [
            Paragraph('<b>IBM i / AS400 Core:</b> RPG IV, ILE RPG, Free-Form, SQL RPGLE, CL/CLLE, DDS (PF, LF, DSPF, PRTF), Programas de Servicio (SRVPGM), Binding Directories, Activation Groups (*NEW, *CALLER).', body_style),
            Paragraph('<b>Bases de Datos & SQL:</b> DB2 for i, optimización de consultas SQL, Explain/Visual Explain, índices y access paths, transaccionalidad (Commit/Rollback), bloqueo y concurrencia.', body_style),
        ],
        [
            Paragraph('<b>Herramientas & Modernización:</b> IBM Rational Developer for i (RDi), IBM Access Client Solutions (ACS), Git, integraciones con APIs REST/SOAP, modernización a microservicios backend (C#, Java, Python).', body_style),
            Paragraph('<b>Dominio Empresarial:</b> Sistemas de alta criticidad, transacciones financieras, procesamiento masivo de nóminas, contabilidad, integración con ERPs (JD Edwards EnterpriseOne, Odoo), CI/CD y DevOps en IBM i.', body_style)
        ]
    ]
    t_skills = Table(skills_data, colWidths=[270, 270])
    t_skills.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 1),
    ]))
    story.append(t_skills)
    story.append(HRFlowable(width='100%', thickness=0.5, color=divider_color, spaceBefore=3, spaceAfter=4))

    story.append(Paragraph('EXPERIENCIA PROFESIONAL RELEVANTE', section_heading_style))

    story.append(Paragraph('<b>Co-Líder & Ingeniero de Software Senior</b> — BANK BHD (JGBM)', job_title_style))
    story.append(Paragraph('05/2020 – Presente | Santo Domingo, Rep. Dominicana (Core Bancario / IBM i & Microservicios)', job_meta_style))
    story.append(Paragraph('• Lideró el desarrollo y mantenimiento de componentes críticos en <b>IBM i (AS/400)</b> utilizando <b>RPG IV, ILE RPG y CLLE</b> para operaciones de alto volumen transaccional.', bullet_style))
    story.append(Paragraph('• Diseñó y optimizó esquemas en <b>DB2 para i</b>, depurando cuellos de botella mediante indexación avanzada y minimizando bloqueos en procesos nocturnos por lotes (Batch).', bullet_style))
    story.append(Paragraph('• Participó en la modernización de módulos bancarios hacia microservicios desacoplados y APIs de integración, garantizando cero tiempo de inactividad y estricta integridad de datos.', bullet_style))
    story.append(Paragraph('• Ejecutó procesos de migración y conciliación masiva hacia plataformas core (Temenos T24), asegurando trazabilidad de auditoría y cumplimiento regulatorio.', bullet_style))

    story.append(Paragraph('<b>Consultor Senior de Automatización & Arquitectura Backend</b> — Flai / GetUpSoft', job_title_style))
    story.append(Paragraph('2024 – Presente | Consultoría Tecnológica Empresarial', job_meta_style))
    story.append(Paragraph('• Desarrollo de integraciones robustas de backend y módulos ERP empresariales, conectando sistemas legacy mediante endpoints REST, colas de mensajería y sincronización en tiempo real.', bullet_style))
    story.append(Paragraph('• Implementación de flujos automatizados de validación fiscal, contable y de nómina con tolerancia a fallos, aplicando control de versiones con Git y pipelines de integración continua.', bullet_style))

    story.append(Paragraph('<b>Analista Programador Senior IBM i / Core Financiero</b> — IB SYSTEMS', job_title_style))
    story.append(Paragraph('01/2016 – 05/2018 | Santo Domingo, Rep. Dominicana', job_meta_style))
    story.append(Paragraph('• Mantenimiento y evolución de la plataforma transaccional de tarjetas de crédito/débito en <b>AS/400 (RPG ILE, CL, DB2)</b>, asegurando SLAs del 99.99%.', bullet_style))
    story.append(Paragraph('• Desarrollo de sistemas de compensación y autorización ACH/RTGS, integrando servicios IBM WebSphere MQ y generación de interfaces DDS para reportes regulatorios ante la Superintendencia de Bancos.', bullet_style))

    story.append(Paragraph('<b>Líder de Proyecto Técnico / Integraciones</b> — Banco Popular Dominicano', job_title_style))
    story.append(Paragraph('05/2018 – 11/2019 | Santo Domingo, Rep. Dominicana', job_meta_style))
    story.append(Paragraph('• Gestión técnica de proyectos de modernización de canales bancarios con la fábrica de software NEORIS, coordinando requerimientos de arquitectura, calidad de código y despliegues productivos.', bullet_style))

    story.append(HRFlowable(width='100%', thickness=0.5, color=divider_color, spaceBefore=3, spaceAfter=4))

    story.append(Paragraph('EDUCACIÓN Y FORMACIÓN', section_heading_style))
    story.append(Paragraph(
        '<b>Desarrollador de Software</b> — Instituto Técnico Superior Comunitario (ITSC), 2014<br/>'
        '<b>Diplomado en Inteligencia Artificial & Automatización</b> — Instituto Tecnológico de Las Américas (ITLA), 2019<br/>'
        '<b>Idiomas:</b> Español (Nativo) | Inglés (Profesional de Trabajo)',
        body_style
    ))

    doc.build(story)
    print(f'OK: {filepath}')


# -------------------------------------------------------------
# 2. CV EN INGLÉS (EN)
# -------------------------------------------------------------
def build_cv_en(filepath):
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=32,
        bottomMargin=32
    )
    story = []

    story.append(Paragraph('JOEL STALIN MARTÍNEZ ESPINAL', title_style))
    story.append(Paragraph('SENIOR SOFTWARE ENGINEER — IBM i (AS/400, ILE RPG, CL, DB2)', subtitle_style))
    story.append(Paragraph(
        'Email: joelstalin2105@gmail.com | Phone: +1 (849) 260-0983 | LinkedIn: linkedin.com/in/joel-stalin-martinez<br/>'
        'Availability: 100% Remote (Mon-Fri 8:00 AM - 5:00 PM) | Location: Santo Domingo (AST/EST Timezone)',
        contact_style
    ))
    story.append(HRFlowable(width='100%', thickness=1.5, color=primary_color, spaceBefore=4, spaceAfter=5))

    story.append(Paragraph('PROFESSIONAL SUMMARY', section_heading_style))
    story.append(Paragraph(
        'Senior Software Engineer with over 8 years of proven hands-on experience architecting, developing, and modernizing '
        'mission-critical enterprise systems on <b>IBM i (AS/400, iSeries)</b>. Expert in <b>RPG IV / ILE RPG (Free-Form & Fixed)</b>, '
        '<b>SQL RPGLE</b>, and <b>CL / CLLE</b>, with in-depth knowledge of IBM i operating system internals, object architecture, '
        'job queues, and high-volume batch processing workflows. Proven expertise in <b>DB2 for i</b> data modeling, physical and logical '
        'files (DDS), access path design, advanced SQL performance tuning, record locking, and concurrency management. Strong background '
        'in legacy-to-cloud modernization, decoupling monolithic applications into REST/SOAP APIs and microservices (Java, C#, Python), '
        'paired with modern development tools (RDi, IBM ACS, Git). Extensive domain knowledge in banking, finance, payroll, and ERP systems.',
        body_style
    ))
    story.append(HRFlowable(width='100%', thickness=0.5, color=divider_color, spaceBefore=3, spaceAfter=4))

    story.append(Paragraph('KEY COMPETENCIES ALIGNED WITH ROLE', section_heading_style))
    skills_data = [
        [
            Paragraph('<b>IBM i / AS400 Core:</b> RPG IV, ILE RPG, Free-Form RPG, SQL RPGLE, CL/CLLE, DDS (PF, LF, DSPF, PRTF), Service Programs (SRVPGM), Binding Directories, Activation Groups (*NEW, *CALLER).', body_style),
            Paragraph('<b>Database & SQL:</b> DB2 for i, SQL query optimization, Explain/Visual Explain, indexing strategies & access paths, transaction processing (Commit/Rollback), concurrency & record locking.', body_style),
        ],
        [
            Paragraph('<b>Tools & Modernization:</b> IBM Rational Developer for i (RDi), IBM Access Client Solutions (ACS), Git, REST/SOAP API integration patterns, backend modernization (C#, Java, Python).', body_style),
            Paragraph('<b>Enterprise Domain:</b> Mission-critical high-availability systems, payroll processing pipelines, financial transactions, ERP integration (JD Edwards EnterpriseOne, Odoo), DevOps/CI/CD on IBM i.', body_style)
        ]
    ]
    t_skills = Table(skills_data, colWidths=[270, 270])
    t_skills.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 1),
    ]))
    story.append(t_skills)
    story.append(HRFlowable(width='100%', thickness=0.5, color=divider_color, spaceBefore=3, spaceAfter=4))

    story.append(Paragraph('RELEVANT PROFESSIONAL EXPERIENCE', section_heading_style))

    story.append(Paragraph('<b>Co-Lead & Senior Software Engineer</b> — BANK BHD (JGBM)', job_title_style))
    story.append(Paragraph('05/2020 – Present | Santo Domingo, Dominican Republic (Core Banking / IBM i & Microservices)', job_meta_style))
    story.append(Paragraph('• Led development and tier-1 maintenance of core banking applications on <b>IBM i (AS/400)</b> utilizing <b>RPG IV, ILE RPG, and CLLE</b> for high-volume financial processing.', bullet_style))
    story.append(Paragraph('• Architected and tuned <b>DB2 for i</b> database structures, resolving complex SQL bottlenecks, eliminating record lock contention, and accelerating critical nightly batch runs.', bullet_style))
    story.append(Paragraph('• Championed application modernization initiatives, exposing legacy IBM i modules as microservices and RESTful endpoints to support modern digital banking platforms.', bullet_style))
    story.append(Paragraph('• Spearheaded data migration and reconciliation pipelines to Temenos T24, ensuring stringent regulatory compliance, zero data loss, and seamless transaction continuity.', bullet_style))

    story.append(Paragraph('<b>Senior Automation & Backend Architecture Consultant</b> — Flai / GetUpSoft', job_title_style))
    story.append(Paragraph('2024 – Present | Enterprise Technology Consulting', job_meta_style))
    story.append(Paragraph('• Engineered resilient backend architectures and ERP integrations, bridging legacy systems with cloud services via REST APIs, asynchronous queues, and automated workflows.', bullet_style))
    story.append(Paragraph('• Automated payroll, accounting, and compliance rule engines with built-in audit trails, implementing Git version control and CI/CD validation gates.', bullet_style))

    story.append(Paragraph('<b>Senior Programmer & Analyst — IBM i Core Systems</b> — IB SYSTEMS', job_title_style))
    story.append(Paragraph('01/2016 – 05/2018 | Santo Domingo, Dominican Republic', job_meta_style))
    story.append(Paragraph('• Maintained and enhanced card transaction core platforms on <b>AS/400 (RPG ILE, CL, DB2)</b>, achieving 99.99% operational SLA across high-throughput payment channels.', bullet_style))
    story.append(Paragraph('• Developed automated clearinghouse (ACH/RTGS) settlement routines, integrating WebSphere MQ and generating complex DDS reporting streams for regulatory oversight.', bullet_style))

    story.append(Paragraph('<b>Technical Project Lead / Systems Integration</b> — Banco Popular Dominicano', job_title_style))
    story.append(Paragraph('05/2018 – 11/2019 | Santo Domingo, Dominican Republic', job_meta_style))
    story.append(Paragraph('• Directed technical delivery with software vendor NEORIS, managing architectural reviews, code quality gates, and release readiness for mission-critical core banking deployments.', bullet_style))

    story.append(HRFlowable(width='100%', thickness=0.5, color=divider_color, spaceBefore=3, spaceAfter=4))

    story.append(Paragraph('EDUCATION & CREDENTIALS', section_heading_style))
    story.append(Paragraph(
        '<b>Software Development Degree</b> — Instituto Técnico Superior Comunitario (ITSC), 2014<br/>'
        '<b>Graduate Diploma in Artificial Intelligence & Automation</b> — Instituto Tecnológico de Las Américas (ITLA), 2019<br/>'
        '<b>Languages:</b> Spanish (Native) | English (Professional Working Proficiency)',
        body_style
    ))

    doc.build(story)
    print(f'OK: {filepath}')


# -------------------------------------------------------------
# 3. CARTA DE PRESENTACIÓN EN ESPAÑOL (ES)
# -------------------------------------------------------------
def build_letter_es(filepath):
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        leftMargin=45,
        rightMargin=45,
        topMargin=40,
        bottomMargin=40
    )
    story = []

    story.append(Paragraph('JOEL STALIN MARTÍNEZ ESPINAL', title_style))
    story.append(Paragraph('Ingeniero de Software Senior | Especialista IBM i (AS/400) & Modernización Cloud', subtitle_style))
    story.append(Paragraph(
        'Santo Domingo, República Dominicana | Tel: +1 (849) 260-0983 | Email: joelstalin2105@gmail.com<br/>'
        'Perfil: linkedin.com/in/joel-stalin-martinez | Modalidad: 100% Remoto (L-V 8:00 AM - 5:00 PM)',
        contact_style
    ))
    story.append(HRFlowable(width='100%', thickness=1.5, color=primary_color, spaceBefore=6, spaceAfter=10))

    story.append(Paragraph('<b>Fecha:</b> 12 de Septiembre de 2026', body_style))
    story.append(Paragraph('<b>Para:</b> Equipo de Selección y Atracción de Talento — Talent Hive', body_style))
    story.append(Paragraph('<b>Referencia:</b> Convocatoria Ingeniero/a de Software Senior IBM i (AS/400) [100% Remoto]', body_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph('Estimado equipo de selección de Talent Hive,', body_style))
    story.append(Spacer(1, 4))

    p1 = (
        'Me dirijo a ustedes con el mayor entusiasmo para postular formalmente a la vacante de <b>Ingeniero/a de Software '
        'Senior IBM i (AS/400)</b>. Al revisar detalladamente el perfil y el alcance del proyecto —enfocado en liderar la operación, '
        'optimización y modernización plurianual de una plataforma crítica de nóminas empresariales— identifiqué una '
        'alineación exacta con mi trayectoria técnica de más de 8 años en sistemas <b>IBM i, RPG IV / ILE RPG, CL, DB2 para i</b> '
        'y proyectos de modernización hacia arquitecturas modernas.'
    )
    story.append(Paragraph(p1, body_style))
    story.append(Spacer(1, 4))

    p2 = (
        'A lo largo de mi carrera profesional en instituciones de alta exigencia transaccional como <b>Bank BHD, Banco Popular '
        'Dominicano e IB Systems</b>, he sido responsable de diseñar, programar y estabilizar soluciones centrales sobre AS/400. '
        'Cuento con amplia destreza práctica en:'
    )
    story.append(Paragraph(p2, body_style))
    story.append(Spacer(1, 2))

    story.append(Paragraph('• <b>Desarrollo Robusto en IBM i:</b> Dominio integral de RPG IV, ILE RPG (Free-Form), SQL RPGLE, programas CL/CLLE, módulos, programas de servicio (SRVPGM), directorios vinculantes y grupos de activación.', bullet_style))
    story.append(Paragraph('• <b>Base de Datos DB2 for i & Rendimiento SQL:</b> Optimización avanzada de sentencias SQL, resolución de bloqueos y contenciones de registro, indexación estratégica y administración de archivos físicos (PF), lógicos (LF) y pantallas DDS.', bullet_style))
    story.append(Paragraph('• <b>Procesamiento por Lotes (Batch) de Misión Crítica:</b> Supervisión y programación de trabajos nocturnos de nómina y liquidación financiera con tolerancia a fallos, balanceo y control estricto de concurrencia.', bullet_style))
    story.append(Paragraph('• <b>Modernización e Integración:</b> Conexión de servicios legacy con microservicios y APIs REST/SOAP modernas (C#, Java, Python, Node.js), aplicando control de versiones con Git y tooling avanzado como IBM ACS y RDi.', bullet_style))
    story.append(Spacer(1, 4))

    p3 = (
        'Me motiva especialmente el propósito de este puesto: participar activamente en la iniciativa de modernización de varios '
        'años, moldeando la arquitectura futura de la plataforma de nóminas mientras se garantiza la continuidad de las operaciones '
        'de negocio vigentes. Mi experiencia combinando el rigor del mundo IBM i con las mejores prácticas de ingeniería moderna '
        'me permite integrarme con inmediata productividad y generar valor tangible desde el primer día.'
    )
    story.append(Paragraph(p3, body_style))
    story.append(Spacer(1, 4))

    p4 = (
        'Cuento con completa disponibilidad para trabajar bajo la modalidad <b>100% Remota</b> en el horario requerido '
        '(Lunes a Viernes de 8:00 AM a 5:00 PM), con infraestructura de conectividad redundante y total adaptabilidad '
        'a esquemas de compensación internacional en USD.'
    )
    story.append(Paragraph(p4, body_style))
    story.append(Spacer(1, 4))

    p5 = (
        'Adjunto mi Curriculum Vitae con el desglose detallado de mis proyectos y logros. Agradezco de antemano su tiempo '
        'y consideración, y quedo a su total disposición para coordinar una entrevista técnica cuando lo estimen conveniente.'
    )
    story.append(Paragraph(p5, body_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph('Atentamente,', body_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph('<b>Joel Stalin Martínez Espinal</b>', ParagraphStyle('Sign', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, textColor=primary_color)))
    story.append(Paragraph('Ingeniero de Software Senior IBM i / AS-400<br/>joelstalin2105@gmail.com | +1 (849) 260-0983<br/>Santo Domingo, República Dominicana', contact_style))

    doc.build(story)
    print(f'OK: {filepath}')


# -------------------------------------------------------------
# 4. CARTA DE PRESENTACIÓN EN INGLÉS (EN)
# -------------------------------------------------------------
def build_letter_en(filepath):
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        leftMargin=45,
        rightMargin=45,
        topMargin=40,
        bottomMargin=40
    )
    story = []

    story.append(Paragraph('JOEL STALIN MARTÍNEZ ESPINAL', title_style))
    story.append(Paragraph('Senior Software Engineer | IBM i (AS/400) Specialist & Modernization Architect', subtitle_style))
    story.append(Paragraph(
        'Santo Domingo, Dominican Republic | Phone: +1 (849) 260-0983 | Email: joelstalin2105@gmail.com<br/>'
        'Profile: linkedin.com/in/joel-stalin-martinez | Work Mode: 100% Remote (Mon-Fri 8:00 AM - 5:00 PM)',
        contact_style
    ))
    story.append(HRFlowable(width='100%', thickness=1.5, color=primary_color, spaceBefore=6, spaceAfter=10))

    story.append(Paragraph('<b>Date:</b> September 12, 2026', body_style))
    story.append(Paragraph('<b>To:</b> Talent Acquisition & Recruiting Team — Talent Hive', body_style))
    story.append(Paragraph('<b>Re:</b> Application for Senior Software Engineer IBM i (AS/400) [100% Remote]', body_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph('Dear Talent Hive Hiring Team,', body_style))
    story.append(Spacer(1, 4))

    p1 = (
        'I am writing to express my strong interest in the <b>Senior Software Engineer IBM i (AS/400)</b> position. '
        'Having reviewed the job specifications and the multi-year modernization roadmap for your mission-critical payroll platform, '
        'I am confident that my 8+ years of hands-on engineering experience in <b>IBM i (AS/400, iSeries), RPG IV / ILE RPG, CL, '
        'DB2 for i</b>, and legacy-to-cloud modernization directly align with your team’s strategic goals.'
    )
    story.append(Paragraph(p1, body_style))
    story.append(Spacer(1, 4))

    p2 = (
        'Throughout my career supporting high-volume banking and enterprise systems at institutions such as <b>Bank BHD, '
        'Banco Popular Dominicano, and IB Systems</b>, I have architected and supported core transactional platforms with zero-downtime '
        'requirements. Key areas of expertise I bring to this role include:'
    )
    story.append(Paragraph(p2, body_style))
    story.append(Spacer(1, 2))

    story.append(Paragraph('• <b>Advanced IBM i Engineering:</b> Comprehensive mastery of RPG IV, Free-Form RPG, SQL RPGLE, CL/CLLE scripts, service programs (SRVPGM), binding directories, and activation groups (*NEW, *CALLER).', bullet_style))
    story.append(Paragraph('• <b>DB2 for i & SQL Performance Tuning:</b> Proven track record eliminating query bottlenecks, resolving record locking and concurrency conflicts, managing access path design, and maintaining production DDS files (PF, LF, DSPF, PRTF).', bullet_style))
    story.append(Paragraph('• <b>Mission-Critical Batch Processing:</b> Designing and monitoring high-throughput payroll, accounting, and clearinghouse batch routines with robust exception handling and audit reconciliation.', bullet_style))
    story.append(Paragraph('• <b>Decoupling & Modernization:</b> Bridging traditional AS/400 core logic with modern backend architectures (Java, C#, Node.js, Python), REST/SOAP integration APIs, and modern CI/CD tooling (Git, IBM ACS, RDi).', bullet_style))
    story.append(Spacer(1, 4))

    p3 = (
        'What excites me most about this opportunity is the opportunity to directly contribute to shaping the future architecture '
        'of a mission-critical platform while maintaining operational excellence on the existing system. I thrive in collaborative '
        'environments partnering with software architects, product managers, and modernization leaders to deliver scalable, '
        'business-driven engineering solutions.'
    )
    story.append(Paragraph(p3, body_style))
    story.append(Spacer(1, 4))

    p4 = (
        'I am fully equipped and immediately available to operate in a <b>100% Remote</b> capacity during the designated schedule '
        '(Monday to Friday, 8:00 AM – 5:00 PM), with redundant high-speed power/internet infrastructure and full compliance with '
        'international USD compensation frameworks.'
    )
    story.append(Paragraph(p4, body_style))
    story.append(Spacer(1, 4))

    p5 = (
        'Please find attached my detailed resume for your review. I look forward to the opportunity to discuss how my '
        'technical expertise and problem-solving mindset can contribute to Talent Hive and your partner organization.'
    )
    story.append(Paragraph(p5, body_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph('Sincerely,', body_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph('<b>Joel Stalin Martínez Espinal</b>', ParagraphStyle('SignEn', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, textColor=primary_color)))
    story.append(Paragraph('Senior Software Engineer — IBM i / AS-400<br/>joelstalin2105@gmail.com | +1 (849) 260-0983<br/>Santo Domingo, Dominican Republic', contact_style))

    doc.build(story)
    print(f'OK: {filepath}')


if __name__ == '__main__':
    cv_es_path = os.path.join(output_dir, 'CV_Joel_Stalin_IBM_i_Senior_ES.pdf')
    cv_en_path = os.path.join(output_dir, 'CV_Joel_Stalin_IBM_i_Senior_EN.pdf')
    letter_es_path = os.path.join(output_dir, 'Carta_Presentacion_Joel_Stalin_IBM_i_ES.pdf')
    letter_en_path = os.path.join(output_dir, 'Cover_Letter_Joel_Stalin_IBM_i_EN.pdf')

    build_cv_es(cv_es_path)
    build_cv_en(cv_en_path)
    build_letter_es(letter_es_path)
    build_letter_en(letter_en_path)
    print('ALL_PDFS_GENERATED')
