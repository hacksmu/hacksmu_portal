#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const OUTPUT_PATH = path.join(process.cwd(), 'registrations-export.csv');
const REGISTRATIONS_COLLECTION = 'registrations';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const lines = fileContents.split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    const separatorIndex = trimmedLine.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^"(.*)"$/, '$1');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function initializeFirebase() {
  if (admin.apps.length > 0) return;

  const requiredEnvVars = [
    'SERVICE_ACCOUNT_PROJECT_ID',
    'SERVICE_ACCOUNT_CLIENT_EMAIL',
    'SERVICE_ACCOUNT_PRIVATE_KEY',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.SERVICE_ACCOUNT_PROJECT_ID,
      clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
      privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/^"+|"+$/g, '').replace(
        /\\n/g,
        '\n',
      ),
    }),
  });
}

function normalizeValue(value) {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value)) return value.join(' | ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function escapeCsv(value) {
  const normalized = normalizeValue(value);
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

function buildRow(docId, registration) {
  return {
    docId,
    id: registration.id,
    registrationCreatedAt: registration.registrationCreatedAt,
    timestamp: registration.timestamp,
    userId: registration.user?.id,
    firstName: registration.user?.firstName,
    lastName: registration.user?.lastName,
    registrationEmail: registration.user?.preferredEmail,
    permissions: registration.user?.permissions,
    age: registration.age,
    gender: registration.gender,
    race: registration.race,
    ethnicity: registration.ethnicity,
    school: registration.school || registration.university,
    major: registration.major,
    studyLevel: registration.studyLevel,
    hackathonExperience: registration.hackathonExperience,
    softwareExperience: registration.softwareExperience,
    heardFrom: registration.heardFrom,
    shirtSize: registration.size,
    dietary: registration.dietary,
    mlhConsent: registration.mlhConsent,
    accomodations: registration.accomodations,
    github: registration.github,
    linkedin: registration.linkedin,
    website: registration.website,
    resume: registration.resume,
    companies: registration.companies,
  };
}

async function main() {
  loadEnvFile(path.join(process.cwd(), '.env.local'));
  initializeFirebase();

  const db = admin.firestore();
  const snapshot = await db.collection(REGISTRATIONS_COLLECTION).get();
  const rows = snapshot.docs.map((doc) => buildRow(doc.id, doc.data()));

  if (rows.length === 0) {
    fs.writeFileSync(OUTPUT_PATH, '');
    console.log(`No registrations found. Wrote empty file to ${OUTPUT_PATH}`);
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(',')),
  ];

  fs.writeFileSync(OUTPUT_PATH, csvLines.join('\n'));
  console.log(`Exported ${rows.length} registrations to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error('Failed to export registrations:', error);
  process.exitCode = 1;
});
