import MainMap from '../map'
import TimelineFeed from '../timeLine'
import CategoriesStatsCard from '../CategoriesStatsCard'
import Sources from '../sources'
import Filters from 'src/components/filters'
import CasualtiesCard from '../casulaties'
import EscalationCard from '../OperationalSnapshot'

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

      <div className="w-[95%] flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_500px] lg:gap-5">
        <div className="order-1 lg:col-start-2 lg:row-start-1">
          <CategoriesStatsCard />
        </div>

        <div className="order-2 lg:col-start-1 lg:row-start-1 lg:row-span-2">
          <TimelineFeed />
        </div>

        <div className="order-3 lg:col-start-2 lg:row-start-2">
          <Sources />
        </div>
      </div>
    </section>
  )
}
