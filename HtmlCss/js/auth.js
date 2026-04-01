// ── API ───────────────────────────────────────────────────────────
const API_BASE_URL = 'http://localhost:5000';

// ── Tab switch ────────────────────────────────────────────────────
function switchTab(tab) {
    ['login','signup'].forEach(t => {
        document.getElementById(t+'Form').classList.toggle('active', t===tab);
        document.getElementById('tab'+t.charAt(0).toUpperCase()+t.slice(1)).classList.toggle('active', t===tab);
    });
    clearMsgs();
}

// ── Password toggle ───────────────────────────────────────────────
function togglePwd(id, btn) {
    const inp = document.getElementById(id);
    const ico = btn.querySelector('i');
    inp.type = inp.type === 'password' ? 'text' : 'password';
    ico.classList.toggle('fa-eye-slash', inp.type==='password');
    ico.classList.toggle('fa-eye',       inp.type==='text');
}

// ── Password strength checker ─────────────────────────────────────
function checkPwd(val) {
    const rules = {
        'r-len':     val.length >= 8,
        'r-upper':   /[A-Z]/.test(val),
        'r-lower':   /[a-z]/.test(val),
        'r-num':     /[0-9]/.test(val),
        'r-special': /[\W_]/.test(val)
    };
    let score = Object.values(rules).filter(Boolean).length;
    const allOk = score === 5;

    // Show/hide strength bar and rules based on input
    const strRow = document.getElementById('pwdStrengthRow');
    const rulesEl = document.getElementById('pwdRules');

    if (val.length === 0) {
        // Nothing typed — hide everything
        if (strRow) strRow.style.display = 'none';
        if (rulesEl) rulesEl.classList.remove('visible');
    } else if (allOk) {
        // All rules pass — show strength bar only, hide rules
        if (strRow) strRow.style.display = 'flex';
        if (rulesEl) rulesEl.classList.remove('visible');
    } else {
        // Some rules fail — show both
        if (strRow) strRow.style.display = 'flex';
        if (rulesEl) rulesEl.classList.add('visible');
    }

    Object.entries(rules).forEach(([id, ok]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.toggle('ok',   ok);
        el.classList.toggle('fail', val.length > 0 && !ok);
        el.classList.toggle('rule', true);
    });

    const fill  = document.getElementById('strengthFill');
    const label = document.getElementById('strengthLabel');
    if (!fill) return;
    const colors = ['','#ef4444','#f97316','#eab308','#10b981','#10b981'];
    const labels = ['','Very weak','Weak','Fair','Strong','Very strong'];
    fill.style.width  = (score * 20) + '%';
    fill.style.background = colors[score];
    label.textContent = val.length === 0 ? 'Enter a password' : labels[score];
    label.style.color = colors[score] || 'var(--dim)';
}

// ── Login ─────────────────────────────────────────────────────────
async function handleLogin(event) {
    event.preventDefault();
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn      = document.getElementById('loginBtn');
    const msg      = document.getElementById('loginMsg');
    if (!email || !password) { showMsg(msg,'Please fill in all fields.','error'); return; }
    setLoad(btn, true, 'Signing in...');
    clearMsg(msg);
    try {
        const res  = await fetch(`${API_BASE_URL}/auth/signin`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({email, password})
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token',    data.token);
            localStorage.setItem('email',    data.email);
            localStorage.setItem('fullName', data.fullName);
            localStorage.setItem('role',     data.role || 'User');
            showMsg(msg, `Welcome back, ${data.fullName}! Redirecting...`, 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 1400);
        } else {
            showMsg(msg, data.message || 'Invalid email or password.', 'error');
        }
    } catch { showMsg(msg, 'Cannot connect to API. Make sure ASP.NET Core is running on port 5000.', 'error'); }
    finally  { setLoad(btn, false, 'Sign In'); }
}

// ── Signup ────────────────────────────────────────────────────────
async function handleSignup(event) {
    event.preventDefault();
    const fullName = document.getElementById('signupName').value.trim();
    const email    = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const mobile   = document.getElementById('signupMobile').value.trim();
    const btn      = document.getElementById('signupBtn');
    const msg      = document.getElementById('signupMsg');
    if (!fullName || !email || !password) { showMsg(msg,'All fields are required.','error'); return; }
    const pwdOk = password.length>=8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[\W_]/.test(password);
    if (!pwdOk) { showMsg(msg,'Password must have 8+ chars, uppercase, lowercase, number and special character.','error'); return; }
    setLoad(btn, true, 'Creating account...');
    clearMsg(msg);
    try {
        const res  = await fetch(`${API_BASE_URL}/auth/signup`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ fullName, email, password, confirmPassword: password, mobileNumber: mobile })
        });
        const data = await res.json();
        if (res.ok || res.status === 201) {
            showMsg(msg, 'Account created! Please sign in.', 'success');
            setTimeout(() => { switchTab('login'); document.getElementById('loginEmail').value = email; }, 1500);
        } else {
            const err = data.message || data.title || Object.values(data.errors||{}).flat().join(', ') || 'Registration failed.';
            showMsg(msg, err, 'error');
        }
    } catch { showMsg(msg, 'Cannot connect to API. Make sure ASP.NET Core is running on port 5000.', 'error'); }
    finally  { setLoad(btn, false, 'Create Account'); }
}

// ── Helpers ───────────────────────────────────────────────────────
function showMsg(el, txt, type) { el.textContent=txt; el.className=`msg ${type}`; }
function clearMsg(el)           { el.textContent=''; el.className='msg'; }
function clearMsgs()            { document.querySelectorAll('.msg').forEach(m=>{ m.textContent=''; m.className='msg'; }); }
function setLoad(btn, on, txt)  {
    btn.classList.toggle('loading', on);
    btn.querySelector('.btn-txt').textContent = txt;
}
window.addEventListener('load', () => { if (localStorage.getItem('token')) window.location.href='dashboard.html'; });
