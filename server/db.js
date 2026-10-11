const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Pre-computed hashes for seed users:
// Admin: renature.nmamit.nitte@gmail.com or admin@renature.org / Renature@2026 or Admin@123
// Member: member@renature.org / Member@123
const ADMIN_HASH = bcrypt.hashSync('Renature@2026', 10);
const MEMBER_HASH = bcrypt.hashSync('Member@123', 10);

// In-Memory Database Store (Active when external PostgreSQL is not connected)
const memoryDb = {
  users: [
    {
      id: 1,
      name: 'renature Admin',
      email: 'renature.nmamit.nitte@gmail.com',
      usn: '1RN22CS001',
      phone: '+91 8258 281263',
      password_hash: ADMIN_HASH,
      role: 'admin',
      department: 'Environmental Engineering',
      year: '4th Year',
      created_at: new Date('2026-01-10T10:00:00Z'),
    },
    {
      id: 10,
      name: 'renature Admin Secondary',
      email: 'admin@renature.org',
      usn: '1RN22CS002',
      phone: '+91 98765 43210',
      password_hash: ADMIN_HASH,
      role: 'admin',
      department: 'Environmental Engineering',
      year: '4th Year',
      created_at: new Date('2026-01-10T10:00:00Z'),
    },
    {
      id: 2,
      name: 'Aarav Patel',
      email: 'member@renature.org',
      usn: '1RN23EC045',
      phone: '+91 98765 12345',
      password_hash: MEMBER_HASH,
      role: 'member',
      department: 'Electronics & Communication',
      year: '3rd Year',
      created_at: new Date('2026-02-15T10:00:00Z'),
    },
    {
      id: 3,
      name: 'Diya Sharma',
      email: 'diya@renature.org',
      usn: '1RN24CS089',
      phone: '+91 98765 67890',
      password_hash: MEMBER_HASH,
      role: 'member',
      department: 'Computer Science',
      year: '2nd Year',
      created_at: new Date('2026-03-01T10:00:00Z'),
    },
    {
      id: 4,
      name: 'Rohan Deshmukh',
      email: 'rohan@renature.org',
      usn: '1RN23ME012',
      phone: '+91 98765 99887',
      password_hash: MEMBER_HASH,
      role: 'member',
      department: 'Mechanical Engineering',
      year: '3rd Year',
      created_at: new Date('2026-03-05T10:00:00Z'),
    }
  ],

  events: [
    {
      id: 1,
      title: 'Campus Native Tree Plantation Drive 2026',
      description: 'Join hands with students and environmental scientists to plant 500+ indigenous saplings (Neem, Peepal, Jamun) across the north botanical grounds to restore local soil microbiome and foster urban green cover.',
      image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      category: 'Nature Walk',
      event_date: '2026-10-15',
      start_time: '09:00:00',
      end_time: '13:00:00',
      venue: 'North Campus Botanical Grounds',
      registration_deadline: '2026-10-14T23:59:59Z',
      max_participants: 100,
      status: 'published',
      points_available: 50,
      eligibility: 'Open to all university students and faculty members',
      rules: 'Wear comfortable field clothing and sturdy boots. Gardening gloves, saplings, and hand tools provided on site. Bring a reusable water flask.',
      organizer_info: 'Renature Eco Club in partnership with Dept of Botany',
      created_by: 1,
      created_at: new Date('2026-03-10T10:00:00Z'),
      updated_at: new Date('2026-03-10T10:00:00Z'),
    },
    {
      id: 2,
      title: 'Lakeside Cleanup & Plastic Brand Audit',
      description: 'An ecological clean-up operation around Bellandur lakefront wetland zone. Volunteers will collect shoreline waste and conduct a structured brand audit to identify key industrial plastic contributors.',
      image_url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80',
      category: 'Cleanup Drive',
      event_date: '2026-10-22',
      start_time: '07:30:00',
      end_time: '11:30:00',
      venue: 'Bellandur Lakefront Wetland Zone',
      registration_deadline: '2026-10-21T23:59:59Z',
      max_participants: 60,
      status: 'published',
      points_available: 45,
      eligibility: 'All registered club members and passionate volunteers',
      rules: 'Safety gloves and grabbers provided. Separate hazardous waste into designated bins. No single-use plastics permitted on site.',
      organizer_info: 'Renature Clean Earth Working Group',
      created_by: 1,
      created_at: new Date('2026-03-12T10:00:00Z'),
      updated_at: new Date('2026-03-12T10:00:00Z'),
    },
    {
      id: 3,
      title: 'Dawn Birdwatching & Urban Avian Census',
      description: 'Field expedition guided by certified ornithologists to record resident and migratory bird species around the Bannerghatta forest perimeter. Data gathered contributes directly to regional biodiversity censuses.',
      image_url: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&auto=format&fit=crop&q=80',
      category: 'Nature Walk',
      event_date: '2026-11-05',
      start_time: '06:00:00',
      end_time: '09:30:00',
      venue: 'Bannerghatta Forest Perimeter Trail',
      registration_deadline: '2026-11-04T18:00:00Z',
      max_participants: 40,
      status: 'published',
      points_available: 35,
      eligibility: 'Open to all university students',
      rules: 'Binoculars and digital checklists provided. Maintain silence along trails. Do not feed or disturb nesting birds.',
      organizer_info: 'Wildlife Wing, Renature',
      created_by: 1,
      created_at: new Date('2026-03-14T10:00:00Z'),
      updated_at: new Date('2026-03-14T10:00:00Z'),
    },
    {
      id: 4,
      title: 'Workshop: Zero-Waste Balcony Composting',
      description: 'Hands-on practical masterclass explaining aerobic composting, Bokashi fermentation, kitchen waste segregation, and nutrient-dense soil conditioning for urban student apartments.',
      image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2252a?w=800&auto=format&fit=crop&q=80',
      category: 'Workshop',
      event_date: '2026-11-12',
      start_time: '14:00:00',
      end_time: '17:00:00',
      venue: 'Student Activity Center, Hall 2',
      registration_deadline: '2026-11-11T20:00:00Z',
      max_participants: 50,
      status: 'published',
      points_available: 25,
      eligibility: 'All students and campus residents',
      rules: 'Starter Bokashi bran kits and airtight fermenters will be distributed to attendees.',
      organizer_info: 'Renature Circular Economy Taskforce',
      created_by: 1,
      created_at: new Date('2026-03-15T10:00:00Z'),
      updated_at: new Date('2026-03-15T10:00:00Z'),
    },
    {
      id: 5,
      title: 'Climate-Tech Hackathon: River Basin Monitoring',
      description: '36-hour competitive hackathon bringing together hardware makers, data scientists, and environmental engineers to prototype low-cost open-source water quality telemetry sensors.',
      image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      category: 'Competition',
      event_date: '2026-12-01',
      start_time: '10:00:00',
      end_time: '18:00:00',
      venue: 'Incubation & Innovation Lab, Block 4',
      registration_deadline: '2026-11-28T23:59:59Z',
      max_participants: 80,
      status: 'published',
      points_available: 100,
      eligibility: 'Teams of 2 to 4 undergraduate and graduate students',
      rules: 'Sensor microcontrollers (ESP32) and basic probes provided. Mentors on site. All project code must be published under open-source licenses.',
      organizer_info: 'Renature Tech Team & IEEE Student Branch',
      created_by: 1,
      created_at: new Date('2026-03-18T10:00:00Z'),
      updated_at: new Date('2026-03-18T10:00:00Z'),
    }
  ],

  event_registrations: [
    {
      id: 1,
      event_id: 1,
      reference_id: 'RN-2026-TREE-001',
      full_name: 'Aarav Patel',
      student_id: '1RN23EC045',
      email: 'member@renature.org',
      phone: '+91 98765 12345',
      department: 'Electronics & Communication',
      year: '3rd Year',
      status: 'accepted',
      registered_at: new Date('2026-03-12T14:20:00Z'),
      accepted_at: new Date('2026-03-13T10:00:00Z'),
      rejected_at: null,
      accepted_by: 1,
    },
    {
      id: 2,
      event_id: 1,
      reference_id: 'RN-2026-TREE-002',
      full_name: 'Diya Sharma',
      student_id: '1RN24CS089',
      email: 'diya@renature.org',
      phone: '+91 98765 67890',
      department: 'Computer Science',
      year: '2nd Year',
      status: 'accepted',
      registered_at: new Date('2026-03-13T09:15:00Z'),
      accepted_at: new Date('2026-03-14T11:00:00Z'),
      rejected_at: null,
      accepted_by: 1,
    },
    {
      id: 3,
      event_id: 2,
      reference_id: 'RN-2026-CLEAN-003',
      full_name: 'Rohan Deshmukh',
      student_id: '1RN23ME012',
      email: 'rohan@renature.org',
      phone: '+91 98765 99887',
      department: 'Mechanical Engineering',
      year: '3rd Year',
      status: 'accepted',
      registered_at: new Date('2026-03-14T16:30:00Z'),
      accepted_at: new Date('2026-03-15T09:00:00Z'),
      rejected_at: null,
      accepted_by: 1,
    },
    {
      id: 4,
      event_id: 2,
      reference_id: 'RN-2026-CLEAN-004',
      full_name: 'Ananya Iyer',
      student_id: '1RN23BT031',
      email: 'ananya.iyer@renature.org',
      phone: '+91 98765 33445',
      department: 'Biotechnology',
      year: '3rd Year',
      status: 'pending',
      registered_at: new Date('2026-03-16T11:05:00Z'),
      accepted_at: null,
      rejected_at: null,
      accepted_by: null,
    }
  ],

  attendance: [
    {
      id: 1,
      event_id: 1,
      registration_id: 1,
      status: 'present',
      marked_by: 1,
      marked_at: new Date('2026-03-15T09:30:00Z'),
    },
    {
      id: 2,
      event_id: 1,
      registration_id: 2,
      status: 'present',
      marked_by: 1,
      marked_at: new Date('2026-03-15T09:35:00Z'),
    },
    {
      id: 3,
      event_id: 2,
      registration_id: 3,
      status: 'present',
      marked_by: 1,
      marked_at: new Date('2026-03-16T08:00:00Z'),
    }
  ],

  event_results: [
    {
      id: 1,
      event_id: 1,
      registration_id: 1,
      marks: 95.0,
      points: 50.0,
      rank: 1,
      remarks: 'Outstanding dedication during sapling planting and soil preparation',
      created_at: new Date('2026-03-15T14:00:00Z'),
    },
    {
      id: 2,
      event_id: 1,
      registration_id: 2,
      marks: 90.0,
      points: 45.0,
      rank: 2,
      remarks: 'Excellent team coordination and tree cataloging',
      created_at: new Date('2026-03-15T14:05:00Z'),
    },
    {
      id: 3,
      event_id: 2,
      registration_id: 3,
      marks: 88.0,
      points: 40.0,
      rank: 3,
      remarks: 'Led lakefront plastic audit data collection',
      created_at: new Date('2026-03-16T12:00:00Z'),
    }
  ],

  resources: [
    {
      id: 1,
      title: 'Indigenous Trees of Karnataka: Field Identification Guide',
      description: 'High-resolution photographic field manual describing 80+ native canopy species suitable for semi-arid urban afforestation.',
      category: 'Guide',
      image_url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80',
      external_url: 'https://en.wikipedia.org/wiki/Flora_of_India',
      tags: 'Botany, Native Trees, Afforestation, Biodiversity',
      created_at: new Date('2026-02-01T10:00:00Z'),
    },
    {
      id: 2,
      title: 'Decentralized Organic Composting: Protocols & Problem Solving',
      description: 'Step-by-step handbook covering aerobic pile mechanics, temperature balancing, Bokashi inoculants, and odor troubleshooting.',
      category: 'Handbook',
      image_url: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=800&auto=format&fit=crop&q=80',
      external_url: 'https://www.epa.gov/recycle/composting-home',
      tags: 'Composting, Soil, Circular Economy, Organic Waste',
      created_at: new Date('2026-02-10T10:00:00Z'),
    },
    {
      id: 3,
      title: 'Citizen Science: Acoustic Bird Call Recording & Census',
      description: 'Best practice guide on capturing clean bird audio recordings in urban parks and logging them into eBird and Macaulay Library.',
      category: 'Research',
      image_url: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800&auto=format&fit=crop&q=80',
      external_url: 'https://ebird.org',
      tags: 'Ornithology, Wildlife, Field Survey, eBird',
      created_at: new Date('2026-02-20T10:00:00Z'),
    },
    {
      id: 4,
      title: 'Rooftop Rainwater Harvesting Engineering Reference',
      description: 'Formulas and runoff coefficient tables for designing recharge percolation pits and sand-gravel filters for institutional buildings.',
      category: 'Technical',
      image_url: 'https://images.unsplash.com/photo-1516900557549-41557d405adf?w=800&auto=format&fit=crop&q=80',
      external_url: 'https://en.wikipedia.org/wiki/Rainwater_harvesting',
      tags: 'Hydrology, Water Conservation, Sustainability',
      created_at: new Date('2026-03-01T10:00:00Z'),
    }
  ],

  site_content: {
    about: {
      hero_title: 'About renature',
      hero_subtitle: 'A passionate community of engineering students and nature enthusiasts cultivating biodiversity, ecological action, and campus sustainability.',
      story_title: 'From a small weekend initiative to a campus-wide movement.',
      story_paragraph1: 'renature started with a simple idea: that students have the power to create tangible environmental change. What began as a small group of nature enthusiasts has grown into a structured platform supporting native afforestation, wetland cleaning, and wildlife censuses.',
      story_paragraph2: 'We believe that by reconnecting with nature and combining field action with modern tracking tools, we can build a resilient, green campus that inspires sustainable practices for decades to come.',
      president_name: 'Ashmit',
      president_dept: 'Biotechnology',
      vice_president_name: 'Shia Bangera',
      vice_president_dept: 'Mechanical Eng',
      team_members: [],
      benefits: [
        'Gain hands-on experience in environmental conservation & fieldwork',
        'Connect with like-minded peers, researchers, and ecology experts',
        'Earn verified volunteer hours and certificates for active participation',
        'Develop leadership, project coordination, and organizational skills',
        'Contribute directly to a healthier, greener campus and surrounding lakes'
      ]
    },
    contact: {
      email: 'renature.nmamit.nitte@gmail.com',
      phone: '+91 8258 281263 / +91 94812 34567',
      address: 'NMAM Institute of Technology, Nitte, Karkala Taluk, Udupi - 574110, Karnataka',
      room: 'Student Activity Center, Cabin 104, Green Wing',
      hours: 'Mon – Sat: 9:00 AM – 5:30 PM (Field Expeditions on Weekends)',
      instagram: 'https://instagram.com/renature_nmamit/',
      linkedin: 'https://linkedin.com/company/renature-nmamit/',
      twitter: 'https://x.com/renature_club',
      about_club_summary: 'renature is a student-led ecological and sustainability movement at NMAMIT dedicated to fostering biodiversity consciousness, hands-on afforestation, clean-up drives, and conservation education.'
    },
    home: {
      headline: 'Modern Environmental Action. Rooted in Community.',
      subtitle: 'Join student engineers, scientists, and naturalists cultivating campus sustainability through hands-on reforestation, biodiversity tracking, and verified ecological drives.',
      announcement: 'Upcoming Campus Tree Plantation Drive on Oct 15! Registrations open to all students.',
      announcement_active: true
    }
  }
};

let nextId = {
  users: 5,
  events: 6,
  event_registrations: 5,
  attendance: 4,
  event_results: 4,
  resources: 5
};

// Check if external Postgres is explicitly configured
let realPool = null;
const hasDbConfig = Boolean(
  process.env.DATABASE_URL ||
  (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1')
);

if (hasDbConfig) {
  try {
    realPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      connectionTimeoutMillis: 3000,
    });
    realPool.on('error', (err) => {
      console.warn('[AI Studio] PostgreSQL idle error, continuing with in-memory store:', err.message);
    });
  } catch (err) {
    console.warn('[AI Studio] PostgreSQL pool init failed, using in-memory store:', err.message);
    realPool = null;
  }
}

// In-Memory Query Engine
function executeMemoryQuery(text, params = []) {
  const sql = text.trim();
  const normalized = sql.replace(/\s+/g, ' ');

  // 1. Users Queries
  if (/^SELECT\s+id\s+FROM\s+users\s+WHERE\s+(LOWER\()?email\)?\s*=/i.test(normalized)) {
    const email = (params[0] || '').toLowerCase().trim();
    const row = memoryDb.users.find(u => (u.email || '').toLowerCase().trim() === email);
    return { rows: row ? [{ id: row.id }] : [] };
  }

  if (/^SELECT\s+\*\s+FROM\s+users\s+WHERE\s+(LOWER\()?email\)?\s*=/i.test(normalized)) {
    const email = (params[0] || '').toLowerCase().trim();
    const row = memoryDb.users.find(u => (u.email || '').toLowerCase().trim() === email);
    return { rows: row ? [{ ...row }] : [] };
  }

  if (/^SELECT\s+id,\s*name,\s*email,\s*usn,\s*phone,\s*role\s+FROM\s+users\s+WHERE\s+id\s*=/i.test(normalized)) {
    const id = parseInt(params[0], 10);
    const row = memoryDb.users.find(u => u.id === id);
    if (!row) return { rows: [] };
    const { id: uId, name, email, usn, phone, role } = row;
    return { rows: [{ id: uId, name, email, usn, phone, role }] };
  }

  if (/^UPDATE\s+users\s+SET\s+password_hash\s*=/i.test(normalized)) {
    const [passwordHash, identifier] = params;
    const cleanId = (identifier || '').toString().toLowerCase().trim();
    const user = memoryDb.users.find(u => 
      u.id.toString() === cleanId || 
      (u.email || '').toLowerCase().trim() === cleanId
    );
    if (!user) return { rows: [] };
    user.password_hash = passwordHash;
    return { rows: [{ id: user.id, email: user.email, name: user.name }] };
  }

  if (/^INSERT\s+INTO\s+users/i.test(normalized)) {
    // (name, email, usn, phone, password_hash, role, department, year)
    const [name, email, usn, phone, passwordHash, role = 'member', department, year] = params;
    const newUser = {
      id: nextId.users++,
      name,
      email,
      usn: usn || null,
      phone: phone || null,
      password_hash: passwordHash,
      role: role || 'member',
      department: department || 'Computer Science',
      year: year || '1st Year',
      created_at: new Date()
    };
    memoryDb.users.push(newUser);
    return { rows: [{ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, department: newUser.department, year: newUser.year }] };
  }

  // 2. Events Queries
  // List events with registered count
  if (/FROM\s+events\s+e\s+WHERE\s+1=1/i.test(normalized)) {
    let list = memoryDb.events.map(e => {
      const regCount = memoryDb.event_registrations.filter(r => r.event_id === e.id).length;
      return {
        ...e,
        banner_url: e.image_url,
        registered_count: regCount,
        available_seats: e.max_participants ? (e.max_participants - regCount) : null
      };
    });

    // Check filters from sql/params
    if (/e\.category\s*=/i.test(normalized)) {
      // Find category param
      const catMatch = normalized.match(/e\.category\s*=\s*\$(\d+)/i);
      if (catMatch) {
        const catVal = params[parseInt(catMatch[1], 10) - 1];
        if (catVal) list = list.filter(e => e.category === catVal);
      }
    }

    if (/e\.status\s*<>\s*['"]draft['"]/i.test(normalized)) {
      list = list.filter(e => e.status !== 'draft');
    } else if (/e\.status\s*=\s*['"]published['"]/i.test(normalized)) {
      list = list.filter(e => e.status === 'published');
    } else if (/e\.status\s*=\s*\$(\d+)/i.test(normalized)) {
      const statusMatch = normalized.match(/e\.status\s*=\s*\$(\d+)/i);
      const statusVal = params[parseInt(statusMatch[1], 10) - 1];
      if (statusVal && statusVal !== 'all') {
        list = list.filter(e => e.status === statusVal);
      }
    }

    if (/ILIKE/i.test(normalized)) {
      const searchMatch = normalized.match(/\$(\d+)/g);
      if (searchMatch) {
        // Find search param
        const searchParam = params.find(p => typeof p === 'string' && p.startsWith('%') && p.endsWith('%'));
        if (searchParam) {
          const term = searchParam.replace(/%/g, '').toLowerCase();
          list = list.filter(e =>
            (e.title && e.title.toLowerCase().includes(term)) ||
            (e.description && e.description.toLowerCase().includes(term))
          );
        }
      }
    }

    // Sort by event_date desc
    list.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
    return { rows: list };
  }

  // Get single event
  if (/FROM\s+events\s+e\s+WHERE\s+e\.id\s*=\s*\$1/i.test(normalized)) {
    const id = parseInt(params[0], 10);
    const event = memoryDb.events.find(e => e.id === id);
    if (!event) return { rows: [] };
    const regCount = memoryDb.event_registrations.filter(r => r.event_id === id).length;
    return {
      rows: [{
        ...event,
        banner_url: event.image_url,
        registered_count: regCount,
        available_seats: event.max_participants ? (event.max_participants - regCount) : null
      }]
    };
  }

  // Select * from events where id = $1
  if (/^SELECT\s+\*\s+FROM\s+events\s+WHERE\s+id\s*=\s*\$1/i.test(normalized)) {
    const id = parseInt(params[0], 10);
    const event = memoryDb.events.find(e => e.id === id);
    return { rows: event ? [{ ...event, banner_url: event.image_url }] : [] };
  }

  // Insert event
  if (/^INSERT\s+INTO\s+events/i.test(normalized)) {
    if (/SELECT\s+title/i.test(normalized)) {
      // Duplicate event
      const [createdBy, origId] = params;
      const orig = memoryDb.events.find(e => e.id === parseInt(origId, 10));
      if (!orig) return { rows: [] };
      const newEv = {
        ...orig,
        id: nextId.events++,
        title: orig.title + ' (Copy)',
        status: 'draft',
        created_by: createdBy,
        created_at: new Date(),
        updated_at: new Date()
      };
      memoryDb.events.unshift(newEv);
      return { rows: [newEv] };
    }

    const [
      title, description, image_url, category, event_date, start_time, end_time,
      venue, registration_deadline, max_participants, status, points_available,
      eligibility, rules, organizer_info, created_by
    ] = params;

    const newEv = {
      id: nextId.events++,
      title,
      description,
      image_url: image_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      category: category || 'Other',
      event_date,
      start_time: start_time || '',
      end_time: end_time || '',
      venue: venue || '',
      registration_deadline: registration_deadline || null,
      max_participants: max_participants ? parseInt(max_participants, 10) : null,
      status: status || 'draft',
      points_available: points_available ? parseInt(points_available, 10) : 0,
      eligibility: eligibility || '',
      rules: rules || '',
      organizer_info: organizer_info || '',
      created_by: created_by || 1,
      created_at: new Date(),
      updated_at: new Date(),
    };
    memoryDb.events.unshift(newEv);
    return { rows: [newEv] };
  }

  // Update event
  if (/^UPDATE\s+events\s+SET/i.test(normalized)) {
    if (/status\s*=\s*\$1/i.test(normalized) && params.length === 2) {
      const [status, id] = params;
      const ev = memoryDb.events.find(e => e.id === parseInt(id, 10));
      if (!ev) return { rows: [] };
      ev.status = status;
      ev.updated_at = new Date();
      return { rows: [ev] };
    }

    const id = parseInt(params[15], 10);
    const ev = memoryDb.events.find(e => e.id === id);
    if (!ev) return { rows: [] };

    const [
      title, description, image_url, category, event_date, start_time, end_time,
      venue, registration_deadline, max_participants, status, points_available,
      eligibility, rules, organizer_info
    ] = params;

    if (title !== null && title !== undefined) ev.title = title;
    if (description !== null && description !== undefined) ev.description = description;
    if (image_url !== null && image_url !== undefined) ev.image_url = image_url;
    if (category !== null && category !== undefined) ev.category = category;
    if (event_date !== null && event_date !== undefined) ev.event_date = event_date;
    if (start_time !== null && start_time !== undefined) ev.start_time = start_time;
    if (end_time !== null && end_time !== undefined) ev.end_time = end_time;
    if (venue !== null && venue !== undefined) ev.venue = venue;
    if (registration_deadline !== null && registration_deadline !== undefined) ev.registration_deadline = registration_deadline;
    if (max_participants !== null && max_participants !== undefined) ev.max_participants = parseInt(max_participants, 10);
    if (status !== null && status !== undefined) ev.status = status;
    if (points_available !== null && points_available !== undefined) ev.points_available = parseInt(points_available, 10);
    if (eligibility !== null && eligibility !== undefined) ev.eligibility = eligibility;
    if (rules !== null && rules !== undefined) ev.rules = rules;
    if (organizer_info !== null && organizer_info !== undefined) ev.organizer_info = organizer_info;
    ev.updated_at = new Date();

    return { rows: [ev] };
  }

  // Delete event
  if (/^DELETE\s+FROM\s+events\s+WHERE\s+id\s*=\s*\$1/i.test(normalized)) {
    const id = parseInt(params[0], 10);
    const idx = memoryDb.events.findIndex(e => e.id === id);
    if (idx === -1) return { rows: [] };
    memoryDb.events.splice(idx, 1);
    // Also remove registrations
    memoryDb.event_registrations = memoryDb.event_registrations.filter(r => r.event_id !== id);
    return { rows: [{ id }] };
  }

  // 3. Registrations Queries
  if (/SELECT\s+COUNT\(\*\)\s+FROM\s+event_registrations\s+WHERE\s+event_id\s*=\s*\$1/i.test(normalized)) {
    const eventId = parseInt(params[0], 10);
    const count = memoryDb.event_registrations.filter(r => r.event_id === eventId).length;
    return { rows: [{ count: count.toString() }] };
  }

  if (/SELECT\s+\*\s+FROM\s+event_registrations\s+WHERE\s+event_id\s*=\s*\$1\s+AND\s+email\s*=\s*\$2/i.test(normalized)) {
    const [eventId, email] = params;
    const reg = memoryDb.event_registrations.find(
      r => r.event_id === parseInt(eventId, 10) && r.email.toLowerCase() === (email || '').toLowerCase()
    );
    return { rows: reg ? [reg] : [] };
  }

  if (/SELECT\s+reference_id\s+FROM\s+event_registrations\s+WHERE\s+event_id\s*=\s*\$1\s+AND\s+email\s*=\s*\$2/i.test(normalized)) {
    const [eventId, email] = params;
    const reg = memoryDb.event_registrations.find(
      r => r.event_id === parseInt(eventId, 10) && r.email.toLowerCase() === (email || '').toLowerCase()
    );
    return { rows: reg ? [{ reference_id: reg.reference_id }] : [] };
  }

  if (/^INSERT\s+INTO\s+event_registrations/i.test(normalized)) {
    const [eventId, referenceId, fullName, studentId, email, phone, department, year] = params;
    const newReg = {
      id: nextId.event_registrations++,
      event_id: parseInt(eventId, 10),
      reference_id: referenceId,
      full_name: fullName,
      student_id: studentId,
      email,
      phone: phone || '',
      department: department || '',
      year: year || '',
      status: 'pending',
      registered_at: new Date(),
      accepted_at: null,
      rejected_at: null,
      accepted_by: null
    };
    memoryDb.event_registrations.unshift(newReg);
    return { rows: [newReg] };
  }

  if (/^SELECT\s+\*\s+FROM\s+event_registrations\s+WHERE\s+event_id\s*=/i.test(normalized)) {
    const eventId = parseInt(params[0], 10);
    let list = memoryDb.event_registrations.filter(r => r.event_id === eventId);
    return { rows: list };
  }

  if (/SELECT\s+er\.\*,\s*e\.title\s+as\s+event_title\s+FROM\s+event_registrations/i.test(normalized)) {
    const limit = params[0] ? parseInt(params[0], 10) : 10;
    const list = memoryDb.event_registrations.map(r => {
      const ev = memoryDb.events.find(e => e.id === r.event_id);
      return { ...r, event_title: ev ? ev.title : 'Event' };
    }).slice(0, limit);
    return { rows: list };
  }

  if (/^UPDATE\s+event_registrations\s+SET\s+status\s*=/i.test(normalized)) {
    const status = params[0];
    const id = parseInt(params[params.length - 1], 10);
    const reg = memoryDb.event_registrations.find(r => r.id === id);
    if (!reg) return { rows: [] };
    reg.status = status;
    if (status === 'accepted') {
      reg.accepted_at = new Date();
      reg.accepted_by = params[1] || 1;
    } else if (status === 'rejected') {
      reg.rejected_at = new Date();
    }
    return { rows: [reg] };
  }

  // 4. Attendance Queries
  if (/INSERT\s+INTO\s+attendance/i.test(normalized)) {
    const [eventId, regId, status, markedBy] = params;
    const existing = memoryDb.attendance.find(
      a => a.event_id === parseInt(eventId, 10) && a.registration_id === parseInt(regId, 10)
    );
    if (existing) {
      existing.status = status;
      existing.marked_by = markedBy;
      existing.marked_at = new Date();
      return { rows: [existing] };
    }
    const newAtt = {
      id: nextId.attendance++,
      event_id: parseInt(eventId, 10),
      registration_id: parseInt(regId, 10),
      status,
      marked_by: markedBy,
      marked_at: new Date()
    };
    memoryDb.attendance.push(newAtt);
    return { rows: [newAtt] };
  }

  if (/UPDATE\s+attendance\s+SET/i.test(normalized)) {
    const [status, markedBy, id] = params;
    const att = memoryDb.attendance.find(a => a.id === parseInt(id, 10));
    if (!att) return { rows: [] };
    att.status = status;
    att.marked_by = markedBy;
    att.marked_at = new Date();
    return { rows: [att] };
  }

  if (/FROM\s+attendance\s+a\s+JOIN\s+event_registrations/i.test(normalized)) {
    const eventId = parseInt(params[0], 10);
    const records = memoryDb.attendance
      .filter(a => a.event_id === eventId)
      .map(a => {
        const reg = memoryDb.event_registrations.find(r => r.id === a.registration_id) || {};
        return {
          ...a,
          full_name: reg.full_name || '',
          student_id: reg.student_id || '',
          email: reg.email || '',
          department: reg.department || ''
        };
      });
    return { rows: records };
  }

  // 5. Results Queries
  if (/INSERT\s+INTO\s+event_results/i.test(normalized)) {
    const [eventId, regId, marks, points, rank, remarks] = params;
    const existing = memoryDb.event_results.find(
      r => r.event_id === parseInt(eventId, 10) && r.registration_id === parseInt(regId, 10)
    );
    if (existing) {
      if (marks !== null && marks !== undefined) existing.marks = marks;
      if (points !== null && points !== undefined) existing.points = points;
      if (rank !== null && rank !== undefined) existing.rank = rank;
      if (remarks !== null && remarks !== undefined) existing.remarks = remarks;
      return { rows: [existing] };
    }
    const newRes = {
      id: nextId.event_results++,
      event_id: parseInt(eventId, 10),
      registration_id: parseInt(regId, 10),
      marks: marks || 0,
      points: points || 0,
      rank: rank || null,
      remarks: remarks || '',
      created_at: new Date()
    };
    memoryDb.event_results.push(newRes);
    return { rows: [newRes] };
  }

  if (/UPDATE\s+event_results\s+SET/i.test(normalized)) {
    const [marks, points, rank, remarks, id] = params;
    const res = memoryDb.event_results.find(r => r.id === parseInt(id, 10));
    if (!res) return { rows: [] };
    if (marks !== null && marks !== undefined) res.marks = marks;
    if (points !== null && points !== undefined) res.points = points;
    if (rank !== null && rank !== undefined) res.rank = rank;
    if (remarks !== null && remarks !== undefined) res.remarks = remarks;
    return { rows: [res] };
  }

  // 6. Leaderboard
  if (/FROM\s+event_results\s+r\s+JOIN\s+event_registrations/i.test(normalized) && /GROUP\s+BY/i.test(normalized)) {
    // Group by student
    const studentMap = new Map();
    for (const r of memoryDb.event_results) {
      const reg = memoryDb.event_registrations.find(er => er.id === r.registration_id);
      if (!reg) continue;
      const key = (reg.email || reg.student_id || reg.full_name || '').toLowerCase().trim();
      if (!key) continue;
      if (!studentMap.has(key)) {
        studentMap.set(key, {
          full_name: reg.full_name,
          department: reg.department || 'General',
          student_id: reg.student_id || '',
          email: reg.email || '',
          total_points: 0,
          eventIds: new Set(),
        });
      }
      const item = studentMap.get(key);
      item.total_points += (parseFloat(r.points) || 0);
      item.eventIds.add(r.event_id);
    }

    // ALSO INCLUDE ALL REGISTERED MEMBERS FROM memoryDb.users!
    for (const u of memoryDb.users) {
      if (u.role === 'admin') continue; // keep admin separate from member leaderboard
      const emailKey = (u.email || '').toLowerCase().trim();
      const usnKey = (u.usn || '').toLowerCase().trim();
      const nameKey = (u.name || '').toLowerCase().trim();

      const existingKey = (emailKey && studentMap.has(emailKey)) ? emailKey :
                          (usnKey && studentMap.has(usnKey)) ? usnKey :
                          (nameKey && studentMap.has(nameKey)) ? nameKey : null;

      if (!existingKey) {
        studentMap.set(emailKey || usnKey || nameKey, {
          full_name: u.name,
          department: u.department || 'Computer Science',
          student_id: u.usn || '',
          email: u.email || '',
          total_points: 0,
          eventIds: new Set(),
        });
      } else {
        const existing = studentMap.get(existingKey);
        if (!existing.student_id && u.usn) existing.student_id = u.usn;
        if ((!existing.department || existing.department === 'General') && u.department) {
          existing.department = u.department;
        }
      }
    }

    const leaderboard = Array.from(studentMap.values()).map(s => ({
      full_name: s.full_name,
      department: s.department,
      student_id: s.student_id,
      email: s.email,
      total_points: s.total_points,
      events_count: s.eventIds.size
    }));

    leaderboard.sort((a, b) => b.total_points - a.total_points);
    leaderboard.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    return { rows: leaderboard };
  }

  if (/FROM\s+event_results\s+r\s+JOIN\s+event_registrations/i.test(normalized)) {
    const eventId = parseInt(params[0], 10);
    const records = memoryDb.event_results
      .filter(r => r.event_id === eventId)
      .map(r => {
        const reg = memoryDb.event_registrations.find(reg => reg.id === r.registration_id) || {};
        return {
          ...r,
          full_name: reg.full_name || '',
          student_id: reg.student_id || '',
          email: reg.email || '',
          department: reg.department || ''
        };
      });
    records.sort((a, b) => (a.rank || 999) - (b.rank || 999));
    return { rows: records };
  }

  // 7. Resources Queries
  if (/^SELECT\s+\*\s+FROM\s+resources/i.test(normalized)) {
    let list = [...memoryDb.resources];
    if (/category\s*=/i.test(normalized) && params[0]) {
      list = list.filter(r => r.category === params[0]);
    }
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: list };
  }

  if (/^INSERT\s+INTO\s+resources/i.test(normalized)) {
    const [title, description, category, image_url, external_url, tags] = params;
    const newRes = {
      id: nextId.resources++,
      title,
      description: description || '',
      category: category || 'General',
      image_url: image_url || '',
      external_url: external_url || '',
      tags: tags || '',
      created_at: new Date()
    };
    memoryDb.resources.unshift(newRes);
    return { rows: [newRes] };
  }

  if (/^UPDATE\s+resources\s+SET/i.test(normalized)) {
    const id = parseInt(params[6], 10);
    const res = memoryDb.resources.find(r => r.id === id);
    if (!res) return { rows: [] };
    const [title, description, category, image_url, external_url, tags] = params;
    if (title) res.title = title;
    if (description) res.description = description;
    if (category) res.category = category;
    if (image_url) res.image_url = image_url;
    if (external_url) res.external_url = external_url;
    if (tags) res.tags = tags;
    return { rows: [res] };
  }

  if (/^DELETE\s+FROM\s+resources\s+WHERE\s+id\s*=\s*\$1/i.test(normalized)) {
    const id = parseInt(params[0], 10);
    const idx = memoryDb.resources.findIndex(r => r.id === id);
    if (idx === -1) return { rows: [] };
    memoryDb.resources.splice(idx, 1);
    return { rows: [{ id }] };
  }

  // 8. Admin Stats
  if (/SELECT\s+COUNT\(\*\)\s+FROM\s+events\s+WHERE\s+event_date\s*>\s*CURRENT_DATE/i.test(normalized)) {
    const nowStr = new Date().toISOString().split('T')[0];
    const count = memoryDb.events.filter(e => e.event_date > nowStr).length;
    return { rows: [{ count: count.toString() }] };
  }

  if (/SELECT\s+COUNT\(\*\)\s+FROM\s+users/i.test(normalized)) {
    return { rows: [{ count: memoryDb.users.length.toString() }] };
  }

  if (/SELECT\s+COUNT\(\*\)\s+FROM\s+events/i.test(normalized)) {
    return { rows: [{ count: memoryDb.events.length.toString() }] };
  }

  if (/SELECT\s+COUNT\(\*\)\s+FROM\s+event_registrations\s+WHERE\s+status\s*=\s*'accepted'/i.test(normalized)) {
    const count = memoryDb.event_registrations.filter(r => r.status === 'accepted').length;
    return { rows: [{ count: count.toString() }] };
  }

  if (/SELECT\s+COUNT\(\*\)\s+FROM\s+event_registrations\s+WHERE\s+status\s*=\s*'pending'/i.test(normalized)) {
    const count = memoryDb.event_registrations.filter(r => r.status === 'pending').length;
    return { rows: [{ count: count.toString() }] };
  }

  if (/SELECT\s+COUNT\(\*\)\s+FROM\s+event_registrations\s+WHERE\s+status\s*=\s*'rejected'/i.test(normalized)) {
    const count = memoryDb.event_registrations.filter(r => r.status === 'rejected').length;
    return { rows: [{ count: count.toString() }] };
  }

  if (/SELECT\s+COUNT\(\*\)\s+FROM\s+event_registrations/i.test(normalized)) {
    return { rows: [{ count: memoryDb.event_registrations.length.toString() }] };
  }

  if (/SELECT\s+COUNT\(\*\)\s+FROM\s+attendance\s+WHERE\s+status\s*=\s*'present'/i.test(normalized)) {
    const count = memoryDb.attendance.filter(a => a.status === 'present').length;
    return { rows: [{ count: count.toString() }] };
  }

  if (/SELECT\s+SUM\(points\)\s+FROM\s+event_results/i.test(normalized)) {
    const sum = memoryDb.event_results.reduce((acc, r) => acc + (parseFloat(r.points) || 0), 0);
    return { rows: [{ sum: sum.toString() }] };
  }

  // 9. Admin CSV Export
  if (/FROM\s+event_registrations\s+er\s+LEFT\s+JOIN\s+attendance\s+a/i.test(normalized)) {
    const eventId = parseInt(params[0], 10);
    const regs = memoryDb.event_registrations.filter(r => r.event_id === eventId);
    const rows = regs.map(r => {
      const att = memoryDb.attendance.find(a => a.registration_id === r.id);
      const res = memoryDb.event_results.find(res => res.registration_id === r.id);
      return {
        reference_id: r.reference_id,
        full_name: r.full_name,
        student_id: r.student_id,
        email: r.email,
        phone: r.phone || '',
        department: r.department || '',
        year: r.year || '',
        registration_status: r.status,
        attendance_status: att ? att.status : 'not marked',
        marks: res ? res.marks : 0,
        points: res ? res.points : 0,
        rank: res ? res.rank : null,
        remarks: res ? res.remarks : ''
      };
    });
    return { rows };
  }

  console.warn('[AI Studio DB] Unhandled SQL query, returning empty set:', text);
  return { rows: [] };
}

// Unified Database Adapter
const pool = {
  query: async (text, params) => {
    if (realPool) {
      try {
        return await realPool.query(text, params);
      } catch (err) {
        console.warn('[AI Studio] PostgreSQL query error, falling back to in-memory store:', err.message);
      }
    }
    return executeMemoryQuery(text, params);
  },
  on: (event, handler) => {
    if (realPool) realPool.on(event, handler);
  },
  connect: async () => {
    if (realPool) {
      try {
        return await realPool.connect();
      } catch (err) {
        console.warn('[AI Studio] PostgreSQL connect failed:', err.message);
      }
    }
    return {
      query: async (text, params) => executeMemoryQuery(text, params),
      release: () => {}
    };
  },
  memoryDb,
  nextId,
  // Direct PostgreSQL access (no silent in-memory fallback), for callers that
  // need to know whether a real write happened.
  hasPostgres: () => Boolean(realPool),
  pgQuery: (text, params) => realPool.query(text, params),
};

module.exports = pool;
