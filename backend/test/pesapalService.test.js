const test = require('node:test');
const assert = require('node:assert/strict');

const { hasPesapalError } = require('../src/services/pesapalService');

test('hasPesapalError ignores Pesapal success payloads that contain an empty error object', () => {
  assert.equal(
    hasPesapalError({
      message: 'Request processed successfully',
      error: {
        error_type: null,
        code: null,
        message: null,
        call_back_url: null,
      },
    }),
    false
  );
});

test('hasPesapalError detects real Pesapal error payloads', () => {
  assert.equal(
    hasPesapalError({
      error: {
        error_type: 'validation_error',
        code: '400',
        message: 'Invalid request',
      },
    }),
    true
  );
});
