'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase';

export default function Home() {
  const supabase = createClient()
  const [surveys, setSurveys] = useState<any[]>([])
  const [doneIds, setDoneIds] = useState<number[]>([])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if(!user) return
      const { data: all } = await supabase.from('surveys').select('*').eq('status','active')
      const { data: mine } = await supabase.from('user_surveys').select('survey_id').eq('user_id', user.id)
      setSurveys(all || [])
      setDoneIds(mine?.map((m: any) => m.survey_id) || [])
    }
    init()
  }, [])

  const available = surveys.filter(s => !doneIds.includes(s.id))

  const startSurvey = async (survey: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('user_surveys').insert({
      user_id: user?.id,
      survey_id: survey.id,
      status: 'completed',
      reward_earned: survey.reward_kes,
      answers: {},
      completed_at: new Date().toISOString()
    })
    alert(`You earned KES ${survey.reward_kes}`)
    location.reload()
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Paid Surveys Kenya</h1>
      <p className="text-sm text-gray-500 mb-6">{available.length} surveys available</p>
      {available.map(s=>(
        <div key={s.id} className="bg-white p-4 rounded-xl shadow mb-3 flex justify-between items-center">
          <div><p className="font-semibold">{s.title}</p><p className="text-xs text-gray-500">{s.time_minutes} min • KES {s.reward_kes}</p></div>
          <button onClick={()=>startSurvey(s)} className="bg-black text-white px-4 py-2 rounded-lg text-sm">Start</button>
        </div>
      ))}
    </div>
  )
}