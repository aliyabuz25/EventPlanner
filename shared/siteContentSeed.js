export const siteContentSeed = {
  global: {
    company: {
      name: '3ILINE',
      fullName: '3ILINE CONSULTING LLC',
      sapPartnerLevel: 'SAP Gold Partner',
      phone: '+994 70 200 97 98',
      email: 'OFFICE@3ILINE.COM',
      address: {
        city: 'Baku',
        country: 'Azerbaijan',
        full: 'Baku, Azerbaijan'
      },
      contact: {
        phone: '+994 70 200 97 98',
        email: 'OFFICE@3ILINE.COM'
      },
      stats: {
        experts: '200+',
        projects: '150+',
        support: '24/7',
        experience: '15+ Years'
      }
    },
    branding: {
      siteTitle: '3ILINE | SAP Consulting Company',
      logoUrl: '',
      faviconUrl: '',
      appleTouchIconUrl: ''
    },
    localization: {
      frontendThirdLanguage: ''
    },
    smtp: {
      enabled: false,
      host: 'smtp.your-provider.com',
      port: 587,
      secure: false,
      username: 'smtp-user@your-domain.com',
      password: '',
      fromName: '3ILINE Website',
      fromEmail: 'no-reply@your-domain.com',
      recipientEmail: 'OFFICE@3ILINE.COM',
      testRecipientEmail: 'OFFICE@3ILINE.COM'
    },
    solutionDetailUi: {
      notFoundText: 'Solution not found.',
      capabilitiesTitle: 'Key Capabilities',
      benefitsTitle: 'Strategic Benefits',
      transformTitle: 'Ready to Transform?',
      transformDescriptionTemplate: "Join the regional leaders who have redefined their business operations using {company}'s certified expertise in {solution}.",
      primaryButtonText: 'Schedule Free Audit',
      primaryButtonHref: '/#contact',
      secondaryButtonText: 'Contact Sales',
      secondaryButtonHref: 'mailto:OFFICE@3ILINE.COM'
    },
    socialLinks: [
      { name: 'LN', href: '#', label: 'LinkedIn' },
      { name: 'TW', href: '#', label: 'Twitter' },
      { name: 'IG', href: '#', label: 'Instagram' }
    ],
    ui: {
      localization: 'Localization',
      syncing: 'Syncing',
      success: 'Success',
      error: 'Error',
      idle: 'Idle'
    }
  },
  siteMap: [
    { slug: 'home', view: 'home', title: 'Home', description: 'Landing page with hero, services and contact blocks.' },
    { slug: 'solutions', view: 'solutions', title: 'Solutions', description: 'Software catalog and solution overview.' },
    { slug: 'about', view: 'about', title: 'About', description: 'Corporate identity, mission, values and history.' },
    { slug: 'team', view: 'team', title: 'Team', description: 'Team principles and culture.' },
    { slug: 'services', view: 'services', title: 'Services', description: 'Consulting and development services.' },
    { slug: 'corporate-standards', view: 'corporate-standards', title: 'Corporate Standards', description: 'Compliance and standards page.' },
    { slug: 'survey', view: 'survey', title: 'Survey', description: 'AI explorer questionnaire.' },
    { slug: 'sap-business-one', view: 'sap-business-one', title: 'SAP Business One', description: 'Dedicated SAP Business One page.' },
    { slug: 'content-admin', view: 'content-admin', title: 'Content Admin', description: 'JSON editor for site content.' }
  ],
  navigation: {
    mainLinks: [
      { name: 'Solutions', view: 'solutions', href: '#solutions' },
      { name: 'Services', view: 'services', href: '#services' },
      { name: 'Team', view: 'team', href: '#team' },
      { name: 'About', view: 'about', href: '#about' },
      { name: 'Contact', view: 'home', href: '#contact' }
    ],
    solutionLinks: [
      { name: 'SAP S/4HANA Cloud', id: 'sap-s4hana' },
      { name: 'SAP SuccessFactors', id: 'sap-successfactors' },
      { name: 'SAP Ariba', id: 'sap-ariba' },
      { name: 'SAP Business One', id: 'sap-business-one' },
      { name: 'OpenText ECM', id: 'opentext' },
      { name: 'Bimser Solutions', id: 'bimser' },
      { name: 'MS Power BI', id: 'microsoft-power-bi' }
    ],
    footer: {
      ecosystemLabel: 'Ecosystem',
      corporateLabel: 'Corporate',
      ecosystemLinks: [
        { label: 'SAP S/4HANA', view: 'sap-s4hana' },
        { label: 'SuccessFactors', view: 'sap-successfactors' },
        { label: 'Technical Care', view: 'services' },
        { label: 'Our Experts', view: 'team' }
      ],
      corporateLinks: [
        { label: 'Company Profile', view: 'about' },
        { label: 'Compliance', view: 'corporate-standards' },
        { label: 'Regional Offices', href: '#' },
        { label: 'Terms of Work', href: '#' }
      ]
    },
    badges: {
      partner: 'SAP Gold Partner',
      admin: 'CMS'
    }
  },
  customPages: [],
  pages: {
    home: {
      seoTitle: '3ILINE | Intelligent Enterprise Transformation',
      sections: {
        hero: {
          badge: 'SAP Gold Partner',
          title: {
            lineOne: 'The Intelligent',
            highlight: 'Enterprise',
            lineThree: 'Transformation.'
          },
          description: '3ILINE architects your digital core with SAP S/4HANA and Business One. We bridge the gap between global standards and regional execution in the Caspian region.',
          primaryCta: 'View Solutions',
          primaryHref: '/solutions',
          secondaryCta: 'Consultancy Services',
          secondaryHref: '/services',
          stats: [
            { value: '150+', label: 'Projects Live' },
            { value: '15+ Years', label: 'Years Experience' },
            { value: '24/7', label: 'Support Cycle' }
          ],
          visual: {
            mainImageUrl: '',
            mainImageAlt: 'ERP dashboard preview',
            sideImageUrl: '',
            sideImageAlt: 'Analytics panel preview'
          },
          aiTerminal: {
            badge: 'Incoming Strategy',
            title: '3ILINE Core Terminal',
            typewriterText: 'Architect a global ERP Migration for Fortune 500 client with automated ROI reporting...',
            statusLabels: {
              idle: 'Idle',
              reasoning: 'Reasoning',
              success: 'Success',
              completed: 'Completed',
              analyzing: 'Analyzing',
              ready: 'Ready'
            },
            neuralEngine: {
              label: 'Neural Engine',
              version: 'v4.2.0',
              intelligence: 'Intelligence',
              reliability: 'Reliability',
              performance: 'Performance',
              activeThreads: 'Active Threads',
              clusterA: 'Cluster_A',
              connected: 'Connected',
              latency: 'Latency',
              traffic: 'Traffic',
              systemStatus: 'System Status'
            },
            reasoningLogs: ['IDENTIFY_STAKE', 'SYSTEM_NODES', 'PHASE_COSTS', 'SOW_MODULES'],
            assetsTitle: 'Assets',
            efficiency: 'Efficiency',
            genAiSystem: 'GenAI System',
            plannerCta: 'AI Event Planner'
          }
        },
        about: {
          eyebrow: 'Identity',
          title: 'Who we are',
          paragraphs: [
            "With years of experience in implementing solutions from global vendors, 3ILINE's team has emerged as a prominent leader in Azerbaijan's technology sector, specializing in business transformation management and consulting.",
            'Our extensive background in deploying global vendor solutions highlights our expertise, positioning our specialists as a reliable choice for businesses seeking technological and operational enhancements across the Caspian region.'
          ],
          badges: ['SAP Gold Partner', 'ISO Certified'],
          buttonText: 'More Info',
          buttonHref: '/about',
          cards: [
            { value: '200+', label: 'Certified Experts' },
            { value: 'SAP', label: 'Authorized Education' },
            { value: '24/7', label: 'Technical Support' },
            { value: '1st', label: 'Cloud Choice in AZ' }
          ]
        },
        partners: {
          title: 'Strategic Partners & Ecosystem',
          items: [
            { name: 'SAP', logo: '' },
            { name: 'Microsoft', logo: '' },
            { name: 'Bimser', logo: '' },
            { name: 'OpenText', logo: '' },
            { name: 'SUSE', logo: '' },
            { name: 'RedHat', logo: '' },
            { name: 'ARIS', logo: '' },
            { name: 'CodeTwo', logo: '' },
            { name: 'Bentley', logo: '' },
            { name: 'Adobe', logo: '' }
          ]
        },
        services: {
          eyebrow: 'Our Expertise',
          title: 'Comprehensive solutions for your digital transformation',
          description: 'We combine deep industry knowledge with technical excellence to deliver results that matter.',
          items: [
            {
              id: 'consulting',
              title: 'SAP Consulting',
              description: 'Strategic guidance and implementation expertise for your SAP journey, from planning to execution.',
              icon: 'Briefcase'
            },
            {
              id: 'development',
              title: 'Custom Development',
              description: 'Tailored software solutions and ABAP development to extend SAP functionality for your unique needs.',
              icon: 'Code'
            },
            {
              id: 'support',
              title: 'Managed Support',
              description: 'Comprehensive 24/7 support and maintenance to ensure your systems run at peak performance.',
              icon: 'Headphones'
            },
            {
              id: 'analytics',
              title: 'Data & Analytics',
              description: 'Transform your data into actionable insights with advanced reporting and BI solutions.',
              icon: 'BarChart'
            },
            {
              id: 'cloud',
              title: 'Cloud Migration',
              description: 'Seamless transition of your infrastructure and applications to secure, scalable cloud environments.',
              icon: 'Cloud'
            },
            {
              id: 'training',
              title: 'User Training',
              description: 'Empower your team with specialized training programs to maximize software adoption and ROI.',
              icon: 'Users'
            }
          ],
          cta: {
            title: 'Strategic Audit',
            description: 'Request a technical audit or a deep-dive demonstration with our certified SAP architects.',
            buttonText: 'View Solution Catalog',
            buttonHref: '/solutions'
          }
        },
        contact: {
          eyebrow: 'Get in Touch',
          title: 'Consultation Request',
          description: 'Our certified SAP architects are available to discuss your digital transformation roadmap.',
          phoneLabel: 'Corporate HQ',
          phoneMeta: 'Mon-Fri, 09:00 - 18:00 (GMT+4)',
          emailLabel: 'Direct Inquiries',
          emailMeta: 'Response within 24 hours',
          form: {
            firstName: 'First Name',
            firstNamePlaceholder: 'Enter name',
            lastName: 'Last Name',
            lastNamePlaceholder: 'Enter surname',
            email: 'Business Email',
            emailPlaceholder: 'name@company.com',
            details: 'Project Details',
            detailsPlaceholder: 'Describe your requirements...',
            submitText: 'Submit Request',
            successMessage: 'Your request has been sent successfully.',
            errorMessage: 'We could not send your request right now. Please try again shortly.'
          }
        },
        footerSummary: '3ILINE supports live, hybrid and medical events with accreditation, entry management, event apps and on-site services.'
      }
    },
    campaign: {
      sections: {
        badge: 'Active Initiative',
        titleLines: ['Year-Kickoff', 'Sales Campaign'],
        initiativesLabel: 'Key Initiatives',
        initiativesText: 'Specialized promotional offers on SAP SuccessFactors, SAP ARIBA, and SAP Business One.',
        buttonText: 'Contact for Details',
        buttonHref: '/#contact',
        sideWords: ['Expertise', 'Drives', 'Impact']
      }
    },
    about: {
      sections: {
        heroBadge: 'Corporate Identity',
        heroTitle: ['Digital Transformation', 'Leaders.'],
        intro: 'Established as the premier SAP Gold Partner in Azerbaijan, 3ILINE has defined the standard for enterprise technology in the region for over a decade. We specialize in complex business transformation management, bridging the gap between global technology and local business needs.',
        mission: {
          title: 'Our Mission',
          description: 'To empower organizations with robust digital foundations that catalyze sustainable growth and national technological leadership through automated workflows and intelligent ERP systems.'
        },
        vision: {
          title: 'Our Vision',
          description: "To be the undisputed architect of the region's digital future, recognized globally for implementation excellence and strategic foresight across all major industries."
        },
        valuesTitle: 'Core Principles',
        valuesSubtitle: 'Foundation of our performance',
        values: [
          {
            title: 'Precision',
            description: 'We believe in architectural accuracy. Every implementation is a blueprint for organizational success.',
            icon: 'ShieldCheck'
          },
          {
            title: 'Integrity',
            description: 'Our reputation as a Gold Partner is built on transparent, high-integrity relationships with our clients.',
            icon: 'Award'
          },
          {
            title: 'Innovation',
            description: "We don't follow trends; we set the pace for digital transformation in the Azerbaijani market.",
            icon: 'Zap'
          }
        ],
        timeline: {
          title: 'A Legacy of Progress',
          description: 'Our journey from local experts to regional leaders',
          badge: 'Established 2012',
          items: [
            {
              year: '2012',
              label: 'Foundation',
              description: '3ILINE founded in Baku with a focus on local ERP support and strategic consulting.'
            },
            {
              year: '2015',
              label: 'SAP Gold Status',
              description: 'Achieved SAP Gold Partnership, validating our world-class implementation standards.'
            },
            {
              year: '2018',
              label: 'Expansion',
              description: 'Scaled resources to provide 24/7 support for regional enterprise leaders.'
            },
            {
              year: '2024',
              label: 'Digital Future',
              description: "Pioneering AI-driven ERP and Cloud transformations as the region's top choice."
            }
          ]
        },
        cta: {
          title: "Region's Leading Ecosystem",
          description: 'We leverage a vast network of certified high-tier consultants, providing our clients with unprecedented depth of expertise and localized execution in Oil & Gas, Gov, and Finance.',
          cities: ['Baku', 'Istanbul', 'Dubai', 'London']
        }
      }
    },
    corporateStandards: {
      sections: {
        eyebrow: 'Ethics & Compliance',
        title: 'Corporate Standards',
        intro: '3ILINE maintains the highest level of integrity through strict adherence to global compliance standards and ethical practices.',
        inquiryCard: {
          title: 'Compliance Inquiries',
          description: 'We encourage all partners and clients to maintain open communication regarding compliance standards.',
          email: 'compliance@3iline.com'
        },
        documents: [
          { title: 'Anti-Bribery Policy', lang: 'EN / AZ' },
          { title: 'Code of Conduct', lang: 'EN / AZ' },
          { title: 'Privacy Policy', lang: 'EN / AZ' },
          { title: 'Ethical Sourcing', lang: 'EN / AZ' }
        ],
        transparency: {
          title: 'Transparency Commitment',
          quote: '3ILINE ensures that all business operations are conducted in accordance with national laws and international ethical guidelines, prioritizing sustainable and responsible technological leadership.'
        }
      }
    },
    survey: {
      sections: {
        badge: 'Interactive Agent',
        title: 'Design Your',
        titleHighlight: 'Event Offering',
        description: 'Choose between a fast recommendation flow and a conversational AI Explorer that scopes event requirements and builds an intelligent offer structure.',
        modeQuick: 'Quick Match',
        modeAdvisor: 'AI Explorer',
        calculatingTitle: 'Analyzing Requirements',
        calculatingDescription: 'Building the closest-fit service recommendation...',
        recommendationLabel: 'Recommended Track',
        viewProductButton: 'View Details',
        retakeButton: 'Retake Survey',
        backButton: 'Back',
        quickQuestions: [
          {
            id: 1,
            question: 'How large is your organization?',
            subtitle: "We'll tailor the scalability of the solution.",
            options: [
              { label: 'Small Business (< 100 Employees)', icon: 'Building2', scores: { 'sap-business-one': 5, 'sap-bydesign': 3 } },
              { label: 'Mid-Market (100 - 1000 Employees)', icon: 'Cloud', scores: { 'sap-bydesign': 5, 'sap-s4hana': 3, 'sap-successfactors': 2 } },
              { label: 'Large Enterprise (1000+ Employees)', icon: 'Building2', scores: { 'sap-s4hana': 5, 'sap-successfactors': 4, 'sap-ariba': 4, 'sap-bw4hana': 3 } }
            ]
          },
          {
            id: 2,
            question: 'What is your primary operational challenge?',
            subtitle: 'Identifying the bottleneck helps us find the cure.',
            options: [
              { label: 'Finance & Core Operations', icon: 'Zap', scores: { 'sap-s4hana': 4, 'sap-business-one': 4, 'sap-bydesign': 4 } },
              { label: 'Talent & HR Management', icon: 'Users', scores: { 'sap-successfactors': 5 } },
              { label: 'Supply Chain & Procurement', icon: 'ShoppingCart', scores: { 'sap-ariba': 5, 'sap-s4hana': 3 } },
              { label: 'Data & Document Management', icon: 'FileText', scores: { opentext: 5, bimser: 4, 'sap-bw4hana': 3 } },
              { label: 'Field Service & Assets', icon: 'Smartphone', scores: { 'sap-fsm': 5, 'sap-sam': 5 } }
            ]
          },
          {
            id: 3,
            question: 'What is your preferred deployment model?',
            subtitle: 'How do you want to consume your infrastructure?',
            options: [
              { label: 'Cloud (SaaS)', icon: 'Cloud', scores: { 'sap-successfactors': 3, 'sap-ariba': 3, 'sap-bydesign': 4, 'sap-analytics': 3 } },
              { label: 'On-Premise / Private Cloud', icon: 'Database', scores: { 'sap-s4hana': 2, 'sap-business-one': 2, 'sap-bw4hana': 3, opentext: 2 } }
            ]
          }
        ],
        solutionContent: {
          'sap-business-one': {
            title: 'SAP Business One',
            description: 'The perfect comprehensive ERP for small to mid-sized businesses looking to streamline operations.'
          },
          'sap-s4hana': {
            title: 'SAP S/4HANA Cloud',
            description: 'The market-leading intelligent ERP for large enterprises needing AI-driven insights and scalability.'
          },
          'sap-successfactors': {
            title: 'SAP SuccessFactors',
            description: 'A world-class Human Experience Management suite to empower your workforce.'
          },
          'sap-ariba': {
            title: 'SAP Ariba',
            description: "Optimize your procurement and supply chain with the world's largest business network."
          },
          'sap-bydesign': {
            title: 'SAP Business ByDesign',
            description: 'A cloud ERP suite for growing mid-market companies that need fast deployment and global best practices.'
          },
          opentext: {
            title: 'OpenText ECM',
            description: 'Strengthen document governance, archiving, and enterprise content visibility.'
          },
          'sap-fsm': {
            title: 'SAP Field Service Management',
            description: 'Improve dispatching, service execution, and customer satisfaction in the field.'
          },
          'sap-sam': {
            title: 'SAP Service & Asset Manager',
            description: 'Empower technicians with mobile, context-rich asset management tools.'
          },
          'sap-bw4hana': {
            title: 'SAP BW/4HANA',
            description: 'Consolidate enterprise data into a high-performance warehouse for real-time analytics.'
          }
        },
        advisor: {
          welcome: 'Willkommen beim FastLane KI-Berater. Wie kann ich Ihre Event-Planung heute unterstützen?',
          consultingLead: 'FastLane Consulting — Architektur, Preisfindung & Systemlogik',
          phases: {
            'Phase A': 'Event-Basisdaten',
            'Phase B': 'Software-Konfiguration',
            'Phase C': 'Projektmanagement',
            'Phase D': 'Miettechnik',
            'Phase E': 'Verbrauchsmaterial',
            'Phase F': 'Support vor Ort',
            'Phase G': 'Transport & Reise'
          },
          fields: {
            customerName: { label: 'KUNDE (PO)', placeholder: 'z.B. Laura Demir' },
            eventName: { label: 'EVENTNAME', placeholder: 'z.B. Annual Growth Summit 2026' },
            eventLocation: { label: 'ORT (VENUES)', placeholder: 'z.B. Filderhalle in Leinfelden-Echterdingen' },
            eventDates: { label: 'DATUM / ZEITEN', placeholder: 'z.B. 17.-18. September 2026, Aufbau ab 14:00 Uhr' },
            attendees: { label: 'TEILNEHMER', placeholder: 'z.B. 1200' },
            checkInScenario: { label: 'SZENARIO', placeholder: 'z.B. Print-on-Demand, 3 Eingänge, 12 Counter' },
            softwareNeeds: { label: 'SOFTWARE', placeholder: 'z.B. Check-in, Scanning, Lead-Capture' },
            integrations: { label: 'INTEGRATIONEN', placeholder: 'z.B. Salesforce, Event-App' },
            projectManagement: { label: 'PROJEKTMANAGEMENT', placeholder: 'z.B. Kickoff, Jour fixes, Generalprobe' },
            rentalNeeds: { label: 'MIETTECHNIK', placeholder: 'z.B. 12 iPads, 4 Badge-Drucker, 2 LTE-Router' },
            consumables: { label: 'VERBRAUCHSMATERIAL', placeholder: 'z.B. Papier-Badges, Lanyards' },
            supportLevel: { label: 'SUPPORT-LEVEL', placeholder: 'z.B. Extended, 2 Techniker' },
            logistics: { label: 'LOGISTIK', placeholder: 'z.B. Spedition, 2 Hotelnächte' },
            budget: { label: 'BUDGET', placeholder: 'z.B. 25.000 EUR' }
          },
          starterPrompts: {
            default: [
              'Tesla Brand Experience Galata, 12. April 2026. 500 PAX, Print-on-Demand.',
              'Tech-Konferenz in Berlin, 3 Tage, 1.200 PAX, 12 Counter.',
              'Check-in Szenarien mit Preispunkten vergleichen.'
            ]
          },
          calculating: 'Analysiere Anforderungen...',
          recommendation: 'Empfohlene Event-Architektur',
          viewProduct: 'Details ansehen',
          retake: 'Neustart',
          back: 'Zurück',
          ui: {
            sidebar: {
              progress: 'Fortschritt',
              mode: 'Modus',
              status: 'Status',
              analyzing: 'Analysiert...',
              ready: 'Bereit',
              step1Open: 'Schritt 1 offen'
            },
            phases: [
              'Phase A — Event-Basisdaten',
              'Phase B — Software-Konfiguration',
              'Phase C — Projektmanagement',
              'Phase D — Miettechnik',
              'Phase E — Verbrauchsmaterial',
              'Phase F — Support vor Ort',
              'Phase G — Transport & Reise'
            ],
            workspace: {
              eyebrow: 'Workspace',
              title: 'Aktuelle Eingabe',
              description: 'Antworten Sie direkt auf die aktuelle Phase oder senden Sie einen kompletten Briefing-Text.',
              modeLabel: '01 / MODE',
              statusLabel: '02 / STATUS',
              inputPlaceholder: 'Ihre Antwort...',
              easyModeNotice: 'Easy Mode erzeugt einen workspacefähigen Prompt. Versendet wird erst nach der Optimierung.',
              promptModeNotice: 'Prompt Mode eignet sich für komplette Event-Briefings in einem freien Text.',
              consultingModeNotice: 'Consulting Mode eignet sich für Agent-Design, Architektur und Kalkulation.',
              step1Notice: 'Warten auf Modus-Wahl'
            },
            activity: {
              eyebrow: 'Aktivität',
              title: 'Workspace Aktivität',
              description: 'Live-Historie der Eingaben und Analysen.',
              processingNotice: 'Die Anfrage wird verarbeitet. Analyse läuft...'
            },
            liveBrief: {
              eyebrow: 'Live Brief',
              title: 'Aktueller Projektstand',
              description: 'Eckdaten werden laufend aus dem Dialog abgeleitet.',
              locationDetails: 'Standortdetails',
              sections: {
                location: 'Location & Team',
                modules: 'Service Module',
                drivers: 'Cost Drivers',
                questions: 'Open Questions',
                assumptions: 'Assumptions'
              }
            },
            structuredInput: {
              eyebrow: 'Manuelle Eingabe',
              title: 'Strukturierte Felder',
              description: 'Pflegen Sie Daten manuell und übernehmen Sie diese als Prompt.',
              exampleButton: 'Beispiel füllen',
              transferButton: 'In Prompt übernehmen',
              sendButton: 'Direkt senden',
              transferNotice: 'Prompt wurde in den Workspace übernommen.',
              exampleNotice: 'Beispiel-Daten wurden geladen.',
              syncLabel: 'Live Sync',
              syncDescription: 'Ergebnisse aus Brief und Kostenlogik.',
              priceLabel: 'Preis Snapshot',
              priceDescription: 'Aktuelle Kalkulation.',
              editLabel: 'Feinschliff',
              editDescription: 'Direkt editierbar.',
              fields: {
                customerName: { label: 'Kunde (PO)', placeholder: 'Name des Kunden' },
                eventName: { label: 'Eventname', placeholder: 'Event Titel' },
                eventLocation: { label: 'Ort (Venues)', placeholder: 'Stadt, Location' },
                eventDates: { label: 'Datum', placeholder: 'z.B. 12.-14. Mai 2026' },
                attendees: { label: 'Teilnehmer', placeholder: 'z.B. 500' },
                checkInScenario: { label: 'Szenario', placeholder: 'Print-on-Demand, Scan etc.' },
                softwareNeeds: { label: 'Software', placeholder: 'App, Lead, Scanning' },
                integrations: { label: 'Integrations', placeholder: 'CRM, Salesforce' },
                projectManagement: { label: 'PM Scope', placeholder: 'Setup, Betreuung' },
                rentalNeeds: { label: 'Miettechnik', placeholder: 'iPads, Drucker' },
                consumables: { label: 'Material', placeholder: 'Badges, Lanyards' },
                supportLevel: { label: 'Support', placeholder: 'Basic / Extended' },
                logistics: { label: 'Logistik', placeholder: 'Versand, Hotel' },
                budget: { label: 'Budget', placeholder: 'Max. Budget (EUR)' }
              }
            },
            lockedMessages: {
              inputs: 'Wählen Sie zuerst einen Modus in Step 1.',
              console: 'Die Kostenübersicht wird nach Technik-Angaben freigegeben.'
            },
            console: {
              eyebrow: 'Offer Console',
              status: 'Status',
              mode: 'Modus',
              consultingTitle: 'Consulting & Konzept',
              pricingTitle: 'Preis, Module & Varianten',
              consultingDescription: 'Architektur und Strategie.',
              pricingDescription: 'Zusammenfassung der Kosten.',
              consultingFocusTitle: 'CONSULTING FOKUS',
              consultingFocusDesc: 'Architektur- und Angebotsfragen.',
              deliverablesTitle: 'DELIVERABLES',
              deliverablesDesc: 'Ergebnisbausteine des Consulting-Prozesses.',
              pricingTitleInternal: 'KALKULATION',
              pricingDescInternal: 'Gesamtsumme und Budget.',
              totalLabel: 'Gesamtsumme (Est.)',
              totalOpen: 'OFFEN',
              budgetLabel: 'Budget',
              modulesTitle: 'Module & Positionen',
              modulesDesc: 'Alle empfohlenen Module.',
              variantsTitle: 'Angebotsvarianten',
              variantsDesc: 'Alternative Angebotspakete.',
              knowledgeTitle: 'Knowledge Cards',
              knowledgeDesc: 'Empfehlungen und Risiken.',
              lockedTitle: 'Kostenübersicht',
              lockedDescription: 'Wird nach Technik- und Scope-Angaben freigegeben.'
            }
          }
        }
      }
    },
    services: {
      sections: {
        eyebrow: 'Enterprise Services',
        title: ['Consulting &', 'Development'],
        description: 'Comprehensive technology services covering implementation, customization, integration, and maintenance for large-scale enterprise systems.',
        phases: [
          {
            title: 'SAP License Provisioning',
            steps: ['License Assessment', 'Selection Strategy', 'Negotiation Support', 'Compliance Management'],
            description: 'Step-by-step guidance in acquiring the right SAP software licenses to optimize your investment. We analyze your landscape to ensure you only pay for what you need.'
          },
          {
            title: 'Project Management',
            steps: ['Planning & Scoping', 'Requirements Gathering', 'Customization & Testing', 'Deployment & Closure'],
            description: 'End-to-end consulting for complex digital transformations using global standard methodologies. Our project managers ensure your roadmap stays on track and within budget.'
          },
          {
            title: 'Technical Development',
            steps: ['Architecture Design', 'Custom Development', 'Integration Testing', 'Post-Go-Live Support'],
            description: 'Specialized software development and system integration services tailored for the Caspian region. We build robust bridges between your core systems and local business needs.'
          }
        ],
        supportCards: [
          {
            title: 'Technical Support',
            description: 'Our support services include issue identification, troubleshooting, resolution follow-up, and continuous knowledge base management available 24/7.',
            meta: 'Available 24/7 Global Response',
            icon: 'LifeBuoy',
            accent: 'gold'
          },
          {
            title: 'Quality Assurance',
            description: 'Defining quality standards, monitoring progress, performing inspections, and ensuring compliance through corrective actions and regular audits.',
            meta: 'ISO Certified Processes',
            icon: 'ShieldCheck',
            accent: 'blue'
          }
        ]
      }
    },
    team: {
      sections: {
        eyebrow: 'Our Professionals',
        title: 'The 3ILINE Team',
        description: '3ILINE takes pride in its certified high-tier consultants, bridging the gap between global technology and local execution.',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
        principlesTitle: 'Guiding Principles',
        principles: [
          { title: 'Teamwork', description: 'Embracing collaborative effort to achieve common organizational goals.', icon: 'Users' },
          { title: 'Honesty', description: 'Transparency and truthfulness in all our business and technical interactions.', icon: 'MessageSquare' },
          { title: 'Integrity', description: 'Upholding strong ethical standards and accountability in delivery.', icon: 'ShieldCheck' },
          { title: 'Respect', description: 'Fostering an environment of mutual respect for work and individuals.', icon: 'Heart' },
          { title: 'Diligence', description: 'Meticulous attention to detail in every system implementation.', icon: 'Target' },
          { title: 'Deadlines', description: 'Consistent commitment to meeting project timelines and milestones.', icon: 'Clock' }
        ],
        quote: 'We support each other, prioritizing customer respect and fostering knowledge sharing across our entire ecosystem.',
        cta: {
          title: 'Join Our Elite Network',
          description: 'We are always looking for certified SAP architects and digital transformation experts to join our Baku and regional offices.',
          buttonText: 'Submit CV',
          buttonHref: 'mailto:OFFICE@3ILINE.COM'
        }
      }
    },
    sapBusinessOne: {
      sections: {
        hero: {
          badge: 'SAP Solution Brief',
          title: [
            'A single ERP',
            'solution for',
            'entire company'
          ],
          description: 'SAP Solutions for Small and Midsize Businesses. Gain greater control over your business or subsidiary with SAP Business One.',
          primaryCta: 'Download Brochure',
          primaryHref: 'https://www.sap.com/products/erp/business-one.html',
          secondaryCta: 'Request Demo',
          secondaryHref: '/#contact',
          gallery: [
            { type: 'image', src: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80', alt: 'Team' },
            { type: 'image', src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80', alt: 'Office' },
            { type: 'image', src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80', alt: 'Meeting' },
            { type: 'image', src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80', alt: 'Working' }
          ]
        },
        stats: {
          title: 'Why 83,000 customers already run SAP Business One around the world?',
          description: 'Every day over 83,000 customers rely on SAP Business One to manage every aspect of their businesses and keep their customers satisfied. Built-in analytics and reporting make it possible to take fast decisions.',
          metrics: [
            { value: '83000+', label: 'Global Customers' },
            { value: '50', label: 'Localizations' },
            { value: '28', label: 'Languages' }
          ],
          benefits: [
            { title: 'Affordable', description: 'Low total cost of ownership', icon: 'ShieldCheck' },
            { title: 'Comprehensive', description: 'All your department needs', icon: 'Layout' },
            { title: 'Quick & Easy', description: 'To implement and maintain', icon: 'Zap' },
            { title: 'Powerful', description: 'To help your business grow', icon: 'TrendingUp' }
          ]
        },
        core: {
          title: 'Robust ERP Solution. Easy to Extend.',
          description: 'A comprehensive solution that covers every aspect of your business, from CRM and sales to financials and operations.',
          centerTitle: 'SAP',
          centerSubtitle: 'Business One',
          centerBadge: 'CORE',
          modules: [
            { name: 'Accounting & Financials', icon: 'Wallet' },
            { name: 'Inventory & Distribution', icon: 'Package' },
            { name: 'Production & MRP', icon: 'Factory' },
            { name: 'Project Management', icon: 'ClipboardList' },
            { name: 'Sales & Service', icon: 'Users' },
            { name: 'Purchasing & Operations', icon: 'ShoppingBag' },
            { name: 'Management & Admin', icon: 'UserCog' },
            { name: 'Mobile Technologies', icon: 'Smartphone' }
          ]
        },
        webInterface: {
          eyebrow: 'User Experience',
          title: ['Intuitive,', 'User-friendly Interface'],
          description: 'SAP Business One web Client features a user-friendly web interface aligned with SAP Fiori design principles. It integrates the core business processes and functionalities with advanced analytics.',
          points: ['Flexible deployment options', 'Advanced analytics in one glance', 'Manage sales, partners, and products', 'Ideal companion for growth'],
          mockup: {
            brandLabel: 'SAP',
            productLabel: 'Business One',
            dashboardTitle: 'My Dashboard',
            updatedLabel: 'Last updated: Just now',
            salesOrdersLabel: 'Sales Orders',
            salesOrdersValue: '156',
            salesOrdersStatus: 'Open',
            revenueLabel: 'Revenue',
            revenueValue: '$1.2M',
            targetLabel: 'Target',
            targetValue: '75%',
            inventoryLabel: 'Inventory Value by Group',
            inventoryBars: ['40', '60', '30', '80', '50', '70', '45', '90']
          }
        },
        financials: {
          title: 'Streamline Your Financial Operations',
          subtitle: 'Financial Management',
          description: 'SAP Business One streamlines financial operations by automating accounting tasks, managing multi-currency transactions, and supporting tax calculations. It handles banking activities, reconciles accounts, and tracks cash flow.',
          featureCards: [
            { title: 'Accounting', description: 'Automatically handle all key accounting processes, such as journal entries, accounts receivable, and accounts payable.', icon: 'Calculator' },
            { title: 'Controlling', description: 'Accurately manage cash flow, track fixed assets, control budgets, and monitor project costs.', icon: 'TrendingUp' }
          ],
          statCards: [
            { value: '35%', label: 'Efficiency Increase' },
            { value: 'Auto', label: 'Reconciliations' }
          ]
        },
        sales: {
          title: 'Maximize Customer Relationships',
          subtitle: 'Sales & CRM',
          description: 'Manage the entire sales process and customer lifecycle efficiently, from initial contact to after-sales support. Integrated functionality provides a complete view of prospects and customers.',
          featureCards: [
            { title: 'Sales Management', description: 'Track opportunities and activities from the first contact to deal closing. Create and manage marketing campaigns.', icon: 'Users' },
            { title: 'Mobilize Sales Team', description: 'Manage your sales information on the move with SAP Business One Sales mobile app.', icon: 'Smartphone' }
          ]
        },
        purchasing: {
          title: 'Simplify Procurement',
          subtitle: 'Purchasing & Inventory',
          description: 'Streamline the entire order-to-pay cycle for small and midsized businesses. Integrated reporting tools enable supplier comparison for better deals and cost savings.',
          featureCards: [
            { title: 'Procurement', description: 'Create purchase requests, POs, and goods receipts; link purchasing documents and view document trails for audit purposes.', icon: 'ShoppingCart' },
            { title: 'Master Data Management', description: 'Manage detailed data in a user-friendly interface, view account balance and purchase analyses.', icon: 'Database' }
          ]
        },
        production: {
          title: 'Effortlessly Manage Inventory',
          subtitle: 'Production & MRP',
          description: 'Track shipments, inventory, and item locations accurately. Support various costing methods, real-time stock monitoring, and seamless transfer tracking.',
          featureCards: [
            { title: 'Warehouse & Inventory', description: 'Manage inventory using various costing models, maintain item master data, and use multiple units of measure.', icon: 'Box' },
            { title: 'Production Planning', description: 'Create and maintain multilevel bills of materials (BOMs), issue and release production orders manually or by backflush.', icon: 'RefreshCw' }
          ]
        },
        analytics: {
          eyebrow: 'Insights',
          title: 'See Your Entire Business Clearly',
          description: 'SAP Business One offers advanced built-in analytical capabilities allowing you to instantly gain business insights that support optimized decision making.',
          cards: [
            { title: 'Real-time Data', description: 'Instant access to live business data for faster decisions.' },
            { title: 'Overview Screens', description: 'Customizable dashboards for every department.' },
            { title: 'User-Defined Queries', description: 'Create complex reports without technical expertise.' },
            { title: 'Linked Views', description: 'Drill down into details with a single click.' }
          ]
        },
        innovation: {
          badge: 'Innovation',
          title: ['Artificial Intelligence', 'and Automation'],
          description: 'Extensibility readiness for adoption of AI services. SAP Business One is ready for the adoption of AI services, enabling partners to create and innovate with most recent AI agents.',
          items: [
            { title: 'SAP Document AI', description: 'Machine learning to streamline processing of invoices from vendors.', icon: 'Sparkles' },
            { title: 'Process Automation', description: 'Free employees from repetitive and error-prone tasks using best-practice templates.', icon: 'Zap' }
          ],
          visualLabel: 'Foundation on SAP BTP'
        },
        industries: {
          eyebrow: 'Expertise',
          title: 'Harness Industry Expertise',
          ecosystemLabel: 'Ecosystem',
          ecosystemValue: 'Over 500 add-on solutions',
          items: [
            { title: 'Consumer Products', description: 'Align operations with modern consumer needs.', cta: 'Explore' },
            { title: 'Industrial Machinery', description: 'Reduce supply chain costs and accelerate cycle times.', cta: 'Explore' },
            { title: 'Professional Services', description: 'Deliver consistent, high-value services to clients.', cta: 'Explore' },
            { title: 'Retail', description: 'Personalized shopping experiences across all channels.', cta: 'Explore' },
            { title: 'Wholesale Distribution', description: 'Proactively meet customer and supplier demands.', cta: 'Explore' }
          ]
        },
        deployment: {
          eyebrow: 'Infrastructure',
          title: 'Flexible Deployment',
          options: [
            { title: 'Cloud', description: 'Deploy in the cloud through partner-hosted options, ensuring scalability.', icon: 'Cloud', color: 'text-blue-500', background: 'bg-blue-50' },
            { title: 'On-Premise', description: 'Deploy in your office with tailored solutions to meet specific needs.', icon: 'Building2', color: 'text-slate-600', background: 'bg-slate-50' },
            { title: 'Mobile Apps', description: 'Manage your business on the go, anytime, anywhere.', icon: 'Smartphone', color: 'text-pink-500', background: 'bg-pink-50' }
          ]
        },
        cta: {
          title: 'Empower Your Business with SAP Business One',
          description: 'Available exclusively through SAP partners like 3ILINE. It streamlines operations, provides instant access to critical information, and accelerates profitable growth.',
          primaryText: 'Learn More at SAP.com',
          primaryHref: 'https://sap.com/businessone',
          secondaryText: 'Contact Our Experts',
          secondaryHref: '/#contact',
          trustedLabel: 'Trusted by 83,000+ Companies'
        }
      }
    },
    solutions: {
      sections: {
        eyebrow: 'Applications',
        title: 'Software Catalog',
        description: 'Select a module to view technical specifications and integration capabilities.',
        products: [
          { id: 'sap-s4hana', title: 'SAP S/4HANA Cloud', category: 'ERP Core', description: 'Intelligent ERP with embedded AI and machine learning.', icon: 'Zap' },
          { id: 'sap-ariba', title: 'SAP Ariba', category: 'Procurement', description: 'Strategic sourcing and supplier management network.', icon: 'ShoppingCart' },
          { id: 'sap-successfactors', title: 'SAP SuccessFactors', category: 'HCM / HXM', description: 'Cloud-based human experience management suite.', icon: 'Users' },
          { id: 'sap-bw4hana', title: 'SAP BW/4HANA', category: 'Data Warehousing', description: 'Next-generation enterprise data warehousing.', icon: 'Database' },
          { id: 'sap-analytics', title: 'SAP Analytics Cloud', category: 'BI & Planning', description: 'Augmented analytics and planning in one solution.', icon: 'BarChart3' },
          { id: 'sap-business-one', title: 'SAP Business One', category: 'SME ERP', description: 'Integrated business management for small companies.', icon: 'Building2' },
          { id: 'microsoft-power-bi', title: 'Microsoft Power BI', category: 'Analytics', description: 'Interactive data visualization and business intelligence.', icon: 'PieChart' },
          { id: 'sap-bydesign', title: 'SAP ByDesign', category: 'Cloud ERP', description: 'Cloud ERP for fast-growing mid-market businesses.', icon: 'Cloud' },
          { id: 'opentext', title: 'OpenText ECM', category: 'Content', description: 'Enterprise content management and digitization.', icon: 'FileText' },
          { id: 'sap-sam', title: 'Asset Manager', category: 'Mobile', description: 'Mobile asset management for reliable operations.', icon: 'Smartphone' },
          { id: 'sap-fsm', title: 'Field Service', category: 'Service', description: 'AI-enabled scheduling and field service dispatch.', icon: 'ClipboardCheck' },
          { id: 'bimser', title: 'Bimser / eBA', category: 'Governance', description: 'Process automation, risk management and compliance.', icon: 'ShieldCheck' }
        ]
      }
    }
  },
  solutionDetails: {
    'sap-s4hana': {
      title: 'SAP S/4HANA Cloud',
      category: 'Enterprise Resource Planning',
      description: "The world's leading intelligent ERP system.",
      intro: 'SAP S/4HANA Cloud is a complete, modular, and AI-powered ERP system that provides the foundation for digital leadership. It enables businesses to run live with real-time insights and industry-best practices.',
      features: [
        'Finance: Unified transactions and automated billing',
        'Manufacturing: Real-time insights and live MRP engine',
        'Sourcing & Procurement: Reduced leakage and increased speed',
        'Supply Chain: Responsive and risk-resilient operations',
        'RISE with SAP: Holistic transformation program'
      ],
      benefits: [
        'Migrate from legacy ERP to cloud securely',
        'Safeguard existing investments with modern tools',
        'Unlock new efficiencies through AI and ML',
        'Scale globally with unified enterprise data'
      ],
      ctaText: 'Start Your Cloud ERP Journey',
      ctaHref: '/#contact'
    },
    'sap-ariba': {
      title: 'SAP Ariba',
      category: 'Sourcing & Procurement',
      description: 'Intelligent solutions for seamless source-to-pay.',
      intro: 'SAP Ariba ties together supplier management, strategic sourcing, and financial supply chain processes to provide a unified experience for buyers and suppliers alike.',
      features: [
        'Strategic Sourcing: Discover qualified suppliers globally',
        'Procurement: Guide employees to buy from right suppliers',
        'Supplier Management: Manage performance and risk',
        'Financial Supply Chain: Optimize working capital',
        "Business Network: World's largest B2B network"
      ],
      benefits: [
        'Reduce spending leakage and control costs',
        'Ensure negotiated savings reach the bottom line',
        'Increase procurement speed and accuracy',
        'Enhance supplier collaboration and visibility'
      ],
      ctaText: 'Request an Ariba Demo',
      ctaHref: '/#contact'
    },
    'sap-successfactors': {
      title: 'SAP SuccessFactors',
      category: 'Human Experience Management (HXM)',
      description: 'Unified talent management that puts people first.',
      intro: 'Reinvent the employee experience with a cloud-based HXM suite that supports core HR, payroll, analytics, and workforce planning across 200+ countries.',
      features: [
        'Recruiting & Onboarding: Nurture and welcome top talent',
        'Performance & Goals: Empower personalized growth',
        'Learning & Development: AI-driven skill building',
        'Compensation & Payroll: Accurate and compliant global pay',
        'Sales Performance Management: Motivate and reward'
      ],
      benefits: [
        'Reinvent employee experience for a digital world',
        'Optimize organizational performance through data',
        'Ensure global HR compliance and scalability',
        'Foster a culture of continuous learning'
      ],
      ctaText: 'Explore HXM Solutions',
      ctaHref: '/#contact'
    },
    'sap-sam': {
      title: 'SAP Service & Asset Manager',
      category: 'Mobile Asset Management',
      description: 'Intuitive mobile app for field technicians.',
      intro: 'Empower your workforce with mobile access to asset data, enabling sustainable and risk-resilient operations through context-rich visualizations and productivity tools.',
      features: [
        'Mobile access to asset health and history',
        'Streamlined maintenance processes and forms',
        'Tailored mobile personas for supply chain',
        'Seamless integration with core SAP systems',
        'Low-code/no-code designer for dynamic forms'
      ],
      benefits: [
        'Enable sustainable and risk-resilient operations',
        'Improve field technician productivity by 30%+',
        'Reduce maintenance costs through faster data entry',
        'Ensure high accuracy of asset information'
      ],
      ctaText: 'Schedule a Mobile Demo',
      ctaHref: '/#contact'
    },
    'sap-fsm': {
      title: 'SAP Field Service Management',
      category: 'FSM & Scheduling',
      description: 'Resolve customer issues quickly with end-to-end service.',
      intro: 'SAP FSM provides comprehensive support for field service operations, featuring cloud deployment, customer self-service, and AI-enabled scheduling.',
      features: [
        'Scheduling & Dispatching: AI-powered optimization',
        'Customer Self-Service: Empower clients to book service',
        'Real-time Analytics: Monitor KPIs on the go',
        'AI-Enabled Scheduling: Reduce travel time and costs',
        'End-to-end Service Lifecycle: From call to invoice'
      ],
      benefits: [
        'Improve first-time fix rates significantly',
        'Reduce operational costs and travel overhead',
        'Increase customer satisfaction and revenue',
        'Scale service operations efficiently'
      ],
      ctaText: 'Optimize Your Field Service',
      ctaHref: '/#contact'
    },
    'sap-business-one': {
      title: 'SAP Business One',
      category: 'ERP for SMEs',
      description: 'Integrated ERP for small and mid-sized businesses.',
      intro: 'A comprehensive solution designed specifically for growing companies to manage accounting, HR, procurement, sales, and distribution in one place.',
      features: [
        'Integrated CRM: Manage the entire sales cycle',
        'Localization: Support for 50+ local markets',
        'Third-party Integrations: Shopify, Magento, FedEx, etc.',
        'Mobile Access: Manage your business from anywhere',
        '24/7 Technical Support: Reliable partner ecosystem'
      ],
      benefits: [
        'Gain total control over your business operations',
        'Scale from small to medium-sized with ease',
        'Reduce IT complexity and hardware costs',
        'Improve data accuracy and reporting speed'
      ],
      ctaText: 'Download Business One Brochure',
      ctaHref: 'https://www.sap.com/products/erp/business-one.html'
    },
    'sap-bw4hana': {
      title: 'SAP BW/4HANA',
      category: 'Data Warehousing',
      description: 'A single source of truth for the entire enterprise.',
      intro: 'SAP BW/4HANA is an on-premise data warehouse layer that consolidates data across the enterprise, providing a robust platform for real-time insights.',
      features: [
        'Simplified Data Modeling: Modern web-based interface',
        'Real-time Insights: Process massive data volumes live',
        'Cloud & On-premise Deployment: Flexible options',
        'Integration: Connect with SAP and non-SAP sources',
        'Advanced Analytics: Innovative data processing'
      ],
      benefits: [
        'Capitalize on all your data assets efficiently',
        'Simplify provisioning of business insights',
        'Consolidate data for a single source of truth',
        'Innovate with high-performance analytics'
      ],
      ctaText: 'Analyze Your Enterprise Data',
      ctaHref: '/#contact'
    },
    'sap-analytics': {
      title: 'SAP Business Analytics',
      category: 'BI & Analytics Cloud',
      description: 'Unified analytics and predictive planning.',
      intro: 'A centralized suite for data reporting, visualization, and sharing. Includes BusinessObjects BI for on-premise and SAP Analytics Cloud for modern planning.',
      features: [
        'Ad-hoc Queries: Rapid data exploration',
        'Enterprise Reporting: Scalable information delivery',
        'Self-service Visualization: Empower business users',
        'Predictive Planning: AI-driven foresight',
        'Role-based Dashboards: Contextual insights'
      ],
      benefits: [
        'Make faster, data-driven business decisions',
        'Unify analytics and planning in one solution',
        'Improve transparency across all departments',
        'Predict future trends with high accuracy'
      ],
      ctaText: 'Start Your Free 30-Day Trial',
      ctaHref: '/#contact'
    },
    'sap-bydesign': {
      title: 'SAP Business ByDesign',
      category: 'Cloud ERP for Midmarket',
      description: 'Large-enterprise capabilities for midsize companies.',
      intro: 'A cloud-based ERP suite that provides comprehensive business management without the need for a large IT infrastructure or massive upfront investment.',
      features: [
        'Finance & CRM: Integrated core operations',
        'Project Management: Track resources and costs',
        'Supply Chain: Manage inventory and logistics',
        'Industry-specific Functions: Tailored for your niche',
        'Quarterly Releases: Always stay on latest version'
      ],
      benefits: [
        'Run your entire business in the cloud',
        'Avoid heavy hardware and IT maintenance costs',
        'Scale your business without limits',
        'Gain enterprise-grade ERP power affordably'
      ],
      ctaText: 'See ByDesign in Action',
      ctaHref: '/#contact'
    },
    'microsoft-power-bi': {
      title: 'Microsoft Power BI',
      category: 'Business Intelligence',
      description: 'Connect to any data, create personalized reports.',
      intro: 'A powerful business analytics service that empowers organizations to visualize data and share insights across the entire enterprise.',
      features: [
        'AI-Powered Insights: Automatic pattern discovery',
        'Real-time Analysis: Monitor live streaming data',
        'Teams Integration: Collaborate inside chat',
        'Big Data Scalability: Handle massive datasets',
        'Mobile BI: Secure access on any device'
      ],
      benefits: [
        'Transform raw data into stunning visuals',
        'Promote self-service analytics at all levels',
        'Reduce report creation time with AI tools',
        'Improve collaboration with Office 365 synergy'
      ],
      ctaText: 'Schedule a Power BI Demo',
      ctaHref: '/#contact'
    },
    opentext: {
      title: 'OpenText Extended ECM',
      category: 'Enterprise Content Management',
      description: 'Integrate content with lead business applications.',
      intro: 'Extended ECM bridges content silos and improves governance by integrating content services with applications like SAP S/4HANA, SuccessFactors, and Salesforce.',
      features: [
        'Secure Document Management: Compliant archiving',
        'Intelligent Capture: Automated data extraction',
        'Connected Workspaces: Content in context',
        'Mobile Access: Secure viewing on the go',
        'Cloud Sharing: Safe collaboration with external partners'
      ],
      benefits: [
        'Bridge content silos across the organization',
        'Improve governance and regulatory compliance',
        'Reduce manual document processing by 50%+',
        'Enable intuitive UI for all information assets'
      ],
      ctaText: 'Manage Your Enterprise Content',
      ctaHref: '/#contact'
    },
    bimser: {
      title: 'Bimser Solutions',
      category: 'Document Control & GRC',
      description: 'Integrated products for document control and risk.',
      intro: 'Bimser provides a suite of integrated products used by millions of professionals for document management, risk control, and health and safety management.',
      features: [
        'eBA: Fast document distribution and management',
        'GRC: Define, analyze, and manage strategic risks',
        'QDMS: Occupational health and safety management',
        'BEAM: Purchasing and supply chain workflows',
        'MDM: Centralize high-quality master data'
      ],
      benefits: [
        'Facilitate fast document distribution across teams',
        'Prevent information losses and legal risks',
        'Ensure targeted quality and compliance safety',
        'Automate complex purchasing and GRC workflows'
      ],
      ctaText: 'Contact for Bimser Pricing',
      ctaHref: '/#contact'
    }
  }
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function deepMergeWithSeed(seed, value) {
  if (Array.isArray(seed)) {
    return Array.isArray(value) ? value : seed;
  }

  if (!isPlainObject(seed)) {
    return value === undefined || value === null ? seed : value;
  }

  const source = isPlainObject(value) ? value : {};
  const result = { ...source };

  for (const [key, seedValue] of Object.entries(seed)) {
    result[key] = deepMergeWithSeed(seedValue, source[key]);
  }

  return result;
}

export function normalizeSiteContent(value) {
  const normalized = deepMergeWithSeed(siteContentSeed, value);
  const partnerItems = normalized?.pages?.home?.sections?.partners?.items;

  if (Array.isArray(partnerItems)) {
    normalized.pages.home.sections.partners.items = partnerItems.map((item) =>
      typeof item === 'string' ? { name: item, logo: '' } : { name: item?.name ?? '', logo: item?.logo ?? '' }
    );
  }

  return normalized;
}

export const editableDocumentKeys = [
  'global',
  'siteMap',
  'navigation',
  'customPages',
  'pages.home',
  'pages.campaign',
  'pages.about',
  'pages.corporateStandards',
  'pages.survey',
  'pages.services',
  'pages.team',
  'pages.sapBusinessOne',
  'pages.solutions',
  'solutionDetails'
];
