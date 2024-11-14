self.addEventListener('message', function(e) {
  var data = e.data;
  if (!data) return;
  var result = {};
  try {
      Module.FS_createDataFile("/", data.basename + "_init.xml", data.xmlstring, true, true)
      shouldRunNow = true;
      Module.run();
      result.csv = intArrayToString(FS.findObject(data.basename + "_res.csv").contents);
      result.status = "Simulation finished";
      FS.unlink("/" + data.basename + "_init.xml");    // delete the input file
  } catch(err) {
      result.status = "Simulation failed";
  };
  self.postMessage(result);
}, false);
// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };
  Module['load'] = function load(f) {
    globalEval(read(f));
  };
  Module['arguments'] = process['argv'].slice(2);
  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }
  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };
  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  this['Module'] = Module;
  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  if (typeof console !== 'undefined') {
    Module['print'] = function print(x) {
      console.log(x);
    };
    Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];
// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + Pointer_stringify(code) + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;
      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }
      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;
// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;
function demangle(func) {
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    var i = 3;
    // params, etc.
    var basicTypes = {
      'v': 'void',
      'b': 'bool',
      'c': 'char',
      's': 'short',
      'i': 'int',
      'l': 'long',
      'f': 'float',
      'd': 'double',
      'w': 'wchar_t',
      'a': 'signed char',
      'h': 'unsigned char',
      't': 'unsigned short',
      'j': 'unsigned int',
      'm': 'unsigned long',
      'x': 'long long',
      'y': 'unsigned long long',
      'z': '...'
    };
    function dump(x) {
      //return;
      if (x) Module.print(x);
      Module.print(func);
      var pre = '';
      for (var a = 0; a < i; a++) pre += ' ';
      Module.print (pre + '^');
    }
    var subs = [];
    function parseNested() {
      i++;
      if (func[i] === 'K') i++; // ignore const
      var parts = [];
      while (func[i] !== 'E') {
        if (func[i] === 'S') { // substitution
          i++;
          var next = func.indexOf('_', i);
          var num = func.substring(i, next) || 0;
          parts.push(subs[num] || '?');
          i = next+1;
          continue;
        }
        if (func[i] === 'C') { // constructor
          parts.push(parts[parts.length-1]);
          i += 2;
          continue;
        }
        var size = parseInt(func.substr(i));
        var pre = size.toString().length;
        if (!size || !pre) { i--; break; } // counter i++ below us
        var curr = func.substr(i + pre, size);
        parts.push(curr);
        subs.push(curr);
        i += pre + size;
      }
      i++; // skip E
      return parts;
    }
    var first = true;
    function parse(rawList, limit, allowVoid) { // main parser
      limit = limit || Infinity;
      var ret = '', list = [];
      function flushList() {
        return '(' + list.join(', ') + ')';
      }
      var name;
      if (func[i] === 'N') {
        // namespaced N-E
        name = parseNested().join('::');
        limit--;
        if (limit === 0) return rawList ? [name] : name;
      } else {
        // not namespaced
        if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
        var size = parseInt(func.substr(i));
        if (size) {
          var pre = size.toString().length;
          name = func.substr(i + pre, size);
          i += pre + size;
        }
      }
      first = false;
      if (func[i] === 'I') {
        i++;
        var iList = parse(true);
        var iRet = parse(true, 1, true);
        ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
      } else {
        ret = name;
      }
      paramLoop: while (i < func.length && limit-- > 0) {
        //dump('paramLoop');
        var c = func[i++];
        if (c in basicTypes) {
          list.push(basicTypes[c]);
        } else {
          switch (c) {
            case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
            case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
            case 'L': { // literal
              i++; // skip basic type
              var end = func.indexOf('E', i);
              var size = end - i;
              list.push(func.substr(i, size));
              i += size + 2; // size + 'EE'
              break;
            }
            case 'A': { // array
              var size = parseInt(func.substr(i));
              i += size.toString().length;
              if (func[i] !== '_') throw '?';
              i++; // skip _
              list.push(parse(true, 1, true)[0] + ' [' + size + ']');
              break;
            }
            case 'E': break paramLoop;
            default: ret += '?' + c; break paramLoop;
          }
        }
      }
      if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
      return rawList ? list : ret + flushList();
    }
    return parse();
  } catch(e) {
    return func;
  }
}
function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}
function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 268435456;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited
var runtimeInitialized = false;
function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;
function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;
function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];
var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
var memoryInitializer = null;
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 98064;
var _stdout;
var _stdout=_stdout=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stdin;
var _stdin=_stdin=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stderr;
var _stderr=_stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } },{ func: function() { __GLOBAL__I_a() } });
var ___fsmu8;
var ___dso_handle;
var ___dso_handle=___dso_handle=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTVN10__cxxabiv120__si_class_type_infoE;
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,136,8,1,0,40,1,0,0,164,0,0,0,76,0,0,0,186,0,0,0,10,0,0,0,10,0,0,0,8,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTVN10__cxxabiv117__class_type_infoE;
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,152,8,1,0,40,1,0,0,34,1,0,0,76,0,0,0,186,0,0,0,10,0,0,0,32,0,0,0,10,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,0,0,0,0,0,0,0,0,0,0,0,40,54,120,44,2,73,110,32,97,98,111,118,101,44,32,32,82,49,32,61,2,44,101,50,49,46,49,51,44,51,120,44,2,82,50,32,61,2,44,101,50,49,46,49,51,41,0,0,40,54,120,44,2,73,110,32,97,98,111,118,101,32,109,101,115,115,97,103,101,44,32,32,82,49,32,61,2,44,101,50,49,46,49,51,41,0,0,0,40,54,120,44,2,73,110,32,97,98,111,118,101,32,109,101,115,115,97,103,101,44,32,32,73,49,32,61,2,44,105,49,48,44,51,120,44,2,73,50,32,61,2,44,105,49,48,41,0,0,0,0,0,0,0,0,40,54,120,44,2,73,110,32,97,98,111,118,101,32,109,101,115,115,97,103,101,44,32,32,73,49,32,61,2,44,105,49,48,41,0,0,0,0,0,0,40,49,120,44,56,48,97,49,41,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,0,0,0,0,0,0,0,0,97,108,110,117,109,0,97,108,112,104,97,0,98,108,97,110,107,0,99,110,116,114,108,0,100,105,103,105,116,0,103,114,97,112,104,0,108,111,119,101,114,0,112,114,105,110,116,0,112,117,110,99,116,0,115,112,97,99,101,0,117,112,112,101,114,0,120,100,105,103,105,116,0,0,0,0,0,0,0,0,34,0,0,0,78,0,0,0,32,0,0,0,18,0,0,0,80,0,0,0,58,0,0,0,32,0,0,0,20,0,0,0,86,0,0,0,24,0,0,0,14,0,0,0,60,0,0,0,76,0,0,0,16,0,0,0,62,0,0,0,16,0,0,0,24,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,23,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,0,0,0,0,0,0,0,0,0,1,1,104,0,0,0,102,0,0,0,50,0,0,0,8,0,0,0,10,0,0,0,50,0,0,0,2,0,0,0,48,0,0,0,44,0,0,0,34,0,0,0,78,0,0,0,32,0,0,0,18,0,0,0,80,0,0,0,58,0,0,0,32,0,0,0,20,0,0,0,86,0,0,0,24,0,0,0,14,0,0,0,60,0,0,0,76,0,0,0,16,0,0,0,62,0,0,0,16,0,0,0,24,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,22,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,0,0,0,0,0,0,0,0,0,1,1,104,0,0,0,102,0,0,0,50,0,0,0,8,0,0,0,10,0,0,0,50,0,0,0,2,0,0,0,48,0,0,0,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,116,0,0,0,120,130,0,0,110,0,0,0,24,196,0,0,114,0,0,0,168,180,0,0,102,0,0,0,16,158,0,0,97,0,0,0,96,136,0,0,101,0,0,0,0,122,0,0,119,0,0,0,48,109,0,0,87,0,0,0,160,98,0,0,115,0,0,0,232,92,0,0,83,0,0,0,160,85,0,0,100,0,0,0,136,229,0,0,68,0,0,0,72,219,0,0,0,0,0,0,0,0,0,0,144,101,1,0,0,0,0,0,187,189,215,217,223,124,219,61,0,0,0,0,0,220,0,0,144,160,0,0,208,110,1,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,152,102,1,0,0,0,0,0,18,16,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,16,16,34,35,16,36,37,38,39,40,41,42,43,16,44,45,46,17,47,48,17,17,49,17,17,17,50,51,52,53,54,55,56,57,17,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,58,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,59,16,60,61,62,63,64,65,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,66,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,67,16,16,68,16,69,70,71,16,72,16,73,16,16,16,16,74,75,76,77,16,16,78,16,79,80,16,16,16,16,81,16,16,16,16,16,16,16,16,16,16,16,16,16,82,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,83,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,84,85,86,87,16,16,88,89,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,90,16,91,92,93,94,95,96,97,98,16,16,16,16,16,16,16,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,254,255,0,252,1,0,0,248,1,0,0,120,0,0,0,0,255,251,223,251,0,0,128,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,0,252,255,224,175,255,255,255,255,255,255,255,255,255,255,223,255,255,255,255,255,32,64,176,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,252,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,252,0,0,0,0,0,134,254,255,255,255,0,64,73,0,0,0,0,0,24,0,223,255,0,200,0,0,0,0,0,0,0,1,0,60,0,0,0,0,0,0,0,0,0,0,0,0,16,224,1,30,0,96,255,191,0,0,0,0,0,0,255,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,207,3,0,0,0,3,0,32,255,127,0,0,0,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,252,0,0,0,0,0,0,0,0,0,16,0,32,30,0,48,0,1,0,0,0,0,0,0,0,0,16,0,32,0,0,0,0,252,15,0,0,0,0,0,0,0,16,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,32,0,0,0,0,3,0,0,0,0,0,0,0,0,16,0,32,0,0,0,0,253,0,0,0,0,0,0,0,0,0,0,32,0,0,0,0,255,7,0,0,0,0,0,0,0,0,0,32,0,0,0,0,0,255,0,0,0,0,0,0,0,16,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,0,63,2,0,0,0,0,0,0,0,0,0,4,0,0,0,0,16,0,0,0,0,0,0,128,0,128,192,223,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,0,0,0,254,255,255,255,0,252,255,255,0,0,0,0,0,0,0,0,252,0,0,0,0,0,0,192,255,223,255,7,0,0,0,0,0,0,0,0,0,0,128,6,0,252,0,0,24,62,0,0,128,191,0,204,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,96,255,255,255,31,0,0,255,3,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,0,0,1,0,0,24,0,0,0,0,0,0,0,0,0,56,0,0,0,0,16,0,0,0,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,0,0,254,127,47,0,0,255,3,255,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,196,255,255,255,255,0,0,0,192,0,0,0,0,0,0,0,0,1,0,224,159,0,0,0,0,127,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,16,0,0,252,255,255,255,31,0,0,0,0,0,12,0,0,0,0,0,0,64,0,12,240,0,0,0,0,0,0,192,248,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,255,0,255,255,255,33,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,127,0,0,240,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,3,224,0,224,0,224,0,96,128,248,255,255,255,252,255,255,255,255,255,127,31,252,241,127,255,127,0,0,255,255,255,3,0,0,255,255,255,255,1,0,123,3,208,193,175,66,0,12,31,188,255,255,0,0,0,0,0,2,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,15,0,255,255,255,255,127,0,0,0,255,7,0,0,255,255,255,255,255,255,255,255,255,255,63,0,0,0,0,0,0,252,255,255,254,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,31,255,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,135,3,254,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,127,255,15,0,0,0,0,0,0,0,0,255,255,255,251,255,255,255,255,255,255,255,255,255,255,15,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,63,0,0,0,255,15,30,255,255,255,1,252,193,224,0,0,0,0,0,0,0,0,0,0,0,30,1,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,0,0,0,0,255,255,255,255,15,0,0,0,255,255,255,127,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,127,0,0,0,0,0,0,192,0,224,0,0,0,0,0,0,0,0,0,0,0,128,15,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,0,255,255,127,0,3,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,8,0,0,0,15,255,3,0,0,0,0,0,0,240,0,0,0,0,0,0,0,0,0,16,192,0,0,255,255,3,7,0,0,0,0,0,248,0,0,0,0,8,128,0,0,0,0,0,0,0,0,0,0,8,0,255,63,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,0,0,128,11,0,0,0,0,0,0,0,128,2,0,0,192,0,0,67,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,252,255,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,255,255,255,3,127,0,255,255,255,255,247,255,127,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,254,255,0,252,1,0,0,248,1,0,0,248,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,127,127,0,48,135,255,255,255,255,255,143,255,0,0,0,0,0,0,224,255,255,7,255,15,0,0,0,0,0,0,255,255,255,255,255,63,0,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,143,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,135,255,0,255,1,0,0,0,224,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,0,0,0,255,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,63,252,255,63,0,0,0,3,0,0,0,0,0,0,254,3,0,0,0,0,0,0,0,0,0,0,0,0,0,24,0,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,225,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,7,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,63,0,255,255,255,255,127,254,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,63,0,0,0,0,255,255,255,255,255,255,255,255,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,127,0,255,255,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,8,0,0,0,8,0,0,32,0,0,0,32,0,0,128,0,0,0,128,0,0,0,2,0,0,0,2,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,255,255,255,255,255,15,255,255,255,255,255,255,255,255,255,255,255,255,15,0,255,127,254,127,254,255,254,255,0,0,0,0,255,7,255,255,255,127,255,255,255,255,255,255,255,15,255,255,255,255,255,7,0,0,0,0,0,0,0,0,192,255,255,255,7,0,255,255,255,255,255,7,255,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,191,255,255,255,255,255,255,255,255,31,255,255,15,0,255,255,255,255,223,7,0,0,255,255,1,0,255,255,255,255,255,255,255,127,253,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,30,255,255,255,255,255,255,255,63,15,0,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,255,255,255,255,255,255,255,255,225,255,0,0,0,0,0,0,255,255,255,255,255,255,255,255,63,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,17,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,17,34,35,36,17,37,38,39,40,41,42,43,44,17,45,46,47,16,16,48,16,16,16,16,16,16,16,49,50,51,16,52,53,16,16,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,54,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,55,17,17,17,17,56,17,57,58,59,60,61,62,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,63,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,17,64,65,17,66,67,68,69,70,71,72,73,16,16,16,74,75,76,77,78,16,16,16,79,80,16,16,16,16,81,16,16,16,16,16,16,16,16,16,17,17,17,82,83,16,16,16,16,16,16,16,16,16,16,16,17,17,17,17,84,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,17,17,85,16,16,16,16,86,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,87,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,88,89,90,91,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,92,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,254,255,255,7,254,255,255,7,0,0,0,0,0,4,32,4,255,255,127,255,255,255,127,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,195,255,3,0,31,80,0,0,0,0,0,0,0,0,0,0,32,0,0,0,0,0,223,60,64,215,255,255,251,255,255,255,255,255,255,255,255,255,191,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,3,252,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,254,255,255,255,127,2,254,255,255,255,255,0,0,0,0,0,255,191,182,0,255,255,255,7,7,0,0,0,255,7,255,255,255,255,255,255,255,254,255,195,255,255,255,255,255,255,255,255,255,255,255,255,239,31,254,225,255,159,0,0,255,255,255,255,255,255,0,224,255,255,255,255,255,255,255,255,255,255,255,255,3,0,255,255,255,255,255,7,48,4,255,255,255,252,255,31,0,0,255,255,255,1,0,0,0,0,0,0,0,0,253,31,0,0,0,0,0,0,240,3,255,127,255,255,255,255,255,255,255,239,255,223,225,255,207,255,254,254,238,159,249,255,255,253,197,227,159,89,128,176,207,255,3,0,238,135,249,255,255,253,109,195,135,25,2,94,192,255,63,0,238,191,251,255,255,253,237,227,191,27,1,0,207,255,0,0,238,159,249,255,255,253,237,227,159,25,192,176,207,255,2,0,236,199,61,214,24,199,255,195,199,29,129,0,192,255,0,0,238,223,253,255,255,253,239,227,223,29,96,3,207,255,0,0,236,223,253,255,255,253,239,227,223,29,96,64,207,255,6,0,236,223,253,255,255,255,255,231,223,93,128,0,207,255,0,252,236,255,127,252,255,255,251,47,127,128,95,255,0,0,12,0,254,255,255,255,255,127,255,7,63,32,255,3,0,0,0,0,150,37,240,254,174,236,255,59,95,32,255,243,0,0,0,0,1,0,0,0,255,3,0,0,255,254,255,255,255,31,254,255,3,255,255,254,255,255,255,31,0,0,0,0,0,0,0,0,255,255,255,255,255,255,127,249,255,3,255,255,231,193,255,255,127,64,255,51,255,255,255,255,191,32,255,255,255,255,255,247,255,255,255,255,255,255,255,255,255,61,127,61,255,255,255,255,255,61,255,255,255,255,61,127,61,255,127,255,255,255,255,255,255,255,61,255,255,255,255,255,255,255,255,135,0,0,0,0,255,255,0,0,255,255,255,255,255,255,255,255,255,255,31,0,254,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,159,255,255,254,255,255,7,255,255,255,255,255,255,255,255,255,199,1,0,255,223,15,0,255,255,15,0,255,255,15,0,255,223,13,0,255,255,255,255,255,255,207,255,255,1,128,16,255,3,0,0,0,0,255,3,255,255,255,255,255,255,255,255,255,255,255,0,255,255,255,255,255,7,255,255,255,255,255,255,255,255,63,0,255,255,255,31,255,15,255,1,192,255,255,255,255,63,31,0,255,255,255,255,255,15,255,255,255,3,255,3,0,0,0,0,255,255,255,15,255,255,255,255,255,255,255,127,254,255,31,0,255,3,255,3,128,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,239,255,239,15,255,3,0,0,0,0,255,255,255,255,255,243,255,255,255,255,255,255,191,255,3,0,255,255,255,255,255,255,63,0,255,227,255,255,255,255,255,63,0,0,0,0,0,0,0,0,0,0,0,0,0,222,111,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,255,255,63,63,255,255,255,255,63,63,255,170,255,255,255,63,255,255,255,255,255,255,223,95,220,31,207,15,255,31,220,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,128,0,0,255,31,0,0,0,0,0,0,0,0,0,0,0,0,132,252,47,62,80,189,255,243,224,67,0,0,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,255,255,255,255,255,255,3,0,0,255,255,255,255,255,127,255,255,255,255,255,127,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,31,120,12,0,255,255,255,255,191,32,255,255,255,255,255,255,255,128,0,0,255,255,127,0,127,127,127,127,127,127,127,127,255,255,255,255,0,0,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,0,0,0,254,3,62,31,254,255,255,255,255,255,255,255,255,255,127,224,254,255,255,255,255,255,255,255,255,255,255,247,224,255,255,255,255,63,254,255,255,255,255,255,255,255,255,255,255,127,0,0,255,255,255,7,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,63,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,31,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,31,0,0,0,0,0,0,0,0,255,255,255,255,255,63,255,31,255,255,255,15,0,0,255,255,255,255,255,127,240,143,255,255,255,128,255,255,255,255,255,255,255,255,255,255,0,0,0,0,128,255,252,255,255,255,255,255,255,255,255,255,255,255,255,121,15,0,255,7,0,0,0,0,0,0,0,0,0,255,187,247,255,255,255,0,0,0,255,255,255,255,255,255,15,0,255,255,255,255,255,255,255,255,15,0,255,3,0,0,252,8,255,255,255,255,255,7,255,255,255,255,7,0,255,255,255,31,255,255,255,255,255,255,247,255,0,128,255,3,0,0,0,0,255,255,255,255,255,255,127,0,255,63,255,3,255,255,127,4,255,255,255,255,255,255,255,127,5,0,0,56,255,255,60,0,126,126,126,0,127,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,7,255,3,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,15,0,255,255,127,248,255,255,255,255,255,15,255,255,255,255,255,255,255,255,255,255,255,255,255,63,255,255,255,255,255,255,255,255,255,255,255,255,255,3,0,0,0,0,127,0,248,224,255,253,127,95,219,255,255,255,255,255,255,255,255,255,255,255,255,255,3,0,0,0,248,255,255,255,255,255,255,255,255,255,255,255,255,63,0,0,255,255,255,255,255,255,255,255,252,255,255,255,255,255,255,0,0,0,0,0,255,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,223,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,31,0,0,255,3,254,255,255,7,254,255,255,7,192,255,255,255,255,255,255,255,255,255,255,127,252,252,252,28,0,0,0,0,255,239,255,255,127,255,255,183,255,63,255,63,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,7,0,0,0,0,0,0,0,0,255,255,255,255,255,255,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,31,255,255,255,255,255,255,1,0,0,0,0,0,255,255,255,127,0,0,255,255,255,7,0,0,0,0,0,0,255,255,255,63,255,255,255,255,15,255,62,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,63,255,3,0,0,0,0,0,0,0,0,0,0,63,253,255,255,255,255,191,145,255,255,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,63,0,255,255,255,3,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,192,0,0,0,0,0,0,0,0,111,240,239,254,255,255,15,0,0,0,0,0,255,255,255,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,63,0,255,255,63,0,255,255,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,63,0,0,0,192,255,0,0,252,255,255,255,255,255,255,1,0,0,255,255,255,1,255,3,255,255,255,255,255,255,199,255,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,30,0,255,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,63,0,255,3,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,31,0,255,255,255,255,255,127,0,0,248,255,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,223,255,255,255,255,255,255,255,255,223,100,222,255,235,239,255,255,255,255,255,255,255,191,231,223,223,255,255,255,123,95,252,253,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,63,255,255,255,253,255,255,247,255,255,255,247,255,255,223,255,255,255,223,255,255,127,255,255,255,127,255,255,255,253,255,255,255,253,255,255,247,207,255,255,255,255,255,255,239,255,255,255,150,254,247,10,132,234,150,170,150,247,247,94,255,251,255,15,238,251,255,15,0,0,0,0,0,0,0,0,67,97,108,117,99,117,108,97,116,101,32,111,110,101,32,99,111,108,58,0,0,0,0,0,60,47,115,116,97,116,117,115,62,0,0,0,0,0,0,0,34,62,0,0,0,0,0,0,60,115,116,97,116,117,115,62,0,0,0,0,0,0,0,0,60,112,104,97,115,101,62,85,78,75,78,79,87,78,60,47,112,104,97,115,101,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,26,0,0,0,26,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,240,63,160,103,1,0,0,0,0,0,40,104,1,0,0,0,0,0,176,104,1,0,0,0,0,0,56,105,1,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,73,0,49,1,83,0,127,1,48,1,105,0,120,1,255,0,129,1,83,2,130,1,131,1,132,1,133,1,134,1,84,2,135,1,136,1,137,1,86,2,138,1,87,2,139,1,140,1,142,1,221,1,143,1,89,2,144,1,91,2,145,1,146,1,147,1,96,2,148,1,99,2,150,1,105,2,151,1,104,2,152,1,153,1,156,1,111,2,157,1,114,2,159,1,117,2,166,1,128,2,167,1,168,1,169,1,131,2,172,1,173,1,174,1,136,2,175,1,176,1,177,1,138,2,178,1,139,2,183,1,146,2,184,1,185,1,188,1,189,1,196,1,198,1,196,1,197,1,197,1,198,1,199,1,201,1,199,1,200,1,200,1,201,1,202,1,204,1,202,1,203,1,203,1,204,1,241,1,243,1,241,1,242,1,242,1,243,1,244,1,245,1,246,1,149,1,247,1,191,1,32,2,158,1,134,3,172,3,136,3,173,3,137,3,174,3,138,3,175,3,140,3,204,3,142,3,205,3,143,3,206,3,153,3,69,3,153,3,190,31,163,3,194,3,247,3,248,3,250,3,251,3,96,30,155,30,223,0,223,0,158,30,223,0,89,31,81,31,91,31,83,31,93,31,85,31,95,31,87,31,188,31,179,31,204,31,195,31,236,31,229,31,252,31,243,31,58,2,101,44,59,2,60,2,61,2,154,1,62,2,102,44,65,2,66,2,67,2,128,1,68,2,137,2,69,2,140,2,244,3,184,3,249,3,242,3,253,3,123,3,254,3,124,3,255,3,125,3,192,4,207,4,38,33,201,3,42,33,107,0,43,33,229,0,50,33,78,33,131,33,132,33,96,44,97,44,98,44,107,2,99,44,125,29,100,44,125,2,109,44,81,2,110,44,113,2,111,44,80,2,112,44,82,2,114,44,115,44,117,44,118,44,126,44,63,2,127,44,64,2,242,44,243,44,125,167,121,29,139,167,140,167,141,167,101,2,170,167,102,2,199,16,39,45,205,16,45,45,118,3,119,3,156,3,181,0,146,3,208,3,152,3,209,3,166,3,213,3,160,3,214,3,154,3,240,3,161,3,241,3,149,3,245,3,207,3,215,3,0,0,0,0,0,0,0,0,51,0,0,0,51,0,0,0,51,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,168,179,0,0,160,184,0,0,48,117,0,0,40,121,0,0,200,199,0,0,72,108,0,0,10,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,4,0,0,0,96,0,0,0,96,0,0,0,42,0,0,0,104,0,0,0,14,0,0,0,2,0,0,0,92,0,0,0,206,0,0,0,206,0,0,0,28,0,0,0,12,0,0,0,2,3,4,5,6,7,8,0,0,9,10,11,12,13,14,15,16,17,0,0,0,0,0,0,0,0,0,0,0,0,18,19,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,23,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,80,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,8,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,80,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,160,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,232,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,240,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,72,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,160,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,47,52,120,44,2,65,116,32,116,104,101,32,114,101,116,117,114,110,32,102,114,111,109,32,78,69,87,85,79,65,2,44,53,120,44,2,78,117,109,98,101,114,32,111,102,32,102,117,110,99,116,105,111,110,32,118,97,108,117,101,115,32,61,2,44,105,54,41,0,0,0,40,52,120,44,2,76,101,97,115,116,32,118,97,108,117,101,32,111,102,32,70,32,61,2,44,49,112,100,50,51,46,49,53,44,57,120,44,2,84,104,101,32,99,111,114,114,101,115,112,111,110,100,105,110,103,32,88,32,105,115,58,2,47,40,50,120,44,53,100,49,53,46,54,41,41,0,0,0,0,0,40,47,52,120,44,2,78,101,119,32,82,72,79,32,61,2,44,49,112,100,49,49,46,52,44,53,120,44,2,78,117,109,98,101,114,32,111,102,2,44,2,32,102,117,110,99,116,105,111,110,32,118,97,108,117,101,115,32,61,2,44,105,54,41,0,0,0,0,0,0,0,0,40,53,120,41,0,0,0,0,40,47,52,120,44,2,82,101,116,117,114,110,32,102,114,111,109,32,78,69,87,85,79,65,32,98,101,99,97,117,115,101,32,97,32,116,114,117,115,116,2,44,2,32,114,101,103,105,111,110,32,115,116,101,112,32,104,97,115,32,102,97,105,108,101,100,32,116,111,32,114,101,100,117,99,101,32,81,46,2,41,0,0,0,0,0,0,0,40,47,52,120,44,2,70,117,110,99,116,105,111,110,32,110,117,109,98,101,114,2,44,105,54,44,2,32,32,32,32,70,32,61,2,44,49,112,100,49,56,46,49,48,44,2,32,32,32,32,84,104,101,32,99,111,114,114,101,115,112,111,110,100,105,110,103,32,88,32,105,115,58,2,47,40,50,120,44,53,100,49,53,46,54,41,41,0,40,47,52,120,44,2,82,101,116,117,114,110,32,102,114,111,109,32,78,69,87,85,79,65,32,98,101,99,97,117,115,101,32,67,65,76,70,85,78,32,104,97,115,32,98,101,101,110,2,44,2,32,99,97,108,108,101,100,32,77,65,88,70,85,78,32,116,105,109,101,115,46,2,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,128,38,0,0,0,0,0,0,0,0,0,0,40,47,52,120,44,2,82,101,116,117,114,110,32,102,114,111,109,32,78,69,87,85,79,65,32,98,101,99,97,117,115,101,32,78,80,84,32,105,115,32,110,111,116,32,105,110,2,44,2,32,116,104,101,32,114,101,113,117,105,114,101,100,32,105,110,116,101,114,118,97,108,2,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,43,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,45,0,0,0,0,0,0,0,0,0,0].concat([0,0,0,0,0,0,0,0,0,0,0,0,40,47,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,45,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,45,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,45,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,45,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,47,41,0,0,0,0,0,40,49,120,44,54,103,49,51,46,53,41,0,0,0,0,0,40,47,2,32,65,32,102,117,114,116,104,101,114,2,44,105,52,44,2,32,102,117,110,99,116,105,111,110,32,101,118,97,108,117,97,116,105,111,110,115,32,104,97,118,101,32,98,101,101,110,32,117,115,101,100,2,47,41,0,0,0,0,0,0,40,47,47,2,32,67,79,82,82,69,76,65,84,73,79,78,32,77,65,84,82,73,88,58,45,2,41,0,0,0,0,0,40,2,32,73,78,70,79,82,77,65,84,73,79,78,32,77,65,84,82,73,88,58,45,2,47,41,0,0,0,0,0,0,40,47,2,32,73,102,32,116,104,101,32,102,117,110,99,116,105,111,110,32,109,105,110,105,109,105,122,101,100,32,119,97,115,32,45,76,79,71,40,76,73,75,69,76,73,72,79,79,68,41,44,2,47,2,32,116,104,105,115,32,105,115,32,116,104,101,32,99,111,118,97,114,105,97,110,99,101,32,109,97,116,114,105,120,32,111,102,32,116,104,101,32,112,97,114,97,109,101,116,101,114,115,46,2,47,2,32,73,102,32,116,104,101,32,102,117,110,99,116,105,111,110,32,119,97,115,32,97,32,115,117,109,32,111,102,32,115,113,117,97,114,101,115,32,111,102,32,114,101,115,105,100,117,97,108,115,44,2,47,2,32,116,104,105,115,32,109,97,116,114,105,120,32,109,117,115,116,32,98,101,32,109,117,108,116,105,112,108,105,101,100,32,98,121,32,116,119,105,99,101,32,116,104,101,32,101,115,116,105,109,97,116,101,100,2,44,49,120,44,2,114,101,115,105,100,117,97,108,32,118,97,114,105,97,110,99,101,2,47,2,32,116,111,32,111,98,116,97,105,110,32,116,104,101,32,99,111,118,97,114,105,97,110,99,101,32,109,97,116,114,105,120,46,2,47,41,0,0,0,0,40,2,32,82,97,110,107,32,111,102,32,105,110,102,111,114,109,97,116,105,111,110,32,109,97,116,114,105,120,32,61,2,44,105,51,47,2,32,73,110,118,101,114,115,101,32,111,102,32,105,110,102,111,114,109,97,116,105,111,110,32,109,97,116,114,105,120,58,45,2,41,0,40,2,32,73,70,32,84,72,73,83,32,68,73,70,70,69,82,83,32,66,89,32,77,85,67,72,32,70,82,79,77,32,84,72,69,32,77,73,78,73,77,85,77,32,69,83,84,73,77,65,84,69,68,2,44,49,120,44,2,70,82,79,77,32,84,72,69,32,77,73,78,73,77,73,90,65,84,73,79,78,44,2,47,2,32,84,72,69,32,77,73,78,73,77,85,77,32,77,65,89,32,66,69,32,70,65,76,83,69,32,38,47,79,82,32,84,72,69,32,73,78,70,79,82,77,65,84,73,79,78,32,77,65,84,82,73,88,32,77,65,89,32,66,69,2,44,49,120,44,2,73,78,65,67,67,85,82,65,84,69,2,47,41,0,0,0,0,0,40,2,32,77,105,110,105,109,117,109,32,111,102,32,113,117,97,100,114,97,116,105,99,32,115,117,114,102,97,99,101,32,61,2,44,103,49,52,46,54,44,2,32,97,116,2,44,52,40,47,49,120,44,54,103,49,51,46,53,41,41,0,0,0,40,47,49,48,120,44,2,83,101,97,114,99,104,32,114,101,115,116,97,114,116,105,110,103,2,47,41,0,0,0,0,0,40,47,2,32,77,65,84,82,73,88,32,79,70,32,69,83,84,73,77,65,84,69,68,32,83,69,67,79,78,68,32,68,69,82,73,86,65,84,73,86,69,83,32,78,79,84,32,43,86,69,32,68,69,70,78,46,2,47,2,32,77,73,78,73,77,85,77,32,80,82,79,66,65,66,76,89,32,78,79,84,32,70,79,85,78,68,2,47,41,0,0,0,0,0,0,0,40,47,2,32,70,105,116,116,105,110,103,32,113,117,97,100,114,97,116,105,99,32,115,117,114,102,97,99,101,32,97,98,111,117,116,32,115,117,112,112,111,115,101,100,32,109,105,110,105,109,117,109,2,47,41,0,40,2,32,70,117,110,99,116,105,111,110,32,118,97,108,117,101,32,97,116,32,109,105,110,105,109,117,109,32,61,2,44,103,49,52,46,54,41,0,0,40,2,32,77,105,110,105,109,117,109,32,97,116,2,44,52,40,47,49,120,44,54,103,49,51,46,54,41,41,0,0,0,40,47,47,2,32,77,105,110,105,109,117,109,32,102,111,117,110,100,32,97,102,116,101,114,2,44,105,53,44,2,32,102,117,110,99,116,105,111,110,32,101,118,97,108,117,97,116,105,111,110,115,2,41,0,0,0,40,47,2,32,69,86,73,68,69,78,67,69,32,79,70,32,67,79,78,86,69,82,71,69,78,67,69,2,41,0,0,0,40,2,32,70,117,110,99,116,105,111,110,32,118,97,108,117,101,32,97,116,32,99,101,110,116,114,111,105,100,32,61,2,44,103,49,52,46,54,41,0,40,2,32,67,101,110,116,114,111,105,100,32,111,102,32,108,97,115,116,32,115,105,109,112,108,101,120,32,61,2,44,52,40,47,49,120,44,54,103,49,51,46,53,41,41,0,0,0,40,2,32,82,77,83,32,111,102,32,102,117,110,99,116,105,111,110,32,118,97,108,117,101,115,32,111,102,32,108,97,115,116,32,115,105,109,112,108,101,120,32,61,2,44,103,49,52,46,54,41,0,0,0,0,0,40,2,32,78,111,46,32,111,102,32,102,117,110,99,116,105,111,110,32,101,118,97,108,117,97,116,105,111,110,115,32,62,32,2,44,105,53,41,0,0,40,47,49,120,44,105,52,44,50,120,44,103,49,50,46,53,44,50,120,44,53,103,49,49,46,52,44,51,40,47,50,49,120,44,53,103,49,49,46,52,41,41,0,0,0,0,0,0,40,2,32,80,114,111,103,114,101,115,115,32,82,101,112,111,114,116,32,101,118,101,114,121,2,44,105,52,44,2,32,102,117,110,99,116,105,111,110,32,101,118,97,108,117,97,116,105,111,110,115,2,47,44,2,32,69,86,65,76,46,32,32,32,70,85,78,67,46,86,65,76,85,69,46,2,44,49,48,120,44,2,80,65,82,65,77,69,84,69,82,32,86,65,76,85,69,83,2,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,4,254,255,255,135,254,255,255,7,0,0,0,0,0,0,0,0,255,255,127,255,255,255,127,255,255,255,255,255,255,255,243,127,254,253,255,255,255,255,255,127,255,255,255,255,255,255,255,255,15,224,255,255,255,255,49,252,255,255,255,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,1,0,248,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,215,255,255,251,255,255,255,255,127,127,84,253,255,15,0,254,223,255,255,255,255,255,255,255,255,254,223,255,255,255,255,3,0,255,255,255,255,255,255,159,25,255,255,255,207,63,3,0,0,0,0,0,0,254,255,255,255,127,2,254,255,255,255,127,0,0,0,0,0,0,0,0,0,255,255,255,7,7,0,0,0,0,0,254,255,255,7,254,7,0,0,0,0,254,255,255,255,255,255,255,255,255,124,255,127,47,0,96,0,0,0,224,255,255,255,255,255,255,35,0,0,0,255,3,0,0,0,224,159,249,255,255,253,197,3,0,0,0,176,3,0,3,0,224,135,249,255,255,253,109,3,0,0,0,94,0,0,28,0,224,175,251,255,255,253,237,35,0,0,0,0,1,0,0,0,224,159,249,255,255,253,205,35,0,0,0,176,3,0,0,0,224,199,61,214,24,199,191,3,0,0,0,0,0,0,0,0,224,223,253,255,255,253,239,3,0,0,0,0,3,0,0,0,224,223,253,255,255,253,239,3,0,0,0,64,3,0,0,0,224,223,253,255,255,253,255,3,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,255,127,13,0,63,0,0,0,0,0,0,0,150,37,240,254,174,108,13,32,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,254,255,255,255,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,63,0,255,255,255,255,127,0,237,218,7,0,0,0,0,80,1,80,49,130,171,98,44,0,0,0,0,64,0,201,128,245,7,0,0,0,0,8,1,2,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,15,255,255,255,255,255,255,255,255,255,255,255,3,255,255,63,63,255,255,255,255,63,63,255,170,255,255,255,63,255,255,255,255,255,255,223,95,220,31,207,15,255,31,220,31,0,0,0,0,64,76,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,254,3,0,0,254,255,255,255,255,255,255,255,255,255,31,0,254,255,255,255,255,255,255,255,255,255,255,7,224,255,255,255,255,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,63,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,255,7,254,255,255,135,254,255,255,7,0,0,0,0,0,0,128,0,255,255,127,255,255,255,127,255,255,255,255,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,1,0,248,3,0,3,0,0,0,0,0,255,255,255,255,255,255,255,255,63,0,0,0,3,0,0,0,192,215,255,255,251,255,255,255,255,127,127,84,253,255,15,0,254,223,255,255,255,255,255,255,255,255,254,223,255,255,255,255,123,0,255,255,255,255,255,255,159,25,255,255,255,207,63,3,0,0,0,0,0,0,254,255,255,255,127,2,254,255,255,255,127,0,254,255,251,255,255,187,22,0,255,255,255,7,7,0,0,0,0,0,254,255,255,7,255,255,7,0,255,3,255,255,255,255,255,255,255,255,255,124,255,127,239,255,255,61,255,3,238,255,255,255,255,255,255,243,255,63,30,255,207,255,0,0,238,159,249,255,255,253,197,211,159,57,128,176,207,255,3,0,228,135,249,255,255,253,109,211,135,57,0,94,192,255,31,0,238,175,251,255,255,253,237,243,191,59,0,0,193,255,0,0,238,159,249,255,255,253,205,243,143,57,192,176,195,255,0,0,236,199,61,214,24,199,191,195,199,61,128,0,128,255,0,0,238,223,253,255,255,253,239,195,223,61,96,0,195,255,0,0,236,223,253,255,255,253,239,195,223,61,96,64,195,255,0,0,236,223,253,255,255,253,255,195,207,61,128,0,195,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,255,127,255,7,255,127,255,3,0,0,0,0,150,37,240,254,174,108,255,59,95,63,255,3,0,0,0,0,0,0,0,3,255,3,160,194,255,254,255,255,255,3,254,255,223,15,191,254,255,63,254,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,31,2,0,0,0,160,0,0,0,254,255,62,0,254,255,255,255,255,255,255,255,255,255,31,102,254,255,255,255,255,255,255,255,255,255,255,119,25,3,26,27,28,29,30,0,0,31,32,33,34,35,36,37,16,17,0,0,0,0,0,0,0,0,0,0,0,0,18,19,38,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,23,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,78,111,32,101,114,114,111,114,0,78,111,32,109,97,116,99,104,0,73,110,118,97,108,105,100,32,114,101,103,101,120,112,0,85,110,107,110,111,119,110,32,99,111,108,108,97,116,105,110,103,32,101,108,101,109,101,110,116,0,85,110,107,110,111,119,110,32,99,104,97,114,97,99,116,101,114,32,99,108,97,115,115,32,110,97,109,101,0,84,114,97,105,108,105,110,103,32,98,97,99,107,115,108,97,115,104,0,73,110,118,97,108,105,100,32,98,97,99,107,32,114,101,102,101,114,101,110,99,101,0,77,105,115,115,105,110,103,32,39,93,39,0,77,105,115,115,105,110,103,32,39,41,39,0,77,105,115,115,105,110,103,32,39,125,39,0,73,110,118,97,108,105,100,32,99,111,110,116,101,110,116,115,32,111,102,32,123,125,0,73,110,118,97,108,105,100,32,99,104,97,114,97,99,116,101,114,32,114,97,110,103,101,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,82,101,112,101,116,105,116,105,111,110,32,110,111,116,32,112,114,101,99,101,100,101,100,32,98,121,32,118,97,108,105,100,32,101,120,112,114,101,115,115,105,111,110,0,0,85,110,107,110,111,119,110,32,101,114,114,111,114,0,0,0,36,0,0,0,0,0,0,0,182,0,0,0,0,0,0,0,192,105,1,0,0,0,0,0,46,0,0,0,24,0,0,0,64,0,0,0,56,0,0,0,74,0,0,0,54,0,0,0,20,0,0,0,16,0,0,0,100,0,0,0,106,0,0,0,26,0,0,0,92,0,0,0,28,0,0,0,10,0,0,0,8,0,0,0,4,0,0,0,18,0,0,0,2,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,23,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,22,28,28,28,28,28,28,28,28,28,28,22,28,26,28,28,22,28,28,28,28,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,46,0,0,0,24,0,0,0,64,0,0,0,56,0,0,0,74,0,0,0,54,0,0,0,20,0,0,0,16,0,0,0,100,0,0,0,106,0,0,0,26,0,0,0,92,0,0,0,28,0,0,0,10,0,0,0,8,0,0,0,4,0,0,0,18,0,0,0,2,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,22,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,22,28,28,28,28,28,28,28,28,28,28,22,28,26,28,28,22,28,28,28,28,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34,0,0,0,78,0,0,0,32,0,0,0,18,0,0,0,80,0,0,0,58,0,0,0,32,0,0,0,20,0,0,0,86,0,0,0,24,0,0,0,14,0,0,0,60,0,0,0,76,0,0,0,16,0,0,0,62,0,0,0,22,0,0,0,20,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,23,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,22,28,28,28,28,28,28,28,28,28,28,22,28,26,28,28,22,28,28,28,28,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34,0,0,0,78,0,0,0,32,0,0,0,18,0,0,0,80,0,0,0,58,0,0,0,32,0,0,0,20,0,0,0,86,0,0,0,24,0,0,0,14,0,0,0,60,0,0,0,76,0,0,0,16,0,0,0,62,0,0,0,22,0,0,0,20,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,22,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,22,28,28,28,28,28,28,28,28,28,28,22,28,26,28,28,22,28,28,28,28,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,9,0,0,0,10,0,0,0,13,0,0,0,11,0,0,0,12,0,0,0,133,0,0,0,0,32,0,0,1,32,0,0,2,32,0,0,3,32,0,0,4,32,0,0,5,32,0,0,6,32,0,0,8,32,0,0,9,32,0,0,10,32,0,0,40,32,0,0,41,32,0,0,95,32,0,0,0,48,0,0,0,0,0,0,34,0,0,0,78,0,0,0,32,0,0,0,18,0,0,0,80,0,0,0,58,0,0,0,32,0,0,0,20,0,0,0,86,0,0,0,24,0,0,0,14,0,0,0,60,0,0,0,76,0,0,0,16,0,0,0,62,0,0,0,16,0,0,0,24,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,23,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,0,0,0,0,0,0,0,0,0,1,1,104,0,0,0,102,0,0,0,50,0,0,0,8,0,0,0,10,0,0,0,50,0,0,0,2,0,0,0,48,0,0,0,44,0,0,0,34,0,0,0,78,0,0,0,32,0,0,0,18,0,0,0,80,0,0,0,58,0,0,0,32,0,0,0,20,0,0,0,86,0,0,0,24,0,0,0,14,0,0,0,60,0,0,0,76,0,0,0,16,0,0,0,62,0,0,0,16,0,0,0,24,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,21,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,22,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,0,0,0,0,0,0,0,0,0,1,1,104,0,0,0,102,0,0,0,50,0,0,0,8,0,0,0,10,0,0,0,50,0,0,0,2,0,0,0,48,0,0,0,44,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,120,109,108,61,104,116,116,112,58,47,47,119,119,119,46,119,51,46,111,114,103,47,88,77,76,47,49,57,57,56,47,110,97,109,101,115,112,97,99,101,0,0,0,0,0,0,0,0,114,101,99,111,110,58,119,97,108,108,58,118,48,49,0,0,104,178,0,0,40,245,0,0,80,133,0,0,176,119,0,0,96,187,0,0,24,80,0,0,144,1,0,0,0,0,0,0,144,98,1,0,0,0,0,0,176,57,0,0,160,75,0,0,184,1,0,0,160,72,0,0,160,72,0,0,208,54,0,0,184,1,0,0,0,0,0,0,32,59,0,0,16,77,0,0,40,3,0,0,16,74,0,0,16,74,0,0,64,56,0,0,40,3,0,0,0,0,0,0,255,255,255,255,208,110,1,0,208,110,1,0,208,110,1,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,78,79,84,65,84,73,79,78,40,0,0,0,0,0,0,0,40,0,0,0,0,0,0,0,78,77,84,79,75,69,78,83,0,0,0,0,0,0,0,0,78,77,84,79,75,69,78,0,73,68,82,69,70,83,0,0,73,68,82,69,70,0,0,0,73,68,0,0,0,0,0,0,69,78,84,73,84,89,0,0,69,78,84,73,84,73,69,83,0,0,0,0,0,0,0,0,67,68,65,84,65,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,48,66,0,0,0,0,0,0,0,0,0,0,40,47,47,2,32,87,65,82,78,73,78,71,46,32,84,104,101,32,118,97,108,117,101,32,69,77,73,78,32,109,97,121,32,98,101,32,105,110,99,111,114,114,101,99,116,58,45,2,44,2,32,32,69,77,73,78,32,61,32,2,44,105,56,44,47,2,32,73,102,44,32,97,102,116,101,114,32,105,110,115,112,101,99,116,105,111,110,44,32,116,104,101,32,118,97,108,117,101,32,69,77,73,78,32,108,111,111,107,115,2,44,2,32,97,99,99,101,112,116,97,98,108,101,32,112,108,101,97,115,101,32,99,111,109,109,101,110,116,32,111,117,116,32,2,44,47,2,32,116,104,101,32,73,70,32,98,108,111,99,107,32,97,115,32,109,97,114,107,101,100,32,119,105,116,104,105,110,32,116,104,101,32,99,111,100,101,32,111,102,32,114,111,117,116,105,110,101,2,44,2,32,68,76,65,77,67,50,44,2,44,47,2,32,111,116,104,101,114,119,105,115,101,32,115,117,112,112,108,121,32,69,77,73,78,32,101,120,112,108,105,99,105,116,108,121,46,2,44,47,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,96,0,0,8,133,0,0,184,225,0,0,128,224,0,0,216,223,0,0,104,223,0,0,128,222,0,0,0,225,0,0,88,96,0,0,184,217,0,0,176,212,0,0,248,207,0,0,152,207,0,0,32,207,0,0,56,206,0,0,200,211,0,0,0,0,0,0,144,169,0,0,184,166,0,0,208,110,1,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,65,0,32,26,192,0,32,31,0,1,1,47,50,1,1,5,57,1,1,15,74,1,1,45,121,1,1,5,112,3,1,3,145,3,32,17,163,3,32,9,0,4,80,16,16,4,32,32,96,4,1,33,138,4,1,53,193,4,1,13,208,4,1,63,20,5,1,19,49,5,48,38,160,1,1,5,179,1,1,3,205,1,1,15,222,1,1,17,248,1,1,39,34,2,1,17,216,3,1,23,0,30,1,149,160,30,1,95,8,31,248,8,24,31,248,6,40,31,248,8,56,31,248,8,72,31,248,6,104,31,248,8,136,31,248,8,152,31,248,8,168,31,248,8,184,31,248,2,186,31,182,2,200,31,170,4,216,31,248,2,218,31,156,2,232,31,248,2,234,31,144,2,248,31,128,2,250,31,130,2,70,2,1,9,16,5,1,3,96,33,16,16,0,44,48,47,103,44,1,5,128,44,1,99,235,44,1,3,64,166,1,45,128,166,1,23,34,167,1,13,50,167,1,61,121,167,1,3,126,167,1,9,144,167,1,3,160,167,1,9,33,255,32,26,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,60,0,0,0,0,0,0,0,57,0,0,0,0,0,0,0,55,0,0,0,0,0,0,0,54,0,0,0,0,0,0,0,52,0,0,0,0,0,0,0,49,0,0,0,0,0,0,0,48,0,0,0,0,0,0,0,47,0,0,0,0,0,0,0,46,0,0,0,0,0,0,0,45,0,0,0,0,0,0,0,44,0,0,0,0,0,0,0,41,0,0,0,0,0,0,0,40,0,0,0,0,0,0,0,39,0,0,0,0,0,0,0,38,0,0,0,0,0,0,0,37,0,0,0,0,0,0,0,36,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,34,0,0,0,0,0,0,0,29,0,0,0,0,0,0,0,28,0,0,0,0,0,0,0,25,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,24,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,80,138,0,0,0,0,0,0,144,197,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,98,0,0,0,10,0,0,0,28,0,0,0,44,0,0,0,52,0,0,0,6,0,0,0,24,0,0,0,72,0,0,0,36,0,0,0,64,0,0,0,88,0,0,0,80,0,0,0,70,0,0,0,32,0,0,0,12,0,0,0,2,0,0,0,28,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,23,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,22,28,28,28,28,28,28,28,28,28,28,22,28,26,28,28,22,28,28,28,28,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,98,0,0,0,10,0,0,0,28,0,0,0,44,0,0,0,52,0,0,0,6,0,0,0,24,0,0,0,72,0,0,0,36,0,0,0,64,0,0,0,88,0,0,0,80,0,0,0,70,0,0,0,32,0,0,0,12,0,0,0,2,0,0,0,28,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,22,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,22,28,28,28,28,28,28,28,28,28,28,22,28,26,28,28,22,28,28,28,28,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,22,22,22,22,22,22,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,19,1,0,80,19,1,0,72,19,1,0,64,19,1,0,96,19,1,0,104,19,1,0,8,19,1,0,248,18,1,0,34,0,0,0,78,0,0,0,32,0,0,0,18,0,0,0,80,0,0,0,58,0,0,0,32,0,0,0,20,0,0,0,86,0,0,0,24,0,0,0,14,0,0,0,60,0,0,0,76,0,0,0,16,0,0,0,62,0,0,0,6,0,0,0,20,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,23,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34,0,0,0,78,0,0,0,32,0,0,0,18,0,0,0,80,0,0,0,58,0,0,0,32,0,0,0,20,0,0,0,86,0,0,0,24,0,0,0,14,0,0,0,60,0,0,0,76,0,0,0,16,0,0,0,62,0,0,0,6,0,0,0,20,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,16,12,19,28,30,3,13,31,32,33,34,35,27,26,17,25,25,25,25,25,25,25,25,25,25,22,18,2,14,11,15,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,20,28,4,28,22,28,24,24,24,24,24,24,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,28,36,28,28,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,116,116,112,58,47,47,119,119,119,46,119,51,46,111,114,103,47,50,48,48,48,47,120,109,108,110,115,47,0,0,0,104,116,116,112,58,47,47,119,119,119,46,119,51,46,111,114,103,47,88,77,76,47,49,57,57,56,47,110,97,109,101,115,112,97,99,101,0,0,0,0,200,106,1,0,0,0,0,0,114,97,100,97,117,51,32,91,115,117,110,100,105,97,108,47,107,105,110,115,111,108,32,110,101,101,100,101,100,93,0,0,91,37,108,100,93,32,37,115,0,0,0,0,0,0,0,0,74,117,108,0,0,0,0,0,38,108,116,59,0,0,0,0,68,101,115,105,114,101,100,32,115,116,101,112,32,116,111,32,115,109,97,108,108,32,116,114,121,32,110,101,120,116,32,111,110,101,0,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,86,97,114,105,97,98,108,101,32,71,46,84,32,111,117,116,32,111,102,32,91,109,105,110,44,32,109,97,120,93,32,105,110,116,101,114,118,97,108,58,32,71,46,84,32,62,61,32,48,46,48,32,104,97,115,32,118,97,108,117,101,58,32,0,114,97,100,97,117,53,32,91,115,117,110,100,105,97,108,47,107,105,110,115,111,108,32,110,101,101,100,101,100,93,0,0,112,97,114,97,109,101,116,101,114,32,82,101,97,108,32,37,115,40,37,115,115,116,97,114,116,61,37,103,37,115,44,32,102,105,120,101,100,61,37,115,44,32,37,115,110,111,109,105,110,97,108,61,37,103,37,115,44,32,109,105,110,61,37,103,44,32,109,97,120,61,37,103])
.concat([41,0,0,0,0,0,0,0,74,117,110,0,0,0,0,0,114,0,0,0,0,0,0,0,60,47,102,111,114,109,97,116,62,10,0,0,0,0,0,0,111,112,116,105,109,105,122,97,116,105,111,110,0,0,0,0,114,101,97,100,32,120,109,108,32,102,105,108,101,32,102,111,114,32,114,101,97,108,32,112,97,114,97,109,101,116,101,114,115,0,0,0,0,0,0,0,65,112,114,0,0,0,0,0,117,110,105,116,32,110,111,116,32,99,111,110,110,101,99,116,101,100,0,0,0,0,0,0,117,110,97,98,108,101,32,116,111,32,105,109,112,111,114,116,32,98,111,111,108,101,97,110,32,112,97,114,97,109,101,116,101,114,32,37,115,32,102,114,111,109,32,103,105,118,101,110,32,102,105,108,101,0,0,0,68,65,83,83,76,45,45,32,32,65,84,32,84,32,40,61,82,49,41,32,83,79,77,69,32,69,76,69,77,69,78,84,32,79,70,32,87,84,0,0,32,40,99,112,117,32,116,105,109,101,41,60,47,100,111,117,98,108,101,62,10,0,0,0,105,110,108,105,110,101,45,101,117,108,101,114,0,0,0,0,77,97,114,0,0,0,0,0,124,32,37,115,40,115,116,97,114,116,61,37,115,41,0,0,105,110,116,101,114,97,99,116,105,118,101,0,0,0,0,0,60,100,111,117,98,108,101,62,0,0,0,0,0,0,0,0,100,97,115,115,108,32,119,105,116,104,32,99,111,108,111,114,101,100,32,110,117,109,101,114,105,99,97,108,32,106,97,99,111,98,105,97,110,44,32,119,105,116,104,32,105,110,116,101,114,118,97,108,32,114,111,111,116,32,102,105,110,100,105,110,103,32,45,32,100,101,102,97,117,108,116,0,0,0,0,0,83,116,114,105,110,103,32,37,115,40,37,115,115,116,97,114,116,61,37,115,37,115,41,0,70,101,98,0,0,0,0,0,105,109,112,111,114,116,32,98,111,111,108,101,97,110,32,112,97,114,97,109,101,116,101,114,115,0,0,0,0,0,0,0,32,40,99,97,108,108,115,41,60,47,117,105,110,116,51,50,62,10,0,0,0,0,0,0,114,117,110,103,101,107,117,116,116,97,0,0,0,0,0,0,114,101,97,100,32,120,109,108,32,102,105,108,101,32,102,111,114,32,115,116,114,105,110,103,32,97,108,103,101,98,114,97,105,99,0,0,0,0,0,0,67,111,114,114,117,112,116,32,104,101,97,100,101,114,32,40,49,41,0,0,0,0,0,0,74,97,110,0,0,0,0,0,117,110,97,98,108,101,32,116,111,32,105,109,112,111,114,116,32,105,110,116,101,103,101,114,32,112,97,114,97,109,101,116,101,114,32,37,115,32,102,114,111,109,32,103,105,118,101,110,32,102,105,108,101,0,0,0,60,117,105,110,116,51,50,62,0,0,0,0,0,0,0,0,101,117,108,101,114,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,124,32,37,115,40,115,116,97,114,116,61,37,108,100,41,0,100,117,112,108,105,99,97,116,101,32,97,116,116,114,105,98,117,116,101,0,0,0,0,0,60,100,111,117,98,108,101,62,99,112,117,32,116,105,109,101,60,47,100,111,117,98,108,101,62,10,0,0,0,0,0,0,115,121,109,98,111,108,105,99,0,0,0,0,0,0,0,0,66,111,111,108,101,97,110,32,37,115,40,37,115,115,116,97,114,116,61,37,115,37,115,44,32,102,105,120,101,100,61,37,115,41,0,0,0,0,0,0,105,109,112,111,114,116,32,105,110,116,101,103,101,114,32,112,97,114,97,109,101,116,101,114,115,0,0,0,0,0,0,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,82,101,113,117,101,115,116,101,100,32,101,113,117,97,116,105,111,110,32,119,105,116,104,32,112,114,111,102,105,108,101,114,32,105,110,100,101,120,32,37,108,100,44,32,98,117,116,32,119,101,32,111,110,108,121,32,104,97,118,101,32,37,108,100,32,115,117,99,104,32,98,108,111,99,107,115,0,0,0,0,60,33,68,79,67,84,89,80,69,32,100,111,99,32,91,32,32,60,33,69,76,69,77,69,78,84,32,115,105,109,117,108,97,116,105,111,110,32,40,109,111,100,101,108,105,110,102,111,44,32,118,97,114,105,97,98,108,101,115,44,32,102,117,110,99,116,105,111,110,115,44,32,101,113,117,97,116,105,111,110,115,41,62,32,32,60,33,65,84,84,76,73,83,84,32,118,97,114,105,97,98,108,101,32,105,100,32,73,68,32,35,82,69,81,85,73,82,69,68,62,32,32,60,33,69,76,69,77,69,78,84,32,101,113,117,97,116,105,111,110,32,40,114,101,102,115,41,62,32,32,60,33,65,84,84,76,73,83,84,32,101,113,117,97,116,105,111,110,32,105,100,32,73,68,32,35,82,69,81,85,73,82,69,68,62,32,32,60,33,69,76,69,77,69,78,84,32,112,114,111,102,105,108,101,98,108,111,99,107,115,32,40,112,114,111,102,105,108,101,98,108,111,99,107,42,41,62,32,32,60,33,69,76,69,77,69,78,84,32,112,114,111,102,105,108,101,98,108,111,99,107,32,40,114,101,102,115,44,32,110,99,97,108,108,44,32,116,105,109,101,44,32,109,97,120,84,105,109,101,41,62,32,32,60,33,69,76,69,77,69,78,84,32,114,101,102,115,32,40,114,101,102,42,41,62,32,32,60,33,65,84,84,76,73,83,84,32,114,101,102,32,114,101,102,105,100,32,73,68,82,69,70,32,35,82,69,81,85,73,82,69,68,62,32,32,93,62,10,0,0,0,0,69,114,114,111,114,44,32,99,97,110,32,110,111,116,32,103,101,116,32,77,97,116,114,105,120,32,65,32,0,0,0,0,108,105,115,0,0,0,0,0,37,115,44,32,37,115,32,37,108,117,10,0,0,0,0,0,88,76,97,98,101,108,58,32,116,10,10,0,0,0,0,0,67,97,110,110,111,116,32,97,108,108,111,99,97,116,101,32,109,101,109,111,114,121,0,0,76,79,71,95,73,78,73,84,0,0,0,0,0,0,0,0,37,108,100,44,0,0,0,0,91,37,108,100,93,32,91,37,49,53,103,93,32,58,61,32,37,115,32,40,112,97,114,97,109,101,116,101,114,41,0,0,91,94,91,58,115,112,97,99,101,58,93,93,0,0,0,0,60,100,111,117,98,108,101,62,116,105,109,101,60,47,100,111,117,98,108,101,62,10,0,0,110,117,109,101,114,105,99,0,37,49,50,103,115,32,91,37,53,46,49,102,37,37,93,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,0,0,114,101,97,100,32,120,109,108,32,102,105,108,101,32,102,111,114,32,98,111,111,108,101,97,110,32,97,108,103,101,98,114,97,105,99,0,0,0,0,0,105,109,112,111,114,116,32,114,101,97,108,32,100,105,115,99,114,101,116,101,0,0,0,0,79,99,116,111,98,101,114,0,114,101,115,105,100,117,97,108,32,102,117,110,99,116,105,111,110,32,112,111,105,110,116,101,114,32,105,115,32,105,110,118,97,108,105,100,0,0,0,0,60,117,105,110,116,51,50,62,115,116,101,112,60,47,117,105,110,116,51,50,62,10,0,0,110,111,110,101,0,0,0,0,117,110,97,98,108,101,32,116,111,32,105,109,112,111,114,116,32,114,101,97,108,32,112,97,114,97,109,101,116,101,114,32,37,115,32,102,114,111,109,32,103,105,118,101,110,32,102,105,108,101,0,0,0,0,0,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,68,105,115,97,98,108,101,100,32,116,105,109,101,32,109,101,97,115,117,114,101,109,101,110,116,115,32,98,101,99,97,117,115,101,32,116,104,101,32,111,117,116,112,117,116,32,102,105,108,101,32,99,111,117,108,100,32,110,111,116,32,98,101,32,103,101,110,101,114,97,116,101,100,58,32,37,115,0,0,0,91,37,108,100,93,32,115,97,109,112,108,101,40,37,103,44,32,37,103,41,0,0,0,0,60,102,111,114,109,97,116,62,10,0,0,0,0,0,0,0,115,111,108,118,101,115,32,116,104,101,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,32,112,114,111,98,108,101,109,32,115,121,109,98,111,108,105,99,97,108,108,121,32,45,32,100,101,102,97,117,108,116,0,0,0,0,0,0,0,0,73,110,116,101,103,101,114,32,37,115,40,37,115,115,116,97,114,116,61,37,108,100,37,115,44,32,102,105,120,101,100,61,37,115,44,32,109,105,110,61,37,108,100,44,32,109,97,120,61,37,108,100,41,0,0,0,105,109,112,111,114,116,32,114,101,97,108,32,112,97,114,97,109,101,116,101,114,115,0,0,65,117,103,117,115,116,0,0,74,117,108,121,0,0,0,0,60,102,105,108,101,115,105,122,101,62,37,108,100,60,47,102,105,108,101,115,105,122,101,62,10,0,0,0,0,0,0,0,115,111,108,118,101,115,32,116,104,101,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,32,112,114,111,98,108,101,109,32,110,117,109,101,114,105,99,97,108,108,121,0,0,0,114,101,97,100,32,120,109,108,32,102,105,108,101,32,102,111,114,32,105,110,116,101,103,101,114,32,97,108,103,101,98,114,97,105,99,0,0,0,0,0,117,110,97,98,108,101,32,116,111,32,105,109,112,111,114,116,32,114,101,97,108,32,118,97,114,105,97,98,108,101,32,37,115,32,102,114,111,109,32,103,105,118,101,110,32,102,105,108,101,0,0,0,0,0,0,0,86,97,114,105,97,98,108,101,32,67,49,46,67,32,111,117,116,32,111,102,32,91,109,105,110,44,32,109,97,120,93,32,105,110,116,101,114,118,97,108,58,32,67,49,46,67,32,62,61,32,48,46,48,32,104,97,115,32,118,97,108,117,101,58,32,0,0,0,0,0,0,0,74,117,110,101,0,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,115,111,108,118,101,114,32,109,101,116,104,111,100,32,37,115,44,32,99,117,114,114,101,110,116,32,111,112,116,105,111,110,115,32,97,114,101,58,0,0,0,0,0,112,105,118,111,116,32,33,61,32,48,0,0,0,0,0,0,60,47,102,105,108,101,110,97,109,101,62,10,0,0,0,0,115,101,116,115,32,97,108,108,32,118,97,114,105,97,98,108,101,115,32,116,111,32,116,104,101,105,114,32,115,116,97,114,116,32,118,97,108,117,101,115,32,97,110,100,32,115,107,105,112,115,32,116,104,101,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,32,112,114,111,99,101,115,115,0,0,0,36,112,68,69,82,46,0,0,77,97,121,0,0,0,0,0,68,65,83,83,76,45,45,32,32,87,69,82,69,32,73,78,67,82,69,65,83,69,68,32,84,79,32,65,80,80,82,79,80,82,73,65,84,69,32,86,65,76,85,69,83,0,0,0,60,102,105,108,101,110,97,109,101,62,0,0,0,0,0,0,105,112,111,112,116,0,0,0,114,101,97,100,32,120,109,108,32,102,105,108,101,32,102,111,114,32,114,101,97,108,32,97,108,103,101,98,114,97,105,99,0,0,0,0,0,0,0,0,36,90,69,82,79,46,0,0,99,97,110,39,116,32,115,116,97,116,32,102,105,108,101,0,65,112,114,105,108,0,0,0,105,108,115,0,0,0,0,0,37,115,95,112,114,111,102,46,100,97,116,97,0,0,0,0,107,105,110,115,111,108,95,115,99,97,108,101,100,0,0,0,124,32,37,115,40,115,116,97,114,116,61,37,103,41,0,0,114,116,95,99,108,111,99,107,95,110,99,97,108,108,95,116,111,116,97,108,32,33,61,32,48,0,0,0,0,0,0,0,77,97,114,99,104,0,0,0,60,47,118,97,114,105,97,98,108,101,62,10,0,0,0,0,107,105,110,115,111,108,0,0,105,109,112,111,114,116,32,114,101,97,108,32,118,97,114,105,97,98,108,101,115,0,0,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,34,32,99,111,109,109,101,110,116,61,34,0,0,0,0,0,110,101,108,100,101,114,95,109,101,97,100,95,101,120,0,0,114,101,97,100,32,120,109,108,32,102,105,108,101,32,102,111,114,32,115,116,97,116,101,68,101,114,105,118,97,116,105,118,101,115,0,0,0,0,0,0,117,110,97,98,108,101,32,116,111,32,114,101,97,100,32,105,110,112,117,116,45,102,105,108,101,32,60,37,115,62,32,91,37,115,93,0,0,0,0,0,74,97,110,117,97,114,121,0,109,105,115,109,97,116,99,104,101,100,32,116,97,103,0,0,60,118,97,114,105,97,98,108,101,32,105,100,61,34,118,97,114,37,100,34,32,110,97,109,101,61,34,0,0,0,0,0,110,101,119,117,111,97,0,0,105,109,112,111,114,116,32,115,116,97,114,116,32,118,97,108,117,101,115,10,102,105,108,101,58,32,37,115,10,116,105,109,101,58,32,37,103,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,110,111,32,115,112,97,99,101,0,0,0,0,0,0,0,0,120,109,108,45,62,110,70,117,110,99,116,105,111,110,115,32,61,61,32,40,108,111,110,103,41,32,117,115,101,114,68,97,116,97,91,51,93,0,0,0,99,97,108,108,111,99,32,102,97,105,108,101,100,0,0,0,108,97,112,97,99,107,0,0,84,105,116,108,101,84,101,120,116,58,32,79,112,101,110,77,111,100,101,108,105,99,97,32,115,105,109,117,108,97,116,105,111,110,32,112,108,111,116,10,0,0,0,0,0,0,0,0,69,114,114,111,114,32,119,104,105,108,101,32,119,114,105,116,105,110,103,32,102,105,108,101,32,37,115,0,0,0,0,0,76,79,71,95,69,86,69,78,84,83,95,86,0,0,0,0,91,37,108,100,93,32,114,101,115,105,100,117,97,108,32,105,115,32,105,110,101,102,102,101,99,116,105,118,101,32,40,115,99,97,108,105,110,103,32,99,111,101,102,102,105,99,105,101,110,116,32,105,115,32,115,101,116,32,116,111,32,49,46,48,41,0,0,0,0,0,0,0,91,37,108,100,93,32,91,37,49,53,103,93,32,58,61,32,37,115,32,40,112,97,114,97,109,101,116,101,114,41,32,91,115,99,97,108,105,110,103,32,99,111,101,102,102,105,99,105,101,110,116,58,32,37,103,93,0,0,0,0,0,0,0,0,91,91,58,115,112,97,99,101,58,93,93,0,0,0,0,0,119,114,105,116,97,98,108,101,0,0,0,0,0,0,0,0,115,105,109,112,108,101,120,0,37,49,50,103,115,32,91,37,53,46,49,102,37,37,93,32,112,114,101,45,105,110,105,116,105,97,108,105,122,97,116,105,111,110,0,0,0,0,0,0,78,101,119,116,111,110,32,82,97,112,104,115,111,110,0,0,68,0,0,0,101,0,0,0,99,0,0,0,0,0,0,0,73,110,116,101,114,105,111,114,32,80,111,105,110,116,32,79,80,84,105,109,105,122,101,114,0,0,0,0,0,0,0,0,115,116,97,116,101,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,34,32,115,116,97,114,116,108,105,110,101,61,34,37,100,34,32,115,116,97,114,116,99,111,108,61,34,37,100,34,32,101,110,100,108,105,110,101,61,34,37,100,34,32,101,110,100,99,111,108,61,34,37,100,34,32,114,101,97,100,111,110,108,121,61,34,37,115,34,32,47,62,10,0,0,0,0,0,0,0,115,117,110,100,105,97,108,115,47,107,105,110,115,111,108,32,119,105,116,104,32,115,99,97,108,105,110,103,0,0,0,0,125,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,99,111,117,108,100,32,110,111,116,32,112,97,115,115,101,100,32,116,111,32,68,68,65,83,82,84,0,0,0,0,0,0,60,105,110,102,111,32,102,105,108,101,110,97,109,101,61,34,0,0,0,0,0,0,0,0,115,117,110,100,105,97,108,115,47,107,105,110,115,111,108,0,123,0,0,0,0,0,0,0,47,104,111,109,101,47,116,115,104,111,114,116,47,111,109,47,98,117,105,108,100,47,108,105,98,47,111,109,108,105,98,114,97,114,121,47,77,111,100,101,108,105,99,97,32,51,46,50,46,49,47,69,108,101,99,116,114,105,99,97,108,47,65,110,97,108,111,103,47,66,97,115,105,99,46,109,111,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,60,47,102,117,110,99,116,105,111,110,62,10,0,0,0,0,69,120,116,101,110,100,101,100,32,78,101,108,100,101,114,45,77,101,97,100,32,109,101,116,104,111,100,32,40,115,101,101,32,45,105,108,115,32,102,111,114,32,103,108,111,98,97,108,32,104,111,109,111,116,111,112,121,41,32,45,32,100,101,102,97,117,108,116,0,0,0,0,110,117,108,108,32,102,105,108,101,32,110,97,109,101,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,70,79,82,32,80,82,69,67,73,83,73,79,78,32,79,70,32,77,65,67,72,73,78,69,46,32,82,84,79,76,32,65,78,68,32,65,84,79,76,0,0,0,0,0,0,0,0,60,102,117,110,99,116,105,111,110,32,105,100,61,34,102,117,110,37,100,34,62,10,0,0,66,114,101,110,116,39,115,32,109,101,116,104,111,100,0,0,82,101,97,108,32,37,115,40,37,115,115,116,97,114,116,61,37,103,37,115,44,32,102,105,120,101,100,61,37,115,44,32,37,115,110,111,109,105,110,97,108,61,37,103,37,115,44,32,109,105,110,61,37,103,44,32,109,97,120,61,37,103,41,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,105,105,116,0,0,0,0,0,102,117,110,0,0,0,0,0,78,101,108,100,101,114,45,77,101,97,100,32,109,101,116,104,111,100,0,0,0,0,0,0,109,97,120,0,0,0,0,0,114,116,95,99,108,111,99,107,95,110,99,97,108,108,95,109,97,120,32,33,61,32,48,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,60,47,101,113,117,97,116,105,111,110,62,10,0,0,0,0,117,110,107,110,111,119,110,0,109,105,110,0,0,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,60,99,97,108,99,105,110,102,111,32,116,105,109,101,61,34,37,102,34,32,99,111,117,110,116,61,34,37,108,117,34,47,62,10,0,0,0,0,0,0,85,110,104,97,110,100,108,101,100,32,65,115,115,101,114,116,105,111,110,45,69,114,114,111,114,0,0,0,0,0,0,0,110,111,109,105,110,97,108,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,112,97,114,116,105,97,108,32,99,104,97,114,97,99,116,101,114,0,0,0,0,0,0,0,100,101,98,117,103,0,0,0,60,47,114,101,102,115,62,10,0,0,0,0,0,0,0,0,69,114,114,111,114,58,32,0,117,115,101,78,111,109,105,110,97,108,0,0,0,0,0,0,117,112,100,97,116,105,110,103,32,115,116,97,114,116,45,118,97,108,117,101,115,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,102,111,114,116,46,37,108,100,0,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,99,111,109,109,97,110,100,32,108,105,110,101,32,111,112,116,105,111,110,58,32,37,115,0,120,109,108,45,62,110,69,113,117,97,116,105,111,110,115,32,61,61,32,40,108,111,110,103,41,32,117,115,101,114,68,97,116,97,91,49,93,0,0,0,69,120,101,99,117,116,105,111,110,32,116,105,109,101,32,111,102,32,103,108,111,98,97,108,32,115,116,101,112,115,0,0,115,101,101,32,108,97,115,116,32,119,97,114,110,105,110,103,0,0,0,0,0,0,0,0,115,105,109,117,108,97,116,105,111,110,95,105,110,112,117,116,95,120,109,108,46,99,112,112,58,32,69,114,114,111,114,58,32,102,97,105,108,101,100,32,116,111,32,114,101,97,100,32,116,104,101,32,88,77,76,32,102,105,108,101,32,37,115,58,32,37,115,32,97,116,32,108,105,110,101,32,37,108,117,10,0,0,0,0,0,0,0,0,35,73,110,116,101,114,118,97,108,83,105,122,101,61,37,108,100,10,0,0,0,0,0,0,76,79,71,95,69,86,69,78,84,83,0,0,0,0,0,0,108,97,109,98,100,97,0,0,110,117,109,98,101,114,32,111,102,32,115,116,97,114,116,32,118,97,108,117,101,32,114,101,115,105,100,117,97,108,115,58,32,37,108,100,0,0,0,0,91,37,108,100,93,32,91,37,49,53,103,93,32,58,61,32,37,115,0,0,0,0,0,0,91,94,91,58,97,108,110,117,109,58,93,95,93,0,0,0,60,114,101,102,32,114,101,102,105,100,61,34,118,97,114,37,100,34,32,47,62,10,0,0,102,105,120,101,100,0,0,0,116,105,109,101,114,0,0,0,101,114,114,111,114,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,119,97,114,110,105,110,103,0,60,114,101,102,115,62,10,0,87,97,114,110,105,110,103,58,32,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,70,65,76,83,69,0,0,0,34,62,10,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,74,97,99,111,98,105,97,110,32,111,114,32,83,112,97,114,115,101,80,97,116,116,101,114,110,32,105,115,32,110,111,116,32,103,101,110,101,114,97,116,101,100,32,111,114,32,102,97,105,108,101,100,32,116,111,32,105,110,105,116,105,97,108,105,122,101,33,32,83,119,105,116,99,104,32,98,97,99,107,32,116,111,32,110,111,114,109,97,108,46,0,0,0,0,0,0,60,101,113,117,97,116,105,111,110,32,105,100,61,34,101,113,37,100,34,32,110,97,109,101,61,34,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,86,97,114,105,97,98,108,101,32,67,50,46,67,32,111,117,116,32,111,102,32,91,109,105,110,44,32,109,97,120,93,32,105,110,116,101,114,118,97,108,58,32,67,50,46,67,32,62,61,32,48,46,48,32,104,97,115,32,118,97,108,117,101,58,32,0,0,0,0,0,0,0,60,47,112,114,111,102,105,108,101,98,108,111,99,107,62,10,0,0,0,0,0,0,0,0,102,105,108,101,87,114,105,116,97,98,108,101,0,0,0,0,83,84,79,80,32,0,0,0,68,65,83,83,76,45,45,32,32,65,84,32,84,32,40,61,82,49,41,32,84,79,79,32,77,85,67,72,32,65,67,67,85,82,65,67,89,32,82,69,81,85,69,83,84,69,68,0,119,105,108,108,32,111,118,101,114,114,105,100,101,32,116,104,101,32,118,97,114,105,97,98,108,101,115,32,111,114,32,116,104,101,32,115,105,109,117,108,97,116,105,111,110,32,115,101,116,116,105,110,103,115,32,105,110,32,116,104,101,32,88,77,76,32,115,101,116,117,112,32,102,105,108,101,32,119,105,116,104,32,116,104,101,32,118,97,108,117,101,115,32,102,114,111,109,32,116,104,101,32,102,105,108,101,10,32,32,110,111,116,101,32,116,104,97,116,58,32,45,111,118,101,114,114,105,100,101,70,105,108,101,32,67,65,78,78,79,84,32,98,101,32,117,115,101,100,32,119,105,116,104,32,45,111,118,101,114,114,105,100,101,10,32,32,117,115,101,32,119,104,101,110,32,118,97,114,105,97,98,108,101,115,32,102,111,114,32,45,111,118,101,114,114,105,100,101,32,97,114,101,32,116,111,111,32,109,97,110,121,32,97,110,100,32,100,111,32,110,111,116,32,102,105,116,32,105,110,32,99,111,109,109,97,110,100,32,108,105,110,101,32,115,105,122,101,10,32,32,111,118,101,114,114,105,100,101,70,105,108,101,78,97,109,101,32,99,111,110,116,97,105,110,115,32,108,105,110,101,115,32,111,102,32,116,104,101,32,102,111,114,109,58,32,118,97,114,49,61,115,116,97,114,116,49,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,84,72,69,32,76,65,83,84,32,83,84,69,80,32,84,69,82,77,73,78,65,84,69,68,32,87,73,84,72,32,65,32,78,69,71,65,84,73,86,69,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,60,116,105,109,101,62,37,46,57,102,60,47,116,105,109,101,62,10,0,0,0,0,0,0,38,97,109,112,59,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,99,97,110,39,116,32,98,97,99,107,115,112,97,99,101,32,102,105,108,101,0,0,0,0,105,105,109,0,0,0,0,0,111,118,101,114,114,105,100,101,32,116,104,101,32,118,97,114,105,97,98,108,101,115,32,111,114,32,116,104,101,32,115,105,109,117,108,97,116,105,111,110,32,115,101,116,116,105,110,103,115,32,105,110,32,116,104,101,32,88,77,76,32,115,101,116,117,112,32,102,105,108,101,10,32,32,101,46,103,46,32,118,97,114,49,61,115,116,97,114,116,49,44,118,97,114,50,61,115,116,97,114,116,50,44,112,97,114,51,61,115,116,97,114,116,51,44,115,116,97,114,116,84,105,109,101,61,118,97,108,49,44,115,116,111,112,84,105,109,101,61,118,97,108,50,44,115,116,101,112,83,105,122,101,61,118,97,108,51,44,10,32,32,32,32,32,32,32,116,111,108,101,114,97,110,99,101,61,118,97,108,52,44,115,111,108,118,101,114,61,34,115,101,101,32,45,115,34,44,111,117,116,112,117,116,70,111,114,109,97,116,61,34,109,97,116,124,112,108,116,124,99,115,118,124,101,109,112,116,121,34,44,118,97,114,105,97,98,108,101,70,105,108,116,101,114,61,34,102,105,108,116,101,114,34,0,0,0,34,32,47,62,10,0,0,0,60,110,99,97,108,108,62,37,100,60,47,110,99,97,108,108,62,10,0,0,0,0,0,0,60,100,105,102,102,67,117,114,114,101,110,116,84,105,109,101,62,37,103,60,47,100,105,102,102,67,117,114,114,101,110,116,84,105,109,101,62,10,0,0,101,110,100,67,111,108,117,109,110,0,0,0,0,0,0,0,114,116,95,99,108,111,99,107,95,110,99,97,108,108,95,109,105,110,32,33,61,32,48,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,111,117,116,112,117,116,32,116,104,101,32,118,97,114,105,97,98,108,101,115,32,97,44,32,98,32,97,110,100,32,99,32,97,116,32,116,104,101,32,101,110,100,32,111,102,32,116,104,101,32,115,105,109,117,108,97,116,105,111,110,32,116,111,32,116,104,101,32,115,116,97,110,100,97,114,100,32,111,117,116,112,117,116,10,32,32,116,105,109,101,32,61,32,118,97,108,117,101,44,32,97,32,61,32,118,97,108,117,101,44,32,98,32,61,32,118,97,108,117,101,44,32,99,32,61,32,118,97,108,117,101,0,0,0,0,0,60,47,109,101,115,115,97,103,101,62,10,0,0,0,0,0,60,114,101,102,32,114,101,102,105,100,61,34,101,113,37,100,34,47,62,10,0,0,0,0,60,99,117,114,114,101,110,116,84,105,109,101,62,37,103,60,47,99,117,114,114,101,110,116,84,105,109,101,62,10,0,0,110,117,109,101,114,105,99,97,108,32,74,97,99,111,98,105,97,110,0,0,0,0,0,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,116,104,101,32,111,117,116,112,117,116,32,102,111,114,109,97,116,32,111,102,32,116,104,101,32,109,101,97,115,117,114,101,32,116,105,109,101,32,102,117,110,99,116,105,111,110,97,108,105,116,121,10,32,32,115,118,103,10,32,32,106,112,103,10,32,32,112,115,10,32,32,103,105,102,10,32,32,46,46,46,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,60,112,114,111,102,105,108,101,98,108,111,99,107,62,10,0,60,100,105,102,102,79,108,100,84,105,109,101,62,37,103,60,47,100,105,102,102,79,108,100,84,105,109,101,62,10,0,0,101,110,100,76,105,110,101,0,60,117,115,101,100,32,105,110,100,101,120,61,34,37,100,34,32,47,62,10,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,117,110,99,108,111,115,101,100,32,116,111,107,101,110,0,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,116,104,101,32,108,111,103,103,105,110,103,32,108,101,118,101,108,0,0,0,0,0,0,0,101,113,0,0,0,0,0,0,60,111,108,100,84,105,109,101,50,62,37,46,49,50,103,60,47,111,108,100,84,105,109,101,50,62,10,0,0,0,0,0,111,112,116,105,109,105,122,97,116,105,111,110,45,99,97,108,108,115,58,32,37,108,100,0,111,112,101,110,0,0,0,0,101,97,99,104,32,99,111,109,109,97,110,100,32,108,105,110,101,32,111,112,116,105,111,110,32,99,97,110,32,111,110,108,121,32,98,101,32,117,115,101,100,32,111,110,99,101,58,32,37,115,0,0,0,0,0,0,37,115,37,103,32,0,0,0,37,115,58,32,69,114,114,111,114,58,32,102,97,105,108,101,100,32,116,111,32,114,101,97,100,32,116,104,101,32,88,77,76,32,100,97,116,97,32,37,115,58,32,37,115,32,97,116,32,108,105,110,101,32,37,108,117,0,0,0,0,0,0,0,115,101,116,32,102,111,114,109,97,116,32,121,32,34,37,103,34,10,0,0,0,0,0,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,116,104,101,32,108,105,110,101,97,114,32,115,111,108,118,101,114,32,109,101,116,104,111,100,32,102,111,114,32,73,112,111,112,116,44,32,100,101,102,97,117,108,116,32,109,117,109,112,115,46,10,32,78,111,116,101,58,32,85,115,101,32,105,102,32,121,111,117,32,98,117,105,108,100,32,105,112,111,112,116,32,119,105,116,104,32,111,116,104,101,114,32,108,105,110,101,97,114,32,115,111,108,118,101,114,32,108,105,107,101,32,109,97,50,55,0,0,0,0,0,37,32,46,53,101,32,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,111,112,116,105,111,110,32,45,110,108,115,61,37,115,44,32,99,117,114,114,101,110,116,32,111,112,116,105,111,110,115,32,97,114,101,58,0,0,0,0,0,0,0,115,105,109,117,108,97,116,105,111,110,95,105,110,112,117,116,95,120,109,108,46,99,112,112,58,32,69,114,114,111,114,58,32,99,111,117,108,100,110,39,116,32,97,108,108,111,99,97,116,101,32,109,101,109,111,114,121,32,102,111,114,32,116,104,101,32,88,77,76,32,112,97,114,115,101,114,33,0,0,0,35,78,117,109,98,101,114,111,102,86,97,114,105,97,98,108,101,115,61,37,100,10,0,0,100,97,116,97,95,50,0,0,105,116,101,114,97,116,105,111,110,0,0,0,0,0,0,0,76,79,71,95,68,83,83,95,74,65,67,0,0,0,0,0,69,114,114,111,114,32,105,110,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,46,32,73,110,116,101,114,110,97,108,32,101,114,114,111,114,44,32,78,76,79,79,80,32,60,32,49,46,0,0,0,0,0,110,117,109,98,101,114,32,111,102,32,105,110,105,116,105,97,108,32,114,101,115,105,100,117,97,108,115,58,32,32,37,108,100,32,40,37,108,100,32,101,113,117,97,116,105,111,110,115,32,43,32,37,108,100,32,97,108,103,111,114,105,116,104,109,115,41,0,0,0,0,0,0,91,37,108,100,93,32,91,37,49,53,103,93,32,58,61,32,37,115,32,91,115,99,97,108,105,110,103,32,99,111,101,102,102,105,99,105,101,110,116,58,32,37,103,93,0,0,0,0,115,101,108,101,99,116,32,37,115,0,0,0,0,0,0,0,91,91,58,97,108,110,117,109,58,93,95,93,0,0,0,0,84,105,109,101,32,109,101,97,115,117,114,101,109,101,110,116,115,32,97,114,101,32,115,116,111,114,101,100,32,105,110,32,37,115,95,112,114,111,102,46,104,116,109,108,32,40,104,117,109,97,110,45,114,101,97,100,97,98,108,101,41,32,97,110,100,32,37,115,95,112,114,111,102,46,120,109,108,32,40,102,111,114,32,88,83,76,32,116,114,97,110,115,102,111,114,109,115,32,111,114,32,109,111,114,101,32,100,101,116,97,105,108,115,41,0,0,0,0,0,0,60,111,108,100,84,105,109,101,62,37,46,49,50,103,60,47,111,108,100,84,105,109,101,62,10,0,0,0,0,0,0,0,115,116,97,114,116,67,111,108,117,109,110,0,0,0,0,0,35,35,35,32,83,84,65,84,73,83,84,73,67,83,32,35,35,35,0,0,0,0,0,0,110,111,116,32,117,112,100,97,116,105,110,103,32,98,101,115,116,90,0,0,0,0,0,0,60,109,101,115,115,97,103,101,32,115,116,114,101,97,109,61,34,37,115,34,32,116,121,112,101,61,34,37,115,34,32,116,101,120,116,61,34,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,103,101,110,101,114,97,116,101,32,104,116,109,108,32,118,101,114,115,105,111,110,32,111,102,32,112,114,111,102,105,108,105,110,103,32,114,101,115,117,108,116,115,58,32,37,115,10,0,0,0,0,0,0,0,60,99,117,114,114,101,110,116,83,116,101,112,83,105,122,101,62,37,103,60,47,99,117,114,114,101,110,116,83,116,101,112,83,105,122,101,62,10,0,0,117,112,100,97,116,105,110,103,32,98,101,115,116,90,0,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,116,104,101,32,108,105,110,101,97,114,32,115,111,108,118,101,114,32,109,101,116,104,111,100,10,32,32,108,97,112,97,99,107,44,32,108,105,115,0,0,37,115,32,101,118,101,110,116,32,97,116,32,116,105,109,101,32,37,46,49,50,103,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,97,110,97,108,121,116,105,99,97,108,32,74,97,99,111,98,105,97,110,0,0,0,0,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,116,104,101,32,110,117,109,98,101,114,32,111,102,32,115,116,101,112,115,32,102,111,114,32,104,111,109,111,116,111,112,121,32,109,101,116,104,111,100,32,40,114,101,113,117,105,114,101,100,58,32,45,105,105,109,61,115,121,109,98,111,108,105,99,41,32,111,114,10,39,115,116,97,114,116,32,118,97,108,117,101,32,104,111,109,111,116,111,112,121,39,32,109,101,116,104,111,100,32,40,114,101,113,117,105,114,101,100,58,32,45,105,105,109,61,110,117,109,101,114,105,99,32,45,105,111,109,61,110,101,108,100,101,114,95,109,101,97,100,95,101,120,41,0,84,82,85,69,0,0,0,0,124,32,0,0,0,0,0,0,79,80,69,78,77,79,68,69,76,73,67,65,72,79,77,69,32,109,105,115,115,105,110,103,0,0,0,0,0,0,0,0,115,116,97,114,116,76,105,110,101,0,0,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,111,112,116,105,111,110,32,45,105,111,109,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,78,111,32,83,112,97,114,115,101,80,97,116,116,101,114,110,44,32,115,105,110,99,101,32,116,104,101,114,101,32,97,114,101,32,110,111,32,115,116,97,116,101,115,33,32,83,119,105,116,99,104,32,98,97,99,107,32,116,111,32,110,111,114,109,97,108,46,0,0,0,0,0,91,37,108,100,93,32,37,103,0,0,0,0,0,0,0,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,97,32,116,105,109,101,32,102,111,114,32,116,104,101,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,32,111,102,32,116,104,101,32,109,111,100,101,108,0,0,0,0,0,0,37,115,32,45,111,32,37,115,95,112,114,111,102,46,104,116,109,108,32,37,115,47,115,104,97,114,101,47,111,109,99,47,115,99,114,105,112,116,115,47,100,101,102,97,117,108,116,95,112,114,111,102,105,108,105,110,103,46,120,115,108,32,37,115,95,112,114,111,102,46,120,109,108,0,0,0,0,0,0,0,60,109,111,100,101,108,62,37,115,60,47,109,111,100,101,108,62,10,0,0,0,0,0,0,105,110,105,116,105,97,108,105,122,97,116,105,111,110,45,110,114,46,32,37,108,100,0,0,37,45,55,115,32,124,32,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,86,97,114,105,97,98,108,101,32,78,114,46,71,97,32,111,117,116,32,111,102,32,91,109,105,110,44,32,109,97,120,93,32,105,110,116,101,114,118,97,108,58,32,78,114,46,71,97,32,62,61,32,45,49,46,48,32,104,97,115,32,118,97,108,117,101,58,32,0,0,0,0,115,116,97,116,101,115,0,0,103,101,116,32,100,101,116,97,105,108,101,100,32,105,110,102,111,114,109,97,116,105,111,110,32,116,104,97,116,32,115,112,101,99,105,102,105,101,115,32,116,104,101,32,99,111,109,109,97,110,100,45,108,105,110,101,32,102,108,97,103,10,32,32,101,46,103,46,32,45,104,101,108,112,61,102,32,112,114,105,110,116,115,32,100,101,116,97,105,108,101,100,32,105,110,102,111,114,109,97,116,105,111,110,32,102,111,114,32,99,111,109,109,97,110,100,45,108,105,110,101,32,102,108,97,103,32,102,0,0,0,0,0,0,0,0,124,0,0,0,0,0,0,0,120,115,108,116,112,114,111,99,0,0,0,0,0,0,0,0,35,35,35,32,70,73,78,65,76,32,73,78,73,84,73,65,76,73,90,65,84,73,79,78,32,82,69,83,85,76,84,83,32,35,35,35,0,0,0,0,99,106,58,32,37,103,0,0,68,65,83,83,76,45,45,32,32,84,65,75,69,78,32,79,78,32,84,72,73,83,32,67,65,76,76,32,66,69,70,79,82,69,32,82,69,65,67,72,73,78,71,32,84,79,85,84,0,0,0,0,0,0,0,0,70,76,65,71,95,85,78,75,78,79,87,78,0,0,0,0,32,32,45,32,100,117,109,112,115,32,116,104,101,32,99,112,117,45,116,105,109,101,32,105,110,116,111,32,116,104,101,32,114,101,115,117,108,116,45,102,105,108,101,10,32,32,45,32,36,99,112,117,84,105,109,101,32,105,115,32,116,104,101,32,118,97,114,105,97,98,108,101,32,110,97,109,101,32,105,110,115,105,100,101,32,116,104,101,32,114,101,115,117,108,116,45,102,105,108,101,0,0,0,0,37,45,49,55,115,32,124,32,0,0,0,0,0,0,0,0,87,97,114,110,105,110,103,58,32,80,108,111,116,32,99,111,109,109,97,110,100,32,102,97,105,108,101,100,10,0,0,0,78,111,32,118,97,114,105,97,98,108,101,115,32,105,110,32,116,104,101,32,109,111,100,101,108,46,0,0,0,0,0,0,115,107,105,112,32,119,47,111,32,115,99,97,108,105,110,103,0,0,0,0,0,0,0,0,80,77,0,0,0,0,0,0,115,101,113,117,101,110,116,105,97,108,32,105,111,32,110,111,116,32,97,108,108,111,119,101,100,0,0,0,0,0,0,0,97,116,32,112,111,105,110,116,32,105,110,32,116,105,109,101,58,32,37,103,0,0,0,0,105,105,102,0,0,0,0,0,115,101,108,101,99,116,115,32,116,104,101,32,116,121,112,101,32,111,102,32,99,108,111,99,107,32,116,111,32,117,115,101,32,45,99,108,111,99,107,61,82,84,44,32,45,99,108,111,99,107,61,67,89,67,32,111,114,32,45,99,108,111,99,107,61,67,80,85,10,32,32,82,84,61,109,111,110,111,116,111,110,105,99,32,114,101,97,108,45,116,105,109,101,32,99,108,111,99,107,44,32,67,80,85,61,112,114,111,99,101,115,115,45,98,97,115,101,100,32,67,80,85,45,116,105,109,101,44,32,67,89,67,61,99,112,117,32,99,121,99,108,101,115,32,109,101,97,115,117,114,101,100,32,119,105,116,104,32,82,68,84,83,67,0,0,0,0,0,115,105,109,117,108,97,116,105,111,110,47,109,111,100,101,108,105,110,102,111,46,99,0,0,69,114,114,111,114,58,32,67,111,117,108,100,32,110,111,116,32,105,110,105,116,105,97,108,105,122,101,32,116,104,101,32,103,108,111,98,97,108,32,100,97,116,97,32,115,116,114,117,99,116,117,114,101,32,102,105,108,101,0,0,0,0,0,0,100,101,115,99,114,105,112,116,105,111,110,0,0,0,0,0,115,116,97,114,116,32,119,105,116,104,32,115,99,97,108,105,110,103,0,0,0,0,0,0,114,116,95,99,108,111,99,107,95,110,99,97,108,108,32,33,61,32,48,0,0,0,0,0,65,77,0,0,0,0,0,0,115,104,111,119,115,32,97,108,108,32,119,97,114,110,105,110,103,115,32,101,118,101,110,32,105,102,32,97,32,114,101,108,97,116,101,100,32,108,111,103,45,115,116,114,101,97,109,32,105,115,32,105,110,97,99,116,105,118,101,0,0,0,0,0,98,117,102,0,0,0,0,0,117,115,101,32,37,115,32,45,104,101,108,112,32,102,111,114,32,97,32,108,105,115,116,32,111,102,32,97,108,108,32,99,111,109,109,97,110,100,45,108,105,110,101,32,102,108,97,103,115,0,0,0,0,0,0,0,111,118,101,114,45,100,101,116,101,114,109,105,110,101,100,0,101,114,114,111,114,32,105,110,32,102,111,114,109,97,116,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,116,104,101,32,115,111,108,118,101,114,0,0,0,0,0,0,105,110,118,97,108,105,100,32,100,97,116,97,32,110,111,100,101,0,0,0,0,0,0,0,60,47,115,105,109,117,108,97,116,105,111,110,62,10,0,0,105,110,118,97,108,105,100,32,99,111,109,109,97,110,100,32,108,105,110,101,32,111,112,116,105,111,110,58,32,45,104,101,108,112,61,37,115,0,0,0,118,97,108,117,101,82,101,102,101,114,101,110,99,101,0,0,110,111,32,105,110,105,116,105,97,108,32,118,97,108,117,101,115,32,116,111,32,99,97,108,99,117,108,97,116,101,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,110,111,116,32,119,101,108,108,45,102,111,114,109,101,100,32,40,105,110,118,97,108,105,100,32,116,111,107,101,110,41,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,97,32,110,101,119,32,114,101,115,117,108,116,32,102,105,108,101,32,116,104,97,110,32,116,104,101,32,100,101,102,97,117,108,116,32,77,111,100,101,108,95,114,101,115,46,109,97,116,0,0,0,0,0,0,0,0,60,47,112,114,111,102,105,108,101,98,108,111,99,107,115,62,10,0,0,0,0,0,0,0,100,101,116,97,105,108,101,100,32,102,108,97,103,45,100,101,115,99,114,105,112,116,105,111,110,32,102,111,114,58,32,60,45,37,115,61,118,97,108,117,101,62,32,111,114,32,60,45,37,115,32,118,97,108,117,101,62,10,37,115,0,0,0,0,37,115,40,102,105,120,101,100,61,116,114,117,101,41,32,61,32,37,103,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,114,43,0,0,0,0,0,0,117,110,98,97,108,97,110,99,101,100,32,99,111,109,109,97,110,100,32,108,105,110,101,32,102,108,97,103,32,115,116,114,117,99,116,117,114,101,58,32,70,76,65,71,95,68,69,84,65,73,76,69,68,95,68,69,83,67,0,0,0,0,0,0,115,105,109,117,108,97,116,105,111,110,47,115,105,109,117,108])
.concat([97,116,105,111,110,95,105,110,102,111,95,120,109,108,46,99,0,0,0,0,0,0,0,0,115,101,116,32,110,111,107,101,121,10,0,0,0,0,0,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,105,110,116,101,114,97,99,116,105,118,101,32,115,105,109,117,108,97,116,105,111,110,32,112,111,114,116,0,0,0,0,0,80,114,105,110,116,32,106,97,99,58,0,0,0,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,111,112,116,105,111,110,32,45,108,118,32,37,115,0,0,0,0,0,0,115,105,109,117,108,97,116,105,111,110,95,105,110,112,117,116,95,120,109,108,46,99,112,112,58,32,69,114,114,111,114,58,32,99,97,110,32,110,111,116,32,114,101,97,100,32,102,105,108,101,32,37,115,32,97,115,32,115,101,116,117,112,32,102,105,108,101,32,116,111,32,116,104,101,32,103,101,110,101,114,97,116,101,100,32,115,105,109,117,108,97,116,105,111,110,32,99,111,100,101,46,0,0,0,35,80,116,111,108,101,109,121,32,80,108,111,116,32,102,105,108,101,44,32,103,101,110,101,114,97,116,101,100,32,98,121,32,79,112,101,110,77,111,100,101,108,105,99,97,10,0,0,100,97,116,97,73,110,102,111,0,0,0,0,0,0,0,0,37,115,44,0,0,0,0,0,69,114,114,111,114,32,105,110,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,46,32,78,117,109,98,101,114,32,111,102,32,105,110,105,116,105,97,108,32,118,97,108,117,101,115,32,116,111,32,99,97,108,99,117,108,97,116,101,32,60,32,49,0,0,0,0,0,0,76,79,71,95,68,83,83,0,91,37,108,100,93,32,100,105,115,99,114,101,116,101,32,82,101,97,108,32,37,115,40,115,116,97,114,116,61,37,103,44,32,110,111,109,105,110,97,108,61,37,103,41,32,61,32,37,103,0,0,0,0,0,0,0,117,110,102,105,120,101,100,32,118,97,114,105,97,98,108,101,115,0,0,0,0,0,0,0,115,101,108,101,99,116,32,110,101,119,32,115,116,97,116,101,115,32,97,116,32,116,105,109,101,32,37,102,0,0,0,0,27,0,0,0,0,0,0,0,60,112,114,111,102,105,108,101,98,108,111,99,107,115,62,10,0,0,0,0,0,0,0,0,100,101,116,97,105,108,101,100,32,102,108,97,103,45,100,101,115,99,114,105,112,116,105,111,110,32,102,111,114,58,32,60,45,37,115,62,10,37,115,0,115,101,116,116,105,110,103,32,102,105,120,101,100,61,116,114,117,101,32,102,111,114,58,0,119,105,108,108,32,111,118,101,114,114,105,100,101,32,116,104,101,32,118,97,114,105,97,98,108,101,115,32,111,114,32,116,104,101,32,115,105,109,117,108,97,116,105,111,110,32,115,101,116,116,105,110,103,115,32,105,110,32,116,104,101,32,88,77,76,32,115,101,116,117,112,32,102,105,108,101,32,119,105,116,104,32,116,104,101,32,118,97,108,117,101,115,32,102,114,111,109,32,116,104,101,32,102,105,108,101,0,0,0,0,0,0,60,47,101,113,117,97,116,105,111,110,115,62,10,0,0,0,105,110,118,97,108,105,100,32,99,111,109,109,97,110,100,32,108,105,110,101,32,111,112,116,105,111,110,58,32,45,108,111,103,70,111,114,109,97,116,61,37,115,44,32,101,120,112,101,99,116,101,100,32,116,101,120,116,32,111,114,32,120,109,108,0,0,0,0,0,0,0,0,114,101,97,100,32,120,109,108,32,102,105,108,101,32,102,111,114,32,115,116,97,116,101,115,0,0,0,0,0,0,0,0,117,110,100,101,114,45,100,101,116,101,114,109,105,110,101,100,0,0,0,0,0,0,0,0,97,99,99,95,116,112,32,33,61,32,48,0,0,0,0,0,69,82,82,79,82,58,32,84,111,111,32,109,97,110,121,32,101,118,101,110,116,32,105,116,101,114,97,116,105,111,110,115,46,32,83,121,115,116,101,109,32,105,115,32,105,110,99,111,110,115,105,115,116,101,110,116,46,32,83,105,109,117,108,97,116,105,111,110,32,116,101,114,109,105,110,97,116,101,46,0,111,118,101,114,114,105,100,101,32,116,104,101,32,118,97,114,105,97,98,108,101,115,32,111,114,32,116,104,101,32,115,105,109,117,108,97,116,105,111,110,32,115,101,116,116,105,110,103,115,32,105,110,32,116,104,101,32,88,77,76,32,115,101,116,117,112,32,102,105,108,101,0,60,101,113,117,97,116,105,111,110,115,62,10,0,0,0,0,116,101,120,116,0,0,0,0,110,121,115,116,114,32,105,110,32,115,101,116,117,112,32,102,105,108,101,58,32,37,108,100,32,102,114,111,109,32,109,111,100,101,108,32,99,111,100,101,58,32,37,108,100,0,0,0,110,111,32,105,110,105,116,105,97,108,32,114,101,115,105,100,117,97,108,115,32,40,110,101,105,116,104,101,114,32,105,110,105,116,105,97,108,32,101,113,117,97,116,105,111,110,115,32,110,111,114,32,105,110,105,116,105,97,108,32,97,108,103,111,114,105,116,104,109,115,41,0,91,37,115,58,37,100,58,37,100,45,37,100,58,37,100,58,37,115,93,0,0,0,0,0,32,73,79,0,0,0,0,0,111,117,116,112,117,116,32,116,104,101,32,118,97,114,105,97,98,108,101,115,32,97,44,32,98,32,97,110,100,32,99,32,97,116,32,116,104,101,32,101,110,100,32,111,102,32,116,104,101,32,115,105,109,117,108,97,116,105,111,110,32,116,111,32,116,104,101,32,115,116,97,110,100,97,114,100,32,111,117,116,112,117,116,0,0,0,0,0,60,47,102,117,110,99,116,105,111,110,115,62,10,0,0,0,120,109,108,0,0,0,0,0,110,112,115,116,114,32,105,110,32,115,101,116,117,112,32,102,105,108,101,58,32,37,108,100,32,102,114,111,109,32,109,111,100,101,108,32,99,111,100,101,58,32,37,108,100,0,0,0,110,111,32,118,97,114,105,97,98,108,101,115,32,116,111,32,105,110,105,116,105,97,108,105,122,101,0,0,0,0,0,0,97,100,100,105,116,105,111,110,97,108,32,105,110,102,111,114,109,97,116,105,111,110,32,97,98,111,117,116,32,116,104,101,32,122,101,114,111,99,114,111,115,115,105,110,103,115,0,0,105,110,116,101,114,110,97,108,0,0,0,0,0,0,0,0,47,104,111,109,101,47,116,115,104,111,114,116,47,111,109,47,98,117,105,108,100,47,108,105,98,47,111,109,108,105,98,114,97,114,121,47,77,111,100,101,108,105,99,97,32,51,46,50,46,49,47,69,108,101,99,116,114,105,99,97,108,47,65,110,97,108,111,103,47,69,120,97,109,112,108,101,115,47,85,116,105,108,105,116,105,101,115,47,78,111,110,108,105,110,101,97,114,82,101,115,105,115,116,111,114,46,109,111,0,0,0,0,100,111,32,110,111,116,32,101,109,105,116,32,101,118,101,110,116,32,112,111,105,110,116,115,32,116,111,32,116,104,101,32,114,101,115,117,108,116,32,102,105,108,101,0,0,0,0,0,63,63,63,0,0,0,0,0,60,102,117,110,99,116,105,111,110,115,62,10,0,0,0,0,91,117,110,107,110,111,119,110,32,102,108,97,103,45,116,121,112,101,93,32,60,45,37,115,62,0,0,0,0,0,0,0,110,121,98,111,111,108,32,105,110,32,115,101,116,117,112,32,102,105,108,101,58,32,37,108,100,32,102,114,111,109,32,109,111,100,101,108,32,99,111,100,101,58,32,37,108,100,0,0,67,97,110,110,111,116,32,105,110,105,116,105,97,108,105,122,101,32,117,110,105,113,117,101,32,116,104,101,32,100,121,110,97,109,105,99,32,115,116,97,116,101,32,115,101,108,101,99,116,105,111,110,46,32,85,115,101,32,45,108,118,32,76,79,71,95,68,83,83,32,116,111,32,115,101,101,32,116,104,101,32,115,119,105,116,99,104,105,110,103,32,115,116,97,116,101,32,115,101,116,46,0,0,0,101,120,116,101,114,110,97,108,0,0,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,65,84,32,67,85,82,82,69,78,84,32,84,32,40,61,82,49,41,32,32,53,48,48,32,83,84,69,80,83,0,0,100,111,32,110,111,116,32,101,109,105,116,32,97,110,121,32,114,101,115,117,108,116,115,32,116,111,32,116,104,101,32,114,101,115,117,108,116,32,102,105,108,101,0,0,0,0,0,0,97,100,100,105,116,105,111,110,97,108,32,115,116,97,116,105,115,116,105,99,115,32,97,98,111,117,116,32,116,105,109,101,114,47,101,118,101,110,116,115,47,115,111,108,118,101,114,0,60,47,118,97,114,105,97,98,108,101,115,62,10,0,0,0,60,45,37,115,61,118,97,108,117,101,62,32,111,114,32,60,45,37,115,32,118,97,108,117,101,62,10,32,32,37,115,0,110,112,98,111,111,108,32,105,110,32,115,101,116,117,112,32,102,105,108,101,58,32,37,108,100,32,102,114,111,109,32,109,111,100,101,108,32,99,111,100,101,58,32,37,108,100,0,0,37,115,0,0,0,0,0,0,117,110,102,111,114,109,97,116,116,101,100,0,0,0,0,0,35,0,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,82,85,78,32,84,69,82,77,73,78,65,84,69,68,46,32,65,80,80,65,82,69,78,84,32,73,78,70,73,78,73,84,69,32,76,79,79,80,0,100,105,114,101,99,116,32,105,111,32,110,111,116,32,97,108,108,111,119,101,100,0,0,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,116,104,101,32,110,111,110,108,105,110,101,97,114,32,115,111,108,118,101,114,0,0,0,0,102,105,110,97,108,32,115,111,108,117,116,105,111,110,32,111,102,32,116,104,101,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,0,0,0,0,60,118,97,114,105,97,98,108,101,115,62,10,0,0,0,0,60,45,37,115,62,10,32,32,37,115,0,0,0,0,0,0,110,121,105,110,116,32,105,110,32,115,101,116,117,112,32,102,105,108,101,58,32,37,108,100,32,102,114,111,109,32,109,111,100,101,108,32,99,111,100,101,58,32,37,108,100,0,0,0,108,97,109,98,100,97,32,61,32,37,103,32,100,111,110,101,0,0,0,0,0,0,0,0,116,105,99,107,95,116,112,32,33,61,32,48,0,0,0,0,102,111,114,109,97,116,116,101,100,0,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,82,69,80,69,65,84,69,68,32,79,67,67,85,82,82,69,78,67,69,83,32,79,70,32,73,76,76,69,71,65,76,32,73,78,80,85,84,0,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,116,104,101,32,111,117,116,112,117,116,32,102,111,114,109,97,116,32,111,102,32,116,104,101,32,109,101,97,115,117,114,101,32,116,105,109,101,32,102,117,110,99,116,105,111,110,97,108,105,116,121,0,0,0,0,0,97,100,100,105,116,105,111,110,97,108,32,105,110,102,111,114,109,97,116,105,111,110,32,97,98,111,117,116,32,115,111,108,118,101,114,32,112,114,111,99,101,115,115,0,0,0,0,0,60,47,112,114,111,102,105,108,105,110,103,100,97,116,97,104,101,97,100,101,114,62,10,0,117,115,97,103,101,58,32,37,115,0,0,0,0,0,0,0,110,112,105,110,116,32,105,110,32,115,101,116,117,112,32,102,105,108,101,58,32,37,108,100,32,102,114,111,109,32,109,111,100,101,108,32,99,111,100,101,58,32,37,108,100,0,0,0,104,111,109,111,116,111,112,121,32,112,114,111,99,101,115,115,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,100,105,114,101,99,116,0,0,32,32,32,32,32,32,32,32,32,84,79,79,32,78,69,65,82,32,84,79,32,84,72,69,32,73,78,73,84,73,65,76,32,80,79,73,78,84,0,0,91,115,116,114,105,110,103,32,108,105,115,116,93,32,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,116,104,101,32,108,111,103,103,105,110,103,32,108,101,118,101,108,0,105,110,118,97,108,105,100,32,108,105,115,116,45,110,111,100,101,0,0,0,0,0,0,0,97,100,100,105,116,105,111,110,97,108,32,105,110,102,111,114,109,97,116,105,111,110,32,97,98,111,117,116,32,115,105,109,117,108,97,116,105,111,110,32,112,114,111,99,101,115,115,0,60,112,114,111,102,105,108,105,110,103,100,97,116,97,104,101,97,100,101,114,62,10,0,0,114,101,99,111,103,110,105,122,101,100,32,115,111,108,118,101,114,58,32,37,115,0,0,0,110,112,32,105,110,32,115,101,116,117,112,32,102,105,108,101,58,32,37,108,100,32,102,114,111,109,32,109,111,100,101,108,32,99,111,100,101,58,32,37,108,100,0,0,0,0,0,0,83,101,116,32,116,111,108,101,114,97,110,99,101,32,102,111,114,32,122,101,114,111,45,99,114,111,115,115,105,110,103,32,104,121,115,116,101,114,101,115,105,115,32,116,111,58,32,37,101,0,0,0,0,0,0,0,101,114,114,111,114,32,97,108,108,111,99,97,116,105,110,103,32,101,120,116,101,114,110,97,108,32,111,98,106,101,99,116,115,0,0,0,0,0,0,0,115,101,113,117,101,110,116,105,97,108,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,79,78,69,32,79,82,32,77,79,82,69,32,67,79,77,80,79,78,69,78,84,83,32,79,70,32,71,32,72,65,83,32,65,32,82,79,79,84,0,110,111,32,101,108,101,109,101,110,116,32,102,111,117,110,100,0,0,0,0,0,0,0,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,116,104,101,32,108,105,110,101,97,114,32,115,111,108,118,101,114,32,109,101,116,104,111,100,32,102,111,114,32,105,112,111,112,116,0,0,0,0,0,0,111,117,116,112,117,116,115,32,114,101,115,105,100,117,97,108,115,32,111,102,32,116,104,101,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,0,60,47,109,111,100,101,108,105,110,102,111,95,101,120,116,62,10,0,0,0,0,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,111,112,116,105,111,110,32,45,115,32,37,115,0,0,0,0,0,0,0,110,121,32,105,110,32,115,101,116,117,112,32,102,105,108,101,58,32,37,108,100,32,102,114,111,109,32,109,111,100,101,108,32,99,111,100,101,58,32,37,108,100,0,0,0,0,0,0,100,97,115,115,108,32,119,105,116,104,32,99,111,108,111,114,101,100,32,110,117,109,101,114,105,99,97,108,32,106,97,99,111,98,105,97,110,44,32,119,105,116,104,32,105,110,116,101,114,118,97,108,32,114,111,111,116,32,102,105,110,100,105,110,103,0,0,0,0,0,0,0,114,43,98,0,0,0,0,0,117,110,98,97,108,97,110,99,101,100,32,99,111,109,109,97,110,100,32,108,105,110,101,32,102,108,97,103,32,115,116,114,117,99,116,117,114,101,58,32,70,76,65,71,95,68,69,83,67,0,0,0,0,0,0,0,37,115,58,32,69,114,114,111,114,58,32,102,97,105,108,101,100,32,116,111,32,114,101,97,100,32,116,104,101,32,88,77,76,32,102,105,108,101,32,37,115,58,32,37,115,32,97,116,32,108,105,110,101,32,37,108,117,0,0,0,0,0,0,0,119,114,105,116,105,110,103,0,68,65,83,83,76,45,45,32,32,78,71,32,40,61,73,49,41,32,46,76,84,46,32,48,0,0,0,0,0,0,0,0,115,101,116,32,116,101,114,109,105,110,97,108,32,115,118,103,10,0,0,0,0,0,0,0,119,114,105,116,101,32,105,110,32,106,97,99,91,37,100,93,45,91,37,100,44,37,100,93,61,37,103,32,102,114,111,109,32,114,111,119,91,37,100,93,61,37,103,0,0,0,0,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,116,104,101,32,108,105,110,101,97,114,32,115,111,108,118,101,114,32,109,101,116,104,111,100,0,0,0,0,0,0,0,0,37,45,49,56,115,32,91,37,115,93,0,0,0,0,0,0,69,114,114,111,114,44,32,99,111,117,108,100,110,39,116,32,99,114,101,97,116,101,32,111,117,116,112,117,116,32,102,105,108,101,58,32,91,37,115,93,32,98,101,99,97,117,115,101,32,111,102,32,37,115,0,0,119,116,0,0,0,0,0,0,69,114,114,111,114,32,105,110,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,46,32,73,110,99,111,110,115,105,115,116,101,110,116,32,105,110,105,116,105,97,108,32,99,111,110,100,105,116,105,111,110,115,46,0,0,0,0,0,0,0,76,79,71,95,68,69,66,85,71,0,0,0,0,0,0,0,112,114,101,102,105,120,32,109,117,115,116,32,110,111,116,32,98,101,32,98,111,117,110,100,32,116,111,32,111,110,101,32,111,102,32,116,104,101,32,114,101,115,101,114,118,101,100,32,110,97,109,101,115,112,97,99,101,32,110,97,109,101,115,0,91,37,108,100,93,32,112,97,114,97,109,101,116,101,114,32,82,101,97,108,32,37,115,40,115,116,97,114,116,61,37,103,44,32,110,111,109,105,110,97,108,61,37,103,41,32,61,32,37,103,0,0,0,0,0,0,102,111,114,109,97,116,32,116,111,111,32,99,111,109,112,108,105,99,97,116,101,100,58,10,0,0,0,0,0,0,0,0,108,101,97,115,116,32,115,113,117,97,114,101,32,118,97,108,117,101,58,32,37,103,0,0,69,114,114,111,114,44,32,115,105,110,103,117,108,97,114,32,74,97,99,111,98,105,97,110,32,102,111,114,32,100,121,110,97,109,105,99,32,115,116,97,116,101,32,115,101,108,101,99,116,105,111,110,32,97,116,32,116,105,109,101,32,37,102,10,85,115,101,32,45,108,118,32,76,79,71,95,68,83,83,95,74,65,67,32,116,111,32,103,101,116,32,116,104,101,32,74,97,99,111,98,105,97,110,0,82,101,102,101,114,101,110,99,101,100,32,39,37,115,39,32,116,104,97,116,32,119,97,115,32,110,111,116,32,100,101,99,108,97,114,101,100,32,97,115,32,60,118,97,114,105,97,98,108,101,62,0,0,0,0,0,7,0,0,0,0,0,0,0,111,117,116,112,117,116,115,32,101,118,101,114,121,32,101,118,97,108,117,97,116,105,111,110,32,111,102,32,116,104,101,32,114,101,115,105,100,117,97,108,32,102,117,110,99,116,105,111,110,0,0,0,0,0,0,0,60,111,100,101,84,105,109,101,84,105,99,107,115,62,37,108,117,60,47,111,100,101,84,105,109,101,84,105,99,107,115,62,10,0,0,0,0,0,0,0,65,108,108,111,99,97,116,101,100,32,115,105,109,117,108,97,116,105,111,110,32,114,101,115,117,108,116,32,100,97,116,97,32,115,116,111,114,97,103,101,32,102,111,114,32,109,101,116,104,111,100,32,39,37,115,39,32,97,110,100,32,102,105,108,101,61,39,37,115,39,0,0,110,120,32,105,110,32,115,101,116,117,112,32,102,105,108,101,58,32,37,108,100,32,102,114,111,109,32,109,111,100,101,108,32,99,111,100,101,58,32,37,100,0,0,0,0,0,0,0,116,101,114,109,105,110,97,108,32,101,118,101,110,116,32,97,116,32,115,116,111,112,32,116,105,109,101,32,37,103,0,0,44,37,115,61,34,37,115,34,0,0,0,0,0,0,0,0,78,76,83,95,77,65,88,0,67,49,46,118,32,60,32,40,45,78,114,46,86,101,41,0,89,111,117,114,32,109,101,109,111,114,121,32,105,115,32,110,111,116,32,115,116,114,111,110,103,32,101,110,111,117,103,104,32,102,111,114,32,111,117,114,32,82,105,110,103,98,117,102,102,101,114,33,0,0,0,0,114,101,97,100,105,110,103,0,68,65,83,83,76,45,45,32,32,84,79,85,84,32,40,61,82,49,41,32,73,83,32,69,81,85,65,76,32,84,79,32,84,32,40,61,82,50,41,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,116,104,101,32,108,111,103,32,102,111,114,109,97,116,32,111,102,32,116,104,101,32,101,120,101,99,117,116,97,98,108,101,46,32,45,108,111,103,70,111,114,109,97,116,61,116,101,120,116,32,40,100,101,102,97,117,108,116,41,32,111,114,32,45,108,111,103,70,111,114,109,97,116,61,120,109,108,0,0,0,98,105,110,84,114,97,110,115,0,0,0,0,0,0,0,0,114,101,115,101,114,118,101,100,32,112,114,101,102,105,120,32,40,120,109,108,110,115,41,32,109,117,115,116,32,110,111,116,32,98,101,32,100,101,99,108,97,114,101,100,32,111,114,32,117,110,100,101,99,108,97,114,101,100,0,0,0,0,0,0,111,117,116,112,117,116,115,32,116,104,101,32,106,97,99,111,98,105,97,110,32,111,102,32,110,111,110,108,105,110,101,97,114,32,115,121,115,116,101,109,115,0,0,0,0,0,0,0,60,111,100,101,84,105,109,101,62,37,102,60,47,111,100,101,84,105,109,101,62,10,0,0,85,110,107,110,111,119,110,32,111,117,116,112,117,116,32,102,111,114,109,97,116,58,32,0,69,114,114,111,114,44,32,105,110,112,117,116,32,100,97,116,97,32,102,105,108,101,32,100,111,101,115,32,110,111,116,32,109,97,116,99,104,32,109,111,100,101,108,46,0,0,0,0,44,37,115,61,37,105,0,0,99,97,108,108,32,115,111,108,118,101,114,32,102,114,111,109,32,37,103,32,116,111,32,37,103,32,40,115,116,101,112,83,105,122,101,58,32,37,103,41,0,0,0,0,0,0,0,0,84,104,101,32,99,111,100,101,32,104,97,115,32,101,110,99,111,117,110,116,101,114,101,100,32,116,114,111,117,98,108,101,32,102,114,111,109,32,119,104,105,99,104,32,105,116,32,99,97,110,110,111,116,32,114,101,99,111,118,101,114,46,0,0,108,97,116,101,108,121,32,37,115,32,37,115,32,37,115,32,37,115,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,77,85,32,40,61,73,49,41,32,73,76,76,69,71,65,76,46,32,69,73,84,72,69,82,32,46,76,84,46,32,48,32,79,82,32,46,71,84,46,32,78,69,81,0,0,0,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,97,32,116,105,109,101,32,119,104,101,114,101,32,116,104,101,32,108,105,110,101,97,114,105,122,97,116,105,111,110,32,111,102,32,116,104,101,32,109,111,100,101,108,32,115,104,111,117,108,100,32,98,101,32,112,101,114,102,111,114,109,101,100,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,114,101,115,101,114,118,101,100,32,112,114,101,102,105,120,32,40,120,109,108,41,32,109,117,115,116,32,110,111,116,32,98,101,32,117,110,100,101,99,108,97,114,101,100,32,111,114,32,98,111,117,110,100,32,116,111,32,97,110,111,116,104,101,114,32,110,97,109,101,115,112,97,99,101,32,110,97,109,101,0,100,117,109,109,121,86,97,114,83,116,97,116,101,83,101,116,74,97,99,0,0,0,0,0,60,109,111,100,101,108,105,110,102,111,95,101,120,116,62,10,0,0,0,0,0,0,0,0,118,101,114,98,111,115,101,32,108,111,103,103,105,110,103,32,111,102,32,110,111,110,108,105,110,101,97,114,32,115,121,115,116,101,109,115,0,0,0,0,112,108,116,0,0,0,0,0,110,117,109,98,101,114,79,102,83,116,114,105,110,103,65,108,103,101,98,114,97,105,99,86,97,114,105,97,98,108,101,115,0,0,0,0,0,0,0,0,37,115,95,104,111,109,111,116,111,112,121,46,99,115,118,0,44,37,115,61,37,108,105,0,68,68,65,83,83,76,32,102,97,105,108,101,100,32,116,111,32,99,111,109,112,117,116,101,32,116,104,101,32,105,110,105,116,105,97,108,32,89,80,82,73,77,69,46,0,0,0,0,124,32,115,111,108,118,101,114,32,124,32,85,115,101,32,115,111,108,118,101,114,32,109,101,116,104,111,100,58,32,37,115,9,37,115,0,0,0,0,0,108,97,115,116,32,102,111,114,109,97,116,58,32,37,115,10,0,0,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,77,76,32,40,61,73,49,41,32,73,76,76,69,71,65,76,46,32,69,73,84,72,69,82,32,46,76,84,46,32,48,32,79,82,32,46,71,84,46,32,78,69,81,0,0,0,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,116,104,101,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,32,111,112,116,105,109,105,122,97,116,105,111,110,32,109,101,116,104,111,100,0,0,84,79,68,79,58,32,83,101,116,32,109,101,32,117,112,33,33,33,0,0,0,0,0,0,60,47,109,111,100,101,108,105,110,102,111,62,10,0,0,0,108,111,103,103,105,110,103,32,102,111,114,32,110,111,110,108,105,110,101,97,114,32,115,121,115,116,101,109,115,0,0,0,119,97,108,108,0,0,0,0,110,117,109,98,101,114,79,102,83,116,114,105,110,103,80,97,114,97,109,101,116,101,114,115,0,0,0,0,0,0,0,0,44,37,115,61,37,46,50,48,103,0,0,0,0,0,0,0,99,97,110,110,111,116,32,115,117,115,112,101,110,100,32,105,110,32,101,120,116,101,114,110,97,108,32,112,97,114,97,109,101,116,101,114,32,101,110,116,105,116,121,0,0,0,0,0,73,82,69,83,32,101,113,117,97,108,32,116,111,32,45,50,32,119,97,115,32,101,110,99,111,117,110,116,101,114,101,100,32,97,110,100,32,99,111,110,116,114,111,108,32,105,115,32,98,101,105,110,103,32,114,101,116,117,114,110,101,100,32,116,111,32,116,104,101,32,99,97,108,108,105,110,103,32,112,114,111,103,114,97,109,46,0,0,97,112,112,97,114,101,110,116,32,115,116,97,116,101,58,32,105,110,116,101,114,110,97,108,32,73,47,79,10,0,0,0,68,65,83,83,76,45,45,32,32,73,78,70,79,40,52,41,61,49,32,65,78,68,32,84,83,84,79,80,32,40,61,82,49,41,32,66,69,72,73,78,68,32,84,32,40,61,82,50,41,0,0,0,0,0,0,0,115,112,101,99,105,102,121,32,105,110,116,101,114,97,99,116,105,118,101,32,115,105,109,117,108,97,116,105,111,110,0,0,86,97,114,105,97,98,108,101,32,78,114,46,71,98,32,111,117,116,32,111,102,32,91,109,105,110,44,32,109,97,120,93,32,105,110,116,101,114,118,97,108,58,32,78,114,46,71,98,32,62,61,32,45,49,46,48,32,104,97,115,32,118,97,108,117,101,58,32,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,112,97,114,115,105,110,103,32,102,105,110,105,115,104,101,100,0,0,0,0,0,0,0,0,35,70,73,88,77,69,35,0,60,109,97,120,84,105,109,101,62,37,46,57,102,60,47,109,97,120,84,105,109,101,62,10,0,0,0,0,0,0,0,0,118,101,114,98,111,115,101,32,108,111,103,103,105,110,103,32,111,102,32,108,105,110,101,97,114,32,115,121,115,116,101,109,115,0,0,0,0,0,0,0,109,97,116,0,0,0,0,0,110,117,109,98,101,114,79,102,66,111,111,108,101,97,110,65,108,103,101,98,114,97,105,99,86,97,114,105,97,98,108,101,115,0,0,0,0,0,0,0,105,110,118,0,0,0,0,0,35,35,35,32,69,78,68,32,73,78,73,84,73,65,76,73,90,65,84,73,79,78,32,35,35,35,0,0,0,0,0,0,116,105,109,101,61,37,46,50,48,103,0,0,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,65,32,77,111,100,101,108,105,99,97,32,97,115,115,101,114,116,32,112,114,101,118,101,110,116,115,32,116,104,101,32,105,110,116,101,103,114,97,116,111,114,32,116,111,32,99,111,110,116,105,110,117,101,46,32,70,111,114,32,109,111,114,101,32,105,110,102,111,114,109,97,116,105,111,110,32,117,115,101,32,45,108,118,32,76,79,71,95,68,68,65,83,82,84,0,0,40,117,110,110,97,109,101,100,41,10,0,0,0,0,0,0,68,65,83,83,76,45,45,32,84,79,85,84,32,40,61,82,49,41,32,84,79,79,32,67,76,79,83,69,32,84,79,32,84,32,40,61,82,50,41,32,84,79,32,83,84,65,82,84,32,73,78,84,69,71,82,65,84,73,79,78,0,0,0,0,91,105,110,116,93,32,100,101,102,97,117,108,116,58,32,49,0,0,0,0,0,0,0,0,60,118,97,114,62,45,116,97,103,32,100,105,100,32,110,111,116,32,115,101,116,32,110,97,109,101,32,97,110,100,32,99,111,109,109,101,110,116,0,0,60,110,117,109,83,116,101,112,62,37,100,60,47,110,117,109,83,116,101,112,62,10,0,0,108,111,103,103,105,110,103,32,102,111,114,32,108,105,110,101,97,114,32,115,121,115,116,101,109,115,0,0,0,0,0,0,99,115,118,0,0,0,0,0,110,117,109,98,101,114,79,102,66,111,111,108,101,97,110,80,97,114,97,109,101,116,101,114,115,0,0,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,111,112,116,105,111,110,32,45,105,105,109,0,112,97,114,115,105,110,103,32,97,98,111,114,116,101,100,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,84,104,101,32,99,111,114,114,101,99,116,111,114,32,99,111,117,108,100,32,110,111,116,32,99,111,110,118,101,114,103,101,46,32,84,104,101,114,101,32,119,101,114,101,32,114,101,112,101,97,116,101,100,32,101,114,114,111,114,32,116,101,115,116,32,102,97,105,108,117,114,101,115,32,105,110,32,116,104,105,115,32,115,116,101,112,46,0,110,97,109,101,100,32,37,115,10,0,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,83,79,77,69,32,69,76,69,77,69,78,84,32,79,70,32,87,84,32,73,83,32,46,76,69,46,32,48,46,48,0,91,100,111,117,98,108,101,93,32,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,97,32,116,105,109,101,32,102,111,114,32,116,104,101,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,32,111,102,32,116,104,101,32,109,111,100,101,108,0,0,0,0,0,117,110,102,111,114,109,97,116,116,101,100,32,105,111,32,110,111,116,32,97,108,108,111,119,101,100,0,0,0,0,0,0,99,111,109,109,101,110,116,0,60,116,111,116,97,108,83,116,101,112,115,84,105,109,101,62,37,102,60,47,116,111,116,97,108,83,116,101,112,115,84,105,109,101,62,10,0,0,0,0,111,117,116,112,117,116,115,32,116,104,101,32,106,97,99,111,98,105,97,110,32,109,97,116,114,105,120,32,117,115,101,100,32,98,121,32,100,97,115,115,108,0,0,0,0,0,0,0,101,109,112,116,121,0,0,0,110,117,109,98,101,114,79,102,73,110,116,101,103,101,114,65,108,103,101,98,114,97,105,99,86,97,114,105,97,98,108,101,115,0,0,0,0,0,0,0,111,112,116,105,109,105,122,97,116,105,111,110,32,109,101,116,104,111,100,58,32,32,32,37,45,49,53,115,32,91,37,115,93,0,0,0,0,0,0,0,83,116,97,114,116,32,110,117,109,101,114,105,99,97,108,32,115,111,108,118,101,114,32,102,114,111,109,32,37,103,32,116,111,32,37,103,0,0,0,0,116,111,116,97,108,95,116,112,32,33,61,32,48,0,0,0,112,97,114,115,101,114,32,110,111,116,32,115,117,115,112,101,110,100,101,100,0,0,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,84,104,101,32,109,97,116,114,105,120,32,111,102,32,112,97,114,116,105,97,108,32,100,101,114,105,118,97,116,105,118,101,115,32,105,115,32,115,105,110,103,117,108,97,114,46,0,0,97,112,112,97,114,101,110,116,32,115,116,97,116,101,58,32,117,110,105,116,32,37,100,32,0,0,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,73,78,70,79,40,56,41,61,49,32,65,78,68,32,72,48,61,48,46,48,0,0,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,116,104,101,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,32,109,101,116,104,111,100,0,0,0,0,0,0,0,112,97,114,115,101,114,32,115,117,115,112,101,110,100,101,100,0,0,0,0,0,0,0,0,83,79,77,69,32,78,73,67,69,32,69,81,85,65,84,73,79,78,32,78,65,77,69,32,40,116,111,32,98,101,32,115,101,116,32,97,32,108,105,116,116,108,101,32,108,97,116,101,114,41,0,0,0,0,0,0,60,116,111,116,97,108,84,105,109,101,62,37,102,60,47,116,111,116,97,108,84,105,109,101,62,10,0,0,0,0,0,0,109,111,114,101,32,105,110,102,111,114,109,97,116,105,111,110,32,102,114,111,109,32,73,112,111,112,116,0,0,0,0,0,115,118,103,0,0,0,0,0,110,117,109,98,101,114,79,102,73,110,116,101,103,101,114,80,97,114,97,109,101,116,101,114,115,0,0,0,0,0,0,0,97,108,115,0,0,0,0,0,105,110,105,116,105,97,108,105,122,97,116,105,111,110,32,109,101,116,104,111,100,58,32,37,45,49,53,115,32,91,37,115,93,0,0,0,0,0,0,0,82,101,99,111,103,110,105,122,101,100,32,115,111,108,118,101,114,58,32,105,110,108,105,110,101,45,114,117,110,103,101,107,117,116,116,97,44,32,98,117,116,32,116,104,101,32,101,120,101,99,117,116,97,98,108,101,32,119,97,115,32,110,111,116,32,99,111,109,112,105,108,101,100,32,119,105,116,104,32,115,117,112,112,111,114,116,32,102,111,114,32,105,116,46,32,67,111,109,112,105,108,101,32,119,105,116,104,32,45,68,95,79,77,67,95,73,78,76,73,78,69,95,82,75,46,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,84,104,101,32,99,111,114,114,101,99,116,111,114,32,99,111,117,108,100,32,110,111,116,32,99,111,110,118,101,114,103,101,46,0,0,0,0,0,0,0,37,115,58,32,37,115,10,0,68,65,83,83,76,45,45,32,32,84,79,85,84,32,40,61,82,49,41,32,66,69,72,73,78,68,32,84,32,40,61,82,50,41,0,0,0,0,0,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,97,110,32,101,120,116,101,114,110,97,108,32,102,105,108,101,32,102,111,114,32,116,104,101,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,32,111,102,32,116,104,101,32,109,111,100,101,108,0,0,0,0,105,110,118,97,108,105,100,32,102,105,115,116,32,108,105,115,116,45,112,111,105,110,116,101,114,0,0,0,0,0,0,0,37,115,58,32,73,110,102,111,32,88,77,76,32,37,115,32,103,111,116,32,101,113,117,97,116,105,111,110,32,119,105,116,104,32,105,110,100,101,120,32,37,108,100,44,32,101,120,112,101,99,116,101,100,32,37,108,100,0,0,0,0,0,0,0,60,108,105,110,101,97,114,105,122,101,84,105,109,101,62,37,102,60,47,108,105,110,101,97,114,105,122,101,84,105,109,101,62,10,0,0,0,0,0,0,97,100,100,105,116,105,111,110,97,108,32,105,110,102,111,114,109,97,116,105,111,110,32,100,117,114,105,110,103,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,0,0,0,0,95,112,114,111,102,46,112,108,116,0,0,0,0,0,0,0,110,117,109,98,101,114,79,102,82,101,97,108,80,97,114,97,109,101,116,101,114,115,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,111,112,116,105,111,110,32,45,105,111,109,32,37,115,0,0,0,0,0,105,108,108,101,103,97,108,32,99,104,97,114,97,99,116,101,114,40,115,41,32,105,110,32,112,117,98,108,105,99,32,105,100,0,0,0,0,0,0,0,68,68,65,83,83,76,32,104,97,100,32,114,101,112,101,97,116,101,100,32,101,114,114,111,114,32,116,101,115,116,32,102,97,105,108,117,114,101,115,32,111,110,32,116,104,101,32,108,97,115,116,32,97,116,116,101,109,112,116,101,100,32,115,116,101,112,46,0,0,0,0,0,37,115,58,32,101,110,100,32,111,102,32,102,105,108,101,10,0,0,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,72,77,65,88,32,40,61,82,49,41,32,46,76,84,46,32,48,46,48,0,0,0,0,115,121,110,116,97,120,32,101,114,114,111,114,0,0,0,0,103,101,116,32,100,101,116,97,105,108,101,100,32,105,110,102,111,114,109,97,116,105,111,110,32,116,104,97,116,32,115,112,101,99,105,102,105,101,115,32,116,104,101,32,99,111,109,109,97,110,100,45,108,105,110,101,32,102,108,97,103,0,0,0,114,101,99,101,110,100,0,0,37,35,46,42,102,0,0,0,115,116,97,114,116,0,0,0,37,115,58,32,73,110,102,111,32,88,77,76,32,37,115,32,99,111,110,116,97,105,110,101,100,32,101,113,117,97,116,105,111,110,32,119,105,116,104,111,117,116,32,105,110,100,101,120,0,0,0,0,0,0,0,0,60,111,117,116,112,117,116,84,105,109,101,62,37,102,60,47,111,117,116,112,117,116,84,105,109,101,62,10,0,0,0,0,118,101,114,98,111,115,101,32,108,111,103,103,105,110,103,32,111,102,32,101,118,101,110,116,32,115,121,115,116,101,109,0,95,112,114,111,102,46,120,109,108,0,0,0,0,0,0,0,110,117,109,98,101,114,79,102,82,101,97,108,65,108,103,101,98,114,97,105,99,86,97,114,105,97,98,108,101,115,0,0,84,105,109,101,0,0,0,0,82,101,99,111,103,110,105,122,101,100,32,115,111,108,118,101,114,58,32,105,110,108,105,110,101,45,101,117,108,101,114,44,32,98,117,116,32,116,104,101,32,101,120,101,99,117,116,97,98,108,101,32,119,97,115,32,110,111,116,32,99,111,109,112,105,108,101,100,32,119,105,116,104,32,115,117,112,112,111,114,116,32,102,111,114,32,105,116,46,32,67,111,109,112,105,108,101,32,119,105,116,104,32,45,68,95,79,77,67,95,73,78,76,73,78,69,95,69,85,76,69,82,46,0,0,0,0,0,116,101,120,116,32,100,101,99,108,97,114,97,116,105,111,110,32,110,111,116,32,119,101,108,108,45,102,111,114,109,101,100,0,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,84,104,101,32,101,114,114,111,114,32,116,111,108,101,114,97,110,99,101,115,32,97,114,101,32,116,111,111,32,115,116,114,105,110,103,101,110,116,0,0,117,110,98,97,108,97,110,99,101,100,32,99,111,109,109,97,110,100,32,108,105,110,101,32,102,108,97,103,32,115,116,114,117,99,116,117,114,101,58,32,70,76,65,71,95,78,65,77,69,0,0,0,0,0,0,0,68,117,109,109,121,32,101,113,117,97,116,105,111,110,32,115,111,32,119,101,32,99,97,110,32,105,110,100,101,120,32,102,114,111,109,32,49,0,0,0,37,115,58,32,105,108,108,101,103,97,108,32,101,114,114,111,114,32,110,117,109,98,101,114,32,37,100,10,0,0,0,0,68,65,83,83,76,45,45,32,32,73,78,70,79,40,52,41,32,61,32,49,32,65,78,68,32,84,83,84,79,80,32,40,61,82,49,41,32,66,69,72,73,78,68,32,84,79,85,84,32,40,61,82,50,41,0,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,37,115,58,32,37,115,10,0,0,115,101,101,100,58,32,100,97,116,97,45,62,115,105,109,117,108,97,116,105,111,110,73,110,102,111,46,97,110,97,108,121,116,105,99,74,97,99,111,98,105,97,110,115,91,105,110,100,101,120,93,46,115,101,101,100,86,97,114,115,91,37,100,93,61,32,37,102,0,0,0,0,118,97,108,117,101,32,115,112,101,99,105,102,105,101,115,32,97,32,110,101,119,32,115,101,116,117,112,32,88,77,76,32,102,105,108,101,32,116,111,32,116,104,101,32,103,101,110,101,114,97,116,101,100,32,115,105,109,117,108,97,116,105,111,110,32,99,111,100,101,0,0,0,99,117,114,114,101,110,116,32,111,112,116,105,111,110,115,32,97,114,101,58,0,0,0,0,117,116,105,108,47,114,101,97,100,95,109,97,116,108,97,98,52,46,99,0,0,0,0,0,99,111,110,116,105,110,117,111,117,115,0,0,0,0,0,0,80,0,0,0,0,0,0,0,37,115,95,105,110,105,116,80,97,116,104,46,99,115,118,0,69,114,114,111,114,32,105,110,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,46,32,83,111,108,118,101,114,32,105,116,101,114,97,116,101,100,32,37,100,32,116,105,109,101,115,32,119,105,116,104,111,117,116,32,102,105,110,100,105,110,103,32,97,32,115,111,108,117,116,105,111,110,0,0,0,0,76,79,71,95,68,68,65,83,82,84,0,0,0,0,0,0,91,37,108,100,93,32,82,101,97,108,32,37,115,40,115,116,97,114,116,61,37,103,44,32,110,111,109,105,110,97,108,61,37,103,41,32,61,32,37,103,0,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,98,97,100,32,115,116,114,105,110,103,0,0,0,0,0,0,108,101,97,115,116,32,115,113,117,97,114,101,32,118,97,108,117,101,58,32,37,103,32,91,115,99,97,108,101,100,58,32,37,103,93,0,0,0,0,0,105,110,100,101,120,0,0,0,12,0,0,0,0,0,0,0,60,101,118,101,110,116,84,105,109,101,62,37,102,60,47,101,118,101,110,116,84,105,109,101,62,10,0,0,0,0,0,0,97,100,100,105,116,105,111,110,97,108,32,105,110,102,111,114,109,97,116,105,111,110,32,100,117,114,105,110,103,32,101,118,101,110,116,32,105,116,101,114,97,116,105,111,110,0,0,0,76,105,110,101,97,114,32,109,111,100,101,108,32,105,115,32,99,114,101,97,116,101,100,33,0,0,0,0,0,0,0,0,110,117,109,98,101,114,79,102,67,111,110,116,105,110,117,111,117,115,83,116,97,116,101,115,0,0,0,0,0,0,0,0,87,114,111,116,101,32,112,97,114,97,109,101,116,101,114,115,32,116,111,32,116,104,101,32,102,105,108,101,32,97,102,116,101,114,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,32,40,102,111,114,32,111,117,116,112,117,116,32,102,111,114,109,97,116,115,32,116,104,97,116,32,115,117,112,112,111,114,116,32,116,104,105,115,41,0,0,0,0,0,0,0,0,118,109,101,116,97,0,0,0,124,32,37,45,49,53,115,32,91,37,115,93,0,0,0,0,110,101,119,116,111,110,0,0,88,77,76,32,100,101,99,108,97,114,97,116,105,111,110,32,110,111,116,32,119,101,108,108,45,102,111,114,109,101,100,0,68,65,83,83,76,45,45,32,32,65,76,76,32,69,76,69,77,69,78,84,83,32,79,70,32,82,84,79,76,32,65,78,68,32,65,84,79,76,32,65,82,69,32,90,69,82,79,0,110,109,76,98,117,102,32,111,118,101,114,102,108,111,119,0,100,117,109,112,115,32,116,104,101,32,99,112,117,45,116,105,109,101,32,105,110,116,111,32,116,104,101,32,114,101,115,117,108,116,115,45,102,105,108,101,0,0,0,0,0,0,0,0,97,98,115,86,97,114,73,110,100,101,120,32,62,32,48,32,38,38,32,97,98,115,86,97,114,73,110,100,101,120,32,60,61,32,114,101,97,100,101,114,45,62,110,118,97,114,0,0,37,115,58,32,73,110,102,111,32,88,77,76,32,37,115,32,99,111,110,116,97,105,110,101,100,32,109,111,114,101,32,101])
.concat([113,117,97,116,105,111,110,115,32,116,104,97,110,32,101,120,112,101,99,116,101,100,32,40,37,108,100,41,0,0,0,0,60,105,110,105,116,84,105,109,101,62,37,102,60,47,105,110,105,116,84,105,109,101,62,10,0,0,0,0,0,0,0,0,111,117,116,112,117,116,115,32,106,97,99,111,98,105,97,110,32,111,102,32,116,104,101,32,100,121,110,97,109,105,99,32,115,116,97,116,101,32,115,101,108,101,99,116,105,111,110,0,79,80,69,78,77,79,68,69,76,73,67,65,72,79,77,69,58,32,37,115,0,0,0,0,83,105,109,117,108,97,116,105,111,110,32,116,105,109,101,32,91,115,93,0,0,0,0,0,73,112,111,112,116,32,105,115,32,110,101,101,100,101,100,32,98,117,116,32,110,111,116,32,97,118,97,105,108,97,98,108,101,46,0,0,0,0,0,0,105,110,99,111,109,112,108,101,116,101,32,109,97,114,107,117,112,32,105,110,32,112,97,114,97,109,101,116,101,114,32,101,110,116,105,116,121,0,0,0,111,102,102,115,101,116,32,118,97,108,117,101,32,102,111,114,32,116,104,101,32,110,101,120,116,32,115,116,101,112,58,32,37,46,49,48,102,0,0,0,70,105,110,105,115,104,101,100,32,68,68,65,83,82,84,32,115,116,101,112,46,0,0,0,110,111,110,45,112,111,115,105,116,105,118,101,32,114,101,99,111,114,100,32,110,117,109,98,101,114,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,83,79,77,69,32,69,76,69,77,69,78,84,32,79,70,32,65,84,79,76,32,73,83,32,46,76,84,46,32,48,0,115,101,108,101,99,116,115,32,116,104,101,32,116,121,112,101,32,111,102,32,99,108,111,99,107,32,116,111,32,117,115,101,32,45,99,108,111,99,107,61,82,84,44,32,45,99,108,111,99,107,61,67,89,67,32,111,114,32,45,99,108,111,99,107,61,67,80,85,0,0,0,0,73,109,112,108,101,109,101,110,116,97,116,105,111,110,32,101,114,114,111,114,58,32,85,110,107,110,111,119,110,32,99,97,115,101,0,0,0,0,0,0,109,117,115,116,32,110,111,116,32,117,110,100,101,99,108,97,114,101,32,112,114,101,102,105,120,0,0,0,0,0,0,0,37,115,58,32,85,110,107,110,111,119,110,32,97,116,116,114,105,98,117,116,101,32,105,110,32,60,105,110,102,111,62,0,60,112,114,101,105,110,105,116,84,105,109,101,62,37,102,60,47,112,114,101,105,110,105,116,84,105,109,101,62,10,0,0,111,117,116,112,117,116,115,32,105,110,102,111,114,109,97,116,105,111,110,32,97,98,111,117,116,32,100,121,110,97,109,105,99,32,115,116,97,116,101,32,115,101,108,101,99,116,105,111,110,0,0,0,0,0,0,0,95,114,101,115,46,0,0,0,79,80,69,78,77,79,68,69,76,73,67,65,72,79,77,69,0,0,0,0,0,0,0,0,115,105,103,115,0,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,111,112,116,105,111,110,32,45,105,105,109,32,37,115,0,0,0,0,0,83,117,110,100,105,97,108,47,107,105,110,115,111,108,32,105,115,32,110,101,101,100,101,100,32,98,117,116,32,110,111,116,32,97,118,97,105,108,97,98,108,101,46,32,80,108,101,97,115,101,32,99,104,111,111,115,101,32,111,116,104,101,114,32,115,111,108,118,101,114,46,0,99,97,108,108,32,101,120,116,101,114,110,97,108,32,79,98,106,101,99,116,32,67,111,110,115,116,114,117,99,116,111,114,115,0,0,0,0,0,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,115,105,109,117,108,97,116,105,111,110,47,115,111,108,118,101,114,47,100,97,115,115,108,46,99,0,0,0,0,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,100,97,115,115,108,32,115,111,108,118,101,114,32,109,101,116,104,111,100,32,37,115,0,0,0,0,0,99,97,110,39,116,32,97,112,112,101,110,100,32,116,111,32,102,105,108,101,0,0,0,0,68,65,83,83,76,45,45,32,32,83,79,77,69,32,69,76,69,77,69,78,84,32,79,70,32,82,84,79,76,32,73,83,32,46,76,84,46,32,48,0,67,111,114,114,117,112,116,32,104,101,97,100,101,114,58,32,100,97,116,97,95,50,32,109,97,116,114,105,120,0,0,0,117,110,98,111,117,110,100,32,112,114,101,102,105,120,0,0,116,114,117,101,0,0,0,0,60,111,118,101,114,104,101,97,100,84,105,109,101,62,37,102,60,47,111,118,101,114,104,101,97,100,84,105,109,101,62,10,0,0,0,0,0,0,0,0,97,100,100,105,116,105,111,110,97,108,32,100,101,98,117,103,32,105,110,102,111,114,109,97,116,105,111,110,0,0,0,0,111,118,101,114,119,114,105,116,101,32,115,111,108,118,101,114,32,109,101,116,104,111,100,58,32,37,115,32,91,102,114,111,109,32,99,111,109,109,97,110,100,32,108,105,110,101,93,0,118,97,114,105,97,98,108,101,32,102,105,108,116,101,114,58,32,37,115,0,0,0,0,0,116,109,101,116,97,0,0,0,35,35,35,32,69,78,68,32,83,84,65,84,73,83,84,73,67,83,32,35,35,35,0,0,69,120,101,99,117,116,105,111,110,32,102,97,105,108,101,100,33,10,0,0,0,0,0,0,91,37,108,100,93,32,37,115,32,61,32,37,99,32,124,32,112,114,101,40,37,115,41,32,61,32,37,99,0,0,0,0,115,97,118,101,32,97,108,108,32,122,101,114,111,99,114,111,115,115,105,110,103,115,32,97,102,116,101,114,32,97,110,32,101,118,101,110,116,0,0,0,49,48,32,43,32,117,105,32,60,32,100,97,115,115,108,68,97,116,97,45,62,108,105,119,0,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,73,87,79,82,75,32,76,69,78,71,84,72,32,78,69,69,68,69,68,44,32,76,69,78,73,87,32,40,61,73,49,41,44,32,69,88,67,69,69,68,83,32,76,73,87,32,40,61,73,50,41,0,0,0,0,39,110,101,119,39,32,102,105,108,101,32,101,120,105,115,116,115,0,0,0,0,0,0,0,84,111,111,32,102,101,119,32,114,111,119,115,32,105,110,32,100,97,116,97,95,50,32,109,97,116,114,105,120,0,0,0,102,97,108,115,101,0,0,0,99,97,110,110,111,116,32,99,104,97,110,103,101,32,115,101,116,116,105,110,103,32,111,110,99,101,32,112,97,114,115,105,110,103,32,104,97,115,32,98,101,103,117,110,0,0,0,0,114,101,97,100,111,110,108,121,0,0,0,0,0,0,0,0,60,111,117,116,112,117,116,70,105,108,101,115,105,122,101,62,37,108,100,60,47,111,117,116,112,117,116,70,105,108,101,115,105,122,101,62,10,0,0,0,97,100,100,105,116,105,111,110,97,108,32,105,110,102,111,114,109,97,116,105,111,110,32,97,98,111,117,116,32,100,97,115,115,108,32,115,111,108,118,101,114,0,0,0,0,0,0,0,76,105,110,101,97,114,105,122,97,116,105,111,110,32,119,105,108,108,32,112,101,114,102,111,114,109,101,100,32,97,116,32,112,111,105,110,116,32,111,102,32,116,105,109,101,58,32,37,102,0,0,0,0,0,0,0,118,97,114,105,97,98,108,101,70,105,108,116,101,114,0,0,111,98,106,115,0,0,0,0,99,112,117,32,116,105,109,101,32,91,115,93,0,0,0,0,35,35,35,32,83,84,65,82,84,32,73,78,73,84,73,65,76,73,90,65,84,73,79,78,32,35,35,35,0,0,0,0,115,111,114,114,121,32,45,32,110,111,32,115,111,108,118,101,114,32,115,116,97,116,105,115,116,105,99,115,32,97,118,97,105,108,97,98,108,101,46,32,91,110,111,116,32,121,101,116,32,105,109,112,108,101,109,101,110,116,101,100,93,0,0,0,83,116,97,99,107,32,111,118,101,114,102,108,111,119,32,100,101,116,101,99,116,101,100,32,97,110,100,32,119,97,115,32,110,111,116,32,99,97,117,103,104,116,46,10,83,101,110,100,32,117,115,32,97,32,98,117,103,32,114,101,112,111,114,116,32,97,116,32,104,116,116,112,115,58,47,47,116,114,97,99,46,111,112,101,110,109,111,100,101,108,105,99,97,46,111,114,103,47,79,112,101,110,77,111,100,101,108,105,99,97,47,110,101,119,116,105,99,107,101,116,10,32,32,32,32,73,110,99,108,117,100,101,32,116,104,101,32,102,111,108,108,111,119,105,110,103,32,116,114,97,99,101,58,10,0,0,0,0,0,0,115,116,97,116,117,115,32,111,102,32,114,101,108,97,116,105,111,110,115,0,0,0,0,0,37,108,100,32,99,104,97,110,103,101,100,32,102,114,111,109,32,37,115,32,116,111,32,99,117,114,114,101,110,116,32,37,115,0,0,0,0,0,0,0,116,111,116,97,108,32,110,117,109,98,101,114,32,111,102,32,101,114,114,111,114,32,116,101,115,116,32,102,97,105,108,117,114,101,115,58,32,37,100,0,99,97,110,39,116,32,119,114,105,116,101,32,102,105,108,101,0,0,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,82,87,79,82,75,32,76,69,78,71,84,72,32,78,69,69,68,69,68,44,32,76,69,78,82,87,32,40,61,73,49,41,44,32,69,88,67,69,69,68,83,32,76,82,87,32,40,61,73,50,41,0,0,0,0,68,65,83,83,76,45,45,32,32,65,67,84,73,79,78,32,87,65,83,32,84,65,75,69,78,46,32,82,85,78,32,84,69,82,77,73,78,65,84,69,68,0,0,0,0,0,0,0,100,97,116,97,95,49,32,109,97,116,114,105,120,32,100,111,101,115,32,110,111,116,32,104,97,118,101,32,49,32,111,114,32,50,32,114,111,119,115,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,114,101,113,117,101,115,116,101,100,32,102,101,97,116,117,114,101,32,114,101,113,117,105,114,101,115,32,88,77,76,95,68,84,68,32,115,117,112,112,111,114,116,32,105,110,32,69,120,112,97,116,0,0,0,0,0,99,111,108,69,110,100,0,0,60,47,111,117,116,112,117,116,70,105,108,101,110,97,109,101,62,10,0,0,0,0,0,0,116,104,105,115,32,115,116,114,101,97,109,32,105,115,32,97,108,119,97,121,115,32,97,99,116,105,118,101,0,0,0,0,111,117,116,112,117,116,32,102,111,114,109,97,116,58,32,37,115,0,0,0,0,0,0,0,116,97,98,115,0,0,0,0,36,99,112,117,84,105,109,101,0,0,0,0,0,0,0,0,91,37,108,100,93,32,83,116,114,105,110,103,32,37,115,40,115,116,97,114,116,61,37,115,41,32,61,32,37,115,32,40,112,114,101,58,32,37,115,41,0,0,0,0,0,0,0,0,77,111,100,101,108,105,99,97,46,69,108,101,99,116,114,105,99,97,108,46,65,110,97,108,111,103,46,69,120,97,109,112,108,101,115,46,67,104,117,97,67,105,114,99,117,105,116,95,105,110,102,111,46,120,109,108,0,0,0,0,0,0,0,0,115,116,114,105,110,103,32,112,97,114,97,109,101,116,101,114,115,0,0,0,0,0,0,0,98,105,115,101,99,116,105,111,110,32,99,104,101,99,107,115,32,102,111,114,32,99,111,110,100,105,116,105,111,110,32,99,104,97,110,103,101,115,0,0,116,111,116,97,108,32,110,117,109,98,101,114,32,111,102,32,99,111,110,118,101,114,103,101,110,99,101,32,116,101,115,116,32,102,97,105,108,117,114,101,115,58,32,37,100,0,0,0,77,111,100,101,108,105,99,97,46,69,108,101,99,116,114,105,99,97,108,46,65,110,97,108,111,103,46,69,120,97,109,112,108,101,115,46,67,104,117,97,67,105,114,99,117,105,116,95,48,54,105,110,122,46,99,0,99,97,110,39,116,32,114,101,97,100,32,102,105,108,101,0,68,65,83,83,76,45,45,32,32,77,65,88,79,82,68,32,40,61,73,49,41,32,78,79,84,32,73,78,32,82,65,78,71,69,0,0,0,0,0,0,99,112,117,0,0,0,0,0,115,116,97,114,116,105,111,0,102,111,114,109,97,116,116,101,100,32,105,111,32,110,111,116,32,97,108,108,111,119,101,100,0,0,0,0,0,0,0,0,100,97,116,97,95,49,32,109,97,116,114,105,120,32,99,111,110,116,97,105,110,101,100,32,112,97,114,97,109,101,116,101,114,32,116,104,97,116,32,99,104,97,110,103,101,100,32,98,101,116,119,101,101,110,32,115,116,97,114,116,32,97,110,100,32,115,116,111,112,45,116,105,109,101,0,0,0,0,0,0,101,110,116,105,116,121,32,100,101,99,108,97,114,101,100,32,105,110,32,112,97,114,97,109,101,116,101,114,32,101,110,116,105,116,121,0,0,0,0,0,99,111,108,83,116,97,114,116,0,0,0,0,0,0,0,0,60,111,117,116,112,117,116,70,105,108,101,110,97,109,101,62,0,0,0,0,0,0,0,0,91,117,110,107,110,111,119,110,32,99,108,111,99,107,45,116,121,112,101,93,32,103,111,116,32,37,115,44,32,101,120,112,101,99,116,101,100,32,67,80,85,124,82,84,124,67,89,67,46,32,68,101,102,97,117,108,116,105,110,103,32,116,111,32,82,84,46,0,0,0,0,0,111,117,116,112,117,116,70,111,114,109,97,116,0,0,0,0,102,109,101,116,97,0,0,0,100,101,114,40,0,0,0,0,115,116,114,105,110,103,32,118,97,114,105,97,98,108,101,115,0,0,0,0,0,0,0,0,37,53,100,32,99,111,110,118,101,114,103,101,110,99,101,32,116,101,115,116,32,102,97,105,108,117,114,101,115,0,0,0,109,97,120,95,116,112,32,33,61,32,48,0,0,0,0,0,123,56,99,52,101,56,49,48,102,45,51,100,102,51,45,52,97,48,48,45,56,50,55,54,45,49,55,54,102,97,51,99,57,102,57,101,48,125,0,0,37,108,100,58,32,37,115,32,61,32,37,115,0,0,0,0,84,84,79,76,32,105,115,32,115,101,116,32,116,111,58,32,37,101,0,0,0,0,0,0,105,110,100,101,120,32,91,37,100,93,32,111,117,116,32,111,102,32,114,97,110,103,101,32,91,37,100,58,37,100,93,0,110,117,109,98,101,114,32,111,102,32,99,97,108,99,117,108,97,116,105,111,110,32,111,102,32,106,97,99,111,98,105,97,110,32,58,32,37,100,0,0,68,65,83,83,76,45,45,32,32,78,69,81,32,40,61,73,49,41,32,46,76,69,46,32,48,0,0,0,0,0,0,0,115,117,98,115,99,114,105,112,116,32,111,117,116,32,111,102,32,98,111,117,110,100,115,0,119,95,101,100,44,32,117,110,101,120,112,101,99,116,101,100,32,99,111,100,101,58,32,37,100,10,0,0,0,0,0,0,67,111,114,114,117,112,116,32,104,101,97,100,101,114,58,32,100,97,116,97,95,49,32,109,97,116,114,105,120,0,0,0,99,104,101,99,107,32,102,111,114,32,100,105,115,99,114,101,116,101,32,99,104,97,110,103,101,115,0,0,0,0,0,0,117,110,101,120,112,101,99,116,101,100,32,112,97,114,115,101,114,32,115,116,97,116,101,32,45,32,112,108,101,97,115,101,32,115,101,110,100,32,97,32,98,117,103,32,114,101,112,111,114,116,0,0,0,0,0,0,37,35,46,42,69,0,0,0,108,105,110,101,69,110,100,0,60,47,111,117,116,112,117,116,70,111,114,109,97,116,62,10,0,0,0,0,0,0,0,0,76,79,71,95,90,69,82,79,67,82,79,83,83,73,78,71,83,0,0,0,0,0,0,0,67,89,67,0,0,0,0,0,115,111,108,118,101,114,32,109,101,116,104,111,100,58,32,37,115,0,0,0,0,0,0,0,37,53,100,32,101,114,114,111,114,32,116,101,115,116,32,102,97,105,108,117,114,101,115,0,47,104,111,109,101,47,116,115,104,111,114,116,47,111,109,47,98,117,105,108,100,47,108,105,98,47,111,109,108,105,98,114,97,114,121,47,77,111,100,101,108,105,99,97,32,51,46,50,46,49,47,69,108,101,99,116,114,105,99,97,108,47,65,110,97,108,111,103,47,69,120,97,109,112,108,101,115,0,0,0,98,111,111,108,101,97,110,32,112,97,114,97,109,101,116,101,114,115,0,0,0,0,0,0,98,105,115,101,99,116,105,111,110,32,109,101,116,104,111,100,32,115,116,97,114,116,115,32,105,110,32,105,110,116,101,114,118,97,108,32,91,37,101,44,32,37,101,93,0,0,0,0,110,117,109,98,101,114,32,111,102,32,99,97,108,108,115,32,111,102,32,102,117,110,99,116,105,111,110,79,68,69,40,41,32,58,32,37,100,0,0,0,68,65,83,83,76,45,45,32,32,83,79,77,69,32,69,76,69,77,69,78,84,32,79,70,32,73,78,70,79,32,86,69,67,84,79,82,32,73,83,32,78,79,84,32,90,69,82,79,32,79,82,32,79,78,69,0,115,117,98,115,116,114,105,110,103,32,111,117,116,32,111,102,32,98,111,117,110,100,115,0,112,111,114,116,0,0,0,0,100,97,116,97,95,49,32,109,97,116,114,105,120,32,100,111,101,115,32,110,111,116,32,104,97,118,101,32,49,32,111,114,32,50,32,99,111,108,115,0,100,111,99,117,109,101,110,116,32,105,115,32,110,111,116,32,115,116,97,110,100,97,108,111,110,101,0,0,0,0,0,0,101,109,112,116,121,32,108,105,115,116,0,0,0,0,0,0,108,105,110,101,83,116,97,114,116,0,0,0,0,0,0,0,60,111,117,116,112,117,116,70,111,114,109,97,116,62,0,0,82,84,0,0,0,0,0,0,76,79,71,95,85,84,73,76,0,0,0,0,0,0,0,0,115,111,108,118,101,114,0,0,37,53,100,32,101,118,97,108,117,97,116,105,111,110,115,32,111,102,32,106,97,99,111,98,105,97,110,0,0,0,0,0,77,111,100,101,108,105,99,97,46,69,108,101,99,116,114,105,99,97,108,46,65,110,97,108,111,103,46,69,120,97,109,112,108,101,115,46,67,104,117,97,67,105,114,99,117,105,116,0,37,108,100,58,32,37,115,32,61,32,37,108,100,0,0,0,98,97,99,107,117,112,95,103,111,117,116,0,0,0,0,0,110,117,109,98,101,114,32,111,102,32,115,116,101,112,115,32,116,97,107,101,110,32,115,111,32,102,97,114,58,32,37,100,0,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,97,114,114,97,121,32,115,101,99,116,105,111,110,0,0,0,68,65,83,83,76,45,45,32,32,73,78,73,84,73,65,76,32,89,80,82,73,77,69,32,67,79,85,76,68,32,78,79,84,32,66,69,32,67,79,77,80,85,84,69,68,0,0,0,111,118,101,114,114,105,100,101,70,105,108,101,0,0,0,0,108,101,102,116,32,111,102,102,0,0,0,0,0,0,0,0,100,97,116,97,95,49,32,109,97,116,114,105,120,32,100,111,101,115,32,110,111,116,32,99,111,110,116,97,105,110,32,97,116,32,108,101,97,115,116,32,49,32,118,97,114,105,97,98,108,101,0,0,0,0,0,0,101,114,114,111,114,32,105,110,32,112,114,111,99,101,115,115,105,110,103,32,101,120,116,101,114,110,97,108,32,101,110,116,105,116,121,32,114,101,102,101,114,101,110,99,101,0,0,0,102,105,108,101,0,0,0,0,60,47,109,101,116,104,111,100,62,10,0,0,0,0,0,0,67,80,85,0,0,0,0,0,76,79,71,95,83,84,65,84,83,0,0,0,0,0,0,0,116,111,108,101,114,97,110,99,101,32,61,32,37,103,0,0,91,37,108,100,93,32,66,111,111,108,101,97,110,32,37,115,40,115,116,97,114,116,61,37,115,41,32,61,32,37,115,32,40,112,114,101,58,32,37,115,41,0,0,0,0,0,0,0,37,53,100,32,99,97,108,108,115,32,111,102,32,102,117,110,99,116,105,111,110,79,68,69,0,0,0,0,0,0,0,0,37,115,10,0,0,0,0,0,69,114,114,111,114,32,119,104,105,108,101,32,105,110,105,116,105,97,108,105,122,101,32,68,97,116,97,0,0,0,0,0,105,110,116,101,103,101,114,32,112,97,114,97,109,101,116,101,114,115,0,0,0,0,0,0,115,116,101,112,32,115,105,122,101,32,117,115,101,100,32,111,110,32,108,97,115,116,32,115,117,99,99,101,115,115,102,117,108,32,115,116,101,112,58,32,37,48,46,52,103,0,0,0,119,98,0,0,0,0,0,0,100,105,118,105,115,105,111,110,32,98,121,32,122,101,114,111,0,0,0,0,0,0,0,0,70,76,65,71,95,77,65,88,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,101,120,112,97,116,32,111,98,106,101,99,116,0,0,0,115,117,98,115,99,114,105,112,116,32,102,111,114,32,115,99,97,108,97,114,32,118,97,114,105,97,98,108,101,0,0,0,68,65,83,83,76,45,45,32,32,73,82,69,83,32,87,65,83,32,69,81,85,65,76,32,84,79,32,77,73,78,85,83,32,84,87,79,0,0,0,0,80,108,111,116,115,32,111,102,32,112,114,111,102,105,108,105,110,103,32,100,97,116,97,32,119,101,114,101,32,100,105,115,97,98,108,101,100,58,32,37,115,10,0,0,0,0,0,0,111,118,101,114,114,105,100,101,0,0,0,0,0,0,0,0,67,111,114,114,117,112,116,32,104,101,97,100,101,114,58,32,100,97,116,97,73,110,102,111,32,109,97,116,114,105,120,0,112,97,114,97,109,115,0,0,69,114,114,111,114,32,97,108,108,111,99,97,116,105,110,103,32,115,105,109,117,108,97,116,105,111,110,32,114,101,115,117,108,116,32,100,97,116,97,32,111,102,32,115,105,122,101,32,37,108,100,32,102,97,105,108,101,100,0,0,0,0,0,0,65,99,108,97,115,115,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,34,37,115,34,44,0,0,0,116,114,121,32,45,105,108,115,32,116,111,32,97,99,116,105,118,97,116,101,32,115,116,97,114,116,32,118,97,108,117,101,32,104,111,109,111,116,111,112,121,0,0,0,0,0,0,0,108,101,97,115,116,83,113,117,97,114,101,61,37,103,0,0,97,115,115,101,114,116,0,0,110,117,109,98,101,114,32,111,102,32,117,110,102,105,120,101,100,32,118,97,114,105,97,98,108,101,115,58,32,32,37,108,100,32,40,37,108,100,32,115,116,97,116,101,115,32,43,32,37,108,100,32,112,97,114,97,109,101,116,101,114,115,32,43,32,37,108,100,32,100,105,115,99,114,101,116,101,32,114,101,97,108,115,41,0,0,0,0,117,110,99,108,111,115,101,100,32,67,68,65,84,65,32,115,101,99,116,105,111,110,0,0,105,110,105,116,105,97,108,105,122,97,116,105,111,110,32,115,116,97,116,117,115,0,0,0,37,115,37,46,53,101,32,0,105,110,102,111,0,0,0,0,13,0,0,0,0,0,0,0,60,109,101,116,104,111,100,62,0,0,0,0,0,0,0,0,110,117,109,98,101,114,79,102,73,110,116,101,114,118,97,108,115,32,61,32,37,108,100,0,76,79,71,95,83,79,84,73,0,0,0,0,0,0,0,0,116,111,108,101,114,97,110,99,101,0,0,0,0,0,0,0,109,111,100,101,108,32,116,101,114,109,105,110,97,116,101,32,124,32,83,105,109,117,108,97,116,105,111,110,32,116,101,114,109,105,110,97,116,101,100,32,98,121,32,97,110,32,97,115,115,101,114,116,32,97,116,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,0,0,98,111,111,108,101,97,110,32,118,97,114,105,97,98,108,101,115,0,0,0,0,0,0,0,37,53,100,32,115,116,101,112,115,32,116,97,107,101,110,0,32,115,116,97,116,101,109,101,110,116,32,101,120,101,99,117,116,101,100,10,0,0,0,0,91,37,100,93,32,37,115,0,84,101,109,112,101,114,97,116,117,114,101,32,111,117,116,115,105,100,101,32,115,99,111,112,101,32,111,102,32,109,111,100,101,108,33,0,0,0,0,0,37,108,100,58,32,37,115,32,61,32,37,103,0,0,0,0,37,108,100,32,0,0,0,0,115,116,101,112,32,115,105,122,101,32,72,32,116,111,32,98,101,32,97,116,116,101,109,112,116,101,100,32,111,110,32,110,101,120,116,32,115,116,101,112,58,32,37,48,46,52,103,0,68,65,83,83,76,45,45,32,32,65,84,32,84,32,40,61,82,49,41,32,65,78,68,32,83,84,69,80,83,73,90,69,32,72,32,40,61,82,50,41,0,0,0,0,0,0,0,0,118,97,114,105,97,98,108,101,32,99,111,117,110,116,32,105,110,99,111,114,114,101,99,116,0,0,0,0,0,0,0,0,111,117,116,112,117,116,0,0,67,111,114,114,117,112,116,32,104,101,97,100,101,114,58,32,110,97,109,101,115,32,109,97,116,114,105,120,0,0,0,0,101,110,99,111,100,105,110,103,32,115,112,101,99,105,102,105,101,100,32,105,110,32,88,77,76,32,100,101,99,108,97,114,97,116,105,111,110,32,105,115,32,105,110,99,111,114,114,101,99,116,0,0,0,0,0,0,60,100,101,102,105,110,101,115,62,32,110,101,101,100,115,32,116,111,32,104,97,118,101,32,101,120,97,99,116,108,121,32,111,110,101,32,97,116,116,114,105,98,117,116,101,58,32,110,97,109,101,0,0,0,0,0,102,109,116,0,0,0,0,0,60,47,100,97,116,101,62,10,0,0,0,0,0,0,0,0,46,32,68,101,102,97,117,108,116,105,110,103,32,116,111,32,111,117,116,112,117,116,116,105,110,103,32,97,108,108,32,118,97,114,105,97,98,108,101,115,46,0,0,0,0,0,0,0,76,79,71,95,83,79,76,86,69,82,0,0,0,0,0,0,115,116,101,112,83,105,122,101,32,61,32,37,103,0,0,0,91,37,108,100,93,32,73,110,116,101,103,101,114,32,37,115,40,115,116,97,114,116,61,37,108,100,41,32,61,32,37,108,100,32,40,112,114,101,58,32,37,108,100,41,0,0,0,0,115,111,108,118,101,114,58,32,68,65,83,83,76,0,0,0,84,105,109,101,32,109,101,97,115,117,114,101,109,101,110,116,115,32,111,117,116,112,117,116,32,102,105,108,101,32,37,115,32,99,111,117,108,100,32,110,111,116,32,98,101,32,111,112,101,110,101,100,58,32,37,115,0,0,0,0,0,0,0,0,114,101,97,108,32,112,97,114,97,109,101,116,101,114,115,0,99,117,114,114,101,110,116,32,105,110,116,101,103,114,97,116,105,111,110,32,116,105,109,101,32,118,97,108,117,101,58,32,37,48,46,52,103,0,0,0,68,65,83,83,76,45,45,32,32,73,82,69,83,32,87,65,83,32,69,81,85,65,76,32,84,79,32,77,73,78,85,83,32,79,78,69,0,0,0,0,110,111,32,101,110,100,32,114,101,99,111,114,100,0,0,0,110,111,69,118,101,110,116,69,109,105,116,0,0,0,0,0,65,99,108,97,115,115,32,109,97,116,114,105,120,32,100,111,101,115,32,110,111,116,32,109,97,116,99,104,32,98,105,110,84,114,97,110,115,32,111,114,32,98,105,110,78,111,114,109,97,108,32,102,111,114,109,97,116,0,0,0,0,0,0,0,117,110,107,110,111,119,110,32,101,110,99,111,100,105,110,103,0,0,0,0,0,0,0,0,110,97,109,101,0,0,0,0,60,100,97,116,101,62,0,0,32,119,105,116,104,32,101,114,114,111,114,58,32,0,0,0,76,79,71,95,83,73,77,85,76,65,84,73,79,78,0,0,105,110,116,101,103,101,114,32,118,97,114,105,97,98,108,101,115,0,0,0,0,0,0,0,37,53,108,100,32,116,105,109,101,32,101,118,101,110,116,115,0,0,0,0,0,0,0,0,77,111,100,101,108,105,99,97,46,69,108,101,99,116,114,105,99,97,108,46,65,110,97,108,111,103,46,69,120,97,109,112,108,101,115,46,67,104,117,97,67,105,114,99,117,105,116,46,99,0,0,0,0,0,0,0,112,97,114,97,109,101,116,101,114,32,118,97,108,117,101,115,0,0,0,0,0,0,0,0,99,117,114,114,101,110,116,32,116,105,109,101,32,118,97,108,117,101,58,32,37,48,46,52,103,0,0,0,0,0,0,0,32,32,37,45,49,53,115,32,91,37,115,93,0,0,0,0,109,97,116,104,45,115,117,112,112,111,114,116,47,112,105,118,111,116,46,99,0,0,0,0,118,97,114,105,97,98,108,101,32,110,111,116,32,105,110,32,110,97,109,101,108,105,115,116,0,0,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,67,79,82,82,69,67,84,79,82,32,67,79,85,76,68,32,78,79,84,32,67,79,78,86,69,82,71,69,32,66,69,67,65,85,83,69,0,0,0,110,111,101,109,105,116,0,0,67,111,114,114,117,112,116,32,104,101,97,100,101,114,58,32,65,99,108,97,115,115,32,109,97,116,114,105,120,0,0,0,88,77,76,32,111,114,32,116,101,120,116,32,100,101,99,108,97,114,97,116,105,111,110,32,110,111,116,32,97,116,32,115,116,97,114,116,32,111,102,32,101,110,116,105,116,121,0,0,100,101,102,105,110,101,115,0,60,47,112,114,101,102,105,120,62,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,111,109,112,105,108,101,32,114,101,103,117,108,97,114,32,101,120,112,114,101,115,115,105,111,110,58,32,0,0,76,79,71,95,82,69,83,95,73,78,73,84,0,0,0,0,115,116,111,112,84,105,109,101,32,61,32,37,103,0,0,0,111,116,104,101,114,32,114,101,97,108,32,118,97,114,105,97,98,108,101,115,0,0,0,0,37,53,108,100,32,115,116,97,116,101,32,101,118,101,110,116,115,0,0,0,0,0,0,0,63,0,0,0,0,0,0,0,97,100,100,101,100,32,116,109,112,32,101,118,101,110,116,32,58,32,37,108,100,0,0,0,100,105,118,105,115,105,111,110,32,98,121,32,122,101,114,111,32,105,110,32,112,97,114,116,105,97,108,32,101,113,117,97,116,105,111,110,58,32,37,115,10,97,116,32,84,105,109,101,61,37,102,10,115,111,108,118,101,114,32,119,105,108,108,32,116,114,121,32,116,111,32,104,97,110,100,108,101,32,116,104,97,116,46,0,0,0,0,0,118,97,108,117,101,32,111,102,32,105,100,105,100,58,32,37,100,0,0,0,0,0,0,0,114,98,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,69,82,82,79,82,32,84,69,83,84,32,70,65,73,76,69,68,32,82,69,80,69,65,84,69,68,76,89,46,0,0,118,97,114,105,97,98,108,101,84,121,112,101,0,0,0,0,98,97,100,32,110,97,109,101,108,105,115,116,32,110,97,109,101,0,0,0,0,0,0,0,110,108,115,0,0,0,0,0,83,116,114,105,110,103,0,0,66,111,111,108,101,97,110,0,65,99,108,97,115,115,32,109,97,116,114,105,120,32,100,111,101,115,32,110,111,116,32,104,97,118,101,32,49,49,32,99,111,108,115,0,0,0,0,0,77,111,100,101,108,105,99,97,46,69,108,101,99,116,114,105,99,97,108,46,65,110,97,108,111,103,46,69,120,97,109,112,108,101,115,46,67,104,117,97,67,105,114,99,117,105,116,95,48,56,98,110,100,46,99,0,73,110,116,101,103,101,114,0,67,0,0,0,0,0,0,0,114,101,102,101,114,101,110,99,101,32,116,111,32,101,120,116,101,114,110,97,108,32,101,110,116,105,116,121,32,105,110,32,97,116,116,114,105,98,117,116,101,0,0,0,0,0,0,0,82,101,97,108,0,0,0,0,102,117,110,99,116,105,111,110,0,0,0,0,0,0,0,0,60,112,114,101,102,105,120,62,0,0,0,0,0,0,0,0,67,97,110,110,111,116,32,111,112,101,110,32,70,105,108,101,32,37,115,0,0,0,0,0,46,42,0,0,0,0,0,0,76,79,71,95,78,76,83,95,82,69,83,0,0,0,0,0,91,37,108,100,93,32,82,101,97,108,32,37,115,32,61,32,37,103,32,40,112,114,101,58,32,37,103,41,0,0,0,0,101,118,101,110,116,115,0,0,115,105,109,117,108,97,116,105,111,110,95,105,110,112,117,116,95,120,109,108,46,99,112,112,58,32,101,114,114,111,114,32,114,101,97,100,105,110,103,32,116,104,101,32,120,109,108,32,102,105,108,101,44,32,102,111,117,110,100,32,117,110,107,110,111,119,110,32,99,108,97,115,115,58,32,37,115,32,32,102,111,114,32,118,97,114,105,97,98,108,101,58,32,37,115,0,115,65,108,105,0,0,0,0,109,111,100,101,108,32,116,101,114,109,105,110,97,116,101,32,124,32,83,105,109,117,108,97,116,105,111,110,32,116,101,114,109,105,110,97,116,101,100,32,98,121,32,97,110,32,97,115,115,101,114,116,32,97,116,32,116,105,109,101,58,32,37,103,0,0,0,0,0,0,0,0,77,105,110,105,109,117,109,32,118,97,108,117,101,58,32,37,101,0,0,0,0,0,0,0,115,80,97,114,0,0,0,0,100,97,115,115,108,32,99,97,108,108,32,115,116,97,105,115,116,105,99,115,58,32,0,0,115,65,108,103,0,0,0,0,98,65,108,105,0,0,0,0,68,65,83,83,76,45,45,32,32,67,79,82,82,69,67,84,79,82,32,67,79,85,76,68,32,78,79,84,32,67,79,78,86,69,82,71,69,46,32,32,65,76,83,79,44,32,84,72,69,0,0,0,0,0,0,0,98,80,97,114,0,0,0,0,68,65,83,83,76,45,45,32,32,86,65,76,85,69,32,40,61,73,49,41,32,79,70,32,73,68,73,68,32,65,78,68,32,78,79,32,65,80,80,82,79,80,82,73,65,84,69,0,98,97,100,32,118,97,114,105,97,98,108,101,32,116,121,112,101,0,0,0,0,0,0,0,109,101,97,115,117,114,101,84,105,109,101,80,108,111,116,70,111,114,109,97,116,0,0,0,98,65,108,103,0,0,0,0,65,99,108,97,115,115,32,109,97,116,114,105,120,32,100,111,101,115,32,110,111,116,32,104,97,118,101,32,52,32,114,111,119,115,0,0,0,0,0,0,105,65,108,105,0,0,0,0,105,80,97,114,0,0,0,0,118,101,99,116,111,114,0,0,114,101,102,101,114,101,110,99,101,32,116,111,32,98,105,110,97,114,121,32,101,110,116,105,116,121,0,0,0,0,0,0,105,65,108,103,0,0,0,0,78,111,110,108,105,110,101,97,114,32,102,117,110,99,116,105,111,110,32,40,114,101,115,105,100,117,97,108,70,117,110,99,37,108,100,44,32,115,105,122,101,32,37,100,41,0,0,0,60,47,110,97,109,101,62,10,0,0,0,0,0,0,0,0,36,100,117,109,109,121,0,0,76,79,71,95,78,76,83,95,74,65,67,0,0,0,0,0,115,116,97,114,116,84,105,109,101,32,61,32,37,103,0,0,117,110,100,101,102,105,110,101,100,32,101,114,114,111,114,32,105,110,32,78,101,108,100,101,114,77,101,97,100,79,112,116,105,109,105,122,97,116,105,111,110,0,0,0,0,0,0,0,100,101,114,105,118,97,116,105,118,101,115,32,118,97,114,105,97,98,108,101,115,0,0,0,37,49,50,103,115,32,91,37,53,46,49,102,37,37,93,32,116,111,116,97,108,0,0,0,91,37,108,100,93,32,82,101,97,108,32,37,115,0,0,0,114,65,108,105,0,0,0,0,44,0,0,0,0,0,0,0,114,80,97,114,0,0,0,0,73,110,116,101,103,114,97,116,111,114,32,97,116,116,101,109,112,116,32,116,111,32,104,97,110,100,108,101,32,97,32,112,114,111,98,108,101,109,32,119,105,116,104,32,97,32,99,97,108,108,101,100,32,97,115,115,101,114,116,46,0,0,0,0,115,101,97,114,99,104,32,102,111,114,32,99,117,114,114,101,110,116,32,101,118,101,110,116,46,32,69,118,101,110,116,115,32,105,110,32,108,105,115,116,58,32,37,108,100,0,0,0,114,65,108,103,0,0,0,0,99,97,110,39,116,32,99,111,110,116,105,110,117,101,46,32,116,105,109,101,32,61,32,37,102,0,0,0,0,0,0,0,114,68,101,114,0,0,0,0,114,83,116,97,0,0,0,0,117,112,100,97,116,105,110,103,32,105,110,105,116,105,97,108,32,114,101,115,105,100,117,97,108,115,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,73,84,69,82,65,84,73,79,78,32,77,65,84,82,73,88,32,73,83,32,83,73,78,71,85,76,65,82,0,0,0,99,108,111,99,107,0,0,0,99,108,97,115,115,84,121,112,101,0,0,0,0,0,0,0,98,97,100,32,108,111,103,105,99,97,108,32,105,110,112,117,116,32,102,105,101,108,100,0,108,118,0,0,0,0,0,0,99,108,97,115,115,73,110,100,101,120,0,0,0,0,0,0,105,108,108,101,103,97,108,32,117,110,105,116,32,110,117,109,98,101,114,0,0,0,0,0,83,99,97,108,97,114,86,97,114,105,97,98,108,101,0,0,77,97,116,114,105,120,32,110,97,109,101,32,109,105,115,109,97,116,99,104,0,0,0,0,68,101,102,97,117,108,116,69,120,112,101,114,105,109,101,110,116,0,0,0,0,0,0,0,37,46,48,76,102,0,0,0,114,101,102,101,114,101,110,99,101,32,116,111,32,105,110,118,97,108,105,100,32,99,104,97,114,97,99,116,101,114,32,110,117,109,98,101,114,0,0,0,102,109,105,77,111,100,101,108,68,101,115,99,114,105,112,116,105,111,110,0,0,0,0,0,110,111,110,108,105,110,101,97,114,0,0,0,0,0,0,0,60,110,97,109,101,62,0,0,46,109,111,0,0,0,0,0,41,36,0,0,0,0,0,0,76,79,71,95,78,76,83,95,86,0,0,0,0,0,0,0,115,116,97,114,116,84,105,109,101,0,0,0,0,0,0,0,37,46,49,54,103,44,32,37,46,49,54,103,10,0,0,0,102,120,107,32,61,32,37,103,0,0,0,0,0,0,0,0,91,37,108,100,93,32,82,101,97,108,32,37,115,40,115,116,97,114,116,61,37,103,44,32,110,111,109,105,110,97,108,61,37,103,41,32,61,32,37,103,32,40,112,114,101,58,32,37,103,41,0,0,0,0,0,0,37,49,50,103,115,32,91,37,53,46,49,102,37,37,93,32,111,112,116,105,109,105,122,97,116,105,111,110,0,0,0,0,91,37,108,100,93,32,82,101,97,108,32,37,115,40,115,116,97,114,116,61,63,44,32,110,111,109,105,110,97,108,61,63,41,0,0,0,0,0,0,0,101,114,114,111,114,32,114,101,97,100,95,118,97,108,117,101,44,32,110,111,32,100,97,116,97,32,97,108,108,111,99,97,116,101,100,32,102,111,114,32,115,116,111,114,105,110,103,32,115,116,114,105,110,103,0,0,117,116,105,108,47,114,116,99,108,111,99,107,46,99,0,0,109,111,100,101,108,32,116,101,114,109,105,110,97,116,101,32,124,32,112,114,111,98,97,98,108,121,32,97,32,115,116,114,111,110,103,32,99,111,109,112,111,110,101,110,116,32,115,111,108,118,101,114,32,102,97,105,108,101,100,46,32,70,111,114,32,109,111,114,101,32,105,110,102,111,114,109,97,116,105,111,110,32,117,115,101,32,102,108,97,103,115,32,45,108,118,32,76,79,71,95,78,76,83,44,32,76,79,71,95,76,83,46,32,124,32,83,105,109,117,108,97,116,105,111,110,32,116,101,114,109,105,110,97,116,101,100,32,97,116,32,116,105,109,101,32,37,103,0,0,0,0,0,115,116,97,116,101,115,95,108,101,102,116,0,0,0,0,0,101,109,112,116,121,32,82,105,110,103,66,117,102,102,101,114,0,0,0,0,0,0,0,0,68,65,83,83,76,32,119,105,108,108,32,116,114,121,32,97,103,97,105,110,46,46,46,0,114,101,97,100,32,117,110,101,120,112,101,99,116,101,100,32,99,104,97,114,97,99,116,101,114,0,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,79,82,32,87,73,84,72,32,65,66,83,40,72,41,61,72,77,73,78,0,0,0,0,108,115,95,105,112,111,112,116,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,67,111,114,114,117,112,116,32,104,101,97,100,101,114,32,40,51,41,0,0,0,0,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,97,115,121,110,99,104,114,111,110,111,117,115,32,101,110,116,105,116,121,0,0,0,0,0,67,49,46,118,32,62,32,78,114,46,86,101,0,0,0,0,76,105,110,101,97,114,32,102,117,110,99,116,105,111,110,32,40,105,110,100,101,120,32,37,108,100,44,32,115,105,122,101,32,37,100,41,0,0,0,0,60,109,111,100,101,108,105,110,102,111,62,10,0,0,0,0,108,105,110,101,97,114,95,0,114,101,97,100,32,97,108,108,32,116,104,101,32,68,101,102,97,117,108,116,69,120,112,101,114,105,109,101,110,116,32,118,97,108,117,101,115,58,0,0,76,79,71,95,78,76,83,0,69,114,114,111,114,44,32,99,111,117,108,100,110,39,116,32,119,114,105,116,101,32,116,111,32,111,117,116,112,117,116,32,102,105,108,101,32,37,115,10,0,0,0,0,0,0,0,0,102,120,114,32,61,32,37,103,0,0,0,0,0,0,0,0,115,116,97,116,101,115,32,118,97,114,105,97,98,108,101,115,0,0,0,0,0,0,0,0,37,49,50,103,115,32,91,37,53,46,49,102,37,37,93,32,115,105,109,117,108,97,116,105,111,110,0,0,0,0,0,0,91,37,108,100,93,32,82,101,97,108,32,37,115,40,115,116,97,114,116,61,37,103,44,32,110,111,109,105,110,97,108,61,37,103,41,0,0,0,0,0,95,105,110,105,116,46,120,109,108,0,0,0,0,0,0,0,98,105,110,78,111,114,109,97,108,0,0,0,0,0,0,0,109,111,100,101,108,32,116,101,114,109,105,110,97,116,101,32,124,32,109,105,120,101,100,32,115,121,115,116,101,109,32,115,111,108,118,101,114,32,102,97,105,108,101,100,46,32,124,32,83,105,109,117,108,97,116,105,111,110,32,116,101,114,109,105,110,97,116,101,100,32,97,116,32,116,105,109,101,32,37,103,0,0,0,0,0,0,0,0,115,105,109,117,108,97,116,105,111,110,47,115,111,108,118,101,114,47,101,118,101,110,116,115,46,99,0,0,0,0,0,0,65,32,108,97,114,103,101,32,97,109,111,117,110,116,32,111,102,32,119,111,114,107,32,104,97,115,32,98,101,101,110,32,101,120,112,101,110,100,101,100,46,40,65,98,111,117,116,32,53,48,48,32,115,116,101,112,115,41,46,32,84,114,121,105,110,103,32,116,111,32,99,111,110,116,105,110,117,101,32,46,46,46,0,0,0,0,0,0,67,97,110,110,111,116,32,111,112,101,110,32,70,105,108,101,32,37,115,32,102,111,114,32,119,114,105,116,105,110,103,0,86,97,114,105,97,98,108,101,32,82,111,46,84,95,114,101,102,32,111,117,116,32,111,102,32,91,109,105,110,44,32,109,97,120,93,32,105,110,116,101,114,118,97,108,58,32,82,111,46,84,95,114,101,102,32,62,61,32,48,46,48,32,104,97,115,32,118,97,108,117,101,58,32,0,0,0,0,0,0,0,78,79,32,111,118,101,114,114,105,100,101,32,103,105,118,101,110,32,111,110,32,116,104,101,32,99,111,109,109,97,110,100,32,108,105,110,101,46,0,0,69,114,114,111,114,32,97,108,108,111,99,97,116,105,110,103,32,115,105,109,117,108,97,116,105,111,110,32,114,101,115,117,108,116,32,100,97,116,97,32,111,102,32,115,105,122,101,32,37,108,100,0,0,0,0,0,111,117,116,32,111,102,32,102,114,101,101,32,115,112,97,99,101,0,0,0,0,0,0,0,111,118,101,114,114,105,100,101,32,100,111,110,101,33,0,0,68,65,83,83,76,45,45,32,32,67,79,82,82,69,67,84,79,82,32,70,65,73,76,69,68,32,84,79,32,67,79,78,86,69,82,71,69,32,82,69,80,69,65,84,69,68,76,89,0,0,0,0,0,0,0,0,101,110,100,102,105,108,101,0,111,118,101,114,114,105,100,101,32,37,115,32,61,32,37,115,0,0,0,0,0,0,0,0,108,115,0,0,0,0,0,0,100,97,116,97,95,49,0,0,37,46,49,54,103,44,0,0,114,101,97,100,32,111,118,101,114,114,105,100,101,32,118,97,108,117,101,115,58,32,37,115,0,0,0,0,0,0,0,0,67,111,114,114,117,112,116,32,104,101,97,100,101,114,32,40])
.concat([50,41,0,0,0,0,0,0,83,97,116,0,0,0,0,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,70,114,105,0,0,0,0,0,37,76,102,0,0,0,0,0,78,101,108,100,101,114,77,101,97,100,79,112,116,105,109,105,122,97,116,105,111,110,0,0,114,101,99,117,114,115,105,118,101,32,101,110,116,105,116,121,32,114,101,102,101,114,101,110,99,101,0,0,0,0,0,0,105,110,118,97,108,105,100,32,108,105,115,116,45,112,111,105,110,116,101,114,0,0,0,0,84,104,117,0,0,0,0,0,115,105,109,117,108,97,116,105,111,110,95,105,110,112,117,116,95,120,109,108,46,99,112,112,58,32,99,111,117,108,100,32,110,111,116,32,111,112,101,110,32,116,104,101,32,102,105,108,101,32,103,105,118,101,110,32,116,111,32,45,111,118,101,114,114,105,100,101,70,105,108,101,61,37,115,0,0,0,0,0,109,97,108,108,111,99,32,102,97,105,108,117,114,101,0,0,108,105,110,101,97,114,0,0,60,115,105,109,117,108,97,116,105,111,110,62,10,0,0,0,105,32,102,111,114,32,105,32,105,110,32,49,58,48,0,0,69,114,114,111,114,44,32,116,104,101,32,71,85,73,68,58,32,37,115,32,102,114,111,109,32,105,110,112,117,116,32,100,97,116,97,32,102,105,108,101,58,32,37,115,32,100,111,101,115,32,110,111,116,32,109,97,116,99,104,32,116,104,101,32,71,85,73,68,32,99,111,109,112,105,108,101,100,32,105,110,32,116,104,101,32,109,111,100,101,108,58,32,37,115,0,0,76,79,71,95,76,83,95,86,0,0,0,0,0,0,0,0,68,97,116,97,83,101,116,58,32,37,115,10,0,0,0,0,105,110,99,114,101,97,115,105,110,103,32,108,97,109,98,100,97,32,116,111,32,37,45,51,103,32,105,110,32,115,116,101,112,32,37,54,100,32,97,116,32,102,61,37,103,0,0,0,35,35,35,32,83,79,76,85,84,73,79,78,32,79,70,32,84,72,69,32,73,78,73,84,73,65,76,73,90,65,84,73,79,78,32,35,35,35,0,0,37,49,50,103,115,32,91,37,53,46,49,102,37,37,93,32,111,118,101,114,104,101,97,100,0,0,0,0,0,0,0,0,87,101,100,0,0,0,0,0,112,114,111,112,101,114,32,115,116,97,114,116,45,118,97,108,117,101,115,32,102,111,114,32,115,111,109,101,32,111,102,32,116,104,101,32,102,111,108,108,111,119,105,110,103,32,105,116,101,114,97,116,105,111,110,32,118,97,114,105,97,98,108,101,115,32,109,105,103,104,116,32,104,101,108,112,0,0,0,0,114,101,97,100,32,111,118,101,114,114,105,100,101,32,118,97,108,117,101,115,32,102,114,111,109,32,102,105,108,101,58,32,37,115,0,0,0,0,0,0,110,111,32,115,117,110,100,105,97,108,115,47,107,105,110,115,111,108,32,115,117,112,112,111,114,116,32,97,99,116,105,118,97,116,101,100,0,0,0,0,110,111,32,105,112,111,112,116,32,115,117,112,112,111,114,116,32,97,99,116,105,118,97,116,101,100,0,0,0,0,0,0,115,105,109,117,108,97,116,105,111,110,95,105,110,112,117,116,95,120,109,108,46,99,112,112,58,32,117,115,97,103,101,32,101,114,114,111,114,32,121,111,117,32,99,97,110,110,111,116,32,104,97,118,101,32,98,111,116,104,32,45,111,118,101,114,114,105,100,101,32,97,110,100,32,45,111,118,101,114,114,105,100,101,70,105,108,101,32,97,99,116,105,118,101,32,97,116,32,116,104,101,32,115,97,109,101,32,116,105,109,101,46,32,115,101,101,32,77,111,100,101,108,32,45,63,32,102,111,114,32,109,111,114,101,32,105,110,102,111,33,0,0,0,0,0,84,117,101,0,0,0,0,0,99,97,108,108,32,101,120,116,101,114,110,97,108,32,79,98,106,101,99,116,32,67,111,110,115,116,114,117,99,116,111,114,115,32,102,105,110,105,115,104,101,100,0,0,0,0,0,0,109,111,100,101,108,32,116,101,114,109,105,110,97,116,101,32,124,32,108,105,110,101,97,114,32,115,121,115,116,101,109,32,115,111,108,118,101,114,32,102,97,105,108,101,100,46,32,124,32,83,105,109,117,108,97,116,105,111,110,32,116,101,114,109,105,110,97,116,101,100,32,97,116,32,116,105,109,101,32,37,103,0,0,0,0,0,0,0,115,116,97,116,101,115,95,114,105,103,104,116,0,0,0,0,77,111,110,0,0,0,0,0,83,116,97,114,116,32,115,116,101,112,32,37,46,49,53,103,32,116,111,32,37,46,49,53,103,0,0,0,0,0,0,0,115,101,116,32,111,117,116,112,117,116,32,34,37,115,95,112,114,111,102,46,37,115,37,100,95,99,111,117,110,116,46,37,115,34,10,0,0,0,0,0,86,97,114,105,97,98,108,101,32,82,111,46,84,32,111,117,116,32,111,102,32,91,109,105,110,44,32,109,97,120,93,32,105,110,116,101,114,118,97,108,58,32,82,111,46,84,32,62,61,32,48,46,48,32,104,97,115,32,118,97,108,117,101,58,32,0,0,0,0,0,0,0,83,117,110,0,0,0,0,0,115,101,116,32,121,108,97,98,101,108,32,34,69,120,101,99,117,116,105,111,110,32,99,111,117,110,116,34,10,0,0,0,83,116,114,105,110,103,32,65,108,105,97,115,32,118,97,114,105,97,98,108,101,32,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,105,110,99,111,109,112,114,101,104,101,110,115,105,98,108,101,32,108,105,115,116,32,105,110,112,117,116,0,0,0,0,0,76,79,71,95,85,78,75,78,79,87,78,0,0,0,0,0,68,65,83,83,76,45,45,32,32,69,82,82,79,82,32,84,69,83,84,32,70,65,73,76,69,68,32,82,69,80,69,65,84,69,68,76,89,32,79,82,32,87,73,84,72,32,65,66,83,40,72,41,61,72,77,73,78,0,0,0,0,0,0,0,114,101,97,100,32,120,109,108,32,102,105,108,101,32,102,111,114,32,115,116,114,105,110,103,32,97,108,105,97,115,32,118,97,114,115,0,0,0,0,0,115,101,116,32,120,108,97,98,101,108,32,34,71,108,111,98,97,108,32,115,116,101,112,32,110,117,109,98,101,114,34,10,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,108,111,103,70,111,114,109,97,116,0,0,0,0,0,0,0,119,114,105,116,101,32,115,116,97,114,116,0,0,0,0,0,115,101,116,32,111,117,116,112,117,116,32,34,37,115,95,112,114,111,102,46,37,115,37,100,46,37,115,34,10,0,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,119,95,110,101,100,44,32,117,110,101,120,112,101,99,116,101,100,32,99,111,100,101,58,32,37,100,10,0,0,0,0,0,100,97,115,115,108,73,110,116,101,114,110,97,108,78,117,109,74,97,99,0,0,0,0,0,37,43,46,50,100,0,0,0,115,101,116,32,121,108,97,98,101,108,32,34,69,120,101,99,117,116,105,111,110,32,116,105,109,101,32,91,115,93,34,10,0,0,0,0,0,0,0,0,67,111,117,108,100,32,110,111,116,32,100,101,116,101,114,109,105,110,101,32,115,105,122,101,32,111,102,32,109,97,116,114,105,120,32,101,108,101,109,101,110,116,115,0,0,0,0,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,117,110,107,110,111,119,110,32,99,111,100,101,32,105,110,32,100,111,95,102,105,111,58,32,37,100,10,37,115,10,0,0,66,111,111,108,101,97,110,32,65,108,105,97,115,32,118,97,114,105,97,98,108,101,32,0,115,101,116,32,120,108,97,98,101,108,32,34,71,108,111,98,97,108,32,115,116,101,112,32,97,116,32,116,105,109,101,34,10,0,0,0,0,0,0,0,100,97,115,115,108,67,111,108,111,114,83,121,109,74,97,99,0,0,0,0,0,0,0,0,84,117,101,115,100,97,121,0,117,110,100,101,102,105,110,101,100,32,101,110,116,105,116,121,0,0,0,0,0,0,0,0,114,101,97,100,32,120,109,108,32,102,105,108,101,32,102,111,114,32,98,111,111,108,101,97,110,32,97,108,105,97,115,32,118,97,114,115,0,0,0,0,115,102,101,0,0,0,0,0,115,101,116,32,116,105,116,108,101,32,34,37,115,34,10,0,100,97,115,115,108,78,117,109,74,97,99,0,0,0,0,0,77,111,110,100,97,121,0,0,101,113,117,97,116,105,111,110,0,0,0,0,0,0,0,0,115,116,114,102,116,105,109,101,40,41,32,102,97,105,108,101,100,0,0,0,0,0,0,0,69,114,114,111,114,44,32,99,97,110,32,110,111,116,32,103,101,116,32,77,97,116,114,105,120,32,68,32,0,0,0,0,100,97,115,115,108,83,121,109,74,97,99,0,0,0,0,0,76,105,115,0,0,0,0,0,84,104,101,32,77,111,100,101,108,32,71,85,73,68,58,32,37,115,32,105,115,32,110,111,116,32,115,101,116,32,105,110,32,102,105,108,101,58,32,37,115,0,0,0,0,0,0,0,76,79,71,95,76,83,0,0,68,97,116,97,83,101,116,58,32,36,99,112,117,84,105,109,101,10,0,0,0,0,0,0,77,97,108,108,111,99,32,102,97,105,108,101,100,0,0,0,108,97,109,98,100,97,32,105,115,32,37,45,51,103,32,105,110,32,115,116,101,112,61,37,54,100,32,97,116,32,102,61,37,103,32,91,37,103,93,0,105,110,105,116,105,97,108,32,114,101,115,105,100,117,97,108,115,0,0,0,0,0,0,0,115,101,116,32,116,101,114,109,105,110,97,108,32,37,115,10,0,0,0,0,0,0,0,0,37,49,50,103,115,32,91,37,53,46,49,102,37,37,93,32,101,118,101,110,116,45,104,97,110,100,108,105,110,103,0,0,83,117,110,100,97,121,0,0,110,111,110,108,105,110,101,97,114,32,115,121,115,116,101,109,32,102,97,105,108,115,58,32,37,115,32,97,116,32,116,61,37,103,0,0,0,0,0,0,109,111,100,101,108,32,108,105,110,101,97,114,95,77,111,100,101,108,105,99,97,95,69,108,101,99,116,114,105,99,97,108,95,65,110,97,108,111,103,95,69,120,97,109,112,108,101,115,95,67,104,117,97,67,105,114,99,117,105,116,10,32,32,112,97,114,97,109,101,116,101,114,32,73,110,116,101,103,101,114,32,110,32,61,32,51,59,32,47,47,32,115,116,97,116,101,115,32,10,32,32,112,97,114,97,109,101,116,101,114,32,73,110,116,101,103,101,114,32,107,32,61,32,48,59,32,47,47,32,116,111,112,45,108,101,118,101,108,32,105,110,112,117,116,115,32,10,32,32,112,97,114,97,109,101,116,101,114,32,73,110,116,101,103,101,114,32,108,32,61,32,48,59,32,47,47,32,116,111,112,45,108,101,118,101,108,32,111,117,116,112,117,116,115,32,10,32,32,112,97,114,97,109,101,116,101,114,32,82,101,97,108,32,120,48,91,51,93,32,61,32,123,37,115,125,59,10,32,32,112,97,114,97,109,101,116,101,114,32,82,101,97,108,32,117,48,91,48,93,32,61,32,123,37,115,125,59,10,32,32,112,97,114,97,109,101,116,101,114,32,82,101,97,108,32,65,91,51,44,51,93,32,61,32,91,37,115,93,59,10,32,32,112,97,114,97,109,101,116,101,114,32,82,101,97,108,32,66,91,51,44,48,93,32,61,32,122,101,114,111,115,40,51,44,48,41,59,37,115,10,32,32,112,97,114,97,109,101,116,101,114,32,82,101,97,108,32,67,91,48,44,51,93,32,61,32,122,101,114,111,115,40,48,44,51,41,59,37,115,10,32,32,112,97,114,97,109,101,116,101,114,32,82,101,97,108,32,68,91,48,44,48,93,32,61,32,122,101,114,111,115,40,48,44,48,41,59,37,115,10,32,32,82,101,97,108,32,120,91,51,93,40,115,116,97,114,116,61,120,48,41,59,10,32,32,105,110,112,117,116,32,82,101,97,108,32,117,91,48,93,59,10,32,32,111,117,116,112,117,116,32,82,101,97,108,32,121,91,48,93,59,10,10,32,32,82,101,97,108,32,120,95,80,67,50,80,118,32,61,32,120,91,49,93,59,10,32,32,82,101,97,108,32,120,95,80,67,49,80,118,32,61,32,120,91,50,93,59,10,32,32,82,101,97,108,32,120,95,80,76,80,105,32,61,32,120,91,51,93,59,10,32,32,32,32,32,32,10,101,113,117,97,116,105,111,110,10,32,32,100,101,114,40,120,41,32,61,32,65,32,42,32,120,32,43,32,66,32,42,32,117,59,10,32,32,121,32,61,32,67,32,42,32,120,32,43,32,68,32,42,32,117,59,10,101,110,100,32,108,105,110,101,97,114,95,77,111,100,101,108,105,99,97,95,69,108,101,99,116,114,105,99,97,108,95,65,110,97,108,111,103,95,69,120,97,109,112,108,101,115,95,67,104,117,97,67,105,114,99,117,105,116,59,10,0,0,0,0,0,0,0,0,115,101,116,32,98,111,114,100,101,114,10,0,0,0,0,0,100,97,115,115,108,116,101,115,116,0,0,0,0,0,0,0,109,111,100,101,108,32,116,101,114,109,105,110,97,116,101,32,124,32,110,111,110,45,108,105,110,101,97,114,32,115,121,115,116,101,109,32,115,111,108,118,101,114,32,102,97,105,108,101,100,46,32,124,32,83,105,109,117,108,97,116,105,111,110,32,116,101,114,109,105,110,97,116,101,100,32,97,116,32,116,105,109,101,32,37,103,0,0,0,101,114,114,111,114,32,105,110,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,46,32,83,121,115,116,101,109,32,111,102,32,105,110,105,116,105,97,108,32,101,113,117,97,116,105,111,110,115,32,97,114,101,32,110,111,116,32,99,111,110,115,105,115,116,101,110,116,10,40,108,101,97,115,116,32,115,113,117,97,114,101,32,102,117,110,99,116,105,111,110,32,118,97,108,117,101,32,105,115,32,37,103,41,0,0,0,0,0,115,101,116,32,120,116,105,99,115,10,0,0,0,0,0,0,100,97,115,115,108,119,111,114,116,0,0,0,0,0,0,0,58,32,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,73,110,116,101,103,101,114,32,65,108,105,97,115,32,118,97,114,105,97,98,108,101,32,0,67,97,108,108,105,110,103,32,68,68,65,83,82,84,32,102,114,111,109,32,37,46,49,53,103,32,116,111,32,37,46,49,53,103,0,0,0,0,0,0,114,101,97,100,32,120,109,108,32,102,105,108,101,32,102,111,114,32,105,110,116,101,103,101,114,32,97,108,105,97,115,32,118,97,114,115,0,0,0,0,86,97,114,105,97,98,108,101,32,71,46,84,95,114,101,102,32,111,117,116,32,111,102,32,91,109,105,110,44,32,109,97,120,93,32,105,110,116,101,114,118,97,108,58,32,71,46,84,95,114,101,102,32,62,61,32,48,46,48,32,104,97,115,32,118,97,108,117,101,58,32,0,115,101,116,32,121,116,105,99,115,10,0,0,0,0,0,0,108,111,98,97,116,116,111,54,0,0,0,0,0,0,0,0,104,101,108,112,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,99,97,110,32,110,111,116,32,105,110,105,116,105,97,108,122,101,32,74,97,99,111,98,105,97,110,115,32,102,111,114,32,100,121,110,97,109,105,99,32,115,116,97,116,101,32,115,101,108,101,99,116,105,111,110,0,100,105,118,105,115,105,111,110,32,98,121,32,122,101,114,111,32,105,110,32,112,97,114,116,105,97,108,32,101,113,117,97,116,105,111,110,58,32,37,115,10,97,116,32,84,105,109,101,61,37,102,10,91,108,105,110,101,93,32,37,108,100,32,124,32,91,102,105,108,101,93,32,37,115,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,102,105,108,101,32,37,115,58,32,37,115,10,0,0,0,0,0,108,111,98,97,116,116,111,52,0,0,0,0,0,0,0,0,115,101,116,32,111,117,116,112,117,116,32,34,37,115,95,112,114,111,102,46,37,115,37,100,95,99,111,117,110,116,46,116,104,117,109,98,46,115,118,103,34,10,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,116,114,117,110,99,97,116,105,111,110,32,102,97,105,108,101,100,32,105,110,32,101,110,100,102,105,108,101,0,0,0,0,68,65,83,83,76,45,45,32,32,65,84,32,84,32,40,61,82,49,41,32,65,78,68,32,83,84,69,80,83,73,90,69,32,72,32,40,61,82,50,41,32,84,72,69,0,0,0,0,108,111,98,97,116,116,111,50,0,0,0,0,0,0,0,0,103,110,117,112,108,111,116,0,115,101,116,32,121,114,97,110,103,101,32,91,37,103,58,37,103,93,10,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,59,0,0,0,0,0,0,0,114,97,100,97,117,49,0,0,115,101,116,32,110,111,108,111,103,32,120,121,10,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,76,79,71,95,65,76,76,0,115,101,116,32,121,114,97,110,103,101,32,91,42,58,42,93,10,0,0,0,0,0,0,0,114,97,100,97,117,51,0,0,77,97,116,114,105,120,32,117,115,101,115,32,105,109,97,103,105,110,97,114,121,32,110,117,109,98,101,114,115,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,69,114,114,111,114,32,119,104,105,108,101,32,119,114,105,116,105,110,103,32,109,97,116,32,102,105,108,101,32,37,115,0,73,110,105,116,105,97,108,105,122,105,110,103,32,68,65,83,83,76,0,0,0,0,0,0,65,117,116,111,109,97,116,105,99,32,111,117,116,112,117,116,32,115,116,101,112,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,105,110,32,79,112,101,110,77,111,100,101,108,105,99,97,32,121,101,116,46,32,83,101,116,32,110,117,109,112,111,105,110,116,115,32,62,61,32,48,46,0,0,0,32,110,111,116,32,102,111,117,110,100,46,0,0,0,0,0,37,105,44,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,105,116,101,114,97,116,105,111,110,115,58,32,37,108,100,0,115,105,109,112,108,101,120,95,105,110,105,116,105,97,108,105,122,97,116,105,111,110,32,124,32,82,101,115,117,108,116,32,111,102,32,108,101,97,115,116,83,113,117,97,114,101,32,109,101,116,104,111,100,32,61,32,37,103,46,32,84,104,101,32,105,110,105,116,105,97,108,32,103,117,101,115,115,32,102,105,116,115,32,116,111,32,116,104,101,32,115,121,115,116,101,109,0,0,0,0,0,0,0,0,115,101,116,32,121,114,97,110,103,101,32,91,42,58,37,103,93,10,0,0,0,0,0,0,114,97,100,97,117,53,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,105,110,105,116,105,97,108,32,112,114,111,98,108,101,109,58,0,0,0,0,0,0,0,0,115,116,100,111,117,116,0,0,105,108,108,101,103,97,108,32,112,97,114,97,109,101,116,101,114,32,101,110,116,105,116,121,32,114,101,102,101,114,101,110,99,101,0,0,0,0,0,0,82,101,97,108,32,65,108,105,97,115,32,118,97,114,105,97,98,108,101,32,0,0,0,0,100,111,95,102,105,111,0,0,115,101,116,32,108,111,103,32,121,10,0,0,0,0,0,0,100,97,115,115,108,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,114,101,115,105,100,117,97,108,91,37,108,100,93,32,61,32,37,103,0,0,0,0,0,0,106,97,99,111,98,105,97,110,32,37,100,120,37,100,32,91,105,100,58,32,37,108,100,93,0,0,0,0,0,0,0,0,118,97,114,105,97,98,108,101,0,0,0,0,0,0,0,0,37,89,45,37,109,45,37,100,32,37,72,58,37,77,58,37,83,0,0,0,0,0,0,0,69,114,114,111,114,44,32,99,97,110,32,110,111,116,32,103,101,116,32,77,97,116,114,105,120,32,67,32,0,0,0,0,100,101,102,97,117,108,116,32,109,101,116,104,111,100,0,0,97,108,108,111,99,97,116,105,111,110,78,101,119,116,111,110,68,97,116,97,40,41,32,102,97,105,108,101,100,33,0,0,69,114,114,111,114,32,105,110,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,46,32,83,116,111,114,105,110,103,32,114,101,115,117,108,116,115,32,97,110,100,32,101,120,105,116,105,110,103,46,10,85,115,101,32,45,108,118,61,76,79,71,95,73,78,73,84,32,45,119,32,102,111,114,32,109,111,114,101,32,105,110,102,111,114,109,97,116,105,111,110,46,0,76,79,71,95,74,65,67,0,67,97,110,110,111,116,32,97,108,108,111,99,32,109,101,109,111,114,121,0,0,0,0,0,111,117,116,32,111,102,32,109,101,109,111,114,121,0,0,0,91,37,108,100,93,32,91,37,49,53,103,93,32,58,61,32,37,115,32,40,100,105,115,99,114,101,116,101,41,0,0,0,91,94,91,58,100,105,103,105,116,58,93,93,0,0,0,0,115,101,116,32,121,108,97,98,101,108,10,0,0,0,0,0,113,115,115,0,0,0,0,0,37,49,50,103,115,32,91,37,53,46,49,102,37,37,93,32,99,114,101,97,116,105,110,103,32,111,117,116,112,117,116,45,102,105,108,101,0,0,0,0,97,108,108,111,99,97,116,105,111,110,78,101,119,116,111,110,68,97,116,97,40,41,32,118,111,105,100,100,97,116,97,32,102,97,105,108,101,100,33,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,110,111,110,108,105,110,101,97,114,32,115,111,108,118,101,114,0,0,0,116,105,109,101,0,0,0,0,97,108,108,111,99,97,116,105,111,110,72,121,98,114,100,68,97,116,97,40,41,32,118,111,105,100,100,97,116,97,32,102,97,105,108,101,100,33,0,0,97,108,105,97,115,86,97,114,105,97,98,108,101,0,0,0,104,121,98,114,105,100,0,0,45,105,32,102,103,109,114,101,115,32,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,108,105,110,101,97,114,32,115,121,115,116,101,109,32,102,97,105,108,115,58,32,37,115,32,97,116,32,116,61,37,103,0,115,101,116,32,120,108,97,98,101,108,10,0,0,0,0,0,105,110,108,105,110,101,45,114,117,110,103,101,107,117,116,116,97,0,0,0,0,0,0,0,97,108,108,111,99,97,116,101,77,105,120,101,100,83,101,97,114,99,104,68,97,116,97,40,41,32,118,111,105,100,100,97,116,97,32,102,97,105,108,101,100,33,0,0,0,0,0,0,109,105,120,101,100,32,115,121,115,116,101,109,32,102,97,105,108,115,58,32,37,115,32,97,116,32,116,61,37,103,0,0,109,111,100,101,108,32,116,101,114,109,105,110,97,116,101,32,124,32,73,110,116,101,103,114,97,116,111,114,32,102,97,105,108,101,100,46,32,124,32,83,105,109,117,108,97,116,105,111,110,32,116,101,114,109,105,110,97,116,101,100,32,97,116,32,116,105,109,101,32,37,103,0,67,104,97,116,116,101,114,105,110,103,32,100,101,116,101,99,116,101,100,32,97,114,111,117,110,100,32,116,105,109,101,32,37,46,49,50,103,46,46,37,46,49,50,103,32,40,37,100,32,115,116,97,116,101,32,101,118,101,110,116,115,32,105,110,32,97,32,114,111,119,32,119,105,116,104,32,97,32,116,111,116,97,108,32,116,105,109,101,32,100,101,108,116,97,32,108,101,115,115,32,116,104,97,110,32,116,104,101,32,115,116,101,112,32,115,105,122,101,32,37,46,49,50,103,41,46,32,84,104,105,115,32,99,97,110,32,98,101,32,97,32,112,101,114,102,111,114,109,97,110,99,101,32,98,111,116,116,108,101,110,101,99,107,46,32,85,115,101,32,45,108,118,32,76,79,71,95,69,86,69,78,84,83,32,102,111,114,32,109,111,114,101,32,105,110,102,111,114,109,97,116,105,111,110,46,32,84,104,101,32,122,101,114,111,45,99,114,111,115,115,105,110,103,32,119,97,115,58,32,37,115,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,115,101,116,32,116,105,116,108,101,10,0,0,0,0,0,0,100,97,115,115,108,32,119,105,116,104,32,105,110,116,101,114,110,97,108,32,110,117,109,101,114,105,99,97,108,32,106,97,99,111,98,105,97,110,0,0,114,101,97,100,32,102,111,114,32,37,115,32,110,101,103,97,116,101,100,32,37,100,32,102,114,111,109,32,115,101,116,117,112,32,102,105,108,101,0,0,73,110,116,101,114,112,111,108,97,116,101,32,108,105,110,101,97,114,0,0,0,0,0,0,47,104,111,109,101,47,116,115,104,111,114,116,47,111,109,47,98,117,105,108,100,47,108,105,98,47,111,109,108,105,98,114,97,114,121,47,77,111,100,101,108,105,99,97,32,51,46,50,46,49,47,69,108,101,99,116,114,105,99,97,108,47,65,110,97,108,111,103,47,73,110,116,101,114,102,97,99,101,115,46,109,111,0,0,0,0,0,0,115,101,116,32,111,117,116,112,117,116,32,34,37,115,95,112,114,111,102,46,37,115,37,100,46,116,104,117,109,98,46,115,118,103,34,10,0,0,0,0,100,97,115,115,108,32,119,105,116,104,32,99,111,108,111,114,101,100,32,115,121,109,98,111,108,105,99,32,106,97,99,111,98,105,97,110,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,110,101,103,97,116,101,100,65,108,105,97,115,0,0,0,0,97,108,105,97,115,0,0,0,117,110,115,101,116,32,98,111,114,100,101,114,10,0,0,0,100,97,115,115,108,32,119,105,116,104,32,110,117,109,101,114,105,99,97,108,32,106,97,99,111,98,105,97,110,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,111,102,102,32,101,110,100,32,111,102,32,114,101,99,111,114,100,0,0,0,0,0,0,0,68,65,83,83,76,45,45,32,32,72,65,83,32,66,69,67,79,77,69,32,46,76,69,46,32,48,46,48,0,0,0,0,97,108,108,111,99,97,116,105,111,110,72,121,98,114,100,68,97,116,97,40,41,32,102,97,105,108,101,100,33,0,0,0,117,110,115,101,116,32,121,116,105,99,115,10,0,0,0,0,100,97,115,115,108,32,119,105,116,104,32,115,121,109,98,111,108,105,99,32,106,97,99,111,98,105,97,110,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,114,101,97,100,32,120,109,108,32,102,105,108,101,32,102,111,114,32,114,101,97,108,32,97,108,105,97,115,32,118,97,114,115,0,0,0,0,0,0,0,105,111,109,0,0,0,0,0,117,110,115,101,116,32,120,116,105,99,115,10,0,0,0,0,100,97,115,115,108,32,102,111,114,32,100,101,98,117,103,32,112,114,111,112,111,115,101,0,112,97,114,97,109,101,116,101,114,32,83,116,114,105,110,103,32,37,115,40,37,115,115,116,97,114,116,61,37,115,37,115,41,0,0,0,0,0,0,0,78,76,83,95,85,78,75,78,79,87,78,0,0,0,0,0,112,108,111,116,32,34,37,115,95,112,114,111,102,46,100,97,116,97,34,32,98,105,110,97,114,121,32,102,111,114,109,97,116,61,34,37,37,42,117,105,110,116,51,50,37,37,42,50,100,111,117,98,108,101,37,37,37,100,117,105,110,116,51,50,37,37,42,37,100,100,111,117,98,108,101,34,32,117,115,105,110,103,32,37,100,32,119,32,108,32,108,119,32,37,100,10,0,0,0,0,0,0,0,0,100,97,115,115,108,32,119,105,116,104,111,117,116,32,105,110,116,101,114,110,97,108,32,114,111,111,116,32,102,105,110,100,105,110,103,0,0,0,0,0,77,97,116,114,105,120,32,116,121,112,101,32,109,105,115,109,97,116,99,104,0,0,0,0,68,101,99,0,0,0,0,0,114,101,97,100,32,120,109,108,32,102,105,108,101,32,102,111,114,32,115,116,114,105,110,103,32,112,97,114,97,109,101,116,101,114,115,0,0,0,0,0,67,111,117,108,100,32,110,111,116,32,97,108,108,111,99,97,116,101,32,100,97,116,97,32,102,111,114,32,108,105,110,101,97,114,32,115,111,108,118,101,114,32,76,105,115,46,0,0,112,97,114,97,109,101,116,101,114,32,66,111,111,108,101,97,110,32,37,115,40,37,115,115,116,97,114,116,61,37,115,37,115,44,32,102,105,120,101,100,61,37,115,41,0,0,0,0,112,108,111,116,32,34,37,115,95,112,114,111,102,46,100,97,116,97,34,32,98,105,110,97,114,121,32,102,111,114,109,97,116,61,34,37,37,42,117,105,110,116,51,50,37,37,50,100,111,117,98,108,101,37,37,42,37,100,117,105,110,116,51,50,37,37,37,100,100,111,117,98,108,101,34,32,117,115,105,110,103,32,49,58,40,36,37,100,62,49,101,45,57,32,63,32,36,37,100,32,58,32,49,101,45,51,48,41,32,119,32,108,32,108,119,32,37,100,10,0,108,111,98,97,116,116,111,54,32,91,115,117,110,100,105,97,108,47,107,105,110,115,111,108,32,110,101,101,100,101,100,93,0,0,0,0,0,0,0,0,78,111,118,0,0,0,0,0,106,117,110,107,32,97,102,116,101,114,32,100,111,99,117,109,101,110,116,32,101,108,101,109,101,110,116,0,0,0,0,0,67,111,117,108,100,32,110,111,116,32,97,108,108,111,99,97,116,101,32,100,97,116,97,32,102,111,114,32,108,105,110,101,97,114,32,115,111,108,118,101,114,32,108,97,112,97,99,107,46,0,0,0,0,0,0,0,38,113,117,111,116,59,0,0,108,111,98,97,116,116,111,52,32,91,115,117,110,100,105,97,108,47,107,105,110,115,111,108,32,110,101,101,100,101,100,93,0,0,0,0,0,0,0,0,79,99,116,0,0,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,108,105,110,101,97,114,32,115,111,108,118,101,114,0,0,0,0,0,0,114,101,97,100,32,120,109,108,32,102,105,108,101,32,102,111,114,32,98,111,111,108,101,97,110,32,112,97,114,97,109,101,116,101,114,115,0,0,0,0,82,101,113,117,101,115,116,101,100,32,101,113,117,97,116,105,111,110,32,119,105,116,104,32,112,114,111,102,105,108,101,114,32,105,110,100,101,120,32,37,108,100,44,32,98,117,116,32,99,111,117,108,100,32,110,111,116,32,102,105,110,100,32,105,116,33,0,0,0,0,0,0,116,105,109,101,40,41,32,102,97,105,108,101,100,58,32,37,115,0,0,0,0,0,0,0,69,114,114,111,114,44,32,99,97,110,32,110,111,116,32,103,101,116,32,77,97,116,114,105,120,32,66,32,0,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,111,112,116,105,111,110,32,45,108,115,32,37,115,44,32,99,117,114,114,101,110,116,32,111,112,116,105,111,110,115,32,97,114,101,58,0,0,0,0,0,0,0,0,115,105,109,117,108,97,116,105,111,110,95,105,110,112,117,116,95,120,109,108,46,99,112,112,58,32,69,114,114,111,114,58,32,102,97,105,108,101,100,32,116,111,32,114,101,97,100,32,116,104,101,32,88,77,76,32,100,97,116,97,32,37,115,58,32,37,115,32,97,116,32,108,105,110,101,32,37,108,117,10,0,0,0,0,0,0,0,0,68,97,116,97,83,101,116,58,32,116,105,109,101,10,0,0,76,79,71,95,73,80,79,80,84,0,0,0,0,0,0,0,67,97,110,110,111,116,32,119,114,105,116,101,32,116,111,32,102,105,108,101,32,37,115,0,91,37,108,100,93,32,91,37,49,53,103,93,32,58,61,32,37,115,32,40,100,105,115,99,114,101,116,101,41,32,91,115,99,97,108,105,110,103,32,99,111,101,102,102,105,99,105,101,110,116,58,32,37,103,93,0,91,91,58,100,105,103,105,116,58,93,93,0,0,0,0,0,38,97,112,111,115,59,0,0,108,111,98,97,116,116,111,50,32,91,115,117,110,100,105,97,108,47,107,105,110,115,111,108,32,110,101,101,100,101,100,93,0,0,0,0,0,0,0,0,37,49,50,103,115,32,91,37,53,46,49,102,37,37,93,32,115,116,101,112,115,0,0,0,83,101,112,0,0,0,0,0,106,97,99,111,98,105,97,110,32,102,117,110,99,116,105,111,110,32,112,111,105,110,116,101,114,32,105,115,32,105,110,118,97,108,105,100,0,0,0,0,112,97,114,97,109,101,116,101,114,32,73,110,116,101,103,101,114,32,37,115,40,37,115,115,116,97,114,116,61,37,108,100,37,115,44,32,102,105,120,101,100,61,37,115,44,32,109,105,110,61,37,108,100,44,32,109,97,120,61,37,108,100,41,0,117,110,114,101,99,111,103,110,105,122,101,100,32,109,105,120,101,100,32,115,111,108,118,101,114,0,0,0,0,0,0,0,38,103,116,59,0,0,0,0,114,97,100,97,117,49,32,91,115,117,110,100,105,97,108,47,107,105,110,115,111,108,32,110,101,101,100,101,100,93,0,0,65,117,103,0,0,0,0,0,114,101,97,100,32,120,109,108,32,102,105,108,101,32,102,111,114,32,105,110,116,101,103,101,114,32,112,97,114,97,109,101,116,101,114,115,0,0,0,0,83,105,109,117,108,97,116,105,111,110,32,99,97,108,108,32,116,101,114,109,105,110,97,116,101,40,41,32,97,116,32,116,105,109,101,32,37,102,10,77,101,115,115,97,103,101,32,58,32,37,115,0,0,0,0,0,95,112,114,111,102,46,100,97,116,97,0,0,0,0,0,0,114,116,95,105,110,105,116,0,112,114,105,110,116,77,111,100,101,108,73,110,102,111,0,0,112,105,118,111,116,0,0,0,111,109,99,95,109,97,116,108,97,98,52,95,114,101,97,100,95,118,97,108,115,0,0,0,111,109,99,95,109,97,116,108,97,98,52,95,114,101,97,100,95,115,105,110,103,108,101,95,118,97,108,0,0,0,0,0,109,111,100,101,108,73,110,102,111,88,109,108,73,110,105,116,0,0,0,0,0,0,0,0,102,105,110,100,82,111,111,116,0,0,0,0,0,0,0,0,100,97,115,114,116,95,115,116,101,112,0,0,0,0,0,0,98,105,115,101,99,116,105,111,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,72,58,37,77,58,37,83,37,72,58,37,77,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,89,45,37,109,45,37,100,37,109,47,37,100,47,37,121,37,72,58,37,77,58,37,83,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,64,2,1,0,40,0,0,0,144,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,2,1,0,236,0,0,0,198,0,0,0,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,2,1,0,86,0,0,0,54,1,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,2,1,0,110,0,0,0,30,0,0,0,170,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,2,1,0,110,0,0,0,8,0,0,0,170,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,2,1,0,110,0,0,0,24,0,0,0,170,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,2,1,0,204,0,0,0,98,0,0,0,60,0,0,0,2,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,2,1,0,46,1,0,0,226,0,0,0,60,0,0,0,4,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,2,1,0,196,0,0,0,228,0,0,0,60,0,0,0,8,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,3,1,0,48,1,0,0,174,0,0,0,60,0,0,0,6,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,3,1,0,42,1,0,0,108,0,0,0,60,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,3,1,0,194,0,0,0,134,0,0,0,60,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,3,1,0,48,0,0,0,136,0,0,0,60,0,0,0,188,0,0,0,6,0,0,0,30,0,0,0,8,0,0,0,20,0,0,0,56,0,0,0,2,0,0,0,248,255,255,255,232,3,1,0,32,0,0,0,18,0,0,0,54,0,0,0,24,0,0,0,10,0,0,0,52,0,0,0,196,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,4,1,0,232,0,0,0,16,1,0,0,60,0,0,0,30,0,0,0,2,0,0,0,60,0,0,0,26,0,0,0,18,0,0,0,4,0,0,0,4,0,0,0,248,255,255,255,16,4,1,0,112,0,0,0,164,0,0,0,182,0,0,0,192,0,0,0,154,0,0,0,74,0,0,0,88,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,4,1,0,92,0,0,0,52,0,0,0,60,0,0,0,80,0,0,0,66,0,0,0,14,0,0,0,64,0,0,0,74,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,4,1,0,74,0,0,0,80,0,0,0,60,0,0,0,70,0,0,0,138,0,0,0,28,0,0,0,80,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,4,1,0,36,1,0,0,2,0,0,0,60,0,0,0,46,0,0,0,38,0,0,0,90,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,4,1,0,58,0,0,0,6,0,0,0,60,0,0,0,12,0,0,0,18,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,4,1,0,4,1,0,0,218,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,4,1,0,36,0,0,0,172,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,4,1,0,64,0,0,0,210,0,0,0,60,0,0,0,8,0,0,0,6,0,0,0,14,0,0,0,4,0,0,0,12,0,0,0,4,0,0,0,2,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,4,1,0,114,0,0,0,20,0,0,0,60,0,0,0,24,0,0,0,28,0,0,0,34,0,0,0,26,0,0,0,32,0,0,0,8,0,0,0,6,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,4,1,0,50,0,0,0,28,0,0,0,60,0,0,0,48,0,0,0,46,0,0,0,38,0,0,0,40,0,0,0,28,0,0,0,44,0,0,0,36,0,0,0,54,0,0,0,52,0,0,0,50,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,5,1,0,68,0,0,0,4,0,0,0,60,0,0,0,74,0,0,0,66,0,0,0,24,0,0,0,64,0,0,0,58,0,0,0,76,0,0,0,62,0,0,0,72,0,0,0,70,0,0,0,68,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,5,1,0,88,0,0,0,106,0,0,0,60,0,0,0,46,0,0,0,22,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,5,1,0,34,0,0,0,212,0,0,0,60,0,0,0,100,0,0,0,30,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,5,1,0,12,0,0,0,224,0,0,0,60,0,0,0,2,0,0,0,12,0,0,0,110,0,0,0,186,0,0,0,108,0,0,0,116,0,0,0,174,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,5,1,0,220,0,0,0,166,0,0,0,60,0,0,0,14,0,0,0,16,0,0,0,104,0,0,0,84,0,0,0,16,0,0,0,106,0,0,0,150,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,5,1,0,220,0,0,0,26,0,0,0,60,0,0,0,6,0,0,0,4,0,0,0,26,0,0,0,158,0,0,0,98,0,0,0,54,0,0,0,200,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,5,1,0,220,0,0,0,118,0,0,0,60,0,0,0,8,0,0,0,10,0,0,0,114,0,0,0,50,0,0,0,122,0,0,0,50,0,0,0,204,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,5,1,0,220,0,0,0,44,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,5,1,0,72,0,0,0,190,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,5,1,0,220,0,0,0,94,0,0,0,60,0,0,0,42,0,0,0,30,0,0,0,50,0,0,0,96,0,0,0,34,0,0,0,60,0,0,0,76,0,0,0,6,0,0,0,18,0,0,0,86,0,0,0,18,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,6,1,0,52,1,0,0,46,0,0,0,60,0,0,0,28,0,0,0,16,0,0,0,58,0,0,0,68,0,0,0,22,0,0,0,60,0,0,0,50,0,0,0,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,0,0,0,0,0,0,0,64,6,1,0,250,0,0,0,234,0,0,0,200,255,255,255,200,255,255,255,64,6,1,0,42,0,0,0,120,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,6,1,0,156,0,0,0,12,1,0,0,124,0,0,0,14,0,0,0,30,0,0,0,66,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
.concat([0,0,0,0,96,6,1,0,220,0,0,0,100,0,0,0,60,0,0,0,8,0,0,0,10,0,0,0,114,0,0,0,50,0,0,0,122,0,0,0,50,0,0,0,204,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,6,1,0,220,0,0,0,200,0,0,0,60,0,0,0,8,0,0,0,10,0,0,0,114,0,0,0,50,0,0,0,122,0,0,0,50,0,0,0,204,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,6,1,0,62,0,0,0,2,1,0,0,86,0,0,0,74,0,0,0,30,0,0,0,4,0,0,0,82,0,0,0,142,0,0,0,36,0,0,0,190,0,0,0,20,0,0,0,90,0,0,0,34,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,6,1,0,162,0,0,0,26,1,0,0,38,0,0,0,44,0,0,0,20,0,0,0,24,0,0,0,144,0,0,0,132,0,0,0,64,0,0,0,46,0,0,0,40,0,0,0,20,0,0,0,84,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,6,1,0,10,0,0,0,148,0,0,0,86,0,0,0,74,0,0,0,34,0,0,0,20,0,0,0,82,0,0,0,142,0,0,0,36,0,0,0,12,0,0,0,20,0,0,0,96,0,0,0,34,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,168,6,1,0,146,0,0,0,122,0,0,0,152,255,255,255,152,255,255,255,168,6,1,0,102,0,0,0,216,0,0,0,0,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,184,6,1,0,158,0,0,0,214,0,0,0,148,255,255,255,148,255,255,255,184,6,1,0,124,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,232,6,1,0,54,0,0,0,254,0,0,0,252,255,255,255,252,255,255,255,232,6,1,0,180,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,7,1,0,6,1,0,0,28,1,0,0,252,255,255,255,252,255,255,255,0,7,1,0,132,0,0,0,242,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,24,7,1,0,104,0,0,0,56,1,0,0,248,255,255,255,248,255,255,255,24,7,1,0,222,0,0,0,24,1,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,48,7,1,0,130,0,0,0,246,0,0,0,248,255,255,255,248,255,255,255,48,7,1,0,170,0,0,0,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,7,1,0,0,1,0,0,78,0,0,0,66,0,0,0,58,0,0,0,16,0,0,0,18,0,0,0,78,0,0,0,142,0,0,0,36,0,0,0,148,0,0,0,20,0,0,0,52,0,0,0,34,0,0,0,94,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,7,1,0,244,0,0,0,8,1,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,7,1,0,38,1,0,0,20,1,0,0,32,0,0,0,44,0,0,0,20,0,0,0,24,0,0,0,90,0,0,0,132,0,0,0,64,0,0,0,46,0,0,0,40,0,0,0,20,0,0,0,62,0,0,0,98,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,7,1,0,188,0,0,0,252,0,0,0,58,0,0,0,74,0,0,0,34,0,0,0,20,0,0,0,146,0,0,0,142,0,0,0,36,0,0,0,12,0,0,0,20,0,0,0,96,0,0,0,78,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,7,1,0,14,1,0,0,178,0,0,0,60,0,0,0,110,0,0,0,184,0,0,0,70,0,0,0,116,0,0,0,6,0,0,0,52,0,0,0,86,0,0,0,42,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,7,1,0,128,0,0,0,70,0,0,0,60,0,0,0,172,0,0,0,178,0,0,0,94,0,0,0,110,0,0,0,112,0,0,0,46,0,0,0,176,0,0,0,76,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,1,0,18,1,0,0,142,0,0,0,60,0,0,0,26,0,0,0,94,0,0,0,10,0,0,0,68,0,0,0,118,0,0,0,78,0,0,0,152,0,0,0,82,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,8,1,0,90,0,0,0,208,0,0,0,60,0,0,0,162,0,0,0,168,0,0,0,50,0,0,0,104,0,0,0,48,0,0,0,40,0,0,0,128,0,0,0,102,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,8,1,0,44,1,0,0,18,0,0,0,84,0,0,0,44,0,0,0,20,0,0,0,24,0,0,0,144,0,0,0,132,0,0,0,64,0,0,0,116,0,0,0,134,0,0,0,30,0,0,0,84,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,8,1,0,16,0,0,0,10,1,0,0,92,0,0,0,74,0,0,0,34,0,0,0,20,0,0,0,82,0,0,0,142,0,0,0,36,0,0,0,156,0,0,0,34,0,0,0,6,0,0,0,34,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,8,1,0,40,1,0,0,238,0,0,0,76,0,0,0,186,0,0,0,10,0,0,0,2,0,0,0,26,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,119,0,0,0,0,0,0,0,116,0,0,0,0,0,0,0,115,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,102,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,83,116,49,50,111,117,116,95,111,102,95,114,97,110,103,101,0,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,98,97,115,105,99,95,111,115,116,114,105,110,103,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,105,110,103,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,98,97,115,105,99,95,111,102,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,78,83,116,51,95,95,49,49,52,98,97,115,105,99,95,105,102,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,102,105,108,101,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,0,0,0,0,80,245,0,0,0,0,0,0,96,245,0,0,0,0,0,0,112,245,0,0,56,2,1,0,0,0,0,0,0,0,0,0,128,245,0,0,56,2,1,0,0,0,0,0,0,0,0,0,144,245,0,0,56,2,1,0,0,0,0,0,0,0,0,0,168,245,0,0,144,2,1,0,0,0,0,0,0,0,0,0,192,245,0,0,144,2,1,0,0,0,0,0,0,0,0,0,216,245,0,0,56,2,1,0,0,0,0,0,0,0,0,0,232,245,0,0,0,245,0,0,0,246,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,160,7,1,0,0,0,0,0,0,245,0,0,72,246,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,168,7,1,0,0,0,0,0,0,245,0,0,144,246,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,176,7,1,0,0,0,0,0,0,245,0,0,216,246,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,184,7,1,0,0,0,0,0,0,0,0,0,32,247,0,0,152,4,1,0,0,0,0,0,0,0,0,0,80,247,0,0,152,4,1,0,0,0,0,0,0,245,0,0,128,247,0,0,0,0,0,0,1,0,0,0,208,6,1,0,0,0,0,0,0,245,0,0,152,247,0,0,0,0,0,0,1,0,0,0,208,6,1,0,0,0,0,0,0,245,0,0,176,247,0,0,0,0,0,0,1,0,0,0,216,6,1,0,0,0,0,0,0,245,0,0,200,247,0,0,0,0,0,0,1,0,0,0,216,6,1,0,0,0,0,0,0,245,0,0,224,247,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,80,8,1,0,0,8,0,0,0,245,0,0,40,248,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,80,8,1,0,0,8,0,0,0,245,0,0,112,248,0,0,0,0,0,0,3,0,0,0,208,5,1,0,2,0,0,0,160,2,1,0,2,0,0,0,48,6,1,0,0,8,0,0,0,245,0,0,184,248,0,0,0,0,0,0,3,0,0,0,208,5,1,0,2,0,0,0,160,2,1,0,2,0,0,0,56,6,1,0,0,8,0,0,0,0,0,0,0,249,0,0,208,5,1,0,0,0,0,0,0,0,0,0,24,249,0,0,208,5,1,0,0,0,0,0,0,245,0,0,48,249,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,224,6,1,0,2,0,0,0,0,245,0,0,72,249,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,224,6,1,0,2,0,0,0,0,0,0,0,96,249,0,0,0,0,0,0,120,249,0,0,88,7,1,0,0,0,0,0,0,245,0,0,152,249,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,72,3,1,0,0,0,0,0,0,245,0,0,224,249,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,96,3,1,0,0,0,0,0,0,245,0,0,40,250,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,120,3,1,0,0,0,0,0,0,245,0,0,112,250,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,144,3,1,0,0,0,0,0,0,0,0,0,184,250,0,0,208,5,1,0,0,0,0,0,0,0,0,0,208,250,0,0,208,5,1,0,0,0,0,0,0,245,0,0,232,250,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,104,7,1,0,2,0,0,0,0,245,0,0,16,251,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,104,7,1,0,2,0,0,0,0,245,0,0,56,251,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,104,7,1,0,2,0,0,0,0,245,0,0,96,251,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,104,7,1,0,2,0,0,0,0,0,0,0,136,251,0,0,200,6,1,0,0,0,0,0,0,0,0,0,160,251,0,0,208,5,1,0,0,0,0,0,0,245,0,0,184,251,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,72,8,1,0,2,0,0,0,0,245,0,0,208,251,0,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,72,8,1,0,2,0,0,0,0,0,0,0,232,251,0,0,0,0,0,0,16,252,0,0,0,0,0,0,56,252,0,0,0,7,1,0,0,0,0,0,0,0,0,0,128,252,0,0,112,7,1,0,0,0,0,0,0,0,0,0,160,252,0,0,176,5,1,0,0,0,0,0,0,0,0,0,200,252,0,0,176,5,1,0,0,0,0,0,0,0,0,0,240,252,0,0,152,6,1,0,0,0,0,0,0,0,0,0,56,253,0,0,0,0,0,0,112,253,0,0,0,0,0,0,168,253,0,0,0,0,0,0,200,253,0,0,0,7,1,0,0,0,0,0,0,0,0,0,248,253,0,0,48,7,1,0,0,0,0,0,0,0,0,0,40,254,0,0,0,0,0,0,72,254,0,0,0,0,0,0,104,254,0,0,0,0,0,0,136,254,0,0,0,245,0,0,160,254,0,0,0,0,0,0,1,0,0,0,40,3,1,0,3,244,255,255,0,245,0,0,208,254,0,0,0,0,0,0,1,0,0,0,56,3,1,0,3,244,255,255,0,245,0,0,0,255,0,0,0,0,0,0,1,0,0,0,40,3,1,0,3,244,255,255,0,245,0,0,48,255,0,0,0,0,0,0,1,0,0,0,56,3,1,0,3,244,255,255,0,0,0,0,96,255,0,0,152,6,1,0,0,0,0,0,0,0,0,0,144,255,0,0,96,2,1,0,0,0,0,0,0,0,0,0,168,255,0,0,0,0,0,0,192,255,0,0,160,6,1,0,0,0,0,0,0,0,0,0,216,255,0,0,144,6,1,0,0,0,0,0,0,0,0,0,248,255,0,0,152,6,1,0,0,0,0,0,0,0,0,0,24,0,1,0,0,0,0,0,56,0,1,0,0,0,0,0,88,0,1,0,0,0,0,0,120,0,1,0,0,245,0,0,152,0,1,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,64,8,1,0,2,0,0,0,0,245,0,0,184,0,1,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,64,8,1,0,2,0,0,0,0,245,0,0,216,0,1,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,64,8,1,0,2,0,0,0,0,245,0,0,248,0,1,0,0,0,0,0,2,0,0,0,208,5,1,0,2,0,0,0,64,8,1,0,2,0,0,0,0,0,0,0,24,1,1,0,0,0,0,0,48,1,1,0,0,0,0,0,72,1,1,0,0,0,0,0,96,1,1,0,144,6,1,0,0,0,0,0,0,0,0,0,120,1,1,0,152,6,1,0,0,0,0,0,0,0,0,0,144,1,1,0,152,8,1,0,0,0,0,0,0,0,0,0,184,1,1,0,152,8,1,0,0,0,0,0,0,0,0,0,224,1,1,0,168,8,1,0,0,0,0,0,0,0,0,0,8,2,1,0,48,2,1,0,0,0,0,0,56,0,0,0,0,0,0,0,0,7,1,0,6,1,0,0,28,1,0,0,200,255,255,255,200,255,255,255,0,7,1,0,132,0,0,0,242,0,0,0,104,0,0,0,0,0,0,0,0,7,1,0,6,1,0,0,28,1,0,0,152,255,255,255,152,255,255,255,0,7,1,0,132,0,0,0,242,0,0,0,108,0,0,0,0,0,0,0,48,7,1,0,130,0,0,0,246,0,0,0,148,255,255,255,148,255,255,255,48,7,1,0,170,0,0,0,66,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0,71,46,71,32,47,32,40,49,46,48,32,43,32,71,46,97,108,112,104,97,32,42,32,40,71,46,84,32,45,32,71,46,84,95,114,101,102,41,41,32,98,101,99,97,117,115,101,32,49,46,48,32,43,32,71,46,97,108,112,104,97,32,42,32,40,71,46,84,32,45,32,71,46,84,95,114,101,102,41,32,61,61,32,48,58,32,70,105,108,101,58,32,47,104,111,109,101,47,116,115,104,111,114,116,47,111,109,47,98,117,105,108,100,47,108,105,98,47,111,109,108,105,98,114,97,114,121,47,77,111,100,101,108,105,99,97,32,51,46,50,46,49,47,69,108,101,99,116,114,105,99,97,108,47,65,110,97,108,111,103,47,66,97,115,105,99,46,109,111,32,76,105,110,101,58,32,50,50,51,0,0,0,0,0,71,46,71,32,47,32,40,49,46,48,32,43,32,71,46,97,108,112,104,97,32,42,32,40,71,46,84,32,45,32,71,46,84,95,114,101,102,41,41,32,98,101,99,97,117,115,101,32,49,46,48,32,43,32,71,46,97,108,112,104,97,32,42,32,40,71,46,84,32,45,32,71,46,84,95,114,101,102,41,32,61,61,32,48,58,32,70,105,108,101,58,32,47,104,111,109,101,47,116,115,104,111,114,116,47,111,109,47,98,117,105,108,100,47,108,105,98,47,111,109,108,105,98,114,97,114,121,47,77,111,100,101,108,105,99,97,32,51,46,50,46,49,47,69,108,101,99,116,114,105,99,97,108,47,65,110,97,108,111,103,47,66,97,115,105,99,46,109,111,32,76,105,110,101,58,32,50,50,51,0,0,0,0,0,76,46,118,32,47,32,76,46,76,32,98,101,99,97,117,115,101,32,76,46,76,32,61,61,32,48,58,32,70,105,108,101,58,32,47,104,111,109,101,47,116,115,104,111,114,116,47,111,109,47,98,117,105,108,100,47,108,105,98,47,111,109,108,105,98,114,97,114,121,47,77,111,100,101,108,105,99,97,32,51,46,50,46,49,47,69,108,101,99,116,114,105,99,97,108,47,65,110,97,108,111,103,47,66,97,115,105,99,46,109,111,32,76,105,110,101,58,32,51,51,56,0,0,0,0,0,0,0,76,46,118,32,47,32,76,46,76,32,98,101,99,97,117,115,101,32,76,46,76,32,61,61,32,48,58,32,70,105,108,101,58,32,47,104,111,109,101,47,116,115,104,111,114,116,47,111,109,47,98,117,105,108,100,47,108,105,98,47,111,109,108,105,98,114,97,114,121,47,77,111,100,101,108,105,99,97,32,51,46,50,46,49,47,69,108,101,99,116,114,105,99,97,108,47,65,110,97,108,111,103,47,66,97,115,105,99,46,109,111,32,76,105,110,101,58,32,51,51,56,0,0,0,0,0,0,0,67,49,46,105,32,47,32,67,49,46,67,32,98,101,99,97,117,115,101,32,67,49,46,67,32,61,61,32,48,58,32,70,105,108,101,58,32,47,104,111,109,101,47,116,115,104,111,114,116,47,111,109,47,98,117,105,108,100,47,108,105,98,47,111,109,108,105,98,114,97,114,121,47,77,111,100,101,108,105,99,97,32,51,46,50,46,49,47,69,108,101,99,116,114,105,99,97,108,47,65,110,97,108,111,103,47,66,97,115,105,99,46,109,111,32,76,105,110,101,58,32,50,56,54,0,0,0,0,67,49,46,105,32,47,32,67,49,46,67,32,98,101,99,97,117,115,101,32,67,49,46,67,32,61,61,32,48,58,32,70,105,108,101,58,32,47,104,111,109,101,47,116,115,104,111,114,116,47,111,109,47,98,117,105,108,100,47,108,105,98,47,111,109,108,105,98,114,97,114,121,47,77,111,100,101,108,105,99,97,32,51,46,50,46,49,47,69,108,101,99,116,114,105,99,97,108,47,65,110,97,108,111,103,47,66,97,115,105,99,46,109,111,32,76,105,110,101,58,32,50,56,54,0,0,0,0,67,50,46,105,32,47,32,67,50,46,67,32,98,101,99,97,117,115,101,32,67,50,46,67,32,61,61,32,48,58,32,70,105,108,101,58,32,47,104,111,109,101,47,116,115,104,111,114,116,47,111,109,47,98,117,105,108,100,47,108,105,98,47,111,109,108,105,98,114,97,114,121,47,77,111,100,101,108,105,99,97,32,51,46,50,46,49,47,69,108,101,99,116,114,105,99,97,108,47,65,110,97,108,111,103,47,66,97,115,105,99,46,109,111,32,76,105,110,101,58,32,50,56,54,0,0,0,0,67,50,46,105,32,47,32,67,50,46,67,32,98,101,99,97,117,115,101,32,67,50,46,67,32,61,61,32,48,58,32,70,105,108,101,58,32,47,104,111,109,101,47,116,115,104,111,114,116,47,111,109,47,98,117,105,108,100,47,108,105,98,47,111,109,108,105,98,114,97,114,121,47,77,111,100,101,108,105,99,97,32,51,46,50,46,49,47,69,108,101,99,116,114,105,99,97,108,47,65,110,97,108,111,103,47,66,97,115,105,99,46,109,111,32,76,105,110,101,58,32,50,56,54,0,0,0,0,0,0,0,0,24,219,0,0,104,153,0,0,40,132,0,0,200,118,0,0,0,106,0,0,216,96,0,0,64,91,0,0,184,82,0,0,48,227,0,0,96,217,0,0,64,207,0,0,80,200,0,0,72,196,0,0,128,193,0,0,208,190,0,0,64,188,0,0,16,186,0,0,136,184,0,0,112,182,0,0,104,180,0,0,56,177,0,0,144,175,0,0,160,173,0,0,112,171,0,0,248,168,0,0,208,165,0,0,0,164,0,0,240,161,0,0,208,160,0,0,40,159,0,0,0,155,0,0,192,152,0,0,144,149,0,0,192,148,0,0,112,146,0,0,40,144,0,0,176,142,0,0,96,140,0,0,96,138,0,0,16,135,0,0,0,0,0,0,88,96,0,0,144,82,0,0,240,81,0,0,184,217,0,0,0,81,0,0,48,80,0,0,40,217,0,0,152,215,0,0,80,215,0,0,8,215,0,0,104,214,0,0,152,213,0,0,176,212,0,0,200,211,0,0,248,207,0,0,152,207,0,0,32,207,0,0,56,206,0,0,176,220,0,0,104,219,0,0,88,96,0,0,144,82,0,0,240,81,0,0,72,81,0,0,0,81,0,0,48,80,0,0,160,79,0,0,208,78,0,0,120,230,0,0,160,229,0,0,144,227,0,0,0,227,0,0,184,225,0,0,0,225,0,0,128,224,0,0,216,223,0,0,104,223,0,0,128,222,0,0,176,220,0,0,104,219,0,0,88,96,0,0,8,93,0,0,112,91,0,0,216,90,0,0,152,90,0,0,64,90,0,0,216,89,0,0,0,0,0,0,88,96,0,0,0,96,0,0,144,95,0,0,216,94,0,0,80,94,0,0,224,93,0,0,88,93,0,0,0,0,0,0,64,225,0,0,64,220,0,0,152,90,0,0,32,159,0,0,112,137,0,0,0,0,0,0,88,96,0,0,104,218,0,0,80,94,0,0,56,93,0,0,112,137,0,0,0,0,0,0,1,0,0,0,19,0,0,0,1,0,0,0,19,0,0,0,136,15,1,0,128,15,1,0,120,137,0,0,96,196,0,0,0,0,0,0,0,0,0,0,104,94,0,0,64,0,0,0,3,0,0,0,64,0,0,0,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,222,0,0,50,1,0,0,5,0,0,0,51,1,0,0,99,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,94,0,0,217,0,0,0,3,0,0,0,217,0,0,0,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,94,0,0,27,1,0,0,5,0,0,0,27,1,0,0,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,125,0,0,5,0,0,0,3,0,0,0,5,0,0,0,67,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,125,0,0,6,0,0,0,3,0,0,0,6,0,0,0,67,0,0,0,0,0,0,0,104,94,0,0,74,0,0,0,3,0,0,0,74,0,0,0,108,0,0,0,0,0,0,0,104,94,0,0,227,0,0,0,3,0,0,0,227,0,0,0,108,0,0,0,0,0,0,0,74,0,0,0,248,0,0,0,116,0,0,0,30,1,0,0,230,0,0,0,138,0,0,0,98,0,0,0,140,0,0,0,72,0,0,0,56,0,0,0,208,0,0,0,44,0,0,0,126,0,0,0,2,0,0,0,68,0,0,0,130,0,0,0,88,0,0,0,1,0,0,0,0,0,0,0,198,0,0,0,64,0,0,0,76,0,0,0,82,0,0,0,12,0,0,0,102,0,0,0,66,0,0,0,14,0,0,0,240,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,2,0,0,0,8,0,0,0,6,0,0,0,118,0,0,0,4,0,0,0,166,0,0,0,22,0,0,0,114,0,0,0,62,0,0,0,180,0,0,0,4,0,0,0,26,0,0,0,42,0,0,0,52,0,0,0,0,0,0,0,88,96,0,0,160,180,0,0,240,98,0,0,216,98,0,0,8,180,0,0,240,96,0,0,16,205,0,0,88,217,0,0,8,180,0,0,128,157,0,0,0,135,0,0,136,121,0,0,96,108,0,0,72,98,0,0,80,92,0,0,104,85,0,0,40,229,0,0,248,218,0,0,64,208,0,0,120,201,0,0,216,196,0,0,232,193,0,0,64,191,0,0,184,188,0,0,128,186,0,0,192,184,0,0,40,183,0,0,216,180,0,0,136,177,0,0,232,175,0,0,0,174,0,0,0,0,0,0,88,96,0,0,80,169,0,0,80,169,0,0,56,166,0,0,64,164,0,0,80,162,0,0,72,160,0,0,56,158,0,0,40,154,0,0,72,152,0,0,0,150,0,0,0,148,0,0,16,146,0,0,104,144,0,0,88,142,0,0,224,140,0,0,160,138,0,0,104,136,0,0,120,132,0,0,248,130,0,0,216,129,0,0,176,128,0,0,144,127,0,0,88,126,0,0,120,125,0,0,0,0,0,0,121,101,115,0,0,0,0,0,118,101,114,115,105,111,110,0,115,116,97,110,100,97,108,111,110,101,0,0,0,0,0,0,110,111,0,0,0,0,0,0,101,110,99,111,100,105,110,103,0,0,0,0,0,0,0,0,85,84,70,45,56,0,0,0,85,84,70,45,49,54,76,69,0,0,0,0,0,0,0,0,85,84,70,45,49,54,66,69,0,0,0,0,0,0,0,0,85,84,70,45,49,54,0,0,85,83,45,65,83,67,73,73,0,0,0,0,0,0,0,0,83,89,83,84,69,77,0,0,82,69,81,85,73,82,69,68,0,0,0,0,0,0,0,0,80,85,66,76,73,67,0,0,80,67,68,65,84,65,0,0,78,79,84,65,84,73,79,78,0,0,0,0,0,0,0,0,78,77,84,79,75,69,78,83,0,0,0,0,0,0,0,0,78,77,84,79,75,69,78,0,78,68,65,84,65,0,0,0,73,83,79,45,56,56,53,57,45,49,0,0,0,0,0,0,73,78,67,76,85,68,69,0,73,77,80,76,73,69,68,0,73,71,78,79,82,69,0,0,73,68,82,69,70,83,0,0,73,68,82,69,70,0,0,0,73,68,0,0,0,0,0,0,70,73,88,69,68,0,0,0,69,78,84,73,84,89,0,0,69,78,84,73,84,73,69,83,0,0,0,0,0,0,0,0,69,77,80,84,89,0,0,0,69,76,69,77,69,78,84,0,68,79,67,84,89,80,69,0,67,68,65,84,65,0,0,0,65,84,84,76,73,83,84,0,65,78,89,0,0,0,0,0,88,96,0,0,120,86,0,0,200,85,0,0,240,82,0,0,88,96,0,0,56,89,0,0,0,88,0,0,64,87,0,0,8,118,0,0,32,193,0,0,0,171,0,0,176,147,0,0,112,128,0,0,240,115,0,0,128,102,0,0,32,95,0,0,16,90,0,0,112,80,0,0,24,224,0,0,184,214,0,0,240,204,0,0,64,199,0,0,112,80,0,0,200,195,0,0,240,192,0,0,88,190,0,0,160,187,0,0,152,185,0,0,40,184,0,0,40,182,0,0,184,178,0,0,152,176,0,0,72,175,0,0,40,173,0,0,184,170,0,0,48,168,0,0,144,165,0,0,160,163,0,0,56,161,0,0,120,159,0,0,8,115,0,0,216,192,0,0,240,170,0,0,72,245,0,0,168,213,0,0,40,116,0,0,152,102,0,0,240,95,0,0,40,90,0,0,40,81,0,0,232,224,0,0,64,245,0,0,200,205,0,0,192,199,0,0,8,196,0,0,8,193,0,0,112,190,0,0,184,187,0,0,232,185,0,0,56,184,0,0,72,182,0,0,48,179,0,0,224,176,0,0,96,175,0,0,24,80,0,0,56,245,0,0,40,245,0,0,136,178,0,0,88,96,0,0,48,116,0,0,24,115,0,0,144,156,0,0,0,114,0,0,120,151,0,0,96,149,0,0,200,112,0,0,80,111,0,0,144,143,0,0,248,141,0,0,248,139,0,0,240,137,0,0,208,110,0,0,24,107,0,0,16,106,0,0,24,105,0,0,136,128,0,0,96,127,0,0,40,126,0,0,48,104,0,0,160,102,0,0,168,100,0,0,48,120,0,0,232,118,0,0,24,118,0,0,120,117,0,0,136,178,0,0,88,96,0,0,128,161,0,0,136,159,0,0,144,156,0,0,120,153,0,0,120,151,0,0,96,149,0,0,104,147,0,0,184,145,0,0,144,143,0,0,248,141,0,0,248,139,0,0,240,137,0,0,64,134,0,0,64,132,0,0,176,130,0,0,144,129,0,0,136,128,0,0,96,127,0,0,40,126,0,0,184,124,0,0,192,123,0,0,96,122,0,0,48,120,0,0,232,118,0,0,24,118,0,0,120,117,0,0,136,178,0,0,65,49,32,98,116,46,32,105,114,49,32,110,97,32,32,84,106,32,32,114,101,32,32,97,99,32,32,110,116,32,32,115,111,32,32,32,114,32,32,32,121,32,32,32,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  Module["_strlen"] = _strlen;
  Module["_strncpy"] = _strncpy;
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 0777, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 0777 | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },reconcile:function (src, dst, callback) {
        var total = 0;
        var create = {};
        for (var key in src.files) {
          if (!src.files.hasOwnProperty(key)) continue;
          var e = src.files[key];
          var e2 = dst.files[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create[key] = e;
            total++;
          }
        }
        var remove = {};
        for (var key in dst.files) {
          if (!dst.files.hasOwnProperty(key)) continue;
          var e = dst.files[key];
          var e2 = src.files[key];
          if (!e2) {
            remove[key] = e;
            total++;
          }
        }
        if (!total) {
          // early out
          return callback(null);
        }
        var completed = 0;
        function done(err) {
          if (err) return callback(err);
          if (++completed >= total) {
            return callback(null);
          }
        };
        // create a single transaction to handle and IDB reads / writes we'll need to do
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        transaction.onerror = function transaction_onerror() { callback(this.error); };
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
        for (var path in create) {
          if (!create.hasOwnProperty(path)) continue;
          var entry = create[path];
          if (dst.type === 'local') {
            // save file to local
            try {
              if (FS.isDir(entry.mode)) {
                FS.mkdir(path, entry.mode);
              } else if (FS.isFile(entry.mode)) {
                var stream = FS.open(path, 'w+', 0666);
                FS.write(stream, entry.contents, 0, entry.contents.length, 0, true /* canOwn */);
                FS.close(stream);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // save file to IDB
            var req = store.put(entry, path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
        for (var path in remove) {
          if (!remove.hasOwnProperty(path)) continue;
          var entry = remove[path];
          if (dst.type === 'local') {
            // delete file from local
            try {
              if (FS.isDir(entry.mode)) {
                // TODO recursive delete?
                FS.rmdir(path);
              } else if (FS.isFile(entry.mode)) {
                FS.unlink(path);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // delete file from IDB
            var req = store.delete(path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
      },getLocalSet:function (mount, callback) {
        var files = {};
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
        var check = FS.readdir(mount.mountpoint)
          .filter(isRealDir)
          .map(toAbsolute(mount.mountpoint));
        while (check.length) {
          var path = check.pop();
          var stat, node;
          try {
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path)
              .filter(isRealDir)
              .map(toAbsolute(path)));
            files[path] = { mode: stat.mode, timestamp: stat.mtime };
          } else if (FS.isFile(stat.mode)) {
            files[path] = { contents: node.contents, mode: stat.mode, timestamp: stat.mtime };
          } else {
            return callback(new Error('node type not supported'));
          }
        }
        return callback(null, { type: 'local', files: files });
      },getDB:function (name, callback) {
        // look it up in the cache
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        req.onupgradeneeded = function req_onupgradeneeded() {
          db = req.result;
          db.createObjectStore(IDBFS.DB_STORE_NAME);
        };
        req.onsuccess = function req_onsuccess() {
          db = req.result;
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function req_onerror() {
          callback(this.error);
        };
      },getRemoteSet:function (mount, callback) {
        var files = {};
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function transaction_onerror() { callback(this.error); };
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          store.openCursor().onsuccess = function store_openCursor_onsuccess(event) {
            var cursor = event.target.result;
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, files: files });
            }
            files[cursor.key] = cursor.value;
            cursor.continue();
          };
        });
      }};
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.position = position;
          return position;
        }}};
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || { recurse_count: 0 };
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
        // start at the root
        var current = FS.root;
        var current_path = '/';
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
            this.parent = null;
            this.mount = null;
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            FS.hashAddNode(this);
          };
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
          FS.FSNode.prototype = {};
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
        return new FS.FSNode(parent, name, mode, rdev);
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
        var completed = 0;
        var total = FS.mounts.length;
        function done(err) {
          if (err) {
            return callback(err);
          }
          if (++completed >= total) {
            callback(null);
          }
        };
        // sync all mounts
        for (var i = 0; i < FS.mounts.length; i++) {
          var mount = FS.mounts[i];
          if (!mount.type.syncfs) {
            done(null);
            continue;
          }
          mount.type.syncfs(mount, populate, done);
        }
      },mount:function (type, opts, mountpoint) {
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
          mountpoint = lookup.path;  // use the absolute path
        }
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        // add to our cached list of mounts
        FS.mounts.push(mount);
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 0666;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 0666 : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
          this.stack = stackTrace();
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
        FS.nameTable = new Array(4096);
        FS.root = FS.createNode(null, '/', 16384 | 0777, 0);
        FS.mount(MEMFS, {}, '/');
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureErrnoError();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      var mode = HEAP32[((varargs)>>2)];
      path = Pointer_stringify(path);
      try {
        var stream = FS.open(path, oflag, mode);
        return stream.fd;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 512;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 1024;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }
  function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          writeAsciiToMemory(msg, strerrbuf);
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }
  function ___errno_location() {
      return ___errno_state;
    }
  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        FS.close(stream);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      var stream = FS.getStream(fildes);
      if (stream) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      _fsync(stream);
      return _close(stream);
    }
  var _mkport=undefined;var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 0777, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }function _putchar(c) {
      // int putchar(int c);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/putchar.html
      return _fputc(c, HEAP32[((_stdout)>>2)]);
    } 
  Module["_saveSetjmp"] = _saveSetjmp;
  Module["_testSetjmp"] = _testSetjmp;var _setjmp=undefined;
  function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  var PTHREAD_SPECIFIC={};function _pthread_getspecific(key) {
      return PTHREAD_SPECIFIC[key] || 0;
    }
  function _pthread_setspecific(key, value) {
      if (!(key in PTHREAD_SPECIFIC)) {
        return ERRNO_CODES.EINVAL;
      }
      PTHREAD_SPECIFIC[key] = value;
      return 0;
    }
  var _llvm_memset_p0i8_i64=_memset;
  var _sqrt=Math_sqrt;
  var _cos=Math_cos;
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  Module["_memcmp"] = _memcmp;
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _srand(seed) {}
  function _rand() {
      return Math.floor(Math.random()*0x80000000);
    }
  var _llvm_pow_f64=Math_pow;
  var _fabs=Math_abs;
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }
  function _longjmp(env, value) {
      asm['setThrew'](env, value || 1);
      throw 'longjmp';
    }
  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP8[(str)] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }
      // Apply sign.
      ret *= multiplier;
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str
      }
      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }
      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }
      if (bits == 64) {
        return ((asm["setTempRet0"]((tempDouble=ret,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)),ret>>>0)|0);
      }
      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAPU8[(((px)+(i))|0)];
        var y = HEAPU8[(((py)+(i))|0)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }function _strcmp(px, py) {
      return _strncmp(px, py, TOTAL_MEMORY);
    }
  function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      return _write(stream, s, _strlen(s));
    }
  var PTHREAD_SPECIFIC_NEXT_KEY=1;function _pthread_key_create(key, destructor) {
      if (key == 0) {
        return ERRNO_CODES.EINVAL;
      }
      HEAP32[((key)>>2)]=PTHREAD_SPECIFIC_NEXT_KEY
      // values start at 0
      PTHREAD_SPECIFIC[PTHREAD_SPECIFIC_NEXT_KEY] = 0;
      PTHREAD_SPECIFIC_NEXT_KEY++;
      return 0;
    }
  function _GC_init() {
  Module['printErr']('missing function: GC_init'); abort(-1);
  }
  function ___assert_fail(condition, filename, line, func) {
      ABORT = true;
      throw 'Assertion failed: ' + Pointer_stringify(condition) + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + stackTrace();
    }
  function _fmax(x, y) {
      return isNaN(x) ? y : isNaN(y) ? x : Math.max(x, y);
    }
  function _GC_malloc() {
  Module['printErr']('missing function: GC_malloc'); abort(-1);
  }
  var _llvm_va_start=undefined;
  function _llvm_va_end() {}
  function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }
  function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }
  function _vfprintf(s, f, va_arg) {
      return _fprintf(s, f, HEAP32[((va_arg)>>2)]);
    }
  function _vsnprintf(s, n, format, va_arg) {
      return _snprintf(s, n, format, HEAP32[((va_arg)>>2)]);
    }
  function _GC_malloc_atomic() {
  Module['printErr']('missing function: GC_malloc_atomic'); abort(-1);
  }
  function _GC_strdup() {
  Module['printErr']('missing function: GC_strdup'); abort(-1);
  }
  function _GC_collect_a_little() {
  Module['printErr']('missing function: GC_collect_a_little'); abort(-1);
  }
  function _strdup(ptr) {
      var len = _strlen(ptr);
      var newStr = _malloc(len + 1);
      (_memcpy(newStr, ptr, len)|0);
      HEAP8[(((newStr)+(len))|0)]=0;
      return newStr;
    }
  function _pthread_mutex_lock() {}
  function _pthread_mutex_unlock() {}
  Module["_strcpy"] = _strcpy;
  function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStream(stream);
      if (!streamObj) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop()
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(stream, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }
  function _qsort(base, num, size, cmp) {
      if (num == 0 || size == 0) return;
      // forward calls to the JavaScript sort method
      // first, sort the items logically
      var keys = [];
      for (var i = 0; i < num; i++) keys.push(i);
      keys.sort(function(a, b) {
        return Module['dynCall_iii'](cmp, base+a*size, base+b*size);
      });
      // apply the sort
      var temp = _malloc(num*size);
      _memcpy(temp, base, num*size);
      for (var i = 0; i < num; i++) {
        if (keys[i] == i) continue; // already in place
        _memcpy(base+i*size, temp+keys[i]*size, size);
      }
      _free(temp);
    }
  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      stream = FS.getStream(stream);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      if (FS.isChrdev(stream.node.mode)) {
        ___setErrNo(ERRNO_CODES.ESPIPE);
        return -1;
      } else {
        return stream.position;
      }
    }
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        return FS.llseek(stream, offset, whence);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var ret = _lseek(stream, offset, whence);
      if (ret == -1) {
        return -1;
      }
      stream = FS.getStream(stream);
      stream.eof = false;
      return 0;
    }
  function _bsearch(key, base, num, size, compar) {
      function cmp(x, y) {
        return Module['dynCall_iii'](compar, x, y);
      };
      var left = 0;
      var right = num;
      var mid, test, addr;
      while (left < right) {
        mid = (left + right) >>> 1;
        addr = base + (mid * size);
        test = cmp(key, addr);
        if (test < 0) {
          right = mid;
        } else if (test > 0) {
          left = mid + 1;
        } else {
          return addr;
        }
      }
      return 0;
    }
  function _emscripten_get_now() {
      if (!_emscripten_get_now.actual) {
        if (ENVIRONMENT_IS_NODE) {
          _emscripten_get_now.actual = function _emscripten_get_now_actual() {
            var t = process['hrtime']();
            return t[0] * 1e3 + t[1] / 1e6;
          }
        } else if (typeof dateNow !== 'undefined') {
          _emscripten_get_now.actual = dateNow;
        } else if (ENVIRONMENT_IS_WEB && window['performance'] && window['performance']['now']) {
          _emscripten_get_now.actual = function _emscripten_get_now_actual() { return window['performance']['now'](); };
        } else {
          _emscripten_get_now.actual = Date.now;
        }
      }
      return _emscripten_get_now.actual();
    }function _clock_gettime(clk_id, tp) {
      // int clock_gettime(clockid_t clk_id, struct timespec *tp);
      var now;
      if (clk_id === 0) {
        now = Date.now();
      } else {
        now = _emscripten_get_now();
      }
      HEAP32[((tp)>>2)]=Math.floor(now/1000); // seconds
      HEAP32[(((tp)+(4))>>2)]=Math.floor((now % 1000)*1000*1000); // nanoseconds
      return 0;
    }
  function _perror(s) {
      // void perror(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/perror.html
      var stdout = HEAP32[((_stdout)>>2)];
      if (s) {
        _fputs(s, stdout);
        _fputc(58, stdout);
        _fputc(32, stdout);
      }
      var errnum = HEAP32[((___errno_location())>>2)];
      _puts(_strerror(errnum));
    }
  var _sin=Math_sin;
  var _ceil=Math_ceil;
  function _lis_matrix_set_value() {
  Module['printErr']('missing function: lis_matrix_set_value'); abort(-1);
  }
  function _lis_vector_create() {
  Module['printErr']('missing function: lis_vector_create'); abort(-1);
  }
  function _lis_vector_set_size() {
  Module['printErr']('missing function: lis_vector_set_size'); abort(-1);
  }
  function _lis_solver_create() {
  Module['printErr']('missing function: lis_solver_create'); abort(-1);
  }
  function _lis_solver_set_option() {
  Module['printErr']('missing function: lis_solver_set_option'); abort(-1);
  }
  function _lis_solver_destroy() {
  Module['printErr']('missing function: lis_solver_destroy'); abort(-1);
  }
  function _lis_vector_destroy() {
  Module['printErr']('missing function: lis_vector_destroy'); abort(-1);
  }
  var ___strtok_state=0;
  function _strtok_r(s, delim, lasts) {
      var skip_leading_delim = 1;
      var spanp;
      var c, sc;
      var tok;
      if (s == 0 && (s = getValue(lasts, 'i8*')) == 0) {
        return 0;
      }
      cont: while (1) {
        c = getValue(s++, 'i8');
        for (spanp = delim; (sc = getValue(spanp++, 'i8')) != 0;) {
          if (c == sc) {
            if (skip_leading_delim) {
              continue cont;
            } else {
              setValue(lasts, s, 'i8*');
              setValue(s - 1, 0, 'i8');
              return s - 1;
            }
          }
        }
        break;
      }
      if (c == 0) {
        setValue(lasts, 0, 'i8*');
        return 0;
      }
      tok = s - 1;
      for (;;) {
        c = getValue(s++, 'i8');
        spanp = delim;
        do {
          if ((sc = getValue(spanp++, 'i8')) == c) {
            if (c == 0) {
              s = 0;
            } else {
              setValue(s - 1, 0, 'i8');
            }
            setValue(lasts, s, 'i8*');
            return tok;
          }
        } while (sc != 0);
      }
      abort('strtok_r error!');
    }function _strtok(s, delim) {
      return _strtok_r(s, delim, ___strtok_state);
    }
  function ___gxx_personality_v0() {
    }
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      return ptr;
    }
  function _llvm_eh_exception() {
      return HEAP32[((_llvm_eh_exception.buf)>>2)];
    }
  function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr);
      } catch(e) { // XXX FIXME
      }
    }function ___cxa_end_catch() {
      if (___cxa_end_catch.rethrown) {
        ___cxa_end_catch.rethrown = false;
        return;
      }
      // Clear state flag.
      asm['setThrew'](0);
      // Clear type.
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=0
      // Call destructor if one is registered then clear it.
      var ptr = HEAP32[((_llvm_eh_exception.buf)>>2)];
      var destructor = HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)];
      if (destructor) {
        Runtime.dynCall('vi', destructor, [ptr]);
        HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=0
      }
      // Free ptr if it isn't null.
      if (ptr) {
        ___cxa_free_exception(ptr);
        HEAP32[((_llvm_eh_exception.buf)>>2)]=0
      }
    }function ___cxa_rethrow() {
      ___cxa_end_catch.rethrown = true;
      throw HEAP32[((_llvm_eh_exception.buf)>>2)] + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }
  function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
  function _strrchr(ptr, chr) {
      var ptr2 = ptr + _strlen(ptr);
      do {
        if (HEAP8[(ptr2)] == chr) return ptr2;
        ptr2--;
      } while (ptr2 >= ptr);
      return 0;
    }
  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  function ___resumeException(ptr) {
      if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr;
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = HEAP32[((_llvm_eh_exception.buf)>>2)];
      if (throwntype == -1) throwntype = HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=type
      HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=destructor
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }
  var _fseeko=_fseek;
  var _ftello=_ftell;
  function _htonl(value) {
      return ((value & 0xff) << 24) + ((value & 0xff00) << 8) +
             ((value & 0xff0000) >>> 8) + ((value & 0xff000000) >>> 24);
    }
  function _atoi(ptr) {
      return _strtol(ptr, null, 10);
    }
  var _atol=_atoi;
  function _round(x) {
      return (x < 0) ? -Math.round(-x) : Math.round(x);
    }
  function _signal(sig, func) {
      // TODO
      return 0;
    }
  function _popen(command, mode) {
      // FILE *popen(const char *command, const char *mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/popen.html
      // We allow only one process, so no pipes.
      ___setErrNo(ERRNO_CODES.EMFILE);
      return 0;
    }
  function _pclose(stream) {
      // int pclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/pclose.html
      // We allow only one process, so no pipes.
      ___setErrNo(ERRNO_CODES.ECHILD);
      return -1;
    }
  function __isLeapYear(year) {
        return year%4 === 0 && (year%100 !== 0 || year%400 === 0);
    }
  function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]);
      return sum;
    }
  var __MONTH_DAYS_LEAP=[31,29,31,30,31,30,31,31,30,31,30,31];
  var __MONTH_DAYS_REGULAR=[31,28,31,30,31,30,31,31,30,31,30,31];function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while(days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
        if (days > daysInCurrentMonth-newDate.getDate()) {
          // we spill over to next month
          days -= (daysInCurrentMonth-newDate.getDate()+1);
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth+1)
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear()+1);
          }
        } else {
          // we stay in current month 
          newDate.setDate(newDate.getDate()+days);
          return newDate;
        }
      }
      return newDate;
    }function _strftime(s, maxsize, format, tm) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
      var date = {
        tm_sec: HEAP32[((tm)>>2)],
        tm_min: HEAP32[(((tm)+(4))>>2)],
        tm_hour: HEAP32[(((tm)+(8))>>2)],
        tm_mday: HEAP32[(((tm)+(12))>>2)],
        tm_mon: HEAP32[(((tm)+(16))>>2)],
        tm_year: HEAP32[(((tm)+(20))>>2)],
        tm_wday: HEAP32[(((tm)+(24))>>2)],
        tm_yday: HEAP32[(((tm)+(28))>>2)],
        tm_isdst: HEAP32[(((tm)+(32))>>2)]
      };
      var pattern = Pointer_stringify(format);
      // expand format
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',     // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
        '%D': '%m/%d/%y',                 // Equivalent to %m / %d / %y
        '%F': '%Y-%m-%d',                 // Equivalent to %Y - %m - %d
        '%h': '%b',                       // Equivalent to %b
        '%r': '%I:%M:%S %p',              // Replaced by the time in a.m. and p.m. notation
        '%R': '%H:%M',                    // Replaced by the time in 24-hour notation
        '%T': '%H:%M:%S',                 // Replaced by the time
        '%x': '%m/%d/%y',                 // Replaced by the locale's appropriate date representation
        '%X': '%H:%M:%S',                 // Replaced by the locale's appropriate date representation
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
      }
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      function leadingSomething(value, digits, character) {
        var str = typeof value === 'number' ? value.toString() : (value || '');
        while (str.length < digits) {
          str = character[0]+str;
        }
        return str;
      };
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0');
      };
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : (value > 0 ? 1 : 0);
        };
        var compare;
        if ((compare = sgn(date1.getFullYear()-date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth()-date2.getMonth())) === 0) {
            compare = sgn(date1.getDate()-date2.getDate());
          }
        }
        return compare;
      };
      function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear()-1, 11, 29);
            case 1: // Monday
              return janFourth;
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5: // Friday
              return new Date(janFourth.getFullYear()-1, 11, 31);
            case 6: // Saturday
              return new Date(janFourth.getFullYear()-1, 11, 30);
          }
      };
      function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear()+1, 0, 4);
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear()+1;
            } else {
              return thisDate.getFullYear();
            }
          } else { 
            return thisDate.getFullYear()-1;
          }
      };
      var EXPANSION_RULES_2 = {
        '%a': function(date) {
          return WEEKDAYS[date.tm_wday].substring(0,3);
        },
        '%A': function(date) {
          return WEEKDAYS[date.tm_wday];
        },
        '%b': function(date) {
          return MONTHS[date.tm_mon].substring(0,3);
        },
        '%B': function(date) {
          return MONTHS[date.tm_mon];
        },
        '%C': function(date) {
          var year = date.tm_year+1900;
          return leadingNulls(Math.floor(year/100),2);
        },
        '%d': function(date) {
          return leadingNulls(date.tm_mday, 2);
        },
        '%e': function(date) {
          return leadingSomething(date.tm_mday, 2, ' ');
        },
        '%g': function(date) {
          // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year. 
          // In this system, weeks begin on a Monday and week 1 of the year is the week that includes 
          // January 4th, which is also the week that includes the first Thursday of the year, and 
          // is also the first week that contains at least four days in the year. 
          // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of 
          // the last week of the preceding year; thus, for Saturday 2nd January 1999, 
          // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th, 
          // or 31st is a Monday, it and any following days are part of week 1 of the following year. 
          // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
          return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': function(date) {
          return getWeekBasedYear(date);
        },
        '%H': function(date) {
          return leadingNulls(date.tm_hour, 2);
        },
        '%I': function(date) {
          return leadingNulls(date.tm_hour < 13 ? date.tm_hour : date.tm_hour-12, 2);
        },
        '%j': function(date) {
          // Day of the year (001-366)
          return leadingNulls(date.tm_mday+__arraySum(__isLeapYear(date.tm_year+1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon-1), 3);
        },
        '%m': function(date) {
          return leadingNulls(date.tm_mon+1, 2);
        },
        '%M': function(date) {
          return leadingNulls(date.tm_min, 2);
        },
        '%n': function() {
          return '\n';
        },
        '%p': function(date) {
          if (date.tm_hour > 0 && date.tm_hour < 13) {
            return 'AM';
          } else {
            return 'PM';
          }
        },
        '%S': function(date) {
          return leadingNulls(date.tm_sec, 2);
        },
        '%t': function() {
          return '\t';
        },
        '%u': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay() || 7;
        },
        '%U': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Sunday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year+1900, 0, 1);
          var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7-janFirst.getDay());
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
          // is target date after the first Sunday?
          if (compareByDay(firstSunday, endDate) < 0) {
            // calculate difference in days between first Sunday and endDate
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstSundayUntilEndJanuary = 31-firstSunday.getDate();
            var days = firstSundayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstSunday, janFirst) === 0 ? '01': '00';
        },
        '%V': function(date) {
          // Replaced by the week number of the year (Monday as the first day of the week) 
          // as a decimal number [01,53]. If the week containing 1 January has four 
          // or more days in the new year, then it is considered week 1. 
          // Otherwise, it is the last week of the previous year, and the next week is week 1. 
          // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
          var janFourthThisYear = new Date(date.tm_year+1900, 0, 4);
          var janFourthNextYear = new Date(date.tm_year+1901, 0, 4);
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
          var endDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
          if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
            // if given date is before this years first week, then it belongs to the 53rd week of last year
            return '53';
          } 
          if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
            // if given date is after next years first week, then it belongs to the 01th week of next year
            return '01';
          }
          // given date is in between CW 01..53 of this calendar year
          var daysDifference;
          if (firstWeekStartThisYear.getFullYear() < date.tm_year+1900) {
            // first CW of this year starts last year
            daysDifference = date.tm_yday+32-firstWeekStartThisYear.getDate()
          } else {
            // first CW of this year starts this year
            daysDifference = date.tm_yday+1-firstWeekStartThisYear.getDate();
          }
          return leadingNulls(Math.ceil(daysDifference/7), 2);
        },
        '%w': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay();
        },
        '%W': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Monday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year, 0, 1);
          var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7-janFirst.getDay()+1);
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
          // is target date after the first Monday?
          if (compareByDay(firstMonday, endDate) < 0) {
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstMondayUntilEndJanuary = 31-firstMonday.getDate();
            var days = firstMondayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstMonday, janFirst) === 0 ? '01': '00';
        },
        '%y': function(date) {
          // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
          return (date.tm_year+1900).toString().substring(2);
        },
        '%Y': function(date) {
          // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
          return date.tm_year+1900;
        },
        '%z': function(date) {
          // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ),
          // or by no characters if no timezone is determinable. 
          // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich). 
          // If tm_isdst is zero, the standard time offset is used. 
          // If tm_isdst is greater than zero, the daylight savings time offset is used. 
          // If tm_isdst is negative, no characters are returned. 
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%Z': function(date) {
          // Replaced by the timezone name or abbreviation, or by no bytes if no timezone information exists. [ tm_isdst]
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%%': function() {
          return '%';
        }
      };
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
      }
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      } 
      writeArrayToMemory(bytes, s);
      return bytes.length-1;
    }
  var ___tm_current=allocate(44, "i8", ALLOC_STATIC);
  var ___tm_timezone=allocate(intArrayFromString("GMT"), "i8", ALLOC_STATIC);
  var _tzname=allocate(8, "i32*", ALLOC_STATIC);
  var _daylight=allocate(1, "i32*", ALLOC_STATIC);
  var _timezone=allocate(1, "i32*", ALLOC_STATIC);function _tzset() {
      // TODO: Use (malleable) environment variables instead of system settings.
      if (_tzset.called) return;
      _tzset.called = true;
      HEAP32[((_timezone)>>2)]=-(new Date()).getTimezoneOffset() * 60
      var winter = new Date(2000, 0, 1);
      var summer = new Date(2000, 6, 1);
      HEAP32[((_daylight)>>2)]=Number(winter.getTimezoneOffset() != summer.getTimezoneOffset())
      var winterName = 'GMT'; // XXX do not rely on browser timezone info, it is very unpredictable | winter.toString().match(/\(([A-Z]+)\)/)[1];
      var summerName = 'GMT'; // XXX do not rely on browser timezone info, it is very unpredictable | summer.toString().match(/\(([A-Z]+)\)/)[1];
      var winterNamePtr = allocate(intArrayFromString(winterName), 'i8', ALLOC_NORMAL);
      var summerNamePtr = allocate(intArrayFromString(summerName), 'i8', ALLOC_NORMAL);
      HEAP32[((_tzname)>>2)]=winterNamePtr
      HEAP32[(((_tzname)+(4))>>2)]=summerNamePtr
    }function _localtime_r(time, tmPtr) {
      _tzset();
      var date = new Date(HEAP32[((time)>>2)]*1000);
      HEAP32[((tmPtr)>>2)]=date.getSeconds()
      HEAP32[(((tmPtr)+(4))>>2)]=date.getMinutes()
      HEAP32[(((tmPtr)+(8))>>2)]=date.getHours()
      HEAP32[(((tmPtr)+(12))>>2)]=date.getDate()
      HEAP32[(((tmPtr)+(16))>>2)]=date.getMonth()
      HEAP32[(((tmPtr)+(20))>>2)]=date.getFullYear()-1900
      HEAP32[(((tmPtr)+(24))>>2)]=date.getDay()
      var start = new Date(date.getFullYear(), 0, 1);
      var yday = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      HEAP32[(((tmPtr)+(28))>>2)]=yday
      HEAP32[(((tmPtr)+(36))>>2)]=start.getTimezoneOffset() * 60
      var dst = Number(start.getTimezoneOffset() != date.getTimezoneOffset());
      HEAP32[(((tmPtr)+(32))>>2)]=dst
      HEAP32[(((tmPtr)+(40))>>2)]=___tm_timezone
      return tmPtr;
    }function _localtime(time) {
      return _localtime_r(time, ___tm_current);
    }
  function _system(command) {
      // int system(const char *command);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/system.html
      // Can't call external programs.
      ___setErrNo(ERRNO_CODES.EAGAIN);
      return -1;
    }
  function _asprintf(s, format, varargs) {
      return _sprintf(-s, format, varargs);
    }
  function _strstr(ptr1, ptr2) {
      var check = 0, start;
      do {
        if (!check) {
          start = ptr1;
          check = ptr2;
        }
        var curr1 = HEAP8[((ptr1++)|0)];
        var curr2 = HEAP8[((check++)|0)];
        if (curr2 == 0) return start;
        if (curr2 != curr1) {
          // rewind to one character after start, to find ez in eeez
          ptr1 = start + 1;
          check = 0;
        }
      } while (curr1);
      return 0;
    }
  var _putc=_fputc;
  function _isatty(fildes) {
      // int isatty(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/isatty.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      // HACK - implement tcgetattr
      if (!stream.tty) {
        ___setErrNo(ERRNO_CODES.ENOTTY);
        return 0;
      }
      return 1;
    }
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      // We use file descriptor numbers and FILE* streams interchangeably.
      return stream;
    }
  function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      var streamObj = FS.getStream(stream);
      if (!streamObj) return -1;
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
      if (ret == 0) {
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }var _getc=_fgetc;
  function _abort() {
      Module['abort']();
    }
  function _unlink(path) {
      // int unlink(const char *path);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/unlink.html
      path = Pointer_stringify(path);
      try {
        FS.unlink(path);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  function _truncate(path, length) {
      // int truncate(const char *path, off_t length);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/truncate.html
      // NOTE: The path argument may be a string, to simplify ftruncate().
      if (typeof path !== 'string') path = Pointer_stringify(path);
      try {
        FS.truncate(path, length);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _ftruncate(fildes, length) {
      // int ftruncate(int fildes, off_t length);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftruncate.html
      try {
        FS.ftruncate(fildes, length);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  function _stat(path, buf, dontResolveLastLink) {
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/stat.html
      // int stat(const char *path, struct stat *buf);
      // NOTE: dontResolveLastLink is a shortcut for lstat(). It should never be
      //       used in client code.
      path = typeof path !== 'string' ? Pointer_stringify(path) : path;
      try {
        var stat = dontResolveLastLink ? FS.lstat(path) : FS.stat(path);
        HEAP32[((buf)>>2)]=stat.dev;
        HEAP32[(((buf)+(4))>>2)]=0;
        HEAP32[(((buf)+(8))>>2)]=stat.ino;
        HEAP32[(((buf)+(12))>>2)]=stat.mode
        HEAP32[(((buf)+(16))>>2)]=stat.nlink
        HEAP32[(((buf)+(20))>>2)]=stat.uid
        HEAP32[(((buf)+(24))>>2)]=stat.gid
        HEAP32[(((buf)+(28))>>2)]=stat.rdev
        HEAP32[(((buf)+(32))>>2)]=0;
        HEAP32[(((buf)+(36))>>2)]=stat.size
        HEAP32[(((buf)+(40))>>2)]=4096
        HEAP32[(((buf)+(44))>>2)]=stat.blocks
        HEAP32[(((buf)+(48))>>2)]=Math.floor(stat.atime.getTime() / 1000)
        HEAP32[(((buf)+(52))>>2)]=0
        HEAP32[(((buf)+(56))>>2)]=Math.floor(stat.mtime.getTime() / 1000)
        HEAP32[(((buf)+(60))>>2)]=0
        HEAP32[(((buf)+(64))>>2)]=Math.floor(stat.ctime.getTime() / 1000)
        HEAP32[(((buf)+(68))>>2)]=0
        HEAP32[(((buf)+(72))>>2)]=stat.ino
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fstat(fildes, buf) {
      // int fstat(int fildes, struct stat *buf);
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/fstat.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      return _stat(stream.path, buf);
    }
  function _freopen(filename, mode, stream) {
      // FILE *freopen(const char *restrict filename, const char *restrict mode, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/freopen.html
      if (!filename) {
        var streamObj = FS.getStream(stream);
        if (!streamObj) {
          ___setErrNo(ERRNO_CODES.EBADF);
          return 0;
        }
        if (_freopen.buffer) _free(_freopen.buffer);
        filename = intArrayFromString(streamObj.path);
        filename = allocate(filename, 'i8', ALLOC_NORMAL);
      }
      _fclose(stream);
      return _fopen(filename, mode);
    }
  function _ungetc(c, stream) {
      // int ungetc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ungetc.html
      stream = FS.getStream(stream);
      if (!stream) {
        return -1;
      }
      if (c === -1) {
        // do nothing for EOF character
        return c;
      }
      c = unSign(c & 0xFF);
      stream.ungotten.push(c);
      stream.eof = false;
      return c;
    }
  function _access(path, amode) {
      // int access(const char *path, int amode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/access.html
      path = Pointer_stringify(path);
      if (amode & ~7) {
        // need a valid mode
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      }
      var node;
      try {
        var lookup = FS.lookupPath(path, { follow: true });
        node = lookup.node;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
      var perms = '';
      if (amode & 4) perms += 'r';
      if (amode & 2) perms += 'w';
      if (amode & 1) perms += 'x';
      if (perms /* otherwise, they've just passed F_OK */ && FS.nodePermissions(node, perms)) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      }
      return 0;
    }
  function _tmpnam(s, dir, prefix) {
      // char *tmpnam(char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/tmpnam.html
      // NOTE: The dir and prefix arguments are for internal use only.
      var folder = FS.findObject(dir || '/tmp');
      if (!folder || !folder.isFolder) {
        dir = '/tmp';
        folder = FS.findObject(dir);
        if (!folder || !folder.isFolder) return 0;
      }
      var name = prefix || 'file';
      do {
        name += String.fromCharCode(65 + Math.floor(Math.random() * 25));
      } while (name in folder.contents);
      var result = dir + '/' + name;
      if (!_tmpnam.buffer) _tmpnam.buffer = _malloc(256);
      if (!s) s = _tmpnam.buffer;
      writeAsciiToMemory(result, s);
      return s;
    }function _tmpfile() {
      // FILE *tmpfile(void);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/tmpfile.html
      // TODO: Delete the created file on closing.
      if (_tmpfile.mode) {
        _tmpfile.mode = allocate(intArrayFromString('w+'), 'i8', ALLOC_NORMAL);
      }
      return _fopen(_tmpnam(0), _tmpfile.mode);
    }
  function _rewind(stream) {
      // void rewind(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/rewind.html
      _fseek(stream, 0, 0);  // SEEK_SET.
      var streamObj = FS.getStream(stream);
      if (streamObj) streamObj.error = false;
    }
  function ___cxa_guard_acquire(variable) {
      if (!HEAP8[(variable)]) { // ignore SAFE_HEAP stuff because llvm mixes i64 and i8 here
        HEAP8[(variable)]=1;
        return 1;
      }
      return 0;
    }
  function ___cxa_guard_release() {}
  function _pthread_cond_broadcast() {
      return 0;
    }
  function _pthread_cond_wait() {
      return 0;
    }
  function _atexit(func, arg) {
      __ATEXIT__.unshift({ func: func, arg: arg });
    }var ___cxa_atexit=_atexit;
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function ___cxa_guard_abort() {}
  function _isxdigit(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 102) ||
             (chr >= 65 && chr <= 70);
    }var _isxdigit_l=_isxdigit;
  function _isdigit(chr) {
      return chr >= 48 && chr <= 57;
    }var _isdigit_l=_isdigit;
  function __getFloat(text) {
      return /^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/.exec(text);
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function get() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function unget() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
        if (format[formatIndex] === '%') {
          var nextC = format.indexOf('c', formatIndex+1);
          if (nextC > 0) {
            var maxx = 1;
            if (nextC > formatIndex+1) {
              var sub = format.substring(formatIndex+1, nextC);
              maxx = parseInt(sub);
              if (maxx != sub) maxx = 0;
            }
            if (maxx) {
              var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
              argIndex += Runtime.getAlignSize('void*', null, true);
              fields++;
              for (var i = 0; i < maxx; i++) {
                next = get();
                HEAP8[((argPtr++)|0)]=next;
              }
              formatIndex += nextC - formatIndex + 1;
              continue;
            }
          }
        }
        // handle %[...]
        if (format[formatIndex] === '%' && format.indexOf('[', formatIndex+1) > 0) {
          var match = /\%([0-9]*)\[(\^)?(\]?[^\]]*)\]/.exec(format.substring(formatIndex));
          if (match) {
            var maxNumCharacters = parseInt(match[1]) || Infinity;
            var negateScanList = (match[2] === '^');
            var scanList = match[3];
            // expand "middle" dashs into character sets
            var middleDashMatch;
            while ((middleDashMatch = /([^\-])\-([^\-])/.exec(scanList))) {
              var rangeStartCharCode = middleDashMatch[1].charCodeAt(0);
              var rangeEndCharCode = middleDashMatch[2].charCodeAt(0);
              for (var expanded = ''; rangeStartCharCode <= rangeEndCharCode; expanded += String.fromCharCode(rangeStartCharCode++));
              scanList = scanList.replace(middleDashMatch[1] + '-' + middleDashMatch[2], expanded);
            }
            var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
            argIndex += Runtime.getAlignSize('void*', null, true);
            fields++;
            for (var i = 0; i < maxNumCharacters; i++) {
              next = get();
              if (negateScanList) {
                if (scanList.indexOf(String.fromCharCode(next)) < 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              } else {
                if (scanList.indexOf(String.fromCharCode(next)) >= 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              }
            }
            // write out null-terminating character
            HEAP8[((argPtr++)|0)]=0;
            formatIndex += match[0].length;
            continue;
          }
        }      
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if (format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' ||
              type == 'F' || type == 'E' || type == 'G') {
            next = get();
            while (next > 0 && (!(next in __scanString.whiteSpace)))  {
              buffer.push(String.fromCharCode(next));
              next = get();
            }
            var m = __getFloat(buffer.join(''));
            var last = m ? m[0].length : 0;
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            // Strip the optional 0x prefix for %x.
            if ((type == 'x' || type == 'X') && (next == 48)) {
              var peek = get();
              if (peek == 120 || peek == 88) {
                next = get();
              } else {
                unget();
              }
            }
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   ((type === 'x' || type === 'X') && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if (longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,(tempDouble=parseInt(text, 10),(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16)
              break;
            case 'F':
            case 'f':
            case 'E':
            case 'e':
            case 'G':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAPF64[((argPtr)>>3)]=parseFloat(text)
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text)
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j]
              }
              break;
          }
          fields++;
        } else if (format[formatIndex].charCodeAt(0) in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      function get() { return HEAP8[(((s)+(index++))|0)]; };
      function unget() { index--; };
      return __scanString(format, get, unget, varargs);
    }
  function _catopen() { throw 'TODO: ' + aborter }
  function _catgets() { throw 'TODO: ' + aborter }
  function _catclose() { throw 'TODO: ' + aborter }
  function _newlocale(mask, locale, base) {
      return _malloc(4);
    }
  function _freelocale(locale) {
      _free(locale);
    }
  function _isascii(chr) {
      return chr >= 0 && (chr & 0x80) == 0;
    }
  function ___ctype_b_loc() {
      // http://refspecs.freestandards.org/LSB_3.0.0/LSB-Core-generic/LSB-Core-generic/baselib---ctype-b-loc.html
      var me = ___ctype_b_loc;
      if (!me.ret) {
        var values = [
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,8195,8194,8194,8194,8194,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,24577,49156,49156,49156,
          49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,55304,55304,55304,55304,55304,55304,55304,55304,
          55304,55304,49156,49156,49156,49156,49156,49156,49156,54536,54536,54536,54536,54536,54536,50440,50440,50440,50440,50440,
          50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,49156,49156,49156,49156,49156,
          49156,54792,54792,54792,54792,54792,54792,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,
          50696,50696,50696,50696,50696,50696,50696,49156,49156,49156,49156,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ];
        var i16size = 2;
        var arr = _malloc(values.length * i16size);
        for (var i = 0; i < values.length; i++) {
          HEAP16[(((arr)+(i * i16size))>>1)]=values[i]
        }
        me.ret = allocate([arr + 128 * i16size], 'i16*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  function ___ctype_tolower_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-tolower-loc.html
      var me = ___ctype_tolower_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,91,92,93,94,95,96,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,
          134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,
          164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,
          194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,
          224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,
          254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i]
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  function ___ctype_toupper_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-toupper-loc.html
      var me = ___ctype_toupper_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,
          73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,
          81,82,83,84,85,86,87,88,89,90,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,
          145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,
          175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,
          205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,
          235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i]
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  var _strftime_l=_strftime;
  function __parseInt64(str, endptr, base, min, max, unsign) {
      var isNegative = false;
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
      // Check for a plus/minus sign.
      if (HEAP8[(str)] == 45) {
        str++;
        isNegative = true;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
      // Find base.
      var ok = false;
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            ok = true; // we saw an initial zero, perhaps the entire thing is just "0"
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      var start = str;
      // Get digits.
      var chr;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          str++;
          ok = true;
        }
      }
      if (!ok) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return ((asm["setTempRet0"](0),0)|0);
      }
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str
      }
      try {
        var numberString = isNegative ? '-'+Pointer_stringify(start, str - start) : Pointer_stringify(start, str - start);
        i64Math.fromString(numberString, finalBase, min, max, unsign);
      } catch(e) {
        ___setErrNo(ERRNO_CODES.ERANGE); // not quite correct
      }
      return ((asm["setTempRet0"](((HEAP32[(((tempDoublePtr)+(4))>>2)])|0)),((HEAP32[((tempDoublePtr)>>2)])|0))|0);
    }function _strtoull(str, endptr, base) {
      return __parseInt64(str, endptr, base, 0, '18446744073709551615', true);  // ULONG_MAX.
    }var _strtoull_l=_strtoull;
  function _strtoll(str, endptr, base) {
      return __parseInt64(str, endptr, base, '-9223372036854775808', '9223372036854775807');  // LLONG_MIN, LLONG_MAX.
    }var _strtoll_l=_strtoll;
  function _uselocale(locale) {
      return 0;
    }
  function _vasprintf(s, format, va_arg) {
      return _asprintf(s, format, HEAP32[((va_arg)>>2)]);
    }
  function _vsscanf(s, format, va_arg) {
      return _sscanf(s, format, HEAP32[((va_arg)>>2)]);
    }
  function _isblank(chr) {
      return chr == 32 || chr == 9;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
            var errorInfo = '?';
            function onContextCreationError(event) {
              errorInfo = event.statusMessage || errorInfo;
            }
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (window.scrollX + rect.left);
              y = t.pageY - (window.scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (window.scrollX + rect.left);
            y = event.pageY - (window.scrollY + rect.top);
          }
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
___strtok_state = Runtime.staticAlloc(4);
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");
 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);
var Math_min = Math.min;
function invoke_iiiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    return Module["dynCall_iiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
  try {
    return Module["dynCall_iiiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiid(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiid"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_viiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viidii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viidii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iid(index,a1,a2) {
  try {
    return Module["dynCall_iid"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiid(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiid"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  try {
    Module["dynCall_viiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiidi(index,a1,a2,a3,a4,a5,a6) {
  try {
    return Module["dynCall_iiiiidi"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_i(index) {
  try {
    return Module["dynCall_i"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    return Module["dynCall_iiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var p=env.___fsmu8|0;var q=env._stdout|0;var r=env.___dso_handle|0;var s=env._stdin|0;var t=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var u=env._stderr|0;var v=+env.NaN;var w=+env.Infinity;var x=0;var y=0;var z=0;var A=0;var B=0,C=0,D=0,E=0,F=0.0,G=0,H=0,I=0,J=0.0;var K=0;var L=0;var M=0;var N=0;var O=0;var P=0;var Q=0;var R=0;var S=0;var T=0;var U=global.Math.floor;var V=global.Math.abs;var W=global.Math.sqrt;var X=global.Math.pow;var Y=global.Math.cos;var Z=global.Math.sin;var _=global.Math.tan;var $=global.Math.acos;var aa=global.Math.asin;var ab=global.Math.atan;var ac=global.Math.atan2;var ad=global.Math.exp;var ae=global.Math.log;var af=global.Math.ceil;var ag=global.Math.imul;var ah=env.abort;var ai=env.assert;var aj=env.asmPrintInt;var ak=env.asmPrintFloat;var al=env.min;var am=env.invoke_iiiiiiii;var an=env.invoke_viiiii;var ao=env.invoke_vi;var ap=env.invoke_vii;var aq=env.invoke_iiiiiiiiiii;var ar=env.invoke_ii;var as=env.invoke_iiiiii;var at=env.invoke_iiii;var au=env.invoke_viiiiid;var av=env.invoke_viiiiiiii;var aw=env.invoke_viiiiii;var ax=env.invoke_viidii;var ay=env.invoke_iid;var az=env.invoke_viiiiiii;var aA=env.invoke_viiiiiid;var aB=env.invoke_viiiiiiiii;var aC=env.invoke_iii;var aD=env.invoke_iiiiidi;var aE=env.invoke_i;var aF=env.invoke_iiiii;var aG=env.invoke_viii;var aH=env.invoke_v;var aI=env.invoke_iiiiiiiii;var aJ=env.invoke_viiii;var aK=env._llvm_lifetime_end;var aL=env._lseek;var aM=env.__scanString;var aN=env._fclose;var aO=env._pthread_mutex_lock;var aP=env.___cxa_end_catch;var aQ=env._strtoull;var aR=env._fflush;var aS=env._lis_solver_create;var aT=env._strtol;var aU=env._fputc;var aV=env._strtok;var aW=env._fwrite;var aX=env._send;var aY=env._fputs;var aZ=env._emscripten_get_now;var a_=env._tmpnam;var a$=env._isspace;var a0=env._localtime;var a1=env._read;var a2=env._GC_init;var a3=env._ceil;var a4=env.___ctype_b_loc;var a5=env._GC_malloc_atomic;var a6=env._strstr;var a7=env._fileno;var a8=env._perror;var a9=env._fsync;var ba=env.___cxa_guard_abort;var bb=env._newlocale;var bc=env._signal;var bd=env.___gxx_personality_v0;var be=env._isblank;var bf=env._pthread_cond_wait;var bg=env.___cxa_rethrow;var bh=env._freopen;var bi=env.___resumeException;var bj=env._sscanf;var bk=env._strcmp;var bl=env._strncmp;var bm=env._clock_gettime;var bn=env._tmpfile;var bo=env._vsscanf;var bp=env._snprintf;var bq=env._fgetc;var br=env._pclose;var bs=env.__getFloat;var bt=env._atexit;var bu=env.___cxa_free_exception;var bv=env._close;var bw=env._vasprintf;var bx=env.___setErrNo;var by=env._isxdigit;var bz=env._access;var bA=env._ftell;var bB=env._exit;var bC=env._sprintf;var bD=env._pthread_setspecific;var bE=env._asprintf;var bF=env._GC_strdup;var bG=env._strrchr;var bH=env._freelocale;var bI=env._catgets;var bJ=env.__isLeapYear;var bK=env._fmax;var bL=env.___cxa_is_number_type;var bM=env._GC_malloc;var bN=env.___cxa_does_inherit;var bO=env.___cxa_guard_acquire;var bP=env._lis_vector_destroy;var bQ=env._localtime_r;var bR=env.___cxa_begin_catch;var bS=env._lis_vector_create;var bT=env._recv;var bU=env.__parseInt64;var bV=env.__ZSt18uncaught_exceptionv;var bW=env._cos;var bX=env._lis_matrix_set_value;var bY=env._putchar;var bZ=env.___cxa_call_unexpected;var b_=env._popen;var b$=env._round;var b0=env._bsearch;var b1=env.__exit;var b2=env._strftime;var b3=env._rand;var b4=env._tzset;var b5=env._llvm_va_end;var b6=env.___cxa_throw;var b7=env._llvm_eh_exception;var b8=env._printf;var b9=env._pread;var ca=env._fopen;var cb=env._open;var cc=env.__arraySum;var cd=env._sysconf;var ce=env._puts;var cf=env._pthread_key_create;var cg=env._qsort;var ch=env._system;var ci=env.___cxa_find_matching_catch;var cj=env._strdup;var ck=env._srand;var cl=env._isatty;var cm=env.__formatString;var cn=env._pthread_cond_broadcast;var co=env.__ZSt9terminatev;var cp=env._atoi;var cq=env._vfprintf;var cr=env._isascii;var cs=env._pthread_mutex_unlock;var ct=env._llvm_pow_f64;var cu=env._sbrk;var cv=env._lis_solver_destroy;var cw=env.___errno_location;var cx=env._strerror;var cy=env._fstat;var cz=env._catclose;var cA=env._llvm_lifetime_start;var cB=env.__parseInt;var cC=env.___cxa_guard_release;var cD=env._ungetc;var cE=env._ftruncate;var cF=env._uselocale;var cG=env._vsnprintf;var cH=env._htonl;var cI=env.___assert_fail;var cJ=env._fread;var cK=env._strtok_r;var cL=env._abort;var cM=env._fprintf;var cN=env._isdigit;var cO=env._strtoll;var cP=env.__addDays;var cQ=env._pthread_getspecific;var cR=env._fabs;var cS=env._GC_collect_a_little;var cT=env.__reallyNegative;var cU=env._fseek;var cV=env._sqrt;var cW=env._write;var cX=env._rewind;var cY=env.___cxa_allocate_exception;var cZ=env._sin;var c_=env._stat;var c$=env._longjmp;var c0=env._truncate;var c1=env._catopen;var c2=env.___ctype_toupper_loc;var c3=env.___ctype_tolower_loc;var c4=env._lis_vector_set_size;var c5=env._unlink;var c6=env._pwrite;var c7=env._strerror_r;var c8=env._lis_solver_set_option;var c9=env._time;var da=0.0;
// EMSCRIPTEN_START_FUNCS
function j6(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,C=0,D=0,E=0,F=0,G=0,H=0,K=0,L=0,M=0,N=0,O=0;d=i;i=i+40384|0;e=d+1880|0;f=i;i=i+12|0;i=i+7&-8;h=i;i=i+12|0;i=i+7&-8;j=i;i=i+12|0;i=i+7&-8;k=i;i=i+12|0;i=i+7&-8;l=i;i=i+1024|0;m=i;i=i+12|0;i=i+7&-8;n=i;i=i+12|0;i=i+7&-8;o=i;i=i+12|0;i=i+7&-8;p=i;i=i+12|0;i=i+7&-8;q=i;i=i+12|0;i=i+7&-8;r=i;i=i+12|0;i=i+7&-8;s=i;i=i+12|0;i=i+7&-8;t=i;i=i+12|0;i=i+7&-8;u=i;i=i+12|0;i=i+7&-8;v=i;i=i+12|0;i=i+7&-8;w=i;i=i+12|0;i=i+7&-8;x=i;i=i+12|0;i=i+7&-8;y=i;i=i+12|0;i=i+7&-8;z=i;i=i+12|0;i=i+7&-8;A=i;i=i+12|0;i=i+7&-8;C=i;i=i+12|0;i=i+7&-8;D=i;i=i+12|0;i=i+7&-8;E=i;i=i+12|0;i=i+7&-8;F=i;i=i+12|0;i=i+7&-8;G=i;i=i+4|0;i=i+7&-8;H=i;i=i+4|0;i=i+7&-8;K=i;i=i+4|0;i=i+7&-8;L=i;i=i+4|0;i=i+7&-8;M=i;i=i+4|0;i=i+7&-8;N=i;i=i+4|0;i=i+7&-8;O=i;c[d+1904>>2]=a;c[d+1912>>2]=b;c[d+1920>>2]=e;c[d+1928>>2]=f;c[d+1936>>2]=h;c[d+1944>>2]=j;c[d+1952>>2]=k;c[d+1960>>2]=l;c[d+1968>>2]=m;c[d+1976>>2]=n;c[d+1984>>2]=o;c[d+1992>>2]=p;c[d+2e3>>2]=q;c[d+2008>>2]=r;c[d+2016>>2]=s;c[d+2024>>2]=t;c[d+2032>>2]=u;c[d+2040>>2]=v;c[d+2048>>2]=w;c[d+2056>>2]=x;c[d+2064>>2]=y;c[d+2072>>2]=z;c[d+2080>>2]=A;c[d+2088>>2]=C;c[d+2096>>2]=D;c[d+2104>>2]=E;c[d+2112>>2]=F;c[d+2120>>2]=G;c[d+2128>>2]=H;c[d+2136>>2]=K;c[d+2144>>2]=L;c[d+2152>>2]=M;c[d+2160>>2]=N;c[d+2168>>2]=O;c[d+39880>>2]=0;c[d+39884>>2]=0;_read_input_xml$11(d);I=c[d+39880>>2]|0;B=c[d+39884>>2]|0;J=+g[d+39884>>2];c[d+39880>>2]=0;c[d+39884>>2]=0;if((I|0)==5){return}}function _read_input_xml$0(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0,bP=0,bQ=0,bR=0,bS=0,bT=0,bU=0,bV=0,bW=0,bX=0,bY=0,bZ=0,b_=0,b$=0,b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,b7=0,b8=0,b9=0,ca=0,cb=0,cc=0,cd=0,ce=0,cf=0,cg=0,ch=0,ci=0,ck=0,cl=0,cm=0,cn=0,co=0,cp=0,cq=0,cr=0,cs=0,ct=0,cu=0,cv=0,cw=0,cx=0,cy=0,cz=0,cA=0,cB=0,cC=0,cD=0,cE=0,cF=0,cG=0;d=c[b+1904>>2]|0;e=c[b+1920>>2]|0;f=c[b+1928>>2]|0;g=c[b+1936>>2]|0;h=c[b+6304>>2]|0;j=c[b+6312>>2]|0;k=c[b+6320>>2]|0;l=c[b+6328>>2]|0;m=c[b+6336>>2]|0;n=c[b+6344>>2]|0;o=c[b+6352>>2]|0;p=c[b+6360>>2]|0;q=c[b+6368>>2]|0;r=c[b+6376>>2]|0;s=c[b+6384>>2]|0;t=c[b+6392>>2]|0;u=c[b+6400>>2]|0;v=c[b+6408>>2]|0;w=c[b+6416>>2]|0;x=c[b+6424>>2]|0;y=c[b+6432>>2]|0;z=c[b+6440>>2]|0;A=c[b+6448>>2]|0;B=c[b+6456>>2]|0;D=c[b+6464>>2]|0;E=c[b+6472>>2]|0;F=c[b+6480>>2]|0;G=c[b+6488>>2]|0;H=c[b+6496>>2]|0;I=c[b+6504>>2]|0;J=c[b+6512>>2]|0;K=c[b+6520>>2]|0;L=c[b+6528>>2]|0;M=c[b+6536>>2]|0;N=c[b+6544>>2]|0;O=c[b+6552>>2]|0;P=c[b+6560>>2]|0;Q=c[b+6568>>2]|0;R=c[b+6576>>2]|0;S=c[b+6584>>2]|0;T=c[b+6592>>2]|0;U=c[b+6600>>2]|0;V=c[b+6608>>2]|0;W=c[b+6616>>2]|0;X=c[b+6624>>2]|0;Y=c[b+6632>>2]|0;Z=c[b+6640>>2]|0;_=c[b+6648>>2]|0;$=c[b+6656>>2]|0;aa=c[b+6664>>2]|0;ab=c[b+6672>>2]|0;ac=c[b+6680>>2]|0;ad=c[b+6688>>2]|0;ae=c[b+6696>>2]|0;af=c[b+6704>>2]|0;ag=c[b+6712>>2]|0;ah=c[b+6720>>2]|0;ai=c[b+6728>>2]|0;aj=c[b+6736>>2]|0;ak=c[b+6744>>2]|0;al=c[b+6752>>2]|0;am=c[b+6760>>2]|0;an=c[b+6768>>2]|0;ao=c[b+6776>>2]|0;ap=c[b+6784>>2]|0;aq=c[b+6792>>2]|0;ar=c[b+6800>>2]|0;as=c[b+6808>>2]|0;at=c[b+6816>>2]|0;au=c[b+6824>>2]|0;av=c[b+6832>>2]|0;aw=c[b+6840>>2]|0;ax=c[b+6848>>2]|0;ay=c[b+6856>>2]|0;az=c[b+6864>>2]|0;aA=c[b+6872>>2]|0;aB=c[b+6904>>2]|0;aC=c[b+6912>>2]|0;aD=c[b+7064>>2]|0;aE=c[b+39768>>2]|0;aF=c[b+39776>>2]|0;OL:do{L8510:do{if((c[(d+212|0)>>2]|0)>0){aG=(b+1680|0)+144|0;aH=0;L8512:while(1){c[j>>2]=aH;aI=kc(aG,j)|0;a[k]=8;C=1701667182;a[k+1|0]=C;C=C>>8;a[(k+1|0)+1|0]=C;C=C>>8;a[(k+1|0)+2|0]=C;C=C>>8;a[(k+1|0)+3|0]=C;a[k+5|0]=0;aJ=kp(aI,b+168|0,k)|0;aK=c[aJ>>2]|0;if((aK|0)==0){aL=tu(40)|0;do{if((aL+16|0|0)!=0){if((a[k]&1)==0){c[(aL+16|0)>>2]=c[k>>2];c[(aL+16|0)+4>>2]=c[k+4>>2];c[(aL+16|0)+8>>2]=c[k+8>>2];break}aM=c[(k+8|0)>>2]|0;aN=c[(k+4|0)>>2]|0;if(aN>>>0>4294967279>>>0){aE=8065;break L8512}if(aN>>>0<11>>>0){a[aL+16|0]=aN<<1;aO=aL+17|0}else{aP=tu(aN+16&-16)|0;c[aL+24>>2]=aP;c[(aL+16|0)>>2]=aN+16&-16|1;c[aL+20>>2]=aN;aO=aP}tH(aO|0,aM|0,aN)|0;a[aO+aN|0]=0}}while(0);if((aL+28|0|0)!=0){tI(aL+28|0|0,0,12)|0}aN=c[(b+168|0)>>2]|0;c[aL>>2]=0;c[aL+4>>2]=0;c[aL+8>>2]=aN;c[aJ>>2]=aL;aN=c[c[(aI|0)>>2]>>2]|0;if((aN|0)==0){aQ=aL}else{c[(aI|0)>>2]=aN;aQ=c[aJ>>2]|0}jV(c[aI+4>>2]|0,aQ);c[(aI+8|0)>>2]=(c[(aI+8|0)>>2]|0)+1;aR=aL}else{aR=aK}aN=aR+28|0;if((a[aN]&1)==0){c[h>>2]=c[aN>>2];c[h+4>>2]=c[aN+4>>2];c[h+8>>2]=c[aN+8>>2]}else{aN=c[aR+36>>2]|0;aM=c[aR+32>>2]|0;if(aM>>>0>4294967279>>>0){aE=8084;break}if(aM>>>0<11>>>0){a[h]=aM<<1;aS=h+1|0}else{aP=tu(aM+16&-16)|0;c[(h+8|0)>>2]=aP;c[(h|0)>>2]=aM+16&-16|1;c[(h+4|0)>>2]=aM;aS=aP}tH(aS|0,aN|0,aM)|0;a[aS+aM|0]=0}aM=(c[(d+40|0)>>2]|0)+(aH*52|0)+16|0;if((aM|0)==0){hC(19,0,49832,(aF=i,i=i+1|0,i=i+7&-8,c[aF>>2]=0,aF)|0);i=aF}else{c[aM>>2]=cj(((a[h]&1)==0?h+1|0:c[(h+8|0)>>2]|0)|0)|0}if((a[h]&1)!=0){tw(c[(h+8|0)>>2]|0)}if((a[k]&1)!=0){tw(c[(k+8|0)>>2]|0)}c[m>>2]=aH;aM=kc(aG,m)|0;aN=tu(16)|0;c[(n+8|0)>>2]=aN;c[(n|0)>>2]=17;c[(n+4|0)>>2]=14;tH(aN|0,30344,14)|0;a[aN+14|0]=0;aN=kp(aM,b+160|0,n)|0;aP=c[aN>>2]|0;if((aP|0)==0){aT=tu(40)|0;do{if((aT+16|0|0)!=0){if((a[n]&1)==0){c[(aT+16|0)>>2]=c[n>>2];c[(aT+16|0)+4>>2]=c[n+4>>2];c[(aT+16|0)+8>>2]=c[n+8>>2];break}aU=c[(n+8|0)>>2]|0;aV=c[(n+4|0)>>2]|0;if(aV>>>0>4294967279>>>0){aE=8106;break L8512}if(aV>>>0<11>>>0){a[aT+16|0]=aV<<1;aW=aT+17|0}else{aX=tu(aV+16&-16)|0;c[aT+24>>2]=aX;c[(aT+16|0)>>2]=aV+16&-16|1;c[aT+20>>2]=aV;aW=aX}tH(aW|0,aU|0,aV)|0;a[aW+aV|0]=0}}while(0);if((aT+28|0|0)!=0){tI(aT+28|0|0,0,12)|0}aK=c[(b+160|0)>>2]|0;c[aT>>2]=0;c[aT+4>>2]=0;c[aT+8>>2]=aK;c[aN>>2]=aT;aK=c[c[(aM|0)>>2]>>2]|0;if((aK|0)==0){aY=aT}else{c[(aM|0)>>2]=aK;aY=c[aN>>2]|0}jV(c[aM+4>>2]|0,aY);c[(aM+8|0)>>2]=(c[(aM+8|0)>>2]|0)+1;aZ=aT}else{aZ=aP}aK=aZ+28|0;if((a[aK]&1)==0){c[l>>2]=c[aK>>2];c[l+4>>2]=c[aK+4>>2];c[l+8>>2]=c[aK+8>>2]}else{aK=c[aZ+36>>2]|0;aL=c[aZ+32>>2]|0;if(aL>>>0>4294967279>>>0){aE=8125;break}if(aL>>>0<11>>>0){a[l]=aL<<1;a_=l+1|0}else{aI=tu(aL+16&-16)|0;c[(l+8|0)>>2]=aI;c[(l|0)>>2]=aL+16&-16|1;c[(l+4|0)>>2]=aL;a_=aI}tH(a_|0,aK|0,aL)|0;a[a_+aL|0]=0}kd(l,(c[(d+40|0)>>2]|0)+(aH*52|0)+12|0);if((a[l]&1)!=0){tw(c[(l+8|0)>>2]|0)}if((a[n]&1)!=0){tw(c[(n+8|0)>>2]|0)}c[p>>2]=aH;aL=kc(aG,p)|0;aK=tu(16)|0;c[(q+8|0)>>2]=aK;c[(q|0)>>2]=17;c[(q+4|0)>>2]=11;tH(aK|0,3e4,11)|0;a[aK+11|0]=0;aK=kp(aL,b+152|0,q)|0;aI=c[aK>>2]|0;if((aI|0)==0){aJ=tu(40)|0;do{if((aJ+16|0|0)!=0){if((a[q]&1)==0){c[(aJ+16|0)>>2]=c[q>>2];c[(aJ+16|0)+4>>2]=c[q+4>>2];c[(aJ+16|0)+8>>2]=c[q+8>>2];break}aV=c[(q+8|0)>>2]|0;aU=c[(q+4|0)>>2]|0;if(aU>>>0>4294967279>>>0){aE=8144;break L8512}if(aU>>>0<11>>>0){a[aJ+16|0]=aU<<1;a$=aJ+17|0}else{aX=tu(aU+16&-16)|0;c[aJ+24>>2]=aX;c[(aJ+16|0)>>2]=aU+16&-16|1;c[aJ+20>>2]=aU;a$=aX}tH(a$|0,aV|0,aU)|0;a[a$+aU|0]=0}}while(0);if((aJ+28|0|0)!=0){tI(aJ+28|0|0,0,12)|0}aP=c[(b+152|0)>>2]|0;c[aJ>>2]=0;c[aJ+4>>2]=0;c[aJ+8>>2]=aP;c[aK>>2]=aJ;aP=c[c[(aL|0)>>2]>>2]|0;if((aP|0)==0){a0=aJ}else{c[(aL|0)>>2]=aP;a0=c[aK>>2]|0}jV(c[aL+4>>2]|0,a0);c[(aL+8|0)>>2]=(c[(aL+8|0)>>2]|0)+1;a1=aJ}else{a1=aI}aP=a1+28|0;if((a[aP]&1)==0){c[o>>2]=c[aP>>2];c[o+4>>2]=c[aP+4>>2];c[o+8>>2]=c[aP+8>>2]}else{aP=c[a1+36>>2]|0;aT=c[a1+32>>2]|0;if(aT>>>0>4294967279>>>0){aE=8163;break}if(aT>>>0<11>>>0){a[o]=aT<<1;a2=o+1|0}else{aM=tu(aT+16&-16)|0;c[(o+8|0)>>2]=aM;c[(o|0)>>2]=aT+16&-16|1;c[(o+4|0)>>2]=aT;a2=aM}tH(a2|0,aP|0,aT)|0;a[a2+aT|0]=0}aT=(c[(d+40|0)>>2]|0)+(aH*52|0)+20|0;if((aT|0)==0){hC(19,0,49832,(aF=i,i=i+1|0,i=i+7&-8,c[aF>>2]=0,aF)|0);i=aF}else{c[aT>>2]=cj(((a[o]&1)==0?o+1|0:c[(o+8|0)>>2]|0)|0)|0}if((a[o]&1)!=0){tw(c[(o+8|0)>>2]|0)}if((a[q]&1)!=0){tw(c[(q+8|0)>>2]|0)}c[s>>2]=aH;aT=kc(aG,s)|0;a[t]=16;C=1701603686;a[t+1|0|0]=C;C=C>>8;a[(t+1|0|0)+1|0]=C;C=C>>8;a[(t+1|0|0)+2|0]=C;C=C>>8;a[(t+1|0|0)+3|0]=C;C=1701667150;a[(t+1|0)+4|0]=C;C=C>>8;a[((t+1|0)+4|0)+1|0]=C;C=C>>8;a[((t+1|0)+4|0)+2|0]=C;C=C>>8;a[((t+1|0)+4|0)+3|0]=C;a[t+9|0]=0;aP=kp(aT,b+144|0,t)|0;aM=c[aP>>2]|0;if((aM|0)==0){aN=tu(40)|0;do{if((aN+16|0|0)!=0){if((a[t]&1)==0){c[(aN+16|0)>>2]=c[t>>2];c[(aN+16|0)+4>>2]=c[t+4>>2];c[(aN+16|0)+8>>2]=c[t+8>>2];break}aU=c[(t+8|0)>>2]|0;aV=c[(t+4|0)>>2]|0;if(aV>>>0>4294967279>>>0){aE=8184;break L8512}if(aV>>>0<11>>>0){a[aN+16|0]=aV<<1;a3=aN+17|0}else{aX=tu(aV+16&-16)|0;c[aN+24>>2]=aX;c[(aN+16|0)>>2]=aV+16&-16|1;c[aN+20>>2]=aV;a3=aX}tH(a3|0,aU|0,aV)|0;a[a3+aV|0]=0}}while(0);if((aN+28|0|0)!=0){tI(aN+28|0|0,0,12)|0}aI=c[(b+144|0)>>2]|0;c[aN>>2]=0;c[aN+4>>2]=0;c[aN+8>>2]=aI;c[aP>>2]=aN;aI=c[c[(aT|0)>>2]>>2]|0;if((aI|0)==0){a4=aN}else{c[(aT|0)>>2]=aI;a4=c[aP>>2]|0}jV(c[aT+4>>2]|0,a4);c[(aT+8|0)>>2]=(c[(aT+8|0)>>2]|0)+1;a5=aN}else{a5=aM}aI=a5+28|0;if((a[aI]&1)==0){c[r>>2]=c[aI>>2];c[r+4>>2]=c[aI+4>>2];c[r+8>>2]=c[aI+8>>2]}else{aI=c[a5+36>>2]|0;aJ=c[a5+32>>2]|0;if(aJ>>>0>4294967279>>>0){aE=8203;break}if(aJ>>>0<11>>>0){a[r]=aJ<<1;a6=r+1|0}else{aL=tu(aJ+16&-16)|0;c[(r+8|0)>>2]=aL;c[(r|0)>>2]=aJ+16&-16|1;c[(r+4|0)>>2]=aJ;a6=aL}tH(a6|0,aI|0,aJ)|0;a[a6+aJ|0]=0}aJ=(c[(d+40|0)>>2]|0)+(aH*52|0)+24|0;if((aJ|0)==0){hC(19,0,49832,(aF=i,i=i+1|0,i=i+7&-8,c[aF>>2]=0,aF)|0);i=aF}else{c[aJ>>2]=cj(((a[r]&1)==0?r+1|0:c[(r+8|0)>>2]|0)|0)|0}if((a[r]&1)!=0){tw(c[(r+8|0)>>2]|0)}if((a[t]&1)!=0){tw(c[(t+8|0)>>2]|0)}c[v>>2]=aH;aJ=kc(aG,v)|0;a[w]=18;tH(w+1|0|0,28704,9)|0;a[w+10|0]=0;aI=kp(aJ,b+136|0,w)|0;aL=c[aI>>2]|0;if((aL|0)==0){aK=tu(40)|0;do{if((aK+16|0|0)!=0){if((a[w]&1)==0){c[(aK+16|0)>>2]=c[w>>2];c[(aK+16|0)+4>>2]=c[w+4>>2];c[(aK+16|0)+8>>2]=c[w+8>>2];break}aV=c[(w+8|0)>>2]|0;aU=c[(w+4|0)>>2]|0;if(aU>>>0>4294967279>>>0){aE=8224;break L8512}if(aU>>>0<11>>>0){a[aK+16|0]=aU<<1;a7=aK+17|0}else{aX=tu(aU+16&-16)|0;c[aK+24>>2]=aX;c[(aK+16|0)>>2]=aU+16&-16|1;c[aK+20>>2]=aU;a7=aX}tH(a7|0,aV|0,aU)|0;a[a7+aU|0]=0}}while(0);if((aK+28|0|0)!=0){tI(aK+28|0|0,0,12)|0}aM=c[(b+136|0)>>2]|0;c[aK>>2]=0;c[aK+4>>2]=0;c[aK+8>>2]=aM;c[aI>>2]=aK;aM=c[c[(aJ|0)>>2]>>2]|0;if((aM|0)==0){a8=aK}else{c[(aJ|0)>>2]=aM;a8=c[aI>>2]|0}jV(c[aJ+4>>2]|0,a8);c[(aJ+8|0)>>2]=(c[(aJ+8|0)>>2]|0)+1;a9=aK}else{a9=aL}aM=a9+28|0;if((a[aM]&1)==0){c[u>>2]=c[aM>>2];c[u+4>>2]=c[aM+4>>2];c[u+8>>2]=c[aM+8>>2];ba=a[u]|0}else{aM=c[a9+36>>2]|0;aN=c[a9+32>>2]|0;if(aN>>>0>4294967279>>>0){aE=8243;break}if(aN>>>0<11>>>0){a[u]=aN<<1&255;bb=u+1|0;bc=aN<<1&255}else{aT=tu(aN+16&-16)|0;c[(u+8|0)>>2]=aT;c[(u|0)>>2]=aN+16&-16|1;c[(u+4|0)>>2]=aN;bb=aT;bc=(aN+16&-16|1)&255}tH(bb|0,aM|0,aN)|0;a[bb+aN|0]=0;ba=bc}aN=(c[(d+40|0)>>2]|0)+(aH*52|0)+28|0;aM=ba&255;aT=(aM&1|0)==0?aM>>>1:c[(u+4|0)>>2]|0;aM=(ba&1)==0;aP=c[(u+8|0)>>2]|0;aU=tK((aM?u+1|0:aP)|0,42e3,(aT>>>0>4>>>0?4:aT)|0)|0;if((aU|0)==0){bd=aT>>>0<4>>>0?-1:aT>>>0>4>>>0&1}else{bd=aU}a[aN]=(bd|0)==0|0;if(!aM){tw(aP)}if((a[w]&1)!=0){tw(c[(w+8|0)>>2]|0)}c[y>>2]=aH;aP=kc(aG,y)|0;aM=tu(16)|0;c[(z+8|0)>>2]=aM;c[(z|0)>>2]=17;c[(z+4|0)>>2]=11;tH(aM|0,28120,11)|0;a[aM+11|0]=0;aM=kp(aP,b+128|0,z)|0;aN=c[aM>>2]|0;if((aN|0)==0){aU=tu(40)|0;do{if((aU+16|0|0)!=0){if((a[z]&1)==0){c[(aU+16|0)>>2]=c[z>>2];c[(aU+16|0)+4>>2]=c[z+4>>2];c[(aU+16|0)+8>>2]=c[z+8>>2];break}aT=c[(z+8|0)>>2]|0;aV=c[(z+4|0)>>2]|0;if(aV>>>0>4294967279>>>0){aE=8264;break L8512}if(aV>>>0<11>>>0){a[aU+16|0]=aV<<1;be=aU+17|0}else{aX=tu(aV+16&-16)|0;c[aU+24>>2]=aX;c[(aU+16|0)>>2]=aV+16&-16|1;c[aU+20>>2]=aV;be=aX}tH(be|0,aT|0,aV)|0;a[be+aV|0]=0}}while(0);if((aU+28|0|0)!=0){tI(aU+28|0|0,0,12)|0}aL=c[(b+128|0)>>2]|0;c[aU>>2]=0;c[aU+4>>2]=0;c[aU+8>>2]=aL;c[aM>>2]=aU;aL=c[c[(aP|0)>>2]>>2]|0;if((aL|0)==0){bf=aU}else{c[(aP|0)>>2]=aL;bf=c[aM>>2]|0}jV(c[aP+4>>2]|0,bf);c[(aP+8|0)>>2]=(c[(aP+8|0)>>2]|0)+1;bg=aU}else{bg=aN}aL=bg+28|0;if((a[aL]&1)==0){c[x>>2]=c[aL>>2];c[x+4>>2]=c[aL+4>>2];c[x+8>>2]=c[aL+8>>2];bh=a[x]|0}else{aL=c[bg+36>>2]|0;aK=c[bg+32>>2]|0;if(aK>>>0>4294967279>>>0){aE=8283;break}if(aK>>>0<11>>>0){a[x]=aK<<1&255;bi=x+1|0;bj=aK<<1&255}else{aJ=tu(aK+16&-16)|0;c[(x+8|0)>>2]=aJ;c[(x|0)>>2]=aK+16&-16|1;c[(x+4|0)>>2]=aK;bi=aJ;bj=(aK+16&-16|1)&255}tH(bi|0,aL|0,aK)|0;a[bi+aK|0]=0;bh=bj}aK=(c[(d+40|0)>>2]|0)+(aH*52|0)+32|0;aL=bh&255;aJ=(aL&1|0)==0?aL>>>1:c[(x+4|0)>>2]|0;aL=(bh&1)==0;aI=c[(x+8|0)>>2]|0;aV=tK((aL?x+1|0:aI)|0,42e3,(aJ>>>0>4>>>0?4:aJ)|0)|0;if((aV|0)==0){bk=aJ>>>0<4>>>0?-1:aJ>>>0>4>>>0&1}else{bk=aV}a[aK]=(bk|0)==0|0;if(!aL){tw(aI)}if((a[z]&1)!=0){tw(c[(z+8|0)>>2]|0)}c[B>>2]=aH;aI=kc(aG,B)|0;a[D]=14;a[D+1|0]=a[27080]|0;a[(D+1|0)+1|0]=a[27081]|0;a[(D+1|0)+2|0]=a[27082]|0;a[(D+1|0)+3|0]=a[27083]|0;a[(D+1|0)+4|0]=a[27084]|0;a[(D+1|0)+5|0]=a[27085]|0;a[(D+1|0)+6|0]=a[27086]|0;a[D+8|0]=0;aL=kp(aI,b+120|0,D)|0;aK=c[aL>>2]|0;if((aK|0)==0){aV=tu(40)|0;do{if((aV+16|0|0)!=0){if((a[D]&1)==0){c[(aV+16|0)>>2]=c[D>>2];c[(aV+16|0)+4>>2]=c[D+4>>2];c[(aV+16|0)+8>>2]=c[D+8>>2];break}aJ=c[(D+8|0)>>2]|0;aT=c[(D+4|0)>>2]|0;if(aT>>>0>4294967279>>>0){aE=8303;break L8512}if(aT>>>0<11>>>0){a[aV+16|0]=aT<<1;bl=aV+17|0}else{aX=tu(aT+16&-16)|0;c[aV+24>>2]=aX;c[(aV+16|0)>>2]=aT+16&-16|1;c[aV+20>>2]=aT;bl=aX}tH(bl|0,aJ|0,aT)|0;a[bl+aT|0]=0}}while(0);if((aV+28|0|0)!=0){tI(aV+28|0|0,0,12)|0}aN=c[(b+120|0)>>2]|0;c[aV>>2]=0;c[aV+4>>2]=0;c[aV+8>>2]=aN;c[aL>>2]=aV;aN=c[c[(aI|0)>>2]>>2]|0;if((aN|0)==0){bm=aV}else{c[(aI|0)>>2]=aN;bm=c[aL>>2]|0}jV(c[aI+4>>2]|0,bm);c[(aI+8|0)>>2]=(c[(aI+8|0)>>2]|0)+1;bn=aV}else{bn=aK}aN=bn+28|0;if((a[aN]&1)==0){c[A>>2]=c[aN>>2];c[A+4>>2]=c[aN+4>>2];c[A+8>>2]=c[aN+8>>2];bo=a[A]|0}else{aN=c[bn+36>>2]|0;aU=c[bn+32>>2]|0;if(aU>>>0>4294967279>>>0){aE=8322;break}if(aU>>>0<11>>>0){a[A]=aU<<1&255;bp=A+1|0;bq=aU<<1&255}else{aP=tu(aU+16&-16)|0;c[(A+8|0)>>2]=aP;c[(A|0)>>2]=aU+16&-16|1;c[(A+4|0)>>2]=aU;bp=aP;bq=(aU+16&-16|1)&255}tH(bp|0,aN|0,aU)|0;a[bp+aU|0]=0;bo=bq}aU=(c[(d+40|0)>>2]|0)+(aH*52|0)+36|0;aN=bo&255;aP=(aN&1|0)==0?aN>>>1:c[(A+4|0)>>2]|0;aN=(bo&1)==0;aM=c[(A+8|0)>>2]|0;aT=tK((aN?A+1|0:aM)|0,42e3,(aP>>>0>4>>>0?4:aP)|0)|0;if((aT|0)==0){br=aP>>>0<4>>>0?-1:aP>>>0>4>>>0&1}else{br=aT}a[aU]=(br|0)==0|0;if(!aN){tw(aM)}if((a[D]&1)!=0){tw(c[(D+8|0)>>2]|0)}c[F>>2]=aH;aM=kc(aG,F)|0;a[G]=18;tH(G+1|0|0,26600,9)|0;a[G+10|0]=0;aN=kp(aM,b+112|0,G)|0;aU=c[aN>>2]|0;if((aU|0)==0){aT=tu(40)|0;do{if((aT+16|0|0)!=0){if((a[G]&1)==0){c[(aT+16|0)>>2]=c[G>>2];c[(aT+16|0)+4>>2]=c[G+4>>2];c[(aT+16|0)+8>>2]=c[G+8>>2];break}aP=c[(G+8|0)>>2]|0;aJ=c[(G+4|0)>>2]|0;if(aJ>>>0>4294967279>>>0){aE=8342;break L8512}if(aJ>>>0<11>>>0){a[aT+16|0]=aJ<<1;bs=aT+17|0}else{aX=tu(aJ+16&-16)|0;c[aT+24>>2]=aX;c[(aT+16|0)>>2]=aJ+16&-16|1;c[aT+20>>2]=aJ;bs=aX}tH(bs|0,aP|0,aJ)|0;a[bs+aJ|0]=0}}while(0);if((aT+28|0|0)!=0){tI(aT+28|0|0,0,12)|0}aK=c[(b+112|0)>>2]|0;c[aT>>2]=0;c[aT+4>>2]=0;c[aT+8>>2]=aK;c[aN>>2]=aT;aK=c[c[(aM|0)>>2]>>2]|0;if((aK|0)==0){bt=aT}else{c[(aM|0)>>2]=aK;bt=c[aN>>2]|0}jV(c[aM+4>>2]|0,bt);c[(aM+8|0)>>2]=(c[(aM+8|0)>>2]|0)+1;bu=aT}else{bu=aU}aK=bu+28|0;if((a[aK]&1)==0){c[E>>2]=c[aK>>2];c[E+4>>2]=c[aK+4>>2];c[E+8>>2]=c[aK+8>>2];bv=a[E]|0}else{aK=c[bu+36>>2]|0;aV=c[bu+32>>2]|0;if(aV>>>0>4294967279>>>0){aE=8361;break}if(aV>>>0<11>>>0){a[E]=aV<<1&255;bw=E+1|0;bx=aV<<1&255}else{aI=tu(aV+16&-16)|0;c[(E+8|0)>>2]=aI;c[(E|0)>>2]=aV+16&-16|1;c[(E+4|0)>>2]=aV;bw=aI;bx=(aV+16&-16|1)&255}tH(bw|0,aK|0,aV)|0;a[bw+aV|0]=0;bv=bx}aV=(c[(d+40|0)>>2]|0)+(aH*52|0)+40|0;aK=bv&255;aI=(aK&1|0)==0?aK>>>1:c[(E+4|0)>>2]|0;aK=(bv&1)==0;aL=c[(E+8|0)>>2]|0;aJ=tK((aK?E+1|0:aL)|0,42e3,(aI>>>0>4>>>0?4:aI)|0)|0;if((aJ|0)==0){by=aI>>>0<4>>>0?-1:aI>>>0>4>>>0&1}else{by=aJ}a[aV]=(by|0)==0|0;if(!aK){tw(aL)}if((a[G]&1)!=0){tw(c[(G+8|0)>>2]|0)}c[I>>2]=aH;aL=kc(aG,I)|0;aK=tu(16)|0;c[(J+8|0)>>2]=aK;c[(J|0)>>2]=17;c[(J+4|0)>>2]=12;tH(aK|0,25696,12)|0;a[aK+12|0]=0;aK=kp(aL,b+104|0,J)|0;aV=c[aK>>2]|0;if((aV|0)==0){aJ=tu(40)|0;do{if((aJ+16|0|0)!=0){if((a[J]&1)==0){c[(aJ+16|0)>>2]=c[J>>2];c[(aJ+16|0)+4>>2]=c[J+4>>2];c[(aJ+16|0)+8>>2]=c[J+8>>2];break}aI=c[(J+8|0)>>2]|0;aP=c[(J+4|0)>>2]|0;if(aP>>>0>4294967279>>>0){aE=8382;break L8512}if(aP>>>0<11>>>0){a[aJ+16|0]=aP<<1;bz=aJ+17|0}else{aX=tu(aP+16&-16)|0;c[aJ+24>>2]=aX;c[(aJ+16|0)>>2]=aP+16&-16|1;c[aJ+20>>2]=aP;bz=aX}tH(bz|0,aI|0,aP)|0;a[bz+aP|0]=0}}while(0);if((aJ+28|0|0)!=0){tI(aJ+28|0|0,0,12)|0}aU=c[(b+104|0)>>2]|0;c[aJ>>2]=0;c[aJ+4>>2]=0;c[aJ+8>>2]=aU;c[aK>>2]=aJ;aU=c[c[(aL|0)>>2]>>2]|0;if((aU|0)==0){bA=aJ}else{c[(aL|0)>>2]=aU;bA=c[aK>>2]|0}jV(c[aL+4>>2]|0,bA);c[(aL+8|0)>>2]=(c[(aL+8|0)>>2]|0)+1;bB=aJ}else{bB=aV}aU=bB+28|0;if((a[aU]&1)==0){c[H>>2]=c[aU>>2];c[H+4>>2]=c[aU+4>>2];c[H+8>>2]=c[aU+8>>2];bC=a[H]|0}else{aU=c[bB+36>>2]|0;aT=c[bB+32>>2]|0;if(aT>>>0>4294967279>>>0){aE=8401;break}if(aT>>>0<11>>>0){a[H]=aT<<1&255;bD=H+1|0;bE=aT<<1&255}else{aM=tu(aT+16&-16)|0;c[(H+8|0)>>2]=aM;c[(H|0)>>2]=aT+16&-16|1;c[(H+4|0)>>2]=aT;bD=aM;bE=(aT+16&-16|1)&255}tH(bD|0,aU|0,aT)|0;a[bD+aT|0]=0;bC=bE}aT=(c[(d+40|0)>>2]|0)+(aH*52|0)+44|0;aU=bC&255;aM=(aU&1|0)==0?aU>>>1:c[(H+4|0)>>2]|0;aU=(bC&1)==0;aN=c[(H+8|0)>>2]|0;aP=tK((aU?H+1|0:aN)|0,42e3,(aM>>>0>4>>>0?4:aM)|0)|0;if((aP|0)==0){bF=aM>>>0<4>>>0?-1:aM>>>0>4>>>0&1}else{bF=aP}a[aT]=(bF|0)==0|0;if(!aU){tw(aN)}if((a[J]&1)!=0){tw(c[(J+8|0)>>2]|0)}tI(K|0,0,12)|0;c[M>>2]=aH;aN=kc(aG,M)|0;a[N]=10;a[N+1|0]=a[57280]|0;a[(N+1|0)+1|0]=a[57281]|0;a[(N+1|0)+2|0]=a[57282]|0;a[(N+1|0)+3|0]=a[57283]|0;a[(N+1|0)+4|0]=a[57284]|0;a[N+6|0]=0;aU=kp(aN,b+96|0,N)|0;aT=c[aU>>2]|0;if((aT|0)==0){aP=tu(40)|0;do{if((aP+16|0|0)!=0){if((a[N]&1)==0){c[(aP+16|0)>>2]=c[N>>2];c[(aP+16|0)+4>>2]=c[N+4>>2];c[(aP+16|0)+8>>2]=c[N+8>>2];break}aM=c[(N+8|0)>>2]|0;aI=c[(N+4|0)>>2]|0;if(aI>>>0>4294967279>>>0){aE=8421;break L8512}if(aI>>>0<11>>>0){a[aP+16|0]=aI<<1;bG=aP+17|0}else{aX=tu(aI+16&-16)|0;c[aP+24>>2]=aX;c[(aP+16|0)>>2]=aI+16&-16|1;c[aP+20>>2]=aI;bG=aX}tH(bG|0,aM|0,aI)|0;a[bG+aI|0]=0}}while(0);if((aP+28|0|0)!=0){tI(aP+28|0|0,0,12)|0}aV=c[(b+96|0)>>2]|0;c[aP>>2]=0;c[aP+4>>2]=0;c[aP+8>>2]=aV;c[aU>>2]=aP;aV=c[c[(aN|0)>>2]>>2]|0;if((aV|0)==0){bH=aP}else{c[(aN|0)>>2]=aV;bH=c[aU>>2]|0}jV(c[aN+4>>2]|0,bH);c[(aN+8|0)>>2]=(c[(aN+8|0)>>2]|0)+1;bI=aP}else{bI=aT}aV=bI+28|0;if((a[aV]&1)==0){c[L>>2]=c[aV>>2];c[L+4>>2]=c[aV+4>>2];c[L+8>>2]=c[aV+8>>2]}else{aV=c[bI+36>>2]|0;aJ=c[bI+32>>2]|0;if(aJ>>>0>4294967279>>>0){aE=8440;break}if(aJ>>>0<11>>>0){a[L]=aJ<<1;bJ=L+1|0}else{aL=tu(aJ+16&-16)|0;c[(L+8|0)>>2]=aL;c[(L|0)>>2]=aJ+16&-16|1;c[(L+4|0)>>2]=aJ;bJ=aL}tH(bJ|0,aV|0,aJ)|0;a[bJ+aJ|0]=0}mp(K,L)|0;if((a[L]&1)!=0){tw(c[(L+8|0)>>2]|0)}if((a[N]&1)!=0){tw(c[(N+8|0)>>2]|0)}aJ=a[K]|0;aV=(aJ&255&1|0)==0?(aJ&255)>>>1:c[(K+4|0)>>2]|0;aL=tK(((aJ&1)==0?K+1|0:c[(K+8|0)>>2]|0)|0,57264,(aV>>>0>12>>>0?12:aV)|0)|0;if((aL|0)==0){bK=aV>>>0<12>>>0?-1:aV>>>0>12>>>0&1}else{bK=aL}c[(c[(d+40|0)>>2]|0)+(aH*52|0)>>2]=(bK|0)==0;aL=c[(d+40|0)>>2]|0;aV=c[aL+(aH*52|0)>>2]|0;hA(4,0,57e3,(aF=i,i=i+16|0,c[aF>>2]=c[aL+(aH*52|0)+16>>2],c[aF+8>>2]=aV,aF)|0);i=aF;aV=c[(d+40|0)>>2]|0;if((a[c[aV+(aH*52|0)+16>>2]|0]|0)==36){a[aV+(aH*52|0)+48|0]=1}c[P>>2]=aH;aV=kc(aG,P)|0;aL=tu(16)|0;c[(Q+8|0)>>2]=aL;c[(Q|0)>>2]=17;c[(Q+4|0)>>2]=13;tH(aL|0,56368,13)|0;a[aL+13|0]=0;aL=kp(aV,b+88|0,Q)|0;aJ=c[aL>>2]|0;if((aJ|0)==0){aK=tu(40)|0;do{if((aK+16|0|0)!=0){if((a[Q]&1)==0){c[(aK+16|0)>>2]=c[Q>>2];c[(aK+16|0)+4>>2]=c[Q+4>>2];c[(aK+16|0)+8>>2]=c[Q+8>>2];break}aI=c[(Q+8|0)>>2]|0;aM=c[(Q+4|0)>>2]|0;if(aM>>>0>4294967279>>>0){aE=8515;break L8512}if(aM>>>0<11>>>0){a[aK+16|0]=aM<<1;bL=aK+17|0}else{aX=tu(aM+16&-16)|0;c[aK+24>>2]=aX;c[(aK+16|0)>>2]=aM+16&-16|1;c[aK+20>>2]=aM;bL=aX}tH(bL|0,aI|0,aM)|0;a[bL+aM|0]=0}}while(0);if((aK+28|0|0)!=0){tI(aK+28|0|0,0,12)|0}aT=c[(b+88|0)>>2]|0;c[aK>>2]=0;c[aK+4>>2]=0;c[aK+8>>2]=aT;c[aL>>2]=aK;aT=c[c[(aV|0)>>2]>>2]|0;if((aT|0)==0){bM=aK}else{c[(aV|0)>>2]=aT;bM=c[aL>>2]|0}jV(c[aV+4>>2]|0,bM);c[(aV+8|0)>>2]=(c[(aV+8|0)>>2]|0)+1;bN=aK}else{bN=aJ}aT=bN+28|0;if((a[aT]&1)==0){c[O>>2]=c[aT>>2];c[O+4>>2]=c[aT+4>>2];c[O+8>>2]=c[aT+8>>2]}else{aT=c[bN+36>>2]|0;aP=c[bN+32>>2]|0;if(aP>>>0>4294967279>>>0){aE=8534;break}if(aP>>>0<11>>>0){a[O]=aP<<1;bO=O+1|0}else{aN=tu(aP+16&-16)|0;c[(O+8|0)>>2]=aN;c[(O|0)>>2]=aP+16&-16|1;c[(O+4|0)>>2]=aP;bO=aN}tH(bO|0,aT|0,aP)|0;a[bO+aP|0]=0}mp(K,O)|0;if((a[O]&1)!=0){tw(c[(O+8|0)>>2]|0)}if((a[Q]&1)!=0){tw(c[(Q+8|0)>>2]|0)}kl(b+1632|0,f|0,K);aP=c[(b+1632|0|0)>>2]|0;kl(b+1624|0,g|0,K);aT=c[(b+1624|0|0)>>2]|0;if((aP|0)==(aB|0)){if((aT|0)==(aC|0)){aE=8557;break}c[(c[(d+40|0)>>2]|0)+(aH*52|0)+4>>2]=c[aT+28>>2];a[(c[(d+40|0)>>2]|0)+(aH*52|0)+8|0]=1}else{c[(c[(d+40|0)>>2]|0)+(aH*52|0)+4>>2]=c[aP+28>>2];a[(c[(d+40|0)>>2]|0)+(aH*52|0)+8|0]=0}if((a[K]&1)!=0){tw(c[(K+8|0)>>2]|0)}aH=aH+1|0;if((aH|0)>=(c[(d+212|0)>>2]|0)){break L8510}}if((aE|0)==8065){ml(0)}else if((aE|0)==8084){ml(0)}else if((aE|0)==8106){ml(0)}else if((aE|0)==8125){ml(0)}else if((aE|0)==8144){ml(0)}else if((aE|0)==8163){ml(0)}else if((aE|0)==8184){ml(0)}else if((aE|0)==8203){ml(0)}else if((aE|0)==8224){ml(0)}else if((aE|0)==8243){ml(0)}else if((aE|0)==8264){ml(0)}else if((aE|0)==8283){ml(0)}else if((aE|0)==8303){ml(0)}else if((aE|0)==8322){ml(0)}else if((aE|0)==8342){ml(0)}else if((aE|0)==8361){ml(0)}else if((aE|0)==8382){ml(0)}else if((aE|0)==8401){ml(0)}else if((aE|0)==8421){ml(0)}else if((aE|0)==8440){ml(0)}else if((aE|0)==8515){ml(0)}else if((aE|0)==8534){ml(0)}else if((aE|0)==8557){tI(S|0,0,12)|0;aH=a[K]|0;aG=(aH&255&1|0)==0?(aH&255)>>>1:c[(K+4|0)>>2]|0;if((aG+23|0)>>>0>4294967279>>>0){ml(0)}if((aG+23|0)>>>0<11>>>0){a[S]=46;bP=S+1|0}else{aP=tu(aG+39&-16)|0;c[S+8>>2]=aP;c[S>>2]=aG+39&-16|1;c[S+4>>2]=23;bP=aP}tH(bP|0,52960,23)|0;a[bP+23|0]=0;mt(S,(aH&1)==0?K+1|0:c[(K+8|0)>>2]|0,aG)|0;tI(R|0,0,12)|0;aG=a[S]|0;if((aG&255&1|0)==0){bQ=(aG&255)>>>1}else{bQ=c[S+4>>2]|0}if((aG&1)==0){bR=S+1|0}else{bR=c[S+8>>2]|0}if((bQ+11|0)>>>0>4294967279>>>0){ml(0)}if(bQ>>>0>4294967284>>>0){a[R]=bQ<<1;bS=R+1|0}else{aG=bQ+27&-16;aH=tu(aG)|0;c[R+8>>2]=aH;c[R>>2]=aG|1;c[R+4>>2]=bQ;bS=aH}tH(bS|0,bR|0,bQ)|0;a[bS+bQ|0]=0;mt(R,55384,11)|0;if((a[S]&1)!=0){tw(c[S+8>>2]|0)}if((a[R]&1)==0){bT=R+1|0;hE(32800,(aF=i,i=i+8|0,c[aF>>2]=bT,aF)|0);i=aF}else{bT=c[R+8>>2]|0;hE(32800,(aF=i,i=i+8|0,c[aF>>2]=bT,aF)|0);i=aF}}}}while(0);if((c[17800]|0)!=0){dd[c[3504]&511](4)}hA(4,1,52576,(aF=i,i=i+1|0,i=i+7&-8,c[aF>>2]=0,aF)|0);i=aF;L9077:do{if((c[(d+216|0)>>2]|0)>0){aH=(b+1680|0)+180|0;aG=0;L9079:while(1){c[U>>2]=aG;aP=kc(aH,U)|0;a[V]=8;C=1701667182;a[V+1|0]=C;C=C>>8;a[(V+1|0)+1|0]=C;C=C>>8;a[(V+1|0)+2|0]=C;C=C>>8;a[(V+1|0)+3|0]=C;a[V+5|0]=0;aT=kp(aP,b+80|0,V)|0;aN=c[aT>>2]|0;if((aN|0)==0){aU=tu(40)|0;do{if((aU+16|0|0)!=0){if((a[V]&1)==0){c[(aU+16|0)>>2]=c[V>>2];c[(aU+16|0)+4>>2]=c[V+4>>2];c[(aU+16|0)+8>>2]=c[V+8>>2];break}aM=c[(V+8|0)>>2]|0;aI=c[(V+4|0)>>2]|0;if(aI>>>0>4294967279>>>0){aE=8607;break L9079}if(aI>>>0<11>>>0){a[aU+16|0]=aI<<1;bU=aU+17|0}else{aX=tu(aI+16&-16)|0;c[aU+24>>2]=aX;c[(aU+16|0)>>2]=aI+16&-16|1;c[aU+20>>2]=aI;bU=aX}tH(bU|0,aM|0,aI)|0;a[bU+aI|0]=0}}while(0);if((aU+28|0|0)!=0){tI(aU+28|0|0,0,12)|0}aJ=c[(b+80|0)>>2]|0;c[aU>>2]=0;c[aU+4>>2]=0;c[aU+8>>2]=aJ;c[aT>>2]=aU;aJ=c[c[(aP|0)>>2]>>2]|0;if((aJ|0)==0){bV=aU}else{c[(aP|0)>>2]=aJ;bV=c[aT>>2]|0}jV(c[aP+4>>2]|0,bV);c[(aP+8|0)>>2]=(c[(aP+8|0)>>2]|0)+1;bW=aU}else{bW=aN}aJ=bW+28|0;if((a[aJ]&1)==0){c[T>>2]=c[aJ>>2];c[T+4>>2]=c[aJ+4>>2];c[T+8>>2]=c[aJ+8>>2]}else{aJ=c[bW+36>>2]|0;aK=c[bW+32>>2]|0;if(aK>>>0>4294967279>>>0){aE=8626;break}if(aK>>>0<11>>>0){a[T]=aK<<1;bX=T+1|0}else{aV=tu(aK+16&-16)|0;c[(T+8|0)>>2]=aV;c[(T|0)>>2]=aK+16&-16|1;c[(T+4|0)>>2]=aK;bX=aV}tH(bX|0,aJ|0,aK)|0;a[bX+aK|0]=0}aK=(c[(d+44|0)>>2]|0)+(aG*52|0)+16|0;if((aK|0)==0){hC(19,0,49832,(aF=i,i=i+1|0,i=i+7&-8,c[aF>>2]=0,aF)|0);i=aF}else{c[aK>>2]=cj(((a[T]&1)==0?T+1|0:c[(T+8|0)>>2]|0)|0)|0}if((a[T]&1)!=0){tw(c[(T+8|0)>>2]|0)}if((a[V]&1)!=0){tw(c[(V+8|0)>>2]|0)}c[X>>2]=aG;aK=kc(aH,X)|0;aJ=tu(16)|0;c[(Y+8|0)>>2]=aJ;c[(Y|0)>>2]=17;c[(Y+4|0)>>2]=14;tH(aJ|0,30344,14)|0;a[aJ+14|0]=0;aJ=kp(aK,b+72|0,Y)|0;aV=c[aJ>>2]|0;if((aV|0)==0){aL=tu(40)|0;do{if((aL+16|0|0)!=0){if((a[Y]&1)==0){c[(aL+16|0)>>2]=c[Y>>2];c[(aL+16|0)+4>>2]=c[Y+4>>2];c[(aL+16|0)+8>>2]=c[Y+8>>2];break}aI=c[(Y+8|0)>>2]|0;aM=c[(Y+4|0)>>2]|0;if(aM>>>0>4294967279>>>0){aE=8648;break L9079}if(aM>>>0<11>>>0){a[aL+16|0]=aM<<1;bY=aL+17|0}else{aX=tu(aM+16&-16)|0;c[aL+24>>2]=aX;c[(aL+16|0)>>2]=aM+16&-16|1;c[aL+20>>2]=aM;bY=aX}tH(bY|0,aI|0,aM)|0;a[bY+aM|0]=0}}while(0);if((aL+28|0|0)!=0){tI(aL+28|0|0,0,12)|0}aN=c[(b+72|0)>>2]|0;c[aL>>2]=0;c[aL+4>>2]=0;c[aL+8>>2]=aN;c[aJ>>2]=aL;aN=c[c[(aK|0)>>2]>>2]|0;if((aN|0)==0){bZ=aL}else{c[(aK|0)>>2]=aN;bZ=c[aJ>>2]|0}jV(c[aK+4>>2]|0,bZ);c[(aK+8|0)>>2]=(c[(aK+8|0)>>2]|0)+1;b_=aL}else{b_=aV}aN=b_+28|0;if((a[aN]&1)==0){c[W>>2]=c[aN>>2];c[W+4>>2]=c[aN+4>>2];c[W+8>>2]=c[aN+8>>2]}else{aN=c[b_+36>>2]|0;aU=c[b_+32>>2]|0;if(aU>>>0>4294967279>>>0){aE=8667;break}if(aU>>>0<11>>>0){a[W]=aU<<1;b$=W+1|0}else{aP=tu(aU+16&-16)|0;c[(W+8|0)>>2]=aP;c[(W|0)>>2]=aU+16&-16|1;c[(W+4|0)>>2]=aU;b$=aP}tH(b$|0,aN|0,aU)|0;a[b$+aU|0]=0}kd(W,(c[(d+44|0)>>2]|0)+(aG*52|0)+12|0);if((a[W]&1)!=0){tw(c[(W+8|0)>>2]|0)}if((a[Y]&1)!=0){tw(c[(Y+8|0)>>2]|0)}c[_>>2]=aG;aU=kc(aH,_)|0;aN=tu(16)|0;c[($+8|0)>>2]=aN;c[($|0)>>2]=17;c[($+4|0)>>2]=11;tH(aN|0,3e4,11)|0;a[aN+11|0]=0;aN=kp(aU,b+64|0,$)|0;aP=c[aN>>2]|0;if((aP|0)==0){aT=tu(40)|0;do{if((aT+16|0|0)!=0){if((a[$]&1)==0){c[(aT+16|0)>>2]=c[$>>2];c[(aT+16|0)+4>>2]=c[$+4>>2];c[(aT+16|0)+8>>2]=c[$+8>>2];break}aM=c[($+8|0)>>2]|0;aI=c[($+4|0)>>2]|0;if(aI>>>0>4294967279>>>0){aE=8686;break L9079}if(aI>>>0<11>>>0){a[aT+16|0]=aI<<1;b0=aT+17|0}else{aX=tu(aI+16&-16)|0;c[aT+24>>2]=aX;c[(aT+16|0)>>2]=aI+16&-16|1;c[aT+20>>2]=aI;b0=aX}tH(b0|0,aM|0,aI)|0;a[b0+aI|0]=0}}while(0);if((aT+28|0|0)!=0){tI(aT+28|0|0,0,12)|0}aV=c[(b+64|0)>>2]|0;c[aT>>2]=0;c[aT+4>>2]=0;c[aT+8>>2]=aV;c[aN>>2]=aT;aV=c[c[(aU|0)>>2]>>2]|0;if((aV|0)==0){b1=aT}else{c[(aU|0)>>2]=aV;b1=c[aN>>2]|0}jV(c[aU+4>>2]|0,b1);c[(aU+8|0)>>2]=(c[(aU+8|0)>>2]|0)+1;b2=aT}else{b2=aP}aV=b2+28|0;if((a[aV]&1)==0){c[Z>>2]=c[aV>>2];c[Z+4>>2]=c[aV+4>>2];c[Z+8>>2]=c[aV+8>>2]}else{aV=c[b2+36>>2]|0;aL=c[b2+32>>2]|0;if(aL>>>0>4294967279>>>0){aE=8705;break}if(aL>>>0<11>>>0){a[Z]=aL<<1;b3=Z+1|0}else{aK=tu(aL+16&-16)|0;c[(Z+8|0)>>2]=aK;c[(Z|0)>>2]=aL+16&-16|1;c[(Z+4|0)>>2]=aL;b3=aK}tH(b3|0,aV|0,aL)|0;a[b3+aL|0]=0}aL=(c[(d+44|0)>>2]|0)+(aG*52|0)+20|0;if((aL|0)==0){hC(19,0,49832,(aF=i,i=i+1|0,i=i+7&-8,c[aF>>2]=0,aF)|0);i=aF}else{c[aL>>2]=cj(((a[Z]&1)==0?Z+1|0:c[(Z+8|0)>>2]|0)|0)|0}if((a[Z]&1)!=0){tw(c[(Z+8|0)>>2]|0)}if((a[$]&1)!=0){tw(c[($+8|0)>>2]|0)}c[ab>>2]=aG;aL=kc(aH,ab)|0;a[ac]=16;C=1701603686;a[ac+1|0|0]=C;C=C>>8;a[(ac+1|0|0)+1|0]=C;C=C>>8;a[(ac+1|0|0)+2|0]=C;C=C>>8;a[(ac+1|0|0)+3|0]=C;C=1701667150;a[(ac+1|0)+4|0]=C;C=C>>8;a[((ac+1|0)+4|0)+1|0]=C;C=C>>8;a[((ac+1|0)+4|0)+2|0]=C;C=C>>8;a[((ac+1|0)+4|0)+3|0]=C;a[ac+9|0]=0;aV=kp(aL,b+56|0,ac)|0;aK=c[aV>>2]|0;if((aK|0)==0){aJ=tu(40)|0;do{if((aJ+16|0|0)!=0){if((a[ac]&1)==0){c[(aJ+16|0)>>2]=c[ac>>2];c[(aJ+16|0)+4>>2]=c[ac+4>>2];c[(aJ+16|0)+8>>2]=c[ac+8>>2];break}aI=c[(ac+8|0)>>2]|0;aM=c[(ac+4|0)>>2]|0;if(aM>>>0>4294967279>>>0){aE=8726;break L9079}if(aM>>>0<11>>>0){a[aJ+16|0]=aM<<1;b4=aJ+17|0}else{aX=tu(aM+16&-16)|0;c[aJ+24>>2]=aX;c[(aJ+16|0)>>2]=aM+16&-16|1;c[aJ+20>>2]=aM;b4=aX}tH(b4|0,aI|0,aM)|0;a[b4+aM|0]=0}}while(0);if((aJ+28|0|0)!=0){tI(aJ+28|0|0,0,12)|0}aP=c[(b+56|0)>>2]|0;c[aJ>>2]=0;c[aJ+4>>2]=0;c[aJ+8>>2]=aP;c[aV>>2]=aJ;aP=c[c[(aL|0)>>2]>>2]|0;if((aP|0)==0){b5=aJ}else{c[(aL|0)>>2]=aP;b5=c[aV>>2]|0}jV(c[aL+4>>2]|0,b5);c[(aL+8|0)>>2]=(c[(aL+8|0)>>2]|0)+1;b6=aJ}else{b6=aK}aP=b6+28|0;if((a[aP]&1)==0){c[aa>>2]=c[aP>>2];c[aa+4>>2]=c[aP+4>>2];c[aa+8>>2]=c[aP+8>>2]}else{aP=c[b6+36>>2]|0;aT=c[b6+32>>2]|0;if(aT>>>0>4294967279>>>0){aE=8745;break}if(aT>>>0<11>>>0){a[aa]=aT<<1;b7=aa+1|0}else{aU=tu(aT+16&-16)|0;c[(aa+8|0)>>2]=aU;c[(aa|0)>>2]=aT+16&-16|1;c[(aa+4|0)>>2]=aT;b7=aU}tH(b7|0,aP|0,aT)|0;a[b7+aT|0]=0}aT=(c[(d+44|0)>>2]|0)+(aG*52|0)+24|0;if((aT|0)==0){hC(19,0,49832,(aF=i,i=i+1|0,i=i+7&-8,c[aF>>2]=0,aF)|0);i=aF}else{c[aT>>2]=cj(((a[aa]&1)==0?aa+1|0:c[(aa+8|0)>>2]|0)|0)|0}if((a[aa]&1)!=0){tw(c[(aa+8|0)>>2]|0)}if((a[ac]&1)!=0){tw(c[(ac+8|0)>>2]|0)}c[ae>>2]=aG;aT=kc(aH,ae)|0;a[af]=18;tH(af+1|0|0,28704,9)|0;a[af+10|0]=0;aP=kp(aT,b+48|0,af)|0;aU=c[aP>>2]|0;if((aU|0)==0){aN=tu(40)|0;do{if((aN+16|0|0)!=0){if((a[af]&1)==0){c[(aN+16|0)>>2]=c[af>>2];c[(aN+16|0)+4>>2]=c[af+4>>2];c[(aN+16|0)+8>>2]=c[af+8>>2];break}aM=c[(af+8|0)>>2]|0;aI=c[(af+4|0)>>2]|0;if(aI>>>0>4294967279>>>0){aE=8766;break L9079}if(aI>>>0<11>>>0){a[aN+16|0]=aI<<1;b8=aN+17|0}else{aX=tu(aI+16&-16)|0;c[aN+24>>2]=aX;c[(aN+16|0)>>2]=aI+16&-16|1;c[aN+20>>2]=aI;b8=aX}tH(b8|0,aM|0,aI)|0;a[b8+aI|0]=0}}while(0);if((aN+28|0|0)!=0){tI(aN+28|0|0,0,12)|0}aK=c[(b+48|0)>>2]|0;c[aN>>2]=0;c[aN+4>>2]=0;c[aN+8>>2]=aK;c[aP>>2]=aN;aK=c[c[(aT|0)>>2]>>2]|0;if((aK|0)==0){b9=aN}else{c[(aT|0)>>2]=aK;b9=c[aP>>2]|0}jV(c[aT+4>>2]|0,b9);c[(aT+8|0)>>2]=(c[(aT+8|0)>>2]|0)+1;ca=aN}else{ca=aU}aK=ca+28|0;if((a[aK]&1)==0){c[ad>>2]=c[aK>>2];c[ad+4>>2]=c[aK+4>>2];c[ad+8>>2]=c[aK+8>>2]}else{aK=c[ca+36>>2]|0;aJ=c[ca+32>>2]|0;if(aJ>>>0>4294967279>>>0){aE=8785;break}if(aJ>>>0<11>>>0){a[ad]=aJ<<1;cb=ad+1|0}else{aL=tu(aJ+16&-16)|0;c[(ad+8|0)>>2]=aL;c[(ad|0)>>2]=aJ+16&-16|1;c[(ad+4|0)>>2]=aJ;cb=aL}tH(cb|0,aK|0,aJ)|0;a[cb+aJ|0]=0}aJ=(c[(d+44|0)>>2]|0)+(aG*52|0)+28|0;if((aJ|0)==0){hC(19,0,49832,(aF=i,i=i+1|0,i=i+7&-8,c[aF>>2]=0,aF)|0);i=aF}else{c[aJ>>2]=cj(((a[ad]&1)==0?ad+1|0:c[(ad+8|0)>>2]|0)|0)|0}if((a[ad]&1)!=0){tw(c[(ad+8|0)>>2]|0)}if((a[af]&1)!=0){tw(c[(af+8|0)>>2]|0)}c[ah>>2]=aG;aJ=kc(aH,ah)|0;aK=tu(16)|0;c[(ai+8|0)>>2]=aK;c[(ai|0)>>2]=17;c[(ai+4|0)>>2]=11;tH(aK|0,28120,11)|0;a[aK+11|0]=0;aK=kp(aJ,b+40|0,ai)|0;aL=c[aK>>2]|0;if((aL|0)==0){aV=tu(40)|0;do{if((aV+16|0|0)!=0){if((a[ai]&1)==0){c[(aV+16|0)>>2]=c[ai>>2];c[(aV+16|0)+4>>2]=c[ai+4>>2];c[(aV+16|0)+8>>2]=c[ai+8>>2];break}aI=c[(ai+8|0)>>2]|0;aM=c[(ai+4|0)>>2]|0;if(aM>>>0>4294967279>>>0){aE=8807;break L9079}if(aM>>>0<11>>>0){a[aV+16|0]=aM<<1;cc=aV+17|0}else{aX=tu(aM+16&-16)|0;c[aV+24>>2]=aX;c[(aV+16|0)>>2]=aM+16&-16|1;c[aV+20>>2]=aM;cc=aX}tH(cc|0,aI|0,aM)|0;a[cc+aM|0]=0}}while(0);if((aV+28|0|0)!=0){tI(aV+28|0|0,0,12)|0}aU=c[(b+40|0)>>2]|0;c[aV>>2]=0;c[aV+4>>2]=0;c[aV+8>>2]=aU;c[aK>>2]=aV;aU=c[c[(aJ|0)>>2]>>2]|0;if((aU|0)==0){cd=aV}else{c[(aJ|0)>>2]=aU;cd=c[aK>>2]|0}jV(c[aJ+4>>2]|0,cd);c[(aJ+8|0)>>2]=(c[(aJ+8|0)>>2]|0)+1;ce=aV}else{ce=aL}aU=ce+28|0;if((a[aU]&1)==0){c[ag>>2]=c[aU>>2];c[ag+4>>2]=c[aU+4>>2];c[ag+8>>2]=c[aU+8>>2]}else{aU=c[ce+36>>2]|0;aN=c[ce+32>>2]|0;if(aN>>>0>4294967279>>>0){aE=8826;break}if(aN>>>0<11>>>0){a[ag]=aN<<1;cf=ag+1|0}else{aT=tu(aN+16&-16)|0;c[(ag+8|0)>>2]=aT;c[(ag|0)>>2]=aN+16&-16|1;c[(ag+4|0)>>2]=aN;cf=aT}tH(cf|0,aU|0,aN)|0;a[cf+aN|0]=0}aN=(c[(d+44|0)>>2]|0)+(aG*52|0)+32|0;if((aN|0)==0){hC(19,0,49832,(aF=i,i=i+1|0,i=i+7&-8,c[aF>>2]=0,aF)|0);i=aF}else{c[aN>>2]=cj(((a[ag]&1)==0?ag+1|0:c[(ag+8|0)>>2]|0)|0)|0}if((a[ag]&1)!=0){tw(c[(ag+8|0)>>2]|0)}if((a[ai]&1)!=0){tw(c[(ai+8|0)>>2]|0)}c[ak>>2]=aG;aN=kc(aH,ak)|0;a[al]=14;a[al+1|0]=a[27080]|0;a[(al+1|0)+1|0]=a[27081]|0;a[(al+1|0)+2|0]=a[27082]|0;a[(al+1|0)+3|0]=a[27083]|0;a[(al+1|0)+4|0]=a[27084]|0;a[(al+1|0)+5|0]=a[27085]|0;a[(al+1|0)+6|0]=a[27086]|0;a[al+8|0]=0;aU=kp(aN,b+32|0,al)|0;aT=c[aU>>2]|0;if((aT|0)==0){aP=tu(40)|0;do{if((aP+16|0|0)!=0){if((a[al]&1)==0){c[(aP+16|0)>>2]=c[al>>2];c[(aP+16|0)+4>>2]=c[al+4>>2];c[(aP+16|0)+8>>2]=c[al+8>>2];break}aM=c[(al+8|0)>>2]|0;aI=c[(al+4|0)>>2]|0;if(aI>>>0>4294967279>>>0){aE=8847;break L9079}if(aI>>>0<11>>>0){a[aP+16|0]=aI<<1;cg=aP+17|0}else{aX=tu(aI+16&-16)|0;c[aP+24>>2]=aX;c[(aP+16|0)>>2]=aI+16&-16|1;c[aP+20>>2]=aI;cg=aX}tH(cg|0,aM|0,aI)|0;a[cg+aI|0]=0}}while(0);if((aP+28|0|0)!=0){tI(aP+28|0|0,0,12)|0}aL=c[(b+32|0)>>2]|0;c[aP>>2]=0;c[aP+4>>2]=0;c[aP+8>>2]=aL;c[aU>>2]=aP;aL=c[c[(aN|0)>>2]>>2]|0;if((aL|0)==0){ch=aP}else{c[(aN|0)>>2]=aL;ch=c[aU>>2]|0}jV(c[aN+4>>2]|0,ch);c[(aN+8|0)>>2]=(c[(aN+8|0)>>2]|0)+1;ci=aP}else{ci=aT}aL=ci+28|0;if((a[aL]&1)==0){c[aj>>2]=c[aL>>2];c[aj+4>>2]=c[aL+4>>2];c[aj+8>>2]=c[aL+8>>2]}else{aL=c[ci+36>>2]|0;aV=c[ci+32>>2]|0;if(aV>>>0>4294967279>>>0){aE=8866;break}if(aV>>>0<11>>>0){a[aj]=aV<<1;ck=aj+1|0}else{aJ=tu(aV+16&-16)|0;c[(aj+8|0)>>2]=aJ;c[(aj|0)>>2]=aV+16&-16|1;c[(aj+4|0)>>2]=aV;ck=aJ}tH(ck|0,aL|0,aV)|0;a[ck+aV|0]=0}aV=(c[(d+44|0)>>2]|0)+(aG*52|0)+36|0;if((aV|0)==0){hC(19,0,49832,(aF=i,i=i+1|0,i=i+7&-8,c[aF>>2]=0,aF)|0);i=aF}else{c[aV>>2]=cj(((a[aj]&1)==0?aj+1|0:c[(aj+8|0)>>2]|0)|0)|0}if((a[aj]&1)!=0){tw(c[(aj+8|0)>>2]|0)}if((a[al]&1)!=0){tw(c[(al+8|0)>>2]|0)}c[an>>2]=aG;aV=kc(aH,an)|0;a[ao]=18;tH(ao+1|0|0,26600,9)|0;a[ao+10|0]=0;aL=kp(aV,b+24|0,ao)|0;aJ=c[aL>>2]|0;if((aJ|0)==0){aK=tu(40)|0;do{if((aK+16|0|0)!=0){if((a[ao]&1)==0){c[(aK+16|0)>>2]=c[ao>>2];c[(aK+16|0)+4>>2]=c[ao+4>>2];c[(aK+16|0)+8>>2]=c[ao+8>>2];break}aI=c[(ao+8|0)>>2]|0;aM=c[(ao+4|0)>>2]|0;if(aM>>>0>4294967279>>>0){aE=8887;break L9079}if(aM>>>0<11>>>0){a[aK+16|0]=aM<<1;cl=aK+17|0}else{aX=tu(aM+16&-16)|0;c[aK+24>>2]=aX;c[(aK+16|0)>>2]=aM+16&-16|1;c[aK+20>>2]=aM;cl=aX}tH(cl|0,aI|0,aM)|0;a[cl+aM|0]=0}}while(0);if((aK+28|0|0)!=0){tI(aK+28|0|0,0,12)|0}aT=c[(b+24|0)>>2]|0;c[aK>>2]=0;c[aK+4>>2]=0;c[aK+8>>2]=aT;c[aL>>2]=aK;aT=c[c[(aV|0)>>2]>>2]|0;if((aT|0)==0){cm=aK}else{c[(aV|0)>>2]=aT;cm=c[aL>>2]|0}jV(c[aV+4>>2]|0,cm);c[(aV+8|0)>>2]=(c[(aV+8|0)>>2]|0)+1;cn=aK}else{cn=aJ}aT=cn+28|0;if((a[aT]&1)==0){c[am>>2]=c[aT>>2];c[am+4>>2]=c[aT+4>>2];c[am+8>>2]=c[aT+8>>2]}else{aT=c[cn+36>>2]|0;aP=c[cn+32>>2]|0;if(aP>>>0>4294967279>>>0){aE=8906;break}if(aP>>>0<11>>>0){a[am]=aP<<1;co=am+1|0}else{aN=tu(aP+16&-16)|0;c[(am+8|0)>>2]=aN;c[(am|0)>>2]=aP+16&-16|1;c[(am+4|0)>>2]=aP;co=aN}tH(co|0,aT|0,aP)|0;a[co+aP|0]=0}aP=(c[(d+44|0)>>2]|0)+(aG*52|0)+40|0;if((aP|0)==0){hC(19,0,49832,(aF=i,i=i+1|0,i=i+7&-8,c[aF>>2]=0,aF)|0);i=aF}else{c[aP>>2]=cj(((a[am]&1)==0?am+1|0:c[(am+8|0)>>2]|0)|0)|0}if((a[am]&1)!=0){tw(c[(am+8|0)>>2]|0)}if((a[ao]&1)!=0){tw(c[(ao+8|0)>>2]|0)}c[aq>>2]=aG;aP=kc(aH,aq)|0;aT=tu(16)|0;c[(ar+8|0)>>2]=aT;c[(ar|0)>>2]=17;c[(ar+4|0)>>2]=12;tH(aT|0,25696,12)|0;a[aT+12|0]=0;aT=kp(aP,b+16|0,ar)|0;aN=c[aT>>2]|0;if((aN|0)==0){aU=tu(40)|0;do{if((aU+16|0|0)!=0){if((a[ar]&1)==0){c[(aU+16|0)>>2]=c[ar>>2];c[(aU+16|0)+4>>2]=c[ar+4>>2];c[(aU+16|0)+8>>2]=c[ar+8>>2];break}aM=c[(ar+8|0)>>2]|0;aI=c[(ar+4|0)>>2]|0;if(aI>>>0>4294967279>>>0){aE=8928;break L9079}if(aI>>>0<11>>>0){a[aU+16|0]=aI<<1;cp=aU+17|0}else{aX=tu(aI+16&-16)|0;c[aU+24>>2]=aX;c[(aU+16|0)>>2]=aI+16&-16|1;c[aU+20>>2]=aI;cp=aX}tH(cp|0,aM|0,aI)|0;a[cp+aI|0]=0}}while(0);if((aU+28|0|0)!=0){tI(aU+28|0|0,0,12)|0}aJ=c[(b+16|0)>>2]|0;c[aU>>2]=0;c[aU+4>>2]=0;c[aU+8>>2]=aJ;c[aT>>2]=aU;aJ=c[c[(aP|0)>>2]>>2]|0;if((aJ|0)==0){cq=aU}else{c[(aP|0)>>2]=aJ;cq=c[aT>>2]|0}jV(c[aP+4>>2]|0,cq);c[(aP+8|0)>>2]=(c[(aP+8|0)>>2]|0)+1;cr=aU}else{cr=aN}aJ=cr+28|0;if((a[aJ]&1)==0){c[ap>>2]=c[aJ>>2];c[ap+4>>2]=c[aJ+4>>2];c[ap+8>>2]=c[aJ+8>>2]}else{aJ=c[cr+36>>2]|0;aK=c[cr+32>>2]|0;if(aK>>>0>4294967279>>>0){aE=8947;break}if(aK>>>0<11>>>0){a[ap]=aK<<1;cs=ap+1|0}else{aV=tu(aK+16&-16)|0;c[(ap+8|0)>>2]=aV;c[(ap|0)>>2]=aK+16&-16|1;c[(ap+4|0)>>2]=aK;cs=aV}tH(cs|0,aJ|0,aK)|0;a[cs+aK|0]=0}aK=(c[(d+44|0)>>2]|0)+(aG*52|0)+44|0;if((aK|0)==0){hC(19,0,49832,(aF=i,i=i+1|0,i=i+7&-8,c[aF>>2]=0,aF)|0);i=aF}else{c[aK>>2]=cj(((a[ap]&1)==0?ap+1|0:c[(ap+8|0)>>2]|0)|0)|0}if((a[ap]&1)!=0){tw(c[(ap+8|0)>>2]|0)}if((a[ar]&1)!=0){tw(c[(ar+8|0)>>2]|0)}tI(as|0,0,12)|0;c[au>>2]=aG;aK=kc(aH,au)|0;a[av]=10;a[av+1|0]=a[57280]|0;a[(av+1|0)+1|0]=a[57281]|0;a[(av+1|0)+2|0]=a[57282]|0;a[(av+1|0)+3|0]=a[57283]|0;a[(av+1|0)+4|0]=a[57284]|0;a[av+6|0]=0;aJ=kp(aK,b+8|0,av)|0;aV=c[aJ>>2]|0;if((aV|0)==0){aL=tu(40)|0;do{if((aL+16|0|0)!=0){if((a[av]&1)==0){c[(aL+16|0)>>2]=c[av>>2];c[(aL+16|0)+4>>2]=c[av+4>>2];c[(aL+16|0)+8>>2]=c[av+8>>2];break}aI=c[(av+8|0)>>2]|0;aM=c[(av+4|0)>>2]|0;if(aM>>>0>4294967279>>>0){aE=8968;break L9079}if(aM>>>0<11>>>0){a[aL+16|0]=aM<<1;ct=aL+17|0}else{aX=tu(aM+16&-16)|0;c[aL+24>>2]=aX;c[(aL+16|0)>>2]=aM+16&-16|1;c[aL+20>>2]=aM;ct=aX}tH(ct|0,aI|0,aM)|0;a[ct+aM|0]=0}}while(0);if((aL+28|0|0)!=0){tI(aL+28|0|0,0,12)|0}aN=c[(b+8|0)>>2]|0;c[aL>>2]=0;c[aL+4>>2]=0;c[aL+8>>2]=aN;c[aJ>>2]=aL;aN=c[c[(aK|0)>>2]>>2]|0;if((aN|0)==0){cu=aL}else{c[(aK|0)>>2]=aN;cu=c[aJ>>2]|0}jV(c[aK+4>>2]|0,cu);c[(aK+8|0)>>2]=(c[(aK+8|0)>>2]|0)+1;cv=aL}else{cv=aV}aN=cv+28|0;if((a[aN]&1)==0){c[at>>2]=c[aN>>2];c[at+4>>2]=c[aN+4>>2];c[at+8>>2]=c[aN+8>>2]}else{aN=c[cv+36>>2]|0;aU=c[cv+32>>2]|0;if(aU>>>0>4294967279>>>0){aE=8987;break}if(aU>>>0<11>>>0){a[at]=aU<<1;cw=at+1|0}else{aP=tu(aU+16&-16)|0;c[(at+8|0)>>2]=aP;c[(at|0)>>2]=aU+16&-16|1;c[(at+4|0)>>2]=aU;cw=aP}tH(cw|0,aN|0,aU)|0;a[cw+aU|0]=0}mp(as,at)|0;if((a[at]&1)!=0){tw(c[(at+8|0)>>2]|0)}if((a[av]&1)!=0){tw(c[(av+8|0)>>2]|0)}aU=a[as]|0;aN=(aU&255&1|0)==0?(aU&255)>>>1:c[(as+4|0)>>2]|0;aP=tK(((aU&1)==0?as+1|0:c[(as+8|0)>>2]|0)|0,57264,(aN>>>0>12>>>0?12:aN)|0)|0;if((aP|0)==0){cx=aN>>>0<12>>>0?-1:aN>>>0>12>>>0&1}else{cx=aP}c[(c[(d+44|0)>>2]|0)+(aG*52|0)>>2]=(cx|0)==0;aP=c[(d+44|0)>>2]|0;aN=c[aP+(aG*52|0)>>2]|0;hA(4,0,57e3,(aF=i,i=i+16|0,c[aF>>2]=c[aP+(aG*52|0)+16>>2],c[aF+8>>2]=aN,aF)|0);i=aF;aN=c[(d+44|0)>>2]|0;if((a[c[aN+(aG*52|0)+16>>2]|0]|0)==36){a[aN+(aG*52|0)+48|0]=1}c[ax>>2]=aG;aN=kc(aH,ax)|0;aP=tu(16)|0;c[(ay+8|0)>>2]=aP;c[(ay|0)>>2]=17;c[(ay+4|0)>>2]=13;tH(aP|0,56368,13)|0;a[aP+13|0]=0;aP=kp(aN,b|0,ay)|0;aU=c[aP>>2]|0;if((aU|0)==0){aT=tu(40)|0;do{if((aT+16|0|0)!=0){if((a[ay]&1)==0){c[(aT+16|0)>>2]=c[ay>>2];c[(aT+16|0)+4>>2]=c[ay+4>>2];c[(aT+16|0)+8>>2]=c[ay+8>>2];break}aM=c[(ay+8|0)>>2]|0;aI=c[(ay+4|0)>>2]|0;if(aI>>>0>4294967279>>>0){aE=9057;break L9079}if(aI>>>0<11>>>0){a[aT+16|0]=aI<<1;cy=aT+17|0}else{aX=tu(aI+16&-16)|0;c[aT+24>>2]=aX;c[(aT+16|0)>>2]=aI+16&-16|1;c[aT+20>>2]=aI;cy=aX}tH(cy|0,aM|0,aI)|0;a[cy+aI|0]=0}}while(0);if((aT+28|0|0)!=0){tI(aT+28|0|0,0,12)|0}aV=c[(b|0)>>2]|0;c[aT>>2]=0;c[aT+4>>2]=0;c[aT+8>>2]=aV;c[aP>>2]=aT;aV=c[c[(aN|0)>>2]>>2]|0;if((aV|0)==0){cz=aT}else{c[(aN|0)>>2]=aV;cz=c[aP>>2]|0}jV(c[aN+4>>2]|0,cz);c[(aN+8|0)>>2]=(c[(aN+8|0)>>2]|0)+1;cA=aT}else{cA=aU}aV=cA+28|0;if((a[aV]&1)==0){c[aw>>2]=c[aV>>2];c[aw+4>>2]=c[aV+4>>2];c[aw+8>>2]=c[aV+8>>2]}else{aV=c[cA+36>>2]|0;aL=c[cA+32>>2]|0;if(aL>>>0>4294967279>>>0){aE=9076;break}if(aL>>>0<11>>>0){a[aw]=aL<<1;cB=aw+1|0}else{aK=tu(aL+16&-16)|0;c[(aw+8|0)>>2]=aK;c[(aw|0)>>2]=aL+16&-16|1;c[(aw+4|0)>>2]=aL;cB=aK}tH(cB|0,aV|0,aL)|0;a[cB+aL|0]=0}mp(as,aw)|0;if((a[aw]&1)!=0){tw(c[(aw+8|0)>>2]|0)}if((a[ay]&1)!=0){tw(c[(ay+8|0)>>2]|0)}kl(b+1616|0,f|0,as);aL=c[(b+1616|0|0)>>2]|0;kl(b+1608|0,g|0,as);aV=c[(b+1608|0|0)>>2]|0;if((aL|0)==(aB|0)){if((aV|0)==(aC|0)){aE=9099;break}c[(c[(d+44|0)>>2]|0)+(aG*52|0)+4>>2]=c[aV+28>>2];a[(c[(d+44|0)>>2]|0)+(aG*52|0)+8|0]=1}else{c[(c[(d+44|0)>>2]|0)+(aG*52|0)+4>>2]=c[aL+28>>2];a[(c[(d+44|0)>>2]|0)+(aG*52|0)+8|0]=0}if((a[as]&1)!=0){tw(c[(as+8|0)>>2]|0)}aG=aG+1|0;if((aG|0)>=(c[(d+216|0)>>2]|0)){break L9077}}if((aE|0)==8607){ml(0)}else if((aE|0)==8626){ml(0)}else if((aE|0)==8648){ml(0)}else if((aE|0)==8667){ml(0)}else if((aE|0)==8686){ml(0)}else if((aE|0)==8705){ml(0)}else if((aE|0)==8726){ml(0)}else if((aE|0)==8745){ml(0)}else if((aE|0)==8766){ml(0)}else if((aE|0)==8785){ml(0)}else if((aE|0)==8807){ml(0)}else if((aE|0)==8826){ml(0)}else if((aE|0)==8847){ml(0)}else if((aE|0)==8866){ml(0)}else if((aE|0)==8887){ml(0)}else if((aE|0)==8906){ml(0)}else if((aE|0)==8928){ml(0)}else if((aE|0)==8947){ml(0)}else if((aE|0)==8968){ml(0)}else if((aE|0)==8987){ml(0)}else if((aE|0)==9057){ml(0)}else if((aE|0)==9076){ml(0)}else if((aE|0)==9099){tI(aA|0,0,12)|0;aG=a[as]|0;aH=(aG&255&1|0)==0?(aG&255)>>>1:c[(as+4|0)>>2]|0;if((aH+22|0)>>>0>4294967279>>>0){ml(0)}if((aH+22|0)>>>0<11>>>0){a[aA]=44;cC=aA+1|0}else{aL=tu(aH+38&-16)|0;c[aA+8>>2]=aL;c[aA>>2]=aH+38&-16|1;c[aA+4>>2]=22;cC=aL}tH(cC|0,52424,22)|0;a[cC+22|0]=0;mt(aA,(aG&1)==0?as+1|0:c[(as+8|0)>>2]|0,aH)|0;tI(az|0,0,12)|0;aH=a[aA]|0;if((aH&255&1|0)==0){cD=(aH&255)>>>1}else{cD=c[aA+4>>2]|0}if((aH&1)==0){cE=aA+1|0}else{cE=c[aA+8>>2]|0}if((cD+11|0)>>>0>4294967279>>>0){ml(0)}if(cD>>>0>4294967284>>>0){a[az]=cD<<1;cF=az+1|0}else{aH=cD+27&-16;aG=tu(aH)|0;c[az+8>>2]=aG;c[az>>2]=aH|1;c[az+4>>2]=cD;cF=aG}tH(cF|0,cE|0,cD)|0;a[cF+cD|0]=0;mt(az,55384,11)|0;if((a[aA]&1)!=0){tw(c[aA+8>>2]|0)}if((a[az]&1)==0){cG=az+1|0;hE(32800,(aF=i,i=i+8|0,c[aF>>2]=cG,aF)|0);i=aF}else{cG=c[az+8>>2]|0;hE(32800,(aF=i,i=i+8|0,c[aF>>2]=cG,aF)|0);i=aF}}}}while(0);if((c[17800]|0)!=0){dd[c[3504]&511](4)}eJ(aD);ku(g|0,c[g+4>>2]|0);ku(f|0,c[f+4>>2]|0);if((a[e]&1)==0){ks(b+1680|0);i=b;c[b+39792>>2]=5;break OL}tw(c[(b+1880|0)+8>>2]|0);ks(b+1680|0);i=b;c[b+39792>>2]=5;break OL}while(0);c[b+39768>>2]=aE;c[b+39776>>2]=aF}function _read_input_xml$1(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0,bP=0,bQ=0,bR=0,bS=0,bT=0,bU=0,bV=0,bW=0,bX=0,bY=0,bZ=0,b_=0,b$=0,b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,b7=0,b8=0,b9=0,ca=0,cb=0,cc=0,cd=0,ce=0,cf=0,cg=0,ch=0,ci=0,ck=0,cl=0,cm=0,cn=0,co=0,cp=0,cq=0,cr=0,cs=0,ct=0;d=c[b+1904>>2]|0;e=c[b+1928>>2]|0;f=c[b+1936>>2]|0;g=c[b+5728>>2]|0;h=c[b+5736>>2]|0;j=c[b+5744>>2]|0;k=c[b+5752>>2]|0;l=c[b+5760>>2]|0;m=c[b+5768>>2]|0;n=c[b+5776>>2]|0;o=c[b+5784>>2]|0;p=c[b+5792>>2]|0;q=c[b+5800>>2]|0;r=c[b+5808>>2]|0;s=c[b+5816>>2]|0;t=c[b+5824>>2]|0;u=c[b+5832>>2]|0;v=c[b+5840>>2]|0;w=c[b+5848>>2]|0;x=c[b+5856>>2]|0;y=c[b+5864>>2]|0;z=c[b+5872>>2]|0;A=c[b+5880>>2]|0;B=c[b+5888>>2]|0;D=c[b+5896>>2]|0;E=c[b+5904>>2]|0;F=c[b+5912>>2]|0;G=c[b+5920>>2]|0;H=c[b+5928>>2]|0;I=c[b+5936>>2]|0;J=c[b+5944>>2]|0;K=c[b+5952>>2]|0;L=c[b+5960>>2]|0;M=c[b+5968>>2]|0;N=c[b+5976>>2]|0;O=c[b+5984>>2]|0;P=c[b+5992>>2]|0;Q=c[b+6e3>>2]|0;R=c[b+6008>>2]|0;S=c[b+6016>>2]|0;T=c[b+6024>>2]|0;U=c[b+6032>>2]|0;V=c[b+6040>>2]|0;W=c[b+6048>>2]|0;X=c[b+6056>>2]|0;Y=c[b+6064>>2]|0;Z=c[b+6072>>2]|0;_=c[b+6080>>2]|0;$=c[b+6088>>2]|0;aa=c[b+6096>>2]|0;ab=c[b+6104>>2]|0;ac=c[b+6112>>2]|0;ad=c[b+6120>>2]|0;ae=c[b+6128>>2]|0;af=c[b+6136>>2]|0;ag=c[b+6144>>2]|0;ah=c[b+6152>>2]|0;ai=c[b+6160>>2]|0;aj=c[b+6168>>2]|0;ak=c[b+6176>>2]|0;al=c[b+6184>>2]|0;am=c[b+6192>>2]|0;an=c[b+6200>>2]|0;ao=c[b+6208>>2]|0;ap=c[b+6216>>2]|0;aq=c[b+6224>>2]|0;ar=c[b+6232>>2]|0;as=c[b+6240>>2]|0;at=c[b+6248>>2]|0;au=c[b+6256>>2]|0;av=c[b+6264>>2]|0;aw=c[b+6272>>2]|0;ax=c[b+6280>>2]|0;ay=c[b+6288>>2]|0;az=c[b+6296>>2]|0;aA=c[b+6904>>2]|0;aB=c[b+6912>>2]|0;aC=c[b+39768>>2]|0;aD=c[b+39776>>2]|0;L7402:do{if((c[(d+204|0)>>2]|0)>0){aE=(b+1680|0)+72|0;aF=0;L7404:while(1){c[h>>2]=aF;aG=kc(aE,h)|0;a[j]=8;C=1701667182;a[j+1|0]=C;C=C>>8;a[(j+1|0)+1|0]=C;C=C>>8;a[(j+1|0)+2|0]=C;C=C>>8;a[(j+1|0)+3|0]=C;a[j+5|0]=0;aH=kp(aG,b+344|0,j)|0;aI=c[aH>>2]|0;if((aI|0)==0){aJ=tu(40)|0;do{if((aJ+16|0|0)!=0){if((a[j]&1)==0){c[(aJ+16|0)>>2]=c[j>>2];c[(aJ+16|0)+4>>2]=c[j+4>>2];c[(aJ+16|0)+8>>2]=c[j+8>>2];break}aK=c[(j+8|0)>>2]|0;aL=c[(j+4|0)>>2]|0;if(aL>>>0>4294967279>>>0){aC=6998;break L7404}if(aL>>>0<11>>>0){a[aJ+16|0]=aL<<1;aM=aJ+17|0}else{aN=tu(aL+16&-16)|0;c[aJ+24>>2]=aN;c[(aJ+16|0)>>2]=aL+16&-16|1;c[aJ+20>>2]=aL;aM=aN}tH(aM|0,aK|0,aL)|0;a[aM+aL|0]=0}}while(0);if((aJ+28|0|0)!=0){tI(aJ+28|0|0,0,12)|0}aL=c[(b+344|0)>>2]|0;c[aJ>>2]=0;c[aJ+4>>2]=0;c[aJ+8>>2]=aL;c[aH>>2]=aJ;aL=c[c[(aG|0)>>2]>>2]|0;if((aL|0)==0){aO=aJ}else{c[(aG|0)>>2]=aL;aO=c[aH>>2]|0}jV(c[aG+4>>2]|0,aO);c[(aG+8|0)>>2]=(c[(aG+8|0)>>2]|0)+1;aP=aJ}else{aP=aI}aL=aP+28|0;if((a[aL]&1)==0){c[g>>2]=c[aL>>2];c[g+4>>2]=c[aL+4>>2];c[g+8>>2]=c[aL+8>>2]}else{aL=c[aP+36>>2]|0;aK=c[aP+32>>2]|0;if(aK>>>0>4294967279>>>0){aC=7017;break}if(aK>>>0<11>>>0){a[g]=aK<<1;aQ=g+1|0}else{aN=tu(aK+16&-16)|0;c[(g+8|0)>>2]=aN;c[(g|0)>>2]=aK+16&-16|1;c[(g+4|0)>>2]=aK;aQ=aN}tH(aQ|0,aL|0,aK)|0;a[aQ+aK|0]=0}aK=(c[(d+32|0)>>2]|0)+(aF*52|0)+16|0;if((aK|0)==0){hC(19,0,49832,(aD=i,i=i+1|0,i=i+7&-8,c[aD>>2]=0,aD)|0);i=aD}else{c[aK>>2]=cj(((a[g]&1)==0?g+1|0:c[(g+8|0)>>2]|0)|0)|0}if((a[g]&1)!=0){tw(c[(g+8|0)>>2]|0)}if((a[j]&1)!=0){tw(c[(j+8|0)>>2]|0)}c[l>>2]=aF;aK=kc(aE,l)|0;aL=tu(16)|0;c[(m+8|0)>>2]=aL;c[(m|0)>>2]=17;c[(m+4|0)>>2]=14;tH(aL|0,30344,14)|0;a[aL+14|0]=0;aL=kp(aK,b+336|0,m)|0;aN=c[aL>>2]|0;if((aN|0)==0){aR=tu(40)|0;do{if((aR+16|0|0)!=0){if((a[m]&1)==0){c[(aR+16|0)>>2]=c[m>>2];c[(aR+16|0)+4>>2]=c[m+4>>2];c[(aR+16|0)+8>>2]=c[m+8>>2];break}aS=c[(m+8|0)>>2]|0;aT=c[(m+4|0)>>2]|0;if(aT>>>0>4294967279>>>0){aC=7039;break L7404}if(aT>>>0<11>>>0){a[aR+16|0]=aT<<1;aU=aR+17|0}else{aV=tu(aT+16&-16)|0;c[aR+24>>2]=aV;c[(aR+16|0)>>2]=aT+16&-16|1;c[aR+20>>2]=aT;aU=aV}tH(aU|0,aS|0,aT)|0;a[aU+aT|0]=0}}while(0);if((aR+28|0|0)!=0){tI(aR+28|0|0,0,12)|0}aI=c[(b+336|0)>>2]|0;c[aR>>2]=0;c[aR+4>>2]=0;c[aR+8>>2]=aI;c[aL>>2]=aR;aI=c[c[(aK|0)>>2]>>2]|0;if((aI|0)==0){aW=aR}else{c[(aK|0)>>2]=aI;aW=c[aL>>2]|0}jV(c[aK+4>>2]|0,aW);c[(aK+8|0)>>2]=(c[(aK+8|0)>>2]|0)+1;aX=aR}else{aX=aN}aI=aX+28|0;if((a[aI]&1)==0){c[k>>2]=c[aI>>2];c[k+4>>2]=c[aI+4>>2];c[k+8>>2]=c[aI+8>>2]}else{aI=c[aX+36>>2]|0;aJ=c[aX+32>>2]|0;if(aJ>>>0>4294967279>>>0){aC=7058;break}if(aJ>>>0<11>>>0){a[k]=aJ<<1;aY=k+1|0}else{aG=tu(aJ+16&-16)|0;c[(k+8|0)>>2]=aG;c[(k|0)>>2]=aJ+16&-16|1;c[(k+4|0)>>2]=aJ;aY=aG}tH(aY|0,aI|0,aJ)|0;a[aY+aJ|0]=0}kd(k,(c[(d+32|0)>>2]|0)+(aF*52|0)+12|0);if((a[k]&1)!=0){tw(c[(k+8|0)>>2]|0)}if((a[m]&1)!=0){tw(c[(m+8|0)>>2]|0)}c[o>>2]=aF;aJ=kc(aE,o)|0;aI=tu(16)|0;c[(p+8|0)>>2]=aI;c[(p|0)>>2]=17;c[(p+4|0)>>2]=11;tH(aI|0,3e4,11)|0;a[aI+11|0]=0;aI=kp(aJ,b+328|0,p)|0;aG=c[aI>>2]|0;if((aG|0)==0){aH=tu(40)|0;do{if((aH+16|0|0)!=0){if((a[p]&1)==0){c[(aH+16|0)>>2]=c[p>>2];c[(aH+16|0)+4>>2]=c[p+4>>2];c[(aH+16|0)+8>>2]=c[p+8>>2];break}aT=c[(p+8|0)>>2]|0;aS=c[(p+4|0)>>2]|0;if(aS>>>0>4294967279>>>0){aC=7077;break L7404}if(aS>>>0<11>>>0){a[aH+16|0]=aS<<1;aZ=aH+17|0}else{aV=tu(aS+16&-16)|0;c[aH+24>>2]=aV;c[(aH+16|0)>>2]=aS+16&-16|1;c[aH+20>>2]=aS;aZ=aV}tH(aZ|0,aT|0,aS)|0;a[aZ+aS|0]=0}}while(0);if((aH+28|0|0)!=0){tI(aH+28|0|0,0,12)|0}aN=c[(b+328|0)>>2]|0;c[aH>>2]=0;c[aH+4>>2]=0;c[aH+8>>2]=aN;c[aI>>2]=aH;aN=c[c[(aJ|0)>>2]>>2]|0;if((aN|0)==0){a_=aH}else{c[(aJ|0)>>2]=aN;a_=c[aI>>2]|0}jV(c[aJ+4>>2]|0,a_);c[(aJ+8|0)>>2]=(c[(aJ+8|0)>>2]|0)+1;a$=aH}else{a$=aG}aN=a$+28|0;if((a[aN]&1)==0){c[n>>2]=c[aN>>2];c[n+4>>2]=c[aN+4>>2];c[n+8>>2]=c[aN+8>>2]}else{aN=c[a$+36>>2]|0;aR=c[a$+32>>2]|0;if(aR>>>0>4294967279>>>0){aC=7096;break}if(aR>>>0<11>>>0){a[n]=aR<<1;a0=n+1|0}else{aK=tu(aR+16&-16)|0;c[(n+8|0)>>2]=aK;c[(n|0)>>2]=aR+16&-16|1;c[(n+4|0)>>2]=aR;a0=aK}tH(a0|0,aN|0,aR)|0;a[a0+aR|0]=0}aR=(c[(d+32|0)>>2]|0)+(aF*52|0)+20|0;if((aR|0)==0){hC(19,0,49832,(aD=i,i=i+1|0,i=i+7&-8,c[aD>>2]=0,aD)|0);i=aD}else{c[aR>>2]=cj(((a[n]&1)==0?n+1|0:c[(n+8|0)>>2]|0)|0)|0}if((a[n]&1)!=0){tw(c[(n+8|0)>>2]|0)}if((a[p]&1)!=0){tw(c[(p+8|0)>>2]|0)}c[r>>2]=aF;aR=kc(aE,r)|0;a[s]=16;C=1701603686;a[s+1|0|0]=C;C=C>>8;a[(s+1|0|0)+1|0]=C;C=C>>8;a[(s+1|0|0)+2|0]=C;C=C>>8;a[(s+1|0|0)+3|0]=C;C=1701667150;a[(s+1|0)+4|0]=C;C=C>>8;a[((s+1|0)+4|0)+1|0]=C;C=C>>8;a[((s+1|0)+4|0)+2|0]=C;C=C>>8;a[((s+1|0)+4|0)+3|0]=C;a[s+9|0]=0;aN=kp(aR,b+320|0,s)|0;aK=c[aN>>2]|0;if((aK|0)==0){aL=tu(40)|0;do{if((aL+16|0|0)!=0){if((a[s]&1)==0){c[(aL+16|0)>>2]=c[s>>2];c[(aL+16|0)+4>>2]=c[s+4>>2];c[(aL+16|0)+8>>2]=c[s+8>>2];break}aS=c[(s+8|0)>>2]|0;aT=c[(s+4|0)>>2]|0;if(aT>>>0>4294967279>>>0){aC=7117;break L7404}if(aT>>>0<11>>>0){a[aL+16|0]=aT<<1;a1=aL+17|0}else{aV=tu(aT+16&-16)|0;c[aL+24>>2]=aV;c[(aL+16|0)>>2]=aT+16&-16|1;c[aL+20>>2]=aT;a1=aV}tH(a1|0,aS|0,aT)|0;a[a1+aT|0]=0}}while(0);if((aL+28|0|0)!=0){tI(aL+28|0|0,0,12)|0}aG=c[(b+320|0)>>2]|0;c[aL>>2]=0;c[aL+4>>2]=0;c[aL+8>>2]=aG;c[aN>>2]=aL;aG=c[c[(aR|0)>>2]>>2]|0;if((aG|0)==0){a2=aL}else{c[(aR|0)>>2]=aG;a2=c[aN>>2]|0}jV(c[aR+4>>2]|0,a2);c[(aR+8|0)>>2]=(c[(aR+8|0)>>2]|0)+1;a3=aL}else{a3=aK}aG=a3+28|0;if((a[aG]&1)==0){c[q>>2]=c[aG>>2];c[q+4>>2]=c[aG+4>>2];c[q+8>>2]=c[aG+8>>2]}else{aG=c[a3+36>>2]|0;aH=c[a3+32>>2]|0;if(aH>>>0>4294967279>>>0){aC=7136;break}if(aH>>>0<11>>>0){a[q]=aH<<1;a4=q+1|0}else{aJ=tu(aH+16&-16)|0;c[(q+8|0)>>2]=aJ;c[(q|0)>>2]=aH+16&-16|1;c[(q+4|0)>>2]=aH;a4=aJ}tH(a4|0,aG|0,aH)|0;a[a4+aH|0]=0}aH=(c[(d+32|0)>>2]|0)+(aF*52|0)+24|0;if((aH|0)==0){hC(19,0,49832,(aD=i,i=i+1|0,i=i+7&-8,c[aD>>2]=0,aD)|0);i=aD}else{c[aH>>2]=cj(((a[q]&1)==0?q+1|0:c[(q+8|0)>>2]|0)|0)|0}if((a[q]&1)!=0){tw(c[(q+8|0)>>2]|0)}if((a[s]&1)!=0){tw(c[(s+8|0)>>2]|0)}c[u>>2]=aF;aH=kc(aE,u)|0;a[v]=18;tH(v+1|0|0,28704,9)|0;a[v+10|0]=0;aG=kp(aH,b+312|0,v)|0;aJ=c[aG>>2]|0;if((aJ|0)==0){aI=tu(40)|0;do{if((aI+16|0|0)!=0){if((a[v]&1)==0){c[(aI+16|0)>>2]=c[v>>2];c[(aI+16|0)+4>>2]=c[v+4>>2];c[(aI+16|0)+8>>2]=c[v+8>>2];break}aT=c[(v+8|0)>>2]|0;aS=c[(v+4|0)>>2]|0;if(aS>>>0>4294967279>>>0){aC=7157;break L7404}if(aS>>>0<11>>>0){a[aI+16|0]=aS<<1;a5=aI+17|0}else{aV=tu(aS+16&-16)|0;c[aI+24>>2]=aV;c[(aI+16|0)>>2]=aS+16&-16|1;c[aI+20>>2]=aS;a5=aV}tH(a5|0,aT|0,aS)|0;a[a5+aS|0]=0}}while(0);if((aI+28|0|0)!=0){tI(aI+28|0|0,0,12)|0}aK=c[(b+312|0)>>2]|0;c[aI>>2]=0;c[aI+4>>2]=0;c[aI+8>>2]=aK;c[aG>>2]=aI;aK=c[c[(aH|0)>>2]>>2]|0;if((aK|0)==0){a6=aI}else{c[(aH|0)>>2]=aK;a6=c[aG>>2]|0}jV(c[aH+4>>2]|0,a6);c[(aH+8|0)>>2]=(c[(aH+8|0)>>2]|0)+1;a7=aI}else{a7=aJ}aK=a7+28|0;if((a[aK]&1)==0){c[t>>2]=c[aK>>2];c[t+4>>2]=c[aK+4>>2];c[t+8>>2]=c[aK+8>>2]}else{aK=c[a7+36>>2]|0;aL=c[a7+32>>2]|0;if(aL>>>0>4294967279>>>0){aC=7176;break}if(aL>>>0<11>>>0){a[t]=aL<<1;a8=t+1|0}else{aR=tu(aL+16&-16)|0;c[(t+8|0)>>2]=aR;c[(t|0)>>2]=aL+16&-16|1;c[(t+4|0)>>2]=aL;a8=aR}tH(a8|0,aK|0,aL)|0;a[a8+aL|0]=0}kb(t,(c[(d+32|0)>>2]|0)+(aF*52|0)+28|0,0);if((a[t]&1)!=0){tw(c[(t+8|0)>>2]|0)}if((a[v]&1)!=0){tw(c[(v+8|0)>>2]|0)}c[x>>2]=aF;aL=kc(aE,x)|0;aK=tu(16)|0;c[(y+8|0)>>2]=aK;c[(y|0)>>2]=17;c[(y+4|0)>>2]=11;tH(aK|0,28120,11)|0;a[aK+11|0]=0;aK=kp(aL,b+304|0,y)|0;aR=c[aK>>2]|0;if((aR|0)==0){aN=tu(40)|0;do{if((aN+16|0|0)!=0){if((a[y]&1)==0){c[(aN+16|0)>>2]=c[y>>2];c[(aN+16|0)+4>>2]=c[y+4>>2];c[(aN+16|0)+8>>2]=c[y+8>>2];break}aS=c[(y+8|0)>>2]|0;aT=c[(y+4|0)>>2]|0;if(aT>>>0>4294967279>>>0){aC=7195;break L7404}if(aT>>>0<11>>>0){a[aN+16|0]=aT<<1;a9=aN+17|0}else{aV=tu(aT+16&-16)|0;c[aN+24>>2]=aV;c[(aN+16|0)>>2]=aT+16&-16|1;c[aN+20>>2]=aT;a9=aV}tH(a9|0,aS|0,aT)|0;a[a9+aT|0]=0}}while(0);if((aN+28|0|0)!=0){tI(aN+28|0|0,0,12)|0}aJ=c[(b+304|0)>>2]|0;c[aN>>2]=0;c[aN+4>>2]=0;c[aN+8>>2]=aJ;c[aK>>2]=aN;aJ=c[c[(aL|0)>>2]>>2]|0;if((aJ|0)==0){ba=aN}else{c[(aL|0)>>2]=aJ;ba=c[aK>>2]|0}jV(c[aL+4>>2]|0,ba);c[(aL+8|0)>>2]=(c[(aL+8|0)>>2]|0)+1;bb=aN}else{bb=aR}aJ=bb+28|0;if((a[aJ]&1)==0){c[w>>2]=c[aJ>>2];c[w+4>>2]=c[aJ+4>>2];c[w+8>>2]=c[aJ+8>>2]}else{aJ=c[bb+36>>2]|0;aI=c[bb+32>>2]|0;if(aI>>>0>4294967279>>>0){aC=7214;break}if(aI>>>0<11>>>0){a[w]=aI<<1;bc=w+1|0}else{aH=tu(aI+16&-16)|0;c[(w+8|0)>>2]=aH;c[(w|0)>>2]=aI+16&-16|1;c[(w+4|0)>>2]=aI;bc=aH}tH(bc|0,aJ|0,aI)|0;a[bc+aI|0]=0}kb(w,(c[(d+32|0)>>2]|0)+(aF*52|0)+32|0,0);if((a[w]&1)!=0){tw(c[(w+8|0)>>2]|0)}if((a[y]&1)!=0){tw(c[(y+8|0)>>2]|0)}c[A>>2]=aF;aI=kc(aE,A)|0;a[B]=14;a[B+1|0]=a[27080]|0;a[(B+1|0)+1|0]=a[27081]|0;a[(B+1|0)+2|0]=a[27082]|0;a[(B+1|0)+3|0]=a[27083]|0;a[(B+1|0)+4|0]=a[27084]|0;a[(B+1|0)+5|0]=a[27085]|0;a[(B+1|0)+6|0]=a[27086]|0;a[B+8|0]=0;aJ=kp(aI,b+296|0,B)|0;aH=c[aJ>>2]|0;if((aH|0)==0){aG=tu(40)|0;do{if((aG+16|0|0)!=0){if((a[B]&1)==0){c[(aG+16|0)>>2]=c[B>>2];c[(aG+16|0)+4>>2]=c[B+4>>2];c[(aG+16|0)+8>>2]=c[B+8>>2];break}aT=c[(B+8|0)>>2]|0;aS=c[(B+4|0)>>2]|0;if(aS>>>0>4294967279>>>0){aC=7232;break L7404}if(aS>>>0<11>>>0){a[aG+16|0]=aS<<1;bd=aG+17|0}else{aV=tu(aS+16&-16)|0;c[aG+24>>2]=aV;c[(aG+16|0)>>2]=aS+16&-16|1;c[aG+20>>2]=aS;bd=aV}tH(bd|0,aT|0,aS)|0;a[bd+aS|0]=0}}while(0);if((aG+28|0|0)!=0){tI(aG+28|0|0,0,12)|0}aR=c[(b+296|0)>>2]|0;c[aG>>2]=0;c[aG+4>>2]=0;c[aG+8>>2]=aR;c[aJ>>2]=aG;aR=c[c[(aI|0)>>2]>>2]|0;if((aR|0)==0){be=aG}else{c[(aI|0)>>2]=aR;be=c[aJ>>2]|0}jV(c[aI+4>>2]|0,be);c[(aI+8|0)>>2]=(c[(aI+8|0)>>2]|0)+1;bf=aG}else{bf=aH}aR=bf+28|0;if((a[aR]&1)==0){c[z>>2]=c[aR>>2];c[z+4>>2]=c[aR+4>>2];c[z+8>>2]=c[aR+8>>2]}else{aR=c[bf+36>>2]|0;aN=c[bf+32>>2]|0;if(aN>>>0>4294967279>>>0){aC=7251;break}if(aN>>>0<11>>>0){a[z]=aN<<1;bg=z+1|0}else{aL=tu(aN+16&-16)|0;c[(z+8|0)>>2]=aL;c[(z|0)>>2]=aN+16&-16|1;c[(z+4|0)>>2]=aN;bg=aL}tH(bg|0,aR|0,aN)|0;a[bg+aN|0]=0}kb(z,(c[(d+32|0)>>2]|0)+(aF*52|0)+36|0,0);if((a[z]&1)!=0){tw(c[(z+8|0)>>2]|0)}if((a[B]&1)!=0){tw(c[(B+8|0)>>2]|0)}c[E>>2]=aF;aN=kc(aE,E)|0;a[F]=18;tH(F+1|0|0,26600,9)|0;a[F+10|0]=0;aR=kp(aN,b+288|0,F)|0;aL=c[aR>>2]|0;if((aL|0)==0){aK=tu(40)|0;do{if((aK+16|0|0)!=0){if((a[F]&1)==0){c[(aK+16|0)>>2]=c[F>>2];c[(aK+16|0)+4>>2]=c[F+4>>2];c[(aK+16|0)+8>>2]=c[F+8>>2];break}aS=c[(F+8|0)>>2]|0;aT=c[(F+4|0)>>2]|0;if(aT>>>0>4294967279>>>0){aC=7269;break L7404}if(aT>>>0<11>>>0){a[aK+16|0]=aT<<1;bh=aK+17|0}else{aV=tu(aT+16&-16)|0;c[aK+24>>2]=aV;c[(aK+16|0)>>2]=aT+16&-16|1;c[aK+20>>2]=aT;bh=aV}tH(bh|0,aS|0,aT)|0;a[bh+aT|0]=0}}while(0);if((aK+28|0|0)!=0){tI(aK+28|0|0,0,12)|0}aH=c[(b+288|0)>>2]|0;c[aK>>2]=0;c[aK+4>>2]=0;c[aK+8>>2]=aH;c[aR>>2]=aK;aH=c[c[(aN|0)>>2]>>2]|0;if((aH|0)==0){bi=aK}else{c[(aN|0)>>2]=aH;bi=c[aR>>2]|0}jV(c[aN+4>>2]|0,bi);c[(aN+8|0)>>2]=(c[(aN+8|0)>>2]|0)+1;bj=aK}else{bj=aL}aH=bj+28|0;if((a[aH]&1)==0){c[D>>2]=c[aH>>2];c[D+4>>2]=c[aH+4>>2];c[D+8>>2]=c[aH+8>>2]}else{aH=c[bj+36>>2]|0;aG=c[bj+32>>2]|0;if(aG>>>0>4294967279>>>0){aC=7288;break}if(aG>>>0<11>>>0){a[D]=aG<<1;bk=D+1|0}else{aI=tu(aG+16&-16)|0;c[(D+8|0)>>2]=aI;c[(D|0)>>2]=aG+16&-16|1;c[(D+4|0)>>2]=aG;bk=aI}tH(bk|0,aH|0,aG)|0;a[bk+aG|0]=0}kb(D,(c[(d+32|0)>>2]|0)+(aF*52|0)+40|0,0);if((a[D]&1)!=0){tw(c[(D+8|0)>>2]|0)}if((a[F]&1)!=0){tw(c[(F+8|0)>>2]|0)}c[H>>2]=aF;aG=kc(aE,H)|0;aH=tu(16)|0;c[(I+8|0)>>2]=aH;c[(I|0)>>2]=17;c[(I+4|0)>>2]=12;tH(aH|0,25696,12)|0;a[aH+12|0]=0;aH=kp(aG,b+280|0,I)|0;aI=c[aH>>2]|0;if((aI|0)==0){aJ=tu(40)|0;do{if((aJ+16|0|0)!=0){if((a[I]&1)==0){c[(aJ+16|0)>>2]=c[I>>2];c[(aJ+16|0)+4>>2]=c[I+4>>2];c[(aJ+16|0)+8>>2]=c[I+8>>2];break}aT=c[(I+8|0)>>2]|0;aS=c[(I+4|0)>>2]|0;if(aS>>>0>4294967279>>>0){aC=7307;break L7404}if(aS>>>0<11>>>0){a[aJ+16|0]=aS<<1;bl=aJ+17|0}else{aV=tu(aS+16&-16)|0;c[aJ+24>>2]=aV;c[(aJ+16|0)>>2]=aS+16&-16|1;c[aJ+20>>2]=aS;bl=aV}tH(bl|0,aT|0,aS)|0;a[bl+aS|0]=0}}while(0);if((aJ+28|0|0)!=0){tI(aJ+28|0|0,0,12)|0}aL=c[(b+280|0)>>2]|0;c[aJ>>2]=0;c[aJ+4>>2]=0;c[aJ+8>>2]=aL;c[aH>>2]=aJ;aL=c[c[(aG|0)>>2]>>2]|0;if((aL|0)==0){bm=aJ}else{c[(aG|0)>>2]=aL;bm=c[aH>>2]|0}jV(c[aG+4>>2]|0,bm);c[(aG+8|0)>>2]=(c[(aG+8|0)>>2]|0)+1;bn=aJ}else{bn=aI}aL=bn+28|0;if((a[aL]&1)==0){c[G>>2]=c[aL>>2];c[G+4>>2]=c[aL+4>>2];c[G+8>>2]=c[aL+8>>2]}else{aL=c[bn+36>>2]|0;aK=c[bn+32>>2]|0;if(aK>>>0>4294967279>>>0){aC=7326;break}if(aK>>>0<11>>>0){a[G]=aK<<1;bo=G+1|0}else{aN=tu(aK+16&-16)|0;c[(G+8|0)>>2]=aN;c[(G|0)>>2]=aK+16&-16|1;c[(G+4|0)>>2]=aK;bo=aN}tH(bo|0,aL|0,aK)|0;a[bo+aK|0]=0}kb(G,(c[(d+32|0)>>2]|0)+(aF*52|0)+44|0,0);if((a[G]&1)!=0){tw(c[(G+8|0)>>2]|0)}if((a[I]&1)!=0){tw(c[(I+8|0)>>2]|0)}tI(J|0,0,12)|0;c[L>>2]=aF;aK=kc(aE,L)|0;a[M]=10;a[M+1|0]=a[57280]|0;a[(M+1|0)+1|0]=a[57281]|0;a[(M+1|0)+2|0]=a[57282]|0;a[(M+1|0)+3|0]=a[57283]|0;a[(M+1|0)+4|0]=a[57284]|0;a[M+6|0]=0;aL=kp(aK,b+272|0,M)|0;aN=c[aL>>2]|0;if((aN|0)==0){aR=tu(40)|0;do{if((aR+16|0|0)!=0){if((a[M]&1)==0){c[(aR+16|0)>>2]=c[M>>2];c[(aR+16|0)+4>>2]=c[M+4>>2];c[(aR+16|0)+8>>2]=c[M+8>>2];break}aS=c[(M+8|0)>>2]|0;aT=c[(M+4|0)>>2]|0;if(aT>>>0>4294967279>>>0){aC=7344;break L7404}if(aT>>>0<11>>>0){a[aR+16|0]=aT<<1;bp=aR+17|0}else{aV=tu(aT+16&-16)|0;c[aR+24>>2]=aV;c[(aR+16|0)>>2]=aT+16&-16|1;c[aR+20>>2]=aT;bp=aV}tH(bp|0,aS|0,aT)|0;a[bp+aT|0]=0}}while(0);if((aR+28|0|0)!=0){tI(aR+28|0|0,0,12)|0}aI=c[(b+272|0)>>2]|0;c[aR>>2]=0;c[aR+4>>2]=0;c[aR+8>>2]=aI;c[aL>>2]=aR;aI=c[c[(aK|0)>>2]>>2]|0;if((aI|0)==0){bq=aR}else{c[(aK|0)>>2]=aI;bq=c[aL>>2]|0}jV(c[aK+4>>2]|0,bq);c[(aK+8|0)>>2]=(c[(aK+8|0)>>2]|0)+1;br=aR}else{br=aN}aI=br+28|0;if((a[aI]&1)==0){c[K>>2]=c[aI>>2];c[K+4>>2]=c[aI+4>>2];c[K+8>>2]=c[aI+8>>2]}else{aI=c[br+36>>2]|0;aJ=c[br+32>>2]|0;if(aJ>>>0>4294967279>>>0){aC=7363;break}if(aJ>>>0<11>>>0){a[K]=aJ<<1;bs=K+1|0}else{aG=tu(aJ+16&-16)|0;c[(K+8|0)>>2]=aG;c[(K|0)>>2]=aJ+16&-16|1;c[(K+4|0)>>2]=aJ;bs=aG}tH(bs|0,aI|0,aJ)|0;a[bs+aJ|0]=0}mp(J,K)|0;if((a[K]&1)!=0){tw(c[(K+8|0)>>2]|0)}if((a[M]&1)!=0){tw(c[(M+8|0)>>2]|0)}aJ=a[J]|0;aI=(aJ&255&1|0)==0?(aJ&255)>>>1:c[(J+4|0)>>2]|0;aG=tK(((aJ&1)==0?J+1|0:c[(J+8|0)>>2]|0)|0,57264,(aI>>>0>12>>>0?12:aI)|0)|0;if((aG|0)==0){bt=aI>>>0<12>>>0?-1:aI>>>0>12>>>0&1}else{bt=aG}c[(c[(d+32|0)>>2]|0)+(aF*52|0)>>2]=(bt|0)==0;aG=c[(d+32|0)>>2]|0;aI=c[aG+(aF*52|0)>>2]|0;hA(4,0,57e3,(aD=i,i=i+16|0,c[aD>>2]=c[aG+(aF*52|0)+16>>2],c[aD+8>>2]=aI,aD)|0);i=aD;aI=c[(d+32|0)>>2]|0;if((a[c[aI+(aF*52|0)+16>>2]|0]|0)==36){a[aI+(aF*52|0)+48|0]=1}c[O>>2]=aF;aI=kc(aE,O)|0;aG=tu(16)|0;c[(P+8|0)>>2]=aG;c[(P|0)>>2]=17;c[(P+4|0)>>2]=13;tH(aG|0,56368,13)|0;a[aG+13|0]=0;aG=kp(aI,b+264|0,P)|0;aJ=c[aG>>2]|0;if((aJ|0)==0){aH=tu(40)|0;do{if((aH+16|0|0)!=0){if((a[P]&1)==0){c[(aH+16|0)>>2]=c[P>>2];c[(aH+16|0)+4>>2]=c[P+4>>2];c[(aH+16|0)+8>>2]=c[P+8>>2];break}aT=c[(P+8|0)>>2]|0;aS=c[(P+4|0)>>2]|0;if(aS>>>0>4294967279>>>0){aC=7438;break L7404}if(aS>>>0<11>>>0){a[aH+16|0]=aS<<1;bu=aH+17|0}else{aV=tu(aS+16&-16)|0;c[aH+24>>2]=aV;c[(aH+16|0)>>2]=aS+16&-16|1;c[aH+20>>2]=aS;bu=aV}tH(bu|0,aT|0,aS)|0;a[bu+aS|0]=0}}while(0);if((aH+28|0|0)!=0){tI(aH+28|0|0,0,12)|0}aN=c[(b+264|0)>>2]|0;c[aH>>2]=0;c[aH+4>>2]=0;c[aH+8>>2]=aN;c[aG>>2]=aH;aN=c[c[(aI|0)>>2]>>2]|0;if((aN|0)==0){bv=aH}else{c[(aI|0)>>2]=aN;bv=c[aG>>2]|0}jV(c[aI+4>>2]|0,bv);c[(aI+8|0)>>2]=(c[(aI+8|0)>>2]|0)+1;bw=aH}else{bw=aJ}aN=bw+28|0;if((a[aN]&1)==0){c[N>>2]=c[aN>>2];c[N+4>>2]=c[aN+4>>2];c[N+8>>2]=c[aN+8>>2]}else{aN=c[bw+36>>2]|0;aR=c[bw+32>>2]|0;if(aR>>>0>4294967279>>>0){aC=7457;break}if(aR>>>0<11>>>0){a[N]=aR<<1;bx=N+1|0}else{aK=tu(aR+16&-16)|0;c[(N+8|0)>>2]=aK;c[(N|0)>>2]=aR+16&-16|1;c[(N+4|0)>>2]=aR;bx=aK}tH(bx|0,aN|0,aR)|0;a[bx+aR|0]=0}mp(J,N)|0;if((a[N]&1)!=0){tw(c[(N+8|0)>>2]|0)}if((a[P]&1)!=0){tw(c[(P+8|0)>>2]|0)}kl(b+1664|0,e|0,J);aR=c[(b+1664|0|0)>>2]|0;kl(b+1656|0,f|0,J);aN=c[(b+1656|0|0)>>2]|0;do{if((aR|0)==(aA|0)){if((aN|0)!=(aB|0)){c[(c[(d+32|0)>>2]|0)+(aF*52|0)+4>>2]=c[aN+28>>2];a[(c[(d+32|0)>>2]|0)+(aF*52|0)+8|0]=1;break}by=a[J]|0;bz=(by&255&1|0)==0?(by&255)>>>1:c[(J+4|0)>>2]|0;bA=c[(J+8|0)>>2]|0;if((tK(((by&1)==0?J+1|0:bA)|0,56320,(bz>>>0>4>>>0?4:bz)|0)|0)!=0){aC=7483;break L7404}if(!(bz>>>0>3>>>0&(bz>>>0>4>>>0^1))){aC=7483;break L7404}a[(c[(d+32|0)>>2]|0)+(aF*52|0)+8|0]=2}else{c[(c[(d+32|0)>>2]|0)+(aF*52|0)+4>>2]=c[aR+28>>2];a[(c[(d+32|0)>>2]|0)+(aF*52|0)+8|0]=0}}while(0);if((a[J]&1)!=0){tw(c[(J+8|0)>>2]|0)}aF=aF+1|0;if((aF|0)>=(c[(d+204|0)>>2]|0)){break L7402}}if((aC|0)==6998){ml(0)}else if((aC|0)==7017){ml(0)}else if((aC|0)==7039){ml(0)}else if((aC|0)==7058){ml(0)}else if((aC|0)==7077){ml(0)}else if((aC|0)==7096){ml(0)}else if((aC|0)==7117){ml(0)}else if((aC|0)==7136){ml(0)}else if((aC|0)==7157){ml(0)}else if((aC|0)==7176){ml(0)}else if((aC|0)==7195){ml(0)}else if((aC|0)==7214){ml(0)}else if((aC|0)==7232){ml(0)}else if((aC|0)==7251){ml(0)}else if((aC|0)==7269){ml(0)}else if((aC|0)==7288){ml(0)}else if((aC|0)==7307){ml(0)}else if((aC|0)==7326){ml(0)}else if((aC|0)==7344){ml(0)}else if((aC|0)==7363){ml(0)}else if((aC|0)==7438){ml(0)}else if((aC|0)==7457){ml(0)}else if((aC|0)==7483){tI(R|0,0,12)|0;if((bz+20|0)>>>0>4294967279>>>0){ml(0)}if((bz+20|0)>>>0<11>>>0){a[R]=40;bB=R+1|0;bC=bA}else{aF=tu(bz+36&-16)|0;c[R+8>>2]=aF;c[R>>2]=bz+36&-16|1;c[R+4>>2]=20;bB=aF;bC=c[(J+8|0)>>2]|0}tH(bB|0,55688,20)|0;a[bB+20|0]=0;mt(R,(by&1)==0?J+1|0:bC,bz)|0;tI(Q|0,0,12)|0;aF=a[R]|0;if((aF&255&1|0)==0){bD=(aF&255)>>>1}else{bD=c[R+4>>2]|0}if((aF&1)==0){bE=R+1|0}else{bE=c[R+8>>2]|0}if((bD+11|0)>>>0>4294967279>>>0){ml(0)}if(bD>>>0>4294967284>>>0){a[Q]=bD<<1;bF=Q+1|0}else{aF=bD+27&-16;aE=tu(aF)|0;c[Q+8>>2]=aE;c[Q>>2]=aF|1;c[Q+4>>2]=bD;bF=aE}tH(bF|0,bE|0,bD)|0;a[bF+bD|0]=0;mt(Q,55384,11)|0;if((a[R]&1)!=0){tw(c[R+8>>2]|0)}if((a[Q]&1)==0){bG=Q+1|0;hE(32800,(aD=i,i=i+8|0,c[aD>>2]=bG,aD)|0);i=aD}else{bG=c[Q+8>>2]|0;hE(32800,(aD=i,i=i+8|0,c[aD>>2]=bG,aD)|0);i=aD}}}}while(0);if((c[17800]|0)!=0){dd[c[3504]&511](4)}hA(4,1,54552,(aD=i,i=i+1|0,i=i+7&-8,c[aD>>2]=0,aD)|0);i=aD;L7958:do{if((c[(d+208|0)>>2]|0)>0){bG=(b+1680|0)+108|0;Q=0;L7960:while(1){c[T>>2]=Q;R=kc(bG,T)|0;a[U]=8;C=1701667182;a[U+1|0]=C;C=C>>8;a[(U+1|0)+1|0]=C;C=C>>8;a[(U+1|0)+2|0]=C;C=C>>8;a[(U+1|0)+3|0]=C;a[U+5|0]=0;bD=kp(R,b+256|0,U)|0;bF=c[bD>>2]|0;if((bF|0)==0){bE=tu(40)|0;do{if((bE+16|0|0)!=0){if((a[U]&1)==0){c[(bE+16|0)>>2]=c[U>>2];c[(bE+16|0)+4>>2]=c[U+4>>2];c[(bE+16|0)+8>>2]=c[U+8>>2];break}bz=c[(U+8|0)>>2]|0;bC=c[(U+4|0)>>2]|0;if(bC>>>0>4294967279>>>0){aC=7533;break L7960}if(bC>>>0<11>>>0){a[bE+16|0]=bC<<1;bH=bE+17|0}else{J=tu(bC+16&-16)|0;c[bE+24>>2]=J;c[(bE+16|0)>>2]=bC+16&-16|1;c[bE+20>>2]=bC;bH=J}tH(bH|0,bz|0,bC)|0;a[bH+bC|0]=0}}while(0);if((bE+28|0|0)!=0){tI(bE+28|0|0,0,12)|0}bC=c[(b+256|0)>>2]|0;c[bE>>2]=0;c[bE+4>>2]=0;c[bE+8>>2]=bC;c[bD>>2]=bE;bC=c[c[(R|0)>>2]>>2]|0;if((bC|0)==0){bI=bE}else{c[(R|0)>>2]=bC;bI=c[bD>>2]|0}jV(c[R+4>>2]|0,bI);c[(R+8|0)>>2]=(c[(R+8|0)>>2]|0)+1;bJ=bE}else{bJ=bF}bC=bJ+28|0;if((a[bC]&1)==0){c[S>>2]=c[bC>>2];c[S+4>>2]=c[bC+4>>2];c[S+8>>2]=c[bC+8>>2]}else{bC=c[bJ+36>>2]|0;bz=c[bJ+32>>2]|0;if(bz>>>0>4294967279>>>0){aC=7552;break}if(bz>>>0<11>>>0){a[S]=bz<<1;bK=S+1|0}else{J=tu(bz+16&-16)|0;c[(S+8|0)>>2]=J;c[(S|0)>>2]=bz+16&-16|1;c[(S+4|0)>>2]=bz;bK=J}tH(bK|0,bC|0,bz)|0;a[bK+bz|0]=0}bz=(c[(d+36|0)>>2]|0)+(Q*52|0)+16|0;if((bz|0)==0){hC(19,0,49832,(aD=i,i=i+1|0,i=i+7&-8,c[aD>>2]=0,aD)|0);i=aD}else{c[bz>>2]=cj(((a[S]&1)==0?S+1|0:c[(S+8|0)>>2]|0)|0)|0}if((a[S]&1)!=0){tw(c[(S+8|0)>>2]|0)}if((a[U]&1)!=0){tw(c[(U+8|0)>>2]|0)}c[W>>2]=Q;bz=kc(bG,W)|0;bC=tu(16)|0;c[(X+8|0)>>2]=bC;c[(X|0)>>2]=17;c[(X+4|0)>>2]=14;tH(bC|0,30344,14)|0;a[bC+14|0]=0;bC=kp(bz,b+248|0,X)|0;J=c[bC>>2]|0;if((J|0)==0){by=tu(40)|0;do{if((by+16|0|0)!=0){if((a[X]&1)==0){c[(by+16|0)>>2]=c[X>>2];c[(by+16|0)+4>>2]=c[X+4>>2];c[(by+16|0)+8>>2]=c[X+8>>2];break}bB=c[(X+8|0)>>2]|0;bA=c[(X+4|0)>>2]|0;if(bA>>>0>4294967279>>>0){aC=7574;break L7960}if(bA>>>0<11>>>0){a[by+16|0]=bA<<1;bL=by+17|0}else{P=tu(bA+16&-16)|0;c[by+24>>2]=P;c[(by+16|0)>>2]=bA+16&-16|1;c[by+20>>2]=bA;bL=P}tH(bL|0,bB|0,bA)|0;a[bL+bA|0]=0}}while(0);if((by+28|0|0)!=0){tI(by+28|0|0,0,12)|0}bF=c[(b+248|0)>>2]|0;c[by>>2]=0;c[by+4>>2]=0;c[by+8>>2]=bF;c[bC>>2]=by;bF=c[c[(bz|0)>>2]>>2]|0;if((bF|0)==0){bM=by}else{c[(bz|0)>>2]=bF;bM=c[bC>>2]|0}jV(c[bz+4>>2]|0,bM);c[(bz+8|0)>>2]=(c[(bz+8|0)>>2]|0)+1;bN=by}else{bN=J}bF=bN+28|0;if((a[bF]&1)==0){c[V>>2]=c[bF>>2];c[V+4>>2]=c[bF+4>>2];c[V+8>>2]=c[bF+8>>2]}else{bF=c[bN+36>>2]|0;bE=c[bN+32>>2]|0;if(bE>>>0>4294967279>>>0){aC=7593;break}if(bE>>>0<11>>>0){a[V]=bE<<1;bO=V+1|0}else{R=tu(bE+16&-16)|0;c[(V+8|0)>>2]=R;c[(V|0)>>2]=bE+16&-16|1;c[(V+4|0)>>2]=bE;bO=R}tH(bO|0,bF|0,bE)|0;a[bO+bE|0]=0}kd(V,(c[(d+36|0)>>2]|0)+(Q*52|0)+12|0);if((a[V]&1)!=0){tw(c[(V+8|0)>>2]|0)}if((a[X]&1)!=0){tw(c[(X+8|0)>>2]|0)}c[Z>>2]=Q;bE=kc(bG,Z)|0;bF=tu(16)|0;c[(_+8|0)>>2]=bF;c[(_|0)>>2]=17;c[(_+4|0)>>2]=11;tH(bF|0,3e4,11)|0;a[bF+11|0]=0;bF=kp(bE,b+240|0,_)|0;R=c[bF>>2]|0;if((R|0)==0){bD=tu(40)|0;do{if((bD+16|0|0)!=0){if((a[_]&1)==0){c[(bD+16|0)>>2]=c[_>>2];c[(bD+16|0)+4>>2]=c[_+4>>2];c[(bD+16|0)+8>>2]=c[_+8>>2];break}bA=c[(_+8|0)>>2]|0;bB=c[(_+4|0)>>2]|0;if(bB>>>0>4294967279>>>0){aC=7612;break L7960}if(bB>>>0<11>>>0){a[bD+16|0]=bB<<1;bP=bD+17|0}else{P=tu(bB+16&-16)|0;c[bD+24>>2]=P;c[(bD+16|0)>>2]=bB+16&-16|1;c[bD+20>>2]=bB;bP=P}tH(bP|0,bA|0,bB)|0;a[bP+bB|0]=0}}while(0);if((bD+28|0|0)!=0){tI(bD+28|0|0,0,12)|0}J=c[(b+240|0)>>2]|0;c[bD>>2]=0;c[bD+4>>2]=0;c[bD+8>>2]=J;c[bF>>2]=bD;J=c[c[(bE|0)>>2]>>2]|0;if((J|0)==0){bQ=bD}else{c[(bE|0)>>2]=J;bQ=c[bF>>2]|0}jV(c[bE+4>>2]|0,bQ);c[(bE+8|0)>>2]=(c[(bE+8|0)>>2]|0)+1;bR=bD}else{bR=R}J=bR+28|0;if((a[J]&1)==0){c[Y>>2]=c[J>>2];c[Y+4>>2]=c[J+4>>2];c[Y+8>>2]=c[J+8>>2]}else{J=c[bR+36>>2]|0;by=c[bR+32>>2]|0;if(by>>>0>4294967279>>>0){aC=7631;break}if(by>>>0<11>>>0){a[Y]=by<<1;bS=Y+1|0}else{bz=tu(by+16&-16)|0;c[(Y+8|0)>>2]=bz;c[(Y|0)>>2]=by+16&-16|1;c[(Y+4|0)>>2]=by;bS=bz}tH(bS|0,J|0,by)|0;a[bS+by|0]=0}by=(c[(d+36|0)>>2]|0)+(Q*52|0)+20|0;if((by|0)==0){hC(19,0,49832,(aD=i,i=i+1|0,i=i+7&-8,c[aD>>2]=0,aD)|0);i=aD}else{c[by>>2]=cj(((a[Y]&1)==0?Y+1|0:c[(Y+8|0)>>2]|0)|0)|0}if((a[Y]&1)!=0){tw(c[(Y+8|0)>>2]|0)}if((a[_]&1)!=0){tw(c[(_+8|0)>>2]|0)}c[aa>>2]=Q;by=kc(bG,aa)|0;a[ab]=16;C=1701603686;a[ab+1|0|0]=C;C=C>>8;a[(ab+1|0|0)+1|0]=C;C=C>>8;a[(ab+1|0|0)+2|0]=C;C=C>>8;a[(ab+1|0|0)+3|0]=C;C=1701667150;a[(ab+1|0)+4|0]=C;C=C>>8;a[((ab+1|0)+4|0)+1|0]=C;C=C>>8;a[((ab+1|0)+4|0)+2|0]=C;C=C>>8;a[((ab+1|0)+4|0)+3|0]=C;a[ab+9|0]=0;J=kp(by,b+232|0,ab)|0;bz=c[J>>2]|0;if((bz|0)==0){bC=tu(40)|0;do{if((bC+16|0|0)!=0){if((a[ab]&1)==0){c[(bC+16|0)>>2]=c[ab>>2];c[(bC+16|0)+4>>2]=c[ab+4>>2];c[(bC+16|0)+8>>2]=c[ab+8>>2];break}bB=c[(ab+8|0)>>2]|0;bA=c[(ab+4|0)>>2]|0;if(bA>>>0>4294967279>>>0){aC=7652;break L7960}if(bA>>>0<11>>>0){a[bC+16|0]=bA<<1;bT=bC+17|0}else{P=tu(bA+16&-16)|0;c[bC+24>>2]=P;c[(bC+16|0)>>2]=bA+16&-16|1;c[bC+20>>2]=bA;bT=P}tH(bT|0,bB|0,bA)|0;a[bT+bA|0]=0}}while(0);if((bC+28|0|0)!=0){tI(bC+28|0|0,0,12)|0}R=c[(b+232|0)>>2]|0;c[bC>>2]=0;c[bC+4>>2]=0;c[bC+8>>2]=R;c[J>>2]=bC;R=c[c[(by|0)>>2]>>2]|0;if((R|0)==0){bU=bC}else{c[(by|0)>>2]=R;bU=c[J>>2]|0}jV(c[by+4>>2]|0,bU);c[(by+8|0)>>2]=(c[(by+8|0)>>2]|0)+1;bV=bC}else{bV=bz}R=bV+28|0;if((a[R]&1)==0){c[$>>2]=c[R>>2];c[$+4>>2]=c[R+4>>2];c[$+8>>2]=c[R+8>>2]}else{R=c[bV+36>>2]|0;bD=c[bV+32>>2]|0;if(bD>>>0>4294967279>>>0){aC=7671;break}if(bD>>>0<11>>>0){a[$]=bD<<1;bW=$+1|0}else{bE=tu(bD+16&-16)|0;c[($+8|0)>>2]=bE;c[($|0)>>2]=bD+16&-16|1;c[($+4|0)>>2]=bD;bW=bE}tH(bW|0,R|0,bD)|0;a[bW+bD|0]=0}bD=(c[(d+36|0)>>2]|0)+(Q*52|0)+24|0;if((bD|0)==0){hC(19,0,49832,(aD=i,i=i+1|0,i=i+7&-8,c[aD>>2]=0,aD)|0);i=aD}else{c[bD>>2]=cj(((a[$]&1)==0?$+1|0:c[($+8|0)>>2]|0)|0)|0}if((a[$]&1)!=0){tw(c[($+8|0)>>2]|0)}if((a[ab]&1)!=0){tw(c[(ab+8|0)>>2]|0)}c[ad>>2]=Q;bD=kc(bG,ad)|0;a[ae]=18;tH(ae+1|0|0,28704,9)|0;a[ae+10|0]=0;R=kp(bD,b+224|0,ae)|0;bE=c[R>>2]|0;if((bE|0)==0){bF=tu(40)|0;do{if((bF+16|0|0)!=0){if((a[ae]&1)==0){c[(bF+16|0)>>2]=c[ae>>2];c[(bF+16|0)+4>>2]=c[ae+4>>2];c[(bF+16|0)+8>>2]=c[ae+8>>2];break}bA=c[(ae+8|0)>>2]|0;bB=c[(ae+4|0)>>2]|0;if(bB>>>0>4294967279>>>0){aC=7692;break L7960}if(bB>>>0<11>>>0){a[bF+16|0]=bB<<1;bX=bF+17|0}else{P=tu(bB+16&-16)|0;c[bF+24>>2]=P;c[(bF+16|0)>>2]=bB+16&-16|1;c[bF+20>>2]=bB;bX=P}tH(bX|0,bA|0,bB)|0;a[bX+bB|0]=0}}while(0);if((bF+28|0|0)!=0){tI(bF+28|0|0,0,12)|0}bz=c[(b+224|0)>>2]|0;c[bF>>2]=0;c[bF+4>>2]=0;c[bF+8>>2]=bz;c[R>>2]=bF;bz=c[c[(bD|0)>>2]>>2]|0;if((bz|0)==0){bY=bF}else{c[(bD|0)>>2]=bz;bY=c[R>>2]|0}jV(c[bD+4>>2]|0,bY);c[(bD+8|0)>>2]=(c[(bD+8|0)>>2]|0)+1;bZ=bF}else{bZ=bE}bz=bZ+28|0;if((a[bz]&1)==0){c[ac>>2]=c[bz>>2];c[ac+4>>2]=c[bz+4>>2];c[ac+8>>2]=c[bz+8>>2]}else{bz=c[bZ+36>>2]|0;bC=c[bZ+32>>2]|0;if(bC>>>0>4294967279>>>0){aC=7711;break}if(bC>>>0<11>>>0){a[ac]=bC<<1;b_=ac+1|0}else{by=tu(bC+16&-16)|0;c[(ac+8|0)>>2]=by;c[(ac|0)>>2]=bC+16&-16|1;c[(ac+4|0)>>2]=bC;b_=by}tH(b_|0,bz|0,bC)|0;a[b_+bC|0]=0}kb(ac,(c[(d+36|0)>>2]|0)+(Q*52|0)+28|0,0);if((a[ac]&1)!=0){tw(c[(ac+8|0)>>2]|0)}if((a[ae]&1)!=0){tw(c[(ae+8|0)>>2]|0)}c[ag>>2]=Q;bC=kc(bG,ag)|0;bz=tu(16)|0;c[(ah+8|0)>>2]=bz;c[(ah|0)>>2]=17;c[(ah+4|0)>>2]=11;tH(bz|0,28120,11)|0;a[bz+11|0]=0;bz=kp(bC,b+216|0,ah)|0;by=c[bz>>2]|0;if((by|0)==0){J=tu(40)|0;do{if((J+16|0|0)!=0){if((a[ah]&1)==0){c[(J+16|0)>>2]=c[ah>>2];c[(J+16|0)+4>>2]=c[ah+4>>2];c[(J+16|0)+8>>2]=c[ah+8>>2];break}bB=c[(ah+8|0)>>2]|0;bA=c[(ah+4|0)>>2]|0;if(bA>>>0>4294967279>>>0){aC=7730;break L7960}if(bA>>>0<11>>>0){a[J+16|0]=bA<<1;b$=J+17|0}else{P=tu(bA+16&-16)|0;c[J+24>>2]=P;c[(J+16|0)>>2]=bA+16&-16|1;c[J+20>>2]=bA;b$=P}tH(b$|0,bB|0,bA)|0;a[b$+bA|0]=0}}while(0);if((J+28|0|0)!=0){tI(J+28|0|0,0,12)|0}bE=c[(b+216|0)>>2]|0;c[J>>2]=0;c[J+4>>2]=0;c[J+8>>2]=bE;c[bz>>2]=J;bE=c[c[(bC|0)>>2]>>2]|0;if((bE|0)==0){b0=J}else{c[(bC|0)>>2]=bE;b0=c[bz>>2]|0}jV(c[bC+4>>2]|0,b0);c[(bC+8|0)>>2]=(c[(bC+8|0)>>2]|0)+1;b1=J}else{b1=by}bE=b1+28|0;if((a[bE]&1)==0){c[af>>2]=c[bE>>2];c[af+4>>2]=c[bE+4>>2];c[af+8>>2]=c[bE+8>>2]}else{bE=c[b1+36>>2]|0;bF=c[b1+32>>2]|0;if(bF>>>0>4294967279>>>0){aC=7749;break}if(bF>>>0<11>>>0){a[af]=bF<<1;b2=af+1|0}else{bD=tu(bF+16&-16)|0;c[(af+8|0)>>2]=bD;c[(af|0)>>2]=bF+16&-16|1;c[(af+4|0)>>2]=bF;b2=bD}tH(b2|0,bE|0,bF)|0;a[b2+bF|0]=0}kb(af,(c[(d+36|0)>>2]|0)+(Q*52|0)+32|0,0);if((a[af]&1)!=0){tw(c[(af+8|0)>>2]|0)}if((a[ah]&1)!=0){tw(c[(ah+8|0)>>2]|0)}c[aj>>2]=Q;bF=kc(bG,aj)|0;a[ak]=14;a[ak+1|0]=a[27080]|0;a[(ak+1|0)+1|0]=a[27081]|0;a[(ak+1|0)+2|0]=a[27082]|0;a[(ak+1|0)+3|0]=a[27083]|0;a[(ak+1|0)+4|0]=a[27084]|0;a[(ak+1|0)+5|0]=a[27085]|0;a[(ak+1|0)+6|0]=a[27086]|0;a[ak+8|0]=0;bE=kp(bF,b+208|0,ak)|0;bD=c[bE>>2]|0;if((bD|0)==0){R=tu(40)|0;do{if((R+16|0|0)!=0){if((a[ak]&1)==0){c[(R+16|0)>>2]=c[ak>>2];c[(R+16|0)+4>>2]=c[ak+4>>2];c[(R+16|0)+8>>2]=c[ak+8>>2];break}bA=c[(ak+8|0)>>2]|0;bB=c[(ak+4|0)>>2]|0;if(bB>>>0>4294967279>>>0){aC=7767;break L7960}if(bB>>>0<11>>>0){a[R+16|0]=bB<<1;b3=R+17|0}else{P=tu(bB+16&-16)|0;c[R+24>>2]=P;c[(R+16|0)>>2]=bB+16&-16|1;c[R+20>>2]=bB;b3=P}tH(b3|0,bA|0,bB)|0;a[b3+bB|0]=0}}while(0);if((R+28|0|0)!=0){tI(R+28|0|0,0,12)|0}by=c[(b+208|0)>>2]|0;c[R>>2]=0;c[R+4>>2]=0;c[R+8>>2]=by;c[bE>>2]=R;by=c[c[(bF|0)>>2]>>2]|0;if((by|0)==0){b4=R}else{c[(bF|0)>>2]=by;b4=c[bE>>2]|0}jV(c[bF+4>>2]|0,b4);c[(bF+8|0)>>2]=(c[(bF+8|0)>>2]|0)+1;b5=R}else{b5=bD}by=b5+28|0;if((a[by]&1)==0){c[ai>>2]=c[by>>2];c[ai+4>>2]=c[by+4>>2];c[ai+8>>2]=c[by+8>>2]}else{by=c[b5+36>>2]|0;J=c[b5+32>>2]|0;if(J>>>0>4294967279>>>0){aC=7786;break}if(J>>>0<11>>>0){a[ai]=J<<1;b6=ai+1|0}else{bC=tu(J+16&-16)|0;c[(ai+8|0)>>2]=bC;c[(ai|0)>>2]=J+16&-16|1;c[(ai+4|0)>>2]=J;b6=bC}tH(b6|0,by|0,J)|0;a[b6+J|0]=0}kb(ai,(c[(d+36|0)>>2]|0)+(Q*52|0)+36|0,0);if((a[ai]&1)!=0){tw(c[(ai+8|0)>>2]|0)}if((a[ak]&1)!=0){tw(c[(ak+8|0)>>2]|0)}c[am>>2]=Q;J=kc(bG,am)|0;a[an]=18;tH(an+1|0|0,26600,9)|0;a[an+10|0]=0;by=kp(J,b+200|0,an)|0;bC=c[by>>2]|0;if((bC|0)==0){bz=tu(40)|0;do{if((bz+16|0|0)!=0){if((a[an]&1)==0){c[(bz+16|0)>>2]=c[an>>2];c[(bz+16|0)+4>>2]=c[an+4>>2];c[(bz+16|0)+8>>2]=c[an+8>>2];break}bB=c[(an+8|0)>>2]|0;bA=c[(an+4|0)>>2]|0;if(bA>>>0>4294967279>>>0){aC=7804;break L7960}if(bA>>>0<11>>>0){a[bz+16|0]=bA<<1;b7=bz+17|0}else{P=tu(bA+16&-16)|0;c[bz+24>>2]=P;c[(bz+16|0)>>2]=bA+16&-16|1;c[bz+20>>2]=bA;b7=P}tH(b7|0,bB|0,bA)|0;a[b7+bA|0]=0}}while(0);if((bz+28|0|0)!=0){tI(bz+28|0|0,0,12)|0}bD=c[(b+200|0)>>2]|0;c[bz>>2]=0;c[bz+4>>2]=0;c[bz+8>>2]=bD;c[by>>2]=bz;bD=c[c[(J|0)>>2]>>2]|0;if((bD|0)==0){b8=bz}else{c[(J|0)>>2]=bD;b8=c[by>>2]|0}jV(c[J+4>>2]|0,b8);c[(J+8|0)>>2]=(c[(J+8|0)>>2]|0)+1;b9=bz}else{b9=bC}bD=b9+28|0;if((a[bD]&1)==0){c[al>>2]=c[bD>>2];c[al+4>>2]=c[bD+4>>2];c[al+8>>2]=c[bD+8>>2]}else{bD=c[b9+36>>2]|0;R=c[b9+32>>2]|0;if(R>>>0>4294967279>>>0){aC=7823;break}if(R>>>0<11>>>0){a[al]=R<<1;ca=al+1|0}else{bF=tu(R+16&-16)|0;c[(al+8|0)>>2]=bF;c[(al|0)>>2]=R+16&-16|1;c[(al+4|0)>>2]=R;ca=bF}tH(ca|0,bD|0,R)|0;a[ca+R|0]=0}kb(al,(c[(d+36|0)>>2]|0)+(Q*52|0)+40|0,0);if((a[al]&1)!=0){tw(c[(al+8|0)>>2]|0)}if((a[an]&1)!=0){tw(c[(an+8|0)>>2]|0)}c[ap>>2]=Q;R=kc(bG,ap)|0;bD=tu(16)|0;c[(aq+8|0)>>2]=bD;c[(aq|0)>>2]=17;c[(aq+4|0)>>2]=12;tH(bD|0,25696,12)|0;a[bD+12|0]=0;bD=kp(R,b+192|0,aq)|0;bF=c[bD>>2]|0;if((bF|0)==0){bE=tu(40)|0;do{if((bE+16|0|0)!=0){if((a[aq]&1)==0){c[(bE+16|0)>>2]=c[aq>>2];c[(bE+16|0)+4>>2]=c[aq+4>>2];c[(bE+16|0)+8>>2]=c[aq+8>>2];break}bA=c[(aq+8|0)>>2]|0;bB=c[(aq+4|0)>>2]|0;if(bB>>>0>4294967279>>>0){aC=7842;break L7960}if(bB>>>0<11>>>0){a[bE+16|0]=bB<<1;cb=bE+17|0}else{P=tu(bB+16&-16)|0;c[bE+24>>2]=P;c[(bE+16|0)>>2]=bB+16&-16|1;c[bE+20>>2]=bB;cb=P}tH(cb|0,bA|0,bB)|0;a[cb+bB|0]=0}}while(0);if((bE+28|0|0)!=0){tI(bE+28|0|0,0,12)|0}bC=c[(b+192|0)>>2]|0;c[bE>>2]=0;c[bE+4>>2]=0;c[bE+8>>2]=bC;c[bD>>2]=bE;bC=c[c[(R|0)>>2]>>2]|0;if((bC|0)==0){cc=bE}else{c[(R|0)>>2]=bC;cc=c[bD>>2]|0}jV(c[R+4>>2]|0,cc);c[(R+8|0)>>2]=(c[(R+8|0)>>2]|0)+1;cd=bE}else{cd=bF}bC=cd+28|0;if((a[bC]&1)==0){c[ao>>2]=c[bC>>2];c[ao+4>>2]=c[bC+4>>2];c[ao+8>>2]=c[bC+8>>2]}else{bC=c[cd+36>>2]|0;bz=c[cd+32>>2]|0;if(bz>>>0>4294967279>>>0){aC=7861;break}if(bz>>>0<11>>>0){a[ao]=bz<<1;ce=ao+1|0}else{J=tu(bz+16&-16)|0;c[(ao+8|0)>>2]=J;c[(ao|0)>>2]=bz+16&-16|1;c[(ao+4|0)>>2]=bz;ce=J}tH(ce|0,bC|0,bz)|0;a[ce+bz|0]=0}kb(ao,(c[(d+36|0)>>2]|0)+(Q*52|0)+44|0,0);if((a[ao]&1)!=0){tw(c[(ao+8|0)>>2]|0)}if((a[aq]&1)!=0){tw(c[(aq+8|0)>>2]|0)}tI(ar|0,0,12)|0;c[at>>2]=Q;bz=kc(bG,at)|0;a[au]=10;a[au+1|0]=a[57280]|0;a[(au+1|0)+1|0]=a[57281]|0;a[(au+1|0)+2|0]=a[57282]|0;a[(au+1|0)+3|0]=a[57283]|0;a[(au+1|0)+4|0]=a[57284]|0;a[au+6|0]=0;bC=kp(bz,b+184|0,au)|0;J=c[bC>>2]|0;if((J|0)==0){by=tu(40)|0;do{if((by+16|0|0)!=0){if((a[au]&1)==0){c[(by+16|0)>>2]=c[au>>2];c[(by+16|0)+4>>2]=c[au+4>>2];c[(by+16|0)+8>>2]=c[au+8>>2];break}bB=c[(au+8|0)>>2]|0;bA=c[(au+4|0)>>2]|0;if(bA>>>0>4294967279>>>0){aC=7879;break L7960}if(bA>>>0<11>>>0){a[by+16|0]=bA<<1;cf=by+17|0}else{P=tu(bA+16&-16)|0;c[by+24>>2]=P;c[(by+16|0)>>2]=bA+16&-16|1;c[by+20>>2]=bA;cf=P}tH(cf|0,bB|0,bA)|0;a[cf+bA|0]=0}}while(0);if((by+28|0|0)!=0){tI(by+28|0|0,0,12)|0}bF=c[(b+184|0)>>2]|0;c[by>>2]=0;c[by+4>>2]=0;c[by+8>>2]=bF;c[bC>>2]=by;bF=c[c[(bz|0)>>2]>>2]|0;if((bF|0)==0){cg=by}else{c[(bz|0)>>2]=bF;cg=c[bC>>2]|0}jV(c[bz+4>>2]|0,cg);c[(bz+8|0)>>2]=(c[(bz+8|0)>>2]|0)+1;ch=by}else{ch=J}bF=ch+28|0;if((a[bF]&1)==0){c[as>>2]=c[bF>>2];c[as+4>>2]=c[bF+4>>2];c[as+8>>2]=c[bF+8>>2]}else{bF=c[ch+36>>2]|0;bE=c[ch+32>>2]|0;if(bE>>>0>4294967279>>>0){aC=7898;break}if(bE>>>0<11>>>0){a[as]=bE<<1;ci=as+1|0}else{R=tu(bE+16&-16)|0;c[(as+8|0)>>2]=R;c[(as|0)>>2]=bE+16&-16|1;c[(as+4|0)>>2]=bE;ci=R}tH(ci|0,bF|0,bE)|0;a[ci+bE|0]=0}mp(ar,as)|0;if((a[as]&1)!=0){tw(c[(as+8|0)>>2]|0)}if((a[au]&1)!=0){tw(c[(au+8|0)>>2]|0)}bE=a[ar]|0;bF=(bE&255&1|0)==0?(bE&255)>>>1:c[(ar+4|0)>>2]|0;R=tK(((bE&1)==0?ar+1|0:c[(ar+8|0)>>2]|0)|0,57264,(bF>>>0>12>>>0?12:bF)|0)|0;if((R|0)==0){ck=bF>>>0<12>>>0?-1:bF>>>0>12>>>0&1}else{ck=R}c[(c[(d+36|0)>>2]|0)+(Q*52|0)>>2]=(ck|0)==0;R=c[(d+36|0)>>2]|0;bF=c[R+(Q*52|0)>>2]|0;hA(4,0,57e3,(aD=i,i=i+16|0,c[aD>>2]=c[R+(Q*52|0)+16>>2],c[aD+8>>2]=bF,aD)|0);i=aD;bF=c[(d+36|0)>>2]|0;if((a[c[bF+(Q*52|0)+16>>2]|0]|0)==36){a[bF+(Q*52|0)+48|0]=1}c[aw>>2]=Q;bF=kc(bG,aw)|0;R=tu(16)|0;c[(ax+8|0)>>2]=R;c[(ax|0)>>2]=17;c[(ax+4|0)>>2]=13;tH(R|0,56368,13)|0;a[R+13|0]=0;R=kp(bF,b+176|0,ax)|0;bE=c[R>>2]|0;if((bE|0)==0){bD=tu(40)|0;do{if((bD+16|0|0)!=0){if((a[ax]&1)==0){c[(bD+16|0)>>2]=c[ax>>2];c[(bD+16|0)+4>>2]=c[ax+4>>2];c[(bD+16|0)+8>>2]=c[ax+8>>2];break}bA=c[(ax+8|0)>>2]|0;bB=c[(ax+4|0)>>2]|0;if(bB>>>0>4294967279>>>0){aC=7973;break L7960}if(bB>>>0<11>>>0){a[bD+16|0]=bB<<1;cl=bD+17|0}else{P=tu(bB+16&-16)|0;c[bD+24>>2]=P;c[(bD+16|0)>>2]=bB+16&-16|1;c[bD+20>>2]=bB;cl=P}tH(cl|0,bA|0,bB)|0;a[cl+bB|0]=0}}while(0);if((bD+28|0|0)!=0){tI(bD+28|0|0,0,12)|0}J=c[(b+176|0)>>2]|0;c[bD>>2]=0;c[bD+4>>2]=0;c[bD+8>>2]=J;c[R>>2]=bD;J=c[c[(bF|0)>>2]>>2]|0;if((J|0)==0){cm=bD}else{c[(bF|0)>>2]=J;cm=c[R>>2]|0}jV(c[bF+4>>2]|0,cm);c[(bF+8|0)>>2]=(c[(bF+8|0)>>2]|0)+1;cn=bD}else{cn=bE}J=cn+28|0;if((a[J]&1)==0){c[av>>2]=c[J>>2];c[av+4>>2]=c[J+4>>2];c[av+8>>2]=c[J+8>>2]}else{J=c[cn+36>>2]|0;by=c[cn+32>>2]|0;if(by>>>0>4294967279>>>0){aC=7992;break}if(by>>>0<11>>>0){a[av]=by<<1;co=av+1|0}else{bz=tu(by+16&-16)|0;c[(av+8|0)>>2]=bz;c[(av|0)>>2]=by+16&-16|1;c[(av+4|0)>>2]=by;co=bz}tH(co|0,J|0,by)|0;a[co+by|0]=0}mp(ar,av)|0;if((a[av]&1)!=0){tw(c[(av+8|0)>>2]|0)}if((a[ax]&1)!=0){tw(c[(ax+8|0)>>2]|0)}kl(b+1648|0,e|0,ar);by=c[(b+1648|0|0)>>2]|0;kl(b+1640|0,f|0,ar);J=c[(b+1640|0|0)>>2]|0;if((by|0)==(aA|0)){if((J|0)==(aB|0)){aC=8015;break}c[(c[(d+36|0)>>2]|0)+(Q*52|0)+4>>2]=c[J+28>>2];a[(c[(d+36|0)>>2]|0)+(Q*52|0)+8|0]=1}else{c[(c[(d+36|0)>>2]|0)+(Q*52|0)+4>>2]=c[by+28>>2];a[(c[(d+36|0)>>2]|0)+(Q*52|0)+8|0]=0}if((a[ar]&1)!=0){tw(c[(ar+8|0)>>2]|0)}Q=Q+1|0;if((Q|0)>=(c[(d+208|0)>>2]|0)){break L7958}}if((aC|0)==7533){ml(0)}else if((aC|0)==7552){ml(0)}else if((aC|0)==7574){ml(0)}else if((aC|0)==7593){ml(0)}else if((aC|0)==7612){ml(0)}else if((aC|0)==7631){ml(0)}else if((aC|0)==7652){ml(0)}else if((aC|0)==7671){ml(0)}else if((aC|0)==7692){ml(0)}else if((aC|0)==7711){ml(0)}else if((aC|0)==7730){ml(0)}else if((aC|0)==7749){ml(0)}else if((aC|0)==7767){ml(0)}else if((aC|0)==7786){ml(0)}else if((aC|0)==7804){ml(0)}else if((aC|0)==7823){ml(0)}else if((aC|0)==7842){ml(0)}else if((aC|0)==7861){ml(0)}else if((aC|0)==7879){ml(0)}else if((aC|0)==7898){ml(0)}else if((aC|0)==7973){ml(0)}else if((aC|0)==7992){ml(0)}else if((aC|0)==8015){tI(az|0,0,12)|0;Q=a[ar]|0;bG=(Q&255&1|0)==0?(Q&255)>>>1:c[(ar+4|0)>>2]|0;if((bG+23|0)>>>0>4294967279>>>0){ml(0)}if((bG+23|0)>>>0<11>>>0){a[az]=46;cp=az+1|0}else{by=tu(bG+39&-16)|0;c[az+8>>2]=by;c[az>>2]=bG+39&-16|1;c[az+4>>2]=23;cp=by}tH(cp|0,54488,23)|0;a[cp+23|0]=0;mt(az,(Q&1)==0?ar+1|0:c[(ar+8|0)>>2]|0,bG)|0;tI(ay|0,0,12)|0;bG=a[az]|0;if((bG&255&1|0)==0){cq=(bG&255)>>>1}else{cq=c[az+4>>2]|0}if((bG&1)==0){cr=az+1|0}else{cr=c[az+8>>2]|0}if((cq+11|0)>>>0>4294967279>>>0){ml(0)}if(cq>>>0>4294967284>>>0){a[ay]=cq<<1;cs=ay+1|0}else{bG=cq+27&-16;Q=tu(bG)|0;c[ay+8>>2]=Q;c[ay>>2]=bG|1;c[ay+4>>2]=cq;cs=Q}tH(cs|0,cr|0,cq)|0;a[cs+cq|0]=0;mt(ay,55384,11)|0;if((a[az]&1)!=0){tw(c[az+8>>2]|0)}if((a[ay]&1)==0){ct=ay+1|0;hE(32800,(aD=i,i=i+8|0,c[aD>>2]=ct,aD)|0);i=aD}else{ct=c[ay+8>>2]|0;hE(32800,(aD=i,i=i+8|0,c[aD>>2]=ct,aD)|0);i=aD}}}}while(0);if((c[17800]|0)!=0){dd[c[3504]&511](4)}hA(4,1,53080,(aD=i,i=i+1|0,i=i+7&-8,c[aD>>2]=0,aD)|0);i=aD;c[b+39768>>2]=aC;c[b+39776>>2]=aD}function _read_input_xml$2(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0,bP=0,bQ=0,bR=0,bS=0,bT=0,bU=0,bV=0,bW=0,bX=0,bY=0,bZ=0,b_=0,b$=0,b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,b7=0,b8=0,b9=0,ca=0,cb=0,cc=0,cd=0,ce=0,cf=0,cg=0,ch=0,ci=0,ck=0,cl=0,cm=0,cn=0,co=0,cp=0,cq=0,cr=0,cs=0,ct=0;d=c[b+1904>>2]|0;e=c[b+1936>>2]|0;f=c[b+5160>>2]|0;g=c[b+5168>>2]|0;h=c[b+5176>>2]|0;j=c[b+5184>>2]|0;k=c[b+5192>>2]|0;l=c[b+5200>>2]|0;m=c[b+5208>>2]|0;n=c[b+5216>>2]|0;o=c[b+5224>>2]|0;p=c[b+5232>>2]|0;q=c[b+5240>>2]|0;r=c[b+5248>>2]|0;s=c[b+5256>>2]|0;t=c[b+5264>>2]|0;u=c[b+5272>>2]|0;v=c[b+5280>>2]|0;w=c[b+5288>>2]|0;x=c[b+5296>>2]|0;y=c[b+5304>>2]|0;z=c[b+5312>>2]|0;A=c[b+5320>>2]|0;B=c[b+5328>>2]|0;D=c[b+5336>>2]|0;E=c[b+5344>>2]|0;F=c[b+5352>>2]|0;G=c[b+5360>>2]|0;H=c[b+5368>>2]|0;I=c[b+5376>>2]|0;J=c[b+5384>>2]|0;K=c[b+5392>>2]|0;L=c[b+5400>>2]|0;M=c[b+5408>>2]|0;N=c[b+5416>>2]|0;O=c[b+5424>>2]|0;P=c[b+5432>>2]|0;Q=c[b+5440>>2]|0;R=c[b+5448>>2]|0;S=c[b+5456>>2]|0;T=c[b+5464>>2]|0;U=c[b+5472>>2]|0;V=c[b+5480>>2]|0;W=c[b+5488>>2]|0;X=c[b+5496>>2]|0;Y=c[b+5504>>2]|0;Z=c[b+5512>>2]|0;_=c[b+5520>>2]|0;$=c[b+5528>>2]|0;aa=c[b+5536>>2]|0;ab=c[b+5544>>2]|0;ac=c[b+5552>>2]|0;ad=c[b+5560>>2]|0;ae=c[b+5568>>2]|0;af=c[b+5576>>2]|0;ag=c[b+5584>>2]|0;ah=c[b+5592>>2]|0;ai=c[b+5600>>2]|0;aj=c[b+5608>>2]|0;ak=c[b+5616>>2]|0;al=c[b+5624>>2]|0;am=c[b+5632>>2]|0;an=c[b+5640>>2]|0;ao=c[b+5648>>2]|0;ap=c[b+5656>>2]|0;aq=c[b+5664>>2]|0;ar=c[b+5672>>2]|0;as=c[b+5680>>2]|0;at=c[b+5688>>2]|0;au=c[b+5696>>2]|0;av=c[b+5704>>2]|0;aw=c[b+5712>>2]|0;ax=c[b+5720>>2]|0;ay=c[b+39768>>2]|0;az=c[b+39776>>2]|0;L6317:do{if((c[(d+136|0)>>2]|0)>0){aA=(b+1680|0)+132|0;aB=0;L6319:while(1){c[g>>2]=aB;aC=kc(aA,g)|0;a[h]=8;C=1701667182;a[h+1|0]=C;C=C>>8;a[(h+1|0)+1|0]=C;C=C>>8;a[(h+1|0)+2|0]=C;C=C>>8;a[(h+1|0)+3|0]=C;a[h+5|0]=0;aD=kp(aC,b+528|0,h)|0;aE=c[aD>>2]|0;if((aE|0)==0){aF=tu(40)|0;do{if((aF+16|0|0)!=0){if((a[h]&1)==0){c[(aF+16|0)>>2]=c[h>>2];c[(aF+16|0)+4>>2]=c[h+4>>2];c[(aF+16|0)+8>>2]=c[h+8>>2];break}aG=c[(h+8|0)>>2]|0;aH=c[(h+4|0)>>2]|0;if(aH>>>0>4294967279>>>0){ay=5964;break L6319}if(aH>>>0<11>>>0){a[aF+16|0]=aH<<1;aI=aF+17|0}else{aJ=tu(aH+16&-16)|0;c[aF+24>>2]=aJ;c[(aF+16|0)>>2]=aH+16&-16|1;c[aF+20>>2]=aH;aI=aJ}tH(aI|0,aG|0,aH)|0;a[aI+aH|0]=0}}while(0);if((aF+28|0|0)!=0){tI(aF+28|0|0,0,12)|0}aH=c[(b+528|0)>>2]|0;c[aF>>2]=0;c[aF+4>>2]=0;c[aF+8>>2]=aH;c[aD>>2]=aF;aH=c[c[(aC|0)>>2]>>2]|0;if((aH|0)==0){aK=aF}else{c[(aC|0)>>2]=aH;aK=c[aD>>2]|0}jV(c[aC+4>>2]|0,aK);c[(aC+8|0)>>2]=(c[(aC+8|0)>>2]|0)+1;aL=aF}else{aL=aE}aH=aL+28|0;if((a[aH]&1)==0){c[f>>2]=c[aH>>2];c[f+4>>2]=c[aH+4>>2];c[f+8>>2]=c[aH+8>>2]}else{aH=c[aL+36>>2]|0;aG=c[aL+32>>2]|0;if(aG>>>0>4294967279>>>0){ay=5983;break}if(aG>>>0<11>>>0){a[f]=aG<<1;aM=f+1|0}else{aJ=tu(aG+16&-16)|0;c[(f+8|0)>>2]=aJ;c[(f|0)>>2]=aG+16&-16|1;c[(f+4|0)>>2]=aG;aM=aJ}tH(aM|0,aH|0,aG)|0;a[aM+aG|0]=0}aG=(c[(d+24|0)>>2]|0)+(aB*48|0)+4|0;if((aG|0)==0){hC(19,0,49832,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az}else{c[aG>>2]=cj(((a[f]&1)==0?f+1|0:c[(f+8|0)>>2]|0)|0)|0}if((a[f]&1)!=0){tw(c[(f+8|0)>>2]|0)}if((a[h]&1)!=0){tw(c[(h+8|0)>>2]|0)}c[k>>2]=aB;aG=kc(aA,k)|0;aH=tu(16)|0;c[(l+8|0)>>2]=aH;c[(l|0)>>2]=17;c[(l+4|0)>>2]=14;tH(aH|0,30344,14)|0;a[aH+14|0]=0;aH=kp(aG,b+520|0,l)|0;aJ=c[aH>>2]|0;if((aJ|0)==0){aN=tu(40)|0;do{if((aN+16|0|0)!=0){if((a[l]&1)==0){c[(aN+16|0)>>2]=c[l>>2];c[(aN+16|0)+4>>2]=c[l+4>>2];c[(aN+16|0)+8>>2]=c[l+8>>2];break}aO=c[(l+8|0)>>2]|0;aP=c[(l+4|0)>>2]|0;if(aP>>>0>4294967279>>>0){ay=6005;break L6319}if(aP>>>0<11>>>0){a[aN+16|0]=aP<<1;aQ=aN+17|0}else{aR=tu(aP+16&-16)|0;c[aN+24>>2]=aR;c[(aN+16|0)>>2]=aP+16&-16|1;c[aN+20>>2]=aP;aQ=aR}tH(aQ|0,aO|0,aP)|0;a[aQ+aP|0]=0}}while(0);if((aN+28|0|0)!=0){tI(aN+28|0|0,0,12)|0}aE=c[(b+520|0)>>2]|0;c[aN>>2]=0;c[aN+4>>2]=0;c[aN+8>>2]=aE;c[aH>>2]=aN;aE=c[c[(aG|0)>>2]>>2]|0;if((aE|0)==0){aS=aN}else{c[(aG|0)>>2]=aE;aS=c[aH>>2]|0}jV(c[aG+4>>2]|0,aS);c[(aG+8|0)>>2]=(c[(aG+8|0)>>2]|0)+1;aT=aN}else{aT=aJ}aE=aT+28|0;if((a[aE]&1)==0){c[j>>2]=c[aE>>2];c[j+4>>2]=c[aE+4>>2];c[j+8>>2]=c[aE+8>>2]}else{aE=c[aT+36>>2]|0;aF=c[aT+32>>2]|0;if(aF>>>0>4294967279>>>0){ay=6024;break}if(aF>>>0<11>>>0){a[j]=aF<<1;aU=j+1|0}else{aC=tu(aF+16&-16)|0;c[(j+8|0)>>2]=aC;c[(j|0)>>2]=aF+16&-16|1;c[(j+4|0)>>2]=aF;aU=aC}tH(aU|0,aE|0,aF)|0;a[aU+aF|0]=0}kd(j,(c[(d+24|0)>>2]|0)+(aB*48|0)|0);if((a[j]&1)!=0){tw(c[(j+8|0)>>2]|0)}if((a[l]&1)!=0){tw(c[(l+8|0)>>2]|0)}c[n>>2]=aB;aF=kc(aA,n)|0;aE=tu(16)|0;c[(o+8|0)>>2]=aE;c[(o|0)>>2]=17;c[(o+4|0)>>2]=11;tH(aE|0,3e4,11)|0;a[aE+11|0]=0;aE=kp(aF,b+512|0,o)|0;aC=c[aE>>2]|0;if((aC|0)==0){aD=tu(40)|0;do{if((aD+16|0|0)!=0){if((a[o]&1)==0){c[(aD+16|0)>>2]=c[o>>2];c[(aD+16|0)+4>>2]=c[o+4>>2];c[(aD+16|0)+8>>2]=c[o+8>>2];break}aP=c[(o+8|0)>>2]|0;aO=c[(o+4|0)>>2]|0;if(aO>>>0>4294967279>>>0){ay=6043;break L6319}if(aO>>>0<11>>>0){a[aD+16|0]=aO<<1;aV=aD+17|0}else{aR=tu(aO+16&-16)|0;c[aD+24>>2]=aR;c[(aD+16|0)>>2]=aO+16&-16|1;c[aD+20>>2]=aO;aV=aR}tH(aV|0,aP|0,aO)|0;a[aV+aO|0]=0}}while(0);if((aD+28|0|0)!=0){tI(aD+28|0|0,0,12)|0}aJ=c[(b+512|0)>>2]|0;c[aD>>2]=0;c[aD+4>>2]=0;c[aD+8>>2]=aJ;c[aE>>2]=aD;aJ=c[c[(aF|0)>>2]>>2]|0;if((aJ|0)==0){aW=aD}else{c[(aF|0)>>2]=aJ;aW=c[aE>>2]|0}jV(c[aF+4>>2]|0,aW);c[(aF+8|0)>>2]=(c[(aF+8|0)>>2]|0)+1;aX=aD}else{aX=aC}aJ=aX+28|0;if((a[aJ]&1)==0){c[m>>2]=c[aJ>>2];c[m+4>>2]=c[aJ+4>>2];c[m+8>>2]=c[aJ+8>>2]}else{aJ=c[aX+36>>2]|0;aN=c[aX+32>>2]|0;if(aN>>>0>4294967279>>>0){ay=6062;break}if(aN>>>0<11>>>0){a[m]=aN<<1;aY=m+1|0}else{aG=tu(aN+16&-16)|0;c[(m+8|0)>>2]=aG;c[(m|0)>>2]=aN+16&-16|1;c[(m+4|0)>>2]=aN;aY=aG}tH(aY|0,aJ|0,aN)|0;a[aY+aN|0]=0}aN=(c[(d+24|0)>>2]|0)+(aB*48|0)+8|0;if((aN|0)==0){hC(19,0,49832,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az}else{c[aN>>2]=cj(((a[m]&1)==0?m+1|0:c[(m+8|0)>>2]|0)|0)|0}if((a[m]&1)!=0){tw(c[(m+8|0)>>2]|0)}if((a[o]&1)!=0){tw(c[(o+8|0)>>2]|0)}c[q>>2]=aB;aN=kc(aA,q)|0;a[r]=16;C=1701603686;a[r+1|0|0]=C;C=C>>8;a[(r+1|0|0)+1|0]=C;C=C>>8;a[(r+1|0|0)+2|0]=C;C=C>>8;a[(r+1|0|0)+3|0]=C;C=1701667150;a[(r+1|0)+4|0]=C;C=C>>8;a[((r+1|0)+4|0)+1|0]=C;C=C>>8;a[((r+1|0)+4|0)+2|0]=C;C=C>>8;a[((r+1|0)+4|0)+3|0]=C;a[r+9|0]=0;aJ=kp(aN,b+504|0,r)|0;aG=c[aJ>>2]|0;if((aG|0)==0){aH=tu(40)|0;do{if((aH+16|0|0)!=0){if((a[r]&1)==0){c[(aH+16|0)>>2]=c[r>>2];c[(aH+16|0)+4>>2]=c[r+4>>2];c[(aH+16|0)+8>>2]=c[r+8>>2];break}aO=c[(r+8|0)>>2]|0;aP=c[(r+4|0)>>2]|0;if(aP>>>0>4294967279>>>0){ay=6083;break L6319}if(aP>>>0<11>>>0){a[aH+16|0]=aP<<1;aZ=aH+17|0}else{aR=tu(aP+16&-16)|0;c[aH+24>>2]=aR;c[(aH+16|0)>>2]=aP+16&-16|1;c[aH+20>>2]=aP;aZ=aR}tH(aZ|0,aO|0,aP)|0;a[aZ+aP|0]=0}}while(0);if((aH+28|0|0)!=0){tI(aH+28|0|0,0,12)|0}aC=c[(b+504|0)>>2]|0;c[aH>>2]=0;c[aH+4>>2]=0;c[aH+8>>2]=aC;c[aJ>>2]=aH;aC=c[c[(aN|0)>>2]>>2]|0;if((aC|0)==0){a_=aH}else{c[(aN|0)>>2]=aC;a_=c[aJ>>2]|0}jV(c[aN+4>>2]|0,a_);c[(aN+8|0)>>2]=(c[(aN+8|0)>>2]|0)+1;a$=aH}else{a$=aG}aC=a$+28|0;if((a[aC]&1)==0){c[p>>2]=c[aC>>2];c[p+4>>2]=c[aC+4>>2];c[p+8>>2]=c[aC+8>>2]}else{aC=c[a$+36>>2]|0;aD=c[a$+32>>2]|0;if(aD>>>0>4294967279>>>0){ay=6102;break}if(aD>>>0<11>>>0){a[p]=aD<<1;a0=p+1|0}else{aF=tu(aD+16&-16)|0;c[(p+8|0)>>2]=aF;c[(p|0)>>2]=aD+16&-16|1;c[(p+4|0)>>2]=aD;a0=aF}tH(a0|0,aC|0,aD)|0;a[a0+aD|0]=0}aD=(c[(d+24|0)>>2]|0)+(aB*48|0)+12|0;if((aD|0)==0){hC(19,0,49832,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az}else{c[aD>>2]=cj(((a[p]&1)==0?p+1|0:c[(p+8|0)>>2]|0)|0)|0}if((a[p]&1)!=0){tw(c[(p+8|0)>>2]|0)}if((a[r]&1)!=0){tw(c[(r+8|0)>>2]|0)}c[t>>2]=aB;aD=kc(aA,t)|0;a[u]=18;tH(u+1|0|0,28704,9)|0;a[u+10|0]=0;aC=kp(aD,b+496|0,u)|0;aF=c[aC>>2]|0;if((aF|0)==0){aE=tu(40)|0;do{if((aE+16|0|0)!=0){if((a[u]&1)==0){c[(aE+16|0)>>2]=c[u>>2];c[(aE+16|0)+4>>2]=c[u+4>>2];c[(aE+16|0)+8>>2]=c[u+8>>2];break}aP=c[(u+8|0)>>2]|0;aO=c[(u+4|0)>>2]|0;if(aO>>>0>4294967279>>>0){ay=6123;break L6319}if(aO>>>0<11>>>0){a[aE+16|0]=aO<<1;a1=aE+17|0}else{aR=tu(aO+16&-16)|0;c[aE+24>>2]=aR;c[(aE+16|0)>>2]=aO+16&-16|1;c[aE+20>>2]=aO;a1=aR}tH(a1|0,aP|0,aO)|0;a[a1+aO|0]=0}}while(0);if((aE+28|0|0)!=0){tI(aE+28|0|0,0,12)|0}aG=c[(b+496|0)>>2]|0;c[aE>>2]=0;c[aE+4>>2]=0;c[aE+8>>2]=aG;c[aC>>2]=aE;aG=c[c[(aD|0)>>2]>>2]|0;if((aG|0)==0){a2=aE}else{c[(aD|0)>>2]=aG;a2=c[aC>>2]|0}jV(c[aD+4>>2]|0,a2);c[(aD+8|0)>>2]=(c[(aD+8|0)>>2]|0)+1;a3=aE}else{a3=aF}aG=a3+28|0;if((a[aG]&1)==0){c[s>>2]=c[aG>>2];c[s+4>>2]=c[aG+4>>2];c[s+8>>2]=c[aG+8>>2]}else{aG=c[a3+36>>2]|0;aH=c[a3+32>>2]|0;if(aH>>>0>4294967279>>>0){ay=6142;break}if(aH>>>0<11>>>0){a[s]=aH<<1;a4=s+1|0}else{aN=tu(aH+16&-16)|0;c[(s+8|0)>>2]=aN;c[(s|0)>>2]=aH+16&-16|1;c[(s+4|0)>>2]=aH;a4=aN}tH(a4|0,aG|0,aH)|0;a[a4+aH|0]=0}kb(s,(c[(d+24|0)>>2]|0)+(aB*48|0)+16|0,0);if((a[s]&1)!=0){tw(c[(s+8|0)>>2]|0)}if((a[u]&1)!=0){tw(c[(u+8|0)>>2]|0)}c[w>>2]=aB;aH=kc(aA,w)|0;aG=tu(16)|0;c[(x+8|0)>>2]=aG;c[(x|0)>>2]=17;c[(x+4|0)>>2]=11;tH(aG|0,28120,11)|0;a[aG+11|0]=0;aG=kp(aH,b+488|0,x)|0;aN=c[aG>>2]|0;if((aN|0)==0){aJ=tu(40)|0;do{if((aJ+16|0|0)!=0){if((a[x]&1)==0){c[(aJ+16|0)>>2]=c[x>>2];c[(aJ+16|0)+4>>2]=c[x+4>>2];c[(aJ+16|0)+8>>2]=c[x+8>>2];break}aO=c[(x+8|0)>>2]|0;aP=c[(x+4|0)>>2]|0;if(aP>>>0>4294967279>>>0){ay=6161;break L6319}if(aP>>>0<11>>>0){a[aJ+16|0]=aP<<1;a5=aJ+17|0}else{aR=tu(aP+16&-16)|0;c[aJ+24>>2]=aR;c[(aJ+16|0)>>2]=aP+16&-16|1;c[aJ+20>>2]=aP;a5=aR}tH(a5|0,aO|0,aP)|0;a[a5+aP|0]=0}}while(0);if((aJ+28|0|0)!=0){tI(aJ+28|0|0,0,12)|0}aF=c[(b+488|0)>>2]|0;c[aJ>>2]=0;c[aJ+4>>2]=0;c[aJ+8>>2]=aF;c[aG>>2]=aJ;aF=c[c[(aH|0)>>2]>>2]|0;if((aF|0)==0){a6=aJ}else{c[(aH|0)>>2]=aF;a6=c[aG>>2]|0}jV(c[aH+4>>2]|0,a6);c[(aH+8|0)>>2]=(c[(aH+8|0)>>2]|0)+1;a7=aJ}else{a7=aN}aF=a7+28|0;if((a[aF]&1)==0){c[v>>2]=c[aF>>2];c[v+4>>2]=c[aF+4>>2];c[v+8>>2]=c[aF+8>>2]}else{aF=c[a7+36>>2]|0;aE=c[a7+32>>2]|0;if(aE>>>0>4294967279>>>0){ay=6180;break}if(aE>>>0<11>>>0){a[v]=aE<<1;a8=v+1|0}else{aD=tu(aE+16&-16)|0;c[(v+8|0)>>2]=aD;c[(v|0)>>2]=aE+16&-16|1;c[(v+4|0)>>2]=aE;a8=aD}tH(a8|0,aF|0,aE)|0;a[a8+aE|0]=0}kb(v,(c[(d+24|0)>>2]|0)+(aB*48|0)+20|0,0);if((a[v]&1)!=0){tw(c[(v+8|0)>>2]|0)}if((a[x]&1)!=0){tw(c[(x+8|0)>>2]|0)}c[z>>2]=aB;aE=kc(aA,z)|0;a[A]=14;a[A+1|0]=a[27080]|0;a[(A+1|0)+1|0]=a[27081]|0;a[(A+1|0)+2|0]=a[27082]|0;a[(A+1|0)+3|0]=a[27083]|0;a[(A+1|0)+4|0]=a[27084]|0;a[(A+1|0)+5|0]=a[27085]|0;a[(A+1|0)+6|0]=a[27086]|0;a[A+8|0]=0;aF=kp(aE,b+480|0,A)|0;aD=c[aF>>2]|0;if((aD|0)==0){aC=tu(40)|0;do{if((aC+16|0|0)!=0){if((a[A]&1)==0){c[(aC+16|0)>>2]=c[A>>2];c[(aC+16|0)+4>>2]=c[A+4>>2];c[(aC+16|0)+8>>2]=c[A+8>>2];break}aP=c[(A+8|0)>>2]|0;aO=c[(A+4|0)>>2]|0;if(aO>>>0>4294967279>>>0){ay=6198;break L6319}if(aO>>>0<11>>>0){a[aC+16|0]=aO<<1;a9=aC+17|0}else{aR=tu(aO+16&-16)|0;c[aC+24>>2]=aR;c[(aC+16|0)>>2]=aO+16&-16|1;c[aC+20>>2]=aO;a9=aR}tH(a9|0,aP|0,aO)|0;a[a9+aO|0]=0}}while(0);if((aC+28|0|0)!=0){tI(aC+28|0|0,0,12)|0}aN=c[(b+480|0)>>2]|0;c[aC>>2]=0;c[aC+4>>2]=0;c[aC+8>>2]=aN;c[aF>>2]=aC;aN=c[c[(aE|0)>>2]>>2]|0;if((aN|0)==0){ba=aC}else{c[(aE|0)>>2]=aN;ba=c[aF>>2]|0}jV(c[aE+4>>2]|0,ba);c[(aE+8|0)>>2]=(c[(aE+8|0)>>2]|0)+1;bb=aC}else{bb=aD}aN=bb+28|0;if((a[aN]&1)==0){c[y>>2]=c[aN>>2];c[y+4>>2]=c[aN+4>>2];c[y+8>>2]=c[aN+8>>2]}else{aN=c[bb+36>>2]|0;aJ=c[bb+32>>2]|0;if(aJ>>>0>4294967279>>>0){ay=6217;break}if(aJ>>>0<11>>>0){a[y]=aJ<<1;bc=y+1|0}else{aH=tu(aJ+16&-16)|0;c[(y+8|0)>>2]=aH;c[(y|0)>>2]=aJ+16&-16|1;c[(y+4|0)>>2]=aJ;bc=aH}tH(bc|0,aN|0,aJ)|0;a[bc+aJ|0]=0}kb(y,(c[(d+24|0)>>2]|0)+(aB*48|0)+24|0,0);if((a[y]&1)!=0){tw(c[(y+8|0)>>2]|0)}if((a[A]&1)!=0){tw(c[(A+8|0)>>2]|0)}c[D>>2]=aB;aJ=kc(aA,D)|0;a[E]=18;tH(E+1|0|0,26600,9)|0;a[E+10|0]=0;aN=kp(aJ,b+472|0,E)|0;aH=c[aN>>2]|0;if((aH|0)==0){aG=tu(40)|0;do{if((aG+16|0|0)!=0){if((a[E]&1)==0){c[(aG+16|0)>>2]=c[E>>2];c[(aG+16|0)+4>>2]=c[E+4>>2];c[(aG+16|0)+8>>2]=c[E+8>>2];break}aO=c[(E+8|0)>>2]|0;aP=c[(E+4|0)>>2]|0;if(aP>>>0>4294967279>>>0){ay=6235;break L6319}if(aP>>>0<11>>>0){a[aG+16|0]=aP<<1;bd=aG+17|0}else{aR=tu(aP+16&-16)|0;c[aG+24>>2]=aR;c[(aG+16|0)>>2]=aP+16&-16|1;c[aG+20>>2]=aP;bd=aR}tH(bd|0,aO|0,aP)|0;a[bd+aP|0]=0}}while(0);if((aG+28|0|0)!=0){tI(aG+28|0|0,0,12)|0}aD=c[(b+472|0)>>2]|0;c[aG>>2]=0;c[aG+4>>2]=0;c[aG+8>>2]=aD;c[aN>>2]=aG;aD=c[c[(aJ|0)>>2]>>2]|0;if((aD|0)==0){be=aG}else{c[(aJ|0)>>2]=aD;be=c[aN>>2]|0}jV(c[aJ+4>>2]|0,be);c[(aJ+8|0)>>2]=(c[(aJ+8|0)>>2]|0)+1;bf=aG}else{bf=aH}aD=bf+28|0;if((a[aD]&1)==0){c[B>>2]=c[aD>>2];c[B+4>>2]=c[aD+4>>2];c[B+8>>2]=c[aD+8>>2]}else{aD=c[bf+36>>2]|0;aC=c[bf+32>>2]|0;if(aC>>>0>4294967279>>>0){ay=6254;break}if(aC>>>0<11>>>0){a[B]=aC<<1;bg=B+1|0}else{aE=tu(aC+16&-16)|0;c[(B+8|0)>>2]=aE;c[(B|0)>>2]=aC+16&-16|1;c[(B+4|0)>>2]=aC;bg=aE}tH(bg|0,aD|0,aC)|0;a[bg+aC|0]=0}kb(B,(c[(d+24|0)>>2]|0)+(aB*48|0)+28|0,0);if((a[B]&1)!=0){tw(c[(B+8|0)>>2]|0)}if((a[E]&1)!=0){tw(c[(E+8|0)>>2]|0)}c[G>>2]=aB;aC=kc(aA,G)|0;aD=tu(16)|0;c[(H+8|0)>>2]=aD;c[(H|0)>>2]=17;c[(H+4|0)>>2]=12;tH(aD|0,25696,12)|0;a[aD+12|0]=0;aD=kp(aC,b+464|0,H)|0;aE=c[aD>>2]|0;if((aE|0)==0){aF=tu(40)|0;do{if((aF+16|0|0)!=0){if((a[H]&1)==0){c[(aF+16|0)>>2]=c[H>>2];c[(aF+16|0)+4>>2]=c[H+4>>2];c[(aF+16|0)+8>>2]=c[H+8>>2];break}aP=c[(H+8|0)>>2]|0;aO=c[(H+4|0)>>2]|0;if(aO>>>0>4294967279>>>0){ay=6273;break L6319}if(aO>>>0<11>>>0){a[aF+16|0]=aO<<1;bh=aF+17|0}else{aR=tu(aO+16&-16)|0;c[aF+24>>2]=aR;c[(aF+16|0)>>2]=aO+16&-16|1;c[aF+20>>2]=aO;bh=aR}tH(bh|0,aP|0,aO)|0;a[bh+aO|0]=0}}while(0);if((aF+28|0|0)!=0){tI(aF+28|0|0,0,12)|0}aH=c[(b+464|0)>>2]|0;c[aF>>2]=0;c[aF+4>>2]=0;c[aF+8>>2]=aH;c[aD>>2]=aF;aH=c[c[(aC|0)>>2]>>2]|0;if((aH|0)==0){bi=aF}else{c[(aC|0)>>2]=aH;bi=c[aD>>2]|0}jV(c[aC+4>>2]|0,bi);c[(aC+8|0)>>2]=(c[(aC+8|0)>>2]|0)+1;bj=aF}else{bj=aE}aH=bj+28|0;if((a[aH]&1)==0){c[F>>2]=c[aH>>2];c[F+4>>2]=c[aH+4>>2];c[F+8>>2]=c[aH+8>>2]}else{aH=c[bj+36>>2]|0;aG=c[bj+32>>2]|0;if(aG>>>0>4294967279>>>0){ay=6292;break}if(aG>>>0<11>>>0){a[F]=aG<<1;bk=F+1|0}else{aJ=tu(aG+16&-16)|0;c[(F+8|0)>>2]=aJ;c[(F|0)>>2]=aG+16&-16|1;c[(F+4|0)>>2]=aG;bk=aJ}tH(bk|0,aH|0,aG)|0;a[bk+aG|0]=0}kb(F,(c[(d+24|0)>>2]|0)+(aB*48|0)+32|0,0);if((a[F]&1)!=0){tw(c[(F+8|0)>>2]|0)}if((a[H]&1)!=0){tw(c[(H+8|0)>>2]|0)}c[J>>2]=aB;aG=kc(aA,J)|0;a[K]=16;C=1399157621;a[K+1|0|0]=C;C=C>>8;a[(K+1|0|0)+1|0]=C;C=C>>8;a[(K+1|0|0)+2|0]=C;C=C>>8;a[(K+1|0|0)+3|0]=C;C=1953653108;a[(K+1|0)+4|0]=C;C=C>>8;a[((K+1|0)+4|0)+1|0]=C;C=C>>8;a[((K+1|0)+4|0)+2|0]=C;C=C>>8;a[((K+1|0)+4|0)+3|0]=C;a[K+9|0]=0;aH=kp(aG,b+456|0,K)|0;aJ=c[aH>>2]|0;if((aJ|0)==0){aN=tu(40)|0;do{if((aN+16|0|0)!=0){if((a[K]&1)==0){c[(aN+16|0)>>2]=c[K>>2];c[(aN+16|0)+4>>2]=c[K+4>>2];c[(aN+16|0)+8>>2]=c[K+8>>2];break}aO=c[(K+8|0)>>2]|0;aP=c[(K+4|0)>>2]|0;if(aP>>>0>4294967279>>>0){ay=6310;break L6319}if(aP>>>0<11>>>0){a[aN+16|0]=aP<<1;bl=aN+17|0}else{aR=tu(aP+16&-16)|0;c[aN+24>>2]=aR;c[(aN+16|0)>>2]=aP+16&-16|1;c[aN+20>>2]=aP;bl=aR}tH(bl|0,aO|0,aP)|0;a[bl+aP|0]=0}}while(0);if((aN+28|0|0)!=0){tI(aN+28|0|0,0,12)|0}aE=c[(b+456|0)>>2]|0;c[aN>>2]=0;c[aN+4>>2]=0;c[aN+8>>2]=aE;c[aH>>2]=aN;aE=c[c[(aG|0)>>2]>>2]|0;if((aE|0)==0){bm=aN}else{c[(aG|0)>>2]=aE;bm=c[aH>>2]|0}jV(c[aG+4>>2]|0,bm);c[(aG+8|0)>>2]=(c[(aG+8|0)>>2]|0)+1;bn=aN}else{bn=aJ}aE=bn+28|0;if((a[aE]&1)==0){c[I>>2]=c[aE>>2];c[I+4>>2]=c[aE+4>>2];c[I+8>>2]=c[aE+8>>2];bo=a[I]|0}else{aE=c[bn+36>>2]|0;aF=c[bn+32>>2]|0;if(aF>>>0>4294967279>>>0){ay=6329;break}if(aF>>>0<11>>>0){a[I]=aF<<1&255;bp=I+1|0;bq=aF<<1&255}else{aC=tu(aF+16&-16)|0;c[(I+8|0)>>2]=aC;c[(I|0)>>2]=aF+16&-16|1;c[(I+4|0)>>2]=aF;bp=aC;bq=(aF+16&-16|1)&255}tH(bp|0,aE|0,aF)|0;a[bp+aF|0]=0;bo=bq}aF=(c[(d+24|0)>>2]|0)+(aB*48|0)+41|0;aE=bo&255;aC=(aE&1|0)==0?aE>>>1:c[(I+4|0)>>2]|0;aE=(bo&1)==0;aD=c[(I+8|0)>>2]|0;aP=tK((aE?I+1|0:aD)|0,42e3,(aC>>>0>4>>>0?4:aC)|0)|0;if((aP|0)==0){br=aC>>>0<4>>>0?-1:aC>>>0>4>>>0&1}else{br=aP}a[aF]=(br|0)==0|0;if(!aE){tw(aD)}if((a[K]&1)!=0){tw(c[(K+8|0)>>2]|0)}c[M>>2]=aB;aD=kc(aA,M)|0;a[N]=10;a[N+1|0]=a[39368]|0;a[(N+1|0)+1|0]=a[39369]|0;a[(N+1|0)+2|0]=a[39370]|0;a[(N+1|0)+3|0]=a[39371]|0;a[(N+1|0)+4|0]=a[39372]|0;a[N+6|0]=0;aE=kp(aD,b+448|0,N)|0;aF=c[aE>>2]|0;if((aF|0)==0){aP=tu(40)|0;do{if((aP+16|0|0)!=0){if((a[N]&1)==0){c[(aP+16|0)>>2]=c[N>>2];c[(aP+16|0)+4>>2]=c[N+4>>2];c[(aP+16|0)+8>>2]=c[N+8>>2];break}aC=c[(N+8|0)>>2]|0;aO=c[(N+4|0)>>2]|0;if(aO>>>0>4294967279>>>0){ay=6349;break L6319}if(aO>>>0<11>>>0){a[aP+16|0]=aO<<1;bs=aP+17|0}else{aR=tu(aO+16&-16)|0;c[aP+24>>2]=aR;c[(aP+16|0)>>2]=aO+16&-16|1;c[aP+20>>2]=aO;bs=aR}tH(bs|0,aC|0,aO)|0;a[bs+aO|0]=0}}while(0);if((aP+28|0|0)!=0){tI(aP+28|0|0,0,12)|0}aJ=c[(b+448|0)>>2]|0;c[aP>>2]=0;c[aP+4>>2]=0;c[aP+8>>2]=aJ;c[aE>>2]=aP;aJ=c[c[(aD|0)>>2]>>2]|0;if((aJ|0)==0){bt=aP}else{c[(aD|0)>>2]=aJ;bt=c[aE>>2]|0}jV(c[aD+4>>2]|0,bt);c[(aD+8|0)>>2]=(c[(aD+8|0)>>2]|0)+1;bu=aP}else{bu=aF}aJ=bu+28|0;if((a[aJ]&1)==0){c[L>>2]=c[aJ>>2];c[L+4>>2]=c[aJ+4>>2];c[L+8>>2]=c[aJ+8>>2];bv=a[L]|0}else{aJ=c[bu+36>>2]|0;aN=c[bu+32>>2]|0;if(aN>>>0>4294967279>>>0){ay=6368;break}if(aN>>>0<11>>>0){a[L]=aN<<1&255;bw=L+1|0;bx=aN<<1&255}else{aG=tu(aN+16&-16)|0;c[(L+8|0)>>2]=aG;c[(L|0)>>2]=aN+16&-16|1;c[(L+4|0)>>2]=aN;bw=aG;bx=(aN+16&-16|1)&255}tH(bw|0,aJ|0,aN)|0;a[bw+aN|0]=0;bv=bx}aN=(c[(d+24|0)>>2]|0)+(aB*48|0)+42|0;aJ=bv&255;aG=(aJ&1|0)==0?aJ>>>1:c[(L+4|0)>>2]|0;aJ=(bv&1)==0;aH=c[(L+8|0)>>2]|0;aO=tK((aJ?L+1|0:aH)|0,42e3,(aG>>>0>4>>>0?4:aG)|0)|0;if((aO|0)==0){by=aG>>>0<4>>>0?-1:aG>>>0>4>>>0&1}else{by=aO}a[aN]=(by|0)==0|0;if(!aJ){tw(aH)}if((a[N]&1)!=0){tw(c[(N+8|0)>>2]|0)}c[P>>2]=aB;aH=kc(aA,P)|0;a[Q]=10;a[Q+1|0]=a[25288]|0;a[(Q+1|0)+1|0]=a[25289]|0;a[(Q+1|0)+2|0]=a[25290]|0;a[(Q+1|0)+3|0]=a[25291]|0;a[(Q+1|0)+4|0]=a[25292]|0;a[Q+6|0]=0;aJ=kp(aH,b+440|0,Q)|0;aN=c[aJ>>2]|0;if((aN|0)==0){aO=tu(40)|0;do{if((aO+16|0|0)!=0){if((a[Q]&1)==0){c[(aO+16|0)>>2]=c[Q>>2];c[(aO+16|0)+4>>2]=c[Q+4>>2];c[(aO+16|0)+8>>2]=c[Q+8>>2];break}aG=c[(Q+8|0)>>2]|0;aC=c[(Q+4|0)>>2]|0;if(aC>>>0>4294967279>>>0){ay=6388;break L6319}if(aC>>>0<11>>>0){a[aO+16|0]=aC<<1;bz=aO+17|0}else{aR=tu(aC+16&-16)|0;c[aO+24>>2]=aR;c[(aO+16|0)>>2]=aC+16&-16|1;c[aO+20>>2]=aC;bz=aR}tH(bz|0,aG|0,aC)|0;a[bz+aC|0]=0}}while(0);if((aO+28|0|0)!=0){tI(aO+28|0|0,0,12)|0}aF=c[(b+440|0)>>2]|0;c[aO>>2]=0;c[aO+4>>2]=0;c[aO+8>>2]=aF;c[aJ>>2]=aO;aF=c[c[(aH|0)>>2]>>2]|0;if((aF|0)==0){bA=aO}else{c[(aH|0)>>2]=aF;bA=c[aJ>>2]|0}jV(c[aH+4>>2]|0,bA);c[(aH+8|0)>>2]=(c[(aH+8|0)>>2]|0)+1;bB=aO}else{bB=aN}aF=bB+28|0;if((a[aF]&1)==0){c[O>>2]=c[aF>>2];c[O+4>>2]=c[aF+4>>2];c[O+8>>2]=c[aF+8>>2];bC=a[O]|0}else{aF=c[bB+36>>2]|0;aP=c[bB+32>>2]|0;if(aP>>>0>4294967279>>>0){ay=6407;break}if(aP>>>0<11>>>0){a[O]=aP<<1&255;bD=O+1|0;bE=aP<<1&255}else{aD=tu(aP+16&-16)|0;c[(O+8|0)>>2]=aD;c[(O|0)>>2]=aP+16&-16|1;c[(O+4|0)>>2]=aP;bD=aD;bE=(aP+16&-16|1)&255}tH(bD|0,aF|0,aP)|0;a[bD+aP|0]=0;bC=bE}aP=(c[(d+24|0)>>2]|0)+(aB*48|0)+40|0;aF=bC&255;aD=(aF&1|0)==0?aF>>>1:c[(O+4|0)>>2]|0;aF=(bC&1)==0;aE=c[(O+8|0)>>2]|0;aC=tK((aF?O+1|0:aE)|0,42e3,(aD>>>0>4>>>0?4:aD)|0)|0;if((aC|0)==0){bF=aD>>>0<4>>>0?-1:aD>>>0>4>>>0&1}else{bF=aC}a[aP]=(bF|0)==0|0;if(!aF){tw(aE)}if((a[Q]&1)!=0){tw(c[(Q+8|0)>>2]|0)}aE=c[(d+24|0)>>2]|0;aF=(a[aE+(aB*48|0)+41|0]|0)!=0;aP=(a[aE+(aB*48|0)+42|0]|0)!=0?42e3:42440;aC=(a[aE+(aB*48|0)+40|0]|0)!=0?42e3:42440;hA(4,0,57944,(az=i,i=i+40|0,c[az>>2]=c[aE+(aB*48|0)+4>>2],c[az+8>>2]=aF?93904:24160,c[az+16>>2]=aP,c[az+24>>2]=aF?93904:24064,c[az+32>>2]=aC,az)|0);i=az;aC=c[(d+24|0)>>2]|0;aF=c[aC+(aB*48|0)+4>>2]|0;if((a[aF]|0)==36){a[aC+(aB*48|0)+44|0]=1;bG=c[(c[(d+24|0)>>2]|0)+(aB*48|0)+4>>2]|0}else{bG=aF}aF=tD(bG|0)|0;if(aF>>>0>4294967279>>>0){ay=6480;break}if(aF>>>0<11>>>0){a[R]=aF<<1;bH=R+1|0}else{aC=tu(aF+16&-16)|0;c[(R+8|0)>>2]=aC;c[(R|0)>>2]=aF+16&-16|1;c[(R+4|0)>>2]=aF;bH=aC}tH(bH|0,bG|0,aF)|0;a[bH+aF|0]=0;c[(ke(e,R)|0)>>2]=aB;if((a[R]&1)!=0){tw(c[(R+8|0)>>2]|0)}aB=aB+1|0;if((aB|0)>=(c[(d+136|0)>>2]|0)){break L6317}}if((ay|0)==5964){ml(0)}else if((ay|0)==5983){ml(0)}else if((ay|0)==6005){ml(0)}else if((ay|0)==6024){ml(0)}else if((ay|0)==6043){ml(0)}else if((ay|0)==6062){ml(0)}else if((ay|0)==6083){ml(0)}else if((ay|0)==6102){ml(0)}else if((ay|0)==6123){ml(0)}else if((ay|0)==6142){ml(0)}else if((ay|0)==6161){ml(0)}else if((ay|0)==6180){ml(0)}else if((ay|0)==6198){ml(0)}else if((ay|0)==6217){ml(0)}else if((ay|0)==6235){ml(0)}else if((ay|0)==6254){ml(0)}else if((ay|0)==6273){ml(0)}else if((ay|0)==6292){ml(0)}else if((ay|0)==6310){ml(0)}else if((ay|0)==6329){ml(0)}else if((ay|0)==6349){ml(0)}else if((ay|0)==6368){ml(0)}else if((ay|0)==6388){ml(0)}else if((ay|0)==6407){ml(0)}else if((ay|0)==6480){ml(0)}}}while(0);if((c[17800]|0)!=0){dd[c[3504]&511](4)}hA(4,1,57856,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az;L6882:do{if((c[(d+140|0)>>2]|0)>0){R=(b+1680|0)+168|0;bH=0;L6884:while(1){c[T>>2]=bH;bG=kc(R,T)|0;a[U]=8;C=1701667182;a[U+1|0]=C;C=C>>8;a[(U+1|0)+1|0]=C;C=C>>8;a[(U+1|0)+2|0]=C;C=C>>8;a[(U+1|0)+3|0]=C;a[U+5|0]=0;Q=kp(bG,b+432|0,U)|0;bF=c[Q>>2]|0;if((bF|0)==0){O=tu(40)|0;do{if((O+16|0|0)!=0){if((a[U]&1)==0){c[(O+16|0)>>2]=c[U>>2];c[(O+16|0)+4>>2]=c[U+4>>2];c[(O+16|0)+8>>2]=c[U+8>>2];break}bC=c[(U+8|0)>>2]|0;bE=c[(U+4|0)>>2]|0;if(bE>>>0>4294967279>>>0){ay=6503;break L6884}if(bE>>>0<11>>>0){a[O+16|0]=bE<<1;bI=O+17|0}else{bD=tu(bE+16&-16)|0;c[O+24>>2]=bD;c[(O+16|0)>>2]=bE+16&-16|1;c[O+20>>2]=bE;bI=bD}tH(bI|0,bC|0,bE)|0;a[bI+bE|0]=0}}while(0);if((O+28|0|0)!=0){tI(O+28|0|0,0,12)|0}aN=c[(b+432|0)>>2]|0;c[O>>2]=0;c[O+4>>2]=0;c[O+8>>2]=aN;c[Q>>2]=O;aN=c[c[(bG|0)>>2]>>2]|0;if((aN|0)==0){bJ=O}else{c[(bG|0)>>2]=aN;bJ=c[Q>>2]|0}jV(c[bG+4>>2]|0,bJ);c[(bG+8|0)>>2]=(c[(bG+8|0)>>2]|0)+1;bK=O}else{bK=bF}aN=bK+28|0;if((a[aN]&1)==0){c[S>>2]=c[aN>>2];c[S+4>>2]=c[aN+4>>2];c[S+8>>2]=c[aN+8>>2]}else{aN=c[bK+36>>2]|0;aO=c[bK+32>>2]|0;if(aO>>>0>4294967279>>>0){ay=6522;break}if(aO>>>0<11>>>0){a[S]=aO<<1;bL=S+1|0}else{aH=tu(aO+16&-16)|0;c[(S+8|0)>>2]=aH;c[(S|0)>>2]=aO+16&-16|1;c[(S+4|0)>>2]=aO;bL=aH}tH(bL|0,aN|0,aO)|0;a[bL+aO|0]=0}aO=(c[(d+28|0)>>2]|0)+(bH*52|0)+4|0;if((aO|0)==0){hC(19,0,49832,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az}else{c[aO>>2]=cj(((a[S]&1)==0?S+1|0:c[(S+8|0)>>2]|0)|0)|0}if((a[S]&1)!=0){tw(c[(S+8|0)>>2]|0)}if((a[U]&1)!=0){tw(c[(U+8|0)>>2]|0)}c[W>>2]=bH;aO=kc(R,W)|0;aN=tu(16)|0;c[(X+8|0)>>2]=aN;c[(X|0)>>2]=17;c[(X+4|0)>>2]=14;tH(aN|0,30344,14)|0;a[aN+14|0]=0;aN=kp(aO,b+424|0,X)|0;aH=c[aN>>2]|0;if((aH|0)==0){aJ=tu(40)|0;do{if((aJ+16|0|0)!=0){if((a[X]&1)==0){c[(aJ+16|0)>>2]=c[X>>2];c[(aJ+16|0)+4>>2]=c[X+4>>2];c[(aJ+16|0)+8>>2]=c[X+8>>2];break}bE=c[(X+8|0)>>2]|0;bC=c[(X+4|0)>>2]|0;if(bC>>>0>4294967279>>>0){ay=6544;break L6884}if(bC>>>0<11>>>0){a[aJ+16|0]=bC<<1;bM=aJ+17|0}else{bD=tu(bC+16&-16)|0;c[aJ+24>>2]=bD;c[(aJ+16|0)>>2]=bC+16&-16|1;c[aJ+20>>2]=bC;bM=bD}tH(bM|0,bE|0,bC)|0;a[bM+bC|0]=0}}while(0);if((aJ+28|0|0)!=0){tI(aJ+28|0|0,0,12)|0}bF=c[(b+424|0)>>2]|0;c[aJ>>2]=0;c[aJ+4>>2]=0;c[aJ+8>>2]=bF;c[aN>>2]=aJ;bF=c[c[(aO|0)>>2]>>2]|0;if((bF|0)==0){bN=aJ}else{c[(aO|0)>>2]=bF;bN=c[aN>>2]|0}jV(c[aO+4>>2]|0,bN);c[(aO+8|0)>>2]=(c[(aO+8|0)>>2]|0)+1;bO=aJ}else{bO=aH}bF=bO+28|0;if((a[bF]&1)==0){c[V>>2]=c[bF>>2];c[V+4>>2]=c[bF+4>>2];c[V+8>>2]=c[bF+8>>2]}else{bF=c[bO+36>>2]|0;O=c[bO+32>>2]|0;if(O>>>0>4294967279>>>0){ay=6563;break}if(O>>>0<11>>>0){a[V]=O<<1;bP=V+1|0}else{bG=tu(O+16&-16)|0;c[(V+8|0)>>2]=bG;c[(V|0)>>2]=O+16&-16|1;c[(V+4|0)>>2]=O;bP=bG}tH(bP|0,bF|0,O)|0;a[bP+O|0]=0}kd(V,(c[(d+28|0)>>2]|0)+(bH*52|0)|0);if((a[V]&1)!=0){tw(c[(V+8|0)>>2]|0)}if((a[X]&1)!=0){tw(c[(X+8|0)>>2]|0)}c[Z>>2]=bH;O=kc(R,Z)|0;bF=tu(16)|0;c[(_+8|0)>>2]=bF;c[(_|0)>>2]=17;c[(_+4|0)>>2]=11;tH(bF|0,3e4,11)|0;a[bF+11|0]=0;bF=kp(O,b+416|0,_)|0;bG=c[bF>>2]|0;if((bG|0)==0){Q=tu(40)|0;do{if((Q+16|0|0)!=0){if((a[_]&1)==0){c[(Q+16|0)>>2]=c[_>>2];c[(Q+16|0)+4>>2]=c[_+4>>2];c[(Q+16|0)+8>>2]=c[_+8>>2];break}bC=c[(_+8|0)>>2]|0;bE=c[(_+4|0)>>2]|0;if(bE>>>0>4294967279>>>0){ay=6582;break L6884}if(bE>>>0<11>>>0){a[Q+16|0]=bE<<1;bQ=Q+17|0}else{bD=tu(bE+16&-16)|0;c[Q+24>>2]=bD;c[(Q+16|0)>>2]=bE+16&-16|1;c[Q+20>>2]=bE;bQ=bD}tH(bQ|0,bC|0,bE)|0;a[bQ+bE|0]=0}}while(0);if((Q+28|0|0)!=0){tI(Q+28|0|0,0,12)|0}aH=c[(b+416|0)>>2]|0;c[Q>>2]=0;c[Q+4>>2]=0;c[Q+8>>2]=aH;c[bF>>2]=Q;aH=c[c[(O|0)>>2]>>2]|0;if((aH|0)==0){bR=Q}else{c[(O|0)>>2]=aH;bR=c[bF>>2]|0}jV(c[O+4>>2]|0,bR);c[(O+8|0)>>2]=(c[(O+8|0)>>2]|0)+1;bS=Q}else{bS=bG}aH=bS+28|0;if((a[aH]&1)==0){c[Y>>2]=c[aH>>2];c[Y+4>>2]=c[aH+4>>2];c[Y+8>>2]=c[aH+8>>2]}else{aH=c[bS+36>>2]|0;aJ=c[bS+32>>2]|0;if(aJ>>>0>4294967279>>>0){ay=6601;break}if(aJ>>>0<11>>>0){a[Y]=aJ<<1;bT=Y+1|0}else{aO=tu(aJ+16&-16)|0;c[(Y+8|0)>>2]=aO;c[(Y|0)>>2]=aJ+16&-16|1;c[(Y+4|0)>>2]=aJ;bT=aO}tH(bT|0,aH|0,aJ)|0;a[bT+aJ|0]=0}aJ=(c[(d+28|0)>>2]|0)+(bH*52|0)+8|0;if((aJ|0)==0){hC(19,0,49832,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az}else{c[aJ>>2]=cj(((a[Y]&1)==0?Y+1|0:c[(Y+8|0)>>2]|0)|0)|0}if((a[Y]&1)!=0){tw(c[(Y+8|0)>>2]|0)}if((a[_]&1)!=0){tw(c[(_+8|0)>>2]|0)}c[aa>>2]=bH;aJ=kc(R,aa)|0;a[ab]=16;C=1701603686;a[ab+1|0|0]=C;C=C>>8;a[(ab+1|0|0)+1|0]=C;C=C>>8;a[(ab+1|0|0)+2|0]=C;C=C>>8;a[(ab+1|0|0)+3|0]=C;C=1701667150;a[(ab+1|0)+4|0]=C;C=C>>8;a[((ab+1|0)+4|0)+1|0]=C;C=C>>8;a[((ab+1|0)+4|0)+2|0]=C;C=C>>8;a[((ab+1|0)+4|0)+3|0]=C;a[ab+9|0]=0;aH=kp(aJ,b+408|0,ab)|0;aO=c[aH>>2]|0;if((aO|0)==0){aN=tu(40)|0;do{if((aN+16|0|0)!=0){if((a[ab]&1)==0){c[(aN+16|0)>>2]=c[ab>>2];c[(aN+16|0)+4>>2]=c[ab+4>>2];c[(aN+16|0)+8>>2]=c[ab+8>>2];break}bE=c[(ab+8|0)>>2]|0;bC=c[(ab+4|0)>>2]|0;if(bC>>>0>4294967279>>>0){ay=6622;break L6884}if(bC>>>0<11>>>0){a[aN+16|0]=bC<<1;bU=aN+17|0}else{bD=tu(bC+16&-16)|0;c[aN+24>>2]=bD;c[(aN+16|0)>>2]=bC+16&-16|1;c[aN+20>>2]=bC;bU=bD}tH(bU|0,bE|0,bC)|0;a[bU+bC|0]=0}}while(0);if((aN+28|0|0)!=0){tI(aN+28|0|0,0,12)|0}bG=c[(b+408|0)>>2]|0;c[aN>>2]=0;c[aN+4>>2]=0;c[aN+8>>2]=bG;c[aH>>2]=aN;bG=c[c[(aJ|0)>>2]>>2]|0;if((bG|0)==0){bV=aN}else{c[(aJ|0)>>2]=bG;bV=c[aH>>2]|0}jV(c[aJ+4>>2]|0,bV);c[(aJ+8|0)>>2]=(c[(aJ+8|0)>>2]|0)+1;bW=aN}else{bW=aO}bG=bW+28|0;if((a[bG]&1)==0){c[$>>2]=c[bG>>2];c[$+4>>2]=c[bG+4>>2];c[$+8>>2]=c[bG+8>>2]}else{bG=c[bW+36>>2]|0;Q=c[bW+32>>2]|0;if(Q>>>0>4294967279>>>0){ay=6641;break}if(Q>>>0<11>>>0){a[$]=Q<<1;bX=$+1|0}else{O=tu(Q+16&-16)|0;c[($+8|0)>>2]=O;c[($|0)>>2]=Q+16&-16|1;c[($+4|0)>>2]=Q;bX=O}tH(bX|0,bG|0,Q)|0;a[bX+Q|0]=0}Q=(c[(d+28|0)>>2]|0)+(bH*52|0)+12|0;if((Q|0)==0){hC(19,0,49832,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az}else{c[Q>>2]=cj(((a[$]&1)==0?$+1|0:c[($+8|0)>>2]|0)|0)|0}if((a[$]&1)!=0){tw(c[($+8|0)>>2]|0)}if((a[ab]&1)!=0){tw(c[(ab+8|0)>>2]|0)}c[ad>>2]=bH;Q=kc(R,ad)|0;a[ae]=18;tH(ae+1|0|0,28704,9)|0;a[ae+10|0]=0;bG=kp(Q,b+400|0,ae)|0;O=c[bG>>2]|0;if((O|0)==0){bF=tu(40)|0;do{if((bF+16|0|0)!=0){if((a[ae]&1)==0){c[(bF+16|0)>>2]=c[ae>>2];c[(bF+16|0)+4>>2]=c[ae+4>>2];c[(bF+16|0)+8>>2]=c[ae+8>>2];break}bC=c[(ae+8|0)>>2]|0;bE=c[(ae+4|0)>>2]|0;if(bE>>>0>4294967279>>>0){ay=6662;break L6884}if(bE>>>0<11>>>0){a[bF+16|0]=bE<<1;bY=bF+17|0}else{bD=tu(bE+16&-16)|0;c[bF+24>>2]=bD;c[(bF+16|0)>>2]=bE+16&-16|1;c[bF+20>>2]=bE;bY=bD}tH(bY|0,bC|0,bE)|0;a[bY+bE|0]=0}}while(0);if((bF+28|0|0)!=0){tI(bF+28|0|0,0,12)|0}aO=c[(b+400|0)>>2]|0;c[bF>>2]=0;c[bF+4>>2]=0;c[bF+8>>2]=aO;c[bG>>2]=bF;aO=c[c[(Q|0)>>2]>>2]|0;if((aO|0)==0){bZ=bF}else{c[(Q|0)>>2]=aO;bZ=c[bG>>2]|0}jV(c[Q+4>>2]|0,bZ);c[(Q+8|0)>>2]=(c[(Q+8|0)>>2]|0)+1;b_=bF}else{b_=O}aO=b_+28|0;if((a[aO]&1)==0){c[ac>>2]=c[aO>>2];c[ac+4>>2]=c[aO+4>>2];c[ac+8>>2]=c[aO+8>>2]}else{aO=c[b_+36>>2]|0;aN=c[b_+32>>2]|0;if(aN>>>0>4294967279>>>0){ay=6681;break}if(aN>>>0<11>>>0){a[ac]=aN<<1;b$=ac+1|0}else{aJ=tu(aN+16&-16)|0;c[(ac+8|0)>>2]=aJ;c[(ac|0)>>2]=aN+16&-16|1;c[(ac+4|0)>>2]=aN;b$=aJ}tH(b$|0,aO|0,aN)|0;a[b$+aN|0]=0}kb(ac,(c[(d+28|0)>>2]|0)+(bH*52|0)+16|0,0);if((a[ac]&1)!=0){tw(c[(ac+8|0)>>2]|0)}if((a[ae]&1)!=0){tw(c[(ae+8|0)>>2]|0)}c[ag>>2]=bH;aN=kc(R,ag)|0;aO=tu(16)|0;c[(ah+8|0)>>2]=aO;c[(ah|0)>>2]=17;c[(ah+4|0)>>2]=11;tH(aO|0,28120,11)|0;a[aO+11|0]=0;aO=kp(aN,b+392|0,ah)|0;aJ=c[aO>>2]|0;if((aJ|0)==0){aH=tu(40)|0;do{if((aH+16|0|0)!=0){if((a[ah]&1)==0){c[(aH+16|0)>>2]=c[ah>>2];c[(aH+16|0)+4>>2]=c[ah+4>>2];c[(aH+16|0)+8>>2]=c[ah+8>>2];break}bE=c[(ah+8|0)>>2]|0;bC=c[(ah+4|0)>>2]|0;if(bC>>>0>4294967279>>>0){ay=6700;break L6884}if(bC>>>0<11>>>0){a[aH+16|0]=bC<<1;b0=aH+17|0}else{bD=tu(bC+16&-16)|0;c[aH+24>>2]=bD;c[(aH+16|0)>>2]=bC+16&-16|1;c[aH+20>>2]=bC;b0=bD}tH(b0|0,bE|0,bC)|0;a[b0+bC|0]=0}}while(0);if((aH+28|0|0)!=0){tI(aH+28|0|0,0,12)|0}O=c[(b+392|0)>>2]|0;c[aH>>2]=0;c[aH+4>>2]=0;c[aH+8>>2]=O;c[aO>>2]=aH;O=c[c[(aN|0)>>2]>>2]|0;if((O|0)==0){b1=aH}else{c[(aN|0)>>2]=O;b1=c[aO>>2]|0}jV(c[aN+4>>2]|0,b1);c[(aN+8|0)>>2]=(c[(aN+8|0)>>2]|0)+1;b2=aH}else{b2=aJ}O=b2+28|0;if((a[O]&1)==0){c[af>>2]=c[O>>2];c[af+4>>2]=c[O+4>>2];c[af+8>>2]=c[O+8>>2]}else{O=c[b2+36>>2]|0;bF=c[b2+32>>2]|0;if(bF>>>0>4294967279>>>0){ay=6719;break}if(bF>>>0<11>>>0){a[af]=bF<<1;b3=af+1|0}else{Q=tu(bF+16&-16)|0;c[(af+8|0)>>2]=Q;c[(af|0)>>2]=bF+16&-16|1;c[(af+4|0)>>2]=bF;b3=Q}tH(b3|0,O|0,bF)|0;a[b3+bF|0]=0}kb(af,(c[(d+28|0)>>2]|0)+(bH*52|0)+20|0,0);if((a[af]&1)!=0){tw(c[(af+8|0)>>2]|0)}if((a[ah]&1)!=0){tw(c[(ah+8|0)>>2]|0)}c[aj>>2]=bH;bF=kc(R,aj)|0;a[ak]=14;a[ak+1|0]=a[27080]|0;a[(ak+1|0)+1|0]=a[27081]|0;a[(ak+1|0)+2|0]=a[27082]|0;a[(ak+1|0)+3|0]=a[27083]|0;a[(ak+1|0)+4|0]=a[27084]|0;a[(ak+1|0)+5|0]=a[27085]|0;a[(ak+1|0)+6|0]=a[27086]|0;a[ak+8|0]=0;O=kp(bF,b+384|0,ak)|0;Q=c[O>>2]|0;if((Q|0)==0){bG=tu(40)|0;do{if((bG+16|0|0)!=0){if((a[ak]&1)==0){c[(bG+16|0)>>2]=c[ak>>2];c[(bG+16|0)+4>>2]=c[ak+4>>2];c[(bG+16|0)+8>>2]=c[ak+8>>2];break}bC=c[(ak+8|0)>>2]|0;bE=c[(ak+4|0)>>2]|0;if(bE>>>0>4294967279>>>0){ay=6737;break L6884}if(bE>>>0<11>>>0){a[bG+16|0]=bE<<1;b4=bG+17|0}else{bD=tu(bE+16&-16)|0;c[bG+24>>2]=bD;c[(bG+16|0)>>2]=bE+16&-16|1;c[bG+20>>2]=bE;b4=bD}tH(b4|0,bC|0,bE)|0;a[b4+bE|0]=0}}while(0);if((bG+28|0|0)!=0){tI(bG+28|0|0,0,12)|0}aJ=c[(b+384|0)>>2]|0;c[bG>>2]=0;c[bG+4>>2]=0;c[bG+8>>2]=aJ;c[O>>2]=bG;aJ=c[c[(bF|0)>>2]>>2]|0;if((aJ|0)==0){b5=bG}else{c[(bF|0)>>2]=aJ;b5=c[O>>2]|0}jV(c[bF+4>>2]|0,b5);c[(bF+8|0)>>2]=(c[(bF+8|0)>>2]|0)+1;b6=bG}else{b6=Q}aJ=b6+28|0;if((a[aJ]&1)==0){c[ai>>2]=c[aJ>>2];c[ai+4>>2]=c[aJ+4>>2];c[ai+8>>2]=c[aJ+8>>2]}else{aJ=c[b6+36>>2]|0;aH=c[b6+32>>2]|0;if(aH>>>0>4294967279>>>0){ay=6756;break}if(aH>>>0<11>>>0){a[ai]=aH<<1;b7=ai+1|0}else{aN=tu(aH+16&-16)|0;c[(ai+8|0)>>2]=aN;c[(ai|0)>>2]=aH+16&-16|1;c[(ai+4|0)>>2]=aH;b7=aN}tH(b7|0,aJ|0,aH)|0;a[b7+aH|0]=0}kb(ai,(c[(d+28|0)>>2]|0)+(bH*52|0)+24|0,0);if((a[ai]&1)!=0){tw(c[(ai+8|0)>>2]|0)}if((a[ak]&1)!=0){tw(c[(ak+8|0)>>2]|0)}c[am>>2]=bH;aH=kc(R,am)|0;a[an]=18;tH(an+1|0|0,26600,9)|0;a[an+10|0]=0;aJ=kp(aH,b+376|0,an)|0;aN=c[aJ>>2]|0;if((aN|0)==0){aO=tu(40)|0;do{if((aO+16|0|0)!=0){if((a[an]&1)==0){c[(aO+16|0)>>2]=c[an>>2];c[(aO+16|0)+4>>2]=c[an+4>>2];c[(aO+16|0)+8>>2]=c[an+8>>2];break}bE=c[(an+8|0)>>2]|0;bC=c[(an+4|0)>>2]|0;if(bC>>>0>4294967279>>>0){ay=6774;break L6884}if(bC>>>0<11>>>0){a[aO+16|0]=bC<<1;b8=aO+17|0}else{bD=tu(bC+16&-16)|0;c[aO+24>>2]=bD;c[(aO+16|0)>>2]=bC+16&-16|1;c[aO+20>>2]=bC;b8=bD}tH(b8|0,bE|0,bC)|0;a[b8+bC|0]=0}}while(0);if((aO+28|0|0)!=0){tI(aO+28|0|0,0,12)|0}Q=c[(b+376|0)>>2]|0;c[aO>>2]=0;c[aO+4>>2]=0;c[aO+8>>2]=Q;c[aJ>>2]=aO;Q=c[c[(aH|0)>>2]>>2]|0;if((Q|0)==0){b9=aO}else{c[(aH|0)>>2]=Q;b9=c[aJ>>2]|0}jV(c[aH+4>>2]|0,b9);c[(aH+8|0)>>2]=(c[(aH+8|0)>>2]|0)+1;ca=aO}else{ca=aN}Q=ca+28|0;if((a[Q]&1)==0){c[al>>2]=c[Q>>2];c[al+4>>2]=c[Q+4>>2];c[al+8>>2]=c[Q+8>>2]}else{Q=c[ca+36>>2]|0;bG=c[ca+32>>2]|0;if(bG>>>0>4294967279>>>0){ay=6793;break}if(bG>>>0<11>>>0){a[al]=bG<<1;cb=al+1|0}else{bF=tu(bG+16&-16)|0;c[(al+8|0)>>2]=bF;c[(al|0)>>2]=bG+16&-16|1;c[(al+4|0)>>2]=bG;cb=bF}tH(cb|0,Q|0,bG)|0;a[cb+bG|0]=0}kb(al,(c[(d+28|0)>>2]|0)+(bH*52|0)+28|0,0);if((a[al]&1)!=0){tw(c[(al+8|0)>>2]|0)}if((a[an]&1)!=0){tw(c[(an+8|0)>>2]|0)}c[ap>>2]=bH;bG=kc(R,ap)|0;Q=tu(16)|0;c[(aq+8|0)>>2]=Q;c[(aq|0)>>2]=17;c[(aq+4|0)>>2]=12;tH(Q|0,25696,12)|0;a[Q+12|0]=0;Q=kp(bG,b+368|0,aq)|0;bF=c[Q>>2]|0;if((bF|0)==0){O=tu(40)|0;do{if((O+16|0|0)!=0){if((a[aq]&1)==0){c[(O+16|0)>>2]=c[aq>>2];c[(O+16|0)+4>>2]=c[aq+4>>2];c[(O+16|0)+8>>2]=c[aq+8>>2];break}bC=c[(aq+8|0)>>2]|0;bE=c[(aq+4|0)>>2]|0;if(bE>>>0>4294967279>>>0){ay=6812;break L6884}if(bE>>>0<11>>>0){a[O+16|0]=bE<<1;cc=O+17|0}else{bD=tu(bE+16&-16)|0;c[O+24>>2]=bD;c[(O+16|0)>>2]=bE+16&-16|1;c[O+20>>2]=bE;cc=bD}tH(cc|0,bC|0,bE)|0;a[cc+bE|0]=0}}while(0);if((O+28|0|0)!=0){tI(O+28|0|0,0,12)|0}aN=c[(b+368|0)>>2]|0;c[O>>2]=0;c[O+4>>2]=0;c[O+8>>2]=aN;c[Q>>2]=O;aN=c[c[(bG|0)>>2]>>2]|0;if((aN|0)==0){cd=O}else{c[(bG|0)>>2]=aN;cd=c[Q>>2]|0}jV(c[bG+4>>2]|0,cd);c[(bG+8|0)>>2]=(c[(bG+8|0)>>2]|0)+1;ce=O}else{ce=bF}aN=ce+28|0;if((a[aN]&1)==0){c[ao>>2]=c[aN>>2];c[ao+4>>2]=c[aN+4>>2];c[ao+8>>2]=c[aN+8>>2]}else{aN=c[ce+36>>2]|0;aO=c[ce+32>>2]|0;if(aO>>>0>4294967279>>>0){ay=6831;break}if(aO>>>0<11>>>0){a[ao]=aO<<1;cf=ao+1|0}else{aH=tu(aO+16&-16)|0;c[(ao+8|0)>>2]=aH;c[(ao|0)>>2]=aO+16&-16|1;c[(ao+4|0)>>2]=aO;cf=aH}tH(cf|0,aN|0,aO)|0;a[cf+aO|0]=0}kb(ao,(c[(d+28|0)>>2]|0)+(bH*52|0)+32|0,0);if((a[ao]&1)!=0){tw(c[(ao+8|0)>>2]|0)}if((a[aq]&1)!=0){tw(c[(aq+8|0)>>2]|0)}c[as>>2]=bH;aO=kc(R,as)|0;a[at]=16;C=1399157621;a[at+1|0|0]=C;C=C>>8;a[(at+1|0|0)+1|0]=C;C=C>>8;a[(at+1|0|0)+2|0]=C;C=C>>8;a[(at+1|0|0)+3|0]=C;C=1953653108;a[(at+1|0)+4|0]=C;C=C>>8;a[((at+1|0)+4|0)+1|0]=C;C=C>>8;a[((at+1|0)+4|0)+2|0]=C;C=C>>8;a[((at+1|0)+4|0)+3|0]=C;a[at+9|0]=0;aN=kp(aO,b+360|0,at)|0;aH=c[aN>>2]|0;if((aH|0)==0){aJ=tu(40)|0;do{if((aJ+16|0|0)!=0){if((a[at]&1)==0){c[(aJ+16|0)>>2]=c[at>>2];c[(aJ+16|0)+4>>2]=c[at+4>>2];c[(aJ+16|0)+8>>2]=c[at+8>>2];break}bE=c[(at+8|0)>>2]|0;bC=c[(at+4|0)>>2]|0;if(bC>>>0>4294967279>>>0){ay=6849;break L6884}if(bC>>>0<11>>>0){a[aJ+16|0]=bC<<1;cg=aJ+17|0}else{bD=tu(bC+16&-16)|0;c[aJ+24>>2]=bD;c[(aJ+16|0)>>2]=bC+16&-16|1;c[aJ+20>>2]=bC;cg=bD}tH(cg|0,bE|0,bC)|0;a[cg+bC|0]=0}}while(0);if((aJ+28|0|0)!=0){tI(aJ+28|0|0,0,12)|0}bF=c[(b+360|0)>>2]|0;c[aJ>>2]=0;c[aJ+4>>2]=0;c[aJ+8>>2]=bF;c[aN>>2]=aJ;bF=c[c[(aO|0)>>2]>>2]|0;if((bF|0)==0){ch=aJ}else{c[(aO|0)>>2]=bF;ch=c[aN>>2]|0}jV(c[aO+4>>2]|0,ch);c[(aO+8|0)>>2]=(c[(aO+8|0)>>2]|0)+1;ci=aJ}else{ci=aH}bF=ci+28|0;if((a[bF]&1)==0){c[ar>>2]=c[bF>>2];c[ar+4>>2]=c[bF+4>>2];c[ar+8>>2]=c[bF+8>>2];ck=a[ar]|0}else{bF=c[ci+36>>2]|0;O=c[ci+32>>2]|0;if(O>>>0>4294967279>>>0){ay=6868;break}if(O>>>0<11>>>0){a[ar]=O<<1&255;cl=ar+1|0;cm=O<<1&255}else{bG=tu(O+16&-16)|0;c[(ar+8|0)>>2]=bG;c[(ar|0)>>2]=O+16&-16|1;c[(ar+4|0)>>2]=O;cl=bG;cm=(O+16&-16|1)&255}tH(cl|0,bF|0,O)|0;a[cl+O|0]=0;ck=cm}O=(c[(d+28|0)>>2]|0)+(bH*52|0)+40|0;bF=ck&255;bG=(bF&1|0)==0?bF>>>1:c[(ar+4|0)>>2]|0;bF=(ck&1)==0;Q=c[(ar+8|0)>>2]|0;bC=tK((bF?ar+1|0:Q)|0,42e3,(bG>>>0>4>>>0?4:bG)|0)|0;if((bC|0)==0){cn=bG>>>0<4>>>0?-1:bG>>>0>4>>>0&1}else{cn=bC}a[O]=(cn|0)==0|0;if(!bF){tw(Q)}if((a[at]&1)!=0){tw(c[(at+8|0)>>2]|0)}c[av>>2]=bH;Q=kc(R,av)|0;a[aw]=10;a[aw+1|0]=a[39368]|0;a[(aw+1|0)+1|0]=a[39369]|0;a[(aw+1|0)+2|0]=a[39370]|0;a[(aw+1|0)+3|0]=a[39371]|0;a[(aw+1|0)+4|0]=a[39372]|0;a[aw+6|0]=0;bF=kp(Q,b+352|0,aw)|0;O=c[bF>>2]|0;if((O|0)==0){bC=tu(40)|0;do{if((bC+16|0|0)!=0){if((a[aw]&1)==0){c[(bC+16|0)>>2]=c[aw>>2];c[(bC+16|0)+4>>2]=c[aw+4>>2];c[(bC+16|0)+8>>2]=c[aw+8>>2];break}bG=c[(aw+8|0)>>2]|0;bE=c[(aw+4|0)>>2]|0;if(bE>>>0>4294967279>>>0){ay=6888;break L6884}if(bE>>>0<11>>>0){a[bC+16|0]=bE<<1;co=bC+17|0}else{bD=tu(bE+16&-16)|0;c[bC+24>>2]=bD;c[(bC+16|0)>>2]=bE+16&-16|1;c[bC+20>>2]=bE;co=bD}tH(co|0,bG|0,bE)|0;a[co+bE|0]=0}}while(0);if((bC+28|0|0)!=0){tI(bC+28|0|0,0,12)|0}aH=c[(b+352|0)>>2]|0;c[bC>>2]=0;c[bC+4>>2]=0;c[bC+8>>2]=aH;c[bF>>2]=bC;aH=c[c[(Q|0)>>2]>>2]|0;if((aH|0)==0){cp=bC}else{c[(Q|0)>>2]=aH;cp=c[bF>>2]|0}jV(c[Q+4>>2]|0,cp);c[(Q+8|0)>>2]=(c[(Q+8|0)>>2]|0)+1;cq=bC}else{cq=O}aH=cq+28|0;if((a[aH]&1)==0){c[au>>2]=c[aH>>2];c[au+4>>2]=c[aH+4>>2];c[au+8>>2]=c[aH+8>>2]}else{aH=c[cq+36>>2]|0;aJ=c[cq+32>>2]|0;if(aJ>>>0>4294967279>>>0){ay=6907;break}if(aJ>>>0<11>>>0){a[au]=aJ<<1;cr=au+1|0}else{aO=tu(aJ+16&-16)|0;c[(au+8|0)>>2]=aO;c[(au|0)>>2]=aJ+16&-16|1;c[(au+4|0)>>2]=aJ;cr=aO}tH(cr|0,aH|0,aJ)|0;a[cr+aJ|0]=0}aJ=(c[(d+28|0)>>2]|0)+(bH*52|0)+44|0;if((aJ|0)==0){hC(19,0,49832,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az}else{c[aJ>>2]=cj(((a[au]&1)==0?au+1|0:c[(au+8|0)>>2]|0)|0)|0}if((a[au]&1)!=0){tw(c[(au+8|0)>>2]|0)}if((a[aw]&1)!=0){tw(c[(aw+8|0)>>2]|0)}aJ=c[(d+28|0)>>2]|0;aH=(a[aJ+(bH*52|0)+40|0]|0)!=0;aO=c[aJ+(bH*52|0)+44>>2]|0;hA(4,0,57624,(az=i,i=i+32|0,c[az>>2]=c[aJ+(bH*52|0)+4>>2],c[az+8>>2]=aH?93904:24160,c[az+16>>2]=aO,c[az+24>>2]=aH?93904:24064,az)|0);i=az;aH=c[(d+28|0)>>2]|0;aO=c[aH+(bH*52|0)+4>>2]|0;if((a[aO]|0)==36){a[aH+(bH*52|0)+48|0]=1;cs=c[(c[(d+28|0)>>2]|0)+(bH*52|0)+4>>2]|0}else{cs=aO}aO=tD(cs|0)|0;if(aO>>>0>4294967279>>>0){ay=6975;break}if(aO>>>0<11>>>0){a[ax]=aO<<1;ct=ax+1|0}else{aH=tu(aO+16&-16)|0;c[(ax+8|0)>>2]=aH;c[(ax|0)>>2]=aO+16&-16|1;c[(ax+4|0)>>2]=aO;ct=aH}tH(ct|0,cs|0,aO)|0;a[ct+aO|0]=0;c[(ke(e,ax)|0)>>2]=bH;if((a[ax]&1)!=0){tw(c[(ax+8|0)>>2]|0)}bH=bH+1|0;if((bH|0)>=(c[(d+140|0)>>2]|0)){break L6882}}if((ay|0)==6503){ml(0)}else if((ay|0)==6522){ml(0)}else if((ay|0)==6544){ml(0)}else if((ay|0)==6563){ml(0)}else if((ay|0)==6582){ml(0)}else if((ay|0)==6601){ml(0)}else if((ay|0)==6622){ml(0)}else if((ay|0)==6641){ml(0)}else if((ay|0)==6662){ml(0)}else if((ay|0)==6681){ml(0)}else if((ay|0)==6700){ml(0)}else if((ay|0)==6719){ml(0)}else if((ay|0)==6737){ml(0)}else if((ay|0)==6756){ml(0)}else if((ay|0)==6774){ml(0)}else if((ay|0)==6793){ml(0)}else if((ay|0)==6812){ml(0)}else if((ay|0)==6831){ml(0)}else if((ay|0)==6849){ml(0)}else if((ay|0)==6868){ml(0)}else if((ay|0)==6888){ml(0)}else if((ay|0)==6907){ml(0)}else if((ay|0)==6975){ml(0)}}}while(0);if((c[17800]|0)!=0){dd[c[3504]&511](4)}hA(4,1,57536,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az;c[b+39768>>2]=ay;c[b+39776>>2]=az}function _read_input_xml$3(b){b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0.0,bC=0.0,bD=0.0,bE=0.0,bF=0,bG=0;d=c[b+1904>>2]|0;e=c[b+1936>>2]|0;f=c[b+4424>>2]|0;g=c[b+4432>>2]|0;j=c[b+4440>>2]|0;k=c[b+4448>>2]|0;l=c[b+4456>>2]|0;m=c[b+4464>>2]|0;n=c[b+4472>>2]|0;o=c[b+4480>>2]|0;p=c[b+4488>>2]|0;q=c[b+4496>>2]|0;r=c[b+4504>>2]|0;s=c[b+4512>>2]|0;t=c[b+4520>>2]|0;u=c[b+4528>>2]|0;v=c[b+4536>>2]|0;w=c[b+4544>>2]|0;x=c[b+4552>>2]|0;y=c[b+4560>>2]|0;z=c[b+4568>>2]|0;A=c[b+4576>>2]|0;B=c[b+4584>>2]|0;D=c[b+4592>>2]|0;E=c[b+4600>>2]|0;F=c[b+4608>>2]|0;G=c[b+4616>>2]|0;H=c[b+4624>>2]|0;I=c[b+4632>>2]|0;J=c[b+4640>>2]|0;K=c[b+4648>>2]|0;L=c[b+4656>>2]|0;M=c[b+4664>>2]|0;N=c[b+4672>>2]|0;O=c[b+4680>>2]|0;P=c[b+4688>>2]|0;Q=c[b+4696>>2]|0;R=c[b+4704>>2]|0;S=c[b+4712>>2]|0;T=c[b+4720>>2]|0;U=c[b+4728>>2]|0;V=c[b+4736>>2]|0;W=c[b+4744>>2]|0;X=c[b+4752>>2]|0;Y=c[b+4760>>2]|0;Z=c[b+4768>>2]|0;_=c[b+4776>>2]|0;$=c[b+4784>>2]|0;aa=c[b+4792>>2]|0;ab=c[b+4800>>2]|0;ac=c[b+4808>>2]|0;ad=c[b+23896>>2]|0;ae=c[b+39768>>2]|0;af=c[b+39776>>2]|0;OL:do{ag=0;L4934:while(1){c[g>>2]=ag;ah=kc(ad,g)|0;a[j]=8;C=1701667182;a[j+1|0]=C;C=C>>8;a[(j+1|0)+1|0]=C;C=C>>8;a[(j+1|0)+2|0]=C;C=C>>8;a[(j+1|0)+3|0]=C;a[j+5|0]=0;ai=kp(ah,b+768|0,j)|0;aj=c[ai>>2]|0;if((aj|0)==0){ak=tu(40)|0;do{if((ak+16|0|0)!=0){if((a[j]&1)==0){c[(ak+16|0)>>2]=c[j>>2];c[(ak+16|0)+4>>2]=c[j+4>>2];c[(ak+16|0)+8>>2]=c[j+8>>2];break}al=c[(j+8|0)>>2]|0;am=c[(j+4|0)>>2]|0;if(am>>>0>4294967279>>>0){ae=4636;break L4934}if(am>>>0<11>>>0){a[ak+16|0]=am<<1;an=ak+17|0}else{ao=tu(am+16&-16)|0;c[ak+24>>2]=ao;c[(ak+16|0)>>2]=am+16&-16|1;c[ak+20>>2]=am;an=ao}tH(an|0,al|0,am)|0;a[an+am|0]=0}}while(0);if((ak+28|0|0)!=0){tI(ak+28|0|0,0,12)|0}am=c[(b+768|0)>>2]|0;c[ak>>2]=0;c[ak+4>>2]=0;c[ak+8>>2]=am;c[ai>>2]=ak;am=c[c[(ah|0)>>2]>>2]|0;if((am|0)==0){ap=ak}else{c[(ah|0)>>2]=am;ap=c[ai>>2]|0}jV(c[ah+4>>2]|0,ap);c[(ah+8|0)>>2]=(c[(ah+8|0)>>2]|0)+1;aq=ak}else{aq=aj}am=aq+28|0;if((a[am]&1)==0){c[f>>2]=c[am>>2];c[f+4>>2]=c[am+4>>2];c[f+8>>2]=c[am+8>>2]}else{am=c[aq+36>>2]|0;al=c[aq+32>>2]|0;if(al>>>0>4294967279>>>0){ae=4655;break}if(al>>>0<11>>>0){a[f]=al<<1;ar=f+1|0}else{ao=tu(al+16&-16)|0;c[(f+8|0)>>2]=ao;c[(f|0)>>2]=al+16&-16|1;c[(f+4|0)>>2]=al;ar=ao}tH(ar|0,am|0,al)|0;a[ar+al|0]=0}al=(c[(d+16|0)>>2]|0)+(ag*112|0)+4|0;if((al|0)==0){hC(19,0,49832,(af=i,i=i+1|0,i=i+7&-8,c[af>>2]=0,af)|0);i=af}else{c[al>>2]=cj(((a[f]&1)==0?f+1|0:c[(f+8|0)>>2]|0)|0)|0}if((a[f]&1)!=0){tw(c[(f+8|0)>>2]|0)}if((a[j]&1)!=0){tw(c[(j+8|0)>>2]|0)}c[l>>2]=ag;al=kc(ad,l)|0;am=tu(16)|0;c[(m+8|0)>>2]=am;c[(m|0)>>2]=17;c[(m+4|0)>>2]=14;tH(am|0,30344,14)|0;a[am+14|0]=0;am=kp(al,b+760|0,m)|0;ao=c[am>>2]|0;if((ao|0)==0){as=tu(40)|0;do{if((as+16|0|0)!=0){if((a[m]&1)==0){c[(as+16|0)>>2]=c[m>>2];c[(as+16|0)+4>>2]=c[m+4>>2];c[(as+16|0)+8>>2]=c[m+8>>2];break}at=c[(m+8|0)>>2]|0;au=c[(m+4|0)>>2]|0;if(au>>>0>4294967279>>>0){ae=4677;break L4934}if(au>>>0<11>>>0){a[as+16|0]=au<<1;av=as+17|0}else{aw=tu(au+16&-16)|0;c[as+24>>2]=aw;c[(as+16|0)>>2]=au+16&-16|1;c[as+20>>2]=au;av=aw}tH(av|0,at|0,au)|0;a[av+au|0]=0}}while(0);if((as+28|0|0)!=0){tI(as+28|0|0,0,12)|0}aj=c[(b+760|0)>>2]|0;c[as>>2]=0;c[as+4>>2]=0;c[as+8>>2]=aj;c[am>>2]=as;aj=c[c[(al|0)>>2]>>2]|0;if((aj|0)==0){ax=as}else{c[(al|0)>>2]=aj;ax=c[am>>2]|0}jV(c[al+4>>2]|0,ax);c[(al+8|0)>>2]=(c[(al+8|0)>>2]|0)+1;ay=as}else{ay=ao}aj=ay+28|0;if((a[aj]&1)==0){c[k>>2]=c[aj>>2];c[k+4>>2]=c[aj+4>>2];c[k+8>>2]=c[aj+8>>2]}else{aj=c[ay+36>>2]|0;ak=c[ay+32>>2]|0;if(ak>>>0>4294967279>>>0){ae=4696;break}if(ak>>>0<11>>>0){a[k]=ak<<1;az=k+1|0}else{ah=tu(ak+16&-16)|0;c[(k+8|0)>>2]=ah;c[(k|0)>>2]=ak+16&-16|1;c[(k+4|0)>>2]=ak;az=ah}tH(az|0,aj|0,ak)|0;a[az+ak|0]=0}kd(k,(c[(d+16|0)>>2]|0)+(ag*112|0)|0);if((a[k]&1)!=0){tw(c[(k+8|0)>>2]|0)}if((a[m]&1)!=0){tw(c[(m+8|0)>>2]|0)}c[o>>2]=ag;ak=kc(ad,o)|0;aj=tu(16)|0;c[(p+8|0)>>2]=aj;c[(p|0)>>2]=17;c[(p+4|0)>>2]=11;tH(aj|0,3e4,11)|0;a[aj+11|0]=0;aj=kp(ak,b+752|0,p)|0;ah=c[aj>>2]|0;if((ah|0)==0){ai=tu(40)|0;do{if((ai+16|0|0)!=0){if((a[p]&1)==0){c[(ai+16|0)>>2]=c[p>>2];c[(ai+16|0)+4>>2]=c[p+4>>2];c[(ai+16|0)+8>>2]=c[p+8>>2];break}au=c[(p+8|0)>>2]|0;at=c[(p+4|0)>>2]|0;if(at>>>0>4294967279>>>0){ae=4715;break L4934}if(at>>>0<11>>>0){a[ai+16|0]=at<<1;aA=ai+17|0}else{aw=tu(at+16&-16)|0;c[ai+24>>2]=aw;c[(ai+16|0)>>2]=at+16&-16|1;c[ai+20>>2]=at;aA=aw}tH(aA|0,au|0,at)|0;a[aA+at|0]=0}}while(0);if((ai+28|0|0)!=0){tI(ai+28|0|0,0,12)|0}ao=c[(b+752|0)>>2]|0;c[ai>>2]=0;c[ai+4>>2]=0;c[ai+8>>2]=ao;c[aj>>2]=ai;ao=c[c[(ak|0)>>2]>>2]|0;if((ao|0)==0){aB=ai}else{c[(ak|0)>>2]=ao;aB=c[aj>>2]|0}jV(c[ak+4>>2]|0,aB);c[(ak+8|0)>>2]=(c[(ak+8|0)>>2]|0)+1;aC=ai}else{aC=ah}ao=aC+28|0;if((a[ao]&1)==0){c[n>>2]=c[ao>>2];c[n+4>>2]=c[ao+4>>2];c[n+8>>2]=c[ao+8>>2]}else{ao=c[aC+36>>2]|0;as=c[aC+32>>2]|0;if(as>>>0>4294967279>>>0){ae=4734;break}if(as>>>0<11>>>0){a[n]=as<<1;aD=n+1|0}else{al=tu(as+16&-16)|0;c[(n+8|0)>>2]=al;c[(n|0)>>2]=as+16&-16|1;c[(n+4|0)>>2]=as;aD=al}tH(aD|0,ao|0,as)|0;a[aD+as|0]=0}as=(c[(d+16|0)>>2]|0)+(ag*112|0)+8|0;if((as|0)==0){hC(19,0,49832,(af=i,i=i+1|0,i=i+7&-8,c[af>>2]=0,af)|0);i=af}else{c[as>>2]=cj(((a[n]&1)==0?n+1|0:c[(n+8|0)>>2]|0)|0)|0}if((a[n]&1)!=0){tw(c[(n+8|0)>>2]|0)}if((a[p]&1)!=0){tw(c[(p+8|0)>>2]|0)}c[r>>2]=ag;as=kc(ad,r)|0;a[s]=16;C=1701603686;a[s+1|0|0]=C;C=C>>8;a[(s+1|0|0)+1|0]=C;C=C>>8;a[(s+1|0|0)+2|0]=C;C=C>>8;a[(s+1|0|0)+3|0]=C;C=1701667150;a[(s+1|0)+4|0]=C;C=C>>8;a[((s+1|0)+4|0)+1|0]=C;C=C>>8;a[((s+1|0)+4|0)+2|0]=C;C=C>>8;a[((s+1|0)+4|0)+3|0]=C;a[s+9|0]=0;ao=kp(as,b+744|0,s)|0;al=c[ao>>2]|0;if((al|0)==0){am=tu(40)|0;do{if((am+16|0|0)!=0){if((a[s]&1)==0){c[(am+16|0)>>2]=c[s>>2];c[(am+16|0)+4>>2]=c[s+4>>2];c[(am+16|0)+8>>2]=c[s+8>>2];break}at=c[(s+8|0)>>2]|0;au=c[(s+4|0)>>2]|0;if(au>>>0>4294967279>>>0){ae=4755;break L4934}if(au>>>0<11>>>0){a[am+16|0]=au<<1;aE=am+17|0}else{aw=tu(au+16&-16)|0;c[am+24>>2]=aw;c[(am+16|0)>>2]=au+16&-16|1;c[am+20>>2]=au;aE=aw}tH(aE|0,at|0,au)|0;a[aE+au|0]=0}}while(0);if((am+28|0|0)!=0){tI(am+28|0|0,0,12)|0}ah=c[(b+744|0)>>2]|0;c[am>>2]=0;c[am+4>>2]=0;c[am+8>>2]=ah;c[ao>>2]=am;ah=c[c[(as|0)>>2]>>2]|0;if((ah|0)==0){aF=am}else{c[(as|0)>>2]=ah;aF=c[ao>>2]|0}jV(c[as+4>>2]|0,aF);c[(as+8|0)>>2]=(c[(as+8|0)>>2]|0)+1;aG=am}else{aG=al}ah=aG+28|0;if((a[ah]&1)==0){c[q>>2]=c[ah>>2];c[q+4>>2]=c[ah+4>>2];c[q+8>>2]=c[ah+8>>2]}else{ah=c[aG+36>>2]|0;ai=c[aG+32>>2]|0;if(ai>>>0>4294967279>>>0){ae=4774;break}if(ai>>>0<11>>>0){a[q]=ai<<1;aH=q+1|0}else{ak=tu(ai+16&-16)|0;c[(q+8|0)>>2]=ak;c[(q|0)>>2]=ai+16&-16|1;c[(q+4|0)>>2]=ai;aH=ak}tH(aH|0,ah|0,ai)|0;a[aH+ai|0]=0}ai=(c[(d+16|0)>>2]|0)+(ag*112|0)+12|0;if((ai|0)==0){hC(19,0,49832,(af=i,i=i+1|0,i=i+7&-8,c[af>>2]=0,af)|0);i=af}else{c[ai>>2]=cj(((a[q]&1)==0?q+1|0:c[(q+8|0)>>2]|0)|0)|0}if((a[q]&1)!=0){tw(c[(q+8|0)>>2]|0)}if((a[s]&1)!=0){tw(c[(s+8|0)>>2]|0)}c[u>>2]=ag;ai=kc(ad,u)|0;a[v]=18;tH(v+1|0|0,28704,9)|0;a[v+10|0]=0;ah=kp(ai,b+736|0,v)|0;ak=c[ah>>2]|0;if((ak|0)==0){aj=tu(40)|0;do{if((aj+16|0|0)!=0){if((a[v]&1)==0){c[(aj+16|0)>>2]=c[v>>2];c[(aj+16|0)+4>>2]=c[v+4>>2];c[(aj+16|0)+8>>2]=c[v+8>>2];break}au=c[(v+8|0)>>2]|0;at=c[(v+4|0)>>2]|0;if(at>>>0>4294967279>>>0){ae=4795;break L4934}if(at>>>0<11>>>0){a[aj+16|0]=at<<1;aI=aj+17|0}else{aw=tu(at+16&-16)|0;c[aj+24>>2]=aw;c[(aj+16|0)>>2]=at+16&-16|1;c[aj+20>>2]=at;aI=aw}tH(aI|0,au|0,at)|0;a[aI+at|0]=0}}while(0);if((aj+28|0|0)!=0){tI(aj+28|0|0,0,12)|0}al=c[(b+736|0)>>2]|0;c[aj>>2]=0;c[aj+4>>2]=0;c[aj+8>>2]=al;c[ah>>2]=aj;al=c[c[(ai|0)>>2]>>2]|0;if((al|0)==0){aJ=aj}else{c[(ai|0)>>2]=al;aJ=c[ah>>2]|0}jV(c[ai+4>>2]|0,aJ);c[(ai+8|0)>>2]=(c[(ai+8|0)>>2]|0)+1;aK=aj}else{aK=ak}al=aK+28|0;if((a[al]&1)==0){c[t>>2]=c[al>>2];c[t+4>>2]=c[al+4>>2];c[t+8>>2]=c[al+8>>2]}else{al=c[aK+36>>2]|0;am=c[aK+32>>2]|0;if(am>>>0>4294967279>>>0){ae=4814;break}if(am>>>0<11>>>0){a[t]=am<<1;aL=t+1|0}else{as=tu(am+16&-16)|0;c[(t+8|0)>>2]=as;c[(t|0)>>2]=am+16&-16|1;c[(t+4|0)>>2]=am;aL=as}tH(aL|0,al|0,am)|0;a[aL+am|0]=0}kb(t,(c[(d+16|0)>>2]|0)+(ag*112|0)+16|0,0);if((a[t]&1)!=0){tw(c[(t+8|0)>>2]|0)}if((a[v]&1)!=0){tw(c[(v+8|0)>>2]|0)}c[x>>2]=ag;am=kc(ad,x)|0;al=tu(16)|0;c[(y+8|0)>>2]=al;c[(y|0)>>2]=17;c[(y+4|0)>>2]=11;tH(al|0,28120,11)|0;a[al+11|0]=0;al=kp(am,b+728|0,y)|0;as=c[al>>2]|0;if((as|0)==0){ao=tu(40)|0;do{if((ao+16|0|0)!=0){if((a[y]&1)==0){c[(ao+16|0)>>2]=c[y>>2];c[(ao+16|0)+4>>2]=c[y+4>>2];c[(ao+16|0)+8>>2]=c[y+8>>2];break}at=c[(y+8|0)>>2]|0;au=c[(y+4|0)>>2]|0;if(au>>>0>4294967279>>>0){ae=4833;break L4934}if(au>>>0<11>>>0){a[ao+16|0]=au<<1;aM=ao+17|0}else{aw=tu(au+16&-16)|0;c[ao+24>>2]=aw;c[(ao+16|0)>>2]=au+16&-16|1;c[ao+20>>2]=au;aM=aw}tH(aM|0,at|0,au)|0;a[aM+au|0]=0}}while(0);if((ao+28|0|0)!=0){tI(ao+28|0|0,0,12)|0}ak=c[(b+728|0)>>2]|0;c[ao>>2]=0;c[ao+4>>2]=0;c[ao+8>>2]=ak;c[al>>2]=ao;ak=c[c[(am|0)>>2]>>2]|0;if((ak|0)==0){aN=ao}else{c[(am|0)>>2]=ak;aN=c[al>>2]|0}jV(c[am+4>>2]|0,aN);c[(am+8|0)>>2]=(c[(am+8|0)>>2]|0)+1;aO=ao}else{aO=as}ak=aO+28|0;if((a[ak]&1)==0){c[w>>2]=c[ak>>2];c[w+4>>2]=c[ak+4>>2];c[w+8>>2]=c[ak+8>>2]}else{ak=c[aO+36>>2]|0;aj=c[aO+32>>2]|0;if(aj>>>0>4294967279>>>0){ae=4852;break}if(aj>>>0<11>>>0){a[w]=aj<<1;aP=w+1|0}else{ai=tu(aj+16&-16)|0;c[(w+8|0)>>2]=ai;c[(w|0)>>2]=aj+16&-16|1;c[(w+4|0)>>2]=aj;aP=ai}tH(aP|0,ak|0,aj)|0;a[aP+aj|0]=0}kb(w,(c[(d+16|0)>>2]|0)+(ag*112|0)+20|0,0);if((a[w]&1)!=0){tw(c[(w+8|0)>>2]|0)}if((a[y]&1)!=0){tw(c[(y+8|0)>>2]|0)}c[A>>2]=ag;aj=kc(ad,A)|0;a[B]=14;a[B+1|0]=a[27080]|0;a[(B+1|0)+1|0]=a[27081]|0;a[(B+1|0)+2|0]=a[27082]|0;a[(B+1|0)+3|0]=a[27083]|0;a[(B+1|0)+4|0]=a[27084]|0;a[(B+1|0)+5|0]=a[27085]|0;a[(B+1|0)+6|0]=a[27086]|0;a[B+8|0]=0;ak=kp(aj,b+720|0,B)|0;ai=c[ak>>2]|0;if((ai|0)==0){ah=tu(40)|0;do{if((ah+16|0|0)!=0){if((a[B]&1)==0){c[(ah+16|0)>>2]=c[B>>2];c[(ah+16|0)+4>>2]=c[B+4>>2];c[(ah+16|0)+8>>2]=c[B+8>>2];break}au=c[(B+8|0)>>2]|0;at=c[(B+4|0)>>2]|0;if(at>>>0>4294967279>>>0){ae=4870;break L4934}if(at>>>0<11>>>0){a[ah+16|0]=at<<1;aQ=ah+17|0}else{aw=tu(at+16&-16)|0;c[ah+24>>2]=aw;c[(ah+16|0)>>2]=at+16&-16|1;c[ah+20>>2]=at;aQ=aw}tH(aQ|0,au|0,at)|0;a[aQ+at|0]=0}}while(0);if((ah+28|0|0)!=0){tI(ah+28|0|0,0,12)|0}as=c[(b+720|0)>>2]|0;c[ah>>2]=0;c[ah+4>>2]=0;c[ah+8>>2]=as;c[ak>>2]=ah;as=c[c[(aj|0)>>2]>>2]|0;if((as|0)==0){aR=ah}else{c[(aj|0)>>2]=as;aR=c[ak>>2]|0}jV(c[aj+4>>2]|0,aR);c[(aj+8|0)>>2]=(c[(aj+8|0)>>2]|0)+1;aS=ah}else{aS=ai}as=aS+28|0;if((a[as]&1)==0){c[z>>2]=c[as>>2];c[z+4>>2]=c[as+4>>2];c[z+8>>2]=c[as+8>>2]}else{as=c[aS+36>>2]|0;ao=c[aS+32>>2]|0;if(ao>>>0>4294967279>>>0){ae=4889;break}if(ao>>>0<11>>>0){a[z]=ao<<1;aT=z+1|0}else{am=tu(ao+16&-16)|0;c[(z+8|0)>>2]=am;c[(z|0)>>2]=ao+16&-16|1;c[(z+4|0)>>2]=ao;aT=am}tH(aT|0,as|0,ao)|0;a[aT+ao|0]=0}kb(z,(c[(d+16|0)>>2]|0)+(ag*112|0)+24|0,0);if((a[z]&1)!=0){tw(c[(z+8|0)>>2]|0)}if((a[B]&1)!=0){tw(c[(B+8|0)>>2]|0)}c[E>>2]=ag;ao=kc(ad,E)|0;a[F]=18;tH(F+1|0|0,26600,9)|0;a[F+10|0]=0;as=kp(ao,b+712|0,F)|0;am=c[as>>2]|0;if((am|0)==0){al=tu(40)|0;do{if((al+16|0|0)!=0){if((a[F]&1)==0){c[(al+16|0)>>2]=c[F>>2];c[(al+16|0)+4>>2]=c[F+4>>2];c[(al+16|0)+8>>2]=c[F+8>>2];break}at=c[(F+8|0)>>2]|0;au=c[(F+4|0)>>2]|0;if(au>>>0>4294967279>>>0){ae=4907;break L4934}if(au>>>0<11>>>0){a[al+16|0]=au<<1;aU=al+17|0}else{aw=tu(au+16&-16)|0;c[al+24>>2]=aw;c[(al+16|0)>>2]=au+16&-16|1;c[al+20>>2]=au;aU=aw}tH(aU|0,at|0,au)|0;a[aU+au|0]=0}}while(0);if((al+28|0|0)!=0){tI(al+28|0|0,0,12)|0}ai=c[(b+712|0)>>2]|0;c[al>>2]=0;c[al+4>>2]=0;c[al+8>>2]=ai;c[as>>2]=al;ai=c[c[(ao|0)>>2]>>2]|0;if((ai|0)==0){aV=al}else{c[(ao|0)>>2]=ai;aV=c[as>>2]|0}jV(c[ao+4>>2]|0,aV);c[(ao+8|0)>>2]=(c[(ao+8|0)>>2]|0)+1;aW=al}else{aW=am}ai=aW+28|0;if((a[ai]&1)==0){c[D>>2]=c[ai>>2];c[D+4>>2]=c[ai+4>>2];c[D+8>>2]=c[ai+8>>2]}else{ai=c[aW+36>>2]|0;ah=c[aW+32>>2]|0;if(ah>>>0>4294967279>>>0){ae=4926;break}if(ah>>>0<11>>>0){a[D]=ah<<1;aX=D+1|0}else{aj=tu(ah+16&-16)|0;c[(D+8|0)>>2]=aj;c[(D|0)>>2]=ah+16&-16|1;c[(D+4|0)>>2]=ah;aX=aj}tH(aX|0,ai|0,ah)|0;a[aX+ah|0]=0}kb(D,(c[(d+16|0)>>2]|0)+(ag*112|0)+28|0,0);if((a[D]&1)!=0){tw(c[(D+8|0)>>2]|0)}if((a[F]&1)!=0){tw(c[(F+8|0)>>2]|0)}c[H>>2]=ag;ah=kc(ad,H)|0;ai=tu(16)|0;c[(I+8|0)>>2]=ai;c[(I|0)>>2]=17;c[(I+4|0)>>2]=12;tH(ai|0,25696,12)|0;a[ai+12|0]=0;ai=kp(ah,b+704|0,I)|0;aj=c[ai>>2]|0;if((aj|0)==0){ak=tu(40)|0;do{if((ak+16|0|0)!=0){if((a[I]&1)==0){c[(ak+16|0)>>2]=c[I>>2];c[(ak+16|0)+4>>2]=c[I+4>>2];c[(ak+16|0)+8>>2]=c[I+8>>2];break}au=c[(I+8|0)>>2]|0;at=c[(I+4|0)>>2]|0;if(at>>>0>4294967279>>>0){ae=4945;break L4934}if(at>>>0<11>>>0){a[ak+16|0]=at<<1;aY=ak+17|0}else{aw=tu(at+16&-16)|0;c[ak+24>>2]=aw;c[(ak+16|0)>>2]=at+16&-16|1;c[ak+20>>2]=at;aY=aw}tH(aY|0,au|0,at)|0;a[aY+at|0]=0}}while(0);if((ak+28|0|0)!=0){tI(ak+28|0|0,0,12)|0}am=c[(b+704|0)>>2]|0;c[ak>>2]=0;c[ak+4>>2]=0;c[ak+8>>2]=am;c[ai>>2]=ak;am=c[c[(ah|0)>>2]>>2]|0;if((am|0)==0){aZ=ak}else{c[(ah|0)>>2]=am;aZ=c[ai>>2]|0}jV(c[ah+4>>2]|0,aZ);c[(ah+8|0)>>2]=(c[(ah+8|0)>>2]|0)+1;a_=ak}else{a_=aj}am=a_+28|0;if((a[am]&1)==0){c[G>>2]=c[am>>2];c[G+4>>2]=c[am+4>>2];c[G+8>>2]=c[am+8>>2]}else{am=c[a_+36>>2]|0;al=c[a_+32>>2]|0;if(al>>>0>4294967279>>>0){ae=4964;break}if(al>>>0<11>>>0){a[G]=al<<1;a$=G+1|0}else{ao=tu(al+16&-16)|0;c[(G+8|0)>>2]=ao;c[(G|0)>>2]=al+16&-16|1;c[(G+4|0)>>2]=al;a$=ao}tH(a$|0,am|0,al)|0;a[a$+al|0]=0}kb(G,(c[(d+16|0)>>2]|0)+(ag*112|0)+32|0,0);if((a[G]&1)!=0){tw(c[(G+8|0)>>2]|0)}if((a[I]&1)!=0){tw(c[(I+8|0)>>2]|0)}c[K>>2]=ag;al=kc(ad,K)|0;a[L]=16;C=1399157621;a[L+1|0|0]=C;C=C>>8;a[(L+1|0|0)+1|0]=C;C=C>>8;a[(L+1|0|0)+2|0]=C;C=C>>8;a[(L+1|0|0)+3|0]=C;C=1953653108;a[(L+1|0)+4|0]=C;C=C>>8;a[((L+1|0)+4|0)+1|0]=C;C=C>>8;a[((L+1|0)+4|0)+2|0]=C;C=C>>8;a[((L+1|0)+4|0)+3|0]=C;a[L+9|0]=0;am=kp(al,b+696|0,L)|0;ao=c[am>>2]|0;if((ao|0)==0){as=tu(40)|0;do{if((as+16|0|0)!=0){if((a[L]&1)==0){c[(as+16|0)>>2]=c[L>>2];c[(as+16|0)+4>>2]=c[L+4>>2];c[(as+16|0)+8>>2]=c[L+8>>2];break}at=c[(L+8|0)>>2]|0;au=c[(L+4|0)>>2]|0;if(au>>>0>4294967279>>>0){ae=4982;break L4934}if(au>>>0<11>>>0){a[as+16|0]=au<<1;a0=as+17|0}else{aw=tu(au+16&-16)|0;c[as+24>>2]=aw;c[(as+16|0)>>2]=au+16&-16|1;c[as+20>>2]=au;a0=aw}tH(a0|0,at|0,au)|0;a[a0+au|0]=0}}while(0);if((as+28|0|0)!=0){tI(as+28|0|0,0,12)|0}aj=c[(b+696|0)>>2]|0;c[as>>2]=0;c[as+4>>2]=0;c[as+8>>2]=aj;c[am>>2]=as;aj=c[c[(al|0)>>2]>>2]|0;if((aj|0)==0){a1=as}else{c[(al|0)>>2]=aj;a1=c[am>>2]|0}jV(c[al+4>>2]|0,a1);c[(al+8|0)>>2]=(c[(al+8|0)>>2]|0)+1;a2=as}else{a2=ao}aj=a2+28|0;if((a[aj]&1)==0){c[J>>2]=c[aj>>2];c[J+4>>2]=c[aj+4>>2];c[J+8>>2]=c[aj+8>>2];a3=a[J]|0}else{aj=c[a2+36>>2]|0;ak=c[a2+32>>2]|0;if(ak>>>0>4294967279>>>0){ae=5001;break}if(ak>>>0<11>>>0){a[J]=ak<<1&255;a4=J+1|0;a5=ak<<1&255}else{ah=tu(ak+16&-16)|0;c[(J+8|0)>>2]=ah;c[(J|0)>>2]=ak+16&-16|1;c[(J+4|0)>>2]=ak;a4=ah;a5=(ak+16&-16|1)&255}tH(a4|0,aj|0,ak)|0;a[a4+ak|0]=0;a3=a5}ak=(c[(d+16|0)>>2]|0)+(ag*112|0)+88|0;aj=a3&255;ah=(aj&1|0)==0?aj>>>1:c[(J+4|0)>>2]|0;aj=(a3&1)==0;ai=c[(J+8|0)>>2]|0;au=tK((aj?J+1|0:ai)|0,42e3,(ah>>>0>4>>>0?4:ah)|0)|0;if((au|0)==0){a6=ah>>>0<4>>>0?-1:ah>>>0>4>>>0&1}else{a6=au}a[ak]=(a6|0)==0|0;if(!aj){tw(ai)}if((a[L]&1)!=0){tw(c[(L+8|0)>>2]|0)}c[N>>2]=ag;ai=kc(ad,N)|0;a[O]=10;a[O+1|0]=a[39368]|0;a[(O+1|0)+1|0]=a[39369]|0;a[(O+1|0)+2|0]=a[39370]|0;a[(O+1|0)+3|0]=a[39371]|0;a[(O+1|0)+4|0]=a[39372]|0;a[O+6|0]=0;aj=kp(ai,b+688|0,O)|0;ak=c[aj>>2]|0;if((ak|0)==0){au=tu(40)|0;do{if((au+16|0|0)!=0){if((a[O]&1)==0){c[(au+16|0)>>2]=c[O>>2];c[(au+16|0)+4>>2]=c[O+4>>2];c[(au+16|0)+8>>2]=c[O+8>>2];break}ah=c[(O+8|0)>>2]|0;at=c[(O+4|0)>>2]|0;if(at>>>0>4294967279>>>0){ae=5021;break L4934}if(at>>>0<11>>>0){a[au+16|0]=at<<1;a7=au+17|0}else{aw=tu(at+16&-16)|0;c[au+24>>2]=aw;c[(au+16|0)>>2]=at+16&-16|1;c[au+20>>2]=at;a7=aw}tH(a7|0,ah|0,at)|0;a[a7+at|0]=0}}while(0);if((au+28|0|0)!=0){tI(au+28|0|0,0,12)|0}ao=c[(b+688|0)>>2]|0;c[au>>2]=0;c[au+4>>2]=0;c[au+8>>2]=ao;c[aj>>2]=au;ao=c[c[(ai|0)>>2]>>2]|0;if((ao|0)==0){a8=au}else{c[(ai|0)>>2]=ao;a8=c[aj>>2]|0}jV(c[ai+4>>2]|0,a8);c[(ai+8|0)>>2]=(c[(ai+8|0)>>2]|0)+1;a9=au}else{a9=ak}ao=a9+28|0;if((a[ao]&1)==0){c[M>>2]=c[ao>>2];c[M+4>>2]=c[ao+4>>2];c[M+8>>2]=c[ao+8>>2]}else{ao=c[a9+36>>2]|0;as=c[a9+32>>2]|0;if(as>>>0>4294967279>>>0){ae=5040;break}if(as>>>0<11>>>0){a[M]=as<<1;ba=M+1|0}else{al=tu(as+16&-16)|0;c[(M+8|0)>>2]=al;c[(M|0)>>2]=as+16&-16|1;c[(M+4|0)>>2]=as;ba=al}tH(ba|0,ao|0,as)|0;a[ba+as|0]=0}ka(M,(c[(d+16|0)>>2]|0)+(ag*112|0)+96|0,0.0);if((a[M]&1)!=0){tw(c[(M+8|0)>>2]|0)}if((a[O]&1)!=0){tw(c[(O+8|0)>>2]|0)}c[Q>>2]=ag;as=kc(ad,Q)|0;a[R]=10;a[R+1|0]=a[25288]|0;a[(R+1|0)+1|0]=a[25289]|0;a[(R+1|0)+2|0]=a[25290]|0;a[(R+1|0)+3|0]=a[25291]|0;a[(R+1|0)+4|0]=a[25292]|0;a[R+6|0]=0;ao=kp(as,b+680|0,R)|0;al=c[ao>>2]|0;if((al|0)==0){am=tu(40)|0;do{if((am+16|0|0)!=0){if((a[R]&1)==0){c[(am+16|0)>>2]=c[R>>2];c[(am+16|0)+4>>2]=c[R+4>>2];c[(am+16|0)+8>>2]=c[R+8>>2];break}at=c[(R+8|0)>>2]|0;ah=c[(R+4|0)>>2]|0;if(ah>>>0>4294967279>>>0){ae=5058;break L4934}if(ah>>>0<11>>>0){a[am+16|0]=ah<<1;bb=am+17|0}else{aw=tu(ah+16&-16)|0;c[am+24>>2]=aw;c[(am+16|0)>>2]=ah+16&-16|1;c[am+20>>2]=ah;bb=aw}tH(bb|0,at|0,ah)|0;a[bb+ah|0]=0}}while(0);if((am+28|0|0)!=0){tI(am+28|0|0,0,12)|0}ak=c[(b+680|0)>>2]|0;c[am>>2]=0;c[am+4>>2]=0;c[am+8>>2]=ak;c[ao>>2]=am;ak=c[c[(as|0)>>2]>>2]|0;if((ak|0)==0){bc=am}else{c[(as|0)>>2]=ak;bc=c[ao>>2]|0}jV(c[as+4>>2]|0,bc);c[(as+8|0)>>2]=(c[(as+8|0)>>2]|0)+1;bd=am}else{bd=al}ak=bd+28|0;if((a[ak]&1)==0){c[P>>2]=c[ak>>2];c[P+4>>2]=c[ak+4>>2];c[P+8>>2]=c[ak+8>>2];be=a[P]|0}else{ak=c[bd+36>>2]|0;au=c[bd+32>>2]|0;if(au>>>0>4294967279>>>0){ae=5077;break}if(au>>>0<11>>>0){a[P]=au<<1&255;bf=P+1|0;bg=au<<1&255}else{ai=tu(au+16&-16)|0;c[(P+8|0)>>2]=ai;c[(P|0)>>2]=au+16&-16|1;c[(P+4|0)>>2]=au;bf=ai;bg=(au+16&-16|1)&255}tH(bf|0,ak|0,au)|0;a[bf+au|0]=0;be=bg}au=(c[(d+16|0)>>2]|0)+(ag*112|0)+72|0;ak=be&255;ai=(ak&1|0)==0?ak>>>1:c[(P+4|0)>>2]|0;ak=(be&1)==0;aj=c[(P+8|0)>>2]|0;ah=tK((ak?P+1|0:aj)|0,42e3,(ai>>>0>4>>>0?4:ai)|0)|0;if((ah|0)==0){bh=ai>>>0<4>>>0?-1:ai>>>0>4>>>0&1}else{bh=ah}a[au]=(bh|0)==0|0;if(!ak){tw(aj)}if((a[R]&1)!=0){tw(c[(R+8|0)>>2]|0)}c[T>>2]=ag;aj=kc(ad,T)|0;a[U]=20;tH(U+1|0|0,24848,10)|0;a[U+11|0]=0;ak=kp(aj,b+672|0,U)|0;au=c[ak>>2]|0;if((au|0)==0){ah=tu(40)|0;do{if((ah+16|0|0)!=0){if((a[U]&1)==0){c[(ah+16|0)>>2]=c[U>>2];c[(ah+16|0)+4>>2]=c[U+4>>2];c[(ah+16|0)+8>>2]=c[U+8>>2];break}ai=c[(U+8|0)>>2]|0;at=c[(U+4|0)>>2]|0;if(at>>>0>4294967279>>>0){ae=5097;break L4934}if(at>>>0<11>>>0){a[ah+16|0]=at<<1;bi=ah+17|0}else{aw=tu(at+16&-16)|0;c[ah+24>>2]=aw;c[(ah+16|0)>>2]=at+16&-16|1;c[ah+20>>2]=at;bi=aw}tH(bi|0,ai|0,at)|0;a[bi+at|0]=0}}while(0);if((ah+28|0|0)!=0){tI(ah+28|0|0,0,12)|0}al=c[(b+672|0)>>2]|0;c[ah>>2]=0;c[ah+4>>2]=0;c[ah+8>>2]=al;c[ak>>2]=ah;al=c[c[(aj|0)>>2]>>2]|0;if((al|0)==0){bj=ah}else{c[(aj|0)>>2]=al;bj=c[ak>>2]|0}jV(c[aj+4>>2]|0,bj);c[(aj+8|0)>>2]=(c[(aj+8|0)>>2]|0)+1;bk=ah}else{bk=au}al=bk+28|0;if((a[al]&1)==0){c[S>>2]=c[al>>2];c[S+4>>2]=c[al+4>>2];c[S+8>>2]=c[al+8>>2];bl=a[S]|0}else{al=c[bk+36>>2]|0;am=c[bk+32>>2]|0;if(am>>>0>4294967279>>>0){ae=5116;break}if(am>>>0<11>>>0){a[S]=am<<1&255;bm=S+1|0;bn=am<<1&255}else{as=tu(am+16&-16)|0;c[(S+8|0)>>2]=as;c[(S|0)>>2]=am+16&-16|1;c[(S+4|0)>>2]=am;bm=as;bn=(am+16&-16|1)&255}tH(bm|0,al|0,am)|0;a[bm+am|0]=0;bl=bn}am=(c[(d+16|0)>>2]|0)+(ag*112|0)+73|0;al=bl&255;as=(al&1|0)==0?al>>>1:c[(S+4|0)>>2]|0;al=(bl&1)==0;ao=c[(S+8|0)>>2]|0;at=tK((al?S+1|0:ao)|0,42e3,(as>>>0>4>>>0?4:as)|0)|0;if((at|0)==0){bo=as>>>0<4>>>0?-1:as>>>0>4>>>0&1}else{bo=at}a[am]=(bo|0)==0|0;if(!al){tw(ao)}if((a[U]&1)!=0){tw(c[(U+8|0)>>2]|0)}c[W>>2]=ag;ao=kc(ad,W)|0;a[X]=14;a[X+1|0]=a[24768]|0;a[(X+1|0)+1|0]=a[24769]|0;a[(X+1|0)+2|0]=a[24770]|0;a[(X+1|0)+3|0]=a[24771]|0;a[(X+1|0)+4|0]=a[24772]|0;a[(X+1|0)+5|0]=a[24773]|0;a[(X+1|0)+6|0]=a[24774]|0;a[X+8|0]=0;al=kp(ao,b+664|0,X)|0;am=c[al>>2]|0;if((am|0)==0){at=tu(40)|0;do{if((at+16|0|0)!=0){if((a[X]&1)==0){c[(at+16|0)>>2]=c[X>>2];c[(at+16|0)+4>>2]=c[X+4>>2];c[(at+16|0)+8>>2]=c[X+8>>2];break}as=c[(X+8|0)>>2]|0;ai=c[(X+4|0)>>2]|0;if(ai>>>0>4294967279>>>0){ae=5136;break L4934}if(ai>>>0<11>>>0){a[at+16|0]=ai<<1;bp=at+17|0}else{aw=tu(ai+16&-16)|0;c[at+24>>2]=aw;c[(at+16|0)>>2]=ai+16&-16|1;c[at+20>>2]=ai;bp=aw}tH(bp|0,as|0,ai)|0;a[bp+ai|0]=0}}while(0);if((at+28|0|0)!=0){tI(at+28|0|0,0,12)|0}au=c[(b+664|0)>>2]|0;c[at>>2]=0;c[at+4>>2]=0;c[at+8>>2]=au;c[al>>2]=at;au=c[c[(ao|0)>>2]>>2]|0;if((au|0)==0){bq=at}else{c[(ao|0)>>2]=au;bq=c[al>>2]|0}jV(c[ao+4>>2]|0,bq);c[(ao+8|0)>>2]=(c[(ao+8|0)>>2]|0)+1;br=at}else{br=am}au=br+28|0;if((a[au]&1)==0){c[V>>2]=c[au>>2];c[V+4>>2]=c[au+4>>2];c[V+8>>2]=c[au+8>>2]}else{au=c[br+36>>2]|0;ah=c[br+32>>2]|0;if(ah>>>0>4294967279>>>0){ae=5155;break}if(ah>>>0<11>>>0){a[V]=ah<<1;bs=V+1|0}else{aj=tu(ah+16&-16)|0;c[(V+8|0)>>2]=aj;c[(V|0)>>2]=ah+16&-16|1;c[(V+4|0)>>2]=ah;bs=aj}tH(bs|0,au|0,ah)|0;a[bs+ah|0]=0}ka(V,(c[(d+16|0)>>2]|0)+(ag*112|0)+80|0,1.0);if((a[V]&1)!=0){tw(c[(V+8|0)>>2]|0)}if((a[X]&1)!=0){tw(c[(X+8|0)>>2]|0)}c[Z>>2]=ag;ah=kc(ad,Z)|0;a[_]=6;a[_+1|0]=a[24672]|0;a[(_+1|0)+1|0]=a[24673]|0;a[(_+1|0)+2|0]=a[24674]|0;a[_+4|0]=0;au=kp(ah,b+656|0,_)|0;aj=c[au>>2]|0;if((aj|0)==0){ak=tu(40)|0;do{if((ak+16|0|0)!=0){if((a[_]&1)==0){c[(ak+16|0)>>2]=c[_>>2];c[(ak+16|0)+4>>2]=c[_+4>>2];c[(ak+16|0)+8>>2]=c[_+8>>2];break}ai=c[(_+8|0)>>2]|0;as=c[(_+4|0)>>2]|0;if(as>>>0>4294967279>>>0){ae=5173;break L4934}if(as>>>0<11>>>0){a[ak+16|0]=as<<1;bt=ak+17|0}else{aw=tu(as+16&-16)|0;c[ak+24>>2]=aw;c[(ak+16|0)>>2]=as+16&-16|1;c[ak+20>>2]=as;bt=aw}tH(bt|0,ai|0,as)|0;a[bt+as|0]=0}}while(0);if((ak+28|0|0)!=0){tI(ak+28|0|0,0,12)|0}am=c[(b+656|0)>>2]|0;c[ak>>2]=0;c[ak+4>>2]=0;c[ak+8>>2]=am;c[au>>2]=ak;am=c[c[(ah|0)>>2]>>2]|0;if((am|0)==0){bu=ak}else{c[(ah|0)>>2]=am;bu=c[au>>2]|0}jV(c[ah+4>>2]|0,bu);c[(ah+8|0)>>2]=(c[(ah+8|0)>>2]|0)+1;bv=ak}else{bv=aj}am=bv+28|0;if((a[am]&1)==0){c[Y>>2]=c[am>>2];c[Y+4>>2]=c[am+4>>2];c[Y+8>>2]=c[am+8>>2]}else{am=c[bv+36>>2]|0;at=c[bv+32>>2]|0;if(at>>>0>4294967279>>>0){ae=5192;break}if(at>>>0<11>>>0){a[Y]=at<<1;bw=Y+1|0}else{ao=tu(at+16&-16)|0;c[(Y+8|0)>>2]=ao;c[(Y|0)>>2]=at+16&-16|1;c[(Y+4|0)>>2]=at;bw=ao}tH(bw|0,am|0,at)|0;a[bw+at|0]=0}ka(Y,(c[(d+16|0)>>2]|0)+(ag*112|0)+56|0,-1.7976931348623157e+308);if((a[Y]&1)!=0){tw(c[(Y+8|0)>>2]|0)}if((a[_]&1)!=0){tw(c[(_+8|0)>>2]|0)}c[aa>>2]=ag;at=kc(ad,aa)|0;a[ab]=6;a[ab+1|0]=a[24600]|0;a[(ab+1|0)+1|0]=a[24601]|0;a[(ab+1|0)+2|0]=a[24602]|0;a[ab+4|0]=0;am=kp(at,b+648|0,ab)|0;ao=c[am>>2]|0;if((ao|0)==0){al=tu(40)|0;do{if((al+16|0|0)!=0){if((a[ab]&1)==0){c[(al+16|0)>>2]=c[ab>>2];c[(al+16|0)+4>>2]=c[ab+4>>2];c[(al+16|0)+8>>2]=c[ab+8>>2];break}as=c[(ab+8|0)>>2]|0;ai=c[(ab+4|0)>>2]|0;if(ai>>>0>4294967279>>>0){ae=5210;break L4934}if(ai>>>0<11>>>0){a[al+16|0]=ai<<1;bx=al+17|0}else{aw=tu(ai+16&-16)|0;c[al+24>>2]=aw;c[(al+16|0)>>2]=ai+16&-16|1;c[al+20>>2]=ai;bx=aw}tH(bx|0,as|0,ai)|0;a[bx+ai|0]=0}}while(0);if((al+28|0|0)!=0){tI(al+28|0|0,0,12)|0}aj=c[(b+648|0)>>2]|0;c[al>>2]=0;c[al+4>>2]=0;c[al+8>>2]=aj;c[am>>2]=al;aj=c[c[(at|0)>>2]>>2]|0;if((aj|0)==0){by=al}else{c[(at|0)>>2]=aj;by=c[am>>2]|0}jV(c[at+4>>2]|0,by);c[(at+8|0)>>2]=(c[(at+8|0)>>2]|0)+1;bz=al}else{bz=ao}aj=bz+28|0;if((a[aj]&1)==0){c[$>>2]=c[aj>>2];c[$+4>>2]=c[aj+4>>2];c[$+8>>2]=c[aj+8>>2]}else{aj=c[bz+36>>2]|0;ak=c[bz+32>>2]|0;if(ak>>>0>4294967279>>>0){ae=5229;break}if(ak>>>0<11>>>0){a[$]=ak<<1;bA=$+1|0}else{ah=tu(ak+16&-16)|0;c[($+8|0)>>2]=ah;c[($|0)>>2]=ak+16&-16|1;c[($+4|0)>>2]=ak;bA=ah}tH(bA|0,aj|0,ak)|0;a[bA+ak|0]=0}ka($,(c[(d+16|0)>>2]|0)+(ag*112|0)+64|0,1.7976931348623157e+308);if((a[$]&1)!=0){tw(c[($+8|0)>>2]|0)}if((a[ab]&1)!=0){tw(c[(ab+8|0)>>2]|0)}ak=c[(d+16|0)>>2]|0;aj=(a[ak+(ag*112|0)+88|0]|0)!=0;bB=+h[ak+(ag*112|0)+96>>3];ah=(a[ak+(ag*112|0)+72|0]|0)!=0?42e3:42440;au=(a[ak+(ag*112|0)+73|0]|0)!=0;bC=+h[ak+(ag*112|0)+80>>3];bD=+h[ak+(ag*112|0)+56>>3];bE=+h[ak+(ag*112|0)+64>>3];hA(4,0,20416,(af=i,i=i+80|0,c[af>>2]=c[ak+(ag*112|0)+4>>2],c[af+8>>2]=aj?93904:24160,h[af+16>>3]=bB,c[af+24>>2]=aj?93904:24064,c[af+32>>2]=ah,c[af+40>>2]=au?93904:24160,h[af+48>>3]=bC,c[af+56>>2]=au?93904:24064,h[af+64>>3]=bD,h[af+72>>3]=bE,af)|0);i=af;au=c[(d+16|0)>>2]|0;ah=c[au+(ag*112|0)+4>>2]|0;if((a[ah]|0)==36){a[au+(ag*112|0)+104|0]=1;bF=c[(c[(d+16|0)>>2]|0)+(ag*112|0)+4>>2]|0}else{bF=ah}ah=tD(bF|0)|0;if(ah>>>0>4294967279>>>0){ae=5320;break}if(ah>>>0<11>>>0){a[ac]=ah<<1;bG=ac+1|0}else{au=tu(ah+16&-16)|0;c[(ac+8|0)>>2]=au;c[(ac|0)>>2]=ah+16&-16|1;c[(ac+4|0)>>2]=ah;bG=au}tH(bG|0,bF|0,ah)|0;a[bG+ah|0]=0;c[(ke(e,ac)|0)>>2]=ag;if((a[ac]&1)!=0){tw(c[(ac+8|0)>>2]|0)}ag=ag+1|0;if((ag|0)>=(c[(d+128|0)>>2]|0)){c[b+39816>>2]=2;c[b+39820>>2]=2;break OL}}if((ae|0)==4636){ml(0)}else if((ae|0)==4655){ml(0)}else if((ae|0)==4677){ml(0)}else if((ae|0)==4696){ml(0)}else if((ae|0)==4715){ml(0)}else if((ae|0)==4734){ml(0)}else if((ae|0)==4755){ml(0)}else if((ae|0)==4774){ml(0)}else if((ae|0)==4795){ml(0)}else if((ae|0)==4814){ml(0)}else if((ae|0)==4833){ml(0)}else if((ae|0)==4852){ml(0)}else if((ae|0)==4870){ml(0)}else if((ae|0)==4889){ml(0)}else if((ae|0)==4907){ml(0)}else if((ae|0)==4926){ml(0)}else if((ae|0)==4945){ml(0)}else if((ae|0)==4964){ml(0)}else if((ae|0)==4982){ml(0)}else if((ae|0)==5001){ml(0)}else if((ae|0)==5021){ml(0)}else if((ae|0)==5040){ml(0)}else if((ae|0)==5058){ml(0)}else if((ae|0)==5077){ml(0)}else if((ae|0)==5097){ml(0)}else if((ae|0)==5116){ml(0)}else if((ae|0)==5136){ml(0)}else if((ae|0)==5155){ml(0)}else if((ae|0)==5173){ml(0)}else if((ae|0)==5192){ml(0)}else if((ae|0)==5210){ml(0)}else if((ae|0)==5229){ml(0)}else if((ae|0)==5320){ml(0)}}while(0);c[b+39768>>2]=ae;c[b+39776>>2]=af}function _read_input_xml$4(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0,bP=0,bQ=0,bR=0,bS=0,bT=0,bU=0,bV=0,bW=0,bX=0,bY=0,bZ=0,b_=0,b$=0,b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,b7=0,b8=0,b9=0,ca=0,cb=0,cc=0,cd=0,ce=0,cf=0,cg=0,ch=0,ci=0,ck=0,cl=0,cm=0,cn=0,co=0,cp=0,cq=0,cr=0,cs=0,ct=0;d=c[b+1904>>2]|0;e=c[b+1928>>2]|0;f=c[b+3856>>2]|0;g=c[b+3864>>2]|0;h=c[b+3872>>2]|0;j=c[b+3880>>2]|0;k=c[b+3888>>2]|0;l=c[b+3896>>2]|0;m=c[b+3904>>2]|0;n=c[b+3912>>2]|0;o=c[b+3920>>2]|0;p=c[b+3928>>2]|0;q=c[b+3936>>2]|0;r=c[b+3944>>2]|0;s=c[b+3952>>2]|0;t=c[b+3960>>2]|0;u=c[b+3968>>2]|0;v=c[b+3976>>2]|0;w=c[b+3984>>2]|0;x=c[b+3992>>2]|0;y=c[b+4e3>>2]|0;z=c[b+4008>>2]|0;A=c[b+4016>>2]|0;B=c[b+4024>>2]|0;D=c[b+4032>>2]|0;E=c[b+4040>>2]|0;F=c[b+4048>>2]|0;G=c[b+4056>>2]|0;H=c[b+4064>>2]|0;I=c[b+4072>>2]|0;J=c[b+4080>>2]|0;K=c[b+4088>>2]|0;L=c[b+4096>>2]|0;M=c[b+4104>>2]|0;N=c[b+4112>>2]|0;O=c[b+4120>>2]|0;P=c[b+4128>>2]|0;Q=c[b+4136>>2]|0;R=c[b+4144>>2]|0;S=c[b+4152>>2]|0;T=c[b+4160>>2]|0;U=c[b+4168>>2]|0;V=c[b+4176>>2]|0;W=c[b+4184>>2]|0;X=c[b+4192>>2]|0;Y=c[b+4200>>2]|0;Z=c[b+4208>>2]|0;_=c[b+4216>>2]|0;$=c[b+4224>>2]|0;aa=c[b+4232>>2]|0;ab=c[b+4240>>2]|0;ac=c[b+4248>>2]|0;ad=c[b+4256>>2]|0;ae=c[b+4264>>2]|0;af=c[b+4272>>2]|0;ag=c[b+4280>>2]|0;ah=c[b+4288>>2]|0;ai=c[b+4296>>2]|0;aj=c[b+4304>>2]|0;ak=c[b+4312>>2]|0;al=c[b+4320>>2]|0;am=c[b+4328>>2]|0;an=c[b+4336>>2]|0;ao=c[b+4344>>2]|0;ap=c[b+4352>>2]|0;aq=c[b+4360>>2]|0;ar=c[b+4368>>2]|0;as=c[b+4376>>2]|0;at=c[b+4384>>2]|0;au=c[b+4392>>2]|0;av=c[b+4400>>2]|0;aw=c[b+4408>>2]|0;ax=c[b+4416>>2]|0;ay=c[b+39768>>2]|0;az=c[b+39776>>2]|0;L3847:do{if((c[(d+120|0)>>2]|0)>0){aA=(b+1680|0)+120|0;aB=0;L3849:while(1){c[g>>2]=aB;aC=kc(aA,g)|0;a[h]=8;C=1701667182;a[h+1|0]=C;C=C>>8;a[(h+1|0)+1|0]=C;C=C>>8;a[(h+1|0)+2|0]=C;C=C>>8;a[(h+1|0)+3|0]=C;a[h+5|0]=0;aD=kp(aC,b+952|0,h)|0;aE=c[aD>>2]|0;if((aE|0)==0){aF=tu(40)|0;do{if((aF+16|0|0)!=0){if((a[h]&1)==0){c[(aF+16|0)>>2]=c[h>>2];c[(aF+16|0)+4>>2]=c[h+4>>2];c[(aF+16|0)+8>>2]=c[h+8>>2];break}aG=c[(h+8|0)>>2]|0;aH=c[(h+4|0)>>2]|0;if(aH>>>0>4294967279>>>0){ay=3602;break L3849}if(aH>>>0<11>>>0){a[aF+16|0]=aH<<1;aI=aF+17|0}else{aJ=tu(aH+16&-16)|0;c[aF+24>>2]=aJ;c[(aF+16|0)>>2]=aH+16&-16|1;c[aF+20>>2]=aH;aI=aJ}tH(aI|0,aG|0,aH)|0;a[aI+aH|0]=0}}while(0);if((aF+28|0|0)!=0){tI(aF+28|0|0,0,12)|0}aH=c[(b+952|0)>>2]|0;c[aF>>2]=0;c[aF+4>>2]=0;c[aF+8>>2]=aH;c[aD>>2]=aF;aH=c[c[(aC|0)>>2]>>2]|0;if((aH|0)==0){aK=aF}else{c[(aC|0)>>2]=aH;aK=c[aD>>2]|0}jV(c[aC+4>>2]|0,aK);c[(aC+8|0)>>2]=(c[(aC+8|0)>>2]|0)+1;aL=aF}else{aL=aE}aH=aL+28|0;if((a[aH]&1)==0){c[f>>2]=c[aH>>2];c[f+4>>2]=c[aH+4>>2];c[f+8>>2]=c[aH+8>>2]}else{aH=c[aL+36>>2]|0;aG=c[aL+32>>2]|0;if(aG>>>0>4294967279>>>0){ay=3621;break}if(aG>>>0<11>>>0){a[f]=aG<<1;aM=f+1|0}else{aJ=tu(aG+16&-16)|0;c[(f+8|0)>>2]=aJ;c[(f|0)>>2]=aG+16&-16|1;c[(f+4|0)>>2]=aG;aM=aJ}tH(aM|0,aH|0,aG)|0;a[aM+aG|0]=0}aG=(c[(d+8|0)>>2]|0)+(aB*48|0)+4|0;if((aG|0)==0){hC(19,0,49832,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az}else{c[aG>>2]=cj(((a[f]&1)==0?f+1|0:c[(f+8|0)>>2]|0)|0)|0}if((a[f]&1)!=0){tw(c[(f+8|0)>>2]|0)}if((a[h]&1)!=0){tw(c[(h+8|0)>>2]|0)}c[k>>2]=aB;aG=kc(aA,k)|0;aH=tu(16)|0;c[(l+8|0)>>2]=aH;c[(l|0)>>2]=17;c[(l+4|0)>>2]=14;tH(aH|0,30344,14)|0;a[aH+14|0]=0;aH=kp(aG,b+944|0,l)|0;aJ=c[aH>>2]|0;if((aJ|0)==0){aN=tu(40)|0;do{if((aN+16|0|0)!=0){if((a[l]&1)==0){c[(aN+16|0)>>2]=c[l>>2];c[(aN+16|0)+4>>2]=c[l+4>>2];c[(aN+16|0)+8>>2]=c[l+8>>2];break}aO=c[(l+8|0)>>2]|0;aP=c[(l+4|0)>>2]|0;if(aP>>>0>4294967279>>>0){ay=3643;break L3849}if(aP>>>0<11>>>0){a[aN+16|0]=aP<<1;aQ=aN+17|0}else{aR=tu(aP+16&-16)|0;c[aN+24>>2]=aR;c[(aN+16|0)>>2]=aP+16&-16|1;c[aN+20>>2]=aP;aQ=aR}tH(aQ|0,aO|0,aP)|0;a[aQ+aP|0]=0}}while(0);if((aN+28|0|0)!=0){tI(aN+28|0|0,0,12)|0}aE=c[(b+944|0)>>2]|0;c[aN>>2]=0;c[aN+4>>2]=0;c[aN+8>>2]=aE;c[aH>>2]=aN;aE=c[c[(aG|0)>>2]>>2]|0;if((aE|0)==0){aS=aN}else{c[(aG|0)>>2]=aE;aS=c[aH>>2]|0}jV(c[aG+4>>2]|0,aS);c[(aG+8|0)>>2]=(c[(aG+8|0)>>2]|0)+1;aT=aN}else{aT=aJ}aE=aT+28|0;if((a[aE]&1)==0){c[j>>2]=c[aE>>2];c[j+4>>2]=c[aE+4>>2];c[j+8>>2]=c[aE+8>>2]}else{aE=c[aT+36>>2]|0;aF=c[aT+32>>2]|0;if(aF>>>0>4294967279>>>0){ay=3662;break}if(aF>>>0<11>>>0){a[j]=aF<<1;aU=j+1|0}else{aC=tu(aF+16&-16)|0;c[(j+8|0)>>2]=aC;c[(j|0)>>2]=aF+16&-16|1;c[(j+4|0)>>2]=aF;aU=aC}tH(aU|0,aE|0,aF)|0;a[aU+aF|0]=0}kd(j,(c[(d+8|0)>>2]|0)+(aB*48|0)|0);if((a[j]&1)!=0){tw(c[(j+8|0)>>2]|0)}if((a[l]&1)!=0){tw(c[(l+8|0)>>2]|0)}c[n>>2]=aB;aF=kc(aA,n)|0;aE=tu(16)|0;c[(o+8|0)>>2]=aE;c[(o|0)>>2]=17;c[(o+4|0)>>2]=11;tH(aE|0,3e4,11)|0;a[aE+11|0]=0;aE=kp(aF,b+936|0,o)|0;aC=c[aE>>2]|0;if((aC|0)==0){aD=tu(40)|0;do{if((aD+16|0|0)!=0){if((a[o]&1)==0){c[(aD+16|0)>>2]=c[o>>2];c[(aD+16|0)+4>>2]=c[o+4>>2];c[(aD+16|0)+8>>2]=c[o+8>>2];break}aP=c[(o+8|0)>>2]|0;aO=c[(o+4|0)>>2]|0;if(aO>>>0>4294967279>>>0){ay=3681;break L3849}if(aO>>>0<11>>>0){a[aD+16|0]=aO<<1;aV=aD+17|0}else{aR=tu(aO+16&-16)|0;c[aD+24>>2]=aR;c[(aD+16|0)>>2]=aO+16&-16|1;c[aD+20>>2]=aO;aV=aR}tH(aV|0,aP|0,aO)|0;a[aV+aO|0]=0}}while(0);if((aD+28|0|0)!=0){tI(aD+28|0|0,0,12)|0}aJ=c[(b+936|0)>>2]|0;c[aD>>2]=0;c[aD+4>>2]=0;c[aD+8>>2]=aJ;c[aE>>2]=aD;aJ=c[c[(aF|0)>>2]>>2]|0;if((aJ|0)==0){aW=aD}else{c[(aF|0)>>2]=aJ;aW=c[aE>>2]|0}jV(c[aF+4>>2]|0,aW);c[(aF+8|0)>>2]=(c[(aF+8|0)>>2]|0)+1;aX=aD}else{aX=aC}aJ=aX+28|0;if((a[aJ]&1)==0){c[m>>2]=c[aJ>>2];c[m+4>>2]=c[aJ+4>>2];c[m+8>>2]=c[aJ+8>>2]}else{aJ=c[aX+36>>2]|0;aN=c[aX+32>>2]|0;if(aN>>>0>4294967279>>>0){ay=3700;break}if(aN>>>0<11>>>0){a[m]=aN<<1;aY=m+1|0}else{aG=tu(aN+16&-16)|0;c[(m+8|0)>>2]=aG;c[(m|0)>>2]=aN+16&-16|1;c[(m+4|0)>>2]=aN;aY=aG}tH(aY|0,aJ|0,aN)|0;a[aY+aN|0]=0}aN=(c[(d+8|0)>>2]|0)+(aB*48|0)+8|0;if((aN|0)==0){hC(19,0,49832,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az}else{c[aN>>2]=cj(((a[m]&1)==0?m+1|0:c[(m+8|0)>>2]|0)|0)|0}if((a[m]&1)!=0){tw(c[(m+8|0)>>2]|0)}if((a[o]&1)!=0){tw(c[(o+8|0)>>2]|0)}c[q>>2]=aB;aN=kc(aA,q)|0;a[r]=16;C=1701603686;a[r+1|0|0]=C;C=C>>8;a[(r+1|0|0)+1|0]=C;C=C>>8;a[(r+1|0|0)+2|0]=C;C=C>>8;a[(r+1|0|0)+3|0]=C;C=1701667150;a[(r+1|0)+4|0]=C;C=C>>8;a[((r+1|0)+4|0)+1|0]=C;C=C>>8;a[((r+1|0)+4|0)+2|0]=C;C=C>>8;a[((r+1|0)+4|0)+3|0]=C;a[r+9|0]=0;aJ=kp(aN,b+928|0,r)|0;aG=c[aJ>>2]|0;if((aG|0)==0){aH=tu(40)|0;do{if((aH+16|0|0)!=0){if((a[r]&1)==0){c[(aH+16|0)>>2]=c[r>>2];c[(aH+16|0)+4>>2]=c[r+4>>2];c[(aH+16|0)+8>>2]=c[r+8>>2];break}aO=c[(r+8|0)>>2]|0;aP=c[(r+4|0)>>2]|0;if(aP>>>0>4294967279>>>0){ay=3721;break L3849}if(aP>>>0<11>>>0){a[aH+16|0]=aP<<1;aZ=aH+17|0}else{aR=tu(aP+16&-16)|0;c[aH+24>>2]=aR;c[(aH+16|0)>>2]=aP+16&-16|1;c[aH+20>>2]=aP;aZ=aR}tH(aZ|0,aO|0,aP)|0;a[aZ+aP|0]=0}}while(0);if((aH+28|0|0)!=0){tI(aH+28|0|0,0,12)|0}aC=c[(b+928|0)>>2]|0;c[aH>>2]=0;c[aH+4>>2]=0;c[aH+8>>2]=aC;c[aJ>>2]=aH;aC=c[c[(aN|0)>>2]>>2]|0;if((aC|0)==0){a_=aH}else{c[(aN|0)>>2]=aC;a_=c[aJ>>2]|0}jV(c[aN+4>>2]|0,a_);c[(aN+8|0)>>2]=(c[(aN+8|0)>>2]|0)+1;a$=aH}else{a$=aG}aC=a$+28|0;if((a[aC]&1)==0){c[p>>2]=c[aC>>2];c[p+4>>2]=c[aC+4>>2];c[p+8>>2]=c[aC+8>>2]}else{aC=c[a$+36>>2]|0;aD=c[a$+32>>2]|0;if(aD>>>0>4294967279>>>0){ay=3740;break}if(aD>>>0<11>>>0){a[p]=aD<<1;a0=p+1|0}else{aF=tu(aD+16&-16)|0;c[(p+8|0)>>2]=aF;c[(p|0)>>2]=aD+16&-16|1;c[(p+4|0)>>2]=aD;a0=aF}tH(a0|0,aC|0,aD)|0;a[a0+aD|0]=0}aD=(c[(d+8|0)>>2]|0)+(aB*48|0)+12|0;if((aD|0)==0){hC(19,0,49832,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az}else{c[aD>>2]=cj(((a[p]&1)==0?p+1|0:c[(p+8|0)>>2]|0)|0)|0}if((a[p]&1)!=0){tw(c[(p+8|0)>>2]|0)}if((a[r]&1)!=0){tw(c[(r+8|0)>>2]|0)}c[t>>2]=aB;aD=kc(aA,t)|0;a[u]=18;tH(u+1|0|0,28704,9)|0;a[u+10|0]=0;aC=kp(aD,b+920|0,u)|0;aF=c[aC>>2]|0;if((aF|0)==0){aE=tu(40)|0;do{if((aE+16|0|0)!=0){if((a[u]&1)==0){c[(aE+16|0)>>2]=c[u>>2];c[(aE+16|0)+4>>2]=c[u+4>>2];c[(aE+16|0)+8>>2]=c[u+8>>2];break}aP=c[(u+8|0)>>2]|0;aO=c[(u+4|0)>>2]|0;if(aO>>>0>4294967279>>>0){ay=3761;break L3849}if(aO>>>0<11>>>0){a[aE+16|0]=aO<<1;a1=aE+17|0}else{aR=tu(aO+16&-16)|0;c[aE+24>>2]=aR;c[(aE+16|0)>>2]=aO+16&-16|1;c[aE+20>>2]=aO;a1=aR}tH(a1|0,aP|0,aO)|0;a[a1+aO|0]=0}}while(0);if((aE+28|0|0)!=0){tI(aE+28|0|0,0,12)|0}aG=c[(b+920|0)>>2]|0;c[aE>>2]=0;c[aE+4>>2]=0;c[aE+8>>2]=aG;c[aC>>2]=aE;aG=c[c[(aD|0)>>2]>>2]|0;if((aG|0)==0){a2=aE}else{c[(aD|0)>>2]=aG;a2=c[aC>>2]|0}jV(c[aD+4>>2]|0,a2);c[(aD+8|0)>>2]=(c[(aD+8|0)>>2]|0)+1;a3=aE}else{a3=aF}aG=a3+28|0;if((a[aG]&1)==0){c[s>>2]=c[aG>>2];c[s+4>>2]=c[aG+4>>2];c[s+8>>2]=c[aG+8>>2]}else{aG=c[a3+36>>2]|0;aH=c[a3+32>>2]|0;if(aH>>>0>4294967279>>>0){ay=3780;break}if(aH>>>0<11>>>0){a[s]=aH<<1;a4=s+1|0}else{aN=tu(aH+16&-16)|0;c[(s+8|0)>>2]=aN;c[(s|0)>>2]=aH+16&-16|1;c[(s+4|0)>>2]=aH;a4=aN}tH(a4|0,aG|0,aH)|0;a[a4+aH|0]=0}kb(s,(c[(d+8|0)>>2]|0)+(aB*48|0)+16|0,0);if((a[s]&1)!=0){tw(c[(s+8|0)>>2]|0)}if((a[u]&1)!=0){tw(c[(u+8|0)>>2]|0)}c[w>>2]=aB;aH=kc(aA,w)|0;aG=tu(16)|0;c[(x+8|0)>>2]=aG;c[(x|0)>>2]=17;c[(x+4|0)>>2]=11;tH(aG|0,28120,11)|0;a[aG+11|0]=0;aG=kp(aH,b+912|0,x)|0;aN=c[aG>>2]|0;if((aN|0)==0){aJ=tu(40)|0;do{if((aJ+16|0|0)!=0){if((a[x]&1)==0){c[(aJ+16|0)>>2]=c[x>>2];c[(aJ+16|0)+4>>2]=c[x+4>>2];c[(aJ+16|0)+8>>2]=c[x+8>>2];break}aO=c[(x+8|0)>>2]|0;aP=c[(x+4|0)>>2]|0;if(aP>>>0>4294967279>>>0){ay=3799;break L3849}if(aP>>>0<11>>>0){a[aJ+16|0]=aP<<1;a5=aJ+17|0}else{aR=tu(aP+16&-16)|0;c[aJ+24>>2]=aR;c[(aJ+16|0)>>2]=aP+16&-16|1;c[aJ+20>>2]=aP;a5=aR}tH(a5|0,aO|0,aP)|0;a[a5+aP|0]=0}}while(0);if((aJ+28|0|0)!=0){tI(aJ+28|0|0,0,12)|0}aF=c[(b+912|0)>>2]|0;c[aJ>>2]=0;c[aJ+4>>2]=0;c[aJ+8>>2]=aF;c[aG>>2]=aJ;aF=c[c[(aH|0)>>2]>>2]|0;if((aF|0)==0){a6=aJ}else{c[(aH|0)>>2]=aF;a6=c[aG>>2]|0}jV(c[aH+4>>2]|0,a6);c[(aH+8|0)>>2]=(c[(aH+8|0)>>2]|0)+1;a7=aJ}else{a7=aN}aF=a7+28|0;if((a[aF]&1)==0){c[v>>2]=c[aF>>2];c[v+4>>2]=c[aF+4>>2];c[v+8>>2]=c[aF+8>>2]}else{aF=c[a7+36>>2]|0;aE=c[a7+32>>2]|0;if(aE>>>0>4294967279>>>0){ay=3818;break}if(aE>>>0<11>>>0){a[v]=aE<<1;a8=v+1|0}else{aD=tu(aE+16&-16)|0;c[(v+8|0)>>2]=aD;c[(v|0)>>2]=aE+16&-16|1;c[(v+4|0)>>2]=aE;a8=aD}tH(a8|0,aF|0,aE)|0;a[a8+aE|0]=0}kb(v,(c[(d+8|0)>>2]|0)+(aB*48|0)+20|0,0);if((a[v]&1)!=0){tw(c[(v+8|0)>>2]|0)}if((a[x]&1)!=0){tw(c[(x+8|0)>>2]|0)}c[z>>2]=aB;aE=kc(aA,z)|0;a[A]=14;a[A+1|0]=a[27080]|0;a[(A+1|0)+1|0]=a[27081]|0;a[(A+1|0)+2|0]=a[27082]|0;a[(A+1|0)+3|0]=a[27083]|0;a[(A+1|0)+4|0]=a[27084]|0;a[(A+1|0)+5|0]=a[27085]|0;a[(A+1|0)+6|0]=a[27086]|0;a[A+8|0]=0;aF=kp(aE,b+904|0,A)|0;aD=c[aF>>2]|0;if((aD|0)==0){aC=tu(40)|0;do{if((aC+16|0|0)!=0){if((a[A]&1)==0){c[(aC+16|0)>>2]=c[A>>2];c[(aC+16|0)+4>>2]=c[A+4>>2];c[(aC+16|0)+8>>2]=c[A+8>>2];break}aP=c[(A+8|0)>>2]|0;aO=c[(A+4|0)>>2]|0;if(aO>>>0>4294967279>>>0){ay=3836;break L3849}if(aO>>>0<11>>>0){a[aC+16|0]=aO<<1;a9=aC+17|0}else{aR=tu(aO+16&-16)|0;c[aC+24>>2]=aR;c[(aC+16|0)>>2]=aO+16&-16|1;c[aC+20>>2]=aO;a9=aR}tH(a9|0,aP|0,aO)|0;a[a9+aO|0]=0}}while(0);if((aC+28|0|0)!=0){tI(aC+28|0|0,0,12)|0}aN=c[(b+904|0)>>2]|0;c[aC>>2]=0;c[aC+4>>2]=0;c[aC+8>>2]=aN;c[aF>>2]=aC;aN=c[c[(aE|0)>>2]>>2]|0;if((aN|0)==0){ba=aC}else{c[(aE|0)>>2]=aN;ba=c[aF>>2]|0}jV(c[aE+4>>2]|0,ba);c[(aE+8|0)>>2]=(c[(aE+8|0)>>2]|0)+1;bb=aC}else{bb=aD}aN=bb+28|0;if((a[aN]&1)==0){c[y>>2]=c[aN>>2];c[y+4>>2]=c[aN+4>>2];c[y+8>>2]=c[aN+8>>2]}else{aN=c[bb+36>>2]|0;aJ=c[bb+32>>2]|0;if(aJ>>>0>4294967279>>>0){ay=3855;break}if(aJ>>>0<11>>>0){a[y]=aJ<<1;bc=y+1|0}else{aH=tu(aJ+16&-16)|0;c[(y+8|0)>>2]=aH;c[(y|0)>>2]=aJ+16&-16|1;c[(y+4|0)>>2]=aJ;bc=aH}tH(bc|0,aN|0,aJ)|0;a[bc+aJ|0]=0}kb(y,(c[(d+8|0)>>2]|0)+(aB*48|0)+24|0,0);if((a[y]&1)!=0){tw(c[(y+8|0)>>2]|0)}if((a[A]&1)!=0){tw(c[(A+8|0)>>2]|0)}c[D>>2]=aB;aJ=kc(aA,D)|0;a[E]=18;tH(E+1|0|0,26600,9)|0;a[E+10|0]=0;aN=kp(aJ,b+896|0,E)|0;aH=c[aN>>2]|0;if((aH|0)==0){aG=tu(40)|0;do{if((aG+16|0|0)!=0){if((a[E]&1)==0){c[(aG+16|0)>>2]=c[E>>2];c[(aG+16|0)+4>>2]=c[E+4>>2];c[(aG+16|0)+8>>2]=c[E+8>>2];break}aO=c[(E+8|0)>>2]|0;aP=c[(E+4|0)>>2]|0;if(aP>>>0>4294967279>>>0){ay=3873;break L3849}if(aP>>>0<11>>>0){a[aG+16|0]=aP<<1;bd=aG+17|0}else{aR=tu(aP+16&-16)|0;c[aG+24>>2]=aR;c[(aG+16|0)>>2]=aP+16&-16|1;c[aG+20>>2]=aP;bd=aR}tH(bd|0,aO|0,aP)|0;a[bd+aP|0]=0}}while(0);if((aG+28|0|0)!=0){tI(aG+28|0|0,0,12)|0}aD=c[(b+896|0)>>2]|0;c[aG>>2]=0;c[aG+4>>2]=0;c[aG+8>>2]=aD;c[aN>>2]=aG;aD=c[c[(aJ|0)>>2]>>2]|0;if((aD|0)==0){be=aG}else{c[(aJ|0)>>2]=aD;be=c[aN>>2]|0}jV(c[aJ+4>>2]|0,be);c[(aJ+8|0)>>2]=(c[(aJ+8|0)>>2]|0)+1;bf=aG}else{bf=aH}aD=bf+28|0;if((a[aD]&1)==0){c[B>>2]=c[aD>>2];c[B+4>>2]=c[aD+4>>2];c[B+8>>2]=c[aD+8>>2]}else{aD=c[bf+36>>2]|0;aC=c[bf+32>>2]|0;if(aC>>>0>4294967279>>>0){ay=3892;break}if(aC>>>0<11>>>0){a[B]=aC<<1;bg=B+1|0}else{aE=tu(aC+16&-16)|0;c[(B+8|0)>>2]=aE;c[(B|0)>>2]=aC+16&-16|1;c[(B+4|0)>>2]=aC;bg=aE}tH(bg|0,aD|0,aC)|0;a[bg+aC|0]=0}kb(B,(c[(d+8|0)>>2]|0)+(aB*48|0)+28|0,0);if((a[B]&1)!=0){tw(c[(B+8|0)>>2]|0)}if((a[E]&1)!=0){tw(c[(E+8|0)>>2]|0)}c[G>>2]=aB;aC=kc(aA,G)|0;aD=tu(16)|0;c[(H+8|0)>>2]=aD;c[(H|0)>>2]=17;c[(H+4|0)>>2]=12;tH(aD|0,25696,12)|0;a[aD+12|0]=0;aD=kp(aC,b+888|0,H)|0;aE=c[aD>>2]|0;if((aE|0)==0){aF=tu(40)|0;do{if((aF+16|0|0)!=0){if((a[H]&1)==0){c[(aF+16|0)>>2]=c[H>>2];c[(aF+16|0)+4>>2]=c[H+4>>2];c[(aF+16|0)+8>>2]=c[H+8>>2];break}aP=c[(H+8|0)>>2]|0;aO=c[(H+4|0)>>2]|0;if(aO>>>0>4294967279>>>0){ay=3911;break L3849}if(aO>>>0<11>>>0){a[aF+16|0]=aO<<1;bh=aF+17|0}else{aR=tu(aO+16&-16)|0;c[aF+24>>2]=aR;c[(aF+16|0)>>2]=aO+16&-16|1;c[aF+20>>2]=aO;bh=aR}tH(bh|0,aP|0,aO)|0;a[bh+aO|0]=0}}while(0);if((aF+28|0|0)!=0){tI(aF+28|0|0,0,12)|0}aH=c[(b+888|0)>>2]|0;c[aF>>2]=0;c[aF+4>>2]=0;c[aF+8>>2]=aH;c[aD>>2]=aF;aH=c[c[(aC|0)>>2]>>2]|0;if((aH|0)==0){bi=aF}else{c[(aC|0)>>2]=aH;bi=c[aD>>2]|0}jV(c[aC+4>>2]|0,bi);c[(aC+8|0)>>2]=(c[(aC+8|0)>>2]|0)+1;bj=aF}else{bj=aE}aH=bj+28|0;if((a[aH]&1)==0){c[F>>2]=c[aH>>2];c[F+4>>2]=c[aH+4>>2];c[F+8>>2]=c[aH+8>>2]}else{aH=c[bj+36>>2]|0;aG=c[bj+32>>2]|0;if(aG>>>0>4294967279>>>0){ay=3930;break}if(aG>>>0<11>>>0){a[F]=aG<<1;bk=F+1|0}else{aJ=tu(aG+16&-16)|0;c[(F+8|0)>>2]=aJ;c[(F|0)>>2]=aG+16&-16|1;c[(F+4|0)>>2]=aG;bk=aJ}tH(bk|0,aH|0,aG)|0;a[bk+aG|0]=0}kb(F,(c[(d+8|0)>>2]|0)+(aB*48|0)+32|0,0);if((a[F]&1)!=0){tw(c[(F+8|0)>>2]|0)}if((a[H]&1)!=0){tw(c[(H+8|0)>>2]|0)}c[J>>2]=aB;aG=kc(aA,J)|0;a[K]=16;C=1399157621;a[K+1|0|0]=C;C=C>>8;a[(K+1|0|0)+1|0]=C;C=C>>8;a[(K+1|0|0)+2|0]=C;C=C>>8;a[(K+1|0|0)+3|0]=C;C=1953653108;a[(K+1|0)+4|0]=C;C=C>>8;a[((K+1|0)+4|0)+1|0]=C;C=C>>8;a[((K+1|0)+4|0)+2|0]=C;C=C>>8;a[((K+1|0)+4|0)+3|0]=C;a[K+9|0]=0;aH=kp(aG,b+880|0,K)|0;aJ=c[aH>>2]|0;if((aJ|0)==0){aN=tu(40)|0;do{if((aN+16|0|0)!=0){if((a[K]&1)==0){c[(aN+16|0)>>2]=c[K>>2];c[(aN+16|0)+4>>2]=c[K+4>>2];c[(aN+16|0)+8>>2]=c[K+8>>2];break}aO=c[(K+8|0)>>2]|0;aP=c[(K+4|0)>>2]|0;if(aP>>>0>4294967279>>>0){ay=3948;break L3849}if(aP>>>0<11>>>0){a[aN+16|0]=aP<<1;bl=aN+17|0}else{aR=tu(aP+16&-16)|0;c[aN+24>>2]=aR;c[(aN+16|0)>>2]=aP+16&-16|1;c[aN+20>>2]=aP;bl=aR}tH(bl|0,aO|0,aP)|0;a[bl+aP|0]=0}}while(0);if((aN+28|0|0)!=0){tI(aN+28|0|0,0,12)|0}aE=c[(b+880|0)>>2]|0;c[aN>>2]=0;c[aN+4>>2]=0;c[aN+8>>2]=aE;c[aH>>2]=aN;aE=c[c[(aG|0)>>2]>>2]|0;if((aE|0)==0){bm=aN}else{c[(aG|0)>>2]=aE;bm=c[aH>>2]|0}jV(c[aG+4>>2]|0,bm);c[(aG+8|0)>>2]=(c[(aG+8|0)>>2]|0)+1;bn=aN}else{bn=aJ}aE=bn+28|0;if((a[aE]&1)==0){c[I>>2]=c[aE>>2];c[I+4>>2]=c[aE+4>>2];c[I+8>>2]=c[aE+8>>2];bo=a[I]|0}else{aE=c[bn+36>>2]|0;aF=c[bn+32>>2]|0;if(aF>>>0>4294967279>>>0){ay=3967;break}if(aF>>>0<11>>>0){a[I]=aF<<1&255;bp=I+1|0;bq=aF<<1&255}else{aC=tu(aF+16&-16)|0;c[(I+8|0)>>2]=aC;c[(I|0)>>2]=aF+16&-16|1;c[(I+4|0)>>2]=aF;bp=aC;bq=(aF+16&-16|1)&255}tH(bp|0,aE|0,aF)|0;a[bp+aF|0]=0;bo=bq}aF=(c[(d+8|0)>>2]|0)+(aB*48|0)+41|0;aE=bo&255;aC=(aE&1|0)==0?aE>>>1:c[(I+4|0)>>2]|0;aE=(bo&1)==0;aD=c[(I+8|0)>>2]|0;aP=tK((aE?I+1|0:aD)|0,42e3,(aC>>>0>4>>>0?4:aC)|0)|0;if((aP|0)==0){br=aC>>>0<4>>>0?-1:aC>>>0>4>>>0&1}else{br=aP}a[aF]=(br|0)==0|0;if(!aE){tw(aD)}if((a[K]&1)!=0){tw(c[(K+8|0)>>2]|0)}c[M>>2]=aB;aD=kc(aA,M)|0;a[N]=10;a[N+1|0]=a[39368]|0;a[(N+1|0)+1|0]=a[39369]|0;a[(N+1|0)+2|0]=a[39370]|0;a[(N+1|0)+3|0]=a[39371]|0;a[(N+1|0)+4|0]=a[39372]|0;a[N+6|0]=0;aE=kp(aD,b+872|0,N)|0;aF=c[aE>>2]|0;if((aF|0)==0){aP=tu(40)|0;do{if((aP+16|0|0)!=0){if((a[N]&1)==0){c[(aP+16|0)>>2]=c[N>>2];c[(aP+16|0)+4>>2]=c[N+4>>2];c[(aP+16|0)+8>>2]=c[N+8>>2];break}aC=c[(N+8|0)>>2]|0;aO=c[(N+4|0)>>2]|0;if(aO>>>0>4294967279>>>0){ay=3987;break L3849}if(aO>>>0<11>>>0){a[aP+16|0]=aO<<1;bs=aP+17|0}else{aR=tu(aO+16&-16)|0;c[aP+24>>2]=aR;c[(aP+16|0)>>2]=aO+16&-16|1;c[aP+20>>2]=aO;bs=aR}tH(bs|0,aC|0,aO)|0;a[bs+aO|0]=0}}while(0);if((aP+28|0|0)!=0){tI(aP+28|0|0,0,12)|0}aJ=c[(b+872|0)>>2]|0;c[aP>>2]=0;c[aP+4>>2]=0;c[aP+8>>2]=aJ;c[aE>>2]=aP;aJ=c[c[(aD|0)>>2]>>2]|0;if((aJ|0)==0){bt=aP}else{c[(aD|0)>>2]=aJ;bt=c[aE>>2]|0}jV(c[aD+4>>2]|0,bt);c[(aD+8|0)>>2]=(c[(aD+8|0)>>2]|0)+1;bu=aP}else{bu=aF}aJ=bu+28|0;if((a[aJ]&1)==0){c[L>>2]=c[aJ>>2];c[L+4>>2]=c[aJ+4>>2];c[L+8>>2]=c[aJ+8>>2];bv=a[L]|0}else{aJ=c[bu+36>>2]|0;aN=c[bu+32>>2]|0;if(aN>>>0>4294967279>>>0){ay=4006;break}if(aN>>>0<11>>>0){a[L]=aN<<1&255;bw=L+1|0;bx=aN<<1&255}else{aG=tu(aN+16&-16)|0;c[(L+8|0)>>2]=aG;c[(L|0)>>2]=aN+16&-16|1;c[(L+4|0)>>2]=aN;bw=aG;bx=(aN+16&-16|1)&255}tH(bw|0,aJ|0,aN)|0;a[bw+aN|0]=0;bv=bx}aN=(c[(d+8|0)>>2]|0)+(aB*48|0)+42|0;aJ=bv&255;aG=(aJ&1|0)==0?aJ>>>1:c[(L+4|0)>>2]|0;aJ=(bv&1)==0;aH=c[(L+8|0)>>2]|0;aO=tK((aJ?L+1|0:aH)|0,42e3,(aG>>>0>4>>>0?4:aG)|0)|0;if((aO|0)==0){by=aG>>>0<4>>>0?-1:aG>>>0>4>>>0&1}else{by=aO}a[aN]=(by|0)==0|0;if(!aJ){tw(aH)}if((a[N]&1)!=0){tw(c[(N+8|0)>>2]|0)}c[P>>2]=aB;aH=kc(aA,P)|0;a[Q]=10;a[Q+1|0]=a[25288]|0;a[(Q+1|0)+1|0]=a[25289]|0;a[(Q+1|0)+2|0]=a[25290]|0;a[(Q+1|0)+3|0]=a[25291]|0;a[(Q+1|0)+4|0]=a[25292]|0;a[Q+6|0]=0;aJ=kp(aH,b+864|0,Q)|0;aN=c[aJ>>2]|0;if((aN|0)==0){aO=tu(40)|0;do{if((aO+16|0|0)!=0){if((a[Q]&1)==0){c[(aO+16|0)>>2]=c[Q>>2];c[(aO+16|0)+4>>2]=c[Q+4>>2];c[(aO+16|0)+8>>2]=c[Q+8>>2];break}aG=c[(Q+8|0)>>2]|0;aC=c[(Q+4|0)>>2]|0;if(aC>>>0>4294967279>>>0){ay=4026;break L3849}if(aC>>>0<11>>>0){a[aO+16|0]=aC<<1;bz=aO+17|0}else{aR=tu(aC+16&-16)|0;c[aO+24>>2]=aR;c[(aO+16|0)>>2]=aC+16&-16|1;c[aO+20>>2]=aC;bz=aR}tH(bz|0,aG|0,aC)|0;a[bz+aC|0]=0}}while(0);if((aO+28|0|0)!=0){tI(aO+28|0|0,0,12)|0}aF=c[(b+864|0)>>2]|0;c[aO>>2]=0;c[aO+4>>2]=0;c[aO+8>>2]=aF;c[aJ>>2]=aO;aF=c[c[(aH|0)>>2]>>2]|0;if((aF|0)==0){bA=aO}else{c[(aH|0)>>2]=aF;bA=c[aJ>>2]|0}jV(c[aH+4>>2]|0,bA);c[(aH+8|0)>>2]=(c[(aH+8|0)>>2]|0)+1;bB=aO}else{bB=aN}aF=bB+28|0;if((a[aF]&1)==0){c[O>>2]=c[aF>>2];c[O+4>>2]=c[aF+4>>2];c[O+8>>2]=c[aF+8>>2];bC=a[O]|0}else{aF=c[bB+36>>2]|0;aP=c[bB+32>>2]|0;if(aP>>>0>4294967279>>>0){ay=4045;break}if(aP>>>0<11>>>0){a[O]=aP<<1&255;bD=O+1|0;bE=aP<<1&255}else{aD=tu(aP+16&-16)|0;c[(O+8|0)>>2]=aD;c[(O|0)>>2]=aP+16&-16|1;c[(O+4|0)>>2]=aP;bD=aD;bE=(aP+16&-16|1)&255}tH(bD|0,aF|0,aP)|0;a[bD+aP|0]=0;bC=bE}aP=(c[(d+8|0)>>2]|0)+(aB*48|0)+40|0;aF=bC&255;aD=(aF&1|0)==0?aF>>>1:c[(O+4|0)>>2]|0;aF=(bC&1)==0;aE=c[(O+8|0)>>2]|0;aC=tK((aF?O+1|0:aE)|0,42e3,(aD>>>0>4>>>0?4:aD)|0)|0;if((aC|0)==0){bF=aD>>>0<4>>>0?-1:aD>>>0>4>>>0&1}else{bF=aC}a[aP]=(bF|0)==0|0;if(!aF){tw(aE)}if((a[Q]&1)!=0){tw(c[(Q+8|0)>>2]|0)}aE=c[(d+8|0)>>2]|0;aF=(a[aE+(aB*48|0)+41|0]|0)!=0;aP=(a[aE+(aB*48|0)+42|0]|0)!=0?42e3:42440;aC=(a[aE+(aB*48|0)+40|0]|0)!=0?42e3:42440;hA(4,0,21248,(az=i,i=i+40|0,c[az>>2]=c[aE+(aB*48|0)+4>>2],c[az+8>>2]=aF?93904:24160,c[az+16>>2]=aP,c[az+24>>2]=aF?93904:24064,c[az+32>>2]=aC,az)|0);i=az;aC=c[(d+8|0)>>2]|0;aF=c[aC+(aB*48|0)+4>>2]|0;if((a[aF]|0)==36){a[aC+(aB*48|0)+44|0]=1;bG=c[(c[(d+8|0)>>2]|0)+(aB*48|0)+4>>2]|0}else{bG=aF}aF=tD(bG|0)|0;if(aF>>>0>4294967279>>>0){ay=4118;break}if(aF>>>0<11>>>0){a[R]=aF<<1;bH=R+1|0}else{aC=tu(aF+16&-16)|0;c[(R+8|0)>>2]=aC;c[(R|0)>>2]=aF+16&-16|1;c[(R+4|0)>>2]=aF;bH=aC}tH(bH|0,bG|0,aF)|0;a[bH+aF|0]=0;c[(ke(e,R)|0)>>2]=aB;if((a[R]&1)!=0){tw(c[(R+8|0)>>2]|0)}aB=aB+1|0;if((aB|0)>=(c[(d+120|0)>>2]|0)){break L3847}}if((ay|0)==3602){ml(0)}else if((ay|0)==3621){ml(0)}else if((ay|0)==3643){ml(0)}else if((ay|0)==3662){ml(0)}else if((ay|0)==3681){ml(0)}else if((ay|0)==3700){ml(0)}else if((ay|0)==3721){ml(0)}else if((ay|0)==3740){ml(0)}else if((ay|0)==3761){ml(0)}else if((ay|0)==3780){ml(0)}else if((ay|0)==3799){ml(0)}else if((ay|0)==3818){ml(0)}else if((ay|0)==3836){ml(0)}else if((ay|0)==3855){ml(0)}else if((ay|0)==3873){ml(0)}else if((ay|0)==3892){ml(0)}else if((ay|0)==3911){ml(0)}else if((ay|0)==3930){ml(0)}else if((ay|0)==3948){ml(0)}else if((ay|0)==3967){ml(0)}else if((ay|0)==3987){ml(0)}else if((ay|0)==4006){ml(0)}else if((ay|0)==4026){ml(0)}else if((ay|0)==4045){ml(0)}else if((ay|0)==4118){ml(0)}}}while(0);if((c[17800]|0)!=0){dd[c[3504]&511](4)}hA(4,1,20992,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az;L4412:do{if((c[(d+124|0)>>2]|0)>0){R=(b+1680|0)+156|0;bH=0;L4414:while(1){c[T>>2]=bH;bG=kc(R,T)|0;a[U]=8;C=1701667182;a[U+1|0]=C;C=C>>8;a[(U+1|0)+1|0]=C;C=C>>8;a[(U+1|0)+2|0]=C;C=C>>8;a[(U+1|0)+3|0]=C;a[U+5|0]=0;Q=kp(bG,b+856|0,U)|0;bF=c[Q>>2]|0;if((bF|0)==0){O=tu(40)|0;do{if((O+16|0|0)!=0){if((a[U]&1)==0){c[(O+16|0)>>2]=c[U>>2];c[(O+16|0)+4>>2]=c[U+4>>2];c[(O+16|0)+8>>2]=c[U+8>>2];break}bC=c[(U+8|0)>>2]|0;bE=c[(U+4|0)>>2]|0;if(bE>>>0>4294967279>>>0){ay=4141;break L4414}if(bE>>>0<11>>>0){a[O+16|0]=bE<<1;bI=O+17|0}else{bD=tu(bE+16&-16)|0;c[O+24>>2]=bD;c[(O+16|0)>>2]=bE+16&-16|1;c[O+20>>2]=bE;bI=bD}tH(bI|0,bC|0,bE)|0;a[bI+bE|0]=0}}while(0);if((O+28|0|0)!=0){tI(O+28|0|0,0,12)|0}aN=c[(b+856|0)>>2]|0;c[O>>2]=0;c[O+4>>2]=0;c[O+8>>2]=aN;c[Q>>2]=O;aN=c[c[(bG|0)>>2]>>2]|0;if((aN|0)==0){bJ=O}else{c[(bG|0)>>2]=aN;bJ=c[Q>>2]|0}jV(c[bG+4>>2]|0,bJ);c[(bG+8|0)>>2]=(c[(bG+8|0)>>2]|0)+1;bK=O}else{bK=bF}aN=bK+28|0;if((a[aN]&1)==0){c[S>>2]=c[aN>>2];c[S+4>>2]=c[aN+4>>2];c[S+8>>2]=c[aN+8>>2]}else{aN=c[bK+36>>2]|0;aO=c[bK+32>>2]|0;if(aO>>>0>4294967279>>>0){ay=4160;break}if(aO>>>0<11>>>0){a[S]=aO<<1;bL=S+1|0}else{aH=tu(aO+16&-16)|0;c[(S+8|0)>>2]=aH;c[(S|0)>>2]=aO+16&-16|1;c[(S+4|0)>>2]=aO;bL=aH}tH(bL|0,aN|0,aO)|0;a[bL+aO|0]=0}aO=(c[(d+12|0)>>2]|0)+(bH*52|0)+4|0;if((aO|0)==0){hC(19,0,49832,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az}else{c[aO>>2]=cj(((a[S]&1)==0?S+1|0:c[(S+8|0)>>2]|0)|0)|0}if((a[S]&1)!=0){tw(c[(S+8|0)>>2]|0)}if((a[U]&1)!=0){tw(c[(U+8|0)>>2]|0)}c[W>>2]=bH;aO=kc(R,W)|0;aN=tu(16)|0;c[(X+8|0)>>2]=aN;c[(X|0)>>2]=17;c[(X+4|0)>>2]=14;tH(aN|0,30344,14)|0;a[aN+14|0]=0;aN=kp(aO,b+848|0,X)|0;aH=c[aN>>2]|0;if((aH|0)==0){aJ=tu(40)|0;do{if((aJ+16|0|0)!=0){if((a[X]&1)==0){c[(aJ+16|0)>>2]=c[X>>2];c[(aJ+16|0)+4>>2]=c[X+4>>2];c[(aJ+16|0)+8>>2]=c[X+8>>2];break}bE=c[(X+8|0)>>2]|0;bC=c[(X+4|0)>>2]|0;if(bC>>>0>4294967279>>>0){ay=4182;break L4414}if(bC>>>0<11>>>0){a[aJ+16|0]=bC<<1;bM=aJ+17|0}else{bD=tu(bC+16&-16)|0;c[aJ+24>>2]=bD;c[(aJ+16|0)>>2]=bC+16&-16|1;c[aJ+20>>2]=bC;bM=bD}tH(bM|0,bE|0,bC)|0;a[bM+bC|0]=0}}while(0);if((aJ+28|0|0)!=0){tI(aJ+28|0|0,0,12)|0}bF=c[(b+848|0)>>2]|0;c[aJ>>2]=0;c[aJ+4>>2]=0;c[aJ+8>>2]=bF;c[aN>>2]=aJ;bF=c[c[(aO|0)>>2]>>2]|0;if((bF|0)==0){bN=aJ}else{c[(aO|0)>>2]=bF;bN=c[aN>>2]|0}jV(c[aO+4>>2]|0,bN);c[(aO+8|0)>>2]=(c[(aO+8|0)>>2]|0)+1;bO=aJ}else{bO=aH}bF=bO+28|0;if((a[bF]&1)==0){c[V>>2]=c[bF>>2];c[V+4>>2]=c[bF+4>>2];c[V+8>>2]=c[bF+8>>2]}else{bF=c[bO+36>>2]|0;O=c[bO+32>>2]|0;if(O>>>0>4294967279>>>0){ay=4201;break}if(O>>>0<11>>>0){a[V]=O<<1;bP=V+1|0}else{bG=tu(O+16&-16)|0;c[(V+8|0)>>2]=bG;c[(V|0)>>2]=O+16&-16|1;c[(V+4|0)>>2]=O;bP=bG}tH(bP|0,bF|0,O)|0;a[bP+O|0]=0}kd(V,(c[(d+12|0)>>2]|0)+(bH*52|0)|0);if((a[V]&1)!=0){tw(c[(V+8|0)>>2]|0)}if((a[X]&1)!=0){tw(c[(X+8|0)>>2]|0)}c[Z>>2]=bH;O=kc(R,Z)|0;bF=tu(16)|0;c[(_+8|0)>>2]=bF;c[(_|0)>>2]=17;c[(_+4|0)>>2]=11;tH(bF|0,3e4,11)|0;a[bF+11|0]=0;bF=kp(O,b+840|0,_)|0;bG=c[bF>>2]|0;if((bG|0)==0){Q=tu(40)|0;do{if((Q+16|0|0)!=0){if((a[_]&1)==0){c[(Q+16|0)>>2]=c[_>>2];c[(Q+16|0)+4>>2]=c[_+4>>2];c[(Q+16|0)+8>>2]=c[_+8>>2];break}bC=c[(_+8|0)>>2]|0;bE=c[(_+4|0)>>2]|0;if(bE>>>0>4294967279>>>0){ay=4220;break L4414}if(bE>>>0<11>>>0){a[Q+16|0]=bE<<1;bQ=Q+17|0}else{bD=tu(bE+16&-16)|0;c[Q+24>>2]=bD;c[(Q+16|0)>>2]=bE+16&-16|1;c[Q+20>>2]=bE;bQ=bD}tH(bQ|0,bC|0,bE)|0;a[bQ+bE|0]=0}}while(0);if((Q+28|0|0)!=0){tI(Q+28|0|0,0,12)|0}aH=c[(b+840|0)>>2]|0;c[Q>>2]=0;c[Q+4>>2]=0;c[Q+8>>2]=aH;c[bF>>2]=Q;aH=c[c[(O|0)>>2]>>2]|0;if((aH|0)==0){bR=Q}else{c[(O|0)>>2]=aH;bR=c[bF>>2]|0}jV(c[O+4>>2]|0,bR);c[(O+8|0)>>2]=(c[(O+8|0)>>2]|0)+1;bS=Q}else{bS=bG}aH=bS+28|0;if((a[aH]&1)==0){c[Y>>2]=c[aH>>2];c[Y+4>>2]=c[aH+4>>2];c[Y+8>>2]=c[aH+8>>2]}else{aH=c[bS+36>>2]|0;aJ=c[bS+32>>2]|0;if(aJ>>>0>4294967279>>>0){ay=4239;break}if(aJ>>>0<11>>>0){a[Y]=aJ<<1;bT=Y+1|0}else{aO=tu(aJ+16&-16)|0;c[(Y+8|0)>>2]=aO;c[(Y|0)>>2]=aJ+16&-16|1;c[(Y+4|0)>>2]=aJ;bT=aO}tH(bT|0,aH|0,aJ)|0;a[bT+aJ|0]=0}aJ=(c[(d+12|0)>>2]|0)+(bH*52|0)+8|0;if((aJ|0)==0){hC(19,0,49832,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az}else{c[aJ>>2]=cj(((a[Y]&1)==0?Y+1|0:c[(Y+8|0)>>2]|0)|0)|0}if((a[Y]&1)!=0){tw(c[(Y+8|0)>>2]|0)}if((a[_]&1)!=0){tw(c[(_+8|0)>>2]|0)}c[aa>>2]=bH;aJ=kc(R,aa)|0;a[ab]=16;C=1701603686;a[ab+1|0|0]=C;C=C>>8;a[(ab+1|0|0)+1|0]=C;C=C>>8;a[(ab+1|0|0)+2|0]=C;C=C>>8;a[(ab+1|0|0)+3|0]=C;C=1701667150;a[(ab+1|0)+4|0]=C;C=C>>8;a[((ab+1|0)+4|0)+1|0]=C;C=C>>8;a[((ab+1|0)+4|0)+2|0]=C;C=C>>8;a[((ab+1|0)+4|0)+3|0]=C;a[ab+9|0]=0;aH=kp(aJ,b+832|0,ab)|0;aO=c[aH>>2]|0;if((aO|0)==0){aN=tu(40)|0;do{if((aN+16|0|0)!=0){if((a[ab]&1)==0){c[(aN+16|0)>>2]=c[ab>>2];c[(aN+16|0)+4>>2]=c[ab+4>>2];c[(aN+16|0)+8>>2]=c[ab+8>>2];break}bE=c[(ab+8|0)>>2]|0;bC=c[(ab+4|0)>>2]|0;if(bC>>>0>4294967279>>>0){ay=4260;break L4414}if(bC>>>0<11>>>0){a[aN+16|0]=bC<<1;bU=aN+17|0}else{bD=tu(bC+16&-16)|0;c[aN+24>>2]=bD;c[(aN+16|0)>>2]=bC+16&-16|1;c[aN+20>>2]=bC;bU=bD}tH(bU|0,bE|0,bC)|0;a[bU+bC|0]=0}}while(0);if((aN+28|0|0)!=0){tI(aN+28|0|0,0,12)|0}bG=c[(b+832|0)>>2]|0;c[aN>>2]=0;c[aN+4>>2]=0;c[aN+8>>2]=bG;c[aH>>2]=aN;bG=c[c[(aJ|0)>>2]>>2]|0;if((bG|0)==0){bV=aN}else{c[(aJ|0)>>2]=bG;bV=c[aH>>2]|0}jV(c[aJ+4>>2]|0,bV);c[(aJ+8|0)>>2]=(c[(aJ+8|0)>>2]|0)+1;bW=aN}else{bW=aO}bG=bW+28|0;if((a[bG]&1)==0){c[$>>2]=c[bG>>2];c[$+4>>2]=c[bG+4>>2];c[$+8>>2]=c[bG+8>>2]}else{bG=c[bW+36>>2]|0;Q=c[bW+32>>2]|0;if(Q>>>0>4294967279>>>0){ay=4279;break}if(Q>>>0<11>>>0){a[$]=Q<<1;bX=$+1|0}else{O=tu(Q+16&-16)|0;c[($+8|0)>>2]=O;c[($|0)>>2]=Q+16&-16|1;c[($+4|0)>>2]=Q;bX=O}tH(bX|0,bG|0,Q)|0;a[bX+Q|0]=0}Q=(c[(d+12|0)>>2]|0)+(bH*52|0)+12|0;if((Q|0)==0){hC(19,0,49832,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az}else{c[Q>>2]=cj(((a[$]&1)==0?$+1|0:c[($+8|0)>>2]|0)|0)|0}if((a[$]&1)!=0){tw(c[($+8|0)>>2]|0)}if((a[ab]&1)!=0){tw(c[(ab+8|0)>>2]|0)}c[ad>>2]=bH;Q=kc(R,ad)|0;a[ae]=18;tH(ae+1|0|0,28704,9)|0;a[ae+10|0]=0;bG=kp(Q,b+824|0,ae)|0;O=c[bG>>2]|0;if((O|0)==0){bF=tu(40)|0;do{if((bF+16|0|0)!=0){if((a[ae]&1)==0){c[(bF+16|0)>>2]=c[ae>>2];c[(bF+16|0)+4>>2]=c[ae+4>>2];c[(bF+16|0)+8>>2]=c[ae+8>>2];break}bC=c[(ae+8|0)>>2]|0;bE=c[(ae+4|0)>>2]|0;if(bE>>>0>4294967279>>>0){ay=4300;break L4414}if(bE>>>0<11>>>0){a[bF+16|0]=bE<<1;bY=bF+17|0}else{bD=tu(bE+16&-16)|0;c[bF+24>>2]=bD;c[(bF+16|0)>>2]=bE+16&-16|1;c[bF+20>>2]=bE;bY=bD}tH(bY|0,bC|0,bE)|0;a[bY+bE|0]=0}}while(0);if((bF+28|0|0)!=0){tI(bF+28|0|0,0,12)|0}aO=c[(b+824|0)>>2]|0;c[bF>>2]=0;c[bF+4>>2]=0;c[bF+8>>2]=aO;c[bG>>2]=bF;aO=c[c[(Q|0)>>2]>>2]|0;if((aO|0)==0){bZ=bF}else{c[(Q|0)>>2]=aO;bZ=c[bG>>2]|0}jV(c[Q+4>>2]|0,bZ);c[(Q+8|0)>>2]=(c[(Q+8|0)>>2]|0)+1;b_=bF}else{b_=O}aO=b_+28|0;if((a[aO]&1)==0){c[ac>>2]=c[aO>>2];c[ac+4>>2]=c[aO+4>>2];c[ac+8>>2]=c[aO+8>>2]}else{aO=c[b_+36>>2]|0;aN=c[b_+32>>2]|0;if(aN>>>0>4294967279>>>0){ay=4319;break}if(aN>>>0<11>>>0){a[ac]=aN<<1;b$=ac+1|0}else{aJ=tu(aN+16&-16)|0;c[(ac+8|0)>>2]=aJ;c[(ac|0)>>2]=aN+16&-16|1;c[(ac+4|0)>>2]=aN;b$=aJ}tH(b$|0,aO|0,aN)|0;a[b$+aN|0]=0}kb(ac,(c[(d+12|0)>>2]|0)+(bH*52|0)+16|0,0);if((a[ac]&1)!=0){tw(c[(ac+8|0)>>2]|0)}if((a[ae]&1)!=0){tw(c[(ae+8|0)>>2]|0)}c[ag>>2]=bH;aN=kc(R,ag)|0;aO=tu(16)|0;c[(ah+8|0)>>2]=aO;c[(ah|0)>>2]=17;c[(ah+4|0)>>2]=11;tH(aO|0,28120,11)|0;a[aO+11|0]=0;aO=kp(aN,b+816|0,ah)|0;aJ=c[aO>>2]|0;if((aJ|0)==0){aH=tu(40)|0;do{if((aH+16|0|0)!=0){if((a[ah]&1)==0){c[(aH+16|0)>>2]=c[ah>>2];c[(aH+16|0)+4>>2]=c[ah+4>>2];c[(aH+16|0)+8>>2]=c[ah+8>>2];break}bE=c[(ah+8|0)>>2]|0;bC=c[(ah+4|0)>>2]|0;if(bC>>>0>4294967279>>>0){ay=4338;break L4414}if(bC>>>0<11>>>0){a[aH+16|0]=bC<<1;b0=aH+17|0}else{bD=tu(bC+16&-16)|0;c[aH+24>>2]=bD;c[(aH+16|0)>>2]=bC+16&-16|1;c[aH+20>>2]=bC;b0=bD}tH(b0|0,bE|0,bC)|0;a[b0+bC|0]=0}}while(0);if((aH+28|0|0)!=0){tI(aH+28|0|0,0,12)|0}O=c[(b+816|0)>>2]|0;c[aH>>2]=0;c[aH+4>>2]=0;c[aH+8>>2]=O;c[aO>>2]=aH;O=c[c[(aN|0)>>2]>>2]|0;if((O|0)==0){b1=aH}else{c[(aN|0)>>2]=O;b1=c[aO>>2]|0}jV(c[aN+4>>2]|0,b1);c[(aN+8|0)>>2]=(c[(aN+8|0)>>2]|0)+1;b2=aH}else{b2=aJ}O=b2+28|0;if((a[O]&1)==0){c[af>>2]=c[O>>2];c[af+4>>2]=c[O+4>>2];c[af+8>>2]=c[O+8>>2]}else{O=c[b2+36>>2]|0;bF=c[b2+32>>2]|0;if(bF>>>0>4294967279>>>0){ay=4357;break}if(bF>>>0<11>>>0){a[af]=bF<<1;b3=af+1|0}else{Q=tu(bF+16&-16)|0;c[(af+8|0)>>2]=Q;c[(af|0)>>2]=bF+16&-16|1;c[(af+4|0)>>2]=bF;b3=Q}tH(b3|0,O|0,bF)|0;a[b3+bF|0]=0}kb(af,(c[(d+12|0)>>2]|0)+(bH*52|0)+20|0,0);if((a[af]&1)!=0){tw(c[(af+8|0)>>2]|0)}if((a[ah]&1)!=0){tw(c[(ah+8|0)>>2]|0)}c[aj>>2]=bH;bF=kc(R,aj)|0;a[ak]=14;a[ak+1|0]=a[27080]|0;a[(ak+1|0)+1|0]=a[27081]|0;a[(ak+1|0)+2|0]=a[27082]|0;a[(ak+1|0)+3|0]=a[27083]|0;a[(ak+1|0)+4|0]=a[27084]|0;a[(ak+1|0)+5|0]=a[27085]|0;a[(ak+1|0)+6|0]=a[27086]|0;a[ak+8|0]=0;O=kp(bF,b+808|0,ak)|0;Q=c[O>>2]|0;if((Q|0)==0){bG=tu(40)|0;do{if((bG+16|0|0)!=0){if((a[ak]&1)==0){c[(bG+16|0)>>2]=c[ak>>2];c[(bG+16|0)+4>>2]=c[ak+4>>2];c[(bG+16|0)+8>>2]=c[ak+8>>2];break}bC=c[(ak+8|0)>>2]|0;bE=c[(ak+4|0)>>2]|0;if(bE>>>0>4294967279>>>0){ay=4375;break L4414}if(bE>>>0<11>>>0){a[bG+16|0]=bE<<1;b4=bG+17|0}else{bD=tu(bE+16&-16)|0;c[bG+24>>2]=bD;c[(bG+16|0)>>2]=bE+16&-16|1;c[bG+20>>2]=bE;b4=bD}tH(b4|0,bC|0,bE)|0;a[b4+bE|0]=0}}while(0);if((bG+28|0|0)!=0){tI(bG+28|0|0,0,12)|0}aJ=c[(b+808|0)>>2]|0;c[bG>>2]=0;c[bG+4>>2]=0;c[bG+8>>2]=aJ;c[O>>2]=bG;aJ=c[c[(bF|0)>>2]>>2]|0;if((aJ|0)==0){b5=bG}else{c[(bF|0)>>2]=aJ;b5=c[O>>2]|0}jV(c[bF+4>>2]|0,b5);c[(bF+8|0)>>2]=(c[(bF+8|0)>>2]|0)+1;b6=bG}else{b6=Q}aJ=b6+28|0;if((a[aJ]&1)==0){c[ai>>2]=c[aJ>>2];c[ai+4>>2]=c[aJ+4>>2];c[ai+8>>2]=c[aJ+8>>2]}else{aJ=c[b6+36>>2]|0;aH=c[b6+32>>2]|0;if(aH>>>0>4294967279>>>0){ay=4394;break}if(aH>>>0<11>>>0){a[ai]=aH<<1;b7=ai+1|0}else{aN=tu(aH+16&-16)|0;c[(ai+8|0)>>2]=aN;c[(ai|0)>>2]=aH+16&-16|1;c[(ai+4|0)>>2]=aH;b7=aN}tH(b7|0,aJ|0,aH)|0;a[b7+aH|0]=0}kb(ai,(c[(d+12|0)>>2]|0)+(bH*52|0)+24|0,0);if((a[ai]&1)!=0){tw(c[(ai+8|0)>>2]|0)}if((a[ak]&1)!=0){tw(c[(ak+8|0)>>2]|0)}c[am>>2]=bH;aH=kc(R,am)|0;a[an]=18;tH(an+1|0|0,26600,9)|0;a[an+10|0]=0;aJ=kp(aH,b+800|0,an)|0;aN=c[aJ>>2]|0;if((aN|0)==0){aO=tu(40)|0;do{if((aO+16|0|0)!=0){if((a[an]&1)==0){c[(aO+16|0)>>2]=c[an>>2];c[(aO+16|0)+4>>2]=c[an+4>>2];c[(aO+16|0)+8>>2]=c[an+8>>2];break}bE=c[(an+8|0)>>2]|0;bC=c[(an+4|0)>>2]|0;if(bC>>>0>4294967279>>>0){ay=4412;break L4414}if(bC>>>0<11>>>0){a[aO+16|0]=bC<<1;b8=aO+17|0}else{bD=tu(bC+16&-16)|0;c[aO+24>>2]=bD;c[(aO+16|0)>>2]=bC+16&-16|1;c[aO+20>>2]=bC;b8=bD}tH(b8|0,bE|0,bC)|0;a[b8+bC|0]=0}}while(0);if((aO+28|0|0)!=0){tI(aO+28|0|0,0,12)|0}Q=c[(b+800|0)>>2]|0;c[aO>>2]=0;c[aO+4>>2]=0;c[aO+8>>2]=Q;c[aJ>>2]=aO;Q=c[c[(aH|0)>>2]>>2]|0;if((Q|0)==0){b9=aO}else{c[(aH|0)>>2]=Q;b9=c[aJ>>2]|0}jV(c[aH+4>>2]|0,b9);c[(aH+8|0)>>2]=(c[(aH+8|0)>>2]|0)+1;ca=aO}else{ca=aN}Q=ca+28|0;if((a[Q]&1)==0){c[al>>2]=c[Q>>2];c[al+4>>2]=c[Q+4>>2];c[al+8>>2]=c[Q+8>>2]}else{Q=c[ca+36>>2]|0;bG=c[ca+32>>2]|0;if(bG>>>0>4294967279>>>0){ay=4431;break}if(bG>>>0<11>>>0){a[al]=bG<<1;cb=al+1|0}else{bF=tu(bG+16&-16)|0;c[(al+8|0)>>2]=bF;c[(al|0)>>2]=bG+16&-16|1;c[(al+4|0)>>2]=bG;cb=bF}tH(cb|0,Q|0,bG)|0;a[cb+bG|0]=0}kb(al,(c[(d+12|0)>>2]|0)+(bH*52|0)+28|0,0);if((a[al]&1)!=0){tw(c[(al+8|0)>>2]|0)}if((a[an]&1)!=0){tw(c[(an+8|0)>>2]|0)}c[ap>>2]=bH;bG=kc(R,ap)|0;Q=tu(16)|0;c[(aq+8|0)>>2]=Q;c[(aq|0)>>2]=17;c[(aq+4|0)>>2]=12;tH(Q|0,25696,12)|0;a[Q+12|0]=0;Q=kp(bG,b+792|0,aq)|0;bF=c[Q>>2]|0;if((bF|0)==0){O=tu(40)|0;do{if((O+16|0|0)!=0){if((a[aq]&1)==0){c[(O+16|0)>>2]=c[aq>>2];c[(O+16|0)+4>>2]=c[aq+4>>2];c[(O+16|0)+8>>2]=c[aq+8>>2];break}bC=c[(aq+8|0)>>2]|0;bE=c[(aq+4|0)>>2]|0;if(bE>>>0>4294967279>>>0){ay=4450;break L4414}if(bE>>>0<11>>>0){a[O+16|0]=bE<<1;cc=O+17|0}else{bD=tu(bE+16&-16)|0;c[O+24>>2]=bD;c[(O+16|0)>>2]=bE+16&-16|1;c[O+20>>2]=bE;cc=bD}tH(cc|0,bC|0,bE)|0;a[cc+bE|0]=0}}while(0);if((O+28|0|0)!=0){tI(O+28|0|0,0,12)|0}aN=c[(b+792|0)>>2]|0;c[O>>2]=0;c[O+4>>2]=0;c[O+8>>2]=aN;c[Q>>2]=O;aN=c[c[(bG|0)>>2]>>2]|0;if((aN|0)==0){cd=O}else{c[(bG|0)>>2]=aN;cd=c[Q>>2]|0}jV(c[bG+4>>2]|0,cd);c[(bG+8|0)>>2]=(c[(bG+8|0)>>2]|0)+1;ce=O}else{ce=bF}aN=ce+28|0;if((a[aN]&1)==0){c[ao>>2]=c[aN>>2];c[ao+4>>2]=c[aN+4>>2];c[ao+8>>2]=c[aN+8>>2]}else{aN=c[ce+36>>2]|0;aO=c[ce+32>>2]|0;if(aO>>>0>4294967279>>>0){ay=4469;break}if(aO>>>0<11>>>0){a[ao]=aO<<1;cf=ao+1|0}else{aH=tu(aO+16&-16)|0;c[(ao+8|0)>>2]=aH;c[(ao|0)>>2]=aO+16&-16|1;c[(ao+4|0)>>2]=aO;cf=aH}tH(cf|0,aN|0,aO)|0;a[cf+aO|0]=0}kb(ao,(c[(d+12|0)>>2]|0)+(bH*52|0)+32|0,0);if((a[ao]&1)!=0){tw(c[(ao+8|0)>>2]|0)}if((a[aq]&1)!=0){tw(c[(aq+8|0)>>2]|0)}c[as>>2]=bH;aO=kc(R,as)|0;a[at]=16;C=1399157621;a[at+1|0|0]=C;C=C>>8;a[(at+1|0|0)+1|0]=C;C=C>>8;a[(at+1|0|0)+2|0]=C;C=C>>8;a[(at+1|0|0)+3|0]=C;C=1953653108;a[(at+1|0)+4|0]=C;C=C>>8;a[((at+1|0)+4|0)+1|0]=C;C=C>>8;a[((at+1|0)+4|0)+2|0]=C;C=C>>8;a[((at+1|0)+4|0)+3|0]=C;a[at+9|0]=0;aN=kp(aO,b+784|0,at)|0;aH=c[aN>>2]|0;if((aH|0)==0){aJ=tu(40)|0;do{if((aJ+16|0|0)!=0){if((a[at]&1)==0){c[(aJ+16|0)>>2]=c[at>>2];c[(aJ+16|0)+4>>2]=c[at+4>>2];c[(aJ+16|0)+8>>2]=c[at+8>>2];break}bE=c[(at+8|0)>>2]|0;bC=c[(at+4|0)>>2]|0;if(bC>>>0>4294967279>>>0){ay=4487;break L4414}if(bC>>>0<11>>>0){a[aJ+16|0]=bC<<1;cg=aJ+17|0}else{bD=tu(bC+16&-16)|0;c[aJ+24>>2]=bD;c[(aJ+16|0)>>2]=bC+16&-16|1;c[aJ+20>>2]=bC;cg=bD}tH(cg|0,bE|0,bC)|0;a[cg+bC|0]=0}}while(0);if((aJ+28|0|0)!=0){tI(aJ+28|0|0,0,12)|0}bF=c[(b+784|0)>>2]|0;c[aJ>>2]=0;c[aJ+4>>2]=0;c[aJ+8>>2]=bF;c[aN>>2]=aJ;bF=c[c[(aO|0)>>2]>>2]|0;if((bF|0)==0){ch=aJ}else{c[(aO|0)>>2]=bF;ch=c[aN>>2]|0}jV(c[aO+4>>2]|0,ch);c[(aO+8|0)>>2]=(c[(aO+8|0)>>2]|0)+1;ci=aJ}else{ci=aH}bF=ci+28|0;if((a[bF]&1)==0){c[ar>>2]=c[bF>>2];c[ar+4>>2]=c[bF+4>>2];c[ar+8>>2]=c[bF+8>>2];ck=a[ar]|0}else{bF=c[ci+36>>2]|0;O=c[ci+32>>2]|0;if(O>>>0>4294967279>>>0){ay=4506;break}if(O>>>0<11>>>0){a[ar]=O<<1&255;cl=ar+1|0;cm=O<<1&255}else{bG=tu(O+16&-16)|0;c[(ar+8|0)>>2]=bG;c[(ar|0)>>2]=O+16&-16|1;c[(ar+4|0)>>2]=O;cl=bG;cm=(O+16&-16|1)&255}tH(cl|0,bF|0,O)|0;a[cl+O|0]=0;ck=cm}O=(c[(d+12|0)>>2]|0)+(bH*52|0)+40|0;bF=ck&255;bG=(bF&1|0)==0?bF>>>1:c[(ar+4|0)>>2]|0;bF=(ck&1)==0;Q=c[(ar+8|0)>>2]|0;bC=tK((bF?ar+1|0:Q)|0,42e3,(bG>>>0>4>>>0?4:bG)|0)|0;if((bC|0)==0){cn=bG>>>0<4>>>0?-1:bG>>>0>4>>>0&1}else{cn=bC}a[O]=(cn|0)==0|0;if(!bF){tw(Q)}if((a[at]&1)!=0){tw(c[(at+8|0)>>2]|0)}c[av>>2]=bH;Q=kc(R,av)|0;a[aw]=10;a[aw+1|0]=a[39368]|0;a[(aw+1|0)+1|0]=a[39369]|0;a[(aw+1|0)+2|0]=a[39370]|0;a[(aw+1|0)+3|0]=a[39371]|0;a[(aw+1|0)+4|0]=a[39372]|0;a[aw+6|0]=0;bF=kp(Q,b+776|0,aw)|0;O=c[bF>>2]|0;if((O|0)==0){bC=tu(40)|0;do{if((bC+16|0|0)!=0){if((a[aw]&1)==0){c[(bC+16|0)>>2]=c[aw>>2];c[(bC+16|0)+4>>2]=c[aw+4>>2];c[(bC+16|0)+8>>2]=c[aw+8>>2];break}bG=c[(aw+8|0)>>2]|0;bE=c[(aw+4|0)>>2]|0;if(bE>>>0>4294967279>>>0){ay=4526;break L4414}if(bE>>>0<11>>>0){a[bC+16|0]=bE<<1;co=bC+17|0}else{bD=tu(bE+16&-16)|0;c[bC+24>>2]=bD;c[(bC+16|0)>>2]=bE+16&-16|1;c[bC+20>>2]=bE;co=bD}tH(co|0,bG|0,bE)|0;a[co+bE|0]=0}}while(0);if((bC+28|0|0)!=0){tI(bC+28|0|0,0,12)|0}aH=c[(b+776|0)>>2]|0;c[bC>>2]=0;c[bC+4>>2]=0;c[bC+8>>2]=aH;c[bF>>2]=bC;aH=c[c[(Q|0)>>2]>>2]|0;if((aH|0)==0){cp=bC}else{c[(Q|0)>>2]=aH;cp=c[bF>>2]|0}jV(c[Q+4>>2]|0,cp);c[(Q+8|0)>>2]=(c[(Q+8|0)>>2]|0)+1;cq=bC}else{cq=O}aH=cq+28|0;if((a[aH]&1)==0){c[au>>2]=c[aH>>2];c[au+4>>2]=c[aH+4>>2];c[au+8>>2]=c[aH+8>>2]}else{aH=c[cq+36>>2]|0;aJ=c[cq+32>>2]|0;if(aJ>>>0>4294967279>>>0){ay=4545;break}if(aJ>>>0<11>>>0){a[au]=aJ<<1;cr=au+1|0}else{aO=tu(aJ+16&-16)|0;c[(au+8|0)>>2]=aO;c[(au|0)>>2]=aJ+16&-16|1;c[(au+4|0)>>2]=aJ;cr=aO}tH(cr|0,aH|0,aJ)|0;a[cr+aJ|0]=0}aJ=(c[(d+12|0)>>2]|0)+(bH*52|0)+44|0;if((aJ|0)==0){hC(19,0,49832,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az}else{c[aJ>>2]=cj(((a[au]&1)==0?au+1|0:c[(au+8|0)>>2]|0)|0)|0}if((a[au]&1)!=0){tw(c[(au+8|0)>>2]|0)}if((a[aw]&1)!=0){tw(c[(aw+8|0)>>2]|0)}aJ=c[(d+12|0)>>2]|0;aH=(a[aJ+(bH*52|0)+40|0]|0)!=0;aO=c[aJ+(bH*52|0)+44>>2]|0;hA(4,0,20888,(az=i,i=i+32|0,c[az>>2]=c[aJ+(bH*52|0)+4>>2],c[az+8>>2]=aH?93904:24160,c[az+16>>2]=aO,c[az+24>>2]=aH?93904:24064,az)|0);i=az;aH=c[(d+12|0)>>2]|0;aO=c[aH+(bH*52|0)+4>>2]|0;if((a[aO]|0)==36){a[aH+(bH*52|0)+48|0]=1;cs=c[(c[(d+12|0)>>2]|0)+(bH*52|0)+4>>2]|0}else{cs=aO}aO=tD(cs|0)|0;if(aO>>>0>4294967279>>>0){ay=4613;break}if(aO>>>0<11>>>0){a[ax]=aO<<1;ct=ax+1|0}else{aH=tu(aO+16&-16)|0;c[(ax+8|0)>>2]=aH;c[(ax|0)>>2]=aO+16&-16|1;c[(ax+4|0)>>2]=aO;ct=aH}tH(ct|0,cs|0,aO)|0;a[ct+aO|0]=0;c[(ke(e,ax)|0)>>2]=bH;if((a[ax]&1)!=0){tw(c[(ax+8|0)>>2]|0)}bH=bH+1|0;if((bH|0)>=(c[(d+124|0)>>2]|0)){break L4412}}if((ay|0)==4141){ml(0)}else if((ay|0)==4160){ml(0)}else if((ay|0)==4182){ml(0)}else if((ay|0)==4201){ml(0)}else if((ay|0)==4220){ml(0)}else if((ay|0)==4239){ml(0)}else if((ay|0)==4260){ml(0)}else if((ay|0)==4279){ml(0)}else if((ay|0)==4300){ml(0)}else if((ay|0)==4319){ml(0)}else if((ay|0)==4338){ml(0)}else if((ay|0)==4357){ml(0)}else if((ay|0)==4375){ml(0)}else if((ay|0)==4394){ml(0)}else if((ay|0)==4412){ml(0)}else if((ay|0)==4431){ml(0)}else if((ay|0)==4450){ml(0)}else if((ay|0)==4469){ml(0)}else if((ay|0)==4487){ml(0)}else if((ay|0)==4506){ml(0)}else if((ay|0)==4526){ml(0)}else if((ay|0)==4545){ml(0)}else if((ay|0)==4613){ml(0)}}}while(0);if((c[17800]|0)!=0){dd[c[3504]&511](4)}hA(4,1,20544,(az=i,i=i+1|0,i=i+7&-8,c[az>>2]=0,az)|0);i=az;c[b+39768>>2]=ay;c[b+39776>>2]=az}function _read_input_xml$5(b){b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0.0,bE=0.0,bF=0.0,bG=0.0,bH=0,bI=0;d=c[b+1904>>2]|0;e=c[b+1928>>2]|0;f=c[b+3120>>2]|0;g=c[b+3136>>2]|0;j=c[b+3144>>2]|0;k=c[b+3152>>2]|0;l=c[b+3160>>2]|0;m=c[b+3168>>2]|0;n=c[b+3176>>2]|0;o=c[b+3184>>2]|0;p=c[b+3192>>2]|0;q=c[b+3200>>2]|0;r=c[b+3208>>2]|0;s=c[b+3216>>2]|0;t=c[b+3224>>2]|0;u=c[b+3232>>2]|0;v=c[b+3240>>2]|0;w=c[b+3248>>2]|0;x=c[b+3256>>2]|0;y=c[b+3264>>2]|0;z=c[b+3272>>2]|0;A=c[b+3280>>2]|0;B=c[b+3288>>2]|0;D=c[b+3296>>2]|0;E=c[b+3304>>2]|0;F=c[b+3312>>2]|0;G=c[b+3320>>2]|0;H=c[b+3328>>2]|0;I=c[b+3336>>2]|0;J=c[b+3344>>2]|0;K=c[b+3352>>2]|0;L=c[b+3360>>2]|0;M=c[b+3368>>2]|0;N=c[b+3376>>2]|0;O=c[b+3384>>2]|0;P=c[b+3392>>2]|0;Q=c[b+3400>>2]|0;R=c[b+3408>>2]|0;S=c[b+3416>>2]|0;T=c[b+3424>>2]|0;U=c[b+3432>>2]|0;V=c[b+3440>>2]|0;W=c[b+3448>>2]|0;X=c[b+3456>>2]|0;Y=c[b+3464>>2]|0;Z=c[b+3472>>2]|0;_=c[b+3480>>2]|0;$=c[b+3488>>2]|0;aa=c[b+3496>>2]|0;ab=c[b+3504>>2]|0;ac=c[b+15368>>2]|0;ad=c[b+15376>>2]|0;ae=c[b+15384>>2]|0;af=c[b+15392>>2]|0;ag=c[b+15400>>2]|0;ah=c[b+39768>>2]|0;ai=c[b+39776>>2]|0;OL:do{C=C>>8;a[(g+1|0)+2|0]=C;C=C>>8;a[(g+1|0)+3|0]=C;a[g+5|0]=0;aj=kp(ag,b+1192|0,g)|0;ak=c[aj>>2]|0;if((ak|0)==0){al=tu(40)|0;do{if((al+16|0|0)!=0){if((a[g]&1)==0){c[(al+16|0)>>2]=c[g>>2];c[(al+16|0)+4>>2]=c[g+4>>2];c[(al+16|0)+8>>2]=c[g+8>>2];break}am=c[(g+8|0)>>2]|0;an=c[(g+4|0)>>2]|0;if(an>>>0>4294967279>>>0){ah=2274;c[b+39832>>2]=2;c[b+39836>>2]=16;break OL}if(an>>>0<11>>>0){a[al+16|0]=an<<1;ao=al+17|0}else{ap=tu(an+16&-16)|0;c[al+24>>2]=ap;c[(al+16|0)>>2]=an+16&-16|1;c[al+20>>2]=an;ao=ap}tH(ao|0,am|0,an)|0;a[ao+an|0]=0}}while(0);if((al+28|0|0)!=0){tI(al+28|0|0,0,12)|0}an=c[(b+1192|0)>>2]|0;c[al>>2]=0;c[al+4>>2]=0;c[al+8>>2]=an;c[aj>>2]=al;an=c[c[(ag|0)>>2]>>2]|0;if((an|0)==0){aq=al}else{c[(ag|0)>>2]=an;aq=c[aj>>2]|0}jV(c[ag+4>>2]|0,aq);c[(ag+8|0)>>2]=(c[(ag+8|0)>>2]|0)+1;ar=al}else{ar=ak}an=ar+28|0;if((a[an]&1)==0){c[f>>2]=c[an>>2];c[f+4>>2]=c[an+4>>2];c[f+8>>2]=c[an+8>>2]}else{an=c[ar+36>>2]|0;am=c[ar+32>>2]|0;if(am>>>0>4294967279>>>0){ah=2293;c[b+39832>>2]=1;break OL}if(am>>>0<11>>>0){a[f]=am<<1;as=f+1|0}else{ap=tu(am+16&-16)|0;c[(f+8|0)>>2]=ap;c[(f|0)>>2]=am+16&-16|1;c[(f+4|0)>>2]=am;as=ap}tH(as|0,an|0,am)|0;a[as+am|0]=0}am=(c[(d|0)>>2]|0)+(af*112|0)+4|0;if((am|0)==0){hC(19,0,49832,(ai=i,i=i+1|0,i=i+7&-8,c[ai>>2]=0,ai)|0);i=ai}else{c[am>>2]=cj(((a[f]&1)==0?f+1|0:c[(f+8|0)>>2]|0)|0)|0}if((a[f]&1)!=0){tw(c[(f+8|0)>>2]|0)}if((a[g]&1)!=0){tw(c[(g+8|0)>>2]|0)}c[k>>2]=ae;am=kc(ac,k)|0;an=tu(16)|0;c[(l+8|0)>>2]=an;c[(l|0)>>2]=17;c[(l+4|0)>>2]=14;tH(an|0,30344,14)|0;a[an+14|0]=0;an=kp(am,b+1184|0,l)|0;ap=c[an>>2]|0;if((ap|0)==0){at=tu(40)|0;do{if((at+16|0|0)!=0){if((a[l]&1)==0){c[(at+16|0)>>2]=c[l>>2];c[(at+16|0)+4>>2]=c[l+4>>2];c[(at+16|0)+8>>2]=c[l+8>>2];break}au=c[(l+8|0)>>2]|0;av=c[(l+4|0)>>2]|0;if(av>>>0>4294967279>>>0){ah=2315;c[b+39832>>2]=2;c[b+39836>>2]=16;break OL}if(av>>>0<11>>>0){a[at+16|0]=av<<1;aw=at+17|0}else{ax=tu(av+16&-16)|0;c[at+24>>2]=ax;c[(at+16|0)>>2]=av+16&-16|1;c[at+20>>2]=av;aw=ax}tH(aw|0,au|0,av)|0;a[aw+av|0]=0}}while(0);if((at+28|0|0)!=0){tI(at+28|0|0,0,12)|0}ak=c[(b+1184|0)>>2]|0;c[at>>2]=0;c[at+4>>2]=0;c[at+8>>2]=ak;c[an>>2]=at;ak=c[c[(am|0)>>2]>>2]|0;if((ak|0)==0){ay=at}else{c[(am|0)>>2]=ak;ay=c[an>>2]|0}jV(c[am+4>>2]|0,ay);c[(am+8|0)>>2]=(c[(am+8|0)>>2]|0)+1;az=at}else{az=ap}ak=az+28|0;if((a[ak]&1)==0){c[j>>2]=c[ak>>2];c[j+4>>2]=c[ak+4>>2];c[j+8>>2]=c[ak+8>>2]}else{ak=c[az+36>>2]|0;al=c[az+32>>2]|0;if(al>>>0>4294967279>>>0){ah=2334;c[b+39832>>2]=1;break OL}if(al>>>0<11>>>0){a[j]=al<<1;aA=j+1|0}else{aj=tu(al+16&-16)|0;c[(j+8|0)>>2]=aj;c[(j|0)>>2]=al+16&-16|1;c[(j+4|0)>>2]=al;aA=aj}tH(aA|0,ak|0,al)|0;a[aA+al|0]=0}kd(j,(c[(d|0)>>2]|0)+(af*112|0)|0);if((a[j]&1)!=0){tw(c[(j+8|0)>>2]|0)}if((a[l]&1)!=0){tw(c[(l+8|0)>>2]|0)}c[n>>2]=ae;al=kc(ac,n)|0;ak=tu(16)|0;c[(o+8|0)>>2]=ak;c[(o|0)>>2]=17;c[(o+4|0)>>2]=11;tH(ak|0,3e4,11)|0;a[ak+11|0]=0;ak=kp(al,b+1176|0,o)|0;aj=c[ak>>2]|0;if((aj|0)==0){av=tu(40)|0;do{if((av+16|0|0)!=0){if((a[o]&1)==0){c[(av+16|0)>>2]=c[o>>2];c[(av+16|0)+4>>2]=c[o+4>>2];c[(av+16|0)+8>>2]=c[o+8>>2];break}au=c[(o+8|0)>>2]|0;ax=c[(o+4|0)>>2]|0;if(ax>>>0>4294967279>>>0){ah=2353;c[b+39832>>2]=2;c[b+39836>>2]=16;break OL}if(ax>>>0<11>>>0){a[av+16|0]=ax<<1;aB=av+17|0}else{aC=tu(ax+16&-16)|0;c[av+24>>2]=aC;c[(av+16|0)>>2]=ax+16&-16|1;c[av+20>>2]=ax;aB=aC}tH(aB|0,au|0,ax)|0;a[aB+ax|0]=0}}while(0);if((av+28|0|0)!=0){tI(av+28|0|0,0,12)|0}ap=c[(b+1176|0)>>2]|0;c[av>>2]=0;c[av+4>>2]=0;c[av+8>>2]=ap;c[ak>>2]=av;ap=c[c[(al|0)>>2]>>2]|0;if((ap|0)==0){aD=av}else{c[(al|0)>>2]=ap;aD=c[ak>>2]|0}jV(c[al+4>>2]|0,aD);c[(al+8|0)>>2]=(c[(al+8|0)>>2]|0)+1;aE=av}else{aE=aj}ap=aE+28|0;if((a[ap]&1)==0){c[m>>2]=c[ap>>2];c[m+4>>2]=c[ap+4>>2];c[m+8>>2]=c[ap+8>>2]}else{ap=c[aE+36>>2]|0;at=c[aE+32>>2]|0;if(at>>>0>4294967279>>>0){ah=2372;c[b+39832>>2]=1;break OL}if(at>>>0<11>>>0){a[m]=at<<1;aF=m+1|0}else{am=tu(at+16&-16)|0;c[(m+8|0)>>2]=am;c[(m|0)>>2]=at+16&-16|1;c[(m+4|0)>>2]=at;aF=am}tH(aF|0,ap|0,at)|0;a[aF+at|0]=0}at=(c[(d|0)>>2]|0)+(af*112|0)+8|0;if((at|0)==0){hC(19,0,49832,(ai=i,i=i+1|0,i=i+7&-8,c[ai>>2]=0,ai)|0);i=ai}else{c[at>>2]=cj(((a[m]&1)==0?m+1|0:c[(m+8|0)>>2]|0)|0)|0}if((a[m]&1)!=0){tw(c[(m+8|0)>>2]|0)}if((a[o]&1)!=0){tw(c[(o+8|0)>>2]|0)}c[q>>2]=ae;at=kc(ac,q)|0;a[r]=16;C=1701603686;a[r+1|0|0]=C;C=C>>8;a[(r+1|0|0)+1|0]=C;C=C>>8;a[(r+1|0|0)+2|0]=C;C=C>>8;a[(r+1|0|0)+3|0]=C;C=1701667150;a[(r+1|0)+4|0]=C;C=C>>8;a[((r+1|0)+4|0)+1|0]=C;C=C>>8;a[((r+1|0)+4|0)+2|0]=C;C=C>>8;a[((r+1|0)+4|0)+3|0]=C;a[r+9|0]=0;ap=kp(at,b+1168|0,r)|0;am=c[ap>>2]|0;if((am|0)==0){an=tu(40)|0;do{if((an+16|0|0)!=0){if((a[r]&1)==0){c[(an+16|0)>>2]=c[r>>2];c[(an+16|0)+4>>2]=c[r+4>>2];c[(an+16|0)+8>>2]=c[r+8>>2];break}ax=c[(r+8|0)>>2]|0;au=c[(r+4|0)>>2]|0;if(au>>>0>4294967279>>>0){ah=2393;c[b+39832>>2]=2;c[b+39836>>2]=16;break OL}if(au>>>0<11>>>0){a[an+16|0]=au<<1;aG=an+17|0}else{aC=tu(au+16&-16)|0;c[an+24>>2]=aC;c[(an+16|0)>>2]=au+16&-16|1;c[an+20>>2]=au;aG=aC}tH(aG|0,ax|0,au)|0;a[aG+au|0]=0}}while(0);if((an+28|0|0)!=0){tI(an+28|0|0,0,12)|0}aj=c[(b+1168|0)>>2]|0;c[an>>2]=0;c[an+4>>2]=0;c[an+8>>2]=aj;c[ap>>2]=an;aj=c[c[(at|0)>>2]>>2]|0;if((aj|0)==0){aH=an}else{c[(at|0)>>2]=aj;aH=c[ap>>2]|0}jV(c[at+4>>2]|0,aH);c[(at+8|0)>>2]=(c[(at+8|0)>>2]|0)+1;aI=an}else{aI=am}aj=aI+28|0;if((a[aj]&1)==0){c[p>>2]=c[aj>>2];c[p+4>>2]=c[aj+4>>2];c[p+8>>2]=c[aj+8>>2]}else{aj=c[aI+36>>2]|0;av=c[aI+32>>2]|0;if(av>>>0>4294967279>>>0){ah=2412;c[b+39832>>2]=1;break OL}if(av>>>0<11>>>0){a[p]=av<<1;aJ=p+1|0}else{al=tu(av+16&-16)|0;c[(p+8|0)>>2]=al;c[(p|0)>>2]=av+16&-16|1;c[(p+4|0)>>2]=av;aJ=al}tH(aJ|0,aj|0,av)|0;a[aJ+av|0]=0}av=(c[(d|0)>>2]|0)+(af*112|0)+12|0;if((av|0)==0){hC(19,0,49832,(ai=i,i=i+1|0,i=i+7&-8,c[ai>>2]=0,ai)|0);i=ai}else{c[av>>2]=cj(((a[p]&1)==0?p+1|0:c[(p+8|0)>>2]|0)|0)|0}if((a[p]&1)!=0){tw(c[(p+8|0)>>2]|0)}if((a[r]&1)!=0){tw(c[(r+8|0)>>2]|0)}c[t>>2]=ae;av=kc(ac,t)|0;a[u]=18;tH(u+1|0|0,28704,9)|0;a[u+10|0]=0;aj=kp(av,b+1160|0,u)|0;al=c[aj>>2]|0;if((al|0)==0){ak=tu(40)|0;do{if((ak+16|0|0)!=0){if((a[u]&1)==0){c[(ak+16|0)>>2]=c[u>>2];c[(ak+16|0)+4>>2]=c[u+4>>2];c[(ak+16|0)+8>>2]=c[u+8>>2];break}au=c[(u+8|0)>>2]|0;ax=c[(u+4|0)>>2]|0;if(ax>>>0>4294967279>>>0){ah=2433;c[b+39832>>2]=2;c[b+39836>>2]=16;break OL}if(ax>>>0<11>>>0){a[ak+16|0]=ax<<1;aK=ak+17|0}else{aC=tu(ax+16&-16)|0;c[ak+24>>2]=aC;c[(ak+16|0)>>2]=ax+16&-16|1;c[ak+20>>2]=ax;aK=aC}tH(aK|0,au|0,ax)|0;a[aK+ax|0]=0}}while(0);if((ak+28|0|0)!=0){tI(ak+28|0|0,0,12)|0}am=c[(b+1160|0)>>2]|0;c[ak>>2]=0;c[ak+4>>2]=0;c[ak+8>>2]=am;c[aj>>2]=ak;am=c[c[(av|0)>>2]>>2]|0;if((am|0)==0){aL=ak}else{c[(av|0)>>2]=am;aL=c[aj>>2]|0}jV(c[av+4>>2]|0,aL);c[(av+8|0)>>2]=(c[(av+8|0)>>2]|0)+1;aM=ak}else{aM=al}am=aM+28|0;if((a[am]&1)==0){c[s>>2]=c[am>>2];c[s+4>>2]=c[am+4>>2];c[s+8>>2]=c[am+8>>2]}else{am=c[aM+36>>2]|0;an=c[aM+32>>2]|0;if(an>>>0>4294967279>>>0){ah=2452;c[b+39832>>2]=1;break OL}if(an>>>0<11>>>0){a[s]=an<<1;aN=s+1|0}else{at=tu(an+16&-16)|0;c[(s+8|0)>>2]=at;c[(s|0)>>2]=an+16&-16|1;c[(s+4|0)>>2]=an;aN=at}tH(aN|0,am|0,an)|0;a[aN+an|0]=0}kb(s,(c[(d|0)>>2]|0)+(af*112|0)+16|0,0);if((a[s]&1)!=0){tw(c[(s+8|0)>>2]|0)}if((a[u]&1)!=0){tw(c[(u+8|0)>>2]|0)}c[w>>2]=ae;an=kc(ac,w)|0;am=tu(16)|0;c[(x+8|0)>>2]=am;c[(x|0)>>2]=17;c[(x+4|0)>>2]=11;tH(am|0,28120,11)|0;a[am+11|0]=0;am=kp(an,b+1152|0,x)|0;at=c[am>>2]|0;if((at|0)==0){ap=tu(40)|0;do{if((ap+16|0|0)!=0){if((a[x]&1)==0){c[(ap+16|0)>>2]=c[x>>2];c[(ap+16|0)+4>>2]=c[x+4>>2];c[(ap+16|0)+8>>2]=c[x+8>>2];break}ax=c[(x+8|0)>>2]|0;au=c[(x+4|0)>>2]|0;if(au>>>0>4294967279>>>0){ah=2471;c[b+39832>>2]=2;c[b+39836>>2]=16;break OL}if(au>>>0<11>>>0){a[ap+16|0]=au<<1;aO=ap+17|0}else{aC=tu(au+16&-16)|0;c[ap+24>>2]=aC;c[(ap+16|0)>>2]=au+16&-16|1;c[ap+20>>2]=au;aO=aC}tH(aO|0,ax|0,au)|0;a[aO+au|0]=0}}while(0);if((ap+28|0|0)!=0){tI(ap+28|0|0,0,12)|0}al=c[(b+1152|0)>>2]|0;c[ap>>2]=0;c[ap+4>>2]=0;c[ap+8>>2]=al;c[am>>2]=ap;al=c[c[(an|0)>>2]>>2]|0;if((al|0)==0){aP=ap}else{c[(an|0)>>2]=al;aP=c[am>>2]|0}jV(c[an+4>>2]|0,aP);c[(an+8|0)>>2]=(c[(an+8|0)>>2]|0)+1;aQ=ap}else{aQ=at}al=aQ+28|0;if((a[al]&1)==0){c[v>>2]=c[al>>2];c[v+4>>2]=c[al+4>>2];c[v+8>>2]=c[al+8>>2]}else{al=c[aQ+36>>2]|0;ak=c[aQ+32>>2]|0;if(ak>>>0>4294967279>>>0){ah=2490;c[b+39832>>2]=1;break OL}if(ak>>>0<11>>>0){a[v]=ak<<1;aR=v+1|0}else{av=tu(ak+16&-16)|0;c[(v+8|0)>>2]=av;c[(v|0)>>2]=ak+16&-16|1;c[(v+4|0)>>2]=ak;aR=av}tH(aR|0,al|0,ak)|0;a[aR+ak|0]=0}kb(v,(c[(d|0)>>2]|0)+(af*112|0)+20|0,0);if((a[v]&1)!=0){tw(c[(v+8|0)>>2]|0)}if((a[x]&1)!=0){tw(c[(x+8|0)>>2]|0)}c[z>>2]=ae;ak=kc(ac,z)|0;a[A]=14;a[A+1|0]=a[27080]|0;a[(A+1|0)+1|0]=a[27081]|0;a[(A+1|0)+2|0]=a[27082]|0;a[(A+1|0)+3|0]=a[27083]|0;a[(A+1|0)+4|0]=a[27084]|0;a[(A+1|0)+5|0]=a[27085]|0;a[(A+1|0)+6|0]=a[27086]|0;a[A+8|0]=0;al=kp(ak,b+1144|0,A)|0;av=c[al>>2]|0;if((av|0)==0){aj=tu(40)|0;do{if((aj+16|0|0)!=0){if((a[A]&1)==0){c[(aj+16|0)>>2]=c[A>>2];c[(aj+16|0)+4>>2]=c[A+4>>2];c[(aj+16|0)+8>>2]=c[A+8>>2];break}au=c[(A+8|0)>>2]|0;ax=c[(A+4|0)>>2]|0;if(ax>>>0>4294967279>>>0){ah=2508;c[b+39832>>2]=2;c[b+39836>>2]=16;break OL}if(ax>>>0<11>>>0){a[aj+16|0]=ax<<1;aS=aj+17|0}else{aC=tu(ax+16&-16)|0;c[aj+24>>2]=aC;c[(aj+16|0)>>2]=ax+16&-16|1;c[aj+20>>2]=ax;aS=aC}tH(aS|0,au|0,ax)|0;a[aS+ax|0]=0}}while(0);if((aj+28|0|0)!=0){tI(aj+28|0|0,0,12)|0}at=c[(b+1144|0)>>2]|0;c[aj>>2]=0;c[aj+4>>2]=0;c[aj+8>>2]=at;c[al>>2]=aj;at=c[c[(ak|0)>>2]>>2]|0;if((at|0)==0){aT=aj}else{c[(ak|0)>>2]=at;aT=c[al>>2]|0}jV(c[ak+4>>2]|0,aT);c[(ak+8|0)>>2]=(c[(ak+8|0)>>2]|0)+1;aU=aj}else{aU=av}at=aU+28|0;if((a[at]&1)==0){c[y>>2]=c[at>>2];c[y+4>>2]=c[at+4>>2];c[y+8>>2]=c[at+8>>2]}else{at=c[aU+36>>2]|0;ap=c[aU+32>>2]|0;if(ap>>>0>4294967279>>>0){ah=2527;c[b+39832>>2]=1;break OL}if(ap>>>0<11>>>0){a[y]=ap<<1;aV=y+1|0}else{an=tu(ap+16&-16)|0;c[(y+8|0)>>2]=an;c[(y|0)>>2]=ap+16&-16|1;c[(y+4|0)>>2]=ap;aV=an}tH(aV|0,at|0,ap)|0;a[aV+ap|0]=0}kb(y,(c[(d|0)>>2]|0)+(af*112|0)+24|0,0);if((a[y]&1)!=0){tw(c[(y+8|0)>>2]|0)}if((a[A]&1)!=0){tw(c[(A+8|0)>>2]|0)}c[D>>2]=ae;ap=kc(ac,D)|0;a[E]=18;tH(E+1|0|0,26600,9)|0;a[E+10|0]=0;at=kp(ap,b+1136|0,E)|0;an=c[at>>2]|0;if((an|0)==0){am=tu(40)|0;do{if((am+16|0|0)!=0){if((a[E]&1)==0){c[(am+16|0)>>2]=c[E>>2];c[(am+16|0)+4>>2]=c[E+4>>2];c[(am+16|0)+8>>2]=c[E+8>>2];break}ax=c[(E+8|0)>>2]|0;au=c[(E+4|0)>>2]|0;if(au>>>0>4294967279>>>0){ah=2545;c[b+39832>>2]=2;c[b+39836>>2]=16;break OL}if(au>>>0<11>>>0){a[am+16|0]=au<<1;aW=am+17|0}else{aC=tu(au+16&-16)|0;c[am+24>>2]=aC;c[(am+16|0)>>2]=au+16&-16|1;c[am+20>>2]=au;aW=aC}tH(aW|0,ax|0,au)|0;a[aW+au|0]=0}}while(0);if((am+28|0|0)!=0){tI(am+28|0|0,0,12)|0}av=c[(b+1136|0)>>2]|0;c[am>>2]=0;c[am+4>>2]=0;c[am+8>>2]=av;c[at>>2]=am;av=c[c[(ap|0)>>2]>>2]|0;if((av|0)==0){aX=am}else{c[(ap|0)>>2]=av;aX=c[at>>2]|0}jV(c[ap+4>>2]|0,aX);c[(ap+8|0)>>2]=(c[(ap+8|0)>>2]|0)+1;aY=am}else{aY=an}av=aY+28|0;if((a[av]&1)==0){c[B>>2]=c[av>>2];c[B+4>>2]=c[av+4>>2];c[B+8>>2]=c[av+8>>2]}else{av=c[aY+36>>2]|0;aj=c[aY+32>>2]|0;if(aj>>>0>4294967279>>>0){ah=2564;c[b+39832>>2]=1;break OL}if(aj>>>0<11>>>0){a[B]=aj<<1;aZ=B+1|0}else{ak=tu(aj+16&-16)|0;c[(B+8|0)>>2]=ak;c[(B|0)>>2]=aj+16&-16|1;c[(B+4|0)>>2]=aj;aZ=ak}tH(aZ|0,av|0,aj)|0;a[aZ+aj|0]=0}kb(B,(c[(d|0)>>2]|0)+(af*112|0)+28|0,0);if((a[B]&1)!=0){tw(c[(B+8|0)>>2]|0)}if((a[E]&1)!=0){tw(c[(E+8|0)>>2]|0)}c[G>>2]=ae;aj=kc(ac,G)|0;av=tu(16)|0;c[(H+8|0)>>2]=av;c[(H|0)>>2]=17;c[(H+4|0)>>2]=12;tH(av|0,25696,12)|0;a[av+12|0]=0;av=kp(aj,b+1128|0,H)|0;ak=c[av>>2]|0;if((ak|0)==0){al=tu(40)|0;do{if((al+16|0|0)!=0){if((a[H]&1)==0){c[(al+16|0)>>2]=c[H>>2];c[(al+16|0)+4>>2]=c[H+4>>2];c[(al+16|0)+8>>2]=c[H+8>>2];break}au=c[(H+8|0)>>2]|0;ax=c[(H+4|0)>>2]|0;if(ax>>>0>4294967279>>>0){ah=2583;c[b+39832>>2]=2;c[b+39836>>2]=16;break OL}if(ax>>>0<11>>>0){a[al+16|0]=ax<<1;a_=al+17|0}else{aC=tu(ax+16&-16)|0;c[al+24>>2]=aC;c[(al+16|0)>>2]=ax+16&-16|1;c[al+20>>2]=ax;a_=aC}tH(a_|0,au|0,ax)|0;a[a_+ax|0]=0}}while(0);if((al+28|0|0)!=0){tI(al+28|0|0,0,12)|0}an=c[(b+1128|0)>>2]|0;c[al>>2]=0;c[al+4>>2]=0;c[al+8>>2]=an;c[av>>2]=al;an=c[c[(aj|0)>>2]>>2]|0;if((an|0)==0){a$=al}else{c[(aj|0)>>2]=an;a$=c[av>>2]|0}jV(c[aj+4>>2]|0,a$);c[(aj+8|0)>>2]=(c[(aj+8|0)>>2]|0)+1;a0=al}else{a0=ak}an=a0+28|0;if((a[an]&1)==0){c[F>>2]=c[an>>2];c[F+4>>2]=c[an+4>>2];c[F+8>>2]=c[an+8>>2]}else{an=c[a0+36>>2]|0;am=c[a0+32>>2]|0;if(am>>>0>4294967279>>>0){ah=2602;c[b+39832>>2]=1;break OL}if(am>>>0<11>>>0){a[F]=am<<1;a1=F+1|0}else{ap=tu(am+16&-16)|0;c[(F+8|0)>>2]=ap;c[(F|0)>>2]=am+16&-16|1;c[(F+4|0)>>2]=am;a1=ap}tH(a1|0,an|0,am)|0;a[a1+am|0]=0}kb(F,(c[(d|0)>>2]|0)+(af*112|0)+32|0,0);if((a[F]&1)!=0){tw(c[(F+8|0)>>2]|0)}if((a[H]&1)!=0){tw(c[(H+8|0)>>2]|0)}c[J>>2]=ae;am=kc(ac,J)|0;a[K]=16;C=1399157621;a[K+1|0|0]=C;C=C>>8;a[(K+1|0|0)+1|0]=C;C=C>>8;a[(K+1|0|0)+2|0]=C;C=C>>8;a[(K+1|0|0)+3|0]=C;C=1953653108;a[(K+1|0)+4|0]=C;C=C>>8;a[((K+1|0)+4|0)+1|0]=C;C=C>>8;a[((K+1|0)+4|0)+2|0]=C;C=C>>8;a[((K+1|0)+4|0)+3|0]=C;a[K+9|0]=0;an=kp(am,b+1120|0,K)|0;ap=c[an>>2]|0;if((ap|0)==0){at=tu(40)|0;do{if((at+16|0|0)!=0){if((a[K]&1)==0){c[(at+16|0)>>2]=c[K>>2];c[(at+16|0)+4>>2]=c[K+4>>2];c[(at+16|0)+8>>2]=c[K+8>>2];break}ax=c[(K+8|0)>>2]|0;au=c[(K+4|0)>>2]|0;if(au>>>0>4294967279>>>0){ah=2620;c[b+39832>>2]=2;c[b+39836>>2]=16;break OL}if(au>>>0<11>>>0){a[at+16|0]=au<<1;a2=at+17|0}else{aC=tu(au+16&-16)|0;c[at+24>>2]=aC;c[(at+16|0)>>2]=au+16&-16|1;c[at+20>>2]=au;a2=aC}tH(a2|0,ax|0,au)|0;a[a2+au|0]=0}}while(0);if((at+28|0|0)!=0){tI(at+28|0|0,0,12)|0}ak=c[(b+1120|0)>>2]|0;c[at>>2]=0;c[at+4>>2]=0;c[at+8>>2]=ak;c[an>>2]=at;ak=c[c[(am|0)>>2]>>2]|0;if((ak|0)==0){a3=at}else{c[(am|0)>>2]=ak;a3=c[an>>2]|0}jV(c[am+4>>2]|0,a3);c[(am+8|0)>>2]=(c[(am+8|0)>>2]|0)+1;a4=at}else{a4=ap}ak=a4+28|0;if((a[ak]&1)==0){c[I>>2]=c[ak>>2];c[I+4>>2]=c[ak+4>>2];c[I+8>>2]=c[ak+8>>2];a5=a[I]|0}else{ak=c[a4+36>>2]|0;al=c[a4+32>>2]|0;if(al>>>0>4294967279>>>0){ah=2639;c[b+39832>>2]=1;break OL}if(al>>>0<11>>>0){a[I]=al<<1&255;a6=I+1|0;a7=al<<1&255}else{aj=tu(al+16&-16)|0;c[(I+8|0)>>2]=aj;c[(I|0)>>2]=al+16&-16|1;c[(I+4|0)>>2]=al;a6=aj;a7=(al+16&-16|1)&255}tH(a6|0,ak|0,al)|0;a[a6+al|0]=0;a5=a7}al=(c[(d|0)>>2]|0)+(af*112|0)+88|0;ak=a5&255;aj=(ak&1|0)==0?ak>>>1:c[(I+4|0)>>2]|0;ak=(a5&1)==0;av=c[(I+8|0)>>2]|0;au=tK((ak?I+1|0:av)|0,42e3,(aj>>>0>4>>>0?4:aj)|0)|0;if((au|0)==0){a8=aj>>>0<4>>>0?-1:aj>>>0>4>>>0&1}else{a8=au}a[al]=(a8|0)==0|0;if(!ak){tw(av)}if((a[K]&1)!=0){tw(c[(K+8|0)>>2]|0)}c[M>>2]=ae;av=kc(ac,M)|0;a[N]=10;a[N+1|0]=a[39368]|0;a[(N+1|0)+1|0]=a[39369]|0;a[(N+1|0)+2|0]=a[39370]|0;a[(N+1|0)+3|0]=a[39371]|0;a[(N+1|0)+4|0]=a[39372]|0;a[N+6|0]=0;ak=kp(av,b+1112|0,N)|0;al=c[ak>>2]|0;if((al|0)==0){au=tu(40)|0;do{if((au+16|0|0)!=0){if((a[N]&1)==0){c[(au+16|0)>>2]=c[N>>2];c[(au+16|0)+4>>2]=c[N+4>>2];c[(au+16|0)+8>>2]=c[N+8>>2];break}aj=c[(N+8|0)>>2]|0;ax=c[(N+4|0)>>2]|0;if(ax>>>0>4294967279>>>0){ah=2659;c[b+39832>>2]=2;c[b+39836>>2]=16;break OL}if(ax>>>0<11>>>0){a[au+16|0]=ax<<1;a9=au+17|0}else{aC=tu(ax+16&-16)|0;c[au+24>>2]=aC;c[(au+16|0)>>2]=ax+16&-16|1;c[au+20>>2]=ax;a9=aC}tH(a9|0,aj|0,ax)|0;a[a9+ax|0]=0}}while(0);if((au+28|0|0)!=0){tI(au+28|0|0,0,12)|0}ap=c[(b+1112|0)>>2]|0;c[au>>2]=0;c[au+4>>2]=0;c[au+8>>2]=ap;c[ak>>2]=au;ap=c[c[(av|0)>>2]>>2]|0;if((ap|0)==0){ba=au}else{c[(av|0)>>2]=ap;ba=c[ak>>2]|0}jV(c[av+4>>2]|0,ba);c[(av+8|0)>>2]=(c[(av+8|0)>>2]|0)+1;bb=au}else{bb=al}ap=bb+28|0;if((a[ap]&1)==0){c[L>>2]=c[ap>>2];c[L+4>>2]=c[ap+4>>2];c[L+8>>2]=c[ap+8>>2]}else{ap=c[bb+36>>2]|0;at=c[bb+32>>2]|0;if(at>>>0>4294967279>>>0){ah=2678;c[b+39832>>2]=1;break OL}if(at>>>0<11>>>0){a[L]=at<<1;bc=L+1|0}else{am=tu(at+16&-16)|0;c[(L+8|0)>>2]=am;c[(L|0)>>2]=at+16&-16|1;c[(L+4|0)>>2]=at;bc=am}tH(bc|0,ap|0,at)|0;a[bc+at|0]=0}ka(L,(c[(d|0)>>2]|0)+(af*112|0)+96|0,0.0);if((a[L]&1)!=0){tw(c[(L+8|0)>>2]|0)}if((a[N]&1)!=0){tw(c[(N+8|0)>>2]|0)}c[P>>2]=ae;at=kc(ac,P)|0;a[Q]=10;a[Q+1|0]=a[25288]|0;a[(Q+1|0)+1|0]=a[25289]|0;a[(Q+1|0)+2|0]=a[25290]|0;a[(Q+1|0)+3|0]=a[25291]|0;a[(Q+1|0)+4|0]=a[25292]|0;a[Q+6|0]=0;ap=kp(at,b+1104|0,Q)|0;am=c[ap>>2]|0;if((am|0)==0){an=tu(40)|0;do{if((an+16|0|0)!=0){if((a[Q]&1)==0){c[(an+16|0)>>2]=c[Q>>2];c[(an+16|0)+4>>2]=c[Q+4>>2];c[(an+16|0)+8>>2]=c[Q+8>>2];break}ax=c[(Q+8|0)>>2]|0;aj=c[(Q+4|0)>>2]|0;if(aj>>>0>4294967279>>>0){ah=2696;c[b+39832>>2]=2;c[b+39836>>2]=16;break OL}if(aj>>>0<11>>>0){a[an+16|0]=aj<<1;bd=an+17|0}else{aC=tu(aj+16&-16)|0;c[an+24>>2]=aC;c[(an+16|0)>>2]=aj+16&-16|1;c[an+20>>2]=aj;bd=aC}tH(bd|0,ax|0,aj)|0;a[bd+aj|0]=0}}while(0);if((an+28|0|0)!=0){tI(an+28|0|0,0,12)|0}al=c[(b+1104|0)>>2]|0;c[an>>2]=0;c[an+4>>2]=0;c[an+8>>2]=al;c[ap>>2]=an;al=c[c[(at|0)>>2]>>2]|0;if((al|0)==0){be=an}else{c[(at|0)>>2]=al;be=c[ap>>2]|0}jV(c[at+4>>2]|0,be);c[(at+8|0)>>2]=(c[(at+8|0)>>2]|0)+1;bf=an}else{bf=am}al=bf+28|0;if((a[al]&1)==0){c[O>>2]=c[al>>2];c[O+4>>2]=c[al+4>>2];c[O+8>>2]=c[al+8>>2];bg=a[O]|0}else{al=c[bf+36>>2]|0;au=c[bf+32>>2]|0;if(au>>>0>4294967279>>>0){ah=2715;c[b+39832>>2]=1;break OL}if(au>>>0<11>>>0){a[O]=au<<1&255;bh=O+1|0;bi=au<<1&255}else{av=tu(au+16&-16)|0;c[(O+8|0)>>2]=av;c[(O|0)>>2]=au+16&-16|1;c[(O+4|0)>>2]=au;bh=av;bi=(au+16&-16|1)&255}tH(bh|0,al|0,au)|0;a[bh+au|0]=0;bg=bi}au=(c[(d|0)>>2]|0)+(af*112|0)+72|0;al=bg&255;av=(al&1|0)==0?al>>>1:c[(O+4|0)>>2]|0;al=(bg&1)==0;ak=c[(O+8|0)>>2]|0;aj=tK((al?O+1|0:ak)|0,42e3,(av>>>0>4>>>0?4:av)|0)|0;if((aj|0)==0){bj=av>>>0<4>>>0?-1:av>>>0>4>>>0&1}else{bj=aj}a[au]=(bj|0)==0|0;if(!al){tw(ak)}if((a[Q]&1)!=0){tw(c[(Q+8|0)>>2]|0)}c[S>>2]=ae;ak=kc(ac,S)|0;a[T]=20;tH(T+1|0|0,24848,10)|0;a[T+11|0]=0;al=kp(ak,b+1096|0,T)|0;au=c[al>>2]|0;if((au|0)==0){aj=tu(40)|0;do{if((aj+16|0|0)!=0){if((a[T]&1)==0){c[(aj+16|0)>>2]=c[T>>2];c[(aj+16|0)+4>>2]=c[T+4>>2];c[(aj+16|0)+8>>2]=c[T+8>>2];break}av=c[(T+8|0)>>2]|0;ax=c[(T+4|0)>>2]|0;if(ax>>>0>4294967279>>>0){ah=2735;c[b+39832>>2]=2;c[b+39836>>2]=16;break OL}if(ax>>>0<11>>>0){a[aj+16|0]=ax<<1;bk=aj+17|0}else{aC=tu(ax+16&-16)|0;c[aj+24>>2]=aC;c[(aj+16|0)>>2]=ax+16&-16|1;c[aj+20>>2]=ax;bk=aC}tH(bk|0,av|0,ax)|0;a[bk+ax|0]=0}}while(0);if((aj+28|0|0)!=0){tI(aj+28|0|0,0,12)|0}am=c[(b+1096|0)>>2]|0;c[aj>>2]=0;c[aj+4>>2]=0;c[aj+8>>2]=am;c[al>>2]=aj;am=c[c[(ak|0)>>2]>>2]|0;if((am|0)==0){bl=aj}else{c[(ak|0)>>2]=am;bl=c[al>>2]|0}jV(c[ak+4>>2]|0,bl);c[(ak+8|0)>>2]=(c[(ak+8|0)>>2]|0)+1;bm=aj}else{bm=au}am=bm+28|0;if((a[am]&1)==0){c[R>>2]=c[am>>2];c[R+4>>2]=c[am+4>>2];c[R+8>>2]=c[am+8>>2];bn=a[R]|0}else{am=c[bm+36>>2]|0;an=c[bm+32>>2]|0;if(an>>>0>4294967279>>>0){ah=2754;c[b+39832>>2]=1;break OL}if(an>>>0<11>>>0){a[R]=an<<1&255;bo=R+1|0;bp=an<<1&255}else{at=tu(an+16&-16)|0;c[(R+8|0)>>2]=at;c[(R|0)>>2]=an+16&-16|1;c[(R+4|0)>>2]=an;bo=at;bp=(an+16&-16|1)&255}tH(bo|0,am|0,an)|0;a[bo+an|0]=0;bn=bp}an=(c[(d|0)>>2]|0)+(af*112|0)+73|0;am=bn&255;at=(am&1|0)==0?am>>>1:c[(R+4|0)>>2]|0;am=(bn&1)==0;ap=c[(R+8|0)>>2]|0;ax=tK((am?R+1|0:ap)|0,42e3,(at>>>0>4>>>0?4:at)|0)|0;if((ax|0)==0){bq=at>>>0<4>>>0?-1:at>>>0>4>>>0&1}else{bq=ax}a[an]=(bq|0)==0|0;if(!am){tw(ap)}if((a[T]&1)!=0){tw(c[(T+8|0)>>2]|0)}c[V>>2]=ae;ap=kc(ac,V)|0;a[W]=14;a[W+1|0]=a[24768]|0;a[(W+1|0)+1|0]=a[24769]|0;a[(W+1|0)+2|0]=a[24770]|0;a[(W+1|0)+3|0]=a[24771]|0;a[(W+1|0)+4|0]=a[24772]|0;a[(W+1|0)+5|0]=a[24773]|0;a[(W+1|0)+6|0]=a[24774]|0;a[W+8|0]=0;am=kp(ap,b+1088|0,W)|0;an=c[am>>2]|0;if((an|0)==0){ax=tu(40)|0;do{if((ax+16|0|0)!=0){if((a[W]&1)==0){c[(ax+16|0)>>2]=c[W>>2];c[(ax+16|0)+4>>2]=c[W+4>>2];c[(ax+16|0)+8>>2]=c[W+8>>2];break}at=c[(W+8|0)>>2]|0;av=c[(W+4|0)>>2]|0;if(av>>>0>4294967279>>>0){ah=2774;c[b+39832>>2]=2;c[b+39836>>2]=16;break OL}if(av>>>0<11>>>0){a[ax+16|0]=av<<1;br=ax+17|0}else{aC=tu(av+16&-16)|0;c[ax+24>>2]=aC;c[(ax+16|0)>>2]=av+16&-16|1;c[ax+20>>2]=av;br=aC}tH(br|0,at|0,av)|0;a[br+av|0]=0}}while(0);if((ax+28|0|0)!=0){tI(ax+28|0|0,0,12)|0}au=c[(b+1088|0)>>2]|0;c[ax>>2]=0;c[ax+4>>2]=0;c[ax+8>>2]=au;c[am>>2]=ax;au=c[c[(ap|0)>>2]>>2]|0;if((au|0)==0){bs=ax}else{c[(ap|0)>>2]=au;bs=c[am>>2]|0}jV(c[ap+4>>2]|0,bs);c[(ap+8|0)>>2]=(c[(ap+8|0)>>2]|0)+1;bt=ax}else{bt=an}au=bt+28|0;if((a[au]&1)==0){c[U>>2]=c[au>>2];c[U+4>>2]=c[au+4>>2];c[U+8>>2]=c[au+8>>2]}else{au=c[bt+36>>2]|0;aj=c[bt+32>>2]|0;if(aj>>>0>4294967279>>>0){ah=2793;c[b+39832>>2]=1;break OL}if(aj>>>0<11>>>0){a[U]=aj<<1;bu=U+1|0}else{ak=tu(aj+16&-16)|0;c[(U+8|0)>>2]=ak;c[(U|0)>>2]=aj+16&-16|1;c[(U+4|0)>>2]=aj;bu=ak}tH(bu|0,au|0,aj)|0;a[bu+aj|0]=0}ka(U,(c[(d|0)>>2]|0)+(af*112|0)+80|0,0.0);if((a[U]&1)!=0){tw(c[(U+8|0)>>2]|0)}if((a[W]&1)!=0){tw(c[(W+8|0)>>2]|0)}c[Y>>2]=ae;aj=kc(ac,Y)|0;a[Z]=6;a[Z+1|0]=a[24672]|0;a[(Z+1|0)+1|0]=a[24673]|0;a[(Z+1|0)+2|0]=a[24674]|0;a[Z+4|0]=0;au=kp(aj,b+1080|0,Z)|0;ak=c[au>>2]|0;if((ak|0)==0){al=tu(40)|0;do{if((al+16|0|0)!=0){if((a[Z]&1)==0){c[(al+16|0)>>2]=c[Z>>2];c[(al+16|0)+4>>2]=c[Z+4>>2];c[(al+16|0)+8>>2]=c[Z+8>>2];break}av=c[(Z+8|0)>>2]|0;at=c[(Z+4|0)>>2]|0;if(at>>>0>4294967279>>>0){ah=2811;c[b+39832>>2]=2;c[b+39836>>2]=16;break OL}if(at>>>0<11>>>0){a[al+16|0]=at<<1;bv=al+17|0}else{aC=tu(at+16&-16)|0;c[al+24>>2]=aC;c[(al+16|0)>>2]=at+16&-16|1;c[al+20>>2]=at;bv=aC}tH(bv|0,av|0,at)|0;a[bv+at|0]=0}}while(0);if((al+28|0|0)!=0){tI(al+28|0|0,0,12)|0}an=c[(b+1080|0)>>2]|0;c[al>>2]=0;c[al+4>>2]=0;c[al+8>>2]=an;c[au>>2]=al;an=c[c[(aj|0)>>2]>>2]|0;if((an|0)==0){bw=al}else{c[(aj|0)>>2]=an;bw=c[au>>2]|0}jV(c[aj+4>>2]|0,bw);c[(aj+8|0)>>2]=(c[(aj+8|0)>>2]|0)+1;bx=al}else{bx=ak}an=bx+28|0;if((a[an]&1)==0){c[X>>2]=c[an>>2];c[X+4>>2]=c[an+4>>2];c[X+8>>2]=c[an+8>>2]}else{an=c[bx+36>>2]|0;ax=c[bx+32>>2]|0;if(ax>>>0>4294967279>>>0){ah=2830;c[b+39832>>2]=1;break OL}if(ax>>>0<11>>>0){a[X]=ax<<1;by=X+1|0}else{ap=tu(ax+16&-16)|0;c[(X+8|0)>>2]=ap;c[(X|0)>>2]=ax+16&-16|1;c[(X+4|0)>>2]=ax;by=ap}tH(by|0,an|0,ax)|0;a[by+ax|0]=0}ka(X,(c[(d|0)>>2]|0)+(af*112|0)+56|0,-1.7976931348623157e+308);if((a[X]&1)!=0){tw(c[(X+8|0)>>2]|0)}if((a[Z]&1)!=0){tw(c[(Z+8|0)>>2]|0)}c[$>>2]=ae;ax=kc(ac,$)|0;a[aa]=6;a[aa+1|0]=a[24600]|0;a[(aa+1|0)+1|0]=a[24601]|0;a[(aa+1|0)+2|0]=a[24602]|0;a[aa+4|0]=0;an=kp(ax,b+1072|0,aa)|0;ap=c[an>>2]|0;if((ap|0)==0){am=tu(40)|0;do{if((am+16|0|0)!=0){if((a[aa]&1)==0){c[(am+16|0)>>2]=c[aa>>2];c[(am+16|0)+4>>2]=c[aa+4>>2];c[(am+16|0)+8>>2]=c[aa+8>>2];break}at=c[(aa+8|0)>>2]|0;av=c[(aa+4|0)>>2]|0;if(av>>>0>4294967279>>>0){ah=2848;c[b+39832>>2]=2;c[b+39836>>2]=16;break OL}if(av>>>0<11>>>0){a[am+16|0]=av<<1;bz=am+17|0}else{aC=tu(av+16&-16)|0;c[am+24>>2]=aC;c[(am+16|0)>>2]=av+16&-16|1;c[am+20>>2]=av;bz=aC}tH(bz|0,at|0,av)|0;a[bz+av|0]=0}}while(0);if((am+28|0|0)!=0){tI(am+28|0|0,0,12)|0}ak=c[(b+1072|0)>>2]|0;c[am>>2]=0;c[am+4>>2]=0;c[am+8>>2]=ak;c[an>>2]=am;ak=c[c[(ax|0)>>2]>>2]|0;if((ak|0)==0){bA=am}else{c[(ax|0)>>2]=ak;bA=c[an>>2]|0}jV(c[ax+4>>2]|0,bA);c[(ax+8|0)>>2]=(c[(ax+8|0)>>2]|0)+1;bB=am}else{bB=ap}ak=bB+28|0;if((a[ak]&1)==0){c[_>>2]=c[ak>>2];c[_+4>>2]=c[ak+4>>2];c[_+8>>2]=c[ak+8>>2]}else{ak=c[bB+36>>2]|0;al=c[bB+32>>2]|0;if(al>>>0>4294967279>>>0){ah=2867;c[b+39832>>2]=1;break OL}if(al>>>0<11>>>0){a[_]=al<<1;bC=_+1|0}else{aj=tu(al+16&-16)|0;c[(_+8|0)>>2]=aj;c[(_|0)>>2]=al+16&-16|1;c[(_+4|0)>>2]=al;bC=aj}tH(bC|0,ak|0,al)|0;a[bC+al|0]=0}ka(_,(c[(d|0)>>2]|0)+(af*112|0)+64|0,1.7976931348623157e+308);if((a[_]&1)!=0){tw(c[(_+8|0)>>2]|0)}if((a[aa]&1)!=0){tw(c[(aa+8|0)>>2]|0)}al=c[(d|0)>>2]|0;ak=(a[al+(af*112|0)+88|0]|0)!=0;bD=+h[al+(af*112|0)+96>>3];aj=(a[al+(af*112|0)+72|0]|0)!=0?42e3:42440;au=(a[al+(af*112|0)+73|0]|0)!=0;bE=+h[al+(af*112|0)+80>>3];bF=+h[al+(af*112|0)+56>>3];bG=+h[al+(af*112|0)+64>>3];hA(4,0,24480,(ai=i,i=i+80|0,c[ai>>2]=c[al+(af*112|0)+4>>2],c[ai+8>>2]=ak?93904:24160,h[ai+16>>3]=bD,c[ai+24>>2]=ak?93904:24064,c[ai+32>>2]=aj,c[ai+40>>2]=au?93904:24160,h[ai+48>>3]=bE,c[ai+56>>2]=au?93904:24064,h[ai+64>>3]=bF,h[ai+72>>3]=bG,ai)|0);i=ai;au=c[(d|0)>>2]|0;aj=c[au+(af*112|0)+4>>2]|0;if((a[aj]|0)==36){a[au+(af*112|0)+104|0]=1;bH=c[(c[(d|0)>>2]|0)+(af*112|0)+4>>2]|0}else{bH=aj}aj=tD(bH|0)|0;if(aj>>>0>4294967279>>>0){ah=2958;c[b+39832>>2]=1;break OL}if(aj>>>0<11>>>0){a[ab]=aj<<1;bI=ab+1|0}else{au=tu(aj+16&-16)|0;c[(ab+8|0)>>2]=au;c[(ab|0)>>2]=aj+16&-16|1;c[(ab+4|0)>>2]=aj;bI=au}tH(bI|0,bH|0,aj)|0;a[bI+aj|0]=0;c[(ke(e,ab)|0)>>2]=af;if((a[ab]&1)!=0){tw(c[(ab+8|0)>>2]|0)}ae=ae+1|0;ad=c[(d+104|0)>>2]<<1;if((ae|0)>=((c[(d+108|0)>>2]|0)-ad|0)){c[b+39832>>2]=2;c[b+39836>>2]=17;break OL}}while(0);c[b+15376>>2]=ad;c[b+15384>>2]=ae;c[b+39768>>2]=ah;c[b+39776>>2]=ai}function _read_input_xml$6(b){b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0.0,bE=0.0,bF=0.0,bG=0.0,bH=0,bI=0,bJ=0;d=c[b+1904>>2]|0;e=c[b+1928>>2]|0;f=c[b+2728>>2]|0;g=c[b+2744>>2]|0;j=c[b+2752>>2]|0;k=c[b+2760>>2]|0;l=c[b+2768>>2]|0;m=c[b+2776>>2]|0;n=c[b+2784>>2]|0;o=c[b+2792>>2]|0;p=c[b+2800>>2]|0;q=c[b+2808>>2]|0;r=c[b+2816>>2]|0;s=c[b+2824>>2]|0;t=c[b+2832>>2]|0;u=c[b+2840>>2]|0;v=c[b+2848>>2]|0;w=c[b+2856>>2]|0;x=c[b+2864>>2]|0;y=c[b+2872>>2]|0;z=c[b+2880>>2]|0;A=c[b+2888>>2]|0;B=c[b+2896>>2]|0;D=c[b+2904>>2]|0;E=c[b+2912>>2]|0;F=c[b+2920>>2]|0;G=c[b+2928>>2]|0;H=c[b+2936>>2]|0;I=c[b+2944>>2]|0;J=c[b+2952>>2]|0;K=c[b+2960>>2]|0;L=c[b+2968>>2]|0;M=c[b+2976>>2]|0;N=c[b+2984>>2]|0;O=c[b+2992>>2]|0;P=c[b+3e3>>2]|0;Q=c[b+3008>>2]|0;R=c[b+3016>>2]|0;S=c[b+3024>>2]|0;T=c[b+3032>>2]|0;U=c[b+3040>>2]|0;V=c[b+3048>>2]|0;W=c[b+3056>>2]|0;X=c[b+3064>>2]|0;Y=c[b+3072>>2]|0;Z=c[b+3080>>2]|0;_=c[b+3088>>2]|0;$=c[b+3096>>2]|0;aa=c[b+3104>>2]|0;ab=c[b+3112>>2]|0;ac=c[b+12744>>2]|0;ad=c[b+12752>>2]|0;ae=c[b+12760>>2]|0;af=c[b+12768>>2]|0;ag=c[b+12776>>2]|0;ah=c[b+39768>>2]|0;ai=c[b+39776>>2]|0;OL:do{if((ag|0)==0){aj=tu(40)|0;do{if((aj+16|0|0)!=0){if((a[g]&1)==0){c[(aj+16|0)>>2]=c[g>>2];c[(aj+16|0)+4>>2]=c[g+4>>2];c[(aj+16|0)+8>>2]=c[g+8>>2];break}ak=c[(g+8|0)>>2]|0;al=c[(g+4|0)>>2]|0;if(al>>>0>4294967279>>>0){ah=1567;c[b+39840>>2]=2;c[b+39844>>2]=16;break OL}if(al>>>0<11>>>0){a[aj+16|0]=al<<1;am=aj+17|0}else{an=tu(al+16&-16)|0;c[aj+24>>2]=an;c[(aj+16|0)>>2]=al+16&-16|1;c[aj+20>>2]=al;am=an}tH(am|0,ak|0,al)|0;a[am+al|0]=0}}while(0);if((aj+28|0|0)!=0){tI(aj+28|0|0,0,12)|0}al=c[(b+1320|0)>>2]|0;c[aj>>2]=0;c[aj+4>>2]=0;c[aj+8>>2]=al;c[af>>2]=aj;al=c[c[(ae|0)>>2]>>2]|0;if((al|0)==0){ao=aj}else{c[(ae|0)>>2]=al;ao=c[af>>2]|0}jV(c[ae+4>>2]|0,ao);c[(ae+8|0)>>2]=(c[(ae+8|0)>>2]|0)+1;ap=aj}else{ap=ag}al=ap+28|0;if((a[al]&1)==0){c[f>>2]=c[al>>2];c[f+4>>2]=c[al+4>>2];c[f+8>>2]=c[al+8>>2]}else{al=c[ap+36>>2]|0;ak=c[ap+32>>2]|0;if(ak>>>0>4294967279>>>0){ah=1586;c[b+39840>>2]=1;break OL}if(ak>>>0<11>>>0){a[f]=ak<<1;aq=f+1|0}else{an=tu(ak+16&-16)|0;c[(f+8|0)>>2]=an;c[(f|0)>>2]=ak+16&-16|1;c[(f+4|0)>>2]=ak;aq=an}tH(aq|0,al|0,ak)|0;a[aq+ak|0]=0}ak=(c[(d|0)>>2]|0)+(((c[(d+104|0)>>2]|0)+ad|0)*112|0)+4|0;if((ak|0)==0){hC(19,0,49832,(ai=i,i=i+1|0,i=i+7&-8,c[ai>>2]=0,ai)|0);i=ai}else{c[ak>>2]=cj(((a[f]&1)==0?f+1|0:c[(f+8|0)>>2]|0)|0)|0}if((a[f]&1)!=0){tw(c[(f+8|0)>>2]|0)}if((a[g]&1)!=0){tw(c[(g+8|0)>>2]|0)}c[k>>2]=ad;ak=kc(ac,k)|0;al=tu(16)|0;c[(l+8|0)>>2]=al;c[(l|0)>>2]=17;c[(l+4|0)>>2]=14;tH(al|0,30344,14)|0;a[al+14|0]=0;al=kp(ak,b+1312|0,l)|0;an=c[al>>2]|0;if((an|0)==0){ar=tu(40)|0;do{if((ar+16|0|0)!=0){if((a[l]&1)==0){c[(ar+16|0)>>2]=c[l>>2];c[(ar+16|0)+4>>2]=c[l+4>>2];c[(ar+16|0)+8>>2]=c[l+8>>2];break}as=c[(l+8|0)>>2]|0;at=c[(l+4|0)>>2]|0;if(at>>>0>4294967279>>>0){ah=1608;c[b+39840>>2]=2;c[b+39844>>2]=16;break OL}if(at>>>0<11>>>0){a[ar+16|0]=at<<1;au=ar+17|0}else{av=tu(at+16&-16)|0;c[ar+24>>2]=av;c[(ar+16|0)>>2]=at+16&-16|1;c[ar+20>>2]=at;au=av}tH(au|0,as|0,at)|0;a[au+at|0]=0}}while(0);if((ar+28|0|0)!=0){tI(ar+28|0|0,0,12)|0}aj=c[(b+1312|0)>>2]|0;c[ar>>2]=0;c[ar+4>>2]=0;c[ar+8>>2]=aj;c[al>>2]=ar;aj=c[c[(ak|0)>>2]>>2]|0;if((aj|0)==0){aw=ar}else{c[(ak|0)>>2]=aj;aw=c[al>>2]|0}jV(c[ak+4>>2]|0,aw);c[(ak+8|0)>>2]=(c[(ak+8|0)>>2]|0)+1;ax=ar}else{ax=an}aj=ax+28|0;if((a[aj]&1)==0){c[j>>2]=c[aj>>2];c[j+4>>2]=c[aj+4>>2];c[j+8>>2]=c[aj+8>>2]}else{aj=c[ax+36>>2]|0;at=c[ax+32>>2]|0;if(at>>>0>4294967279>>>0){ah=1627;c[b+39840>>2]=1;break OL}if(at>>>0<11>>>0){a[j]=at<<1;ay=j+1|0}else{as=tu(at+16&-16)|0;c[(j+8|0)>>2]=as;c[(j|0)>>2]=at+16&-16|1;c[(j+4|0)>>2]=at;ay=as}tH(ay|0,aj|0,at)|0;a[ay+at|0]=0}kd(j,(c[(d|0)>>2]|0)+(((c[(d+104|0)>>2]|0)+ad|0)*112|0)|0);if((a[j]&1)!=0){tw(c[(j+8|0)>>2]|0)}if((a[l]&1)!=0){tw(c[(l+8|0)>>2]|0)}c[n>>2]=ad;at=kc(ac,n)|0;aj=tu(16)|0;c[(o+8|0)>>2]=aj;c[(o|0)>>2]=17;c[(o+4|0)>>2]=11;tH(aj|0,3e4,11)|0;a[aj+11|0]=0;aj=kp(at,b+1304|0,o)|0;as=c[aj>>2]|0;if((as|0)==0){av=tu(40)|0;do{if((av+16|0|0)!=0){if((a[o]&1)==0){c[(av+16|0)>>2]=c[o>>2];c[(av+16|0)+4>>2]=c[o+4>>2];c[(av+16|0)+8>>2]=c[o+8>>2];break}az=c[(o+8|0)>>2]|0;aA=c[(o+4|0)>>2]|0;if(aA>>>0>4294967279>>>0){ah=1646;c[b+39840>>2]=2;c[b+39844>>2]=16;break OL}if(aA>>>0<11>>>0){a[av+16|0]=aA<<1;aB=av+17|0}else{aC=tu(aA+16&-16)|0;c[av+24>>2]=aC;c[(av+16|0)>>2]=aA+16&-16|1;c[av+20>>2]=aA;aB=aC}tH(aB|0,az|0,aA)|0;a[aB+aA|0]=0}}while(0);if((av+28|0|0)!=0){tI(av+28|0|0,0,12)|0}an=c[(b+1304|0)>>2]|0;c[av>>2]=0;c[av+4>>2]=0;c[av+8>>2]=an;c[aj>>2]=av;an=c[c[(at|0)>>2]>>2]|0;if((an|0)==0){aD=av}else{c[(at|0)>>2]=an;aD=c[aj>>2]|0}jV(c[at+4>>2]|0,aD);c[(at+8|0)>>2]=(c[(at+8|0)>>2]|0)+1;aE=av}else{aE=as}an=aE+28|0;if((a[an]&1)==0){c[m>>2]=c[an>>2];c[m+4>>2]=c[an+4>>2];c[m+8>>2]=c[an+8>>2]}else{an=c[aE+36>>2]|0;ar=c[aE+32>>2]|0;if(ar>>>0>4294967279>>>0){ah=1665;c[b+39840>>2]=1;break OL}if(ar>>>0<11>>>0){a[m]=ar<<1;aF=m+1|0}else{ak=tu(ar+16&-16)|0;c[(m+8|0)>>2]=ak;c[(m|0)>>2]=ar+16&-16|1;c[(m+4|0)>>2]=ar;aF=ak}tH(aF|0,an|0,ar)|0;a[aF+ar|0]=0}ar=(c[(d|0)>>2]|0)+(((c[(d+104|0)>>2]|0)+ad|0)*112|0)+8|0;if((ar|0)==0){hC(19,0,49832,(ai=i,i=i+1|0,i=i+7&-8,c[ai>>2]=0,ai)|0);i=ai}else{c[ar>>2]=cj(((a[m]&1)==0?m+1|0:c[(m+8|0)>>2]|0)|0)|0}if((a[m]&1)!=0){tw(c[(m+8|0)>>2]|0)}if((a[o]&1)!=0){tw(c[(o+8|0)>>2]|0)}c[q>>2]=ad;ar=kc(ac,q)|0;a[r]=16;C=1701603686;a[r+1|0|0]=C;C=C>>8;a[(r+1|0|0)+1|0]=C;C=C>>8;a[(r+1|0|0)+2|0]=C;C=C>>8;a[(r+1|0|0)+3|0]=C;C=1701667150;a[(r+1|0)+4|0]=C;C=C>>8;a[((r+1|0)+4|0)+1|0]=C;C=C>>8;a[((r+1|0)+4|0)+2|0]=C;C=C>>8;a[((r+1|0)+4|0)+3|0]=C;a[r+9|0]=0;an=kp(ar,b+1296|0,r)|0;ak=c[an>>2]|0;if((ak|0)==0){al=tu(40)|0;do{if((al+16|0|0)!=0){if((a[r]&1)==0){c[(al+16|0)>>2]=c[r>>2];c[(al+16|0)+4>>2]=c[r+4>>2];c[(al+16|0)+8>>2]=c[r+8>>2];break}aA=c[(r+8|0)>>2]|0;az=c[(r+4|0)>>2]|0;if(az>>>0>4294967279>>>0){ah=1686;c[b+39840>>2]=2;c[b+39844>>2]=16;break OL}if(az>>>0<11>>>0){a[al+16|0]=az<<1;aG=al+17|0}else{aC=tu(az+16&-16)|0;c[al+24>>2]=aC;c[(al+16|0)>>2]=az+16&-16|1;c[al+20>>2]=az;aG=aC}tH(aG|0,aA|0,az)|0;a[aG+az|0]=0}}while(0);if((al+28|0|0)!=0){tI(al+28|0|0,0,12)|0}as=c[(b+1296|0)>>2]|0;c[al>>2]=0;c[al+4>>2]=0;c[al+8>>2]=as;c[an>>2]=al;as=c[c[(ar|0)>>2]>>2]|0;if((as|0)==0){aH=al}else{c[(ar|0)>>2]=as;aH=c[an>>2]|0}jV(c[ar+4>>2]|0,aH);c[(ar+8|0)>>2]=(c[(ar+8|0)>>2]|0)+1;aI=al}else{aI=ak}as=aI+28|0;if((a[as]&1)==0){c[p>>2]=c[as>>2];c[p+4>>2]=c[as+4>>2];c[p+8>>2]=c[as+8>>2]}else{as=c[aI+36>>2]|0;av=c[aI+32>>2]|0;if(av>>>0>4294967279>>>0){ah=1705;c[b+39840>>2]=1;break OL}if(av>>>0<11>>>0){a[p]=av<<1;aJ=p+1|0}else{at=tu(av+16&-16)|0;c[(p+8|0)>>2]=at;c[(p|0)>>2]=av+16&-16|1;c[(p+4|0)>>2]=av;aJ=at}tH(aJ|0,as|0,av)|0;a[aJ+av|0]=0}av=(c[(d|0)>>2]|0)+(((c[(d+104|0)>>2]|0)+ad|0)*112|0)+12|0;if((av|0)==0){hC(19,0,49832,(ai=i,i=i+1|0,i=i+7&-8,c[ai>>2]=0,ai)|0);i=ai}else{c[av>>2]=cj(((a[p]&1)==0?p+1|0:c[(p+8|0)>>2]|0)|0)|0}if((a[p]&1)!=0){tw(c[(p+8|0)>>2]|0)}if((a[r]&1)!=0){tw(c[(r+8|0)>>2]|0)}c[t>>2]=ad;av=kc(ac,t)|0;a[u]=18;tH(u+1|0|0,28704,9)|0;a[u+10|0]=0;as=kp(av,b+1288|0,u)|0;at=c[as>>2]|0;if((at|0)==0){aj=tu(40)|0;do{if((aj+16|0|0)!=0){if((a[u]&1)==0){c[(aj+16|0)>>2]=c[u>>2];c[(aj+16|0)+4>>2]=c[u+4>>2];c[(aj+16|0)+8>>2]=c[u+8>>2];break}az=c[(u+8|0)>>2]|0;aA=c[(u+4|0)>>2]|0;if(aA>>>0>4294967279>>>0){ah=1726;c[b+39840>>2]=2;c[b+39844>>2]=16;break OL}if(aA>>>0<11>>>0){a[aj+16|0]=aA<<1;aK=aj+17|0}else{aC=tu(aA+16&-16)|0;c[aj+24>>2]=aC;c[(aj+16|0)>>2]=aA+16&-16|1;c[aj+20>>2]=aA;aK=aC}tH(aK|0,az|0,aA)|0;a[aK+aA|0]=0}}while(0);if((aj+28|0|0)!=0){tI(aj+28|0|0,0,12)|0}ak=c[(b+1288|0)>>2]|0;c[aj>>2]=0;c[aj+4>>2]=0;c[aj+8>>2]=ak;c[as>>2]=aj;ak=c[c[(av|0)>>2]>>2]|0;if((ak|0)==0){aL=aj}else{c[(av|0)>>2]=ak;aL=c[as>>2]|0}jV(c[av+4>>2]|0,aL);c[(av+8|0)>>2]=(c[(av+8|0)>>2]|0)+1;aM=aj}else{aM=at}ak=aM+28|0;if((a[ak]&1)==0){c[s>>2]=c[ak>>2];c[s+4>>2]=c[ak+4>>2];c[s+8>>2]=c[ak+8>>2]}else{ak=c[aM+36>>2]|0;al=c[aM+32>>2]|0;if(al>>>0>4294967279>>>0){ah=1745;c[b+39840>>2]=1;break OL}if(al>>>0<11>>>0){a[s]=al<<1;aN=s+1|0}else{ar=tu(al+16&-16)|0;c[(s+8|0)>>2]=ar;c[(s|0)>>2]=al+16&-16|1;c[(s+4|0)>>2]=al;aN=ar}tH(aN|0,ak|0,al)|0;a[aN+al|0]=0}kb(s,(c[(d|0)>>2]|0)+(((c[(d+104|0)>>2]|0)+ad|0)*112|0)+16|0,0);if((a[s]&1)!=0){tw(c[(s+8|0)>>2]|0)}if((a[u]&1)!=0){tw(c[(u+8|0)>>2]|0)}c[w>>2]=ad;al=kc(ac,w)|0;ak=tu(16)|0;c[(x+8|0)>>2]=ak;c[(x|0)>>2]=17;c[(x+4|0)>>2]=11;tH(ak|0,28120,11)|0;a[ak+11|0]=0;ak=kp(al,b+1280|0,x)|0;ar=c[ak>>2]|0;if((ar|0)==0){an=tu(40)|0;do{if((an+16|0|0)!=0){if((a[x]&1)==0){c[(an+16|0)>>2]=c[x>>2];c[(an+16|0)+4>>2]=c[x+4>>2];c[(an+16|0)+8>>2]=c[x+8>>2];break}aA=c[(x+8|0)>>2]|0;az=c[(x+4|0)>>2]|0;if(az>>>0>4294967279>>>0){ah=1764;c[b+39840>>2]=2;c[b+39844>>2]=16;break OL}if(az>>>0<11>>>0){a[an+16|0]=az<<1;aO=an+17|0}else{aC=tu(az+16&-16)|0;c[an+24>>2]=aC;c[(an+16|0)>>2]=az+16&-16|1;c[an+20>>2]=az;aO=aC}tH(aO|0,aA|0,az)|0;a[aO+az|0]=0}}while(0);if((an+28|0|0)!=0){tI(an+28|0|0,0,12)|0}at=c[(b+1280|0)>>2]|0;c[an>>2]=0;c[an+4>>2]=0;c[an+8>>2]=at;c[ak>>2]=an;at=c[c[(al|0)>>2]>>2]|0;if((at|0)==0){aP=an}else{c[(al|0)>>2]=at;aP=c[ak>>2]|0}jV(c[al+4>>2]|0,aP);c[(al+8|0)>>2]=(c[(al+8|0)>>2]|0)+1;aQ=an}else{aQ=ar}at=aQ+28|0;if((a[at]&1)==0){c[v>>2]=c[at>>2];c[v+4>>2]=c[at+4>>2];c[v+8>>2]=c[at+8>>2]}else{at=c[aQ+36>>2]|0;aj=c[aQ+32>>2]|0;if(aj>>>0>4294967279>>>0){ah=1783;c[b+39840>>2]=1;break OL}if(aj>>>0<11>>>0){a[v]=aj<<1;aR=v+1|0}else{av=tu(aj+16&-16)|0;c[(v+8|0)>>2]=av;c[(v|0)>>2]=aj+16&-16|1;c[(v+4|0)>>2]=aj;aR=av}tH(aR|0,at|0,aj)|0;a[aR+aj|0]=0}kb(v,(c[(d|0)>>2]|0)+(((c[(d+104|0)>>2]|0)+ad|0)*112|0)+20|0,0);if((a[v]&1)!=0){tw(c[(v+8|0)>>2]|0)}if((a[x]&1)!=0){tw(c[(x+8|0)>>2]|0)}c[z>>2]=ad;aj=kc(ac,z)|0;a[A]=14;a[A+1|0]=a[27080]|0;a[(A+1|0)+1|0]=a[27081]|0;a[(A+1|0)+2|0]=a[27082]|0;a[(A+1|0)+3|0]=a[27083]|0;a[(A+1|0)+4|0]=a[27084]|0;a[(A+1|0)+5|0]=a[27085]|0;a[(A+1|0)+6|0]=a[27086]|0;a[A+8|0]=0;at=kp(aj,b+1272|0,A)|0;av=c[at>>2]|0;if((av|0)==0){as=tu(40)|0;do{if((as+16|0|0)!=0){if((a[A]&1)==0){c[(as+16|0)>>2]=c[A>>2];c[(as+16|0)+4>>2]=c[A+4>>2];c[(as+16|0)+8>>2]=c[A+8>>2];break}az=c[(A+8|0)>>2]|0;aA=c[(A+4|0)>>2]|0;if(aA>>>0>4294967279>>>0){ah=1801;c[b+39840>>2]=2;c[b+39844>>2]=16;break OL}if(aA>>>0<11>>>0){a[as+16|0]=aA<<1;aS=as+17|0}else{aC=tu(aA+16&-16)|0;c[as+24>>2]=aC;c[(as+16|0)>>2]=aA+16&-16|1;c[as+20>>2]=aA;aS=aC}tH(aS|0,az|0,aA)|0;a[aS+aA|0]=0}}while(0);if((as+28|0|0)!=0){tI(as+28|0|0,0,12)|0}ar=c[(b+1272|0)>>2]|0;c[as>>2]=0;c[as+4>>2]=0;c[as+8>>2]=ar;c[at>>2]=as;ar=c[c[(aj|0)>>2]>>2]|0;if((ar|0)==0){aT=as}else{c[(aj|0)>>2]=ar;aT=c[at>>2]|0}jV(c[aj+4>>2]|0,aT);c[(aj+8|0)>>2]=(c[(aj+8|0)>>2]|0)+1;aU=as}else{aU=av}ar=aU+28|0;if((a[ar]&1)==0){c[y>>2]=c[ar>>2];c[y+4>>2]=c[ar+4>>2];c[y+8>>2]=c[ar+8>>2]}else{ar=c[aU+36>>2]|0;an=c[aU+32>>2]|0;if(an>>>0>4294967279>>>0){ah=1820;c[b+39840>>2]=1;break OL}if(an>>>0<11>>>0){a[y]=an<<1;aV=y+1|0}else{al=tu(an+16&-16)|0;c[(y+8|0)>>2]=al;c[(y|0)>>2]=an+16&-16|1;c[(y+4|0)>>2]=an;aV=al}tH(aV|0,ar|0,an)|0;a[aV+an|0]=0}kb(y,(c[(d|0)>>2]|0)+(((c[(d+104|0)>>2]|0)+ad|0)*112|0)+24|0,0);if((a[y]&1)!=0){tw(c[(y+8|0)>>2]|0)}if((a[A]&1)!=0){tw(c[(A+8|0)>>2]|0)}c[D>>2]=ad;an=kc(ac,D)|0;a[E]=18;tH(E+1|0|0,26600,9)|0;a[E+10|0]=0;ar=kp(an,b+1264|0,E)|0;al=c[ar>>2]|0;if((al|0)==0){ak=tu(40)|0;do{if((ak+16|0|0)!=0){if((a[E]&1)==0){c[(ak+16|0)>>2]=c[E>>2];c[(ak+16|0)+4>>2]=c[E+4>>2];c[(ak+16|0)+8>>2]=c[E+8>>2];break}aA=c[(E+8|0)>>2]|0;az=c[(E+4|0)>>2]|0;if(az>>>0>4294967279>>>0){ah=1838;c[b+39840>>2]=2;c[b+39844>>2]=16;break OL}if(az>>>0<11>>>0){a[ak+16|0]=az<<1;aW=ak+17|0}else{aC=tu(az+16&-16)|0;c[ak+24>>2]=aC;c[(ak+16|0)>>2]=az+16&-16|1;c[ak+20>>2]=az;aW=aC}tH(aW|0,aA|0,az)|0;a[aW+az|0]=0}}while(0);if((ak+28|0|0)!=0){tI(ak+28|0|0,0,12)|0}av=c[(b+1264|0)>>2]|0;c[ak>>2]=0;c[ak+4>>2]=0;c[ak+8>>2]=av;c[ar>>2]=ak;av=c[c[(an|0)>>2]>>2]|0;if((av|0)==0){aX=ak}else{c[(an|0)>>2]=av;aX=c[ar>>2]|0}jV(c[an+4>>2]|0,aX);c[(an+8|0)>>2]=(c[(an+8|0)>>2]|0)+1;aY=ak}else{aY=al}av=aY+28|0;if((a[av]&1)==0){c[B>>2]=c[av>>2];c[B+4>>2]=c[av+4>>2];c[B+8>>2]=c[av+8>>2]}else{av=c[aY+36>>2]|0;as=c[aY+32>>2]|0;if(as>>>0>4294967279>>>0){ah=1857;c[b+39840>>2]=1;break OL}if(as>>>0<11>>>0){a[B]=as<<1;aZ=B+1|0}else{aj=tu(as+16&-16)|0;c[(B+8|0)>>2]=aj;c[(B|0)>>2]=as+16&-16|1;c[(B+4|0)>>2]=as;aZ=aj}tH(aZ|0,av|0,as)|0;a[aZ+as|0]=0}kb(B,(c[(d|0)>>2]|0)+(((c[(d+104|0)>>2]|0)+ad|0)*112|0)+28|0,0);if((a[B]&1)!=0){tw(c[(B+8|0)>>2]|0)}if((a[E]&1)!=0){tw(c[(E+8|0)>>2]|0)}c[G>>2]=ad;as=kc(ac,G)|0;av=tu(16)|0;c[(H+8|0)>>2]=av;c[(H|0)>>2]=17;c[(H+4|0)>>2]=12;tH(av|0,25696,12)|0;a[av+12|0]=0;av=kp(as,b+1256|0,H)|0;aj=c[av>>2]|0;if((aj|0)==0){at=tu(40)|0;do{if((at+16|0|0)!=0){if((a[H]&1)==0){c[(at+16|0)>>2]=c[H>>2];c[(at+16|0)+4>>2]=c[H+4>>2];c[(at+16|0)+8>>2]=c[H+8>>2];break}az=c[(H+8|0)>>2]|0;aA=c[(H+4|0)>>2]|0;if(aA>>>0>4294967279>>>0){ah=1876;c[b+39840>>2]=2;c[b+39844>>2]=16;break OL}if(aA>>>0<11>>>0){a[at+16|0]=aA<<1;a_=at+17|0}else{aC=tu(aA+16&-16)|0;c[at+24>>2]=aC;c[(at+16|0)>>2]=aA+16&-16|1;c[at+20>>2]=aA;a_=aC}tH(a_|0,az|0,aA)|0;a[a_+aA|0]=0}}while(0);if((at+28|0|0)!=0){tI(at+28|0|0,0,12)|0}al=c[(b+1256|0)>>2]|0;c[at>>2]=0;c[at+4>>2]=0;c[at+8>>2]=al;c[av>>2]=at;al=c[c[(as|0)>>2]>>2]|0;if((al|0)==0){a$=at}else{c[(as|0)>>2]=al;a$=c[av>>2]|0}jV(c[as+4>>2]|0,a$);c[(as+8|0)>>2]=(c[(as+8|0)>>2]|0)+1;a0=at}else{a0=aj}al=a0+28|0;if((a[al]&1)==0){c[F>>2]=c[al>>2];c[F+4>>2]=c[al+4>>2];c[F+8>>2]=c[al+8>>2]}else{al=c[a0+36>>2]|0;ak=c[a0+32>>2]|0;if(ak>>>0>4294967279>>>0){ah=1895;c[b+39840>>2]=1;break OL}if(ak>>>0<11>>>0){a[F]=ak<<1;a1=F+1|0}else{an=tu(ak+16&-16)|0;c[(F+8|0)>>2]=an;c[(F|0)>>2]=ak+16&-16|1;c[(F+4|0)>>2]=ak;a1=an}tH(a1|0,al|0,ak)|0;a[a1+ak|0]=0}kb(F,(c[(d|0)>>2]|0)+(((c[(d+104|0)>>2]|0)+ad|0)*112|0)+32|0,0);if((a[F]&1)!=0){tw(c[(F+8|0)>>2]|0)}if((a[H]&1)!=0){tw(c[(H+8|0)>>2]|0)}c[J>>2]=ad;ak=kc(ac,J)|0;a[K]=16;C=1399157621;a[K+1|0|0]=C;C=C>>8;a[(K+1|0|0)+1|0]=C;C=C>>8;a[(K+1|0|0)+2|0]=C;C=C>>8;a[(K+1|0|0)+3|0]=C;C=1953653108;a[(K+1|0)+4|0]=C;C=C>>8;a[((K+1|0)+4|0)+1|0]=C;C=C>>8;a[((K+1|0)+4|0)+2|0]=C;C=C>>8;a[((K+1|0)+4|0)+3|0]=C;a[K+9|0]=0;al=kp(ak,b+1248|0,K)|0;an=c[al>>2]|0;if((an|0)==0){ar=tu(40)|0;do{if((ar+16|0|0)!=0){if((a[K]&1)==0){c[(ar+16|0)>>2]=c[K>>2];c[(ar+16|0)+4>>2]=c[K+4>>2];c[(ar+16|0)+8>>2]=c[K+8>>2];break}aA=c[(K+8|0)>>2]|0;az=c[(K+4|0)>>2]|0;if(az>>>0>4294967279>>>0){ah=1913;c[b+39840>>2]=2;c[b+39844>>2]=16;break OL}if(az>>>0<11>>>0){a[ar+16|0]=az<<1;a2=ar+17|0}else{aC=tu(az+16&-16)|0;c[ar+24>>2]=aC;c[(ar+16|0)>>2]=az+16&-16|1;c[ar+20>>2]=az;a2=aC}tH(a2|0,aA|0,az)|0;a[a2+az|0]=0}}while(0);if((ar+28|0|0)!=0){tI(ar+28|0|0,0,12)|0}aj=c[(b+1248|0)>>2]|0;c[ar>>2]=0;c[ar+4>>2]=0;c[ar+8>>2]=aj;c[al>>2]=ar;aj=c[c[(ak|0)>>2]>>2]|0;if((aj|0)==0){a3=ar}else{c[(ak|0)>>2]=aj;a3=c[al>>2]|0}jV(c[ak+4>>2]|0,a3);c[(ak+8|0)>>2]=(c[(ak+8|0)>>2]|0)+1;a4=ar}else{a4=an}aj=a4+28|0;if((a[aj]&1)==0){c[I>>2]=c[aj>>2];c[I+4>>2]=c[aj+4>>2];c[I+8>>2]=c[aj+8>>2];a5=a[I]|0}else{aj=c[a4+36>>2]|0;at=c[a4+32>>2]|0;if(at>>>0>4294967279>>>0){ah=1932;c[b+39840>>2]=1;break OL}if(at>>>0<11>>>0){a[I]=at<<1&255;a6=I+1|0;a7=at<<1&255}else{as=tu(at+16&-16)|0;c[(I+8|0)>>2]=as;c[(I|0)>>2]=at+16&-16|1;c[(I+4|0)>>2]=at;a6=as;a7=(at+16&-16|1)&255}tH(a6|0,aj|0,at)|0;a[a6+at|0]=0;a5=a7}at=(c[(d|0)>>2]|0)+(((c[(d+104|0)>>2]|0)+ad|0)*112|0)+88|0;aj=a5&255;as=(aj&1|0)==0?aj>>>1:c[(I+4|0)>>2]|0;aj=(a5&1)==0;av=c[(I+8|0)>>2]|0;az=tK((aj?I+1|0:av)|0,42e3,(as>>>0>4>>>0?4:as)|0)|0;if((az|0)==0){a8=as>>>0<4>>>0?-1:as>>>0>4>>>0&1}else{a8=az}a[at]=(a8|0)==0|0;if(!aj){tw(av)}if((a[K]&1)!=0){tw(c[(K+8|0)>>2]|0)}c[M>>2]=ad;av=kc(ac,M)|0;a[N]=10;a[N+1|0]=a[39368]|0;a[(N+1|0)+1|0]=a[39369]|0;a[(N+1|0)+2|0]=a[39370]|0;a[(N+1|0)+3|0]=a[39371]|0;a[(N+1|0)+4|0]=a[39372]|0;a[N+6|0]=0;aj=kp(av,b+1240|0,N)|0;at=c[aj>>2]|0;if((at|0)==0){az=tu(40)|0;do{if((az+16|0|0)!=0){if((a[N]&1)==0){c[(az+16|0)>>2]=c[N>>2];c[(az+16|0)+4>>2]=c[N+4>>2];c[(az+16|0)+8>>2]=c[N+8>>2];break}as=c[(N+8|0)>>2]|0;aA=c[(N+4|0)>>2]|0;if(aA>>>0>4294967279>>>0){ah=1952;c[b+39840>>2]=2;c[b+39844>>2]=16;break OL}if(aA>>>0<11>>>0){a[az+16|0]=aA<<1;a9=az+17|0}else{aC=tu(aA+16&-16)|0;c[az+24>>2]=aC;c[(az+16|0)>>2]=aA+16&-16|1;c[az+20>>2]=aA;a9=aC}tH(a9|0,as|0,aA)|0;a[a9+aA|0]=0}}while(0);if((az+28|0|0)!=0){tI(az+28|0|0,0,12)|0}an=c[(b+1240|0)>>2]|0;c[az>>2]=0;c[az+4>>2]=0;c[az+8>>2]=an;c[aj>>2]=az;an=c[c[(av|0)>>2]>>2]|0;if((an|0)==0){ba=az}else{c[(av|0)>>2]=an;ba=c[aj>>2]|0}jV(c[av+4>>2]|0,ba);c[(av+8|0)>>2]=(c[(av+8|0)>>2]|0)+1;bb=az}else{bb=at}an=bb+28|0;if((a[an]&1)==0){c[L>>2]=c[an>>2];c[L+4>>2]=c[an+4>>2];c[L+8>>2]=c[an+8>>2]}else{an=c[bb+36>>2]|0;ar=c[bb+32>>2]|0;if(ar>>>0>4294967279>>>0){ah=1971;c[b+39840>>2]=1;break OL}if(ar>>>0<11>>>0){a[L]=ar<<1;bc=L+1|0}else{ak=tu(ar+16&-16)|0;c[(L+8|0)>>2]=ak;c[(L|0)>>2]=ar+16&-16|1;c[(L+4|0)>>2]=ar;bc=ak}tH(bc|0,an|0,ar)|0;a[bc+ar|0]=0}ka(L,(c[(d|0)>>2]|0)+(((c[(d+104|0)>>2]|0)+ad|0)*112|0)+96|0,0.0);if((a[L]&1)!=0){tw(c[(L+8|0)>>2]|0)}if((a[N]&1)!=0){tw(c[(N+8|0)>>2]|0)}c[P>>2]=ad;ar=kc(ac,P)|0;a[Q]=10;a[Q+1|0]=a[25288]|0;a[(Q+1|0)+1|0]=a[25289]|0;a[(Q+1|0)+2|0]=a[25290]|0;a[(Q+1|0)+3|0]=a[25291]|0;a[(Q+1|0)+4|0]=a[25292]|0;a[Q+6|0]=0;an=kp(ar,b+1232|0,Q)|0;ak=c[an>>2]|0;if((ak|0)==0){al=tu(40)|0;do{if((al+16|0|0)!=0){if((a[Q]&1)==0){c[(al+16|0)>>2]=c[Q>>2];c[(al+16|0)+4>>2]=c[Q+4>>2];c[(al+16|0)+8>>2]=c[Q+8>>2];break}aA=c[(Q+8|0)>>2]|0;as=c[(Q+4|0)>>2]|0;if(as>>>0>4294967279>>>0){ah=1989;c[b+39840>>2]=2;c[b+39844>>2]=16;break OL}if(as>>>0<11>>>0){a[al+16|0]=as<<1;bd=al+17|0}else{aC=tu(as+16&-16)|0;c[al+24>>2]=aC;c[(al+16|0)>>2]=as+16&-16|1;c[al+20>>2]=as;bd=aC}tH(bd|0,aA|0,as)|0;a[bd+as|0]=0}}while(0);if((al+28|0|0)!=0){tI(al+28|0|0,0,12)|0}at=c[(b+1232|0)>>2]|0;c[al>>2]=0;c[al+4>>2]=0;c[al+8>>2]=at;c[an>>2]=al;at=c[c[(ar|0)>>2]>>2]|0;if((at|0)==0){be=al}else{c[(ar|0)>>2]=at;be=c[an>>2]|0}jV(c[ar+4>>2]|0,be);c[(ar+8|0)>>2]=(c[(ar+8|0)>>2]|0)+1;bf=al}else{bf=ak}at=bf+28|0;if((a[at]&1)==0){c[O>>2]=c[at>>2];c[O+4>>2]=c[at+4>>2];c[O+8>>2]=c[at+8>>2];bg=a[O]|0}else{at=c[bf+36>>2]|0;az=c[bf+32>>2]|0;if(az>>>0>4294967279>>>0){ah=2008;c[b+39840>>2]=1;break OL}if(az>>>0<11>>>0){a[O]=az<<1&255;bh=O+1|0;bi=az<<1&255}else{av=tu(az+16&-16)|0;c[(O+8|0)>>2]=av;c[(O|0)>>2]=az+16&-16|1;c[(O+4|0)>>2]=az;bh=av;bi=(az+16&-16|1)&255}tH(bh|0,at|0,az)|0;a[bh+az|0]=0;bg=bi}az=(c[(d|0)>>2]|0)+(((c[(d+104|0)>>2]|0)+ad|0)*112|0)+72|0;at=bg&255;av=(at&1|0)==0?at>>>1:c[(O+4|0)>>2]|0;at=(bg&1)==0;aj=c[(O+8|0)>>2]|0;as=tK((at?O+1|0:aj)|0,42e3,(av>>>0>4>>>0?4:av)|0)|0;if((as|0)==0){bj=av>>>0<4>>>0?-1:av>>>0>4>>>0&1}else{bj=as}a[az]=(bj|0)==0|0;if(!at){tw(aj)}if((a[Q]&1)!=0){tw(c[(Q+8|0)>>2]|0)}c[S>>2]=ad;aj=kc(ac,S)|0;a[T]=20;tH(T+1|0|0,24848,10)|0;a[T+11|0]=0;at=kp(aj,b+1224|0,T)|0;az=c[at>>2]|0;if((az|0)==0){as=tu(40)|0;do{if((as+16|0|0)!=0){if((a[T]&1)==0){c[(as+16|0)>>2]=c[T>>2];c[(as+16|0)+4>>2]=c[T+4>>2];c[(as+16|0)+8>>2]=c[T+8>>2];break}av=c[(T+8|0)>>2]|0;aA=c[(T+4|0)>>2]|0;if(aA>>>0>4294967279>>>0){ah=2028;c[b+39840>>2]=2;c[b+39844>>2]=16;break OL}if(aA>>>0<11>>>0){a[as+16|0]=aA<<1;bk=as+17|0}else{aC=tu(aA+16&-16)|0;c[as+24>>2]=aC;c[(as+16|0)>>2]=aA+16&-16|1;c[as+20>>2]=aA;bk=aC}tH(bk|0,av|0,aA)|0;a[bk+aA|0]=0}}while(0);if((as+28|0|0)!=0){tI(as+28|0|0,0,12)|0}ak=c[(b+1224|0)>>2]|0;c[as>>2]=0;c[as+4>>2]=0;c[as+8>>2]=ak;c[at>>2]=as;ak=c[c[(aj|0)>>2]>>2]|0;if((ak|0)==0){bl=as}else{c[(aj|0)>>2]=ak;bl=c[at>>2]|0}jV(c[aj+4>>2]|0,bl);c[(aj+8|0)>>2]=(c[(aj+8|0)>>2]|0)+1;bm=as}else{bm=az}ak=bm+28|0;if((a[ak]&1)==0){c[R>>2]=c[ak>>2];c[R+4>>2]=c[ak+4>>2];c[R+8>>2]=c[ak+8>>2];bn=a[R]|0}else{ak=c[bm+36>>2]|0;al=c[bm+32>>2]|0;if(al>>>0>4294967279>>>0){ah=2047;c[b+39840>>2]=1;break OL}if(al>>>0<11>>>0){a[R]=al<<1&255;bo=R+1|0;bp=al<<1&255}else{ar=tu(al+16&-16)|0;c[(R+8|0)>>2]=ar;c[(R|0)>>2]=al+16&-16|1;c[(R+4|0)>>2]=al;bo=ar;bp=(al+16&-16|1)&255}tH(bo|0,ak|0,al)|0;a[bo+al|0]=0;bn=bp}al=(c[(d|0)>>2]|0)+(((c[(d+104|0)>>2]|0)+ad|0)*112|0)+73|0;ak=bn&255;ar=(ak&1|0)==0?ak>>>1:c[(R+4|0)>>2]|0;ak=(bn&1)==0;an=c[(R+8|0)>>2]|0;aA=tK((ak?R+1|0:an)|0,42e3,(ar>>>0>4>>>0?4:ar)|0)|0;if((aA|0)==0){bq=ar>>>0<4>>>0?-1:ar>>>0>4>>>0&1}else{bq=aA}a[al]=(bq|0)==0|0;if(!ak){tw(an)}if((a[T]&1)!=0){tw(c[(T+8|0)>>2]|0)}c[V>>2]=ad;an=kc(ac,V)|0;a[W]=14;a[W+1|0]=a[24768]|0;a[(W+1|0)+1|0]=a[24769]|0;a[(W+1|0)+2|0]=a[24770]|0;a[(W+1|0)+3|0]=a[24771]|0;a[(W+1|0)+4|0]=a[24772]|0;a[(W+1|0)+5|0]=a[24773]|0;a[(W+1|0)+6|0]=a[24774]|0;a[W+8|0]=0;ak=kp(an,b+1216|0,W)|0;al=c[ak>>2]|0;if((al|0)==0){aA=tu(40)|0;do{if((aA+16|0|0)!=0){if((a[W]&1)==0){c[(aA+16|0)>>2]=c[W>>2];c[(aA+16|0)+4>>2]=c[W+4>>2];c[(aA+16|0)+8>>2]=c[W+8>>2];break}ar=c[(W+8|0)>>2]|0;av=c[(W+4|0)>>2]|0;if(av>>>0>4294967279>>>0){ah=2067;c[b+39840>>2]=2;c[b+39844>>2]=16;break OL}if(av>>>0<11>>>0){a[aA+16|0]=av<<1;br=aA+17|0}else{aC=tu(av+16&-16)|0;c[aA+24>>2]=aC;c[(aA+16|0)>>2]=av+16&-16|1;c[aA+20>>2]=av;br=aC}tH(br|0,ar|0,av)|0;a[br+av|0]=0}}while(0);if((aA+28|0|0)!=0){tI(aA+28|0|0,0,12)|0}az=c[(b+1216|0)>>2]|0;c[aA>>2]=0;c[aA+4>>2]=0;c[aA+8>>2]=az;c[ak>>2]=aA;az=c[c[(an|0)>>2]>>2]|0;if((az|0)==0){bs=aA}else{c[(an|0)>>2]=az;bs=c[ak>>2]|0}jV(c[an+4>>2]|0,bs);c[(an+8|0)>>2]=(c[(an+8|0)>>2]|0)+1;bt=aA}else{bt=al}az=bt+28|0;if((a[az]&1)==0){c[U>>2]=c[az>>2];c[U+4>>2]=c[az+4>>2];c[U+8>>2]=c[az+8>>2]}else{az=c[bt+36>>2]|0;as=c[bt+32>>2]|0;if(as>>>0>4294967279>>>0){ah=2086;c[b+39840>>2]=1;break OL}if(as>>>0<11>>>0){a[U]=as<<1;bu=U+1|0}else{aj=tu(as+16&-16)|0;c[(U+8|0)>>2]=aj;c[(U|0)>>2]=as+16&-16|1;c[(U+4|0)>>2]=as;bu=aj}tH(bu|0,az|0,as)|0;a[bu+as|0]=0}ka(U,(c[(d|0)>>2]|0)+(((c[(d+104|0)>>2]|0)+ad|0)*112|0)+80|0,1.0);if((a[U]&1)!=0){tw(c[(U+8|0)>>2]|0)}if((a[W]&1)!=0){tw(c[(W+8|0)>>2]|0)}c[Y>>2]=ad;as=kc(ac,Y)|0;a[Z]=6;a[Z+1|0]=a[24672]|0;a[(Z+1|0)+1|0]=a[24673]|0;a[(Z+1|0)+2|0]=a[24674]|0;a[Z+4|0]=0;az=kp(as,b+1208|0,Z)|0;aj=c[az>>2]|0;if((aj|0)==0){at=tu(40)|0;do{if((at+16|0|0)!=0){if((a[Z]&1)==0){c[(at+16|0)>>2]=c[Z>>2];c[(at+16|0)+4>>2]=c[Z+4>>2];c[(at+16|0)+8>>2]=c[Z+8>>2];break}av=c[(Z+8|0)>>2]|0;ar=c[(Z+4|0)>>2]|0;if(ar>>>0>4294967279>>>0){ah=2104;c[b+39840>>2]=2;c[b+39844>>2]=16;break OL}if(ar>>>0<11>>>0){a[at+16|0]=ar<<1;bv=at+17|0}else{aC=tu(ar+16&-16)|0;c[at+24>>2]=aC;c[(at+16|0)>>2]=ar+16&-16|1;c[at+20>>2]=ar;bv=aC}tH(bv|0,av|0,ar)|0;a[bv+ar|0]=0}}while(0);if((at+28|0|0)!=0){tI(at+28|0|0,0,12)|0}al=c[(b+1208|0)>>2]|0;c[at>>2]=0;c[at+4>>2]=0;c[at+8>>2]=al;c[az>>2]=at;al=c[c[(as|0)>>2]>>2]|0;if((al|0)==0){bw=at}else{c[(as|0)>>2]=al;bw=c[az>>2]|0}jV(c[as+4>>2]|0,bw);c[(as+8|0)>>2]=(c[(as+8|0)>>2]|0)+1;bx=at}else{bx=aj}al=bx+28|0;if((a[al]&1)==0){c[X>>2]=c[al>>2];c[X+4>>2]=c[al+4>>2];c[X+8>>2]=c[al+8>>2]}else{al=c[bx+36>>2]|0;aA=c[bx+32>>2]|0;if(aA>>>0>4294967279>>>0){ah=2123;c[b+39840>>2]=1;break OL}if(aA>>>0<11>>>0){a[X]=aA<<1;by=X+1|0}else{an=tu(aA+16&-16)|0;c[(X+8|0)>>2]=an;c[(X|0)>>2]=aA+16&-16|1;c[(X+4|0)>>2]=aA;by=an}tH(by|0,al|0,aA)|0;a[by+aA|0]=0}ka(X,(c[(d|0)>>2]|0)+(((c[(d+104|0)>>2]|0)+ad|0)*112|0)+56|0,-1.7976931348623157e+308);if((a[X]&1)!=0){tw(c[(X+8|0)>>2]|0)}if((a[Z]&1)!=0){tw(c[(Z+8|0)>>2]|0)}c[$>>2]=ad;aA=kc(ac,$)|0;a[aa]=6;a[aa+1|0]=a[24600]|0;a[(aa+1|0)+1|0]=a[24601]|0;a[(aa+1|0)+2|0]=a[24602]|0;a[aa+4|0]=0;al=kp(aA,b+1200|0,aa)|0;an=c[al>>2]|0;if((an|0)==0){ak=tu(40)|0;do{if((ak+16|0|0)!=0){if((a[aa]&1)==0){c[(ak+16|0)>>2]=c[aa>>2];c[(ak+16|0)+4>>2]=c[aa+4>>2];c[(ak+16|0)+8>>2]=c[aa+8>>2];break}ar=c[(aa+8|0)>>2]|0;av=c[(aa+4|0)>>2]|0;if(av>>>0>4294967279>>>0){ah=2141;c[b+39840>>2]=2;c[b+39844>>2]=16;break OL}if(av>>>0<11>>>0){a[ak+16|0]=av<<1;bz=ak+17|0}else{aC=tu(av+16&-16)|0;c[ak+24>>2]=aC;c[(ak+16|0)>>2]=av+16&-16|1;c[ak+20>>2]=av;bz=aC}tH(bz|0,ar|0,av)|0;a[bz+av|0]=0}}while(0);if((ak+28|0|0)!=0){tI(ak+28|0|0,0,12)|0}aj=c[(b+1200|0)>>2]|0;c[ak>>2]=0;c[ak+4>>2]=0;c[ak+8>>2]=aj;c[al>>2]=ak;aj=c[c[(aA|0)>>2]>>2]|0;if((aj|0)==0){bA=ak}else{c[(aA|0)>>2]=aj;bA=c[al>>2]|0}jV(c[aA+4>>2]|0,bA);c[(aA+8|0)>>2]=(c[(aA+8|0)>>2]|0)+1;bB=ak}else{bB=an}aj=bB+28|0;if((a[aj]&1)==0){c[_>>2]=c[aj>>2];c[_+4>>2]=c[aj+4>>2];c[_+8>>2]=c[aj+8>>2]}else{aj=c[bB+36>>2]|0;at=c[bB+32>>2]|0;if(at>>>0>4294967279>>>0){ah=2160;c[b+39840>>2]=1;break OL}if(at>>>0<11>>>0){a[_]=at<<1;bC=_+1|0}else{as=tu(at+16&-16)|0;c[(_+8|0)>>2]=as;c[(_|0)>>2]=at+16&-16|1;c[(_+4|0)>>2]=at;bC=as}tH(bC|0,aj|0,at)|0;a[bC+at|0]=0}ka(_,(c[(d|0)>>2]|0)+(((c[(d+104|0)>>2]|0)+ad|0)*112|0)+64|0,1.7976931348623157e+308);if((a[_]&1)!=0){tw(c[(_+8|0)>>2]|0)}if((a[aa]&1)!=0){tw(c[(aa+8|0)>>2]|0)}at=(c[(d+104|0)>>2]|0)+ad|0;aj=c[(d|0)>>2]|0;as=(a[aj+(at*112|0)+88|0]|0)!=0;bD=+h[aj+(at*112|0)+96>>3];az=(a[aj+(at*112|0)+72|0]|0)!=0?42e3:42440;av=(a[aj+(at*112|0)+73|0]|0)!=0;bE=+h[aj+(at*112|0)+80>>3];bF=+h[aj+(at*112|0)+56>>3];bG=+h[aj+(at*112|0)+64>>3];hA(4,0,24480,(ai=i,i=i+80|0,c[ai>>2]=c[aj+(at*112|0)+4>>2],c[ai+8>>2]=as?93904:24160,h[ai+16>>3]=bD,c[ai+24>>2]=as?93904:24064,c[ai+32>>2]=az,c[ai+40>>2]=av?93904:24160,h[ai+48>>3]=bE,c[ai+56>>2]=av?93904:24064,h[ai+64>>3]=bF,h[ai+72>>3]=bG,ai)|0);i=ai;av=c[(d+104|0)>>2]|0;az=av+ad|0;as=c[(d|0)>>2]|0;if((a[c[as+(az*112|0)+4>>2]|0]|0)==36){a[as+(az*112|0)+104|0]=1;bH=c[(d+104|0)>>2]|0;bI=c[(d|0)>>2]|0}else{bH=av;bI=as}as=bH+ad|0;av=c[bI+(as*112|0)+4>>2]|0;az=tD(av|0)|0;if(az>>>0>4294967279>>>0){ah=2251;c[b+39840>>2]=1;break OL}if(az>>>0<11>>>0){a[ab]=az<<1;bJ=ab+1|0}else{at=tu(az+16&-16)|0;c[(ab+8|0)>>2]=at;c[(ab|0)>>2]=az+16&-16|1;c[(ab+4|0)>>2]=az;bJ=at}tH(bJ|0,av|0,az)|0;a[bJ+az|0]=0;c[(ke(e,ab)|0)>>2]=as;if((a[ab]&1)!=0){tw(c[(ab+8|0)>>2]|0)}ad=ad+1|0;if((ad|0)>=(c[(d+104|0)>>2]|0)){c[b+39840>>2]=2;c[b+39844>>2]=17;break OL}}while(0);c[b+12752>>2]=ad;c[b+39768>>2]=ah;c[b+39776>>2]=ai}function _read_input_xml$7(b){b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0.0,bC=0.0,bD=0.0,bE=0.0,bF=0,bG=0;d=c[b+1904>>2]|0;e=c[b+1928>>2]|0;f=c[b+2336>>2]|0;g=c[b+2344>>2]|0;j=c[b+2352>>2]|0;k=c[b+2360>>2]|0;l=c[b+2368>>2]|0;m=c[b+2376>>2]|0;n=c[b+2384>>2]|0;o=c[b+2392>>2]|0;p=c[b+2400>>2]|0;q=c[b+2408>>2]|0;r=c[b+2416>>2]|0;s=c[b+2424>>2]|0;t=c[b+2432>>2]|0;u=c[b+2440>>2]|0;v=c[b+2448>>2]|0;w=c[b+2456>>2]|0;x=c[b+2464>>2]|0;y=c[b+2472>>2]|0;z=c[b+2480>>2]|0;A=c[b+2488>>2]|0;B=c[b+2496>>2]|0;D=c[b+2504>>2]|0;E=c[b+2512>>2]|0;F=c[b+2520>>2]|0;G=c[b+2528>>2]|0;H=c[b+2536>>2]|0;I=c[b+2544>>2]|0;J=c[b+2552>>2]|0;K=c[b+2560>>2]|0;L=c[b+2568>>2]|0;M=c[b+2576>>2]|0;N=c[b+2584>>2]|0;O=c[b+2592>>2]|0;P=c[b+2600>>2]|0;Q=c[b+2608>>2]|0;R=c[b+2616>>2]|0;S=c[b+2624>>2]|0;T=c[b+2632>>2]|0;U=c[b+2640>>2]|0;V=c[b+2648>>2]|0;W=c[b+2656>>2]|0;X=c[b+2664>>2]|0;Y=c[b+2672>>2]|0;Z=c[b+2680>>2]|0;_=c[b+2688>>2]|0;$=c[b+2696>>2]|0;aa=c[b+2704>>2]|0;ab=c[b+2712>>2]|0;ac=c[b+2720>>2]|0;ad=c[b+10168>>2]|0;ae=c[b+10176>>2]|0;af=c[b+39768>>2]|0;ag=c[b+39776>>2]|0;OL:do{L990:while(1){c[g>>2]=ae;ah=kc(ad,g)|0;a[j]=8;C=1701667182;a[j+1|0]=C;C=C>>8;a[(j+1|0)+1|0]=C;C=C>>8;a[(j+1|0)+2|0]=C;C=C>>8;a[(j+1|0)+3|0]=C;a[j+5|0]=0;ai=kp(ah,b+1448|0,j)|0;aj=c[ai>>2]|0;if((aj|0)==0){ak=tu(40)|0;do{if((ak+16|0|0)!=0){if((a[j]&1)==0){c[(ak+16|0)>>2]=c[j>>2];c[(ak+16|0)+4>>2]=c[j+4>>2];c[(ak+16|0)+8>>2]=c[j+8>>2];break}al=c[(j+8|0)>>2]|0;am=c[(j+4|0)>>2]|0;if(am>>>0>4294967279>>>0){af=860;break L990}if(am>>>0<11>>>0){a[ak+16|0]=am<<1;an=ak+17|0}else{ao=tu(am+16&-16)|0;c[ak+24>>2]=ao;c[(ak+16|0)>>2]=am+16&-16|1;c[ak+20>>2]=am;an=ao}tH(an|0,al|0,am)|0;a[an+am|0]=0}}while(0);if((ak+28|0|0)!=0){tI(ak+28|0|0,0,12)|0}am=c[(b+1448|0)>>2]|0;c[ak>>2]=0;c[ak+4>>2]=0;c[ak+8>>2]=am;c[ai>>2]=ak;am=c[c[(ah|0)>>2]>>2]|0;if((am|0)==0){ap=ak}else{c[(ah|0)>>2]=am;ap=c[ai>>2]|0}jV(c[ah+4>>2]|0,ap);c[(ah+8|0)>>2]=(c[(ah+8|0)>>2]|0)+1;aq=ak}else{aq=aj}am=aq+28|0;if((a[am]&1)==0){c[f>>2]=c[am>>2];c[f+4>>2]=c[am+4>>2];c[f+8>>2]=c[am+8>>2]}else{am=c[aq+36>>2]|0;al=c[aq+32>>2]|0;if(al>>>0>4294967279>>>0){af=879;break}if(al>>>0<11>>>0){a[f]=al<<1;ar=f+1|0}else{ao=tu(al+16&-16)|0;c[(f+8|0)>>2]=ao;c[(f|0)>>2]=al+16&-16|1;c[(f+4|0)>>2]=al;ar=ao}tH(ar|0,am|0,al)|0;a[ar+al|0]=0}al=(c[(d|0)>>2]|0)+(ae*112|0)+4|0;if((al|0)==0){hC(19,0,49832,(ag=i,i=i+1|0,i=i+7&-8,c[ag>>2]=0,ag)|0);i=ag}else{c[al>>2]=cj(((a[f]&1)==0?f+1|0:c[(f+8|0)>>2]|0)|0)|0}if((a[f]&1)!=0){tw(c[(f+8|0)>>2]|0)}if((a[j]&1)!=0){tw(c[(j+8|0)>>2]|0)}c[l>>2]=ae;al=kc(ad,l)|0;am=tu(16)|0;c[(m+8|0)>>2]=am;c[(m|0)>>2]=17;c[(m+4|0)>>2]=14;tH(am|0,30344,14)|0;a[am+14|0]=0;am=kp(al,b+1440|0,m)|0;ao=c[am>>2]|0;if((ao|0)==0){as=tu(40)|0;do{if((as+16|0|0)!=0){if((a[m]&1)==0){c[(as+16|0)>>2]=c[m>>2];c[(as+16|0)+4>>2]=c[m+4>>2];c[(as+16|0)+8>>2]=c[m+8>>2];break}at=c[(m+8|0)>>2]|0;au=c[(m+4|0)>>2]|0;if(au>>>0>4294967279>>>0){af=901;break L990}if(au>>>0<11>>>0){a[as+16|0]=au<<1;av=as+17|0}else{aw=tu(au+16&-16)|0;c[as+24>>2]=aw;c[(as+16|0)>>2]=au+16&-16|1;c[as+20>>2]=au;av=aw}tH(av|0,at|0,au)|0;a[av+au|0]=0}}while(0);if((as+28|0|0)!=0){tI(as+28|0|0,0,12)|0}aj=c[(b+1440|0)>>2]|0;c[as>>2]=0;c[as+4>>2]=0;c[as+8>>2]=aj;c[am>>2]=as;aj=c[c[(al|0)>>2]>>2]|0;if((aj|0)==0){ax=as}else{c[(al|0)>>2]=aj;ax=c[am>>2]|0}jV(c[al+4>>2]|0,ax);c[(al+8|0)>>2]=(c[(al+8|0)>>2]|0)+1;ay=as}else{ay=ao}aj=ay+28|0;if((a[aj]&1)==0){c[k>>2]=c[aj>>2];c[k+4>>2]=c[aj+4>>2];c[k+8>>2]=c[aj+8>>2]}else{aj=c[ay+36>>2]|0;ak=c[ay+32>>2]|0;if(ak>>>0>4294967279>>>0){af=920;break}if(ak>>>0<11>>>0){a[k]=ak<<1;az=k+1|0}else{ah=tu(ak+16&-16)|0;c[(k+8|0)>>2]=ah;c[(k|0)>>2]=ak+16&-16|1;c[(k+4|0)>>2]=ak;az=ah}tH(az|0,aj|0,ak)|0;a[az+ak|0]=0}kd(k,(c[(d|0)>>2]|0)+(ae*112|0)|0);if((a[k]&1)!=0){tw(c[(k+8|0)>>2]|0)}if((a[m]&1)!=0){tw(c[(m+8|0)>>2]|0)}c[o>>2]=ae;ak=kc(ad,o)|0;aj=tu(16)|0;c[(p+8|0)>>2]=aj;c[(p|0)>>2]=17;c[(p+4|0)>>2]=11;tH(aj|0,3e4,11)|0;a[aj+11|0]=0;aj=kp(ak,b+1432|0,p)|0;ah=c[aj>>2]|0;if((ah|0)==0){ai=tu(40)|0;do{if((ai+16|0|0)!=0){if((a[p]&1)==0){c[(ai+16|0)>>2]=c[p>>2];c[(ai+16|0)+4>>2]=c[p+4>>2];c[(ai+16|0)+8>>2]=c[p+8>>2];break}au=c[(p+8|0)>>2]|0;at=c[(p+4|0)>>2]|0;if(at>>>0>4294967279>>>0){af=939;break L990}if(at>>>0<11>>>0){a[ai+16|0]=at<<1;aA=ai+17|0}else{aw=tu(at+16&-16)|0;c[ai+24>>2]=aw;c[(ai+16|0)>>2]=at+16&-16|1;c[ai+20>>2]=at;aA=aw}tH(aA|0,au|0,at)|0;a[aA+at|0]=0}}while(0);if((ai+28|0|0)!=0){tI(ai+28|0|0,0,12)|0}ao=c[(b+1432|0)>>2]|0;c[ai>>2]=0;c[ai+4>>2]=0;c[ai+8>>2]=ao;c[aj>>2]=ai;ao=c[c[(ak|0)>>2]>>2]|0;if((ao|0)==0){aB=ai}else{c[(ak|0)>>2]=ao;aB=c[aj>>2]|0}jV(c[ak+4>>2]|0,aB);c[(ak+8|0)>>2]=(c[(ak+8|0)>>2]|0)+1;aC=ai}else{aC=ah}ao=aC+28|0;if((a[ao]&1)==0){c[n>>2]=c[ao>>2];c[n+4>>2]=c[ao+4>>2];c[n+8>>2]=c[ao+8>>2]}else{ao=c[aC+36>>2]|0;as=c[aC+32>>2]|0;if(as>>>0>4294967279>>>0){af=958;break}if(as>>>0<11>>>0){a[n]=as<<1;aD=n+1|0}else{al=tu(as+16&-16)|0;c[(n+8|0)>>2]=al;c[(n|0)>>2]=as+16&-16|1;c[(n+4|0)>>2]=as;aD=al}tH(aD|0,ao|0,as)|0;a[aD+as|0]=0}as=(c[(d|0)>>2]|0)+(ae*112|0)+8|0;if((as|0)==0){hC(19,0,49832,(ag=i,i=i+1|0,i=i+7&-8,c[ag>>2]=0,ag)|0);i=ag}else{c[as>>2]=cj(((a[n]&1)==0?n+1|0:c[(n+8|0)>>2]|0)|0)|0}if((a[n]&1)!=0){tw(c[(n+8|0)>>2]|0)}if((a[p]&1)!=0){tw(c[(p+8|0)>>2]|0)}c[r>>2]=ae;as=kc(ad,r)|0;a[s]=16;C=1701603686;a[s+1|0|0]=C;C=C>>8;a[(s+1|0|0)+1|0]=C;C=C>>8;a[(s+1|0|0)+2|0]=C;C=C>>8;a[(s+1|0|0)+3|0]=C;C=1701667150;a[(s+1|0)+4|0]=C;C=C>>8;a[((s+1|0)+4|0)+1|0]=C;C=C>>8;a[((s+1|0)+4|0)+2|0]=C;C=C>>8;a[((s+1|0)+4|0)+3|0]=C;a[s+9|0]=0;ao=kp(as,b+1424|0,s)|0;al=c[ao>>2]|0;if((al|0)==0){am=tu(40)|0;do{if((am+16|0|0)!=0){if((a[s]&1)==0){c[(am+16|0)>>2]=c[s>>2];c[(am+16|0)+4>>2]=c[s+4>>2];c[(am+16|0)+8>>2]=c[s+8>>2];break}at=c[(s+8|0)>>2]|0;au=c[(s+4|0)>>2]|0;if(au>>>0>4294967279>>>0){af=979;break L990}if(au>>>0<11>>>0){a[am+16|0]=au<<1;aE=am+17|0}else{aw=tu(au+16&-16)|0;c[am+24>>2]=aw;c[(am+16|0)>>2]=au+16&-16|1;c[am+20>>2]=au;aE=aw}tH(aE|0,at|0,au)|0;a[aE+au|0]=0}}while(0);if((am+28|0|0)!=0){tI(am+28|0|0,0,12)|0}ah=c[(b+1424|0)>>2]|0;c[am>>2]=0;c[am+4>>2]=0;c[am+8>>2]=ah;c[ao>>2]=am;ah=c[c[(as|0)>>2]>>2]|0;if((ah|0)==0){aF=am}else{c[(as|0)>>2]=ah;aF=c[ao>>2]|0}jV(c[as+4>>2]|0,aF);c[(as+8|0)>>2]=(c[(as+8|0)>>2]|0)+1;aG=am}else{aG=al}ah=aG+28|0;if((a[ah]&1)==0){c[q>>2]=c[ah>>2];c[q+4>>2]=c[ah+4>>2];c[q+8>>2]=c[ah+8>>2]}else{ah=c[aG+36>>2]|0;ai=c[aG+32>>2]|0;if(ai>>>0>4294967279>>>0){af=998;break}if(ai>>>0<11>>>0){a[q]=ai<<1;aH=q+1|0}else{ak=tu(ai+16&-16)|0;c[(q+8|0)>>2]=ak;c[(q|0)>>2]=ai+16&-16|1;c[(q+4|0)>>2]=ai;aH=ak}tH(aH|0,ah|0,ai)|0;a[aH+ai|0]=0}ai=(c[(d|0)>>2]|0)+(ae*112|0)+12|0;if((ai|0)==0){hC(19,0,49832,(ag=i,i=i+1|0,i=i+7&-8,c[ag>>2]=0,ag)|0);i=ag}else{c[ai>>2]=cj(((a[q]&1)==0?q+1|0:c[(q+8|0)>>2]|0)|0)|0}if((a[q]&1)!=0){tw(c[(q+8|0)>>2]|0)}if((a[s]&1)!=0){tw(c[(s+8|0)>>2]|0)}c[u>>2]=ae;ai=kc(ad,u)|0;a[v]=18;tH(v+1|0|0,28704,9)|0;a[v+10|0]=0;ah=kp(ai,b+1416|0,v)|0;ak=c[ah>>2]|0;if((ak|0)==0){aj=tu(40)|0;do{if((aj+16|0|0)!=0){if((a[v]&1)==0){c[(aj+16|0)>>2]=c[v>>2];c[(aj+16|0)+4>>2]=c[v+4>>2];c[(aj+16|0)+8>>2]=c[v+8>>2];break}au=c[(v+8|0)>>2]|0;at=c[(v+4|0)>>2]|0;if(at>>>0>4294967279>>>0){af=1019;break L990}if(at>>>0<11>>>0){a[aj+16|0]=at<<1;aI=aj+17|0}else{aw=tu(at+16&-16)|0;c[aj+24>>2]=aw;c[(aj+16|0)>>2]=at+16&-16|1;c[aj+20>>2]=at;aI=aw}tH(aI|0,au|0,at)|0;a[aI+at|0]=0}}while(0);if((aj+28|0|0)!=0){tI(aj+28|0|0,0,12)|0}al=c[(b+1416|0)>>2]|0;c[aj>>2]=0;c[aj+4>>2]=0;c[aj+8>>2]=al;c[ah>>2]=aj;al=c[c[(ai|0)>>2]>>2]|0;if((al|0)==0){aJ=aj}else{c[(ai|0)>>2]=al;aJ=c[ah>>2]|0}jV(c[ai+4>>2]|0,aJ);c[(ai+8|0)>>2]=(c[(ai+8|0)>>2]|0)+1;aK=aj}else{aK=ak}al=aK+28|0;if((a[al]&1)==0){c[t>>2]=c[al>>2];c[t+4>>2]=c[al+4>>2];c[t+8>>2]=c[al+8>>2]}else{al=c[aK+36>>2]|0;am=c[aK+32>>2]|0;if(am>>>0>4294967279>>>0){af=1038;break}if(am>>>0<11>>>0){a[t]=am<<1;aL=t+1|0}else{as=tu(am+16&-16)|0;c[(t+8|0)>>2]=as;c[(t|0)>>2]=am+16&-16|1;c[(t+4|0)>>2]=am;aL=as}tH(aL|0,al|0,am)|0;a[aL+am|0]=0}kb(t,(c[(d|0)>>2]|0)+(ae*112|0)+16|0,0);if((a[t]&1)!=0){tw(c[(t+8|0)>>2]|0)}if((a[v]&1)!=0){tw(c[(v+8|0)>>2]|0)}c[x>>2]=ae;am=kc(ad,x)|0;al=tu(16)|0;c[(y+8|0)>>2]=al;c[(y|0)>>2]=17;c[(y+4|0)>>2]=11;tH(al|0,28120,11)|0;a[al+11|0]=0;al=kp(am,b+1408|0,y)|0;as=c[al>>2]|0;if((as|0)==0){ao=tu(40)|0;do{if((ao+16|0|0)!=0){if((a[y]&1)==0){c[(ao+16|0)>>2]=c[y>>2];c[(ao+16|0)+4>>2]=c[y+4>>2];c[(ao+16|0)+8>>2]=c[y+8>>2];break}at=c[(y+8|0)>>2]|0;au=c[(y+4|0)>>2]|0;if(au>>>0>4294967279>>>0){af=1057;break L990}if(au>>>0<11>>>0){a[ao+16|0]=au<<1;aM=ao+17|0}else{aw=tu(au+16&-16)|0;c[ao+24>>2]=aw;c[(ao+16|0)>>2]=au+16&-16|1;c[ao+20>>2]=au;aM=aw}tH(aM|0,at|0,au)|0;a[aM+au|0]=0}}while(0);if((ao+28|0|0)!=0){tI(ao+28|0|0,0,12)|0}ak=c[(b+1408|0)>>2]|0;c[ao>>2]=0;c[ao+4>>2]=0;c[ao+8>>2]=ak;c[al>>2]=ao;ak=c[c[(am|0)>>2]>>2]|0;if((ak|0)==0){aN=ao}else{c[(am|0)>>2]=ak;aN=c[al>>2]|0}jV(c[am+4>>2]|0,aN);c[(am+8|0)>>2]=(c[(am+8|0)>>2]|0)+1;aO=ao}else{aO=as}ak=aO+28|0;if((a[ak]&1)==0){c[w>>2]=c[ak>>2];c[w+4>>2]=c[ak+4>>2];c[w+8>>2]=c[ak+8>>2]}else{ak=c[aO+36>>2]|0;aj=c[aO+32>>2]|0;if(aj>>>0>4294967279>>>0){af=1076;break}if(aj>>>0<11>>>0){a[w]=aj<<1;aP=w+1|0}else{ai=tu(aj+16&-16)|0;c[(w+8|0)>>2]=ai;c[(w|0)>>2]=aj+16&-16|1;c[(w+4|0)>>2]=aj;aP=ai}tH(aP|0,ak|0,aj)|0;a[aP+aj|0]=0}kb(w,(c[(d|0)>>2]|0)+(ae*112|0)+20|0,0);if((a[w]&1)!=0){tw(c[(w+8|0)>>2]|0)}if((a[y]&1)!=0){tw(c[(y+8|0)>>2]|0)}c[A>>2]=ae;aj=kc(ad,A)|0;a[B]=14;a[B+1|0]=a[27080]|0;a[(B+1|0)+1|0]=a[27081]|0;a[(B+1|0)+2|0]=a[27082]|0;a[(B+1|0)+3|0]=a[27083]|0;a[(B+1|0)+4|0]=a[27084]|0;a[(B+1|0)+5|0]=a[27085]|0;a[(B+1|0)+6|0]=a[27086]|0;a[B+8|0]=0;ak=kp(aj,b+1400|0,B)|0;ai=c[ak>>2]|0;if((ai|0)==0){ah=tu(40)|0;do{if((ah+16|0|0)!=0){if((a[B]&1)==0){c[(ah+16|0)>>2]=c[B>>2];c[(ah+16|0)+4>>2]=c[B+4>>2];c[(ah+16|0)+8>>2]=c[B+8>>2];break}au=c[(B+8|0)>>2]|0;at=c[(B+4|0)>>2]|0;if(at>>>0>4294967279>>>0){af=1094;break L990}if(at>>>0<11>>>0){a[ah+16|0]=at<<1;aQ=ah+17|0}else{aw=tu(at+16&-16)|0;c[ah+24>>2]=aw;c[(ah+16|0)>>2]=at+16&-16|1;c[ah+20>>2]=at;aQ=aw}tH(aQ|0,au|0,at)|0;a[aQ+at|0]=0}}while(0);if((ah+28|0|0)!=0){tI(ah+28|0|0,0,12)|0}as=c[(b+1400|0)>>2]|0;c[ah>>2]=0;c[ah+4>>2]=0;c[ah+8>>2]=as;c[ak>>2]=ah;as=c[c[(aj|0)>>2]>>2]|0;if((as|0)==0){aR=ah}else{c[(aj|0)>>2]=as;aR=c[ak>>2]|0}jV(c[aj+4>>2]|0,aR);c[(aj+8|0)>>2]=(c[(aj+8|0)>>2]|0)+1;aS=ah}else{aS=ai}as=aS+28|0;if((a[as]&1)==0){c[z>>2]=c[as>>2];c[z+4>>2]=c[as+4>>2];c[z+8>>2]=c[as+8>>2]}else{as=c[aS+36>>2]|0;ao=c[aS+32>>2]|0;if(ao>>>0>4294967279>>>0){af=1113;break}if(ao>>>0<11>>>0){a[z]=ao<<1;aT=z+1|0}else{am=tu(ao+16&-16)|0;c[(z+8|0)>>2]=am;c[(z|0)>>2]=ao+16&-16|1;c[(z+4|0)>>2]=ao;aT=am}tH(aT|0,as|0,ao)|0;a[aT+ao|0]=0}kb(z,(c[(d|0)>>2]|0)+(ae*112|0)+24|0,0);if((a[z]&1)!=0){tw(c[(z+8|0)>>2]|0)}if((a[B]&1)!=0){tw(c[(B+8|0)>>2]|0)}c[E>>2]=ae;ao=kc(ad,E)|0;a[F]=18;tH(F+1|0|0,26600,9)|0;a[F+10|0]=0;as=kp(ao,b+1392|0,F)|0;am=c[as>>2]|0;if((am|0)==0){al=tu(40)|0;do{if((al+16|0|0)!=0){if((a[F]&1)==0){c[(al+16|0)>>2]=c[F>>2];c[(al+16|0)+4>>2]=c[F+4>>2];c[(al+16|0)+8>>2]=c[F+8>>2];break}at=c[(F+8|0)>>2]|0;au=c[(F+4|0)>>2]|0;if(au>>>0>4294967279>>>0){af=1131;break L990}if(au>>>0<11>>>0){a[al+16|0]=au<<1;aU=al+17|0}else{aw=tu(au+16&-16)|0;c[al+24>>2]=aw;c[(al+16|0)>>2]=au+16&-16|1;c[al+20>>2]=au;aU=aw}tH(aU|0,at|0,au)|0;a[aU+au|0]=0}}while(0);if((al+28|0|0)!=0){tI(al+28|0|0,0,12)|0}ai=c[(b+1392|0)>>2]|0;c[al>>2]=0;c[al+4>>2]=0;c[al+8>>2]=ai;c[as>>2]=al;ai=c[c[(ao|0)>>2]>>2]|0;if((ai|0)==0){aV=al}else{c[(ao|0)>>2]=ai;aV=c[as>>2]|0}jV(c[ao+4>>2]|0,aV);c[(ao+8|0)>>2]=(c[(ao+8|0)>>2]|0)+1;aW=al}else{aW=am}ai=aW+28|0;if((a[ai]&1)==0){c[D>>2]=c[ai>>2];c[D+4>>2]=c[ai+4>>2];c[D+8>>2]=c[ai+8>>2]}else{ai=c[aW+36>>2]|0;ah=c[aW+32>>2]|0;if(ah>>>0>4294967279>>>0){af=1150;break}if(ah>>>0<11>>>0){a[D]=ah<<1;aX=D+1|0}else{aj=tu(ah+16&-16)|0;c[(D+8|0)>>2]=aj;c[(D|0)>>2]=ah+16&-16|1;c[(D+4|0)>>2]=ah;aX=aj}tH(aX|0,ai|0,ah)|0;a[aX+ah|0]=0}kb(D,(c[(d|0)>>2]|0)+(ae*112|0)+28|0,0);if((a[D]&1)!=0){tw(c[(D+8|0)>>2]|0)}if((a[F]&1)!=0){tw(c[(F+8|0)>>2]|0)}c[H>>2]=ae;ah=kc(ad,H)|0;ai=tu(16)|0;c[(I+8|0)>>2]=ai;c[(I|0)>>2]=17;c[(I+4|0)>>2]=12;tH(ai|0,25696,12)|0;a[ai+12|0]=0;ai=kp(ah,b+1384|0,I)|0;aj=c[ai>>2]|0;if((aj|0)==0){ak=tu(40)|0;do{if((ak+16|0|0)!=0){if((a[I]&1)==0){c[(ak+16|0)>>2]=c[I>>2];c[(ak+16|0)+4>>2]=c[I+4>>2];c[(ak+16|0)+8>>2]=c[I+8>>2];break}au=c[(I+8|0)>>2]|0;at=c[(I+4|0)>>2]|0;if(at>>>0>4294967279>>>0){af=1169;break L990}if(at>>>0<11>>>0){a[ak+16|0]=at<<1;aY=ak+17|0}else{aw=tu(at+16&-16)|0;c[ak+24>>2]=aw;c[(ak+16|0)>>2]=at+16&-16|1;c[ak+20>>2]=at;aY=aw}tH(aY|0,au|0,at)|0;a[aY+at|0]=0}}while(0);if((ak+28|0|0)!=0){tI(ak+28|0|0,0,12)|0}am=c[(b+1384|0)>>2]|0;c[ak>>2]=0;c[ak+4>>2]=0;c[ak+8>>2]=am;c[ai>>2]=ak;am=c[c[(ah|0)>>2]>>2]|0;if((am|0)==0){aZ=ak}else{c[(ah|0)>>2]=am;aZ=c[ai>>2]|0}jV(c[ah+4>>2]|0,aZ);c[(ah+8|0)>>2]=(c[(ah+8|0)>>2]|0)+1;a_=ak}else{a_=aj}am=a_+28|0;if((a[am]&1)==0){c[G>>2]=c[am>>2];c[G+4>>2]=c[am+4>>2];c[G+8>>2]=c[am+8>>2]}else{am=c[a_+36>>2]|0;al=c[a_+32>>2]|0;if(al>>>0>4294967279>>>0){af=1188;break}if(al>>>0<11>>>0){a[G]=al<<1;a$=G+1|0}else{ao=tu(al+16&-16)|0;c[(G+8|0)>>2]=ao;c[(G|0)>>2]=al+16&-16|1;c[(G+4|0)>>2]=al;a$=ao}tH(a$|0,am|0,al)|0;a[a$+al|0]=0}kb(G,(c[(d|0)>>2]|0)+(ae*112|0)+32|0,0);if((a[G]&1)!=0){tw(c[(G+8|0)>>2]|0)}if((a[I]&1)!=0){tw(c[(I+8|0)>>2]|0)}c[K>>2]=ae;al=kc(ad,K)|0;a[L]=16;C=1399157621;a[L+1|0|0]=C;C=C>>8;a[(L+1|0|0)+1|0]=C;C=C>>8;a[(L+1|0|0)+2|0]=C;C=C>>8;a[(L+1|0|0)+3|0]=C;C=1953653108;a[(L+1|0)+4|0]=C;C=C>>8;a[((L+1|0)+4|0)+1|0]=C;C=C>>8;a[((L+1|0)+4|0)+2|0]=C;C=C>>8;a[((L+1|0)+4|0)+3|0]=C;a[L+9|0]=0;am=kp(al,b+1376|0,L)|0;ao=c[am>>2]|0;if((ao|0)==0){as=tu(40)|0;do{if((as+16|0|0)!=0){if((a[L]&1)==0){c[(as+16|0)>>2]=c[L>>2];c[(as+16|0)+4>>2]=c[L+4>>2];c[(as+16|0)+8>>2]=c[L+8>>2];break}at=c[(L+8|0)>>2]|0;au=c[(L+4|0)>>2]|0;if(au>>>0>4294967279>>>0){af=1206;break L990}if(au>>>0<11>>>0){a[as+16|0]=au<<1;a0=as+17|0}else{aw=tu(au+16&-16)|0;c[as+24>>2]=aw;c[(as+16|0)>>2]=au+16&-16|1;c[as+20>>2]=au;a0=aw}tH(a0|0,at|0,au)|0;a[a0+au|0]=0}}while(0);if((as+28|0|0)!=0){tI(as+28|0|0,0,12)|0}aj=c[(b+1376|0)>>2]|0;c[as>>2]=0;c[as+4>>2]=0;c[as+8>>2]=aj;c[am>>2]=as;aj=c[c[(al|0)>>2]>>2]|0;if((aj|0)==0){a1=as}else{c[(al|0)>>2]=aj;a1=c[am>>2]|0}jV(c[al+4>>2]|0,a1);c[(al+8|0)>>2]=(c[(al+8|0)>>2]|0)+1;a2=as}else{a2=ao}aj=a2+28|0;if((a[aj]&1)==0){c[J>>2]=c[aj>>2];c[J+4>>2]=c[aj+4>>2];c[J+8>>2]=c[aj+8>>2];a3=a[J]|0}else{aj=c[a2+36>>2]|0;ak=c[a2+32>>2]|0;if(ak>>>0>4294967279>>>0){af=1225;break}if(ak>>>0<11>>>0){a[J]=ak<<1&255;a4=J+1|0;a5=ak<<1&255}else{ah=tu(ak+16&-16)|0;c[(J+8|0)>>2]=ah;c[(J|0)>>2]=ak+16&-16|1;c[(J+4|0)>>2]=ak;a4=ah;a5=(ak+16&-16|1)&255}tH(a4|0,aj|0,ak)|0;a[a4+ak|0]=0;a3=a5}ak=(c[(d|0)>>2]|0)+(ae*112|0)+88|0;aj=a3&255;ah=(aj&1|0)==0?aj>>>1:c[(J+4|0)>>2]|0;aj=(a3&1)==0;ai=c[(J+8|0)>>2]|0;au=tK((aj?J+1|0:ai)|0,42e3,(ah>>>0>4>>>0?4:ah)|0)|0;if((au|0)==0){a6=ah>>>0<4>>>0?-1:ah>>>0>4>>>0&1}else{a6=au}a[ak]=(a6|0)==0|0;if(!aj){tw(ai)}if((a[L]&1)!=0){tw(c[(L+8|0)>>2]|0)}c[N>>2]=ae;ai=kc(ad,N)|0;a[O]=10;a[O+1|0]=a[39368]|0;a[(O+1|0)+1|0]=a[39369]|0;a[(O+1|0)+2|0]=a[39370]|0;a[(O+1|0)+3|0]=a[39371]|0;a[(O+1|0)+4|0]=a[39372]|0;a[O+6|0]=0;aj=kp(ai,b+1368|0,O)|0;ak=c[aj>>2]|0;if((ak|0)==0){au=tu(40)|0;do{if((au+16|0|0)!=0){if((a[O]&1)==0){c[(au+16|0)>>2]=c[O>>2];c[(au+16|0)+4>>2]=c[O+4>>2];c[(au+16|0)+8>>2]=c[O+8>>2];break}ah=c[(O+8|0)>>2]|0;at=c[(O+4|0)>>2]|0;if(at>>>0>4294967279>>>0){af=1245;break L990}if(at>>>0<11>>>0){a[au+16|0]=at<<1;a7=au+17|0}else{aw=tu(at+16&-16)|0;c[au+24>>2]=aw;c[(au+16|0)>>2]=at+16&-16|1;c[au+20>>2]=at;a7=aw}tH(a7|0,ah|0,at)|0;a[a7+at|0]=0}}while(0);if((au+28|0|0)!=0){tI(au+28|0|0,0,12)|0}ao=c[(b+1368|0)>>2]|0;c[au>>2]=0;c[au+4>>2]=0;c[au+8>>2]=ao;c[aj>>2]=au;ao=c[c[(ai|0)>>2]>>2]|0;if((ao|0)==0){a8=au}else{c[(ai|0)>>2]=ao;a8=c[aj>>2]|0}jV(c[ai+4>>2]|0,a8);c[(ai+8|0)>>2]=(c[(ai+8|0)>>2]|0)+1;a9=au}else{a9=ak}ao=a9+28|0;if((a[ao]&1)==0){c[M>>2]=c[ao>>2];c[M+4>>2]=c[ao+4>>2];c[M+8>>2]=c[ao+8>>2]}else{ao=c[a9+36>>2]|0;as=c[a9+32>>2]|0;if(as>>>0>4294967279>>>0){af=1264;break}if(as>>>0<11>>>0){a[M]=as<<1;ba=M+1|0}else{al=tu(as+16&-16)|0;c[(M+8|0)>>2]=al;c[(M|0)>>2]=as+16&-16|1;c[(M+4|0)>>2]=as;ba=al}tH(ba|0,ao|0,as)|0;a[ba+as|0]=0}ka(M,(c[(d|0)>>2]|0)+(ae*112|0)+96|0,0.0);if((a[M]&1)!=0){tw(c[(M+8|0)>>2]|0)}if((a[O]&1)!=0){tw(c[(O+8|0)>>2]|0)}c[Q>>2]=ae;as=kc(ad,Q)|0;a[R]=10;a[R+1|0]=a[25288]|0;a[(R+1|0)+1|0]=a[25289]|0;a[(R+1|0)+2|0]=a[25290]|0;a[(R+1|0)+3|0]=a[25291]|0;a[(R+1|0)+4|0]=a[25292]|0;a[R+6|0]=0;ao=kp(as,b+1360|0,R)|0;al=c[ao>>2]|0;if((al|0)==0){am=tu(40)|0;do{if((am+16|0|0)!=0){if((a[R]&1)==0){c[(am+16|0)>>2]=c[R>>2];c[(am+16|0)+4>>2]=c[R+4>>2];c[(am+16|0)+8>>2]=c[R+8>>2];break}at=c[(R+8|0)>>2]|0;ah=c[(R+4|0)>>2]|0;if(ah>>>0>4294967279>>>0){af=1282;break L990}if(ah>>>0<11>>>0){a[am+16|0]=ah<<1;bb=am+17|0}else{aw=tu(ah+16&-16)|0;c[am+24>>2]=aw;c[(am+16|0)>>2]=ah+16&-16|1;c[am+20>>2]=ah;bb=aw}tH(bb|0,at|0,ah)|0;a[bb+ah|0]=0}}while(0);if((am+28|0|0)!=0){tI(am+28|0|0,0,12)|0}ak=c[(b+1360|0)>>2]|0;c[am>>2]=0;c[am+4>>2]=0;c[am+8>>2]=ak;c[ao>>2]=am;ak=c[c[(as|0)>>2]>>2]|0;if((ak|0)==0){bc=am}else{c[(as|0)>>2]=ak;bc=c[ao>>2]|0}jV(c[as+4>>2]|0,bc);c[(as+8|0)>>2]=(c[(as+8|0)>>2]|0)+1;bd=am}else{bd=al}ak=bd+28|0;if((a[ak]&1)==0){c[P>>2]=c[ak>>2];c[P+4>>2]=c[ak+4>>2];c[P+8>>2]=c[ak+8>>2];be=a[P]|0}else{ak=c[bd+36>>2]|0;au=c[bd+32>>2]|0;if(au>>>0>4294967279>>>0){af=1301;break}if(au>>>0<11>>>0){a[P]=au<<1&255;bf=P+1|0;bg=au<<1&255}else{ai=tu(au+16&-16)|0;c[(P+8|0)>>2]=ai;c[(P|0)>>2]=au+16&-16|1;c[(P+4|0)>>2]=au;bf=ai;bg=(au+16&-16|1)&255}tH(bf|0,ak|0,au)|0;a[bf+au|0]=0;be=bg}au=(c[(d|0)>>2]|0)+(ae*112|0)+72|0;ak=be&255;ai=(ak&1|0)==0?ak>>>1:c[(P+4|0)>>2]|0;ak=(be&1)==0;aj=c[(P+8|0)>>2]|0;ah=tK((ak?P+1|0:aj)|0,42e3,(ai>>>0>4>>>0?4:ai)|0)|0;if((ah|0)==0){bh=ai>>>0<4>>>0?-1:ai>>>0>4>>>0&1}else{bh=ah}a[au]=(bh|0)==0|0;if(!ak){tw(aj)}if((a[R]&1)!=0){tw(c[(R+8|0)>>2]|0)}c[T>>2]=ae;aj=kc(ad,T)|0;a[U]=20;tH(U+1|0|0,24848,10)|0;a[U+11|0]=0;ak=kp(aj,b+1352|0,U)|0;au=c[ak>>2]|0;if((au|0)==0){ah=tu(40)|0;do{if((ah+16|0|0)!=0){if((a[U]&1)==0){c[(ah+16|0)>>2]=c[U>>2];c[(ah+16|0)+4>>2]=c[U+4>>2];c[(ah+16|0)+8>>2]=c[U+8>>2];break}ai=c[(U+8|0)>>2]|0;at=c[(U+4|0)>>2]|0;if(at>>>0>4294967279>>>0){af=1321;break L990}if(at>>>0<11>>>0){a[ah+16|0]=at<<1;bi=ah+17|0}else{aw=tu(at+16&-16)|0;c[ah+24>>2]=aw;c[(ah+16|0)>>2]=at+16&-16|1;c[ah+20>>2]=at;bi=aw}tH(bi|0,ai|0,at)|0;a[bi+at|0]=0}}while(0);if((ah+28|0|0)!=0){tI(ah+28|0|0,0,12)|0}al=c[(b+1352|0)>>2]|0;c[ah>>2]=0;c[ah+4>>2]=0;c[ah+8>>2]=al;c[ak>>2]=ah;al=c[c[(aj|0)>>2]>>2]|0;if((al|0)==0){bj=ah}else{c[(aj|0)>>2]=al;bj=c[ak>>2]|0}jV(c[aj+4>>2]|0,bj);c[(aj+8|0)>>2]=(c[(aj+8|0)>>2]|0)+1;bk=ah}else{bk=au}al=bk+28|0;if((a[al]&1)==0){c[S>>2]=c[al>>2];c[S+4>>2]=c[al+4>>2];c[S+8>>2]=c[al+8>>2];bl=a[S]|0}else{al=c[bk+36>>2]|0;am=c[bk+32>>2]|0;if(am>>>0>4294967279>>>0){af=1340;break}if(am>>>0<11>>>0){a[S]=am<<1&255;bm=S+1|0;bn=am<<1&255}else{as=tu(am+16&-16)|0;c[(S+8|0)>>2]=as;c[(S|0)>>2]=am+16&-16|1;c[(S+4|0)>>2]=am;bm=as;bn=(am+16&-16|1)&255}tH(bm|0,al|0,am)|0;a[bm+am|0]=0;bl=bn}am=(c[(d|0)>>2]|0)+(ae*112|0)+73|0;al=bl&255;as=(al&1|0)==0?al>>>1:c[(S+4|0)>>2]|0;al=(bl&1)==0;ao=c[(S+8|0)>>2]|0;at=tK((al?S+1|0:ao)|0,42e3,(as>>>0>4>>>0?4:as)|0)|0;if((at|0)==0){bo=as>>>0<4>>>0?-1:as>>>0>4>>>0&1}else{bo=at}a[am]=(bo|0)==0|0;if(!al){tw(ao)}if((a[U]&1)!=0){tw(c[(U+8|0)>>2]|0)}c[W>>2]=ae;ao=kc(ad,W)|0;a[X]=14;a[X+1|0]=a[24768]|0;a[(X+1|0)+1|0]=a[24769]|0;a[(X+1|0)+2|0]=a[24770]|0;a[(X+1|0)+3|0]=a[24771]|0;a[(X+1|0)+4|0]=a[24772]|0;a[(X+1|0)+5|0]=a[24773]|0;a[(X+1|0)+6|0]=a[24774]|0;a[X+8|0]=0;al=kp(ao,b+1344|0,X)|0;am=c[al>>2]|0;if((am|0)==0){at=tu(40)|0;do{if((at+16|0|0)!=0){if((a[X]&1)==0){c[(at+16|0)>>2]=c[X>>2];c[(at+16|0)+4>>2]=c[X+4>>2];c[(at+16|0)+8>>2]=c[X+8>>2];break}as=c[(X+8|0)>>2]|0;ai=c[(X+4|0)>>2]|0;if(ai>>>0>4294967279>>>0){af=1360;break L990}if(ai>>>0<11>>>0){a[at+16|0]=ai<<1;bp=at+17|0}else{aw=tu(ai+16&-16)|0;c[at+24>>2]=aw;c[(at+16|0)>>2]=ai+16&-16|1;c[at+20>>2]=ai;bp=aw}tH(bp|0,as|0,ai)|0;a[bp+ai|0]=0}}while(0);if((at+28|0|0)!=0){tI(at+28|0|0,0,12)|0}au=c[(b+1344|0)>>2]|0;c[at>>2]=0;c[at+4>>2]=0;c[at+8>>2]=au;c[al>>2]=at;au=c[c[(ao|0)>>2]>>2]|0;if((au|0)==0){bq=at}else{c[(ao|0)>>2]=au;bq=c[al>>2]|0}jV(c[ao+4>>2]|0,bq);c[(ao+8|0)>>2]=(c[(ao+8|0)>>2]|0)+1;br=at}else{br=am}au=br+28|0;if((a[au]&1)==0){c[V>>2]=c[au>>2];c[V+4>>2]=c[au+4>>2];c[V+8>>2]=c[au+8>>2]}else{au=c[br+36>>2]|0;ah=c[br+32>>2]|0;if(ah>>>0>4294967279>>>0){af=1379;break}if(ah>>>0<11>>>0){a[V]=ah<<1;bs=V+1|0}else{aj=tu(ah+16&-16)|0;c[(V+8|0)>>2]=aj;c[(V|0)>>2]=ah+16&-16|1;c[(V+4|0)>>2]=ah;bs=aj}tH(bs|0,au|0,ah)|0;a[bs+ah|0]=0}ka(V,(c[(d|0)>>2]|0)+(ae*112|0)+80|0,1.0);if((a[V]&1)!=0){tw(c[(V+8|0)>>2]|0)}if((a[X]&1)!=0){tw(c[(X+8|0)>>2]|0)}c[Z>>2]=ae;ah=kc(ad,Z)|0;a[_]=6;a[_+1|0]=a[24672]|0;a[(_+1|0)+1|0]=a[24673]|0;a[(_+1|0)+2|0]=a[24674]|0;a[_+4|0]=0;au=kp(ah,b+1336|0,_)|0;aj=c[au>>2]|0;if((aj|0)==0){ak=tu(40)|0;do{if((ak+16|0|0)!=0){if((a[_]&1)==0){c[(ak+16|0)>>2]=c[_>>2];c[(ak+16|0)+4>>2]=c[_+4>>2];c[(ak+16|0)+8>>2]=c[_+8>>2];break}ai=c[(_+8|0)>>2]|0;as=c[(_+4|0)>>2]|0;if(as>>>0>4294967279>>>0){af=1397;break L990}if(as>>>0<11>>>0){a[ak+16|0]=as<<1;bt=ak+17|0}else{aw=tu(as+16&-16)|0;c[ak+24>>2]=aw;c[(ak+16|0)>>2]=as+16&-16|1;c[ak+20>>2]=as;bt=aw}tH(bt|0,ai|0,as)|0;a[bt+as|0]=0}}while(0);if((ak+28|0|0)!=0){tI(ak+28|0|0,0,12)|0}am=c[(b+1336|0)>>2]|0;c[ak>>2]=0;c[ak+4>>2]=0;c[ak+8>>2]=am;c[au>>2]=ak;am=c[c[(ah|0)>>2]>>2]|0;if((am|0)==0){bu=ak}else{c[(ah|0)>>2]=am;bu=c[au>>2]|0}jV(c[ah+4>>2]|0,bu);c[(ah+8|0)>>2]=(c[(ah+8|0)>>2]|0)+1;bv=ak}else{bv=aj}am=bv+28|0;if((a[am]&1)==0){c[Y>>2]=c[am>>2];c[Y+4>>2]=c[am+4>>2];c[Y+8>>2]=c[am+8>>2]}else{am=c[bv+36>>2]|0;at=c[bv+32>>2]|0;if(at>>>0>4294967279>>>0){af=1416;break}if(at>>>0<11>>>0){a[Y]=at<<1;bw=Y+1|0}else{ao=tu(at+16&-16)|0;c[(Y+8|0)>>2]=ao;c[(Y|0)>>2]=at+16&-16|1;c[(Y+4|0)>>2]=at;bw=ao}tH(bw|0,am|0,at)|0;a[bw+at|0]=0}ka(Y,(c[(d|0)>>2]|0)+(ae*112|0)+56|0,-1.7976931348623157e+308);if((a[Y]&1)!=0){tw(c[(Y+8|0)>>2]|0)}if((a[_]&1)!=0){tw(c[(_+8|0)>>2]|0)}c[aa>>2]=ae;at=kc(ad,aa)|0;a[ab]=6;a[ab+1|0]=a[24600]|0;a[(ab+1|0)+1|0]=a[24601]|0;a[(ab+1|0)+2|0]=a[24602]|0;a[ab+4|0]=0;am=kp(at,b+1328|0,ab)|0;ao=c[am>>2]|0;if((ao|0)==0){al=tu(40)|0;do{if((al+16|0|0)!=0){if((a[ab]&1)==0){c[(al+16|0)>>2]=c[ab>>2];c[(al+16|0)+4>>2]=c[ab+4>>2];c[(al+16|0)+8>>2]=c[ab+8>>2];break}as=c[(ab+8|0)>>2]|0;ai=c[(ab+4|0)>>2]|0;if(ai>>>0>4294967279>>>0){af=1434;break L990}if(ai>>>0<11>>>0){a[al+16|0]=ai<<1;bx=al+17|0}else{aw=tu(ai+16&-16)|0;c[al+24>>2]=aw;c[(al+16|0)>>2]=ai+16&-16|1;c[al+20>>2]=ai;bx=aw}tH(bx|0,as|0,ai)|0;a[bx+ai|0]=0}}while(0);if((al+28|0|0)!=0){tI(al+28|0|0,0,12)|0}aj=c[(b+1328|0)>>2]|0;c[al>>2]=0;c[al+4>>2]=0;c[al+8>>2]=aj;c[am>>2]=al;aj=c[c[(at|0)>>2]>>2]|0;if((aj|0)==0){by=al}else{c[(at|0)>>2]=aj;by=c[am>>2]|0}jV(c[at+4>>2]|0,by);c[(at+8|0)>>2]=(c[(at+8|0)>>2]|0)+1;bz=al}else{bz=ao}aj=bz+28|0;if((a[aj]&1)==0){c[$>>2]=c[aj>>2];c[$+4>>2]=c[aj+4>>2];c[$+8>>2]=c[aj+8>>2]}else{aj=c[bz+36>>2]|0;ak=c[bz+32>>2]|0;if(ak>>>0>4294967279>>>0){af=1453;break}if(ak>>>0<11>>>0){a[$]=ak<<1;bA=$+1|0}else{ah=tu(ak+16&-16)|0;c[($+8|0)>>2]=ah;c[($|0)>>2]=ak+16&-16|1;c[($+4|0)>>2]=ak;bA=ah}tH(bA|0,aj|0,ak)|0;a[bA+ak|0]=0}ka($,(c[(d|0)>>2]|0)+(ae*112|0)+64|0,1.7976931348623157e+308);if((a[$]&1)!=0){tw(c[($+8|0)>>2]|0)}if((a[ab]&1)!=0){tw(c[(ab+8|0)>>2]|0)}ak=c[(d|0)>>2]|0;aj=(a[ak+(ae*112|0)+88|0]|0)!=0;bB=+h[ak+(ae*112|0)+96>>3];ah=(a[ak+(ae*112|0)+72|0]|0)!=0?42e3:42440;au=(a[ak+(ae*112|0)+73|0]|0)!=0;bC=+h[ak+(ae*112|0)+80>>3];bD=+h[ak+(ae*112|0)+56>>3];bE=+h[ak+(ae*112|0)+64>>3];hA(4,0,24480,(ag=i,i=i+80|0,c[ag>>2]=c[ak+(ae*112|0)+4>>2],c[ag+8>>2]=aj?93904:24160,h[ag+16>>3]=bB,c[ag+24>>2]=aj?93904:24064,c[ag+32>>2]=ah,c[ag+40>>2]=au?93904:24160,h[ag+48>>3]=bC,c[ag+56>>2]=au?93904:24064,h[ag+64>>3]=bD,h[ag+72>>3]=bE,ag)|0);i=ag;au=c[(d|0)>>2]|0;ah=c[au+(ae*112|0)+4>>2]|0;if((a[ah]|0)==36){a[au+(ae*112|0)+104|0]=1;bF=c[(c[(d|0)>>2]|0)+(ae*112|0)+4>>2]|0}else{bF=ah}ah=tD(bF|0)|0;if(ah>>>0>4294967279>>>0){af=1544;break}if(ah>>>0<11>>>0){a[ac]=ah<<1;bG=ac+1|0}else{au=tu(ah+16&-16)|0;c[(ac+8|0)>>2]=au;c[(ac|0)>>2]=ah+16&-16|1;c[(ac+4|0)>>2]=ah;bG=au}tH(bG|0,bF|0,ah)|0;a[bG+ah|0]=0;c[(ke(e,ac)|0)>>2]=ae;if((a[ac]&1)!=0){tw(c[(ac+8|0)>>2]|0)}ae=ae+1|0;if((ae|0)>=(c[(d+104|0)>>2]|0)){c[b+39848>>2]=2;c[b+39852>>2]=2;break OL}}if((af|0)==860){ml(0)}else if((af|0)==879){ml(0)}else if((af|0)==901){ml(0)}else if((af|0)==920){ml(0)}else if((af|0)==939){ml(0)}else if((af|0)==958){ml(0)}else if((af|0)==979){ml(0)}else if((af|0)==998){ml(0)}else if((af|0)==1019){ml(0)}else if((af|0)==1038){ml(0)}else if((af|0)==1057){ml(0)}else if((af|0)==1076){ml(0)}else if((af|0)==1094){ml(0)}else if((af|0)==1113){ml(0)}else if((af|0)==1131){ml(0)}else if((af|0)==1150){ml(0)}else if((af|0)==1169){ml(0)}else if((af|0)==1188){ml(0)}else if((af|0)==1206){ml(0)}else if((af|0)==1225){ml(0)}else if((af|0)==1245){ml(0)}else if((af|0)==1264){ml(0)}else if((af|0)==1282){ml(0)}else if((af|0)==1301){ml(0)}else if((af|0)==1321){ml(0)}else if((af|0)==1340){ml(0)}else if((af|0)==1360){ml(0)}else if((af|0)==1379){ml(0)}else if((af|0)==1397){ml(0)}else if((af|0)==1416){ml(0)}else if((af|0)==1434){ml(0)}else if((af|0)==1453){ml(0)}else if((af|0)==1544){ml(0)}}while(0);c[b+10176>>2]=ae;c[b+39768>>2]=af;c[b+39776>>2]=ag}function _read_input_xml$8(b){b=b|0;var d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,D=0,E=0,F=0,G=0,H=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0,bP=0,bQ=0,bR=0,bS=0,bT=0,bU=0,bV=0,bW=0,bX=0,bY=0,bZ=0,b_=0,b$=0,b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,b7=0,b8=0,b9=0,ca=0,cb=0,cc=0,cd=0,ce=0,cf=0,cg=0,ch=0,ci=0,ck=0,cl=0,cm=0,cn=0,co=0,cp=0,cq=0,cr=0,cs=0,ct=0,cu=0,cv=0,cw=0,cx=0,cy=0,cz=0,cA=0,cB=0,cC=0,cD=0,cE=0,cF=0,cG=0,cH=0,cI=0,cJ=0,cK=0,cL=0,cM=0,cN=0,cO=0,cP=0,cQ=0,cR=0,cS=0,cT=0,cU=0,cV=0,cW=0,cX=0,cY=0,cZ=0,c_=0,c$=0,c0=0,c1=0,c2=0,c3=0,c4=0,c5=0,c6=0,c7=0,c8=0,c9=0,da=0,db=0,dc=0,de=0,df=0,dg=0,dh=0,di=0,dj=0,dk=0,dl=0,dm=0,dn=0,dp=0,dq=0,dr=0,ds=0,dt=0,du=0,dv=0,dw=0,dx=0,dy=0,dz=0,dA=0,dB=0,dC=0,dD=0,dE=0,dF=0,dG=0,dH=0,dI=0,dJ=0,dK=0,dL=0,dM=0,dN=0,dO=0,dP=0,dQ=0,dR=0,dS=0,dT=0,dU=0,dV=0,dW=0,dX=0,dY=0,dZ=0,d_=0,d$=0,d0=0,d1=0,d2=0,d3=0,d4=0,d5=0,d6=0,d7=0,d8=0,d9=0,ea=0,eb=0,ec=0,ed=0,ee=0,ef=0,eg=0,eh=0,ei=0,ej=0,ek=0,el=0,em=0,en=0,eo=0,ep=0,eq=0,er=0,es=0,et=0,eu=0,ev=0,ew=0,ex=0,ey=0,ez=0,eA=0,eB=0,eC=0,eD=0,eE=0,eF=0,eG=0,eH=0,eI=0,eJ=0,eK=0,eL=0,eM=0,eN=0,eO=0,eP=0,eQ=0,eR=0,eS=0,eT=0,eU=0,eV=0,eW=0,eX=0,eY=0,eZ=0,e_=0,e$=0,e0=0,e1=0,e2=0,e3=0,e4=0,e5=0,e6=0,e7=0,e8=0,e9=0,fa=0,fb=0,fc=0,fd=0,fe=0,ff=0,fg=0,fh=0,fi=0,fj=0,fk=0,fl=0,fm=0,fn=0,fo=0,fp=0,fq=0,fr=0,fs=0,ft=0,fu=0,fv=0,fw=0,fx=0,fy=0,fz=0,fA=0,fB=0,fC=0,fD=0,fE=0,fF=0,fG=0,fH=0,fI=0,fJ=0,fK=0,fL=0,fM=0,fN=0,fO=0,fP=0,fQ=0,fR=0,fS=0,fT=0,fU=0,fV=0,fW=0,fX=0,fY=0,fZ=0,f_=0,f$=0,f0=0,f1=0,f2=0,f3=0,f4=0,f5=0,f6=0,f7=0,f8=0,f9=0,ga=0,gb=0,gc=0,gd=0,ge=0,gf=0,gg=0,gh=0,gi=0,gj=0,gk=0,gl=0,gm=0,gn=0,go=0,gp=0,gq=0,gr=0,gs=0,gt=0,gu=0,gv=0,gw=0,gx=0,gy=0,gz=0,gA=0,gB=0,gC=0,gD=0,gE=0,gF=0,gG=0,gH=0,gI=0,gJ=0,gK=0,gL=0,gM=0,gN=0,gO=0,gP=0,gQ=0,gR=0,gS=0,gT=0,gU=0,gV=0,gW=0,gX=0,gY=0,gZ=0,g_=0,g$=0,g0=0,g1=0,g2=0,g3=0,g4=0,g5=0,g6=0,g7=0,g8=0,g9=0,ha=0,hb=0,hc=0,hd=0,he=0,hf=0,hg=0,hh=0,hi=0,hj=0,hk=0,hl=0,hm=0,hn=0,ho=0,hp=0,hq=0,hr=0,hs=0,ht=0,hu=0,hv=0,hw=0,hx=0,hy=0,hz=0,hB=0,hD=0,hE=0,hF=0,hG=0,hH=0,hI=0,hJ=0,hK=0,hL=0,hM=0,hN=0,hO=0,hP=0,hQ=0,hR=0,hS=0,hT=0,hU=0,hV=0,hW=0,hX=0,hY=0,hZ=0,h_=0,h$=0,h0=0,h1=0,h2=0,h3=0,h4=0,h5=0,h6=0,h7=0,h8=0,h9=0,ia=0,ib=0,ic=0,id=0,ie=0,ig=0,ih=0,ii=0,ij=0,ik=0,il=0,im=0,io=0,ip=0,iq=0,ir=0,is=0,it=0,iu=0;d=c[b+1904>>2]|0;e=c[b+1920>>2]|0;f=c[b+1928>>2]|0;h=c[b+1936>>2]|0;j=c[b+3512>>2]|0;k=c[b+3520>>2]|0;l=c[b+3528>>2]|0;m=c[b+3536>>2]|0;n=c[b+3544>>2]|0;o=c[b+3552>>2]|0;p=c[b+3560>>2]|0;q=c[b+3568>>2]|0;r=c[b+3576>>2]|0;s=c[b+3584>>2]|0;t=c[b+3592>>2]|0;u=c[b+3600>>2]|0;v=c[b+3608>>2]|0;w=c[b+3616>>2]|0;x=c[b+3624>>2]|0;y=c[b+3632>>2]|0;z=c[b+3640>>2]|0;A=c[b+3648>>2]|0;D=c[b+3656>>2]|0;E=c[b+3664>>2]|0;F=c[b+3672>>2]|0;G=c[b+3680>>2]|0;H=c[b+3688>>2]|0;K=c[b+3696>>2]|0;L=c[b+3704>>2]|0;M=c[b+3712>>2]|0;N=c[b+3720>>2]|0;O=c[b+3728>>2]|0;P=c[b+3736>>2]|0;Q=c[b+3744>>2]|0;R=c[b+3752>>2]|0;S=c[b+3760>>2]|0;T=c[b+3768>>2]|0;U=c[b+3776>>2]|0;V=c[b+3784>>2]|0;W=c[b+3792>>2]|0;X=c[b+3800>>2]|0;Y=c[b+3808>>2]|0;Z=c[b+3816>>2]|0;_=c[b+3824>>2]|0;$=c[b+3832>>2]|0;aa=c[b+3840>>2]|0;ab=c[b+3848>>2]|0;ac=c[b+3856>>2]|0;ad=c[b+3864>>2]|0;ae=c[b+3872>>2]|0;af=c[b+3880>>2]|0;ag=c[b+3888>>2]|0;ah=c[b+3896>>2]|0;ai=c[b+3904>>2]|0;aj=c[b+3912>>2]|0;ak=c[b+3920>>2]|0;al=c[b+3928>>2]|0;am=c[b+3936>>2]|0;an=c[b+3944>>2]|0;ao=c[b+3952>>2]|0;ap=c[b+3960>>2]|0;aq=c[b+3968>>2]|0;ar=c[b+3976>>2]|0;as=c[b+3984>>2]|0;at=c[b+3992>>2]|0;au=c[b+4e3>>2]|0;av=c[b+4008>>2]|0;aw=c[b+4016>>2]|0;ax=c[b+4024>>2]|0;ay=c[b+4032>>2]|0;az=c[b+4040>>2]|0;aA=c[b+4048>>2]|0;aB=c[b+4056>>2]|0;aC=c[b+4064>>2]|0;aD=c[b+4072>>2]|0;aE=c[b+4080>>2]|0;aF=c[b+4088>>2]|0;aG=c[b+4096>>2]|0;aH=c[b+4104>>2]|0;aI=c[b+4112>>2]|0;aJ=c[b+4120>>2]|0;aK=c[b+4128>>2]|0;aL=c[b+4136>>2]|0;aM=c[b+4144>>2]|0;aN=c[b+4152>>2]|0;aO=c[b+4160>>2]|0;aP=c[b+4168>>2]|0;aQ=c[b+4176>>2]|0;aR=c[b+4184>>2]|0;aS=c[b+4192>>2]|0;aT=c[b+4200>>2]|0;aU=c[b+4208>>2]|0;aV=c[b+4216>>2]|0;aW=c[b+4224>>2]|0;aX=c[b+4232>>2]|0;aY=c[b+4240>>2]|0;aZ=c[b+4248>>2]|0;a_=c[b+4256>>2]|0;a$=c[b+4264>>2]|0;a0=c[b+4272>>2]|0;a1=c[b+4280>>2]|0;a2=c[b+4288>>2]|0;a3=c[b+4296>>2]|0;a4=c[b+4304>>2]|0;a5=c[b+4312>>2]|0;a6=c[b+4320>>2]|0;a7=c[b+4328>>2]|0;a8=c[b+4336>>2]|0;a9=c[b+4344>>2]|0;ba=c[b+4352>>2]|0;bb=c[b+4360>>2]|0;bc=c[b+4368>>2]|0;bd=c[b+4376>>2]|0;be=c[b+4384>>2]|0;bf=c[b+4392>>2]|0;bg=c[b+4400>>2]|0;bh=c[b+4408>>2]|0;bi=c[b+4416>>2]|0;bj=c[b+4424>>2]|0;bk=c[b+4432>>2]|0;bl=c[b+4440>>2]|0;bm=c[b+4448>>2]|0;bn=c[b+4456>>2]|0;bo=c[b+4464>>2]|0;bp=c[b+4472>>2]|0;bq=c[b+4480>>2]|0;br=c[b+4488>>2]|0;bs=c[b+4496>>2]|0;bt=c[b+4504>>2]|0;bu=c[b+4512>>2]|0;bv=c[b+4520>>2]|0;bw=c[b+4528>>2]|0;bx=c[b+4536>>2]|0;by=c[b+4544>>2]|0;bz=c[b+4552>>2]|0;bA=c[b+4560>>2]|0;bB=c[b+4568>>2]|0;bC=c[b+4576>>2]|0;bD=c[b+4584>>2]|0;bE=c[b+4592>>2]|0;bF=c[b+4600>>2]|0;bG=c[b+4608>>2]|0;bH=c[b+4616>>2]|0;bI=c[b+4624>>2]|0;bJ=c[b+4632>>2]|0;bK=c[b+4640>>2]|0;bL=c[b+4648>>2]|0;bM=c[b+4656>>2]|0;bN=c[b+4664>>2]|0;bO=c[b+4672>>2]|0;bP=c[b+4680>>2]|0;bQ=c[b+4688>>2]|0;bR=c[b+4696>>2]|0;bS=c[b+4704>>2]|0;bT=c[b+4712>>2]|0;bU=c[b+4720>>2]|0;bV=c[b+4728>>2]|0;bW=c[b+4736>>2]|0;bX=c[b+4744>>2]|0;bY=c[b+4752>>2]|0;bZ=c[b+4760>>2]|0;b_=c[b+4768>>2]|0;b$=c[b+4776>>2]|0;b0=c[b+4784>>2]|0;b1=c[b+4792>>2]|0;b2=c[b+4800>>2]|0;b3=c[b+4808>>2]|0;b4=c[b+4816>>2]|0;b5=c[b+4824>>2]|0;b6=c[b+4832>>2]|0;b7=c[b+4840>>2]|0;b8=c[b+4848>>2]|0;b9=c[b+4856>>2]|0;ca=c[b+4864>>2]|0;cb=c[b+4872>>2]|0;cc=c[b+4880>>2]|0;cd=c[b+4888>>2]|0;ce=c[b+4896>>2]|0;cf=c[b+4904>>2]|0;cg=c[b+4912>>2]|0;ch=c[b+4920>>2]|0;ci=c[b+4928>>2]|0;ck=c[b+4936>>2]|0;cl=c[b+4944>>2]|0;cm=c[b+4952>>2]|0;cn=c[b+4960>>2]|0;co=c[b+4968>>2]|0;cp=c[b+4976>>2]|0;cq=c[b+4984>>2]|0;cr=c[b+4992>>2]|0;cs=c[b+5e3>>2]|0;ct=c[b+5008>>2]|0;cu=c[b+5016>>2]|0;cv=c[b+5024>>2]|0;cw=c[b+5032>>2]|0;cx=c[b+5040>>2]|0;cy=c[b+5048>>2]|0;cz=c[b+5056>>2]|0;cA=c[b+5064>>2]|0;cB=c[b+5072>>2]|0;cC=c[b+5080>>2]|0;cD=c[b+5088>>2]|0;cE=c[b+5096>>2]|0;cF=c[b+5104>>2]|0;cG=c[b+5112>>2]|0;cH=c[b+5120>>2]|0;cI=c[b+5128>>2]|0;cJ=c[b+5136>>2]|0;cK=c[b+5144>>2]|0;cL=c[b+5152>>2]|0;cM=c[b+5160>>2]|0;cN=c[b+5168>>2]|0;cO=c[b+5176>>2]|0;cP=c[b+5184>>2]|0;cQ=c[b+5192>>2]|0;cR=c[b+5200>>2]|0;cS=c[b+5208>>2]|0;cT=c[b+5216>>2]|0;cU=c[b+5224>>2]|0;cV=c[b+5232>>2]|0;cW=c[b+5240>>2]|0;cX=c[b+5248>>2]|0;cY=c[b+5256>>2]|0;cZ=c[b+5264>>2]|0;c_=c[b+5272>>2]|0;c$=c[b+5280>>2]|0;c0=c[b+5288>>2]|0;c1=c[b+5296>>2]|0;c2=c[b+5304>>2]|0;c3=c[b+5312>>2]|0;c4=c[b+5320>>2]|0;c5=c[b+5328>>2]|0;c6=c[b+5336>>2]|0;c7=c[b+5344>>2]|0;c8=c[b+5352>>2]|0;c9=c[b+5360>>2]|0;da=c[b+5368>>2]|0;db=c[b+5376>>2]|0;dc=c[b+5384>>2]|0;de=c[b+5392>>2]|0;df=c[b+5400>>2]|0;dg=c[b+5408>>2]|0;dh=c[b+5416>>2]|0;di=c[b+5424>>2]|0;dj=c[b+5432>>2]|0;dk=c[b+5440>>2]|0;dl=c[b+5448>>2]|0;dm=c[b+5456>>2]|0;dn=c[b+5464>>2]|0;dp=c[b+5472>>2]|0;dq=c[b+5480>>2]|0;dr=c[b+5488>>2]|0;ds=c[b+5496>>2]|0;dt=c[b+5504>>2]|0;du=c[b+5512>>2]|0;dv=c[b+5520>>2]|0;dw=c[b+5528>>2]|0;dx=c[b+5536>>2]|0;dy=c[b+5544>>2]|0;dz=c[b+5552>>2]|0;dA=c[b+5560>>2]|0;dB=c[b+5568>>2]|0;dC=c[b+5576>>2]|0;dD=c[b+5584>>2]|0;dE=c[b+5592>>2]|0;dF=c[b+5600>>2]|0;dG=c[b+5608>>2]|0;dH=c[b+5616>>2]|0;dI=c[b+5624>>2]|0;dJ=c[b+5632>>2]|0;dK=c[b+5640>>2]|0;dL=c[b+5648>>2]|0;dM=c[b+5656>>2]|0;dN=c[b+5664>>2]|0;dO=c[b+5672>>2]|0;dP=c[b+5680>>2]|0;dQ=c[b+5688>>2]|0;dR=c[b+5696>>2]|0;dS=c[b+5704>>2]|0;dT=c[b+5712>>2]|0;dU=c[b+5720>>2]|0;dV=c[b+5728>>2]|0;dW=c[b+5736>>2]|0;dX=c[b+5744>>2]|0;dY=c[b+5752>>2]|0;dZ=c[b+5760>>2]|0;d_=c[b+5768>>2]|0;d$=c[b+5776>>2]|0;d0=c[b+5784>>2]|0;d1=c[b+5792>>2]|0;d2=c[b+5800>>2]|0;d3=c[b+5808>>2]|0;d4=c[b+5816>>2]|0;d5=c[b+5824>>2]|0;d6=c[b+5832>>2]|0;d7=c[b+5840>>2]|0;d8=c[b+5848>>2]|0;d9=c[b+5856>>2]|0;ea=c[b+5864>>2]|0;eb=c[b+5872>>2]|0;ec=c[b+5880>>2]|0;ed=c[b+5888>>2]|0;ee=c[b+5896>>2]|0;ef=c[b+5904>>2]|0;eg=c[b+5912>>2]|0;eh=c[b+5920>>2]|0;ei=c[b+5928>>2]|0;ej=c[b+5936>>2]|0;ek=c[b+5944>>2]|0;el=c[b+5952>>2]|0;em=c[b+5960>>2]|0;en=c[b+5968>>2]|0;eo=c[b+5976>>2]|0;ep=c[b+5984>>2]|0;eq=c[b+5992>>2]|0;er=c[b+6e3>>2]|0;es=c[b+6008>>2]|0;et=c[b+6016>>2]|0;eu=c[b+6024>>2]|0;ev=c[b+6032>>2]|0;ew=c[b+6040>>2]|0;ex=c[b+6048>>2]|0;ey=c[b+6056>>2]|0;ez=c[b+6064>>2]|0;eA=c[b+6072>>2]|0;eB=c[b+6080>>2]|0;eC=c[b+6088>>2]|0;eD=c[b+6096>>2]|0;eE=c[b+6104>>2]|0;eF=c[b+6112>>2]|0;eG=c[b+6120>>2]|0;eH=c[b+6128>>2]|0;eI=c[b+6136>>2]|0;eJ=c[b+6144>>2]|0;eK=c[b+6152>>2]|0;eL=c[b+6160>>2]|0;eM=c[b+6168>>2]|0;eN=c[b+6176>>2]|0;eO=c[b+6184>>2]|0;eP=c[b+6192>>2]|0;eQ=c[b+6200>>2]|0;eR=c[b+6208>>2]|0;eS=c[b+6216>>2]|0;eT=c[b+6224>>2]|0;eU=c[b+6232>>2]|0;eV=c[b+6240>>2]|0;eW=c[b+6248>>2]|0;eX=c[b+6256>>2]|0;eY=c[b+6264>>2]|0;eZ=c[b+6272>>2]|0;e_=c[b+6280>>2]|0;e$=c[b+6288>>2]|0;e0=c[b+6296>>2]|0;e1=c[b+6304>>2]|0;e2=c[b+6312>>2]|0;e3=c[b+6320>>2]|0;e4=c[b+6328>>2]|0;e5=c[b+6336>>2]|0;e6=c[b+6344>>2]|0;e7=c[b+6352>>2]|0;e8=c[b+6360>>2]|0;e9=c[b+6368>>2]|0;fa=c[b+6376>>2]|0;fb=c[b+6384>>2]|0;fc=c[b+6392>>2]|0;fd=c[b+6400>>2]|0;fe=c[b+6408>>2]|0;ff=c[b+6416>>2]|0;fg=c[b+6424>>2]|0;fh=c[b+6432>>2]|0;fi=c[b+6440>>2]|0;fj=c[b+6448>>2]|0;fk=c[b+6456>>2]|0;fl=c[b+6464>>2]|0;fm=c[b+6472>>2]|0;fn=c[b+6480>>2]|0;fo=c[b+6488>>2]|0;fp=c[b+6496>>2]|0;fq=c[b+6504>>2]|0;fr=c[b+6512>>2]|0;fs=c[b+6520>>2]|0;ft=c[b+6528>>2]|0;fu=c[b+6536>>2]|0;fv=c[b+6544>>2]|0;fw=c[b+6552>>2]|0;fx=c[b+6560>>2]|0;fy=c[b+6568>>2]|0;fz=c[b+6576>>2]|0;fA=c[b+6584>>2]|0;fB=c[b+6592>>2]|0;fC=c[b+6600>>2]|0;fD=c[b+6608>>2]|0;fE=c[b+6616>>2]|0;fF=c[b+6624>>2]|0;fG=c[b+6632>>2]|0;fH=c[b+6640>>2]|0;fI=c[b+6648>>2]|0;fJ=c[b+6656>>2]|0;fK=c[b+6664>>2]|0;fL=c[b+6672>>2]|0;fM=c[b+6680>>2]|0;fN=c[b+6688>>2]|0;fO=c[b+6696>>2]|0;fP=c[b+6704>>2]|0;fQ=c[b+6712>>2]|0;fR=c[b+6720>>2]|0;fS=c[b+6728>>2]|0;fT=c[b+6736>>2]|0;fU=c[b+6744>>2]|0;fV=c[b+6752>>2]|0;fW=c[b+6760>>2]|0;fX=c[b+6768>>2]|0;fY=c[b+6776>>2]|0;fZ=c[b+6784>>2]|0;f_=c[b+6792>>2]|0;f$=c[b+6800>>2]|0;f0=c[b+6808>>2]|0;f1=c[b+6816>>2]|0;f2=c[b+6824>>2]|0;f3=c[b+6832>>2]|0;f4=c[b+6840>>2]|0;f5=c[b+6848>>2]|0;f6=c[b+6856>>2]|0;f7=c[b+6864>>2]|0;f8=c[b+6872>>2]|0;f9=c[b+6904>>2]|0;ga=c[b+6912>>2]|0;gb=c[b+7064>>2]|0;gc=c[b+39768>>2]|0;gd=c[b+39776>>2]|0;OL:do{L3199:do{if((c[(d+116|0)>>2]|0)>0){ge=(b+1680|0)+84|0;gf=0;L3201:while(1){c[k>>2]=gf;gg=kc(ge,k)|0;a[l]=8;C=1701667182;a[l+1|0]=C;C=C>>8;a[(l+1|0)+1|0]=C;C=C>>8;a[(l+1|0)+2|0]=C;C=C>>8;a[(l+1|0)+3|0]=C;a[l+5|0]=0;gh=kp(gg,b+1064|0,l)|0;gi=c[gh>>2]|0;if((gi|0)==0){gj=tu(40)|0;do{if((gj+16|0|0)!=0){if((a[l]&1)==0){c[(gj+16|0)>>2]=c[l>>2];c[(gj+16|0)+4>>2]=c[l+4>>2];c[(gj+16|0)+8>>2]=c[l+8>>2];break}gk=c[(l+8|0)>>2]|0;gl=c[(l+4|0)>>2]|0;if(gl>>>0>4294967279>>>0){gc=2981;break L3201}if(gl>>>0<11>>>0){a[gj+16|0]=gl<<1;gm=gj+17|0}else{gn=tu(gl+16&-16)|0;c[gj+24>>2]=gn;c[(gj+16|0)>>2]=gl+16&-16|1;c[gj+20>>2]=gl;gm=gn}tH(gm|0,gk|0,gl)|0;a[gm+gl|0]=0}}while(0);if((gj+28|0|0)!=0){tI(gj+28|0|0,0,12)|0}gl=c[(b+1064|0)>>2]|0;c[gj>>2]=0;c[gj+4>>2]=0;c[gj+8>>2]=gl;c[gh>>2]=gj;gl=c[c[(gg|0)>>2]>>2]|0;if((gl|0)==0){go=gj}else{c[(gg|0)>>2]=gl;go=c[gh>>2]|0}jV(c[gg+4>>2]|0,go);c[(gg+8|0)>>2]=(c[(gg+8|0)>>2]|0)+1;gp=gj}else{gp=gi}gl=gp+28|0;if((a[gl]&1)==0){c[j>>2]=c[gl>>2];c[j+4>>2]=c[gl+4>>2];c[j+8>>2]=c[gl+8>>2]}else{gl=c[gp+36>>2]|0;gk=c[gp+32>>2]|0;if(gk>>>0>4294967279>>>0){gc=3e3;break}if(gk>>>0<11>>>0){a[j]=gk<<1;gq=j+1|0}else{gn=tu(gk+16&-16)|0;c[(j+8|0)>>2]=gn;c[(j|0)>>2]=gk+16&-16|1;c[(j+4|0)>>2]=gk;gq=gn}tH(gq|0,gl|0,gk)|0;a[gq+gk|0]=0}gk=(c[(d+4|0)>>2]|0)+(gf*60|0)+4|0;if((gk|0)==0){hC(19,0,49832,(gd=i,i=i+1|0,i=i+7&-8,c[gd>>2]=0,gd)|0);i=gd}else{c[gk>>2]=cj(((a[j]&1)==0?j+1|0:c[(j+8|0)>>2]|0)|0)|0}if((a[j]&1)!=0){tw(c[(j+8|0)>>2]|0)}if((a[l]&1)!=0){tw(c[(l+8|0)>>2]|0)}c[n>>2]=gf;gk=kc(ge,n)|0;gl=tu(16)|0;c[(o+8|0)>>2]=gl;c[(o|0)>>2]=17;c[(o+4|0)>>2]=14;tH(gl|0,30344,14)|0;a[gl+14|0]=0;gl=kp(gk,b+1056|0,o)|0;gn=c[gl>>2]|0;if((gn|0)==0){gr=tu(40)|0;do{if((gr+16|0|0)!=0){if((a[o]&1)==0){c[(gr+16|0)>>2]=c[o>>2];c[(gr+16|0)+4>>2]=c[o+4>>2];c[(gr+16|0)+8>>2]=c[o+8>>2];break}gs=c[(o+8|0)>>2]|0;gt=c[(o+4|0)>>2]|0;if(gt>>>0>4294967279>>>0){gc=3022;break L3201}if(gt>>>0<11>>>0){a[gr+16|0]=gt<<1;gu=gr+17|0}else{gv=tu(gt+16&-16)|0;c[gr+24>>2]=gv;c[(gr+16|0)>>2]=gt+16&-16|1;c[gr+20>>2]=gt;gu=gv}tH(gu|0,gs|0,gt)|0;a[gu+gt|0]=0}}while(0);if((gr+28|0|0)!=0){tI(gr+28|0|0,0,12)|0}gi=c[(b+1056|0)>>2]|0;c[gr>>2]=0;c[gr+4>>2]=0;c[gr+8>>2]=gi;c[gl>>2]=gr;gi=c[c[(gk|0)>>2]>>2]|0;if((gi|0)==0){gw=gr}else{c[(gk|0)>>2]=gi;gw=c[gl>>2]|0}jV(c[gk+4>>2]|0,gw);c[(gk+8|0)>>2]=(c[(gk+8|0)>>2]|0)+1;gx=gr}else{gx=gn}gi=gx+28|0;if((a[gi]&1)==0){c[m>>2]=c[gi>>2];c[m+4>>2]=c[gi+4>>2];c[m+8>>2]=c[gi+8>>2]}else{gi=c[gx+36>>2]|0;gj=c[gx+32>>2]|0;if(gj>>>0>4294967279>>>0){gc=3041;break}if(gj>>>0<11>>>0){a[m]=gj<<1;gy=m+1|0}else{gg=tu(gj+16&-16)|0;c[(m+8|0)>>2]=gg;c[(m|0)>>2]=gj+16&-16|1;c[(m+4|0)>>2]=gj;gy=gg}tH(gy|0,gi|0,gj)|0;a[gy+gj|0]=0}kd(m,(c[(d+4|0)>>2]|0)+(gf*60|0)|0);if((a[m]&1)!=0){tw(c[(m+8|0)>>2]|0)}if((a[o]&1)!=0){tw(c[(o+8|0)>>2]|0)}c[q>>2]=gf;gj=kc(ge,q)|0;gi=tu(16)|0;c[(r+8|0)>>2]=gi;c[(r|0)>>2]=17;c[(r+4|0)>>2]=11;tH(gi|0,3e4,11)|0;a[gi+11|0]=0;gi=kp(gj,b+1048|0,r)|0;gg=c[gi>>2]|0;if((gg|0)==0){gh=tu(40)|0;do{if((gh+16|0|0)!=0){if((a[r]&1)==0){c[(gh+16|0)>>2]=c[r>>2];c[(gh+16|0)+4>>2]=c[r+4>>2];c[(gh+16|0)+8>>2]=c[r+8>>2];break}gt=c[(r+8|0)>>2]|0;gs=c[(r+4|0)>>2]|0;if(gs>>>0>4294967279>>>0){gc=3060;break L3201}if(gs>>>0<11>>>0){a[gh+16|0]=gs<<1;gz=gh+17|0}else{gv=tu(gs+16&-16)|0;c[gh+24>>2]=gv;c[(gh+16|0)>>2]=gs+16&-16|1;c[gh+20>>2]=gs;gz=gv}tH(gz|0,gt|0,gs)|0;a[gz+gs|0]=0}}while(0);if((gh+28|0|0)!=0){tI(gh+28|0|0,0,12)|0}gn=c[(b+1048|0)>>2]|0;c[gh>>2]=0;c[gh+4>>2]=0;c[gh+8>>2]=gn;c[gi>>2]=gh;gn=c[c[(gj|0)>>2]>>2]|0;if((gn|0)==0){gA=gh}else{c[(gj|0)>>2]=gn;gA=c[gi>>2]|0}jV(c[gj+4>>2]|0,gA);c[(gj+8|0)>>2]=(c[(gj+8|0)>>2]|0)+1;gB=gh}else{gB=gg}gn=gB+28|0;if((a[gn]&1)==0){c[p>>2]=c[gn>>2];c[p+4>>2]=c[gn+4>>2];c[p+8>>2]=c[gn+8>>2]}else{gn=c[gB+36>>2]|0;gr=c[gB+32>>2]|0;if(gr>>>0>4294967279>>>0){gc=3079;break}if(gr>>>0<11>>>0){a[p]=gr<<1;gC=p+1|0}else{gk=tu(gr+16&-16)|0;c[(p+8|0)>>2]=gk;c[(p|0)>>2]=gr+16&-16|1;c[(p+4|0)>>2]=gr;gC=gk}tH(gC|0,gn|0,gr)|0;a[gC+gr|0]=0}gr=(c[(d+4|0)>>2]|0)+(gf*60|0)+8|0;if((gr|0)==0){hC(19,0,49832,(gd=i,i=i+1|0,i=i+7&-8,c[gd>>2]=0,gd)|0);i=gd}else{c[gr>>2]=cj(((a[p]&1)==0?p+1|0:c[(p+8|0)>>2]|0)|0)|0}if((a[p]&1)!=0){tw(c[(p+8|0)>>2]|0)}if((a[r]&1)!=0){tw(c[(r+8|0)>>2]|0)}c[t>>2]=gf;gr=kc(ge,t)|0;a[u]=16;C=1701603686;a[u+1|0|0]=C;C=C>>8;a[(u+1|0|0)+1|0]=C;C=C>>8;a[(u+1|0|0)+2|0]=C;C=C>>8;a[(u+1|0|0)+3|0]=C;C=1701667150;a[(u+1|0)+4|0]=C;C=C>>8;a[((u+1|0)+4|0)+1|0]=C;C=C>>8;a[((u+1|0)+4|0)+2|0]=C;C=C>>8;a[((u+1|0)+4|0)+3|0]=C;a[u+9|0]=0;gn=kp(gr,b+1040|0,u)|0;gk=c[gn>>2]|0;if((gk|0)==0){gl=tu(40)|0;do{if((gl+16|0|0)!=0){if((a[u]&1)==0){c[(gl+16|0)>>2]=c[u>>2];c[(gl+16|0)+4>>2]=c[u+4>>2];c[(gl+16|0)+8>>2]=c[u+8>>2];break}gs=c[(u+8|0)>>2]|0;gt=c[(u+4|0)>>2]|0;if(gt>>>0>4294967279>>>0){gc=3100;break L3201}if(gt>>>0<11>>>0){a[gl+16|0]=gt<<1;gD=gl+17|0}else{gv=tu(gt+16&-16)|0;c[gl+24>>2]=gv;c[(gl+16|0)>>2]=gt+16&-16|1;c[gl+20>>2]=gt;gD=gv}tH(gD|0,gs|0,gt)|0;a[gD+gt|0]=0}}while(0);if((gl+28|0|0)!=0){tI(gl+28|0|0,0,12)|0}gg=c[(b+1040|0)>>2]|0;c[gl>>2]=0;c[gl+4>>2]=0;c[gl+8>>2]=gg;c[gn>>2]=gl;gg=c[c[(gr|0)>>2]>>2]|0;if((gg|0)==0){gE=gl}else{c[(gr|0)>>2]=gg;gE=c[gn>>2]|0}jV(c[gr+4>>2]|0,gE);c[(gr+8|0)>>2]=(c[(gr+8|0)>>2]|0)+1;gF=gl}else{gF=gk}gg=gF+28|0;if((a[gg]&1)==0){c[s>>2]=c[gg>>2];c[s+4>>2]=c[gg+4>>2];c[s+8>>2]=c[gg+8>>2]}else{gg=c[gF+36>>2]|0;gh=c[gF+32>>2]|0;if(gh>>>0>4294967279>>>0){gc=3119;break}if(gh>>>0<11>>>0){a[s]=gh<<1;gG=s+1|0}else{gj=tu(gh+16&-16)|0;c[(s+8|0)>>2]=gj;c[(s|0)>>2]=gh+16&-16|1;c[(s+4|0)>>2]=gh;gG=gj}tH(gG|0,gg|0,gh)|0;a[gG+gh|0]=0}gh=(c[(d+4|0)>>2]|0)+(gf*60|0)+12|0;if((gh|0)==0){hC(19,0,49832,(gd=i,i=i+1|0,i=i+7&-8,c[gd>>2]=0,gd)|0);i=gd}else{c[gh>>2]=cj(((a[s]&1)==0?s+1|0:c[(s+8|0)>>2]|0)|0)|0}if((a[s]&1)!=0){tw(c[(s+8|0)>>2]|0)}if((a[u]&1)!=0){tw(c[(u+8|0)>>2]|0)}c[w>>2]=gf;gh=kc(ge,w)|0;a[x]=18;tH(x+1|0|0,28704,9)|0;a[x+10|0]=0;gg=kp(gh,b+1032|0,x)|0;gj=c[gg>>2]|0;if((gj|0)==0){gi=tu(40)|0;do{if((gi+16|0|0)!=0){if((a[x]&1)==0){c[(gi+16|0)>>2]=c[x>>2];c[(gi+16|0)+4>>2]=c[x+4>>2];c[(gi+16|0)+8>>2]=c[x+8>>2];break}gt=c[(x+8|0)>>2]|0;gs=c[(x+4|0)>>2]|0;if(gs>>>0>4294967279>>>0){gc=3140;break L3201}if(gs>>>0<11>>>0){a[gi+16|0]=gs<<1;gH=gi+17|0}else{gv=tu(gs+16&-16)|0;c[gi+24>>2]=gv;c[(gi+16|0)>>2]=gs+16&-16|1;c[gi+20>>2]=gs;gH=gv}tH(gH|0,gt|0,gs)|0;a[gH+gs|0]=0}}while(0);if((gi+28|0|0)!=0){tI(gi+28|0|0,0,12)|0}gk=c[(b+1032|0)>>2]|0;c[gi>>2]=0;c[gi+4>>2]=0;c[gi+8>>2]=gk;c[gg>>2]=gi;gk=c[c[(gh|0)>>2]>>2]|0;if((gk|0)==0){gI=gi}else{c[(gh|0)>>2]=gk;gI=c[gg>>2]|0}jV(c[gh+4>>2]|0,gI);c[(gh+8|0)>>2]=(c[(gh+8|0)>>2]|0)+1;gJ=gi}else{gJ=gj}gk=gJ+28|0;if((a[gk]&1)==0){c[v>>2]=c[gk>>2];c[v+4>>2]=c[gk+4>>2];c[v+8>>2]=c[gk+8>>2]}else{gk=c[gJ+36>>2]|0;gl=c[gJ+32>>2]|0;if(gl>>>0>4294967279>>>0){gc=3159;break}if(gl>>>0<11>>>0){a[v]=gl<<1;gK=v+1|0}else{gr=tu(gl+16&-16)|0;c[(v+8|0)>>2]=gr;c[(v|0)>>2]=gl+16&-16|1;c[(v+4|0)>>2]=gl;gK=gr}tH(gK|0,gk|0,gl)|0;a[gK+gl|0]=0}kb(v,(c[(d+4|0)>>2]|0)+(gf*60|0)+16|0,0);if((a[v]&1)!=0){tw(c[(v+8|0)>>2]|0)}if((a[x]&1)!=0){tw(c[(x+8|0)>>2]|0)}c[z>>2]=gf;gl=kc(ge,z)|0;gk=tu(16)|0;c[(A+8|0)>>2]=gk;c[(A|0)>>2]=17;c[(A+4|0)>>2]=11;tH(gk|0,28120,11)|0;a[gk+11|0]=0;gk=kp(gl,b+1024|0,A)|0;gr=c[gk>>2]|0;if((gr|0)==0){gn=tu(40)|0;do{if((gn+16|0|0)!=0){if((a[A]&1)==0){c[(gn+16|0)>>2]=c[A>>2];c[(gn+16|0)+4>>2]=c[A+4>>2];c[(gn+16|0)+8>>2]=c[A+8>>2];break}gs=c[(A+8|0)>>2]|0;gt=c[(A+4|0)>>2]|0;if(gt>>>0>4294967279>>>0){gc=3178;break L3201}if(gt>>>0<11>>>0){a[gn+16|0]=gt<<1;gL=gn+17|0}else{gv=tu(gt+16&-16)|0;c[gn+24>>2]=gv;c[(gn+16|0)>>2]=gt+16&-16|1;c[gn+20>>2]=gt;gL=gv}tH(gL|0,gs|0,gt)|0;a[gL+gt|0]=0}}while(0);if((gn+28|0|0)!=0){tI(gn+28|0|0,0,12)|0}gj=c[(b+1024|0)>>2]|0;c[gn>>2]=0;c[gn+4>>2]=0;c[gn+8>>2]=gj;c[gk>>2]=gn;gj=c[c[(gl|0)>>2]>>2]|0;if((gj|0)==0){gM=gn}else{c[(gl|0)>>2]=gj;gM=c[gk>>2]|0}jV(c[gl+4>>2]|0,gM);c[(gl+8|0)>>2]=(c[(gl+8|0)>>2]|0)+1;gN=gn}else{gN=gr}gj=gN+28|0;if((a[gj]&1)==0){c[y>>2]=c[gj>>2];c[y+4>>2]=c[gj+4>>2];c[y+8>>2]=c[gj+8>>2]}else{gj=c[gN+36>>2]|0;gi=c[gN+32>>2]|0;if(gi>>>0>4294967279>>>0){gc=3197;break}if(gi>>>0<11>>>0){a[y]=gi<<1;gO=y+1|0}else{gh=tu(gi+16&-16)|0;c[(y+8|0)>>2]=gh;c[(y|0)>>2]=gi+16&-16|1;c[(y+4|0)>>2]=gi;gO=gh}tH(gO|0,gj|0,gi)|0;a[gO+gi|0]=0}kb(y,(c[(d+4|0)>>2]|0)+(gf*60|0)+20|0,0);if((a[y]&1)!=0){tw(c[(y+8|0)>>2]|0)}if((a[A]&1)!=0){tw(c[(A+8|0)>>2]|0)}c[E>>2]=gf;gi=kc(ge,E)|0;a[F]=14;a[F+1|0]=a[27080]|0;a[(F+1|0)+1|0]=a[27081]|0;a[(F+1|0)+2|0]=a[27082]|0;a[(F+1|0)+3|0]=a[27083]|0;a[(F+1|0)+4|0]=a[27084]|0;a[(F+1|0)+5|0]=a[27085]|0;a[(F+1|0)+6|0]=a[27086]|0;a[F+8|0]=0;gj=kp(gi,b+1016|0,F)|0;gh=c[gj>>2]|0;if((gh|0)==0){gg=tu(40)|0;do{if((gg+16|0|0)!=0){if((a[F]&1)==0){c[(gg+16|0)>>2]=c[F>>2];c[(gg+16|0)+4>>2]=c[F+4>>2];c[(gg+16|0)+8>>2]=c[F+8>>2];break}gt=c[(F+8|0)>>2]|0;gs=c[(F+4|0)>>2]|0;if(gs>>>0>4294967279>>>0){gc=3215;break L3201}if(gs>>>0<11>>>0){a[gg+16|0]=gs<<1;gP=gg+17|0}else{gv=tu(gs+16&-16)|0;c[gg+24>>2]=gv;c[(gg+16|0)>>2]=gs+16&-16|1;c[gg+20>>2]=gs;gP=gv}tH(gP|0,gt|0,gs)|0;a[gP+gs|0]=0}}while(0);if((gg+28|0|0)!=0){tI(gg+28|0|0,0,12)|0}gr=c[(b+1016|0)>>2]|0;c[gg>>2]=0;c[gg+4>>2]=0;c[gg+8>>2]=gr;c[gj>>2]=gg;gr=c[c[(gi|0)>>2]>>2]|0;if((gr|0)==0){gQ=gg}else{c[(gi|0)>>2]=gr;gQ=c[gj>>2]|0}jV(c[gi+4>>2]|0,gQ);c[(gi+8|0)>>2]=(c[(gi+8|0)>>2]|0)+1;gR=gg}else{gR=gh}gr=gR+28|0;if((a[gr]&1)==0){c[D>>2]=c[gr>>2];c[D+4>>2]=c[gr+4>>2];c[D+8>>2]=c[gr+8>>2]}else{gr=c[gR+36>>2]|0;gn=c[gR+32>>2]|0;if(gn>>>0>4294967279>>>0){gc=3234;break}if(gn>>>0<11>>>0){a[D]=gn<<1;gS=D+1|0}else{gl=tu(gn+16&-16)|0;c[(D+8|0)>>2]=gl;c[(D|0)>>2]=gn+16&-16|1;c[(D+4|0)>>2]=gn;gS=gl}tH(gS|0,gr|0,gn)|0;a[gS+gn|0]=0}kb(D,(c[(d+4|0)>>2]|0)+(gf*60|0)+24|0,0);if((a[D]&1)!=0){tw(c[(D+8|0)>>2]|0)}if((a[F]&1)!=0){tw(c[(F+8|0)>>2]|0)}c[H>>2]=gf;gn=kc(ge,H)|0;a[K]=18;tH(K+1|0|0,26600,9)|0;a[K+10|0]=0;gr=kp(gn,b+1008|0,K)|0;gl=c[gr>>2]|0;if((gl|0)==0){gk=tu(40)|0;do{if((gk+16|0|0)!=0){if((a[K]&1)==0){c[(gk+16|0)>>2]=c[K>>2];c[(gk+16|0)+4>>2]=c[K+4>>2];c[(gk+16|0)+8>>2]=c[K+8>>2];break}gs=c[(K+8|0)>>2]|0;gt=c[(K+4|0)>>2]|0;if(gt>>>0>4294967279>>>0){gc=3252;break L3201}if(gt>>>0<11>>>0){a[gk+16|0]=gt<<1;gT=gk+17|0}else{gv=tu(gt+16&-16)|0;c[gk+24>>2]=gv;c[(gk+16|0)>>2]=gt+16&-16|1;c[gk+20>>2]=gt;gT=gv}tH(gT|0,gs|0,gt)|0;a[gT+gt|0]=0}}while(0);if((gk+28|0|0)!=0){tI(gk+28|0|0,0,12)|0}gh=c[(b+1008|0)>>2]|0;c[gk>>2]=0;c[gk+4>>2]=0;c[gk+8>>2]=gh;c[gr>>2]=gk;gh=c[c[(gn|0)>>2]>>2]|0;if((gh|0)==0){gU=gk}else{c[(gn|0)>>2]=gh;gU=c[gr>>2]|0}jV(c[gn+4>>2]|0,gU);c[(gn+8|0)>>2]=(c[(gn+8|0)>>2]|0)+1;gV=gk}else{gV=gl}gh=gV+28|0;if((a[gh]&1)==0){c[G>>2]=c[gh>>2];c[G+4>>2]=c[gh+4>>2];c[G+8>>2]=c[gh+8>>2]}else{gh=c[gV+36>>2]|0;gg=c[gV+32>>2]|0;if(gg>>>0>4294967279>>>0){gc=3271;break}if(gg>>>0<11>>>0){a[G]=gg<<1;gW=G+1|0}else{gi=tu(gg+16&-16)|0;c[(G+8|0)>>2]=gi;c[(G|0)>>2]=gg+16&-16|1;c[(G+4|0)>>2]=gg;gW=gi}tH(gW|0,gh|0,gg)|0;a[gW+gg|0]=0}kb(G,(c[(d+4|0)>>2]|0)+(gf*60|0)+28|0,0);if((a[G]&1)!=0){tw(c[(G+8|0)>>2]|0)}if((a[K]&1)!=0){tw(c[(K+8|0)>>2]|0)}c[M>>2]=gf;gg=kc(ge,M)|0;gh=tu(16)|0;c[(N+8|0)>>2]=gh;c[(N|0)>>2]=17;c[(N+4|0)>>2]=12;tH(gh|0,25696,12)|0;a[gh+12|0]=0;gh=kp(gg,b+1e3|0,N)|0;gi=c[gh>>2]|0;if((gi|0)==0){gj=tu(40)|0;do{if((gj+16|0|0)!=0){if((a[N]&1)==0){c[(gj+16|0)>>2]=c[N>>2];c[(gj+16|0)+4>>2]=c[N+4>>2];c[(gj+16|0)+8>>2]=c[N+8>>2];break}gt=c[(N+8|0)>>2]|0;gs=c[(N+4|0)>>2]|0;if(gs>>>0>4294967279>>>0){gc=3290;break L3201}if(gs>>>0<11>>>0){a[gj+16|0]=gs<<1;gX=gj+17|0}else{gv=tu(gs+16&-16)|0;c[gj+24>>2]=gv;c[(gj+16|0)>>2]=gs+16&-16|1;c[gj+20>>2]=gs;gX=gv}tH(gX|0,gt|0,gs)|0;a[gX+gs|0]=0}}while(0);if((gj+28|0|0)!=0){tI(gj+28|0|0,0,12)|0}gl=c[(b+1e3|0)>>2]|0;c[gj>>2]=0;c[gj+4>>2]=0;c[gj+8>>2]=gl;c[gh>>2]=gj;gl=c[c[(gg|0)>>2]>>2]|0;if((gl|0)==0){gY=gj}else{c[(gg|0)>>2]=gl;gY=c[gh>>2]|0}jV(c[gg+4>>2]|0,gY);c[(gg+8|0)>>2]=(c[(gg+8|0)>>2]|0)+1;gZ=gj}else{gZ=gi}gl=gZ+28|0;if((a[gl]&1)==0){c[L>>2]=c[gl>>2];c[L+4>>2]=c[gl+4>>2];c[L+8>>2]=c[gl+8>>2]}else{gl=c[gZ+36>>2]|0;gk=c[gZ+32>>2]|0;if(gk>>>0>4294967279>>>0){gc=3309;break}if(gk>>>0<11>>>0){a[L]=gk<<1;g_=L+1|0}else{gn=tu(gk+16&-16)|0;c[(L+8|0)>>2]=gn;c[(L|0)>>2]=gk+16&-16|1;c[(L+4|0)>>2]=gk;g_=gn}tH(g_|0,gl|0,gk)|0;a[g_+gk|0]=0}kb(L,(c[(d+4|0)>>2]|0)+(gf*60|0)+32|0,0);if((a[L]&1)!=0){tw(c[(L+8|0)>>2]|0)}if((a[N]&1)!=0){tw(c[(N+8|0)>>2]|0)}c[P>>2]=gf;gk=kc(ge,P)|0;a[Q]=16;C=1399157621;a[Q+1|0|0]=C;C=C>>8;a[(Q+1|0|0)+1|0]=C;C=C>>8;a[(Q+1|0|0)+2|0]=C;C=C>>8;a[(Q+1|0|0)+3|0]=C;C=1953653108;a[(Q+1|0)+4|0]=C;C=C>>8;a[((Q+1|0)+4|0)+1|0]=C;C=C>>8;a[((Q+1|0)+4|0)+2|0]=C;C=C>>8;a[((Q+1|0)+4|0)+3|0]=C;a[Q+9|0]=0;gl=kp(gk,b+992|0,Q)|0;gn=c[gl>>2]|0;if((gn|0)==0){gr=tu(40)|0;do{if((gr+16|0|0)!=0){if((a[Q]&1)==0){c[(gr+16|0)>>2]=c[Q>>2];c[(gr+16|0)+4>>2]=c[Q+4>>2];c[(gr+16|0)+8>>2]=c[Q+8>>2];break}gs=c[(Q+8|0)>>2]|0;gt=c[(Q+4|0)>>2]|0;if(gt>>>0>4294967279>>>0){gc=3327;break L3201}if(gt>>>0<11>>>0){a[gr+16|0]=gt<<1;g$=gr+17|0}else{gv=tu(gt+16&-16)|0;c[gr+24>>2]=gv;c[(gr+16|0)>>2]=gt+16&-16|1;c[gr+20>>2]=gt;g$=gv}tH(g$|0,gs|0,gt)|0;a[g$+gt|0]=0}}while(0);if((gr+28|0|0)!=0){tI(gr+28|0|0,0,12)|0}gi=c[(b+992|0)>>2]|0;c[gr>>2]=0;c[gr+4>>2]=0;c[gr+8>>2]=gi;c[gl>>2]=gr;gi=c[c[(gk|0)>>2]>>2]|0;if((gi|0)==0){g0=gr}else{c[(gk|0)>>2]=gi;g0=c[gl>>2]|0}jV(c[gk+4>>2]|0,g0);c[(gk+8|0)>>2]=(c[(gk+8|0)>>2]|0)+1;g1=gr}else{g1=gn}gi=g1+28|0;if((a[gi]&1)==0){c[O>>2]=c[gi>>2];c[O+4>>2]=c[gi+4>>2];c[O+8>>2]=c[gi+8>>2];g2=a[O]|0}else{gi=c[g1+36>>2]|0;gj=c[g1+32>>2]|0;if(gj>>>0>4294967279>>>0){gc=3346;break}if(gj>>>0<11>>>0){a[O]=gj<<1&255;g3=O+1|0;g4=gj<<1&255}else{gg=tu(gj+16&-16)|0;c[(O+8|0)>>2]=gg;c[(O|0)>>2]=gj+16&-16|1;c[(O+4|0)>>2]=gj;g3=gg;g4=(gj+16&-16|1)&255}tH(g3|0,gi|0,gj)|0;a[g3+gj|0]=0;g2=g4}gj=(c[(d+4|0)>>2]|0)+(gf*60|0)+49|0;gi=g2&255;gg=(gi&1|0)==0?gi>>>1:c[(O+4|0)>>2]|0;gi=(g2&1)==0;gh=c[(O+8|0)>>2]|0;gt=tK((gi?O+1|0:gh)|0,42e3,(gg>>>0>4>>>0?4:gg)|0)|0;if((gt|0)==0){g5=gg>>>0<4>>>0?-1:gg>>>0>4>>>0&1}else{g5=gt}a[gj]=(g5|0)==0|0;if(!gi){tw(gh)}if((a[Q]&1)!=0){tw(c[(Q+8|0)>>2]|0)}c[S>>2]=gf;gh=kc(ge,S)|0;a[T]=10;a[T+1|0]=a[39368]|0;a[(T+1|0)+1|0]=a[39369]|0;a[(T+1|0)+2|0]=a[39370]|0;a[(T+1|0)+3|0]=a[39371]|0;a[(T+1|0)+4|0]=a[39372]|0;a[T+6|0]=0;gi=kp(gh,b+984|0,T)|0;gj=c[gi>>2]|0;if((gj|0)==0){gt=tu(40)|0;do{if((gt+16|0|0)!=0){if((a[T]&1)==0){c[(gt+16|0)>>2]=c[T>>2];c[(gt+16|0)+4>>2]=c[T+4>>2];c[(gt+16|0)+8>>2]=c[T+8>>2];break}gg=c[(T+8|0)>>2]|0;gs=c[(T+4|0)>>2]|0;if(gs>>>0>4294967279>>>0){gc=3366;break L3201}if(gs>>>0<11>>>0){a[gt+16|0]=gs<<1;g6=gt+17|0}else{gv=tu(gs+16&-16)|0;c[gt+24>>2]=gv;c[(gt+16|0)>>2]=gs+16&-16|1;c[gt+20>>2]=gs;g6=gv}tH(g6|0,gg|0,gs)|0;a[g6+gs|0]=0}}while(0);if((gt+28|0|0)!=0){tI(gt+28|0|0,0,12)|0}gn=c[(b+984|0)>>2]|0;c[gt>>2]=0;c[gt+4>>2]=0;c[gt+8>>2]=gn;c[gi>>2]=gt;gn=c[c[(gh|0)>>2]>>2]|0;if((gn|0)==0){g7=gt}else{c[(gh|0)>>2]=gn;g7=c[gi>>2]|0}jV(c[gh+4>>2]|0,g7);c[(gh+8|0)>>2]=(c[(gh+8|0)>>2]|0)+1;g8=gt}else{g8=gj}gn=g8+28|0;if((a[gn]&1)==0){c[R>>2]=c[gn>>2];c[R+4>>2]=c[gn+4>>2];c[R+8>>2]=c[gn+8>>2]}else{gn=c[g8+36>>2]|0;gr=c[g8+32>>2]|0;if(gr>>>0>4294967279>>>0){gc=3385;break}if(gr>>>0<11>>>0){a[R]=gr<<1;g9=R+1|0}else{gk=tu(gr+16&-16)|0;c[(R+8|0)>>2]=gk;c[(R|0)>>2]=gr+16&-16|1;c[(R+4|0)>>2]=gr;g9=gk}tH(g9|0,gn|0,gr)|0;a[g9+gr|0]=0}kb(R,(c[(d+4|0)>>2]|0)+(gf*60|0)+52|0,0);if((a[R]&1)!=0){tw(c[(R+8|0)>>2]|0)}if((a[T]&1)!=0){tw(c[(T+8|0)>>2]|0)}c[V>>2]=gf;gr=kc(ge,V)|0;a[W]=10;a[W+1|0]=a[25288]|0;a[(W+1|0)+1|0]=a[25289]|0;a[(W+1|0)+2|0]=a[25290]|0;a[(W+1|0)+3|0]=a[25291]|0;a[(W+1|0)+4|0]=a[25292]|0;a[W+6|0]=0;gn=kp(gr,b+976|0,W)|0;gk=c[gn>>2]|0;if((gk|0)==0){gl=tu(40)|0;do{if((gl+16|0|0)!=0){if((a[W]&1)==0){c[(gl+16|0)>>2]=c[W>>2];c[(gl+16|0)+4>>2]=c[W+4>>2];c[(gl+16|0)+8>>2]=c[W+8>>2];break}gs=c[(W+8|0)>>2]|0;gg=c[(W+4|0)>>2]|0;if(gg>>>0>4294967279>>>0){gc=3403;break L3201}if(gg>>>0<11>>>0){a[gl+16|0]=gg<<1;ha=gl+17|0}else{gv=tu(gg+16&-16)|0;c[gl+24>>2]=gv;c[(gl+16|0)>>2]=gg+16&-16|1;c[gl+20>>2]=gg;ha=gv}tH(ha|0,gs|0,gg)|0;a[ha+gg|0]=0}}while(0);if((gl+28|0|0)!=0){tI(gl+28|0|0,0,12)|0}gj=c[(b+976|0)>>2]|0;c[gl>>2]=0;c[gl+4>>2]=0;c[gl+8>>2]=gj;c[gn>>2]=gl;gj=c[c[(gr|0)>>2]>>2]|0;if((gj|0)==0){hb=gl}else{c[(gr|0)>>2]=gj;hb=c[gn>>2]|0}jV(c[gr+4>>2]|0,hb);c[(gr+8|0)>>2]=(c[(gr+8|0)>>2]|0)+1;hc=gl}else{hc=gk}gj=hc+28|0;if((a[gj]&1)==0){c[U>>2]=c[gj>>2];c[U+4>>2]=c[gj+4>>2];c[U+8>>2]=c[gj+8>>2];hd=a[U]|0}else{gj=c[hc+36>>2]|0;gt=c[hc+32>>2]|0;if(gt>>>0>4294967279>>>0){gc=3422;break}if(gt>>>0<11>>>0){a[U]=gt<<1&255;he=U+1|0;hf=gt<<1&255}else{gh=tu(gt+16&-16)|0;c[(U+8|0)>>2]=gh;c[(U|0)>>2]=gt+16&-16|1;c[(U+4|0)>>2]=gt;he=gh;hf=(gt+16&-16|1)&255}tH(he|0,gj|0,gt)|0;a[he+gt|0]=0;hd=hf}gt=(c[(d+4|0)>>2]|0)+(gf*60|0)+48|0;gj=hd&255;gh=(gj&1|0)==0?gj>>>1:c[(U+4|0)>>2]|0;gj=(hd&1)==0;gi=c[(U+8|0)>>2]|0;gg=tK((gj?U+1|0:gi)|0,42e3,(gh>>>0>4>>>0?4:gh)|0)|0;if((gg|0)==0){hg=gh>>>0<4>>>0?-1:gh>>>0>4>>>0&1}else{hg=gg}a[gt]=(hg|0)==0|0;if(!gj){tw(gi)}if((a[W]&1)!=0){tw(c[(W+8|0)>>2]|0)}c[Y>>2]=gf;gi=kc(ge,Y)|0;a[Z]=6;a[Z+1|0]=a[24672]|0;a[(Z+1|0)+1|0]=a[24673]|0;a[(Z+1|0)+2|0]=a[24674]|0;a[Z+4|0]=0;gj=kp(gi,b+968|0,Z)|0;gt=c[gj>>2]|0;if((gt|0)==0){gg=tu(40)|0;do{if((gg+16|0|0)!=0){if((a[Z]&1)==0){c[(gg+16|0)>>2]=c[Z>>2];c[(gg+16|0)+4>>2]=c[Z+4>>2];c[(gg+16|0)+8>>2]=c[Z+8>>2];break}gh=c[(Z+8|0)>>2]|0;gs=c[(Z+4|0)>>2]|0;if(gs>>>0>4294967279>>>0){gc=3442;break L3201}if(gs>>>0<11>>>0){a[gg+16|0]=gs<<1;hh=gg+17|0}else{gv=tu(gs+16&-16)|0;c[gg+24>>2]=gv;c[(gg+16|0)>>2]=gs+16&-16|1;c[gg+20>>2]=gs;hh=gv}tH(hh|0,gh|0,gs)|0;a[hh+gs|0]=0}}while(0);if((gg+28|0|0)!=0){tI(gg+28|0|0,0,12)|0}gk=c[(b+968|0)>>2]|0;c[gg>>2]=0;c[gg+4>>2]=0;c[gg+8>>2]=gk;c[gj>>2]=gg;gk=c[c[(gi|0)>>2]>>2]|0;if((gk|0)==0){hi=gg}else{c[(gi|0)>>2]=gk;hi=c[gj>>2]|0}jV(c[gi+4>>2]|0,hi);c[(gi+8|0)>>2]=(c[(gi+8|0)>>2]|0)+1;hj=gg}else{hj=gt}gk=hj+28|0;if((a[gk]&1)==0){c[X>>2]=c[gk>>2];c[X+4>>2]=c[gk+4>>2];c[X+8>>2]=c[gk+8>>2]}else{gk=c[hj+36>>2]|0;gl=c[hj+32>>2]|0;if(gl>>>0>4294967279>>>0){gc=3461;break}if(gl>>>0<11>>>0){a[X]=gl<<1;hk=X+1|0}else{gr=tu(gl+16&-16)|0;c[(X+8|0)>>2]=gr;c[(X|0)>>2]=gl+16&-16|1;c[(X+4|0)>>2]=gl;hk=gr}tH(hk|0,gk|0,gl)|0;a[hk+gl|0]=0}kb(X,(c[(d+4|0)>>2]|0)+(gf*60|0)+40|0,-2147483648);if((a[X]&1)!=0){tw(c[(X+8|0)>>2]|0)}if((a[Z]&1)!=0){tw(c[(Z+8|0)>>2]|0)}c[$>>2]=gf;gl=kc(ge,$)|0;a[aa]=6;a[aa+1|0]=a[24600]|0;a[(aa+1|0)+1|0]=a[24601]|0;a[(aa+1|0)+2|0]=a[24602]|0;a[aa+4|0]=0;gk=kp(gl,b+960|0,aa)|0;gr=c[gk>>2]|0;if((gr|0)==0){gn=tu(40)|0;do{if((gn+16|0|0)!=0){if((a[aa]&1)==0){c[(gn+16|0)>>2]=c[aa>>2];c[(gn+16|0)+4>>2]=c[aa+4>>2];c[(gn+16|0)+8>>2]=c[aa+8>>2];break}gs=c[(aa+8|0)>>2]|0;gh=c[(aa+4|0)>>2]|0;if(gh>>>0>4294967279>>>0){gc=3479;break L3201}if(gh>>>0<11>>>0){a[gn+16|0]=gh<<1;hl=gn+17|0}else{gv=tu(gh+16&-16)|0;c[gn+24>>2]=gv;c[(gn+16|0)>>2]=gh+16&-16|1;c[gn+20>>2]=gh;hl=gv}tH(hl|0,gs|0,gh)|0;a[hl+gh|0]=0}}while(0);if((gn+28|0|0)!=0){tI(gn+28|0|0,0,12)|0}gt=c[(b+960|0)>>2]|0;c[gn>>2]=0;c[gn+4>>2]=0;c[gn+8>>2]=gt;c[gk>>2]=gn;gt=c[c[(gl|0)>>2]>>2]|0;if((gt|0)==0){hm=gn}else{c[(gl|0)>>2]=gt;hm=c[gk>>2]|0}jV(c[gl+4>>2]|0,hm);c[(gl+8|0)>>2]=(c[(gl+8|0)>>2]|0)+1;hn=gn}else{hn=gr}gt=hn+28|0;if((a[gt]&1)==0){c[_>>2]=c[gt>>2];c[_+4>>2]=c[gt+4>>2];c[_+8>>2]=c[gt+8>>2]}else{gt=c[hn+36>>2]|0;gg=c[hn+32>>2]|0;if(gg>>>0>4294967279>>>0){gc=3498;break}if(gg>>>0<11>>>0){a[_]=gg<<1;ho=_+1|0}else{gi=tu(gg+16&-16)|0;c[(_+8|0)>>2]=gi;c[(_|0)>>2]=gg+16&-16|1;c[(_+4|0)>>2]=gg;ho=gi}tH(ho|0,gt|0,gg)|0;a[ho+gg|0]=0}kb(_,(c[(d+4|0)>>2]|0)+(gf*60|0)+44|0,2147483647);if((a[_]&1)!=0){tw(c[(_+8|0)>>2]|0)}if((a[aa]&1)!=0){tw(c[(aa+8|0)>>2]|0)}gg=c[(d+4|0)>>2]|0;gt=(a[gg+(gf*60|0)+49|0]|0)!=0;gi=c[gg+(gf*60|0)+52>>2]|0;gj=(a[gg+(gf*60|0)+48|0]|0)!=0?42e3:42440;gh=c[gg+(gf*60|0)+40>>2]|0;gs=c[gg+(gf*60|0)+44>>2]|0;hA(4,0,22400,(gd=i,i=i+56|0,c[gd>>2]=c[gg+(gf*60|0)+4>>2],c[gd+8>>2]=gt?93904:24160,c[gd+16>>2]=gi,c[gd+24>>2]=gt?93904:24064,c[gd+32>>2]=gj,c[gd+40>>2]=gh,c[gd+48>>2]=gs,gd)|0);i=gd;gs=c[(d+4|0)>>2]|0;gh=c[gs+(gf*60|0)+4>>2]|0;if((a[gh]|0)==36){a[gs+(gf*60|0)+56|0]=1;hp=c[(c[(d+4|0)>>2]|0)+(gf*60|0)+4>>2]|0}else{hp=gh}gh=tD(hp|0)|0;if(gh>>>0>4294967279>>>0){gc=3579;break}if(gh>>>0<11>>>0){a[ab]=gh<<1;hq=ab+1|0}else{gs=tu(gh+16&-16)|0;c[(ab+8|0)>>2]=gs;c[(ab|0)>>2]=gh+16&-16|1;c[(ab+4|0)>>2]=gh;hq=gs}tH(hq|0,hp|0,gh)|0;a[hq+gh|0]=0;c[(ke(f,ab)|0)>>2]=gf;if((a[ab]&1)!=0){tw(c[(ab+8|0)>>2]|0)}gf=gf+1|0;if((gf|0)>=(c[(d+116|0)>>2]|0)){break L3199}}if((gc|0)==2981){ml(0)}else if((gc|0)==3e3){ml(0)}else if((gc|0)==3022){ml(0)}else if((gc|0)==3041){ml(0)}else if((gc|0)==3060){ml(0)}else if((gc|0)==3079){ml(0)}else if((gc|0)==3100){ml(0)}else if((gc|0)==3119){ml(0)}else if((gc|0)==3140){ml(0)}else if((gc|0)==3159){ml(0)}else if((gc|0)==3178){ml(0)}else if((gc|0)==3197){ml(0)}else if((gc|0)==3215){ml(0)}else if((gc|0)==3234){ml(0)}else if((gc|0)==3252){ml(0)}else if((gc|0)==3271){ml(0)}else if((gc|0)==3290){ml(0)}else if((gc|0)==3309){ml(0)}else if((gc|0)==3327){ml(0)}else if((gc|0)==3346){ml(0)}else if((gc|0)==3366){ml(0)}else if((gc|0)==3385){ml(0)}else if((gc|0)==3403){ml(0)}else if((gc|0)==3422){ml(0)}else if((gc|0)==3442){ml(0)}else if((gc|0)==3461){ml(0)}else if((gc|0)==3479){ml(0)}else if((gc|0)==3498){ml(0)}else if((gc|0)==3579){ml(0)}}}while(0);if((c[17800]|0)!=0){dd[c[3504]&511](4)}hA(4,1,22e3,(gd=i,i=i+1|0,i=i+7&-8,c[gd>>2]=0,gd)|0);i=gd;c[b+1904>>2]=d;c[b+1928>>2]=f;c[b+3856>>2]=ac;c[b+3864>>2]=ad;c[b+3872>>2]=ae;c[b+3880>>2]=af;c[b+3888>>2]=ag;c[b+3896>>2]=ah;c[b+3904>>2]=ai;c[b+3912>>2]=aj;c[b+3920>>2]=ak;c[b+3928>>2]=al;c[b+3936>>2]=am;c[b+3944>>2]=an;c[b+3952>>2]=ao;c[b+3960>>2]=ap;c[b+3968>>2]=aq;c[b+3976>>2]=ar;c[b+3984>>2]=as;c[b+3992>>2]=at;c[b+4e3>>2]=au;c[b+4008>>2]=av;c[b+4016>>2]=aw;c[b+4024>>2]=ax;c[b+4032>>2]=ay;c[b+4040>>2]=az;c[b+4048>>2]=aA;c[b+4056>>2]=aB;c[b+4064>>2]=aC;c[b+4072>>2]=aD;c[b+4080>>2]=aE;c[b+4088>>2]=aF;c[b+4096>>2]=aG;c[b+4104>>2]=aH;c[b+4112>>2]=aI;c[b+4120>>2]=aJ;c[b+4128>>2]=aK;c[b+4136>>2]=aL;c[b+4144>>2]=aM;c[b+4152>>2]=aN;c[b+4160>>2]=aO;c[b+4168>>2]=aP;c[b+4176>>2]=aQ;c[b+4184>>2]=aR;c[b+4192>>2]=aS;c[b+4200>>2]=aT;c[b+4208>>2]=aU;c[b+4216>>2]=aV;c[b+4224>>2]=aW;c[b+4232>>2]=aX;c[b+4240>>2]=aY;c[b+4248>>2]=aZ;c[b+4256>>2]=a_;c[b+4264>>2]=a$;c[b+4272>>2]=a0;c[b+4280>>2]=a1;c[b+4288>>2]=a2;c[b+4296>>2]=a3;c[b+4304>>2]=a4;c[b+4312>>2]=a5;c[b+4320>>2]=a6;c[b+4328>>2]=a7;c[b+4336>>2]=a8;c[b+4344>>2]=a9;c[b+4352>>2]=ba;c[b+4360>>2]=bb;c[b+4368>>2]=bc;c[b+4376>>2]=bd;c[b+4384>>2]=be;c[b+4392>>2]=bf;c[b+4400>>2]=bg;c[b+4408>>2]=bh;c[b+4416>>2]=bi;c[b+39768>>2]=gc;c[b+39776>>2]=gd;c[b+39824>>2]=0;c[b+39828>>2]=0;_read_input_xml$4(b);gc=c[b+39768>>2]|0;gd=c[b+39776>>2]|0;L4932:do{if((c[(d+128|0)>>2]|0)>0){gf=(b+1680|0)+60|0;c[b+1904>>2]=d;c[b+1936>>2]=h;c[b+4424>>2]=bj;c[b+4432>>2]=bk;c[b+4440>>2]=bl;c[b+4448>>2]=bm;c[b+4456>>2]=bn;c[b+4464>>2]=bo;c[b+4472>>2]=bp;c[b+4480>>2]=bq;c[b+4488>>2]=br;c[b+4496>>2]=bs;c[b+4504>>2]=bt;c[b+4512>>2]=bu;c[b+4520>>2]=bv;c[b+4528>>2]=bw;c[b+4536>>2]=bx;c[b+4544>>2]=by;c[b+4552>>2]=bz;c[b+4560>>2]=bA;c[b+4568>>2]=bB;c[b+4576>>2]=bC;c[b+4584>>2]=bD;c[b+4592>>2]=bE;c[b+4600>>2]=bF;c[b+4608>>2]=bG;c[b+4616>>2]=bH;c[b+4624>>2]=bI;c[b+4632>>2]=bJ;c[b+4640>>2]=bK;c[b+4648>>2]=bL;c[b+4656>>2]=bM;c[b+4664>>2]=bN;c[b+4672>>2]=bO;c[b+4680>>2]=bP;c[b+4688>>2]=bQ;c[b+4696>>2]=bR;c[b+4704>>2]=bS;c[b+4712>>2]=bT;c[b+4720>>2]=bU;c[b+4728>>2]=bV;c[b+4736>>2]=bW;c[b+4744>>2]=bX;c[b+4752>>2]=bY;c[b+4760>>2]=bZ;c[b+4768>>2]=b_;c[b+4776>>2]=b$;c[b+4784>>2]=b0;c[b+4792>>2]=b1;c[b+4800>>2]=b2;c[b+4808>>2]=b3;c[b+23896>>2]=gf;c[b+39768>>2]=gc;c[b+39776>>2]=gd;c[b+39816>>2]=0;c[b+39820>>2]=0;_read_input_xml$3(b);gc=c[b+39768>>2]|0;gd=c[b+39776>>2]|0;I=c[b+39816>>2]|0;B=c[b+39820>>2]|0;J=+g[b+39820>>2];c[b+39816>>2]=0;c[b+39820>>2]=0;if((I|0)==1){break}if((I|0)==2){switch(B|0){case 2:{break L4932}}}}}while(0);if((c[17800]|0)!=0){dd[c[3504]&511](4)}hA(4,1,59040,(gd=i,i=i+1|0,i=i+7&-8,c[gd>>2]=0,gd)|0);i=gd;L5669:do{if((c[(d+132|0)>>2]|0)>0){gf=(b+1680|0)+96|0;ge=0;L5671:while(1){c[b5>>2]=ge;gh=kc(gf,b5)|0;a[b6]=8;C=1701667182;a[b6+1|0]=C;C=C>>8;a[(b6+1|0)+1|0]=C;C=C>>8;a[(b6+1|0)+2|0]=C;C=C>>8;a[(b6+1|0)+3|0]=C;a[b6+5|0]=0;gs=kp(gh,b+640|0,b6)|0;gj=c[gs>>2]|0;if((gj|0)==0){gt=tu(40)|0;do{if((gt+16|0|0)!=0){if((a[b6]&1)==0){c[(gt+16|0)>>2]=c[b6>>2];c[(gt+16|0)+4>>2]=c[b6+4>>2];c[(gt+16|0)+8>>2]=c[b6+8>>2];break}gi=c[(b6+8|0)>>2]|0;gg=c[(b6+4|0)>>2]|0;if(gg>>>0>4294967279>>>0){gc=5343;break L5671}if(gg>>>0<11>>>0){a[gt+16|0]=gg<<1;hr=gt+17|0}else{gv=tu(gg+16&-16)|0;c[gt+24>>2]=gv;c[(gt+16|0)>>2]=gg+16&-16|1;c[gt+20>>2]=gg;hr=gv}tH(hr|0,gi|0,gg)|0;a[hr+gg|0]=0}}while(0);if((gt+28|0|0)!=0){tI(gt+28|0|0,0,12)|0}gr=c[(b+640|0)>>2]|0;c[gt>>2]=0;c[gt+4>>2]=0;c[gt+8>>2]=gr;c[gs>>2]=gt;gr=c[c[(gh|0)>>2]>>2]|0;if((gr|0)==0){hs=gt}else{c[(gh|0)>>2]=gr;hs=c[gs>>2]|0}jV(c[gh+4>>2]|0,hs);c[(gh+8|0)>>2]=(c[(gh+8|0)>>2]|0)+1;ht=gt}else{ht=gj}gr=ht+28|0;if((a[gr]&1)==0){c[b4>>2]=c[gr>>2];c[b4+4>>2]=c[gr+4>>2];c[b4+8>>2]=c[gr+8>>2]}else{gr=c[ht+36>>2]|0;gn=c[ht+32>>2]|0;if(gn>>>0>4294967279>>>0){gc=5362;break}if(gn>>>0<11>>>0){a[b4]=gn<<1;hu=b4+1|0}else{gl=tu(gn+16&-16)|0;c[(b4+8|0)>>2]=gl;c[(b4|0)>>2]=gn+16&-16|1;c[(b4+4|0)>>2]=gn;hu=gl}tH(hu|0,gr|0,gn)|0;a[hu+gn|0]=0}gn=(c[(d+20|0)>>2]|0)+(ge*60|0)+4|0;if((gn|0)==0){hC(19,0,49832,(gd=i,i=i+1|0,i=i+7&-8,c[gd>>2]=0,gd)|0);i=gd}else{c[gn>>2]=cj(((a[b4]&1)==0?b4+1|0:c[(b4+8|0)>>2]|0)|0)|0}if((a[b4]&1)!=0){tw(c[(b4+8|0)>>2]|0)}if((a[b6]&1)!=0){tw(c[(b6+8|0)>>2]|0)}c[b8>>2]=ge;gn=kc(gf,b8)|0;gr=tu(16)|0;c[(b9+8|0)>>2]=gr;c[(b9|0)>>2]=17;c[(b9+4|0)>>2]=14;tH(gr|0,30344,14)|0;a[gr+14|0]=0;gr=kp(gn,b+632|0,b9)|0;gl=c[gr>>2]|0;if((gl|0)==0){gk=tu(40)|0;do{if((gk+16|0|0)!=0){if((a[b9]&1)==0){c[(gk+16|0)>>2]=c[b9>>2];c[(gk+16|0)+4>>2]=c[b9+4>>2];c[(gk+16|0)+8>>2]=c[b9+8>>2];break}gg=c[(b9+8|0)>>2]|0;gi=c[(b9+4|0)>>2]|0;if(gi>>>0>4294967279>>>0){gc=5384;break L5671}if(gi>>>0<11>>>0){a[gk+16|0]=gi<<1;hv=gk+17|0}else{gv=tu(gi+16&-16)|0;c[gk+24>>2]=gv;c[(gk+16|0)>>2]=gi+16&-16|1;c[gk+20>>2]=gi;hv=gv}tH(hv|0,gg|0,gi)|0;a[hv+gi|0]=0}}while(0);if((gk+28|0|0)!=0){tI(gk+28|0|0,0,12)|0}gj=c[(b+632|0)>>2]|0;c[gk>>2]=0;c[gk+4>>2]=0;c[gk+8>>2]=gj;c[gr>>2]=gk;gj=c[c[(gn|0)>>2]>>2]|0;if((gj|0)==0){hw=gk}else{c[(gn|0)>>2]=gj;hw=c[gr>>2]|0}jV(c[gn+4>>2]|0,hw);c[(gn+8|0)>>2]=(c[(gn+8|0)>>2]|0)+1;hx=gk}else{hx=gl}gj=hx+28|0;if((a[gj]&1)==0){c[b7>>2]=c[gj>>2];c[b7+4>>2]=c[gj+4>>2];c[b7+8>>2]=c[gj+8>>2]}else{gj=c[hx+36>>2]|0;gt=c[hx+32>>2]|0;if(gt>>>0>4294967279>>>0){gc=5403;break}if(gt>>>0<11>>>0){a[b7]=gt<<1;hy=b7+1|0}else{gh=tu(gt+16&-16)|0;c[(b7+8|0)>>2]=gh;c[(b7|0)>>2]=gt+16&-16|1;c[(b7+4|0)>>2]=gt;hy=gh}tH(hy|0,gj|0,gt)|0;a[hy+gt|0]=0}kd(b7,(c[(d+20|0)>>2]|0)+(ge*60|0)|0);if((a[b7]&1)!=0){tw(c[(b7+8|0)>>2]|0)}if((a[b9]&1)!=0){tw(c[(b9+8|0)>>2]|0)}c[cb>>2]=ge;gt=kc(gf,cb)|0;gj=tu(16)|0;c[(cc+8|0)>>2]=gj;c[(cc|0)>>2]=17;c[(cc+4|0)>>2]=11;tH(gj|0,3e4,11)|0;a[gj+11|0]=0;gj=kp(gt,b+624|0,cc)|0;gh=c[gj>>2]|0;if((gh|0)==0){gs=tu(40)|0;do{if((gs+16|0|0)!=0){if((a[cc]&1)==0){c[(gs+16|0)>>2]=c[cc>>2];c[(gs+16|0)+4>>2]=c[cc+4>>2];c[(gs+16|0)+8>>2]=c[cc+8>>2];break}gi=c[(cc+8|0)>>2]|0;gg=c[(cc+4|0)>>2]|0;if(gg>>>0>4294967279>>>0){gc=5422;break L5671}if(gg>>>0<11>>>0){a[gs+16|0]=gg<<1;hz=gs+17|0}else{gv=tu(gg+16&-16)|0;c[gs+24>>2]=gv;c[(gs+16|0)>>2]=gg+16&-16|1;c[gs+20>>2]=gg;hz=gv}tH(hz|0,gi|0,gg)|0;a[hz+gg|0]=0}}while(0);if((gs+28|0|0)!=0){tI(gs+28|0|0,0,12)|0}gl=c[(b+624|0)>>2]|0;c[gs>>2]=0;c[gs+4>>2]=0;c[gs+8>>2]=gl;c[gj>>2]=gs;gl=c[c[(gt|0)>>2]>>2]|0;if((gl|0)==0){hB=gs}else{c[(gt|0)>>2]=gl;hB=c[gj>>2]|0}jV(c[gt+4>>2]|0,hB);c[(gt+8|0)>>2]=(c[(gt+8|0)>>2]|0)+1;hD=gs}else{hD=gh}gl=hD+28|0;if((a[gl]&1)==0){c[ca>>2]=c[gl>>2];c[ca+4>>2]=c[gl+4>>2];c[ca+8>>2]=c[gl+8>>2]}else{gl=c[hD+36>>2]|0;gk=c[hD+32>>2]|0;if(gk>>>0>4294967279>>>0){gc=5441;break}if(gk>>>0<11>>>0){a[ca]=gk<<1;hE=ca+1|0}else{gn=tu(gk+16&-16)|0;c[(ca+8|0)>>2]=gn;c[(ca|0)>>2]=gk+16&-16|1;c[(ca+4|0)>>2]=gk;hE=gn}tH(hE|0,gl|0,gk)|0;a[hE+gk|0]=0}gk=(c[(d+20|0)>>2]|0)+(ge*60|0)+8|0;if((gk|0)==0){hC(19,0,49832,(gd=i,i=i+1|0,i=i+7&-8,c[gd>>2]=0,gd)|0);i=gd}else{c[gk>>2]=cj(((a[ca]&1)==0?ca+1|0:c[(ca+8|0)>>2]|0)|0)|0}if((a[ca]&1)!=0){tw(c[(ca+8|0)>>2]|0)}if((a[cc]&1)!=0){tw(c[(cc+8|0)>>2]|0)}c[ce>>2]=ge;gk=kc(gf,ce)|0;a[cf]=16;C=1701603686;a[cf+1|0|0]=C;C=C>>8;a[(cf+1|0|0)+1|0]=C;C=C>>8;a[(cf+1|0|0)+2|0]=C;C=C>>8;a[(cf+1|0|0)+3|0]=C;C=1701667150;a[(cf+1|0)+4|0]=C;C=C>>8;a[((cf+1|0)+4|0)+1|0]=C;C=C>>8;a[((cf+1|0)+4|0)+2|0]=C;C=C>>8;a[((cf+1|0)+4|0)+3|0]=C;a[cf+9|0]=0;gl=kp(gk,b+616|0,cf)|0;gn=c[gl>>2]|0;if((gn|0)==0){gr=tu(40)|0;do{if((gr+16|0|0)!=0){if((a[cf]&1)==0){c[(gr+16|0)>>2]=c[cf>>2];c[(gr+16|0)+4>>2]=c[cf+4>>2];c[(gr+16|0)+8>>2]=c[cf+8>>2];break}gg=c[(cf+8|0)>>2]|0;gi=c[(cf+4|0)>>2]|0;if(gi>>>0>4294967279>>>0){gc=5462;break L5671}if(gi>>>0<11>>>0){a[gr+16|0]=gi<<1;hF=gr+17|0}else{gv=tu(gi+16&-16)|0;c[gr+24>>2]=gv;c[(gr+16|0)>>2]=gi+16&-16|1;c[gr+20>>2]=gi;hF=gv}tH(hF|0,gg|0,gi)|0;a[hF+gi|0]=0}}while(0);if((gr+28|0|0)!=0){tI(gr+28|0|0,0,12)|0}gh=c[(b+616|0)>>2]|0;c[gr>>2]=0;c[gr+4>>2]=0;c[gr+8>>2]=gh;c[gl>>2]=gr;gh=c[c[(gk|0)>>2]>>2]|0;if((gh|0)==0){hG=gr}else{c[(gk|0)>>2]=gh;hG=c[gl>>2]|0}jV(c[gk+4>>2]|0,hG);c[(gk+8|0)>>2]=(c[(gk+8|0)>>2]|0)+1;hH=gr}else{hH=gn}gh=hH+28|0;if((a[gh]&1)==0){c[cd>>2]=c[gh>>2];c[cd+4>>2]=c[gh+4>>2];c[cd+8>>2]=c[gh+8>>2]}else{gh=c[hH+36>>2]|0;gs=c[hH+32>>2]|0;if(gs>>>0>4294967279>>>0){gc=5481;break}if(gs>>>0<11>>>0){a[cd]=gs<<1;hI=cd+1|0}else{gt=tu(gs+16&-16)|0;c[(cd+8|0)>>2]=gt;c[(cd|0)>>2]=gs+16&-16|1;c[(cd+4|0)>>2]=gs;hI=gt}tH(hI|0,gh|0,gs)|0;a[hI+gs|0]=0}gs=(c[(d+20|0)>>2]|0)+(ge*60|0)+12|0;if((gs|0)==0){hC(19,0,49832,(gd=i,i=i+1|0,i=i+7&-8,c[gd>>2]=0,gd)|0);i=gd}else{c[gs>>2]=cj(((a[cd]&1)==0?cd+1|0:c[(cd+8|0)>>2]|0)|0)|0}if((a[cd]&1)!=0){tw(c[(cd+8|0)>>2]|0)}if((a[cf]&1)!=0){tw(c[(cf+8|0)>>2]|0)}c[ch>>2]=ge;gs=kc(gf,ch)|0;a[ci]=18;tH(ci+1|0|0,28704,9)|0;a[ci+10|0]=0;gh=kp(gs,b+608|0,ci)|0;gt=c[gh>>2]|0;if((gt|0)==0){gj=tu(40)|0;do{if((gj+16|0|0)!=0){if((a[ci]&1)==0){c[(gj+16|0)>>2]=c[ci>>2];c[(gj+16|0)+4>>2]=c[ci+4>>2];c[(gj+16|0)+8>>2]=c[ci+8>>2];break}gi=c[(ci+8|0)>>2]|0;gg=c[(ci+4|0)>>2]|0;if(gg>>>0>4294967279>>>0){gc=5502;break L5671}if(gg>>>0<11>>>0){a[gj+16|0]=gg<<1;hJ=gj+17|0}else{gv=tu(gg+16&-16)|0;c[gj+24>>2]=gv;c[(gj+16|0)>>2]=gg+16&-16|1;c[gj+20>>2]=gg;hJ=gv}tH(hJ|0,gi|0,gg)|0;a[hJ+gg|0]=0}}while(0);if((gj+28|0|0)!=0){tI(gj+28|0|0,0,12)|0}gn=c[(b+608|0)>>2]|0;c[gj>>2]=0;c[gj+4>>2]=0;c[gj+8>>2]=gn;c[gh>>2]=gj;gn=c[c[(gs|0)>>2]>>2]|0;if((gn|0)==0){hK=gj}else{c[(gs|0)>>2]=gn;hK=c[gh>>2]|0}jV(c[gs+4>>2]|0,hK);c[(gs+8|0)>>2]=(c[(gs+8|0)>>2]|0)+1;hL=gj}else{hL=gt}gn=hL+28|0;if((a[gn]&1)==0){c[cg>>2]=c[gn>>2];c[cg+4>>2]=c[gn+4>>2];c[cg+8>>2]=c[gn+8>>2]}else{gn=c[hL+36>>2]|0;gr=c[hL+32>>2]|0;if(gr>>>0>4294967279>>>0){gc=5521;break}if(gr>>>0<11>>>0){a[cg]=gr<<1;hM=cg+1|0}else{gk=tu(gr+16&-16)|0;c[(cg+8|0)>>2]=gk;c[(cg|0)>>2]=gr+16&-16|1;c[(cg+4|0)>>2]=gr;hM=gk}tH(hM|0,gn|0,gr)|0;a[hM+gr|0]=0}kb(cg,(c[(d+20|0)>>2]|0)+(ge*60|0)+16|0,0);if((a[cg]&1)!=0){tw(c[(cg+8|0)>>2]|0)}if((a[ci]&1)!=0){tw(c[(ci+8|0)>>2]|0)}c[cl>>2]=ge;gr=kc(gf,cl)|0;gn=tu(16)|0;c[(cm+8|0)>>2]=gn;c[(cm|0)>>2]=17;c[(cm+4|0)>>2]=11;tH(gn|0,28120,11)|0;a[gn+11|0]=0;gn=kp(gr,b+600|0,cm)|0;gk=c[gn>>2]|0;if((gk|0)==0){gl=tu(40)|0;do{if((gl+16|0|0)!=0){if((a[cm]&1)==0){c[(gl+16|0)>>2]=c[cm>>2];c[(gl+16|0)+4>>2]=c[cm+4>>2];c[(gl+16|0)+8>>2]=c[cm+8>>2];break}gg=c[(cm+8|0)>>2]|0;gi=c[(cm+4|0)>>2]|0;if(gi>>>0>4294967279>>>0){gc=5540;break L5671}if(gi>>>0<11>>>0){a[gl+16|0]=gi<<1;hN=gl+17|0}else{gv=tu(gi+16&-16)|0;c[gl+24>>2]=gv;c[(gl+16|0)>>2]=gi+16&-16|1;c[gl+20>>2]=gi;hN=gv}tH(hN|0,gg|0,gi)|0;a[hN+gi|0]=0}}while(0);if((gl+28|0|0)!=0){tI(gl+28|0|0,0,12)|0}gt=c[(b+600|0)>>2]|0;c[gl>>2]=0;c[gl+4>>2]=0;c[gl+8>>2]=gt;c[gn>>2]=gl;gt=c[c[(gr|0)>>2]>>2]|0;if((gt|0)==0){hO=gl}else{c[(gr|0)>>2]=gt;hO=c[gn>>2]|0}jV(c[gr+4>>2]|0,hO);c[(gr+8|0)>>2]=(c[(gr+8|0)>>2]|0)+1;hP=gl}else{hP=gk}gt=hP+28|0;if((a[gt]&1)==0){c[ck>>2]=c[gt>>2];c[ck+4>>2]=c[gt+4>>2];c[ck+8>>2]=c[gt+8>>2]}else{gt=c[hP+36>>2]|0;gj=c[hP+32>>2]|0;if(gj>>>0>4294967279>>>0){gc=5559;break}if(gj>>>0<11>>>0){a[ck]=gj<<1;hQ=ck+1|0}else{gs=tu(gj+16&-16)|0;c[(ck+8|0)>>2]=gs;c[(ck|0)>>2]=gj+16&-16|1;c[(ck+4|0)>>2]=gj;hQ=gs}tH(hQ|0,gt|0,gj)|0;a[hQ+gj|0]=0}kb(ck,(c[(d+20|0)>>2]|0)+(ge*60|0)+20|0,0);if((a[ck]&1)!=0){tw(c[(ck+8|0)>>2]|0)}if((a[cm]&1)!=0){tw(c[(cm+8|0)>>2]|0)}c[co>>2]=ge;gj=kc(gf,co)|0;a[cp]=14;a[cp+1|0]=a[27080]|0;a[(cp+1|0)+1|0]=a[27081]|0;a[(cp+1|0)+2|0]=a[27082]|0;a[(cp+1|0)+3|0]=a[27083]|0;a[(cp+1|0)+4|0]=a[27084]|0;a[(cp+1|0)+5|0]=a[27085]|0;a[(cp+1|0)+6|0]=a[27086]|0;a[cp+8|0]=0;gt=kp(gj,b+592|0,cp)|0;gs=c[gt>>2]|0;if((gs|0)==0){gh=tu(40)|0;do{if((gh+16|0|0)!=0){if((a[cp]&1)==0){c[(gh+16|0)>>2]=c[cp>>2];c[(gh+16|0)+4>>2]=c[cp+4>>2];c[(gh+16|0)+8>>2]=c[cp+8>>2];break}gi=c[(cp+8|0)>>2]|0;gg=c[(cp+4|0)>>2]|0;if(gg>>>0>4294967279>>>0){gc=5577;break L5671}if(gg>>>0<11>>>0){a[gh+16|0]=gg<<1;hR=gh+17|0}else{gv=tu(gg+16&-16)|0;c[gh+24>>2]=gv;c[(gh+16|0)>>2]=gg+16&-16|1;c[gh+20>>2]=gg;hR=gv}tH(hR|0,gi|0,gg)|0;a[hR+gg|0]=0}}while(0);if((gh+28|0|0)!=0){tI(gh+28|0|0,0,12)|0}gk=c[(b+592|0)>>2]|0;c[gh>>2]=0;c[gh+4>>2]=0;c[gh+8>>2]=gk;c[gt>>2]=gh;gk=c[c[(gj|0)>>2]>>2]|0;if((gk|0)==0){hS=gh}else{c[(gj|0)>>2]=gk;hS=c[gt>>2]|0}jV(c[gj+4>>2]|0,hS);c[(gj+8|0)>>2]=(c[(gj+8|0)>>2]|0)+1;hT=gh}else{hT=gs}gk=hT+28|0;if((a[gk]&1)==0){c[cn>>2]=c[gk>>2];c[cn+4>>2]=c[gk+4>>2];c[cn+8>>2]=c[gk+8>>2]}else{gk=c[hT+36>>2]|0;gl=c[hT+32>>2]|0;if(gl>>>0>4294967279>>>0){gc=5596;break}if(gl>>>0<11>>>0){a[cn]=gl<<1;hU=cn+1|0}else{gr=tu(gl+16&-16)|0;c[(cn+8|0)>>2]=gr;c[(cn|0)>>2]=gl+16&-16|1;c[(cn+4|0)>>2]=gl;hU=gr}tH(hU|0,gk|0,gl)|0;a[hU+gl|0]=0}kb(cn,(c[(d+20|0)>>2]|0)+(ge*60|0)+24|0,0);if((a[cn]&1)!=0){tw(c[(cn+8|0)>>2]|0)}if((a[cp]&1)!=0){tw(c[(cp+8|0)>>2]|0)}c[cr>>2]=ge;gl=kc(gf,cr)|0;a[cs]=18;tH(cs+1|0|0,26600,9)|0;a[cs+10|0]=0;gk=kp(gl,b+584|0,cs)|0;gr=c[gk>>2]|0;if((gr|0)==0){gn=tu(40)|0;do{if((gn+16|0|0)!=0){if((a[cs]&1)==0){c[(gn+16|0)>>2]=c[cs>>2];c[(gn+16|0)+4>>2]=c[cs+4>>2];c[(gn+16|0)+8>>2]=c[cs+8>>2];break}gg=c[(cs+8|0)>>2]|0;gi=c[(cs+4|0)>>2]|0;if(gi>>>0>4294967279>>>0){gc=5614;break L5671}if(gi>>>0<11>>>0){a[gn+16|0]=gi<<1;hV=gn+17|0}else{gv=tu(gi+16&-16)|0;c[gn+24>>2]=gv;c[(gn+16|0)>>2]=gi+16&-16|1;c[gn+20>>2]=gi;hV=gv}tH(hV|0,gg|0,gi)|0;a[hV+gi|0]=0}}while(0);if((gn+28|0|0)!=0){tI(gn+28|0|0,0,12)|0}gs=c[(b+584|0)>>2]|0;c[gn>>2]=0;c[gn+4>>2]=0;c[gn+8>>2]=gs;c[gk>>2]=gn;gs=c[c[(gl|0)>>2]>>2]|0;if((gs|0)==0){hW=gn}else{c[(gl|0)>>2]=gs;hW=c[gk>>2]|0}jV(c[gl+4>>2]|0,hW);c[(gl+8|0)>>2]=(c[(gl+8|0)>>2]|0)+1;hX=gn}else{hX=gr}gs=hX+28|0;if((a[gs]&1)==0){c[cq>>2]=c[gs>>2];c[cq+4>>2]=c[gs+4>>2];c[cq+8>>2]=c[gs+8>>2]}else{gs=c[hX+36>>2]|0;gh=c[hX+32>>2]|0;if(gh>>>0>4294967279>>>0){gc=5633;break}if(gh>>>0<11>>>0){a[cq]=gh<<1;hY=cq+1|0}else{gj=tu(gh+16&-16)|0;c[(cq+8|0)>>2]=gj;c[(cq|0)>>2]=gh+16&-16|1;c[(cq+4|0)>>2]=gh;hY=gj}tH(hY|0,gs|0,gh)|0;a[hY+gh|0]=0}kb(cq,(c[(d+20|0)>>2]|0)+(ge*60|0)+28|0,0);if((a[cq]&1)!=0){tw(c[(cq+8|0)>>2]|0)}if((a[cs]&1)!=0){tw(c[(cs+8|0)>>2]|0)}c[cu>>2]=ge;gh=kc(gf,cu)|0;gs=tu(16)|0;c[(cv+8|0)>>2]=gs;c[(cv|0)>>2]=17;c[(cv+4|0)>>2]=12;tH(gs|0,25696,12)|0;a[gs+12|0]=0;gs=kp(gh,b+576|0,cv)|0;gj=c[gs>>2]|0;if((gj|0)==0){gt=tu(40)|0;do{if((gt+16|0|0)!=0){if((a[cv]&1)==0){c[(gt+16|0)>>2]=c[cv>>2];c[(gt+16|0)+4>>2]=c[cv+4>>2];c[(gt+16|0)+8>>2]=c[cv+8>>2];break}gi=c[(cv+8|0)>>2]|0;gg=c[(cv+4|0)>>2]|0;if(gg>>>0>4294967279>>>0){gc=5652;break L5671}if(gg>>>0<11>>>0){a[gt+16|0]=gg<<1;hZ=gt+17|0}else{gv=tu(gg+16&-16)|0;c[gt+24>>2]=gv;c[(gt+16|0)>>2]=gg+16&-16|1;c[gt+20>>2]=gg;hZ=gv}tH(hZ|0,gi|0,gg)|0;a[hZ+gg|0]=0}}while(0);if((gt+28|0|0)!=0){tI(gt+28|0|0,0,12)|0}gr=c[(b+576|0)>>2]|0;c[gt>>2]=0;c[gt+4>>2]=0;c[gt+8>>2]=gr;c[gs>>2]=gt;gr=c[c[(gh|0)>>2]>>2]|0;if((gr|0)==0){h_=gt}else{c[(gh|0)>>2]=gr;h_=c[gs>>2]|0}jV(c[gh+4>>2]|0,h_);c[(gh+8|0)>>2]=(c[(gh+8|0)>>2]|0)+1;h$=gt}else{h$=gj}gr=h$+28|0;if((a[gr]&1)==0){c[ct>>2]=c[gr>>2];c[ct+4>>2]=c[gr+4>>2];c[ct+8>>2]=c[gr+8>>2]}else{gr=c[h$+36>>2]|0;gn=c[h$+32>>2]|0;if(gn>>>0>4294967279>>>0){gc=5671;break}if(gn>>>0<11>>>0){a[ct]=gn<<1;h0=ct+1|0}else{gl=tu(gn+16&-16)|0;c[(ct+8|0)>>2]=gl;c[(ct|0)>>2]=gn+16&-16|1;c[(ct+4|0)>>2]=gn;h0=gl}tH(h0|0,gr|0,gn)|0;a[h0+gn|0]=0}kb(ct,(c[(d+20|0)>>2]|0)+(ge*60|0)+32|0,0);if((a[ct]&1)!=0){tw(c[(ct+8|0)>>2]|0)}if((a[cv]&1)!=0){tw(c[(cv+8|0)>>2]|0)}c[cx>>2]=ge;gn=kc(gf,cx)|0;a[cy]=16;C=1399157621;a[cy+1|0|0]=C;C=C>>8;a[(cy+1|0|0)+1|0]=C;C=C>>8;a[(cy+1|0|0)+2|0]=C;C=C>>8;a[(cy+1|0|0)+3|0]=C;C=1953653108;a[(cy+1|0)+4|0]=C;C=C>>8;a[((cy+1|0)+4|0)+1|0]=C;C=C>>8;a[((cy+1|0)+4|0)+2|0]=C;C=C>>8;a[((cy+1|0)+4|0)+3|0]=C;a[cy+9|0]=0;gr=kp(gn,b+568|0,cy)|0;gl=c[gr>>2]|0;if((gl|0)==0){gk=tu(40)|0;do{if((gk+16|0|0)!=0){if((a[cy]&1)==0){c[(gk+16|0)>>2]=c[cy>>2];c[(gk+16|0)+4>>2]=c[cy+4>>2];c[(gk+16|0)+8>>2]=c[cy+8>>2];break}gg=c[(cy+8|0)>>2]|0;gi=c[(cy+4|0)>>2]|0;if(gi>>>0>4294967279>>>0){gc=5689;break L5671}if(gi>>>0<11>>>0){a[gk+16|0]=gi<<1;h1=gk+17|0}else{gv=tu(gi+16&-16)|0;c[gk+24>>2]=gv;c[(gk+16|0)>>2]=gi+16&-16|1;c[gk+20>>2]=gi;h1=gv}tH(h1|0,gg|0,gi)|0;a[h1+gi|0]=0}}while(0);if((gk+28|0|0)!=0){tI(gk+28|0|0,0,12)|0}gj=c[(b+568|0)>>2]|0;c[gk>>2]=0;c[gk+4>>2]=0;c[gk+8>>2]=gj;c[gr>>2]=gk;gj=c[c[(gn|0)>>2]>>2]|0;if((gj|0)==0){h2=gk}else{c[(gn|0)>>2]=gj;h2=c[gr>>2]|0}jV(c[gn+4>>2]|0,h2);c[(gn+8|0)>>2]=(c[(gn+8|0)>>2]|0)+1;h3=gk}else{h3=gl}gj=h3+28|0;if((a[gj]&1)==0){c[cw>>2]=c[gj>>2];c[cw+4>>2]=c[gj+4>>2];c[cw+8>>2]=c[gj+8>>2];h4=a[cw]|0}else{gj=c[h3+36>>2]|0;gt=c[h3+32>>2]|0;if(gt>>>0>4294967279>>>0){gc=5708;break}if(gt>>>0<11>>>0){a[cw]=gt<<1&255;h5=cw+1|0;h6=gt<<1&255}else{gh=tu(gt+16&-16)|0;c[(cw+8|0)>>2]=gh;c[(cw|0)>>2]=gt+16&-16|1;c[(cw+4|0)>>2]=gt;h5=gh;h6=(gt+16&-16|1)&255}tH(h5|0,gj|0,gt)|0;a[h5+gt|0]=0;h4=h6}gt=(c[(d+20|0)>>2]|0)+(ge*60|0)+49|0;gj=h4&255;gh=(gj&1|0)==0?gj>>>1:c[(cw+4|0)>>2]|0;gj=(h4&1)==0;gs=c[(cw+8|0)>>2]|0;gi=tK((gj?cw+1|0:gs)|0,42e3,(gh>>>0>4>>>0?4:gh)|0)|0;if((gi|0)==0){h7=gh>>>0<4>>>0?-1:gh>>>0>4>>>0&1}else{h7=gi}a[gt]=(h7|0)==0|0;if(!gj){tw(gs)}if((a[cy]&1)!=0){tw(c[(cy+8|0)>>2]|0)}c[cA>>2]=ge;gs=kc(gf,cA)|0;a[cB]=10;a[cB+1|0]=a[39368]|0;a[(cB+1|0)+1|0]=a[39369]|0;a[(cB+1|0)+2|0]=a[39370]|0;a[(cB+1|0)+3|0]=a[39371]|0;a[(cB+1|0)+4|0]=a[39372]|0;a[cB+6|0]=0;gj=kp(gs,b+560|0,cB)|0;gt=c[gj>>2]|0;if((gt|0)==0){gi=tu(40)|0;do{if((gi+16|0|0)!=0){if((a[cB]&1)==0){c[(gi+16|0)>>2]=c[cB>>2];c[(gi+16|0)+4>>2]=c[cB+4>>2];c[(gi+16|0)+8>>2]=c[cB+8>>2];break}gh=c[(cB+8|0)>>2]|0;gg=c[(cB+4|0)>>2]|0;if(gg>>>0>4294967279>>>0){gc=5728;break L5671}if(gg>>>0<11>>>0){a[gi+16|0]=gg<<1;h8=gi+17|0}else{gv=tu(gg+16&-16)|0;c[gi+24>>2]=gv;c[(gi+16|0)>>2]=gg+16&-16|1;c[gi+20>>2]=gg;h8=gv}tH(h8|0,gh|0,gg)|0;a[h8+gg|0]=0}}while(0);if((gi+28|0|0)!=0){tI(gi+28|0|0,0,12)|0}gl=c[(b+560|0)>>2]|0;c[gi>>2]=0;c[gi+4>>2]=0;c[gi+8>>2]=gl;c[gj>>2]=gi;gl=c[c[(gs|0)>>2]>>2]|0;if((gl|0)==0){h9=gi}else{c[(gs|0)>>2]=gl;h9=c[gj>>2]|0}jV(c[gs+4>>2]|0,h9);c[(gs+8|0)>>2]=(c[(gs+8|0)>>2]|0)+1;ia=gi}else{ia=gt}gl=ia+28|0;if((a[gl]&1)==0){c[cz>>2]=c[gl>>2];c[cz+4>>2]=c[gl+4>>2];c[cz+8>>2]=c[gl+8>>2]}else{gl=c[ia+36>>2]|0;gk=c[ia+32>>2]|0;if(gk>>>0>4294967279>>>0){gc=5747;break}if(gk>>>0<11>>>0){a[cz]=gk<<1;ib=cz+1|0}else{gn=tu(gk+16&-16)|0;c[(cz+8|0)>>2]=gn;c[(cz|0)>>2]=gk+16&-16|1;c[(cz+4|0)>>2]=gk;ib=gn}tH(ib|0,gl|0,gk)|0;a[ib+gk|0]=0}kb(cz,(c[(d+20|0)>>2]|0)+(ge*60|0)+52|0,0);if((a[cz]&1)!=0){tw(c[(cz+8|0)>>2]|0)}if((a[cB]&1)!=0){tw(c[(cB+8|0)>>2]|0)}c[cD>>2]=ge;gk=kc(gf,cD)|0;a[cE]=10;a[cE+1|0]=a[25288]|0;a[(cE+1|0)+1|0]=a[25289]|0;a[(cE+1|0)+2|0]=a[25290]|0;a[(cE+1|0)+3|0]=a[25291]|0;a[(cE+1|0)+4|0]=a[25292]|0;a[cE+6|0]=0;gl=kp(gk,b+552|0,cE)|0;gn=c[gl>>2]|0;if((gn|0)==0){gr=tu(40)|0;do{if((gr+16|0|0)!=0){if((a[cE]&1)==0){c[(gr+16|0)>>2]=c[cE>>2];c[(gr+16|0)+4>>2]=c[cE+4>>2];c[(gr+16|0)+8>>2]=c[cE+8>>2];break}gg=c[(cE+8|0)>>2]|0;gh=c[(cE+4|0)>>2]|0;if(gh>>>0>4294967279>>>0){gc=5765;break L5671}if(gh>>>0<11>>>0){a[gr+16|0]=gh<<1;ic=gr+17|0}else{gv=tu(gh+16&-16)|0;c[gr+24>>2]=gv;c[(gr+16|0)>>2]=gh+16&-16|1;c[gr+20>>2]=gh;ic=gv}tH(ic|0,gg|0,gh)|0;a[ic+gh|0]=0}}while(0);if((gr+28|0|0)!=0){tI(gr+28|0|0,0,12)|0}gt=c[(b+552|0)>>2]|0;c[gr>>2]=0;c[gr+4>>2]=0;c[gr+8>>2]=gt;c[gl>>2]=gr;gt=c[c[(gk|0)>>2]>>2]|0;if((gt|0)==0){id=gr}else{c[(gk|0)>>2]=gt;id=c[gl>>2]|0}jV(c[gk+4>>2]|0,id);c[(gk+8|0)>>2]=(c[(gk+8|0)>>2]|0)+1;ie=gr}else{ie=gn}gt=ie+28|0;if((a[gt]&1)==0){c[cC>>2]=c[gt>>2];c[cC+4>>2]=c[gt+4>>2];c[cC+8>>2]=c[gt+8>>2];ig=a[cC]|0}else{gt=c[ie+36>>2]|0;gi=c[ie+32>>2]|0;if(gi>>>0>4294967279>>>0){gc=5784;break}if(gi>>>0<11>>>0){a[cC]=gi<<1&255;ih=cC+1|0;ii=gi<<1&255}else{gs=tu(gi+16&-16)|0;c[(cC+8|0)>>2]=gs;c[(cC|0)>>2]=gi+16&-16|1;c[(cC+4|0)>>2]=gi;ih=gs;ii=(gi+16&-16|1)&255}tH(ih|0,gt|0,gi)|0;a[ih+gi|0]=0;ig=ii}gi=(c[(d+20|0)>>2]|0)+(ge*60|0)+48|0;gt=ig&255;gs=(gt&1|0)==0?gt>>>1:c[(cC+4|0)>>2]|0;gt=(ig&1)==0;gj=c[(cC+8|0)>>2]|0;gh=tK((gt?cC+1|0:gj)|0,42e3,(gs>>>0>4>>>0?4:gs)|0)|0;if((gh|0)==0){ij=gs>>>0<4>>>0?-1:gs>>>0>4>>>0&1}else{ij=gh}a[gi]=(ij|0)==0|0;if(!gt){tw(gj)}if((a[cE]&1)!=0){tw(c[(cE+8|0)>>2]|0)}c[cG>>2]=ge;gj=kc(gf,cG)|0;a[cH]=6;a[cH+1|0]=a[24672]|0;a[(cH+1|0)+1|0]=a[24673]|0;a[(cH+1|0)+2|0]=a[24674]|0;a[cH+4|0]=0;gt=kp(gj,b+544|0,cH)|0;gi=c[gt>>2]|0;if((gi|0)==0){gh=tu(40)|0;do{if((gh+16|0|0)!=0){if((a[cH]&1)==0){c[(gh+16|0)>>2]=c[cH>>2];c[(gh+16|0)+4>>2]=c[cH+4>>2];c[(gh+16|0)+8>>2]=c[cH+8>>2];break}gs=c[(cH+8|0)>>2]|0;gg=c[(cH+4|0)>>2]|0;if(gg>>>0>4294967279>>>0){gc=5804;break L5671}if(gg>>>0<11>>>0){a[gh+16|0]=gg<<1;ik=gh+17|0}else{gv=tu(gg+16&-16)|0;c[gh+24>>2]=gv;c[(gh+16|0)>>2]=gg+16&-16|1;c[gh+20>>2]=gg;ik=gv}tH(ik|0,gs|0,gg)|0;a[ik+gg|0]=0}}while(0);if((gh+28|0|0)!=0){tI(gh+28|0|0,0,12)|0}gn=c[(b+544|0)>>2]|0;c[gh>>2]=0;c[gh+4>>2]=0;c[gh+8>>2]=gn;c[gt>>2]=gh;gn=c[c[(gj|0)>>2]>>2]|0;if((gn|0)==0){il=gh}else{c[(gj|0)>>2]=gn;il=c[gt>>2]|0}jV(c[gj+4>>2]|0,il);c[(gj+8|0)>>2]=(c[(gj+8|0)>>2]|0)+1;im=gh}else{im=gi}gn=im+28|0;if((a[gn]&1)==0){c[cF>>2]=c[gn>>2];c[cF+4>>2]=c[gn+4>>2];c[cF+8>>2]=c[gn+8>>2]}else{gn=c[im+36>>2]|0;gr=c[im+32>>2]|0;if(gr>>>0>4294967279>>>0){gc=5823;break}if(gr>>>0<11>>>0){a[cF]=gr<<1;io=cF+1|0}else{gk=tu(gr+16&-16)|0;c[(cF+8|0)>>2]=gk;c[(cF|0)>>2]=gr+16&-16|1;c[(cF+4|0)>>2]=gr;io=gk}tH(io|0,gn|0,gr)|0;a[io+gr|0]=0}kb(cF,(c[(d+20|0)>>2]|0)+(ge*60|0)+40|0,-2147483648);if((a[cF]&1)!=0){tw(c[(cF+8|0)>>2]|0)}if((a[cH]&1)!=0){tw(c[(cH+8|0)>>2]|0)}c[cJ>>2]=ge;gr=kc(gf,cJ)|0;a[cK]=6;a[cK+1|0]=a[24600]|0;a[(cK+1|0)+1|0]=a[24601]|0;a[(cK+1|0)+2|0]=a[24602]|0;a[cK+4|0]=0;gn=kp(gr,b+536|0,cK)|0;gk=c[gn>>2]|0;if((gk|0)==0){gl=tu(40)|0;do{if((gl+16|0|0)!=0){if((a[cK]&1)==0){c[(gl+16|0)>>2]=c[cK>>2];c[(gl+16|0)+4>>2]=c[cK+4>>2];c[(gl+16|0)+8>>2]=c[cK+8>>2];break}gg=c[(cK+8|0)>>2]|0;gs=c[(cK+4|0)>>2]|0;if(gs>>>0>4294967279>>>0){gc=5841;break L5671}if(gs>>>0<11>>>0){a[gl+16|0]=gs<<1;ip=gl+17|0}else{gv=tu(gs+16&-16)|0;c[gl+24>>2]=gv;c[(gl+16|0)>>2]=gs+16&-16|1;c[gl+20>>2]=gs;ip=gv}tH(ip|0,gg|0,gs)|0;a[ip+gs|0]=0}}while(0);if((gl+28|0|0)!=0){tI(gl+28|0|0,0,12)|0}gi=c[(b+536|0)>>2]|0;c[gl>>2]=0;c[gl+4>>2]=0;c[gl+8>>2]=gi;c[gn>>2]=gl;gi=c[c[(gr|0)>>2]>>2]|0;if((gi|0)==0){iq=gl}else{c[(gr|0)>>2]=gi;iq=c[gn>>2]|0}jV(c[gr+4>>2]|0,iq);c[(gr+8|0)>>2]=(c[(gr+8|0)>>2]|0)+1;ir=gl}else{ir=gk}gi=ir+28|0;if((a[gi]&1)==0){c[cI>>2]=c[gi>>2];c[cI+4>>2]=c[gi+4>>2];c[cI+8>>2]=c[gi+8>>2]}else{gi=c[ir+36>>2]|0;gh=c[ir+32>>2]|0;if(gh>>>0>4294967279>>>0){gc=5860;break}if(gh>>>0<11>>>0){a[cI]=gh<<1;is=cI+1|0}else{gj=tu(gh+16&-16)|0;c[(cI+8|0)>>2]=gj;c[(cI|0)>>2]=gh+16&-16|1;c[(cI+4|0)>>2]=gh;is=gj}tH(is|0,gi|0,gh)|0;a[is+gh|0]=0}kb(cI,(c[(d+20|0)>>2]|0)+(ge*60|0)+44|0,2147483647);if((a[cI]&1)!=0){tw(c[(cI+8|0)>>2]|0)}if((a[cK]&1)!=0){tw(c[(cK+8|0)>>2]|0)}gh=c[(d+20|0)>>2]|0;gi=(a[gh+(ge*60|0)+49|0]|0)!=0;gj=c[gh+(ge*60|0)+52>>2]|0;gt=(a[gh+(ge*60|0)+48|0]|0)!=0?42e3:42440;gs=c[gh+(ge*60|0)+40>>2]|0;gg=c[gh+(ge*60|0)+44>>2]|0;hA(4,0,58896,(gd=i,i=i+56|0,c[gd>>2]=c[gh+(ge*60|0)+4>>2],c[gd+8>>2]=gi?93904:24160,c[gd+16>>2]=gj,c[gd+24>>2]=gi?93904:24064,c[gd+32>>2]=gt,c[gd+40>>2]=gs,c[gd+48>>2]=gg,gd)|0);i=gd;gg=c[(d+20|0)>>2]|0;gs=c[gg+(ge*60|0)+4>>2]|0;if((a[gs]|0)==36){a[gg+(ge*60|0)+56|0]=1;it=c[(c[(d+20|0)>>2]|0)+(ge*60|0)+4>>2]|0}else{it=gs}gs=tD(it|0)|0;if(gs>>>0>4294967279>>>0){gc=5941;break}if(gs>>>0<11>>>0){a[cL]=gs<<1;iu=cL+1|0}else{gg=tu(gs+16&-16)|0;c[(cL+8|0)>>2]=gg;c[(cL|0)>>2]=gs+16&-16|1;c[(cL+4|0)>>2]=gs;iu=gg}tH(iu|0,it|0,gs)|0;a[iu+gs|0]=0;c[(ke(h,cL)|0)>>2]=ge;if((a[cL]&1)!=0){tw(c[(cL+8|0)>>2]|0)}ge=ge+1|0;if((ge|0)>=(c[(d+132|0)>>2]|0)){break L5669}}if((gc|0)==5343){ml(0)}else if((gc|0)==5362){ml(0)}else if((gc|0)==5384){ml(0)}else if((gc|0)==5403){ml(0)}else if((gc|0)==5422){ml(0)}else if((gc|0)==5441){ml(0)}else if((gc|0)==5462){ml(0)}else if((gc|0)==5481){ml(0)}else if((gc|0)==5502){ml(0)}else if((gc|0)==5521){ml(0)}else if((gc|0)==5540){ml(0)}else if((gc|0)==5559){ml(0)}else if((gc|0)==5577){ml(0)}else if((gc|0)==5596){ml(0)}else if((gc|0)==5614){ml(0)}else if((gc|0)==5633){ml(0)}else if((gc|0)==5652){ml(0)}else if((gc|0)==5671){ml(0)}else if((gc|0)==5689){ml(0)}else if((gc|0)==5708){ml(0)}else if((gc|0)==5728){ml(0)}else if((gc|0)==5747){ml(0)}else if((gc|0)==5765){ml(0)}else if((gc|0)==5784){ml(0)}else if((gc|0)==5804){ml(0)}else if((gc|0)==5823){ml(0)}else if((gc|0)==5841){ml(0)}else if((gc|0)==5860){ml(0)}else if((gc|0)==5941){ml(0)}}}while(0);if((c[17800]|0)!=0){dd[c[3504]&511](4)}hA(4,1,58336,(gd=i,i=i+1|0,i=i+7&-8,c[gd>>2]=0,gd)|0);i=gd;c[b+1904>>2]=d;c[b+1936>>2]=h;c[b+5160>>2]=cM;c[b+5168>>2]=cN;c[b+5176>>2]=cO;c[b+5184>>2]=cP;c[b+5192>>2]=cQ;c[b+5200>>2]=cR;c[b+5208>>2]=cS;c[b+5216>>2]=cT;c[b+5224>>2]=cU;c[b+5232>>2]=cV;c[b+5240>>2]=cW;c[b+5248>>2]=cX;c[b+5256>>2]=cY;c[b+5264>>2]=cZ;c[b+5272>>2]=c_;c[b+5280>>2]=c$;c[b+5288>>2]=c0;c[b+5296>>2]=c1;c[b+5304>>2]=c2;c[b+5312>>2]=c3;c[b+5320>>2]=c4;c[b+5328>>2]=c5;c[b+5336>>2]=c6;c[b+5344>>2]=c7;c[b+5352>>2]=c8;c[b+5360>>2]=c9;c[b+5368>>2]=da;c[b+5376>>2]=db;c[b+5384>>2]=dc;c[b+5392>>2]=de;c[b+5400>>2]=df;c[b+5408>>2]=dg;c[b+5416>>2]=dh;c[b+5424>>2]=di;c[b+5432>>2]=dj;c[b+5440>>2]=dk;c[b+5448>>2]=dl;c[b+5456>>2]=dm;c[b+5464>>2]=dn;c[b+5472>>2]=dp;c[b+5480>>2]=dq;c[b+5488>>2]=dr;c[b+5496>>2]=ds;c[b+5504>>2]=dt;c[b+5512>>2]=du;c[b+5520>>2]=dv;c[b+5528>>2]=dw;c[b+5536>>2]=dx;c[b+5544>>2]=dy;c[b+5552>>2]=dz;c[b+5560>>2]=dA;c[b+5568>>2]=dB;c[b+5576>>2]=dC;c[b+5584>>2]=dD;c[b+5592>>2]=dE;c[b+5600>>2]=dF;c[b+5608>>2]=dG;c[b+5616>>2]=dH;c[b+5624>>2]=dI;c[b+5632>>2]=dJ;c[b+5640>>2]=dK;c[b+5648>>2]=dL;c[b+5656>>2]=dM;c[b+5664>>2]=dN;c[b+5672>>2]=dO;c[b+5680>>2]=dP;c[b+5688>>2]=dQ;c[b+5696>>2]=dR;c[b+5704>>2]=dS;c[b+5712>>2]=dT;c[b+5720>>2]=dU;c[b+39768>>2]=gc;c[b+39776>>2]=gd;c[b+39808>>2]=0;c[b+39812>>2]=0;_read_input_xml$2(b);gc=c[b+39768>>2]|0;gd=c[b+39776>>2]|0;c[b+1904>>2]=d;c[b+1928>>2]=f;c[b+1936>>2]=h;c[b+5728>>2]=dV;c[b+5736>>2]=dW;c[b+5744>>2]=dX;c[b+5752>>2]=dY;c[b+5760>>2]=dZ;c[b+5768>>2]=d_;c[b+5776>>2]=d$;c[b+5784>>2]=d0;c[b+5792>>2]=d1;c[b+5800>>2]=d2;c[b+5808>>2]=d3;c[b+5816>>2]=d4;c[b+5824>>2]=d5;c[b+5832>>2]=d6;c[b+5840>>2]=d7;c[b+5848>>2]=d8;c[b+5856>>2]=d9;c[b+5864>>2]=ea;c[b+5872>>2]=eb;c[b+5880>>2]=ec;c[b+5888>>2]=ed;c[b+5896>>2]=ee;c[b+5904>>2]=ef;c[b+5912>>2]=eg;c[b+5920>>2]=eh;c[b+5928>>2]=ei;c[b+5936>>2]=ej;c[b+5944>>2]=ek;c[b+5952>>2]=el;c[b+5960>>2]=em;c[b+5968>>2]=en;c[b+5976>>2]=eo;c[b+5984>>2]=ep;c[b+5992>>2]=eq;c[b+6e3>>2]=er;c[b+6008>>2]=es;c[b+6016>>2]=et;c[b+6024>>2]=eu;c[b+6032>>2]=ev;c[b+6040>>2]=ew;c[b+6048>>2]=ex;c[b+6056>>2]=ey;c[b+6064>>2]=ez;c[b+6072>>2]=eA;c[b+6080>>2]=eB;c[b+6088>>2]=eC;c[b+6096>>2]=eD;c[b+6104>>2]=eE;c[b+6112>>2]=eF;c[b+6120>>2]=eG;c[b+6128>>2]=eH;c[b+6136>>2]=eI;c[b+6144>>2]=eJ;c[b+6152>>2]=eK;c[b+6160>>2]=eL;c[b+6168>>2]=eM;c[b+6176>>2]=eN;c[b+6184>>2]=eO;c[b+6192>>2]=eP;c[b+6200>>2]=eQ;c[b+6208>>2]=eR;c[b+6216>>2]=eS;c[b+6224>>2]=eT;c[b+6232>>2]=eU;c[b+6240>>2]=eV;c[b+6248>>2]=eW;c[b+6256>>2]=eX;c[b+6264>>2]=eY;c[b+6272>>2]=eZ;c[b+6280>>2]=e_;c[b+6288>>2]=e$;c[b+6296>>2]=e0;c[b+6904>>2]=f9;c[b+6912>>2]=ga;c[b+39768>>2]=gc;c[b+39776>>2]=gd;c[b+39800>>2]=0;c[b+39804>>2]=0;_read_input_xml$1(b);gc=c[b+39768>>2]|0;gd=c[b+39776>>2]|0;c[b+1904>>2]=d;c[b+1920>>2]=e;c[b+1928>>2]=f;c[b+1936>>2]=h;c[b+6304>>2]=e1;c[b+6312>>2]=e2;c[b+6320>>2]=e3;c[b+6328>>2]=e4;c[b+6336>>2]=e5;c[b+6344>>2]=e6;c[b+6352>>2]=e7;c[b+6360>>2]=e8;c[b+6368>>2]=e9;c[b+6376>>2]=fa;c[b+6384>>2]=fb;c[b+6392>>2]=fc;c[b+6400>>2]=fd;c[b+6408>>2]=fe;c[b+6416>>2]=ff;c[b+6424>>2]=fg;c[b+6432>>2]=fh;c[b+6440>>2]=fi;c[b+6448>>2]=fj;c[b+6456>>2]=fk;c[b+6464>>2]=fl;c[b+6472>>2]=fm;c[b+6480>>2]=fn;c[b+6488>>2]=fo;c[b+6496>>2]=fp;c[b+6504>>2]=fq;c[b+6512>>2]=fr;c[b+6520>>2]=fs;c[b+6528>>2]=ft;c[b+6536>>2]=fu;c[b+6544>>2]=fv;c[b+6552>>2]=fw;c[b+6560>>2]=fx;c[b+6568>>2]=fy;c[b+6576>>2]=fz;c[b+6584>>2]=fA;c[b+6592>>2]=fB;c[b+6600>>2]=fC;c[b+6608>>2]=fD;c[b+6616>>2]=fE;c[b+6624>>2]=fF;c[b+6632>>2]=fG;c[b+6640>>2]=fH;c[b+6648>>2]=fI;c[b+6656>>2]=fJ;c[b+6664>>2]=fK;c[b+6672>>2]=fL;c[b+6680>>2]=fM;c[b+6688>>2]=fN;c[b+6696>>2]=fO;c[b+6704>>2]=fP;c[b+6712>>2]=fQ;c[b+6720>>2]=fR;c[b+6728>>2]=fS;c[b+6736>>2]=fT;c[b+6744>>2]=fU;c[b+6752>>2]=fV;c[b+6760>>2]=fW;c[b+6768>>2]=fX;c[b+6776>>2]=fY;c[b+6784>>2]=fZ;c[b+6792>>2]=f_;c[b+6800>>2]=f$;c[b+6808>>2]=f0;c[b+6816>>2]=f1;c[b+6824>>2]=f2;c[b+6832>>2]=f3;c[b+6840>>2]=f4;c[b+6848>>2]=f5;c[b+6856>>2]=f6;c[b+6864>>2]=f7;c[b+6872>>2]=f8;c[b+6904>>2]=f9;c[b+6912>>2]=ga;c[b+7064>>2]=gb;c[b+39768>>2]=gc;c[b+39776>>2]=gd;c[b+39792>>2]=0;c[b+39796>>2]=0;_read_input_xml$0(b);gc=c[b+39768>>2]|0;gd=c[b+39776>>2]|0;I=c[b+39792>>2]|0;B=c[b+39796>>2]|0;J=+g[b+39796>>2];c[b+39792>>2]=0;c[b+39796>>2]=0;if((I|0)==5){c[b+39856>>2]=5;break OL}}while(0);c[b+39768>>2]=gc;c[b+39776>>2]=gd}function _read_input_xml$9(b){b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0;d=c[b+1912>>2]|0;e=c[b+2024>>2]|0;f=c[b+2032>>2]|0;g=c[b+2040>>2]|0;j=c[b+2048>>2]|0;k=c[b+2056>>2]|0;l=c[b+2064>>2]|0;m=c[b+2072>>2]|0;n=c[b+2080>>2]|0;o=c[b+2088>>2]|0;p=c[b+2096>>2]|0;q=c[b+2104>>2]|0;r=c[b+2112>>2]|0;s=c[b+2120>>2]|0;t=c[b+2128>>2]|0;u=c[b+2136>>2]|0;v=c[b+2144>>2]|0;w=c[b+2152>>2]|0;x=c[b+2160>>2]|0;y=c[b+2168>>2]|0;z=c[b+2176>>2]|0;A=c[b+2184>>2]|0;B=c[b+2192>>2]|0;C=c[b+2200>>2]|0;D=c[b+2208>>2]|0;E=c[b+2216>>2]|0;F=c[b+2224>>2]|0;G=c[b+2232>>2]|0;H=c[b+2240>>2]|0;I=c[b+2248>>2]|0;J=c[b+2256>>2]|0;K=c[b+2264>>2]|0;L=c[b+2272>>2]|0;M=c[b+2280>>2]|0;N=c[b+2288>>2]|0;O=c[b+2296>>2]|0;P=c[b+2304>>2]|0;Q=c[b+2312>>2]|0;R=c[b+2320>>2]|0;S=c[b+2328>>2]|0;T=c[b+6880>>2]|0;U=c[b+6888>>2]|0;V=c[b+6896>>2]|0;W=c[b+7272>>2]|0;X=c[b+7536>>2]|0;Y=c[b+7968>>2]|0;Z=c[b+10088>>2]|0;_=c[b+39776>>2]|0;if((a[Y]&1)!=0){tw(c[e+8>>2]|0)}if((a[f]&1)!=0){tw(c[f+8>>2]|0)}hA(20,0,46904,(_=i,i=i+8|0,h[_>>3]=+h[(d+24|0)>>3],_)|0);i=_;a[j]=18;tH(j+1|0,46312,9)|0;a[j+10|0]=0;f=kp(X,b+1560|0,j)|0;e=c[f>>2]|0;if((e|0)==0){Y=tu(40)|0;do{if((Y+16|0|0)!=0){if((a[j]&1)==0){c[(Y+16|0)>>2]=c[j>>2];c[(Y+16|0)+4>>2]=c[j+4>>2];c[(Y+16|0)+8>>2]=c[j+8>>2];break}$=c[j+8>>2]|0;aa=c[j+4>>2]|0;if(aa>>>0>4294967279>>>0){ml(0)}if(aa>>>0<11>>>0){a[Y+16|0]=aa<<1;ab=Y+17|0}else{ac=tu(aa+16&-16)|0;c[Y+24>>2]=ac;c[(Y+16|0)>>2]=aa+16&-16|1;c[Y+20>>2]=aa;ab=ac}tH(ab|0,$|0,aa)|0;a[ab+aa|0]=0}}while(0);if((Y+28|0|0)!=0){tI(Y+28|0|0,0,12)|0}ab=c[(b+1560|0)>>2]|0;c[Y>>2]=0;c[Y+4>>2]=0;c[Y+8>>2]=ab;c[f>>2]=Y;ab=c[c[(X|0)>>2]>>2]|0;if((ab|0)==0){ad=Y}else{c[(X|0)>>2]=ab;ad=c[f>>2]|0}jV(c[(b+1680|0)+16>>2]|0,ad);c[V>>2]=(c[V>>2]|0)+1;ae=Y}else{ae=e}e=ae+28|0;if((a[e]&1)==0){c[g>>2]=c[e>>2];c[g+4>>2]=c[e+4>>2];c[g+8>>2]=c[e+8>>2];af=g}else{e=c[ae+36>>2]|0;Y=c[ae+32>>2]|0;if(Y>>>0>4294967279>>>0){ml(0)}if(Y>>>0<11>>>0){a[g]=Y<<1;ag=g+1|0;ah=g}else{ae=tu(Y+16&-16)|0;c[g+8>>2]=ae;c[g>>2]=Y+16&-16|1;c[g+4>>2]=Y;ag=ae;ah=g}tH(ag|0,e|0,Y)|0;a[ag+Y|0]=0;af=ah}ka(g,d+32|0,1.0e-5);if((a[af]&1)!=0){tw(c[g+8>>2]|0)}if((a[j]&1)!=0){tw(c[j+8>>2]|0)}hA(20,0,45464,(_=i,i=i+8|0,h[_>>3]=+h[(d+32|0)>>3],_)|0);i=_;a[l]=12;a[l+1|0]=a[45048]|0;a[(l+1|0)+1|0]=a[45049]|0;a[(l+1|0)+2|0]=a[45050]|0;a[(l+1|0)+3|0]=a[45051]|0;a[(l+1|0)+4|0]=a[45052]|0;a[(l+1|0)+5|0]=a[45053]|0;a[l+7|0]=0;j=kp(X,b+1552|0,l)|0;g=c[j>>2]|0;if((g|0)==0){af=tu(40)|0;do{if((af+16|0|0)!=0){if((a[l]&1)==0){c[(af+16|0)>>2]=c[l>>2];c[(af+16|0)+4>>2]=c[l+4>>2];c[(af+16|0)+8>>2]=c[l+8>>2];break}ah=c[l+8>>2]|0;Y=c[l+4>>2]|0;if(Y>>>0>4294967279>>>0){ml(0)}if(Y>>>0<11>>>0){a[af+16|0]=Y<<1;ai=af+17|0}else{ag=tu(Y+16&-16)|0;c[af+24>>2]=ag;c[(af+16|0)>>2]=Y+16&-16|1;c[af+20>>2]=Y;ai=ag}tH(ai|0,ah|0,Y)|0;a[ai+Y|0]=0}}while(0);if((af+28|0|0)!=0){tI(af+28|0|0,0,12)|0}ai=c[(b+1552|0)>>2]|0;c[af>>2]=0;c[af+4>>2]=0;c[af+8>>2]=ai;c[j>>2]=af;ai=c[c[(X|0)>>2]>>2]|0;if((ai|0)==0){aj=af}else{c[(X|0)>>2]=ai;aj=c[j>>2]|0}jV(c[(b+1680|0)+16>>2]|0,aj);c[V>>2]=(c[V>>2]|0)+1;ak=af}else{ak=g}g=ak+28|0;if((a[g]&1)==0){c[k>>2]=c[g>>2];c[k+4>>2]=c[g+4>>2];c[k+8>>2]=c[g+8>>2]}else{g=c[ak+36>>2]|0;af=c[ak+32>>2]|0;if(af>>>0>4294967279>>>0){ml(0)}if(af>>>0<11>>>0){a[k]=af<<1;al=k+1|0}else{ak=tu(af+16&-16)|0;c[k+8>>2]=ak;c[k>>2]=af+16&-16|1;c[k+4>>2]=af;al=ak}tH(al|0,g|0,af)|0;a[al+af|0]=0}if((d+40|0|0)==0){hC(19,0,49832,(_=i,i=i+1|0,i=i+7&-8,c[_>>2]=0,_)|0);i=_;am=k}else{if((a[k]&1)==0){an=k+1|0}else{an=c[k+8>>2]|0}c[(d+40|0)>>2]=cj(an|0)|0;am=k}if((a[am]&1)!=0){tw(c[k+8>>2]|0)}if((a[l]&1)!=0){tw(c[l+8>>2]|0)}hA(20,0,44576,(_=i,i=i+8|0,c[_>>2]=c[(d+40|0)>>2],_)|0);i=_;l=tu(16)|0;c[(n+8|0)>>2]=l;c[n>>2]=17;c[(n+4|0)>>2]=12;tH(l|0,44040,12)|0;a[l+12|0]=0;l=kp(X,b+1544|0,n)|0;k=c[l>>2]|0;if((k|0)==0){am=tu(40)|0;do{if((am+16|0|0)!=0){if((a[n]&1)==0){c[(am+16|0)>>2]=c[n>>2];c[(am+16|0)+4>>2]=c[n+4>>2];c[(am+16|0)+8>>2]=c[n+8>>2];break}an=c[(n+8|0)>>2]|0;af=c[(n+4|0)>>2]|0;if(af>>>0>4294967279>>>0){ml(0)}if(af>>>0<11>>>0){a[am+16|0]=af<<1;ao=am+17|0}else{al=tu(af+16&-16)|0;c[am+24>>2]=al;c[(am+16|0)>>2]=af+16&-16|1;c[am+20>>2]=af;ao=al}tH(ao|0,an|0,af)|0;a[ao+af|0]=0}}while(0);if((am+28|0|0)!=0){tI(am+28|0|0,0,12)|0}ao=c[(b+1544|0)>>2]|0;c[am>>2]=0;c[am+4>>2]=0;c[am+8>>2]=ao;c[l>>2]=am;ao=c[c[(X|0)>>2]>>2]|0;if((ao|0)==0){ap=am}else{c[(X|0)>>2]=ao;ap=c[l>>2]|0}jV(c[(b+1680|0)+16>>2]|0,ap);c[V>>2]=(c[V>>2]|0)+1;aq=am}else{aq=k}k=aq+28|0;if((a[k]&1)==0){c[m>>2]=c[k>>2];c[m+4>>2]=c[k+4>>2];c[m+8>>2]=c[k+8>>2]}else{k=c[aq+36>>2]|0;am=c[aq+32>>2]|0;if(am>>>0>4294967279>>>0){ml(0)}if(am>>>0<11>>>0){a[m]=am<<1;ar=m+1|0}else{aq=tu(am+16&-16)|0;c[m+8>>2]=aq;c[m>>2]=am+16&-16|1;c[m+4>>2]=am;ar=aq}tH(ar|0,k|0,am)|0;a[ar+am|0]=0}if((d+44|0|0)==0){hC(19,0,49832,(_=i,i=i+1|0,i=i+7&-8,c[_>>2]=0,_)|0);i=_;as=m}else{if((a[m]&1)==0){at=m+1|0}else{at=c[m+8>>2]|0}c[(d+44|0)>>2]=cj(at|0)|0;as=m}if((a[as]&1)!=0){tw(c[m+8>>2]|0)}if((a[n]&1)!=0){tw(c[(n+8|0)>>2]|0)}hA(20,0,43376,(_=i,i=i+8|0,c[_>>2]=c[(d+44|0)>>2],_)|0);i=_;n=tu(16)|0;c[(p+8|0)>>2]=n;c[p>>2]=17;c[(p+4|0)>>2]=14;tH(n|0,42656,14)|0;a[n+14|0]=0;n=kp(X,b+1536|0,p)|0;m=c[n>>2]|0;if((m|0)==0){as=tu(40)|0;do{if((as+16|0|0)!=0){if((a[p]&1)==0){c[(as+16|0)>>2]=c[p>>2];c[(as+16|0)+4>>2]=c[p+4>>2];c[(as+16|0)+8>>2]=c[p+8>>2];break}at=c[(p+8|0)>>2]|0;am=c[(p+4|0)>>2]|0;if(am>>>0>4294967279>>>0){ml(0)}if(am>>>0<11>>>0){a[as+16|0]=am<<1;au=as+17|0}else{ar=tu(am+16&-16)|0;c[as+24>>2]=ar;c[(as+16|0)>>2]=am+16&-16|1;c[as+20>>2]=am;au=ar}tH(au|0,at|0,am)|0;a[au+am|0]=0}}while(0);if((as+28|0|0)!=0){tI(as+28|0|0,0,12)|0}au=c[(b+1536|0)>>2]|0;c[as>>2]=0;c[as+4>>2]=0;c[as+8>>2]=au;c[n>>2]=as;au=c[c[(X|0)>>2]>>2]|0;if((au|0)==0){av=as}else{c[(X|0)>>2]=au;av=c[n>>2]|0}jV(c[(b+1680|0)+16>>2]|0,av);c[V>>2]=(c[V>>2]|0)+1;aw=as}else{aw=m}m=aw+28|0;if((a[m]&1)==0){c[o>>2]=c[m>>2];c[o+4>>2]=c[m+4>>2];c[o+8>>2]=c[m+8>>2]}else{m=c[aw+36>>2]|0;as=c[aw+32>>2]|0;if(as>>>0>4294967279>>>0){ml(0)}if(as>>>0<11>>>0){a[o]=as<<1;ax=o+1|0}else{aw=tu(as+16&-16)|0;c[o+8>>2]=aw;c[o>>2]=as+16&-16|1;c[o+4>>2]=as;ax=aw}tH(ax|0,m|0,as)|0;a[ax+as|0]=0}if((d+48|0|0)==0){hC(19,0,49832,(_=i,i=i+1|0,i=i+7&-8,c[_>>2]=0,_)|0);i=_;ay=o}else{if((a[o]&1)==0){az=o+1|0}else{az=c[o+8>>2]|0}c[(d+48|0)>>2]=cj(az|0)|0;ay=o}if((a[ay]&1)!=0){tw(c[o+8>>2]|0)}if((a[p]&1)!=0){tw(c[(p+8|0)>>2]|0)}hA(20,0,42128,(_=i,i=i+8|0,c[_>>2]=c[(d+48|0)>>2],_)|0);i=_;p=tu(32)|0;c[(r+8|0)>>2]=p;c[r>>2]=33;c[(r+4|0)>>2]=16;tH(p|0,41616,16)|0;a[p+16|0]=0;p=kp(W,b+1528|0,r)|0;o=c[p>>2]|0;if((o|0)==0){ay=tu(40)|0;do{if((ay+16|0|0)!=0){if((a[r]&1)==0){c[(ay+16|0)>>2]=c[r>>2];c[(ay+16|0)+4>>2]=c[r+4>>2];c[(ay+16|0)+8>>2]=c[r+8>>2];break}az=c[(r+8|0)>>2]|0;as=c[(r+4|0)>>2]|0;if(as>>>0>4294967279>>>0){ml(0)}if(as>>>0<11>>>0){a[ay+16|0]=as<<1;aA=ay+17|0}else{ax=tu(as+16&-16)|0;c[ay+24>>2]=ax;c[(ay+16|0)>>2]=as+16&-16|1;c[ay+20>>2]=as;aA=ax}tH(aA|0,az|0,as)|0;a[aA+as|0]=0}}while(0);if((ay+28|0|0)!=0){tI(ay+28|0|0,0,12)|0}aA=c[(b+1528|0)>>2]|0;c[ay>>2]=0;c[ay+4>>2]=0;c[ay+8>>2]=aA;c[p>>2]=ay;aA=c[c[U>>2]>>2]|0;if((aA|0)==0){aB=ay}else{c[U>>2]=aA;aB=c[p>>2]|0}jV(c[(b+1680|0)+4>>2]|0,aB);c[T>>2]=(c[T>>2]|0)+1;aC=ay}else{aC=o}o=aC+28|0;if((a[o]&1)==0){c[q>>2]=c[o>>2];c[q+4>>2]=c[o+4>>2];c[q+8>>2]=c[o+8>>2]}else{o=c[aC+36>>2]|0;ay=c[aC+32>>2]|0;if(ay>>>0>4294967279>>>0){ml(0)}if(ay>>>0<11>>>0){a[q]=ay<<1;aD=q+1|0}else{aC=tu(ay+16&-16)|0;c[q+8>>2]=aC;c[q>>2]=ay+16&-16|1;c[q+4>>2]=ay;aD=aC}tH(aD|0,o|0,ay)|0;a[aD+ay|0]=0}if((d+244|0|0)==0){hC(19,0,49832,(_=i,i=i+1|0,i=i+7&-8,c[_>>2]=0,_)|0);i=_;aE=q}else{if((a[q]&1)==0){aF=q+1|0}else{aF=c[q+8>>2]|0}c[(d+244|0)>>2]=cj(aF|0)|0;aE=q}if((a[aE]&1)!=0){tw(c[q+8>>2]|0)}if((a[r]&1)!=0){tw(c[(r+8|0)>>2]|0)}hA(20,0,41080,(_=i,i=i+8|0,c[_>>2]=c[(d+244|0)>>2],_)|0);i=_;if((c[17816]|0)!=0){dd[c[3504]&511](20)}d=tu(32)|0;c[(C+8|0)>>2]=d;c[C>>2]=33;c[(C+4|0)>>2]=24;tH(d|0,40584,24)|0;a[d+24|0]=0;d=kp(W,b+1520|0,C)|0;r=c[d>>2]|0;if((r|0)==0){q=tu(40)|0;do{if((q+16|0|0)!=0){if((a[C]&1)==0){c[(q+16|0)>>2]=c[C>>2];c[(q+16|0)+4>>2]=c[C+4>>2];c[(q+16|0)+8>>2]=c[C+8>>2];break}aE=c[(C+8|0)>>2]|0;aF=c[(C+4|0)>>2]|0;if(aF>>>0>4294967279>>>0){ml(0)}if(aF>>>0<11>>>0){a[q+16|0]=aF<<1;aG=q+17|0}else{ay=tu(aF+16&-16)|0;c[q+24>>2]=ay;c[(q+16|0)>>2]=aF+16&-16|1;c[q+20>>2]=aF;aG=ay}tH(aG|0,aE|0,aF)|0;a[aG+aF|0]=0}}while(0);if((q+28|0|0)!=0){tI(q+28|0|0,0,12)|0}aG=c[(b+1520|0)>>2]|0;c[q>>2]=0;c[q+4>>2]=0;c[q+8>>2]=aG;c[d>>2]=q;aG=c[c[U>>2]>>2]|0;if((aG|0)==0){aH=q}else{c[U>>2]=aG;aH=c[d>>2]|0}jV(c[(b+1680|0)+4>>2]|0,aH);c[T>>2]=(c[T>>2]|0)+1;aI=q}else{aI=r}r=aI+28|0;if((a[r]&1)==0){c[B>>2]=c[r>>2];c[B+4>>2]=c[r+4>>2];c[B+8>>2]=c[r+8>>2];aJ=B}else{r=c[aI+36>>2]|0;q=c[aI+32>>2]|0;if(q>>>0>4294967279>>>0){ml(0)}if(q>>>0<11>>>0){a[B]=q<<1;aK=B+1|0;aL=B}else{aI=tu(q+16&-16)|0;c[B+8>>2]=aI;c[B>>2]=q+16&-16|1;c[B+4>>2]=q;aK=aI;aL=B}tH(aK|0,r|0,q)|0;a[aK+q|0]=0;aJ=aL}kb(B,s,0);if((a[aJ]&1)!=0){tw(c[B+8>>2]|0)}if((a[C]&1)!=0){tw(c[(C+8|0)>>2]|0)}C=tu(32)|0;c[(E+8|0)>>2]=C;c[E>>2]=33;c[(E+4|0)>>2]=30;tH(C|0,39512,30)|0;a[C+30|0]=0;C=kp(W,b+1512|0,E)|0;B=c[C>>2]|0;if((B|0)==0){aJ=tu(40)|0;do{if((aJ+16|0|0)!=0){if((a[E]&1)==0){c[(aJ+16|0)>>2]=c[E>>2];c[(aJ+16|0)+4>>2]=c[E+4>>2];c[(aJ+16|0)+8>>2]=c[E+8>>2];break}aL=c[(E+8|0)>>2]|0;q=c[(E+4|0)>>2]|0;if(q>>>0>4294967279>>>0){ml(0)}if(q>>>0<11>>>0){a[aJ+16|0]=q<<1;aM=aJ+17|0}else{aK=tu(q+16&-16)|0;c[aJ+24>>2]=aK;c[(aJ+16|0)>>2]=q+16&-16|1;c[aJ+20>>2]=q;aM=aK}tH(aM|0,aL|0,q)|0;a[aM+q|0]=0}}while(0);if((aJ+28|0|0)!=0){tI(aJ+28|0|0,0,12)|0}aM=c[(b+1512|0)>>2]|0;c[aJ>>2]=0;c[aJ+4>>2]=0;c[aJ+8>>2]=aM;c[C>>2]=aJ;aM=c[c[U>>2]>>2]|0;if((aM|0)==0){aN=aJ}else{c[U>>2]=aM;aN=c[C>>2]|0}jV(c[(b+1680|0)+4>>2]|0,aN);c[T>>2]=(c[T>>2]|0)+1;aO=aJ}else{aO=B}B=aO+28|0;if((a[B]&1)==0){c[D>>2]=c[B>>2];c[D+4>>2]=c[B+4>>2];c[D+8>>2]=c[B+8>>2];aP=D}else{B=c[aO+36>>2]|0;aJ=c[aO+32>>2]|0;if(aJ>>>0>4294967279>>>0){ml(0)}if(aJ>>>0<11>>>0){a[D]=aJ<<1;aQ=D+1|0;aR=D}else{aO=tu(aJ+16&-16)|0;c[D+8>>2]=aO;c[D>>2]=aJ+16&-16|1;c[D+4>>2]=aJ;aQ=aO;aR=D}tH(aQ|0,B|0,aJ)|0;a[aQ+aJ|0]=0;aP=aR}kb(D,t,0);if((a[aP]&1)!=0){tw(c[D+8>>2]|0)}if((a[E]&1)!=0){tw(c[(E+8|0)>>2]|0)}E=tu(32)|0;c[(G+8|0)>>2]=E;c[G>>2]=33;c[(G+4|0)>>2]=22;tH(E|0,39048,22)|0;a[E+22|0]=0;E=kp(W,b+1504|0,G)|0;D=c[E>>2]|0;if((D|0)==0){aP=tu(40)|0;do{if((aP+16|0|0)!=0){if((a[G]&1)==0){c[(aP+16|0)>>2]=c[G>>2];c[(aP+16|0)+4>>2]=c[G+4>>2];c[(aP+16|0)+8>>2]=c[G+8>>2];break}t=c[(G+8|0)>>2]|0;aR=c[(G+4|0)>>2]|0;if(aR>>>0>4294967279>>>0){ml(0)}if(aR>>>0<11>>>0){a[aP+16|0]=aR<<1;aS=aP+17|0}else{aJ=tu(aR+16&-16)|0;c[aP+24>>2]=aJ;c[(aP+16|0)>>2]=aR+16&-16|1;c[aP+20>>2]=aR;aS=aJ}tH(aS|0,t|0,aR)|0;a[aS+aR|0]=0}}while(0);if((aP+28|0|0)!=0){tI(aP+28|0|0,0,12)|0}aS=c[(b+1504|0)>>2]|0;c[aP>>2]=0;c[aP+4>>2]=0;c[aP+8>>2]=aS;c[E>>2]=aP;aS=c[c[U>>2]>>2]|0;if((aS|0)==0){aT=aP}else{c[U>>2]=aS;aT=c[E>>2]|0}jV(c[(b+1680|0)+4>>2]|0,aT);c[T>>2]=(c[T>>2]|0)+1;aU=aP}else{aU=D}D=aU+28|0;if((a[D]&1)==0){c[F>>2]=c[D>>2];c[F+4>>2]=c[D+4>>2];c[F+8>>2]=c[D+8>>2];aV=F}else{D=c[aU+36>>2]|0;aP=c[aU+32>>2]|0;if(aP>>>0>4294967279>>>0){ml(0)}if(aP>>>0<11>>>0){a[F]=aP<<1;aW=F+1|0;aX=F}else{aU=tu(aP+16&-16)|0;c[F+8>>2]=aU;c[F>>2]=aP+16&-16|1;c[F+4>>2]=aP;aW=aU;aX=F}tH(aW|0,D|0,aP)|0;a[aW+aP|0]=0;aV=aX}kb(F,u,0);if((a[aV]&1)!=0){tw(c[F+8>>2]|0)}if((a[G]&1)!=0){tw(c[(G+8|0)>>2]|0)}G=tu(32)|0;c[(I+8|0)>>2]=G;c[I>>2]=33;c[(I+4|0)>>2]=25;tH(G|0,38440,25)|0;a[G+25|0]=0;G=kp(W,b+1496|0,I)|0;F=c[G>>2]|0;if((F|0)==0){aV=tu(40)|0;do{if((aV+16|0|0)!=0){if((a[I]&1)==0){c[(aV+16|0)>>2]=c[I>>2];c[(aV+16|0)+4>>2]=c[I+4>>2];c[(aV+16|0)+8>>2]=c[I+8>>2];break}u=c[(I+8|0)>>2]|0;aX=c[(I+4|0)>>2]|0;if(aX>>>0>4294967279>>>0){ml(0)}if(aX>>>0<11>>>0){a[aV+16|0]=aX<<1;aY=aV+17|0}else{aP=tu(aX+16&-16)|0;c[aV+24>>2]=aP;c[(aV+16|0)>>2]=aX+16&-16|1;c[aV+20>>2]=aX;aY=aP}tH(aY|0,u|0,aX)|0;a[aY+aX|0]=0}}while(0);if((aV+28|0|0)!=0){tI(aV+28|0|0,0,12)|0}aY=c[(b+1496|0)>>2]|0;c[aV>>2]=0;c[aV+4>>2]=0;c[aV+8>>2]=aY;c[G>>2]=aV;aY=c[c[U>>2]>>2]|0;if((aY|0)==0){aZ=aV}else{c[U>>2]=aY;aZ=c[G>>2]|0}jV(c[(b+1680|0)+4>>2]|0,aZ);c[T>>2]=(c[T>>2]|0)+1;a_=aV}else{a_=F}F=a_+28|0;if((a[F]&1)==0){c[H>>2]=c[F>>2];c[H+4>>2]=c[F+4>>2];c[H+8>>2]=c[F+8>>2];a$=H}else{F=c[a_+36>>2]|0;aV=c[a_+32>>2]|0;if(aV>>>0>4294967279>>>0){ml(0)}if(aV>>>0<11>>>0){a[H]=aV<<1;a0=H+1|0;a1=H}else{a_=tu(aV+16&-16)|0;c[H+8>>2]=a_;c[H>>2]=aV+16&-16|1;c[H+4>>2]=aV;a0=a_;a1=H}tH(a0|0,F|0,aV)|0;a[a0+aV|0]=0;a$=a1}kb(H,w,0);if((a[a$]&1)!=0){tw(c[H+8>>2]|0)}if((a[I]&1)!=0){tw(c[(I+8|0)>>2]|0)}I=tu(48)|0;c[(K+8|0)>>2]=I;c[K>>2]=49;c[(K+4|0)>>2]=33;tH(I|0,37944,33)|0;a[I+33|0]=0;I=kp(W,b+1488|0,K)|0;H=c[I>>2]|0;if((H|0)==0){a$=tu(40)|0;do{if((a$+16|0|0)!=0){if((a[K]&1)==0){c[(a$+16|0)>>2]=c[K>>2];c[(a$+16|0)+4>>2]=c[K+4>>2];c[(a$+16|0)+8>>2]=c[K+8>>2];break}w=c[(K+8|0)>>2]|0;a1=c[(K+4|0)>>2]|0;if(a1>>>0>4294967279>>>0){ml(0)}if(a1>>>0<11>>>0){a[a$+16|0]=a1<<1;a2=a$+17|0}else{aV=tu(a1+16&-16)|0;c[a$+24>>2]=aV;c[(a$+16|0)>>2]=a1+16&-16|1;c[a$+20>>2]=a1;a2=aV}tH(a2|0,w|0,a1)|0;a[a2+a1|0]=0}}while(0);if((a$+28|0|0)!=0){tI(a$+28|0|0,0,12)|0}a2=c[(b+1488|0)>>2]|0;c[a$>>2]=0;c[a$+4>>2]=0;c[a$+8>>2]=a2;c[I>>2]=a$;a2=c[c[U>>2]>>2]|0;if((a2|0)==0){a3=a$}else{c[U>>2]=a2;a3=c[I>>2]|0}jV(c[(b+1680|0)+4>>2]|0,a3);c[T>>2]=(c[T>>2]|0)+1;a4=a$}else{a4=H}H=a4+28|0;if((a[H]&1)==0){c[J>>2]=c[H>>2];c[J+4>>2]=c[H+4>>2];c[J+8>>2]=c[H+8>>2];a5=J}else{H=c[a4+36>>2]|0;a$=c[a4+32>>2]|0;if(a$>>>0>4294967279>>>0){ml(0)}if(a$>>>0<11>>>0){a[J]=a$<<1;a6=J+1|0;a7=J}else{a4=tu(a$+16&-16)|0;c[J+8>>2]=a4;c[J>>2]=a$+16&-16|1;c[J+4>>2]=a$;a6=a4;a7=J}tH(a6|0,H|0,a$)|0;a[a6+a$|0]=0;a5=a7}kb(J,v,0);if((a[a5]&1)!=0){tw(c[J+8>>2]|0)}if((a[K]&1)!=0){tw(c[(K+8|0)>>2]|0)}K=tu(32)|0;c[(M+8|0)>>2]=K;c[M>>2]=33;c[(M+4|0)>>2]=25;tH(K|0,37432,25)|0;a[K+25|0]=0;K=kp(W,b+1480|0,M)|0;J=c[K>>2]|0;if((J|0)==0){a5=tu(40)|0;do{if((a5+16|0|0)!=0){if((a[M]&1)==0){c[(a5+16|0)>>2]=c[M>>2];c[(a5+16|0)+4>>2]=c[M+4>>2];c[(a5+16|0)+8>>2]=c[M+8>>2];break}v=c[(M+8|0)>>2]|0;a7=c[(M+4|0)>>2]|0;if(a7>>>0>4294967279>>>0){ml(0)}if(a7>>>0<11>>>0){a[a5+16|0]=a7<<1;a8=a5+17|0}else{a$=tu(a7+16&-16)|0;c[a5+24>>2]=a$;c[(a5+16|0)>>2]=a7+16&-16|1;c[a5+20>>2]=a7;a8=a$}tH(a8|0,v|0,a7)|0;a[a8+a7|0]=0}}while(0);if((a5+28|0|0)!=0){tI(a5+28|0|0,0,12)|0}a8=c[(b+1480|0)>>2]|0;c[a5>>2]=0;c[a5+4>>2]=0;c[a5+8>>2]=a8;c[K>>2]=a5;a8=c[c[U>>2]>>2]|0;if((a8|0)==0){a9=a5}else{c[U>>2]=a8;a9=c[K>>2]|0}jV(c[(b+1680|0)+4>>2]|0,a9);c[T>>2]=(c[T>>2]|0)+1;ba=a5}else{ba=J}J=ba+28|0;if((a[J]&1)==0){c[L>>2]=c[J>>2];c[L+4>>2]=c[J+4>>2];c[L+8>>2]=c[J+8>>2];bb=L}else{J=c[ba+36>>2]|0;a5=c[ba+32>>2]|0;if(a5>>>0>4294967279>>>0){ml(0)}if(a5>>>0<11>>>0){a[L]=a5<<1;bc=L+1|0;bd=L}else{ba=tu(a5+16&-16)|0;c[L+8>>2]=ba;c[L>>2]=a5+16&-16|1;c[L+4>>2]=a5;bc=ba;bd=L}tH(bc|0,J|0,a5)|0;a[bc+a5|0]=0;bb=bd}kb(L,y,0);if((a[bb]&1)!=0){tw(c[L+8>>2]|0)}if((a[M]&1)!=0){tw(c[(M+8|0)>>2]|0)}M=tu(48)|0;c[(O+8|0)>>2]=M;c[O>>2]=49;c[(O+4|0)>>2]=33;tH(M|0,37016,33)|0;a[M+33|0]=0;M=kp(W,b+1472|0,O)|0;L=c[M>>2]|0;if((L|0)==0){bb=tu(40)|0;do{if((bb+16|0|0)!=0){if((a[O]&1)==0){c[(bb+16|0)>>2]=c[O>>2];c[(bb+16|0)+4>>2]=c[O+4>>2];c[(bb+16|0)+8>>2]=c[O+8>>2];break}y=c[(O+8|0)>>2]|0;bd=c[(O+4|0)>>2]|0;if(bd>>>0>4294967279>>>0){ml(0)}if(bd>>>0<11>>>0){a[bb+16|0]=bd<<1;be=bb+17|0}else{a5=tu(bd+16&-16)|0;c[bb+24>>2]=a5;c[(bb+16|0)>>2]=bd+16&-16|1;c[bb+20>>2]=bd;be=a5}tH(be|0,y|0,bd)|0;a[be+bd|0]=0}}while(0);if((bb+28|0|0)!=0){tI(bb+28|0|0,0,12)|0}be=c[(b+1472|0)>>2]|0;c[bb>>2]=0;c[bb+4>>2]=0;c[bb+8>>2]=be;c[M>>2]=bb;be=c[c[U>>2]>>2]|0;if((be|0)==0){bf=bb}else{c[U>>2]=be;bf=c[M>>2]|0}jV(c[(b+1680|0)+4>>2]|0,bf);c[T>>2]=(c[T>>2]|0)+1;bg=bb}else{bg=L}L=bg+28|0;if((a[L]&1)==0){c[N>>2]=c[L>>2];c[N+4>>2]=c[L+4>>2];c[N+8>>2]=c[L+8>>2];bh=N}else{L=c[bg+36>>2]|0;bb=c[bg+32>>2]|0;if(bb>>>0>4294967279>>>0){ml(0)}if(bb>>>0<11>>>0){a[N]=bb<<1;bi=N+1|0;bj=N}else{bg=tu(bb+16&-16)|0;c[N+8>>2]=bg;c[N>>2]=bb+16&-16|1;c[N+4>>2]=bb;bi=bg;bj=N}tH(bi|0,L|0,bb)|0;a[bi+bb|0]=0;bh=bj}kb(N,x,0);if((a[bh]&1)!=0){tw(c[N+8>>2]|0)}if((a[O]&1)!=0){tw(c[(O+8|0)>>2]|0)}O=tu(32)|0;c[(Q+8|0)>>2]=O;c[Q>>2]=33;c[(Q+4|0)>>2]=24;tH(O|0,36480,24)|0;a[O+24|0]=0;O=kp(W,b+1464|0,Q)|0;N=c[O>>2]|0;if((N|0)==0){bh=tu(40)|0;do{if((bh+16|0|0)!=0){if((a[Q]&1)==0){c[(bh+16|0)>>2]=c[Q>>2];c[(bh+16|0)+4>>2]=c[Q+4>>2];c[(bh+16|0)+8>>2]=c[Q+8>>2];break}x=c[(Q+8|0)>>2]|0;bj=c[(Q+4|0)>>2]|0;if(bj>>>0>4294967279>>>0){ml(0)}if(bj>>>0<11>>>0){a[bh+16|0]=bj<<1;bk=bh+17|0}else{bb=tu(bj+16&-16)|0;c[bh+24>>2]=bb;c[(bh+16|0)>>2]=bj+16&-16|1;c[bh+20>>2]=bj;bk=bb}tH(bk|0,x|0,bj)|0;a[bk+bj|0]=0}}while(0);if((bh+28|0|0)!=0){tI(bh+28|0|0,0,12)|0}bk=c[(b+1464|0)>>2]|0;c[bh>>2]=0;c[bh+4>>2]=0;c[bh+8>>2]=bk;c[O>>2]=bh;bk=c[c[U>>2]>>2]|0;if((bk|0)==0){bl=bh}else{c[U>>2]=bk;bl=c[O>>2]|0}jV(c[(b+1680|0)+4>>2]|0,bl);c[T>>2]=(c[T>>2]|0)+1;bm=bh}else{bm=N}N=bm+28|0;if((a[N]&1)==0){c[P>>2]=c[N>>2];c[P+4>>2]=c[N+4>>2];c[P+8>>2]=c[N+8>>2];bn=P}else{N=c[bm+36>>2]|0;bh=c[bm+32>>2]|0;if(bh>>>0>4294967279>>>0){ml(0)}if(bh>>>0<11>>>0){a[P]=bh<<1;bo=P+1|0;bp=P}else{bm=tu(bh+16&-16)|0;c[P+8>>2]=bm;c[P>>2]=bh+16&-16|1;c[P+4>>2]=bh;bo=bm;bp=P}tH(bo|0,N|0,bh)|0;a[bo+bh|0]=0;bn=bp}kb(P,A,0);if((a[bn]&1)!=0){tw(c[P+8>>2]|0)}if((a[Q]&1)!=0){tw(c[(Q+8|0)>>2]|0)}Q=tu(48)|0;c[(S+8|0)>>2]=Q;c[S>>2]=49;c[(S+4|0)>>2]=32;tH(Q|0,36112,32)|0;a[Q+32|0]=0;Q=kp(W,b+1456|0,S)|0;W=c[Q>>2]|0;if((W|0)==0){P=tu(40)|0;do{if((P+16|0|0)!=0){if((a[S]&1)==0){c[(P+16|0)>>2]=c[S>>2];c[(P+16|0)+4>>2]=c[S+4>>2];c[(P+16|0)+8>>2]=c[S+8>>2];break}bn=c[(S+8|0)>>2]|0;A=c[(S+4|0)>>2]|0;if(A>>>0>4294967279>>>0){ml(0)}if(A>>>0<11>>>0){a[P+16|0]=A<<1;bq=P+17|0}else{bp=tu(A+16&-16)|0;c[P+24>>2]=bp;c[(P+16|0)>>2]=A+16&-16|1;c[P+20>>2]=A;bq=bp}tH(bq|0,bn|0,A)|0;a[bq+A|0]=0}}while(0);if((P+28|0|0)!=0){tI(P+28|0|0,0,12)|0}bq=c[(b+1456|0)>>2]|0;c[P>>2]=0;c[P+4>>2]=0;c[P+8>>2]=bq;c[Q>>2]=P;bq=c[c[U>>2]>>2]|0;if((bq|0)==0){br=P}else{c[U>>2]=bq;br=c[Q>>2]|0}jV(c[(b+1680|0)+4>>2]|0,br);c[T>>2]=(c[T>>2]|0)+1;bs=P}else{bs=W}W=bs+28|0;if((a[W]&1)==0){c[R>>2]=c[W>>2];c[R+4>>2]=c[W+4>>2];c[R+8>>2]=c[W+8>>2];bt=R}else{W=c[bs+36>>2]|0;P=c[bs+32>>2]|0;if(P>>>0>4294967279>>>0){ml(0)}if(P>>>0<11>>>0){a[R]=P<<1;bu=R+1|0;bv=R}else{bs=tu(P+16&-16)|0;c[R+8>>2]=bs;c[R>>2]=P+16&-16|1;c[R+4>>2]=P;bu=bs;bv=R}tH(bu|0,W|0,P)|0;a[bu+P|0]=0;bt=bv}kb(R,z,0);if((a[bt]&1)!=0){tw(c[R+8>>2]|0)}if((a[S]&1)!=0){tw(c[(S+8|0)>>2]|0)}Z=c[s>>2]|0;c[b+10088>>2]=Z;c[b+39776>>2]=_}function _read_input_xml$10(b){b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0,bP=0,bQ=0,bR=0,bS=0,bT=0,bU=0,bV=0,bW=0,bX=0,bY=0,bZ=0,b_=0,b$=0,b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,b7=0,b8=0,b9=0,cb=0,cc=0,cd=0,ce=0,cf=0,cg=0,ch=0,ci=0,cj=0,ck=0,cl=0,cm=0,cn=0,co=0,cp=0,cq=0,cr=0,cs=0,ct=0,cu=0,cv=0,cw=0,cx=0,cy=0,cz=0,cA=0,cB=0,cC=0,cD=0,cE=0,cF=0,cG=0,cH=0,cI=0,cK=0,cL=0,cN=0,cO=0,cP=0,cQ=0,cR=0,cS=0,cT=0,cU=0,cV=0,cW=0,cX=0,cY=0,cZ=0,c_=0,c$=0,c0=0,c1=0,c2=0,c3=0,c4=0,c5=0,c6=0,c7=0,c8=0,c9=0,da=0,db=0,dc=0,dd=0,de=0,df=0,dg=0,dh=0,di=0,dj=0,dk=0,dl=0,dm=0,dn=0,dp=0,dq=0,dr=0,ds=0,dt=0,du=0,dv=0,dw=0,dx=0,dy=0,dA=0,dB=0,dC=0,dD=0,dE=0,dF=0,dG=0,dH=0,dI=0,dJ=0,dK=0,dL=0,dM=0,dN=0,dO=0,dP=0,dQ=0,dR=0,dS=0,dT=0,dU=0,dV=0,dW=0,dX=0,dY=0,dZ=0,d_=0,d$=0,d0=0,d1=0,d2=0,d3=0,d4=0,d5=0,d6=0,d7=0,d8=0,d9=0,ea=0,eb=0,ec=0,ed=0,ee=0,ef=0,eg=0,eh=0,ei=0,ej=0,ek=0,el=0,em=0,en=0,eo=0,ep=0,eq=0,er=0,es=0,et=0,eu=0,ev=0,ew=0,ex=0,ey=0,ez=0,eA=0,eB=0,eC=0,eD=0,eE=0,eF=0,eH=0,eI=0,eL=0,eM=0,eN=0,eO=0;d=c[b+1904>>2]|0;e=c[b+1912>>2]|0;f=c[b+1920>>2]|0;g=c[b+1928>>2]|0;j=c[b+1936>>2]|0;k=c[b+1944>>2]|0;l=c[b+1952>>2]|0;m=c[b+1960>>2]|0;n=c[b+1968>>2]|0;o=c[b+1976>>2]|0;p=c[b+1984>>2]|0;q=c[b+1992>>2]|0;r=c[b+2e3>>2]|0;s=c[b+2008>>2]|0;t=c[b+2016>>2]|0;v=c[b+2024>>2]|0;w=c[b+2032>>2]|0;x=c[b+4760>>2]|0;y=c[b+4768>>2]|0;z=c[b+4776>>2]|0;A=c[b+4784>>2]|0;B=c[b+4792>>2]|0;D=c[b+4800>>2]|0;E=c[b+4808>>2]|0;F=c[b+4816>>2]|0;G=c[b+4824>>2]|0;H=c[b+4832>>2]|0;I=c[b+4840>>2]|0;J=c[b+4848>>2]|0;K=c[b+4856>>2]|0;L=c[b+4864>>2]|0;M=c[b+4872>>2]|0;N=c[b+4880>>2]|0;O=c[b+4888>>2]|0;P=c[b+4896>>2]|0;Q=c[b+4904>>2]|0;R=c[b+4912>>2]|0;S=c[b+4920>>2]|0;T=c[b+4928>>2]|0;U=c[b+4936>>2]|0;V=c[b+4944>>2]|0;W=c[b+4952>>2]|0;X=c[b+4960>>2]|0;Y=c[b+4968>>2]|0;Z=c[b+4976>>2]|0;_=c[b+4984>>2]|0;$=c[b+4992>>2]|0;aa=c[b+5e3>>2]|0;ab=c[b+5008>>2]|0;ac=c[b+5016>>2]|0;ad=c[b+5024>>2]|0;ae=c[b+5032>>2]|0;af=c[b+5040>>2]|0;ag=c[b+5048>>2]|0;ah=c[b+5056>>2]|0;ai=c[b+5064>>2]|0;aj=c[b+5072>>2]|0;ak=c[b+5080>>2]|0;al=c[b+5088>>2]|0;am=c[b+5096>>2]|0;an=c[b+5104>>2]|0;ao=c[b+5112>>2]|0;ap=c[b+5120>>2]|0;aq=c[b+5128>>2]|0;ar=c[b+5136>>2]|0;as=c[b+5144>>2]|0;at=c[b+5152>>2]|0;au=c[b+5160>>2]|0;av=c[b+5168>>2]|0;aw=c[b+5176>>2]|0;ax=c[b+5184>>2]|0;ay=c[b+5192>>2]|0;az=c[b+5200>>2]|0;aA=c[b+5208>>2]|0;aB=c[b+5216>>2]|0;aC=c[b+5224>>2]|0;aD=c[b+5232>>2]|0;aE=c[b+5240>>2]|0;aF=c[b+5248>>2]|0;aG=c[b+5256>>2]|0;aH=c[b+5264>>2]|0;aI=c[b+5272>>2]|0;aJ=c[b+5280>>2]|0;aK=c[b+5288>>2]|0;aL=c[b+5296>>2]|0;aM=c[b+5304>>2]|0;aO=c[b+5312>>2]|0;aP=c[b+5320>>2]|0;aQ=c[b+5328>>2]|0;aR=c[b+5336>>2]|0;aS=c[b+5344>>2]|0;aT=c[b+5352>>2]|0;aU=c[b+5360>>2]|0;aV=c[b+5368>>2]|0;aW=c[b+5376>>2]|0;aX=c[b+5384>>2]|0;aY=c[b+5392>>2]|0;aZ=c[b+5400>>2]|0;a_=c[b+5408>>2]|0;a$=c[b+5416>>2]|0;a0=c[b+5424>>2]|0;a1=c[b+5432>>2]|0;a2=c[b+5440>>2]|0;a3=c[b+5448>>2]|0;a4=c[b+5456>>2]|0;a5=c[b+5464>>2]|0;a6=c[b+5472>>2]|0;a7=c[b+5480>>2]|0;a8=c[b+5488>>2]|0;a9=c[b+5496>>2]|0;ba=c[b+5504>>2]|0;bb=c[b+5512>>2]|0;bc=c[b+5520>>2]|0;bd=c[b+5528>>2]|0;be=c[b+5536>>2]|0;bf=c[b+5544>>2]|0;bg=c[b+5552>>2]|0;bh=c[b+5560>>2]|0;bi=c[b+5568>>2]|0;bj=c[b+5576>>2]|0;bl=c[b+5584>>2]|0;bm=c[b+5592>>2]|0;bn=c[b+5600>>2]|0;bo=c[b+5608>>2]|0;bp=c[b+5616>>2]|0;bq=c[b+5624>>2]|0;br=c[b+5632>>2]|0;bs=c[b+5640>>2]|0;bt=c[b+5648>>2]|0;bu=c[b+5656>>2]|0;bv=c[b+5664>>2]|0;bw=c[b+5672>>2]|0;bx=c[b+5680>>2]|0;by=c[b+5688>>2]|0;bz=c[b+5696>>2]|0;bA=c[b+5704>>2]|0;bB=c[b+5712>>2]|0;bC=c[b+5720>>2]|0;bD=c[b+5728>>2]|0;bE=c[b+5736>>2]|0;bF=c[b+5744>>2]|0;bG=c[b+5752>>2]|0;bH=c[b+5760>>2]|0;bI=c[b+5768>>2]|0;bJ=c[b+5776>>2]|0;bK=c[b+5784>>2]|0;bL=c[b+5792>>2]|0;bM=c[b+5800>>2]|0;bN=c[b+5808>>2]|0;bO=c[b+5816>>2]|0;bP=c[b+5824>>2]|0;bQ=c[b+5832>>2]|0;bR=c[b+5840>>2]|0;bS=c[b+5848>>2]|0;bT=c[b+5856>>2]|0;bU=c[b+5864>>2]|0;bV=c[b+5872>>2]|0;bW=c[b+5880>>2]|0;bX=c[b+5888>>2]|0;bY=c[b+5896>>2]|0;bZ=c[b+5904>>2]|0;b_=c[b+5912>>2]|0;b$=c[b+5920>>2]|0;b0=c[b+5928>>2]|0;b1=c[b+5936>>2]|0;b2=c[b+5944>>2]|0;b3=c[b+5952>>2]|0;b4=c[b+5960>>2]|0;b5=c[b+5968>>2]|0;b6=c[b+5976>>2]|0;b7=c[b+5984>>2]|0;b8=c[b+5992>>2]|0;b9=c[b+6e3>>2]|0;cb=c[b+6008>>2]|0;cc=c[b+6016>>2]|0;cd=c[b+6024>>2]|0;ce=c[b+6032>>2]|0;cf=c[b+6040>>2]|0;cg=c[b+6048>>2]|0;ch=c[b+6056>>2]|0;ci=c[b+6064>>2]|0;cj=c[b+6072>>2]|0;ck=c[b+6080>>2]|0;cl=c[b+6088>>2]|0;cm=c[b+6096>>2]|0;cn=c[b+6104>>2]|0;co=c[b+6112>>2]|0;cp=c[b+6120>>2]|0;cq=c[b+6128>>2]|0;cr=c[b+6136>>2]|0;cs=c[b+6144>>2]|0;ct=c[b+6152>>2]|0;cu=c[b+6160>>2]|0;cv=c[b+6168>>2]|0;cw=c[b+6176>>2]|0;cx=c[b+6184>>2]|0;cy=c[b+6192>>2]|0;cz=c[b+6200>>2]|0;cA=c[b+6208>>2]|0;cB=c[b+6216>>2]|0;cC=c[b+6224>>2]|0;cD=c[b+6232>>2]|0;cE=c[b+6240>>2]|0;cF=c[b+6248>>2]|0;cG=c[b+6256>>2]|0;cH=c[b+6264>>2]|0;cI=c[b+6272>>2]|0;cK=c[b+6280>>2]|0;cL=c[b+6288>>2]|0;cN=c[b+6296>>2]|0;cO=c[b+6304>>2]|0;cP=c[b+6312>>2]|0;cQ=c[b+6320>>2]|0;cR=c[b+6328>>2]|0;cS=c[b+6336>>2]|0;cT=c[b+6344>>2]|0;cU=c[b+6352>>2]|0;cV=c[b+6360>>2]|0;cW=c[b+6368>>2]|0;cX=c[b+6376>>2]|0;cY=c[b+6384>>2]|0;cZ=c[b+6392>>2]|0;c_=c[b+6400>>2]|0;c$=c[b+6408>>2]|0;c0=c[b+6416>>2]|0;c1=c[b+6424>>2]|0;c2=c[b+6432>>2]|0;c3=c[b+6440>>2]|0;c4=c[b+6448>>2]|0;c5=c[b+6456>>2]|0;c6=c[b+6464>>2]|0;c7=c[b+6472>>2]|0;c8=c[b+6480>>2]|0;c9=c[b+6488>>2]|0;da=c[b+6496>>2]|0;db=c[b+6504>>2]|0;dc=c[b+6512>>2]|0;dd=c[b+6520>>2]|0;de=c[b+6528>>2]|0;df=c[b+6536>>2]|0;dg=c[b+6544>>2]|0;dh=c[b+6552>>2]|0;di=c[b+6560>>2]|0;dj=c[b+6568>>2]|0;dk=c[b+6576>>2]|0;dl=c[b+6584>>2]|0;dm=c[b+6592>>2]|0;dn=c[b+6600>>2]|0;dp=c[b+6608>>2]|0;dq=c[b+6616>>2]|0;dr=c[b+6624>>2]|0;ds=c[b+6632>>2]|0;dt=c[b+6640>>2]|0;du=c[b+6648>>2]|0;dv=c[b+6656>>2]|0;dw=c[b+6664>>2]|0;dx=c[b+6672>>2]|0;dy=c[b+6680>>2]|0;dA=c[b+6688>>2]|0;dB=c[b+6696>>2]|0;dC=c[b+6704>>2]|0;dD=c[b+6712>>2]|0;dE=c[b+6720>>2]|0;dF=c[b+6728>>2]|0;dG=c[b+6736>>2]|0;dH=c[b+6744>>2]|0;dI=c[b+6752>>2]|0;dJ=c[b+6760>>2]|0;dK=c[b+6768>>2]|0;dL=c[b+6776>>2]|0;dM=c[b+6784>>2]|0;dN=c[b+6792>>2]|0;dO=c[b+6800>>2]|0;dP=c[b+6808>>2]|0;dQ=c[b+6816>>2]|0;dR=c[b+6824>>2]|0;dS=c[b+6832>>2]|0;dT=c[b+6840>>2]|0;dU=c[b+6848>>2]|0;dV=c[b+6856>>2]|0;dW=c[b+6864>>2]|0;dX=c[b+6872>>2]|0;dY=c[b+6880>>2]|0;dZ=c[b+6888>>2]|0;d_=c[b+6896>>2]|0;d$=c[b+6904>>2]|0;d0=c[b+6912>>2]|0;d1=c[b+7064>>2]|0;d2=c[b+7272>>2]|0;d3=c[b+7536>>2]|0;d4=c[b+7968>>2]|0;d5=c[b+39768>>2]|0;d6=c[b+39776>>2]|0;x=i;i=i+12|0;i=i+7&-8;y=i;i=i+4|0;i=i+7&-8;z=i;i=i+12|0;i=i+7&-8;A=i;i=i+12|0;i=i+7&-8;B=i;i=i+4|0;i=i+7&-8;D=i;i=i+12|0;i=i+7&-8;E=i;i=i+12|0;i=i+7&-8;F=i;i=i+12|0;i=i+7&-8;G=i;i=i+4|0;i=i+7&-8;H=i;i=i+12|0;i=i+7&-8;I=i;i=i+12|0;i=i+7&-8;J=i;i=i+4|0;i=i+7&-8;K=i;i=i+12|0;i=i+7&-8;L=i;i=i+12|0;i=i+7&-8;M=i;i=i+4|0;i=i+7&-8;N=i;i=i+12|0;i=i+7&-8;O=i;i=i+12|0;i=i+7&-8;P=i;i=i+4|0;i=i+7&-8;Q=i;i=i+12|0;i=i+7&-8;R=i;i=i+12|0;i=i+7&-8;S=i;i=i+4|0;i=i+7&-8;T=i;i=i+12|0;i=i+7&-8;U=i;i=i+12|0;i=i+7&-8;V=i;i=i+4|0;i=i+7&-8;W=i;i=i+12|0;i=i+7&-8;X=i;i=i+12|0;i=i+7&-8;Y=i;i=i+4|0;i=i+7&-8;Z=i;i=i+12|0;i=i+7&-8;_=i;i=i+12|0;i=i+7&-8;$=i;i=i+4|0;i=i+7&-8;aa=i;i=i+12|0;i=i+7&-8;ab=i;i=i+12|0;i=i+7&-8;ac=i;i=i+4|0;i=i+7&-8;ad=i;i=i+12|0;i=i+7&-8;ae=i;i=i+12|0;i=i+7&-8;af=i;i=i+4|0;i=i+7&-8;ag=i;i=i+12|0;i=i+7&-8;ah=i;i=i+12|0;i=i+7&-8;ai=i;i=i+4|0;i=i+7&-8;aj=i;i=i+12|0;i=i+7&-8;ak=i;i=i+12|0;i=i+7&-8;al=i;i=i+4|0;i=i+7&-8;am=i;i=i+12|0;i=i+7&-8;an=i;i=i+12|0;i=i+7&-8;ao=i;i=i+4|0;i=i+7&-8;ap=i;i=i+12|0;i=i+7&-8;aq=i;i=i+12|0;i=i+7&-8;ar=i;i=i+4|0;i=i+7&-8;as=i;i=i+12|0;i=i+7&-8;at=i;i=i+12|0;i=i+7&-8;au=i;i=i+12|0;i=i+7&-8;av=i;i=i+4|0;i=i+7&-8;aw=i;i=i+12|0;i=i+7&-8;ax=i;i=i+12|0;i=i+7&-8;ay=i;i=i+4|0;i=i+7&-8;az=i;i=i+12|0;i=i+7&-8;aA=i;i=i+12|0;i=i+7&-8;aB=i;i=i+4|0;i=i+7&-8;aC=i;i=i+12|0;i=i+7&-8;aD=i;i=i+12|0;i=i+7&-8;aE=i;i=i+4|0;i=i+7&-8;aF=i;i=i+12|0;i=i+7&-8;aG=i;i=i+12|0;i=i+7&-8;aH=i;i=i+4|0;i=i+7&-8;aI=i;i=i+12|0;i=i+7&-8;aJ=i;i=i+12|0;i=i+7&-8;aK=i;i=i+4|0;i=i+7&-8;aL=i;i=i+12|0;i=i+7&-8;aM=i;i=i+12|0;i=i+7&-8;aO=i;i=i+4|0;i=i+7&-8;aP=i;i=i+12|0;i=i+7&-8;aQ=i;i=i+12|0;i=i+7&-8;aR=i;i=i+4|0;i=i+7&-8;aS=i;i=i+12|0;i=i+7&-8;aT=i;i=i+12|0;i=i+7&-8;aU=i;i=i+4|0;i=i+7&-8;aV=i;i=i+12|0;i=i+7&-8;aW=i;i=i+12|0;i=i+7&-8;aX=i;i=i+4|0;i=i+7&-8;aY=i;i=i+12|0;i=i+7&-8;aZ=i;i=i+12|0;i=i+7&-8;a_=i;i=i+4|0;i=i+7&-8;a$=i;i=i+12|0;i=i+7&-8;a0=i;i=i+12|0;i=i+7&-8;a1=i;i=i+4|0;i=i+7&-8;a2=i;i=i+12|0;i=i+7&-8;a3=i;i=i+12|0;i=i+7&-8;a4=i;i=i+12|0;i=i+7&-8;a5=i;i=i+4|0;i=i+7&-8;a6=i;i=i+12|0;i=i+7&-8;a7=i;i=i+12|0;i=i+7&-8;a8=i;i=i+4|0;i=i+7&-8;a9=i;i=i+12|0;i=i+7&-8;ba=i;i=i+12|0;i=i+7&-8;bb=i;i=i+4|0;i=i+7&-8;bc=i;i=i+12|0;i=i+7&-8;bd=i;i=i+12|0;i=i+7&-8;be=i;i=i+4|0;i=i+7&-8;bf=i;i=i+12|0;i=i+7&-8;bg=i;i=i+12|0;i=i+7&-8;bh=i;i=i+4|0;i=i+7&-8;bi=i;i=i+12|0;i=i+7&-8;bj=i;i=i+12|0;i=i+7&-8;bl=i;i=i+4|0;i=i+7&-8;bm=i;i=i+12|0;i=i+7&-8;bn=i;i=i+12|0;i=i+7&-8;bo=i;i=i+4|0;i=i+7&-8;bp=i;i=i+12|0;i=i+7&-8;bq=i;i=i+12|0;i=i+7&-8;br=i;i=i+4|0;i=i+7&-8;bs=i;i=i+12|0;i=i+7&-8;bt=i;i=i+12|0;i=i+7&-8;bu=i;i=i+4|0;i=i+7&-8;bv=i;i=i+12|0;i=i+7&-8;bw=i;i=i+12|0;i=i+7&-8;bx=i;i=i+4|0;i=i+7&-8;by=i;i=i+12|0;i=i+7&-8;bz=i;i=i+12|0;i=i+7&-8;bA=i;i=i+4|0;i=i+7&-8;bB=i;i=i+12|0;i=i+7&-8;bC=i;i=i+12|0;i=i+7&-8;bD=i;i=i+12|0;i=i+7&-8;bE=i;i=i+4|0;i=i+7&-8;bF=i;i=i+12|0;i=i+7&-8;bG=i;i=i+12|0;i=i+7&-8;bH=i;i=i+4|0;i=i+7&-8;bI=i;i=i+12|0;i=i+7&-8;bJ=i;i=i+12|0;i=i+7&-8;bK=i;i=i+4|0;i=i+7&-8;bL=i;i=i+12|0;i=i+7&-8;bM=i;i=i+12|0;i=i+7&-8;bN=i;i=i+4|0;i=i+7&-8;bO=i;i=i+12|0;i=i+7&-8;bP=i;i=i+12|0;i=i+7&-8;bQ=i;i=i+4|0;i=i+7&-8;bR=i;i=i+12|0;i=i+7&-8;bS=i;i=i+12|0;i=i+7&-8;bT=i;i=i+4|0;i=i+7&-8;bU=i;i=i+12|0;i=i+7&-8;bV=i;i=i+12|0;i=i+7&-8;bW=i;i=i+4|0;i=i+7&-8;bX=i;i=i+12|0;i=i+7&-8;bY=i;i=i+12|0;i=i+7&-8;bZ=i;i=i+4|0;i=i+7&-8;b_=i;i=i+12|0;i=i+7&-8;b$=i;i=i+12|0;i=i+7&-8;b0=i;i=i+4|0;i=i+7&-8;b1=i;i=i+12|0;i=i+7&-8;b2=i;i=i+12|0;i=i+7&-8;b3=i;i=i+12|0;i=i+7&-8;b4=i;i=i+4|0;i=i+7&-8;b5=i;i=i+12|0;i=i+7&-8;b6=i;i=i+12|0;i=i+7&-8;b7=i;i=i+4|0;i=i+7&-8;b8=i;i=i+12|0;i=i+7&-8;b9=i;i=i+12|0;i=i+7&-8;cb=i;i=i+12|0;i=i+7&-8;cc=i;i=i+12|0;i=i+7&-8;cd=i;i=i+4|0;i=i+7&-8;ce=i;i=i+12|0;i=i+7&-8;cf=i;i=i+12|0;i=i+7&-8;cg=i;i=i+4|0;i=i+7&-8;ch=i;i=i+12|0;i=i+7&-8;ci=i;i=i+12|0;i=i+7&-8;cj=i;i=i+4|0;i=i+7&-8;ck=i;i=i+12|0;i=i+7&-8;cl=i;i=i+12|0;i=i+7&-8;cm=i;i=i+4|0;i=i+7&-8;cn=i;i=i+12|0;i=i+7&-8;co=i;i=i+12|0;i=i+7&-8;cp=i;i=i+4|0;i=i+7&-8;cq=i;i=i+12|0;i=i+7&-8;cr=i;i=i+12|0;i=i+7&-8;cs=i;i=i+4|0;i=i+7&-8;ct=i;i=i+12|0;i=i+7&-8;cu=i;i=i+12|0;i=i+7&-8;cv=i;i=i+4|0;i=i+7&-8;cw=i;i=i+12|0;i=i+7&-8;cx=i;i=i+12|0;i=i+7&-8;cy=i;i=i+4|0;i=i+7&-8;cz=i;i=i+12|0;i=i+7&-8;cA=i;i=i+12|0;i=i+7&-8;cB=i;i=i+4|0;i=i+7&-8;cC=i;i=i+12|0;i=i+7&-8;cD=i;i=i+12|0;i=i+7&-8;cE=i;i=i+12|0;i=i+7&-8;cF=i;i=i+4|0;i=i+7&-8;cG=i;i=i+12|0;i=i+7&-8;cH=i;i=i+12|0;i=i+7&-8;cI=i;i=i+4|0;i=i+7&-8;cK=i;i=i+12|0;i=i+7&-8;cL=i;i=i+12|0;i=i+7&-8;cN=i;i=i+12|0;i=i+7&-8;cO=i;i=i+12|0;i=i+7&-8;cP=i;i=i+4|0;i=i+7&-8;cQ=i;i=i+12|0;i=i+7&-8;cR=i;i=i+12|0;i=i+7&-8;cS=i;i=i+4|0;i=i+7&-8;cT=i;i=i+12|0;i=i+7&-8;cU=i;i=i+12|0;i=i+7&-8;cV=i;i=i+4|0;i=i+7&-8;cW=i;i=i+12|0;i=i+7&-8;cX=i;i=i+12|0;i=i+7&-8;cY=i;i=i+4|0;i=i+7&-8;cZ=i;i=i+12|0;i=i+7&-8;c_=i;i=i+12|0;i=i+7&-8;c$=i;i=i+4|0;i=i+7&-8;c0=i;i=i+12|0;i=i+7&-8;c1=i;i=i+12|0;i=i+7&-8;c2=i;i=i+4|0;i=i+7&-8;c3=i;i=i+12|0;i=i+7&-8;c4=i;i=i+12|0;i=i+7&-8;c5=i;i=i+4|0;i=i+7&-8;c6=i;i=i+12|0;i=i+7&-8;c7=i;i=i+12|0;i=i+7&-8;c8=i;i=i+4|0;i=i+7&-8;c9=i;i=i+12|0;i=i+7&-8;da=i;i=i+12|0;i=i+7&-8;db=i;i=i+4|0;i=i+7&-8;dc=i;i=i+12|0;i=i+7&-8;dd=i;i=i+12|0;i=i+7&-8;de=i;i=i+12|0;i=i+7&-8;df=i;i=i+4|0;i=i+7&-8;dg=i;i=i+12|0;i=i+7&-8;dh=i;i=i+12|0;i=i+7&-8;di=i;i=i+4|0;i=i+7&-8;dj=i;i=i+12|0;i=i+7&-8;dk=i;i=i+12|0;i=i+7&-8;dl=i;i=i+12|0;i=i+7&-8;dm=i;i=i+12|0;i=i+7&-8;dn=i;i=i+4|0;i=i+7&-8;dp=i;i=i+12|0;i=i+7&-8;dq=i;i=i+12|0;i=i+7&-8;dr=i;i=i+4|0;i=i+7&-8;ds=i;i=i+12|0;i=i+7&-8;dt=i;i=i+12|0;i=i+7&-8;du=i;i=i+4|0;i=i+7&-8;dv=i;i=i+12|0;i=i+7&-8;dw=i;i=i+12|0;i=i+7&-8;dx=i;i=i+4|0;i=i+7&-8;dy=i;i=i+12|0;i=i+7&-8;dA=i;i=i+12|0;i=i+7&-8;dB=i;i=i+4|0;i=i+7&-8;dC=i;i=i+12|0;i=i+7&-8;dD=i;i=i+12|0;i=i+7&-8;dE=i;i=i+4|0;i=i+7&-8;dF=i;i=i+12|0;i=i+7&-8;dG=i;i=i+12|0;i=i+7&-8;dH=i;i=i+4|0;i=i+7&-8;dI=i;i=i+12|0;i=i+7&-8;dJ=i;i=i+12|0;i=i+7&-8;dK=i;i=i+4|0;i=i+7&-8;dL=i;i=i+12|0;i=i+7&-8;dM=i;i=i+12|0;i=i+7&-8;dN=i;i=i+4|0;i=i+7&-8;dO=i;i=i+12|0;i=i+7&-8;dP=i;i=i+12|0;i=i+7&-8;dQ=i;i=i+12|0;i=i+7&-8;dR=i;i=i+4|0;i=i+7&-8;dS=i;i=i+12|0;i=i+7&-8;dT=i;i=i+12|0;i=i+7&-8;dU=i;i=i+4|0;i=i+7&-8;dV=i;i=i+12|0;i=i+7&-8;dW=i;i=i+12|0;i=i+7&-8;dX=i;i=i+12|0;i=i+7&-8;c[((b+1680|0)+4|0)>>2]=0;dY=(b+1680|0)+8|0;c[dY>>2]=0;dZ=b+1680|0|0;c[dZ>>2]=(b+1680|0)+4|0;c[((b+1680|0)+16|0)>>2]=0;d_=(b+1680|0)+20|0;c[d_>>2]=0;c[(b+1680|0)+12>>2]=(b+1680|0)+16|0;c[((b+1680|0)+28|0)>>2]=0;c[(b+1680|0)+32>>2]=0;c[(b+1680|0)+24>>2]=(b+1680|0)+28|0;c[((b+1680|0)+40|0)>>2]=0;c[(b+1680|0)+44>>2]=0;c[(b+1680|0)+36>>2]=(b+1680|0)+40|0;c[((b+1680|0)+52|0)>>2]=0;c[(b+1680|0)+56>>2]=0;c[(b+1680|0)+48>>2]=(b+1680|0)+52|0;c[((b+1680|0)+64|0)>>2]=0;c[(b+1680|0)+68>>2]=0;c[(b+1680|0)+60>>2]=(b+1680|0)+64|0;c[((b+1680|0)+76|0)>>2]=0;c[(b+1680|0)+80>>2]=0;c[(b+1680|0)+72>>2]=(b+1680|0)+76|0;c[((b+1680|0)+88|0)>>2]=0;c[(b+1680|0)+92>>2]=0;c[(b+1680|0)+84>>2]=(b+1680|0)+88|0;c[((b+1680|0)+100|0)>>2]=0;c[(b+1680|0)+104>>2]=0;c[(b+1680|0)+96>>2]=(b+1680|0)+100|0;c[((b+1680|0)+112|0)>>2]=0;c[(b+1680|0)+116>>2]=0;c[(b+1680|0)+108>>2]=(b+1680|0)+112|0;c[((b+1680|0)+124|0)>>2]=0;c[(b+1680|0)+128>>2]=0;c[(b+1680|0)+120>>2]=(b+1680|0)+124|0;c[((b+1680|0)+136|0)>>2]=0;c[(b+1680|0)+140>>2]=0;c[(b+1680|0)+132>>2]=(b+1680|0)+136|0;c[((b+1680|0)+148|0)>>2]=0;c[(b+1680|0)+152>>2]=0;c[(b+1680|0)+144>>2]=(b+1680|0)+148|0;c[((b+1680|0)+160|0)>>2]=0;c[(b+1680|0)+164>>2]=0;c[(b+1680|0)+156>>2]=(b+1680|0)+160|0;c[((b+1680|0)+172|0)>>2]=0;c[(b+1680|0)+176>>2]=0;c[(b+1680|0)+168>>2]=(b+1680|0)+172|0;c[((b+1680|0)+184|0)>>2]=0;c[(b+1680|0)+188>>2]=0;c[(b+1680|0)+180>>2]=(b+1680|0)+184|0;tI(f|0,0,12)|0;c[(g+4|0)>>2]=0;c[g+8>>2]=0;d$=g+4|0;c[g>>2]=d$;c[(j+4|0)>>2]=0;c[j+8>>2]=0;d0=j+4|0;c[j>>2]=d0;do{if((c[(d+92|0)>>2]|0)==0){do{if((c[17965]|0)==0){j=c[d+80>>2]|0;g=tD(j|0)|0;if(g>>>0>4294967279>>>0){ml(0)}if(g>>>0<11>>>0){a[l]=g<<1&255;d7=l+1|0;d8=g<<1&255;d9=l}else{ea=tu(g+16&-16)|0;c[l+8>>2]=ea;c[l>>2]=g+16&-16|1;c[l+4>>2]=g;d7=ea;d8=(g+16&-16|1)&255;d9=l}tH(d7|0,j|0,g)|0;a[d7+g|0]=0;tI(k|0,0,12)|0;g=d8&255;if((g&1|0)==0){eb=g>>>1}else{eb=c[l+4>>2]|0}g=(d8&1)==0;if(g){ec=d9+1|0}else{ec=c[l+8>>2]|0}j=eb+9|0;if(j>>>0>4294967279>>>0){ml(0)}if(j>>>0<11>>>0){a[k]=eb<<1;ed=k+1|0}else{j=eb+25&-16;ea=tu(j)|0;c[k+8>>2]=ea;c[k>>2]=j|1;c[k+4>>2]=eb;ed=ea}tH(ed|0,ec|0,eb)|0;a[ed+eb|0]=0;mt(k,50560,9)|0;mp(b+1880|0,k)|0;if((a[k]&1)!=0){tw(c[k+8>>2]|0)}if(g){break}tw(c[l+8>>2]|0)}else{mq(b+1880|0,c[17937]|0)|0}}while(0);if((a[f]&1)==0){ee=(b+1880|0)+1|0}else{ee=c[(b+1880|0)+8>>2]|0}g=ca(ee|0,20504)|0;if((g|0)!=0){ef=g;break}if((a[f]&1)==0){eg=(b+1880|0)+1|0;hE(30864,(d6=i,i=i+8|0,c[d6>>2]=eg,d6)|0);i=d6}else{eg=c[(b+1880|0)+8>>2]|0;hE(30864,(d6=i,i=i+8|0,c[d6>>2]=eg,d6)|0);i=d6}}else{ef=0}}while(0);d1=eG(0,0,0,0)|0;if((d1|0)==0){aN(ef|0)|0;hE(27616,(d6=i,i=i+1|0,i=i+7&-8,c[d6>>2]=0,d6)|0);i=d6}eg=(c[(d1+4|0)>>2]|0)==(c[(d1|0)>>2]|0);c[(d1|0)>>2]=b+1680|0;if(eg){c[(d1+4|0)>>2]=b+1680|0}c[d1+52>>2]=4;c[d1+56>>2]=8;eg=c[(d+92|0)>>2]|0;do{if((eg|0)==0){tI(m|0|0,0,1024)|0;while(1){ee=cJ(m|0|0,1,1024,ef|0)|0;if((eK(d1,m|0,ee,ee>>>0<1024>>>0&1)|0)==0){break}if(ee>>>0<1024>>>0){d5=83;break}}if((d5|0)==83){aN(ef|0)|0;break}aN(ef|0)|0;if((a[f]&1)==0){eh=(b+1880|0)+1|0}else{eh=c[(b+1880|0)+8>>2]|0}ee=c[d1+284>>2]|0;if((ee|0)!=0&ee>>>0<41>>>0){ei=c[69064+(ee<<2)>>2]|0}else{ei=0}ee=c[(d1+288|0)>>2]|0;do{if((ee|0)!=0){l=c[(d1+296|0)>>2]|0;if(ee>>>0<l>>>0){break}k=c[d1+144>>2]|0;dz[c[k+52>>2]&63](k,l,ee,d1+408|0);c[(d1+296|0)>>2]=c[(d1+288|0)>>2]}}while(0);ee=(c[d1+408>>2]|0)+1|0;hC(1,0,25048,(d6=i,i=i+24|0,c[d6>>2]=eh,c[d6+8>>2]=ei,c[d6+16>>2]=ee,d6)|0);i=d6;eJ(d1);hE(25024,(d6=i,i=i+1|0,i=i+7&-8,c[d6>>2]=0,d6)|0);i=d6}else{if((eK(d1,eg,tD(eg|0)|0,1)|0)!=0){break}ee=c[u>>2]|0;l=c[(d+92|0)>>2]|0;k=c[(d1+284|0)>>2]|0;if((k|0)!=0&k>>>0<41>>>0){ej=c[69064+(k<<2)>>2]|0}else{ej=0}k=c[(d1+288|0)>>2]|0;do{if((k|0)!=0){eb=c[(d1+296|0)>>2]|0;if(k>>>0<eb>>>0){break}ed=c[d1+144>>2]|0;dz[c[ed+52>>2]&63](ed,eb,k,d1+408|0);c[(d1+296|0)>>2]=c[(d1+288|0)>>2]}}while(0);k=(c[(d1+408|0)>>2]|0)+1|0;cM(ee|0,21808,(d6=i,i=i+24|0,c[d6>>2]=l,c[d6+8>>2]=ej,c[d6+16>>2]=k,d6)|0)|0;i=d6;k=c[(d+92|0)>>2]|0;eb=c[(d1+284|0)>>2]|0;if((eb|0)!=0&eb>>>0<41>>>0){ek=c[69064+(eb<<2)>>2]|0}else{ek=0}eb=c[(d1+288|0)>>2]|0;do{if((eb|0)!=0){ed=c[(d1+296|0)>>2]|0;if(eb>>>0<ed>>>0){break}ec=c[d1+144>>2]|0;dz[c[ec+52>>2]&63](ec,ed,eb,d1+408|0);c[(d1+296|0)>>2]=c[(d1+288|0)>>2]}}while(0);eb=(c[(d1+408|0)>>2]|0)+1|0;hC(1,0,58560,(d6=i,i=i+24|0,c[d6>>2]=k,c[d6+8>>2]=ek,c[d6+16>>2]=eb,d6)|0);i=d6;eJ(d1);hE(25024,(d6=i,i=i+1|0,i=i+7&-8,c[d6>>2]=0,d6)|0);i=d6}}while(0);d2=b+1680|0|0;a[n]=8;C=1684632935;a[n+1|0]=C;C=C>>8;a[(n+1|0)+1|0]=C;C=C>>8;a[(n+1|0)+2|0]=C;C=C>>8;a[(n+1|0)+3|0]=C;a[n+5|0]=0;kn(b+1672|0,b+1680|0|0,n);ek=c[(b+1672|0)>>2]|0;if((a[n]&1)!=0){tw(c[n+8>>2]|0)}n=c[(d+88|0)>>2]|0;do{if((ek|0)==((b+1680|0)+4|0|0)){if((a[f]&1)==0){el=(b+1880|0)+1|0}else{el=c[(b+1880|0)+8>>2]|0}hC(1,0,53264,(d6=i,i=i+16|0,c[d6>>2]=n,c[d6+8>>2]=el,d6)|0);i=d6}else{a[o]=8;C=1684632935;a[o+1|0]=C;C=C>>8;a[(o+1|0)+1|0]=C;C=C>>8;a[(o+1|0)+2|0]=C;C=C>>8;a[(o+1|0)+3|0]=C;a[o+5|0]=0;ej=kp(d2,b+1600|0,o)|0;eg=c[ej>>2]|0;if((eg|0)==0){ei=tu(40)|0;do{if((ei+16|0|0)!=0){if((a[o]&1)==0){c[(ei+16|0)>>2]=c[o>>2];c[(ei+16|0)+4>>2]=c[o+4>>2];c[(ei+16|0)+8>>2]=c[o+8>>2];break}eh=c[o+8>>2]|0;ef=c[o+4>>2]|0;if(ef>>>0>4294967279>>>0){ml(0)}if(ef>>>0<11>>>0){a[ei+16|0]=ef<<1;em=ei+17|0}else{m=tu(ef+16&-16)|0;c[ei+24>>2]=m;c[(ei+16|0)>>2]=ef+16&-16|1;c[ei+20>>2]=ef;em=m}tH(em|0,eh|0,ef)|0;a[em+ef|0]=0}}while(0);if((ei+28|0|0)!=0){tI(ei+28|0|0,0,12)|0}k=c[(b+1600|0)>>2]|0;c[ei>>2]=0;c[ei+4>>2]=0;c[ei+8>>2]=k;c[ej>>2]=ei;k=c[c[dZ>>2]>>2]|0;if((k|0)==0){en=ei}else{c[dZ>>2]=k;en=c[ej>>2]|0}jV(c[(b+1680|0)+4>>2]|0,en);c[dY>>2]=(c[dY>>2]|0)+1;eo=ei}else{eo=eg}k=eo+28|0;if((a[k]&1)==0){ep=k+1|0}else{ep=c[eo+36>>2]|0}k=bk(n|0,ep|0)|0;if((a[o]&1)!=0){tw(c[o+8>>2]|0)}if((k|0)==0){break}eJ(d1);a[p]=8;C=1684632935;a[p+1|0]=C;C=C>>8;a[(p+1|0)+1|0]=C;C=C>>8;a[(p+1|0)+2|0]=C;C=C>>8;a[(p+1|0)+3|0]=C;a[p+5|0]=0;k=kp(d2,b+1592|0,p)|0;ef=c[k>>2]|0;if((ef|0)==0){eh=tu(40)|0;do{if((eh+16|0|0)!=0){if((a[p]&1)==0){c[(eh+16|0)>>2]=c[p>>2];c[(eh+16|0)+4>>2]=c[p+4>>2];c[(eh+16|0)+8>>2]=c[p+8>>2];break}m=c[p+8>>2]|0;eb=c[p+4>>2]|0;if(eb>>>0>4294967279>>>0){ml(0)}if(eb>>>0<11>>>0){a[eh+16|0]=eb<<1;eq=eh+17|0}else{l=tu(eb+16&-16)|0;c[eh+24>>2]=l;c[(eh+16|0)>>2]=eb+16&-16|1;c[eh+20>>2]=eb;eq=l}tH(eq|0,m|0,eb)|0;a[eq+eb|0]=0}}while(0);if((eh+28|0|0)!=0){tI(eh+28|0|0,0,12)|0}eg=c[(b+1592|0)>>2]|0;c[eh>>2]=0;c[eh+4>>2]=0;c[eh+8>>2]=eg;c[k>>2]=eh;eg=c[c[dZ>>2]>>2]|0;if((eg|0)==0){er=eh}else{c[dZ>>2]=eg;er=c[k>>2]|0}jV(c[(b+1680|0)+4>>2]|0,er);c[dY>>2]=(c[dY>>2]|0)+1;es=eh}else{es=ef}eg=es+28|0;if((a[eg]&1)==0){et=eg+1|0}else{et=c[es+36>>2]|0}if((a[f]&1)==0){eu=(b+1880|0)+1|0}else{eu=c[(b+1880|0)+8>>2]|0}eg=c[(d+88|0)>>2]|0;hC(1,0,51480,(d6=i,i=i+24|0,c[d6>>2]=et,c[d6+8>>2]=eu,c[d6+16>>2]=eg,d6)|0);i=d6;if((a[p]&1)==0){hE(25024,(d6=i,i=i+1|0,i=i+7&-8,c[d6>>2]=0,d6)|0);i=d6}tw(c[p+8>>2]|0);hE(25024,(d6=i,i=i+1|0,i=i+7&-8,c[d6>>2]=0,d6)|0);i=d6}}while(0);j9(b+1680|0,d,c[17955]|0,c[17956]|0);hA(20,1,50352,(d6=i,i=i+1|0,i=i+7&-8,c[d6>>2]=0,d6)|0);i=d6;d3=(b+1680|0)+12|0;a[r]=18;tH(r+1|0,49656,9)|0;a[r+10|0]=0;d=kp(d3,b+1584|0,r)|0;p=c[d>>2]|0;if((p|0)==0){eu=tu(40)|0;do{if((eu+16|0|0)!=0){if((a[r]&1)==0){c[(eu+16|0)>>2]=c[r>>2];c[(eu+16|0)+4>>2]=c[r+4>>2];c[(eu+16|0)+8>>2]=c[r+8>>2];break}et=c[r+8>>2]|0;f=c[r+4>>2]|0;if(f>>>0>4294967279>>>0){ml(0)}if(f>>>0<11>>>0){a[eu+16|0]=f<<1;ev=eu+17|0}else{es=tu(f+16&-16)|0;c[eu+24>>2]=es;c[(eu+16|0)>>2]=f+16&-16|1;c[eu+20>>2]=f;ev=es}tH(ev|0,et|0,f)|0;a[ev+f|0]=0}}while(0);if((eu+28|0|0)!=0){tI(eu+28|0|0,0,12)|0}ev=c[(b+1584|0)>>2]|0;c[eu>>2]=0;c[eu+4>>2]=0;c[eu+8>>2]=ev;c[d>>2]=eu;ev=c[c[(d3|0)>>2]>>2]|0;if((ev|0)==0){ew=eu}else{c[(d3|0)>>2]=ev;ew=c[d>>2]|0}jV(c[(b+1680|0)+16>>2]|0,ew);c[d_>>2]=(c[d_>>2]|0)+1;ex=eu}else{ex=p}p=ex+28|0;if((a[p]&1)==0){c[q>>2]=c[p>>2];c[q+4>>2]=c[p+4>>2];c[q+8>>2]=c[p+8>>2];ey=q}else{p=c[ex+36>>2]|0;eu=c[ex+32>>2]|0;if(eu>>>0>4294967279>>>0){ml(0)}if(eu>>>0<11>>>0){a[q]=eu<<1;ez=q+1|0;eA=q}else{ex=tu(eu+16&-16)|0;c[q+8>>2]=ex;c[q>>2]=eu+16&-16|1;c[q+4>>2]=eu;ez=ex;eA=q}tH(ez|0,p|0,eu)|0;a[ez+eu|0]=0;ey=eA}ka(q,e|0,0.0);if((a[ey]&1)!=0){tw(c[q+8>>2]|0)}if((a[r]&1)!=0){tw(c[r+8>>2]|0)}hA(20,0,48976,(d6=i,i=i+8|0,h[d6>>3]=+h[(e|0)>>3],d6)|0);i=d6;a[t]=16;C=1886352499;a[t+1|0|0]=C;C=C>>8;a[(t+1|0|0)+1|0]=C;C=C>>8;a[(t+1|0|0)+2|0]=C;C=C>>8;a[(t+1|0|0)+3|0]=C;C=1701669204;a[(t+1|0)+4|0]=C;C=C>>8;a[((t+1|0)+4|0)+1|0]=C;C=C>>8;a[((t+1|0)+4|0)+2|0]=C;C=C>>8;a[((t+1|0)+4|0)+3|0]=C;a[t+9|0]=0;r=kp(d3,b+1576|0,t)|0;q=c[r>>2]|0;if((q|0)==0){ey=tu(40)|0;do{if((ey+16|0|0)!=0){if((a[t]&1)==0){c[(ey+16|0)>>2]=c[t>>2];c[(ey+16|0)+4>>2]=c[t+4>>2];c[(ey+16|0)+8>>2]=c[t+8>>2];break}eA=c[t+8>>2]|0;eu=c[t+4>>2]|0;if(eu>>>0>4294967279>>>0){ml(0)}if(eu>>>0<11>>>0){a[ey+16|0]=eu<<1;eB=ey+17|0}else{ez=tu(eu+16&-16)|0;c[ey+24>>2]=ez;c[(ey+16|0)>>2]=eu+16&-16|1;c[ey+20>>2]=eu;eB=ez}tH(eB|0,eA|0,eu)|0;a[eB+eu|0]=0}}while(0);if((ey+28|0|0)!=0){tI(ey+28|0|0,0,12)|0}eB=c[(b+1576|0)>>2]|0;c[ey>>2]=0;c[ey+4>>2]=0;c[ey+8>>2]=eB;c[r>>2]=ey;eB=c[c[(d3|0)>>2]>>2]|0;if((eB|0)==0){eC=ey}else{c[(d3|0)>>2]=eB;eC=c[r>>2]|0}jV(c[(b+1680|0)+16>>2]|0,eC);c[d_>>2]=(c[d_>>2]|0)+1;eD=ey}else{eD=q}q=eD+28|0;if((a[q]&1)==0){c[s>>2]=c[q>>2];c[s+4>>2]=c[q+4>>2];c[s+8>>2]=c[q+8>>2];eE=s}else{q=c[eD+36>>2]|0;ey=c[eD+32>>2]|0;if(ey>>>0>4294967279>>>0){ml(0)}if(ey>>>0<11>>>0){a[s]=ey<<1;eF=s+1|0;eH=s}else{eD=tu(ey+16&-16)|0;c[s+8>>2]=eD;c[s>>2]=ey+16&-16|1;c[s+4>>2]=ey;eF=eD;eH=s}tH(eF|0,q|0,ey)|0;a[eF+ey|0]=0;eE=eH}ka(s,e+8|0,1.0);if((a[eE]&1)!=0){tw(c[s+8>>2]|0)}if((a[t]&1)!=0){tw(c[t+8>>2]|0)}hA(20,0,47760,(d6=i,i=i+8|0,h[d6>>3]=+h[(e+8|0)>>3],d6)|0);i=d6;a[w]=16;C=1885697139;a[w+1|0|0]=C;C=C>>8;a[(w+1|0|0)+1|0]=C;C=C>>8;a[(w+1|0|0)+2|0]=C;C=C>>8;a[(w+1|0|0)+3|0]=C;C=1702521171;a[(w+1|0)+4|0]=C;C=C>>8;a[((w+1|0)+4|0)+1|0]=C;C=C>>8;a[((w+1|0)+4|0)+2|0]=C;C=C>>8;a[((w+1|0)+4|0)+3|0]=C;a[w+9|0]=0;t=kp(d3,b+1568|0,w)|0;s=c[t>>2]|0;if((s|0)==0){eE=tu(40)|0;do{if((eE+16|0|0)!=0){if((a[w]&1)==0){c[(eE+16|0)>>2]=c[w>>2];c[(eE+16|0)+4>>2]=c[w+4>>2];c[(eE+16|0)+8>>2]=c[w+8>>2];break}eH=c[w+8>>2]|0;ey=c[w+4>>2]|0;if(ey>>>0>4294967279>>>0){ml(0)}if(ey>>>0<11>>>0){a[eE+16|0]=ey<<1;eI=eE+17|0}else{eF=tu(ey+16&-16)|0;c[eE+24>>2]=eF;c[(eE+16|0)>>2]=ey+16&-16|1;c[eE+20>>2]=ey;eI=eF}tH(eI|0,eH|0,ey)|0;a[eI+ey|0]=0}}while(0);if((eE+28|0|0)!=0){tI(eE+28|0|0,0,12)|0}eI=c[(b+1568|0)>>2]|0;c[eE>>2]=0;c[eE+4>>2]=0;c[eE+8>>2]=eI;c[t>>2]=eE;eI=c[c[(d3|0)>>2]>>2]|0;if((eI|0)==0){eL=eE}else{c[(d3|0)>>2]=eI;eL=c[t>>2]|0}jV(c[(b+1680|0)+16>>2]|0,eL);c[d_>>2]=(c[d_>>2]|0)+1;eM=eE}else{eM=s}s=eM+28|0;if((a[s]&1)==0){c[v>>2]=c[s>>2];c[v+4>>2]=c[s+4>>2];c[v+8>>2]=c[s+8>>2];d4=v}else{s=c[eM+36>>2]|0;eE=c[eM+32>>2]|0;if(eE>>>0>4294967279>>>0){ml(0)}if(eE>>>0<11>>>0){a[v]=eE<<1;eN=v+1|0;eO=v}else{eM=tu(eE+16&-16)|0;c[v+8>>2]=eM;c[v>>2]=eE+16&-16|1;c[v+4>>2]=eE;eN=eM;eO=v}tH(eN|0,s|0,eE)|0;a[eN+eE|0]=0;d4=eO}ka(v,e+24|0,(+h[(e+8|0)>>3]- +h[(e|0)>>3])/500.0);c[b+4760>>2]=x;c[b+4768>>2]=y;c[b+4776>>2]=z;c[b+4784>>2]=A;c[b+4792>>2]=B;c[b+4800>>2]=D;c[b+4808>>2]=E;c[b+4816>>2]=F;c[b+4824>>2]=G;c[b+4832>>2]=H;c[b+4840>>2]=I;c[b+4848>>2]=J;c[b+4856>>2]=K;c[b+4864>>2]=L;c[b+4872>>2]=M;c[b+4880>>2]=N;c[b+4888>>2]=O;c[b+4896>>2]=P;c[b+4904>>2]=Q;c[b+4912>>2]=R;c[b+4920>>2]=S;c[b+4928>>2]=T;c[b+4936>>2]=U;c[b+4944>>2]=V;c[b+4952>>2]=W;c[b+4960>>2]=X;c[b+4968>>2]=Y;c[b+4976>>2]=Z;c[b+4984>>2]=_;c[b+4992>>2]=$;c[b+5e3>>2]=aa;c[b+5008>>2]=ab;c[b+5016>>2]=ac;c[b+5024>>2]=ad;c[b+5032>>2]=ae;c[b+5040>>2]=af;c[b+5048>>2]=ag;c[b+5056>>2]=ah;c[b+5064>>2]=ai;c[b+5072>>2]=aj;c[b+5080>>2]=ak;c[b+5088>>2]=al;c[b+5096>>2]=am;c[b+5104>>2]=an;c[b+5112>>2]=ao;c[b+5120>>2]=ap;c[b+5128>>2]=aq;c[b+5136>>2]=ar;c[b+5144>>2]=as;c[b+5152>>2]=at;c[b+5160>>2]=au;c[b+5168>>2]=av;c[b+5176>>2]=aw;c[b+5184>>2]=ax;c[b+5192>>2]=ay;c[b+5200>>2]=az;c[b+5208>>2]=aA;c[b+5216>>2]=aB;c[b+5224>>2]=aC;c[b+5232>>2]=aD;c[b+5240>>2]=aE;c[b+5248>>2]=aF;c[b+5256>>2]=aG;c[b+5264>>2]=aH;c[b+5272>>2]=aI;c[b+5280>>2]=aJ;c[b+5288>>2]=aK;c[b+5296>>2]=aL;c[b+5304>>2]=aM;c[b+5312>>2]=aO;c[b+5320>>2]=aP;c[b+5328>>2]=aQ;c[b+5336>>2]=aR;c[b+5344>>2]=aS;c[b+5352>>2]=aT;c[b+5360>>2]=aU;c[b+5368>>2]=aV;c[b+5376>>2]=aW;c[b+5384>>2]=aX;c[b+5392>>2]=aY;c[b+5400>>2]=aZ;c[b+5408>>2]=a_;c[b+5416>>2]=a$;c[b+5424>>2]=a0;c[b+5432>>2]=a1;c[b+5440>>2]=a2;c[b+5448>>2]=a3;c[b+5456>>2]=a4;c[b+5464>>2]=a5;c[b+5472>>2]=a6;c[b+5480>>2]=a7;c[b+5488>>2]=a8;c[b+5496>>2]=a9;c[b+5504>>2]=ba;c[b+5512>>2]=bb;c[b+5520>>2]=bc;c[b+5528>>2]=bd;c[b+5536>>2]=be;c[b+5544>>2]=bf;c[b+5552>>2]=bg;c[b+5560>>2]=bh;c[b+5568>>2]=bi;c[b+5576>>2]=bj;c[b+5584>>2]=bl;c[b+5592>>2]=bm;c[b+5600>>2]=bn;c[b+5608>>2]=bo;c[b+5616>>2]=bp;c[b+5624>>2]=bq;c[b+5632>>2]=br;c[b+5640>>2]=bs;c[b+5648>>2]=bt;c[b+5656>>2]=bu;c[b+5664>>2]=bv;c[b+5672>>2]=bw;c[b+5680>>2]=bx;c[b+5688>>2]=by;c[b+5696>>2]=bz;c[b+5704>>2]=bA;c[b+5712>>2]=bB;c[b+5720>>2]=bC;c[b+5728>>2]=bD;c[b+5736>>2]=bE;c[b+5744>>2]=bF;c[b+5752>>2]=bG;c[b+5760>>2]=bH;c[b+5768>>2]=bI;c[b+5776>>2]=bJ;c[b+5784>>2]=bK;c[b+5792>>2]=bL;c[b+5800>>2]=bM;c[b+5808>>2]=bN;c[b+5816>>2]=bO;c[b+5824>>2]=bP;c[b+5832>>2]=bQ;c[b+5840>>2]=bR;c[b+5848>>2]=bS;c[b+5856>>2]=bT;c[b+5864>>2]=bU;c[b+5872>>2]=bV;c[b+5880>>2]=bW;c[b+5888>>2]=bX;c[b+5896>>2]=bY;c[b+5904>>2]=bZ;c[b+5912>>2]=b_;c[b+5920>>2]=b$;c[b+5928>>2]=b0;c[b+5936>>2]=b1;c[b+5944>>2]=b2;c[b+5952>>2]=b3;c[b+5960>>2]=b4;c[b+5968>>2]=b5;c[b+5976>>2]=b6;c[b+5984>>2]=b7;c[b+5992>>2]=b8;c[b+6e3>>2]=b9;c[b+6008>>2]=cb;c[b+6016>>2]=cc;c[b+6024>>2]=cd;c[b+6032>>2]=ce;c[b+6040>>2]=cf;c[b+6048>>2]=cg;c[b+6056>>2]=ch;c[b+6064>>2]=ci;c[b+6072>>2]=cj;c[b+6080>>2]=ck;c[b+6088>>2]=cl;c[b+6096>>2]=cm;c[b+6104>>2]=cn;c[b+6112>>2]=co;c[b+6120>>2]=cp;c[b+6128>>2]=cq;c[b+6136>>2]=cr;c[b+6144>>2]=cs;c[b+6152>>2]=ct;c[b+6160>>2]=cu;c[b+6168>>2]=cv;c[b+6176>>2]=cw;c[b+6184>>2]=cx;c[b+6192>>2]=cy;c[b+6200>>2]=cz;c[b+6208>>2]=cA;c[b+6216>>2]=cB;c[b+6224>>2]=cC;c[b+6232>>2]=cD;c[b+6240>>2]=cE;c[b+6248>>2]=cF;c[b+6256>>2]=cG;c[b+6264>>2]=cH;c[b+6272>>2]=cI;c[b+6280>>2]=cK;c[b+6288>>2]=cL;c[b+6296>>2]=cN;c[b+6304>>2]=cO;c[b+6312>>2]=cP;c[b+6320>>2]=cQ;c[b+6328>>2]=cR;c[b+6336>>2]=cS;c[b+6344>>2]=cT;c[b+6352>>2]=cU;c[b+6360>>2]=cV;c[b+6368>>2]=cW;c[b+6376>>2]=cX;c[b+6384>>2]=cY;c[b+6392>>2]=cZ;c[b+6400>>2]=c_;c[b+6408>>2]=c$;c[b+6416>>2]=c0;c[b+6424>>2]=c1;c[b+6432>>2]=c2;c[b+6440>>2]=c3;c[b+6448>>2]=c4;c[b+6456>>2]=c5;c[b+6464>>2]=c6;c[b+6472>>2]=c7;c[b+6480>>2]=c8;c[b+6488>>2]=c9;c[b+6496>>2]=da;c[b+6504>>2]=db;c[b+6512>>2]=dc;c[b+6520>>2]=dd;c[b+6528>>2]=de;c[b+6536>>2]=df;c[b+6544>>2]=dg;c[b+6552>>2]=dh;c[b+6560>>2]=di;c[b+6568>>2]=dj;c[b+6576>>2]=dk;c[b+6584>>2]=dl;c[b+6592>>2]=dm;c[b+6600>>2]=dn;c[b+6608>>2]=dp;c[b+6616>>2]=dq;c[b+6624>>2]=dr;c[b+6632>>2]=ds;c[b+6640>>2]=dt;c[b+6648>>2]=du;c[b+6656>>2]=dv;c[b+6664>>2]=dw;c[b+6672>>2]=dx;c[b+6680>>2]=dy;c[b+6688>>2]=dA;c[b+6696>>2]=dB;c[b+6704>>2]=dC;c[b+6712>>2]=dD;c[b+6720>>2]=dE;c[b+6728>>2]=dF;c[b+6736>>2]=dG;c[b+6744>>2]=dH;c[b+6752>>2]=dI;c[b+6760>>2]=dJ;c[b+6768>>2]=dK;c[b+6776>>2]=dL;c[b+6784>>2]=dM;c[b+6792>>2]=dN;c[b+6800>>2]=dO;c[b+6808>>2]=dP;c[b+6816>>2]=dQ;c[b+6824>>2]=dR;c[b+6832>>2]=dS;c[b+6840>>2]=dT;c[b+6848>>2]=dU;c[b+6856>>2]=dV;c[b+6864>>2]=dW;c[b+6872>>2]=dX;c[b+6880>>2]=dY;c[b+6888>>2]=dZ;c[b+6896>>2]=d_;c[b+6904>>2]=d$;c[b+6912>>2]=d0;c[b+7064>>2]=d1;c[b+7272>>2]=d2;c[b+7536>>2]=d3;c[b+7968>>2]=d4;c[b+39768>>2]=d5;c[b+39776>>2]=d6}function _read_input_xml$11(b){b=b|0;var d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,D=0,E=0,F=0,G=0,H=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bg=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bt=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0,bP=0,bQ=0,bR=0,bS=0,bT=0,bU=0,bV=0,bW=0,bX=0,bY=0,bZ=0,b_=0,b$=0,b0=0,b2=0,b3=0,b4=0,b5=0,b6=0,b7=0,b8=0,b9=0,ca=0,cb=0,cc=0,cd=0,ce=0,cf=0,cg=0,ch=0,ci=0,cj=0,ck=0,cl=0,cm=0,cn=0,co=0,cp=0,cq=0,cr=0,cs=0,ct=0,cu=0,cv=0,cw=0,cx=0,cy=0,cz=0,cA=0,cB=0,cC=0,cD=0,cE=0,cF=0,cG=0,cH=0,cI=0,cJ=0,cK=0,cL=0,cM=0,cN=0,cO=0,cP=0,cQ=0,cR=0,cS=0,cT=0,cU=0,cV=0,cW=0,cX=0,cY=0,cZ=0,c_=0,c$=0,c0=0,c1=0,c2=0,c3=0,c4=0,c5=0,c6=0,c7=0,c8=0,c9=0,da=0,db=0,dc=0,de=0,df=0,dg=0,dh=0,di=0,dj=0,dk=0,dl=0,dm=0,dn=0,dp=0,dq=0,dr=0,ds=0,dt=0,du=0,dv=0,dw=0,dx=0,dy=0,dz=0,dA=0,dB=0,dC=0,dD=0,dE=0,dF=0,dG=0,dH=0,dI=0,dJ=0,dK=0,dL=0,dM=0,dN=0,dO=0,dP=0,dQ=0,dR=0,dS=0,dT=0,dU=0,dV=0,dW=0,dX=0,dY=0,dZ=0,d_=0,d$=0,d0=0,d1=0,d2=0,d3=0,d4=0,d5=0,d6=0,d7=0,d8=0,d9=0,ea=0,eb=0,ec=0,ed=0,ee=0,ef=0,eg=0,eh=0,ei=0,ej=0,ek=0,el=0,em=0,en=0,eo=0,ep=0,eq=0,er=0,es=0,et=0,eu=0,ev=0,ew=0,ex=0,ey=0,ez=0,eA=0,eB=0,eC=0,eD=0,eE=0,eF=0,eG=0,eH=0,eI=0,eK=0,eL=0,eM=0,eN=0,eO=0,eP=0,eQ=0,eR=0,eS=0,eT=0,eU=0,eV=0,eW=0,eX=0,eY=0,eZ=0,e_=0,e$=0,e0=0,e1=0,e2=0,e3=0,e4=0,e5=0,e6=0,e7=0,e8=0,e9=0,fa=0,fb=0,fc=0,fd=0,fe=0,ff=0,fg=0,fh=0,fi=0,fj=0,fk=0,fl=0,fm=0,fn=0,fo=0,fp=0,fq=0,fr=0,fs=0,ft=0,fu=0,fv=0,fw=0,fx=0,fy=0,fz=0,fA=0,fB=0,fC=0,fD=0,fE=0,fF=0,fG=0,fH=0,fI=0,fJ=0,fK=0,fL=0,fM=0,fN=0,fO=0,fP=0,fQ=0,fR=0,fS=0,fT=0,fU=0,fV=0,fW=0,fX=0,fY=0,fZ=0,f_=0,f$=0,f0=0,f1=0,f2=0,f3=0,f4=0,f5=0,f6=0,f7=0,f8=0,f9=0,ga=0,gb=0,gc=0,gd=0,ge=0,gf=0,gg=0,gh=0,gi=0,gj=0,gk=0,gl=0,gm=0,gn=0,go=0,gp=0,gq=0,gr=0,gs=0,gt=0,gu=0,gv=0,gw=0,gx=0,gy=0,gz=0,gA=0,gB=0,gC=0,gD=0,gE=0,gF=0,gG=0,gH=0,gI=0,gJ=0,gK=0,gL=0,gM=0,gN=0,gO=0,gP=0,gQ=0,gR=0,gS=0,gT=0,gU=0,gV=0,gW=0,gX=0,gY=0,gZ=0,g_=0,g$=0,g0=0,g1=0,g2=0,g3=0,g4=0,g5=0,g6=0,g7=0,g8=0,g9=0,ha=0,hb=0,hc=0,hd=0,he=0,hf=0,hg=0,hh=0,hi=0,hj=0,hk=0,hl=0,hm=0,hn=0,ho=0,hp=0,hq=0,hr=0,hs=0,ht=0,hu=0,hv=0,hw=0,hx=0,hy=0,hz=0,hB=0,hD=0,hE=0,hF=0,hG=0,hH=0,hI=0,hJ=0,hK=0,hL=0,hM=0,hN=0,hO=0,hP=0,hQ=0,hR=0,hS=0,hT=0,hU=0,hV=0,hW=0,hX=0,hY=0,hZ=0,h_=0,h$=0,h0=0,h1=0,h2=0,h3=0,h4=0,h5=0,h6=0,h7=0,h8=0,h9=0,ia=0,ib=0,ic=0,id=0,ie=0,ig=0,ih=0,ii=0,ij=0,ik=0,il=0,im=0,io=0,ip=0,iq=0,ir=0,is=0,it=0,iu=0,iv=0,iw=0,ix=0,iy=0,iz=0,iA=0,iB=0,iC=0,iD=0,iE=0,iF=0,iG=0,iH=0,iI=0,iJ=0,iK=0,iL=0,iM=0,iN=0,iO=0,iP=0,iQ=0,iR=0,iS=0,iT=0,iU=0,iV=0,iW=0,iX=0,iY=0,iZ=0,i_=0,i$=0,i0=0,i1=0,i2=0,i3=0,i4=0,i5=0,i6=0,i7=0,i8=0,i9=0,ja=0,jb=0,jc=0,jd=0,je=0,jf=0,jg=0,jh=0,ji=0,jj=0,jk=0,jl=0,jm=0,jn=0,jo=0,jp=0,jq=0,jr=0,js=0,jt=0,ju=0,jv=0;d=c[b+1904>>2]|0;e=c[b+1912>>2]|0;f=c[b+1920>>2]|0;h=c[b+1928>>2]|0;j=c[b+1936>>2]|0;k=c[b+1944>>2]|0;l=c[b+1952>>2]|0;m=c[b+1960>>2]|0;n=c[b+1968>>2]|0;o=c[b+1976>>2]|0;p=c[b+1984>>2]|0;q=c[b+1992>>2]|0;r=c[b+2e3>>2]|0;s=c[b+2008>>2]|0;t=c[b+2016>>2]|0;u=c[b+2024>>2]|0;v=c[b+2032>>2]|0;w=c[b+2040>>2]|0;x=c[b+2048>>2]|0;y=c[b+2056>>2]|0;z=c[b+2064>>2]|0;A=c[b+2072>>2]|0;D=c[b+2080>>2]|0;E=c[b+2088>>2]|0;F=c[b+2096>>2]|0;G=c[b+2104>>2]|0;H=c[b+2112>>2]|0;K=c[b+2120>>2]|0;L=c[b+2128>>2]|0;M=c[b+2136>>2]|0;N=c[b+2144>>2]|0;O=c[b+2152>>2]|0;P=c[b+2160>>2]|0;Q=c[b+2168>>2]|0;OL:do{i=i+4|0;i=i+7&-8;R=i;i=i+4|0;i=i+7&-8;S=i;i=i+4|0;i=i+7&-8;T=i;i=i+12|0;i=i+7&-8;U=i;i=i+12|0;i=i+7&-8;V=i;i=i+12|0;i=i+7&-8;W=i;i=i+12|0;i=i+7&-8;X=i;i=i+12|0;i=i+7&-8;Y=i;i=i+12|0;i=i+7&-8;Z=i;i=i+12|0;i=i+7&-8;_=i;i=i+12|0;i=i+7&-8;$=i;i=i+12|0;i=i+7&-8;aa=i;i=i+12|0;i=i+7&-8;ab=i;i=i+12|0;i=i+7&-8;ac=i;i=i+12|0;i=i+7&-8;ad=i;i=i+12|0;i=i+7&-8;ae=i;i=i+12|0;i=i+7&-8;af=i;i=i+12|0;i=i+7&-8;ag=i;i=i+12|0;i=i+7&-8;ah=i;i=i+12|0;i=i+7&-8;ai=i;i=i+12|0;i=i+7&-8;aj=i;i=i+12|0;i=i+7&-8;ak=i;i=i+4|0;i=i+7&-8;al=i;i=i+12|0;i=i+7&-8;am=i;i=i+12|0;i=i+7&-8;an=i;i=i+4|0;i=i+7&-8;ao=i;i=i+12|0;i=i+7&-8;ap=i;i=i+12|0;i=i+7&-8;aq=i;i=i+4|0;i=i+7&-8;ar=i;i=i+12|0;i=i+7&-8;as=i;i=i+12|0;i=i+7&-8;at=i;i=i+4|0;i=i+7&-8;au=i;i=i+12|0;i=i+7&-8;av=i;i=i+12|0;i=i+7&-8;aw=i;i=i+4|0;i=i+7&-8;ax=i;i=i+12|0;i=i+7&-8;ay=i;i=i+12|0;i=i+7&-8;az=i;i=i+4|0;i=i+7&-8;aA=i;i=i+12|0;i=i+7&-8;aB=i;i=i+12|0;i=i+7&-8;aC=i;i=i+4|0;i=i+7&-8;aD=i;i=i+12|0;i=i+7&-8;aE=i;i=i+12|0;i=i+7&-8;aF=i;i=i+4|0;i=i+7&-8;aG=i;i=i+12|0;i=i+7&-8;aH=i;i=i+12|0;i=i+7&-8;aI=i;i=i+4|0;i=i+7&-8;aJ=i;i=i+12|0;i=i+7&-8;aK=i;i=i+12|0;i=i+7&-8;aL=i;i=i+4|0;i=i+7&-8;aM=i;i=i+12|0;i=i+7&-8;aN=i;i=i+12|0;i=i+7&-8;aO=i;i=i+4|0;i=i+7&-8;aP=i;i=i+12|0;i=i+7&-8;aQ=i;i=i+12|0;i=i+7&-8;aS=i;i=i+4|0;i=i+7&-8;aT=i;i=i+12|0;i=i+7&-8;aU=i;i=i+12|0;i=i+7&-8;aV=i;i=i+4|0;i=i+7&-8;aW=i;i=i+12|0;i=i+7&-8;aX=i;i=i+12|0;i=i+7&-8;aY=i;i=i+4|0;i=i+7&-8;aZ=i;i=i+12|0;i=i+7&-8;a_=i;i=i+12|0;i=i+7&-8;a$=i;i=i+4|0;i=i+7&-8;a0=i;i=i+12|0;i=i+7&-8;a1=i;i=i+12|0;i=i+7&-8;a2=i;i=i+4|0;i=i+7&-8;a3=i;i=i+12|0;i=i+7&-8;a4=i;i=i+12|0;i=i+7&-8;a5=i;i=i+12|0;i=i+7&-8;a6=i;i=i+4|0;i=i+7&-8;a7=i;i=i+12|0;i=i+7&-8;a8=i;i=i+12|0;i=i+7&-8;a9=i;i=i+4|0;i=i+7&-8;ba=i;i=i+12|0;i=i+7&-8;bb=i;i=i+12|0;i=i+7&-8;bc=i;i=i+4|0;i=i+7&-8;bd=i;i=i+12|0;i=i+7&-8;be=i;i=i+12|0;i=i+7&-8;bf=i;i=i+4|0;i=i+7&-8;bg=i;i=i+12|0;i=i+7&-8;bh=i;i=i+12|0;i=i+7&-8;bi=i;i=i+4|0;i=i+7&-8;bj=i;i=i+12|0;i=i+7&-8;bk=i;i=i+12|0;i=i+7&-8;bl=i;i=i+4|0;i=i+7&-8;bm=i;i=i+12|0;i=i+7&-8;bn=i;i=i+12|0;i=i+7&-8;bo=i;i=i+4|0;i=i+7&-8;bp=i;i=i+12|0;i=i+7&-8;bq=i;i=i+12|0;i=i+7&-8;br=i;i=i+4|0;i=i+7&-8;bs=i;i=i+12|0;i=i+7&-8;bt=i;i=i+12|0;i=i+7&-8;bu=i;i=i+4|0;i=i+7&-8;bv=i;i=i+12|0;i=i+7&-8;bw=i;i=i+12|0;i=i+7&-8;bx=i;i=i+4|0;i=i+7&-8;by=i;i=i+12|0;i=i+7&-8;bz=i;i=i+12|0;i=i+7&-8;bA=i;i=i+4|0;i=i+7&-8;bB=i;i=i+12|0;i=i+7&-8;bC=i;i=i+12|0;i=i+7&-8;bD=i;i=i+4|0;i=i+7&-8;bE=i;i=i+12|0;i=i+7&-8;bF=i;i=i+12|0;i=i+7&-8;bG=i;i=i+4|0;i=i+7&-8;bH=i;i=i+12|0;i=i+7&-8;bI=i;i=i+12|0;i=i+7&-8;bJ=i;i=i+4|0;i=i+7&-8;bK=i;i=i+12|0;i=i+7&-8;bL=i;i=i+12|0;i=i+7&-8;bM=i;i=i+4|0;i=i+7&-8;bN=i;i=i+12|0;i=i+7&-8;bO=i;i=i+12|0;i=i+7&-8;bP=i;i=i+4|0;i=i+7&-8;bQ=i;i=i+12|0;i=i+7&-8;bR=i;i=i+12|0;i=i+7&-8;bS=i;i=i+12|0;i=i+7&-8;bT=i;i=i+4|0;i=i+7&-8;bU=i;i=i+12|0;i=i+7&-8;bV=i;i=i+12|0;i=i+7&-8;bW=i;i=i+4|0;i=i+7&-8;bX=i;i=i+12|0;i=i+7&-8;bY=i;i=i+12|0;i=i+7&-8;bZ=i;i=i+4|0;i=i+7&-8;b_=i;i=i+12|0;i=i+7&-8;b$=i;i=i+12|0;i=i+7&-8;b0=i;i=i+4|0;i=i+7&-8;b2=i;i=i+12|0;i=i+7&-8;b3=i;i=i+12|0;i=i+7&-8;b4=i;i=i+4|0;i=i+7&-8;b5=i;i=i+12|0;i=i+7&-8;b6=i;i=i+12|0;i=i+7&-8;b7=i;i=i+4|0;i=i+7&-8;b8=i;i=i+12|0;i=i+7&-8;b9=i;i=i+12|0;i=i+7&-8;ca=i;i=i+4|0;i=i+7&-8;cb=i;i=i+12|0;i=i+7&-8;cc=i;i=i+12|0;i=i+7&-8;cd=i;i=i+4|0;i=i+7&-8;ce=i;i=i+12|0;i=i+7&-8;cf=i;i=i+12|0;i=i+7&-8;cg=i;i=i+4|0;i=i+7&-8;ch=i;i=i+12|0;i=i+7&-8;ci=i;i=i+12|0;i=i+7&-8;cj=i;i=i+4|0;i=i+7&-8;ck=i;i=i+12|0;i=i+7&-8;cl=i;i=i+12|0;i=i+7&-8;cm=i;i=i+4|0;i=i+7&-8;cn=i;i=i+12|0;i=i+7&-8;co=i;i=i+12|0;i=i+7&-8;cp=i;i=i+4|0;i=i+7&-8;cq=i;i=i+12|0;i=i+7&-8;cr=i;i=i+12|0;i=i+7&-8;cs=i;i=i+4|0;i=i+7&-8;ct=i;i=i+12|0;i=i+7&-8;cu=i;i=i+12|0;i=i+7&-8;cv=i;i=i+4|0;i=i+7&-8;cw=i;i=i+12|0;i=i+7&-8;cx=i;i=i+12|0;i=i+7&-8;cy=i;i=i+4|0;i=i+7&-8;cz=i;i=i+12|0;i=i+7&-8;cA=i;i=i+12|0;i=i+7&-8;cB=i;i=i+4|0;i=i+7&-8;cC=i;i=i+12|0;i=i+7&-8;cD=i;i=i+12|0;i=i+7&-8;cE=i;i=i+12|0;i=i+7&-8;cF=i;i=i+4|0;i=i+7&-8;cG=i;i=i+12|0;i=i+7&-8;cH=i;i=i+12|0;i=i+7&-8;cI=i;i=i+4|0;i=i+7&-8;cJ=i;i=i+12|0;i=i+7&-8;cK=i;i=i+12|0;i=i+7&-8;cL=i;i=i+4|0;i=i+7&-8;cM=i;i=i+12|0;i=i+7&-8;cN=i;i=i+12|0;i=i+7&-8;cO=i;i=i+4|0;i=i+7&-8;cP=i;i=i+12|0;i=i+7&-8;cQ=i;i=i+12|0;i=i+7&-8;cR=i;i=i+4|0;i=i+7&-8;cS=i;i=i+12|0;i=i+7&-8;cT=i;i=i+12|0;i=i+7&-8;cU=i;i=i+4|0;i=i+7&-8;cV=i;i=i+12|0;i=i+7&-8;cW=i;i=i+12|0;i=i+7&-8;cX=i;i=i+4|0;i=i+7&-8;cY=i;i=i+12|0;i=i+7&-8;cZ=i;i=i+12|0;i=i+7&-8;c_=i;i=i+4|0;i=i+7&-8;c$=i;i=i+12|0;i=i+7&-8;c0=i;i=i+12|0;i=i+7&-8;c1=i;i=i+4|0;i=i+7&-8;c2=i;i=i+12|0;i=i+7&-8;c3=i;i=i+12|0;i=i+7&-8;c4=i;i=i+4|0;i=i+7&-8;c5=i;i=i+12|0;i=i+7&-8;c6=i;i=i+12|0;i=i+7&-8;c7=i;i=i+4|0;i=i+7&-8;c8=i;i=i+12|0;i=i+7&-8;c9=i;i=i+12|0;i=i+7&-8;da=i;i=i+4|0;i=i+7&-8;db=i;i=i+12|0;i=i+7&-8;dc=i;i=i+12|0;i=i+7&-8;de=i;i=i+4|0;i=i+7&-8;df=i;i=i+12|0;i=i+7&-8;dg=i;i=i+12|0;i=i+7&-8;dh=i;i=i+4|0;i=i+7&-8;di=i;i=i+12|0;i=i+7&-8;dj=i;i=i+12|0;i=i+7&-8;dk=i;i=i+12|0;i=i+7&-8;dl=i;i=i+4|0;i=i+7&-8;dm=i;i=i+12|0;i=i+7&-8;dn=i;i=i+12|0;i=i+7&-8;dp=i;i=i+4|0;i=i+7&-8;dq=i;i=i+12|0;i=i+7&-8;dr=i;i=i+12|0;i=i+7&-8;ds=i;i=i+4|0;i=i+7&-8;dt=i;i=i+12|0;i=i+7&-8;du=i;i=i+12|0;i=i+7&-8;dv=i;i=i+4|0;i=i+7&-8;dw=i;i=i+12|0;i=i+7&-8;dx=i;i=i+12|0;i=i+7&-8;dy=i;i=i+4|0;i=i+7&-8;dz=i;i=i+12|0;i=i+7&-8;dA=i;i=i+12|0;i=i+7&-8;dB=i;i=i+4|0;i=i+7&-8;dC=i;i=i+12|0;i=i+7&-8;dD=i;i=i+12|0;i=i+7&-8;dE=i;i=i+4|0;i=i+7&-8;dF=i;i=i+12|0;i=i+7&-8;dG=i;i=i+12|0;i=i+7&-8;dH=i;i=i+4|0;i=i+7&-8;dI=i;i=i+12|0;i=i+7&-8;dJ=i;i=i+12|0;i=i+7&-8;dK=i;i=i+4|0;i=i+7&-8;dL=i;i=i+12|0;i=i+7&-8;dM=i;i=i+12|0;i=i+7&-8;dN=i;i=i+4|0;i=i+7&-8;dO=i;i=i+12|0;i=i+7&-8;dP=i;i=i+12|0;i=i+7&-8;dQ=i;i=i+4|0;i=i+7&-8;dR=i;i=i+12|0;i=i+7&-8;dS=i;i=i+12|0;i=i+7&-8;dT=i;i=i+4|0;i=i+7&-8;dU=i;i=i+12|0;i=i+7&-8;dV=i;i=i+12|0;i=i+7&-8;dW=i;i=i+12|0;i=i+7&-8;dX=i;i=i+4|0;i=i+7&-8;dY=i;i=i+12|0;i=i+7&-8;dZ=i;i=i+12|0;i=i+7&-8;d_=i;i=i+4|0;i=i+7&-8;d$=i;i=i+12|0;i=i+7&-8;d0=i;i=i+12|0;i=i+7&-8;d1=i;i=i+4|0;i=i+7&-8;d2=i;i=i+12|0;i=i+7&-8;d3=i;i=i+12|0;i=i+7&-8;d4=i;i=i+4|0;i=i+7&-8;d5=i;i=i+12|0;i=i+7&-8;d6=i;i=i+12|0;i=i+7&-8;d7=i;i=i+4|0;i=i+7&-8;d8=i;i=i+12|0;i=i+7&-8;d9=i;i=i+12|0;i=i+7&-8;ea=i;i=i+4|0;i=i+7&-8;eb=i;i=i+12|0;i=i+7&-8;ec=i;i=i+12|0;i=i+7&-8;ed=i;i=i+4|0;i=i+7&-8;ee=i;i=i+12|0;i=i+7&-8;ef=i;i=i+12|0;i=i+7&-8;eg=i;i=i+4|0;i=i+7&-8;eh=i;i=i+12|0;i=i+7&-8;ei=i;i=i+12|0;i=i+7&-8;ej=i;i=i+4|0;i=i+7&-8;ek=i;i=i+12|0;i=i+7&-8;el=i;i=i+12|0;i=i+7&-8;em=i;i=i+4|0;i=i+7&-8;en=i;i=i+12|0;i=i+7&-8;eo=i;i=i+12|0;i=i+7&-8;ep=i;i=i+4|0;i=i+7&-8;eq=i;i=i+12|0;i=i+7&-8;er=i;i=i+12|0;i=i+7&-8;es=i;i=i+12|0;i=i+7&-8;et=i;i=i+4|0;i=i+7&-8;eu=i;i=i+12|0;i=i+7&-8;ev=i;i=i+12|0;i=i+7&-8;ew=i;i=i+4|0;i=i+7&-8;ex=i;i=i+12|0;i=i+7&-8;ey=i;i=i+12|0;i=i+7&-8;ez=i;i=i+4|0;i=i+7&-8;eA=i;i=i+12|0;i=i+7&-8;eB=i;i=i+12|0;i=i+7&-8;eC=i;i=i+4|0;i=i+7&-8;eD=i;i=i+12|0;i=i+7&-8;eE=i;i=i+12|0;i=i+7&-8;eF=i;i=i+4|0;i=i+7&-8;eG=i;i=i+12|0;i=i+7&-8;eH=i;i=i+12|0;i=i+7&-8;eI=i;i=i+4|0;i=i+7&-8;eK=i;i=i+12|0;i=i+7&-8;eL=i;i=i+12|0;i=i+7&-8;eM=i;i=i+4|0;i=i+7&-8;eN=i;i=i+12|0;i=i+7&-8;eO=i;i=i+12|0;i=i+7&-8;eP=i;i=i+4|0;i=i+7&-8;eQ=i;i=i+12|0;i=i+7&-8;eR=i;i=i+12|0;i=i+7&-8;eS=i;i=i+4|0;i=i+7&-8;eT=i;i=i+12|0;i=i+7&-8;eU=i;i=i+12|0;i=i+7&-8;eV=i;i=i+4|0;i=i+7&-8;eW=i;i=i+12|0;i=i+7&-8;eX=i;i=i+12|0;i=i+7&-8;eY=i;i=i+4|0;i=i+7&-8;eZ=i;i=i+12|0;i=i+7&-8;e_=i;i=i+12|0;i=i+7&-8;e$=i;i=i+4|0;i=i+7&-8;e0=i;i=i+12|0;i=i+7&-8;e1=i;i=i+12|0;i=i+7&-8;e2=i;i=i+4|0;i=i+7&-8;e3=i;i=i+12|0;i=i+7&-8;e4=i;i=i+12|0;i=i+7&-8;e5=i;i=i+4|0;i=i+7&-8;e6=i;i=i+12|0;i=i+7&-8;c[b+1904>>2]=d;c[b+1912>>2]=e;c[b+1920>>2]=f;c[b+1928>>2]=h;c[b+1936>>2]=j;c[b+1944>>2]=k;c[b+1952>>2]=l;c[b+1960>>2]=m;c[b+1968>>2]=n;c[b+1976>>2]=o;c[b+1984>>2]=p;c[b+1992>>2]=q;c[b+2e3>>2]=r;c[b+2008>>2]=s;c[b+2016>>2]=t;c[b+2024>>2]=u;c[b+2032>>2]=v;c[b+4760>>2]=e7;c[b+4768>>2]=e8;c[b+4776>>2]=e9;c[b+4784>>2]=fa;c[b+4792>>2]=fb;c[b+4800>>2]=fc;c[b+4808>>2]=fd;c[b+4816>>2]=fe;c[b+4824>>2]=ff;c[b+4832>>2]=fg;c[b+4840>>2]=fh;c[b+4848>>2]=fi;c[b+4856>>2]=fj;c[b+4864>>2]=fk;c[b+4872>>2]=fl;c[b+4880>>2]=fm;c[b+4888>>2]=fn;c[b+4896>>2]=fo;c[b+4904>>2]=fp;c[b+4912>>2]=fq;c[b+4920>>2]=fr;c[b+4928>>2]=fs;c[b+4936>>2]=ft;c[b+4944>>2]=fu;c[b+4952>>2]=fv;c[b+4960>>2]=fw;c[b+4968>>2]=fx;c[b+4976>>2]=fy;c[b+4984>>2]=fz;c[b+4992>>2]=fA;c[b+5e3>>2]=fB;c[b+5008>>2]=fC;c[b+5016>>2]=fD;c[b+5024>>2]=fE;c[b+5032>>2]=fF;c[b+5040>>2]=fG;c[b+5048>>2]=fH;c[b+5056>>2]=fI;c[b+5064>>2]=fJ;c[b+5072>>2]=fK;c[b+5080>>2]=fL;c[b+5088>>2]=fM;c[b+5096>>2]=fN;c[b+5104>>2]=fO;c[b+5112>>2]=fP;c[b+5120>>2]=fQ;c[b+5128>>2]=fR;c[b+5136>>2]=fS;c[b+5144>>2]=fT;c[b+5152>>2]=fU;c[b+5160>>2]=fV;c[b+5168>>2]=fW;c[b+5176>>2]=fX;c[b+5184>>2]=fY;c[b+5192>>2]=fZ;c[b+5200>>2]=f_;c[b+5208>>2]=f$;c[b+5216>>2]=f0;c[b+5224>>2]=f1;c[b+5232>>2]=f2;c[b+5240>>2]=f3;c[b+5248>>2]=f4;c[b+5256>>2]=f5;c[b+5264>>2]=f6;c[b+5272>>2]=f7;c[b+5280>>2]=f8;c[b+5288>>2]=f9;c[b+5296>>2]=ga;c[b+5304>>2]=gb;c[b+5312>>2]=gc;c[b+5320>>2]=gd;c[b+5328>>2]=ge;c[b+5336>>2]=gf;c[b+5344>>2]=gg;c[b+5352>>2]=gh;c[b+5360>>2]=gi;c[b+5368>>2]=gj;c[b+5376>>2]=gk;c[b+5384>>2]=gl;c[b+5392>>2]=gm;c[b+5400>>2]=gn;c[b+5408>>2]=go;c[b+5416>>2]=gp;c[b+5424>>2]=gq;c[b+5432>>2]=gr;c[b+5440>>2]=gs;c[b+5448>>2]=gt;c[b+5456>>2]=gu;c[b+5464>>2]=gv;c[b+5472>>2]=gw;c[b+5480>>2]=gx;c[b+5488>>2]=gy;c[b+5496>>2]=gz;c[b+5504>>2]=gA;c[b+5512>>2]=gB;c[b+5520>>2]=gC;c[b+5528>>2]=gD;c[b+5536>>2]=gE;c[b+5544>>2]=gF;c[b+5552>>2]=gG;c[b+5560>>2]=gH;c[b+5568>>2]=gI;c[b+5576>>2]=gJ;c[b+5584>>2]=gK;c[b+5592>>2]=gL;c[b+5600>>2]=gM;c[b+5608>>2]=gN;c[b+5616>>2]=gO;c[b+5624>>2]=gP;c[b+5632>>2]=gQ;c[b+5640>>2]=gR;c[b+5648>>2]=gS;c[b+5656>>2]=gT;c[b+5664>>2]=gU;c[b+5672>>2]=gV;c[b+5680>>2]=gW;c[b+5688>>2]=gX;c[b+5696>>2]=gY;c[b+5704>>2]=gZ;c[b+5712>>2]=g_;c[b+5720>>2]=g$;c[b+5728>>2]=g0;c[b+5736>>2]=g1;c[b+5744>>2]=g2;c[b+5752>>2]=g3;c[b+5760>>2]=g4;c[b+5768>>2]=g5;c[b+5776>>2]=g6;c[b+5784>>2]=g7;c[b+5792>>2]=g8;c[b+5800>>2]=g9;c[b+5808>>2]=ha;c[b+5816>>2]=hb;c[b+5824>>2]=hc;c[b+5832>>2]=hd;c[b+5840>>2]=he;c[b+5848>>2]=hf;c[b+5856>>2]=hg;c[b+5864>>2]=hh;c[b+5872>>2]=hi;c[b+5880>>2]=hj;c[b+5888>>2]=hk;c[b+5896>>2]=hl;c[b+5904>>2]=hm;c[b+5912>>2]=hn;c[b+5920>>2]=ho;c[b+5928>>2]=hp;c[b+5936>>2]=hq;c[b+5944>>2]=hr;c[b+5952>>2]=hs;c[b+5960>>2]=ht;c[b+5968>>2]=hu;c[b+5976>>2]=hv;c[b+5984>>2]=hw;c[b+5992>>2]=hx;c[b+6e3>>2]=hy;c[b+6008>>2]=hz;c[b+6016>>2]=hB;c[b+6024>>2]=hD;c[b+6032>>2]=hE;c[b+6040>>2]=hF;c[b+6048>>2]=hG;c[b+6056>>2]=hH;c[b+6064>>2]=hI;c[b+6072>>2]=hJ;c[b+6080>>2]=hK;c[b+6088>>2]=hL;c[b+6096>>2]=hM;c[b+6104>>2]=hN;c[b+6112>>2]=hO;c[b+6120>>2]=hP;c[b+6128>>2]=hQ;c[b+6136>>2]=hR;c[b+6144>>2]=hS;c[b+6152>>2]=hT;c[b+6160>>2]=hU;c[b+6168>>2]=hV;c[b+6176>>2]=hW;c[b+6184>>2]=hX;c[b+6192>>2]=hY;c[b+6200>>2]=hZ;c[b+6208>>2]=h_;c[b+6216>>2]=h$;c[b+6224>>2]=h0;c[b+6232>>2]=h1;c[b+6240>>2]=h2;c[b+6248>>2]=h3;c[b+6256>>2]=h4;c[b+6264>>2]=h5;c[b+6272>>2]=h6;c[b+6280>>2]=h7;c[b+6288>>2]=h8;c[b+6296>>2]=h9;c[b+6304>>2]=ia;c[b+6312>>2]=ib;c[b+6320>>2]=ic;c[b+6328>>2]=id;c[b+6336>>2]=ie;c[b+6344>>2]=ig;c[b+6352>>2]=ih;c[b+6360>>2]=ii;c[b+6368>>2]=ij;c[b+6376>>2]=ik;c[b+6384>>2]=il;c[b+6392>>2]=im;c[b+6400>>2]=io;c[b+6408>>2]=ip;c[b+6416>>2]=iq;c[b+6424>>2]=ir;c[b+6432>>2]=is;c[b+6440>>2]=it;c[b+6448>>2]=iu;c[b+6456>>2]=iv;c[b+6464>>2]=iw;c[b+6472>>2]=ix;c[b+6480>>2]=iy;c[b+6488>>2]=iz;c[b+6496>>2]=iA;c[b+6504>>2]=iB;c[b+6512>>2]=iC;c[b+6520>>2]=iD;c[b+6528>>2]=iE;c[b+6536>>2]=iF;c[b+6544>>2]=iG;c[b+6552>>2]=iH;c[b+6560>>2]=iI;c[b+6568>>2]=iJ;c[b+6576>>2]=iK;c[b+6584>>2]=iL;c[b+6592>>2]=iM;c[b+6600>>2]=iN;c[b+6608>>2]=iO;c[b+6616>>2]=iP;c[b+6624>>2]=iQ;c[b+6632>>2]=iR;c[b+6640>>2]=iS;c[b+6648>>2]=iT;c[b+6656>>2]=iU;c[b+6664>>2]=iV;c[b+6672>>2]=iW;c[b+6680>>2]=iX;c[b+6688>>2]=iY;c[b+6696>>2]=iZ;c[b+6704>>2]=i_;c[b+6712>>2]=i$;c[b+6720>>2]=i0;c[b+6728>>2]=i1;c[b+6736>>2]=i2;c[b+6744>>2]=i3;c[b+6752>>2]=i4;c[b+6760>>2]=i5;c[b+6768>>2]=i6;c[b+6776>>2]=i7;c[b+6784>>2]=i8;c[b+6792>>2]=i9;c[b+6800>>2]=ja;c[b+6808>>2]=jb;c[b+6816>>2]=jc;c[b+6824>>2]=jd;c[b+6832>>2]=je;c[b+6840>>2]=jf;c[b+6848>>2]=jg;c[b+6856>>2]=jh;c[b+6864>>2]=ji;c[b+6872>>2]=jj;c[b+6880>>2]=jk;c[b+6888>>2]=jl;c[b+6896>>2]=jm;c[b+6904>>2]=jn;c[b+6912>>2]=jo;c[b+7064>>2]=jp;c[b+7272>>2]=jq;c[b+7536>>2]=jr;c[b+7968>>2]=js;c[b+39768>>2]=jt;c[b+39776>>2]=ju;c[b+39872>>2]=0;c[b+39876>>2]=0;_read_input_xml$10(b);e7=c[b+4760>>2]|0;e8=c[b+4768>>2]|0;e9=c[b+4776>>2]|0;fa=c[b+4784>>2]|0;fb=c[b+4792>>2]|0;fc=c[b+4800>>2]|0;fd=c[b+4808>>2]|0;fe=c[b+4816>>2]|0;ff=c[b+4824>>2]|0;fg=c[b+4832>>2]|0;fh=c[b+4840>>2]|0;fi=c[b+4848>>2]|0;fj=c[b+4856>>2]|0;fk=c[b+4864>>2]|0;fl=c[b+4872>>2]|0;fm=c[b+4880>>2]|0;fn=c[b+4888>>2]|0;fo=c[b+4896>>2]|0;fp=c[b+4904>>2]|0;fq=c[b+4912>>2]|0;fr=c[b+4920>>2]|0;fs=c[b+4928>>2]|0;ft=c[b+4936>>2]|0;fu=c[b+4944>>2]|0;fv=c[b+4952>>2]|0;fw=c[b+4960>>2]|0;fx=c[b+4968>>2]|0;fy=c[b+4976>>2]|0;fz=c[b+4984>>2]|0;fA=c[b+4992>>2]|0;fB=c[b+5e3>>2]|0;fC=c[b+5008>>2]|0;fD=c[b+5016>>2]|0;fE=c[b+5024>>2]|0;fF=c[b+5032>>2]|0;fG=c[b+5040>>2]|0;fH=c[b+5048>>2]|0;fI=c[b+5056>>2]|0;fJ=c[b+5064>>2]|0;fK=c[b+5072>>2]|0;fL=c[b+5080>>2]|0;fM=c[b+5088>>2]|0;fN=c[b+5096>>2]|0;fO=c[b+5104>>2]|0;fP=c[b+5112>>2]|0;fQ=c[b+5120>>2]|0;fR=c[b+5128>>2]|0;fS=c[b+5136>>2]|0;fT=c[b+5144>>2]|0;fU=c[b+5152>>2]|0;fV=c[b+5160>>2]|0;fW=c[b+5168>>2]|0;fX=c[b+5176>>2]|0;fY=c[b+5184>>2]|0;fZ=c[b+5192>>2]|0;f_=c[b+5200>>2]|0;f$=c[b+5208>>2]|0;f0=c[b+5216>>2]|0;f1=c[b+5224>>2]|0;f2=c[b+5232>>2]|0;f3=c[b+5240>>2]|0;f4=c[b+5248>>2]|0;f5=c[b+5256>>2]|0;f6=c[b+5264>>2]|0;f7=c[b+5272>>2]|0;f8=c[b+5280>>2]|0;f9=c[b+5288>>2]|0;ga=c[b+5296>>2]|0;gb=c[b+5304>>2]|0;gc=c[b+5312>>2]|0;gd=c[b+5320>>2]|0;ge=c[b+5328>>2]|0;gf=c[b+5336>>2]|0;gg=c[b+5344>>2]|0;gh=c[b+5352>>2]|0;gi=c[b+5360>>2]|0;gj=c[b+5368>>2]|0;gk=c[b+5376>>2]|0;gl=c[b+5384>>2]|0;gm=c[b+5392>>2]|0;gn=c[b+5400>>2]|0;go=c[b+5408>>2]|0;gp=c[b+5416>>2]|0;gq=c[b+5424>>2]|0;gr=c[b+5432>>2]|0;gs=c[b+5440>>2]|0;gt=c[b+5448>>2]|0;gu=c[b+5456>>2]|0;gv=c[b+5464>>2]|0;gw=c[b+5472>>2]|0;gx=c[b+5480>>2]|0;gy=c[b+5488>>2]|0;gz=c[b+5496>>2]|0;gA=c[b+5504>>2]|0;gB=c[b+5512>>2]|0;gC=c[b+5520>>2]|0;gD=c[b+5528>>2]|0;gE=c[b+5536>>2]|0;gF=c[b+5544>>2]|0;gG=c[b+5552>>2]|0;gH=c[b+5560>>2]|0;gI=c[b+5568>>2]|0;gJ=c[b+5576>>2]|0;gK=c[b+5584>>2]|0;gL=c[b+5592>>2]|0;gM=c[b+5600>>2]|0;gN=c[b+5608>>2]|0;gO=c[b+5616>>2]|0;gP=c[b+5624>>2]|0;gQ=c[b+5632>>2]|0;gR=c[b+5640>>2]|0;gS=c[b+5648>>2]|0;gT=c[b+5656>>2]|0;gU=c[b+5664>>2]|0;gV=c[b+5672>>2]|0;gW=c[b+5680>>2]|0;gX=c[b+5688>>2]|0;gY=c[b+5696>>2]|0;gZ=c[b+5704>>2]|0;g_=c[b+5712>>2]|0;g$=c[b+5720>>2]|0;g0=c[b+5728>>2]|0;g1=c[b+5736>>2]|0;g2=c[b+5744>>2]|0;g3=c[b+5752>>2]|0;g4=c[b+5760>>2]|0;g5=c[b+5768>>2]|0;g6=c[b+5776>>2]|0;g7=c[b+5784>>2]|0;g8=c[b+5792>>2]|0;g9=c[b+5800>>2]|0;ha=c[b+5808>>2]|0;hb=c[b+5816>>2]|0;hc=c[b+5824>>2]|0;hd=c[b+5832>>2]|0;he=c[b+5840>>2]|0;hf=c[b+5848>>2]|0;hg=c[b+5856>>2]|0;hh=c[b+5864>>2]|0;hi=c[b+5872>>2]|0;hj=c[b+5880>>2]|0;hk=c[b+5888>>2]|0;hl=c[b+5896>>2]|0;hm=c[b+5904>>2]|0;hn=c[b+5912>>2]|0;ho=c[b+5920>>2]|0;hp=c[b+5928>>2]|0;hq=c[b+5936>>2]|0;hr=c[b+5944>>2]|0;hs=c[b+5952>>2]|0;ht=c[b+5960>>2]|0;hu=c[b+5968>>2]|0;hv=c[b+5976>>2]|0;hw=c[b+5984>>2]|0;hx=c[b+5992>>2]|0;hy=c[b+6e3>>2]|0;hz=c[b+6008>>2]|0;hB=c[b+6016>>2]|0;hD=c[b+6024>>2]|0;hE=c[b+6032>>2]|0;hF=c[b+6040>>2]|0;hG=c[b+6048>>2]|0;hH=c[b+6056>>2]|0;hI=c[b+6064>>2]|0;hJ=c[b+6072>>2]|0;hK=c[b+6080>>2]|0;hL=c[b+6088>>2]|0;hM=c[b+6096>>2]|0;hN=c[b+6104>>2]|0;hO=c[b+6112>>2]|0;hP=c[b+6120>>2]|0;hQ=c[b+6128>>2]|0;hR=c[b+6136>>2]|0;hS=c[b+6144>>2]|0;hT=c[b+6152>>2]|0;hU=c[b+6160>>2]|0;hV=c[b+6168>>2]|0;hW=c[b+6176>>2]|0;hX=c[b+6184>>2]|0;hY=c[b+6192>>2]|0;hZ=c[b+6200>>2]|0;h_=c[b+6208>>2]|0;h$=c[b+6216>>2]|0;h0=c[b+6224>>2]|0;h1=c[b+6232>>2]|0;h2=c[b+6240>>2]|0;h3=c[b+6248>>2]|0;h4=c[b+6256>>2]|0;h5=c[b+6264>>2]|0;h6=c[b+6272>>2]|0;h7=c[b+6280>>2]|0;h8=c[b+6288>>2]|0;h9=c[b+6296>>2]|0;ia=c[b+6304>>2]|0;ib=c[b+6312>>2]|0;ic=c[b+6320>>2]|0;id=c[b+6328>>2]|0;ie=c[b+6336>>2]|0;ig=c[b+6344>>2]|0;ih=c[b+6352>>2]|0;ii=c[b+6360>>2]|0;ij=c[b+6368>>2]|0;ik=c[b+6376>>2]|0;il=c[b+6384>>2]|0;im=c[b+6392>>2]|0;io=c[b+6400>>2]|0;ip=c[b+6408>>2]|0;iq=c[b+6416>>2]|0;ir=c[b+6424>>2]|0;is=c[b+6432>>2]|0;it=c[b+6440>>2]|0;iu=c[b+6448>>2]|0;iv=c[b+6456>>2]|0;iw=c[b+6464>>2]|0;ix=c[b+6472>>2]|0;iy=c[b+6480>>2]|0;iz=c[b+6488>>2]|0;iA=c[b+6496>>2]|0;iB=c[b+6504>>2]|0;iC=c[b+6512>>2]|0;iD=c[b+6520>>2]|0;iE=c[b+6528>>2]|0;iF=c[b+6536>>2]|0;iG=c[b+6544>>2]|0;iH=c[b+6552>>2]|0;iI=c[b+6560>>2]|0;iJ=c[b+6568>>2]|0;iK=c[b+6576>>2]|0;iL=c[b+6584>>2]|0;iM=c[b+6592>>2]|0;iN=c[b+6600>>2]|0;iO=c[b+6608>>2]|0;iP=c[b+6616>>2]|0;iQ=c[b+6624>>2]|0;iR=c[b+6632>>2]|0;iS=c[b+6640>>2]|0;iT=c[b+6648>>2]|0;iU=c[b+6656>>2]|0;iV=c[b+6664>>2]|0;iW=c[b+6672>>2]|0;iX=c[b+6680>>2]|0;iY=c[b+6688>>2]|0;iZ=c[b+6696>>2]|0;i_=c[b+6704>>2]|0;i$=c[b+6712>>2]|0;i0=c[b+6720>>2]|0;i1=c[b+6728>>2]|0;i2=c[b+6736>>2]|0;i3=c[b+6744>>2]|0;i4=c[b+6752>>2]|0;i5=c[b+6760>>2]|0;i6=c[b+6768>>2]|0;i7=c[b+6776>>2]|0;i8=c[b+6784>>2]|0;i9=c[b+6792>>2]|0;ja=c[b+6800>>2]|0;jb=c[b+6808>>2]|0;jc=c[b+6816>>2]|0;jd=c[b+6824>>2]|0;je=c[b+6832>>2]|0;jf=c[b+6840>>2]|0;jg=c[b+6848>>2]|0;jh=c[b+6856>>2]|0;ji=c[b+6864>>2]|0;jj=c[b+6872>>2]|0;jk=c[b+6880>>2]|0;jl=c[b+6888>>2]|0;jm=c[b+6896>>2]|0;jn=c[b+6904>>2]|0;jo=c[b+6912>>2]|0;jp=c[b+7064>>2]|0;jq=c[b+7272>>2]|0;jr=c[b+7536>>2]|0;js=c[b+7968>>2]|0;jt=c[b+39768>>2]|0;ju=c[b+39776>>2]|0;c[b+1912>>2]=e;c[b+2024>>2]=u;c[b+2032>>2]=v;c[b+2040>>2]=w;c[b+2048>>2]=x;c[b+2056>>2]=y;c[b+2064>>2]=z;c[b+2072>>2]=A;c[b+2080>>2]=D;c[b+2088>>2]=E;c[b+2096>>2]=F;c[b+2104>>2]=G;c[b+2112>>2]=H;c[b+2120>>2]=K;c[b+2128>>2]=L;c[b+2136>>2]=M;c[b+2144>>2]=N;c[b+2152>>2]=O;c[b+2160>>2]=P;c[b+2168>>2]=Q;c[b+2176>>2]=R;c[b+2184>>2]=S;c[b+2192>>2]=T;c[b+2200>>2]=U;c[b+2208>>2]=V;c[b+2216>>2]=W;c[b+2224>>2]=X;c[b+2232>>2]=Y;c[b+2240>>2]=Z;c[b+2248>>2]=_;c[b+2256>>2]=$;c[b+2264>>2]=aa;c[b+2272>>2]=ab;c[b+2280>>2]=ac;c[b+2288>>2]=ad;c[b+2296>>2]=ae;c[b+2304>>2]=af;c[b+2312>>2]=ag;c[b+2320>>2]=ah;c[b+2328>>2]=ai;c[b+6880>>2]=jk;c[b+6888>>2]=jl;c[b+6896>>2]=jm;c[b+7272>>2]=jq;c[b+7536>>2]=jr;c[b+7968>>2]=js;c[b+10088>>2]=jv;c[b+39776>>2]=ju;c[b+39864>>2]=0;c[b+39868>>2]=0;_read_input_xml$9(b);jv=c[b+10088>>2]|0;ju=c[b+39776>>2]|0;do{if((jv|0)==(c[(d+104|0)>>2]|0)){if((c[L>>2]|0)!=((c[(d+108|0)>>2]|0)-(jv<<1)|0)){break}if((c[M>>2]|0)!=(c[(d+128|0)>>2]|0)){break}if((c[O>>2]|0)!=(c[(d+132|0)>>2]|0)){break}if((c[N>>2]|0)!=(c[(d+116|0)>>2]|0)){break}if((c[Q>>2]|0)!=(c[(d+136|0)>>2]|0)){break}if((c[P>>2]|0)!=(c[(d+120|0)>>2]|0)){break}if((c[S>>2]|0)!=(c[(d+140|0)>>2]|0)){break}if((c[R>>2]|0)!=(c[(d+124|0)>>2]|0)){break}hA(4,1,31528,(ju=i,i=i+1|0,i=i+7&-8,c[ju>>2]=0,ju)|0);i=ju;L988:do{if((c[(d+104|0)>>2]|0)>0){ai=(b+1680|0)+24|0;ah=0;c[b+1904>>2]=d;c[b+1928>>2]=h;c[b+2336>>2]=aj;c[b+2344>>2]=ak;c[b+2352>>2]=al;c[b+2360>>2]=am;c[b+2368>>2]=an;c[b+2376>>2]=ao;c[b+2384>>2]=ap;c[b+2392>>2]=aq;c[b+2400>>2]=ar;c[b+2408>>2]=as;c[b+2416>>2]=at;c[b+2424>>2]=au;c[b+2432>>2]=av;c[b+2440>>2]=aw;c[b+2448>>2]=ax;c[b+2456>>2]=ay;c[b+2464>>2]=az;c[b+2472>>2]=aA;c[b+2480>>2]=aB;c[b+2488>>2]=aC;c[b+2496>>2]=aD;c[b+2504>>2]=aE;c[b+2512>>2]=aF;c[b+2520>>2]=aG;c[b+2528>>2]=aH;c[b+2536>>2]=aI;c[b+2544>>2]=aJ;c[b+2552>>2]=aK;c[b+2560>>2]=aL;c[b+2568>>2]=aM;c[b+2576>>2]=aN;c[b+2584>>2]=aO;c[b+2592>>2]=aP;c[b+2600>>2]=aQ;c[b+2608>>2]=aS;c[b+2616>>2]=aT;c[b+2624>>2]=aU;c[b+2632>>2]=aV;c[b+2640>>2]=aW;c[b+2648>>2]=aX;c[b+2656>>2]=aY;c[b+2664>>2]=aZ;c[b+2672>>2]=a_;c[b+2680>>2]=a$;c[b+2688>>2]=a0;c[b+2696>>2]=a1;c[b+2704>>2]=a2;c[b+2712>>2]=a3;c[b+2720>>2]=a4;c[b+10168>>2]=ai;c[b+10176>>2]=ah;c[b+39768>>2]=jt;c[b+39776>>2]=ju;c[b+39848>>2]=0;c[b+39852>>2]=0;_read_input_xml$7(b);ah=c[b+10176>>2]|0;jt=c[b+39768>>2]|0;ju=c[b+39776>>2]|0;I=c[b+39848>>2]|0;B=c[b+39852>>2]|0;J=+g[b+39852>>2];c[b+39848>>2]=0;c[b+39852>>2]=0;if((I|0)==1){break}if((I|0)==2){switch(B|0){case 2:{break L988}}}}}while(0);if((c[17800]|0)!=0){dd[c[3504]&511](4)}hA(4,1,23272,(ju=i,i=i+1|0,i=i+7&-8,c[ju>>2]=0,ju)|0);i=ju;L1725:do{if((c[(d+104|0)>>2]|0)>0){ah=(b+1680|0)+36|0;ai=0;L1727:while(1){c[a6>>2]=ai;ag=kc(ah,a6)|0;a[a7]=8;C=1701667182;a[a7+1|0]=C;C=C>>8;a[(a7+1|0)+1|0]=C;C=C>>8;a[(a7+1|0)+2|0]=C;C=C>>8;a[(a7+1|0)+3|0]=C;a[a7+5|0]=0;af=kp(ag,b+1320|0,a7)|0;ae=c[af>>2]|0;c[b+1904>>2]=d;c[b+1928>>2]=h;c[b+2728>>2]=a5;c[b+2744>>2]=a7;c[b+2752>>2]=a8;c[b+2760>>2]=a9;c[b+2768>>2]=ba;c[b+2776>>2]=bb;c[b+2784>>2]=bc;c[b+2792>>2]=bd;c[b+2800>>2]=be;c[b+2808>>2]=bf;c[b+2816>>2]=bg;c[b+2824>>2]=bh;c[b+2832>>2]=bi;c[b+2840>>2]=bj;c[b+2848>>2]=bk;c[b+2856>>2]=bl;c[b+2864>>2]=bm;c[b+2872>>2]=bn;c[b+2880>>2]=bo;c[b+2888>>2]=bp;c[b+2896>>2]=bq;c[b+2904>>2]=br;c[b+2912>>2]=bs;c[b+2920>>2]=bt;c[b+2928>>2]=bu;c[b+2936>>2]=bv;c[b+2944>>2]=bw;c[b+2952>>2]=bx;c[b+2960>>2]=by;c[b+2968>>2]=bz;c[b+2976>>2]=bA;c[b+2984>>2]=bB;c[b+2992>>2]=bC;c[b+3e3>>2]=bD;c[b+3008>>2]=bE;c[b+3016>>2]=bF;c[b+3024>>2]=bG;c[b+3032>>2]=bH;c[b+3040>>2]=bI;c[b+3048>>2]=bJ;c[b+3056>>2]=bK;c[b+3064>>2]=bL;c[b+3072>>2]=bM;c[b+3080>>2]=bN;c[b+3088>>2]=bO;c[b+3096>>2]=bP;c[b+3104>>2]=bQ;c[b+3112>>2]=bR;c[b+12744>>2]=ah;c[b+12752>>2]=ai;c[b+12760>>2]=ag;c[b+12768>>2]=af;c[b+12776>>2]=ae;c[b+39768>>2]=jt;c[b+39776>>2]=ju;c[b+39840>>2]=0;c[b+39844>>2]=0;_read_input_xml$6(b);ai=c[b+12752>>2]|0;jt=c[b+39768>>2]|0;ju=c[b+39776>>2]|0;I=c[b+39840>>2]|0;B=c[b+39844>>2]|0;J=+g[b+39844>>2];c[b+39840>>2]=0;c[b+39844>>2]=0;if((I|0)==1){break}if((I|0)==2){switch(B|0){case 16:{break L1727};case 17:{break L1725}}}}if((jt|0)==1567){ml(0)}else if((jt|0)==1586){ml(0)}else if((jt|0)==1608){ml(0)}else if((jt|0)==1627){ml(0)}else if((jt|0)==1646){ml(0)}else if((jt|0)==1665){ml(0)}else if((jt|0)==1686){ml(0)}else if((jt|0)==1705){ml(0)}else if((jt|0)==1726){ml(0)}else if((jt|0)==1745){ml(0)}else if((jt|0)==1764){ml(0)}else if((jt|0)==1783){ml(0)}else if((jt|0)==1801){ml(0)}else if((jt|0)==1820){ml(0)}else if((jt|0)==1838){ml(0)}else if((jt|0)==1857){ml(0)}else if((jt|0)==1876){ml(0)}else if((jt|0)==1895){ml(0)}else if((jt|0)==1913){ml(0)}else if((jt|0)==1932){ml(0)}else if((jt|0)==1952){ml(0)}else if((jt|0)==1971){ml(0)}else if((jt|0)==1989){ml(0)}else if((jt|0)==2008){ml(0)}else if((jt|0)==2028){ml(0)}else if((jt|0)==2047){ml(0)}else if((jt|0)==2067){ml(0)}else if((jt|0)==2086){ml(0)}else if((jt|0)==2104){ml(0)}else if((jt|0)==2123){ml(0)}else if((jt|0)==2141){ml(0)}else if((jt|0)==2160){ml(0)}else if((jt|0)==2251){ml(0)}}}while(0);if((c[17800]|0)!=0){dd[c[3504]&511](4)}hA(4,1,23008,(ju=i,i=i+1|0,i=i+7&-8,c[ju>>2]=0,ju)|0);i=ju;ai=c[(d+104|0)>>2]<<1;L2462:do{if(((c[(d+108|0)>>2]|0)-ai|0)>0){ah=(b+1680|0)+48|0;ae=0;af=ai;L2464:while(1){ag=ae+af|0;c[bT>>2]=ae;ad=kc(ah,bT)|0;a[bU]=8;C=1701667182;a[bU+1|0]=C;C=C>>8;a[(bU+1|0)+1|0]=C;c[b+1904>>2]=d;c[b+1928>>2]=h;c[b+3120>>2]=bS;c[b+3136>>2]=bU;c[b+3144>>2]=bV;c[b+3152>>2]=bW;c[b+3160>>2]=bX;c[b+3168>>2]=bY;c[b+3176>>2]=bZ;c[b+3184>>2]=b_;c[b+3192>>2]=b$;c[b+3200>>2]=b0;c[b+3208>>2]=b2;c[b+3216>>2]=b3;c[b+3224>>2]=b4;c[b+3232>>2]=b5;c[b+3240>>2]=b6;c[b+3248>>2]=b7;c[b+3256>>2]=b8;c[b+3264>>2]=b9;c[b+3272>>2]=ca;c[b+3280>>2]=cb;c[b+3288>>2]=cc;c[b+3296>>2]=cd;c[b+3304>>2]=ce;c[b+3312>>2]=cf;c[b+3320>>2]=cg;c[b+3328>>2]=ch;c[b+3336>>2]=ci;c[b+3344>>2]=cj;c[b+3352>>2]=ck;c[b+3360>>2]=cl;c[b+3368>>2]=cm;c[b+3376>>2]=cn;c[b+3384>>2]=co;c[b+3392>>2]=cp;c[b+3400>>2]=cq;c[b+3408>>2]=cr;c[b+3416>>2]=cs;c[b+3424>>2]=ct;c[b+3432>>2]=cu;c[b+3440>>2]=cv;c[b+3448>>2]=cw;c[b+3456>>2]=cx;c[b+3464>>2]=cy;c[b+3472>>2]=cz;c[b+3480>>2]=cA;c[b+3488>>2]=cB;c[b+3496>>2]=cC;c[b+3504>>2]=cD;c[b+15368>>2]=ah;c[b+15376>>2]=af;c[b+15384>>2]=ae;c[b+15392>>2]=ag;c[b+15400>>2]=ad;c[b+39768>>2]=jt;c[b+39776>>2]=ju;c[b+39832>>2]=0;c[b+39836>>2]=0;_read_input_xml$5(b);af=c[b+15376>>2]|0;ae=c[b+15384>>2]|0;jt=c[b+39768>>2]|0;ju=c[b+39776>>2]|0;I=c[b+39832>>2]|0;B=c[b+39836>>2]|0;J=+g[b+39836>>2];c[b+39832>>2]=0;c[b+39836>>2]=0;if((I|0)==1){break}if((I|0)==2){switch(B|0){case 16:{break L2464};case 17:{break L2462}}}}if((jt|0)==2274){ml(0)}else if((jt|0)==2293){ml(0)}else if((jt|0)==2315){ml(0)}else if((jt|0)==2334){ml(0)}else if((jt|0)==2353){ml(0)}else if((jt|0)==2372){ml(0)}else if((jt|0)==2393){ml(0)}else if((jt|0)==2412){ml(0)}else if((jt|0)==2433){ml(0)}else if((jt|0)==2452){ml(0)}else if((jt|0)==2471){ml(0)}else if((jt|0)==2490){ml(0)}else if((jt|0)==2508){ml(0)}else if((jt|0)==2527){ml(0)}else if((jt|0)==2545){ml(0)}else if((jt|0)==2564){ml(0)}else if((jt|0)==2583){ml(0)}else if((jt|0)==2602){ml(0)}else if((jt|0)==2620){ml(0)}else if((jt|0)==2639){ml(0)}else if((jt|0)==2659){ml(0)}else if((jt|0)==2678){ml(0)}else if((jt|0)==2696){ml(0)}else if((jt|0)==2715){ml(0)}else if((jt|0)==2735){ml(0)}else if((jt|0)==2754){ml(0)}else if((jt|0)==2774){ml(0)}else if((jt|0)==2793){ml(0)}else if((jt|0)==2811){ml(0)}else if((jt|0)==2830){ml(0)}else if((jt|0)==2848){ml(0)}else if((jt|0)==2867){ml(0)}else if((jt|0)==2958){ml(0)}}}while(0);if((c[17800]|0)!=0){dd[c[3504]&511](4)}hA(4,1,22576,(ju=i,i=i+1|0,i=i+7&-8,c[ju>>2]=0,ju)|0);i=ju;c[b+1904>>2]=d;c[b+1920>>2]=f;c[b+1928>>2]=h;c[b+1936>>2]=j;c[b+3512>>2]=cE;c[b+3520>>2]=cF;c[b+3528>>2]=cG;c[b+3536>>2]=cH;c[b+3544>>2]=cI;c[b+3552>>2]=cJ;c[b+3560>>2]=cK;c[b+3568>>2]=cL;c[b+3576>>2]=cM;c[b+3584>>2]=cN;c[b+3592>>2]=cO;c[b+3600>>2]=cP;c[b+3608>>2]=cQ;c[b+3616>>2]=cR;c[b+3624>>2]=cS;c[b+3632>>2]=cT;c[b+3640>>2]=cU;c[b+3648>>2]=cV;c[b+3656>>2]=cW;c[b+3664>>2]=cX;c[b+3672>>2]=cY;c[b+3680>>2]=cZ;c[b+3688>>2]=c_;c[b+3696>>2]=c$;c[b+3704>>2]=c0;c[b+3712>>2]=c1;c[b+3720>>2]=c2;c[b+3728>>2]=c3;c[b+3736>>2]=c4;c[b+3744>>2]=c5;c[b+3752>>2]=c6;c[b+3760>>2]=c7;c[b+3768>>2]=c8;c[b+3776>>2]=c9;c[b+3784>>2]=da;c[b+3792>>2]=db;c[b+3800>>2]=dc;c[b+3808>>2]=de;c[b+3816>>2]=df;c[b+3824>>2]=dg;c[b+3832>>2]=dh;c[b+3840>>2]=di;c[b+3848>>2]=dj;c[b+3856>>2]=dk;c[b+3864>>2]=dl;c[b+3872>>2]=dm;c[b+3880>>2]=dn;c[b+3888>>2]=dp;c[b+3896>>2]=dq;c[b+3904>>2]=dr;c[b+3912>>2]=ds;c[b+3920>>2]=dt;c[b+3928>>2]=du;c[b+3936>>2]=dv;c[b+3944>>2]=dw;c[b+3952>>2]=dx;c[b+3960>>2]=dy;c[b+3968>>2]=dz;c[b+3976>>2]=dA;c[b+3984>>2]=dB;c[b+3992>>2]=dC;c[b+4e3>>2]=dD;c[b+4008>>2]=dE;c[b+4016>>2]=dF;c[b+4024>>2]=dG;c[b+4032>>2]=dH;c[b+4040>>2]=dI;c[b+4048>>2]=dJ;c[b+4056>>2]=dK;c[b+4064>>2]=dL;c[b+4072>>2]=dM;c[b+4080>>2]=dN;c[b+4088>>2]=dO;c[b+4096>>2]=dP;c[b+4104>>2]=dQ;c[b+4112>>2]=dR;c[b+4120>>2]=dS;c[b+4128>>2]=dT;c[b+4136>>2]=dU;c[b+4144>>2]=dV;c[b+4152>>2]=dW;c[b+4160>>2]=dX;c[b+4168>>2]=dY;c[b+4176>>2]=dZ;c[b+4184>>2]=d_;c[b+4192>>2]=d$;c[b+4200>>2]=d0;c[b+4208>>2]=d1;c[b+4216>>2]=d2;c[b+4224>>2]=d3;c[b+4232>>2]=d4;c[b+4240>>2]=d5;c[b+4248>>2]=d6;c[b+4256>>2]=d7;c[b+4264>>2]=d8;c[b+4272>>2]=d9;c[b+4280>>2]=ea;c[b+4288>>2]=eb;c[b+4296>>2]=ec;c[b+4304>>2]=ed;c[b+4312>>2]=ee;c[b+4320>>2]=ef;c[b+4328>>2]=eg;c[b+4336>>2]=eh;c[b+4344>>2]=ei;c[b+4352>>2]=ej;c[b+4360>>2]=ek;c[b+4368>>2]=el;c[b+4376>>2]=em;c[b+4384>>2]=en;c[b+4392>>2]=eo;c[b+4400>>2]=ep;c[b+4408>>2]=eq;c[b+4416>>2]=er;c[b+4424>>2]=es;c[b+4432>>2]=et;c[b+4440>>2]=eu;c[b+4448>>2]=ev;c[b+4456>>2]=ew;c[b+4464>>2]=ex;c[b+4472>>2]=ey;c[b+4480>>2]=ez;c[b+4488>>2]=eA;c[b+4496>>2]=eB;c[b+4504>>2]=eC;c[b+4512>>2]=eD;c[b+4520>>2]=eE;c[b+4528>>2]=eF;c[b+4536>>2]=eG;c[b+4544>>2]=eH;c[b+4552>>2]=eI;c[b+4560>>2]=eK;c[b+4568>>2]=eL;c[b+4576>>2]=eM;c[b+4584>>2]=eN;c[b+4592>>2]=eO;c[b+4600>>2]=eP;c[b+4608>>2]=eQ;c[b+4616>>2]=eR;c[b+4624>>2]=eS;c[b+4632>>2]=eT;c[b+4640>>2]=eU;c[b+4648>>2]=eV;c[b+4656>>2]=eW;c[b+4664>>2]=eX;c[b+4672>>2]=eY;c[b+4680>>2]=eZ;c[b+4688>>2]=e_;c[b+4696>>2]=e$;c[b+4704>>2]=e0;c[b+4712>>2]=e1;c[b+4720>>2]=e2;c[b+4728>>2]=e3;c[b+4736>>2]=e4;c[b+4744>>2]=e5;c[b+4752>>2]=e6;c[b+4760>>2]=e7;c[b+4768>>2]=e8;c[b+4776>>2]=e9;c[b+4784>>2]=fa;c[b+4792>>2]=fb;c[b+4800>>2]=fc;c[b+4808>>2]=fd;c[b+4816>>2]=fe;c[b+4824>>2]=ff;c[b+4832>>2]=fg;c[b+4840>>2]=fh;c[b+4848>>2]=fi;c[b+4856>>2]=fj;c[b+4864>>2]=fk;c[b+4872>>2]=fl;c[b+4880>>2]=fm;c[b+4888>>2]=fn;c[b+4896>>2]=fo;c[b+4904>>2]=fp;c[b+4912>>2]=fq;c[b+4920>>2]=fr;c[b+4928>>2]=fs;c[b+4936>>2]=ft;c[b+4944>>2]=fu;c[b+4952>>2]=fv;c[b+4960>>2]=fw;c[b+4968>>2]=fx;c[b+4976>>2]=fy;c[b+4984>>2]=fz;c[b+4992>>2]=fA;c[b+5e3>>2]=fB;c[b+5008>>2]=fC;c[b+5016>>2]=fD;c[b+5024>>2]=fE;c[b+5032>>2]=fF;c[b+5040>>2]=fG;c[b+5048>>2]=fH;c[b+5056>>2]=fI;c[b+5064>>2]=fJ;c[b+5072>>2]=fK;c[b+5080>>2]=fL;c[b+5088>>2]=fM;c[b+5096>>2]=fN;c[b+5104>>2]=fO;c[b+5112>>2]=fP;c[b+5120>>2]=fQ;c[b+5128>>2]=fR;c[b+5136>>2]=fS;c[b+5144>>2]=fT;c[b+5152>>2]=fU;c[b+5160>>2]=fV;c[b+5168>>2]=fW;c[b+5176>>2]=fX;c[b+5184>>2]=fY;c[b+5192>>2]=fZ;c[b+5200>>2]=f_;c[b+5208>>2]=f$;c[b+5216>>2]=f0;c[b+5224>>2]=f1;c[b+5232>>2]=f2;c[b+5240>>2]=f3;c[b+5248>>2]=f4;c[b+5256>>2]=f5;c[b+5264>>2]=f6;c[b+5272>>2]=f7;c[b+5280>>2]=f8;c[b+5288>>2]=f9;c[b+5296>>2]=ga;c[b+5304>>2]=gb;c[b+5312>>2]=gc;c[b+5320>>2]=gd;c[b+5328>>2]=ge;c[b+5336>>2]=gf;c[b+5344>>2]=gg;c[b+5352>>2]=gh;c[b+5360>>2]=gi;c[b+5368>>2]=gj;c[b+5376>>2]=gk;c[b+5384>>2]=gl;c[b+5392>>2]=gm;c[b+5400>>2]=gn;c[b+5408>>2]=go;c[b+5416>>2]=gp;c[b+5424>>2]=gq;c[b+5432>>2]=gr;c[b+5440>>2]=gs;c[b+5448>>2]=gt;c[b+5456>>2]=gu;c[b+5464>>2]=gv;c[b+5472>>2]=gw;c[b+5480>>2]=gx;c[b+5488>>2]=gy;c[b+5496>>2]=gz;c[b+5504>>2]=gA;c[b+5512>>2]=gB;c[b+5520>>2]=gC;c[b+5528>>2]=gD;c[b+5536>>2]=gE;c[b+5544>>2]=gF;c[b+5552>>2]=gG;c[b+5560>>2]=gH;c[b+5568>>2]=gI;c[b+5576>>2]=gJ;c[b+5584>>2]=gK;c[b+5592>>2]=gL;c[b+5600>>2]=gM;c[b+5608>>2]=gN;c[b+5616>>2]=gO;c[b+5624>>2]=gP;c[b+5632>>2]=gQ;c[b+5640>>2]=gR;c[b+5648>>2]=gS;c[b+5656>>2]=gT;c[b+5664>>2]=gU;c[b+5672>>2]=gV;c[b+5680>>2]=gW;c[b+5688>>2]=gX;c[b+5696>>2]=gY;c[b+5704>>2]=gZ;c[b+5712>>2]=g_;c[b+5720>>2]=g$;c[b+5728>>2]=g0;c[b+5736>>2]=g1;c[b+5744>>2]=g2;c[b+5752>>2]=g3;c[b+5760>>2]=g4;c[b+5768>>2]=g5;c[b+5776>>2]=g6;c[b+5784>>2]=g7;c[b+5792>>2]=g8;c[b+5800>>2]=g9;c[b+5808>>2]=ha;c[b+5816>>2]=hb;c[b+5824>>2]=hc;c[b+5832>>2]=hd;c[b+5840>>2]=he;c[b+5848>>2]=hf;c[b+5856>>2]=hg;c[b+5864>>2]=hh;c[b+5872>>2]=hi;c[b+5880>>2]=hj;c[b+5888>>2]=hk;c[b+5896>>2]=hl;c[b+5904>>2]=hm;c[b+5912>>2]=hn;c[b+5920>>2]=ho;c[b+5928>>2]=hp;c[b+5936>>2]=hq;c[b+5944>>2]=hr;c[b+5952>>2]=hs;c[b+5960>>2]=ht;c[b+5968>>2]=hu;c[b+5976>>2]=hv;c[b+5984>>2]=hw;c[b+5992>>2]=hx;c[b+6e3>>2]=hy;c[b+6008>>2]=hz;c[b+6016>>2]=hB;c[b+6024>>2]=hD;c[b+6032>>2]=hE;c[b+6040>>2]=hF;c[b+6048>>2]=hG;c[b+6056>>2]=hH;c[b+6064>>2]=hI;c[b+6072>>2]=hJ;c[b+6080>>2]=hK;c[b+6088>>2]=hL;c[b+6096>>2]=hM;c[b+6104>>2]=hN;c[b+6112>>2]=hO;c[b+6120>>2]=hP;c[b+6128>>2]=hQ;c[b+6136>>2]=hR;c[b+6144>>2]=hS;c[b+6152>>2]=hT;c[b+6160>>2]=hU;c[b+6168>>2]=hV;c[b+6176>>2]=hW;c[b+6184>>2]=hX;c[b+6192>>2]=hY;c[b+6200>>2]=hZ;c[b+6208>>2]=h_;c[b+6216>>2]=h$;c[b+6224>>2]=h0;c[b+6232>>2]=h1;c[b+6240>>2]=h2;c[b+6248>>2]=h3;c[b+6256>>2]=h4;c[b+6264>>2]=h5;c[b+6272>>2]=h6;c[b+6280>>2]=h7;c[b+6288>>2]=h8;c[b+6296>>2]=h9;c[b+6304>>2]=ia;c[b+6312>>2]=ib;c[b+6320>>2]=ic;c[b+6328>>2]=id;c[b+6336>>2]=ie;c[b+6344>>2]=ig;c[b+6352>>2]=ih;c[b+6360>>2]=ii;c[b+6368>>2]=ij;c[b+6376>>2]=ik;c[b+6384>>2]=il;c[b+6392>>2]=im;c[b+6400>>2]=io;c[b+6408>>2]=ip;c[b+6416>>2]=iq;c[b+6424>>2]=ir;c[b+6432>>2]=is;c[b+6440>>2]=it;c[b+6448>>2]=iu;c[b+6456>>2]=iv;c[b+6464>>2]=iw;c[b+6472>>2]=ix;c[b+6480>>2]=iy;c[b+6488>>2]=iz;c[b+6496>>2]=iA;c[b+6504>>2]=iB;c[b+6512>>2]=iC;c[b+6520>>2]=iD;c[b+6528>>2]=iE;c[b+6536>>2]=iF;c[b+6544>>2]=iG;c[b+6552>>2]=iH;c[b+6560>>2]=iI;c[b+6568>>2]=iJ;c[b+6576>>2]=iK;c[b+6584>>2]=iL;c[b+6592>>2]=iM;c[b+6600>>2]=iN;c[b+6608>>2]=iO;c[b+6616>>2]=iP;c[b+6624>>2]=iQ;c[b+6632>>2]=iR;c[b+6640>>2]=iS;c[b+6648>>2]=iT;c[b+6656>>2]=iU;c[b+6664>>2]=iV;c[b+6672>>2]=iW;c[b+6680>>2]=iX;c[b+6688>>2]=iY;c[b+6696>>2]=iZ;c[b+6704>>2]=i_;c[b+6712>>2]=i$;c[b+6720>>2]=i0;c[b+6728>>2]=i1;c[b+6736>>2]=i2;c[b+6744>>2]=i3;c[b+6752>>2]=i4;c[b+6760>>2]=i5;c[b+6768>>2]=i6;c[b+6776>>2]=i7;c[b+6784>>2]=i8;c[b+6792>>2]=i9;c[b+6800>>2]=ja;c[b+6808>>2]=jb;c[b+6816>>2]=jc;c[b+6824>>2]=jd;c[b+6832>>2]=je;c[b+6840>>2]=jf;c[b+6848>>2]=jg;c[b+6856>>2]=jh;c[b+6864>>2]=ji;c[b+6872>>2]=jj;c[b+6904>>2]=jn;c[b+6912>>2]=jo;c[b+7064>>2]=jp;c[b+39768>>2]=jt;c[b+39776>>2]=ju;c[b+39856>>2]=0;c[b+39860>>2]=0;_read_input_xml$8(b);jt=c[b+39768>>2]|0;ju=c[b+39776>>2]|0;I=c[b+39856>>2]|0;B=c[b+39860>>2]|0;J=+g[b+39860>>2];c[b+39856>>2]=0;c[b+39860>>2]=0;if((I|0)==5){c[b+39880>>2]=5;break OL}}}while(0);if((c[17815]|c[17868]|0)!=0){hC(19,1,35584,(ju=i,i=i+1|0,i=i+7&-8,c[ju>>2]=0,ju)|0);i=ju;e6=c[(d+104|0)>>2]|0;hC(19,0,35088,(ju=i,i=i+16|0,c[ju>>2]=jv,c[ju+8>>2]=e6,ju)|0);i=ju;e6=(c[d+108>>2]|0)-(c[(d+104|0)>>2]<<1)|0;hC(19,0,34008,(ju=i,i=i+16|0,c[ju>>2]=c[L>>2],c[ju+8>>2]=e6,ju)|0);i=ju;e6=c[d+128>>2]|0;hC(19,0,33624,(ju=i,i=i+16|0,c[ju>>2]=c[M>>2],c[ju+8>>2]=e6,ju)|0);i=ju;e6=c[d+132>>2]|0;hC(19,0,33328,(ju=i,i=i+16|0,c[ju>>2]=c[O>>2],c[ju+8>>2]=e6,ju)|0);i=ju;e6=c[d+116>>2]|0;hC(19,0,33016,(ju=i,i=i+16|0,c[ju>>2]=c[N>>2],c[ju+8>>2]=e6,ju)|0);i=ju;e6=c[d+136>>2]|0;hC(19,0,32752,(ju=i,i=i+16|0,c[ju>>2]=c[Q>>2],c[ju+8>>2]=e6,ju)|0);i=ju;e6=c[d+120>>2]|0;hC(19,0,32400,(ju=i,i=i+16|0,c[ju>>2]=c[P>>2],c[ju+8>>2]=e6,ju)|0);i=ju;e6=c[d+140>>2]|0;hC(19,0,32040,(ju=i,i=i+16|0,c[ju>>2]=c[S>>2],c[ju+8>>2]=e6,ju)|0);i=ju;e6=c[d+124>>2]|0;hC(19,0,31776,(ju=i,i=i+16|0,c[ju>>2]=c[R>>2],c[ju+8>>2]=e6,ju)|0);i=ju;dd[c[3504]&511](19)}eJ(jp);aR(0)|0;b1(-1|0)}while(0)}
function ts(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a;h=g+f|0;i=h;j=c[23484]|0;if(g>>>0<j>>>0){cL();return 0}k=e&3;if(!((k|0)!=1&g>>>0<h>>>0)){cL();return 0}l=g+(f|4)|0;m=c[l>>2]|0;if((m&1|0)==0){cL();return 0}if((k|0)==0){if(b>>>0<256>>>0){n=0;return n|0}do{if(f>>>0>=(b+4|0)>>>0){if((f-b|0)>>>0>c[20020]<<1>>>0){break}else{n=a}return n|0}}while(0);n=0;return n|0}if(f>>>0>=b>>>0){k=f-b|0;if(k>>>0<=15>>>0){n=a;return n|0}c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|3;c[l>>2]=c[l>>2]|1;tt(g+b|0,k);n=a;return n|0}if((i|0)==(c[23486]|0)){k=(c[23483]|0)+f|0;if(k>>>0<=b>>>0){n=0;return n|0}l=k-b|0;c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=l|1;c[23486]=g+b;c[23483]=l;n=a;return n|0}if((i|0)==(c[23485]|0)){l=(c[23482]|0)+f|0;if(l>>>0<b>>>0){n=0;return n|0}k=l-b|0;if(k>>>0>15>>>0){c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|1;c[g+l>>2]=k;o=g+(l+4)|0;c[o>>2]=c[o>>2]&-2;p=g+b|0;q=k}else{c[d>>2]=e&1|l|2;e=g+(l+4)|0;c[e>>2]=c[e>>2]|1;p=0;q=0}c[23482]=q;c[23485]=p;n=a;return n|0}if((m&2|0)!=0){n=0;return n|0}p=(m&-8)+f|0;if(p>>>0<b>>>0){n=0;return n|0}q=p-b|0;e=m>>>3;L52:do{if(m>>>0<256>>>0){l=c[g+(f+8)>>2]|0;k=c[g+(f+12)>>2]|0;o=93960+(e<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<j>>>0){cL();return 0}if((c[l+12>>2]|0)==(i|0)){break}cL();return 0}}while(0);if((k|0)==(l|0)){c[23480]=c[23480]&~(1<<e);break}do{if((k|0)==(o|0)){r=k+8|0}else{if(k>>>0<j>>>0){cL();return 0}s=k+8|0;if((c[s>>2]|0)==(i|0)){r=s;break}cL();return 0}}while(0);c[l+12>>2]=k;c[r>>2]=l}else{o=h;s=c[g+(f+24)>>2]|0;t=c[g+(f+12)>>2]|0;do{if((t|0)==(o|0)){u=g+(f+20)|0;v=c[u>>2]|0;if((v|0)==0){w=g+(f+16)|0;x=c[w>>2]|0;if((x|0)==0){y=0;break}else{z=x;A=w}}else{z=v;A=u}while(1){u=z+20|0;v=c[u>>2]|0;if((v|0)!=0){z=v;A=u;continue}u=z+16|0;v=c[u>>2]|0;if((v|0)==0){break}else{z=v;A=u}}if(A>>>0<j>>>0){cL();return 0}else{c[A>>2]=0;y=z;break}}else{u=c[g+(f+8)>>2]|0;if(u>>>0<j>>>0){cL();return 0}v=u+12|0;if((c[v>>2]|0)!=(o|0)){cL();return 0}w=t+8|0;if((c[w>>2]|0)==(o|0)){c[v>>2]=t;c[w>>2]=u;y=t;break}else{cL();return 0}}}while(0);if((s|0)==0){break}t=g+(f+28)|0;l=94224+(c[t>>2]<<2)|0;do{if((o|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[23481]=c[23481]&~(1<<c[t>>2]);break L52}else{if(s>>>0<(c[23484]|0)>>>0){cL();return 0}k=s+16|0;if((c[k>>2]|0)==(o|0)){c[k>>2]=y}else{c[s+20>>2]=y}if((y|0)==0){break L52}}}while(0);if(y>>>0<(c[23484]|0)>>>0){cL();return 0}c[y+24>>2]=s;o=c[g+(f+16)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[23484]|0)>>>0){cL();return 0}else{c[y+16>>2]=o;c[o+24>>2]=y;break}}}while(0);o=c[g+(f+20)>>2]|0;if((o|0)==0){break}if(o>>>0<(c[23484]|0)>>>0){cL();return 0}else{c[y+20>>2]=o;c[o+24>>2]=y;break}}}while(0);if(q>>>0<16>>>0){c[d>>2]=p|c[d>>2]&1|2;y=g+(p|4)|0;c[y>>2]=c[y>>2]|1;n=a;return n|0}else{c[d>>2]=c[d>>2]&1|b|2;c[g+(b+4)>>2]=q|3;d=g+(p|4)|0;c[d>>2]=c[d>>2]|1;tt(g+b|0,q);n=a;return n|0}return 0}function tt(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=a;e=d+b|0;f=e;g=c[a+4>>2]|0;L1:do{if((g&1|0)==0){h=c[a>>2]|0;if((g&3|0)==0){return}i=d+(-h|0)|0;j=i;k=h+b|0;l=c[23484]|0;if(i>>>0<l>>>0){cL()}if((j|0)==(c[23485]|0)){m=d+(b+4)|0;if((c[m>>2]&3|0)!=3){n=j;o=k;break}c[23482]=k;c[m>>2]=c[m>>2]&-2;c[d+(4-h)>>2]=k|1;c[e>>2]=k;return}m=h>>>3;if(h>>>0<256>>>0){p=c[d+(8-h)>>2]|0;q=c[d+(12-h)>>2]|0;r=93960+(m<<1<<2)|0;do{if((p|0)!=(r|0)){if(p>>>0<l>>>0){cL()}if((c[p+12>>2]|0)==(j|0)){break}cL()}}while(0);if((q|0)==(p|0)){c[23480]=c[23480]&~(1<<m);n=j;o=k;break}do{if((q|0)==(r|0)){s=q+8|0}else{if(q>>>0<l>>>0){cL()}t=q+8|0;if((c[t>>2]|0)==(j|0)){s=t;break}cL()}}while(0);c[p+12>>2]=q;c[s>>2]=p;n=j;o=k;break}r=i;m=c[d+(24-h)>>2]|0;t=c[d+(12-h)>>2]|0;do{if((t|0)==(r|0)){u=16-h|0;v=d+(u+4)|0;w=c[v>>2]|0;if((w|0)==0){x=d+u|0;u=c[x>>2]|0;if((u|0)==0){y=0;break}else{z=u;A=x}}else{z=w;A=v}while(1){v=z+20|0;w=c[v>>2]|0;if((w|0)!=0){z=w;A=v;continue}v=z+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{z=w;A=v}}if(A>>>0<l>>>0){cL()}else{c[A>>2]=0;y=z;break}}else{v=c[d+(8-h)>>2]|0;if(v>>>0<l>>>0){cL()}w=v+12|0;if((c[w>>2]|0)!=(r|0)){cL()}x=t+8|0;if((c[x>>2]|0)==(r|0)){c[w>>2]=t;c[x>>2]=v;y=t;break}else{cL()}}}while(0);if((m|0)==0){n=j;o=k;break}t=d+(28-h)|0;l=94224+(c[t>>2]<<2)|0;do{if((r|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[23481]=c[23481]&~(1<<c[t>>2]);n=j;o=k;break L1}else{if(m>>>0<(c[23484]|0)>>>0){cL()}i=m+16|0;if((c[i>>2]|0)==(r|0)){c[i>>2]=y}else{c[m+20>>2]=y}if((y|0)==0){n=j;o=k;break L1}}}while(0);if(y>>>0<(c[23484]|0)>>>0){cL()}c[y+24>>2]=m;r=16-h|0;t=c[d+r>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[23484]|0)>>>0){cL()}else{c[y+16>>2]=t;c[t+24>>2]=y;break}}}while(0);t=c[d+(r+4)>>2]|0;if((t|0)==0){n=j;o=k;break}if(t>>>0<(c[23484]|0)>>>0){cL()}else{c[y+20>>2]=t;c[t+24>>2]=y;n=j;o=k;break}}else{n=a;o=b}}while(0);a=c[23484]|0;if(e>>>0<a>>>0){cL()}y=d+(b+4)|0;z=c[y>>2]|0;do{if((z&2|0)==0){if((f|0)==(c[23486]|0)){A=(c[23483]|0)+o|0;c[23483]=A;c[23486]=n;c[n+4>>2]=A|1;if((n|0)!=(c[23485]|0)){return}c[23485]=0;c[23482]=0;return}if((f|0)==(c[23485]|0)){A=(c[23482]|0)+o|0;c[23482]=A;c[23485]=n;c[n+4>>2]=A|1;c[n+A>>2]=A;return}A=(z&-8)+o|0;s=z>>>3;L100:do{if(z>>>0<256>>>0){g=c[d+(b+8)>>2]|0;t=c[d+(b+12)>>2]|0;h=93960+(s<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<a>>>0){cL()}if((c[g+12>>2]|0)==(f|0)){break}cL()}}while(0);if((t|0)==(g|0)){c[23480]=c[23480]&~(1<<s);break}do{if((t|0)==(h|0)){B=t+8|0}else{if(t>>>0<a>>>0){cL()}m=t+8|0;if((c[m>>2]|0)==(f|0)){B=m;break}cL()}}while(0);c[g+12>>2]=t;c[B>>2]=g}else{h=e;m=c[d+(b+24)>>2]|0;l=c[d+(b+12)>>2]|0;do{if((l|0)==(h|0)){i=d+(b+20)|0;p=c[i>>2]|0;if((p|0)==0){q=d+(b+16)|0;v=c[q>>2]|0;if((v|0)==0){C=0;break}else{D=v;E=q}}else{D=p;E=i}while(1){i=D+20|0;p=c[i>>2]|0;if((p|0)!=0){D=p;E=i;continue}i=D+16|0;p=c[i>>2]|0;if((p|0)==0){break}else{D=p;E=i}}if(E>>>0<a>>>0){cL()}else{c[E>>2]=0;C=D;break}}else{i=c[d+(b+8)>>2]|0;if(i>>>0<a>>>0){cL()}p=i+12|0;if((c[p>>2]|0)!=(h|0)){cL()}q=l+8|0;if((c[q>>2]|0)==(h|0)){c[p>>2]=l;c[q>>2]=i;C=l;break}else{cL()}}}while(0);if((m|0)==0){break}l=d+(b+28)|0;g=94224+(c[l>>2]<<2)|0;do{if((h|0)==(c[g>>2]|0)){c[g>>2]=C;if((C|0)!=0){break}c[23481]=c[23481]&~(1<<c[l>>2]);break L100}else{if(m>>>0<(c[23484]|0)>>>0){cL()}t=m+16|0;if((c[t>>2]|0)==(h|0)){c[t>>2]=C}else{c[m+20>>2]=C}if((C|0)==0){break L100}}}while(0);if(C>>>0<(c[23484]|0)>>>0){cL()}c[C+24>>2]=m;h=c[d+(b+16)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[23484]|0)>>>0){cL()}else{c[C+16>>2]=h;c[h+24>>2]=C;break}}}while(0);h=c[d+(b+20)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[23484]|0)>>>0){cL()}else{c[C+20>>2]=h;c[h+24>>2]=C;break}}}while(0);c[n+4>>2]=A|1;c[n+A>>2]=A;if((n|0)!=(c[23485]|0)){F=A;break}c[23482]=A;return}else{c[y>>2]=z&-2;c[n+4>>2]=o|1;c[n+o>>2]=o;F=o}}while(0);o=F>>>3;if(F>>>0<256>>>0){z=o<<1;y=93960+(z<<2)|0;C=c[23480]|0;b=1<<o;do{if((C&b|0)==0){c[23480]=C|b;G=y;H=93960+(z+2<<2)|0}else{o=93960+(z+2<<2)|0;d=c[o>>2]|0;if(d>>>0>=(c[23484]|0)>>>0){G=d;H=o;break}cL()}}while(0);c[H>>2]=n;c[G+12>>2]=n;c[n+8>>2]=G;c[n+12>>2]=y;return}y=n;G=F>>>8;do{if((G|0)==0){I=0}else{if(F>>>0>16777215>>>0){I=31;break}H=(G+1048320|0)>>>16&8;z=G<<H;b=(z+520192|0)>>>16&4;C=z<<b;z=(C+245760|0)>>>16&2;o=14-(b|H|z)+(C<<z>>>15)|0;I=F>>>((o+7|0)>>>0)&1|o<<1}}while(0);G=94224+(I<<2)|0;c[n+28>>2]=I;c[n+20>>2]=0;c[n+16>>2]=0;o=c[23481]|0;z=1<<I;if((o&z|0)==0){c[23481]=o|z;c[G>>2]=y;c[n+24>>2]=G;c[n+12>>2]=n;c[n+8>>2]=n;return}if((I|0)==31){J=0}else{J=25-(I>>>1)|0}I=F<<J;J=c[G>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(F|0)){break}K=J+16+(I>>>31<<2)|0;G=c[K>>2]|0;if((G|0)==0){L=126;break}else{I=I<<1;J=G}}if((L|0)==126){if(K>>>0<(c[23484]|0)>>>0){cL()}c[K>>2]=y;c[n+24>>2]=J;c[n+12>>2]=n;c[n+8>>2]=n;return}K=J+8|0;L=c[K>>2]|0;I=c[23484]|0;if(J>>>0<I>>>0){cL()}if(L>>>0<I>>>0){cL()}c[L+12>>2]=y;c[K>>2]=y;c[n+8>>2]=L;c[n+12>>2]=J;c[n+24>>2]=0;return}function tu(a){a=a|0;var b=0,d=0,e=0;b=(a|0)==0?1:a;while(1){d=to(b)|0;if((d|0)!=0){e=10;break}a=(I=c[24460]|0,c[24460]=I+0,I);if((a|0)==0){break}dx[a&7]()}if((e|0)==10){return d|0}d=cY(4)|0;c[d>>2]=59736;b6(d|0,66112,40);return 0}function tv(a){a=a|0;return tu(a)|0}function tw(a){a=a|0;if((a|0)==0){return}tp(a);return}function tx(a){a=a|0;tw(a);return}function ty(a){a=a|0;tw(a);return}function tz(a){a=a|0;return}function tA(a){a=a|0;return 40384}function tB(){var a=0;a=cY(4)|0;c[a>>2]=59736;b6(a|0,66112,40)}function tC(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0.0,w=0,x=0,y=0,z=0.0,A=0.0,B=0,C=0,D=0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0,P=0,Q=0.0,R=0.0,S=0.0;e=b;while(1){f=e+1|0;if((a$(a[e]|0)|0)==0){break}else{e=f}}g=a[e]|0;if((g<<24>>24|0)==43){i=f;j=0}else if((g<<24>>24|0)==45){i=f;j=1}else{i=e;j=0}e=-1;f=0;g=i;while(1){k=a[g]|0;if(((k<<24>>24)-48|0)>>>0<10>>>0){l=e}else{if(k<<24>>24!=46|(e|0)>-1){break}else{l=f}}e=l;f=f+1|0;g=g+1|0}l=g+(-f|0)|0;i=(e|0)<0;m=((i^1)<<31>>31)+f|0;n=(m|0)>18;o=(n?-18:-m|0)+(i?f:e)|0;e=n?18:m;do{if((e|0)==0){p=b;q=0.0}else{if((e|0)>9){m=l;n=e;f=0;while(1){i=a[m]|0;r=m+1|0;if(i<<24>>24==46){s=a[r]|0;t=m+2|0}else{s=i;t=r}u=(f*10|0)-48+(s<<24>>24)|0;r=n-1|0;if((r|0)>9){m=t;n=r;f=u}else{break}}v=+(u|0)*1.0e9;w=9;x=t;y=14}else{if((e|0)>0){v=0.0;w=e;x=l;y=14}else{z=0.0;A=0.0}}if((y|0)==14){f=x;n=w;m=0;while(1){r=a[f]|0;i=f+1|0;if(r<<24>>24==46){B=a[i]|0;C=f+2|0}else{B=r;C=i}D=(m*10|0)-48+(B<<24>>24)|0;i=n-1|0;if((i|0)>0){f=C;n=i;m=D}else{break}}z=+(D|0);A=v}E=A+z;do{if((k<<24>>24|0)==69|(k<<24>>24|0)==101){m=g+1|0;n=a[m]|0;if((n<<24>>24|0)==45){F=g+2|0;G=1}else if((n<<24>>24|0)==43){F=g+2|0;G=0}else{F=m;G=0}m=a[F]|0;if(((m<<24>>24)-48|0)>>>0<10>>>0){H=F;I=0;J=m}else{K=0;L=F;M=G;break}while(1){m=(J<<24>>24)-48+(I*10|0)|0;n=H+1|0;f=a[n]|0;if(((f<<24>>24)-48|0)>>>0<10>>>0){H=n;I=m;J=f}else{K=m;L=n;M=G;break}}}else{K=0;L=g;M=0}}while(0);n=o+((M|0)==0?K:-K|0)|0;m=(n|0)<0?-n|0:n;if((m|0)>511){c[(cw()|0)>>2]=34;N=1.0;O=7936;P=511;y=31}else{if((m|0)==0){Q=1.0}else{N=1.0;O=7936;P=m;y=31}}if((y|0)==31){while(1){y=0;if((P&1|0)==0){R=N}else{R=N*+h[O>>3]}m=P>>1;if((m|0)==0){Q=R;break}else{N=R;O=O+8|0;P=m;y=31}}}if((n|0)>-1){p=L;q=E*Q;break}else{p=L;q=E/Q;break}}}while(0);if((d|0)!=0){c[d>>2]=p}if((j|0)==0){S=q;return+S}S=-0.0-q;return+S}function tD(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function tE(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0;while((e|0)<(d|0)){a[b+e|0]=f?0:a[c+e|0]|0;f=f?1:(a[c+e|0]|0)==0;e=e+1|0}return b|0}function tF(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;z=z+1|0;c[a>>2]=z;while((e|0)<4e3){if((c[d+(e<<2)>>2]|0)==0){c[d+(e<<2)>>2]=z;c[d+((e<<2)+4)>>2]=b;c[d+((e<<2)+8)>>2]=0;return 0}e=e+2|0}bY(116);bY(111);bY(111);bY(32);bY(109);bY(97);bY(110);bY(121);bY(32);bY(115);bY(101);bY(116);bY(106);bY(109);bY(112);bY(115);bY(32);bY(105);bY(110);bY(32);bY(97);bY(32);bY(102);bY(117);bY(110);bY(99);bY(116);bY(105);bY(111);bY(110);bY(32);bY(99);bY(97);bY(108);bY(108);bY(44);bY(32);bY(98);bY(117);bY(105);bY(108);bY(100);bY(32);bY(119);bY(105);bY(116);bY(104);bY(32);bY(97);bY(32);bY(104);bY(105);bY(103);bY(104);bY(101);bY(114);bY(32);bY(118);bY(97);bY(108);bY(117);bY(101);bY(32);bY(102);bY(111);bY(114);bY(32);bY(77);bY(65);bY(88);bY(95);bY(83);bY(69);bY(84);bY(74);bY(77);bY(80);bY(83);bY(10);ah(0);return 0}function tG(a,b){a=a|0;b=b|0;var d=0,e=0;while((d|0)<2e3){e=c[b+(d<<2)>>2]|0;if((e|0)==0)break;if((e|0)==(a|0)){return c[b+((d<<2)+4)>>2]|0}d=d+2|0}return 0}function tH(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function tI(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;g=b&3;h=d|d<<8|d<<16|d<<24;i=f&~3;if(g){g=b+4-g|0;while((b|0)<(g|0)){a[b]=d;b=b+1|0}}while((b|0)<(i|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function tJ(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if((c|0)<(b|0)&(b|0)<(c+d|0)){e=b;c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}b=e}else{tH(b,c,d)|0}return b|0}function tK(a,b,c){a=a|0;b=b|0;c=c|0;var e=0,f=0,g=0;while((e|0)<(c|0)){f=d[a+e|0]|0;g=d[b+e|0]|0;if((f|0)!=(g|0))return((f|0)>(g|0)?1:-1)|0;e=e+1|0}return 0}function tL(b,c){b=b|0;c=c|0;var d=0;do{a[b+d|0]=a[c+d|0];d=d+1|0}while(a[c+(d-1)|0]|0);return b|0}function tM(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return(K=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function tN(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return(K=e,a-c>>>0|0)|0}function tO(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}K=a<<c-32;return 0}function tP(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}K=0;return b>>>c-32|0}function tQ(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){K=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}K=(b|0)<0?-1:0;return b>>c-32|0}function tR(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function tS(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function tT(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=ag(d,c)|0;f=a>>>16;a=(e>>>16)+(ag(d,f)|0)|0;d=b>>>16;b=ag(d,c)|0;return(K=(a>>>16)+(ag(d,f)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|e&65535|0)|0}function tU(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=tN(e^a,f^b,e,f)|0;b=K;a=g^e;e=h^f;f=tN((tZ(i,b,tN(g^c,h^d,g,h)|0,K,0)|0)^a,K^e,a,e)|0;return(K=K,f)|0}function tV(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=tN(h^a,j^b,h,j)|0;b=K;tZ(m,b,tN(k^d,l^e,k,l)|0,K,g)|0;l=tN(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=K;i=f;return(K=j,l)|0}function tW(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=tT(e,a)|0;f=K;return(K=(ag(b,a)|0)+(ag(d,e)|0)+f|f&0,c|0|0)|0}function tX(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=tZ(a,b,c,d,0)|0;return(K=K,e)|0}function tY(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;tZ(a,b,d,e,g)|0;i=f;return(K=c[g+4>>2]|0,c[g>>2]|0)|0}function tZ(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,L=0,M=0;g=a;h=b;i=h;j=d;k=e;l=k;if((i|0)==0){m=(f|0)!=0;if((l|0)==0){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return(K=n,o)|0}else{if(!m){n=0;o=0;return(K=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;o=0;return(K=n,o)|0}}m=(l|0)==0;do{if((j|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return(K=n,o)|0}if((g|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return(K=n,o)|0}p=l-1|0;if((p&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=p&i|b&0}n=0;o=i>>>((tS(l|0)|0)>>>0);return(K=n,o)|0}p=(tR(l|0)|0)-(tR(i|0)|0)|0;if(p>>>0<=30){q=p+1|0;r=31-p|0;s=q;t=i<<r|g>>>(q>>>0);u=i>>>(q>>>0);v=0;w=g<<r;break}if((f|0)==0){n=0;o=0;return(K=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(K=n,o)|0}else{if(!m){r=(tR(l|0)|0)-(tR(i|0)|0)|0;if(r>>>0<=31){q=r+1|0;p=31-r|0;x=r-31>>31;s=q;t=g>>>(q>>>0)&x|i<<p;u=i>>>(q>>>0)&x;v=0;w=g<<p;break}if((f|0)==0){n=0;o=0;return(K=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(K=n,o)|0}p=j-1|0;if((p&j|0)!=0){x=(tR(j|0)|0)+33-(tR(i|0)|0)|0;q=64-x|0;r=32-x|0;y=r>>31;z=x-32|0;A=z>>31;s=x;t=r-1>>31&i>>>(z>>>0)|(i<<r|g>>>(x>>>0))&A;u=A&i>>>(x>>>0);v=g<<q&y;w=(i<<q|g>>>(z>>>0))&y|g<<r&x-33>>31;break}if((f|0)!=0){c[f>>2]=p&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=a|0|0;return(K=n,o)|0}else{p=tS(j|0)|0;n=i>>>(p>>>0)|0;o=i<<32-p|g>>>(p>>>0)|0;return(K=n,o)|0}}}while(0);if((s|0)==0){B=w;C=v;D=u;E=t;F=0;G=0}else{g=d|0|0;d=k|e&0;e=tM(g,d,-1,-1)|0;k=K;i=w;w=v;v=u;u=t;t=s;s=0;while(1){H=w>>>31|i<<1;I=s|w<<1;j=u<<1|i>>>31|0;a=u>>>31|v<<1|0;tN(e,k,j,a)|0;b=K;h=b>>31|((b|0)<0?-1:0)<<1;J=h&1;L=tN(j,a,h&g,(((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1)&d)|0;M=K;b=t-1|0;if((b|0)==0){break}else{i=H;w=I;v=M;u=L;t=b;s=J}}B=H;C=I;D=M;E=L;F=0;G=J}J=C;C=0;if((f|0)!=0){c[f>>2]=E;c[f+4>>2]=D}n=(J|0)>>>31|(B|C)<<1|(C<<1|J>>>31)&0|F;o=(J<<1|0>>>31)&-2|G;return(K=n,o)|0}function t_(a,b,c){a=a|0;b=b|0;c=c|0;return cM(a|0,b|0,c|0)|0}function t$(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return aW(a|0,b|0,c|0,d|0)|0}function t0(){return cw()|0}function t1(){return cS()|0}function t2(a){a=a|0;b1(a|0)}function t3(a){a=a|0;return bF(a|0)|0}function t4(a){a=a|0;return bM(a|0)|0}function t5(a){a=a|0;return aR(a|0)|0}function t6(a){a=a|0;return cj(a|0)|0}function t7(a){a=a|0;return cx(a|0)|0}function t8(a){a=a|0;return aN(a|0)|0}function t9(a){a=a|0;return cQ(a|0)|0}function ua(a){a=a|0;return a5(a|0)|0}function ub(){a2()}function uc(a,b){a=a|0;b=b|0;return ca(a|0,b|0)|0}function ud(a,b){a=a|0;b=b|0;return cf(a|0,b|0)|0}function ue(a,b){a=a|0;b=b|0;return aU(a|0,b|0)|0}function uf(a,b){a=a|0;b=b|0;return bm(a|0,b|0)|0}function ug(a,b){a=a|0;b=b|0;return bD(a|0,b|0)|0}function uh(a,b){a=a|0;b=b|0;return bc(a|0,b|0)|0}function ui(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;return db[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0)|0}function uj(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;dc[a&31](b|0,c|0,d|0,e|0,f|0)}function uk(a,b){a=a|0;b=b|0;dd[a&511](b|0)}function ul(a,b,c){a=a|0;b=b|0;c=c|0;de[a&127](b|0,c|0)}function um(a,b,c,d,e,f,g,h,i,j,k){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;return df[a&15](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0,k|0)|0}function un(a,b){a=a|0;b=b|0;return dg[a&255](b|0)|0}function uo(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return dh[a&127](b|0,c|0,d|0,e|0,f|0)|0}function up(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return di[a&127](b|0,c|0,d|0)|0}function uq(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;dj[a&15](b|0,c|0,d|0,e|0,f|0,+g)}function ur(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;dk[a&15](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function us(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;dl[a&63](b|0,c|0,d|0,e|0,f|0,g|0)}function ut(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=+d;e=e|0;f=f|0;dm[a&7](b|0,c|0,+d,e|0,f|0)}function uu(a,b,c){a=a|0;b=b|0;c=+c;return dn[a&3](b|0,+c)|0}function uv(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;dp[a&127](b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function uw(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;dq[a&7](b|0,c|0,d|0,e|0,f|0,g|0,+h)}function ux(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;dr[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0)}function uy(a,b,c){a=a|0;b=b|0;c=c|0;return ds[a&127](b|0,c|0)|0}function uz(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;g=g|0;return dt[a&3](b|0,c|0,d|0,e|0,+f,g|0)|0}function uA(a){a=a|0;return du[a&15]()|0}function uB(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return dv[a&127](b|0,c|0,d|0,e|0)|0}function uC(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;dw[a&31](b|0,c|0,d|0)}function uD(a){a=a|0;dx[a&7]()}function uE(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return dy[a&31](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)|0}function uF(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;dz[a&63](b|0,c|0,d|0,e|0)}function uG(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ah(0);return 0}function uH(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(1)}function uI(a){a=a|0;ah(2)}function uJ(a,b){a=a|0;b=b|0;ah(3)}function uK(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;ah(4);return 0}function uL(a){a=a|0;ah(5);return 0}function uM(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(6);return 0}function uN(a,b,c){a=a|0;b=b|0;c=c|0;ah(7);return 0}function uO(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;ah(8)}function uP(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ah(9)}function uQ(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(10)}function uR(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(11)}function uS(a,b){a=a|0;b=+b;ah(12);return 0}function uT(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ah(13)}function uU(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;ah(14)}function uV(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;ah(15)}function uW(a,b){a=a|0;b=b|0;ah(16);return 0}function uX(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;f=f|0;ah(17);return 0}function uY(){ah(18);return 0}function uZ(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(19);return 0}function u_(a,b,c){a=a|0;b=b|0;c=c|0;ah(20)}function u$(){ah(21)}function u0(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ah(22);return 0}function u1(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(23)}
// EMSCRIPTEN_END_FUNCS
var db=[uG,uG,ip,uG,ir,uG,iw,uG];var dc=[uH,uH,f4,uH,fL,uH,gE,uH,tj,uH,tk,uH,fg,uH,fh,uH,gp,uH,fM,uH,gF,uH,gG,uH,gq,uH,ti,uH,f5,uH,uH,uH];var dd=[uI,uI,qM,uI,nI,uI,qH,uI,mb,uI,mE,uI,qR,uI,qZ,uI,lZ,uI,lM,uI,oz,uI,iN,uI,l5,uI,rB,uI,n5,uI,mc,uI,iI,uI,ny,uI,nu,uI,kk,uI,tz,uI,kW,uI,qX,uI,rb,uI,pe,uI,n6,uI,r$,uI,nm,uI,kJ,uI,qI,uI,qY,uI,kY,uI,oO,uI,m5,uI,nJ,uI,pT,uI,qV,uI,r_,uI,s8,uI,jK,uI,rZ,uI,mw,uI,hR,uI,l9,uI,nE,uI,py,uI,r0,uI,q_,uI,tp,uI,qB,uI,rY,uI,jF,uI,m9,uI,nD,uI,pt,uI,l6,uI,sy,uI,oA,uI,d_,uI,rM,uI,kX,uI,jG,uI,kj,uI,hy,uI,pU,uI,m4,uI,ng,uI,pq,uI,pd,uI,ed,uI,iG,uI,pI,uI,ty,uI,jE,uI,mD,uI,t2,uI,sB,uI,sC,uI,ns,uI,kf,uI,nn,uI,mS,uI,tb,uI,rl,uI,lm,uI,m6,uI,nt,uI,qd,uI,lD,uI,p2,uI,no,uI,hx,uI,sE,uI,s9,uI,lS,uI,qU,uI,iH,uI,pr,uI,qo,uI,s4,uI,rX,uI,qg,uI,qC,uI,sD,uI,px,uI,oN,uI,nx,uI,ki,uI,jH,uI,nv,uI,nz,uI,nb,uI,rt,uI,qv,uI,qn,uI,d0,uI,o0,uI,kV,uI,s5,uI,tc,uI,d2,uI,nf,uI,mj,uI,m3,uI,dZ,uI,kP,uI,lT,uI,nl,uI,jI,uI,kZ,uI,mC,uI,ne,uI,mi,uI,l_,uI,nw,uI,p3,uI,o$,uI,pJ,uI,lF,uI,i8,uI,na,uI,mR,uI,nd,uI,d$,uI,sA,uI,ta,uI,qN,uI,lE,uI,s7,uI,pu,uI,lL,uI,qw,uI,qe,uI,mo,uI,rc,uI,l8,uI,m8,uI,sF,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI,uI];var de=[uJ,uJ,r9,uJ,jB,uJ,p8,uJ,j8,uJ,pM,uJ,la,uJ,r6,uJ,js,uJ,p1,uJ,ju,uJ,j3,uJ,jx,uJ,jr,uJ,r5,uJ,pS,uJ,lG,uJ,qL,uJ,j4,uJ,mT,uJ,pE,uJ,qb,uJ,j2,uJ,p_,uJ,pD,uJ,pB,uJ,p9,uJ,jt,uJ,jv,uJ,lU,uJ,qc,uJ,j0,uJ,r8,uJ,jL,uJ,pN,uJ,p6,uJ,j$,uJ,sa,uJ,p0,uJ,pP,uJ,r7,uJ,pR,uJ,lN,uJ,mF,uJ,jZ,uJ,qQ,uJ,l$,uJ,pX,uJ,hE,uJ,d1,uJ,pH,uJ,pG,uJ,pC,uJ,jX,uJ,jC,uJ,pY,uJ,pZ,uJ,iJ,uJ,p7,uJ,pO,uJ,uJ,uJ,uJ,uJ,uJ,uJ,uJ,uJ];var df=[uK,uK,iv,uK,fn,uK,ft,uK,iq,uK,is,uK,it,uK,iu,uK];var dg=[uL,uL,es,uL,ew,uL,eu,uL,et,uL,so,uL,mM,uL,d5,uL,rq,uL,se,uL,mN,uL,ey,uL,sm,uL,pK,uL,t3,uL,o1,uL,sc,uL,l1,uL,iP,uL,tD,uL,m$,uL,to,uL,dT,uL,m_,uL,iW,uL,rS,uL,si,uL,sg,uL,dV,uL,s6,uL,ma,uL,eA,uL,ep,uL,r4,uL,ef,uL,r1,uL,eq,uL,sh,uL,er,uL,jP,uL,r2,uL,mJ,uL,rp,uL,qa,uL,sj,uL,lH,uL,t4,uL,pL,uL,hH,uL,rI,uL,t5,uL,d7,uL,t6,uL,t7,uL,ry,uL,p4,uL,sb,uL,ez,uL,lO,uL,ev,uL,iZ,uL,rT,uL,nq,uL,ee,uL,pF,uL,d8,uL,mY,uL,lP,uL,t8,uL,r3,uL,dW,uL,mK,uL,mX,uL,lV,uL,jQ,uL,rs,uL,pQ,uL,sn,uL,l0,uL,rH,uL,tA,uL,pz,uL,sd,uL,ex,uL,pA,uL,l7,uL,pV,uL,rA,uL,p$,uL,pW,uL,eB,uL,sf,uL,p5,uL,rx,uL,pf,uL,k0,uL,sl,uL,lx,uL,sk,uL,ec,uL,rL,uL,t9,uL,rW,uL,ua,uL,dS,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL,uL];var dh=[uM,uM,gJ,uM,gU,uM,gR,uM,gV,uM,gW,uM,gX,uM,ha,uM,hj,uM,ra,uM,gL,uM,hn,uM,ho,uM,rG,uM,hl,uM,hk,uM,he,uM,hg,uM,gO,uM,hd,uM,hi,uM,hm,uM,rk,uM,nF,uM,gK,uM,rU,uM,gY,uM,rJ,uM,g1,uM,g2,uM,gN,uM,g_,uM,g$,uM,gQ,uM,gZ,uM,g0,uM,g3,uM,hh,uM,gT,uM,hp,uM,hc,uM,g6,uM,g7,uM,g9,uM,hb,uM,g4,uM,gP,uM,g8,uM,g5,uM,hq,uM,nA,uM,ht,uM,ro,uM,rr,uM,gM,uM,rw,uM,hf,uM,rR,uM,rz,uM,hu,uM,gS,uM,hr,uM,hs,uM,uM,uM];var di=[uN,uN,fi,uN,nC,uN,q6,uN,i9,uN,td,uN,qJ,uN,fp,uN,re,uN,q9,uN,fC,uN,ls,uN,fX,uN,nH,uN,fI,uN,me,uN,gg,uN,mP,uN,mL,uN,kI,uN,tE,uN,q$,uN,mU,uN,qO,uN,fq,uN,rj,uN,eE,uN,fu,uN,t_,uN,jM,uN,q4,uN,lI,uN,mZ,uN,mf,uN,rg,uN,f1,uN,kE,uN,mG,uN,gm,uN,lW,uN,kK,uN,d4,uN,m1,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN,uN];var dj=[uO,uO,oY,uO,oW,uO,oL,uO,oI,uO,uO,uO,uO,uO,uO,uO];var dk=[uP,uP,pv,uP,ps,uP,qf,uP,qp,uP,qj,uP,qr,uP,uP,uP];var dl=[uQ,uQ,tl,uQ,oU,uQ,oQ,uQ,oP,uQ,tm,uQ,hw,uQ,oZ,uQ,jN,uQ,qK,uQ,mV,uQ,oM,uQ,oB,uQ,oG,uQ,oC,uQ,k_,uQ,tn,uQ,mH,uQ,hv,uQ,qP,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ,uQ];var dm=[uR,uR,iU,uR,iV,uR,uR,uR];var dn=[uS,uS,dX,uS];var dp=[uT,uT,o2,uT,o6,uT,pg,uT,pi,uT,qG,uT,oV,uT,oT,uT,qA,uT,o5,uT,pj,uT,or,uT,nO,uT,o4,uT,of,uT,ph,uT,oH,uT,oF,uT,oj,uT,ob,uT,od,uT,n2,uT,oh,uT,n9,uT,n7,uT,op,uT,on,uT,ol,uT,pk,uT,nS,uT,o3,uT,nW,uT,nQ,uT,nM,uT,n0,uT,n_,uT,nY,uT,nK,uT,nU,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT,uT];var dq=[uU,uU,qD,uU,qx,uU,uU,uU];var dr=[uV,uV,pl,uV,o7,uV,uV,uV];var ds=[uW,uW,gw,uW,uc,uW,l2,uW,gu,uW,gv,uW,d6,uW,m2,uW,fd,uW,q7,uW,m0,uW,rh,uW,gj,uW,eC,uW,rd,uW,lQ,uW,lX,uW,q3,uW,fZ,uW,fe,uW,k2,uW,eD,uW,gy,uW,ud,uW,gx,uW,gt,uW,jR,uW,ue,uW,s0,uW,rf,uW,gl,uW,uf,uW,f_,uW,d3,uW,ff,uW,mQ,uW,hJ,uW,dR,uW,q5,uW,ug,uW,f0,uW,i2,uW,uh,uW,gi,uW,d9,uW,k1,uW,fH,uW,jS,uW,mO,uW,lJ,uW,fE,uW,gs,uW,gr,uW,fF,uW,tr,uW,uW,uW,uW,uW,uW,uW,uW,uW,uW,uW,uW,uW,uW,uW,uW,uW,uW,uW];var dt=[uX,uX,jd,uX];var du=[uY,uY,lA,uY,eF,uY,lB,uY,t0,uY,ly,uY,t1,uY,hI,uY];var dv=[uZ,uZ,eL,uZ,eU,uZ,fW,uZ,fK,uZ,fS,uZ,f3,uZ,gk,uZ,fD,uZ,gd,uZ,gh,uZ,fc,uZ,fx,uZ,fG,uZ,fT,uZ,q0,uZ,gc,uZ,ga,uZ,fr,uZ,fv,uZ,t$,uZ,fk,uZ,fU,uZ,fw,uZ,fl,uZ,q1,uZ,fV,uZ,fB,uZ,fz,uZ,gf,uZ,ri,uZ,go,uZ,fy,uZ,iA,uZ,e4,uZ,eR,uZ,fY,uZ,fA,uZ,e6,uZ,gb,uZ,ge,uZ,fb,uZ,e7,uZ,q8,uZ,f$,uZ,e2,uZ,eX,uZ,fs,uZ,q2,uZ,fR,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ,uZ];var dw=[u_,u_,jn,u_,j7,u_,jp,u_,hD,u_,kM,u_,kL,u_,md,u_,hQ,u_,nr,u_,k9,u_,u_,u_,u_,u_,u_,u_,u_,u_,u_,u_];var dx=[u$,u$,ub,u$,hG,u$,u$,u$];var dy=[u0,u0,ru,u0,rE,u0,rC,u0,rN,u0,rP,u0,rv,u0,rm,u0,rn,u0,u0,u0,u0,u0,u0,u0,u0,u0,u0,u0,u0,u0,u0,u0];var dz=[u1,u1,iC,u1,k$,u1,tf,u1,fm,u1,fJ,u1,te,u1,hC,u1,gn,u1,jO,u1,mI,u1,nG,u1,mW,u1,tg,u1,hA,u1,nB,u1,f2,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1,u1];return{_memcmp:tK,_strlen:tD,_free:tp,_main:dY,_testSetjmp:tG,_strncpy:tE,_memmove:tJ,__GLOBAL__I_a:l4,_memset:tI,_malloc:to,_saveSetjmp:tF,_memcpy:tH,_realloc:tr,_strcpy:tL,_calloc:tq,runPostSets:dQ,stackAlloc:dA,stackSave:dB,stackRestore:dC,setThrew:dD,setTempRet0:dG,setTempRet1:dH,setTempRet2:dI,setTempRet3:dJ,setTempRet4:dK,setTempRet5:dL,setTempRet6:dM,setTempRet7:dN,setTempRet8:dO,setTempRet9:dP,dynCall_iiiiiiii:ui,dynCall_viiiii:uj,dynCall_vi:uk,dynCall_vii:ul,dynCall_iiiiiiiiiii:um,dynCall_ii:un,dynCall_iiiiii:uo,dynCall_iiii:up,dynCall_viiiiid:uq,dynCall_viiiiiiii:ur,dynCall_viiiiii:us,dynCall_viidii:ut,dynCall_iid:uu,dynCall_viiiiiii:uv,dynCall_viiiiiid:uw,dynCall_viiiiiiiii:ux,dynCall_iii:uy,dynCall_iiiiidi:uz,dynCall_i:uA,dynCall_iiiii:uB,dynCall_viii:uC,dynCall_v:uD,dynCall_iiiiiiiii:uE,dynCall_viiii:uF}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_iiiiiiii": invoke_iiiiiiii, "invoke_viiiii": invoke_viiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iiiiiiiiiii": invoke_iiiiiiiiiii, "invoke_ii": invoke_ii, "invoke_iiiiii": invoke_iiiiii, "invoke_iiii": invoke_iiii, "invoke_viiiiid": invoke_viiiiid, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_viiiiii": invoke_viiiiii, "invoke_viidii": invoke_viidii, "invoke_iid": invoke_iid, "invoke_viiiiiii": invoke_viiiiiii, "invoke_viiiiiid": invoke_viiiiiid, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_iii": invoke_iii, "invoke_iiiiidi": invoke_iiiiidi, "invoke_i": invoke_i, "invoke_iiiii": invoke_iiiii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iiiiiiiii": invoke_iiiiiiiii, "invoke_viiii": invoke_viiii, "_llvm_lifetime_end": _llvm_lifetime_end, "_lseek": _lseek, "__scanString": __scanString, "_fclose": _fclose, "_pthread_mutex_lock": _pthread_mutex_lock, "___cxa_end_catch": ___cxa_end_catch, "_strtoull": _strtoull, "_fflush": _fflush, "_lis_solver_create": _lis_solver_create, "_strtol": _strtol, "_fputc": _fputc, "_strtok": _strtok, "_fwrite": _fwrite, "_send": _send, "_fputs": _fputs, "_emscripten_get_now": _emscripten_get_now, "_tmpnam": _tmpnam, "_isspace": _isspace, "_localtime": _localtime, "_read": _read, "_GC_init": _GC_init, "_ceil": _ceil, "___ctype_b_loc": ___ctype_b_loc, "_GC_malloc_atomic": _GC_malloc_atomic, "_strstr": _strstr, "_fileno": _fileno, "_perror": _perror, "_fsync": _fsync, "___cxa_guard_abort": ___cxa_guard_abort, "_newlocale": _newlocale, "_signal": _signal, "___gxx_personality_v0": ___gxx_personality_v0, "_isblank": _isblank, "_pthread_cond_wait": _pthread_cond_wait, "___cxa_rethrow": ___cxa_rethrow, "_freopen": _freopen, "___resumeException": ___resumeException, "_sscanf": _sscanf, "_strcmp": _strcmp, "_strncmp": _strncmp, "_clock_gettime": _clock_gettime, "_tmpfile": _tmpfile, "_vsscanf": _vsscanf, "_snprintf": _snprintf, "_fgetc": _fgetc, "_pclose": _pclose, "__getFloat": __getFloat, "_atexit": _atexit, "___cxa_free_exception": ___cxa_free_exception, "_close": _close, "_vasprintf": _vasprintf, "___setErrNo": ___setErrNo, "_isxdigit": _isxdigit, "_access": _access, "_ftell": _ftell, "_exit": _exit, "_sprintf": _sprintf, "_pthread_setspecific": _pthread_setspecific, "_asprintf": _asprintf, "_GC_strdup": _GC_strdup, "_strrchr": _strrchr, "_freelocale": _freelocale, "_catgets": _catgets, "__isLeapYear": __isLeapYear, "_fmax": _fmax, "___cxa_is_number_type": ___cxa_is_number_type, "_GC_malloc": _GC_malloc, "___cxa_does_inherit": ___cxa_does_inherit, "___cxa_guard_acquire": ___cxa_guard_acquire, "_lis_vector_destroy": _lis_vector_destroy, "_localtime_r": _localtime_r, "___cxa_begin_catch": ___cxa_begin_catch, "_lis_vector_create": _lis_vector_create, "_recv": _recv, "__parseInt64": __parseInt64, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "_cos": _cos, "_lis_matrix_set_value": _lis_matrix_set_value, "_putchar": _putchar, "___cxa_call_unexpected": ___cxa_call_unexpected, "_popen": _popen, "_round": _round, "_bsearch": _bsearch, "__exit": __exit, "_strftime": _strftime, "_rand": _rand, "_tzset": _tzset, "_llvm_va_end": _llvm_va_end, "___cxa_throw": ___cxa_throw, "_llvm_eh_exception": _llvm_eh_exception, "_printf": _printf, "_pread": _pread, "_fopen": _fopen, "_open": _open, "__arraySum": __arraySum, "_sysconf": _sysconf, "_puts": _puts, "_pthread_key_create": _pthread_key_create, "_qsort": _qsort, "_system": _system, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_strdup": _strdup, "_srand": _srand, "_isatty": _isatty, "__formatString": __formatString, "_pthread_cond_broadcast": _pthread_cond_broadcast, "__ZSt9terminatev": __ZSt9terminatev, "_atoi": _atoi, "_vfprintf": _vfprintf, "_isascii": _isascii, "_pthread_mutex_unlock": _pthread_mutex_unlock, "_llvm_pow_f64": _llvm_pow_f64, "_sbrk": _sbrk, "_lis_solver_destroy": _lis_solver_destroy, "___errno_location": ___errno_location, "_strerror": _strerror, "_fstat": _fstat, "_catclose": _catclose, "_llvm_lifetime_start": _llvm_lifetime_start, "__parseInt": __parseInt, "___cxa_guard_release": ___cxa_guard_release, "_ungetc": _ungetc, "_ftruncate": _ftruncate, "_uselocale": _uselocale, "_vsnprintf": _vsnprintf, "_htonl": _htonl, "___assert_fail": ___assert_fail, "_fread": _fread, "_strtok_r": _strtok_r, "_abort": _abort, "_fprintf": _fprintf, "_isdigit": _isdigit, "_strtoll": _strtoll, "__addDays": __addDays, "_pthread_getspecific": _pthread_getspecific, "_fabs": _fabs, "_GC_collect_a_little": _GC_collect_a_little, "__reallyNegative": __reallyNegative, "_fseek": _fseek, "_sqrt": _sqrt, "_write": _write, "_rewind": _rewind, "___cxa_allocate_exception": ___cxa_allocate_exception, "_sin": _sin, "_stat": _stat, "_longjmp": _longjmp, "_truncate": _truncate, "_catopen": _catopen, "___ctype_toupper_loc": ___ctype_toupper_loc, "___ctype_tolower_loc": ___ctype_tolower_loc, "_lis_vector_set_size": _lis_vector_set_size, "_unlink": _unlink, "_pwrite": _pwrite, "_strerror_r": _strerror_r, "_lis_solver_set_option": _lis_solver_set_option, "_time": _time, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE, "___fsmu8": ___fsmu8, "_stdout": _stdout, "___dso_handle": ___dso_handle, "_stdin": _stdin, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "_stderr": _stderr }, buffer);
var _memcmp = Module["_memcmp"] = asm["_memcmp"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _testSetjmp = Module["_testSetjmp"] = asm["_testSetjmp"];
var _strncpy = Module["_strncpy"] = asm["_strncpy"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var __GLOBAL__I_a = Module["__GLOBAL__I_a"] = asm["__GLOBAL__I_a"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _saveSetjmp = Module["_saveSetjmp"] = asm["_saveSetjmp"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var _calloc = Module["_calloc"] = asm["_calloc"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = asm["dynCall_iiiiiiii"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiiiiiiiiii = Module["dynCall_iiiiiiiiiii"] = asm["dynCall_iiiiiiiiiii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viiiiid = Module["dynCall_viiiiid"] = asm["dynCall_viiiiid"];
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = asm["dynCall_viiiiiiii"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_viidii = Module["dynCall_viidii"] = asm["dynCall_viidii"];
var dynCall_iid = Module["dynCall_iid"] = asm["dynCall_iid"];
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = asm["dynCall_viiiiiii"];
var dynCall_viiiiiid = Module["dynCall_viiiiiid"] = asm["dynCall_viiiiiid"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_iiiiidi = Module["dynCall_iiiiidi"] = asm["dynCall_iiiiidi"];
var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = asm["dynCall_iiiiiiiii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// TODO: strip out parts of this we do not need
//======= begin closure i64 code =======
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */
var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };
  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.
    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };
  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.
  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};
  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }
    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };
  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };
  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };
  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }
    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));
    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };
  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.
  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;
  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);
  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);
  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);
  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);
  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);
  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);
  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };
  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };
  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (this.isZero()) {
      return '0';
    }
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }
    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));
    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };
  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };
  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };
  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };
  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };
  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };
  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };
  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };
  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }
    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }
    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };
  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };
  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };
  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }
    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }
    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }
    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));
      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);
      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }
      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }
      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };
  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };
  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };
  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };
  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };
  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };
  //======= begin jsbn =======
  var navigator = { appName: 'Modern Browser' }; // polyfill a little
  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/
  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */
  // Basic JavaScript BN library - subset useful for RSA encryption.
  // Bits per digit
  var dbits;
  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);
  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }
  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }
  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.
  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }
  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);
  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;
  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }
  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }
  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }
  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }
  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }
  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }
  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }
  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }
  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }
  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }
  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }
  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }
  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }
  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }
  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }
  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }
  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }
  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }
  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }
  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }
  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;
  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }
  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }
  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }
  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }
  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }
  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;
  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }
  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }
  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }
  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;
  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;
  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);
  // jsbn2 stuff
  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }
  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }
  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }
  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }
  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }
  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }
  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }
  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;
  //======= end jsbn =======
  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();
//======= end closure i64 code =======
// === Auto-generated postamble setup entry stuff ===
if (memoryInitializer) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    applyData(Module['readBinary'](memoryInitializer));
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      applyData(data);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}
Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  initialStackTop = STACKTOP;
  try {
    var ret = Module['_main'](argc, argv, 0);
    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}
function run(args) {
  args = args || Module['arguments'];
  if (preloadStartTime === null) preloadStartTime = Date.now();
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }
  preRun();
  if (runDependencies > 0) {
    // a preRun added a dependency, run will be called later
    return;
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    Module['calledRun'] = true;
    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;
function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  // exit the runtime
  exitRuntime();
  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371
  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;
function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }
  ABORT = true;
  EXITSTATUS = 1;
  throw 'abort() at ' + stackTrace();
}
Module['abort'] = Module.abort = abort;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
// {{MODULE_ADDITIONS}}