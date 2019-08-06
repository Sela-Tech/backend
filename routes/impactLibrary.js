const { ImpactLibraryLib, ImpactStandardLIb } = require("../app/controllers/ImpactLibrary");
var { verifyToken } = require("../in-use/utils");
const multer = require("multer");

const storage = multer.diskStorage({
  estination: function (req, file, cb) {
    cb(null, '/tmp/my-uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
const uploaded = multer({ storage })



const ImpactLibrary = new ImpactLibraryLib();
const ImpactStandard = new ImpactStandardLIb();


module.exports = (app) => {

  // impact standard
  app
    .route("/impact-standard/create").post(verifyToken, ImpactStandard.createStandard.bind(ImpactStandard));

  app
    .route("/impact-standards").get(ImpactStandard.getImpactStandard.bind(ImpactStandard));


  // impact category
  app
    .route("/impact-category/create").post(verifyToken, ImpactStandard.createImpactCategory.bind(ImpactStandard));

  app
    .route("/impact-categories").get(ImpactStandard.getImpactCategory.bind(ImpactStandard));



  // impact library
  app
    .route("/upload-metric-csv").post(uploaded.single('csv'), ImpactLibrary.uploadmetricCSV.bind(ImpactLibrary));
}