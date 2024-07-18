import {useReducer, useEffect} from 'react'

import {socket} from '~/lib/socket.client'

import {PlayGrid, VideoPlayer} from '~/lib/components/player'

/**
 * Turns array elements into a type.
 *
 * `['name', 'email']` becomes `'name' | 'email'`
 */
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType[number]

const omit = <T extends {}, K extends (keyof T)[], P extends ArrayElement<K>>(
  object: T,
  fields: K
): Omit<T, P> => {
  //eslint-disable-next-line
  return (Object.keys(object) as Array<keyof T>).reduce<any>((obj, field) => {
    if (!fields.includes(field)) {
      obj[field] = object[field]
    }

    return obj
  }, {})
}

const numberArray = (start: number, end: number) => {
  const a: number[] = []

  for (let i = start; i <= end; i++) {
    a.push(i)
  }

  return a
}

export type CallerState = {
  min: number
  max: number
  calls: number[]
  available: number[]
  running: boolean
  all: number[]
  video: 'silence.mkv' | 'nice.webm' | 'quack.webm' | 'woohoo.mkv' | false
}

type CallerAction =
  | {method: 'start'}
  | ({method: 'set'} & Partial<CallerState>)
  | {method: 'call'; index: number}

const callerReducer = (state: CallerState, action: CallerAction) => {
  const newState = {...state}
  let called = 0

  switch (action.method) {
    case 'set':
      const output = {...newState, ...omit(action, ['method'])}
      socket.emit('set-state', output)
      return output
    case 'start':
      newState.running = true
      newState.calls = []
      newState.available = numberArray(newState.min, newState.max)
      newState.all = newState.available
      break
    case 'call':
      called = newState.available[action.index]
      if (!newState.calls.includes(called)) {
        newState.calls.push(called)
      }
      newState.available = newState.available.filter(n => n !== called)
      break
  }

  socket.emit('set-state', newState)

  return {...newState}
}

export const BINGO_CALLS: {[n: number]: string} = {
  1: `Kelly's eye`,
  2: `One little duck (quack)`,
  3: `Cup of tea`,
  4: `Knock at the door`,
  5: `Man alive`,
  6: `Half dozen`,
  7: `Lucky`,
  8: `Garden gate`,
  9: `Brighton line`,
  10: `Rishi's Den`,
  11: `Legs eleven`,
  12: `One dozen`,
  13: `Unlucky for some`,
  14: `Valentine's Day`,
  15: `Groovy Scene`,
  16: `Sweet 16`,
  17: `Dancing Queen`,
  18: `Coming of age`,
  19: `Goodbye, teens`,
  20: `Score`,
  21: `Key of the door`,
  22: `Two little ducks (quack quack)`,
  23: `Thee and me`,
  24: `Two dozen`,
  25: `Duck and dive`,
  26: `Pick and mix`,
  27: `Duck and a crutch`,
  28: `In a state`,
  29: `Rise and shine`,
  30: `Dirty Gertie`,
  31: `Get up and run`,
  32: `Buckle my shoe`,
  33: `Dirty knee`,
  34: `Ask for more`,
  35: `Jump and jive`,
  36: `Three dozen`,
  37: `More than 11`,
  38: `Christmas Cake`,
  39: `Steps`,
  40: `Life begins`,
  41: `Time for fun`,
  42: `Winnie the Pooh`,
  43: `Down on your knees`,
  44: `Droopy Drawers`,
  45: `Halfway there`,
  46: `Up to tricks`,
  47: `Four and seven`,
  48: `Four dozen`,
  49: `PC`,
  50: `It's a bullseye!`,
  51: `Tweak of the thumb`,
  52: `Weeks in a year`,
  53: `Stuck in the tree`,
  54: `Man at the door`,
  55: `All the fives`,
  56: `Shotts bus`,
  57: `Heinz varieties`,
  58: `Make them wait`,
  59: `Brighton line`,
  60: `Five dozen`,
  61: `Baker's bun`,
  62: `Tickety-boo`,
  63: `Tickle me`,
  64: `Red raw`,
  65: `Old age pension`,
  66: `Clickety click`,
  67: `Stairway to Heaven`,
  68: `Pick a mate`,
  69: ' Anyway up',
  70: `Three score and 10`,
  71: `Bang on the drum`,
  72: `Six dozen`,
  73: `Queen bee`,
  74: `Candy store`,
  75: `Strive and strive`,
  76: `Trombones`,
  77: `Two little crutches`,
  78: `39 more steps`,
  79: `One more time`,
  80: `Eight and blank`,
  81: `Stop and run`,
  82: `Straight on through`,
  83: `Time for tea`,
  84: `Give me more`,
  85: `Staying alive`,
  86: `Between the sticks`,
  87: `Torquay in Devon`,
  88: `Two fat ladies`,
  89: `Almost there`,
  90: `Top of the shop`
}

export const initialState: CallerState = {
  min: 1,
  max: 90,
  calls: [],
  available: [],
  running: false,
  all: [],
  video: false
}

const Caller = () => {
  const [state, dispatch] = useReducer<typeof callerReducer, CallerState>(
    callerReducer,
    {...initialState},
    initialState => initialState
  )

  const {running, min, max, all, calls, available, video} = state

  const Options = () => {
    return (
      <div>
        <label className="w-full mb-4 block">
          Minimum Number
          <input
            type="number"
            min="1"
            onChange={e => {
              dispatch({method: 'set', min: parseInt(e.target.value)})
            }}
            value={min}
            className="w-full bg-black border-white border-2 rounded p-1"
          />
        </label>
        <label className="w-full mb-4 block">
          Maximum Number
          <input
            type="number"
            min={min + 1}
            value={max}
            onChange={e => {
              dispatch({method: 'set', max: parseInt(e.target.value)})
            }}
            className="w-full bg-black border-white border-2 rounded p-1"
          />
        </label>
        <button
          onClick={() => {
            dispatch({method: 'start'})
          }}
          className="bg-green-600 p-4 rounded"
        >
          Start
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 p-4 gap-4 bg-black text-white">
      <div className="col-span-3">
        {video !== false ? (
          <VideoPlayer
            video={video}
            onEnded={() => {
              dispatch({method: 'set', video: false})
            }}
          />
        ) : running ? (
          <PlayGrid all={all} calls={calls} />
        ) : (
          <>Start a game to load the grid.</>
        )}
      </div>
      <div>
        {running ? (
          <PlayControls
            calls={state.calls}
            dispatch={dispatch}
            availableCount={available.length}
            maxCount={all.length}
          />
        ) : (
          <Options />
        )}
      </div>
    </div>
  )
}

const PlayControls = ({
  calls,
  dispatch,
  availableCount,
  maxCount
}: {
  calls: number[]
  dispatch: React.Dispatch<CallerAction>
  availableCount: number
  maxCount: number
}) => {
  const lastCall = calls.slice(-1)

  return (
    <div>
      <div className="text-[25vh] text-center">{lastCall}</div>
      <div className="mb-4 text-center text-2xl">
        {BINGO_CALLS[lastCall[0]] ?? ''}
      </div>
      <div className="grid grid-cols-5 text-2xl">
        {calls
          .slice(-5)
          .reverse()
          .map((n, i) => {
            return <div key={i}>{n}</div>
          })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <progress
          value={calls.length}
          max={maxCount}
          className="col-span-2 w-full"
        ></progress>
        <button
          onClick={() =>
            dispatch({
              method: 'call',
              index: Math.floor(Math.random() * availableCount)
            })
          }
          className="bg-green-600 rounded shadow p-4"
          disabled={availableCount === 0}
        >
          Call
        </button>
        <button
          onClick={() =>
            dispatch({
              method: 'set',
              running: false
            })
          }
          className="bg-yellow-600 rounded shadow p-4"
        >
          End
        </button>
        <button
          onClick={() => dispatch({method: 'set', video: 'silence.mkv'})}
          className="bg-red-600 rounded shadow p-4"
        >
          SILENCE
        </button>
        <button
          onClick={() => dispatch({method: 'set', video: 'nice.webm'})}
          className="bg-red-600 rounded shadow p-4"
        >
          Nice
        </button>
        <button
          onClick={() => dispatch({method: 'set', video: 'quack.webm'})}
          className="bg-red-600 rounded shadow p-4"
        >
          Quack
        </button>
        <button
          onClick={() => dispatch({method: 'set', video: 'woohoo.mkv'})}
          className="bg-red-600 rounded shadow p-4"
        >
          WooHoo
        </button>
      </div>
    </div>
  )
}

export default Caller
