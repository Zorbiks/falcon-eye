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

      <div className="flex w-[95%] flex-col gap-5 lg:flex-row lg:items-stretch">
        <EscalationCard />
        <CasualtiesCard />
      </div>

      <MainMap />

      <div className="flex w-[95%] flex-col gap-5 lg:flex-row lg:items-stretch">
        <div className="w-full lg:flex-1">
          <TimelineFeed />
        </div>
        <div className="w-full lg:max-w-[500px]">
          <StatsCard />
        </div>
      </div>
    </section>
  )
}
