function principal() {
    let productos = [
        {id: 1, destino: "Uruguay", precio: 500, stock: 20, categoria: "vuelo", rutaImagen: "uruguay.jpg"},
        {id: 2, destino: "Miami", precio: 800, stock: 4, categoria: "vuelo", rutaImagen: "miami.jpg"},
        {id: 3, destino: "Bariloche", precio: 400, stock: 1, categoria: "vuelo", rutaImagen: "bariloche.jpg"},
        {id: 4, destino: "Hotel Resort", precio: 2000, stock: 30, categoria: "alojamiento", rutaImagen: "hotelresort.jpg"},
        {id: 5, destino: "Hotel Playas", precio: 2500, stock: 10, categoria: "alojamiento", rutaImagen: "hotelplaya.jpg"},
        {id: 6, destino: "Paquete aventura", precio: 1500, stock: 5, categoria: "paquete", rutaImagen: "paqueteaventura.jpg"},
        {id: 7, destino: "Paquete relax", precio: 1200, stock: 7, categoria: "paquete", rutaImagen: "paqueterelax.jpg"},
        {id: 8, destino: "Hotel Montaña", precio: 1800, stock: 25, categoria: "alojamiento", rutaImagen: "hotelmontaña.jpg"},
        {id: 9, destino: "Santiago de Chile", precio: 600, stock: 8, categoria: "vuelo", rutaImagen: "santiagodechile.jpg"},
        {id: 10, destino: "Paris", precio: 1500, stock: 2, categoria: "vuelo", rutaImagen: "paris.jpg"},
        {id: 11, destino: "Paquete Europa", precio: 4500, stock: 3, categoria: "paquete", rutaImagen: "paqueteeuropa.jpg"},
        {id: 12, destino: "Hotel Mar", precio: 1700, stock: 20, categoria: "alojamiento", rutaImagen: "hotelmar.jpg"},
        {id: 13, destino: "Buenos Aires", precio: 700, stock: 12, categoria: "vuelo", rutaImagen: "buenosaires.jpg"},
        {id: 14, destino: "Paquete luna de miel", precio: 3500, stock: 6, categoria: "paquete", rutaImagen: "paqueteluna.jpg"},
        {id: 15, destino: "Hotel Buenos Aires", precio: 2200, stock: 10, categoria: "alojamiento", rutaImagen: "hotelbuenos.jpg"},
        {id: 16, destino: "Nueva York", precio: 1200, stock: 3, categoria: "vuelo", rutaImagen: "ny.jpg"}
    ]

    let carrito = recuperarCarritoDelStorage("carrito")
    console.log("🚀 ~ principal ~ carrito:", carrito)

    renderizarCarrito(carrito)

    crearTarjetasProductos(productos)

    // Buscador

    let inputBuscar = document.getElementById("inputBuscar")
    inputBuscar.addEventListener("input", (e) => filtrarYrenderizar(e, productos))

    let botonesAgregarProductos = document.getElementsByClassName("botonAgregarAlCarrito")
    for (const boton of botonesAgregarProductos) {
        boton.addEventListener("click", (e) => agregarProductoAlCarrito(e, productos))
    }

    let botonProductosCarrito = document.getElementById("productosCarrito")
    botonProductosCarrito.addEventListener("click", verOcultarCarrito)

    let botonComprar = document.getElementById("botonComprar")
    botonComprar.addEventListener("click", finalizarCompra)

}

principal()

function calcularTotal(productos) {
    return productos.reduce((acum, producto) => acum + producto.subtotal, 0)
}

function actualizarTotal(total) {
    let elementoTotal = document.getElementById("total")
    elementoTotal.innerText = "$" + total
    
}

function finalizarCompra() {
    alert("Gracias por su compra")
    renderizarCarrito([]) 
    localStorage.removeItem("carrito")
}

function crearTarjetasProductos(productos) {
    let contenedor = document.getElementById("contenedorProductos")
    contenedor.innerHTML = ""
    productos.forEach(producto => {

        let mensaje = ""

        if (producto.categoria === "vuelo") {
            mensaje = `Asientos disponibles: ${producto.stock}`
        } else if (producto.categoria === "alojamiento") {
            mensaje = `Habitaciones disponibles: ${producto.stock}`
        } else if (producto.categoria === "paquete") {
            mensaje = `Paquetes disponibles: ${producto.stock}`
        } else {
            mensaje = `Categoría no reconocida: ${producto.categoria}`;
        }

        if (producto.stock < 5) {
            mensaje = "¡Quedan pocos lugares!"
        }

        let tarjetaProducto = document.createElement("div")
        tarjetaProducto.className = "producto"
        tarjetaProducto.innerHTML = `
            <img src=./images/${producto.rutaImagen}>
            <h2>${producto.destino}</h2>
            <p>USD ${producto.precio}</p>
            <p>${mensaje}</p>
            <button class=botonAgregarAlCarrito id=agc${producto.id}>Agregar al carrito</button>

        `
        contenedor.appendChild(tarjetaProducto)
    })
}

function agregarProductoAlCarrito(event, productos) {
    let carrito = recuperarCarritoDelStorage()
    let id = Number(event.target.id.substring(3))
    let productoOriginal = productos.find(producto => producto.id === id)
    let indiceProductoEnCarrito = carrito.findIndex(producto => producto.id === id)
    if (indiceProductoEnCarrito === -1) {
        carrito.push({
            id: productoOriginal.id,
            nombre: productoOriginal.destino,
            precioUnitario: productoOriginal.precio,
            unidades: 1,
            subtotal: productoOriginal.precio
        }) 
    } else {
        carrito[indiceProductoEnCarrito].unidades++
        carrito[indiceProductoEnCarrito].subtotal = carrito[indiceProductoEnCarrito].precioUnitario * carrito[indiceProductoEnCarrito].unidades
    }  

    guardarEnStorage(carrito)

    renderizarCarrito(carrito)
}

function renderizarCarrito(carrito) {
    let contenedorCarrito = document.getElementById("carrito")
    contenedorCarrito.innerHTML = ""

    carrito.forEach(producto => {
        let tarjetaCarrito = document.createElement("div")
        tarjetaCarrito.className = "tarjetaCarrito"
        tarjetaCarrito.id = "tca" + producto.id
        
        tarjetaCarrito.innerHTML = `
            <p>${producto.nombre}</p>
            <p>${producto.precioUnitario}</p>
            <div class=unidades>
                <button id=run${producto.id}>-</button>
                <p>${producto.unidades}</p>
                <button id=sun${producto.id}>+</button>
            </div>
            <p>${producto.subtotal}</p>
            <button id=eli${producto.id}>Eliminar</button>
        `
        contenedorCarrito.appendChild(tarjetaCarrito)

        let botonEliminar = document.getElementById("eli" + producto.id)
        botonEliminar.addEventListener("click", eliminarProductoDelCarrito)

        let botonRestarUnidad = document.getElementById("run" + producto.id)
        botonRestarUnidad.addEventListener("click", restarUnidadProdCarrito)

        let botonSumarUnidad = document.getElementById("sun" + producto.id)
        botonSumarUnidad.addEventListener("click", sumarUnidadProdCarrito)
    })

    let total = calcularTotal(carrito)
    actualizarTotal(total)
}

function sumarUnidadProdCarrito(e) {
    let id = Number(e.target.id.substring(3))
    let carrito = recuperarCarritoDelStorage()
    let indiceProducto = carrito.findIndex(producto => producto.id === id)

    if (indiceProducto !== -1) {
        carrito[indiceProducto].unidades++
        carrito[indiceProducto].subtotal = carrito[indiceProducto].precioUnitario * carrito[indiceProducto].unidades
        guardarEnStorage(carrito) 

        e.target.previousElementSibling.innerText = carrito[indiceProducto].unidades
        e.target.parentElement.nextElementSibling.innerText = carrito[indiceProducto].subtotal
    }

    const total = calcularTotal(carrito)
    actualizarTotal(total)
}

function restarUnidadProdCarrito(e) {
    let id = Number(e.target.id.substring(3))
    let carrito = recuperarCarritoDelStorage()
    let indiceProducto = carrito.findIndex(producto => producto.id === id)

    if (indiceProducto !== -1) {
        carrito[indiceProducto].unidades--

        if (carrito[indiceProducto].unidades === 0) {
            carrito.splice(indiceProducto, 1)
            e.target.parentElement.parentElement.remove()
         
        } else {
            carrito[indiceProducto].subtotal = carrito[indiceProducto].precioUnitario * carrito[indiceProducto].unidades
        
            e.target.nextElementSibling.innerText = carrito[indiceProducto].unidades
            e.target.parentElement.nextElementSibling.innerText = carrito[indiceProducto].subtotal
        }        
        guardarEnStorage(carrito)
    }
    
    const total = calcularTotal(carrito)
    actualizarTotal(total)
}

function eliminarProductoDelCarrito(e) {
    let id = Number(e.target.id.substring(3))
    let carrito = recuperarCarritoDelStorage()
    let indiceProducto = carrito.findIndex(producto => producto.id === id)

    if (indiceProducto !== -1) {
        carrito.splice(indiceProducto, 1)
        let tarjetaCarrito = document.getElementById("tca" + id)
        tarjetaCarrito.remove()
    }

    guardarEnStorage(carrito)

    const total = calcularTotal(carrito)
    actualizarTotal(total)
}

function verOcultarCarrito(e) {
    let carrito = document.getElementById("pantallaCarrito")
    let contenedorProductos = document.getElementById("pantallaProductos")

    carrito.classList.toggle("oculta")
    contenedorProductos.classList.toggle("oculta")

    if (e.target.innerText === "Carrito") {
        e.target.innerText = "Productos"
    } else {
        e.target.innerText = "Carrito"
    }
}

function guardarEnStorage(valor) {
    let valorJson = JSON.stringify(valor)
    localStorage.setItem("carrito", valorJson)
}

function recuperarCarritoDelStorage () {
    let valorJson = localStorage.getItem("carrito")
    let carrito = JSON.parse(valorJson)
    if (!carrito) {
        carrito = []
    }
    return carrito
}

function filtrarYrenderizar(e, productos) {
    let arrayFiltrado = filtrar(e, productos)
    crearTarjetasProductos(arrayFiltrado)
    
}

function filtrar(e, productos) {
    return productosFiltrados = productos.filter(producto => producto.destino.toLowerCase().includes(e.target.value.toLowerCase()) || producto.categoria.toLowerCase().includes(e.target.value.toLowerCase())) 
}


