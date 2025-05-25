import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  rules: {
    'no-console': ['error', { allow: ['debug', 'warn', 'error'] }],
  },
  ignores: ['src/components/ui'],
})
