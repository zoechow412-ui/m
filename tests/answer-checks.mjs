import assert from 'node:assert/strict';
import {validateDraftAnswer} from '../answer-checks.js';
assert.ok(validateDraftAnswer('寫一句訊息，約星期日三點','星期六下午三點，來吧。'));
assert.ok(validateDraftAnswer('寫一句訊息，約星期日三點','一齊分工。'));
assert.equal(validateDraftAnswer('寫一句訊息，約星期日三點','星期天下午三點，一齊分配家務。'),null);
assert.equal(validateDraftAnswer('寫訊息：星期六或星期日','星期日見。'),null);
assert.equal(validateDraftAnswer('星期日同星期六有咩分別？','星期六係週末。'),null);
assert.equal(validateDraftAnswer('解釋大安嘅意思','大安偏向穩定。'),null);
console.log('PASS Draft weekday validation: reject wrong/missing dates, accept aliases and allowed choices, no template replacement');
