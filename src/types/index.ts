/**
 * Types et interfaces fondamentales pour le système ASI_Paie
 * Conforme aux normes de paie et de gestion des ressources humaines en Mauritanie.
 */

export type EmployeeStatus = 'ACTIF' | 'CONGE' | 'SUSPENDU' | 'DEMISSIONNE' | 'RETRAITE';
export type ContractType = 'CDI' | 'CDD' | 'STAGE' | 'PRESTATION';
export type MaritalStatus = 'CELIBATAIRE' | 'MARIE' | 'DIVORCE' | 'VEUF';
export type PayrollStatus = 'BROUILLON' | 'CALCULE' | 'APPROUVE' | 'CLOTURE';

export interface CompanyProfile {
  id: string;
  name: string;
  legalForm: string; // SA, SARL, etc.
  taxId: string; // NIF (Numéro d'Identification Fiscale)
  cnssNumber: string; // N° Affiliation CNSS
  cnamNumber: string; // N° Affiliation CNAM
  commercialRegister: string; // Registre de Commerce (RC)
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  currency: string; // MRU (Ouguiya)
  bankName: string;
  bankAccountRIB: string;
  logoUrl?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  managerName?: string;
}

export interface Employee {
  id: string;
  registrationNumber: string; // Matricule (ex: EMP-001)
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  nationalIdNumber: string; // NNID
  socialSecurityNumber: string; // N° CNSS
  healthInsuranceNumber: string; // N° CNAM
  maritalStatus: MaritalStatus;
  dependentsCount: number; // Nombre de personnes à charge (enfants/conjoint)
  
  // Compléments d'État Civil & Administratifs
  arabicName?: string; // الاسم بالعربية
  birthPlace?: string; // مكان الميلاد
  gender?: 'M' | 'F'; // الجنس
  bloodGroup?: string; // فصيلة الدم
  seniorityDate?: string; // تاريخ الأقدمية
  indexScale?: string; // Indice salarial
  stepEchelon?: string; // Échelon
  monthlyHours?: number; // Heures mensuelles (défaut 173.33)
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  photoUrl?: string;

  // Professionnel
  departmentId: string;
  jobTitle: string;
  hireDate: string;
  contractType: ContractType;
  contractEndDate?: string;
  status: EmployeeStatus;
  category: string; // Catégorie / Échelon convention collective (ex: Cadre C1, Maîtrise M2)
  
  // Rémunération contractuelle de base (en MRU)
  baseSalary: number;
  transportAllowance: number; // Indemnité de transport
  housingAllowance: number; // Indemnité de logement
  functionAllowance: number; // Indemnité de fonction/responsabilité
  phoneAllowance: number; // Indemnité de communication
  
  // Paiement
  paymentMethod: 'VIREMENT' | 'CHEQUE' | 'ESPECES';
  bankName: string;
  bankBranch: string;
  bankAccountNumber: string; // RIB complet (27 caractères en Mauritanie)
  
  phone: string;
  email: string;
  address: string;
}

export interface LegalPayrollRules {
  version: string;
  effectiveDate: string;
  currency: string;
  
  // CNSS (Caisse Nationale de Sécurité Sociale)
  cnssCeilingMonthly: number; // Plafond mensuel d'assiette (70 000 MRU)
  cnssPensionEmployeeRate: number; // Vieillesse Salariale (1.00%)
  cnssPensionEmployerRate: number; // Vieillesse Patronale (2.00%)
  cnssFamilyAllowanceRate: number; // Prestations familiales (Part Patronale: 8.00%)
  cnssWorkInjuryRate: number; // Risques professionnels / Accidents du travail (2.00%)
  
  // CNAM (Caisse Nationale d'Assurance Maladie)
  cnamEmployeeRate: number; // Part Salariale (4.00%)
  cnamEmployerRate: number; // Part Patronale (5.00%)
  
  // Exonérations fiscales légales
  transportAllowanceExemptLimit: number; // Plafond d'exonération de transport (ex: 2 500 MRU)
  
  // ITS (Impôt sur les Traitements et Salaires) - Barème progressif mensuel en MRU
  itsBrackets: Array<{
    min: number;
    max: number | null; // null = infini
    rate: number; // ex: 0.00, 0.15, 0.25, 0.40
  }>;
}

export interface PayrollInputLine {
  employeeId: string;
  overtimeHours115?: number; // Heures supp à 115%
  overtimeHours150?: number; // Heures supp à 150%
  overtimeHours200?: number; // Heures supp dimanches et fériés (200%)
  bonusExceptional?: number; // Prime exceptionnelle
  absenceDays?: number; // Jours d'absence non rémunérés
  salaryAdvance?: number; // Acompte sur salaire déjà versé
  retroactiveAdjustment?: number; // Rappel sur salaire ou régularisation (+/-)
  notes?: string;
  customRubricEntries?: Array<{
    rubricId: string;
    code: string;
    label: string;
    base?: number;
    taux?: number;
    montant: number;
    isGain: boolean;
  }>;
}

export interface PayslipRubric {
  code: string;
  label: string;
  base: number;
  employeeRate?: number;
  employeeAmount: number; // Montant retenu ou gain
  employerRate?: number;
  employerAmount: number; // Montant charge patronale
  type: 'EARNING' | 'EMPLOYEE_DEDUCTION' | 'EMPLOYER_CONTRIBUTION' | 'NET_ADJUSTMENT';
}

export interface CalculatedPayslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeSnapshot: {
    registrationNumber: string;
    fullName: string;
    jobTitle: string;
    departmentName: string;
    hireDate: string;
    category: string;
    nationalId: string;
    cnssNumber: string;
    cnamNumber: string;
    paymentMethod: string;
    bankName: string;
    bankAccountNumber: string;
  };
  period: string; // '2026-10'
  
  // Bases intermédiaires
  baseSalary: number;
  totalAllowances: number;
  grossSalary: number; // Salaire brut global
  exemptAllowances: number; // Part exonérée d'impôts & cotisations
  taxableGrossSalary: number; // Salaire brut imposable
  cnssBase: number; // Assiette soumise à la CNSS (plafonnée à 70 000 MRU)
  cnamBase: number; // Assiette soumise à la CNAM (déplafonnée)
  
  // Détail des retenues salariales
  cnssEmployeeAmount: number; // 1%
  cnamEmployeeAmount: number; // 4%
  itsTaxAmount: number; // Impôt sur traitements et salaires
  salaryAdvanceAmount: number; // Avances / Acomptes
  otherDeductionsAmount: number;
  totalEmployeeDeductions: number;
  
  // Net
  netSalaryPayable: number; // Net à payer en MRU
  
  // Détail des charges patronales
  cnssEmployerPensionAmount: number; // 2%
  cnssEmployerFamilyAmount: number; // 8%
  cnssEmployerInjuryAmount: number; // 2%
  cnssEmployerTotalAmount: number; // 12%
  cnamEmployerAmount: number; // 5%
  totalEmployerContributions: number; // Total charges sociales patronales
  
  // Coût total employeur
  totalEmployerCost: number; // Brut + Charges patronales
  
  rubrics: PayslipRubric[];
  calculationDate: string;
}

export interface PayrollRun {
  id: string;
  period: string; // '2026-10'
  label: string; // 'Paie du mois d\'Octobre 2026'
  status: PayrollStatus;
  startDate: string;
  endDate: string;
  paymentDate: string;
  
  employeesCount: number;
  totalGross: number;
  totalTaxable: number;
  totalNetPayable: number;
  totalCnssEmployee: number;
  totalCnssEmployer: number;
  totalCnamEmployee: number;
  totalCnamEmployer: number;
  totalIts: number;
  totalEmployerCost: number;
  
  payslips: CalculatedPayslip[];
  
  preparedBy: string;
  preparedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  lockedBy?: string;
  lockedAt?: string;
}

export interface AccountingJournalEntry {
  id: string;
  period: string;
  date: string;
  journalCode: string; // 'OD'
  reference: string; // 'PAIE-2026-10'
  lines: Array<{
    accountNumber: string;
    accountLabel: string;
    label: string;
    debit: number;
    credit: number;
    costCenter?: string;
  }>;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
  lastLogin?: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
}

export interface PayRubricFormula {
  expression: string; // Ex: "[BASE] * [TAUX] / 100", "[NB_HEURES] * ([SALAIRE_BASE] / 173.33) * 1.50"
  description?: string;
  variables: string[]; // Ex: ["BASE", "TAUX", "NB_HEURES", "SALAIRE_BASE"]
  condition?: string; // Ex: "[ANCIENNETE] >= 2"
  defaultRate?: number; // Pourcentage ou coefficient par défaut
  defaultBaseType?: 'SALAIRE_BASE' | 'BRUT' | 'IMPOSABLE' | 'CNSS' | 'FIXE' | 'CUSTOM';
}

export interface PayRubricModelProfile {
  appliedCategories: string[]; // Ex: ['Cadre C1', 'Maîtrise M2', 'Tous']
  appliedContractTypes: string[]; // Ex: ['CDI', 'CDD', 'STAGE']
  defaultFixedAmount?: number;
  isMandatory: boolean;
  frequency: 'MENSUEL' | 'TRIMESTRIEL' | 'ANNUEL' | 'OCCASIONNEL';
  appliesToAllByDefault: boolean;
}

export interface PayRubricDefinition {
  id: string;
  code: string;
  label: string;
  labelAr?: string;
  sens: 'G' | 'R'; // G: Gain, R: Retenue
  sur: 'Brut' | 'Net' | 'Base';
  chapter: string;
  account: string;
  cle?: string;
  isIts: boolean;
  isCnss: boolean;
  isCnam: boolean;
  isPlafonne: boolean;
  isAvantageNature: boolean;
  isCumulable: boolean;
  baseAuto: boolean;
  nombreAuto: boolean;
  // Propriétés étendues de formule et modèle
  formula?: PayRubricFormula;
  model?: PayRubricModelProfile;
}

export interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  departmentCode: string;
  workDays: number;
  presentDays: number;
  absentDays: number;
  delaysCount: number;
  totalHours: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details: string;
  ipAddress?: string;
}

