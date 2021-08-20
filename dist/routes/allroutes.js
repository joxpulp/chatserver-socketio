"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ioServer = exports.router = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _express = _interopRequireDefault(require("express"));

var _socket = _interopRequireDefault(require("socket.io"));

var _productclass = _interopRequireDefault(require("../productclass"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var router = _express["default"].Router();

exports.router = router;
var products = new _productclass["default"]();
var messages = [];

var readMessages = function readMessages() {
  var txtFile = messages.length !== 0 ? _toConsumableArray(JSON.parse(_fs["default"].readFileSync('messageslog.txt', 'utf-8'))) : [];
  messages = txtFile;
  return messages;
}; // Endpoint GET para listar todos los productos


router.get('/productos/listar', function (req, res) {
  var getProducts = products.getProducts();
  getProducts.length !== 0 ? res.json({
    products: getProducts
  }) : res.status(404).json({
    error: 'No hay productos cargados'
  });
}); // Endpoint GET para listar todos los messages

router.get('/mensajes/listar', function (req, res) {
  var txtFile = _fs["default"].readFileSync('messageslog.txt', 'utf-8');

  messages = _toConsumableArray(JSON.parse(txtFile));
  messages.length !== 0 ? res.json({
    messages: messages
  }) : res.status(404).json({
    error: 'No hay mensajes cargados'
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
}); // Endpoint POST para agregar un producto

router.post('/mensajes/guardar', function (req, res) {
  var body = req.body;
  messages.push({
    email: body.email,
    date: body.date,
    time: body.time,
    message: body.message
  });

  _fs["default"].writeFileSync('messageslog.txt', JSON.stringify(messages, null, 2));

  res.json({
    mensaje: body
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
    socket.on('addProduct', function (data) {
      products.addProduct(data.title, data.price, data.thumbnail);
      io.emit('products', products.getProducts());
    });
    socket.emit('products', products.getProducts());
    socket.on('sendMessage', function (message) {
      messages.push(message);

      _fs["default"].writeFileSync('messageslog.txt', JSON.stringify(messages, null, 2));

      io.emit('messages', readMessages());
    });
    socket.emit('messages', readMessages());
  });
  return io;
};

exports.ioServer = ioServer;