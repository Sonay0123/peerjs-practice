import { useState, useEffect } from 'react'

// ドット絵SONAYのピクセルデータ（16x16）
// H:黒髪, S:肌, E:目, G:グレーパーカー, B:黒バッグ・ズボン, W:白ハイライト
const SPRITE_1 = [
  '....HHHHHH......',
  '...HHHHHHHH.....',
  '..HHHHHHHHHH....',
  '..HHSSSSSSHH....',
  '..HSESSSSESHH...',
  '..HSSSSSSSSHH...',
  '...SSSSSSSS.....',
  '...GGGGGGGG.....',
  '..GGBGGGGGGG....',
  '.GGGBBGGGGGGG...',
  '.SSGGBBGGGGSS...',
  '...GGGBBGGG.....',
  '....BBBBBB......',
  '....BB..BB......',
  '...BBB..........',
  '.........BBB....',
]

const SPRITE_2 = [
  '....HHHHHH......',
  '...HHHHHHHH.....',
  '..HHHHHHHHHH....',
  '..HHSSSSSSHH....',
  '..HSESSSSESHH...',
  '..HSSSSSSSSHH...',
  '...SSSSSSSS.....',
  '...GGGGGGGG.....',
  '..GGBGGGGGGG....',
  '.GGGBBGGGGGGG...',
  '.SSGGBBGGGGSS...',
  '...GGGBBGGG.....',
  '....BBBBBB......',
  '....BB..BB......',
  '.........BBB....',
  '...BBB..........',
]

const COLOR_MAP: Record<string, string> = {
  H: '#1f2937', // 黒髪
  S: '#fde6d8', // 肌色
  E: '#111827', // 目
  G: '#9ca3af', // グレーパーカー
  B: '#374151', // 黒バッグ・ズボン
}

const TALKS = [
  '「きょうも いいてんきだね！いっしょに がんばろう！」',
  '「スマホからも ちゃんと うごいて みえてるかな？」',
  '「つかれたときは むりせず きゅうけいも だいじだよ！」',
  '「ぼくの グレーのパーカー、なかなか におうでしょ？」',
  '「がめんを タップすると そこまで はしっていくよ！」',
]

const OMIKUJI = [
  { rank: 'だいきち', item: 'つめたい コーヒー', msg: 'さいこうの いちにちに なるよ！' },
  { rank: 'ちゅうきち', item: 'お気に入りの ノート', msg: 'アイデアが どんどん わいてくるよ！' },
  { rank: 'しょうきち', item: 'あまい チョコレート', msg: 'ひとやすみすると うんき アップ！' },
  { rank: 'だいきち', item: 'イヤフォン', msg: 'すきな おんがくで しゅうちゅうりょく ばつぐん！' },
]

export default function App() {
  // キャラの位置（%座標）と向き・アニメーション
  const [pos, setPos] = useState({ x: 50, y: 55 })
  const [target, setTarget] = useState({ x: 50, y: 55 })
  const [facingLeft, setFacingLeft] = useState(false)
  const [frame, setFrame] = useState(0)

  // メッセージとタイマー状態
  const [message, setMessage] = useState('SONAYが あらわれた！ コマンドを えらんでね。')
  const [seconds, setSeconds] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)

  // 足踏み＆歩行アニメーション（タイマー中は高速移動！）
  useEffect(() => {
    const speed = isRunning ? 150 : 300
    const animTimer = setInterval(() => {
      setFrame((f) => (f === 0 ? 1 : 0))
    }, speed)
    return () => clearInterval(animTimer)
  }, [isRunning])

  // 目的地に向かってトコトコ移動する処理
  useEffect(() => {
    const moveTimer = setInterval(() => {
      setPos((current) => {
        const dx = target.x - current.x
        const dy = target.y - current.y
        const dist = Math.hypot(dx, dy)

        if (dist < 2) {
          // 目的地に着いたらランダムに次の散歩先を決める
          setTarget({
            x: Math.floor(Math.random() * 76) + 12,
            y: Math.floor(Math.random() * 60) + 20,
          })
          return current
        }

        if (dx < -0.5) setFacingLeft(true)
        if (dx > 0.5) setFacingLeft(false)

        const step = isRunning ? 3.2 : 1.5
        return {
          x: current.x + (dx / dist) * step,
          y: current.y + (dy / dist) * step,
        }
      })
    }, 60)
    return () => clearInterval(moveTimer)
  }, [target, isRunning])

  // ポモドーロタイマーのカウントダウン
  useEffect(() => {
    if (!isRunning) return
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          setMessage('「25ふん たったよ！ おつかれさま！ ゆっくり やすもう！」')
          return 25 * 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isRunning])

  // フィールドをクリック/タップしたらその場所へダッシュ
  const handleFieldClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = ((e.clientX - rect.left) / rect.width) * 100
    const clickY = ((e.clientY - rect.top) / rect.height) * 100
    setTarget({
      x: Math.min(88, Math.max(12, clickX)),
      y: Math.min(82, Math.max(18, clickY)),
    })
  }

  // コマンド操作
  const handleToggleTimer = () => {
    if (isRunning) {
      setIsRunning(false)
      setMessage('「タイマーを いちじていし したよ。」')
    } else {
      setIsRunning(true)
      setMessage('「しゅうちゅう モード かいし！ ぼくも いっしょに はしるよ！」')
    }
  }

  const handleResetTimer = () => {
    setIsRunning(false)
    setSeconds(25 * 60)
    setMessage('「タイマーを 25ふんに リセット したよ！」')
  }

  const handleOmikuji = () => {
    const pick = OMIKUJI[Math.floor(Math.random() * OMIKUJI.length)]
    setMessage(`【${pick.rank}】ラッキーアイテムは「${pick.item}」！ ${pick.msg}`)
  }

  const handleTalk = () => {
    const talk = TALKS[Math.floor(Math.random() * TALKS.length)]
    setMessage(talk)
  }

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')
  const currentSprite = frame === 0 ? SPRITE_1 : SPRITE_2

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-between p-3 select-none">
      {/* 上部ステータスウィンドウ（ドラクエ風） */}
      <div className="w-full max-w-md border-4 border-white rounded-lg p-3 bg-black shadow-lg">
        <div className="flex justify-between items-center border-b-2 border-white pb-1 mb-2">
          <span className="text-lg font-bold tracking-wider">SONAY  Lv.1</span>
          <span className="text-sm bg-white text-black px-2 py-0.5 font-bold rounded">
            {isRunning ? 'しゅうちゅう中！' : 'さんぽ中'}
          </span>
        </div>
        <div className="flex justify-between items-center text-xl">
          <span>のこりじかん</span>
          <span className="text-2xl font-bold tracking-widest text-yellow-300">
            {mins}:{secs}
          </span>
        </div>
      </div>

      {/* 中央フィールド画面（ドット絵SONAYが動き回る場所） */}
      <div
        onClick={handleFieldClick}
        className="relative w-full max-w-md h-64 my-2 border-4 border-white rounded-lg overflow-hidden cursor-pointer"
        style={{
          backgroundColor: '#2d6a4f',
          backgroundImage:
            'radial-gradient(#40916c 2px, transparent 2px), radial-gradient(#1b4332 2px, #2d6a4f 2px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      >
        <div className="absolute top-2 left-2 text-xs bg-black/70 px-2 py-1 rounded border border-white/50">
          タップした ばしょへ いどう！
        </div>

        {/* ドット絵SONAY本体 */}
        <div
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: `translate(-50%, -50%) scaleX(${facingLeft ? -1 : 1})`,
          }}
          className="absolute transition-all duration-75"
        >
          <div className="grid grid-cols-16 w-16 h-16 drop-shadow-md">
            {currentSprite.map((row, rIdx) =>
              row.split('').map((cell, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  style={{
                    backgroundColor: cell === '.' ? 'transparent' : COLOR_MAP[cell],
                  }}
                  className="w-1 h-1"
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* 下部コマンド＆メッセージウィンドウ */}
      <div className="w-full max-w-md flex flex-col gap-2">
        {/* コマンド選択 */}
        <div className="border-4 border-white rounded-lg p-3 bg-black grid grid-cols-2 gap-2 text-sm sm:text-base">
          <button
            onClick={handleToggleTimer}
            className="text-left hover:bg-white hover:text-black px-2 py-1.5 rounded transition cursor-pointer"
          >
            ▶ {isRunning ? 'タイマーとめる' : 'しゅうちゅう(25分)'}
          </button>
          <button
            onClick={handleOmikuji}
            className="text-left hover:bg-white hover:text-black px-2 py-1.5 rounded transition cursor-pointer"
          >
            ▶ おみくじをひく
          </button>
          <button
            onClick={handleTalk}
            className="text-left hover:bg-white hover:text-black px-2 py-1.5 rounded transition cursor-pointer"
          >
            ▶ はなす
          </button>
          <button
            onClick={handleResetTimer}
            className="text-left hover:bg-white hover:text-black px-2 py-1.5 rounded transition cursor-pointer"
          >
            ▶ じかんリセット
          </button>
        </div>

        {/* メッセージウィンドウ */}
        <div className="border-4 border-white rounded-lg p-3 bg-black min-h-[84px] text-sm sm:text-base leading-relaxed">
          {message}
        </div>
      </div>
    </div>
  )
}