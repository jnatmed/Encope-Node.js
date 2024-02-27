'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Proyecto extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Proyecto.hasMany(models.Historial,{
        foreignKey:'idProyecto',
        has:'historialProyecto'
      })

      Proyecto.hasMany(models.Parte,{
        foreignKey:'idProyecto',
        has:'parteProyecto'
      })  
      
      Proyecto.hasMany(models.proyectoProducto,{
        foreignKey:'proyectoId',
        has:'parteProyecto'
      }) 

  

      Proyecto.belongsTo(models.Taller,{
        foreignKey:'idTaller',
        as:'proyectoTaller',
        onDelete:'CASCADE'
      })

      Proyecto.belongsTo(models.Ficha,{
        foreignKey:'idFicha',
        as:'proyectoFicha',
        onDelete:'CASCADE'
      })

    }
  }
  Proyecto.init({
    nombre: DataTypes.STRING,
    expediente: DataTypes.STRING,
    idTaller: DataTypes.INTEGER,
    cantidadTotal: DataTypes.INTEGER,
    detalle: DataTypes.STRING,
    procedencia: DataTypes.STRING,
    duracion: DataTypes.INTEGER,
    unidadDuracion: DataTypes.STRING,
    costoTotalProyecto: DataTypes.INTEGER, 
    idFicha: DataTypes.INTEGER,
    insumos:DataTypes.STRING,
    estado:{
      type: DataTypes.STRING,
      defaultValue:"pendiente",
      validate:{
        isIn:{
          args: [["Pendiente", "Finalizado"]],
          msg:"Los estados validos son Pendiente y Finalizado"
        },
      },
    },
  }, {
    sequelize,
    modelName: 'Proyecto',
  });
  return Proyecto;
};