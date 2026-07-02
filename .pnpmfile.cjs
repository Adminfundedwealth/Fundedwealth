function readPackage(pkg) {
  // Remove postinstall script from core-js to prevent build errors
  if (pkg.name === 'core-js') {
    delete pkg.scripts?.postinstall;
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};
