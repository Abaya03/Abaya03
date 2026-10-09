import { LegalPayrollRules, CompanyProfile } from '../types';

/**
 * Paramètres légaux de la paie en République Islamique de Mauritanie.
 * Sources légales :
 * - Code de Sécurité Sociale (Loi n° 67-039 modifiée) - Caisse Nationale de Sécurité Sociale (CNSS)
 * - Décret portant création et organisation de la CNAM (Caisse Nationale d'Assurance Maladie)
 * - Code Général des Impôts (CGI) - Barème de l'Impôt sur les Traitements et Salaires (ITS)
 */
export const DEFAULT_MAURITANIAN_RULES: LegalPayrollRules = {
  version: 'RIM-PAIE-2026.1',
  effectiveDate: '2026-01-01',
  currency: 'MRU',
  
  // Plafond CNSS mensuel en Ouguiyas (MRU)
  // Fixé par arrêté interministériel (actuellement 70 000 MRU)
  cnssCeilingMonthly: 70000,
  
  // CNSS Régime des Pensions (Vieillesse, Invalidité, Décès)
  cnssPensionEmployeeRate: 0.01, // 1.00% part salariale (plafonné)
  cnssPensionEmployerRate: 0.02, // 2.00% part patronale (plafonné)
  
  // CNSS Prestations Familiales
  cnssFamilyAllowanceRate: 0.08, // 8.00% part patronale exclusivement (plafonné)
  
  // CNSS Risques Professionnels (Accidents du travail et maladies professionnelles)
  cnssWorkInjuryRate: 0.02, // 2.00% part patronale (plafonné)
  
  // CNAM (Assurance Maladie Obligatoire)
  // Assiette brute déplafonnée
  cnamEmployeeRate: 0.04, // 4.00% part salariale
  cnamEmployerRate: 0.05, // 5.00% part patronale
  
  // Plafond d'exonération de l'indemnité représentative de frais de transport
  transportAllowanceExemptLimit: 2500, // 2 500 MRU / mois exonérés d'ITS et de cotisations
  
  // Barème progressif mensuel de l'ITS (Impôt sur les Traitements et Salaires)
  itsBrackets: [
    { min: 0, max: 6000, rate: 0.00 },       // 0% pour la tranche de 0 à 6 000 MRU
    { min: 6000, max: 21000, rate: 0.15 },   // 15% pour la tranche de 6 001 à 21 000 MRU
    { min: 21000, max: 40000, rate: 0.25 },  // 25% pour la tranche de 21 001 à 40 000 MRU
    { min: 40000, max: null, rate: 0.40 }    // 40% pour la tranche au-delà de 40 000 MRU
  ]
};

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  id: 'COMP-001',
  name: 'Société Mauritanienne d\'Ingénierie et de Services (SMIS SA)',
  legalForm: 'Société Anonyme (SA)',
  taxId: '00194827', // NIF
  cnssNumber: '48291-A',
  cnamNumber: '104822',
  commercialRegister: 'RC NKT-2015-B-1284',
  address: 'Avenue Charles de Gaulle, Ilot K, Nouakchott',
  city: 'Nouakchott',
  country: 'Mauritanie',
  phone: '+222 45 25 18 90',
  email: 'contact@smis-rim.com',
  currency: 'MRU',
  bankName: 'BMCI (Banque Mauritanienne pour le Commerce International)',
  bankAccountRIB: '00001 00100 01234567890 45',
  logoUrl: ''
};
