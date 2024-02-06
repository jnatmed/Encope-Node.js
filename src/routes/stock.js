var express = require('express');
const { list, estadisticas, newProduct, storageProduct, listProducts, editProduct, updateProduct, deleteProduct, searchProduct, productsTableExcel } = require('../controllers/productsController');
const { uploadProductosFiles } = require('../middlewares/subirProductos');
const addProductValidator = require('../validations/addProductValidator');
const checkUserEditorIntranetCentral = require('../middlewares/checkUserEditorIntranetCentral');
const { newTaller, storageTaller, listTaller, editTaller, updateTaller, deleteTaller, ExcelTalleres, searchTaller } = require('../controllers/talleresController');
const addTallerValidator = require('../validations/addTallerValidator');
const { addNewProyect, storeProyect, listProyects, editProyect, updateProyect, deleteProyect, downloadExcelHistorial, downloadExcelProyects, searchProyect } = require('../controllers/proyectosController');
const addProyectValidator = require('../validations/addProyectValidator');
const { listPartes, editParte, updateParte } = require('../controllers/partesController');


var router = express.Router();

// llego con /stock

//accedo a la vista para la carga de productos, talleres y proyectos
router.get('/', checkUserEditorIntranetCentral, list);


/* PRODUCTOS */

//crud productos
router.get('/newProduct',checkUserEditorIntranetCentral,  newProduct)
router.post('/newProduct', uploadProductosFiles.single('producto'),addProductValidator,checkUserEditorIntranetCentral,storageProduct)
router.get('/products', checkUserEditorIntranetCentral , listProducts)
router.get('/editProduct/:id',checkUserEditorIntranetCentral, editProduct)
router.put('/editProduct/:id',uploadProductosFiles.single('producto'),addProductValidator,checkUserEditorIntranetCentral, updateProduct)
router.delete('/delete/:id',checkUserEditorIntranetCentral ,deleteProduct)
router.get('/searchProduct', checkUserEditorIntranetCentral , searchProduct)
router.get('/ProductsTable',checkUserEditorIntranetCentral ,productsTableExcel)



/* TALLERES */

//crud talleres
router.get('/newTaller',checkUserEditorIntranetCentral, newTaller)
router.post('/newTaller',addTallerValidator,checkUserEditorIntranetCentral, storageTaller)
router.get('/talleresTable',checkUserEditorIntranetCentral, listTaller)
router.get('/editTaller/:id',checkUserEditorIntranetCentral ,editTaller)
router.put('/editTaller/:id',addTallerValidator, checkUserEditorIntranetCentral ,updateTaller)
router.delete('/deleteTaller/:id',checkUserEditorIntranetCentral, deleteTaller)
router.get('/excelTalleres', checkUserEditorIntranetCentral ,ExcelTalleres)
router.post('/searchTaller', checkUserEditorIntranetCentral, searchTaller)


/* PROYECTOS PRODUCTIVOS */

//crud proyectos
router.get('/newProyect',checkUserEditorIntranetCentral ,addNewProyect)
router.post('/newProyect',checkUserEditorIntranetCentral, addProyectValidator , storeProyect)
router.get('/listProyects',checkUserEditorIntranetCentral, listProyects)
router.get('/editProyect/:id',checkUserEditorIntranetCentral, editProyect)
router.put('/editProyect/:id',checkUserEditorIntranetCentral,addProyectValidator, updateProyect)
router.delete('/deleteProyect/:id',checkUserEditorIntranetCentral, deleteProyect)
router.get('/reformulaciones/:id',checkUserEditorIntranetCentral, downloadExcelHistorial)
router.get('/proyectsTable',checkUserEditorIntranetCentral, downloadExcelProyects)
router.get('/searchProyect',checkUserEditorIntranetCentral, searchProyect)



/* PARTE SEMANAL DE PROYECTOS */

router.get('/partes', checkUserEditorIntranetCentral, listPartes)
router.get('/partes/:id',checkUserEditorIntranetCentral, editParte)
router.put('/partes/:id',checkUserEditorIntranetCentral, updateParte )

module.exports = router;