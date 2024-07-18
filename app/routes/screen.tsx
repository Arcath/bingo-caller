import {useState, useEffect} from 'react'

import {socket} from '~/lib/socket.client'

import {initialState, BINGO_CALLS} from './caller'
import {PlayGrid, VideoPlayer} from '~/lib/components/player'

const ScreenPage = () => {
  const [gameState, setGameState] = useState(initialState)

  useEffect(() => {
    socket.on('new-state', newState => {
      setGameState(newState)
    })
  })

  const {running, all, calls, video} = gameState

  const lastCall = calls.slice(-1)

  if (!running) {
    return <p className="text-white">Game not Running</p>
  }

  return (
    <div className="grid grid-cols-4 gap-4 text-white">
      <div className="col-span-3 text-white">
        {video ? (
          <VideoPlayer video={video} onEnded={() => {}} />
        ) : (
          <PlayGrid all={all} calls={calls} />
        )}
      </div>
      <div>
        <div className="text-[20rem] text-center">{lastCall}</div>
        <div className="mb-4 text-center text-3xl">
          {BINGO_CALLS[lastCall[0]] ?? ''}
        </div>
        <div className="grid grid-cols-5 text-3xl">
          {calls
            .slice(-5)
            .reverse()
            .map((n, i) => {
              return <div key={i}>{n}</div>
            })}
        </div>
      </div>
    </div>
  )
}

export default ScreenPage
