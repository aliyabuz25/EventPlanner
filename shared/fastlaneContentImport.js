export const FASTLANE_CONTENT_VERSION = '2026-03-24-de-palette-v1';

export const fastlaneContentDocuments = {
  global: {
    company: {
      name: 'FastLane',
      fullName: 'FastLane GmbH',
      sapPartnerLevel: 'Teilnehmendenmanagement & OnSite Services',
      phone: '+49 228 - 91 251 - 300',
      email: 'service@fastlane-gmbh.de',
      address: {
        city: 'Bonn',
        country: 'Germany',
        full: 'Rochusstrasse 217, 53123 Bonn, Germany'
      },
      contact: {
        phone: '+49 228 - 91 251 - 300',
        email: 'service@fastlane-gmbh.de'
      },
      stats: {
        experts: '25+ Years',
        projects: 'Live + Hybrid',
        support: 'OnSite',
        experience: '2nd Gen'
      }
    },
    branding: {
      siteTitle: 'FastLane | Teilnehmermanagement fuer Events',
      contentVersion: FASTLANE_CONTENT_VERSION,
      logoUrl: 'https://image.jimcdn.com/app/cms/image/transf/dimension=200x10000:format=png/path/s610c0f1f85cf6198/image/i4680b6c988b29d66/version/1715170961/image.png',
      faviconUrl: 'https://image.jimcdn.com/app/cms/image/transf/dimension=200x10000:format=png/path/s610c0f1f85cf6198/image/i4680b6c988b29d66/version/1715170961/image.png',
      appleTouchIconUrl: 'https://image.jimcdn.com/app/cms/image/transf/dimension=200x10000:format=png/path/s610c0f1f85cf6198/image/i4680b6c988b29d66/version/1715170961/image.png'
    },
    smtp: {
      enabled: false,
      host: 'smtp.your-provider.com',
      port: 587,
      secure: false,
      username: 'smtp-user@your-domain.com',
      password: '',
      fromName: 'FastLane Website',
      fromEmail: 'no-reply@your-domain.com',
      recipientEmail: 'service@fastlane-gmbh.de',
      testRecipientEmail: 'service@fastlane-gmbh.de'
    },
    solutionDetailUi: {
      notFoundText: 'Loesung nicht gefunden.',
      capabilitiesTitle: 'Leistungsumfang',
      benefitsTitle: 'Mehrwert',
      transformTitle: 'Bereit fuer einen reibungslosen Event-Start?',
      transformDescriptionTemplate:
        'Mit {company} integrierst du {solution} in einen klaren, belastbaren Teilnehmerprozess vor Ort.',
      primaryButtonText: 'Termin anfragen',
      primaryButtonHref: '/#contact',
      secondaryButtonText: 'E-Mail senden',
      secondaryButtonHref: 'mailto:service@fastlane-gmbh.de'
    },
    socialLinks: [
      { name: 'LN', href: 'https://www.linkedin.com', label: 'LinkedIn' },
      { name: 'IG', href: '#', label: 'Instagram' },
      { name: 'YT', href: '#', label: 'YouTube' }
    ]
  },
  siteMap: [
    { slug: 'home', view: 'home', title: 'Home', description: 'Landing page with FastLane event entry services.' },
    { slug: 'solutions', view: 'solutions', title: 'Loesungen', description: 'FastLane modules for live, hybrid and medical events.' },
    { slug: 'services', view: 'services', title: 'Services', description: 'Consulting, setup and onsite support for event flows.' },
    { slug: 'about', view: 'about', title: 'Ueber Uns', description: 'Company profile, values and operating model.' },
    { slug: 'team', view: 'team', title: 'OnSite Team', description: 'How FastLane works onsite with customers and guests.' },
    { slug: 'kontakt', view: 'contact', title: 'Kontakt', description: 'Direct consultation and event inquiry page.' },
    { slug: 'privacy-compliance', view: 'corporate-standards', title: 'Datenschutz & Compliance', description: 'Trust, privacy and operational standards.' },
    { slug: 'event-finder', view: 'survey', title: 'Event Finder', description: 'Interactive recommendation flow for the right event setup.' },
    { slug: 'content-admin', view: 'content-admin', title: 'Content Admin', description: 'JSON editor for site content.' }
  ],
  navigation: {
    mainLinks: [
      { name: 'Loesungen', view: 'solutions', href: '#solutions' },
      { name: 'Services', view: 'services', href: '#services' },
      { name: 'OnSite', view: 'team', href: '#team' },
      { name: 'Ueber Uns', view: 'about', href: '#about' },
      { name: 'Kontakt', view: 'contact', href: '/kontakt' }
    ],
    solutionLinks: [
      { name: 'Live-Badging', id: 'sap-s4hana' },
      { name: 'Einlassmanagement', id: 'sap-successfactors' },
      { name: 'Event-Apps', id: 'sap-ariba' },
      { name: 'Medical Events', id: 'sap-business-one' },
      { name: 'Hybride Events', id: 'opentext' },
      { name: 'Badge2Go', id: 'bimser' },
      { name: 'FastLane Inside', id: 'microsoft-power-bi' }
    ],
    footer: {
      ecosystemLinks: [
        { label: 'Live-Badging', view: 'sap-s4hana' },
        { label: 'Einlassmanagement', view: 'sap-successfactors' },
        { label: 'Event-Apps', view: 'sap-ariba' },
        { label: 'Event Finder', view: 'survey' }
      ],
      corporateLinks: [
        { label: 'Ueber Uns', view: 'about' },
        { label: 'Services', view: 'services' },
        { label: 'Datenschutz', view: 'corporate-standards' },
        { label: 'Kontakt', view: 'contact' }
      ]
    },
    badges: {
      partner: 'OnSite Event Services',
      admin: 'CMS'
    }
  },
  'pages.home': {
    seoTitle: 'FastLane | Akkreditierung, Check-in und Live-Badging',
    sections: {
      hero: {
        badge: 'Teilnehmendenmanagement fuer Live- und Hybrid-Events',
        title: {
          lineOne: 'Akkreditierung,',
          highlight: 'Check-in',
          lineThree: '& Live-Badging.'
        },
        description:
          'Professioneller Event-Einlass mit Akkreditierung, Live-Badge-Druck und schnellen Check-ins direkt vor Ort. Flexibel, verlaesslich und genau auf dein Event abgestimmt.',
        primaryCta: 'Loesungen ansehen',
        primaryHref: '/solutions',
        secondaryCta: 'Termin anfragen',
        secondaryHref: '/#contact',
        stats: [
          { value: '25+ Years', label: 'Erfahrung im Teilnehmermanagement' },
          { value: 'OnSite', label: 'Support direkt vor Ort' },
          { value: 'Live + Hybrid', label: 'Event-Setups aus einer Hand' }
        ],
        visual: {
          mainImageUrl: '',
          mainImageAlt: 'Event check-in and badge printing',
          sideImageUrl: '',
          sideImageAlt: 'FastLane event app and dashboard'
        }
      },
      about: {
        eyebrow: 'Ueber FastLane',
        title: 'Teilnehmendenmanagement mit Praxiserfahrung',
        paragraphs: [
          'FastLane ist ein unabhaengiger Dienstleister fuer OnSite-Events und unterstuetzt Live-, Hybrid- und Medical-Formate mit strukturierter Akkreditierung, Einlasssteuerung und digital begleiteten Prozessen.',
          'Das Unternehmen arbeitet seit mehr als 25 Jahren im Teilnehmermanagement und wird in zweiter Generation gefuehrt. Ziel ist immer ein Setup, das zum Event, zum Publikum und zum Ablauf vor Ort passt.'
        ],
        badges: ['25+ Years Experience', '2nd Generation'],
        buttonText: 'Mehr erfahren',
        buttonHref: '/about',
        cards: [
          { value: 'Live', label: 'Akkreditierung & Badges' },
          { value: 'Mobile', label: 'Check-in per App oder Kiosk' },
          { value: 'Hybrid', label: 'Prozesse fuer Vor-Ort und Remote' },
          { value: 'Medical', label: 'Sichere Teilnehmerfuehrung' }
        ]
      },
      partners: {
        title: 'Technologie- & Event-Ecosystem',
        items: [
          { name: 'doo', logo: '' },
          { name: 'dgtl.ai', logo: '' },
          { name: 'InvitePeople', logo: '' },
          { name: 'vivenu', logo: '' },
          { name: 'meetingmasters.de', logo: '' },
          { name: 'EventMobi', logo: '' }
        ]
      },
      services: {
        eyebrow: 'Unsere Leistungen',
        title: 'Modulare Services fuer den ersten Eindruck deines Events',
        description:
          'Von Akkreditierung bis Auswertung kombiniert FastLane Technik, Prozesse und OnSite-Betreuung zu einem klaren Einlasskonzept.',
        items: [
          {
            id: 'live-badging',
            title: 'Live-Badging',
            description: 'Full-colour Badge-Druck direkt beim Check-in mit individuellen Layouts und Echtzeit-Anpassungen.',
            icon: 'BadgeCheck'
          },
          {
            id: 'entry',
            title: 'Einlassmanagement',
            description: 'QR-Scan, Zutrittsrechte und klare Besucherfluesse fuer einen schnellen, kontrollierten Start.',
            icon: 'ScanLine'
          },
          {
            id: 'event-apps',
            title: 'Event-Apps',
            description: 'Agenda, Lageplaene, Buchungen, Feedback und Updates zentral in einer App gebuendelt.',
            icon: 'Smartphone'
          },
          {
            id: 'medical',
            title: 'Medical Events',
            description: 'Prozesse fuer sensible Teilnehmergruppen mit klarer Steuerung, Sicherheit und Nachvollziehbarkeit.',
            icon: 'HeartPulse'
          },
          {
            id: 'hybrid',
            title: 'Hybride Events',
            description: 'Vor-Ort- und Remote-Erlebnisse in einem durchgaengigen Setup verbunden.',
            icon: 'MonitorPlay'
          },
          {
            id: 'onsite-service',
            title: 'OnSite Service',
            description: 'Persoenliche Betreuung, Sonderloesungen und schnelle Entscheidungen direkt am Eventtag.',
            icon: 'Users'
          }
        ],
        cta: {
          title: 'FastLane fuer dein Event',
          description: 'Lass uns gemeinsam entscheiden, welches Setup zu Teilnehmerzahl, Format und Einlasslogik passt.',
          buttonText: 'Zum Loesungskatalog',
          buttonHref: '/solutions'
        }
      },
      contact: {
        eyebrow: 'Kontakt',
        title: 'Sprich mit FastLane ueber dein Event',
        description:
          'Wir beraten dich persoenlich und entwickeln gemeinsam die passende Kombination aus Einlass, Badges, App und OnSite-Service.',
        phoneLabel: 'Telefon',
        phoneMeta: 'Mo-Fr, 09:00 - 18:00',
        emailLabel: 'E-Mail',
        emailMeta: 'Antwort in der Regel innerhalb von 24 Stunden',
        form: {
          firstName: 'Vorname',
          firstNamePlaceholder: 'Vorname eingeben',
          lastName: 'Nachname',
          lastNamePlaceholder: 'Nachname eingeben',
          email: 'E-Mail',
          emailPlaceholder: 'name@unternehmen.de',
          details: 'Event-Details',
          detailsPlaceholder: 'Welche Services sind fuer dein Event relevant?',
          submitText: 'Anfrage senden',
          successMessage: 'Deine Anfrage wurde erfolgreich uebermittelt.',
          errorMessage: 'Die Anfrage konnte gerade nicht gesendet werden. Bitte versuche es spaeter erneut.'
        }
      }
    }
  },
  'pages.campaign': {
    sections: {
      badge: 'Modular Setup',
      titleLines: ['Ein Setup,', 'mehrere Event-Module'],
      initiativesLabel: 'FastLane Fokus',
      initiativesText: 'Live-Badging, Einlassmanagement, Event-Apps, Medical Events und hybride Formate lassen sich flexibel kombinieren.',
      buttonText: 'Kontakt aufnehmen',
      buttonHref: '/#contact',
      sideWords: ['OnSite', 'Flow', 'Control']
    }
  },
  'pages.about': {
    sections: {
      heroBadge: 'Ueber Uns',
      heroTitle: ['Teilnehmerprozesse', 'mit Verantwortung.'],
      intro:
        'FastLane begleitet Events mit einem klaren Fokus auf Akkreditierung, Einlass und Teilnehmerfuehrung. Das Unternehmen arbeitet unabhaengig, praxisnah und mit einem Setup, das auf reale Eventablaeufe zugeschnitten ist.',
      mission: {
        title: 'Unsere Mission',
        description:
          'Teilnehmendenmanagement so zu gestalten, dass Veranstalter, Teams und Gaeste vom ersten Kontakt bis zur Auswertung einen strukturierten, sicheren und professionellen Ablauf erleben.'
      },
      vision: {
        title: 'Unsere Vision',
        description:
          'Fuer Events jeder Groesse die verlaessliche Schnittstelle zwischen Technik, Team und Gaesten zu sein, ohne Komplexitaet in den Vordergrund zu stellen.'
      },
      valuesTitle: 'Was FastLane ausmacht',
      valuesSubtitle: 'Arbeitsweise und Haltung',
      values: [
        {
          title: 'Praxiserfahrung',
          description: 'Mehr als 25 Jahre Erfahrung im Teilnehmermanagement fuehren zu belastbaren Entscheidungen vor Ort.',
          icon: 'ShieldCheck'
        },
        {
          title: 'Flexibilitaet',
          description: 'Systeme und Prozesse werden an Eventformat, Publikum und kurzfristige Aenderungen angepasst.',
          icon: 'Zap'
        },
        {
          title: 'Verantwortung',
          description: 'Einlass, Rechte und Besucherstroeme werden nachvollziehbar, sauber und stressarm organisiert.',
          icon: 'Award'
        }
      ],
      timeline: {
        title: 'Wie FastLane arbeitet',
        description: 'Keine Standardpakete, sondern passende Event-Setups',
        badge: '25+ Years / 2nd Generation',
        items: [
          {
            year: 'Briefing',
            label: 'Verstehen',
            description: 'FastLane analysiert Format, Teilnehmerzahl, Einlasspunkte und Sonderfaelle deines Events.'
          },
          {
            year: 'Setup',
            label: 'Konfigurieren',
            description: 'Badges, Check-in, App, Kontingente und Rechte werden auf dein Eventmodell abgestimmt.'
          },
          {
            year: 'OnSite',
            label: 'Begleiten',
            description: 'Vor Ort laufen Prozesse, Technik und Teamsteuerung kontrolliert zusammen.'
          },
          {
            year: 'Review',
            label: 'Auswerten',
            description: 'Nach dem Event lassen sich Bewegungen, Check-ins und Erkenntnisse strukturiert auswerten.'
          }
        ]
      },
      cta: {
        title: 'FastLane denkt vom Eventfluss aus',
        description:
          'Nicht einzelne Tools stehen im Mittelpunkt, sondern ein Einlasskonzept, das fuer dein Event funktioniert und dein Team im laufenden Betrieb entlastet.',
        cities: ['Bonn', 'OnSite', 'Live', 'Hybrid']
      }
    }
  },
  'pages.corporateStandards': {
    sections: {
      eyebrow: 'Vertrauen & Datenschutz',
      title: 'Datenschutz und operative Sorgfalt',
      intro:
        'FastLane arbeitet in sensiblen Teilnehmerprozessen. Deshalb stehen Datenschutz, saubere Rechtepruefung und transparente Kommunikation im Zentrum jedes Setups.',
      inquiryCard: {
        title: 'Rueckfragen zu Datenschutz oder Compliance',
        description: 'Wenn du Anforderungen an Datenhaltung, Teilnehmerrechte oder operative Standards hast, stimmen wir diese fruehzeitig mit dir ab.',
        email: 'service@fastlane-gmbh.de'
      },
      documents: [
        { title: 'Datenschutzerklaerung', lang: 'DE' },
        { title: 'Impressum', lang: 'DE' },
        { title: 'Cookie-Richtlinie', lang: 'DE' },
        { title: 'Event-spezifische Zutrittsregeln', lang: 'Projektbezogen' }
      ],
      transparency: {
        title: 'Verbindliche Prozesse statt Improvisation',
        quote:
          'Teilnehmerdaten, Zutrittsrechte und Vor-Ort-Ablaeufe muessen klar geregelt sein. FastLane setzt deshalb auf nachvollziehbare Prozesse, flexible Technik und persoenliche Abstimmung.'
      }
    }
  },
  'pages.survey': {
    sections: {
      badge: 'Interactive Event Finder',
      title: 'Plane dein',
      titleHighlight: 'Event-Setup',
      description:
        'Nutze den Schnellmodus fuer eine erste Empfehlung oder den AI Explorer fuer ein ausfuehrlicheres OnSite-Briefing.',
      modeQuick: 'Quick Match',
      modeAdvisor: 'AI Explorer',
      calculatingTitle: 'Passendes Setup wird ermittelt',
      calculatingDescription: 'Wir ordnen dein Event dem naechstliegenden FastLane-Modul zu...',
      recommendationLabel: 'Empfohlenes Modul',
      viewProductButton: 'Details ansehen',
      retakeButton: 'Neu starten',
      backButton: 'Zurueck',
      quickQuestions: [
        {
          id: 1,
          question: 'Welches Format hat dein Event?',
          subtitle: 'Das Format entscheidet, wie Check-in und Informationsfluss organisiert werden.',
          options: [
            { label: 'Live vor Ort', icon: 'Users', scores: { 'sap-s4hana': 4, 'sap-successfactors': 4, bimser: 2 } },
            { label: 'Hybrid', icon: 'MonitorPlay', scores: { opentext: 5, 'sap-ariba': 3, 'microsoft-power-bi': 2 } },
            { label: 'Medical / reguliert', icon: 'HeartPulse', scores: { 'sap-business-one': 5, 'sap-successfactors': 3 } }
          ]
        },
        {
          id: 2,
          question: 'Was ist dein wichtigster Engpass?',
          subtitle: 'Wir fokussieren zuerst auf den kritischsten Punkt am Eventtag.',
          options: [
            { label: 'Badge-Druck und Personalisierung', icon: 'BadgeCheck', scores: { 'sap-s4hana': 5, bimser: 2 } },
            { label: 'Schneller Einlass und Rechtepruefung', icon: 'ScanLine', scores: { 'sap-successfactors': 5, 'sap-business-one': 2 } },
            { label: 'Teilnehmerinfos und Begleitung per App', icon: 'Smartphone', scores: { 'sap-ariba': 5, 'microsoft-power-bi': 3 } }
          ]
        },
        {
          id: 3,
          question: 'Wie soll der Check-in organisiert sein?',
          subtitle: 'Die operative Form beeinflusst Hardware, Personal und Besucherfluss.',
          options: [
            { label: 'Self-Check-in / Kiosk', icon: 'TabletSmartphone', scores: { bimser: 5, 'sap-s4hana': 2 } },
            { label: 'Mobiles Team mit App', icon: 'Smartphone', scores: { 'sap-successfactors': 4, 'sap-ariba': 2, 'sap-business-one': 2 } },
            { label: 'Zentrale Plattform fuer alles', icon: 'LayoutDashboard', scores: { 'microsoft-power-bi': 5, opentext: 3 } }
          ]
        }
      ],
      solutionContent: {
        'sap-s4hana': {
          title: 'Full-Colour Live-Badging',
          description: 'Badge-Druck in Echtzeit fuer einen professionellen ersten Eindruck und flexible Anpassungen direkt vor Ort.'
        },
        'sap-successfactors': {
          title: 'Einlassmanagement',
          description: 'Check-in, QR-Scan und Rechtepruefung fuer kontrollierte Besucherstroeme und kurze Wartezeiten.'
        },
        'sap-ariba': {
          title: 'Event-Apps',
          description: 'Agenda, Lageplaene, Buchungen, Feedback und Updates gebuendelt in einer App fuer Teilnehmende und Team.'
        },
        'sap-business-one': {
          title: 'Medical Events',
          description: 'Strukturierte Prozesse fuer sensible Veranstaltungen mit klaren Zugriffs- und Teilnehmerregeln.'
        },
        opentext: {
          title: 'Hybride Events',
          description: 'Ein Setup, das Vor-Ort-Ablauf und digitale Teilnahme konsistent verbindet.'
        },
        bimser: {
          title: 'Badge2Go / Self-Check-in',
          description: 'Self-service Check-in mit Kiosk-Logik fuer schnelle Auslastung an mehreren Einlasspunkten.'
        },
        'microsoft-power-bi': {
          title: 'FastLane Inside',
          description: 'Eine zentrale Plattform fuer Teilnehmermanagement, Einlass und operative Uebersicht waehrend des Events.'
        }
      }
    }
  },
  'pages.services': {
    sections: {
      eyebrow: 'Services',
      title: ['Eventprozesse &', 'OnSite-Betreuung'],
      description:
        'FastLane verbindet Beratung, Konfiguration und operative Begleitung zu einem Setup, das am Eventtag belastbar bleibt.',
      phases: [
        {
          title: 'Konzeption & Briefing',
          steps: ['Format klaeren', 'Teilnehmerlogik definieren', 'Einlasspunkte planen', 'Sonderfaelle aufnehmen'],
          description:
            'Zu Beginn wird festgelegt, wie Gaeste, Kategorien, Rechte und Check-in-Strecken organisiert werden. So entsteht ein Ablauf, der realistisch und testbar ist.'
        },
        {
          title: 'Technisches Setup',
          steps: ['Badges konfigurieren', 'Rechte abbilden', 'Apps und Kioske vorbereiten', 'Dashboards abstimmen'],
          description:
            'FastLane richtet Druck, mobile Check-ins, Self-service und Teilnehmerkommunikation so ein, dass alle Module ineinandergreifen.'
        },
        {
          title: 'Betrieb & Auswertung',
          steps: ['OnSite Support', 'Live-Anpassungen', 'Monitoring', 'Nachbereitung'],
          description:
            'Am Eventtag wird operativ begleitet und bei Veraenderungen schnell reagiert. Danach koennen Check-ins und Bewegungen strukturiert ausgewertet werden.'
        }
      ],
      supportCards: [
        {
          title: 'Persoenliche Betreuung',
          description: 'Von der Abstimmung bis zum Eventtag begleitet FastLane dein Team mit konkreten Ansprechpartnern und pragmischen Entscheidungen.',
          meta: 'Direkt vor Ort und im Projekt',
          icon: 'LifeBuoy',
          accent: 'gold'
        },
        {
          title: 'Flexible Technik',
          description: 'App, Kiosk, Badge-Druck und Rechtepruefung werden so kombiniert, dass auch kurzfristige Aenderungen sauber abgebildet werden koennen.',
          meta: 'Anpassbar an Format und Besucherfluss',
          icon: 'ShieldCheck',
          accent: 'blue'
        }
      ]
    }
  },
  'pages.team': {
    sections: {
      eyebrow: 'OnSite Team',
      title: 'FastLane arbeitet dort, wo Eventfluss entscheidet',
      description:
        'Teilnehmermanagement ist kein reiner Softwareprozess. FastLane verbindet Menschen, Technik und Ablaufsteuerung genau an der Stelle, an der Ankunft und Orientierung entstehen.',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      principlesTitle: 'Arbeitsprinzipien',
      principles: [
        { title: 'Klarheit', description: 'Teilnehmerwege, Rollen und Rechte werden vorab sauber definiert.', icon: 'Users' },
        { title: 'Ruhe im Betrieb', description: 'Vor Ort zaehlen kurze Wege, klare Verantwortungen und schnelle Entscheidungen.', icon: 'MessageSquare' },
        { title: 'Verlaesslichkeit', description: 'Check-in, Badge-Druck und Rechtepruefung muessen auch unter Last stabil bleiben.', icon: 'ShieldCheck' },
        { title: 'Respekt fuer Gaeste', description: 'Der erste Eindruck entsteht an Empfang, Kiosk und Einlass.', icon: 'Heart' },
        { title: 'Anpassungsfaehigkeit', description: 'Kurzfristige Aenderungen werden in Prozesse statt in Chaos uebersetzt.', icon: 'Target' },
        { title: 'Timing', description: 'Einlasslogik muss exakt auf das Tempo des Events abgestimmt sein.', icon: 'Clock' }
      ],
      quote: 'FastLane denkt nicht in Inselloesungen, sondern in einem Ablauf, der fuer Team, Veranstalter und Gaeste gleichzeitig funktioniert.',
      cta: {
        title: 'Sprich mit dem Team ueber dein naechstes Event',
        description: 'Wenn du ein Live-, Hybrid- oder Medical-Setup planst, klaeren wir gemeinsam, welche Module vor Ort wirklich gebraucht werden.',
        buttonText: 'Termin anfragen',
        buttonHref: 'mailto:service@fastlane-gmbh.de'
      }
    }
  },
  'pages.solutions': {
    sections: {
      eyebrow: 'FastLane Loesungen',
      title: 'Teilnehmendenmanagement als modulares System',
      description:
        'Jede Loesung ist auf einen konkreten Teil des Eventflusses ausgerichtet und laesst sich mit weiteren Modulen kombinieren.',
      products: [
        { id: 'sap-s4hana', title: 'Full-Colour Live-Badging', category: 'OnSite Print', description: 'Personalisierte Badges in Echtzeit direkt beim Event.', icon: 'BadgeCheck' },
        { id: 'sap-successfactors', title: 'Einlassmanagement', category: 'Check-in', description: 'QR-Scan, Rechtepruefung und transparente Besuchersteuerung.', icon: 'ScanLine' },
        { id: 'sap-ariba', title: 'Event-Apps', category: 'Participant App', description: 'Agenda, Buchungen, Navigation und Updates in einer mobilen Begleitung.', icon: 'Smartphone' },
        { id: 'sap-business-one', title: 'Medical Events', category: 'Regulated Events', description: 'Strukturierte Teilnehmerfuehrung fuer sensible und stark geregelte Formate.', icon: 'HeartPulse' },
        { id: 'opentext', title: 'Hybride Events', category: 'Live + Digital', description: 'Verbindung aus Vor-Ort-Erlebnis und digitaler Teilnahme.', icon: 'MonitorPlay' },
        { id: 'bimser', title: 'Badge2Go', category: 'Self-Service', description: 'Self-check-in und Badge-Ausgabe mit klarer Kiosklogik.', icon: 'TabletSmartphone' },
        { id: 'microsoft-power-bi', title: 'FastLane Inside', category: 'Control Center', description: 'Eine Plattform fuer Teilnehmerdaten, Buchungen und operative Uebersicht.', icon: 'LayoutDashboard' }
      ]
    }
  },
  solutionDetails: {
    'sap-s4hana': {
      title: 'Full-Colour Live-Badging',
      category: 'OnSite Print',
      description: 'Badge-Druck in Farbe direkt vor Ort.',
      intro:
        'Mit Live-Badging gestaltest du den Empfang effizient, professionell und markengerecht. Namensschilder werden beim Check-in in Echtzeit produziert und koennen auch kurzfristig angepasst werden.',
      features: [
        'Personalisierte Badges mit Namen, Rolle, Firma oder Gruppenmerkmalen',
        'Echtzeit-Druck ohne Vorproduktion',
        'Flexible Anpassungen bei Nachmeldungen oder Rollenwechseln',
        'Nahtlose Verbindung mit Check-in und Zutrittslogik'
      ],
      benefits: [
        'Reduziert Wartezeiten am Empfang',
        'Staerkt den ersten Eindruck deiner Veranstaltung',
        'Macht kurzfristige Aenderungen beherrschbar',
        'Verbindet Branding und Prozess in einem Schritt'
      ],
      ctaText: 'Jetzt Kontakt aufnehmen',
      ctaHref: '/#contact'
    },
    'sap-successfactors': {
      title: 'Einlassmanagement',
      category: 'Check-in',
      description: 'Kontrollierter Zutritt fuer Events jeder Groesse.',
      intro:
        'Schneller Check-in, klare Zutrittskontrolle und strukturierte Ablaeufe sorgen dafuer, dass Gaeste entspannt ankommen und dein Event professionell startet. Mit FastLane lassen sich Teilnehmer, Rechte und Bewegungen in einem durchgaengigen Prozess steuern.',
      features: [
        'QR-Code-Scan und manuelle Suche in einer mobilen Check-in-App',
        'Live-Dashboard fuer Besucherzahlen und Auslastungen',
        'Individuelle Rechtekontrolle fuer Bereiche und Sessions',
        'Einsatz ueber App, Kiosk oder mehrere Einlasspunkte'
      ],
      benefits: [
        'Kurze Wartezeiten auch bei hohem Besucheraufkommen',
        'Volle Transparenz ueber Einlassstatus und Kontingente',
        'Sichere Rechtepruefung in Echtzeit',
        'Belastbarer Start auch bei mehreren Zugangszonen'
      ],
      ctaText: 'Angebot anfordern',
      ctaHref: '/#contact'
    },
    'sap-ariba': {
      title: 'Event-Apps',
      category: 'Participant App',
      description: 'Digitale Begleitung fuer den gesamten Eventtag.',
      intro:
        'Die FastLane Event-App ergaenzt Akkreditierung und Einlass mit einer zentralen Informationsschicht fuer Teilnehmende. Agenda, Buchungen, Lageplaene, Feedback und Updates bleiben waehrend der Veranstaltung jederzeit erreichbar.',
      features: [
        'Agenda, Sessions und Programmpunkte mobil verfuegbar',
        'Buchungen, Lageplaene und Updates an einem Ort',
        'Feedback und Orientierung direkt im Eventfluss',
        'Saubere Verzahnung mit Vor-Ort-Prozessen'
      ],
      benefits: [
        'Weniger Rueckfragen am Eventtag',
        'Mehr Orientierung fuer Teilnehmende',
        'Klarer Informationskanal fuer kurzfristige Updates',
        'Stimmiges Erlebnis zwischen Empfang und Programmnutzung'
      ],
      ctaText: 'Event-App entdecken',
      ctaHref: '/#contact'
    },
    'sap-business-one': {
      title: 'Medical Events',
      category: 'Regulated Events',
      description: 'Teilnehmerfuehrung fuer sensible Veranstaltungsformate.',
      intro:
        'Medical Events benoetigen eindeutige Prozesse, saubere Teilnehmerlogik und dokumentierbare Rechte. FastLane unterstuetzt solche Formate mit kontrolliertem Check-in, strukturierten Teilnehmerwegen und verlaesslicher OnSite-Betreuung.',
      features: [
        'Klare Teilnehmerkategorien und Zutrittsregeln',
        'Nachvollziehbare Check-in-Prozesse fuer sensible Formate',
        'Saubere Steuerung von Einlasspunkten und Besucherwegen',
        'Persoenliche Begleitung bei operativen Sonderfaellen'
      ],
      benefits: [
        'Mehr Sicherheit in regulierten Eventumgebungen',
        'Klare Orientierung fuer Team und Teilnehmende',
        'Kontrollierte Umsetzung auch bei komplexen Vorgaben',
        'Weniger operative Unsicherheit am Eventtag'
      ],
      ctaText: 'Medical Setup besprechen',
      ctaHref: '/#contact'
    },
    opentext: {
      title: 'Hybride Events',
      category: 'Live + Digital',
      description: 'Ein Event fuer Vor-Ort- und Remote-Teilnahme.',
      intro:
        'Hybride Events verbinden physische Begegnung mit digitaler Reichweite. FastLane denkt Einlass, Teilnehmerdaten und Informationsfluss so, dass Vor-Ort- und Remote-Erlebnis aus einem durchgehenden Setup heraus funktionieren.',
      features: [
        'Verbindung von Live-Event und digitaler Teilnahme',
        'Zentrale Teilnehmerlogik fuer mehrere Nutzungskanaele',
        'Klarer Informationsfluss fuer Team und Teilnehmende',
        'Flexibles Setup fuer unterschiedliche Reichweiten'
      ],
      benefits: [
        'Mehr Reichweite ohne Verlust des Live-Charakters',
        'Sauberer Uebergang zwischen Vor-Ort und digital',
        'Bessere Steuerung von Informationen und Updates',
        'Flexibles Format fuer wechselnde Anforderungen'
      ],
      ctaText: 'Hybrid-Setup anfragen',
      ctaHref: '/#contact'
    },
    bimser: {
      title: 'Badge2Go',
      category: 'Self-Service',
      description: 'Self-check-in und Badge-Ausgabe mit Kiosklogik.',
      intro:
        'Badge2Go bringt Self-service in den Event-Einlass. Teilnehmende koennen sich an Kiosken anmelden, QR-Codes scannen und Badges ohne Medienbruch erhalten. Das beschleunigt Stoerungen nicht nur, sondern entlastet auch das Empfangsteam.',
      features: [
        'Self-check-in ueber Kiosk oder QR-Scan',
        'Direkte Ausgabe von Badges am Terminal',
        'Geeignet fuer mehrere Einlasspunkte und Peaks',
        'Verbindbar mit Rechten, Status und Teilnehmerdaten'
      ],
      benefits: [
        'Entlastet Personal an stark frequentierten Check-ins',
        'Beschleunigt den Zutritt in Peak-Phasen',
        'Skalierbar fuer verschiedene Eventgroessen',
        'Sauberer Prozess fuer wiederkehrende Standardfaelle'
      ],
      ctaText: 'Badge2Go pruefen',
      ctaHref: '/#contact'
    },
    'microsoft-power-bi': {
      title: 'FastLane Inside',
      category: 'Control Center',
      description: 'Zentrale Plattform fuer Teilnehmermanagement.',
      intro:
        'FastLane Inside ist die Steuerungszentrale fuer dein OnSite-Event. Buchungen, Teilnehmerverwaltung und Einlassmanagement werden in einer Anwendung gebuendelt, damit das Team den Ueberblick behaelt.',
      features: [
        'Zentrale Verwaltung fuer Buchungen und Teilnehmerdaten',
        'Konfiguration von Kategorien und Optionen vor dem Event',
        'Verknuepfung mit Einlass, Check-in und Auswertung',
        'Uebersichtliche Bedienung fuer operative Teams'
      ],
      benefits: [
        'Weniger Systembrueche im Projekt und am Eventtag',
        'Mehr Transparenz fuer operative Entscheidungen',
        'Schneller Zugriff auf relevante Teilnehmerinformationen',
        'Belastbare Grundlage fuer Monitoring und Nachbereitung'
      ],
      ctaText: 'Plattform ansehen',
      ctaHref: '/#contact'
    }
  }
};
