
export type SolutionId = 
  | 'sap-s4hana' | 'sap-ariba' | 'sap-successfactors' 
  | 'sap-sam' | 'sap-fsm' | 'sap-business-one' 
  | 'sap-bw4hana' | 'sap-analytics' | 'sap-bydesign' 
  | 'microsoft-power-bi' | 'opentext' | 'bimser';

export type CustomPageView = `custom:${string}`;

export type ViewType = 
  | 'home' | 'solutions' | 'about' | 'team' | 'services' 
  | 'corporate-standards' | 'survey' | 'studio' | 'contact' | 'content-admin' | SolutionId | CustomPageView;

export interface Partner {
  name: string;
  logo?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SiteMapEntry {
  slug: string;
  view: ViewType;
  title: string;
  description: string;
}

export interface NavLinkItem {
  name: string;
  view: ViewType;
  href: string;
}

export interface SolutionNavLinkItem {
  name: string;
  id: SolutionId;
}

export interface FooterNavItem {
  label: string;
  view?: ViewType;
  href?: string;
}

export interface CompanyProfile {
  name: string;
  fullName: string;
  sapPartnerLevel: string;
  phone: string;
  email: string;
  address: {
    city: string;
    country: string;
    full: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  stats: {
    experts: string;
    projects: string;
    support: string;
    experience: string;
  };
}

export interface SiteContent {
  global: {
    company: CompanyProfile;
    branding: {
      siteTitle: string;
      logoUrl: string;
      faviconUrl: string;
      appleTouchIconUrl: string;
    };
    localization: {
      frontendThirdLanguage: string;
    };
    smtp: {
      enabled: boolean;
      host: string;
      port: number;
      secure: boolean;
      username: string;
      password: string;
      fromName: string;
      fromEmail: string;
      recipientEmail: string;
      testRecipientEmail: string;
    };
    solutionDetailUi: {
      notFoundText: string;
      capabilitiesTitle: string;
      benefitsTitle: string;
      transformTitle: string;
      transformDescriptionTemplate: string;
      primaryButtonText: string;
      primaryButtonHref: string;
      secondaryButtonText: string;
      secondaryButtonHref: string;
    };
    socialLinks: Array<{ name: string; href: string; label: string }>;
    ui: {
      localization: string;
      syncing: string;
      success: string;
      error: string;
      idle: string;
    };
  };
  siteMap: SiteMapEntry[];
  navigation: {
    mainLinks: NavLinkItem[];
    solutionLinks: SolutionNavLinkItem[];
    footer: {
      ecosystemLabel: string;
      corporateLabel: string;
      ecosystemLinks: FooterNavItem[];
      corporateLinks: FooterNavItem[];
    };
    badges: {
      partner: string;
      admin: string;
    };
  };
  pages: {
    home: {
      seoTitle: string;
      sections: {
        hero: {
          badge: string;
          title: {
            lineOne: string;
            highlight: string;
            lineThree: string;
          };
          description: string;
          primaryCta: string;
          primaryHref: string;
          secondaryCta: string;
          secondaryHref: string;
          stats: Array<{ value: string; label: string }>;
          visual: {
            backgroundVideoUrl: string;
            mainImageUrl: string;
            mainImageAlt: string;
            sideImageUrl: string;
            sideImageAlt: string;
          };
          aiTerminal: {
            badge: string;
            title: string;
            typewriterText: string;
            statusLabels: {
              idle: string;
              reasoning: string;
              success: string;
              completed: string;
              analyzing: string;
              ready: string;
              done: string;
              busy: string;
              wait: string;
            };
            neuralEngine: {
              label: string;
              version: string;
              intelligence: string;
              reliability: string;
              performance: string;
              activeThreads: string;
              clusterA: string;
              connected: string;
              latency: string;
              traffic: string;
              systemStatus: string;
            };
            reasoningLogs: string[];
            assetsTitle: string;
            assets: Array<{ name: string; type: string }>;
            efficiency: string;
            genAiSystem: string;
            plannerCta: string;
          };
        };
        about: {
          eyebrow: string;
          title: string;
          paragraphs: string[];
          badges: string[];
          buttonText: string;
          buttonHref: string;
          cards: Array<{ value: string; label: string }>;
        };
        partners: {
          title: string;
          items: Partner[];
        };
        services: {
          eyebrow: string;
          title: string;
          description: string;
          items: Service[];
          cta: {
            title: string;
            description: string;
            buttonText: string;
            buttonHref: string;
          };
        };
        contact: {
          eyebrow: string;
          title: string;
          description: string;
          phoneLabel: string;
          phoneMeta: string;
          emailLabel: string;
          emailMeta: string;
          form: {
            firstName: string;
            firstNamePlaceholder: string;
            lastName: string;
            lastNamePlaceholder: string;
            email: string;
            emailPlaceholder: string;
            details: string;
            detailsPlaceholder: string;
            submitText: string;
            successMessage: string;
            errorMessage: string;
          };
        };
        footerSummary: string;
      };
    };
    campaign: {
      sections: {
        badge: string;
        titleLines: string[];
        initiativesLabel: string;
        initiativesText: string;
        buttonText: string;
        buttonHref: string;
        sideWords: string[];
      };
    };
    about: {
      sections: {
        heroBadge: string;
        heroTitle: string[];
        intro: string;
        mission: {
          title: string;
          description: string;
        };
        vision: {
          title: string;
          description: string;
        };
        valuesTitle: string;
        valuesSubtitle: string;
        values: Array<{ title: string; description: string; icon: string }>;
        timeline: {
          title: string;
          description: string;
          badge: string;
          items: Array<{ year: string; label: string; description: string }>;
        };
        cta: {
          title: string;
          description: string;
          cities: string[];
        };
      };
    };
    services: {
      sections: {
        eyebrow: string;
        title: string[];
        description: string;
        phases: Array<{ title: string; steps: string[]; description: string }>;
        supportCards: Array<{ title: string; description: string; meta: string; icon: string; accent: 'gold' | 'blue' }>;
      };
    };
    corporateStandards: {
      sections: {
        eyebrow: string;
        title: string;
        intro: string;
        inquiryCard: {
          title: string;
          description: string;
          email: string;
        };
        documents: Array<{ title: string; lang: string }>;
        transparency: {
          title: string;
          quote: string;
        };
      };
    };
    survey: {
      sections: {
        badge: string;
        title: string;
        titleHighlight: string;
        description: string;
        modeQuick: string;
        modeAdvisor: string;
        calculatingTitle: string;
        calculatingDescription: string;
        recommendationLabel: string;
        viewProductButton: string;
        retakeButton: string;
        backButton: string;
        quickQuestions: Array<{
          id: number;
          question: string;
          subtitle: string;
          options: Array<{
            label: string;
            icon: string;
            scores: Partial<Record<SolutionId, number>>;
          }>;
        }>;
        solutionContent: Partial<Record<SolutionId, { title: string; description: string }>>;
        advisor: {
          welcome: string;
          consultingLead: string;
          phases: Record<string, string>;
          fields: Record<string, { label: string; placeholder: string }>;
          starterPrompts: Record<string, string[]>;
          calculating: string;
          recommendation: string;
          viewProduct: string;
          retake: string;
          back: string;
          ui: {
            sidebar: {
              progress: string;
              mode: string;
              status: string;
              analyzing: string;
              ready: string;
              step1Open: string;
            };
            phases: string[];
            workspace: {
              eyebrow: string;
              title: string;
              description: string;
              modeLabel: string;
              statusLabel: string;
              inputPlaceholder: string;
              easyModeNotice: string;
              promptModeNotice: string;
              consultingModeNotice: string;
              step1Notice: string;
            };
            activity: {
              eyebrow: string;
              title: string;
              description: string;
              processingNotice: string;
            };
            structuredInput: {
              eyebrow: string;
              title: string;
              description: string;
              exampleButton: string;
              transferButton: string;
              sendButton: string;
              transferNotice: string;
              exampleNotice: string;
              syncLabel: string;
              syncDescription: string;
              priceLabel: string;
              priceDescription: string;
              editLabel: string;
              editDescription: string;
              fields: Record<string, { label: string; placeholder: string }>;
            };
            liveBrief: {
              eyebrow: string;
              title: string;
              description: string;
              locationDetails: string;
              sections: {
                location: string;
                modules: string;
                drivers: string;
                questions: string;
                assumptions: string;
              };
            };
            lockedMessages: {
              inputs: string;
              console: string;
            };
            console: {
              eyebrow: string;
              status: string;
              mode: string;
              consultingTitle: string;
              pricingTitle: string;
              consultingDescription: string;
              pricingDescription: string;
              consultingFocusTitle: string;
              consultingFocusDesc: string;
              deliverablesTitle: string;
              deliverablesDesc: string;
              pricingTitleInternal: string;
              pricingDescInternal: string;
              totalLabel: string;
              totalOpen: string;
              budgetLabel: string;
              modulesTitle: string;
              modulesDesc: string;
              variantsTitle: string;
              variantsDesc: string;
              knowledgeTitle: string;
              knowledgeDesc: string;
              lockedTitle: string;
              lockedDescription: string;
            };
          };
        };
      };
    };
    team: {
      sections: {
        eyebrow: string;
        title: string;
        description: string;
        imageUrl: string;
        principlesTitle: string;
        principles: Array<{ title: string; description: string; icon: string }>;
        quote: string;
        cta: {
          title: string;
          description: string;
          buttonText: string;
          buttonHref: string;
        };
      };
    };
    sapBusinessOne: {
      sections: {
        hero: {
          badge: string;
          title: string[];
          description: string;
          primaryCta: string;
          primaryHref: string;
          secondaryCta: string;
          secondaryHref: string;
          gallery: Array<{
            type: 'image' | 'video';
            src: string;
            alt: string;
            poster?: string;
          }>;
        };
        stats: {
          title: string;
          description: string;
          metrics: Array<{ value: string; label: string }>;
          benefits: Array<{ title: string; description: string; icon: string }>;
        };
        core: {
          title: string;
          description: string;
          centerTitle: string;
          centerSubtitle: string;
          centerBadge: string;
          modules: Array<{ name: string; icon: string }>;
        };
        webInterface: {
          eyebrow: string;
          title: string[];
          description: string;
          points: string[];
          mockup: {
            brandLabel: string;
            productLabel: string;
            dashboardTitle: string;
            updatedLabel: string;
            salesOrdersLabel: string;
            salesOrdersValue: string;
            salesOrdersStatus: string;
            revenueLabel: string;
            revenueValue: string;
            targetLabel: string;
            targetValue: string;
            inventoryLabel: string;
            inventoryBars: string[];
          };
        };
        financials: {
          title: string;
          subtitle: string;
          description: string;
          featureCards: Array<{ title: string; description: string; icon: string }>;
          statCards: Array<{ value: string; label: string }>;
        };
        sales: {
          title: string;
          subtitle: string;
          description: string;
          featureCards: Array<{ title: string; description: string; icon: string }>;
        };
        purchasing: {
          title: string;
          subtitle: string;
          description: string;
          featureCards: Array<{ title: string; description: string; icon: string }>;
        };
        production: {
          title: string;
          subtitle: string;
          description: string;
          featureCards: Array<{ title: string; description: string; icon: string }>;
        };
        analytics: {
          eyebrow: string;
          title: string;
          description: string;
          cards: Array<{ title: string; description: string }>;
        };
        innovation: {
          badge: string;
          title: string[];
          description: string;
          items: Array<{ title: string; description: string; icon: string }>;
          visualLabel: string;
        };
        industries: {
          eyebrow: string;
          title: string;
          ecosystemLabel: string;
          ecosystemValue: string;
          items: Array<{ title: string; description: string; cta: string }>;
        };
        deployment: {
          eyebrow: string;
          title: string;
          options: Array<{ title: string; description: string; icon: string; color: string; background: string }>;
        };
        cta: {
          title: string;
          description: string;
          primaryText: string;
          primaryHref: string;
          secondaryText: string;
          secondaryHref: string;
          trustedLabel: string;
        };
      };
    };
    solutions: {
      sections: {
        eyebrow: string;
        title: string;
        description: string;
        products: Array<{ id: SolutionId; title: string; category: string; description: string; icon: string }>;
      };
    };
  };
  customPages: Array<{
    slug: string;
    view: CustomPageView;
    title: string;
    seoTitle: string;
    excerpt: string;
    hero: {
      eyebrow: string;
      title: string;
      description: string;
      mediaUrl: string;
      mediaType: 'image' | 'video';
      mediaPoster?: string;
    };
    sections: Array<{
      title: string;
      body: string;
    }>;
  }>;
  solutionDetails: Record<SolutionId, {
    title: string;
    category: string;
    description: string;
    intro: string;
    features: string[];
    benefits: string[];
    ctaText: string;
    ctaHref: string;
  }>;
}
