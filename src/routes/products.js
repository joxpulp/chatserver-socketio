import express from 'express';
import socketIo from 'socket.io';
import Product from '../productclass';

export const router = express.Router();
const products = new Product();

const messages = []

// Endpoint GET para listar todos los productos
router.get('/productos/listar', (req, res) => {
	const getProducts = products.getProducts();
	getProducts.length !== 0
		? res.json({ products: getProducts })
		: res.status(404).json({ error: 'No hay productos cargados' });
});

// Endpoint GET para pedir un producto especifico por ID
router.get('/productos/listar/:id', (req, res) => {
	const specificId = req.params.id;
	const getProducts = products.getProducts();
	const product = getProducts.find((product) => product.id == specificId);
	product
		? res.json({ product })
		: res.status(404).json({ error: 'Producto no encontrado' });
});

// Endpoint POST para agregar un producto
router.post('/productos/guardar', (req, res) => {
	const body = req.body;
	const product = products.addProduct(body.title, body.price, body.thumbnail);
	res.json({ product });
});

// Endpoint PUT para actualizar un producto por ID
router.put('/productos/actualizar/:id', (req, res) => {
	const specificId = req.params.id;
	const body = req.body;
	const updatedProduct = products.updateProduct(
		specificId,
		body.title,
		body.price,
		body.thumbnail
	);
	updatedProduct === -1
		? res.status(404).json({ error: 'Producto no encontrado' })
		: res.status(201).json({ product: updatedProduct });
});

// Endpoint DELETE para borrar un producto por ID
router.delete('/productos/borrar/:id', (req, res) => {
	const specificId = req.params.id;
	const deletedProduct = products.deleteProduct(specificId);
	deletedProduct === -1
		? res.status(404).json({ error: 'Producto no encontrado o ya eliminado' })
		: res.json({ deletedProduct });
});

// Socket Server
export const ioServer = (server) => {
	const io = socketIo(server);
	io.on('connection', (socket) => {
		console.log('Client Connected');

		socket.on('hi', () => {
			console.log('Connected Client REACT');
		});

		socket.on('addProduct', (data) => {
			products.addProduct(data.title, data.price, data.thumbnail);
			io.emit('products', products.getProducts());
		});

		socket.emit('products', products.getProducts());

		socket.on('sendMessage', (message) => {
			console.log(message)
			messages.push(message)
			io.emit('messages', messages);
		})

		socket.emit('messages', messages )
	});

	return io;
};
