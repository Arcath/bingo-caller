export const PlayGrid = ({all, calls}: {all: number[]; calls: number[]}) => {
  const columnCount = 10

  return (
    <div
      className="grid gap-4"
      style={{gridTemplateColumns: '1fr '.repeat(columnCount)}}
    >
      {all.map((n, i) => {
        return (
          <div
            key={i}
            className={`text-center text-2xl rounded shadow py-4 ${calls.includes(n) ? 'bg-red-600' : ''}`}
          >
            {n}
          </div>
        )
      })}
    </div>
  )
}

export const VideoPlayer = ({
  video,
  onEnded
}: {
  video: string | boolean
  onEnded: () => void
}) => {
  return (
    <video
      className="max-w-full max-h-full m-auto"
      src={`/videos/${video}`}
      autoPlay={true}
      onEnded={onEnded}
    />
  )
}
