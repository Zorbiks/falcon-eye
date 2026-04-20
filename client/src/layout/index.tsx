import { Header } from 'src/components/header'

export default function Layout(page: React.ReactNode) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden font-sans">
      <Header />

      <main className="flex flex-col items-center gap-2 w-full flex-1">{page}</main>
    </div>
  )
}
