export type Locale = "pt-BR" | "en";

export const DEFAULT_LOCALE: Locale = "pt-BR";

export interface Dictionary {
  common: {
    positive: string;
    notFound: string;
    noRecords: string;
    cancel: string;
    saveChanges: string;
    close: string;
  };
  sidebar: {
    dashboard: string;
    employees: string;
    revenue: string;
    commissions: string;
    invoices: string;
    settings: string;
    logout: string;
  };
  pageHeader: {
    fictionalData: string;
    inbox: string;
    inboxEmpty: string;
    notifications: string;
    notificationsEmpty: string;
    accountMenu: string;
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
    deleteEmployeeAria: string;
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
    comparisonTitle: string;
    employeeDepartment: string;
    liveRevenue: string;
    snapshotRevenue: string;
    commissionAmount: string;
    totalPay: string;
    noResult: string;
    staleWarning: string;
    advanceStatus: string;
    periodLabel: string;
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
  revenue: {
    title: string;
    totalNet: string;
    totalGross: string;
    averageTicket: string;
    salesTable: string;
    addSale: string;
    addSaleTitle: string;
    editSaleTitle: string;
    createSale: string;
    empty: string;
    employee: string;
    date: string;
    store: string;
    filterByStore: string;
    itemDescription: string;
    itemSku: string;
    quantity: string;
    grossAmount: string;
    netAmount: string;
    deleteSaleAria: string;
    rankingTitle: string;
    rankingItem: string;
    rankingNet: string;
    rankingQuantity: string;
    calculateCommissions: string;
    calculateCommissionsTitle: string;
    period: string;
    calculate: string;
    calculating: string;
    calculateSuccess: string;
    imports: {
      heading: string;
      entity: string;
      entityEmployee: string;
      entityRevenue: string;
      entityInvoice: string;
      entitySale: string;
      chooseFile: string;
      analyze: string;
      noFileSelected: string;
      analyzing: string;
      rowNumber: string;
      errors: string;
      confirmImport: string;
      confirming: string;
      summary: string;
      committed: string;
      failed: string;
      noErrors: string;
      resultSummary: string;
      fields: {
        code: string;
        name: string;
        role: string;
        department: string;
        baseSalary: string;
        tier: string;
        status: string;
        employeeId: string;
        period: string;
        revenueAmount: string;
        amount: string;
        dueDate: string;
        paidDate: string;
        date: string;
        store: string;
        itemDescription: string;
        itemSku: string;
        quantity: string;
        grossAmount: string;
        netAmount: string;
      };
    };
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
      deleteRuleAria: string;
      deleteTierAria: string;
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
      deleteUserAria: string;
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
      close: "Fechar",
    },
    sidebar: {
      dashboard: "Dashboard",
      employees: "Funcionários",
      revenue: "Faturamento",
      commissions: "Comissões",
      invoices: "Faturas",
      settings: "Configurações",
      logout: "Sair",
    },
    pageHeader: {
      fictionalData: "Dados fictícios",
      inbox: "Caixa de entrada",
      inboxEmpty: "Nenhuma mensagem na caixa de entrada.",
      notifications: "Notificações",
      notificationsEmpty: "Não há novas notificações.",
      accountMenu: "Menu da conta",
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
      deleteEmployeeAria: "Excluir funcionário",
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
      comparisonTitle: "Comissão x Faturamento por funcionário",
      employeeDepartment: "Departamento",
      liveRevenue: "Faturamento atual",
      snapshotRevenue: "Faturamento no cálculo",
      commissionAmount: "Comissão",
      totalPay: "Total a pagar",
      noResult: "Sem cálculo",
      staleWarning: "Desatualizado — recalcule",
      advanceStatus: "Avançar status",
      periodLabel: "Período",
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
    revenue: {
      title: "Faturamento",
      totalNet: "Venda líquida total",
      totalGross: "Venda bruta total",
      averageTicket: "Ticket médio",
      salesTable: "Vendas",
      addSale: "Adicionar venda",
      addSaleTitle: "Adicionar venda",
      editSaleTitle: "Editar venda",
      createSale: "Criar venda",
      empty: "Nenhuma venda cadastrada ainda.",
      employee: "Funcionário",
      date: "Data",
      store: "Loja",
      filterByStore: "Filtrar por loja",
      itemDescription: "Descrição do item",
      itemSku: "Código do item",
      quantity: "Quantidade",
      grossAmount: "Venda bruta",
      netAmount: "Venda líquida",
      deleteSaleAria: "Excluir venda",
      rankingTitle: "Ranking de itens",
      rankingItem: "Item",
      rankingNet: "Venda líquida",
      rankingQuantity: "Quantidade",
      calculateCommissions: "Calcular comissões",
      calculateCommissionsTitle: "Calcular comissões do período",
      period: "Período",
      calculate: "Calcular",
      calculating: "Calculando...",
      calculateSuccess: "Comissões calculadas com sucesso.",
      imports: {
        heading: "Importação em massa",
        entity: "Tipo de dado",
        entityEmployee: "Funcionários",
        entityRevenue: "Faturamento",
        entityInvoice: "Faturas",
        entitySale: "Vendas",
        chooseFile: "Selecionar planilha (.xlsx ou .csv)",
        analyze: "Analisar",
        noFileSelected: "Selecione um arquivo para analisar.",
        analyzing: "Analisando...",
        rowNumber: "Linha",
        errors: "Erros",
        confirmImport: "Confirmar importação",
        confirming: "Importando...",
        summary: "{valid} de {total} linhas válidas",
        committed: "importadas",
        failed: "com erro",
        noErrors: "Nenhum erro encontrado.",
        resultSummary: "Resultado da importação",
        fields: {
          code: "Código",
          name: "Nome",
          role: "Cargo",
          department: "Departamento",
          baseSalary: "Salário base",
          tier: "Tier",
          status: "Status",
          employeeId: "Funcionário",
          period: "Período",
          revenueAmount: "Faturamento",
          amount: "Valor",
          dueDate: "Vencimento",
          paidDate: "Data de pagamento",
          date: "Data",
          store: "Loja",
          itemDescription: "Descrição do item",
          itemSku: "Código do item",
          quantity: "Quantidade",
          grossAmount: "Venda bruta",
          netAmount: "Venda líquida",
        },
      },
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
        deleteRuleAria: "Excluir regra",
        deleteTierAria: "Excluir faixa",
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
        deleteUserAria: "Excluir usuário",
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
      close: "Close",
    },
    sidebar: {
      dashboard: "Dashboard",
      employees: "Employees",
      revenue: "Revenue",
      commissions: "Commissions",
      invoices: "Invoices",
      settings: "Settings",
      logout: "Log out",
    },
    pageHeader: {
      fictionalData: "Fictional data",
      inbox: "Inbox",
      inboxEmpty: "No messages in your inbox.",
      notifications: "Notifications",
      notificationsEmpty: "No new notifications.",
      accountMenu: "Account menu",
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
      deleteEmployeeAria: "Delete employee",
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
      comparisonTitle: "Commission vs. Revenue by employee",
      employeeDepartment: "Department",
      liveRevenue: "Current revenue",
      snapshotRevenue: "Revenue at calculation",
      commissionAmount: "Commission",
      totalPay: "Total pay",
      noResult: "No calculation",
      staleWarning: "Outdated — recalculate",
      advanceStatus: "Advance status",
      periodLabel: "Period",
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
    revenue: {
      title: "Revenue",
      totalNet: "Total net sales",
      totalGross: "Total gross sales",
      averageTicket: "Average ticket",
      salesTable: "Sales",
      addSale: "Add sale",
      addSaleTitle: "Add sale",
      editSaleTitle: "Edit sale",
      createSale: "Create sale",
      empty: "No sales recorded yet.",
      employee: "Employee",
      date: "Date",
      store: "Store",
      filterByStore: "Filter by store",
      itemDescription: "Item description",
      itemSku: "Item SKU",
      quantity: "Quantity",
      grossAmount: "Gross amount",
      netAmount: "Net amount",
      deleteSaleAria: "Delete sale",
      rankingTitle: "Item ranking",
      rankingItem: "Item",
      rankingNet: "Net sales",
      rankingQuantity: "Quantity",
      calculateCommissions: "Calculate commissions",
      calculateCommissionsTitle: "Calculate commissions for period",
      period: "Period",
      calculate: "Calculate",
      calculating: "Calculating...",
      calculateSuccess: "Commissions calculated successfully.",
      imports: {
        heading: "Bulk import",
        entity: "Data type",
        entityEmployee: "Employees",
        entityRevenue: "Revenue",
        entityInvoice: "Invoices",
        entitySale: "Sales",
        chooseFile: "Select spreadsheet (.xlsx or .csv)",
        analyze: "Analyze",
        noFileSelected: "Select a file to analyze.",
        analyzing: "Analyzing...",
        rowNumber: "Row",
        errors: "Errors",
        confirmImport: "Confirm import",
        confirming: "Importing...",
        summary: "{valid} of {total} valid rows",
        committed: "imported",
        failed: "with errors",
        noErrors: "No errors found.",
        resultSummary: "Import result",
        fields: {
          code: "Code",
          name: "Name",
          role: "Role",
          department: "Department",
          baseSalary: "Base salary",
          tier: "Tier",
          status: "Status",
          employeeId: "Employee",
          period: "Period",
          revenueAmount: "Revenue",
          amount: "Amount",
          dueDate: "Due date",
          paidDate: "Paid date",
          date: "Date",
          store: "Store",
          itemDescription: "Item description",
          itemSku: "Item SKU",
          quantity: "Quantity",
          grossAmount: "Gross amount",
          netAmount: "Net amount",
        },
      },
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
        deleteRuleAria: "Delete rule",
        deleteTierAria: "Delete tier",
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
        deleteUserAria: "Delete user",
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
