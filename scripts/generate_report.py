#!/usr/bin/env python3
import sys
import json
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.pdfgen import canvas

# Theme Colors
PRIMARY_PURPLE = HexColor('#8B5CF6')  # Purple Accent
DARK_BG = HexColor('#0A0A0F')         # Slate/Black Theme
LIGHT_PURPLE = HexColor('#F3E8FF')    # Light purple highlight
TEXT_COLOR = HexColor('#1F2937')      # Charcoal Text
GRAY_TEXT = HexColor('#4B5563')       # Cool Gray
LINE_COLOR = HexColor('#E5E7EB')      # Light border line
WHITE = HexColor('#FFFFFF')
SUCCESS_GREEN = HexColor('#10B981')
WARNING_YELLOW = HexColor('#F59E0B')
DREAM_RED = HexColor('#EF4444')

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # We don't want header/footer on page 1 (cover page) if we want a clean cover,
        # but let's draw headers/footers for all pages to make it robust, or skip page 1.
        if self._pageNumber == 1:
            # Draw cover page background accents
            self.setFillColor(PRIMARY_PURPLE)
            self.rect(0, 0, 15, 792, fill=True, stroke=False) # Vertical accent bar on left
            self.restoreState()
            return
            
        # Draw Header
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(PRIMARY_PURPLE)
        self.drawString(54, 750, "INDIA COLLEGE INTELLIGENCE PLATFORM")
        self.setFont("Helvetica", 8)
        self.setFillColor(GRAY_TEXT)
        self.drawRightString(612 - 54, 750, "STUDENT PORTFOLIO & CAREER REPORT")
        self.setStrokeColor(PRIMARY_PURPLE)
        self.setLineWidth(0.5)
        self.line(54, 742, 612 - 54, 742)
        
        # Draw Footer
        self.setStrokeColor(LINE_COLOR)
        self.line(54, 50, 612 - 54, 50)
        self.setFont("Helvetica", 8)
        self.setFillColor(GRAY_TEXT)
        self.drawString(54, 38, "Confidential - Prepared for Recruiter/Student Review")
        
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 38, page_str)
        self.restoreState()

def get_mock_data():
    return {
        "studentName": "Amit Sharma",
        "studentEmail": "amit.sharma@example.com",
        "academicProfile": {
            "exam": "JEE Main",
            "rank": "14,520",
            "percentile": "98.72",
            "budget": "2,50,000",
            "branch": "Computer Science & Engineering"
        },
        "planner": {
            "dream": [
                {"name": "IIT Bombay", "fees": 220000, "averagePackage": 25.8, "location": "Mumbai, Maharashtra", "probability": 18},
                {"name": "IIIT Hyderabad", "fees": 360000, "averagePackage": 30.2, "location": "Hyderabad, Telangana", "probability": 25}
            ],
            "target": [
                {"name": "COEP Pune", "fees": 135000, "averagePackage": 11.2, "location": "Pune, Maharashtra", "probability": 68},
                {"name": "VJTI Mumbai", "fees": 85000, "averagePackage": 12.5, "location": "Mumbai, Maharashtra", "probability": 72}
            ],
            "safe": [
                {"name": "VIT Pune", "fees": 180000, "averagePackage": 7.8, "location": "Pune, Maharashtra", "probability": 94},
                {"name": "MIT WPU Pune", "fees": 310000, "averagePackage": 6.5, "location": "Pune, Maharashtra", "probability": 99}
            ]
        },
        "scholarships": [
            {"name": "AICTE Pragati Scholarship Scheme", "benefits": "₹50,000 per annum + support", "eligibility": "Girls studying technical degree"},
            {"name": "MahaDBT Rajarshi Shahu Maharaj Scholarship", "benefits": "50% tuition fee reimbursement", "eligibility": "EBC students in Maharashtra"}
        ],
        "counselorNotes": "Amit shows exceptional aptitude in analytical problem solving. His JEE rank positions him well for top tier Maharashtra colleges. Recommendation: Put VJTI Mumbai as a primary Target, and ensure VIT Pune is locked in as a Safe buffer. Pursue open source contributions in Year 2 to stand out for high-paying dream placements.",
        "roadmap": {
            "course": "Computer Science & Engineering",
            "targetRole": "Software Engineer / Cloud Developer",
            "year1": [
                "Master fundamentals of C++ / Java and Object-Oriented Programming.",
                "Maintain a Cumulative GPA above 8.5 to remain eligible for top placements.",
                "Build 2-3 static web application portfolios and host them on GitHub."
            ],
            "year2": [
                "Focus heavily on Data Structures, Algorithms, and Analysis (LeetCode/CodeChef).",
                "Learn full-stack architectures (React.js, Node.js) and database management.",
                "Participate in regional college hackathons (SIH, local coding contests)."
            ],
            "year3": [
                "Acquire cloud certifications (AWS Practitioner / Google Cloud Associate).",
                "Secure a 2-month summer internship or contribute to active open source repos.",
                "Prepare placement prep resumes, build system design and DBMS foundations."
            ],
            "year4": [
                "Practice intensive mock coding interviews and behavioral rounds.",
                "Target placement drives for top software houses (12 LPA+ packages).",
                "Complete capstone projects and prepare transition into professional engineering."
            ]
        }
    }

def build_pdf(data, output_path_or_stream):
    # Set page margins: 54 pt = 0.75 in
    doc = SimpleDocTemplate(
        output_path_or_stream,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=72,
        bottomMargin=72
    )

    styles = getSampleStyleSheet()
    
    # Custom Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=DARK_BG,
        spaceAfter=10
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=GRAY_TEXT,
        spaceAfter=25
    )
    
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=DARK_BG,
        spaceBefore=15,
        spaceAfter=10,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=PRIMARY_PURPLE,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_COLOR,
        spaceAfter=8
    )
    
    italic_body = ParagraphStyle(
        'ItalicBody_Custom',
        parent=body_style,
        fontName='Helvetica-Oblique',
        textColor=GRAY_TEXT
    )
    
    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_COLOR,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=WHITE
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=TEXT_COLOR
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=TEXT_COLOR
    )

    story = []

    # ================= PAGE 1: COVER PAGE =================
    story.append(Spacer(1, 40))
    story.append(Paragraph("INDIA COLLEGE INTELLIGENCE", ParagraphStyle('CoverPre', fontName='Helvetica-Bold', fontSize=10, leading=12, textColor=PRIMARY_PURPLE, spaceAfter=8)))
    story.append(Paragraph("Student Admission Portfolio & Career Strategy Report", title_style))
    story.append(Paragraph("A data-driven strategy and optimization blueprint mapping college admission probabilities, scholarship recommendations, and career milestone paths.", subtitle_style))
    
    # Decorative horizontal line
    d_line = Table([[""]], colWidths=[504])
    d_line.setStyle(TableStyle([
        ('LINEABOVE', (0,0), (-1,-1), 3, PRIMARY_PURPLE),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(d_line)
    story.append(Spacer(1, 30))
    
    # Academic Profile Card
    story.append(Paragraph("STUDENT PROFILE SNAPSHOT", h2_style))
    profile = data.get("academicProfile", {})
    profile_data = [
        [Paragraph("Student Name:", table_cell_bold), Paragraph(data.get("studentName", "N/A"), table_cell_style),
         Paragraph("Target Course:", table_cell_bold), Paragraph(profile.get("branch", "N/A"), table_cell_style)],
        [Paragraph("Email Address:", table_cell_bold), Paragraph(data.get("studentEmail", "N/A"), table_cell_style),
         Paragraph("Target Exam:", table_cell_bold), Paragraph(profile.get("exam", "N/A"), table_cell_style)],
        [Paragraph("Exam Rank:", table_cell_bold), Paragraph(str(profile.get("rank", "N/A")), table_cell_style),
         Paragraph("Exam Percentile:", table_cell_bold), Paragraph(f"{profile.get('percentile', 'N/A')}%", table_cell_style)],
        [Paragraph("Max Annual Budget:", table_cell_bold), Paragraph(f"₹{profile.get('budget', 'N/A')}", table_cell_style),
         Paragraph("Report Compiled:", table_cell_bold), Paragraph("Dynamically via System Cache", table_cell_style)]
    ]
    profile_table = Table(profile_data, colWidths=[110, 142, 110, 142])
    profile_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HexColor('#FBFBFE')),
        ('BOX', (0,0), (-1,-1), 0.5, LINE_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, LINE_COLOR),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(profile_table)
    
    story.append(Spacer(1, 30))

    # Counselor Executive Summary
    story.append(Paragraph("EXECUTIVE ADVISOR SUMMARY", h2_style))
    story.append(Paragraph(data.get("counselorNotes", "No counselor advisory notes are logged. Focus on building technical profile metrics and cross-referencing college budget compatibility."), italic_body))
    
    story.append(Spacer(1, 40))
    
    # Bottom Callout Box for Verification / Honesty Pass
    honesty_data = [
        [Paragraph("<b>Data Integrity Notice:</b> This report is generated using UGC/NIRF recognized public datasets enriched with local prediction heuristics. Admission probabilities are estimates based on historic cutoffs and do not guarantee final seat allotment.", ParagraphStyle('Notice', parent=body_style, fontSize=8, leading=11, textColor=GRAY_TEXT))]
    ]
    honesty_table = Table(honesty_data, colWidths=[504])
    honesty_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HexColor('#F3F4F6')),
        ('BOX', (0,0), (-1,-1), 0.5, LINE_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(honesty_table)
    
    story.append(PageBreak())

    # ================= PAGE 2: ADMISSION PLANNER (DREAM/TARGET/SAFE) =================
    story.append(Paragraph("1. Dream / Target / Safe Admissions Portfolio", h1_style))
    story.append(Paragraph("A strategic distribution of target colleges across different risk profiles. This protects against cutoff fluctuation and maximizes access to top-tier campuses.", body_style))
    story.append(Spacer(1, 10))

    planner = data.get("planner", {})
    categories = [("Dream (10% - 40% Chance)", planner.get("dream", []), DREAM_RED),
                  ("Target (45% - 75% Chance)", planner.get("target", []), WARNING_YELLOW),
                  ("Safe (80% - 99% Chance)", planner.get("safe", []), SUCCESS_GREEN)]

    for title, items, color_accent in categories:
        story.append(Paragraph(title.upper(), ParagraphStyle('LaneHeading', parent=h2_style, textColor=color_accent)))
        if not items:
            story.append(Paragraph("<i>No colleges added to this category.</i>", body_style))
            story.append(Spacer(1, 8))
            continue
        
        table_rows = [[
            Paragraph("College Name", table_header_style),
            Paragraph("Location", table_header_style),
            Paragraph("Annual Fees", table_header_style),
            Paragraph("Avg Package", table_header_style),
            Paragraph("Fit Prob", table_header_style)
        ]]
        
        for col in items:
            table_rows.append([
                Paragraph(col.get("name", "N/A"), table_cell_bold),
                Paragraph(col.get("location", "N/A"), table_cell_style),
                Paragraph(f"₹{col.get('fees', 0):,}" if isinstance(col.get('fees'), (int, float)) else str(col.get('fees', 'N/A')), table_cell_style),
                Paragraph(f"{col.get('averagePackage', 0)} LPA" if col.get('averagePackage') else 'N/A', table_cell_style),
                Paragraph(f"<b>{col.get('probability', 'N/A')}%</b>", ParagraphStyle('ProbText', parent=table_cell_style, textColor=color_accent))
            ])
            
        t = Table(table_rows, colWidths=[154, 120, 80, 80, 70])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), color_accent),
            ('BACKGROUND', (0,1), (-1,-1), WHITE),
            ('BOX', (0,0), (-1,-1), 0.5, LINE_COLOR),
            ('INNERGRID', (0,0), (-1,-1), 0.5, LINE_COLOR),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t)
        story.append(Spacer(1, 12))

    story.append(Spacer(1, 10))

    # Portfolio Health Assessment Box
    story.append(Paragraph("PORTFOLIO HEALTH ASSESSMENT", h2_style))
    # Quick dynamic health calculations
    num_dream = len(planner.get("dream", []))
    num_target = len(planner.get("target", []))
    num_safe = len(planner.get("safe", []))
    
    health_issues = []
    if num_safe == 0:
        health_issues.append("<b>WARNING: Zero Safe colleges.</b> You have no backup safety options, creating a high risk of being unplaced in early seat allotment rounds.")
    if num_target == 0:
        health_issues.append("<b>ADVISORY: Zero Target colleges.</b> Add 1-2 robust middle-probability options to secure your realistic rank matches.")
    if num_dream == 0:
        health_issues.append("<b>TIP: Zero Dream colleges.</b> Consider adding 1-2 reach institutions where you might slip in via late counselling cutoff relaxation.")
        
    try:
        total_fees = sum([c.get("fees", 0) for c in planner.get("dream", []) + planner.get("target", []) + planner.get("safe", []) if isinstance(c.get("fees"), (int, float))])
        budget_limit = float(str(profile.get("budget", "0")).replace(",", ""))
        if total_fees > budget_limit * 1.5:
            health_issues.append(f"<b>WARNING: High Cumulative Costs.</b> Individual college annual fees or portfolio average exceeds your preferred target annual budget of ₹{profile.get('budget')} by a wide margin.")
    except Exception:
        pass

    if not health_issues:
        health_text = "<b>Portfolio Status: Balanced.</b> Excellent! You have mapped a healthy ratio of safety buffers and reach options within your budget constraints."
        h_color = HexColor('#EAFDF3')
        h_border = SUCCESS_GREEN
    else:
        health_text = "<br/>".join(health_issues)
        h_color = HexColor('#FEF9E7')
        h_border = WARNING_YELLOW

    health_card_data = [[Paragraph(health_text, ParagraphStyle('HealthReportText', parent=body_style, fontSize=8.5, leading=12))]]
    health_card_table = Table(health_card_data, colWidths=[504])
    health_card_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), h_color),
        ('BOX', (0,0), (-1,-1), 1, h_border),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(health_card_table)

    story.append(PageBreak())

    # ================= PAGE 3: SCHOLARSHIPS & CAREER ROADMAP =================
    story.append(Paragraph("2. Scholarship Intelligence & Financial Aid Matches", h1_style))
    story.append(Paragraph("Below are active government schemes and merit-based financial aid scholarships compiled from UGC, AICTE, and state databases matching your criteria.", body_style))
    story.append(Spacer(1, 10))

    scholarships = data.get("scholarships", [])
    if not scholarships:
        story.append(Paragraph("<i>No matching scholarship schemes found for this profile query. Use state/category parameters to re-run matching.</i>", italic_body))
    else:
        sch_rows = [[
            Paragraph("Scholarship Name", table_header_style),
            Paragraph("Eligibility Criteria", table_header_style),
            Paragraph("Financial Benefits", table_header_style)
        ]]
        for sch in scholarships:
            sch_rows.append([
                Paragraph(sch.get("name", "N/A"), table_cell_bold),
                Paragraph(sch.get("eligibility", "N/A"), table_cell_style),
                Paragraph(sch.get("benefits", "N/A"), table_cell_style)
            ])
        sch_table = Table(sch_rows, colWidths=[184, 180, 140])
        sch_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), PRIMARY_PURPLE),
            ('BACKGROUND', (0,1), (-1,-1), WHITE),
            ('BOX', (0,0), (-1,-1), 0.5, LINE_COLOR),
            ('INNERGRID', (0,0), (-1,-1), 0.5, LINE_COLOR),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(sch_table)

    story.append(Spacer(1, 20))
    
    # AI Career Roadmap Section
    story.append(Paragraph("3. AI Career Roadmap Strategy Plan", h1_style))
    roadmap = data.get("roadmap", {})
    target_role = roadmap.get("targetRole", "Software Engineer")
    story.append(Paragraph(f"Year-by-year milestones to secure industry placements for target role: <b>{target_role}</b>", body_style))
    story.append(Spacer(1, 8))

    roadmap_years = [
        ("YEAR 1: FOUNDATION AND FUNDAMENTALS", roadmap.get("year1", [])),
        ("YEAR 2: CORE SPECIALIZATION & SKILL BUILDING", roadmap.get("year2", [])),
        ("YEAR 3: INTERNSHIPS, PROJECTS & CERTIFICATIONS", roadmap.get("year3", [])),
        ("YEAR 4: RECRUITMENT DRIVES & PLACEMENT CRACKING", roadmap.get("year4", []))
    ]

    for title, points in roadmap_years:
        story.append(Paragraph(title, h2_style))
        if not points:
            story.append(Paragraph("• No milestones recorded.", bullet_style))
        else:
            for pt in points:
                story.append(Paragraph(f"• {pt}", bullet_style))
        story.append(Spacer(1, 6))

    story.append(Spacer(1, 20))
    
    # Signature/Approval Stamp Table
    footer_sign_data = [
        [
            Paragraph("<b>Advisor Sign-Off:</b><br/>India College Admissions Intelligence", table_cell_style),
            Paragraph("<b>Generated By:</b><br/>Automated Systems Pipeline", table_cell_style)
        ]
    ]
    sign_table = Table(footer_sign_data, colWidths=[252, 252])
    sign_table.setStyle(TableStyle([
        ('LINEABOVE', (0,0), (-1,-1), 0.5, LINE_COLOR),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(Spacer(1, 15))
    story.append(sign_table)

    # Build the document using the NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)

if __name__ == '__main__':
    # Handle Test Mode
    if len(sys.argv) > 1 and sys.argv[1] == '--test':
        mock_data = get_mock_data()
        test_filename = 'test_report.pdf'
        print(f"Generating test report to {test_filename}...", file=sys.stderr)
        with open(test_filename, 'wb') as f:
            build_pdf(mock_data, f)
        print("Success! Test PDF generated.", file=sys.stderr)
        sys.exit(0)
        
    # Standard Mode: Read from stdin, write to stdout or specified file
    try:
        input_data = sys.stdin.read()
        if not input_data.strip():
            print("Error: Empty JSON input received on stdin.", file=sys.stderr)
            sys.exit(1)
        
        data = json.loads(input_data)
    except Exception as e:
        print(f"Error parsing JSON from stdin: {e}", file=sys.stderr)
        sys.exit(1)

    # Output file target
    if len(sys.argv) > 1:
        out_file = sys.argv[1]
        try:
            with open(out_file, 'wb') as f:
                build_pdf(data, f)
        except Exception as e:
            print(f"Error writing to output file {out_file}: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        # Write to stdout buffer (important on Windows to prevent text-mode translation corruption)
        try:
            build_pdf(data, sys.stdout.buffer)
        except Exception as e:
            print(f"Error writing PDF to stdout buffer: {e}", file=sys.stderr)
            sys.exit(1)
