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

const BASE     = process.env.FINTRACK_BASE_URL  || 'http://localhost:3000/api/v1';
const EMAIL    = process.env.FINTRACK_EMAIL     || ('test_' + Date.now() + '@fintrack.dev');
const PASSWORD = process.env.FINTRACK_PASSWORD  || 'Senha@1234';
const NAME     = 'Usuario Teste';
const SKIP_BANKING   = process.env.SKIP_BANKING    === '1';
const PRESET_ITEM_ID = process.env.PLUGGY_ITEM_ID  || '';

let accessToken    = '';
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

  const widgetPath = path.join(__dirname, 'pluggy-widget.html');
  const widgetExists = fs.existsSync(widgetPath);

  console.log('\n' + '='.repeat(55));
  console.log('  CONECTAR BANCO REAL (Nubank / Banco Inter)');
  console.log('='.repeat(55));
  console.log('');
  console.log('  Passos:');
  console.log('    1. O widget Pluggy abrira no browser');
  console.log('    2. Cole o connectToken abaixo no campo da pagina HTML');
  console.log('    3. Selecione Nubank ou Banco Inter');
  console.log('    4. Faca login com suas credenciais bancarias');
  console.log('    5. Autorize o acesso (Open Finance Brasil)');
  console.log('    6. Copie o itemId exibido na pagina e cole abaixo');
  console.log('');
  if (connectToken) {
    console.log('  Connect Token:');
    console.log('  ' + connectToken);
    console.log('');
  }
  if (widgetExists) {
    const fileUrl = 'file:///' + widgetPath.replace(/\\/g, '/');
    openBrowser(fileUrl);
    info('Abrindo: ' + fileUrl);
  } else {
    warn('pluggy-widget.html nao encontrado no projeto.');
  }

  const itemId = await prompt('\n  Cole o itemId aqui e pressione Enter (Enter p/ pular): ');
  return itemId || null;
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
