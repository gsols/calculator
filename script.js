// Single source of truth for calculator state
const state = {
  display: '0',      // string for easy editing (leading 0, decimals, etc.)
  a: null,           // number
  b: null,           // number
  op: null,          // '+', '-', '*', '/', '%'
};

const displayEl = document.querySelector('.display');
const buttons = document.querySelectorAll('button');

function render() {
  displayEl.textContent = state.display;
}

function clearAll() {
  state.display = '0';
  state.a = null;
  state.b = null;
  state.op = null;
  render();
}

function inputDigit(d) {

  if (state.display === '0') state.display = d;
  else if (state.display === '-0') state.display = '-' + d;
  else state.display += d;

  render();
}

function inputDecimal() {
  if (state.display.includes('.')) return;
  state.display += '.';
  render();
}

function toggleSign() {
  state.display = state.display.startsWith('-')
    ? state.display.slice(1)
    : '-' + state.display;
  render();
}

function backspace() {
  if (state.display.length <= 1 || (state.display.length === 2 && state.display.startsWith('-'))) {
    state.display = '0';
  } else {
    state.display = state.display.slice(0, -1);
  }
  render();
}

function chooseOperator(op) {
  // commit current display into `a` or `b` depending on state
  const current = Number(state.display);

  if (state.op === null) {
    state.a = current;
    state.op = op;
    state.display = '0';
    return;
  }

  state.b = current;
  const result = operate(state.op, state.a, state.b);

  state.a = result;
  state.b = null;
  state.op = op;

  render();
}

function evaluate() {
  if (state.op === null) return;

  const current = Number(state.display);
  // If user hits "=" immediately after selecting an operator, treat it as a no-op
  if (state.a === null) return;

  state.b = current;
  const result = operate(state.op, state.a, state.b);

  state.display = formatNumber(result);
  state.a = result;
  state.b = null;
  state.op = null;
  state.justEvaluated = true;

  render();
}

function formatNumber(n) {
  if (!Number.isFinite(n)) return 'Error';
  // avoid ugly floating outputs; tweak as desired
  const s = String(n);
  if (s.includes('e')) return s;
  const rounded = Math.round((n + Number.EPSILON) * 1e12) / 1e12;
  return String(rounded);
}

function operate(op, a, b) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? NaN : a / b;
    case '%': return (a / b) * 100; // keep your current meaning; many calculators do a%b instead
    default: throw new Error('Unknown operator: ' + op);
  }
}

function handleButton(value) {
  if (value >= '0' && value <= '9') return inputDigit(value);
  if (value === '.') return inputDecimal();
  if (value === '+/-') return toggleSign();

  if (value === 'C') return clearAll();
  if (value === 'del') return backspace();
  if (value === '=') return evaluate();

  if (['+', '-', '*', '/', '%'].includes(value)) return chooseOperator(value);
}

buttons.forEach((btn) => {
  btn.addEventListener('click', () => handleButton(btn.dataset.value));
});

// init
render();