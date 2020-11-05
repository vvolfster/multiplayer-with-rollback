module.exports = {
    extends: ["react-app", "plugin:prettier/recommended", "plugin:react-directives/recommended"],
    rules: {
        "prettier/prettier": "warn",
        "react-directives/no-unused-vars": "off", // this doubles up
        "object-curly-newline": ["error", { multiline: true, consistent: true }],
        "newline-per-chained-call": "off",
        "react-hooks/exhaustive-deps": "off",
        "@typescript-eslint/semi": "off",
        "@typescript-eslint/member-delimiter-style": "off"
    }
}
