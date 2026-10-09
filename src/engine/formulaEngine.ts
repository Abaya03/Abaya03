import { Employee, LegalPayrollRules, PayRubricDefinition, PayRubricFormula } from '../types';

export interface EvaluationContext {
  employee: Employee;
  rules: LegalPayrollRules;
  baseSalary: number;
  grossSalary?: number;
  taxableSalary?: number;
  cnssBase?: number;
  seniorityYears?: number;
  inputVariables?: Record<string, number>;
}

/**
 * Calcule l'ancienneté en années à partir de la date d'embauche
 */
export function calculateSeniorityYears(hireDateStr: string, asOfDate: Date = new Date()): number {
  if (!hireDateStr) return 0;
  const hireDate = new Date(hireDateStr);
  const diffTime = Math.max(0, asOfDate.getTime() - hireDate.getTime());
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.floor(diffYears * 10) / 10);
}

/**
 * Évalue une formule mathématique de rubrique de paie en toute sécurité
 * Supporte les variables comme:
 * [BASE], [SALAIRE_BASE], [TAUX], [ANCIENNETE], [NB_HEURES], [HEURES_SUPP], [BRUT], [JOURS]
 */
export function evaluateRubricFormula(
  formula: PayRubricFormula,
  ctx: EvaluationContext,
  customBase?: number,
  customRate?: number,
  customCount?: number
): { computedBase: number; computedRate: number; computedAmount: number; conditionMet: boolean } {
  const seniority = ctx.seniorityYears ?? calculateSeniorityYears(ctx.employee.hireDate);
  const baseSal = ctx.baseSalary;
  const hourlyRate = baseSal / 173.33; // 40h/semaine conventionnelle

  // 1. Déterminer la Base par défaut selon la configuration
  let computedBase = customBase ?? 0;
  if (computedBase === 0) {
    switch (formula.defaultBaseType) {
      case 'SALAIRE_BASE':
        computedBase = baseSal;
        break;
      case 'BRUT':
        computedBase = ctx.grossSalary ?? baseSal;
        break;
      case 'IMPOSABLE':
        computedBase = ctx.taxableSalary ?? baseSal;
        break;
      case 'CNSS':
        computedBase = ctx.cnssBase ?? Math.min(baseSal, ctx.rules.cnssCeilingMonthly);
        break;
      case 'FIXE':
        computedBase = formula.defaultRate ?? 0;
        break;
      default:
        computedBase = baseSal;
    }
  }

  // 2. Déterminer le Taux / Pourcentage
  const computedRate = customRate ?? formula.defaultRate ?? 100;
  const count = customCount ?? 1;

  // 3. Vérifier la condition si présente (ex: "[ANCIENNETE] >= 2")
  let conditionMet = true;
  if (formula.condition && formula.condition.trim() !== '') {
    try {
      const condExpr = formula.condition
        .replace(/\[ANCIENNETE\]/gi, seniority.toString())
        .replace(/\[SALAIRE_BASE\]/gi, baseSal.toString())
        .replace(/\[BASE\]/gi, computedBase.toString());
      
      // Evaluation simple de condition logique
      // Supporte >, >=, <, <=, ==, !=
      if (condExpr.includes('>=')) {
        const [left, right] = condExpr.split('>=').map(s => parseFloat(s.trim()));
        conditionMet = left >= right;
      } else if (condExpr.includes('<=')) {
        const [left, right] = condExpr.split('<=').map(s => parseFloat(s.trim()));
        conditionMet = left <= right;
      } else if (condExpr.includes('>')) {
        const [left, right] = condExpr.split('>').map(s => parseFloat(s.trim()));
        conditionMet = left > right;
      } else if (condExpr.includes('<')) {
        const [left, right] = condExpr.split('<').map(s => parseFloat(s.trim()));
        conditionMet = left < right;
      } else if (condExpr.includes('==')) {
        const [left, right] = condExpr.split('==').map(s => parseFloat(s.trim()));
        conditionMet = left === right;
      }
    } catch {
      conditionMet = true;
    }
  }

  if (!conditionMet) {
    return { computedBase, computedRate, computedAmount: 0, conditionMet: false };
  }

  // 4. Évaluer l'expression
  let expr = (formula.expression && formula.expression.trim() !== '') 
    ? formula.expression 
    : '[BASE] * [TAUX] / 100';

  // Remplacement des jetons
  expr = expr
    .replace(/\[BASE\]/gi, computedBase.toString())
    .replace(/\[SALAIRE_BASE\]/gi, baseSal.toString())
    .replace(/\[TAUXU?\]|\[RATE\]|\[POURCENTAGE\]/gi, computedRate.toString())
    .replace(/\[NB_HEURES\]|\[NOMBRE\]|\[COUNT\]|\[HEURES\]/gi, count.toString())
    .replace(/\[TAUX_HORAIRE\]/gi, hourlyRate.toFixed(4))
    .replace(/\[ANCIENNETE\]/gi, seniority.toString())
    .replace(/\[JOURS\]/gi, (count || 30).toString());

  let computedAmount = 0;
  try {
    // Nettoyer l'expression pour n'autoriser que chiffres et opérateurs mathématiques valides
    const safeExpr = expr.replace(/[^0-9+\-*/().\s]/g, '');
    if (safeExpr) {
      // Evaluation sécurisée avec Function ou parseur arithmétique simple
      // eslint-disable-next-line no-new-func
      const result = new Function(`"use strict"; return (${safeExpr});`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        computedAmount = Math.round((result + Number.EPSILON) * 100) / 100;
      }
    }
  } catch (err) {
    // Repli de secours : calcul standard Base * Taux / 100
    computedAmount = Math.round((computedBase * (computedRate / 100) + Number.EPSILON) * 100) / 100;
  }

  return {
    computedBase,
    computedRate,
    computedAmount,
    conditionMet: true
  };
}

/**
 * Vérifie si un modèle de rubrique est applicable à un salarié donné
 */
export function isRubricApplicableToEmployee(
  rubric: PayRubricDefinition,
  employee: Employee
): boolean {
  if (!rubric.model) return true; // Sans filtre de modèle, disponible pour tous

  const model = rubric.model;
  
  if (model.appliesToAllByDefault) {
    return true;
  }

  // Vérifier la catégorie d'employé (si spécifiée)
  if (model.appliedCategories && model.appliedCategories.length > 0) {
    const hasCategory = model.appliedCategories.some(cat => 
      cat === 'Tous' || cat === 'ALL' || (employee.category && employee.category.toLowerCase().includes(cat.toLowerCase()))
    );
    if (!hasCategory) return false;
  }

  // Vérifier le type de contrat (si spécifié)
  if (model.appliedContractTypes && model.appliedContractTypes.length > 0) {
    const hasContract = model.appliedContractTypes.includes(employee.contractType) || model.appliedContractTypes.includes('Tous' as any);
    if (!hasContract) return false;
  }

  return true;
}
