module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "jest": true
    },
    "extends": [
        "standard"
    ],
    "parserOptions": {
        "ecmaVersion": 12,
        "ecmaFeatures": {
          "experimentalObjectRestSpread": true
        },
        "sourceType": "module"
    },
    "rules": {
        "semi": [2, "always"],
        "indent": ["error", 4],
        "no-return-assign": 0,
        "spaced-comment" : 0,
        "quotes" : [2, "single"],
        "camelcase" : 0
    }
}
