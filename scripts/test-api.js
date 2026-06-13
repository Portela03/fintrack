#!/usr/bin/env node
/**
 * FinTrack API - Teste End-to-End (Auth + Open Finance + AI + Metas + Financiamento)
 *
 * Uso:
 *   node test-api.js                      # testa tudo; pede itemId interativamente
 *   PLUGGY_ITEM_ID=xxx node test-api.js   # usa itemId direto, sem parar
 *   SKIP_BANKING=1   node test-api.js     # pula testes bancarios
 *   FINTRACK_EMAIL=x FINTRACK_PASSWORD=y node test-api.js
 *
 * Requisitos:
 *   docker-compose up -d   (Postgres + Redis)
 *   npm run start:dev      (API em :3000)
 *   Credenciais Pluggy no .env
 */

'use strict';

const readline = require('readline');
const { exec }  = require('child_process');
const path      = require('path');
const fs        = require('fs');

// Carrega .env da raiz do projeto (sem depender do pacote dotenv)
(function loadDotEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) process.env[key] = val;
  }
})();

const BASE     = process.env.FINTRACK_BASE_URL  || 'http://localhost:3000/api/v1';
const EMAIL    = process.env.FINTRACK_EMAIL     || ('test_' + Date.now() + '@fintrack.dev');
const PASSWORD = process.env.FINTRACK_PASSWORD  || 'Senha@1234';
const NAME     = 'Usuario Teste';
const SKIP_BANKING   = process.env.SKIP_BANKING    === '1';
const PRESET_ITEM_ID = process.env.PLUGGY_ITEM_ID  || '';

let accessToken    = '';
let sessionId      = '';
let connectionId   = '';
let connectionItemId = '';
let passed = 0;
let failed = 0;

async function req(method, p, body, auth) {
  if (auth === undefined) auth = true;
  const headers = { 'Content-Type': 'application/json' };
  if (auth && accessToken) headers['Authorization'] = 'Bearer ' + accessToken;
  const res = await fetch(BASE + p, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json;
  try { json = await res.json(); } catch (e) { json = {}; }
  return { status: res.status, ok: res.ok, json };
}

function ok(label, cond, detail) {
  detail = detail || '';
  if (cond) { console.log('  [OK]   ' + label); passed++; }
  else       { console.log('  [FAIL] ' + label + (detail ? ' -- ' + detail : '')); failed++; }
}

function warn(msg) { console.log('  [WARN] ' + msg); }
function info(msg) { console.log('  [INFO] ' + msg); }

function section(title) {
  console.log('\n' + '-'.repeat(55));
  console.log('  ' + title);
  console.log('-'.repeat(55));
}

function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(function(resolve) {
    rl.question(question, function(ans) { rl.close(); resolve((ans || '').trim()); });
  });
}

function openBrowser(url) {
  const cmd = process.platform === 'win32' ? 'start "" "' + url + '"' : 'open "' + url + '"';
  exec(cmd, function() {});
}

// ---------- testes ----------

async function testAuth() {
  section('1. Autenticacao');
  await req('POST', '/auth/register', { email: EMAIL, name: NAME, password: PASSWORD }, false);
  const login = await req('POST', '/auth/login', { email: EMAIL, password: PASSWORD }, false);
  ok('POST /auth/login -> 200', login.status === 200, 'status=' + login.status);
  ok('Retorna accessToken', !!login.json.accessToken);
  if (login.json.accessToken) {
    accessToken = login.json.accessToken;
    info('Token: ' + accessToken.slice(0,35) + '...');
  }
  const bad = await req('POST', '/auth/login', { email: EMAIL, password: 'errada' }, false);
  ok('Login senha errada -> 401', bad.status === 401, 'status=' + bad.status);
  const noAuth = await req('GET', '/ai/sessions', null, false);
  ok('Sem token -> 401', noAuth.status === 401, 'status=' + noAuth.status);
}

async function testConnectToken() {
  section('2. Banking -- Connect Token');
  const r = await req('GET', '/connections/connect-token');
  if (!r.ok) {
    warn('status=' + r.status + ' -- ' + JSON.stringify(r.json).slice(0,80));
    warn('Configure PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET no .env');
    ok('GET /connections/connect-token -> 200', false, 'status=' + r.status);
    return null;
  }
  ok('GET /connections/connect-token -> 200', true);
  ok('Retorna connectToken', !!r.json.connectToken);
  info('connectToken: ' + r.json.connectToken.slice(0,40) + '...');
  return r.json.connectToken;
}

async function getItemId(connectToken) {
  if (PRESET_ITEM_ID) {
    info('Usando PLUGGY_ITEM_ID: ' + PRESET_ITEM_ID);
    return PRESET_ITEM_ID;
  }

  // Usa Pluggy Sandbox connector (ID 201) -- sem widget, sem browser
  // Credenciais de teste oficiais da Pluggy
  const clientId     = process.env.PLUGGY_CLIENT_ID     || '';
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET || '';

  if (!clientId || !clientSecret) {
    warn('PLUGGY_CLIENT_ID / PLUGGY_CLIENT_SECRET nao definidos no .env -- pulando banking');
    return null;
  }

  console.log('\n  Criando item Pluggy Sandbox automaticamente...');

  try {
    // 1. Obter API key
    const authRes = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, clientSecret }),
    });
    const authData = await authRes.json();
    if (!authData.apiKey) {
      warn('Falha ao autenticar no Pluggy: ' + JSON.stringify(authData).slice(0,120));
      return null;
    }
    const apiKey = authData.apiKey;
    info('Pluggy API key obtida');

    // 2. Criar item no sandbox (connectorId 201 = Pluggy Sandbox)
    const itemRes = await fetch('https://api.pluggy.ai/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
      body: JSON.stringify({
        connectorId: 201,
        parameters: { user: 'user-ok', password: 'password-ok' },
      }),
    });
    const itemData = await itemRes.json();

    if (!itemData.id) {
      warn('Falha ao criar item sandbox: ' + JSON.stringify(itemData).slice(0,120));
      return null;
    }

    // 3. Aguardar item ficar UPDATED (pode levar alguns segundos)
    let itemId = itemData.id;
    info('Item sandbox criado: ' + itemId + ' | status: ' + itemData.status);

    let attempts = 0;
    while (itemData.status !== 'UPDATED' && attempts < 10) {
      await new Promise(function(r) { setTimeout(r, 2000); });
      const checkRes = await fetch('https://api.pluggy.ai/items/' + itemId, {
        headers: { 'X-API-KEY': apiKey },
      });
      const checkData = await checkRes.json();
      process.stdout.write('\r  Status Pluggy: ' + checkData.status + '...     ');
      if (checkData.status === 'UPDATED' || checkData.status === 'LOGIN_ERROR') {
        console.log('');
        if (checkData.status === 'LOGIN_ERROR') {
          warn('LOGIN_ERROR no sandbox -- tente novamente');
          return null;
        }
        break;
      }
      attempts++;
    }
    console.log('');
    info('itemId sandbox: ' + itemId);
    return itemId;

  } catch (err) {
    warn('Erro ao criar sandbox: ' + (err.message || err));
    return null;
  }
}

async function testCreateConnection(itemId) {
  section('3. Banking -- Registrar Conexao');
  const r = await req('POST', '/connections', { itemId });
  info('Resposta: ' + JSON.stringify(r.json));
  ok('POST /connections -> 201', r.status === 201, 'status=' + r.status);
  ok('Retorna connectionId', !!r.json.connectionId, JSON.stringify(r.json).slice(0,80));
  ok('Status: UPDATING', r.json.status === 'UPDATING', r.json.status);
  if (r.json.connectionId) {
    connectionId     = r.json.connectionId;
    connectionItemId = itemId;
    info('connectionId: ' + connectionId);
  }
  return !!r.json.connectionId;
}

async function testListConnections() {
  section('4. Banking -- Listar Conexoes');
  const r = await req('GET', '/connections');
  ok('GET /connections -> 200', r.ok, 'status=' + r.status);
  ok('Retorna array', Array.isArray(r.json));
  if (Array.isArray(r.json)) {
    info('Total: ' + r.json.length);
    r.json.forEach(function(c) {
      info('  ' + c.id.slice(0,8) + '... | status: ' + c.status + ' | lastSync: ' + (c.lastSyncAt || 'nunca'));
    });
  }
}

async function testWaitSync(timeoutSec) {
  timeoutSec = timeoutSec || 25;
  section('5. Banking -- Aguardando sync (ate ' + timeoutSec + 's)');
  let synced = false;
  const start = Date.now();
  while ((Date.now() - start) < timeoutSec * 1000) {
    await sleep(3000);
    const r = await req('GET', '/connections');
    const conn = Array.isArray(r.json) ? r.json.find(function(c) { return c.id === connectionId; }) : null;
    if (conn) {
      process.stdout.write('\r  Status: ' + conn.status + '...     ');
      if (conn.status === 'UPDATED')     { console.log(''); synced = true; break; }
      if (conn.status === 'LOGIN_ERROR') { console.log(''); warn('LOGIN_ERROR -- credenciais invalidas?'); break; }
    }
  }
  ok('Conexao sincronizada (UPDATED)', synced, synced ? '' : 'Verifique logs da API');
}

async function testAccounts() {
  section('6. Banking -- Contas Bancarias');
  if (!connectionId) { warn('sem connectionId'); return; }
  const r = await req('GET', '/connections/' + connectionId + '/accounts');
  ok('GET /connections/:id/accounts -> 200', r.ok, 'status=' + r.status);
  ok('Retorna array', Array.isArray(r.json));
  if (Array.isArray(r.json) && r.json.length > 0) {
    console.log('\n  ' + r.json.length + ' conta(s):');
    r.json.forEach(function(a) {
      console.log('    * ' + a.name + ' (' + a.type + ') -- R$ ' + Number(a.balance).toFixed(2));
    });
    ok('Contas com dados validos', r.json.every(function(a) { return a.name && a.balance !== undefined; }));
  } else {
    warn('Nenhuma conta -- job pode ainda estar processando');
    ok('Contas presentes', false, 'array vazio');
  }
}

async function testTransactions() {
  section('7. Financial -- Transacoes');
  const from = new Date(); from.setDate(1);
  const fromStr = from.toISOString().split('T')[0];
  const r = await req('GET', '/transactions?page=1&limit=10&from=' + fromStr);
  ok('GET /transactions -> 200', r.ok, 'status=' + r.status);
  if (r.json.total !== undefined) {
    info('Total no mes: ' + r.json.total);
    if (Array.isArray(r.json.data) && r.json.data.length > 0) {
      console.log('');
      r.json.data.slice(0, 5).forEach(function(t) {
        const val = Number(t.amount && t.amount.value != null ? t.amount.value : t.amount).toFixed(2);
        const s   = t.type === 'DEBIT' ? '-' : '+';
        console.log('    * ' + (t.description || '').slice(0,34).padEnd(34) + ' ' + s + 'R$' + val + ' (' + (t.date || '').slice(0,10) + ')');
      });
    }
    ok('total >= 0', r.json.total >= 0);
  }
  const report = await req('GET', '/transactions/report?from=' + fromStr);
  ok('GET /transactions/report -> 200', report.ok, 'status=' + report.status);
  if (report.json.categories) {
    info('Categorias: ' + report.json.categories.length + ' | Receitas: ' + report.json.totalIncome + ' | Despesas: ' + report.json.totalExpenses);
  }
}

async function testWebhook() {
  section('8. Banking -- Webhook re-sync');
  if (!connectionItemId) { warn('itemId nao disponivel'); return; }
  const r = await req('POST', '/connections/webhook', { event: 'item/updated', itemId: connectionItemId }, false);
  ok('POST /connections/webhook -> 200', r.ok, 'status=' + r.status);
  ok('received: true', r.json.received === true, JSON.stringify(r.json));
}

async function testGoals() {
  section('9. Metas Financeiras');
  const create = await req('POST', '/goals', { name: 'Reserva Emergencia Teste', type: 'EMERGENCY_FUND', targetAmount: 30000, deadline: '2027-12-31' });
  ok('POST /goals -> 201', create.status === 201, 'status=' + create.status);
  ok('Retorna id', !!create.json.id);
  const list = await req('GET', '/goals');
  ok('GET /goals -> 200', list.ok);
  ok('progressPercentage presente', list.json && list.json[0] && list.json[0].progressPercentage !== undefined);
  if (list.json && list.json[0]) {
    const g = list.json[0];
    info('"' + g.name + '" -- ' + g.progressPercentage + '% (' + g.currentAmount + '/' + g.targetAmount + ')');
  }
}

async function testFinancing() {
  section('10. Simulacao SAC vs PRICE');
  const compare = await req('POST', '/financing/compare', { loanAmount: 400000, monthlyRate: 0.8, months: 360 });
  ok('POST /financing/compare -> 200|201', compare.status === 200 || compare.status === 201, 'status=' + compare.status);
  const d = compare.json;
  const sacKey   = d.SAC ? 'SAC' : d.sac ? 'sac' : null;
  const priceKey = d.PRICE ? 'PRICE' : d.price ? 'price' : null;
  ok('Retorna SAC e PRICE', !!(sacKey && priceKey), JSON.stringify(d).slice(0,80));
  ok('Retorna recommendation', !!d.recommendation);
  if (sacKey && priceKey) {
    info('Recomendacao: ' + d.recommendation + ' | Economia: R$ ' + Math.abs((d[sacKey].totalPaid || 0) - (d[priceKey].totalPaid || 0)).toFixed(2));
  }
}

async function testAI() {
  section('11. AI Assistant (Gemini)');
  const create = await req('POST', '/ai/sessions', {});
  ok('POST /ai/sessions -> 201', create.status === 201, 'status=' + create.status);
  if (create.json.id) { sessionId = create.json.id; info('sessionId: ' + sessionId); }
  const list = await req('GET', '/ai/sessions');
  ok('GET /ai/sessions -> 200', list.ok);
  ok('Retorna array', Array.isArray(list.json));
  if (!sessionId) return;
  console.log('  Enviando mensagem ao Gemini...');
  const msg = await req('POST', '/ai/sessions/' + sessionId + '/messages', { message: 'De uma dica curta de controle financeiro.' });
  if (msg.status === 429) { warn('Rate limit Gemini (429).'); return; }
  ok('POST /ai/messages -> 201', msg.status === 201, 'status=' + msg.status);
  ok('messageId presente', !!(msg.json.messageId));
  ok('reply presente', !!(msg.json.reply));
  if (msg.json.reply) {
    console.log('\n  Gemini: "' + msg.json.reply.slice(0,120) + '"');
  }
  const hist = await req('GET', '/ai/sessions/' + sessionId + '/messages');
  ok('GET /ai/messages -> 200', hist.ok);
  ok('Historico >= 2 msgs', Array.isArray(hist.json) && hist.json.length >= 2, 'len=' + (hist.json ? hist.json.length : 0));
}

// ---------- main ----------

async function main() {
  console.log('\n+' + '='.repeat(53) + '+');
  console.log('|  FinTrack API - Teste End-to-End (Open Finance)     |');
  console.log('+' + '='.repeat(53) + '+');
  console.log('  API:   ' + BASE);
  console.log('  Email: ' + EMAIL);
  if (SKIP_BANKING)   console.log('  Modo:  SKIP_BANKING=1');
  if (PRESET_ITEM_ID) console.log('  ItemId pre-definido: ' + PRESET_ITEM_ID);

  try {
    await testAuth();
    if (!accessToken) {
      console.error('\n  ERRO: API nao respondeu em ' + BASE);
      console.error('  Execute: docker-compose up -d && npm run start:dev');
      process.exit(1);
    }

    if (!SKIP_BANKING) {
      const connectToken = await testConnectToken();
      if (connectToken !== null) {
        const itemId = await getItemId(connectToken);
        if (itemId) {
          const created = await testCreateConnection(itemId);
          await testListConnections();
          if (created) {
            await testWaitSync(25);
            await testAccounts();
            await testTransactions();
            await testWebhook();
          }
        } else {
          warn('Sem itemId -- pulando contas/transacoes');
          await testListConnections();
        }
      }
    } else {
      warn('Testes bancarios pulados (SKIP_BANKING=1)');
    }

    await testGoals();
    await testFinancing();
    await testAI();

  } catch (err) {
    console.error('\nERRO: ' + (err.message || err));
    failed++;
  }

  const total = passed + failed;
  console.log('\n' + '='.repeat(55));
  console.log('  Resultado: ' + passed + '/' + total + ' testes passaram');
  if (failed > 0) console.log('  FALHAS: ' + failed);
  else            console.log('  TODOS OS TESTES PASSARAM!');
  console.log('='.repeat(55) + '\n');
  process.exit(failed > 0 ? 1 : 0);
}

main();
