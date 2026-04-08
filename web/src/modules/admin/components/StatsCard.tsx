// web/src/modules/admin/components/StatsCard.tsx
interface Props {
  title: string
  value: number
  icon: string
  color: string
}

export default function StatsCard({ title, value, icon, color }: Props) {
  return (
    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`text-3xl ${color}`}>{icon}</div>
      </div>
    </div>
  )
}