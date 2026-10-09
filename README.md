# ASI_Paie — Système Professionnel de Gestion de la Paie et du Personnel

Inspiré de l'ergonomie et de la rigueur comptable de Sage Paie, **ASI_Paie** est une solution complète de gestion de la paie et des ressources humaines, conforme à la réglementation fiscale et sociale de la **République Islamique de Mauritanie** (CNSS, CNAM, ITS).

---

## 1. Architecture du Système

Le système est conçu pour une architecture client-serveur sécurisée en réseau local (LAN) d'entreprise :

- **Postes Clients Desktop (Windows & macOS)** : Interface React / TypeScript sous Electron, communiquant exclusivement via API REST sécurisée avec jetons JWT révocables.
- **Serveur d'Application (Windows 11 Dédié)** : Backend NestJS / Node.js avec validation stricte, contrôle d'accès basé sur les rôles (RBAC), transactions ACID et journalisation d'audit inaltérable.
- **Base de Données Relationnelle** : MySQL 8.x (moteur InnoDB), devises stockées en précision décimale fixe (`DECIMAL(14, 2)`), aucune exposition directe du port 3306 aux postes clients.

---

## 2. Spécification Légale et Moteur de Calcul Mauritanien (MRU)

### A. Caisse Nationale de Sécurité Sociale (CNSS)
- **Plafond d'assiette mensuelle** : 70 000 MRU (arrêté ministériel).
- **Régime des Pensions (Vieillesse, Invalidité, Décès)** :
  - Part salariale : 1,00 % (sur salaire soumis plafonné à 70 000 MRU).
  - Part patronale : 2,00 % (sur salaire soumis plafonné).
- **Prestations Familiales** : 8,00 % (part patronale exclusivement).
- **Risques Professionnels & Accidents du Travail** : 2,00 % (part patronale).
- **Total Cotisations CNSS** : 1,00 % Salarié / 12,00 % Patronal.

### B. Caisse Nationale d'Assurance Maladie (CNAM)
- **Assiette soumise** : Salaire brut déplafonné (déduction faite des frais professionnels exonérés).
- **Part Salariale** : 4,00 %.
- **Part Patronale** : 5,00 %.
- **Total Cotisation Maladie** : 9,00 %.

### C. Impôt sur les Traitements et Salaires (ITS)
Calcul progressif mensuel par tranches selon le Code Général des Impôts (CGI) mauritanien, après déduction des cotisations sociales obligatoires (CNSS 1% et CNAM 4%) et de l'abattement transport :
- **De 0 à 6 000 MRU** : 0,00 %
- **De 6 001 à 21 000 MRU** : 15,00 %
- **De 21 001 à 40 000 MRU** : 25,00 %
- **Au-delà de 40 000 MRU** : 40,00 %
- **Plafond d'exonération de l'indemnité de transport** : 2 500 MRU / mois.

---

## 3. Fonctionnalités Implémentées dans l'Interface

1. **Tableau de Bord Exécutif** : Indicateurs financiers (masse brute, total net à verser, cotisations CNSS/CNAM, retenues ITS, coût global employeur), ventilation par direction, état de la période et audit récent.
2. **Dossier du Personnel & Contrats** :
   - Registre du personnel complet avec matricule unique, NNID, état civil, enfants à charge.
   - Affectation par département (Direction Générale, Finance, RH, IT, Logistique) et classification conventionnelle.
   - Rémunération contractuelle détaillée (base, transport, logement, fonction, communication).
   - Coordonnées bancaires complètes (RIB 27 caractères, banque domiciliataire).
   - Formulaire multi-onglets de création/édition, recherche en temps réel et filtres.
   - Module d'importation en masse de fichiers Excel / CSV avec prévisualisation et détection des doublons.
3. **Moteur et Cycle de Paie Mensuel** :
   - Calcul déterministe en masse ou individuel.
   - Saisie des variables mensuelles (heures supplémentaires à 115%, 150%, 200%, primes exceptionnelles, absences, acomptes déduits, régularisations).
   - Simulation en temps réel de l'impact sur le net à payer et le coût employeur.
   - Détection des anomalies de paie (salarié sans RIB, dépassement d'avances, net négatif).
   - Gestion des statuts de cycle : *Brouillon* $\rightarrow$ *Calculé* $\rightarrow$ *Approuvé par Direction* $\rightarrow$ *Clôturé & Verrouillé*.
4. **Édition du Bulletin de Paie (Format A4 Officiel)** :
   - En-tête conforme avec identifiants entreprise (NIF, CNSS, CNAM, RC, adresse).
   - Bloc salarié complet et coordonnées de règlement.
   - Tableau normalisé des rubriques (base, taux salarial, montant gain/retenue, taux patronal, charges patronales).
   - Récapitulatif des assiettes et cumuls annuels.
   - Vue d'impression haute-fidélité optimisée pour feuille A4 (`window.print` et export PDF).
5. **États et Déclarations Réglementaires** :
   - *Livre de Paie Mensuel* (Grand livre détaillé avec totaux généraux).
   - *Bordereau de Déclaration CNSS* (assiettes plafonnées à 70 000 MRU).
   - *Bordereau de Déclaration CNAM* (cotisations santé 9%).
   - *État de Déclaration Fiscale ITS* (Direction Générale des Impôts).
   - *Bordereau d'Ordre de Virement Bancaire* (normé avec RIB et références).
   - Export universel CSV et impression de tous les états.
6. **Journal d'Opérations Diverses (OD de Paie)** :
   - Génération automatique des écritures comptables en partie double (Comptes 641100, 641200, 645100, 645200, 421000, 431100, 431200, 447100, 425000).
   - Contrôle mathématique strict de l'équilibre Débit = Crédit.
   - Export CSV compatible Sage 100 Comptabilité.
7. **Administration, Habilitations & Audit** :
   - Rôles prédéfinis : Administrateur Système, Responsable RH, Gestionnaire de Paie, Directeur Approbateur, Comptable.
   - Séparation des tâches (les gestionnaires préparent, les directeurs approuvent et clôturent).
   - Journal d'audit inaltérable avec horodatage, auteur, action et détails.
   - Consultation et mise à jour dynamique des barèmes légaux mauritaniens.

---

## 4. Guide de Déploiement sur Serveur Windows 11

### Étape 1 : Prérequis Serveur
- Windows 11 Pro / Enterprise (avec adresse IP statique locale, ex: `192.168.1.100`).
- Node.js LTS (v20 ou v22).
- MySQL Server 8.0 (InnoDB, encodage `utf8mb4`).

### Étape 2 : Configuration MySQL
```sql
CREATE DATABASE asi_paie_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'asipaie_svc'@'localhost' IDENTIFIED BY 'MOT_DE_PASSE_SECURISE';
GRANT ALL PRIVILEGES ON asi_paie_db.* TO 'asipaie_svc'@'localhost';
FLUSH PRIVILEGES;
```

### Étape 3 : Installation du Service Windows
1. Cloner ou copier le code applicatif dans `C:\ASI_Paie`.
2. Créer le fichier `.env` sur le serveur avec les variables d'environnement.
3. Exécuter les migrations Prisma :
   ```bash
   npx prisma migrate deploy
   ```
4. Enregistrer l'API en service d'arrière-plan Windows à l'aide de NSSM (Non-Sucking Service Manager) :
   ```cmd
   nssm install ASI_Paie_API "C:\Program Files\nodejs\node.exe" "C:\ASI_Paie\dist\server.js"
   nssm set ASI_Paie_API AppDirectory "C:\ASI_Paie"
   nssm start ASI_Paie_API
   ```

### Étape 4 : Configuration du Pare-feu Windows
Ouvrir uniquement le port de l'API (ex: 3000 ou 443 en HTTPS) aux adresses IP du sous-réseau de l'entreprise :
```powershell
New-NetFirewallRule -DisplayName "ASI_Paie API HTTPS" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -RemoteAddress 192.168.1.0/24
```
*Le port MySQL 3306 ne doit en aucun cas être ouvert sur le réseau local.*

---

## 5. Exécution Locale en Mode Développement

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement (port 3000)
npm run dev

# Vérification de compilation TypeScript
npm run lint
npm run build
```
