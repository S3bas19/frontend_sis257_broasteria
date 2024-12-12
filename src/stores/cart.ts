import { defineStore } from 'pinia'
//import { useAuthStore } from '@/stores/index'
import http from '@/plugins/axios'
import router from '@/router'
import type { ProductoCarrito } from '@/models/productoCarrito'

export const useCartStore = defineStore('cart', {
  state: () => ({
    productos: [] as ProductoCarrito[], // Lista de productos en el carrito
    idCliente: null as number | null, // Nuevo estado para almacenar el idCliente
  }),

  actions: {
    // Acción para agregar un producto al carrito
    agregarAlCarrito(producto: ProductoCarrito) {
      const productoExistente = this.productos.find((p) => p.id === producto.id)
      if (productoExistente) {
        productoExistente.cantidad++
      } else {
        this.productos.push({ ...producto, cantidad: 1 })
      }
      console.log('Productos en el carrito:', this.productos)
    },

    // Acción para eliminar un producto del carrito
    eliminarDelCarrito(productoId: number) {
      this.productos = this.productos.filter((p) => p.id !== productoId)
    },

    // Acción para vaciar el carrito
    vaciarCarrito() {
      this.productos = []
    },

    // Acción para seleccionar un cliente
    seleccionarCliente(idCliente: number) {
      this.idCliente = idCliente // Guardamos el idCliente en el estado
    },

    // Acción para calcular el monto total del carrito
    calcularMontoTotal(): number {
      return this.productos.reduce((total, producto) => {
        const precioVenta = parseFloat(producto.precioVenta.toString())
        const cantidad = parseInt(producto.cantidad.toString(), 10)
        return total + precioVenta * cantidad
      }, 0)
    },

    // Acción para realizar la venta
    async realizarVenta() {
      //const authStore = useAuthStore()

      // Si no hay productos en el carrito, no proceder
      if (this.productos.length === 0) {
        console.error('El carrito está vacío')
        return
      }

      if (!this.idCliente) {
        console.error('Debe seleccionar un cliente')
        return
      }

      try {
        // Obtener el monto total sumando los subtotales de cada producto
        const montoTotal = this.calcularMontoTotal()

        // Crear el objeto de venta
        const ventaData = {
          idUsuario: 1, // Obtener idUsuario desde el store de auth
          idCliente: this.idCliente, // Usamos el idCliente desde el estado
          montoTotal: parseFloat(montoTotal.toString()), // Asegurarse de que sea un número
          productos: this.productos.map((producto) => ({
            idProducto: producto.id,
            cantidad: parseInt(producto.cantidad.toString(), 10), // Asegurarse de que sea un número
          })),
        }

        // Enviar la venta al backend
        const response = await http.post('/ventas', ventaData)
        console.log('Venta realizada con éxito:', response.data)

        // Limpiar el carrito después de realizar la venta
        this.vaciarCarrito()

        // Redirigir a una página de confirmación o historial
        router.push('/ventas')
      } catch (error) {
        console.error('Error al realizar la venta:', error)
      }
    },
  },
})
