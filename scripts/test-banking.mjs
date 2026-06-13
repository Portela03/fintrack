#!/usr/bin/env node
/**
 * FinTrack – Script de teste do fluxo bancário (Open Finance)
 *
 * Uso:
 *   node scripts/test-banking.mjs
 *
 * Variáveis de ambiente (ou edite os valores abaixo):
 *   FINTRACK_EMAIL, FINTRACK_PASSWORD, PLUGGY_ITEM_ID
 *
 * Para obter o PLUGGY_ITEM_ID:
 *   1. npm run start:dev
 *   2. Abra pluggy-widget.html no browser
 *   3. Autorize Nubank ou Inter → copie o itemId exibido
 *   4. Defina PLUGGY_ITEM_ID=<valor> e rode este script
 */

const BASE = process.env.FINTRACK_BASE_URL ?? 'http://localhost:3000/api/v1';
const EMAIL = process.env.FINTRACK_EMAIL ?? 'joao@email.com';
const PASSWORD = process.env.FINTRACK_PASSWORD ?? 'Senha@1234';
const ITEM_ID = process.env.PLUGGY_ITEM_ID ?? '';

const SLEEP_MS = 12_000; // tempo de espera para o job de sync processar

// ─── helpers ────────────────────────────────────────────────────────────────

let jwt = '';

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }

  return { status: res.status, ok: res.ok, json };
}

function log(emoji, label, value) {
  const v = value !== undefined ? JSON.stringify(value, null, 2) : '';
  console.log(`\n${emoji} ${label}`);
  if (v) console.log(v);
}

function assert(condition, msg) {
  if (!condition) {
    console.error(`\n❌ FALHOU: ${msg}`);
    process.exit(1);
  }
  console.log(`   ✔ ${msg}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── testes ──────────────────────────────────────────────────────────────────

async function step1_auth() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PASSO 1 — Autenticação');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Tenta registrar (pode já existir)
  await req('POST', '/auth/register', { email: EMAIL, name: 'Test User', password: PASSWORD });

  const r = await req('POST', '/auth/login', { email: EMAIL, password: PASSWORD });
  assert(r.ok, `Login retornou ${r.status}`);
  assert(r.json.accessToken, 'accessToken presente na resposta');
  jwt = r.json.accessToken;
  log('🔑', 'JWT obtido', jwt.slice(0, 40) + '...');
}

async function step2_connectToken() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PASSO 2 — Obter Connect Token do Pluggy');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const r = await req('GET', '/connections/connect-token');
  log('📋', 'Resposta', r.json);

  if (!r.ok) {
    console.log('\n⚠️  PLUGGY_CLIENT_ID / PLUGGY_CLIENT_SECRET podem não estar configurados no .env');
    console.log('   Configure as credenciais do Pluggy e rode novamente.');
    return false;
  }

  assert(r.ok, `connect-token retornou ${r.status}`);
  assert(r.json.connectToken, 'connectToken presente');
  log('🎫', 'connectToken', r.json.connectToken.slice(0, 40) + '...');
  console.log('\n👉 Para conectar um banco real:');
  console.log('   1. Abra pluggy-widget.html no browser');
  console.log('   2. Cole este connectToken quando solicitado');
  console.log('   3. Autorize Nubank ou Inter');
  console.log('   4. Copie o itemId exibido e defina PLUGGY_ITEM_ID=<valor>');
  return true;
}

async function step3_registerConnection() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PASSO 3 — Registrar Conexão Bancária');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!ITEM_ID) {
    console.log('\n⚠️  PLUGGY_ITEM_ID não definido.');
    console.log('   Siga o Passo 2 acima para obter o itemId real do seu banco.');
    console.log('   Depois: PLUGGY_ITEM_ID=<id> node scripts/test-banking.mjs');
    return null;
  }

  const r = await req('POST', '/connections', { itemId: ITEM_ID });
  log('📋', 'Resposta', r.json);
  assert(r.ok, `POST /connections retornou ${r.status}`);
  assert(r.json.connectionId, 'connectionId presente');
  log('🔗', 'Conexão criada', { connectionId: r.json.connectionId, status: r.json.status });
  return r.json.connectionId;
}

async function step4_waitAndVerify(connectionId) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`PASSO 4 — Aguardando sync (${SLEEP_MS / 1000}s)...`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   (Redis + BullMQ processando jobs em background)');

  await sleep(SLEEP_MS);

  // Lista conexões
  const rList = await req('GET', '/connections');
  assert(rList.ok, `GET /connections retornou ${rList.status}`);
  const conn = rList.json.find?.((c) => c.id === connectionId);
  if (conn) {
    log('📡', 'Status da conexão', { id: conn.id, status: conn.status, lastSyncAt: conn.lastSyncAt });
    assert(conn.status === 'UPDATED' || conn.status === 'UPDATING', `Status: ${conn.status}`);
  } else {
    log('📋', 'Todas as conexões', rList.json);
  }

  // Lista contas
  const rAccounts = await req('GET', `/connections/${connectionId}/accounts`);
  assert(rAccounts.ok, `GET /connections/${connectionId}/accounts retornou ${rAccounts.status}`);
  log('🏦', `Contas sincronizadas (${rAccounts.json.length ?? 0})`, rAccounts.json);

  if (Array.isArray(rAccounts.json) && rAccounts.json.length > 0) {
    console.log('\n✅ Contas encontradas:');
    rAccounts.json.forEach((a) => {
      console.log(`   • ${a.name} (${a.type}/${a.subtype}) — Saldo: R$ ${Number(a.balance).toFixed(2)}`);
    });
  } else {
    console.log('\n⚠️  Nenhuma conta ainda. O job pode ainda estar processando. Tente novamente em alguns segundos.');
  }
}

async function step5_transactions() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PASSO 5 — Transações sincronizadas');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const from = new Date();
  from.setDate(1);
  const fromStr = from.toISOString().split('T')[0];

  const r = await req('GET', `/transactions?page=1&limit=10&from=${fromStr}`);
  assert(r.ok, `GET /transactions retornou ${r.status}`);
  log('💳', `Transações do mês (${r.json.total ?? 0} total)`, r.json.data?.slice(0, 5));

  const rReport = await req('GET', `/transactions/report?from=${fromStr}`);
  assert(rReport.ok, `GET /transactions/report retornou ${rReport.status}`);
  log('📊', 'Relatório por categoria', rReport.json);
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  FinTrack – Teste Open Finance (Pluggy)  ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`API: ${BASE}`);
  console.log(`Usuário: ${EMAIL}`);
  console.log(`PLUGGY_ITEM_ID: ${ITEM_ID || '(não definido)'}`);

  await step1_auth();
  const tokenOk = await step2_connectToken();

  if (!tokenOk) {
    console.log('\n⛔ Configure as credenciais do Pluggy no .env e rode novamente.');
    process.exit(1);
  }

  const connectionId = await step3_registerConnection();

  if (!connectionId) {
    console.log('\n📋 Script parcialmente executado. Defina PLUGGY_ITEM_ID para testar o sync completo.');
    process.exit(0);
  }

  await step4_waitAndVerify(connectionId);
  await step5_transactions();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Todos os passos concluídos com sucesso!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nPróximos passos no Postman:');
  console.log('  • GET  /connections               → ver todas as conexões');
  console.log('  • GET  /connections/:id/accounts  → saldos das contas');
  console.log('  • GET  /transactions              → transações paginadas');
  console.log('  • GET  /transactions/report       → gastos por categoria');
  console.log('  • GET  /ai/insights               → insights com Gemini');
}

main().catch((err) => {
  console.error('\n💥 Erro inesperado:', err.message ?? err);
  process.exit(1);
});
