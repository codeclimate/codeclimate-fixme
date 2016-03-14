module.exports = {
  "env": {
    "node": true,     // When in a backend context
    "es6": true,
  },
  "rules": {
    "brace-style": [2, "1tbs", { "allowSingleLine": true }],
    "comma-style": [2, "first", { exceptions: {ArrayExpression: true, ObjectExpression: true} }],
    "complexity": [2, 6],
    "curly": 2,
    "eqeqeq": [2, "allow-null"],
    "no-shadow-restricted-names": 2,
    "no-undef": 2,
    "no-use-before-define": 2,
    "radix": 2,
    "semi": 2,
    "space-infix-ops": 2,
    "strict": 0,
  },
  /**
   *  globals should be defined per file when possible. Use the directive here
   *  when there are project-level globals (such as jquery)
   */
  "globals": {},
};
