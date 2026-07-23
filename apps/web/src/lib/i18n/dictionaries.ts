export type Locale = "pt-BR" | "en";

export const DEFAULT_LOCALE: Locale = "pt-BR";

export interface Dictionary {
  common: {
    positive: string;
    notFound: string;
    noRecords: string;
    cancel: string;
    saveChanges: string;
  };
  sidebar: {
    dashboard: string;
    employees: string;
    commissions: string;
    invoices: string;
    settings: string;
    logout: string;
  };
  pageHeader: {
    admin: string;
    fictionalData: string;
  };
  charts: {
    commissionLabel: string;
  };
  status: {
    paid: string;
    approved: string;
    pending: string;
    active: string;
    inactive: string;
  };
  dashboard: {
    title: string;
    totalCommissionsPaid: string;
    latestPeriod: string;
    latestPeriodHint: string;
    topPerformers: string;
    noDataForPeriod: string;
    commissionGrowth: string;
    recentPayments: string;
    tablePeriod: string;
    tableEmployee: string;
    tableCommission: string;
    tableStatus: string;
  };
  employees: {
    title: string;
    search: string;
    filterByDepartment: string;
    fullName: string;
    department: string;
    commissionTier: string;
    currentCommission: string;
    status: string;
    addEmployee: string;
    editEmployeeTitle: string;
    addEmployeeTitle: string;
    empty: string;
    code: string;
    role: string;
    baseSalary: string;
    tier: string;
    tierGold: string;
    tierSilver: string;
    createEmployee: string;
  };
  commissions: {
    title: string;
    totalPaidThisMonth: string;
    pendingInvoicesCount: string;
    averageCommissionRate: string;
    top5Title: string;
    distributionTitle: string;
    recentInvoices: string;
    invoiceId: string;
    dueDate: string;
    employee: string;
    amount: string;
    status: string;
  };
  invoices: {
    title: string;
    invoiceId: string;
    employee: string;
    period: string;
    dueDate: string;
    amount: string;
    status: string;
  };
  settings: {
    title: string;
    rules: {
      heading: string;
      addNewRule: string;
      empty: string;
      typeBase: string;
      typeVolumeBonus: string;
      typeTiered: string;
      appliesGlobally: string;
      above: string;
      addTier: string;
      editRuleTitle: string;
      addRuleTitle: string;
      editTierTitle: string;
      addTierTitleModal: string;
      name: string;
      type: string;
      scope: string;
      department: string;
      role: string;
      global: string;
      percentage: string;
      threshold: string;
      tierName: string;
      minRevenue: string;
      maxRevenue: string;
      saveChanges: string;
      createRule: string;
      addTierBtn: string;
    };
    users: {
      heading: string;
      addUser: string;
      empty: string;
      name: string;
      role: string;
      admin: string;
      manager: string;
      addUserTitle: string;
      email: string;
      password: string;
      linkedEmployee: string;
      none: string;
      addUserBtn: string;
    };
  };
  login: {
    email: string;
    password: string;
    invalidCredentials: string;
    signingIn: string;
    signIn: string;
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  "pt-BR": {
    common: {
      positive: "+ Positivo",
      notFound: "—",
      noRecords: "Nenhum registro encontrado.",
      cancel: "Cancelar",
      saveChanges: "Salvar alterações",
    },
    sidebar: {
      dashboard: "Dashboard",
      employees: "Funcionários",
      commissions: "Comissões",
      invoices: "Faturas",
      settings: "Configurações",
      logout: "Sair",
    },
    pageHeader: {
      admin: "Admin",
      fictionalData: "Dados fictícios",
    },
    charts: {
      commissionLabel: "Comissão",
    },
    status: {
      paid: "Pago",
      approved: "Aprovado",
      pending: "Pendente",
      active: "Ativo",
      inactive: "Inativo",
    },
    dashboard: {
      title: "Dashboard",
      totalCommissionsPaid: "Total de Comissões Pagas",
      latestPeriod: "Último Período",
      latestPeriodHint: "Último período calculado pelo motor de comissão",
      topPerformers: "Top Performers",
      noDataForPeriod: "Sem dados para o período.",
      commissionGrowth: "Crescimento de Comissão",
      recentPayments: "Pagamentos Recentes de Comissão",
      tablePeriod: "Período",
      tableEmployee: "Funcionário",
      tableCommission: "Comissão",
      tableStatus: "Status",
    },
    employees: {
      title: "Gestão de Funcionários",
      search: "Buscar",
      filterByDepartment: "Filtrar por Departamento",
      fullName: "Nome Completo",
      department: "Departamento",
      commissionTier: "Nível de Comissão",
      currentCommission: "Comissão Atual",
      status: "Status",
      addEmployee: "Adicionar funcionário",
      editEmployeeTitle: "Editar funcionário",
      addEmployeeTitle: "Adicionar funcionário",
      empty: "Nenhum funcionário cadastrado ainda.",
      code: "Código",
      role: "Cargo",
      baseSalary: "Salário base ($)",
      tier: "Nível",
      tierGold: "Gold",
      tierSilver: "Silver",
      createEmployee: "Criar funcionário",
    },
    commissions: {
      title: "Relatórios de Comissão & Faturas",
      totalPaidThisMonth: "Total Pago Este Mês",
      pendingInvoicesCount: "Faturas Pendentes",
      averageCommissionRate: "Taxa Média de Comissão",
      top5Title: "Top 5 Funcionários Comissionados",
      distributionTitle: "Distribuição de Comissão por Departamento",
      recentInvoices: "Faturas Recentes",
      invoiceId: "ID da Fatura",
      dueDate: "Vencimento",
      employee: "Funcionário",
      amount: "Valor",
      status: "Status",
    },
    invoices: {
      title: "Faturas",
      invoiceId: "ID da Fatura",
      employee: "Funcionário",
      period: "Período",
      dueDate: "Vencimento",
      amount: "Valor",
      status: "Status",
    },
    settings: {
      title: "Configurações Globais & Regras",
      rules: {
        heading: "Editor de Regras de Comissão",
        addNewRule: "Adicionar nova regra",
        empty: "Nenhuma regra de comissão configurada ainda.",
        typeBase: "Regra Base",
        typeVolumeBonus: "Bônus por Volume",
        typeTiered: "Estrutura em Faixas",
        appliesGlobally: "Aplica-se globalmente",
        above: "acima de",
        addTier: "+ Adicionar faixa",
        editRuleTitle: "Editar regra",
        addRuleTitle: "Adicionar nova regra",
        editTierTitle: "Editar faixa",
        addTierTitleModal: "Adicionar faixa",
        name: "Nome",
        type: "Tipo",
        scope: "Escopo",
        department: "Departamento",
        role: "Cargo",
        global: "Global",
        percentage: "Percentual (%)",
        threshold: "Limite ($)",
        tierName: "Nome da faixa",
        minRevenue: "Faturamento mínimo ($)",
        maxRevenue: "Faturamento máximo ($, vazio = sem limite)",
        saveChanges: "Salvar alterações",
        createRule: "Criar regra",
        addTierBtn: "Adicionar faixa",
      },
      users: {
        heading: "Permissões de Usuário",
        addUser: "Adicionar usuário",
        empty: "Nenhum usuário configurado ainda.",
        name: "Nome",
        role: "Cargo",
        admin: "Admin",
        manager: "Gestor",
        addUserTitle: "Adicionar usuário",
        email: "Email",
        password: "Senha",
        linkedEmployee: "Funcionário vinculado (opcional)",
        none: "Nenhum",
        addUserBtn: "Adicionar usuário",
      },
    },
    login: {
      email: "Email",
      password: "Senha",
      invalidCredentials: "Email ou senha inválidos.",
      signingIn: "Entrando...",
      signIn: "Entrar",
    },
  },
  en: {
    common: {
      positive: "+ Positive",
      notFound: "—",
      noRecords: "No records found.",
      cancel: "Cancel",
      saveChanges: "Save changes",
    },
    sidebar: {
      dashboard: "Dashboard",
      employees: "Employees",
      commissions: "Commissions",
      invoices: "Invoices",
      settings: "Settings",
      logout: "Log out",
    },
    pageHeader: {
      admin: "Admin",
      fictionalData: "Fictional data",
    },
    charts: {
      commissionLabel: "Commission",
    },
    status: {
      paid: "Paid",
      approved: "Approved",
      pending: "Pending",
      active: "Active",
      inactive: "Inactive",
    },
    dashboard: {
      title: "Dashboard",
      totalCommissionsPaid: "Total Commissions Paid",
      latestPeriod: "Latest Period",
      latestPeriodHint: "Latest period calculated by the commission engine",
      topPerformers: "Top Performers",
      noDataForPeriod: "No data for this period.",
      commissionGrowth: "Commission Growth",
      recentPayments: "Recent Commission Payments",
      tablePeriod: "Period",
      tableEmployee: "Employee",
      tableCommission: "Commission",
      tableStatus: "Status",
    },
    employees: {
      title: "Employee Management",
      search: "Search",
      filterByDepartment: "Filter By Department",
      fullName: "Full Name",
      department: "Department",
      commissionTier: "Commission Tier",
      currentCommission: "Current Commission",
      status: "Status",
      addEmployee: "Add employee",
      editEmployeeTitle: "Edit employee",
      addEmployeeTitle: "Add employee",
      empty: "No employees configured yet.",
      code: "Code",
      role: "Role",
      baseSalary: "Base salary ($)",
      tier: "Tier",
      tierGold: "Gold",
      tierSilver: "Silver",
      createEmployee: "Create employee",
    },
    commissions: {
      title: "Commission Reports & Invoices",
      totalPaidThisMonth: "Total Paid This Month",
      pendingInvoicesCount: "Pending Invoices Count",
      averageCommissionRate: "Average Commission Rate",
      top5Title: "Top 5 Commissioned Employees",
      distributionTitle: "Commission Distribution by Department",
      recentInvoices: "Recent Invoices",
      invoiceId: "Invoice ID",
      dueDate: "Due Date",
      employee: "Employee",
      amount: "Amount",
      status: "Status",
    },
    invoices: {
      title: "Invoices",
      invoiceId: "Invoice ID",
      employee: "Employee",
      period: "Period",
      dueDate: "Due Date",
      amount: "Amount",
      status: "Status",
    },
    settings: {
      title: "Global Settings & Rules",
      rules: {
        heading: "Commission Rules Editor",
        addNewRule: "Add new rule",
        empty: "No commission rules configured yet.",
        typeBase: "Base Rule",
        typeVolumeBonus: "Volume Bonus",
        typeTiered: "Tiered Structure",
        appliesGlobally: "Applies globally",
        above: "above",
        addTier: "+ Add tier",
        editRuleTitle: "Edit rule",
        addRuleTitle: "Add new rule",
        editTierTitle: "Edit tier",
        addTierTitleModal: "Add tier",
        name: "Name",
        type: "Type",
        scope: "Scope",
        department: "Department",
        role: "Role",
        global: "Global",
        percentage: "Percentage (%)",
        threshold: "Threshold ($)",
        tierName: "Tier name",
        minRevenue: "Min revenue ($)",
        maxRevenue: "Max revenue ($, empty = no limit)",
        saveChanges: "Save changes",
        createRule: "Create rule",
        addTierBtn: "Add tier",
      },
      users: {
        heading: "User Permissions",
        addUser: "Add user",
        empty: "No users configured yet.",
        name: "Name",
        role: "Role",
        admin: "Admin",
        manager: "Manager",
        addUserTitle: "Add user",
        email: "Email",
        password: "Password",
        linkedEmployee: "Linked employee (optional)",
        none: "None",
        addUserBtn: "Add user",
      },
    },
    login: {
      email: "Email",
      password: "Password",
      invalidCredentials: "Invalid email or password.",
      signingIn: "Signing in...",
      signIn: "Sign in",
    },
  },
};
