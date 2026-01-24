/*
  Fixes iOS crash: "Cannot assign to read-only property 'NONE'".

  React Native's DOM Event polyfill defines constants via Object.defineProperty
  on Event and Event.prototype (non-writable). Metro/Babel may also emit
  class-field initializers for Flow property declarations, producing code like
  `this.NONE = void 0;` which throws because `Event.prototype.NONE` is
  non-writable.

  We patch RN's source file to remove those Flow-only class property declarations
  so the runtime only uses the defineProperty constants.
*/

const fs = require('fs');
const path = require('path');

const targetPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native',
  'src',
  'private',
  'webapis',
  'dom',
  'events',
  'Event.js',
);

function fail(message) {
  console.error(`[patch-react-native-event] ${message}`);
  process.exit(1);
}

if (!fs.existsSync(targetPath)) {
  fail(`Target file not found: ${targetPath}`);
}

const original = fs.readFileSync(targetPath, 'utf8');

// If already patched, no-op.
if (!original.includes('static +NONE: 0;') && !original.includes('+NONE: 0;')) {
  console.log('[patch-react-native-event] Already patched (no Flow constant fields found).');
  process.exit(0);
}

const blockRegex =
  /\n\s*static \+NONE: 0;\s*\n\s*static \+CAPTURING_PHASE: 1;\s*\n\s*static \+AT_TARGET: 2;\s*\n\s*static \+BUBBLING_PHASE: 3;\s*\n\s*\n\s*\+NONE: 0;\s*\n\s*\+CAPTURING_PHASE: 1;\s*\n\s*\+AT_TARGET: 2;\s*\n\s*\+BUBBLING_PHASE: 3;\s*\n/;

const patched = original.replace(blockRegex, '\n');

if (patched === original) {
  fail('Patch did not apply (expected Flow constant field block not found).');
}

fs.writeFileSync(targetPath, patched, 'utf8');
console.log('[patch-react-native-event] Patched react-native Event.js successfully.');
