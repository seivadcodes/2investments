'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase';

type Question = { text: string; type: 'radio' | 'text'; options: string }

export default function AdminSurveys() {
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [reward, setReward] = useState(50)
  const [time, setTime] = useState(5)
  const [questions, setQuestions] = useState<Question[]>([
    { text: '', type: 'radio', options: 'Yes,No' }
  ])
  const [surveys, setSurveys] = useState<any[]>([])

  const load = async () => {
    const { data } = await supabase.from('surveys').select('*').order('created_at', { ascending: false })
    setSurveys(data || [])
  }
  useEffect(() => { load() }, [])

  const addQuestion = () => setQuestions([...questions, { text: '', type: 'radio', options: 'Yes,No' }])

  const saveSurvey = async () => {
    const formattedQs = questions.map(q => ({
      text: q.text,
      type: q.type,
      options: q.type === 'radio' ? q.options.split(',').map((s:string)=>s.trim()) : []
    }))

    const { error } = await supabase.from('surveys').insert({
      title,
      reward_kes: reward,
      time_minutes: time,
      questions: formattedQs,
      status: 'active'
    })
    if (!error) {
      setTitle(''); setQuestions([{ text: '', type: 'radio', options: 'Yes,No' }])
      load()
    } else alert(error.message)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Paid Surveys Kenya - Admin</h1>
      <div className="bg-white p-4 rounded-xl shadow space-y-4 mb-8">
        <input className="w-full border p-2 rounded" placeholder="Survey title" value={title} onChange={e=>setTitle(e.target.value)} />
        <div className="flex gap-4">
          <input className="border p-2 rounded w-1/2" type="number" value={reward} onChange={e=>setReward(Number(e.target.value))} />
          <input className="border p-2 rounded w-1/2" type="number" value={time} onChange={e=>setTime(Number(e.target.value))} />
        </div>
        {questions.map((q,i)=>(
          <div key={i} className="border p-3 rounded">
            <input className="w-full border p-2 rounded mb-2" placeholder={`Question ${i+1}`} value={q.text} onChange={e=>{
              const copy=[...questions]; copy[i].text=e.target.value; setQuestions(copy)
            }}/>
            <input className="w-full border p-2 rounded text-sm" placeholder="Options comma separated" value={q.options} onChange={e=>{
              const copy=[...questions]; copy[i].options=e.target.value; setQuestions(copy)
            }}/>
          </div>
        ))}
        <button onClick={addQuestion} className="text-sm text-green-600">+ Add question</button>
        <button onClick={saveSurvey} className="w-full bg-[#1CA347] text-white py-3 rounded-lg font-bold">Publish Survey</button>
      </div>
    </div>
  )
}