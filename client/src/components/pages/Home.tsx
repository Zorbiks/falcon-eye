import MainMap from '../map'
import TimelineFeed from '../timeLine'
import StatsCard from '../stats'
import Filters from 'src/components/filters'
import CasualtiesCard from '../casulaties'
import EscalationCard from '../escalation'

export default function Home() {
  return (
    <section className="w-full h-fit flex flex-col items-center gap-5  py-5">
      <div className=" w-[95%]">
        <Filters />
      </div>

      <div className="flex justify-between gap-5 w-[95%]">
        <EscalationCard />
        <CasualtiesCard />
      </div>

      <MainMap />

      <div className="flex justify-between gap-5 w-[95%]">
        <TimelineFeed />
        <StatsCard />
      </div>
    </section>
  )
}
