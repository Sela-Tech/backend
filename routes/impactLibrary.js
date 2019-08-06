const { ImpactLibraryLib, ImpactStandardLIb } = require("../app/controllers/ImpactLibrary");
var { verifyToken } = require("../in-use/utils");



// const ImpactLibrary = new ImpactLibraryLib();
const ImpactStandard = new ImpactStandardLIb();


module.exports = (app) => {

  // impact standard
  app
    .route("/impact-standard/create").post(verifyToken, ImpactStandard.createStandard.bind(ImpactStandard));
  app
    .route("/impact-category/create").post(verifyToken, ImpactStandard.createImpactCategory.bind(ImpactStandard));

  app
    .route("/impact-standards").get(ImpactStandard.getImpactStandard.bind(ImpactStandard));



  // impact library
  // app
  // .route("/impact-category/create").post(verifyToken, ImpactLibrary)
}