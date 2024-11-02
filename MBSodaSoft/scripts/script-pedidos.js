const pedidoForm = document.getElementById('pedidoForm');
const pedidoList = document.getElementById('pedidoList');

document.addEventListener("DOMContentLoaded", function () {
    cargarClientes(); // Cargar clientes en el select
    cargarProductos(); // Cargar productos en el select
    cargarPedidos();

    // Evento para enviar el formulario
    pedidoForm.addEventListener("submit", function (event) {
        event.preventDefault(); 
        crearPedido(); 
    });
});

// Función para cargar los clientes en el select
function cargarClientes() {
    fetch('http://localhost:6500/api/clientes')
        .then(response => response.json())
        .then(clientes => {
            const clienteSelect = document.getElementById("Cliente");
            clienteSelect.innerHTML = "";
            clientes.forEach(cliente => {
                const option = document.createElement("option");
                option.value = cliente.idCliente; // Usar ID como valor
                option.textContent = `${cliente.idCliente} - ${cliente.nombre}`; // Mostrar ID y nombre
                clienteSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error al cargar clientes:", error));
}

// Función para cargar y mostrar los pedidos en la tabla
async function cargarPedidos() {
    try {
        const response = await fetch('http://localhost:6500/api/pedidos');
        if (!response.ok) throw new Error('Error al cargar pedidos');
        
        const pedidos = await response.json();
        
        // Selecciona el cuerpo de la tabla
        const tablaPedidos = document.getElementById('table_pedidos');
        tablaPedidos.innerHTML = ''; // Limpiar el contenido previo

        pedidos.forEach(pedido => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>| ${pedido.idPedido}</td>
                <td>| ${pedido.fecha}</td>
                <td>| $${pedido.precioFinal.toFixed(2)}</td>
                <td>| ${pedido.cliente}</td>
            `;
            tablaPedidos.appendChild(fila); // Agregar fila a la tabla
        });
    } catch (error) {
        console.error("Error al cargar pedidos:", error);
    }
}

// Lista para acumular productos
let pedido = []; 
// Función para agregar un producto a la lista de pedidos
function agregarProducto(id, nombre, precioUnitario, cantidad) {
    pedido.push({
        id: id,
        nombre: nombre,
        precioUnitario: precioUnitario,
        cantidad: cantidad
    });
    mostrarPedido();
}

function mostrarPedido() {
    const pedidoContainer = document.getElementById('pedidoContainer');
    pedidoContainer.innerHTML = ''; // Limpia el contenido previo

    let total = 0;

    pedido.forEach(item => {
        const itemTotal = item.precioUnitario * item.cantidad;
        total += itemTotal;

        // Crea un elemento para mostrar el producto
        const productoElemento = document.createElement('div');
        productoElemento.textContent = `${item.nombre} - Cantidad: ${item.cantidad} - Precio Unitario: $${item.precioUnitario.toFixed(2)} - Total: $${itemTotal.toFixed(2)}`;
        pedidoContainer.appendChild(productoElemento);
    });

    // Muestra el total del pedido
    const totalElemento = document.createElement('div');
    totalElemento.textContent = `Total del Pedido: $${total.toFixed(2)}`;
    pedidoContainer.appendChild(totalElemento);
}

// Función para crear el pedido
function crearPedido() {
    const idCliente = document.getElementById("Cliente").value;
    const fecha = document.getElementById("fecha").value;

    // Validar campos requeridos
    if (!idCliente || !fecha) {
        alert("Por favor, complete todos los campos correctamente.");
        return;
    }

    // Calcular el precio final sumando el total de todos los productos
    const precioFinal = pedido.reduce((total, item) => total + (item.precioUnitario * item.cantidad), 0);

    // Crear el pedido
    fetch('http://localhost:6500/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idCliente: idCliente, fecha: fecha, precioFinal: precioFinal })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al crear el pedido: ' + response.status);
        }
        return response.json();
    })
    .then(pedidoCreado => {
        const idPedido = pedidoCreado.idPedido; // Obtener ID del pedido creado

        // Crear el producto asociado al pedido en productoPedido
        const productosPromises = pedido.map(item => {
            return fetch('http://localhost:6500/api/productopedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idPedido: idPedido,
                    idProducto: item.id,
                    cantidad: item.cantidad,
                    precioUnitario: item.precioUnitario
                })
            });
        });

        return Promise.all(productosPromises);
    })
    .then(() => {
        alert("Pedido creado con éxito.");
        cargarPedidos(); 
        pedido = []; 
        mostrarPedido(); 
        pedidoForm.reset(); 
    })
    .catch(error => console.error("Error al crear el pedido o productos:", error));
}

// Función para cargar productos en el select
async function cargarProductos() {
    try {
        const response = await fetch('http://localhost:6500/api/productos');
        if (!response.ok) {
            throw new Error('Error al cargar los productos');
        }
        const productos = await response.json();
        
        // Obtener el select
        const productoSelect = document.getElementById('productoSelect');
        
        // Llenar el select con los productos
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = producto.nombre; 
            productoSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Evento para agregar productos al pedido
document.getElementById('agregarProductoBtn').addEventListener('click', (event) => {
    event.preventDefault(); 
    const productoSelect = document.getElementById('productoSelect');
    const cantidadInput = document.getElementById('cantidadInput'); 
    const precioInput = document.getElementById('precioInput'); 
    
    const productoId = productoSelect.value;
    const productoNombre = productoSelect.options[productoSelect.selectedIndex].text;
    const precioUnitario = parseFloat(precioInput.value) || 0; 
    const cantidad = parseInt(cantidadInput.value, 10) || 1; // Si no se introduce cantidad, usa por defecto la cant 1

    if (productoId && precioUnitario > 0) {
        agregarProducto(productoId, productoNombre, precioUnitario, cantidad);
        
        cantidadInput.value = 1; 
        precioInput.value = '';
        productoSelect.value = '';
    } else {
        alert('Por favor, selecciona un producto y asegúrate de que el precio sea válido.');
    }
});


// Función para cargar pedidos y mostrarlos en la tabla
function cargarPedidos() {
    fetch('http://localhost:6500/api/pedidos')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector("#table_pedidos");
            tableBody.innerHTML = '';
            data.forEach(pedido => {
                const fecha = new Date(pedido.fecha);
                const fechaFormateada = fecha.toISOString().split('T')[0]; // "YYYY-MM-DD"
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${pedido.idPedido}</td>
                    <td>${fechaFormateada}</td>
                    <td>${pedido.precioFinal}</td>
                    <td>${pedido.idCliente}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error al cargar los pedidos:", error);
        });
}


document.addEventListener("DOMContentLoaded", function () {
    cargarPedidos();
});
