const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('  KIBO360 Backend Modular Architecture Validation');
console.log('====================================================');

const modulesDir = path.join(__dirname, '..', 'modules');
const targetModules = [
  'auth',
  'users',
  'companies',
  'accounting',
  'books',
  'inventory',
  'purchases',
  'sales',
  'customers',
  'suppliers',
  'publishing',
  'royalties',
  'distributors',
  'taxation',
  'banking',
  'expenses',
  'reports',
  'notifications',
];

let passed = 0;

targetModules.forEach((mod) => {
  const serviceFile = path.join(modulesDir, mod, `${mod}.service.ts`);
  const routesFile = path.join(modulesDir, mod, `${mod}.routes.ts`);
  const controllerFile = path.join(modulesDir, mod, `${mod}.controller.ts`);
  const validatorFile = path.join(modulesDir, mod, `${mod}.validator.ts`);
  const typesFile = path.join(modulesDir, mod, `${mod}.types.ts`);
  const testFile = path.join(modulesDir, mod, `${mod}.test.ts`);

  if (
    fs.existsSync(serviceFile) &&
    fs.existsSync(routesFile) &&
    fs.existsSync(controllerFile) &&
    fs.existsSync(validatorFile) &&
    fs.existsSync(typesFile) &&
    fs.existsSync(testFile)
  ) {
    passed++;
    console.log(`[PASS] Module: [${mod.toUpperCase().padEnd(14)}] -> Service, Controller, Routes, Validator, Types & Tests`);
  } else {
    console.log(`[FAIL] Module: [${mod.toUpperCase().padEnd(14)}] -> Missing required architecture components`);
  }
});

console.log('----------------------------------------------------');
console.log(`Total Target Modules: ${targetModules.length} | Passed: ${passed} | Failed: ${targetModules.length - passed}`);
console.log('====================================================');

if (passed === targetModules.length) {
  process.exit(0);
} else {
  process.exit(1);
}
