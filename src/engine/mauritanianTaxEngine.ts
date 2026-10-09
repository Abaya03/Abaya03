import { Employee, LegalPayrollRules, PayrollInputLine, CalculatedPayslip, PayslipRubric } from '../types';

/**
 * Arrondi financier standard à 2 décimales.
 */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Calcul de l'Impôt sur les Traitements et Salaires (ITS) selon le barème progressif mensuel mauritanien.
 * Code Général des Impôts (CGI).
 */
export function calculateMauritanianITS(taxableBase: number, rules: LegalPayrollRules): { tax: number; bracketDetails: Array<{ min: number; max: number | null; rate: number; taxableInBracket: number; taxAmount: number }> } {
  if (taxableBase <= 0) {
    return { tax: 0, bracketDetails: [] };
  }

  let totalTax = 0;
  const bracketDetails: Array<{ min: number; max: number | null; rate: number; taxableInBracket: number; taxAmount: number }> = [];

  for (const bracket of rules.itsBrackets) {
    if (taxableBase <= bracket.min) {
      continue;
    }

    let taxableInBracket = 0;
    if (bracket.max === null) {
      taxableInBracket = taxableBase - bracket.min;
    } else {
      const ceiling = Math.min(taxableBase, bracket.max);
      taxableInBracket = Math.max(0, ceiling - bracket.min);
    }

    const taxAmount = roundCurrency(taxableInBracket * bracket.rate);
    totalTax += taxAmount;

    bracketDetails.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      taxableInBracket: roundCurrency(taxableInBracket),
      taxAmount
    });
  }

  return {
    tax: roundCurrency(totalTax),
    bracketDetails
  };
}

/**
 * Moteur de calcul déterministe d'un bulletin de paie individuel.
 */
export function calculateEmployeePayslip(
  employee: Employee,
  input: PayrollInputLine | undefined,
  period: string,
  payrollRunId: string,
  rules: LegalPayrollRules,
  departmentName: string
): CalculatedPayslip {
  const rubrics: PayslipRubric[] = [];

  // 1. Éléments de gain contractuels de base
  const baseSalary = roundCurrency(employee.baseSalary);
  rubrics.push({
    code: 'R101',
    label: 'Salaire de Base',
    base: baseSalary,
    employeeAmount: baseSalary,
    employerAmount: 0,
    type: 'EARNING'
  });

  // Indemnité de fonction
  if (employee.functionAllowance > 0) {
    rubrics.push({
      code: 'R110',
      label: 'Indemnité de Fonction / Responsabilité',
      base: roundCurrency(employee.functionAllowance),
      employeeAmount: roundCurrency(employee.functionAllowance),
      employerAmount: 0,
      type: 'EARNING'
    });
  }

  // Indemnité de logement
  if (employee.housingAllowance > 0) {
    rubrics.push({
      code: 'R112',
      label: 'Indemnité de Logement',
      base: roundCurrency(employee.housingAllowance),
      employeeAmount: roundCurrency(employee.housingAllowance),
      employerAmount: 0,
      type: 'EARNING'
    });
  }

  // Indemnité de communication / téléphone
  if (employee.phoneAllowance > 0) {
    rubrics.push({
      code: 'R114',
      label: 'Indemnité de Communication',
      base: roundCurrency(employee.phoneAllowance),
      employeeAmount: roundCurrency(employee.phoneAllowance),
      employerAmount: 0,
      type: 'EARNING'
    });
  }

  // Indemnité de transport
  const rawTransport = roundCurrency(employee.transportAllowance);
  if (rawTransport > 0) {
    rubrics.push({
      code: 'R115',
      label: 'Indemnité de Transport',
      base: rawTransport,
      employeeAmount: rawTransport,
      employerAmount: 0,
      type: 'EARNING'
    });
  }

  // Éléments variables et saisies mensuelles (heures supplémentaires, primes, etc.)
  let overtimeAmount = 0;
  const hourlyRate = (baseSalary / 173.33); // Base 40 heures hebdomadaires (173.33h / mois)

  if (input?.overtimeHours115 && input.overtimeHours115 > 0) {
    const amount = roundCurrency(input.overtimeHours115 * hourlyRate * 1.15);
    overtimeAmount += amount;
    rubrics.push({
      code: 'R131',
      label: `Heures Supplémentaires à 115% (${input.overtimeHours115} h)`,
      base: input.overtimeHours115,
      employeeAmount: amount,
      employerAmount: 0,
      type: 'EARNING'
    });
  }

  if (input?.overtimeHours150 && input.overtimeHours150 > 0) {
    const amount = roundCurrency(input.overtimeHours150 * hourlyRate * 1.50);
    overtimeAmount += amount;
    rubrics.push({
      code: 'R132',
      label: `Heures Supplémentaires à 150% (${input.overtimeHours150} h)`,
      base: input.overtimeHours150,
      employeeAmount: amount,
      employerAmount: 0,
      type: 'EARNING'
    });
  }

  if (input?.overtimeHours200 && input.overtimeHours200 > 0) {
    const amount = roundCurrency(input.overtimeHours200 * hourlyRate * 2.00);
    overtimeAmount += amount;
    rubrics.push({
      code: 'R133',
      label: `Heures Supp. Dimanches / Fériés à 200% (${input.overtimeHours200} h)`,
      base: input.overtimeHours200,
      employeeAmount: amount,
      employerAmount: 0,
      type: 'EARNING'
    });
  }

  let bonusExceptional = 0;
  if (input?.bonusExceptional && input.bonusExceptional > 0) {
    bonusExceptional = roundCurrency(input.bonusExceptional);
    rubrics.push({
      code: 'R140',
      label: 'Prime Exceptionnelle de Performance',
      base: bonusExceptional,
      employeeAmount: bonusExceptional,
      employerAmount: 0,
      type: 'EARNING'
    });
  }

  let retroactiveAdjustment = 0;
  if (input?.retroactiveAdjustment && input.retroactiveAdjustment !== 0) {
    retroactiveAdjustment = roundCurrency(input.retroactiveAdjustment);
    rubrics.push({
      code: 'R150',
      label: 'Rappel / Régularisation de Salaire',
      base: retroactiveAdjustment,
      employeeAmount: retroactiveAdjustment,
      employerAmount: 0,
      type: 'EARNING'
    });
  }

  // Déduction pour absences
  let absenceDeduction = 0;
  if (input?.absenceDays && input.absenceDays > 0) {
    const dailyRate = baseSalary / 30;
    absenceDeduction = roundCurrency(input.absenceDays * dailyRate);
    rubrics.push({
      code: 'R190',
      label: `Retenue pour Absences Non Justifiées (${input.absenceDays} j)`,
      base: input.absenceDays,
      employeeAmount: -absenceDeduction,
      employerAmount: 0,
      type: 'EARNING'
    });
  }

  // Rubriques personnalisées dynamiques saisies ou issues des modèles
  let customGainsTotal = 0;
  let customDeductionsTotal = 0;
  if (input?.customRubricEntries && input.customRubricEntries.length > 0) {
    for (const cr of input.customRubricEntries) {
      if (cr.isGain) {
        customGainsTotal += cr.montant;
        rubrics.push({
          code: cr.code || 'R_CUST_G',
          label: cr.label,
          base: cr.base || cr.montant,
          employeeAmount: cr.montant,
          employerAmount: 0,
          type: 'EARNING'
        });
      } else {
        customDeductionsTotal += cr.montant;
        rubrics.push({
          code: cr.code || 'R_CUST_R',
          label: cr.label,
          base: cr.base || cr.montant,
          employeeAmount: cr.montant,
          employerAmount: 0,
          type: 'NET_ADJUSTMENT'
        });
      }
    }
  }

  // 2. Calcul du Salaire Brut Global
  const totalAllowances = roundCurrency(
    employee.functionAllowance +
    employee.housingAllowance +
    employee.phoneAllowance +
    employee.transportAllowance +
    overtimeAmount +
    bonusExceptional +
    retroactiveAdjustment +
    customGainsTotal -
    absenceDeduction
  );

  const grossSalary = roundCurrency(baseSalary + totalAllowances);

  // 3. Exonérations légales mauritaniennes
  // L'indemnité de transport est exonérée dans la limite de transportAllowanceExemptLimit (ex: 2 500 MRU)
  const exemptTransport = Math.min(rawTransport, rules.transportAllowanceExemptLimit);
  const exemptAllowances = roundCurrency(exemptTransport);

  // 4. Assiettes de cotisations et d'imposition
  // Assiette CNAM : Salaire brut soumis (déplafonné)
  const cnamBase = roundCurrency(Math.max(0, grossSalary - exemptAllowances));

  // Assiette CNSS : Plafonnée à cnssCeilingMonthly (70 000 MRU)
  const cnssBase = roundCurrency(Math.min(cnamBase, rules.cnssCeilingMonthly));

  // 5. Retenues salariales obligatoires
  // CNSS Régime des Pensions Salarié (1.00% plafonné)
  const cnssEmployeeAmount = roundCurrency(cnssBase * rules.cnssPensionEmployeeRate);
  rubrics.push({
    code: 'R201',
    label: 'CNSS Régime des Pensions (Vieillesse)',
    base: cnssBase,
    employeeRate: rules.cnssPensionEmployeeRate * 100,
    employeeAmount: cnssEmployeeAmount,
    employerRate: rules.cnssPensionEmployerRate * 100,
    employerAmount: roundCurrency(cnssBase * rules.cnssPensionEmployerRate),
    type: 'EMPLOYEE_DEDUCTION'
  });

  // CNAM Assurance Maladie Salarié (4.00% déplafonné)
  const cnamEmployeeAmount = roundCurrency(cnamBase * rules.cnamEmployeeRate);
  const cnamEmployerAmount = roundCurrency(cnamBase * rules.cnamEmployerRate);
  rubrics.push({
    code: 'R205',
    label: 'CNAM Assurance Maladie Obligatoire',
    base: cnamBase,
    employeeRate: rules.cnamEmployeeRate * 100,
    employeeAmount: cnamEmployeeAmount,
    employerRate: rules.cnamEmployerRate * 100,
    employerAmount: cnamEmployerAmount,
    type: 'EMPLOYEE_DEDUCTION'
  });

  // 6. Détermination du Brut Fiscal Imposable à l'ITS
  // En droit fiscal mauritanien, les cotisations sociales obligatoires (CNSS salariale + CNAM salariale)
  // sont déductibles de l'assiette de l'ITS.
  const taxableGrossSalary = roundCurrency(Math.max(0, cnamBase - cnssEmployeeAmount - cnamEmployeeAmount));

  // Calcul progressif de l'ITS
  const { tax: itsTaxAmount } = calculateMauritanianITS(taxableGrossSalary, rules);
  rubrics.push({
    code: 'R210',
    label: 'ITS - Impôt sur les Traitements et Salaires',
    base: taxableGrossSalary,
    employeeAmount: itsTaxAmount,
    employerAmount: 0,
    type: 'EMPLOYEE_DEDUCTION'
  });

  // 7. Retenues non fiscales (avances et acomptes)
  let salaryAdvanceAmount = 0;
  if (input?.salaryAdvance && input.salaryAdvance > 0) {
    salaryAdvanceAmount = roundCurrency(input.salaryAdvance);
    rubrics.push({
      code: 'R301',
      label: 'Acompte / Avance sur Salaire',
      base: salaryAdvanceAmount,
      employeeAmount: salaryAdvanceAmount,
      employerAmount: 0,
      type: 'NET_ADJUSTMENT'
    });
  }

  // 8. Charges patronales CNSS (Prestations familiales 8% et Risques pro 2%)
  const cnssEmployerFamilyAmount = roundCurrency(cnssBase * rules.cnssFamilyAllowanceRate);
  rubrics.push({
    code: 'R501',
    label: 'CNSS Prestations Familiales (Part Patronale)',
    base: cnssBase,
    employeeAmount: 0,
    employerRate: rules.cnssFamilyAllowanceRate * 100,
    employerAmount: cnssEmployerFamilyAmount,
    type: 'EMPLOYER_CONTRIBUTION'
  });

  const cnssEmployerInjuryAmount = roundCurrency(cnssBase * rules.cnssWorkInjuryRate);
  rubrics.push({
    code: 'R502',
    label: 'CNSS Accidents du Travail & Risques Pro (Part Patronale)',
    base: cnssBase,
    employeeAmount: 0,
    employerRate: rules.cnssWorkInjuryRate * 100,
    employerAmount: cnssEmployerInjuryAmount,
    type: 'EMPLOYER_CONTRIBUTION'
  });

  const cnssEmployerPensionAmount = roundCurrency(cnssBase * rules.cnssPensionEmployerRate);
  const cnssEmployerTotalAmount = roundCurrency(cnssEmployerPensionAmount + cnssEmployerFamilyAmount + cnssEmployerInjuryAmount);

  // 9. Synthèse Salarié et Employeur
  const totalEmployeeDeductions = roundCurrency(
    cnssEmployeeAmount +
    cnamEmployeeAmount +
    itsTaxAmount +
    salaryAdvanceAmount +
    customDeductionsTotal
  );

  const netSalaryPayable = roundCurrency(grossSalary - totalEmployeeDeductions);

  const totalEmployerContributions = roundCurrency(
    cnssEmployerTotalAmount +
    cnamEmployerAmount
  );

  const totalEmployerCost = roundCurrency(grossSalary + totalEmployerContributions);

  return {
    id: `PAYSLIP-${period}-${employee.id}`,
    payrollRunId,
    employeeId: employee.id,
    period,
    employeeSnapshot: {
      registrationNumber: employee.registrationNumber,
      fullName: `${employee.firstName} ${employee.lastName}`,
      jobTitle: employee.jobTitle,
      departmentName,
      hireDate: employee.hireDate,
      category: employee.category,
      nationalId: employee.nationalIdNumber,
      cnssNumber: employee.socialSecurityNumber,
      cnamNumber: employee.healthInsuranceNumber,
      paymentMethod: employee.paymentMethod,
      bankName: employee.bankName,
      bankAccountNumber: employee.bankAccountNumber
    },
    baseSalary,
    totalAllowances,
    grossSalary,
    exemptAllowances,
    taxableGrossSalary,
    cnssBase,
    cnamBase,
    cnssEmployeeAmount,
    cnamEmployeeAmount,
    itsTaxAmount,
    salaryAdvanceAmount,
    otherDeductionsAmount: 0,
    totalEmployeeDeductions,
    netSalaryPayable,
    cnssEmployerPensionAmount,
    cnssEmployerFamilyAmount,
    cnssEmployerInjuryAmount,
    cnssEmployerTotalAmount,
    cnamEmployerAmount,
    totalEmployerContributions,
    totalEmployerCost,
    rubrics,
    calculationDate: new Date().toISOString()
  };
}
