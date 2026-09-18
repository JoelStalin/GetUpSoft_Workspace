import json
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

styles = getSampleStyleSheet()

primary_color = colors.HexColor('#1E3A8A')  # Deep Navy
dark_neutral = colors.HexColor('#1F2937')   # Charcoal Body
light_neutral = colors.HexColor('#4B5563')  # Slate

name_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=17,
    leading=21,
    textColor=primary_color,
    alignment=0
)

subtitle_style = ParagraphStyle(
    'DocSubtitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=10.5,
    leading=13,
    textColor=dark_neutral,
    alignment=0
)

contact_style = ParagraphStyle(
    'DocContact',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=11,
    textColor=light_neutral,
    alignment=0
)

section_title_style = ParagraphStyle(
    'SectionHeading',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=10.5,
    leading=13,
    textColor=primary_color,
    spaceBefore=6,
    spaceAfter=2
)

body_style = ParagraphStyle(
    'BodyText',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=11.5,
    textColor=dark_neutral,
    spaceAfter=3
)

bullet_style = ParagraphStyle(
    'BulletItem',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=11,
    textColor=dark_neutral,
    leftIndent=10,
    firstLineIndent=-6,
    spaceAfter=2
)

job_header_style = ParagraphStyle(
    'JobHeader',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=9,
    leading=12,
    textColor=dark_neutral
)

job_meta_style = ParagraphStyle(
    'JobMeta',
    parent=styles['Normal'],
    fontName='Helvetica-Oblique',
    fontSize=8,
    leading=10,
    textColor=light_neutral
)

footer_ai_style = ParagraphStyle(
    'AIFooter',
    parent=styles['Normal'],
    fontName='Helvetica-Oblique',
    fontSize=7.5,
    leading=9.5,
    textColor=colors.HexColor('#6B7280'),
    alignment=1
)

output_dir = 'task-ledger/evidence/careerai/cvs_profesionales_top_tier'
os.makedirs(output_dir, exist_ok=True)

with open('data/careerai/raw_leads_source.json', 'r', encoding='utf-8') as f:
    leads = json.load(f)

print('Generando CVs y Cartas Profesionales de Alto Nivel con ReportLab...\n')

for i, lead in enumerate(leads):
    idx = str(i + 1).zfill(2)
    company_name = lead['company']
    company_slug = company_name.replace(' ', '_')
    job_title = lead['title']
    lead_id = lead['lead_id']
    
    desc_sample = (job_title + ' ' + lead['description']).lower()
    is_spanish = any(w in desc_sample for w in ['arquitecto', 'ingeniero', 'especialista', 'remoto'])
    lang = 'es' if is_spanish else 'en'
    
    cv_filename = f'CV_{idx}_{company_slug}_{lang.upper()}_PRO.pdf'
    letter_filename = f'Carta_{idx}_{company_slug}_{lang.upper()}_PRO.pdf'
    
    # -------------------------------------------------------------
    # 1. BUILD PROFESSIONAL CV (Executive Top-Tier Style)
    # -------------------------------------------------------------
    doc = SimpleDocTemplate(
        os.path.join(output_dir, cv_filename),
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=32,
        bottomMargin=32
    )
    
    story = []
    
    # Header
    story.append(Paragraph('JOEL STALIN MARTINEZ ESPINAL', name_style))
    story.append(Paragraph(f'Senior Systems Architect & Full-Stack Automation Engineer | Applied for: {company_name}', subtitle_style))
    story.append(Spacer(1, 2))
    
    contact_text = 'Santo Domingo, DO (Remote)  |  +1 849 260 0983  |  <font color="#1E3A8A"><u>joelstalin@getupsoft.com</u></font>  |  <font color="#1E3A8A"><u>linkedin.com/in/joel-stalin-martinez</u></font>  |  <font color="#1E3A8A"><u>github.com/JoelStalin</u></font>'
    story.append(Paragraph(contact_text, contact_style))
    story.append(Spacer(1, 3))
    story.append(HRFlowable(width='100%', thickness=1.5, color=primary_color, spaceBefore=1, spaceAfter=4))
    
    # Summary
    story.append(Paragraph('EXECUTIVE PROFILE' if lang == 'en' else 'RESUMEN PROFESIONAL', section_title_style))
    if lang == 'en':
        summary_text = (
            f'Results-driven Senior Systems Architect and Software Engineer with 8+ years of expertise designing and scaling '
            f'mission-critical enterprise systems, resilient microservices, and ERP/API automation for banking and technology organizations. '
            f'Proven track record modernizing legacy cores (IBM i / AS400, Temenos T24), architecting Python/Odoo custom workflows with 99.9% uptime, '
            f'and orchestrating autonomous AI agent pipelines. Specially aligned to lead engineering initiatives at <b>{company_name}</b>.'
        )
    else:
        summary_text = (
            f'Ingeniero de Software Senior y Arquitecto de Sistemas con mas de 8 anos de trayectoria liderando soluciones tecnologicas criticas '
            f'para el sector bancario, automatizacion ERP y arquitecturas de microservicios de alto rendimiento. '
            f'Experiencia comprobada en modernizacion de core bancario (IBM i / AS400, Temenos T24), desarrollo en Python/Odoo para flujos de alta transaccionalidad, '
            f'e implementacion de pipelines resilientes en cloud. Enfocado en aportar alto valor de ingenieria a <b>{company_name}</b>.'
        )
    story.append(Paragraph(summary_text, body_style))
    
    # Core Competencies Table
    story.append(Paragraph('CORE COMPETENCIES & TECHNICAL EXPERTISE' if lang == 'en' else 'COMPETENCIAS CLAVE & STACK TECNOLOGICO', section_title_style))
    if lang == 'en':
        skills_data = [
            [Paragraph('<b>Backend & Systems:</b>', job_header_style), Paragraph('Python, Node.js, TypeScript, Next.js, Odoo ERP (15+), REST/GraphQL, Webhooks', body_style)],
            [Paragraph('<b>Banking & Core:</b>', job_header_style), Paragraph('IBM i (AS400), RPGLE, CL, Temenos T24 Migration, ACH, RTGS, Card Management', body_style)],
            [Paragraph('<b>Cloud & Reliability:</b>', job_header_style), Paragraph('Docker, Cloudflare Tunnels, GCP, AWS, PostgreSQL, Redis, n8n, Zero-Downtime Deployments', body_style)],
            [Paragraph('<b>AI & Automation:</b>', job_header_style), Paragraph('Multi-Agent Orchestration, LLM Council, Playwright Stealth Scraping, API Bridges', body_style)]
        ]
    else:
        skills_data = [
            [Paragraph('<b>Backend & Sistemas:</b>', job_header_style), Paragraph('Python, Node.js, TypeScript, Next.js, Odoo ERP (15+), APIs REST/GraphQL, Webhooks', body_style)],
            [Paragraph('<b>Banca & Core:</b>', job_header_style), Paragraph('IBM i (AS400), RPGLE, CL, Migracion Temenos T24, ACH, RTGS, Core de Tarjetas', body_style)],
            [Paragraph('<b>Cloud & Resiliencia:</b>', job_header_style), Paragraph('Docker, Tuneles Cloudflare, GCP, AWS, PostgreSQL, Redis, n8n, Despliegues Continuos', body_style)],
            [Paragraph('<b>IA & Automatizacion:</b>', job_header_style), Paragraph('Orquestacion Multi-Agente, Consenso LLM, Scraping Resiliente Playwright, Webhooks', body_style)]
        ]
    t = Table(skills_data, colWidths=[120, 420])
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t)
    story.append(Spacer(1, 2))
    
    # Professional Experience
    story.append(Paragraph('PROFESSIONAL EXPERIENCE' if lang == 'en' else 'EXPERIENCIA PROFESIONAL DESTACADA', section_title_style))
    
    # Job 1: Flai
    story.append(Paragraph('<b>Senior Programmer & Analyst (Odoo ERP & Automation Lead)</b>  |  Flai Consulting', job_header_style))
    story.append(Paragraph('2024 – Present  |  Santo Domingo, Dominican Republic / Remote', job_meta_style))
    if lang == 'en':
        story.append(Paragraph('&bull; Architected and deployed enterprise Odoo 15+ custom modules in Python, automating logistics dispatching, dynamic route calculation, and real-time order tracking.', bullet_style))
        story.append(Paragraph('&bull; Developed secure high-throughput REST controllers and webhooks integrating Odoo with external billing and POS systems, eliminating manual sync errors.', bullet_style))
        story.append(Paragraph('&bull; Implemented multi-tier role-based access controls (ACLs, record rules) ensuring fiscal sequence integrity and strict regulatory compliance.', bullet_style))
    else:
        story.append(Paragraph('&bull; Diseno e implementacion de modulos a medida en Odoo 15+ con Python, automatizando despachos logisticos, calculo de rutas y trazabilidad de ordenes en tiempo real.', bullet_style))
        story.append(Paragraph('&bull; Desarrollo de controladores REST y webhooks de alta transaccionalidad conectando Odoo con sistemas externos de facturacion e inventario con cero discrepancias.', bullet_style))
        story.append(Paragraph('&bull; Configuracion de seguridad granular (ACLs, reglas de registro) asegurando estricto cumplimiento fiscal y consistencia de secuencias operativas.', bullet_style))
    story.append(Spacer(1, 2))

    # Job 2: Banco BHD
    story.append(Paragraph('<b>Co-Leader & Senior Systems Programmer</b>  |  BANK BHD (JGBM)', job_header_style))
    story.append(Paragraph('05/2020 – Present  |  Santo Domingo, Dominican Republic', job_meta_style))
    if lang == 'en':
        story.append(Paragraph('&bull; Co-led the architecture of the Core Banking Management project, modernizing loan origination workflows via scalable microservices.', bullet_style))
        story.append(Paragraph('&bull; Executed end-to-end data migration, transformation, and reconciliation to Temenos T24 core banking platform with zero data loss.', bullet_style))
        story.append(Paragraph('&bull; Optimized critical RTGS interbank transfer protocols and built real-time PIN validation security engines.', bullet_style))
    else:
        story.append(Paragraph('&bull; Co-liderazgo en arquitectura del proyecto de Gestion Bancaria Core, modernizando la originacion de prestamos mediante microservicios desacoplados.', bullet_style))
        story.append(Paragraph('&bull; Ejecucion de servicios de migracion, transformacion y conciliacion de datos hacia la plataforma Temenos T24 sin perdida de integridad.', bullet_style))
        story.append(Paragraph('&bull; Optimizacion de protocolos de transferencias interbancarias RTGS y desarrollo de motores de validacion y seguridad de PINs.', bullet_style))
    story.append(Spacer(1, 2))

    # Job 3: Banco Popular
    story.append(Paragraph('<b>Project Manager & Systems Lead</b>  |  Banco Popular Dominicano (via NEORIS)', job_header_style))
    story.append(Paragraph('05/2018 – 11/2019  |  Santo Domingo, Dominican Republic', job_meta_style))
    if lang == 'en':
        story.append(Paragraph('&bull; Directed cross-functional engineering deliverables with software factory NEORIS, achieving 100% SLA compliance on strategic banking releases.', bullet_style))
        story.append(Paragraph('&bull; Coordinated technical stakeholder alignment, sprint roadmaps, and automated deployment readiness.', bullet_style))
    else:
        story.append(Paragraph('&bull; Gestion y liderazgo de proyectos tecnologicos con la fabrica de software NEORIS, cumpliendo al 100% los acuerdos de nivel de servicio (SLAs) bancarios.', bullet_style))
        story.append(Paragraph('&bull; Coordinacion de entregas tecnicas, cronogramas de despliegue y validacion operativa bajo metodologia Agile.', bullet_style))
    story.append(Spacer(1, 2))

    # Education & Certifications
    story.append(Paragraph('EDUCATION & CERTIFICATIONS' if lang == 'en' else 'EDUCACION & CERTIFICACIONES', section_title_style))
    story.append(Paragraph('<b>Software Development Degree</b> – ITSC (Instituto Tecnico Superior Comunitario)  |  2014', body_style))
    story.append(Paragraph('<b>Artificial Intelligence Postgraduate Diploma</b> – ITLA (Instituto Tecnologico de Las Americas)  |  2019', body_style))
    story.append(Paragraph('<b>Scrum Foundation Professional Certificate (SFPC)</b> – CertiProf', body_style))
    story.append(Spacer(1, 4))

    # Footer note with AI Agent provenance
    story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#D1D5DB'), spaceBefore=2, spaceAfter=3))
    footer_text = (
        'Autonomous CareerAI Engine Execution &bull; Built by Joel Stalin (<font color="#1E3A8A"><u>joelstalin2105@gmail.com</u></font>) '
        'as a high-impact engineering demonstration of autonomous agents in enterprise recruitment.'
    )
    story.append(Paragraph(footer_text, footer_ai_style))

    doc.build(story)

    # -------------------------------------------------------------
    # 2. BUILD PROFESSIONAL COVER LETTER (Executive Top-Tier Style)
    # -------------------------------------------------------------
    doc_let = SimpleDocTemplate(
        os.path.join(output_dir, letter_filename),
        pagesize=letter,
        leftMargin=44,
        rightMargin=44,
        topMargin=44,
        bottomMargin=44
    )
    story_let = []
    
    story_let.append(Paragraph('JOEL STALIN MARTINEZ ESPINAL', name_style))
    story_let.append(Paragraph('Santo Domingo, DO  |  +1 849 260 0983  |  joelstalin@getupsoft.com  |  linkedin.com/in/joel-stalin-martinez', contact_style))
    story_let.append(Spacer(1, 4))
    story_let.append(HRFlowable(width='100%', thickness=1.5, color=primary_color, spaceBefore=2, spaceAfter=14))

    story_let.append(Paragraph(f'<b>Date:</b> August 28, 2026', body_style))
    story_let.append(Paragraph(f'<b>To:</b> Hiring & Engineering Team at <b>{company_name}</b>', body_style))
    story_let.append(Paragraph(f'<b>Subject:</b> Application for <b>{job_title}</b> (Ref: {lead_id})', subtitle_style))
    story_let.append(Spacer(1, 8))

    if lang == 'en':
        let_p1 = f'Dear {company_name} Hiring Team,'
        let_p2 = (
            f'I am writing to express my enthusiastic interest in the <b>{job_title}</b> role at <b>{company_name}</b>. '
            f'With more than 8 years of hands-on software engineering experience architecting mission-critical financial cores, '
            f'scalable Python/Odoo ERP automations, and resilient distributed microservices, I am confident in my ability to immediately '
            f'contribute to your technical velocity and product excellence.'
        )
        let_p3 = (
            f'Throughout my tenure at organizations such as Bank BHD, Banco Popular (via NEORIS), and Flai Consulting, I have solved complex '
            f'distributed systems challenges: from orchestrating seamless zero-downtime data migrations to Temenos T24, to implementing high-throughput '
            f'RESTful APIs, real-time message queues, and multi-tenant security layers. My engineering philosophy centers on architectural clarity, '
            f'thorough automated testing, and building fault-tolerant services that scale with business demand.'
        )
        let_p4 = (
            f'As an active demonstration of modern systems design, this application and tailored dossier were autonomously structured and verified '
            f'by <b>CareerAI Engine</b>—an autonomous multi-agent recruitment orchestrator engineered by myself (<font color="#1E3A8A"><u>joelstalin2105@gmail.com</u></font>). '
            f'I look forward to discussing how my technical background and problem-solving mindset align with {company_name}\'s strategic roadmap.'
        )
        let_p5 = (
            'Thank you for your time and consideration.<br/><br/>'
            'Sincerely,<br/>'
            '<b>Joel Stalin Martinez Espinal</b><br/>'
            'Senior Systems Architect & Full-Stack Automation Engineer<br/>'
            '+1 849 260 0983 | joelstalin@getupsoft.com | github.com/JoelStalin'
        )
    else:
        let_p1 = f'Estimado equipo de seleccion e ingenieria de {company_name},'
        let_p2 = (
            f'Por medio de la presente, me complace presentar mi candidatura para la vacante de <b>{job_title}</b>. '
            f'Con mas de 8 anos de experiencia comprobable en el diseno y despliegue de arquitecturas de software criticas para el sector bancario, '
            f'integracion de APIs de alto rendimiento y automatizacion empresarial con Python y Odoo ERP, considero que mi perfil aportara '
            f'un impacto inmediato y medible a los objetivos tecnicos de <b>{company_name}</b>.'
        )
        let_p3 = (
            f'En mis roles en Banco BHD, Banco Popular (a traves de la fabrica NEORIS) y Flai Consulting, he liderado iniciativas de alta complejidad: '
            f'desde la migracion y transformacion de datos hacia la plataforma Temenos T24 sin perdida de integridad, hasta el diseno de microservicios '
            f'desacoplados, protocolos de conciliacion interbancaria RTGS/ACH y optimizacion de flujos logisticos en tiempo real con 99.9% de disponibilidad.'
        )
        let_p4 = (
            f'Como muestra tangible de mi enfoque en automatizacion avanzada, esta postulacion y su expediente tecnico fueron analizados, formateados '
            f'y auditados de forma autonoma por <b>CareerAI Engine</b>, un sistema multi-agente desarrollado por mi persona (<font color="#1E3A8A"><u>joelstalin2105@gmail.com</u></font>). '
            f'Quedo a su completa disposicion para coordinar una entrevista tecnica.'
        )
        let_p5 = (
            'Agradeciendo de antemano su atencion y tiempo,<br/><br/>'
            'Atentamente,<br/>'
            '<b>Joel Stalin Martinez Espinal</b><br/>'
            'Analista Programador Senior & Arquitecto de Sistemas<br/>'
            '+1 849 260 0983 | joelstalin@getupsoft.com | github.com/JoelStalin'
        )

    for p in [let_p1, let_p2, let_p3, let_p4, let_p5]:
        story_let.append(Paragraph(p, body_style))
        story_let.append(Spacer(1, 5))

    doc_let.build(story_let)
    print(f'  [OK] [{idx}/10] {company_name} -> {cv_filename} & {letter_filename}')

print('\nTodos los PDFs profesionales fueron generados exitosamente con ReportLab.')

