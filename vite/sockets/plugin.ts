import {type Plugin} from 'vite'
import {Server} from 'socket.io'

export default (): Plugin => ({
  name: 'socket.io',
  configureServer: server => {
    const io = new Server(server.httpServer!)

    io.on('connect', socket => {
      socket.join('game')

      socket.on('set-state', gameState => {
        io.to('game').emit('new-state', gameState)
      })
    })
  }
})
