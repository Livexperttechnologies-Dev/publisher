import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log('  KIBO360 Frontend Component & UI Validation');
console.log('====================================================');

const componentsDir = path.join(__dirname, 'src', 'components', 'ui');
const requiredComponents = [
  'DataTable.tsx',
  'SearchableSelect.tsx',
  'DatePicker.tsx',
  'DateRangePicker.tsx',
  'FormField.tsx',
  'CurrencyInput.tsx',
  'StatusBadge.tsx',
  'ConfirmDialog.tsx',
  'Drawer.tsx',
  'Modal.tsx',
  'Pagination.tsx',
  'ExportMenu.tsx',
  'DashboardCard.tsx',
  'ChartContainer.tsx',
  'PageHeader.tsx',
];

let passed = 0;

requiredComponents.forEach((comp) => {
  const filePath = path.join(componentsDir, comp);
  if (fs.existsSync(filePath)) {
    passed++;
    console.log(`[PASS] Reusable Component: [${comp.replace('.tsx', '').padEnd(18)}] verified.`);
  } else {
    console.log(`[FAIL] Reusable Component: [${comp.replace('.tsx', '').padEnd(18)}] missing!`);
  }
});

console.log('----------------------------------------------------');
console.log(`Total Components: ${requiredComponents.length} | Passed: ${passed} | Failed: ${requiredComponents.length - passed}`);
console.log('====================================================');

if (passed === requiredComponents.length) {
  process.exit(0);
} else {
  process.exit(1);
}
