const db = require("../database/models")
const {validationResult} = require('express-validator')
const { Op } = require('sequelize');
const { getAllStocks, getGeneralStock } = require("../services/stockServices");
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { error } = require("console");


module.exports = {
    list : async (req,res) => {
        const userLogin = req.session.userLogin;     
            return res.render("stock/listStock",{               
                title:"Stock de Cunas"
            })     
    },

    newProduct : (req,res) => {
        return res.render('stock/addproduct',{
            title:"Nuevo Producto"
        })
    },
    listProducts : (req,res) => {
        db.Producto.findAll()
        .then(productos => {
            return res.render('stock/productos',{
                title:'Productos',
                productos
            })
        })
        .catch(error => console.log(error))
    },

    storageProduct: (req,res) => {

        const errors = validationResult(req);

        if (req.fileValidationError) {
            errors.errors.push({
                value: "",
                msg: req.fileValidationError,
                param: "producto",
                location: "file"
            });
        } else if (!req.file) {
            errors.errors.push({
                value: "",
                msg: "Debes subir la imagen del producto",
                param: "producto",
                location: "file"
            });
        }
    

        if(errors.isEmpty()){
            const {nombre, medida, detalle} = req.body

            db.Producto.create({
                nombre:nombre.trim(),
                unidadDeMedida: medida,
                detalle:detalle.trim(),
                imagen: req.file ? req.file.filename : null
            })
            .then(producto => {
                db.Producto.findAll()
        .then(productos => {
            return res.render('stock/productos',{
                title:'Productos',
                productos
            })
        })
            })
            .catch(error => console.log(error))
        } else {

            if(req.file){
               fs.existsSync(path.join(__dirname, `../../public/images/productos/${req.file.filename}`)) && fs.unlinkSync(path.join(__dirname, `../../public/images/productos/${req.file.filename}`))
            }

            return res.render('stock/addproduct',{
                title:"Nuevo Producto",
                errors: errors.mapped(),
                old: req.body
            })   
    
        }
    },

    editProduct : (req,res) => {

        const id = req.params.id

        db.Producto.findOne({
            where:{
                id:id
            }
        })
        .then(producto => {
            return res.render('stock/editProduct',{
                title: 'Editar producto',
                producto
            })
        }).catch(error => console.log(error))

    },
    
    updateProduct : (req,res) => {

        const errors = validationResult(req);

        if (req.fileValidationError) {
            errors.errors.push({
                value: "",
                msg: req.fileValidationError,
                param: "producto",
                location: "file"
            });
        
        }

        if(errors.isEmpty()){
            const id = req.params.id;

            const {nombre, detalle, medida} = req.body;

            let oldImage; 

            db.Producto.findByPk(id)
            .then(producto => {  
                oldImage = producto.imagen;    

                return producto.update({
                    nombre: nombre.trim(),
                    detalle: detalle.trim(),
                    unidadDeMedida: medida,
                    imagen: req.file ? req.file.filename : producto.imagen
                });
            })
            .then(() => {

                if(req.file){
                    fs.existsSync(path.join(__dirname, `../../public/images/productos/${oldImage}`)) && fs.unlinkSync(path.join(__dirname, `../../public/images/productos/${oldImage}`))
                 }

                return res.redirect('/stock/products')
            })
            .catch(error => console.log(error))

     
        } else {
            if(req.file){
                fs.existsSync(path.join(__dirname, `../../public/images/productos/${req.file.filename}`)) && fs.unlinkSync(path.join(__dirname, `../../public/images/productos/${req.file.filename}`))
             }

             const id = req.params.id

             db.Producto.findOne({
                 where:{
                     id:id
                 }
             })
             .then(producto => {
                 return res.render('stock/editProduct',{
                     title: 'Editar producto',
                     producto,
                     errors: errors.mapped(),
                     old: req.body,
                 })
             }).catch(error => console.log(error))


        }

    },

    deleteProduct : (req,res) => {

      
            const id = req.params.id

            db.Producto.findByPk(id)
            .then(producto => {
                fs.existsSync(path.join(__dirname, `../../public/images/productos/${producto.imagen}`)) && fs.unlinkSync(path.join(__dirname, `../../public/images/productos/${producto.imagen}`));

            db.Producto.destroy({
                where:{id:producto.id},
            }).then(() => {
                return res.redirect('/stock/products')
            }).catch(errors => console.log(errors))
            })
    },

    searchProduct : (req,res) => {

        const querySearch = req.query.search;

        db.Producto.findAll({
            where:{
                nombre: {
                    [Op.like] : `%${querySearch}%`
                }
            }
        }) .then(producto => {
           /*  return res.send(producto) */
            return res.render('stock/searchProduct',{
                title: 'resultado de la busqueda',
                producto
            })
        })

    },

   


























 

    estadisticas: (req,res) => {

        const productos = db.Producto.findAll({
            attributes: ['id', 'nombre']
        })

        const destinos = db.destinoUsuario.findAll({
            attributes:['id', 'nombreDestino' ]
        })

        Promise.all(([productos, destinos]))
        .then(([productos, destinos]) => {
            return res.render('stock/estadistica',{
                title:'Estadisticas',
                productos,
                destinos
            })
        })
      
    },

 

 


 


 

    descargarTablaStock : async (req,res) => {      

        try {
            const datosStock = await getGeneralStock(); // Traigo mi consulta de stock
    
            const workbook = new ExcelJS.Workbook(); // Función constructora del Excel
            const worksheet = workbook.addWorksheet('Sheet 1'); // Crea una hoja de Excel (CREO)
    
            // Agregar títulos de columnas
            const titleRow = worksheet.addRow(["Nombre Destino", "Nombre Producto", "Cantidad", "Actualizado el"]);
    
            // Aplicar formato al título
            titleRow.eachCell((cell) => {
                cell.font = { bold: true }; // Establece el texto en negrita
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFF00' } // Cambia el color de fondo a amarillo (puedes cambiar 'FFFF00' por el código del color que prefieras)
                };
    
                // Agregar bordes
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
    
            datosStock.forEach(stock => {
                const row = worksheet.addRow([stock.destino.nombreDestino, stock.producto.nombre, stock.cantidad, stock.updatedAt]);
                
                // Aplicar bordes a las celdas de la fila de datos
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });
    
            const fecha = new Date(Date.now());
    
            // Define el nombre del archivo Excel
            res.setHeader('Content-Disposition', `attachment; filename="${fecha.toISOString().substring(0, 10)}-stock.xlsx"`); // agregar al nombre la fecha con New Date()
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
            // Envia el archivo Excel como respuesta al cliente
            await workbook.xlsx.write(res);
    
            // Finaliza la respuesta
            res.end();
        } catch (error) {
            console.log(error);
        }

    },

    descargarTablaRetirosStock : async (req,res) => {
        try {
            const datosStock = await db.detalleRetiro.findAll({
                include:["destino", "producto"],
                order:[["updatedAt", "DESC"]]
            }) ; // Traigo mi consulta de stock

         /*    return res.send(datosStock) */
    
            const workbook = new ExcelJS.Workbook(); // Función constructora del Excel
            const worksheet = workbook.addWorksheet('Sheet 1'); // Crea una hoja de Excel (CREO)
    
            // Agregar títulos de columnas
            const titleRow = worksheet.addRow(["Nombre Destino", "Nombre Producto", "Cantidad Retirada", "Actualizado el"]);
    
            // Aplicar formato al título
            titleRow.eachCell((cell) => {
                cell.font = { bold: true }; // Establece el texto en negrita
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFF00' } // Cambia el color de fondo a amarillo (puedes cambiar 'FFFF00' por el código del color que prefieras)
                };
    
                // Agregar bordes
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
    
            datosStock.forEach(stock => {
                const row = worksheet.addRow([stock.destino.nombreDestino, stock.producto.nombre, stock.cantidadRetirada, stock.updatedAt]);
                
                // Aplicar bordes a las celdas de la fila de datos
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });
    
            const fecha = new Date(Date.now());
    
            // Define el nombre del archivo Excel
            res.setHeader('Content-Disposition', `attachment; filename="${fecha.toISOString().substring(0, 10)}-RetirosStock.xlsx"`); // agregar al nombre la fecha con New Date()
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
            // Envia el archivo Excel como respuesta al cliente
            await workbook.xlsx.write(res);
    
            // Finaliza la respuesta
            res.end();
        } catch (error) {
            console.log(error);
        }
    },

    descargarTablaStockCPFII: async (req,res) => {
        try {
            const datosStock = await getAllStocks(); // Traigo mi consulta de stock
    
            const workbook = new ExcelJS.Workbook(); // Función constructora del Excel
            const worksheet = workbook.addWorksheet('Sheet 1'); // Crea una hoja de Excel (CREO)
    
            // Agregar títulos de columnas
            const titleRow = worksheet.addRow(["Nombre Destino", "Nombre Producto", "Cantidad", "Actualizado el"]);
    
            // Aplicar formato al título
            titleRow.eachCell((cell) => {
                cell.font = { bold: true }; // Establece el texto en negrita
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFF00' } // Cambia el color de fondo a amarillo (puedes cambiar 'FFFF00' por el código del color que prefieras)
                };
    
                // Agregar bordes
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
    
            datosStock.forEach(stock => {
                const row = worksheet.addRow([stock.usuario.destino.nombreDestino, stock.producto.nombre, stock.cantidad, stock.updatedAt]);
                
                // Aplicar bordes a las celdas de la fila de datos
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });
    
            const fecha = new Date(Date.now());
    
            // Define el nombre del archivo Excel
            res.setHeader('Content-Disposition', `attachment; filename="${fecha.toISOString().substring(0, 10)}-stockCPFII.xlsx"`); // agregar al nombre la fecha con New Date()
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
            // Envia el archivo Excel como respuesta al cliente
            await workbook.xlsx.write(res);
    
            // Finaliza la respuesta
            res.end();
        } catch (error) {
            console.log(error);
        }
    }
}