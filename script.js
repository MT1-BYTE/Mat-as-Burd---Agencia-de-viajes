pedirProductos()
    
function pedirProductos() {
    fetch("./info.json")
        .then(response => response.json())
        .then(productos => principal(productos))
        .catch(error => notificacionError(error))
}

function principal(productos) {
    let carrito = recuperarCarritoDelStorage("carrito")
    console.log("🚀 ~ principal ~ carrito:", carrito)

    renderizarCarrito(carrito)

    crearTarjetasProductos(productos)

    // Buscador

    let inputBuscar = document.getElementById("inputBuscar")
    inputBuscar.addEventListener("input", (e) => filtrarYrenderizar(e, productos))

    let filtroCategorias = document.getElementById("filtroCategorias")
    filtroCategorias.addEventListener("change", (e) => filtrarPorCategoria(e, productos))

    let botonesAgregarProductos = document.getElementsByClassName("botonAgregarAlCarrito")
    for (const boton of botonesAgregarProductos) {
        boton.addEventListener("click", (e) => agregarProductoAlCarrito(e, productos))
    }

    let botonProductosCarrito = document.getElementById("productosCarrito")
    botonProductosCarrito.addEventListener("click", verOcultarCarrito)

    let botonComprar = document.getElementById("botonComprar")
    botonComprar.addEventListener("click", finalizarCompra)
}

function filtrarPorCategoria(e, productos) {
    const categoria = e.target.value
    const productosFiltrados = productos.filter(producto => producto.categoria.includes(categoria))
    crearTarjetasProductos(productosFiltrados)
}

function calcularTotal(productos) {
    return productos.reduce((acum, producto) => acum + producto.subtotal, 0)
}

function actualizarTotal(total) {
    let elementoTotal = document.getElementById("total")
    elementoTotal.innerText = "$" + total 
}

function finalizarCompra() {
    // Mostrar alerta de "procesando"
    Swal.fire({
      title: "Tu compra está siendo procesada...",
      html: "Por favor, esperá mientras completamos tu transacción.",
      timer: 7000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      }
    }).then(() => {
      // Mostrar alerta de "pago exitoso"
      Swal.fire({
        title: "¡Tu pago fue procesado correctamente!",
        text: "Enviaremos todos los detalles a tu correo",
        icon: "success",
        draggable: true,
        confirmButtonText: "Finalizar",
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-confirm-button'
        }
      }).then(() => {
        // Limpiar carrito y actualizar localStorage después del pago exitoso
        renderizarCarrito([]) 
        localStorage.removeItem("carrito") 
      })
    })
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

    mostrarNotificacionCarrito(productoOriginal)
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

function mostrarNotificacionCarrito(producto) {
    let mensaje = "";
  
    // Determinar el mensaje según la categoría del producto
    switch (producto.categoria) {
      case "vuelo":
        mensaje = "¡Agregaste un vuelo al carrito!";
        break;
      case "alojamiento":
        mensaje = "¡Agregaste un alojamiento al carrito!";
        break;
      case "paquete":
        mensaje = "¡Agregaste un paquete al carrito!";
        break;
      default:
        mensaje = "¡Agregaste un producto al carrito!";
    }
  
    // Usar Toastify para mostrar la notificación
    Toastify({
      text: mensaje, 
      duration: 3000,
      close: true, 
      gravity: "bottom", 
      position: "right", 
      stopOnFocus: true, 
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)", 
      }
    }).showToast(); 
}

function notificacionError(error) {
    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Algo salió mal",
        footer: "Por favor, intente nuevamente en un momento"
    })
}
