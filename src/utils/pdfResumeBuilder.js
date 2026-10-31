/**
 * AURA VANCE — CLIENT-SIDE HIGH-RESOLUTION RESUME PDF GENERATOR
 * Generates an ATS-compliant, print-perfect, multi-page vector PDF
 * without external dependencies or screen-capture distortions.
 */

// Helper to escape PDF text strings
function escapePdfText(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, (char) => {
      // Map common typographic characters to standard ASCII / WinAnsi
      if (char === '—' || char === '–') return ' - ';
      if (char === '•') return '*';
      if (char === '’' || char === '‘' || char === '`') return "'";
      if (char === '“' || char === '”') return '"';
      if (char === '…') return '...';
      if (char === '✦' || char === '⚡' || char === '❖') return '*';
      return ' ';
    });
}

// Helper to wrap text into multiple lines
function wrapText(text, maxChars = 84) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + (currentLine ? ' ' : '') + word).length <= maxChars) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Builds standard PDF 1.4 binary string
 */
export function buildResumePdf(data) {
  const { personal, experience, education, skills, projects } = data;

  // Stream commands for Page 1
  const p1 = [];
  // Stream commands for Page 2
  const p2 = [];

  // ==========================================
  // PAGE 1 GENERATION
  // ==========================================

  // Top Accent Bar (Navy to Cyan band)
  p1.push(`0.06 0.12 0.28 rg 40 806 515 4 re f`);
  p1.push(`0.02 0.65 0.78 rg 40 806 80 4 re f`);

  // Name Header
  p1.push(`BT /F2 21 Tf 0.06 0.10 0.22 rg 40 774 Td (${escapePdfText(personal.name.toUpperCase())}) Tj ET`);

  // Professional Title
  p1.push(`BT /F2 10.5 Tf 0.05 0.45 0.72 rg 40 758 Td (${escapePdfText(personal.title)}) Tj ET`);

  // Contact Telemetry Row 1
  p1.push(`BT /F1 8.5 Tf 0.28 0.34 0.44 rg 40 742 Td (${escapePdfText(personal.email)}   |   ${escapePdfText(personal.phone)}   |   ${escapePdfText(personal.location)}) Tj ET`);

  // Contact Telemetry Row 2 (GitHub, LinkedIn, Portfolio)
  const gh = personal.socials.find((s) => s.id === 'github')?.url || 'https://github.com/ohiolei';
  const li = personal.socials.find((s) => s.id === 'linkedin')?.url || 'https://linkedin.com/in/williams-oluwatobiloba-65118016a';
  p1.push(`BT /F1 8 Tf 0.38 0.44 0.54 rg 40 729 Td (GitHub: ${escapePdfText(gh)}   |   LinkedIn: ${escapePdfText(li)}) Tj ET`);

  // Header Divider
  p1.push(`0.82 0.85 0.90 RG 0.75 w 40 718 m 555 718 l S`);

  let y = 698;

  // --- SECTION: PROFESSIONAL SUMMARY ---
  p1.push(`0.06 0.15 0.35 rg 40 ${y} 4 12 re f`);
  p1.push(`BT /F2 10.5 Tf 0.06 0.15 0.35 rg 50 ${y + 2} Td (PROFESSIONAL SUMMARY) Tj ET`);
  p1.push(`0.88 0.90 0.94 RG 0.5 w 195 ${y + 6} m 555 ${y + 6} l S`);
  y -= 14;

  const bioLines = wrapText(personal.bioSummary || personal.tagline, 94);
  for (const line of bioLines) {
    p1.push(`BT /F1 8.8 Tf 0.22 0.26 0.32 rg 40 ${y} Td (${escapePdfText(line)}) Tj ET`);
    y -= 11.5;
  }
  y -= 8;

  // --- SECTION: TECHNICAL SKILLS & COMPETENCIES ---
  p1.push(`0.06 0.15 0.35 rg 40 ${y} 4 12 re f`);
  p1.push(`BT /F2 10.5 Tf 0.06 0.15 0.35 rg 50 ${y + 2} Td (TECHNICAL SKILLS & CORE COMPETENCIES) Tj ET`);
  p1.push(`0.88 0.90 0.94 RG 0.5 w 285 ${y + 6} m 555 ${y + 6} l S`);
  y -= 15;

  const skillGroups = [
    { label: 'Languages & Frameworks:', val: 'PHP (Laravel 11), JavaScript (ES6+), Vue.js, Inertia.js, React, Node.js, Tailwind CSS, Bootstrap, HTML5/CSS3' },
    { label: 'Databases & Cloud Infra:', val: 'MySQL (Schema Design, Query Optimization), AWS (SES, RDS Cloud), Cloudinary API, RESTful APIs, Git/GitHub' },
    { label: 'Architecture & Strengths:', val: 'University ICT Systems, Instant Payment Gateways (10B NGN volume), Single Page Applications, Technical Writing' }
  ];

  for (const group of skillGroups) {
    p1.push(`BT /F2 8.5 Tf 0.12 0.18 0.30 rg 40 ${y} Td (${escapePdfText(group.label)}) Tj ET`);
    p1.push(`BT /F1 8.5 Tf 0.25 0.30 0.38 rg 165 ${y} Td (${escapePdfText(group.val)}) Tj ET`);
    y -= 12.5;
  }
  y -= 8;

  // --- SECTION: PROFESSIONAL EXPERIENCE ---
  p1.push(`0.06 0.15 0.35 rg 40 ${y} 4 12 re f`);
  p1.push(`BT /F2 10.5 Tf 0.06 0.15 0.35 rg 50 ${y + 2} Td (PROFESSIONAL EXPERIENCE) Tj ET`);
  p1.push(`0.88 0.90 0.94 RG 0.5 w 210 ${y + 6} m 555 ${y + 6} l S`);
  y -= 16;

  // Experience 1: TASUED
  const exp1 = experience[0] || {
    role: 'Web Developer & System Programmer',
    company: 'Tai Solarin University of Education (TASUED)',
    period: 'Dec 2022 — Present',
    location: 'Ijagun, Nigeria',
    highlights: [
      'Built a digital reservation & membership system in Laravel + Inertia, streamlining student services and reducing manual paperwork by 60%',
      'Architected secure application deployments utilizing AWS cloud services (SES, RDS)',
      'Led full integration of Cloudinary for optimized image uploads and media delivery, improving portal load speeds by 40%',
      'Maintained institutional portals and student learning management systems serving over 20,000 active students and staff'
    ]
  };

  p1.push(`BT /F2 10 Tf 0.08 0.14 0.26 rg 40 ${y} Td (${escapePdfText(exp1.role)}) Tj ET`);
  p1.push(`BT /F2 8.5 Tf 0.02 0.58 0.68 rg 450 ${y} Td (${escapePdfText(exp1.period)}) Tj ET`);
  y -= 12;

  p1.push(`BT /F3 9 Tf 0.28 0.34 0.44 rg 40 ${y} Td (${escapePdfText(exp1.company)}  |  ${escapePdfText(exp1.location || 'Nigeria')}) Tj ET`);
  y -= 13;

  for (const h of exp1.highlights) {
    p1.push(`0.02 0.58 0.68 rg 42 ${y + 3} 3 3 re f`);
    const bulletLines = wrapText(h, 88);
    for (let bi = 0; bi < bulletLines.length; bi++) {
      p1.push(`BT /F1 8.5 Tf 0.22 0.26 0.32 rg 50 ${y} Td (${escapePdfText(bulletLines[bi])}) Tj ET`);
      y -= 11;
    }
    y -= 1.5;
  }
  y -= 8;

  // Experience 2: Autocredit Payments
  const exp2 = experience[1] || {
    role: 'Full-Stack Laravel Developer',
    company: 'Autocredit Payments',
    period: 'March 2019 — Dec 2020',
    location: 'Ijebu-Ode, Nigeria',
    highlights: [
      'Engineered automated instant payment pipelines processing ~10 Billion NGN in annual settlement volume',
      'Collaborated with an agile cross-functional squad to design system architecture for new financial products',
      'Built dynamic single-page applications (SPAs) with Inertia.js, Laravel, Vue.js, and MySQL with high sub-second response times',
      'Interfaced directly with enterprise clients to gather feedback and refine technical specifications to business needs'
    ]
  };

  p1.push(`BT /F2 10 Tf 0.08 0.14 0.26 rg 40 ${y} Td (${escapePdfText(exp2.role)}) Tj ET`);
  p1.push(`BT /F2 8.5 Tf 0.02 0.58 0.68 rg 450 ${y} Td (${escapePdfText(exp2.period)}) Tj ET`);
  y -= 12;

  p1.push(`BT /F3 9 Tf 0.28 0.34 0.44 rg 40 ${y} Td (${escapePdfText(exp2.company)}  |  ${escapePdfText(exp2.location || 'Nigeria')}) Tj ET`);
  y -= 13;

  for (const h of exp2.highlights) {
    p1.push(`0.02 0.58 0.68 rg 42 ${y + 3} 3 3 re f`);
    const bulletLines = wrapText(h, 88);
    for (let bi = 0; bi < bulletLines.length; bi++) {
      p1.push(`BT /F1 8.5 Tf 0.22 0.26 0.32 rg 50 ${y} Td (${escapePdfText(bulletLines[bi])}) Tj ET`);
      y -= 11;
    }
    y -= 1.5;
  }

  // Footer Page 1
  p1.push(`0.88 0.90 0.94 RG 0.5 w 40 45 m 555 45 l S`);
  p1.push(`BT /F1 7.5 Tf 0.45 0.50 0.60 rg 40 33 Td (${escapePdfText(personal.name)}  -  Curriculum Vitae  |  ${escapePdfText(personal.email)}) Tj ET`);
  p1.push(`BT /F2 7.5 Tf 0.45 0.50 0.60 rg 508 33 Td (Page 1 of 2) Tj ET`);

  // ==========================================
  // PAGE 2 GENERATION
  // ==========================================

  // Page 2 Header Banner
  p2.push(`0.06 0.12 0.28 rg 40 806 515 3 re f`);
  p2.push(`BT /F2 8.5 Tf 0.15 0.22 0.35 rg 40 790 Td (${escapePdfText(personal.name.toUpperCase())}) Tj ET`);
  p2.push(`BT /F1 8 Tf 0.45 0.50 0.60 rg 190 790 Td (Software Engineer & Full-Stack Developer) Tj ET`);
  p2.push(`BT /F1 8 Tf 0.45 0.50 0.60 rg 440 790 Td (${escapePdfText(personal.email)}) Tj ET`);
  p2.push(`0.88 0.90 0.94 RG 0.5 w 40 782 m 555 782 l S`);

  let y2 = 762;

  // --- SECTION: NOTABLE SOFTWARE ENGINEERING PROJECTS ---
  p2.push(`0.06 0.15 0.35 rg 40 ${y2} 4 12 re f`);
  p2.push(`BT /F2 10.5 Tf 0.06 0.15 0.35 rg 50 ${y2 + 2} Td (KEY SOFTWARE PROJECTS & PRODUCTION DEPLOYMENTS) Tj ET`);
  p2.push(`0.88 0.90 0.94 RG 0.5 w 340 ${y2 + 6} m 555 ${y2 + 6} l S`);
  y2 -= 16;

  const featuredList = (projects || []).slice(0, 4);
  for (const proj of featuredList) {
    p2.push(`BT /F2 9.5 Tf 0.08 0.14 0.26 rg 40 ${y2} Td (${escapePdfText(proj.title)}) Tj ET`);
    p2.push(`BT /F3 8 Tf 0.02 0.58 0.68 rg 160 ${y2} Td (${escapePdfText(proj.tags ? proj.tags.slice(0, 4).join(', ') : '')}) Tj ET`);
    if (proj.year) {
      p2.push(`BT /F2 8 Tf 0.45 0.50 0.60 rg 525 ${y2} Td (${escapePdfText(proj.year)}) Tj ET`);
    }
    y2 -= 12;

    const descLines = wrapText(proj.shortDesc || proj.overview || proj.subtitle, 92);
    for (const dl of descLines) {
      p2.push(`BT /F1 8.2 Tf 0.25 0.30 0.40 rg 40 ${y2} Td (${escapePdfText(dl)}) Tj ET`);
      y2 -= 10.5;
    }

    if (proj.achievements && proj.achievements.length > 0) {
      for (const ach of proj.achievements.slice(0, 2)) {
        p2.push(`0.02 0.58 0.68 rg 42 ${y2 + 3} 2.5 2.5 re f`);
        const achLines = wrapText(ach, 88);
        for (const al of achLines) {
          p2.push(`BT /F1 8 Tf 0.32 0.36 0.46 rg 48 ${y2} Td (${escapePdfText(al)}) Tj ET`);
          y2 -= 10;
        }
      }
    }
    y2 -= 8;
  }
  y2 -= 4;

  // --- SECTION: EDUCATION & CREDENTIALS ---
  p2.push(`0.06 0.15 0.35 rg 40 ${y2} 4 12 re f`);
  p2.push(`BT /F2 10.5 Tf 0.06 0.15 0.35 rg 50 ${y2 + 2} Td (EDUCATION & CREDENTIALS) Tj ET`);
  p2.push(`0.88 0.90 0.94 RG 0.5 w 210 ${y2 + 6} m 555 ${y2 + 6} l S`);
  y2 -= 16;

  for (const edu of (education || [])) {
    p2.push(`BT /F2 9.5 Tf 0.08 0.14 0.26 rg 40 ${y2} Td (${escapePdfText(edu.degree)}) Tj ET`);
    p2.push(`BT /F2 8.5 Tf 0.02 0.58 0.68 rg 480 ${y2} Td (${escapePdfText(edu.period)}) Tj ET`);
    y2 -= 12;

    p2.push(`BT /F3 8.5 Tf 0.28 0.34 0.44 rg 40 ${y2} Td (${escapePdfText(edu.institution)}) Tj ET`);
    y2 -= 11;

    if (edu.notes) {
      const noteLines = wrapText(edu.notes, 92);
      for (const nl of noteLines) {
        p2.push(`BT /F1 8 Tf 0.35 0.40 0.50 rg 40 ${y2} Td (${escapePdfText(nl)}) Tj ET`);
        y2 -= 10;
      }
    }
    y2 -= 8;
  }
  y2 -= 4;

  // --- SECTION: LANGUAGES & AVAILABILITY ---
  p2.push(`0.06 0.15 0.35 rg 40 ${y2} 4 12 re f`);
  p2.push(`BT /F2 10.5 Tf 0.06 0.15 0.35 rg 50 ${y2 + 2} Td (LANGUAGES & WORK AUTHORIZATION) Tj ET`);
  p2.push(`0.88 0.90 0.94 RG 0.5 w 270 ${y2 + 6} m 555 ${y2 + 6} l S`);
  y2 -= 15;

  p2.push(`BT /F2 8.5 Tf 0.12 0.18 0.30 rg 40 ${y2} Td (Languages:) Tj ET`);
  p2.push(`BT /F1 8.5 Tf 0.25 0.30 0.38 rg 115 ${y2} Td (English - Fluent / Professional Working Proficiency   |   Yoruba - Native / Bilingual) Tj ET`);
  y2 -= 13;

  p2.push(`BT /F2 8.5 Tf 0.12 0.18 0.30 rg 40 ${y2} Td (Relocation:) Tj ET`);
  p2.push(`BT /F1 8.5 Tf 0.25 0.30 0.38 rg 115 ${y2} Td (Open to Global Relocation (Canada, Europe, UK, Worldwide) & Remote Engineering Roles) Tj ET`);

  // Footer Page 2
  p2.push(`0.88 0.90 0.94 RG 0.5 w 40 45 m 555 45 l S`);
  p2.push(`BT /F1 7.5 Tf 0.45 0.50 0.60 rg 40 33 Td (${escapePdfText(personal.name)}  -  Curriculum Vitae  |  ${escapePdfText(personal.email)}) Tj ET`);
  p2.push(`BT /F2 7.5 Tf 0.45 0.50 0.60 rg 508 33 Td (Page 2 of 2) Tj ET`);

  // Assemble full PDF structure
  const page1Content = p1.join('\n');
  const page2Content = p2.join('\n');

  const objects = [];

  // Obj 1: Catalog
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

  // Obj 2: Pages
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>\nendobj\n`);

  // Obj 3: Page 1
  objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 5 0 R /Resources 7 0 R >>\nendobj\n`);

  // Obj 4: Page 2
  objects.push(`4 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 6 0 R /Resources 7 0 R >>\nendobj\n`);

  // Obj 5: Page 1 Content Stream
  objects.push(`5 0 obj\n<< /Length ${page1Content.length} >>\nstream\n${page1Content}\nendstream\nendobj\n`);

  // Obj 6: Page 2 Content Stream
  objects.push(`6 0 obj\n<< /Length ${page2Content.length} >>\nstream\n${page2Content}\nendstream\nendobj\n`);

  // Obj 7: Resources
  objects.push(`7 0 obj\n<< /Font << /F1 8 0 R /F2 9 0 R /F3 10 0 R >> >>\nendobj\n`);

  // Obj 8: Font F1 (Helvetica)
  objects.push(`8 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`);

  // Obj 9: Font F2 (Helvetica-Bold)
  objects.push(`9 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n`);

  // Obj 10: Font F3 (Helvetica-Oblique)
  objects.push(`10 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>\nendobj\n`);

  // Obj 11: Info
  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  objects.push(`11 0 obj\n<< /Title (${escapePdfText(personal.name)} - Resume) /Author (${escapePdfText(personal.name)}) /Subject (Software Engineer & Full-Stack Developer Resume) /Creator (Aura Vance Resume Engine) /CreationDate (D:${dateStr}Z) >>\nendobj\n`);

  // Build PDF file string with xref table
  const header = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`;
  let currentOffset = header.length;
  const offsets = [];

  for (const obj of objects) {
    offsets.push(currentOffset);
    currentOffset += obj.length;
  }

  const xrefOffset = currentOffset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    xref += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 11 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const fullPdfString = header + objects.join('') + xref + trailer;

  // Convert binary ASCII string to Uint8Array
  const buffer = new Uint8Array(fullPdfString.length);
  for (let i = 0; i < fullPdfString.length; i++) {
    buffer[i] = fullPdfString.charCodeAt(i) & 0xff;
  }

  return new Blob([buffer], { type: 'application/pdf' });
}

/**
 * Triggers instant browser download of the built vector PDF
 */
export function downloadResumePdf(data, filename = 'Oluwatobiloba_Williams_Resume.pdf') {
  const blob = buildResumePdf(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Opens the built vector PDF in a new browser tab for clean preview
 */
export function previewResumePdf(data) {
  const blob = buildResumePdf(data);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
