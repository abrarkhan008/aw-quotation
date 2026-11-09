// ============================================================
//  DEFAULT SETTINGS  (you can also change all of these inside
//  the app -> Settings tab. No need to edit code.)
// ============================================================
export const defaultSettings = {
  prop: 'IRFAN',
  phone: '9845311576',
  companyName: 'A.W FABRICATION WORKS',
  specialist:
    'Specialist in : Gear Rolling Shutter, Rolling Shutter, Grill Works, Truss Works, Collapsible Gate, Railing & Main Gate, Windows, S.S. Raillings, & All Types of Fabrications Works.',
  address:
    'Hootagalli industrial Area, Opp Automotive Axel, KRS Road, Mysore-570 018',
  accent: '#d62839',
  currency: 'Rs.',
  watermarkEnabled: true,
  watermarkText: 'A.W FABRICATION WORKS',
  watermarkOpacity: 0.08,
  signatureEnabled: false,
  signatureImage: '',
  signatureLabel: 'Authorised Signature',
  footerText: '',
}

const uid = () => Math.random().toString(36).slice(2, 9)
export const newRow = (desc = '', size = '', qty = 1, rate = 0) => ({ id: uid(), desc, size, qty, rate })
export const newTable = (title = '', rows = [newRow()], showRate = false) => ({ id: uid(), title, showRate, rows })

export const todayStr = () => {
  const d = new Date()
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
}

const noArea = { enabled: false, label: 'Total Area', w: 0, h: 0, rate: 0, unit: 'sq ft' }

// ============================================================
//  BUILT-IN TEMPLATES  (edit / add your own here, or use the
//  "Save as template" button inside the app)
// ============================================================
export const builtInTemplates = [
  {
    id: 'gate-grill',
    name: 'Gate / Grill (Photo 1)',
    data: {
      tables: [
        newTable('', [
          newRow('SQUARE TUBE', '62.5MMX62.5MMX14G'),
          newRow('SQUARE TUBE', '18.75MMX18.75MMX16G'),
          newRow('BERCHI'),
          newRow('BALL'),
        ]),
      ],
      notes: [
        'WITH MATERIAL PER SQUARE FIT 220/-  WITH FINISHING ONE CODE YELLOW PRIMER',
        'WITH MATERIAL PER KG 130/-  WITH FINISHING ONE CODE YELLOW PRIMER',
      ],
      area: { ...noArea },
      gst: 0,
    },
  },
  {
    id: 'gate-bright-rod',
    name: 'Gate with Bright Rod (Photo 2)',
    data: {
      tables: [
        newTable('', [
          newRow('SQUARE TUBE', '62.5MMX62.5MMX14G'),
          newRow('SQUARE bright Rod', '12MM(THICK)'),
          newRow('BERCHI'),
          newRow('BALL'),
        ]),
      ],
      notes: [
        'WITH MATERIAL PER SQUARE FIT 220/-  WITH FINISHING ONE CODE YELLOW PRIMER',
        'WITH MATERIAL PER KG 130/-  WITH FINISHING ONE CODE YELLOW PRIMER',
      ],
      area: { ...noArea },
      gst: 0,
    },
  },
  {
    id: 'two-options',
    name: 'Two Options (Photo 1 + Photo 2 tables)',
    data: {
      tables: [
        newTable('Option 1', [
          newRow('SQUARE TUBE', '62.5MMX62.5MMX14G'),
          newRow('SQUARE TUBE', '18.75MMX18.75MMX16G'),
          newRow('BERCHI'),
          newRow('BALL'),
        ]),
        newTable('Option 2', [
          newRow('SQUARE TUBE', '62.5MMX62.5MMX14G'),
          newRow('SQUARE bright Rod', '12MM(THICK)'),
          newRow('BERCHI'),
          newRow('BALL'),
        ]),
      ],
      notes: [
        'WITH MATERIAL PER SQUARE FIT 220/-  WITH FINISHING ONE CODE YELLOW PRIMER',
        'WITH MATERIAL PER KG 130/-  WITH FINISHING ONE CODE YELLOW PRIMER',
      ],
      area: { ...noArea },
      gst: 0,
    },
  },
  {
    id: 'puff-30x40',
    name: '30x40 Site Puff Sheet',
    data: {
      tables: [
        newTable('', [
          newRow('PUFF SHEET (PUF PANEL) ROOFING', '30FT X 40FT'),
          newRow('MS FRAMEWORK / PURLINS', 'AS PER SITE'),
          newRow('SCREWS, FLASHING & FITTINGS', 'AS REQUIRED'),
        ]),
      ],
      notes: [
        'WITH MATERIAL PER SQUARE FIT 220/-  WITH FINISHING ONE CODE YELLOW PRIMER',
        'TRANSPORT AND UNLOADING EXTRA',
      ],
      area: { enabled: true, label: 'Puff Sheet Area', w: 30, h: 40, rate: 220, unit: 'sq ft' },
      gst: 0,
    },
  },
  {
    id: 'blank',
    name: 'Blank',
    data: { tables: [newTable('', [newRow()])], notes: [], area: { ...noArea }, gst: 0 },
  },
]

export const cloneTemplateData = (data) => ({
  ...data,
  tables: data.tables.map((t) => ({ ...t, id: uid(), rows: t.rows.map((r) => ({ ...r, id: uid() })) })),
  notes: [...data.notes],
  area: { ...data.area },
})
