const TRACE_NONE_WRITES = globalThis.__MOMENTUM_TRACE_NONE_WRITES__ ?? true;

const TRACE_NONE_DEFINE = globalThis.__MOMENTUM_TRACE_NONE_DEFINE__ ?? true;

const NONE_PROPS = new Set(['NONE', 'CAPTURING_PHASE', 'AT_TARGET', 'BUBBLING_PHASE']);

// Capture who is defining/redefining NONE constants.
// This is more reliable than trapping writes because non-configurable properties
// cannot be redefined to install a setter.
if (TRACE_NONE_DEFINE) {
  const originalDefineProperty = Object.defineProperty.bind(Object);
  const originalDefineProperties = Object.defineProperties.bind(Object);
  const originalReflectDefineProperty = Reflect.defineProperty.bind(Reflect);

  let inTrace = false;
  const traceDefine = (target, prop, descriptor, apiName) => {
    if (inTrace) return;
    if (typeof prop !== 'string' || !NONE_PROPS.has(prop)) return;

    inTrace = true;
    try {
      const err = new Error(`[trace] ${apiName} ${safeDescribe(target)}.${prop}`);
      console.warn(err.message);
      if (err.stack) console.warn(err.stack);

      try {
        const existing = Object.getOwnPropertyDescriptor(target, prop);
        if (existing) console.warn('[trace] existing descriptor', existing);
      } catch {
        // ignore
      }

      try {
        if (descriptor) console.warn('[trace] next descriptor', descriptor);
      } catch {
        // ignore
      }
    } finally {
      inTrace = false;
    }
  };

  Object.defineProperty = (target, prop, descriptor) => {
    traceDefine(target, prop, descriptor, 'Object.defineProperty');
    return originalDefineProperty(target, prop, descriptor);
  };

  Object.defineProperties = (target, descriptors) => {
    try {
      if (descriptors && typeof descriptors === 'object') {
        for (const key of Object.keys(descriptors)) {
          traceDefine(target, key, descriptors[key], 'Object.defineProperties');
        }
      }
    } catch {
      // ignore
    }
    return originalDefineProperties(target, descriptors);
  };

  Reflect.defineProperty = (target, prop, descriptor) => {
    traceDefine(target, prop, descriptor, 'Reflect.defineProperty');
    return originalReflectDefineProperty(target, prop, descriptor);
  };
}

function safeDescribe(obj) {
  try {
    if (!obj) return String(obj);
    if (obj === globalThis) return 'globalThis';
    return obj?.name || obj?.constructor?.name || 'object';
  } catch {
    return 'object';
  }
}

function trapWrites(obj, prop) {
  if (!TRACE_NONE_WRITES) return;
  try {
    if (!obj) return;
    const desc = Object.getOwnPropertyDescriptor(obj, prop);
    if (!desc || !desc.configurable) return;

    const hadValue = Object.prototype.hasOwnProperty.call(desc, 'value');
    let currentValue = hadValue ? desc.value : undefined;

    Object.defineProperty(obj, prop, {
      configurable: true,
      enumerable: desc.enumerable ?? false,
      get() {
        return currentValue;
      },
      set(next) {
        // Capture callsite without crashing the app.
        try {
          const err = new Error(`[trace] write ${safeDescribe(obj)}.${prop} = ${String(next)}`);
          console.warn(err.message);
          if (err.stack) console.warn(err.stack);
        } catch {
          // ignore
        }
        currentValue = next;
      },
    });
  } catch {
    // Ignore. Best-effort tracing.
  }
}

function makeWritable(obj, prop) {
  try {
    if (!obj) return;
    const desc = Object.getOwnPropertyDescriptor(obj, prop);
    if (!desc) return;
    if (desc.writable) return;

    // Most polyfills define these as configurable but non-writable.
    if (desc.configurable) {
      Object.defineProperty(obj, prop, {
        ...desc,
        writable: true,
      });
    }
  } catch {
    // Ignore. This is a best-effort shim for dev.
  }
}

function patchConstants(obj) {
  // Trap first so we can learn who writes, then allow writes to avoid the crash.
  trapWrites(obj, 'NONE');
  trapWrites(obj, 'CAPTURING_PHASE');
  trapWrites(obj, 'AT_TARGET');
  trapWrites(obj, 'BUBBLING_PHASE');

  makeWritable(obj, 'NONE');
  makeWritable(obj, 'CAPTURING_PHASE');
  makeWritable(obj, 'AT_TARGET');
  makeWritable(obj, 'BUBBLING_PHASE');
}

// Best-effort: if a library later tries to do `X.NONE = 0` on a constant object,
// capture the stack once and avoid the hard crash.
patchConstants(globalThis.Event);
patchConstants(globalThis.EventPhase);
patchConstants(globalThis.EventTarget);
patchConstants(globalThis.AbortSignal);

// Some websocket/event polyfills hang constants off these.
patchConstants(globalThis.WebSocket);
patchConstants(globalThis.XMLHttpRequest);
