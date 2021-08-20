"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ioServer = exports.router = void 0;

var _express = _interopRequireDefault(require("express"));

var _socket = _interopRequireDefault(require("socket.io"));

var _productclass = _interopRequireDefault(require("../productclass"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();

exports.router = router;
var products = new _productclass["default"]();
var messages = []; // Endpoint GET para listar todos los productos

router.get('/productos/listar', function (req, res) {
  var getProducts = products.getProducts();
  getProducts.length !== 0 ? res.json({
    products: getProducts
  }) : res.status(404).json({
    error: 'No hay productos cargados'
  });
}); // Endpoint GET para pedir un producto especifico por ID

router.get('/productos/listar/:id', function (req, res) {
  var specificId = req.params.id;
  var getProducts = products.getProducts();
  var product = getProducts.find(function (product) {
    return product.id == specificId;
  });
  product ? res.json({
    product: product
  }) : res.status(404).json({
    error: 'Producto no encontrado'
  });
}); // Endpoint POST para agregar un producto

router.post('/productos/guardar', function (req, res) {
  var body = req.body;
  var product = products.addProduct(body.title, body.price, body.thumbnail);
  res.json({
    product: product
  });
}); // Endpoint PUT para actualizar un producto por ID

router.put('/productos/actualizar/:id', function (req, res) {
  var specificId = req.params.id;
  var body = req.body;
  var updatedProduct = products.updateProduct(specificId, body.title, body.price, body.thumbnail);
  updatedProduct === -1 ? res.status(404).json({
    error: 'Producto no encontrado'
  }) : res.status(201).json({
    product: updatedProduct
  });
}); // Endpoint DELETE para borrar un producto por ID

router["delete"]('/productos/borrar/:id', function (req, res) {
  var specificId = req.params.id;
  var deletedProduct = products.deleteProduct(specificId);
  deletedProduct === -1 ? res.status(404).json({
    error: 'Producto no encontrado o ya eliminado'
  }) : res.json({
    deletedProduct: deletedProduct
  });
}); // Socket Server

var ioServer = function ioServer(server) {
  var io = (0, _socket["default"])(server);
  io.on('connection', function (socket) {
    console.log('Client Connected');
    socket.on('hi', function () {
      console.log('Connected Client REACT');
    });
    socket.on('addProduct', function (data) {
      products.addProduct(data.title, data.price, data.thumbnail);
      io.emit('products', products.getProducts());
    });
    socket.emit('products', products.getProducts());
    socket.on('sendMessage', function (message) {
      console.log(message);
      messages.push(message);
      io.emit('messages', messages);
    });
    socket.emit('messages', messages);
  });
  return io;
};

exports.ioServer = ioServer;