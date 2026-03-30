/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  options: {
    doNotFollow: {
      path: "node_modules"
    },
    exclude: {
      path: "^dist|^docs|^assets"
    }
  },
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: {
        circular: true
      }
    }
  ]
};
