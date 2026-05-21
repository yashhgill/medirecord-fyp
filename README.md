# HarNova MediSolutions

HarNova MediSolutions is a final-year project demo for a hybrid-cloud patient
health record system. It demonstrates how a clinic can keep operating when the
internet fails by switching from the cloud record store to an encrypted local
hard disk or NAS cache.

## Project Idea

- NFC cards contain only an IC number or tokenized patient identifier.
- The kiosk reads the NFC payload and uses it to pull the patient record.
- Doctors and nurses use the same record source for clinical review and notes.
- Administration monitors billing, appointments, system health, and sync status.
- When cloud connectivity is healthy, the cloud is the system of record.
- When the network fails, the app reads from the local disk cache and queues
  updates until cloud sync is restored.

## Patient Kiosk Flow

1. Patient visits the clinic.
2. Patient goes to the kiosk.
3. Patient taps the IC/NFC card on the reader.
4. The kiosk reads the IC number and pulls the patient record.
5. If the patient has an appointment, the kiosk confirms arrival and prints a
   clinic queue number.
6. If the patient has no appointment, the kiosk lets them create a walk-in
   appointment and then prints a queue number.
7. Patient receives treatment from the clinic.
8. Patient returns to the kiosk and taps the IC/NFC card again.
9. The kiosk displays outstanding bills and accepts payment.
10. After payment, the kiosk prints a medication queue number.
11. Patient goes to the pharmacy counter and collects medication.
12. The visit is completed and the patient can go home.

## Recommended Cloud Platform

Use AWS as the main cloud platform for the production design.

Recommended region:

- Primary: AWS Asia Pacific Malaysia, `ap-southeast-5`
- Disaster recovery: AWS Singapore, `ap-southeast-1`, only if cross-border
  recovery copies are allowed by the compliance policy

Recommended services:

- API layer: Amazon API Gateway with AWS Lambda, or ECS Fargate for a container API
- Health data layer: AWS HealthLake for FHIR-first records, or Amazon RDS
  PostgreSQL for a simpler FYP implementation
- File/archive layer: Amazon S3 with Object Lock for immutable record exports
- Backup layer: AWS Backup with Vault Lock
- Identity: Amazon Cognito, IAM Identity Center, and role-based access control
- Encryption: AWS KMS customer-managed keys
- Monitoring/security: CloudTrail, CloudWatch, GuardDuty, Security Hub, AWS WAF
- Hybrid/local edge: encrypted NAS or hard disk cache with a local sync service

## Production Security Baseline

- Do not store medical history on the NFC card.
- Encrypt PHI at rest and in transit.
- Use least-privilege roles for doctor, nurse, admin, and kiosk users.
- Require MFA for staff accounts.
- Keep immutable audit logs of every patient record view and update.
- Keep immutable backups and run restore drills.
- Use a queue for offline writes so sync can resume safely.
- Add conflict resolution rules for offline edits.
- Segment the kiosk/NFC network away from the database network.
- Run privacy impact and threat-model reviews before using real patient data.

## Demo Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```
